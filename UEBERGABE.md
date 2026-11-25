# Übergabe · Kasse (CF)
Belegt: frei
Zuletzt aktualisiert: 2026-11-25

Zuständig für das ganze Repo cashflow-app. Jedes Claude-Konto darf diese Rolle übernehmen, aber immer nur eine Sitzung gleichzeitig. Regeln: `CLAUDE.md`, Abschnitt „Konten und Ablösung“.

Belegt-Zeile: `Belegt: Konto A · Sitzung <Link> · seit JJJJ-MM-TT HH:MM` oder `Belegt: frei`. Beim Start zuerst setzen und pushen, beim Ende auf `frei`. Bei nahendem Limit `· Limit erwartet` anhängen, bei Übernahme `· übernommen von Konto A`. Konten nur als „Konto A“ / „Konto B“, nie mit E-Mail.

## Stand in einem Satz
Version 1.2 (Build 497, 25.11.) läuft, keine offenen Bugs in `BUGS.md`.

## In Arbeit
- Nichts.

## Wartet auf
- Nutzerin: Status der fehlenden 2. Apple-Pay-Zahlung vom 24.11. im Protokoll (Einstellungen › Siri & Kurzbefehle). Fehlt sie dort, kam sie nie beim Server an (kein Netz/iOS-Automation).

## Nächstes Änderungsfenster
- 04.12.2026 (`cwAt` in `js/03-core-ui.js`, danach alle 14 Tage). Kandidat: `BACKLOG.md` Nr. 24 „Benachrichtigungen in Lachs“ (21.11., Wartefrist abgelaufen). Im Fenster Nutzungsauswertung und Penny-Prüfprompt laufen lassen.

## Entscheidungen
- 2026-11-24 · Nutzerin: Alle Claude-Konten dürfen auf beiden Repos arbeiten, z. B. wenn ein Konto sein Limit erreicht. Abstimmung nur über Belegt-Zeile und Übergabe-Datei · Grund: Sitzungen verschiedener Konten können sich keine Nachrichten schicken

- 2026-11-25 · Nutzerin: Neues App-Symbol „Pegel“ (Münze mit Wasserstand) sofort umsetzen, außerhalb des Änderungsfensters · Grund: ausdrücklicher Wunsch

## Fallstricke
- Direkt auf `main`: nie zwei Sitzungen gleichzeitig, vor jedem Commit `git fetch origin main` und abgleichen.
- `./bump.sh` läuft auch den Plausi-Kurzlauf (`tools/plausi.js --quick`) und bricht bei Rechenfehlern ab.

## Erledigt seit letzter Übergabe
- v487: Neues App-Symbol „Pegel“ (alle PNG-Größen inkl. maskable). Aufs iPhone kommt es erst nach Löschen und neu „Zum Home-Bildschirm“.
- v488: Leeren Knopf „Genauer mit KI“ unter Pennys festen Antworten entfernt.
- v489: Monatschart auf Heute: Tippen zeigt Markierung mit Datum und Ausgabenstand direkt im Chart (4 s).
- v490: Rücklagen-Balken (Planen): Inhalt beim Tippen direkt unter dem Chart statt als Meldung oben, Balken hervorgehoben.
- v491 = Version 1.1: Buchungen-Kopf nach Konzept 25 (Monat + Zeitraum, Hauptzahl mit Rein/Raus-Leiste, Geplant als eine Zeile, Rückzahlung als Chip, Tageskopf „Heute · Mi 25.11.“, Chart-Symbol entfällt). Auf Wunsch der Nutzerin sofort statt im Fenster. Branch `release-1.1`.
- v492 (noch Version 1.1, `REL_B`=492): Konzept 25 auf Kalender, Rückblick (Monat, Verlauf, Jahr), Wiederkehrende, Planen › Zukunft und Impulse übertragen (Backlog 26).
- v493: Rückblick › Ausgaben: Bereiche (Nach Bereichen) zugeklappt, Antippen klappt die Buchungen des Bereichs auf.
- v494: Bereiche im Rückblick klappen erst ihre Kategorien auf, jede Kategorie dann ihre Buchungen.
- v495: Vermögen › Sparkonten-Chart mit eigener Zeitraum-Auswahl (1W, 1M, 3M, 6M, YTD, 1J), `vRange`.
- v496: Sparkonten-Chart zeigt Zinsen im Zeitraum als goldene Fläche (eigene Skala, unteres Drittel), per Legende „Zinsen bisher“ ein-/ausblendbar (`vOff.__zins`).
- v497 = Version 1.2: Schuldenfrei neu (Ring, Ratenkette, Restschuld-Leiste mit Zinsanteil, Meilensteine, Eckdaten-Zeile), Erklärtext unten entfällt. Branch `release-1.2`.
- v485/v486: Apple Pay – zweite Zahlung kurz nach der ersten, gleiche Zahlungen, „schon gebucht“-Markierung, Datum als Betrag (BUGS Nr. 29, 30).
- Übergabe-Datei angelegt (24.11.).
