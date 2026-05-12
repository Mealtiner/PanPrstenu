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

import { getMe, getEventSchema, submitRegistration, getMyRegistration, getMyTargets, unregisterTarget, login as apiLogin, logout as apiLogout } from './api-client';
import type { ExistingRegistration, MyTarget, MyTargetsResponse } from './api-client';
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
    // Hub view — načti i seznam targets (sebe + affiliated + group_members)
    const [existing, targets] = await Promise.all([
      getMyRegistration(slug),
      getMyTargets(slug),
    ]);
    renderSidebar(me, targets, slug);
    if (existing && targets) {
      renderHub(root, me, existing, targets, slug, schema);
      return;
    }
    if (existing) {
      renderExistingRegistration(root, me, existing, slug, schema);
      return;
    }
    renderLoggedInForm(root, me, schema, slug);
  } else {
    renderSidebar(null, null, slug);
    renderGuestPrompt(root, schema, slug);
  }
}

// Levý sidebar s navigačním menu (Registrace + Výpis přihlášených + Statistiky).
// Renderuje se vždy (i pro guest) — položky odkazující na akce vyžadující login
// se skryjí pro nepřihlášené uživatele.
function renderSidebar(
  me: CurrentUser | null,
  targetsRes: MyTargetsResponse | null,
  slug: string,
): void {
  const aside = document.getElementById('registration-sidebar');
  if (!aside) return;

  // Najdi neregistrované affiliated a group_member targets
  const targets = targetsRes?.targets ?? [];
  const unregisteredAffiliated = targets.filter(
    (t) => t.target_type === 'affiliated' && !t.registered,
  );
  const groupsMap = new Map<number, { name: string; members: MyTarget[] }>();
  for (const t of targets) {
    if (t.target_type !== 'group_member' || !t.registered === false) {
      // collect both registered + unregistered for context, but for action we filter below
    }
    if (t.target_type === 'group_member' && t.group_id !== undefined) {
      if (!groupsMap.has(t.group_id)) {
        groupsMap.set(t.group_id, { name: t.group_name ?? '', members: [] });
      }
      groupsMap.get(t.group_id)!.members.push(t);
    }
  }
  const hasUnregisteredGroupMembers = [...groupsMap.values()].some((g) =>
    g.members.some((m) => !m.registered),
  );

  // Sub-menu pro registraci rodiny — rozevírací <details>
  const familySubmenu = unregisteredAffiliated.length > 0
    ? unregisteredAffiliated
        .map(
          (t) => `
            <button class="reg-sidebar__sublink" data-target-key="${escapeHtml(t.target_key)}" type="button">
              + ${escapeHtml(t.label)}
              ${t.nick ? `<span class="reg-sidebar__sub-nick">(${escapeHtml(t.nick)})</span>` : ''}
            </button>
          `,
        )
        .join('')
    : '';

  // Sub-menu pro registraci skupiny — list per skupinu
  const groupSubmenu = [...groupsMap.entries()]
    .map(([gid, g]) => {
      const unreg = g.members.filter((m) => !m.registered);
      if (unreg.length === 0) return '';
      const items = unreg
        .map(
          (t) => `
            <button class="reg-sidebar__sublink" data-target-key="${escapeHtml(t.target_key)}" type="button">
              + ${escapeHtml(t.label)}
              ${t.nick ? `<span class="reg-sidebar__sub-nick">(${escapeHtml(t.nick)})</span>` : ''}
            </button>
          `,
        )
        .join('');
      return `
        <div class="reg-sidebar__group-block">
          <div class="reg-sidebar__group-title">${escapeHtml(g.name)}</div>
          ${items}
        </div>
      `;
    })
    .join('');

  const registrationItems: string[] = [];

  // 1) Registrace člena rodiny (jen pokud existují neregistrovaní affiliated)
  if (me && unregisteredAffiliated.length > 0) {
    registrationItems.push(`
      <details class="reg-sidebar__details">
        <summary class="reg-sidebar__item reg-sidebar__item--has-sub">
          Registrace člena rodiny
          <span class="reg-sidebar__badge">${unregisteredAffiliated.length}</span>
        </summary>
        <div class="reg-sidebar__submenu">${familySubmenu}</div>
      </details>
    `);
  }

  // 2) Registrace člena skupiny
  if (me && hasUnregisteredGroupMembers) {
    const totalUnreg = [...groupsMap.values()]
      .reduce((sum, g) => sum + g.members.filter((m) => !m.registered).length, 0);
    registrationItems.push(`
      <details class="reg-sidebar__details">
        <summary class="reg-sidebar__item reg-sidebar__item--has-sub">
          Registrace člena skupiny
          <span class="reg-sidebar__badge">${totalUnreg}</span>
        </summary>
        <div class="reg-sidebar__submenu">${groupSubmenu}</div>
      </details>
    `);
  }

  // 3) Úprava osobních údajů + odhlášení (jen pro přihlášené)
  if (me) {
    registrationItems.push(`
      <a class="reg-sidebar__item" href="${REGISTRACKA_BASE}/personel_${encodeURIComponent(slug)}.php" target="_blank" rel="noopener">
        Úprava osobních údajů ↗
      </a>
    `);
    registrationItems.push(`
      <button type="button" class="reg-sidebar__item reg-sidebar__item--logout" data-sidebar-action="logout">
        Odhlásit se ze systému
      </button>
    `);
  }

  // 4) Guest items (jen pokud user NENÍ přihlášený) — odkazy na login form a vytvoření účtu
  if (!me) {
    registrationItems.push(`
      <a class="reg-sidebar__item" href="#reg-login" data-scroll-to="reg-login">
        Přihlásit se s účtem Registračky
      </a>
    `);
    registrationItems.push(`
      <button type="button" class="reg-sidebar__item" data-sidebar-action="create-account">
        Vytvořit nový účet
      </button>
    `);
  }

  const registrationSection = registrationItems.length > 0
    ? `
      <div class="reg-sidebar__section">
        <h3 class="reg-sidebar__heading">Registrace</h3>
        <nav class="reg-sidebar__items">${registrationItems.join('')}</nav>
      </div>
    `
    : '';

  // Výpis přihlášených — placeholder (zatím neaktivní)
  const listingSection = `
    <div class="reg-sidebar__section">
      <h3 class="reg-sidebar__heading">Výpis přihlášených</h3>
      <nav class="reg-sidebar__items">
        <span class="reg-sidebar__item reg-sidebar__item--disabled" title="Brzy">Celkový výpis</span>
        <span class="reg-sidebar__item reg-sidebar__item--disabled" title="Brzy">Svobodné národy Středozemě</span>
        <span class="reg-sidebar__item reg-sidebar__item--disabled" title="Brzy">Síly Temného Pána</span>
        <span class="reg-sidebar__item reg-sidebar__item--disabled" title="Brzy">Žoldáci — Horalé z Vrchoviny</span>
        <span class="reg-sidebar__item reg-sidebar__item--disabled" title="Brzy">Nehrající / Nebojový doprovod</span>
      </nav>
    </div>
  `;

  // Statistiky — placeholder
  const statsSection = `
    <div class="reg-sidebar__section">
      <h3 class="reg-sidebar__heading">Statistiky</h3>
      <nav class="reg-sidebar__items">
        <span class="reg-sidebar__item reg-sidebar__item--disabled" title="Brzy">Brzy doplníme</span>
      </nav>
    </div>
  `;

  aside.innerHTML = `${registrationSection}${listingSection}${statsSection}`;

  // Napoj klik handlery na sub-menu (registrace osoby)
  aside.querySelectorAll<HTMLButtonElement>('[data-target-key]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetKey = btn.dataset.targetKey ?? 'self';
      const target = targetsRes?.targets.find((t) => t.target_key === targetKey);
      if (!target || !me) return;
      void renderTargetFormStandalone(targetKey, slug);
    });
  });

  // Guest sidebar — scroll na login form
  aside.querySelectorAll<HTMLAnchorElement>('[data-scroll-to]').forEach((a) => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const id = a.dataset.scrollTo ?? '';
      const target = document.getElementById(id);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Po scrollu zaměř email input pro rychlejší UX
        const emailInput = target.querySelector<HTMLInputElement>('input[name="email"]');
        if (emailInput) setTimeout(() => emailInput.focus(), 300);
      }
    });
  });

  // Guest sidebar — "Vytvořit účet" placeholder (Fáze 5)
  aside.querySelectorAll<HTMLButtonElement>('[data-sidebar-action="create-account"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      window.alert('Vytvoření nového účtu doplníme v další fázi (Fáze 5 — guest registrace s e-mailovým potvrzením).');
    });
  });

  // Logged-in sidebar — odhlášení
  aside.querySelectorAll<HTMLButtonElement>('[data-sidebar-action="logout"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      void handleLogout(slug);
    });
  });
}

