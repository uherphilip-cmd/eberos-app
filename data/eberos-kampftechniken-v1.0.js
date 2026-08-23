'use strict';

/* Eberos v1.7.6 r9: Kampftechniken */
const COMBAT_TECHNIQUE_DB_V176=window.EBEROS_COMBAT_TECHNIQUE_DB={
  meta:{catalogVersion:'1.0',builderRevision:'1.7.6-r9',schools:6,entries:48},
  unlockLevels:[1,5,10,15,20,25],
  tierLevels:{1:1,2:5,3:10,4:15,5:20},
  schools:[
    {skillId:'skill_1',skillName:'Nahkampf – leichte Waffen',label:'Leichter Nahkampf'},
    {skillId:'skill_2',skillName:'Nahkampf – schwere Waffen',label:'Schwerer Nahkampf'},
    {skillId:'skill_5',skillName:'Fernkampf – leichte Waffen',label:'Leichter Fernkampf'},
    {skillId:'skill_6',skillName:'Fernkampf – schwere Waffen',label:'Schwerer Fernkampf'},
    {skillId:'skill_7',skillName:'Verteidigung & Blocken',label:'Verteidigen & Blocken'},
    {skillId:'skill_8',skillName:'Vermeiden & Ausweichen',label:'Ausweichen & Vermeiden'}
  ],
  entries:[
    {id:'tech_light_melee_feint',code:'K1',skillId:'skill_1',name:'Flinke Finte',tier:1,minLevel:1,staminaCost:1,activation:'Angriff · vor der Probe',effect:'Das Ziel erhält −B auf seine aktive Verteidigung gegen diesen Angriff.',scaling:'B bestimmt die Stärke der Finte.',check:'Angriff mit Nahkampf – leichte Waffen gegen die gewählte Verteidigung.',limits:'Einmal pro Runde; nicht mit einer weiteren offensiven Kampftechnik auf demselben Angriff kombinierbar.'},
    {id:'tech_light_melee_dancing_blade',code:'K2',skillId:'skill_1',name:'Tänzelnde Klinge',tier:1,minLevel:1,staminaCost:1,activation:'Angriff · nach der Probe',effect:'Vor oder nach dem Angriff darfst du dich bis zu B Felder bewegen, ohne durch das angegriffene Ziel eine Reaktion auszulösen.',scaling:'B bestimmt die freie Bewegung; S und W stärken weiterhin die Angriffsprobe.',check:'Keine zusätzliche Probe; der zugehörige Angriff wird normal gewürfelt.',limits:'Keine Bewegung durch besetzte Felder; einmal pro Runde.'},
    {id:'tech_light_melee_precise_thrust',code:'K3',skillId:'skill_1',name:'Gezielter Stich',tier:2,minLevel:5,staminaCost:1,activation:'Angriff · bei einem Treffer',effect:'Der Treffer ignoriert bis zu B Punkte Rüstung des Ziels.',scaling:'B wächst mit S; der Waffenschaden selbst bleibt unverändert.',check:'Normale Angriffs- und Verteidigungsprobe.',limits:'Nur gegen ein einzelnes Ziel und nur mit Stich-, Schnitt- oder präzise führbaren Waffen.'},
    {id:'tech_light_melee_riposte',code:'K4',skillId:'skill_1',name:'Riposte',tier:2,minLevel:5,staminaCost:1,activation:'Reaktion · nach erfolgreicher eigener Verteidigung',effect:'Führe sofort einen leichten Nahkampfangriff gegen den Angreifer aus. Bei einem Treffer verursacht er zusätzlich B Schaden.',scaling:'B erhöht den Zusatzschaden; die Gegenattacke verwendet W der leichten Nahkampffähigkeit.',check:'Die Gegenattacke wird normal gegen die Verteidigung des Angreifers gewürfelt.',limits:'Einmal pro Runde; keine weitere offensive Kampftechnik auf der Riposte.'},
    {id:'tech_light_melee_hamstring',code:'K5',skillId:'skill_1',name:'Sehnenschnitt',tier:3,minLevel:10,staminaCost:2,activation:'Angriff · bei einem Treffer',effect:'Der Treffer verursacht +B Schaden und senkt die Bewegung des Ziels für B Runden um B Felder.',scaling:'B bestimmt Schaden, Abzug und Dauer.',check:'Das Ziel kann den Bewegungseffekt mit einer Konstitutionsprobe gegen das Angriffsergebnis verhindern.',limits:'Wirkt nicht auf körperlose Ziele oder Wesen ohne verwundbare Gliedmaßen; einmal pro Ziel und Runde.'},
    {id:'tech_light_melee_double_strike',code:'K6',skillId:'skill_1',name:'Doppelschlag',tier:3,minLevel:10,staminaCost:2,activation:'Volle Angriffsaktion',effect:'Führe zwei Angriffe mit derselben leichten Waffe gegen ein Ziel aus. Der zweite Angriff erhält −2; der gesamte Zusatzschaden beider Treffer ist auf B begrenzt.',scaling:'W bestimmt beide Angriffsproben, B begrenzt zusätzlichen Schaden.',check:'Beide Angriffe werden getrennt verteidigt.',limits:'Keine weitere offensive Kampftechnik auf einem der beiden Angriffe; höchstens einmal pro Runde.'},
    {id:'tech_light_melee_blade_dance',code:'K7',skillId:'skill_1',name:'Klingenreigen',tier:4,minLevel:15,staminaCost:3,activation:'Volle Angriffsaktion',effect:'Greife bis zu B verschiedene angrenzende Ziele je einmal an. Jeder Angriff erhält −2 und verursacht normalen Waffenschaden.',scaling:'B bestimmt die Höchstzahl der Ziele; W bestimmt jede Angriffsprobe.',check:'Jedes Ziel verteidigt sich getrennt.',limits:'Kein Ziel darf mehrfach gewählt werden; keine weitere offensive Kampftechnik; einmal pro Runde.'},
    {id:'tech_light_melee_mortal_opening',code:'K8',skillId:'skill_1',name:'Tödliche Lücke',tier:5,minLevel:20,staminaCost:4,activation:'Angriff · nach einer um mindestens B gewonnenen Probe',effect:'Der Treffer verursacht zusätzlich 1 × W Schaden, höchstens W30, und ignoriert B Punkte Rüstung.',scaling:'W liefert den Spitzenwurf, B die nötige Erfolgsdifferenz und Rüstungsdurchdringung.',check:'Normale Angriffs- und Verteidigungsprobe; die Erfolgsdifferenz muss mindestens B betragen.',limits:'Einmal pro Kampf; nur ein Ziel; keine weitere offensive Kampftechnik.'},

    {id:'tech_heavy_melee_power_blow',code:'K1',skillId:'skill_2',name:'Wuchtschlag',tier:1,minLevel:1,staminaCost:1,activation:'Angriff · vor der Probe',effect:'Bei einem Treffer verursacht die schwere Waffe +B Schaden.',scaling:'B erhöht den Zusatzschaden; W bestimmt die Angriffsprobe.',check:'Normale Angriffs- und Verteidigungsprobe.',limits:'Bis zum Beginn deines nächsten Zuges erhältst du −1 auf aktive Verteidigung; einmal pro Runde.'},
    {id:'tech_heavy_melee_braced_stance',code:'K2',skillId:'skill_2',name:'Fester Stand',tier:1,minLevel:1,staminaCost:1,activation:'Reaktion · wenn du verschoben oder umgeworfen werden sollst',effect:'Verringere erzwungene Bewegung um B Felder und erhalte +B auf die Gegenprobe gegen Umwerfen.',scaling:'B stärkt Standfestigkeit und Gegenprobe.',check:'Nur wenn der auslösende Effekt eine Gegenprobe zulässt.',limits:'Endet sofort, wenn du dich freiwillig bewegst; einmal pro Runde.'},
    {id:'tech_heavy_melee_armor_breaker',code:'K3',skillId:'skill_2',name:'Rüstungsbrecher',tier:2,minLevel:5,staminaCost:1,activation:'Angriff · bei einem Treffer',effect:'Der Treffer ignoriert bis zu 2 × B Punkte Rüstung.',scaling:'B bestimmt die Rüstungsdurchdringung; der Waffenschaden bleibt unverändert.',check:'Normale Angriffs- und Verteidigungsprobe.',limits:'Nur mit einer zweihändigen oder als schwer geführten Waffe; einmal pro Runde.'},
    {id:'tech_heavy_melee_hook_and_shove',code:'K4',skillId:'skill_2',name:'Haken und Stoß',tier:2,minLevel:5,staminaCost:1,activation:'Angriff · nach einem Treffer',effect:'Verschiebe das Ziel bis zu B Felder von dir weg oder ein Feld zu dir heran.',scaling:'B bestimmt die maximale Stoßweite.',check:'Das Ziel kann mit Stärke oder Konstitution gegen dein Angriffsergebnis widerstehen.',limits:'Gegen deutlich größere Ziele ist die Distanz halbiert; keine Bewegung durch Hindernisse.'},
    {id:'tech_heavy_melee_overrun',code:'K5',skillId:'skill_2',name:'Niederwalzen',tier:3,minLevel:10,staminaCost:2,activation:'Bewegung und Angriff',effect:'Bewege dich bis zu B Felder geradlinig und greife ein Ziel am Ende an. Bei einem Treffer erhältst du +B Schaden und kannst das Ziel umwerfen.',scaling:'B bestimmt Anlauf und Zusatzschaden; W bestimmt die Angriffsprobe.',check:'Das Ziel verhindert das Umwerfen mit Konstitution gegen dein Angriffsergebnis.',limits:'Der Weg muss frei sein; keine weitere offensive Kampftechnik; einmal pro Runde.'},
    {id:'tech_heavy_melee_cleaving_blow',code:'K6',skillId:'skill_2',name:'Spalthieb',tier:3,minLevel:10,staminaCost:2,activation:'Volle Angriffsaktion',effect:'Bei einem Treffer verursachst du zusätzlich 1 × W / 2 Schaden, höchstens W20.',scaling:'W liefert den Zusatzwurf; der Höchstwürfel begrenzt extreme Stufen.',check:'Der Angriff erhält −2 und wird normal verteidigt.',limits:'Du darfst dich in diesem Zug vor dem Angriff höchstens ein Feld bewegen; einmal pro Runde.'},
    {id:'tech_heavy_melee_sweeping_arc',code:'K7',skillId:'skill_2',name:'Brechender Rundschlag',tier:4,minLevel:15,staminaCost:3,activation:'Volle Angriffsaktion',effect:'Greife bis zu B angrenzende Ziele mit je einem Angriff an. Treffer stoßen das Ziel zusätzlich ein Feld zurück.',scaling:'B bestimmt die Zielzahl; W bestimmt die einzelnen Angriffe.',check:'Alle Angriffe erhalten −3 und werden getrennt verteidigt.',limits:'Kein Ziel mehrfach; keine weitere offensive Kampftechnik; einmal pro Runde.'},
    {id:'tech_heavy_melee_titan_blow',code:'K8',skillId:'skill_2',name:'Titanenschlag',tier:5,minLevel:20,staminaCost:4,activation:'Volle Angriffsaktion',effect:'Bei einem Treffer verursacht die Waffe zusätzlich 1 × W Schaden, höchstens W36, ignoriert 2 × B Rüstung und stößt das Ziel B Felder zurück.',scaling:'W skaliert den Spitzenwurf, B Durchdringung und Stoßweite.',check:'Die Angriffsprobe ist um B erschwert; das Ziel verteidigt normal.',limits:'Einmal pro Kampf; du kannst dich in diesem Zug nicht freiwillig bewegen; keine weitere offensive Kampftechnik.'},

    {id:'tech_light_ranged_quick_shot',code:'K1',skillId:'skill_5',name:'Schnellschuss',tier:1,minLevel:1,staminaCost:1,activation:'Angriff · beim Bereitmachen oder Nachladen',effect:'Verringere die nötigen Nachladeaktionen um 1. Der folgende Angriff erhält einen Malus von höchstens 3 − B.',scaling:'B baut den Schnellschuss-Malus bis auf 0 ab; W bestimmt die Angriffsprobe.',check:'Normale Fernkampfangriffs- und Verteidigungsprobe.',limits:'Nachladezeit kann nicht unter 0 fallen; einmal pro Runde.'},
    {id:'tech_light_ranged_mobile_shot',code:'K2',skillId:'skill_5',name:'Schuss aus der Bewegung',tier:1,minLevel:1,staminaCost:1,activation:'Bewegung und Angriff',effect:'Verteile bis zu B Felder Bewegung frei vor und nach einem leichten Fernkampfangriff, ohne Bewegungsmalus auf diesen Angriff.',scaling:'B bestimmt die flexible Bewegung.',check:'Der Angriff wird normal mit W gewürfelt.',limits:'Keine Bewegung durch besetzte Felder; einmal pro Runde.'},
    {id:'tech_light_ranged_cover_splitter',code:'K3',skillId:'skill_5',name:'Deckungsbrecher',tier:2,minLevel:5,staminaCost:1,activation:'Angriff · vor der Probe',effect:'Verringere den Schutz oder Probenbonus aus Deckung für diesen Angriff um B.',scaling:'B bestimmt die überwundene Deckung.',check:'Normale Fernkampfangriffs- und Verteidigungsprobe.',limits:'Keine Wirkung gegen vollständig geschlossene Deckung; einmal pro Runde.'},
    {id:'tech_light_ranged_pin',code:'K4',skillId:'skill_5',name:'Fesselnder Treffer',tier:2,minLevel:5,staminaCost:1,activation:'Angriff · bei einem Treffer',effect:'Die Bewegung des Ziels sinkt für B Runden um B Felder.',scaling:'B bestimmt Abzug und Dauer.',check:'Das Ziel kann den Effekt mit Geschick oder Stärke gegen das Angriffsergebnis lösen; eine Aktion beendet ihn automatisch.',limits:'Benötigt geeignete Munition oder eine Wurfwaffe; wirkt nicht auf körperlose Ziele.'},
    {id:'tech_light_ranged_twin_shot',code:'K5',skillId:'skill_5',name:'Zwillingsschuss',tier:3,minLevel:10,staminaCost:2,activation:'Volle Angriffsaktion',effect:'Greife zwei Ziele an, die höchstens B Felder voneinander entfernt stehen. Beide Angriffe verursachen normalen Waffenschaden.',scaling:'B bestimmt den erlaubten Zielabstand; W bestimmt beide Angriffe.',check:'Beide Angriffe erhalten −2 und werden getrennt verteidigt.',limits:'Verbraucht zwei Geschosse; keine weitere offensive Kampftechnik; einmal pro Runde.'},
    {id:'tech_light_ranged_ricochet',code:'K6',skillId:'skill_5',name:'Abpraller',tier:3,minLevel:10,staminaCost:2,activation:'Angriff · vor der Probe',effect:'Der Schuss darf einmal an einer festen Fläche abgelenkt werden und ignoriert dadurch bis zu B Punkte Deckungsbonus.',scaling:'B bestimmt die überwundene Deckung; W bestimmt die Angriffsprobe.',check:'Der Angriff erhält −2; ungeeignete Munition kann nicht abprallen.',limits:'Eine klar erkennbare harte Fläche und eine plausible Bahn sind nötig; kein Angriff um vollständig geschlossene Räumecken.'},
    {id:'tech_light_ranged_arrow_rain',code:'K7',skillId:'skill_5',name:'Pfeilhagel',tier:4,minLevel:15,staminaCost:3,activation:'Volle Angriffsaktion',effect:'Greife bis zu B Ziele in einem Bereich von B Feldern Durchmesser je einmal an.',scaling:'B bestimmt Zielzahl und Bereich, W jeden einzelnen Angriff.',check:'Jeder Angriff erhält −3 und wird getrennt verteidigt.',limits:'Verbraucht ein Geschoss je Ziel; keine weitere offensive Kampftechnik; einmal pro Runde.'},
    {id:'tech_light_ranged_needle_eye',code:'K8',skillId:'skill_5',name:'Nadelöhr',tier:5,minLevel:20,staminaCost:4,activation:'Angriff · nach einer um mindestens B gewonnenen Probe',effect:'Der Treffer verursacht zusätzlich 1 × W / 2 Schaden, höchstens W25, ignoriert B Rüstung und darf bis zu S Felder außerhalb der normalen Reichweite liegen.',scaling:'W skaliert Schaden, B Präzision und Durchdringung, S die Zusatzreichweite.',check:'Der normale Entfernungsmalus bleibt bestehen; die Erfolgsdifferenz muss mindestens B betragen.',limits:'Einmal pro Kampf; nur ein Ziel; keine weitere offensive Kampftechnik.'},

    {id:'tech_heavy_ranged_steady_aim',code:'K1',skillId:'skill_6',name:'Ruhige Hand',tier:1,minLevel:1,staminaCost:1,activation:'Aktion · Zielen',effect:'Wenn du dich bis zu deinem nächsten Angriff nicht bewegst, erhält dieser Angriff +B.',scaling:'B bestimmt den Zielbonus; W bestimmt anschließend die Angriffsprobe.',check:'Der Bonus verfällt bei erzwungener oder freiwilliger Bewegung.',limits:'Nur der nächste schwere Fernkampfangriff innerhalb einer Runde profitiert.'},
    {id:'tech_heavy_ranged_piercing_shot',code:'K2',skillId:'skill_6',name:'Durchschuss',tier:1,minLevel:1,staminaCost:1,activation:'Angriff · bei einem Treffer',effect:'Der Treffer ignoriert bis zu B Punkte Rüstung.',scaling:'B bestimmt die Rüstungsdurchdringung.',check:'Normale Fernkampfangriffs- und Verteidigungsprobe.',limits:'Benötigt geeignete durchdringende Munition; einmal pro Runde.'},
    {id:'tech_heavy_ranged_long_shot',code:'K3',skillId:'skill_6',name:'Weitschuss',tier:2,minLevel:5,staminaCost:1,activation:'Angriff · vor der Probe',effect:'Erhöhe die maximale Reichweite der Waffe für diesen Angriff um S Felder.',scaling:'S bestimmt die Zusatzreichweite; W und B wirken auf die reguläre Probe.',check:'Entfernungsmali innerhalb der Zusatzreichweite sinken um B, nicht unter 0.',limits:'Freie Sichtlinie und ein unbewegtes Zielgebiet sind nötig; einmal pro Runde.'},
    {id:'tech_heavy_ranged_stopping_power',code:'K4',skillId:'skill_6',name:'Stoppwirkung',tier:2,minLevel:5,staminaCost:1,activation:'Angriff · bei einem Treffer',effect:'Unterbrich die aktuelle Bewegung des Ziels und stoße es bis zu B Felder zurück.',scaling:'B bestimmt die Stoßweite.',check:'Das Ziel widersteht mit Konstitution gegen das Angriffsergebnis.',limits:'Gegen deutlich größere Ziele ist die Distanz halbiert; keine Wirkung ohne passenden Geschosstyp.'},
    {id:'tech_heavy_ranged_overdraw',code:'K5',skillId:'skill_6',name:'Überziehen',tier:3,minLevel:10,staminaCost:2,activation:'Angriff · vor der Probe',effect:'Der Treffer verursacht +2 × B Schaden.',scaling:'B bestimmt den Zusatzschaden; W bestimmt die Angriffsprobe.',check:'Der Angriff wird normal verteidigt.',limits:'Die Waffe erhält danach +1 Nachladeaktion; keine weitere offensive Kampftechnik; einmal pro Runde.'},
    {id:'tech_heavy_ranged_line_breaker',code:'K6',skillId:'skill_6',name:'Linienbrecher',tier:3,minLevel:10,staminaCost:2,activation:'Volle Angriffsaktion',effect:'Nach einem Treffer darf das Geschoss ein zweites Ziel in derselben Linie innerhalb von B Feldern angreifen.',scaling:'B bestimmt den Abstand zum zweiten Ziel; W bestimmt beide Angriffe.',check:'Der zweite Angriff erhält −2 und wird getrennt verteidigt.',limits:'Beide Ziele müssen in einer geraden Schusslinie stehen; ein Geschoss; keine weitere offensive Kampftechnik.'},
    {id:'tech_heavy_ranged_suppressing_lane',code:'K7',skillId:'skill_6',name:'Sperrfeuer',tier:4,minLevel:15,staminaCost:3,activation:'Volle Angriffsaktion',effect:'Markiere bis zu deinem nächsten Zug eine Schusslinie von S Feldern Länge und B Feldern Breite. Bis zu B Gegner, die sie betreten oder darin handeln, können je einmal angegriffen werden.',scaling:'S bestimmt Länge, B Breite und maximale Reaktionsangriffe.',check:'Jeder Reaktionsangriff erhält −3 und wird normal verteidigt.',limits:'Benötigt B Geschosse oder eine entsprechend geladene Waffe; du kannst dich bis zum Ende nicht bewegen.'},
    {id:'tech_heavy_ranged_siege_shot',code:'K8',skillId:'skill_6',name:'Belagerungsschuss',tier:5,minLevel:20,staminaCost:4,activation:'Volle Angriffsaktion',effect:'Bei einem Treffer verursacht die Waffe zusätzlich 1 × W Schaden, höchstens W36, und ignoriert 3 × B Rüstung.',scaling:'W skaliert den Spitzenwurf, B die Rüstungsdurchdringung.',check:'Die Angriffsprobe ist um B erschwert und wird normal verteidigt.',limits:'Einmal pro Kampf; in diesem Zug keine Bewegung; +1 Nachladeaktion; keine weitere offensive Kampftechnik.'},

    {id:'tech_defense_intercept',code:'K1',skillId:'skill_7',name:'Abfangen',tier:1,minLevel:1,staminaCost:1,activation:'Reaktion · wenn du oder ein angrenzender Verbündeter angegriffen wird',effect:'Erhalte +B auf eine aktive Block- oder Paradeprobe gegen diesen Angriff.',scaling:'B bestimmt den Verteidigungsbonus; W bleibt der Würfel der Fähigkeit.',check:'Verteidigung & Blocken gegen das Angriffsergebnis.',limits:'Für einen Verbündeten musst du einen freien Schritt zu ihm ausführen können; einmal pro Runde.'},
    {id:'tech_defense_shield_angle',code:'K2',skillId:'skill_7',name:'Schildwinkel',tier:1,minLevel:1,staminaCost:1,activation:'Reaktion · nach erfolgreichem Block',effect:'Verringere den verbleibenden Schaden des geblockten Angriffs zusätzlich um B.',scaling:'B bestimmt die Schadensminderung.',check:'Keine zusätzliche Probe nach dem erfolgreichen Block.',limits:'Benötigt Schild oder geeignete Parierwaffe; Schaden kann nicht unter 0 sinken.'},
    {id:'tech_defense_guard_step',code:'K3',skillId:'skill_7',name:'Schutzschritt',tier:2,minLevel:5,staminaCost:1,activation:'Reaktion · Angriff auf einen Verbündeten',effect:'Bewege dich bis zu B Felder und werde selbst Ziel des Angriffs; du verteidigst mit W und erhältst +B.',scaling:'B bestimmt Bewegung und Bonus, W die Verteidigungsprobe.',check:'Verteidigung & Blocken gegen das ursprüngliche Angriffsergebnis.',limits:'Der Weg muss frei sein; einmal pro Runde; nicht gegen Flächenwirkungen.'},
    {id:'tech_defense_weapon_bind',code:'K4',skillId:'skill_7',name:'Waffenbindung',tier:2,minLevel:5,staminaCost:1,activation:'Reaktion · nach erfolgreicher Parade eines Nahkampfangriffs',effect:'Der Angreifer erhält −B auf seinen nächsten Angriff mit derselben Waffe.',scaling:'B bestimmt den Angriffsmalus.',check:'Der Angreifer kann mit Stärke gegen dein Verteidigungsergebnis widerstehen.',limits:'Endet spätestens nach B Runden; nicht gegen natürliche Waffen ohne greifbare Gliedmaßen.'},
    {id:'tech_defense_bulwark',code:'K5',skillId:'skill_7',name:'Bollwerk',tier:3,minLevel:10,staminaCost:2,activation:'Aktion · defensive Haltung',effect:'Bis zu deinem nächsten Zug erhalten du und bis zu B direkt hinter oder neben dir stehende Verbündete +B Rüstung gegen Angriffe aus deiner Front.',scaling:'B bestimmt Schutz und Zahl der Geschützten.',check:'Keine Probe beim Aktivieren; Angriffe werden weiterhin normal verteidigt.',limits:'Du darfst dich während der Haltung nicht freiwillig bewegen; gleiche Boni stapeln nicht.'},
    {id:'tech_defense_disarming_parry',code:'K6',skillId:'skill_7',name:'Entwaffnende Parade',tier:3,minLevel:10,staminaCost:2,activation:'Reaktion · nach einer um mindestens B gewonnenen Parade',effect:'Entwaffne den Angreifer oder verschiebe seine Waffe bis zu B Felder weit.',scaling:'B bestimmt nötige Erfolgsdifferenz und Entfernung.',check:'Der Angreifer kann mit Stärke gegen dein Verteidigungsergebnis widerstehen.',limits:'Nicht gegen fest montierte, natürliche oder deutlich größere Waffen; einmal pro Runde.'},
    {id:'tech_defense_unbroken_line',code:'K7',skillId:'skill_7',name:'Ungebrochene Linie',tier:4,minLevel:15,staminaCost:3,activation:'Aktion · Haltung',effect:'Für B Runden sinkt jeder erlittene körperliche Schaden nach Rüstung um B; außerdem erhältst du +B gegen Verschieben und Umwerfen.',scaling:'B bestimmt Dauer, Schadensminderung und Standfestigkeit.',check:'Keine Aktivierungsprobe.',limits:'Bewegung ist auf ein Feld pro Runde begrenzt; endet bei Bewusstlosigkeit; nicht mit Bollwerk stapelbar.'},
    {id:'tech_defense_absolute_guard',code:'K8',skillId:'skill_7',name:'Absolute Wacht',tier:5,minLevel:20,staminaCost:4,activation:'Reaktion · nach erfolgreichem Block',effect:'Verringere den verbleibenden Schaden eines Angriffs gegen dich oder einen angrenzenden Verbündeten um 1 × W, höchstens W30, und schütze zusätzlich bis zu B direkt angrenzende Ziele vor Folgeschaden derselben Wirkung.',scaling:'W bestimmt die Spitzenminderung, B die geschützte Gruppe.',check:'Der Block muss erfolgreich sein; keine weitere Probe.',limits:'Einmal pro Kampf; gegen Flächenwirkungen nur, wenn ein physischer Schutz plausibel ist.'},

    {id:'tech_dodge_sidestepping',code:'K1',skillId:'skill_8',name:'Seitenschritt',tier:1,minLevel:1,staminaCost:1,activation:'Reaktion · aktive Verteidigung',effect:'Erhalte +B auf eine Ausweichprobe gegen einen einzelnen Angriff.',scaling:'B bestimmt den Verteidigungsbonus; W bleibt der Würfel der Fähigkeit.',check:'Vermeiden & Ausweichen gegen das Angriffsergebnis.',limits:'Einmal pro Runde; nicht möglich, wenn du vollständig fixiert bist.'},
    {id:'tech_dodge_roll',code:'K2',skillId:'skill_8',name:'Abrollen',tier:1,minLevel:1,staminaCost:1,activation:'Reaktion · nach erfolgreichem Ausweichen',effect:'Bewege dich sofort bis zu B Felder, ohne durch den vermiedenen Angreifer eine Reaktion auszulösen.',scaling:'B bestimmt die freie Bewegung.',check:'Keine zusätzliche Probe nach erfolgreichem Ausweichen.',limits:'Der Weg muss frei sein; endet liegend, wenn die Umgebung kein sicheres Aufkommen erlaubt.'},
    {id:'tech_dodge_low_profile',code:'K3',skillId:'skill_8',name:'Tief abtauchen',tier:2,minLevel:5,staminaCost:1,activation:'Reaktion · gegen einen Fernkampfangriff',effect:'Erhalte +B auf die Ausweichprobe und bewege dich nach Erfolg ein Feld in erreichbare Deckung.',scaling:'B bestimmt den Verteidigungsbonus; W die Probe.',check:'Vermeiden & Ausweichen gegen den Fernkampfangriff.',limits:'Es muss innerhalb eines Feldes eine plausible Deckung geben; einmal pro Runde.'},
    {id:'tech_dodge_gap_runner',code:'K4',skillId:'skill_8',name:'Lückenlauf',tier:2,minLevel:5,staminaCost:1,activation:'Bewegung',effect:'Bis zu B Felder deiner Bewegung lösen keine Reaktionen durch Verlassen eines bedrohten Bereichs aus.',scaling:'B bestimmt die geschützte Bewegung.',check:'Bei besonders engem Gelände kann eine normale Ausweichprobe verlangt werden.',limits:'Keine Bewegung durch besetzte Felder oder feste Hindernisse; einmal pro Runde.'},
    {id:'tech_dodge_false_step',code:'K5',skillId:'skill_8',name:'Täuschschritt',tier:3,minLevel:10,staminaCost:2,activation:'Aktion · zu Beginn deines Zuges',effect:'Für B Runden erhält der erste gegen dich gerichtete körperliche Angriff jeder Runde −B.',scaling:'B bestimmt Malus und Dauer.',check:'Keine Aktivierungsprobe; Angriffe werden danach normal verteidigt.',limits:'Endet, wenn du dich freiwillig nicht bewegen kannst; gleiche Effekte stapeln nicht.'},
    {id:'tech_dodge_dancing_retreat',code:'K6',skillId:'skill_8',name:'Tänzerischer Rückzug',tier:3,minLevel:10,staminaCost:2,activation:'Reaktion · nach erfolgreichem Ausweichen',effect:'Bewege dich nach jedem erfolgreichen Ausweichen ein Feld, insgesamt höchstens B Felder pro Runde.',scaling:'B bestimmt die maximale Rückzugsbewegung; W bestimmt jede Ausweichprobe.',check:'Keine zusätzliche Probe.',limits:'Der Weg muss frei sein; endet, sobald du freiwillig stehenbleibst oder fixiert wirst.'},
    {id:'tech_dodge_untouchable',code:'K7',skillId:'skill_8',name:'Unfassbar',tier:4,minLevel:15,staminaCost:3,activation:'Reaktion · gegen eine körperliche Flächenwirkung',effect:'Erhalte +B auf die Ausweichprobe. Bei Erfolg erleidest du keinen Schaden, bei Misserfolg nur die Hälfte.',scaling:'B bestimmt den Bonus, W die Ausweichprobe.',check:'Vermeiden & Ausweichen gegen den Schwierigkeitswert oder das Angriffsergebnis der Fläche.',limits:'Einmal pro Runde; nur wenn ein erreichbarer sicherer Rand oder Zwischenraum existiert.'},
    {id:'tech_dodge_between_moments',code:'K8',skillId:'skill_8',name:'Zwischen den Augenblicken',tier:5,minLevel:20,staminaCost:4,activation:'Reaktion · nach misslungener Ausweichprobe',effect:'Wiederhole die Probe einmal mit W und +B. Bei Erfolg darfst du dich zusätzlich bis zu B Felder bewegen.',scaling:'W skaliert den Wiederholungswurf, B Bonus und Bewegung.',check:'Die Wiederholung richtet sich gegen dasselbe Angriffsergebnis.',limits:'Einmal pro Kampf; nicht gegen Wirkungen ohne mögliche Ausweichprobe.'}
  ]
};

