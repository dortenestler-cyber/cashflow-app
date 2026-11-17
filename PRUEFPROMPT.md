# Prüf-Prompt: Struktur, Visualisierung und Penny (CashFlow-App)

> Diesen Prompt an Claude geben (in diesem Repo). Ergebnis ist ein **Prüfbericht mit
> Änderungsliste** – nichts umsetzen, bis die Nutzerin freigibt (CLAUDE.md: sammeln,
> dann freigeben; „Eins rein, eins raus“).

---

## Rolle und Ziel

Du bist UX-Architekt und Finanz-Coach-Designer. Prüfe die CashFlow-App (Vanilla-JS-PWA,
`js/01…12`, `css/app.css`) daraufhin, ob

1. **Themen logisch gebündelt** sind (jede Funktion hat genau einen klaren Ort, verwandte
   Dinge liegen beieinander, nichts ist doppelt oder verwaist),
2. **jede Visualisierung** (Charts, Balken, Ringe, Kacheln) in wenigen Sekunden eine
   **Schlussfolgerung und eine Handlung** ermöglicht,
3. **Penny** auf jeder Seite als passende Unterstützung wirkt – regelbasiert, wo es reicht,
   mit **echter KI**, wo sie Mehrwert bringt.

Leitfrage für alles: *„Was soll ich jetzt wissen – und was soll ich jetzt tun?“*

## Arbeitsweise (sparsam, wie in CLAUDE.md)

- Dateien nie komplett lesen: erst `grep`, dann gezielt Zeilen lesen.
- Einstiegspunkte: `TABS` (`js/03-core-ui.js`), `moreItems`/`moreTools`/`toolBar`
  (`js/07-more.js`), `REPG`/`repSub`, `viewWish`-Tabs, `viewGeld` (`js/05-views.js`),
  `render` (`js/08-render.js`), Vermögen (`js/10-vermoegen.js`), Penny/KI
  (`js/04-penny.js`: `tipsList0`, `pnPage`, `pnBudget`, `aiToolDefs`, `aiReview`, `aiOnce`),
  Feature-Schalter `featOn`/`viewCfg`.
- Charts: `donut`, `lineChart`, `barChart`, `cumChart`, `miniCum`, `catTrend`, `simBar`,
  `simLine` (05), `yrChart`, `yrsBars`, `tresorChartHtml` (06), `depChart`, `vaultChart` (10).
- Keine Nutzerdaten ins Repo, keine Annahmen über echte Beträge.

---

## Teil A – Bestandsaufnahme (Funktionslandkarte)

Erstelle eine Tabelle **aller** Funktionen mit: Name · Ort (Reiter › Unterreiter / Werkzeug /
Einstellungen-Gruppe) · Zweck in einem Satz · Datenquelle (`S.…`) · Häufigkeit
(täglich / wöchentlich / monatlich / jährlich / einmalig) · weitere Einstiege (Chips,
Penny, Siri, Tipp-Aktionen) · per `featOn` abschaltbar?

Ist-Stand als Ausgangspunkt (prüfen und ergänzen):

| Bereich | Inhalt heute |
|---|---|
| Heute | Dashboard, Konten-Karussell, Tagesbudget |
| Buchungen / Kalender | Liste, Kalender, Tages-/Wochen-/Monatssummen |
| Planen | Monat · Fixkosten · Zukunft · Ziele & Wünsche (+ Sparziele, Verzicht, Journal) |
| Vermögen | Konten, Sparkonten/Tresor, Depot, Krypto, Vermögensverlauf |
| Rückblick | Monat (Analyse, Ausgaben) · Verlauf · Impulse; Prognose, Simulator, Budget, Bericht, Jahr |
| Werkzeuge | Jahresplaner, Sparkonten, Wechselgeld, Schulden, Projekte, Rückzahlungen, Gehalt verteilen, Monatswechsel, Altersvorsorge, Belege, Steuer, Einkaufszettel, Berichte |
| Einstellungen | Buchen & Kategorien, Schutz, Assistent, Aussehen, Daten & Sync, Berichte, Hilfe |

