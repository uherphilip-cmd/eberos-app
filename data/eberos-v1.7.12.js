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

/* Patch r2: vereinfachte CBP-Abrechnung und sichere Zahlungen für gelernte Kräfte. */
const V1712_REVISION='r2';
const actionPaymentStyleV1712R2=el('style',{text:`
.accounting-panel-v1712r2 .cost-breakdown{display:grid;gap:.25rem;margin-top:.55rem}.accounting-panel-v1712r2 .cost-breakdown span{display:block}
.learned-action-v1712r2{margin-top:.8rem;padding-top:.75rem;border-top:1px solid var(--border);display:grid;gap:.55rem}.learned-action-v1712r2>.primary{justify-self:start}.learned-action-confirm-v1712r2{display:grid;gap:.6rem;padding:.7rem;border:1px solid var(--border);border-radius:var(--radius);background:var(--panel-alt)}
.learned-action-controls-v1712r2{display:flex;gap:.5rem;flex-wrap:wrap;align-items:end}.learned-action-controls-v1712r2 label{min-width:10rem;flex:1}.learned-action-counter-v1712r2[aria-pressed="true"]{background:var(--accent);color:var(--header-text)}
.learned-action-summary-v1712r2{display:grid;gap:.25rem}.learned-action-summary-v1712r2 strong,.learned-action-summary-v1712r2 span{display:block}.learned-action-manual-v1712r2{border-left-color:var(--accent-2)}
@media(max-width:600px){.learned-action-v1712r2>.primary,.learned-action-confirm-v1712r2>.primary{width:100%}.learned-action-controls-v1712r2{display:grid;grid-template-columns:1fr;width:100%}.learned-action-controls-v1712r2 label{min-width:0}}
`});document.head.append(actionPaymentStyleV1712R2);

ACCOUNTING_MODES.character='Vom Charakterbudget bezahlen';
ACCOUNTING_MODES['own-budget']='Eigenes Reiterbudget verwenden';
ACCOUNTING_MODES.free='Kostenfrei';
delete ACCOUNTING_MODES.informational;

function accountingEntriesV1712R2(owner){
  return[owner.family,owner.startPackage,...(owner.possessionModules||[]),...(owner.incomeSources||[]),...(owner.rightsEntries||[])].filter(Boolean);
}
function migrateAccountingEntryV1712R2(entry,owner,isCharacter,changes){
  entry.accounting=entry.accounting||{mode:'inherit'};
  const mode=entry.accounting.mode||'inherit';
  if(mode==='informational'){
    entry.accounting.mode='free';changes.push('„Nur dokumentieren“ zu „Kostenfrei“ zusammengeführt');return;
  }
  if(mode==='own-budget'&&!isCharacter&&owner.accounting?.mode==='own-budget'){
    entry.accounting.mode='inherit';changes.push('Untergeordnetes eigenes Budget übernimmt jetzt den Reiterstandard');return;
  }
  if(!['inherit','character','own-budget','free'].includes(mode)){
    entry.accounting.legacyModeV1712R2=mode;entry.accounting.mode='free';changes.push(`Unbekannte Abrechnungsart „${mode}“ kostenneutral erhalten`);
  }
}
function ensureStateV1712R2(data,log=true){
  if(!data||typeof data!=='object')return data;
  const first=!data.v1712R2AccountingDone,changes=[];
  if(first)for(const character of data.characters||[]){
    ensureUniversalOwnerV173(character);
    for(const entry of accountingEntriesV1712R2(character))migrateAccountingEntryV1712R2(entry,character,true,changes);
    for(const owner of character.auxiliaryTabs||[]){
      ensureAuxV171(owner);ensureUniversalOwnerV173(owner);owner.accounting=owner.accounting||{mode:'free'};
      if(owner.accounting.mode==='informational'){owner.accounting.mode='free';changes.push('Zusatzreiter „Nur dokumentieren“ zu „Kostenfrei“ zusammengeführt')}
      if(!['character','own-budget','free'].includes(owner.accounting.mode)){owner.accounting.legacyModeV1712R2=owner.accounting.mode;owner.accounting.mode='free';changes.push('Unbekannte Reiterabrechnung kostenneutral erhalten')}
      for(const entry of accountingEntriesV1712R2(owner))migrateAccountingEntryV1712R2(entry,owner,false,changes);
    }
  }
  data.appVersion=V1712_VERSION;data.schemaVersion=V1712_SCHEMA;data.v1712R2AccountingDone=true;
  if(first&&log){data.migrationLog=Array.isArray(data.migrationLog)?data.migrationLog:[];data.migrationLog.push({from:20,to:20,at:new Date().toISOString(),changes:[...new Set(changes.length?changes:['CBP-Abrechnung ohne Kostenänderung auf r2 vereinheitlicht'])]})}
  return data;
}
const migrateStateBeforeV1712R2=migrateState;
migrateState=function(data){return ensureStateV1712R2(migrateStateBeforeV1712R2(data),true)};
if(!state.v1712R2AccountingDone)try{localStorage.setItem(STORE+'.backup.v1712-r2.'+Date.now(),JSON.stringify(state))}catch{}
state=ensureStateV1712R2(state,true);