async function handleLogout(slug: string): Promise<void> {
  const confirmed = window.confirm('Opravdu se chceš odhlásit?');
  if (!confirmed) return;
  await apiLogout();
  // Refresh — backend nás vidí jako odhlášené, znova zobrazí login form
  void initRegistration('#registration-app', slug);
}

// Helper — když se klikne na položku sidebar pro registraci targetu, načti schema
// a render formuláře (bez re-initu celé app).
async function renderTargetFormStandalone(targetKey: string, slug: string): Promise<void> {
  const root = document.getElementById('registration-app');
  if (!root) return;
  root.innerHTML = '<div class="reg-loading">Načítám…</div>';

  const [me, schema, targets] = await Promise.all([
    getMe(),
    getEventSchema(slug),
    getMyTargets(slug),
  ]);
  if (!me || !schema || !targets) {
    root.innerHTML = '<div class="reg-error">Nepodařilo se načíst data. Refresh stránky.</div>';
    return;
  }
  const target = targets.targets.find((t) => t.target_key === targetKey);
  if (!target) {
    root.innerHTML = '<div class="reg-error">Cíl nenalezen.</div>';
    return;
  }
  renderRegistrationFormForTarget(root, me, schema, slug, target);
}

// Hub view — vlastní registrace + tlačítka pro registraci dalších osob (rodina, skupina).
function renderHub(
  root: HTMLElement,
  me: CurrentUser,
  existing: ExistingRegistration,
  targetsRes: MyTargetsResponse,
  slug: string,
  schema: SchemaResponse,
): void {
  const targets = targetsRes.targets;

  // Rozděl targets podle typu (kromě self — ten je vykreslený jako hlavní platba)
  const affiliated = targets.filter((t) => t.target_type === 'affiliated');
  const groupMembersByGroup = new Map<number, { name: string; members: MyTarget[] }>();
  for (const t of targets) {
    if (t.target_type !== 'group_member' || t.group_id === undefined) continue;
    if (!groupMembersByGroup.has(t.group_id)) {
      groupMembersByGroup.set(t.group_id, { name: t.group_name ?? '', members: [] });
    }
    groupMembersByGroup.get(t.group_id)!.members.push(t);
  }

  const paymentHtml = renderPaymentSection({
    price: existing.payment ? existing.payment.total : existing.price,
    price_breakdown: existing.price_breakdown,
    bank_account: existing.bank_account,
    iban: existing.iban,
    variable_symbol: existing.variable_symbol,
    qr_image_html: existing.qr_image_html,
    due_date: existing.due_date,
    days_remaining: existing.days_remaining,
    is_paid: existing.is_paid,
    paid_date: existing.paid_date,
    components: existing.payment ? existing.payment.components : undefined,
    subtotal_uncapped: existing.payment?.subtotal_uncapped,
    family_cap: existing.payment?.family_cap,
    cap_applied: existing.payment?.cap_applied,
  });

  // Najdi neregistrované členy rodiny + skupin
  const unregisteredAffiliated = affiliated.filter((t) => !t.registered);
  const registeredAffiliated = affiliated.filter((t) => t.registered);

  // Sekce „Členové rodiny" — affiliated osoby
  let familySectionHtml = '';
  if (affiliated.length > 0) {
    const buttonsHtml = unregisteredAffiliated
      .map(
        (t) => `
          <button class="reg-target-btn" data-target-key="${escapeHtml(t.target_key)}" type="button">
            <span class="reg-target-btn__plus">+</span>
            <span class="reg-target-btn__label">
              ${escapeHtml(t.label)}
              ${t.nick ? `<span class="reg-target-btn__nick">(${escapeHtml(t.nick)})</span>` : ''}
            </span>
            <span class="reg-target-btn__action">Registrovat</span>
          </button>
        `,
      )
      .join('');
    const registeredHtml = registeredAffiliated
      .map(
        (t) => `
          <div class="reg-target-registered">
            <div class="reg-target-registered__row">
              <span class="reg-target-registered__check">✓</span>
              <span class="reg-target-registered__label">
                ${escapeHtml(t.label)}
                ${t.nick ? `<span class="reg-target-btn__nick">(${escapeHtml(t.nick)})</span>` : ''}
              </span>
              <span class="reg-target-registered__status">${t.registration?.is_paid ? 'zaplaceno' : 'registrován'}</span>
              ${!t.registration?.is_paid
                ? `<button class="reg-unregister-btn" data-unregister-key="${escapeHtml(t.target_key)}" data-unregister-label="${escapeHtml(t.label)}" type="button" title="Odregistrovat">Odregistrovat</button>`
                : ''}
            </div>
            ${renderRegistrationFlavorLine(t, schema)}
          </div>
        `,
      )
      .join('');
    familySectionHtml = `
      <section class="reg-hub__section">
        <h3 class="reg-hub__section-title">Registruj dalšího člena rodiny (přidruženou osobu)</h3>
        ${registeredHtml ? `<div class="reg-target-list">${registeredHtml}</div>` : ''}
        ${buttonsHtml
        ? `<div class="reg-target-list">${buttonsHtml}</div>`
        : (registeredHtml
          ? `<p class="reg-hub__section-note">Všechny přidružené osoby jsou už registrované.</p>`
          : '')}
      </section>
    `;
  }

  // Sekce „Členové skupiny" — pro každou skupinu kde je admin
  let groupsSectionHtml = '';
  if (groupMembersByGroup.size > 0) {
    const groupSections = [...groupMembersByGroup.entries()]
      .map(([gid, g]) => {
        const unregistered = g.members.filter((t) => !t.registered);
        const registered = g.members.filter((t) => t.registered);
        const buttonsHtml = unregistered
          .map(
            (t) => `
              <button class="reg-target-btn" data-target-key="${escapeHtml(t.target_key)}" type="button">
                <span class="reg-target-btn__plus">+</span>
                <span class="reg-target-btn__label">
                  ${escapeHtml(t.label)}
                  ${t.nick ? `<span class="reg-target-btn__nick">(${escapeHtml(t.nick)})</span>` : ''}
                </span>
                <span class="reg-target-btn__action">Registrovat</span>
              </button>
            `,
          )
          .join('');
        const registeredHtml = registered
          .map(
            (t) => `
              <div class="reg-target-registered">
                <div class="reg-target-registered__row">
                  <span class="reg-target-registered__check">✓</span>
                  <span class="reg-target-registered__label">
                    ${escapeHtml(t.label)}
                    ${t.nick ? `<span class="reg-target-btn__nick">(${escapeHtml(t.nick)})</span>` : ''}
                  </span>
                  <span class="reg-target-registered__status">${t.registration?.is_paid ? 'zaplaceno' : 'registrován'}</span>
                </div>
                ${renderRegistrationFlavorLine(t, schema)}
              </div>
            `,
          )
          .join('');
        return `
          <div class="reg-hub__group">
            <h4 class="reg-hub__group-title">${escapeHtml(g.name)}</h4>
            ${registeredHtml ? `<div class="reg-target-list">${registeredHtml}</div>` : ''}
            ${buttonsHtml ? `<div class="reg-target-list">${buttonsHtml}</div>` : ''}
          </div>
        `;
      })
      .join('');
    groupsSectionHtml = `
      <section class="reg-hub__section">
        <h3 class="reg-hub__section-title">Registruj člena skupiny</h3>
        <p class="reg-hub__section-note">
          Člen skupiny si registraci a platbu řeší sám — po odeslání mu přijde e-mail s instrukcemi.
        </p>
        ${groupSections}
      </section>
    `;
  }

  // Najdi labely pro sebe
  const labels: Record<string, string> = {};
  for (const field of schema.form.fields) {
    if (!field.name || !field.options) continue;
    const val = existing.form[field.name];
    if (val !== null && val !== undefined && val !== '' && field.options[val]) {
      labels[field.name] = field.options[val];
    }
  }
  const sideLabel = labels.side ?? '—';
  const narLabel = labels.nar ?? '';

  root.innerHTML = `
    <div class="reg-user-banner">
      <div class="reg-user-banner__main">
        Přihlášen jako
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

    <div class="reg-success">
      <h2>Jsi zaregistrován</h2>
      <p>
        Na akci <strong>${escapeHtml(schema.event.name)}</strong>
        jsi přihlášen jako <strong>${escapeHtml(sideLabel)}</strong>${narLabel ? ' — ' + escapeHtml(narLabel) : ''}.
      </p>
      <p>
        Registrační ID: <code>${escapeHtml(existing.useridno_formatted)}</code>
        ${existing.confirmed ? ' · stav: <strong>potvrzeno</strong>' : ' · stav: čeká na schválení'}
      </p>

      ${paymentHtml}

      ${!existing.is_paid
        ? `<div class="reg-self-actions">
            <button class="reg-unregister-btn reg-unregister-btn--lg" data-unregister-key="self" data-unregister-label="vlastní registrace" type="button">
              Odregistrovat vlastní registraci
            </button>
            <p class="reg-self-actions__note">
              Odregistrovat lze jen do okamžiku zaplacení. Po platbě řešíš změny přes organizátory.
            </p>
          </div>`
        : ''}

      ${familySectionHtml}
      ${groupsSectionHtml}

      <p style="margin-top: 1.5rem;">
        Úpravy registrace zatím probíhají přes
        <a href="${REGISTRACKA_BASE}/${encodeURIComponent(slug)}_web.php" target="_blank" rel="noopener">registracku.cz ↗</a>.
      </p>

      <div class="reg-hub__footer">
        <button type="button" class="reg-hub__logout-btn" data-action="logout-hub">
          Odhlásit se ze systému
        </button>
      </div>
    </div>
  `;

  // Připoj klik handlery na všechny tlačítka pro registraci targetu
  root.querySelectorAll<HTMLButtonElement>('[data-target-key]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetKey = btn.dataset.targetKey ?? 'self';
      const target = targetsRes.targets.find((t) => t.target_key === targetKey);
      if (!target) return;
      renderRegistrationFormForTarget(root, me, schema, slug, target);
    });
  });

  // Logout duplikát v hub footeru (pravý dolní roh hub bloku)
  root.querySelectorAll<HTMLButtonElement>('[data-action="logout-hub"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      void handleLogout(slug);
    });
  });

  // Klik handlery pro „Odregistrovat" tlačítka (self i affiliated).
  // Pro self předáme i počet affiliated registrací, aby confirm dialog mohl varovat
  // o cascade smazání.
  const registeredAffiliatedCount = targetsRes.targets.filter(
    (t) => t.target_type === 'affiliated' && t.registered,
  ).length;
  root.querySelectorAll<HTMLButtonElement>('[data-unregister-key]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetKey = btn.dataset.unregisterKey ?? 'self';
      const label = btn.dataset.unregisterLabel ?? 'tuto registraci';
      const cascadeCount = targetKey === 'self' ? registeredAffiliatedCount : 0;
      void handleUnregister(root, me, slug, targetKey, label, cascadeCount);
    });
  });
}

