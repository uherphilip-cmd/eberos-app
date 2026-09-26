'use strict';
/* EBEROS v1.7.21-r2 – vollständiger Synergie-Releasekatalog. */
const V1721R2_VERSION='1.7.21',V1721R2_REVISION='r2',V1721R2_SCHEMA=27,V1721R2_RULES=13;
const SYNERGY_DB_V1721R2=window.EBEROS_SYNERGY_CATALOG_V1721R2||{meta:{},paths:[],powers:[]};
const SYNERGY_PATHS_V1721R2=Array.isArray(SYNERGY_DB_V1721R2.paths)?SYNERGY_DB_V1721R2.paths:[];
const SYNERGY_POWERS_V1721R2=Array.isArray(SYNERGY_DB_V1721R2.powers)?SYNERGY_DB_V1721R2.powers:[];
const SYNERGY_PATH_BY_ID_V1721R2=new Map(SYNERGY_PATHS_V1721R2.map(path=>[path.id,path]));
const SYNERGY_POWER_BY_ID_V1721R2=new Map(SYNERGY_POWERS_V1721R2.map(power=>[power.id,power]));
const SYNERGY_POWERS_BY_PATH_V1721R2=new Map(SYNERGY_PATHS_V1721R2.map(path=>[path.id,path.powerIds.map(id=>SYNERGY_POWER_BY_ID_V1721R2.get(id)).filter(Boolean)]));
const SCHOOL_PATHS_V1721R2=SYNERGY_PATHS_V1721R2.filter(path=>path.type==='Schule');
const COMBAT_PATHS_V1721R2=SYNERGY_PATHS_V1721R2.filter(path=>path.type==='Kampf');
const Z11_FINSTERMAL_V1721R2=SYNERGY_DB_V1721R2.z11Finstermal||null;

function thresholdValuesV1721R2(value){
  const values=String(value||'').split('/').map(part=>Math.max(0,+part||0));
  return{first:values[0]||0,second:values[1]??values[0]??0};
}
function purchasedSkillLevelV1721R2(owner,skillId){return Math.max(0,Math.min(25,+owner?.skills?.[skillId]?.level||0))}
function effectiveSkillLevelV1721R2(owner,skillId){
  const purchased=purchasedSkillLevelV1721R2(owner,skillId);
  if(owner===ch())return Math.max(0,Math.min(25,purchased+(skillModifiers(owner)?.[skillId]||0)));
  return purchased;
}
function pathLevelsV1721R2(owner,path){return path.parentSkillIds.map(id=>purchasedSkillLevelV1721R2(owner,id))}
function pathMinimumV1721R2(owner,path){return Math.min(...pathLevelsV1721R2(owner,path))}
function pathDiscoveryV1721R2(owner,path){const minimum=pathMinimumV1721R2(owner,path);return minimum>=5?'open':minimum>=1?'discovered':'hidden'}
function pathParentLabelV1721R2(owner,path){return path.parents.map((name,index)=>`${name} ${purchasedSkillLevelV1721R2(owner,path.parentSkillIds[index])}`).join(' + ')}
function powerRequirementsMetV1721R2(owner,path,power){
  const threshold=thresholdValuesV1721R2(power.threshold),levels=pathLevelsV1721R2(owner,path);
  if(path.type==='Kampf'){
    const combatIndex=path.parentSkillIds.findIndex(id=>COMBAT_SKILL_IDS_V178.has(id));
    const schoolIndex=combatIndex===0?1:0;
    return combatIndex>=0&&levels[combatIndex]>=threshold.first&&levels[schoolIndex]>=threshold.second;
  }
  return levels[0]>=threshold.first&&levels[1]>=threshold.second;
}

function costPhraseV1721R2(value){
  const text=String(value||'').replace(/\s+/g,' ').trim(),bold=[...text.matchAll(/\*\*([^*]+)\*\*/g)].map(match=>match[1]);
  return bold.find(part=>/\b\d+\s*(?:A|M|GB|FS)\b/.test(part))||text.split(/[.;](?:\s|$)/)[0];
}
function costPartsV1721R2(value){
  const phrase=costPhraseV1721R2(value),parts=[];
  for(const match of phrase.matchAll(/\b(\d+)\s*(?:eigene(?:r|n)?\s+)?(A|M|GB|FS|LP)\b/g))parts.push({counterId:match[2]==='LP'?'L':match[2],amount:+match[1]||0});
  if(/gebund/i.test(phrase))return parts;
  const seen=new Set();return parts.filter(part=>{if(seen.has(part.counterId))return false;seen.add(part.counterId);return true});
}
function boundCostPartsV1721R2(value){
  const phrase=costPhraseV1721R2(value);if(!/gebund/i.test(phrase))return[];
  const matches=[...phrase.matchAll(/\b(\d+)\s*(A|M|GB|FS)\b/g)],explicit=[];
  for(let index=0;index<matches.length;index++){const match=matches[index],end=matches[index+1]?.index??phrase.length,tail=phrase.slice(match.index+match[0].length,end);if(/gebund/i.test(tail))explicit.push({counterId:match[2],amount:+match[1]||0})}
  return explicit.length?explicit:costPartsV1721R2(value).filter(part=>part.counterId!=='A');
}
function hybridEntryV1721R2(power){
  const path=SYNERGY_PATH_BY_ID_V1721R2.get(power.pathId),combatSkillId=path.parentSkillIds.find(id=>COMBAT_SKILL_IDS_V178.has(id)),schoolSkillId=path.parentSkillIds.find(id=>id!==combatSkillId),parts=costPartsV1721R2(power.cost),stamina=parts.find(part=>part.counterId==='A')?.amount||1;
  return{id:power.id,pathId:path.id,code:`H${power.slot}`,name:power.name,skillId:combatSkillId,skillName:SKILLS.find(skill=>skill.id===combatSkillId)?.name||path.parents[0],schoolSkillId,schoolSkillName:SKILLS.find(skill=>skill.id===schoolSkillId)?.name||path.parents[1],staminaCost:stamina,activation:power.cost,effect:power.text,scaling:'Magischer Zusatz: S/B/W aus der niedrigeren wirksamen Elternstufe. Körperlicher Teil: wirksame Kampfstufe.',check:`Ein Synergiewurf mit ${path.attributes.join(' + ')} und dem Fähigkeitswürfel der wirksamen Kampfstufe entscheidet körperlichen Vorgang und Zusatz.`,limits:[path.context,...power.checks].filter(Boolean).join(' '),sourceFields:{Aktivierung:power.cost,Wirkung:power.text,Grenze:[path.context,...power.checks].filter(Boolean).join(' ')},synergyHybridV1721R2:true,synergyThreshold:power.threshold,synergyCosts:parts,synergyPath:path};
}
const HYBRID_ENTRIES_V1721R2=SYNERGY_POWERS_V1721R2.filter(power=>SYNERGY_PATH_BY_ID_V1721R2.get(power.pathId)?.type==='Kampf').map(hybridEntryV1721R2);
const HYBRID_BY_ID_V1721R2=new Map(HYBRID_ENTRIES_V1721R2.map(entry=>[entry.id,entry]));
for(const entry of HYBRID_ENTRIES_V1721R2)if(!COMBAT_BY_ID_V178.has(entry.id))COMBAT_BY_ID_V178.set(entry.id,entry);

