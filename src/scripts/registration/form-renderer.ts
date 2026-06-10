/**
 * Dynamický renderer registračního formuláře.
 * Datum: 2026-05-12
 *
 * Vykreslí formulář z JSON schématu (z API /events/{slug}/schema).
 * Stará se o `if` (zobrazování podmíněných polí) a `optionsif` (filtraci options),
 * + zobrazuje obsazenost ze `capacity.by_field` proti `limits`.
 *
 * Vanilla TS, žádný framework. Re-renderuje fields při změně hodnot polí
 * s podmínkou (kvůli `if` / `optionsif`).
 */

import type { FormField, SchemaResponse, CapacityData } from './types';
import { getTranslation, type Lang } from '@i18n/ui';

// Form schema překlady — per-jazyk JSON v src/i18n/form-schema/{lang}.json
// Vite eager glob → bundlovány do dist, žádný runtime fetch.
interface FormSchemaTranslations {
  fields?: Record<string, { label?: string; note?: string; options?: Record<string, string>; placeholder?: string }>;
  /** Osobní pole (jméno, příjmení, …) + Stát options. */
  personal?: {
    fields?: Record<string, { label?: string; options?: Record<string, string> }>;
    info_html?: string;
  };
  agreements?: Record<string, string>;
  /** Top-level form info_html (úvodní text). */
  info_html?: string;
  /** Info-type fields mezi sekcemi formuláře, indexované podle pořadí v API. */
  info_blocks?: string[];
}
const formSchemaModules = import.meta.glob<{ default: FormSchemaTranslations }>(
  '/src/i18n/form-schema/*.json',
  { eager: true },
);
const FORM_SCHEMA: Record<Lang, FormSchemaTranslations | null> = {
  cs: formSchemaModules['/src/i18n/form-schema/cs.json']?.default ?? null,
  en: formSchemaModules['/src/i18n/form-schema/en.json']?.default ?? null,
  de: formSchemaModules['/src/i18n/form-schema/de.json']?.default ?? null,
  sk: formSchemaModules['/src/i18n/form-schema/sk.json']?.default ?? null,
  uk: formSchemaModules['/src/i18n/form-schema/uk.json']?.default ?? null,
};

/**
 * Lokalizovaný label osobního pole (firstname/lastname/...). Fallback chain:
 *   form-schema/<lang>.personal.fields[name].label → cs ekvivalent → apiLabel.
 * Pro `state` přebíjí i options.
 */
export function getLocalizedPersonalLabel(lang: Lang, name: string, apiLabel: string): string {
  const dict = FORM_SCHEMA[lang] ?? FORM_SCHEMA.cs;
  const local = dict?.personal?.fields?.[name]?.label;
  if (local) return local;
  const cs = FORM_SCHEMA.cs?.personal?.fields?.[name]?.label;
  if (cs) return cs;
  return apiLabel;
}

/**
 * Lokalizovaný label option v osobním poli (typicky `state` 1/2/3).
 * Fallback: form-schema/<lang> → cs → apiLabel.
 */
export function getLocalizedPersonalOption(lang: Lang, fieldName: string, optKey: string, apiLabel: string): string {
  const dict = FORM_SCHEMA[lang] ?? FORM_SCHEMA.cs;
  const local = dict?.personal?.fields?.[fieldName]?.options?.[optKey];
  if (local) return local;
  const cs = FORM_SCHEMA.cs?.personal?.fields?.[fieldName]?.options?.[optKey];
  if (cs) return cs;
  return apiLabel;
}

export class FormRenderer {
  private state: Record<string, string> = {};
  private agreements: Set<string> = new Set();
  private group: { id: string; name: string } = { id: '-1', name: '' };
  private container: HTMLElement;
  private schema: SchemaResponse;
  private lang: Lang;
  private t: ReturnType<typeof getTranslation>;
  private formI18n: FormSchemaTranslations | null;

  constructor(container: HTMLElement, schema: SchemaResponse, lang: Lang = 'cs') {
    this.container = container;
    this.schema = schema;
    this.lang = lang;
    this.t = getTranslation(lang);
    this.formI18n = FORM_SCHEMA[lang] ?? FORM_SCHEMA.cs;
    // Default hodnoty ze schématu (pokud editor něco předvyplnil přes `value`)
    for (const field of schema.form.fields) {
      if (field.name && field.value !== undefined) {
        this.state[field.name] = String(field.value);
      }
    }
  }