const costsBeforeV1712R2=costs;
costs=function(character){
  const result=costsBeforeV1712R2(character),free=(+result['Kostenlos erhalten']||0)+(+result['Nur dokumentiert']||0);
  delete result['Kostenlos erhalten'];delete result['Nur dokumentiert'];result.Kostenfrei=free;return result;
};

function effectiveEntryAccountingV1712R2(entry,owner){return entryModeV173(entry,owner)}
function accountingLabelV1712R2(mode){return mode==='character'?'Vom Charakterbudget':mode==='own-budget'?'Eigenes Reiterbudget':'Kostenfrei'}
renderEntryAccountingV173=function(entry,owner,costFn){
  entry.accounting=entry.accounting||{mode:'inherit'};const isCharacter=owner===ch()||(!owner.type&&Array.isArray(owner.auxiliaryTabs)),current=entry.accounting.mode||'inherit',box=el('div',{class:'accounting-panel accounting-panel-v1712r2'}),select=el('select',{'aria-label':'CBP-Abrechnung'});
  if(isCharacter){
    select.append(el('option',{value:'character',text:'Vom Charakterbudget bezahlen'}),el('option',{value:'free',text:'Kostenfrei'}));
    if(current==='own-budget')select.append(el('option',{value:'own-budget',text:'Eigenes Budget · Altbestand'}));
    select.value=current==='inherit'?'character':current;
  }else{
    select.append(el('option',{value:'inherit',text:`Wie Reiter abrechnen (${accountingLabelV1712R2(owner.accounting?.mode||'free')})`}),el('option',{value:'character',text:'Vom Charakterbudget abziehen'}),el('option',{value:'free',text:'Kostenfrei'}));
    if(current==='own-budget'&&owner.accounting?.mode!=='own-budget')select.append(el('option',{value:'own-budget',text:'Eigenes Reiterbudget · Altbestand'}));
    select.value=current==='own-budget'&&owner.accounting?.mode==='own-budget'?'inherit':current;
  }
  select.onchange=event=>{entry.accounting.mode=event.target.value;saveOwnerV173(owner,true)};
  const cost=Math.max(0,+costFn()||0),characterCost=chargedEntryCostV173(entry,owner,cost),ownCost=ownEntryCostV173(entry,owner,cost),effective=effectiveEntryAccountingV1712R2(entry,owner);
  box.append(el('label',{class:'field'},[el('span',{text:'CBP-Abrechnung'}),select]),el('div',{class:'cost-breakdown'},[
    el('span',{text:`Vergleichswert: ${cost} CBP`}),el('span',{text:`Abrechnung: ${accountingLabelV1712R2(effective)}`}),el('span',{text:`Charakterbudget: −${characterCost} CBP`}),el('span',{text:`Eigenes Reiterbudget: −${ownCost} CBP`})
  ]));return box;
};
npcAccountingModeTextR7=function(owner){
  const charged=auxChargedCost(owner);if(owner.accounting?.mode==='character')return`Die Kosten werden bei der Charaktererschaffung vom Charakterbudget abgezogen: ${charged} CBP.`;
  if(owner.accounting?.mode==='own-budget')return'Die Kosten werden im eigenen Budget dieses Reiters geführt und nicht vom Charakterbudget abgezogen.';
  return'Der Eintrag ist kostenfrei. Sein Vergleichswert bleibt sichtbar, das Charakterbudget wird nicht belastet.';
};

