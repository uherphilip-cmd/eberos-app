'use strict';

/* EBEROS v1.7.16-r1 – Hellsicht & Vorhersagen sowie Umbramantie. */
const V1716_VERSION='1.7.16',V1716_REVISION='r1',V1716_SCHEMA=24,V1716_RULES=9,V1716_CATALOG_VERSION='1.3.0';
const V1716_SKILLS=[
  {
    id:'skill_magic_clairvoyance_prophecy',category:'Magie',name:'Hellsicht & Vorhersagen',attrs:'WN, RF',use:'M',
    scope:'Beschreibt das magische Wahrnehmen verborgener Zusammenhänge, wahrscheinlicher Entwicklungen, ferner Orte und zeitlicher Möglichkeiten.',
    reasons:[['WN','Wahrnehmung erfasst Zeichen, verborgene Einzelheiten und feine Veränderungen in Visionen und Omen.'],['RF','Reflexion ordnet mehrdeutige Bilder, Möglichkeiten und zeitliche Zusammenhänge zu einer belastbaren Deutung.']]
  },
  {
    id:'skill_magic_umbramancy',category:'Magie',name:'Umbramantie – Schatten, Geheimnis & Schwellen',attrs:'GS, RF',use:'M',
    scope:'Beschreibt die magische Kontrolle von Schatten, verborgenen Räumen, Übergängen, Schwellen, Dämmerung und schützender Verhüllung.',
    reasons:[['GS','Geschick kontrolliert Position, Kontur, Bewegung und Übergänge der geformten Schatten.'],['RF','Reflexion stabilisiert verborgene Räume, Schwellen und Schattenkonstrukte nach einer einheitlichen magischen Ordnung.']]
  }
];
const V1716_SKILL_IDS=new Set(V1716_SKILLS.map(function(skill){return skill.id}));
const V1716_SCHOOL_IDS=new Set(['clairvoyance_prophecy','umbramancy']);

function installSkillsV1716(){
  for(const definition of V1716_SKILLS){
    const byId=SKILLS.find(function(skill){return skill.id===definition.id}),byName=SKILLS.find(function(skill){return skill.name===definition.name});
    if(byId&&byId.name!==definition.name)throw new Error('v1.7.16: Skill-ID bereits anderweitig vergeben: '+definition.id);
    if(byName&&byName.id!==definition.id)throw new Error('v1.7.16: Regelfähigkeitsname bereits anderweitig vergeben: '+definition.name);
    const skill=byId||{id:definition.id};Object.assign(skill,{id:definition.id,category:definition.category,name:definition.name,attrs:definition.attrs,use:definition.use,scope:definition.scope,attributeReasonsV1715:definition.reasons.map(function(reason){return[reason[0],reason[1]]}),attributeReasonSearchV1715:definition.reasons.map(function(reason){return reason.join(' ')}).join(' ')});
    if(!byId)SKILLS.push(skill);
  }
  for(const definition of V1716_SKILLS){
    const school=POWER_SCHOOL_BY_SKILL_V176.get(definition.id);
    if(!school||school.pathId!=='M'||school.schoolLabel!==definition.name)throw new Error('v1.7.16: Machtkatalog fehlt für '+definition.name);
  }
}
installSkillsV1716();

const styleV1716=el('style',{text:`
.power-common-rule-v1716{margin:.15rem 0 .65rem;border:1px solid var(--accent-2);border-radius:9px;background:var(--panel-alt)}
.power-common-rule-v1716>summary{padding:.55rem .65rem;font-weight:800;cursor:pointer}.power-common-rule-v1716-body{padding:0 .65rem .65rem;white-space:pre-wrap;line-height:1.45}
.power-pool-v1716{display:grid;grid-template-columns:minmax(12rem,1fr) auto;gap:.45rem;align-items:center;flex:1 1 100%;padding:.5rem;margin-top:.25rem;border-top:1px dashed var(--border)}
.power-pool-status-v1716{display:grid;gap:.1rem}.power-pool-status-v1716 strong{font-family:var(--font-number)}.power-pool-actions-v1716{display:flex;gap:.3rem;flex-wrap:wrap}
.power-pool-actions-v1716 button{min-width:3rem}.power-search-target-v1716{outline:3px solid var(--accent-2);outline-offset:3px}
.power-cast-result-v1716{padding:.55rem;border:1px solid var(--accent-2);border-radius:8px;background:var(--panel-alt)}
.power-reduction-list-v1716{display:grid;gap:.4rem;margin:.6rem 0}.power-reduction-row-v1716{display:flex;gap:.45rem;align-items:center;padding:.45rem;border:1px solid var(--border);border-radius:8px}
@media(max-width:600px){.power-pool-v1716{grid-template-columns:1fr}.power-pool-actions-v1716 button{min-height:44px}}
@media print{.power-pool-actions-v1716{display:none!important}.power-common-rule-v1716{break-inside:avoid}}
`});document.head.append(styleV1716);