  // === i18n lookup helpery — fallback chain: form-schema/<lang> → form-schema/cs → API label ===

  private fieldLabel(field: FormField): string {
    if (!field.name) return field.label || '';
    const local = this.formI18n?.fields?.[field.name]?.label;
    if (local) return local;
    const cs = FORM_SCHEMA.cs?.fields?.[field.name]?.label;
    if (cs) return cs;
    return field.label || '';
  }

  private optionLabel(field: FormField, optKey: string, apiLabel: string): string {
    if (!field.name) return apiLabel;
    const local = this.formI18n?.fields?.[field.name]?.options?.[optKey];
    if (local) return local;
    const cs = FORM_SCHEMA.cs?.fields?.[field.name]?.options?.[optKey];
    if (cs) return cs;
    return apiLabel;
  }

  private agreementText(agrKey: string, apiText: string): string {
    const local = this.formI18n?.agreements?.[agrKey];
    if (local) return local;
    const cs = FORM_SCHEMA.cs?.agreements?.[agrKey];
    if (cs) return cs;
    return apiText;
  }

  private infoHtml(): string {
    return this.formI18n?.info_html ?? FORM_SCHEMA.cs?.info_html ?? this.schema.form.info_html ?? '';
  }

  /** Lokalizovaný note pole (HTML pod inputem). Fallback: <lang> → cs → API. */
  private fieldNote(field: FormField): string {
    if (!field.name) return field.note || '';
    const local = this.formI18n?.fields?.[field.name]?.note;
    if (local !== undefined) return local;
    const cs = FORM_SCHEMA.cs?.fields?.[field.name]?.note;
    if (cs !== undefined) return cs;
    return field.note || '';
  }

  /** Lokalizovaný info-block HTML podle pořadí mezi všemi info-type poli ve formuláři. */
  private infoBlockHtml(infoIndex: number, apiValue: string): string {
    const local = this.formI18n?.info_blocks?.[infoIndex];
    if (local !== undefined) return local;
    const cs = FORM_SCHEMA.cs?.info_blocks?.[infoIndex];
    if (cs !== undefined) return cs;
    return apiValue;
  }

  render(): void {
    this.container.innerHTML = `
      <div class="reg-fields-wrap"></div>
      <div class="reg-agreements"></div>
    `;
    // Renderer rozděluje pole do 2 fieldsetů: "Registrace na akci" (side/nar/civ
    // + skupina, vč. info_html) a "Doplňující informace pro potřebu panovníků
    // a organizátorů" (zbytek herních polí). Skupina se vsunuje INLINE za pole
    // "nar" / "civ". Při change strany se fieldy znovu vykreslí a struktura
    // se přepočítá.
    this.renderFields();
    this.renderAgreements();
  }

  getState(): Record<string, string> {
    return { ...this.state };
  }

  getAgreements(): string[] {
    return [...this.agreements];
  }

  getGroup(): { id: string; name: string } {
    return { ...this.group };
  }

  // Vrátí array klíčů povinných souhlasů, které ještě nejsou zaškrtnuté.
  getMissingRequiredAgreements(): string[] {
    return this.schema.agreements
      .filter((a) => a.required && !this.agreements.has(a.key))
      .map((a) => a.key);
  }

  // Vyhodnoť `if` podmínku: pole se zobrazí, pokud match (OR mezi položkami).
  private matchesIf(cond?: string[]): boolean {
    if (!cond || cond.length === 0) return true;
    return cond.some((c) => {
      const eq = c.indexOf('=');
      if (eq < 0) return false;
      const key = c.slice(0, eq);
      const val = c.slice(eq + 1);
      return this.state[key] === val;
    });
  }

  private getFilledCount(fieldName: string, optionKey: string): number {
    const counts = this.schema.capacity.by_field[fieldName];
    if (!counts) return 0;
    return counts[optionKey] ?? 0;
  }

  private getLimit(fieldName: string, optionKey: string): number | null {
    const limits = this.schema.limits[fieldName];
    if (!limits) return null;
    const limit = limits[optionKey];
    return typeof limit === 'number' ? limit : null;
  }

