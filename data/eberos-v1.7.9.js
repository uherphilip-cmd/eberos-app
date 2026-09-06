'use strict';

/* Eberos v1.7.9: Rast, vollständige Gewichte, gemeinsame Kontakt-/NPC-Entitäten,
   schwebende Suche und robuste Rüstungsberechnung. */
const V179_VERSION='1.7.9',V179_SCHEMA=18,V179_RULES=7;

const v179Style=el('style',{text:`
.rest-actions-v179{display:flex;gap:.55rem;flex-wrap:wrap;margin:0 0 .8rem;padding:.7rem;border:1px solid var(--border);border-radius:var(--radius);background:var(--panel-alt)}
.rest-actions-v179 button{flex:1 1 15rem}.rest-actions-v179 .rest-camp-v179{background:var(--accent);color:var(--header-text)}
.rest-actions-v179 p{flex-basis:100%;margin:0;color:var(--muted)}
.contact-card-v179{display:grid;gap:.7rem}.contact-actions-v179{display:flex;gap:.55rem;flex-wrap:wrap;align-items:center}.contact-cost-v179{margin:0}
.contact-entity-badge-v179{display:inline-flex;align-items:center;padding:.2rem .5rem;border:1px solid var(--border);border-radius:999px;background:var(--panel-alt);font-size:.82rem}
.global-search-v179{position:fixed!important;z-index:1600!important;right:14px!important;bottom:14px!important;top:auto!important;left:auto!important;width:min(34rem,calc(100vw - 28px))!important;max-width:none!important;min-width:0!important;padding:.45rem;border:1px solid var(--border);border-radius:12px;background:var(--header-bg);box-shadow:0 12px 36px #0008;color:var(--header-text)}
.global-search-v179 .global-search-box-v177{grid-template-columns:1fr auto}.global-search-v179 .global-search-box-v177 input{background:var(--panel-bg);color:var(--text)}
.global-search-v179 .global-search-results-v177{position:absolute!important;left:0!important;right:0!important;bottom:calc(100% + .35rem)!important;top:auto!important;max-height:min(62vh,34rem)!important;color:var(--text)}
.global-search-v179 .global-search-result-v177{color:var(--text)}
.search-target-v179{animation:searchTargetPulseV179 1.9s ease!important;outline:4px solid var(--accent-2)!important;outline-offset:4px!important;scroll-margin:7rem 1rem}
.toast-v179{position:fixed;z-index:1800;left:50%;bottom:82px;transform:translateX(-50%);width:max-content;max-width:calc(100vw - 24px);padding:.7rem 1rem;border-radius:10px;background:var(--header-bg);color:var(--header-text);box-shadow:0 8px 28px #0008}
@keyframes searchTargetPulseV179{0%,100%{box-shadow:0 0 0 0 color-mix(in srgb,var(--accent-2),transparent 25%)}35%{box-shadow:0 0 0 10px transparent}}
@media(max-width:600px){.global-search-v179{right:6px!important;bottom:6px!important;width:calc(100vw - 12px)!important}.global-search-v179 .global-search-results-v177{max-height:55vh!important}.toast-v179{bottom:72px}}
@media print{.rest-actions-v179,.contact-actions-v179,.global-search-v179,.toast-v179{display:none!important}}
`});document.head.append(v179Style);

function showToastV179(message){
  let toast=document.getElementById('toastV179');
  if(!toast){toast=el('div',{id:'toastV179',class:'toast-v179 no-print',role:'status','aria-live':'polite'});document.body.append(toast)}
  toast.textContent=message;toast.hidden=false;clearTimeout(showToastV179.timer);showToastV179.timer=setTimeout(()=>toast.hidden=true,2600);
}

function contactCardsV179(character){return(character?.layout||[]).filter(card=>card.type==='contact')}
function npcByIdV179(character,id){return(character?.auxiliaryTabs||[]).find(owner=>owner.type==='npc'&&owner.id===id)||null}
function isCompactNpcV179(owner){return owner?.type==='npc'&&owner.presentationV179==='contact'}
function visibleAuxOwnersV179(character=ch()){return(character?.auxiliaryTabs||[]).filter(owner=>!isCompactNpcV179(owner))}

