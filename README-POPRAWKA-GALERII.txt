AKTUALIZACJA GALERII — POPRAWKA ROUTINGU I WYGLĄDU

Ta paczka jest ŁATKĄ do istniejącego repozytorium, nie pełnym zastępstwem wszystkich danych. Została przygotowana tak, żeby zachować aktualny data/rooms.json i przesłane zdjęcia.

CO NAPRAWIA
- linki na stronie głównej kierują do /rooms/{slug}/ zamiast do osobnej, uproszczonej strony detail.html;
- istniejące strony pokoi korzystają z oryginalnego CSS i fontów Manrope z eksportu Framera;
- każda podstrona wczytuje tytuł, opis, cover i gallery z /data/rooms.json;
- zdjęcia można powiększać w lightboxie, nawigować strzałkami oraz klawiszami lewo/prawo, zamykać Esc;
- stare linki rooms/detail.html?slug=... przekierowują do nowego, spójnego adresu.

JAK WPROWADZIĆ
1. Rozpakuj ZIP obok folderu repozytorium.
2. Skopiuj zawartość paczki do lokalnego folderu repozytorium GitHub, ze zgodą na nadpisanie wskazanych plików.
3. NIE nadpisuj data/rooms.json ani assets/library/rooms — Twoje najnowsze zmiany CMS i zdjęcia powinny pozostać na miejscu. Ta paczka celowo nie zawiera tych folderów.
4. W GitHub Desktop przejrzyj zmiany, wpisz opis, np. "Fix room gallery routes and typography", kliknij Commit to main, potem Push origin.
5. Po zakończeniu wdrożenia Cloudflare otwórz /rooms/basen/?lang=pl i przetestuj galerię.

UWAGI
- Slugi URL są normalizowane do ASCII (np. garaż -> garaz), ale pole slug w data/rooms.json nie jest modyfikowane.
- Linki w nawigacji galerii prowadzą do sekcji strony głównej.
- Strona wymaga dostępnego /data/rooms.json i zgodnych plików zdjęć pod ścieżkami z tego pliku.
