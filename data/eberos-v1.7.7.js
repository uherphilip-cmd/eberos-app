'use strict';

/* Eberos v1.7.7: globale Suche und modulare aktive Effekte. */
const EFFECT_DB_V177=window.EBEROS_EFFECT_DB||{meta:{},definitions:[]};
const EFFECT_DEFINITIONS_V177=Array.isArray(EFFECT_DB_V177.definitions)?EFFECT_DB_V177.definitions:[];
const EFFECT_BY_ID_V177=new Map(EFFECT_DEFINITIONS_V177.map(definition=>[definition.id,definition]));
const EFFECT_CARD_TYPE_V177='effects';
const EFFECT_SOURCE_LABELS_V177={catalog:'Katalog',custom:'Eigener Effekt',disadvantage:'Nachteil',item:'Item',magic:'Magie',other:'Sonstige Quelle'};
const EFFECT_INTERVAL_LABELS_V177={manual:'Manuell',round:'Pro Runde','3-rounds':'Alle 3 Runden','10-minutes':'Alle 10 Minuten',hour:'Pro Stunde','6-hours':'Alle 6 Stunden',day:'Pro Tag',rest:'Pro Rast'};
const EFFECT_DURATION_LABELS_V177={source:'Dauer der Quelle',permanent:'Dauerhaft',rounds:'Runden',minutes:'Minuten',hours:'Stunden',days:'Tage',scene:'Bis Szenenende',manual:'Manuell beenden'};
const cloneV177=value=>value===undefined?undefined:structuredClone(value);
const nowV177=()=>new Date().toISOString();
const normalizeSearchV177=value=>String(value||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/ß/g,'ss').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();

CARD_TYPES[EFFECT_CARD_TYPE_V177]='Aktive Effekte';
UNIVERSAL_CARD_TYPES_V173.add(EFFECT_CARD_TYPE_V177);

const effectStyleV177=el('style',{text:`
.global-search-v177{position:relative;flex:1 1 18rem;max-width:34rem;min-width:14rem}.global-search-box-v177{display:grid;grid-template-columns:1fr auto;gap:.3rem}.global-search-box-v177 input{width:100%;min-height:40px}.global-search-results-v177{position:absolute;z-index:1200;top:calc(100% + .3rem);left:0;right:0;max-height:min(65vh,34rem);overflow:auto;border:1px solid var(--border);border-radius:10px;background:var(--panel-bg);box-shadow:0 12px 34px #0005;padding:.25rem}.global-search-result-v177{display:grid;width:100%;gap:.08rem;text-align:left;padding:.55rem .65rem;border:0;border-radius:7px;background:transparent;color:var(--ink)}.global-search-result-v177[aria-selected=true]{background:var(--panel-alt)}.global-search-result-v177 small{color:var(--muted)}
.effect-head-v177,.effect-row-v177,.effect-source-links-v177,.effect-event-actions-v177{display:flex;align-items:center;gap:.45rem;flex-wrap:wrap}.effect-head-v177{justify-content:space-between;margin-bottom:.7rem}.effect-head-v177 h3{margin:0}.effect-count-v177{display:inline-flex;padding:.2rem .55rem;border:1px solid var(--accent-2);border-radius:999px;font-weight:800}.effect-list-v177{display:grid;gap:.42rem}.effect-row-v177{padding:.5rem .6rem;border:1px solid var(--border);border-radius:9px;background:var(--panel-alt)}.effect-row-v177.inactive{opacity:.68}.effect-row-v177>strong{flex:1 1 12rem}.effect-row-v177 .effect-summary-v177{flex:2 1 20rem;color:var(--muted);font-size:.86rem}.effect-toggle-v177{min-width:42px;min-height:32px}.effect-source-v177{font-size:.8rem}.effect-empty-v177{padding:.7rem;border:1px dashed var(--border);border-radius:9px;color:var(--muted)}
.effect-picker-v177{margin-top:.8rem;border-top:1px solid var(--border);padding-top:.7rem}.effect-picker-controls-v177{display:grid;grid-template-columns:minmax(12rem,1fr) minmax(10rem,.55fr);gap:.45rem}.effect-category-v177{margin-top:.45rem;border:1px solid var(--border);border-radius:9px;overflow:hidden}.effect-category-v177>summary{padding:.55rem .65rem;background:var(--panel-alt);font-weight:800;cursor:pointer}.effect-catalog-list-v177{display:grid;gap:.35rem;padding:.45rem}.effect-catalog-row-v177{display:grid;grid-template-columns:minmax(10rem,.7fr) minmax(15rem,1.5fr) auto;gap:.5rem;align-items:center;padding:.48rem;border:1px solid var(--border);border-radius:8px;background:var(--panel-bg)}.effect-catalog-row-v177 p{margin:0;color:var(--muted);font-size:.84rem}.effect-catalog-actions-v177{display:flex;gap:.3rem;flex-wrap:wrap}
.effect-tooltip-v177{position:fixed;z-index:2200;width:min(28rem,calc(100vw - 24px));padding:.7rem;border:2px solid var(--accent-2);border-radius:10px;background:var(--panel-bg);color:var(--ink);box-shadow:0 12px 36px #0006;overflow:visible}.effect-tooltip-v177 h3{margin:.05rem 0 .35rem}.effect-tooltip-v177 p{margin:.25rem 0}.effect-tooltip-v177 ul{margin:.3rem 0;padding-left:1.2rem}.effect-tooltip-v177[hidden]{display:none}
.effect-dialog-v177{width:min(66rem,calc(100vw - 24px));max-height:calc(100vh - 24px)}.effect-dialog-v177::backdrop{background:#0008}.effect-dialog-body-v177{display:grid;gap:.75rem}.effect-module-list-v177{display:grid;gap:.45rem}.effect-module-row-v177{display:grid;grid-template-columns:minmax(9rem,.8fr) minmax(10rem,1fr) minmax(8rem,.8fr) 7rem minmax(8rem,.8fr) auto;gap:.4rem;align-items:end;padding:.5rem;border:1px solid var(--border);border-radius:8px;background:var(--panel-alt)}.effect-module-row-v177 label{display:grid;gap:.2rem;font-size:.78rem}.effect-module-row-v177 input,.effect-module-row-v177 select{min-width:0;width:100%}.effect-rule-v177{white-space:pre-wrap}.effect-time-log-v177{max-height:10rem;overflow:auto}.effect-linked-v177{margin-top:.45rem;padding-top:.4rem;border-top:1px dashed var(--border)}
.effect-blocked-dot-v177{background:repeating-linear-gradient(135deg,var(--panel-alt) 0 4px,var(--danger) 4px 6px)!important;border-color:var(--danger)!important}.effect-value-note-v177{font-size:.8rem}.effect-print-table-v177{width:100%;border-collapse:collapse}.effect-print-table-v177 th,.effect-print-table-v177 td{padding:.3rem;border-bottom:1px solid #999;text-align:left;vertical-align:top}
@media(max-width:900px){.global-search-v177{order:3;flex-basis:100%;max-width:none}.effect-catalog-row-v177{grid-template-columns:1fr}.effect-module-row-v177{grid-template-columns:1fr 1fr}.effect-module-row-v177 .danger{grid-column:2}}
@media(max-width:520px){.effect-picker-controls-v177,.effect-module-row-v177{grid-template-columns:1fr}.effect-module-row-v177 .danger{grid-column:auto}.effect-row-v177>strong,.effect-row-v177 .effect-summary-v177{flex-basis:100%}.effect-dialog-v177{width:calc(100vw - 12px);max-height:calc(100vh - 12px)}.global-search-v177{min-width:0}.global-search-results-v177{position:fixed;left:6px;right:6px;top:auto;max-height:55vh}}
@media print{.global-search-v177,.effect-picker-v177,.effect-event-actions-v177,.effect-row-v177 button,.effect-row-v177 input,.effect-time-log-v177{display:none!important}.effect-row-v177{display:grid;grid-template-columns:1fr 2fr;border:0;border-bottom:1px solid #999}.effect-row-v177.inactive{display:none!important}}
`});
document.head.append(effectStyleV177);

function moduleV177(raw={}){
  return{id:raw.id||uid(),type:raw.type||'attribute',target:raw.target||'ST',operation:raw.operation||'add',value:Number.isFinite(+raw.value)?+raw.value:0,display:raw.display||'',interval:raw.interval||'manual',scope:raw.scope||'',progress:Math.max(0,+raw.progress||0)};
}

