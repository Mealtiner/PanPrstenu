# Hand-off: Registračka MVP — stav k 2026-05-12

> Tento dokument shrnuje vícedenní práci na **registračním flow + výpisech + statistikách** pro PP2026. Slouží jako vstupní kontext pro další vlákno.

---

## 1. Co bylo dnes hotové

### Fáze 3 → 5 registračního MVP (commitnuté: 84064ce, ostatní WIP)

| Vrstva | Stav |
|---|---|
| Fáze 3 — Dynamický formulář z API | ✅ commit `6a43b6c` |
| Fáze 4 — Submit + hub view + rodina/skupina | ✅ commit `84064ce` |
| Fáze 4.5 — Affiliated cascade, family cap | ✅ commit `84064ce` |
| Fáze 5 — Guest registrace | ✅ WIP (uncommitted) |
| Výpisy přihlášených (6 stránek) | ✅ WIP |
| Statistiky (15+ grafů) | ✅ WIP |

### Klíčové funkce

- **Sloučená stránka `/cs/registrace/`** — landing + formulář v jednom (`/registrace/formular/` redirect na `#formular`)
- **Sidebar** (MobileSidebarShell + initRegistrationSidebar) — sekce **Registrace** / **Informace** / **Výpisy** / **Statistiky**, scroll-spy, sticky pod hlavičkou, mobile drawer
- **6 stránek výpisů**: celkovy, svobodne-narody, sily-temneho-pana, zoldaci, nehrajici, detska-hra (dynamic route `[typ].astro`)
- **Statistiky** stránka s TOC navigací do 8 sekcí
- **Custom modal dialog** ([dialog.ts](../src/scripts/registration/dialog.ts)) — nahrazuje `window.confirm/alert`
- **Loading spinner** — zlatý rotující prsten (vanilla CSS)
- **Bearer token auth** pro mobile (cross-site cookies blokovány iOS Safari ITP)
- **WCAG 2.2 AA audit** všech barev grafů (≥4.5:1 white text uvnitř segmentu)

---

## 2. Stav repa

**Větev:** `main`  
**Posledný commit:** `84064ce feat(registrace): Fáze 4`  
**Necommitnuto:** mnoho změn (Fáze 5 + výpisy + statistiky + bug fixy)

```
M  .claude/settings.json
M  src/components/blocks/MobileSidebarShell.astro
M  src/content/pages/frakce/cs.json
M  src/data/translation-status.json
M  src/pages/[lang]/frakce/index.astro
M  src/pages/[lang]/registrace/formular.astro
M  src/pages/[lang]/registrace/index.astro
M  src/scripts/mobile-sidebar.ts
M  src/scripts/registration/api-client.ts
M  src/scripts/registration/form-renderer.ts
M  src/scripts/registration/index.ts
M  src/scripts/registration/types.ts
M  src/scripts/toc-spy.ts
M  src/styles/registration.css
?? public/images/registrace/drak.svg
?? src/pages/[lang]/registrace/statistiky.astro
?? src/pages/[lang]/registrace/vypisy/[typ].astro
?? src/scripts/registration/dialog.ts
?? src/scripts/registration/statistiky.ts
?? src/scripts/registration/vypis.ts
```

**Backend** (mimo repo, FTP upload na registracka.cz, NEsledováno v gitu):
- `Registračka/api/v1/_internal/auth.php` — Bearer token + CSRF
- `Registračka/api/v1/_internal/bootstrap.php` — CORS Authorization header
- `Registračka/api/v1/_internal/mailer.php` — `api_get_mail_localized()`
- `Registračka/api/v1/auth/login.php` — vrací `session_token`
- `Registračka/api/v1/events/register-guest.php` — guest registrace + heslo policy + lang
- `Registračka/api/v1/events/register.php` — beze změn
- `Registračka/api/v1/events/participants.php` — UNION self + affiliated + pending, COALESCE pro rodinnou platbu
- `Registračka/api/v1/events/my-targets.php` — rodinná platba cascade
- `Registračka/api/v1/events/stats.php` — **nový endpoint** s 15+ agregacemi
- `Registračka/api/v1/.htaccess` — Authorization header propagation + routing pro `/stats`

