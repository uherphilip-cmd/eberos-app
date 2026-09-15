# Testbericht – Eberos Charakter-Builder v1.7.17-r1

Prüfdatum: 15. September 2026

## Ergebnis

Der geprüfte Build hat alle automatisierten Prüfungen bestanden.

- 42 Struktur-, Daten-, Syntax- und Offlineprüfungen bestanden.
- 31 Browser- und Interaktionsprüfungen bestanden.
- Keine JavaScript-Laufzeitfehler festgestellt.
- Mobilansicht bei 360 Pixel Breite ohne horizontalen Überlauf.

## Geprüfte Kernfunktionen

- Version 1.7.17-r1, Schema 25 und Regelstand 10.
- 86 Regelfähigkeiten mit „Runenmagie & Verzauberungen“ auf ST + GS und Mana.
- 450 Kräfte in 30 Schulen; die 435 alten Kräfte und 29 alten Schulen blieben unverändert.
- 15 Runenzauber Z1 bis Z15; alle ab Kaufstufe 1 auswählbar und ein Lernplatz je Kaufstufe.
- 11 verstärkbare und 4 nicht verstärkbare Runen.
- Gebundenes Mana senkt nur die verfügbare, nicht die aktuelle Manamenge.
- Normale Manaausgaben berücksichtigen aktive Bindungen und können sie nicht unterschreiten.
- Rast füllt ausgegebenes Mana, löst aktive Runen aber nicht.
- Beim Ende einer Rune wird ihre Bindung freigegeben, ohne zusätzlich Mana zu erzeugen.
- W-Vorräte werden erst bei ihrer ersten Verwendung gewürfelt.
- Schlagrune verstärkt ausschließlich den Schaden; der Angriffswurf bleibt unverändert.
- Rune der leichten Last verändert die tatsächliche Belastungsrechnung.
- Migration von v1.7.16 ist verlustfrei, protokolliert, gesichert und wiederholbar.
- Katalog und Laufzeit sind im Offline-Cache enthalten.

## Ausgeführte Prüfprogramme

- `scripts/test-v1717.mjs`: 42/42 bestanden.
- `scripts/test-v1717-browser.mjs`: 31/31 bestanden.
- Integrierte Alt- und Neutests im Builder: vollständig bestanden.
