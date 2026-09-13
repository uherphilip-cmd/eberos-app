'use strict';

/* EBEROS v1.7.15-r1 – nachvollziehbare und ausgewogenere Grundwertzuordnungen. */
const V1715_VERSION='1.7.15',V1715_REVISION='r1',V1715_SCHEMA=23,V1715_RULES=8;
const V1715_RETIRED_SKILL={id:'skill_32',name:'Bannung & Schutzriten'};
const V1715_SKILL_IDS_BEFORE=new Map(SKILLS.map(function(skill){return[skill.name,skill.id]}));

const V1715_ATTRIBUTE_CHANGES=new Map([
  ['Verteidigung & Blocken',['KS, WL','KS, RF']],
  ['Ablenken & Verwirren',['GS, FF','GS, CR']],
  ['Einschüchtern & Zermürben',['WL, ST','CR, ST']],
  ['Foltern & Verhören',['FF, IT','ST, IT']],
  ['Folklore & Gassenwissen',['IT, IN','CR, IN']],
  ['Strategie & Taktik',['IT, IN','IT, RF']],
  ['Aufmerksamkeit & Wachsamkeit',['WN, IN','WN, RF']],
  ['Vampirismus & Lebensraub',['IT, CR','ST, CR']],
  ['Meta-Magie & Arkane Ordnung',['IT, WL','IT, RF']],
  ['Meditation & mentaler Selbstschutz',['WL, IN','WL, KS']],
  ['Wechselbalg & Formwandlerei',['IN, KS','GS, KS']],
  ['Wassermagie & Hydromantie',['IN, WN','GS, WN']],
  ['Druiden – Fauna-Pfad',['WN, IN','WN, RF']],
  ['Druiden – Flora-Pfad',['WN, IN','WN, KS']],
  ['Gestaltwandler & Polymorphmagie',['KS, WL','KS, GS']],
  ['Hermetische Magie & Telekinetik',['IT, WL','IT, ST']],
  ['Windmagie & Aeromantie',['GS, IN','GS, RF']]
]);