const POWER_COUNTER_WORDS_V1712R2={Mana:'M',Glaube:'GB',Finsternis:'FS',Ausdauer:'A',Fokus:'FO',Leben:'L',Lebenspunkte:'L'};
function counterIdsFromPowerTextV1712R2(text){const ids=[];for(const[word,id]of Object.entries(POWER_COUNTER_WORDS_V1712R2))if(String(text||'').includes(word)&&!ids.includes(id))ids.push(id);return ids}
function powerPaymentDefinitionV1712R2(entry){
  const cost=String(entry?.counterCostText||'').trim();
  if(cost==='1 Mana')return{classified:true,kind:'counter',counterIds:['M'],amount:1};
  if(cost==='1 Glaube')return{classified:true,kind:'counter',counterIds:['GB'],amount:1};
  if(cost==='1 Finsternis')return{classified:true,kind:'counter',counterIds:['FS'],amount:1};
  if(cost==='1 gewählter Counter'){const counterIds=counterIdsFromPowerTextV1712R2(entry.counterText);return{classified:counterIds.length>0,kind:'counter',counterIds,amount:1}}
  if(cost==='1 Glaube oder 1 Finsternis')return{classified:true,kind:'counter',counterIds:['GB','FS'],amount:1};
  if(cost==='1 Finsternis + 1 LP')return{classified:true,kind:'fixed-life',counterIds:['FS'],amount:1,life:1};
  if(cost==='1 Finsternis + bedeutende Fleischprobe')return{classified:true,kind:'manual-check',counterIds:['FS'],amount:1,manual:'Bedeutende Fleischprobe separat abhandeln.'};
  if(cost==='1 Finsternis + körperliche Probe')return{classified:true,kind:'manual-check',counterIds:['FS'],amount:1,manual:'Körperliche Probe separat abhandeln.'};
  if(cost==='1 Finsternis + bis zu W geopferte LP')return{classified:true,kind:'variable-life',counterIds:['FS'],amount:1,lifeMaximum:'W',lifeMinimum:1};
  if(cost==='1 Mana + geopferte LP')return{classified:true,kind:'variable-life',counterIds:['M'],amount:1,lifeMaximum:'W',lifeMinimum:1};
  if(cost==='1 Finsternis + S LP oder bedeutende Opfergabe')return{classified:true,kind:'life-or-offering',counterIds:['FS'],amount:1};
  if(cost==='1 Glaube je geschütztem Ziel')return{classified:true,kind:'per-target',counterIds:['GB'],amount:1};
  if(cost==='1 Mana zusätzlich zu den Kosten des gebundenen Zaubers')return{classified:true,kind:'bound-extra',counterIds:['M'],amount:1};
  if(cost==='2 Mana; je 1 für beide Teilzauber')return{classified:true,kind:'counter',counterIds:['M'],amount:2};
  if(cost==='Keine; höchstens B Auslösungen je 8 Stunden')return{classified:true,kind:'free',counterIds:[],amount:0,manual:'Höchstens B Auslösungen je 8 Stunden beachten.'};
  return{classified:false,kind:'unknown',counterIds:[],amount:0,manual:`Nicht klassifizierte Kosten: ${cost||'keine Angabe'}`};
}
function validatePowerPaymentsV1712R2(){const errors=[];for(const entry of POWER_ENTRIES_V176){const definition=powerPaymentDefinitionV1712R2(entry);if(!definition.classified)errors.push(`${entry.id}: ${definition.manual}`);if(definition.kind!=='free'&&!definition.counterIds.length)errors.push(`${entry.id}: kein Hauptcounter`)}return{ok:!errors.length,classified:POWER_ENTRIES_V176.length-errors.length,errors}}
const POWER_PAYMENT_VALIDATION_V1712R2=validatePowerPaymentsV1712R2();
if(!POWER_PAYMENT_VALIDATION_V1712R2.ok)console.error('Unvollständige Kraftkostenklassifikation',POWER_PAYMENT_VALIDATION_V1712R2.errors);

