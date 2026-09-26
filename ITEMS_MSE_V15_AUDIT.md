# Audit und Balance: Items_Korrekturen_v15.mse-set

## Ergebnis

- 496 von 496 Set-Gegenstandskarten wurden eingelesen und vergleichend geprüft.
- 330 Karten tragen eine Änderung aus 2026; 166 Karten den letzten Änderungsstand 2025.
- 468 Marktgegenstände wurden mit dem einheitlichen Wertpunktesystem mse-value-v1 neu berechnet.
- 464 davon unterscheiden sich preislich von der Quelle; 4 landen rechnerisch beim bisherigen Preis.
- 10 Titel, Formen und Zustände sind als „Nicht käuflich“ gekennzeichnet.
- 18 echte Abschlusskarten werden automatisch bei ihrer gedruckten Set-Schwelle vergeben.
- 15 als „Vollendung“ bezeichnete Sechs-Teile-Bonusitems bleiben normal kaufbar und werden nach Wirkung bepreist.
- 4 klare Gewichtsfehler wurden berichtigt.
- 0 automatische Preis-/Gewichtsprüfungen bleiben offen.
- Alle Originalwerte und Bildreferenzen bleiben im Quellrecord erhalten.

## Wertpunktesystem

- Währung: 100 Kupfer = 1 Silber; 100 Silber = 1 Gold. Ein Wertpunkt entspricht 5 Silber.
- Die Grundpunkte folgen der Kategorie: Ausrüstung, Waffe, Rüstung, Begleiter/Reittier, Fahrzeug oder Besitz/Ort.
- Hinzu kommen Punkte für Schaden, Schutz, Fähigkeiten, Counter, Grundwerte, Resistenzen und besondere Effekte.
- Bedingte Set-Boni werden geringer gewichtet als dauerhafte Verstärkungen.
- Seltenheitsangaben sind reine Kartengestaltung und haben keinerlei Einfluss auf Wertpunkte oder Preis.
- Echte Abschlusskarten besitzen eine Set-Typzeile und eine gedruckte Schwelle wie `12/12`; sie sind nicht kaufbar und erscheinen automatisch im Inventar.
- Items mit einem Effekt „Sechs Set-Teile“ sind keine automatischen Abschlusskarten und bleiben regulär kaufbar.
- Ränge, Gestalten und Träume ohne Abschlusskartenschwelle haben keinen regulären Marktpreis.
- `casting_cost` bleibt reines Quellfeld und wird nicht als CBP-Wert interpretiert.

## Verteilung

| Bereich | Anzahl |
|---|---:|
| mse.weapon | 64 |
| mse.armor | 134 |
| mse.gear | 188 |
| mse.companion | 78 |
| mse.vehicle | 5 |
| mse.property | 7 |
| mse.boon | 20 |
| **Gesamt** | **496** |

## Nachvollziehbare Entscheidungen

