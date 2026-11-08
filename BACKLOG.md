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

## 7. Altersvorsorge in die Prognose, Future ausgeblendet (umgesetzt in v155)

- Auswertung › Prognose hat unten den Bereich „Altersvorsorge“ (Rentenlücke, führt zur Altersvorsorge-Seite).
- Reiter Future einmalig ausgeblendet; lässt sich unter Einstellungen › Funktionen wieder einschalten.

## 8. Design-Prüfung (2026-11-07, umgesetzt in v161)

*Hoch*
1. Dunkelmodus: Haupt-Buttons mit weißer Schrift auf hellem Lila (2,7:1) → kontrastreicher.
2. Kalender: Beträge in Tageszellen abgeschnitten → kompakt ohne Cent.
3. Tab-Leiste: höchstens 5 Reiter, Rest unter „Mehr“; Name einheitlich „Mehr“.
4. Einnahmen-Grün im Hellmodus zu schwach (3,4:1) → dunkler.
5. Touch-Ziele unter 44 px (Rechenzeichen, Segmente, „Alle“, Stift, Monatsziel-Chips) vergrößern.

*Mittel*
6. Auswertung: Segment-Leisten einheitlich im Stil.
7. Schwebende Knöpfe verdecken Inhalt → mehr Abstand unten.
8. Buchungsmaske: Rechentasten-Spalte entzerren.
9. Trends: laufender Monat nicht als „−100 %“ werten.
10. Vermögen: Supabase-Anleitung aus der Auswertung in die Einstellungen.
11. Übersicht-Karte: Titel bricht um → Monat kleiner darunter.

*Niedrig*
12. Einstellungen: schlanker Kopf.
13. Einstellungsliste: Suche.
14. Impulse-Segmente passend ohne Anschnitt.
15. Ungenutztes Glas-Design-CSS entfernen.

## 9. Assistent, Mitteilungen, Automatisierungen (Vorschläge 2026-11-08, offen)

**Befund:** Assistent nur feste Satzmuster ohne Folgefragen-Kontext und ohne Aktionen. Mitteilungen werden nur beim Schließen der App geplant, spätere Ereignisse (Apple Pay) lösen nichts aus. Apple Pay läuft über die Zwischenablage (verlustanfällig), obwohl die Server-Ablage („inbox“) existiert. Kein Badge. Ruhe- und Briefing-Zeiten fest.

*Assistent*
- A1. Optionale KI (Claude) über eigene Supabase-Function „ai“, Schlüssel als Supabase-Secret. Nur Aggregate senden (Budgets, Kategorie-Summen, Termine), keine Einzelbuchungen. Antwort als Text + Aktionsvorschläge, nie automatisch ausgeführt. Regex-Antworten bleiben als Offline-Weg.
- A2. Antworten mit Aktionsknöpfen (Umbuchung vorausgefüllt, Rest ins Sparziel, Frist vormerken) inkl. Rückgängig.
- A3. Folgefragen mit Kontext („und im Oktober?“, „nur Rewe“).
- A4. Beim Öffnen max. 3 Hinweise nach Dringlichkeit („Nächster Schritt“).
- A5. „Warum?“ zeigt die Rechnung hinter jedem Hinweis.
- A6. Monatsabschluss als Dialog: Rest verteilen und buchen.

*Mitteilungen*
- B1. Sofort-Mitteilung nach Apple-Pay-Zahlung mit geschätztem Budget-Rest (Server, Händler→Budget-Zuordnung in briefData).
- B2. Erinnerung bei veralteten Daten (Ablage voll, Stand > 48 h).
- B3. Badge am App-Icon (offene Siri-Einträge, fällige Wünsche, Fristen ≤ 3 Tage).
- B4. Ruhezeit, Briefing-Zeiten und Tageslimit einstellbar, mit Priorität.
- B5. Neue Anlässe: Gehalt da → verteilen, Abo teurer, Budget 80 %, Sparziel erreicht, Monatsletzter.
- B6. Jede Mitteilung öffnet die passende Aktion im Assistenten.

*Automatisierungen*
- C1. Apple Pay standardmäßig über Server-Ablage statt Zwischenablage (Anleitung anpassen).
- C2. Gehalt automatisch verteilen (Vorlage „zuerst sparen“, Vorschau der Umbuchungen).
- C3. Lernende Kategorie-Regeln je Händler, Liste in den Einstellungen.
- C4. Abo-Wächter per Mitteilung (Preisänderung ±5 %, neue Abos aus newSubs).
- C5. Kalender-Abo (.ics) für Abbuchungen, Fristen, Sparpläne.
- C6. Mehr Siri-Antworten ohne App-Öffnen („Kann ich mir 80 € leisten?“, „Was kommt diese Woche?“).
- C7. Monatlicher Kontoabgleich mit Korrekturbuchung.

**Vorgeschlagene Reihenfolge:** C1+B1 → B3+B4 → A2–A4 → A1 → Rest.
Hinweis: Änderungen an der Function „push“ (PUSH_FN) auf v7, abwärtskompatibel; muss danach neu eingespielt werden.
