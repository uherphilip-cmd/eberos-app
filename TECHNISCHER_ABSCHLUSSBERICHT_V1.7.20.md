# Technischer Abschlussbericht v1.7.20-r1

## Ziel und Ergebnis

Die bestehenden Schicksalspfad-Karten können innerhalb ihres zweispaltigen Rasters auf volle Breite erweitert werden. Der Breitenwechsel verändert ausschließlich Klassen am bestehenden DOM und öffnet weder Dialog noch Overlay. Dadurch bleiben Auswahlfelder und offene Kraftdetails erhalten.

## Umsetzung

Die Laufzeit `data/eberos-v1.7.20.js` erweitert den vorhandenen Machtpfad-Renderer um eine zugängliche Breitensteuerung. Ein flüchtiger UI-Speicher hält pro Besitzer höchstens einen erweiterten Pfad. Der Zustand wird nicht in Charakterdaten geschrieben. CSS-Containerregeln passen den inneren Textfluss an die tatsächliche Kartenbreite an. Mobile und Druckansichten setzen die Erweiterung neutral zurück.

## Versionen und Daten

- App-Version: 1.7.20
- Veröffentlichungsrevision: r1
- Regelstand: 11 unverändert
- Schema: 25 unverändert
- Datenmigration: nicht erforderlich

## Prüfung

35/35 statische Prüfungen, 25/25 gezielte Browserprüfungen und 374/374 integrierte Buildertests bestanden. Desktop-Ausgangslayout, Erweiterung nach links und rechts, unveränderte Kraftauswahl, offene Details, 390-Pixel-Ansicht, Druckmodus und Offline-Neustart wurden erfolgreich geprüft. Der Build ist bereit zur Veröffentlichung; der öffentliche Bytevergleich erfolgt nach dem Hochladen.