function cloneV1716(value){return value===undefined?undefined:structuredClone(value)}
function newSkillStateV1716(raw){const value=skillStateV178(raw);value.learnedPowerIds=Array.isArray(value.learnedPowerIds)?[...new Set(value.learnedPowerIds.filter(function(id){return typeof id==='string'}))]:[];return value}
function canonicalSkillOrderV1716(owner){
  const known=new Set([...SKILLS.map(function(skill){return skill.id}),...(owner.customSkills||[]).map(function(skill){return skill.id})]),given=Array.isArray(owner.skillOrder)?owner.skillOrder:[],order=given.filter(function(id,index){return known.has(id)&&given.indexOf(id)===index});
  for(const skill of SKILLS)if(!order.includes(skill.id))order.push(skill.id);for(const skill of owner.customSkills||[])if(!skill.archived&&!order.includes(skill.id))order.push(skill.id);
  for(const id of V1716_SKILL_IDS){const index=order.indexOf(id);if(index>=0)order.splice(index,1)}
  const magicIds=SKILLS.filter(function(skill){return skill.category==='Magie'&&!V1716_SKILL_IDS.has(skill.id)}).map(function(skill){return skill.id}),anchor=Math.max(...magicIds.map(function(id){return order.indexOf(id)}),-1)+1;
  order.splice(anchor,0,...V1716_SKILLS.map(function(skill){return skill.id}));owner.skillOrder=order;return order;
}
function normalizePowerPoolV1716(raw){
  if(!raw||typeof raw!=='object')return null;const maximum=Math.max(0,Math.floor(+raw.maximum||+raw.max||0)),current=Math.max(0,Math.min(maximum,Math.floor(raw.current===undefined?maximum:+raw.current||0)));
  return{label:String(raw.label||'W-Vorrat'),maximum,current,perUseLimit:Math.max(0,Math.floor(+raw.perUseLimit||0)),skillLevel:Math.max(0,Math.min(25,+raw.skillLevel||0)),bonus:Math.max(0,+raw.bonus||0),die:String(raw.die||'—'),roll:Math.max(0,+raw.roll||0),reinforcement:Math.max(0,Math.min(2,+raw.reinforcement||0)),durationText:String(raw.durationText||''),rulesText:String(raw.rulesText||'')};
}
const effectInstanceBeforeV1716=effectInstanceV177;
effectInstanceV177=function(raw={}){const effect=effectInstanceBeforeV1716(raw);const pool=normalizePowerPoolV1716(raw.powerPoolV1716);if(pool)effect.powerPoolV1716=pool;return effect};

function ensureOwnerV1716(owner){
  if(!owner||typeof owner!=='object'||owner.type==='possession')return owner;
  ensureOwnerV1715(owner);ensureOwnerPowersV176(owner);owner.skills=owner.skills&&typeof owner.skills==='object'&&!Array.isArray(owner.skills)?owner.skills:{};
  for(const skill of V1716_SKILLS)owner.skills[skill.id]=newSkillStateV1716(owner.skills[skill.id]);
  owner.activeEffectsV177=Array.isArray(owner.activeEffectsV177)?owner.activeEffectsV177.map(function(effect){const normalized=effectInstanceV177(effect);Object.assign(effect,normalized);return effect}):[];
  canonicalSkillOrderV1716(owner);owner.migrations=owner.migrations&&typeof owner.migrations==='object'?owner.migrations:{};owner.migrations.v1716MagicSchools=true;return owner;
}
function ownerListV1716(data){const owners=[];for(const character of data.characters||[]){owners.push(character);for(const owner of character.auxiliaryTabs||[])if(owner.type!=='possession')owners.push(owner)}return owners}
function ensureStateV1716(data,log=true){
  if(!data||typeof data!=='object')return data;const first=!data.v1716MagicSchoolsMigrationDone,fromSchema=+data.schemaVersion||0,fromApp=data.appVersion||'unbekannt';
  for(const owner of ownerListV1716(data))ensureOwnerV1716(owner);
  data.appVersion=V1716_VERSION;data.schemaVersion=V1716_SCHEMA;data.rulesVersion=V1716_RULES;data.v1716MagicSchoolsMigrationDone=true;data.migrationLog=Array.isArray(data.migrationLog)?data.migrationLog:[];
  if(first&&log!==false)data.migrationLog.push({from:fromSchema,fromApp,to:V1716_SCHEMA,toApp:V1716_VERSION,at:new Date().toISOString(),owners:ownerListV1716(data).length,changes:['Hellsicht & Vorhersagen mit WN + RF auf Stufe 0 ergänzt','Umbramantie – Schatten, Geheimnis & Schwellen mit GS + RF auf Stufe 0 ergänzt','30 Mana-Zauber aus der freigegebenen Kontrollfassung ergänzt','Keine CBP und keine bestehenden Lerninhalte verändert']});
  return data;
}
function backupIncomingStateV1716(data){if(!data||data.v1716MagicSchoolsMigrationDone)return;try{localStorage.setItem(STORE+'.backup.import-v1716.'+Date.now(),JSON.stringify(data))}catch{}}

