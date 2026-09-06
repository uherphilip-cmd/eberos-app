# Eberos Charakter-Builder v1.7.10

## Aktive Effekte

- Der Effekteditor ist in Effekt, Dauer und Wirkungen gegliedert und zeigt vor dem Speichern eine Klartextvorschau.
- Fähigkeitsmodifikatoren können alle Fähigkeiten, eine Kategorie, eine einzelne Fähigkeit oder Fähigkeiten mit einem Grundwert erfassen.
- Bonus und Malus werden getrennt gewählt; die Höhe bleibt eine positive Eingabe.
- Situative Alttexte bleiben beschreibende Hinweise und werden nicht ungeprüft auf alle Fähigkeiten angewendet.
- Intervall wurde aus dauerhaften Wirkungen entfernt. Eine Auslösung erscheint ausschließlich bei Änderungen des aktuellen Counterstands.
- Kampfrunden, Rast, Lagerrast sowie 10 Minuten, Stunde, Tag und Szenenende verwenden dieselbe Effektzeitrechnung.
- Die aktive Liste ist kompakt; der Katalog mit 227 Vorlagen öffnet sich nur über „Effekt hinzufügen“.
- Quellenverwaltete Effekte sind im Effektfenster lesbar und werden an ihrer Quelle bearbeitet.

## Kompatibilität

- Automatische Rohsicherung vor der Migration auf Schema 19.
- Migration ist idempotent und erhält Effekt-IDs, Quellen, Notizen, Aktivstatus, Dauern, Fortschritte und alte Stapelungsdaten.
- Bestehende Intervalle aktueller Counter werden in Auslösungen übertragen; wirkungslose Intervalle anderer Module werden nur als Altdaten bewahrt.
- Gekaufte Stufen, CBP, Counter, Items, NPCs, Kontakte und eigene Fähigkeiten bleiben unverändert.
- Die öffentliche Builder-Adresse bleibt unverändert.
