# Technischer Abschlussbericht v1.7.21-r5

## Erkennung

Echte Abschlusskarten werden ausschließlich durch die Kombination aus einer Set-Typzeile und einer identischen Zählschwelle wie `12/12` erkannt. Das ergibt 18 Abschlusskarten. Die 15 kaufbaren Sechs-Teile-Bonusitems werden nicht als automatische Belohnungen behandelt.

## Inventarlogik

Pro Besitzer werden unterschiedliche MSE-Katalog-IDs desselben Sets gezählt. Mengen über eins, die Abschlusskarte selbst und Karten anderer Sets zählen nicht. Beim Hinzufügen, Ändern der Menge, Importieren und Laden wird synchronisiert. Erreichte Abschlusskarten erscheinen genau einmal und bleiben danach dauerhaft als gesammelte Freischaltung erhalten.

## Kompatibilität

Vorhandene MSE-Instanzen werden nur bei passendem Quellhash auf v15.2 migriert. Bereits vorhandene Abschlusskarten gelten als historische Freischaltungen. Der 203er Handbuchkatalog, Schema 27, Regelstand 13 und das JSON-Vollbackup bleiben kompatibel.

## Version

- Sichtbare Revision: v1.7.21-r5
- MSE-Datenstand: 15.2.0-completions
- Abschlusskarten: 18
- Kaufbare Sechs-Teile-Bonusitems: 15
- Kartengrafiken: 496 / 17.2 MiB
- Offline-Cache: 1.7.21-r5.1