const migrateStateBeforeV1716=migrateState;
migrateState=function(data){backupIncomingStateV1716(data);return ensureStateV1716(migrateStateBeforeV1716(data),true)};
state=ensureStateV1716(state,true);
const newCharacterBeforeV1716=newCharacter,newAuxEntryBeforeV1716=newAuxEntry;
newCharacter=function(){return ensureOwnerV1716(newCharacterBeforeV1716())};
newAuxEntry=function(type,name){const owner=newAuxEntryBeforeV1716(type,name);return type==='possession'?owner:ensureOwnerV1716(owner)};

function schoolCommonRuleV1716(schoolId){const school=POWER_SCHOOLS_V176.find(function(entry){return entry.schoolId===schoolId});return school?.commonRuleTextV1716?{title:school.commonRuleTitleV1716||'Gemeinsame Schulregel',text:school.commonRuleTextV1716}:null}
function commonRuleNodeV1716(schoolId,open=false){const rule=schoolCommonRuleV1716(schoolId);if(!rule)return null;const details=el('details',{class:'power-common-rule-v1716',open});details.append(el('summary',{text:rule.title}),el('div',{class:'power-common-rule-v1716-body',text:rule.text}));return details}
const powerInfoContentBeforeV1716=powerInfoContentV176;
powerInfoContentV176=function(entry,owner){const box=powerInfoContentBeforeV1716(entry,owner);if(V1716_SCHOOL_IDS.has(entry.schoolId)){const rule=commonRuleNodeV1716(entry.schoolId,false),grid=box.querySelector('.power-detail-grid-v176');if(entry.castingTimeText&&grid)grid.insertBefore(detailSectionV176('Wirken',formatRuleTextV176(entry.castingTimeText,effectiveSkillLevelV176(owner,entry.skillId))),grid.firstChild);if(rule)box.insertBefore(rule,box.querySelector('.power-detail-grid-v176'))}return box};

const renderPowerLibraryBeforeV1716=renderPowerLibraryV176;
renderPowerLibraryV176=function(owner,pathId){
  const box=renderPowerLibraryBeforeV1716(owner,pathId);for(const group of box.querySelectorAll('.power-skill-group-v176')){const name=group.querySelector('summary > span')?.textContent,school=POWER_SCHOOLS_V176.find(function(item){return item.skillName===name});if(!school)continue;group.dataset.schoolIdV1716=school.schoolId;const body=group.querySelector('.power-group-body-v176');if(body&&V1716_SCHOOL_IDS.has(school.schoolId)&&!body.querySelector('.power-common-rule-v1716')){const rule=commonRuleNodeV1716(school.schoolId,false);if(rule)body.prepend(rule)}}return box;
};

function durationSpecV1716(entry,s){const text=String(entry.durationText||'');for(const[pattern,unit]of[[/wartet bis zu S Stunden/i,'hours'],[/kommenden S Tage/i,'days'],[/S Tage/i,'days'],[/S Stunden/i,'hours'],[/S Minuten/i,'minutes'],[/S Runden/i,'rounds']])if(pattern.test(text))return{unit,value:s};return{unit:'manual',value:0}}
function secureRandomIntV1716(maximum){const max=Math.max(1,Math.floor(+maximum||1));if(globalThis.crypto?.getRandomValues){const values=new Uint32Array(1),limit=0x100000000-(0x100000000%max);do{crypto.getRandomValues(values)}while(values[0]>=limit);return values[0]%max+1}return Math.floor(Math.random()*max)+1}
function createPowerEffectV1716(owner,entry,reinforcement,roll){
  ensureOwnerV1716(owner);const s=effectiveSkillLevelV176(owner,entry.skillId),b=bonusValueV176(s),addition=reinforcement*b,maximum=roll+addition,label=entry.reinforcement?.targetComponent||'W-Vorrat',duration=durationSpecV1716(entry,s),effect=effectInstanceV177({name:entry.displayName,description:`${entry.explanation}\n${label}: ${maximum}. Grenze pro Nutzung: höchstens B ${b}.`,category:'Zauberwirkung',sourceType:'magic',sourceId:entry.id,sourceLabel:`${entry.schoolLabel} · ${entry.code}`,active:true,modules:[],durationUnit:duration.unit,durationValue:duration.value,remaining:duration.value||null,stacking:'none',powerPoolV1716:{label,maximum,current:maximum,perUseLimit:b,skillLevel:s,bonus:b,die:dieValueV176(s),roll,reinforcement,durationText:entry.durationText,rulesText:entry.rulesLimits}});
  owner.activeEffectsV177.push(effect);return effect;
}
function adjustPowerPoolV1716(owner,effect,next){const pool=effect?.powerPoolV1716;if(!pool)return false;const value=Math.max(0,Math.min(pool.maximum,Math.floor(+next||0)));if(value===pool.current)return false;const before=pool.current;pool.current=value;effect.updatedAt=new Date().toISOString();owner.effectLogV177=Array.isArray(owner.effectLogV177)?owner.effectLogV177:[];owner.effectLogV177.unshift({id:uid(),at:new Date().toISOString(),event:'power-pool',changes:[{effect:effect.name,counter:pool.label,before,after:value}]});owner.effectLogV177=owner.effectLogV177.slice(0,30);persistEffectsV177(owner,true);return true}

