/**
 * Sdílený modal se seznamem přihlášených účastníků.
 * Datum: 2026-05-15
 *
 * Používá se na:
 *   - /<lang>/kdo-jede/ (přes initKdoJede)
 *   - /<lang>/registrace/vypisy/celkovy/ (přes renderCelkovy ve vypis.ts)
 *
 * Privacy (per CLAUDE.md / GDPR): jen nick (případně křestní jméno) + skupina.
 * Žádné platby, věk, kontakt, target_type.
 */

import type { Participant } from './registration/types';
import { getDomTranslator } from './i18n-helper';

export interface ParticipantsModalOptions {
  /** Hlavička modalu — typicky název armády / strany / role. */
  title: string;
  /** Počet přihlášených (= participants.length, jen pro zobrazení v hlavičce). */
  count: number;
  /** Limit (kapacita). Null = bez limitu. */
  limit: number | null;
  /** Účastníci k vypsání. */
  participants: Participant[];
  /**
   * Barevný akcent: 'free' (zelená), 'evil' (červená), 'gold' (zlatá).
   * Cokoli jiného spadne na 'gold'.
   */
  tone: string;
}

export function openParticipantsModal(opts: ParticipantsModalOptions): void {
  const tr = getDomTranslator();
  const tone = opts.tone === 'free' || opts.tone === 'evil' ? opts.tone : 'gold';

  const backdrop = document.createElement('div');
  backdrop.className = 'kj-modal-backdrop';
  backdrop.setAttribute('role', 'dialog');
  backdrop.setAttribute('aria-modal', 'true');
  backdrop.setAttribute('aria-label', opts.title);

  const limitText = opts.limit !== null ? `${opts.count}/${opts.limit}` : `${opts.count}`;
  const noOne = tr('kdojede.no_participants');
  const closeLabel = tr('kdojede.close');

  const items = opts.participants
    .map((p) => `<li class="kj-modal__item">${formatParticipantLine(p)}</li>`)
    .join('');

  backdrop.innerHTML = `
    <div class="kj-modal kj-modal--${tone}">
      <button type="button" class="kj-modal__close" aria-label="${escapeAttr(closeLabel)}" data-kj-modal-close>×</button>
      <header class="kj-modal__header">
        <h2 class="kj-modal__title">${escapeHtml(opts.title)}</h2>
        <div class="kj-modal__count">${escapeHtml(limitText)}</div>
      </header>
      ${opts.participants.length === 0
        ? `<div class="kj-modal__empty"><em>${escapeHtml(noOne)}</em></div>`
        : `<ul class="kj-modal__list" role="list">${items}</ul>`}
    </div>
  `;

  document.body.appendChild(backdrop);
  document.body.style.overflow = 'hidden';
  requestAnimationFrame(() => backdrop.classList.add('is-open'));

  const close = (): void => {
    backdrop.classList.remove('is-open');
    document.body.style.overflow = '';
    document.removeEventListener('keydown', onKey);
    setTimeout(() => backdrop.remove(), 200);
  };
  const onKey = (e: KeyboardEvent): void => {
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
    }
  };
  document.addEventListener('keydown', onKey);
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) close();
  });
  backdrop.querySelector<HTMLButtonElement>('[data-kj-modal-close]')?.addEventListener('click', close);
}

function formatParticipantLine(p: Participant): string {
  const name = (p.nick && p.nick.trim() !== '') ? p.nick : p.first_name;
  const group = p.group_name && p.group_name.trim() !== '' ? p.group_name : '';
  if (group) {
    return `<span class="kj-modal__name">${escapeHtml(name)}</span><span class="kj-modal__sep"> — </span><span class="kj-modal__group">${escapeHtml(group)}</span>`;
  }
  return `<span class="kj-modal__name">${escapeHtml(name)}</span>`;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  } as Record<string, string>)[c] as string);
}

function escapeAttr(s: string): string {
  return escapeHtml(s);
}
