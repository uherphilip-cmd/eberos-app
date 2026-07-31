# Eberos Charakter-Builder v1.7.6

## Neu

- Voll integriertes Zauber-, Wunder- und Fluchsystem mit 270 Kräften aus der freigegebenen Gesamtfassung.
- 27 Magie-, Glaubens- und Fluchschulen mit stabilen IDs.
- Fünf neue Fähigkeiten für Fauna-Druiden, Angriffs-/Offenbarungswunder, Schutz-/Bewahrungswunder sowie beide Fluchpfade.
- Eigene Lernlisten für Charakter, NSC und Vertrauten.
- Lernplätze entsprechen der gekauften Fähigkeitsstufe, höchstens zehn.
- Zaubergrade Z1 bis Z10 können frei gewählt werden.
- Verstärkungen V1 und V2 werden regelbezogen angezeigt.
- Detailfenster zeigen Grundwert, Würfel, Bonus, Kosten, Reichweite, Dauer, Konter, Wirkung und Verstärkung.

## Stabilität und Kompatibilität

- Patch r2: Beim Steigern einer Fähigkeit bleibt die aktuelle Bildschirmposition stabil; Charakterbild und übrige Karten werden nicht mehr vollständig neu aufgebaut.
- Patch r3: Der dauerhafte Counter-Hilfstext wurde entfernt. Counter-Maxima beginnen regelkonform bei 2 und können nicht darunter gesetzt werden; der aktuelle Vorrat darf weiterhin 0 erreichen.
- Patch r5: Machtfähigkeiten mit mehreren möglichen Countern verlangen einmalig eine Zuordnung, bevor ihre Kräfte in einem Schicksalsfenster erscheinen. Thanaturgie wird nicht mehr automatisch Finsternis zugeordnet.
- Patch r5: Kraftregeln werden bereits vor dem Lernen vollständig eingeblendet. Gelernte Kraftdetails öffnen innerhalb der Karte; Schwebefenster besitzen keinen eigenen Schieber mehr.
- Patch r6: Wechselbalg & Formwandlerei gehört ausschließlich zu Finsternis und wird nicht mehr zur Counterwahl angeboten.
- Patch r6: Die wirkungslose Auswahl „Eine von drei Ausrichtungen“ wurde aus allen Schicksalspfaden entfernt.
- Patch r7: Gesteigerte, aber noch nicht zugeordnete Machtfähigkeiten werden direkt in allen passenden Schicksalspfaden erklärt und können dort zugeordnet werden.
- Patch r7: Die Abschlussprüfung meldet unvollständige Machtzuordnungen mit dem Namen der betroffenen Fähigkeit.
- Alte Druiden-Fähigkeit wird beim Laden verlustfrei Flora oder Fauna zugeordnet.
- Bestehende Charaktere bleiben kompatibel; gelernte Kräfte werden mit stabilen IDs gespeichert.
- Beim Senken einer Pfadstufe werden zuletzt gelernte Kräfte nach Bestätigung entfernt.
- Fremde, doppelte oder ungültige Kräfte werden beim Import abgefangen.
- Druckansicht zeigt nur gelernte Kräfte und blendet leere Pfade aus.
- Offline-Cache, Manifest, Startdateien und Versionsanzeige wurden auf 1.7.6 aktualisiert.

## Geprüft

- 270/270 Katalogeinträge eindeutig und vollständig.
- Alle 15 Quellfelder wurden übernommen.
- 162 verstärkbare und 108 nicht verstärkbare Kräfte validiert.
- 314/314 automatische Builder-Tests bestanden.
- Desktop- und Mobilansicht ohne Seitenüberlauf geprüft.
