'use strict';

/* Eberos v1.7.10: strukturierte aktive Effekte, eindeutige Fähigkeitsmodifikatoren
   und eine gemeinsame Zeitfortschreibung. */
const V1710_VERSION='1.7.10',V1710_SCHEMA=19,V1710_RULES=7;

const EFFECT_DURATION_TYPES_V1710=[
  ['manual','Bis manuell beendet'],['scene','Bis Szenenende'],['rest','Bis zur nächsten Rast'],
  ['camp-rest','Bis zur nächsten Lagerrast'],['rounds','Anzahl Kampfrunden'],
  ['ten-minutes','Anzahl 10-Minuten-Abschnitte'],['hours','Anzahl Stunden'],['days','Anzahl Tage'],
  ['source','Solange die Quelle aktiv ist'],['permanent','Dauerhaft']
];
const EFFECT_DURATION_LABELS_V1710=Object.fromEntries(EFFECT_DURATION_TYPES_V1710);
const COUNTED_DURATIONS_V1710=new Set(['rounds','ten-minutes','hours','days']);
const EFFECT_TRIGGERS_V1710=[
  ['immediate-once','Sofort einmalig'],['round','Nach jeder vollständigen Kampfrunde'],
  ['3-rounds','Nach jeweils 3 vollständigen Kampfrunden'],['10-minutes','Je 10 Minuten'],
  ['hour','Je Stunde'],['rest','Bei einer Rast'],['camp-rest','Bei einer Lagerrast'],
  ['day','Je Tag'],['manual','Manuell auslösen']
];
const EFFECT_TRIGGER_LABELS_V1710=Object.fromEntries([...EFFECT_TRIGGERS_V1710,['legacy-6-hours','Alle 6 Stunden (übernommen)']]);
const EFFECT_MODULE_TYPES_V1710=[
  ['skill-all','Alle Fähigkeiten verändern'],['skill-category','Fähigkeitskategorie verändern'],
  ['skill','Einzelne Fähigkeit verändern'],['skill-attribute','Fähigkeiten nach verwendetem Grundwert verändern'],
  ['attribute','Grundwert verändern'],['counter-max','Counter-Maximum verändern'],
  ['counter-current','Aktuellen Counterstand verändern'],['counter-regen','Counter-Regeneration verändern'],
  ['derived','Abgeleiteten Wert verändern'],['flag','Handlung oder Funktion sperren'],
  ['rule','Nur beschreibende Regelwirkung']
];
const EFFECT_MODULE_LABELS_V1710=Object.fromEntries(EFFECT_MODULE_TYPES_V1710);
const EFFECT_FUNCTIONS_V1710=[['action','Aktionen'],['reaction','Reaktionen'],['concentration','Konzentration'],['sight','Sicht'],['hearing','Hören']];
const EFFECT_DERIVED_V1710=[['movement','Bewegung'],['initiative','Initiative'],['defense','Verteidigung']];
const EFFECT_SOURCE_LABELS_V1710={...EFFECT_SOURCE_LABELS_V177,catalog:'Effektkatalog',custom:'Eigener Effekt',magic:'Magie'};

const effectStyleV1710=el('style',{text:`
.effect-head-v1710,.effect-add-paths-v1710,.effect-time-actions-v1710,.effect-row-v1710,.effect-row-actions-v1710,.effect-editor-actions-v1710{display:flex;align-items:center;gap:.45rem;flex-wrap:wrap}.effect-head-v1710{justify-content:space-between;margin-bottom:.7rem}.effect-list-v1710{display:grid;gap:.42rem}.effect-row-v1710{display:grid;grid-template-columns:auto minmax(9rem,1fr) minmax(14rem,2fr) minmax(8rem,.8fr) minmax(7rem,.7fr) auto;align-items:center;padding:.55rem .65rem;border:1px solid var(--border);border-radius:9px;background:var(--panel-alt)}.effect-row-v1710.inactive{opacity:.68}.effect-row-v1710 .effect-summary-v1710{color:var(--muted);font-size:.86rem}.effect-row-actions-v1710{justify-content:flex-end}.effect-time-v1710{display:grid;gap:.45rem;margin:.7rem 0;padding:.65rem;border:1px solid var(--border);border-radius:9px;background:var(--panel-alt)}.effect-time-v1710 h4{margin:0}.effect-time-actions-v1710 button{flex:1 1 10rem}.effect-locks-v1710{margin:.55rem 0;padding:.55rem;border-left:4px solid var(--danger);background:var(--panel-alt)}
.effect-dialog-v1710{width:min(72rem,calc(100vw - 24px));max-height:calc(100vh - 24px)}.effect-editor-v1710{display:grid;gap:.8rem}.effect-editor-section-v1710{display:grid;gap:.55rem;padding:.7rem;border:1px solid var(--border);border-radius:10px}.effect-editor-section-v1710>h3{margin:0}.effect-editor-grid-v1710{display:grid;grid-template-columns:repeat(3,minmax(10rem,1fr));gap:.55rem}.effect-module-list-v1710{display:grid;gap:.55rem}.effect-module-row-v1710{display:grid;grid-template-columns:repeat(4,minmax(9rem,1fr)) auto;gap:.45rem;align-items:end;padding:.55rem;border:1px solid var(--border);border-radius:8px;background:var(--panel-alt)}.effect-module-row-v1710 .wide-v1710{grid-column:span 2}.effect-module-legacy-v1710{grid-template-columns:1fr auto}.effect-preview-v1710{padding:.65rem;border:1px solid var(--accent-2);border-radius:8px;background:var(--panel-alt);white-space:pre-wrap}.effect-preview-v1710 strong{display:block;margin-bottom:.3rem}.effect-readonly-v1710{padding:.65rem;border-left:4px solid var(--accent-2);background:var(--panel-alt)}
.effect-add-dialog-v1710{width:min(68rem,calc(100vw - 24px));max-height:calc(100vh - 24px)}.effect-add-paths-v1710>button{flex:1 1 18rem;min-height:4rem}.effect-catalog-v1710{display:grid;gap:.55rem}.effect-catalog-results-v1710{display:grid;gap:.4rem}.effect-catalog-result-v1710{display:grid;grid-template-columns:minmax(10rem,.7fr) minmax(16rem,1.6fr) auto;gap:.55rem;align-items:center;padding:.5rem;border:1px solid var(--border);border-radius:8px}.effect-catalog-result-v1710 p{margin:0;color:var(--muted)}
.skill-mod-trigger-v1710{width:100%;min-width:3.8rem;padding:.3rem .4rem}.skill-mod-breakdown-v1710{display:grid;gap:.35rem}.skill-mod-breakdown-v1710 h4,.skill-mod-breakdown-v1710 p{margin:.1rem 0}.skill-mod-breakdown-v1710 ul{margin:.2rem 0;padding-left:1.2rem}
@media(max-width:900px){.effect-row-v1710{grid-template-columns:auto 1fr 1fr}.effect-row-v1710 .effect-summary-v1710{grid-column:2/-1}.effect-row-actions-v1710{grid-column:1/-1}.effect-editor-grid-v1710{grid-template-columns:1fr 1fr}.effect-module-row-v1710{grid-template-columns:1fr 1fr}.effect-catalog-result-v1710{grid-template-columns:1fr}}
@media(max-width:540px){.effect-row-v1710,.effect-editor-grid-v1710,.effect-module-row-v1710{grid-template-columns:1fr}.effect-row-v1710 .effect-summary-v1710,.effect-module-row-v1710 .wide-v1710{grid-column:auto}.effect-row-actions-v1710{grid-column:auto;justify-content:flex-start}.effect-dialog-v1710,.effect-add-dialog-v1710{width:calc(100vw - 12px);max-height:calc(100vh - 12px)}}
@media print{.effect-time-v1710,.effect-head-v1710 button,.effect-row-actions-v1710,.effect-row-v1710 input{display:none!important}.skill-mod-trigger-v1710{border:0;padding:0;background:none;color:inherit}}
`});
document.head.append(effectStyleV1710);