function copyLegacyContactFieldsV179(npc,profile={}){
  const name=String(profile.name||'').trim();if(name)npc.name=name;
  const legacyType=String(profile.npcType||profile.type||profile.role||'').trim();
  if(legacyType){if(NPC_TYPES.includes(legacyType))npc.npcType=legacyType;else npc.roleV179=legacyType}
  for(const key of['location','relationship','availability','description','notes'])if(profile[key]!==undefined&&profile[key]!==null)npc[key]=String(profile[key]);
  const level=Number(profile.contactLevel??profile.level);if(Number.isFinite(level))npc.contactLevel=Math.max(0,Math.min(10,level));
  return npc;
}

function createContactNpcV179(character,profile={}){
  const npc=newAuxEntry('npc',String(profile.name||'').trim()||'Neuer Kontakt');
  copyLegacyContactFieldsV179(npc,profile);npc.entityKindV179='npc';npc.presentationV179='contact';npc.isContactV179=true;npc.linkedCharacterIdV179=character.id;
  if(profile.cost!==undefined&&Number.isFinite(+profile.cost))npc.accounting={...(npc.accounting||{}),mode:profile.active===false?'informational':'character',costSource:'manual',manualCost:Math.max(0,+profile.cost||0),active:profile.active!==false};
  character.auxiliaryTabs=Array.isArray(character.auxiliaryTabs)?character.auxiliaryTabs:[];character.auxiliaryTabs.push(npc);return npc;
}

function linkContactCardV179(character,card){
  card.data=card.data&&typeof card.data==='object'?card.data:{};
  let npc=npcByIdV179(character,card.data.npcIdV179||card.data.npcId);
  if(!npc){
    const legacy=card.data.profile&&typeof card.data.profile==='object'?card.data.profile:{};
    npc=createContactNpcV179(character,legacy);card.data.legacyProfileV179=structuredClone(legacy);card.data.npcIdV179=npc.id;
  }else{
    card.data.npcIdV179=npc.id;npc.entityKindV179='npc';npc.isContactV179=true;npc.linkedCharacterIdV179=character.id;
  }
  npc.contactCardIdsV179=Array.isArray(npc.contactCardIdsV179)?npc.contactCardIdsV179:[];
  if(!npc.contactCardIdsV179.includes(card.id))npc.contactCardIdsV179.push(card.id);
  return npc;
}

function ensureOwnerItemsV179(owner){
  if(!owner||typeof owner!=='object')return owner;ensureOwnerV178(owner);owner.equipment=Array.isArray(owner.equipment)?owner.equipment:[];
  for(const item of owner.equipment){
    if(String(item.category||'').startsWith('armor.'))item.itemType='armor';
    if(item.itemType==='armor'){item.protection=Math.max(0,Number.isFinite(+item.protection)?+item.protection:0);item.blockBonus=Math.max(0,Number.isFinite(+item.blockBonus)?+item.blockBonus:0);item.zones=Array.isArray(item.zones)?item.zones:[]}
    const catalog=item.catalogId&&ITEM_CATALOG_V174.find(entry=>entry.id===item.catalogId),weight=finiteOrNullV174(item.weightKg),catalogWeight=finiteOrNullV174(catalog?.weightKg);
    if(weight===null&&catalogWeight!==null){item.weightKg=catalogWeight;item.weightUnknown=false;item.weightSource=item.weightSource||catalog?.weightSource||'catalog-v1.7.9'}
  }
  return owner;
}

function ensureCharacterContactsV179(character){
  ensureOwnerItemsV179(character);character.auxiliaryTabs=Array.isArray(character.auxiliaryTabs)?character.auxiliaryTabs:[];
  for(const owner of character.auxiliaryTabs){ensureOwnerItemsV179(owner);if(owner.type==='npc'){owner.entityKindV179='npc';if(!owner.presentationV179)owner.presentationV179='full'}}
  for(const card of contactCardsV179(character))linkContactCardV179(character,card);
  if(!character.v179LegacyContactListMigrated){
    const legacy=Array.isArray(character.contacts)?character.contacts:[];
    if(legacy.length&&!Array.isArray(character.legacyContactsV179))character.legacyContactsV179=structuredClone(legacy);
    for(const entry of legacy){
      const npc=createContactNpcV179(character,entry),card=cardObject('contact',character.layout.length,12);card.data.npcIdV179=npc.id;npc.contactCardIdsV179=[card.id];character.layout.push(card);
    }
    character.contacts=[];character.v179LegacyContactListMigrated=true;
  }
  return character;
}

