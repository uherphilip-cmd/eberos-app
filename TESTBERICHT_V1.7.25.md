# Testbericht v1.7.25-r6

Prüfdatum: 27. September 2026

## Ergebnis

- 69 von 69 statischen Struktur-, Daten-, Versions-, Syntax- und Offline-Assetprüfungen bestanden.
- 33 von 33 Browser-, UI-, Migrations-, Mobil- und Offlineprüfungen bestanden.
- 494 von 494 integrierten Bestands- und Neutests bestanden.
- Keine JavaScript-Laufzeitfehler festgestellt.

## Geprüfte Lorefälle

- Der Lorekatalog enthält zehn eindeutige Quellen.
- **Dämonologie von Pegra** erscheint ausschließlich bei **Exorzismus & Austreibung**.
- **Grimorium Abyssi** erscheint ausschließlich bei **Dämonologie & Höllen-Beschwörungen**.
- **Grimoire der Seelenherrschaft** erscheint ausschließlich bei **Nekromantie & Totenmagie**.
- Fähigkeitsstufe 0 zeigt keine Lore; Stufe 1, 5 und 10 zeigen bei allen drei Quellen zunehmend mehr Inhalt.
- Die drei neuen Quellen umfassen zusammen 49 Hauptkapitel, 856 Textblöcke und 31.072 Wörter.
- Im sichtbaren neuen Loretext erscheinen keine Meta-Begriffe „Spielerfassung“, „Regelwerk“, „Charakterbogen“ oder „Spielleitung“.
- Das gestrichene Kapitel „Die Riten des Grimoriums“ ist nicht enthalten.

## Bestandsschutz

- Effektkatalog 2.0 enthält exakt 25 eindeutige Kernzustände.
- Schlafend ergibt aus WN 7 den wirksamen Wert 2 und setzt Bewegung auf 0.
- Blutend reduziert Leben nach einer Effektrunde von 10 auf 9.
- Verätzt reduziert Rüstung 3 über drei Effektrunden auf 0 und erst danach Leben von 10 auf 9.
- Gegenstandsboni wirken nur bei ausgerüsteten Gegenständen und lassen ausschließlich Fähigkeit, Grundwert oder Countermaximum als Bonusart zu.
- Das private Kampfrundenpanel wird nicht mehr gerendert; Techniken ziehen ihre Kosten direkt ab, ohne einen Rundenzähler fortzuschreiben.
- Kurzes Überfahren und Vorbeiscrollen öffnen keine Beschreibung; bewusstes Hover und der Klick-Umschalter funktionieren.
- Die mobile Ansicht bei 390 Pixel Breite bleibt ohne horizontalen Überlauf.
- Der Builder startet einschließlich des erweiterten Lorekatalogs nach einem Offline-Neustart vollständig.
