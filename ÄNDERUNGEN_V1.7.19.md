# Änderungen v1.7.19-r1

## Runenmana-Anzeige

- Die allgemeine Mana-Steuerung bleibt für alle Figuren sichtbar und bedienbar.
- Die Zusatzinformation zu aktuellem, gebundenem und verfügbarem Mana erscheint nur noch, wenn **Runenmagie** (`skill_magic_rune_enchanting`) mit mindestens Stufe 1 gekauft wurde.
- Der Hinweis „Rast füllt ausgegebenes Mana auf; aktive Runenbindungen bleiben bestehen.“ folgt derselben Bedingung.
- Die ausschließlich runenspezifische Erklärung im Mana-Infodialog wird ebenfalls erst ab Runenmagie Stufe 1 gezeigt.
- Die Prüfung verwendet immer den Besitzer der gerade dargestellten Karte. Dadurch gilt das Verhalten korrekt für Spielercharaktere, NPCs und Vertraute.
- Beim Kauf der ersten Runenmagie-Stufe beziehungsweise beim Senken auf Stufe 0 wird die Counter-Karte unmittelbar aktualisiert.
- Druckansichten übernehmen dieselbe Sichtbarkeitsregel.

## Unverändert

- Mana-Maximum, aktueller Manavorrat, Mana-Regeneration und Mana-Kosten
- Runenkräfte, Bindungsdauer und die Berechnung von gebundenem beziehungsweise verfügbarem Mana
- Schutz vor der Ausgabe bereits gebundenen Manas
- Regelstand 11 und Charakterschema 25
- Die in v1.7.18 festgelegte Rennformel `Rennen als Aktion = Bewegung × 2`

Dieses Update ist eine reine Kontext- und Anzeigeverbesserung. Es führt keine neue Regel oder Datenmigration ein.
