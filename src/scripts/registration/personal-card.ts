/**
 * Osobní karta — native formulář napojený na API /me/personel.
 * Datum: 2026-05-12
 *
 * Architektura B: žádný iframe. Stránka má vlastní formulář, který:
 *  1. GET /api/v1/me/personel → fill input fields
 *  2. User edituje
 *  3. Submit → PUT /api/v1/me/personel s diffem proti načteným hodnotám
 *     (posíláme jen pole, která se opravdu změnila)
 *  4. Status zpráva (success / validation errors)
 *
 * Auth: Bearer token z localStorage. Pokud user není přihlášen,
 * zobrazí se CTA na login.
 */

import { getSessionToken, getMe, getMePersonel, updateMePersonel } from './api-client';
import type { PersonelData, PersonelUpdate } from './api-client';
import { getDomTranslator } from '../i18n-helper';

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Editovatelná pole — pořadí pro render. Každé pole má typ + sekci.
interface FieldDef {
  key: keyof PersonelUpdate;
  section: 'basic' | 'address' | 'contact' | 'larp';
  type: 'text' | 'date' | 'select-gender' | 'textarea';
  maxlen?: number;
  hint?: string;
  span?: 'full' | 'half'; // grid layout
}

const FIELDS: FieldDef[] = [
  // Sekce: Osobní údaje
  { key: 'firstname', section: 'basic', type: 'text', maxlen: 50, span: 'half' },
  { key: 'lastname', section: 'basic', type: 'text', maxlen: 50, span: 'half' },
  { key: 'nick', section: 'basic', type: 'text', maxlen: 50, hint: 'personel.hint.nick_min', span: 'half' },
  { key: 'birth', section: 'basic', type: 'date', hint: 'personel.hint.birth_format', span: 'half' },
  { key: 'gender', section: 'basic', type: 'select-gender', span: 'half' },
  // Sekce: Adresa
  { key: 'adress', section: 'address', type: 'text', maxlen: 100, span: 'full' },
  { key: 'city', section: 'address', type: 'text', maxlen: 50, span: 'half' },
  { key: 'zipcode', section: 'address', type: 'text', maxlen: 10, span: 'half' },
  { key: 'state', section: 'address', type: 'text', maxlen: 50, span: 'half' },
  // Sekce: Kontakty
  { key: 'phone', section: 'contact', type: 'text', maxlen: 30, span: 'half' },
  { key: 'facebook', section: 'contact', type: 'text', maxlen: 200, span: 'full' },
  { key: 'web', section: 'contact', type: 'text', maxlen: 200, span: 'full' },
  // Sekce: LARP a komunita
  { key: 'organizace', section: 'larp', type: 'text', maxlen: 60, span: 'half' },
  { key: 'oddil', section: 'larp', type: 'text', maxlen: 60, span: 'half' },
  { key: 'larpaccount', section: 'larp', type: 'text', maxlen: 60, span: 'half' },
  { key: 'grup', section: 'larp', type: 'text', maxlen: 60, span: 'half' },
  { key: 'exp', section: 'larp', type: 'textarea', maxlen: 200, span: 'full' },
];

const SECTIONS: Array<{ key: 'basic' | 'address' | 'contact' | 'larp'; labelKey: string }> = [
  { key: 'basic', labelKey: 'personel.section.basic' },
  { key: 'address', labelKey: 'personel.section.address' },
  { key: 'contact', labelKey: 'personel.section.contact' },
  { key: 'larp', labelKey: 'personel.section.larp' },
];

// Aktuální načtená data (pro diff při save)
let loadedData: PersonelData | null = null;
let csrfToken = '';

export async function initPersonalCard(rootSelector: string): Promise<void> {
  const root = document.querySelector<HTMLElement>(rootSelector);
  if (!root) return;

  const t = getDomTranslator();
  const token = getSessionToken();

  if (!token) {
    // Není přihlášen — ukaž CTA s odkazem na login
    const lang = (root.dataset.lang || 'cs') as string;
    root.innerHTML = `
      <div class="reg-personal-card__empty">
        <p>${escapeHtml(t('personel.status.unauth'))}</p>
        <a class="reg-btn reg-btn--primary" href="/${lang}/registrace/#reg-login">
          ${escapeHtml(t('reg.sidebar.login_account'))}
        </a>
      </div>
    `;
    return;
  }

  // Načti data z API souběžně (me kvůli csrf_token, personel kvůli polím)
  root.innerHTML = `<div class="reg-loading">${escapeHtml(t('loading.generic'))}</div>`;
  const [me, personel] = await Promise.all([getMe(), getMePersonel()]);

  if (!me || !personel) {
    root.innerHTML = `<div class="reg-error">${escapeHtml(t('error.fetch_failed'))} ${escapeHtml(t('error.refresh'))}</div>`;
    return;
  }

  loadedData = personel;
  csrfToken = me.csrf_token || '';

  renderForm(root, t);
}