const moduleBeforeV1710=moduleV177,effectInstanceBeforeV1710=effectInstanceV177;
function triggerFromIntervalV1710(value){return({'round':'round','3-rounds':'3-rounds','10-minutes':'10-minutes',hour:'hour','6-hours':'legacy-6-hours',day:'day',rest:'rest',manual:'manual'})[value]||'manual'}
function durationFromLegacyV1710(value){return({source:'source',permanent:'permanent',rounds:'rounds',minutes:'ten-minutes',hours:'hours',days:'days',scene:'scene',manual:'manual',rest:'rest'})[value]||'manual'}
function durationAmountFromLegacyV1710(raw,type){const value=Math.max(0,+raw.durationValue||0);return type==='ten-minutes'&&raw.durationUnit==='minutes'?Math.ceil(value/10):value}
function durationRemainingFromLegacyV1710(raw,type,amount){if(!COUNTED_DURATIONS_V1710.has(type))return null;if(raw.durationRemainingV1710!==undefined&&raw.durationRemainingV1710!==null)return Math.max(0,+raw.durationRemainingV1710||0);if(raw.remaining!==undefined&&raw.remaining!==null)return type==='ten-minutes'&&raw.durationUnit==='minutes'?Math.ceil((+raw.remaining||0)/10):Math.max(0,+raw.remaining||0);return amount}

moduleV177=function(raw={}){
  const module=moduleBeforeV1710(raw),signed=Number.isFinite(+raw.value)?+raw.value:module.value;
  module.polarityV1710=raw.polarityV1710||raw.polarity||(signed<0?'malus':'bonus');module.amountV1710=Math.abs(Number.isFinite(+raw.amountV1710)?+raw.amountV1710:signed);
  module.triggerV1710=raw.triggerV1710||raw.trigger||(module.type==='counter-current'?triggerFromIntervalV1710(raw.interval||module.interval):'');
  module.ruleTextV1710=raw.ruleTextV1710||raw.ruleText||raw.scope||'';module.immediateAppliedV1710=raw.immediateAppliedV1710===true;
  module.legacyIntervalV1710=raw.legacyIntervalV1710||(module.type!=='counter-current'&&raw.interval&&raw.interval!=='manual'?raw.interval:'');
  module.legacyTypeV1710=raw.legacyTypeV1710||'';module.legacyOperationV1710=raw.legacyOperationV1710||'';module.situationalV1710=raw.situationalV1710===true;
  return module;
};
effectInstanceV177=function(raw={}){
  const effect=effectInstanceBeforeV1710(raw),type=raw.durationTypeV1710||durationFromLegacyV1710(raw.durationUnit||effect.durationUnit),amount=raw.durationAmountV1710!==undefined?Math.max(0,+raw.durationAmountV1710||0):durationAmountFromLegacyV1710(raw,type);
  effect.durationTypeV1710=type;effect.durationAmountV1710=amount;effect.durationRemainingV1710=durationRemainingFromLegacyV1710(raw,type,amount);return effect;
};

function normalizeModuleSemanticsV1710(module){
  if(module.type==='difficulty'){
    module.legacyTypeV1710=module.legacyTypeV1710||'difficulty';module.legacyOperationV1710=module.legacyOperationV1710||module.operation;module.type='rule';module.ruleTextV1710=module.scope||`${module.target||'Situative Probe'}: ${Math.abs(+module.value||0)} Erschwernis`;module.situationalV1710=true;
  }
  if(module.type==='flag'&&module.operation!=='block'){module.legacyOperationV1710=module.legacyOperationV1710||module.operation;module.operation='block'}
  if(['skill-all','skill-category','skill','skill-attribute','attribute','counter-max','counter-current','counter-regen','derived'].includes(module.type)&&module.operation==='add'){
    module.polarityV1710=(+module.value||0)<0?'malus':'bonus';module.amountV1710=Math.abs(+module.value||0);
  }
  if(module.type==='counter-current')module.triggerV1710=module.triggerV1710||triggerFromIntervalV1710(module.interval);
  else if(module.interval&&module.interval!=='manual')module.legacyIntervalV1710=module.legacyIntervalV1710||module.interval;
  return module;
}
const legacyDisadvantageModulesBeforeV1710=legacyDisadvantageModulesV177;
legacyDisadvantageModulesV177=function(disadvantage){return legacyDisadvantageModulesBeforeV1710(disadvantage).map(normalizeModuleSemanticsV1710)};

function syncLegacyDurationV1710(effect){
  const type=effect.durationTypeV1710,amount=Math.max(0,+effect.durationAmountV1710||0),remaining=effect.durationRemainingV1710;
  const unit=type==='ten-minutes'?'minutes':COUNTED_DURATIONS_V1710.has(type)?type:type==='source'?'source':type==='permanent'?'permanent':type==='scene'?'scene':'manual';
  const factor=type==='ten-minutes'?10:1;effect.durationUnit=unit;effect.durationValue=amount*factor;effect.remaining=COUNTED_DURATIONS_V1710.has(type)?Math.max(0,+(remaining??amount)||0)*factor:null;
}
function ensureOwnerV1710(owner){
  if(!owner||owner.type==='possession')return owner;ensureOwnerV178(owner);owner.activeEffectsV177=Array.isArray(owner.activeEffectsV177)?owner.activeEffectsV177:[];
  for(const effect of owner.activeEffectsV177){const normalized=effectInstanceV177(effect);Object.assign(effect,normalized);effect.modules=effect.modules.map(normalizeModuleSemanticsV1710);syncLegacyDurationV1710(effect)}return owner;
}
function ownerListV1710(data=state){const result=[];for(const character of data.characters||[]){result.push(character);for(const owner of character.auxiliaryTabs||[])if(owner.type!=='possession')result.push(owner)}return result}
function ensureStateV1710(data,log=true){
  const first=!data.v1710EffectsDone;for(const owner of ownerListV1710(data))ensureOwnerV1710(owner);data.appVersion=V1710_VERSION;data.schemaVersion=V1710_SCHEMA;data.rulesVersion=V1710_RULES;data.v1710EffectsDone=true;
  if(first&&log){data.migrationLog=Array.isArray(data.migrationLog)?data.migrationLog:[];data.migrationLog.push({from:18,to:19,at:new Date().toISOString(),changes:['Aktive Effekte auf strukturierte Dauer und Auslösung migriert','Situative Probenhinweise von globalen Fähigkeitsmodifikatoren getrennt','Stapelungsdaten erhalten und aus der Standardbedienung entfernt','Effekteditor und Zeitfortschreibung vereinheitlicht']})}return data;
}
const migrateStateBeforeV1710=migrateState,newCharacterBeforeV1710=newCharacter,newAuxEntryBeforeV1710=newAuxEntry;
migrateState=function(data){return ensureStateV1710(migrateStateBeforeV1710(data),true)};
newCharacter=function(){return ensureOwnerV1710(newCharacterBeforeV1710())};
newAuxEntry=function(type,name){const owner=newAuxEntryBeforeV1710(type,name);return type==='possession'?owner:ensureOwnerV1710(owner)};
if(!state.v1710EffectsDone){try{localStorage.setItem(STORE+'.backup.pre-v1710.'+Date.now(),JSON.stringify(state))}catch{}}
state=ensureStateV1710(state,true);

