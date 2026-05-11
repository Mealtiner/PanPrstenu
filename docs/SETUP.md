# SETUP — Finální nastavení projektu Pán Prstenů

> **Účel:** Tento dokument tě provede od aktuálního stavu (kód MVP hotový, dokumenty sjednocené) k funkčnímu deploye. Po dokončení budeš mít:
> - Lokálně běžící dev server
> - GitHub repo s ochranou main větve
> - Automatický deploy na `dev.panprstenu.cz` a `new.panprstenu.cz`
> - Setup pro každodenní práci v Claude Code
>
> **Předpoklady:** Subdomény vytvořené, FTP účty (`dev@`, `new@`) připravené, máš osobní GitHub account.
>
> **Odhad času:** 30–60 minut čisté práce, podle toho, kolik z toho už máš.

---

## ⚙️ Část 0 — Příprava prostředí (5 min)

### 0.1 Ověř Node.js

V terminálu VS Code:

```bash
node --version
# Mělo by být v22.22.2 nebo vyšší (minimum 22.12.0)
```

Pokud máš starší Node, použij **nvm**:

```bash
# Pokud nvm nemáš, instalace:
# macOS/Linux:
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash

# Restartuj terminál, pak:
nvm install 22.22.2
nvm use 22.22.2
nvm alias default 22.22.2
```

### 0.2 Ověř Git

```bash
git --version
# Mělo by být 2.30+
```

### 0.3 GitHub CLI (volitelně, ale doporučeno)

```bash
# macOS:
brew install gh

# Linux (Debian/Ubuntu):
sudo apt install gh

# Ověř:
gh --version
```

### 0.4 Nastav Git identitu (pokud nemáš)

```bash
git config --global user.name "Tvé Jméno"
git config --global user.email "info@jrdm.cz"  # nebo email z GitHubu
```

---

## 🧹 Část 1 — Lokální úklid a build (10 min)

### 1.1 Jdi do projektu

```bash
cd ~/cesta/k/PanPrstenu  # uprav podle své reálné cesty
pwd  # ověř, že jsi v rootu projektu
ls  # měl bys vidět: CLAUDE.md, HANDOFF.md, README.md, package.json, src/, ...
```

### 1.2 Pokud existují, smaž `web/dev/` a `web/new/`

V minulé iteraci Claude Code v handoffu vytvořil prázdné placeholdery `web/dev/.gitkeep` a `web/new/.gitkeep`. CLAUDE.md §9 to ale zakazuje (deploy targety jsou na FTP, ne v repu). Smaž je:

```bash
rm -rf web/
```

### 1.3 Ověř `.gitignore`

Otevři `.gitignore` ve VS Code a ověř, že obsahuje minimálně:

```
# Dependencies
node_modules/

# Build outputs
dist/
.astro/
.output/

# Environment
.env
.env.local
.env.*.local

# Logs
*.log
npm-debug.log*

# OS
.DS_Store
Thumbs.db

# Editor
.vscode/settings.json.local
.idea/
*.swp

# TypeScript
*.tsbuildinfo

# Web build mirrors (zakázané CLAUDE.md §9)
web/

# Misc
*.bak
*.backup
coverage/
```

Pokud něco chybí, doplň.

### 1.4 Vytvoř `.editorconfig` (konzistence formátování)

```bash
cat > .editorconfig << 'EOF'
# .editorconfig — konzistentní formátování napříč editory
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true
indent_style = space
indent_size = 2

[*.md]
trim_trailing_whitespace = false

[*.{yml,yaml}]
indent_size = 2

[Makefile]
indent_style = tab
EOF
```

### 1.5 Vytvoř `.vscode/settings.json` (project-level VS Code config)

