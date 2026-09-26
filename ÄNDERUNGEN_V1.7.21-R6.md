# Änderungen v1.7.21-r6

- 78 ausdrücklich als Begleiter oder Reittier gekennzeichnete MSE-Karten erzeugen beim Hinzufügen automatisch einen eigenen Werte-Reiter.
- Tiere und magische Wesen werden als Begleiter, reitbare Wesen als Reittier und personenartige Gefährten als NPC-Begleiter angelegt.
- Jeder erzeugte Reiter besitzt eigene Grundwerte, Counter, Fähigkeiten, abgeleitete Werte, Rüstung und Belastung.
- Artgerechte Vergleichsprofile liefern sofort spielbare Ausgangswerte; alle Werte bleiben frei editierbar.
- Inventarkarte und Reiter speichern gegenseitige stabile Kennungen, Katalog-ID, Kartenquelle und alle zugehörigen Inventarinstanzen.
- Dieselbe Begleiterkarte erzeugt auch bei wiederholter Synchronisierung oder vorhandenen Duplikaten höchstens einen Werte-Reiter.
- Wird eine Inventarkarte entfernt, bleibt der ausgearbeitete Reiter erhalten und wird beim erneuten Hinzufügen automatisch wieder verknüpft.
- JSON-Vollbackup, Import und bestehende Spielstände erhalten beziehungsweise reparieren die Verknüpfung automatisch.
- Ein eigener manueller Reitertyp „Reittier“ steht zusätzlich im Dialog „Neuen Reiter anlegen“ zur Verfügung.
- Set-Vollendung, Preis-/Gewichtsbalance und alle 496 Kartenbilder aus r5 bleiben unverändert.