const effectIsActiveBeforeV1710=effectIsActiveV177;
function sourceEntityV1710(owner,id){
  const lists=[owner.equipment,owner.disadvantages,owner.spells,owner.advantages,owner.powers,owner.magic];for(const list of lists)if(Array.isArray(list)){const found=list.find(entry=>entry&&(entry.id===id||entry.instanceId===id));if(found)return found}return null;
}
effectIsActiveV177=function(owner,effect){
  if(!effectIsActiveBeforeV1710(owner,effect))return false;if(!effect?.sourceManaged||!effect.sourceId||['item','disadvantage'].includes(effect.sourceType))return true;const source=sourceEntityV1710(owner,effect.sourceId);return!!source&&source.active!==false&&source.enabled!==false;
};

function allEffectSkillsV1710(owner){ensureOwnerV1710(owner);return allSkillsV178(owner,false)}
function skillAttributesV1710(skill){return skill.attributeIds?.length?skill.attributeIds:skillAttributeIdsR10(skill)}
function moduleAppliesToSkillV1710(module,skill){
  if(module.type==='skill-all')return true;if(module.type==='skill-category')return module.target===skill.category;if(module.type==='skill')return module.target===skill.id||module.target===skill.name;if(module.type==='skill-attribute')return skillAttributesV1710(skill).includes(module.target);return false;
}
function skillEffectEntriesV1710(owner,skill){
  const entries=[],seen=new Set();for(const effect of activeEffectInstancesV177(owner))for(const module of effect.modules||[]){if(!moduleAppliesToSkillV1710(module,skill))continue;const sourceKey=effect.sourceManaged&&effect.sourceId?`${effect.sourceType}:${effect.sourceId}`:effect.id,key=`${sourceKey}|${module.id}|${skill.id}`;if(seen.has(key))continue;seen.add(key);entries.push({effect,module})}return entries;
}
function signedModuleValueV1710(module){if(module.operation!=='add')return+module.value||0;const amount=Math.abs(Number.isFinite(+module.amountV1710)?+module.amountV1710:+module.value||0);return module.polarityV1710==='malus'?-amount:amount}
function skillModifierResultV1710(owner,skill){
  const level=Math.max(0,+owner.skills?.[skill.id]?.level||0),entries=skillEffectEntriesV1710(owner,skill);let value=level;
  for(const{module}of entries)if(module.operation==='add')value+=signedModuleValueV1710(module);
  for(const{module}of entries)if(module.operation==='percent')value*=1+(+module.value||0)/100;
  const sets=entries.filter(({module})=>module.operation==='set');if(sets.length)value=Math.min(...sets.map(({module})=>+module.value||0));
  const computed=Math.round(value),modifier=computed-level,effective=Math.max(0,Math.min(25,computed));return{level,effective,modifier,entries};
}
skillModifiers=function(owner){const out={};for(const skill of allEffectSkillsV1710(owner))out[skill.id]=skillModifierResultV1710(owner,skill).modifier;return out};

function signedTextV1710(value){const number=+value||0;return(number>0?'+':'')+number}
function skillModuleTargetV1710(owner,module){
  if(module.type==='skill-all')return'Alle Fähigkeiten';if(module.type==='skill-category')return`Kategorie ${module.target}`;if(module.type==='skill-attribute')return`Fähigkeiten mit ${module.target}`;if(module.type==='skill')return allEffectSkillsV1710(owner).find(skill=>skill.id===module.target)?.name||module.target;return module.target;
}
function skillModifierInfoV1710(owner,skill){
  const result=skillModifierResultV1710(owner,skill),box=el('div',{class:'skill-mod-breakdown-v1710'});box.append(el('h4',{text:`Gesamtmodifikator: ${signedTextV1710(result.modifier)}`}),el('p',{class:'muted',text:`Gekauft ${result.level} · Wirksam ${result.effective}`}));
  if(result.entries.length){const list=el('ul');for(const{effect,module}of result.entries){const value=module.operation==='add'?signedTextV1710(signedModuleValueV1710(module)):module.operation==='percent'?`${signedTextV1710(module.value)} %`:`auf ${module.value} gesetzt`;list.append(el('li',{text:`${effect.name}: ${value} · ${skillModuleTargetV1710(owner,module)}`}))}box.append(list)}else box.append(el('p',{text:'Keine aktiven Fähigkeitsmodifikatoren.'}));return box;
}
function decorateSkillModsV1710(box,owner){
  const body=box.querySelector('.skills-r5 tbody');if(!body)return box;const enhance=()=>{const skills=new Map(allEffectSkillsV1710(owner).map(skill=>[skill.id,skill]));for(const row of body.querySelectorAll('tr[data-skill-id]:not([data-mod-ready-v1710])')){const skill=skills.get(row.dataset.skillId),cell=row.children[7];if(!skill||!cell)continue;row.dataset.modReadyV1710='true';const result=skillModifierResultV1710(owner,skill),button=el('button',{type:'button',class:'skill-mod-trigger-v1710',text:signedTextV1710(result.modifier),'aria-label':`Modifikator für ${skill.name}: ${signedTextV1710(result.modifier)}`});button.onclick=event=>{event.stopPropagation();showPinnedRuleInfoV179(button,`Modifikator · ${skill.name}`,()=>skillModifierInfoV1710(owner,skill))};cell.replaceChildren(button)}};enhance();new MutationObserver(enhance).observe(body,{childList:true});return box;
}
const renderSkillsBeforeV1710=renderSkillsOwnerR5;
renderSkillsOwnerR5=function(owner,isAux=false){return decorateSkillModsV1710(renderSkillsBeforeV1710(owner,isAux),owner)};
renderSkills=function(){return renderSkillsOwnerR5(ch(),false)};renderAuxSkillsV17=function(owner){return renderSkillsOwnerR5(owner,true)};

function moduleLabelV1710(owner,module){
  const value=signedTextV1710(signedModuleValueV1710(module));
  if(['skill-all','skill-category','skill','skill-attribute'].includes(module.type))return`${skillModuleTargetV1710(owner,module)} ${value}`;
  if(module.type==='counter-current')return`${module.target} ${value} · ${EFFECT_TRIGGER_LABELS_V1710[module.triggerV1710]||'manuell'}`;
  if(module.type==='counter-regen')return`Regeneration ${module.target==='*'?'aller Counter':module.target} ${module.operation==='add'?value:module.operation==='set'?`= ${module.value}`:module.value}`;
  if(module.type==='flag')return`${Object.fromEntries(EFFECT_FUNCTIONS_V1710)[module.target]||module.target} gesperrt`;
  if(module.type==='rule')return`${module.situationalV1710?'Situativer Hinweis: ':''}${module.ruleTextV1710||module.scope||'Beschreibende Regelwirkung'}`;
  if(module.type==='attribute')return`Grundwert ${module.target} ${module.operation==='add'?value:module.operation==='set'?`= ${module.value}`:`${module.value} %`}`;
  if(module.type==='counter-max')return`Counter-Maximum ${module.target} ${module.operation==='add'?value:module.operation==='set'?`= ${module.value}`:`${module.value} %`}`;
  if(module.type==='derived')return`${Object.fromEntries(EFFECT_DERIVED_V1710)[module.target]||module.target} ${module.operation==='add'?value:module.operation==='set'?`= ${module.value}`:`${module.value} %`}`;
  if(module.type==='counter-block')return moduleLabelV177(module);return`${EFFECT_MODULE_LABELS_V1710[module.type]||module.type}: ${module.target||''}`;
}
function effectSummaryV1710(owner,effect){const parts=(effect.modules||[]).slice(0,4).map(module=>moduleLabelV1710(owner,module));return parts.length?parts.join(' · '):effect.description||'Keine strukturierte Wirkung'}
effectSummaryV177=function(effect){return effectSummaryV1710(ch(),effect)};
function durationSummaryV1710(effect){const label=EFFECT_DURATION_LABELS_V1710[effect.durationTypeV1710]||effect.durationTypeV1710||'Bis manuell beendet';return COUNTED_DURATIONS_V1710.has(effect.durationTypeV1710)?`${Math.max(0,+effect.durationRemainingV1710||0)} verbleibend (${label})`:label}
function sourceLabelV1710(owner,effect){return effectSourceLabelV177(owner,effect)||EFFECT_SOURCE_LABELS_V1710[effect.sourceType]||'Eigener Effekt'}

