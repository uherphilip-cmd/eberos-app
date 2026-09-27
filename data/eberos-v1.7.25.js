'use strict';

/* Eberos v1.7.25: Exorzismus, Wirtschaft, konkrete Kerneffekte und direkte Kampfkosten */
const V1725_VERSION='1.7.25',V1725_REVISION='r4',V1725_SCHEMA=29,V1725_RULES=15;
const EXORCISM_SKILL_ID_V1725='skill_exorcism_expulsion',EXORCISM_SCHOOL_ID_V1725='exorcism_expulsion';
const ECONOMY_TRADE_SKILL_ID_V1725='skill_economy_trade';
const ECONOMY_TRADE_SCOPE_V1725='Beschreibt das Einschätzen von Warenwerten, Preisen, Märkten und Nachfrage, das Planen von Einkauf, Verkauf, Kosten, Gewinn, Kredit, Vorräten und Lieferketten sowie das Prüfen von Buchführung, Betrieben und wirtschaftlichen Risiken.';
const EXORCISM_Z12_ID_V1725='power_exorcism_expulsion_z12';
const EXORCISM_COMMON_TITLE_V1725='Gemeinsame Regeln: Besessenheit, Pakt und Gegenwehr';
const EXORCISM_COMMON_TEXT_V1725='BB bedeutet Besessenheitsbindung, PB bedeutet Paktbindung; B bleibt der Stufenbonus. Besessenheit und Pakt sind getrennte Datensätze. Keine Wirkung verändert beide, sofern sie dies nicht ausdrücklich sagt.\n\nDie Phase beschreibt die Zugriffsrechte einer Besessenheit; BB beschreibt ihre Haltbarkeit. Bindungspunkte werden nicht auf Wille addiert. Eine Gegenprobe entscheidet, ob die Kraft greift; die erzeugten Punkte bestimmen danach den Fortschritt an BB oder PB.\n\nEin befreiungswilliger Wirt kann unterstützen. Ein kooperierender Wirt oder freiwilliger Paktierer kann widerstehen. Für dieselbe unmittelbare Wirkung gibt es nur eine Gegenwehr. Bei Gegenständen und Orten widersteht die Wesenheit, der Anker oder ein gespeicherter Wirkwert.\n\nEine Austreibung vernichtet die Wesenheit nicht. Eine Paktlösung löscht keine bereits eingetretenen Folgen.';

function isExorcismPowerV1725(entry){return entry?.schoolId===EXORCISM_SCHOOL_ID_V1725||entry?.skillId===EXORCISM_SKILL_ID_V1725}
function exorcismPathV1725(owner){return resolvedPowerPathV176(owner,EXORCISM_SKILL_ID_V1725)}
function exorcismCounterLabelV1725(pathId){return POWER_COUNTER_LABELS_V176[pathId]||pathId||'nicht zugeordnet'}
function resolvedPowerKindV1725(owner,entry){const path=isExorcismPowerV1725(entry)?resolvedPowerPathV176(owner,entry.skillId):null;return entry?.powerKindByPath?.[path]||entry?.powerKind||'spell'}
function resolvedPowerKindLabelV1725(owner,entry){return POWER_KIND_LABELS_V176[resolvedPowerKindV1725(owner,entry)]||'Kraft'}
function resolvedPowerCostAmountV1725(entry,reinforcement=0){return Math.max(1,+entry?.counterCostAmountV1725||1)+(entry?.reinforceable?Math.max(0,Math.min(2,+reinforcement||0)):0)}
function resolvedPowerCostTextV1725(owner,entry,reinforcement=0){
  if(!isExorcismPowerV1725(entry))return entry?.counterCostText||'—';
  const path=resolvedPowerPathV176(owner,entry.skillId),amount=resolvedPowerCostAmountV1725(entry,reinforcement),name=exorcismCounterLabelV1725(path),suffix=entry.resourceModeV1725==='bind'?' gebunden':'';
  return path?`${amount} ${name}${suffix}`:`${amount} Mana oder Glaube${suffix}`;
}

function exorcismCommonNodeV1725(){return el('section',{class:'power-detail-section-v176 exorcism-common-v1725'},[el('h4',{text:EXORCISM_COMMON_TITLE_V1725}),...EXORCISM_COMMON_TEXT_V1725.split(/\n\n/).map(text=>el('p',{text}))])}

const powerInfoBeforeV1725=powerInfoContentV176;
powerInfoContentV176=function(entry,owner){
  const box=powerInfoBeforeV1725(entry,owner);if(!isExorcismPowerV1725(entry))return box;
  const badges=box.querySelectorAll('.power-current-v176 .power-badge-v176'),path=resolvedPowerPathV176(owner,entry.skillId);
  if(badges[3])badges[3].textContent=path?resolvedPowerKindLabelV1725(owner,entry):'Zauber oder Wunder';
  if(badges[4])badges[4].textContent=resolvedPowerCostTextV1725(owner,entry);
  const sections=[...box.querySelectorAll('.power-detail-section-v176')],type=sections.find(section=>section.querySelector('h4')?.textContent==='Typ und Counter');
  if(type)type.querySelector('p').textContent=`${entry.type} · ${path?exorcismCounterLabelV1725(path):'Mana oder Glaube'} · ${resolvedPowerCostTextV1725(owner,entry)}`;
  const grid=box.querySelector('.power-detail-grid-v176');
  if(grid&&entry.castingTimeText&&!sections.some(section=>section.querySelector('h4')?.textContent==='Wirkzeit'))grid.insertBefore(detailSectionV176('Wirkzeit',formatRuleTextV176(entry.castingTimeText,effectiveSkillLevelV176(owner,entry.skillId))),grid.firstChild);
  if(grid&&!box.querySelector('.exorcism-common-v1725'))box.insertBefore(exorcismCommonNodeV1725(),grid);
  return box;
};

const renderPowerLibraryBeforeV1725=renderPowerLibraryV176;
renderPowerLibraryV176=function(owner,pathId){
  const box=renderPowerLibraryBeforeV1725(owner,pathId),group=box.querySelector(`[data-school-id-v1716="${EXORCISM_SCHOOL_ID_V1725}"]`);
  if(group){const body=group.querySelector('.power-group-body-v176');if(body&&!body.querySelector('.exorcism-common-v1725'))body.prepend(exorcismCommonNodeV1725())}
  return box;
};

function activeExorcismBindingsV1725(owner,powerId=''){return activeSynergyBindingsV1721R2(owner,powerId).filter(binding=>binding.sourceType==='power'&&isExorcismPowerV1725(POWER_BY_ID_V176.get(binding.powerId)))}
function exorcismBindingTotalV1725(owner,counterId){return boundResourceTotalsV1721R2(owner).get(counterId)||0}
function capBoundCountersV1725(owner){
  if(!owner?.counters)return owner;
  const totals=boundResourceTotalsV1721R2(owner);for(const[id,amount]of totals){const counter=owner.counters[id];if(counter)counter.current=Math.min(Math.max(0,+counter.current||0),Math.max(0,(+counter.max||0)-amount))}return owner;
}

const releaseSynergyBindingBeforeV1725=releaseSynergyBindingV1721R2;
releaseSynergyBindingV1721R2=function(owner,bindingId){
  ensureOwnerSynergiesV1721R2(owner);const binding=activeSynergyBindingsV1721R2(owner).find(entry=>entry.id===bindingId);if(!binding)return false;
  owner.catalogSynergiesV1721R2.bindings=owner.catalogSynergiesV1721R2.bindings.filter(entry=>entry.id!==bindingId);
  for(const part of binding.costs||[]){const counter=owner.counters?.[part.counterId];if(counter)counter.current=Math.min(Math.max(0,+counter.max||0),Math.max(0,+counter.current||0)+Math.max(0,+part.amount||0))}
  capBoundCountersV1725(owner);saveOwnerV175(owner,true);showToastV179(`${binding.name}: Bindung gelöst.`);return true;
};