function decoratePowerPoolRowV1716(owner,effect,row){
  const pool=effect.powerPoolV1716;if(!pool||row.querySelector('.power-pool-v1716'))return row;
  const status=el('div',{class:'power-pool-status-v1716'},[el('strong',{text:`${pool.label}: ${pool.current}/${pool.maximum}`}),el('small',{class:'muted',text:`Wurf ${pool.die}: ${pool.roll}${pool.reinforcement?` · V${pool.reinforcement}: +${pool.reinforcement*pool.bonus}`:''} · je Nutzung höchstens B ${pool.perUseLimit}`})]),actions=el('div',{class:'power-pool-actions-v1716'});
  const addButton=function(text,delta,label){return el('button',{type:'button',text,'aria-label':label,disabled:delta<0?pool.current<=0:pool.current>=pool.maximum,onclick:function(event){event.stopPropagation();adjustPowerPoolV1716(owner,effect,pool.current+delta)}})};
  actions.append(addButton('−1',-1,pool.label+' um 1 senken'),addButton(`−B (${pool.perUseLimit})`,-pool.perUseLimit,pool.label+' um B senken'),addButton('+1',1,pool.label+' um 1 erhöhen'),el('button',{type:'button',text:'Auf 0','aria-label':pool.label+' auf 0 setzen',disabled:pool.current<=0,onclick:function(event){event.stopPropagation();if(confirm(`${pool.label} von ${pool.current} auf 0 setzen?`))adjustPowerPoolV1716(owner,effect,0)}}));
  row.append(el('div',{class:'power-pool-v1716'},[status,actions]));return row;
}
const renderEffectRowBeforeV1716=renderEffectRowV177;
renderEffectRowV177=function(owner,effect){return decoratePowerPoolRowV1716(owner,effect,renderEffectRowBeforeV1716(owner,effect))};
const renderEffectRowV1710BeforeV1716=renderEffectRowV1710;
renderEffectRowV1710=function(owner,effect){return decoratePowerPoolRowV1716(owner,effect,renderEffectRowV1710BeforeV1716(owner,effect))};