function showEffectInfoV1710(anchor,effect,owner){
  const box=tooltipNodeV177();box.replaceChildren(el('h3',{text:effect.name}),el('p',{class:'muted',text:`${effect.category} · ${durationSummaryV1710(effect)} · Quelle: ${sourceLabelV1710(owner,effect)}`}),el('p',{text:effect.description||'Keine Beschreibung.'}));if(effect.modules?.length)box.append(el('ul',{},effect.modules.map(module=>el('li',{text:moduleLabelV1710(owner,module)}))));box.hidden=false;const rect=anchor.getBoundingClientRect(),margin=12,width=box.offsetWidth,height=box.offsetHeight;box.style.left=Math.max(margin,Math.min(innerWidth-width-margin,rect.right+8+width<innerWidth?rect.right+8:rect.left-width-8))+'px';box.style.top=Math.max(margin,Math.min(innerHeight-height-margin,rect.bottom+8+height<innerHeight?rect.bottom+8:rect.top-height-8))+'px';
}
showEffectInfoV177=showEffectInfoV1710;

function sourceTargetV1710(owner,effect){if(effect.sourceType==='item')return{ownerId:owner.id,cardType:'equipment',itemId:effect.sourceId};if(effect.sourceType==='disadvantage')return{ownerId:owner.id,cardType:'modules',disadvantageId:effect.sourceId};if(effect.sourceType==='magic')return{ownerId:owner.id,cardType:'fatePath'};return null}
function sourceLinkV1710(owner,effect){const target=sourceTargetV1710(owner,effect);if(!target)return null;return el('button',{type:'button',text:'Zur Quelle',onclick:()=>navigateToV177(target)})}

function moduleEventPlanV1710(module,eventKey){
  const trigger=module.triggerV1710||'manual',progress=Math.max(0,+module.progress||0);let count=0,next=progress;
  if(trigger==='round'&&eventKey==='round')count=1;
  else if(trigger==='3-rounds'&&eventKey==='round'){next=progress+1;if(next>=3){count=Math.floor(next/3);next%=3}}
  else if(trigger==='10-minutes'){const units=eventKey==='10-minutes'?1:eventKey==='hour'?6:eventKey==='day'?144:0;count=units}
  else if(trigger==='hour'){count=eventKey==='hour'?1:eventKey==='day'?24:0}
  else if(trigger==='legacy-6-hours'){const units=eventKey==='hour'?1:eventKey==='day'?24:0;next=progress+units;if(next>=6){count=Math.floor(next/6);next%=6}}
  else if(trigger==='day'&&eventKey==='day')count=1;else if(trigger===eventKey&&['rest','camp-rest','manual'].includes(eventKey))count=1;
  return{count,next};
}
function boundedCounterV1710(owner,id,before,value){let maximum=Math.max(0,+owner.counters?.[id]?.max||0);if(id==='L'&&value>before)maximum=Math.min(maximum,blockedLifeV177(owner).cap);return Math.max(0,Math.min(maximum,Math.round(value)))}
function planEffectAdvanceV1710(owner,eventKey,options={}){
  ensureOwnerV1710(owner);const current=new Map(COUNTERS.map(([id])=>[id,options.initialValues?.[id]??Math.max(0,+owner.counters?.[id]?.current||0)])),changes=[],progress=[];
  for(const effect of activeEffectInstancesV177(owner)){if(options.effectId&&effect.id!==options.effectId)continue;for(const module of effect.modules||[]){if(module.type!=='counter-current')continue;const trigger=moduleEventPlanV1710(module,eventKey);if(trigger.next!==Math.max(0,+module.progress||0))progress.push({module,next:trigger.next});if(!trigger.count||!owner.counters?.[module.target])continue;const before=current.get(module.target)||0;let raw=before;if(module.operation==='set')raw=+module.value||0;else if(module.operation==='percent')raw=before*Math.pow(1+(+module.value||0)/100,trigger.count);else raw=before+signedModuleValueV1710(module)*trigger.count;const after=boundedCounterV1710(owner,module.target,before,raw);current.set(module.target,after);if(after!==before)changes.push({effect,module,before,after,count:trigger.count})}}
  return{eventKey,current,changes,progress};
}
function durationStepsV1710(type,eventKey){if(type==='rounds')return eventKey==='round'?1:0;if(type==='ten-minutes')return eventKey==='10-minutes'?1:eventKey==='hour'?6:eventKey==='day'?144:0;if(type==='hours')return eventKey==='hour'?1:eventKey==='day'?24:0;if(type==='days')return eventKey==='day'?1:0;return 0}
function advanceDurationsV1710(owner,eventKey){for(const effect of activeEffectInstancesV177(owner)){const type=effect.durationTypeV1710;if(type==='scene'&&eventKey==='scene-end'||type==='rest'&&eventKey==='rest'||type==='camp-rest'&&eventKey==='camp-rest'){effect.active=false;continue}const steps=durationStepsV1710(type,eventKey);if(steps&&COUNTED_DURATIONS_V1710.has(type)){effect.durationRemainingV1710=Math.max(0,(+effect.durationRemainingV1710||0)-steps);if(effect.durationRemainingV1710===0)effect.active=false;syncLegacyDurationV1710(effect)}}}
function effectPreviewV1710(plan){return plan.changes.map(change=>`${change.effect.name}: ${COUNTER_NAMES_V179[change.module.target]||change.module.target} ${change.before} → ${change.after}`).join('\n')}
function applyEffectPlanV1710(owner,plan,options={}){for(const update of plan.progress)update.module.progress=update.next;const targets=new Set(plan.changes.map(change=>change.module.target));for(const id of targets)setCounterCurrentR8(owner,id,plan.current.get(id));if(options.duration!==false)advanceDurationsV1710(owner,plan.eventKey);owner.effectLogV177.unshift({id:uid(),at:nowV177(),event:plan.eventKey,changes:plan.changes.map(change=>({effect:change.effect.name,counter:change.module.target,before:change.before,after:change.after}))});owner.effectLogV177=owner.effectLogV177.slice(0,30)}
function advanceEffectsV1710(owner,eventKey,options={}){
  const plan=planEffectAdvanceV1710(owner,eventKey,options);if(plan.changes.length&&options.confirm!==false&&!confirm(effectPreviewV1710(plan)+'\n\nÄnderungen anwenden?'))return false;applyEffectPlanV1710(owner,plan,options);if(eventKey==='round')advanceCombatClockV178(owner,'round');if(options.persist!==false)persistEffectsV177(owner,options.render!==false);return true;
}
advanceEffectsV177=advanceEffectsV1710;

