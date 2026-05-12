/**
 * Custom modal dialog — nahrazuje window.confirm / window.alert.
 * Datum: 2026-05-12
 *
 * Stylované v gradientu webu (Cinzel, gold border, dark bg). Klávesová
 * obsluha: ESC = zrušit (resp. zavřít), Enter = potvrdit.
 *
 * Použití:
 *   const ok = await showConfirmDialog('Opravdu chceš pokračovat?', {
 *     title: 'Potvrzení',
 *     confirmLabel: 'Pokračovat',
 *     danger: true,
 *   });
 *   await showAlertDialog('Něco se nepodařilo.');
 */

export interface ConfirmDialogOptions {
  title?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Tlačítko 'Potvrdit' obarvit červeně (pro destruktivní akce). */
  danger?: boolean;
}

export function showConfirmDialog(message: string, opts: ConfirmDialogOptions = {}): Promise<boolean> {
  return new Promise((resolve) => {
    const backdrop = buildBackdrop(message, {
      title: opts.title,
      cancelLabel: opts.cancelLabel ?? 'Zrušit',
      confirmLabel: opts.confirmLabel ?? 'Potvrdit',
      danger: opts.danger ?? false,
      showCancel: true,
    });
    document.body.appendChild(backdrop);
    requestAnimationFrame(() => backdrop.classList.add('is-open'));

    const close = (result: boolean): void => {
      backdrop.classList.remove('is-open');
      setTimeout(() => backdrop.remove(), 200);
      document.removeEventListener('keydown', onKey);
      resolve(result);
    };
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        e.preventDefault();
        close(false);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        close(true);
      }
    };
    document.addEventListener('keydown', onKey);

    backdrop.querySelector<HTMLButtonElement>('[data-dialog-cancel]')!.addEventListener('click', () => close(false));
    backdrop.querySelector<HTMLButtonElement>('[data-dialog-confirm]')!.addEventListener('click', () => close(true));
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) close(false); // klik mimo dialog
    });

    const confirmBtn = backdrop.querySelector<HTMLButtonElement>('[data-dialog-confirm]');
    confirmBtn?.focus();
  });
}

export function showAlertDialog(message: string, opts: { title?: string; okLabel?: string } = {}): Promise<void> {
  return new Promise((resolve) => {
    const backdrop = buildBackdrop(message, {
      title: opts.title,
      cancelLabel: '',
      confirmLabel: opts.okLabel ?? 'OK',
      danger: false,
      showCancel: false,
    });
    document.body.appendChild(backdrop);
    requestAnimationFrame(() => backdrop.classList.add('is-open'));

    const close = (): void => {
      backdrop.classList.remove('is-open');
      setTimeout(() => backdrop.remove(), 200);
      document.removeEventListener('keydown', onKey);
      resolve();
    };
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape' || e.key === 'Enter') {
        e.preventDefault();
        close();
      }
    };
    document.addEventListener('keydown', onKey);
    backdrop.querySelector<HTMLButtonElement>('[data-dialog-confirm]')!.addEventListener('click', close);
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) close();
    });
    backdrop.querySelector<HTMLButtonElement>('[data-dialog-confirm]')?.focus();
  });
}

function buildBackdrop(
  message: string,
  o: { title?: string; cancelLabel: string; confirmLabel: string; danger: boolean; showCancel: boolean },
): HTMLDivElement {
  const backdrop = document.createElement('div');
  backdrop.className = 'reg-dialog-backdrop';
  const cancelBtn = o.showCancel
    ? `<button type="button" class="reg-btn" data-dialog-cancel>${escapeHtml(o.cancelLabel)}</button>`
    : '';
  const confirmClass = o.danger ? 'reg-btn reg-btn--danger' : 'reg-btn reg-btn--primary';
  backdrop.innerHTML = `
    <div class="reg-dialog" role="dialog" aria-modal="true" aria-labelledby="reg-dialog-title">
      ${o.title ? `<h3 class="reg-dialog__title" id="reg-dialog-title">${escapeHtml(o.title)}</h3>` : ''}
      <div class="reg-dialog__body">${formatMessage(message)}</div>
      <div class="reg-dialog__actions">
        ${cancelBtn}
        <button type="button" class="${confirmClass}" data-dialog-confirm>${escapeHtml(o.confirmLabel)}</button>
      </div>
    </div>
  `;
  return backdrop;
}

// Escape HTML; zachová newlines (CSS white-space: pre-wrap je vykreslí).
function formatMessage(s: string): string {
  return escapeHtml(s);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
