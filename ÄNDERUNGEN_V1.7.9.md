# Eberos Charakter-Builder v1.7.9

## Neu

- Zwei getrennte Rastarten: normale Rast und Lagerrast mit automatischem Verbrauch einer Ration.
- Schwebende, tastaturbedienbare Suche mit zuverlässiger Zielnavigation und kurzzeitiger Hervorhebung.
- Die Verbrauchsspalte der Fähigkeiten zeigt die aktuellen Counterstände und öffnet eine fixierbare Verbrauchs-Infobox.
- Counter können sicher in frei wählbarer Höhe ausgegeben und über die letzte Transaktion rückgängig gemacht werden.
- Fehlt beim Bezahlen Ausdauer oder Fokus, wird nur der fehlende Betrag 1:1 aus Lebenspunkten bezahlt; Rückgängig stellt beide Counter wieder her.
- Mehrere mit Schrägstrich angegebene Counter werden als Alternativen behandelt.
- Die Suche findet „Kontakt und Herkunft“ auch ohne bereits angelegtes Kontaktfenster und führt dann zur passenden Hinzufügen-Schaltfläche.
- Vorhandene Kontakte lassen sich über ihren Namen sowie über „Kontakt“ oder „Kontaktfenster“ direkt öffnen.
- Kontakte und ausgearbeitete NPCs verwenden ein gemeinsames Datenmodell mit stabilen NPC-IDs.
- Kontakte können ohne Datenkopie zu vollständigen NPCs ausgearbeitet werden.

## Korrekturen

- Alle zuvor 70 unbekannten Waffen besitzen plausible, nachvollziehbar gekennzeichnete Gewichte.
- Kataloggewichte werden bei der Migration auf bestehende Iteminstanzen ohne Gewicht übertragen.
- Selbst erstellte, aktive und tatsächlich ausgerüstete Rüstungen fließen zuverlässig in den zentralen Rüstungswert ein.
- Mehrere Kontaktkarten erhalten unabhängige NPC-Datensätze und verändern einander nicht.
- Kontakt- und NPC-Ansicht erzeugen keine doppelten CBP-Kosten.

## Kompatibilität

- Automatische Sicherung vor der Migration auf Schema 18.
- Alte Kontaktlisten und eingebettete Kontaktkarten werden idempotent übernommen.
- Charaktere, NPCs, Vertraute, Kräfte, Synergien, Techniken, Effekte und eigene Fähigkeiten bleiben erhalten.
- Die öffentliche GitHub-Pages-Adresse bleibt unverändert.