function actionCounterComponentsV1712R2(components){
  const totals=new Map();for(const component of components||[]){const id=component.counterId,amount=Math.max(0,Math.floor(+component.amount||0));if(id&&amount)totals.set(id,(totals.get(id)||0)+amount)}return[...totals].map(([counterId,amount])=>({counterId,amount}));
}
function actionPaymentPlanV1712R2(owner,components){
  ensureOwnerV178(owner);const requested=new Map(actionCounterComponentsV1712R2(components).map(component=>[component.counterId,component.amount])),spent=new Map(),missing=[],fallback=[];
  let requiredLife=requested.get('L')||0;
  for(const id of['A','FO'])if(requested.has(id)){const state=counterStateV179(owner,id),amount=requested.get(id),primary=Math.min(state.current,amount),deficit=amount-primary;spent.set(id,primary);requiredLife+=deficit;if(deficit)fallback.push({counterId:id,amount:deficit})}
  for(const[id,amount]of requested)if(!['A','FO','L'].includes(id)){const state=counterStateV179(owner,id),used=Math.min(state.current,amount);spent.set(id,used);if(used<amount)missing.push({counterId:id,amount:amount-used})}
  if(requiredLife){const state=counterStateV179(owner,'L'),used=Math.min(state.current,requiredLife);spent.set('L',used);if(used<requiredLife)missing.push({counterId:'L',amount:requiredLife-used})}
  const changes=[];for(const[id,amount]of spent)if(amount){const state=counterStateV179(owner,id);changes.push({counterId:id,name:state.name,before:state.current,spent:amount,after:state.current-amount})}
  return{valid:missing.length===0,requested:[...requested].map(([counterId,amount])=>({counterId,amount})),changes,missing,fallback};
}
let lastActionPaymentV1712R2=null,actionPaymentGuardV1712R2={key:'',at:0};
function actionPaymentTextV1712R2(components){const totals=actionCounterComponentsV1712R2(components);return totals.length?totals.map(item=>`${item.amount} ${item.counterId==='L'?'LP':item.counterId}`).join(' + '):'keine Counterkosten'}
function showActionPaymentToastV1712R2(transaction){
  let toast=document.getElementById('toastV179');if(!toast){toast=el('div',{id:'toastV179',class:'toast-v179 no-print',role:'status','aria-live':'polite'});document.body.append(toast)}
  const undo=el('button',{type:'button',text:'Rückgängig',onclick:()=>undoActionPaymentV1712R2(transaction.id)}),text=transaction.changes.map(change=>`${change.counterId==='L'?'LP':change.counterId} ${change.before}→${change.after}`).join(' · ');
  toast.classList.add('counter-spend-toast-host-v179');toast.replaceChildren(el('div',{class:'counter-spend-toast-v179'},[el('span',{text:`${transaction.label}: ${text}`}),undo]));toast.hidden=false;clearTimeout(showToastV179.timer);showToastV179.timer=setTimeout(()=>toast.hidden=true,5200);
}
function commitActionPaymentV1712R2(owner,components,sourceId,label,options={}){
  const plan=actionPaymentPlanV1712R2(owner,components);if(!plan.valid)return false;const now=Date.now(),key=`${owner.id}|${sourceId}|${JSON.stringify(plan.requested)}`;
  if(options.debounce!==false&&actionPaymentGuardV1712R2.key===key&&now-actionPaymentGuardV1712R2.at<700)return false;actionPaymentGuardV1712R2={key,at:now};
  for(const change of plan.changes)setCounterCurrentR8(owner,change.counterId,change.after);
  const transaction={id:uid(),ownerId:owner.id,ownerRef:owner,sourceId,label,changes:plan.changes.map(change=>({...change})),used:false};lastActionPaymentV1712R2=transaction;
  if(options.persist!==false)saveOwnerV173(owner,options.render!==false);if(options.notify!==false)showActionPaymentToastV1712R2(transaction);return transaction;
}
function undoActionPaymentV1712R2(transactionId=lastActionPaymentV1712R2?.id,options={}){
  const transaction=lastActionPaymentV1712R2,owner=transaction&&(transaction.ownerRef||ownerByIdV179(transaction.ownerId));if(!transaction||transaction.used||transaction.id!==transactionId||!owner)return false;
  transaction.used=true;for(const change of transaction.changes){const counter=owner.counters?.[change.counterId];if(counter)counter.current=Math.min(Math.max(0,+counter.max||0),Math.max(0,+counter.current||0)+change.spent)}lastActionPaymentV1712R2=null;
  if(options.persist!==false)saveOwnerV173(owner,options.render!==false);if(options.notify!==false)showToastV179(`Rückgängig: ${transaction.label} vollständig wiederhergestellt.`);return true;
}