function validateSynergyCatalogV1721R2(){
  const errors=[],pathIds=new Set(),powerIds=new Set();
  for(const path of SYNERGY_PATHS_V1721R2){
    if(pathIds.has(path.id))errors.push(`Doppelte Pfad-ID ${path.id}`);pathIds.add(path.id);
    if(path.parentSkillIds.length!==2||path.parentSkillIds.some(id=>!SKILLS.some(skill=>skill.id===id)))errors.push(`Ungültige Eltern ${path.id}`);
    if(path.type==='Kampf'&&path.parentSkillIds.filter(id=>COMBAT_SKILL_IDS_V178.has(id)).length!==1)errors.push(`Kampfpfad ohne eindeutigen Kampfbaum ${path.id}`);
  }
  for(const power of SYNERGY_POWERS_V1721R2){
    if(powerIds.has(power.id))errors.push(`Doppelte Inhalts-ID ${power.id}`);powerIds.add(power.id);if(!pathIds.has(power.pathId))errors.push(`Unbekannter Pfad ${power.id}`);if(!/^\d+\/\d+$/.test(power.threshold))errors.push(`Ungültige Schwelle ${power.id}`);
    const path=SYNERGY_PATH_BY_ID_V1721R2.get(power.pathId),parts=costPartsV1721R2(power.cost),hasA=parts.some(part=>part.counterId==='A'),hasPower=parts.some(part=>['M','GB','FS'].includes(part.counterId)),preparedBinding=/vorbereitete.*Bindung/i.test(power.cost);
    if(!parts.length)errors.push(`Kosten nicht lesbar ${power.id}`);if(path?.type==='Schule'&&(hasA||!hasPower))errors.push(`Ungültige Schulkosten ${power.id}`);if(path?.type==='Kampf'&&(!hasA||(!hasPower&&!preparedBinding)))errors.push(`Ungültige Hybridkosten ${power.id}`);
  }
  if(SYNERGY_PATHS_V1721R2.length!==132)errors.push(`Pfadzahl ${SYNERGY_PATHS_V1721R2.length}`);
  if(SYNERGY_POWERS_V1721R2.length!==345)errors.push(`Inhaltszahl ${SYNERGY_POWERS_V1721R2.length}`);
  if(SCHOOL_PATHS_V1721R2.length!==91||COMBAT_PATHS_V1721R2.length!==41)errors.push('Pfadtypen unvollständig');
  if(HYBRID_ENTRIES_V1721R2.length!==82)errors.push(`Hybridzahl ${HYBRID_ENTRIES_V1721R2.length}`);
  return{ok:!errors.length,errors,paths:pathIds.size,powers:powerIds.size};
}
const SYNERGY_VALIDATION_V1721R2=validateSynergyCatalogV1721R2();
if(!SYNERGY_VALIDATION_V1721R2.ok)showError('Synergiekatalog v1.7.21-r2 fehlerhaft: '+SYNERGY_VALIDATION_V1721R2.errors.join(' · '));

const Z11_POWER_ID_V1721R2='power_madness_delirium_z11';
const z11EntryV1721R2=POWER_BY_ID_V176.get(Z11_POWER_ID_V1721R2);
if(z11EntryV1721R2&&Z11_FINSTERMAL_V1721R2){
  z11EntryV1721R2.rulesLimits=`${z11EntryV1721R2.rulesLimits}\n\nFreigegebene Ausprägung „Fremdes Leben“: ${Z11_FINSTERMAL_V1721R2.ruleText}`;
  z11EntryV1721R2.sourceFields={...(z11EntryV1721R2.sourceFields||{}),'Finstermal-Ausprägung':Z11_FINSTERMAL_V1721R2.ruleText};
}
function z11FinstermalComponentsV1721R2(reinforcement=0){return[{counterId:'FS',amount:2+Math.max(0,Math.min(2,+reinforcement||0))}]}
function z11FinstermalActionV1721R2(owner){
  let reinforcement=0;
  const section=actionDisclosureV1712R2('Fremdes Leben wirken · 2–4 FS','Z11-Ausprägung Fremdes Leben vorbereiten',host=>{
    const controls=el('div',{class:'learned-action-controls-v1712r2'}),summary=el('div'),confirmHost=el('div');host.append(el('strong',{text:Z11_FINSTERMAL_V1721R2.name}),el('p',{class:'muted',text:Z11_FINSTERMAL_V1721R2.ruleText}),controls,summary,confirmHost);
    const draw=()=>{const select=el('select',{'aria-label':'Verstärkung Fremdes Leben'});[['0','Grundwirkung · 2 FS'],['1','Verstärkung V1 · 3 FS'],['2','Verstärkung V2 · 4 FS']].forEach(([value,label])=>select.append(el('option',{value,text:label})));select.value=String(reinforcement);select.onchange=event=>{reinforcement=+event.target.value;draw()};controls.replaceChildren(el('label',{class:'field'},[el('span',{text:'Ausprägung und Verstärkung'}),select]));const components=z11FinstermalComponentsV1721R2(reinforcement),plan=actionPaymentPlanV1712R2(owner,components);summary.replaceChildren();appendPaymentSummaryV1712R2(summary,plan,components);summary.append(el('p',{class:'notice',text:'Nach dem Wurf Ziel, Wirkwert, angewandte und zurückgehaltene Splitter, Malpunkte, Lebensanker und Endtag im Spielprotokoll festhalten.'}));confirmHost.replaceChildren(el('button',{type:'button',class:'primary',text:'Fremdes Leben wirken und Kosten abziehen',disabled:!plan.valid,onclick:()=>commitActionPaymentV1712R2(owner,components,Z11_FINSTERMAL_V1721R2.id,'Fremdes Leben wirken')}))};draw();
  });section.classList.add('z11-finstermal-action-v1721r2');return section;
}
const renderLearnedPowerBeforeV1721R2=renderLearnedPowerV176;
renderLearnedPowerV176=function(owner,skillId,powerId){
  const row=renderLearnedPowerBeforeV1721R2(owner,skillId,powerId);if(powerId!==Z11_POWER_ID_V1721R2||!Z11_FINSTERMAL_V1721R2)return row;const detail=row.querySelector('.power-inline-detail-v176'),info=[...row.querySelectorAll('.power-actions-v176 button')].find(button=>button.textContent==='Details');if(!detail||!info)return row;const open=info.onclick;info.onclick=event=>{open?.call(info,event);if(!detail.hidden&&!detail.querySelector('.z11-finstermal-action-v1721r2'))detail.append(z11FinstermalActionV1721R2(owner))};return row;
};