const powerActionBeforeV1716=powerActionV1712R2;
powerActionV1712R2=function(entry,owner){
  if(!V1716_SCHOOL_IDS.has(entry.schoolId))return powerActionBeforeV1716(entry,owner);
  const ui={reinforcement:0};return actionDisclosureV1712R2(`Zauber wirken · ${entry.counterCostText}`,`${entry.displayName}: Zahlung und W-Wurf vorbereiten`,function(host){
    const controls=el('div',{class:'learned-action-controls-v1712r2'}),summary=el('div'),confirmHost=el('div');host.append(el('strong',{text:`${entry.displayName} – Wirken vorbereiten`}),el('p',{class:'muted',text:'Der erste Klick öffnet nur die Übersicht. Mana wird erst nach der Bestätigung abgezogen; fehlendes Mana kann nicht mit Leben ersetzt werden.'}),controls,summary,confirmHost);
    const draw=function(){
      controls.replaceChildren();const s=effectiveSkillLevelV176(owner,entry.skillId),b=bonusValueV176(s),die=dieValueV176(s),select=el('select',{'aria-label':'Verstärkung'});for(const[value,text]of[['0','Grundwirkung'],['1','Verstärkung V1'],['2','Verstärkung V2']])select.append(el('option',{value,text}));select.value=String(ui.reinforcement);select.onchange=function(event){ui.reinforcement=Math.max(0,Math.min(2,+event.target.value||0));draw()};controls.append(el('label',{class:'field'},[el('span',{text:'Verstärkung'}),select]),el('div',{class:'power-cast-result-v1716',text:`Aktuell: S ${s} · W ${die} · B ${b} · ${entry.reinforcement.targetComponent}: Wurf${ui.reinforcement?` + ${ui.reinforcement*b}`:''}`}));
      const components=[{counterId:'M',amount:1+ui.reinforcement}],plan=actionPaymentPlanV1712R2(owner,components);summary.replaceChildren();appendPaymentSummaryV1712R2(summary,plan,components);if(plan.fallback.length)summary.append(el('p',{class:'notice error',text:'Fehler: Mana darf nicht durch LP ersetzt werden.'}));
      confirmHost.replaceChildren();const button=el('button',{type:'button',class:'primary',text:'Wirken, W würfeln und Mana abziehen',disabled:!plan.valid});button.onclick=function(){
        const existing=(owner.activeEffectsV177||[]).find(function(effect){return effect.active!==false&&effect.sourceType==='magic'&&effect.sourceId===entry.id});if(existing&&!confirm(`„${entry.displayName}“ ist bereits aktiv. Die bisherige Wirkung und ihr Restvorrat werden ersetzt. Fortfahren?`))return;
        const transaction=commitActionPaymentV1712R2(owner,components,entry.id,`${entry.displayName} wirken`,{persist:false,notify:false,render:false});if(!transaction)return;button.disabled=true;
        if(existing)owner.activeEffectsV177=owner.activeEffectsV177.filter(function(effect){return effect!==existing});const sides=dieMaximumV1712R2(owner,entry),roll=secureRandomIntV1716(sides),effect=createPowerEffectV1716(owner,entry,ui.reinforcement,roll);transaction.powerEffectIdV1716=effect.id;transaction.powerEffectOwnerIdV1716=owner.id;transaction.label=`${entry.displayName}: ${effect.powerPoolV1716.label} ${effect.powerPoolV1716.maximum} (${die}: ${roll}${ui.reinforcement?` + ${ui.reinforcement*effect.powerPoolV1716.bonus}`:''})`;saveOwnerV173(owner,true);showActionPaymentToastV1712R2(transaction);
      };confirmHost.append(button);
    };draw();
  });
};

const undoActionPaymentBeforeV1716=undoActionPaymentV1712R2;
undoActionPaymentV1712R2=function(transactionId=lastActionPaymentV1712R2?.id,options={}){const transaction=lastActionPaymentV1712R2,effectId=transaction?.powerEffectIdV1716,owner=transaction&&(transaction.ownerRef||ownerByIdV179(transaction.ownerId)),result=undoActionPaymentBeforeV1716(transactionId,{...options,render:false});if(result&&effectId&&owner){owner.activeEffectsV177=(owner.activeEffectsV177||[]).filter(function(effect){return effect.id!==effectId});if(options.persist!==false)saveOwnerV173(owner,options.render!==false)}return result};