async function handleUnregister(
  root: HTMLElement,
  me: CurrentUser,
  slug: string,
  targetKey: string,
  label: string,
  cascadeCount: number,
): Promise<void> {
  let confirmText = `Opravdu chceš odregistrovat ${label}?`;
  if (targetKey === 'self' && cascadeCount > 0) {
    confirmText += `\n\n⚠️ Smažou se zároveň i registrace ${cascadeCount} ${cascadeCount === 1 ? 'člena' : 'členů'} rodiny (přidružených osob).`;
    confirmText += `\nČlenové skupiny zůstávají — ti jsou nezávislé registrace.`;
  }
  confirmText += `\n\nPozn.: po zaplacení už tato volba není dostupná.`;
  const confirmed = window.confirm(confirmText);
  if (!confirmed) return;

  const res = await unregisterTarget(slug, me.csrf_token, targetKey);
  if (!res.ok) {
    window.alert(res.error?.message ?? 'Odregistrace selhala.');
    return;
  }
  // Refresh hub
  void initRegistration(`#${root.id || 'registration-app'}`, slug);
}

// Render formuláře pro registraci konkrétního targetu (affiliated/group_member).
// Banner indikuje, koho registrujeme; submit zahrnuje target_key.
function renderRegistrationFormForTarget(
  root: HTMLElement,
  me: CurrentUser,
  schema: SchemaResponse,
  slug: string,
  target: MyTarget,
): void {
  const isSelf = target.target_type === 'self';
  const personLabel = isSelf
    ? `${me.first_name} ${me.last_name}`
    : `${target.label}${target.nick ? ` (${target.nick})` : ''}`;

  let banner = '';
  if (!isSelf) {
    const role = target.target_type === 'affiliated'
      ? 'přidruženou osobu'
      : `člena skupiny <strong>${escapeHtml(target.group_name ?? '')}</strong>`;
    // Affiliated → datum narození. Group_member → email + 4-místné ID (osobní údaj
    // místo data narození, které není pro group registrátora primárně relevantní).
    let metaLine = '';
    if (target.target_type === 'affiliated' && target.birth_date) {
      metaLine = `<span style="opacity:0.7"> (narození ${escapeHtml(formatDateCzech(target.birth_date))})</span>`;
    } else if (target.target_type === 'group_member') {
      const parts: string[] = [];
      if (target.email) parts.push(`<a href="mailto:${escapeHtml(target.email)}" style="color: inherit;">${escapeHtml(target.email)}</a>`);
      if (target.useridno_formatted) parts.push(`ID: <code>${escapeHtml(target.useridno_formatted)}</code>`);
      if (parts.length > 0) {
        metaLine = `<div class="reg-target-banner__meta">${parts.join(' · ')}</div>`;
      }
    }
    banner = `
      <div class="reg-target-banner">
        <strong>Registruješ ${role}:</strong>
        ${escapeHtml(personLabel)}
        ${metaLine}
      </div>
    `;
  }

  root.innerHTML = `
    <div class="reg-user-banner">
      <div class="reg-user-banner__main">
        Přihlášen jako
        <strong>${escapeHtml(me.first_name)} ${escapeHtml(me.last_name)}</strong>
        <span style="color: var(--color-text-on-dark-muted)">(${escapeHtml(me.username)})</span>
      </div>
      <button type="button" class="reg-user-banner__edit-link" data-back-to-hub style="background:none;border:none;cursor:pointer;font:inherit;color:var(--color-gold-light);text-decoration:underline;">
        ← Zpět na přehled
      </button>
    </div>

    ${banner}

    <div class="reg-form-host"></div>
    <div class="reg-submit-area">
      <div class="reg-submit-status" data-submit-status></div>
      <button class="reg-btn reg-btn--primary" data-submit-btn type="button">
        Odeslat registraci
      </button>
    </div>
  `;

  const host = root.querySelector('.reg-form-host') as HTMLElement;
  const renderer = new FormRenderer(host, schema);
  renderer.render();

  const submitBtn = root.querySelector('[data-submit-btn]') as HTMLButtonElement;
  const status = root.querySelector('[data-submit-status]') as HTMLElement;

  submitBtn.addEventListener('click', () => {
    void handleSubmit(root, renderer, me, slug, submitBtn, status, target.target_key);
  });

  const backBtn = root.querySelector('[data-back-to-hub]') as HTMLButtonElement | null;
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      void initRegistration(`#${root.id || 'registration-app'}`, slug);
    });
  }

  // Při přepnutí na formulář pro jinou osobu se user dosud nacházel uprostřed
  // dlouhé hub stránky → scroll na začátek formuláře (vrch celé stránky),
  // aby viděl banner s tím, koho registruje, a začátek formulářových polí.
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderExistingRegistration(
  root: HTMLElement,
  me: CurrentUser,
  reg: ExistingRegistration,
  slug: string,
  schema: SchemaResponse,
): void {
  // Mapování klíčových herních hodnot na čitelné labely (z form schema options)
  const labels: Record<string, string> = {};
  for (const field of schema.form.fields) {
    if (!field.name || !field.options) continue;
    const val = reg.form[field.name];
    if (val !== null && val !== undefined && val !== '' && field.options[val]) {
      labels[field.name] = field.options[val];
    }
  }

  const sideLabel = labels.side ?? '—';
  const narLabel = labels.nar ?? '';

  const paymentHtml = renderPaymentSection({
    price: reg.price,
    price_breakdown: reg.price_breakdown,
    bank_account: reg.bank_account,
    iban: reg.iban,
    variable_symbol: reg.variable_symbol,
    qr_image_html: reg.qr_image_html,
    due_date: reg.due_date,
    days_remaining: reg.days_remaining,
    is_paid: reg.is_paid,
    paid_date: reg.paid_date,
  });

  root.innerHTML = `
    <div class="reg-user-banner">
      <div class="reg-user-banner__main">
        Přihlášen jako
        <strong>${escapeHtml(me.first_name)} ${escapeHtml(me.last_name)}</strong>
        <span style="color: var(--color-text-on-dark-muted)">(${escapeHtml(me.username)})</span>
      </div>
      <a
        class="reg-user-banner__edit-link"
        href="https://www.registracka.cz/personel_${encodeURIComponent(slug)}.php"
        target="_blank"
        rel="noopener"
      >Upravit osobní údaje ↗</a>
    </div>

    <div class="reg-success">
      <h2>Jsi zaregistrován</h2>
      <p>
        Na akci <strong>${escapeHtml(schema.event.name)}</strong>
        jsi přihlášen jako <strong>${escapeHtml(sideLabel)}</strong>${narLabel ? ' — ' + escapeHtml(narLabel) : ''}.
      </p>
      <p>
        Registrační ID: <code>${escapeHtml(reg.useridno_formatted)}</code>
        ${reg.confirmed ? ' · stav: <strong>potvrzeno</strong>' : ' · stav: čeká na schválení'}
      </p>

      ${paymentHtml}

      <p style="margin-top: 1.5rem;">
        Úpravy registrace zatím probíhají přes
        <a href="https://www.registracka.cz/${encodeURIComponent(slug)}_web.php" target="_blank" rel="noopener">registracku.cz ↗</a>.
      </p>
    </div>
  `;
}