function synergyOwnerStateV1721R2(raw={}){
  const value=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw:{};
  value.learnedSchoolPowerIds=Array.isArray(value.learnedSchoolPowerIds)?[...new Set(value.learnedSchoolPowerIds.filter(id=>typeof id==='string'))]:[];
  value.restingSchoolPowerIds=Array.isArray(value.restingSchoolPowerIds)?[...new Set(value.restingSchoolPowerIds.filter(id=>value.learnedSchoolPowerIds.includes(id)))]:[];
  value.favoritePathIds=Array.isArray(value.favoritePathIds)?[...new Set(value.favoritePathIds.filter(id=>typeof id==='string'))]:[];
  value.bindings=Array.isArray(value.bindings)?value.bindings.filter(binding=>binding&&typeof binding==='object'&&binding.active!==false&&typeof binding.powerId==='string').map(binding=>({...binding,id:String(binding.id||uid()),costs:actionCounterComponentsV1712R2(binding.costs||[]),active:true})):[];
  return value;
}
function ensureOwnerSynergiesV1721R2(owner){if(!owner||owner.type==='possession')return owner;owner.catalogSynergiesV1721R2=synergyOwnerStateV1721R2(owner.catalogSynergiesV1721R2);return owner}
function ensureStateV1721R2(data,log=true){
  if(!data||typeof data!=='object')return data;
  const first=!data.v1721R2MigrationDone,fromApp=data.appVersion||'unbekannt',fromSchema=+data.schemaVersion||0;
  for(const owner of ownerListV178(data))ensureOwnerSynergiesV1721R2(owner);
  data.appVersion='1.7.21-r2';data.schemaVersion=V1721R2_SCHEMA;data.rulesVersion=V1721R2_RULES;data.v1721R2MigrationDone=true;
  data.migrationLog=Array.isArray(data.migrationLog)?data.migrationLog:[];
  if(first&&log)data.migrationLog.push({from:fromSchema,fromApp,to:V1721R2_SCHEMA,toApp:'1.7.21-r2',at:new Date().toISOString(),changes:['132 katalogisierte Synergiepfade ergänzt','Gemeinsamen Schulsynergie-Lernpool ergänzt','82 Hybridtechniken an reguläre Technikplätze angebunden','Keine automatische Lernwahl durchgeführt']});
  return data;
}
const migrateStateBeforeV1721R2=migrateState;
migrateState=function(data){return ensureStateV1721R2(migrateStateBeforeV1721R2(data),true)};
state=ensureStateV1721R2(state,true);
const newCharacterBeforeV1721R2=newCharacter,newAuxEntryBeforeV1721R2=newAuxEntry;
newCharacter=function(){return ensureOwnerSynergiesV1721R2(newCharacterBeforeV1721R2())};
newAuxEntry=function(type,name){return ensureOwnerSynergiesV1721R2(newAuxEntryBeforeV1721R2(type,name))};

function schoolSynergyCapacityV1721R2(owner){return Math.max(0,...SCHOOL_PATHS_V1721R2.map(path=>Math.min(5,Math.floor(pathMinimumV1721R2(owner,path)/5))))}
function learnedSchoolIdsV1721R2(owner){if(!owner.catalogSynergiesV1721R2)ensureOwnerSynergiesV1721R2(owner);return owner.catalogSynergiesV1721R2.learnedSchoolPowerIds}
function restingSchoolIdsV1721R2(owner){if(!owner.catalogSynergiesV1721R2)ensureOwnerSynergiesV1721R2(owner);return owner.catalogSynergiesV1721R2.restingSchoolPowerIds}
function schoolPowerStatusV1721R2(owner,power){
  const path=SYNERGY_PATH_BY_ID_V1721R2.get(power.pathId),learned=learnedSchoolIdsV1721R2(owner).includes(power.id),resting=restingSchoolIdsV1721R2(owner).includes(power.id),requirements=powerRequirementsMetV1721R2(owner,path,power);
  if(learned&&resting)return'resting';if(learned&&!requirements)return'prerequisite';if(learned)return'learned';return requirements?'available':'locked';
}
function activeSchoolPowerIdsV1721R2(owner){return learnedSchoolIdsV1721R2(owner).filter(id=>{const power=SYNERGY_POWER_BY_ID_V1721R2.get(id);return power&&schoolPowerStatusV1721R2(owner,power)==='learned'})}
function schoolPoolOverageV1721R2(owner){return Math.max(0,activeSchoolPowerIdsV1721R2(owner).length-schoolSynergyCapacityV1721R2(owner))}
function canLearnSchoolPowerV1721R2(owner,powerId){const power=SYNERGY_POWER_BY_ID_V1721R2.get(powerId),path=power&&SYNERGY_PATH_BY_ID_V1721R2.get(power.pathId);return!!power&&path?.type==='Schule'&&!learnedSchoolIdsV1721R2(owner).includes(powerId)&&powerRequirementsMetV1721R2(owner,path,power)&&activeSchoolPowerIdsV1721R2(owner).length<schoolSynergyCapacityV1721R2(owner)}
function learnSchoolPowerV1721R2(owner,powerId){if(!canLearnSchoolPowerV1721R2(owner,powerId))return false;learnedSchoolIdsV1721R2(owner).push(powerId);saveOwnerV175(owner,true);return true}
function unlearnSchoolPowerV1721R2(owner,powerId){const learned=learnedSchoolIdsV1721R2(owner),index=learned.indexOf(powerId);if(index<0||activeSynergyBindingsV1721R2(owner,powerId).length)return false;learned.splice(index,1);owner.catalogSynergiesV1721R2.restingSchoolPowerIds=restingSchoolIdsV1721R2(owner).filter(id=>id!==powerId);saveOwnerV175(owner,true);return true}
function restSchoolPowerV1721R2(owner,powerId,rest=true){if(!learnedSchoolIdsV1721R2(owner).includes(powerId))return false;const ids=restingSchoolIdsV1721R2(owner),index=ids.indexOf(powerId);if(rest&&index<0)ids.push(powerId);if(!rest&&index>=0){const power=SYNERGY_POWER_BY_ID_V1721R2.get(powerId),path=power&&SYNERGY_PATH_BY_ID_V1721R2.get(power.pathId);if(!powerRequirementsMetV1721R2(owner,path,power)||activeSchoolPowerIdsV1721R2(owner).length>=schoolSynergyCapacityV1721R2(owner))return false;ids.splice(index,1)}saveOwnerV175(owner,true);return true}