function ensureStateV179(data,log=true){
  const first=!data.v179MigrationDone;for(const character of data.characters||[])ensureCharacterContactsV179(character);
  data.appVersion=V179_VERSION;data.schemaVersion=V179_SCHEMA;data.rulesVersion=V179_RULES;data.v179MigrationDone=true;
  if(first&&log){data.migrationLog=Array.isArray(data.migrationLog)?data.migrationLog:[];data.migrationLog.push({from:17,to:18,at:new Date().toISOString(),changes:['Kontakte und NPCs auf gemeinsame stabile NPC-IDs migriert','Kataloggewichte auf bestehende Iteminstanzen übertragen','Eigene Rüstungen für den zentralen Rüstungswert normalisiert','Zwei Rastarten und schwebende Suche ergänzt']})}
  return data;
}

const migrateStateBeforeV179=migrateState;
migrateState=function(data){return ensureStateV179(migrateStateBeforeV179(data),true)};
const newCharacterBeforeV179=newCharacter,newAuxEntryBeforeV179=newAuxEntry;
newCharacter=function(){return ensureCharacterContactsV179(newCharacterBeforeV179())};
newAuxEntry=function(type,name){const owner=newAuxEntryBeforeV179(type,name);ensureOwnerItemsV179(owner);if(type==='npc'){owner.entityKindV179='npc';owner.presentationV179='full'}return owner};

if(!state.v179MigrationDone){try{localStorage.setItem(STORE+'.backup.pre-v179-runtime.'+Date.now(),JSON.stringify(state))}catch{}}
state=ensureStateV179(state,true);

function refillOwnerV179(owner,camp=false){
  if(!owner||refillOwnerV179.busy)return false;ensureOwnerV178(owner);const rations=owner.rationTracker||(owner.rationTracker={max:0,current:0,note:''});
  if(camp&&Math.max(0,+rations.current||0)<1){showToastV179('Keine Ration vorhanden – die Lagerrast wurde nicht ausgeführt.');return false}
  refillOwnerV179.busy=true;if(camp)rations.current=Math.max(0,(+rations.current||0)-1);
  for(const counter of Object.values(owner.counters||{}))if(counter&&typeof counter==='object')counter.current=Math.max(0,+counter.max||0);
  if(typeof advanceCombatClockV178==='function')advanceCombatClockV178(owner,'rest');else owner.combatRoundRemainderV178=0;
  saveOwnerV173(owner,true);showToastV179(camp?'Lagerrast abgeschlossen: Counter aufgefüllt, 1 Ration verbraucht.':'Rast abgeschlossen: Alle Counter wurden aufgefüllt.');
  setTimeout(()=>refillOwnerV179.busy=false,0);return true;
}

const renderCountersBeforeV179=renderCountersR8;
renderCountersR8=function(owner){
  const box=renderCountersBeforeV179(owner),actions=el('section',{class:'rest-actions-v179','aria-label':'Rastaktionen'}),normal=el('button',{type:'button',text:'Rast – Counter auffüllen','aria-label':'Rast: alle Counter auffüllen'}),camp=el('button',{type:'button',class:'rest-camp-v179',text:'Rast: Lager – 1 Ration verbrauchen','aria-label':'Lagerrast: eine Ration verbrauchen und alle Counter auffüllen'}),rations=Math.max(0,+owner.rationTracker?.current||0);
  normal.onclick=()=>refillOwnerV179(owner,false);camp.onclick=()=>refillOwnerV179(owner,true);camp.disabled=rations<1;camp.title=rations<1?'Keine Ration vorhanden':`${rations} Ration${rations===1?'':'en'} vorhanden`;
  actions.append(normal,camp,el('p',{text:`Normale Rast verbraucht keine Ration. Lagerrast: ${rations} Ration${rations===1?'':'en'} verfügbar. Beide Rastarten setzen den Fünf-Runden-Zähler zurück.`}));box.prepend(actions);return box;
};
renderCountersR5=renderCountersR8;

function isArmorItemV179(item){return item?.itemType==='armor'||String(item?.category||'').startsWith('armor.')}
combatEquipmentSummaryV174=function(owner){
  ensureOwnerItemsV179(owner);const weapons=[],armor=[],zones=new Map();let protection=0,blockBonus=0,armorWeight=0;
  for(const item of owner.equipment||[]){const qty=equippedQuantityV174(item);if(!qty)continue;if(item.itemType==='weapon')weapons.push({item,qty});if(!isArmorItemV179(item))continue;
    const p=Math.max(0,+item.protection||0)*qty,b=Math.max(0,+item.blockBonus||0)*qty,w=(finiteOrNullV174(item.weightKg)||0)*qty;protection+=p;blockBonus+=b;armorWeight+=w;armor.push({item,qty,protection:p,blockBonus:b,weight:w});
    const itemZones=Array.isArray(item.zones)&&item.zones.length?item.zones:['Allgemein'];for(const zone of itemZones){const row=zones.get(zone)||{protection:0,items:[]};row.protection+=p;row.items.push(`${item.name||'Eigene Rüstung'}${qty>1?' ×'+qty:''} (+${p})`);zones.set(zone,row)}
  }
  return{weapons,armor,zones,protection,armorTotal:protection,blockBonus,armorWeight:Math.round(armorWeight*1000)/1000};
};

