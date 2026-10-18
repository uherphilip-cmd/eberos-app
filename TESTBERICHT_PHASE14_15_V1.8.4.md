# Testbericht Phase 14 und 15 – Eberos v1.8.4

Stand: 18. Oktober 2026

## Ergebnis

Alle ausgeführten Prüfungen sind bestanden.

- v1.8.3 Phase 14: 21 statische Prüfungen, 11 Browserprüfungen, 9 vollständige Altphasen-Suiten und 4 Offlineprüfungen.
- v1.8.4 Phase 15: 17 statische Prüfungen, 10 Browserprüfungen, 9 vollständige Altphasen-Suiten, 11 erneute Phase-14-Browserprüfungen und 4 Offlineprüfungen.
- Online-Datenbank Phase 14: Migration, RLS, private Ablage, sichere Spielerprojektion, Rechte und Indizes geprüft.
- Online-Datenbank Phase 15: 14 Struktur-, Rechte-, Formel- und Rückfüllprüfungen bestanden.

## Fachlich bestätigt

- Bilder können Kampagne, Figur, Wesen, Fraktion, Ort, Ereignis, Wetter, Astronomie, Spielabend und Handlungsfaden zugeordnet werden.
- Spieler erhalten nur ausdrücklich öffentliche oder freigegebene Bilddaten.
- Bildkacheln öffnen eine Großansicht und bleiben mobil bedienbar.
- Neue Kampagnen verlangen Startjahr, Jahreszeit und Tag innerhalb der 90-tägigen Jahreszeit.
- Die Beispiele Jahr 1 / Frühling / Tag 1 = Welttag 1, Jahr 2 / Sommer / Tag 10 = Welttag 460 und Jahr 3 / Winter / Tag 90 = Welttag 1080 wurden im Browser und in PostgreSQL bestätigt.
- Bestehende Kampagnen können den automatischen Altstart nur einmal und nur vor einem Zeit- oder Wetterfortschritt korrigieren.
- Schema 37 und Regelstand 15 bleiben unverändert.

## pgTAP

Die pgTAP-Dateien für Phase 14 und 15 sind vorbereitet. Das Onlineprojekt besitzt die pgTAP-Erweiterung nicht; deshalb wurden die entsprechenden Produktionsprüfungen als rein lesende native PostgreSQL-Abfragen ausgeführt. Es wurden keine Testdaten dauerhaft angelegt.

## Beraterhinweise

Die Supabase-Berater melden für die neuen RPCs die erwartbare allgemeine Warnung zu bewusst aufrufbaren `SECURITY DEFINER`-Funktionen. Beide Funktionen prüfen Anmeldung und konkrete Welt-/Kampagnenberechtigung intern. Neue Indizes werden erwartungsgemäß noch als unbenutzt gemeldet, solange die neuen Tabellen beziehungsweise Felder kaum Produktivdaten besitzen.
