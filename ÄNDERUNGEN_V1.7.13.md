# Eberos Charakter-Builder v1.7.13-r1

## Erscheinungsbild

- Hintergrundbild und Farbschema sind voneinander getrennt. Die Theme-Auswahl überschreibt ein bewusst gewähltes Bild nicht mehr.
- 25 mitgelieferte Hintergründe stehen bereit: 15 klassische Theme-Ornamente und 10 neue freigestellte Motive.
- Eigene PNG-, JPEG- und WebP-Bilder können lokal importiert werden. Große Bilder werden im Browser verkleinert und als WebP im Charakterstand gespeichert.
- Deckkraft, Größe, Position, Ausrichtung, Überblendung, Farbmodus, Fixierung und Druckausgabe sind einstellbar.
- Zusatzreiter können den globalen Hintergrund erben oder eine eigene Auswahl verwenden.

## Schriften

- 18 lokal mitgelieferte Schriftfamilien stehen ohne Internetverbindung zur Wahl.
- Dokumenttitel, Kartenüberschriften, Fließtext sowie Zahlen und Würfelwerte lassen sich getrennt gestalten.
- Systemschriften und bisherige individuelle Einstellungen bleiben verfügbar.

## Kompatibilität

- Bestehende Charaktere, Einstellungen, Themes, Farben, Karten, Bilder, Zähler und Lernstände bleiben erhalten.
- Schema 21 ergänzt nur Darstellungsoptionen und ist idempotent. Vor dem ersten Übergang wird eine lokale Sicherung angelegt.
- Der Service Worker hält Hintergründe, Schriften und sämtliche bestehenden Regeldaten offline bereit.