function counterRegenResultV1710(owner,id,before){const maximum=Math.max(0,+owner.counters?.[id]?.max||0),base=Math.max(0,maximum-before),entries=activeEffectModulesV177(owner,'counter-regen').filter(({module})=>module.target===id||module.target==='*'),gain=Math.max(0,Math.min(base,applyNumericModulesV177(base,entries)));return Math.max(before,Math.min(maximum,before+gain))}
function refillOwnerV1710(owner,camp=false,options={}){
  if(!owner||refillOwnerV1710.busy)return false;ensureOwnerV1710(owner);const rations=owner.rationTracker||(owner.rationTracker={max:0,current:0,note:''});if(camp&&Math.max(0,+rations.current||0)<1){if(options.notify!==false)showToastV179('Keine Ration vorhanden – die Lagerrast wurde nicht ausgeführt.');return false}
  const initial={};for(const[id]of COUNTERS)initial[id]=counterRegenResultV1710(owner,id,Math.max(0,+owner.counters[id].current||0));const eventKey=camp?'camp-rest':'rest',plan=planEffectAdvanceV1710(owner,eventKey,{initialValues:initial});if(plan.changes.length&&options.confirm!==false&&!confirm(effectPreviewV1710(plan)+'\n\nRast und Effektänderungen anwenden?'))return false;
  refillOwnerV1710.busy=true;if(camp)rations.current=Math.max(0,(+rations.current||0)-1);for(const[id]of COUNTERS)owner.counters[id].current=initial[id];applyEffectPlanV1710(owner,plan);advanceCombatClockV178(owner,'rest');if(options.persist!==false)saveOwnerV173(owner,options.render!==false);if(options.notify!==false)showToastV179(camp?'Lagerrast abgeschlossen: Regeneration und Effekte angewendet, 1 Ration verbraucht.':'Rast abgeschlossen: Regeneration und Effekte angewendet.');setTimeout(()=>refillOwnerV1710.busy=false,0);return true;
}
refillOwnerV179=refillOwnerV1710;
const renderCountersBeforeV1710=renderCountersR8;
renderCountersR8=function(owner){const box=renderCountersBeforeV1710(owner),text=box.querySelector('.rest-actions-v179 p');if(text)text.textContent='Normale Rast verbraucht keine Ration. Die Lagerrast verbraucht eine Ration. Aktive Effekte können Regeneration und Rast-Auslösungen verändern.';return box};renderCountersR5=renderCountersR8;

function lockedFunctionsV1710(owner){const result=new Map();for(const{effect,module}of activeEffectModulesV177(owner,'flag'))if(module.operation==='block'||module.operation==='set'&&+module.value===0){if(!result.has(module.target))result.set(module.target,[]);result.get(module.target).push(effect.name)}return result}
function functionLockedV1710(owner,id){return lockedFunctionsV1710(owner).has(id)}

function targetOptionsV1710(owner,type){
  if(type==='skill-category')return[...new Set(allEffectSkillsV1710(owner).map(skill=>skill.category))].map(value=>[value,value]);if(type==='skill')return allEffectSkillsV1710(owner).map(skill=>[skill.id,skill.name]);if(type==='skill-attribute'||type==='attribute')return ATTRS.map(([id,name])=>[id,`${name} (${id})`]);if(['counter-max','counter-current','counter-regen'].includes(type))return COUNTERS.map(([id,name])=>[id,`${name} (${id})`]);if(type==='derived')return EFFECT_DERIVED_V1710;if(type==='flag')return EFFECT_FUNCTIONS_V1710;return[['*','Alle']];
}
function newModuleV1710(type='skill-all'){const target=type==='skill-all'?'*':type==='rule'?'':type==='flag'?'action':'ST';return moduleV177({type,target,operation:type==='flag'?'block':'add',value:type==='rule'?0:-1,polarityV1710:'malus',amountV1710:1,triggerV1710:type==='counter-current'?'manual':'',ruleTextV1710:''})}
function numericModuleEditableV1710(module){return['skill-all','skill-category','skill','skill-attribute','attribute','counter-max','counter-current','counter-regen','derived'].includes(module.type)&&module.operation==='add'}
function effectPreviewTextV1710(owner,effect){const lines=[effect.name||'Unbenannter Effekt',...(effect.modules||[]).map(module=>`• ${moduleLabelV1710(owner,module)}`),`Dauer: ${durationSummaryV1710(effect)}`,`Quelle: ${sourceLabelV1710(owner,effect)}`];return lines.join('\n')}

function moduleEditorRowV1710(owner,module,list,redraw,refreshPreview,readOnly=false){
  const legacy=!numericModuleEditableV1710(module)&&!['flag','rule'].includes(module.type),row=el('div',{class:'effect-module-row-v1710'+(legacy?' effect-module-legacy-v1710':'')});
  if(legacy){row.append(el('div',{class:'effect-readonly-v1710',text:`Übernommene, weiterhin berechnete Spezialwirkung: ${moduleLabelV1710(owner,module)}${module.legacyIntervalV1710?` · früheres Intervall ${module.legacyIntervalV1710}`:''}`}));if(!readOnly)row.append(el('button',{type:'button',class:'danger',text:'Entfernen',onclick:()=>{const index=list.indexOf(module);if(index>=0)list.splice(index,1);redraw()}}));return row}
  const type=el('select',{'aria-label':'Wirkungsart',disabled:readOnly});for(const[value,label]of EFFECT_MODULE_TYPES_V1710)type.append(el('option',{value,text:label}));type.value=module.type;
  const remove=el('button',{type:'button',class:'danger',text:'Entfernen',disabled:readOnly,onclick:()=>{const index=list.indexOf(module);if(index>=0)list.splice(index,1);redraw()}});row.append(fieldV177('Wirkungsart',type));
  type.onchange=()=>{const replacement=newModuleV1710(type.value);Object.assign(module,replacement,{id:module.id});redraw()};
  if(module.type==='rule'){
    const text=el('textarea',{'aria-label':'Beschreibende Regelwirkung',disabled:readOnly});text.value=module.ruleTextV1710||module.scope||'';text.oninput=()=>{module.ruleTextV1710=text.value;module.scope=text.value;refreshPreview()};row.append(fieldV177('Regelwirkung',text),remove);return row;
  }
  const options=targetOptionsV1710(owner,module.type),target=el('select',{'aria-label':'Wirkungsziel',disabled:readOnly});for(const[value,label]of options)target.append(el('option',{value,text:label}));if(options.some(([value])=>value===module.target))target.value=module.target;else{module.target=options[0]?.[0]||'*';target.value=module.target}target.onchange=()=>{module.target=target.value;refreshPreview()};row.append(fieldV177('Ziel',target));
  if(module.type==='flag'){row.append(el('div',{class:'muted',text:'Die gewählte Handlung oder Funktion ist vollständig gesperrt.'}),remove);return row}
  const polarity=el('select',{'aria-label':'Bonus oder Malus',disabled:readOnly},[el('option',{value:'bonus',text:'Bonus'}),el('option',{value:'malus',text:'Malus'})]),amount=el('input',{type:'number',min:0,step:1,value:Math.abs(+module.amountV1710||+module.value||0),'aria-label':'Höhe',disabled:readOnly});polarity.value=module.polarityV1710||(+module.value<0?'malus':'bonus');const updateValue=()=>{module.polarityV1710=polarity.value;module.amountV1710=Math.max(0,+amount.value||0);module.value=module.polarityV1710==='malus'?-module.amountV1710:module.amountV1710;refreshPreview()};polarity.onchange=updateValue;amount.oninput=updateValue;row.append(fieldV177('Bonus oder Malus',polarity),fieldV177('Höhe',amount));
  if(module.type==='counter-current'){
    const trigger=el('select',{'aria-label':'Wann wird die Veränderung ausgelöst?',disabled:readOnly});for(const[value,label]of EFFECT_TRIGGERS_V1710)trigger.append(el('option',{value,text:label}));if(module.triggerV1710==='legacy-6-hours')trigger.append(el('option',{value:'legacy-6-hours',text:EFFECT_TRIGGER_LABELS_V1710['legacy-6-hours']}));trigger.value=module.triggerV1710||'manual';trigger.onchange=()=>{module.triggerV1710=trigger.value;module.interval=trigger.value==='immediate-once'?'manual':trigger.value;refreshPreview()};row.append(fieldV177('Wann wird die Veränderung ausgelöst?',trigger));
  }
  row.append(remove);return row;
}

