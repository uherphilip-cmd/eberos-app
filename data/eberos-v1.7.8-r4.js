'use strict';

/* Eberos v1.7.8 r4: gelernte Zauber, Wunder und Flüche in Mehrfachsynergien */
const V178_R4_SCHEMA=17,V178_R4_RULES=7;
const SYNERGY_POWER_COUNTERS_V178_R4=['M','GB','FS'];
const SYNERGY_POWER_COUNTER_SET_V178_R4=new Set(SYNERGY_POWER_COUNTERS_V178_R4);

const synergyPowerStyleV178R4=el('style',{text:`
.synergy-source-mode-v178r4{display:flex;align-items:center;justify-content:space-between;gap:.65rem;flex-wrap:wrap;padding:.7rem;border:1px solid var(--border);border-radius:9px;background:var(--panel-alt)}
.synergy-power-grid-v178r4{display:grid;gap:.7rem}.synergy-power-choice-v178r4{padding:.7rem;border:1px solid var(--border);border-radius:9px;background:var(--panel-alt)}
.synergy-power-choice-v178r4>label{display:grid;gap:.35rem}.synergy-power-choice-v178r4 .power-detail-v176{margin-top:.65rem}.synergy-power-status-v178r4{margin:.45rem 0 0}.synergy-power-ref-v178r4{border-left:4px solid var(--accent-2)}
.synergy-power-ref-v178r4.invalid{border-left-color:var(--danger)}.synergy-mode-chip-v178r4{font-weight:700}
@media(max-width:720px){.synergy-source-mode-v178r4{align-items:stretch;flex-direction:column}.synergy-source-mode-v178r4 button{width:100%}}
@media print{.synergy-source-mode-v178r4 button{display:none!important}.synergy-power-choice-v178r4 .power-detail-v176{display:none!important}}
`});document.head.append(synergyPowerStyleV178R4);

function synergyPowerModeV178R4(synergy){return synergy?.powerLinkMode==='catalog'?'catalog':'manual'}
function ensureOwnerSynergyPowersV178R4(owner,report=null){
  if(!owner||typeof owner!=='object'||owner.type==='possession')return owner;
  ensureOwnerV175(owner);owner.migrations=owner.migrations&&typeof owner.migrations==='object'?owner.migrations:{};
  let manual=0,catalog=0;
  owner.fateSynergies=(owner.fateSynergies||[]).map(raw=>{const synergy=normalizeFateSynergy(raw);if(synergy.powerLinkMode==='catalog')catalog++;else manual++;return synergy});
  owner.migrations.v178r4SynergyPowers=true;
  if(report)report.push({ownerId:owner.id||'',ownerName:owner.name||owner.type||'Charakter',manualSynergies:manual,catalogSynergies:catalog});
  return owner;
}
function backupIncomingStateV178R4(data){
  if(!data||data.v178r4SynergyPowerMigrationDone)return;
  try{localStorage.setItem(STORE+'.backup.synergy-powers-r4.'+Date.now(),JSON.stringify(data))}catch{}
}
function ensureStateV178R4(data,log=true){
  if(!data||typeof data!=='object')return data;
  const first=!data.v178r4SynergyPowerMigrationDone,report=[];
  for(const character of data.characters||[]){ensureOwnerSynergyPowersV178R4(character,report);for(const owner of character.auxiliaryTabs||[])ensureOwnerSynergyPowersV178R4(owner,report)}
  data.appVersion='1.7.8';data.schemaVersion=V178_R4_SCHEMA;data.rulesVersion=V178_R4_RULES;data.v178r4SynergyPowerMigrationDone=true;data.v178r4SynergyPowerMigrationReport=report;
  data.migrationLog=Array.isArray(data.migrationLog)?data.migrationLog:[];
  if(first&&log)data.migrationLog.push({from:16,to:17,fromApp:'1.7.8',toApp:'1.7.8',revision:'r4',at:new Date().toISOString(),owners:report.length,changes:['Bestehende Mehrfachsynergien als manueller Altbestand erhalten','Auswahl gelernter Zauber, Wunder und Flüche im Synergiefenster ergänzt','Stabile Power-IDs in Katalogsynergien gespeichert']});
  return data;
}

const migrateStateBeforeV178R4=migrateState;
migrateState=function(data){backupIncomingStateV178R4(data);return ensureStateV178R4(migrateStateBeforeV178R4(data),true)};
const newCharacterBeforeV178R4=newCharacter,newAuxEntryBeforeV178R4=newAuxEntry;
newCharacter=function(){return ensureOwnerSynergyPowersV178R4(newCharacterBeforeV178R4())};
newAuxEntry=function(type,name){const owner=newAuxEntryBeforeV178R4(type,name);return type==='possession'?owner:ensureOwnerSynergyPowersV178R4(owner)};

