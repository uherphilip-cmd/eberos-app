# Phase 3 – Abschluss v1.8.0

## Ergebnis

Kampagnenbeitritt, Figurenprüfung und Profilfixierung sind als sicherer erster Produktkern umgesetzt. Lokale Konzepte bleiben bis zur ausdrücklichen Einreichung vollständig im Open Play. Erst die bewusste Kampagnenaktion lädt Anmeldung und Backend.

## Umgesetzt

- Einladungscodes werden einmal angezeigt und ausschließlich als SHA-256-Hash gespeichert.
- Wiederholbare Befehle verwenden Idempotenzkennungen und erzeugen keine doppelten Mitgliedschaften oder Einreichungen.
- Vor der Einreichung zeigt der Builder Figur, Schema, Regelstand, ausgegebene CBP und Restbudget.
- Der Server prüft App-, Schema- und Regelstand, Pflichtfelder, Wertebereiche, Kernkosten, Budget und abgeleitete Werte.
- Annahme erzeugt eine unveränderliche Ausgangsrevision mit Integritätshash, Einreicher, Prüfer und Zeitpunkten.
- Direkte Browseränderungen an fixierten Figurendaten und Revisionen sind entzogen.
- Fortschritt wird als Änderungsvorschlag eingereicht und nach SL-Freigabe als neue Revision gespeichert.
- Optional bleibt eine ausdrücklich erzeugte private Konzeptkopie lokal und unverbunden.
- Abbruch, Anmeldefehler und Ablehnung verändern den lokalen Entwurf nicht.

## Datenbank und Sicherheit

Die Migration `supabase/migrations/20260927190000_phase3_4_campaign_core.sql` ergänzt Einladungen, Befehlsbelege, Revisionen und Änderungsanträge. Der kleine Kompatibilitätsfix `20260927200000_phase3_4_validator_hotfix.sql` ersetzt eine nicht verfügbare JSON-Objektfunktion durch eine PostgreSQL-kompatible Schlüsselzählung.

Alle privilegierten Projektfunktionen besitzen einen fixierten Suchpfad. Browserkonten erhalten nur die benötigten RPC-Aufrufe und Lesemodelle. Geheime Kampagnendaten werden nicht an Spieler ausgeliefert.

## Abnahme

- 44/44 Datenbankprüfungen für Phase 3 und 4 bestanden;
- ungültige Einladung wird abgewiesen;
- Einreichung, Annahme, Fixierung und Fortschrittsrevision erfolgreich;
- Browser- und privilegierter Manipulationsversuch gesperrt;
- alle Testdaten nach dem Lauf zurückgerollt.

## Bewusst getrennt

Der echte Versand eines Magic Links ist kein stiller Testschritt. Er benötigt eine ausdrücklich bestätigte Zieladresse, weil dabei personenbezogene Daten an Supabase übertragen und eine E-Mail versendet wird.