function contactPersistV179(npc,rerender=false){npc.updatedAt=new Date().toISOString();ch().updatedAt=new Date().toISOString();save();renderStatus();renderCosts();renderAuxTabs();if(rerender)renderCards()}
function contactInputV179(label,value,oninput,type='text'){
  const control=type==='textarea'?variableTextV173(value||'',label,oninput):el('input',{type,value:value??''});if(type!=='textarea')control.oninput=event=>oninput(type==='number'?+event.target.value:event.target.value);return el('label',{class:'field'},[el('span',{text:label}),control]);
}
function renderContactV179(card){
  const character=ch(),npc=linkContactCardV179(character,card),box=el('section',{class:'contact-card-v179','data-contact-npc-id':npc.id}),grid=el('div',{class:'grid three'}),set=(key,rerender=false)=>value=>{npc[key]=value;contactPersistV179(npc,rerender)};
  const type=el('select',{'aria-label':'NPC-Art'});type.append(el('option',{value:'',text:'NPC-Art wählen'}));for(const name of NPC_TYPES)type.append(el('option',{value:name,text:name}));type.value=npc.npcType||'';type.onchange=event=>{npc.npcType=event.target.value;contactPersistV179(npc,true)};
  const level=el('select',{'aria-label':'Kontaktstufe'});for(let index=0;index<=10;index++)level.append(el('option',{value:index,text:index?`${index} CBP · ${NPC_LEVELS[index]}`:'0 CBP · kein bezahlter Kontakt'}));level.value=Math.max(0,+npc.contactLevel||0);level.onchange=event=>{npc.contactLevel=+event.target.value;contactPersistV179(npc,true)};
  grid.append(contactInputV179('Name',npc.name,set('name')),el('label',{class:'field'},[el('span',{text:'NPC-Art'}),type]),contactInputV179('Art / Rolle',npc.roleV179||'',set('roleV179')),el('label',{class:'field'},[el('span',{text:'Kontaktstufe'}),level]),contactInputV179('Aufenthaltsort',npc.location,set('location')),contactInputV179('Beziehung',npc.relationship,set('relationship')),contactInputV179('Verfügbarkeit',npc.availability,set('availability')),contactInputV179('Beschreibung',npc.description,set('description'),'textarea'),contactInputV179('Notizen',npc.notes,set('notes'),'textarea'));
  const mode=el('select',{'aria-label':'CBP-Abrechnung'});for(const[key,label]of Object.entries(ACCOUNTING_MODES))mode.append(el('option',{value:key,text:label}));mode.value=npc.accounting?.mode||'character';mode.onchange=event=>{npc.accounting.mode=event.target.value;contactPersistV179(npc,true)};
  const source=el('select',{'aria-label':'Kostenquelle'});for(const[key,label]of[['handbook','Spielerhandbuch'],['manual','Manuelle Kosten'],['calculated','Berechnet']])source.append(el('option',{value:key,text:label}));source.value=npc.accounting?.costSource||'handbook';source.onchange=event=>{npc.accounting.costSource=event.target.value;contactPersistV179(npc,true)};
  const manual=el('input',{type:'number',min:0,step:1,value:Math.max(0,+npc.accounting?.manualCost||0),'aria-label':'Manuelle Kontaktkosten'});manual.onchange=event=>{npc.accounting.manualCost=Math.max(0,+event.target.value||0);contactPersistV179(npc,true)};
  const accounting=el('div',{class:'grid three'},[el('label',{class:'field'},[el('span',{text:'CBP-Abrechnung'}),mode]),el('label',{class:'field'},[el('span',{text:'Kostenquelle'}),source]),el('label',{class:'field'},[el('span',{text:'Manuelle Kosten'}),manual])]);
  const open=el('button',{type:'button',class:'primary',text:npc.presentationV179==='full'?'NPC-Reiter öffnen':'Als NPC ausarbeiten'});open.onclick=()=>{npc.presentationV179='full';contactPersistV179(npc);renderAuxTabs();openAux(npc.id);showToastV179('Kontakt und NPC verwenden weiterhin denselben Datensatz.')};
  box.append(el('div',{class:'contact-actions-v179'},[el('span',{class:'contact-entity-badge-v179',text:`Gemeinsame NPC-ID · ${npc.id}`}),open]),grid,accounting,el('p',{class:'notice contact-cost-v179',text:`Vergleichswert ${auxDisplayCost(npc)} CBP · Abzug vom Charakter ${auxChargedCost(npc)} CBP`}),el('p',{class:'muted',text:`Stufe ${npc.contactLevel||0}: ${NPC_EFFECTS[npc.contactLevel||0]?.[0]||'kein bezahlter Kontakt'} · ${NPC_EFFECTS[npc.contactLevel||0]?.[1]||''}`}));return box;
}

