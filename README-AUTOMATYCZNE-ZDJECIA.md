# Automatyczna biblioteka zdjęć — instrukcja

Po jednorazowej konfiguracji Cloudflare wystarczy dodawać fotografie do folderów i wysłać zmiany przez GitHub Desktop. Skrypt `scripts/sync-photo-folders.js` aktualizuje pliki `data/*.json` przed opublikowaniem statycznej strony.

## Jednorazowe ustawienie Cloudflare Pages

W `Workers & Pages → szklarska-strona → Settings → Builds & deployments` ustaw:

- **Build command:** `node scripts/sync-photo-folders.js`
- **Build output directory:** `.`
- **Root directory:** puste (główny katalog repozytorium)

Nie ustawiaj `exit 0`, bo wtedy skrypt nie będzie wykonywany. Po zapisaniu ustawień uruchom ponownie wdrożenie.

## Zdjęcia pomieszczeń

Ścieżka: `assets/library/rooms/<identyfikator-pokoju>/`

Foldery używają identyfikatorów URL widocznych w `data/rooms.json`, np. `basen`, `living-room`, `kuchnia`, `garaz`, `kotlownia`, `sypialnia-lazienka`.

Najprostszy wariant — wszystkie zdjęcia w jednym folderze:

```text
assets/library/rooms/living-room/
  cover.webp
  salon-z-ogrodu.webp
  widok-na-okna.webp
  kominek.webp
```

- `cover.webp` (lub `cover.jpg`, `cover.png` itd.) jest zdjęciem głównym kafelka i dużą fotografią otwierającą galerię.
- Pozostałe obrazy w tym folderze stają się zdjęciami głównej galerii.
- Jeśli nie dodasz `cover`, skrypt pozostawi dotychczasową okładkę, o ile istnieje, i doda zdjęcia do galerii.
- Dozwolone formaty: JPG, JPEG, PNG, WebP, AVIF, GIF.
- Nazwy mogą być opisowe; kolejność jest alfabetyczna z uwzględnieniem liczb. Dla wybranej kolejności można stosować np. `01-salon.webp`, `02-kominek.webp`.

### Opcjonalnie: osobno zdjęcia normalne i zbliżenia

```text
assets/library/rooms/basen/
  cover.webp
  normalne/
    basen-z-ogrodu.webp
    widok-na-saune.webp
  closeup/
    mozaika.webp
    armatura.webp
```

Zdjęcia z folderu `normalne` (oraz pliki wrzucone bezpośrednio do folderu pokoju) trafią do głównej galerii. Zdjęcia w `closeup` pojawią się w osobnej sekcji **Detale i zbliżenia**. Nie trzeba numerować plików.

## Zdjęcia domu i otoczenia

Wrzuć je do `assets/library/property/`. Skrypt doda zdjęcia do galerii domu. Nowe podpisy domyślnie powstaną z nazw plików; można je potem dopracować w `data/property-gallery.json`.

## Rzuty kondygnacji

Dodaj jeden obraz do odpowiedniego folderu:

- `assets/library/plans/parter/`
- `assets/library/plans/pietro/`
- `assets/library/plans/poddasze/`

Najlepiej nazwij go `cover.webp`. Jeśli folder zawiera kilka obrazów, użyty zostanie `cover` albo pierwszy plik według nazwy.

## Wizualizacje sekcji „Potencjał”

Dla koncepcji użyj folderów:

- `assets/library/concepts/resort/`
- `assets/library/concepts/private-retreat/`
- `assets/library/concepts/boutique-hospitality/`

Umieść tam `cover.webp` i dodatkowe obrazy. Wtedy `cover` stanie się główną wizualizacją, a pozostałe obrazy zostaną wyświetlone na podstronie koncepcji.

## Publikowanie zmian

1. Skopiuj zdjęcia do folderów.
2. W GitHub Desktop wybierz `Commit to main`, a następnie `Push origin`.
3. Cloudflare uruchomi wdrożenie. W logu powinny pojawić się wpisy `[photo-folder-sync]` dla folderów, które zawierają zdjęcia.
4. Po statusie `Success` odśwież stronę skrótem `Ctrl+F5`.

Puste foldery `.gitkeep` nie kasują istniejących danych. Jeśli folder pomieszczenia zawiera zdjęcia, jego galeria jest synchronizowana z zawartością folderów — usunięcie fotografii z folderu usunie ją też z wygenerowanej galerii przy kolejnym wdrożeniu.
