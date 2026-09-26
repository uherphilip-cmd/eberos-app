# Audit und Balance: Items_Korrekturen_v15.mse-set

## Ergebnis

- 496 von 496 MSE-Karten wurden eingelesen und vergleichend geprüft.
- 330 Karten tragen eine Änderung aus 2026; 166 Karten den letzten Änderungsstand 2025.
- 452 Karten behalten plausible Quellwerte unverändert.
- 15 Karten erhielten einen hergeleiteten oder korrigierten Marktpreis.
- 10 Titel, Formen und Zustände sind als „Nicht käuflich“ gekennzeichnet.
- 18 echte Abschlusskarten werden automatisch bei ihrer gedruckten Set-Schwelle vergeben.
- 15 als „Vollendung“ bezeichnete Sechs-Teile-Bonusitems bleiben normal kaufbar.
- 4 klare Gewichtsfehler wurden berichtigt.
- 0 automatische Preis-/Gewichtsprüfungen bleiben offen.
- Alle Originalwerte und Bildreferenzen bleiben im Quellrecord erhalten.

## Bewertungs- und Vollendungslogik

- Währung: 100 Kupfer = 1 Silber; 100 Silber = 1 Gold.
- Fehlende Preise physischer Gegenstände wurden anhand desselben Sets, derselben Gegenstandsart, Bonusstärke und Seltenheit bewertet.
- Echte Abschlusskarten besitzen eine Set-Typzeile und eine gedruckte Schwelle wie `12/12`; sie sind nicht kaufbar und erscheinen automatisch im Inventar.
- Gezählt werden unterschiedliche normale Katalogkarten desselben Sets. Duplikate und die Abschlusskarte selbst zählen nicht.
- Eine einmal erreichte Abschlusskarte bleibt als gesammelte Freischaltung dauerhaft im Inventar.
- Items mit einem Effekt „Sechs Set-Teile“ sind keine automatischen Abschlusskarten und bleiben regulär kaufbar.
- Ränge, Gestalten und Träume ohne Abschlusskartenschwelle haben keinen regulären Marktpreis.
- Gewichte folgen Objektart und Tragbarkeit; der 30-Personen-Segler wurde als großes Schiff statt als 1,2-t-Kleinfahrzeug bewertet.
- `casting_cost` bleibt reines MSE-Quellfeld und wird nicht als CBP-Wert interpretiert.

## Verteilung

| Bereich | Anzahl |
|---|---:|
| mse.weapon | 54 |
| mse.armor | 119 |
| mse.gear | 180 |
| mse.companion | 111 |
| mse.vehicle | 5 |
| mse.property | 7 |
| mse.boon | 20 |
| **Gesamt** | **496** |

## Nachvollziehbare Entscheidungen

