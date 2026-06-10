---
title: "The site now speaks five languages — and an apology for the last two pages"
lang: en
date: 2026-05-14
category: organizace
author: "Mealtiner"
excerpt: "The site is fully in Czech, fifty of fifty-two pages are done in English, German and Slovak, fifty-one in Ukrainian. The rest we're catching up on. If you land on an untranslated text, let us know — we'll fix it the same day."
tags:
  - i18n
  - mezinárodní
  - omluva
published: true
meta_description: "The Lord of the Rings LARP website in five languages: Czech, English, German, Slovak, Ukrainian. Translation status and where to report issues."
---

The Battle for Middle-earth happens on a meadow in southern Moravia, but for years people have been coming to us from Poland, Slovakia, Germany, Austria, Ukraine and elsewhere. Some of them we've known since the days when you carried your tent canvas on your back. Most of them speak Czech better than we speak English — but that's not enough on the web.

That's why the site is **multilingual from the start**.

## Current state: 50/52 pages in each language

| Language | Pages done | Pages with leftover Czech |
|---|---:|---:|
| Czech (cs) | 52/52 | — |
| English (en) | 50/52 | 2 |
| German (de) | 50/52 | 2 |
| Slovak (sk) | 50/52 | 2 |
| Ukrainian (uk) | 51/52 | 1 |

Specifically, the missing translations are on two extensive pages — the army descriptions ([Factions](/en/frakce/)) and older chapters of the rules. We're working on them.

## How we translate

No Google Translate on the fly. The pipeline looks like this:

1. **A rough translation via the Claude API**, with a custom system prompt that carries LARP, Tolkien and Czech toponym context.
2. **A machine audit** page by page — how many strings are done, how many are identical to Czech, how many are missing.
3. **An allowlist for "cognates"** — Slovak shares many words with Czech (IČO, Pomocníci, Sídlo) and we don't count those as errors.
4. **Manual proofreading** at key points: headings, short descriptions, navigation.

If the technical details interest you, the translation workflow is described in the repo in the `auto-translate.mjs` script.

## What this means for you

- **If you land on Czech text in another language version**, it's either on one of the two pages we're still translating, or a bug.
- **For a bug:** drop us a line at **[info@panprstenu.cz](mailto:info@panprstenu.cz)** with the URL. We'll fix it the same day.
- **For an intentional cognate:** some short words stay identical between Czech and Slovak on purpose. "Hasiči", "Sídlo", "IČO". If that bothers you, say so — we'll find a different phrasing.

## Why five languages and not three

We could have managed with Czech, English and Slovak. But the event has international reach and every additional language means a handful of specific people who feel a bit more at home.

- **German** — for participants from Austria, Germany and German-speaking Switzerland
- **Ukrainian** — for the Ukrainian community, which has been among the most active ones with us since 2022

Ukrainian was the most emotional decision. We're not a translation agency, but we had to weigh: do we invest the time somewhere else, or add a language? People won.

## Where to switch languages

In the header of the site, on the right, there's a switcher — 40×40 px circles with two-letter language codes. On mobile they hide when you scroll, but a tap on the edge brings them back. Your choice carries over between pages.

If you want to set the language manually in the URL: `/cs/`, `/en/`, `/de/`, `/sk/`, `/uk/`.

## And when something really doesn't sit right

If you feel a translation sounds wrong — either literally or culturally — **write to us**. Most translations have been through human hands, but it's not infallible and every piece of feedback helps.

And if you're missing other languages (Polish, Hungarian, Russian…), say so too. It's not impossible, just a question of capacity.

Thanks to everyone who speaks to us in their own tongue. Middle-earth has a place for all of them.