function effectInstanceV177(raw={}){
  const definition=EFFECT_BY_ID_V177.get(raw.definitionId);
  return{
    id:raw.id||uid(),definitionId:raw.definitionId||'',name:raw.name||definition?.name||'Eigener Effekt',
    description:raw.description??definition?.mechanics??'',category:raw.category||definition?.category||'Eigene Effekte',
    sourceType:raw.sourceType||'custom',sourceId:raw.sourceId||'',sourceLabel:raw.sourceLabel||'',active:raw.active!==false,
    modules:(Array.isArray(raw.modules)?raw.modules:definition?.modules||[]).map(moduleV177),durationUnit:raw.durationUnit||definition?.duration||'manual',
    durationValue:Math.max(0,+raw.durationValue||0),remaining:raw.remaining===null||raw.remaining===undefined?null:Math.max(0,+raw.remaining||0),
    stacking:raw.stacking||definition?.stacking||'highest',notes:raw.notes||'',sourceManaged:raw.sourceManaged===true,
    createdAt:raw.createdAt||nowV177(),updatedAt:raw.updatedAt||nowV177()
  };
}

function ensureEffectCardV177(owner){
  if(!owner||owner.type==='possession'||!Array.isArray(owner.layout))return;
  if(owner.layout.some(card=>card.type===EFFECT_CARD_TYPE_V177))return;
  const anchor=owner.layout.find(card=>card.type==='counters'),order=anchor?(+anchor.order||0)+.1:owner.layout.length;
  owner.layout.push(cardObject(EFFECT_CARD_TYPE_V177,order,12));
}

function ensureOwnerV177(owner){
  if(!owner||typeof owner!=='object')return owner;
  owner.activeEffectsV177=Array.isArray(owner.activeEffectsV177)?owner.activeEffectsV177.map(effect=>{
    const normalized=effectInstanceV177(effect);
    if(effect&&typeof effect==='object'){Object.assign(effect,normalized);return effect}
    return normalized;
  }):[];
  owner.effectLogV177=Array.isArray(owner.effectLogV177)?owner.effectLogV177:[];
  for(const disadvantage of owner.disadvantages||[]){disadvantage.id=disadvantage.id||uid();if(disadvantage.effectModulesV177&&!Array.isArray(disadvantage.effectModulesV177))disadvantage.effectModulesV177=[]}
  for(const item of owner.equipment||[]){item.instanceId=item.instanceId||item.id||uid();item.effectIdsV177=Array.isArray(item.effectIdsV177)?item.effectIdsV177:[]}
  ensureEffectCardV177(owner);return owner;
}

function legacyDisadvantageModulesV177(disadvantage){
  const modules=[];
  for(const[target,value]of Object.entries(disadvantage.effects?.attributes||{}))modules.push(moduleV177({id:`legacy-attr-${target}`,type:'attribute',target,operation:'add',value}));
  for(const[target,value]of Object.entries(disadvantage.effects?.counters||{}))modules.push(moduleV177({id:`legacy-counter-${target}`,type:'counter-max',target,operation:'add',value}));
  const skills=disadvantage.effects?.skillIds&&Object.keys(disadvantage.effects.skillIds).length?disadvantage.effects.skillIds:disadvantage.effects?.skills||{};
  for(const[target,value]of Object.entries(skills)){const id=SKILLS.find(skill=>skill.id===target||skill.name===target)?.id||target;modules.push(moduleV177({id:`legacy-skill-${id}`,type:'skill',target:id,operation:'add',value}))}
  for(const[index,entry]of(disadvantage.effects?.situational||[]).entries())modules.push(moduleV177({id:`legacy-situation-${index}`,type:'difficulty',target:entry.trigger||'Situative Probe',operation:'difficulty',value:+entry.difficulty||0,scope:entry.trigger||''}));
  const advanced=(disadvantage.effectModulesV177||[]).map(moduleV177).filter(module=>!['attribute','counter-max','skill','difficulty'].includes(module.type));
  return[...modules,...advanced];
}

function syncLinkedEffectsV177(owner){
  ensureOwnerV177(owner);const effects=owner.activeEffectsV177;
  const liveDisadvantages=new Set(),liveItems=new Set((owner.equipment||[]).map(item=>item.instanceId||item.id));
  for(const disadvantage of owner.disadvantages||[]){
    liveDisadvantages.add(disadvantage.id);let effect=effects.find(entry=>entry.sourceType==='disadvantage'&&entry.sourceId===disadvantage.id);
    if(!effect){effect=effectInstanceV177({name:disadvantage.name||'Nachteil',description:disadvantage.notes||disadvantage.description||'',category:'Nachteile',sourceType:'disadvantage',sourceId:disadvantage.id,sourceLabel:disadvantage.name||'Nachteil',active:disadvantage.active!==false,modules:legacyDisadvantageModulesV177(disadvantage),sourceManaged:true});effects.push(effect)}
    effect.name=disadvantage.name||effect.name;effect.sourceLabel=disadvantage.name||'Nachteil';effect.active=disadvantage.active!==false;effect.modules=legacyDisadvantageModulesV177(disadvantage);effect.sourceManaged=true;
  }
  owner.activeEffectsV177=effects.filter(effect=>!(effect.sourceType==='disadvantage'&&!liveDisadvantages.has(effect.sourceId))&&!(effect.sourceType==='item'&&!liveItems.has(effect.sourceId)));
  for(const item of owner.equipment||[])item.effectIdsV177=(item.effectIdsV177||[]).filter(id=>owner.activeEffectsV177.some(effect=>effect.id===id&&effect.sourceType==='item'&&effect.sourceId===(item.instanceId||item.id)));
  return owner.activeEffectsV177;
}

function ensureStateV177(data,log=true){
  const first=!data.v177EffectsDone;
  for(const character of data.characters||[]){ensureOwnerV177(character);syncLinkedEffectsV177(character);for(const owner of character.auxiliaryTabs||[])if(owner.type!=='possession'){ensureOwnerV177(owner);syncLinkedEffectsV177(owner)}}
  data.appVersion='1.7.7';data.schemaVersion=15;data.v177EffectsDone=true;
  if(first&&log){data.migrationLog=Array.isArray(data.migrationLog)?data.migrationLog:[];data.migrationLog.push({from:14,to:15,at:nowV177(),changes:['Globale Suche ergänzt','Aktive Effekte und Effektmodule ergänzt','Nachteile und Item-Effekte verknüpft','Effektkatalog mit 227 Zeilen integriert']})}
  return data;
}

const migrateStateBeforeV177=migrateState;
migrateState=function(data){return ensureStateV177(migrateStateBeforeV177(data),true)};
if(!state.v177EffectsDone){try{localStorage.setItem(STORE+'.backup.v177.'+Date.now(),JSON.stringify(state))}catch{}}
state=ensureStateV177(state,true);
const newCharacterBeforeV177=newCharacter,newAuxEntryBeforeV177=newAuxEntry;
newCharacter=function(){return ensureOwnerV177(newCharacterBeforeV177())};
newAuxEntry=function(type,name){const owner=newAuxEntryBeforeV177(type,name);return type==='possession'?owner:ensureOwnerV177(owner)};

function itemForEffectV177(owner,effect){return(owner.equipment||[]).find(item=>(item.instanceId||item.id)===effect.sourceId)}
function disadvantageForEffectV177(owner,effect){return(owner.disadvantages||[]).find(item=>item.id===effect.sourceId)}
function effectIsActiveV177(owner,effect){
  if(!effect||effect.active===false)return false;
  if(effect.sourceType==='disadvantage')return disadvantageForEffectV177(owner,effect)?.active!==false;
  if(effect.sourceType==='item'){
    const item=itemForEffectV177(owner,effect);return !!item&&item.active!==false&&item.loadState==='equipped'&&Math.max(0,+item.equippedQuantity||0)>0;
  }
  return true;
}
function activeEffectInstancesV177(owner){return syncLinkedEffectsV177(owner).filter(effect=>effectIsActiveV177(owner,effect))}
function activeEffectModulesV177(owner,type=null,target=null){return activeEffectInstancesV177(owner).flatMap(effect=>effect.modules.map(module=>({effect,module}))).filter(entry=>(!type||entry.module.type===type)&&(!target||entry.module.target===target))}

function applyNumericModulesV177(base,entries){
  let value=+base||0;
  for(const{module}of entries)if(module.operation==='add')value+=+module.value||0;
  for(const{module}of entries)if(module.operation==='percent')value*=1+(+module.value||0)/100;
  const sets=entries.filter(entry=>entry.module.operation==='set');if(sets.length)value=Math.min(...sets.map(entry=>+entry.module.value||0));
  return Math.round(value);
}

