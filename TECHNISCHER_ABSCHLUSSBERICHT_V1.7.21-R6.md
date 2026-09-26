# Technischer Abschlussbericht v1.7.21-r6

## Verknüpfungsmodell

Inventarinstanzen speichern `linkedMseAuxId` und `mseCompanionLinkV16`. Der Zusatzreiter speichert in `sourceMseItemV16` die Katalog-ID, Quellhash, Kartennummer, Inventarbesitzer-ID und die Liste der verbundenen Instanz-IDs. Dadurch ist die Beziehung Bestandteil des normalen JSON-Vollbackups.

## Erkennung und Reitertypen

Automatisch verarbeitet werden ausschließlich die 78 MSE-Einträge mit `assetKind: companion` und einer ausdrücklichen Typzeile „Begleiter“ oder „Reittier“. Ausrüstung, Segen und Traumzustände mit ähnlichen Begriffen erzeugen keinen Reiter. Reitnamen, die explizite Reittier-Typzeile und der gedruckte Bonus „Reiten & Tierführung“ bestimmen den Reittiertyp; klar personenartige Karten werden NPC-Begleiter, alle übrigen Vertraute.

## Werteprofile

NPC-Begleiter, Vertraute und Reittiere erhalten getrennte Ausgangsprofile. Hund/Wolf, Bär, Golem, kleine Flugwesen, Katzen und Spürtiere besitzen zusätzliche artgerechte Anpassungen. Gedruckte Fähigkeitsbezüge werden als editierbare thematische Startwerte mit erklärender Notiz übernommen. Der gedruckte Besitzerbonus selbst bleibt als Kartentext nachvollziehbar.

## Duplikate und Wiederherstellung

Die Synchronisierung gruppiert pro Charakter nach stabiler MSE-Katalog-ID. Mehrere vorhandene Inventarinstanzen zeigen auf denselben Reiter. Ein verwaister Reiter wird nicht gelöscht, sondern als „Inventarkarte fehlt“ erhalten und bei einer späteren passenden Karte wieder verbunden. Import und Laden führen dieselbe idempotente Reparatur aus.

## Version

- Sichtbare Revision: v1.7.21-r6
- MSE-Datenstand: 15.2.0-completions
- Automatisch verknüpfbare Karten: 78
- Gesamte MSE-Karten: 496
- Schema: 27 (additiv kompatible Felder)
- Regelstand: 13
- Offline-Cache: 1.7.21-r6.1