renderProfileOnCharacterV173=renderContactV179;
const addCardBeforeV179=addCard;
addCard=function(type){
  if(type!=='contact')return addCardBeforeV179(type);if(activeLayoutOwner()!==ch()){alert('Kompakte Kontakte werden beim Spielercharakter angelegt. Wechsle dafür zum Charakterbau.');return}
  const character=ch(),npc=createContactNpcV179(character),card=cardObject('contact',character.layout.length,12);card.data.npcIdV179=npc.id;npc.contactCardIdsV179=[card.id];character.layout.push(card);contactPersistV179(npc,true);showToastV179('Unabhängiger Kontakt angelegt.');
};

function decorateAddCardsV179(){
  for(const button of addCards.querySelectorAll('button'))if(button.textContent.trim()===`+ ${CARD_TYPES.contact}`)button.dataset.addCardTypeV179='contact';
}
const renderAddCardsBeforeV179=renderAddCards;
renderAddCards=function(){renderAddCardsBeforeV179();decorateAddCardsV179()};
decorateAddCardsV179();

const deleteCardBeforeV179=deleteCard;
deleteCard=function(card,owner=activeLayoutOwner()){
  if(owner===ch()&&card.type==='contact'){
    const npc=npcByIdV179(owner,card.data?.npcIdV179||card.data?.npcId);if(!confirm(`Kontaktansicht „${npc?.name||'Unbenannt'}“ entfernen? Der NPC-Datensatz bleibt erhalten und wird als vollständiger NPC-Reiter zugänglich.`))return;
    owner.layout=owner.layout.filter(entry=>entry.id!==card.id);if(npc){npc.contactCardIdsV179=(npc.contactCardIdsV179||[]).filter(id=>id!==card.id);if(npc.presentationV179==='contact')npc.presentationV179='full'}save();renderAll();return;
  }
  return deleteCardBeforeV179(card,owner);
};

const renderAuxProfileBeforeV179=renderAuxProfileV171;
renderAuxProfileV171=function(owner){
  const box=renderAuxProfileBeforeV179(owner);if(owner.type!=='npc')return box;const character=ch(),card=contactCardsV179(character).find(entry=>(entry.data?.npcIdV179||entry.data?.npcId)===owner.id),actions=el('div',{class:'contact-actions-v179'}),button=el('button',{type:'button',text:card?'Kontaktansicht öffnen':'Als Kontakt anzeigen'});
  button.onclick=()=>{let target=card;if(!target){target=cardObject('contact',character.layout.length,12);target.data.npcIdV179=owner.id;character.layout.push(target);owner.contactCardIdsV179=[...(owner.contactCardIdsV179||[]),target.id];owner.isContactV179=true;save()}navigateToV177({ownerId:character.id,cardId:target.id,cardType:'contact',selector:`[data-contact-npc-id="${owner.id}"]`})};actions.append(button,el('span',{class:'contact-entity-badge-v179',text:`NPC-ID · ${owner.id}`}));box.prepend(actions);return box;
};

renderAuxTabs=function(){
  mainTabs.querySelectorAll('[data-dynamic-aux]').forEach(node=>node.remove());const list=visibleAuxOwnersV179(),first=list[0],defaultButton=mainTabs.querySelector('[data-aux-default]');if(defaultButton){defaultButton.hidden=!first;defaultButton.textContent=first?.type==='npc'?'NPC':first?.name||'Zusatzreiter'}
  for(const entry of list.slice(1)){const button=el('button',{'data-view':'aux','data-dynamic-aux':'',text:entry.name||entry.type,onclick:()=>openAux(entry.id)});mainTabs.insertBefore(button,addAuxTabBtn)}renderToc();
};
mainTabs.addEventListener('click',event=>{const button=event.target.closest('[data-aux-default]');if(!button)return;event.preventDefault();event.stopImmediatePropagation();const first=visibleAuxOwnersV179()[0];if(first)openAux(first.id)},true);

