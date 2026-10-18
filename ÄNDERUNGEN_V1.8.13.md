# Eberos v1.8.13 – gemeinsames NPC-Fenster für Weltwesen

- Neue und vorhandene Weltwesen öffnen direkt im echten, bearbeitbaren NPC-Kartenfenster.
- Wesen und NPC-Reiter verwenden dieselben Kartenrenderer, Editoren, Layoutaktionen und Gegenstandsinstanzen.
- Weltbezug und geheime Spielleitungsdaten bleiben in einer getrennten Weltkarte.
- Ein Editor-Kontext leitet NPC-Kartenaktionen sicher an das Weltwesen statt an den lokalen Charakterentwurf.
- Bestehende Wesenwerte werden verlustschonend zu NpcSheetV1 normalisiert; unbekannte Legacy-Daten bleiben erhalten.
- Spielerfreigegebene NPC-Reiter werden als vollständiges NPC-Dokument vorbereitet.
- Supabase-Schema 38 ergänzt npc_data und hält stats während der Übergangszeit synchron.
- Regelstand 15 bleibt unverändert.
