'use strict';

/* Items_Korrekturen_v15.mse-set: separater, quelltreuer Katalog für 496 Set-Einträge. */
{
const MSE_DB_V15=window.EBEROS_MSE_ITEM_DB_V15||{meta:{},categories:[],items:[],audit:{}},MSE_ITEMS_V15=Array.isArray(MSE_DB_V15.items)?MSE_DB_V15.items:[],MSE_CATEGORIES_V15=Array.isArray(MSE_DB_V15.categories)?MSE_DB_V15.categories:[];
const MSE_BY_ID_V15=new Map(MSE_ITEMS_V15.map(item=>[item.id,item])),MSE_CATEGORY_LABELS_V15=Object.fromEntries(MSE_CATEGORIES_V15.map(category=>[category.id,category.label]));
const MSE_PICKER_STATE_V15=window.__EBEROS_MSE_PICKER_STATE_V15||(window.__EBEROS_MSE_PICKER_STATE_V15={});
const MSE_ASSET_LABELS_V15={weapon:'Waffe',armor:'Rüstung & Kleidung',gear:'Artefakt & Ausrüstung',companion:'Begleiter & Kreatur',vehicle:'Fahrzeug & Transport',property:'Ort & großer Besitz',boon:'Segen, Titel & Zustand'};

function validateMseCatalogV15(){
  const errors=[],ids=new Set();
  if(MSE_ITEMS_V15.length!==496)errors.push(`496 Einträge erwartet, ${MSE_ITEMS_V15.length} gefunden`);
  for(const item of MSE_ITEMS_V15){
    if(!item?.id||ids.has(item.id))errors.push(`Doppelte oder leere ID: ${item?.id||'—'}`);
    ids.add(item?.id);
    if(!item.name||!item.sourceRecord?.cardNumber)errors.push(`${item?.id||'—'}: Name oder Kartennummer fehlt`);
    if(!Array.isArray(item.review?.issues))errors.push(`${item.id}: Prüfstatus fehlt`);
  }
  return{ok:errors.length===0,errors,ids:ids.size};
}
const MSE_VALIDATION_V15=validateMseCatalogV15();
if(!MSE_VALIDATION_V15.ok)showError('MSE-Itemkatalog fehlerhaft: '+MSE_VALIDATION_V15.errors.slice(0,8).join(' · '));

document.head.append(el('style',{text:`
.mse-picker-v15{margin:.75rem 0;border:2px solid var(--accent-2);border-radius:var(--radius);background:var(--panel-alt);overflow:hidden}.mse-picker-v15>summary{cursor:pointer;padding:.75rem;font-family:var(--font-section);font-weight:800}.mse-picker-body-v15{padding:.75rem;border-top:1px solid var(--border)}.mse-picker-filters-v15{display:grid;grid-template-columns:minmax(12rem,2fr) repeat(3,minmax(9rem,1fr));gap:.5rem}.mse-picker-meta-v15{display:flex;gap:.4rem;align-items:center;flex-wrap:wrap;margin:.55rem 0}.mse-chip-v15{display:inline-flex;align-items:center;min-height:25px;padding:.12rem .46rem;border:1px solid var(--border);border-radius:999px;background:var(--panel-bg);font-size:.8rem}.mse-chip-v15.warning{border-color:var(--danger);color:var(--danger)}.mse-results-v15{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:.55rem;max-height:34rem;overflow:auto;padding:.2rem}.mse-result-v15{display:grid;align-content:start;gap:.4rem;padding:.65rem;border:1px solid var(--border);border-radius:9px;background:var(--panel-bg);min-width:0}.mse-result-v15 h4{margin:0}.mse-result-v15 p{margin:0;white-space:pre-wrap;overflow-wrap:anywhere}.mse-result-v15 details>summary{cursor:pointer;color:var(--accent)}.mse-result-actions-v15{display:flex;gap:.4rem;align-items:center;justify-content:space-between;margin-top:auto}.mse-selected-source-v15{margin:.65rem 0 0;border-top:1px solid var(--border)}.mse-selected-source-v15>summary{cursor:pointer;padding:.55rem 0;font-weight:800}.mse-source-grid-v15{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.5rem}.mse-source-section-v15{padding:.55rem;border:1px solid var(--border);border-radius:8px;background:var(--panel-bg);white-space:pre-wrap;overflow-wrap:anywhere}.mse-source-section-v15.wide{grid-column:1/-1}.mse-source-section-v15 h5{margin:0 0 .25rem}.mse-confirm-v15{display:flex;gap:.45rem;align-items:center}.mse-confirm-v15 input{width:auto;min-height:0}.mse-catalog-notice-v15{border-left:5px solid var(--accent-2)}
@media(max-width:850px){.mse-picker-filters-v15{grid-template-columns:1fr 1fr}.mse-source-grid-v15{grid-template-columns:1fr}.mse-source-section-v15.wide{grid-column:auto}}
@media(max-width:520px){.mse-picker-filters-v15{grid-template-columns:1fr}.mse-results-v15{grid-template-columns:1fr;max-height:30rem}.mse-result-actions-v15{align-items:stretch;flex-direction:column}.mse-result-actions-v15 button{width:100%}}
@media print{.mse-picker-v15,.mse-confirm-v15{display:none!important}.mse-selected-source-v15{border:0}.mse-selected-source-v15>summary{display:none}.mse-selected-source-v15:not([open])>*:not(summary){display:block!important}}
`}));

function mseSearchTextV15(item){const source=item.sourceRecord||{};return normalizeNameV174([item.name,source.sourceName,item.description,item.notes,source.primaryStats?.join(' '),source.secondaryStats?.join(' '),source.effectText,source.cardNumber,source.rarity,MSE_ASSET_LABELS_V15[item.assetKind]].filter(Boolean).join(' '))}
function msePickerStateV15(owner){const key=owner?.id||'unknown';return MSE_PICKER_STATE_V15[key]||(MSE_PICKER_STATE_V15[key]={open:false,query:'',set:'',category:'',review:'',limit:60})}
function msePriceLabelV15(item){return item.sourceRecord?.canonicalPrice||item.sourceRecord?.priceText||'Preis offen'}
function mseWeightLabelV15(item){const correction=item.editorialCorrections?.find(entry=>entry.field==='weightKg');return correction?`${String(correction.value).replace('.',',')} kg (Quelle ${item.sourceRecord?.canonicalWeight||item.sourceRecord?.weightText}, korrigiert)`:item.sourceRecord?.canonicalWeight||item.sourceRecord?.weightText||'Gewicht offen'}
function mseCurrentIssuesV15(item){
  if(item.mseReviewConfirmed)return[];
  return(item.review?.issues||[]).filter(issue=>{
    if(issue.includes('Preis fehlt'))return!(+item.valueCopper>0);
    if(issue.includes('Unkörperlicher Eintrag'))return +item.weightKg!==0;
    if(issue.includes('Gewicht fehlt'))return item.weightKg===null||item.weightKg===undefined;
    return true;
  });
}
function mseSourceSectionV15(title,value,wide=false){return el('section',{class:'mse-source-section-v15'+(wide?' wide':'')},[el('h5',{text:title}),el('div',{text:String(value||'—')})])}

function addMseItemV15(owner,catalog){
  const physical=['weapon','armor','gear'].includes(catalog.assetKind),instance=normalizeItemV174({...structuredClone(catalog),id:undefined,instanceId:uid(),catalogId:catalog.id,quantity:1,qty:1,loadState:physical?'carried':'stored',equippedQuantity:0,active:true,storageLocation:physical?'':MSE_ASSET_LABELS_V15[catalog.assetKind]||''});
  owner.equipment=Array.isArray(owner.equipment)?owner.equipment:[];
  owner.equipment.push(instance);saveOwnerV173(owner,true);
}

function renderMseCatalogItemV15(owner,item){
  const source=item.sourceRecord||{},issues=mseCurrentIssuesV15(item),article=el('article',{class:'mse-result-v15'}),chips=el('div',{class:'mse-picker-meta-v15'}),details=el('details'),detailBody=el('div');
  chips.append(el('span',{class:'mse-chip-v15',text:`Set ${source.setNumber??'—'} · Nr. ${source.cardNumber||'—'}`}),el('span',{class:'mse-chip-v15',text:MSE_ASSET_LABELS_V15[item.assetKind]||item.assetKind}),el('span',{class:'mse-chip-v15',text:source.rarity||'ohne Seltenheit'}));
  if(issues.length)chips.append(el('span',{class:'mse-chip-v15 warning',text:'Wertprüfung offen'}));
  details.append(el('summary',{text:'Vollständige MSE-Angaben'}));
  detailBody.append(el('p',{text:[...(source.primaryStats||[]),...(source.secondaryStats||[])].join(' · ')||'Keine zusätzlichen Statistikzeilen.'}),el('p',{text:source.effectText||'Kein Regeltext.'}));
  if(source.notes)detailBody.append(el('p',{class:'muted',text:'Notiz: '+source.notes}));
  if(issues.length)detailBody.append(el('p',{class:'notice error',text:'Prüfen: '+issues.join(' · ')}));
  details.append(detailBody);
  article.append(el('h4',{text:item.name}),chips,el('p',{class:'muted',text:`${mseWeightLabelV15(item)} · ${msePriceLabelV15(item)}`}),details,el('div',{class:'mse-result-actions-v15'},[el('span',{class:'muted',text:source.modifiedAt?`Stand ${source.modifiedAt.slice(0,10)}`:'MSE v15'}),el('button',{class:'primary',type:'button',text:'Zum Reiter hinzufügen',onclick:()=>addMseItemV15(owner,item)})]));
  return article;
}

function renderMseCatalogPickerV15(owner){
  const ui=msePickerStateV15(owner),details=el('details',{class:'mse-picker-v15',open:ui.open}),summary=el('summary',{text:`Korrigierte MSE-Items v15 (${MSE_ITEMS_V15.length})`}),body=el('div',{class:'mse-picker-body-v15'}),filters=el('div',{class:'mse-picker-filters-v15'}),search=el('input',{type:'search',placeholder:'Name, Wirkung oder Kartennummer …',value:ui.query,'aria-label':'MSE-Items durchsuchen'}),setSelect=el('select',{'aria-label':'MSE-Set filtern'}),category=el('select',{'aria-label':'MSE-Itemart filtern'}),review=el('select',{'aria-label':'MSE-Prüfstatus filtern'}),meta=el('div',{class:'mse-picker-meta-v15'}),results=el('div',{class:'mse-results-v15'}),more=el('button',{type:'button',text:'Weitere Ergebnisse anzeigen'});
  setSelect.append(el('option',{value:'',text:'Alle 38 Sets'}));for(const number of[...new Set(MSE_ITEMS_V15.map(item=>item.sourceRecord?.setNumber).filter(Boolean))].sort((a,b)=>a-b))setSelect.append(el('option',{value:String(number),text:`Set ${number}`}));setSelect.value=ui.set;
  category.append(el('option',{value:'',text:'Alle Arten'}));for(const definition of MSE_CATEGORIES_V15)category.append(el('option',{value:definition.id,text:definition.label.replace('MSE-Set · ','')}));category.value=ui.category;
  [['','Alle Prüfstände'],['ok','Formal vollständig'],['needs-review','Gewicht/Preis prüfen']].forEach(([value,text])=>review.append(el('option',{value,text})));review.value=ui.review;
  const update=()=>{
    ui.query=search.value;ui.set=setSelect.value;ui.category=category.value;ui.review=review.value;
    const query=normalizeNameV174(ui.query),matches=MSE_ITEMS_V15.filter(item=>(!query||mseSearchTextV15(item).includes(query))&&(!ui.set||String(item.sourceRecord?.setNumber)===ui.set)&&(!ui.category||item.category===ui.category)&&(!ui.review||(ui.review==='needs-review')===!!item.review?.issues?.length));
    results.replaceChildren(...matches.slice(0,ui.limit).map(item=>renderMseCatalogItemV15(owner,item)));
    if(!matches.length)results.append(el('p',{class:'muted',text:'Keine passenden MSE-Items.'}));
    meta.replaceChildren(el('span',{class:'mse-chip-v15',text:`${matches.length} von ${MSE_ITEMS_V15.length} Einträgen`}),el('span',{class:'mse-chip-v15'+(MSE_DB_V15.audit?.needsReview?' warning':''),text:`${MSE_DB_V15.audit?.needsReview||0} Quellwerte mit Prüfanlass`}));
    more.hidden=matches.length<=ui.limit;more.textContent=`Weitere Ergebnisse anzeigen (${Math.min(60,matches.length-ui.limit)})`;
  };
  details.ontoggle=()=>{ui.open=details.open};search.oninput=()=>{ui.limit=60;update()};setSelect.onchange=category.onchange=review.onchange=()=>{ui.limit=60;update()};more.onclick=()=>{ui.limit+=60;update()};
  filters.append(search,setSelect,category,review);body.append(el('p',{class:'notice mse-catalog-notice-v15',text:'Neuester redaktioneller Stand aus Items_Korrekturen_v15.mse-set. Regeltexte werden quelltreu übernommen; offene Preis- und Gewichtsprüfungen bleiben sichtbar.'}),filters,meta,results,more);details.append(summary,body);update();return details;
}

function renderMseSelectedSourceV15(owner,item){
  const source=item.sourceRecord||{},issues=mseCurrentIssuesV15(item),details=el('details',{class:'mse-selected-source-v15'}),grid=el('div',{class:'mse-source-grid-v15'}),confirm=el('label',{class:'mse-confirm-v15'},[el('input',{type:'checkbox',checked:!!item.mseReviewConfirmed}),el('span',{text:'Gewicht und Preis dieses Exemplars fachlich geprüft'})]);
  details.append(el('summary',{text:`MSE-Quelle v15 · Set ${source.setNumber??'—'} · Nr. ${source.cardNumber||'—'}`}));
  grid.append(mseSourceSectionV15('Quellwerte',[...(source.primaryStats||[]),...(source.secondaryStats||[])].join(' · ')),mseSourceSectionV15('Preis & Gewicht',`${source.canonicalPrice||source.priceText||'Preis offen'} · ${source.canonicalWeight||source.weightText||'Gewicht offen'}`),mseSourceSectionV15('Regeltext',source.effectText,true));
  if(item.editorialCorrections?.length)grid.append(mseSourceSectionV15('Nachvollziehbare Korrektur',item.editorialCorrections.map(entry=>`${entry.field}: ${entry.sourceValue} → ${entry.value}. ${entry.reason}`).join('\n'),true));
  if(source.notes)grid.append(mseSourceSectionV15('Redaktionsnotiz',source.notes,true));
  if(issues.length)grid.append(el('div',{class:'notice error mse-source-section-v15 wide',text:'Noch prüfen: '+issues.join(' · ')}));
  confirm.querySelector('input').onchange=event=>{item.mseReviewConfirmed=event.target.checked;saveLoadV174(owner,true)};
  details.append(grid,confirm);return details;
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
  const box=renderEquipmentBeforeMseV15(owner),firstCatalog=box.querySelector('.catalog-picker,.catalog-disclosure-r9');
  const picker=renderMseCatalogPickerV15(owner);if(firstCatalog)firstCatalog.before(picker);else box.prepend(picker);
  [...box.querySelectorAll('.equipment-entry')].forEach((wrap,index)=>{const item=owner.equipment?.[index];if(item?.sourceVersion==='mse-v15')wrap.append(renderMseSelectedSourceV15(owner,item))});
  return box;
};

const auditBeforeMseV15=audit;
audit=function(){
  auditBeforeMseV15();const owners=[ch(),...(ch().auxiliaryTabs||[])],flagged=[];
  for(const owner of owners)for(const item of owner.equipment||[]){if(item.sourceVersion!=='mse-v15')continue;const issues=mseCurrentIssuesV15(item);if(issues.length)flagged.push(`${owner.name||owner.type||'Charakter'}: ${item.name} (${issues.join(', ')})`)}
  auditResults.append(el('h3',{text:'MSE-Items v15'}),el('div',{class:'notice '+(flagged.length?'':'ok'),text:flagged.length?`⚠ ${flagged.length} ausgewählte MSE-Items benötigen noch eine Preis-/Gewichtsprüfung: ${flagged.join(' · ')}`:'✓ Ausgewählte MSE-Items haben keine offenen formalen Preis-/Gewichtsprüfungen.'}));
};

const runTestsBeforeMseV15=runTests;
runTests=function(){
  const baseOk=runTestsBeforeMseV15(),tests=[],eq=(name,expected,actual)=>tests.push([name,expected,actual,expected===actual]),owner=newCharacter(),sample=MSE_ITEMS_V15.find(item=>item.sourceRecord?.cardNumber==='0200'),problem=MSE_ITEMS_V15.find(item=>item.review?.issues?.length);
  eq('MSE-v15-Katalog vollständig',496,MSE_ITEMS_V15.length);eq('MSE-v15-IDs eindeutig',496,new Set(MSE_ITEMS_V15.map(item=>item.id)).size);eq('Alle 38 Sets vorhanden',38,new Set(MSE_ITEMS_V15.map(item=>item.sourceRecord?.setNumber)).size);eq('Sonnenstab vorhanden','Sonnenstab',sample?.name);eq('Sonnenstab-Preis normalisiert',26600,sample?.valueCopper);eq('Sonnenstab-Gewicht normalisiert',1.8,sample?.weightKg);addMseItemV15(owner,sample);eq('MSE-Item als unabhängige Instanz ergänzt',true,owner.equipment[0]?.catalogId===sample.id&&owner.equipment[0]?.instanceId!==sample.id);eq('MSE-Quellrecord bleibt im Charakterbackup',sample.sourceHash,JSON.parse(JSON.stringify(owner)).equipment[0].sourceHash);eq('Offener Quellwert wird angezeigt',true,mseCurrentIssuesV15(problem).length>0);problem.mseReviewConfirmed=true;eq('Fachprüfung kann Hinweis schließen',0,mseCurrentIssuesV15(problem).length);problem.mseReviewConfirmed=false;eq('MSE-Picker ist bedienbar',true,!!renderMseCatalogPickerV15(owner).querySelector('input[type="search"]'));const body=testResults.querySelector('tbody');for(const[name,expected,actual,ok]of tests)body?.append(el('tr',{},[name,expected,actual,ok?'Bestanden':'Fehler'].map(value=>el('td',{text:String(value)}))));return baseOk&&tests.every(test=>test[3]);
};

document.querySelector('.brand small').textContent='v1.7.21-r3';
Object.assign(window.Eberos,{mseItemsV15:()=>MSE_ITEMS_V15,mseItemByIdV15:id=>MSE_BY_ID_V15.get(id)||null,validateMseCatalogV15,renderMseCatalogPickerV15,runTests:()=>runTests()});
renderAll();
}