const printableOwnersBeforeV179=printableOwnersR15;
printableOwnersR15=function(){return printableOwnersBeforeV179().filter(descriptor=>descriptor.isCharacter||!isCompactNpcV179(descriptor.owner))};

const searchIndexBeforeV179=searchIndexV177;
searchIndexV177=function(){
  const character=ch(),cards=contactCardsV179(character),contactCardIds=new Set(cards.map(card=>card.id)),compactIds=new Set((character.auxiliaryTabs||[]).filter(isCompactNpcV179).map(owner=>owner.id)),entries=searchIndexBeforeV179().filter(entry=>!compactIds.has(entry.target?.ownerId)&&!contactCardIds.has(entry.target?.cardId)),ownerName=character.name||'Hauptcharakter';
  if(cards.length){const first=cards[0];entries.push({label:'Kontakt und Herkunft',kind:'Kontaktfenster',owner:ownerName,target:{ownerId:character.id,cardId:first.id,cardType:'contact'},search:normalizeSearchV177('Kontakt Kontaktfenster Kontakte NPC Herkunft Ansprechpartner Beziehungen')})}
  else entries.push({label:'Kontakt und Herkunft hinzufügen',kind:'Karte hinzufügen',owner:ownerName,target:{ownerId:character.id,cardType:'contact',selector:'[data-add-card-type-v179="contact"]'},search:normalizeSearchV177('Kontakt Kontaktfenster Kontakte NPC Herkunft Ansprechpartner Beziehungen hinzufügen anlegen')});
  for(const card of contactCardsV179(character)){const npc=linkContactCardV179(character,card),label=npc.name||'Unbenannter Kontakt';entries.push({label,kind:'Kontakt / NPC',owner:character.name||'Hauptcharakter',target:{ownerId:character.id,cardId:card.id,cardType:'contact',selector:`[data-contact-npc-id="${npc.id}"]`},search:normalizeSearchV177(`${label} Kontakt NPC ${npc.npcType||''} ${npc.roleV179||''} ${npc.location||''} ${npc.relationship||''} ${npc.availability||''} ${npc.description||''} ${npc.notes||''}`)})}
  return entries;
};

function searchTargetNodeV179(target,cardNode){
  let node=cardNode;if(target.effectId)node=document.querySelector(`[data-effect-id="${CSS.escape(target.effectId)}"]`)||node;if(target.itemId)node=document.querySelector(`[data-item-id="${CSS.escape(target.itemId)}"]`)||node;if(target.disadvantageId)node=document.querySelector(`[data-disadvantage-id="${CSS.escape(target.disadvantageId)}"]`)||node;
  if(target.selector){try{node=document.querySelector(target.selector)||node}catch{}}
  return node;
}
function navigateToV179(target){
  const character=ch(),owner=target.ownerId===character.id?character:(character.auxiliaryTabs||[]).find(entry=>entry.id===target.ownerId)||character;
  if(owner===character){app.className='app';activeAuxId=null;document.querySelectorAll('#mainTabs button').forEach(button=>button.classList.toggle('active',button.dataset.view==='build'))}else{if(isCompactNpcV179(owner))owner.presentationV179='full';openAux(owner.id)}
  const card=owner.layout?.find(entry=>entry.id===target.cardId||entry.type===target.cardType);if(card?.collapsed){card.collapsed=false;save()}renderCards();
  requestAnimationFrame(()=>requestAnimationFrame(()=>{const cardNode=card?document.querySelector(`article.card[data-id="${CSS.escape(card.id)}"]`):null,node=searchTargetNodeV179(target,cardNode);if(!node)return;for(const details of node.closest('details')?[node.closest('details')]:[])details.open=true;for(const details of node.querySelectorAll?.('details')||[])if(target.selector)details.open=true;node.classList.remove('search-target-v179');void node.offsetWidth;node.classList.add('search-target-v179');node.scrollIntoView({behavior:'smooth',block:'center',inline:'nearest'});const focusable=node.matches?.('input,select,textarea,button,[tabindex]')?node:node.querySelector?.('input,select,textarea,button,[tabindex]');if(focusable){if(!focusable.hasAttribute('tabindex')&&!focusable.matches('input,select,textarea,button'))focusable.tabIndex=-1;try{focusable.focus({preventScroll:true})}catch{}}setTimeout(()=>node.classList.remove('search-target-v179'),2100)}));
}
navigateToV177=navigateToV179;

