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

import { getMe, getEventSchema, submitRegistration, getMyRegistration, getMyTargets, unregisterTarget, login as apiLogin, logout as apiLogout, registerGuest, lastSchemaError } from './api-client';
import type { ExistingRegistration, MyTarget, MyTargetsResponse, GuestRegisterPayload } from './api-client';
import type { CurrentUser, SchemaResponse, PersonalFieldDef } from './types';
import { FormRenderer, getLocalizedPersonalLabel, getLocalizedPersonalOption } from './form-renderer';
import { showConfirmDialog, showAlertDialog } from './dialog';
import { getDomTranslator } from '../i18n-helper';
import type { Lang } from '@i18n/ui';

// Detekce jazyka z URL prefixu (/cs/, /en/, /de/, /sk/, /uk/).
// Default na 'cs' pokud běžíme mimo language route.
type GuestLang = GuestRegisterPayload['lang'];
function detectLangFromUrl(): GuestLang {
  if (typeof window === 'undefined') return 'cs';
  const m = /^\/(cs|en|de|sk|uk)(\/|$)/.exec(window.location.pathname);
  return (m ? m[1] : 'cs') as GuestLang;
}

// Vrátí prefix /<lang> pro budování odkazů — typu "/cs", "/en", atd.
function detectLangPrefix(): string {
  return '/' + detectLangFromUrl();
}

const REGISTRACKA_BASE = 'https://www.registracka.cz';

// Standalone vstupní bod pro vykreslení sidebar — pro stránky, které
// nepoužívají `initRegistration` (např. výpisy, statistiky), ale chtějí
// stejný levý sidebar s navigací.
export async function initRegistrationSidebar(slug: string): Promise<void> {
  const aside = document.getElementById('registration-sidebar');
  if (!aside) return;
  const [me, targets, schema] = await Promise.all([
    getMe(),
    getMyTargets(slug),
    getEventSchema(slug),
  ]);
  const registrationOpen = schema?.event.registration_open ?? false;
  renderSidebar(me, targets, slug, registrationOpen);
}