  private renderFields(): void {
    const container = this.container.querySelector('.reg-fields-wrap') as HTMLElement;
    container.innerHTML = '';

    // Primary pole = identita hráče: strana + národ/role/věk podle strany +
    // skupina (vsunuje se za posledního z anchorů níže).
    //   side: 1=Svobodné → nar (Gondor…)
    //   side: 2=Síly Temna → nar
    //   side: 3=Žoldáci → bez sub-výběru
    //   side: 4=Nehrající → supporter_category (Hobité / Pomocníci / …)
    //   side: 5=Dětská hra → kids_age (věk dítěte)
    // 'civ' je legacy alias pro supporter_category — pro kompat zachováno.
    const primaryNames = new Set(['side', 'nar', 'civ', 'supporter_category', 'kids_age']);
    const groupAnchorNames = ['nar', 'civ', 'supporter_category', 'kids_age'];

    // Najdi index posledního primary pole v schema — vše do té pozice (vč.
    // info-bloků) patří do primary fieldsetu, vše za ní do secondary.
    let lastPrimaryIdx = -1;
    for (let i = 0; i < this.schema.form.fields.length; i++) {
      const f = this.schema.form.fields[i];
      if (f.name && primaryNames.has(f.name)) lastPrimaryIdx = i;
    }

    // Fallback: pokud schema nemá žádné primary pole (atypická akce), nech
    // všechno v jednom "default" wrapperu bez nadpisu — info_html jde nahoru.
    if (lastPrimaryIdx === -1) {
      const onlyWrap = document.createElement('div');
      onlyWrap.className = 'reg-fields';
      const infoHtmlLocalized = this.infoHtml();
      if (infoHtmlLocalized) {
        const info = document.createElement('div');
        info.className = 'reg-info-block';
        info.innerHTML = infoHtmlLocalized;
        onlyWrap.appendChild(info);
      }
      let lastAnchorEl: HTMLElement | null = null;
      for (const field of this.schema.form.fields) {
        if (!this.matchesIf(field.if)) continue;
        const el = this.renderField(field);
        if (!el) continue;
        onlyWrap.appendChild(el);
        if (field.name && groupAnchorNames.includes(field.name)) lastAnchorEl = el;
      }
      const groupEl = this.buildGroupSelectorElement();
      if (groupEl) {
        if (lastAnchorEl && lastAnchorEl.parentNode) {
          lastAnchorEl.parentNode.insertBefore(groupEl, lastAnchorEl.nextSibling);
        } else {
          onlyWrap.appendChild(groupEl);
        }
      }
      container.appendChild(onlyWrap);
      return;
    }

    // Vytvoř primární fieldset "Registrace na akci".
    // info_html (úvodní text + guest extra mail upozornění) se renderuje
    // DOVNITŘ tohoto fieldsetu, nad poli — viz dohoda s klientem.
    const primary = document.createElement('fieldset');
    primary.className = 'reg-fieldset reg-fieldset--primary';
    primary.innerHTML = `
      <legend>${escapeText(this.t('reg.sidebar.heading_registration'))}</legend>
      <div class="reg-info-block" data-reg-form-info></div>
      <div class="reg-fields reg-fields--primary"></div>
    `;
    container.appendChild(primary);
    const infoBlock = primary.querySelector('[data-reg-form-info]') as HTMLElement;
    const localizedInfo = this.infoHtml();
    infoBlock.innerHTML = localizedInfo;
    if (!localizedInfo) {
      infoBlock.style.display = 'none';
    }
    const primaryFields = primary.querySelector('.reg-fields--primary') as HTMLElement;

    // Vytvoř secondary fieldset "Doplňující informace…" (přidáme do DOM jen
    // pokud do něj přibude alespoň jedno pole).
    const secondary = document.createElement('fieldset');
    secondary.className = 'reg-fieldset reg-fieldset--secondary';
    secondary.innerHTML = `
      <legend>${escapeText(this.t('form.legend_secondary'))}</legend>
      <div class="reg-fields reg-fields--secondary"></div>
    `;
    const secondaryFields = secondary.querySelector('.reg-fields--secondary') as HTMLElement;

    let lastAnchorEl: HTMLElement | null = null;
    let hasSecondary = false;

    for (let i = 0; i < this.schema.form.fields.length; i++) {
      const field = this.schema.form.fields[i];
      if (!this.matchesIf(field.if)) continue;
      const el = this.renderField(field);
      if (!el) continue;

      const targetWrap = i <= lastPrimaryIdx ? primaryFields : secondaryFields;
      targetWrap.appendChild(el);

      if (field.name && groupAnchorNames.includes(field.name)) {
        lastAnchorEl = el;
      }
      if (i > lastPrimaryIdx) hasSecondary = true;
    }

    // Group selector — vždy v primary fieldsetu, za posledním anchorem
    // ("nar" pro hrajícího nebo "civ" pro nehrajícího). Pokud žádný anchor
    // není viditelný (uživatel ještě nevybral stranu), padne na konec primary.
    const groupEl = this.buildGroupSelectorElement();
    if (groupEl) {
      if (lastAnchorEl && lastAnchorEl.parentNode) {
        lastAnchorEl.parentNode.insertBefore(groupEl, lastAnchorEl.nextSibling);
      } else {
        primaryFields.appendChild(groupEl);
      }
    }

    if (hasSecondary) container.appendChild(secondary);
  }