| Nr. | Item | Feld | Quelle | Neu | Begründung |
|---:|---|---|---:|---:|---|
| 0087 | 7. Kochbuch der Reisenden | valueCopper | 85 | 8500 | 85 Kupfer ist gegenüber Kochgeschirr und vergleichbaren Setbüchern ein Einheitenfehler; als 85 Silber bewertet. |
| 0245 | 16. Izdraguls Imp Beschwörung I. | valueCopper | — | 10000 | Beschworener kleiner Imp mit dauerhaftem +1-Besitzerbonus; Vergleich mit kleinen magischen Begleitern. |
| 0246 | 16. Izdraguls Imp Beschwörung II. | valueCopper | — | 10000 | Beschworener kleiner Imp mit dauerhaftem +1-Besitzerbonus; Vergleich mit kleinen magischen Begleitern. |
| 0029 | 2. Traum der Heroische Inspiration | weightKg | 500 | 0 | Unkörperlicher Traum; 500 kg widersprechen den übrigen Traum-/Zustandseinträgen. |
| 0029 | 2. Traum der Heroische Inspiration | tradeStatus | — | Nicht käuflich | Unkörperlicher Traum; 500 kg widersprechen den übrigen Traum-/Zustandseinträgen. |
| 0026 | 2. Tiefschlaf Wunschtraum | tradeStatus | — | Nicht käuflich | Wunschtraum und Setwirkung; kein handelbarer Gegenstand. |
| 0143 | 14. Belins Echo | valueCopper | — | 20000 | Mythisches Fokusartefakt mit +3 Illusionsmagie; Vergleich mit Belins Maske, Bericht und Zepter. |
| 0230 | 9. Geist der Qualen | tradeStatus | — | Nicht käuflich | Gebundener Geist und Setwirkung; kein handelbarer Gegenstand. |
| 0232 | 9. Geist der Schrecken | tradeStatus | — | Nicht käuflich | Gebundener Geist und Setwirkung; kein handelbarer Gegenstand. |
| 0231 | 9. Geist der Schändung | tradeStatus | — | Nicht käuflich | Gebundener Geist und Setwirkung; kein handelbarer Gegenstand. |
| 0305 | 11. Tio’s Drachengestalt | tradeStatus | — | Set-Vollendung · automatisch | Automatische Belohnung bei 12/12 unterschiedlichen normalen Karten aus Set 11. |
| 0108 | 11. Tio’s Einhornform | weightKg | 0.8 | 0 | Einmalige magische Form statt tragbarem Gegenstand. |
| 0108 | 11. Tio’s Einhornform | tradeStatus | — | Nicht käuflich | Einmalige magische Form statt tragbarem Gegenstand. |
| 0282 | 10. Jagdfalke & Kurzbogen | valueCopper | — | 12000 | Kurzbogen und Jagdfalke als Kombinationsgegenstand mit mehreren Jagd- und Wahrnehmungsboni. |
| 0277 | 10. Heltenholmer Reisekarten | valueCopper | 68 | 6800 | 68 Kupfer ist gegenüber magischen Karten desselben Sets ein Einheitenfehler; als 68 Silber bewertet. |
| 0015 | 2. Alptraum der lähmenden Angst | tradeStatus | — | Nicht käuflich | Beschworener Alptraum; kein handelbarer Gegenstand. |
| 0031 | 2. Wachtraum Horror | tradeStatus | — | Nicht käuflich | Wachtraum und Setwirkung; kein handelbarer Gegenstand. |
| 0028 | 2. Traum der Heilsame Trance | tradeStatus | — | Nicht käuflich | Traumwirkung und Setbelohnung; kein handelbarer Gegenstand. |
| 0032 | 2. Zährende Alptraum | tradeStatus | — | Nicht käuflich | Alptraumwirkung und Setbelohnung; kein handelbarer Gegenstand. |
| 0216 | 19. 🦋Kleine Fee der Heilung🦋 | valueCopper | — | 15000 | Kleine Fee mit +2 Heilrituale und +1 Heiler; über einfacher Kleinfamiliar-Bewertung. |
| 0242 | 9. Turmschild der verlorenen Seelen | valueCopper | — | 20000 | Seltener Turmschild mit zwei +2-Fähigkeitsboni; Vergleich mit Rotem Turmschild und Seelenhirtenrüstung. |
| 0303 | 7. Magischer Heißluftbaloon | tradeStatus | — | Set-Vollendung · automatisch | Automatische Belohnung bei 9/9 unterschiedlichen normalen Karten aus Set 7. |
| 0217 | 19. 🦋Kleine Fee der Magie🦋 | valueCopper | — | 12000 | Kleine Fee mit dauerhaftem +2-Fähigkeitsbonus; Vergleich mit Raben, Papageien und kleinen Phönixen. |
| 0215 | 19. 🦋Kleine Fee der Ausdauer🦋 | valueCopper | — | 12000 | Kleine Fee mit dauerhaftem +2-Fähigkeitsbonus; Vergleich mit Raben, Papageien und kleinen Phönixen. |
| 0271 | 10. Heltenholmer Cuirass | valueCopper | — | 8500 | 9-kg-Cuirass mit Verteidigungs-, Wissens- und Handwerksbonus; Vergleich mit Hexer-Cuirass und Setrüstungen. |
| 0308 | 14. Belin’s Hand | tradeStatus | — | Set-Vollendung · automatisch | Automatische Belohnung bei 10/10 unterschiedlichen normalen Karten aus Set 14. |
| 0298 | 1. Ehrung zum Hofbarden | tradeStatus | — | Set-Vollendung · automatisch | Automatische Belohnung bei 10/10 unterschiedlichen normalen Karten aus Set 1. |
| 0299 | 2. Das Tor zum Traumreich | tradeStatus | — | Set-Vollendung · automatisch | Automatische Belohnung bei 12/12 unterschiedlichen normalen Karten aus Set 2. |
| 0300 | 3. Sternwarte der Astronomen | tradeStatus | — | Set-Vollendung · automatisch | Automatische Belohnung bei 12/12 unterschiedlichen normalen Karten aus Set 3. |
| 0301 | 4. Wanderzirkus der Tänzer | tradeStatus | — | Set-Vollendung · automatisch | Automatische Belohnung bei 14/14 unterschiedlichen normalen Karten aus Set 4. |
| 0310 | 15. Avatar der Sonne | tradeStatus | — | Set-Vollendung · automatisch | Automatische Belohnung bei 11/11 unterschiedlichen normalen Karten aus Set 15. |
| 0074 | 6. Die Kosmische Balance | tradeStatus | — | Set-Vollendung · automatisch | Automatische Belohnung bei 10/10 unterschiedlichen normalen Karten aus Set 6. |
| 0302 | 5. Mitglied im Rat der Schattengilde | tradeStatus | — | Set-Vollendung · automatisch | Automatische Belohnung bei 12/12 unterschiedlichen normalen Karten aus Set 5. |
| 0312 | 9. Das Erbe des Seelenhirten | tradeStatus | — | Set-Vollendung · automatisch | Automatische Belohnung bei 13/13 unterschiedlichen normalen Karten aus Set 9. |
| 0304 | 8. Verstärkung der Seuchen-Hexer | tradeStatus | — | Set-Vollendung · automatisch | Automatische Belohnung bei 11/11 unterschiedlichen normalen Karten aus Set 8. |
| 0306 | 12. Kompass zur fliegenden Stadt | tradeStatus | — | Set-Vollendung · automatisch | Automatische Belohnung bei 9/9 unterschiedlichen normalen Karten aus Set 12. |
| 0315 | 10. Heltenholmer Berghütte | tradeStatus | — | Set-Vollendung · automatisch | Automatische Belohnung bei 13/13 unterschiedlichen normalen Karten aus Set 10. |
| 0307 | 13. Labor des Meister Alchemisten | tradeStatus | — | Set-Vollendung · automatisch | Automatische Belohnung bei 8/8 unterschiedlichen normalen Karten aus Set 13. |
| 0313 | 16. Izdragul’s Hohepriester | tradeStatus | — | Set-Vollendung · automatisch | Automatische Belohnung bei 8/8 unterschiedlichen normalen Karten aus Set 16. |
| 0309 | 17. Arkane Ressonanzraum | tradeStatus | — | Set-Vollendung · automatisch | Automatische Belohnung bei 12/12 unterschiedlichen normalen Karten aus Set 17. |
| 0316 | 18. Earthas Grünwald Golem | valueCopper | — | 80000 | 650-kg-Golem mit drei Besitzerboni; deutlich oberhalb kleiner und mittlerer Begleiter. |
| 0206 | 19. Feen Noble des Blumenhofs | valueCopper | — | 30000 | Feenadel mit zwei starken Fähigkeitsboni und Herrschaft; oberes Begleitersegment. |
| 0224 | 21. Ravella’s Fiole | weightKg | 70 | 0.7 | Die Illustration und Bezeichnung zeigen eine Fiole; 70 kg ist ein fehlendes Dezimalkomma. |
| 0165 | 21. Ravella die See-Nixe | valueCopper | — | 20000 | Magischer Begleiter mit +2 Wassermagie; Vergleich mit Ulgu, Jhulmi und anderen Setbegleitern. |
| 0314 | 20. Umseni vom Feenhof der Schatten | valueCopper | — | 20000 | Feenbegleiter mit zwei starken Fähigkeitsboni; Vergleich mit Feen-Noble und magischen Kleinfamiliaren. |
| 0311 | 21. Segler der See-Nixe | weightKg | 1200 | 80000 | Ein Segler mit 30 Personen Besatzung liegt plausibel bei rund 80 t; als großes Schiff bewertet. |
| 0311 | 21. Segler der See-Nixe | tradeStatus | — | Set-Vollendung · automatisch | Automatische Belohnung bei 12/12 unterschiedlichen normalen Karten aus Set 21. |

## Automatische Restprüfung

Keine formalen Auffälligkeiten.

## Kartenbilder

Der Build erzeugt aus allen 496 MSE-Illustrationen optimierte JPEG-Dateien. Der Builder zeigt Vorschaubilder und eine vollständige Kartenansicht; die Bilder werden erst beim Anzeigen geladen und danach vom Offline-Cache gespeichert.