function activeSynergyBindingsV1721R2(owner,powerId=''){ensureOwnerSynergiesV1721R2(owner);return owner.catalogSynergiesV1721R2.bindings.filter(binding=>binding.active!==false&&(!powerId||binding.powerId===powerId))}
function boundResourceTotalsV1721R2(owner){const totals=new Map();for(const binding of activeSynergyBindingsV1721R2(owner))for(const part of binding.costs||[])totals.set(part.counterId,(totals.get(part.counterId)||0)+part.amount);return totals}
function releaseSynergyBindingV1721R2(owner,bindingId){
  const binding=activeSynergyBindingsV1721R2(owner).find(entry=>entry.id===bindingId);if(!binding)return false;
  for(const part of binding.costs||[]){const counter=owner.counters?.[part.counterId];if(counter)counter.current=Math.min(Math.max(0,+counter.max||0),Math.max(0,+counter.current||0)+part.amount)}
  owner.catalogSynergiesV1721R2.bindings=owner.catalogSynergiesV1721R2.bindings.filter(entry=>entry.id!==bindingId);saveOwnerV175(owner,true);showToastV179(`${binding.name}: Bindung gelöst.`);return true;
}
function synergyRollSummaryV1721R2(owner,path){const effective=path.parentSkillIds.map(id=>effectiveSkillLevelV1721R2(owner,id)),s=Math.min(...effective),attributes=effectiveAttributes(owner);return{effective,s,b:bonusValueV176(s),die:dieValueV176(s),attributeText:path.attributes.map(id=>`${id} ${attributes[id]??owner.attributes?.[id]??0}`).join(' + ')}}
function useSchoolSynergyV1721R2(owner,powerId,options={}){
  const power=SYNERGY_POWER_BY_ID_V1721R2.get(powerId),path=power&&SYNERGY_PATH_BY_ID_V1721R2.get(power.pathId);if(!power||path?.type!=='Schule'||schoolPowerStatusV1721R2(owner,power)!=='learned')return false;
  const components=actionCounterComponentsV1712R2(costPartsV1721R2(power.cost)),bound=actionCounterComponentsV1712R2(boundCostPartsV1721R2(power.cost)),transaction=commitActionPaymentV1712R2(owner,components,power.id,`${power.name} wirken`,{persist:false,notify:false,render:false,debounce:options.debounce!==false});if(!transaction)return false;
  if(bound.length)owner.catalogSynergiesV1721R2.bindings.push({id:uid(),powerId:power.id,pathId:path.id,name:power.name,costs:bound,transactionId:transaction.id,createdAt:new Date().toISOString(),active:true});
  if(options.persist!==false)saveOwnerV175(owner,options.render!==false);if(options.notify!==false)showActionPaymentToastV1712R2(transaction);return transaction;
}
function synergySchoolActionV1721R2(owner,path,power){
  const components=actionCounterComponentsV1712R2(costPartsV1721R2(power.cost)),bound=actionCounterComponentsV1712R2(boundCostPartsV1721R2(power.cost)),hasBinding=bound.length>0;
  return actionDisclosureV1712R2(`Kraft einsetzen · ${costPhraseV1721R2(power.cost)}`,`${power.name}: Synergieeinsatz vorbereiten`,host=>{
    const roll=synergyRollSummaryV1721R2(owner,path),plan=actionPaymentPlanV1712R2(owner,components),existing=activeSynergyBindingsV1721R2(owner,power.id);
    host.append(el('strong',{text:`${power.name} – Einsatz bestätigen`}),el('p',{text:`Ein Synergiewurf: ${roll.attributeText} + ${roll.die}. S ${roll.s} · B ${roll.b}. Der Builder würfelt die Probe nicht automatisch.`}),el('p',{class:'muted',text:'Die Zahlung wird erst mit dem Bestätigungsbutton abgezogen. Fehlschlag oder Unterbrechung erstatten ausgegebene Kosten nicht.'}));appendPaymentSummaryV1712R2(host,plan,components);
    if(hasBinding)host.append(el('p',{class:'notice',text:`Gebunden bis zur manuellen Auflösung: ${actionPaymentTextV1712R2(bound)}. Eine Rast füllt diesen Anteil nicht auf.`}));
    if(existing.length)host.append(el('p',{class:'notice',text:`${existing.length} aktive Bindung${existing.length===1?'':'en'} dieser Kraft vorhanden.`}));
    const button=el('button',{type:'button',class:'primary',text:hasBinding?'Wirken, Kosten zahlen und Bindung anlegen':'Wirken und Kosten abziehen',disabled:!plan.valid||schoolPowerStatusV1721R2(owner,power)!=='learned'});
    button.onclick=()=>{if(useSchoolSynergyV1721R2(owner,power.id))button.disabled=true};host.append(button);
    for(const binding of existing)host.append(el('button',{type:'button',text:`Bindung lösen · ${actionPaymentTextV1712R2(binding.costs)}`,onclick:()=>releaseSynergyBindingV1721R2(owner,binding.id)}));
  });
}

function hybridContextV1721R2(path,power){const combatSkillId=path.parentSkillIds.find(id=>COMBAT_SKILL_IDS_V178.has(id)),schoolSkillId=path.parentSkillIds.find(id=>id!==combatSkillId);return{combatSkillId,schoolSkillId,entry:HYBRID_BY_ID_V1721R2.get(power.id)}}
function learnedHybridV1721R2(owner,powerId){const entry=HYBRID_BY_ID_V1721R2.get(powerId);return!!entry&&owner.skills?.[entry.skillId]?.learnedTechniqueIds?.includes(powerId)}
function canLearnHybridV1721R2(owner,powerId){
  const power=SYNERGY_POWER_BY_ID_V1721R2.get(powerId),path=power&&SYNERGY_PATH_BY_ID_V1721R2.get(power.pathId);if(!power||path?.type!=='Kampf'||learnedHybridV1721R2(owner,powerId)||!powerRequirementsMetV1721R2(owner,path,power))return false;
  const{combatSkillId}=hybridContextV1721R2(path,power),data=owner.skills?.[combatSkillId];return!!data&&data.learnedTechniqueIds.length<combatTechniqueCapacityV176(owner,combatSkillId);
}
function learnHybridV1721R2(owner,powerId){if(!canLearnHybridV1721R2(owner,powerId))return false;const entry=HYBRID_BY_ID_V1721R2.get(powerId);owner.skills[entry.skillId].learnedTechniqueIds.push(powerId);saveOwnerV175(owner,true);return true}
function unlearnHybridV1721R2(owner,powerId){const entry=HYBRID_BY_ID_V1721R2.get(powerId),ids=entry&&owner.skills?.[entry.skillId]?.learnedTechniqueIds,index=ids?.indexOf(powerId)??-1;if(index<0)return false;ids.splice(index,1);saveOwnerV175(owner,true);return true}
function hybridStatusV1721R2(owner,power){const path=SYNERGY_PATH_BY_ID_V1721R2.get(power.pathId),learned=learnedHybridV1721R2(owner,power.id),requirements=powerRequirementsMetV1721R2(owner,path,power);if(learned&&!requirements)return'prerequisite';if(learned)return'learned';return requirements?'available':'locked'}