export async function initRegistration(rootSelector: string, slug: string): Promise<void> {
  const root = document.querySelector<HTMLElement>(rootSelector);
  if (!root) {
    console.warn(`[reg] root element ${rootSelector} not found`);
    return;
  }

  root.classList.add('reg-app');
  root.innerHTML = `<div class="reg-loading">${escapeHtml(getDomTranslator()('loading.form'))}</div>`;

  const [me, schema] = await Promise.all([getMe(), getEventSchema(slug)]);

  if (!schema) {
    const errDetail = lastSchemaError
      ? `<br><small style="opacity:0.8">Detail: ${escapeHtml(lastSchemaError.message)} [${escapeHtml(lastSchemaError.code)}]</small>`
      : '';
    root.innerHTML = `
      <div class="reg-error">
        Nepodařilo se načíst registrační data ze serveru registracka.cz.
        Zkus to za chvíli, nebo nás kontaktuj na info@panprstenu.cz.
        ${errDetail}
        <br><br>
        <button type="button" class="reg-btn" onclick="location.reload()">Zkusit znovu</button>
      </div>
    `;
    return;
  }

  // Sidebar (s výpisy + statistikami) renderujeme VŽDY — i když registrace
  // ještě není otevřená. Sekce "Registrace" v sidebaru pak zobrazí jen info,
  // ostatní sekce (výpisy, statistiky) zůstávají dostupné.
  if (!schema.event.registration_open) {
    const targets = me ? await getMyTargets(slug) : null;
    renderSidebar(me, targets, slug, false);
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
    renderSidebar(me, targets, slug, true);
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
    renderSidebar(null, null, slug, true);
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
  registrationOpen: boolean,
): void {
  const aside = document.getElementById('registration-sidebar');
  if (!aside) return;

  // i18n překladač + URL helpers — používány napříč všemi sekcemi sidebaru.
  const t = getDomTranslator();
  const langPrefix = detectLangPrefix();

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

  // URL helpery — pokud jsme na samotné /registrace/, sidebar linky jsou
  // čisté anchor (#id) pro scroll v rámci stránky. Na jiných stránkách
  // (např. /registrace/vypisy/<typ>/) ukazují na plnou cestu — navigace.
  const langPrefixEarly = detectLangPrefix();
  const registraceBaseEarly = `${langPrefixEarly}/registrace`;
  const onRegistracePageEarly = typeof window !== 'undefined'
    && /^\/(cs|en|de|sk|uk)\/registrace\/?$/.test(window.location.pathname);
  const hrefFor = (id: string): string =>
    onRegistracePageEarly ? `#${id}` : `${registraceBaseEarly}/#${id}`;

  const registrationItems: string[] = [];

  // Pokud registrace ještě není otevřená, místo akčních položek zobraz info.
  // Úprava údajů + odhlášení/přihlášení zůstává — uživatelé se mohou přihlásit
  // a editovat profil i bez aktivní registrace.
  if (!registrationOpen) {
    registrationItems.push(`
      <div class="reg-sidebar__notice">
        Registrace ještě nebyla spuštěna.
      </div>
    `);
  }

  // 1) Registrace člena rodiny (jen pokud existují neregistrovaní affiliated)
  if (registrationOpen && me && unregisteredAffiliated.length > 0) {
    registrationItems.push(`
      <details class="reg-sidebar__details">
        <summary class="reg-sidebar__item reg-sidebar__item--has-sub">
          ${escapeHtml(t('reg.sidebar.family_register'))}
          <span class="reg-sidebar__badge">${unregisteredAffiliated.length}</span>
        </summary>
        <div class="reg-sidebar__submenu">${familySubmenu}</div>
      </details>
    `);
  }

  // 2) Registrace člena skupiny
  if (registrationOpen && me && hasUnregisteredGroupMembers) {
    const totalUnreg = [...groupsMap.values()]
      .reduce((sum, g) => sum + g.members.filter((m) => !m.registered).length, 0);
    registrationItems.push(`
      <details class="reg-sidebar__details">
        <summary class="reg-sidebar__item reg-sidebar__item--has-sub">
          ${escapeHtml(t('reg.sidebar.group_register'))}
          <span class="reg-sidebar__badge">${totalUnreg}</span>
        </summary>
        <div class="reg-sidebar__submenu">${groupSubmenu}</div>
      </details>
    `);
  }

  // 3) Osobní karta — nativní view na našem webu (iframe z registracka.cz/personel.php
  //    skinovaný do našeho rámce). Active state per URL.
  // 4) Úprava osobních údajů ↗ — legacy odkaz na externí registračku (target=_blank).
  // 5) Odhlášení.
  if (me) {
    const onPersonalCardPage = typeof window !== 'undefined'
      && /\/registrace\/osobni-karta\/?$/.test(window.location.pathname);
    const personalCardCls = onPersonalCardPage ? 'reg-sidebar__item active' : 'reg-sidebar__item';
    registrationItems.push(`
      <a class="${personalCardCls}" href="${langPrefix}/registrace/osobni-karta/">
        ${escapeHtml(t('reg.sidebar.personal_card'))}
      </a>
    `);
    registrationItems.push(`
      <a class="reg-sidebar__item" href="${REGISTRACKA_BASE}/personel_${encodeURIComponent(slug)}.php" target="_blank" rel="noopener">
        ${escapeHtml(t('reg.sidebar.edit_personal'))}
      </a>
    `);
    registrationItems.push(`
      <button type="button" class="reg-sidebar__item reg-sidebar__item--logout" data-sidebar-action="logout">
        ${escapeHtml(t('reg.sidebar.logout_full'))}
      </button>
    `);
  }

  // 4) Guest items (jen pokud user NENÍ přihlášený) — odkazy na login form a vytvoření účtu.
  // Pokud registrace ještě není otevřená, "Vytvořit nový účet" skryjeme (neúčelné).
  if (!me) {
    registrationItems.push(`
      <a class="reg-sidebar__item" href="${hrefFor('reg-login')}" data-scroll-to="reg-login">
        ${escapeHtml(t('reg.sidebar.login_account'))}
      </a>
    `);
    if (registrationOpen) {
      registrationItems.push(`
        <button type="button" class="reg-sidebar__item" data-sidebar-action="create-account">
          ${escapeHtml(t('reg.sidebar.create_account'))}
        </button>
      `);
    }
  }

  const registrationSection = registrationItems.length > 0
    ? `
      <div class="reg-sidebar__section">
        <h3 class="reg-sidebar__heading">${escapeHtml(t('reg.sidebar.heading_registration'))}</h3>
        <nav class="reg-sidebar__items">${registrationItems.join('')}</nav>
      </div>
    `
    : '';

  // Výpis přihlášených — odkazuje na /<lang>/registrace/vypisy/<typ>/
  const vypisBase = `${langPrefix}/registrace/vypisy`;
  const registraceBase = `${langPrefix}/registrace`;
  // Výpisy: aktivní položku detekuj podle URL (např. /vypisy/celkovy/ → "celkovy")
  const currentVypisTyp = typeof window !== 'undefined'
    ? (/\/registrace\/vypisy\/([^/]+)\/?$/.exec(window.location.pathname)?.[1] ?? '')
    : '';
  const vypisItem = (typ: string, label: string): string => {
    const cls = currentVypisTyp === typ
      ? 'reg-sidebar__item active'
      : 'reg-sidebar__item';
    return `<a class="${cls}" href="${vypisBase}/${typ}/">${label}</a>`;
  };

  const listingSection = `
    <div class="reg-sidebar__section">
      <h3 class="reg-sidebar__heading">${escapeHtml(t('reg.sidebar.heading_listings'))}</h3>
      <nav class="reg-sidebar__items">
        ${vypisItem('celkovy', t('reg.sidebar.listing_total'))}
        ${vypisItem('svobodne-narody', t('side.free'))}
        ${vypisItem('sily-temneho-pana', t('side.evil'))}
        ${vypisItem('zoldaci', t('side.merc'))}
        ${vypisItem('nehrajici', t('side.nonplay'))}
        ${vypisItem('detska-hra', t('side.kids'))}
      </nav>
    </div>
  `;

  // Informace o registraci — anchor odkazy v rámci /registrace/ stránky.
  // Použity scroll-mt-24 na cílových sekcích pro sticky header offset.
  const infoSection = `
    <div class="reg-sidebar__section">
      <h3 class="reg-sidebar__heading">${escapeHtml(t('reg.sidebar.heading_info'))}</h3>
      <nav class="reg-sidebar__items">
        <a class="reg-sidebar__item toc-spy-link" data-toc-link="jak-to-probiha" href="${hrefFor('jak-to-probiha')}">${escapeHtml(t('reg.sidebar.info_how'))}</a>
        <a class="reg-sidebar__item toc-spy-link" data-toc-link="platba" href="${hrefFor('platba')}">${escapeHtml(t('reg.sidebar.info_payment'))}</a>
        <a class="reg-sidebar__item toc-spy-link" data-toc-link="gdpr" href="${hrefFor('gdpr')}">${escapeHtml(t('reg.sidebar.info_gdpr'))}</a>
        <a class="reg-sidebar__item toc-spy-link" data-toc-link="podminky-ucasti" href="${hrefFor('podminky-ucasti')}">${escapeHtml(t('reg.sidebar.info_terms'))}</a>
      </nav>
    </div>
  `;

  // Statistiky — sekce "Demografie účastníků". Archiv ročníků (2024, 2025,
  // srovnání) byl přesunut pod /minule-rocniky/statistiky/ (Komunita › Archív).
  // V registrace sidebaru zůstává:
  //   • Ročník 2026 (aktuální registrace — shortcut)
  //   • Statistiky pro jednotlivé ročníky (link na archiv/landing)
  const statsArchiveBase = `${langPrefix}/minule-rocniky/statistiky`;
  const currentStatsPath = typeof window !== 'undefined'
    ? window.location.pathname
    : '';
  const onYear2026Page = /\/minule-rocniky\/statistiky\/2026\/?$/.test(currentStatsPath);
  const statsItem = (href: string, label: string, isActive: boolean): string => {
    const cls = isActive ? 'reg-sidebar__item active' : 'reg-sidebar__item';
    return `<a class="${cls}" href="${href}">${escapeHtml(label)}</a>`;
  };
  const statsSection = `
    <div class="reg-sidebar__section">
      <h3 class="reg-sidebar__heading">${escapeHtml(t('reg.sidebar.heading_demographics'))}</h3>
      <nav class="reg-sidebar__items">
        ${statsItem(`${statsArchiveBase}/2026/`, t('reg.sidebar.year_2026'), onYear2026Page)}
        ${statsItem(`${statsArchiveBase}/`, t('reg.sidebar.all_stats'), false)}
      </nav>
    </div>
  `;

  aside.innerHTML = `${registrationSection}${infoSection}${listingSection}${statsSection}`;

  // Sidebar byl právě naplněn — toc-spy musí převzít nově přidané odkazy
  // s data-toc-link. Pokud toc-spy.ts nebyl na stránce naimportován (jiné
  // stránky než /registrace/), refresh tiše nic neudělá.
  if (typeof window !== 'undefined' && window.__ppTocSpyRefresh) {
    window.__ppTocSpyRefresh();
  }

  // Napoj klik handlery na sub-menu (registrace osoby)
  aside.querySelectorAll<HTMLButtonElement>('[data-target-key]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetKey = btn.dataset.targetKey ?? 'self';
      const target = targetsRes?.targets.find((t) => t.target_key === targetKey);
      if (!target || !me) return;
      void renderTargetFormStandalone(targetKey, slug);
    });
  });

  // Guest sidebar — scroll na login form, pokud je na current stránce.
  // Jinak (jiná stránka) necháme browser provést navigaci přes href.
  aside.querySelectorAll<HTMLAnchorElement>('[data-scroll-to]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.dataset.scrollTo ?? '';
      const target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Po scrollu zaměř email input pro rychlejší UX
        const emailInput = target.querySelector<HTMLInputElement>('input[name="email"]');
        if (emailInput) setTimeout(() => emailInput.focus(), 300);
      }
      // jinak: nech browser navigovat na cílovou URL (např. /cs/registrace/#reg-login)
    });
  });

  // Guest sidebar — "Vytvořit účet" → načti schema (pokud ještě není) a render guest form
  aside.querySelectorAll<HTMLButtonElement>('[data-sidebar-action="create-account"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      void openGuestRegistrationFromSidebar(slug);
    });
  });

  // Logged-in sidebar — odhlášení
  aside.querySelectorAll<HTMLButtonElement>('[data-sidebar-action="logout"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      void handleLogout(slug);
    });
  });
}