  private renderField(field: FormField): HTMLElement | null {
    const div = document.createElement('div');
    div.className = `reg-field reg-field--${field.type}`;
    if (field.name) div.dataset.name = field.name;
    if (field.start) div.classList.add('reg-field--section-start');

    if (field.type === 'info') {
      div.classList.add('reg-field__info');
      // Index info-type fieldu mezi všemi info-type poli ve formuláři —
      // používá se pro lookup do form-schema/<lang>.info_blocks[].
      // Lookup probíhá v matchingu na pozici v `schema.form.fields[]`.
      const infoIdx = this.schema.form.fields
        .slice(0, this.schema.form.fields.indexOf(field))
        .filter((f) => f.type === 'info').length;
      div.innerHTML = this.infoBlockHtml(infoIdx, field.value || '');
      return div;
    }

    if (!field.name) return null;
    const name = field.name;
    const fieldId = `reg-field-${name}`;

    // Label (lokalizovaný — form-schema/<lang>.json, fallback API label)
    const label = document.createElement('label');
    label.className = 'reg-field__label';
    if (field.required) label.classList.add('reg-field__label--required');
    label.setAttribute('for', fieldId);
    label.textContent = this.fieldLabel(field);
    div.appendChild(label);

    // Input element podle typu
    // Speciální UI pro pole `stravovani` — toggle "primárně sám" / "U Zeleného Draka"
    // místo standardního selectu (PP2026-specific).
    if (name === 'stravovani' && (field.type === 'select' || field.type === 'options')) {
      div.appendChild(this.renderStravovaniToggle(name));
    } else if (field.type === 'options' || field.type === 'select') {
      div.appendChild(this.renderSelect(field, name, fieldId));
    } else if (field.type === 'text') {
      div.appendChild(this.renderTextInput(name, fieldId));
    } else if (field.type === 'longtext') {
      div.appendChild(this.renderTextarea(name, fieldId));
    } else if (field.type === 'number') {
      div.appendChild(this.renderNumberInput(field, name, fieldId));
    } else if (field.type === 'date') {
      div.appendChild(this.renderDateInput(name, fieldId));
    }

    // Note pod polem — lokalizovaný (form-schema/<lang>.fields[name].note)
    const noteHtml = this.fieldNote(field);
    if (noteHtml) {
      const note = document.createElement('div');
      note.className = 'reg-field__note';
      note.innerHTML = noteHtml;
      div.appendChild(note);
    }

    return div;
  }