/* Jede Regelfähigkeit erklärt beide Grundwerte im konkreten Zusammenhang. */
const V1715_ATTRIBUTE_REASONS={
  'Nahkampf – leichte Waffen':[['ST','Stärke kontrolliert Kraft, Bindung und Durchsetzung der leichten Waffe im direkten Kontakt.'],['RF','Reflexe bestimmen Reaktionszeit, Tempowechsel und den richtigen Augenblick für Angriff oder Parade.']],
  'Nahkampf – schwere Waffen':[['ST','Stärke bewegt die schwere Waffe mit ausreichender Wucht und hält sie auf ihrer Angriffslinie.'],['KS','Konstitution trägt Gewicht, Rückstoß und die anhaltende körperliche Belastung schwerer Waffenführung.']],
  'Nahkampf – Raufen & Ringen':[['ST','Stärke setzt Griffe durch, hält Gegner fest und erzeugt Kraft für Würfe oder Schläge.'],['GS','Geschick koordiniert Stand, Schwerpunkt, Hebel und die Bewegung des ganzen Körpers.']],
  'Fernkampf – leichte Waffen':[['FF','Fingerfertigkeit steuert Griff, Zielkorrektur und den präzisen Moment des Lösens.'],['GS','Geschick koordiniert Haltung, Körperausrichtung und Schüsse aus der Bewegung.']],
  'Fernkampf – schwere Waffen':[['ST','Stärke spannt, trägt und stabilisiert schwere Bögen, Armbrüste oder Wurfwaffen.'],['FF','Fingerfertigkeit richtet die Waffe präzise aus und kontrolliert Auslösung oder Abwurf.']],
  'Verteidigung & Blocken':[['KS','Konstitution hält der Wucht eines Angriffs und der Belastung einer festen Abwehr stand.'],['RF','Reflexe bestimmen den richtigen Zeitpunkt für Block, Parade oder Abwehrbewegung.']],
  'Vermeiden & Ausweichen':[['GS','Geschick steuert Schritt, Schwerpunkt und die vollständige Bewegung aus der Angriffslinie.'],['RF','Reflexe lösen die Ausweichbewegung rechtzeitig auf einen erkannten Angriff aus.']],

  'Akrobatik & Klettern':[['ST','Stärke liefert Zug-, Halte- und Sprungkraft beim Klettern und Überwinden von Hindernissen.'],['GS','Geschick kontrolliert Balance, Landung, Körperlage und komplexe Bewegungsfolgen.']],
  'Athletik & Schwimmen':[['ST','Stärke erzeugt Vortrieb, Beschleunigung und die Kraft für körperliche Höchstleistungen.'],['KS','Konstitution hält Ausdauer, Atmung und Leistung über längere Belastungen aufrecht.']],
  'Heimlichkeit & Schleichen':[['GS','Geschick kontrolliert leise Schritte, Körperhaltung und Bewegung durch Deckung.'],['RF','Reflexe erlauben sofortiges Erstarren oder Anpassen, sobald sich Beobachtung und Gefahr verändern.']],
  'Taschendiebstahl & Schlösser knacken':[['FF','Fingerfertigkeit führt unauffällige Griffe und feinste Bewegungen an Schlossmechanismen aus.'],['WN','Wahrnehmung erkennt Aufmerksamkeitsschwächen sowie fühl- und hörbare Rückmeldungen eines Schlosses.']],
  'Fesseln & Sichern':[['ST','Stärke fixiert Widerstand und bringt ausreichenden Zug auf Seile, Gurte oder Haltepunkte.'],['FF','Fingerfertigkeit setzt Knoten, Schlaufen und Sicherungen präzise und zuverlässig.']],
  'Entfesseln & Befreien':[['GS','Geschick kontrolliert Verdrehen, Verlagern und das Nutzen kleinster Bewegungsspielräume.'],['RF','Reflexe nutzen kurzfristig nachlassenden Griff oder Zug, bevor sich die Fessel wieder schließt.']],
  'Verbergen & Schmuggeln':[['FF','Fingerfertigkeit präpariert Verstecke und platziert Gegenstände unauffällig und passgenau.'],['IN','Intuition schätzt voraus, wo, wie und mit welcher Erwartung eine andere Person suchen wird.']],
  'Tarnen & Verkleiden':[['FF','Fingerfertigkeit fertigt und verändert Kleidung, Maske, Farbe und Tarnmaterial präzise.'],['CR','Charisma verleiht der hergestellten Erscheinung eine glaubhafte äußere Wirkung.']],

  'Wildniskunde & Wildnisleben':[['WN','Wahrnehmung erkennt Wetterzeichen, Ressourcen, Geländegefahren und verwertbare Spuren der Natur.'],['GS','Geschick setzt dieses Wissen beim Lagerbau und bei sicherer Bewegung durch schwieriges Gelände um.']],
  'Trapper & Fallensteller':[['FF','Fingerfertigkeit baut, tarnt, spannt und entschärft empfindliche Fallenmechanismen.'],['IN','Intuition sagt voraus, welchen Weg ein Ziel wählt und wo eine Falle wirksam oder verdächtig wäre.']],
  'Fährtenlesen & Spurensuche':[['WN','Wahrnehmung entdeckt Abdrücke, Brüche, Blut und andere schwache Spuren.'],['KS','Konstitution hält Konzentration und Verfolgung über lange Strecken und widrige Bedingungen aufrecht.']],
  'Orientierung & Navigation':[['WN','Wahrnehmung erfasst Landmarken, Sterne, Richtungen und Veränderungen der Umgebung.'],['FF','Fingerfertigkeit handhabt Karte, Kompass und Messmittel präzise und überträgt Beobachtungen sauber.']],
  'Reiten & Tierführung':[['GS','Geschick hält Balance und stimmt die eigene Bewegung auf das Reittier ab.'],['WL','Wille bewahrt Ruhe und setzt klare Führung gegenüber einem nervösen oder widerstrebenden Tier durch.']],
  'Tierkunde & Tierpflege':[['WN','Wahrnehmung erkennt Haltung, Verletzungen, Krankheitssymptome und Bedürfnisse eines Tieres.'],['IN','Intuition deutet Instinkt, Stimmung und wahrscheinliche Reaktion des Tieres.']],

  'Überreden & Belügen':[['CR','Charisma gestaltet Auftreten, Ton und persönliche Wirkung gegenüber dem Gesprächspartner.'],['IT','Intelligenz ordnet Argumente, hält Täuschungen widerspruchsfrei und passt die Aussage logisch an.']],
  'Ablenken & Verwirren':[['GS','Geschick steuert Bewegung, Gesten und körperliche Täuschungsmanöver.'],['CR','Charisma lenkt die Aufmerksamkeit anderer und macht die Ablenkung überzeugend.']],
  'Beruhigen & Trösten':[['CR','Charisma vermittelt Sicherheit, Wärme und einen glaubwürdigen beruhigenden Ton.'],['IN','Intuition erkennt das eigentliche Gefühl und welche Form von Zuspruch die Person erreicht.']],
  'Einschüchtern & Zermürben':[['CR','Charisma vermittelt Dominanz, Autorität und psychischen Druck.'],['ST','Stärke erzeugt eine glaubhafte körperliche Bedrohung und Gewaltbereitschaft.']],
  'Foltern & Verhören':[['ST','Stärke ermöglicht kontrollierten körperlichen Zwang und das Aufrechterhalten einer Drohkulisse.'],['IT','Intelligenz steuert Verhörmethodik, Fragenfolge und das Erkennen widersprüchlicher Aussagen.']],
  'Betören & Verzaubern':[['CR','Charisma erzeugt Anziehung, Präsenz und eine gezielte persönliche Wirkung.'],['IN','Intuition erkennt Sehnsüchte, Grenzen und die emotionale Reaktion des Gegenübers.']],
  'Menschenkenntnis & Wesen erkennen':[['IN','Intuition erfasst Grundhaltung, Moral und unausgesprochene Absichten eines Wesens.'],['WN','Wahrnehmung liefert dafür sichtbare und hörbare Hinweise aus Verhalten, Mimik und Stimme.']],
  'Lügen erkennen & Motive verstehen':[['IT','Intelligenz vergleicht Aussagen, erkennt Widersprüche und rekonstruiert mögliche Motive.'],['WN','Wahrnehmung bemerkt verräterische Veränderungen in Körpersprache, Tonfall und Verhalten.']],
  'Etikette & höfisches Auftreten':[['IT','Intelligenz erinnert Regeln, Rangordnungen, Anreden und die Bedeutung formeller Abläufe.'],['CR','Charisma setzt dieses Wissen taktvoll, sicher und gesellschaftlich überzeugend um.']],
  'Führung & Befehlsgewalt':[['CR','Charisma bindet Aufmerksamkeit, vermittelt Autorität und motiviert eine Gruppe.'],['WL','Wille hält Entscheidungen und Befehle auch unter Widerstand und in Krisen aufrecht.']],
  'Musizieren & Auftreten':[['CR','Charisma trägt Ausdruck, Bühnenpräsenz und die emotionale Wirkung auf das Publikum.'],['FF','Fingerfertigkeit beherrscht Instrument, Rhythmus und präzise eingeübte Darbietungstechniken.']],

  'Heilrituale & Heilwunder':[['WL','Wille bündelt Glauben und hält die heilende Absicht während des Rituals aufrecht.'],['IN','Intuition erkennt Leiden, seelischen Zustand und die benötigte Form der Heilung.']],
  'Religion & Theologie':[['IT','Intelligenz erschließt Lehren, Schriften, Dogmen, Gesetze und historische Zusammenhänge.'],['KS','Konstitution trägt lange Studien, Wachen, Fasten und körperlich fordernde religiöse Pflichten.']],
  'Spiritismus & Geisterkunde':[['KS','Konstitution verankert die eigene Lebenskraft gegenüber Spuk, Besessenheit und jenseitiger Belastung.'],['IN','Intuition erkennt Art, Stimmung und unausgesprochene Zeichen einer geistigen Präsenz.']],
  'Spiritismus & Seelenmagie':[['IN','Intuition deutet jenseitige Zeichen und findet einen Zugang zu Geist oder Seele.'],['WL','Wille hält die Verbindung, führt die Seele und widersteht fremdem geistigem Einfluss.']],
  'Licht- & Sonnenmagie':[['CR','Charisma trägt Hoffnung, Offenbarung und die ausstrahlende Präsenz des heiligen Lichtes.'],['WL','Wille bündelt Glaubenskraft und drängt Finsternis oder Verzweiflung zurück.']],
  'Seelische Schutzmagie & Thanaturgie':[['WL','Wille widersetzt sich Seelenraub, Furcht, Besessenheit und geistiger Zersetzung.'],['KS','Konstitution stabilisiert Lebenskraft und körperliche Existenz gegenüber Tod und Verfall.']],
  'Meditation & mentaler Selbstschutz':[['WL','Wille hält Gedanken und Gefühle unter bewusster Kontrolle.'],['KS','Konstitution steuert Atmung, Körperruhe und Widerstand gegen anhaltende Belastung.']],
  'Angriffs- & Offenbarungswunder':[['ST','Stärke trägt die unmittelbare Kraft des göttlichen Angriffs oder Urteils.'],['WL','Wille ruft die Offenbarung hervor und richtet Glaubenskraft gegen das Ziel.']],
  'Schutz- & Bewahrungswunder':[['KS','Konstitution verankert den Schutz und hält die Belastung einer Bewahrung aufrecht.'],['IN','Intuition erkennt, wo Gefahr droht und welche Person, Zone oder Sache Schutz benötigt.']],

  'Folklore & Gassenwissen':[['CR','Charisma erschließt Kontakte, Gerüchte und informelle Quellen.'],['IN','Intuition vermittelt ein Gespür für lokale Milieus, Gefahren und unausgesprochene Regeln.']],
  'Okkultismus & Arkane Kunde':[['IT','Intelligenz analysiert Zeichen, Theorien, Wesen und Gesetzmäßigkeiten des Okkulten.'],['WL','Wille bewahrt geistige Kontrolle beim Umgang mit gefährlichem oder verbotenen Wissen.']],
  'Heraldik & Geschichte':[['IT','Intelligenz erinnert Daten, Abstammungen, Wappenregeln und historische Ereignisse.'],['IN','Intuition ordnet unvollständige Hinweise einer wahrscheinlichen Linie oder Epoche zu.']],
  'Rechtskunde & Verwaltung':[['IT','Intelligenz versteht Gesetze, Verträge, Verfahren und bürokratische Zusammenhänge.'],['CR','Charisma vertritt dieses Wissen glaubhaft gegenüber Ämtern, Gerichten und Vertragspartnern.']],
  'Sprachen & Schriftkunde':[['IT','Intelligenz erschließt Grammatik, Wortschatz, Codes und sprachliche Strukturen.'],['WN','Wahrnehmung unterscheidet Laute, Zeichenformen und feine Abweichungen in Schrift oder Aussprache.']],
  'Geographie & Kulturen':[['IT','Intelligenz erinnert Regionen, Wege, Grenzen, Bräuche und politische Zusammenhänge.'],['IN','Intuition hilft, fremde kulturelle Situationen und regionale Eigenheiten richtig einzuordnen.']],
  'Historie & Ruinenkunde':[['IT','Intelligenz kennt Epochen, Bauweisen, Reiche und den überlieferten Zweck historischer Orte.'],['WN','Wahrnehmung erkennt Alter, Werkzeugspuren, Symbole und bauliche Hinweise an einem Fundort.']],
  'Astronomie & Mathematik':[['IT','Intelligenz führt Berechnungen aus und versteht Zahlen, Geometrie und Himmelsmodelle.'],['FF','Fingerfertigkeit bedient Messinstrumente und überträgt Winkel, Karten oder Konstruktionen präzise.']],
  'Konzentration & Gedächtnis':[['KS','Konstitution hält Aufmerksamkeit trotz Müdigkeit, Schmerz und langer geistiger Belastung aufrecht.'],['IT','Intelligenz ordnet Informationen und ruft gelernte Einzelheiten strukturiert ab.']],
  'Strategie & Taktik':[['IT','Intelligenz entwickelt und bewertet den taktischen Plan.'],['RF','Reflexe ermöglichen rechtzeitige Anpassungen an einen veränderten Kampfverlauf.']],
  'Monsterkunde & Jägerwissen':[['IT','Intelligenz erinnert Arten, Schwächen, Lebensräume und überliefertes Jägerwissen.'],['IN','Intuition sagt Verhalten und wahrscheinliche Reaktion einer bekannten Kreatur voraus.']],

  'Aufmerksamkeit & Wachsamkeit':[['WN','Wahrnehmung nimmt Geräusche, Bewegungen und verdächtige Einzelheiten wahr.'],['RF','Reflexe entscheiden, ob eine Gefahr noch rechtzeitig erkannt wird.']],
  'Erforschen & Untersuchen':[['WN','Wahrnehmung findet Spuren, Abweichungen und relevante Einzelheiten am Untersuchungsort.'],['IT','Intelligenz verbindet die Funde, prüft Erklärungen und löst systematische Zusammenhänge.']],
  'Magiewahrnehmung & Wahrnehmung für Übernatürliches':[['WN','Wahrnehmung bemerkt Anzeichen, Auren und Veränderungen durch übernatürliche Kräfte.'],['WL','Wille durchdringt Verschleierung und hält dem Kontakt mit fremder Magie stand.']],

  'Handwerk & Baukunst':[['IT','Intelligenz plant Konstruktion, Materialeinsatz und belastbare technische Lösungen.'],['FF','Fingerfertigkeit führt Werkzeuge und setzt den Plan präzise in Material um.']],
  'Waffenschmied & Bogenbauer':[['ST','Stärke formt widerständiges Material und spannt oder richtet belastete Bauteile.'],['FF','Fingerfertigkeit bestimmt Passung, Schliff, Balance und feine Einstellung der Waffe.']],
  'Rüstungsschmied & Schildmacher':[['ST','Stärke treibt, biegt und verbindet schwere Schutzmaterialien.'],['FF','Fingerfertigkeit sorgt für genaue Passform, Gelenke, Riemen und saubere Verbindungen.']],
  'Schreiber & Fälscher':[['WN','Wahrnehmung erkennt Papier, Siegel, Strichführung und kleinste Abweichungen eines Dokuments.'],['FF','Fingerfertigkeit reproduziert Schrift, Zeichen und Siegel mit der nötigen Genauigkeit.']],
  'Alchemist & Apotheker':[['IT','Intelligenz versteht Rezeptur, Reaktion, Dosierung und Wirkung der verwendeten Stoffe.'],['FF','Fingerfertigkeit misst, trennt und verarbeitet empfindliche Zutaten kontrolliert.']],
  'Heiler & Helfer':[['IT','Intelligenz liefert medizinisches Wissen, Diagnose und die richtige Behandlungsfolge.'],['WN','Wahrnehmung erkennt Symptome, Wundzustand und Veränderungen während der Versorgung.']],

  'Nekromantie & Totenmagie':[['KS','Konstitution widersteht Verfall, Todesnähe und der körperlichen Rückwirkung nekromantischer Kräfte.'],['WL','Wille bindet, erhebt oder beherrscht Seelenreste und Tote.']],
  'Dämonologie & Höllen-Beschwörungen':[['WL','Wille hält Kontrolle gegenüber einer feindseligen beschworenen Entität.'],['CR','Charisma setzt Namen, Befehle und die behauptete Autorität des Beschwörers durch.']],
  'Flüche & Blut-Hexerei':[['FF','Fingerfertigkeit vollzieht Zeichen, Schnitte, Bindungen und Opferhandlungen präzise.'],['IN','Intuition findet die passende symbolische Verbindung zwischen Fluch, Opfer und Ziel.']],
  'Vampirismus & Lebensraub':[['ST','Stärke verkörpert räuberische Kraft und das gewaltsame Entziehen von Lebenskraft.'],['CR','Charisma dient der Beherrschung, Verführung oder unheiligen Bindung des Opfers.']],
  'Wechselbalg & Formwandlerei':[['GS','Geschick kontrolliert Bewegung und Koordination des veränderten Körpers.'],['KS','Konstitution stabilisiert die angenommene körperliche Form.']],
  'Wahnsinn & Delirium – Flüche':[['WL','Wille zwingt fremden Gedanken Halluzination, Fixierung oder Kontrollverlust auf.'],['KS','Konstitution trägt die Rückwirkung und das anhaltende Aufrechterhalten des zersetzenden Fluches.']],
  'Schmerz & Qual – Flüche':[['IN','Intuition erkennt körperliche oder seelische Verwundbarkeit und den wirksamsten Ansatz der Qual.'],['FF','Fingerfertigkeit verankert den Fluch präzise in Zeichen, Körperstelle oder symbolischer Verbindung.']],

  'Feuermagie & Pyrokinetik':[['WL','Wille hält zerstörerische Hitze unter Kontrolle und richtet sie auf die beabsichtigte Wirkung.'],['RF','Reflexe steuern Entzündung, Ausbreitung und schnelle Reaktion auf unberechenbares Feuer.']],
  'Erdmagie & Geomantie':[['WL','Wille zwingt starres Material in eine neue Form oder Bewegung.'],['KS','Konstitution verankert die Magie und hält Druck, Gewicht und Erschütterung stand.']],
  'Windmagie & Aeromantie':[['GS','Geschick lenkt Bewegung, Richtung und Form der Luftströmung.'],['RF','Reflexe ermöglichen schnelle Korrekturen bei wechselndem Luftdruck und plötzlichen Bewegungen.']],
  'Wassermagie & Hydromantie':[['GS','Geschick formt und lenkt kontinuierlich fließende Bewegungen.'],['WN','Wahrnehmung erfasst Strömung, Volumen und Veränderungen des Wassers.']],
  'Blitzmagie & Micaturgie':[['RF','Reflexe beherrschen den extrem kurzen Zeitpunkt von Entladung und Richtungswechsel.'],['IT','Intelligenz versteht Leitung, Ladung und den geplanten Verlauf elektrischer Energie.']],
  'Empathische Magie & Thymoturgie':[['CR','Charisma projiziert und verstärkt die beabsichtigte emotionale Wirkung.'],['IN','Intuition erkennt vorhandene Gefühle und den Ansatzpunkt für ihre Veränderung.']],
  'Hermetische Magie & Telekinetik':[['IT','Intelligenz bestimmt Struktur, Richtung und präzise Führung der telekinetischen Kraft.'],['ST','Stärke bestimmt die Kraft, mit der telekinetisch gezogen, gehalten oder gestoßen wird.']],
  'Psychische Magie & Telepathie':[['IN','Intuition findet Gedanken, Erinnerungen und die innere Verfassung eines fremden Geistes.'],['WL','Wille hält die mentale Verbindung und setzt Einfluss gegen Widerstand durch.']],
  'Trugbild-Magie & Illusionistik':[['CR','Charisma verleiht dem Trugbild eine überzeugende emotionale und sinnliche Wirkung.'],['IT','Intelligenz hält Einzelheiten, Perspektive und Verhalten der Illusion widerspruchsfrei.']],
  'Meta-Magie & Arkane Ordnung':[['IT','Intelligenz erkennt und versteht die Struktur einer magischen Wirkung.'],['RF','Reflexe ermöglichen rechtzeitiges Unterbrechen, Umlenken oder Gegenwirken.']],
  'Druiden – Flora-Pfad':[['WN','Wahrnehmung erkennt Zustand, Wachstum und Bedürfnisse von Pflanzen.'],['KS','Konstitution verkörpert Beständigkeit, Wachstumskraft und Verwurzelung.']],
  'Traummagie & Oneiromantie':[['IN','Intuition deutet Traumsymbole, Vorahnungen und unbewusste Zusammenhänge.'],['WL','Wille bewahrt die eigene Identität und formt Traum oder Albtraum gezielt.']],
  'Gestaltwandler & Polymorphmagie':[['KS','Konstitution erträgt und stabilisiert die körperliche Verwandlung.'],['GS','Geschick kontrolliert Bewegung und Koordination der neuen Gestalt.']],
  'Ritualistik & Volksmagie':[['CR','Charisma trägt Überlieferung, Anrufung und die gemeinschaftliche Bedeutung des Rituals.'],['FF','Fingerfertigkeit bereitet Zeichen, Kräuter und rituelle Gegenstände präzise vor.']],
  'Druiden – Fauna-Pfad':[['WN','Wahrnehmung erkennt Verhalten, Körpersprache und Zustand eines Tieres.'],['RF','Reflexe verkörpern tierischen Instinkt und unmittelbare Reaktion.']]
};