function installGlobalSearchV179(){
  document.getElementById('globalSearchV177')?.remove();const host=el('div',{id:'globalSearchV177',class:'global-search-v177 global-search-v179 no-print',role:'search'}),input=el('input',{type:'search',placeholder:'Im Builder suchen …','aria-label':'Builder durchsuchen','aria-autocomplete':'list','aria-expanded':'false','aria-controls':'globalSearchResultsV179'}),clear=el('button',{type:'button',text:'×','aria-label':'Suche leeren'}),results=el('div',{id:'globalSearchResultsV179',class:'global-search-results-v177',role:'listbox',hidden:true}),box=el('div',{class:'global-search-box-v177'},[input,clear]);let matches=[],selected=-1;
  const close=()=>{results.hidden=true;input.setAttribute('aria-expanded','false');input.removeAttribute('aria-activedescendant');selected=-1};
  const select=index=>{selected=Math.max(0,Math.min(matches.length-1,index));[...results.querySelectorAll('[role=option]')].forEach((node,i)=>node.setAttribute('aria-selected',String(i===selected)));const active=results.querySelector(`[data-search-index="${selected}"]`);if(active){input.setAttribute('aria-activedescendant',active.id);active.scrollIntoView({block:'nearest'})}};
  const openEntry=entry=>{if(!entry)return;input.value=entry.label;close();navigateToV179(entry.target)};
  const draw=()=>{const query=normalizeSearchV177(input.value);if(!query){close();return}matches=searchIndexV177().map(entry=>({...entry,rank:rankSearchV177(entry,query)})).filter(entry=>entry.rank<99).sort((a,b)=>a.rank-b.rank||a.label.localeCompare(b.label,'de')).slice(0,16);results.replaceChildren();matches.forEach((entry,index)=>{const button=el('button',{id:`globalSearchOptionV179-${index}`,type:'button',class:'global-search-result-v177',role:'option','data-search-index':index,'aria-selected':'false'},[el('strong',{text:entry.label}),el('small',{text:`${entry.kind} · ${entry.owner}`})]);button.onmousedown=event=>event.preventDefault();button.onclick=()=>openEntry(entry);results.append(button)});if(!matches.length)results.append(el('p',{class:'muted',text:'Kein Treffer.'}));results.hidden=false;input.setAttribute('aria-expanded','true')};
  input.oninput=draw;input.onkeydown=event=>{if(event.key==='Escape'){close();return}if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();if(matches.length)select(selected<0?(event.key==='ArrowDown'?0:matches.length-1):selected+(event.key==='ArrowDown'?1:-1));return}if(event.key==='Enter'&&matches.length){event.preventDefault();openEntry(matches[selected>=0?selected:0])}};clear.onclick=()=>{input.value='';close();input.focus()};document.addEventListener('click',event=>{if(!host.contains(event.target))close()});host.append(box,results);document.body.append(host);
}
installGlobalSearchV179();

