# Testbericht v1.8.0 – Phase 1

Prüfdatum: 27. September 2026

## Ergebnis

- 31/31 statische Phase-1-Prüfungen bestanden.
- 14/14 neue Open-Play-Browserprüfungen bestanden.
- 33/33 bestehende Browser-, UI-, Migrations-, Mobil- und Offlineprüfungen auf v1.8.0 bestanden.
- 503/503 integrierte Bestands- und Neutests bestanden.
- Keine JavaScript-Laufzeitfehler festgestellt.

## Geprüfte Kernfälle

- Start ohne Konto, Anmeldedialog oder Kampagnenanfrage.
- Sichtbare Kennzeichnung „Open Play · lokal“.
- Alle bisherigen Builderfunktionen bleiben im lokalen Modus verfügbar.
- Laden und Speichern des Hauptzustands über `LocalDraftRepository`.
- Verlustfreie, einmalige und idempotente Migration von Schema 29 auf Schema 30.
- Stabile Figuren-ID und leere migrationsfähige Kampagnen-, Mitgliedschafts- und Revisionsfelder.
- Ungültige direkte Statusänderung von `local_draft` nach `approved_locked` wird abgelehnt.
- Lokaler Entwurf bleibt nach Neuladen vollständig erhalten.
- Kampagneneinstieg ist beim Start nicht geladen und wird erst nach dem bewussten Klick angefordert.
- Öffnen und Abbrechen des Beitrittsdialogs verändert den gespeicherten Entwurf nicht.
- Keine Authentifizierungs-, OAuth- oder Kampagnen-API-Anfrage vor oder nach dem Phase-1-Dialog.
- Offline-Neustart, Druck-, Import-, Export-, Regel-, Builder- und Migrationsbestandstests bleiben grün.
- Mobile Ansicht bei 390 Pixel ohne horizontalen Überlauf.

## Reproduktion

```powershell
node scripts/build-v180.mjs --force --verify
```