function installSkillsV1715(){
  for(const[name,[before,after]]of V1715_ATTRIBUTE_CHANGES){const skill=SKILLS.find(function(entry){return entry.name===name});if(!skill)throw new Error('v1.7.15: Fähigkeit fehlt: '+name);if(skill.attrs!==before&&skill.attrs!==after)throw new Error('v1.7.15: unerwartete Grundwerte für '+name+': '+skill.attrs);skill.attrs=after}
  const retiredIndex=SKILLS.findIndex(function(skill){return skill.id===V1715_RETIRED_SKILL.id&&skill.name===V1715_RETIRED_SKILL.name});
  if(retiredIndex<0)throw new Error('v1.7.15: Bannung & Schutzriten mit stabiler ID skill_32 fehlt.');
  SKILLS.splice(retiredIndex,1);
  for(const skill of SKILLS){
    const reasons=V1715_ATTRIBUTE_REASONS[skill.name],ids=skillAttributeIdsR10(skill);
    if(!reasons)throw new Error('v1.7.15: Grundwertbegründung fehlt: '+skill.name);
    if(reasons.length!==2||reasons.map(function(reason){return reason[0]}).join('|')!==ids.join('|'))throw new Error('v1.7.15: Begründungen passen nicht zu '+skill.name+' ('+skill.attrs+').');
    skill.attributeReasonsV1715=reasons.map(function(reason){return[reason[0],reason[1]]});
    skill.attributeReasonSearchV1715=reasons.map(function(reason){return reason.join(' ')}).join(' ');
  }
}
installSkillsV1715();

