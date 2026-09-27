# Phase 2 – Abschluss v1.8.0

## Ergebnis

Die lokale Phase-2-Implementierung ist fertig und vollständig browsergeprüft. Das verwaltete Supabase-Testprojekt `Eberos Kampagnenmodul Test` wurde in Irland (`eu-west-1`) angelegt, die Migration wurde erfolgreich angewendet und alle 19 Row-Level-Security-Prüfungen sind bestanden.

## Umgesetzt

- Open Play startet weiterhin ohne Konto, Dialog, Supabase-SDK oder Authentifizierungsanfrage.
- Erst **Kampagne beitreten** lädt Konfiguration, Supabase-Client und Kampagneneinstieg.
- Anmeldung ist per zeitlich begrenztem Supabase-E-Mail-Link vorbereitet.
- Sitzungswiederherstellung erfolgt erst innerhalb einer ausdrücklich gestarteten Kampagnenaktion.
- Authentifizierungsdaten liegen in `sessionStorage`, nicht im normalen langlebigen `localStorage`.
- Abmeldung beendet nur die aktuelle Gerätesitzung und entfernt private Sitzungscaches.
- Das offizielle Supabase-JavaScript-SDK `2.117.2` wurde aus dem veröffentlichten npm-Paket übernommen und mit dessen SHA-512-Integritätswert geprüft.
- Der Service Worker speichert weder externe noch autorisierte Antworten in seinem öffentlichen statischen Cache.
- Datenbankmigration für Profile, Welten, Kampagnen, Welt- und Kampagnenrollen, Figuren, getrennte Geheimdaten und Auditereignisse ist vorhanden.
- Row Level Security ist für alle neun Phase-2-Tabellen vorgesehen.
- Spieler- und Spielleiterantworten sind als getrennte `security_invoker`-Ansichten definiert.
- Owner-Mitgliedschaften können nicht gelöscht, deaktiviert oder herabgestuft werden.
- Browserkonten besitzen kein hartes Löschrecht; Archivierung ist der normale Lebenszyklus.
- Eine Datenbank-Testmatrix für Owner, Spieler und Außenstehende liegt bereit.

## Live-Verbindung

- Projekt-URL und ausschließlich der öffentliche `sb_publishable_…`-Schlüssel sind eingetragen.
- Die veröffentlichte GitHub-Pages-Adresse sowie die lokalen Vorschau-Adressen für `localhost` und `127.0.0.1` sind in Supabase zugelassen.
- Der echte Supabase-Client wird im Browser erst nach **Kampagne beitreten** geladen und wurde ohne E-Mail-Versand gegen die Live-Konfiguration geprüft.
- Der Versand eines echten Magic Links bleibt ein gesonderter, bestätigungspflichtiger End-to-End-Test, weil dabei eine konkrete E-Mail-Adresse an Supabase übertragen und eine Nachricht versendet wird.

Secret-, `service_role`- oder Datenbank-Schlüssel werden weder in der Browser-App noch in diesem Repository gespeichert.

