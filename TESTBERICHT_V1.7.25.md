# Testbericht v1.7.25

Prüfdatum: 27. September 2026

## Ergebnis

- 65 von 65 statischen Struktur-, Daten-, Versions-, Syntax- und Offline-Assetprüfungen bestanden.
- 30 von 30 Browser-, UI-, Migrations-, Mobil- und Offlineprüfungen bestanden.
- 494 von 494 integrierten Bestands- und Neutests bestanden.
- Keine JavaScript-Laufzeitfehler festgestellt.

## Geprüfte Kernfälle

- Der Lorekatalog enthält sieben eindeutige Quellen und weist Spiritismus ausschließlich **Spiritismus & Geisterkunde** zu.
- Fähigkeitsstufe 0 zeigt keine Lore; Stufe 1, 5 und 10 zeigen jeweils zunehmend mehr Inhalt.
- Stufe 10 zeigt alle 14 Hauptkapitel und 414 Textblöcke der kanonischen Spiritismus-Fassung.
- Effektkatalog 2.0 enthält exakt 25 eindeutige Kernzustände.
- Schlafend ergibt aus WN 7 den wirksamen Wert 2 und setzt Bewegung auf 0.
- Blutend reduziert Leben nach einer Effektrunde von 10 auf 9.
- Verätzt reduziert Rüstung 3 über drei Effektrunden auf 0 und erst danach Leben von 10 auf 9.
- Gegenstandsboni wirken nur bei ausgerüsteten Gegenständen und lassen ausschließlich Fähigkeit, Grundwert oder Countermaximum als Bonusart zu.
- Das private Kampfrundenpanel wird nicht mehr gerendert; Techniken ziehen ihre Kosten direkt ab, ohne einen Rundenzähler fortzuschreiben.
- Kurzes Überfahren und Vorbeiscrollen öffnen keine Beschreibung; bewusstes Hover und der Klick-Umschalter funktionieren.
- Bestehende Figuren und Zusatzreiter werden verlustfrei und idempotent auf Schema 29 und Regelstand 15 migriert.
- Die mobile Ansicht bei 390 Pixel Breite bleibt ohne horizontalen Überlauf.
- Der Builder startet einschließlich des neuen Lorekatalogs nach einem Offline-Neustart vollständig.