const runTestsBeforeV179=runTests;
function runTestsV179(){
  runTestsBeforeV179();let body=testResults.querySelector('tbody');if(!body){const table=el('table',{},[el('thead',{},[el('tr',{},['Test','Erwartet','Berechnet','Status'].map(value=>el('th',{text:value})))]),el('tbody')]);testResults.replaceChildren(table);body=table.querySelector('tbody')}
  for(const row of[...body.querySelectorAll('tr')])if(['Version 1.7.8','Schema 17','Revision r4: Schema 17'].includes(row.cells[0]?.textContent))row.remove();
  const tests=[],eq=(name,expected,actual)=>tests.push([name,expected,actual,expected===actual]);eq('Version 1.7.9',V179_VERSION,APP_VERSION);eq('Schema 18',V179_SCHEMA,SCHEMA_VERSION);
  const restOwner=newCharacter();restOwner.counters.A={max:7,current:1};restOwner.counters.L={max:9,current:2};restOwner.rationTracker={max:3,current:2,note:''};restOwner.combatRoundRemainderV178=4;refillOwnerV179(restOwner,false);eq('Normale Rast füllt Counter','7|9',`${restOwner.counters.A.current}|${restOwner.counters.L.current}`);eq('Normale Rast verbraucht keine Ration',2,restOwner.rationTracker.current);eq('Normale Rast setzt Rundenzähler zurück',0,restOwner.combatRoundRemainderV178);restOwner.counters.A.current=0;refillOwnerV179.busy=false;refillOwnerV179(restOwner,true);eq('Lagerrast verbraucht genau eine Ration',1,restOwner.rationTracker.current);eq('Lagerrast füllt Counter',7,restOwner.counters.A.current);restOwner.rationTracker.current=0;restOwner.counters.A.current=1;refillOwnerV179.busy=false;eq('Lagerrast ohne Ration blockiert',false,refillOwnerV179(restOwner,true));eq('Blockierte Lagerrast verändert Counter nicht',1,restOwner.counters.A.current);
  const armorOwner=newCharacter();armorOwner.equipment=[normalizeItemV174({name:'Eigene Rüstung',category:'custom',itemType:'armor',protection:3,quantity:2,equippedQuantity:2,loadState:'equipped',active:true,weightKg:2}),normalizeItemV174({name:'Katalogrüstung',category:'armor.body',itemType:'armor',protection:2,quantity:1,equippedQuantity:1,loadState:'equipped',active:true,weightKg:4})];eq('Eigene Rüstung zählt im Komplettwert',8,combatEquipmentSummaryV174(armorOwner).armorTotal);armorOwner.equipment[0].loadState='carried';eq('Mitgeführte eigene Rüstung zählt nicht',2,combatEquipmentSummaryV174(armorOwner).armorTotal);
  const contactState={appVersion:'1.7.8',schemaVersion:17,rulesVersion:7,characters:[newCharacter()],migrationLog:[]};const character=contactState.characters[0];character.layout.push(cardObject('contact',character.layout.length,12),cardObject('contact',character.layout.length+1,12));delete contactState.v179MigrationDone;ensureStateV179(contactState,true);const ids=contactCardsV179(character).map(card=>card.data.npcIdV179);eq('Kontaktkarten besitzen getrennte NPC-IDs',2,new Set(ids).size);const first=npcByIdV179(character,ids[0]),second=npcByIdV179(character,ids[1]);first.name='Erster Kontakt';eq('Kontaktdaten bleiben unabhängig','Neuer Kontakt',second.name);first.presentationV179='full';eq('Ausarbeitung behält dieselbe NPC-ID',ids[0],first.id);const once=JSON.stringify(contactState);ensureStateV179(contactState,true);eq('v1.7.9-Migration ist idempotent',once,JSON.stringify(contactState));
  eq('Alle Kataloggewichte vollständig',0,ITEM_CATALOG_V174.filter(item=>finiteOrNullV174(item.weightKg)===null||+item.weightKg<=0).length);eq('70 Gewichte als Systemschätzung markiert',70,ITEM_CATALOG_V174.filter(item=>item.weightSource==='system-estimate-v1.7.9').length);eq('Schwebende Suche installiert',true,!!document.querySelector('.global-search-v179'));const searchCharacter=ch(),searchNpc=createContactNpcV179(searchCharacter,{name:'Suchkontakt'}),searchCard=cardObject('contact',searchCharacter.layout.length,12);searchCard.data.npcIdV179=searchNpc.id;searchCharacter.layout.push(searchCard);eq('Kontakt in Suche enthalten',true,searchIndexV177().some(entry=>entry.kind==='Kontakt / NPC'&&entry.label==='Suchkontakt'));searchCharacter.layout=searchCharacter.layout.filter(card=>card.id!==searchCard.id);searchCharacter.auxiliaryTabs=searchCharacter.auxiliaryTabs.filter(owner=>owner.id!==searchNpc.id);
  for(const[name,expected,actual,ok]of tests)body.append(el('tr',{},[name,expected,actual,ok?'Bestanden':'Fehler'].map(value=>el('td',{text:String(value)}))));const remainingFailures=[...body.querySelectorAll('tr')].filter(row=>row.cells[row.cells.length-1]?.textContent==='Fehler');testsDialog.showModal();return tests.every(test=>test[3])&&!remainingFailures.length;
}
runTests=runTestsV179;testsBtn.onclick=runTestsV179;

state.appVersion=V179_VERSION;state.schemaVersion=V179_SCHEMA;state.rulesVersion=V179_RULES;save();renderAll();
Object.assign(window.Eberos,{version:V179_VERSION,schemaVersion:V179_SCHEMA,rulesVersion:V179_RULES,runTests:runTestsV179,ensureStateV179,refillOwnerV179,visibleAuxOwnersV179,contactCardsV179,npcByIdV179,navigateTo:navigateToV179,searchIndex:searchIndexV177});
