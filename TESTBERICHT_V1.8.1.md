# Testbericht v1.8.1 – Spielleitung und Spielabend-CBP

Stand: 27. September 2026
Ergebnis: **bestanden**

## Lokale Prüfungen

- 36 statische Release-Prüfungen bestanden.
- 13 Browserprüfungen für den echten Spielleitungs-Hauptreiter, Kampagnen-Reiter, Spielabende, verdeckte Folgen und CBP-Selbstabholung bestanden.
- Geprüft wurde insbesondere, dass der Hauptreiter aktiv wird, seine Ansicht sichtbar ist und die Charakterarbeitsfläche dabei verschwindet.
- 33 bestehende Browser-Regressionsprüfungen bestanden.
- 500 integrierte Builder-Prüfungen bestanden.
- JavaScript-Syntax, Lazy Loading, Offline-Cache und Trennung von Open Play und Kampagnenmodulen wurden bestätigt.

## Live-Datenbank

- Die Migration wurde in einer Transaktion erfolgreich angewendet.
- 24 pgTAP-Prüfungen für Berechtigungen, Row Level Security, gemeinsame Welten, Spielabende, CBP-Ledger, Deduplizierung, verdeckte Folgen und unveränderliche Figuren-IDs bestanden.
- Der Datenbanktest endete mit `rollback`; keine Testbenutzer oder Testkampagnen verblieben.

## Welt-Zusammenführung

- Ein vollständiger Probelauf mit Rücksetzung war erfolgreich.
- Anschließend wurden beide vorhandenen Kampagnen atomar der gemeinsamen Welt **Eberos** zugeordnet.
- Die Abschlussprüfung bestätigte eine gemeinsame Welt-ID, eine aktive Eigentümer-Mitgliedschaft, zwei Audit-Einträge und den unveränderten Kampagnenbestand.
- Die zwei früheren Welten blieben erhalten.
