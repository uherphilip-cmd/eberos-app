'use strict';

/* Eberos v1.7.6: Zauber, Wunder und Flüche */
const POWER_DB_V176=window.EBEROS_POWER_DB||{meta:{},schools:[],entries:[]};
const POWER_ENTRIES_V176=Array.isArray(POWER_DB_V176.entries)?POWER_DB_V176.entries:[];
const POWER_SCHOOLS_V176=Array.isArray(POWER_DB_V176.schools)?POWER_DB_V176.schools:[];
const POWER_BY_ID_V176=new Map(POWER_ENTRIES_V176.map(entry=>[entry.id,entry]));
const POWER_SCHOOL_BY_SKILL_V176=new Map(POWER_SCHOOLS_V176.map(school=>[school.skillId,school]));
const POWER_PATH_LABELS_V176={M:'Zauber',GB:'Wunder',FS:'Flüche'};
const POWER_KIND_LABELS_V176={spell:'Zauber',miracle:'Wunder',curse:'Fluch'};
const POWER_COUNTER_LABELS_V176={M:'Mana',GB:'Glaube',FS:'Finsternis'};
const POWER_SKILL_IDS_V176=new Set(POWER_SCHOOLS_V176.map(school=>school.skillId));
const POWER_PATH_OPTIONS_BY_SKILL_V176=new Map(POWER_SCHOOLS_V176.map(school=>{
  const skill=SKILLS.find(entry=>entry.id===school.skillId),options=[...new Set(String(skill?.use||'').match(/\b(?:M|GB|FS)\b/g)||[])];
  return[school.skillId,options];
}).filter(([,options])=>options.length>1));
const LEGACY_DRUID_SKILL_ID_V176='skill_71';
const LEGACY_DRUID_SKILL_NAME_V176='Naturmagie & Druidenlehren';
const DRUID_SKILL_IDS_V176=['skill_druid_flora','skill_druid_fauna'];

const powerStyleV176=el('style',{text:`
.power-library-v176{margin-top:1rem;padding-top:.85rem;border-top:2px solid var(--accent-2)}
.power-library-head-v176{display:flex;align-items:flex-start;justify-content:space-between;gap:.6rem;flex-wrap:wrap}
.power-library-head-v176 h3{margin:.1rem 0}.power-library-head-v176 p{margin:.1rem 0}
.power-skill-list-v176{display:grid;gap:.75rem;margin-top:.7rem}
.power-skill-group-v176{border:1px solid var(--border);border-radius:10px;background:color-mix(in srgb,var(--panel-bg) 90%,var(--accent-2));overflow:hidden}
.power-skill-group-v176>summary{display:flex;align-items:center;justify-content:space-between;gap:.5rem;flex-wrap:wrap;padding:.7rem;cursor:pointer;background:var(--panel-alt);font-weight:800}
.power-skill-meta-v176{display:flex;gap:.35rem;flex-wrap:wrap;font-size:.82rem}
.power-badge-v176{display:inline-flex;align-items:center;padding:.18rem .45rem;border:1px solid var(--accent-2);border-radius:999px;background:var(--panel-bg);white-space:nowrap}
.power-group-body-v176{display:grid;gap:.55rem;padding:.65rem}
.power-row-v176{display:grid;grid-template-columns:auto minmax(11rem,1fr) minmax(12rem,2fr) auto;gap:.55rem;align-items:center;padding:.6rem;border:1px solid var(--border);border-radius:9px;background:var(--panel-bg)}
.power-row-v176:focus-visible{outline:3px solid color-mix(in srgb,var(--accent-2),white 35%);outline-offset:2px}
.power-code-v176{font-family:var(--font-number);font-weight:800;color:var(--accent)}
.power-name-v176 strong{display:block}.power-name-v176 small,.power-summary-v176{color:var(--muted)}
.power-actions-v176{display:flex;gap:.3rem;align-items:center}
.power-select-row-v176{display:grid;grid-template-columns:minmax(12rem,1fr) minmax(10rem,1.4fr) auto;gap:.5rem;align-items:end;padding:.6rem;border:1px dashed var(--accent-2);border-radius:9px;background:color-mix(in srgb,var(--panel-bg) 85%,var(--accent-2))}
.power-select-preview-v176{margin:0;font-size:.86rem;color:var(--muted)}
.power-select-detail-v176,.power-inline-detail-v176{grid-column:1/-1;min-width:0;padding-top:.55rem;border-top:1px solid var(--border)}
.power-inline-detail-v176[hidden]{display:none}
.power-detail-v176{display:grid;gap:.55rem}.power-detail-grid-v176{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.45rem}
.power-detail-section-v176{padding:.55rem;border:1px solid var(--border);border-radius:8px;background:var(--panel-bg)}
.power-detail-section-v176 h4{margin:.05rem 0 .25rem}.power-detail-section-v176 p{white-space:pre-wrap}
.power-current-v176{display:flex;gap:.35rem;flex-wrap:wrap}
.power-warning-v176{border-left:5px solid var(--danger)}
.power-path-choice-v176{margin:.65rem 0;padding:.75rem;border:2px solid var(--accent-2);border-radius:10px;background:var(--panel-alt)}
.power-path-choice-v176 h3{margin:.05rem 0 .35rem}.power-path-choice-list-v176{display:grid;gap:.55rem}.power-path-choice-row-v176{display:flex;align-items:center;justify-content:space-between;gap:.55rem;flex-wrap:wrap;padding:.55rem;border:1px solid var(--border);border-radius:8px;background:var(--panel-bg)}.power-path-choice-actions-v176{display:flex;gap:.35rem;flex-wrap:wrap}
.druid-migration-v176{margin:.65rem 0;padding:.75rem;border:2px solid var(--accent-2);border-radius:10px;background:var(--panel-alt)}
.druid-migration-v176 h3{margin:.05rem 0 .35rem}.druid-migration-actions-v176{display:flex;gap:.5rem;flex-wrap:wrap}
@media(max-width:760px){.power-row-v176,.power-select-row-v176{grid-template-columns:1fr}.power-actions-v176{justify-content:flex-start}.power-detail-grid-v176{grid-template-columns:1fr}}
@media(max-width:390px){.power-skill-group-v176>summary{align-items:flex-start}.power-badge-v176{white-space:normal}.power-row-v176{padding:.5rem}}
@media print{.power-select-row-v176,.power-path-choice-v176,.druid-migration-v176,.power-actions-v176,.power-library-head-v176 .muted,.power-inline-detail-v176{display:none!important}.power-skill-group-v176.has-no-learned{display:none!important}.power-library-v176{break-before:auto}.power-skill-group-v176{break-inside:avoid}.power-skill-group-v176>summary{list-style:none}.power-skill-group-v176>summary::-webkit-details-marker{display:none}.power-row-v176{grid-template-columns:auto 1fr 2fr;border:0;border-bottom:1px solid #999}.power-row-v176 .power-actions-v176{display:none!important}}
`});
document.head.append(powerStyleV176);

