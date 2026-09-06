# Technischer Abschlussbericht v1.7.9

## Datenbasis

- Ausgang: v1.7.8 r4 einschließlich Synergie-Kraftverknüpfungen
- Schema: 18 · Regelversion: 7
- Itemkatalog: 203 Items, davon 70 neu gewichtete Waffen

## Migration

- Rohsicherung vor dem ersten Laden mit Version 1.7.9
- Kontaktkarten erhalten jeweils eine stabile NPC-ID
- Alte Kontaktlisten werden in unabhängige kompakte NPCs überführt und anschließend aus der alten Kostenliste entfernt
- Kontakt- und Vollansicht referenzieren denselben NPC und werden nur einmal abgerechnet
- Fehlende Gewichte bestehender Katalogitem-Instanzen werden aus dem aktuellen Katalog ergänzt

## Oberfläche und Regeln

- Normale Rast füllt Counter ohne Rationsverbrauch
- Lagerrast verbraucht genau eine Ration und wird ohne Vorrat blockiert
- Beide Rastarten setzen den Fünf-Runden-Zähler zurück
- Suche bleibt im Sichtbereich und navigiert mit Hervorhebung zum Ziel
- Eigene Rüstungen verwenden dieselbe Schutzberechnung wie Katalogrüstung

## Veröffentlichung

- Kanonische URL: https://uherphilip-cmd.github.io/eberos-app/eberos-charakter-builder.html
- Versionslink: https://uherphilip-cmd.github.io/eberos-app/eberos-charakter-builder.html?v=1.7.9-r1
