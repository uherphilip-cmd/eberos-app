'use strict';
(function installRawMaterialLots(global){
  const catalog=global.EBEROS_RAW_MATERIALS;
  if(catalog?.format!=='eberos-raw-material-lot-catalog'||catalog.materials.length!==301||catalog.extraCards?.length!==7)throw Error('Rohstoffkatalog fehlt oder ist unvollständig.');
  const byId=new Map(catalog.materials.map(m=>[m.id,m])),byCode=new Map(catalog.materials.map(m=>[m.code,m]));
  for(const copy of catalog.extraCards){
    const material=byId.get(copy.materialId);
    if(!material||byCode.has(copy.code))throw Error('Ungültiger zusätzlicher Loscode: '+copy.code);
    byCode.set(copy.code,{...material,code:copy.code,cardUrl:copy.cardUrl});
  }
  function materialForLot(item){
    const card=byCode.get(item.materialCode);
    return card?.id===item.materialId?card:byId.get(item.materialId);
  }
  const domainLabels={weapon:'Waffen',armor:'Rüstung & Schild',trap:'Fallen',construction:'Handwerk & Baukunst',alchemy:'Alchemie'};
  const isLot=item=>item?.sourceVersion==='raw-material-lot-v1';
  const owners=data=>(data.characters||[]).flatMap(c=>[c,...(c.auxiliaryTabs||[])]);
  const normalizeCode=value=>{const match=String(value||'').trim().toUpperCase().match(/^(?:RM[\s-]*)?(\d{1,3})$/);return match?'RM-'+match[1].padStart(3,'0'):''};
  const lookup=value=>byCode.get(normalizeCode(value))||null;
  const stamp=()=>new Date().toISOString();
  function ensureOwner(owner){owner.rawMaterialLedger=Array.isArray(owner.rawMaterialLedger)?owner.rawMaterialLedger:[];return owner}
  function normalizeLot(item){
    if(!isLot(item))return item;
    const m=materialForLot(item);if(!m)return item;
    global.Eberos.equipmentRules.physicalFields(item);
    return Object.assign(item,{name:m.name,materialCode:m.code,craftingCategory:m.craftingCategory,quantity:1,qty:1,weightKg:m.lot.weightKg,valueCopper:m.lot.valueCopper,cbp:0,cbpCost:0,minStrength:0,equippedQuantity:0,itemType:'raw-material',catalogSource:'raw-material',isMaterial:true,active:true,loadState:item.loadState==='stored'?'stored':'carried',rawMaterialRevision:catalog.revision});
  }
  function ensureData(data){
    data.rawMaterialClaims=data.rawMaterialClaims&&typeof data.rawMaterialClaims==='object'&&!Array.isArray(data.rawMaterialClaims)?data.rawMaterialClaims:{};
    for(const owner of owners(data)){
      ensureOwner(owner);
      for(const item of owner.equipment||[])if(isLot(item)){
        normalizeLot(item);
        if(!owner.rawMaterialLedger.some(row=>row.instanceId===item.instanceId))owner.rawMaterialLedger.push({instanceId:item.instanceId,materialId:item.materialId,code:item.materialCode,status:'claimed',claimedAt:stamp()});
      }
      for(const row of owner.rawMaterialLedger){
        if(row.status==='transferred'||!byCode.has(row.code))continue;
        const previous=data.rawMaterialClaims[row.code];
        if(previous?.instanceId===row.instanceId&&['consumed','destroyed'].includes(previous.status)&&row.status==='claimed')row.status=previous.status;
        const item=owner.equipment?.find(i=>i.instanceId===row.instanceId);
        if(item&&isLot(item)&&item.structurePointsCurrent<=0&&row.status==='claimed'){row.status='destroyed';row.destroyedAt=stamp();}
        if(!previous||previous.instanceId===row.instanceId&&['consumed','destroyed'].includes(row.status))data.rawMaterialClaims[row.code]={code:row.code,materialId:row.materialId,instanceId:row.instanceId,ownerId:owner.id,status:row.status};
      }
    }
    data.rawMaterialCatalogRevision=catalog.revision;return data;
  }
  function findClaim(data,code){const row=data.rawMaterialClaims?.[code];return row?{owner:owners(data).find(o=>o.id===row.ownerId),row}:null}
  function transaction(work,persist){
    const before=persist?structuredClone(state):null;
    try{
      const result=work();
      if(persist&&result.ok){state.rawMaterialChangeRevision=(state.rawMaterialChangeRevision||0)+1;LOCAL_DRAFT_REPOSITORY.save(state);renderAll()}
      return result;
    }catch(error){if(before){state=before;renderAll()}return{ok:false,message:'Änderung wurde nicht gespeichert: '+error.message}}
  }
  function claim(owner,code,{data=state,persist=true}={}){
    const m=lookup(code);if(!m)return{ok:false,message:'Unbekannter Rohstoffcode. Beispiel: RM-004.'};
    if(!owners(data).includes(owner))return{ok:false,message:'Inventar nicht gefunden.'};
    ensureData(data);const previous=findClaim(data,m.code);
    if(previous)return{ok:false,message:m.code+' ist bereits '+(previous.row.status==='consumed'?'verbraucht.':'bei '+(previous.owner?.name||'einer Figur')+' erfasst.')};
    return transaction(()=>{
      const instanceId=uid(),item=normalizeLot(normalizeItemV174({id:instanceId,instanceId,materialId:m.id,materialCode:m.code,sourceVersion:'raw-material-lot-v1',name:m.name,weightKg:m.lot.weightKg,isMaterial:true,loadState:'carried',quantity:1}));
      owner.equipment=owner.equipment||[];owner.equipment.push(item);
      owner.rawMaterialLedger.push({instanceId,materialId:m.id,code:m.code,status:'claimed',claimedAt:stamp(),catalogRevision:catalog.revision});
      data.rawMaterialClaims[m.code]={code:m.code,materialId:m.id,instanceId,ownerId:owner.id,status:'claimed'};
      return{ok:true,item,message:m.code+' · '+m.name+' als vollständiges Los hinzugefügt.'};
    },persist);
  }
  function targetAllowed(item,domain){
    if(!item||isLot(item)||Number(item.quantity??1)!==1)return false;
    if(domain==='weapon')return ['weapon','ammunition'].includes(item.itemType);
    if(domain==='armor')return item.itemType==='armor';
    return ['trap','construction'].includes(domain)&&!['weapon','armor','ammunition'].includes(item.itemType);
  }
  // Only validate exact native modules; unsupported rules remain visible on the target.
  function supportedModules(application){
    if(application.runtime_status!=='primitive_supported')return [];
    const mods=application.parameters?.modules;
    if(!Array.isArray(mods)||!mods.length)return [];
    return mods.every(m=>m.operation==='add'&&Number.isFinite(m.value)&&(
      m.type==='attribute'&&ATTRS.some(([id])=>id===m.target)||
      m.type==='skill'&&SKILLS.some(s=>s.id===m.target)||
      m.type==='counter-max'&&COUNTERS.some(([id])=>id===m.target)||
      m.type==='resistance'&&global.EberosResistanceRulesV1819?.normalizeId?.(m.target)
    ))?structuredClone(mods):[];
  }
  function consume(owner,instanceId,domain,{targetId='',project='',data=state,persist=true}={}){
    if(!owners(data).includes(owner))return{ok:false,message:'Inventar nicht gefunden.'};
    ensureData(data);
    const item=(owner.equipment||[]).find(i=>isLot(i)&&i.instanceId===instanceId),row=owner.rawMaterialLedger.find(r=>r.instanceId===instanceId);
    if(!item||!row||row.status!=='claimed')return{ok:false,message:'Dieses Los ist nicht mehr verfügbar.'};
    if(item.structurePointsCurrent<=0)return{ok:false,message:'Das Los ist unbrauchbar; daraus entsteht kein Anwendungseffekt.'};
    const registered=data.rawMaterialClaims[row.code];
    if(!registered||registered.status!=='claimed'||registered.instanceId!==instanceId||registered.ownerId!==owner.id)return{ok:false,message:'Dieser Code ist bereits anderweitig erfasst oder verbraucht.'};
    const claims=owners(data).flatMap(o=>(o.rawMaterialLedger||[]).filter(r=>r.code===row.code&&r.status!=='transferred'));
    if(claims.length!==1||claims[0]!==row)return{ok:false,message:'Dieser Code kommt mehrfach oder bereits verbraucht im lokalen Deck vor. Bitte den doppelten Import bereinigen.'};
    if(!domainLabels[domain])return{ok:false,message:'Anwendung wählen.'};
    const m=materialForLot(item),target=domain==='alchemy'?null:owner.equipment.find(i=>i.instanceId===targetId);
    if(!m)return{ok:false,message:'Rohstoff fehlt im Katalog.'};
    if(domain!=='alchemy'&&!targetAllowed(target,domain))return{ok:false,message:'Passenden einzelnen Zielgegenstand wählen (Anzahl 1).'};
    if(domain==='alchemy'&&!String(project).trim())return{ok:false,message:'Alchemievorhaben oder Rezept benennen.'};
    if(item.loadState==='stored')return{ok:false,message:'Das eingelagerte Los zuerst mitführen.'};
    const application=domain==='alchemy'?null:m.applications.find(a=>a.domain===domain);
    const modules=application?supportedModules(application):[];
    const builderEffect=application?.builder_effect;
    return transaction(()=>{
      const usage={id:uid(),domain,label:domainLabels[domain],consumedAt:stamp(),targetId:target?.instanceId||null,targetName:target?.name||String(project).trim(),
        effectId:application?.effect_id||null,effectText:application?.displayText||'Alchemiezutat: '+m.alchemy.map(a=>a.displayText).join(' · '),
        alchemyPotentials:domain==='alchemy'?structuredClone(m.alchemy):undefined,application:application?structuredClone(application):undefined,
        automation:modules.length?'automatic':builderEffect&&global.EberosMaterialBuilderV1818.normalizeMaterialEffect?.({effectId:application.effect_id})?'automatic':'manual',catalogRevision:catalog.revision};
      if(target){
        target.rawMaterialApplications=target.rawMaterialApplications||[];
        target.rawMaterialApplications.push({materialId:m.id,code:m.code,lotInstanceId:instanceId,...usage});
        if(modules.length){
          ensureOwnerV177(owner);
          const effect=effectInstanceV177({id:'raw-material-'+usage.id,name:m.name+' · '+domainLabels[domain],description:application.displayText,category:'Rohstoffanwendung',sourceType:'item',sourceId:target.instanceId,sourceLabel:m.code+' · '+target.name,active:true,modules,durationUnit:'source',sourceManaged:true});
          effect.rawMaterialUsageId=usage.id;owner.activeEffectsV177.push(effect);
        }else if(usage.automation==='automatic'){
          const effect=global.EberosMaterialBuilderV1818.normalizeMaterialEffect({effectId:application.effect_id,sourceMaterialId:m.id,target:'object'});
          target.materialEffectsV1818=[...(target.materialEffectsV1818||[]),effect];
        }
      }
      row.status='consumed';row.usage=usage;row.weightKg=m.lot.weightKg;row.valueCopper=m.lot.valueCopper;
      data.rawMaterialClaims[m.code]={...registered,status:'consumed',usageId:usage.id,consumedAt:usage.consumedAt};
      owner.equipment=owner.equipment.filter(i=>i.instanceId!==instanceId);
      return{ok:true,usage,message:m.name+' vollständig für '+domainLabels[domain]+' verbraucht.'};
    },persist);
  }
  function transfer(owner,instanceId,to,{data=state,persist=true}={}){
    ensureData(data);
    if(!owners(data).includes(owner)||!owners(data).includes(to)||owner===to)return{ok:false,message:'Anderen Empfänger wählen.'};
    const item=owner.equipment?.find(i=>isLot(i)&&i.instanceId===instanceId),row=owner.rawMaterialLedger.find(r=>r.instanceId===instanceId&&r.status==='claimed');
    if(!item||!row||item.structurePointsCurrent<=0)return{ok:false,message:'Los nicht verfügbar oder unbrauchbar.'};
    const registered=data.rawMaterialClaims[row.code];
    if(!registered||registered.status!=='claimed'||registered.instanceId!==instanceId||registered.ownerId!==owner.id)return{ok:false,message:'Dieser Code ist bereits anderweitig erfasst oder verbraucht.'};
    return transaction(()=>{owner.equipment=owner.equipment.filter(i=>i!==item);row.status='transferred';row.transferredTo=to.id;row.transferredAt=stamp();to.equipment=to.equipment||[];to.equipment.push(item);to.rawMaterialLedger.push({...structuredClone(row),status:'claimed',receivedFrom:owner.id});data.rawMaterialClaims[row.code]={...registered,ownerId:to.id};return{ok:true,message:'Los weitergegeben.'}},persist);
  }
  const oldNormalize=normalizeItemV174;
  normalizeItemV174=function(raw={}){return normalizeLot(oldNormalize(raw))};
  const oldMigrate=migrateState;migrateState=function(data){return ensureData(oldMigrate(data))};
  ensureData(state);
  function destroy(owner,instanceId,{data=state,persist=true,reason='Erzählerisch unbrauchbar geworden'}={}){
    ensureData(data);
    if(!owners(data).includes(owner))return{ok:false,message:'Inventar nicht gefunden.'};
    const item=owner.equipment?.find(i=>isLot(i)&&i.instanceId===instanceId),row=owner.rawMaterialLedger.find(r=>r.instanceId===instanceId);
    const registered=row&&data.rawMaterialClaims[row.code];
    if(!item||!row||row.status!=='claimed'||registered?.instanceId!==instanceId||registered?.ownerId!==owner.id||registered.status!=='claimed')return{ok:false,message:'Los nicht verfügbar.'};
    return transaction(()=>{item.structurePointsCurrent=0;row.status='destroyed';row.destroyedAt=stamp();row.damageReason=String(reason);registered.status='destroyed';registered.destroyedAt=row.destroyedAt;return{ok:true,item,message:'Los unbrauchbar erfasst; der Code bleibt vergeben und es wird kein Effekt ausgelöst.'}},persist);
  }
  function restore(owner,instanceId,{data=state,persist=true}={}){
    ensureData(data);
    if(!owners(data).includes(owner))return{ok:false,message:'Inventar nicht gefunden.'};
    const item=owner.equipment?.find(i=>isLot(i)&&i.instanceId===instanceId),row=owner.rawMaterialLedger.find(r=>r.instanceId===instanceId),registered=row&&data.rawMaterialClaims[row.code];
    if(!item||row?.status!=='destroyed'||registered?.status!=='destroyed'||registered.instanceId!==instanceId||registered.ownerId!==owner.id)return{ok:false,message:'Nur dasselbe vorhandene unbrauchbare Los kann wiederhergestellt werden.'};
    return transaction(()=>{item.structurePointsCurrent=global.Eberos.equipmentRules.maximum(item);row.status='claimed';row.recoveredAt=stamp();registered.status='claimed';return{ok:true,item,message:'Dasselbe Los nach zulässiger Wiederherstellung wieder nutzbar.'}},persist);
  }
  const select=(label,entries)=>{const input=el('select',{'aria-label':label});for(const [value,text]of entries)input.append(el('option',{value,text}));return input};
  function cardView(m){
    const details=el('details',{class:'raw-material-card-view'}),image=el('img',{alt:'Rohstoffkarte '+m.code+' · '+m.name,width:1024,height:1536,loading:'lazy',decoding:'async'});
    details.append(el('summary',{text:'Rohstoffkarte öffnen'}),image,EberosWebmedien.link(m.cardUrl,'Karte vergrößern'));
    details.addEventListener('toggle',()=>{if(details.open&&!image.hasAttribute('src')){
      const picture=document.createElement('picture'), mobile=document.createElement('source');
      mobile.media='screen and (max-width: 600px)';
      mobile.srcset=m.cardUrl.split('?')[0].replace(/\.webp$/,'.mobil.webp');
      image.replaceWith(picture);picture.append(mobile,image);
      image.onerror=()=>{image.onerror=null;mobile.remove();image.src=m.cardUrl};
      image.src=m.cardUrl;
    }});return details;
  }
  function renderPicker(owner){
    const box=el('section',{class:'raw-material-picker'}),form=el('form',{class:'toolbar'}),input=el('input',{'aria-label':'Rohstoffcode',placeholder:'RM-004',autocomplete:'off',maxlength:12}),status=el('p',{'aria-live':'polite'}),preview=el('div');
    const button=el('button',{type:'submit',class:'primary',text:'Rohstoffkarte erfassen'});
    form.append(input,button);
    form.onsubmit=event=>{event.preventDefault();const result=claim(owner,input.value);status.textContent=result.message;if(!result.ok)status.className='notice error';else status.className='notice'};
    input.oninput=()=>{preview.replaceChildren();status.textContent='';const m=lookup(input.value);if(m)preview.append(el('p',{text:m.name+' · '+m.lot.label+' · '+m.lot.weightText+' · '+m.lot.priceText+' · '+catalog.craftingCategories[m.craftingCategory]}),cardView(m))};
    box.append(el('h3',{text:'Rohstoffkarten'}),el('p',{class:'muted',text:'Eine Karte = ein vollständiges Los. Waffen, Rüstung, Fallen, Baukunst oder Alchemie verbrauchen das gesamte Los. Codes werden in diesem lokalen Deck nur einmal erfasst.'}),form,status,preview);return box;
  }
  function renderLot(owner,item){
    const m=materialForLot(item),box=el('section',{class:'equipment-entry raw-material-lot','data-material-code':item.materialCode});
    if(!m){box.append(el('p',{class:'notice error',text:'Unbekannter Rohstoff: '+item.materialId}));return box}
    const feedback=el('p',{'aria-live':'polite'}),mode=select('Rohstoffanwendung',[['','Anwendung wählen'],...Object.entries(domainLabels)]),target=select('Zielgegenstand',[['','Zielgegenstand wählen']]),project=el('input',{'aria-label':'Alchemievorhaben',placeholder:'Rezept oder Alchemievorhaben'}),effect=el('p'),consumeButton=el('button',{type:'button',class:'primary',text:'Vollständiges Los verbrauchen',disabled:true}),storage=select('Los mitführen oder einlagern',[['carried','Mitgeführt'],['stored','Eingelagert']]);
    storage.value=item.loadState;storage.onchange=()=>{item.loadState=storage.value;saveLoadV174(owner,true)};
    project.hidden=true;target.hidden=true;
    const update=()=>{
      const domain=mode.value;target.hidden=!domain||domain==='alchemy';project.hidden=domain!=='alchemy';
      target.replaceChildren(el('option',{value:'',text:'Zielgegenstand wählen'}));
      for(const t of owner.equipment.filter(i=>targetAllowed(i,domain)))target.append(el('option',{value:t.instanceId,text:t.name||'Eigener Gegenstand'}));
      const a=m.applications.find(a=>a.domain===domain);
      effect.textContent=domain==='alchemy'?'Das Los wird als Zutat für das benannte Vorhaben verbucht. Die vier Alchemiepotenziale bleiben im Verbrauchsprotokoll; ihre Auslösung folgt dem Rezept.':a?a.displayText+' · '+(supportedModules(a).length||a.builder_effect?'Berechenbare Wirkung wird verknüpft.':'Manuell zu beachten; keine automatische Berechnung.') :'';
      consumeButton.disabled=!domain||item.structurePointsCurrent<=0;
    };
    mode.onchange=update;
    consumeButton.onclick=()=>{
      if(!mode.value)return;
      if(mode.value==='alchemy'&&!project.value.trim()){feedback.textContent='Alchemievorhaben oder Rezept benennen.';return}
      if(mode.value!=='alchemy'&&!target.value){feedback.textContent='Passenden einzelnen Zielgegenstand wählen.';return}
      if(!confirm(m.name+' ('+m.code+') vollständig für '+domainLabels[mode.value]+' verbrauchen?'))return;
      const result=consume(owner,item.instanceId,mode.value,{targetId:target.value,project:project.value});if(!result.ok)feedback.textContent=result.message;
    };
    const list=el('ul');for(const a of m.applications)list.append(el('li',{text:domainLabels[a.domain]+': '+a.displayText}));
    list.append(el('li',{text:'Alchemie: '+m.alchemy.map(a=>a.displayText).join(' · ')}));
    const toolbar=el('div',{class:'raw-material-actions'},[mode,target,project,consumeButton]);
    const receivers=owners(state).filter(o=>o!==owner),recipient=select('Los weitergeben an',[['','Empfänger wählen'],...receivers.map(o=>[o.id,o.name||o.type||'Figur'])]),give=el('button',{type:'button',text:'Los weitergeben',onclick:()=>{const result=transfer(owner,item.instanceId,receivers.find(o=>o.id===recipient.value));if(!result.ok)feedback.textContent=result.message}});
    const broken=item.structurePointsCurrent<=0;
    consumeButton.disabled=broken;give.disabled=broken;
    const stateButton=el('button',{type:'button',text:broken?'Dasselbe Los nach Wiederherstellung freigeben':'Los als unbrauchbar erfassen',onclick:()=>{const result=broken?restore(owner,item.instanceId):destroy(owner,item.instanceId);if(!result.ok)feedback.textContent=result.message}});
    box.append(el('h4',{text:m.code+' · '+m.name}),el('p',{text:'1 vollständiges Los · '+m.lot.label+' · '+m.lot.weightText+' · '+m.lot.priceText+' · '+catalog.craftingCategories[m.craftingCategory]}),el('p',{class:'notice',text:'Struktur '+item.structurePointsCurrent+'/'+m.baseStructurePoints+(broken?' · unbrauchbar':' · kein automatischer Verschleiß')}),storage,cardView(m),list,toolbar,effect,el('div',{class:'toolbar'},[recipient,give,stateButton]),feedback);return box;
  }
  function renderHistory(owner){
    const rows=(owner.rawMaterialLedger||[]).filter(row=>['consumed','transferred','destroyed'].includes(row.status));
    const box=el('details',{class:'raw-material-history'});box.append(el('summary',{text:'Rohstoffprotokoll ('+rows.length+')'}));
    for(const row of rows){const p=el('p',{text:row.code+' · '+(byId.get(row.materialId)?.name||row.materialId)+' · '+(row.status==='consumed'?'verbraucht: '+row.usage.label+' → '+row.usage.targetName:row.status==='destroyed'?'unbrauchbar; Code weiterhin vergeben':'weitergegeben')});if(row.usage)p.append(el('br'),el('span',{text:row.usage.effectText+' · '+(row.usage.automation==='automatic'?'Berechnung verknüpft':'Manuell zu beachten')}));box.append(p)}return box;
  }
  const oldRender=renderEquipmentV174;
  renderEquipmentV174=function(owner){
    ensureOwner(owner);const box=oldRender(owner),entries=[...box.querySelectorAll('.equipment-entry')];
    entries.forEach((entry,index)=>{const item=owner.equipment[index];if(isLot(item))entry.replaceWith(renderLot(owner,item));else if(item?.rawMaterialApplications?.length){const notes=el('section',{class:'raw-material-applied'});notes.append(el('h4',{text:'Verarbeitete Rohstoffkarten'}));for(const usage of item.rawMaterialApplications)notes.append(el('p',{text:usage.code+' · '+usage.label+': '+usage.effectText+' · '+(usage.automation==='automatic'?'Berechnung verknüpft':'Manuell zu beachten')}));entry.append(notes)}});
    box.prepend(renderPicker(owner));box.append(renderHistory(owner));return box;
  };
  document.head.append(el('style',{text:'.raw-material-picker,.raw-material-lot,.raw-material-history{border:1px solid var(--border);border-radius:10px;padding:.8rem;margin:.7rem 0;min-width:0}.raw-material-card-view>summary{cursor:pointer;padding:.5rem 0}.raw-material-card-view img{display:block;width:min(100%,32rem);height:auto;object-fit:contain;margin:.5rem auto}.raw-material-card-view:not([open]) img{display:none}.raw-material-actions{display:grid;grid-template-columns:1fr 1fr;gap:.5rem}.raw-material-actions>*{min-width:0;width:100%}.raw-material-applied{border-top:1px solid var(--border);margin-top:.5rem}.raw-material-lot li,.raw-material-history p{overflow-wrap:anywhere}@media(max-width:600px){.raw-material-actions{grid-template-columns:1fr}}'}));
  global.EberosRawMaterials={catalog,lookup,normalizeCode,isLot,claim,consume,transfer,destroy,restore,ensureData,targetAllowed,supportedModules};
})(window);
