'use strict';

/* Eberos v1.7.8 r4: Kampfsystem, eigene Fähigkeiten und Schema 17 */
const V178_VERSION='1.7.8',V178_SCHEMA=17,V178_RULES=7;
const RETIRED_SKILLS_V178=new Map([['skill_0','Initiative'],['skill_4','Kampf – Hinterhalt']]);
const SYSTEM_SKILLS_BEFORE_V178=SKILLS.length;
for(let index=SKILLS.length-1;index>=0;index--)if(RETIRED_SKILLS_V178.has(SKILLS[index].id))SKILLS.splice(index,1);
const SYSTEM_SKILL_IDS_V178=new Set(SKILLS.map(skill=>skill.id));
const SYSTEM_SKILL_NAMES_V178=new Set(SKILLS.map(skill=>skill.name.toLocaleLowerCase('de')));
const ATTRIBUTE_IDS_V178=ATTRS.map(([id])=>id),ATTRIBUTE_ID_SET_V178=new Set(ATTRIBUTE_IDS_V178);
const SYSTEM_SKILL_COUNT_V178=SKILLS.length;
const raufenSkillV178=SKILLS.find(skill=>skill.id==='skill_3');
if(raufenSkillV178&&!/Ersticken|Würgen/.test(raufenSkillV178.scope||''))raufenSkillV178.scope=`${raufenSkillV178.scope||''} Umfasst außerdem Packen, Festhalten, Niederdrücken, Befreiungsversuche, Würgegriffe und das regelgerechte Anwenden des Zustands Erstickend.`.trim();

const COMBAT_DB_V178=window.EBEROS_COMBAT_TECHNIQUE_DB_V178||{meta:{},unlockLevels:[],schools:[],entries:[]};
const COMBAT_ENTRIES_V178=Array.isArray(COMBAT_DB_V178.entries)?COMBAT_DB_V178.entries:[];
const COMBAT_SCHOOLS_V178=Array.isArray(COMBAT_DB_V178.schools)?COMBAT_DB_V178.schools:[];
const COMBAT_BY_ID_V178=new Map(COMBAT_ENTRIES_V178.map(entry=>[entry.id,entry]));
const COMBAT_SKILL_IDS_V178=new Set(COMBAT_SCHOOLS_V178.map(school=>school.skillId));
const COMBAT_LEGACY_ID_V178=new Map(COMBAT_ENTRIES_V178.flatMap(entry=>(entry.legacyIds||[]).map(id=>[id,entry.id])));

function validateCombatCatalogV178(){
  const errors=[],ids=new Set();
  if(COMBAT_SCHOOLS_V178.length!==7)errors.push(`7 Schulen erwartet, ${COMBAT_SCHOOLS_V178.length} gefunden`);
  if(COMBAT_ENTRIES_V178.length!==56)errors.push(`56 Techniken erwartet, ${COMBAT_ENTRIES_V178.length} gefunden`);
  if(COMBAT_DB_V178.unlockLevels?.join('|')!=='1|6|8|11|16|17|21|25')errors.push('Freischaltschwellen sind nicht 1/6/8/11/16/17/21/25');
  for(const school of COMBAT_SCHOOLS_V178){
    const entries=COMBAT_ENTRIES_V178.filter(entry=>entry.skillId===school.skillId).sort((a,b)=>Number(a.code.slice(1))-Number(b.code.slice(1)));
    if(entries.map(entry=>entry.code).join('|')!=='K1|K2|K3|K4|K5|K6|K7|K8')errors.push(`${school.skillName}: K1 bis K8 unvollständig`);
  }
  for(const entry of COMBAT_ENTRIES_V178){
    if(!entry.id||ids.has(entry.id))errors.push(`Doppelte Technik-ID ${entry.id||'—'}`);ids.add(entry.id);
    if(entry.minLevel!==1)errors.push(`${entry.id}: Mindeststufe ist nicht 1`);
    if(!entry.activation||!entry.effect||!entry.check||!entry.limits||!entry.scaling)errors.push(`${entry.id}: Regeltext unvollständig`);
  }
  return{ok:!errors.length,errors,ids:ids.size};
}
const COMBAT_VALIDATION_V178=validateCombatCatalogV178();
if(!COMBAT_VALIDATION_V178.ok)showError('Kampftechnik-Katalog v1.7.8 fehlerhaft: '+COMBAT_VALIDATION_V178.errors.join(' · '));

const styleV178=el('style',{text:`
.custom-skill-toolbar-v178{display:flex;gap:.45rem;align-items:center;flex-wrap:wrap}.custom-skill-badge-v178{display:inline-flex;margin-left:.35rem;padding:.12rem .42rem;border:1px solid var(--accent-2);border-radius:999px;font-size:.72rem;color:var(--accent)}
.custom-skill-actions-v178{display:flex;gap:.3rem;flex-wrap:wrap}.custom-skill-dialog-v178{width:min(760px,96vw)}.custom-skill-form-v178{display:grid;gap:.7rem}.custom-skill-attributes-v178{display:grid;grid-template-columns:1fr 1fr;gap:.6rem}.custom-skill-error-v178{color:var(--danger);font-weight:700}.custom-skill-archive-v178{display:grid;gap:.55rem}.custom-skill-archive-row-v178{display:flex;justify-content:space-between;gap:.6rem;align-items:center;padding:.6rem;border:1px solid var(--border);border-radius:8px;background:var(--panel-alt)}
.initiative-roll-v178{display:block;margin-top:.2rem;font-family:var(--font-number);font-size:.86rem}.combat-tech-over-v178{border-left:4px solid var(--danger);padding:.5rem;background:var(--panel-alt)}.combat-rule-wide-v178{grid-column:1/-1}.combat-tech-library-v176 .power-badge-v176{white-space:nowrap}
@media(max-width:760px){.custom-skill-attributes-v178{grid-template-columns:1fr}.custom-skill-actions-v178 button{min-height:44px}.custom-skill-archive-row-v178{align-items:flex-start;flex-direction:column}}
@media print{.custom-skill-toolbar-v178,.custom-skill-actions-v178{display:none!important}}
`});document.head.append(styleV178);

