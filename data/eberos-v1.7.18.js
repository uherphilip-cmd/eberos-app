'use strict';
/* EBEROS v1.7.18-r1 – verbindliche Rennformel Bewegung × 2. */
const V1718_VERSION='1.7.18',V1718_REVISION='r1',V1718_SCHEMA=25,V1718_RULES=11;

const runTestsBeforeV1718=runTests;
function runTestsV1718(){
  runTestsBeforeV1718();
  const body=testResults.querySelector('tbody'),obsolete=new Set(['Version 1.7.17','Regelstand 10','Revision v1.7.17 r1']);
  for(const row of[...body.querySelectorAll('tr')])if(obsolete.has(row.cells[0]?.textContent))row.remove();
  const baseOk=[...body.querySelectorAll('tr')].every(function(row){return row.cells[row.cells.length-1]?.textContent==='Bestanden'}),tests=[];
  const eq=function(name,expected,actual){tests.push([name,expected,actual,expected===actual])};

  eq('Version 1.7.18',V1718_VERSION,APP_VERSION);
  eq('Schema bleibt 25',V1718_SCHEMA,SCHEMA_VERSION);
  eq('Regelstand 11',V1718_RULES,RULES_VERSION);
  eq('Revision v1.7.18 r1','r1',V1718_REVISION);
  eq('Offizieller Rennfaktor',2,runningMultiplierV1718());
  eq('Rennfaktor in Regelkonfiguration',2,rules.derivedValues?.runningMultiplier);

  const sample=newCharacter();Object.assign(sample.attributes,{ST:6,KS:5,GS:4});
  let values=derived(sample),movement=values.find(function(row){return row.n==='Bewegung'}),running=values.find(function(row){return row.n==='Rennen als Aktion'});
  eq('Bewegung 15',15,movement.v);
  eq('Rennen 30',30,running.v);
  eq('Formeltext Bewegung × 2','Bewegung × 2',running.f);
  eq('Startwerte ergeben Bewegung 3',3,derived(newCharacter()).find(function(row){return row.n==='Bewegung'}).v);
  eq('Startwerte ergeben Rennen 6',6,derived(newCharacter()).find(function(row){return row.n==='Rennen als Aktion'}).v);
  eq('Bewegung 0 ergibt Rennen 0',0,runningValueV1718(0));
  eq('Bewegung 1 ergibt Rennen 2',2,runningValueV1718(1));
  eq('Bewegung 25 ergibt Rennen 50',50,runningValueV1718(25));
  eq('Bewegung 75 ergibt Rennen 150',150,runningValueV1718(75));

  const baseRunning=running.v;
  sample.attributes.ST++;eq('ST +1 erhöht Rennen um 2',2,derived(sample).find(function(row){return row.n==='Rennen als Aktion'}).v-baseRunning);sample.attributes.ST--;
  sample.attributes.KS++;eq('KS +1 erhöht Rennen um 2',2,derived(sample).find(function(row){return row.n==='Rennen als Aktion'}).v-baseRunning);sample.attributes.KS--;
  sample.attributes.GS++;eq('GS +1 erhöht Rennen um 2',2,derived(sample).find(function(row){return row.n==='Rennen als Aktion'}).v-baseRunning);sample.attributes.GS--;
  sample.attributes.ST++;sample.attributes.KS++;sample.attributes.GS++;eq('ST, KS und GS +1 erhöhen Rennen um 6',6,derived(sample).find(function(row){return row.n==='Rennen als Aktion'}).v-baseRunning);

  const reducedKs=newCharacter();Object.assign(reducedKs.attributes,{ST:6,KS:5,GS:4});reducedKs.disadvantages=[disadvantageObject({name:'Testmodifikator KS',bonus:0,active:true,effects:{attributes:{KS:-1}}})];
  eq('Wirksame KS −1 senkt Bewegung um 1',14,derived(reducedKs).find(function(row){return row.n==='Bewegung'}).v);
  eq('Wirksame KS −1 senkt Rennen um 2',28,derived(reducedKs).find(function(row){return row.n==='Rennen als Aktion'}).v);

  const loaded=newCharacter();Object.assign(loaded.attributes,{ST:1,KS:2,GS:1});loaded.equipment=[];
  const unloadedMovement=derived(loaded).find(function(row){return row.n==='Bewegung'}).v,unloadedRunning=derived(loaded).find(function(row){return row.n==='Rennen als Aktion'}).v;
  loaded.equipment=[normalizeItemV174({name:'Testlast',quantity:1,weightKg:30.1,loadState:'carried'})];
  const loadedMovement=derived(loaded).find(function(row){return row.n==='Bewegung'}).v,loadedRunning=derived(loaded).find(function(row){return row.n==='Rennen als Aktion'}).v;
  eq('Bestehender Belastungsmalus senkt Bewegung unverändert',3,unloadedMovement-loadedMovement);
  eq('Rennverlust ist doppelte Bewegungsänderung',(unloadedMovement-loadedMovement)*2,unloadedRunning-loadedRunning);
  loaded.equipment[0].weightKg=40.1;
  eq('Wirksame KS 0 setzt Bewegung auf 0',0,derived(loaded).find(function(row){return row.n==='Bewegung'}).v);
  eq('Wirksame KS 0 setzt Rennen auf 0',0,derived(loaded).find(function(row){return row.n==='Rennen als Aktion'}).v);

  const npc=newAuxEntry('npc','Läufer'),familiar=newAuxEntry('familiar','Windhund');Object.assign(npc.attributes,{ST:6,KS:5,GS:4});Object.assign(familiar.attributes,{ST:6,KS:5,GS:4});
  eq('NPC verwendet Rennformel × 2',30,derived(npc).find(function(row){return row.n==='Rennen als Aktion'}).v);
  eq('Vertrauter verwendet Rennformel × 2',30,derived(familiar).find(function(row){return row.n==='Rennen als Aktion'}).v);
  eq('Abgeleitete Karte zeigt Wert und Formel',true,(function(){const text=renderDerivedV174(sample).textContent;return text.includes('Rennen als Aktion')&&text.includes('Bewegung × 2')})());

  const legacyRules=structuredClone(DEFAULT_RULES);legacyRules.rulesVersion=10;legacyRules.attributeBaseCost=9;legacyRules.derivedValues={runningMultiplier:4,note:'bleibt erhalten'};
  const migratedRules=migrateRulesV1718(legacyRules);
  eq('Regelstand 10 migriert auf 11',11,migratedRules?.rulesVersion);
  eq('Migration setzt Rennfaktor 2',2,migratedRules?.derivedValues?.runningMultiplier);
  eq('Migration erhält unabhängige Regelwerte',9,migratedRules?.attributeBaseCost);
  eq('Migration erhält weitere Angaben','bleibt erhalten',migratedRules?.derivedValues?.note);
  eq('Regelmigration ist idempotent',JSON.stringify(migratedRules),JSON.stringify(migrateRulesV1718(migratedRules)));
  const damaged=structuredClone(DEFAULT_RULES);damaged.derivedValues.runningMultiplier=4;
  eq('Abweichender Faktor in Regelstand 11 wird abgelehnt',null,migrateRulesV1718(damaged));

  for(const test of tests)body.append(el('tr',{},[test[0],test[1],test[2],test[3]?'Bestanden':'Fehler'].map(function(value){return el('td',{text:String(value)})})));
  return baseOk&&tests.every(function(test){return test[3]});
}
runTests=runTestsV1718;testsBtn.onclick=runTestsV1718;

renderAll();save();
Object.assign(window.Eberos,{version:V1718_VERSION,revision:V1718_REVISION,schemaVersion:V1718_SCHEMA,rulesVersion:V1718_RULES,runTests:runTestsV1718,rules:function(){return structuredClone(rules)},defaultRules:function(){return structuredClone(DEFAULT_RULES)},runningMultiplier:runningMultiplierV1718,runningValue:runningValueV1718,migrateRules:migrateRulesV1718});
