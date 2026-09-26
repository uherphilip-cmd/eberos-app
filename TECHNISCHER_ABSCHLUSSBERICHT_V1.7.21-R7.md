# Technischer Abschlussbericht v1.7.21-r7

## Codefreischaltung

Alle 496 Quellkarten besitzen einen eindeutigen vierstelligen Code. Die Oberfläche rendert ausschließlich normale Karten, deren Katalog-ID in `mseUnlockedCardIdsV17` des aktuellen Inventarbesitzers gespeichert ist. Ein gültiger Code trägt diese ID ein und erzeugt eine Inventarinstanz. Ungültige Codes geben keinerlei Kartendaten preis.

## Sonderregeln

Die 18 echten Vollendungskarten sind vom manuellen Freischaltweg ausgeschlossen. Ihre bestehende automatische, dauerhafte Set-Vergabe bleibt erhalten. Kaufbare Bonuskarten mit Sechs-Item-Effekt sind keine Vollendungskarten und folgen dem normalen Codeweg.

## Bestand, Backup und Import

Die Migration übernimmt bereits vorhandene normale MSE-Inventarinstanzen als Freischaltungen. Das Freischaltregister liegt direkt am Charakter beziehungsweise Zusatzreiter und wird daher vom bestehenden JSON-Vollbackup vollständig exportiert und beim Import normalisiert. Begleiter- und Reittierverknüpfungen bleiben unverändert erhalten.

## Scrollstabilität

Der Ansichts-Snapshot identifiziert jetzt zusätzlich die aktive Inventarzeile und die genaue Position des fokussierten Bedienelements. Beim Neurendern dient dieselbe Itemzeile als visueller Anker. Die MSE- und Inventarbereiche deaktivieren zusätzlich das automatische Browser-Scroll-Ankern.

## Version

- Sichtbare Revision: v1.7.21-r7
- Schema: 27 (additiv kompatibles Freischaltfeld)
- Regelstand: 13
- Offline-Cache: 1.7.21-r7.1