const setCounterMaximumBeforeV1725=setCounterMaximumR8,setCounterCurrentBeforeV1725=setCounterCurrentR8;
setCounterMaximumR8=function(owner,id,value){const result=setCounterMaximumBeforeV1725(owner,id,value),bound=exorcismBindingTotalV1725(owner,id),counter=owner.counters[id];counter.current=Math.min(counter.current,Math.max(0,counter.max-bound));return result};
setCounterCurrentR8=function(owner,id,value){const result=setCounterCurrentBeforeV1725(owner,id,value),bound=exorcismBindingTotalV1725(owner,id),counter=owner.counters[id];counter.current=Math.min(result,Math.max(0,counter.max-bound));return counter.current};

function useExorcismPowerV1725(owner,powerId,options={}){
  ensureOwnerPowersV176(owner);ensureOwnerSynergiesV1721R2(owner);const entry=POWER_BY_ID_V176.get(powerId),path=entry&&resolvedPowerPathV176(owner,entry.skillId);
  if(!isExorcismPowerV1725(entry)||!['M','GB'].includes(path)||!learnedPowerIdsV176(owner,entry.skillId).includes(entry.id))return false;
  const reinforcement=entry.reinforceable?Math.max(0,Math.min(2,+options.reinforcement||0)):0,amount=resolvedPowerCostAmountV1725(entry,reinforcement),components=[{counterId:path,amount}],transaction=commitActionPaymentV1712R2(owner,components,entry.id,`${entry.displayName} wirken`,{persist:false,notify:false,render:false,debounce:options.debounce!==false});
  if(!transaction)return false;
  transaction.powerPathIdV1725=path;transaction.powerKindV1725=resolvedPowerKindV1725(owner,entry);transaction.reinforcementV1725=reinforcement;
  if(entry.resourceModeV1725==='bind')owner.catalogSynergiesV1721R2.bindings.push({id:uid(),sourceType:'power',sourceId:entry.id,powerId:entry.id,pathId:path,skillId:entry.skillId,schoolId:entry.schoolId,name:entry.displayName,costs:components,transactionId:transaction.id,createdAt:new Date().toISOString(),active:true});
  capBoundCountersV1725(owner);if(options.persist!==false)saveOwnerV173(owner,options.render!==false);if(options.notify!==false)showActionPaymentToastV1712R2(transaction);return transaction;
}

const powerActionBeforeV1725=powerActionV1712R2;
powerActionV1712R2=function(entry,owner){
  if(!isExorcismPowerV1725(entry))return powerActionBeforeV1725(entry,owner);
  const path=resolvedPowerPathV176(owner,entry.skillId),kind=path?resolvedPowerKindLabelV1725(owner,entry):'Kraft',ui={reinforcement:0};
  return actionDisclosureV1712R2(`${kind} wirken · ${resolvedPowerCostTextV1725(owner,entry)}`,`${entry.displayName}: Zahlung vorbereiten`,host=>{
    const controls=el('div',{class:'learned-action-controls-v1712r2'}),summary=el('div'),confirmHost=el('div');host.append(el('strong',{text:`${entry.displayName} – Einsatz bestätigen`}),el('p',{class:'muted',text:path?`Fest zugeordneter Pfad: ${exorcismCounterLabelV1725(path)} (${path}). Die Kosten werden erst nach der Bestätigung abgezogen.`:'Diese Fähigkeit muss zuerst einmalig Mana oder Glaube zugeordnet werden.'}),controls,summary,confirmHost);
    const draw=()=>{
      controls.replaceChildren();if(entry.reinforceable){const select=el('select',{'aria-label':'Verstärkung'});[['0','Grundwirkung'],['1','Verstärkung V1'],['2','Verstärkung V2']].forEach(([value,text])=>select.append(el('option',{value,text})));select.value=String(ui.reinforcement);select.onchange=event=>{ui.reinforcement=+event.target.value;draw()};controls.append(el('label',{class:'field'},[el('span',{text:'Verstärkung'}),select]))}
      const amount=resolvedPowerCostAmountV1725(entry,ui.reinforcement),components=path?[{counterId:path,amount}]:[],plan=path?actionPaymentPlanV1712R2(owner,components):{valid:false,changes:[],missing:[],fallback:[]};summary.replaceChildren();if(path)appendPaymentSummaryV1712R2(summary,plan,components);else summary.append(el('p',{class:'notice error',text:'Ohne Pfadzuordnung kann die Kraft nicht gewirkt werden.'}));
      if(entry.resourceModeV1725==='bind'){summary.append(el('p',{class:'notice',text:`${amount} ${exorcismCounterLabelV1725(path)} bleiben bis zur manuellen Auflösung gebunden und werden durch Rast nicht aufgefüllt.`}));const existing=activeExorcismBindingsV1725(owner,entry.id);if(existing.length)summary.append(el('p',{text:`Aktive Siegel: ${existing.length}.`}))}
      confirmHost.replaceChildren();const button=el('button',{type:'button',class:'primary',text:entry.resourceModeV1725==='bind'?'Wirken, Kosten zahlen und Bindung anlegen':'Wirken und Kosten abziehen',disabled:!path||!plan.valid});button.onclick=()=>{const transaction=useExorcismPowerV1725(owner,entry.id,{reinforcement:ui.reinforcement});if(transaction)button.disabled=true};confirmHost.append(button);
      for(const binding of activeExorcismBindingsV1725(owner,entry.id))confirmHost.append(el('button',{type:'button',text:`Bindung lösen · ${actionPaymentTextV1712R2(binding.costs)}`,onclick:()=>releaseSynergyBindingV1721R2(owner,binding.id)}));
    };draw();
  });
};

const unlearnPowerBeforeV1725=unlearnPowerV176;
unlearnPowerV176=function(owner,skillId,powerId){if(activeExorcismBindingsV1725(owner,powerId).length){showToastV179('Die aktive Rückkehrsperre muss vor dem Verlernen gelöst werden.');return false}return unlearnPowerBeforeV1725(owner,skillId,powerId)};
const setPurchasedSkillLevelBeforeV1725=setPurchasedSkillLevelV176;
setPurchasedSkillLevelV176=function(owner,skillId,nextLevel,confirmRemoval=message=>confirm(message)){
  const previous=+owner?.skills?.[skillId]?.level||0,next=Math.max(0,Math.min(25,+nextLevel||0));if(skillId===EXORCISM_SKILL_ID_V1725&&next<previous&&activeExorcismBindingsV1725(owner).length){showToastV179('Aktive Rückkehrssiegel müssen vor einer Stufensenkung gelöst werden.');return false}return setPurchasedSkillLevelBeforeV1725(owner,skillId,next,confirmRemoval);
};

const renderLearnedPowerBeforeV1725=renderLearnedPowerV176;
renderLearnedPowerV176=function(owner,skillId,powerId){
  const row=renderLearnedPowerBeforeV1725(owner,skillId,powerId),entry=POWER_BY_ID_V176.get(powerId);if(!isExorcismPowerV1725(entry))return row;
  const small=row.querySelector('.power-name-v176 small');if(small)small.textContent=`${resolvedPowerPathV176(owner,entry.skillId)?resolvedPowerKindLabelV1725(owner,entry):'Zauber oder Wunder'} · ${resolvedPowerCostTextV1725(owner,entry)}`;
  const bindingCount=activeExorcismBindingsV1725(owner,powerId).length,remove=[...row.querySelectorAll('.power-actions-v176 button')].find(button=>/Entfernen|Verlernen/.test(button.textContent));if(remove&&bindingCount){remove.disabled=true;remove.textContent='Bindung zuerst lösen';remove.title=`${bindingCount} aktive Bindung${bindingCount===1?'':'en'}`}
  return row;
};