function cloneV178(value){return value===undefined?undefined:structuredClone(value)}
function ownerListV178(data=state){return(data.characters||[]).flatMap(character=>[character,...(character.auxiliaryTabs||[]).filter(owner=>owner.type!=='possession')])}
function skillStateV178(raw){
  if(typeof raw==='number')return{level:Math.max(0,Math.min(25,+raw||0)),fav:false,note:'',learnedPowerIds:[],learnedTechniqueIds:[]};
  const value=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw:{};
  value.level=Math.max(0,Math.min(25,+value.level||0));value.fav=!!value.fav;value.note=String(value.note||'');
  value.learnedPowerIds=Array.isArray(value.learnedPowerIds)?[...new Set(value.learnedPowerIds.filter(id=>typeof id==='string'))]:[];
  value.learnedTechniqueIds=Array.isArray(value.learnedTechniqueIds)?[...new Set(value.learnedTechniqueIds.filter(id=>typeof id==='string'))]:[];
  return value;
}
function attributePairV178(raw){
  const source=Array.isArray(raw?.attributeIds)?raw.attributeIds:Array.isArray(raw?.attributes)?raw.attributes:String(raw?.attrs||raw?.attributeIds||'').match(/[A-Z]{1,2}/g)||[];
  const ids=source.map(id=>String(id).toUpperCase()).filter(id=>ATTRIBUTE_ID_SET_V178.has(id));
  return ids.length===2&&ids[0]!==ids[1]?ids:null;
}
function normalizeCustomSkillV178(raw,index=0){
  if(!raw||typeof raw!=='object')return null;const name=String(raw.name||raw.label||'').trim(),attributeIds=attributePairV178(raw);
  if(!name||!attributeIds)return null;
  let id=String(raw.id||'').trim();if(!id.startsWith('custom_skill_')||RETIRED_SKILLS_V178.has(id)||SYSTEM_SKILL_IDS_V178.has(id))id='custom_skill_'+uid();
  return{...raw,id,name,category:String(raw.category||'Eigene Fähigkeiten').trim()||'Eigene Fähigkeiten',attributeIds,attrs:attributeIds.join(', '),use:String(raw.use||raw.consumption||'—').trim()||'—',scope:String(raw.scope||raw.description||'').trim(),archived:raw.archived===true,sourceOrder:Number.isFinite(+raw.sourceOrder)?+raw.sourceOrder:SYSTEM_SKILL_COUNT_V178+index};
}
function customSkillsV178(owner,includeArchived=false){return(owner.customSkills||[]).filter(skill=>includeArchived||!skill.archived)}
function allSkillsV178(owner,includeArchived=false){return[...SKILLS,...customSkillsV178(owner,includeArchived)]}
function skillByReferenceV178(owner,reference){return allSkillsV178(owner,true).find(skill=>skill.id===reference||skill.name===reference)||null}
function normalizeLegacySkillsBeforeV178(data){
  const owners=ownerListV178(data);for(const owner of owners){
    if(!owner.skills||typeof owner.skills!=='object'||Array.isArray(owner.skills))continue;
    for(const[key,value]of Object.entries({...owner.skills})){
      const mapped=SKILLS.find(skill=>skill.id===key||skill.name===key)?.id||([...RETIRED_SKILLS_V178].find(([,name])=>name===key)?.[0])||key;
      if(mapped!==key&&!Object.hasOwn(owner.skills,mapped)){owner.skills[mapped]=value;delete owner.skills[key]}
      if(typeof owner.skills[mapped]==='number')owner.skills[mapped]=skillStateV178(owner.skills[mapped]);
    }
    if(owner.counters&&typeof owner.counters==='object')for(const[id,value]of Object.entries(owner.counters))if(typeof value==='number')owner.counters[id]={max:value,current:value};
  }return data;
}
function restoreInitialLegacyNumbersV178(data){
  let raw;try{raw=JSON.parse(window.__EBEROS_PRE_V178_RAW__||'null')}catch{return data}if(!raw)return data;
  const restore=(target,source)=>{if(!target||!source)return;for(const[key,value]of Object.entries(source.skills||{}))if(typeof value==='number'){
    const id=SKILLS.find(skill=>skill.id===key||skill.name===key)?.id||([...RETIRED_SKILLS_V178].find(([,name])=>name===key)?.[0])||key;
    if(!target.skills?.[id]||(+target.skills[id].level||0)===0)target.skills[id]=skillStateV178(value);
  }};
  for(const[characterIndex,target]of(data.characters||[]).entries()){
    const source=(raw.characters||[]).find(item=>item.id&&item.id===target.id)||(raw.characters||[])[characterIndex];restore(target,source);
    for(const[ownerIndex,owner]of(target.auxiliaryTabs||[]).entries()){const old=(source?.auxiliaryTabs||[]).find(item=>item.id&&item.id===owner.id)||(source?.auxiliaryTabs||[])[ownerIndex];restore(owner,old)}
  }return data;
}
function migrateEffectTargetsV178(owner){
  const effects=[...(owner.activeEffectsV177||[])],disadvantages=owner.disadvantages||[];
  const lists=[...effects.map(effect=>effect.modules||[]),...disadvantages.map(item=>item.effectModulesV177||[])];
  for(const modules of lists)for(const module of modules){
    if(module.type==='skill'&&(module.target==='skill_0'||module.target==='Initiative')){module.type='derived';module.target='initiative';module.scope=module.scope||'Migriert von der früheren Initiative-Fähigkeit'}
    else if(module.type==='skill'&&(module.target==='skill_4'||module.target==='Kampf – Hinterhalt')){module.type='rule';module.target='legacy_skill_4';module.scope=module.scope||'Inaktiver Legacy-Hinweis: frühere Fähigkeit Kampf – Hinterhalt'}
  }
}
function ensureOwnerV178(owner,report=null){
  if(!owner||typeof owner!=='object'||owner.type==='possession')return owner;
  owner.skills=owner.skills&&typeof owner.skills==='object'&&!Array.isArray(owner.skills)?owner.skills:{};
  owner.migrations=owner.migrations&&typeof owner.migrations==='object'?owner.migrations:{};
  owner.migrations.v178RetiredSkills=owner.migrations.v178RetiredSkills&&typeof owner.migrations.v178RetiredSkills==='object'?owner.migrations.v178RetiredSkills:{};
  let freed=0;
  for(const[id,name]of RETIRED_SKILLS_V178){if(Object.hasOwn(owner.skills,id)){
    const old=skillStateV178(owner.skills[id]);if(!owner.migrations.v178RetiredSkills[id])owner.migrations.v178RetiredSkills[id]={id,name,data:cloneV178(old),freedCbp:skillCost(old.level),archivedAt:new Date().toISOString()};
    freed+=owner.migrations.v178RetiredSkills[id].freedCbp||0;delete owner.skills[id];
  }}
  const rawCustoms=[...(Array.isArray(owner.customSkills)?owner.customSkills:[]),...(Array.isArray(owner.ownSkills)?owner.ownSkills:[]),...(Array.isArray(owner.userSkills)?owner.userSkills:[])],normalized=[],invalid=[];
  for(const[customIndex,raw]of rawCustoms.entries()){const skill=normalizeCustomSkillV178(raw,customIndex);if(skill&&!normalized.some(entry=>entry.id===skill.id))normalized.push(skill);else if(!skill)invalid.push(cloneV178(raw))}
  owner.customSkills=normalized;delete owner.ownSkills;delete owner.userSkills;
  if(invalid.length)owner.migrations.v178InvalidCustomSkills=[...(owner.migrations.v178InvalidCustomSkills||[]),...invalid];
  for(const skill of SKILLS)owner.skills[skill.id]=skillStateV178(owner.skills[skill.id]);
  for(const skill of owner.customSkills)owner.skills[skill.id]=skillStateV178(owner.skills[skill.id]);
  for(const skillId of COMBAT_SKILL_IDS_V178){owner.skills[skillId]=skillStateV178(owner.skills[skillId]);owner.skills[skillId].learnedTechniqueIds=owner.skills[skillId].learnedTechniqueIds.map(id=>COMBAT_LEGACY_ID_V178.get(id)||id).filter((id,index,list)=>list.indexOf(id)===index)}
  const known=new Set([...SYSTEM_SKILL_IDS_V178,...owner.customSkills.map(skill=>skill.id),...RETIRED_SKILLS_V178.keys()]);
  const unknown=Object.entries(owner.skills).filter(([id])=>!known.has(id));if(unknown.length)owner.migrations.v178UnknownSkills=Object.fromEntries(unknown.map(([id,value])=>[id,cloneV178(value)]));
  const activeIds=[...SKILLS.map(skill=>skill.id),...owner.customSkills.filter(skill=>!skill.archived).map(skill=>skill.id)],given=Array.isArray(owner.skillOrder)?owner.skillOrder:[];
  owner.skillOrder=[...given.filter((id,index)=>activeIds.includes(id)&&given.indexOf(id)===index),...activeIds.filter(id=>!given.includes(id))];
  owner.combatRoundRemainderV178=Math.max(0,Math.min(4,+owner.combatRoundRemainderV178||0));migrateEffectTargetsV178(owner);owner.migrations.v178Done=true;
  if(report)report.push({ownerId:owner.id||'',ownerName:owner.name||owner.type||'Charakter',freedCbp:freed,customSkills:owner.customSkills.length});return owner;
}
function backupIncomingStateV178(data){
  if(!data||data.v178MigrationDone)return;try{localStorage.setItem(STORE+'.backup.import-v178.'+Date.now(),JSON.stringify(data))}catch{}
}
function ensureStateV178(data,log=true){
  if(!data||typeof data!=='object')return data;const first=!data.v178MigrationDone,fromApp=data.appVersion||'unbekannt',fromSchema=+data.schemaVersion||0,report=[];
  normalizeLegacySkillsBeforeV178(data);for(const owner of ownerListV178(data))ensureOwnerV178(owner,report);
  data.appVersion=V178_VERSION;data.schemaVersion=V178_SCHEMA;data.rulesVersion=V178_RULES;data.v178MigrationDone=true;if(first||!Array.isArray(data.v178MigrationReport))data.v178MigrationReport=report;
  data.migrationLog=Array.isArray(data.migrationLog)?data.migrationLog:[];
  if(first&&log)data.migrationLog.push({from:fromSchema,fromApp,to:V178_SCHEMA,toApp:V178_VERSION,at:new Date().toISOString(),owners:report.length,freedCbp:report.reduce((sum,item)=>sum+item.freedCbp,0),changes:['Initiative und Hinterhalt archiviert','Eigene Fähigkeiten normalisiert','Sieben Kampftechnikschulen auf Katalog 1.1 migriert','Fünf-Runden-Ausdauerzähler ergänzt']});
  return data;
}

