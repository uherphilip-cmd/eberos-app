'use strict';
/* EBEROS v1.7.21-r1 – eine Ausdauer je körperlicher Kampfrunde. */
const V1721_VERSION='1.7.21',V1721_REVISION='r1',V1721_SCHEMA=26,V1721_RULES=12;
const V1721_CHOKE_ID='effect-8-erstickend';
const V1721_MODES={physical:'Körperlich gekämpft',power:'Nur Kraft gewirkt',idle:'Nicht beteiligt'};
const v1721Clone=value=>structuredClone(value);

function newCombatRoundV1721(number=1,mode='idle'){
  return{number:Math.max(1,Math.floor(+number||1)),mode:V1721_MODES[mode]?mode:'idle',paidCost:0,payments:[],usedTechniqueIds:[]};
}
function ensureCombatRoundV1721(owner){
  if(!owner||owner.type==='possession')return null;
  owner.migrations=owner.migrations&&typeof owner.migrations==='object'?owner.migrations:{};
  if(!Object.hasOwn(owner.migrations,'v1721LegacyRoundRemainder'))owner.migrations.v1721LegacyRoundRemainder=Math.max(0,Math.min(4,+owner.combatRoundRemainderV178||0));
  owner.combatRoundRemainderV178=0;
  const old=owner.combatRoundV1721;
  if(!old||typeof old!=='object'||!Array.isArray(old.payments))owner.combatRoundV1721=newCombatRoundV1721();
  else{
    old.number=Math.max(1,Math.floor(+old.number||1));old.mode=V1721_MODES[old.mode]?old.mode:'idle';
    old.paidCost=Math.max(0,Math.floor(+old.paidCost||0));
    old.usedTechniqueIds=Array.isArray(old.usedTechniqueIds)?old.usedTechniqueIds:[];
  }
  return owner.combatRoundV1721;
}
function ensureStateV1721(data,log=true){
  if(!data||typeof data!=='object')return data;
  const first=!data.v1721MigrationDone,fromApp=data.appVersion||'unbekannt',fromSchema=+data.schemaVersion||0;
  for(const owner of ownerListV178(data))if(owner.type!=='possession')ensureCombatRoundV1721(owner);
  data.appVersion=V1721_VERSION;data.schemaVersion=V1721_SCHEMA;data.rulesVersion=V1721_RULES;data.v1721MigrationDone=true;
  data.migrationLog=Array.isArray(data.migrationLog)?data.migrationLog:[];
  if(first&&log)data.migrationLog.push({from:fromSchema,fromApp,to:V1721_SCHEMA,toApp:V1721_VERSION,at:new Date().toISOString(),changes:['Körperliche Kampfrunde kostet 1 A einschließlich Angriff','Technikkosten als Rundengesamtpreis','Alter Fünferrhythmus deaktiviert und archiviert','Kampftechniken neu balanciert']});
  return data;
}
const migrateStateBeforeV1721=migrateState;
migrateState=function(data){return ensureStateV1721(migrateStateBeforeV1721(data),true)};
if(!state.v1721MigrationDone)try{localStorage.setItem(STORE+'.backup.pre-v1721.'+Date.now(),JSON.stringify(state))}catch{}
state=ensureStateV1721(state,true);
const newCharacterBeforeV1721=newCharacter,newAuxEntryBeforeV1721=newAuxEntry;
newCharacter=function(){const owner=newCharacterBeforeV1721();ensureCombatRoundV1721(owner);return owner};
newAuxEntry=function(type,name){const owner=newAuxEntryBeforeV1721(type,name);ensureCombatRoundV1721(owner);return owner};

