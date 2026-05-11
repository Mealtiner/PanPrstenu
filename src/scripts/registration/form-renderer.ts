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
    `;
    const infoBlock = this.container.querySelector('[data-reg-form-info]') as HTMLElement;
    infoBlock.innerHTML = this.schema.form.info_html || '';
    if (!this.schema.form.info_html) {
      infoBlock.style.display = 'none';
    }
    this.renderFields();
  }

  getState(): Record<string, string> {
    return { ...this.state };
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
}
