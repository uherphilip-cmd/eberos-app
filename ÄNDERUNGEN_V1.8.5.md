# Eberos v1.8.5 – Performance und ruhiger Start

- Die Hauptadresse öffnet den Builder ohne sichtbare Weiterleitungsseite.
- Der erste Offline-Dienst übernimmt die Seite ohne automatisches Neuladen.
- Ein neues Update wird erst nach dem sichtbaren Aktualisieren-Knopf aktiviert.
- Historische Laufzeitmodule führen Migrationen weiter in Reihenfolge aus, rendern und speichern aber erst am Ende einmalig.
- Die sichtbare Version bleibt während des gesamten Starts v1.8.5.
- Eine bereits wiederhergestellte Anmeldung wird nicht durch das identische INITIAL_SESSION-Ereignis doppelt aufgebaut.
- Datenbankschema 37 und Regelstand 15 bleiben unverändert.