function applyImmediateEffectsV1710(owner,effect){for(const module of effect.modules||[])if(module.type==='counter-current'&&module.triggerV1710==='immediate-once'&&!module.immediateAppliedV1710&&owner.counters?.[module.target]){const before=owner.counters[module.target].current,after=boundedCounterV1710(owner,module.target,before,before+signedModuleValueV1710(module));setCounterCurrentR8(owner,module.target,after);module.immediateAppliedV1710=true}}
function openEffectEditorV1710(owner,effect){
  hideEffectInfoV177();ensureOwnerV1710(owner);const dialog=editorDialogV177();dialog.classList.add('effect-dialog-v1710');const managed=effect.sourceManaged===true,draft=effectInstanceV177(cloneV177(effect));
  const draw=()=>{
    const preview=el('div',{class:'effect-preview-v1710','aria-live':'polite'}),refreshPreview=()=>preview.replaceChildren(el('strong',{text:'Klartextvorschau'}),document.createTextNode(effectPreviewTextV1710(owner,draft)));
    const close=el('button',{type:'button',text:'✕','aria-label':'Schließen',onclick:()=>dialog.close()}),head=el('div',{class:'dialog-head'},[el('h2',{text:managed?'Effekt ansehen':'Effekt bearbeiten'}),close]);
    if(managed){const source=sourceLinkV1710(owner,effect),body=el('div',{class:'effect-editor-v1710'},[head,el('div',{class:'effect-readonly-v1710',text:'Dieser Effekt wird automatisch von seiner Quelle verwaltet. Änderungen erfolgen an der ursprünglichen Quelle.'}),el('h3',{text:effect.name}),el('p',{text:effect.description||'Keine Beschreibung.'}),el('p',{text:effectPreviewTextV1710(owner,effect)})]);if(source)body.append(source);dialog.replaceChildren(body);if(!dialog.open)dialog.showModal();return}
    const name=el('input',{value:draft.name,'aria-label':'Effektname'}),description=el('textarea',{'aria-label':'Beschreibung und Regelwirkung'}),category=el('input',{value:draft.category,'aria-label':'Effektkategorie'}),source=el('input',{value:sourceLabelV1710(owner,effect),readOnly:true,'aria-label':'Effektquelle'}),active=el('input',{type:'checkbox',checked:draft.active!==false,'aria-label':'Effekt aktiv'});description.value=draft.description;
    name.oninput=()=>{draft.name=name.value;refreshPreview()};description.oninput=()=>{draft.description=description.value;refreshPreview()};category.oninput=()=>draft.category=category.value;active.onchange=()=>draft.active=active.checked;
    const durationType=el('select',{'aria-label':'Dauerart'});for(const[value,label]of EFFECT_DURATION_TYPES_V1710)durationType.append(el('option',{value,text:label}));durationType.value=draft.durationTypeV1710;durationType.onchange=()=>{draft.durationTypeV1710=durationType.value;if(COUNTED_DURATIONS_V1710.has(draft.durationTypeV1710)){draft.durationAmountV1710=Math.max(1,+draft.durationAmountV1710||1);draft.durationRemainingV1710=draft.durationAmountV1710}else draft.durationRemainingV1710=null;draw()};
    const durationFields=[fieldV177('Dauerart',durationType)];if(COUNTED_DURATIONS_V1710.has(draft.durationTypeV1710)){const amount=el('input',{type:'number',min:1,step:1,value:Math.max(1,+draft.durationAmountV1710||1),'aria-label':'Daueranzahl'});amount.oninput=()=>{draft.durationAmountV1710=Math.max(1,+amount.value||1);draft.durationRemainingV1710=draft.durationAmountV1710;refreshPreview()};durationFields.push(fieldV177('Anzahl',amount))}
    const modules=el('div',{class:'effect-module-list-v1710'});for(const module of draft.modules)modules.append(moduleEditorRowV1710(owner,module,draft.modules,draw,refreshPreview));
    const add=el('button',{type:'button',text:'+ Wirkung hinzufügen',onclick:()=>{draft.modules.push(newModuleV1710());draw()}}),cancel=el('button',{type:'button',text:'Abbrechen',onclick:()=>dialog.close()}),saveButton=el('button',{type:'button',class:'primary',text:'Speichern',onclick:()=>{if(!String(draft.name||'').trim()){alert('Bitte einen Effektnamen eingeben.');return}syncLegacyDurationV1710(draft);Object.assign(effect,draft,{updatedAt:nowV177()});applyImmediateEffectsV1710(owner,effect);persistEffectsV177(owner,true);dialog.close()}});
    const sourceButton=sourceLinkV1710(owner,effect),body=el('div',{class:'effect-editor-v1710'},[head,el('section',{class:'effect-editor-section-v1710'},[el('h3',{text:'A. Effekt'}),el('div',{class:'effect-editor-grid-v1710'},[fieldV177('Name',name),fieldV177('Kategorie',category),fieldV177('Quelle',source),fieldV177('Aktiv',active)]),fieldV177('Beschreibung und Regelwirkung',description)]),el('section',{class:'effect-editor-section-v1710'},[el('h3',{text:'B. Dauer'}),el('div',{class:'effect-editor-grid-v1710'},durationFields)]),el('section',{class:'effect-editor-section-v1710'},[el('h3',{text:'C. Wirkungen'}),modules,add]),preview,el('div',{class:'effect-editor-actions-v1710'},[saveButton,cancel])]);if(sourceButton)body.lastElementChild.append(sourceButton);dialog.replaceChildren(body);refreshPreview();if(!dialog.open)dialog.showModal();
  };draw();
}
openEffectEditorV177=openEffectEditorV1710;

let addEffectDialogV1710=null;
function addEffectDialogNodeV1710(){if(!addEffectDialogV1710){addEffectDialogV1710=el('dialog',{class:'effect-add-dialog-v1710'});document.body.append(addEffectDialogV1710)}return addEffectDialogV1710}
function renderCatalogV1710(owner,source,dialog){
  const box=el('div',{class:'effect-catalog-v1710'}),filters=el('div',{class:'effect-picker-controls-v177'}),search=el('input',{type:'search',placeholder:'Vorbereiteten Effekt suchen …','aria-label':'Effektkatalog durchsuchen'}),category=el('select',{'aria-label':'Effektkategorie'}),results=el('div',{class:'effect-catalog-results-v1710'});category.append(el('option',{value:'',text:'Alle Kategorien'}));for(const value of[...new Set(EFFECT_DEFINITIONS_V177.map(entry=>entry.category))])category.append(el('option',{value,text:value}));
  const draw=()=>{const query=normalizeSearchV177(search.value),selected=category.value,matches=EFFECT_DEFINITIONS_V177.filter(definition=>(!selected||definition.category===selected)&&(!query||normalizeSearchV177(`${definition.name} ${definition.mechanics} ${definition.category}`).includes(query))).slice(0,80);results.replaceChildren();for(const definition of matches){const add=el('button',{type:'button',class:'primary',text:'Hinzufügen',onclick:()=>{const effect=effectFromDefinitionV177(owner,definition,source);ensureOwnerV1710(owner);dialog.close();openEffectEditorV1710(owner,effect)}});results.append(el('article',{class:'effect-catalog-result-v1710'},[el('strong',{text:definition.name}),el('p',{text:definition.mechanics}),add]))}if(!matches.length)results.append(el('p',{class:'effect-empty-v177',text:'Kein passender Effekt gefunden.'}))};search.oninput=draw;category.onchange=draw;filters.append(search,category);box.append(filters,results);draw();return box;
}
function openAddEffectV1710(owner,source={type:'catalog',id:'',label:''}){
  ensureOwnerV1710(owner);const dialog=addEffectDialogNodeV1710(),close=el('button',{type:'button',text:'✕','aria-label':'Schließen',onclick:()=>dialog.close()}),head=el('div',{class:'dialog-head'},[el('h2',{text:'Effekt hinzufügen'}),close]),prepared=el('button',{type:'button',text:'Vorbereiteten Effekt auswählen'}),custom=el('button',{type:'button',class:'primary',text:'Eigenen Effekt erstellen'}),paths=el('div',{class:'effect-add-paths-v1710'},[prepared,custom]);prepared.onclick=()=>dialog.replaceChildren(head,renderCatalogV1710(owner,source,dialog));custom.onclick=()=>{const ownSource=source.type==='catalog'?{type:'custom',id:'',label:''}:source,effect=customEffectV177(owner,ownSource);ensureOwnerV1710(owner);persistEffectsV177(owner,true);dialog.close();openEffectEditorV1710(owner,effect)};dialog.replaceChildren(head,paths);if(!dialog.open)dialog.showModal();
}
openEffectCatalogDialogV177=function(owner,source={type:'catalog',id:'',label:''}){openAddEffectV1710(owner,source)};

