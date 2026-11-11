# Bug-Fix-Liste

| Nr. | Bug | Ursache | Status |
|---|---|---|---|
| 1 | Buchungen: Wischen über eine Buchung (Kopie/Löschen) wechselt zusätzlich die Ansicht (Täglich → Woche). | Die Wischgeste der Liste (Ansichtswechsel) reagiert auch auf Wischen in den Buchungszeilen (`.swr`). | behoben in v266: Zeilen-Wischen ist von der Ansichtswechsel-Geste ausgenommen (Liste und Budgetdetail). |
