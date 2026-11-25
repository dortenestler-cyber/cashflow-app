# Übergabe · Kasse (CF)
Belegt: frei
Zuletzt aktualisiert: 2026-11-25

Zuständig für das ganze Repo cashflow-app. Jedes Claude-Konto darf diese Rolle übernehmen, aber immer nur eine Sitzung gleichzeitig. Regeln: `CLAUDE.md`, Abschnitt „Konten und Ablösung“.

Belegt-Zeile: `Belegt: Konto A · Sitzung <Link> · seit JJJJ-MM-TT HH:MM` oder `Belegt: frei`. Beim Start zuerst setzen und pushen, beim Ende auf `frei`. Bei nahendem Limit `· Limit erwartet` anhängen, bei Übernahme `· übernommen von Konto A`. Konten nur als „Konto A“ / „Konto B“, nie mit E-Mail.

## Stand in einem Satz
Version 1.0.6 (Build 488, 25.11.) läuft, keine offenen Bugs in `BUGS.md`.

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
- v485/v486: Apple Pay – zweite Zahlung kurz nach der ersten, gleiche Zahlungen, „schon gebucht“-Markierung, Datum als Betrag (BUGS Nr. 29, 30).
- Übergabe-Datei angelegt (24.11.).
