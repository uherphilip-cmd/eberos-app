# Technischer Abschlussbericht v1.8.0

## Freigabestand

Die Phasen 0 bis 4 des Kampagnenmoduls sind umgesetzt und bilden einen reproduzierbaren Release-Kandidaten. Der Build liegt unter `output/eberos-pwa-v1.8.0/` und wird aus der verifizierten v1.7.25-r6-Basis erzeugt.

## Architektur

- `LocalDraftRepository` bleibt die alleinige Autorität für anonyme Open-Play-Entwürfe.
- Das Kampagnenmodul und das Supabase-SDK werden verzögert erst nach einer Kampagnenaktion geladen.
- `SupabaseCampaignRepository` kapselt geschützte Befehle und Lesemodelle.
- Row Level Security erzwingt Rollen und Sichtbarkeit pro Datensatz.
- Kritische Statuswechsel laufen über benannte Serverbefehle.
- Idempotenzbelege sichern wiederholte Netzwerkbefehle.
- Figurenrevisionen sind kanonisch, gehasht und unveränderlich.
- Der öffentliche Service Worker cachet weder externe noch autorisierte Antworten.

## Datenstand

- App-Version: 1.8.0
- Schema-Version: 30
- Regelstand: 15
- Supabase-Projekt: verwaltetes kostenloses Testprojekt in West EU (Irland)
- Browserzugang: Projekt-URL und öffentlicher Publishable Key
- Auth-Rücksprünge: GitHub Pages, `localhost:4173`, `127.0.0.1:4173`

## Qualität

- 66/66 statische Prüfungen;
- 17/17 Browserprüfungen;
- 33/33 Regressionstests;
- 503/503 integrierte Tests;
- 63/63 externe Datenbankprüfungen;
- keine bekannte kritische oder hohe Sicherheitslücke.

## Reproduzierbarer Build

```powershell
node scripts/build-v180.mjs --force --verify
```

Der Ablauf erzeugt die Release-Dateien neu und bricht bei einer fehlgeschlagenen statischen oder Browserprüfung ab.

## Verbleibende Freigabeschritte

1. Optionaler echter Magic-Link-Test mit ausdrücklich bestätigter Zieladresse.
2. Ausdrückliche Entscheidung zur Veröffentlichung über die bestehende GitHub-Pages-Spieleradresse.
3. Vor einem größeren öffentlichen Betrieb: eigener SMTP-Anbieter, Datenaufbewahrung und Wiederherstellungsverfahren festlegen.

Die späteren Phasen 5 bis 13 des Master-Arbeitsauftrags sind bewusst nicht Bestandteil dieser ersten v1.8.0-Veröffentlichungsgrenze.
