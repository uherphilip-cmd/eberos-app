# Eberos Charakter-Builder v1.7.2

## Regelkorrekturen

- Herkunftsnachteile sind keine getrennte Währung mehr. Bestehende Einträge werden in normale Nachteile nach Kapitel 2.5.5 migriert.
- „Verfolgte Hexe“ wird bei der Migration mit +24 CBP bewertet.
- „Verpfändeter Besitz“ ist kein 1-CBP-Besitzmodul mehr, sondern ein normaler Nachteil mit +6 CBP. Ein regulär gekaufter Besitz, Betrieb oder Anspruch ist Voraussetzung.
- Die Abschlussprüfung warnt vor möglicher Doppelvergütung überlappender Nachteile.
- Der Besitzkatalog enthält 76 auswählbare Module mit durchsuchbaren Spielwirkungen.

## Neue und überarbeitete Oberflächen

- Das Navigationsfenster ist ein hierarchisches Inhaltsverzeichnis aller Reiter und Karten. Es enthält bewusst keinen zusätzlichen „+ Reiter“-Befehl.
- Die vollständige Startpaket-Tabelle enthält Kosten, Inhalt, Rationen und Startgeld. Eine Auswahl ersetzt nur frühere Paketgegenstände; manuelle Ausrüstung bleibt erhalten.
- Porträtkarten unterstützen Galerien mit ein bis drei Bildern, Bildunterschriften und Reihenfolge.
- Der neue Kartentyp „Quest“ besitzt Questname, Belohnung, Auftraggeber und ein großes Notizfeld und kostet keine CBP.
- Ein eigener PDF-Befehl öffnet die druckoptimierte Ansicht und den Systemdialog zum Speichern als PDF.

## Technik

- App-Version 1.7.2, Datenschema 10 und PWA-Cache `eberos-pwa-v1.7.2`.
- Migrationen erhalten manuelle Daten und kennzeichnen nicht mehr gültige Besitzmodule sichtbar, ohne weiter CBP abzuziehen.
- Start-URL, lokaler Starter, Manifest und Offline-Cache sind auf v1.7.2 vereinheitlicht.