// Der bisherige Katalog hatte Erstickend als bedingungslose LP-Rundenwirkung.
// Diese Vorlage und bestehende Vorlageninstanzen erhalten die korrekte bedingte Regel.
const chokeDefinitionV1721=EFFECT_BY_ID_V177.get(V1721_CHOKE_ID);
const chokeTextV1721='Am Ende jeder betroffenen Runde genau 1 A verlieren; nur wenn A bereits 0 ist, stattdessen genau 1 LP verlieren.';
if(chokeDefinitionV1721){chokeDefinitionV1721.mechanics=chokeTextV1721;chokeDefinitionV1721.modules=[{id:'v1721-erstickend-regel',type:'rule',target:'erstickend',operation:'add',value:0,interval:'round',scope:chokeTextV1721}]}
function migrateChokeInstancesV1721(owner){
  if(!owner||owner.type==='possession')return;
  for(const effect of owner.activeEffectsV177||[])if(effect.definitionId===V1721_CHOKE_ID||effect.name==='Erstickend'){
    if(/am Ende jeder Runde A|bei A 0 anschließend L/i.test(effect.description||''))effect.description=chokeTextV1721;
    if(effect.modules?.some(module=>module.type==='counter-current'&&(module.target==='A'||module.target==='L')))effect.modules=v1721Clone(chokeDefinitionV1721.modules);
  }
}
for(const owner of ownerListV178(state))migrateChokeInstancesV1721(owner);
const ensureStateBeforeChokeV1721=ensureStateV1721;
ensureStateV1721=function(data,log=true){const result=ensureStateBeforeChokeV1721(data,log);for(const owner of ownerListV178(result))migrateChokeInstancesV1721(owner);return result};

function masteryDiscountV1721(owner,skillId){const level=Math.max(0,+owner?.skills?.[skillId]?.level||0);return level>=25?2:level>=15?1:0}
function techniquePaymentV1721(owner,entry){
  const round=ensureCombatRoundV1721(owner),first=!round.payments.some(payment=>payment.kind==='technique');
  const discount=first?masteryDiscountV1721(owner,entry.skillId):0;
  const nominal=first?Math.max(1,entry.staminaCost-discount):entry.staminaCost;
  const due=first?Math.max(0,nominal-round.paidCost):nominal;
  return{first,discount,nominal,due};
}
function useTechniqueV1721(owner,techniqueId,options={}){
  const entry=COMBAT_BY_ID_V178.get(techniqueId),round=ensureCombatRoundV1721(owner);
  if(!entry||!owner.skills?.[entry.skillId]?.learnedTechniqueIds?.includes(entry.id))return false;
  if(/einmal pro Runde/i.test(entry.limits)&&round.usedTechniqueIds.includes(entry.id)){if(options.notify!==false)showToastV179('Diese Technik wurde in der offenen Runde bereits eingesetzt.');return false}
  const payment=techniquePaymentV1721(owner,entry),beforePaidCost=round.paidCost,beforeMode=round.mode;
  const transaction=payment.due?commitActionPaymentV1712R2(owner,[{counterId:'A',amount:payment.due}],entry.id,`${entry.name} einsetzen`,{persist:false,notify:false,debounce:options.debounce!==false}):null;
  if(payment.due&&!transaction){if(options.notify!==false)showToastV179(`Für ${entry.name} fehlen ${payment.due} A beziehungsweise LP.`);return false}
  round.mode='physical';round.paidCost=payment.first?Math.max(round.paidCost,payment.nominal):round.paidCost+payment.nominal;
  round.usedTechniqueIds.push(entry.id);
  round.payments.push({kind:'technique',id:entry.id,name:entry.name,due:payment.due,nominal:payment.nominal,beforePaidCost,beforeMode,transactionId:transaction?.id||'',changes:v1721Clone(transaction?.changes||[])});
  owner.combatRoundUndoV1721=null;
  if(options.persist!==false)saveOwnerV173(owner,options.render!==false);
  if(options.notify!==false){if(transaction)showActionPaymentToastV1712R2(transaction);else showToastV179(`${entry.name}: durch bereits bezahlte Runden-A gedeckt.`)}
  return transaction||true;
}
function undoLastTechniqueV1721(owner,options={}){
  const round=ensureCombatRoundV1721(owner),last=round.payments.at(-1);
  if(!last||last.kind!=='technique')return false;
  if(last.transactionId){
    const transaction=lastActionPaymentV1712R2;
    if(transaction?.id===last.transactionId){if(!undoActionPaymentBeforeV1721(transaction.id,{persist:false,notify:false}))return false}
    else{
      if(!last.changes.every(change=>owner.counters?.[change.counterId]?.current===change.after))return false;
      for(const change of last.changes)if(owner.counters?.[change.counterId])owner.counters[change.counterId].current=change.before;
    }
  }
  round.payments.pop();round.usedTechniqueIds.pop();round.paidCost=last.beforePaidCost;round.mode=last.beforeMode;
  if(options.persist!==false)saveOwnerV173(owner,options.render!==false);
  if(options.notify!==false)showToastV179(`${last.name}: Einsatz und Zahlung rückgängig.`);
  return true;
}
const undoActionPaymentBeforeV1721=undoActionPaymentV1712R2;
undoActionPaymentV1712R2=function(transactionId=lastActionPaymentV1712R2?.id,options={}){
  const transaction=lastActionPaymentV1712R2,owner=transaction&&(transaction.ownerRef||ownerByIdV179(transaction.ownerId));
  if(owner&&ensureCombatRoundV1721(owner).payments.at(-1)?.transactionId===transactionId)return undoLastTechniqueV1721(owner,options);
  return undoActionPaymentBeforeV1721(transactionId,options);
};

