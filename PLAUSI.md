# Plausibilitätsprüfung: rechnet die App richtig, zeigen alle Ansichten dasselbe?

Kurzform für den Chat: **„Führe PLAUSI.md aus.“**

## Festlegungen (Nutzerin, 17.11.2026)
- Prüfskript im Repo **und** Selbsttest in der App als Penny-Hinweis (seit v419, nur lesend, einmal pro Datenstand und Tag, nur Daten ab 01.10.2026 – Archiv bleibt außen vor).
- Testdaten: Musterdaten + Zusatzbuchungen; echter Export vorerst ausgesetzt (bliebe nur lokal, `.gitignore`).
- Rechenfehler sofort beheben und pushen, Eintrag in `BUGS.md`.
- Maßstab: Kontostand laut Bank. Toleranz 1 Cent.
- Monatsbeginn: Gehaltstag = letzter Werktag des Monats (Einstellung seit v419; geprüft mit 1, 25, 28 und letztem Werktag).
- Depot- und Krypto-Live-Kurse ausgeklammert.
- Läuft bei jedem `./bump.sh` automatisch mit (Kurzlauf).
- Reihenfolge: 1 Konten & Budgets · 2 Rückblick & Prognose · 3 Vermögen & Depot · 4 Penny.

## Aufruf
- `node tools/plausi.js` – alle Szenarien (7 Stichtage × 4 Monatsbeginne)
- `node tools/plausi.js --quick` – Kurzlauf (in `bump.sh`)
- `node tools/plausi.js --data CashFlow-Sicherung-JJJJ-MM-TT.json` – zusätzlich mit echtem Export. Datei nie committen.

Stichtage: Monatsmitte, Monatsende 23:30, Monatsanfang 00:30, 29.02.2028, Zeitumstellung Okt./März, Silvester 23:59 (Europe/Berlin).

## Regeln (`plausiRun in js/06-tools.js`, im Seitenkontext, später auch als Selbsttest nutzbar)
### 1 Konten & Budgets – umgesetzt
- Buchungen vollständig: eindeutige ID, Typ, Betrag ≥ 0, Datum, bekanntes Konto/Ziel, Ziel ≠ Quelle
- Beträge auf Cent genau (Warnung)
- Monate lückenlos ohne Überlappung, 28–31 Tage, Beginn am eingestellten Tag, heute im aktuellen Monat
- Budget: Ausgaben/Einnahmen/Umbuchungen unabhängig nachgerechnet; verfügbar − verbraucht = Rest; keine NaN
- Übertrag = Rest des Vormonats (Bestand voll, „Rest bleibt“ nur positiv, sonst 0)
- Sinking Funds ist Bestand und steht nicht in `BUDG`
- Kontostand = Vormonat + Zu- − Abflüsse (+ Zinsen) und = Start + alle Buchungen
- Geplante Buchungen zählen nicht im Ist
- Fixkosten nie doppelt, auch nicht bei erneutem Lauf; Monatsabschluss wiederholbar
- Kontoabgleich trifft den Bankstand (auch ins Minus), zweiter Abgleich bucht nichts
- Heute: „Übrig im Monat“, „Heute noch frei“ und Budget-Reste = berechnete Werte
### 2 Rückblick & Buchungen – umgesetzt seit v513
- Rein/Raus/Gespart im Rückblick = Buchungen (Quelle `flowSum`, ohne Kontoabgleich); Kopf „übrig“ = Geldfluss = Rein − Raus − Gespart; „Am Monatsende noch da“ = Konten + Budgets + Geplantes.

### 2 Rückblick & Prognose – offen
Rückblick-Summen = Summe der Buchungen je Monat/Kategorie; Jahr = Σ Monate; Prognose = Stand + Fixkosten + Geplantes.
### 3 Vermögen & Depot – offen
Vermögen = Σ Konten + Bestände − Schulden (ohne Live-Kurse); Sicherung ↔ Wiederherstellung verlustfrei; Sync-Verschlüsselung hin und zurück.
### 4 Penny – offen
Zahlen in Penny-Antworten und -Hinweisen = calc-Werte.

## Ablauf
1. Skript laufen lassen, jede `FEHLER`-Zeile nachstellen, beheben, `./bump.sh`, Commit, Push, `BUGS.md`.
2. `WARNUNG` prüfen: echter Fehler oder bewusst so? Begründung in den Bericht.
3. Neue Regel bei jedem behobenen Rechenfehler ergänzen, damit er nicht wiederkommt.
