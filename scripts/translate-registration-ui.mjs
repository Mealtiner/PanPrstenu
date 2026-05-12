#!/usr/bin/env node
/**
 * translate-registration-ui.mjs
 * Datum: 2026-05-12
 *
 * Aplikuje nové i18n klíče pro UI registračního formuláře (hub view,
 * payment panel, login, signup, unregister, status) do všech 5 lang JSON
 * v src/i18n/ui/.
 *
 * Run: node scripts/translate-registration-ui.mjs
 */

import { writeFileSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const K = {
  // Hub view: registrace status
  "reg.hub.status_confirmed": {
    cs: "potvrzeno",
    en: "confirmed",
    de: "bestätigt",
    sk: "potvrdené",
    uk: "підтверджено",
  },
  "reg.hub.status_pending": {
    cs: "čeká na schválení",
    en: "awaiting approval",
    de: "wartet auf Bestätigung",
    sk: "čaká na schválenie",
    uk: "очікує підтвердження",
  },
  "reg.hub.status_label": {
    cs: "stav",
    en: "status",
    de: "Status",
    sk: "stav",
    uk: "стан",
  },
  "reg.hub.status_paid": {
    cs: "zaplaceno",
    en: "paid",
    de: "bezahlt",
    sk: "zaplatené",
    uk: "оплачено",
  },
  "reg.hub.status_registered": {
    cs: "registrován",
    en: "registered",
    de: "angemeldet",
    sk: "registrovaný",
    uk: "зареєстрований",
  },
  // Sidebar — Registrace section items
  "reg.sidebar.register_self": {
    cs: "Registruj svou registraci",
    en: "Register yourself",
    de: "Melde dich an",
    sk: "Registruj svoju registráciu",
    uk: "Зареєструватися",
  },
  "reg.sidebar.family_register": {
    cs: "Registruj dalšího člena rodiny (přidruženou osobu)",
    en: "Register another family member (associated person)",
    de: "Weiteres Familienmitglied anmelden (verbundene Person)",
    sk: "Zaregistruj ďalšieho člena rodiny (pridruženú osobu)",
    uk: "Зареєструвати ще одного члена сім'ї (пов'язану особу)",
  },
  "reg.sidebar.family_all_registered": {
    cs: "Všechny přidružené osoby jsou už registrované.",
    en: "All associated persons are already registered.",
    de: "Alle verbundenen Personen sind bereits angemeldet.",
    sk: "Všetky pridružené osoby sú už registrované.",
    uk: "Усі пов'язані особи вже зареєстровані.",
  },
  "reg.sidebar.group_register": {
    cs: "Registruj člena skupiny",
    en: "Register a group member",
    de: "Gruppenmitglied anmelden",
    sk: "Zaregistruj člena skupiny",
    uk: "Зареєструвати члена групи",
  },
  "reg.sidebar.edit_personal": {
    cs: "Úprava osobních údajů ↗",
    en: "Edit personal data ↗",
    de: "Persönliche Daten bearbeiten ↗",
    sk: "Úprava osobných údajov ↗",
    uk: "Редагувати персональні дані ↗",
  },
  "reg.sidebar.logout_full": {
    cs: "Odhlásit se ze systému",
    en: "Sign out of the system",
    de: "Vom System abmelden",
    sk: "Odhlásiť sa zo systému",
    uk: "Вийти із системи",
  },
  "reg.sidebar.login_account": {
    cs: "Přihlásit se s účtem Registračky",
    en: "Sign in with your Registračka account",
    de: "Mit Registračka-Konto anmelden",
    sk: "Prihlásiť sa s účtom Registračky",
    uk: "Увійти за обліковим записом Registračka",
  },
  "reg.sidebar.create_account": {
    cs: "Vytvořit nový účet",
    en: "Create a new account",
    de: "Neues Konto erstellen",
    sk: "Vytvoriť nový účet",
    uk: "Створити новий обліковий запис",
  },
  // Hub view — unregister
  "reg.hub.unregister_self_label": {
    cs: "vlastní registrace",
    en: "your own registration",
    de: "deine Anmeldung",
    sk: "vlastná registrácia",
    uk: "власна реєстрація",
  },
  "reg.hub.unregister_self_btn": {
    cs: "Odregistrovat vlastní registraci",
    en: "Cancel your own registration",
    de: "Eigene Anmeldung stornieren",
    sk: "Odregistrovať vlastnú registráciu",
    uk: "Скасувати власну реєстрацію",
  },
  "reg.unregister.target_affiliated": {
    cs: "přidruženou osobu",
    en: "the associated person",
    de: "die verbundene Person",
    sk: "pridruženú osobu",
    uk: "пов'язану особу",
  },
  "reg.unregister.target_group_member": {
    cs: "člena skupiny",
    en: "the group member",
    de: "das Gruppenmitglied",
    sk: "člena skupiny",
    uk: "члена групи",
  },
  "reg.unregister.birth_meta": {
    cs: "narození {date}",
    en: "born {date}",
    de: "Geburt {date}",
    sk: "narodenie {date}",
    uk: "народження {date}",
  },
  "reg.unregister.confirm_prefix": {
    cs: "Opravdu chceš odregistrovat",
    en: "Do you really want to cancel",
    de: "Möchtest du wirklich",
    sk: "Naozaj chceš odregistrovať",
    uk: "Дійсно бажаєш скасувати",
  },
  "reg.unregister.cascade_warning": {
    cs: "⚠️ Smažou se zároveň i registrace {count} {memberWord} rodiny (přidružených osob).",
    en: "⚠️ Registrations of {count} family {memberWord} (associated persons) will also be deleted.",
    de: "⚠️ Anmeldungen von {count} Familien-{memberWord} (verbundenen Personen) werden ebenfalls gelöscht.",
    sk: "⚠️ Zmažú sa zároveň aj registrácie {count} {memberWord} rodiny (pridružených osôb).",
    uk: "⚠️ Реєстрації {count} {memberWord} сім'ї (пов'язаних осіб) будуть також видалені.",
  },
  "reg.unregister.member_singular": {
    cs: "člena",
    en: "member",
    de: "Mitglied",
    sk: "člena",
    uk: "члена",
  },
  "reg.unregister.member_plural": {
    cs: "členů",
    en: "members",
    de: "Mitgliedern",
    sk: "členov",
    uk: "членів",
  },
  "reg.unregister.group_independent_note": {
    cs: "Členové skupiny zůstávají — ti jsou nezávislé registrace.",
    en: "Group members remain — they are independent registrations.",
    de: "Gruppenmitglieder bleiben — das sind eigenständige Anmeldungen.",
    sk: "Členovia skupiny zostávajú — sú nezávislé registrácie.",
    uk: "Члени групи лишаються — це незалежні реєстрації.",
  },
  "reg.unregister.after_payment_note": {
    cs: "Pozn.: po zaplacení už tato volba není dostupná.",
    en: "Note: once paid, this option is no longer available.",
    de: "Hinweis: Nach der Zahlung ist diese Option nicht mehr verfügbar.",
    sk: "Pozn.: po zaplatení už táto voľba nie je dostupná.",
    uk: "Примітка: після оплати ця опція вже недоступна.",
  },
  "reg.unregister.dialog_title": {
    cs: "Odregistrace",
    en: "Cancellation",
    de: "Stornierung",
    sk: "Odregistrácia",
    uk: "Скасування",
  },
  "reg.unregister.dialog_confirm": {
    cs: "Odregistrovat",
    en: "Cancel registration",
    de: "Stornieren",
    sk: "Odregistrovať",
    uk: "Скасувати",
  },
  // Logout dialog
  "reg.logout.confirm_msg": {
    cs: "Opravdu se chceš odhlásit?",
    en: "Do you really want to sign out?",
    de: "Möchtest du dich wirklich abmelden?",
    sk: "Naozaj sa chceš odhlásiť?",
    uk: "Дійсно хочеш вийти?",
  },
  "reg.logout.dialog_title": {
    cs: "Odhlášení",
    en: "Sign out",
    de: "Abmeldung",
    sk: "Odhlásenie",
    uk: "Вихід",
  },
  "reg.logout.dialog_confirm": {
    cs: "Odhlásit",
    en: "Sign out",
    de: "Abmelden",
    sk: "Odhlásiť",
    uk: "Вийти",
  },
  // Payment panel
  "reg.payment.qr_note": {
    cs: "Naskenuj QR v bankovní aplikaci pro rychlou platbu",
    en: "Scan the QR code in your banking app for a quick payment",
    de: "Scanne den QR-Code in deiner Banking-App für eine schnelle Zahlung",
    sk: "Naskenuj QR v bankovej aplikácii pre rýchlu platbu",
    uk: "Скануй QR-код у банківському застосунку для швидкого платежу",
  },
  "reg.payment.amount_label": {
    cs: "Cena registrace",
    en: "Registration fee",
    de: "Anmeldegebühr",
    sk: "Cena registrácie",
    uk: "Реєстраційний внесок",
  },
  "reg.payment.total_label": {
    cs: "Celkem k zaplacení",
    en: "Total to pay",
    de: "Gesamt zu zahlen",
    sk: "Celkom na zaplatenie",
    uk: "Всього до сплати",
  },
  "reg.payment.days_remaining": {
    cs: "(zbývá {days} {dayWord})",
    en: "({days} {dayWord} remaining)",
    de: "(noch {days} {dayWord})",
    sk: "(zostáva {days} {dayWord})",
    uk: "(залишилось {days} {dayWord})",
  },
  "reg.payment.day_singular": { cs: "den", en: "day", de: "Tag", sk: "deň", uk: "день" },
  "reg.payment.day_dual": { cs: "dny", en: "days", de: "Tage", sk: "dni", uk: "дні" },
  "reg.payment.day_plural": { cs: "dní", en: "days", de: "Tage", sk: "dní", uk: "днів" },
  "reg.payment.breakdown_text": {
    cs: "(základ {base} Kč + příplatky {surcharges} Kč)",
    en: "(base {base} CZK + surcharges {surcharges} CZK)",
    de: "(Grundpreis {base} CZK + Zuschläge {surcharges} CZK)",
    sk: "(základ {base} Kč + príplatky {surcharges} Kč)",
    uk: "(основа {base} CZK + надбавки {surcharges} CZK)",
  },
  "reg.payment.bank_account_label": {
    cs: "Bankovní účet",
    en: "Bank account",
    de: "Bankkonto",
    sk: "Bankový účet",
    uk: "Банківський рахунок",
  },
  "reg.payment.h3": {
    cs: "Platební údaje",
    en: "Payment details",
    de: "Zahlungsdaten",
    sk: "Platobné údaje",
    uk: "Платіжні дані",
  },
  "reg.payment.currency": { cs: "Kč", en: "CZK", de: "CZK", sk: "Kč", uk: "CZK" },
  // Login UI
  "reg.login.legend": {
    cs: "Jak se přihlásit",
    en: "How to sign in",
    de: "So meldest du dich an",
    sk: "Ako sa prihlásiť",
    uk: "Як увійти",
  },
  "reg.login.submit_btn": {
    cs: "Přihlaš mne do systému",
    en: "Sign me in",
    de: "Anmelden",
    sk: "Prihlás ma do systému",
    uk: "Увійти в систему",
  },
  "reg.login.forgot_password": {
    cs: "Zapomenuté heslo ↗",
    en: "Forgot password ↗",
    de: "Passwort vergessen ↗",
    sk: "Zabudnuté heslo ↗",
    uk: "Забув пароль ↗",
  },
  "reg.login.email_label": { cs: "E-mail", en: "E-mail", de: "E-Mail", sk: "E-mail", uk: "E-mail" },
  "reg.login.password_label": { cs: "Heslo", en: "Password", de: "Passwort", sk: "Heslo", uk: "Пароль" },
  "reg.login.email_required": {
    cs: "Vyplň e-mail i heslo.",
    en: "Fill in both e-mail and password.",
    de: "Bitte E-Mail und Passwort eingeben.",
    sk: "Vyplň e-mail aj heslo.",
    uk: "Заповни і e-mail, і пароль.",
  },
  "reg.login.in_progress": {
    cs: "Přihlašuji…",
    en: "Signing in…",
    de: "Wird angemeldet…",
    sk: "Prihlasujem…",
    uk: "Виконую вхід…",
  },
  "reg.login.failed": {
    cs: "Přihlášení selhalo.",
    en: "Sign-in failed.",
    de: "Anmeldung fehlgeschlagen.",
    sk: "Prihlásenie zlyhalo.",
    uk: "Не вдалося увійти.",
  },
  "reg.login.success_load": {
    cs: "Přihlášen. Načítám registraci…",
    en: "Signed in. Loading registration…",
    de: "Angemeldet. Lade Anmeldung…",
    sk: "Prihlásený. Načítavam registráciu…",
    uk: "Увійшов. Завантажую реєстрацію…",
  },
  // Signup UI (guest registration without account)
  "reg.signup.col_title_guest": {
    cs: "Nová registrace do systému",
    en: "New registration to the system",
    de: "Neuanmeldung im System",
    sk: "Nová registrácia do systému",
    uk: "Нова реєстрація в системі",
  },
  "reg.signup.col_title_account": {
    cs: "Vytvořit nový účet",
    en: "Create a new account",
    de: "Neues Konto erstellen",
    sk: "Vytvoriť nový účet",
    uk: "Створити новий обліковий запис",
  },
  "reg.signup.creating_account": {
    cs: "Vytváříš nový účet",
    en: "Creating a new account",
    de: "Du erstellst ein neues Konto",
    sk: "Vytváraš nový účet",
    uk: "Створюєш новий обліковий запис",
  },
  "reg.signup.back_to_login": {
    cs: "← Mám účet, přihlásit se",
    en: "← I have an account, sign in",
    de: "← Ich habe ein Konto, anmelden",
    sk: "← Mám účet, prihlásiť sa",
    uk: "← Маю обліковий запис, увійти",
  },
  "reg.signup.legend_credentials": {
    cs: "Přihlašovací údaje",
    en: "Sign-in credentials",
    de: "Anmeldedaten",
    sk: "Prihlasovacie údaje",
    uk: "Облікові дані",
  },
  "reg.signup.legend_personal": {
    cs: "Osobní údaje",
    en: "Personal information",
    de: "Persönliche Daten",
    sk: "Osobné údaje",
    uk: "Персональні дані",
  },
  "reg.signup.submit_btn": {
    cs: "Vytvořit účet a registrovat se",
    en: "Create account and register",
    de: "Konto erstellen und anmelden",
    sk: "Vytvoriť účet a zaregistrovať sa",
    uk: "Створити обліковий запис і зареєструватися",
  },
  "reg.signup.email_note": {
    cs: "Na tento e-mail ti pošleme potvrzovací odkaz pro dokončení registrace.",
    en: "We'll send a confirmation link to this e-mail to complete the registration.",
    de: "Wir senden dir an diese E-Mail einen Bestätigungslink zum Abschluss der Anmeldung.",
    sk: "Na tento e-mail ti pošleme potvrdzovací odkaz pre dokončenie registrácie.",
    uk: "На цю електронну адресу ми надішлемо підтвердження для завершення реєстрації.",
  },
  "reg.signup.password_note": {
    cs: "Min. 8 znaků, musí obsahovat písmeno i číslici.",
    en: "Min. 8 characters, must contain a letter and a digit.",
    de: "Min. 8 Zeichen, muss Buchstabe und Ziffer enthalten.",
    sk: "Min. 8 znakov, musí obsahovať písmeno aj číslicu.",
    uk: "Мін. 8 символів, має містити літеру і цифру.",
  },
  "reg.signup.password_confirm_label": {
    cs: "Heslo znovu",
    en: "Confirm password",
    de: "Passwort wiederholen",
    sk: "Heslo znova",
    uk: "Підтвердити пароль",
  },
  // Submit registration status
  "reg.submit.in_progress": {
    cs: "Odesílám registraci…",
    en: "Submitting registration…",
    de: "Sende Anmeldung…",
    sk: "Odosielam registráciu…",
    uk: "Надсилаю реєстрацію…",
  },
  "reg.submit.failed": {
    cs: "Registraci se nepodařilo odeslat.",
    en: "The registration could not be submitted.",
    de: "Die Anmeldung konnte nicht gesendet werden.",
    sk: "Registráciu sa nepodarilo odoslať.",
    uk: "Не вдалося надіслати реєстрацію.",
  },
  "reg.submit.success": {
    cs: "Registrace odeslána. Vracím tě na přehled…",
    en: "Registration submitted. Returning to the overview…",
    de: "Anmeldung gesendet. Zurück zur Übersicht…",
    sk: "Registrácia odoslaná. Vraciam ťa na prehľad…",
    uk: "Реєстрацію надіслано. Повертаю до огляду…",
  },
  // Hub status line (user already registered)
  "reg.hub.status_line_template": {
    cs: "Na akci <strong>{event}</strong> přihlášen jako <strong>{side}</strong>{narSuffix}.",
    en: "Registered for the event <strong>{event}</strong> as <strong>{side}</strong>{narSuffix}.",
    de: "Für die Veranstaltung <strong>{event}</strong> angemeldet als <strong>{side}</strong>{narSuffix}.",
    sk: "Na akciu <strong>{event}</strong> prihlásený ako <strong>{side}</strong>{narSuffix}.",
    uk: "На захід <strong>{event}</strong> зареєстрований як <strong>{side}</strong>{narSuffix}.",
  },
  // Post-submit confirmation (email check)
  "reg.confirm.check_inbox": {
    cs: "📧 Podívej se do schránky",
    en: "📧 Check your inbox",
    de: "📧 Schau in dein Postfach",
    sk: "📧 Pozri si schránku",
    uk: "📧 Перевір свою поштову скриньку",
  },
  "reg.confirm.email_sent_line": {
    cs: "Na <strong>{email}</strong> jsme poslali potvrzovací odkaz. Klikni na něj a registrace bude dokončena.",
    en: "We sent a confirmation link to <strong>{email}</strong>. Click it to complete your registration.",
    de: "Wir haben einen Bestätigungslink an <strong>{email}</strong> gesendet. Klicke ihn an, um die Anmeldung abzuschließen.",
    sk: "Na <strong>{email}</strong> sme poslali potvrdzovací odkaz. Klikni naň a registrácia bude dokončená.",
    uk: "На <strong>{email}</strong> ми надіслали підтвердження. Натисни на нього, щоб завершити реєстрацію.",
  },
  "reg.confirm.spam_note": {
    cs: "Pokud e-mail nedorazil do pár minut, koukni do složky <strong>SPAM</strong> nebo nám napiš.",
    en: "If the e-mail doesn't arrive in a few minutes, check your <strong>SPAM</strong> folder or write to us.",
    de: "Sollte die E-Mail nicht in wenigen Minuten ankommen, schau in deinen <strong>SPAM</strong>-Ordner oder schreibe uns.",
    sk: "Ak e-mail nedôjde do pár minút, pozri sa do priečinka <strong>SPAM</strong> alebo nám napíš.",
    uk: "Якщо лист не прийде за кілька хвилин, перевір папку <strong>SPAM</strong> або напиши нам.",
  },
};

// Apply to all 5 lang JSONs
const LANGS = ['cs', 'en', 'de', 'sk', 'uk'];
for (const lang of LANGS) {
  const path = join(ROOT, 'src', 'i18n', 'ui', `${lang}.json`);
  const json = JSON.parse(readFileSync(path, 'utf8'));
  let added = 0, updated = 0;
  for (const [key, langs] of Object.entries(K)) {
    const val = langs[lang];
    if (val == null) continue;
    if (key in json) {
      if (json[key] !== val) {
        json[key] = val;
        updated++;
      }
    } else {
      json[key] = val;
      added++;
    }
  }
  writeFileSync(path, JSON.stringify(json, null, 2) + '\n', 'utf8');
  console.log(`${lang}: +${added} new, ${updated} updated`);
}
console.log(`\n✓ Total ${Object.keys(K).length} keys across 5 langs`);