const spendCounterBeforeV1721=spendCounterV179,undoCounterSpendBeforeV1721=undoCounterSpendV179;
spendCounterV179=function(owner,counterId,amount,skillId='',options={}){
  const ok=spendCounterBeforeV1721(owner,counterId,amount,skillId,options);
  if(ok&&counterId==='A'&&COMBAT_SKILL_IDS_V178.has(skillId)&&Math.floor(+amount||0)>=1){
    const round=ensureCombatRoundV1721(owner);
    if(round.paidCost===0){const beforeMode=round.mode;round.mode='physical';round.paidCost=1;round.payments.push({kind:'manual',transactionId:lastCounterSpendV179?.id||'',beforePaidCost:0,beforeMode,due:1});owner.combatRoundUndoV1721=null;if(options.render!==false)saveOwnerV173(owner,true);else saveOwnerV173(owner,false)}
  }
  return ok;
};
undoCounterSpendV179=function(transactionId=lastCounterSpendV179?.id){
  const transaction=lastCounterSpendV179,owner=transaction&&ownerByIdV179(transaction.ownerId),round=owner&&ensureCombatRoundV1721(owner),payment=round?.payments.at(-1);
  if(transaction&&round?.payments.some(item=>item.transactionId===transactionId)&&payment?.transactionId!==transactionId){showToastV179('Zuerst spätere Techniken dieser Runde rückgängig machen.');return false}
  const ok=undoCounterSpendBeforeV1721(transactionId);
  if(ok&&payment?.kind==='manual'&&payment.transactionId===transactionId){round.payments.pop();round.paidCost=payment.beforePaidCost;round.mode=payment.beforeMode;saveOwnerV173(owner,true)}
  return ok;
};