---

## 3. Deploy workflow

**Frontend:**
```bash
npm run build
# → dist/ → sync do public_html/ + public_html_new/
```

**Upload (uživatel manuálně přes FTP):**
1. `public_html_new/` → SFTP `new.panprstenu.cz` (jail `/home/html/panprstenu.cz/_sub/new/`)
2. PHP soubory v `Registračka/api/v1/` → `registracka.cz`

**Důležité:**
- `Registračka/` je v `.gitignore` (legacy PHP s DB creds)
- Production main → auto-deploy na `new.panprstenu.cz` (GitHub Action). Ale jen FE — backend na registracka.cz uploaduje user manuálně.

---

## 4. Klíčové architektonické rozhodnutí

### Bearer token authentication (kritické pro mobile)

iOS Safari + Chrome (oba WebKit) **blokují cross-site cookies** mezi `new.panprstenu.cz` ↔ `registracka.cz`, i s `SameSite=None; Secure`. Řešení:

- BE login.php vrací `session_token` v JSON
- FE [api-client.ts](../src/scripts/registration/api-client.ts) ukládá do `localStorage` (`pp_reg_session_token`), posílá v `Authorization: Bearer <token>` header
- BE `api_current_user()` ([auth.php](../Registračka/api/v1/_internal/auth.php)) preferuje Bearer před session cookies
- `api_require_csrf()` skipuje CSRF check pro Bearer auth (Bearer není auto-submited browser → CSRF útok nemožný)
- Apache `.htaccess` má `RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]` (Apache někdy stripuje header)
- CORS `Allow-Headers` obsahuje `Authorization`

**Gotcha v `request()` v api-client.ts:** spread `...options` musí být PŘED `headers:` blokem, jinak `options.headers` přepíše Authorization!

### Rodinná platba (cascade)