interface PaymentSectionData {
  price: number;
  price_breakdown: { base: number; surcharges: number; meals: number };
  bank_account: string;
  iban: string;
  variable_symbol: string;
  qr_image_html: string;
  due_date: string | null;
  days_remaining: number | null;
  is_paid: boolean;
  paid_date: string | null;
  components?: Array<{ label: string; amount: number; is_paid: boolean; target_type: string }>;
  // Family cap — pokud cap_applied, total < subtotal_uncapped (= součet jednotlivých).
  subtotal_uncapped?: number;
  family_cap?: number | null;
  cap_applied?: boolean;
}

function renderPaymentSection(d: PaymentSectionData): string {
  const stateClass = d.is_paid ? 'reg-success__payment--paid' : 'reg-success__payment--unpaid';
  const stateLabel = d.is_paid ? 'ZAPLACENO' : 'NEZAPLACENO';

  let dueDateRow = '';
  if (d.due_date) {
    const dueFormatted = formatDateCzech(d.due_date);
    let daysText = '';
    let daysClass = '';
    if (d.days_remaining !== null) {
      if (d.days_remaining < 0) {
        daysText = `<span class="reg-success__days reg-success__days--overdue">(po splatnosti ${-d.days_remaining} ${dayWord(-d.days_remaining)})</span>`;
      } else if (d.days_remaining === 0) {
        daysText = `<span class="reg-success__days">(dnes)</span>`;
      } else {
        daysText = `<span class="reg-success__days">(zbývá ${d.days_remaining} ${dayWord(d.days_remaining)})</span>`;
        daysClass = '';
      }
    }
    dueDateRow = `<dt>Splatnost do</dt><dd>${escapeHtml(dueFormatted)} ${daysText}</dd>`;
  }

  let paidDateRow = '';
  if (d.is_paid && d.paid_date) {
    paidDateRow = `<dt>Zaplaceno</dt><dd>${escapeHtml(formatDateCzech(d.paid_date))}</dd>`;
  }

  const qrSection = d.qr_image_html
    ? `<div class="reg-success__qr">${d.qr_image_html}<div class="reg-success__qr-note">Naskenuj QR v bankovní aplikaci pro rychlou platbu</div></div>`
    : '';

  // Pokud jsou components a víc než 1 osoba — rozpis (rodinná platba s několika členy)
  let componentsRow = '';
  if (d.components && d.components.length > 1) {
    const itemsHtml = d.components
      .map((c) => `
        <li class="reg-success__component">
          <span class="reg-success__component-label">${escapeHtml(c.label)}</span>
          <span class="reg-success__component-amount">${c.amount} Kč${c.is_paid ? ' <span style="color:#4ade80;">✓</span>' : ''}</span>
        </li>
      `)
      .join('');
    componentsRow = `
      <dt>Rozpis</dt>
      <dd>
        <ul class="reg-success__components">${itemsHtml}</ul>
      </dd>
    `;
  }

  const priceLabel = d.components && d.components.length > 1 ? 'Celkem k zaplacení' : 'Cena registrace';

  // Family cap — zobraz upozornění, pokud se uplatnil
  const capRow = d.cap_applied && d.subtotal_uncapped && d.family_cap
    ? `<dt></dt><dd class="reg-success__cap-note">
        Uplatňuje se <strong>rodinný strop registrace</strong> — místo součtu ${d.subtotal_uncapped} Kč
        platíš ${d.family_cap} Kč.
      </dd>`
    : '';

  return `
    <div class="reg-success__payment ${stateClass}">
      <div class="reg-success__status">${stateLabel}</div>
      <h3>Platební údaje</h3>
      <dl class="reg-success__payment-list">
        <dt>${priceLabel}</dt>
        <dd><strong>${d.price} Kč</strong>${d.components && d.components.length > 1
          ? ''
          : (d.price_breakdown.surcharges > 0
            ? ` <span class="reg-success__breakdown">(základ ${d.price_breakdown.base} Kč + příplatky ${d.price_breakdown.surcharges} Kč)</span>`
            : '')}</dd>
        ${componentsRow}
        ${capRow}
        ${d.bank_account ? `<dt>Bankovní účet</dt><dd><code>${escapeHtml(d.bank_account)}</code></dd>` : ''}
        ${d.iban ? `<dt>IBAN</dt><dd><code>${escapeHtml(d.iban)}</code></dd>` : ''}
        <dt>Variabilní symbol</dt>
        <dd><code>${escapeHtml(d.variable_symbol)}</code></dd>
        ${dueDateRow}
        ${paidDateRow}
      </dl>
      ${qrSection}
    </div>
  `;
}

