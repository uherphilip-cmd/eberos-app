# NPC-Datenbank-Auditbericht v1.8.17

Stand: 26. Oktober 2026
Ausgangsversion: v1.8.16
Zielversion: v1.8.17
Prüfquelle: normalisierte Laufzeitvorlagen aus `EberosNpcArchetypeAuditV1817`

## Ergebnis

- Geprüfte vorbereitete Archetypen: **30**
- Kampferwartete Archetypen: **21**
- Vorlagen mit Inventarbeute: **18**
- Vorlagen mit bewusstem Beutestatus `none`: **12**
- Verbliebene Blocker oder hohe Befunde: **0**

Alle 30 Vorlagen bestehen die automatisierte Rollen-, Kampf-, Inventar- und Beuteprüfung.

## Behobene hohe Befunde

- **Dieb & Einbrecher:** leichte Nahkampffähigkeit 7 und Ausweichen 8 ergänzt; drei konkrete Inventarinstanzen; Beutestatus `inventory`.
- **Späher & Jäger:** Dolchfertigkeit und Ausweichen ergänzt.
- **Kultwirker:** Dolchfertigkeit und Ausweichen ergänzt.
- **Große Raubbestie, Niederer Dämon, Wasserjäger und Jungdrache:** jeweils fehlende Defensive ergänzt.
- **Arkanist & Hofmagier und Vampirischer Höfling:** Defensive ergänzt; die Waffenklasse des Langschwerts beim Vampir berichtigt.
- **Attentäter & Schattenklinge:** Fernkampffähigkeit für den mitgeführten Kurzbogen ergänzt.
- **Adliger, Priester und Arkanist:** nicht als primäre Kampfwaffe gedachte Gegenstände als Standeszeichen, Werkzeug beziehungsweise Fokus markiert.
- **Alle Vorlagen:** eingebettete Standard-Builds enthalten ihr konkretes Inventar und v4-Metadaten.

## Fachliche Grenzen

Natürliche Monsterbeute, Münzbeträge und Zufallstabellen wurden nicht erfunden. Vorlagen ohne mitgeführtes Inventar besitzen deshalb bewusst den Status `none`, bis redaktionell freigegebene Einträge vorliegen. Das neue getrennte Feld `loot` und der atomare Transferweg sind für spätere feste Einträge vorbereitet.

## Matrix