function renderEffectRowV1710(owner,effect){
  const active=effectIsActiveV177(owner,effect),row=el('div',{class:'effect-row-v1710 '+(active?'':'inactive'),tabindex:0,'data-effect-id':effect.id}),toggle=el('input',{type:'checkbox',checked:effect.active!==false,disabled:effect.sourceManaged===true,'aria-label':effect.name+' aktiv'}),info=el('button',{type:'button',text:'Info'}),edit=el('button',{type:'button',text:effect.sourceManaged?'Ansehen':'Bearbeiten'}),actions=el('div',{class:'effect-row-actions-v1710'});toggle.onchange=()=>setEffectActiveV177(owner,effect,toggle.checked);info.onclick=event=>{event.stopPropagation();showEffectInfoV1710(info,effect,owner)};edit.onclick=()=>openEffectEditorV1710(owner,effect);actions.append(info,edit);const sourceLink=sourceLinkV1710(owner,effect);if(sourceLink)actions.append(sourceLink);if((effect.modules||[]).some(module=>module.type==='counter-current'&&module.triggerV1710==='manual'))actions.append(el('button',{type:'button',text:'Auslösen',onclick:()=>advanceEffectsV1710(owner,'manual',{effectId:effect.id})}));if(!effect.sourceManaged)actions.append(el('button',{type:'button',class:'danger',text:'Entfernen','aria-label':effect.name+' entfernen',onclick:()=>deleteEffectV177(owner,effect)}));row.append(toggle,el('strong',{text:effect.name}),el('span',{class:'effect-summary-v1710',text:effectSummaryV1710(owner,effect)}),el('span',{text:durationSummaryV1710(effect)}),el('span',{text:sourceLabelV1710(owner,effect)}),actions);bindEffectInfoV177(row,effect,owner);return row;
}
function renderEffectsV1710(owner){
  ensureOwnerV1710(owner);const effects=syncLinkedEffectsV177(owner);ensureOwnerV1710(owner);const active=effects.filter(effect=>effectIsActiveV177(owner,effect)),inactive=effects.filter(effect=>!effectIsActiveV177(owner,effect)),box=el('div'),head=el('div',{class:'effect-head-v1710'},[el('div',{},[el('h3',{text:'Aktive Effekte'}),el('span',{class:'effect-count-v177',text:`${active.length} aktiv`})]),el('button',{type:'button',class:'primary',text:'Effekt hinzufügen',onclick:()=>openAddEffectV1710(owner)})]);
  const time=el('section',{class:'effect-time-v1710'},[el('h4',{text:'Zeit fortschreiben'}),el('div',{class:'effect-time-actions-v1710'},[['round','Nächste Kampfrunde'],['10-minutes','+10 Minuten'],['hour','+1 Stunde'],['day','+1 Tag'],['scene-end','Szene beenden']].map(([key,label])=>el('button',{type:'button',text:label,onclick:()=>advanceEffectsV1710(owner,key)})))]),locks=lockedFunctionsV1710(owner);if(locks.size)box.append(el('div',{class:'effect-locks-v1710',text:`Gesperrt: ${[...locks].map(([id,sources])=>`${Object.fromEntries(EFFECT_FUNCTIONS_V1710)[id]||id} (${sources.join(', ')})`).join(' · ')}`}));
  const list=el('div',{class:'effect-list-v1710'});if(active.length)for(const effect of active)list.append(renderEffectRowV1710(owner,effect));else list.append(el('p',{class:'effect-empty-v177',text:'Keine aktiven Effekte.'}));box.prepend(head,time);box.append(list);if(inactive.length){const details=el('details',{class:'effect-category-v177'},[el('summary',{text:`Inaktive Effekte (${inactive.length})`}),el('div',{class:'effect-list-v1710'},inactive.map(effect=>renderEffectRowV1710(owner,effect)))]);box.append(details)}if(owner.effectLogV177?.length){const log=el('details',{class:'effect-category-v177'}),items=el('div',{class:'effect-time-log-v177'});for(const entry of owner.effectLogV177.slice(0,10))items.append(el('p',{class:'muted',text:`${new Date(entry.at).toLocaleString('de-AT')} · ${entry.event} · ${entry.changes?.length?entry.changes.map(change=>`${change.counter} ${change.before}→${change.after}`).join(', '):'keine Counteränderung'}`}));log.append(el('summary',{text:'Effektprotokoll'}),items);box.append(log)}return box;
}
renderEffectsV177=renderEffectsV1710;

const renderPrintableBeforeV1710=renderPrintableCardR15;
renderPrintableCardR15=function(card,owner,options,isCharacter){if(card.type!==EFFECT_CARD_TYPE_V177)return renderPrintableBeforeV1710(card,owner,options,isCharacter);const table=el('table',{class:'effect-print-table-v177'}),body=el('tbody');table.append(el('thead',{},[el('tr',{},['Effekt','Wirkung','Dauer','Quelle'].map(value=>el('th',{text:value})))]),body);for(const effect of activeEffectInstancesV177(owner))body.append(el('tr',{},[effect.name,effectSummaryV1710(owner,effect),durationSummaryV1710(effect),sourceLabelV1710(owner,effect)].map(value=>el('td',{text:value}))));return printStaticCardR15(card,'effects',card.title||'Aktive Effekte',table)};