function validatePowerCatalogV176(){
  const errors=[],ids=new Set(),schoolCodes=new Map(),pathCounts={M:0,GB:0,FS:0},reinforcement={yes:0,no:0};
  if(POWER_ENTRIES_V176.length!==270)errors.push(`270 Einträge erwartet, ${POWER_ENTRIES_V176.length} gefunden`);
  if(POWER_SCHOOLS_V176.length!==27)errors.push(`27 Schulen erwartet, ${POWER_SCHOOLS_V176.length} gefunden`);
  for(const entry of POWER_ENTRIES_V176){
    if(!entry?.id||ids.has(entry.id))errors.push(`Doppelte oder leere Power-ID: ${entry?.id||'—'}`);
    ids.add(entry?.id);
    if(!(entry.pathId in pathCounts))errors.push(`${entry.id}: ungültiger Pfad ${entry.pathId}`);
    else pathCounts[entry.pathId]++;
    if(!POWER_SKILL_IDS_V176.has(entry.skillId))errors.push(`${entry.id}: unbekannte Fähigkeit ${entry.skillId}`);
    if(!Array.isArray(entry.sourceRecord)||entry.sourceRecord.length!==15||entry.sourceRecord.some(value=>String(value??'').trim()===''))errors.push(`${entry.id}: 15 Quellfelder nicht vollständig`);
    const key=`${entry.schoolId}|${entry.code}`;
    if(schoolCodes.has(key))errors.push(`${entry.id}: doppelter Schulcode ${key}`);
    schoolCodes.set(key,true);
    if(entry.reinforceable){
      reinforcement.yes++;
      if(!entry.reinforcement?.ruleType||entry.reinforcement.ruleType==='unknown')errors.push(`${entry.id}: Verstärkung nicht klassifiziert`);
    }else reinforcement.no++;
  }
  for(const school of POWER_SCHOOLS_V176){
    const entries=POWER_ENTRIES_V176.filter(entry=>entry.schoolId===school.schoolId);
    const codes=entries.map(entry=>entry.code).sort((a,b)=>Number(a.slice(1))-Number(b.slice(1))).join(',');
    if(entries.length!==10||codes!=='Z1,Z2,Z3,Z4,Z5,Z6,Z7,Z8,Z9,Z10')errors.push(`${school.schoolLabel}: Z1 bis Z10 unvollständig`);
  }
  if(`${pathCounts.M}|${pathCounts.GB}|${pathCounts.FS}`!=='140|50|80')errors.push(`Pfadverteilung ${pathCounts.M}/${pathCounts.GB}/${pathCounts.FS}`);
  if(`${reinforcement.yes}|${reinforcement.no}`!=='162|108')errors.push(`Verstärkungsverteilung ${reinforcement.yes}/${reinforcement.no}`);
  const renamed=POWER_ENTRIES_V176.find(entry=>entry.schoolLabel==='Schutz- & Bewahrungswunder'&&entry.code==='Z8');
  if(renamed?.displayName!=='Hand der Fürsprache'||renamed?.sourceName!=='Schützende Hand')errors.push('Namenskorrektur für Schutz- & Bewahrungswunder Z8 fehlt');
  return{ok:errors.length===0,errors,pathCounts,reinforcement,ids:ids.size};
}
const POWER_VALIDATION_V176=validatePowerCatalogV176();
if(!POWER_VALIDATION_V176.ok)showError('Power-Katalog fehlerhaft: '+POWER_VALIDATION_V176.errors.join(' · '));

function normalizeSkillPowerDataV176(data){
  const value=data&&typeof data==='object'&&!Array.isArray(data)?data:{};
  value.level=Math.max(0,Math.min(25,+value.level||0));
  value.fav=!!value.fav;
  value.note=String(value.note||'');
  const ids=Array.isArray(value.learnedPowerIds)?value.learnedPowerIds.filter(id=>typeof id==='string'&&id.trim()):[];
  value.learnedPowerIds=[...new Set(ids)];
  return value;
}

function normalizePowerPathChoicesV176(owner){
  const source=owner.powerPathChoicesV176&&typeof owner.powerPathChoicesV176==='object'&&!Array.isArray(owner.powerPathChoicesV176)?owner.powerPathChoicesV176:{};
  owner.powerPathChoicesV176={};
  for(const[skillId,options]of POWER_PATH_OPTIONS_BY_SKILL_V176){
    if(options.includes(source[skillId]))owner.powerPathChoicesV176[skillId]=source[skillId];
  }
  return owner.powerPathChoicesV176;
}

function powerPathOptionsV176(skillId){
  const options=POWER_PATH_OPTIONS_BY_SKILL_V176.get(skillId);
  return options?.length?options:[POWER_SCHOOL_BY_SKILL_V176.get(skillId)?.pathId].filter(Boolean);
}

function resolvedPowerPathV176(owner,skillOrSchool){
  const skillId=typeof skillOrSchool==='string'?skillOrSchool:skillOrSchool?.skillId,options=POWER_PATH_OPTIONS_BY_SKILL_V176.get(skillId);
  if(!options)return POWER_SCHOOL_BY_SKILL_V176.get(skillId)?.pathId||skillOrSchool?.pathId||null;
  const choice=owner?.powerPathChoicesV176?.[skillId];
  return options.includes(choice)?choice:null;
}

function assignPowerPathV176(owner,skillId,pathId){
  ensureOwnerPowersV176(owner);
  const options=POWER_PATH_OPTIONS_BY_SKILL_V176.get(skillId);
  if(!options?.includes(pathId)||owner.powerPathChoicesV176[skillId])return false;
  owner.powerPathChoicesV176[skillId]=pathId;
  return true;
}

function canonicalSkillOrderV176(owner){
  const allowed=new Set(SKILLS.map(skill=>skill.id)),given=Array.isArray(owner.skillOrder)?owner.skillOrder:[],order=given.filter((id,index)=>allowed.has(id)&&given.indexOf(id)===index);
  for(const skill of SKILLS)if(!order.includes(skill.id))order.push(skill.id);
  for(const id of DRUID_SKILL_IDS_V176){const index=order.indexOf(id);if(index>=0)order.splice(index,1)}
  const anchor=Math.max(0,order.indexOf('skill_70')+1);
  order.splice(anchor,0,...DRUID_SKILL_IDS_V176);
  owner.skillOrder=order;
  return order;
}

function resolveSkillReferenceV176(owner,reference){
  if(reference===LEGACY_DRUID_SKILL_NAME_V176||reference===LEGACY_DRUID_SKILL_ID_V176){
    const choice=owner?.migrations?.druidSplit?.choice;
    return DRUID_SKILL_IDS_V176.includes(choice)?choice:null;
  }
  return SKILLS.find(skill=>skill.id===reference||skill.name===reference)?.id||null;
}

function ensureSkillModifierIdsV176(owner){
  for(const disadvantage of owner?.disadvantages||[]){
    disadvantage.effects=disadvantage.effects&&typeof disadvantage.effects==='object'?disadvantage.effects:{};
    const names=disadvantage.effects.skills&&typeof disadvantage.effects.skills==='object'?disadvantage.effects.skills:{};
    const ids=disadvantage.effects.skillIds&&typeof disadvantage.effects.skillIds==='object'?disadvantage.effects.skillIds:{};
    for(const[reference,value]of Object.entries(names)){
      const id=resolveSkillReferenceV176(owner,reference);
      if(id&&ids[id]===undefined)ids[id]=+value||0;
    }
    disadvantage.effects.skillIds=ids;
  }
}

