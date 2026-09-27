# Testbericht v1.8.0 – Releasefassung

**Prüfdatum:** 27. September 2026

**Basis:** v1.7.25-r6
**Release:** v1.8.0, Schema 30, Regelstand 15

## Ergebnis

Der reproduzierbare Release-Build ist grün. Open Play bleibt kontolos und offlinefähig; Kampagnenfunktionen werden erst nach **Kampagne beitreten** geladen.

## Automatische Prüfungen

- 66 statische Architektur-, Sicherheits-, Migrations- und Syntaxprüfungen;
- 17 echte Browserprüfungen für Start, verzögertes Laden, Vorschau, Mobilansicht und Live-Konfiguration;
- 33 vollständige Browser-Regressionsprüfungen der v1.7.25-r6-Basis;
- 503 integrierte Regel- und Buildertests;
- 19/19 Phase-2-Datenbankprüfungen;
- 44/44 Phase-3/4-Datenbankprüfungen;
- keine JavaScript-Laufzeitfehler.

## Besonders geprüft

- keine Anmeldung und keine Auth/API-Anfrage beim normalen Start;
- lokale Entwurfsdaten bleiben beim Öffnen und Abbrechen bytegleich;
- Service Worker speichert keine externen oder autorisierten Antworten;
- ausschließlich öffentlicher Supabase-Schlüssel im Browser;
- Einladungscode nur gehasht gespeichert;
- gültige und ungültige Einladung;
- idempotente Welt-, Kampagnen- und Mitgliedschaftsbefehle;
- serverseitige Version-, Kosten-, Budget- und Ableitungsprüfung;
- unveränderliche Ausgangs- und Fortschrittsrevisionen;
- getrennte Spieler-, SL- und Außenstehenden-Sicht;
- sichtbare und geheime Spielabende und Handlungsfäden;
- responsive Darstellung ohne horizontalen Überlauf bei 390 Pixel.

## Gefundener und behobener Fehler

Der erste Phase-3/4-Prüflauf fand eine nicht verfügbare PostgreSQL-Funktion zur Länge eines JSON-Objekts. Der Validator verwendet nun die kompatible Zählung der JSON-Schlüssel. Anschließend bestanden 44 von 44 Datenbankprüfungen. Der Test zeigte außerdem erwartungsgemäß, dass Browserkonten Revisionen bereits auf Berechtigungsebene nicht verändern können; zusätzlich sperrt ein Datenbankwächter auch privilegierte Manipulationsversuche.

## Noch nicht ausgelöst

Kein echter Magic Link wurde versendet. Dieser End-to-End-Test benötigt eine ausdrückliche Bestätigung der konkreten Zieladresse. Die Live-Konfiguration, das Laden des echten Supabase-SDKs und die Anzeige der Anmeldung nach der Kampagnenaktion sind bereits geprüft.
