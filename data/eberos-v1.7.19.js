'use strict';
/* EBEROS v1.7.19-r1 – Runenmana-Information erst ab gekaufter Runenmagie. */
const V1719_VERSION='1.7.19',V1719_REVISION='r1',V1719_SCHEMA=25,V1719_RULES=11;

const runTestsBeforeV1719=runTests;
function runTestsV1719(){
  runTestsBeforeV1719();
  const body=testResults.querySelector('tbody'),obsolete=new Set(['Version 1.7.18','Revision v1.7.18 r1']);
  for(const row of[...body.querySelectorAll('tr')])if(obsolete.has(row.cells[0]?.textContent))row.remove();
  const baseOk=[...body.querySelectorAll('tr')].every(function(row){return row.cells[row.cells.length-1]?.textContent==='Bestanden'}),tests=[];
  const eq=function(name,expected,actual){tests.push([name,expected,actual,expected===actual])};
  const runeText='Rast füllt ausgegebenes Mana auf; aktive Runenbindungen bleiben bestehen.';

  eq('Version 1.7.19',V1719_VERSION,APP_VERSION);
  eq('Schema bleibt 25',V1719_SCHEMA,SCHEMA_VERSION);
  eq('Regelstand bleibt 11',V1719_RULES,RULES_VERSION);
  eq('Revision v1.7.19 r1','r1',V1719_REVISION);

  const owner=newCharacter();owner.counters.M={max:2,current:2};
  const hidden=renderCountersR8(owner),hiddenText=hidden.textContent;
  eq('Runenmagie Stufe 0 erkannt',false,hasPurchasedRuneMagicV1719(owner));
  eq('Mana-Eingabe bleibt ohne Runenmagie sichtbar',true,!!hidden.querySelector('input[aria-label="Mana aktuell"]'));
  eq('Runenmana-Block bei Stufe 0 verborgen',0,hidden.querySelectorAll('.mana-binding-v1717').length);
  eq('Gebunden und verfügbar bei Stufe 0 verborgen',false,hiddenText.includes('gebunden')||hiddenText.includes('verfügbar'));
  eq('Runen-Rasthinweis bei Stufe 0 verborgen',false,hiddenText.includes(runeText));
  eq('Runenhilfe bei Stufe 0 verborgen',false,counterInfoContentR5('M',owner).textContent.includes('Gebundenes Mana'));

  owner.skills.skill_magic_clairvoyance_prophecy.level=5;
  eq('Anderer Mana-Skill aktiviert Runenanzeige nicht',0,renderCountersR8(owner).querySelectorAll('.mana-binding-v1717').length);
  owner.skills[V1717_SKILL.id].level=1;
  const visible=renderCountersR8(owner),visibleText=visible.textContent;
  eq('Runenmagie Stufe 1 erkannt',true,hasPurchasedRuneMagicV1719(owner));
  eq('Runenmana-Block ab Stufe 1 genau einmal',1,visible.querySelectorAll('.mana-binding-v1717').length);
  eq('Runenmana-Werte ab Stufe 1 sichtbar',true,visibleText.includes('Mana: 2/2 aktuell · 0 gebunden · 2 verfügbar'));
  eq('Runen-Rasthinweis ab Stufe 1 genau einmal',1,visibleText.split(runeText).length-1);
  eq('Runenhilfe ab Stufe 1 sichtbar',true,counterInfoContentR5('M',owner).textContent.includes('Gebundenes Mana'));
  owner.skills[V1717_SKILL.id].level=5;
  eq('Runenmana-Block bei höherer Stufe weiterhin einmal',1,renderCountersR8(owner).querySelectorAll('.mana-binding-v1717').length);
  owner.skills[V1717_SKILL.id].level=0;
  eq('Runenmana-Block nach Senkung auf 0 verschwunden',0,renderCountersR8(owner).querySelectorAll('.mana-binding-v1717').length);

  const npc=newAuxEntry('npc','Runen-NPC'),familiar=newAuxEntry('familiar','Runentier');
  eq('NPC Stufe 0 ohne Runenmana-Block',0,renderCountersR8(npc).querySelectorAll('.mana-binding-v1717').length);
  eq('Vertrauter Stufe 0 ohne Runenmana-Block',0,renderCountersR8(familiar).querySelectorAll('.mana-binding-v1717').length);
  npc.skills[V1717_SKILL.id].level=1;familiar.skills[V1717_SKILL.id].level=1;
  eq('NPC Stufe 1 mit Runenmana-Block',1,renderCountersR8(npc).querySelectorAll('.mana-binding-v1717').length);
  eq('Vertrauter Stufe 1 mit Runenmana-Block',1,renderCountersR8(familiar).querySelectorAll('.mana-binding-v1717').length);

  const counterCard=owner.layout.find(function(card){return card.type==='counters'});
  if(counterCard){
    owner.skills[V1717_SKILL.id].level=0;
    eq('Druckansicht Stufe 0 ohne Runenmana-Block',0,renderPrintableCardR15(counterCard,owner,{images:false},true).querySelectorAll('.mana-binding-v1717').length);
    owner.skills[V1717_SKILL.id].level=1;
    eq('Druckansicht Stufe 1 mit Runenmana-Block',1,renderPrintableCardR15(counterCard,owner,{images:false},true).querySelectorAll('.mana-binding-v1717').length);
  }else eq('Counterkarte für Drucktest vorhanden',true,false);

  for(const test of tests)body.append(el('tr',{},[test[0],test[1],test[2],test[3]?'Bestanden':'Fehler'].map(function(value){return el('td',{text:String(value)})})));
  return baseOk&&tests.every(function(test){return test[3]});
}
runTests=runTestsV1719;testsBtn.onclick=runTestsV1719;

renderAll();save();
Object.assign(window.Eberos,{version:V1719_VERSION,revision:V1719_REVISION,schemaVersion:V1719_SCHEMA,rulesVersion:V1719_RULES,runTests:runTestsV1719,hasPurchasedRuneMagic:hasPurchasedRuneMagicV1719});