const migrateStateBeforeV178=migrateState;
migrateState=function(data){backupIncomingStateV178(data);normalizeLegacySkillsBeforeV178(data);return ensureStateV178(migrateStateBeforeV178(data),true)};
restoreInitialLegacyNumbersV178(state);state=ensureStateV178(state,true);
const newCharacterBeforeV178=newCharacter,newAuxEntryBeforeV178=newAuxEntry;
newCharacter=function(){return ensureOwnerV178(newCharacterBeforeV178())};
newAuxEntry=function(type,name){const owner=newAuxEntryBeforeV178(type,name);return type==='possession'?owner:ensureOwnerV178(owner)};

const costsBeforeV178=costs;
costs=function(owner){
  const out=costsBeforeV178(owner),oldSkillCost=Object.values(owner.skills||{}).reduce((sum,value)=>sum+skillCost(+value?.level||0),0),activeSkillCost=allSkillsV178(owner).reduce((sum,skill)=>sum+skillCost(+owner.skills?.[skill.id]?.level||0),0),delta=activeSkillCost-oldSkillCost;
  out.Fähigkeiten+=delta;out.spent+=delta;out.rest=out.total-out.spent;return out;
};
skillModifiers=function(owner){
  const skills=allSkillsV178(owner),out=Object.fromEntries(skills.map(skill=>[skill.id,0]));
  for(const{module}of activeEffectModulesV177(owner,'skill'))if(module.operation==='add'){const skill=skills.find(entry=>entry.id===module.target||entry.name===module.target);if(skill)out[skill.id]+=+module.value||0}
  return out;
};

const derivedBeforeV178=derived;
derived=function(owner){
  const values=derivedBeforeV178(owner).filter(row=>row.n!=='Ersticken & Würgen'),attrs=effectiveAttributes(owner),initiative=values.find(row=>row.n==='Initiative');
  if(initiative){const dice=['RF','WN','IN'].filter(id=>(+attrs[id]||0)>0).map(id=>dieValueV176(attrs[id])),base=+attrs.RF + +attrs.WN + +attrs.IN,modifier=(+initiative.v||0)-base;initiative.f=`Basis: wirksame RF + WN + IN${modifier?` ${modifier>0?'+':'−'} ${Math.abs(modifier)} Modifikator`:''}`;initiative.roll=`Probe: ${dice.length?dice.join(' + '):'0'}${modifier?` ${modifier>0?'+':'−'} ${Math.abs(modifier)}`:''}`}
  return values;
};
function initiativeInfoV178(owner){const row=derived(owner).find(item=>item.n==='Initiative'),box=el('div');box.append(el('p',{text:'Zu Kampfbeginn wird einmal auf die Würfel der wirksamen Grundwerte RF, WN und IN gewürfelt. Der Builder zeigt die Formel, würfelt aber nicht automatisch.'}),el('p',{text:`Aktuell: ${row?.f||'—'} · ${row?.roll||'—'}`}),el('p',{text:'Gleichstand: höhere Basis, dann RF, WN, IN und zuletzt W3.'}));return box}
function renderDerivedV178(owner){const box=el('div',{class:'derived'});for(const rowData of derived(owner)){const row=el('div',{class:'derived-item',tabindex:0,'data-effect-target':rowData.n==='Initiative'?'initiative':''});row.append(el('span',{text:rowData.n}),el('strong',{text:rowData.v}),el('span',{class:'formula',text:rowData.f}));if(rowData.roll)row.append(el('span',{class:'initiative-roll-v178',text:rowData.roll}),infoButtonR5(row,'Initiative',()=>initiativeInfoV178(owner)));if(rowData.roll)bindInfoR5(row,'Initiative',()=>initiativeInfoV178(owner));box.append(row)}return box}
renderDerivedV174=renderDerivedV178;
const renderAuxCardBodyBeforeV178=renderAuxCardBody;
renderAuxCardBody=function(card,owner){if(card.type==='derived')return renderDerivedV178(owner);return renderAuxCardBodyBeforeV178(card,owner)};

const counterInfoBeforeV178=counterInfoContentR5;
counterInfoContentR5=function(id){const box=counterInfoBeforeV178(id);if(id==='A')box.prepend(el('p',{text:'5 Kampfrunden = 1 Ausdauer. Kampftechniken kosten ihre angegebene Ausdauer zusätzlich.'}));return box};
function advanceCombatClockV178(owner,eventKey){
  ensureOwnerV178(owner);if(eventKey==='rest'){const before=owner.combatRoundRemainderV178;owner.combatRoundRemainderV178=0;return{before,after:0,spent:0}}
  if(eventKey!=='round')return{before:owner.combatRoundRemainderV178,after:owner.combatRoundRemainderV178,spent:0};
  const before=owner.combatRoundRemainderV178,next=(before+1)%5,spend=next===0?1:0,a=owner.counters?.A;if(spend&&a)a.current=Math.max(0,(+a.current||0)-1);owner.combatRoundRemainderV178=next;return{before,after:next,spent:spend};
}
advanceEffectsV177=function(owner,eventKey){
  ensureOwnerV178(owner);const changes=[];
  for(const effect of activeEffectInstancesV177(owner))for(const module of effect.modules)if(module.type==='counter-current'){
    const times=intervalMultiplierV177(module,eventKey);if(!times||!owner.counters?.[module.target])continue;const before=owner.counters[module.target].current,after=Math.max(0,Math.min(owner.counters[module.target].max,before+(+module.value||0)*times));if(after!==before)changes.push({effect,module,before,after});
  }
  if(changes.length&&!confirm(changes.map(change=>`${change.effect.name}: ${change.module.target} ${change.before} → ${change.after}`).join('\n')+'\n\nÄnderungen anwenden?'))return false;
  for(const change of changes)setCounterCurrentR8(owner,change.module.target,change.after);const combat=advanceCombatClockV178(owner,eventKey);advanceEffectDurationsV177(owner,eventKey);
  owner.effectLogV177.unshift({id:uid(),at:nowV177(),event:eventKey,combatRounds:{before:combat.before,after:combat.after,spentA:combat.spent},changes:changes.map(change=>({effect:change.effect.name,counter:change.module.target,before:change.before,after:change.after}))});owner.effectLogV177=owner.effectLogV177.slice(0,30);persistEffectsV177(owner,true);return true;
};