const skillInfoContentBeforeV1715=skillInfoContentR5;
function skillInfoContentV1715(skill){
  const box=skillInfoContentBeforeV1715(skill),reasons=skill.attributeReasonsV1715;
  if(!Array.isArray(reasons))return box;
  const section=el('section',{class:'skill-attribute-reasons-v1715'},[el('h4',{text:'Warum diese Grundwerte?'})]);
  for(const[id,text]of reasons)section.append(el('p',{},[el('strong',{text:id+': '}),text]));
  box.prepend(section);return box;
}
skillInfoContentR5=skillInfoContentV1715;
const skillReasonStyleV1715=el('style',{text:'.skill-attribute-reasons-v1715{margin:.35rem 0 .75rem;padding:.65rem;border:1px solid var(--border);border-radius:10px;background:var(--panel-alt)}.skill-attribute-reasons-v1715 h4{margin:0 0 .45rem}.skill-attribute-reasons-v1715 p{margin:.3rem 0}.print-skill-reasons-v1715{margin:.35rem 0 0;padding:.4rem .55rem;border-left:3px solid var(--accent-2)}'});document.head.append(skillReasonStyleV1715);

function cloneV1715(value){try{return structuredClone(value)}catch{return JSON.parse(JSON.stringify(value))}}
function normalizedSkillStateV1715(value){if(typeof value==='number')return{level:Math.max(0,Math.min(25,+value||0)),fav:false,note:''};const entry=value&&typeof value==='object'&&!Array.isArray(value)?value:{};entry.level=Math.max(0,Math.min(25,+entry.level||0));if(entry.fav===undefined)entry.fav=false;if(entry.note===undefined)entry.note='';return entry}
const moduleBeforeV1715=moduleV177,effectInstanceBeforeV1715=effectInstanceV177;
moduleV177=function(raw={}){const module=moduleBeforeV1715(raw);if(raw.inactiveLegacy===true)module.inactiveLegacy=true;if(raw.legacyType)module.legacyType=raw.legacyType;if(raw.legacyTarget)module.legacyTarget=raw.legacyTarget;return module};
effectInstanceV177=function(raw={}){const effect=effectInstanceBeforeV1715(raw);if(raw.legacyInactiveV1715===true)effect.legacyInactiveV1715=true;return effect};
function migrateRetiredEffectTargetsV1715(owner){
  const effects=[...(owner.activeEffectsV177||[])],disadvantages=owner.disadvantages||[];let changed=0;
  const migrateModules=function(modules){for(const module of modules||[])if(module.type==='skill'&&(module.target===V1715_RETIRED_SKILL.id||module.target===V1715_RETIRED_SKILL.name)||module.type==='rule'&&module.target==='legacy_skill_32'){
    module.legacyType=module.legacyType||'skill';module.legacyTarget=module.legacyTarget||module.target;module.type='rule';module.target='legacy_skill_32';module.inactiveLegacy=true;module.scope=module.scope||'Inaktiver Legacy-Hinweis: frühere Fähigkeit Bannung & Schutzriten';changed++;
  }};
  for(const effect of effects){migrateModules(effect.modules);if(effect.modules?.length&&effect.modules.every(function(module){return module.inactiveLegacy===true})){effect.active=false;effect.legacyInactiveV1715=true}}
  for(const item of disadvantages)migrateModules(item.effectModulesV177);
  return changed;
}
function retireSkillV1715(owner){
  owner.migrations=owner.migrations&&typeof owner.migrations==='object'?owner.migrations:{};
  owner.migrations.v1715RetiredSkills=owner.migrations.v1715RetiredSkills&&typeof owner.migrations.v1715RetiredSkills==='object'?owner.migrations.v1715RetiredSkills:{};
  const records=[];for(const key of[V1715_RETIRED_SKILL.id,V1715_RETIRED_SKILL.name])if(Object.hasOwn(owner.skills,key)){const data=normalizedSkillStateV1715(owner.skills[key]);records.push({key,data:cloneV1715(data),freedCbp:skillCost(data.level)});delete owner.skills[key]}
  if(records.length){const existing=owner.migrations.v1715RetiredSkills[V1715_RETIRED_SKILL.id],added=records.reduce(function(sum,record){return sum+record.freedCbp},0);if(existing){existing.records=[...(Array.isArray(existing.records)?existing.records:[]),...records];existing.freedCbp=(+existing.freedCbp||0)+added;existing.updatedAt=new Date().toISOString()}else owner.migrations.v1715RetiredSkills[V1715_RETIRED_SKILL.id]={id:V1715_RETIRED_SKILL.id,name:V1715_RETIRED_SKILL.name,records,freedCbp:added,archivedAt:new Date().toISOString()}}
  return records.reduce(function(sum,record){return sum+record.freedCbp},0);
}
function ownerListV1715(data){const owners=[];for(const character of data.characters||[]){owners.push(character);for(const owner of character.auxiliaryTabs||[])if(owner.type!=='possession')owners.push(owner)}return owners}
function ensureOwnerV1715(owner,report){
  if(!owner||typeof owner!=='object'||owner.type==='possession')return owner;
  owner.skills=owner.skills&&typeof owner.skills==='object'&&!Array.isArray(owner.skills)?owner.skills:{};
  const freedCbp=retireSkillV1715(owner),legacyEffects=migrateRetiredEffectTargetsV1715(owner);
  for(const skill of SKILLS)owner.skills[skill.id]=normalizedSkillStateV1715(owner.skills[skill.id]);
  for(const skill of owner.customSkills||[])owner.skills[skill.id]=normalizedSkillStateV1715(owner.skills[skill.id]);
  const activeIds=[...SKILLS.map(function(skill){return skill.id}),...(owner.customSkills||[]).filter(function(skill){return !skill.archived}).map(function(skill){return skill.id})],given=Array.isArray(owner.skillOrder)?owner.skillOrder:[];
  owner.skillOrder=[...given.filter(function(id,index){return activeIds.includes(id)&&given.indexOf(id)===index}),...activeIds.filter(function(id){return !given.includes(id)})];
  owner.migrations.v1715Done=true;if(report)report.push({ownerId:owner.id||'',ownerName:owner.name||owner.type||'Charakter',freedCbp,legacyEffects});return owner;
}
function backupIncomingStateV1715(data){if(!data||data.v1715AttributeBalanceMigrationDone)return;try{localStorage.setItem(STORE+'.backup.import-v1715.'+Date.now(),JSON.stringify(data))}catch{}}
function ensureStateV1715(data,log=true){
  if(!data||typeof data!=='object')return data;const first=!data.v1715AttributeBalanceMigrationDone,fromSchema=+data.schemaVersion||0,fromApp=data.appVersion||'unbekannt',report=[];
  for(const owner of ownerListV1715(data))ensureOwnerV1715(owner,first?report:null);
  data.appVersion=V1715_VERSION;data.schemaVersion=V1715_SCHEMA;data.rulesVersion=V1715_RULES;data.v1715AttributeBalanceMigrationDone=true;
  data.migrationLog=Array.isArray(data.migrationLog)?data.migrationLog:[];
  if(first){data.v1715MigrationReport=report;if(log!==false)data.migrationLog.push({from:fromSchema,fromApp,to:V1715_SCHEMA,toApp:V1715_VERSION,at:new Date().toISOString(),owners:report.length,freedCbp:report.reduce(function(sum,item){return sum+item.freedCbp},0),changes:['17 Grundwertzuordnungen nachvollziehbar neu ausbalanciert','Grundwertbegründungen für alle Regelfähigkeiten ergänzt','Bannung & Schutzriten ersatzlos pensioniert und Altwerte archiviert','Keine andere Fähigkeit und kein Machtkatalog verändert']})}
  return data;
}