// "2026-08-20" → "20. 08. 2026"
function formatDateCzech(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return iso;
  return `${m[3]}. ${m[2]}. ${m[1]}`;
}

// Skloňování slova "den" pro češtinu.
function dayWord(n: number): string {
  if (n === 1) return 'den';
  if (n >= 2 && n <= 4) return 'dny';
  return 'dní';
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
      <div class="reg-submit-status" data-submit-status></div>
      <button class="reg-btn reg-btn--primary" data-submit-btn type="button">
        Odeslat registraci
      </button>
    </div>
  `;

  const host = root.querySelector('.reg-form-host') as HTMLElement;
  const renderer = new FormRenderer(host, schema);
  renderer.render();

  const btn = root.querySelector('[data-submit-btn]') as HTMLButtonElement;
  const status = root.querySelector('[data-submit-status]') as HTMLElement;

  btn.addEventListener('click', () => {
    void handleSubmit(root, renderer, me, slug, btn, status, 'self');
  });

  // Debug — expose pro DevTools
  (window as unknown as { __regRenderer: FormRenderer }).__regRenderer = renderer;
}

async function handleSubmit(
  root: HTMLElement,
  renderer: FormRenderer,
  me: CurrentUser,
  slug: string,
  btn: HTMLButtonElement,
  status: HTMLElement,
  targetKey: string,
): Promise<void> {
  // Klient-side validace povinných souhlasů (zrychlení UX; server stejně revaliduje)
  const missing = renderer.getMissingRequiredAgreements();
  if (missing.length > 0) {
    status.textContent = 'Zaškrtni všechny povinné souhlasy.';
    status.style.color = '#f87171';
    return;
  }

  btn.disabled = true;
  status.textContent = 'Odesílám registraci…';
  status.style.color = '';

  const res = await submitRegistration(slug, me.csrf_token, {
    form: renderer.getState(),
    agreements: renderer.getAgreements(),
    group: renderer.getGroup(),
    target: targetKey,
  });

  if (!res.ok || !res.data) {
    const err = res.error;
    const msg = err?.message || 'Registraci se nepodařilo odeslat.';
    if (err?.details) {
      const detailKeys = Object.keys(err.details);
      const first = detailKeys.length > 0 ? err.details[detailKeys[0]] : '';
      status.textContent = msg + (first ? ' — ' + first : '');
    } else {
      status.textContent = msg;
    }
    status.style.color = '#f87171';
    btn.disabled = false;
    return;
  }

  // ÚSPĚCH — po registraci se vždy vracíme na hub. Krátká zpráva + refresh.
  // Hub zobrazí jak vlastní registraci (s platebními údaji + QR), tak možnost
  // registrace dalších členů rodiny/skupiny.
  status.textContent = 'Registrace odeslána. Vracím tě na přehled…';
  status.style.color = '#4ade80';
  setTimeout(() => {
    void initRegistration(`#${root.id || 'registration-app'}`, slug);
  }, 1000);
}

