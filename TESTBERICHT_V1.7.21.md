# Testbericht – Eberos Charakter-Builder v1.7.21-r1

Prüfdatum: 19. September 2026

## Ergebnis vor Veröffentlichung

- 25/25 statische Struktur-, Katalog-, Regel-, Syntax- und Offline-Dateiprüfungen bestanden.
- 26/26 gezielte Browserprüfungen bestanden.
- 375/375 integrierte Builderprüfungen bestanden; veraltete Erwartungen an die abgelöste Fünf-Runden-Regel und frühere Versionsnummern sind nicht als aktuelle Abnahme gewertet.
- Keine JavaScript-Laufzeit- oder Konsolenfehler im geprüften lokalen Build.

## Kritische Szenarien

- Vier körperliche Runden kosten 4 A; vier reine Wirker-Runden kosten 0 A zusätzlich zur ausgewiesenen Kraftressource.
- Normaler Angriff und erste Technik teilen sich den Rundenpreis; eine zweite zulässige Technik kostet ihren vollen Preis zusätzlich.
- Die tatsächlich sichtbare Schaltfläche „Nächste Kampfrunde“ belastet 1 A; unmittelbares Rückgängig stellt Runde und Counter wieder her.
- Gekaufte Stufe 15 reduziert den ersten Technikpreis; ein vorübergehender Skillbonus schaltet den Rabatt nicht frei.
- Manueller A-Abzug über einen Kampfskill deckt die Grund-A der Runde, ohne beim Rundenwechsel erneut abgezogen zu werden.
- A-Mangel verwendet die bestehende LP-Ersatzregel; Erstickend bei A 0 kostet genau 1 LP.
- Drei-Runden-Effekte, Rast, Runenmagie-Anzeige und bisherige Kraftkosten bestehen ihre Regressionstests.
- Offene bezahlte Technikrunde übersteht Neuladen; ältere Rundenreste werden idempotent ohne Nachbelastung archiviert.
- Druckansicht erklärt die neue Regel; 390-Pixel-Ansicht ohne horizontalen Überlauf; installierte PWA startet offline.

Der öffentliche Bytevergleich und der Online-Funktionstest folgen nach dem Hochladen.
