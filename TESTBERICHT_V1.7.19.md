# Testbericht v1.7.19-r1

## Ergebnis

- Integrierte Alt- und Neutests im Builder: **357/357 bestanden**
- Gezielte Browsertests für v1.7.19: **17/17 bestanden**
- Statische Struktur-, Versions- und Syntaxprüfungen: **30/30 bestanden**
- JavaScript-Laufzeitfehler: **0**

## Geprüfte Kernfälle

- Runenmagie Stufe 0: normaler Mana-Zähler sichtbar, keine Runenmana-Zusatzinformation
- Runenmagie Stufe 1: Zusatzinformation und Rast-Hinweis genau einmal sichtbar
- Runenmagie oberhalb Stufe 1: weiterhin genau ein Informationsblock
- Senkung auf Stufe 0: Informationsblock verschwindet sofort
- Andere Mana-Skills aktivieren die Runenmana-Anzeige nicht
- Allgemeine Mana-Hilfe bleibt erhalten; ausschließlich runenspezifische Hilfe folgt der Skillbedingung
- Spielercharakter, NPC und Vertrauter verwenden jeweils ihren eigenen Skillstand
- Druckansicht übernimmt die Sichtbarkeitsregel
- Bestehende Runenbindung bindet weiterhin 3 Mana und schützt diese vor einer zu hohen Manaausgabe
- Mobilansicht bei 360 Pixel Breite ohne horizontalen Überlauf
- PWA startet nach gefülltem Cache vollständig offline als v1.7.19-r1
- Alle 110 Offline-Ressourcen sind eindeutig und im Build vorhanden

## Versions- und Bestandsprüfung

- App-Version: `1.7.19-r1`
- Schema: `25`
- Regelstand: `11`
- Fähigkeiten: `86`
- Kräfte: `450`
- Kraftschulen: `30`

Die Katalogbestände und Spielmechaniken blieben unverändert.