combatTechniqueCapacityV176=function(owner,skillId){const level=Math.max(0,+owner?.skills?.[skillId]?.level||0);return COMBAT_DB_V178.unlockLevels.filter(threshold=>level>=threshold).length};
combatTechniquesForSkillV176=function(skillId){return COMBAT_ENTRIES_V178.filter(entry=>entry.skillId===skillId).sort((a,b)=>Number(a.code.slice(1))-Number(b.code.slice(1)))};
ensureOwnerCombatTechniquesV176=function(owner){if(!owner||owner.type==='possession')return owner;ensureOwnerV178(owner);for(const id of COMBAT_SKILL_IDS_V178)owner.skills[id]=skillStateV178(owner.skills[id]);return owner};
learnedCombatTechniqueIdsV176=function(owner,skillId){ensureOwnerCombatTechniquesV176(owner);return owner.skills[skillId].learnedTechniqueIds};
canLearnCombatTechniqueV176=function(owner,skillId,techniqueId){const entry=COMBAT_BY_ID_V178.get(techniqueId),data=owner.skills?.[skillId],capacity=combatTechniqueCapacityV176(owner,skillId);return!!entry&&entry.skillId===skillId&&(+data?.level||0)>=1&&!data.learnedTechniqueIds.includes(techniqueId)&&data.learnedTechniqueIds.length<capacity};
learnCombatTechniqueV176=function(owner,skillId,techniqueId){if(!canLearnCombatTechniqueV176(owner,skillId,techniqueId))return false;owner.skills[skillId].learnedTechniqueIds.push(techniqueId);return true};
unlearnCombatTechniqueV176=function(owner,skillId,techniqueId){const ids=learnedCombatTechniqueIdsV176(owner,skillId),index=ids.indexOf(techniqueId);if(index<0)return false;ids.splice(index,1);return true};
techniqueIdsKeptAtLevelV176=function(owner,skillId){return[...learnedCombatTechniqueIdsV176(owner,skillId)]};
const setPurchasedSkillLevelBaseV178=setPurchasedSkillLevelBeforeCombatV176;
setPurchasedSkillLevelV176=function(owner,skillId,nextLevel,confirmRemoval=message=>confirm(message)){const ok=setPurchasedSkillLevelBaseV178(owner,skillId,nextLevel,confirmRemoval);ensureOwnerV178(owner);return ok};

combatTechniqueFormulaV176=function(value,owner,skillId){return formatRuleTextV176(value,effectiveSkillLevelV176(owner,skillId))};
combatTechniqueInfoContentV176=function(entry,owner){
  const s=effectiveSkillLevelV176(owner,entry.skillId),b=bonusValueV176(s),w=dieValueV176(s),box=el('div',{class:'power-detail-v176'}),current=el('div',{class:'power-current-v176'});
  current.append(el('span',{class:'power-badge-v176',text:`S ${s}`}),el('span',{class:'power-badge-v176',text:`W ${w}`}),el('span',{class:'power-badge-v176',text:`B ${b}`}),el('span',{class:'power-badge-v176',text:'ab Kaufstufe 1'}),el('span',{class:'power-badge-v176',text:`${entry.staminaCost} A`}));
  const grid=el('div',{class:'power-detail-grid-v176'});grid.append(combatTechniqueDetailSectionV176('Aktivierung',entry.activation),combatTechniqueDetailSectionV176('Wirkung (W/B/S-Formel)',entry.effect,'combat-tech-formula-v176'),combatTechniqueDetailSectionV176('Wirkung aktuell',combatTechniqueFormulaV176(entry.effect,owner,entry.skillId)),combatTechniqueDetailSectionV176('Skalierung',entry.scaling),combatTechniqueDetailSectionV176('Probe / Gegenwehr',combatTechniqueFormulaV176(entry.check,owner,entry.skillId)),combatTechniqueDetailSectionV176('Regeln & Grenzen',combatTechniqueFormulaV176(entry.limits,owner,entry.skillId)));box.append(current,grid);return box;
};
combatTechniqueShortTextV176=function(entry,owner){return combatTechniqueFormulaV176(entry.effect,owner,entry.skillId)};
renderLearnedCombatTechniqueV176=function(owner,skillId,techniqueId){
  const entry=COMBAT_BY_ID_V178.get(techniqueId);if(!entry)return el('article',{class:'power-row-v176 power-warning-v176'},[el('span',{class:'power-code-v176',text:'?'}),el('div',{class:'power-name-v176'},[el('strong',{text:'Unbekannte Kampftechnik'}),el('small',{text:techniqueId})])]);
  const row=el('article',{class:'power-row-v176'}),detail=el('div',{class:'power-inline-detail-v176',hidden:true}),info=el('button',{type:'button',text:'Details','aria-expanded':'false'}),remove=el('button',{class:'danger',type:'button',text:'Entfernen'});
  info.onclick=()=>{const opening=detail.hidden;detail.hidden=!opening;info.setAttribute('aria-expanded',String(opening));info.textContent=opening?'Details schließen':'Details';if(opening&&!detail.childNodes.length)detail.append(combatTechniqueInfoContentV176(entry,owner))};
  remove.onclick=()=>{if(confirm(`„${entry.name}“ wirklich verlernen?`)){unlearnCombatTechniqueV176(owner,skillId,techniqueId);persistCombatTechniqueLibraryV176(owner)}};
  row.append(el('span',{class:'power-code-v176',text:entry.code}),el('div',{class:'power-name-v176'},[el('strong',{text:entry.name}),el('small',{text:`${entry.staminaCost} A · ab Kaufstufe 1`})]),el('span',{class:'power-summary-v176',text:combatTechniqueShortTextV176(entry,owner)}),el('div',{class:'power-actions-v176'},[info,remove]),detail);return row;
};
renderCombatTechniqueSelectionV176=function(owner,school,slotIndex){
  const learned=new Set(learnedCombatTechniqueIdsV176(owner,school.skillId)),available=combatTechniquesForSkillV176(school.skillId).filter(entry=>!learned.has(entry.id)),select=el('select',{'aria-label':`Kampftechnik für ${school.skillName} wählen`}),preview=el('div',{class:'power-select-detail-v176 combat-tech-preview-v176'},[el('p',{class:'power-select-preview-v176',text:'Wähle eine Technik. Alle acht Techniken sind ab Kaufstufe 1 verfügbar.'})]),button=el('button',{class:'primary',type:'button',text:'Lernen',disabled:true});
  select.append(el('option',{value:'',text:`Freier Technikplatz ${slotIndex+1} · Technik wählen…`}));for(const entry of available)select.append(el('option',{value:entry.id,text:`${entry.code} · ${entry.name} · ${entry.staminaCost} A`}));
  select.onchange=()=>{const entry=COMBAT_BY_ID_V178.get(select.value);button.disabled=!(entry&&canLearnCombatTechniqueV176(owner,school.skillId,entry.id));preview.replaceChildren(entry?combatTechniqueInfoContentV176(entry,owner):el('p',{class:'power-select-preview-v176',text:'Wähle eine Technik.'}))};button.onclick=()=>{if(learnCombatTechniqueV176(owner,school.skillId,select.value))persistCombatTechniqueLibraryV176(owner)};
  return el('section',{class:'power-select-row-v176 combat-tech-select-v176'},[el('label',{class:'field'},[el('span',{text:'Neue Kampftechnik wählen'}),select]),button,preview]);
};
renderCombatTechniqueLibraryV176=function(owner){
  ensureOwnerCombatTechniquesV176(owner);const box=el('section',{class:'combat-tech-library-v176','data-owner-id':owner.id||''}),head=el('div',{class:'combat-tech-head-v176'});
  head.append(el('div',{},[el('h3',{text:'Kampftechniken'}),el('p',{class:'muted',text:'Alle Techniken sind ab Kaufstufe 1 lernbar und skalieren mit der wirksamen Stufe ihres Kampfskills.'})]),el('span',{class:'power-badge-v176',text:`Katalog 1.1 · 7 Schulen · 56 Techniken`}));
  const rules=el('div',{class:'combat-tech-rules-v176'},[
    el('div',{class:'combat-tech-rule-v176'},[el('strong',{text:'Lernplätze'}),el('span',{text:'Kaufstufen 1/6/8/11/16/17/21/25 geben 1 bis 8 Plätze. Temporäre Modifikatoren ändern die Platzanzahl nicht.'})]),
    el('div',{class:'combat-tech-rule-v176'},[el('strong',{text:'Skalierung'}),el('span',{text:'S = wirksame Stufe, W = exakter Stufenwürfel, B = Stufenbonus. Formel und aktueller Wert werden getrennt gezeigt.'})]),
    el('div',{class:'combat-tech-rule-v176'},[el('strong',{text:'Ausdauer'}),el('span',{text:'Techniken kosten ihre angegebenen A sofort. Normale Angriffe und Verteidigungen haben keine unmittelbaren A-Kosten.'})]),
    el('div',{class:'combat-tech-rule-v176 combat-rule-wide-v178'},[el('strong',{text:'Normale Parade'}),el('span',{text:'Reaktion gegen einen körperlichen Nahkampfangriff mit geeigneter ausgerüsteter Nahkampfwaffe: Verteidigung & Blocken gegen das Angriffsergebnis. Bei Gleichstand oder höherem Ergebnis wird vollständig abgewehrt. Pro Angriff wird Parade, Block oder Ausweichen gewählt.'})])
  ]),list=el('div',{class:'power-skill-list-v176'});
  for(const school of COMBAT_SCHOOLS_V178){const data=owner.skills[school.skillId],learned=data.learnedTechniqueIds||[],capacity=combatTechniqueCapacityV176(owner,school.skillId),free=Math.max(0,capacity-learned.length),s=effectiveSkillLevelV176(owner,school.skillId),group=el('details',{class:'power-skill-group-v176 combat-tech-group-v176 '+(learned.length?'':'has-no-learned'),open:capacity>0||learned.length>0}),summary=el('summary');summary.append(el('span',{text:school.skillName}),el('span',{class:'power-skill-meta-v176'},[el('span',{class:'power-badge-v176',text:`Gelernt ${learned.length}/${capacity}`}),el('span',{class:'power-badge-v176',text:`Kaufstufe ${data.level}`}),el('span',{class:'power-badge-v176',text:`S ${s}`}),el('span',{class:'power-badge-v176',text:dieValueV176(s)}),el('span',{class:'power-badge-v176',text:`B ${bonusValueV176(s)}`})]));const body=el('div',{class:'power-group-body-v176'});for(const id of learned)body.append(renderLearnedCombatTechniqueV176(owner,school.skillId,id));for(let index=0;index<free;index++)body.append(renderCombatTechniqueSelectionV176(owner,school,index));if(learned.length>capacity)body.append(el('p',{class:'combat-tech-over-v178',text:`Bestandsschutz: ${learned.length} gelernte Techniken bei ${capacity} regulären Plätzen. Es wird nichts gelöscht; weiteres Lernen ist vorerst gesperrt.`}));if(!capacity&&!learned.length)body.append(el('p',{class:'muted combat-tech-empty-v176',text:'Kaufstufe 1 schaltet den ersten Lernplatz frei; dann stehen sofort alle acht Techniken zur Wahl.'}));const next=COMBAT_DB_V178.unlockLevels.find(level=>level>(+data.level||0));if(capacity&&next)body.append(el('p',{class:'muted combat-tech-empty-v176',text:`Nächster Lernplatz auf Kaufstufe ${next}.`}));group.append(summary,body);list.append(group)}
  box.append(head,rules,list);return box;
};