  // Sliding pill toggle pro pole 'stravovani' — replikace
  // PP2026_stravovani.php (originální registračka). Bílý kulatý "slider"
  // s drakem se posouvá mezi červenou (Ne) a zelenou (Ano = U Zeleného Draka).
  //   value "0" = primárně sám (red, default)
  //   value "1" = U Zeleného Draka (green)
  //
  // UX: dlouhý popisek („Plánuji se stravovat …") je NAD pillem (vizuálně
  // čitelný i na mobile). Uvnitř pillu jsou jen krátké labely Ne/Ano.
  private renderStravovaniToggle(name: string): HTMLElement {
    const wrap = document.createElement('div');
    wrap.className = 'reg-stravovani-switch__wrap';
    const noLabel = this.t('form.stravovani.no');
    const yesLabel = this.t('form.stravovani.yes');
    wrap.innerHTML = `
      <div class="reg-stravovani-switch__caption" data-caption></div>
      <div class="reg-stravovani-switch" role="switch" aria-checked="false" tabindex="0">
        <div class="reg-stravovani-switch__opt reg-stravovani-switch__opt--no">${escapeText(noLabel)}</div>
        <div class="reg-stravovani-switch__slider">
          <img src="/images/registrace/drak.svg" alt="" aria-hidden="true" />
        </div>
        <div class="reg-stravovani-switch__opt reg-stravovani-switch__opt--yes">${escapeText(yesLabel)}</div>
      </div>
    `;
    const switchEl = wrap.querySelector('.reg-stravovani-switch') as HTMLElement;
    const labelEl = wrap.querySelector('[data-caption]') as HTMLElement;

    // Inicializace ze state (pokud už existuje z předchozího renderu),
    // jinak default "0" (= sám, red) — kompatibilní s legacy default.
    if (this.state[name] !== '0' && this.state[name] !== '1') {
      this.state[name] = '0';
    }
    // Přepočítej posun slideru podle aktuální šířky pillu (responsiv) —
    // pill je min(380px, 100%), takže na mobile bude menší a 326px fixní
    // posun by ho vystrčil mimo container. ResizeObserver synchronizuje
    // při resize okna; na desktopu 380px → 326px posun (= original).
    const recalcShift = (): void => {
      const w = switchEl.offsetWidth;
      if (w > 0) {
        const shift = Math.max(0, w - 54);
        switchEl.style.setProperty('--reg-slider-shift', shift + 'px');
      }
    };
    if (typeof ResizeObserver !== 'undefined') {
      new ResizeObserver(recalcShift).observe(switchEl);
    } else {
      window.addEventListener('resize', recalcShift);
      requestAnimationFrame(recalcShift);
    }
    const apply = (): void => {
      const active = this.state[name] === '1';
      switchEl.classList.toggle('is-active', active);
      switchEl.setAttribute('aria-checked', String(active));
      labelEl.textContent = active
        ? this.t('form.stravovani.dragon')
        : this.t('form.stravovani.self');
    };
    const toggle = (): void => {
      this.state[name] = this.state[name] === '1' ? '0' : '1';
      apply();
    };
    switchEl.addEventListener('click', toggle);
    switchEl.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        toggle();
      }
    });
    apply();
    return wrap;
  }

  private renderSelect(field: FormField, name: string, fieldId: string): HTMLSelectElement {
    const select = document.createElement('select');
    select.name = name;
    select.id = fieldId;
    select.className = 'reg-field__select';

    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = this.t('form.placeholder.select');
    select.appendChild(placeholder);

    const options = field.options || {};
    for (const [key, optLabel] of Object.entries(options)) {
      // optionsif filtr — pokud má pole optionsif pro tento klíč, musí match
      if (field.optionsif?.[key] && !this.matchesIf(field.optionsif[key])) {
        continue;
      }

      const filled = this.getFilledCount(name, key);
      const limit = this.getLimit(name, key);
      const full = limit !== null && filled >= limit;

      const opt = document.createElement('option');
      opt.value = key;
      let text = this.optionLabel(field, key, optLabel);
      if (limit !== null) {
        const remaining = Math.max(0, limit - filled);
        text += ' (' + this.t('form.remaining', { remaining, limit }) + ')';
      }
      if (full) text += ' ' + this.t('form.occupied');
      opt.textContent = text;
      if (full) opt.disabled = true;
      if (this.state[name] === key) opt.selected = true;
      select.appendChild(opt);
    }

    select.addEventListener('change', () => {
      this.state[name] = select.value;
      // Při změně se přepočítají podmíněná pole (if/optionsif).
      this.renderFields();
    });

    return select;
  }

  private renderTextInput(name: string, fieldId: string): HTMLInputElement {
    const input = document.createElement('input');
    input.type = 'text';
    input.name = name;
    input.id = fieldId;
    input.className = 'reg-field__input';
    input.value = this.state[name] ?? '';
    input.addEventListener('input', () => {
      this.state[name] = input.value;
    });
    return input;
  }

  private renderTextarea(name: string, fieldId: string): HTMLTextAreaElement {
    const ta = document.createElement('textarea');
    ta.name = name;
    ta.id = fieldId;
    ta.rows = 4;
    ta.className = 'reg-field__textarea';
    ta.value = this.state[name] ?? '';
    ta.addEventListener('input', () => {
      this.state[name] = ta.value;
    });
    return ta;
  }

  private renderNumberInput(field: FormField, name: string, fieldId: string): HTMLInputElement {
    const input = document.createElement('input');
    input.type = 'number';
    input.name = name;
    input.id = fieldId;
    input.className = 'reg-field__input';
    if (field.min !== undefined) input.min = String(field.min);
    if (field.max !== undefined) input.max = String(field.max);
    input.value = this.state[name] ?? '';
    input.addEventListener('input', () => {
      this.state[name] = input.value;
    });
    return input;
  }

  private renderDateInput(name: string, fieldId: string): HTMLInputElement {
    const input = document.createElement('input');
    input.type = 'date';
    input.name = name;
    input.id = fieldId;
    input.className = 'reg-field__input';
    input.value = this.state[name] ?? '';
    input.addEventListener('input', () => {
      this.state[name] = input.value;
    });
    return input;
  }

  // === Skupina (družina) — jednoduchý dropdown =================================
  // Vrátí kontejner se selectorem skupiny (inline), nebo null pokud akce
  // skupiny vůbec nepoužívá (config.groups=false). Volá se z renderFields(),
  // který výsledek vloží na správné místo v DOM (za pole "nar"/"civ").

  private buildGroupSelectorElement(): HTMLElement | null {
    if (!this.schema.groups_enabled) return null;

    // Sestav options: -1 (žádná) + ">>> nová" + existující abecedně
    const existingOptions = this.schema.groups
      .map((g) => `<option value="${g.id}">${escapeText(g.name)}</option>`)
      .join('');

    const wrap = document.createElement('div');
    wrap.className = 'reg-group';
    wrap.innerHTML = `
      <div class="reg-field reg-field--section-start">
        <label class="reg-field__label" for="reg-group-id">${escapeText(this.t('form.label_group'))}</label>
        <select class="reg-field__select" id="reg-group-id">
          <option value="-1">${escapeText(this.t('form.opt_no_group'))}</option>
          <option value="new">&gt;&gt;&gt; ${escapeText(this.t('form.opt_new_group'))} &lt;&lt;&lt;</option>
          ${existingOptions}
        </select>
        <div class="reg-field__note">${escapeText(this.t('form.note_group_visibility'))}</div>
      </div>
      <div class="reg-field" data-group-name-wrap style="display: none;">
        <label class="reg-field__label reg-field__label--required" for="reg-group-name">${escapeText(this.t('form.placeholder_group_name'))}</label>
        <input class="reg-field__input" type="text" id="reg-group-name" />
      </div>
    `;
    const idSelect = wrap.querySelector('#reg-group-id') as HTMLSelectElement;
    const nameWrap = wrap.querySelector('[data-group-name-wrap]') as HTMLElement;
    const nameInput = wrap.querySelector('#reg-group-name') as HTMLInputElement;

    idSelect.value = this.group.id;
    nameInput.value = this.group.name;
    nameWrap.style.display = this.group.id === 'new' ? '' : 'none';

    idSelect.addEventListener('change', () => {
      this.group.id = idSelect.value;
      nameWrap.style.display = this.group.id === 'new' ? '' : 'none';
    });
    nameInput.addEventListener('input', () => {
      this.group.name = nameInput.value;
    });
    return wrap;
  }

  // === Souhlasy — checkboxy ===================================================

  private renderAgreements(): void {
    const wrap = this.container.querySelector('.reg-agreements') as HTMLElement;
    if (this.schema.agreements.length === 0) {
      wrap.style.display = 'none';
      return;
    }
    wrap.innerHTML = `
      <div class="reg-field reg-field--section-start">
        <div class="reg-field__label">${escapeText(this.t('form.legend_consents'))}</div>
        <div class="reg-agreements__list"></div>
      </div>
    `;
    const list = wrap.querySelector('.reg-agreements__list') as HTMLElement;
    for (const agr of this.schema.agreements) {
      const id = `reg-agr-${agr.key}`;
      const row = document.createElement('label');
      row.className = 'reg-agreement-row';
      row.htmlFor = id;

      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.id = id;
      cb.value = agr.key;
      cb.checked = this.agreements.has(agr.key);
      cb.addEventListener('change', () => {
        if (cb.checked) this.agreements.add(agr.key);
        else this.agreements.delete(agr.key);
      });

      // Lokalizovaný text — form-schema/<lang>.json (s fallback chainem)
      const agrText = this.agreementText(agr.key, agr.label);
      const labelHtml = agr.url
        ? `<a href="${agr.url}" target="_blank" rel="noopener">${escapeText(agrText)}</a>`
        : escapeText(agrText);

      const text = document.createElement('span');
      text.className = 'reg-agreement-row__text';
      text.innerHTML = labelHtml + (agr.required ? ' <span class="reg-agreement-row__req">*</span>' : '');

      row.appendChild(cb);
      row.appendChild(text);
      list.appendChild(row);
    }
  }
}

function escapeText(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
