'use strict';

/* Spielerzugang: Beitritt, Figurenabgabe und spielabendbezogene CBP. */
(function installCampaignEntry(global){
  const states=new WeakMap();
  const text=(node,value)=>{if(node)node.textContent=value};
  const show=(node,visible)=>{if(node)node.hidden=!visible};
  const clear=node=>node?.replaceChildren();
  const button=(label,action)=>{const node=document.createElement('button');node.type='button';node.textContent=label;node.addEventListener('click',action);return node};
  const listItem=(label,...controls)=>{const item=document.createElement('li');item.append(document.createTextNode(label),...controls);return item};
  function friendlyError(error){const message=String(error?.message||'');if(error?.code==='CAMPAIGN_BACKEND_NOT_CONFIGURED')return'Das Supabase-Testprojekt ist noch nicht verbunden.';if(error?.status===429)return'Zu viele Versuche. Bitte warte kurz und versuche es später erneut.';if(/invalid login credentials/i.test(message))return'E-Mail-Adresse oder Passwort ist falsch.';if(/email not confirmed/i.test(message))return'Bitte bestätige zuerst deine E-Mail-Adresse und melde dich danach mit deinem Passwort an.';if(/user already registered/i.test(message))return'Für diese E-Mail-Adresse besteht bereits ein Konto. Nutze „Passwort vergessen“, falls du noch kein Passwort hast.';if(/password should be at least/i.test(message))return'Das Passwort erfüllt die Mindestlänge noch nicht.';return message||'Die Kampagnenaktion konnte nicht abgeschlossen werden.'}
  function setBusy(state,busy){state.busy=busy;for(const control of state.dialog.querySelectorAll('button,input,textarea,select'))if(!control.matches('[data-close]'))control.disabled=busy;if(!busy)for(const submit of state.dialog.querySelectorAll('[data-migration-submit]'))submit.disabled=!submit.closest('li')?.querySelector('[data-migration-consent]')?.checked}
  function statusLabel(value){return({local_draft:'Lokaler Entwurf · noch nicht eingereicht',claimed:'Zugeordnet',submitted:'Eingereicht',approved_locked:'Bestätigt & fixiert',change_pending:'Änderung wartet',rejected:'Abgelehnt',retired:'Im Ruhestand'})[value]||value||'Unbekannt'}
  function dateLabel(value){if(!value)return'ohne Datum';try{return new Intl.DateTimeFormat('de-DE').format(new Date(`${value}T12:00:00`))}catch{return value}}
  function characterName(character){return String(character?.public_data?.name||character?.name||'').trim()||'Unbenannte Figur'}
  function campaignName(state,campaignId){return state.campaigns?.find(campaign=>campaign.campaign_id===campaignId)?.name||'Unbekannte Kampagne'}
  function isOwnedCharacter(state,characterId){return !!characterId&&state.playerCharacters?.some(character=>character.character_id===characterId)}
  function renderLocalCharacter(state){
    const character=state.character;const name=String(character?.name||'').trim()||'Unbenannte Figur';
    text(state.dialog.querySelector('[data-campaign-character]'),name);
    text(state.dialog.querySelector('[data-campaign-status]'),statusLabel(character?.campaignProfile?.status||'local_draft'));
  }
  function renderLocalCharacters(state){
    const list=state.dialog.querySelector('[data-local-character-list]');clear(list);if(!list)return;
    const characters=typeof state.listLocalCharacters==='function'?state.listLocalCharacters():[];
    if(!characters.length){list.append(listItem('Auf diesem Gerät ist noch kein Entwurf vorhanden.'));return}
    for(const character of characters){
      const active=character.id===state.character?.id,profile=character.campaignProfile||{},linked=isOwnedCharacter(state,character.id);
      const relation=linked?` · ${campaignName(state,state.playerCharacters.find(row=>row.character_id===character.id).campaign_id)}`:profile.status==='local_draft'||!profile.status?' · nur auf diesem Gerät':state.authUser?' · nicht mit diesem Konto bestätigt':' · Konto noch nicht geprüft';
      const label=`${String(character.name||'').trim()||'Unbenannte Figur'} · ${statusLabel(profile.status||'local_draft')}${relation}${active?' · aktuell':''}`;
      list.append(listItem(label,...(active||typeof state.selectLocalCharacter!=='function'?[]:[button('Auf diesem Gerät auswählen',()=>selectLocalCharacter(state,character.id))])));
    }
  }
  function renderSelectedCampaign(state,campaign){
    const root=state.dialog.querySelector('[data-selected-campaign]');clear(root);if(!root)return;
    if(!campaign){root.append(document.createTextNode('Wähle eine Kampagne.'));return}
    const heading=document.createElement('h3'),summary=document.createElement('p'),details=document.createElement('dl'),dayLabel=document.createElement('dt'),day=document.createElement('dd'),roleLabel=document.createElement('dt'),role=document.createElement('dd'),notesHeading=document.createElement('h4'),notes=document.createElement('p');
    heading.textContent=campaign.name||'Unbenannte Kampagne';summary.textContent=campaign.summary||'Keine öffentliche Kurzbeschreibung.';dayLabel.textContent='Kampagnentag';day.textContent=String(campaign.current_day||1);roleLabel.textContent='Deine Rolle';role.textContent=campaign.role==='owner'?'Spielleitung':campaign.role==='game_master'?'Co-Spielleitung':'Spieler';notesHeading.textContent='Hinweise der Spielleitung';notes.className='campaign-player-notes';notes.textContent=campaign.player_notes||'Keine Hinweise veröffentlicht.';details.append(dayLabel,day,roleLabel,role);root.append(heading,summary,details,notesHeading,notes);renderCampaignCalendar(state,root,campaign);renderCampaignAstronomy(state,root,campaign);
    renderKnownCreatures(state,root,campaign);
  }
  function renderCampaignCalendar(state,root,campaign){const section=document.createElement('section'),heading=document.createElement('h4'),body=document.createElement('div'),campaignId=campaign.campaign_id;section.dataset.campaignCalendar='';heading.textContent='Kalender & Wetter';section.append(heading,body);root.append(section);const row=state.calendarByCampaign.get(campaignId),error=state.calendarErrors.get(campaignId);if(error){body.append(listItem(`Kalender und Wetter konnten nicht geladen werden: ${friendlyError(error)}`,button('Erneut laden',()=>{state.calendarErrors.delete(campaignId);loadCampaignCalendar(state,campaignId)})));return}if(!row){body.textContent='Kalender und Wetter werden geladen …';loadCampaignCalendar(state,campaignId);return}const facts=document.createElement('dl');for(const [label,value] of [['Kampagnentag',row.current_day],['Jahr',row.calendar_year],['Jahreszeit',row.season],['Tag der Jahreszeit',`${row.season_day} / 90`]]){const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=String(value);facts.append(dt,dd)}body.append(facts);if(row.season_warning){const warning=document.createElement('p');warning.className='notice';warning.textContent=row.season_warning;body.append(warning)}const weather=document.createElement('p');weather.className='notice';weather.textContent=row.weather_id?`${row.card_name||'Aktuelles Wetter'} · noch ${row.weather_remaining_days} Tag(e)${row.public_effect?` · ${row.public_effect}`:''}`:'Derzeit ist keine Wetterkarte aktiv.';body.append(weather)}
  function loadCampaignCalendar(state,campaignId,{force=false}={}){if(!campaignId||typeof state.repository.listCampaignCalendar!=='function')return Promise.resolve();if(!force&&(state.calendarByCampaign.has(campaignId)||state.calendarQueries.has(campaignId)))return state.calendarQueries.get(campaignId)||Promise.resolve();ensurePlayerLiveSync(state);const authEpoch=state.authEpoch,generation=state.calendarGeneration,query=Promise.resolve().then(()=>state.repository.listCampaignCalendar(campaignId)).then(rows=>{if(authEpoch!==state.authEpoch||generation!==state.calendarGeneration)return;const row=Array.isArray(rows)?rows[0]:null;if(row)state.calendarByCampaign.set(campaignId,row);else state.calendarByCampaign.delete(campaignId);state.calendarErrors.delete(campaignId);if(state.selectedCampaignId===campaignId){const campaign=state.campaigns.find(entry=>entry.campaign_id===campaignId);if(campaign&&row)campaign.current_day=row.current_day;renderSelectedCampaign(state,campaign)}}).catch(error=>{if(authEpoch!==state.authEpoch||generation!==state.calendarGeneration)return;state.calendarErrors.set(campaignId,error);if(state.selectedCampaignId===campaignId)renderSelectedCampaign(state,state.campaigns.find(entry=>entry.campaign_id===campaignId))}).finally(()=>{if(state.calendarQueries.get(campaignId)===query)state.calendarQueries.delete(campaignId)});state.calendarQueries.set(campaignId,query);return query}
  const astronomySelectionKey=(campaignId,characterId)=>`${campaignId||''}|${characterId||''}`;
  function renderCampaignAstronomy(state,root,campaign){const section=document.createElement('section'),heading=document.createElement('h4'),list=document.createElement('ul'),campaignId=campaign.campaign_id,characterId=state.selectedServerCharacterId,key=astronomySelectionKey(campaignId,characterId);section.dataset.campaignAstronomy='';heading.textContent='Astronomische Erscheinungen';section.append(heading,list);root.append(section);if(!characterId){list.append(listItem('Wähle eine bestätigte Kampagnenfigur. Astronomiewissen wird niemals aus einem lokalen Entwurf abgeleitet.'));return}if(typeof state.repository.listCampaignAstronomy!=='function'){list.append(listItem('Astronomiewissen ist in dieser App-Fassung noch nicht verbunden.'));return}const error=state.astronomyErrors.get(key),rows=state.astronomyBySelection.get(key);if(error){list.append(listItem(`Astronomiewissen konnte nicht geladen werden: ${friendlyError(error)}`,button('Erneut laden',()=>{state.astronomyErrors.delete(key);loadCampaignAstronomy(state,campaignId,characterId,{force:true})})));return}if(!rows){list.append(listItem('Astronomiewissen wird aus der bestätigten Figurenrevision berechnet …'));loadCampaignAstronomy(state,campaignId,characterId);return}if(!rows.length){list.append(listItem('Am aktuellen Kampagnentag ist keine freigegebene astronomische Erscheinung sichtbar.'));return}const effective=Number(rows[0]?.effective_astronomy)||0,tier=effective>=15?'hoch':effective>=10?'mittel':effective>=5?'niedrig':'offensichtlich';list.append(listItem(`Wirksame Astronomie & Mathematik: ${effective} · Informationsstufe ${tier}`));const events=new Map;for(const row of rows){if(!events.has(row.event_id))events.set(row.event_id,[]);events.get(row.event_id).push(row)}for(const eventRows of events.values()){const event=document.createElement('li'),title=document.createElement('strong'),levels=document.createElement('ul');title.textContent=eventRows.some(row=>row.information_level==='low')?'Erkannte Himmelserscheinung':'Sichtbare Himmelserscheinung';event.append(title,levels);for(const row of eventRows){const label=({obvious:'Offensichtlich',low:'Niedrig',medium:'Mittel',high:'Hoch'})[row.information_level]||'Information';levels.append(listItem(`${label}: ${row.information_text}`))}list.append(event)}}
  function loadCampaignAstronomy(state,campaignId,characterId,{force=false}={}){if(!campaignId||!characterId||typeof state.repository.listCampaignAstronomy!=='function')return Promise.resolve();ensurePlayerLiveSync(state);const key=astronomySelectionKey(campaignId,characterId);if(!force&&(state.astronomyBySelection.has(key)||state.astronomyQueries.has(key)))return state.astronomyQueries.get(key)||Promise.resolve();const authEpoch=state.authEpoch,generation=state.astronomyGeneration,query=Promise.resolve().then(()=>state.repository.listCampaignAstronomy(campaignId,characterId)).then(rows=>{if(authEpoch!==state.authEpoch||generation!==state.astronomyGeneration)return;state.astronomyBySelection.set(key,Array.isArray(rows)?rows:[]);state.astronomyErrors.delete(key);if(state.selectedCampaignId===campaignId&&state.selectedServerCharacterId===characterId)renderSelectedCampaign(state,state.campaigns.find(entry=>entry.campaign_id===campaignId))}).catch(error=>{if(authEpoch!==state.authEpoch||generation!==state.astronomyGeneration)return;state.astronomyErrors.set(key,error);if(state.selectedCampaignId===campaignId&&state.selectedServerCharacterId===characterId)renderSelectedCampaign(state,state.campaigns.find(entry=>entry.campaign_id===campaignId))}).finally(()=>{if(state.astronomyQueries.get(key)===query)state.astronomyQueries.delete(key)});state.astronomyQueries.set(key,query);return query}
  function renderKnownCreatures(state,root,campaign){
    const section=document.createElement('section'),heading=document.createElement('h4'),list=document.createElement('ul'),campaignId=campaign.campaign_id;
    section.dataset.knownCreatures='';heading.textContent='Bekannte Wesen';section.append(heading,list);root.append(section);
    if(typeof state.repository.listKnownCampaignCreatures!=='function'){list.append(listItem('Noch keine Weseninformationen veröffentlicht.'));return}
    const rows=state.knownCreatures.get(campaignId),error=state.creatureErrors.get(campaignId);
    if(rows){const visible=rows.filter(row=>row.campaign_id===campaignId&&['known','partial'].includes(row.visibility));if(!visible.length)list.append(listItem('Noch keine Weseninformationen veröffentlicht.'));for(const row of visible){const name=String(row.player_name||'Unbekanntes Wesen'),summary=String(row.player_summary||'').trim();list.append(listItem(`${name}${summary?` · ${summary}`:''}`))}return}
    if(error){list.append(listItem(`Weseninformationen konnten nicht geladen werden: ${friendlyError(error)}`,button('Erneut laden',()=>{state.creatureErrors.delete(campaignId);renderSelectedCampaign(state,campaign)})));return}
    list.append(listItem('Bekannte Wesen werden geladen …'));
    if(state.creatureQueries.has(campaignId))return;
    const authEpoch=state.authEpoch,generation=state.creatureGeneration,query=Promise.resolve().then(()=>state.repository.listKnownCampaignCreatures(campaignId)).then(result=>{
      if(authEpoch!==state.authEpoch||generation!==state.creatureGeneration)return;state.knownCreatures.set(campaignId,Array.isArray(result)?result:[]);if(state.selectedCampaignId===campaignId)renderSelectedCampaign(state,campaign)
    }).catch(error=>{if(authEpoch!==state.authEpoch||generation!==state.creatureGeneration)return;state.creatureErrors.set(campaignId,error);if(state.selectedCampaignId===campaignId)renderSelectedCampaign(state,campaign)}).finally(()=>{if(state.creatureQueries.get(campaignId)===query)state.creatureQueries.delete(campaignId)});
    state.creatureQueries.set(campaignId,query);
  }

  function updateSubmissionPreview(state){
    const preview=state.dialog.querySelector('[data-submit-preview]');if(!preview)return;
    try{const payload=state.submissionFactory?.(),costs=payload?.clientCosts||{};text(preview,`${payload?.character?.name||'Unbenannte Figur'} · Schema ${payload?.schemaVersion} · Regelstand ${payload?.rulesVersion} · ${costs.spent??'?'} / ${costs.total??'?'} CBP · Rest ${costs.rest??'?'}`);preview.classList.toggle('error',false)}catch(error){text(preview,friendlyError(error));preview.classList.toggle('error',true)}
  }
  function renderCampaigns(state,campaigns){
    const list=state.dialog.querySelector('[data-campaign-list]');clear(list);
    if(!campaigns.length){state.selectedCampaign=null;list?.append(listItem('Noch keine Kampagne zugeordnet.'));renderSelectedCampaign(state,null);return}
    const selected=campaigns.find(campaign=>campaign.campaign_id===state.selectedCampaignId)||campaigns[0];state.selectedCampaignId=selected.campaign_id;state.selectedCampaign=selected;
    for(const campaign of campaigns){
      const role=campaign.role==='owner'?'Spielleitung':campaign.role==='game_master'?'Co-Spielleitung':'Spieler';
      list?.append(listItem(`${campaign.name||'Unbenannte Kampagne'} · ${role} · Tag ${campaign.current_day||1}${campaign.campaign_id===state.selectedCampaignId?' · ausgewählt':''}`,...(campaign.campaign_id===state.selectedCampaignId?[]:[button('Auswählen',()=>selectCampaign(state,campaign))])));
    }
    renderSelectedCampaign(state,selected)
  }
  function renderPlayerCharacters(state,characters){
    const list=state.dialog.querySelector('[data-player-characters]');clear(list);
    if(!characters.length){list?.append(listItem('Noch keine Figur eingereicht.'));return}
    for(const character of characters){
      const selected=character.character_id===state.selectedServerCharacterId;
      const label=`${characterName(character)} · ${campaignName(state,character.campaign_id)} · ${statusLabel(character.status)} · Revision ${character.revision||0}${character.rejection_reason?` · ${character.rejection_reason}`:''}${selected?' · ausgewählt':''}`;
      const controls=selected?[]:[button('Figur ansehen',()=>selectPlayerCharacter(state,character))];
      if(state.hasLocalCharacterId?.(character.character_id)&&typeof state.selectLocalCharacter==='function'&&character.character_id!==state.character?.id)controls.push(button('Auf diesem Gerät auswählen',()=>selectLocalCharacter(state,character.character_id)));
      list?.append(listItem(label,...controls));
    }
  }
  function renderViewedCharacter(state){
    const selected=state.playerCharacters?.find(character=>character.character_id===state.selectedServerCharacterId);
    text(state.dialog.querySelector('[data-viewed-character]'),selected?`Ausgewählte Kampagnenfigur: ${characterName(selected)} · ${campaignName(state,selected.campaign_id)} · ${statusLabel(selected.status)}`:'Für diese Kampagne ist noch keine eingereichte Figur ausgewählt. Lokale Entwürfe erhalten keine Spielabend-CBP.');
  }
  function ensureLootList(state){
    let list=state.dialog.querySelector('[data-character-loot]');if(list)return list;
    const sessions=state.dialog.querySelector('[data-character-sessions]');if(!sessions)return null;
    const section=document.createElement('section');section.className='campaign-loot';
    const heading=document.createElement('h4');heading.textContent='Offene Beutezugänge dieser Figur';
    const explanation=document.createElement('p');explanation.className='muted';explanation.textContent='Beute kostet keine CBP. Erst wenn du sie annimmst, erscheint sie im Kampagneninventar. Deine lokalen Entwürfe ändern sich dadurch nicht automatisch.';
    list=document.createElement('ul');list.dataset.characterLoot='';
    const inventoryHeading=document.createElement('h4');inventoryHeading.textContent='Kampagneninventar';
    const inventoryNote=document.createElement('p');inventoryNote.className='muted';inventoryNote.textContent='Hier gespeicherte Ausrüstung gehört zur Kampagnenfigur. Regelwerte im lokalen Charakterbogen werden durch das Ausrüsten noch nicht automatisch neu berechnet.';
    const inventory=document.createElement('ul');inventory.dataset.characterCampaignInventory='';
    section.append(heading,explanation,list,inventoryHeading,inventoryNote,inventory);sessions.after(section);return list;
  }
  function renderCharacterLoot(state,rows){
    const list=ensureLootList(state);clear(list);if(!list)return;
    const characterId=state.selectedServerCharacterId,campaignId=state.selectedCampaignId;
    if(!characterId){list.append(listItem('Wähle eine eingereichte Figur, um ihre Beutezugänge zu sehen.'));return}
    const safeRows=(Array.isArray(rows)?rows:[]).filter(row=>row.character_id===characterId&&row.campaign_id===campaignId&&row.status==='pending');
    if(!safeRows.length){list.append(listItem('Keine offenen Beutezugänge.'));return}
    for(const row of safeRows){
      const name=String(row.item_name||'Unbenannter Gegenstand'),description=String(row.item_description||'').trim(),quantity=Number(row.quantity)||1;
      const label=`${quantity}× ${name}${description?` · ${description}`:''} · wartet auf deine Übernahme`;
      list.append(listItem(label,button('Für Figur übernehmen',()=>claimCreatureLoot(state,row))));
    }
  }
  function renderCampaignInventory(state,rows){
    const list=state.dialog.querySelector('[data-character-campaign-inventory]');clear(list);if(!list)return;
    const characterId=state.selectedServerCharacterId,campaignId=state.selectedCampaignId;
    if(!characterId){list.append(listItem('Wähle eine eingereichte Figur, um ihr Kampagneninventar zu sehen.'));return}
    const safeRows=(Array.isArray(rows)?rows:[]).filter(row=>row.character_id===characterId&&row.campaign_id===campaignId);
    if(!safeRows.length){list.append(listItem('Noch keine Beute ins Kampagneninventar übernommen.'));return}
    for(const row of safeRows){
      const name=String(row.item_name||'Unbenannter Gegenstand'),description=String(row.item_description||'').trim(),quantity=Number(row.quantity)||1;
      const loadState=row.load_state==='equipped'?`${row.equipped_quantity||0} ausgerüstet`:row.load_state==='stored'?'eingelagert':'mitgeführt';
      const item=listItem(`${quantity}× ${name}${description?` · ${description}`:''} · ${loadState}`);
      if(typeof state.repository.setCharacterCampaignInventoryLoad==='function'&&isOwnedCharacter(state,row.character_id)){
        const equippedInput=document.createElement('input');equippedInput.type='number';equippedInput.min='1';equippedInput.max=String(quantity);equippedInput.step='1';equippedInput.value=String(row.equipped_quantity>0?row.equipped_quantity:1);equippedInput.setAttribute('aria-label',`Anzahl zum Ausrüsten: ${name}`);
        const equipLabel=document.createElement('label');equipLabel.append('Anzahl ',equippedInput);
        item.append(equipLabel,button(row.load_state==='equipped'?'Ausrüstung ändern':'Ausrüsten',()=>{
          const count=Number(equippedInput.value);if(!Number.isInteger(count)||count<1||count>quantity){text(state.message,`Bitte wähle für ${name} eine Anzahl zwischen 1 und ${quantity}.`);return}
          setCampaignInventoryLoad(state,row,'equipped',count);
        }));
        if(row.load_state==='equipped')item.append(button('Ablegen',()=>setCampaignInventoryLoad(state,row,'carried',0)));
        if(row.load_state!=='stored')item.append(button('Einlagern',()=>setCampaignInventoryLoad(state,row,'stored',0)));
        else item.append(button('Mitführen',()=>setCampaignInventoryLoad(state,row,'carried',0)));
      }
      list.append(item);
    }
  }
  async function loadSelectedLoot(state){
    const characterId=state.selectedServerCharacterId,request=++state.lootRequest;
    const list=ensureLootList(state),inventory=state.dialog.querySelector('[data-character-campaign-inventory]');clear(list);clear(inventory);
    if(!characterId){renderCharacterLoot(state,[]);renderCampaignInventory(state,[]);return}
    list?.append(listItem('Beutezugänge werden geladen …'));inventory?.append(listItem('Kampagneninventar wird geladen …'));
    const pending=typeof state.repository.listCharacterLoot==='function'
      ?Promise.resolve().then(()=>state.repository.listCharacterLoot(characterId))
      :Promise.reject(new Error('Beutezugänge sind hier noch nicht verfügbar.'));
    const accepted=typeof state.repository.listCharacterCampaignInventory==='function'
      ?Promise.resolve().then(()=>state.repository.listCharacterCampaignInventory(characterId))
      :Promise.reject(new Error('Das Kampagneninventar ist hier noch nicht verfügbar.'));
    const [pendingResult,acceptedResult]=await Promise.allSettled([pending,accepted]);
    if(request!==state.lootRequest||characterId!==state.selectedServerCharacterId)return;
    if(pendingResult.status==='fulfilled')renderCharacterLoot(state,pendingResult.value);
    else{clear(list);list?.append(listItem(`Offene Beutezugänge konnten nicht geladen werden: ${friendlyError(pendingResult.reason)}`,button('Erneut laden',()=>loadSelectedLoot(state))))}
    if(acceptedResult.status==='fulfilled')renderCampaignInventory(state,acceptedResult.value);
    else{clear(inventory);inventory?.append(listItem(`Kampagneninventar konnte nicht geladen werden: ${friendlyError(acceptedResult.reason)}`,button('Erneut laden',()=>loadSelectedLoot(state))))}
  }
  async function claimCreatureLoot(state,row){
    if(row.character_id!==state.selectedServerCharacterId||row.campaign_id!==state.selectedCampaignId||!isOwnedCharacter(state,row.character_id)){text(state.message,'Bitte wähle zuerst deine eigene Kampagnenfigur aus.');return}
    const campaignId=state.selectedCampaignId,characterId=state.selectedServerCharacterId,authEpoch=state.authEpoch;
    try{await runBusy(state,async()=>{
      await state.repository.claimCreatureLoot(row.receipt_id);
      if(campaignId!==state.selectedCampaignId||characterId!==state.selectedServerCharacterId||authEpoch!==state.authEpoch)return;
      await loadSelectedLoot(state);
      if(campaignId===state.selectedCampaignId&&characterId===state.selectedServerCharacterId&&authEpoch===state.authEpoch)
        text(state.message,'Beute für diese Figur übernommen. Sie bleibt im Kampagneninventar; deine lokalen Entwürfe und CBP wurden nicht verändert.');
    })}catch{}
  }
  async function setCampaignInventoryLoad(state,row,loadState,equippedQuantity){
    if(row.character_id!==state.selectedServerCharacterId||row.campaign_id!==state.selectedCampaignId||!isOwnedCharacter(state,row.character_id)){text(state.message,'Bitte wähle zuerst deine eigene Kampagnenfigur aus.');return}
    const campaignId=state.selectedCampaignId,characterId=state.selectedServerCharacterId,authEpoch=state.authEpoch;
    try{await runBusy(state,async()=>{
      await state.repository.setCharacterCampaignInventoryLoad(row.inventory_item_id,loadState,equippedQuantity,row.revision);
      if(campaignId!==state.selectedCampaignId||characterId!==state.selectedServerCharacterId||authEpoch!==state.authEpoch)return;
      await loadSelectedLoot(state);
      if(campaignId===state.selectedCampaignId&&characterId===state.selectedServerCharacterId&&authEpoch===state.authEpoch)
        text(state.message,loadState==='equipped'?'Ausrüstung im Kampagneninventar gespeichert. Lokale Regelwerte wurden nicht automatisch verändert.':'Ausrüstungszustand im Kampagneninventar gespeichert.');
    })}catch{}
  }
  function ensurePlayerLivePanel(state){let panel=state.dialog.querySelector('[data-character-live-state]');if(panel)return panel;const anchor=ensureLootList(state)?.closest('section')||state.dialog.querySelector('[data-character-sessions]');if(!anchor)return null;panel=document.createElement('section');panel.dataset.characterLiveState='';panel.className='campaign-live-state';panel.append(document.createElement('hr'));const title=document.createElement('h3');title.textContent='Live-Zustand';const note=document.createElement('p');note.className='muted';note.textContent='Diese Ansicht liest denselben serverseitigen Counter- und activeEffectsV177-Zustand wie die Spielleitung. Dauerhafte Maxima und andere fixierte Revisionsdaten werden hier nicht überschrieben.';const sync=document.createElement('p');sync.className='muted';sync.dataset.characterLiveSync='';sync.setAttribute('role','status');const context=document.createElement('div');context.dataset.characterLiveContext='';const counters=document.createElement('ul');counters.dataset.characterLiveCounters='';const effects=document.createElement('ul');effects.dataset.characterLiveEffects='';const actions=document.createElement('ul');actions.dataset.characterLiveActions='';panel.append(title,note,sync,context,document.createElement('h4'),counters,document.createElement('h4'),effects,document.createElement('h4'),actions);const headings=panel.querySelectorAll('h4');headings[0].textContent='Aktuelle Counter';headings[1].textContent='Aktive Effekte';headings[2].textContent='Letzte nachvollziehbare Änderungen';anchor.after(panel);renderPlayerLiveSyncStatus(state);return panel}
  function renderPlayerLiveSyncStatus(state){const node=state.dialog.querySelector('[data-character-live-sync]');if(!node)return;if(!state.liveSync){text(node,'');return}if(state.liveSyncStatus==='SUBSCRIBED')text(node,'Geräteabgleich aktiv: Änderungen der Spielleitung werden automatisch neu geladen.');else if(['CHANNEL_ERROR','TIMED_OUT','CLOSED'].includes(state.liveSyncStatus))text(node,'Geräteabgleich unterbrochen. Manuelles erneutes Laden bleibt verfügbar.');else if(state.liveSyncCampaignId)text(node,'Geräteabgleich wird verbunden …');else text(node,'Geräteabgleich pausiert.')}
  function stopPlayerLiveSync(state){state.liveSyncGeneration=(state.liveSyncGeneration||0)+1;state.liveSyncCampaignId=null;state.liveSyncStatus=null;state.liveSyncRefreshPending=false;const unsubscribe=state.liveSyncUnsubscribe;state.liveSyncUnsubscribe=null;try{const result=unsubscribe?unsubscribe():state.liveSync?.unsubscribe?.();Promise.resolve(result).catch(()=>{})}catch{}renderPlayerLiveSyncStatus(state)}
  function requestPlayerLiveSyncRefresh(state,campaignId){if(campaignId!==state.selectedCampaignId||campaignId!==state.liveSyncCampaignId)return;state.calendarByCampaign.delete(campaignId);if(state.selectedServerCharacterId)state.astronomyBySelection.delete(astronomySelectionKey(campaignId,state.selectedServerCharacterId));state.liveSyncRefreshPending=true;if(state.liveSyncRefreshing)return;state.liveSyncRefreshing=true;Promise.resolve().then(async()=>{while(state.liveSyncRefreshPending&&campaignId===state.selectedCampaignId&&campaignId===state.liveSyncCampaignId){state.liveSyncRefreshPending=false;const tasks=[loadCampaignCalendar(state,campaignId,{force:true}),loadSelectedPlaces(state)];if(state.selectedServerCharacterId)tasks.push(loadCampaignAstronomy(state,campaignId,state.selectedServerCharacterId,{force:true}),loadSelectedLive(state),loadSelectedLoot(state));await Promise.allSettled(tasks)}}).finally(()=>{state.liveSyncRefreshing=false;if(state.liveSyncRefreshPending)requestPlayerLiveSyncRefresh(state,campaignId)})}
  async function ensurePlayerLiveSync(state){const campaignId=state.selectedCampaignId;if(!state.liveSync||!campaignId||typeof state.liveSync.subscribeCampaignLive!=='function')return;if(state.liveSyncCampaignId===campaignId&&(state.liveSyncUnsubscribe||['CONNECTING','SUBSCRIBED'].includes(state.liveSyncStatus)))return;stopPlayerLiveSync(state);const generation=++state.liveSyncGeneration;state.liveSyncCampaignId=campaignId;state.liveSyncStatus='CONNECTING';renderPlayerLiveSyncStatus(state);try{const unsubscribe=await state.liveSync.subscribeCampaignLive(campaignId,()=>requestPlayerLiveSyncRefresh(state,campaignId),{onStatus:status=>{if(generation!==state.liveSyncGeneration||campaignId!==state.selectedCampaignId)return;state.liveSyncStatus=status;renderPlayerLiveSyncStatus(state)}});if(generation!==state.liveSyncGeneration||campaignId!==state.selectedCampaignId){await Promise.resolve(unsubscribe?.()).catch(()=>{});return}state.liveSyncUnsubscribe=unsubscribe}catch{if(generation!==state.liveSyncGeneration)return;state.liveSyncStatus='CHANNEL_ERROR';renderPlayerLiveSyncStatus(state)}}
  function renderPlayerLiveState(state,context=null,live=null,actions=[],error=null){const panel=ensurePlayerLivePanel(state),contextNode=panel?.querySelector('[data-character-live-context]'),counterList=panel?.querySelector('[data-character-live-counters]'),effectList=panel?.querySelector('[data-character-live-effects]'),actionList=panel?.querySelector('[data-character-live-actions]');clear(contextNode);clear(counterList);clear(effectList);clear(actionList);if(!panel)return;if(!state.selectedServerCharacterId){contextNode.append(document.createTextNode('Wähle eine eingereichte Figur.'));return}if(error){contextNode.append(document.createTextNode(`Der Live-Zustand konnte nicht geladen werden: ${friendlyError(error)}`),button('Erneut laden',()=>loadSelectedLive(state)));return}contextNode.append(document.createTextNode(`${context?.status==='active'?'Live aktiv':context?.status==='paused'?'Live pausiert':'Live inaktiv'} · ${context?.current_place_name||'Ort nicht festgelegt'} · ${context?.current_session_title||'kein Spielabend'}${context?.encounter_summary?` · ${context.encounter_summary}`:''}${context?.compact_notes?` · ${context.compact_notes}`:''}`));if(live?.resync_required){const warning=document.createElement('p');warning.className='muted';warning.textContent='Eine neue bestätigte Figurenrevision liegt vor. Die Spielleitung gleicht den Live-Zustand kontrolliert ab; bis dahin siehst du den zuletzt protokollierten Stand.';contextNode.append(warning)}if(!live){counterList.append(listItem('Noch kein Live-Zustand aus der gültigen Revision initialisiert.'));effectList.append(listItem('Keine Live-Effekte verfügbar.'))}else{const counters=Object.entries(live.counters&&typeof live.counters==='object'?live.counters:{});if(!counters.length)counterList.append(listItem('Keine laufenden Counter.'));for(const [key,pair] of counters)counterList.append(listItem(`${key}: ${pair?.current??'–'} / ${pair?.max??'–'}`));const effects=Array.isArray(live.active_effects)?live.active_effects:[];if(!effects.length)effectList.append(listItem('Keine aktiven Effekte.'));for(const effect of effects)effectList.append(listItem(`${effect?.name||'Unbenannter Effekt'} · ${effect?.active===false?'inaktiv':'aktiv'}${effect?.description?` · ${effect.description}`:''}`))}if(!actions.length)actionList.append(listItem('Noch keine protokollierte Live-Änderung.'));for(const action of actions)actionList.append(listItem(`${action.action_kind==='undo'?'Gegenänderung · ':''}${action.summary}`))}
  async function loadSelectedLive(state){const characterId=state.selectedServerCharacterId,campaignId=state.selectedCampaignId,request=++state.liveRequest,authEpoch=state.authEpoch;ensurePlayerLivePanel(state);if(!campaignId){stopPlayerLiveSync(state);renderPlayerLiveState(state);return}ensurePlayerLiveSync(state);if(!characterId){renderPlayerLiveState(state);return}renderPlayerLiveState(state,null,null,[]);const required=['listCampaignLiveContext','listCharacterLiveState','listCharacterLiveActions'];if(required.some(name=>typeof state.repository[name]!=='function'))return;try{const [contexts,states,actions]=await Promise.all([state.repository.listCampaignLiveContext(campaignId),state.repository.listCharacterLiveState(characterId),state.repository.listCharacterLiveActions(characterId)]);if(request!==state.liveRequest||authEpoch!==state.authEpoch||characterId!==state.selectedServerCharacterId||campaignId!==state.selectedCampaignId)return;renderPlayerLiveState(state,contexts[0]||null,states[0]||null,(Array.isArray(actions)?actions:[]).filter(row=>row.character_id===characterId))}catch(error){if(request!==state.liveRequest||authEpoch!==state.authEpoch)return;renderPlayerLiveState(state,null,null,[],error)}}
  function ensureMigrationPanel(state){
    let panel=state.dialog.querySelector('[data-character-migrations]');if(panel)return panel;
    const anchor=ensureLootList(state)?.closest('section')||state.dialog.querySelector('[data-character-sessions]');if(!anchor)return null;
    panel=document.createElement('section');panel.dataset.characterMigrations='';panel.className='campaign-aux-migration';
    const heading=document.createElement('h4');heading.textContent='NPCs, Vertraute und Reittiere übernehmen';
    const note=document.createElement('p');note.className='muted';note.textContent='Deine bisherigen Reiter bleiben auf diesem Gerät als nicht synchronisierte Sicherung erhalten. Nur wenn du einen Reiter ausdrücklich freigibst, erhält die Spielleitung eine private Prüffassung. Nach einer Verknüpfung ist das Weltwesen der maßgebliche Kampagnendatensatz; das alte lokale Inventar ist keine zweite aktive Kopie. Werte und CBP deiner Figur werden nicht automatisch geändert.';
    const historyHeading=document.createElement('h5');historyHeading.textContent='Meine Übernahmeanfragen';
    const history=document.createElement('ul');history.dataset.migrationHistory='';
    const localHeading=document.createElement('h5');localHeading.textContent='Lokale Reiter dieser Figur';
    const local=document.createElement('ul');local.dataset.migrationLocal='';
    panel.append(heading,note,historyHeading,history,localHeading,local);anchor.after(panel);return panel;
  }
  function localAuxTabs(state,characterId){
    if(state.character?.id!==characterId||!Array.isArray(state.character.auxiliaryTabs))return[];
    return state.character.auxiliaryTabs.filter(aux=>aux&&['npc','familiar','mount'].includes(aux.type)
      &&String(aux.id||'').trim()&&String(aux.name||'').trim());
  }
  function auxTypeLabel(type){return({npc:'NPC',familiar:'Vertrauter',mount:'Reittier'})[type]||'Wesen'}
  function renderMigrationPanel(state,requests=[],companions=[],error=null){
    const panel=ensureMigrationPanel(state);if(!panel)return;
    const history=panel.querySelector('[data-migration-history]'),local=panel.querySelector('[data-migration-local]');clear(history);clear(local);
    const characterId=state.selectedServerCharacterId,campaignId=state.selectedCampaignId;
    if(!characterId){history?.append(listItem('Wähle eine eingereichte Figur.'));local?.append(listItem('Noch keine Kampagnenfigur ausgewählt.'));return}
    if(error){history?.append(listItem(`Übernahmeanfragen konnten nicht geladen werden: ${friendlyError(error)}`,button('Erneut laden',()=>loadSelectedMigrations(state))));local?.append(listItem('Bitte lade die Anfragen erneut, bevor du einen lokalen Reiter freigibst.'));return}
    const safeRequests=(Array.isArray(requests)?requests:[]).filter(row=>row.character_id===characterId&&row.campaign_id===campaignId);
    const safeCompanions=(Array.isArray(companions)?companions:[]).filter(row=>row.character_id===characterId&&row.campaign_id===campaignId);
    if(!safeRequests.length)history?.append(listItem('Noch keine Übernahmeanfrage.'));
    for(const row of safeRequests){
      const visible=safeCompanions.find(link=>link.source_aux_id===row.source_aux_id),kind=auxTypeLabel(row.source_aux_type);
      const status=({pending:'wartet auf Prüfung',linked:visible?`mit ${visible.player_name||'einem Wesen'} verknüpft`:'mit einem Weltwesen verknüpft; Details werden von der Spielleitung freigegeben',rejected:'nicht übernommen',cancelled:'zurückgezogen'})[row.status]||row.status;
      history?.append(listItem(`${row.source_name||'Unbenannt'} · ${kind} · ${status}`,...(row.status==='pending'?[button('Anfrage zurückziehen',()=>cancelAuxMigration(state,row))]:[])));
    }
    const serverCharacter=state.playerCharacters.find(row=>row.character_id===characterId&&row.campaign_id===campaignId);
    if(!['approved_locked','change_pending'].includes(serverCharacter?.status)){local?.append(listItem('Die Figur muss zuerst von der Spielleitung bestätigt sein.'));return}
    if(state.character?.id!==characterId){
      const available=state.hasLocalCharacterId?.(characterId);
      local?.append(listItem(available?'Öffne zuerst die lokale Kopie dieser Figur auf diesem Gerät.':'Die lokale Kopie dieser Figur ist auf diesem Gerät nicht vorhanden.',...(available&&typeof state.selectLocalCharacter==='function'?[button('Lokale Figur öffnen',()=>selectLocalCharacter(state,characterId))]:[])));
      return;
    }
    const tabs=localAuxTabs(state,characterId);if(!tabs.length){local?.append(listItem('Keine NPC-, Vertrauten- oder Reittier-Reiter in dieser lokalen Figur.'));return}
    const blockedIds=new Set(safeRequests.filter(row=>['pending','linked'].includes(row.status)).map(row=>String(row.source_aux_id)));
    for(const aux of tabs){
      const item=listItem(`${String(aux.name).trim()} · ${auxTypeLabel(aux.type)}${blockedIds.has(String(aux.id))?' · bereits eingereicht':''}`);
      if(!blockedIds.has(String(aux.id))){
        const consent=document.createElement('label'),checkbox=document.createElement('input'),submit=button('Diesen Reiter zur Prüfung freigeben',()=>submitAuxMigration(state,aux.id,checkbox));
        consent.className='campaign-check';checkbox.type='checkbox';checkbox.dataset.migrationConsent='';submit.dataset.migrationSubmit='';checkbox.setAttribute('aria-label',`Vollständigen lokalen Reiter ${String(aux.name).trim()} zur Prüfung freigeben`);
        consent.append(checkbox,document.createTextNode(' Ich bestätige: Dieser vollständige Reiter samt Werten, Inventar und Notizen darf an die Spielleitung zur Prüfung gesendet werden. Das lokale Original bleibt als nicht synchronisierte Sicherung erhalten.'));
        submit.disabled=true;checkbox.addEventListener('change',()=>{submit.disabled=!checkbox.checked||state.busy});
        item.append(consent,submit);
      }
      local?.append(item);
    }
  }
  async function loadSelectedMigrations(state){
    const characterId=state.selectedServerCharacterId,campaignId=state.selectedCampaignId,request=++state.migrationRequest,authEpoch=state.authEpoch;
    if(!characterId){renderMigrationPanel(state,[],[]);return}
    if(typeof state.repository.listCreatureAuxMigrationRequests!=='function'||typeof state.repository.listCharacterCompanions!=='function'){renderMigrationPanel(state,[],[],new Error('Die Übernahmefunktion ist hier noch nicht verfügbar.'));return}
    const panel=ensureMigrationPanel(state);clear(panel?.querySelector('[data-migration-history]'));panel?.querySelector('[data-migration-history]')?.append(listItem('Übernahmeanfragen werden geladen …'));
    clear(panel?.querySelector('[data-migration-local]'));
    try{
      const [requests,companions]=await Promise.all([state.repository.listCreatureAuxMigrationRequests(characterId),state.repository.listCharacterCompanions(characterId)]);
      if(request!==state.migrationRequest||authEpoch!==state.authEpoch||characterId!==state.selectedServerCharacterId||campaignId!==state.selectedCampaignId)return;
      renderMigrationPanel(state,requests,companions);
    }catch(error){if(request!==state.migrationRequest||authEpoch!==state.authEpoch)return;renderMigrationPanel(state,[],[],error)}
  }
  function ensureRelationsPanel(state){
    let panel=state.dialog.querySelector('[data-character-relations]');if(panel)return panel;
    const anchor=ensureMigrationPanel(state)||ensureLootList(state)?.closest('section')||state.dialog.querySelector('[data-character-sessions]');if(!anchor)return null;
    panel=document.createElement('section');panel.dataset.characterRelations='';panel.className='campaign-relations';
    panel.append(document.createElement('hr'));
    const title=document.createElement('h3');title.textContent='Beziehungen, Ruf & Verfolgung';panel.append(title);
    const note=document.createElement('p');note.className='muted';note.textContent='Hier erscheint nur Wissen, das die Spielleitung für diese Figur ausdrücklich als bekannt oder teilweise bekannt freigegeben hat.';panel.append(note);
    for(const [key,label] of [['relationships','Beziehungen'],['reputations','Ruf'],['warrants','Steckbriefe & Haftbefehle'],['pursuits','Verfolger'],['disadvantages','Verknüpfte Nachteile']]){
      const heading=document.createElement('h4');heading.textContent=label;const list=document.createElement('ul');list.dataset[`character${key[0].toUpperCase()}${key.slice(1)}`]='';panel.append(heading,list);
    }
    anchor.after(panel);return panel;
  }
  function phase6List(state,key){return ensureRelationsPanel(state)?.querySelector(`[data-character-${key}]`)}
  function renderSafePhase6List(state,key,rows,formatter,emptyLabel){
    const list=phase6List(state,key);clear(list);if(!list)return;
    if(!state.selectedServerCharacterId){list.append(listItem('Wähle eine eingereichte Figur.'));return}
    const safe=Array.isArray(rows)?rows:[];if(!safe.length){list.append(listItem(emptyLabel));return}
    for(const row of safe)list.append(listItem(formatter(row)));
  }
  function visibilityPrefix(row){return row.visibility==='partial'?'Teilweise bekannt · ':''}
  function renderSelectedRelations(state,results){
    const characterId=state.selectedServerCharacterId,campaignId=state.selectedCampaignId;
    const rows=(index)=>results[index]?.status==='fulfilled'?(Array.isArray(results[index].value)?results[index].value:[]):[];
    const failed=(index,key)=>{if(results[index]?.status==='rejected'){const list=phase6List(state,key);clear(list);list?.append(listItem(`Informationen konnten nicht geladen werden: ${friendlyError(results[index].reason)}`,button('Erneut laden',()=>loadSelectedRelations(state))))}};
    renderSafePhase6List(state,'relationships',rows(0).filter(row=>row.campaign_id===campaignId&&(row.audience_character_id===null||row.audience_character_id===characterId)),row=>`${visibilityPrefix(row)}${row.source_label||'Unbekannt'} → ${row.target_label||'Unbekannt'}${row.roles?.length?` · ${row.roles.join(', ')}`:''}${row.attitude?` · ${row.attitude}`:''}${row.player_summary?` · ${row.player_summary}`:''}`,'Keine Beziehungen freigegeben.');failed(0,'relationships');
    renderSafePhase6List(state,'reputations',rows(1).filter(row=>row.character_id===characterId),row=>`${visibilityPrefix(row)}${row.scope_name||'Unbenannter Rufbereich'}${row.reputation_value!==null&&row.reputation_value!==undefined?` · ${row.reputation_value}`:''}${row.player_summary?` · ${row.player_summary}`:''}`,'Kein Ruf freigegeben.');failed(1,'reputations');
    renderSafePhase6List(state,'warrants',rows(2).filter(row=>row.character_id===characterId),row=>`${visibilityPrefix(row)}${row.issuer||'Unbekannter Aussteller'} · ${row.reach||'Reichweite unbekannt'}${row.reason?` · ${row.reason}`:''}${row.reward?` · Belohnung: ${row.reward}`:''}${row.known_identity?` · Gesuchte Identität: ${row.known_identity}`:''}${row.player_summary?` · ${row.player_summary}`:''}`,'Keine Steckbriefe oder Haftbefehle freigegeben.');failed(2,'warrants');
    renderSafePhase6List(state,'pursuits',rows(3).filter(row=>row.character_id===characterId),row=>`${visibilityPrefix(row)}${row.player_name||'Unbekannte Verfolgung'}${row.player_status?` · ${row.player_status}`:''}${row.player_hint?` · ${row.player_hint}`:''}`,'Keine Verfolger freigegeben.');failed(3,'pursuits');
    renderSafePhase6List(state,'disadvantages',rows(4).filter(row=>row.character_id===characterId),row=>`${visibilityPrefix(row)}${row.disadvantage_name||'Unbenannter Nachteil'} · ${row.impact_kind==='unresolved'?'Auswirkung noch offen':`verknüpft mit ${row.impact_kind}`}${row.player_summary?` · ${row.player_summary}`:''}`,'Keine Nachteile mit Kampagnenfolgen verknüpft.');failed(4,'disadvantages');
  }
  async function loadSelectedRelations(state){
    const characterId=state.selectedServerCharacterId,campaignId=state.selectedCampaignId,request=++state.relationRequest,authEpoch=state.authEpoch;
    ensureRelationsPanel(state);
    if(!characterId||!campaignId){renderSelectedRelations(state,Array.from({length:5},()=>({status:'fulfilled',value:[]})));return}
    for(const key of ['relationships','reputations','warrants','pursuits','disadvantages']){const list=phase6List(state,key);clear(list);list?.append(listItem('Wird geladen …'))}
    const calls=[['listCharacterRelationships',campaignId],['listCharacterReputations',characterId],['listCharacterWarrants',characterId],['listCharacterPursuits',characterId],['listCharacterDisadvantageLinks',characterId]].map(([name,arg])=>typeof state.repository[name]==='function'?Promise.resolve().then(()=>state.repository[name](arg)):Promise.resolve([]));
    const results=await Promise.allSettled(calls);
    if(request!==state.relationRequest||authEpoch!==state.authEpoch||characterId!==state.selectedServerCharacterId||campaignId!==state.selectedCampaignId)return;
    renderSelectedRelations(state,results);
  }
  function ensurePlacesPanel(state){
    let panel=state.dialog.querySelector('[data-character-places]');if(panel)return panel;
    const anchor=ensureRelationsPanel(state)||ensureMigrationPanel(state)||ensureLootList(state)?.closest('section')||state.dialog.querySelector('[data-character-sessions]');if(!anchor)return null;
    panel=document.createElement('section');panel.dataset.characterPlaces='';panel.className='campaign-places';panel.append(document.createElement('hr'));
    const title=document.createElement('h3');title.textContent='Bekannte Orte & Weltzustand';const note=document.createElement('p');note.className='muted';note.textContent='Hier erscheinen ausschließlich öffentliche oder für diese Kampagne beziehungsweise Figur ausdrücklich freigegebene Ortsdaten. Geheime Namen, Hierarchieglieder, Zustände und Spielleitungsnotizen fehlen vollständig.';
    const tree=document.createElement('ul');tree.dataset.characterPlaceTree='';const media=document.createElement('div');media.dataset.characterPlaceMedia='';panel.append(title,note,tree,media);anchor.after(panel);return panel;
  }
  function scopedRows(rows,characterId,key){const chosen=new Map();for(const row of Array.isArray(rows)?rows:[]){const id=row[key],specific=row.audience_character_id===characterId,existing=chosen.get(id);if(row.audience_character_id!==null&&!specific)continue;if(!existing||specific&&existing.audience_character_id===null)chosen.set(id,row)}return[...chosen.values()]}
  function revokePlayerMediaUrls(state){for(const value of state.placeMediaObjectUrls?.values?.()||[])global.URL?.revokeObjectURL?.(value);state.placeMediaObjectUrls?.clear?.()}
  const playerRegionPoints=region=>Array.isArray(region?.geometry?.points)?region.geometry.points.filter(point=>Number.isFinite(+point.x)&&Number.isFinite(+point.y)&&+point.x>=0&&+point.x<=1&&+point.y>=0&&+point.y<=1):[];
  function appendPlayerMapRegions(svg,rows,announcement){for(const row of rows){const points=playerRegionPoints(row);if(points.length<3)continue;const polygon=document.createElementNS('http://www.w3.org/2000/svg','polygon'),label=row.player_name||'Bekannter Ort',summary=row.player_summary?` · ${row.player_summary}`:'';polygon.setAttribute('points',points.map(point=>`${(+point.x*1000).toFixed(3)},${(+point.y*1000).toFixed(3)}`).join(' '));polygon.setAttribute('class','map-region-shape player');polygon.setAttribute('tabindex','0');polygon.setAttribute('role','button');polygon.setAttribute('aria-label',`${label}${summary}`);const title=document.createElementNS('http://www.w3.org/2000/svg','title');title.textContent=`${label}${summary}`;polygon.append(title);const activate=()=>{announcement.textContent=`Ausgewählte Kartenregion: ${label}${summary}`};polygon.addEventListener('click',activate);polygon.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();activate()}});svg.append(polygon)}}
  function renderSelectedPlaces(state,places=[],placeStates=[],mediaRows=[],regionRows=[],error=null){
    state.placeMediaObjectUrls=state.placeMediaObjectUrls||new Map;const panel=ensurePlacesPanel(state),list=panel?.querySelector('[data-character-place-tree]'),mediaRoot=panel?.querySelector('[data-character-place-media]');clear(list);clear(mediaRoot);revokePlayerMediaUrls(state);if(!list)return;
    if(!state.selectedCampaignId){list.append(listItem('Wähle eine Kampagne.'));return}if(error){list.append(listItem(`Ortswissen konnte nicht geladen werden: ${friendlyError(error)}`,button('Erneut laden',()=>loadSelectedPlaces(state))));return}
    const safePlaces=scopedRows(places,state.selectedServerCharacterId,'place_id'),safeStates=scopedRows(placeStates,state.selectedServerCharacterId,'state_id'),byParent=new Map();for(const row of safePlaces){const key=row.parent_place_id||'';if(!byParent.has(key))byParent.set(key,[]);byParent.get(key).push(row)}for(const rows of byParent.values())rows.sort((a,b)=>(+a.display_order||0)-(+b.display_order||0)||String(a.player_name||'').localeCompare(String(b.player_name||''),'de'));
    const visited=new Set(),append=(parentId='',depth=0)=>{for(const row of byParent.get(parentId)||[]){if(visited.has(row.place_id))continue;visited.add(row.place_id);const name=row.player_name||'Unbekannter Ort',summary=row.player_summary?` · ${row.player_summary}`:'',prefix=row.knowledge_level==='partial'?'Teilweise bekannt · ':'';const line=listItem(`${'↳ '.repeat(depth)}${prefix}${name}${summary}`);line.dataset.placeId=row.place_id;const details=document.createElement('div');details.className='muted';if(row.detail_level==='full'&&row.player_lore)details.append(document.createTextNode(`Lore: ${row.player_lore}`));if(row.player_table_notes)details.append(document.createTextNode(`${details.textContent?' · ':''}Am Spieltisch: ${row.player_table_notes}`));for(const rule of Array.isArray(row.player_rules)?row.player_rules:[])details.append(document.createTextNode(`${details.textContent?' · ':''}${typeof rule==='string'?rule:rule?.text||''}`));for(const current of safeStates.filter(entry=>entry.place_id===row.place_id))details.append(document.createTextNode(`${details.textContent?' · ':''}Aktuell: ${current.player_label||'Unbekannter Zustand'}${current.player_summary?` – ${current.player_summary}`:''}`));if(details.textContent)line.append(details);list.append(line);append(row.place_id,depth+1)}};append();for(const row of safePlaces)if(!visited.has(row.place_id)){const line=listItem(`${row.knowledge_level==='partial'?'Teilweise bekannt · ':''}${row.player_name||'Unbekannter Ort'}${row.player_summary?` · ${row.player_summary}`:''}`);line.dataset.placeId=row.place_id;list.append(line)}if(!safePlaces.length)list.append(listItem('Noch keine Orte bekannt.'));if(mediaRoot){const heading=document.createElement('h4');heading.textContent='Freigegebene Bilder & Karten';mediaRoot.append(heading);if(!mediaRows.length){const empty=document.createElement('p');empty.className='muted';empty.textContent='Noch keine Bilder freigegeben.';mediaRoot.append(empty)}for(const row of mediaRows){const figure=document.createElement('figure'),image=document.createElement('img'),caption=document.createElement('figcaption'),place=safePlaces.find(entry=>entry.place_id===row.place_id),regions=regionRows.filter(region=>region.asset_id===row.asset_id);image.alt=row.player_alt_text||'';image.loading='lazy';image.width=480;caption.textContent=`${place?.player_name?`${place.player_name} · `:''}${row.player_title||'Bild'}${row.player_caption?` · ${row.player_caption}`:''}`;if(row.media_kind==='map_image'&&regions.length){figure.className='campaign-map-figure';const visual=document.createElement('div');visual.className='campaign-map-visual';const overlay=document.createElementNS('http://www.w3.org/2000/svg','svg');overlay.setAttribute('viewBox','0 0 1000 1000');overlay.setAttribute('preserveAspectRatio','none');overlay.setAttribute('aria-label','Interaktive bekannte Kartenregionen');const announcement=document.createElement('p');announcement.className='muted';announcement.setAttribute('aria-live','polite');announcement.textContent='Kartenregionen können mit Maus, Touch oder Tastatur ausgewählt werden; die Ortsliste bleibt vollständig verfügbar.';appendPlayerMapRegions(overlay,regions,announcement);visual.append(image,overlay);figure.append(visual,caption,announcement)}else figure.append(image,caption);mediaRoot.append(figure);state.repository.downloadWorldMediaObject(row.bucket_id,row.object_path).then(blob=>{if(!image.isConnected)return;const url=global.URL.createObjectURL(blob);state.placeMediaObjectUrls.set(row.asset_id,url);image.src=url}).catch(()=>{if(!image.isConnected)return;const failure=document.createElement('p');failure.className='muted';failure.textContent='Das freigegebene Bild konnte nicht geladen werden. Der Ortstext bleibt verfügbar.';image.replaceWith(failure);figure.querySelector('svg')?.remove()})}}
  }
  async function loadSelectedPlaces(state){const campaignId=state.selectedCampaignId,characterId=state.selectedServerCharacterId,request=++state.placeRequest,authEpoch=state.authEpoch;ensurePlacesPanel(state);if(!campaignId){renderSelectedPlaces(state);return}const list=state.dialog.querySelector('[data-character-place-tree]');clear(list);list?.append(listItem('Bekannte Orte, Bilder und Kartenregionen werden geladen …'));if(typeof state.repository.listKnownCampaignPlaces!=='function'||typeof state.repository.listKnownCampaignPlaceStates!=='function'||typeof state.repository.listCampaignMedia!=='function'||typeof state.repository.downloadWorldMediaObject!=='function'){renderSelectedPlaces(state);return}try{const [places,states,media,regions]=await Promise.all([state.repository.listKnownCampaignPlaces(campaignId,characterId),state.repository.listKnownCampaignPlaceStates(campaignId,characterId),state.repository.listCampaignMedia(campaignId,characterId),state.repository.listCampaignMapRegions?.(campaignId,characterId)||[]]);if(request!==state.placeRequest||authEpoch!==state.authEpoch||campaignId!==state.selectedCampaignId||characterId!==state.selectedServerCharacterId)return;renderSelectedPlaces(state,places,states,Array.isArray(media)?media:[],Array.isArray(regions)?regions:[])}catch(error){if(request!==state.placeRequest||authEpoch!==state.authEpoch)return;renderSelectedPlaces(state,[],[],[],[],error)}}
  function ensureChroniclePanel(state){let panel=state.dialog.querySelector('[data-character-chronicle]');if(panel)return panel;const anchor=ensurePlacesPanel(state)||ensureRelationsPanel(state)||ensureMigrationPanel(state)||ensureLootList(state)?.closest('section')||state.dialog.querySelector('[data-character-sessions]');if(!anchor)return null;panel=document.createElement('section');panel.dataset.characterChronicle='';panel.className='campaign-chronicle';panel.append(document.createElement('hr'));const title=document.createElement('h3');title.textContent='Bekannte Weltchronik';const note=document.createElement('p');note.className='muted';note.textContent='Diese Ansicht zeigt nur Ereignisse, die bis zum aktuellen Kampagnentag liegen und öffentlich oder für diese Kampagne beziehungsweise Figur freigegeben sind. Interne Wahrheit, Ursachen, Konflikte und spätere Ereignisse bleiben verborgen.';const list=document.createElement('ul');list.dataset.characterChronicleList='';panel.append(title,note,list);anchor.after(panel);return panel}
  function renderSelectedChronicle(state,rows=[],error=null){const panel=ensureChroniclePanel(state),list=panel?.querySelector('[data-character-chronicle-list]');clear(list);if(!list)return;if(!state.selectedCampaignId){list.append(listItem('Wähle eine Kampagne.'));return}if(error){list.append(listItem(`Die bekannte Weltchronik konnte nicht geladen werden: ${friendlyError(error)}`,button('Erneut laden',()=>loadSelectedChronicle(state))));return}const currentDay=+state.selectedCampaign?.current_day||1,safe=scopedRows((Array.isArray(rows)?rows:[]).filter(row=>row.campaign_id===state.selectedCampaignId&&(+row.occurred_day||0)<=currentDay),state.selectedServerCharacterId,'event_id').sort((a,b)=>(+b.occurred_day||0)-(+a.occurred_day||0));if(!safe.length){list.append(listItem('Noch keine Weltereignisse bekannt.'));return}for(const row of safe){const prefix=row.knowledge_level==='partial'?'Teilweise bekannt · ':row.is_correction?'Korrektur · ':'';list.append(listItem(`Tag ${row.occurred_day} · ${prefix}${row.player_title||'Unbenanntes Ereignis'}${row.player_summary?` — ${row.player_summary}`:''}`))}}
  async function loadSelectedChronicle(state){const campaignId=state.selectedCampaignId,characterId=state.selectedServerCharacterId,request=++state.chronicleRequest,authEpoch=state.authEpoch;ensureChroniclePanel(state);if(!campaignId){renderSelectedChronicle(state);return}const list=state.dialog.querySelector('[data-character-chronicle-list]');clear(list);list?.append(listItem('Bekannte Weltchronik wird geladen …'));if(typeof state.repository.listCampaignWorldChronicle!=='function'){renderSelectedChronicle(state);return}try{const rows=await state.repository.listCampaignWorldChronicle(campaignId,characterId);if(request!==state.chronicleRequest||authEpoch!==state.authEpoch||campaignId!==state.selectedCampaignId||characterId!==state.selectedServerCharacterId)return;renderSelectedChronicle(state,rows)}catch(error){if(request!==state.chronicleRequest||authEpoch!==state.authEpoch)return;renderSelectedChronicle(state,[],error)}}
  async function submitAuxMigration(state,auxId,checkbox){
    const characterId=state.selectedServerCharacterId,campaignId=state.selectedCampaignId;
    if(!checkbox.checked||state.character?.id!==characterId||!isOwnedCharacter(state,characterId)){text(state.message,'Bitte bestätige zuerst die Freigabe des Reiters deiner eigenen Kampagnenfigur.');return}
    const aux=localAuxTabs(state,characterId).find(row=>String(row.id)===String(auxId));
    if(!aux){text(state.message,'Der lokale Reiter ist nicht mehr vorhanden. Es wurde nichts übertragen.');return}
    let snapshot;try{snapshot=JSON.parse(JSON.stringify(aux))}catch{ text(state.message,'Der lokale Reiter konnte nicht sicher für die Prüfung kopiert werden.');return}
    if(String(snapshot.id)!==String(auxId)||!['npc','familiar','mount'].includes(snapshot.type)||!String(snapshot.name||'').trim()){text(state.message,'Der lokale Reiter besitzt keine gültige Kennung, Art oder Bezeichnung.');return}
    try{await runBusy(state,async()=>{
      if(characterId!==state.selectedServerCharacterId||campaignId!==state.selectedCampaignId)throw new Error('Die ausgewählte Kampagnenfigur hat sich geändert.');
      text(state.message,'Der ausdrücklich freigegebene Reiter wird zur Prüfung gesendet …');
      await state.repository.requestCreatureAuxMigration(characterId,snapshot,{confirmed:true});
      await loadSelectedMigrations(state);
      text(state.message,'Übernahmeanfrage gesendet. Der ursprüngliche lokale Reiter bleibt unverändert; die Spielleitung prüft die Zuordnung.');
    })}catch{}
  }
  async function cancelAuxMigration(state,row){
    if(row.character_id!==state.selectedServerCharacterId||row.campaign_id!==state.selectedCampaignId||!isOwnedCharacter(state,row.character_id)){text(state.message,'Bitte wähle zuerst deine eigene Kampagnenfigur.');return}
    try{await runBusy(state,async()=>{await state.repository.cancelCreatureAuxMigration(row.request_id,row.revision);await loadSelectedMigrations(state);text(state.message,'Die offene Übernahmeanfrage wurde zurückgezogen. Dein lokaler Reiter bleibt erhalten.')})}catch{}
  }
  function renderCharacterSessions(state,sessions){
    const list=state.dialog.querySelector('[data-character-sessions]');clear(list);
    if(!state.selectedServerCharacterId){list?.append(listItem('Wähle eine eingereichte Figur, um ihre Spielabend-CBP zu sehen.'));return}
    if(!sessions.length){list?.append(listItem('Keine offenen Angebote oder gebuchten Spielabend-CBP für diese Figur.'));return}
    const offered=sessions.filter(session=>!session.ledger_id),claimed=sessions.filter(session=>!!session.ledger_id);
    if(offered.length)list?.append(listItem('Offene CBP-Angebote'));
    for(const session of offered){
      const label=`${session.title} · ${dateLabel(session.session_date)} · +${session.amount} CBP`;
      if(!state.hasLocalCharacterId?.(session.character_id))list?.append(listItem(`${label} · passende lokale Figur auf diesem Gerät nicht vorhanden; zuerst öffnen oder importieren`));
      else if(+session.amount>0&&['open','completed'].includes(session.status))list?.append(listItem(label,button('CBP übernehmen',()=>claimSessionCbp(state,session))));
      else list?.append(listItem(`${label} · derzeit nicht abholbar`));
    }
    if(claimed.length)list?.append(listItem('Bereits gebuchte CBP'));
    for(const session of claimed){
      const label=`${session.title} · ${dateLabel(session.session_date)} · +${session.amount} CBP`;
      if(state.hasSessionCbp?.(session.ledger_id,session.character_id))list?.append(listItem(`${label} · gebucht und auf diesem Gerät übernommen`));
      else if(state.hasLocalCharacterId?.(session.character_id))list?.append(listItem(`${label} · serverseitig gebucht`,button('In lokale Figur übernehmen',()=>applyExistingSessionCbp(state,session))));
      else list?.append(listItem(`${label} · serverseitig gebucht · lokale Figur auf diesem Gerät nicht vorhanden`));
    }
  }
  async function loadSelectedSessions(state){
    const characterId=state.selectedServerCharacterId,request=++state.sessionRequest;
    renderViewedCharacter(state);loadSelectedLoot(state);loadSelectedLive(state);loadSelectedMigrations(state);loadSelectedRelations(state);loadSelectedPlaces(state);loadSelectedChronicle(state);
    const list=state.dialog.querySelector('[data-character-sessions]');clear(list);
    if(characterId)list?.append(listItem('Spielabend-CBP werden geladen …'));
    else renderCharacterSessions(state,[]);
    if(!characterId)return;
    try{
      const sessions=await state.repository.listCharacterSessions(characterId);
      if(request===state.sessionRequest&&characterId===state.selectedServerCharacterId)renderCharacterSessions(state,sessions.filter(session=>session.character_id===characterId));
    }catch(error){
      if(request!==state.sessionRequest)return;
      if(/relation .* does not exist|schema cache/i.test(error?.message||'')){renderCharacterSessions(state,[]);return}
      throw error;
    }
  }
  function selectCampaign(state,campaign){
    if(state.selectedCampaignId&&state.selectedCampaignId!==campaign.campaign_id)stopPlayerLiveSync(state);
    state.selectedCampaignId=campaign.campaign_id;state.selectedServerCharacterId=null;
    const preferred=state.playerCharacters.find(character=>character.campaign_id===campaign.campaign_id&&character.character_id===state.character?.id);
    state.selectedServerCharacterId=(preferred||state.playerCharacters.find(character=>character.campaign_id===campaign.campaign_id))?.character_id||null;
    renderCampaigns(state,state.campaigns);renderPlayerCharacters(state,state.playerCharacters);renderViewedCharacter(state);updateSubmissionPreview(state);loadSelectedSessions(state).catch(error=>text(state.message,friendlyError(error)));
  }
  function selectPlayerCharacter(state,character){
    if(!isOwnedCharacter(state,character.character_id))return;
    if(state.selectedCampaignId&&state.selectedCampaignId!==character.campaign_id)stopPlayerLiveSync(state);
    state.selectedServerCharacterId=character.character_id;state.selectedCampaignId=character.campaign_id;
    renderCampaigns(state,state.campaigns);renderPlayerCharacters(state,state.playerCharacters);loadSelectedSessions(state).catch(error=>text(state.message,friendlyError(error)));
  }
  function selectLocalCharacter(state,characterId){
    if(typeof state.selectLocalCharacter!=='function')return;
    try{
      const character=state.selectLocalCharacter(characterId);if(!character||character.id!==characterId)return;
      state.character=character;
      const serverCharacter=state.playerCharacters.find(row=>row.character_id===character.id);
      state.selectedServerCharacterId=serverCharacter?.character_id||null;state.localDraftSelected=!serverCharacter;
      if(serverCharacter)state.selectedCampaignId=serverCharacter.campaign_id;
      renderLocalCharacter(state);renderLocalCharacters(state);renderCampaigns(state,state.campaigns);renderPlayerCharacters(state,state.playerCharacters);updateSubmissionPreview(state);loadSelectedSessions(state).catch(error=>text(state.message,friendlyError(error)));
    }catch(error){text(state.message,friendlyError(error))}
  }
  async function applyExistingSessionCbp(state,session){
    if(session.character_id!==state.selectedServerCharacterId||!isOwnedCharacter(state,session.character_id)||!state.hasLocalCharacterId?.(session.character_id)){text(state.message,'Die ausgewählte Kampagnenfigur ist auf diesem Gerät nicht als eigene lokale Figur vorhanden.');return}
    try{await runBusy(state,async()=>{state.applySessionCbp?.({ledger_id:session.ledger_id,campaign_id:session.campaign_id,session_id:session.session_id,character_id:session.character_id,amount:session.amount,title:session.title,session_date:session.session_date,status:'claimed'});await refresh(state);text(state.message,'Die bereits gebuchten CBP wurden in die lokale Figur übernommen.')})}catch{}
  }
  async function claimSessionCbp(state,session){
    if(session.character_id!==state.selectedServerCharacterId||!isOwnedCharacter(state,session.character_id)){text(state.message,'Bitte wähle zuerst deine eingereichte Figur aus.');return}
    if(!state.hasLocalCharacterId?.(session.character_id)){text(state.message,'Die passende lokale Figur ist auf diesem Gerät nicht vorhanden. Öffne oder importiere sie zuerst.');return}
    try{await runBusy(state,async()=>{
      const receipt=await state.repository.claimSessionCbp(session.session_id,session.character_id);
      let localSyncError=null;
      try{state.applySessionCbp?.(receipt)}catch(error){localSyncError=error}
      await refresh(state);
      text(state.message,localSyncError?`+${receipt.amount} CBP wurden serverseitig gebucht. Die Übernahme auf diesem Gerät ist fehlgeschlagen: ${friendlyError(localSyncError)}`:`+${receipt.amount} CBP aus „${receipt.title}“ wurden gebucht und in die lokale Figur übernommen.`);
    })}catch{}
  }
  async function refresh(state){
    const authEpoch=state.authEpoch;
    const [campaigns,characters]=await Promise.all([state.repository.listPlayerCampaigns(),state.repository.listPlayerCharacters()]);
    if(authEpoch!==state.authEpoch)return{campaigns:[],characters:[]};
    state.creatureGeneration++;state.knownCreatures.clear();state.creatureErrors.clear();state.creatureQueries.clear();
    state.campaigns=campaigns;state.playerCharacters=characters;
    if(!campaigns.some(campaign=>campaign.campaign_id===state.selectedCampaignId))state.selectedCampaignId=campaigns[0]?.campaign_id||null;
    const available=characters.filter(character=>character.campaign_id===state.selectedCampaignId);
    if(!available.some(character=>character.character_id===state.selectedServerCharacterId)){
      const local=available.find(character=>character.character_id===state.character?.id);
      state.selectedServerCharacterId=state.localDraftSelected?null:(local||available[0])?.character_id||null;
    }
    renderCampaigns(state,campaigns);renderLocalCharacter(state);renderLocalCharacters(state);renderPlayerCharacters(state,characters);updateSubmissionPreview(state);await loadSelectedSessions(state);
    return{campaigns,characters};
  }
  async function runBusy(state,operation){if(state.busy)return;setBusy(state,true);try{return await operation()}catch(error){text(state.message,friendlyError(error));throw error}finally{setBusy(state,false)}}
  function passwordPair(form,passwordSelector,confirmationSelector){const password=form?.querySelector(passwordSelector)?.value||'',confirmation=form?.querySelector(confirmationSelector)?.value||'';if(password!==confirmation)throw new Error('Die beiden Passwörter stimmen nicht überein.');return password}

  function bindActions(state){
    state.form?.addEventListener('submit',async event=>{event.preventDefault();try{await runBusy(state,async()=>{text(state.message,'Anmeldung wird geprüft …');const result=await state.auth.signInWithPassword(state.form.querySelector('[data-auth-email]')?.value,state.form.querySelector('[data-auth-password]')?.value);if(!result.user)throw new Error('Die Anmeldung konnte nicht abgeschlossen werden.');if(state.authUser?.id!==result.user.id)await renderSession(state,result.user)})}catch{}});
    state.dialog.querySelector('[data-auth-register-form]')?.addEventListener('submit',async event=>{event.preventDefault();const form=event.currentTarget;try{await runBusy(state,async()=>{const password=passwordPair(form,'[data-auth-register-password]','[data-auth-register-confirm]'),result=await state.auth.signUpWithPassword(form.querySelector('[data-auth-register-email]')?.value,password);form.reset();if(result.session&&result.user){await renderSession(state,result.user);text(state.message,'Konto erstellt und sicher angemeldet.')}else text(state.message,`Konto vorbereitet. Bitte bestätige die E-Mail an ${result.email}; danach kannst du dich hier mit deinem Passwort anmelden.`)})}catch{}});
    state.dialog.querySelector('[data-auth-reset]')?.addEventListener('click',async()=>{try{await runBusy(state,async()=>{const result=await state.auth.requestPasswordReset(state.form?.querySelector('[data-auth-email]')?.value);text(state.message,`Wenn ein Konto für ${result.email} besteht, wurde eine E-Mail zum Festlegen eines neuen Passworts gesendet.`)})}catch{}});
    state.dialog.querySelector('[data-auth-password-form]')?.addEventListener('submit',async event=>{event.preventDefault();const form=event.currentTarget;try{await runBusy(state,async()=>{const password=passwordPair(form,'[data-auth-new-password]','[data-auth-new-password-confirm]');await state.auth.updatePassword(password);form.reset();form.closest('details')?.removeAttribute('open');text(state.message,'Dein Passwort wurde gespeichert. Du kannst dich künftig auf jedem Gerät mit E-Mail und Passwort anmelden.')})}catch{}});
    state.dialog.querySelector('[data-sign-out]')?.addEventListener('click',async()=>{try{await runBusy(state,async()=>{await state.auth.signOut();await renderSession(state,null);text(state.message,'Du bist abgemeldet. Private Kampagnendaten wurden aus dieser Sitzung entfernt.')})}catch{}});
    state.dialog.querySelector('[data-invite-form]')?.addEventListener('submit',async event=>{event.preventDefault();const code=state.dialog.querySelector('[data-invite-code]')?.value||'';try{await runBusy(state,async()=>{await state.repository.redeemInvite(code);await refresh(state);text(state.message,'Kampagne erfolgreich zugeordnet. Jetzt kannst du die aktuelle Figur prüfen und einreichen.')})}catch{}});
    state.dialog.querySelector('[data-create-local-character]')?.addEventListener('click',()=>{
      try{const character=state.createLocalCharacter();if(!character?.id)throw new Error('Der neue lokale Entwurf konnte nicht angelegt werden.');stopPlayerLiveSync(state);state.character=character;state.selectedServerCharacterId=null;state.localDraftSelected=true;state.lootRequest++;state.liveRequest++;state.migrationRequest++;state.relationRequest++;state.placeRequest++;state.chronicleRequest++;renderLocalCharacter(state);renderLocalCharacters(state);renderPlayerCharacters(state,state.playerCharacters);renderSelectedCampaign(state,state.selectedCampaign);renderViewedCharacter(state);renderCharacterSessions(state,[]);renderCharacterLoot(state,[]);renderCampaignInventory(state,[]);renderPlayerLiveState(state);renderMigrationPanel(state,[],[]);renderSelectedRelations(state,Array.from({length:5},()=>({status:'fulfilled',value:[]})));renderSelectedPlaces(state);renderSelectedChronicle(state);updateSubmissionPreview(state);text(state.message,'Neuer lokaler Entwurf angelegt. Du kannst ihn im Charakterbau bearbeiten und später einreichen.')}catch(error){text(state.message,friendlyError(error))}
    });
    state.dialog.querySelector('[data-submit-character]')?.addEventListener('click',async()=>{if(!state.selectedCampaignId){text(state.message,'Bitte wähle zuerst eine Kampagne.');return}try{await runBusy(state,async()=>{const payload=state.submissionFactory(),keepPrivateCopy=!!state.dialog.querySelector('[data-keep-copy]')?.checked;text(state.message,'Die Figur wird serverseitig geprüft und eingereicht …');const receipt=await state.repository.submitCharacter(state.selectedCampaignId,payload,{keepPrivateCopy});state.applyReceipt?.(receipt,{keepPrivateCopy});state.selectedServerCharacterId=receipt.character_id;state.localDraftSelected=false;await refresh(state);text(state.message,'Figur eingereicht. Die lokale Fassung bleibt erhalten; die Spielleitung kann nun prüfen.')})}catch{}});
  }
  function clearPrivateView(state){stopPlayerLiveSync(state);revokePlayerMediaUrls(state);state.sessionRequest++;state.lootRequest++;state.liveRequest++;state.migrationRequest++;state.relationRequest++;state.placeRequest++;state.chronicleRequest++;state.calendarGeneration++;state.calendarByCampaign.clear();state.calendarErrors.clear();state.calendarQueries.clear();state.astronomyGeneration++;state.astronomyBySelection.clear();state.astronomyErrors.clear();state.astronomyQueries.clear();state.campaigns=[];state.playerCharacters=[];state.selectedCampaignId=null;state.selectedCampaign=null;state.selectedServerCharacterId=null;state.localDraftSelected=false;state.creatureGeneration++;state.knownCreatures.clear();state.creatureErrors.clear();state.creatureQueries.clear();clear(state.dialog.querySelector('[data-campaign-list]'));clear(state.dialog.querySelector('[data-player-characters]'));clear(state.dialog.querySelector('[data-character-sessions]'));clear(state.dialog.querySelector('[data-character-loot]'));clear(state.dialog.querySelector('[data-character-campaign-inventory]'));state.dialog.querySelector('[data-character-live-state]')?.remove();state.dialog.querySelector('[data-character-migrations]')?.remove();state.dialog.querySelector('[data-character-relations]')?.remove();state.dialog.querySelector('[data-character-places]')?.remove();state.dialog.querySelector('[data-character-chronicle]')?.remove();renderLocalCharacters(state);renderSelectedCampaign(state,null);renderViewedCharacter(state)}
  function hideTentativeSession(state){state.authEpoch++;state.authUser=null;show(state.form?.closest('.auth-account-box'),true);show(state.form,true);show(state.session,false);text(state.dialog.querySelector('[data-auth-user]'),'Angemeldetes Konto');clearPrivateView(state)}
  function createState(dialog,services={}){const Client=global.EberosSupabaseClient,provider=services.provider||new Client.SupabaseClientProvider();const state={dialog,provider,auth:services.auth||new Client.CampaignAuthGateway({provider}),repository:services.repository||new Client.SupabaseCampaignRepository({provider}),liveSync:services.liveSync||(!services.repository&&Client.CampaignLiveSyncGateway?new Client.CampaignLiveSyncGateway({provider}):null),form:dialog.querySelector('[data-auth-form]'),session:dialog.querySelector('[data-auth-session]'),message:dialog.querySelector('[data-auth-message]'),busy:false,unsubscribe:null,authEpoch:0,authUser:null,selectedCampaignId:null,selectedServerCharacterId:null,sessionRequest:0,lootRequest:0,liveRequest:0,migrationRequest:0,relationRequest:0,placeRequest:0,chronicleRequest:0,calendarGeneration:0,calendarByCampaign:new Map(),calendarErrors:new Map(),calendarQueries:new Map(),astronomyGeneration:0,astronomyBySelection:new Map(),astronomyErrors:new Map(),astronomyQueries:new Map(),creatureGeneration:0,localDraftSelected:false,campaigns:[],playerCharacters:[],knownCreatures:new Map(),creatureErrors:new Map(),creatureQueries:new Map(),character:null,submissionFactory:null,applyReceipt:null,applySessionCbp:null,hasSessionCbp:null,hasLocalCharacterId:null,listLocalCharacters:null,selectLocalCharacter:null,createLocalCharacter:null,liveSyncGeneration:0,liveSyncCampaignId:null,liveSyncStatus:null,liveSyncUnsubscribe:null,liveSyncRefreshPending:false,liveSyncRefreshing:false};bindActions(state);states.set(dialog,state);return state}
  async function renderSession(state,user){
    const authEpoch=++state.authEpoch;
    state.authUser=user||null;show(state.form?.closest('.auth-account-box'),!user);show(state.form,!user);show(state.session,!!user);text(state.dialog.querySelector('[data-auth-user]'),user?.email||'Angemeldetes Konto');global.dispatchEvent?.(new CustomEvent('eberos:campaign-auth-change',{detail:{user:user||null}}));
    if(!user){clearPrivateView(state);return}
    text(state.message,'Kampagnen werden geladen …');
    try{await refresh(state);if(authEpoch===state.authEpoch)text(state.message,'Du bist sicher angemeldet.')}
    catch(error){if(authEpoch===state.authEpoch){hideTentativeSession(state);text(state.message,friendlyError(error))}throw error}
  }
  async function initialize(state){
    if(!state.auth.configured()){show(state.form?.closest('.auth-account-box'),false);show(state.form,false);show(state.session,false);text(state.message,'Das verwaltete Supabase-Testprojekt ist lokal vorbereitet. Sobald die öffentliche Projektadresse eingetragen ist, kann hier die Kontoanmeldung beginnen.');return{configured:false,user:null}}
    show(state.form,true);text(state.message,'Vorhandene Kampagnensitzung wird geprüft …');
    try{const result=await state.auth.restoreSession();await renderSession(state,result.user);if(!state.unsubscribe)state.unsubscribe=await state.auth.onAuthStateChange(({event,user})=>renderSession(state,user).then(()=>{if(event==='PASSWORD_RECOVERY'&&user){const panel=state.dialog.querySelector('[data-auth-password-panel]');if(panel)panel.open=true;text(state.message,'Lege jetzt ein neues Passwort fest und speichere es.') }}).catch(error=>{if(!state.authUser)text(state.message,friendlyError(error))}));if(!result.user)text(state.message,'Melde dich mit E-Mail und Passwort an oder erstelle einmalig ein Spielerkonto. Open Play bleibt davon unberührt.');return{configured:true,user:result.user}}catch(error){if(state.authUser||!state.session?.hidden)hideTentativeSession(state);show(state.form?.closest('.auth-account-box'),true);show(state.form,true);text(state.message,friendlyError(error));return{configured:true,user:null,error}}
  }
  async function open({root,dialog,character,services,submissionFactory,applyReceipt,applySessionCbp,hasSessionCbp,hasLocalCharacterId,listLocalCharacters,selectLocalCharacter,createLocalCharacter}={}){
    const view=root||dialog;if(!view)throw new TypeError('Der Kampagnenbereich fehlt.');if(view instanceof HTMLDialogElement){if(typeof view.showModal==='function'&&!view.open)view.showModal();else view.setAttribute('open','')}else view.hidden=false;const state=states.get(view)||createState(view,services);Object.assign(state,{character,submissionFactory,applyReceipt,applySessionCbp,hasSessionCbp,hasLocalCharacterId,listLocalCharacters,selectLocalCharacter,createLocalCharacter});renderLocalCharacter(state);renderLocalCharacters(state);updateSubmissionPreview(state);const session=await initialize(state);if(session.error)throw session.error;return{requiresAuthentication:!session.user,configured:session.configured,authenticated:!!session.user,changedDraft:false,status:character?.campaignProfile?.status||'local_draft'};
  }
  global.EberosCampaignEntry=Object.freeze({open,friendlyError});
})(globalThis);
