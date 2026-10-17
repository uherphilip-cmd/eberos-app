# Änderungen v1.8.1 – Spielleitung und Spielabend-CBP

- Eigener geschützter Hauptreiter **Spielleitung** neben Charakterbau, NPC und Druckvorschau.
- Jede verwaltete Kampagne besitzt darin einen eigenen Reiter mit Übersicht, Kampagnentexten, Gruppe, Figuren und Spielabenden.
- Kampagnen können bewusst in einer vorhandenen Welt oder zusammen mit einer neuen Welt erstellt werden.
- Gespeicherte Spielabende lassen sich mit Konfliktprüfung bearbeiten; bestehende IDs und verdeckte Folgen bleiben erhalten.
- Standard-CBP und individuelle CBP-Angebote pro Figur sind getrennt. Bereits abgeholte Werte bleiben unveränderlich und erscheinen im Verlauf.
- Geheime Spielabendnotizen liegen nach der Phase-6-Datenbankänderung außerhalb der für Spieler lesbaren Tabelle.
- Spieler können mehrere lokale Entwürfe und eigene eingereichte Figuren getrennt auswählen; CBP werden nur der passenden Figur angeboten.
- Die Spielleitung kann kanonische Figurendaten und den CBP-Verlauf lesen. Änderungsanträge werden erst nach einer späteren sicheren Vergleichsansicht freigegeben.
- Verdeckte Folgen können für andere Kampagnen derselben Welt vorgemerkt werden.
- Vorhandene Figuren-IDs dürfen nicht mehr zwischen Kampagnen verschoben werden.
- Die vorhandenen Kampagnen **Der Hexenzirkel aus Grünwald** und **Die Lieder von Langenmooren** verwenden die gemeinsame Welt **Eberos**; die beiden Altwelten bleiben als Rücksetzweg erhalten.

## Wesen-Grundlage (Masterphase 5, noch nicht veröffentlicht)

- Wesen und Archetypen sind eigenständige Datensätze der Welt; Spezies, Vorlage und aktuelle Rollen bleiben getrennt.
- Wesen besitzen bearbeitbare Grundwerte, Counter, Fähigkeiten, vorhandene Effekte, Geld und Inventargegenstände. Orts- und Fraktionszuordnungen bleiben von der Spielerfreigabe getrennt.
- Wesen können für jede Kampagne separat als geheim, teilweise bekannt oder bekannt freigegeben werden. Spieler sehen nur ausdrücklich eingegebene Namen und Hinweise, niemals geheime Werte oder Notizen.
- Die allgemeine Übertragungsgrundlage verschiebt Testgegenstände atomar aus dem Weseninventar in einen privaten Zugang der Zielfigur. Spielerannahme erzeugt genau einen serverseitigen Kampagneninventareintrag; der lokale Charakterbau wird nicht automatisch überschrieben.
- Bestehende lokale NPC-, Vertrauten- und Reittier-Reiter können Spieler einzeln und ausdrücklich zur Prüfung freigeben. Das lokale Original bleibt als nicht synchronisierte Sicherung erhalten; die Spielleitung muss ein Weltwesen bewusst speichern und verknüpfen.
- Wesen, Vorlagen und Verknüpfungen sind archiviert statt gelöscht; frühere Spielerfreigaben erscheinen nach einer Wiederherstellung nicht automatisch erneut.
- Die Datenbankgrundlage bestand in der isolierten Sandbox 415/415 rückrollbare Prüfungen. Lokal bestanden 96/96 Strukturprüfungen und 120/120 Browserprüfungen; der echte Rollen-End-to-End-Lauf bestand 19/19 Prüfungen.
- Konkrete Items, Beuteinhalte und deren automatische Regelwirkungen gehören nach ausdrücklicher Nutzerentscheidung in einen späteren eigenen Abschnitt und werden hier nicht ergänzt.
- Die Anmeldung verwendet PKCE und speichert Tokens persistent in IndexedDB statt im normalen localStorage.

## Beziehungen, Ruf und Verfolgung (Masterphase 6)

- Gerichtete Beziehungen speichern Quelle und Ziel, mehrere gleichzeitige Rollen, Haltung, strukturierte Bindungen, Verlauf und Quellenreferenz. Die Gegenrichtung bleibt ein eigener Datensatz.
- Ruf ist nach konkreten Bereichen wie Ort, Region, Fraktion, Institution, Haus, Beruf oder sozialer Gruppe getrennt und niemals ein einziger globaler Wert.
- Steckbriefe und Haftbefehle besitzen strukturierte Aussteller, Reichweite, Grund, Belohnung, Identität, Beschreibung, Lebend-/Tot-Vorgabe und Status.
- Verfolgungen können mit einem echten Weltwesen verbunden werden; geheime, teilweise bekannte und bekannte Fassungen bleiben technisch getrennt.
- Nachteile aus der gültigen Serverrevision werden nur referenziert. Fehlt die konkrete Kampagnenfolge, bleibt sie ausdrücklich als „noch offen“ markiert; Regeldaten werden nicht dupliziert.
- Spieler sehen ausschließlich eigens freigegebene Texte und Werte. Teilwissen wird nie aus geheimen Notizen abgeleitet, sondern muss ausdrücklich formuliert werden.
- Konkrete Items, Loot-Inhalte und automatische Gegenstandswirkungen bleiben weiterhin für den später vereinbarten Abschnitt reserviert.

