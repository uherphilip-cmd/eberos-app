# Technischer Abschlussbericht – v1.7.17-r1

## Lieferumfang

Version 1.7.17 erweitert den bestehenden Builder um die Magieschule und Regelfähigkeit „Runenmagie & Verzauberungen“.

- App-Version: 1.7.17-r1
- Datenschema: 25
- Regelstand: 10
- Kraftkatalog: 1.3.0
- Regelfähigkeiten: 86
- Kraftschulen: 30
- Krafteinträge: 450

## Umsetzung

Die neue Fähigkeit verwendet Stärke und Geschick. Die Begründungen sind im Informationsfenster hinterlegt. Die Schule enthält 15 strukturierte Runenzauber mit stabilen IDs, vollständigen Regeltexten und eigenen Mechanikdaten.

Runen werden als aktive Wirkungen mit gespeicherten Stufenwerten geführt. Beim Vollenden werden S, W, B, Verstärkung, Träger, Dauer und Reichweite festgeschrieben. Das gebundene Mana bleibt im aktuellen Vorrat, ist jedoch bis zum Ende der Bindung nicht ausgebbar. Bei sinkendem Manavorrat brechen nötigenfalls die zuletzt geschaffenen Runen zuerst zusammen.

Runen mit W-Vorrat würfeln diesen erst beim ersten Einsatz. Die vorhandene Aktive-Effekte-Oberfläche wurde um Runenaktionen, Zustände, Trägerangaben, Auslösungen und ein kontrolliertes Lösen ergänzt. Die Lastenrune ist mit der zentralen Belastungsberechnung verbunden.

## Migration und Bestandsschutz

Beim ersten Laden eines älteren Datenstands wird eine Sicherung vor der Migration angelegt. Die neue Fähigkeit wird bei Charakteren und NPCs mit Kaufstufe 0 ergänzt. Vorhandene Stufen, CBP, gelernte Kräfte, Gegenstände, Kontakte, NPCs und aktive Wirkungen werden nicht verändert. Die Migration trägt eine eindeutige Markierung und ist idempotent.

## Veröffentlichung

Der öffentliche Einstieg bleibt unverändert; nur die Versionsabfrage lautet `v=1.7.17-r1`. Manifest, Service Worker, Cachekennung, Offline-Assetliste und externer Browserlink wurden gemeinsam aktualisiert.