function learnedPowerEntriesForCounterV178R4(owner,counter){
  if(!SYNERGY_POWER_COUNTER_SET_V178_R4.has(counter)||!owner||owner.type==='possession')return[];
  ensureOwnerPowersV176(owner);const result=[],seen=new Set();
  for(const school of POWER_SCHOOLS_V176){
    if(resolvedPowerPathV176(owner,school)!==counter)continue;
    for(const powerId of owner.skills?.[school.skillId]?.learnedPowerIds||[]){
      const entry=POWER_BY_ID_V176.get(powerId);if(!entry||entry.skillId!==school.skillId||seen.has(entry.id))continue;
      seen.add(entry.id);result.push(entry);
    }
  }
  return result.sort((a,b)=>(a.schoolLabel||'').localeCompare(b.schoolLabel||'','de')||Number(a.code?.slice(1)||0)-Number(b.code?.slice(1)||0)||(a.displayName||'').localeCompare(b.displayName||'','de'));
}
function synergyPowerStatusV178R4(owner,counter,powerId){
  if(!powerId)return{ok:false,code:'missing',message:`Für ${FATE_PATHS[counter]?.label||counter} wurde noch keine gelernte Kraft ausgewählt.`};
  const entry=POWER_BY_ID_V176.get(powerId);if(!entry)return{ok:false,code:'unknown',powerId,message:`Unbekannte Power-ID ${powerId}. Die gespeicherte Referenz bleibt erhalten.`};
  const learned=owner.skills?.[entry.skillId]?.learnedPowerIds?.includes(powerId)===true;
  if(!learned)return{ok:false,code:'unlearned',entry,powerId,message:`${entry.displayName} ist nicht mehr gelernt. Die gespeicherte Referenz bleibt erhalten.`};
  const resolved=resolvedPowerPathV176(owner,entry.skillId);
  if(resolved!==counter)return{ok:false,code:'wrong-counter',entry,powerId,message:`${entry.displayName} ist ${POWER_COUNTER_LABELS_V176[resolved]||resolved||'keinem Counter'} statt ${POWER_COUNTER_LABELS_V176[counter]||counter} zugeordnet.`};
  return{ok:true,code:'ok',entry,powerId,message:'Gelernt und dem gewählten Pfad zugeordnet.'};
}
function synergyPowerRoleV178R4(synergy,counter){return synergy.primaryCounter===counter?'Primärkraft':'Nebenkraft'}
function synergyPowerTitleV178R4(entry){return`${POWER_KIND_LABELS_V176[entry.powerKind]||entry.powerKind||'Kraft'} · ${entry.code||'—'} · ${entry.displayName||entry.id}`}

const validateFateSynergyBeforeV178R4=validateFateSynergy;
validateFateSynergy=function(owner,synergy={}){
  const base=validateFateSynergyBeforeV178R4(owner,synergy),errors=[...base.errors],warnings=[...base.warnings],mode=synergyPowerModeV178R4(synergy),selected=canonicalFateCountersV175(synergy.pathCounters),linked=synergy.linkedPowerIds&&typeof synergy.linkedPowerIds==='object'?synergy.linkedPowerIds:{};
  if(mode==='manual')warnings.push('Manuelle Synergie ohne verknüpfte Katalogkräfte. Bestehende Texte bleiben vollständig gültig.');
  else{
    for(const counter of selected.filter(value=>SYNERGY_POWER_COUNTER_SET_V178_R4.has(value))){const status=synergyPowerStatusV178R4(owner,counter,linked[counter]);if(!status.ok)errors.push(status.message)}
    for(const counter of Object.keys(linked))if(!selected.includes(counter)||!SYNERGY_POWER_COUNTER_SET_V178_R4.has(counter))errors.push(`Die Kraftverknüpfung ${counter} gehört zu keinem beteiligten Katalogpfad.`);
  }
  return{...base,errors:[...new Set(errors)],warnings:[...new Set(warnings)],valid:errors.length===0};
};