const searchIndexBeforeV1725=searchIndexV177;
searchIndexV177=function(){const owner=ch();return searchIndexBeforeV1725().map(result=>{const entry=POWER_ENTRIES_V176.find(power=>power.displayName===result.label&&power.schoolLabel===result.owner);if(!isExorcismPowerV1725(entry))return result;return{...result,kind:resolvedPowerPathV176(owner,entry.skillId)?resolvedPowerKindLabelV1725(owner,entry):'Zauber/Wunder',search:normalizeSearchV177([result.search,entry.type,entry.counterText,entry.castingTimeText,entry.variableWText,entry.scaleText,entry.explanation,entry.rulesLimits,entry.resistanceCheck,entry.durationText,entry.rangeText,EXORCISM_COMMON_TEXT_V1725].join(' '))}})};

function normalizedSkillNameV1725(value){return String(value||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('de').replace(/[^a-z0-9]+/g,' ').trim()}
function collectMigrationAuditV1725(owner){
  const previous=owner?.exorcismAuditV1725||{},rawChoice=owner?.powerPathChoicesV176?.[EXORCISM_SKILL_ID_V1725],valid=!rawChoice||['M','GB'].includes(rawChoice),conflict=(owner?.customSkills||[]).some(skill=>normalizedSkillNameV1725(skill.name)===normalizedSkillNameV1725('Exorzismus & Austreibung')),economyConflict=(owner?.customSkills||[]).some(skill=>normalizedSkillNameV1725(skill.name)===normalizedSkillNameV1725('Wirtschaft & Handel'));
  return{invalidPathChoice:valid?String(previous.invalidPathChoice||''):String(rawChoice),customNameConflict:!!previous.customNameConflict||conflict,economyTradeCustomNameConflict:!!previous.economyTradeCustomNameConflict||economyConflict,checkedAt:previous.checkedAt||new Date().toISOString()};
}
function retireCombatRoundV1725(owner){
  if(!owner||owner.type==='possession')return owner;owner.migrations=owner.migrations&&typeof owner.migrations==='object'?owner.migrations:{};
  if(owner.combatRoundV1721&&!owner.migrations.v1725RetiredCombatRound)owner.migrations.v1725RetiredCombatRound=structuredClone(owner.combatRoundV1721);
  if(owner.combatRoundV1721)owner.combatRoundV1721.retiredV1725=true;owner.combatRoundUndoV1721=null;owner.combatRoundRemainderV178=0;return owner;
}
function ensureOwnerV1725(owner,preAudit=null){
  if(!owner||owner.type==='possession')return owner;const auditData=preAudit||collectMigrationAuditV1725(owner);ensureOwnerPowersV176(owner);ensureOwnerSynergiesV1721R2(owner);owner.skills[EXORCISM_SKILL_ID_V1725]=normalizeSkillPowerDataV176(owner.skills[EXORCISM_SKILL_ID_V1725]);owner.skills[ECONOMY_TRADE_SKILL_ID_V1725]=normalizeSkillPowerDataV176(owner.skills[ECONOMY_TRADE_SKILL_ID_V1725]);
  if(auditData.invalidPathChoice)delete owner.powerPathChoicesV176[EXORCISM_SKILL_ID_V1725];owner.exorcismAuditV1725={...(owner.exorcismAuditV1725||{}),...auditData};retireCombatRoundV1725(owner);capBoundCountersV1725(owner);return owner;
}
function ensureStateV1725(data,log=true){
  if(!data||typeof data!=='object')return data;const first=!data.v1725ExorcismMigrationDone,economyFirst=!data.v1725EconomyTradeMigrationDone,effectsFirst=!data.v1725EffectsR4Done,fromApp=data.appVersion||'unbekannt',fromSchema=+data.schemaVersion||0;
  for(const owner of ownerListV178(data)){const preAudit=collectMigrationAuditV1725(owner);ensureOwnerV1725(owner,preAudit)}
  data.appVersion=V1725_VERSION;data.schemaVersion=V1725_SCHEMA;data.rulesVersion=V1725_RULES;data.v1725ExorcismMigrationDone=true;data.v1725EconomyTradeMigrationDone=true;data.v1725EffectsR4Done=true;
  if((first||economyFirst||effectsFirst)&&log){data.migrationLog=Array.isArray(data.migrationLog)?data.migrationLog:[];const changes=[];if(first)changes.push('Exorzismus & Austreibung mit 15 Kräften ergänzt','Mana- oder Glaube-Pfad als einmalige Zuordnung vorbereitet','Rückkehrssiegel an bestehendes Bindungsregister angeschlossen','Thanaturgie-Z4 als zeitweiliger Notbann präzisiert');if(economyFirst)changes.push('Wirtschaft & Handel als Wissen-Fähigkeit mit IT/IN und Fokus ergänzt');if(effectsFirst)changes.push('Allgemeinen Effektkatalog auf konkrete Kernzustände reduziert','Eigenen Gegenstandsbonus-Katalog eingeführt','Privaten Kampfrundenzähler stillgelegt und Technikzahlungen auf direkten Counterabzug umgestellt');data.migrationLog.push({from:fromSchema,to:V1725_SCHEMA,at:new Date().toISOString(),changes,fromApp,toApp:V1725_VERSION})}
  return data;
}

const migrateStateBeforeV1725=migrateState;
migrateState=function(data){const audits=new Map(ownerListV178(data).map(owner=>[owner,collectMigrationAuditV1725(owner)])),result=migrateStateBeforeV1725(data);for(const owner of ownerListV178(result))ensureOwnerV1725(owner,audits.get(owner));return ensureStateV1725(result,true)};
const newCharacterBeforeV1725=newCharacter,newAuxEntryBeforeV1725=newAuxEntry;
newCharacter=function(){return ensureOwnerV1725(newCharacterBeforeV1725())};
newAuxEntry=function(type,name){const owner=newAuxEntryBeforeV1725(type,name);return type==='possession'?owner:ensureOwnerV1725(owner)};
if(!state.v1725ExorcismMigrationDone||!state.v1725EconomyTradeMigrationDone||!state.v1725EffectsR4Done){try{localStorage.setItem(STORE+'.backup.v1725.'+Date.now(),JSON.stringify(state))}catch{}}
state=ensureStateV1725(state,true);

const auditBeforeV1725=audit;
audit=function(){auditBeforeV1725();const economy=SKILLS.find(skill=>skill.id===ECONOMY_TRADE_SKILL_ID_V1725);auditResults.append(el('h3',{text:'Regelfähigkeiten v1.7.25'}),el('div',{class:'notice '+(POWER_ENTRIES_V176.filter(isExorcismPowerV1725).length===15?'ok':'error'),text:`${POWER_ENTRIES_V176.filter(isExorcismPowerV1725).length===15?'✓':'✕'} Exorzismus & Austreibung · 15 Kräfte · Pfadwahl Mana/Glaube · gemeinsames BB/PB-Modell`}),el('div',{class:'notice '+(economy?.category==='Wissen'&&economy?.attrs==='IT, IN'&&economy?.use==='FO'?'ok':'error'),text:`${economy?.category==='Wissen'&&economy?.attrs==='IT, IN'&&economy?.use==='FO'?'✓':'✕'} Wirtschaft & Handel · Wissen · IT/IN · Fokus · kein eigener Technikkatalog`}));for(const owner of ownerListV178()){ensureOwnerV1725(owner);const pending=(+owner.skills?.[EXORCISM_SKILL_ID_V1725]?.level||0)>0&&!exorcismPathV1725(owner),invalid=owner.exorcismAuditV1725?.invalidPathChoice,conflict=owner.exorcismAuditV1725?.customNameConflict,economyConflict=owner.exorcismAuditV1725?.economyTradeCustomNameConflict,bindings=activeExorcismBindingsV1725(owner).length,ok=!invalid&&!conflict&&!economyConflict&&!pending;auditResults.append(el('div',{class:'notice '+(ok?'ok':''),text:`${ok?'✓':'⚠'} ${owner.name||owner.type||'Charakter'}: ${bindings} aktive Rückkehrsiegel${pending?' · Pfadwahl offen':''}${invalid?` · ungültige Altwahl entfernt (${invalid})`:''}${conflict?' · gleichnamige eigene Fähigkeit Exorzismus & Austreibung erhalten':''}${economyConflict?' · gleichnamige eigene Fähigkeit Wirtschaft & Handel erhalten':''}`}))}};

const exorcismStyleV1725=el('style',{text:'.exorcism-common-v1725{border-left:5px solid var(--accent-2)}.exorcism-common-v1725 p{margin:.25rem 0}.power-actions-v176 button:disabled{cursor:not-allowed;opacity:.65}'});document.head.append(exorcismStyleV1725);

const INFO_HOVER_DELAY_V1725=800,INFO_SCROLL_GUARD_V1725=350;
let ruleInfoPinnedV1725=false,lastInfoScrollV1725=0;
const showRuleInfoBeforeV1725=showRuleInfoR5,hideRuleInfoBeforeV1725=hideRuleInfoR5;
showRuleInfoR5=function(anchor,title,build){
  if(anchor?.classList?.contains('info-ready-r5')&&!anchor.classList.contains('info-button-r5'))return false;
  if(ruleInfoPinnedV1725&&infoAnchorR5&&infoAnchorR5!==anchor)return false;
  const previous=infoAnchorR5;showRuleInfoBeforeV1725(anchor,title,build);if(previous&&previous!==anchor)previous.setAttribute?.('aria-expanded','false');anchor?.setAttribute?.('aria-expanded','true');return true;
};
hideRuleInfoR5=function(force=false){
  if(ruleInfoPinnedV1725&&!force)return false;const previous=infoAnchorR5,box=document.getElementById('ruleInfoR5');ruleInfoPinnedV1725=false;hideRuleInfoBeforeV1725();if(box){box.hidden=true;box.setAttribute('hidden','')}previous?.setAttribute?.('aria-expanded','false');return true;
};
function toggleRuleInfoV1725(anchor,title,build){
  const box=rulePopoverR5(),sameOpen=!box.hidden&&infoAnchorR5===anchor;if(sameOpen&&ruleInfoPinnedV1725){hideRuleInfoR5(true);return false}if(sameOpen){ruleInfoPinnedV1725=true;anchor.setAttribute('aria-expanded','true');return true}if(!box.hidden)hideRuleInfoR5(true);showRuleInfoR5(anchor,title,build);ruleInfoPinnedV1725=true;anchor.setAttribute('aria-expanded','true');return true;
}
infoButtonR5=function(node,title,build){
  const button=el('button',{class:'info-button-r5',type:'button',text:'Beschreibung','aria-label':title+' Beschreibung öffnen','aria-expanded':'false','aria-controls':'ruleInfoR5'}),schedule=event=>{clearTimeout(infoDelayR5);if(ruleInfoPinnedV1725&&infoAnchorR5!==button)return;const focused=event.type==='focus';if(!focused&&Date.now()-lastInfoScrollV1725<INFO_SCROLL_GUARD_V1725)return;infoDelayR5=setTimeout(()=>{if(!ruleInfoPinnedV1725&&(focused?document.activeElement===button:button.matches(':hover')))showRuleInfoR5(button,title,build)},focused?0:INFO_HOVER_DELAY_V1725)};
  button.addEventListener('mouseenter',schedule);button.addEventListener('mouseleave',()=>{clearTimeout(infoDelayR5);infoDelayR5=0;if(!ruleInfoPinnedV1725&&infoAnchorR5===button)hideRuleInfoR5(true)});button.addEventListener('focus',schedule);button.addEventListener('blur',()=>{if(!ruleInfoPinnedV1725&&infoAnchorR5===button)hideRuleInfoR5(true)});
  button.onclick=event=>{event.stopPropagation();clearTimeout(infoDelayR5);const opened=toggleRuleInfoV1725(button,title,build);button.setAttribute('aria-label',title+(opened?' Beschreibung schließen':' Beschreibung öffnen'))};return button;
};
document.addEventListener('scroll',()=>{lastInfoScrollV1725=Date.now();clearTimeout(infoDelayR5);infoDelayR5=0;if(!ruleInfoPinnedV1725&&infoAnchorR5)hideRuleInfoR5(true)},{capture:true,passive:true});
document.addEventListener('pointerdown',event=>{if(ruleInfoPinnedV1725&&!event.target.closest?.('#ruleInfoR5')&&!infoAnchorR5?.contains?.(event.target))hideRuleInfoR5(true)},true);
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&ruleInfoPinnedV1725)hideRuleInfoR5(true)},true);

