# Testbericht – Eberos Charakter-Builder v1.7.16-r1

Stand: 14. September 2026

## Ergebnis

Alle automatisierten Prüfungen sind bestanden.

- 41 statische Struktur-, Katalog-, Versions- und Offlineprüfungen
- 31 Browser-, Bedien-, Migrations- und Laufzeitprüfungen
- keine JavaScript-Syntax- oder Browser-Laufzeitfehler
- Mobilansicht bei 360 Pixeln ohne horizontalen Überlauf
- Offline-Start mit vollständigem Katalog erfolgreich

## Geprüfte Fachlogik

- 85 Regelfähigkeiten mit eindeutigen IDs
- Hellsicht & Vorhersagen: WN + RF, Mana
- Umbramantie – Schatten, Geheimnis & Schwellen: GS + RF, Mana
- 435 Kräfte in 29 Schulen; Mana 240 / Glaube 75 / Finsternis 120
- je 15 vollständige Zauber, ab Kaufstufe 1 auswählbar; die Stufe begrenzt nur die Lernplätze
- W, S, B und V werden stufengerecht aufgelöst
- Mana besitzt keinen LP-Ersatz
- gewürfelte Vorräte sind als aktive Effekte sichtbar und bedienbar
- Rückgängig erstattet Mana und entfernt die verknüpfte Wirkung
- Suche öffnet Schulen, Zauber und vollständige Regeltexte

## Abwärtskompatibilität

Ein isolierter v1.7.15-Altstand wurde auf Schema 24 migriert: Neue Fähigkeiten beginnen auf Stufe 0; bestehende und eigene Fähigkeiten bleiben erhalten; die Sicherung wird angelegt; die Migration ist protokolliert und idempotent.

## Datenintegrität

- 405 Altkräfte und 27 Altschulen im Datenmodell unverändert
- 435 eindeutige Kraft-IDs
- Regelfassung SHA-256: f7c4b3e59cdf28eebf49dca0aa0286621ba7e2f5f874e941b52d0e0d19616c19
- 107 vorhandene und eindeutige Offline-Ressourcen

Der lokale Build ist für die Veröffentlichung freigegeben.
