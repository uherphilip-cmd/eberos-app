# Änderungen in Eberos v1.7.5

## Schicksalspfade und Mehrfachsynergien

- Mana, Glaube, Herrschaft und Finsternis werden als vier getrennte Schicksalspfade verwaltet.
- Der bisherige Einzelpfad wird beim ersten Start automatisch und verlustfrei in das neue Schema 13 übernommen.
- Zwei geöffnete Pfade bilden ab Stufe 5 eine Verknüpfung.
- Drei geöffnete Pfade bilden ab Stufe 10 eine Konvergenz.
- Vier geöffnete Pfade bilden ab Stufe 15 einen Schicksalsknoten.
- Die Synergiestufe entspricht immer dem niedrigsten beteiligten Pfad.
- Unterhalb einer Schwelle bleiben Kombinationen als freie Darstellung beziehungsweise Entwurf speicherbar.
- Jede Synergie besitzt genau einen Primärpfad, einen Kosten-Counter und eine Hauptwirkung.
- Nebenpfade verändern die Hauptwirkung und erzeugen keine kostenlosen zusätzlichen Einzeltechniken.

## Oberfläche und Ausgabe

- Neue Vier-Pfade-Übersicht mit Stufen, Öffnungsstatus und getrennten Pfadangaben.
- Neues Synergiefenster mit Pfadauswahl, Primärpfad, Beiträgen der Nebenpfade, Grenze und Preis.
- Dreifach- und Vierfachkombinationen bieten redaktionelle Inspirationen ohne erfundene Zahlenwerte.
- Abschlussprüfung unterscheidet strukturelle Fehler, noch nicht freigeschaltete Entwürfe und regelkonforme Synergien.
- Druck und PDF geben ausgefüllte Pfade sowie alle gespeicherten Synergien aus.
- Charaktere, NPCs und Vertraute führen ihre Pfade und Synergien getrennt.
- Mobilansicht für 390 Pixel Breite ergänzt.

## Technik

- App-Version `1.7.5`, Datenschema `13`, Regelstand `4`.
- Neuer Offline-Cache `eberos-pwa-v1.7.5-r9`.
- Migration und Normalisierung sind idempotent; alte JSON-Exporte bleiben importierbar.

## Paketrevision 2: strukturierte Startpakete

- Alle elf Startpakete besitzen eigene Tabellen mit Kategorie, Anzahl, Gewicht, Mindeststärke, Regelwerten und Kupferwert.
- 71 Paketzeilen und 22 echte Auswahlzeilen ersetzen die bisherigen unbestimmten Freitexteinträge.
- Vorhandene Kataloggegenstände übernehmen automatisch ihre vollständigen Waffen-, Rüstungs- und Ausrüstungswerte.
- Pakettypische Kleidung, Insignien, religiöse Gegenstände und Berufswerkzeuge sind mit festen Kategorien und Werten definiert.
- Fernkampfsets erzeugen immer die passende Munition.
- Wappenrecht, Reittier und Bediensteter werden als Rechte beziehungsweise Begleiter geführt und nicht länger als tragbare Ausrüstung gewogen.
- Die Auswahl eines Pakets erzeugt keine zusätzlichen Gegenstands-CBP; der Paketpreis bleibt der alleinige CBP-Abzug.
- Bestehende Paketgegenstände werden beim ersten Start automatisch migriert; davor legt der Builder eine lokale Sicherung an.
- Startpaket-Tabellen und gewählte Alternativen erscheinen auch in Druck und PDF.

## Paketrevision 3: Items aus Kategorien wählen

- Jede materielle Paketposition besitzt im aktiven Startpaket eine Itemauswahl.
- Die Auswahl enthält die vorhandenen Katalog-Items der jeweiligen Kategorie und übernimmt deren vollständige Werte.
- Kategorien mit paketdefinierten Sondergegenständen bieten die passenden Sondereinträge ebenfalls als Auswahl an.
- Kategorienübergreifende Vorgaben wie „Nebenwaffe oder Schild“ behalten zuerst ihre Typauswahl und zeigen danach die jeweilige Itemliste.
- Fernkampfwaffen zeigen ausschließlich kompatible Munition; ein Waffenwechsel aktualisiert die Munition automatisch.
- Bereits gewählte Startpakete werden automatisch auf die neue Auswahlstruktur migriert und vorher lokal gesichert.

## Revision 4: Rüstungs-Gesamtwert und NPC-Reparatur

- `Rüstung` zeigt die Summe der Schutzwerte aller aktiven, tatsächlich ausgerüsteten Rüstungen und Schilde als einen Komplettwert.
- Getragene, eingelagerte oder deaktivierte Rüstung zählt nicht; der Blockbonus bleibt getrennt.
- Der Rüstungswert erscheint in den abgeleiteten Werten sowie hervorgehoben in „Kampfwerte & Rüstung“ und damit auch in Druck und PDF.
- Bestehende NPCs und Vertraute erhalten fehlende Karten für Schicksalspfade und Synergien, abgeleitete Werte, Kampfwerte und Rüstung sowie Gewicht und Tragekapazität.
- Neue NPCs und Vertraute enthalten diese Karten automatisch; die Reparatur ist idempotent und legt vor der ersten Anwendung eine lokale Sicherung an.

## Revision 5: flexible Machtbereiche und Bedienung