```bash
mkdir -p .vscode
cat > .vscode/settings.json << 'EOF'
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.tabSize": 2,
  "editor.insertSpaces": true,

  "files.eol": "\n",
  "files.trimTrailingWhitespace": true,
  "files.insertFinalNewline": true,

  "[astro]": {
    "editor.defaultFormatter": "astro-build.astro-vscode"
  },
  "[markdown]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.wordWrap": "on"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },

  "tailwindCSS.includeLanguages": {
    "astro": "html"
  },
  "tailwindCSS.experimental.classRegex": [
    ["class:list=\\{([^}]*)\\}", "['\"`]([^'\"`]*)['\"`]"]
  ],

  "errorLens.enabledDiagnosticLevels": ["error", "warning"],
  "errorLens.excludeBySource": ["cSpell"],

  "git.autofetch": true,
  "git.confirmSync": false,
  "git.suggestSmartCommit": false,

  "github-actions.workflows.pinned.workflows": [
    ".github/workflows/deploy-staging.yml",
    ".github/workflows/deploy-production.yml"
  ],

  "cSpell.language": "en,cs",
  "cSpell.words": [
    "panprstenu",
    "Středozem",
    "Tolkien",
    "Tolkienova",
    "Moravian",
    "LARP",
    "Astro",
    "Tailwind",
    "WebGlobe",
    "frakce",
    "frakcí",
    "pergamen",
    "Cinzel",
    "Cormorant",
    "Sveltia",
    "MDX",
    "Vite",
    "Strážovice",
    "Středozemě",
    "galonech",
    "galonešský",
    "Iconify",
    "noindex",
    "Prettier",
    "Lucide",
    "JRDM"
  ],
  "cSpell.ignorePaths": [
    "node_modules/**",
    "dist/**",
    ".astro/**",
    "grafika/**",
    "package-lock.json",
    "*.log"
  ]
}
EOF
```

### 1.6 Nainstaluj závislosti

```bash
npm install
```

> **Pozn:** První `npm install` trvá 1-2 minuty. Vygeneruje `package-lock.json`, který musíme commitnout.

### 1.7 Ověř, že build projde

```bash
npm run build
```

Mělo by skončit zhruba takto:
```
✓ build completed in XX.XXs
```

Pokud build selže, **ZASTAV SE** — zkopíruj error a vyřeš ho v Claude Code v dalším vlákně. Bez funkčního buildu nemá smysl pokračovat na deploy.

### 1.8 Vyzkoušej dev server

```bash
npm run dev
```

Otevři **http://localhost:4321** v prohlížeči — měl by tě přesměrovat na `/cs/` a zobrazit landing page.

Když to vidíš, zavři dev server (`Ctrl+C` v terminálu).

---

## 🐙 Část 2 — GitHub repo a první commit (10 min)

### 2.1 Inicializuj Git

```bash
git init
git branch -M main
```

### 2.2 První commit

```bash
git add .
git commit -m "feat: M2 MVP scope — Astro 6.1 + Tailwind 4.2 + 2 deploy prostředí

- kompletní kostra projektu (10 UI + 5 dekorativních + 7 bloků + 8 sekcí)
- 13 routes (vč. frakce/[slug] s 28 detaily: 4 jazyky × 7 frakcí)
- 4-jazyčný i18n (cs primární)
- design tokeny v global.css podle 12 mockupů
- GitHub Actions: deploy-staging + deploy-production s noindex
- CLAUDE.md jako závazný zdroj pravidel
- HANDOFF.md v3.0, README.md v0.3.0"
```

### 2.3 Vytvoř staging větev

```bash
git checkout -b staging
git checkout main
```

### 2.4 Vytvoř GitHub repo

#### Možnost A — Přes GitHub CLI (rychlejší)

```bash
# Pokud ještě nejsi přihlášený:
gh auth login
# Vyber: github.com → SSH (preferované) nebo HTTPS → ano (autorizovat) → web (autorizace v prohlížeči)

# Vytvoř repo a pushni
gh repo create panprstenu-web \
  --private \
  --description "Pán Prstenů — Bitva o Středozem (Moravian LARP, z. s.)" \
  --source=. \
  --remote=origin \
  --push

# Push i staging větve
git push -u origin staging
```

#### Možnost B — Přes web

1. Otevři https://github.com/new
2. Repository name: `panprstenu-web`
3. Description: `Pán Prstenů — Bitva o Středozem (Moravian LARP, z. s.)`
4. Visibility: **Private**
5. NEZAŠKRTÁVEJ "Add README" / .gitignore / license
6. **Create repository**

Pak v terminálu:

```bash
# Nahraď TVUJ-USERNAME svým GitHub jménem
git remote add origin git@github.com:TVUJ-USERNAME/panprstenu-web.git
# Nebo HTTPS varianta:
# git remote add origin https://github.com/TVUJ-USERNAME/panprstenu-web.git

