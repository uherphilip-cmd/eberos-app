'use strict';

/* Spielerzugang: Beitritt, Figurenabgabe und spielabendbezogene CBP. */
(function installCampaignEntry(global){
  const states=new WeakMap();
  const text=(node,value)=>{if(node)node.textContent=value};
  const show=(node,visible)=>{if(node)node.hidden=!visible};
  const clear=node=>node?.replaceChildren();
  const button=(label,action)=>{const node=document.createElement('button');node.type='button';node.textContent=label;node.addEventListener('click',action);return node};
  const listItem=(label,...controls)=>{const item=document.createElement('li');item.append(document.createTextNode(label),...controls);return item};
  function friendlyError(error){if(error?.code==='CAMPAIGN_BACKEND_NOT_CONFIGURED')return'Das Supabase-Testprojekt ist noch nicht verbunden.';if(error?.status===429)return'Zu viele Versuche. Bitte warte kurz und versuche es später erneut.';return error?.message||'Die Kampagnenaktion konnte nicht abgeschlossen werden.'}
  function setBusy(state,busy){state.busy=busy;for(const control of state.dialog.querySelectorAll('button,input,textarea,select'))if(!control.matches('[data-close]'))control.disabled=busy}
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
    heading.textContent=campaign.name||'Unbenannte Kampagne';summary.textContent=campaign.summary||'Keine öffentliche Kurzbeschreibung.';dayLabel.textContent='Kampagnentag';day.textContent=String(campaign.current_day||1);roleLabel.textContent='Deine Rolle';role.textContent=campaign.role==='owner'?'Spielleitung':campaign.role==='game_master'?'Co-Spielleitung':'Spieler';notesHeading.textContent='Hinweise der Spielleitung';notes.className='campaign-player-notes';notes.textContent=campaign.player_notes||'Keine Hinweise veröffentlicht.';details.append(dayLabel,day,roleLabel,role);root.append(heading,summary,details,notesHeading,notes)
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
      const controls=selected?[]:[button('CBP ansehen',()=>selectPlayerCharacter(state,character))];
      if(state.hasLocalCharacterId?.(character.character_id)&&typeof state.selectLocalCharacter==='function'&&character.character_id!==state.character?.id)controls.push(button('Auf diesem Gerät auswählen',()=>selectLocalCharacter(state,character.character_id)));
      list?.append(listItem(label,...controls));
    }
  }
  function renderViewedCharacter(state){
    const selected=state.playerCharacters?.find(character=>character.character_id===state.selectedServerCharacterId);
    text(state.dialog.querySelector('[data-viewed-character]'),selected?`Ausgewählte Kampagnenfigur: ${characterName(selected)} · ${campaignName(state,selected.campaign_id)} · ${statusLabel(selected.status)}`:'Für diese Kampagne ist noch keine eingereichte Figur ausgewählt. Lokale Entwürfe erhalten keine Spielabend-CBP.');
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
    renderViewedCharacter(state);
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
    state.selectedCampaignId=campaign.campaign_id;state.selectedServerCharacterId=null;
    const preferred=state.playerCharacters.find(character=>character.campaign_id===campaign.campaign_id&&character.character_id===state.character?.id);
    state.selectedServerCharacterId=(preferred||state.playerCharacters.find(character=>character.campaign_id===campaign.campaign_id))?.character_id||null;
    renderCampaigns(state,state.campaigns);renderPlayerCharacters(state,state.playerCharacters);renderViewedCharacter(state);updateSubmissionPreview(state);loadSelectedSessions(state).catch(error=>text(state.message,friendlyError(error)));
  }
  function selectPlayerCharacter(state,character){
    if(!isOwnedCharacter(state,character.character_id))return;
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

  function bindActions(state){
    state.form?.addEventListener('submit',async event=>{event.preventDefault();const input=state.form.querySelector('[data-auth-email]');try{await runBusy(state,async()=>{text(state.message,'Sicherer Anmeldelink wird angefordert …');const result=await state.auth.requestMagicLink(input?.value);text(state.message,`Anmeldelink an ${result.email} gesendet. Öffne die E-Mail und kehre danach hierher zurück.`)})}catch{}});
    state.dialog.querySelector('[data-sign-out]')?.addEventListener('click',async()=>{try{await runBusy(state,async()=>{await state.auth.signOut();await renderSession(state,null);text(state.message,'Du bist abgemeldet. Private Kampagnendaten wurden aus dieser Sitzung entfernt.')})}catch{}});
    state.dialog.querySelector('[data-invite-form]')?.addEventListener('submit',async event=>{event.preventDefault();const code=state.dialog.querySelector('[data-invite-code]')?.value||'';try{await runBusy(state,async()=>{await state.repository.redeemInvite(code);await refresh(state);text(state.message,'Kampagne erfolgreich zugeordnet. Jetzt kannst du die aktuelle Figur prüfen und einreichen.')})}catch{}});
    state.dialog.querySelector('[data-create-local-character]')?.addEventListener('click',()=>{
      if(typeof state.createLocalCharacter!=='function')return;
      try{const character=state.createLocalCharacter();if(!character?.id)throw new Error('Der neue lokale Entwurf konnte nicht angelegt werden.');state.character=character;state.selectedServerCharacterId=null;state.localDraftSelected=true;renderLocalCharacter(state);renderLocalCharacters(state);renderPlayerCharacters(state,state.playerCharacters);renderViewedCharacter(state);renderCharacterSessions(state,[]);updateSubmissionPreview(state);text(state.message,'Neuer lokaler Entwurf angelegt. Du kannst ihn im Charakterbau bearbeiten und später einreichen.')}catch(error){text(state.message,friendlyError(error))}
    });
    state.dialog.querySelector('[data-submit-character]')?.addEventListener('click',async()=>{if(!state.selectedCampaignId){text(state.message,'Bitte wähle zuerst eine Kampagne.');return}try{await runBusy(state,async()=>{const payload=state.submissionFactory(),keepPrivateCopy=!!state.dialog.querySelector('[data-keep-copy]')?.checked;text(state.message,'Die Figur wird serverseitig geprüft und eingereicht …');const receipt=await state.repository.submitCharacter(state.selectedCampaignId,payload,{keepPrivateCopy});state.applyReceipt?.(receipt,{keepPrivateCopy});state.selectedServerCharacterId=receipt.character_id;state.localDraftSelected=false;await refresh(state);text(state.message,'Figur eingereicht. Die lokale Fassung bleibt erhalten; die Spielleitung kann nun prüfen.')})}catch{}});
  }
  function clearPrivateView(state){state.sessionRequest++;state.campaigns=[];state.playerCharacters=[];state.selectedCampaignId=null;state.selectedCampaign=null;state.selectedServerCharacterId=null;state.localDraftSelected=false;clear(state.dialog.querySelector('[data-campaign-list]'));clear(state.dialog.querySelector('[data-player-characters]'));clear(state.dialog.querySelector('[data-character-sessions]'));renderLocalCharacters(state);renderSelectedCampaign(state,null);renderViewedCharacter(state)}
  function hideTentativeSession(state){state.authEpoch++;state.authUser=null;show(state.form,true);show(state.session,false);text(state.dialog.querySelector('[data-auth-user]'),'Angemeldetes Konto');clearPrivateView(state)}
  function createState(dialog,services={}){const Client=global.EberosSupabaseClient,provider=services.provider||new Client.SupabaseClientProvider();const state={dialog,provider,auth:services.auth||new Client.CampaignAuthGateway({provider}),repository:services.repository||new Client.SupabaseCampaignRepository({provider}),form:dialog.querySelector('[data-auth-form]'),session:dialog.querySelector('[data-auth-session]'),message:dialog.querySelector('[data-auth-message]'),busy:false,unsubscribe:null,authEpoch:0,authUser:null,selectedCampaignId:null,selectedServerCharacterId:null,sessionRequest:0,localDraftSelected:false,campaigns:[],playerCharacters:[],character:null,submissionFactory:null,applyReceipt:null,applySessionCbp:null,hasSessionCbp:null,hasLocalCharacterId:null,listLocalCharacters:null,selectLocalCharacter:null,createLocalCharacter:null};bindActions(state);states.set(dialog,state);return state}
  async function renderSession(state,user){
    const authEpoch=++state.authEpoch;
    state.authUser=user||null;show(state.form,!user);show(state.session,!!user);text(state.dialog.querySelector('[data-auth-user]'),user?.email||'Angemeldetes Konto');global.dispatchEvent?.(new CustomEvent('eberos:campaign-auth-change',{detail:{user:user||null}}));
    if(!user){clearPrivateView(state);return}
    text(state.message,'Kampagnen werden geladen …');
    try{await refresh(state);if(authEpoch===state.authEpoch)text(state.message,'Du bist sicher angemeldet.')}
    catch(error){if(authEpoch===state.authEpoch){hideTentativeSession(state);text(state.message,friendlyError(error))}throw error}
  }
  async function initialize(state){
    if(!state.auth.configured()){show(state.form,false);show(state.session,false);text(state.message,'Das verwaltete Supabase-Testprojekt ist lokal vorbereitet. Sobald die öffentliche Projektadresse eingetragen ist, kann hier die Anmeldung per E-Mail-Link beginnen.');return{configured:false,user:null}}
    show(state.form,true);text(state.message,'Vorhandene Kampagnensitzung wird geprüft …');
    try{const result=await state.auth.restoreSession();await renderSession(state,result.user);if(!state.unsubscribe)state.unsubscribe=await state.auth.onAuthStateChange(({user})=>renderSession(state,user).catch(error=>{if(!state.authUser)text(state.message,friendlyError(error))}));if(!result.user)text(state.message,'Für den Kampagnenbeitritt ist jetzt eine einmalige Anmeldung nötig. Open Play bleibt davon unberührt.');return{configured:true,user:result.user}}catch(error){if(state.authUser||!state.session?.hidden)hideTentativeSession(state);show(state.form,true);text(state.message,friendlyError(error));return{configured:true,user:null,error}}
  }
  async function open({root,dialog,character,services,submissionFactory,applyReceipt,applySessionCbp,hasSessionCbp,hasLocalCharacterId,listLocalCharacters,selectLocalCharacter,createLocalCharacter}={}){
    const view=root||dialog;if(!view)throw new TypeError('Der Kampagnenbereich fehlt.');if(view instanceof HTMLDialogElement){if(typeof view.showModal==='function'&&!view.open)view.showModal();else view.setAttribute('open','')}else view.hidden=false;const state=states.get(view)||createState(view,services);Object.assign(state,{character,submissionFactory,applyReceipt,applySessionCbp,hasSessionCbp,hasLocalCharacterId,listLocalCharacters,selectLocalCharacter,createLocalCharacter});renderLocalCharacter(state);renderLocalCharacters(state);updateSubmissionPreview(state);const session=await initialize(state);if(session.error)throw session.error;return{requiresAuthentication:!session.user,configured:session.configured,authenticated:!!session.user,changedDraft:false,status:character?.campaignProfile?.status||'local_draft'};
  }
  global.EberosCampaignEntry=Object.freeze({open,friendlyError});
})(globalThis);