/* Konkrete Kerneffekte, eigener Gegenstandsbonus-Katalog und direkter Kampfverbrauch. */
const CORE_EFFECTS_V1725=Array.isArray(window.EBEROS_EFFECT_DB_V1725?.definitions)?window.EBEROS_EFFECT_DB_V1725.definitions:[];
if(CORE_EFFECTS_V1725.length){
  EFFECT_DEFINITIONS_V177.splice(0,EFFECT_DEFINITIONS_V177.length,...structuredClone(CORE_EFFECTS_V1725));EFFECT_BY_ID_V177.clear();for(const definition of EFFECT_DEFINITIONS_V177)EFFECT_BY_ID_V177.set(definition.id,definition);
  EFFECT_DB_V177.meta={...(EFFECT_DB_V177.meta||{}),appVersion:V1725_VERSION,catalogVersion:'2.0.0',rows:EFFECT_DEFINITIONS_V177.length,scope:'Konkrete Kernzustände; Gegenstandsboni besitzen einen eigenen Katalog'};EFFECT_DB_V177.definitions=EFFECT_DEFINITIONS_V177;
}

const DIRECT_COMBAT_RULES_V1725={physicalRoundA:0,powerOnlyRoundA:0,ordinaryAttackIncluded:false,firstTechniqueIncluded:false,directCounterPayment:true,roundTracker:false,masteryDiscounts:[[15,1],[25,2]]};
DEFAULT_RULES.rulesVersion=V1725_RULES;DEFAULT_RULES.combat=structuredClone(DIRECT_COMBAT_RULES_V1725);rules.rulesVersion=V1725_RULES;rules.combat=structuredClone(DIRECT_COMBAT_RULES_V1725);rulesJson.value=JSON.stringify(rules,null,2);

