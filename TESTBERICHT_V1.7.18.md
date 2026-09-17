# Testbericht – Eberos Charakter-Builder v1.7.18-r1

Prüfdatum: 15. September 2026

## Ergebnis

Der neue Build hat alle ausgeführten Prüfungen bestanden.

- 33 Struktur-, Konsistenz-, Syntax-, Dokumentations- und Offline-Assetprüfungen bestanden.
- 21 Browser-, Rechen-, Migrations-, Druck- und Interaktionsprüfungen bestanden.
- 335 integrierte Alt- und Neutests im Builder bestanden.
- Keine JavaScript-Laufzeitfehler festgestellt.
- Mobilansicht bei 360 Pixel Breite ohne horizontalen Überlauf.
- Lokaler Offline-Neustart mit Service Worker, v1.7.18 und Regelstand 11 bestanden.

## Geprüfte Rennformel

- Die zentrale Regelkonfiguration enthält `runningMultiplier: 2`.
- Bewegung 15 ergibt Rennen 30.
- Bewegung 0, 1, 25 und 75 ergibt Rennen 0, 2, 50 und 150.
- Je ein zusätzlicher wirksamer Punkt in ST, KS oder GS erhöht Rennen exakt um 2.
- Je ein zusätzlicher Punkt in allen drei Grundwerten erhöht Rennen exakt um 6.
- Ein gezieltes wirksames KS −1 senkt Bewegung um 1 und Rennen um 2.
- Die vorhandene Belastungslogik bleibt unverändert; ihre Änderung an Bewegung wird für Rennen exakt verdoppelt.
- Wirksame KS 0 setzt Bewegung und Rennen auf 0.
- Spielercharakter, NPC und Vertrauter verwenden dieselbe Berechnung.
- Oberfläche und Druckkarte zeigen `Bewegung × 2` und bei Bewegung 15 den Wert 30.
- Nach einem JSON-Export-/Import-Rundlauf wird Rennen erneut korrekt berechnet.

## Geprüfte Regelmigration

- Eine gültige Regelkonfiguration aus Regelstand 10 wird vor der Änderung gesichert.
- Unabhängige Regelwerte und zusätzliche Angaben bleiben erhalten.
- Der Regelstand wird auf 11 und der verbindliche Rennfaktor auf 2 gesetzt.
- Wiederholtes Laden erzeugt keine weitere Migration oder Sicherung.
- Ein beschädigter Faktor in Regelstand 11 wird gesichert und kontrolliert auf die offiziellen Regeln zurückgesetzt.
- Regel-Reset und Regel-Export enthalten den Faktor 2.

## Regression und Integrität

- Schema 25 bleibt unverändert.
- 86 Fähigkeiten, 450 Kräfte und 30 Kraftschulen bleiben erhalten.
- Sämtliche bereits vorhandenen Dateien unter `data/` sind gegenüber v1.7.17 bytegleich; nur `eberos-v1.7.18.js` wurde ergänzt.
- Keine aktive Rennberechnung und kein aktiver Test erwartet noch `Bewegung × 4` oder Rennen 60 bei Bewegung 15.
- Alle 109 Offline-Ressourcen sind eindeutig und vorhanden.

## Ausgeführte Prüfprogramme

- `scripts/test-v1718.mjs`: 33/33 bestanden.
- `scripts/test-v1718-browser.mjs`: 21/21 bestanden.
- Integrierte Testkette im Builder: 335/335 bestanden.