## Teil B – Prüfpunkte Bündelung & Informationsarchitektur

**B1 Ein Ort pro Thema.** Gibt es Funktionen an mehreren Orten (z. B. *Sparkonten* in
Werkzeugen **und** Einstellungen; *Berichte* in Werkzeugen **und** Einstellungen; *Journal*
in Planen **und** Rückblick; *Budget* in Rückblick **und** Einstellungen; *Jahr* in
Rückblick **und** Jahresplaner)? Für jede Dopplung: Hauptort festlegen, übrige Stellen nur als
Verknüpfung.

**B2 Trennung „Einstellen“ vs. „Benutzen“.** Einstellungen enthalten nur Konfiguration.
Alles, was man regelmäßig *benutzt* (Sparkonten anlegen/sperren, Berichte, Archiv-Ansicht),
gehört in einen Arbeitsbereich.

**B3 Zeitachse als Ordnungsprinzip.** Prüfe, ob die Reiter einer klaren Logik folgen:
*Jetzt* (Heute) → *Vergangenheit* (Buchungen, Rückblick) → *Zukunft* (Planen) →
*Bestand* (Vermögen). Passt jede Funktion in genau eine Zeitebene? Beispiele zum Prüfen:
Prognose/Simulator (Zukunft, aber in Rückblick?), Monatswechsel (Übergang), Fixkosten
(Zukunft oder Bestand?).

**B4 Themen-Cluster.** Schlage Bündel vor und prüfe sie, z. B.
- *Geld fließt*: Buchungen, Kalender, Import, Abgleich, Wechselgeld, Rückzahlungen
- *Geld planen*: Budgets, Gehalt verteilen, Fixkosten/Abos, Jahresplaner, Monatswechsel
- *Geld wächst*: Sparkonten, Sinking Funds (Bestand, `isStock`), Ziele, Depot, Altersvorsorge
- *Geld schützen*: Schulden, Regeln/Notfallbremse, Wartezeit für Wünsche, Verzicht, Impulse, Journal
- *Papierkram*: Belege & Gewährleistung, Steuer, Verträge/Kündigungsfristen, Export, Archiv
- *Alltag*: Einkaufszettel, Projekte, E-Auto-Laden
Ist jedes Cluster in der App sichtbar zusammenhängend?

**B5 Werkzeug-Raster.** Sind die 13 Werkzeuge zu viele gleichrangige Kacheln? Sollten
Werkzeuge in ihren thematischen Reiter wandern (Prinzip `toolBar` seit v232) und das
Raster nur noch Seltenes enthalten?

**B6 Tiefe und Wege.** Jede tägliche Aufgabe ≤ 2 Taps, jede monatliche ≤ 3. Liste Aufgaben,
die tiefer liegen. Gibt es Sackgassen (Seite ohne Zurück/ohne Folgeaktion)?

**B7 Querverbindungen.** Sind verwandte Dinge verlinkt? Beispiele: Budget-Überzug →
Kategorie-Buchungen; Ziel → Sparkonto → Einzahlung; Abo → Vertrag → Kündigungsfrist → Beleg;
Schuld → Monatsrate in Fixkosten; Wunsch → Ziel → Sparrate in „Gehalt verteilen“;
Projekt → Rückzahlungen.

**B8 Benennung.** Einheitliche Begriffe (z. B. „Sparkonten“ vs. „Tresor“ vs. „Sinking Funds“,
„Rückblick“ vs. „Bericht“ vs. „Dein Jahr“, „Ziele“ vs. „Sparziele“). Glossar vorschlagen.

**B9 Feature-Schalter & Profile.** Bleibt die Struktur logisch, wenn Funktionen per `featOn`
ausgeblendet werden (leere Reiter, verwaiste Chips, Penny verweist auf Ausgeblendetes)?

**B10 Nutzung.** Werte die lokale Nutzungsstatistik (`useGet`, Einstellungen › Nutzung) als
*Konzept* aus: Was wird selten genutzt und ist Kandidat für „Eins raus“ oder Zusammenlegung?

