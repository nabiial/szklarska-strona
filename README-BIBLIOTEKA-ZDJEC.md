# Biblioteka zdjęć — instrukcja uruchomienia

## Co jest przygotowane

- `data/rooms.json` — 16 pomieszczeń, nazwy PL/EN/DE, piętro, zdjęcie główne i tablica zdjęć galerii.
- `data/property-gallery.json` — edytowalna galeria domu i otoczenia.
- `data/floor-plans.json` — trzy rzuty kondygnacji.
- `data/concepts.json` — trzy koncepcje wraz z główną wizualizacją i polem na dodatkowe wizualizacje.
- `data/site-settings.json` — edytowalny adres, link Google Maps i link do Geoportalu.
- `.pages.yml` — konfiguracja Pages CMS, w tym wielozdjęciowe pola galerii (do 300 zdjęć na pokój / koncepcję).
- `js/13-library-sync.js` — synchronizuje dane CMS z kafelkami pomieszczeń, galerią domu, rzutami, koncepcjami i linkiem do mapy.
- `rooms/detail.html` + `js/14-room-gallery.js` — jedna wspólna strona galerii, wykorzystywana dla każdego pokoju. Nowy rekord w CMS nie wymaga tworzenia osobnego pliku HTML.
- `js/15-concept-detail.js` — wczytuje dane koncepcji i dodatkowe galerie z `data/concepts.json`.

## Ważne: obecne fotografie są przykładowe

Okładki zostały skopiowane do `assets/library/` z dotychczasowego eksportu, aby CMS miał edytowalne pliki początkowe. Podmień je na rzeczywiste fotografie przed publikacją. Galerie `gallery` są celowo puste — dodaj do nich właściwe zdjęcia w Pages CMS.

## Jak uruchomić Pages CMS

1. Utwórz repozytorium na GitHubie i wgraj całą zawartość tego folderu do katalogu głównego repozytorium (nie wgrywaj samego ZIP-a jako pojedynczego pliku).
2. Otwórz https://app.pagescms.org i zaloguj się przez GitHub.
3. Zainstaluj aplikację Pages CMS dla wybranego repozytorium. CMS odczyta konfigurację `.pages.yml` z katalogu głównego.
4. Otwórz kolekcję **Pomieszczenia i galerie**, wybierz pomieszczenie i dodaj wiele zdjęć w polu **Zdjęcia w galerii pomieszczenia**. Zdjęcie główne jest osobnym polem `cover`. Ustaw je na jeden z plików galerii, jeśli ma także pojawiać się jako pierwsza fotografia.
5. Analogicznie edytuj **Zdjęcia domu i otoczenia**, **Rzuty kondygnacji**, **Wizje — Potencjał** i **Ustawienia nieruchomości**. W polu `Link Google Maps` wklej pełny link skopiowany z Google Maps.
6. Zapisz zmiany. Pages CMS zapisuje pliki i obrazy w repozytorium GitHub.

## Jak opublikować na Cloudflare Pages

1. W Cloudflare Pages utwórz projekt z istniejącego repozytorium GitHub.
2. Ponieważ to statyczny eksport, na start nie ustawiaj komendy build. Jako katalog wyjściowy wybierz katalog główny repozytorium `.`.
3. Po każdym commicie z Pages CMS Cloudflare Pages powinien wdrożyć nową wersję plików.
4. Dopiero po sprawdzeniu wdrożenia podłącz domenę.

## Podgląd lokalny

`fetch()` z plików JSON nie działa zwykle przy otwieraniu strony bezpośrednio przez `file://`. Uruchom lokalny serwer w katalogu głównym projektu, np. w terminalu:

```bash
python -m http.server 8000
```

Następnie otwórz `http://localhost:8000/`.

## Uwaga dotycząca języków

Dane pomieszczeń i koncepcji posiadają pola PL/EN/DE. Główna strona PL i EN jest podłączona do tych danych. Pełna, osobna niemiecka strona główna nadal wymaga przygotowania; same pola `title_de` i `description_de` nie tłumaczą całej statycznej zawartości strony głównej.
