# Migrationsbericht v1.7.11

- Vor der ersten r2-Migration wird der vollständige Rohstand lokal unter backup.pre-v1711 gesichert.
- Alte Ziele, Bindungen, Questkarten und die in r1 zusammengeführten Ziel-/Questdaten werden als vollständige JSON-Blöcke in Charakternotizen übernommen.
- Erst nach erfolgreicher Übernahme werden die alten Datenfelder und Karten entfernt.
- Leere Standardkarten erzeugen keine unnötigen Notizblöcke.
- Erweiterungstext wird in normale Textblöcke umgewandelt; Erweiterungsmetadaten werden danach entfernt.
- Doppelte einmalige Karten werden auf eine Darstellung reduziert; eigene Karteninhalte werden vorher in Charakternotizen gesichert.
- Vorteile, CBP, Counter, Items, Kontakte, NPCs, eigene Fähigkeiten und aktive Effekte bleiben erhalten.
- Die Migration ist durch v1711NotesCleanupDone idempotent.