git push -u origin main
git push -u origin staging
```

### 2.5 Ověř, že máš obě větve na GitHubu

```bash
gh repo view --web
# Otevře repo v prohlížeči — měl bys vidět main + staging větve
```

---

## 🔑 Část 3 — GitHub Secrets (5 min)

GitHub potřebuje znát FTP credentials, aby mohl uploadovat. Uložíme je jako **šifrované secrets** — neviditelné v kódu, viditelné jen v běžícím workflow.

### 3.1 Přes GitHub CLI (rychlejší)

```bash
# Spusť tento blok najednou — nahraď hesla správnými hodnotami z WebGlobe
gh secret set WEBGLOBE_FTP_HOST --body "62.109.151.48"
gh secret set WEBGLOBE_FTP_DEV_USERNAME --body "dev@panprstenu.cz"
gh secret set WEBGLOBE_FTP_DEV_PASSWORD --body "PP_dev-2026"
gh secret set WEBGLOBE_FTP_DEV_PATH --body "/"
gh secret set WEBGLOBE_FTP_NEW_USERNAME --body "new@panprstenu.cz"
gh secret set WEBGLOBE_FTP_NEW_PASSWORD --body "PP_new-2026"
gh secret set WEBGLOBE_FTP_NEW_PATH --body "/"

# Ověř, že máš všech 7
gh secret list
```

### 3.2 Nebo přes web

Otevři: `Settings` → `Secrets and variables` → `Actions` → `New repository secret`.

Vytvoř těchto 7 secrets podle tabulky:

| Name | Value |
|---|---|
| `WEBGLOBE_FTP_HOST` | `62.109.151.48` |
| `WEBGLOBE_FTP_DEV_USERNAME` | `dev@panprstenu.cz` |
| `WEBGLOBE_FTP_DEV_PASSWORD` | `PP_dev-2026` |
| `WEBGLOBE_FTP_DEV_PATH` | `/` |
| `WEBGLOBE_FTP_NEW_USERNAME` | `new@panprstenu.cz` |
| `WEBGLOBE_FTP_NEW_PASSWORD` | `PP_new-2026` |
| `WEBGLOBE_FTP_NEW_PATH` | `/` |

> **Doporučení:** Po prvním úspěšném deployi **změň hesla na WebGlobe** na něco silnějšího (12+ znaků, generovaná) a zaktualizuj secrets. Hesla `PP_dev-2026` a `PP_new-2026` jsou triviální.

---

## 🛡️ Část 4 — Branch protection (3 min)

Aby ti nikdo (ani ty omylem) nepushnul přímo do `main`:

### 4.1 Přes GitHub CLI

```bash
# Aktivuj branch protection na main
gh api -X PUT \
  repos/:owner/panprstenu-web/branches/main/protection \
  -f required_pull_request_reviews[required_approving_review_count]=0 \
  -F enforce_admins=false \
  -F required_status_checks=null \
  -F restrictions=null
```

### 4.2 Nebo přes web

1. Repo → **Settings** → **Branches** → **Add classic branch protection rule**
2. Branch name pattern: `main`
3. ✅ Require a pull request before merging
4. (Volitelně: ✅ Require approvals — ale pokud jsi sólo, nech vypnuté)
5. **Create**

---

## 🚀 Část 5 — První deploy (5 min, moment pravdy)

### 5.1 Push do staging → deploy na DEV

```bash
git checkout staging
git merge main  # přebereš změny z mainu (pokud jsou)
git push origin staging
```

### 5.2 Sleduj deploy

```bash
# Přes CLI:
gh run watch