function setCombatModeV1721(owner,mode){
  const round=ensureCombatRoundV1721(owner);if(!V1721_MODES[mode])return false;
  if(mode!=='physical'&&round.paidCost>0){showToastV179('Diese Runde enthält bereits einen körperlichen Einsatz. Zuerst den Einsatz rückgängig machen.');return false}
  round.mode=mode;owner.combatRoundUndoV1721=null;saveOwnerV173(owner,true);return true;
}
function roundPreviewV1721(owner){const round=ensureCombatRoundV1721(owner);return round.mode==='physical'&&round.paidCost===0?1:0}
function counterSnapshotV1721(owner){return Object.fromEntries(Object.entries(owner.counters||{}).map(([id,counter])=>[id,Math.max(0,+counter.current||0)]))}
function roundChangesV1721(owner,eventKey,baseCost=0){
  const simulated=counterSnapshotV1721(owner),changes=[];
  const spendA=(amount,label)=>{const a=Math.min(simulated.A||0,amount),lp=amount-a;if((simulated.L||0)<lp)return false;simulated.A=(simulated.A||0)-a;simulated.L=(simulated.L||0)-lp;changes.push({label,counter:'A',amount,a,lp});return true};
  if(baseCost&&!spendA(baseCost,'Körperliche Kampfrunde'))return{valid:false,reason:'Für die körperliche Kampfrunde reichen A und LP nicht aus.'};
  const effects=eventKey==='round'?activeEffectInstancesV177(owner):[];
  for(const effect of effects){
    if(effect.definitionId===V1721_CHOKE_ID||effect.name==='Erstickend'){
      if(!spendA(1,'Erstickend'))return{valid:false,reason:'Für Erstickend reichen A und LP nicht aus.'};
    }
  }
  const effectPlan=eventKey==='round'?planEffectAdvanceV1710(owner,'round',{initialValues:simulated}):null;
  if(effectPlan){for(const[id,value]of effectPlan.current)simulated[id]=value;for(const change of effectPlan.changes)changes.push({label:change.effect.name,counter:change.module.target,before:change.before,after:change.after,generic:true})}
  return{valid:true,simulated,changes,progress:effectPlan?.progress||[]};
}
function closeCombatRoundV1721(owner,{effects=true,persist=true,notify=true}={}){
  const round=ensureCombatRoundV1721(owner),before=v1721Clone(round),baseCost=roundPreviewV1721(owner),plan=roundChangesV1721(owner,effects?'round':'none',baseCost);
  if(!plan.valid){if(notify)showToastV179(plan.reason);return false}
  const generic=plan.changes.filter(change=>change.generic);
  if(generic.length&&typeof confirm==='function'&&!confirm(generic.map(change=>`${change.label}: ${change.counter} ${change.before} → ${change.after}`).join('\n')+'\n\nEffektänderungen anwenden?'))return false;
  const beforeCounters=counterSnapshotV1721(owner),beforeEffects=v1721Clone(owner.activeEffectsV177||[]),beforeLog=v1721Clone(owner.effectLogV177||[]);
  for(const[id,current]of Object.entries(plan.simulated))if(owner.counters[id])owner.counters[id].current=current;
  if(effects){for(const update of plan.progress)update.module.progress=update.next;advanceDurationsV1710(owner,'round')}
  owner.effectLogV177=Array.isArray(owner.effectLogV177)?owner.effectLogV177:[];
  owner.effectLogV177.unshift({id:uid(),at:nowV177(),event:'round',combatRoundV1721:before.number,changes:plan.changes.map(change=>({effect:change.label,counter:change.counter,before:change.before??beforeCounters[change.counter],after:change.after??plan.simulated[change.counter]}))});
  owner.effectLogV177=owner.effectLogV177.slice(0,30);
  const next=newCombatRoundV1721(before.number+1,before.mode);owner.combatRoundV1721=next;
  owner.combatRoundUndoV1721={beforeRound:before,beforeCounters,beforeEffects,beforeLog,afterCounters:counterSnapshotV1721(owner),afterEffects:v1721Clone(owner.activeEffectsV177||[]),afterRound:v1721Clone(next)};
  if(persist)persistEffectsV177(owner,true);
  if(notify)showToastV179(`Runde ${before.number} abgeschlossen: ${baseCost?`1 A Grundkosten${plan.changes.find(change=>change.label==='Körperliche Kampfrunde')?.lp?' mit LP-Ersatz':''}`:'keine zusätzliche Grund-A'}.`);
  return{before:before.number,after:next.number,spent:baseCost,changes:plan.changes};
}
function undoCombatRoundV1721(owner){
  const undo=owner.combatRoundUndoV1721,round=ensureCombatRoundV1721(owner);
  if(!undo||JSON.stringify(round)!==JSON.stringify(undo.afterRound)||JSON.stringify(counterSnapshotV1721(owner))!==JSON.stringify(undo.afterCounters)||JSON.stringify(owner.activeEffectsV177||[])!==JSON.stringify(undo.afterEffects)){showToastV179('Runde kann nur unmittelbar und ohne spätere Änderungen zurückgenommen werden.');return false}
  for(const[id,current]of Object.entries(undo.beforeCounters))if(owner.counters[id])owner.counters[id].current=current;
  owner.activeEffectsV177=v1721Clone(undo.beforeEffects);owner.effectLogV177=v1721Clone(undo.beforeLog);owner.combatRoundV1721=v1721Clone(undo.beforeRound);owner.combatRoundUndoV1721=null;
  persistEffectsV177(owner,true);showToastV179('Letzte Kampfrunde samt Counter- und Effektänderungen rückgängig.');return true;
}