**B11 Monatsrhythmus.** Gibt es einen geführten Ablauf für wiederkehrende Rituale
(Wochen-Check-in, Monatswechsel, Gehaltseingang verteilen, Jahresabschluss/Steuer)?
Sind diese an einem Ort auffindbar?

## Teil C – Prüfpunkte Visualisierung

Für **jede** Grafik eine Zeile: Ort · Charttyp · Frage, die sie beantwortet · Kernaussage in
einem Satz ablesbar? · Handlung direkt daneben? · Bewertung (behalten / verbessern / ersetzen
/ streichen).

**C1 Eine Frage pro Grafik.** Jede Grafik beantwortet genau eine Frage („Reicht mein Geld bis
Monatsende?“, „Wo bin ich drüber?“, „Wächst mein Vermögen?“). Grafiken ohne klare Frage
markieren.

**C2 Passender Typ.** Verlauf über Zeit → Linie/kumulativ; Vergleich von Kategorien →
sortierte Balken; Anteil an einem Ganzen → Donut nur bei ≤ 5 Teilen; Soll/Ist →
Fortschrittsbalken mit Soll-Markierung. Fehlbesetzungen melden.

**C3 Soll-Linie und Bezug.** Haben Budget- und Verlaufsgrafiken eine Referenz (Soll-Tempo
heute, Vormonat, Ø 3/6 Monate, Ziel)? Ohne Bezug keine Schlussfolgerung.

**C4 Aussage als Überschrift.** Statt „Ausgaben nach Kategorie“ → „Lebensmittel 18 % über
Plan“. Prüfe, ob Titel/Untertitel die Erkenntnis formulieren.

**C5 Ampel & Konsistenz.** Gleiche Farbe bedeutet überall dasselbe (gut/warn/schlecht,
Einnahmen/Ausgaben, Konto-Farben). Hell- und Dunkelmodus prüfen, Farbe nie alleiniger
Bedeutungsträger (Symbol/Text zusätzlich).

**C6 Von der Grafik zur Handlung.** Jedes Balkensegment/Datum antippbar → Buchungen dazu
(Drill-down) und eine konkrete Aktion (Budget anpassen, umbuchen, Abo prüfen, Wunsch
verschieben).

**C7 Zahlen lesbar.** Einheiten, gerundete Euro, Tooltips (`barTip`), Achsen nur wo nötig,
keine Grafik ohne Zahl zum Ablesen. Lesbar auf iPhone-Breite (320–430 px).

**C8 Leer- und Randzustände.** Erster Monat, keine Daten, ein einzelner Ausreißer,
negative Salden, sehr viele Kategorien – wie verhalten sich die Charts?

**C9 Doppelte Grafiken.** Zeigen mehrere Seiten dieselbe Aussage mit anderem Chart
(Heute-Kurve, Rückblick-Verlauf, Prognose, Simulator)? Zusammenführen oder klar abgrenzen.

**C10 Fehlende Grafiken.** Wo fehlt eine Visualisierung, die eine Entscheidung erleichtert?
Kandidaten: Fixkosten-Quote am Einkommen, Sparquote im Verlauf, Abo-Summe pro Jahr,
Schuldenfrei-Datum, Ziel-Erreichungsdatum, Sinking-Fund-Deckung je Topf, Netto-Vermögen
(Vermögen − Schulden).

**C11 Kennzahlen-Kacheln.** Je Bereich maximal 3 Leitkennzahlen oben (z. B. Heute:
frei verfügbar, Tagesbudget, Tage bis Gehalt). Prüfe, ob das jeweils die richtigen sind.

## Teil D – Prüfpunkte Penny

Bestand: regelbasierte Hinweise (`tipsList0`), Seitenreaktion/Stimmung (`pnPage`, `pMood`,
`pnBudget`), Assistent mit Chips, KI-Chat mit Werkzeugen (`budget_status`, `spend_summary`,
`upcoming`, `subscriptions`, `journal`, `shopping_list`, `propose_shopping`,
`auffaelligkeiten`, `wishes`, `propose_transfer`, `propose_booking`, `propose_wish`,
`list_bookings`), KI-Monatsrückblick (`aiReview`), Beleg-/Bon-Lesen, Händler-Erkennung.