const COMBAT_TECHNIQUE_ENTRIES_V176=COMBAT_TECHNIQUE_DB_V176.entries;
const COMBAT_TECHNIQUE_SCHOOLS_V176=COMBAT_TECHNIQUE_DB_V176.schools;
const COMBAT_TECHNIQUE_BY_ID_V176=new Map(COMBAT_TECHNIQUE_ENTRIES_V176.map(entry=>[entry.id,entry]));
const COMBAT_TECHNIQUE_SKILL_IDS_V176=new Set(COMBAT_TECHNIQUE_SCHOOLS_V176.map(school=>school.skillId));
const COMBAT_TECHNIQUE_TIER_LABELS_V176={1:'Grad I',2:'Grad II',3:'Grad III',4:'Grad IV',5:'Grad V'};

function validateCombatTechniqueCatalogV176(){
  const errors=[],ids=new Set(),expectedSkills=new Set(['skill_1','skill_2','skill_5','skill_6','skill_7','skill_8']);
  if(COMBAT_TECHNIQUE_SCHOOLS_V176.length!==6)errors.push(`6 Kampfstile erwartet, ${COMBAT_TECHNIQUE_SCHOOLS_V176.length} gefunden`);
  if(COMBAT_TECHNIQUE_ENTRIES_V176.length!==48)errors.push(`48 Kampftechniken erwartet, ${COMBAT_TECHNIQUE_ENTRIES_V176.length} gefunden`);
  for(const school of COMBAT_TECHNIQUE_SCHOOLS_V176){
    if(!expectedSkills.has(school.skillId))errors.push(`Unbekannter Kampfskill ${school.skillId}`);
    const skill=SKILLS.find(entry=>entry.id===school.skillId);
    if(skill?.name!==school.skillName)errors.push(`${school.skillId}: Skillname stimmt nicht überein`);
    const entries=COMBAT_TECHNIQUE_ENTRIES_V176.filter(entry=>entry.skillId===school.skillId);
    if(entries.length!==8)errors.push(`${school.skillName}: 8 Techniken erwartet`);
    if(entries.map(entry=>entry.code).join('|')!=='K1|K2|K3|K4|K5|K6|K7|K8')errors.push(`${school.skillName}: K1 bis K8 unvollständig`);
    if(entries.map(entry=>entry.minLevel).join('|')!=='1|1|5|5|10|10|15|20')errors.push(`${school.skillName}: Freischaltstufen fehlerhaft`);
  }
  for(const entry of COMBAT_TECHNIQUE_ENTRIES_V176){
    if(!entry.id||ids.has(entry.id))errors.push(`Doppelte oder leere Technik-ID: ${entry.id||'—'}`);
    ids.add(entry.id);
    if(!COMBAT_TECHNIQUE_SKILL_IDS_V176.has(entry.skillId))errors.push(`${entry.id}: falscher Kampfskill`);
    if(COMBAT_TECHNIQUE_DB_V176.tierLevels[entry.tier]!==entry.minLevel)errors.push(`${entry.id}: Grad und Mindeststufe widersprechen sich`);
    if(![entry.effect,entry.scaling].some(text=>/(^|[^A-Za-zÄÖÜäöüß])[WSB](?=[^A-Za-zÄÖÜäöüß]|$)/.test(text)))errors.push(`${entry.id}: keine W/B/S-Skalierung`);
    if(!entry.activation||!entry.effect||!entry.check||!entry.limits)errors.push(`${entry.id}: Regeltext unvollständig`);
  }
  return{ok:errors.length===0,errors,ids:ids.size};
}
const COMBAT_TECHNIQUE_VALIDATION_V176=validateCombatTechniqueCatalogV176();
if(!COMBAT_TECHNIQUE_VALIDATION_V176.ok)showError('Kampftechnik-Katalog fehlerhaft: '+COMBAT_TECHNIQUE_VALIDATION_V176.errors.join(' · '));

