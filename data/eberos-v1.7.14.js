'use strict';

/* EBEROS v1.7.14-r1 – Heimlichkeit präzisiert und zwei Kompetenzfelder ergänzt. */
const V1714_VERSION='1.7.14',V1714_REVISION='r1',V1714_SCHEMA=22,V1714_RULES=7;
const V1714_NEW_SKILL_IDS=['skill_concealment_smuggling','skill_camouflage_disguise'];
const V1714_LEGACY_SKILL_IDS=new Map(SKILLS.map(function(skill){return[skill.name,skill.id]}));

const V1714_SKILL_TEXT={
  stealth:'Beschreibt lautloses Bewegen, Anschleichen, ungesehenes Wechseln der Position, das Nutzen von Deckung, das kurzfristige Verstecken der eigenen Person sowie das Umgehen von Wachen oder Gegnern. Typische Gegenprobe: Aufmerksamkeit & Wachsamkeit. Heimlichkeit & Schleichen bestimmt, ob sich eine Figur unbemerkt bewegt oder einer unmittelbaren Beobachtung entzieht. Die Fähigkeit deckt weder das Verbergen von Gegenständen noch die Herstellung oder Glaubwürdigkeit einer Verkleidung ab.',
  concealment:'Beschreibt das Verbergen von Gegenständen oder Schmuggelware am Körper, in Gepäck, Behältern oder Geheimfächern, das Präparieren solcher Verstecke sowie den unauffälligen Transport verborgener Gegenstände durch Kontrollen. Typische Gegenprobe: Erforschen & Untersuchen. Fingerfertigkeit steht für das praktische Verbergen und Präparieren, Intuition für die Einschätzung, wo und wie eine andere Person wahrscheinlich suchen wird. Die Fähigkeit ersetzt weder Heimlichkeit & Schleichen noch Taschendiebstahl & Schlösser knacken und erzeugt keine falsche Identität.',
  disguise:'Beschreibt die handwerkliche Herstellung und Anpassung von Verkleidungen, das optische Verschleiern einer Identität sowie das Tarnen von Kleidung, Ausrüstung, Lagern und Objekten an ihre Umgebung. Typische Gegenprobe bei verkleideten Personen: Menschenkenntnis & Wesen erkennen. Typische Gegenprobe bei getarnten Gegenständen, Ausrüstung oder Lagern: Erforschen & Untersuchen. Fingerfertigkeit bestimmt die praktische Ausführung, Charisma die glaubhafte äußere Wirkung. Sprachliches Ausspielen und Lügen bleiben bei Überreden & Belügen, rituelles oder ranggerechtes Verhalten bei Etikette & höfisches Auftreten, spontane Irreführung bei Ablenken & Verwirren und unbemerktes Bewegen bei Heimlichkeit & Schleichen.'
};

function installSkillsV1714(){
  const stealth=SKILLS.find(function(skill){return skill.name==='Heimlichkeit & Schleichen'});
  if(!stealth||stealth.id!=='skill_11')throw new Error('v1.7.14: stabile Alt-ID skill_11 für Heimlichkeit & Schleichen fehlt.');
  stealth.category='Körper';stealth.attrs='GS, RF';stealth.use='A';stealth.scope=V1714_SKILL_TEXT.stealth;stealth.sourceOrder=11;
  const definitions=[
    {id:'skill_concealment_smuggling',category:'Körper',name:'Verbergen & Schmuggeln',attrs:'FF, IN',use:'FO',scope:V1714_SKILL_TEXT.concealment,sourceOrder:11.1},
    {id:'skill_camouflage_disguise',category:'Körper',name:'Tarnen & Verkleiden',attrs:'FF, CR',use:'FO',scope:V1714_SKILL_TEXT.disguise,sourceOrder:11.2}
  ];
  for(const definition of definitions){
    const byId=SKILLS.find(function(skill){return skill.id===definition.id}),byName=SKILLS.find(function(skill){return skill.name===definition.name});
    if(byId&&byName&&byId!==byName)throw new Error('v1.7.14: Fähigkeit-ID und Name kollidieren: '+definition.id);
    const target=byId||byName;if(target)Object.assign(target,definition);else SKILLS.push({...definition});
    if(typeof SYSTEM_SKILL_IDS_V178!=='undefined')SYSTEM_SKILL_IDS_V178.add(definition.id);
  }
  SKILLS.sort(function(a,b){return SKILL_CATEGORY_ORDER.indexOf(a.category)-SKILL_CATEGORY_ORDER.indexOf(b.category)||(+a.sourceOrder||0)-(+b.sourceOrder||0)||a.name.localeCompare(b.name,'de')});
}
installSkillsV1714();