const effectFromDefinitionBeforeV1725=effectFromDefinitionV177;
effectFromDefinitionV177=function(owner,definition,source={type:'catalog',id:'',label:''}){
  const effect=effectFromDefinitionBeforeV1725(owner,definition,source);if(definition.durationAmountV1710){effect.durationTypeV1710=definition.duration||'rounds';effect.durationAmountV1710=Math.max(1,+definition.durationAmountV1710||1);effect.durationRemainingV1710=effect.durationAmountV1710;syncLegacyDurationV1710(effect);persistEffectsV177(owner,true)}return effect;
};

function itemBonusOptionsV1725(kind,owner){
  if(kind==='attribute')return ATTRS.map(([value,name])=>[value,`${name} (${value})`]);
  if(kind==='counter-max')return COUNTERS.map(([value,name])=>[value,`${name} (${value})`]);
  return allSkillsV178(owner).map(skill=>[skill.id,skill.name]).sort((a,b)=>a[1].localeCompare(b[1],'de'));
}
let itemBonusDialogV1725=null;
function openItemBonusCatalogV1725(owner,source){
  if(!itemBonusDialogV1725){itemBonusDialogV1725=el('dialog',{class:'effect-add-dialog-v1710 item-bonus-dialog-v1725'});document.body.append(itemBonusDialogV1725)}
  const kind=el('select',{'aria-label':'Art des Gegenstandsbonus'},[el('option',{value:'skill',text:'Fähigkeitsbonus'}),el('option',{value:'attribute',text:'Grundwertbonus'}),el('option',{value:'counter-max',text:'Countermaximum-Bonus'})]),target=el('select',{'aria-label':'Ziel des Gegenstandsbonus'}),amount=el('input',{type:'number',min:1,max:5,step:1,value:1,'aria-label':'Höhe des Gegenstandsbonus'}),preview=el('p',{class:'notice'});
  const labelFor=()=>target.selectedOptions[0]?.textContent||target.value,drawTargets=()=>{target.replaceChildren(...itemBonusOptionsV1725(kind.value,owner).map(([value,text])=>el('option',{value,text})));drawPreview()},drawPreview=()=>preview.textContent=`${labelFor()} +${Math.max(1,Math.min(5,+amount.value||1))} · wirkt nur, solange der Gegenstand ausgerüstet ist.`;
  kind.onchange=drawTargets;target.onchange=drawPreview;amount.oninput=drawPreview;
  const close=el('button',{type:'button',text:'✕','aria-label':'Schließen',onclick:()=>itemBonusDialogV1725.close()}),add=el('button',{type:'button',class:'primary',text:'Gegenstandsbonus hinzufügen',onclick:()=>{const bonus=Math.max(1,Math.min(5,+amount.value||1)),label=labelFor(),definition={id:`item-bonus-${kind.value}-${target.value}-${bonus}`,name:`${label} +${bonus}`,category:'Gegenstandsbonus',mechanics:`${label} +${bonus}; nur aktiv, solange der Gegenstand ausgerüstet ist.`,duration:'source',stacking:'add',modules:[{id:`item-module-${kind.value}-${target.value}`,type:kind.value,target:target.value,operation:'add',value:bonus,polarityV1710:'bonus',amountV1710:bonus}]};effectFromDefinitionV177(owner,definition,source);itemBonusDialogV1725.close()}});
  drawTargets();itemBonusDialogV1725.replaceChildren(el('div',{class:'dialog-head'},[el('h2',{text:`Gegenstandsbonus · ${source.label||'Gegenstand'}`}),close]),el('p',{class:'muted',text:'Gegenstände verwenden ausschließlich positive Boni auf eine Fähigkeit, einen Grundwert oder ein Countermaximum. Zustände wie Blutend oder Schlafend gehören in den allgemeinen Effektkatalog.'}),el('div',{class:'effect-editor-grid-v1710'},[fieldV177('Bonusart',kind),fieldV177('Ziel',target),fieldV177('Bonus +1 bis +5',amount)]),preview,add);itemBonusDialogV1725.showModal();
}
const openEffectCatalogBeforeV1725=openEffectCatalogDialogV177;
openEffectCatalogDialogV177=function(owner,source={type:'catalog',id:'',label:''}){return source.type==='item'?openItemBonusCatalogV1725(owner,source):openEffectCatalogBeforeV1725(owner,source)};
const renderEquipmentBeforeV1725=renderEquipmentV174;
renderEquipmentV174=function(owner){const box=renderEquipmentBeforeV1725(owner);for(const node of box.querySelectorAll('.effect-source-links-v177 strong'))if(node.textContent==='Item-Effekte:')node.textContent='Gegenstandsboni:';for(const button of box.querySelectorAll('.effect-source-links-v177 button'))if(button.textContent==='+ Effekt verknüpfen')button.textContent='+ Gegenstandsbonus';return box};

function techniqueEntryV1725(id){return COMBAT_BY_ID_V178.get(id)||HYBRID_BY_ID_V1721R2.get(id)}
techniquePaymentV1721=function(owner,entry){const hybrid=entry?.synergyHybridV1721R2,discount=hybrid?0:masteryDiscountV1721(owner,entry?.skillId),nominal=Math.max(1,(+entry?.staminaCost||1)-discount);return{first:false,direct:true,discount,nominal,due:nominal}};
function techniqueComponentsV1725(owner,entry){const payment=techniquePaymentV1721(owner,entry),components=entry?.synergyHybridV1721R2?(entry.synergyCosts||[]).filter(part=>part.counterId!=='A') :[];components.unshift({counterId:'A',amount:payment.due});return{payment,components:actionCounterComponentsV1712R2(components)}}
useTechniqueV1721=function(owner,techniqueId,options={}){
  const entry=techniqueEntryV1725(techniqueId),power=entry?.synergyHybridV1721R2?SYNERGY_POWER_BY_ID_V1721R2.get(techniqueId):null,path=power&&SYNERGY_PATH_BY_ID_V1721R2.get(power.pathId);if(!entry||!owner.skills?.[entry.skillId]?.learnedTechniqueIds?.includes(entry.id)||entry.synergyHybridV1721R2&&!powerRequirementsMetV1721R2(owner,path,power))return false;
  const{components}=techniqueComponentsV1725(owner,entry),transaction=commitActionPaymentV1712R2(owner,components,entry.id,`${entry.name} einsetzen`,{persist:false,notify:false,render:false,debounce:options.debounce!==false});if(!transaction)return false;
  if(options.persist!==false)saveOwnerV173(owner,options.render!==false);if(options.notify!==false)showActionPaymentToastV1712R2(transaction);return transaction;
};
combatTechniqueActionV1712R2=function(entry,owner){
  const{payment,components}=techniqueComponentsV1725(owner,entry),plan=actionPaymentPlanV1712R2(owner,components),power=entry.synergyHybridV1721R2?SYNERGY_POWER_BY_ID_V1721R2.get(entry.id):null,path=power&&SYNERGY_PATH_BY_ID_V1721R2.get(power.pathId),requirements=!entry.synergyHybridV1721R2||powerRequirementsMetV1721R2(owner,path,power);
  return actionDisclosureV1712R2(`Technik einsetzen · ${actionPaymentTextV1712R2(components)}`,`${entry.name}: direkten Verbrauch bestätigen`,host=>{host.append(el('strong',{text:entry.name}),el('p',{class:'muted',text:`Der Einsatz zieht den vollständigen Preis direkt von den Countern ab. Es gibt keine private offene Kampfrunde und keine spätere Grundkostenabrechnung.${payment.discount?` Meisterschaftsrabatt: ${payment.discount} A.`:''}`}));appendPaymentSummaryV1712R2(host,plan,components);host.append(el('button',{type:'button',class:'primary',text:'Technik einsetzen und Kosten abziehen',disabled:!requirements||!plan.valid,onclick:()=>useTechniqueV1721(owner,entry.id)}))});
};
spendCounterV179=function(owner,counterId,amount,skillId='',options={}){return spendCounterBeforeV1721(owner,counterId,amount,skillId,options)};
undoCounterSpendV179=function(transactionId=lastCounterSpendV179?.id){return undoCounterSpendBeforeV1721(transactionId)};
advanceCombatClockV178=function(){return{retired:true,spent:0}};