attributeModifiers=function(owner){
  const out=Object.fromEntries(ATTRS.map(([id])=>[id,0]));
  for(const{module}of activeEffectModulesV177(owner,'attribute'))if(module.operation==='add'&&module.target in out)out[module.target]+=+module.value||0;
  return out;
};
counterModifiers=function(owner){
  const out=Object.fromEntries(COUNTERS.map(([id])=>[id,0]));
  for(const{module}of activeEffectModulesV177(owner,'counter-max'))if(module.operation==='add'&&module.target in out)out[module.target]+=+module.value||0;
  return out;
};
skillModifiers=function(owner){
  const out=Object.fromEntries(SKILLS.map(skill=>[skill.id,0]));
  for(const{module}of activeEffectModulesV177(owner,'skill'))if(module.operation==='add'){
    const id=SKILLS.find(skill=>skill.id===module.target||skill.name===module.target)?.id;if(id)out[id]+=+module.value||0;
  }
  return out;
};

const effectiveAttributesBeforeV177=effectiveAttributes;
effectiveAttributes=function(owner){
  const values=effectiveAttributesBeforeV177(owner);
  for(const[id]of ATTRS){const special=activeEffectModulesV177(owner,'attribute',id).filter(entry=>entry.module.operation!=='add');if(special.length)values[id]=Math.max(0,Math.min(25,applyNumericModulesV177(values[id],special)))}
  return values;
};
const effectiveCountersBeforeV177=effectiveCounters;
effectiveCounters=function(owner){
  const values=effectiveCountersBeforeV177(owner);
  for(const[id]of COUNTERS){const special=activeEffectModulesV177(owner,'counter-max',id).filter(entry=>entry.module.operation!=='add');if(special.length)values[id]=Math.max(0,Math.min(25,applyNumericModulesV177(values[id],special)))}
  return values;
};
const derivedBeforeV177=derived;
derived=function(owner){
  const values=derivedBeforeV177(owner),targets={movement:'Bewegung',initiative:'Initiative',defense:'Verteidigung'};
  for(const[target,name]of Object.entries(targets)){
    const entries=activeEffectModulesV177(owner,'derived',target),row=values.find(item=>item.n===name);if(row&&entries.length){row.v=Math.max(0,applyNumericModulesV177(+row.v||0,entries));row.f+=(row.f?' · ':'')+'aktive Effekte'}
  }
  return values;
};

function blockedLifeV177(owner){
  const maximum=Math.max(0,+owner.counters?.L?.max||0),fractions=activeEffectModulesV177(owner,'counter-block','L').map(entry=>Math.max(0,+entry.module.value||0)),fraction=Math.min(.75,fractions.reduce((sum,value)=>sum+value,0));
  return{fraction,points:Math.ceil(maximum*fraction),cap:Math.max(0,maximum-Math.ceil(maximum*fraction))};
}

const setCounterCurrentBeforeV177=setCounterCurrentR8;
setCounterCurrentR8=function(owner,id,value){
  if(id!=='L')return setCounterCurrentBeforeV177(owner,id,value);
  const current=Math.max(0,+owner.counters?.L?.current||0),requested=Math.max(0,+value||0),blocked=blockedLifeV177(owner);
  return setCounterCurrentBeforeV177(owner,id,requested>current?Math.min(requested,blocked.cap):requested);
};

function effectContributorsV177(owner,type,target){
  return activeEffectModulesV177(owner,type,target).map(({effect,module})=>`${effect.name}: ${module.operation==='add'&&module.value>0?'+':''}${module.value}${module.operation==='percent'?' %':''}`).join(' · ');
}

const renderAttributesBeforeV177=renderAttributesV174;
renderAttributesV174=function(owner){
  const box=renderAttributesBeforeV177(owner),rows=[...box.querySelectorAll('.value-row')];
  rows.forEach((row,index)=>{const id=ATTRS[index]?.[0],sources=id?effectContributorsV177(owner,'attribute',id):'';row.dataset.effectTarget=id||'';if(sources){row.title=sources;row.querySelector('.notice,.muted')?.classList.add('effect-value-note-v177')}});return box;
};
const renderCountersBeforeV177=renderCountersR8;
renderCountersR8=function(owner){
  const box=renderCountersBeforeV177(owner),rows=[...box.querySelectorAll('.value-row')];
  rows.forEach((row,index)=>{const id=COUNTERS[index]?.[0],sources=id?effectContributorsV177(owner,'counter-max',id):'';row.dataset.effectTarget=id||'';if(sources)row.title=sources;if(id==='L'){const blocked=blockedLifeV177(owner);if(blocked.points){row.append(el('span',{class:'notice effect-value-note-v177',text:`${blocked.points} L für Regeneration blockiert · heilbar bis ${blocked.cap}`}));[...row.querySelectorAll('.counter-dots .dot')].forEach(button=>{const value=+button.textContent||0;if(value>blocked.cap)button.classList.add('effect-blocked-dot-v177')})}}});return box;
};
renderCountersR5=renderCountersR8;

function effectSourceLabelV177(owner,effect){
  if(effect.sourceType==='disadvantage')return disadvantageForEffectV177(owner,effect)?.name||effect.sourceLabel||'Nachteil';
  if(effect.sourceType==='item')return itemForEffectV177(owner,effect)?.name||effect.sourceLabel||'Item';
  return effect.sourceLabel||EFFECT_SOURCE_LABELS_V177[effect.sourceType]||'Quelle';
}
function moduleLabelV177(module){
  const operation={set:'=',percent:'%',block:'blockiert',difficulty:'Erschwernis',bonus:'Bonus'}[module.operation]||module.operation;
  if(module.type==='counter-block')return `${module.display||Math.round(module.value*100)+' %'} L blockiert`;
  if(module.operation==='add')return `${module.target||module.type} ${module.value>0?'+':''}${module.value}`;
  if(module.operation==='percent')return `${module.target} ${module.value>0?'+':''}${module.value} %`;
  if(['difficulty','bonus'].includes(module.operation))return `${module.target}: ${module.value>0?'+':''}${module.value} ${operation}`;
  return `${module.target||module.type} ${operation}${module.operation==='add'&&module.value>0?'+':''}${module.value}`;
}
function effectSummaryV177(effect){const parts=effect.modules.filter(module=>module.type!=='rule').slice(0,4).map(moduleLabelV177);return parts.length?parts.join(' · '):effect.description||'Keine strukturierte Zahlenwirkung'}

let effectTooltipV177=null,effectTooltipTimerV177=0;
function tooltipNodeV177(){if(!effectTooltipV177){effectTooltipV177=el('aside',{class:'effect-tooltip-v177',role:'tooltip',hidden:true});document.body.append(effectTooltipV177)}return effectTooltipV177}
function hideEffectInfoV177(){clearTimeout(effectTooltipTimerV177);if(effectTooltipV177)effectTooltipV177.hidden=true}
function showEffectInfoV177(anchor,effect,owner){
  const box=tooltipNodeV177(),modules=effect.modules.filter(module=>module.type!=='rule').slice(0,6),description=(effect.description||'').length>430?(effect.description.slice(0,427)+'…'):effect.description;
  box.replaceChildren(el('h3',{text:effect.name}),el('p',{class:'muted',text:`${effect.category} · Quelle: ${effectSourceLabelV177(owner,effect)}`}),el('p',{text:description||'Keine Beschreibung.'}));
  if(modules.length)box.append(el('ul',{},modules.map(module=>el('li',{text:moduleLabelV177(module)}))));
  if(effect.modules.length>modules.length)box.append(el('p',{class:'muted',text:`Weitere ${effect.modules.length-modules.length} Module in den Details.`}));
  box.hidden=false;const rect=anchor.getBoundingClientRect(),margin=12,width=box.offsetWidth,height=box.offsetHeight,left=Math.max(margin,Math.min(innerWidth-width-margin,rect.right+8+width<innerWidth?rect.right+8:rect.left-width-8)),top=Math.max(margin,Math.min(innerHeight-height-margin,rect.bottom+8+height<innerHeight?rect.bottom+8:rect.top-height-8));box.style.left=left+'px';box.style.top=top+'px';
}
function bindEffectInfoV177(node,effect,owner){
  node.addEventListener('mouseenter',()=>{clearTimeout(effectTooltipTimerV177);effectTooltipTimerV177=setTimeout(()=>showEffectInfoV177(node,effect,owner),350)});node.addEventListener('mouseleave',hideEffectInfoV177);
  node.addEventListener('focusin',event=>{if(!event.target.closest('input,select,textarea'))showEffectInfoV177(node,effect,owner)});node.addEventListener('focusout',hideEffectInfoV177);
}