advanceCombatClockV178=function(owner,eventKey){
  const round=ensureCombatRoundV1721(owner);
  if(eventKey==='rest'){const before=round.number;owner.combatRoundV1721=newCombatRoundV1721();owner.combatRoundUndoV1721=null;owner.combatRoundRemainderV178=0;return{before,after:1,spent:0}}
  if(eventKey==='round')return closeCombatRoundV1721(owner,{effects:false,persist:false,notify:false});
  return{before:round.number,after:round.number,spent:0};
};
const advanceEffectsBeforeV1721=advanceEffectsV1710;
advanceEffectsV1710=function(owner,eventKey,options={}){if(eventKey==='round')return closeCombatRoundV1721(owner,{effects:true,persist:options.persist!==false,notify:options.notify!==false});return advanceEffectsBeforeV1721(owner,eventKey,options)};
advanceEffectsV177=advanceEffectsV1710;

const combatTechniqueInfoBeforeV1721=combatTechniqueInfoContentV176;
combatTechniqueInfoContentV176=function(entry,owner){
  const box=combatTechniqueInfoBeforeV1721(entry,owner),badge=box.querySelector('.power-current-v176');
  if(badge)badge.append(el('span',{class:'power-badge-v176',text:`In dieser Runde: ${techniquePaymentV1721(owner,entry).due} A`}),el('span',{class:'power-badge-v176',text:'erste Technik zählt statt Runden-A'}));
  return box;
};
combatTechniqueActionV1712R2=function(entry,owner){
  const preview=techniquePaymentV1721(owner,entry);
  return actionDisclosureV1712R2(`Technik einsetzen · jetzt ${preview.due} A`,`${entry.name} einsetzen`,host=>{
    const current=techniquePaymentV1721(owner,entry),already=/einmal pro Runde/i.test(entry.limits)&&ensureCombatRoundV1721(owner).usedTechniqueIds.includes(entry.id),components=current.due?[{counterId:'A',amount:current.due}]:[],plan=actionPaymentPlanV1712R2(owner,components);
    host.append(el('strong',{text:entry.name}),el('p',{class:'muted',text:`Aktivierung: ${entry.activation} Voraussetzung und Aktionsgrenzen im Spiel prüfen. Die Schaltfläche würfelt nicht automatisch.`}));
    if(current.due)appendPaymentSummaryV1712R2(host,plan,components);else host.append(el('p',{text:'Die Kosten sind durch eine bereits bezahlte körperliche Runde gedeckt.'}));
    const button=el('button',{type:'button',class:'primary',text:current.due?`Technik einsetzen und ${current.due} A bezahlen`:'Technik ohne weiteren Abzug einsetzen',disabled:already||!plan.valid});
    button.onclick=()=>{const result=useTechniqueV1721(owner,entry.id);if(result)button.disabled=true};host.append(button);
  });
};
const renderCombatLibraryBeforeV1721=renderCombatTechniqueLibraryV176;
renderCombatTechniqueLibraryV176=function(owner){
  const box=renderCombatLibraryBeforeV1721(owner),rule=[...box.querySelectorAll('.combat-tech-rule-v176')].find(node=>node.querySelector('strong')?.textContent==='Ausdauer');
  if(rule)rule.querySelector('span').textContent='Körperlich geführte Runde: 1 A einschließlich normalem Angriff. Die erste Technik kostet ihren angegebenen Gesamtpreis statt zusätzlich 1 A. Ab Kaufstufe 15/25 sinkt ihr Preis um 1/2 A (mindestens 1 A). Reine Wirker-Runde: nur Kraftkosten.';
  const badge=box.querySelector('.combat-tech-head-v176 .power-badge-v176');if(badge)badge.textContent='Katalog 1.2 · 7 Schulen · 56 Techniken';
  return box;
};
const renderPrintSkillsBeforeV1721=renderPrintSkillsR15;
renderPrintSkillsR15=function(card,owner,options,isCharacter){
  const box=renderPrintSkillsBeforeV1721(card,owner,options,isCharacter),heading=[...box.querySelectorAll('h3')].find(node=>node.textContent==='Gelernte Kampftechniken');
  if(heading)heading.after(el('p',{text:'Körperliche Kampfrunde: 1 A einschließlich normalem Angriff. Angezeigte Technikkosten sind Listenpreise und ersetzen bei der ersten Technik die Runden-A. Bei gekaufter Kampfschulstufe 15/25 sinkt dieser erste Preis um 1/2 A, mindestens auf 1 A. Reine Wirker-Runden kosten nur die angegebene Kraftressource.'}));
  return box;
};
const counterInfoBeforeV1721=counterInfoContentR5;
counterInfoContentR5=function(id,owner){const box=counterInfoBeforeV1721(id,owner);if(id==='A'){for(const p of box.querySelectorAll('p'))if(/5 Kampfrunden|Kampftechniken kosten ihre angegebene Ausdauer zusätzlich/.test(p.textContent))p.remove();box.prepend(el('p',{text:'Eine körperlich geführte Kampfrunde kostet 1 A einschließlich normalem Angriff. Die erste Technik ersetzt diesen Grundpreis durch ihren Gesamtpreis; reine Wirker-Runden kosten nur M, GB oder FS.'}))}return box};
const skillSpendInfoBeforeV1721=skillSpendInfoV179;
skillSpendInfoV179=function(owner,skill){const box=skillSpendInfoBeforeV1721(owner,skill);if(COMBAT_SKILL_IDS_V178.has(skill.id))box.prepend(el('p',{class:'notice',text:'Ein normaler Angriff steckt bereits in der 1 A für die körperliche Runde. Ein manueller A-Abzug dieser Kampffähigkeit kann diese Grund-A bezahlen; für gelernte Techniken die eigene Schaltfläche benutzen.'}));return box};
const renderEffectsBeforeV1721=renderEffectsV177;
renderEffectsV177=function(owner){
  const box=renderEffectsBeforeV1721(owner),round=ensureCombatRoundV1721(owner),panel=el('section',{class:'combat-round-panel-v1721','aria-label':'Kampfrunde abrechnen'}),choices=el('div',{class:'combat-round-choices-v1721'});
  panel.append(el('strong',{text:`Kampfrunde ${round.number}`}),el('p',{class:'muted',text:`Offene Runde · bereits bezahlter Technik-/Grundpreis ${round.paidCost} A · beim Abschluss noch ${roundPreviewV1721(owner)} A Grundkosten.`}));
  for(const[mode,label]of Object.entries(V1721_MODES)){const button=el('button',{type:'button',text:label,'aria-pressed':String(round.mode===mode),disabled:mode!=='physical'&&round.paidCost>0});button.onclick=()=>setCombatModeV1721(owner,mode);choices.append(button)}
  panel.append(choices,el('p',{class:'muted',text:'Normaler Angriff: „Körperlich gekämpft“ wählen. Reine Zauber-/Wunder-/Fluchrunde: „Nur Kraft gewirkt“; dabei fallen keine A-Grundkosten an.'}));
  const techniqueUndo=el('button',{type:'button',text:'Letzte Technik rückgängig',disabled:round.payments.at(-1)?.kind!=='technique',onclick:()=>{if(!undoLastTechniqueV1721(owner))showToastV179('Technikeinsatz kann nach späteren Counteränderungen nicht sicher zurückgenommen werden.')}});panel.append(techniqueUndo);
  const undo=el('button',{type:'button',text:'Letzte Runde rückgängig',disabled:!owner.combatRoundUndoV1721,onclick:()=>undoCombatRoundV1721(owner)});panel.append(undo);
  (box.querySelector('.effect-time-v1710')||box.querySelector('.effect-event-actions-v177'))?.before(panel);return box;
};

