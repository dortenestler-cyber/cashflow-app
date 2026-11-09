# CashFlow-App – Arbeitsregeln für Claude

## Projekt
- iPhone-Web-App (PWA) über GitHub Pages, Branch `main`.
- Alles in `index.html` (~5000 Zeilen, Vanilla JS/CSS). `sw.js` = Offline-Cache.
- Nutzerdaten liegen nur lokal auf dem iPhone, nie personenbezogene Daten ins Repo.

## Arbeitsweise
- Änderungswünsche erst sammeln (Liste führen), umsetzen erst nach Freigabe des Nutzers.
- Bugs immer sofort beheben und pushen.

## Sparsam arbeiten
- index.html NIE komplett lesen. Erst mit grep die relevante Stelle suchen,
  dann nur diese Zeilen lesen (offset/limit).
- Änderungen nur per gezieltem Edit, Datei nie neu schreiben.
- Keine Rückfragen bei kleinen, eindeutigen Aufgaben. Einfach umsetzen.
- Nur bei größeren oder mehrdeutigen Änderungen kurz nachfragen.

## Nach jeder Änderung
1. Version in `sw.js` erhöhen (`cashflow-vNNN`).
   Gleiche Nummer und Datum auch in `APP_VER` in index.html eintragen (`'NNN (TT.MM.)'`).
2. JS-Syntax prüfen (`node --check` auf das extrahierte Script).
3. Commit direkt auf `main`, Nachricht: `vNNN: <kurz, deutsch>`.
4. Push.

## Antworten
- Deutsch, kurz: 1–3 Sätze, was geändert wurde und welche Version.
- Kein Code im Chat, keine Zusammenfassung der Arbeitsschritte.
