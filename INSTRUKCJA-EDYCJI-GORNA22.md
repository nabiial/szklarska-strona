# Górna 22 — edycja treści i zdjęć

## Najważniejsze pliki

- `index.html` — polska strona główna.
- `en/index.html` — angielska strona główna.
- `de/index.html` — niemiecka strona główna.
- `data/rooms.json` — nazwy i opisy 16 pomieszczeń w trzech językach.
- `data/site-config.json` — link Google Maps, link do Geoportalu i zdjęcia karuzeli sekcji „Rezydencja”.
- `assets/library/rooms/<slug>/` — zdjęcia poszczególnych pomieszczeń.
- `assets/library/property/` — zdjęcia całej nieruchomości i eksport mapy Geoportalu.

## Zmiana opisów pomieszczeń

Otwórz `data/rooms.json`. Każdy pokój jest osobnym obiektem. Edytuj pola:

- `title`, `description` — polski tytuł i opis.
- `title_en`, `description_en` — angielski tytuł i opis.
- `title_de`, `description_de` — niemiecki tytuł i opis.

Nie zmieniaj pola `slug`, jeśli nie chcesz zmieniać adresu podstrony. Nie zmieniaj też technicznych wartości pola `floor` (`parter`, `pietro`, `poddasze`) — są używane do grupowania pomieszczeń. Widoczne nazwy kondygnacji są osobnymi etykietami na stronach głównych.

## Dodawanie zdjęć pomieszczeń

Zdjęcia dodawaj do `assets/library/rooms/<slug>/`, a nie do folderu `rooms/<slug>/` z plikami strony.

Przykład dla basenu:

```
assets/library/rooms/basen/cover.webp
assets/library/rooms/basen/01.webp
assets/library/rooms/basen/normalne/02.webp
assets/library/rooms/basen/closeup/03.webp
```

- `cover.webp` — okładka pomieszczenia.
- Zdjęcia w folderze pokoju i w `normalne/` trafiają do głównej galerii.
- Zdjęcia w `closeup/` trafiają do sekcji detali i zbliżeń.

Po dodaniu zdjęć skrypt `scripts/sync-photo-folders.js` aktualizuje `data/rooms.json` podczas budowania strony w Cloudflare Pages. Zachowuj nazwy folderów zgodne z wartością `slug`.

## Zdjęcia w karuzeli sekcji „Rezydencja”

Otwórz `data/site-config.json`. Karuzela ma sześć pozycji. Pierwsze dwie korzystają z zachowanych zdjęć z eksportu strony. Cztery kolejne wskazują pliki:

- `assets/library/property/residence-03.webp`
- `assets/library/property/residence-04.webp`
- `assets/library/property/residence-05.webp`
- `assets/library/property/residence-06.webp`

Wgraj zdjęcie pod wskazaną nazwą, najlepiej w formacie WebP. Po publikacji puste miejsce w karuzeli automatycznie zastąpi fotografia. Tekst alternatywny zmienisz w polach `alt.pl`, `alt.en` i `alt.de` w tym samym obiekcie JSON.

## Mapa działki i linki

W `data/site-config.json` edytuj:

- `googleMapsUrl` — adres otwierany przez przycisk Google Maps.
- `geoportalUrl` — adres otwierany przez przycisk Geoportal.
- `geoportalImage` — ścieżka do obrazu mapy działki.

Aby dodać rzut działki, umieść potwierdzony eksport z Geoportalu pod ścieżką `assets/library/property/geoportal-parcel.webp`. Nie rysuj granic samodzielnie na podstawie poglądowej mapy. Obecny link do Geoportalu przybliża mapę do adresu; nie zastępuje potwierdzenia numeru i granic działki.

## Zmiana treści głównej strony

Teksty strony głównej są zapisane w plikach HTML:

- polski: `index.html`
- angielski: `en/index.html`
- niemiecki: `de/index.html`

Możesz użyć edycji pliku na GitHubie (ikona ołówka). Zmieniaj tekst wewnątrz odpowiedniego nagłówka lub akapitu, nie usuwając otaczających znaczników HTML i klas `framer-...`. Placeholder `[X]` oznacza nieuzupełnioną powierzchnię — zastąp go potwierdzoną wartością dopiero po jej sprawdzeniu.

## Publikacja

Po zapisaniu zmian w repozytorium Cloudflare Pages powinien uruchomić nowy build połączony z gałęzią produkcyjną. Zmiany przygotowane w gałęzi `gorna-22-content-refresh` trzeba najpierw przejrzeć i scalić do `main`.
