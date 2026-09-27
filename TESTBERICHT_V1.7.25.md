# Testbericht v1.7.25

Prüfdatum: 27. September 2026

## Ergebnis

- 61 von 61 statischen Struktur-, Daten-, Versions-, Syntax- und Offline-Assetprüfungen bestanden.
- 29 von 29 Browser-, UI-, Migrations-, Mobil- und Offlineprüfungen bestanden.
- 493 von 493 integrierten Bestands- und Neutests bestanden.
- Keine JavaScript-Laufzeitfehler festgestellt.

## Geprüfte Kernfälle

- Effektkatalog 2.0 enthält exakt 25 eindeutige Kernzustände.
- Schlafend ergibt aus WN 7 den wirksamen Wert 2 und setzt Bewegung auf 0.
- Blutend reduziert Leben nach einer Effektrunde von 10 auf 9.
- Verätzt reduziert Rüstung 3 über drei Effektrunden auf 0 und erst danach Leben von 10 auf 9.
- Gegenstandsboni wirken nur bei ausgerüsteten Gegenständen und lassen ausschließlich Fähigkeit, Grundwert oder Countermaximum als Bonusart zu.
- Das private Kampfrundenpanel wird nicht mehr gerendert; Techniken ziehen ihre Kosten direkt ab, ohne einen Rundenzähler fortzuschreiben.
- Der verbliebene Rundenschritt ist sichtbar als reine Effektzeit gekennzeichnet.
- Kurzes Überfahren und Vorbeiscrollen öffnen keine Beschreibung; bewusstes Hover und der Klick-Umschalter funktionieren.
- Wirtschaft & Handel sowie Exorzismus & Austreibung bleiben vollständig eingebunden.
- Bestehende Figuren und Zusatzreiter werden verlustfrei und idempotent auf Schema 29 und Regelstand 15 migriert.
- Die mobile Ansicht bei 390 Pixel Breite bleibt ohne horizontalen Überlauf.
- Der Builder startet nach einem Offline-Neustart vollständig.