function renderSynergyPowerReferenceV178R4(owner,synergy,counter){
  const powerId=synergy.linkedPowerIds?.[counter],status=synergyPowerStatusV178R4(owner,counter,powerId),entry=status.entry||POWER_BY_ID_V176.get(powerId),section=el('section',{class:`synergy-section-v175 wide synergy-power-ref-v178r4 ${status.ok?'':'invalid'}`});
  section.append(el('h4',{text:`${synergyPowerRoleV178R4(synergy,counter)} · ${FATE_PATHS[counter].label}`}));
  if(entry)section.append(el('p',{text:`${synergyPowerTitleV178R4(entry)} · ${entry.schoolLabel} · ${entry.counterCostText}`}),el('p',{class:status.ok?'muted':'notice error',text:status.message}));
  else section.append(el('p',{class:'notice error',text:status.message}));
  return section;
}
const renderSynergyEntryBeforeV178R4=renderSynergyEntryV175;
renderSynergyEntryV175=function(owner,synergy){
  const details=renderSynergyEntryBeforeV178R4(owner,synergy),meta=details.querySelector('.synergy-meta-v175'),sections=details.querySelector('.synergy-sections-v175'),mode=synergyPowerModeV178R4(synergy);
  if(meta)meta.append(el('span',{class:'fate-chip-v175 synergy-mode-chip-v178r4',text:mode==='catalog'?'Katalogkräfte verknüpft':'Manuell / Altbestand'}));
  if(sections){const anchor=sections.querySelector('.notice.error');if(mode==='manual')sections.insertBefore(labeledSynergyValueV175('Kraftverknüpfung','Manuelle Synergie beziehungsweise Altbestand · keine Katalogkraft automatisch zugeordnet',true),anchor);else for(const counter of canonicalFateCountersV175(synergy.pathCounters).filter(value=>SYNERGY_POWER_COUNTER_SET_V178_R4.has(value)))sections.insertBefore(renderSynergyPowerReferenceV178R4(owner,synergy,counter),anchor)}
  return details;
};

function newFateSynergyDraftV178R4(owner){const opened=openedFatePaths(owner);return normalizeFateSynergy({pathCounters:opened.slice(0,2),primaryCounter:opened[0],costCounter:opened[0],powerLinkMode:'catalog',linkedPowerIds:{}})}
function renderSynergyPowerChoiceV178R4(owner,draft,counter,redraw){
  const role=synergyPowerRoleV178R4(draft,counter),available=learnedPowerEntriesForCounterV178R4(owner,counter),current=draft.linkedPowerIds?.[counter]||'',status=synergyPowerStatusV178R4(owner,counter,current),box=el('section',{class:'synergy-power-choice-v178r4'}),select=el('select',{'aria-label':`${role} für ${FATE_PATHS[counter].label} auswählen`});
  select.append(el('option',{value:'',text:`${role} auswählen…`}));
  if(current&&!available.some(entry=>entry.id===current)){const entry=POWER_BY_ID_V176.get(current);select.append(el('option',{value:current,text:entry?`${entry.code} · ${entry.displayName} · nicht mehr verfügbar`:`${current} · unbekannte gespeicherte ID`}))}
  for(const entry of available)select.append(el('option',{value:entry.id,text:`${entry.code} · ${entry.displayName} · ${entry.schoolLabel}`}));
  select.value=current;select.onchange=event=>{draft.linkedPowerIds=draft.linkedPowerIds||{};if(event.target.value)draft.linkedPowerIds[counter]=event.target.value;else delete draft.linkedPowerIds[counter];redraw()};
  box.append(el('label',{class:'field'},[el('span',{text:`${role} · ${FATE_PATHS[counter].label}`}),select]));
  if(!available.length&&!current)box.append(el('p',{class:'notice synergy-power-status-v178r4',text:'Für diesen Pfad wurde noch keine passende Kraft gelernt. Lerne zuerst eine Kraft im Abschnitt „Gelernte Kräfte“.'}));
  else if(current){box.append(el('p',{class:`${status.ok?'notice ok':'notice error'} synergy-power-status-v178r4`,text:status.message}));if(status.entry)box.append(powerInfoContentV176(status.entry,owner))}
  return box;
}

