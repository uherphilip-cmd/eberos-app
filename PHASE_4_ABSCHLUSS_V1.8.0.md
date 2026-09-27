# Phase 4 – Abschluss v1.8.0

## Ergebnis

Der erste nutzbare Kampagnenkern ist fertig. Eine Spielleitung kann Welt und Kampagne anlegen, Codes ausgeben, Figuren prüfen, den Kampagnentag führen sowie Spielabende und Handlungsfäden dokumentieren. Spieler erhalten ausschließlich ihre Mitgliedschaften, eigenen Figuren und freigegebene Einträge.

## Umgesetzt

- atomare Anlage von Welt und Kampagne mit stabilen IDs;
- automatische, geschützte Owner-Mitgliedschaften;
- getrennte Spieler- und Spielleitungsübersichten;
- Kampagnentag und öffentliche Kampagnennotizen;
- Handlungsfäden mit offenem, abgeschlossenem und archiviertem Status;
- Spielabende in den Tiefen **Kurz**, **Normal** und **Chronik**;
- getrennte öffentliche und interne Inhalte;
- Änderungsprotokoll für Kampagnen, Figuren, Spielabende, Handlungsfäden und Fortschrittsanträge;
- responsive Kampagnenoberfläche im bestehenden Beitrittsdialog.

## Sichtbarkeit

- Spieler sehen nur sichtbare Handlungsfäden und Spielabende.
- Außenstehende sehen weder Kampagne noch Sitzungen oder Fäden.
- Nur Spielleitung kann Kampagnentag, Einladungen und Prüfentscheidungen verändern.
- Open Play, Offlinebetrieb, Import, Export, Druck und PDF bleiben vom Kampagnenkonto unabhängig.

## Abnahme

- 44/44 externe Datenbankprüfungen bestanden;
- 17/17 Browserprüfungen bestanden;
- 33/33 vollständige v1.7.25-r6-Regressionsprüfungen bestanden;
- 503/503 integrierte Builder- und Regeltests bestanden;
- keine JavaScript-Laufzeitfehler und kein horizontaler Überlauf bei 390 Pixel Breite.

Die Phasen 0 bis 4 bilden damit die im Master-Arbeitsauftrag empfohlene erste Veröffentlichungsgrenze für v1.8.0. Wesen, Beziehungen, Orte, Weltchronik und Live-Modus bleiben spätere, eigenständig abzunehmende Ausbauphasen.