function persistEffectsV177(owner,rerender=true){owner.updatedAt=nowV177();ch().updatedAt=nowV177();save();renderStatus();renderCosts();if(rerender){const y=scrollY;renderCards();requestAnimationFrame(()=>scrollTo({top:y}))}}

function setEffectActiveV177(owner,effect,active){
  effect.active=!!active;effect.updatedAt=nowV177();
  if(effect.sourceType==='disadvantage'){const disadvantage=disadvantageForEffectV177(owner,effect);if(disadvantage)disadvantage.active=!!active}
  persistEffectsV177(owner,true);
}

function effectFromDefinitionV177(owner,definition,source={type:'catalog',id:'',label:''}){
  ensureOwnerV177(owner);const existing=owner.activeEffectsV177.find(effect=>effect.definitionId===definition.id&&effect.sourceType===source.type&&effect.sourceId===(source.id||''));
  if(existing){existing.active=true;persistEffectsV177(owner,true);return existing}
  const effect=effectInstanceV177({definitionId:definition.id,name:definition.name,description:definition.mechanics,category:definition.category,sourceType:source.type||'catalog',sourceId:source.id||'',sourceLabel:source.label||'',active:true,modules:definition.modules,durationUnit:definition.duration,stacking:definition.stacking});
  owner.activeEffectsV177.push(effect);
  if(effect.sourceType==='item'){const item=itemForEffectV177(owner,effect);if(item&&!item.effectIdsV177.includes(effect.id))item.effectIdsV177.push(effect.id)}
  persistEffectsV177(owner,true);return effect;
}

function customEffectV177(owner,source={type:'custom',id:'',label:''}){
  const effect=effectInstanceV177({name:'Eigener Effekt',description:'',category:'Eigene Effekte',sourceType:source.type||'custom',sourceId:source.id||'',sourceLabel:source.label||'',active:true,modules:[]});owner.activeEffectsV177.push(effect);
  if(effect.sourceType==='item'){const item=itemForEffectV177(owner,effect);if(item&&!item.effectIdsV177.includes(effect.id))item.effectIdsV177.push(effect.id)}
  return effect;
}

function syncEffectToDisadvantageV177(owner,effect){
  const disadvantage=disadvantageForEffectV177(owner,effect);if(!disadvantage)return;
  disadvantage.active=effect.active!==false;disadvantage.effectModulesV177=cloneV177(effect.modules);
  disadvantage.effects=disadvantage.effects||{attributes:{},counters:{},skills:{},skillIds:{},situational:[]};
  disadvantage.effects.attributes={};disadvantage.effects.counters={};disadvantage.effects.skills={};disadvantage.effects.skillIds={};disadvantage.effects.situational=[];
  for(const module of effect.modules){
    if(module.type==='attribute'&&module.operation==='add')disadvantage.effects.attributes[module.target]=(disadvantage.effects.attributes[module.target]||0)+module.value;
    if(module.type==='counter-max'&&module.operation==='add')disadvantage.effects.counters[module.target]=(disadvantage.effects.counters[module.target]||0)+module.value;
    if(module.type==='skill'&&module.operation==='add')disadvantage.effects.skillIds[module.target]=(disadvantage.effects.skillIds[module.target]||0)+module.value;
    if(module.type==='difficulty')disadvantage.effects.situational.push({trigger:module.target,difficulty:module.value});
  }
}

function targetOptionsV177(type){
  if(type==='attribute')return ATTRS.map(([value,name])=>[value,`${name} (${value})`]);
  if(type==='skill')return SKILLS.map(skill=>[skill.id,skill.name]);
  if(['counter-max','counter-current','counter-regen'].includes(type))return COUNTERS.map(([value,name])=>[value,`${name} (${value})`]);
  if(type==='counter-block')return[['L','Leben (L)']];
  if(type==='derived')return[['movement','Bewegung'],['initiative','Initiative'],['defense','Verteidigung']];
  if(type==='flag')return[['action','Aktion'],['reaction','Reaktion'],['concentration','Konzentration'],['sight','Sicht'],['hearing','Hören']];
  return[['Situative Probe','Situative Probe']];
}
const MODULE_TYPES_V177=[['attribute','Grundwert'],['skill','Fähigkeit / Skill'],['counter-max','Counter-Maximum'],['counter-current','Counter aktuell / Intervall'],['counter-regen','Counter-Regeneration'],['counter-block','Leben blockieren'],['derived','Abgeleiteter Wert'],['flag','Funktion sperren'],['difficulty','Probenmodifikator']];
const OPERATIONS_V177=[['add','Addieren / abziehen'],['set','Auf Wert setzen'],['percent','Prozentual verändern'],['block','Blockieren'],['difficulty','Erschwernis'],['bonus','Bonus']];

let effectEditorV177=null;
function editorDialogV177(){
  if(effectEditorV177)return effectEditorV177;
  effectEditorV177=el('dialog',{class:'effect-dialog-v177'});document.body.append(effectEditorV177);effectEditorV177.addEventListener('close',hideEffectInfoV177);return effectEditorV177;
}
function fieldV177(label,control){return el('label',{class:'field'},[el('span',{text:label}),control])}
function moduleEditorRowV177(module,list,draw){
  const row=el('div',{class:'effect-module-row-v177'}),type=el('select',{'aria-label':'Modultyp'}),targetHost=el('span'),operation=el('select',{'aria-label':'Operation'}),value=el('input',{type:'number',step:.01,value:module.value,'aria-label':'Wert'}),interval=el('select',{'aria-label':'Intervall'}),remove=el('button',{type:'button',class:'danger',text:'Entfernen'});
  for(const[valueKey,label]of MODULE_TYPES_V177)type.append(el('option',{value:valueKey,text:label}));for(const[valueKey,label]of OPERATIONS_V177)operation.append(el('option',{value:valueKey,text:label}));for(const[valueKey,label]of Object.entries(EFFECT_INTERVAL_LABELS_V177))interval.append(el('option',{value:valueKey,text:label}));
  type.value=module.type;operation.value=module.operation;interval.value=module.interval||'manual';
  const drawTarget=()=>{const options=targetOptionsV177(type.value),select=el('select',{'aria-label':'Zielwert'});for(const[valueKey,label]of options)select.append(el('option',{value:valueKey,text:label}));if(options.some(([key])=>key===module.target))select.value=module.target;else module.target=select.value;select.onchange=()=>module.target=select.value;targetHost.replaceChildren(fieldV177('Ziel',select))};drawTarget();
  type.onchange=()=>{module.type=type.value;module.target=targetOptionsV177(module.type)[0]?.[0]||'';if(module.type==='counter-block'){module.operation='block';operation.value='block';module.value=.25;value.value=.25}drawTarget()};operation.onchange=()=>module.operation=operation.value;value.oninput=()=>module.value=+value.value||0;interval.onchange=()=>module.interval=interval.value;remove.onclick=()=>{const index=list.findIndex(entry=>entry.id===module.id);if(index>=0)list.splice(index,1);draw()};
  row.append(fieldV177('Modul',type),targetHost,fieldV177('Operation',operation),fieldV177('Wert',value),fieldV177('Intervall',interval),remove);return row;
}