const techniquePaymentBeforeV1721R2=techniquePaymentV1721;
techniquePaymentV1721=function(owner,entry){
  if(!entry?.synergyHybridV1721R2)return techniquePaymentBeforeV1721R2(owner,entry);
  const round=ensureCombatRoundV1721(owner),first=!round.payments.some(payment=>payment.kind==='technique'),nominal=Math.max(1,+entry.staminaCost||1),due=first?Math.max(0,nominal-round.paidCost):nominal;
  return{first,discount:0,nominal,due};
};
function hybridPaymentComponentsV1721R2(owner,entry){const payment=techniquePaymentV1721(owner,entry),components=entry.synergyCosts.filter(part=>part.counterId!=='A');if(payment.due)components.unshift({counterId:'A',amount:payment.due});return{payment,components:actionCounterComponentsV1712R2(components)}}
const useTechniqueBeforeV1721R2=useTechniqueV1721;
useTechniqueV1721=function(owner,techniqueId,options={}){
  const entry=HYBRID_BY_ID_V1721R2.get(techniqueId);if(!entry)return useTechniqueBeforeV1721R2(owner,techniqueId,options);
  const power=SYNERGY_POWER_BY_ID_V1721R2.get(techniqueId),path=power&&SYNERGY_PATH_BY_ID_V1721R2.get(power.pathId),round=ensureCombatRoundV1721(owner);
  if(!entry||!owner.skills?.[entry.skillId]?.learnedTechniqueIds?.includes(entry.id)||!powerRequirementsMetV1721R2(owner,path,power))return false;
  if(/einmal pro Runde/i.test(entry.limits)&&round.usedTechniqueIds.includes(entry.id)){if(options.notify!==false)showToastV179('Diese Hybridtechnik wurde in der offenen Runde bereits eingesetzt.');return false}
  const{payment,components}=hybridPaymentComponentsV1721R2(owner,entry),plan=actionPaymentPlanV1712R2(owner,components);if(!plan.valid){if(options.notify!==false)showToastV179(`Für ${entry.name} fehlen Ressourcen.`);return false}
  const beforePaidCost=round.paidCost,beforeMode=round.mode,transaction=commitActionPaymentV1712R2(owner,components,entry.id,`${entry.name} einsetzen`,{persist:false,notify:false,render:false,debounce:options.debounce!==false});if(!transaction)return false;
  round.mode='physical';round.paidCost=payment.first?Math.max(round.paidCost,payment.nominal):round.paidCost+payment.nominal;round.usedTechniqueIds.push(entry.id);round.payments.push({kind:'technique',id:entry.id,name:entry.name,due:payment.due,nominal:payment.nominal,beforePaidCost,beforeMode,transactionId:transaction.id,changes:structuredClone(transaction.changes)});owner.combatRoundUndoV1721=null;
  if(options.persist!==false)saveOwnerV173(owner,options.render!==false);if(options.notify!==false)showActionPaymentToastV1712R2(transaction);return transaction;
};
const combatTechniqueActionBeforeV1721R2=combatTechniqueActionV1712R2;
combatTechniqueActionV1712R2=function(entry,owner){
  if(!entry?.synergyHybridV1721R2)return combatTechniqueActionBeforeV1721R2(entry,owner);
  const path=entry.synergyPath,power=SYNERGY_POWER_BY_ID_V1721R2.get(entry.id),roll=synergyRollSummaryV1721R2(owner,path);
  return actionDisclosureV1712R2(`Hybridtechnik einsetzen · ${costPhraseV1721R2(power.cost)}`,`${entry.name}: Hybridtechnik vorbereiten`,host=>{
    const{payment,components}=hybridPaymentComponentsV1721R2(owner,entry),plan=actionPaymentPlanV1712R2(owner,components),requirements=powerRequirementsMetV1721R2(owner,path,power),preparedBinding=/vorbereitete.*Bindung/i.test(power.cost);
    host.append(el('strong',{text:`${entry.name} – Einsatz bestätigen`}),el('p',{text:`Ein Synergiewurf: ${roll.attributeText} + Fähigkeitswürfel der wirksamen Kampfstufe. Der magische Zusatz ist auf S ${roll.s}, ${roll.die} und B ${roll.b} begrenzt.`}),el('p',{class:'muted',text:`Der erste A-Wert ist der gesamte körperliche Rundenpreis. Hybridtechniken erhalten keinen Meisterschaftsrabatt. ${payment.first?'Erste Technik dieser Runde.':'Weitere Technik derselben Runde.'}`}));appendPaymentSummaryV1712R2(host,plan,components);
    if(preparedBinding)host.append(el('p',{class:'notice',text:'Voraussetzung: Eine passende Runenbindung muss bereits vorbereitet sein. Der Builder bucht hier nur die Ausdauer des Einsatzes; Auswahl und Verbrauch der vorbereiteten Rune werden nach ihrem Krafttext geführt.'}));
    host.append(el('button',{type:'button',class:'primary',text:'Hybridtechnik einsetzen und Kosten abziehen',disabled:!requirements||!plan.valid,onclick:()=>useTechniqueV1721(owner,entry.id)}));
  });
};
const refillOwnerBeforeV1721R2=refillOwnerV179;
refillOwnerV179=function(owner,camp=false,options={}){
  const result=refillOwnerBeforeV1721R2(owner,camp,{...options,persist:false,render:false,notify:false});if(!result)return false;
  for(const[counterId,amount]of boundResourceTotalsV1721R2(owner)){const counter=owner.counters?.[counterId];if(counter)counter.current=Math.min(Math.max(0,+counter.current||0),Math.max(0,(+counter.max||0)-amount))}
  if(options.persist!==false)saveOwnerV173(owner,options.render!==false);if(options.notify!==false)showToastV179(camp?'Lagerrast abgeschlossen: gebundene Synergieressourcen bleiben reserviert.':'Rast abgeschlossen: gebundene Synergieressourcen bleiben reserviert.');return true;
};
Object.defineProperty(refillOwnerV179,'busy',{configurable:true,get:()=>!!refillOwnerBeforeV1721R2.busy,set:value=>{refillOwnerBeforeV1721R2.busy=!!value}});
const undoActionPaymentBeforeV1721R2=undoActionPaymentV1712R2;
undoActionPaymentV1712R2=function(transactionId=lastActionPaymentV1712R2?.id,options={}){
  const owners=ownerListV178(state),boundOwner=owners.find(owner=>activeSynergyBindingsV1721R2(owner).some(binding=>binding.transactionId===transactionId)),result=undoActionPaymentBeforeV1721R2(transactionId,{...options,render:false});
  if(result&&boundOwner){boundOwner.catalogSynergiesV1721R2.bindings=boundOwner.catalogSynergiesV1721R2.bindings.filter(binding=>binding.transactionId!==transactionId);if(options.persist!==false)saveOwnerV173(boundOwner,options.render!==false)}return result;
};
const renderCombatLibraryBeforeV1721R2=renderCombatTechniqueLibraryV176;
renderCombatTechniqueLibraryV176=function(owner){const box=renderCombatLibraryBeforeV1721R2(owner),badge=box.querySelector('.combat-tech-head-v176 .power-badge-v176'),learning=[...box.querySelectorAll('.combat-tech-rule-v176')].find(node=>node.querySelector('strong')?.textContent==='Lernplätze');if(badge)badge.textContent='56 Grundtechniken + 82 Hybridtechniken';if(learning)learning.querySelector('span').textContent='Kaufstufen 1/6/8/11/16/17/21/25 geben die gemeinsamen Plätze für normale und hybride Techniken. Hybride werden im Synergiekatalog bei 6/5 und 16/15 gelernt.';return box};

function statusLabelV1721R2(status){return({hidden:'Nicht entdeckt',discovered:'Entdeckt',open:'Geöffnet',available:'Lernbar',learned:'Gelernt',resting:'Ruhend',prerequisite:'Voraussetzung verloren',locked:'Gesperrt'})[status]||status}
function powerStatusV1721R2(owner,path,power){return path.type==='Schule'?schoolPowerStatusV1721R2(owner,power):hybridStatusV1721R2(owner,power)}
function pathHasLearnedV1721R2(owner,path){return(SYNERGY_POWERS_BY_PATH_V1721R2.get(path.id)||[]).some(power=>['learned','resting','prerequisite'].includes(powerStatusV1721R2(owner,path,power)))}
function pathHasDormantV1721R2(owner,path){return(SYNERGY_POWERS_BY_PATH_V1721R2.get(path.id)||[]).some(power=>['resting','prerequisite'].includes(powerStatusV1721R2(owner,path,power)))}
function pathMatchesStatusV1721R2(owner,path,status){const discovery=pathDiscoveryV1721R2(owner,path);if(status==='all')return true;if(status==='relevant')return discovery!=='hidden'||pathHasLearnedV1721R2(owner,path);if(status==='discovered')return discovery==='discovered';if(status==='open')return discovery==='open';if(status==='learned')return pathHasLearnedV1721R2(owner,path);if(status==='dormant')return pathHasDormantV1721R2(owner,path);return true}