| Nr. | Item | Feld | Quelle | Neu | Begründung |
|---:|---|---|---:|---:|---|
| 0095 | 8. Gepolsterter Hexer Cuirass | valueCopper | 5600 | 7000 | Wertemodell mse-value-v1: 14 Punkte (Rüstung; Verstärkungen 9.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0088 | 7. Kochgeschirr Tasche | valueCopper | 1900 | 3500 | Wertemodell mse-value-v1: 7 Punkte (Ausrüstung & Verstärkung; Verstärkungen 5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0087 | 7. Kochbuch der Reisenden | valueCopper | 85 | 2000 | Wertemodell mse-value-v1: 4 Punkte (Ausrüstung & Verstärkung; Verstärkungen 2). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0030 | 2. Umhang der Nacht | valueCopper | 17500 | 6000 | Wertemodell mse-value-v1: 12 Punkte (Rüstung; Verstärkungen 7.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0064 | 5. Lederkapuze der Schurken | valueCopper | 3500 | 4000 | Wertemodell mse-value-v1: 8 Punkte (Rüstung; Verstärkungen 3.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0061 | 5. Harnisch der Schurken | valueCopper | 5200 | 5000 | Wertemodell mse-value-v1: 10 Punkte (Rüstung; Verstärkungen 5.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0057 | 5. Armschienen des Schurken | valueCopper | 4200 | 6000 | Wertemodell mse-value-v1: 12 Punkte (Rüstung; Verstärkungen 7.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0278 | 10. Heltenholmer Reisepferd | valueCopper | 20000 | 10000 | Wertemodell mse-value-v1: 20 Punkte (Reittier; Verstärkungen 2). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0097 | 8. Seuchen-Hexer Handschuhe | valueCopper | 2500 | 4500 | Wertemodell mse-value-v1: 9 Punkte (Rüstung; Verstärkungen 4.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0070 | 5. Stiefel der Schurken | valueCopper | 4500 | 5500 | Wertemodell mse-value-v1: 10.5 Punkte (Rüstung; Verstärkungen 6). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0071 | 5. Trickdolch der Schurken | valueCopper | 3500 | 5500 | Wertemodell mse-value-v1: 10.5 Punkte (Waffe; Verstärkungen 5.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0094 | 8. Gepolsterte Hexer Stiefel | valueCopper | 3500 | 3000 | Wertemodell mse-value-v1: 5.5 Punkte (Rüstung; Verstärkungen 1). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0042 | 3. Turban der Astronomen | valueCopper | 5600 | 2500 | Wertemodell mse-value-v1: 4.5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 2.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0036 | 3. Kompass der Astronomen | valueCopper | 7800 | 5500 | Wertemodell mse-value-v1: 10.5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 8.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0033 | 3. Armschienen der Astronomen | valueCopper | 4800 | 6000 | Wertemodell mse-value-v1: 12 Punkte (Rüstung; Verstärkungen 7.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0041 | 3. Stiefel der Astronomen | valueCopper | 5200 | 4500 | Wertemodell mse-value-v1: 8.5 Punkte (Rüstung; Verstärkungen 4). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0016 | 2. Amulett der Nacht | valueCopper | 11300 | 5000 | Wertemodell mse-value-v1: 10 Punkte (Ausrüstung & Verstärkung; Verstärkungen 8). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0047 | 4. Gewänder der Tänzer | valueCopper | 5500 | 5000 | Wertemodell mse-value-v1: 10 Punkte (Rüstung; Verstärkungen 5.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0055 | 4. Schuhe der Tänzer | valueCopper | 3800 | 4000 | Wertemodell mse-value-v1: 8 Punkte (Rüstung; Verstärkungen 3.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0046 | 4. Fingerschmuck der Tänzer | valueCopper | 2800 | 3000 | Wertemodell mse-value-v1: 5.5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 3.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0054 | 4. Schmuck der Tänzer | valueCopper | 6900 | 3000 | Wertemodell mse-value-v1: 5.5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 3.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0117 | 12. Fliegende Rüstung | valueCopper | 20000 | 4500 | Wertemodell mse-value-v1: 8.5 Punkte (Rüstung; Verstärkungen 4). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0082 | 6. Seelenwaage des Mediums | valueCopper | 12300 | 3500 | Wertemodell mse-value-v1: 6.5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 4.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0073 | 6. Amulett des Mediums | valueCopper | 6500 | 6000 | Wertemodell mse-value-v1: 11.5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 9.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0083 | 6. Stiefel des Mediums | valueCopper | 4300 | 5500 | Wertemodell mse-value-v1: 10.5 Punkte (Rüstung; Verstärkungen 6). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0158 | 17. Galinthras Stab der arkanen Sphäre | valueCopper | 20000 | 6500 | Wertemodell mse-value-v1: 12.5 Punkte (Waffe; Verstärkungen 7.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0100 | 8. Verstärkte Seuchen-Hexerrobe | valueCopper | 14000 | 6000 | Wertemodell mse-value-v1: 11.5 Punkte (Rüstung; Verstärkungen 7). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0193 | 15. Sonnen Amulett | valueCopper | 20000 | 4500 | Wertemodell mse-value-v1: 8.5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 6.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0200 | 15. Sonnenstab | valueCopper | 26600 | 11500 | Wertemodell mse-value-v1: 23 Punkte (Waffe; Verstärkungen 18). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0147 | 14. Belin’s Robe der Täuschung | valueCopper | 15600 | 4500 | Wertemodell mse-value-v1: 9 Punkte (Rüstung; Verstärkungen 4.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0198 | 15. Sonnen Umhang | valueCopper | 30000 | 10500 | Wertemodell mse-value-v1: 21 Punkte (Rüstung; Verstärkungen 16.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0197 | 15. Sonnen Kodex | valueCopper | 12600 | 6500 | Wertemodell mse-value-v1: 12.5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 10.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0142 | 14. Belin’s Bericht der sterbenden Träume | valueCopper | 30000 | 6000 | Wertemodell mse-value-v1: 11.5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 9.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0149 | 14. Belin’s Zepter der Macht | valueCopper | 60000 | 8500 | Wertemodell mse-value-v1: 17 Punkte (Waffe; Verstärkungen 12). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0050 | 4. Klingenfächer der Tänzer | valueCopper | 4600 | 7000 | Wertemodell mse-value-v1: 14 Punkte (Waffe; Verstärkungen 9). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0099 | 8. Versilberter Eisen- Hexer-Stab | valueCopper | 6400 | 12500 | Wertemodell mse-value-v1: 24.5 Punkte (Waffe; Verstärkungen 19.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0252 | 16. Izgadrul’s Ring des Herrschers | valueCopper | 20000 | 5500 | Wertemodell mse-value-v1: 10.5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 8.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0253 | 16. Izgadrul’s Rituelle Inschrift | valueCopper | 17800 | 2000 | Wertemodell mse-value-v1: 4 Punkte (Ausrüstung & Verstärkung; Verstärkungen 2). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0249 | 16. Izgadrul’s Fetisch der Wälder | valueCopper | 30000 | 3500 | Wertemodell mse-value-v1: 6.5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 4.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0247 | 16. Izgadrul’s Amulett | valueCopper | 60000 | 5000 | Wertemodell mse-value-v1: 9.5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 7.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0248 | 16. Izgadrul’s Armband der Flammen | valueCopper | 60000 | 2000 | Wertemodell mse-value-v1: 4 Punkte (Ausrüstung & Verstärkung; Verstärkungen 2). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0245 | 16. Izdraguls Imp Beschwörung I. | valueCopper | — | 2500 | Wertemodell mse-value-v1: 5 Punkte (Kleiner Begleiter; Verstärkungen 1). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0006 | 1. Harnisch der Bardin | valueCopper | 5600 | 6000 | Wertemodell mse-value-v1: 12 Punkte (Rüstung; Verstärkungen 7.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0011 | 1. Stiefel der Bardin | valueCopper | 4200 | 5000 | Wertemodell mse-value-v1: 9.5 Punkte (Rüstung; Verstärkungen 5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0013 | 1. Warme Wams der Bardin | valueCopper | 3700 | 6500 | Wertemodell mse-value-v1: 12.5 Punkte (Rüstung; Verstärkungen 8). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0001 | 1. Geschichten der Barden | valueCopper | 3400 | 4500 | Wertemodell mse-value-v1: 8.5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 6.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0160 | 17. Galinthras Umhang | valueCopper | 12300 | 8000 | Wertemodell mse-value-v1: 15.5 Punkte (Rüstung; Verstärkungen 11). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0155 | 17. Galinthras Kampfrobe | valueCopper | 25400 | 5000 | Wertemodell mse-value-v1: 9.5 Punkte (Rüstung; Verstärkungen 5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0161 | 17. Kodex der Inneren Flamme | valueCopper | 12500 | 6000 | Wertemodell mse-value-v1: 12 Punkte (Ausrüstung & Verstärkung; Verstärkungen 10). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0159 | 17. Galinthras Stiefel | valueCopper | 3800 | 3500 | Wertemodell mse-value-v1: 7 Punkte (Rüstung; Verstärkungen 2.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0020 | 2. Mondsense der Oreinonauten | valueCopper | 12300 | 8500 | Wertemodell mse-value-v1: 16.5 Punkte (Waffe; Verstärkungen 11.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0039 | 3. Rüstung der Astronomen | valueCopper | 6600 | 5500 | Wertemodell mse-value-v1: 11 Punkte (Rüstung; Verstärkungen 6.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0027 | 2. Tränen der Nacht | valueCopper | 15400 | 5500 | Wertemodell mse-value-v1: 10.5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 8.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0040 | 3. Stab der Astronomen | valueCopper | 8700 | 6000 | Wertemodell mse-value-v1: 12 Punkte (Waffe; Verstärkungen 7). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0043 | 3. Umhang des Astronomen | valueCopper | 9600 | 5000 | Wertemodell mse-value-v1: 9.5 Punkte (Rüstung; Verstärkungen 5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0022 | 2. Rüstung der Nacht | valueCopper | 10000 | 6000 | Wertemodell mse-value-v1: 11.5 Punkte (Rüstung; Verstärkungen 7). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0018 | 2. Handschuhe der Nacht | valueCopper | 4000 | 3500 | Wertemodell mse-value-v1: 7 Punkte (Rüstung; Verstärkungen 2.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0063 | 5. Kurzbogen der Schurken | valueCopper | 4600 | 6500 | Wertemodell mse-value-v1: 13 Punkte (Waffe; Verstärkungen 8). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0008 | 1. Laute der Barden | valueCopper | 12600 | 5000 | Wertemodell mse-value-v1: 10 Punkte (Ausrüstung & Verstärkung; Verstärkungen 8). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0080 | 6. Ring des Mediums | valueCopper | 6700 | 3500 | Wertemodell mse-value-v1: 6.5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 4.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0148 | 14. Belin’s Zauberhut des Schutzes | valueCopper | 13400 | 3500 | Wertemodell mse-value-v1: 6.5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 4.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0141 | 14. Belin’s Anhänger | valueCopper | 20000 | 3500 | Wertemodell mse-value-v1: 6.5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 4.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0101 | 8. Verstärkter Hut der Hexer | valueCopper | 3400 | 3000 | Wertemodell mse-value-v1: 5.5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 3.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0246 | 16. Izdraguls Imp Beschwörung II. | valueCopper | — | 2500 | Wertemodell mse-value-v1: 5 Punkte (Kleiner Begleiter; Verstärkungen 1). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0029 | 2. Traum der Heroische Inspiration | weightKg | 500 | 0 | Unkörperlicher Traum; 500 kg widersprechen den übrigen Traum-/Zustandseinträgen. |
| 0029 | 2. Traum der Heroische Inspiration | tradeStatus | — | Nicht käuflich | Unkörperlicher Traum; 500 kg widersprechen den übrigen Traum-/Zustandseinträgen. |
| 0026 | 2. Tiefschlaf Wunschtraum | tradeStatus | — | Nicht käuflich | Wunschtraum und Setwirkung; kein handelbarer Gegenstand. |
| 0060 | 5. Giftkoffer der Schurken | valueCopper | 4400 | 4500 | Wertemodell mse-value-v1: 8.5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 6.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0237 | 9. Rüstung des Seelenhirten | valueCopper | 30000 | 5500 | Wertemodell mse-value-v1: 10.5 Punkte (Rüstung; Verstärkungen 6). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0243 | 9. Umhang des Seelenhirten | valueCopper | 12200 | 5000 | Wertemodell mse-value-v1: 9.5 Punkte (Rüstung; Verstärkungen 5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0238 | 9. Sense des Seelenhirten | valueCopper | 14500 | 9500 | Wertemodell mse-value-v1: 18.5 Punkte (Waffe; Verstärkungen 13.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0233 | 9. Lampe der verlorenen Seelen | valueCopper | 8900 | 3500 | Wertemodell mse-value-v1: 7 Punkte (Ausrüstung & Verstärkung; Verstärkungen 5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0244 | 9. Zauberbuch des Seelenhirten | valueCopper | 9800 | 3500 | Wertemodell mse-value-v1: 6.5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 4.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0234 | 9. Maske des Seelenhirten | valueCopper | 40000 | 7000 | Wertemodell mse-value-v1: 13.5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 11.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0291 | 18. Grünwald Umhang | valueCopper | 2300 | 7500 | Wertemodell mse-value-v1: 15 Punkte (Rüstung; Verstärkungen 10.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0297 | 18.Rankenpanzer der grünen Hexe | valueCopper | 3600 | 7500 | Wertemodell mse-value-v1: 15 Punkte (Rüstung; Verstärkungen 10.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0195 | 15. Sonnen Gewänder | valueCopper | 40000 | 9500 | Wertemodell mse-value-v1: 19 Punkte (Rüstung; Verstärkungen 14.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0273 | 10. Heltenholmer Jagdbogen | valueCopper | 2900 | 8000 | Wertemodell mse-value-v1: 16 Punkte (Waffe; Verstärkungen 11). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0288 | 18. Grünwald Harz Amulett | valueCopper | 8200 | 5000 | Wertemodell mse-value-v1: 9.5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 7.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0289 | 18. Grünwald Ring | valueCopper | 4800 | 3000 | Wertemodell mse-value-v1: 6 Punkte (Ausrüstung & Verstärkung; Verstärkungen 4). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0296 | 18.Grünwald-Feen-Harfe | valueCopper | 10000 | 4500 | Wertemodell mse-value-v1: 9 Punkte (Ausrüstung & Verstärkung; Verstärkungen 7). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0110 | 11. Tio’s goldenes Diadem | valueCopper | 20000 | 4500 | Wertemodell mse-value-v1: 8.5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 6.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0113 | 11. Umhang der vielen Formen | valueCopper | 12500 | 4000 | Wertemodell mse-value-v1: 8 Punkte (Rüstung; Verstärkungen 3.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0105 | 11. Tio’s bunter Rauch | valueCopper | 12700 | 3500 | Wertemodell mse-value-v1: 6.5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 4.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0127 | 13. Alchemisten Koffer | valueCopper | 3900 | 4500 | Wertemodell mse-value-v1: 9 Punkte (Ausrüstung & Verstärkung; Verstärkungen 7). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0138 | 13. Sichtgläser der Alchemisten | valueCopper | 3200 | 3500 | Wertemodell mse-value-v1: 6.5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 4.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0128 | 13. Gewänder der Alchemisten | valueCopper | 2400 | 6500 | Wertemodell mse-value-v1: 13 Punkte (Rüstung; Verstärkungen 8.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0131 | 13. Handschuhe der Alchemisten | valueCopper | 9000 | 4500 | Wertemodell mse-value-v1: 8.5 Punkte (Rüstung; Verstärkungen 4). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0143 | 14. Belins Echo | valueCopper | — | 2500 | Wertemodell mse-value-v1: 5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0120 | 12. Gepanzerte Federhandschuhe | valueCopper | 7900 | 4500 | Wertemodell mse-value-v1: 9 Punkte (Rüstung; Verstärkungen 4.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0123 | 12. Magischer Kriegsadler | valueCopper | 8900 | 3500 | Wertemodell mse-value-v1: 7 Punkte (Kleiner Begleiter; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0116 | 12. Federschwert | valueCopper | 8900 | 6500 | Wertemodell mse-value-v1: 12.5 Punkte (Waffe; Verstärkungen 7.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0118 | 12. Flügelhelm | valueCopper | 10200 | 5000 | Wertemodell mse-value-v1: 10 Punkte (Rüstung; Verstärkungen 5.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0114 | 11.Tio’s Schuppenpanzer-Rüstung | valueCopper | 30000 | 9000 | Wertemodell mse-value-v1: 18 Punkte (Rüstung; Verstärkungen 13.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0103 | 11. Schriftrolle aller Formen | valueCopper | 20000 | 5000 | Wertemodell mse-value-v1: 10 Punkte (Ausrüstung & Verstärkung; Verstärkungen 8). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0106 | 11. Tio’s Drachenei Sphäre | valueCopper | 10000 | 2500 | Wertemodell mse-value-v1: 5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0130 | 13. Gürteltasche der Alchemisten | valueCopper | 2500 | 3000 | Wertemodell mse-value-v1: 6 Punkte (Ausrüstung & Verstärkung; Verstärkungen 4). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0025 | 2. Sphäre der Nacht | valueCopper | 10000 | 4000 | Wertemodell mse-value-v1: 7.5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 5.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0004 | 1. Halsschmuck der Bardin | valueCopper | 6600 | 4000 | Wertemodell mse-value-v1: 7.5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 5.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0280 | 10. Heltenholmer Waldläuferrüstung | valueCopper | 7900 | 6000 | Wertemodell mse-value-v1: 11.5 Punkte (Rüstung; Verstärkungen 7). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0126 | 13. Alchemie Almanach | valueCopper | 4700 | 2500 | Wertemodell mse-value-v1: 5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0230 | 9. Geist der Qualen | tradeStatus | — | Nicht käuflich | Gebundener Geist und Setwirkung; kein handelbarer Gegenstand. |
| 0232 | 9. Geist der Schrecken | tradeStatus | — | Nicht käuflich | Gebundener Geist und Setwirkung; kein handelbarer Gegenstand. |
| 0231 | 9. Geist der Schändung | tradeStatus | — | Nicht käuflich | Gebundener Geist und Setwirkung; kein handelbarer Gegenstand. |
| 0092 | 7. Wams der Reisenden | valueCopper | 5200 | 4500 | Wertemodell mse-value-v1: 9 Punkte (Rüstung; Verstärkungen 4.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0139 | 13. Wakka & Der Reiseladen der Alchemisten | valueCopper | 30000 | 3000 | Wertemodell mse-value-v1: 5.5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 3.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0086 | 7. Karawan der Reisenden | valueCopper | 50000 | 28000 | Wertemodell mse-value-v1: 55.5 Punkte (Fahrzeug; Verstärkungen 10.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0091 | 7. Stiefel der Reisenden | valueCopper | 3500 | 4000 | Wertemodell mse-value-v1: 7.5 Punkte (Rüstung; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0012 | 1. Stiefel des Barden | valueCopper | 4200 | 5000 | Wertemodell mse-value-v1: 9.5 Punkte (Rüstung; Verstärkungen 5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0007 | 1. Harnisch des Barden | valueCopper | 5600 | 6000 | Wertemodell mse-value-v1: 12 Punkte (Rüstung; Verstärkungen 7.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0003 | 1. Halskette des Barden | valueCopper | 6600 | 4000 | Wertemodell mse-value-v1: 7.5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 5.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0014 | 1. Warme Wams des Barden | valueCopper | 3700 | 6500 | Wertemodell mse-value-v1: 12.5 Punkte (Rüstung; Verstärkungen 8). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0281 | 10. Heltenholmer-Axtschwert | valueCopper | 7200 | 8000 | Wertemodell mse-value-v1: 16 Punkte (Waffe; Verstärkungen 11). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0279 | 10. Heltenholmer Reisetasche | valueCopper | 2200 | 4500 | Wertemodell mse-value-v1: 8.5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 6.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0005 | 1. Handschuhe der Barden | valueCopper | 3700 | 5000 | Wertemodell mse-value-v1: 10 Punkte (Rüstung; Verstärkungen 5.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0066 | 5. Schurkengift: langsames Gift | valueCopper | 1500 | 6000 | Wertemodell mse-value-v1: 11.5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 9.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0151 | 15. Sonnen Panzer | valueCopper | 10900 | 6500 | Wertemodell mse-value-v1: 12.5 Punkte (Rüstung; Verstärkungen 8). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0077 | 6. Kurzschwert des Mediums | valueCopper | 7000 | 6500 | Wertemodell mse-value-v1: 12.5 Punkte (Waffe; Verstärkungen 7.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0283 | 10. Muhdok & der Heltenholmer Reisekarren | valueCopper | 6900 | 16000 | Wertemodell mse-value-v1: 32 Punkte (Fahrzeug; Verstärkungen 7). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0085 | 7. Kapuze der Reisenden | valueCopper | 2300 | 5500 | Wertemodell mse-value-v1: 10.5 Punkte (Rüstung; Verstärkungen 6). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0305 | 11. Tio’s Drachengestalt | tradeStatus | — | Set-Vollendung · automatisch | Automatische Belohnung bei 12/12 unterschiedlichen normalen Karten aus Set 11. |
| 0108 | 11. Tio’s Einhornform | weightKg | 0.8 | 0 | Einmalige magische Form statt tragbarem Gegenstand. |
| 0108 | 11. Tio’s Einhornform | tradeStatus | — | Nicht käuflich | Einmalige magische Form statt tragbarem Gegenstand. |
| 0145 | 14. Belin’s magisches Kettenschwert | valueCopper | 20000 | 8000 | Wertemodell mse-value-v1: 15.5 Punkte (Waffe; Verstärkungen 10.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0089 | 7. Lhaki der Karawanen-Wachhund | valueCopper | 100 | 5000 | Wertemodell mse-value-v1: 10 Punkte (Begleiter; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0282 | 10. Jagdfalke & Kurzbogen | valueCopper | — | 8000 | Wertemodell mse-value-v1: 15.5 Punkte (Waffe; Verstärkungen 10.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0075 | 6. Hut des Mediums | valueCopper | 4500 | 3000 | Wertemodell mse-value-v1: 6 Punkte (Ausrüstung & Verstärkung; Verstärkungen 4). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0285 | 18. Grünwald Borkenschwert | valueCopper | 6800 | 6500 | Wertemodell mse-value-v1: 13 Punkte (Waffe; Verstärkungen 8). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0294 | 18. Sigende Gründwaldbogen | valueCopper | 7200 | 7000 | Wertemodell mse-value-v1: 13.5 Punkte (Waffe; Verstärkungen 8.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0196 | 15. Sonnen Kelch | valueCopper | 14600 | 3000 | Wertemodell mse-value-v1: 5.5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 3.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0199 | 15. Sonnen-Klinge | valueCopper | 15600 | 6000 | Wertemodell mse-value-v1: 12 Punkte (Waffe; Verstärkungen 7). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0059 | 5. Folterwerkzeug der Schurken | valueCopper | 3800 | 3000 | Wertemodell mse-value-v1: 6 Punkte (Ausrüstung & Verstärkung; Verstärkungen 4). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0287 | 18. Grünwald Fluchmaske | valueCopper | 4800 | 5500 | Wertemodell mse-value-v1: 10.5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 8.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0157 | 17. Galinthra’s Schwert | valueCopper | 50000 | 6500 | Wertemodell mse-value-v1: 13 Punkte (Waffe; Verstärkungen 8). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0290 | 18. Grünwald Stab | valueCopper | 4900 | 6500 | Wertemodell mse-value-v1: 13 Punkte (Waffe; Verstärkungen 8). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0115 | 11.Tio’s Schwert | valueCopper | 40000 | 8000 | Wertemodell mse-value-v1: 16 Punkte (Waffe; Verstärkungen 11). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0144 | 14. Belin’s Handschuhe | valueCopper | 14600 | 5500 | Wertemodell mse-value-v1: 11 Punkte (Rüstung; Verstärkungen 6.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0112 | 11. Tio’s Schuppenschild | valueCopper | 14500 | 6000 | Wertemodell mse-value-v1: 11.5 Punkte (Rüstung; Verstärkungen 7). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0236 | 9. Ritualdolch des Seelenhirten | valueCopper | 7700 | 7500 | Wertemodell mse-value-v1: 15 Punkte (Waffe; Verstärkungen 10). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0104 | 11. Tio Zauberflügel | valueCopper | 17800 | 2500 | Wertemodell mse-value-v1: 5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0023 | 2. Schwert der Nacht | valueCopper | 7900 | 7000 | Wertemodell mse-value-v1: 14 Punkte (Waffe; Verstärkungen 9). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0152 | 17. Galinthra’s Dolche | valueCopper | 5900 | 5000 | Wertemodell mse-value-v1: 9.5 Punkte (Waffe; Verstärkungen 4.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0212 | 19. Lebendige Feen Mantel | valueCopper | 10000 | 4500 | Wertemodell mse-value-v1: 8.5 Punkte (Rüstung; Verstärkungen 4). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0202 | 19. Feen Blüten-Krone | valueCopper | 14500 | 6500 | Wertemodell mse-value-v1: 12.5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 10.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0201 | 19. Feen Blüten-Bogen | valueCopper | 7800 | 9500 | Wertemodell mse-value-v1: 18.5 Punkte (Waffe; Verstärkungen 13.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0207 | 19. Feen Samenkorn | valueCopper | 6800 | 3500 | Wertemodell mse-value-v1: 6.5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 4.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0203 | 19. Feen Blüten-Rapier | valueCopper | 5900 | 7000 | Wertemodell mse-value-v1: 14 Punkte (Waffe; Verstärkungen 9). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0211 | 19. Leben am Blumenhof der Feen | valueCopper | 4900 | 4000 | Wertemodell mse-value-v1: 7.5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 5.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0256 | 20. Fäulnis Schwert der dunklen Feen | valueCopper | 5600 | 7500 | Wertemodell mse-value-v1: 15 Punkte (Waffe; Verstärkungen 10). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0257 | 20. Flügel der dunklen Feen | valueCopper | 8400 | 2000 | Wertemodell mse-value-v1: 4 Punkte (Ausrüstung & Verstärkung; Verstärkungen 2). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0255 | 20. Dornenmaske der dunklen Feen | valueCopper | 3900 | 3000 | Wertemodell mse-value-v1: 6 Punkte (Ausrüstung & Verstärkung; Verstärkungen 4). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0164 | 20. Moosumhang der dunklen Feen | valueCopper | 4800 | 5000 | Wertemodell mse-value-v1: 10 Punkte (Rüstung; Verstärkungen 5.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0263 | 20. Talisman der dunklen Feen | valueCopper | 12200 | 3500 | Wertemodell mse-value-v1: 6.5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 4.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0260 | 20. Jadgbogen der dunklen Feen | valueCopper | 3800 | 5500 | Wertemodell mse-value-v1: 10.5 Punkte (Waffe; Verstärkungen 5.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0019 | 2. Maske der Nacht | valueCopper | 9900 | 4500 | Wertemodell mse-value-v1: 9 Punkte (Ausrüstung & Verstärkung; Verstärkungen 7). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0017 | 2. Berichte der Oreinonauten | valueCopper | 14500 | 4500 | Wertemodell mse-value-v1: 8.5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 6.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0205 | 19. Feen Hirtenstab | valueCopper | 7600 | 6000 | Wertemodell mse-value-v1: 12 Punkte (Waffe; Verstärkungen 7). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0262 | 20. Sphäre des dunklen Feen | valueCopper | 5200 | 2500 | Wertemodell mse-value-v1: 5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0235 | 9. Morgenstern der verlorenen Seelen | valueCopper | 5900 | 6500 | Wertemodell mse-value-v1: 13 Punkte (Waffe; Verstärkungen 8). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0035 | 3. Buch der Astronomen | valueCopper | 5800 | 3500 | Wertemodell mse-value-v1: 6.5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 4.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0052 | 4. Lieder der Tänzer | valueCopper | 1800 | 4500 | Wertemodell mse-value-v1: 8.5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 6.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0065 | 5. Schmuggelkarten der Schurken | valueCopper | 1600 | 4000 | Wertemodell mse-value-v1: 8 Punkte (Ausrüstung & Verstärkung; Verstärkungen 6). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0081 | 6. Schutzschriften des Mediums | valueCopper | 7800 | 4500 | Wertemodell mse-value-v1: 9 Punkte (Ausrüstung & Verstärkung; Verstärkungen 7). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0084 | 7. Atlas der Reisenden | valueCopper | 2700 | 3500 | Wertemodell mse-value-v1: 7 Punkte (Ausrüstung & Verstärkung; Verstärkungen 5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0102 | 8. Verstärktes Zauberbuch | valueCopper | 20000 | 5000 | Wertemodell mse-value-v1: 9.5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 7.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0154 | 17. Galinthras Handschuhe | valueCopper | 6600 | 3500 | Wertemodell mse-value-v1: 7 Punkte (Rüstung; Verstärkungen 2.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0277 | 10. Heltenholmer Reisekarten | valueCopper | 68 | 1000 | Wertemodell mse-value-v1: 2 Punkte (Ausrüstung & Verstärkung; Verstärkungen 0). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0111 | 11. Tio’s Polymorph Konpendium | valueCopper | 14500 | 3500 | Wertemodell mse-value-v1: 7 Punkte (Ausrüstung & Verstärkung; Verstärkungen 5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0124 | 12. Pegamente der fliegenden Helden | valueCopper | 7800 | 4000 | Wertemodell mse-value-v1: 7.5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 5.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0010 | 1. Poi, Papagei der Barden | valueCopper | 4300 | 3000 | Wertemodell mse-value-v1: 6 Punkte (Kleiner Begleiter; Verstärkungen 2). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0286 | 18. Grünwald Chroniken | valueCopper | 1300 | 4000 | Wertemodell mse-value-v1: 7.5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 5.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0258 | 20. Grimoire der dunklen Feen | valueCopper | 5600 | 4500 | Wertemodell mse-value-v1: 8.5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 6.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0218 | 21. Beintracht der See-Nixen | valueCopper | 1900 | 4000 | Wertemodell mse-value-v1: 8 Punkte (Rüstung; Verstärkungen 3.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0228 | 21. Umhang der See-Nixen | valueCopper | 3800 | 7000 | Wertemodell mse-value-v1: 13.5 Punkte (Rüstung; Verstärkungen 9). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0220 | 21. Kurzschwert der See-Nixen | valueCopper | 3900 | 5500 | Wertemodell mse-value-v1: 10.5 Punkte (Waffe; Verstärkungen 5.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0223 | 21. Ouhn, Hippocamp der See-Nixen | valueCopper | 25000 | 10500 | Wertemodell mse-value-v1: 21 Punkte (Reittier; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0222 | 21. Ohringe der See-Nixen | valueCopper | 4500 | 2000 | Wertemodell mse-value-v1: 4 Punkte (Ausrüstung & Verstärkung; Verstärkungen 2). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0221 | 21. Lieder der See-Nixen | valueCopper | 4700 | 4000 | Wertemodell mse-value-v1: 7.5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 5.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0219 | 21. Dreizack der See-Nixen | valueCopper | 4100 | 6000 | Wertemodell mse-value-v1: 11.5 Punkte (Waffe; Verstärkungen 6.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0227 | 21. Szepter der See-Nixen | valueCopper | 9800 | 5000 | Wertemodell mse-value-v1: 9.5 Punkte (Waffe; Verstärkungen 4.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0209 | 19. Feen-Maske der wilden Triebe | valueCopper | 10500 | 3500 | Wertemodell mse-value-v1: 6.5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 4.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0214 | 19. Scilanthia das tänzelnde Licht | valueCopper | 40000 | 3000 | Wertemodell mse-value-v1: 6 Punkte (Kleiner Begleiter; Verstärkungen 2). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0191 | 15. Brelathyn das Sonnen Einhorn | valueCopper | 60000 | 11000 | Wertemodell mse-value-v1: 22 Punkte (Reittier; Verstärkungen 4). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0122 | 12. Ikar, Pegasus der fliegenden Helden | valueCopper | 40000 | 10500 | Wertemodell mse-value-v1: 21 Punkte (Reittier; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0272 | 10. Heltenholmer Hut | valueCopper | 1300 | 4000 | Wertemodell mse-value-v1: 8 Punkte (Ausrüstung & Verstärkung; Verstärkungen 6). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0056 | 4. Tanzbär der Tänzer | valueCopper | 7600 | 11000 | Wertemodell mse-value-v1: 22 Punkte (Reittier; Verstärkungen 4). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0098 | 8. Tasche der Seuchen-Hexer | valueCopper | 3400 | 2500 | Wertemodell mse-value-v1: 5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0096 | 8. Lotta, die gepanzerte Stute | valueCopper | 20000 | 10000 | Wertemodell mse-value-v1: 20 Punkte (Reittier; Verstärkungen 2). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0241 | 9. Tirwilh, Reittier des Seelenhirten | valueCopper | 30000 | 11000 | Wertemodell mse-value-v1: 22 Punkte (Reittier; Verstärkungen 4). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0125 | 13. Baju, Fährtenschwein der Alchemisten | valueCopper | 2400 | 8000 | Wertemodell mse-value-v1: 16 Punkte (Großer Begleiter; Verstärkungen 4). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0229 | 9. Brish, Schutzhund des Seelenhirten | valueCopper | 2200 | 4500 | Wertemodell mse-value-v1: 9 Punkte (Begleiter; Verstärkungen 2). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0021 | 2. Morpheus, Pegasus der Nacht | valueCopper | 50000 | 10500 | Wertemodell mse-value-v1: 21 Punkte (Reittier; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0024 | 2. Somnium, Eule der Oreinonauten | valueCopper | 5300 | 3000 | Wertemodell mse-value-v1: 6 Punkte (Kleiner Begleiter; Verstärkungen 2). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0034 | 3. Bavlior, Pferd der Astronomen | valueCopper | 30000 | 11000 | Wertemodell mse-value-v1: 22 Punkte (Reittier; Verstärkungen 4). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0015 | 2. Alptraum der lähmenden Angst | tradeStatus | — | Nicht käuflich | Beschworener Alptraum; kein handelbarer Gegenstand. |
| 0031 | 2. Wachtraum Horror | tradeStatus | — | Nicht käuflich | Wachtraum und Setwirkung; kein handelbarer Gegenstand. |
| 0275 | 10. Heltenholmer Jagdhund, Terna | valueCopper | 1600 | 5000 | Wertemodell mse-value-v1: 10 Punkte (Begleiter; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0274 | 10. Heltenholmer Jagdhund, Huldi | valueCopper | 1600 | 5000 | Wertemodell mse-value-v1: 10 Punkte (Begleiter; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0045 | 4. Anima, Pferd der Tänzer | valueCopper | 20000 | 10500 | Wertemodell mse-value-v1: 21 Punkte (Reittier; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0261 | 20. Jhulmi, Kelpie der dunklen Fee | valueCopper | 21000 | 10000 | Wertemodell mse-value-v1: 20 Punkte (Reittier; Verstärkungen 2). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0266 | 20. Zardrul der Rächer der dunklen Feen | valueCopper | 3600 | 4000 | Wertemodell mse-value-v1: 8 Punkte (Kleiner Begleiter; Verstärkungen 4). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0210 | 19. Grildruin der Wächter der Feen | valueCopper | 8900 | 3500 | Wertemodell mse-value-v1: 7 Punkte (Kleiner Begleiter; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0109 | 11. Tio’s Fisch-Vogel-Puma | valueCopper | 8700 | 3500 | Wertemodell mse-value-v1: 7 Punkte (Kleiner Begleiter; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0037 | 3. Lirma die Kosmische Katze | valueCopper | 10000 | 3000 | Wertemodell mse-value-v1: 6 Punkte (Kleiner Begleiter; Verstärkungen 2). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0268 | 4. Kleiner Feuer Phönix der Tänzer | valueCopper | 20000 | 3500 | Wertemodell mse-value-v1: 7 Punkte (Kleiner Begleiter; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0009 | 1. Lund, Kaltblut der Barden | valueCopper | 20000 | 10500 | Wertemodell mse-value-v1: 21 Punkte (Reittier; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0028 | 2. Traum der Heilsame Trance | tradeStatus | — | Nicht käuflich | Traumwirkung und Setbelohnung; kein handelbarer Gegenstand. |
| 0032 | 2. Zährende Alptraum | tradeStatus | — | Nicht käuflich | Alptraumwirkung und Setbelohnung; kein handelbarer Gegenstand. |
| 0062 | 5. Harwisch, Kettenhund der Schurken | valueCopper | 1300 | 5000 | Wertemodell mse-value-v1: 10 Punkte (Begleiter; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0107 | 11. Tio’s Dracheneinhorn | valueCopper | 60000 | 10500 | Wertemodell mse-value-v1: 21 Punkte (Reittier; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0267 | 4. Fackelfächer der Tänzer | valueCopper | 4200 | 6000 | Wertemodell mse-value-v1: 11.5 Punkte (Waffe; Verstärkungen 6.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0049 | 4. Jongliermesser der Tänzer | valueCopper | 1200 | 5000 | Wertemodell mse-value-v1: 10 Punkte (Waffe; Verstärkungen 5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0051 | 4. Kopfschmuck der Tänzer | valueCopper | 4500 | 4000 | Wertemodell mse-value-v1: 8 Punkte (Ausrüstung & Verstärkung; Verstärkungen 6). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0166 | 21.Ulgu, die magische Hecht-Echse | valueCopper | 5600 | 7500 | Wertemodell mse-value-v1: 15 Punkte (Großer Begleiter; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0140 | 14. Baia, Belin’s Gefährin | valueCopper | 50000 | 8000 | Wertemodell mse-value-v1: 16 Punkte (Großer Begleiter; Verstärkungen 4). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0150 | 14. Lavrant die sprechende Katze | valueCopper | 23000 | 4000 | Wertemodell mse-value-v1: 8 Punkte (Kleiner Begleiter; Verstärkungen 4). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0053 | 4. Peitsche der Tänzer | valueCopper | 2200 | 6000 | Wertemodell mse-value-v1: 11.5 Punkte (Waffe; Verstärkungen 6.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0058 | 5. Drasufe, Pferd der Schurken | valueCopper | 20000 | 10500 | Wertemodell mse-value-v1: 21 Punkte (Reittier; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0044 | 3.Teleskope der Astronomen | valueCopper | 10200 | 4000 | Wertemodell mse-value-v1: 7.5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 5.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0072 | 5. Wurfmesser der Schurken | valueCopper | 1700 | 4500 | Wertemodell mse-value-v1: 9 Punkte (Waffe; Verstärkungen 4). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0002 | 1. Gürtertaschen der Barden | valueCopper | 4500 | 3000 | Wertemodell mse-value-v1: 5.5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 3.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0163 | 17. Trigalton, Einhorn der arkanen Ebene | valueCopper | 40000 | 10500 | Wertemodell mse-value-v1: 21 Punkte (Reittier; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0162 | 17. Phalzu, Krähe der arkanen Ebene | valueCopper | 6000 | 3500 | Wertemodell mse-value-v1: 7 Punkte (Kleiner Begleiter; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0194 | 15. Sonnen Bogen | valueCopper | 7500 | 8000 | Wertemodell mse-value-v1: 16 Punkte (Waffe; Verstärkungen 11). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0264 | 20. Winter Szepter der dunklen Feen | valueCopper | 4600 | 6500 | Wertemodell mse-value-v1: 13 Punkte (Waffe; Verstärkungen 8). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0265 | 20. Winterrüstung der dunklen Feen | valueCopper | 3300 | 8000 | Wertemodell mse-value-v1: 16 Punkte (Rüstung; Verstärkungen 11.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0204 | 19. Feen Blütenroben | valueCopper | 8500 | 5000 | Wertemodell mse-value-v1: 10 Punkte (Rüstung; Verstärkungen 5.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0216 | 19. 🦋Kleine Fee der Heilung🦋 | valueCopper | — | 3500 | Wertemodell mse-value-v1: 7 Punkte (Kleiner Begleiter; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0242 | 9. Turmschild der verlorenen Seelen | valueCopper | — | 4500 | Wertemodell mse-value-v1: 8.5 Punkte (Rüstung; Verstärkungen 4). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0239 | 9. Sphäre der verlorenen Seelen | valueCopper | 13800 | 6500 | Wertemodell mse-value-v1: 13 Punkte (Ausrüstung & Verstärkung; Verstärkungen 11). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0293 | 18. Sani, das Grünwald Kaltblut | valueCopper | 20000 | 10500 | Wertemodell mse-value-v1: 21 Punkte (Reittier; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0292 | 18. Lagur, Grünwald Grauwolf | valueCopper | 4900 | 5500 | Wertemodell mse-value-v1: 11 Punkte (Begleiter; Verstärkungen 4). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0038 | 3. Ring der Astronomen | valueCopper | 6700 | 3500 | Wertemodell mse-value-v1: 6.5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 4.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0303 | 7. Magischer Heißluftbaloon | tradeStatus | — | Set-Vollendung · automatisch | Automatische Belohnung bei 9/9 unterschiedlichen normalen Karten aus Set 7. |
| 0079 | 6. Nalir, Pferd des Mediums | valueCopper | 10000 | 10500 | Wertemodell mse-value-v1: 21 Punkte (Reittier; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0076 | 6. Kalavir, der blinde Rabe des Mediums | valueCopper | 4500 | 3500 | Wertemodell mse-value-v1: 7 Punkte (Kleiner Begleiter; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0093 | 8. Barbul, Schutzhund der Seuchenhexe | valueCopper | 3800 | 4500 | Wertemodell mse-value-v1: 9 Punkte (Begleiter; Verstärkungen 2). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0217 | 19. 🦋Kleine Fee der Magie🦋 | valueCopper | — | 3000 | Wertemodell mse-value-v1: 6 Punkte (Kleiner Begleiter; Verstärkungen 2). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0215 | 19. 🦋Kleine Fee der Ausdauer🦋 | valueCopper | — | 3000 | Wertemodell mse-value-v1: 6 Punkte (Kleiner Begleiter; Verstärkungen 2). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0254 | 16. Nanzdrag, Ross von Barasch | valueCopper | 23000 | 10500 | Wertemodell mse-value-v1: 21 Punkte (Reittier; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0250 | 16. Izgadrul’s Klinge der Schmerzen | valueCopper | 20000 | 8500 | Wertemodell mse-value-v1: 16.5 Punkte (Waffe; Verstärkungen 11.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0251 | 16. Izgadrul’s Panzer des Zerstörers | valueCopper | 50000 | 5500 | Wertemodell mse-value-v1: 10.5 Punkte (Rüstung; Verstärkungen 6). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0156 | 17. Galinthra’s Panzer | valueCopper | 20500 | 4500 | Wertemodell mse-value-v1: 8.5 Punkte (Rüstung; Verstärkungen 4). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0271 | 10. Heltenholmer Cuirass | valueCopper | — | 4500 | Wertemodell mse-value-v1: 8.5 Punkte (Rüstung; Verstärkungen 4). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0090 | 7. Lui der Karawanen-Schutzhund | valueCopper | 500 | 4500 | Wertemodell mse-value-v1: 9 Punkte (Begleiter; Verstärkungen 2). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0153 | 17. Galinthra’s Fingerschmuck | valueCopper | 6900 | 3500 | Wertemodell mse-value-v1: 6.5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 4.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0192 | 15. Kleine Sonnen Phönix | valueCopper | 8800 | 3500 | Wertemodell mse-value-v1: 7 Punkte (Kleiner Begleiter; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0269 | 8. Eisen-Räucher-Hexerstab | valueCopper | 13500 | 7500 | Wertemodell mse-value-v1: 14.5 Punkte (Waffe; Verstärkungen 9.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0276 | 10. Heltenholmer Kumpelhammer | valueCopper | 2100 | 9500 | Wertemodell mse-value-v1: 19 Punkte (Waffe; Verstärkungen 14). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0240 | 9. Spiegel des Seelenhirten | valueCopper | 30000 | 6500 | Wertemodell mse-value-v1: 12.5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 10.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0121 | 12. Gepanzerten Stiefel | valueCopper | 3400 | 4500 | Wertemodell mse-value-v1: 9 Punkte (Rüstung; Verstärkungen 4.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0119 | 12. Geflügelten Beinschienen | valueCopper | 6000 | 4500 | Wertemodell mse-value-v1: 8.5 Punkte (Rüstung; Verstärkungen 4). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0259 | 20. Hugin, Rabe der dunklen Feen | valueCopper | 3200 | 3500 | Wertemodell mse-value-v1: 7 Punkte (Kleiner Begleiter; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0048 | 4. Joi, Papagei der Tänzer | valueCopper | 4300 | 3500 | Wertemodell mse-value-v1: 7 Punkte (Kleiner Begleiter; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
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
| 0134 | 13. Kleiner Tinktur: Brombeere | valueCopper | 2000 | 4500 | Wertemodell mse-value-v1: 9 Punkte (Ausrüstung & Verstärkung; Verstärkungen 7). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0137 | 13. Kleiner Tinktur: Zitrone | valueCopper | 2000 | 4500 | Wertemodell mse-value-v1: 9 Punkte (Ausrüstung & Verstärkung; Verstärkungen 7). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0135 | 13. Kleiner Tinktur: Heidelbeere | valueCopper | 2000 | 5000 | Wertemodell mse-value-v1: 9.5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 7.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0136 | 13. Kleiner Tinktur: Kirsche | valueCopper | 2000 | 3500 | Wertemodell mse-value-v1: 7 Punkte (Ausrüstung & Verstärkung; Verstärkungen 5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0133 | 13. Kleine Tinktur: Melisse | valueCopper | 2000 | 5000 | Wertemodell mse-value-v1: 9.5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 7.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0069 | 5. Schurkengift: schnelles Gift | valueCopper | 1500 | 3000 | Wertemodell mse-value-v1: 6 Punkte (Ausrüstung & Verstärkung; Verstärkungen 4). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0067 | 5. Schurkengift: Narkotisches-Gift | valueCopper | 1500 | 4500 | Wertemodell mse-value-v1: 8.5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 6.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0068 | 5. Schurkengift: Schnelle Saft | valueCopper | 3500 | 9000 | Wertemodell mse-value-v1: 17.5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 15.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0132 | 13. Kleine Tinktur: Himbeere | valueCopper | 2000 | 3500 | Wertemodell mse-value-v1: 7 Punkte (Ausrüstung & Verstärkung; Verstärkungen 5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0190 | 13. Große Tinktur: Destiliertes Licht | valueCopper | 3500 | 4000 | Wertemodell mse-value-v1: 8 Punkte (Ausrüstung & Verstärkung; Verstärkungen 6). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0270 | 13. Große Tinktur: Irrwisch Feuer | valueCopper | 3500 | 4000 | Wertemodell mse-value-v1: 8 Punkte (Ausrüstung & Verstärkung; Verstärkungen 6). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0146 | 14. Belin’s Maske des Schutzes | valueCopper | 12700 | 6000 | Wertemodell mse-value-v1: 12 Punkte (Ausrüstung & Verstärkung; Verstärkungen 10). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0313 | 16. Izdragul’s Hohepriester | tradeStatus | — | Set-Vollendung · automatisch | Automatische Belohnung bei 8/8 unterschiedlichen normalen Karten aus Set 16. |
| 0309 | 17. Arkane Ressonanzraum | tradeStatus | — | Set-Vollendung · automatisch | Automatische Belohnung bei 12/12 unterschiedlichen normalen Karten aus Set 17. |
| 0316 | 18. Earthas Grünwald Golem | valueCopper | — | 11000 | Wertemodell mse-value-v1: 22 Punkte (Reittier; Verstärkungen 4). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0206 | 19. Feen Noble des Blumenhofs | valueCopper | — | 4000 | Wertemodell mse-value-v1: 8 Punkte (Kleiner Begleiter; Verstärkungen 4). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0213 | 19. Malinta, Uralte magische Seerose | valueCopper | 30000 | 7500 | Wertemodell mse-value-v1: 15 Punkte (Großer Begleiter; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0208 | 19. Feen Schuhe | valueCopper | 4800 | 4500 | Wertemodell mse-value-v1: 8.5 Punkte (Rüstung; Verstärkungen 4). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0226 | 21. Sphäre der See-Nixen | valueCopper | 5800 | 3000 | Wertemodell mse-value-v1: 5.5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 3.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0224 | 21. Ravella’s Fiole | weightKg | 70 | 0.7 | Die Illustration und Bezeichnung zeigen eine Fiole; 70 kg ist ein fehlendes Dezimalkomma. |
| 0224 | 21. Ravella’s Fiole | valueCopper | 8900 | 3000 | Wertemodell mse-value-v1: 6 Punkte (Ausrüstung & Verstärkung; Verstärkungen 4). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0165 | 21. Ravella die See-Nixe | valueCopper | — | 7000 | Wertemodell mse-value-v1: 14 Punkte (Großer Begleiter; Verstärkungen 2). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0225 | 21. Schuppenpanzer der See-Nixen | valueCopper | 4900 | 5500 | Wertemodell mse-value-v1: 10.5 Punkte (Rüstung; Verstärkungen 6). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0295 | 18.Dornenrüstung der grünen Hexe | valueCopper | 4100 | 3500 | Wertemodell mse-value-v1: 6.5 Punkte (Rüstung; Verstärkungen 2). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0314 | 20. Umseni vom Feenhof der Schatten | valueCopper | — | 3500 | Wertemodell mse-value-v1: 7 Punkte (Kleiner Begleiter; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0311 | 21. Segler der See-Nixe | weightKg | 1200 | 80000 | Ein Segler mit 30 Personen Besatzung liegt plausibel bei rund 80 t; als großes Schiff bewertet. |
| 0311 | 21. Segler der See-Nixe | tradeStatus | — | Set-Vollendung · automatisch | Automatische Belohnung bei 12/12 unterschiedlichen normalen Karten aus Set 21. |
| 0177 | 22. Weste des Pilgers | valueCopper | 4200 | 3500 | Wertemodell mse-value-v1: 7 Punkte (Rüstung; Verstärkungen 2.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0169 | 22. Beinkleider der Pilger | valueCopper | 3500 | 2500 | Wertemodell mse-value-v1: 4.5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 2.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0167 | 22. Armschienen der Pilger | valueCopper | 3800 | 3500 | Wertemodell mse-value-v1: 6.5 Punkte (Rüstung; Verstärkungen 2). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0171 | 22. Kanon der Pilger | valueCopper | 6500 | 4000 | Wertemodell mse-value-v1: 8 Punkte (Ausrüstung & Verstärkung; Verstärkungen 6). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0170 | 22. Hirtenstab der Pilger | valueCopper | 4800 | 5500 | Wertemodell mse-value-v1: 10.5 Punkte (Waffe; Verstärkungen 5.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0173 | 22. Schal der Pilger | valueCopper | 2800 | 2500 | Wertemodell mse-value-v1: 5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0176 | 22. Wanderstiefel der Pilger | valueCopper | 4400 | 6000 | Wertemodell mse-value-v1: 11.5 Punkte (Rüstung; Verstärkungen 7). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0175 | 22. Umhang der Pilger | valueCopper | 5200 | 4000 | Wertemodell mse-value-v1: 8 Punkte (Rüstung; Verstärkungen 3.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0174 | 22. Schrein der Pilger | valueCopper | 7800 | 3000 | Wertemodell mse-value-v1: 5.5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 3.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0178 | 23. Armschienen des Henkers | valueCopper | 5600 | 4000 | Wertemodell mse-value-v1: 8 Punkte (Rüstung; Verstärkungen 3.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0182 | 23. Henkersaxt | valueCopper | 12500 | 6500 | Wertemodell mse-value-v1: 13 Punkte (Waffe; Verstärkungen 8). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0184 | 23. Henksharnisch | valueCopper | 14500 | 3500 | Wertemodell mse-value-v1: 7 Punkte (Rüstung; Verstärkungen 2.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0186 | 23. Stiefel des Henkers | valueCopper | 4300 | 3500 | Wertemodell mse-value-v1: 6.5 Punkte (Rüstung; Verstärkungen 2). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0188 | 23. Waffenrock des Henkers | valueCopper | 6200 | 4000 | Wertemodell mse-value-v1: 8 Punkte (Waffe; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0187 | 23. Umhang des Henkers | valueCopper | 5800 | 3500 | Wertemodell mse-value-v1: 6.5 Punkte (Rüstung; Verstärkungen 2). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0183 | 23. Henkersblock | valueCopper | 5200 | 2000 | Wertemodell mse-value-v1: 4 Punkte (Ausrüstung & Verstärkung; Verstärkungen 2). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0179 | 23. Gürtel des Henkers | valueCopper | 3100 | 3000 | Wertemodell mse-value-v1: 5.5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 3.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0181 | 23. Henkers Folterwerkzeug | valueCopper | 8200 | 2500 | Wertemodell mse-value-v1: 5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0180 | 23. Haus des Henkers | valueCopper | 30000 | 51000 | Wertemodell mse-value-v1: 102 Punkte (Besitz & Ort; Verstärkungen 2). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0189 | 23. Wagen des Henkers | valueCopper | 20000 | 14000 | Wertemodell mse-value-v1: 28 Punkte (Fahrzeug; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0185 | 23. Mastiff des Henkers | valueCopper | 11500 | 5000 | Wertemodell mse-value-v1: 10 Punkte (Begleiter; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0168 | 22. Begleiter der Pilger | valueCopper | 20000 | 7500 | Wertemodell mse-value-v1: 15 Punkte (Großer Begleiter; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0317 | 24. Helmreif der Feuerlinie | valueCopper | 5500 | 4500 | Wertemodell mse-value-v1: 8.5 Punkte (Rüstung; Verstärkungen 4). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0318 | 24. Glutmantel des Frontmagiers | valueCopper | 6500 | 4500 | Wertemodell mse-value-v1: 8.5 Punkte (Rüstung; Verstärkungen 4). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0319 | 24. Lamellenharnisch des Frontmagiers | valueCopper | 16500 | 6000 | Wertemodell mse-value-v1: 11.5 Punkte (Rüstung; Verstärkungen 7). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0320 | 24. Befehlsstulpen der Glut | valueCopper | 4800 | 3000 | Wertemodell mse-value-v1: 6 Punkte (Ausrüstung & Verstärkung; Verstärkungen 4). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0321 | 24. Feldbeinkleider der Feuerlinie | valueCopper | 7500 | 2500 | Wertemodell mse-value-v1: 5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0322 | 24. Marschstiefel der Feuerlinie | valueCopper | 5500 | 4000 | Wertemodell mse-value-v1: 7.5 Punkte (Rüstung; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0323 | 24. Raska, Glutsalamander | valueCopper | 20000 | 8500 | Wertemodell mse-value-v1: 17 Punkte (Großer Begleiter; Verstärkungen 5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0324 | 24. Glutlinse des Strategen | valueCopper | 20000 | 4500 | Wertemodell mse-value-v1: 8.5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 6.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0325 | 24. Karden, gepanzertes Feldross | valueCopper | 30000 | 10500 | Wertemodell mse-value-v1: 21 Punkte (Reittier; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0326 | 24. Glutpartisane des Frontmagiers | valueCopper | 20000 | 6000 | Wertemodell mse-value-v1: 12 Punkte (Waffe; Verstärkungen 7). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0327 | 24. Befehlsbuckler der Feuerlinie | valueCopper | 10000 | 2000 | Wertemodell mse-value-v1: 4 Punkte (Ausrüstung & Verstärkung; Verstärkungen 2). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0328 | 24. Standarte der Brennenden Linie | valueCopper | 50000 | 4000 | Wertemodell mse-value-v1: 7.5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 5.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0329 | 25. Blutvisier der Roten Bastion | valueCopper | 5500 | 2500 | Wertemodell mse-value-v1: 5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0330 | 25. Schulterplatten des Blutbundes | valueCopper | 6500 | 2500 | Wertemodell mse-value-v1: 5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0331 | 25. Plattenharnisch der Roten Bastion | valueCopper | 16500 | 6000 | Wertemodell mse-value-v1: 11.5 Punkte (Rüstung; Verstärkungen 7). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0332 | 25. Aderstulpen des Blutritters | valueCopper | 4800 | 2500 | Wertemodell mse-value-v1: 5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0333 | 25. Beinschienen des Blutritters | valueCopper | 7500 | 4000 | Wertemodell mse-value-v1: 7.5 Punkte (Rüstung; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0334 | 25. Sabatons der Roten Bastion | valueCopper | 5500 | 2500 | Wertemodell mse-value-v1: 5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0335 | 25. Varka, Bluthund der Roten Bastion | valueCopper | 20000 | 5000 | Wertemodell mse-value-v1: 10 Punkte (Begleiter; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0336 | 25. Herzreliquiar des Blutbundes | valueCopper | 20000 | 3500 | Wertemodell mse-value-v1: 6.5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 4.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0337 | 25. Mordain, schwarzes Panzerross | valueCopper | 30000 | 10500 | Wertemodell mse-value-v1: 21 Punkte (Reittier; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0338 | 25. Aderbrecher, Schwert des Blutritters | valueCopper | 20000 | 6500 | Wertemodell mse-value-v1: 13 Punkte (Waffe; Verstärkungen 8). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0339 | 25. Turmschild der Roten Bastion | valueCopper | 10000 | 4000 | Wertemodell mse-value-v1: 7.5 Punkte (Rüstung; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0340 | 25. Kelch des Roten Eides | valueCopper | 50000 | 3500 | Wertemodell mse-value-v1: 7 Punkte (Ausrüstung & Verstärkung; Verstärkungen 5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0341 | 26. Runenhelm der Bastion | valueCopper | 5500 | 4500 | Wertemodell mse-value-v1: 8.5 Punkte (Rüstung; Verstärkungen 4). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0342 | 26. Basaltschultern der Geomanten | valueCopper | 6500 | 2500 | Wertemodell mse-value-v1: 5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0343 | 26. Plattenpanzer der Runenbastion | valueCopper | 16500 | 6000 | Wertemodell mse-value-v1: 11.5 Punkte (Rüstung; Verstärkungen 7). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0344 | 26. Runenschmied-Stulpen | valueCopper | 4800 | 2500 | Wertemodell mse-value-v1: 5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0345 | 26. Schieferbeinschienen der Bastion | valueCopper | 7500 | 4000 | Wertemodell mse-value-v1: 7.5 Punkte (Rüstung; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0346 | 26. Ankerstiefel der Geomanten | valueCopper | 5500 | 4000 | Wertemodell mse-value-v1: 7.5 Punkte (Rüstung; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0347 | 26. Grum, kleiner Steingolem | valueCopper | 20000 | 7000 | Wertemodell mse-value-v1: 14 Punkte (Großer Begleiter; Verstärkungen 2). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0348 | 26. Kristalllot der Geomanten | valueCopper | 20000 | 3500 | Wertemodell mse-value-v1: 6.5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 4.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0349 | 26. Bromm, Granitwidder | valueCopper | 30000 | 10500 | Wertemodell mse-value-v1: 21 Punkte (Reittier; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0350 | 26. Runenhammer der Tiefen | valueCopper | 20000 | 6000 | Wertemodell mse-value-v1: 11.5 Punkte (Waffe; Verstärkungen 6.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0351 | 26. Bollwerkschild aus Schwarzstein | valueCopper | 10000 | 4000 | Wertemodell mse-value-v1: 7.5 Punkte (Rüstung; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0352 | 26. Grundstein der Runenbastion | valueCopper | 50000 | 3500 | Wertemodell mse-value-v1: 7 Punkte (Ausrüstung & Verstärkung; Verstärkungen 5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0353 | 27. Sturmhaube der Rufer | valueCopper | 5500 | 5000 | Wertemodell mse-value-v1: 9.5 Punkte (Rüstung; Verstärkungen 5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0354 | 27. Nebelmantel der Sturmrufer | valueCopper | 6500 | 5500 | Wertemodell mse-value-v1: 10.5 Punkte (Rüstung; Verstärkungen 6). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0355 | 27. Hochlandharnisch der Sturmrufer | valueCopper | 16500 | 6000 | Wertemodell mse-value-v1: 12 Punkte (Rüstung; Verstärkungen 7.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0356 | 27. Blitzfänger-Armschienen | valueCopper | 4800 | 4500 | Wertemodell mse-value-v1: 8.5 Punkte (Rüstung; Verstärkungen 4). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0357 | 27. Reiterbeinkleider der Sturmrufer | valueCopper | 7500 | 2500 | Wertemodell mse-value-v1: 5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0358 | 27. Windstiefel der Klippen | valueCopper | 5500 | 4500 | Wertemodell mse-value-v1: 8.5 Punkte (Rüstung; Verstärkungen 4). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0359 | 27. Arel, Sturmfalke | valueCopper | 20000 | 4500 | Wertemodell mse-value-v1: 9 Punkte (Kleiner Begleiter; Verstärkungen 5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0360 | 27. Sturmglas der Rufer | valueCopper | 20000 | 3500 | Wertemodell mse-value-v1: 6.5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 4.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0361 | 27. Cael, Hochlandross der Sturmrufer | valueCopper | 30000 | 11500 | Wertemodell mse-value-v1: 23 Punkte (Reittier; Verstärkungen 5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0362 | 27. Blitzspeer der Sturmrufer | valueCopper | 20000 | 6000 | Wertemodell mse-value-v1: 12 Punkte (Waffe; Verstärkungen 7). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0363 | 27. Kupferbuckler der Sturmrufer | valueCopper | 10000 | 2000 | Wertemodell mse-value-v1: 4 Punkte (Ausrüstung & Verstärkung; Verstärkungen 2). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0364 | 27. Herz des Gewitters | valueCopper | 50000 | 4000 | Wertemodell mse-value-v1: 7.5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 5.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0365 | 28. Fährtenkapuze des Rudelhüters | valueCopper | 5500 | 4000 | Wertemodell mse-value-v1: 7.5 Punkte (Rüstung; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0366 | 28. Fellmantel des Rudels | valueCopper | 6500 | 5000 | Wertemodell mse-value-v1: 9.5 Punkte (Rüstung; Verstärkungen 5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0367 | 28. Rindenlederharnisch des Rudelhüters | valueCopper | 16500 | 5500 | Wertemodell mse-value-v1: 11 Punkte (Rüstung; Verstärkungen 6.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0368 | 28. Führhandschuhe des Rudelhüters | valueCopper | 4800 | 4000 | Wertemodell mse-value-v1: 7.5 Punkte (Rüstung; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0369 | 28. Jagdbeinkleider des Rudels | valueCopper | 7500 | 2500 | Wertemodell mse-value-v1: 5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0370 | 28. Fährtenstiefel des Rudelhüters | valueCopper | 5500 | 4500 | Wertemodell mse-value-v1: 8.5 Punkte (Rüstung; Verstärkungen 4). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0371 | 28. Skarn, Rudelwolf | valueCopper | 20000 | 5000 | Wertemodell mse-value-v1: 10 Punkte (Begleiter; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0372 | 28. Totem der hundert Stimmen | valueCopper | 20000 | 3500 | Wertemodell mse-value-v1: 6.5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 4.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0373 | 28. Elgar, Riesenhirsch | valueCopper | 30000 | 11000 | Wertemodell mse-value-v1: 22 Punkte (Reittier; Verstärkungen 4). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0374 | 28. Eberspeer des Rudelhüters | valueCopper | 20000 | 5000 | Wertemodell mse-value-v1: 10 Punkte (Waffe; Verstärkungen 5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0375 | 28. Kurzbogen des Rudelhüters | valueCopper | 10000 | 5500 | Wertemodell mse-value-v1: 10.5 Punkte (Waffe; Verstärkungen 5.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0376 | 28. Horn des Großen Rudels | valueCopper | 50000 | 4000 | Wertemodell mse-value-v1: 7.5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 5.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0377 | 29. Siegelhaube des Bannmagiers | valueCopper | 5500 | 4500 | Wertemodell mse-value-v1: 8.5 Punkte (Rüstung; Verstärkungen 4). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0378 | 29. Mantel der Gegenformeln | valueCopper | 6500 | 4500 | Wertemodell mse-value-v1: 8.5 Punkte (Rüstung; Verstärkungen 4). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0379 | 29. Gesiegelte Brigantine des Bannmagiers | valueCopper | 16500 | 4500 | Wertemodell mse-value-v1: 8.5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 6.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0380 | 29. Runenhandschuhe der Auflösung | valueCopper | 4800 | 4500 | Wertemodell mse-value-v1: 8.5 Punkte (Rüstung; Verstärkungen 4). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0381 | 29. Beinkleider der Siegelkammer | valueCopper | 7500 | 2500 | Wertemodell mse-value-v1: 5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0382 | 29. Schrittstiefel der Bannkreise | valueCopper | 5500 | 4000 | Wertemodell mse-value-v1: 7.5 Punkte (Rüstung; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0383 | 29. Metrik, Runeneule | valueCopper | 20000 | 3500 | Wertemodell mse-value-v1: 7 Punkte (Kleiner Begleiter; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0384 | 29. Prisma der Gegenformel | valueCopper | 20000 | 4000 | Wertemodell mse-value-v1: 7.5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 5.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0385 | 29. Sella, Siegelstute | valueCopper | 30000 | 10500 | Wertemodell mse-value-v1: 21 Punkte (Reittier; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0386 | 29. Bannstab der Gegenformel | valueCopper | 20000 | 6000 | Wertemodell mse-value-v1: 11.5 Punkte (Waffe; Verstärkungen 6.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0387 | 29. Spiegelschild der Auflösung | valueCopper | 10000 | 4500 | Wertemodell mse-value-v1: 8.5 Punkte (Rüstung; Verstärkungen 4). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0388 | 29. Großes Siegel der Arkanen Ordnung | valueCopper | 50000 | 4500 | Wertemodell mse-value-v1: 8.5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 6.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0389 | 30. Siegelhaube des Hofschlichters | valueCopper | 5500 | 3500 | Wertemodell mse-value-v1: 6.5 Punkte (Rüstung; Verstärkungen 2). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0390 | 30. Reisemantel der Gesandten | valueCopper | 6500 | 3500 | Wertemodell mse-value-v1: 6.5 Punkte (Rüstung; Verstärkungen 2). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0391 | 30. Gepolsterte Verhandlungsweste | valueCopper | 16500 | 4500 | Wertemodell mse-value-v1: 9 Punkte (Rüstung; Verstärkungen 4.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0392 | 30. Schreibhandschuhe des Vergleichs | valueCopper | 4800 | 3500 | Wertemodell mse-value-v1: 6.5 Punkte (Rüstung; Verstärkungen 2). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0393 | 30. Beinkleider der Friedensboten | valueCopper | 7500 | 2500 | Wertemodell mse-value-v1: 5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0394 | 30. Leise Hofstiefel | valueCopper | 5500 | 3500 | Wertemodell mse-value-v1: 6.5 Punkte (Rüstung; Verstärkungen 2). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0395 | 30. Alda, Kanzleischreiberin | valueCopper | 20000 | 7000 | Wertemodell mse-value-v1: 14 Punkte (Großer Begleiter; Verstärkungen 2). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0396 | 30. Waage der Zeugenaussagen | valueCopper | 20000 | 2500 | Wertemodell mse-value-v1: 5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0397 | 30. Vertragstafel der Grenzstädte | valueCopper | 10000 | 3000 | Wertemodell mse-value-v1: 6 Punkte (Ausrüstung & Verstärkung; Verstärkungen 4). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0398 | 30. Zeremoniendegen des Hofschlichters | valueCopper | 20000 | 5000 | Wertemodell mse-value-v1: 9.5 Punkte (Waffe; Verstärkungen 4.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0399 | 30. Gesandtschaftssiegel | valueCopper | 10000 | 2500 | Wertemodell mse-value-v1: 5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0400 | 30. Kodex der Einigung | valueCopper | 50000 | 3000 | Wertemodell mse-value-v1: 6 Punkte (Ausrüstung & Verstärkung; Verstärkungen 4). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0401 | 31. Funkenvisier des Waffenschmieds | valueCopper | 5500 | 4000 | Wertemodell mse-value-v1: 8 Punkte (Waffe; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0402 | 31. Schulterleder der Esse | valueCopper | 6500 | 2500 | Wertemodell mse-value-v1: 5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0403 | 31. Schmiedeschürze des Meisters | valueCopper | 16500 | 4500 | Wertemodell mse-value-v1: 8.5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 6.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0404 | 31. Zangengriff-Stulpen | valueCopper | 4800 | 3000 | Wertemodell mse-value-v1: 6 Punkte (Ausrüstung & Verstärkung; Verstärkungen 4). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0405 | 31. Werkbeinkleider des Meisters | valueCopper | 7500 | 2500 | Wertemodell mse-value-v1: 5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0406 | 31. Schwere Schmiedestiefel | valueCopper | 5500 | 4000 | Wertemodell mse-value-v1: 7.5 Punkte (Rüstung; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0407 | 31. Marek, Geselle der Esse | valueCopper | 20000 | 7000 | Wertemodell mse-value-v1: 14 Punkte (Großer Begleiter; Verstärkungen 2). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0408 | 31. Leitamboss des Waffenschmieds | valueCopper | 20000 | 26500 | Wertemodell mse-value-v1: 53 Punkte (Besitz & Ort; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0409 | 31. Löschbecken der feinen Härte | valueCopper | 10000 | 2500 | Wertemodell mse-value-v1: 5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0410 | 31. Meisterhammer der Funken | valueCopper | 4500 | 5000 | Wertemodell mse-value-v1: 10 Punkte (Waffe; Verstärkungen 5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0411 | 31. Schablonen der hundert Klingen | valueCopper | 10000 | 4000 | Wertemodell mse-value-v1: 8 Punkte (Waffe; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0412 | 31. Meisterbrief der Glutgilde | valueCopper | 50000 | 3000 | Wertemodell mse-value-v1: 6 Punkte (Ausrüstung & Verstärkung; Verstärkungen 4). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0413 | 32. Haube der Schriftkammer | valueCopper | 5500 | 3500 | Wertemodell mse-value-v1: 6.5 Punkte (Rüstung; Verstärkungen 2). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0414 | 32. Mantel der Reisekopisten | valueCopper | 6500 | 4000 | Wertemodell mse-value-v1: 7.5 Punkte (Rüstung; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0415 | 32. Gepolstertes Schreibgewand | valueCopper | 16500 | 4500 | Wertemodell mse-value-v1: 9 Punkte (Rüstung; Verstärkungen 4.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0416 | 32. Stichelhandschuhe der Siegel | valueCopper | 4800 | 4000 | Wertemodell mse-value-v1: 7.5 Punkte (Rüstung; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0417 | 32. Beinkleider der Archivwege | valueCopper | 7500 | 2500 | Wertemodell mse-value-v1: 5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0418 | 32. Stiefel der alten Schriften | valueCopper | 5500 | 3500 | Wertemodell mse-value-v1: 6.5 Punkte (Rüstung; Verstärkungen 2). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0419 | 32. Mirren, junge Kopistin | valueCopper | 20000 | 7000 | Wertemodell mse-value-v1: 14 Punkte (Großer Begleiter; Verstärkungen 2). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0420 | 32. Tintenstein der Schriftkammer | valueCopper | 20000 | 3000 | Wertemodell mse-value-v1: 6 Punkte (Ausrüstung & Verstärkung; Verstärkungen 4). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0421 | 32. Lexikon der verlorenen Zungen | valueCopper | 10000 | 2500 | Wertemodell mse-value-v1: 5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0422 | 32. Schreibstab der Runenmagier | valueCopper | 5600 | 5000 | Wertemodell mse-value-v1: 9.5 Punkte (Waffe; Verstärkungen 4.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0423 | 32. Siegeltafel der sieben Alphabete | valueCopper | 10000 | 2500 | Wertemodell mse-value-v1: 5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0424 | 32. Palimpsest der Schriftkammer | valueCopper | 50000 | 3000 | Wertemodell mse-value-v1: 6 Punkte (Ausrüstung & Verstärkung; Verstärkungen 4). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0425 | 33. Feldkappe des Baumeisters | valueCopper | 5500 | 2000 | Wertemodell mse-value-v1: 4 Punkte (Ausrüstung & Verstärkung; Verstärkungen 2). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0426 | 33. Arbeitsmantel der Grenzbauten | valueCopper | 6500 | 4000 | Wertemodell mse-value-v1: 7.5 Punkte (Rüstung; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0427 | 33. Werkharnisch des Feldbaumeisters | valueCopper | 16500 | 5000 | Wertemodell mse-value-v1: 10 Punkte (Rüstung; Verstärkungen 5.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0428 | 33. Knotenhandschuhe des Feldbaumeisters | valueCopper | 4800 | 3500 | Wertemodell mse-value-v1: 6.5 Punkte (Rüstung; Verstärkungen 2). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0429 | 33. Beinschienen der Brückenbauer | valueCopper | 7500 | 4000 | Wertemodell mse-value-v1: 7.5 Punkte (Rüstung; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0430 | 33. Trittsichere Baustiefel | valueCopper | 5500 | 3500 | Wertemodell mse-value-v1: 6.5 Punkte (Rüstung; Verstärkungen 2). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0431 | 33. Hob, Packmaultier der Baumeister | valueCopper | 20000 | 10000 | Wertemodell mse-value-v1: 20 Punkte (Reittier; Verstärkungen 2). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0432 | 33. Feldmaß und Senkblei | valueCopper | 20000 | 2500 | Wertemodell mse-value-v1: 5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0433 | 33. Faltsteg der Grenzbauten | valueCopper | 10000 | 2500 | Wertemodell mse-value-v1: 5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0434 | 33. Zimmermannshammer der Feldbaumeister | valueCopper | 2400 | 5000 | Wertemodell mse-value-v1: 9.5 Punkte (Waffe; Verstärkungen 4.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0435 | 33. Alarmfallen-Satz | valueCopper | 10000 | 2500 | Wertemodell mse-value-v1: 5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0436 | 33. Werkbank der Wanderzunft | valueCopper | 50000 | 3000 | Wertemodell mse-value-v1: 6 Punkte (Ausrüstung & Verstärkung; Verstärkungen 4). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0437 | 34. Fährtenhaube des Monsterjägers | valueCopper | 5500 | 3500 | Wertemodell mse-value-v1: 6.5 Punkte (Rüstung; Verstärkungen 2). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0438 | 34. Wetterumhang der Jagd | valueCopper | 6500 | 4000 | Wertemodell mse-value-v1: 7.5 Punkte (Rüstung; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0439 | 34. Lederharnisch des Monsterjägers | valueCopper | 16500 | 4500 | Wertemodell mse-value-v1: 9 Punkte (Rüstung; Verstärkungen 4.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0440 | 34. Fallensucher-Stulpen | valueCopper | 4800 | 2500 | Wertemodell mse-value-v1: 5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0441 | 34. Jagdbeinkleider des Monsterjägers | valueCopper | 7500 | 2500 | Wertemodell mse-value-v1: 5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0442 | 34. Pirschstiefel des Monsterjägers | valueCopper | 5500 | 3500 | Wertemodell mse-value-v1: 6.5 Punkte (Rüstung; Verstärkungen 2). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0443 | 34. Brenn, Jagdhund der Grenzlande | valueCopper | 3600 | 4500 | Wertemodell mse-value-v1: 9 Punkte (Begleiter; Verstärkungen 2). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0444 | 34. Bestiarium der Wundstellen | valueCopper | 7900 | 2500 | Wertemodell mse-value-v1: 5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0445 | 34. Sezierungskoffer des Monsterjägers | valueCopper | 10000 | 2500 | Wertemodell mse-value-v1: 5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0446 | 34. Schwere Jagdarmbrust | valueCopper | 20000 | 6000 | Wertemodell mse-value-v1: 12 Punkte (Waffe; Verstärkungen 7). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0447 | 34. Fangnetz der Monsterjäger | valueCopper | 10000 | 2500 | Wertemodell mse-value-v1: 5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0448 | 34. Jagdkarte der bekannten Schwächen | valueCopper | 50000 | 3000 | Wertemodell mse-value-v1: 6 Punkte (Ausrüstung & Verstärkung; Verstärkungen 4). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0449 | 35. Grabungshelm des Arkanen Archäologen | valueCopper | 5500 | 4000 | Wertemodell mse-value-v1: 7.5 Punkte (Rüstung; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0450 | 35. Staubmantel der Ruinenforscher | valueCopper | 6500 | 4500 | Wertemodell mse-value-v1: 8.5 Punkte (Rüstung; Verstärkungen 4). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0451 | 35. Kletterharnisch der Fundstätten | valueCopper | 16500 | 5000 | Wertemodell mse-value-v1: 10 Punkte (Rüstung; Verstärkungen 5.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0452 | 35. Sondenhandschuhe des Archäologen | valueCopper | 4800 | 4000 | Wertemodell mse-value-v1: 7.5 Punkte (Rüstung; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0453 | 35. Grabungsbeinkleider | valueCopper | 7500 | 2500 | Wertemodell mse-value-v1: 5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0454 | 35. Trittfeste Ruinenstiefel | valueCopper | 5500 | 3500 | Wertemodell mse-value-v1: 6.5 Punkte (Rüstung; Verstärkungen 2). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0455 | 35. Terek, Bergziege der Grabungen | valueCopper | 20000 | 7000 | Wertemodell mse-value-v1: 14 Punkte (Großer Begleiter; Verstärkungen 2). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0456 | 35. Runenglas der Fundstätten | valueCopper | 20000 | 3000 | Wertemodell mse-value-v1: 6 Punkte (Ausrüstung & Verstärkung; Verstärkungen 4). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0457 | 35. Fundtagebuch der alten Reiche | valueCopper | 10000 | 2500 | Wertemodell mse-value-v1: 5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0458 | 35. Kurze Grabungshacke | valueCopper | 2400 | 5000 | Wertemodell mse-value-v1: 9.5 Punkte (Waffe; Verstärkungen 4.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0459 | 35. Fallensonde der Ruinenforscher | valueCopper | 10000 | 2500 | Wertemodell mse-value-v1: 5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0460 | 35. Atlas der versunkenen Stätten | valueCopper | 50000 | 3000 | Wertemodell mse-value-v1: 6 Punkte (Ausrüstung & Verstärkung; Verstärkungen 4). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0461 | 36. Stille Kapuze des Schwellenwächters | valueCopper | 5500 | 3500 | Wertemodell mse-value-v1: 6.5 Punkte (Rüstung; Verstärkungen 2). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0462 | 36. Mantel der letzten Wache | valueCopper | 6500 | 4000 | Wertemodell mse-value-v1: 7.5 Punkte (Rüstung; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0463 | 36. Gepolsterte Wachtkleidung | valueCopper | 16500 | 3500 | Wertemodell mse-value-v1: 6.5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 4.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0464 | 36. Hände der Seelenpflege | valueCopper | 4800 | 2500 | Wertemodell mse-value-v1: 5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0465 | 36. Beinkleider der Totenwege | valueCopper | 7500 | 2500 | Wertemodell mse-value-v1: 5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0466 | 36. Schritte über die Schwelle | valueCopper | 5500 | 2000 | Wertemodell mse-value-v1: 4 Punkte (Ausrüstung & Verstärkung; Verstärkungen 2). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0467 | 36. Veya, Rabe der Schwelle | valueCopper | 2500 | 3000 | Wertemodell mse-value-v1: 6 Punkte (Kleiner Begleiter; Verstärkungen 2). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0468 | 36. Totenlaterne der Bewahrung | valueCopper | 20000 | 3000 | Wertemodell mse-value-v1: 6 Punkte (Ausrüstung & Verstärkung; Verstärkungen 4). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0469 | 36. Buch der unbeendeten Wege | valueCopper | 10000 | 2500 | Wertemodell mse-value-v1: 5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0470 | 36. Wachstab des Schwellenwächters | valueCopper | 20000 | 5000 | Wertemodell mse-value-v1: 9.5 Punkte (Waffe; Verstärkungen 4.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0471 | 36. Seelenband des Heimwegs | valueCopper | 10000 | 2000 | Wertemodell mse-value-v1: 4 Punkte (Ausrüstung & Verstärkung; Verstärkungen 2). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0472 | 36. Siegel der letzten Pforte | valueCopper | 50000 | 3500 | Wertemodell mse-value-v1: 7 Punkte (Ausrüstung & Verstärkung; Verstärkungen 5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0473 | 37. Gesicht der vielen Namen | valueCopper | 5500 | 2000 | Wertemodell mse-value-v1: 4 Punkte (Ausrüstung & Verstärkung; Verstärkungen 2). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0474 | 37. Wendbarer Reisemantel | valueCopper | 6500 | 4000 | Wertemodell mse-value-v1: 7.5 Punkte (Rüstung; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0475 | 37. Gepolstertes Kostüm des Maskenwebers | valueCopper | 16500 | 3500 | Wertemodell mse-value-v1: 6.5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 4.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0476 | 37. Finger der falschen Schrift | valueCopper | 4800 | 2000 | Wertemodell mse-value-v1: 4 Punkte (Ausrüstung & Verstärkung; Verstärkungen 2). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0477 | 37. Schrittbeinkleider des Maskenwebers | valueCopper | 7500 | 2500 | Wertemodell mse-value-v1: 5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0478 | 37. Stiefel der fremden Spur | valueCopper | 5500 | 3500 | Wertemodell mse-value-v1: 6.5 Punkte (Rüstung; Verstärkungen 2). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0479 | 37. Dori, Gefährtin der fremden Namen | valueCopper | 20000 | 7000 | Wertemodell mse-value-v1: 14 Punkte (Großer Begleiter; Verstärkungen 2). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0480 | 37. Spiegel der stillen Gesichter | valueCopper | 20000 | 3000 | Wertemodell mse-value-v1: 6 Punkte (Ausrüstung & Verstärkung; Verstärkungen 4). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0481 | 37. Kasten der Stimmen | valueCopper | 10000 | 2500 | Wertemodell mse-value-v1: 5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0482 | 37. Versteckter Messerfächer | valueCopper | 20000 | 5000 | Wertemodell mse-value-v1: 10 Punkte (Waffe; Verstärkungen 5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0483 | 37. Brief der falschen Herkunft | valueCopper | 10000 | 2500 | Wertemodell mse-value-v1: 5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0484 | 37. Namenbuch des Maskenwebers | valueCopper | 50000 | 3000 | Wertemodell mse-value-v1: 6 Punkte (Ausrüstung & Verstärkung; Verstärkungen 4). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0485 | 38. Sucherhaube des Kopfgeldjägers | valueCopper | 5500 | 3500 | Wertemodell mse-value-v1: 6.5 Punkte (Rüstung; Verstärkungen 2). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0486 | 38. Informantenmantel | valueCopper | 6500 | 4000 | Wertemodell mse-value-v1: 7.5 Punkte (Rüstung; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0487 | 38. Fangharnisch des Kopfgeldjägers | valueCopper | 16500 | 4500 | Wertemodell mse-value-v1: 9 Punkte (Rüstung; Verstärkungen 4.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0488 | 38. Fesselstulpen der Nachtgilde | valueCopper | 4800 | 2500 | Wertemodell mse-value-v1: 5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0489 | 38. Gassenbeinkleider des Kopfgeldjägers | valueCopper | 7500 | 2500 | Wertemodell mse-value-v1: 5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0490 | 38. Leise Verfolgerstiefel | valueCopper | 5500 | 3500 | Wertemodell mse-value-v1: 6.5 Punkte (Rüstung; Verstärkungen 2). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0491 | 38. Nera, Informantin der Gassen | valueCopper | 20000 | 7000 | Wertemodell mse-value-v1: 14 Punkte (Großer Begleiter; Verstärkungen 2). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0492 | 38. Steckbriefbuch der Nachtgilde | valueCopper | 20000 | 2500 | Wertemodell mse-value-v1: 5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0493 | 38. Schwarzes Auftragssiegel | valueCopper | 10000 | 2500 | Wertemodell mse-value-v1: 5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0494 | 38. Fangstock des Kopfgeldjägers | valueCopper | 20000 | 5000 | Wertemodell mse-value-v1: 9.5 Punkte (Waffe; Verstärkungen 4.5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0495 | 38. Handfesseln der Übergabe | valueCopper | 10000 | 2500 | Wertemodell mse-value-v1: 5 Punkte (Ausrüstung & Verstärkung; Verstärkungen 3). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |
| 0496 | 38. Vertragsrolle der Gesuchten | valueCopper | 50000 | 3500 | Wertemodell mse-value-v1: 7 Punkte (Ausrüstung & Verstärkung; Verstärkungen 5). Die Karten-Seltenheit ist rein optisch und hat keine Preiswirkung. |

## Automatische Restprüfung

Keine formalen Auffälligkeiten.

## Kartenbilder

Der Build verwendet für alle 496 Einträge optimierte JPEG-Kartengrafiken. Karten bleiben bis zur Freischaltung über ihren Code verborgen.