function openEffectEditorV177(owner,effect){
  hideEffectInfoV177();const dialog=editorDialogV177(),draft=effectInstanceV177(cloneV177(effect));
  const draw=()=>{
    const name=el('input',{value:draft.name,'aria-label':'Effektname'}),description=el('textarea',{'aria-label':'Effektbeschreibung'});description.value=draft.description;const category=el('input',{value:draft.category,'aria-label':'Kategorie'}),active=el('input',{type:'checkbox',checked:draft.active!==false,'aria-label':'Effekt aktiv'}),durationUnit=el('select',{'aria-label':'Dauer'}),durationValue=el('input',{type:'number',min:0,step:1,value:draft.durationValue||0,'aria-label':'Dauerwert'}),stacking=el('select',{'aria-label':'Stapelregel'});
    for(const[key,label]of Object.entries(EFFECT_DURATION_LABELS_V177))durationUnit.append(el('option',{value:key,text:label}));durationUnit.value=draft.durationUnit;for(const[key,label]of[['highest','Höchster Wert zählt'],['add','Werte addieren'],['none','Nicht stapelbar'],['defined-by-rule','Laut Regeltext']])stacking.append(el('option',{value:key,text:label}));stacking.value=draft.stacking;
    name.oninput=()=>draft.name=name.value;description.oninput=()=>draft.description=description.value;category.oninput=()=>draft.category=category.value;active.onchange=()=>draft.active=active.checked;durationUnit.onchange=()=>draft.durationUnit=durationUnit.value;durationValue.oninput=()=>{draft.durationValue=Math.max(0,+durationValue.value||0);draft.remaining=draft.durationValue||null};stacking.onchange=()=>draft.stacking=stacking.value;
    const modules=el('div',{class:'effect-module-list-v177'});for(const module of draft.modules)modules.append(moduleEditorRowV177(module,draft.modules,draw));
    const addModule=el('button',{type:'button',text:'+ Wirkungsmodul',onclick:()=>{draft.modules.push(moduleV177({type:'attribute',target:'ST',operation:'add',value:-1}));draw()}}),duplicate=el('button',{type:'button',text:'Duplizieren',onclick:()=>{const copy=effectInstanceV177({...cloneV177(draft),id:uid(),definitionId:'',sourceType:'custom',sourceId:'',sourceLabel:'',name:draft.name+' – Kopie',sourceManaged:false,createdAt:nowV177(),updatedAt:nowV177()});owner.activeEffectsV177.push(copy);persistEffectsV177(owner,true);dialog.close()}}),cancel=el('button',{type:'button',text:'Abbrechen',onclick:()=>dialog.close()}),saveButton=el('button',{type:'button',class:'primary',text:'Speichern',onclick:()=>{
      Object.assign(effect,draft,{updatedAt:nowV177()});if(effect.sourceType==='disadvantage')syncEffectToDisadvantageV177(owner,effect);persistEffectsV177(owner,true);dialog.close();
    }});
    const body=el('div',{class:'effect-dialog-body-v177'},[
      el('div',{class:'dialog-head'},[el('h2',{text:'Effekt bearbeiten'}),el('button',{type:'button',text:'✕','aria-label':'Schließen',onclick:()=>dialog.close()})]),
      el('div',{class:'grid three'},[fieldV177('Name',name),fieldV177('Kategorie',category),fieldV177('Aktiv',active),fieldV177('Dauerart',durationUnit),fieldV177('Dauerwert',durationValue),fieldV177('Stapelung',stacking)]),
      fieldV177('Beschreibung und Regelwirkung',description),el('p',{class:'muted',text:`Quelle: ${effectSourceLabelV177(owner,effect)}`}),el('h3',{text:'Wirkungsmodule'}),modules,addModule,
      el('div',{class:'toolbar'},[saveButton,duplicate,cancel])
    ]);dialog.replaceChildren(body);
  };draw();dialog.showModal();
}

function deleteEffectV177(owner,effect){
  if(effect.sourceType==='disadvantage')return alert('Dieser Effekt ist mit einem Nachteil verbunden. Deaktiviere oder entferne den Nachteil im Nachteil-Fenster.');
  if(!confirm(`Effekt „${effect.name}“ entfernen?`))return;
  owner.activeEffectsV177=owner.activeEffectsV177.filter(entry=>entry.id!==effect.id);if(effect.sourceType==='item'){const item=itemForEffectV177(owner,effect);if(item)item.effectIdsV177=(item.effectIdsV177||[]).filter(id=>id!==effect.id)}persistEffectsV177(owner,true);
}

function navigateToV177(target){
  const character=ch(),owner=target.ownerId===character.id?character:(character.auxiliaryTabs||[]).find(entry=>entry.id===target.ownerId)||character;
  if(owner===character){app.className='app';document.querySelectorAll('#mainTabs button').forEach(button=>button.classList.toggle('active',button.dataset.view==='build'))}else openAux(owner.id);
  const card=owner.layout?.find(entry=>entry.id===target.cardId||entry.type===target.cardType);if(card?.collapsed){card.collapsed=false;save()}renderCards();
  requestAnimationFrame(()=>{
    let node=card?document.querySelector(`article.card[data-id="${CSS.escape(card.id)}"]`):null;
    if(target.effectId)node=document.querySelector(`[data-effect-id="${CSS.escape(target.effectId)}"]`)||node;
    if(target.itemId)node=document.querySelector(`[data-item-id="${CSS.escape(target.itemId)}"]`)||node;
    if(target.disadvantageId)node=document.querySelector(`[data-disadvantage-id="${CSS.escape(target.disadvantageId)}"]`)||node;
    if(target.selector)node=document.querySelector(target.selector)||node;
    node?.scrollIntoView({behavior:'smooth',block:'center'});
  });
}

function sourceButtonV177(owner,effect){
  const label=effectSourceLabelV177(owner,effect),button=el('button',{type:'button',class:'effect-source-v177',text:label,title:'Quelle öffnen'});
  if(effect.sourceType==='disadvantage')button.onclick=()=>navigateToV177({ownerId:owner.id,cardType:'modules',disadvantageId:effect.sourceId});
  else if(effect.sourceType==='item')button.onclick=()=>navigateToV177({ownerId:owner.id,cardType:'equipment',itemId:effect.sourceId});
  else button.disabled=true;return button;
}

function renderEffectRowV177(owner,effect){
  const row=el('div',{class:'effect-row-v177 '+(effectIsActiveV177(owner,effect)?'':'inactive'),tabindex:0,'data-effect-id':effect.id}),toggle=el('input',{class:'effect-toggle-v177',type:'checkbox',checked:effect.active!==false,'aria-label':effect.name+' aktiv'}),info=el('button',{type:'button',text:'Info'}),edit=el('button',{type:'button',text:'Bearbeiten'}),remove=el('button',{type:'button',class:'danger',text:'×','aria-label':effect.name+' entfernen'});
  toggle.onchange=()=>setEffectActiveV177(owner,effect,toggle.checked);info.onclick=event=>{event.stopPropagation();showEffectInfoV177(info,effect,owner)};edit.onclick=()=>openEffectEditorV177(owner,effect);remove.onclick=()=>deleteEffectV177(owner,effect);
  row.append(toggle,el('strong',{text:effect.name}),el('span',{class:'effect-summary-v177',text:effectSummaryV177(effect)}),sourceButtonV177(owner,effect),info,edit,remove);bindEffectInfoV177(row,effect,owner);return row;
}

function catalogResultV177(owner,definition,source={type:'catalog',id:'',label:''}){
  const preview=effectInstanceV177({definitionId:definition.id,sourceType:source.type,sourceId:source.id,sourceLabel:source.label}),row=el('article',{class:'effect-catalog-row-v177',tabindex:0});
  const info=el('button',{type:'button',text:'Info'}),add=el('button',{type:'button',class:'primary',text:'Hinzufügen'});info.onclick=event=>{event.stopPropagation();showEffectInfoV177(info,preview,owner)};add.onclick=()=>effectFromDefinitionV177(owner,definition,source);
  row.append(el('strong',{text:definition.name}),el('p',{text:definition.mechanics}),el('div',{class:'effect-catalog-actions-v177'},[info,add]));bindEffectInfoV177(row,preview,owner);return row;
}

function renderEffectPickerV177(owner,source={type:'catalog',id:'',label:''}){
  const box=el('div',{class:'effect-picker-v177'}),controls=el('div',{class:'effect-picker-controls-v177'}),search=el('input',{type:'search',placeholder:'Effekt suchen …','aria-label':'Effektkatalog durchsuchen'}),category=el('select',{'aria-label':'Effektkategorie'}),results=el('div');
  category.append(el('option',{value:'',text:'Alle Kategorien'}));for(const value of[...new Set(EFFECT_DEFINITIONS_V177.map(entry=>entry.category))])category.append(el('option',{value,text:value}));
  const draw=()=>{const query=normalizeSearchV177(search.value),selected=category.value,matches=EFFECT_DEFINITIONS_V177.filter(definition=>(!selected||definition.category===selected)&&(!query||normalizeSearchV177(definition.name+' '+definition.mechanics+' '+definition.category).includes(query))),groups=new Map();for(const definition of matches){if(!groups.has(definition.category))groups.set(definition.category,[]);groups.get(definition.category).push(definition)}results.replaceChildren();for(const[group,definitions]of groups){const details=el('details',{class:'effect-category-v177',open:!!query||!!selected}),summary=el('summary',{text:`${group} (${definitions.length})`}),list=el('div',{class:'effect-catalog-list-v177'});for(const definition of definitions)list.append(catalogResultV177(owner,definition,source));details.append(summary,list);results.append(details)}if(!matches.length)results.append(el('p',{class:'effect-empty-v177',text:'Kein passender Effekt gefunden.'}))};
  search.oninput=draw;category.onchange=draw;controls.append(search,category);box.append(controls,results);draw();return box;
}