function prepareDruidMigrationV176(owner){
  owner.migrations=owner.migrations&&typeof owner.migrations==='object'?owner.migrations:{};
  if(owner.migrations.druidSplit)return owner.migrations.druidSplit;
  const legacy=owner.skills?.[LEGACY_DRUID_SKILL_ID_V176];
  if(!legacy){
    owner.migrations.druidSplit={version:1,status:'not_required',choice:null,at:new Date().toISOString()};
    return owner.migrations.druidSplit;
  }
  const oldData=structuredClone(normalizeSkillPowerDataV176(legacy));
  owner.legacySkillsV176=owner.legacySkillsV176&&typeof owner.legacySkillsV176==='object'?owner.legacySkillsV176:{};
  owner.legacySkillsV176[LEGACY_DRUID_SKILL_ID_V176]=structuredClone(oldData);
  if(oldData.level<=0){
    const flora=owner.skills.skill_druid_flora;
    if(oldData.note&&!flora.note)flora.note=oldData.note;
    if(oldData.fav)flora.fav=true;
    delete owner.skills[LEGACY_DRUID_SKILL_ID_V176];
    owner.migrations.druidSplit={version:1,status:'not_required',choice:null,oldData,at:new Date().toISOString()};
  }else{
    owner.migrations.druidSplit={version:1,status:'pending',choice:null,oldSkillId:LEGACY_DRUID_SKILL_ID_V176,oldData,oldCost:skillCost(oldData.level),at:new Date().toISOString()};
  }
  return owner.migrations.druidSplit;
}

function ownerHasPowerAccessV176(owner){
  return [...POWER_SKILL_IDS_V176].some(skillId=>{
    const data=owner?.skills?.[skillId];
    return(+data?.level||0)>0||(data?.learnedPowerIds||[]).length>0;
  });
}

function ensurePowerCardV176(owner){
  if(!owner||owner.type==='possession'||!ownerHasPowerAccessV176(owner)||!Array.isArray(owner.layout)||owner.layout.some(card=>card.type==='fatePath'))return;
  owner.layout.push(cardObject('fatePath',owner.layout.length,12));
}

function ensureOwnerPowersV176(owner){
  if(!owner||typeof owner!=='object'||owner.type==='possession')return owner;
  ensureOwnerSkillsR13(owner);
  for(const skill of SKILLS)owner.skills[skill.id]=normalizeSkillPowerDataV176(owner.skills[skill.id]);
  normalizePowerPathChoicesV176(owner);
  if(Array.isArray(owner.spells)&&owner.spells.length&&!owner.legacySpellsV176)owner.legacySpellsV176=structuredClone(owner.spells);
  prepareDruidMigrationV176(owner);
  canonicalSkillOrderV176(owner);
  ensureSkillModifierIdsV176(owner);
  ensurePowerCardV176(owner);
  return owner;
}

function ensureStateV176(data,log=true){
  const first=!data.v176PowerSystemDone,counterFixFirst=!data.v176CounterMinimumR3Done,pathBindingFirst=!data.v176PowerPathBindingR5Done;
  for(const character of data.characters||[]){
    ensureOwnerPowersV176(character);
    for(const owner of character.auxiliaryTabs||[])ensureOwnerPowersV176(owner);
  }
  data.appVersion=APP_VERSION;
  data.schemaVersion=SCHEMA_VERSION;
  data.v176PowerSystemDone=true;
  data.v176CounterMinimumR3Done=true;
  data.v176PowerPathBindingR5Done=true;
  if(first&&log){
    data.migrationLog=Array.isArray(data.migrationLog)?data.migrationLog:[];
    data.migrationLog.push({from:13,to:14,at:new Date().toISOString(),changes:['270 Zauber, Wunder und Flüche integriert','Sechs neue beziehungsweise aufgeteilte Fähigkeiten ergänzt','Druidenmigration vorbereitet','Gelernte Powers auf stabile IDs umgestellt']});
  }
  if(counterFixFirst&&log){
    data.migrationLog=Array.isArray(data.migrationLog)?data.migrationLog:[];
    data.migrationLog.push({from:14,to:14,at:new Date().toISOString(),changes:['Counter-Maximum regelkonform auf mindestens 2 begrenzt','Aktueller Countervorrat bleibt bis 0 nutzbar','Dauerhaften Counter-Hilfstext entfernt']});
  }
  if(pathBindingFirst&&log){
    data.migrationLog=Array.isArray(data.migrationLog)?data.migrationLog:[];
    data.migrationLog.push({from:14,to:14,at:new Date().toISOString(),changes:['Mehrdeutige Machtfähigkeiten erfordern eine einmalige Counter-Zuordnung','Thanaturgie wird nicht mehr automatisch Finsternis zugeordnet','Kraftdetails vor dem Lernen vollständig eingeblendet']});
  }
  return data;
}

const migrateStateBeforeV176=migrateState;
migrateState=function(data){return ensureStateV176(migrateStateBeforeV176(data),true)};
if(!state.v176PowerSystemDone||!state.v176CounterMinimumR3Done||!state.v176PowerPathBindingR5Done){
  try{localStorage.setItem(STORE+'.backup.v176.'+Date.now(),JSON.stringify(state))}catch{}
}
state=ensureStateV176(state,true);

const newCharacterBeforeV176=newCharacter,newAuxEntryBeforeV176=newAuxEntry;
newCharacter=function(){return ensureOwnerPowersV176(newCharacterBeforeV176())};
newAuxEntry=function(type,name){const owner=newAuxEntryBeforeV176(type,name);return type==='possession'?owner:ensureOwnerPowersV176(owner)};

skillModifiers=function(owner){
  const out=Object.fromEntries(SKILLS.map(skill=>[skill.id,0]));
  ensureSkillModifierIdsV176(owner);
  for(const disadvantage of activeDisadvantages(owner)){
    const canonical=disadvantage.effects?.skillIds&&typeof disadvantage.effects.skillIds==='object'?disadvantage.effects.skillIds:{};
    if(Object.keys(canonical).length){
      for(const[reference,value]of Object.entries(canonical)){
        const id=resolveSkillReferenceV176(owner,reference)||reference;
        if(id in out)out[id]+=+value||0;
      }
    }else{
      for(const[reference,value]of Object.entries(disadvantage.effects?.skills||{})){
        const id=resolveSkillReferenceV176(owner,reference);
        if(id in out)out[id]+=+value||0;
      }
    }
  }
  return out;
};

function effectiveSkillLevelV176(owner,skillId){
  ensureOwnerPowersV176(owner);
  const bought=+owner.skills?.[skillId]?.level||0,modifier=+skillModifiers(owner)[skillId]||0;
  return Math.max(0,Math.min(25,bought+modifier));
}
function bonusValueV176(level){const s=Math.max(0,Math.min(25,+level||0));return s<=0?0:Math.ceil(s/5)}
function dieValueV176(level){return String(DICE[Math.max(0,Math.min(25,+level||0))]||'—').split(' · ')[0]}
function learningCapacityV176(owner,skillId){return Math.min(10,Math.max(0,+owner.skills?.[skillId]?.level||0))}
function learnedPowerIdsV176(owner,skillId){return normalizeSkillPowerDataV176(owner.skills?.[skillId]).learnedPowerIds}
function powersForSkillV176(skillId){return POWER_ENTRIES_V176.filter(entry=>entry.skillId===skillId).sort((a,b)=>Number(a.code.slice(1))-Number(b.code.slice(1)))}

function learnPowerV176(owner,skillId,powerId){
  ensureOwnerPowersV176(owner);
  const entry=POWER_BY_ID_V176.get(powerId),data=owner.skills[skillId],ids=data.learnedPowerIds;
  if(!entry||entry.skillId!==skillId||ids.includes(powerId)||ids.length>=learningCapacityV176(owner,skillId))return false;
  ids.push(powerId);
  return true;
}

