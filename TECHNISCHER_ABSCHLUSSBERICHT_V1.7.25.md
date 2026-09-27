# Technischer Abschlussbericht v1.7.25

## Release-Metadaten

- App-Version: 1.7.25-r4
- Schema: 29
- Regelstand: 15
- Fähigkeiten: 88
- Effektkatalog: 2.0.0 mit 25 Kernzuständen
- Kraftkatalog: 1.4.0 mit 31 Schulen und 465 Einträgen
- Pfadverteilung: M 255, GB 90, FS 120
- Verstärkung: 352 verstärkbar, 113 nicht verstärkbar

## Umsetzung

- Der Effektkatalog wurde fachlich reduziert und für zentrale Zustände in direkte Wertänderungen, periodische Counteränderungen und klare Handlungssperren übersetzt.
- Verätzt speichert den temporären Rüstungsverlust am Effekt; das Entfernen des Effekts stellt den Ausgangswert wieder her.
- Der Gegenstandsbonus-Dialog erzeugt ausschließlich positive, an die ausgerüstete Quelle gebundene Boni auf Fähigkeiten, Grundwerte und Countermaxima.
- Die private Kampfrundenverwaltung wurde stillgelegt. Techniken zahlen ihre Counterkosten direkt; Meisterschaftsrabatte auf gewöhnliche Techniken bleiben erhalten.
- Die Effektzeit kann unabhängig manuell fortgeschrieben werden, damit Blutung, Verätzung und andere periodische Zustände berechenbar bleiben.
- Bestehende aktive Effekte werden nicht gelöscht. Der alte Kampfrundenzustand wird einmalig zur Kompatibilität archiviert und nicht mehr bedient.
- Exorzismus & Austreibung und Wirtschaft & Handel bleiben mit stabilen Fähigkeits-IDs eingebunden.
- Revision r4 erneuert Assetabfragen und Service-Worker-Cache.

## Verifikation

- 61/61 statische Prüfungen bestanden.
- 29/29 Browser- und Offlineprüfungen bestanden.
- 493/493 integrierte Tests bestanden.
- 0 JavaScript-Laufzeitfehler.
