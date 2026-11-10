# CashFlow-App – Arbeitsregeln für Claude

## Projekt
- iPhone-Web-App (PWA) über GitHub Pages, Branch `main`.
- Aufbau seit v254 (Vanilla JS/CSS, keine Build-Schritte):
  - `index.html`: nur Grundgerüst und Verweise.
  - `css/app.css`: alle Styles.
  - `js/01-core-icons.js` … `js/12-boot.js`: klassische Skripte, die sich einen globalen
    Namensraum teilen und in Nummern-Reihenfolge geladen werden.
    01 Icons · 02 Zustand, Laden, Migrationen, calc · 03 Navigation, gemeinsame Bausteine ·
    04 Penny/Assistent/KI · 05 Ansichten (Heute, Buchungen, Planen, Rückblick) ·
    06 Werkzeuge (Abgleich, Import, Einkaufszettel, Ziele, Altersvorsorge) · 07 Mehr/Einstellungen ·
    08 render + Buchungsmaske · 09 Sync/Push/Sicherung · 10 Vermögen/Depot ·
    11 Sprache/Siri/Wechselgeld · 12 PIN, Zurück-Gesten, Start.
  - `sw.js`: Offline-Cache. Die Dateiliste `FILES` muss jede Datei aus `css/` und `js/` enthalten.
- Code, der beim Laden sofort läuft, darf nur Funktionen aus früheren Dateien aufrufen.
  Start-Code gehört in `12-boot.js`.
- Nutzerdaten liegen nur lokal auf dem Gerät, nie personenbezogene Daten ins Repo.
- Sinking Funds ist ein Bestand, kein Monatsbudget (`isStock`), und steht nicht in `BUDG`.

## Arbeitsweise
- Änderungswünsche erst sammeln (Liste führen), umsetzen erst nach Freigabe des Nutzers.
- Bugs immer sofort beheben und pushen.

## Sparsam arbeiten
- Dateien NIE komplett lesen. Erst mit grep die relevante Stelle suchen,
  dann nur diese Zeilen lesen (offset/limit).
- Änderungen nur per gezieltem Edit, Dateien nie neu schreiben.
- Keine Rückfragen bei kleinen, eindeutigen Aufgaben. Einfach umsetzen.
- Nur bei größeren oder mehrdeutigen Änderungen kurz nachfragen.

## Nach jeder Änderung
1. `./bump.sh NNN TT.MM.` ausführen. Das setzt die Version in `sw.js` (`cashflow-vNNN`),
   in `APP_VER` und in allen `?v=`-Verweisen und prüft die JS-Syntax.
2. Neue Datei in `css/` oder `js/`? Dann in `index.html` und in `FILES` in `sw.js` eintragen.
3. Commit direkt auf `main`, Nachricht: `vNNN: <kurz, deutsch>`.
4. Push.

## Antworten
- Deutsch, kurz: 1–3 Sätze, was geändert wurde und welche Version.
- Kein Code im Chat, keine Zusammenfassung der Arbeitsschritte.
