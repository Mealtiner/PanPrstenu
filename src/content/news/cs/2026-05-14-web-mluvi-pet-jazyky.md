---
title: "Web už mluví pěti jazyky — a omluva za poslední dvě stránky"
lang: cs
date: 2026-05-14
category: organizace
author: "Mealtiner"
excerpt: "Web je kompletně v češtině, padesát z padesáti dvou stránek je hotových v angličtině, němčině a slovenštině, padesát jedna v ukrajinštině. Zbytek doháníme. Pokud někde narazíš na nepřeložený text, dej vědět — opravíme to ten den."
tags:
  - i18n
  - mezinárodní
  - omluva
published: true
meta_description: "Pán Prstenů LARP web v pěti jazycích: čeština, angličtina, němčina, slovenština, ukrajinština. Stav překladů a kde nahlásit chybu."
---

Bitva o Středozem se hraje na louce na jižní Moravě, ale dlouhé roky k nám jezdí lidi z Polska, Slovenska, Německa, Rakouska, Ukrajiny i z dalších míst. Některé z nich potkáváme od dob, kdy se jezdilo s plátnem na zádech. Většina z nich umí česky líp než my anglicky, ale na webu to nestačí.

Proto je web od začátku **stavěný pětijazyčně**.

## Aktuální stav: 50/52 stránek v každém jazyce

| Jazyk | Hotových stránek | Stránek se zbytkem v češtině |
|---|---:|---:|
| Čeština (cs) | 52/52 | — |
| Angličtina (en) | 50/52 | 2 |
| Němčina (de) | 50/52 | 2 |
| Slovenština (sk) | 50/52 | 2 |
| Ukrajinština (uk) | 51/52 | 1 |

Konkrétně chybí dopřeklad u dvou velmi rozsáhlých stránek — popisů armád ([Frakce](/cs/frakce/)) a starších kapitol pravidel. Pracujeme na nich.

## Jak překládáme

Žádné Google Translate na žhavo. Postup vypadá takhle:

1. **Hrubý překlad přes Claude API** s vlastním system promptem, který má kontext LARPu, Tolkiena a české toponymie.
2. **Strojový audit** stránku po stránce — kolik stringů je hotových, kolik shodných s češtinou, kolik chybí.
3. **Allowlist pro „cognaty"** — slovenština má spoustu slov totožných s češtinou (IČO, Pomocníci, Sídlo) a my je nepočítáme jako chybu.
4. **Ruční korektura** na klíčových místech: titulky, krátké popisky, navigační prvky.

Pokud tě technické detaily zajímají, popis překládacího workflow je v repozitáři ve skriptu `auto-translate.mjs`.

## Co to znamená pro tebe

- **Když narazíš na český text v jiné jazykové verzi**, je to buď u jedné z těch dvou stránek, které ještě dopřekládáme, nebo chyba.
- **U chyby:** dej nám vědět na **[info@panprstenu.cz](mailto:info@panprstenu.cz)** s URL stránky. Opravíme to ten den.
- **U záměrné cognát:** některá krátká slova zůstávají identická i mezi cs/sk záměrně. „Hasiči", „Sídlo", „IČO". Pokud ti to vadí, řekni — najdeme jinou formulaci.

## Proč pět jazyků a ne tři

Mohli bychom si vystačit s češtinou, angličtinou a slovenštinou. Ale akce má mezinárodní rozměr a každý další jazyk znamená pár konkrétních lidí, kteří se cítí líp doma.

- **Němčina** — pro účastníky z Rakouska, Německa a německy mluvících Švýcarů
- **Ukrajinština** — pro ukrajinskou komunitu, která je u nás od 2022 jednou z nejaktivnějších

Ukrajinština byla nejvíc emoční rozhodnutí. Nejsme jazyková agentura, ale měli jsme na zvážení: investujeme čas do něčeho jiného, nebo přidáme jazyk navíc? Vyhráli lidi.

## Kde si přepneš jazyk

V záhlaví webu je vpravo přepínač — kolečka 40×40 px s dvojpísmenovým kódem jazyka. Na mobilu se schovají při scrollu, ale po klepnutí na okraj se zase objeví. Tvoje volba se pamatuje mezi stránkami.

Pokud chceš jazyk ručně v URL: `/cs/`, `/en/`, `/de/`, `/sk/`, `/uk/`.

## A když ti něco fakt nesedí

Pokud máš pocit, že některý překlad zní špatně — buď doslovně, nebo kulturně — **napiš nám**. Většina překladů prošla rukama, ale není to neomylné a každá zpětná vazba pomáhá.

A pokud ti scházejí další jazyky (polština, maďarština, ruština…), taky řekni. Není to vyloučené, jen je třeba zvážit kapacity.

Děkujeme všem, kdo s námi mluví ve své vlastní řeči. Středozemě má místo pro všechny.