function customSkillNameAvailableV178(owner,name,exceptId=''){const normalized=String(name).trim().toLocaleLowerCase('de');return!!normalized&&!SKILLS.some(skill=>skill.name.toLocaleLowerCase('de')===normalized)&&!customSkillsV178(owner,true).some(skill=>skill.id!==exceptId&&skill.name.toLocaleLowerCase('de')===normalized)}
function createCustomSkillV178(owner,input){
  ensureOwnerV178(owner);const name=String(input.name||'').trim(),attributeIds=[input.attribute1,input.attribute2].map(String);
  if(!name)throw Error('Bitte einen Namen eingeben.');if(!customSkillNameAvailableV178(owner,name,input.id||''))throw Error('Dieser Fähigkeitsname ist bereits vergeben.');if(attributeIds.length!==2||attributeIds.some(id=>!ATTRIBUTE_ID_SET_V178.has(id))||attributeIds[0]===attributeIds[1])throw Error('Bitte zwei unterschiedliche Grundwerte auswählen.');
  const existing=input.id&&owner.customSkills.find(skill=>skill.id===input.id),definition={...(existing||{}),id:existing?.id||'custom_skill_'+uid(),name,category:String(input.category||'Eigene Fähigkeiten').trim()||'Eigene Fähigkeiten',attributeIds,attrs:attributeIds.join(', '),use:String(input.use||'—').trim()||'—',scope:String(input.scope||'').trim(),archived:false,sourceOrder:existing?.sourceOrder??SYSTEM_SKILL_COUNT_V178+owner.customSkills.length};
  if(existing)Object.assign(existing,definition);else{owner.customSkills.push(definition);owner.skills[definition.id]=skillStateV178({});owner.skillOrder.push(definition.id)}ensureOwnerV178(owner);return definition;
}
function archiveCustomSkillV178(owner,id){const skill=owner.customSkills?.find(item=>item.id===id);if(!skill||skill.archived)return false;skill.archived=true;skill.archivedAt=new Date().toISOString();owner.skillOrder=(owner.skillOrder||[]).filter(value=>value!==id);return true}
function restoreCustomSkillV178(owner,id){const skill=owner.customSkills?.find(item=>item.id===id);if(!skill||!skill.archived||!customSkillNameAvailableV178(owner,skill.name,id))return false;skill.archived=false;delete skill.archivedAt;if(!owner.skillOrder.includes(id))owner.skillOrder.push(id);ensureOwnerV178(owner);return true}
function deleteCustomSkillV178(owner,id){const index=owner.customSkills?.findIndex(item=>item.id===id)??-1;if(index<0)return false;owner.customSkills.splice(index,1);delete owner.skills[id];owner.skillOrder=(owner.skillOrder||[]).filter(value=>value!==id);for(const effect of owner.activeEffectsV177||[])for(const module of effect.modules||[])if(module.type==='skill'&&module.target===id){module.type='rule';module.target='deleted_custom_skill';module.scope=module.scope||`Frühere eigene Fähigkeit ${id}`};return true}

