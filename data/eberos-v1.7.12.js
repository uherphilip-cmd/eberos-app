'use strict';

/* EBEROS v1.7.12 – Zauber, Wunder und Flüche bis Z15. */
const V1712_VERSION='1.7.12',V1712_SCHEMA=20,V1712_RULES=7;

function ensureStateV1712(data){
  if(!data||typeof data!=='object')return data;
  data.appVersion=V1712_VERSION;
  data.schemaVersion=V1712_SCHEMA;
  return data;
}

const migrateStateBeforeV1712=migrateState;
migrateState=function(data){return ensureStateV1712(migrateStateBeforeV1712(data))};
state=ensureStateV1712(state);

const runTestsBeforeV1712=runTests;
function runTestsV1712(){
  runTestsBeforeV1712();
  const historicalBody=testResults.querySelector('tbody');
  for(const row of[...historicalBody.querySelectorAll('tr')])if(row.cells[0]?.textContent==='Version 1.7.11')row.remove();
  const baseOk=![...historicalBody.querySelectorAll('tr')].some(row=>row.cells[row.cells.length-1]?.textContent==='Fehler'),tests=[],eq=(name,expected,actual)=>tests.push([name,expected,actual,expected===actual]);
  eq('Version 1.7.12',V1712_VERSION,APP_VERSION);
  eq('Schema bleibt 20',V1712_SCHEMA,SCHEMA_VERSION);
  eq('Regelstand bleibt 7',V1712_RULES,RULES_VERSION);
  eq('Katalogversion 1.1.0','1.1.0',POWER_DB_V176.meta?.catalogVersion);
  eq('405 Power-Einträge',405,POWER_ENTRIES_V176.length);
  eq('27 Power-Schulen',27,POWER_SCHOOLS_V176.length);
  eq('405 eindeutige Power-IDs',405,new Set(POWER_ENTRIES_V176.map(entry=>entry.id)).size);
  eq('Pfadverteilung 210/75/120','210|75|120',`${POWER_VALIDATION_V176.pathCounts.M}|${POWER_VALIDATION_V176.pathCounts.GB}|${POWER_VALIDATION_V176.pathCounts.FS}`);
  eq('Verstärkungen 297/108','297|108',`${POWER_VALIDATION_V176.reinforcement.yes}|${POWER_VALIDATION_V176.reinforcement.no}`);
  eq('Jede Schule enthält Z1 bis Z15',true,POWER_SCHOOLS_V176.every(school=>powersForSkillV176(school.skillId).map(entry=>entry.code).join('|')===Array.from({length:15},(_,index)=>`Z${index+1}`).join('|')));
  const capacityOwner=newCharacter();
  ensureOwnerPowersV176(capacityOwner);
  const capacityLevels=[0,1,10,11,15,16,25],expectedCapacity=[0,1,10,11,15,15,15];
  eq('Lernplätze 0/1/10/11/15/16/25',expectedCapacity.join('|'),capacityLevels.map(level=>{capacityOwner.skills.skill_61.level=level;return learningCapacityV176(capacityOwner,'skill_61')}).join('|'));
  const fireEntries=powersForSkillV176('skill_61'),fireZ15=fireEntries.find(entry=>entry.code==='Z15');
  capacityOwner.skills.skill_61.level=1;capacityOwner.skills.skill_61.learnedPowerIds=[];
  eq('Z15 mit erstem Lernplatz frei wählbar',true,learnPowerV176(capacityOwner,'skill_61',fireZ15.id));
  const lowering=newCharacter();ensureOwnerPowersV176(lowering);lowering.skills.skill_61.level=15;lowering.skills.skill_61.learnedPowerIds=fireEntries.map(entry=>entry.id);
  const before=lowering.skills.skill_61.learnedPowerIds.join('|');
  eq('Abbruch der Stufensenkung bleibt verlustfrei',false,setPurchasedSkillLevelV176(lowering,'skill_61',10,()=>false));
  eq('Abbruch erhält alle 15 Kräfte',before,lowering.skills.skill_61.learnedPowerIds.join('|'));
  eq('Bestätigte Stufensenkung gelingt',true,setPurchasedSkillLevelV176(lowering,'skill_61',10,()=>true));
  eq('Bestätigte Stufensenkung behält zehn Kräfte',10,lowering.skills.skill_61.learnedPowerIds.length);
  const legacy=newCharacter();ensureOwnerPowersV176(legacy);legacy.skills.skill_61.level=10;legacy.skills.skill_61.learnedPowerIds=fireEntries.slice(0,10).map(entry=>entry.id);const legacyIds=legacy.skills.skill_61.learnedPowerIds.join('|');
  ensureStateV1712(legacy);
  eq('Bestehende gelernte IDs bleiben erhalten',legacyIds,legacy.skills.skill_61.learnedPowerIds.join('|'));
  const body=testResults.querySelector('tbody');for(const[name,expected,actual,ok]of tests)body?.append(el('tr',{},[name,expected,actual,ok?'Bestanden':'Fehler'].map(value=>el('td',{text:String(value)}))));
  return baseOk&&tests.every(test=>test[3]);
}
runTests=runTestsV1712;
testsBtn.onclick=runTestsV1712;

save();
Object.assign(window.Eberos,{version:V1712_VERSION,schemaVersion:V1712_SCHEMA,rulesVersion:V1712_RULES,runTests:runTestsV1712,ensureStateV1712,powerCatalogVersion:POWER_DB_V176.meta?.catalogVersion});
