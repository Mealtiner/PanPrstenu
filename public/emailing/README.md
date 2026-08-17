# Obrázky pro e-mailové kampaně

Sem patří obrázky, které se odkazují z rozesílaných e-mailů.

## Jak přidat obrázek

1. Vlož soubor do této složky (`public/emailing/`).
2. Commitni a pushni do `main`.
3. Po dokončení deploye je dostupný na:

```
https://www.panprstenu.cz/emailing/nazev-souboru.png
```

Cesta je stabilní a neobsahuje jazykový prefix — `/emailing/` se nikam
nepřesměrovává.

## Pravidla pro soubory

| Co | Jak |
|---|---|
| Formát | **PNG, JPG nebo GIF** |
| Název | bez diakritiky a mezer, malými písmeny (`letni-tabor-2026.png`) |
| Šířka | max. **600 px** — širší obrázek se v mnoha klientech ořízne |
| Velikost | ideálně do 200 kB, ať se e-mail načte i na mobilních datech |

**Nepoužívej WebP ani AVIF.** Outlook, řada webmailů a starší Android klienti
je nezobrazí a příjemci uvidí prázdné místo.

## Výměna obrázku

Soubory se cachují **7 dní**. Když nahradíš obrázek pod stejným názvem,
starší příjemci mohou až týden vidět původní verzi.

Pokud potřebuješ okamžitou změnu, **použij nový název souboru**
(`banner-v2.png`) a přepiš odkaz v e-mailu.

## Na co myslet u e-mailů

- Vždy vyplň `alt` text — velká část klientů blokuje obrázky ve výchozím stavu.
- Nikdy nedávej do obrázku informaci, která nesmí uniknout, když se nenačte
  (termín, cena, odkaz). Ta musí být i v textu.
- Gmail obrázky stahuje přes svou proxy a cachuje si je po svém, takže
  po odeslání kampaně už výměnu souboru nespoléhej.
