'use strict';

/* Eberos v1.8.24: ausklappbare Standard- und Set-Gegenstandskarten. */
(()=>{
  const registry=window.EBEROS_STANDARD_ITEM_CARDS;
  if(!registry||registry.format!=='eberos-standard-item-card-registry'||registry.formatVersion!==1)throw new Error('Geprüfte Standard-Gegenstandskarten-Registry fehlt.');
  const standardCards=new Map(registry.cards.map(entry=>[entry.id,entry]));
  const standardCatalogIds=new Set((typeof ITEM_CATALOG_V174!=='undefined'?ITEM_CATALOG_V174:[]).map(item=>item.id));
  const openCards=new Set();
  let panelSequence=0;

  const safeKey=value=>String(value||'').replace(/[^A-Za-z0-9._-]+/g,'-').slice(0,96)||'unbekannt';
  const itemStateKey=(owner,item,index)=>`${safeKey(owner?.id||'owner')}:${safeKey(item?.instanceId||item?.id||`index-${index}`)}`;
  const isMseItem=item=>item?.sourceVersion==='mse-v15';
  const standardCardFor=item=>{
    if(!item?.catalogId||isMseItem(item))return null;
    if(item.catalogSource&&item.catalogSource!=='standard')return null;
    if(!standardCatalogIds.has(item.catalogId))return null;
    return standardCards.get(item.catalogId)||null;
  };
  const mseCatalogFor=item=>{
    if(!isMseItem(item)||!item.catalogId||typeof window.Eberos?.getMseItemV1824!=='function')return null;
    return window.Eberos.getMseItemV1824(item.catalogId)||null;
  };

  function installStyles(){
    if(document.querySelector('[data-equipment-card-styles-v1824]'))return;
    const style=document.createElement('style');
    style.dataset.equipmentCardStylesV1824='ready';
    style.textContent=`
.equipment-entry{min-width:0}
.equipment-card-disclosure-v1824{margin-top:.75rem;border:1px solid var(--border);border-radius:var(--radius);background:color-mix(in srgb,var(--panel-bg) 92%,transparent);overflow:hidden}
.equipment-card-disclosure-v1824>summary{cursor:pointer;padding:.7rem .8rem;font-family:var(--font-section);font-weight:800;color:var(--accent);list-style-position:inside;overflow-wrap:anywhere}
.equipment-card-disclosure-v1824>summary:focus-visible{outline:3px solid var(--accent-2);outline-offset:-3px}
.equipment-card-panel-v1824{display:grid;place-items:center;gap:.65rem;min-width:0;padding:.75rem;border-top:1px solid var(--border)}
.equipment-card-status-v1824{margin:0;text-align:center;color:var(--muted)}
.equipment-card-status-v1824.error{color:var(--danger)}
.equipment-card-image-v1824{display:block;width:min(100%,32rem);height:auto;aspect-ratio:2/3;object-fit:contain;border:1px solid var(--accent-2);border-radius:10px;background:#0c0e0f;box-shadow:0 8px 24px #0005}
.equipment-card-image-v1824.pending{position:absolute;opacity:0;pointer-events:none}
.equipment-card-image-v1824[hidden],.equipment-card-status-v1824[hidden],.equipment-card-panel-v1824 button[hidden]{display:none!important}
.equipment-card-panel-v1824>.mse-card-v15{width:min(100%,32rem);max-width:32rem;margin:0;box-sizing:border-box}
@media(max-width:560px){.equipment-card-panel-v1824{padding:.5rem}.equipment-card-disclosure-v1824>summary{padding:.65rem}}
@media print{.equipment-card-disclosure-v1824:not([open]){display:none!important}.equipment-card-disclosure-v1824[open]>summary{display:none!important}.equipment-card-panel-v1824{border:0;padding:0}.equipment-card-image-v1824{box-shadow:none;max-height:92vh;width:auto;max-width:100%}}
`;
    document.head.append(style);
  }

  function updateSummary(details,summary,label,item){
    const action=details.open?'Gegenstandskarte schließen':'Gegenstandskarte öffnen';
    label.textContent=action;
    summary.setAttribute('aria-expanded',String(details.open));
    summary.setAttribute('aria-label',`${item.name||'Gegenstand'}: ${action}`);
  }

  function standardCardLoader(panel,item,entry){
    const status=el('p',{class:'equipment-card-status-v1824','aria-live':'polite',text:'Die Gegenstandskarte wird beim Öffnen geladen.'});
    const image=el('img',{class:'equipment-card-image-v1824',alt:`Gegenstandskarte: ${item.name||entry.id}`,loading:'lazy',decoding:'async',width:entry.width,height:entry.height});
    const retry=el('button',{type:'button',text:'Karte erneut laden'});
    image.hidden=true;retry.hidden=true;
    panel.append(status,image,retry);
    let ready=false,loading=false,timeoutId=0;
    const fail=()=>{
      if(!loading)return;
      clearTimeout(timeoutId);ready=false;loading=false;image.hidden=true;image.classList.remove('pending');image.removeAttribute('src');status.hidden=false;status.classList.add('error');status.textContent='Die Gegenstandskarte konnte nicht geladen werden.';retry.hidden=false;
    };
    const request=()=>{
      if(ready||loading)return;
      loading=true;retry.hidden=true;image.hidden=false;image.classList.add('pending');status.hidden=false;status.classList.remove('error');status.textContent='Gegenstandskarte wird geladen …';
      image.onload=()=>{clearTimeout(timeoutId);ready=true;loading=false;image.hidden=false;image.classList.remove('pending');status.hidden=true;retry.hidden=true};
      image.onerror=fail;
      image.src=entry.url;
      timeoutId=setTimeout(fail,8000);
    };
    retry.onclick=()=>{image.removeAttribute('src');requestAnimationFrame(request)};
    return request;
  }

  function mseCardLoader(panel,item,catalog){
    const status=el('p',{class:'equipment-card-status-v1824','aria-live':'polite',text:'Die Set-Gegenstandskarte wird beim Öffnen aufgebaut.'});
    panel.append(status);
    let ready=false;
    return()=>{
      if(ready)return;
      if(typeof window.Eberos?.createMseCardV1824!=='function'){status.classList.add('error');status.textContent='Die Set-Gegenstandskarte ist derzeit nicht verfügbar.';return}
      const card=window.Eberos.createMseCardV1824(catalog);
      card.setAttribute('aria-label',`Set-Gegenstandskarte: ${item.name||catalog.name}`);
      panel.replaceChildren(card);ready=true;
    };
  }

  function renderEquipmentCardDisclosureV1824(owner,item,index){
    const standard=standardCardFor(item),mse=mseCatalogFor(item);
    if(!standard&&!mse)return null;
    const key=itemStateKey(owner,item,index),panelId=`equipment-card-v1824-${safeKey(owner?.id||'owner')}-${safeKey(item?.instanceId||item?.id||index)}-${++panelSequence}`;
    const details=el('details',{class:'equipment-card-disclosure-v1824','data-equipment-card-kind':standard?'standard':'set','data-catalog-id':item.catalogId});
    const summary=el('summary'),label=el('span'),panel=el('div',{class:'equipment-card-panel-v1824',id:panelId});
    summary.append(label);summary.setAttribute('aria-controls',panelId);details.append(summary,panel);
    details.open=openCards.has(key);
    const loadCard=standard?standardCardLoader(panel,item,standard):mseCardLoader(panel,item,mse);
    updateSummary(details,summary,label,item);
    details.addEventListener('toggle',()=>{
      if(details.open)openCards.add(key);else openCards.delete(key);
      updateSummary(details,summary,label,item);
      if(details.open)loadCard();
    });
    if(details.open)queueMicrotask(loadCard);
    return details;
  }

  installStyles();
  const renderEquipmentBeforeCardsV1824=renderEquipmentV174;
  renderEquipmentV174=function(owner){
    const box=renderEquipmentBeforeCardsV1824(owner),entries=[...box.querySelectorAll('.equipment-entry')];
    entries.forEach((wrap,index)=>{
      const item=owner.equipment?.[index],disclosure=renderEquipmentCardDisclosureV1824(owner,item,index);
      if(disclosure)wrap.append(disclosure);
    });
    return box;
  };

  Object.assign(window.Eberos,{
    standardItemCardCountV1824:standardCards.size,
    equipmentCardOpenStateV1824:openCards,
    renderEquipmentCardDisclosureV1824
  });
})();