const combatTechniqueStyleV176=el('style',{text:`
.combat-tech-library-v176{margin-top:1.1rem;padding-top:1rem;border-top:3px double var(--accent-2)}
.combat-tech-head-v176{display:flex;align-items:flex-start;justify-content:space-between;gap:.7rem;flex-wrap:wrap}
.combat-tech-head-v176 h3{margin:.1rem 0}.combat-tech-head-v176 p{margin:.15rem 0}
.combat-tech-rules-v176{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.45rem;margin:.7rem 0}
.combat-tech-rule-v176{padding:.55rem;border:1px solid var(--border);border-radius:9px;background:var(--panel-alt)}
.combat-tech-rule-v176 strong{display:block;margin-bottom:.2rem}
.combat-tech-group-v176>summary{border-left:4px solid var(--accent)}
.combat-tech-locked-v176{opacity:.72}.combat-tech-preview-v176{grid-column:1/-1}
.combat-tech-formula-v176{font-family:var(--font-number)}
@media(max-width:760px){.combat-tech-rules-v176{grid-template-columns:1fr}.combat-tech-preview-v176{grid-column:auto}}
@media print{.combat-tech-rules-v176,.combat-tech-select-v176,.combat-tech-empty-v176,.combat-tech-library-v176 .power-actions-v176{display:none!important}.combat-tech-group-v176.has-no-learned{display:none!important}.combat-tech-library-v176{break-before:auto}.combat-tech-group-v176{break-inside:avoid}}
`});
document.head.append(combatTechniqueStyleV176);