function actionDisclosureV1712R2(triggerText,ariaLabel,build){
  const section=el('section',{class:'learned-action-v1712r2'}),trigger=el('button',{type:'button',class:'primary learned-action-trigger-v1712r2',text:triggerText,'aria-label':ariaLabel,'aria-expanded':'false'}),body=el('div',{class:'learned-action-confirm-v1712r2',hidden:true});
  trigger.onclick=()=>{const opening=body.hidden;body.hidden=!opening;trigger.setAttribute('aria-expanded',String(opening));if(opening){body.replaceChildren();build(body)}};section.append(trigger,body);return section;
}
function appendPaymentSummaryV1712R2(host,plan,components){
  const summary=el('div',{class:'learned-action-summary-v1712r2','aria-live':'polite'},[el('strong',{text:`Gesamtzahlung: ${actionPaymentTextV1712R2(components)}`})]);
  for(const change of plan.changes)summary.append(el('span',{text:`${change.name} (${change.counterId}): ${change.before} → ${change.after}`}));
  for(const item of plan.fallback)summary.append(el('span',{text:`Fehlende ${item.counterId} werden mit ${item.amount} LP bezahlt.`}));
  if(plan.missing.length)summary.append(el('span',{class:'notice error',text:`Nicht ausreichend: ${plan.missing.map(item=>`${item.amount} ${item.counterId==='L'?'LP':item.counterId}`).join(', ')}`}));host.append(summary);return summary;
}
function combatTechniqueActionV1712R2(entry,owner){
  const cost=Math.max(0,+entry.staminaCost||0),label=`${entry.name} einsetzen`;
  return actionDisclosureV1712R2(`Technik einsetzen · ${cost} A`,`${entry.name} einsetzen und ${cost} Ausdauer bezahlen`,host=>{
    const components=[{counterId:'A',amount:cost}],plan=actionPaymentPlanV1712R2(owner,components);host.append(el('strong',{text:label}),el('p',{class:'muted',text:'Noch wurde nichts abgezogen. Bestätige erst nach dem Auslösen der Technik.'}));appendPaymentSummaryV1712R2(host,plan,components);
    host.append(el('button',{type:'button',class:'primary',text:'Technik einsetzen und Kosten abziehen',disabled:!plan.valid,onclick:()=>commitActionPaymentV1712R2(owner,components,entry.id,label)}));
  });
}
function powerActionVerbV1712R2(entry){return entry.powerKind==='miracle'?'Wunder wirken':entry.powerKind==='curse'?'Fluch wirken':'Zauber wirken'}
function dieMaximumV1712R2(owner,entry){const value=dieValueV176(effectiveSkillLevelV176(owner,entry.skillId)),match=String(value).match(/\d+/);return Math.max(1,+(match?.[0]||1))}
function powerActionComponentsV1712R2(entry,owner,ui){
  const definition=powerPaymentDefinitionV1712R2(entry),counterId=ui.counterId||definition.counterIds[0],reinforcement=entry.reinforceable?Math.max(0,Math.min(2,+ui.reinforcement||0)):0,components=[],manual=[],ready=definition.classified;
  if(definition.kind==='counter'||definition.kind==='fixed-life'||definition.kind==='manual-check'||definition.kind==='variable-life'||definition.kind==='life-or-offering'||definition.kind==='bound-extra')components.push({counterId,amount:definition.amount+reinforcement});
  if(definition.kind==='per-target')components.push({counterId,amount:Math.max(1,+ui.quantity||1)});
  if(definition.kind==='fixed-life')components.push({counterId:'L',amount:definition.life});
  if(definition.kind==='variable-life')components.push({counterId:'L',amount:Math.max(definition.lifeMinimum||0,+ui.life||0)});
  if(definition.kind==='life-or-offering'){
    if(ui.offeringMode==='offering')manual.push('Bedeutende Opfergabe separat erbringen.');else components.push({counterId:'L',amount:effectiveSkillLevelV176(owner,entry.skillId)});
  }
  if(definition.kind==='bound-extra')for(const[id,amount]of Object.entries(ui.boundExtra||{}))components.push({counterId:id,amount:Math.max(0,+amount||0)});
  if(definition.kind==='manual-check')manual.push(definition.manual);
  if(definition.kind==='free'&&definition.manual)manual.push(definition.manual);
  if(definition.kind==='bound-extra')manual.push('Kosten des gebundenen Zaubers vollständig in den Zusatzfeldern erfassen.');
  if(definition.kind==='unknown')manual.push(definition.manual);
  return{definition,counterId,reinforcement,components:actionCounterComponentsV1712R2(components),manual,ready:ready&&(definition.kind!=='bound-extra'||!!ui.boundConfirmed)&&(definition.kind!=='life-or-offering'||ui.offeringMode!=='offering'||!!ui.offeringConfirmed)};
}
function powerActionV1712R2(entry,owner){
  const definition=powerPaymentDefinitionV1712R2(entry),verb=powerActionVerbV1712R2(entry),ui={counterId:definition.counterIds[0]||'',reinforcement:0,quantity:1,life:definition.lifeMinimum||1,offeringMode:'life',offeringConfirmed:false,boundConfirmed:false,boundExtra:{M:0,GB:0,FS:0,L:0}};
  return actionDisclosureV1712R2(`${verb} · ${entry.counterCostText}`,`${entry.displayName}: Zahlung vorbereiten`,host=>{
    const controls=el('div',{class:'learned-action-controls-v1712r2'}),summary=el('div'),confirmHost=el('div');host.append(el('strong',{text:`${entry.displayName} – Zahlung bestätigen`}),el('p',{class:'muted',text:'Der erste Klick öffnet nur diese Übersicht. Counter werden erst mit dem Bestätigungsbutton abgezogen.'}),controls,summary,confirmHost);
    const draw=()=>{
      controls.replaceChildren();const payment=powerActionComponentsV1712R2(entry,owner,ui),s=effectiveSkillLevelV176(owner,entry.skillId);
      if(definition.counterIds.length>1)for(const id of definition.counterIds){const state=counterStateV179(owner,id),button=el('button',{type:'button',class:'learned-action-counter-v1712r2',text:`${state.name} (${id}) · ${state.current}/${state.max}`,'aria-pressed':String(ui.counterId===id)});button.onclick=()=>{ui.counterId=id;draw()};controls.append(button)}
      if(entry.reinforceable){const select=el('select',{'aria-label':'Verstärkung'});[['0','Grundwirkung'],['1','Verstärkung V1'],['2','Verstärkung V2']].forEach(([value,text])=>select.append(el('option',{value,text})));select.value=String(ui.reinforcement);select.onchange=event=>{ui.reinforcement=+event.target.value;draw()};controls.append(el('label',{class:'field'},[el('span',{text:'Verstärkung'}),select]))}
      if(definition.kind==='per-target'){const maximum=Math.max(1,Math.ceil(s/2)),input=el('input',{type:'number',min:1,max:maximum,value:Math.min(maximum,ui.quantity)});ui.quantity=Math.min(maximum,Math.max(1,+ui.quantity||1));input.onchange=event=>{ui.quantity=Math.min(maximum,Math.max(1,+event.target.value||1));draw()};controls.append(el('label',{class:'field'},[el('span',{text:`Geschützte Ziele · maximal ${maximum}`}),input]))}
      if(definition.kind==='variable-life'){const maximum=dieMaximumV1712R2(owner,entry),minimum=definition.lifeMinimum||0;ui.life=Math.min(maximum,Math.max(minimum,+ui.life||minimum));const input=el('input',{type:'number',min:minimum,max:maximum,value:ui.life});input.onchange=event=>{ui.life=Math.min(maximum,Math.max(minimum,+event.target.value||minimum));draw()};controls.append(el('label',{class:'field'},[el('span',{text:`Geopferte eigene LP · maximal ${maximum} (${dieValueV176(s)})`}),input]))}
      if(definition.kind==='life-or-offering'){
        const select=el('select',{'aria-label':'LP oder Opfergabe'});select.append(el('option',{value:'life',text:`${s} LP bezahlen`}),el('option',{value:'offering',text:'Bedeutende Opfergabe'}));select.value=ui.offeringMode;select.onchange=event=>{ui.offeringMode=event.target.value;draw()};controls.append(el('label',{class:'field'},[el('span',{text:'Zusatzkosten'}),select]));
        if(ui.offeringMode==='offering'){const check=el('input',{type:'checkbox',checked:ui.offeringConfirmed});check.onchange=event=>{ui.offeringConfirmed=event.target.checked;draw()};controls.append(el('label',{class:'field'},[el('span',{text:'Opfergabe separat bestätigt'}),check]))}
      }
      if(definition.kind==='bound-extra'){
        for(const id of['M','GB','FS','L']){const input=el('input',{type:'number',min:0,max:99,value:ui.boundExtra[id]||0});input.onchange=event=>{ui.boundExtra[id]=Math.max(0,+event.target.value||0);draw()};controls.append(el('label',{class:'field'},[el('span',{text:`Gebundener Zauber · ${id==='L'?'LP':id}`}),input]))}
        const check=el('input',{type:'checkbox',checked:ui.boundConfirmed});check.onchange=event=>{ui.boundConfirmed=event.target.checked;draw()};controls.append(el('label',{class:'field'},[el('span',{text:'Gebundene Zauberkosten vollständig erfasst'}),check]));
      }
      const plan=actionPaymentPlanV1712R2(owner,payment.components);summary.replaceChildren();appendPaymentSummaryV1712R2(summary,plan,payment.components);for(const note of payment.manual)summary.append(el('p',{class:'notice learned-action-manual-v1712r2',text:`Zusätzlich manuell zu erfüllen: ${note}`}));
      confirmHost.replaceChildren();const free=definition.kind==='free',button=el('button',{type:'button',class:'primary',text:free?'Wirken · keine Counterkosten':'Wirken und Kosten abziehen',disabled:!payment.ready||!plan.valid});button.onclick=()=>{if(free){showToastV179(`${entry.displayName}: keine Counterkosten abgezogen.`);button.disabled=true;return}commitActionPaymentV1712R2(owner,payment.components,entry.id,`${entry.displayName} wirken`)};confirmHost.append(button);
    };draw();
  });
}