const migrateStateBeforeV1715=migrateState;
migrateState=function(data){backupIncomingStateV1715(data);return ensureStateV1715(migrateStateBeforeV1715(data),true)};
state=ensureStateV1715(state,true);

const newCharacterBeforeV1715=newCharacter,newAuxEntryBeforeV1715=newAuxEntry;
newCharacter=function(){return ensureOwnerV1715(newCharacterBeforeV1715())};
newAuxEntry=function(type,name){const owner=newAuxEntryBeforeV1715(type,name);return type==='possession'?owner:ensureOwnerV1715(owner)};

const searchIndexBeforeV1715=searchIndexV177;
searchIndexV177=function(){return searchIndexBeforeV1715().filter(function(entry){return entry.target?.skillId!==V1715_RETIRED_SKILL.id&&entry.label!==V1715_RETIRED_SKILL.name}).map(function(entry){const skill=SKILLS.find(function(item){return item.name===entry.label||item.id===entry.target?.skillId});if(skill?.attributeReasonSearchV1715)entry.search+=' '+normalizeSearchV177(skill.attributeReasonSearchV1715);return entry})};
const targetOptionsBeforeV1715=targetOptionsV177;
targetOptionsV177=function(type){return targetOptionsBeforeV1715(type).filter(function(option){return type!=='skill'||(option[0]!==V1715_RETIRED_SKILL.id&&option[0]!==V1715_RETIRED_SKILL.name)})};