function combatTechniqueCapacityV176(owner,skillId){
  const level=Math.max(0,+owner?.skills?.[skillId]?.level||0);
  return COMBAT_TECHNIQUE_DB_V176.unlockLevels.filter(threshold=>level>=threshold).length;
}

function combatTechniquesForSkillV176(skillId){
  return COMBAT_TECHNIQUE_ENTRIES_V176.filter(entry=>entry.skillId===skillId).sort((a,b)=>Number(a.code.slice(1))-Number(b.code.slice(1)));
}

function normalizeCombatTechniqueSkillV176(data){
  const value=data&&typeof data==='object'&&!Array.isArray(data)?data:{};
  const ids=Array.isArray(value.learnedTechniqueIds)?value.learnedTechniqueIds.filter(id=>typeof id==='string'&&id.trim()):[];
  value.learnedTechniqueIds=[...new Set(ids)];
  return value;
}

function ensureOwnerCombatTechniquesV176(owner){
  if(!owner||typeof owner!=='object'||owner.type==='possession')return owner;
  ensureOwnerSkillsR13(owner);
  for(const skillId of COMBAT_TECHNIQUE_SKILL_IDS_V176)owner.skills[skillId]=normalizeCombatTechniqueSkillV176(owner.skills[skillId]);
  return owner;
}

