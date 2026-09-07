# Eberos Charakter-Builder v1.7.11

## Bereinigung

- Erweiterungspakete und die doppelte Schaltfläche „Alle sichern“ wurden vollständig aus der normalen App entfernt.
- Ziele, Bindungen und die eigenständige Questkarte wurden aus Oberfläche, Kartenauswahl, Datenmodell, Druck, Suche und aktivem Renderer entfernt.
- Der wirkungslose Spielmodus-Schalter wurde entfernt.
- Einmalige Standardkarten können nicht mehr doppelt angelegt werden.
- Regel-Editor und interne Tests sind nur noch im Entwicklungsmodus mit ?dev=1 erreichbar.
- Charakternotizen und freie Textblöcke sind eindeutig benannt.

## Vorteile und Migration

- Vorteile aus Familie, Startpaket, Besitz, Rechten, Einkommen und Kontakten werden zentral ohne doppelte Kosten angezeigt.
- Eigene Vorteile besitzen Kosten, Aktivstatus, Beschreibung und optional eine strukturierte Effektwirkung.
- Inhalte alter Ziele, Bindungen und Questkarten werden einmalig als vollständige JSON-Blöcke in die Charakternotizen übernommen. Dadurch bleiben auch unbekannte Zusatzfelder, Zeilenumbrüche und Zahlenwerte erhalten.
- Bereits mit v1.7.11-r1 angelegte Ziel-/Questinhalte werden ebenfalls in die Charakternotizen übernommen.
- Erweiterungstextkarten aus Altständen werden als normale Textblöcke erhalten.
- Schema 20, automatische Vormigrationssicherung und idempotente Migration.