const renderLearnedPowerBeforeV1712R2=renderLearnedPowerV176;
renderLearnedPowerV176=function(owner,skillId,powerId){
  const row=renderLearnedPowerBeforeV1712R2(owner,skillId,powerId),entry=POWER_BY_ID_V176.get(powerId);if(!entry)return row;row.dataset.learnedPowerIdV1712R2=powerId;
  const detail=row.querySelector('.power-inline-detail-v176'),info=[...row.querySelectorAll('.power-actions-v176 button')].find(button=>button.textContent==='Details');if(!detail||!info)return row;const open=info.onclick;
  info.onclick=event=>{open?.call(info,event);if(!detail.hidden&&!detail.querySelector('.learned-action-v1712r2'))detail.append(powerActionV1712R2(entry,owner))};return row;
};
const renderLearnedTechniqueBeforeV1712R2=renderLearnedCombatTechniqueV176;
renderLearnedCombatTechniqueV176=function(owner,skillId,techniqueId){
  const row=renderLearnedTechniqueBeforeV1712R2(owner,skillId,techniqueId),entry=COMBAT_BY_ID_V178.get(techniqueId);if(!entry)return row;row.dataset.learnedTechniqueIdV1712R2=techniqueId;
  const detail=row.querySelector('.power-inline-detail-v176'),info=[...row.querySelectorAll('.power-actions-v176 button')].find(button=>button.textContent==='Details');if(!detail||!info)return row;const open=info.onclick;
  info.onclick=event=>{open?.call(info,event);if(!detail.hidden&&!detail.querySelector('.learned-action-v1712r2'))detail.append(combatTechniqueActionV1712R2(entry,owner))};return row;
};