const renderPrintSkillsBeforeV1715=renderPrintSkillsR15;
renderPrintSkillsR15=function(card,owner,options,isCharacter){
  const result=renderPrintSkillsBeforeV1715(card,owner,options,isCharacter);if(!options.descriptions)return result;
  const appendix=[...result.querySelectorAll('.print-skill-appendix')].find(function(section){return section.querySelector('h3')?.textContent==='Fähigkeitenbeschreibungen'}),articles=appendix?[...appendix.querySelectorAll(':scope > article')]:[];
  for(const[skillIndex,skill]of allSkillsV178(owner).entries()){if(!skill.attributeReasonsV1715||!articles[skillIndex])continue;const reasons=el('div',{class:'print-skill-reasons-v1715'},[el('strong',{text:'Warum diese Grundwerte?'})]);for(const[id,text]of skill.attributeReasonsV1715)reasons.append(el('p',{text:id+': '+text}));articles[skillIndex].append(reasons)}
  return result;
};

function attributeDistributionV1715(){const counts=Object.fromEntries(ATTRS.map(function(attribute){return[attribute[0],0]}));for(const skill of SKILLS)for(const id of skillAttributeIdsR10(skill))counts[id]++;return counts}
const runTestsBeforeV1715=runTests;
function runTestsV1715(){
  runTestsBeforeV1715();const body=testResults.querySelector('tbody'),superseded=new Set(['Version 1.7.14','Schema 22','Regelstand bleibt 7','Regelversion 7','Revision r4: Regelversion 7','84 Regelfähigkeiten','84 eindeutige Fähigkeits-IDs','84 eindeutige Fähigkeitsnamen','Alle 82 bisherigen Namen behalten ihre ID','Charakter zeigt 84 Regelfähigkeiten','NPC zeigt 84 Regelfähigkeiten']);for(const row of[...body.querySelectorAll('tr')])if(superseded.has(row.cells[0]?.textContent))row.remove();
  const priorFailures=[...body.querySelectorAll('tr')].filter(function(row){return row.cells[row.cells.length-1]?.textContent==='Fehler'}),tests=[],eq=function(name,expected,actual){tests.push([name,expected,actual,expected===actual])};
  eq('Version 1.7.15',V1715_VERSION,APP_VERSION);eq('Schema 23',V1715_SCHEMA,SCHEMA_VERSION);eq('Regelstand 8',V1715_RULES,RULES_VERSION);eq('Revision r1','r1',V1715_REVISION);
  eq('83 aktive Regelfähigkeiten',83,SKILLS.length);eq('83 eindeutige IDs',83,new Set(SKILLS.map(function(skill){return skill.id})).size);eq('83 eindeutige Namen',83,new Set(SKILLS.map(function(skill){return skill.name})).size);eq('Bannung & Schutzriten nicht aktiv',false,SKILLS.some(function(skill){return skill.id===V1715_RETIRED_SKILL.id||skill.name===V1715_RETIRED_SKILL.name}));
  eq('Alle verbleibenden IDs stabil',true,[...V1715_SKILL_IDS_BEFORE].filter(function(entry){return entry[0]!==V1715_RETIRED_SKILL.name}).every(function(entry){return SKILLS.find(function(skill){return skill.name===entry[0]})?.id===entry[1]}));
  eq('17 Zuordnungen exakt umgesetzt',true,[...V1715_ATTRIBUTE_CHANGES].every(function(entry){return SKILLS.find(function(skill){return skill.name===entry[0]})?.attrs===entry[1][1]}));
  eq('Alle Fähigkeiten haben zwei gültige Grundwerte',true,SKILLS.every(function(skill){return skillAttributeIdsR10(skill).length===2}));eq('Alle Fähigkeiten haben zwei passende Begründungen',true,SKILLS.every(function(skill){return skill.attributeReasonsV1715?.length===2&&skill.attributeReasonsV1715.every(function(reason,index){return reason[0]===skillAttributeIdsR10(skill)[index]&&reason[1].length>35})}));
  eq('Grundwertverteilung exakt','ST:14|KS:16|GS:13|RF:12|FF:18|WL:17|IT:23|IN:19|WN:17|CR:17',ATTRS.map(function(attribute){return attribute[0]+':'+attributeDistributionV1715()[attribute[0]]}).join('|'));
  const protection=SKILLS.find(function(skill){return skill.name==='Schutz- & Bewahrungswunder'}),thanaturgy=SKILLS.find(function(skill){return skill.name==='Seelische Schutzmagie & Thanaturgie'});eq('Schutz- & Bewahrungswunder unverändert','KS, IN|GB',protection?.attrs+'|'+protection?.use);eq('Seelische Schutzmagie & Thanaturgie unverändert','WL, KS|GB / FS',thanaturgy?.attrs+'|'+thanaturgy?.use);
  const fresh=newCharacter(),npc=newAuxEntry('npc','NPC'),familiar=newAuxEntry('familiar','Vertrauter');eq('Neue Figuren enthalten skill_32 nicht',true,[fresh,npc,familiar].every(function(owner){return !Object.hasOwn(owner.skills,V1715_RETIRED_SKILL.id)&&!owner.skillOrder.includes(V1715_RETIRED_SKILL.id)}));eq('Infobox zeigt Begründungen',true,skillInfoContentR5(SKILLS.find(function(skill){return skill.name==='Strategie & Taktik'})).textContent.includes('Warum diese Grundwerte?')&&skillInfoContentR5(SKILLS.find(function(skill){return skill.name==='Strategie & Taktik'})).textContent.includes('rechtzeitige Anpassungen'));
  const legacyOwner=newCharacter();legacyOwner.skills[V1715_RETIRED_SKILL.id]={level:10,fav:true,note:'Alter Bannkreis',extra:'vollständig erhalten'};legacyOwner.skillOrder.splice(3,0,V1715_RETIRED_SKILL.id);const custom=createCustomSkillV178(legacyOwner,{name:'Eigene Altprobe',category:'Wissen',attribute1:'IT',attribute2:'IN',use:'FO',scope:'bleibt'});legacyOwner.skills[custom.id].level=7;legacyOwner.activeEffectsV177=[{id:'legacy-effect',name:'Alter Bonus',modules:[{type:'skill',target:V1715_RETIRED_SKILL.id,value:2}]}];const unaffected=cloneV1715(legacyOwner.skills.skill_11),expectedFreed=skillCost(10),legacy={appVersion:'1.7.14',schemaVersion:22,rulesVersion:7,characters:[legacyOwner],activeCharacterId:legacyOwner.id,settings:{},migrationLog:[],v1714SkillSplitMigrationDone:true};delete legacy.v1715AttributeBalanceMigrationDone;ensureStateV1715(legacy,true);const once=JSON.stringify(legacy),archive=legacyOwner.migrations.v1715RetiredSkills[V1715_RETIRED_SKILL.id];
  const archivedTen=archive.records.find(function(record){return record.data.level===10});eq('Altwert vollständig archiviert','10|true|Alter Bannkreis|vollständig erhalten',archivedTen.data.level+'|'+archivedTen.data.fav+'|'+archivedTen.data.note+'|'+archivedTen.data.extra);eq('Freie CBP exakt',expectedFreed,archive.freedCbp);eq('Kein aktiver skill_32-Rest',true,!Object.hasOwn(legacyOwner.skills,V1715_RETIRED_SKILL.id)&&!legacyOwner.skillOrder.includes(V1715_RETIRED_SKILL.id));eq('Alt-Effekt inaktiv archiviert','false|rule|legacy_skill_32|true',legacyOwner.activeEffectsV177[0].active+'|'+legacyOwner.activeEffectsV177[0].modules[0].type+'|'+legacyOwner.activeEffectsV177[0].modules[0].target+'|'+legacyOwner.activeEffectsV177[0].modules[0].inactiveLegacy);eq('Unbeteiligte Fähigkeit unverändert',JSON.stringify(unaffected),JSON.stringify(legacyOwner.skills.skill_11));eq('Eigene Fähigkeit bleibt erhalten','Eigene Altprobe|7',legacyOwner.customSkills.find(function(skill){return skill.id===custom.id})?.name+'|'+legacyOwner.skills[custom.id].level);eq('Genau ein Migrationsprotokoll',1,legacy.migrationLog.filter(function(entry){return entry.toApp===V1715_VERSION}).length);ensureStateV1715(legacy,true);eq('Migration idempotent',once,JSON.stringify(legacy));
  const rendered=renderSkillsV178(fresh,false),renderedNpc=renderSkillsV178(npc,true);eq('Charakter und NPC zeigen je 83 Fähigkeiten','83|83',rendered.querySelectorAll('tr[data-skill-id]').length+'|'+renderedNpc.querySelectorAll('tr[data-skill-id]').length);eq('Suche enthält Begründungen',true,searchIndexV177().some(function(entry){return entry.label==='Strategie & Taktik'&&entry.search.includes('rechtzeitige anpassungen')}));eq('Effektziele enthalten skill_32 nicht',false,targetOptionsV177('skill').some(function(option){return option[0]===V1715_RETIRED_SKILL.id}));
  const print=renderPrintSkillsR15(cardObject('skills'),fresh,{format:'standard',descriptions:true},true);eq('Druck zeigt 83 Fähigkeiten und Begründungen',true,print.querySelectorAll('tbody tr').length===83&&print.textContent.includes('Warum diese Grundwerte?')&&!print.textContent.includes(V1715_RETIRED_SKILL.name));
  for(const test of tests)body.append(el('tr',{},[test[0],test[1],test[2],test[3]?'Bestanden':'Fehler'].map(function(value){return el('td',{text:String(value)})})));return priorFailures.length===0&&tests.every(function(test){return test[3]});
}
runTests=runTestsV1715;testsBtn.onclick=runTestsV1715;

renderAll();save();
Object.assign(window.Eberos,{version:V1715_VERSION,revision:V1715_REVISION,schemaVersion:V1715_SCHEMA,rulesVersion:V1715_RULES,runTests:runTestsV1715,ensureStateV1715,ensureOwnerV1715,attributeDistributionV1715,retiredSkillV1715:V1715_RETIRED_SKILL});
