# Technischer Abschlussbericht v1.7.6

## Datenbasis

- Quelle: `Eberos_Magie_und_Wunder_Gesamtfassung_Z1-Z10_WBS_Verstaerkung_15Spalten.xlsx`
- Katalog: 270 Einträge in 27 Schulen
- Pfade: 140 Magie, 50 Glaube, 80 Flüche
- Verstärkung: 162 mit Regel, 108 ohne Verstärkung
- Eindeutigkeit: 270 stabile IDs, keine Duplikate

## Umsetzung

- Ein gemeinsames Datenmodell versorgt Charakter, NSC und Vertrauten.
- Besitzobjekte erhalten bewusst kein Zauber-/Wunder-/Fluchsystem.
- Lernreihenfolge wird gespeichert und dient beim Senken einer Stufe als LIFO-Reihenfolge.
- Wirksame Werte verwenden die bestehenden Grundwert-, Würfel- und Bonusregeln des Builders.
- Dynamische Zahlen in Regeltexten werden über einen eingeschränkten Rechenauswerter berechnet; es wird kein frei ausführbarer Code ausgewertet.
- Bestehende Spielstände und alte Fähigkeitsbezeichner werden migriert.

## Qualitätssicherung

- 290 automatische Prüfungen bestanden.
- Katalogstruktur, Pflichtfelder, Pfade, Schulen, IDs und Verstärkungsregeln geprüft.
- Öffnen, Lernen und Anzeigen einer Z8-Kraft praktisch getestet.
- Tastatur, Fokus, Escape-Schließen und mobile Darstellung geprüft.
- Kein JavaScript-Fehler im Browserprotokoll.