function renderGuestPrompt(
  root: HTMLElement,
  schema: SchemaResponse,
  slug: string,
): void {
  const pwresUrl = `${REGISTRACKA_BASE}/pwres_${encodeURIComponent(slug)}.php`;

  root.innerHTML = `
    <fieldset class="reg-login-box" id="reg-login">
      <legend>Jak se přihlásit</legend>
      <div class="reg-login-box__intro">
        <p>
          Pro přihlášení na akci je potřeba mít účet na registračním systému
          <strong>Registračka.cz</strong>.
        </p>
        <p>Mohou tedy nastat 3 možnosti:</p>
        <p>
          <strong>1)</strong> Pokud již svůj účet máte, stačí se svými přihlašovacími údaji
          přihlásit (přihlašovací políčka vpravo) a registrovat se na akci.
        </p>
        <p>
          <strong>2)</strong> Nikdy jste se ještě přes registračku nepřihlašovali. Nemáte tedy
          zatím svůj účet. Zvolte možnost <em>nová registrace</em>. Ta vás provede celou
          registrací. Po jejím dokončení vám přijde email s odkazem pro potvrzení.
          Registrace bude dokončena až po odklinutí tohoto odkazu.
        </p>
        <p>
          <strong>3)</strong> Již jste systém někdy v minulosti použili. Nebo si nevzpomínáte,
          že byste jej již použili, ale je to možné. Pak si zkuste nejdříve resetovat vaše
          heslo. Pokud v systému váš email již je, reset hesla se podaří a vám přijde
          informace na email. A pak se již přihlásíte svým účtem — ale bod (1).
        </p>
        <p class="reg-login-box__note">
          pozn.: Pokud v systému váš email již jednou je, a vy se pokusíte registrovat
          nově, vaše registrace se nepovede.
        </p>
      </div>

      <div class="reg-login-box__row">
        <button
          type="button"
          class="reg-login-box__new-account"
          data-action="create-account"
          disabled
          title="Vytvoření nového účtu — připravujeme (Fáze 5)"
        >
          Nová registrace do systému
          <span class="reg-login-box__new-account-tag">brzy</span>
        </button>

        <form class="reg-login-box__form" data-login-form>
          <p class="reg-login-box__form-lead">Pro editaci a doplnění vaší registrace se stačí přihlásit.</p>
          <div class="reg-login-box__field">
            <label for="reg-login-email">Emailová adresa:</label>
            <input id="reg-login-email" name="email" type="email" autocomplete="email" required />
          </div>
          <div class="reg-login-box__field">
            <label for="reg-login-pw">Uživatelské heslo:</label>
            <input id="reg-login-pw" name="password" type="password" autocomplete="current-password" required />
          </div>
          <div class="reg-login-box__buttons">
            <button type="submit" class="reg-btn reg-btn--primary" data-login-submit>Přihlaš mne do systému</button>
            <a class="reg-btn" href="${pwresUrl}" target="_blank" rel="noopener">Zapomenuté heslo ↗</a>
            <button type="reset" class="reg-btn" style="background: var(--color-bg-medium); color: var(--color-text-on-dark);">Zrušit</button>
          </div>
          <div class="reg-login-box__status" data-login-status></div>
        </form>
      </div>
    </fieldset>
  `;

  const form = root.querySelector<HTMLFormElement>('[data-login-form]');
  const status = root.querySelector<HTMLElement>('[data-login-status]');
  const submitBtn = root.querySelector<HTMLButtonElement>('[data-login-submit]');

  if (form && status && submitBtn) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const email = String(fd.get('email') ?? '').trim();
      const password = String(fd.get('password') ?? '');

      submitBtn.disabled = true;
      status.textContent = 'Přihlašuji…';
      status.style.color = '';

      const res = await apiLogin(email, password);
      if (!res.ok) {
        status.textContent = res.error?.message ?? 'Přihlášení selhalo.';
        status.style.color = '#f87171';
        submitBtn.disabled = false;
        return;
      }
      status.textContent = 'Přihlášen. Načítám registraci…';
      status.style.color = '#4ade80';
      // Refresh — backend nás vidí jako přihlášené, hub se vyrenderuje.
      void initRegistration(`#${root.id || 'registration-app'}`, slug);
    });
  }

  // Placeholder klik pro „Nová registrace" — zatím disabled, ve Fázi 5 dorenderujeme.
  const newAccountBtn = root.querySelector<HTMLButtonElement>('[data-action="create-account"]');
  if (newAccountBtn) {
    newAccountBtn.addEventListener('click', () => {
      window.alert('Vytvoření nového účtu doplníme v další fázi — zatím použij odkaz "Zapomenuté heslo" nebo nás kontaktuj.');
    });
  }
}

// Vykreslí "podtitulkový" řádek pro registrovanou osobu — co hraje (strana, národ).
// Pomocný helper pro hub view u registrovaných targetů.
function renderRegistrationFlavorLine(t: MyTarget, schema: SchemaResponse): string {
  if (!t.registration?.form_data) return '';
  const formData = t.registration.form_data;
  // Najdi labely v schema.form.fields
  const labelFor = (fieldName: string): string => {
    const f = schema.form.fields.find((f) => f.name === fieldName);
    if (!f || !f.options) return '';
    const val = formData[fieldName];
    if (val === null || val === undefined || val === '') return '';
    return f.options[val] ?? '';
  };
  const side = labelFor('side');
  const nar = labelFor('nar');
  if (!side) return '';
  const text = `Na akci <strong>${escapeHtml(schema.event.name)}</strong> přihlášen jako <strong>${escapeHtml(side)}</strong>${nar ? ' — ' + escapeHtml(nar) : ''}.`;
  return `<div class="reg-target-registered__flavor">${text}</div>`;
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