# Nebo otevři Actions tab v prohlížeči:
gh repo view --web
# klik na "Actions" → "Deploy — STAGING (dev)" → klik na běžící job
```

### 5.3 Co se má stát

Workflow **„Deploy — STAGING (dev)"** projde 5 kroky (~2-3 min):

1. ✅ Checkout repozitáře
2. ✅ Setup Node 22.22.2
3. ✅ `npm ci` (instalace závislostí)
4. ✅ `npm run build` (Astro build)
5. ✅ FTP upload `dist/` → WebGlobe `/dev/`

### 5.4 Ověř

Otevři **https://dev.panprstenu.cz** v prohlížeči. Měl bys vidět landing page s českým obsahem.

Klik pravým → **Zobrazit zdroj stránky** → vyhledej `<meta name="robots"`. Na DEV by tam **nemělo být `noindex`** (jen na NEW).

### 5.5 Pokud workflow zčervená

Zkopíruj error log z GitHub Actions a otevři Claude Code ve VS Code. Pošli mu error a CLAUDE.md context — vyřeší to.

Nejčastější problémy:

| Error | Příčina | Řešení |
|---|---|---|
| `EAI_AGAIN`, `ENOTFOUND` | Špatný FTP host | Zkontroluj `WEBGLOBE_FTP_HOST` |
| `530 Login authentication failed` | Špatné username/password | V username MUSÍ být `@panprstenu.cz` |
| `550 Permission denied` | Špatná cesta | Cesta MUSÍ být `/` (jail účtu) |
| FTPS handshake failed | WebGlobe blokuje FTPS | V workflow zkus `protocol: ftp`, `port: 21` |
| `npm ci` selže s lock-file mismatch | Out-of-sync lock | Lokálně `npm install`, commit `package-lock.json` |

---

## 🎯 Část 6 — Push do main → deploy na NEW (3 min)

### 6.1 Vytvoř Pull Request

```bash
# Přes GitHub CLI (nejrychlejší)
gh pr create \
  --base main \
  --head staging \
  --title "Initial deploy: M2 MVP scope" \
  --body "First deploy. Veškerý kód je hotový, deploy testovaný na DEV."

# Po schválení mergni
gh pr merge --merge --delete-branch=false
```

Po mergi se automaticky spustí **Deploy — NEW (preprod)** workflow.

### 6.2 Sleduj a ověř

```bash
gh run watch
```

Po dokončení otevři **https://new.panprstenu.cz**. Měl bys vidět to samé jako na DEV.

Klik pravým → **Zobrazit zdroj stránky** → vyhledej `<meta name="robots"`. Na NEW **MUSÍ být `<meta name="robots" content="noindex, nofollow">`** — to zaručuje, že to Google nenaindexuje.

### 6.3 Vrať se na staging

```bash
git checkout staging
git merge main  # synchronizuj
git push origin staging
```

---

## 🔄 Část 7 — Každodenní workflow (jak budeš pracovat)

### Scénář 1: Drobná úprava textu nebo komponenty

```bash
# 1. Vždy začni v staging
git checkout staging
git pull origin staging

# 2. Edituj soubor v VS Code (přes Claude Code)
# např. uprav text v src/components/sections/Hero.astro

# 3. Otestuj lokálně
npm run dev
# kontrola v prohlížeči localhost:4321

# 4. Commit & push
git add .
git commit -m "feat: aktualizace hero textu"
git push origin staging

# 5. Za 2-3 min: https://dev.panprstenu.cz aktualizováno

# 6. Když OK → merge do main = deploy na NEW
gh pr create --base main --head staging --title "deploy: hero text" --fill
gh pr merge --merge

# 7. Za 2-3 min: https://new.panprstenu.cz aktualizováno
```

### Scénář 2: Větší feature (nová stránka)

```bash
# Z staging → feature větev
git checkout staging
git pull
git checkout -b feature/nova-stranka

# Pracuj, commituj
git add .
git commit -m "feat: stránka X"
git push -u origin feature/nova-stranka

# PR do staging (ne hned do main!)
gh pr create --base staging --head feature/nova-stranka --title "feat: nová stránka X"

# Po mergi → auto deploy na DEV
# Když na DEV vypadá OK → další PR: staging → main
```

### Scénář 3: Rychlý hotfix produkce

```bash
# Z main (ne ze staging!) — abys obešel rozpracované věci
git checkout main
git pull
git checkout -b hotfix/oprava-X

# Oprava, commit, push
git commit -am "fix: oprava X"
git push -u origin hotfix/oprava-X

# PR do main (ne do staging)
gh pr create --base main --head hotfix/oprava-X --title "hotfix: oprava X"
gh pr merge --merge

