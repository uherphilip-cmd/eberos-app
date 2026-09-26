# Testbericht v1.7.21-r7

## Geprüfte Kernfälle

- Leerer Zustand zeigt weder Kartennamen noch Kartenbilder oder Kartenresultate.
- Ein ungültiger vierstelliger Code gibt keine Kartendaten preis.
- Ein gültiger normaler Code schaltet genau die zugehörige Karte frei und legt sie einmal im Inventar an.
- Die Wiederholung desselben Codes erzeugt kein unbeabsichtigtes Duplikat.
- Codes echter Vollendungskarten werden abgewiesen; die automatische Set-Vergabe bleibt aktiv.
- Eine normale kaufbare Sechs-Teile-Bonuskarte bleibt über ihren Code freischaltbar.
- Ein Reittiercode erzeugt genau einen dauerhaft verknüpften Reittierreiter.
- JSON-Backup und Import erhalten Freischaltungen sowie Begleiter-/Reittierverknüpfungen.
- Tippen im Codefeld verändert die Seitenposition nicht; der Itemrenderer verwendet die aktive Itemzeile als Scroll- und Fokusanker.
- Mobile Darstellung bei 390 Pixeln erzeugt keinen horizontalen Seitenüberlauf.

Die automatisierten Prüfungen bestehen aus einer statischen Paketprüfung, den integrierten Buildertests und einem echten Browserlauf.
