# Übergabe · Kasse (CF)
Belegt: frei
Zuletzt aktualisiert: 2026-11-24

Zuständig für das ganze Repo cashflow-app. Jedes Claude-Konto darf diese Rolle übernehmen, aber immer nur eine Sitzung gleichzeitig. Regeln: `CLAUDE.md`, Abschnitt „Konten und Ablösung“.

Belegt-Zeile: `Belegt: Konto A · Sitzung <Link> · seit JJJJ-MM-TT HH:MM` oder `Belegt: frei`. Beim Start zuerst setzen und pushen, beim Ende auf `frei`. Bei nahendem Limit `· Limit erwartet` anhängen, bei Übernahme `· übernommen von Konto A`. Konten nur als „Konto A“ / „Konto B“, nie mit E-Mail.

## Stand in einem Satz
Version 1.0.3 (Build 485, 24.11.) läuft, keine offenen Bugs in `BUGS.md`.

## In Arbeit
- Nichts.

## Wartet auf
- Nichts.

## Nächstes Änderungsfenster
- 04.12.2026 (`cwAt` in `js/03-core-ui.js`, danach alle 14 Tage). Kandidat: `BACKLOG.md` Nr. 24 „Benachrichtigungen in Lachs“ (21.11., Wartefrist abgelaufen). Im Fenster Nutzungsauswertung und Penny-Prüfprompt laufen lassen.

## Entscheidungen
- 2026-11-24 · Nutzerin: Alle Claude-Konten dürfen auf beiden Repos arbeiten, z. B. wenn ein Konto sein Limit erreicht. Abstimmung nur über Belegt-Zeile und Übergabe-Datei · Grund: Sitzungen verschiedener Konten können sich keine Nachrichten schicken

## Fallstricke
- Direkt auf `main`: nie zwei Sitzungen gleichzeitig, vor jedem Commit `git fetch origin main` und abgleichen.
- `./bump.sh` läuft auch den Plausi-Kurzlauf (`tools/plausi.js --quick`) und bricht bei Rechenfehlern ab.

## Erledigt seit letzter Übergabe
- Übergabe-Datei angelegt (24.11.).