# Pak srovnej staging
git checkout staging
git merge main
git push origin staging
```

---

## 📅 Část 8 — Den D: Přepnutí na produkci

Až bude `new.panprstenu.cz` hotový a chceš spustit ostro:

### 8.1 Záloha starého WordPress webu

V WebGlobe administraci:
1. **Soubory:** stáhni celou produkční složku přes FileZilla nebo WebFTP
2. **Databáze:** export přes phpMyAdmin (https://dbadmin.webglobe.cz) → Export → SQL
3. Ulož vše jako `panprstenu-cz-backup-YYYY-MM-DD.zip` na lokální disk

### 8.2 Přepni doménu na novou složku

V WebGlobe administraci → **Domény** → `panprstenu.cz`:

**Možnost A (jednoduchá): Přesměrování domény na složku NEW**
- Změň aliasy `panprstenu.cz` (a `www.panprstenu.cz`) → cílová složka `/_sub/new/`
- Okamžité přepnutí, žádný downtime

**Možnost B (čistá): Přesun souborů**
- Smaž obsah hlavní produkční složky (zazálohováno!)
- Zkopíruj obsah `/_sub/new/` → hlavní produkční složka

> **Doporučuju A** — zero-downtime, méně rizika.

### 8.3 Vypni noindex na NEW

V `.github/workflows/deploy-production.yml` najdi řádek:
```yaml
PUBLIC_NOINDEX: 'true'
```

A smaž ho (nebo přepni na `'false'`):
```yaml
# PUBLIC_NOINDEX odstraněno po DNS přepnutí
```

Pak push:
```bash
git checkout staging
# změň lokálně
git add .github/workflows/deploy-production.yml
git commit -m "ci: odstraněn noindex po DNS přepnutí na panprstenu.cz"
git push origin staging
gh pr create --base main --head staging --title "deploy: production launch — odstraněn noindex" --fill
gh pr merge --merge
```

### 8.4 Google Search Console

1. Přidej `panprstenu.cz` do Google Search Console
2. Ověření přes meta tag (přidej do `BaseLayout.astro` head)
3. Submit sitemap: `https://panprstenu.cz/sitemap-index.xml`

### 8.5 UptimeRobot

Přidej `panprstenu.cz` jako monitor (každých 5 min). Alerty na info@panprstenu.cz.

---

## 🤖 Část 9 — Práce v Claude Code (pro denní vývoj)

Po dokončení této setup části budeš pokračovat v Claude Code uvnitř VS Code. Pár tipů pro efektivní práci:

### 9.1 Spuštění Claude Code

```bash
# V terminálu VS Code
claude
# Nebo přes ikonu v sidebar
```

### 9.2 Co Claude Code automaticky přečte

Při startu vlákna v projektu Claude Code automaticky načte:
- `CLAUDE.md` (závazná pravidla)
- Strukturu projektu (přes `ls`, `tree`)
- Otevřené soubory ve VS Code

### 9.3 Užitečné prompty na začátku vlákna

```
Načti CLAUDE.md a HANDOFF.md, abys věděl kontext projektu.
```

```
Co je aktuální stav projektu? Podívej se do HANDOFF.md.
```

```
Vytvoř komponentu X podle stylu z grafika/Image-9.png. Drž se CLAUDE.md §3 (Tailwind 4) a §4 (design tokeny).
```

### 9.4 Pro velké úkoly — šetři tokeny

```
Stručně, bez vysvětlování: vytvoř komponentu Footer.astro podle stylu z mockupů.
```

```
Vrať jen výsledný kód, žádný komentář navíc.
```

### 9.5 Když narazíš na problém

```
Zkontroluj posledních X lines logu workflow Y. Co je špatně? Stručně, krok po kroku.
```

---

## 📋 Část 10 — Checklist po dokončení této setup části

Ujisti se, že máš:

- [x] `node --version` ≥ 22.12.0
- [x] `git --version` ≥ 2.30
- [x] `gh auth status` zobrazuje přihlášení
- [x] V projektu: `npm run build` projde bez errorů
- [x] V projektu: `npm run dev` zobrazí localhost:4321
- [x] Git repo má 2 větve: `main` a `staging`
- [x] GitHub repo `panprstenu-web` je private
- [x] GitHub Secrets má 7 záznamů (`gh secret list`)
- [x] Branch protection na `main` aktivní
- [x] **https://dev.panprstenu.cz** zobrazuje landing
- [x] **https://new.panprstenu.cz** zobrazuje landing s `<meta name="robots" content="noindex">`
- [x] `.editorconfig` a `.vscode/settings.json` v projektu
- [x] Claude Code v VS Code přihlášený účtem `info@jrdm.cz`