function skillStateV1714(value){
  const stateValue=value&&typeof value==='object'&&!Array.isArray(value)?value:{};
  if(!Number.isFinite(+stateValue.level))stateValue.level=0;
  stateValue.level=Math.max(0,Math.min(25,+stateValue.level||0));
  if(stateValue.fav===undefined)stateValue.fav=false;
  if(stateValue.note===undefined)stateValue.note='';
  return stateValue;
}
function orderedIdsForMigrationV1714(owner){
  const systemIds=SKILLS.map(function(skill){return skill.id}),customIds=(owner.customSkills||[]).filter(function(skill){return !skill.archived}).map(function(skill){return skill.id}),validIds=new Set([...systemIds,...customIds]),given=Array.isArray(owner.skillOrder)?owner.skillOrder:[];
  const preserved=given.filter(function(id,index){return validIds.has(id)&&!V1714_NEW_SKILL_IDS.includes(id)&&given.indexOf(id)===index});
  const anchor=preserved.indexOf('skill_11'),insertAt=anchor>=0?anchor+1:preserved.length;
  preserved.splice(insertAt,0,...V1714_NEW_SKILL_IDS);
  for(const id of[...systemIds,...customIds])if(!preserved.includes(id))preserved.push(id);
  return preserved;
}
function ensureOwnerSkillsV1714(owner,migrating){
  if(!owner||typeof owner!=='object'||owner.type==='possession')return owner;
  owner.skills=owner.skills&&typeof owner.skills==='object'&&!Array.isArray(owner.skills)?owner.skills:{};
  for(const skill of SKILLS)owner.skills[skill.id]=skillStateV1714(owner.skills[skill.id]);
  if(migrating)owner.skillOrder=orderedIdsForMigrationV1714(owner);
  else{
    const valid=[...SKILLS.map(function(skill){return skill.id}),...(owner.customSkills||[]).filter(function(skill){return !skill.archived}).map(function(skill){return skill.id})],given=Array.isArray(owner.skillOrder)?owner.skillOrder:[];
    owner.skillOrder=[...given.filter(function(id,index){return valid.includes(id)&&given.indexOf(id)===index}),...valid.filter(function(id){return !given.includes(id)})];
  }
  return owner;
}
function ownerListV1714(data){
  const owners=[];for(const character of data.characters||[]){owners.push(character);for(const owner of character.auxiliaryTabs||[])if(owner.type!=='possession')owners.push(owner)}return owners;
}
function ensureStateV1714(data,log){
  if(!data||typeof data!=='object')return data;
  const first=!data.v1714SkillSplitMigrationDone,fromSchema=+data.schemaVersion||0,fromApp=data.appVersion||'unbekannt';
  for(const owner of ownerListV1714(data))ensureOwnerSkillsV1714(owner,first);
  data.appVersion=V1714_VERSION;data.schemaVersion=V1714_SCHEMA;data.rulesVersion=V1714_RULES;data.v1714SkillSplitMigrationDone=true;
  data.migrationLog=Array.isArray(data.migrationLog)?data.migrationLog:[];
  if(first){data.migrationLog=data.migrationLog.filter(function(entry){return !(+entry?.to===V1714_SCHEMA&&(!Array.isArray(entry.changes)||entry.changes.length===0))});if(log!==false)data.migrationLog.push({from:fromSchema,fromApp,to:V1714_SCHEMA,toApp:V1714_VERSION,at:new Date().toISOString(),changes:['Heimlichkeit & Schleichen fachlich präzisiert','Verbergen & Schmuggeln ergänzt','Tarnen & Verkleiden ergänzt','Bestehende Fähigkeits-IDs, Lernstände, Notizen, Reihenfolgen und CBP erhalten']})}
  return data;
}

const migrateStateBeforeV1714=migrateState;
migrateState=function(data){return ensureStateV1714(migrateStateBeforeV1714(data),true)};
state=ensureStateV1714(state,true);

const newCharacterBeforeV1714=newCharacter,newAuxEntryBeforeV1714=newAuxEntry;
newCharacter=function(){return ensureOwnerSkillsV1714(newCharacterBeforeV1714(),false)};
newAuxEntry=function(type,name){const owner=newAuxEntryBeforeV1714(type,name);return type==='possession'?owner:ensureOwnerSkillsV1714(owner,false)};

