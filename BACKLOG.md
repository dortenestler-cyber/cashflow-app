# Backlog – gesammelte Änderungswünsche

Umsetzung erst nach Freigabe (siehe CLAUDE.md).

## 1. Einkauf mit Einkaufszettel abgleichen (umgesetzt in v147)

**Ziel:** Eine per Kurzbefehl erfasste Buchung (z. B. „Norma 25 €“ über Apple Pay oder Siri) wird mit dem Einkaufszettel verglichen: Was war geplant, was hat es wirklich gekostet?

**Auslöser**
- Eine Buchung aus Siri/Apple Pay in der Kategorie Lebensmittel (oder bei einem bekannten Supermarkt) wird gesichert.
- Auf dem Einkaufszettel sind Artikel abgehakt („Im Wagen“) oder noch offen.
- Ohne Zettel: kein Abgleich, nur die normale Buchung.

**Ablauf im Assistenten**
- „Norma 25,00 € · geplant ca. 19,40 € (8 Artikel im Wagen) · +5,60 € (+29 %)“
- Knöpfe:
  - **Zettel abschließen**: Abgehakte Artikel kommen in den Verlauf, offene bleiben stehen.
  - **Mehr als geplant gekauft**: Die Differenz wird als Spontankauf vermerkt und zählt im Impuls-Rückblick.
  - **Passt so**: Abgleich ohne Markierung speichern.

**Preise lernen**
- Fehlt genau ein Preis, ergibt die Differenz seinen Preis. Die App fragt: „Haferdrink also ca. 1,95 €?“
- Bei mehreren unbekannten Artikeln lernt die App nichts, sie markiert sie nur.
- Preise werden pro Händler gemerkt (Norma ≠ Rewe).

**Auswertung**
- Planabweichung je Einkauf und im Monatsschnitt („Du kaufst im Schnitt 18 % mehr als geplant“).
- Korbvergleich je Händler: gleicher Zettel, was kostet er bei Norma im Vergleich zu Rewe.
- Platz: Auswertung › Einkauf oder als Abschnitt in Future (Hebel).

**Daten**
- Pro Einkauf ein Eintrag: Datum, Händler, Buchungs-ID, Artikel (Name, Menge, geschätzter Preis), Summe geplant, Summe tatsächlich.
- Die Buchung verweist auf den Einkauf, damit der Abgleich später noch einmal geöffnet werden kann.

**Entscheidungen (2026-11-07)**
- Nachfragen ab ±10 % oder 3 € Abweichung.
- „Zettel abschließen“ entfernt nur die abgehakten Artikel.
- Mehrere Läden: Jede Zahlung wird mit den seit dem letzten Abgleich abgehakten Artikeln verglichen. Kommen mehrere Zahlungen gleichzeitig, wird die Summe verglichen („Norma + Rewe: 33,47 € · geplant ca. 29 €“).

## 2. Apple Pay: mehrere Zahlungen sammeln (umgesetzt in v147)

**Problem:** In der Zwischenablage liegt nur die letzte Zahlung. Zwei Zahlungen ohne Öffnen der App dazwischen bedeuten, dass eine verloren geht.

**Lösung**
- Kurzbefehl: „Zwischenablage abrufen“, dann Text `[Zwischenablage]` ⏎ `Apple Pay [Händler] [Betrag] [Aktuelles Datum mit Uhrzeit]`, dann „In Zwischenablage kopieren“.
- App: liest alle Zeilen, die mit „Apple Pay“ beginnen, und ignoriert alle anderen. Bereits übernommene Zeilen (Händler + Betrag + Uhrzeit) merkt sie sich und bucht sie nicht doppelt.
- Der Assistent zeigt alle neuen Zahlungen in einer Vorschau: „Alle buchen“ oder jede einzeln bearbeiten.
- Die Uhrzeit wird als Buchungszeit übernommen, statt der Zeit des Öffnens.
