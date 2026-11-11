# Bug-Fix-Liste

| Nr. | Bug | Ursache | Status |
|---|---|---|---|
| 1 | Buchungen: Wischen über eine Buchung (Kopie/Löschen) wechselt zusätzlich die Ansicht (Täglich → Woche). | Die Wischgeste der Liste (Ansichtswechsel) reagiert auch auf Wischen in den Buchungszeilen (`.swr`). | behoben in v266: Zeilen-Wischen ist von der Ansichtswechsel-Geste ausgenommen (Liste und Budgetdetail). |
| 2 | Pennys Sprechblase überlagert ihren Kopf. | Position wurde an der verkleinerten Ruhe-Penny gemessen; beim Reagieren wächst sie, Antenne/Hut ragen zusätzlich heraus. | behoben in v267: Blase sitzt über der vollen Größe inkl. Antenne/Accessoires. |