function learnedCombatTechniqueIdsV176(owner,skillId){
  ensureOwnerCombatTechniquesV176(owner);
  return owner.skills[skillId].learnedTechniqueIds;
}

function canLearnCombatTechniqueV176(owner,skillId,techniqueId){
  ensureOwnerCombatTechniquesV176(owner);
  const entry=COMBAT_TECHNIQUE_BY_ID_V176.get(techniqueId),data=owner.skills[skillId],level=+data.level||0;
  return!!entry&&entry.skillId===skillId&&!data.learnedTechniqueIds.includes(techniqueId)&&level>=entry.minLevel&&data.learnedTechniqueIds.length<combatTechniqueCapacityV176(owner,skillId);
}

function learnCombatTechniqueV176(owner,skillId,techniqueId){
  if(!canLearnCombatTechniqueV176(owner,skillId,techniqueId))return false;
  owner.skills[skillId].learnedTechniqueIds.push(techniqueId);
  return true;
}

function unlearnCombatTechniqueV176(owner,skillId,techniqueId){
  ensureOwnerCombatTechniquesV176(owner);
  const ids=owner.skills[skillId].learnedTechniqueIds,index=ids.indexOf(techniqueId);
  if(index<0)return false;
  ids.splice(index,1);
  return true;
}

function techniqueIdsKeptAtLevelV176(owner,skillId,nextLevel){
  const capacity=COMBAT_TECHNIQUE_DB_V176.unlockLevels.filter(threshold=>nextLevel>=threshold).length,ids=learnedCombatTechniqueIdsV176(owner,skillId),kept=[];
  for(const id of ids){
    const entry=COMBAT_TECHNIQUE_BY_ID_V176.get(id);
    if(!entry||entry.skillId!==skillId||entry.minLevel>nextLevel||kept.length>=capacity)continue;
    kept.push(id);
  }
  return kept;
}

