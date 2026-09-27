# Eberos v1.8.1 – Abschluss Spielleitungsmodul

Stand: 27. September 2026
Status: Backend migriert, gemeinsame Welt eingerichtet, Release geprüft

## Umgesetzt

- Echter Hauptreiter **Spielleitung** neben **Charakterbau**, **NPC** und **Druckvorschau**; er ersetzt beim Öffnen die Charakterarbeitsfläche vollständig.
- Eigene Kampagnen-Reiter mit Übersicht, Kampagne, Gruppe & Charaktere, Spielabende & CBP, Wesen, Orte, Ereignisse sowie Zeit & Wetter.
- Bearbeitung von Kampagnenname, öffentlicher Beschreibung, Spielerhinweisen, geheimen Spielleitungsnotizen und Kampagnentag.
- Neue Kampagnen können eine vorhandene Welt verwenden oder bewusst eine neue Welt anlegen.
- Spielabende mit Status, Dokumentationstiefe, öffentlicher Zusammenfassung, geheimen Notizen und CBP-Wert.
- Einmalige CBP-Selbstabholung durch Spieler mit unveränderlichem serverseitigem Ledger und lokaler Deduplizierung.
- Verdeckte Folgen für andere Kampagnen derselben Welt.
- Bestehende Figuren-IDs können nicht zwischen Kampagnen verschoben werden.

## Live-Datenbank

- Die Phase-5-Migration wurde atomar auf das verbundene Supabase-Projekt angewendet.
- 24 rückrollbare Datenbankprüfungen wurden erfolgreich durchlaufen.
- Die Testdaten wurden vollständig zurückgerollt.
- **Der Hexenzirkel aus Grünwald** und **Die Lieder von Langenmooren** verwenden nun dieselbe neutrale Welt **Eberos**.
- Beide früheren Welten bleiben unverändert erhalten und bilden den Rücksetzweg.
- Zwei Audit-Einträge dokumentieren die Weltzuordnungen.

## Prüfstand

- 36 statische v1.8.1-Prüfungen bestanden.
- 13 neue Browserprüfungen bestanden.
- Der Hauptreiterwechsel, die sichtbare Spielleitungsansicht und das Ausblenden der Charakterarbeitsfläche wurden ausdrücklich geprüft.
- 33 bestehende Browser-Regressionsprüfungen bestanden.
- 500 integrierte Builder-Prüfungen bestanden.
- Keine Testbenutzer oder Testkampagnen verblieben im Live-Projekt.

## Noch vorbereitete Bereiche

Wesen, Orte sowie der vollständige Kalender und das Wetter besitzen in v1.8.1 vorbereitete Spielleitungsbereiche. Ihre fachliche Datenverwaltung folgt in einem späteren Ausbau.