// Standalone vstupní bod ze sidebar — načte schema a vyrenderuje guest form
// (bez re-init celé app, šetří API call na /me).
async function openGuestRegistrationFromSidebar(slug: string): Promise<void> {
  const root = document.getElementById('registration-app');
  if (!root) return;
  root.innerHTML = '<div class="reg-loading">Načítám…</div>';
  const schema = await getEventSchema(slug);
  if (!schema) {
    root.innerHTML = '<div class="reg-error">Nepodařilo se načíst data. Refresh stránky.</div>';
    return;
  }
  renderGuestRegistrationForm(root, schema, slug);
}

async function handleLogout(slug: string): Promise<void> {
  const tr = getDomTranslator();
  const confirmed = await showConfirmDialog(tr('reg.logout.confirm_msg'), {
    title: tr('reg.logout.dialog_title'),
    confirmLabel: tr('reg.logout.dialog_confirm'),
    cancelLabel: tr('dialog.cancel'),
  });
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
  const tr = getDomTranslator();
  root.innerHTML = `<div class="reg-loading">${escapeHtml(tr('loading.generic'))}</div>`;

  const [me, schema, targets] = await Promise.all([
    getMe(),
    getEventSchema(slug),
    getMyTargets(slug),
  ]);
  if (!me || !schema || !targets) {
    root.innerHTML = `<div class="reg-error">${escapeHtml(tr('error.fetch_failed'))} ${escapeHtml(tr('error.refresh'))}</div>`;
    return;
  }
  const target = targets.targets.find((t) => t.target_key === targetKey);
  if (!target) {
    root.innerHTML = `<div class="reg-error">${escapeHtml(tr('error.target_not_found'))}</div>`;
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
  const tr = getDomTranslator();
  let confirmText = tr('reg.unregister.confirm_msg', { label });
  if (targetKey === 'self' && cascadeCount > 0) {
    confirmText += '\n\n' + (cascadeCount === 1
      ? tr('reg.unregister.cascade_warning_singular')
      : tr('reg.unregister.cascade_warning_plural', { n: cascadeCount }));
    confirmText += '\n' + tr('reg.unregister.group_note');
  }
  confirmText += '\n\n' + tr('reg.unregister.paid_note');
  const confirmed = await showConfirmDialog(confirmText, {
    title: tr('reg.unregister.dialog_title'),
    confirmLabel: tr('reg.unregister.dialog_confirm'),
    cancelLabel: tr('reg.unregister.dialog_cancel'),
    danger: true,
  });
  if (!confirmed) return;

  const res = await unregisterTarget(slug, me.csrf_token, targetKey);
  if (!res.ok) {
    await showAlertDialog(res.error?.message ?? tr('reg.unregister.error_msg'), {
      title: tr('reg.unregister.error_title'),
    });
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
  const renderer = new FormRenderer(host, schema, detectLangFromUrl() as Lang);
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
  // dlouhé hub stránky → scroll na sekci formuláře (ne až úplně nahoru),
  // aby viděl banner s tím, koho registruje, a začátek formulářových polí.
  scrollToFormSection(root);
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
  const renderer = new FormRenderer(host, schema, detectLangFromUrl() as Lang);
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
  const tr = getDomTranslator();
  const missing = renderer.getMissingRequiredAgreements();
  if (missing.length > 0) {
    status.textContent = tr('reg.guest.error.agreements_missing');
    status.style.color = '#f87171';
    return;
  }

  btn.disabled = true;
  status.textContent = tr('reg.guest.status.submitting');
  status.style.color = '';

  const res = await submitRegistration(slug, me.csrf_token, {
    form: renderer.getState(),
    agreements: renderer.getAgreements(),
    group: renderer.getGroup(),
    target: targetKey,
  });

  if (!res.ok || !res.data) {
    const err = res.error;
    const msg = err?.message || tr('reg.guest.error.submit_failed');
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
  status.textContent = tr('reg.guest.status.submitted');
  status.style.color = '#4ade80';
  setTimeout(() => {
    // Scroll na nadpis "Registrační formulář" — stejné chování jako po loginu,
    // ať uživatel vidí celý hub view od shora (nezůstane na submit buttonu).
    const formSection = document.getElementById('formular');
    if (formSection) {
      formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    void initRegistration(`#${root.id || 'registration-app'}`, slug);
  }, 1000);
}

function renderGuestPrompt(
  root: HTMLElement,
  schema: SchemaResponse,
  slug: string,
): void {
  const pwresUrl = `${REGISTRACKA_BASE}/pwres_${encodeURIComponent(slug)}.php`;

  const trL = getDomTranslator();
  root.innerHTML = `
    <fieldset class="reg-login-box" id="reg-login">
      <legend>${escapeHtml(trL('reg.login.box.legend'))}</legend>
      <div class="reg-login-box__intro">
        <p>${trL('reg.login.box.intro_p1')}</p>
        <p>${escapeHtml(trL('reg.login.box.intro_p2'))}</p>
        <p>${trL('reg.login.box.intro_p3')}</p>
        <p>${trL('reg.login.box.intro_p4')}</p>
        <p>${trL('reg.login.box.intro_p5')}</p>
        <p class="reg-login-box__note">${escapeHtml(trL('reg.login.box.intro_note'))}</p>
      </div>

      <div class="reg-login-box__row">
        <div class="reg-login-box__col reg-login-box__col--new">
          <h3 class="reg-login-box__col-title">${escapeHtml(trL('reg.login.box.col_new_title'))}</h3>
          <button
            type="button"
            class="reg-login-box__new-account"
            data-action="create-account"
            title="${escapeHtml(trL('reg.login.box.new_btn_title'))}"
          >
            ${escapeHtml(trL('reg.login.box.new_btn_label'))}
          </button>
        </div>

        <div class="reg-login-box__col reg-login-box__col--login">
          <h3 class="reg-login-box__col-title">${escapeHtml(trL('reg.login.box.col_login_title'))}</h3>
          <form class="reg-login-box__form" data-login-form>
            <div class="reg-login-box__field-row">
              <div class="reg-login-box__field">
                <label for="reg-login-email">${escapeHtml(trL('reg.login.box.email_label'))}</label>
                <input id="reg-login-email" name="email" type="email" autocomplete="email" required />
              </div>
              <div class="reg-login-box__field">
                <label for="reg-login-pw">${escapeHtml(trL('reg.login.box.password_label'))}</label>
                <input id="reg-login-pw" name="password" type="password" autocomplete="current-password" required />
              </div>
            </div>
            <div class="reg-login-box__buttons">
              <button type="submit" class="reg-btn reg-btn--primary" data-login-submit>${escapeHtml(trL('reg.login.box.submit'))}</button>
              <a class="reg-btn" href="${pwresUrl}" target="_blank" rel="noopener">${escapeHtml(trL('reg.login.box.forgot_pw'))}</a>
              <button type="reset" class="reg-btn" style="background: var(--color-bg-medium); color: var(--color-text-on-dark);">${escapeHtml(trL('reg.login.box.reset'))}</button>
            </div>
            <div class="reg-login-box__status" data-login-status></div>
          </form>
        </div>
      </div>
    </fieldset>
  `;

  const form = root.querySelector<HTMLFormElement>('[data-login-form]');
  const status = root.querySelector<HTMLElement>('[data-login-status]');
  const submitBtn = root.querySelector<HTMLButtonElement>('[data-login-submit]');

  if (form && status && submitBtn) {
    // Pojistka: pokud user otevřel sidebar drawer a klik na "Přihlásit"
    // způsobil scroll-lock na body (overflow:hidden), který se neuvolnil,
    // resetujeme ho — drawer už nemůže být otevřený v okamžiku focus
    // na login formu.
    const resetBodyScroll = (): void => {
      const drawerOpen = document.querySelector('[data-mobile-sidebar-drawer].is-open');
      if (!drawerOpen && document.body.style.overflow === 'hidden') {
        document.body.style.overflow = '';
      }
    };

    const doLogin = async (): Promise<void> => {
      const trLog = getDomTranslator();
      const fd = new FormData(form);
      const email = String(fd.get('email') ?? '').trim();
      const password = String(fd.get('password') ?? '');
      if (!email || !password) {
        status.textContent = trLog('reg.login.error.missing');
        status.style.color = '#f87171';
        return;
      }

      submitBtn.disabled = true;
      status.textContent = trLog('reg.login.status.logging_in');
      status.style.color = '';

      const res = await apiLogin(email, password);
      if (!res.ok) {
        const code = res.error?.code ?? 'unknown';
        const msg = res.error?.message ?? trLog('reg.login.error.failed');
        status.textContent = `${msg} [${code}]`;
        status.style.color = '#f87171';
        submitBtn.disabled = false;
        return;
      }

      // Login proběhl + token se uložil do localStorage (api-client.ts).
      // Další requesty se autentizují přes Authorization: Bearer.
      status.textContent = trLog('reg.login.status.logged_in');
      status.style.color = '#4ade80';
      // Po loginu vrátit uživatele na sekci s formulářem (#formular = h2
      // "Registrační formulář"). Bez tohoto by uživatel zůstal na pozici
      // login boxu, který je nahrazen hub view — vizuálně mate.
      const formSection = document.getElementById('formular');
      if (formSection) {
        formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      void initRegistration(`#${root.id || 'registration-app'}`, slug);
    };

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      resetBodyScroll();
      void doLogin();
    });

    // Záložní click listener na submit button — některé mobilní browsery
    // mohou form 'submit' event pohltit pokud user submituje přes touch
    // (např. po focus změnách klávesnice). Tento handler je idempotentní
    // se submit handlerem (disabled stav brání double-fire).
    submitBtn.addEventListener('click', (e) => {
      if (submitBtn.disabled) return;
      // Klasicka cesta přes form.requestSubmit() spustí validaci + submit event,
      // takže form handler proběhne. Pokud requestSubmit není dostupný (starší
      // browsery), spadne na manual fallback.
      if (typeof form.requestSubmit === 'function') {
        e.preventDefault();
        form.requestSubmit();
      }
      // Jinak nech native submit projít (form handler ho zachytí přes 'submit')
    });

    // Safety: focus na vstup → reset scroll lock pokud zůstal viset
    form.addEventListener('focusin', resetBodyScroll);
  }

  // Klik na „Nová registrace" → guest form view (Fáze 5)
  const newAccountBtn = root.querySelector<HTMLButtonElement>('[data-action="create-account"]');
  if (newAccountBtn) {
    newAccountBtn.addEventListener('click', () => {
      renderGuestRegistrationForm(root, schema, slug);
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

// === Fáze 5: Guest registrace (nový účet + registrace v jednom kroku) ========

// Renderuje formulář pro neregistrované návštěvníky. Sloučí 3 sekce:
//   1) přihlašovací údaje (email, heslo, heslo znovu)
//   2) osobní údaje (8 polí dle schema.personal.fields_def)
//   3) herní form + souhlasy + skupina (FormRenderer — stejně jako logged-in)
// + honeypot proti botům.
//
// Po úspěšném submitu vrátí backend 202 a uživateli se zobrazí inline success
// view s instrukcí kliknout na confirmation link v mailu.
function renderGuestRegistrationForm(
  root: HTMLElement,
  schema: SchemaResponse,
  slug: string,
): void {
  const trG = getDomTranslator();
  const personalFieldsHtml = schema.personal.fields_def
    .map((f) => renderPersonalFieldHtml(f))
    .join('');

  root.innerHTML = `
    <div class="reg-user-banner reg-user-banner--guest">
      <div class="reg-user-banner__main">
        <strong>${escapeHtml(trG('reg.guest.banner.creating'))}</strong>
        <span style="color: var(--color-text-on-dark-muted)">${escapeHtml(trG('reg.guest.banner.subtitle'))}</span>
      </div>
      <button type="button" class="reg-user-banner__edit-link" data-back-to-guest style="background:none;border:none;cursor:pointer;font:inherit;color:var(--color-gold-light);text-decoration:underline;">
        ${escapeHtml(trG('reg.guest.banner.back_to_login'))}
      </button>
    </div>

    <form class="reg-guest-form" data-guest-form novalidate>
      <fieldset class="reg-guest-form__section">
        <legend>${escapeHtml(trG('reg.guest.section.credentials'))}</legend>
        <div class="reg-field">
          <label class="reg-field__label reg-field__label--required" for="guest-email">${escapeHtml(trG('reg.guest.field.email'))}</label>
          <input class="reg-field__input" type="email" id="guest-email" name="email" autocomplete="email" required />
          <div class="reg-field__note">${escapeHtml(trG('reg.guest.field.email_note'))}</div>
        </div>
        <div class="reg-field">
          <label class="reg-field__label reg-field__label--required" for="guest-pw">${escapeHtml(trG('reg.guest.field.password'))}</label>
          <input class="reg-field__input" type="password" id="guest-pw" name="password" autocomplete="new-password" required minlength="8" />
          <div class="reg-field__note">${escapeHtml(trG('reg.guest.field.password_note'))}</div>
        </div>
        <div class="reg-field">
          <label class="reg-field__label reg-field__label--required" for="guest-pw2">${escapeHtml(trG('reg.guest.field.password2'))}</label>
          <input class="reg-field__input" type="password" id="guest-pw2" name="password2" autocomplete="new-password" required minlength="8" />
        </div>
      </fieldset>

      <fieldset class="reg-guest-form__section">
        <legend>${escapeHtml(trG('reg.guest.section.personal'))}</legend>
        ${schema.personal.info_html
          ? `<div class="reg-info-block">${schema.personal.info_html}</div>`
          : ''}
        ${personalFieldsHtml}
      </fieldset>

      <!-- Herní pole + souhlasy renderuje FormRenderer; ten si fieldsety
           dělá sám ("Registrace na akci" + "Doplňující informace…"). -->
      <div class="reg-form-host"></div>

      <!-- Honeypot — skrytý input, boti ho vyplní → server odmítne -->
      <div aria-hidden="true" style="position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;">
        <label>${escapeHtml(trG('reg.guest.honeypot_label'))} <input type="text" name="honeypot" tabindex="-1" autocomplete="off" /></label>
      </div>

      <div class="reg-submit-area">
        <div class="reg-submit-status" data-submit-status></div>
        <button class="reg-btn reg-btn--primary" type="submit" data-guest-submit>
          ${escapeHtml(trG('reg.guest.submit'))}
        </button>
      </div>
    </form>
  `;

  // Render game form + agreements + group (FormRenderer).
  // Pro guest flow prependujeme info_html s upozorněním na confirmation mail —
  // u logged-in registrace tento krok navíc neexistuje (mail rovnou s VS).
  const guestExtraInfo = `
    <div class="reg-guest-flow-extra">
      <strong>${escapeHtml(trG('reg.guest.flow_info.warning'))}</strong> ${trG('reg.guest.flow_info.body')}
    </div>
  `;
  const guestSchema: SchemaResponse = {
    ...schema,
    form: {
      ...schema.form,
      info_html: guestExtraInfo + (schema.form.info_html || ''),
    },
  };
  const host = root.querySelector('.reg-form-host') as HTMLElement;
  const renderer = new FormRenderer(host, guestSchema, detectLangFromUrl() as Lang);
  renderer.render();

  const form = root.querySelector<HTMLFormElement>('[data-guest-form]');
  const submitBtn = root.querySelector<HTMLButtonElement>('[data-guest-submit]');
  const status = root.querySelector<HTMLElement>('[data-submit-status]');

  if (form && submitBtn && status) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      void handleGuestSubmit(root, form, renderer, schema, slug, submitBtn, status);
    });
  }

  // Zpět na login form (= renderGuestPrompt)
  root.querySelectorAll<HTMLButtonElement>('[data-back-to-guest]').forEach((btn) => {
    btn.addEventListener('click', () => {
      renderGuestPrompt(root, schema, slug);
    });
  });

  scrollToFormSection(root);
}

// Scrollne k sekci formuláře — preferenčně k <section id="formular">
// (obsahuje h2 + divider + app root), pokud neexistuje, fallback na root.
// Místo window.scrollTo(0) — uživatel chce vidět formulář, ne hero stránky.
function scrollToFormSection(root: HTMLElement): void {
  const formSection = document.getElementById('formular');
  const target = formSection ?? root;
  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Renderuje jedno personal field — text/date/select dle definice.
// Labely + state options jdou přes lokalizační helpery z form-renderer.ts
// (form-schema/<lang>.personal). Fallback na API label, pokud klíč chybí.
function renderPersonalFieldHtml(f: PersonalFieldDef): string {
  const tr = getDomTranslator();
  const lang = detectLangFromUrl() as Lang;
  const id = `guest-personal-${f.name}`;
  const label = getLocalizedPersonalLabel(lang, f.name, f.label);
  const labelHtml = `<label class="reg-field__label reg-field__label--required" for="${id}">${escapeHtml(label)}</label>`;

  if (f.type === 'select' && f.options) {
    const opts = Object.entries(f.options)
      .map(([k, v]) => `<option value="${escapeHtml(k)}">${escapeHtml(getLocalizedPersonalOption(lang, f.name, k, v))}</option>`)
      .join('');
    return `
      <div class="reg-field">
        ${labelHtml}
        <select class="reg-field__select" id="${id}" name="personal.${f.name}" required>
          <option value="">${escapeHtml(tr('reg.select.placeholder'))}</option>
          ${opts}
        </select>
      </div>
    `;
  }

  const inputType = f.type === 'date' ? 'date' : 'text';
  return `
    <div class="reg-field">
      ${labelHtml}
      <input class="reg-field__input" type="${inputType}" id="${id}" name="personal.${f.name}" required />
    </div>
  `;
}

async function handleGuestSubmit(
  root: HTMLElement,
  form: HTMLFormElement,
  renderer: FormRenderer,
  schema: SchemaResponse,
  slug: string,
  submitBtn: HTMLButtonElement,
  status: HTMLElement,
): Promise<void> {
  const fd = new FormData(form);
  const email = String(fd.get('email') ?? '').trim().toLowerCase();
  const password = String(fd.get('password') ?? '');
  const password2 = String(fd.get('password2') ?? '');
  const honeypot = String(fd.get('honeypot') ?? '');

  // Personal — sesbírej do objektu (FormData klíče jsou "personal.<field>")
  const personal: Record<string, string> = {};
  for (const f of schema.personal.fields_def) {
    const v = fd.get(`personal.${f.name}`);
    personal[f.name] = v !== null ? String(v).trim() : '';
  }

  // Klientská validace — silnější fail-fast UX. Server stejně revaliduje.
  // Forma má `novalidate` → HTML5 native popup se nespustí, sbíráme VŠECHNY
  // chyby do jednoho seznamu + první chybové pole zafocusujeme až po zavření
  // modalu (UX flow: nejdřív přehled, pak nasměrování).
  const tr = getDomTranslator();
  const errors: string[] = [];
  let firstErrorFieldId: string | undefined;
  const noteError = (msg: string, fieldId?: string): void => {
    errors.push(msg);
    if (!firstErrorFieldId && fieldId) firstErrorFieldId = fieldId;
  };

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    noteError(tr('reg.guest.error.email_invalid'), 'guest-email');
  }
  if (password.length < 8) {
    noteError(tr('reg.guest.error.password_too_short'), 'guest-pw');
  } else if (!/[A-Za-zÀ-ž]/.test(password)) {
    noteError(tr('reg.guest.error.password_no_letter'), 'guest-pw');
  } else if (!/\d/.test(password)) {
    noteError(tr('reg.guest.error.password_no_digit'), 'guest-pw');
  } else if (password.toLowerCase() === email) {
    noteError(tr('reg.guest.error.password_equals_email'), 'guest-pw');
  }
  if (password !== password2) {
    noteError(tr('reg.guest.error.passwords_mismatch'), 'guest-pw2');
  }
  // Personal: sbírej VŠECHNY chybějící pole (ne jen první) — uživatel pak
  // v modalu vidí kompletní seznam, scrollne na první.
  for (const f of schema.personal.fields_def) {
    if (!personal[f.name]) {
      noteError(tr('reg.guest.error.field_required', { field: f.label }), `guest-personal-${f.name}`);
    }
  }
  const missingAgreements = renderer.getMissingRequiredAgreements();
  if (missingAgreements.length > 0) {
    // Agreements nemají stabilní ID — fallback na sekci hostující agreements.
    noteError(tr('reg.guest.error.agreements_missing'), undefined);
  }
  if (errors.length > 0) {
    status.textContent = '';
    await showRegistrationFeedback({
      kind: 'error',
      title: tr('reg.guest.modal.client_error_title'),
      message: tr('reg.guest.modal.client_error_msg'),
      errors,
    });
    // Modal zavřen → scroll + focus prvního chybového pole.
    focusFirstErrorField(firstErrorFieldId);
    return;
  }

  submitBtn.disabled = true;
  status.textContent = tr('reg.guest.status.submitting');
  status.style.color = '';

  const payload: GuestRegisterPayload = {
    email,
    password,
    personal,
    form: renderer.getState(),
    agreements: renderer.getAgreements(),
    group: renderer.getGroup(),
    honeypot,
    lang: detectLangFromUrl(),
  };

  const res = await registerGuest(slug, payload);
  if (!res.ok || !res.data) {
    const err = res.error;
    const headline = err?.message ?? tr('reg.guest.error.submit_failed');
    const detailErrors: string[] = [];
    let firstServerErrorFieldId: string | undefined;
    if (err?.details && typeof err.details === 'object') {
      for (const [key, val] of Object.entries(err.details)) {
        const label = humanizeRegFieldKey(key, schema);
        detailErrors.push(label ? `${label}: ${val}` : String(val));
        if (!firstServerErrorFieldId) {
          firstServerErrorFieldId = serverErrorKeyToFieldId(key);
        }
      }
    }
    status.textContent = '';
    submitBtn.disabled = false;
    await showRegistrationFeedback({
      kind: 'error',
      title: tr('reg.guest.modal.server_error_title'),
      message: headline,
      errors: detailErrors,
    });
    focusFirstErrorField(firstServerErrorFieldId);
    return;
  }

  // Úspěch — pod modalem nahraď formulář success view (zůstane viditelné, až
  // user modal zavře), pak ukaž zelený modal s pokyny.
  renderGuestSuccessView(root, res.data.email, schema, slug);
  await showRegistrationFeedback({
    kind: 'success',
    title: tr('reg.guest.modal.success_title'),
    message: tr('reg.guest.modal.success_msg', { email: res.data.email }),
  });
}

// Mapuje serverové chybové klíče (např. 'personal.firstname', 'form.side',
// 'email', 'password') na HTML id pole v guest formuláři. Vrací undefined pokud
// klíč není mapovatelný (např. agreement.*).
function serverErrorKeyToFieldId(key: string): string | undefined {
  if (key === 'email') return 'guest-email';
  if (key === 'password') return 'guest-pw';
  if (key.startsWith('personal.')) {
    return `guest-personal-${key.substring('personal.'.length)}`;
  }
  if (key.startsWith('form.')) {
    // FormRenderer používá id pattern `reg-field-${name}`.
    return `reg-field-${key.substring('form.'.length)}`;
  }
  return undefined;
}

// Scroll na první chybové pole + focus. Volá se AŽ po zavření feedback modalu,
// aby UX bylo: 1) modal s přehledem chyb, 2) klik OK, 3) navigace na první chybu.
function focusFirstErrorField(fieldId: string | undefined): void {
  if (!fieldId) return;
  const el = document.getElementById(fieldId);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  // Focus s mírnou prodlevou — necháváme smooth-scroll dojet, jinak focus()
  // znovu skočí na element bez animace a působí trhaně.
  setTimeout(() => {
    if (
      el instanceof HTMLInputElement ||
      el instanceof HTMLTextAreaElement ||
      el instanceof HTMLSelectElement
    ) {
      el.focus({ preventScroll: true });
    }
  }, 320);
}

// Převede klíč z error.details (např. 'personal.firstname', 'form.side',
// 'agreement.rules') na čitelný popis pole z aktuálního schématu.
function humanizeRegFieldKey(key: string, schema: SchemaResponse): string {
  const tr = getDomTranslator();
  if (key.startsWith('personal.')) {
    const fname = key.substring('personal.'.length);
    const f = schema.personal.fields_def.find((x) => x.name === fname);
    return f?.label ?? fname;
  }
  if (key.startsWith('form.')) {
    const fname = key.substring('form.'.length);
    const f = schema.form.fields.find((x) => x.name === fname);
    return (f as { label?: string } | undefined)?.label ?? fname;
  }
  if (key.startsWith('agreement.')) {
    return tr('reg.field.agreement');
  }
  if (key === 'email') return tr('reg.field.email');
  if (key === 'password') return tr('reg.field.password');
  return key;
}

interface RegFeedbackOptions {
  kind: 'success' | 'error';
  title: string;
  message: string;
  errors?: string[];
}

// Modal feedback pro guest registraci. Červený design pro error, zelený pro
// úspěch. Zavírá se přes × / OK / ESC / klik mimo. Vrací promise, která
// rezolvuje, jakmile uživatel modal zavře.
function showRegistrationFeedback(opts: RegFeedbackOptions): Promise<void> {
  return new Promise((resolve) => {
    const backdrop = document.createElement('div');
    backdrop.className = `reg-feedback-backdrop reg-feedback-backdrop--${opts.kind}`;
    backdrop.setAttribute('role', 'dialog');
    backdrop.setAttribute('aria-modal', 'true');
    backdrop.setAttribute('aria-labelledby', 'reg-feedback-title');

    const errorsHtml = opts.errors && opts.errors.length > 0
      ? `<ul class="reg-feedback__errors">${opts.errors.map((e) => `<li>${escapeHtml(e)}</li>`).join('')}</ul>`
      : '';
    const icon = opts.kind === 'success' ? '✓' : '!';

    backdrop.innerHTML = `
      <div class="reg-feedback reg-feedback--${opts.kind}">
        <button type="button" class="reg-feedback__close" aria-label="Zavřít" data-close>×</button>
        <header class="reg-feedback__header">
          <div class="reg-feedback__icon" aria-hidden="true">${icon}</div>
          <h2 class="reg-feedback__title" id="reg-feedback-title">${escapeHtml(opts.title)}</h2>
        </header>
        <p class="reg-feedback__msg">${escapeHtml(opts.message)}</p>
        ${errorsHtml}
        <div class="reg-feedback__actions">
          <button type="button" class="reg-feedback__ok" data-close>OK</button>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => backdrop.classList.add('is-open'));

    const close = (): void => {
      backdrop.classList.remove('is-open');
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKey);
      setTimeout(() => {
        backdrop.remove();
        resolve();
      }, 200);
    };
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape' || e.key === 'Enter') {
        e.preventDefault();
        close();
      }
    };
    document.addEventListener('keydown', onKey);
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) close();
    });
    backdrop.querySelectorAll<HTMLElement>('[data-close]').forEach((b) => {
      b.addEventListener('click', close);
    });
  });
}

// Inline success view po úspěšném submitu guest registrace.
// User musí kliknout na link v mailu → spustí add_user_PP2026.php na registračce.
function renderGuestSuccessView(
  root: HTMLElement,
  email: string,
  schema: SchemaResponse,
  slug: string,
): void {
  const contactEmail = schema.event.contact_email || 'info@panprstenu.cz';
  root.innerHTML = `
    <div class="reg-success reg-success--pending-confirm">
      <h2>📧 Podívej se do schránky</h2>
      <p>
        Poslali jsme ti potvrzovací e-mail na <strong>${escapeHtml(email)}</strong>.
        Klikni v něm na odkaz pro dokončení registrace.
      </p>
      <p class="reg-success__note">
        Pokud do 5 minut nedorazí, zkontroluj <strong>SPAM</strong> složku.
        Nebo nám napiš na <a href="mailto:${escapeHtml(contactEmail)}">${escapeHtml(contactEmail)}</a>.
      </p>
      <div style="margin-top: 1.5rem;">
        <button type="button" class="reg-btn" data-back-to-guest-prompt>← Zpět na úvod</button>
      </div>
    </div>
  `;

  root.querySelectorAll<HTMLButtonElement>('[data-back-to-guest-prompt]').forEach((btn) => {
    btn.addEventListener('click', () => {
      void initRegistration(`#${root.id || 'registration-app'}`, slug);
    });
  });
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