const setPurchasedSkillLevelBeforeCombatV176=setPurchasedSkillLevelV176;
setPurchasedSkillLevelV176=function(owner,skillId,nextLevel,confirmRemoval=message=>confirm(message)){
  if(!COMBAT_TECHNIQUE_SKILL_IDS_V176.has(skillId))return setPurchasedSkillLevelBeforeCombatV176(owner,skillId,nextLevel,confirmRemoval);
  ensureOwnerCombatTechniquesV176(owner);
  const previous=+owner.skills[skillId].level||0,next=Math.max(0,Math.min(25,+nextLevel||0)),ids=[...owner.skills[skillId].learnedTechniqueIds],kept=techniqueIdsKeptAtLevelV176(owner,skillId,next),removed=ids.filter(id=>!kept.includes(id));
  if(next<previous&&removed.length){
    const labels=removed.map(id=>COMBAT_TECHNIQUE_BY_ID_V176.get(id)?.name||id);
    if(!confirmRemoval(`Durch die niedrigere Stufe werden zuletzt gelernte oder nicht mehr freigeschaltete Kampftechniken entfernt:\n\n${labels.map(label=>'• '+label).join('\n')}\n\nÄnderung übernehmen?`))return false;
  }
  if(!setPurchasedSkillLevelBeforeCombatV176(owner,skillId,next,confirmRemoval))return false;
  owner.skills[skillId].learnedTechniqueIds=kept;
  return true;
};

function ensureCombatTechniqueStateV176(data,log=true){
  const first=!data.v176CombatTechniquesR9Done;
  for(const character of data.characters||[]){
    ensureOwnerCombatTechniquesV176(character);
    for(const owner of character.auxiliaryTabs||[])ensureOwnerCombatTechniquesV176(owner);
  }
  data.v176CombatTechniquesR9Done=true;
  if(first&&log){
    data.migrationLog=Array.isArray(data.migrationLog)?data.migrationLog:[];
    data.migrationLog.push({from:14,to:14,at:new Date().toISOString(),changes:['48 skalierende Kampftechniken für sechs Kampfskills ergänzt','Freischaltung über sechs Meilensteine der gekauften Fähigkeitsstufe ergänzt','Kampftechniken verwenden W, B und S sowie gestaffelte Ausdauerkosten']});
  }
  return data;
}

const migrateStateBeforeCombatV176=migrateState;
migrateState=function(data){return ensureCombatTechniqueStateV176(migrateStateBeforeCombatV176(data),true)};
if(!state.v176CombatTechniquesR9Done){try{localStorage.setItem(STORE+'.backup.v176-r9.'+Date.now(),JSON.stringify(state))}catch{}}
state=ensureCombatTechniqueStateV176(state,true);

const newCharacterBeforeCombatV176=newCharacter,newAuxEntryBeforeCombatV176=newAuxEntry;
newCharacter=function(){return ensureOwnerCombatTechniquesV176(newCharacterBeforeCombatV176())};
newAuxEntry=function(type,name){const owner=newAuxEntryBeforeCombatV176(type,name);return type==='possession'?owner:ensureOwnerCombatTechniquesV176(owner)};

function combatTechniqueFormulaV176(value,owner,skillId){
  return formatRuleTextV176(value,effectiveSkillLevelV176(owner,skillId));
}

function combatTechniqueDetailSectionV176(title,value,className=''){
  return el('section',{class:'power-detail-section-v176 '+className},[el('h4',{text:title}),el('p',{text:String(value||'—')})]);
}

function combatTechniqueInfoContentV176(entry,owner){
  const s=effectiveSkillLevelV176(owner,entry.skillId),b=bonusValueV176(s),w=dieValueV176(s),box=el('div',{class:'power-detail-v176'}),current=el('div',{class:'power-current-v176'});
  current.append(
    el('span',{class:'power-badge-v176',text:`S ${s}`}),
    el('span',{class:'power-badge-v176',text:`W ${w}`}),
    el('span',{class:'power-badge-v176',text:`B ${b}`}),
    el('span',{class:'power-badge-v176',text:COMBAT_TECHNIQUE_TIER_LABELS_V176[entry.tier]}),
    el('span',{class:'power-badge-v176',text:`ab Kaufstufe ${entry.minLevel}`}),
    el('span',{class:'power-badge-v176',text:`${entry.staminaCost} A`})
  );
  const grid=el('div',{class:'power-detail-grid-v176'});
  grid.append(
    combatTechniqueDetailSectionV176('Aktivierung',entry.activation),
    combatTechniqueDetailSectionV176('Wirkung (W/B/S-Formel)',entry.effect,'combat-tech-formula-v176'),
    combatTechniqueDetailSectionV176('Wirkung aktuell',combatTechniqueFormulaV176(entry.effect,owner,entry.skillId)),
    combatTechniqueDetailSectionV176('Skalierung',entry.scaling),
    combatTechniqueDetailSectionV176('Probe / Gegenwehr',combatTechniqueFormulaV176(entry.check,owner,entry.skillId)),
    combatTechniqueDetailSectionV176('Regeln & Grenzen',combatTechniqueFormulaV176(entry.limits,owner,entry.skillId))
  );
  box.append(current,grid);return box;
}

function combatTechniqueShortTextV176(entry,owner){
  return combatTechniqueFormulaV176(entry.effect,owner,entry.skillId);
}

function renderLearnedCombatTechniqueV176(owner,skillId,techniqueId){
  const entry=COMBAT_TECHNIQUE_BY_ID_V176.get(techniqueId);
  if(!entry)return el('article',{class:'power-row-v176 power-warning-v176'},[el('span',{class:'power-code-v176',text:'?'}),el('div',{class:'power-name-v176'},[el('strong',{text:'Unbekannte Kampftechnik'}),el('small',{text:techniqueId})])]);
  const row=el('article',{class:'power-row-v176'}),detail=el('div',{class:'power-inline-detail-v176',hidden:true}),info=el('button',{type:'button',text:'Details','aria-expanded':'false'}),remove=el('button',{class:'danger',type:'button',text:'Entfernen'});
  info.onclick=()=>{const opening=detail.hidden;detail.hidden=!opening;info.setAttribute('aria-expanded',String(opening));info.textContent=opening?'Details schließen':'Details';if(opening&&!detail.childNodes.length)detail.append(combatTechniqueInfoContentV176(entry,owner))};
  remove.onclick=()=>{if(confirm(`„${entry.name}“ wirklich verlernen?`)){unlearnCombatTechniqueV176(owner,skillId,techniqueId);persistCombatTechniqueLibraryV176(owner)}};
  row.append(
    el('span',{class:'power-code-v176',text:entry.code}),
    el('div',{class:'power-name-v176'},[el('strong',{text:entry.name}),el('small',{text:`${COMBAT_TECHNIQUE_TIER_LABELS_V176[entry.tier]} · ${entry.staminaCost} A`})]),
    el('span',{class:'power-summary-v176',text:combatTechniqueShortTextV176(entry,owner)}),
    el('div',{class:'power-actions-v176'},[info,remove]),detail
  );
  return row;
}