function renderSynergyPowerV1721R2(owner,path,power){
  const status=powerStatusV1721R2(owner,path,power),row=el('article',{class:`catalog-synergy-power-v1721r2 status-${status}`}),head=el('div',{class:'catalog-synergy-power-head-v1721r2'}),actions=el('div',{class:'catalog-synergy-actions-v1721r2 edit-only'}),detail=el('div',{class:'catalog-synergy-detail-v1721r2',hidden:true}),toggle=el('button',{type:'button',text:'Details','aria-expanded':'false'});
  head.append(el('div',{},[el('strong',{text:`${power.slot}. ${power.name}`}),el('small',{text:`Schwelle ${power.threshold} · ${power.cost||'Kosten im Text'} · ${statusLabelV1721R2(status)}`})]),el('span',{class:`catalog-synergy-status-v1721r2 status-${status}`,text:statusLabelV1721R2(status)}));
  toggle.onclick=()=>{const opening=detail.hidden;detail.hidden=!opening;toggle.textContent=opening?'Details schließen':'Details';toggle.setAttribute('aria-expanded',String(opening))};actions.append(toggle);
  if(path.type==='Schule'){
    if(status==='available')actions.append(el('button',{type:'button',class:'primary',text:'Lernen',disabled:!canLearnSchoolPowerV1721R2(owner,power.id),onclick:()=>learnSchoolPowerV1721R2(owner,power.id)}));
    if(status==='learned')actions.append(el('button',{type:'button',text:'Ruhen lassen',onclick:()=>restSchoolPowerV1721R2(owner,power.id,true)}));
    if(status==='resting')actions.append(el('button',{type:'button',text:'Aktivieren',disabled:activeSchoolPowerIdsV1721R2(owner).length>=schoolSynergyCapacityV1721R2(owner)||!powerRequirementsMetV1721R2(owner,path,power),onclick:()=>restSchoolPowerV1721R2(owner,power.id,false)}));
    if(['learned','resting','prerequisite'].includes(status)){const bindings=activeSynergyBindingsV1721R2(owner,power.id);actions.append(el('button',{type:'button',class:'danger',text:bindings.length?'Bindung vor Verlernen lösen':'Verlernen',disabled:bindings.length>0,onclick:()=>{if(confirm(`„${power.name}“ wirklich verlernen?`))unlearnSchoolPowerV1721R2(owner,power.id)}}))}
  }else{
    if(status==='available')actions.append(el('button',{type:'button',class:'primary',text:'In Technikplatz lernen',disabled:!canLearnHybridV1721R2(owner,power.id),onclick:()=>learnHybridV1721R2(owner,power.id)}));
    if(['learned','prerequisite'].includes(status))actions.append(el('button',{type:'button',class:'danger',text:'Verlernen',onclick:()=>{if(confirm(`„${power.name}“ wirklich verlernen?`))unlearnHybridV1721R2(owner,power.id)}}));
  }
  detail.append(el('p',{text:power.text||''}));if(power.checks?.length)detail.append(el('p',{class:'muted',text:'Prüfhinweise: '+power.checks.join(' · ')}));if(path.type==='Schule'&&status==='learned')detail.append(synergySchoolActionV1721R2(owner,path,power));
  row.append(head,actions,detail);return row;
}
function renderSynergyPathV1721R2(owner,path){
  const discovery=pathDiscoveryV1721R2(owner,path),learned=pathHasLearnedV1721R2(owner,path),node=el('details',{class:`catalog-synergy-path-v1721r2 path-${discovery}`}),summary=el('summary'),status=learned?'Gelernt':statusLabelV1721R2(discovery);
  if(learned)node.open=true;
  summary.append(el('div',{},[el('strong',{text:path.name}),el('small',{text:`${path.type} · ${path.profile} · ${pathParentLabelV1721R2(owner,path)}`})]),el('span',{class:`catalog-synergy-status-v1721r2 path-${discovery}`,text:status}));node.append(summary);
  const body=el('div',{class:'catalog-synergy-path-body-v1721r2'});body.append(el('p',{text:path.concept}),el('p',{class:'muted',text:`Grundwerte: ${path.attributes.join(' + ')} · Stabile ID: ${path.id}`}));if(path.context)body.append(el('p',{text:path.context}));
  for(const power of SYNERGY_POWERS_BY_PATH_V1721R2.get(path.id)||[])body.append(renderSynergyPowerV1721R2(owner,path,power));node.append(body);return node;
}
function renderCatalogSynergiesV1721R2(owner){
  ensureOwnerSynergiesV1721R2(owner);const capacity=schoolSynergyCapacityV1721R2(owner),active=activeSchoolPowerIdsV1721R2(owner).length,learned=learnedSchoolIdsV1721R2(owner).length,overage=schoolPoolOverageV1721R2(owner),section=el('section',{class:'catalog-synergies-v1721r2'}),head=el('div',{class:'catalog-synergy-heading-v1721r2'}),controls=el('div',{class:'filters catalog-synergy-filters-v1721r2'}),search=el('input',{placeholder:'Synergiepfade und Kräfte suchen…','aria-label':'Synergiekatalog durchsuchen'}),type=el('select',{'aria-label':'Synergietyp'}),status=el('select',{'aria-label':'Synergiestatus'}),list=el('div',{class:'catalog-synergy-list-v1721r2'});
  head.append(el('div',{},[el('h3',{text:'Katalogisierte Synergien'}),el('p',{class:'muted',text:'132 Pfade · 263 Schulkräfte · 82 Hybridtechniken · Releasefassung für 1.7.21-r2'})]),el('div',{class:'catalog-synergy-pool-v1721r2'},[el('strong',{text:`Schulpool ${active}/${capacity}`}),el('span',{text:`${learned} gelernt`})]));section.append(head);
  if(overage)section.append(el('p',{class:'notice error',text:`${overage} aktive Schulsynergie${overage===1?'':'n'} über der aktuellen Kapazität. Lege bewusst Inhalte schlafen; bis dahin gelten die überzähligen Einsätze als ungeklärt.`}));
  type.append(el('option',{value:'all',text:'Schule und Kampf'}),el('option',{value:'Schule',text:'Schulsynergien'}),el('option',{value:'Kampf',text:'Kampfsynergien'}));
  for(const[value,label]of[['relevant','Relevant'],['open','Geöffnet'],['learned','Gelernt'],['dormant','Ruhend'],['discovered','Entdeckt'],['all','Gesamtkatalog']])status.append(el('option',{value,text:label}));controls.append(search,type,status);section.append(controls,list);
  const draw=()=>{const query=search.value.trim().toLocaleLowerCase('de'),filtered=SYNERGY_PATHS_V1721R2.filter(path=>(type.value==='all'||path.type===type.value)&&pathMatchesStatusV1721R2(owner,path,status.value)&&(!query||[path.name,path.concept,...path.parents,...(SYNERGY_POWERS_BY_PATH_V1721R2.get(path.id)||[]).flatMap(power=>[power.name,power.text])].join(' ').toLocaleLowerCase('de').includes(query)));list.replaceChildren(...filtered.map(path=>renderSynergyPathV1721R2(owner,path)));if(!filtered.length)list.append(el('p',{class:'muted',text:status.value==='relevant'?'Noch keine passenden Pfade. Kaufe beide Elternfähigkeiten mindestens auf Stufe 1 oder öffne den Gesamtkatalog.':'Keine Pfade entsprechen diesem Filter.'}))};
  search.oninput=draw;type.onchange=draw;status.onchange=draw;draw();return section;
}

