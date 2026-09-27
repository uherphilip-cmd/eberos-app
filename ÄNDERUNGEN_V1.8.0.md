# Änderungen v1.8.0

## Phase 1 – Architekturgrenze und Open Play

- Der Builder startet weiterhin vollständig ohne Konto und ohne Authentifizierungsanfrage.
- Die sichtbare Kennzeichnung **Open Play · lokal** erklärt den lokalen Arbeitsmodus.
- Lokale Entwürfe werden migrationsfähig und getrennt vom Kampagnenzugang gespeichert.

## Phase 2 – Supabase, Konten und Rollen

- Erst **Kampagne beitreten** lädt den Kampagnen- und Anmeldecode.
- Anmeldung erfolgt per einmaligem E-Mail-Link; vorhandene Sitzungen werden in derselben Browsersitzung wiederhergestellt.
- Abmeldung entfernt Sitzungsdaten und private Kampagnencaches.
- Welt-, Kampagnen-, Rollen- und Figurenrechte werden serverseitig mit Row Level Security erzwungen.
- Spieler- und Spielleiterantworten sind getrennt; geheime Notizen fehlen vollständig im Spielermodell.
- Der Service Worker speichert keine externen oder autorisierten API-Antworten.
- Das verwaltete Supabase-Testprojekt ist ausschließlich mit Projekt-URL und öffentlichem Publishable Key verbunden; Secret-Schlüssel bleiben ausgeschlossen.
- Alle 19 Datenbank-Sicherheitsprüfungen wurden gegen das echte Testprojekt bestanden.

## Phase 3 – Kampagnenbeitritt und verbindliche Figuren

- Spielleitungen können Kampagnen erstellen und zeitlich begrenzte Einladungscodes ausgeben.
- Spieler können einer Kampagne beitreten, ihre aktuelle Figur vorprüfen und bewusst verbindlich einreichen.
- Nach der Annahme wird die eingereichte Fassung als unveränderliche Revision fixiert.
- Eine private, unverbundene Konzeptkopie kann auf Wunsch erhalten bleiben.
- Freigabe, Ablehnung und spätere Änderungsanträge werden nachvollziehbar protokolliert.

## Phase 4 – Spielbetrieb

- Spielleitungen können Spielabende und Handlungsfäden innerhalb der gewählten Kampagne dokumentieren.
- Sichtbarkeit und Schreibrechte werden auf dem Server nach Rolle und Kampagnenzugehörigkeit geprüft.
- Die Datenbankvalidierung wurde PostgreSQL-kompatibel gehärtet.
- Alle 44 zusätzlichen Kampagnenkern-Prüfungen wurden gegen das echte Testprojekt bestanden und vollständig zurückgerollt.

## Geprüfter Release-Stand

- 66 statische Release-Prüfungen
- 17 Browser-Prüfungen
- 33 Rückwärtskompatibilitäts-Prüfungen für v1.7.25
- 503 integrierte Builder-Prüfungen
- 63 externe Datenbank-Prüfungen insgesamt (19 + 44)