function unlearnPowerV176(owner,skillId,powerId){
  ensureOwnerPowersV176(owner);
  const ids=owner.skills[skillId].learnedPowerIds,index=ids.indexOf(powerId);
  if(index<0)return false;
  ids.splice(index,1);
  return true;
}

function setPurchasedSkillLevelV176(owner,skillId,nextLevel,confirmRemoval=message=>confirm(message)){
  ensureOwnerPowersV176(owner);
  const data=owner.skills[skillId],previous=+data.level||0,next=Math.max(0,Math.min(25,+nextLevel||0)),capacity=Math.min(10,next);
  if(next<previous&&data.learnedPowerIds.length>capacity){
    const removed=data.learnedPowerIds.slice(capacity).reverse(),labels=removed.map(id=>POWER_BY_ID_V176.get(id)?.displayName||id);
    const accepted=confirmRemoval(`Durch die niedrigere Stufe werden zuletzt gelernte Einträge entfernt:\n\n${labels.map(label=>'• '+label).join('\n')}\n\nÄnderung übernehmen?`);
    if(!accepted)return false;
    data.learnedPowerIds.splice(capacity);
  }
  data.level=next;
  ensurePowerCardV176(owner);
  return true;
}

function resolveDruidMigrationV176(owner,choice){
  ensureOwnerPowersV176(owner);
  const migration=owner.migrations?.druidSplit;
  if(migration?.status!=='pending'||!DRUID_SKILL_IDS_V176.includes(choice))return false;
  const old=structuredClone(migration.oldData||owner.skills[LEGACY_DRUID_SKILL_ID_V176]||{level:0,fav:false,note:'',learnedPowerIds:[]});
  const selected=owner.skills[choice],other=owner.skills[DRUID_SKILL_IDS_V176.find(id=>id!==choice)];
  Object.assign(selected,{level:+old.level||0,fav:!!old.fav,note:String(old.note||''),learnedPowerIds:[...new Set(old.learnedPowerIds||[])]});
  Object.assign(other,{level:0,fav:false,note:other.note||'',learnedPowerIds:other.learnedPowerIds||[]});
  migration.status='resolved';migration.choice=choice;migration.resolvedAt=new Date().toISOString();
  delete owner.skills[LEGACY_DRUID_SKILL_ID_V176];
  for(const disadvantage of owner.disadvantages||[]){
    const value=disadvantage.effects?.skills?.[LEGACY_DRUID_SKILL_NAME_V176]??disadvantage.effects?.skills?.[LEGACY_DRUID_SKILL_ID_V176];
    if(value!==undefined){
      disadvantage.effects.skillIds=disadvantage.effects.skillIds||{};
      disadvantage.effects.skillIds[choice]=+value||0;
    }
  }
  canonicalSkillOrderV176(owner);
  ensurePowerCardV176(owner);
  return true;
}

function druidMigrationNoticeV176(owner){
  const migration=owner?.migrations?.druidSplit;
  if(migration?.status!=='pending')return null;
  const level=+migration.oldData?.level||0,cost=skillCost(level),box=el('section',{class:'druid-migration-v176'});
  box.append(el('h3',{text:'Druidenfähigkeit einmalig aufteilen'}),el('p',{text:`Die bisherige Fähigkeit „${LEGACY_DRUID_SKILL_NAME_V176}“ besitzt Stufe ${level} (${cost} CBP). Wähle, wohin der vollständige Altwert übertragen wird. Er wird nicht verdoppelt.`}));
  const actions=el('div',{class:'druid-migration-actions-v176'});
  for(const[id,label]of[['skill_druid_flora','Auf Flora übertragen'],['skill_druid_fauna','Auf Fauna übertragen']]){
    actions.append(el('button',{class:'primary',type:'button',text:label,onclick:()=>{
      if(!confirm(`${label}? Der vollständige Altwert wird ausschließlich auf diesen Pfad übertragen.`))return;
      if(resolveDruidMigrationV176(owner,id)){save();renderAll()}
    }}));
  }
  box.append(actions);return box;
}

function pendingPowerPathSchoolsV176(owner){
  return POWER_SCHOOLS_V176.filter(school=>{
    if(!POWER_PATH_OPTIONS_BY_SKILL_V176.has(school.skillId)||resolvedPowerPathV176(owner,school))return false;
    const data=owner.skills?.[school.skillId];
    return(+data?.level||0)>0||(data?.learnedPowerIds||[]).length>0;
  });
}

function renderPowerPathChoicesV176(owner,onAssigned=()=>{}){
  ensureOwnerPowersV176(owner);
  const pending=pendingPowerPathSchoolsV176(owner);
  if(!pending.length)return null;
  const box=el('section',{class:'power-path-choice-v176'});
  box.append(el('h3',{text:'Counter einmalig zuordnen'}),el('p',{text:'Diese Fähigkeiten können mehrere Macht-Counter verwenden. Wähle einmal den Counter; erst danach erscheint die zugehörige Kraftliste im gewählten Schicksalsfenster.'}));
  const list=el('div',{class:'power-path-choice-list-v176'});
  for(const school of pending){
    const actions=el('div',{class:'power-path-choice-actions-v176'});
    for(const pathId of powerPathOptionsV176(school.skillId)){
      actions.append(el('button',{class:'primary',type:'button',text:`${POWER_COUNTER_LABELS_V176[pathId]} (${pathId})`,onclick:()=>{
        if(!assignPowerPathV176(owner,school.skillId,pathId))return;
        persistOwnerR5(owner,false);
        for(const target of powerPathOptionsV176(school.skillId))replacePowerLibraryV176(owner,target);
        onAssigned();
      }}));
    }
    list.append(el('div',{class:'power-path-choice-row-v176'},[el('strong',{text:school.skillName}),actions]));
  }
  box.append(list);return box;
}

function safeArithmeticV176(expression){
  const source=String(expression||'').replace(/,/g,'.').replace(/×/g,'*').replace(/\s+/g,''),tokens=source.match(/\d+(?:\.\d+)?|[()+\-*/]/g);
  if(!tokens||tokens.join('')!==source)return null;
  let index=0;
  const parsePrimary=()=>{
    const token=tokens[index++];
    if(token==='('){const value=parseExpression();if(tokens[index++]!==')')throw Error('Klammer');return value}
    if(token==='-')return-parsePrimary();
    const value=Number(token);if(!Number.isFinite(value))throw Error('Zahl');return value;
  };
  const parseTerm=()=>{let value=parsePrimary();while(tokens[index]==='*'||tokens[index]==='/'){const operator=tokens[index++],right=parsePrimary();if(operator==='/'&&right===0)throw Error('Division');value=operator==='*'?value*right:value/right}return value};
  const parseExpression=()=>{let value=parseTerm();while(tokens[index]==='+'||tokens[index]==='-'){const operator=tokens[index++],right=parseTerm();value=operator==='+'?value+right:value-right}return value};
  try{const value=parseExpression();return index===tokens.length&&Number.isFinite(value)?value:null}catch{return null}
}