| Archetyp | Rollenklasse | Kampf | Angriff | Defensive | Inventar | Beute | Ergebnis |
| --- | --- | --- | --- | --- | ---: | --- | --- |
| Alltagsfigur | civilian | nein | – | – | 2 | inventory | bestanden |
| Händler & Informant | social | nein | – | – | 2 | inventory | bestanden |
| Stadtwache | combatant | ja | Nahkampf – leichte Waffen | Verteidigung & Blocken | 4 | inventory | bestanden |
| Räuber & Wegelagerer | stealth-opponent | ja | Fernkampf – leichte Waffen, Nahkampf – leichte Waffen | Vermeiden & Ausweichen | 4 | inventory | bestanden |
| Veteran & Anführer | combatant | ja | Nahkampf – schwere Waffen | Verteidigung & Blocken | 3 | inventory | bestanden |
| Spürhund & Wolf | animal-swarm | ja | Nahkampf – Raufen & Ringen | Vermeiden & Ausweichen | 0 | none | bestanden |
| Große Raubbestie | monster-boss | ja | Nahkampf – Raufen & Ringen | Vermeiden & Ausweichen | 0 | none | bestanden |
| Feenbote & Trickster | social | nein | – | Vermeiden & Ausweichen | 0 | none | bestanden |
| Gebundener Geist | spirit-bound | nein | – | – | 0 | none | bestanden |
| Untoter Wächter | combatant | ja | Nahkampf – schwere Waffen | Verteidigung & Blocken | 2 | inventory | bestanden |
| Kultwirker | caster | ja | Flüche & Blut-Hexerei, Nahkampf – leichte Waffen | Vermeiden & Ausweichen | 3 | inventory | bestanden |
| Konstruktwächter | monster-boss | ja | Nahkampf – Raufen & Ringen | Verteidigung & Blocken | 0 | none | bestanden |
| Wirt & Gastgeber | civilian | nein | – | – | 2 | inventory | bestanden |
| Heiler & Feldscher | support | nein | – | – | 2 | inventory | bestanden |
| Gelehrter & Schreiber | social | nein | – | – | 2 | inventory | bestanden |
| Adliger & Diplomat | social | nein | – | – | 2 | inventory | bestanden |
| Söldner & Leibwächter | combatant | ja | Nahkampf – schwere Waffen | Verteidigung & Blocken | 3 | inventory | bestanden |
| Späher & Jäger | combatant | ja | Fernkampf – leichte Waffen, Nahkampf – leichte Waffen | Vermeiden & Ausweichen | 4 | inventory | bestanden |
| Dieb & Einbrecher | stealth-opponent | ja | Nahkampf – leichte Waffen | Vermeiden & Ausweichen | 3 | inventory | bestanden |
| Attentäter & Schattenklinge | stealth-opponent | ja | Nahkampf – leichte Waffen, Fernkampf – leichte Waffen | Vermeiden & Ausweichen | 3 | inventory | bestanden |
| Priester & Seelsorger | support | nein | – | – | 3 | inventory | bestanden |
| Arkanist & Hofmagier | caster | ja | Hermetische Magie & Telekinetik | Vermeiden & Ausweichen | 2 | inventory | bestanden |
| Feuer-Elementar | monster-boss | ja | Feuermagie & Pyrokinetik, Nahkampf – Raufen & Ringen | Vermeiden & Ausweichen | 0 | none | bestanden |
| Niederer Dämon | monster-boss | ja | Nahkampf – Raufen & Ringen, Flüche & Blut-Hexerei | Verteidigung & Blocken | 0 | none | bestanden |
| Vampirischer Höfling | stealth-opponent | ja | Vampirismus & Lebensraub, Nahkampf – schwere Waffen | Vermeiden & Ausweichen | 1 | inventory | bestanden |
| Dornenhüter | monster-boss | ja | Druiden – Flora-Pfad | Verteidigung & Blocken | 0 | none | bestanden |
| Rattenschwarm | animal-swarm | ja | Nahkampf – Raufen & Ringen | Vermeiden & Ausweichen | 0 | none | bestanden |
| Wasserjäger | monster-boss | ja | Nahkampf – Raufen & Ringen, Wassermagie & Hydromantie | Vermeiden & Ausweichen | 0 | none | bestanden |
| Hügelriese | monster-boss | ja | Nahkampf – Raufen & Ringen | Verteidigung & Blocken | 0 | none | bestanden |
| Jungdrache | monster-boss | ja | Nahkampf – Raufen & Ringen, Feuermagie & Pyrokinetik | Verteidigung & Blocken | 0 | none | bestanden |

## Test- und Datenbankstatus

- Statischer Buildtest: **16/16 bestanden**.
- Browser- und Dieb-Ende-zu-Ende-Test: **16/16 bestanden**, einschließlich Doppelinstanziierung und Speichern-Neuladen-Rundlauf aller 30 Builds.
- Der lokale Supabase-Stand wurde aus allen Migrationen neu aufgebaut. **22 Testdateien mit 939 Prüfungen bestanden**, darunter 67 Beute- und 15 NPC-Dokumentprüfungen.
- Das lokale Datenbank-Linting enthält keine neue v1.8.17-Warnung. Drei ältere Warnungsgruppen in Regel-, Charakter- und Kalenderfunktionen bleiben außerhalb dieses Updates.
- Der read-only Schemaabgleich der entfernten Testinstanz zeigt weiterhin: Die verbundene Testinstanz endet vor `20261018190000_creature_npc_sheet.sql`; dort fehlen derzeit `npc_data`, `npc_schema_version` und die beiden Spalten in `creature_management_view`. Es wurden keine entfernten Änderungen vorgenommen.

## Nachweise

- Statischer Buildtest: `scripts/test-v1817.mjs`
- Browser- und Dieb-Ende-zu-Ende-Test: `scripts/test-v1817-browser.mjs`
- Datenbanktest: `supabase/tests/phase5_loot_transfer.test.sql`
- Migration: `supabase/migrations/20261026065208_npc_loot_v1817.sql`
- Maschinenlesbare Matrix: `audit/npc-archetypes-v1.8.17.json` und `audit/npc-archetypes-v1.8.17.tsv`