let catalogDialogV177=null;
function openEffectCatalogDialogV177(owner,source){
  if(!catalogDialogV177){catalogDialogV177=el('dialog',{class:'effect-dialog-v177'});document.body.append(catalogDialogV177)}
  const close=el('button',{type:'button',text:'✕','aria-label':'Schließen',onclick:()=>catalogDialogV177.close()}),custom=el('button',{type:'button',text:'+ Eigener Effekt',onclick:()=>{const effect=customEffectV177(owner,source);persistEffectsV177(owner,true);catalogDialogV177.close();openEffectEditorV177(owner,effect)}});
  catalogDialogV177.replaceChildren(el('div',{class:'dialog-head'},[el('h2',{text:`Effekt verknüpfen · ${source.label||'Quelle'}`}),close]),custom,renderEffectPickerV177(owner,source));catalogDialogV177.showModal();
}

function intervalMultiplierV177(module,eventKey){
  if(module.interval==='round'&&eventKey==='round')return 1;
  if(module.interval==='3-rounds'&&eventKey==='round'){module.progress=(module.progress||0)+1;if(module.progress>=3){module.progress=0;return 1}return 0}
  if(module.interval==='10-minutes'&&eventKey==='10-minutes')return 1;if(module.interval==='10-minutes'&&eventKey==='hour')return 6;
  if(module.interval==='hour'&&eventKey==='hour')return 1;if(module.interval==='6-hours'&&eventKey==='hour'){module.progress=(module.progress||0)+1;if(module.progress>=6){module.progress=0;return 1}return 0}
  if(module.interval==='day'&&eventKey==='day')return 1;if(module.interval==='rest'&&eventKey==='rest')return 1;return 0;
}
function advanceEffectDurationsV177(owner,eventKey){
  const time={rounds:eventKey==='round'?1:0,minutes:eventKey==='10-minutes'?10:eventKey==='hour'?60:eventKey==='day'?1440:0,hours:eventKey==='hour'?1:eventKey==='day'?24:0,days:eventKey==='day'?1:0};
  for(const effect of activeEffectInstancesV177(owner)){const decrement=time[effect.durationUnit]||0;if(effect.remaining!==null&&decrement){effect.remaining=Math.max(0,effect.remaining-decrement);if(effect.remaining===0)effect.active=false}}
}
function advanceEffectsV177(owner,eventKey){
  const changes=[];
  for(const effect of activeEffectInstancesV177(owner))for(const module of effect.modules)if(module.type==='counter-current'){
    const times=intervalMultiplierV177(module,eventKey);if(!times||!owner.counters?.[module.target])continue;const before=owner.counters[module.target].current,after=Math.max(0,Math.min(owner.counters[module.target].max,before+(+module.value||0)*times));if(after!==before)changes.push({effect,module,before,after});
  }
  if(changes.length&&!confirm(changes.map(change=>`${change.effect.name}: ${change.module.target} ${change.before} → ${change.after}`).join('\n')+'\n\nÄnderungen anwenden?'))return;
  for(const change of changes)change.effect&&setCounterCurrentR8(owner,change.module.target,change.after);advanceEffectDurationsV177(owner,eventKey);
  owner.effectLogV177.unshift({id:uid(),at:nowV177(),event:eventKey,changes:changes.map(change=>({effect:change.effect.name,counter:change.module.target,before:change.before,after:change.after}))});owner.effectLogV177=owner.effectLogV177.slice(0,30);persistEffectsV177(owner,true);
}

function renderEffectsV177(owner){
  const effects=syncLinkedEffectsV177(owner),active=effects.filter(effect=>effectIsActiveV177(owner,effect)),inactive=effects.filter(effect=>!effectIsActiveV177(owner,effect)),box=el('div'),head=el('div',{class:'effect-head-v177'}),actions=el('div',{class:'effect-event-actions-v177'});
  const create=el('button',{type:'button',class:'primary',text:'+ Eigener Effekt',onclick:()=>{const effect=customEffectV177(owner);persistEffectsV177(owner,true);openEffectEditorV177(owner,effect)}});head.append(el('div',{},[el('h3',{text:'Aktive Effekte'}),el('span',{class:'effect-count-v177',text:`${active.length} aktiv`})]),create);
  for(const[key,label]of[['round','Nächste Runde'],['10-minutes','+10 Minuten'],['hour','+1 Stunde'],['rest','Rast'],['day','+1 Tag']])actions.append(el('button',{type:'button',text:label,onclick:()=>advanceEffectsV177(owner,key)}));
  const activeList=el('div',{class:'effect-list-v177'});if(active.length)for(const effect of active)activeList.append(renderEffectRowV177(owner,effect));else activeList.append(el('p',{class:'effect-empty-v177',text:'Keine aktiven Effekte.'}));
  const inactiveDetails=el('details',{class:'effect-category-v177'}),inactiveSummary=el('summary',{text:`Inaktive Effekte (${inactive.length})`}),inactiveList=el('div',{class:'effect-catalog-list-v177'});for(const effect of inactive)inactiveList.append(renderEffectRowV177(owner,effect));inactiveDetails.append(inactiveSummary,inactiveList);
  const catalogDetails=el('details',{class:'effect-category-v177'}),catalogSummary=el('summary',{text:`Vorbereitete Effekte (${EFFECT_DEFINITIONS_V177.length})`});catalogDetails.append(catalogSummary,renderEffectPickerV177(owner));
  box.append(head,actions,activeList,inactiveDetails,catalogDetails);
  if(owner.effectLogV177.length){const log=el('details',{class:'effect-category-v177'}),summary=el('summary',{text:'Effektprotokoll'}),list=el('div',{class:'effect-time-log-v177'});for(const entry of owner.effectLogV177.slice(0,10))list.append(el('p',{class:'muted',text:`${new Date(entry.at).toLocaleString('de-AT')} · ${entry.event} · ${entry.changes.length?entry.changes.map(change=>`${change.counter} ${change.before}→${change.after}`).join(', '):'keine Counteränderung'}`}));log.append(summary,list);box.append(log)}
  return box;
}

const renderUniversalBeforeV177=renderUniversalCardBodyV173;
renderUniversalCardBodyV173=function(card,owner){if(card.type===EFFECT_CARD_TYPE_V177)return renderEffectsV177(owner);return renderUniversalBeforeV177(card,owner)};
const renderCardBeforeV177=renderCard;
renderCard=function(card,owner=ch()){const node=renderCardBeforeV177(card,owner);node.dataset.cardType=card.type;node.dataset.ownerId=owner.id||'';if(card.type===EFFECT_CARD_TYPE_V177){const remove=node.querySelector('button[aria-label="Löschen"]');if(remove){remove.disabled=true;remove.title='Die Effektkarte ist ein fester Bestandteil von v1.7.7.'}}return node};
const renderCardsBeforeV177=renderCards;
renderCards=function(){const owner=activeLayoutOwner();if(owner&&owner.type!=='possession')ensureOwnerV177(owner);return renderCardsBeforeV177()};
renderCards.preservesViewport=renderCardsBeforeV177.preservesViewport===true;

const normalizeItemBeforeV177=normalizeItemV174;
normalizeItemV174=function(raw={}){const item=normalizeItemBeforeV177(raw);item.effectIdsV177=raw.source==='copy'?[]:(Array.isArray(raw.effectIdsV177)?raw.effectIdsV177:[]);return item};
const renderEquipmentBeforeV177=renderEquipmentV174;
renderEquipmentV174=function(owner){
  ensureOwnerV177(owner);const box=renderEquipmentBeforeV177(owner),entries=[...box.querySelectorAll('.equipment-entry')];
  entries.forEach((row,index)=>{const item=owner.equipment[index];if(!item)return;item.instanceId=item.instanceId||item.id||uid();row.dataset.itemId=item.instanceId;const effects=owner.activeEffectsV177.filter(effect=>effect.sourceType==='item'&&effect.sourceId===item.instanceId),links=el('div',{class:'effect-linked-v177 effect-source-links-v177'}),add=el('button',{type:'button',text:'+ Effekt verknüpfen',onclick:()=>openEffectCatalogDialogV177(owner,{type:'item',id:item.instanceId,label:item.name||'Item'})});links.append(el('strong',{text:'Item-Effekte:'}));for(const effect of effects)links.append(el('button',{type:'button',text:effect.name,onclick:()=>openEffectEditorV177(owner,effect)}));links.append(add);row.append(links)});return box;
};

