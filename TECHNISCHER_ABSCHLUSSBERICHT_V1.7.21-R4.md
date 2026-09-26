# Technischer Abschlussbericht v1.7.21-r4

## Daten und Balance

- 496 Karten, 38 Sets, 496 eindeutige Kartennummern und Quellhashes
- 452 Karten mit unverändert bestätigten Quellwerten
- 23 hergeleitete oder korrigierte Marktpreise
- 20 ausdrücklich nicht käufliche Einträge
- 4 Gewichtsberichtigungen
- 0 offene automatische Preis-/Gewichtsprüfungen

Die vollständige Begründung jeder Abweichung steht in `ITEMS_MSE_V15_AUDIT.md`. Quellwerte werden nie überschrieben, sondern als Originalwerte neben der redaktionellen Entscheidung gespeichert.

## Kartenansicht

Aus den 496 MSE-Illustrationen wurden JPEG-Kartengrafiken mit Qualitätsstufe 82 erzeugt. Gesamtgröße: 17.2 MiB. Der Katalog lädt Vorschaubilder verzögert und bietet eine zugängliche Detailansicht mit Illustration, Typ, Seltenheit, Statistikzeilen, Regel- und Flavortext sowie Preis und Gewicht. Der Service Worker nimmt alle Kartengrafiken in den Offline-Cache auf.

## Kompatibilität

Der bestehende 203er Handbuchkatalog bleibt unverändert. Ausgewählte MSE-Items bleiben unabhängige Instanzen und werden vollständig im JSON-Backup gesichert. Bereits ausgewählte, quellidentische Instanzen erhalten die neue Balance; benutzerseitig abweichende Quelldaten werden nicht überschrieben.

## Version

- Sichtbare Revision: v1.7.21-r4
- Datenstand: MSE v15.1 balanced
- Schema: 27 unverändert
- Regelstand: 13 unverändert
- Offline-Cache: 1.7.21-r4.1

Bildkonvertierung: {"Images":496,"Bytes":18057683,"Quality":82,"OutputDirectory":"C:\\Users\\alexa\\OneDrive\\Dokumente\\Eberos Character Editor\\output\\eberos-pwa-v1.7.21-r4\\data\\mse-v15-art"}
