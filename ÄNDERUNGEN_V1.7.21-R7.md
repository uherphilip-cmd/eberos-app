# Änderungen v1.7.21-r7

- Die vollständige MSE-Kartenliste ist nicht mehr sichtbar oder durchsuchbar.
- Normale Karten werden ausschließlich über ihren eindeutigen vierstelligen Kartencode freigeschaltet und danach sofort dem aktuellen Inventar hinzugefügt.
- Namen, Bilder, Werte und Regeln verborgener Karten werden vor der Freischaltung nicht in die Oberfläche eingebaut oder als Bild angefordert.
- Bereits vorhandene normale MSE-Inventarkarten werden bei der Aktualisierung automatisch als freigeschaltet übernommen.
- Freischaltungen werden pro Charakter beziehungsweise Zusatzreiter gespeichert und im JSON-Vollbackup und Import erhalten.
- Vollendungskarten sind nicht per Code freischaltbar; sie erscheinen weiterhin ausschließlich automatisch nach vollständigem Sammeln ihres Sets.
- Normale kaufbare Sechs-Teile-Bonuskarten bleiben normale Karten und werden wie alle anderen normalen Karten per Code freigeschaltet.
- Das Inventar bewahrt beim Bearbeiten die genaue aktive Itemzeile, den Fokus und die Scrollposition; Browser-Scroll-Anker sind im Kartenbereich deaktiviert.
- Kartenbilder werden nicht mehr vollständig vorab heruntergeladen, sondern erst bei der Anzeige einer freigeschalteten Karte in den Offline-Cache übernommen.