const renderDisadvantagesBeforeV177=renderDisadvantagesV15;
renderDisadvantagesV15=function(){
  const owner=ch();syncLinkedEffectsV177(owner);const box=renderDisadvantagesBeforeV177(),rows=[...box.children].filter(node=>node.classList?.contains('notice'));
  rows.forEach((row,index)=>{const disadvantage=owner.disadvantages[index];if(!disadvantage)return;row.dataset.disadvantageId=disadvantage.id;const effect=owner.activeEffectsV177.find(entry=>entry.sourceType==='disadvantage'&&entry.sourceId===disadvantage.id),links=el('div',{class:'effect-linked-v177 effect-source-links-v177'},[el('strong',{text:'Verknüpfter Effekt:'}),el('button',{type:'button',text:effect?.name||disadvantage.name,onclick:()=>effect&&openEffectEditorV177(owner,effect)} )]);row.append(links)});return box;
};
const renderLocalModulesBeforeV177=renderLocalModulesV173;
renderLocalModulesV173=function(owner){
  syncLinkedEffectsV177(owner);const box=renderLocalModulesBeforeV177(owner),rows=[...box.querySelectorAll('.repeat-row')].slice(0,(owner.disadvantages||[]).length);
  rows.forEach((row,index)=>{const disadvantage=owner.disadvantages[index];if(!disadvantage)return;row.dataset.disadvantageId=disadvantage.id;const effect=owner.activeEffectsV177.find(entry=>entry.sourceType==='disadvantage'&&entry.sourceId===disadvantage.id);row.append(el('button',{type:'button',text:'Effekt',onclick:()=>effect&&openEffectEditorV177(owner,effect)}))});return box;
};

const hasPrintableBeforeV177=hasPrintableContentR15;
hasPrintableContentR15=function(card,owner,isCharacter=owner===ch()){if(card.type===EFFECT_CARD_TYPE_V177)return activeEffectInstancesV177(owner).length>0;return hasPrintableBeforeV177(card,owner,isCharacter)};
const renderPrintableBeforeV177=renderPrintableCardR15;
renderPrintableCardR15=function(card,owner,options,isCharacter){
  if(card.type!==EFFECT_CARD_TYPE_V177)return renderPrintableBeforeV177(card,owner,options,isCharacter);
  const table=el('table',{class:'effect-print-table-v177'}),body=el('tbody');table.append(el('thead',{},[el('tr',{},['Effekt','Wirkung','Quelle'].map(value=>el('th',{text:value})))]),body);for(const effect of activeEffectInstancesV177(owner))body.append(el('tr',{},[effect.name,effect.description,effectSourceLabelV177(owner,effect)].map(value=>el('td',{text:value}))));return printStaticCardR15(card,'effects',card.title||'Aktive Effekte',table);
};

function ownerDescriptorsV177(){const character=ch();return[character,...(character.auxiliaryTabs||[]).filter(owner=>owner.type!=='possession')]}
function cardTargetV177(owner,type){const card=owner.layout?.find(entry=>entry.type===type);return{ownerId:owner.id,cardType:type,cardId:card?.id}}
function searchIndexV177(){
  const entries=[];for(const owner of ownerDescriptorsV177()){
    const ownerName=owner===ch()?(owner.name||'Hauptcharakter'):(owner.name||owner.type||'Zusatzreiter'),push=(label,kind,target,search='')=>entries.push({label,kind,owner:ownerName,target:{ownerId:owner.id,...target},search:normalizeSearchV177(label+' '+kind+' '+ownerName+' '+search)});
    for(const card of owner.layout||[])push(card.title||CARD_TYPES[card.type]||card.type,'Karte',{cardId:card.id,cardType:card.type},card.type);
    if(owner.attributes)for(const[id,name]of ATTRS)push(`${name} (${id})`,'Grundwert',{...cardTargetV177(owner,'attributes'),selector:`[data-effect-target="${id}"]`},id);
    if(owner.counters)for(const[id,name]of COUNTERS)push(`${name} (${id})`,'Counter',{...cardTargetV177(owner,'counters'),selector:`[data-effect-target="${id}"]`},id);
    if(owner.skills)for(const skill of SKILLS)push(skill.name,'Fähigkeit',{...cardTargetV177(owner,'skills'),selector:`input[aria-label="${CSS.escape(skill.name+' Stufe')}"]`},`${skill.category} ${skill.attrs} ${skill.scope}`);
    for(const item of owner.equipment||[])push(item.name||'Unbenanntes Item','Item',{...cardTargetV177(owner,'equipment'),itemId:item.instanceId||item.id},`${item.category||''} ${item.description||''}`);
    for(const disadvantage of owner.disadvantages||[])push(disadvantage.name||'Nachteil','Nachteil',{...cardTargetV177(owner,'modules'),disadvantageId:disadvantage.id},`${disadvantage.category||''} ${disadvantage.description||''}`);
    for(const effect of syncLinkedEffectsV177(owner))push(effect.name,'Effekt',{...cardTargetV177(owner,'effects'),effectId:effect.id},`${effect.category} ${effect.description}`);
  }
  for(const definition of EFFECT_DEFINITIONS_V177)entries.push({label:definition.name,kind:'Effektvorlage',owner:'Katalog',target:{ownerId:ch().id,...cardTargetV177(ch(),'effects')},search:normalizeSearchV177(definition.name+' '+definition.category+' '+definition.mechanics)});
  for(const entry of POWER_ENTRIES_V176)entries.push({label:entry.displayName,kind:POWER_KIND_LABELS_V176[entry.powerKind]||'Kraft',owner:entry.schoolLabel,target:{ownerId:ch().id,...cardTargetV177(ch(),'fatePath')},search:normalizeSearchV177(entry.displayName+' '+entry.schoolLabel+' '+entry.code)});
  for(const entry of COMBAT_TECHNIQUE_ENTRIES_V176)entries.push({label:entry.name,kind:'Kampftechnik',owner:entry.skillName,target:{ownerId:ch().id,...cardTargetV177(ch(),'skills')},search:normalizeSearchV177(entry.name+' '+entry.skillName+' '+entry.code)});
  return entries;
}
function rankSearchV177(entry,query){const label=normalizeSearchV177(entry.label);return label===query?0:label.startsWith(query)?1:label.includes(query)?2:entry.search.includes(query)?3:99}

function installGlobalSearchV177(){
  if(document.getElementById('globalSearchV177'))return;const host=el('div',{id:'globalSearchV177',class:'global-search-v177'}),input=el('input',{type:'search',placeholder:'Im Builder suchen …','aria-label':'Builder durchsuchen','aria-autocomplete':'list','aria-expanded':'false'}),clear=el('button',{type:'button',text:'×','aria-label':'Suche leeren'}),results=el('div',{class:'global-search-results-v177',role:'listbox',hidden:true}),box=el('div',{class:'global-search-box-v177'},[input,clear]);let matches=[],selected=-1;
  const close=()=>{results.hidden=true;input.setAttribute('aria-expanded','false');selected=-1};const draw=()=>{const query=normalizeSearchV177(input.value);if(!query){close();return}matches=searchIndexV177().map(entry=>({...entry,rank:rankSearchV177(entry,query)})).filter(entry=>entry.rank<99).sort((a,b)=>a.rank-b.rank||a.label.localeCompare(b.label,'de')).slice(0,10);results.replaceChildren();matches.forEach((entry,index)=>{const button=el('button',{type:'button',class:'global-search-result-v177',role:'option','aria-selected':index===selected,text:''},[el('strong',{text:entry.label}),el('small',{text:`${entry.kind} · ${entry.owner}`})]);button.onmousedown=event=>event.preventDefault();button.onclick=()=>{navigateToV177(entry.target);input.value=entry.label;close()};results.append(button)});if(!matches.length)results.append(el('p',{class:'muted',text:'Kein Treffer.'}));results.hidden=false;input.setAttribute('aria-expanded','true')};
  input.oninput=draw;input.onkeydown=event=>{if(event.key==='Escape'){close();return}if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();selected=Math.max(0,Math.min(matches.length-1,selected+(event.key==='ArrowDown'?1:-1)));[...results.querySelectorAll('[role=option]')].forEach((node,index)=>node.setAttribute('aria-selected',String(index===selected)));return}if(event.key==='Enter'&&matches.length){event.preventDefault();const entry=matches[selected>=0?selected:0];navigateToV177(entry.target);input.value=entry.label;close()}};clear.onclick=()=>{input.value='';close();input.focus()};document.addEventListener('click',event=>{if(!host.contains(event.target))close()});host.append(box,results);document.querySelector('.topbar')?.insertBefore(host,document.querySelector('.topbar .toolbar'));
}

