# Setkarten-Begleiter als NPC im Kampagnenmodul – Audit v1.8.25

Stand: 2. November 2026
Quelle: `assets/items-mse-v15/eberos-items-mse-v15.json`

## Ergebnis

- **78** Setkarten sind als Begleiter oder Reittier belegt.
- **9** humanoide beziehungsweise ausdrücklich benannte NPC-Begleiter, **42** sonstige Begleiter und **27** Reittiere sind vollständig und eindeutig zugeordnet.
- Alle **78** Einträge behalten `catalogId`, `sourceHash`, Kartennummer und Setnummer.
- Das lokale Erscheinungsbild bleibt NPC/Begleiter/Reittier; das Ziel im Kampagnenmodul ist bei allen Einträgen ein eigenständiges `NpcSheetV1`-Weltwesen.
- Gedruckte Besitzerboni bleiben an der Setkarte. Nur ausdrücklich mit „Begleiter selbst“ bezeichnete Wirkungen gehören als eigener Quellenhinweis zum NPC.
- Es wurden keine neuen Kampfwerte, Spezies oder Fähigkeiten redaktionell erfunden. Die vorhandenen v1.6-Startprofile bleiben der Ausgangspunkt und können vor dem Speichern durch die Spielleitung geprüft werden.

## Setabdeckung

| Set | Karten | NPC | Begleiter | Reittiere |
| ---: | ---: | ---: | ---: | ---: |
| 1 | 2 | 0 | 1 | 1 |
| 2 | 2 | 0 | 1 | 1 |
| 3 | 2 | 0 | 1 | 1 |
| 4 | 4 | 0 | 3 | 1 |
| 5 | 2 | 0 | 1 | 1 |
| 6 | 2 | 0 | 1 | 1 |
| 7 | 2 | 0 | 2 | 0 |
| 8 | 2 | 0 | 1 | 1 |
| 9 | 2 | 0 | 1 | 1 |
| 10 | 3 | 0 | 2 | 1 |
| 11 | 2 | 0 | 1 | 1 |
| 12 | 2 | 0 | 1 | 1 |
| 13 | 1 | 0 | 1 | 0 |
| 14 | 2 | 0 | 1 | 1 |
| 15 | 2 | 0 | 1 | 1 |
| 16 | 3 | 0 | 2 | 1 |
| 17 | 2 | 0 | 1 | 1 |
| 18 | 3 | 0 | 2 | 1 |
| 19 | 7 | 1 | 5 | 1 |
| 20 | 4 | 1 | 2 | 1 |
| 21 | 3 | 1 | 1 | 1 |
| 22 | 2 | 1 | 0 | 1 |
| 23 | 1 | 0 | 1 | 0 |
| 24 | 2 | 0 | 1 | 1 |
| 25 | 2 | 0 | 1 | 1 |
| 26 | 2 | 0 | 1 | 1 |
| 27 | 2 | 0 | 1 | 1 |
| 28 | 2 | 0 | 1 | 1 |
| 29 | 2 | 0 | 1 | 1 |
| 30 | 1 | 1 | 0 | 0 |
| 31 | 1 | 1 | 0 | 0 |
| 32 | 1 | 1 | 0 | 0 |
| 33 | 1 | 0 | 0 | 1 |
| 34 | 1 | 0 | 1 | 0 |
| 35 | 1 | 0 | 1 | 0 |
| 36 | 1 | 0 | 1 | 0 |
| 37 | 1 | 1 | 0 | 0 |
| 38 | 1 | 1 | 0 | 0 |

## Kampagnenablauf

1. Eine Set-Begleiterkarte erzeugt genau einen dauerhaft verknüpften lokalen Werte-Reiter.
2. Der Spieler gibt diesen Reiter im Kampagnenzugang ausdrücklich zur Prüfung frei.
3. Die Spielleitung bereitet daraus ein unabhängiges Weltwesen vor, prüft Werte und geheime Angaben und speichert es.
4. Erst die bewusste Verknüpfung macht dieses Weltwesen zum Begleiter, Vertrauten oder Reittier der Kampagnenfigur.
5. Spieler sehen nur die separat freigegebene Kampagnenprojektion; Karten- und Weltidentität bleiben nachvollziehbar.

## Nachweise

- Maschinenlesbares Register: `audit/mse-companion-npcs-v1.8.25.json`
- Prüftabelle: `audit/mse-companion-npcs-v1.8.25.tsv`
- Quell-SHA-256: `1f04a99ecaa9f9487362e36633397bc9dc7339a8b984a7f7dd64cb9c74abc47c`