const renderFatePathsBeforeV1721R2=renderFatePathsV175;
renderFatePathsV175=function(owner){const box=renderFatePathsBeforeV1721R2(owner);box.append(renderCatalogSynergiesV1721R2(owner));return box};
const skillLevelSignaturesV1721R2=new WeakMap();
function skillLevelSignatureV1721R2(owner){return SKILLS.map(skill=>+owner?.skills?.[skill.id]?.level||0).join('|')}
for(const owner of ownerListV178(state))skillLevelSignaturesV1721R2.set(owner,skillLevelSignatureV1721R2(owner));
const persistOwnerBeforeV1721R2=persistOwnerR5;
persistOwnerR5=function(owner,rerender=false){const before=skillLevelSignaturesV1721R2.get(owner),result=persistOwnerBeforeV1721R2(owner,rerender),after=skillLevelSignatureV1721R2(owner);skillLevelSignaturesV1721R2.set(owner,after);if(!rerender&&before!==undefined&&before!==after)renderCards();return result};

const ownerHasPrintableBeforeV1721R2=ownerHasPrintableContentR15,hasPrintableBeforeV1721R2=hasPrintableContentR15;
function ownerHasCatalogSynergiesV1721R2(owner){ensureOwnerSynergiesV1721R2(owner);if(learnedSchoolIdsV1721R2(owner).length)return true;return HYBRID_ENTRIES_V1721R2.some(entry=>owner.skills?.[entry.skillId]?.learnedTechniqueIds?.includes(entry.id))}
ownerHasPrintableContentR15=function(owner,isCharacter=false){return ownerHasCatalogSynergiesV1721R2(owner)||ownerHasPrintableBeforeV1721R2(owner,isCharacter)};
hasPrintableContentR15=function(card,owner,isCharacter=owner===ch()){if(card.type==='fatePath'&&ownerHasCatalogSynergiesV1721R2(owner))return true;return hasPrintableBeforeV1721R2(card,owner,isCharacter)};

const auditBeforeV1721R2=audit;
audit=function(){auditBeforeV1721R2();auditResults.append(el('h3',{text:'Katalogisierte Synergien v1.7.21-r2'}),el('div',{class:'notice '+(SYNERGY_VALIDATION_V1721R2.ok?'ok':'error'),text:`${SYNERGY_VALIDATION_V1721R2.ok?'✓':'✕'} ${SYNERGY_PATHS_V1721R2.length} Pfade · ${SYNERGY_POWERS_V1721R2.length} Inhalte · ${HYBRID_ENTRIES_V1721R2.length} Hybridtechniken`}));for(const owner of ownerListV178()){ensureOwnerSynergiesV1721R2(owner);const unknown=learnedSchoolIdsV1721R2(owner).filter(id=>!SYNERGY_POWER_BY_ID_V1721R2.has(id)),over=schoolPoolOverageV1721R2(owner);auditResults.append(el('div',{class:'notice '+(!unknown.length&&!over?'ok':'error'),text:`${!unknown.length&&!over?'✓':'⚠'} ${owner.name||owner.type||'Charakter'}: Schulpool ${activeSchoolPowerIdsV1721R2(owner).length}/${schoolSynergyCapacityV1721R2(owner)}${over?` · ${over} über Kapazität`:''}${unknown.length?` · ${unknown.length} unbekannte IDs`:''}`}))}};

const synergyStyleV1721R2=el('style',{text:`
.catalog-synergies-v1721r2{margin-top:1rem;border-top:2px solid var(--accent-2);padding-top:.8rem}.catalog-synergy-heading-v1721r2{display:flex;justify-content:space-between;gap:.8rem;align-items:flex-start}.catalog-synergy-heading-v1721r2 h3{margin:.1rem 0}.catalog-synergy-pool-v1721r2{display:flex;flex-direction:column;gap:.1rem;padding:.45rem .65rem;border:1px solid var(--accent-2);border-radius:8px;background:var(--panel-alt);white-space:nowrap}.catalog-synergy-filters-v1721r2{display:grid;grid-template-columns:minmax(12rem,1fr) auto auto}.catalog-synergy-list-v1721r2{display:grid;gap:.55rem}.catalog-synergy-path-v1721r2{border:1px solid var(--border);border-radius:9px;background:var(--panel-alt)}.catalog-synergy-path-v1721r2>summary{display:flex;justify-content:space-between;gap:.7rem;align-items:center;padding:.65rem;cursor:pointer}.catalog-synergy-path-v1721r2>summary div{display:grid;gap:.1rem}.catalog-synergy-path-body-v1721r2{display:grid;gap:.5rem;padding:0 .65rem .7rem}.catalog-synergy-power-v1721r2{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:.5rem;padding:.6rem;border:1px solid var(--border);border-radius:8px;background:var(--panel-bg)}.catalog-synergy-power-head-v1721r2{display:flex;justify-content:space-between;gap:.5rem}.catalog-synergy-power-head-v1721r2>div{display:grid;gap:.1rem}.catalog-synergy-status-v1721r2{align-self:start;padding:.14rem .4rem;border:1px solid var(--border);border-radius:999px;font-size:.72rem;white-space:nowrap}.catalog-synergy-status-v1721r2.status-learned,.catalog-synergy-status-v1721r2.path-open{border-color:var(--ok);color:var(--ok)}.catalog-synergy-status-v1721r2.status-resting,.catalog-synergy-status-v1721r2.status-prerequisite{border-color:var(--warn);color:var(--warn)}.catalog-synergy-actions-v1721r2{display:flex;gap:.35rem;flex-wrap:wrap;justify-content:flex-end}.catalog-synergy-detail-v1721r2{grid-column:1/-1}.catalog-synergy-detail-v1721r2 p{white-space:pre-line}.catalog-synergy-power-v1721r2.status-locked{opacity:.75}@media(max-width:760px){.catalog-synergy-heading-v1721r2{display:grid}.catalog-synergy-filters-v1721r2{grid-template-columns:1fr}.catalog-synergy-power-v1721r2{grid-template-columns:1fr}.catalog-synergy-actions-v1721r2{justify-content:flex-start}.catalog-synergy-power-head-v1721r2{align-items:flex-start}}@media print{.catalog-synergy-filters-v1721r2,.catalog-synergy-actions-v1721r2{display:none!important}.catalog-synergy-path-v1721r2:not([open]){display:none}.catalog-synergy-power-v1721r2.status-locked,.catalog-synergy-power-v1721r2.status-available{display:none}}
`});document.head.append(synergyStyleV1721R2);

