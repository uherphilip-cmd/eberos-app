# Technischer Abschlussbericht v1.7.21-r3

## Quelle und Datenstand

- Quelle: `Items_Korrekturen_v15.mse-set`, 130.227.968 Bytes
- 496 Karten, 38 Sets und 496 eindeutige Kartennummern
- 330 Karten zuletzt 2026, 166 Karten zuletzt 2025 geändert
- 73 weapon, 120 armor, 227 gear, 43 companion, 7 vehicle, 7 property, 19 boon

## Datenintegrität

Der Import bewahrt die vollständigen textlichen MSE-Quelldaten und erzeugt pro Karte eine stabile ID sowie einen Quellhash. `casting_cost` wird nicht als CBP-Kostenwert interpretiert. Der bestehende Handbuchkatalog mit 203 Gegenständen wird nicht ersetzt. Bereits gespeicherte Iteminstanzen werden nicht überschrieben.

## Gewichte und Preise

Alle Gewichtsangaben einschließlich Gramm, Kilogramm und Tonnen sind maschinenlesbar. 41 Karten besitzen keinen Preistext. „Traum der Heroische Inspiration“ wurde wegen des unkörperlichen Eintragstyps und der konsistenten 0-kg-Vergleichseinträge von 500 kg auf 0 kg korrigiert; Quelle, Zielwert und Begründung bleiben gespeichert. „Ravella’s Fiole“ bleibt mit 70 kg als unsicherer Gewichtsfall offen. Insgesamt bleiben 42 Karten zur fachlichen Preis-/Gewichtsprüfung markiert.

## Oberfläche und Sicherung

Der MSE-Katalog ist separat einklappbar, durchsuchbar und nach Set, Art und Prüfstatus filterbar. Ausgewählte Einträge enthalten den MSE-Quellblock und werden vollständig in den bestehenden Charakter- und Vollbackups gespeichert. Große Begleiter, Fahrzeuge, Besitzobjekte und unkörperliche Belohnungen starten als eingelagert, damit sie die persönliche Traglast nicht ungefragt verändern.

## Version

- Sichtbare Revision: v1.7.21-r3
- Schema: 27 unverändert
- Regelstand: 13 unverändert
- Offline-Cache: 1.7.21-r3.1
