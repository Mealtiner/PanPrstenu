/**
 * Entry point pro registrační formulář.
 * Datum: 2026-05-12
 *
 * Použití v Astro stránce:
 *   <script>
 *     import { initRegistration } from '@scripts/registration';
 *     initRegistration('#registration-app', 'PP2026');
 *   </script>
 *
 * Toto je MVP varianta z Fáze 3:
 *   - Načte /me a /schema
 *   - Pokud je uživatel přihlášen → vykreslí formulář (read-only stav, bez submit)
 *   - Pokud není přihlášen → zobrazí prompt s odkazem na login
 *   - Pokud akce není otevřená → zobrazí "Registrace ještě nezačala"
 *
 * Submit logiku (POST /register) přidá Fáze 4.
 */

import { getMe, getEventSchema } from './api-client';
import type { CurrentUser, SchemaResponse } from './types';
import { FormRenderer } from './form-renderer';

const REGISTRACKA_BASE = 'https://www.registracka.cz';

export async function initRegistration(rootSelector: string, slug: string): Promise<void> {
  const root = document.querySelector<HTMLElement>(rootSelector);
  if (!root) {
    console.warn(`[reg] root element ${rootSelector} not found`);
    return;
  }

  root.classList.add('reg-app');
  root.innerHTML = '<div class="reg-loading">Načítám registrační formulář…</div>';

  const [me, schema] = await Promise.all([getMe(), getEventSchema(slug)]);

  if (!schema) {
    root.innerHTML = `
      <div class="reg-error">
        Nepodařilo se načíst registrační data ze serveru registracka.cz.
        Zkus to za chvíli, nebo nás kontaktuj na info@panprstenu.cz.
      </div>
    `;
    return;
  }

  if (!schema.event.registration_open) {
    root.innerHTML = `
      <div class="reg-closed">
        Registrace na akci <strong>${escapeHtml(schema.event.name)}</strong>
        ještě nebyla spuštěna.
      </div>
    `;
    return;
  }

  if (me) {
    renderLoggedInForm(root, me, schema, slug);
  } else {
    renderGuestPrompt(root, schema, slug);
  }
}

function renderLoggedInForm(
  root: HTMLElement,
  me: CurrentUser,
  schema: SchemaResponse,
  slug: string,
): void {
  root.innerHTML = `
    <div class="reg-user-banner">
      <div class="reg-user-banner__main">
        Registruješ se jako
        <strong>${escapeHtml(me.first_name)} ${escapeHtml(me.last_name)}</strong>
        <span style="color: var(--color-text-on-dark-muted)">(${escapeHtml(me.username)})</span>
      </div>
      <a
        class="reg-user-banner__edit-link"
        href="${REGISTRACKA_BASE}/personel_${encodeURIComponent(slug)}.php"
        target="_blank"
        rel="noopener"
      >Upravit osobní údaje ↗</a>
    </div>
    <div class="reg-form-host"></div>
    <div class="reg-submit-area">
      <div class="reg-submit-status">Submit zatím není aktivní (přijde ve Fázi 4).</div>
      <button class="reg-btn reg-btn--primary" disabled type="button">
        Odeslat registraci
      </button>
    </div>
  `;

  const host = root.querySelector('.reg-form-host') as HTMLElement;
  const renderer = new FormRenderer(host, schema);
  renderer.render();

  // Debug — expose pro DevTools, aby šlo otestovat:
  // window.__regRenderer.getState()
  (window as unknown as { __regRenderer: FormRenderer }).__regRenderer = renderer;
}

function renderGuestPrompt(
  root: HTMLElement,
  schema: SchemaResponse,
  slug: string,
): void {
  const loginUrl = `${REGISTRACKA_BASE}/${encodeURIComponent(slug)}_web.php`;
  const registerUrl = `${REGISTRACKA_BASE}/add_user_${encodeURIComponent(slug)}.php`;

  root.innerHTML = `
    <div class="reg-guest-prompt">
      <h2>Pro registraci na akci se musíš přihlásit</h2>
      <p>
        Registrace na <strong>${escapeHtml(schema.event.name)}</strong> probíhá
        přes systém registracka.cz. Pokud tam již máš účet, přihlas se.
        Pokud ne, založ si ho.
      </p>
      <div class="reg-guest-prompt__actions">
        <a class="reg-btn reg-btn--primary" href="${loginUrl}" target="_blank" rel="noopener">
          Přihlásit se na registracku ↗
        </a>
        <a class="reg-btn" href="${registerUrl}" target="_blank" rel="noopener">
          Vytvořit účet ↗
        </a>
      </div>
      <p style="margin-top: 1.5rem; font-size: 0.85rem; color: var(--color-text-on-dark-muted);">
        Po přihlášení zavři tuto záložku a otevři tuto stránku znovu —
        formulář se ti pak zobrazí předvyplněný.
      </p>
    </div>
  `;
}

// Escapuje HTML pro bezpečné vložení do innerHTML (XSS prevention).
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
