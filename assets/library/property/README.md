# Zdjęcia nieruchomości

W tym folderze umieszczaj zdjęcia wykorzystywane w galerii domu i poza galeriami poszczególnych pomieszczeń.

## Karuzela zdjęć domu

Karuzela na stronie głównej pobiera kolejno sześć plików WebP:

1. `property-01.webp`
2. `property-02.webp`
3. `property-03.webp`
4. `property-04.webp`
5. `property-05.webp`
6. `property-06.webp`

Wgraj je bezpośrednio do tego folderu: `assets/library/property/`.
Nazwy i rozszerzenia muszą być dokładnie takie jak powyżej. Zdjęcia są wyświetlane w kolejności 01 → 06. Zastąp stare pliki JPG nowymi WebP; stare JPG mogą pozostać w folderze, ale nie będą używane przez karuzelę.

Zdjęcia WebP działają w nowoczesnych przeglądarkach i są zalecanym formatem dla tej galerii.

## Mapa działki

Aktualny podgląd mapy działki jest zapisany jako `geoportal-parcel-preview.webp`.
Nie dodawaj mapy z niepotwierdzonym przebiegiem granic działki.

## Osobna galeria całego domu

Zdjęcia z tych folderów są prezentowane na osobnej podstronie „Galeria całego domu”, do której prowadzi ostatni kafel w sekcji „Piętro” na stronie głównej. Dodawaj je do dwóch folderów:

- `assets/library/property/normalne/` — zwykłe zdjęcia domu
- `assets/library/property/closeup/` — detale i zbliżenia

Wgraj dowolną liczbę zdjęć (JPG, JPEG, PNG, WebP lub AVIF). Nazwy plików mogą być dowolne. Kolejność jest alfabetyczna z uwzględnieniem numerów w nazwie. Podczas budowania strony skrypt synchronizuje te foldery z `data/property-detail-gallery.json`.

Ta galeria jest niezależna od sześciu zdjęć `property-01.webp`–`property-06.webp` używanych w karuzeli na stronie głównej. Nie jest wyświetlana na podstronach poszczególnych pokoi. Nie zmieniaj tych sześciu plików, jeśli chcesz zachować karuzelę bez zmian. Nie zmieniaj tych sześciu plików, jeśli chcesz zachować karuzelę bez zmian.
