'use strict';

/* Global local-draft search: index every owner; navigate after layout settles. */
(()=>{
  const originalIndex=searchIndexV177;
  let cachedIndex=null,navigationEpoch=0;
  const text=value=>normalizeSearchV177(value).replace(/ae/g,'a').replace(/oe/g,'o').replace(/ue/g,'u');
  const words=value=>{const parts=text(value).split(/\s+/).filter(Boolean);return parts.length>1?parts.filter(word=>!['und','and'].includes(word)):parts;};
  const matches=(value,query)=>words(query).every(word=>text(value).includes(word));
  const normalizedEntries=new WeakMap();
  let lastQuery,needle,queryWords;
  const fieldCards={name:'identity',player:'identity',description:'identity',concept:'concept',summary:'concept',origin:'origin',family:'family',portrait:'portrait',notes:'notes',money:'gold',startMoneyExpression:'gold',rationTracker:'rations',possessions:'modules',disadvantages:'modules',advantages:'advantages',possessionModules:'possessionModules',income:'income',incomeSources:'income',rights:'rights',rightsEntries:'rights',equipment:'equipment',weapons:'equipment',armor:'equipment',items:'equipment',rations:'rations',startPackage:'startPackage',activeEffectsV177:'effects',location:'auxProfile',relationship:'auxProfile',availability:'auxProfile',npcType:'auxProfile',roleV179:'auxProfile'};
  const ignored=/^(?:id|.*Id|.*Ids|src|image|portrait|artFile|createdAt|updatedAt|.*Version|.*Revision|schema|migrations|migrationLog|sourceRecord|accounting)$/;
  function content(value,seen=new Set()) {
    if(typeof value==='string'||typeof value==='number')return String(value);
    if(!value||typeof value!=='object'||seen.has(value))return '';
    seen.add(value);
    return Object.entries(value).filter(([key])=>!ignored.test(key)).map(([,entry])=>content(entry,seen)).join(' ');
  }
  function owners(){return(state.characters||[]).flatMap(character=>[character,...(character.auxiliaryTabs||[])].map(owner=>({character,owner})));}
  searchIndexV177=function(){
    if(cachedIndex)return cachedIndex;
    const descriptors=owners(),byOwner=new Map(descriptors.map(entry=>[entry.owner.id,entry])),entries=[];
    const add=(descriptor,label,kind,target,body='')=>{
      const {character,owner}=descriptor;
      entries.push({label,kind,owner:owner.name||owner.type||'Hauptcharakter',target:{characterId:character.id,ownerId:owner.id,...target},search:normalizeSearchV177([label,kind,owner.name,character.name,body].join(' '))});
    };
    for(const raw of originalIndex()) {
      const entry={...raw,target:{...raw.target}},descriptor=byOwner.get(entry.target.ownerId);
      if(descriptor) {
        entry.target.characterId=descriptor.character.id;
        const skill=allSkillsV178(descriptor.owner).find(skill=>skill.name===entry.label);
        if(skill&&entry.target.cardType==='skills'){entry.target.skillId=skill.id;entry.target.selector=`tr[data-skill-id="${CSS.escape(skill.id)}"]`;}
        const power=POWER_ENTRIES_V176.find(power=>power.displayName===entry.label&&power.schoolLabel===entry.owner);
        const technique=COMBAT_ENTRIES_V178.find(technique=>technique.name===entry.label&&technique.skillName===entry.owner);
        if(power||technique){entry.target={...entry.target,...cardTargetV177(descriptor.owner,'skills'),skillId:(power||technique).skillId};if(power)entry.target.powerIdV1716=power.id;entry.target.selector=`tr[data-skill-id="${CSS.escape(entry.target.skillId)}"]`;}
      }
      entries.push(entry);
    }
    for(const descriptor of descriptors) {
      const {owner}=descriptor;
      if(owner.type!=='possession'&&typeof DEFENSE_HINT==='string') {
        add(descriptor,'Normale Abwehr','Regelhinweis',{...cardTargetV177(owner,'skills'),selector:'[data-normal-defense]'},DEFENSE_HINT);
      }
      add(descriptor,owner.name||owner.type||'Hauptcharakter','Reiter',{cardType:owner===descriptor.character?'identity':'auxProfile'},content({name:owner.name,description:owner.description,location:owner.location}));
      for(const card of owner.layout||[]) {
        const fields=Object.entries(owner).filter(([key])=>fieldCards[key]===card.type).map(([,value])=>content(value));
        const rendered=owner===activeLayoutOwner()?document.querySelector(`#sheet>.card[data-id="${CSS.escape(card.id)}"] .card-body`):null;
        const visibleContent=rendered?[rendered.textContent,...[...rendered.querySelectorAll('input,textarea')].map(node=>node.value)].join(' '):'';
        const calculated=card.type==='derived'?content(derived(owner)):'';
        add(descriptor,card.title||CARD_TYPES[card.type]||card.type,'Karte',{cardId:card.id,cardType:card.type},[card.description,content(card.data),content(owner.cardData?.[card.id]),visibleContent,calculated,...fields].join(' '));
      }
      for(const [key,type]of Object.entries(fieldCards)) {
        const body=content(owner[key]);if(!body.trim()||!(type in CARD_TYPES)||(owner.layout||[]).some(card=>card.type===type))continue;
        add(descriptor,CARD_TYPES[type],'Inhalt',{...cardTargetV177(owner,type)},body);
      }
      for(const skill of allSkillsV178(owner))add(descriptor,skill.name,skill.custom?'Eigene Fähigkeit':'Fähigkeit',{...cardTargetV177(owner,'skills'),skillId:skill.id,selector:`tr[data-skill-id="${CSS.escape(skill.id)}"]`},[skill.category,skill.attrs,skill.scope,skill.attributeReasonSearchV1715,owner.skills?.[skill.id]?.note].join(' '));
      for(const [id,name]of ATTRS)add(descriptor,`${name} (${id})`,'Grundwert',{...cardTargetV177(owner,'attributes'),selector:`[data-effect-target="${id}"]`},name);
      for(const [id,name]of COUNTERS)add(descriptor,`${name} (${id})`,'Counter',{...cardTargetV177(owner,'counters'),selector:`[data-effect-target="${id}"]`},name);
      for(const item of [...(owner.equipment||[]),...(owner.weapons||[]),...(owner.armor||[])])add(descriptor,item.name||'Unbenanntes Item','Item',{...cardTargetV177(owner,'equipment'),itemId:item.instanceId||item.id},content(item));
      for(const image of Array.isArray(owner.portrait)?owner.portrait:[])if(image.caption)add(descriptor,image.caption,'Bildunterschrift',{...cardTargetV177(owner,'portrait')},image.caption);
    }
    for(const tab of document.querySelectorAll('#mainTabs button[data-view]:not([hidden])'))if(tab.dataset.view!=='aux')entries.push({label:tab.textContent.trim(),kind:'Hauptreiter',owner:'Builder',target:{view:tab.dataset.view},search:normalizeSearchV177(tab.textContent)});
    const unique=new Map();for(const entry of entries){const target=entry.target,key=JSON.stringify([entry.label,entry.kind,target.characterId,target.ownerId,target.cardId,target.cardType,target.skillId||target.selector||target.itemId||target.effectId||target.view]);const previous=unique.get(key);if(previous)previous.search+=' '+entry.search;else unique.set(key,entry)}
    return cachedIndex=[...unique.values()];
  };
  const previousSave=save;save=function(){cachedIndex=null;return previousSave.apply(this,arguments)};
  const previousRender=renderAll;renderAll=function(){cachedIndex=null;return previousRender.apply(this,arguments)};
  const previousInvalidate=window.Eberos.invalidateSearchIndexV182;
  window.Eberos.invalidateSearchIndexV182=function(){cachedIndex=null;return previousInvalidate?.()};
  rankSearchV177=function(entry,query){
    if(query!==lastQuery){lastQuery=query;needle=text(query);queryWords=words(query);}
    let fields=normalizedEntries.get(entry);
    if(!fields){fields={label:text(entry.label),body:text(entry.search)};normalizedEntries.set(entry,fields);}
    if(fields.label===needle)return 0;
    if(fields.label.startsWith(needle))return 1;
    if(fields.label.includes(needle))return 2;
    if(queryWords.every(word=>fields.label.includes(word)))return 3;
    return queryWords.every(word=>fields.body.includes(word))?4:99;
  };

  function revealAncestors(node,card){for(let parent=node;parent&&parent!==card.parentElement;parent=parent.parentElement)if(parent instanceof HTMLDetailsElement)parent.open=true;}
  function targetNode(card,target){
    if(!card)return null;
    for(const [key,attribute]of [['effectId','data-effect-id'],['itemId','data-item-id'],['disadvantageId','data-disadvantage-id'],['advantageId','data-advantage-id']])if(target[key]){const found=card.querySelector(`[${attribute}="${CSS.escape(target[key])}"]`);if(found)return found;}
    if(target.selector){try{const found=card.querySelector(target.selector);if(found)return found}catch{}}
    if(target.query) {
      const fields=[...card.querySelectorAll('input:not([type="hidden"]),textarea,select')];
      const field=fields.find(node=>node.value&&matches(node.value,target.query));if(field)return field;
      const leaves=[...card.querySelectorAll('.card-body strong,.card-body p,.card-body span,.card-body td,.card-body summary')];
      const leaf=leaves.filter(node=>matches(node.textContent,target.query)).sort((a,b)=>a.textContent.length-b.textContent.length)[0];if(leaf)return leaf;
    }
    return card;
  }
  navigateToV179=function(target){
    const epoch=++navigationEpoch;
    if(target.view){const tab=[...document.querySelectorAll('#mainTabs button[data-view]')].find(tab=>tab.dataset.view===target.view&&!tab.hidden);tab?.click();return;}
    let descriptor=owners().find(entry=>entry.owner.id===target.ownerId&&(!target.characterId||entry.character.id===target.characterId));
    if(!descriptor)return;
    if(ch().id!==descriptor.character.id){state.activeCharacterId=descriptor.character.id;cachedIndex=null;}
    const {owner}=descriptor,isCharacter=owner===descriptor.character;
    activeAuxId=isCharacter?null:owner.id;app.className=isCharacter?'app':'app aux';
    if(!isCharacter&&isCompactNpcV179(owner))owner.presentationV179='full';
    let card=owner.layout?.find(card=>card.id===target.cardId)||owner.layout?.find(card=>card.type===target.cardType);
    if(!card&&target.cardType in CARD_TYPES){card=cardObject(target.cardType,owner.layout.length,12);owner.layout.push(card);}
    if(!card)return;
    card.collapsed=false;
    if(target.skillId&&owner.skillSortView)owner.skillSortView.attribute='';
    save();renderAll();
    if(isCharacter){document.querySelectorAll('#mainTabs button[data-view]').forEach(tab=>tab.classList.toggle('active',tab.dataset.view==='build'));}
    else openAux(owner.id);
    const cardNode=document.querySelector(`#sheet>.card[data-id="${CSS.escape(card.id)}"]`),node=targetNode(cardNode,target);
    if(!node)return;
    revealAncestors(node,cardNode);
    const focus=target.skillId?node.querySelector('input.skill-level'):node.matches('input,select,textarea,button,[tabindex]')?node:node.querySelector('input,select,textarea,button,[tabindex]');
    if(target.skillId){const scroll=node.closest('.scroll');if(scroll)scroll.scrollLeft=0;}
    // A search is an explicit navigation. Recompute its destination as skipped
    // cards are laid out; a smooth scroll to the first estimate is inaccurate.
    let frame=0,stable=0,focused=false;
    const align=()=>{
      if(epoch!==navigationEpoch||!node.isConnected)return;
      revealAncestors(node,cardNode);
      const header=document.querySelector('.sticky-shell-v188'),headerBottom=header&&getComputedStyle(header).position==='sticky'?Math.max(0,header.getBoundingClientRect().bottom):0;
      const rect=node.getBoundingClientRect(),height=Math.min(rect.height,innerHeight-headerBottom-24),desired=headerBottom+Math.max(12,(innerHeight-headerBottom-height)/2),delta=rect.top-desired;
      if(Math.abs(delta)<=1)stable++;else{stable=0;window.scrollTo({left:scrollX,top:Math.max(0,scrollY+delta),behavior:'instant'});}
      frame++;
      if(!focused&&(stable>=2||frame>=12)){
        focus?.focus({preventScroll:true});
        focused=true;stable=0;
      }
      // Focusing a row can materialize ancestor cards and move the page on the
      // following frame even with preventScroll. Verify its final position.
      if(frame<32&&(!focused||stable<4))requestAnimationFrame(align);
      else window.Eberos.lastSearchNavigation={ownerId:owner.id,cardId:card.id,skillId:target.skillId||null};
    };
    requestAnimationFrame(()=>requestAnimationFrame(align));
    node.classList.add('search-target-v179');setTimeout(()=>node.classList.remove('search-target-v179'),2100);
  };
  navigateToV177=navigateToV179;
  for(const name of ['wheel','touchstart','pointerdown','keydown'])document.addEventListener(name,()=>{navigationEpoch++},{passive:true,capture:true});

  // Reuse the movable/minimizable search window; paginate rather than discard
  // matches so every local tab remains reachable even with many identical names.
  const host=document.getElementById('globalSearchV177'),input=host.querySelector('input[type="search"]'),results=host.querySelector('[role="listbox"]');
  let found=[],selected=-1,shown=0,timer;
  const close=()=>{results.hidden=true;input.setAttribute('aria-expanded','false');input.removeAttribute('aria-activedescendant');selected=-1;};
  const open=entry=>{if(!entry)return;const query=input.value;input.value=entry.label;close();clearTimeout(timer);navigateToV179({...entry.target,query});};
  function append(){
    results.querySelector('[data-search-more]')?.remove();
    const end=Math.min(found.length,shown+60);
    for(let index=shown;index<end;index++){
      const entry=found[index],button=el('button',{id:`globalSearchOptionV179-${index}`,type:'button',class:'global-search-result-v177',role:'option','data-search-index':index,'aria-selected':'false'},[el('strong',{text:entry.label}),el('small',{text:`${entry.kind} · ${entry.owner}`})]);
      button.onmousedown=event=>event.preventDefault();button.onclick=()=>open(entry);results.append(button);
    }
    shown=end;if(shown<found.length)results.append(el('button',{type:'button','data-search-more':'',text:`Weitere Treffer anzeigen (${found.length-shown})`,onclick:event=>{event.stopPropagation();append();}}));
  }
  function draw(){clearTimeout(timer);timer=null;if(!words(input.value).length){found=[];close();return;}found=searchIndexV177().map(entry=>({...entry,rank:rankSearchV177(entry,input.value)})).filter(entry=>entry.rank<99).sort((a,b)=>a.rank-b.rank||a.label.localeCompare(b.label,'de')||a.owner.localeCompare(b.owner,'de'));selected=-1;shown=0;results.replaceChildren();append();if(!found.length)results.append(el('p',{class:'muted',text:'Kein Treffer.'}));results.hidden=false;input.setAttribute('aria-expanded','true');}
  input.oninput=()=>{clearTimeout(timer);timer=setTimeout(draw,110);};
  input.onkeydown=event=>{
    if(event.key==='Escape'){clearTimeout(timer);close();return;}
    if(event.key==='Enter'){event.preventDefault();if(timer)draw();if(input.value.trim())open(found[selected>=0?selected:0]);return;}
    if(['ArrowDown','ArrowUp'].includes(event.key)){event.preventDefault();if(timer)draw();if(!found.length)return;selected=Math.max(0,Math.min(found.length-1,selected<0?(event.key==='ArrowDown'?0:found.length-1):selected+(event.key==='ArrowDown'?1:-1)));while(shown<=selected)append();for(const node of results.querySelectorAll('[role="option"]'))node.setAttribute('aria-selected',String(+node.dataset.searchIndex===selected));const active=results.querySelector(`[data-search-index="${selected}"]`);input.setAttribute('aria-activedescendant',active.id);active.scrollIntoView({block:'nearest'});}
  };
  host.querySelector('[aria-label="Suche leeren"]').onclick=()=>{clearTimeout(timer);input.value='';found=[];close();input.focus();};
  document.addEventListener('click',event=>{if(!host.contains(event.target))close();});
  for(const name of ['input','change'])document.addEventListener(name,event=>{if(!host.contains(event.target)){cachedIndex=null;previousInvalidate?.();}},{capture:true});
  Object.assign(window.Eberos,{searchNavigationRevision:'all-local-tabs-r1'});
})();
