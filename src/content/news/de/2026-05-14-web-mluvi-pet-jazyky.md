---
title: "Die Website spricht jetzt fünf Sprachen — und eine Entschuldigung für die letzten zwei Seiten"
lang: de
date: 2026-05-14
category: organizace
author: "Mealtiner"
excerpt: "Die Website ist komplett auf Tschechisch, fünfzig von zweiundfünfzig Seiten sind auf Englisch, Deutsch und Slowakisch fertig, einundfünfzig auf Ukrainisch. Den Rest holen wir auf. Wenn dir irgendwo unübersetzter Text begegnet, gib Bescheid — wir reparieren das am selben Tag."
tags:
  - i18n
  - mezinárodní
  - omluva
published: true
meta_description: "Die Website des LARP Der Herr der Ringe in fünf Sprachen: Tschechisch, Englisch, Deutsch, Slowakisch, Ukrainisch. Übersetzungsstatus und Fehlermeldung."
---

Die Schlacht um Mittelerde findet auf einer Wiese in Südmähren statt, aber seit Jahren kommen Menschen aus Polen, der Slowakei, Deutschland, Österreich, der Ukraine und anderswo. Manche von ihnen kennen wir aus Zeiten, in denen man die Zeltbahn auf dem Rücken trug. Die meisten sprechen besser Tschechisch als wir Englisch — aber für die Website reicht das nicht.

Deshalb ist die Website **von Anfang an fünfsprachig** aufgebaut.

## Aktueller Stand: 50/52 Seiten pro Sprache

| Sprache | Fertige Seiten | Seiten mit tschechischem Rest |
|---|---:|---:|
| Tschechisch (cs) | 52/52 | — |
| Englisch (en) | 50/52 | 2 |
| Deutsch (de) | 50/52 | 2 |
| Slowakisch (sk) | 50/52 | 2 |
| Ukrainisch (uk) | 51/52 | 1 |

Konkret fehlt die Übersetzung auf zwei umfangreichen Seiten — den Heerbeschreibungen ([Armeen](/de/frakce/)) und älteren Kapiteln der Regeln. Wir arbeiten daran.

## Wie wir übersetzen

Kein Google Translate im Vorbeigehen. Der Ablauf sieht so aus:

1. **Rohübersetzung über die Claude API** mit eigenem System-Prompt, der den Kontext LARP, Tolkien und tschechischer Ortsnamen mitbringt.
2. **Maschinelles Audit** Seite für Seite — wie viele Strings fertig sind, wie viele mit dem Tschechischen identisch sind, wie viele fehlen.
3. **Allowlist für „Kognaten"** — Slowakisch teilt viele Wörter mit Tschechisch (IČO, Pomocníci, Sídlo), und wir zählen das nicht als Fehler.
4. **Handlektorat** an Schlüsselstellen: Überschriften, Kurzbeschreibungen, Navigation.

Wenn dich die technischen Details interessieren, der Übersetzungs-Workflow ist im Repository im Skript `auto-translate.mjs` beschrieben.

## Was das für dich bedeutet

- **Wenn dir tschechischer Text in einer anderen Sprachversion begegnet**, ist es entweder auf einer der zwei Seiten, die wir noch übersetzen, oder ein Fehler.
- **Bei einem Fehler:** schreib uns an **[info@panprstenu.cz](mailto:info@panprstenu.cz)** mit der URL. Wir reparieren das am selben Tag.
- **Bei einer absichtlichen Kognate:** Manche kurzen Wörter bleiben zwischen Tschechisch und Slowakisch absichtlich identisch. „Hasiči", „Sídlo", „IČO". Wenn dich das stört, sag's — wir finden eine andere Formulierung.

## Warum fünf Sprachen und nicht drei

Wir hätten uns mit Tschechisch, Englisch und Slowakisch begnügen können. Aber die Veranstaltung hat internationale Reichweite, und jede weitere Sprache bedeutet eine Handvoll konkreter Menschen, die sich ein Stück mehr zu Hause fühlen.

- **Deutsch** — für Teilnehmer aus Österreich, Deutschland und der deutschsprachigen Schweiz
- **Ukrainisch** — für die ukrainische Gemeinschaft, die bei uns seit 2022 zu den aktivsten gehört

Ukrainisch war die emotionalste Entscheidung. Wir sind keine Übersetzungsagentur, aber wir hatten abzuwägen: investieren wir die Zeit woanders, oder fügen wir eine Sprache hinzu? Die Menschen haben gewonnen.

## Wo du die Sprache umschaltest

In der Kopfzeile der Website, rechts, gibt es einen Umschalter — Kreise 40×40 px mit zweistelligem Sprachkürzel. Auf dem Handy verbergen sie sich beim Scrollen, aber ein Tipper an den Rand bringt sie zurück. Deine Wahl bleibt zwischen den Seiten erhalten.

Wenn du die Sprache manuell in der URL setzen willst: `/cs/`, `/en/`, `/de/`, `/sk/`, `/uk/`.

## Und wenn dir etwas wirklich nicht passt

Wenn du das Gefühl hast, eine Übersetzung klingt falsch — entweder wörtlich oder kulturell — **schreib uns**. Die meisten Übersetzungen sind durch Menschenhände gegangen, aber sie sind nicht unfehlbar, und jedes Feedback hilft.

Und wenn dir andere Sprachen fehlen (Polnisch, Ungarisch, Russisch…), sag's auch. Es ist nicht ausgeschlossen, nur eine Frage der Kapazität.

Danke an alle, die mit uns in ihrer eigenen Sprache reden. Mittelerde hat Platz für sie alle.