let reductionDialogV1716=null;
function applyPowerReductionV1716(owner,skillId,nextLevel,keptIds){
  const capacity=Math.min(15,Math.max(0,+nextLevel||0)),data=owner.skills?.[skillId],known=new Set(data?.learnedPowerIds||[]),kept=[...new Set(keptIds||[])].filter(function(id){return known.has(id)&&POWER_BY_ID_V176.get(id)?.skillId===skillId});if(!data||kept.length!==capacity)return false;data.learnedPowerIds=kept;return setPurchasedSkillLevelBeforeV1716(owner,skillId,nextLevel,function(){return true});
}
function openPowerReductionV1716(owner,skillId,nextLevel){
  const data=owner.skills[skillId],capacity=Math.min(15,Math.max(0,+nextLevel||0)),entries=data.learnedPowerIds.map(function(id){return POWER_BY_ID_V176.get(id)}).filter(Boolean);if(!reductionDialogV1716){reductionDialogV1716=el('dialog',{class:'custom-skill-dialog-v178'});document.body.append(reductionDialogV1716)}
  const selected=new Set(entries.slice(0,capacity).map(function(entry){return entry.id})),counter=el('p',{class:'muted'}),list=el('div',{class:'power-reduction-list-v1716'}),confirmButton=el('button',{type:'button',class:'primary'});
  const refresh=function(){counter.textContent=`Ausgewählt: ${selected.size}/${capacity}`;confirmButton.disabled=selected.size!==capacity;confirmButton.textContent=capacity?`${capacity} Zauber behalten`:'Alle Zauber verlernen'};
  for(const entry of entries){const check=el('input',{type:'checkbox',checked:selected.has(entry.id),'aria-label':entry.displayName+' behalten'});check.onchange=function(){if(check.checked&&selected.size>=capacity){check.checked=false;return}if(check.checked)selected.add(entry.id);else selected.delete(entry.id);refresh()};list.append(el('label',{class:'power-reduction-row-v1716'},[check,el('span',{text:`${entry.code} · ${entry.displayName}`})]))}
  confirmButton.onclick=function(){if(!applyPowerReductionV1716(owner,skillId,nextLevel,[...selected]))return;persistOwnerR5(owner,true);reductionDialogV1716.close()};const cancel=el('button',{type:'button',text:'Abbrechen',onclick:function(){reductionDialogV1716.close()}}),skill=SKILLS.find(function(item){return item.id===skillId});reductionDialogV1716.replaceChildren(el('div',{class:'dialog-head'},[el('h2',{text:'Zauber für niedrigere Kaufstufe wählen'}),el('button',{type:'button',text:'✕','aria-label':'Schließen',onclick:function(){reductionDialogV1716.close()}})]),el('p',{text:`${skill?.name||skillId} wird auf Kaufstufe ${nextLevel} gesenkt. Bestimme bewusst, welche Zauber erhalten bleiben.`}),counter,list,el('div',{class:'toolbar'},[confirmButton,cancel]));refresh();reductionDialogV1716.showModal();
}
const setPurchasedSkillLevelBeforeV1716=setPurchasedSkillLevelV176;
setPurchasedSkillLevelV176=function(owner,skillId,nextLevel,confirmRemoval=function(message){return confirm(message)}){ensureOwnerV1716(owner);const next=Math.max(0,Math.min(25,+nextLevel||0)),capacity=Math.min(15,next),data=owner.skills[skillId];if(V1716_SKILL_IDS.has(skillId)&&next<(+data.level||0)&&data.learnedPowerIds.length>capacity){openPowerReductionV1716(owner,skillId,next);return false}return setPurchasedSkillLevelBeforeV1716(owner,skillId,next,confirmRemoval)};

const searchIndexBeforeV1716=searchIndexV177;
searchIndexV177=function(){return searchIndexBeforeV1716().map(function(result){if(!['Zauber','Wunder','Fluch'].includes(result.kind))return result;const entry=POWER_ENTRIES_V176.find(function(power){return power.displayName===result.label&&power.schoolLabel===result.owner});if(!entry)return result;const school=POWER_SCHOOLS_V176.find(function(item){return item.schoolId===entry.schoolId});return{...result,target:{...result.target,schoolIdV1716:entry.schoolId,powerIdV1716:entry.id,skillIdV1716:entry.skillId},search:normalizeSearchV177([result.search,entry.type,entry.variableWText,entry.scaleText,entry.explanation,entry.rulesLimits,entry.resistanceCheck,entry.durationText,entry.rangeText,school?.commonRuleTextV1716||''].join(' '))}})};
const navigateToBeforeV1716=navigateToV177;
navigateToV177=function(target){navigateToBeforeV1716(target);if(!target?.powerIdV1716)return;requestAnimationFrame(function(){requestAnimationFrame(function(){let node=document.querySelector(`[data-learned-power-id-v1712-r2="${CSS.escape(target.powerIdV1716)}"]`)||document.querySelector(`[data-learned-power-id-v1712r2="${CSS.escape(target.powerIdV1716)}"]`),group=document.querySelector(`[data-school-id-v1716="${CSS.escape(target.schoolIdV1716||'')}"]`);if(group)group.open=true;if(!node&&group){const selects=[...group.querySelectorAll('.power-select-row-v176 select')],select=selects.find(function(item){return[...item.options].some(function(option){return option.value===target.powerIdV1716})});if(select){select.value=target.powerIdV1716;select.dispatchEvent(new Event('change',{bubbles:true}));node=select.closest('.power-select-row-v176')}}if(!node&&target.skillIdV1716){const input=document.querySelector(`input[aria-label="${CSS.escape((SKILLS.find(function(skill){return skill.id===target.skillIdV1716})?.name||'')+' Stufe')}"]`);node=input?.closest('tr')}node=node||group;if(node){node.classList.add('power-search-target-v1716');node.scrollIntoView({behavior:'smooth',block:'center'});setTimeout(function(){node.classList.remove('power-search-target-v1716')},1800)}})})};