function formatRuleTextV176(value,level,reinforcementLevel=null){
  const s=Math.max(0,Math.min(25,+level||0)),b=bonusValueV176(s),w=dieValueV176(s),v=reinforcementLevel===null?'V':Math.max(0,+reinforcementLevel||0);
  let result=String(value||'').replace(/(^|[^A-Za-zÄÖÜäöüß])([SBWV])(?=[^A-Za-zÄÖÜäöüß]|$)/g,(match,prefix,token)=>prefix+({S:s,B:b,W:w,V:v}[token]));
  result=result.replace(/(?<![A-Za-zÄÖÜäöüßW])\d+(?:\s*[×*+\-]\s*\d+)+(?![A-Za-zÄÖÜäöüß])/g,expression=>{
    const calculated=safeArithmeticV176(expression);
    return calculated===null?expression:String(Number.isInteger(calculated)?calculated:+calculated.toFixed(2));
  });
  return result;
}

function reinforcementSummaryV176(entry,owner,reinforcementLevel){
  const s=effectiveSkillLevelV176(owner,entry.skillId),b=bonusValueV176(s),w=dieValueV176(s),v=Math.max(1,Math.min(2,+reinforcementLevel||1)),addition=v*b;
  if(!entry.reinforceable)return'Nicht verstärkbar';
  const formula=entry.reinforcement?.rounding==='ceil'?`ceil((${w} + ${addition}) / 2)`:`${w} + ${addition}`;
  return`${entry.reinforcement?.targetComponent||'Genannte W-Komponente'}: ${formula} · zusätzlich ${v} ${v===1?'Punkt':'Punkte'} desselben beim Wirken gewählten Counters`;
}

function detailSectionV176(title,value){
  return el('section',{class:'power-detail-section-v176'},[el('h4',{text:title}),el('p',{text:String(value||'—')})]);
}

function powerInfoContentV176(entry,owner){
  const s=effectiveSkillLevelV176(owner,entry.skillId),b=bonusValueV176(s),w=dieValueV176(s),box=el('div',{class:'power-detail-v176'}),current=el('div',{class:'power-current-v176'});
  current.append(el('span',{class:'power-badge-v176',text:`S ${s}`}),el('span',{class:'power-badge-v176',text:`W ${w}`}),el('span',{class:'power-badge-v176',text:`B ${b}`}),el('span',{class:'power-badge-v176',text:POWER_KIND_LABELS_V176[entry.powerKind]||entry.powerKind}),el('span',{class:'power-badge-v176',text:entry.counterCostText}));
  const assignedPath=resolvedPowerPathV176(owner,entry.skillId);
  if(POWER_PATH_OPTIONS_BY_SKILL_V176.has(entry.skillId)&&assignedPath)current.append(el('span',{class:'power-badge-v176',text:`Gebunden: ${POWER_COUNTER_LABELS_V176[assignedPath]}`}));
  const grid=el('div',{class:'power-detail-grid-v176'});
  grid.append(
    detailSectionV176('Schule und Fähigkeit',`${entry.schoolLabel} · ${entry.skillName}`),
    detailSectionV176('Typ und Counter',`${entry.type} · ${entry.counterText} · ${entry.counterCostText}`),
    detailSectionV176('Grundwirkung',formatRuleTextV176(entry.variableWText,s)),
    detailSectionV176('Stufenwerte',formatRuleTextV176(entry.scaleText,s)),
    detailSectionV176('Erklärung',formatRuleTextV176(entry.explanation,s)),
    detailSectionV176('Regeln & Grenzen',formatRuleTextV176(entry.rulesLimits,s)),
    detailSectionV176('Widerstand / Probe',formatRuleTextV176(entry.resistanceCheck,s)),
    detailSectionV176('Dauer',formatRuleTextV176(entry.durationText,s)),
    detailSectionV176('Reichweite',formatRuleTextV176(entry.rangeText,s)),
    detailSectionV176('Verstärkung',entry.reinforcementText)
  );
  if(entry.reinforceable){
    grid.append(detailSectionV176('V1',reinforcementSummaryV176(entry,owner,1)),detailSectionV176('V2',reinforcementSummaryV176(entry,owner,2)));
    if(entry.reinforcement?.choiceText)grid.append(detailSectionV176('Wahlregel',entry.reinforcement.choiceText));
  }
  box.append(current,grid);return box;
}

function powerShortTextV176(entry,owner){
  const level=effectiveSkillLevelV176(owner,entry.skillId);
  return[formatRuleTextV176(entry.variableWText,level),formatRuleTextV176(entry.rangeText,level)].filter(Boolean).join(' · ');
}

function renderLearnedPowerV176(owner,skillId,powerId){
  const entry=POWER_BY_ID_V176.get(powerId);
  if(!entry){
    return el('article',{class:'power-row-v176 power-warning-v176'},[
      el('span',{class:'power-code-v176',text:'?'}),
      el('div',{class:'power-name-v176'},[el('strong',{text:'Unbekannter Legacy-Eintrag'}),el('small',{text:powerId})]),
      el('span',{class:'power-summary-v176',text:'Die Roh-ID bleibt erhalten und wurde nicht automatisch zugeordnet.'})
    ]);
  }
  const row=el('article',{class:'power-row-v176'}),detail=el('div',{class:'power-inline-detail-v176',hidden:true}),info=el('button',{type:'button',text:'Details','aria-label':entry.displayName+' Details anzeigen','aria-expanded':'false'}),remove=el('button',{class:'danger',type:'button',text:'Entfernen','aria-label':entry.displayName+' verlernen'});
  info.onclick=()=>{
    const opening=detail.hidden;
    detail.hidden=!opening;
    info.setAttribute('aria-expanded',String(opening));
    info.textContent=opening?'Details schließen':'Details';
    if(opening&&!detail.childNodes.length)detail.append(powerInfoContentV176(entry,owner));
  };
  remove.onclick=event=>{event.stopPropagation();if(confirm(`„${entry.displayName}“ wirklich aus der Lernliste entfernen?`)){unlearnPowerV176(owner,skillId,powerId);persistPowerLibraryV176(owner,resolvedPowerPathV176(owner,skillId))}};
  row.append(
    el('span',{class:'power-code-v176',text:entry.code}),
    el('div',{class:'power-name-v176'},[el('strong',{text:entry.displayName}),el('small',{text:`${POWER_KIND_LABELS_V176[entry.powerKind]} · ${entry.counterCostText}`})]),
    el('span',{class:'power-summary-v176',text:powerShortTextV176(entry,owner)}),
    el('div',{class:'power-actions-v176'},[info,remove]),
    detail
  );
  return row;
}

function renderPowerSelectionV176(owner,school,slotIndex){
  const pathId=resolvedPowerPathV176(owner,school),learned=new Set(learnedPowerIdsV176(owner,school.skillId)),available=powersForSkillV176(school.skillId).filter(entry=>!learned.has(entry.id)),select=el('select',{'aria-label':`Kraft für ${school.skillName} wählen`}),preview=el('div',{class:'power-select-detail-v176'},[el('p',{class:'power-select-preview-v176',text:'Wähle einen Eintrag. Die vollständigen Regeln erscheinen hier vor dem Lernen.'})]),button=el('button',{class:'primary',type:'button',text:'Lernen',disabled:true});
  select.append(el('option',{value:'',text:`Freier Lernplatz ${slotIndex+1} · Eintrag wählen…`}));
  for(const entry of available)select.append(el('option',{value:entry.id,text:`${entry.code} · ${entry.displayName}`}));
  select.onchange=()=>{
    const entry=POWER_BY_ID_V176.get(select.value);
    button.disabled=!entry;
    preview.replaceChildren(entry?powerInfoContentV176(entry,owner):el('p',{class:'power-select-preview-v176',text:'Wähle einen Eintrag. Die vollständigen Regeln erscheinen hier vor dem Lernen.'}));
  };
  button.onclick=()=>{if(learnPowerV176(owner,school.skillId,select.value))persistPowerLibraryV176(owner,pathId)};
  return el('section',{class:'power-select-row-v176'},[el('label',{class:'field'},[el('span',{text:'Neue Kraft wählen'}),select]),button,preview]);
}

