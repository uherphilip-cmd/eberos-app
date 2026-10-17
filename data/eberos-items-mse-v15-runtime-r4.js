'use strict';

/* Items_Korrekturen_v15.mse-set: balancierter Katalog mit Kartenansicht. */
{
const MSE_DB_V15=window.EBEROS_MSE_ITEM_DB_V15||{meta:{},categories:[],items:[],audit:{}};
const MSE_ITEMS_V15=Array.isArray(MSE_DB_V15.items)?MSE_DB_V15.items:[];
const MSE_CATEGORIES_V15=Array.isArray(MSE_DB_V15.categories)?MSE_DB_V15.categories:[];
const MSE_BY_ID_V15=new Map(MSE_ITEMS_V15.map(item=>[item.id,item]));
const MSE_CATEGORY_LABELS_V15=Object.fromEntries(MSE_CATEGORIES_V15.map(category=>[category.id,category.label]));
const MSE_PICKER_STATE_V15=window.__EBEROS_MSE_PICKER_STATE_V15||(window.__EBEROS_MSE_PICKER_STATE_V15={});
const MSE_ASSET_LABELS_V15={weapon:'Waffe',armor:'Rüstung & Kleidung',gear:'Artefakt & Ausrüstung',companion:'Begleiter & Kreatur',vehicle:'Fahrzeug & Transport',property:'Ort & großer Besitz',boon:'Segen, Titel & Zustand'};

function validateMseCatalogV15(){
  const errors=[],ids=new Set();
  if(MSE_ITEMS_V15.length!==496)errors.push(`496 Einträge erwartet, ${MSE_ITEMS_V15.length} gefunden`);
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
if(!MSE_VALIDATION_V15.ok)showError('MSE-Itemkatalog fehlerhaft: '+MSE_VALIDATION_V15.errors.slice(0,8).join(' · '));

document.head.append(el('style',{text:`
.mse-picker-v15{margin:.75rem 0;border:2px solid var(--accent-2);border-radius:var(--radius);background:var(--panel-alt);overflow:hidden}.mse-picker-v15>summary{cursor:pointer;padding:.75rem;font-family:var(--font-section);font-weight:800}.mse-picker-body-v15{padding:.75rem;border-top:1px solid var(--border)}.mse-picker-filters-v15{display:grid;grid-template-columns:minmax(12rem,2fr) repeat(3,minmax(9rem,1fr));gap:.5rem}.mse-picker-meta-v15{display:flex;gap:.4rem;align-items:center;flex-wrap:wrap;margin:.55rem 0}.mse-chip-v15{display:inline-flex;align-items:center;min-height:25px;padding:.12rem .46rem;border:1px solid var(--border);border-radius:999px;background:var(--panel-bg);font-size:.8rem}.mse-chip-v15.adjusted{border-color:var(--accent-2);color:var(--accent)}.mse-chip-v15.not-sale{border-color:var(--muted);color:var(--muted)}.mse-results-v15{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:.65rem;max-height:38rem;overflow:auto;padding:.2rem}.mse-result-v15{display:grid;align-content:start;gap:.45rem;padding:.65rem;border:1px solid var(--border);border-radius:9px;background:var(--panel-bg);min-width:0}.mse-result-v15 h4{margin:0}.mse-result-v15 p{margin:0;white-space:pre-wrap;overflow-wrap:anywhere}.mse-result-v15 details>summary{cursor:pointer;color:var(--accent)}.mse-result-heading-v15{display:grid;grid-template-columns:74px minmax(0,1fr);gap:.65rem;align-items:start}.mse-thumb-button-v15{display:block;width:74px;aspect-ratio:5/7;padding:0;border:1px solid var(--border);border-radius:7px;overflow:hidden;background:#090b0c}.mse-thumb-button-v15 img{display:block;width:100%;height:100%;object-fit:contain}.mse-result-actions-v15{display:flex;gap:.4rem;align-items:center;justify-content:flex-end;flex-wrap:wrap;margin-top:auto}.mse-selected-source-v15{margin:.65rem 0 0;border-top:1px solid var(--border)}.mse-selected-source-v15>summary{cursor:pointer;padding:.55rem 0;font-weight:800}.mse-source-grid-v15{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.5rem}.mse-source-section-v15{padding:.55rem;border:1px solid var(--border);border-radius:8px;background:var(--panel-bg);white-space:pre-wrap;overflow-wrap:anywhere}.mse-source-section-v15.wide{grid-column:1/-1}.mse-source-section-v15 h5{margin:0 0 .25rem}.mse-catalog-notice-v15{border-left:5px solid var(--accent-2)}
.mse-card-dialog-v15{width:min(94vw,920px);max-height:94vh;padding:0;border:1px solid var(--border);border-radius:16px;background:var(--panel-bg);color:var(--text);overflow:auto}.mse-card-dialog-v15::backdrop{background:rgba(0,0,0,.76);backdrop-filter:blur(3px)}.mse-card-shell-v15{display:grid;grid-template-columns:minmax(280px,430px) minmax(230px,1fr);gap:1rem;padding:1rem}.mse-card-v15{align-self:start;aspect-ratio:5/7;display:grid;grid-template-rows:auto minmax(0,42%) 1fr auto;border:10px solid #2b2218;border-radius:20px;overflow:hidden;background:linear-gradient(145deg,#f2e4bd,#d4bd88);color:#21170e;box-shadow:0 18px 45px rgba(0,0,0,.45)}.mse-card-header-v15{display:flex;justify-content:space-between;gap:.5rem;align-items:center;padding:.55rem .7rem;background:rgba(255,255,255,.32);border-bottom:2px solid rgba(54,35,18,.4)}.mse-card-header-v15 strong{font-family:var(--font-section);font-size:clamp(1rem,3vw,1.25rem);line-height:1.05}.mse-card-art-v15{width:100%;height:100%;object-fit:contain;background:#080a0b}.mse-card-body-v15{display:grid;align-content:start;gap:.45rem;padding:.6rem .7rem;overflow:auto}.mse-card-type-v15{font-weight:800;border-bottom:1px solid rgba(54,35,18,.35);padding-bottom:.25rem}.mse-card-stats-v15{font-size:.83rem;font-weight:700}.mse-card-rules-v15{white-space:pre-wrap;font-size:.88rem;line-height:1.25}.mse-card-flavor-v15{font-style:italic;font-size:.8rem}.mse-card-footer-v15{display:flex;justify-content:space-between;gap:.5rem;padding:.35rem .7rem;background:rgba(255,255,255,.28);border-top:1px solid rgba(54,35,18,.35);font-size:.72rem;font-weight:700}.mse-card-side-v15{display:grid;align-content:start;gap:.65rem}.mse-card-side-v15 h3,.mse-card-side-v15 p{margin:0}.mse-card-side-v15 .mse-card-close-v15{justify-self:end}.mse-card-values-v15{display:grid;grid-template-columns:1fr 1fr;gap:.5rem}.mse-card-actions-v15{display:flex;gap:.45rem;justify-content:flex-end;flex-wrap:wrap}
@media(max-width:850px){.mse-picker-filters-v15{grid-template-columns:1fr 1fr}.mse-source-grid-v15{grid-template-columns:1fr}.mse-source-section-v15.wide{grid-column:auto}.mse-card-shell-v15{grid-template-columns:1fr}.mse-card-v15{width:min(100%,430px);justify-self:center}.mse-card-side-v15{width:min(100%,430px);justify-self:center}.mse-card-side-v15 .mse-card-close-v15{position:absolute;top:.45rem;right:.45rem}}
@media(max-width:520px){.mse-picker-filters-v15{grid-template-columns:1fr}.mse-results-v15{grid-template-columns:1fr;max-height:32rem}.mse-result-actions-v15{align-items:stretch;flex-direction:column}.mse-result-actions-v15 button{width:100%}.mse-card-dialog-v15{width:100vw;max-width:none;max-height:100vh;border-radius:0}.mse-card-shell-v15{padding:.6rem}.mse-card-values-v15{grid-template-columns:1fr}}
@media print{.mse-picker-v15,.mse-card-dialog-v15{display:none!important}.mse-selected-source-v15{border:0}.mse-selected-source-v15>summary{display:none}.mse-selected-source-v15:not([open])>*:not(summary){display:block!important}}
`}));

function mseSearchTextV15(item){const source=item.sourceRecord||{};return normalizeNameV174([item.name,source.sourceName,item.description,item.notes,source.primaryStats?.join(' '),source.secondaryStats?.join(' '),source.effectText,source.cardNumber,source.rarity,MSE_ASSET_LABELS_V15[item.assetKind],item.valueText,item.balance?.reason].filter(Boolean).join(' '))}
function msePickerStateV15(owner){const key=owner?.id||'unknown';return MSE_PICKER_STATE_V15[key]||(MSE_PICKER_STATE_V15[key]={open:false,query:'',set:'',category:'',review:'',limit:60})}
function msePriceLabelV15(item){return item.valueText||item.sourceRecord?.canonicalPrice||item.sourceRecord?.priceText||'Preis offen'}
function mseWeightValueV15(value){if(!Number.isFinite(+value))return'Gewicht offen';const kg=+value;return kg>=1000?`${String(+(kg/1000).toFixed(3)).replace('.',',')} t`:`${String(+kg.toFixed(3)).replace('.',',')} kg`}
function mseWeightLabelV15(item){const correction=item.editorialCorrections?.find(entry=>entry.field==='weightKg'),current=mseWeightValueV15(item.weightKg);return correction?`${current} (Quelle ${item.sourceRecord?.canonicalWeight||item.sourceRecord?.weightText||'—'}, korrigiert)`:current}
function mseCurrentIssuesV15(item){return item.review?.issues||[]}
function mseArtUrlV15(item){return`${MSE_DB_V15.meta?.cardArtPath||'./data/mse-v15-art'}/${encodeURIComponent(item.artFile||`${item.sourceRecord?.cardNumber}.jpg`)}`}
function mseSourceSectionV15(title,value,wide=false){return el('section',{class:'mse-source-section-v15'+(wide?' wide':'')},[el('h5',{text:title}),el('div',{text:String(value||'—')})])}
function mseCorrectionTextV15(item){return(item.editorialCorrections||[]).map(entry=>`${entry.field}: ${entry.sourceValue??'—'} → ${entry.value}. ${entry.reason}`).join('\n')}

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
  if(!MSE_CARD_DIALOG_V15){MSE_CARD_DIALOG_V15=el('dialog',{class:'mse-card-dialog-v15'});document.body.append(MSE_CARD_DIALOG_V15);MSE_CARD_DIALOG_V15.addEventListener('click',event=>{if(event.target===MSE_CARD_DIALOG_V15)MSE_CARD_DIALOG_V15.close()})}
  const source=item.sourceRecord||{},side=el('aside',{class:'mse-card-side-v15'}),actions=el('div',{class:'mse-card-actions-v15'}),close=el('button',{type:'button',class:'mse-card-close-v15',text:'Schließen',onclick:()=>MSE_CARD_DIALOG_V15.close()});
  side.append(close,el('h3',{text:'Kartendetails'}),el('p',{class:'muted',text:`MSE-Set ${source.setNumber??'—'} · Nr. ${source.cardNumber||'—'} · Stand ${source.modifiedAt?.slice(0,10)||'—'}`}),el('div',{class:'mse-card-values-v15'},[mseSourceSectionV15('Preis',msePriceLabelV15(item)),mseSourceSectionV15('Gewicht',mseWeightLabelV15(item))]),mseSourceSectionV15('Balanceentscheidung',item.balance?.reason||'Quellwert bestätigt.',true));
  if(item.editorialCorrections?.length)side.append(mseSourceSectionV15('Original → neu',mseCorrectionTextV15(item),true));
  if(source.notes)side.append(mseSourceSectionV15('Redaktionsnotiz',source.notes,true));
  if(owner)actions.append(el('button',{class:'primary',type:'button',text:'Zum Reiter hinzufügen',onclick:()=>{addMseItemV15(owner,item);MSE_CARD_DIALOG_V15.close()}}));
  side.append(actions);
  MSE_CARD_DIALOG_V15.replaceChildren(el('div',{class:'mse-card-shell-v15'},[createMseCardV15(item),side]));
  MSE_CARD_DIALOG_V15.showModal();
}

function addMseItemV15(owner,catalog){
  const physical=['weapon','armor','gear'].includes(catalog.assetKind),instance=normalizeItemV174({...structuredClone(catalog),id:undefined,instanceId:uid(),catalogId:catalog.id,quantity:1,qty:1,loadState:physical?'carried':'stored',equippedQuantity:0,active:true,storageLocation:physical?'':MSE_ASSET_LABELS_V15[catalog.assetKind]||''});
  owner.equipment=Array.isArray(owner.equipment)?owner.equipment:[];
  owner.equipment.push(instance);saveOwnerV173(owner,true);
}

function renderMseCatalogItemV15(owner,item){
  const source=item.sourceRecord||{},article=el('article',{class:'mse-result-v15'}),chips=el('div',{class:'mse-picker-meta-v15'}),details=el('details'),detailBody=el('div'),thumb=el('button',{type:'button',class:'mse-thumb-button-v15','aria-label':`Karte ${item.name} anzeigen`,onclick:()=>showMseCardV15(item,owner)},[el('img',{src:mseArtUrlV15(item),alt:'',loading:'lazy',decoding:'async'})]),heading=el('div',{class:'mse-result-heading-v15'});
  chips.append(el('span',{class:'mse-chip-v15',text:`Set ${source.setNumber??'—'} · Nr. ${source.cardNumber||'—'}`}),el('span',{class:'mse-chip-v15',text:MSE_ASSET_LABELS_V15[item.assetKind]||item.assetKind}),el('span',{class:'mse-chip-v15',text:source.rarity||'ohne Seltenheit'}));
  if(item.editorialCorrections?.length)chips.append(el('span',{class:'mse-chip-v15 adjusted',text:'Neu bewertet'}));
  if(item.tradeStatus==='not-for-sale')chips.append(el('span',{class:'mse-chip-v15 not-sale',text:'Nicht käuflich'}));
  heading.append(thumb,el('div',{},[el('h4',{text:item.name}),chips,el('p',{class:'muted',text:`${mseWeightLabelV15(item)} · ${msePriceLabelV15(item)}`})]));
  details.append(el('summary',{text:'Vollständige MSE-Angaben'}));
  detailBody.append(el('p',{text:[...(source.primaryStats||[]),...(source.secondaryStats||[])].join(' · ')||'Keine zusätzlichen Statistikzeilen.'}),el('p',{text:source.effectText||'Kein Regeltext.'}));
  if(source.notes)detailBody.append(el('p',{class:'muted',text:'Notiz: '+source.notes}));
  details.append(detailBody);
  article.append(heading,details,el('div',{class:'mse-result-actions-v15'},[el('button',{type:'button',text:'Karte anzeigen',onclick:()=>showMseCardV15(item,owner)}),el('button',{class:'primary',type:'button',text:'Zum Reiter hinzufügen',onclick:()=>addMseItemV15(owner,item)})]));
  return article;
}

function renderMseCatalogPickerV15(owner){
  const ui=msePickerStateV15(owner),details=el('details',{class:'mse-picker-v15',open:ui.open}),summary=el('summary',{text:`MSE-Items v15 · balanciert (${MSE_ITEMS_V15.length})`}),body=el('div',{class:'mse-picker-body-v15'}),filters=el('div',{class:'mse-picker-filters-v15'}),search=el('input',{type:'search',placeholder:'Name, Wirkung oder Kartennummer …',value:ui.query,'aria-label':'MSE-Items durchsuchen'}),setSelect=el('select',{'aria-label':'MSE-Set filtern'}),category=el('select',{'aria-label':'MSE-Itemart filtern'}),review=el('select',{'aria-label':'MSE-Balancestand filtern'}),meta=el('div',{class:'mse-picker-meta-v15'}),results=el('div',{class:'mse-results-v15'}),more=el('button',{type:'button',text:'Weitere Ergebnisse anzeigen'});
  setSelect.append(el('option',{value:'',text:'Alle 38 Sets'}));for(const number of[...new Set(MSE_ITEMS_V15.map(item=>item.sourceRecord?.setNumber).filter(Boolean))].sort((a,b)=>a-b))setSelect.append(el('option',{value:String(number),text:`Set ${number}`}));setSelect.value=ui.set;
  category.append(el('option',{value:'',text:'Alle Arten'}));for(const definition of MSE_CATEGORIES_V15)category.append(el('option',{value:definition.id,text:definition.label.replace('MSE-Set · ','')}));category.value=ui.category;
  [['','Alle Balancestände'],['source','Quellwerte bestätigt'],['adjusted','Neu bewertet'],['not-for-sale','Nicht käuflich']].forEach(([value,text])=>review.append(el('option',{value,text})));review.value=ui.review;
  const update=()=>{
    ui.query=search.value;ui.set=setSelect.value;ui.category=category.value;ui.review=review.value;
    const query=normalizeNameV174(ui.query),balanceMatch=item=>!ui.review||(ui.review==='source'&&!item.editorialCorrections?.length)||(ui.review==='adjusted'&&!!item.editorialCorrections?.length)||(ui.review==='not-for-sale'&&item.tradeStatus==='not-for-sale'),matches=MSE_ITEMS_V15.filter(item=>(!query||mseSearchTextV15(item).includes(query))&&(!ui.set||String(item.sourceRecord?.setNumber)===ui.set)&&(!ui.category||item.category===ui.category)&&balanceMatch(item));
    results.replaceChildren(...matches.slice(0,ui.limit).map(item=>renderMseCatalogItemV15(owner,item)));
    if(!matches.length)results.append(el('p',{class:'muted',text:'Keine passenden MSE-Items.'}));
    meta.replaceChildren(el('span',{class:'mse-chip-v15',text:`${matches.length} von ${MSE_ITEMS_V15.length} Einträgen`}),el('span',{class:'mse-chip-v15 adjusted',text:`${MSE_DB_V15.audit?.editorialCorrections||0} neu bewertete Karten`}),el('span',{class:'mse-chip-v15',text:'0 offene Preis-/Gewichtsfragen'}));
    more.hidden=matches.length<=ui.limit;more.textContent=`Weitere Ergebnisse anzeigen (${Math.min(60,matches.length-ui.limit)})`;
  };
  details.ontoggle=()=>{ui.open=details.open};search.oninput=()=>{ui.limit=60;update()};setSelect.onchange=category.onchange=review.onchange=()=>{ui.limit=60;update()};more.onclick=()=>{ui.limit+=60;update()};
  filters.append(search,setSelect,category,review);body.append(el('p',{class:'notice mse-catalog-notice-v15',text:'Alle 496 Einträge wurden nach Setvergleich und Gegenstandslogik geprüft. Originalwerte bleiben in den Kartendetails sichtbar; Illustrationen öffnen als vollständige Kartenansicht.'}),filters,meta,results,more);details.append(summary,body);update();return details;
}

function renderMseSelectedSourceV15(owner,item){
  const source=item.sourceRecord||{},details=el('details',{class:'mse-selected-source-v15'}),grid=el('div',{class:'mse-source-grid-v15'});
  details.append(el('summary',{text:`MSE-Karte v15 · Set ${source.setNumber??'—'} · Nr. ${source.cardNumber||'—'}`}));
  grid.append(mseSourceSectionV15('Aktuelle Werte',`${msePriceLabelV15(item)} · ${mseWeightValueV15(item.weightKg)}`),mseSourceSectionV15('Originalquelle',`${source.canonicalPrice||source.priceText||'kein Preis'} · ${source.canonicalWeight||source.weightText||'kein Gewicht'}`),mseSourceSectionV15('Quellwerte',[...(source.primaryStats||[]),...(source.secondaryStats||[])].join(' · ')),mseSourceSectionV15('Regeltext',source.effectText,true));
  if(item.editorialCorrections?.length)grid.append(mseSourceSectionV15('Balanceentscheidung',mseCorrectionTextV15(item),true));
  if(source.notes)grid.append(mseSourceSectionV15('Redaktionsnotiz',source.notes,true));
  details.append(grid,el('div',{class:'mse-result-actions-v15'},[el('button',{type:'button',text:'Karte anzeigen',onclick:()=>showMseCardV15(item,owner)})]));return details;
}

function migrateSelectedMseItemsV151(){
  if(state.mseItemBalanceV151Migrated)return false;
  let changed=false;
  for(const character of state.characters||[]){
    for(const owner of[character,...(character.auxiliaryTabs||[])])for(const item of owner.equipment||[]){
      if(item.sourceVersion!=='mse-v15')continue;
      const catalog=MSE_BY_ID_V15.get(item.catalogId);
      if(!catalog||item.sourceHash!==catalog.sourceHash)continue;
      for(const key of['valueCopper','valueText','tradeStatus','weightKg','weightUnknown','weightSource','assetKind','category','itemType','artFile','balance','editorialCorrections'])item[key]=structuredClone(catalog[key]);
      changed=true;
    }
  }
  state.mseItemBalanceV151Migrated=true;
  state.migrationLog=Array.isArray(state.migrationLog)?state.migrationLog:[];
  state.migrationLog.push({at:new Date().toISOString(),changes:['MSE-Items v15 auf geprüfte Preise, Gewichte und Kartenansichten aktualisiert']});
  save();return changed;
}

const categoryLabelBeforeMseV15=categoryLabelCompactV174;
categoryLabelCompactV174=function(item){return MSE_CATEGORY_LABELS_V15[item.category]||categoryLabelBeforeMseV15(item)};
const categorySelectBeforeMseV15=compactCategorySelectV174;
compactCategorySelectV174=function(owner,item){
  const field=categorySelectBeforeMseV15(owner,item),select=field.querySelector('select');
  for(const definition of MSE_CATEGORIES_V15)if(![...select.options].some(option=>option.value===definition.id))select.append(el('option',{value:definition.id,text:definition.label}));
  const current=[...select.options].find(option=>option.value===item.category);if(current&&MSE_CATEGORY_LABELS_V15[item.category])current.textContent=MSE_CATEGORY_LABELS_V15[item.category];select.value=item.category||'';return field;
};

const renderEquipmentBeforeMseV15=renderEquipmentV174;
renderEquipmentV174=function(owner){
  const box=renderEquipmentBeforeMseV15(owner),firstCatalog=box.querySelector('.catalog-picker,.catalog-disclosure-r9'),picker=renderMseCatalogPickerV15(owner);if(firstCatalog)firstCatalog.before(picker);else box.prepend(picker);
  [...box.querySelectorAll('.equipment-entry')].forEach((wrap,index)=>{const item=owner.equipment?.[index];if(item?.sourceVersion==='mse-v15')wrap.append(renderMseSelectedSourceV15(owner,item))});
  return box;
};

const auditBeforeMseV15=audit;
audit=function(){
  auditBeforeMseV15();const owners=[ch(),...(ch().auxiliaryTabs||[])],flagged=[];
  for(const owner of owners)for(const item of owner.equipment||[]){if(item.sourceVersion!=='mse-v15')continue;const issues=mseCurrentIssuesV15(item);if(issues.length)flagged.push(`${owner.name||owner.type||'Charakter'}: ${item.name} (${issues.join(', ')})`)}
  auditResults.append(el('h3',{text:'MSE-Items v15.1'}),el('div',{class:'notice '+(flagged.length?'error':'ok'),text:flagged.length?`⚠ ${flagged.length} ausgewählte MSE-Items benötigen noch eine Prüfung: ${flagged.join(' · ')}`:'✓ Preise und Gewichte der ausgewählten MSE-Items sind nach Balance v15.1 vollständig.'}));
};

const runTestsBeforeMseV15=runTests;
runTests=function(){
  const baseOk=runTestsBeforeMseV15(),tests=[],eq=(name,expected,actual)=>tests.push([name,expected,actual,expected===actual]),owner=newCharacter(),sample=MSE_ITEMS_V15.find(item=>item.sourceRecord?.cardNumber==='0200'),fiole=MSE_ITEMS_V15.find(item=>item.sourceRecord?.cardNumber==='0224'),ship=MSE_ITEMS_V15.find(item=>item.sourceRecord?.cardNumber==='0311'),dream=MSE_ITEMS_V15.find(item=>item.sourceRecord?.cardNumber==='0029');
  eq('MSE-v15-Katalog vollständig',496,MSE_ITEMS_V15.length);eq('MSE-v15-IDs eindeutig',496,new Set(MSE_ITEMS_V15.map(item=>item.id)).size);eq('Alle 38 Sets vorhanden',38,new Set(MSE_ITEMS_V15.map(item=>item.sourceRecord?.setNumber)).size);eq('Alle Preise entschieden',0,MSE_ITEMS_V15.filter(item=>item.valueCopper===null).length);eq('Keine offene Balanceprüfung',0,MSE_ITEMS_V15.filter(item=>item.review?.issues?.length).length);eq('Ravellas Fiole wiegt 0,7 kg',0.7,fiole?.weightKg);eq('30-Personen-Segler wiegt 80 t',80000,ship?.weightKg);eq('Nicht handelbarer Traum markiert','Nicht käuflich',dream?.valueText);eq('Sonnenstab-Preis bleibt 266 Silber',26600,sample?.valueCopper);eq('Sonnenstab-Gewicht bleibt 1,8 kg',1.8,sample?.weightKg);addMseItemV15(owner,sample);eq('MSE-Item als unabhängige Instanz ergänzt',true,owner.equipment[0]?.catalogId===sample.id&&owner.equipment[0]?.instanceId!==sample.id);eq('MSE-Quellrecord bleibt im Charakterbackup',sample.sourceHash,JSON.parse(JSON.stringify(owner)).equipment[0].sourceHash);eq('Kartenansicht enthält Illustration',true,!!createMseCardV15(sample).querySelector('img[src*="0200.jpg"]'));eq('MSE-Picker ist bedienbar',true,!!renderMseCatalogPickerV15(owner).querySelector('input[type="search"]'));const body=testResults.querySelector('tbody');for(const[name,expected,actual,ok]of tests)body?.append(el('tr',{},[name,expected,actual,ok?'Bestanden':'Fehler'].map(value=>el('td',{text:String(value)}))));return baseOk&&tests.every(test=>test[3]);
};

migrateSelectedMseItemsV151();
document.querySelector('.brand small').textContent='v1.7.21-r4';
Object.assign(window.Eberos,{mseItemsV15:()=>MSE_ITEMS_V15,mseItemByIdV15:id=>MSE_BY_ID_V15.get(id)||null,validateMseCatalogV15,renderMseCatalogPickerV15,createMseCardV15,showMseCardV15,runTests:()=>runTests()});
renderAll();
}