function renderForm(root: HTMLElement, t: ReturnType<typeof getDomTranslator>): void {
  if (!loadedData) return;
  const d = loadedData;

  // Sestav sekce
  const sectionsHtml = SECTIONS.map((sec) => {
    const fields = FIELDS.filter((f) => f.section === sec.key);
    const fieldsHtml = fields.map((f) => renderFieldHtml(f, d, t)).join('');
    return `
      <fieldset class="reg-personal__section">
        <legend>${escapeHtml(t(sec.labelKey as 'personel.section.basic'))}</legend>
        <div class="reg-personal__grid">${fieldsHtml}</div>
      </fieldset>
    `;
  }).join('');

  // E-mail (username) — read-only display
  const emailFieldHtml = `
    <fieldset class="reg-personal__section reg-personal__section--readonly">
      <legend>${escapeHtml(t('personel.field.username'))}</legend>
      <div class="reg-personal__grid">
        <div class="reg-personal__field reg-personal__field--full">
          <input type="email" value="${escapeHtml(d.username)}" readonly disabled class="reg-field__input reg-field__input--readonly" />
          <div class="reg-field__note">${escapeHtml(t('personel.hint.email_readonly'))}</div>
        </div>
      </div>
    </fieldset>
  `;

  root.innerHTML = `
    <div class="reg-personal">
      <p class="reg-personal__intro">${escapeHtml(t('personel.intro'))}</p>
      <form class="reg-personal__form" data-personal-form>
        ${emailFieldHtml}
        ${sectionsHtml}

        <div class="reg-personal__actions">
          <button type="submit" class="reg-btn reg-btn--primary" data-personal-submit>
            ${escapeHtml(t('personel.action.save'))}
          </button>
          <button type="button" class="reg-btn reg-btn--ghost" data-personal-reset>
            ${escapeHtml(t('personel.action.reset'))}
          </button>
        </div>

        <div class="reg-personal__status" data-personal-status></div>
      </form>
    </div>
  `;

  attachHandlers(root, t);
}

function renderFieldHtml(f: FieldDef, d: PersonelData, t: ReturnType<typeof getDomTranslator>): string {
  const labelKey = `personel.field.${String(f.key)}` as 'personel.field.firstname';
  const label = t(labelKey);
  const value = String(d[f.key] ?? '');
  const inputId = `personel-${String(f.key)}`;
  const spanClass = f.span === 'full' ? 'reg-personal__field--full' : 'reg-personal__field--half';
  const hintHtml = f.hint
    ? `<div class="reg-field__note">${escapeHtml(t(f.hint as 'personel.hint.nick_min'))}</div>`
    : '';

  let inputHtml = '';
  if (f.type === 'date') {
    inputHtml = `<input type="date" id="${inputId}" name="${String(f.key)}" value="${escapeHtml(value)}" class="reg-field__input" />`;
  } else if (f.type === 'textarea') {
    const max = f.maxlen ? ` maxlength="${f.maxlen}"` : '';
    inputHtml = `<textarea id="${inputId}" name="${String(f.key)}" rows="3" class="reg-field__textarea"${max}>${escapeHtml(value)}</textarea>`;
  } else if (f.type === 'select-gender') {
    const opt = (v: string, labelKey: string): string => {
      const selected = value === v ? ' selected' : '';
      return `<option value="${v}"${selected}>${escapeHtml(t(labelKey as 'personel.gender.m'))}</option>`;
    };
    inputHtml = `<select id="${inputId}" name="${String(f.key)}" class="reg-field__select">
      <option value=""${value === '' ? ' selected' : ''}>${escapeHtml(t('personel.gender.placeholder'))}</option>
      ${opt('1', 'personel.gender.m')}
      ${opt('2', 'personel.gender.f')}
      ${opt('3', 'personel.gender.other')}
    </select>`;
  } else {
    const max = f.maxlen ? ` maxlength="${f.maxlen}"` : '';
    inputHtml = `<input type="text" id="${inputId}" name="${String(f.key)}" value="${escapeHtml(value)}" class="reg-field__input"${max} />`;
  }

  return `
    <div class="reg-personal__field ${spanClass}">
      <label class="reg-field__label" for="${inputId}">${escapeHtml(label)}</label>
      ${inputHtml}
      ${hintHtml}
    </div>
  `;
}

function attachHandlers(root: HTMLElement, t: ReturnType<typeof getDomTranslator>): void {
  const form = root.querySelector<HTMLFormElement>('[data-personal-form]');
  const submitBtn = root.querySelector<HTMLButtonElement>('[data-personal-submit]');
  const resetBtn = root.querySelector<HTMLButtonElement>('[data-personal-reset]');
  const statusEl = root.querySelector<HTMLElement>('[data-personal-status]');
  if (!form || !submitBtn || !resetBtn || !statusEl) return;

  resetBtn.addEventListener('click', () => {
    renderForm(root, t);
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!loadedData) return;

    statusEl.className = 'reg-personal__status';
    statusEl.textContent = '';

    // Sestav diff: pouze pole, která se změnila
    const diff: PersonelUpdate = {};
    for (const f of FIELDS) {
      const input = form.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(`[name="${String(f.key)}"]`);
      if (!input) continue;
      const current = input.value.trim();
      const original = String(loadedData[f.key] ?? '').trim();
      if (current !== original) {
        diff[f.key] = current;
      }
    }

    if (Object.keys(diff).length === 0) {
      statusEl.className = 'reg-personal__status reg-personal__status--info';
      statusEl.textContent = t('personel.status.no_changes');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = t('personel.action.saving');
    const res = await updateMePersonel(diff, csrfToken);
    submitBtn.disabled = false;
    submitBtn.textContent = t('personel.action.save');

    if (res.ok) {
      // Aktualizuj loadedData
      for (const [k, v] of Object.entries(diff)) {
        (loadedData as any)[k] = v ?? '';
      }
      statusEl.className = 'reg-personal__status reg-personal__status--success';
      statusEl.textContent = t('personel.status.saved');
    } else {
      statusEl.className = 'reg-personal__status reg-personal__status--error';
      const details = res.error.details ? Object.entries(res.error.details).map(([k, v]) => `${k}: ${v}`).join(', ') : '';
      statusEl.textContent = `${t('personel.status.error')} ${res.error.message}${details ? ' (' + details + ')' : ''}`;
    }
  });
}
