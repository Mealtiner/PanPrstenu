---
title: "Web už hovorí piatimi jazykmi — a ospravedlnenie za posledné dve stránky"
lang: sk
date: 2026-05-14
category: organizace
author: "Mealtiner"
excerpt: "Web je kompletne v češtine, päťdesiat z päťdesiatich dvoch stránok je hotových v angličtine, nemčine a slovenčine, päťdesiatjeden v ukrajinčine. Zvyšok doháňame. Ak niekde narazíš na nepreložený text, daj vedieť — opravíme to ten istý deň."
tags:
  - i18n
  - mezinárodní
  - omluva
published: true
meta_description: "Web LARPu Pán Prsteňov v piatich jazykoch: čeština, angličtina, nemčina, slovenčina, ukrajinčina. Stav prekladov a kde nahlásiť chybu."
---

Bitka o Stredozem sa hrá na lúke na južnej Morave, ale dlhé roky k nám chodia ľudia z Poľska, Slovenska, Nemecka, Rakúska, Ukrajiny aj odinakiaľ. Niektorých z nich poznáme z čias, keď sa chodilo s plátnom na chrbte. Väčšina z nich vie česky lepšie ako my po anglicky, ale na webe to nestačí.

Preto je web od začiatku **postavený päťjazyčne**.

## Aktuálny stav: 50/52 stránok v každom jazyku

| Jazyk | Hotových stránok | Stránok so zvyškom v češtine |
|---|---:|---:|
| Čeština (cs) | 52/52 | — |
| Angličtina (en) | 50/52 | 2 |
| Nemčina (de) | 50/52 | 2 |
| Slovenčina (sk) | 50/52 | 2 |
| Ukrajinčina (uk) | 51/52 | 1 |

Konkrétne chýba doprekladanie na dvoch rozsiahlych stránkach — popisoch armád ([Frakcie](/sk/frakce/)) a starších kapitolách pravidiel. Pracujeme na nich.

## Ako prekladáme

Žiadny Google Translate na rýchlo. Postup vyzerá takto:

1. **Hrubý preklad cez Claude API** s vlastným system promptom, ktorý má kontext LARPu, Tolkiena a českej toponymie.
2. **Strojový audit** stránku po stránke — koľko stringov je hotových, koľko zhodných s češtinou, koľko chýba.
3. **Allowlist pre „cognaty"** — slovenčina má veľa slov totožných s češtinou (IČO, Pomocníci, Sídlo) a my ich nepočítame ako chybu.
4. **Ručná korektúra** na kľúčových miestach: titulky, krátke popisy, navigačné prvky.

Ak ťa technické detaily zaujímajú, popis prekladacieho workflow je v repozitári v skripte `auto-translate.mjs`.

## Čo to znamená pre teba

- **Keď narazíš na český text v inej jazykovej verzii**, je to buď na jednej z tých dvoch stránok, ktoré ešte doprekladáme, alebo chyba.
- **Pri chybe:** daj nám vedieť na **[info@panprstenu.cz](mailto:info@panprstenu.cz)** s URL stránky. Opravíme to ten istý deň.
- **Pri zámernom cognáte:** niektoré krátke slová ostávajú medzi cs/sk zámerne identické. „Hasiči", „Sídlo", „IČO". Ak ti to vadí, povedz — nájdeme inú formuláciu.

## Prečo päť jazykov a nie tri

Mohli sme si vystačiť s češtinou, angličtinou a slovenčinou. Ale akcia má medzinárodný rozmer a každý ďalší jazyk znamená pár konkrétnych ľudí, ktorí sa cítia o trochu viac doma.

- **Nemčina** — pre účastníkov z Rakúska, Nemecka a nemecky hovoriacich Švajčiarov
- **Ukrajinčina** — pre ukrajinskú komunitu, ktorá je u nás od 2022 jednou z najaktívnejších

Ukrajinčina bola najemočnejšie rozhodnutie. Nie sme prekladateľská agentúra, ale mali sme zvážiť: investujeme čas inde, alebo pridáme jazyk navyše? Vyhrali ľudia.

## Kde si prepneš jazyk

V hlavičke webu vpravo je prepínač — kolieska 40 × 40 px s dvojpísmenovým kódom jazyka. Na mobile sa skryjú pri scrollovaní, ale po klepnutí na okraj sa zase objavia. Tvoja voľba sa pamätá medzi stránkami.

Ak chceš jazyk ručne v URL: `/cs/`, `/en/`, `/de/`, `/sk/`, `/uk/`.

## A keď ti niečo naozaj nesedí

Ak máš pocit, že niektorý preklad znie zle — buď doslovne, alebo kultúrne — **napíš nám**. Väčšina prekladov prešla rukami, ale nie je to neomylné a každá spätná väzba pomáha.

A ak ti chýbajú ďalšie jazyky (poľština, maďarčina, ruština…), tiež povedz. Nie je to vylúčené, len treba zvážiť kapacity.

Ďakujeme všetkým, ktorí s nami hovoria vo svojom vlastnom jazyku. Stredozem má miesto pre všetkých.
