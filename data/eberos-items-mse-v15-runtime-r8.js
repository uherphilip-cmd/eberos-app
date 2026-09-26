'use strict';

/* Items_Korrekturen_v15.mse-set: balancierter Katalog mit Kartenansicht. */
{
const MSE_DB_V15=window.EBEROS_MSE_ITEM_DB_V15||{meta:{},categories:[],items:[],audit:{}};
const MSE_ITEMS_V15=Array.isArray(MSE_DB_V15.items)?MSE_DB_V15.items:[];
const MSE_CATEGORIES_V15=Array.isArray(MSE_DB_V15.categories)?MSE_DB_V15.categories:[];
const MSE_BY_ID_V15=new Map(MSE_ITEMS_V15.map(item=>[item.id,item]));
const MSE_BY_CODE_V17=new Map(MSE_ITEMS_V15.map(item=>[item.sourceRecord?.cardNumber,item]));
const MSE_CATEGORY_LABELS_V15=Object.fromEntries(MSE_CATEGORIES_V15.map(category=>[category.id,String(category.label||'').replace(/^MSE-Set\s*·?\s*/i,'Set-Gegenstandskarten · ')]));
const MSE_PICKER_STATE_V15=window.__EBEROS_MSE_PICKER_STATE_V15||(window.__EBEROS_MSE_PICKER_STATE_V15={});
const MSE_ASSET_LABELS_V15={weapon:'Waffe',armor:'Rüstung & Kleidung',gear:'Artefakt & Ausrüstung',companion:'Begleiter & Kreatur',vehicle:'Fahrzeug & Transport',property:'Ort & großer Besitz',boon:'Segen, Titel & Zustand'};
const MSE_COMPLETION_REWARDS_V15=MSE_ITEMS_V15.filter(item=>item.isCompletionReward);

function validateMseCatalogV15(){
  const errors=[],ids=new Set();
  if(MSE_ITEMS_V15.length!==496)errors.push(`496 Einträge erwartet, ${MSE_ITEMS_V15.length} gefunden`);
  if(MSE_BY_CODE_V17.size!==MSE_ITEMS_V15.length)errors.push('Kartencodes sind nicht vollständig oder nicht eindeutig');
  if(MSE_COMPLETION_REWARDS_V15.length!==18)errors.push(`18 Abschlusskarten erwartet, ${MSE_COMPLETION_REWARDS_V15.length} gefunden`);
  for(const item of MSE_ITEMS_V15){
    if(!item?.id||ids.has(item.id))errors.push(`Doppelte oder leere ID: ${item?.id||'—'}`);
    ids.add(item?.id);
    if(!item.name||!item.sourceRecord?.cardNumber)errors.push(`${item?.id||'—'}: Name oder Kartennummer fehlt`);
    if(!item.artFile)errors.push(`${item.id}: Kartengrafik fehlt`);
    if(!item.balance?.reviewed)errors.push(`${item.id}: Balanceprüfung fehlt`);
    if(!Array.isArray(item.review?.issues))errors.push(`${item.id}: Prüfstatus fehlt`);
  }
  return{ok:errors.length===0,errors,ids:ids.size};
}
const MSE_VALIDATION_V15=validateMseCatalogV15();
if(!MSE_VALIDATION_V15.ok)showError('Set-Gegenstandskarten-Katalog fehlerhaft: '+MSE_VALIDATION_V15.errors.slice(0,8).join(' · '));

document.head.append(el('style',{text:`
.mse-picker-v15{margin:.75rem 0;border:2px solid var(--accent-2);border-radius:var(--radius);background:var(--panel-alt);overflow:hidden;overflow-anchor:none}.mse-picker-v15>summary{cursor:pointer;padding:.75rem;font-family:var(--font-section);font-weight:800}.mse-picker-body-v15{padding:.75rem;border-top:1px solid var(--border)}.mse-code-form-v17{display:grid;grid-template-columns:minmax(10rem,18rem) auto;gap:.5rem;align-items:end}.mse-code-field-v17{display:grid;gap:.25rem}.mse-code-field-v17 input{font:inherit;letter-spacing:.18em}.mse-code-status-v17{min-height:1.4em;margin:.5rem 0}.mse-picker-meta-v15{display:flex;gap:.4rem;align-items:center;flex-wrap:wrap;margin:.55rem 0}.mse-chip-v15{display:inline-flex;align-items:center;min-height:25px;padding:.12rem .46rem;border:1px solid var(--border);border-radius:999px;background:var(--panel-bg);font-size:.8rem}.mse-chip-v15.adjusted{border-color:var(--accent-2);color:var(--accent)}.mse-chip-v15.not-sale{border-color:var(--muted);color:var(--muted)}.mse-chip-v15.completion{border-color:#b58b22;color:#8b6512;background:#fff4c8}.mse-results-v15{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:.65rem;max-height:38rem;overflow:auto;overflow-anchor:none;padding:.2rem}.mse-result-v15{display:grid;align-content:start;gap:.45rem;padding:.65rem;border:1px solid var(--border);border-radius:9px;background:var(--panel-bg);min-width:0;overflow-anchor:none}.mse-result-v15.completion-locked{border-color:#b58b22}.mse-result-v15 h4{margin:0}.mse-result-v15 p{margin:0;white-space:pre-wrap;overflow-wrap:anywhere}.mse-result-v15 details>summary{cursor:pointer;color:var(--accent)}.mse-result-heading-v15{display:grid;grid-template-columns:74px minmax(0,1fr);gap:.65rem;align-items:start}.mse-thumb-button-v15{display:block;width:74px;aspect-ratio:5/7;padding:0;border:1px solid var(--border);border-radius:7px;overflow:hidden;background:#090b0c}.mse-thumb-button-v15 img{display:block;width:100%;height:100%;object-fit:contain}.mse-result-actions-v15{display:flex;gap:.4rem;align-items:center;justify-content:flex-end;flex-wrap:wrap;margin-top:auto}.mse-completion-progress-v15{display:grid;gap:.2rem;min-width:11rem}.mse-completion-progress-v15 progress{width:100%;accent-color:#b58b22}.equipment-entry{overflow-anchor:none}.equipment-entry.mse-completion-item-v15{border-color:#b58b22;box-shadow:inset 4px 0 #b58b22}.mse-selected-source-v15{margin:.65rem 0 0;border-top:1px solid var(--border)}.mse-selected-source-v15>summary{cursor:pointer;padding:.55rem 0;font-weight:800}.mse-source-grid-v15{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.5rem}.mse-source-section-v15{padding:.55rem;border:1px solid var(--border);border-radius:8px;background:var(--panel-bg);white-space:pre-wrap;overflow-wrap:anywhere}.mse-source-section-v15.wide{grid-column:1/-1}.mse-source-section-v15 h5{margin:0 0 .25rem}.mse-catalog-notice-v15{border-left:5px solid var(--accent-2)}
.mse-card-dialog-v15{width:min(94vw,920px);max-height:94vh;padding:0;border:1px solid var(--border);border-radius:16px;background:var(--panel-bg);color:var(--text);overflow:auto}.mse-card-dialog-v15::backdrop{background:rgba(0,0,0,.76);backdrop-filter:blur(3px)}.mse-card-shell-v15{display:grid;grid-template-columns:minmax(280px,430px) minmax(230px,1fr);gap:1rem;padding:1rem}.mse-card-v15{align-self:start;aspect-ratio:5/7;display:grid;grid-template-rows:auto minmax(0,42%) 1fr auto;border:10px solid #2b2218;border-radius:20px;overflow:hidden;background:linear-gradient(145deg,#f2e4bd,#d4bd88);color:#21170e;box-shadow:0 18px 45px rgba(0,0,0,.45)}.mse-card-header-v15{display:flex;justify-content:space-between;gap:.5rem;align-items:center;padding:.55rem .7rem;background:rgba(255,255,255,.32);border-bottom:2px solid rgba(54,35,18,.4)}.mse-card-header-v15 strong{font-family:var(--font-section);font-size:clamp(1rem,3vw,1.25rem);line-height:1.05}.mse-card-art-v15{width:100%;height:100%;object-fit:contain;background:#080a0b}.mse-card-body-v15{display:grid;align-content:start;gap:.45rem;padding:.6rem .7rem;overflow:auto}.mse-card-type-v15{font-weight:800;border-bottom:1px solid rgba(54,35,18,.35);padding-bottom:.25rem}.mse-card-stats-v15{font-size:.83rem;font-weight:700}.mse-card-rules-v15{white-space:pre-wrap;font-size:.88rem;line-height:1.25}.mse-card-flavor-v15{font-style:italic;font-size:.8rem}.mse-card-footer-v15{display:flex;justify-content:space-between;gap:.5rem;padding:.35rem .7rem;background:rgba(255,255,255,.28);border-top:1px solid rgba(54,35,18,.35);font-size:.72rem;font-weight:700}.mse-card-side-v15{display:grid;align-content:start;gap:.65rem}.mse-card-side-v15 h3,.mse-card-side-v15 p{margin:0}.mse-card-side-v15 .mse-card-close-v15{justify-self:end}.mse-card-values-v15{display:grid;grid-template-columns:1fr 1fr;gap:.5rem}.mse-card-actions-v15{display:flex;gap:.45rem;justify-content:flex-end;flex-wrap:wrap}
@media(max-width:850px){.mse-picker-filters-v15{grid-template-columns:1fr 1fr}.mse-source-grid-v15{grid-template-columns:1fr}.mse-source-section-v15.wide{grid-column:auto}.mse-card-shell-v15{grid-template-columns:1fr}.mse-card-v15{width:min(100%,430px);justify-self:center}.mse-card-side-v15{width:min(100%,430px);justify-self:center}.mse-card-side-v15 .mse-card-close-v15{position:absolute;top:.45rem;right:.45rem}}
@media(max-width:520px){.mse-picker-filters-v15,.mse-code-form-v17{grid-template-columns:1fr}.mse-results-v15{grid-template-columns:1fr;max-height:32rem}.mse-result-actions-v15{align-items:stretch;flex-direction:column}.mse-result-actions-v15 button{width:100%}.mse-card-dialog-v15{width:100vw;max-width:none;max-height:100vh;border-radius:0}.mse-card-shell-v15{padding:.6rem}.mse-card-values-v15{grid-template-columns:1fr}}
@media print{.mse-picker-v15,.mse-card-dialog-v15{display:none!important}.mse-selected-source-v15{border:0}.mse-selected-source-v15>summary{display:none}.mse-selected-source-v15:not([open])>*:not(summary){display:block!important}}
`}));

function mseSearchTextV15(item){const source=item.sourceRecord||{};return normalizeNameV174([item.name,source.sourceName,item.description,item.notes,source.primaryStats?.join(' '),source.secondaryStats?.join(' '),source.effectText,source.cardNumber,source.rarity,MSE_ASSET_LABELS_V15[item.assetKind],item.valueText,item.balance?.reason].filter(Boolean).join(' '))}
function msePickerStateV15(owner){const key=owner?.id||'unknown';return MSE_PICKER_STATE_V15[key]||(MSE_PICKER_STATE_V15[key]={open:true,message:''})}
function mseNormalizeCardCodeV17(value){return String(value??'').trim().replace(/^MSE[\s-]*/i,'').replace(/[\s-]+/g,'')}
function mseUnlockedCardIdsV17(owner){
  const existing=Array.isArray(owner?.mseUnlockedCardIdsV17)?owner.mseUnlockedCardIdsV17:[],owned=(owner?.equipment||[]).filter(item=>item.sourceVersion==='mse-v15'&&!item.isCompletionReward).map(item=>item.catalogId),ids=[...new Set([...existing,...owned].filter(id=>{const item=MSE_BY_ID_V15.get(id);return item&&!item.isCompletionReward}))];
  if(owner)owner.mseUnlockedCardIdsV17=ids;return ids;
}
function mseCardIsUnlockedV17(owner,item){return!!item&&!item.isCompletionReward&&mseUnlockedCardIdsV17(owner).includes(item.id)}
function mseCardCanBeShownV17(owner,item){const owners=owner?[owner,...(owner.auxiliaryTabs||[])]:[];return owners.some(entry=>mseCardIsUnlockedV17(entry,item))||!!(item?.isCompletionReward&&owners.some(entry=>(entry.equipment||[]).some(row=>row.catalogId===item.id&&(+row.quantity||0)>0)))}
function msePriceLabelV15(item){return item.valueText||item.sourceRecord?.canonicalPrice||item.sourceRecord?.priceText||'Preis offen'}
function mseWeightValueV15(value){if(!Number.isFinite(+value))return'Gewicht offen';const kg=+value;return kg>=1000?`${String(+(kg/1000).toFixed(3)).replace('.',',')} t`:`${String(+kg.toFixed(3)).replace('.',',')} kg`}
function mseWeightLabelV15(item){const correction=item.editorialCorrections?.find(entry=>entry.field==='weightKg'),current=mseWeightValueV15(item.weightKg);return correction?`${current} (Quelle ${item.sourceRecord?.canonicalWeight||item.sourceRecord?.weightText||'—'}, korrigiert)`:current}
function mseCurrentIssuesV15(item){return item.review?.issues||[]}
function mseArtUrlV15(item){return`${MSE_DB_V15.meta?.cardArtPath||'./data/mse-v15-art'}/${encodeURIComponent(item.artFile||`${item.sourceRecord?.cardNumber}.jpg`)}`}
function mseSourceSectionV15(title,value,wide=false){return el('section',{class:'mse-source-section-v15'+(wide?' wide':'')},[el('h5',{text:title}),el('div',{text:String(value||'—')})])}
function mseCorrectionTextV15(item){return(item.editorialCorrections||[]).map(entry=>`${entry.field}: ${entry.sourceValue??'—'} → ${entry.value}. ${entry.reason}`).join('\n')}
function mseOwnedNormalIdsV15(owner,setNumber){return new Set((owner?.equipment||[]).filter(item=>item.sourceVersion==='mse-v15'&&item.sourceRecord?.setNumber===setNumber&&!item.isCompletionReward&&(+item.quantity||0)>0).map(item=>item.catalogId).filter(Boolean))}
function mseCompletionProgressV15(owner,reward){const required=reward.completionRequirement?.requiredUniqueItems||0,owned=mseOwnedNormalIdsV15(owner,reward.completionRequirement?.setNumber).size,unlocked=(owner?.equipment||[]).some(item=>item.catalogId===reward.id&&(+item.quantity||0)>0);return{owned,required,complete:required>0&&owned>=required,unlocked}}
function renderMseCompletionProgressV15(owner,reward){const progress=mseCompletionProgressV15(owner,reward),box=el('div',{class:'mse-completion-progress-v15'}),label=progress.unlocked?'Dauerhaft freigeschaltet':progress.complete?`Vollendet: ${progress.required}/${progress.required}`:`Set-Fortschritt: ${Math.min(progress.owned,progress.required)}/${progress.required}`;box.append(el('strong',{text:label}),el('progress',{max:progress.required,value:progress.unlocked?progress.required:Math.min(progress.owned,progress.required),'aria-label':`Set-Fortschritt ${progress.owned} von ${progress.required}`}));return box}

function createMseCardV15(item){
  const source=item.sourceRecord||{},card=el('article',{class:'mse-card-v15'}),header=el('header',{class:'mse-card-header-v15'}),body=el('div',{class:'mse-card-body-v15'}),image=el('img',{class:'mse-card-art-v15',src:mseArtUrlV15(item),alt:`Illustration: ${item.name}`,loading:'eager',decoding:'async'});
  header.append(el('strong',{text:item.name}),el('span',{text:`${source.setNumber??'—'}·${source.cardNumber||'—'}`}));
  body.append(el('div',{class:'mse-card-type-v15',text:`${MSE_ASSET_LABELS_V15[item.assetKind]||item.assetKind} · ${source.rarity||'ohne Seltenheit'}`}));
  const stats=[...(source.primaryStats||[]),...(source.secondaryStats||[])].join(' · ');
  if(stats)body.append(el('div',{class:'mse-card-stats-v15',text:stats}));
  body.append(el('div',{class:'mse-card-rules-v15',text:source.effectText||'Kein zusätzlicher Regeltext.'}));
  if(source.flavorText)body.append(el('div',{class:'mse-card-flavor-v15',text:source.flavorText}));
  card.append(header,image,body,el('footer',{class:'mse-card-footer-v15'},[el('span',{text:mseWeightValueV15(item.weightKg)}),el('span',{text:msePriceLabelV15(item)})]));
  return card;
}

let MSE_CARD_DIALOG_V15=null;
function showMseCardV15(item,owner=null){
  if(!mseCardCanBeShownV17(owner,item))return false;
  if(!MSE_CARD_DIALOG_V15){MSE_CARD_DIALOG_V15=el('dialog',{class:'mse-card-dialog-v15'});document.body.append(MSE_CARD_DIALOG_V15);MSE_CARD_DIALOG_V15.addEventListener('click',event=>{if(event.target===MSE_CARD_DIALOG_V15)MSE_CARD_DIALOG_V15.close()})}
  const source=item.sourceRecord||{},side=el('aside',{class:'mse-card-side-v15'}),actions=el('div',{class:'mse-card-actions-v15'}),close=el('button',{type:'button',class:'mse-card-close-v15',text:'Schließen',onclick:()=>MSE_CARD_DIALOG_V15.close()});
  side.append(close,el('h3',{text:'Details der Set-Gegenstandskarte'}),el('p',{class:'muted',text:`Set ${source.setNumber??'—'} · Kartennummer ${source.cardNumber||'—'} · Stand ${source.modifiedAt?.slice(0,10)||'—'}`}),el('div',{class:'mse-card-values-v15'},[mseSourceSectionV15('Preis',msePriceLabelV15(item)),mseSourceSectionV15('Gewicht',mseWeightLabelV15(item))]),mseSourceSectionV15('Balanceentscheidung',item.balance?.reason||'Quellwert bestätigt.',true));
  if(item.editorialCorrections?.length)side.append(mseSourceSectionV15('Original → neu',mseCorrectionTextV15(item),true));
  if(source.notes)side.append(mseSourceSectionV15('Redaktionsnotiz',source.notes,true));
  if(owner&&item.isCompletionReward)actions.append(renderMseCompletionProgressV15(owner,item),el('button',{type:'button',disabled:true,text:'Wird automatisch vergeben'}));
  else if(owner)actions.append(el('button',{class:'primary',type:'button',text:'Zum Reiter hinzufügen',onclick:()=>{addMseItemV15(owner,item);MSE_CARD_DIALOG_V15.close()}}));
  side.append(actions);
  MSE_CARD_DIALOG_V15.replaceChildren(el('div',{class:'mse-card-shell-v15'},[createMseCardV15(item),side]));
  MSE_CARD_DIALOG_V15.showModal();
  return true;
}

function addMseItemV15(owner,catalog){
  if(catalog.isCompletionReward||!mseCardIsUnlockedV17(owner,catalog))return false;
  const physical=['weapon','armor','gear'].includes(catalog.assetKind),instance=normalizeItemV174({...structuredClone(catalog),id:undefined,instanceId:uid(),catalogId:catalog.id,quantity:1,qty:1,loadState:physical?'carried':'stored',equippedQuantity:0,active:true,storageLocation:physical?'':MSE_ASSET_LABELS_V15[catalog.assetKind]||''});
  owner.equipment=Array.isArray(owner.equipment)?owner.equipment:[];
  owner.equipment.push(instance);saveOwnerV173(owner,true);return true;
}

function unlockMseCardV17(owner,rawCode){
  const code=mseNormalizeCardCodeV17(rawCode);
  if(!/^\d{4}$/.test(code))return{ok:false,reason:'invalid',message:'Der Kartencode muss genau vier Ziffern enthalten.'};
  const catalog=MSE_BY_CODE_V17.get(code);
  if(!catalog)return{ok:false,reason:'invalid',message:'Kartencode ungültig. Es wurden keine Kartendaten angezeigt.'};
  if(catalog.isCompletionReward)return{ok:false,reason:'completion',message:'Vollendungskarten werden ausschließlich automatisch vergeben, sobald das zugehörige Set vollständig gesammelt wurde.'};
  const unlocked=mseUnlockedCardIdsV17(owner);
  if(unlocked.includes(catalog.id))return{ok:false,reason:'already',item:catalog,message:`${catalog.name} ist bereits freigeschaltet.`};
  owner.mseUnlockedCardIdsV17=[...unlocked,catalog.id];
  const ui=msePickerStateV15(owner);ui.open=true;ui.message=`${catalog.name} wurde freigeschaltet und dem Inventar hinzugefügt.`;
  const added=addMseItemV15(owner,catalog);
  if(!added)saveOwnerV173(owner,true);
  return{ok:true,reason:'unlocked',item:catalog,added,message:ui.message};
}

function mseCompletionInstanceV15(reward){
  const physical=['weapon','armor','gear'].includes(reward.assetKind);
  return normalizeItemV174({...structuredClone(reward),id:undefined,instanceId:uid(),catalogId:reward.id,quantity:1,qty:1,loadState:physical?'carried':'stored',equippedQuantity:0,active:true,storageLocation:physical?'':'Automatische Set-Vollendung',autoGrantedMseCompletion:true,completionGrantedAt:new Date().toISOString()});
}

function syncMseCompletionRewardsV15(owner){
  if(!owner)return{changed:false,added:[],removed:[]};
  owner.equipment=Array.isArray(owner.equipment)?owner.equipment:[];
  const added=[],removed=[];let changed=false;
  for(const reward of MSE_COMPLETION_REWARDS_V15){
    const progress=mseCompletionProgressV15(owner,reward),indexes=[];
    owner.equipment.forEach((item,index)=>{if(item.catalogId===reward.id)indexes.push(index)});
    if(indexes.length){
      const keep=owner.equipment[indexes[0]];
      if(!keep.autoGrantedMseCompletion||keep.quantity!==1){keep.autoGrantedMseCompletion=true;keep.quantity=keep.qty=1;keep.completionRequirement=structuredClone(reward.completionRequirement);keep.completionGrantedAt=keep.completionGrantedAt||new Date().toISOString();changed=true}
      for(let offset=indexes.length-1;offset>=1;offset--){owner.equipment.splice(indexes[offset],1);changed=true}
    }else if(progress.complete){
      owner.equipment.push(mseCompletionInstanceV15(reward));added.push(reward.name);changed=true;
    }
  }
  return{changed,added,removed};
}

function syncAllMseCompletionRewardsV15(data=state){
  let changed=false;const added=[],removed=[];
  for(const character of data?.characters||[])for(const owner of[character,...(character.auxiliaryTabs||[])]){const result=syncMseCompletionRewardsV15(owner);changed||=result.changed;added.push(...result.added);removed.push(...result.removed)}
  return{changed,added,removed};
}

function renderMseCatalogItemV15(owner,item){
  const source=item.sourceRecord||{},article=el('article',{class:'mse-result-v15'+(item.isCompletionReward?' completion-locked':'')}),chips=el('div',{class:'mse-picker-meta-v15'}),details=el('details'),detailBody=el('div'),thumb=el('button',{type:'button',class:'mse-thumb-button-v15','aria-label':`Set-Gegenstandskarte ${item.name} anzeigen`,onclick:()=>showMseCardV15(item,owner)},[el('img',{src:mseArtUrlV15(item),alt:'',loading:'lazy',decoding:'async'})]),heading=el('div',{class:'mse-result-heading-v15'});
  chips.append(el('span',{class:'mse-chip-v15',text:`Set ${source.setNumber??'—'} · Nr. ${source.cardNumber||'—'}`}),el('span',{class:'mse-chip-v15',text:MSE_ASSET_LABELS_V15[item.assetKind]||item.assetKind}),el('span',{class:'mse-chip-v15',text:source.rarity||'ohne Seltenheit'}));
  if(item.editorialCorrections?.length)chips.append(el('span',{class:'mse-chip-v15 adjusted',text:'Neu bewertet'}));
  if(item.tradeStatus==='not-for-sale')chips.append(el('span',{class:'mse-chip-v15 not-sale',text:'Nicht käuflich'}));
  if(item.isCompletionReward)chips.append(el('span',{class:'mse-chip-v15 completion',text:'Automatische Abschlusskarte'}));
  heading.append(thumb,el('div',{},[el('h4',{text:item.name}),chips,el('p',{class:'muted',text:`${mseWeightLabelV15(item)} · ${msePriceLabelV15(item)}`})]));
  details.append(el('summary',{text:'Vollständige Angaben der Set-Gegenstandskarte'}));
  detailBody.append(el('p',{text:[...(source.primaryStats||[]),...(source.secondaryStats||[])].join(' · ')||'Keine zusätzlichen Statistikzeilen.'}),el('p',{text:source.effectText||'Kein Regeltext.'}));
  if(source.notes)detailBody.append(el('p',{class:'muted',text:'Notiz: '+source.notes}));
  details.append(detailBody);
  const actions=el('div',{class:'mse-result-actions-v15'},[el('button',{type:'button',text:'Set-Gegenstandskarte anzeigen',onclick:()=>showMseCardV15(item,owner)})]);
  if(item.isCompletionReward)actions.append(renderMseCompletionProgressV15(owner,item),el('button',{type:'button',disabled:true,text:'Automatische Vergabe'}));
  else actions.append(el('button',{class:'primary',type:'button',text:'Weiteres Exemplar hinzufügen',onclick:()=>addMseItemV15(owner,item)}));
  article.append(heading,details,actions);
  return article;
}

function renderMseCatalogPickerV15(owner){
  const ui=msePickerStateV15(owner),details=el('details',{class:'mse-picker-v15',open:ui.open}),summary=el('summary',{text:'Set-Gegenstandskarte per Code freischalten'}),body=el('div',{class:'mse-picker-body-v15'}),form=el('form',{class:'mse-code-form-v17'}),field=el('label',{class:'mse-code-field-v17'}),input=el('input',{type:'text',inputmode:'numeric',autocomplete:'off',maxlength:4,pattern:'[0-9]{4}',placeholder:'0000','aria-label':'Vierstelliger Kartencode'}),submit=el('button',{class:'primary',type:'submit',text:'Set-Gegenstandskarte freischalten'}),status=el('p',{class:'mse-code-status-v17 muted','aria-live':'polite',text:ui.message||''}),meta=el('div',{class:'mse-picker-meta-v15'}),results=el('div',{class:'mse-results-v15'}),unlocked=mseUnlockedCardIdsV17(owner).map(id=>MSE_BY_ID_V15.get(id)).filter(Boolean);
  field.append(el('span',{text:'Vierstelliger Kartencode'}),input);form.append(field,submit);
  form.onsubmit=event=>{event.preventDefault();const result=unlockMseCardV17(owner,input.value);ui.message=result.message;status.textContent=result.message;if(!result.ok&&result.reason!=='already'){input.select();input.focus({preventScroll:true})}};
  input.oninput=()=>{input.value=input.value.replace(/\D/g,'').slice(0,4);status.textContent=''};
  details.ontoggle=()=>{ui.open=details.open};
  meta.append(el('span',{class:'mse-chip-v15',text:`${unlocked.length} Set-Gegenstandskarte${unlocked.length===1?'':'n'} freigeschaltet`}),el('span',{class:'mse-chip-v15 completion',text:'Vollendungskarten: automatische Vergabe'}));
  if(unlocked.length)results.append(...unlocked.map(item=>renderMseCatalogItemV15(owner,item)));else results.append(el('p',{class:'muted',text:'Noch keine Set-Gegenstandskarten freigeschaltet. Verborgene Set-Gegenstandskarten werden weder aufgelistet noch durchsucht oder als Bild geladen.'}));
  body.append(el('p',{class:'notice mse-catalog-notice-v15',text:'Nur Set-Gegenstandskarten mit gültigem Code werden sichtbar und sofort dem aktuellen Inventar hinzugefügt. Vollendungskarten bleiben verborgen und werden ausschließlich bei einem vollständig gesammelten Set automatisch vergeben.'}),form,status,meta,results);details.append(summary,body);return details;
}

function renderMseSelectedSourceV15(owner,item){
  const source=item.sourceRecord||{},details=el('details',{class:'mse-selected-source-v15'}),grid=el('div',{class:'mse-source-grid-v15'});
  details.append(el('summary',{text:`Set-Gegenstandskarte · Set ${source.setNumber??'—'} · Nr. ${source.cardNumber||'—'}`}));
  grid.append(mseSourceSectionV15('Aktuelle Werte',`${msePriceLabelV15(item)} · ${mseWeightValueV15(item.weightKg)}`),mseSourceSectionV15('Originalquelle',`${source.canonicalPrice||source.priceText||'kein Preis'} · ${source.canonicalWeight||source.weightText||'kein Gewicht'}`),mseSourceSectionV15('Quellwerte',[...(source.primaryStats||[]),...(source.secondaryStats||[])].join(' · ')),mseSourceSectionV15('Regeltext',source.effectText,true));
  if(item.editorialCorrections?.length)grid.append(mseSourceSectionV15('Balanceentscheidung',mseCorrectionTextV15(item),true));
  if(source.notes)grid.append(mseSourceSectionV15('Redaktionsnotiz',source.notes,true));
  const actions=el('div',{class:'mse-result-actions-v15'});
  if(item.isCompletionReward)actions.append(el('span',{class:'mse-chip-v15 completion',text:`Automatisch verliehen · ${item.completionRequirement?.requiredUniqueItems}/${item.completionRequirement?.requiredUniqueItems}`}));
  actions.append(el('button',{type:'button',text:'Set-Gegenstandskarte anzeigen',onclick:()=>showMseCardV15(item,owner)}));
  details.append(grid,actions);return details;
}

function migrateSelectedMseItemsV152(){
  if(state.mseItemBalanceV152Migrated)return false;
  let changed=false;
  for(const character of state.characters||[]){
    for(const owner of[character,...(character.auxiliaryTabs||[])])for(const item of owner.equipment||[]){
      if(item.sourceVersion!=='mse-v15')continue;
      const catalog=MSE_BY_ID_V15.get(item.catalogId);
      if(!catalog||item.sourceHash!==catalog.sourceHash)continue;
      for(const key of['valueCopper','valueText','tradeStatus','isCompletionReward','completionRequirement','weightKg','weightUnknown','weightSource','assetKind','category','itemType','artFile','balance','editorialCorrections'])item[key]=structuredClone(catalog[key]);
      changed=true;
    }
  }
  state.mseItemBalanceV152Migrated=true;
  state.migrationLog=Array.isArray(state.migrationLog)?state.migrationLog:[];
  state.migrationLog.push({at:new Date().toISOString(),changes:['Set-Gegenstandskarten auf den aktuellen Balance-Stand und automatische Abschlusskarten aktualisiert']});
  save();return changed;
}

function migrateMseCardCodesV17(data=state,writeLog=false){
  let changed=false;
  for(const character of data?.characters||[])for(const owner of[character,...(character.auxiliaryTabs||[])]){
    const previous=Array.isArray(owner.mseUnlockedCardIdsV17)?owner.mseUnlockedCardIdsV17:[],next=mseUnlockedCardIdsV17(owner);
    if(JSON.stringify(previous)!==JSON.stringify(next)){owner.mseUnlockedCardIdsV17=next;changed=true}
  }
  if(!data.mseCardCodesV17Migrated){data.mseCardCodesV17Migrated=true;changed=true;if(writeLog){data.migrationLog=Array.isArray(data.migrationLog)?data.migrationLog:[];data.migrationLog.push({at:new Date().toISOString(),changes:['Set-Gegenstandskarten-Katalog auf Freischaltung ausschließlich per vierstelligem Kartencode umgestellt','Bereits vorhandene normale Set-Gegenstandskarten als freigeschaltet übernommen']})}}
  return changed;
}

const saveOwnerBeforeMseCompletionV15=saveOwnerV173;
saveOwnerV173=function(owner,rerender=false){const completion=syncMseCompletionRewardsV15(owner);return saveOwnerBeforeMseCompletionV15(owner,rerender||completion.changed)};
const migrateStateBeforeMseCompletionV15=migrateState;
migrateState=function(data){const migrated=migrateStateBeforeMseCompletionV15(data);syncAllMseCompletionRewardsV15(migrated);return migrated};

const categoryLabelBeforeMseV15=categoryLabelCompactV174;
categoryLabelCompactV174=function(item){return MSE_CATEGORY_LABELS_V15[item.category]||categoryLabelBeforeMseV15(item)};
const categorySelectBeforeMseV15=compactCategorySelectV174;
compactCategorySelectV174=function(owner,item){
  const field=categorySelectBeforeMseV15(owner,item),select=field.querySelector('select');
  for(const definition of MSE_CATEGORIES_V15)if(![...select.options].some(option=>option.value===definition.id))select.append(el('option',{value:definition.id,text:MSE_CATEGORY_LABELS_V15[definition.id]||definition.label}));
  const current=[...select.options].find(option=>option.value===item.category);if(current&&MSE_CATEGORY_LABELS_V15[item.category])current.textContent=MSE_CATEGORY_LABELS_V15[item.category];select.value=item.category||'';return field;
};

const renderEquipmentBeforeMseV15=renderEquipmentV174;
renderEquipmentV174=function(owner){
  const box=renderEquipmentBeforeMseV15(owner),firstCatalog=box.querySelector('.catalog-picker,.catalog-disclosure-r9'),picker=renderMseCatalogPickerV15(owner);if(firstCatalog)firstCatalog.before(picker);else box.prepend(picker);
  [...box.querySelectorAll('.equipment-entry')].forEach((wrap,index)=>{const item=owner.equipment?.[index];if(item?.sourceVersion==='mse-v15')wrap.append(renderMseSelectedSourceV15(owner,item));if(item?.isCompletionReward){wrap.classList.add('mse-completion-item-v15');for(const button of wrap.querySelectorAll('button[aria-label="Duplizieren"],button[aria-label="Entfernen"]'))button.disabled=true;const quantityLabel=[...wrap.querySelectorAll('label')].find(label=>label.querySelector('span')?.textContent==='Anzahl');if(quantityLabel?.querySelector('input'))quantityLabel.querySelector('input').disabled=true}});
  return box;
};

const auditBeforeMseV15=audit;
audit=function(){
  auditBeforeMseV15();const owners=[ch(),...(ch().auxiliaryTabs||[])],flagged=[],completionCount=owners.flatMap(owner=>owner.equipment||[]).filter(item=>item.isCompletionReward).length;
  for(const owner of owners)for(const item of owner.equipment||[]){if(item.sourceVersion!=='mse-v15')continue;const issues=mseCurrentIssuesV15(item);if(issues.length)flagged.push(`${owner.name||owner.type||'Charakter'}: ${item.name} (${issues.join(', ')})`)}
  auditResults.append(el('h3',{text:'Set-Gegenstandskarten'}),el('div',{class:'notice '+(flagged.length?'error':'ok'),text:flagged.length?`⚠ ${flagged.length} ausgewählte Set-Gegenstandskarten benötigen noch eine Prüfung: ${flagged.join(' · ')}`:`✓ Preise und Gewichte sind vollständig; ${completionCount} automatische Set-Vollendung${completionCount===1?'':'en'} im Inventar.`}));
};

const runTestsBeforeMseV15=runTests;
runTests=function(){
  const baseOk=runTestsBeforeMseV15(),tests=[],eq=(name,expected,actual)=>tests.push([name,expected,actual,expected===actual]),owner=newCharacter(),sample=MSE_ITEMS_V15.find(item=>item.sourceRecord?.cardNumber==='0200'),fiole=MSE_ITEMS_V15.find(item=>item.sourceRecord?.cardNumber==='0224'),ship=MSE_ITEMS_V15.find(item=>item.sourceRecord?.cardNumber==='0311'),dream=MSE_ITEMS_V15.find(item=>item.sourceRecord?.cardNumber==='0029'),sixPiece=MSE_ITEMS_V15.find(item=>item.sourceRecord?.cardNumber==='0328');
  eq('MSE-v15-Katalog vollständig',496,MSE_ITEMS_V15.length);eq('MSE-v15-IDs eindeutig',496,new Set(MSE_ITEMS_V15.map(item=>item.id)).size);eq('Alle 38 Sets vorhanden',38,new Set(MSE_ITEMS_V15.map(item=>item.sourceRecord?.setNumber)).size);eq('18 echte Abschlusskarten erkannt',18,MSE_COMPLETION_REWARDS_V15.length);eq('Alle Preise entschieden',0,MSE_ITEMS_V15.filter(item=>item.valueCopper===null).length);eq('Keine offene Balanceprüfung',0,MSE_ITEMS_V15.filter(item=>item.review?.issues?.length).length);eq('Ravellas Fiole wiegt 0,7 kg',0.7,fiole?.weightKg);eq('30-Personen-Segler wiegt 80 t',80000,ship?.weightKg);eq('Segler ist automatische 12/12-Abschlusskarte',true,ship?.isCompletionReward&&ship?.completionRequirement?.requiredUniqueItems===12);eq('Nicht handelbarer Traum markiert','Nicht käuflich',dream?.valueText);eq('Sonnenstab-Preis bleibt 266 Silber',26600,sample?.valueCopper);eq('Sonnenstab-Gewicht bleibt 1,8 kg',1.8,sample?.weightKg);owner.mseUnlockedCardIdsV17=[sample.id,sixPiece.id];addMseItemV15(owner,sample);eq('MSE-Item als unabhängige Instanz ergänzt',true,owner.equipment[0]?.catalogId===sample.id&&owner.equipment[0]?.instanceId!==sample.id);eq('MSE-Quellrecord bleibt im Charakterbackup',sample.sourceHash,JSON.parse(JSON.stringify(owner)).equipment[0].sourceHash);eq('Kartenansicht enthält Illustration',true,!!createMseCardV15(sample).querySelector('img[src*="0200.jpg"]'));eq('MSE-Codefeld ist bedienbar',true,!!renderMseCatalogPickerV15(owner).querySelector('input[aria-label="Vierstelliger Kartencode"]'));eq('Sechs-Teile-Bonusitem bleibt normal kaufbar',true,!sixPiece?.isCompletionReward&&sixPiece?.tradeStatus==='market'&&addMseItemV15(owner,sixPiece));
  const reward=MSE_ITEMS_V15.find(item=>item.sourceRecord?.cardNumber==='0303'),normal=MSE_ITEMS_V15.filter(item=>item.sourceRecord?.setNumber===7&&!item.isCompletionReward),completionOwner=newCharacter(),instance=item=>normalizeItemV174({...structuredClone(item),id:undefined,instanceId:uid(),catalogId:item.id,quantity:1,qty:1});completionOwner.equipment=normal.slice(0,8).map(instance);syncMseCompletionRewardsV15(completionOwner);eq('Unter Set-Schwelle keine Abschlusskarte',false,completionOwner.equipment.some(item=>item.catalogId===reward.id));completionOwner.equipment.push(instance(normal[0]));syncMseCompletionRewardsV15(completionOwner);eq('Duplikat zählt nicht zur Set-Schwelle',false,completionOwner.equipment.some(item=>item.catalogId===reward.id));completionOwner.equipment.push(instance(normal[8]));syncMseCompletionRewardsV15(completionOwner);eq('Set-Vollendung wird automatisch vergeben',true,completionOwner.equipment.some(item=>item.catalogId===reward.id&&item.autoGrantedMseCompletion));completionOwner.equipment=completionOwner.equipment.filter(item=>item.catalogId!==normal[8].id);syncMseCompletionRewardsV15(completionOwner);eq('Einmal gesammelte Vollendung bleibt dauerhaft',true,completionOwner.equipment.some(item=>item.catalogId===reward.id));
  const body=testResults.querySelector('tbody');for(const[name,expected,actual,ok]of tests)body?.append(el('tr',{},[name,expected,actual,ok?'Bestanden':'Fehler'].map(value=>el('td',{text:String(value)}))));return baseOk&&tests.every(test=>test[3]);
};

/* Revision r6: automatisch verknuepfte NPC-, Begleiter- und Reittierreiter. */
{
const MSE_COMPANION_PROFILE_VERSION_V16=1;
const MSE_COMPANION_TYPES_V16={npc:'NPC-Begleiter',familiar:'Begleiter',mount:'Reittier'};
const MSE_MOUNT_NAME_V16=/(pferd|ross|stute|kaltblut|pegasus|einhorn|hippocamp|maultier|riesenhirsch|dracheneinhorn|kelpie|feldross|panzerross|siegelstute|granitwidder)/i;
const MSE_NPC_NAME_V16=/(kanzleischreiberin|geselle der esse|junge kopistin|informantin|noble des blumenhofs|see[- ]nixe|gefaehrtin der fremden namen|gefährtin der fremden namen|begleiter der pilger|umseni)/i;

function mseCompanionCatalogV16(item){return MSE_BY_ID_V15.get(item?.catalogId||item?.id)||item}
function mseCompanionKindV16(item){
  const catalog=mseCompanionCatalogV16(item),source=catalog?.sourceRecord||{},stats=[...(source.primaryStats||[]),...(source.secondaryStats||[])].join(' '),effect=source.effectText||'';
  if(catalog?.assetKind!=='companion'||!/(begleiter|reittier)/i.test(stats))return null;
  if(/reittier/i.test(stats)||MSE_MOUNT_NAME_V16.test(catalog.name||'')||/Besitzer:\s*Reiten\s*&\s*Tierfuehrung|Besitzer:\s*Reiten\s*&\s*Tierführung/i.test(effect))return'mount';
  if(MSE_NPC_NAME_V16.test(catalog.name||''))return'npc';
  return'familiar';
}
function mseCompanionTypeLabelV16(type){return MSE_COMPANION_TYPES_V16[type]||type||'Begleiter'}
function mseRootCharacterV16(owner,data=state){
  for(const character of data?.characters||[]){if(character===owner||character.id===owner?.id)return character;if((character.auxiliaryTabs||[]).some(entry=>entry===owner||entry.id===owner?.id))return character}
  return Array.isArray(owner?.auxiliaryTabs)?owner:null;
}
function mseOwnersForCharacterV16(character){return[character,...(character?.auxiliaryTabs||[])]}
function mseLinkedAuxV16(character,item){return(character?.auxiliaryTabs||[]).find(entry=>entry.id===item?.linkedMseAuxId)||null}
function mseLinkValueV16(target,key,value){const previous=target?.[key],same=JSON.stringify(previous)===JSON.stringify(value);if(!same)target[key]=value;return!same}
function mseSkillByNameV16(name){const wanted=normalizeNameV174(name);return SKILLS.find(skill=>normalizeNameV174(skill.name)===wanted)||SKILLS.find(skill=>normalizeNameV174(skill.name).includes(wanted)||wanted.includes(normalizeNameV174(skill.name)))}
function mseSetSkillV16(owner,name,level,note){const skill=mseSkillByNameV16(name);if(!skill)return false;const data=owner.skills[skill.id]||(owner.skills[skill.id]={level:0,fav:false,note:''});data.level=Math.max(+data.level||0,Math.max(0,Math.min(25,+level||0)));data.fav=data.level>0||data.fav;data.note=data.note||note||'';return true}
function mseSetCounterV16(owner,id,value){const max=Math.max(2,Math.min(25,+value||2));owner.counters[id]={...(owner.counters[id]||{}),max,current:max}}

function mseApplyCompanionProfileV16(owner,item,kind){
  if(owner.mseCompanionProfileVersion>=MSE_COMPANION_PROFILE_VERSION_V16)return owner;
  const catalog=mseCompanionCatalogV16(item),name=catalog?.name||owner.name||'',effect=catalog?.sourceRecord?.effectText||'';
  const profiles={
    npc:{attributes:{ST:3,KS:3,GS:3,RF:3,FF:3,WL:3,IT:3,IN:3,WN:3,CR:3},counters:{L:5,A:5,FO:4,M:2,GB:2,HS:2,FS:2,GL:2}},
    familiar:{attributes:{ST:3,KS:3,GS:4,RF:4,FF:1,WL:3,IT:2,IN:4,WN:5,CR:3},counters:{L:5,A:5,FO:3,M:2,GB:2,HS:2,FS:2,GL:3}},
    mount:{attributes:{ST:6,KS:6,GS:4,RF:3,FF:1,WL:3,IT:2,IN:3,WN:4,CR:3},counters:{L:8,A:8,FO:3,M:2,GB:2,HS:2,FS:2,GL:3}}
  };
  const profile=profiles[kind]||profiles.familiar;
  owner.attributes={...owner.attributes,...profile.attributes};
  for(const[id,value]of Object.entries(profile.counters))mseSetCounterV16(owner,id,value);
  if(kind==='npc'){
    mseSetSkillV16(owner,'Aufmerksamkeit & Wachsamkeit',3,'Startwert des automatisch erzeugten NPC-Begleiters.');
    mseSetSkillV16(owner,'Menschenkenntnis & Wesen erkennen',3,'Startwert des automatisch erzeugten NPC-Begleiters.');
  }else if(kind==='mount'){
    mseSetSkillV16(owner,'Athletik & Schwimmen',4,'Körperlicher Startwert des Reittiers.');
    mseSetSkillV16(owner,'Aufmerksamkeit & Wachsamkeit',3,'Wahrnehmungswert des Reittiers.');
    mseSetSkillV16(owner,'Vermeiden & Ausweichen',3,'Bewegungswert des Reittiers.');
    mseSetSkillV16(owner,'Wildniskunde & Wildnisleben',2,'Orientierungs- und Überlebensgrundlage des Reittiers.');
  }else{
    mseSetSkillV16(owner,'Aufmerksamkeit & Wachsamkeit',4,'Wahrnehmungswert des Begleiters.');
    mseSetSkillV16(owner,'Vermeiden & Ausweichen',3,'Bewegungswert des Begleiters.');
    mseSetSkillV16(owner,'Wildniskunde & Wildnisleben',2,'Natürlicher Startwert des Begleiters.');
  }
  if(/hund|wolf|bluthund|mastiff/i.test(name)){
    Object.assign(owner.attributes,{ST:4,KS:4,GS:4,RF:4,WN:5});mseSetCounterV16(owner,'L',6);mseSetCounterV16(owner,'A',6);
    mseSetSkillV16(owner,'Fährtenlesen & Spurensuche',4,'Archetypischer Startwert für Hund oder Wolf.');
    mseSetSkillV16(owner,'Aufmerksamkeit & Wachsamkeit',4,'Archetypischer Startwert für Hund oder Wolf.');
  }
  if(/bär|baer/i.test(name)){
    Object.assign(owner.attributes,{ST:7,KS:6,GS:3,RF:3,WN:4});mseSetCounterV16(owner,'L',9);mseSetCounterV16(owner,'A',7);
    mseSetSkillV16(owner,'Nahkampf – Raufen & Ringen',4,'Archetypischer Kampfwert eines Bären.');
  }
  if(/golem/i.test(name)){
    Object.assign(owner.attributes,{ST:8,KS:8,GS:2,RF:2,FF:2,WL:5,IT:2,IN:2,WN:3,CR:1});mseSetCounterV16(owner,'L',10);mseSetCounterV16(owner,'A',10);
    mseSetSkillV16(owner,'Verteidigung & Blocken',4,'Archetypischer Schutzwert eines Golems.');
  }
  if(/rabe|kraehe|krähe|eule|falke|adler|phoenix|phönix|papagei|fee|licht/i.test(name)){
    if(kind!=='mount')Object.assign(owner.attributes,{ST:1,KS:2,GS:5,RF:5,FF:1,IN:4,WN:5});
    mseSetSkillV16(owner,'Akrobatik & Klettern',4,'Archetypischer Bewegungswert eines kleinen oder fliegenden Begleiters.');
    mseSetSkillV16(owner,'Vermeiden & Ausweichen',4,'Archetypischer Ausweichwert eines kleinen oder fliegenden Begleiters.');
  }
  if(/katze/i.test(name)){
    Object.assign(owner.attributes,{ST:2,KS:3,GS:5,RF:5,FF:2,IN:4,WN:5});
    mseSetSkillV16(owner,'Heimlichkeit & Schleichen',4,'Archetypischer Startwert einer Katze.');
    mseSetSkillV16(owner,'Akrobatik & Klettern',4,'Archetypischer Startwert einer Katze.');
  }
  if(/schwein/i.test(name)){
    Object.assign(owner.attributes,{ST:4,KS:5,GS:3,RF:3,WN:5});
    mseSetSkillV16(owner,'Fährtenlesen & Spurensuche',4,'Archetypischer Spürwert des Begleiters.');
  }
  const effectAliases={
    'Meta-Magie':'Meta-Magie & Arkane Ordnung',
    'Magische Wahrnehmung':'Magiewahrnehmung & Wahrnehmung für Übernatürliches',
    'Magiewahrnehmung':'Magiewahrnehmung & Wahrnehmung für Übernatürliches'
  };
  for(const skill of SKILLS){
    const position=effect.indexOf(skill.name);if(position<0)continue;
    const bonus=+(effect.slice(position+skill.name.length,position+skill.name.length+28).match(/\+(\d+)/)?.[1]||1);
    mseSetSkillV16(owner,skill.name,Math.min(5,bonus+1),`Thematischer Startwert aus der Set-Gegenstandskarte; der gedruckte Besitzerbonus beträgt +${bonus}.`);
  }
  for(const[alias,skillName]of Object.entries(effectAliases))if(effect.includes(alias)){
    const position=effect.indexOf(alias),bonus=+(effect.slice(position+alias.length,position+alias.length+28).match(/\+(\d+)/)?.[1]||1);
    mseSetSkillV16(owner,skillName,Math.min(5,bonus+1),`Thematischer Startwert aus der Set-Gegenstandskarte; der gedruckte Besitzerbonus beträgt +${bonus}.`);
  }
  owner.level=kind==='mount'?4:3;
  owner.mseCompanionProfileVersion=MSE_COMPANION_PROFILE_VERSION_V16;
  return owner;
}

function mseEnsureMountFeatureCardsV16(owner){
  if(owner?.type!=='mount')return 0;
  ensureOwnerV175(owner);ensureOwnerV174(owner,false);let added=0;
  for(const[type,afterType,width]of NPC_FEATURE_CARDS_R4)if(ensureNpcFeatureCardR4(owner,type,afterType,width))added++;
  return added;
}
const ensureNpcFeatureCardsBeforeMseCompanionV16=ensureNpcFeatureCardsR4;
ensureNpcFeatureCardsR4=function(owner){return ensureNpcFeatureCardsBeforeMseCompanionV16(owner)+mseEnsureMountFeatureCardsV16(owner)};
const newAuxEntryBeforeMseCompanionV16=newAuxEntry;
newAuxEntry=function(type,name){
  const owner=newAuxEntryBeforeMseCompanionV16(type,name||(type==='mount'?'Reittier':undefined));
  if(type==='mount'){
    owner.type='mount';owner.name=name||owner.name||'Reittier';mseEnsureMountFeatureCardsV16(owner);
    if(!owner.npcCreationCostInitialized){owner.accounting={...(owner.accounting||{}),mode:'character',costSource:'handbook',manualCost:0,active:true};owner.npcCreationCostInitialized=true}
  }
  return owner;
};

function mseCreateCompanionAuxV16(character,inventoryOwner,item,kind){
  const catalog=mseCompanionCatalogV16(item),source=catalog.sourceRecord||{},entry=newAuxEntry(kind,catalog.name);
  entry.type=kind;entry.name=catalog.name;entry.portrait=mseArtUrlV15(catalog);
  entry.description=[mseCompanionTypeLabelV16(kind),...(source.primaryStats||[]),...(source.secondaryStats||[])].filter(Boolean).join(' · ');
  entry.relationship=kind==='mount'?'Reittier des Charakters':kind==='npc'?'NPC-Begleiter des Charakters':'Gebundener Begleiter des Charakters';
  entry.availability=item.active===false?'Im Inventar, derzeit inaktiv':'Im Inventar verfügbar';
  entry.notes=[source.effectText,source.notes].filter(Boolean).join('\n\n');
  entry.accounting={mode:'informational',costSource:'manual',manualCost:0,reason:'Über die verknüpfte Set-Gegenstandskarte erworben; keine zusätzlichen CBP-Kosten.',active:false};
  entry.npcCreationCostInitialized=true;entry.mseAutoCreated=true;
  entry.sourceMseItemV16={catalogId:catalog.id,sourceHash:catalog.sourceHash,cardNumber:source.cardNumber||'',inventoryOwnerId:inventoryOwner.id,itemInstanceIds:[item.instanceId],kind,linkedAt:new Date().toISOString(),status:'linked',profileVersion:MSE_COMPANION_PROFILE_VERSION_V16};
  mseApplyCompanionProfileV16(entry,catalog,kind);character.auxiliaryTabs.push(entry);return entry;
}

function syncMseCompanionLinksForCharacterV16(character){
  if(!character)return{changed:false,created:[],repaired:[],missing:[]};
  character.auxiliaryTabs=Array.isArray(character.auxiliaryTabs)?character.auxiliaryTabs:[];
  const created=[],repaired=[],missing=[];let changed=false;
  const inventories=mseOwnersForCharacterV16(character),groups=new Map();
  for(const inventoryOwner of inventories)for(const item of inventoryOwner.equipment||[]){
    const kind=mseCompanionKindV16(item);if(!kind)continue;
    const catalog=mseCompanionCatalogV16(item),key=catalog.id||item.catalogId;if(!key)continue;
    if(!groups.has(key))groups.set(key,[]);groups.get(key).push({inventoryOwner,item,kind,catalog});
  }
  const liveCatalogIds=new Set(groups.keys());
  for(const[catalogId,links]of groups){
    const preferredIds=links.map(link=>link.item.linkedMseAuxId).filter(Boolean),candidates=character.auxiliaryTabs.filter(entry=>preferredIds.includes(entry.id)||entry.sourceMseItemV16?.catalogId===catalogId),first=links[0];
    let entry=candidates[0];if(!entry){entry=mseCreateCompanionAuxV16(character,first.inventoryOwner,first.item,first.kind);created.push(entry.name);changed=true}
    const instanceIds=[...new Set(links.map(link=>link.item.instanceId).filter(Boolean))],linkedAt=entry.sourceMseItemV16?.linkedAt||new Date().toISOString(),sourceData={catalogId,sourceHash:first.catalog.sourceHash,cardNumber:first.catalog.sourceRecord?.cardNumber||'',inventoryOwnerId:first.inventoryOwner.id,itemInstanceIds:instanceIds,kind:first.kind,linkedAt,status:'linked',profileVersion:entry.mseCompanionProfileVersion||MSE_COMPANION_PROFILE_VERSION_V16};
    changed=mseLinkValueV16(entry,'sourceMseItemV16',sourceData)||changed;
    if(entry.type!==first.kind){entry.type=first.kind;changed=true}
    mseEnsureMountFeatureCardsV16(entry);mseApplyCompanionProfileV16(entry,first.catalog,first.kind);
    for(const link of links){
      changed=mseLinkValueV16(link.item,'linkedMseAuxId',entry.id)||changed;
      changed=mseLinkValueV16(link.item,'mseCompanionLinkV16',{catalogId,auxId:entry.id,kind:first.kind,linkedAt})||changed;
      if(link.item.instanceId!==instanceIds[0])repaired.push(link.item.name);
    }
  }
  for(const entry of character.auxiliaryTabs){const source=entry.sourceMseItemV16;if(!source?.catalogId||liveCatalogIds.has(source.catalogId))continue;const next={...source,itemInstanceIds:[],status:'missing-item'};if(mseLinkValueV16(entry,'sourceMseItemV16',next)){changed=true;missing.push(entry.name)}}
  return{changed,created,repaired,missing};
}
function syncMseCompanionLinksForOwnerV16(owner,data=state){const character=mseRootCharacterV16(owner,data);return syncMseCompanionLinksForCharacterV16(character)}
function syncAllMseCompanionLinksV16(data=state){let changed=false;const created=[],repaired=[],missing=[];for(const character of data?.characters||[]){const result=syncMseCompanionLinksForCharacterV16(character);changed||=result.changed;created.push(...result.created);repaired.push(...result.repaired);missing.push(...result.missing)}return{changed,created,repaired,missing}}

const addMseItemBeforeCompanionV16=addMseItemV15;
addMseItemV15=function(owner,catalog){
  const kind=mseCompanionKindV16(catalog),character=kind?mseRootCharacterV16(owner):null;
  if(kind&&character){
    const existing=mseOwnersForCharacterV16(character).flatMap(entry=>(entry.equipment||[]).map(item=>({entry,item}))).find(link=>link.item.catalogId===catalog.id&&(+link.item.quantity||0)>0);
    if(existing){const result=syncMseCompanionLinksForCharacterV16(character),entry=mseLinkedAuxV16(character,existing.item);if(result.changed)save();renderAuxTabs();if(entry&&character===ch())openAux(entry.id);return false}
  }
  const added=addMseItemBeforeCompanionV16(owner,catalog);if(!added||!kind)return added;
  const result=syncMseCompanionLinksForOwnerV16(owner),item=(owner.equipment||[]).findLast?.(entry=>entry.catalogId===catalog.id)||(owner.equipment||[]).slice().reverse().find(entry=>entry.catalogId===catalog.id),entry=mseLinkedAuxV16(character||mseRootCharacterV16(owner),item);
  if(result.changed)save();renderAuxTabs();if(entry&&(character||mseRootCharacterV16(owner))===ch())openAux(entry.id);return true;
};

const saveOwnerBeforeMseCompanionV16=saveOwnerV173;
saveOwnerV173=function(owner,rerender=false){const completion=syncMseCompletionRewardsV15(owner),links=syncMseCompanionLinksForOwnerV16(owner);return saveOwnerBeforeMseCompanionV16(owner,rerender||completion.changed||links.changed)};
const migrateStateBeforeMseCompanionV16=migrateState;
migrateState=function(data){const migrated=migrateStateBeforeMseCompanionV16(data);syncAllMseCompanionLinksV16(migrated);return migrated};

const renderMseSelectedSourceBeforeCompanionV16=renderMseSelectedSourceV15;
renderMseSelectedSourceV15=function(owner,item){
  const details=renderMseSelectedSourceBeforeCompanionV16(owner,item),kind=mseCompanionKindV16(item);if(!kind)return details;
  const character=mseRootCharacterV16(owner),entry=mseLinkedAuxV16(character,item),box=el('section',{class:'notice mse-companion-link-v16'}),actions=el('div',{class:'mse-result-actions-v15'});
  box.append(el('strong',{text:entry?`Verknüpfter ${mseCompanionTypeLabelV16(entry.type)}-Reiter: ${entry.name}`:'Begleiter-Reiter wird beim nächsten Speichern wiederhergestellt.'}),el('p',{class:'muted',text:'Inventarkarte und Werte-Reiter besitzen eine dauerhafte gemeinsame Kennung; wiederholtes Hinzufügen erzeugt keinen zweiten Reiter.'}));
  if(entry)actions.append(el('button',{type:'button',text:'Verknüpften Reiter öffnen',disabled:character!==ch(),onclick:()=>openAux(entry.id)}));else actions.append(el('button',{type:'button',text:'Verknüpfung reparieren',onclick:()=>{syncMseCompanionLinksForOwnerV16(owner);save();renderAll()}}));
  box.append(actions);details.append(box);return details;
};
const renderAuxProfileBeforeMseCompanionV16=renderAuxProfileV171;
renderAuxProfileV171=function(owner){
  const box=renderAuxProfileBeforeMseCompanionV16(owner);if(owner.type==='mount')for(const label of box.querySelectorAll('label.field')){const caption=label.querySelector('span');if(caption?.textContent==='NPC-Art'){caption.textContent='Reittier-Art';const select=label.querySelector('select');if(select&&!select.querySelector('option[value="Reittier / Tiergefährte"]'))select.append(el('option',{value:'Reittier / Tiergefährte',text:'Reittier / Tiergefährte'}));if(select){owner.npcType=owner.npcType||'Reittier / Tiergefährte';select.value=owner.npcType}}}
  if(owner.sourceMseItemV16?.catalogId){const catalog=MSE_BY_ID_V15.get(owner.sourceMseItemV16.catalogId),status=owner.sourceMseItemV16.status==='missing-item'?'Inventarkarte fehlt – der ausgearbeitete Reiter bleibt erhalten.':'Dauerhaft mit der Inventarkarte verknüpft.';box.prepend(el('section',{class:'notice ok mse-companion-link-v16'},[el('strong',{text:`${mseCompanionTypeLabelV16(owner.type)} aus Set-Gegenstandskarte ${owner.sourceMseItemV16.cardNumber||'—'}`}),el('p',{text:status}),catalog?el('button',{type:'button',text:'Set-Gegenstandskarte anzeigen',onclick:()=>showMseCardV15(catalog,mseRootCharacterV16(owner))}):el('span')]))}
  return box;
};

if(typeof auxType!=='undefined'&&!auxType.querySelector('option[value="mount"]'))auxType.append(el('option',{value:'mount',text:'Reittier'}));
const printableOwnersBeforeMseCompanionV16=printableOwnersR15;
printableOwnersR15=function(){const descriptors=printableOwnersBeforeMseCompanionV16();for(const descriptor of descriptors){const owner=mseOwnersForCharacterV16(ch()).find(entry=>entry.id===descriptor.key);if(owner?.type==='mount')descriptor.kind='Reittier';else if(owner?.sourceMseItemV16&&owner.type==='npc')descriptor.kind='NPC-Begleiter';else if(owner?.sourceMseItemV16&&owner.type==='familiar')descriptor.kind='Begleiter'}return descriptors};

const auditBeforeMseCompanionV16=audit;
audit=function(){auditBeforeMseCompanionV16();const character=ch(),eligible=new Set(mseOwnersForCharacterV16(character).flatMap(owner=>owner.equipment||[]).filter(mseCompanionKindV16).map(item=>item.catalogId)),linked=character.auxiliaryTabs.filter(owner=>owner.sourceMseItemV16?.status==='linked'),missing=character.auxiliaryTabs.filter(owner=>owner.sourceMseItemV16?.status==='missing-item');auditResults.append(el('h3',{text:'Set-Gegenstandskarten: Begleiter und Reittiere'}),el('div',{class:'notice '+(eligible.size===linked.length?'ok':'error'),text:`${linked.length} verknüpfte Reiter für ${eligible.size} unterschiedliche Begleiter-/Reittierkarten · ${missing.length} erhaltene Reiter ohne Inventarkarte.`}))};

const runTestsBeforeMseCompanionV16=runTests;
runTests=function(){
  const baseOk=runTestsBeforeMseCompanionV16(),tests=[],eq=(name,expected,actual)=>tests.push([name,expected,actual,expected===actual]),eligible=MSE_ITEMS_V15.filter(mseCompanionKindV16),horse=MSE_BY_ID_V15.get('mse_item_0278'),dog=MSE_BY_ID_V15.get('mse_item_0089'),owner=newCharacter(),make=catalog=>normalizeItemV174({...structuredClone(catalog),id:undefined,instanceId:uid(),catalogId:catalog.id,quantity:1,qty:1,loadState:'stored'});
  eq('78 echte MSE-Begleiter oder Reittiere erkannt',78,eligible.length);eq('Reisepferd wird als Reittier erkannt','mount',mseCompanionKindV16(horse));eq('Wachhund wird als Begleiter erkannt','familiar',mseCompanionKindV16(dog));
  owner.equipment.push(make(horse));let result=syncMseCompanionLinksForCharacterV16(owner),entry=owner.auxiliaryTabs.find(tab=>tab.sourceMseItemV16?.catalogId===horse.id),item=owner.equipment[0];
  eq('Reittierreiter automatisch angelegt',true,result.created.length===1&&entry?.type==='mount');eq('Inventarkarte verweist dauerhaft auf Reiter',entry?.id,item.linkedMseAuxId);eq('Reiter verweist dauerhaft auf Inventarinstanz',item.instanceId,entry?.sourceMseItemV16?.itemInstanceIds?.[0]);eq('Reittier besitzt eigene Grundwerte',true,entry.attributes.ST>1&&entry.counters.L.max>2);eq('Reittier besitzt eigene Fähigkeiten',true,Object.values(entry.skills).some(skill=>skill.level>0));eq('Reittier besitzt vollständige Mechanikkarten',true,NPC_FEATURE_CARDS_R4.every(([type])=>entry.layout.some(card=>card.type===type)));
  const tabCount=owner.auxiliaryTabs.length;result=syncMseCompanionLinksForCharacterV16(owner);eq('Wiederholte Synchronisierung erzeugt keinen Reiter',tabCount,owner.auxiliaryTabs.length);eq('Wiederholte Synchronisierung bleibt unverändert',false,result.changed);
  owner.equipment.push(make(horse));syncMseCompanionLinksForCharacterV16(owner);eq('Doppelte Inventarinstanz nutzt denselben Reiter',1,new Set(owner.equipment.map(row=>row.linkedMseAuxId)).size);eq('Doppelte Inventarinstanz erzeugt keinen zweiten Reiter',1,owner.auxiliaryTabs.filter(tab=>tab.sourceMseItemV16?.catalogId===horse.id).length);
  const backup=JSON.parse(JSON.stringify({appVersion:APP_VERSION,schemaVersion:SCHEMA_VERSION,settings:structuredClone(state.settings),migrationLog:[],activeCharacterId:owner.id,characters:[owner]})),restored=migrateState(backup),restoredOwner=restored.characters[0],restoredEntry=restoredOwner.auxiliaryTabs.find(tab=>tab.sourceMseItemV16?.catalogId===horse.id);eq('Backup und Import erhalten die Reiter-ID',entry.id,restoredEntry?.id);eq('Backup und Import erhalten Grundwerte',entry.attributes.ST,restoredEntry?.attributes.ST);eq('Backup und Import erhalten Fähigkeiten',entry.skills[mseSkillByNameV16('Athletik & Schwimmen').id].level,restoredEntry?.skills[mseSkillByNameV16('Athletik & Schwimmen').id].level);
  owner.equipment=[];syncMseCompanionLinksForCharacterV16(owner);eq('Reiter bleibt beim Entfernen der Karte erhalten','missing-item',entry.sourceMseItemV16.status);owner.equipment=[make(horse)];syncMseCompanionLinksForCharacterV16(owner);eq('Erneutes Hinzufügen repariert statt zu duplizieren',entry.id,owner.equipment[0].linkedMseAuxId);
  const body=testResults.querySelector('tbody');for(const[name,expected,actual,ok]of tests)body?.append(el('tr',{},[name,expected,actual,ok?'Bestanden':'Fehler'].map(value=>el('td',{text:String(value)}))));return baseOk&&tests.every(test=>test[3]);
};

const initialMseCompanionSyncV16=syncAllMseCompanionLinksV16();
if(!state.mseCompanionTabsV16Migrated){state.mseCompanionTabsV16Migrated=true;state.migrationLog=Array.isArray(state.migrationLog)?state.migrationLog:[];state.migrationLog.push({at:new Date().toISOString(),changes:[`${initialMseCompanionSyncV16.created.length} vorhandene Begleiter-/Reittier-Set-Gegenstandskarten mit eigenen Reitern verknüpft`,'Dauerhafte Inventarverknüpfung, Duplikatschutz und Wiederherstellung beim Import aktiviert']});save()}else if(initialMseCompanionSyncV16.changed)save();
queueMicrotask(()=>Object.assign(window.Eberos,{mseCompanionKindV16,syncCompanionLinksV16:syncMseCompanionLinksForCharacterV16,syncAllCompanionLinksV16:syncAllMseCompanionLinksV16,linkedCompanionAuxV16:mseLinkedAuxV16}));
}

const migrateStateBeforeMseCardCodesV17=migrateState;
migrateState=function(data){const migrated=migrateStateBeforeMseCardCodesV17(data);migrateMseCardCodesV17(migrated,false);return migrated};
const runTestsBeforeMseCardCodesV17=runTests;
runTests=function(){
  const baseOk=runTestsBeforeMseCardCodesV17(),tests=[],eq=(name,expected,actual)=>tests.push([name,expected,actual,expected===actual]),lockedOwner=newCharacter(),sun=MSE_BY_CODE_V17.get('0200'),completion=MSE_COMPLETION_REWARDS_V15[0],sixPiece=MSE_BY_CODE_V17.get('0328');
  eq('496 eindeutige vierstellige Kartencodes',496,new Set(MSE_ITEMS_V15.map(item=>item.sourceRecord?.cardNumber)).size);eq('Verborgene Karte kann nicht direkt hinzugefügt werden',false,addMseItemV15(lockedOwner,sun));
  const lockedPicker=renderMseCatalogPickerV15(lockedOwner);eq('Ohne Code werden keine Karten angezeigt',0,lockedPicker.querySelectorAll('.mse-result-v15').length);eq('Ohne Code wird kein Kartenbild geladen',0,lockedPicker.querySelectorAll('.mse-thumb-button-v15 img').length);eq('Ungültiger Code bleibt verborgen','invalid',unlockMseCardV17(lockedOwner,'9999').reason);eq('Vollendungskarte nicht manuell freischaltbar','completion',unlockMseCardV17(lockedOwner,completion.sourceRecord.cardNumber).reason);
  const result=unlockMseCardV17(lockedOwner,'0200');eq('Gültiger Code schaltet Karte frei',true,result.ok&&mseCardIsUnlockedV17(lockedOwner,sun));eq('Freigeschaltete Karte landet im Inventar',1,lockedOwner.equipment.filter(item=>item.catalogId===sun.id).length);eq('Wiederholter Code erzeugt kein Duplikat','already',unlockMseCardV17(lockedOwner,'0200').reason);eq('Wiederholter Code lässt genau ein Exemplar bestehen',1,lockedOwner.equipment.filter(item=>item.catalogId===sun.id).length);
  const bonusOwner=newCharacter(),bonus=unlockMseCardV17(bonusOwner,sixPiece.sourceRecord.cardNumber);eq('Normale Sechs-Teile-Bonuskarte bleibt per Code freischaltbar',true,bonus.ok&&bonusOwner.equipment.some(item=>item.catalogId===sixPiece.id));
  const backup=JSON.parse(JSON.stringify({characters:[lockedOwner],migrationLog:[]}));migrateMseCardCodesV17(backup,false);eq('Backup und Import erhalten Freischaltungen',sun.id,backup.characters[0].mseUnlockedCardIdsV17[0]);
  const body=testResults.querySelector('tbody');for(const[name,expected,actual,ok]of tests)body?.append(el('tr',{},[name,expected,actual,ok?'Bestanden':'Fehler'].map(value=>el('td',{text:String(value)}))));return baseOk&&tests.every(test=>test[3]);
};

migrateSelectedMseItemsV152();
const cardCodeMigrationChangedV17=migrateMseCardCodesV17(state,true);
const initialCompletionSyncV15=syncAllMseCompletionRewardsV15();
if(!state.mseCompletionV152Migrated){state.mseCompletionV152Migrated=true;state.migrationLog=Array.isArray(state.migrationLog)?state.migrationLog:[];state.migrationLog.push({at:new Date().toISOString(),changes:['Echte Vollendungskarten der Set-Gegenstandskarten auf automatische Vergabe nach gedruckter Set-Schwelle umgestellt']});save()}else if(initialCompletionSyncV15.changed)save();
if(cardCodeMigrationChangedV17)save();
document.querySelector('.brand small').textContent='v1.7.21-r8';
Object.assign(window.Eberos,{completionProgressV15:mseCompletionProgressV15,syncCompletionRewardsV15:syncMseCompletionRewardsV15,validateMseCatalogV15,unlockMseCardV17,cardIsUnlockedV17:mseCardIsUnlockedV17,runTests:()=>runTests()});
renderAll();
}
