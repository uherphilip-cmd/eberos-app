# Eberos v1.8.2 – Leistungsbericht

Stand: 18. Oktober 2026

## Ausgangsmessung

- bisher beim Service-Worker-Install vorgemerkt: 123 Dateien, 25,37 MiB
- darin JavaScript: 6,55 MiB
- darin Bilder: 12,35 MiB
- Suchindex: vor v1.8.2 bei jedem Eingabeereignis vollständig neu erzeugt

## v1.8.2

- sofortiger Kerncache: 8 Dateien, 0.53 MiB
- Anwendungsskripte werden erst nach dem sichtbaren Seitenstart und während einer Leerlaufphase schrittweise offline gesichert: 34 Dateien, 6.49 MiB
- große Hintergrundbilder, Ornamente, doppelte JSON-Kataloge und nicht verwendete Schriftdateien werden nicht mehr beim Installieren vorab geladen
- der Suchindex wird wiederverwendet und nach Speichern, Figurenwechsel oder Neuzeichnen kontrolliert verworfen
- Suchanfragen werden um 110 Millisekunden gebündelt
- außerhalb des Sichtbereichs liegende Charakterkarten nutzen auf Desktop-Browsern verzögertes Rendering
- der Anwendungskern wurde mit 43 Cache-Einträgen und einem vollständigen Browser-Neustart bei abgeschaltetem Netzwerk geprüft

## Unverändert

- Open Play bleibt lokal nutzbar.
- Kampagnen- und Spielleitungsmodule werden weiterhin erst beim Öffnen geladen.
- Der Offlinecache ergänzt tatsächlich verwendete Ressourcen automatisch.