function renderCombatTechniqueSelectionV176(owner,school,slotIndex){
  const learned=new Set(learnedCombatTechniqueIdsV176(owner,school.skillId)),available=combatTechniquesForSkillV176(school.skillId).filter(entry=>!learned.has(entry.id)),level=+owner.skills[school.skillId].level||0,select=el('select',{'aria-label':`Kampftechnik für ${school.skillName} wählen`}),preview=el('div',{class:'power-select-detail-v176 combat-tech-preview-v176'},[el('p',{class:'power-select-preview-v176',text:'Wähle eine Technik. Auch noch gesperrte Grade können hier vorab angesehen werden.'})]),button=el('button',{class:'primary',type:'button',text:'Lernen',disabled:true});
  select.append(el('option',{value:'',text:`Freier Technikplatz ${slotIndex+1} · Technik wählen…`}));
  for(const entry of available){
    const locked=level<entry.minLevel;
    select.append(el('option',{value:entry.id,text:`${entry.code} · ${entry.name} · ${COMBAT_TECHNIQUE_TIER_LABELS_V176[entry.tier]} · ${entry.staminaCost} A${locked?` · gesperrt bis S ${entry.minLevel}`:''}`}));
  }
  select.onchange=()=>{
    const entry=COMBAT_TECHNIQUE_BY_ID_V176.get(select.value),allowed=entry&&canLearnCombatTechniqueV176(owner,school.skillId,entry.id);
    button.disabled=!allowed;
    preview.replaceChildren(entry?combatTechniqueInfoContentV176(entry,owner):el('p',{class:'power-select-preview-v176',text:'Wähle eine Technik. Auch noch gesperrte Grade können hier vorab angesehen werden.'}));
    if(entry&&!allowed)preview.prepend(el('p',{class:'notice',text:`Noch gesperrt: ${entry.name} benötigt die gekaufte Fähigkeitsstufe ${entry.minLevel}.`}))
  };
  button.onclick=()=>{if(learnCombatTechniqueV176(owner,school.skillId,select.value))persistCombatTechniqueLibraryV176(owner)};
  return el('section',{class:'power-select-row-v176 combat-tech-select-v176'},[el('label',{class:'field'},[el('span',{text:'Neue Kampftechnik wählen'}),select]),button,preview]);
}

function renderCombatTechniqueLibraryV176(owner){
  ensureOwnerCombatTechniquesV176(owner);
  const box=el('section',{class:'combat-tech-library-v176','data-owner-id':owner.id||''}),head=el('div',{class:'combat-tech-head-v176'});
  head.append(el('div',{},[el('h3',{text:'Kampftechniken'}),el('p',{class:'muted',text:'Erlernte Manöver skalieren automatisch mit der wirksamen Stufe des zugehörigen Kampfskills.'})]),el('span',{class:'power-badge-v176',text:`Katalog ${COMBAT_TECHNIQUE_DB_V176.meta.catalogVersion} · 6 Stile · 48 Techniken`}));
  const rules=el('div',{class:'combat-tech-rules-v176'},[
    el('div',{class:'combat-tech-rule-v176'},[el('strong',{text:'Freischaltung'}),el('span',{text:'Je ein Lernplatz auf Kaufstufe 1, 5, 10, 15, 20 und 25; maximal 6 aus 8 Techniken je Kampfskill.'})]),
    el('div',{class:'combat-tech-rule-v176'},[el('strong',{text:'Skalierung'}),el('span',{text:'S = wirksame Stufe, W = Stufenwürfel, B = Stufenbonus 1–5. Negative Modifikatoren nehmen keine Lernplätze weg.'})]),
    el('div',{class:'combat-tech-rule-v176'},[el('strong',{text:'Einsatz & Balance'}),el('span',{text:'Lernen kostet keine zusätzlichen CBP. Aktivierung kostet A zusätzlich zu Waffen- oder Aktionskosten. Pro Angriff nur eine offensive Technik.'})])
  ]),list=el('div',{class:'power-skill-list-v176'});
  for(const school of COMBAT_TECHNIQUE_SCHOOLS_V176){
    const data=owner.skills[school.skillId],learned=data.learnedTechniqueIds||[],capacity=combatTechniqueCapacityV176(owner,school.skillId),free=Math.max(0,capacity-learned.length),s=effectiveSkillLevelV176(owner,school.skillId),b=bonusValueV176(s),w=dieValueV176(s),group=el('details',{class:'power-skill-group-v176 combat-tech-group-v176 '+(learned.length?'':'has-no-learned'),open:capacity>0||learned.length>0}),summary=el('summary');
    summary.append(el('span',{text:school.skillName}),el('span',{class:'power-skill-meta-v176'},[
      el('span',{class:'power-badge-v176',text:`Gelernt ${learned.length}/${capacity}`}),
      el('span',{class:'power-badge-v176',text:`S ${s}`}),
      el('span',{class:'power-badge-v176',text:w}),
      el('span',{class:'power-badge-v176',text:`B ${b}`})
    ]));
    const body=el('div',{class:'power-group-body-v176'});
    for(const techniqueId of learned)body.append(renderLearnedCombatTechniqueV176(owner,school.skillId,techniqueId));
    for(let index=0;index<free;index++)body.append(renderCombatTechniqueSelectionV176(owner,school,index));
    if(!capacity&&!learned.length)body.append(el('p',{class:'muted combat-tech-empty-v176',text:'Kaufstufe 1 schaltet den ersten Technikplatz und Grad I frei.'}));
    const next=COMBAT_TECHNIQUE_DB_V176.unlockLevels.find(level=>level>(+data.level||0));
    if(capacity&&next)body.append(el('p',{class:'muted combat-tech-empty-v176',text:`Nächster Lernplatz auf Kaufstufe ${next}. Neue Grade: II ab 5, III ab 10, IV ab 15, V ab 20.`}));
    group.append(summary,body);list.append(group);
  }
  box.append(head,rules,list);return box;
}

function currentCombatTechniqueLibraryV176(owner){
  return[...document.querySelectorAll('.combat-tech-library-v176')].find(node=>node.dataset.ownerId===(owner.id||''))||null;
}

function replaceCombatTechniqueLibraryV176(owner){
  const current=currentCombatTechniqueLibraryV176(owner);
  if(!current)return false;
  current.replaceWith(renderCombatTechniqueLibraryV176(owner));
  return true;
}

function persistCombatTechniqueLibraryV176(owner){
  const current=currentCombatTechniqueLibraryV176(owner);
  preserveViewportV176(current,()=>{persistOwnerR5(owner,false);replaceCombatTechniqueLibraryV176(owner)},()=>currentCombatTechniqueLibraryV176(owner));
}