Legacy admin UI ([PP2026_vypis.php:183](../Registračka/PP2026/PP2026_vypis.php#L183)) updatuje `PP2026.payed` jen pro 1 řádek. Pokud admin označil sebe jako zaplaceno, affiliated zůstali s `payed=NULL`.

**Fix bez legacy code editu:** v participants.php (SQL `COALESCE`) a my-targets.php (PHP post-processing) — affiliated `payed` fallback na `owner_self.payed`.

### MySQL collation mismatch

Tabulky `test_users`, `affiliates`, `PP2026` mají různé charsety (latin1 vs utf8). UNION s literály selhával: *"Illegal mix of collations"*.

**Fix:** všechny VARCHAR sloupce v UNION obaleny `CONVERT(... USING utf8)`. Aplikováno v `participants.php` a `stats.php`.

### Sloupce pohlaví

| Tabulka | Sloupec |
|---|---|
| `test_users` | `gender` (1=M, 2=F, 3=jiné) |
| `affiliates` | `sex` (1=M, 2=F, 3=jiné) |

Stats endpoint vrací oba normalizované na `male/female/unknown` přes `api_stats_sex()`.

### Sticky sidebar — gotcha

Sticky funguje jen pokud **parent grid je vyšší než sidebar**. Na krátkých stránkách (vypis s 1 tabulkou) musí mít grid `lg:min-h-[calc(100vh-12rem)]`, jinak sticky se neaktivuje.

### Mobile sidebar event delegation

Sidebar je naplňován **dynamicky** (po async fetchi /me + /schema). Mobile-sidebar.ts používá **event delegation** na drawer parent (ne na linkách), aby fungoval i na dynamicky přidaných linkách.

### TocSpy refresh

[toc-spy.ts](../src/scripts/toc-spy.ts) exportuje `window.__ppTocSpyRefresh()` které se volá z renderSidebar po naplnění aside.innerHTML.

---

## 5. URL struktura

| URL | Účel |
|---|---|
| `/<lang>/registrace/` | Sloučená stránka — landing + formulář (8 sekcí: jdeme-na-to, jak-to-probiha, formular, podminky-ucasti, platba, gdpr, …) |
| `/<lang>/registrace/formular/` | Meta-refresh redirect na `/registrace/#formular` |
| `/<lang>/registrace/vypisy/[typ]/` | 6 typů: celkovy, svobodne-narody, sily-temneho-pana, zoldaci, nehrajici, detska-hra |
| `/<lang>/registrace/statistiky/` | 8 sekcí grafů (anchory: prehled, strany-a-armady, vek, pohlavi, zbrane, druziny, prijezdy, extremy) |

Languages: `cs / en / de / sk / uk` (`uk` = ukrajinština, fallback CS).

---

## 6. Klíčové soubory

### Frontend

| Soubor | Účel |
|---|---|
| [src/scripts/registration/index.ts](../src/scripts/registration/index.ts) | Hlavní entry, sidebar, hub view, registrace target, login |
| [src/scripts/registration/api-client.ts](../src/scripts/registration/api-client.ts) | Fetch + Bearer token storage |
| [src/scripts/registration/form-renderer.ts](../src/scripts/registration/form-renderer.ts) | Form fields render + section split (primary / secondary fieldsets) |
| [src/scripts/registration/dialog.ts](../src/scripts/registration/dialog.ts) | Custom confirm/alert modal |
| [src/scripts/registration/vypis.ts](../src/scripts/registration/vypis.ts) | Render výpisových tabulek |
| [src/scripts/registration/statistiky.ts](../src/scripts/registration/statistiky.ts) | Render statistických grafů (vanilla SVG/CSS) |
| [src/scripts/registration/types.ts](../src/scripts/registration/types.ts) | TS typy pro API |
| [src/styles/registration.css](../src/styles/registration.css) | Všechny styly registrace + výpisů + statistik |
| [src/scripts/toc-spy.ts](../src/scripts/toc-spy.ts) | ScrollSpy s `window.__ppTocSpyRefresh` |
| [src/scripts/mobile-sidebar.ts](../src/scripts/mobile-sidebar.ts) | Drawer toggle (event delegation) |

### Backend

| Soubor | Účel |
|---|---|
| `Registračka/api/v1/_internal/auth.php` | `api_current_user()` s Bearer fallback, `api_get_bearer_token()`, CSRF skip pro Bearer |
| `Registračka/api/v1/_internal/bootstrap.php` | CORS s Authorization header, session config SameSite=None |
| `Registračka/api/v1/_internal/mailer.php` | `api_get_mail_localized()` pro CS/EN/DE/SK/UK |
| `Registračka/api/v1/events/stats.php` | **Nový** endpoint s aggregacemi |
| `Registračka/api/v1/.htaccess` | Authorization header pass-through, routing |

---

## 7. Statistiky — co je hotové

8 anchorovaných sekcí na `/registrace/statistiky/`:

1. **Přehled** — karty počtů (Celkem, Svobodné, Síly Temna, Žoldáci, Nehrající, Dětská hra) + věkové statistiky (Průměr, Medián, Nejčastější, Nejmladší, Nejstarší) + Young Adult 18–25 + Extrémy summary
2. **Strany a armády** — Koláč podle stran, Koláč Svobodných (4 armády), Koláč Sil Temna (4 armády), bary armád, Shannon evenness
3. **Věkové statistiky** — Průměrný věk per strana, Generační složení (Pew Research: Gen Alpha / Z / Mil / X / Boomer), Věková pyramida Svobodné vs Síly (per 1 rok, popisky každých 5 let), Pyramidový selektor 2 libovolných armád, Dětské věkové kategorie
4. **Pohlaví** — Pohlaví per strana (split bar), Pohlaví × Zbraň (mosaic + Cramérovo V + deviation), Pohlaví × Role nehrajícího (mosaic + Cramérovo V)
5. **Zbraně a vybavení** — Distribuce zbraní per strana (stacked), Zbraň × věk heatmapa
6. **Skupiny a družiny** — Velikost skupin + Gini coefficient, Lorenzova křivka, Simpson Diversity Index (top 10 kosmopolitních družin)
7. **Příjezdy a logistika** — Příjezdová vlna (area chart, kumulativní), Registrační křivka v čase (CDF + denní přírůstky)
8. **Extrémy a zajímavosti** — 5 nejmladších + 5 nejstarších (anonymně, jen věk + strana)

**Technika:** vanilla SVG/CSS (žádné chart-library), všechny barvy přes CSS vars (theme-aware), WCAG AA kontrasty.

---

## 8. Otevřené úkoly (nice to have)

Z agentích nápadů (3× agent: statistik / demograf / sociolog) — **co ještě by se dalo přidat** (uživatel zatím nepožádal):

### MUST (organizační hodnota)
- **Logistický dashboard** — Sankey: auto × den × mazlíček × s dětmi → parkovací kapacita, dětské pásky
- **Volunteer pool capacity** — UpSet plot ochotných pomoct (pomocník/zdravotník/CP/donátor)
- **Závislostní poměr** (Dependency ratio: děti+senioři / produktivní)

### NICE
- **Generační kompozice + family clusters** — rodičovství × věk
- **Senior representation** (45+ breakdown)
- **Civic engagement** per side (mol/donátor/zdravotník korelace s frakcí)
- **Accessibility footprint** (treemap zdravotních omezení)
- **Mobility footprint** (auta per skupina × den)
- **Outlier scatter** (věk × datum registrace)

### Co by uživatel mohl zpřesnit
- Email lokalizace v BE pro EN/DE/SK/UK pro **logged-in** registraci (aktuálně jen guest)
- Test guest registračního flow end-to-end na live (po confirmation linku)
- i18n překlady stránek vypisy + statistiky (zatím jen CS hardcoded)

---

## 9. Známé gotchas / poznámky pro další iteraci

1. **`Registračka/` je gitignored** — backend PHP žije mimo repo, user uploaduje manuálně. Editovat smí jen `Registračka/api/v1/`, legacy PHP v `Registračka/PP2026/*.php` se NEditujou.

2. **Deploy targets:**
   - Build vždy → `dist/` → `public_html/` + `public_html_new/`
   - User uploaduje **jen public_html_new/** na new.panprstenu.cz
   - Live `panprstenu.cz` se NEpouži — jen new (Memory: `feedback_deploy_targets`)

3. **`?debug=1` parameter** — participants.php a stats.php podporují, vrátí MySQL chyby v JSON. Užitečné pro debug po failed deployi.

4. **Mobile-first responsive** — všechny grafy mají `@media (max-width: 768px)` přepínač, většinou stack místo grid 2-col.

5. **CSS variables theme-aware** — `var(--color-side-free)` se mění mezi dark a light, hardcoded HEX se nemění. Statistiky.ts SIDE_COLORS používají CSS vars s fallbackem.

6. **Numerické klíče v schema:** PP2026 `side` má klíče `"1"`–`"5"` (string), ne slugy. Stejně `nar` `"1"`–`"8"`. Konstanty v vypis.ts/statistiky.ts:
   ```
   SIDE_FREE='1', SIDE_EVIL='2', SIDE_MERC='3', SIDE_NONPLAY='4', SIDE_KIDS='5'
   ```

7. **Affiliated registrace** v PP2026: `userid < 0`, `-userid = affiliates.id`. Vyžaduje UNION nebo conditional JOIN.

8. **Pending guest registrace** v `temp_users` + `tmp_PP2026`, spojené přes `identifajr = md5(email)`. SHOW TABLES check zda `tmp_<event>` existuje (nemusí, pokud nikdy nebyla guest reg).

9. **Sticky sidebar nefunguje** pokud parent grid je krátký. Vyžaduje `lg:min-h-[calc(100vh-12rem)]` na grid.

10. **TS errors / linter warnings** — IDE ukazuje warnings o canonical Tailwind tříd (`bg-[var(--x)]` → `bg-(--x)`). Konzistentně **ignorovány** (zbytek repa používá starý format).

---

## 10. Memory snapshots (auto-memory)

Klíčové paměti uložené během práce:
- `feedback_deploy_targets.md` — deploy jen na new/, nikdy live
- `feedback_test_instructions.md` — po změnách specifikovat URL/curl/snippet
- `project_repo_structure.md` — Astro 6 + Tailwind 4, deploy přes WebGlobe SFTP

Pro nové vlákno: spustit `Read /Users/mealtiner/.claude/projects/-Users-mealtiner-GIT-PanPrstenu/memory/MEMORY.md` pro index všech pamětí.

---

**Stav k 2026-05-12 ~13:00**