const derivedBeforeEffectOverhaulV1725=derived;
function corrosionEffectsV1725(owner){return activeEffectInstancesV177(owner).filter(effect=>effect.definitionId==='effect-core-corroded'||effect.name==='Verätzt')}
function armorRowV1725(values){return values.find(row=>row.n==='Rüstung'||row.n==='Armor')}
derived=function(owner){const values=derivedBeforeEffectOverhaulV1725(owner),armor=armorRowV1725(values),loss=Math.max(0,...corrosionEffectsV1725(owner).map(effect=>Math.max(0,+effect.corrosionArmorLossV1725||0)));if(armor&&loss){armor.v=Math.max(0,(+armor.v||0)-loss);armor.f+=(armor.f?' · ':'')+`Verätzt −${loss}`}return values};
function applyCorrosionRoundV1725(owner){
  const changes=[],armorBase=Math.max(0,+armorRowV1725(derivedBeforeEffectOverhaulV1725(owner))?.v||0);for(const effect of corrosionEffectsV1725(owner)){const loss=Math.max(0,+effect.corrosionArmorLossV1725||0);if(loss<armorBase){effect.corrosionArmorLossV1725=loss+1;changes.push({effect:'Verätzt',counter:'Rüstung',before:Math.max(0,armorBase-loss),after:Math.max(0,armorBase-loss-1)})}else{const before=Math.max(0,+owner.counters?.L?.current||0),after=Math.max(0,before-1);setCounterCurrentR8(owner,'L',after);changes.push({effect:'Verätzt',counter:'L',before,after})}}return changes;
}
function addDeathEffectV1725(owner){const definition=EFFECT_BY_ID_V177.get('effect-core-dead');if(!definition||owner.activeEffectsV177.some(effect=>effect.active!==false&&effect.definitionId===definition.id))return;owner.activeEffectsV177.push(effectInstanceV177({definitionId:definition.id,name:definition.name,description:definition.mechanics,category:definition.category,sourceType:'catalog',active:true,modules:definition.modules,durationUnit:definition.duration,stacking:definition.stacking}))}
const effectSummaryBeforeOverhaulV1725=effectSummaryV1710;
effectSummaryV1710=function(owner,effect){if(effect.definitionId==='effect-core-corroded'||effect.name==='Verätzt'){const base=Math.max(0,+armorRowV1725(derivedBeforeEffectOverhaulV1725(owner))?.v||0),loss=Math.max(0,+effect.corrosionArmorLossV1725||0);return`Rüstung aktuell ${Math.max(0,base-loss)} (${loss?`−${loss}`:'noch unverändert'}); bei Rüstung 0 pro Runde L −1.`}return effectSummaryBeforeOverhaulV1725(owner,effect)};
advanceEffectsV1710=function(owner,eventKey,options={}){
  const dying=eventKey==='round'?activeEffectInstancesV177(owner).filter(effect=>(effect.definitionId==='effect-core-dying'||effect.name==='Sterbend')&&+effect.durationRemainingV1710<=1):[],result=advanceEffectsBeforeV1721(owner,eventKey,options);if(result===false)return false;const special=[];if(eventKey==='round'){special.push(...applyCorrosionRoundV1725(owner));if(dying.some(effect=>effect.active===false)){addDeathEffectV1725(owner);special.push({effect:'Sterbend',counter:'Zustand',before:'Sterbend',after:'Tot'})}}
  if(special.length){owner.effectLogV177=Array.isArray(owner.effectLogV177)?owner.effectLogV177:[];owner.effectLogV177.unshift({id:uid(),at:nowV177(),event:eventKey,changes:special});owner.effectLogV177=owner.effectLogV177.slice(0,30);if(options.persist!==false)persistEffectsV177(owner,options.render!==false)}return true;
};
advanceEffectsV177=advanceEffectsV1710;

const renderEffectsBeforeOverhaulV1725=renderEffectsV177;
renderEffectsV177=function(owner){const box=renderEffectsBeforeOverhaulV1725(owner);box.querySelector('.combat-round-panel-v1721')?.remove();const time=box.querySelector('.effect-time-v1710');if(time){const heading=time.querySelector('h4');if(heading)heading.textContent='Nur Effektzeit fortschreiben';const round=[...time.querySelectorAll('button')].find(button=>button.textContent==='Nächste Kampfrunde');if(round){round.textContent='Nächste Runde · Effekte';round.title='Wendet ausschließlich rundenbasierte Effekte an; keine Angriffs- oder Ausdauerkosten.'}}return box};
const combatInfoBeforeOverhaulV1725=combatTechniqueInfoContentV176;
combatTechniqueInfoContentV176=function(entry,owner){const box=combatInfoBeforeOverhaulV1725(entry,owner);for(const badge of[...box.querySelectorAll('.power-badge-v176')])if(/In dieser Runde|erste Technik zählt/i.test(badge.textContent))badge.remove();const current=box.querySelector('.power-current-v176');if(current)current.append(el('span',{class:'power-badge-v176',text:`Direkt: ${techniquePaymentV1721(owner,entry).due} A`}));return box};
const combatLibraryBeforeOverhaulV1725=renderCombatTechniqueLibraryV176;
renderCombatTechniqueLibraryV176=function(owner){const box=combatLibraryBeforeOverhaulV1725(owner),rule=[...box.querySelectorAll('.combat-tech-rule-v176')].find(node=>node.querySelector('strong')?.textContent==='Ausdauer');if(rule)rule.querySelector('span').textContent='Jeder Einsatz zieht seinen angezeigten Preis sofort von A ab. Kaufstufe 15/25 senkt normale Technikpreise um 1/2 A, mindestens auf 1 A. Normale Angriffe und andere Handlungen werden direkt über ihre jeweiligen Counter gebucht; es gibt keinen privaten Kampfrundenzähler.';return box};
const printSkillsBeforeOverhaulV1725=renderPrintSkillsR15;
renderPrintSkillsR15=function(card,owner,options,isCharacter){const box=printSkillsBeforeOverhaulV1725(card,owner,options,isCharacter);for(const p of[...box.querySelectorAll('p')])if(/Körperliche Kampfrunde: 1 A|erste Technik.*Runden-A/i.test(p.textContent))p.remove();const heading=[...box.querySelectorAll('h3')].find(node=>node.textContent==='Gelernte Kampftechniken');if(heading)heading.after(el('p',{text:'Technikpreise werden beim Einsatz direkt von den angegebenen Countern abgezogen; es gibt keine zusätzliche Rundenabrechnung.'}));return box};
const counterInfoBeforeOverhaulV1725=counterInfoContentR5;
counterInfoContentR5=function(id,owner){const box=counterInfoBeforeOverhaulV1725(id,owner);if(id==='A'){for(const p of[...box.querySelectorAll('p')])if(/körperlich geführte Kampfrunde|erste Technik|reine Wirker-Runden/i.test(p.textContent))p.remove();box.prepend(el('p',{text:'Ausdauer wird unmittelbar für die gewählte Handlung oder Technik abgezogen. Es gibt keine zusätzliche private Kampfrundenabrechnung.'}))}return box};
const skillSpendBeforeOverhaulV1725=skillSpendInfoV179;
skillSpendInfoV179=function(owner,skill){const box=skillSpendBeforeOverhaulV1725(owner,skill);for(const p of[...box.querySelectorAll('p')])if(/normaler Angriff steckt bereits|Runden-A/i.test(p.textContent))p.remove();if(COMBAT_SKILL_IDS_V178.has(skill.id))box.prepend(el('p',{class:'notice',text:'Kampfkosten werden direkt vom gewählten Counter abgezogen. Gelernte Techniken verwenden dafür ihre eigene Einsatzschaltfläche.'}));return box};

