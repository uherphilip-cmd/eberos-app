# Eberos Charakter-Builder v1.7.6

## Patch r9 – Kampftechniken

- 48 Kampftechniken für leichten und schweren Nahkampf, leichten und schweren Fernkampf, Verteidigung & Blocken sowie Vermeiden & Ausweichen ergänzt.
- Jeder Kampfskill besitzt acht frei wählbare Techniken in fünf Graden. Lernplätze werden auf den Kaufstufen 1, 5, 10, 15, 20 und 25 freigeschaltet; höchstens sechs der acht Techniken können gleichzeitig gelernt sein.
- Techniken skalieren mit der wirksamen Fähigkeitsstufe `S`, dem Stufenwürfel `W` und dem kontrollierten Stufenbonus `B` von 1 bis 5.
- Aktivierungen kosten je nach Grad 1 bis 4 Ausdauer zusätzlich zu Waffen- oder Aktionskosten. Spitzenwirkungen mit zusätzlichem W-Schaden sind gedeckelt und auf einmal pro Kampf begrenzt.
- Vollständige Regeln, aktuelle ausgerechnete Wirkung, Aktivierung, Gegenwehr und Grenzen werden vor dem Lernen und bei gelernten Techniken angezeigt.
- Kampftechniken funktionieren für Charaktere, NPCs und Vertraute, werden gespeichert, migriert, gedruckt und in der Abschlussprüfung validiert.

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
- Patch r8: Traummagie & Oneiromantie gehört ausschließlich zu Magie und Mana. Frühere falsche Glaube- oder Finsternis-Zuordnungen werden beim Laden entfernt.
- Patch r8: Die Verbindung von Traummagie zum Mana-Schicksalspfad, zu allen zehn Zaubern Z1 bis Z10 und zur Lernansicht wird automatisch geprüft.
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
- 328/328 automatische Builder-Tests bestanden.
- Desktop- und Mobilansicht ohne Seitenüberlauf geprüft.