## Orte und Weltzustand (Masterphase 7)

- Orte verwenden eine beliebig tiefe, kreisfreie Hierarchie mit stabilen IDs und navigierbaren Pfaden.
- Ausführliche Lore und kompakte Spieltischdaten stammen aus demselben Ortsdatensatz. Regeln, Wirtschaft, Reise, Dienstleistungen, Geheimnisse sowie optionale Kartenregionen und Koordinaten bleiben getrennt strukturiert.
- Ortszustände besitzen Gültigkeitszeiträume und werden passend zum aktuellen Kampagnentag gefiltert. Mehrere gleichzeitig gültige Zustände bleiben sichtbar.
- Öffentliche Ortsfelder, kampagnenweites Wissen, Figurenwissen und geheime Weltwahrheit sind technisch getrennt. Teilwissen benötigt einen ausdrücklich formulierten Spielertext.
- Wesen, Fraktionen, wirtschaftliche Warenreferenzen, Routen und bestehende Ereignisfolgen können über stabile IDs mit Orten verbunden werden. Handelswaren sind keine Inventargegenstände und erzeugen keine automatischen Wirkungen.

## Weltchronik und zeitliche Konsistenz (Masterphase 8)

- Datierte Weltereignisse bilden eine unveränderliche Chronik. Korrekturen werden als neue Ereignisse mit Bezug zum korrigierten Eintrag erfasst.
- Der wirksame Weltzustand wird je Kampagne nur aus Ereignissen bis zu ihrem aktuellen Kampagnentag abgeleitet; spätere Änderungen greifen nicht rückwirkend.
- Kanonische Wahrheit, kampagnenweites Wissen und Figurenwissen sind technisch getrennt. Entdeckungen verändern die Wahrheit nicht.
- Kausale Umkehrungen, zeitlich unmögliche Korrekturen und kollidierende Zustandsänderungen aus verschiedenen Kampagnen werden als offene Konflikte gemeldet. Eine Entscheidung benötigt eine nachvollziehbare Begründung.
- Spieler sehen ausschließlich öffentliche oder ausdrücklich freigegebene Chroniktexte bis zum aktuellen Kampagnentag; Ursachen, interne Wahrheit, Zustandswerte und Konflikte fehlen in der sicheren Projektion.

## Geschützte Gesamtverwaltung und Live-Modus (Masterphase 9, erster Funktionsschnitt)

- Die Übersicht führt direkt zu den geschützten Verwaltungsbereichen; der reduzierte Live-Modus bündelt Kampagnentag, Ort, Spielabend, anwesende Figuren und Wesen, Ortsregeln, offene Fäden, Begegnung und kompakte gemeinsame Notizen.
- Counter und aktive Effekte werden auf Basis der gültigen Figurenrevision kontrolliert fortgeschrieben. Dauerhafte Maxima und übrige Charakterdaten bleiben unverändert.
- Kampagneninventar kann mit Revisionsschutz als mitgeführt, ausgerüstet oder eingelagert markiert werden.
- Jede Live-Änderung erhält einen unveränderlichen Protokolleintrag. Rückgängig erzeugt nur dann eine neue Gegenänderung, wenn keine spätere Zieländerung dazwischenliegt.
- Spieler lesen denselben serverseitigen Counter- und Effektzustand über reduzierte Projektionen; interne Schnappschüsse, Befehlskennungen und Akteur-IDs bleiben gesperrt.
- Die Oberfläche bleibt auf Desktop, Tablet und 390-Pixel-Breite ohne Hover-Zwang bedienbar. Strukturiertes Wetter bleibt Phase 10 vorbehalten.

## Kalender und Wetter (Masterphase 10, noch nicht veröffentlicht)

