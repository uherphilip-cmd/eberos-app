# Phase 14 – Abschluss v1.8.3

Stand: 18. Oktober 2026

## Ergebnis

Die vorhandene private Medienablage wurde auf alle dauerhaften Spielleiterobjekte erweitert. Zuordnung und Spielerfreigabe bleiben getrennte bewusste Aktionen. Miniaturansichten sind anklickbar; die Großansicht bleibt tastatur- und mobilgeeignet.

## Sicherheit

- keine Binärdaten in PostgreSQL
- kein öffentlicher Speicherbucket
- kein Service-Schlüssel im Browser
- RLS und serverseitige Zielprüfung für jede Zuordnung
- Spieler-RPC ohne interne Zielbezeichnungen oder Objekt-IDs
- Realtime-Signal enthält nur die Bild-ID

## Abgrenzung

Der frei einstellbare Kampagnenstart gehört zu Phase 15 und ist nicht Bestandteil dieses Builds.
