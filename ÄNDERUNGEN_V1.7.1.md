# Eberos Charakter-Builder v1.7.1

## Umgesetzt

- Rennen auf `Bewegung × 4` und Springen auf Abrunden korrigiert.
- Datenmodell auf Schema 9 angehoben.
- Bestehende NPC-, Vertrauten- und Besitzreiter werden idempotent um fehlende Pflichtkarten ergänzt; eigene Karten bleiben erhalten.
- Vier Abrechnungsmodi funktional getrennt.
- „Eigenes Budget“ besitzt Gesamtbudget, Ausgaben, Restwert und Überziehungswarnung.
- Handbuch-, manuelle und berechnete Vergleichskosten unterschieden.
- Audit unterscheidet Fehler, Warnungen und bestandene Prüfungen.
- Macht-Counter und Freigaben für Werte ab 16 werden geprüft.
- Alle NPC-Stufen und NPC-Arten mit Spielwirkung ergänzt.
- Alle 77 Besitzmodule mit vollständiger Beschreibung ergänzt.
- Familienoptionen um vollständige mechanische Wirkungen ergänzt.
- Elf Startpakete als echte Auswahl mit Kosten, Inhalt, Rationen und Startgeld ergänzt.
- Herkunftsnachteile getrennt von allgemeinen Nachteilen modelliert.
- Sichtbare Version, App-Version, Manifest, Start-URL und PWA-Cache auf v1.7.1 aktualisiert.
- Interne Tests um Formeln, Alt-Migration, Idempotenz, Karten-Erhalt und Budgetmodi erweitert.
- Lokalen Windows-Starter ergänzt, damit Service Worker und PWA-Installation über `localhost` funktionieren.

## Regelquellenhinweis

Das bereitgestellte Spielerhandbuch widerspricht sich bei „Rennen als Aktion“:

- Kapitel 2, Seite 12: Bewegung × 4
- Kapitel 3, Seite 29: Bewegung × 2

Version 1.7.1 folgt der für diese Überarbeitung vorgegebenen Formel aus Kapitel 2: Bewegung × 4.

## Einschränkung der Quelle

Die bereitgestellte PDF-Datei endet auf Seite 29 in Kapitel 3. Kapitel 7 wird im Inhaltsverzeichnis angekündigt, seine Waffen-, Rüstungs-, Preis-, Mengenwert-, Hunger- und Dursttabellen sind in der Datei jedoch nicht enthalten. Deshalb wurden dafür keine Werte erfunden. Die Startpakete und alle in Kapitel 2 tatsächlich enthaltenen Ausrüstungsangaben wurden umgesetzt.

## Prüfung

- JavaScript-Syntax erfolgreich geprüft.
- Versions-, Schema-, Formel-, Manifest- und Cache-Konsistenz statisch geprüft.
- Lokaler HTTP-Abruf lieferte Status 200.
- Die Browseroberfläche konnte aus der isolierten Browserumgebung nicht auf den lokalen Server zugreifen; daher ist vor Veröffentlichung noch ein manueller visueller Kurztest empfohlen.
