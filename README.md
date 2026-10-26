# Portfolio działu aplikacji

Jednostronicowa strona z realizacjami działu: sterowanie maszyn, PLC, HMI, SCADA, napędy i robotyka. Wygląd wzorowany na induprogress.pl. Czysty HTML, CSS i moduły ES; narzędzia, testy i publikacja w Node.js 22+.

## Uruchomienie lokalne

```powershell
npm ci
npm run dev
```

Podgląd: http://127.0.0.1:4173. Wersja produkcyjna: `npm run build`, podgląd `npm run preview`.

## Testy

```powershell
npm test
npx playwright install chromium
npm run test:e2e
npm run test:live
```

- `npm test` (Node Test Runner): dane realizacji, zdjęcia i filmy, schematy sterowania, kalkulator FEFCO, podświetlanie kodu, wynik buildu bez adresów IP, haseł i e-maili.
- `npm run test:e2e` (Playwright, desktop i telefon): ładowanie strony, podgląd zdjęcie → film (bez sieci zostaje zdjęcie), filtry, okno szczegółów z filmem i schematem, zakładki kodu, demo FEFCO, menu mobilne, brak poziomego przewijania, demo HMI (interlock, cykl, alarm, kwitowanie) i SCADA (sygnały, kursor, porównanie, alarmy, raport, CSV). YouTube jest w testach blokowany, więc sprawdzamy też zachowanie bez sieci.
- `npm run test:live` (ręcznie, z siecią): przewija do każdej karty i sprawdza, że film producenta faktycznie gra. Nie działa w CI, żeby publikacja nie zależała od YouTube.

## Publikacja

`.github/workflows/ci.yml`: przy push i pull request do `main` uruchamia testy jednostkowe, build i e2e. Po zielonych testach na `main` publikuje `dist/` na GitHub Pages (Source: GitHub Actions). Pull requesty nie publikują.

## Treść

- `assets/js/data.js` — liczby, 7 realizacji, branże, kompetencje, protokoły, proces pracy. Każda realizacja ma `media` (zdjęcie i film producenta maszyny) oraz `control` (schemat sterowania).
- `assets/js/media.js` — podgląd karty: 1 s zdjęcia, potem 15 s filmu, w pętli. Film ładuje się przy zbliżeniu do widoku i zatrzymuje poza nim. Przy ograniczeniu ruchu podgląd startuje ręcznie.
- `assets/js/schematic.js` — schemat sterowania SVG: poziom nadrzędny → sterownik → sieć → urządzenia.
- `assets/js/code-samples.js`, `assets/js/fefco.js` — przykłady kodu (Structured Text i Node.js) oraz działający kalkulator formatek FEFCO 201.
- `assets/js/sim.js` — symulacje bez DOM (testowane w Node.js): nalewarka z sekwencją, interlockami i słowem błędów oraz syntetyczne partie mieszalnika.
- `assets/js/hmi-demo.js`, `assets/js/scada-demo.js` — interaktywny panel HMI (receptury, START/STOP, tryb ręczny, usterki czujników, kwitowanie) i SCADA (trendy, porównanie partii, kursor czasu, alarmy, raport, eksport CSV).

Zasady treści:

- bez nazw klientów, użytkowników końcowych, lokalizacji i autorów; zamiast nich branża, np. „Producent maszyn do obróbki kamienia”,
- bez haseł, adresów IP i danych zdalnego dostępu (README projektów je zawierają — nie kopiować),
- liczby i funkcje tylko takie, które wynikają z repozytoriów projektów,
- każda realizacja ma zdjęcie i film producenta maszyny; gdy producent ich nie ma, wybieramy inny projekt (test `data.test.mjs` to pilnuje). Źródła są w prywatnym `.local/zrodla-mediow.md` (poza Git, bo zawiera nazwy firm).