let customSkillDialogV178=null,customArchiveDialogV178=null;
function customSkillDialogNodeV178(){if(!customSkillDialogV178){customSkillDialogV178=el('dialog',{class:'custom-skill-dialog-v178'});document.body.append(customSkillDialogV178)}return customSkillDialogV178}
function openCustomSkillEditorV178(owner,skill=null){
  const dialog=customSkillDialogNodeV178(),name=el('input',{value:skill?.name||'','aria-label':'Name der eigenen Fähigkeit'}),category=el('input',{value:skill?.category||'Eigene Fähigkeiten','aria-label':'Kategorie der eigenen Fähigkeit',list:'customSkillCategoriesV178'}),categories=el('datalist',{id:'customSkillCategoriesV178'}),attribute1=el('select',{'aria-label':'Grundwert 1'}),attribute2=el('select',{'aria-label':'Grundwert 2'}),use=el('input',{value:skill?.use==='—'?'':skill?.use||'','aria-label':'Verbrauch'}),scope=el('textarea',{'aria-label':'Beschreibung der eigenen Fähigkeit'}),error=el('p',{class:'custom-skill-error-v178','aria-live':'polite'});scope.value=skill?.scope||'';
  for(const categoryName of[...new Set([...SKILLS.map(item=>item.category),...customSkillsV178(owner,true).map(item=>item.category)])])categories.append(el('option',{value:categoryName}));for(const[id,label]of ATTRS){attribute1.append(el('option',{value:id,text:`${label} (${id})`}));attribute2.append(el('option',{value:id,text:`${label} (${id})`}))}attribute1.value=skill?.attributeIds?.[0]||'ST';attribute2.value=skill?.attributeIds?.[1]||'KS';
  const cancel=el('button',{type:'button',text:'Abbrechen',onclick:()=>dialog.close()}),saveButton=el('button',{type:'button',class:'primary',text:'Speichern',onclick:()=>{try{createCustomSkillV178(owner,{id:skill?.id,name:name.value,category:category.value,attribute1:attribute1.value,attribute2:attribute2.value,use:use.value,scope:scope.value});persistOwnerR5(owner,true);dialog.close()}catch(exception){error.textContent=exception.message}}});
  const header=el('div',{class:'dialog-head'},[el('h2',{text:skill?'Eigene Fähigkeit bearbeiten':'Eigene Fähigkeit hinzufügen'}),el('button',{type:'button',text:'✕','aria-label':'Schließen',onclick:()=>dialog.close()})]);
  const form=el('div',{class:'custom-skill-form-v178'},[fieldV177('Name',name),fieldV177('Kategorie',category),categories,el('div',{class:'custom-skill-attributes-v178'},[fieldV177('Grundwert 1',attribute1),fieldV177('Grundwert 2',attribute2)]),fieldV177('Verbrauch (optional)',use),fieldV177('Beschreibung / Anwendungsbereich',scope),error,el('div',{class:'toolbar'},[saveButton,cancel])]);
  dialog.replaceChildren(header,form);dialog.showModal();name.focus();
}
function openCustomSkillArchiveV178(owner){
  if(!customArchiveDialogV178){customArchiveDialogV178=el('dialog',{class:'custom-skill-dialog-v178'});document.body.append(customArchiveDialogV178)}
  const list=el('div',{class:'custom-skill-archive-v178'}),archived=customSkillsV178(owner,true).filter(skill=>skill.archived);
  if(!archived.length)list.append(el('p',{class:'muted',text:'Keine archivierten eigenen Fähigkeiten.'}));
  for(const skill of archived){
    const data=owner.skills?.[skill.id]||{};
    const restore=el('button',{type:'button',text:'Wiederherstellen',onclick:()=>{
      if(!restoreCustomSkillV178(owner,skill.id))return alert('Der Name ist inzwischen vergeben. Benenne zuerst die andere Fähigkeit um.');
      persistOwnerR5(owner,true);openCustomSkillArchiveV178(owner);
    }});
    const remove=el('button',{type:'button',class:'danger',text:'Endgültig löschen',onclick:()=>{
      const links=(owner.activeEffectsV177||[]).flatMap(effect=>effect.modules||[]).filter(module=>module.type==='skill'&&module.target===skill.id).length;
      const warning=`„${skill.name}“ endgültig löschen?\n\nStufe ${data.level||0}, Notiz: ${data.note||'—'}, Effektverknüpfungen: ${links}. Dieser Schritt kann nur über eine Sicherung rückgängig gemacht werden.`;
      if(confirm(warning)){deleteCustomSkillV178(owner,skill.id);persistOwnerR5(owner,true);openCustomSkillArchiveV178(owner)}
    }});
    list.append(el('section',{class:'custom-skill-archive-row-v178'},[el('div',{},[el('strong',{text:skill.name}),el('div',{class:'muted',text:`${skill.attrs} · Stufe ${data.level||0} · ${skillCost(data.level)} CBP`})]),el('div',{class:'toolbar'},[restore,remove])]));
  }
  customArchiveDialogV178.replaceChildren(el('div',{class:'dialog-head'},[el('h2',{text:'Archivierte eigene Fähigkeiten'}),el('button',{type:'button',text:'✕','aria-label':'Schließen',onclick:()=>customArchiveDialogV178.close()})]),list);if(!customArchiveDialogV178.open)customArchiveDialogV178.showModal();
}
function moveSkillV178(owner,id,delta){const order=owner.skillOrder||[],index=order.indexOf(id),target=index+delta;if(index<0||target<0||target>=order.length)return false;[order[index],order[target]]=[order[target],order[index]];persistOwnerR5(owner,true);return true}
function orderControlsV178(owner,skill){const index=owner.skillOrder.indexOf(skill.id),box=el('div',{class:'order-controls-r5'}),up=el('button',{class:'order-button-r5',type:'button',text:'↑','aria-label':skill.name+' nach oben',disabled:index<=0}),down=el('button',{class:'order-button-r5',type:'button',text:'↓','aria-label':skill.name+' nach unten',disabled:index>=owner.skillOrder.length-1});up.onclick=event=>{event.stopPropagation();moveSkillV178(owner,skill.id,-1)};down.onclick=event=>{event.stopPropagation();moveSkillV178(owner,skill.id,1)};box.append(up,down);return box}
function orderedSkillsV178(owner,skills,sort,attribute){const rank=new Map(owner.skillOrder.map((id,index)=>[id,index])),filtered=skills.filter(skill=>!attribute||skill.attributeIds?.includes(attribute)||skillAttributeIdsR10(skill).includes(attribute));return filtered.sort((a,b)=>{if(sort==='manual')return(rank.get(a.id)??9999)-(rank.get(b.id)??9999);if(sort==='attribute')return(ATTRIBUTE_IDS_V178.indexOf(skillAttributeIdsR10(a)[0]))-(ATTRIBUTE_IDS_V178.indexOf(skillAttributeIdsR10(b)[0]))||a.name.localeCompare(b.name,'de');const av=skillSortValueR11(owner,a,attribute),bv=skillSortValueR11(owner,b,attribute),direction=sort==='value-asc'?1:-1;return(av-bv)*direction||a.name.localeCompare(b.name,'de')})}
function renderSkillsV178(owner,isAux=false){
  ensureOwnerPowersV176(owner);ensureOwnerV178(owner);const box=el('div'),notice=druidMigrationNoticeV176(owner),choiceHost=el('div',{class:'power-path-choice-host-v176'});fillPowerPathChoiceHostV176(choiceHost,owner);if(notice)box.append(notice);box.append(choiceHost);
  const filters=el('div',{class:'filters skill-filters-r11'}),search=el('input',{placeholder:'Fähigkeiten und Beschreibungen suchen…'}),category=el('select'),sort=el('select',{'aria-label':'Fähigkeiten sortieren'}),attribute=el('select',{'aria-label':'Fähigkeiten nach Grundwert filtern'}),count=el('span',{class:'skill-sort-count-r11','aria-live':'polite'}),add=el('button',{type:'button',class:'primary',text:'+ Eigene Fähigkeit',onclick:()=>openCustomSkillEditorV178(owner)}),archive=el('button',{type:'button',text:'Archiv',onclick:()=>openCustomSkillArchiveV178(owner)});category.append(el('option',{value:'',text:'Alle Kategorien'}));for(const value of[...new Set(allSkillsV178(owner).map(skill=>skill.category))])category.append(el('option',{value,text:value}));for(const[value,label]of SKILL_SORT_OPTIONS_R11)sort.append(el('option',{value,text:label}));attribute.append(el('option',{value:'',text:'Alle Grundwerte'}));for(const[id,label]of ATTRS)attribute.append(el('option',{value:id,text:`${label} (${id})`}));const view=owner.skillSortView||{sort:'manual',attribute:''};sort.value=SKILL_SORT_OPTIONS_R11.some(([id])=>id===view.sort)?view.sort:'manual';attribute.value=ATTRIBUTE_ID_SET_V178.has(view.attribute)?view.attribute:'';filters.append(search,category,sort,attribute,count,el('span',{class:'custom-skill-toolbar-v178'},[add,archive]));
  const scroll=el('div',{class:'scroll'}),table=el('table',{class:'skills-r13 skills-r5'}),body=el('tbody'),headers=['★','Reihenfolge','Fähigkeit','Kategorie','Grundwerte','Verbrauch','Gekauft','Mod','Wirksam','CBP','Nächste','Notiz','Info','Aktionen'];table.append(el('thead',{},[el('tr',{},headers.map(label=>el('th',{text:label})))]),body);scroll.append(table);box.append(filters,scroll);
  const draw=()=>{
    body.replaceChildren();ensureOwnerV178(owner);
    const mods=skillModifiers(owner),query=normalizeSearchV177(search.value);
    const skills=orderedSkillsV178(owner,allSkillsV178(owner),sort.value,attribute.value).filter(skill=>(!query||normalizeSearchV177(`${skill.name} ${skill.scope} ${skill.attrs} ${skill.use}`).includes(query))&&(!category.value||skill.category===category.value));
    count.textContent=`${skills.length} von ${allSkillsV178(owner).length} Fähigkeiten`;
    for(const skill of skills){
      const data=owner.skills[skill.id],modifier=mods[skill.id]||0,effective=Math.max(0,Math.min(25,(+data.level||0)+modifier));
      const row=el('tr',{tabindex:0,'data-skill-id':skill.id}),favorite=el('button',{class:'fav',text:data.fav?'★':'☆','aria-label':skill.name+' als Favorit markieren'}),level=el('input',{class:'skill-level',type:'number',min:0,max:25,value:data.level,'aria-label':skill.name+' Stufe'}),note=el('input',{value:data.note||'',placeholder:'Notiz'}),build=()=>skillInfoContentR5(skill),info=infoButtonR5(row,skill.name,build),actions=el('div',{class:'custom-skill-actions-v178'});
      favorite.onclick=()=>{data.fav=!data.fav;persistOwnerR5(owner,false);draw()};
      const commitLevel=event=>{const previous=data.level;if(!setPurchasedSkillLevelV176(owner,skill.id,event.target.value)){event.target.value=previous;return}const runeVisibilityChanged=skill.id==='skill_magic_rune_enchanting'&&((+previous||0)>0)!==((+data.level||0)>0);persistOwnerR5(owner,runeVisibilityChanged);if(!runeVisibilityChanged)draw();replaceCombatTechniqueLibraryV176(owner);refreshPowerPathChoiceHostsV176(owner)};
      level.onchange=commitLevel;
      level.onblur=commitLevel;
      note.oninput=event=>{data.note=event.target.value;persistOwnerR5(owner,false)};
      if(skill.id.startsWith('custom_skill_')){
        const edit=el('button',{type:'button',text:'Bearbeiten',onclick:()=>openCustomSkillEditorV178(owner,skill)});
        const archiveButton=el('button',{type:'button',class:'danger',text:'Archivieren',onclick:()=>{if(confirm(`„${skill.name}“ archivieren? Die Fähigkeit verschwindet aus der Berechnung und kann später wiederhergestellt werden.`)){archiveCustomSkillV178(owner,skill.id);persistOwnerR5(owner,true)}}});
        actions.append(edit,archiveButton);
      }
      const nameCell=skillNameCellR13(skill);if(skill.id.startsWith('custom_skill_'))nameCell.querySelector('strong')?.append(el('span',{class:'custom-skill-badge-v178',text:'Eigene Fähigkeit'}));
      const next=+data.level>=25?'Maximum':`+${skillNextLevelCost(data.level)} CBP`,cells=[favorite,orderControlsV178(owner,skill),nameCell,skill.category,skillAttributeChipsR10(owner,skill),skill.use,level,(modifier>0?'+':'')+modifier,effective,skillCost(data.level),next,note,info,actions];
      for(const value of cells)row.append(el('td',{},[value?.nodeType?value:String(value)]));bindInfoR5(row,skill.name,build);body.append(row);
    }
  };
  search.oninput=draw;category.onchange=draw;sort.onchange=()=>{owner.skillSortView={sort:sort.value,attribute:attribute.value};persistOwnerR5(owner,false);draw()};attribute.onchange=()=>{owner.skillSortView={sort:sort.value,attribute:attribute.value};persistOwnerR5(owner,false);draw()};draw();box.append(renderCombatTechniqueLibraryV176(owner));return box;
}
renderSkillsOwnerR5=renderSkillsV178;renderSkills=function(){return renderSkillsV178(ch(),false)};renderAuxSkillsV17=function(owner){return renderSkillsV178(owner,true)};

