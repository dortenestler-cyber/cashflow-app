# Prüfauftrag: Fehlersuche und Behebung (alle Versionen)

Kurzform für den Chat: **„Führe PRUEFUNG.md aus.“** Optional mit Bereich, z. B. „… nur iPhone“ oder „… nur Buchungen“.

## Regeln
- Reine Fehlersuche und Behebung. Keine neuen Funktionen, kein Umbau, kein neues Design (Baustopp beachten).
- Ein Fehler ist: etwas funktioniert nicht, ist nicht erreichbar, verdeckt, abgeschnitten, springt,
  rechnet falsch oder wirft einen JS-Fehler. Geschmacksfragen sind keine Fehler → nur in `BACKLOG.md` notieren.
- Jeden Fehler erst nachstellen (Skript oder Screenshot), dann beheben, dann erneut prüfen.
  Der Fix darf andere Breiten/Geräte nicht verschlechtern: nach jedem Fix `tools/qa.py` für alle Profile erneut laufen lassen.
- Kleinster möglicher Eingriff, gezielter Edit, bestehende Muster übernehmen.
- Jeden behobenen Fehler in `BUGS.md` eintragen (Bug · Ursache · behoben in vNNN).
- Pro zusammenhängendem Fix eine Version: `./bump.sh NNN TT.MM.`, Commit `vNNN: …`, Push auf `main`.

## Versionen (Profile in `tools/qa.py`)
| Profil | Größe | steht für |
|---|---|---|
| iphone / iphone-se | 390×844 / 375×667, Touch | iPhone-PWA (Safari, ohne Scroll-Verankerung) |
| ipad-hoch / ipad-quer | 820×1180 / 1180×820, Touch | iPad |
| web-s … web-xxl | 1000×700 bis 1920×1080 | Web-App: schmale Seitenleiste (1000–1279), breite Seitenleiste (ab 1280) |

Bereichsgrenzen besonders prüfen: 699/700, 999/1000, 1279/1280 px.

## Ablauf
1. **Automatisch:** `python3 tools/qa.py` (alle Profile) und `python3 tools/qa.py --safari web-m web-xl`.
   Meldungen:
   - `JS-FEHLER`, `KONSOLE`, `RENDER-FEHLER`, `TEXT … undefined/NaN` → immer Fehler.
   - `H-OVERFLOW`, `OFF-RIGHT` → Inhalt ragt seitlich heraus.
   - `UNDER-SIDEBAR` → Inhalt unter der Seitenleiste.
   - `@unten COVERED … by tabbar/asstRoot/fab` → ganz unten gescrollt noch verdeckt, also nicht erreichbar.
   - `COVERED … by stickhead/lthead` (oben) → Kopfbereich überlappt Inhalt.
   - `SQUASHED` → Karte in scrollender Spalte gestaucht/abgeschnitten.
   - `SCROLL-SPRUNG` → Inhalt springt beim Scrollen (Kopfbereich klappt um, Nachladen, Animation).
   Jede Meldung prüfen: echter Fehler oder Fehlalarm? Fehlalarme kurz begründen.
2. **Sichtprüfung:** `python3 tools/qa.py --shots <profil>` und die Screenshots in `/tmp/qa/` ansehen:
   Überlappungen, abgeschnittene Texte, leere Flächen, falsche Ausrichtung, Penny verdeckt oder verdeckend.
3. **Abläufe von Hand (per Playwright-Skript) in iphone, ipad-quer, web-m und web-xl:**
   - Buchung anlegen, bearbeiten, kopieren, löschen; Wischgesten in der Liste.
   - Suche, Filter, Monatswechsel vor/zurück, Täglich/Summe.
   - Penny öffnen/schließen, Blase, Eingabe; Penny darf nichts Wichtiges verdecken und nicht verdeckt sein.
   - Sheets/Dialoge: öffnen, scrollen, schließen (Zurück, Esc, Tippen daneben); Tastatur am iPhone verdeckt keine Felder.
   - Unterseiten von Einstellungen öffnen und mit „Zurück“ verlassen; Browser-Zurück im Web.
   - Scrollen: Hauptbereich, eigenständig scrollende Spalten (z. B. linke Spalte Buchungen), Sheets; Kopfbereich klappt ohne Sprung.
   - Tastenkürzel im Web (1–6, N, /, Esc).
4. **Rechnen:** Summen auf Heute, Buchungen (Täglich/Summe), Rückblick und Planen stichprobenartig gegen die Einzelbuchungen nachrechnen.
5. **Ergebnis:** kurze Liste auf Deutsch: behobene Fehler mit Version, offene Punkte (falls ein Fix größer wäre → erst fragen), Fehlalarme.
