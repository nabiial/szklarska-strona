# Biblioteka zdjęć — najważniejsze informacje

**Do masowego dodawania zdjęć używaj folderów i GitHub Desktop.** Nie musisz przesyłać 300 zdjęć pojedynczo przez Pages CMS.

Pełna instrukcja: `README-AUTOMATYCZNE-ZDJECIA.md`.

## Jak działa automatyczna biblioteka

- `assets/library/rooms/<slug>/` — zdjęcia każdego pomieszczenia.
- `assets/library/property/` — zdjęcia domu i otoczenia.
- `assets/library/plans/<slug>/` — rzuty poszczególnych kondygnacji.
- `assets/library/concepts/<slug>/` — wizualizacje koncepcji z sekcji „Potencjał”.
- `scripts/sync-photo-folders.js` — skanuje powyższe foldery i aktualizuje dane `data/*.json` przed wdrożeniem.
- `js/13-library-sync.js` — wyświetla dane galerii na stronie głównej.
- `js/16-cms-room-page.js` — tworzy stronę galerii pokoju, w tym osobną sekcję zbliżeń.

## Jednorazowa konfiguracja Cloudflare Pages

W `Workers & Pages → szklarska-strona → Settings → Builds & deployments` ustaw:

- **Build command:** `node scripts/sync-photo-folders.js`
- **Build output directory:** `.`
- **Root directory:** puste

To ważne: bez tej komendy Cloudflare opublikuje pliki, ale nie przeskanuje folderów zdjęć.

## Podstawowa zasada

W folderze pomieszczenia umieść `cover.webp` jako okładkę i dowolną liczbę dodatkowych zdjęć. Skrypt automatycznie dopisze je do galerii i zmodyfikuje wygenerowane dane. Po skopiowaniu zdjęć otwórz GitHub Desktop, zatwierdź zmianę (`Commit to main`) i wyślij ją (`Push origin`). Po wdrożeniu o statusie `Success` zdjęcia będą widoczne na stronie.