openFateSynergyDialogV175=function(owner,existing=null){
  ensureOwnerSynergyPowersV178R4(owner);const opened=openedFatePaths(owner);if(!existing&&opened.length<2)return alert('Mindestens zwei geöffnete Pfade werden benötigt.');
  const initial=existing?normalizeFateSynergy(structuredClone(existing)):newFateSynergyDraftV178R4(owner),draft={...initial,secondaryContributions:{...(initial.secondaryContributions||{})},linkedPowerIds:{...(initial.linkedPowerIds||{})}};draft.costCounter=draft.primaryCounter;
  const dialog=ensureFateSynergyDialogV175(),editor=document.getElementById('fateSynergyEditorV175');document.getElementById('fateSynergyTitleV175').textContent=existing?'Synergie bearbeiten':'Synergie erschaffen';
  const draw=()=>{
    editor.replaceChildren();const root=el('div',{class:'fate-editor-v175'}),selection=el('section',{},[el('h3',{text:'1. Beteiligte Pfade auswählen'})]),choices=el('div',{class:'fate-select-v175'});
    for(const counter of FATE_COUNTER_ORDER_V175){const selected=draft.pathCounters.includes(counter),isOpened=opened.includes(counter),input=el('input',{type:'checkbox',checked:selected,disabled:!isOpened&&!selected,'aria-label':FATE_PATHS[counter].label});input.checked=selected;input.onchange=event=>{draft.pathCounters=canonicalFateCountersV175(event.target.checked?[...draft.pathCounters,counter]:draft.pathCounters.filter(value=>value!==counter));if(!event.target.checked&&draft.linkedPowerIds)delete draft.linkedPowerIds[counter];if(!draft.pathCounters.includes(draft.primaryCounter))draft.primaryCounter=draft.pathCounters[0]||'';draft.costCounter=draft.primaryCounter;draw()};choices.append(el('label',{class:!isOpened?'locked':''},[input,el('span',{text:`${FATE_PATHS[counter].label} · Stufe ${fatePathLevel(owner,counter)}${isOpened?'':' · gesperrt'}`})]))}
    selection.append(choices);root.append(selection);
    const modeSection=el('section',{},[el('h3',{text:'2. Quellenmodus'})]),modeBox=el('div',{class:'synergy-source-mode-v178r4'});
    if(synergyPowerModeV178R4(draft)==='manual')modeBox.append(el('div',{},[el('strong',{text:'Manuell / Altbestand'}),el('p',{class:'muted',text:'Vorhandene Synergietexte bleiben gültig. Es wird keine Kraft automatisch zugeordnet.'})]),el('button',{type:'button',class:'primary',text:'Gelernte Kräfte verknüpfen',onclick:()=>{draft.powerLinkMode='catalog';draw()}}));
    else modeBox.append(el('div',{},[el('strong',{text:'Katalogkräfte verknüpfen'}),el('p',{class:'muted',text:'Jeder beteiligte Mana-, Glaubens- und Finsternispfad erhält genau eine bereits gelernte Kraft.'})]),el('button',{type:'button',text:'Als manuelle Synergie führen',onclick:()=>{if(confirm('Katalogverknüpfungen aus diesem Entwurf entfernen und die Synergie manuell führen?')){draft.powerLinkMode='manual';draft.linkedPowerIds={};draw()}}}));
    modeSection.append(modeBox);root.append(modeSection);
    const summary=synergySummary(owner,draft),primary=el('select',{'aria-label':'Primärpfad'});for(const counter of draft.pathCounters)primary.append(el('option',{value:counter,text:`${FATE_PATHS[counter].label} · ${counter}`}));primary.value=draft.primaryCounter;primary.onchange=event=>{draft.primaryCounter=event.target.value;draft.costCounter=draft.primaryCounter;draw()};
    const definition=el('section',{},[el('h3',{text:'3. Primärpfad und Hauptwirkung'})]),grid=el('div',{class:'fate-editor-grid-v175'});grid.append(el('label',{class:'field'},[el('span',{text:'Primärpfad'}),primary]),el('label',{class:'field'},[el('span',{text:'Kosten-Counter'}),el('input',{value:draft.costCounter||'—',readonly:true,'aria-label':'Kosten-Counter'})]),synergyEditorFieldV175(draft,'Name','name'),synergyEditorFieldV175(draft,'Verbindung','connection'),synergyEditorFieldV175(draft,'Erscheinung','appearance',true),synergyEditorFieldV175(draft,'Genau eine Hauptwirkung','effect',true));definition.append(grid);root.append(definition);
    if(synergyPowerModeV178R4(draft)==='catalog'){const powerSection=el('section',{},[el('h3',{text:'4. Beteiligte gelernte Kräfte'})]),powerGrid=el('div',{class:'synergy-power-grid-v178r4'}),catalogCounters=draft.pathCounters.filter(value=>SYNERGY_POWER_COUNTER_SET_V178_R4.has(value));for(const counter of catalogCounters)powerGrid.append(renderSynergyPowerChoiceV178R4(owner,draft,counter,draw));if(draft.pathCounters.includes('HS'))powerGrid.append(el('p',{class:'notice',text:'Herrschaft besitzt keinen Zauber-, Wunder- oder Fluchkatalog. Ihr Beitrag wird weiterhin als Freitext beschrieben.'}));if(!catalogCounters.length)powerGrid.append(el('p',{class:'muted',text:'Die gewählten Pfade besitzen keinen Kraftkatalog.'}));powerSection.append(powerGrid);root.append(powerSection)}
    const contributions=el('section',{},[el('h3',{text:`${synergyPowerModeV178R4(draft)==='catalog'?'5':'4'}. Verändernde Beiträge der Nebenpfade`})]),contributionGrid=el('div',{class:'fate-editor-grid-v175'});for(const counter of draft.pathCounters)if(counter!==draft.primaryCounter){draft.secondaryContributions[counter]??='';const control=el('textarea',{'aria-label':`Beitrag ${FATE_PATHS[counter].label}`});control.value=draft.secondaryContributions[counter];control.oninput=event=>draft.secondaryContributions[counter]=event.target.value;contributionGrid.append(el('label',{class:'field wide'},[el('span',{text:`${FATE_PATHS[counter].label} verändert die Hauptwirkung durch …`}),control]))}if(!contributionGrid.children.length)contributionGrid.append(el('p',{class:'muted',text:'Nach Auswahl eines Primärpfades erscheinen hier die Nebenpfade.'}));contributions.append(contributionGrid);root.append(contributions);
    const finalStep=synergyPowerModeV178R4(draft)==='catalog'?6:5,limits=el('section',{},[el('h3',{text:`${finalStep}. Notwendigkeit, Grenze und Preis`})]),limitGrid=el('div',{class:'fate-editor-grid-v175'});limitGrid.append(synergyEditorFieldV175(draft,'Warum sind alle Pfade notwendig?','necessity',true),synergyEditorFieldV175(draft,'Klare Grenze: Was leistet die Technik nicht?','limitation',true),synergyEditorFieldV175(draft,'Preis, Verpflichtung, Gefahr oder Verwundbarkeit','price',true));if(draft.pathCounters.length===4)limitGrid.append(synergyEditorFieldV175(draft,'Zentrales Motiv','centralMotif',true),synergyEditorFieldV175(draft,'Bindung der widersprüchlichen Kräfte','binding',true),synergyEditorFieldV175(draft,'Signatur: Woran erkennt die Welt diese Verbindung?','signature',true));limitGrid.append(synergyEditorFieldV175(draft,'Freie Notizen','notes',true));limits.append(limitGrid);root.append(limits);
    const inspirations=synergyInspirationsV175(draft.pathCounters);if(inspirations.length){const section=el('section',{},[el('h3',{text:'Inspirationen'})]),list=el('div',{class:'inspiration-list-v175'});for(const name of inspirations)list.append(el('button',{type:'button',text:name,onclick:()=>{draft.name=name;draw()}}));section.append(el('p',{class:'muted',text:'Die Auswahl übernimmt nur den Namen und erfindet keine Wirkung, Kosten oder Zahlenwerte.'}),list);root.append(section)}
    const validation=validateFateSynergy(owner,draft),preview=el('section',{class:'fate-preview-v175 '+(validation.valid&&summary.unlocked?'ok':'')},[el('strong',{text:`${summary.kind} · Stufe ${summary.level} · ${summary.status}`}),el('p',{text:`Beteiligte Pfade: ${summary.pathCounters.map(counter=>FATE_PATHS[counter].label).join(' + ')||'noch keine gültige Auswahl'} · Voraussetzung: Stufe ${summary.threshold||'—'}`})]);if(validation.errors.length)preview.append(el('div',{class:'notice error'},[el('strong',{text:'Strukturell unvollständig'}),el('ul',{class:'fate-errors-v175'},validation.errors.map(message=>el('li',{text:message})))]));if(validation.warnings.length)preview.append(el('div',{class:'notice'},[el('strong',{text:'Hinweise'}),el('p',{text:validation.warnings.join(' ')})]));root.append(preview);
    const actions=el('div',{class:'synergy-actions-v175'},[el('button',{class:'primary',type:'button',text:'Synergie speichern',onclick:()=>{const normalized=normalizeFateSynergy(draft),index=owner.fateSynergies.findIndex(entry=>entry.id===normalized.id);if(index>=0)owner.fateSynergies[index]=normalized;else owner.fateSynergies.push(normalized);saveOwnerV175(owner,true);dialog.close()}}),el('button',{type:'button',text:'Abbrechen',onclick:()=>dialog.close()})]);root.append(actions);editor.append(root);
  };draw();dialog.showModal();
};