function attributeDistributionV1716(){const counts=Object.fromEntries(ATTRS.map(function(attribute){return[attribute[0],0]}));for(const skill of SKILLS)for(const id of skillAttributeIdsR10(skill))counts[id]++;return counts}
const runTestsBeforeV1716=runTests;
function runTestsV1716(){
  runTestsBeforeV1716();const body=testResults.querySelector('tbody'),obsolete=new Set(['Version 1.7.15','Schema 23','Regelstand 8','Revision r1','83 Fähigkeiten','83 eindeutige IDs','83 eindeutige Namen','83 Fähigkeiten im Druck','84 sichtbare Fähigkeiten','84 eindeutige Skill-IDs','84 Regelfähigkeiten','84 eindeutige Fähigkeits-IDs','84 eindeutige Fähigkeitsnamen','Charakter zeigt 84 Regelfähigkeiten','NPC zeigt 84 Regelfähigkeiten','83 aktive Regelfähigkeiten','Charakter und NPC zeigen je 83 Fähigkeiten','Druck zeigt 83 Fähigkeiten und Begründungen']);for(const row of[...body.querySelectorAll('tr')])if(obsolete.has(row.cells[0]?.textContent))row.remove();
  const baseOk=[...body.querySelectorAll('tr')].every(function(row){return row.cells[row.cells.length-1]?.textContent==='Bestanden'}),tests=[],eq=function(name,expected,actual){tests.push([name,expected,actual,expected===actual])};
  eq('Version 1.7.16',V1716_VERSION,APP_VERSION);eq('Schema 24',V1716_SCHEMA,SCHEMA_VERSION);eq('Regelstand 9',V1716_RULES,RULES_VERSION);eq('Revision v1.7.16 r1','r1',V1716_REVISION);eq('Katalogversion 1.3.0',V1716_CATALOG_VERSION,POWER_DB_V176.meta?.catalogVersion);
  eq('86 Regelfähigkeiten',86,SKILLS.length);eq('86 eindeutige Regelfähigkeits-IDs',86,new Set(SKILLS.map(function(skill){return skill.id})).size);eq('Grundwertverteilung v1.7.16','ST:15|KS:16|GS:15|RF:14|FF:18|WL:17|IT:23|IN:19|WN:18|CR:17',ATTRS.map(function(attribute){return attribute[0]+':'+attributeDistributionV1716()[attribute[0]]}).join('|'));
  eq('Hellsicht korrekt zugeordnet','WN, RF|M',SKILLS.find(function(skill){return skill.id==='skill_magic_clairvoyance_prophecy'})?.attrs+'|'+SKILLS.find(function(skill){return skill.id==='skill_magic_clairvoyance_prophecy'})?.use);eq('Umbramantie korrekt zugeordnet','GS, RF|M',SKILLS.find(function(skill){return skill.id==='skill_magic_umbramancy'})?.attrs+'|'+SKILLS.find(function(skill){return skill.id==='skill_magic_umbramancy'})?.use);
  eq('450 Kräfte',450,POWER_ENTRIES_V176.length);eq('30 Kraftschulen',30,POWER_SCHOOLS_V176.length);eq('450 eindeutige Kraft-IDs',450,new Set(POWER_ENTRIES_V176.map(function(entry){return entry.id})).size);eq('255 Mana-Zauber',255,POWER_ENTRIES_V176.filter(function(entry){return entry.pathId==='M'}).length);eq('30 neue Zauber',30,POWER_ENTRIES_V176.filter(function(entry){return V1716_SCHOOL_IDS.has(entry.schoolId)}).length);eq('Neue Schulen vollständig',true,[...V1716_SCHOOL_IDS].every(function(id){return POWER_ENTRIES_V176.filter(function(entry){return entry.schoolId===id}).map(function(entry){return entry.code}).join('|')===Array.from({length:15},function(_,index){return'Z'+(index+1)}).join('|')}));
  const learner=newCharacter(),school=POWER_SCHOOL_BY_SKILL_V176.get('skill_magic_clairvoyance_prophecy'),z15=POWER_BY_ID_V176.get('power_clairvoyance_prophecy_z15');learner.skills[school.skillId].level=1;eq('Z15 ab Kaufstufe 1 lernbar',true,learnPowerV176(learner,school.skillId,z15.id));eq('Nur ein Lernplatz auf Kaufstufe 1',false,learnPowerV176(learner,school.skillId,'power_clairvoyance_prophecy_z01'));learner.skills[school.skillId].level=15;learner.skills[school.skillId].learnedPowerIds=powersForSkillV176(school.skillId).map(function(entry){return entry.id});eq('Alle 15 ab Kaufstufe 15',15,learner.skills[school.skillId].learnedPowerIds.length);
  const reductionOwner=newCharacter();reductionOwner.skills[school.skillId].level=15;reductionOwner.skills[school.skillId].learnedPowerIds=powersForSkillV176(school.skillId).map(function(entry){return entry.id});eq('Bewusste Auswahl bei Senkung',true,applyPowerReductionV1716(reductionOwner,school.skillId,6,reductionOwner.skills[school.skillId].learnedPowerIds.slice(9,15)));eq('Gewählte sechs bleiben erhalten','Z10|Z11|Z12|Z13|Z14|Z15',reductionOwner.skills[school.skillId].learnedPowerIds.map(function(id){return POWER_BY_ID_V176.get(id).code}).join('|'));
  const magicOwner=newCharacter();magicOwner.skills[school.skillId].level=14;magicOwner.counters.M={max:5,current:0};eq('Stufe 14 löst W16 und B3 auf','W16|3',dieValueV176(effectiveSkillLevelV176(magicOwner,school.skillId))+'|'+bonusValueV176(effectiveSkillLevelV176(magicOwner,school.skillId)));const noMana=actionPaymentPlanV1712R2(magicOwner,[{counterId:'M',amount:1}]);eq('Mana besitzt keinen LP-Ersatz','false|0',String(noMana.valid)+'|'+noMana.fallback.length);
  const entry=POWER_BY_ID_V176.get('power_clairvoyance_prophecy_z03'),effect=createPowerEffectV1716(magicOwner,entry,2,8);eq('V2 ergänzt auf Stufe 14 genau 6',14,effect.powerPoolV1716.maximum);eq('Punktevorrat startet vollständig','14|14|3',effect.powerPoolV1716.maximum+'|'+effect.powerPoolV1716.current+'|'+effect.powerPoolV1716.perUseLimit);effect.powerPoolV1716.current=2;eq('Pool-Normalisierung unterschreitet 0 nicht',0,normalizePowerPoolV1716({...effect.powerPoolV1716,current:-4}).current);
  const migratedOwner=newCharacter();delete migratedOwner.skills['skill_magic_clairvoyance_prophecy'];delete migratedOwner.skills['skill_magic_umbramancy'];const custom=createCustomSkillV178(migratedOwner,{name:'Eigene Schattenkunde',category:'Eigene Fähigkeiten',attribute1:'WN',attribute2:'IN',use:'FO',scope:'Bleibt erhalten.'});migratedOwner.skills[custom.id].level=7;const migrated={appVersion:'1.7.15',schemaVersion:23,rulesVersion:8,characters:[migratedOwner],migrationLog:[],v1715AttributeBalanceMigrationDone:true};delete migrated.v1716MagicSchoolsMigrationDone;ensureStateV1716(migrated,true);const once=JSON.stringify(migrated);eq('Neue Fähigkeiten migrieren mit Stufe 0','0|0',migratedOwner.skills.skill_magic_clairvoyance_prophecy.level+'|'+migratedOwner.skills.skill_magic_umbramancy.level);eq('Eigene Fähigkeit bleibt erhalten','Eigene Schattenkunde|7',migratedOwner.customSkills.find(function(skill){return skill.id===custom.id})?.name+'|'+migratedOwner.skills[custom.id].level);ensureStateV1716(migrated,true);eq('Migration v1.7.16 idempotent',once,JSON.stringify(migrated));
  const info=powerInfoContentV176(entry,magicOwner),library=renderPowerLibraryV176(magicOwner,'M');eq('Zauberinfo zeigt Wirken und Schulregel',true,info.textContent.includes('Wirken')&&info.textContent.includes('Gemeinsame Vorhersageregel'));eq('Schulansicht zeigt gemeinsame Regel',true,library.textContent.includes('Gemeinsame Vorhersageregel'));eq('Suche indexiert vollständige Regel',true,searchIndexV177().some(function(result){return result.label==='Omenblick'&&result.search.includes('wahrscheinlichste')}));eq('Aktiver Vorrat besitzt Abzug',true,renderEffectRowV177(magicOwner,effect).textContent.includes('−B'));
  for(const test of tests)body.append(el('tr',{},[test[0],test[1],test[2],test[3]?'Bestanden':'Fehler'].map(function(value){return el('td',{text:String(value)})})));return baseOk&&tests.every(function(test){return test[3]});
}
runTests=runTestsV1716;testsBtn.onclick=runTestsV1716;

renderAll();save();
Object.assign(window.Eberos,{version:V1716_VERSION,revision:V1716_REVISION,schemaVersion:V1716_SCHEMA,rulesVersion:V1716_RULES,runTests:runTestsV1716,ensureStateV1716,ensureOwnerV1716,attributeDistributionV1716,createPowerEffectV1716,adjustPowerPoolV1716,applyPowerReductionV1716,newMagicSkillIds:[...V1716_SKILL_IDS],newMagicSchoolIds:[...V1716_SCHOOL_IDS]});