const runTestsBeforeV1712R2=runTests;
function runTestsV1712R2(){
  runTestsBeforeV1712R2();const historicalBody=testResults.querySelector('tbody'),baseOk=![...historicalBody.querySelectorAll('tr')].some(row=>row.cells[row.cells.length-1]?.textContent==='Fehler'),tests=[],eq=(name,expected,actual)=>tests.push([name,expected,actual,expected===actual]);
  eq('Revision r2','r2',V1712_REVISION);eq('405 Kraftkosten klassifiziert',405,POWER_PAYMENT_VALIDATION_V1712R2.classified);eq('Keine unklassifizierten Kraftkosten',true,POWER_PAYMENT_VALIDATION_V1712R2.ok);
  const main=newCharacter(),mainEntry={active:true,accounting:{mode:'inherit'}},mainPanel=renderEntryAccountingV173(mainEntry,main,()=>5);eq('Hauptcharakter hat zwei Abrechnungsarten',2,mainPanel.querySelectorAll('select option').length);
  const aux=newAuxEntry('npc','Abrechnung');aux.accounting.mode='own-budget';const nested={active:true,accounting:{mode:'inherit'}},auxPanel=renderEntryAccountingV173(nested,aux,()=>5);eq('Untereintrag hat drei Abrechnungsarten',3,auxPanel.querySelectorAll('select option').length);
  const beforeMode=entryModeV173(nested,aux);aux.accounting.mode='free';eq('Wie Reiter folgt dem Reitermodus','own-budget|free',`${beforeMode}|${entryModeV173(nested,aux)}`);
  const oldCharacter=newCharacter(),oldAux=newAuxEntry('possession','Altbudget');oldAux.accounting.mode='own-budget';oldAux.ownBudget=10;oldAux.possessionModules=[{id:'legacy-own',name:'Kleines Eigentum',qty:1,active:true,range:'local',accounting:{mode:'own-budget'}}];oldCharacter.family={name:'Alt',cost:4,active:true,accounting:{mode:'informational'}};oldCharacter.auxiliaryTabs=[oldAux];const oldState={characters:[oldCharacter],migrationLog:[]},beforeCosts=costsBeforeV1712R2(oldCharacter),beforeComparison=auxDisplayCost(oldAux);ensureStateV1712R2(oldState,true);const afterCosts=costsBeforeV1712R2(oldCharacter),snapshot=JSON.stringify(oldState);ensureStateV1712R2(oldState,true);
  eq('Migration erhält ausgegebene Charakter-CBP',beforeCosts.spent,afterCosts.spent);eq('Migration erhält Rest-CBP',beforeCosts.rest,afterCosts.rest);eq('Migration erhält eigenes Reiterbudget',beforeCosts['Eigene Reiterbudgets'],afterCosts['Eigene Reiterbudgets']);eq('Migration erhält Vergleichswert',beforeComparison,auxDisplayCost(oldAux));eq('Migration ist idempotent',snapshot,JSON.stringify(oldState));eq('Nur dokumentieren wird Kostenfrei','free',oldCharacter.family.accounting.mode);eq('Eigenes Unterbudget erbt Reiterstandard','inherit',oldAux.possessionModules[0].accounting.mode);
  const fighter=newCharacter();ensureOwnerCombatTechniquesV176(fighter);const technique=COMBAT_ENTRIES_V178[0];fighter.skills[technique.skillId].level=1;fighter.skills[technique.skillId].learnedTechniqueIds=[technique.id];const learnedTechnique=renderLearnedCombatTechniqueV176(fighter,technique.skillId,technique.id);learnedTechnique.querySelector('.power-actions-v176 button')?.click();eq('Gelernte Technik hat Einsetzen-Button',true,!!learnedTechnique.querySelector('.learned-action-trigger-v1712r2'));const techniquePreview=renderCombatTechniqueSelectionV176(fighter,COMBAT_SCHOOLS_V178.find(school=>school.skillId===technique.skillId),0);eq('Technikvorschau hat keinen Einsetzen-Button',false,!!techniquePreview.querySelector('.learned-action-trigger-v1712r2'));
  fighter.counters.A={max:5,current:1};fighter.counters.L={max:8,current:5};const techniquePlan=actionPaymentPlanV1712R2(fighter,[{counterId:'A',amount:2}]),transaction=commitActionPaymentV1712R2(fighter,[{counterId:'A',amount:2}],technique.id,'Testtechnik',{persist:false,notify:false,debounce:false});eq('Technikzahlung plant A plus LP','A:1|L:1',techniquePlan.changes.map(change=>`${change.counterId}:${change.spent}`).join('|'));eq('Technikzahlung zieht atomar ab','0|4',`${fighter.counters.A.current}|${fighter.counters.L.current}`);undoActionPaymentV1712R2(transaction.id,{persist:false,notify:false});eq('Rückgängig stellt A und LP wieder her','1|5',`${fighter.counters.A.current}|${fighter.counters.L.current}`);
  const mage=newCharacter();ensureOwnerPowersV176(mage);const power=POWER_ENTRIES_V176.find(entry=>entry.counterCostText==='1 Mana');mage.skills[power.skillId].level=1;mage.skills[power.skillId].learnedPowerIds=[power.id];const learnedPower=renderLearnedPowerV176(mage,power.skillId,power.id);learnedPower.querySelector('.power-actions-v176 button')?.click();eq('Gelernte Kraft hat Wirken-Button',true,!!learnedPower.querySelector('.learned-action-trigger-v1712r2'));const school=POWER_SCHOOL_BY_SKILL_V176.get(power.skillId),powerPreview=renderPowerSelectionV176(mage,school,0);eq('Kraftvorschau hat keinen Wirken-Button',false,!!powerPreview.querySelector('.learned-action-trigger-v1712r2'));mage.counters.M={max:4,current:1};const powerTransaction=commitActionPaymentV1712R2(mage,[{counterId:'M',amount:1}],power.id,'Testzauber',{persist:false,notify:false,debounce:false});eq('Zauber zieht eigenen Counter ab',0,mage.counters.M.current);undoActionPaymentV1712R2(powerTransaction.id,{persist:false,notify:false});eq('Zauber-Rückgängig stellt Counter wieder her',1,mage.counters.M.current);mage.counters.M.current=0;eq('Unzureichender Kraftcounter blockiert Zahlung',false,!!commitActionPaymentV1712R2(mage,[{counterId:'M',amount:1}],power.id,'Blockiert',{persist:false,notify:false,debounce:false}));
  const body=testResults.querySelector('tbody');for(const[name,expected,actual,ok]of tests)body?.append(el('tr',{},[name,expected,actual,ok?'Bestanden':'Fehler'].map(value=>el('td',{text:String(value)}))));return baseOk&&tests.every(test=>test[3]);
}
runTests=runTestsV1712R2;testsBtn.onclick=runTestsV1712R2;
renderAll();save();
Object.assign(window.Eberos,{revision:V1712_REVISION,runTests:runTestsV1712R2,ensureStateV1712R2,powerPaymentDefinitionV1712R2,powerPaymentValidation:POWER_PAYMENT_VALIDATION_V1712R2,actionPaymentPlanV1712R2,commitActionPaymentV1712R2,undoActionPaymentV1712R2,lastActionPaymentV1712R2:()=>lastActionPaymentV1712R2});
