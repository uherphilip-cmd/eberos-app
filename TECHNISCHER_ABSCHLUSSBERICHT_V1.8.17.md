# Technischer Abschlussbericht v1.8.17

Stand: 26. Oktober 2026
Auftrag: NPC-Datenbank, Kampf, Inventar und Beute
Status: Anwendung, Audit, Online-Datenbank und GitHub-Pages-Veröffentlichung abgeschlossen

## Ergebnis

Die Anwendungsversion v1.8.17 ist gebaut. Alle 30 vorbereiteten Archetypen besitzen eine ausdrückliche Rollenklasse, einen Kampfstatus und ein Beuteprofil. Die bestätigten hohen Befunde wurden behoben. Der Pilotfall „Dieb & Einbrecher“ besitzt im unveränderten Standardprofil genau sechs Fähigkeiten, darunter leichten Nahkampf 7 und Ausweichen 8, sowie Dolch, Schlosswerkzeug und feines Seil als drei konkrete und unabhängig instanziierte Inventargegenstände.

Vorbereitete Weltvorlagen werden additiv von Version 3 auf Version 4 ergänzt. Eigene Texte, höhere oder abweichende Werte, eigene Gegenstände und eigene Ausbaustufenbezeichnungen bleiben erhalten. Bereits gespeicherte Wesen werden nicht still verändert.

Inventar, optionale vorbereitete Beute und Beutezugänge sind getrennte Bestände. Die Oberfläche zeigt diese Trennung ausdrücklich. Spielername und Spielerbeschreibung eines Transfers werden aus der geprüften Quellzeile übernommen; ein manipulierter Client kann sie nicht ersetzen. `gmNotes` werden vor dem übertragbaren Payload entfernt.

## Verifikation

| Prüfung | Ergebnis |
| --- | --- |
| Ausgangsversion v1.8.16, statisch | 17/17 bestanden |
| Ausgangsversion v1.8.16, Browser | 8/8 bestanden |
| v1.8.17, statisch | 16/16 bestanden |
| v1.8.17, Browser und Ende-zu-Ende | 16/16 bestanden |
| Normalisierte Archetypen | 30/30 gültig |
| Kampferwartete Vorlagen mit Angriff und Defensive | 21/21 |
| Doppelinstanziierung und Speichern-Neuladen-Rundlauf | 30/30 bestanden |
| Verbliebene Blocker oder hohe Befunde | 0 |
| Vollständige pgTAP-Suite | 22 Dateien, 939/939 Prüfungen bestanden |
| Beutetransfer | 67/67 Prüfungen bestanden |
| Kanonisches NPC-Dokument | 15/15 Prüfungen bestanden |
| Datenbank-Linting | Keine neue v1.8.17-Warnung |

Der Browserlauf prüft zusätzlich die additive v3-zu-v4-Aktualisierung, den Erhalt eigener Daten, eindeutige Gegenstandskennungen zweier NPC-Instanzen, Speichern und Neuladen, die Beuteauswahl, den Inventartransfer und die schmale Darstellung ohne Laufzeitfehler.

## Datenbank und bestätigte Drift

Der lokale Supabase/Postgres-Stand wurde vollständig aus allen 38 Migrationen neu aufgebaut. Anschließend bestanden alle 22 pgTAP-Dateien mit zusammen 939 Prüfungen. Die neue NPC-Normalisierung wurde über eine eigene Folgemigration korrekt als `STABLE` klassifiziert; ihre Lintwarnung ist damit behoben.

Das Datenbank-Linting endet erfolgreich. Es meldet noch drei ältere Warnungsgruppen in `private.level_cost`, `private.calculate_character_rules` und `private.campaign_calendar_snapshot`. Diese Funktionen wurden durch v1.8.17 nicht geändert und bleiben als getrennte technische Altlast dokumentiert.

Der verbundene Supabase-Teststand wurde ausschließlich lesend geprüft:

- Die angewandte Historie endet vor der lokalen Migration `20261018190000_creature_npc_sheet.sql`.
- `public.creatures` besitzt dort derzeit nur `stats`, noch nicht `npc_data` und `npc_schema_version`.
- `public.creature_management_view` besitzt deshalb ebenfalls noch nicht die beiden kanonischen NPC-Spalten.
- `creature_loot_receipts_inventory_key_check` erlaubt dort noch ausschließlich `equipment`, `weapons` und `armor`.
- Die bestehende Transferfunktion ist `security definer`, verwendet einen leeren `search_path`, ist für `anon` gesperrt und für `authenticated` ausführbar.

Diese Drift bestätigt die im Auftrag beschriebene Ausgangslage. Es wurden weder Migrationen noch Testdaten auf eine entfernte Datenbank geschrieben.

## Vorbereitete Migration

`20261026065208_npc_loot_v1817.sql`:

- ergänzt `loot` als getrennte erlaubte Transferquelle;
- erweitert den Formconstraint des kanonischen NPC-Dokuments additiv;
- prüft Instanzkennungen über alle erlaubten Quelllisten;
- blockiert `transferable: false`;
- validiert Spielertexte gegen `playerName`/`playerDescription` oder die sichtbaren Quelldaten;
- entfernt `gmNotes` aus dem übertragbaren Gegenstand;
- erhält Revision, Idempotenz, Effektbindung und atomare Rücknahme;
- repariert `creature_management_view` als `security_invoker`-Ansicht;
- setzt Funktions- und Ansichtsrechte ausdrücklich per `REVOKE` und `GRANT`.

Die zugehörigen pgTAP-Dateien prüfen zusätzlich getrennte Beute, Rücknahme, Geheimtextschutz, nicht übertragbare Einträge und manipulierte Spielertexte.

## Online-Veröffentlichung

Am 26. Oktober 2026 wurden die drei fehlenden, lokal vollständig geprüften Migrationen in dieser Reihenfolge auf das bestehende Projekt `Eberos Kampagnenmodul Test` angewendet:

1. `creature_npc_sheet`
2. `npc_loot_v1817`
3. `npc_normalize_volatility_v1817`

Die anschließende Online-Prüfung bestätigt die neuen NPC-Felder, die normalisierende Funktion, die Verwaltungsansicht und den erweiterten Beutetransfer. `authenticated` darf den berechtigungsgeprüften Transfer aufrufen; `anon` und `PUBLIC` besitzen kein Ausführungsrecht. Alle öffentlichen Tabellen haben RLS aktiviert.

Security Advisor und Performance Advisor melden nach dem Rollout dieselben bereits zuvor bekannten Hinweisgruppen; durch v1.8.17 kam keine neue Advisor-Gruppe hinzu. Der geprüfte Web-Build wurde anschließend über den bestehenden `main`-Branch auf GitHub Pages veröffentlicht:

`https://uherphilip-cmd.github.io/eberos-app/eberos-charakter-builder.html?v=1.8.17`

## Artefakte

- Build: `output/eberos-pwa-v1.8.17`
- Auditbericht: `NPC_DATENBANK_AUDIT_BERICHT_V1.8.17.md`
- Auditdaten: `audit/npc-archetypes-v1.8.17.json` und `audit/npc-archetypes-v1.8.17.tsv`
- Statischer Test: `scripts/test-v1817.mjs`
- Browsertest: `scripts/test-v1817-browser.mjs`
- Auditexport: `scripts/export-v1817-npc-audit.mjs`
- Migration: `supabase/migrations/20261026065208_npc_loot_v1817.sql`
- Lint-Folgemigration: `supabase/migrations/20261026072415_npc_normalize_volatility_v1817.sql`
- Datenbanktests: `supabase/tests/phase5_loot_transfer.test.sql` und `supabase/tests/creature_npc_sheet.test.sql`