Pokud máš všechno odškrtnuté, **jsi hotov se setup fází**. 🎉

---

## 🆘 Část 11 — Pokud něco nejde, co dělat

### Build fail lokálně
```bash
# Smaž node_modules a lock, znovu instalace
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Workflow fail v GitHubu
```bash
# Stáhni logy aktuálního běhu
gh run view --log

# Nebo filtruj jen na fail kroky
gh run view --log-failed
```

### Smazaný GitHub Secret
```bash
# Setni ho znovu
gh secret set NAZEV_SECRETU --body "hodnota"
```

### Špatný commit, chci ho zrušit (jen lokálně, nepushnuté)
```bash
git reset HEAD~1  # vrátí poslední commit, soubory zůstávají
git reset --hard HEAD~1  # vrátí poslední commit + smaže změny (POZOR!)
```

### Špatný commit už pushnutý
```bash
# Vytvoř revert commit
git revert COMMIT_HASH
git push origin staging
```

### FTP timeout nebo password rejected
1. Ověř, že **subdomény jsou aktivní** v WebGlobe
2. Otestuj FTP manuálně:
   ```bash
   ftp 62.109.151.48
   # User: dev@panprstenu.cz
   # Password: PP_dev-2026
   ls
   quit
   ```
3. Pokud manuál funguje, ale GitHub Actions ne → pravděpodobně FTPS issue. V workflow přepni na `protocol: ftp`, `port: 21`.

### "command not found: gh"
```bash
# macOS
brew install gh

# Ubuntu/Debian
type -p curl >/dev/null || (sudo apt update && sudo apt install curl -y)
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
sudo chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update
sudo apt install gh
```

---

## 📊 Příloha: Quick Reference cheat sheet

### Git
```bash
git status                    # stav
git branch --show-current     # aktuální větev
git pull                      # stáhni změny
git checkout VĚTEV            # přepnutí
git checkout -b NOVÁ          # vytvoř + přepni
git add .                     # stage all
git commit -m "msg"           # commit
git push                      # push
git log --oneline -10         # historie
git merge VĚTEV               # merge do aktuální
```

### Astro
```bash
npm run dev                   # dev server
npm run build                 # produkční build
npm run preview               # preview buildu
npm run check                 # TS check
npm run format                # Prettier
```

### GitHub CLI
```bash
gh repo view --web            # otevři repo
gh pr create                  # nový PR
gh pr list                    # seznam PR
gh pr merge                   # mergni PR
gh secret list                # seznam secrets
gh secret set NAZEV --body "" # set secret
gh run watch                  # sleduj workflow
gh run view --log             # log běhu
gh run view --log-failed      # jen fail kroky
```

### Claude Code
```bash
claude                        # spustit
claude logout                 # odhlásit
claude login                  # přihlásit
```

---

## ✅ Pokud jsi všechno odškrtnul

Gratulace! Teď máš:
- **Produkční-grade setup** s automatickým deployem
- **2 živá prostředí** (DEV pro test, NEW pro preprod)
- **Branch protection** proti omylům
- **Profesionální VS Code config** pro tým

**Další kroky (už v Claude Code):**
1. Doplnit logo SVG, hero fotku, OG image
2. Migrace textů ze starého panprstenu.cz
3. URL na Registracka.cz
4. GDPR text schválit pověřencem
5. Apple touch icon (180×180)

Vše ostatní (od refaktoringu po nové stránky) řeš v Claude Code uvnitř VS Code. CLAUDE.md je tvůj bible — Claude Code ho čte automaticky.

---

**Verze:** 1.0 (29. 4. 2026)
**Závazný zdroj pravidel:** [CLAUDE.md](CLAUDE.md)
**Stav projektu:** [HANDOFF.md](HANDOFF.md)
**Quick start:** [README.md](README.md)