const targetOptionsBeforeV178=targetOptionsV177,openEffectEditorBeforeV178=openEffectEditorV177;let effectOwnerV178=null;
targetOptionsV177=function(type){const base=targetOptionsBeforeV178(type);if(type!=='skill'||!effectOwnerV178)return base;return[...base,...customSkillsV178(effectOwnerV178).map(skill=>[skill.id,`${skill.name} (eigene Fähigkeit)`])]} ;
openEffectEditorV177=function(owner,effect){effectOwnerV178=owner;return openEffectEditorBeforeV178(owner,effect)};

const searchIndexBeforeV178=searchIndexV177;
searchIndexV177=function(){
  const entries=searchIndexBeforeV178().filter(entry=>entry.kind!=='Kampftechnik'&&!RETIRED_SKILLS_V178.has(entry.target?.skillId));for(const owner of ownerDescriptorsV177()){const ownerName=owner===ch()?(owner.name||'Hauptcharakter'):(owner.name||owner.type||'Zusatzreiter'),card=cardTargetV177(owner,'skills');for(const skill of customSkillsV178(owner))entries.push({label:skill.name,kind:'Eigene Fähigkeit',owner:ownerName,target:{ownerId:owner.id,...card,selector:`[data-skill-id="${skill.id}"]`},search:normalizeSearchV177(`${skill.name} ${skill.category} ${skill.attrs} ${skill.scope}`)});entries.push({label:'Initiative',kind:'Abgeleiteter Wert',owner:ownerName,target:{ownerId:owner.id,...cardTargetV177(owner,'derived'),selector:'[data-effect-target="initiative"]'},search:normalizeSearchV177('Initiative RF WN IN Basis Probe')})}for(const entry of COMBAT_ENTRIES_V178)entries.push({label:entry.name,kind:'Kampftechnik',owner:entry.skillName,target:{ownerId:ch().id,...cardTargetV177(ch(),'skills')},search:normalizeSearchV177(`${entry.name} ${entry.skillName} ${entry.code} ${entry.effect}`)});return entries;
};

renderPrintSkillsR15=function(card,owner,options,isCharacter){
  ensureOwnerV178(owner);const skills=allSkillsV178(owner),mods=skillModifiers(owner),hasNotes=skills.some(skill=>meaningfulValueR15(owner.skills?.[skill.id]?.note)),showNotes=options.format!=='compact'||hasNotes,columns=['Fähigkeit','Kategorie','Grundwerte','Verbrauch','Gekauft','Mod','Wirksam','CBP'];if(showNotes)columns.push('Notiz');const table=el('table',{class:'print-skills-table'}),body=el('tbody');table.append(el('thead',{},[el('tr',{},columns.map(name=>el('th',{text:name})))]),body);for(const skill of skills){const current=owner.skills[skill.id],level=+current.level||0,mod=+mods[skill.id]||0,effective=Math.max(0,Math.min(25,level+mod)),values=[skill.name,skill.category,skill.attrs,skill.use,level,(mod>0?'+':'')+mod,effective,skillCost(level)];if(showNotes)values.push(current.note||'');body.append(el('tr',{},values.map((value,index)=>el('td',{class:index>=4&&index<=7?'num':'',text:String(value)}))))}const container=el('div',{},[table]);if(options.descriptions){const appendix=el('section',{class:'print-skill-appendix'},[el('h3',{text:'Fähigkeitenbeschreibungen'})]);for(const skill of skills)appendix.append(el('article',{class:'print-skill-description'},[el('h4',{text:`${skill.name} · ${skill.category}`}),el('p',{text:skill.scope})]));container.append(appendix)}const learned=COMBAT_SCHOOLS_V178.flatMap(school=>(owner.skills?.[school.skillId]?.learnedTechniqueIds||[]).map(id=>COMBAT_BY_ID_V178.get(id)).filter(Boolean));if(learned.length){const section=el('section',{class:'print-skill-appendix'},[el('h3',{text:'Gelernte Kampftechniken'})]);for(const entry of learned)section.append(el('article',{class:'print-skill-description'},[el('h4',{text:`${entry.code} · ${entry.name} · ${entry.staminaCost} A`}),el('p',{text:`Aktivierung: ${entry.activation}`}),el('p',{text:`Wirkung: ${entry.effect}`}),el('p',{text:`Probe/Gegenwehr: ${entry.check}`}),el('p',{text:`Grenzen: ${entry.limits}`})]));container.append(section)}return printStaticCardR15(card,'skills',card.title||'Fähigkeiten',container);
};

const auditBeforeV178=audit;
audit=function(){auditBeforeV178();for(const heading of[...auditResults.querySelectorAll('h3')].filter(node=>node.textContent==='Kampftechniken')){let next=heading.nextSibling;while(next&&next.nodeName!=='H3'){const remove=next;next=next.nextSibling;remove.remove()}heading.remove()}auditResults.append(el('h3',{text:'Kampftechniken v1.7.8'}),el('div',{class:'notice '+(COMBAT_VALIDATION_V178.ok?'ok':'error'),text:`${COMBAT_VALIDATION_V178.ok?'✓':'✕'} ${COMBAT_ENTRIES_V178.length} Techniken · ${COMBAT_SCHOOLS_V178.length} Schulen · Lernplätze 1/6/8/11/16/17/21/25`}));for(const owner of ownerListV178()){const issues=[];for(const school of COMBAT_SCHOOLS_V178){const ids=owner.skills?.[school.skillId]?.learnedTechniqueIds||[];for(const id of ids)if(!COMBAT_BY_ID_V178.has(id))issues.push(id)}auditResults.append(el('div',{class:'notice '+(!issues.length?'ok':''),text:`${!issues.length?'✓':'⚠'} ${owner.name||owner.type||'Charakter'}: ${issues.length?issues.length+' unbekannte Technik-IDs':'Technikdaten gültig'}`}))}};

