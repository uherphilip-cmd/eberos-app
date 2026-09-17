# Technischer Abschlussbericht v1.7.19-r1

## Ziel und Ergebnis

Die Runenmana-Zusatzinformation wird nur noch ausgegeben, wenn der jeweils dargestellte Besitzer Runenmagie mit einer gekauften Stufe größer als 0 besitzt. Der allgemeine Mana-Zähler bleibt unabhängig davon vollständig erhalten.

## Zentrale Umsetzung

Die zentrale Prüfung `hasPurchasedRuneMagicV1719(owner)` liest ausschließlich die gekaufte Stufe der stabilen Skill-ID `skill_magic_rune_enchanting` beim übergebenen Besitzer.

Die bestehende autoritative Counter-Erzeugung in `data/eberos-v1.7.17.js` verwendet diese Prüfung direkt, bevor `.mana-binding-v1717` erzeugt wird. Es wurde keine weitere globale Renderer-Überschreibung ergänzt. Der Mana-Infodialog erhält denselben Besitzer und verwendet dieselbe Bedingung.

Der bestehende Skill-Renderer in `data/eberos-v1.7.8.js` löst beim Wechsel über die Sichtbarkeitsschwelle 0/1 eine vollständige Aktualisierung der Karten aus. Dadurch reagiert die Oberfläche unmittelbar, ohne die Seite neu laden oder den Reiter wechseln zu müssen.

## Geänderte und ergänzte Dateien

- `eberos-charakter-builder.html`: Version, Cachebuster und Besitzerübergabe an die Counter-Hilfe
- `data/eberos-v1.7.17.js`: zentrale Sichtbarkeitsprüfung für Runenmana und Runenhilfe
- `data/eberos-v1.7.8.js`: unmittelbare Aktualisierung beim Kauf oder Entfernen der ersten Runenmagie-Stufe
- `data/eberos-v1.7.19.js`: Versionsmetadaten und integrierte Regressionstests
- `index.html`, `manifest.webmanifest`, `service-worker.js`: v1.7.19- und Offline-Aktualisierung
- `Eberos im externen Browser.url`, `Start-Eberos-PWA.ps1`: aktuelle Start- und Veröffentlichungsangaben
- `ÄNDERUNGEN_V1.7.19.md`, `TESTBERICHT_V1.7.19.md`, `TECHNISCHER_ABSCHLUSSBERICHT_V1.7.19.md`: Dokumentation
- `VORSCHAU_V1.7.19.png`: geprüfte Mobilvorschau

Außerhalb des Builds wurden `scripts/test-v1719.mjs` und `scripts/test-v1719-browser.mjs` als reproduzierbare Prüfungen ergänzt.

## Versionen und Daten

- App-Version: `1.7.19`
- Veröffentlichungsrevision: `r1`
- Regelstand: `11` unverändert
- Schema: `25` unverändert
- Speicherschlüssel: unverändert
- Datenmigration: nicht erforderlich

Der vorherige Build `output/eberos-pwa-v1.7.18/` wurde nicht verändert. Der neue Build liegt vollständig unter `output/eberos-pwa-v1.7.19/`.

## Prüfung

- 357/357 integrierte Buildertests bestanden
- 17/17 gezielte Browsertests bestanden
- 30/30 statische Struktur-, Versions- und Syntaxprüfungen bestanden
- JavaScript-Laufzeitfehler: 0
- Offline-Neustart erfolgreich
- 360-Pixel-Mobilansicht ohne horizontalen Überlauf
- 110/110 Offline-Ressourcen eindeutig und vorhanden
