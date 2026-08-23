# Eberos Charakter-Builder v1.7.4

- 95 Gegenstände aus der Anfänger-Itemdatenbank v1.2 offline eingebunden
- Gegenstände um Gewicht, Anzahl, Beladungsstatus, Mindeststärke und Lagerort erweitert
- neue universelle Karte „Gewicht & Tragekapazität“
- Tragekapazität: `(wirksame ST + wirksame KS) × 10 kg`
- Rationen werden mit 0,2 kg je aktueller Ration eingerechnet
- je angefangene 10 kg Übergewicht: −1 auf alle Grundwerte
- erreicht KS durch Belastung 0, sind Bewegung, Rennen und Springen 0
- Mindeststärken gleichzeitig ausgerüsteter Gegenstände werden addiert
- alte Ausrüstungsdaten werden verlustarm auf Schema 12 migriert
- PWA-Cache, Manifest und Offlinekatalog auf v1.7.4 aktualisiert
- genau ein aufrechtes Designornament vollständig zentriert und vergrößert dargestellt
- eigene und katalogbasierte Waffen, Munition und Rüstungen erhalten editierbare Regelwerte
- alle 95 Handbuchgegenstände werden in 14 vollständigen Katalogtabellen angeboten
- eigene Items erhalten Material, Qualität, Zustand, Herkunft, Eigentümer, Rechtsstatus und freie Notizen
- interne Kategorie-IDs werden in allen Gegenstandsformularen als verständliche deutsche Bezeichnungen dargestellt
- Schadens- und Schutzwerte erscheinen direkt an Katalog- und Ausrüstungseinträgen
- neue Karte „Kampfwerte & Rüstung“ summiert ausgerüstete Rüstungsteile und Schutz je Körperzone pro Reiter
# Revision r12

- Gegenstandskarten sind nun kompakt und zeigen nur zur jeweiligen Kategorie passende Regelwerte.
- Nahkampfwaffen blenden Munition und Nachladen aus; Fernkampfwaffen behalten beide Felder.
- Verwaltungsdaten liegen gesammelt und eingeklappt unter „Weitere Angaben“.
- Technische Kategoriekennungen werden nicht mehr als sichtbare Bezeichnungen verwendet.
- „Freie Notizen“ erscheint nur noch einmal je Gegenstand.
- Die Karte „Kampfwerte & Rüstung“ wird einmalig auch in bereits migrierten Reitern repariert.
- Ausgerüstete Rüstung wird als Rohschutzsumme, Blockbonus, Gewicht und Schutz je Körperzone ausgewertet.
- Cache-Revision auf `eberos-pwa-v1.7.4-r12` erhöht.
# Revision r13

- Fähigkeitenkatalog von 75 auf 79 eindeutige Einträge erweitert.
- Meditation, Konzentration, Strategie und Monsterkunde ergänzt.
- Die bisherigen Fähigkeits-IDs `skill_0` bis `skill_74` bleiben unverändert.
- Neue Fähigkeiten verwenden dauerhafte semantische IDs und werden verlustfrei in bestehende Spielstände migriert.
- Alle Fähigkeiten zeigen vollständige, aufklappbare Beschreibungen.
- Herrschaft verwendet einheitlich den Countercode `HS`.
- Cache-Revision auf `eberos-pwa-v1.7.4-r13` erhöht.
# Revision r14

- Scrollposition bleibt bei Neuberechnungen und Kartenaktualisierungen erhalten.
- Die aktuell sichtbare Karte bleibt an derselben Position im Browserfenster verankert.
- Fokus und Textauswahl aktiver Eingabefelder werden nach dem Neuaufbau wiederhergestellt.
- Geöffnete Detailbereiche und interne Tabellenpositionen bleiben erhalten.
- Cache-Revision auf `eberos-pwa-v1.7.4-r14` erhöht.
# Revision r15

- Neuer Druckdialog mit Kompaktbogen, Standarddokument, ausführlichem Dossier und Tabellenformat.
- A4 Hoch- und Querformat sowie farbige und tintensparende Ausgabe auswählbar.
- Alle befüllten NPC-, Vertrauten-, Besitz- und benutzerdefinierten Reiter werden gemeinsam ausgegeben.
- Vollständig leere Zusatzreiter und inhaltlich leere Karten werden automatisch ausgelassen.
- Die vollständige Liste aller 79 Fähigkeiten wird unabhängig von Suche, Filter und Scrollposition gedruckt.
- Fähigkeitenbeschreibungen können als eigener Anhang ausgegeben werden.
- Bilder, Budgetübersicht und Inhaltsverzeichnis sind separat ein- und ausschaltbar.
- Druck- und PDF-Schaltfläche verwenden dasselbe zentrale Druckmodell.
- Bildschirmreiter, Fokus und Scrollposition bleiben nach dem Drucken unverändert.
- Cache-Revision auf `eberos-pwa-v1.7.4-r15` erhöht.
