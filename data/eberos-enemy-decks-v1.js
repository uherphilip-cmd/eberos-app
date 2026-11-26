/* Local enemy catalog and independent NPC copies; canonical sheets also feed GM templates. */
(function(){
 'use strict';
 const catalog=globalThis.EBEROS_RUSSKLINGEN_NPC_SET_V1;
 if(!catalog?.records?.length)throw Error('Gegnerdeck fehlt.');
 const clone=v=>structuredClone(v),owners=()=>state.characters.flatMap(c=>[c,...(c.auxiliaryTabs||[])]);
 function attachEffects(owner,item){
  if(!item.effectModulesV177?.length)return;
  const effect=effectInstanceV177({name:item.name,description:item.effect,sourceType:'item',sourceId:item.instanceId,sourceLabel:item.name,category:'Gegenstände',modules:clone(item.effectModulesV177)});
  owner.activeEffectsV177||=[];owner.activeEffectsV177.push(effect);item.effectIdsV177=[effect.id];
 }
 function copyItems(owner,items){
  owner.activeEffectsV177=[];
  owner.equipment=items.map(raw=>{const item=clone(raw),id=uid();item.id=id;item.instanceId=id;item.effectIdsV177=[];attachEffects(owner,item);return item});
 }
 function instantiate(recordId){
  const r=catalog.records.find(r=>r.id===recordId);if(!r)throw Error('Unbekannte Gegnerfigur.');
  const fresh=newAuxEntry('npc',r.name),o=Object.assign(fresh,clone(r.builder.npcSheet));
  o.id=uid();o.layout=fresh.layout;o.accounting={mode:'free',costSource:'manual',manualCost:0,active:false,reason:'Eigenständiger Gegner'};
  copyItems(o,r.builder.npcSheet.equipment);ensureOwnerV177(o);return o;
 }
 function add(recordId,{persist=true}={}){
  const o=instantiate(recordId);ch().auxiliaryTabs.push(o);
  if(persist){save();renderAll()}return o;
 }
 function addBand(){const added=catalog.records.map(r=>add(r.id,{persist:false}));save();renderAll();return added}
 function addCamp(){
  const o=newAuxEntry('possession',catalog.campLoot.name);o.accounting={mode:'free',active:false};o.money=clone(catalog.campLoot.money);
  copyItems(o,catalog.campLoot.equipment);o.extensions={russklingenV1:{recordId:catalog.campLoot.id,deckId:catalog.id}};ch().auxiliaryTabs.push(o);save();renderAll();return o;
 }
 function transfer(source,target,instanceId,quantity=1){
  if(!source||!target||source===target)throw Error('Verschiedene Quelle und Zielfigur wählen.');
  if(!owners().includes(source)||!owners().includes(target))throw Error('Quelle und Ziel müssen lokale Figuren sein.');
  const index=(source.equipment||[]).findIndex(i=>i.instanceId===instanceId||i.id===instanceId),item=source.equipment?.[index];
  if(!item)throw Error('Die Beute ist nicht mehr vorhanden.');
  const available=Number(item.quantity??item.qty??1);
  if(!Number.isInteger(quantity)||quantity<1||quantity>available)throw Error('Ungültige Beutemenge.');
  if(item.effectModulesV177?.length&&quantity!==available)throw Error('Gegenstände mit Wirkungen vollständig übertragen.');
  const moved=clone(item),id=uid();moved.id=id;moved.instanceId=id;moved.quantity=quantity;moved.qty=quantity;moved.loadState='carried';moved.equippedQuantity=0;moved.effectIdsV177=[];
  if(quantity===available){source.equipment.splice(index,1);source.activeEffectsV177=(source.activeEffectsV177||[]).filter(e=>e.sourceId!==item.instanceId)}
  else{item.quantity=available-quantity;item.qty=item.quantity;item.equippedQuantity=Math.min(item.equippedQuantity||0,item.quantity)}
  target.equipment||=[];target.equipment.push(moved);attachEffects(target,moved);
  state.enemyLootReceiptsV1||=[];state.enemyLootReceiptsV1.push({id:uid(),sourceOwnerId:source.id,targetOwnerId:target.id,sourceInstanceId:instanceId,targetInstanceId:id,quantity,catalogId:moved.catalogId,variantId:moved.variantId||null,at:new Date().toISOString()});
  save();renderAll();return moved;
 }
 function transferMoney(source,target){
  if(!source||!target||source===target||!owners().includes(source)||!owners().includes(target))throw Error('Gültige Quelle und Zielfigur wählen.');
  const value=(+source.money?.gold||0)*10000+(+source.money?.silver||0)*100+(+source.money?.copper||0);
  if(value<=0)throw Error('Keine Münzen in der Quelle.');
  const before=(+target.money?.gold||0)*10000+(+target.money?.silver||0)*100+(+target.money?.copper||0),total=before+value;
  target.money={gold:Math.floor(total/10000),silver:Math.floor(total/100)%100,copper:total%100};source.money={gold:0,silver:0,copper:0};save();renderAll();return value;
 }
 function gmTemplate(recordId){
  const r=catalog.records.find(r=>r.id===recordId),sheet=instantiate(recordId);if(!r)throw Error('Figur fehlt.');
  const lootProfile={version:1,mode:'inventory',moneyPolicy:'fixed',entries:[]};sheet.lootProfile=clone(lootProfile);
  return{attributes:clone(sheet.attributes),counters:clone(sheet.counters),skills:clone(sheet.skills),inventoryProfile:{canCarryItems:true},catalogLoadout:{version:1,items:[]},lootProfile,npcBuilds:[{id:'standard',label:r.builder.editorialProfileV2.spent+' CBP',isDefault:true,profile:{name:r.name,species:r.roleLabel,roleTags:['Räuber','Rußklingen'],publicSummary:sheet.description,gmNotes:sheet.notes},npcSheet:sheet,catalogLoadout:{version:1,items:[]},lootProfile:clone(lootProfile)}],preparedArchetype:{key:r.id,version:4,roleClass:'bandit-opponent',combatExpected:true,deckId:catalog.id}};
 }
 const dialog=document.createElement('dialog');dialog.id='enemy-decks-v1';dialog.setAttribute('aria-label','Gegnerdecks');document.body.append(dialog);
 const style=document.createElement('style');style.textContent='#enemy-decks-v1{width:min(1120px,96vw);max-height:92vh;overflow:auto;background:var(--panel-bg);color:var(--text);border:2px solid #481f29;border-radius:12px;padding:1rem}#enemy-decks-v1::backdrop{background:#000a}.enemy-catalog-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr));gap:.7rem}.enemy-catalog-card{border:1px solid var(--border);padding:.65rem;border-radius:8px;min-width:0}.enemy-catalog-card img{width:100%;height:230px;object-fit:contain;background:#282429}.enemy-catalog-card h3{margin:.4rem 0;font-size:1.15rem}.enemy-catalog-controls{display:flex;flex-wrap:wrap;gap:.6rem;align-items:end;margin:.8rem 0}.enemy-catalog-controls label{display:flex;flex-direction:column;max-width:100%;min-width:0}.enemy-catalog-controls select{max-width:100%;width:240px}.enemy-catalog-controls input{width:6rem}';document.head.append(style);
 const node=(tag,text)=>{const e=document.createElement(tag);if(text)e.textContent=text;return e};
 const message=node('p');message.setAttribute('role','status');
 const button=(name,fn)=>{const b=node('button',name);b.type='button';b.onclick=()=>{try{fn()}catch(e){message.textContent=e.message}};return b};
 function select(label,options){const wrap=node('label',label),e=node('select');e.setAttribute('aria-label',label);for(const [id,name]of options){const o=node('option',name);o.value=id;e.append(o)}wrap.append(e);return{wrap,e}}
 function render(){
  dialog.replaceChildren();dialog.append(button('Schließen',()=>dialog.close()),node('h2','Gegnerdeck · Die Rußklingen'),node('p','12 eigenständige Gegner · Boss 600 CBP · Räuber 310–400 CBP · gesamte Ausrüstung und Beute 2 Gold'),message);
  const actions=node('div');actions.className='enemy-catalog-controls';actions.append(button('Alle zwölf Gegner hinzufügen',()=>{addBand();render();message.textContent='Zwölf neue Gegner mit eigenem Inventar hinzugefügt.'}),button('Lagerbeute hinzufügen',()=>{addCamp();render();message.textContent='Gemeinsame Lagerbeute als eigener Besitzreiter hinzugefügt.'}));dialog.append(actions);
  const grid=node('div');grid.className='enemy-catalog-grid';
  for(const r of catalog.records){const card=node('article');card.className='enemy-catalog-card';card.dataset.enemyRecord=r.id;const image=node('img');image.loading='lazy';image.src=r.art.portrait.replace(/\.png$/,'.preview.webp');image.onerror=()=>{image.onerror=null;image.src=r.art.portrait};image.alt=r.name;card.append(image,node('h3',r.name),node('p',`${r.roleLabel} · ${r.builder.editorialProfileV2.spent} CBP`),button('Als Gegner hinzufügen',()=>{add(r.id);render();message.textContent=r.name+' mit eigenem Inventar hinzugefügt.'}));grid.append(card)}dialog.append(grid);
  dialog.append(node('h3','Lokale Beute übertragen'));
  const all=owners(),sources=all.filter(o=>o.extensions?.russklingenV1),source=select('Beutequelle',sources.map(o=>[o.id,o.name])),target=select('Zielfigur',all.map(o=>[o.id,o.name])),item=select('Gegenstand',[]),controls=node('div');controls.className='enemy-catalog-controls';
  const quantityWrap=node('label','Anzahl'),quantity=node('input');quantity.type='number';quantity.min='1';quantity.step='1';quantity.value='1';quantity.setAttribute('aria-label','Beutemenge');quantityWrap.append(quantity);
  function updateItems(){item.e.replaceChildren();const o=all.find(o=>o.id===source.e.value);for(const i of o?.equipment||[]){const option=node('option',`${i.quantity??i.qty??1}× ${i.name}`);option.value=i.instanceId||i.id;item.e.append(option)}}source.e.onchange=updateItems;updateItems();
  controls.append(source.wrap,item.wrap,quantityWrap,target.wrap,button('Beute übertragen',()=>{const moved=transfer(all.find(o=>o.id===source.e.value),all.find(o=>o.id===target.e.value),item.e.value,+quantity.value);render();message.textContent=`${moved.quantity}× ${moved.name} übertragen.`}),button('Münzen übertragen',()=>{const amount=transferMoney(all.find(o=>o.id===source.e.value),all.find(o=>o.id===target.e.value));render();message.textContent=amount+' Kupferwert übertragen.'}));dialog.append(controls);
 }
 function open(){render();if(!dialog.open)dialog.showModal()}
 const trigger=button('Gegnerdecks',open);trigger.id='open-enemy-decks-v1';(document.querySelector('.topbar')||document.body).append(trigger);
 const api={catalog,instantiate,add,addBand,addCamp,transfer,transferMoney,gmTemplate,open};globalThis.EberosEnemyDecks=api;globalThis.Eberos.enemyDecks=api;
})();
