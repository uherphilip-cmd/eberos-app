# Technischer Abschlussbericht – Eberos Charakter-Builder v1.7.18-r1

## Ergebnis

Version 1.7.18 etabliert `Rennen als Aktion = Bewegung × 2` als verbindliche Kernregel. Die frühere Builder-Entscheidung für den Faktor 4 wird damit bewusst abgelöst.

- App-Version: 1.7.18-r1
- Charakterschema: 25, unverändert
- Regelstand: 11
- Ausgangsbuild: v1.7.17-r1
- Zielordner: `output/eberos-pwa-v1.7.18/`

## Umsetzung

Der offizielle Faktor 2 ist in der zentralen Regelkonfiguration unter `derivedValues.runningMultiplier` hinterlegt. Ein gemeinsamer Helfer erzeugt sowohl den Rennwert als auch den sichtbaren Formeltext. Die zwei historisch vorhandenen Aufrufpfade für abgeleitete Werte verwenden damit dieselbe autoritative Regelquelle; es wurde keine weitere Formelüberschreibung ergänzt.

Die Berechnung verwendet weiterhin die vorhandene Bewegung aus wirksamer KS + GS + ST. Alle bestehenden Modifikatoren und die Sonderregel `wirksame KS 0 → Bewegung 0` bleiben unangetastet. Rennen ist der gesamte Wert der Aktion, nicht ein zusätzlicher Bonus zur Bewegung.

## Regelmigration

Gültige gespeicherte Regelkonfigurationen aus Regelstand 10 werden einmalig gesichert und auf Regelstand 11 ergänzt. Eigene Kostenbänder und unabhängige Zusatzfelder bleiben erhalten; nur der offizielle Rennfaktor wird auf 2 festgelegt. Bereits gültige Regelstände 11 werden unverändert geladen. Beschädigte aktuelle Regeldateien werden gesichert und kontrolliert durch die offiziellen Standardregeln ersetzt.

Der geschützte Regel-Editor, Zurücksetzen, Vorversion und Regel-Export berücksichtigen den Rennfaktor. Eine aktuelle Regeldatei mit einem anderen Faktor wird abgelehnt; eine gültige ältere Regeldatei wird kontrolliert migriert.

## Geänderte und neue Dateien

- `eberos-charakter-builder.html`: Version, Regelstand, zentrale Regeldefinition, Berechnung, Migration und historische aktive Testwerte.
- `data/eberos-v1.7.18.js`: integrierte Rechen-, Grenz-, Migrations- und Renderer-Tests.
- `service-worker.js`, `manifest.webmanifest`, `index.html`, `Start-Eberos-PWA.ps1`, `PWA-INSTALLATION.md` und externer Browserlink: Versionierung und Offline-Cache.
- `ÄNDERUNGEN_V1.7.18.md`: bewusste Regelentscheidung und Kompatibilität.
- `TESTBERICHT_V1.7.18.md`: ausgeführte Prüfungen.
- `TECHNISCHER_ABSCHLUSSBERICHT_V1.7.18.md`: dieser Abschlussbericht.
- `VORSCHAU_V1.7.18.png`: geprüfte mobile Vorschau.
- `scripts/build-v1718.mjs`, `scripts/eberos-v1.7.18.js`, `scripts/test-v1718.mjs` und `scripts/test-v1718-browser.mjs`: reproduzierbarer Build und Prüfungen.

Ältere Buildordner und historische Änderungsdokumente wurden nicht verändert. Die bestehenden Katalog- und Laufzeitdateien im neuen Build sind gegenüber v1.7.17 bytegleich; ausschließlich die neue Laufzeitdatei v1.7.18 wurde ergänzt.

## Verifikation

- 33/33 Struktur-, Konsistenz-, Syntax-, Dokumentations- und Offline-Assetprüfungen bestanden.
- 21/21 Browser-, Rechen-, Migrations-, Druck- und Interaktionsprüfungen bestanden.
- 335/335 integrierte Alt- und Neutests bestanden.
- Keine JavaScript-Laufzeitfehler.
- Offline-Neustart und Mobilansicht bei 360 Pixel Breite bestanden.

Der Build ist lokal vollständig und bereit für eine getrennt beauftragte Veröffentlichung.
