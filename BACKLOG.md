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

## 3. Wechselgeld (Aufrunden) als Split-Buchung (umgesetzt in v148)

**Ziel:** Revolut rundet jede Kartenzahlung auf und legt die Differenz im Robo-Advisor an. Die App bildet das automatisch ab: Jede passende Zahlung erzeugt die Ausgabe und eine verknüpfte Umbuchung.

**Beispiel:** Norma 21,37 € → Ausgabe 21,37 € (Lebensmittel, von Flow) + Umbuchung 0,63 € Flow → Robo-Advisor.

**Regeln (Einstellungen › Wechselgeld)**
- Ein/aus, mehrere Regeln möglich (z. B. je Karte ein anderes Ziel).
- Gilt für: Apple-Pay-Zahlungen, bestimmte Karten (Kartenname aus der Wallet-Automation), optional auch manuelle Buchungen von einem gewählten Konto.
- Aufrunden: auf volle 1 € und Multiplikator ×1 / ×2 / ×5 / ×10, wie bei Revolut. Glatte Beträge ergeben 0 €, dann entsteht keine Umbuchung.
- Quelle: wie die Ausgabe (Standard) oder ein festes Konto.
- Ziel: frei wählbar (Standard Robo-Advisor), auch Tresor- oder Sparkonto. Ist das Ziel ein Depot-Konto, wächst der Depotwert mit.
- Notfallbremse: Wechselgeld in ein gesperrtes Konto ist erlaubt, weil Geld hineingeht und nicht heraus.

**Verknüpfung**
- Ausgabe und Umbuchung zeigen aufeinander. Wird der Betrag geändert, rechnet die App das Wechselgeld neu. Beim Löschen der Ausgabe fragt sie, ob die Umbuchung mitgelöscht wird (Standard: ja).
- Buchungsmaske: Chip „Wechselgeld 0,63 € → Robo-Advisor“, pro Buchung abschaltbar und Ziel änderbar.
- Rückgängig im Assistenten nimmt beide Buchungen zurück.

**Über die ganze App**
- Budgets: Wechselgeld ist eine Umbuchung, kein Konsum. Es zählt nicht als Ausgabe in Kategorien und Auswertungen, verringert aber den freien Betrag der Quelle.
- Einkaufszettel: Der Abgleich vergleicht den Einkaufsbetrag ohne Wechselgeld. Im Verlauf steht es extra („+0,63 € angelegt“). Der Budget-Check rechnet das erwartete Wechselgeld (Ø der letzten Einkäufe) mit ein, wenn die Quelle das Einkaufsbudget ist.
- Future: Ø Wechselgeld pro Monat zählt als Sparrate (Unabhängigkeit, Ziel-Rechner). Eigene Zeile „Wechselgeld in 20 Jahren“.
- Auswertung/Übersicht: „Wechselgeld diesen Monat: 12,40 € in 23 Zahlungen“.
- Apple-Pay-Kurzbefehl: optional zusätzlich „Transaktion › Karte“ in die Zeile, damit Regeln je Karte greifen.

**Entscheidungen (2026-11-07)**
- Ziel: der Robo-Advisor, der als Depot in der App existiert. Die Umbuchung geht auf das Depot-Konto und ist mit der Robo-Advisor-Position verknüpft (wie ein Sparplan), damit der Depotwert mitwächst.
- Multiplikator: aktuell ×1, in den Regeln wählbar (×1 bis ×10), Änderung jederzeit.
- Quelle: immer das Budget der jeweiligen Ausgabe (Flow-Einkauf → Wechselgeld aus Flow, Gönn-dir-Einkauf → aus Gönn dir).

## 4. Alle Kurzbefehle sammeln in der Zwischenablage (umgesetzt in v148)

**Problem:** „Einkauf“ und „Buchung“ überschreiben die Zwischenablage. Was vorher drin lag (z. B. eine Apple-Pay-Zahlung), geht verloren.

**Lösung**
- Alle drei Kurzbefehle: „Zwischenablage abrufen“, dann Text `[Zwischenablage]` ⏎ `Stichwort: … · [Aktuelles Datum]`, dann „In Zwischenablage kopieren“.
- Stichworte: `Einkauf:`, `Buchung:`, `Apple Pay`.
- Die App verarbeitet jede Zeile einzeln nach ihrem Stichwort und merkt sich übernommene Zeilen (inklusive Uhrzeit), damit nichts doppelt ankommt.
- Der Assistent zeigt eine Sammelübersicht („2 Artikel · 1 Apple-Pay-Zahlung · 1 Buchung“) mit „Alles übernehmen“ oder einzeln bearbeiten.
- Zeilen ohne Stichwort werden wie bisher erkannt.
- Grenze: Kopiert man selbst etwas, ist alles Nicht-Übernommene weg. Verlustsicher wäre nur die Server-Ablage („Siri & Kurzbefehle“).

**Nachgezogen in v149:** Regeln je Karte und Wechselgeld-Zeile in der Übersicht.

## 5. Buchungsmaske neu, nach Vorlage (umgesetzt in v153)

- Farbiger Kopf je Typ (Ausgabe rot, Einnahme grün, Umbuchung blau), ✕ links, ✓ rechts, Typ-Umschalter, großer Betrag, Wirkung darunter.
- Tastatur als eigenes Panel mit AC + − × ÷ =; offen nur bei neuen Buchungen, schließt per Wischen oder beim Antippen eines Feldes. Dabei „Zuletzt verwendete Kategorien“ im Kopf.
- Kacheln mit Auswahlliste: Datum, Kategorie | Konto (Umbuchung: Von | Nach), Person | Projekt, Notiz + Belegfoto.
- Schnell erfassen im Notizfeld (Mikrofon, Vorschläge): „Rewe 25“ füllt nur leere Felder.
- Alles andere unter „Weitere Angaben“.

## 6. Wechselgeld nur über Einstellungen (umgesetzt in v154)

- Einstellungen › Wechselgeld › „Von diesen Konten und Budgets“: Auswahl gilt für Apple Pay, Siri und manuelle Buchungen. Cash/Bargeld ist anfangs abgewählt.
- Buchungsmaske ohne Wechselgeld-Knopf, nur Infozeile im Kopf („+ 0,63 € Wechselgeld → Ziel“).