const auditBeforeV177=audit;
audit=function(){auditBeforeV177();const owners=ownerDescriptorsV177(),invalid=owners.flatMap(owner=>syncLinkedEffectsV177(owner).filter(effect=>!effect.id||!Array.isArray(effect.modules)));auditResults.append(el('h3',{text:'Aktive Effekte v1.7.7'}),el('div',{class:'notice '+(!invalid.length?'ok':'error'),text:`${!invalid.length?'✓':'✕'} ${EFFECT_DEFINITIONS_V177.length} Katalogeffekte · ${owners.reduce((sum,owner)=>sum+owner.activeEffectsV177.length,0)} Instanzen · ${invalid.length} ungültig`}))};

const runTestsBeforeV177=runTests;
runTests=function(){
  runTestsBeforeV177();const body=testResults.querySelector('tbody');for(const row of[...body.querySelectorAll('tr')])if(new Set(['Version 1.7.6','Schema 14']).has(row.cells[0]?.textContent))row.remove();
  const tests=[],eq=(name,expected,actual)=>tests.push([name,expected,actual,expected===actual]),owner=newCharacter();owner.activeEffectsV177=[];
  eq('Version 1.7.7','1.7.7',APP_VERSION);eq('Schema 15',15,SCHEMA_VERSION);eq('227 Effektdefinitionen',227,EFFECT_DEFINITIONS_V177.length);eq('227 eindeutige Effekt-IDs',227,new Set(EFFECT_DEFINITIONS_V177.map(definition=>definition.id)).size);eq('Wetter bleibt im Katalog',true,EFFECT_DEFINITIONS_V177.some(definition=>definition.name==='Starker Regen'));
  const sleep=effectInstanceV177({definitionId:EFFECT_DEFINITIONS_V177.find(definition=>definition.name==='Schlafend').id});owner.attributes.WN=7;owner.activeEffectsV177.push(sleep);eq('Schlafend setzt WN wirksam auf 0',0,effectiveAttributes(owner).WN);eq('Effektobjekt bleibt referenzstabil',true,owner.activeEffectsV177[0]===sleep);sleep.active=false;eq('Aktivstatus wird wirklich ausgeschaltet',false,owner.activeEffectsV177[0].active);eq('Inaktiver Effekt liefert keine WN-Module',0,activeEffectModulesV177(owner,'attribute','WN').length);eq('Deaktivieren stellt WN wieder her',7,effectiveAttributes(owner).WN);sleep.active=true;eq('Erneutes Aktivieren verdoppelt nicht',0,effectiveAttributes(owner).WN);
  const custom=effectInstanceV177({name:'Testbuff',modules:[{type:'attribute',target:'ST',operation:'add',value:2},{type:'skill',target:'skill_0',operation:'add',value:3}]});owner.attributes.ST=4;owner.activeEffectsV177=[custom];eq('Grundwertmodul wirkt genau einmal',6,effectiveAttributes(owner).ST);eq('Skillmodul wirkt genau einmal',3,skillModifiers(owner).skill_0);
  const leg=effectInstanceV177({definitionId:EFFECT_DEFINITIONS_V177.find(definition=>definition.name==='Beinbruch').id});owner.counters.L.max=13;owner.activeEffectsV177=[leg];eq('Beinbruch blockiert ein Viertel aufgerundet',4,blockedLifeV177(owner).points);eq('Blockiertes Leben lässt CBP-Maximum unverändert',13,owner.counters.L.max);
  const item=normalizeItemV174({name:'Ring',loadState:'carried',quantity:1,equippedQuantity:0}),itemEffect=effectInstanceV177({name:'Ringkraft',sourceType:'item',sourceId:item.instanceId,modules:[{type:'attribute',target:'ST',operation:'add',value:1}]});owner.equipment=[item];owner.activeEffectsV177=[itemEffect];eq('Mitgeführtes Item aktiviert Effekt nicht',false,effectIsActiveV177(owner,itemEffect));item.loadState='equipped';item.equippedQuantity=1;eq('Ausgerüstetes Item aktiviert Effekt',true,effectIsActiveV177(owner,itemEffect));
  const linkedOwner=newCharacter(),linkedDisadvantage=disadvantageObject({name:'Verknüpft',catalog:false,effects:{attributes:{ST:-2}}});linkedOwner.disadvantages=[linkedDisadvantage];syncLinkedEffectsV177(linkedOwner);eq('Nachteil erzeugt genau einen verknüpften Effekt',1,linkedOwner.activeEffectsV177.filter(effect=>effect.sourceType==='disadvantage').length);eq('Nachteilwirkung wird nicht doppelt gerechnet',-2,attributeModifiers(linkedOwner).ST);
  const periodic=moduleV177({type:'counter-current',target:'A',operation:'add',value:-1,interval:'3-rounds'});eq('Dreirunden-Effekt löst nicht zu früh aus','0|0|1',[intervalMultiplierV177(periodic,'round'),intervalMultiplierV177(periodic,'round'),intervalMultiplierV177(periodic,'round')].join('|'));
  const durationOwner=newCharacter(),short=effectInstanceV177({name:'Kurz',durationUnit:'rounds',durationValue:1,remaining:1});durationOwner.activeEffectsV177=[short];advanceEffectDurationsV177(durationOwner,'round');eq('Abgelaufener Effekt wird deaktiviert',false,short.active);
  const printOwner=newCharacter(),printEffect=effectInstanceV177({name:'Druckeffekt',description:'ST −1',modules:[{type:'attribute',target:'ST',operation:'add',value:-1}]});printOwner.activeEffectsV177=[printEffect];eq('Druckansicht enthält aktive Effekte',true,renderPrintableCardR15(cardObject('effects'),printOwner,{images:true},true).textContent.includes('Druckeffekt'));
  const migrated={characters:[newCharacter()],migrationLog:[]};delete migrated.v177EffectsDone;ensureStateV177(migrated,false);const count=migrated.characters[0].layout.filter(card=>card.type==='effects').length;ensureStateV177(migrated,false);eq('Effektmigration ist idempotent',count,migrated.characters[0].layout.filter(card=>card.type==='effects').length);eq('Aktive-Effekte-Karte wird gerendert',true,renderEffectsV177(owner).textContent.includes('Aktive Effekte'));eq('Effektkarte kann über Kartenliste wiedergefunden werden',true,[...addCards.querySelectorAll('button')].some(button=>button.textContent.includes('Aktive Effekte')));eq('Tooltip besitzt keinen Scrollbalken',true,effectStyleV177.textContent.includes('overflow:visible'));eq('Globale Suche ist vorhanden',true,!!document.getElementById('globalSearchV177'));eq('Suche enthält Fähigkeiten',true,searchIndexV177().some(entry=>entry.kind==='Fähigkeit'));eq('Suche enthält Effekte',true,searchIndexV177().some(entry=>entry.kind==='Effektvorlage'));eq('Suchziel wird nicht farbig markiert',false,effectStyleV177.textContent.includes('search-highlight'));
  for(const[name,expected,actual,ok]of tests)body.append(el('tr',{},[name,expected,actual,ok?'Bestanden':'Fehler'].map(value=>el('td',{text:String(value)}))));return[...body.querySelectorAll('tr')].every(row=>row.cells[3]?.textContent==='Bestanden');
};

testsBtn.onclick=runTests;
installGlobalSearchV177();
renderAddCards();
Object.assign(window.Eberos,{version:APP_VERSION,schemaVersion:SCHEMA_VERSION,runTests:()=>runTests(),effectDb:EFFECT_DB_V177,effectDefinitions:EFFECT_DEFINITIONS_V177,ensureStateV177,ensureOwnerV177,effectiveAttributes,effectiveCounters,skillModifiers,blockedLife:blockedLifeV177,advanceEffects:advanceEffectsV177,searchIndex:searchIndexV177,navigateTo:navigateToV177});
save();renderAll();