function renderPowerLibraryV176(owner,pathId){
  ensureOwnerPowersV176(owner);
  const box=el('section',{class:'power-library-v176','data-owner-id':owner.id||'','data-path-id':pathId}),head=el('div',{class:'power-library-head-v176'});
  const schools=POWER_SCHOOLS_V176.filter(school=>resolvedPowerPathV176(owner,school)===pathId),entryCount=schools.reduce((sum,school)=>sum+powersForSkillV176(school.skillId).length,0);
  head.append(el('div',{},[el('h3',{text:'Gelernte Kräfte'}),el('p',{class:'muted',text:'Lernplätze entstehen aus der gekauften Stufe der jeweils zugeordneten Fähigkeit. Z1 bis Z10 dürfen frei gewählt werden.'})]),el('span',{class:'power-badge-v176',text:`Katalog ${POWER_DB_V176.meta?.catalogVersion||'1.0'} · ${entryCount} zugeordnete Einträge`}));
  const list=el('div',{class:'power-skill-list-v176'});
  let visible=0;
  for(const school of schools){
    const data=owner.skills[school.skillId],learned=data.learnedPowerIds||[],capacity=learningCapacityV176(owner,school.skillId),free=Math.max(0,capacity-learned.length);
    if(!learned.length&&!free)continue;
    visible++;
    const s=effectiveSkillLevelV176(owner,school.skillId),b=bonusValueV176(s),w=dieValueV176(s),group=el('details',{class:'power-skill-group-v176 '+(learned.length?'':'has-no-learned'),open:true}),summary=el('summary');
    summary.append(el('span',{text:school.skillName}),el('span',{class:'power-skill-meta-v176'},[
      el('span',{class:'power-badge-v176',text:`Gelernt ${learned.length}/${capacity}`}),
      el('span',{class:'power-badge-v176',text:`S ${s}`}),
      el('span',{class:'power-badge-v176',text:w}),
      el('span',{class:'power-badge-v176',text:`B ${b}`}),
      ...(POWER_PATH_OPTIONS_BY_SKILL_V176.has(school.skillId)?[el('span',{class:'power-badge-v176',text:`Gebunden: ${POWER_COUNTER_LABELS_V176[pathId]}`})]:[])
    ]));
    const body=el('div',{class:'power-group-body-v176'});
    for(const powerId of learned)body.append(renderLearnedPowerV176(owner,school.skillId,powerId));
    for(let index=0;index<free;index++)body.append(renderPowerSelectionV176(owner,school,index));
    if(learned.length>capacity)body.append(el('p',{class:'notice error',text:`${learned.length-capacity} gespeicherte Einträge überschreiten die aktuell gekaufte Stufe. Senke oder erhöhe die Stufe über die Fähigkeitenkarte und bestätige dort die Bereinigung.`}));
    group.append(summary,body);list.append(group);
  }
  if(!visible)list.append(el('p',{class:'muted',text:'Noch keine Kräfte gelernt oder diesem Counter zugeordnet.'}));
  box.append(head,list);return box;
}

function currentPowerLibraryV176(owner,pathId){
  return [...document.querySelectorAll('.power-library-v176')].find(node=>node.dataset.ownerId===(owner.id||'')&&node.dataset.pathId===pathId)||null;
}

function replacePowerLibraryV176(owner,pathId){
  const current=currentPowerLibraryV176(owner,pathId);
  if(!current)return false;
  current.replaceWith(renderPowerLibraryV176(owner,pathId));
  return true;
}

function preserveViewportV176(anchor,mutate,recoverAnchor=()=>null){
  const scrollXBefore=window.scrollX,scrollYBefore=window.scrollY,topBefore=anchor?.getBoundingClientRect?.().top;
  const result=mutate();
  const currentAnchor=anchor?.isConnected?anchor:recoverAnchor();
  if(Number.isFinite(topBefore)&&currentAnchor)window.scrollBy(0,currentAnchor.getBoundingClientRect().top-topBefore);
  else window.scrollTo(scrollXBefore,scrollYBefore);
  return result;
}

function persistPowerLibraryV176(owner,pathId){
  const current=currentPowerLibraryV176(owner,pathId);
  preserveViewportV176(current,()=>{
    persistOwnerR5(owner,false);
    replacePowerLibraryV176(owner,pathId);
  },()=>currentPowerLibraryV176(owner,pathId));
}

function updateSkillRowV176(row,owner,skill,isAux){
  const data=owner.skills[skill.id],cells=row?.cells;
  if(!data||!cells)return;
  const level=row.querySelector('.skill-level');
  if(level)level.value=data.level;
  if(isAux){
    if(cells[7])cells[7].textContent=skillCost(data.level);
    if(cells[8])cells[8].textContent=+data.level>=25?'Maximum':`+${skillNextLevelCost(data.level)} CBP`;
    return;
  }
  if(cells[7])cells[7].textContent=effectiveSkillLevelV176(owner,skill.id);
  if(cells[8])cells[8].textContent=skillCost(data.level);
  if(cells[9])cells[9].textContent=+data.level>=25?'Maximum':`+${skillNextLevelCost(data.level)} CBP`;
}

function findSkillRowV176(skill){
  return [...document.querySelectorAll('tbody .skill-level')].find(input=>input.getAttribute('aria-label')===skill.name+' Stufe')?.closest('tr')||null;
}

const renderPowerPathBeforeV176=renderPowerPathR5;
renderPowerPathR5=function(owner,counter){
  const section=renderPowerPathBeforeV176(owner,counter);
  if(['M','GB','FS'].includes(counter))section.append(renderPowerLibraryV176(owner,counter));
  return section;
};

const renderSkillsOwnerBeforeV176=renderSkillsOwnerR5;
renderSkillsOwnerR5=function(owner,isAux=false){
  ensureOwnerPowersV176(owner);
  const box=renderSkillsOwnerBeforeV176(owner,isAux),notice=druidMigrationNoticeV176(owner),choiceHost=el('div',{class:'power-path-choice-host-v176'});
  const refreshChoices=()=>{choiceHost.replaceChildren();const choices=renderPowerPathChoicesV176(owner,refreshChoices);if(choices)choiceHost.append(choices)};
  refreshChoices();
  box.prepend(choiceHost);
  if(notice)box.prepend(notice);
  for(const input of box.querySelectorAll('tbody .skill-level')){
    const row=input.closest('tr'),name=row?.querySelector('.skill-name-r13 strong')?.textContent,skill=SKILLS.find(entry=>entry.name===name);
    if(!skill)continue;
    input.onchange=event=>{
      const previous=+owner.skills[skill.id].level||0,next=Math.max(0,Math.min(25,+event.target.value||0));
      if(!setPurchasedSkillLevelV176(owner,skill.id,next)){event.target.value=previous;return}
      preserveViewportV176(row,()=>{
        updateSkillRowV176(row,owner,skill,isAux);
        persistOwnerR5(owner,false);
        const school=POWER_SCHOOLS_V176.find(entry=>entry.skillId===skill.id);
        if(school)for(const pathId of powerPathOptionsV176(school.skillId))replacePowerLibraryV176(owner,pathId);
        refreshChoices();
      },()=>findSkillRowV176(skill));
    };
  }
  return box;
};

