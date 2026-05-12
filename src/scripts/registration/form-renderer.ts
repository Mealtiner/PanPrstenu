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

export class FormRenderer {
  private state: Record<string, string> = {};
  private agreements: Set<string> = new Set();
  private group: { id: string; name: string } = { id: '-1', name: '' };
  private container: HTMLElement;
  private schema: SchemaResponse;

  constructor(container: HTMLElement, schema: SchemaResponse) {
    this.container = container;
    this.schema = schema;
    // Default hodnoty ze schématu (pokud editor něco předvyplnil přes `value`)
    for (const field of schema.form.fields) {
      if (field.name && field.value !== undefined) {
        this.state[field.name] = String(field.value);
      }
    }
  }

  render(): void {
    this.container.innerHTML = `
      <div class="reg-info-block" data-reg-form-info></div>
      <div class="reg-fields"></div>
      <div class="reg-group"></div>
      <div class="reg-agreements"></div>
    `;
    const infoBlock = this.container.querySelector('[data-reg-form-info]') as HTMLElement;
    infoBlock.innerHTML = this.schema.form.info_html || '';
    if (!this.schema.form.info_html) {
      infoBlock.style.display = 'none';
    }
    this.renderFields();
    this.renderGroupSelector();
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
    const wrap = this.container.querySelector('.reg-fields') as HTMLElement;
    wrap.innerHTML = '';

    for (const field of this.schema.form.fields) {
      if (!this.matchesIf(field.if)) continue;
      const el = this.renderField(field);
      if (el) wrap.appendChild(el);
    }
  }

  private renderField(field: FormField): HTMLElement | null {
    const div = document.createElement('div');
    div.className = `reg-field reg-field--${field.type}`;
    if (field.name) div.dataset.name = field.name;
    if (field.start) div.classList.add('reg-field--section-start');

    if (field.type === 'info') {
      div.classList.add('reg-field__info');
      div.innerHTML = field.value || '';
      return div;
    }

    if (!field.name) return null;
    const name = field.name;
    const fieldId = `reg-field-${name}`;

    // Label
    const label = document.createElement('label');
    label.className = 'reg-field__label';
    if (field.required) label.classList.add('reg-field__label--required');
    label.setAttribute('for', fieldId);
    label.textContent = field.label || '';
    div.appendChild(label);

    // Input element podle typu
    if (field.type === 'options' || field.type === 'select') {
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

    // Note pod polem
    if (field.note) {
      const note = document.createElement('div');
      note.className = 'reg-field__note';
      note.innerHTML = field.note;
      div.appendChild(note);
    }

    return div;
  }

  private renderSelect(field: FormField, name: string, fieldId: string): HTMLSelectElement {
    const select = document.createElement('select');
    select.name = name;
    select.id = fieldId;
    select.className = 'reg-field__select';

    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = '— vyber —';
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
      let text = optLabel;
      if (limit !== null) {
        const remaining = Math.max(0, limit - filled);
        text += ` (${remaining}/${limit} volných)`;
      }
      if (full) text += ' — OBSAZENO';
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

  private renderGroupSelector(): void {
    const wrap = this.container.querySelector('.reg-group') as HTMLElement;

    // Pokud akce nemá skupiny povolené (config.groups=false), selector vůbec nerenderujeme
    if (!this.schema.groups_enabled) {
      wrap.style.display = 'none';
      return;
    }

    // Sestav options: -1 (žádná) + ">>> nová" + abecedně existující
    const existingOptions = this.schema.groups
      .map((g) => `<option value="${g.id}">${escapeText(g.name)}</option>`)
      .join('');

    wrap.innerHTML = `
      <div class="reg-field reg-field--section-start">
        <label class="reg-field__label" for="reg-group-id">Skupina / Družina</label>
        <select class="reg-field__select" id="reg-group-id">
          <option value="-1">Nemám skupinu</option>
          <option value="new">&gt;&gt;&gt; Založit novou skupinu &lt;&lt;&lt;</option>
          ${existingOptions}
        </select>
        <div class="reg-field__note">
          Skupina = oddíl spolubojovníků, se kterými hodláte v sobotní bitvě utvořit „družinu".
          Pokud tvoje skupina v seznamu chybí, vyber „Založit novou".
        </div>
      </div>
      <div class="reg-field" data-group-name-wrap style="display: none;">
        <label class="reg-field__label reg-field__label--required" for="reg-group-name">Název nové skupiny</label>
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
        <div class="reg-field__label">Vyžaduji souhlas</div>
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

      const labelHtml = agr.url
        ? `<a href="${agr.url}" target="_blank" rel="noopener">${escapeText(agr.label)}</a>`
        : escapeText(agr.label);

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
