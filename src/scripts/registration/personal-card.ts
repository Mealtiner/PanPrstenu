/**
 * Osobní karta — iframe wrapper na registracka.cz/personel.php
 * Datum: 2026-05-12
 *
 * Strategy:
 *  1. Načtu session_token z localStorage (klíč pp_reg_session_token)
 *  2. Pokud user není přihlášen, ukážu CTA na login
 *  3. Pokud je přihlášen, vyrenderuju iframe s URL personel.php?session_token=…
 *
 * Backend musí podporovat ?session_token=… query param pro auto-login
 * (pokud nepodporuje, iframe ukáže registračkový login form a user se
 *  bude muset přihlásit ručně uvnitř iframu).
 *
 * Mobile responsivita: iframe má width 100 %, height kalkulovanou
 * podle viewport - header offset. Wrap má zlatý rám.
 */

import { getSessionToken } from './api-client';
import { getDomTranslator } from '../i18n-helper';

const REGISTRACKA_BASE = 'https://www.registracka.cz';

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function initPersonalCard(rootSelector: string): void {
  const root = document.querySelector<HTMLElement>(rootSelector);
  if (!root) return;

  const t = getDomTranslator();
  const token = getSessionToken();

  if (!token) {
    // Není přihlášen — ukaž CTA s odkazem na login section
    const lang = (root.dataset.lang || 'cs') as string;
    root.innerHTML = `
      <div class="reg-personal-card__empty">
        <p>${escapeHtml(t('reg.login.legend'))}.</p>
        <a class="reg-btn reg-btn--primary" href="/${lang}/registrace/#reg-login">
          ${escapeHtml(t('reg.sidebar.login_account'))}
        </a>
      </div>
    `;
    return;
  }

  // Přihlášen — postav iframe URL s session_tokenem v query param
  // (BE musí parsovat a auto-login; pokud ne, iframe ukáže login form,
  // user se přihlásí ručně cookies se nastaví v rámci registracka.cz).
  const iframeUrl = `${REGISTRACKA_BASE}/personel.php?session_token=${encodeURIComponent(token)}`;

  root.innerHTML = `
    <div class="reg-personal-card">
      <div class="reg-personal-card__note">
        ⚠️ <strong>Pozn.:</strong> Pokud se uvnitř panelu zobrazí přihlašovací formulář,
        zadej e-mail a heslo, kterými ses přihlásil(a) na náš web.
        Změny se ukládají do systému Registračky.
      </div>
      <div class="reg-personal-card__frame-wrap">
        <iframe
          class="reg-personal-card__frame"
          src="${escapeHtml(iframeUrl)}"
          title="${escapeHtml(t('reg.sidebar.personal_card'))}"
          loading="lazy"
        ></iframe>
      </div>
      <div class="reg-personal-card__fallback">
        Pokud panel nefunguje, otevři kartu v novém okně:
        <a href="${REGISTRACKA_BASE}/personel.php" target="_blank" rel="noopener" class="reg-link">
          registracka.cz/personel.php ↗
        </a>
      </div>
    </div>
  `;
}