renderSkills=function(){return renderSkillsOwnerR5(ch(),false)};
renderAuxSkillsV17=function(owner){return renderSkillsOwnerR5(owner,true)};

const skillModifiersForPrintBeforeV176=skillModifiersForPrintR15;
skillModifiersForPrintR15=function(owner){try{return skillModifiers(owner)}catch{return skillModifiersForPrintBeforeV176(owner,true)}};

const hasPrintableContentBeforeV176=hasPrintableContentR15;
hasPrintableContentR15=function(card,owner,isCharacter=owner===ch()){
  if(card.type==='fatePath'&&[...POWER_SKILL_IDS_V176].some(skillId=>(owner.skills?.[skillId]?.learnedPowerIds||[]).length))return true;
  return hasPrintableContentBeforeV176(card,owner,isCharacter);
};

const auditBeforeV176=audit;
audit=function(){
  auditBeforeV176();
  auditResults.append(el('h3',{text:'Zauber, Wunder und Flüche'}));
  auditResults.append(el('div',{class:'notice '+(POWER_VALIDATION_V176.ok?'ok':'error'),text:`${POWER_VALIDATION_V176.ok?'✓':'✕'} Katalog: ${POWER_ENTRIES_V176.length} Einträge · ${POWER_SCHOOLS_V176.length} Schulen · M ${POWER_VALIDATION_V176.pathCounts.M} / GB ${POWER_VALIDATION_V176.pathCounts.GB} / FS ${POWER_VALIDATION_V176.pathCounts.FS}`}));
  const owners=[ch(),...(ch().auxiliaryTabs||[]).filter(owner=>owner.type!=='possession')];
  for(const owner of owners){
    const pending=owner.migrations?.druidSplit?.status==='pending',unknown=[...POWER_SKILL_IDS_V176].flatMap(skillId=>(owner.skills?.[skillId]?.learnedPowerIds||[]).filter(id=>!POWER_BY_ID_V176.has(id)));
    auditResults.append(el('div',{class:'notice '+(!pending&&!unknown.length?'ok':''),text:`${!pending&&!unknown.length?'✓':'⚠'} ${owner.name||owner.type||'Charakter'}: ${pending?'Druidenmigration offen · ':''}${unknown.length?unknown.length+' unbekannte Power-IDs':'Power-Daten gültig'}`}));
  }
};

