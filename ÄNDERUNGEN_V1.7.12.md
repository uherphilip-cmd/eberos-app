# Eberos Charakter-Builder v1.7.12-r2

## Magie, Wunder und Flüche

- Der bestehende Katalog wurde von 270 auf 405 Kräfte erweitert.
- Alle 27 Bereiche enthalten jetzt Z1 bis Z15.
- Hinzugekommen sind 135 Kräfte: 70 Zauber, 25 Wunder und 40 Flüche.
- Bestehende IDs und gelernte Kräfte aus Z1 bis Z10 bleiben unverändert.
- Die Anzeigenamenskorrektur „Hand der Fürsprache“ bleibt erhalten.

## Lernplätze und Kompatibilität

- Z1 bis Z15 sind unabhängig von ihrer Nummer frei auswählbar.
- Die gekaufte Fähigkeitsstufe gibt bis zu 15 Lernplätze. Effektive Modifikatoren verändern W, B und S, aber nicht die Lernplätze.
- Das Speicherschema bleibt Version 20; die r2-Migration ist verlustfrei und wiederholbar.
- Der Offlinecache lädt ausschließlich den neuen Katalog v1.1.0.

## Patch r2

- Die CBP-Abrechnung wurde kontextabhängig auf zwei beziehungsweise drei verständliche Möglichkeiten reduziert.
- „Nur dokumentieren“ wird kostenneutral zu „Kostenfrei“ migriert.
- Gelernte Kampftechniken können aus ihrem Detailfenster eingesetzt und bezahlt werden.
- Gelernte Zauber, Wunder und Flüche können aus ihrem Detailfenster gewirkt und bezahlt werden.
- Alle 405 Kraftkosten werden ausdrücklich klassifiziert; Sonderkosten erhalten passende Auswahl- und Eingabefelder.
- Zahlungen sind atomar, gegen Doppelklick geschützt und unmittelbar rückgängig zu machen.