const renderSkillsOwnerBeforeCombatV176=renderSkillsOwnerR5;
renderSkillsOwnerR5=function(owner,isAux=false){
  ensureOwnerCombatTechniquesV176(owner);
  const box=renderSkillsOwnerBeforeCombatV176(owner,isAux),library=renderCombatTechniqueLibraryV176(owner);
  box.append(library);
  for(const input of box.querySelectorAll('tbody .skill-level')){
    const row=input.closest('tr'),name=row?.querySelector('.skill-name-r13 strong')?.textContent,skill=SKILLS.find(entry=>entry.name===name);
    if(!skill||!COMBAT_TECHNIQUE_SKILL_IDS_V176.has(skill.id))continue;
    const before=input.onchange;
    input.onchange=event=>{before?.call(input,event);replaceCombatTechniqueLibraryV176(owner)};
  }
  return box;
};
renderSkills=function(){return renderSkillsOwnerR5(ch(),false)};
renderAuxSkillsV17=function(owner){return renderSkillsOwnerR5(owner,true)};

const auditBeforeCombatV176=audit;
audit=function(){
  auditBeforeCombatV176();
  auditResults.append(el('h3',{text:'Kampftechniken'}));
  auditResults.append(el('div',{class:'notice '+(COMBAT_TECHNIQUE_VALIDATION_V176.ok?'ok':'error'),text:`${COMBAT_TECHNIQUE_VALIDATION_V176.ok?'✓':'✕'} Katalog: ${COMBAT_TECHNIQUE_ENTRIES_V176.length} Techniken · ${COMBAT_TECHNIQUE_SCHOOLS_V176.length} Kampfstile · Freischaltungen S 1/5/10/15/20/25`}));
  const owners=[ch(),...(ch().auxiliaryTabs||[]).filter(owner=>owner.type!=='possession')];
  for(const owner of owners){
    ensureOwnerCombatTechniquesV176(owner);
    const issues=[];
    for(const skillId of COMBAT_TECHNIQUE_SKILL_IDS_V176){
      const ids=learnedCombatTechniqueIdsV176(owner,skillId),capacity=combatTechniqueCapacityV176(owner,skillId),level=+owner.skills[skillId].level||0;
      if(ids.length>capacity)issues.push(`${SKILLS.find(skill=>skill.id===skillId)?.name}: ${ids.length}/${capacity} Lernplätze`);
      for(const id of ids){const entry=COMBAT_TECHNIQUE_BY_ID_V176.get(id);if(!entry)issues.push(`unbekannte Technik ${id}`);else if(entry.skillId!==skillId||entry.minLevel>level)issues.push(`${entry.name}: Stufe ${level}/${entry.minLevel}`)}
    }
    auditResults.append(el('div',{class:'notice '+(!issues.length?'ok':''),text:`${!issues.length?'✓':'⚠'} ${owner.name||owner.type||'Charakter'}: ${issues.length?issues.join(' · '):'Kampftechnik-Daten gültig'}`}));
  }
};

const runTestsBeforeCombatV176=runTests;
runTests=function(){
  const baseOk=runTestsBeforeCombatV176(),tests=[],eq=(name,expected,actual)=>tests.push([name,expected,actual,expected===actual]);
  eq('Kampftechnik-Katalog validiert',true,COMBAT_TECHNIQUE_VALIDATION_V176.ok);
  eq('48 Kampftechniken',48,COMBAT_TECHNIQUE_ENTRIES_V176.length);
  eq('Sechs Kampfstile',6,COMBAT_TECHNIQUE_SCHOOLS_V176.length);
  eq('Je acht Kampftechniken',true,COMBAT_TECHNIQUE_SCHOOLS_V176.every(school=>combatTechniquesForSkillV176(school.skillId).length===8));
  eq('Technikplätze S 0/1/5/10/15/20/25','0|1|2|3|4|5|6',[0,1,5,10,15,20,25].map(level=>{const owner=newCharacter();owner.skills.skill_1.level=level;return combatTechniqueCapacityV176(owner,'skill_1')}).join('|'));
  const learner=newCharacter(),light=combatTechniquesForSkillV176('skill_1');
  learner.skills.skill_1.level=1;
  eq('Grad I auf S1 lernbar',true,learnCombatTechniqueV176(learner,'skill_1',light[0].id));
  eq('Nur ein Platz auf S1',false,learnCombatTechniqueV176(learner,'skill_1',light[1].id));
  eq('Grad II auf S1 gesperrt',false,canLearnCombatTechniqueV176(learner,'skill_1',light[2].id));
  learner.skills.skill_1.level=5;
  eq('Grad II auf S5 lernbar',true,learnCombatTechniqueV176(learner,'skill_1',light[2].id));
  learner.skills.skill_1.level=20;
  learnCombatTechniqueV176(learner,'skill_1',light[4].id);learnCombatTechniqueV176(learner,'skill_1',light[6].id);learnCombatTechniqueV176(learner,'skill_1',light[7].id);
  const before=learner.skills.skill_1.learnedTechniqueIds.join('|');
  eq('Technikverlust bei Senkung abbrechbar',false,setPurchasedSkillLevelV176(learner,'skill_1',10,()=>false));
  eq('Abbruch bewahrt Techniken',before,learner.skills.skill_1.learnedTechniqueIds.join('|'));
  eq('Bestätigte Senkung entfernt gesperrte Techniken',true,setPurchasedSkillLevelV176(learner,'skill_1',10,()=>true));
  eq('Nach Senkung drei gültige Technikplätze',3,learner.skills.skill_1.learnedTechniqueIds.length);
  const formulaOwner=newCharacter();formulaOwner.skills.skill_2.level=16;
  eq('Technikformel löst S/W/B auf','Bei einem Treffer verursacht die schwere Waffe +4 Schaden.',combatTechniqueFormulaV176(combatTechniquesForSkillV176('skill_2')[0].effect,formulaOwner,'skill_2'));
  const uiOwner=newCharacter();uiOwner.skills.skill_1.level=1;const ui=renderCombatTechniqueLibraryV176(uiOwner);
  eq('UI zeigt alle sechs Kampfskills',true,COMBAT_TECHNIQUE_SCHOOLS_V176.every(school=>ui.textContent.includes(school.skillName)));
  eq('UI erklärt Freischaltung',true,ui.textContent.includes('Kaufstufe 1, 5, 10, 15, 20 und 25'));
  eq('UI zeigt W/B/S-Regel',true,ui.textContent.includes('S = wirksame Stufe')&&ui.textContent.includes('W = Stufenwürfel')&&ui.textContent.includes('B = Stufenbonus'));
  const selection=ui.querySelector('select[aria-label="Kampftechnik für Nahkampf – leichte Waffen wählen"]');
  eq('Auswahl enthält alle acht Techniken',9,selection?.options.length);
  const npc=newAuxEntry('npc','Technik-NPC');
  eq('NPC speichert Kampftechniken',true,Array.isArray(npc.skills.skill_7.learnedTechniqueIds));
  eq('Migration r9 markiert',true,ensureCombatTechniqueStateV176({characters:[newCharacter()],migrationLog:[]},false).v176CombatTechniquesR9Done);
  const body=testResults.querySelector('tbody');
  for(const[name,expected,actual,ok]of tests)body.append(el('tr',{},[name,expected,actual,ok?'Bestanden':'Fehler'].map(value=>el('td',{text:String(value)}))));
  return baseOk&&tests.every(test=>test[3]);
};

testsBtn.onclick=runTests;
Object.assign(window.Eberos,{
  runTests:()=>runTests(),
  combatTechniqueDb:COMBAT_TECHNIQUE_DB_V176,
  combatTechniqueValidation:COMBAT_TECHNIQUE_VALIDATION_V176,
  combatTechniqueCapacity:combatTechniqueCapacityV176,
  learnCombatTechnique:learnCombatTechniqueV176,
  unlearnCombatTechnique:unlearnCombatTechniqueV176,
  canLearnCombatTechnique:canLearnCombatTechniqueV176,
  ensureCombatTechniqueStateV176,
  setPurchasedSkillLevel:setPurchasedSkillLevelV176
});

save();
renderAll();