const runTestsBeforeV1721R2=runTests;
function runTestsV1721R2(){
  try{runTestsBeforeV1721R2()}catch(error){console.error('Alte integrierte Tests',error)}
  const body=testResults.querySelector('tbody'),obsolete=/^(Schema 26|Regelstand 12|Revision v1\.7\.21 r1)/;
  for(const row of[...body.querySelectorAll('tr')])if(obsolete.test(row.cells[0]?.textContent||''))row.remove();
  const tests=[],eq=(name,expected,actual)=>tests.push([name,expected,actual,expected===actual]);
  eq('Revision v1.7.21 r2','r2',V1721R2_REVISION);eq('Schema 27',27,SCHEMA_VERSION);eq('Regelstand 13',13,RULES_VERSION);eq('132 Synergiepfade',132,SYNERGY_PATHS_V1721R2.length);eq('91 Schulpfade',91,SCHOOL_PATHS_V1721R2.length);eq('41 Kampfpfade',41,COMBAT_PATHS_V1721R2.length);eq('345 Synergieinhalte',345,SYNERGY_POWERS_V1721R2.length);eq('82 Hybridtechniken',82,HYBRID_ENTRIES_V1721R2.length);eq('Katalog strukturell gültig',true,SYNERGY_VALIDATION_V1721R2.ok);
  eq('Releasekatalog aktiv','release',SYNERGY_DB_V1721R2.meta.releaseStage);eq('Z11-Finstermal freigegeben',true,!!Z11_FINSTERMAL_V1721R2?.publishable);eq('Z11-Finstermal kostet 2/3/4 FS','2|3|4',[0,1,2].map(value=>z11FinstermalComponentsV1721R2(value)[0].amount).join('|'));
  eq('Acht Runen-Hybride verwenden eine vorbereitete Bindung',8,HYBRID_ENTRIES_V1721R2.filter(entry=>/vorbereitete.*Bindung/i.test(entry.activation)).length);
  const totemDebt=SYNERGY_POWER_BY_ID_V1721R2.get('synergy_school_019_p05');eq('Totemschuld bucht Bund und späteren Erneuerungstag getrennt','GB:1',costPartsV1721R2(totemDebt.cost).map(part=>`${part.counterId}:${part.amount}`).join('|'));
  const bloodStand=SYNERGY_POWER_BY_ID_V1721R2.get('synergy_combat_103_p01');eq('Opferstand bucht eigene LP atomar','A:2|FS:1|L:1',costPartsV1721R2(bloodStand.cost).map(part=>`${part.counterId}:${part.amount}`).join('|'));
  const schoolPath=SCHOOL_PATHS_V1721R2[0],schoolOwner=newCharacter();schoolOwner.skills[schoolPath.parentSkillIds[0]].level=10;schoolOwner.skills[schoolPath.parentSkillIds[1]].level=15;eq('Schulpfad 10/15 ist geöffnet','open',pathDiscoveryV1721R2(schoolOwner,schoolPath));eq('Schulpool bei 10/15 besitzt zwei Plätze',2,schoolSynergyCapacityV1721R2(schoolOwner));const firstSchool=SYNERGY_POWERS_BY_PATH_V1721R2.get(schoolPath.id)[0];eq('Erste Schulkraft ist lernbar',true,canLearnSchoolPowerV1721R2(schoolOwner,firstSchool.id));learnSchoolPowerV1721R2(schoolOwner,firstSchool.id);eq('Gelernte Schulkraft gespeichert',true,learnedSchoolIdsV1721R2(schoolOwner).includes(firstSchool.id));restSchoolPowerV1721R2(schoolOwner,firstSchool.id,true);eq('Bewusster Ruhezustand gespeichert','resting',schoolPowerStatusV1721R2(schoolOwner,firstSchool));
  const combatPath=COMBAT_PATHS_V1721R2[0],hybridOwner=newCharacter(),hybridPower=SYNERGY_POWERS_BY_PATH_V1721R2.get(combatPath.id)[0],hybrid=hybridContextV1721R2(combatPath,hybridPower);hybridOwner.skills[hybrid.combatSkillId].level=6;hybridOwner.skills[hybrid.schoolSkillId].level=5;eq('Erste Hybridtechnik bei 6/5 lernbar',true,canLearnHybridV1721R2(hybridOwner,hybridPower.id));learnHybridV1721R2(hybridOwner,hybridPower.id);eq('Hybrid belegt normalen Technikplatz',1,hybridOwner.skills[hybrid.combatSkillId].learnedTechniqueIds.length);eq('Hybrid ist im gemeinsamen Technikregister',true,COMBAT_BY_ID_V178.has(hybridPower.id));
  hybridOwner.counters.A={max:10,current:10};hybridOwner.counters.M={max:10,current:10};hybridOwner.counters.GB={max:10,current:10};hybridOwner.counters.FS={max:10,current:10};const hybridCosts=hybridPaymentComponentsV1721R2(hybridOwner,hybrid.entry),hybridBefore=Object.fromEntries(hybridCosts.components.map(part=>[part.counterId,hybridOwner.counters[part.counterId].current]));useTechniqueV1721(hybridOwner,hybridPower.id,{persist:false,notify:false,debounce:false});eq('Hybrid bucht A und übernatürliche Kosten atomar',true,hybridCosts.components.every(part=>hybridOwner.counters[part.counterId].current===hybridBefore[part.counterId]-part.amount));
  const boundPower=SYNERGY_POWERS_V1721R2.find(power=>SYNERGY_PATH_BY_ID_V1721R2.get(power.pathId)?.type==='Schule'&&boundCostPartsV1721R2(power.cost).length),boundPath=SYNERGY_PATH_BY_ID_V1721R2.get(boundPower.pathId),boundOwner=newCharacter(),boundThreshold=thresholdValuesV1721R2(boundPower.threshold);boundOwner.skills[boundPath.parentSkillIds[0]].level=boundThreshold.first;boundOwner.skills[boundPath.parentSkillIds[1]].level=boundThreshold.second;boundOwner.catalogSynergiesV1721R2.learnedSchoolPowerIds=[boundPower.id];for(const id of['M','GB','FS'])boundOwner.counters[id]={max:20,current:20};const boundParts=boundCostPartsV1721R2(boundPower.cost),beforeBound=Object.fromEntries(boundParts.map(part=>[part.counterId,boundOwner.counters[part.counterId].current]));useSchoolSynergyV1721R2(boundOwner,boundPower.id,{persist:false,notify:false,debounce:false});eq('Gebundene Schulkraft legt Bindungsdatensatz an',1,activeSynergyBindingsV1721R2(boundOwner,boundPower.id).length);refillOwnerV1710.busy=false;refillOwnerV179(boundOwner,false,{persist:false,notify:false,confirm:false});eq('Rast füllt gebundene Ressourcen nicht auf',true,boundParts.every(part=>boundOwner.counters[part.counterId].current<=boundOwner.counters[part.counterId].max-part.amount));const binding=activeSynergyBindingsV1721R2(boundOwner,boundPower.id)[0];releaseSynergyBindingV1721R2(boundOwner,binding.id);eq('Gelöste Bindung gibt Ressource wieder frei',true,boundParts.every(part=>boundOwner.counters[part.counterId].current===beforeBound[part.counterId]));
  for(const test of tests)body.append(el('tr',{},[test[0],test[1],test[2],test[3]?'Bestanden':'Fehler'].map(value=>el('td',{text:String(value)}))));
  return[...body.querySelectorAll('tr')].every(row=>row.cells[row.cells.length-1]?.textContent==='Bestanden');
}
runTests=runTestsV1721R2;testsBtn.onclick=runTestsV1721R2;

document.querySelector('.brand small').textContent='v1.7.21-r2';
renderAll();save();
Object.assign(window.Eberos,{version:V1721R2_VERSION,revision:V1721R2_REVISION,schemaVersion:V1721R2_SCHEMA,rulesVersion:V1721R2_RULES,synergyCatalog:SYNERGY_DB_V1721R2,synergyValidation:SYNERGY_VALIDATION_V1721R2,schoolSynergyCapacity:schoolSynergyCapacityV1721R2,learnSchoolSynergy:learnSchoolPowerV1721R2,restSchoolSynergy:restSchoolPowerV1721R2,useSchoolSynergy:useSchoolSynergyV1721R2,learnHybridSynergy:learnHybridV1721R2,useTechnique:useTechniqueV1721,z11Finstermal:Z11_FINSTERMAL_V1721R2,releaseSynergyBinding:releaseSynergyBindingV1721R2,refillOwner:refillOwnerV179,runTests:runTestsV1721R2});