**D1 Rolle pro Seite.** Lege für jede Seite fest, was Penny dort *ist*:

| Seite | Penny-Rolle | Beispiel-Hinweis |
|---|---|---|
| Heute | Lotsin: „Was ist heute wichtig?“ | „Noch 212 € für 9 Tage – 23 €/Tag. Morgen geht die Miete ab.“ |
| Buchungen | Ordnerin | „3 Buchungen ohne Kategorie – soll ich sie zuordnen?“ |
| Planen › Monat | Planerin | „Lebensmittel-Tempo reicht bis zum 24. Vorschlag: 40 € aus Freizeit umbuchen.“ |
| Planen › Fixkosten | Prüferin | „Streaming: 3 Abos, 41 €/Monat. Kündigungsfrist Netflix in 12 Tagen.“ |
| Planen › Ziele | Motivatorin | „Urlaub: bei aktueller Rate im Juli erreicht, mit +25 € im Mai.“ |
| Vermögen | Erklärerin | „Depot −4 % diesen Monat, langfristig +11 %. Kein Handlungsbedarf.“ |
| Rückblick | Analystin | „Teuerster Wochentag: Samstag. 60 % der Impulskäufe nach 20 Uhr.“ |
| Werkzeuge | Assistentin für den jeweiligen Ablauf | Monatswechsel: „Rest 85 € – in Sinking Funds oder Puffer?“ |

Prüfe Ist gegen Soll: Wo schweigt Penny, obwohl sie helfen könnte? Wo redet sie zu viel?

**D2 Regel oder KI?** Ordne jeden Hinweistyp ein:
- *Regel* (schnell, offline, kostenlos, deterministisch): Budgetstand, Fälligkeiten,
  Fristen, fehlende Kategorien, Sync-Status.
- *KI* (Mehrwert durch Sprache/Zusammenhang): Muster über mehrere Datenquellen,
  „Warum“-Erklärungen, Monats-/Jahresrückblick, Priorisierung mehrerer Ziele, freie Fragen,
  Spar-Vorschläge mit Begründung, Belege lesen.
Für jede vorgeschlagene KI-Stelle: Mehrwert, Kosten (Token/Monat, `aiUse`-Limit),
Modell (`aiCfg().chat` vs. `.deep`), Offline-Fallback.

**D3 Kontext-KI je Seite.** Vorschlag prüfen: ein kleiner „Penny fragen“-Knopf pro Seite,
der die KI mit dem **Seitenkontext** startet (Daten der aktuellen Ansicht + passende
Werkzeuge) und 2–3 vorgefertigte Fragen anbietet („Warum bin ich drüber?“, „Was kann ich
diesen Monat noch tun?“, „Vergleich mit Vormonat“). Antwort immer mit einer
Aktionsschaltfläche (über `propose_*`), nie nur Text.

**D4 Grafik erklären.** Kann Penny jede Grafik in einem Satz deuten („Was sehe ich hier?“)?
Regelbasiert für Standardaussagen, KI nur auf Wunsch.

**D5 Proaktiv, aber ruhig.** Höchstens ein ungefragter Hinweis pro Seite, nach Schwere
sortiert (`sev`), wegklickbar (`dismTips`), kein Wiederholen ohne neue Lage. Prüfe
Häufigkeit, Dopplungen zwischen Push-Mitteilungen, Tipps und Penny-Sprechblase.

**D6 Fehlende KI-Werkzeuge.** Welche Daten kann die KI heute nicht abfragen? Kandidaten:
Ziele/Sparkonten-Stand, Sinking Funds, Depot/Vermögen, Schulden, Verträge/Fristen, Projekte,
Rückzahlungen, Jahresplaner, Regeln. Fehlende Vorschlags-Werkzeuge: Budget ändern,
Ziel-Rate ändern, Abo als „prüfen“ markieren.