const auditBeforeV178R4=audit;
audit=function(){auditBeforeV178R4();auditResults.append(el('h3',{text:'Synergie-Kraftverknüpfungen v1.7.8 r4'}));for(const owner of ownerListV178()){ensureOwnerSynergyPowersV178R4(owner);const validations=(owner.fateSynergies||[]).map(synergy=>validateFateSynergy(owner,synergy)),errors=validations.reduce((sum,item)=>sum+item.errors.length,0),warnings=validations.reduce((sum,item)=>sum+item.warnings.length,0),catalog=(owner.fateSynergies||[]).filter(synergy=>synergyPowerModeV178R4(synergy)==='catalog').length,manual=(owner.fateSynergies||[]).length-catalog,severity=errors?'error':warnings?'':'ok';auditResults.append(el('div',{class:'notice '+severity,text:`${errors?'✕':warnings?'⚠':'✓'} ${owner.name||owner.type||'Charakter'}: ${catalog} Katalogsynergien · ${manual} manuell${errors?` · ${errors} Fehler`:warnings?` · ${warnings} Hinweise`:' · gültig'}`}))}};
auditBtn.onclick=audit;

function seedLearnedPowerV178R4(owner,counter){const school=POWER_SCHOOLS_V176.find(item=>powerPathOptionsV176(item.skillId).length===1&&resolvedPowerPathV176(owner,item)===counter),entry=school&&powersForSkillV176(school.skillId)[0];if(!school||!entry)return null;owner.skills[school.skillId].level=Math.max(1,+owner.skills[school.skillId].level||0);owner.skills[school.skillId].learnedPowerIds=[entry.id];return entry}
function exhaustiveSynergyPowerCoverageV178R4(){
  const failures=[],visibleIds=new Set(),kindCounts={spell:0,miracle:0,curse:0};let assignmentCases=0,individualCases=0;
  for(const entry of POWER_ENTRIES_V176)kindCounts[entry.powerKind]=(kindCounts[entry.powerKind]||0)+1;
  for(const school of POWER_SCHOOLS_V176){
    const expected=powersForSkillV176(school.skillId),expectedIds=expected.map(entry=>entry.id).sort(),counters=powerPathOptionsV176(school.skillId);
    if(expected.length!==15)failures.push(`${school.schoolLabel}: ${expected.length} statt 15 Datenbankkräfte`);
    if(!counters.length){failures.push(`${school.schoolLabel}: keine Counterzuordnung`);continue}
    for(const counter of counters){
      assignmentCases++;const owner=ownerWithFateLevelsV175({M:10,GB:10,FS:10});ensureOwnerPowersV176(owner);owner.skills[school.skillId].level=25;owner.skills[school.skillId].learnedPowerIds=[...expectedIds];
      if(counters.length>1)owner.powerPathChoicesV176[school.skillId]=counter;
      const filtered=learnedPowerEntriesForCounterV178R4(owner,counter),filteredIds=filtered.map(entry=>entry.id).sort(),draft={primaryCounter:counter,linkedPowerIds:{}};
      const selectorIds=[...renderSynergyPowerChoiceV178R4(owner,draft,counter,()=>{}).querySelectorAll('option')].map(option=>option.value).filter(Boolean).sort();
      for(const id of filteredIds)visibleIds.add(id);
      if(filteredIds.join('|')!==expectedIds.join('|'))failures.push(`${school.schoolLabel} → ${counter}: Filter ${filteredIds.length}/${expectedIds.length}`);
      if(selectorIds.join('|')!==expectedIds.join('|'))failures.push(`${school.schoolLabel} → ${counter}: Auswahl ${selectorIds.length}/${expectedIds.length}`);
      for(const entry of expected)if(!synergyPowerStatusV178R4(owner,counter,entry.id).ok)failures.push(`${entry.id} → ${counter}: Status ungültig`);
      for(const other of SYNERGY_POWER_COUNTERS_V178_R4.filter(value=>value!==counter))if(learnedPowerEntriesForCounterV178R4(owner,other).some(entry=>expectedIds.includes(entry.id)))failures.push(`${school.schoolLabel}: erscheint zusätzlich unter ${other}`);
      for(const entry of expected){
        individualCases++;const learner=ownerWithFateLevelsV175({M:10,GB:10,FS:10});ensureOwnerPowersV176(learner);learner.skills[school.skillId].level=1;if(counters.length>1)learner.powerPathChoicesV176[school.skillId]=counter;
        if(!learnPowerV176(learner,school.skillId,entry.id))failures.push(`${entry.id} → ${counter}: Lernen fehlgeschlagen`);
        else if(!learnedPowerEntriesForCounterV178R4(learner,counter).some(candidate=>candidate.id===entry.id))failures.push(`${entry.id} → ${counter}: nach Lernen nicht im Filter`);
      }
    }
  }
  return{failures,visibleIds:[...visibleIds],kindCounts,assignmentCases,individualCases};
}
const runTestsBeforeV178R4=runTests;
function runTestsV178R4(){
  const previousOk=runTestsBeforeV178R4(),tests=[],eq=(name,expected,actual)=>tests.push([name,expected,actual,expected===actual]);
  eq('Revision r4: Schema 17',17,SCHEMA_VERSION);eq('Revision r4: Regelversion 7',7,RULES_VERSION);eq('Revision r4: 435 Kräfte im erweiterten Katalog',435,POWER_ENTRIES_V176.length);
  const owner=ownerWithFateLevelsV175({M:10,GB:10,FS:10}),spell=seedLearnedPowerV178R4(owner,'M'),miracle=seedLearnedPowerV178R4(owner,'GB'),curse=seedLearnedPowerV178R4(owner,'FS');
  eq('Gelernter Zauber im Manapfad',spell?.id,learnedPowerEntriesForCounterV178R4(owner,'M')[0]?.id);eq('Gelerntes Wunder im Glaubenspfad',miracle?.id,learnedPowerEntriesForCounterV178R4(owner,'GB')[0]?.id);eq('Gelernter Fluch im Finsternispfad',curse?.id,learnedPowerEntriesForCounterV178R4(owner,'FS')[0]?.id);
  const catalog=normalizeFateSynergy({...completeSynergyForTestsV175(['M','GB','FS']),powerLinkMode:'catalog',linkedPowerIds:{M:spell.id,GB:miracle.id,FS:curse.id}});eq('Katalogsynergie mit drei Power-IDs gültig',true,validateFateSynergy(owner,catalog).valid);eq('Primärkraft folgt Primärpfad',spell.id,catalog.linkedPowerIds[catalog.primaryCounter]);
  const selector=renderSynergyPowerChoiceV178R4(owner,catalog,'M',()=>{}),optionValues=[...selector.querySelectorAll('option')].map(option=>option.value);eq('Synergieauswahl enthält gelernten Zauber',true,optionValues.includes(spell.id));eq('Synergieauswahl enthält keine ungelernte Kraft',false,optionValues.includes(powersForSkillV176(spell.skillId)[1]?.id));
  owner.skills[spell.skillId].learnedPowerIds=[];eq('Verlernte Primärkraft erzeugt Fehler',true,validateFateSynergy(owner,catalog).errors.some(message=>message.includes('nicht mehr gelernt')));eq('Verlernte Power-ID bleibt gespeichert',spell.id,normalizeFateSynergy(catalog).linkedPowerIds.M);owner.skills[spell.skillId].learnedPowerIds=[spell.id];
  const unknown=normalizeFateSynergy({...catalog,linkedPowerIds:{...catalog.linkedPowerIds,M:'legacy_unknown_power'}});eq('Unbekannte Power-ID bleibt erhalten','legacy_unknown_power',unknown.linkedPowerIds.M);eq('Unbekannte Power-ID wird gemeldet',true,validateFateSynergy(owner,unknown).errors.some(message=>message.includes('Unbekannte Power-ID')));
  const orphan={...catalog,pathCounters:['M','GB'],linkedPowerIds:{...catalog.linkedPowerIds}};eq('Verwaiste Pfadverknüpfung wird gemeldet',true,validateFateSynergy(owner,orphan).errors.some(message=>message.includes('keinem beteiligten')));eq('Normalisierung entfernt verwaiste Verknüpfung',false,Object.hasOwn(normalizeFateSynergy(orphan).linkedPowerIds,'FS'));
  const manual=normalizeFateSynergy(completeSynergyForTestsV175(['M','GB']));eq('Altbestand bleibt manuell','manual',manual.powerLinkMode);eq('Manuelle Altbestandssynergie bleibt gültig',true,validateFateSynergy(owner,manual).valid);eq('Neue Synergie startet im Katalogmodus','catalog',newFateSynergyDraftV178R4(owner).powerLinkMode);
  const rendered=renderSynergyEntryV175(owner,catalog).textContent;eq('Gespeicherte Synergie zeigt Primärkraft',true,rendered.includes(spell.displayName));eq('Gespeicherte Synergie zeigt Wunder',true,rendered.includes(miracle.displayName));eq('Gespeicherte Synergie zeigt Fluch',true,rendered.includes(curse.displayName));
  const multiSchool=POWER_SCHOOLS_V176.find(item=>powerPathOptionsV176(item.skillId).length>1),multiOptions=multiSchool?powerPathOptionsV176(multiSchool.skillId):[],multiEntry=multiSchool&&powersForSkillV176(multiSchool.skillId)[0],multiOwner=ownerWithFateLevelsV175({M:10,GB:10,FS:10});if(multiSchool&&multiEntry){multiOwner.skills[multiSchool.skillId].level=1;multiOwner.skills[multiSchool.skillId].learnedPowerIds=[multiEntry.id];assignPowerPathV176(multiOwner,multiSchool.skillId,multiOptions[0])}eq('Mehrfach-Counter-Kraft nur unter Zuordnung',true,!multiEntry||learnedPowerEntriesForCounterV178R4(multiOwner,multiOptions[0]).some(entry=>entry.id===multiEntry.id));eq('Mehrfach-Counter-Kraft nicht im anderen Pfad',false,!!multiEntry&&multiOptions.slice(1).some(counter=>learnedPowerEntriesForCounterV178R4(multiOwner,counter).some(entry=>entry.id===multiEntry.id)));
  const migrationOwner=ownerWithFateLevelsV175({M:10,GB:10});migrationOwner.fateSynergies=[{...completeSynergyForTestsV175(['M','GB'])}];delete migrationOwner.fateSynergies[0].powerLinkMode;delete migrationOwner.fateSynergies[0].linkedPowerIds;delete migrationOwner.migrations.v178r4SynergyPowers;const migrationState={appVersion:'1.7.8',schemaVersion:16,rulesVersion:6,characters:[migrationOwner],migrationLog:[]};ensureStateV178R4(migrationState,true);const migratedOnce=JSON.stringify(migrationState);ensureStateV178R4(migrationState,true);eq('r4-Migration setzt manuellen Altbestand','manual',migrationOwner.fateSynergies[0].powerLinkMode);eq('r4-Migration ist idempotent',migratedOnce,JSON.stringify(migrationState));
  const npc=ownerWithFateLevelsV175({M:10,GB:10},'npc'),familiar=ownerWithFateLevelsV175({M:10,GB:10},'familiar');npc.fateSynergies=[catalog];eq('NPC- und Vertrautenverknüpfungen getrennt',0,familiar.fateSynergies.length);eq('JSON erhält Power-IDs',spell.id,JSON.parse(JSON.stringify(catalog)).linkedPowerIds.M);
  const coverage=exhaustiveSynergyPowerCoverageV178R4();eq('Volltest: 34 Schul-Counter-Kombinationen',34,coverage.assignmentCases);eq('Volltest: 510 einzelne Lern- und Filterfälle',510,coverage.individualCases);eq('Volltest: alle 240 Zauber erfasst',240,coverage.kindCounts.spell);eq('Volltest: alle 75 Wunder erfasst',75,coverage.kindCounts.miracle);eq('Volltest: alle 120 Flüche erfasst',120,coverage.kindCounts.curse);eq('Volltest: alle 435 IDs in Synergieauswahlen sichtbar',435,coverage.visibleIds.length);eq('Volltest: kein Lern-, Filter-, Auswahl- oder Statusfehler',0,coverage.failures.length);
  const body=testResults.querySelector('tbody');for(const[name,expected,actual,ok]of tests)body.append(el('tr',{},[name,expected,actual,ok?'Bestanden':'Fehler'].map(value=>el('td',{text:String(value)}))));return previousOk&&tests.every(test=>test[3]);
}
runTests=runTestsV178R4;testsBtn.onclick=runTestsV178R4;

backupIncomingStateV178R4(state);state=ensureStateV178R4(state,true);state.appVersion='1.7.8';state.schemaVersion=V178_R4_SCHEMA;state.rulesVersion=V178_R4_RULES;save();renderAll();
Object.assign(window.Eberos,{version:'1.7.8',schemaVersion:V178_R4_SCHEMA,rulesVersion:V178_R4_RULES,runTests:runTestsV178R4,ensureStateV178R4,ensureOwnerSynergyPowersV178R4,learnedPowerEntriesForCounterV178R4,synergyPowerStatusV178R4,exhaustiveSynergyPowerCoverageV178R4,migrationReportR4:()=>state.v178r4SynergyPowerMigrationReport});