const balanceStyleV1721=el('style',{text:`.combat-round-panel-v1721{border:1px solid var(--accent-2);border-radius:10px;padding:.7rem;margin:.6rem 0;background:var(--panel-alt)}.combat-round-panel-v1721 p{margin:.35rem 0}.combat-round-choices-v1721{display:flex;gap:.4rem;flex-wrap:wrap}.combat-round-choices-v1721 button[aria-pressed="true"]{background:var(--accent);color:var(--panel)}.combat-round-panel-v1721 button{min-height:42px}@media print{.combat-round-choices-v1721,.combat-round-panel-v1721 button{display:none!important}}`});document.head.append(balanceStyleV1721);

const runTestsBeforeV1721=runTests;
function runTestsV1721(){
  try{runTestsBeforeV1721()}catch(error){console.error('Alte integrierte Tests',error)}
  const body=testResults.querySelector('tbody');
  const obsolete=/^(Version 1\.7\.|Schema.*(?:15|17|25)|Regelstand.*(?:10|11)|Revision v1\.7\.|Vier Runden kosten nichts|Fünfte Runde kostet 1 A|Zehnte Runde kostet insgesamt 2 A)/;
  for(const row of[...body.querySelectorAll('tr')])if(obsolete.test(row.cells[0]?.textContent||''))row.remove();
  const tests=[],eq=(name,expected,actual)=>tests.push([name,expected,actual,expected===actual]);
  eq('Version 1.7.21',V1721_VERSION,APP_VERSION);eq('Schema 26',V1721_SCHEMA,SCHEMA_VERSION);eq('Regelstand 12',V1721_RULES,RULES_VERSION);
  eq('56 Techniken',56,COMBAT_ENTRIES_V178.length);eq('Neue Kostenverteilung','22|25|9|0',[1,2,3,4].map(cost=>COMBAT_ENTRIES_V178.filter(entry=>entry.staminaCost===cost).length).join('|'));
  const fighter=newCharacter();fighter.counters.A={max:5,current:5};fighter.counters.L={max:10,current:10};for(let i=0;i<4;i++){fighter.combatRoundV1721.mode='physical';closeCombatRoundV1721(fighter,{effects:false,persist:false,notify:false})}eq('Vier körperliche Runden kosten 4 A',1,fighter.counters.A.current);
  const mage=newCharacter();mage.counters.A={max:5,current:5};for(let i=0;i<4;i++){mage.combatRoundV1721.mode='power';closeCombatRoundV1721(mage,{effects:false,persist:false,notify:false})}eq('Vier reine Wirker-Runden kosten 0 A',5,mage.counters.A.current);
  const entry=COMBAT_BY_ID_V178.get('tech_light_melee_mortal_opening'),owner=newCharacter();owner.skills.skill_1.level=15;owner.skills.skill_1.learnedTechniqueIds=[entry.id];owner.counters.A={max:5,current:5};eq('Meisterschaft S15 senkt 2 A auf 1 A',1,techniquePaymentV1721(owner,entry).due);useTechniqueV1721(owner,entry.id,{persist:false,notify:false,debounce:false});eq('Technik deckt Grundpreis',0,roundPreviewV1721(owner));eq('Technik belastet 1 A',4,owner.counters.A.current);closeCombatRoundV1721(owner,{effects:false,persist:false,notify:false});eq('Rundenabschluss belastet Technik nicht doppelt',4,owner.counters.A.current);
  const s25=newCharacter();s25.skills.skill_2.level=25;eq('Meisterschaft S25 senkt 3 A auf 1 A',1,techniquePaymentV1721(s25,COMBAT_BY_ID_V178.get('tech_heavy_melee_titan_blow')).due);
  const choking=newCharacter();choking.counters.A={max:2,current:0};choking.counters.L={max:5,current:5};choking.activeEffectsV177.push(effectInstanceV177({definitionId:V1721_CHOKE_ID}));closeCombatRoundV1721(choking,{effects:true,persist:false,notify:false});eq('Erstickend bei A 0 kostet genau 1 LP','0|4',`${choking.counters.A.current}|${choking.counters.L.current}`);
  eq('Regelkonfiguration enthält körperliche Runde',1,rules.combat?.physicalRoundA);eq('Regelkonfiguration enthält keine Wirker-A',0,rules.combat?.powerOnlyRoundA);
  for(const test of tests)body.append(el('tr',{},[test[0],test[1],test[2],test[3]?'Bestanden':'Fehler'].map(value=>el('td',{text:String(value)}))));
  return[...body.querySelectorAll('tr')].every(row=>row.cells[row.cells.length-1]?.textContent==='Bestanden');
}
runTests=runTestsV1721;testsBtn.onclick=runTestsV1721;
renderAll();save();
Object.assign(window.Eberos,{version:V1721_VERSION,revision:V1721_REVISION,schemaVersion:V1721_SCHEMA,rulesVersion:V1721_RULES,runTests:runTestsV1721,ensureStateV1721,ensureCombatRoundV1721,techniquePaymentV1721,useTechniqueV1721,closeCombatRoundV1721,undoCombatRoundV1721,advanceCombatClockV178,advanceEffects:advanceEffectsV177,refillOwnerV179});
