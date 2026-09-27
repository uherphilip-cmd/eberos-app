# Phase 1 – Abschlussbericht Architekturgrenze und Open Play

Prüf- und Abschlussdatum: 27. September 2026

## 1. Geprüfte Ausgangslage

Ausgangspunkt war die in Phase 0 reproduzierbar gesicherte Basis **v1.7.25-r6** mit Schema 29 und Regelstand 15. Vor Beginn der 1.8.0-Änderungen bestanden 69/69 statische Prüfungen, 33/33 Browser- und Offlineprüfungen sowie 494/494 integrierte Tests ohne JavaScript-Laufzeitfehler.

Die neue Entwicklung erfolgt getrennt unter `output/eberos-pwa-v1.8.0/`. Der r6-Ausgangsstand und das Paket `publish/eberos-app-v1725-r6/` wurden nicht verändert.

## 2. Betroffene Datenmodelle und Dateien

Neu beziehungsweise erweitert wurden:

- lokaler Gesamtzustand mit `openPlay`, `campaignArchitectureVersion` und `v180OpenPlayMigrationDone`;
- Figuren mit `campaignProfile` für stabile Figuren-ID, Status, Kampagnen-, Mitgliedschafts- und Revisionsreferenzen;
- Schema 30 bei unverändertem Regelstand 15;
- `scripts/v180/eberos-open-play-core-v1.8.0.js`;
- `scripts/v180/eberos-campaign-entry-v1.8.0.js`;
- `scripts/v180/eberos-v1.8.0.js`;
- `scripts/build-v180.mjs`;
- `scripts/test-v180.mjs` und `scripts/test-v180-browser.mjs`;
- `scripts/test-v1725-browser.mjs` mit weiterhin rückwärtskompatibler, parametrisierter Versionsprüfung.

## 3. Architektur- und Migrationsentscheidung

Die bisherige lokale Speicherung bleibt erhalten, wird für den Hauptzustand aber hinter `LocalDraftRepository` gekapselt. Die getrennte Schicht enthält:

- `LocalDraftRepository` für Laden, Speichern und Sicherungen lokaler Entwürfe;
- `DraftCommandService` als kontrollierter Einstieg für Migration, Validierung und Speichern;
- reine Funktionen für Entwurfsvalidierung, Open-Play-Migration und erlaubte Kampagnenstatusübergänge;
- eine absichtlich noch nicht verbundene `CampaignRepository`-Grenze;
- `CampaignModuleLoader` für das verzögerte Laden des Kampagneneinstiegs.

Alte Exporte bleiben lesbar. Beim ersten Laden wird jede bestehende Figuren-ID als stabile `characterId` übernommen. Es werden keine Konten, Serverbesitzer, Kampagnen oder Revisionen erfunden. Der Ausgangsstatus lautet `local_draft`. Die Migration ist idempotent und verändert die Eingabe der reinen Migrationsfunktion nicht.

Die Statuskette ist bereits fachlich definiert:

`local_draft → claimed → submitted → approved_locked → active → retired → archived`

Eine direkte Fixierung von `local_draft` nach `approved_locked` ist nicht erlaubt.

## 4. Umgesetzte Änderungen

- Der Kopfbereich zeigt dauerhaft **„Open Play · lokal“**.
- Alle bisherigen Builderfunktionen bleiben ohne Konto verfügbar.
- **„Kampagne beitreten“** ist als klar erkennbare Aktion ergänzt.
- Beim App-Start erscheint weder eine Anmeldung noch ein Kampagnendialog.
- Erst der bewusste Klick lädt den kleinen Kampagneneinstieg und öffnet die Erläuterung.
- Das Öffnen und Schließen dieses Dialogs verändert den lokalen Entwurf nicht.
- Anmeldung und tatsächliche Einreichung sind sichtbar als spätere Phase gekennzeichnet und noch deaktiviert.
- Der Kampagneneinstieg gehört nicht zum Startpaket des Service Workers und wird daher nicht vorab geladen.
- Open-Play-Kern und lokale 1.8.0-Laufzeit bleiben vollständig offline verfügbar.
- Die v1.7.25-Regelbasis wurde so abgeschirmt, dass sie Schema 30 nicht auf Schema 29 zurücksetzt.

## 5. Tests und Ergebnisse

- 31/31 neue statische Architektur-, Daten-, Migrations-, Syntax- und Offlineprüfungen bestanden.
- 14/14 neue Browserprüfungen für Open Play, lokale Persistenz, verzögertes Laden und unveränderte Entwürfe bestanden.
- 33/33 bestehende Browser-, UI-, Migrations-, Mobil- und Offlineprüfungen bestehen auf der 1.8.0-Ausgabe unverändert weiter.
- 503/503 integrierte Tests bestanden; der Umfang stieg gegenüber der r6-Basis um neun wirksame Phase-1-Prüfungen.
- Keine JavaScript-Laufzeitfehler.
- Mobile Ansicht bei 390 Pixel Breite ohne horizontalen Seitenüberlauf; Open-Play-Status und Kampagnenbeitritt bleiben sichtbar.
- PWA-Neustart einschließlich des Open-Play-Kerns funktioniert offline.

## 6. Sicherheits- und Sichtbarkeitsprüfung

Der Browserverkehr wurde vor und nach der Beitrittsaktion protokolliert:

- Beim Start erfolgte keine Authentifizierungs-, Login-, OAuth- oder Kampagnen-API-Anfrage.
- Das verzögerte Kampagnenmodul wurde vor dem Klick nicht angefordert.
- Nach dem Klick wurde ausschließlich das lokale statische Einstiegsmodul geladen.
- Es wurden weder Konto- noch Kampagnendaten übertragen.
- Der gespeicherte Entwurf war vor und nach Öffnen beziehungsweise Abbrechen bytegleich.
- Es gibt in Phase 1 noch keine sichtbare Sperre, die fälschlich als serverseitige Sicherheit ausgegeben werden könnte.

## 7. Bekannte Grenzen und bewusst verschobene Punkte

Phase 1 stellt noch keinen echten Kampagnenbeitritt bereit. Folgende Punkte beginnen erst nach der Startschranke von Phase 2 beziehungsweise in Phase 3:

- Backend- und Hostinganbieter;
- Konten, Anmeldung, Abmeldung und Sitzungswiederherstellung;
- Einladungs- und Kampagnencodes;
- serverseitige Rollen und Autorisierung;
- Einreichung, Prüfung, Fixierung und unveränderliche Ausgangsrevision;
- serverseitige Sperren und Konfliktbehandlung.

Ohne eine bestätigte Backend-/Hostingentscheidung wird dafür kein externer oder kostenpflichtiger Dienst gewählt.

## 8. Reproduzierbarer Build- und Startweg

Vollständiger Neuaufbau einschließlich aller statischen, Browser-, UI- und Offlineprüfungen:

```powershell
node scripts/build-v180.mjs --force --verify
```

Ergebnis:

`output/eberos-pwa-v1.8.0/`

Die lokale PWA kann anschließend über `Start-Eberos-PWA.ps1` im Ausgabeverzeichnis gestartet werden.

## 9. Freigabeempfehlung

**Phase 1 ist für die weitere Entwicklung freigegeben.** Open Play bleibt vollständig kontolos, lokal, PWA-fähig und rückwärtskompatibel. Die vorhandenen Regel- und Builderfunktionen zeigen keine Regression.

Die Ausgabe ist ausdrücklich ein technischer **Phase-1-Stand** und noch keine öffentliche vollständige Version 1.8.0. Vor Phase 2 ist die Backend-/Hostingentscheidung erforderlich.

