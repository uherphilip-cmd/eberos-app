# Eberos v1.8.25 – Runtime konsolidiert R1

- 44 synchron geladene JavaScript-Einzeldateien wurden in einen aktuellen Bootstrap und eine aktuelle Runtime überführt.
- Der Browser lädt beim Start nur noch zwei externe Skripte.
- Die historische Ausführungs- und Migrationsreihenfolge bleibt innerhalb der Bundles bytegetreu erhalten.
- Die 44 Einzeldateien sind nicht mehr Teil des Release-Outputs und werden nicht mehr durch den Service Worker vorgeladen.
- Lazy-Loading für Kampagne, Spielleitung, Supabase, Kalender und Wissensdaten bleibt getrennt.
- App-Version 1.8.25, Schema 45, Regelstand 17 und alle Spielmechaniken bleiben unverändert.
- Grundwert-Hover R4 bleibt vollständig enthalten.

## Quellen

- Bootstrap: `data/eberos-items-anfaenger-v1.3.js`, `data/eberos-magie-wunder-flueche-v1.4.js`, `data/eberos-open-play-core-v1.8.0.js`
- Runtime: 41 Quellen von `data/eberos-v1.7.6.js` bis `data/eberos-startup-v1.8.25.js`