function runTestsV178(){
  const tests=[],eq=(name,expected,actual)=>tests.push([name,expected,actual,expected===actual]);
  eq('Version 1.7.8',V178_VERSION,APP_VERSION);eq('Schema 17',17,SCHEMA_VERSION);eq('Regelversion 7',7,RULES_VERSION);eq('Ausgangskatalog erkannt',84,SYSTEM_SKILLS_BEFORE_V178);eq('82 erhaltene Systemfähigkeiten',82,SYSTEM_SKILL_COUNT_V178);eq('Initiative nicht kaufbar',false,SKILLS.some(skill=>skill.id==='skill_0'));eq('Hinterhalt nicht kaufbar',false,SKILLS.some(skill=>skill.id==='skill_4'));
  const initiativeOwner=newCharacter();initiativeOwner.attributes.RF=7;initiativeOwner.attributes.WN=6;initiativeOwner.attributes.IN=8;const initiative=derived(initiativeOwner).find(row=>row.n==='Initiative');eq('Initiative-Basis 21',21,initiative.v);eq('Initiativeprobe W9 + W8 + W10','Probe: W9 + W8 + W10',initiative.roll);eq('Ersticken nicht abgeleitet',false,derived(initiativeOwner).some(row=>row.n==='Ersticken & Würgen'));
  eq('Technikkatalog gültig',true,COMBAT_VALIDATION_V178.ok);eq('56 Techniken',56,COMBAT_ENTRIES_V178.length);eq('Sieben Schulen',7,COMBAT_SCHOOLS_V178.length);eq('Je acht Techniken',true,COMBAT_SCHOOLS_V178.every(school=>combatTechniquesForSkillV176(school.skillId).length===8));eq('Alle ab Kaufstufe 1',true,COMBAT_ENTRIES_V178.every(entry=>entry.minLevel===1));
  const levels=[0,1,6,8,11,16,17,21,25],capacityOwner=newCharacter();eq('Plätze 0/1/2/3/4/5/6/7/8','0|1|2|3|4|5|6|7|8',levels.map(level=>{capacityOwner.skills.skill_1.level=level;return combatTechniqueCapacityV176(capacityOwner,'skill_1')}).join('|'));eq('S14 = W16/B3','W16|3',`${dieValueV176(14)}|${bonusValueV176(14)}`);eq('S25 = W100/B5','W100|5',`${dieValueV176(25)}|${bonusValueV176(25)}`);
  const catalogText=JSON.stringify(COMBAT_ENTRIES_V178);eq('Keine Nachladeregel',false,/Nachladeaktion|Nachladezeit/i.test(catalogText));eq('Keine W-Obergrenze',false,/höchstens W(?:20|25|30|36)/i.test(catalogText));eq('Stoppwirkung ist Reaktion',true,/^Reaktion/.test(COMBAT_ENTRIES_V178.find(entry=>entry.name==='Stoppwirkung')?.activation||''));eq('Schnellschuss wartet Bewegung ab',true,(COMBAT_ENTRIES_V178.find(entry=>entry.name==='Schnellschuss')?.effect||'').includes('Abschluss der gesamten'));
  const customOwner=newCharacter(),otherOwner=newAuxEntry('npc','Getrennt');const custom=createCustomSkillV178(customOwner,{name:'Runenkunde des Nordens',category:'Wissen',attribute1:'IT',attribute2:'IN',use:'FO',scope:'Eigene Spezialisierung'});customOwner.skills[custom.id].level=6;eq('Eigener Name gespeichert','Runenkunde des Nordens',custom.name);eq('Exakt zwei Grundwerte','IT|IN',custom.attributeIds.join('|'));eq('Eigene Fähigkeit kostet regulär',skillCost(6),skillCost(customOwner.skills[custom.id].level));eq('Andere Besitzer bleiben getrennt',0,customSkillsV178(otherOwner).length);eq('Doppelter Grundwert abgelehnt',true,(()=>{try{createCustomSkillV178(customOwner,{name:'Fehlerprobe',attribute1:'ST',attribute2:'ST'});return false}catch{return true}})());archiveCustomSkillV178(customOwner,custom.id);eq('Archivierung blendet aus',false,allSkillsV178(customOwner).some(skill=>skill.id===custom.id));restoreCustomSkillV178(customOwner,custom.id);eq('Wiederherstellung erhält Stufe',6,customOwner.skills[custom.id].level);
  const roundOwner=newCharacter();roundOwner.counters.A={max:5,current:5};for(let index=0;index<4;index++)advanceCombatClockV178(roundOwner,'round');eq('Vier Runden kosten nichts',5,roundOwner.counters.A.current);advanceCombatClockV178(roundOwner,'round');eq('Fünfte Runde kostet 1 A',4,roundOwner.counters.A.current);for(let index=0;index<5;index++)advanceCombatClockV178(roundOwner,'round');eq('Zehnte Runde kostet insgesamt 2 A',3,roundOwner.counters.A.current);advanceCombatClockV178(roundOwner,'rest');eq('Rast setzt Rundenrest zurück',0,roundOwner.combatRoundRemainderV178);
  const legacyOwner=newCharacter();legacyOwner.skills.skill_0={level:6,fav:true,note:'Alt'};legacyOwner.skills.skill_4={level:3,fav:false,note:'Alt'};legacyOwner.skills.skill_2.learnedTechniqueIds=['tech_heavy_melee_cleaving_blow'];delete legacyOwner.migrations.v178RetiredSkills;delete legacyOwner.migrations.v178Done;const legacy={appVersion:'1.7.7',schemaVersion:15,characters:[legacyOwner],migrationLog:[]};ensureStateV178(legacy,true);const once=JSON.stringify(legacy);ensureStateV178(legacy,true);eq('Legacy-Skills archiviert',true,!!legacyOwner.migrations.v178RetiredSkills.skill_0&&!!legacyOwner.migrations.v178RetiredSkills.skill_4);eq('CBP-Freigabe korrekt',skillCost(6)+skillCost(3),legacy.v178MigrationReport[0].freedCbp);eq('Spalthieb migriert','tech_heavy_melee_breaking_counter',legacyOwner.skills.skill_2.learnedTechniqueIds[0]);eq('Migration idempotent',once,JSON.stringify(legacy));
  testResults.replaceChildren(el('table',{},[el('thead',{},[el('tr',{},['Test','Erwartet','Berechnet','Status'].map(value=>el('th',{text:value})))]),el('tbody',{},tests.map(([name,expected,actual,ok])=>el('tr',{},[name,expected,actual,ok?'Bestanden':'Fehler'].map(value=>el('td',{text:String(value)})))))]));testsDialog.showModal();return tests.every(test=>test[3]);
}
runTests=runTestsV178;testsBtn.onclick=runTestsV178;

state.appVersion=V178_VERSION;state.schemaVersion=V178_SCHEMA;save();renderAll();
Object.assign(window.Eberos,{version:V178_VERSION,schemaVersion:V178_SCHEMA,rulesVersion:V178_RULES,runTests:runTestsV178,combatTechniqueDb:COMBAT_DB_V178,combatTechniqueValidation:COMBAT_VALIDATION_V178,combatTechniqueCapacity:combatTechniqueCapacityV176,learnCombatTechnique:learnCombatTechniqueV176,unlearnCombatTechnique:unlearnCombatTechniqueV176,canLearnCombatTechnique:canLearnCombatTechniqueV176,ensureStateV178,ensureOwnerV178,allSkillsV178,createCustomSkillV178,archiveCustomSkillV178,restoreCustomSkillV178,advanceCombatClockV178,migrationReport:()=>state.v178MigrationReport});