const runTestsBeforeV1710=runTests;
function runTestsV1710(){
  runTestsBeforeV1710();let body=testResults.querySelector('tbody');for(const row of[...body.querySelectorAll('tr')])if(['Version 1.7.9','Schema 18'].includes(row.cells[0]?.textContent))row.remove();const tests=[],eq=(name,expected,actual)=>tests.push([name,expected,actual,expected===actual]);eq('Version 1.7.10',V1710_VERSION,APP_VERSION);eq('Schema 19',V1710_SCHEMA,SCHEMA_VERSION);
  const owner=newCharacter(),own=createCustomSkillV178(owner,{name:'Runenblick',category:'Wissen',attribute1:'IT',attribute2:'IN',use:'FO',scope:'Test'}),regular=allSkillsV178(owner).find(skill=>skill.id!==own.id);owner.skills[regular.id].level=24;owner.skills[own.id].level=1;owner.activeEffectsV177=[effectInstanceV177({name:'Segen',modules:[newModuleV1710('skill-all')]})];owner.activeEffectsV177[0].modules[0].polarityV1710='bonus';owner.activeEffectsV177[0].modules[0].amountV1710=2;owner.activeEffectsV177[0].modules[0].value=2;eq('Alle Fähigkeiten erfasst Regelfähigkeit',2,skillModifiers(owner)[regular.id]);eq('Alle Fähigkeiten erfasst eigene Fähigkeit',2,skillModifiers(owner)[own.id]);eq('Obergrenze 25',25,skillModifierResultV1710(owner,regular).effective);
  const malus=effectInstanceV177({name:'Erschöpft',modules:[moduleV177({type:'skill-category',target:regular.category,operation:'add',value:-2,polarityV1710:'malus',amountV1710:2})]}),direct=effectInstanceV177({name:'Dunkelheit',modules:[moduleV177({type:'skill',target:regular.id,operation:'add',value:-1,polarityV1710:'malus',amountV1710:1})]});owner.activeEffectsV177=[malus,direct];eq('Kategorie und Einzelwirkung addiert',-3,skillModifiers(owner)[regular.id]);owner.skills[regular.id].level=1;eq('Untergrenze 0',0,skillModifierResultV1710(owner,regular).effective);
  const other=newAuxEntry('npc','Andere Figur');other.activeEffectsV177=[];eq('Besitzer bleiben getrennt',0,skillModifiers(other)[regular.id]);const item=normalizeItemV174({name:'Ring',loadState:'carried',quantity:1,equippedQuantity:0}),itemEffect=effectInstanceV177({name:'Ringkraft',sourceType:'item',sourceId:item.instanceId,modules:[moduleV177({type:'skill-all',target:'*',operation:'add',value:2})]});owner.equipment=[item];owner.activeEffectsV177=[itemEffect];eq('Abgelegtes Item deaktiviert Effekt',0,skillModifiers(owner)[regular.id]);
  const attributeTarget=skillAttributesV1710(regular)[0];owner.activeEffectsV177=[effectInstanceV177({name:'Grundwertbezug',modules:[moduleV177({type:'skill-attribute',target:attributeTarget,operation:'add',value:2})]})];eq('Grundwertziel erfasst passende Fähigkeit',2,skillModifiers(owner)[regular.id]);const duplicateModule=moduleV177({id:'same-module',type:'skill-all',target:'*',operation:'add',value:1});owner.activeEffectsV177=[effectInstanceV177({id:'same-effect',name:'Einmalige Quelle',modules:[duplicateModule,cloneV177(duplicateModule)]})];eq('Quelle und Modul wirken nur einmal',1,skillModifiers(owner)[regular.id]);
  const regenOwner=newCharacter();regenOwner.counters.A={max:8,current:2};regenOwner.activeEffectsV177=[effectInstanceV177({name:'Schlechte Regeneration',modules:[moduleV177({type:'counter-regen',target:'A',operation:'add',value:-1})]})];eq('Counter-Regeneration wird berechnet',7,counterRegenResultV1710(regenOwner,'A',2));regenOwner.activeEffectsV177=[effectInstanceV177({name:'Regeneration gesperrt',modules:[moduleV177({type:'counter-regen',target:'A',operation:'set',value:0})]})];eq('Übernommenes Regeneration-Setzen wird berechnet',2,counterRegenResultV1710(regenOwner,'A',2));regenOwner.activeEffectsV177=[effectInstanceV177({name:'Handlungsunfähig',modules:[moduleV177({type:'flag',target:'action',operation:'block',value:0})]})];eq('Funktionssperre wird berechnet',true,functionLockedV1710(regenOwner,'action'));
  const periodic=newCharacter();periodic.counters.L={max:10,current:10};periodic.activeEffectsV177=[effectInstanceV177({name:'Gift',durationTypeV1710:'rounds',durationAmountV1710:12,durationRemainingV1710:12,modules:[moduleV177({type:'counter-current',target:'L',operation:'add',value:-1,triggerV1710:'3-rounds'})]})];advanceEffectsV1710(periodic,'round',{confirm:false,persist:false});advanceEffectsV1710(periodic,'round',{confirm:false,persist:false});eq('Dreirundeneffekt nicht zu früh',10,periodic.counters.L.current);advanceEffectsV1710(periodic,'round',{confirm:false,persist:false});eq('Dreirundeneffekt genau einmal',9,periodic.counters.L.current);
  const restOwner=newCharacter();restOwner.counters.A={max:8,current:2};restOwner.rationTracker={max:2,current:2,note:''};restOwner.activeEffectsV177=[effectInstanceV177({name:'Rastgift',modules:[moduleV177({type:'counter-current',target:'A',operation:'add',value:-1,triggerV1710:'rest'})]}),effectInstanceV177({name:'Lagergift',modules:[moduleV177({type:'counter-current',target:'A',operation:'add',value:-2,triggerV1710:'camp-rest'})]})];refillOwnerV1710(restOwner,false,{confirm:false,persist:false,notify:false,render:false});eq('Rast löst nur Rasttrigger',7,restOwner.counters.A.current);refillOwnerV1710.busy=false;restOwner.counters.A.current=2;refillOwnerV1710(restOwner,true,{confirm:false,persist:false,notify:false,render:false});eq('Lagerrast löst nur Lagertrigger',6,restOwner.counters.A.current);
  const migrated={appVersion:'1.7.9',schemaVersion:18,characters:[newCharacter()],migrationLog:[]},migrationOwner=migrated.characters[0];migrationOwner.activeEffectsV177=[{id:'legacy',name:'Alt',active:true,modules:[{id:'m1',type:'difficulty',target:'sichtabhängige Proben',operation:'difficulty',value:2,interval:'hour',scope:'sichtabhängige Proben +2 Erschwernis'}],durationUnit:'hours',durationValue:3,remaining:2,stacking:'highest'}];delete migrated.v1710EffectsDone;ensureStateV1710(migrated,true);const migratedEffect=migrationOwner.activeEffectsV177[0],snapshot=JSON.stringify(migrated);ensureStateV1710(migrated,true);eq('Migration erhält IDs und Stapeldaten','legacy|highest',`${migratedEffect.id}|${migratedEffect.stacking}`);eq('Situativer Alttext bleibt beschreibend','rule',migratedEffect.modules[0].type);eq('Migration ist idempotent',snapshot,JSON.stringify(migrated));
  for(const[name,expected,actual,ok]of tests)body.append(el('tr',{},[name,expected,actual,ok?'Bestanden':'Fehler'].map(value=>el('td',{text:String(value)}))));const failures=[...body.querySelectorAll('tr')].filter(row=>row.cells[row.cells.length-1]?.textContent==='Fehler');testsDialog.showModal();return!failures.length;
}
runTests=runTestsV1710;testsBtn.onclick=runTestsV1710;

state.appVersion=V1710_VERSION;state.schemaVersion=V1710_SCHEMA;state.rulesVersion=V1710_RULES;save();renderAll();
Object.assign(window.Eberos,{version:V1710_VERSION,schemaVersion:V1710_SCHEMA,rulesVersion:V1710_RULES,runTests:runTestsV1710,ensureStateV1710,ensureOwnerV1710,skillModifiers,skillModifierResultV1710,skillEffectEntriesV1710,advanceEffects:advanceEffectsV1710,refillOwner:refillOwnerV1710,lockedFunctions:lockedFunctionsV1710,functionLocked:functionLockedV1710,renderEffects:renderEffectsV1710,openEffectEditor:openEffectEditorV1710,openAddEffect:openAddEffectV1710,module:newModuleV1710,effect:effectInstanceV177});