const runTestsBeforeV1714=runTests;
function runTestsV1714(){
  runTestsBeforeV1714();
  const body=testResults.querySelector('tbody'),superseded=new Set(['Version 1.7.13','Schema 21']);
  for(const row of[...body.querySelectorAll('tr')])if(superseded.has(row.cells[0]?.textContent))row.remove();
  const priorFailures=[...body.querySelectorAll('tr')].filter(function(row){return row.cells[row.cells.length-1]?.textContent==='Fehler'}),tests=[];
  const eq=function(name,expected,actual){tests.push([name,expected,actual,expected===actual])},byName=function(name){return SKILLS.find(function(skill){return skill.name===name})};
  eq('Version 1.7.14',V1714_VERSION,APP_VERSION);eq('Schema 22',V1714_SCHEMA,SCHEMA_VERSION);eq('Regelstand bleibt 7',V1714_RULES,RULES_VERSION);eq('Revision r1','r1',V1714_REVISION);
  eq('84 Regelfähigkeiten',84,SKILLS.length);eq('84 eindeutige Fähigkeits-IDs',84,new Set(SKILLS.map(function(skill){return skill.id})).size);eq('84 eindeutige Fähigkeitsnamen',84,new Set(SKILLS.map(function(skill){return skill.name})).size);
  eq('Alle 82 bisherigen Namen behalten ihre ID',true,[...V1714_LEGACY_SKILL_IDS].every(function(entry){return byName(entry[0])?.id===entry[1]}));
  const stealth=byName('Heimlichkeit & Schleichen'),concealment=byName('Verbergen & Schmuggeln'),disguise=byName('Tarnen & Verkleiden');
  eq('Heimlichkeit behält skill_11','skill_11',stealth?.id);eq('Heimlichkeit bleibt GS, RF und A','GS, RF|A',stealth?.attrs+'|'+stealth?.use);eq('Heimlichkeit enthält keine alte Sammelformulierung',false,/Verstecken, Tarnen, unauffälliges Verhalten/.test(stealth?.scope||''));
  eq('Verbergen besitzt stabile ID','skill_concealment_smuggling',concealment?.id);eq('Verbergen nutzt FF, IN und Fokus','FF, IN|FO',concealment?.attrs+'|'+concealment?.use);eq('Tarnen besitzt stabile ID','skill_camouflage_disguise',disguise?.id);eq('Tarnen nutzt FF, CR und Fokus','FF, CR|FO',disguise?.attrs+'|'+disguise?.use);
  eq('Drei Kompetenzfelder stehen direkt beisammen','Heimlichkeit & Schleichen|Verbergen & Schmuggeln|Tarnen & Verkleiden',SKILLS.slice(SKILLS.indexOf(stealth),SKILLS.indexOf(stealth)+3).map(function(skill){return skill.name}).join('|'));
  eq('Gegenproben und Abgrenzungen vollständig',true,stealth.scope.includes('Aufmerksamkeit & Wachsamkeit')&&concealment.scope.includes('Erforschen & Untersuchen')&&disguise.scope.includes('Menschenkenntnis & Wesen erkennen')&&disguise.scope.includes('Überreden & Belügen'));

  const fresh=newCharacter(),freshNpc=newAuxEntry('npc','Neu'),freshFamiliar=newAuxEntry('familiar','Neu');
  eq('Neue Figur startet beide Fähigkeiten auf 0','0|0',V1714_NEW_SKILL_IDS.map(function(id){return fresh.skills[id].level}).join('|'));eq('NPC startet beide Fähigkeiten auf 0','0|0',V1714_NEW_SKILL_IDS.map(function(id){return freshNpc.skills[id].level}).join('|'));eq('Vertrauter startet beide Fähigkeiten auf 0','0|0',V1714_NEW_SKILL_IDS.map(function(id){return freshFamiliar.skills[id].level}).join('|'));
  freshNpc.skills.skill_concealment_smuggling.level=4;eq('NPC- und Vertrautenwerte bleiben getrennt',0,freshFamiliar.skills.skill_concealment_smuggling.level);

  const legacyCharacter=newCharacter();delete legacyCharacter.skills.skill_concealment_smuggling;delete legacyCharacter.skills.skill_camouflage_disguise;legacyCharacter.skills.skill_11={level:8,fav:true,note:'Im Schatten',tag:'erhalten'};legacyCharacter.skillOrder=legacyCharacter.skillOrder.filter(function(id){return !V1714_NEW_SKILL_IDS.includes(id)});[legacyCharacter.skillOrder[2],legacyCharacter.skillOrder[3]]=[legacyCharacter.skillOrder[3],legacyCharacter.skillOrder[2]];const custom=createCustomSkillV178(legacyCharacter,{name:'Geheime Zeichen',category:'Wissen',attribute1:'IT',attribute2:'IN',use:'FO',scope:'Migrationstest'});legacyCharacter.skills[custom.id].level=6;const oldRelative=legacyCharacter.skillOrder.filter(function(id){return !V1714_NEW_SKILL_IDS.includes(id)}).join('|'),oldCost=costs(legacyCharacter).Fähigkeiten,legacy={appVersion:'1.7.13',schemaVersion:21,characters:[legacyCharacter],activeCharacterId:legacyCharacter.id,settings:{},migrationLog:[]};delete legacy.v1714SkillSplitMigrationDone;
  ensureStateV1714(legacy,true);const once=JSON.stringify(legacy),newRelative=legacyCharacter.skillOrder.filter(function(id){return !V1714_NEW_SKILL_IDS.includes(id)}).join('|');
  eq('Altstufe von Heimlichkeit bleibt erhalten',8,legacyCharacter.skills.skill_11.level);eq('Altnotiz und Favorit bleiben erhalten','true|Im Schatten|erhalten',legacyCharacter.skills.skill_11.fav+'|'+legacyCharacter.skills.skill_11.note+'|'+legacyCharacter.skills.skill_11.tag);eq('Neue Fähigkeiten beginnen bei 0','0|0',V1714_NEW_SKILL_IDS.map(function(id){return legacyCharacter.skills[id].level}).join('|'));eq('Alt-CBP bleiben unverändert',oldCost,costs(legacyCharacter).Fähigkeiten);eq('Relative Altreihenfolge bleibt erhalten',oldRelative,newRelative);eq('Neue IDs folgen direkt auf skill_11','skill_concealment_smuggling|skill_camouflage_disguise',legacyCharacter.skillOrder.slice(legacyCharacter.skillOrder.indexOf('skill_11')+1,legacyCharacter.skillOrder.indexOf('skill_11')+3).join('|'));eq('Eigene Fähigkeit bleibt erhalten','Geheime Zeichen|6',legacyCharacter.customSkills.find(function(skill){return skill.id===custom.id})?.name+'|'+legacyCharacter.skills[custom.id].level);eq('Genau ein neuer Migrationsprotokolleintrag',1,legacy.migrationLog.filter(function(entry){return entry.to===22}).length);
  ensureStateV1714(legacy,true);eq('Migration ist idempotent',once,JSON.stringify(legacy));

  const rendered=renderSkillsV178(fresh,false),renderedNpc=renderSkillsV178(freshNpc,true);eq('Charakter zeigt 84 Regelfähigkeiten',84,rendered.querySelectorAll('tbody tr[data-skill-id]').length);eq('NPC zeigt 84 Regelfähigkeiten',84,renderedNpc.querySelectorAll('tbody tr[data-skill-id]').length);eq('Infotexte im Renderer vorhanden',true,rendered.textContent.includes('Schmuggelware')&&rendered.textContent.includes('Menschenkenntnis & Wesen erkennen'));eq('Globale Suche indexiert Schmuggeln',true,searchIndexV177().some(function(entry){return entry.kind==='Fähigkeit'&&entry.label==='Verbergen & Schmuggeln'&&entry.search.includes('geheimfach')}));eq('Globale Suche indexiert Verkleiden',true,searchIndexV177().some(function(entry){return entry.kind==='Fähigkeit'&&entry.label==='Tarnen & Verkleiden'&&entry.search.includes('identitat')}));eq('Effektziele enthalten beide Fähigkeiten',true,V1714_NEW_SKILL_IDS.every(function(id){return targetOptionsV177('skill').some(function(option){return option[0]===id})}));
  const print=renderPrintSkillsR15(cardObject('skills'),fresh,{format:'standard',descriptions:true},true);eq('Druck enthält beide Fähigkeiten',true,V1714_NEW_SKILL_IDS.every(function(id){return print.textContent.includes(SKILLS.find(function(skill){return skill.id===id}).name)}));

  for(const test of tests)body.append(el('tr',{},[test[0],test[1],test[2],test[3]?'Bestanden':'Fehler'].map(function(value){return el('td',{text:String(value)})})));
  return priorFailures.length===0&&tests.every(function(test){return test[3]});
}
runTests=runTestsV1714;testsBtn.onclick=runTestsV1714;

renderAll();save();
Object.assign(window.Eberos,{version:V1714_VERSION,revision:V1714_REVISION,schemaVersion:V1714_SCHEMA,rulesVersion:V1714_RULES,runTests:runTestsV1714,ensureStateV1714,ensureOwnerSkillsV1714,newSkillIds:V1714_NEW_SKILL_IDS});