const runTestsBeforeV176=runTests;
runTests=function(){
  runTestsBeforeV176();
  const obsolete=new Set(['Version bleibt 1.7.4','79 Fähigkeiten','79 eindeutige IDs','79 eindeutige Namen','79 Fähigkeiten im Druck','Version 1.7.5','Schema 13','Regelstand 4','App-, Schema- und Regelversion bleiben stabil']);
  const body=testResults.querySelector('tbody');
  for(const row of[...body.querySelectorAll('tr')])if(obsolete.has(row.cells[0]?.textContent))row.remove();
  const previousOk=[...body.querySelectorAll('tr')].every(row=>row.cells[3]?.textContent==='Bestanden'),tests=[],eq=(name,expected,actual)=>tests.push([name,expected,actual,expected===actual]);
  eq('Version 1.7.6','1.7.6',APP_VERSION);
  eq('Schema 14',14,SCHEMA_VERSION);
  eq('Regelstand 5',5,RULES_VERSION);
  eq('Power-Katalog validiert',true,POWER_VALIDATION_V176.ok);
  eq('270 Power-Einträge',270,POWER_ENTRIES_V176.length);
  eq('27 Power-Schulen',27,POWER_SCHOOLS_V176.length);
  eq('270 eindeutige Power-IDs',270,new Set(POWER_ENTRIES_V176.map(entry=>entry.id)).size);
  eq('Pfadverteilung 140/50/80','140|50|80',`${POWER_VALIDATION_V176.pathCounts.M}|${POWER_VALIDATION_V176.pathCounts.GB}|${POWER_VALIDATION_V176.pathCounts.FS}`);
  eq('Verstärkungen 162/108','162|108',`${POWER_VALIDATION_V176.reinforcement.yes}|${POWER_VALIDATION_V176.reinforcement.no}`);
  eq('Alle 15 Quellfelder erhalten',true,POWER_ENTRIES_V176.every(entry=>entry.sourceRecord.length===15));
  eq('Alle Verstärkungen klassifiziert',true,POWER_ENTRIES_V176.filter(entry=>entry.reinforceable).every(entry=>entry.reinforcement?.ruleType));
  eq('84 sichtbare Fähigkeiten',84,SKILLS.length);
  eq('84 eindeutige Skill-IDs',84,new Set(SKILLS.map(skill=>skill.id)).size);
  eq('Sieben mehrdeutige Machtfähigkeiten',7,POWER_PATH_OPTIONS_BY_SKILL_V176.size);
  eq('Thanaturgie verwendet Glaube oder Finsternis','GB|FS',powerPathOptionsV176('skill_38').join('|'));
  eq('Traummagie bietet drei Counter','GB|M|FS',powerPathOptionsV176('skill_72').join('|'));
  eq('Bestehende Skill-ID bleibt erhalten','Ritualistik & Volksmagie',SKILLS.find(skill=>skill.id==='skill_74')?.name);
  eq('Druiden-Flora vorhanden',true,!!SKILLS.find(skill=>skill.id==='skill_druid_flora'));
  eq('Druiden-Fauna vorhanden',true,!!SKILLS.find(skill=>skill.id==='skill_druid_fauna'));
  eq('Alte Druidenfähigkeit nicht sichtbar',false,SKILLS.some(skill=>skill.name===LEGACY_DRUID_SKILL_NAME_V176));
  eq('S0 ergibt keinen Würfel und B0','—|0',`${dieValueV176(0)}|${bonusValueV176(0)}`);
  eq('S6 ergibt W8 und B2','W8|2',`${dieValueV176(6)}|${bonusValueV176(6)}`);
  eq('S16 ergibt W19 und B4','W19|4',`${dieValueV176(16)}|${bonusValueV176(16)}`);
  eq('S25 ergibt W100 und B5','W100|5',`${dieValueV176(25)}|${bonusValueV176(25)}`);
  eq('Sicherer Parser multipliziert',12,safeArithmeticV176('2 × 6'));
  eq('Unsicherer Parser lehnt Text ab',null,safeArithmeticV176('alert(1)'));
  const learner=newCharacter(),fireZ8=POWER_ENTRIES_V176.find(entry=>entry.skillId==='skill_61'&&entry.code==='Z8');
  learner.skills.skill_61.level=1;
  eq('Z8 kann zuerst gelernt werden',true,learnPowerV176(learner,'skill_61',fireZ8.id));
  eq('Doppellernen blockiert',false,learnPowerV176(learner,'skill_61',fireZ8.id));
  eq('Fremde Fähigkeitsliste blockiert',false,learnPowerV176(learner,'skill_62',fireZ8.id));
  learner.skills.skill_61.level=3;
  for(const entry of powersForSkillV176('skill_61').filter(entry=>entry.id!==fireZ8.id).slice(0,2))learnPowerV176(learner,'skill_61',entry.id);
  const learnedBefore=learner.skills.skill_61.learnedPowerIds.join('|');
  eq('Abbruch bewahrt Lernreihenfolge',false,setPurchasedSkillLevelV176(learner,'skill_61',2,()=>false));
  eq('Abbruch verändert Liste nicht',learnedBefore,learner.skills.skill_61.learnedPowerIds.join('|'));
  eq('Bestätigte Senkung möglich',true,setPurchasedSkillLevelV176(learner,'skill_61',2,()=>true));
  eq('Senkung entfernt zuletzt gelernt',2,learner.skills.skill_61.learnedPowerIds.length);
  const legacy=newCharacter();delete legacy.migrations.druidSplit;legacy.skills[LEGACY_DRUID_SKILL_ID_V176]={level:4,fav:true,note:'Alter Druidenwert',learnedPowerIds:[]};legacy.skills.skill_druid_flora={level:0,fav:false,note:'',learnedPowerIds:[]};legacy.skills.skill_druid_fauna={level:0,fav:false,note:'',learnedPowerIds:[]};ensureOwnerPowersV176(legacy);
  eq('Druidenmigration wird vorgemerkt','pending',legacy.migrations.druidSplit.status);
  eq('Altwert wird nicht verdoppelt','0|0',`${legacy.skills.skill_druid_flora.level}|${legacy.skills.skill_druid_fauna.level}`);
  eq('Druidenentscheidung wird gespeichert',true,resolveDruidMigrationV176(legacy,'skill_druid_flora'));
  eq('Druidenwert vollständig übertragen','4|0',`${legacy.skills.skill_druid_flora.level}|${legacy.skills.skill_druid_fauna.level}`);
  eq('Alter aktiver Skill nach Wahl entfernt',false,Object.hasOwn(legacy.skills,LEGACY_DRUID_SKILL_ID_V176));
  const ambiguous=newCharacter();ambiguous.skills.skill_38.level=1;ensureOwnerPowersV176(ambiguous);
  eq('Thanaturgie startet ohne automatische Zuordnung',null,resolvedPowerPathV176(ambiguous,'skill_38'));
  eq('Unzugeordnete Thanaturgie fehlt im Finsternisfenster',false,renderPowerLibraryV176(ambiguous,'FS').textContent.includes('Seelische Schutzmagie & Thanaturgie'));
  eq('Einmalige Counterwahl wird angeboten',true,renderPowerPathChoicesV176(ambiguous)?.textContent.includes('Glaube (GB)'));
  eq('Thanaturgie lässt sich Glaube zuordnen',true,assignPowerPathV176(ambiguous,'skill_38','GB'));
  eq('Zweite Zuordnung wird blockiert',false,assignPowerPathV176(ambiguous,'skill_38','FS'));
  eq('Thanaturgie erscheint nach Wahl im Glaubensfenster',true,renderPowerLibraryV176(ambiguous,'GB').textContent.includes('Seelische Schutzmagie & Thanaturgie'));
  const choiceUiOwner=newCharacter(),choiceUi=renderSkillsOwnerR5(choiceUiOwner,false),choiceUiInput=choiceUi.querySelector('input[aria-label="Seelische Schutzmagie & Thanaturgie Stufe"]');
  choiceUiInput.value='1';choiceUiInput.dispatchEvent(new Event('change',{bubbles:true}));
  eq('Steigern blendet die Counterwahl direkt ein',true,choiceUi.textContent.includes('Counter einmalig zuordnen'));
  const faithChoiceButton=[...choiceUi.querySelectorAll('.power-path-choice-v176 button')].find(button=>button.textContent.includes('Glaube'));
  faithChoiceButton?.click();
  eq('Auswahlknopf speichert Thanaturgie im Glaubenspfad','GB',resolvedPowerPathV176(choiceUiOwner,'skill_38'));
  const rendered=renderPowerLibraryV176(learner,'M');
  eq('Gelernte Power wird im Machtpfad gerendert',true,rendered.textContent.includes(fireZ8.displayName));
  eq('Power-Info enthält S/W/B',true,['S ','W ','B '].every(token=>powerInfoContentV176(fireZ8,learner).textContent.includes(token)));
  eq('Quellenstatus bleibt in Power-Info verborgen',false,powerInfoContentV176(fireZ8,learner).textContent.includes(fireZ8.sourceStatus));
  const fireSchool=POWER_SCHOOL_BY_SKILL_V176.get('skill_61'),selection=renderPowerSelectionV176(learner,fireSchool,0),selectionInput=selection.querySelector('select');
  selectionInput.value=selectionInput.options[1]?.value||'';selectionInput.dispatchEvent(new Event('change'));
  eq('Auswahl zeigt vor dem Lernen vollständige Regeln',true,['Grundwirkung','Regeln & Grenzen','Widerstand / Probe','Verstärkung'].every(label=>selection.textContent.includes(label)));
  const learnedInline=renderLearnedPowerV176(learner,'skill_61',learner.skills.skill_61.learnedPowerIds[0]),detailsButton=[...learnedInline.querySelectorAll('button')].find(button=>button.textContent==='Details');
  detailsButton?.click();
  eq('Gelernte Kraft öffnet Details innerhalb der Karte',true,learnedInline.textContent.includes('Regeln & Grenzen')&&!learnedInline.classList.contains('info-ready-r5'));
  eq('Schwebende Regelfenster haben keinen Schieber','visible',getComputedStyle(rulePopoverR5()).overflowY);
  const stableOwner=newCharacter(),stableSkills=renderSkillsOwnerR5(stableOwner,false),stableInput=stableSkills.querySelector('input[aria-label="Initiative Stufe"]'),stableRow=stableInput.closest('tr');
  stableInput.value='1';stableInput.dispatchEvent(new Event('change',{bubbles:true}));
  eq('Skill-Steigerung behält dieselbe Tabellenzeile',true,stableSkills.contains(stableRow)&&stableInput.closest('tr')===stableRow);
  eq('Skill-Steigerung wird ohne Vollaufbau gespeichert',1,stableOwner.skills.skill_0.level);
  for(const[name,expected,actual,ok]of tests)body.append(el('tr',{},[name,expected,actual,ok?'Bestanden':'Fehler'].map(value=>el('td',{text:String(value)}))));
  return previousOk&&tests.every(test=>test[3]);
};

testsBtn.onclick=runTests;
Object.assign(window.Eberos,{
  version:APP_VERSION,
  schemaVersion:SCHEMA_VERSION,
  rulesVersion:RULES_VERSION,
  runTests:()=>runTests(),
  powerDb:POWER_DB_V176,
  powerValidation:POWER_VALIDATION_V176,
  effectiveSkillLevel:effectiveSkillLevelV176,
  bonusValue:bonusValueV176,
  dieValue:dieValueV176,
  formatRuleText:formatRuleTextV176,
  safeArithmetic:safeArithmeticV176,
  learnPower:learnPowerV176,
  unlearnPower:unlearnPowerV176,
  setPurchasedSkillLevel:setPurchasedSkillLevelV176,
  assignPowerPath:assignPowerPathV176,
  resolvedPowerPath:resolvedPowerPathV176,
  resolveDruidMigration:resolveDruidMigrationV176,
  ensureStateV176
});

save();
renderAll();
