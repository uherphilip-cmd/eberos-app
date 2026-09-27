# Testbericht v1.8.0 – Phase 2

## Automatisch bestanden

- 51 statische Architektur-, Migrations-, Authentifizierungs- und Sicherheitsprüfungen;
- 15 echte Browserprüfungen für Open Play, verzögertes Laden, Abbruchschutz und Mobilansicht;
- 33 vollständige Browser-Regressionsprüfungen der v1.7.25-r6-Basis;
- 503 integrierte Regel- und Buildertests;
- keine JavaScript-Laufzeitfehler;
- lokale Entwurfsdaten vor und nach Öffnen des Kampagnendialogs bytegleich;
- Supabase-, Kampagnen- und Anmeldemodule beim normalen Start nicht geladen;
- keine Authentifizierungs- oder API-Anfrage beim normalen Start;
- Service Worker schließt externe und autorisierte Antworten vom Cache aus;
- Darstellung bei 390 Pixel Breite ohne horizontalen Überlauf.

## Datenbanksicherheit

Die Datei `supabase/tests/phase2_rls.test.sql` enthält 19 Datenbankprüfungen für:

- Owner-/Spielleitungsrechte;
- Spielersicht auf eigene Kampagne und eigene Figur;
- Sperre fremder Figuren;
- Sperre von Spielleiter- und Figurengeheimnissen;
- Sperre für Außenstehende und unangemeldete Zugriffe;
- fehlendes hartes Löschrecht;
- serverseitig gesperrte direkte Statusmanipulation an Kampagnenfiguren;
- unveränderliche Auditereignisse;
- getrennte Antwortmodelle;
- fixierte Suchpfade aller privilegierten Datenbankfunktionen.

Diese 19 Prüfungen wurden am 27. September 2026 gegen das verwaltete Supabase-Testprojekt `Eberos Kampagnenmodul Test` ausgeführt. Alle 19 Prüfungen sind bestanden. Die Testdaten liefen vollständig innerhalb einer Transaktion und wurden am Ende mit `rollback` verworfen.

Ein zunächst roter Test wurde als zu enge Prüfung der PostgreSQL-Darstellung erkannt: Supabase speichert den leeren, fixierten Funktions-Suchpfad als `search_path=""`. Die Prüfung akzeptiert nun beide gleichwertigen PostgreSQL-Darstellungen; die privilegierten Funktionen selbst waren bereits korrekt abgesichert.

## Ergebnis

Der lokale Phase-2-Stand, die externe Datenbankabnahme und die Live-Konfiguration sind grün. Projekt-URL, öffentlicher Publishable Key, Site URL und drei erlaubte Rücksprung-Adressen sind gesetzt. Der Live-Client wurde ohne Versand einer E-Mail geladen; der echte Magic-Link-End-to-End-Test wird wegen der dabei ausgelösten Nachricht erst nach einer ausdrücklichen Bestätigung mit einer konkret benannten Zieladresse durchgeführt.