**D7 Vertrauen & Datenschutz.** Zeigt Penny, worauf ein KI-Hinweis beruht (Zeitraum,
Zahlen)? Werden nur nötige Daten gesendet (`aiFilter`)? Sind KI-Antworten als solche
erkennbar? Keine Ausführung ohne Bestätigung.

**D8 Ton & Persona.** Einheitlich, kurz, konkret, keine Schuldgefühle, Zahlen statt
Adjektiven. Stimmung/Mimik passt zur Lage (`pMood`).

**D9 Lernschleife.** Merkt sich Penny Entscheidungen (abgelehnte Tipps, gelernte Regeln
`ruleLearn`) und passt Hinweise an?

## Teil E – Ergänzende Prüfpunkte (Logik & Konsistenz)

**E1 Zahlen stimmen überall überein.** Dieselbe Kennzahl (frei verfügbar, Budgetrest,
Vermögen, Sparquote) liefert auf Heute, Planen, Rückblick, Penny und Push denselben Wert
(gleiche `calc`-Quelle, gleicher Finanzmonat `S.start`).

**E2 Sinking Funds.** Wird es überall als Bestand behandelt (`isStock`), nie als Monatsbudget,
nicht in `BUDG`, nicht in Budget-Ampeln oder „über Budget“-Hinweisen?

**E3 Umbuchungen.** Zählen Umbuchungen nirgends als Ausgabe/Einnahme (Charts, Sparquote,
KI-Summen)?

**E4 Zeiträume.** Finanzmonat vs. Kalendermonat konsistent? Monatsnavigation (`off`)
wirkt auf alle Grafiken einer Seite gleich?

**E5 Zukunft vollständig.** Prognose berücksichtigt Fixkosten, Abos, geplante Buchungen,
Jahresplaner, Schuldenraten, Sparraten und erwartete Rückzahlungen.

**E6 Status-Zustände.** Jede offene Aufgabe (Monatswechsel fällig, Siri prüfen, Belege
fehlen, Abgleich offen) erscheint mit Badge am richtigen Ort **und** einmal bei Penny –
nicht an fünf Stellen.

**E7 Barrierefreiheit.** Kontraste, Tippflächen ≥ 44 px, `aria-label` an Charts und
Symbol-Knöpfen, Schriftgröße skalierbar, Bewegungen respektieren „Bewegung reduzieren“.

**E8 Leistung.** Seiten mit vielen Charts bleiben flüssig (Caching wie `TIPC`, keine
Neuberechnung bei jedem Scroll).

**E9 Offline.** Alles außer KI/Sync/Kursen funktioniert offline; KI-Knöpfe zeigen offline
einen klaren Zustand statt Fehler.

**E10 Eins rein, eins raus.** Jeder Vorschlag, der etwas hinzufügt, nennt, was dafür
entfällt oder zusammengelegt wird.

---

## Ausgabeformat

1. **Funktionslandkarte** (Teil A, Tabelle).
2. **Befunde** je Prüfpunkt: ✅ passt · ⚠️ verbesserbar · ❌ Problem – mit Fundstelle
   (`datei:zeile`) und einem Satz Begründung.
3. **Neue Struktur** als Baum (Reiter › Unterreiter › Inhalte) im Vergleich zu heute,
   mit Liste „wandert von → nach“.
4. **Visualisierungs-Tabelle** (Teil C) mit Bewertung.
5. **Penny-Konzept** je Seite (Rolle, Regel-Hinweise, KI-Funktionen, neue Werkzeuge,
   geschätzte KI-Kosten/Monat).
6. **Änderungsliste**, priorisiert nach Nutzen ÷ Aufwand, jede Zeile mit:
   Nr · Titel · Nutzen · Aufwand (S/M/L) · betroffene Dateien · **dafür entfällt** ·
   Risiko. Bugs (E1–E5) getrennt und zuerst – die werden sofort behoben.
7. Keine Umsetzung von Funktionsänderungen ohne Freigabe.
