# Supabase-Einrichtung für Eberos v1.8.0

## Gewählte Grundlage

- verwaltetes Supabase-Testprojekt;
- Anmeldung per einmaligem E-Mail-Link statt eigenem Passwortsystem;
- offizielles Supabase-JavaScript-SDK `2.117.2`, lokal mit veröffentlichter SHA-512-Prüfsumme verifiziert;
- ausschließlich der öffentliche `sb_publishable_…`-Schlüssel im Browser;
- kein Secret- oder `service_role`-Schlüssel in App, Quellcode oder Chat;
- Sitzung nur in `sessionStorage`, nicht im normalen langlebigen `localStorage`;
- Open Play bleibt vollständig lokal, offlinefähig und kontolos.

## Was bereits vorbereitet ist

Die Migration `supabase/migrations/20260927150000_phase2_accounts_roles.sql` legt Profile, Welten, Kampagnen, Rollenmitgliedschaften, Kampagnenfiguren, getrennte Spielleiter-Geheimdaten und ein unveränderliches Auditprotokoll an. Für jede Tabelle ist Row Level Security aktiviert.

Spieler erhalten über `campaign_player_view` ausschließlich freigegebene Kampagnendaten. `campaign_management_view`, `campaign_secrets` und `character_secrets` sind serverseitig auf Spielleitung und berechtigte Co-Spielleitung begrenzt. Ein bloßes Verstecken in der Oberfläche findet nicht statt.

## Stand im Supabase-Dashboard

1. Das kostenlose Projekt `Eberos Kampagnenmodul Test` liegt in West EU (Irland).
2. Die SQL-Migration wurde im SQL Editor erfolgreich ausgeführt.
3. Alle 19 RLS- und Rollenprüfungen sind bestanden; Testdaten wurden mit `rollback` verworfen.
4. Projekt-URL und ausschließlich der öffentliche `sb_publishable_…`-Schlüssel sind in `scripts/v180/eberos-supabase-config-v1.8.0.js` eingetragen. Kein Secret-, `service_role`- oder Datenbank-Schlüssel wurde übernommen.
5. Unter **Authentication → URL Configuration** sind die veröffentlichte Builder-Adresse sowie die lokalen Vorschauen über `localhost:4173` und `127.0.0.1:4173` als zulässige Weiterleitungen gesetzt.
6. E-Mail-Anmeldung bleibt aktiviert. Der E-Mail-Versand des kostenlosen Testprojekts dient nur Entwicklung; vor einem größeren öffentlichen Start wird ein eigener SMTP-Anbieter benötigt.

## Kampagnenkern

Die Migrationen `20260927190000_phase3_4_campaign_core.sql` und `20260927200000_phase3_4_validator_hotfix.sql` ergänzen Einladungen, idempotente Befehle, unveränderliche Figurenrevisionen, kontrollierte Fortschrittsanträge, Kampagnentag, Handlungsfäden und Spielabende. Der Validator berechnet Kernkosten und abgeleitete Werte serverseitig und bindet jede Revision an App-, Schema- und Regelstand.

## Löschung, Archivierung und Wiederherstellung

- Browserkonten besitzen kein hartes Löschrecht für Welten, Kampagnen, Mitgliedschaften, Figuren oder Auditereignisse.
- Normales Entfernen geschieht über `archived_at` beziehungsweise den Status `inactive` oder `archived`.
- Die kanonische Owner-Mitgliedschaft kann nicht gelöscht, deaktiviert oder herabgestuft werden.
- Auditereignisse können im Browser gelesen, aber weder eingefügt, geändert noch gelöscht werden.
- Vor jeder produktiven Migration wird ein Datenbank-Backup beziehungsweise Export erzeugt. Eine Wiederherstellung wird zuerst in einem getrennten Projekt geprüft.
- Supabase-Projekt-Backups ersetzen keinen geprüften Export außerhalb des laufenden Projekts; verfügbare Wiederherstellungsoptionen hängen vom gebuchten Tarif ab.

## Sicherheitsprüfung

`supabase/tests/phase2_rls.test.sql` prüft 19 Rollen- und Basissicherheitsfälle. `supabase/tests/phase3_4_campaign_core.test.sql` ergänzt 44 Prüfungen für Einladungen, Idempotenz, serverseitige Regelvalidierung, Profilfixierung, Fortschrittsrevisionen, Handlungsfäden, Spielabende und Spieler-/Spielleiter-Sichtbarkeit. Beide Prüfungen laufen in Transaktionen und verwerfen ihre Testdaten vollständig mit `rollback`.