- Jede der vier Jahreszeiten besitzt verbindlich 90 Tage; ein Eberos-Jahr umfasst damit 360 Tage. Jahreszeit, Jahreszeitentag und Jahr werden ohne unbestätigte Monatsgrenzen aus dem Kampagnentag abgeleitet.
- Kampagnentage werden ausschließlich über einen bestätigten, revisionsgeprüften und idempotenten Zeitbefehl fortgeschrieben. Jede Buchung bleibt im unveränderlichen Zeitprotokoll erhalten.
- Wetterkarten werden weiterhin physisch gezogen und anschließend manuell mit öffentlichem Effekt, getrenntem SL-Effekt und Dauer erfasst. Der Builder erzeugt niemals automatisch Wetter.
- Zeitfortschritt reduziert die Restdauer atomar. Nach Ablauf erscheint fest „Wetter abgelaufen – neue Wetterkarte ziehen.“; eine noch aktive Karte kann nur nach ausdrücklicher Bestätigung ersetzt werden.
- Spieler sehen ausschließlich Kalender und öffentliche Wetterangaben. Die Spielleitung erhält getrennt die geheimen Angaben und die Historie.
- Kalender- und Wetteränderungen verwenden den bestehenden datensparsamen geräteübergreifenden Signalpfad und bleiben auch auf 390 Pixeln bedienbar.

## Astronomie und wissensabhängige Informationen (Masterphase 11, noch nicht veröffentlicht)

- Astronomische Ereignisse werden als gemeinsame Weltfakten mit einem absoluten Beobachtungsfenster und vier ausdrücklich gepflegten Informationstexten gespeichert. Unbestätigte Monatsgrenzen oder automatische Zyklen werden nicht erfunden.
- Die bestätigten Schwellen lauten niedrig ab 5, mittel ab 10 und hoch ab 15 in Astronomie & Mathematik. Maßgeblich ist der serverseitig aus der gültigen Figurenrevision berechnete wirksame Wert einschließlich aktiver Effekte.
- Die Spielleitung sieht interne Titel, alle Textebenen und geheime Notizen. Sie legt pro Kampagne zusätzlich fest, bis zu welcher Ebene ein Ereignis freigegeben ist.
- Spieler erhalten ausschließlich Texte, die Beobachtungsfenster, Kampagnenfreigabe und eigene wirksame Fähigkeit gemeinsam erlauben. Interne Titel, höhere Texte und Freigabekonfiguration werden nicht an den Spielerclient übertragen.
- Änderungen verwenden den vorhandenen payload-freien Geräteabgleich; Astronomiedaten werden beim Kampagnen- oder Figurenwechsel sowie bei der Abmeldung verworfen.

## Bilder, Karten und externe Werkzeuge (Masterphase 12A, noch nicht veröffentlicht)

- Ortsbilder und fertige Karten werden als private PNG-, JPEG- oder WebP-Dateien bis 20 MiB gespeichert. Aktive Medien entstehen erst nach reserviertem Upload und serverseitiger Metadatenprüfung.
- Medien referenzieren stabile Welt- und Orts-IDs. Interne Texte, öffentliche Texte und ausdrückliche kampagnen- oder figurenbezogene Freigaben bleiben getrennt.
- Spieler laden ausschließlich bereits sicher projizierte Medien als autorisierte Blobs. Objektpfade, Prüfsummen, interne Titel und Werkzeugdaten erscheinen nicht in der Spieleroberfläche.
- Die Spielleitung kann aus der bestehenden Ortshierarchie einen deterministischen JSON-Kartenbrief mit SHA-256-Prüfsumme erzeugen und das fertige Kartenbild anschließend zuordnen. Canvas of Kings bleibt ein optionales externes Werkzeug.
- Ortslisten und alle übrigen Kampagnenfunktionen bleiben ohne Bild, Karte oder externen Editor vollständig nutzbar. Interaktive Kartenregionen sind weiterhin dem späteren Schnitt 12B vorbehalten.
- Medienänderungen verwenden den vorhandenen payload-freien Geräteabgleich; private Bilddaten werden nicht über Realtime oder den statischen Service Worker verteilt.

## Interaktive Kartenregionen (Masterphase 12B, noch nicht veröffentlicht)

- Fertige Karten können optionale, auflösungsunabhängige Polygonregionen im Format `eberos-normalized-polygon-v1` erhalten. Jede Region referenziert unveränderlich eine stabile Karten- und Orts-ID.
- Die Spielleitung zeichnet Regionen per Klick oder pflegt die normierten Punkte barrierearm als JSON; Revisionen verhindern stilles Überschreiben.
- Spieler erhalten eine Region nur, wenn sowohl das Kartenbild als auch der verknüpfte Ort bereits für Kampagne beziehungsweise Figur sichtbar sind. Interne Namen und Kartenmetadaten bleiben serverseitig.
- Regionen sind mit Maus, Touch und Tastatur auswählbar. Die vollständige Ortsliste bleibt immer verfügbar und ersetzt die Karte bei Bild-, Storage- oder Bedienfehlern.
- Alte Freitextwerte in `map_region` und `coordinates` werden weder umgedeutet noch automatisch migriert.
