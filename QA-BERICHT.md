# QA-Bericht iPhone – 16.11.2026 (v369 → v370)

Getestet per Playwright mit iPhone SE (320 px), iPhone 13 (390 px), iPhone 15 Pro Max (430 px), Touch-Emulation, Offline-Modus.

## Behobene Bugs (v370)
| # | Bereich | Fehler | Status |
|---|---------|--------|--------|
| 1 | Buchungsmaske | Rechnung „5 − 10“ ergab eine Ausgabe von −5 € (wurde gespeichert). | behoben: Fehlermeldung „Der Betrag ist negativ“ |
| 2 | Zahleneingabe (Einrichtung, Ziele, Import u. a.) | „2.500“ (deutscher Tausenderpunkt ohne Cent) wurde als 2,50 € gelesen. | behoben: wird als 2.500 € erkannt |

## Bestanden
- Ladezeit lokal ca. 0,55 s bis `load`, keine JS-Fehler in der Konsole.
- Kein waagrechtes Scrollen auf allen Reitern, auch nicht bei 320 px; keine Tippflächen unter 30 px gefunden.
- Offline: Neustart ohne Netz lädt aus dem Cache, Daten bleiben erhalten.
- Leere Buchung → Hinweis „Bitte einen Betrag eingeben“. Doppeltes Komma wird ignoriert.
- HTML in der Notiz (XSS-Versuch) wird nicht ausgeführt.
- Sync: Ende-zu-Ende-verschlüsselt (AES-GCM, PBKDF2 250.000 Runden), Konfliktschutz über `rev`, Nachsync bei `online` und beim Öffnen.

## Hinweise (kein Bug, nur zur Entscheidung nach dem Baustopp)
- `÷ 0` wird stillschweigend übergangen (9,5 ÷ 0 = 9,5) statt einer Meldung. → behoben in v381: Meldung „Teilen durch 0 geht nicht“.
- PIN ist nur eine Bildschirmsperre: Daten in `localStorage` sind unverschlüsselt; PIN-Hash ist ein einfacher SHA-256 (bei 4 Stellen schnell durchprobierbar), keine Sperre nach Fehlversuchen gefunden. → v380: PBKDF2 und Wartezeit nach 5 Fehlversuchen; Daten weiterhin unverschlüsselt.
- Budget-Felder (`type=number`) nehmen negative Werte an. → behoben in v381.
- iPhone SE: schwebender Penny-Knopf verdeckt beim Start die Beschriftung des ersten Schnellknopfs. → behoben in v381: Penny ist dort kleiner.