const auditBeforeEffectOverhaulV1725=audit;
audit=function(){auditBeforeEffectOverhaulV1725();auditResults.append(el('h3',{text:'Effekt- und Kampfmodell v1.7.25-r4'}),el('div',{class:'notice '+(EFFECT_DEFINITIONS_V177.length===25?'ok':'error'),text:`${EFFECT_DEFINITIONS_V177.length===25?'✓':'✕'} ${EFFECT_DEFINITIONS_V177.length} konkrete Kernzustände · eigener Gegenstandsbonus-Katalog · direkter Counterverbrauch ohne Kampfrundenzähler`}))};

const runTestsBeforeV1725=runTests;
function runTestsV1725(){
  try{runTestsBeforeV1725()}catch(error){console.error('Alte integrierte Tests',error)}
  const body=testResults.querySelector('tbody'),obsolete=/^(Schema (?:22|27|28)|Regelstand (?:bleibt 7|13|14)|Regelversion 7|Revision r4: (?:Regelversion 7|450 Kräfte)|Version 1\.7\.24|Revision r[23]|86 |450 |30 (?:Kraftschulen|Power-Schulen)|255 Mana-Zauber|Katalogversion 1\.3\.0|Volltest: (?:35 Schul-Counter|525 einzelne|alle 75 Wunder|alle 450 IDs)|Alle 82 bisherigen Namen|Charakter zeigt 86|NPC zeigt 86|Migration ist idempotent|Pfadverteilung 255\/75\/120|Verstärkungen 338\/112|Grundwertverteilung v1\.7\.(?:15|16|17)|227 (?:Effektdefinitionen|eindeutige Effekt-IDs)|Wetter bleibt im Katalog|Schlafend setzt WN wirksam auf 0|Erneutes Aktivieren verdoppelt nicht|Normale Rast setzt Rundenzähler zurück|Fünfte Runde kostet 1 A|Zehnte Runde kostet insgesamt 2 A|Vier körperliche Runden kosten 4 A|Vier reine Wirker-Runden kosten 0 A|Regelkonfiguration enthält körperliche Runde|Regelkonfiguration enthält keine Wirker-A)/;for(const row of[...body.querySelectorAll('tr')])if(obsolete.test(row.cells[0]?.textContent||''))row.remove();
  const tests=[],eq=(name,expected,actual)=>tests.push([name,expected,actual,expected===actual]),entries=POWER_ENTRIES_V176.filter(isExorcismPowerV1725),owner=newCharacter();
  eq('Version 1.7.25',V1725_VERSION,APP_VERSION);eq('Revision r4','r4',V1725_REVISION);eq('Schema 29',29,SCHEMA_VERSION);eq('Regelstand 15',15,RULES_VERSION);eq('88 Regelfähigkeiten',88,SKILLS.length);eq('465 Kräfte',465,POWER_ENTRIES_V176.length);eq('31 Kraftschulen',31,POWER_SCHOOLS_V176.length);eq('25 konkrete Kerneffekte',25,EFFECT_DEFINITIONS_V177.length);eq('Exorzismus Z1 bis Z15',Array.from({length:15},(_,index)=>`Z${index+1}`).join('|'),entries.map(entry=>entry.code).join('|'));eq('Exorzismus nutzt strukturierte Pfadkosten',true,entries.every(entry=>entry.counterPathModeV1725==='assigned'&&entry.counterOptions.join('|')==='M|GB'));
  const economy=SKILLS.find(skill=>skill.id===ECONOMY_TRADE_SKILL_ID_V1725);eq('Wirtschaft & Handel vollständig definiert','Wissen|IT, IN|FO|'+ECONOMY_TRADE_SCOPE_V1725,[economy?.category,economy?.attrs,economy?.use,economy?.scope].join('|'));eq('Wirtschaft & Handel startet auf Stufe 0',0,+owner.skills?.[ECONOMY_TRADE_SKILL_ID_V1725]?.level||0);eq('Wirtschaft & Handel nutzt allgemeine Fähigkeitskosten','0|1|5|7|15|30|50|75',[0,1,5,6,10,15,20,25].map(skillCost).join('|'));eq('Wirtschaft & Handel hat keinen Kraft- oder Technikkatalog',false,POWER_ENTRIES_V176.some(entry=>entry.skillId===ECONOMY_TRADE_SKILL_ID_V1725)||COMBAT_ENTRIES_V178.some(entry=>entry.skillId===ECONOMY_TRADE_SKILL_ID_V1725));eq('Gleichnamige neue eigene Fähigkeit ist gesperrt',false,customSkillNameAvailableV178(owner,'Wirtschaft & Handel'));
  owner.skills[EXORCISM_SKILL_ID_V1725].level=15;owner.skills[EXORCISM_SKILL_ID_V1725].learnedPowerIds=entries.map(entry=>entry.id);eq('Keine automatische Pfadwahl',null,exorcismPathV1725(owner));eq('Mana zuweisbar',true,assignPowerPathV176(owner,EXORCISM_SKILL_ID_V1725,'M'));eq('Mana macht Kräfte zu Zaubern','spell',resolvedPowerKindV1725(owner,entries[0]));owner.counters.M={max:10,current:10};const z15=entries.find(entry=>entry.code==='Z15'),before=owner.counters.M.current,paid=useExorcismPowerV1725(owner,z15.id,{persist:false,notify:false,debounce:false,reinforcement:2});eq('Z15 kostet exakt 2 Mana',before-2,owner.counters.M.current);eq('Z15 ignoriert Verstärkung',0,paid.reinforcementV1725);
  const z12=entries.find(entry=>entry.code==='Z12'),seal=useExorcismPowerV1725(owner,z12.id,{persist:false,notify:false,debounce:false,reinforcement:1});eq('Z12 V1 bindet 2 Mana',2,activeExorcismBindingsV1725(owner,z12.id)[0]?.costs[0]?.amount);owner.counters.M.current=10;capBoundCountersV1725(owner);eq('Gebundene Mana werden nicht aufgefüllt',8,owner.counters.M.current);eq('Z12 kann mit aktiver Bindung nicht verlernt werden',false,unlearnPowerV176(owner,EXORCISM_SKILL_ID_V1725,z12.id));eq('Stufensenkung bei aktiver Bindung blockiert',false,setPurchasedSkillLevelV176(owner,EXORCISM_SKILL_ID_V1725,14,()=>true));releaseSynergyBindingV1721R2(owner,activeExorcismBindingsV1725(owner,z12.id)[0].id);eq('Gelöste Bindung gibt Mana frei',10,owner.counters.M.current);eq('Exorzismusinfo zeigt Wirkzeit und gemeinsame Regeln',true,powerInfoContentV176(entries[3],owner).textContent.includes('Wirkzeit')&&powerInfoContentV176(entries[3],owner).textContent.includes('Besessenheit und Pakt sind getrennte Datensätze'));
  const legacy=newCharacter();legacy.powerPathChoicesV176[EXORCISM_SKILL_ID_V1725]='FS';legacy.customSkills=[{id:'custom_old',name:'Exorzismus & Austreibung'},{id:'custom_economy',name:'Wirtschaft & Handel',category:'Eigene Fähigkeiten',attributeIds:['IT','IN'],attrs:'IT, IN',use:'FO',scope:'Altbestand',archived:false}];legacy.skills.custom_economy={level:7,fav:true,note:'Bestehendes Handelsnetz',learnedPowerIds:[],learnedTechniqueIds:[]};delete legacy.skills[ECONOMY_TRADE_SKILL_ID_V1725];delete legacy.v1725ExorcismMigrationDone;delete legacy.v1725EconomyTradeMigrationDone;delete legacy.v1725EffectsR4Done;const migrated={appVersion:'1.7.24',schemaVersion:27,rulesVersion:13,characters:[legacy],migrationLog:[]};ensureStateV1725(migrated,true);const once=JSON.stringify(migrated);ensureStateV1725(migrated,true);eq('Ungültige Altwahl wird entfernt',undefined,legacy.powerPathChoicesV176[EXORCISM_SKILL_ID_V1725]);eq('Gleichnamige eigene Fähigkeiten bleiben erhalten',2,legacy.customSkills.length);eq('Eigene Wirtschaftsfähigkeit behält ihre Daten','7|true|Bestehendes Handelsnetz',[legacy.skills.custom_economy.level,legacy.skills.custom_economy.fav,legacy.skills.custom_economy.note].join('|'));eq('Neue Regelfähigkeit Wirtschaft & Handel startet bei 0',0,legacy.skills[ECONOMY_TRADE_SKILL_ID_V1725].level);eq('Wirtschafts-Namenskonflikt wird auditiert',true,legacy.exorcismAuditV1725.economyTradeCustomNameConflict);eq('Migration erreicht Schema und Regelstand r4','29|15',`${migrated.schemaVersion}|${migrated.rulesVersion}`);eq('Migration ist idempotent',once,JSON.stringify(migrated));
  const sleepOwner=newCharacter();sleepOwner.attributes.WN=7;sleepOwner.activeEffectsV177=[effectInstanceV177({definitionId:'effect-core-sleeping'})];eq('Schlafend senkt WN um 5 und Bewegung auf 0','2|0',`${effectiveAttributes(sleepOwner).WN}|${derived(sleepOwner).find(row=>row.n==='Bewegung').v}`);
  const bleedOwner=newCharacter();bleedOwner.counters.L={max:10,current:10};bleedOwner.activeEffectsV177=[effectInstanceV177({definitionId:'effect-core-bleeding'})];advanceEffectsV1710(bleedOwner,'round',{confirm:false,persist:false,notify:false});eq('Blutend kostet 1 L je fortgeschriebener Runde',9,bleedOwner.counters.L.current);
  const acidOwner=newCharacter();acidOwner.counters.L={max:10,current:10};acidOwner.equipment=[normalizeItemV174({name:'Testpanzer',itemType:'armor',category:'armor.body',protection:3,quantity:1,equippedQuantity:1,loadState:'equipped',active:true})];acidOwner.activeEffectsV177=[effectInstanceV177({definitionId:'effect-core-corroded'})];for(let index=0;index<3;index++)advanceEffectsV1710(acidOwner,'round',{confirm:false,persist:false,notify:false});const acidArmor=armorRowV1725(derived(acidOwner)).v;advanceEffectsV1710(acidOwner,'round',{confirm:false,persist:false,notify:false});eq('Verätzt baut erst Rüstung und danach Leben ab','0|9',`${acidArmor}|${acidOwner.counters.L.current}`);
  const itemOwner=newCharacter(),ring=normalizeItemV174({name:'Ring',quantity:1,equippedQuantity:1,loadState:'equipped'});itemOwner.equipment=[ring];itemOwner.activeEffectsV177=[effectInstanceV177({name:'Stärkering',sourceType:'item',sourceId:ring.instanceId,modules:[moduleV177({type:'attribute',target:'ST',operation:'add',value:1})]})];const equippedBonus=attributeModifiers(itemOwner).ST;ring.loadState='carried';eq('Gegenstandsbonus wirkt nur ausgerüstet','1|0',`${equippedBonus}|${attributeModifiers(itemOwner).ST}`);
  const directEntry=COMBAT_BY_ID_V178.get('tech_light_melee_mortal_opening'),directOwner=newCharacter();directOwner.skills[directEntry.skillId].level=1;directOwner.skills[directEntry.skillId].learnedTechniqueIds=[directEntry.id];directOwner.counters.A={max:10,current:10};const directDue=techniquePaymentV1721(directOwner,directEntry).due,directRound=directOwner.combatRoundV1721.number;useTechniqueV1721(directOwner,directEntry.id,{persist:false,notify:false,debounce:false});eq('Technik zahlt direkt ohne Rundenzähler','true|true',`${directOwner.counters.A.current===10-directDue}|${directOwner.combatRoundV1721.number===directRound}`);
  const effectCard=renderEffectsV177(newCharacter());eq('Effektkarte enthält keinen privaten Kampfrundenzähler',false,effectCard.textContent.includes('Offene Runde')||!!effectCard.querySelector('.combat-round-panel-v1721'));eq('Rundenschritt ist als reine Effektzeit bezeichnet',true,effectCard.textContent.includes('Nächste Runde · Effekte'));
  const blockedRow=el('div',{class:'info-ready-r5'});document.body.append(blockedRow);hideRuleInfoR5(true);const rowBlocked=showRuleInfoR5(blockedRow,'Nicht öffnen',()=>el('p',{text:'Inhalt'}))===false&&rulePopoverR5().hidden;eq('Tabellenzeile löst keine Beschreibung aus',true,rowBlocked);blockedRow.remove();
  const descriptionButton=infoButtonR5(null,'Testbeschreibung',()=>el('p',{text:'Inhalt'}));document.body.append(descriptionButton);descriptionButton.click();const openState=`${!rulePopoverR5().hidden}|${descriptionButton.getAttribute('aria-expanded')}|${descriptionButton.textContent}`;descriptionButton.click();const closedState=`${rulePopoverR5().hidden}|${descriptionButton.getAttribute('aria-expanded')}`;eq('Beschreibungsschaltfläche öffnet und schließt per Klick','true|true|Beschreibung|true|false',`${openState}|${closedState}`);descriptionButton.remove();
  for(const test of tests)body.append(el('tr',{},[test[0],test[1],test[2],test[3]?'Bestanden':'Fehler'].map(value=>el('td',{text:String(value)}))));return[...body.querySelectorAll('tr')].every(row=>row.cells[row.cells.length-1]?.textContent==='Bestanden');
}
runTests=runTestsV1725;testsBtn.onclick=runTestsV1725;

document.querySelector('.brand small').textContent='v1.7.25';renderAll();save();
Object.assign(window.Eberos,{version:V1725_VERSION,revision:V1725_REVISION,schemaVersion:V1725_SCHEMA,rulesVersion:V1725_RULES,powerCatalogVersion:POWER_DB_V176.meta?.catalogVersion,economyTradeSkillId:ECONOMY_TRADE_SKILL_ID_V1725,ensureStateV1725,ensureOwnerV1725,isExorcismPower:isExorcismPowerV1725,resolvedPowerKind:resolvedPowerKindV1725,resolvedPowerCostText:resolvedPowerCostTextV1725,activeExorcismBindings:activeExorcismBindingsV1725,useExorcismPower:useExorcismPowerV1725,releaseSynergyBinding:releaseSynergyBindingV1721R2,runTests:runTestsV1725});