- Fähigkeiten lassen sich per Hoch-/Runter-Buttons frei anordnen; die Reihenfolge bleibt in Speicherung, JSON-Export, Import und Druck erhalten.
- Grundwerte und Counter einer Fähigkeit werden nach zwei Sekunden Hover oder per Klick/Touch in einer Regel-Infobox erklärt.
- Die fünf Machtbereiche „Magie & Mana“, „Glaube & Schöpfung“, „Finsternis & Zerstörung“, „Herrschaft & Ruhm“ und „Glück & Schicksal“ besitzen je drei auswählbare Ausrichtungen.
- Fortschrittsfelder der Machtbereiche sind frei benennbar, sortierbar, löschbar und ergänzbar; alte Rang- und Technikfelder werden verlustfrei übernommen.
- Counter-Maximum und aktueller Stand können unabhängig bis 0 gesetzt werden. Der aktuelle Stand wird automatisch auf das Maximum begrenzt.
- Alle sichtbaren Vorkommen der früheren Bezeichnung „Armor“ werden als „Rüstung“ ausgegeben.
- Fehlende NPC- und Vertrautenkarten aus Revision 4 werden weiterhin automatisch und idempotent repariert.

## Revision 6: NPC-Stufen verständlich erklärt

- Die bisher missverständliche freie Angabe „Stufe / Rang“ heißt jetzt „Eigenstufe / Rang · nur Notiz (0 CBP)“.
- Die kostenrelevante Auswahl heißt eindeutig „NPC-Stufe · CBP-Grundwert“.
- Jede NPC-Stufe zeigt direkt ihren Handbuch-Grundwert in CBP, die zugehörige Regelwirkung, den gesamten Vergleichswert und den tatsächlichen Charakterabzug.
- Die Erklärung berücksichtigt, ob als Kostenquelle Spielerhandbuch, manuelle Kosten oder eine Berechnung aus den eigenen NPC-Werten gewählt wurde.

## Revision 7: NPC-Kosten in der Charaktererschaffung

- Neue NPCs und Vertraute werden standardmäßig mit „Vom Charakterbudget bezahlen“ und der Kostenquelle „Spielerhandbuch“ angelegt.
- Damit zieht eine NPC-Stufe automatisch denselben Betrag in CBP vom Charakterbudget ab: Stufe 5 entspricht beispielsweise 5 ausgegebenen CBP.
- Die Kostenübersicht weist den enthaltenen Anteil als „Davon NPCs & Vertraute“ gesondert aus; Gesamtausgaben und Restbudget werden unmittelbar aktualisiert.
- Bestehende Einträge mit dem früheren unberührten Standard „Kostenlos/Manuell/0 CBP“ werden auf die automatische Charakterabrechnung migriert und vorher lokal gesichert.
- Bewusst gewählte Sonderfälle „Kostenlos“, „Eigenes Budget“, „Nur dokumentieren“, manuelle Kosten und berechnete Kosten bleiben weiterhin verfügbar.

## Revision 8: Counter-Bedienung und Regelhinweise

- Jeder Counter besitzt wieder klar sichtbare Minus- und Plus-Schaltflächen für Maximum beziehungsweise Stufe.
- Maximum und aktueller Vorrat lassen sich weiterhin auch direkt als Zahl eingeben und werden sofort gespeichert.
- Counter- und Grundwertzeilen verwenden ein eigenes responsives Raster, sodass Infobuttons keine Eingabefelder mehr verdrängen.
- Regelhinweise besitzen einen deckenden Themenhintergrund und blockieren darunterliegende Bedienelemente nicht.
- Beim Bearbeiten eines Zahlenfelds öffnet die Hover-Hilfe nicht mehr über der Eingabe.

## Revision 9: erweiterter Itemkatalog

- Die 148 gelieferten Tabellenzeilen wurden verlustfrei in 145 kanonische Waffen-, Rüstungs- und Schilddatensätze überführt.
- Wurfaxt, Franziska und Wurfspeer erscheinen in allen passenden Gruppen, existieren aber jeweils nur einmal im Katalog.
- Zusammen mit dem kompatiblen Altbestand enthält die App jetzt 203 eindeutige Gegenstände; vorhandene Katalog-IDs und gespeicherte Iteminstanzen bleiben gültig.
- Schaden, Reichweite, Ausdauerkosten, Mindeststärke, Ladeaktionen, Schutz, Block, Gewicht und Preise wurden exakt übernommen. Preise werden intern in Kupfer und sichtbar wieder als Kupfer/Silber ausgegeben.
- Neue Waffen ohne autorisierte Gewichtsangabe werden ausdrücklich als „Gewicht unbekannt“ markiert; es wurden keine Gewichte, Hände oder Fertigkeitswerte erfunden.
- Die vollständige Itemliste ist standardmäßig eingeklappt und enthält Suche sowie Filter nach Alias, Itemart, Kategorie, Quellgruppe, Unterkategorie, Körperbereich, Einsatzart, Mindeststärke, Schaden, Schutz und Preis.
- Such- und Filterzustand sowie der Aufklappzustand bleiben beim Hinzufügen und bei normalen Neudarstellungen erhalten; zugeordnete Ausrüstung bleibt beim Einklappen sichtbar.
- Der Offline-Cache und alle Startlinks verwenden Revision `r9` und laden den kanonischen Katalog `1.3.0`.
