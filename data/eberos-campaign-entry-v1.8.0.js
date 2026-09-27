'use strict';

/* Wird erst nach der bewussten Aktion „Kampagne beitreten“ geladen. */
(function installCampaignEntry(global){
  const states=new WeakMap();
  const text=(node,value)=>{if(node)node.textContent=value};
  const show=(node,visible)=>{if(node)node.hidden=!visible};
  const clear=node=>node?.replaceChildren();
  const button=(label,action)=>{const node=document.createElement('button');node.type='button';node.textContent=label;node.addEventListener('click',action);return node};
  const listItem=(label,...controls)=>{const item=document.createElement('li');item.append(document.createTextNode(label),...controls);return item};

  function friendlyError(error){
    if(error?.code==='CAMPAIGN_BACKEND_NOT_CONFIGURED')return'Das Supabase-Testprojekt ist noch nicht verbunden.';
    if(error?.status===429)return'Zu viele Versuche. Bitte warte kurz und versuche es später erneut.';
    return error?.message||'Die Kampagnenaktion konnte nicht abgeschlossen werden.';
  }
  function setBusy(state,busy){
    state.busy=busy;
    for(const control of state.dialog.querySelectorAll('button,input,textarea,select'))if(!control.matches('[data-close]'))control.disabled=busy;
  }
  function statusLabel(value){return({claimed:'Zugeordnet',submitted:'Eingereicht',approved_locked:'Bestätigt & fixiert',change_pending:'Änderung wartet',rejected:'Abgelehnt',retired:'Im Ruhestand'})[value]||value||'Unbekannt'}

  function updateSubmissionPreview(state){
    const preview=state.dialog.querySelector('[data-submit-preview]');if(!preview)return;
    try{
      const payload=state.submissionFactory?.(),costs=payload?.clientCosts||{};
      text(preview,`${payload?.character?.name||'Unbenannte Figur'} · Schema ${payload?.schemaVersion} · Regelstand ${payload?.rulesVersion} · ${costs.spent??'?'} / ${costs.total??'?'} CBP · Rest ${costs.rest??'?'}`);
      preview.classList.toggle('error',false);
    }catch(error){text(preview,friendlyError(error));preview.classList.toggle('error',true)}
  }

  function renderCampaigns(state,campaigns){
    const list=state.dialog.querySelector('[data-campaign-list]');clear(list);
    if(!campaigns.length){list?.append(listItem('Noch keine Kampagne zugeordnet.'));return}
    for(const campaign of campaigns){
      const role=campaign.role==='owner'?'Spielleitung':campaign.role==='game_master'?'Co-Spielleitung':'Spieler';
      list?.append(listItem(`${campaign.name||'Unbenannte Kampagne'} · ${role} · Tag ${campaign.current_day||1}`,button('Auswählen',()=>{
        state.selectedCampaignId=campaign.campaign_id;state.selectedCampaign=campaign;
        text(state.dialog.querySelector('[data-selected-campaign]'),`Ausgewählt: ${campaign.name} · ${campaign.summary||'Keine Kurzbeschreibung'}`);
        updateSubmissionPreview(state);
      })));
    }
    if(!state.selectedCampaignId){state.selectedCampaignId=campaigns[0].campaign_id;state.selectedCampaign=campaigns[0];text(state.dialog.querySelector('[data-selected-campaign]'),`Ausgewählt: ${campaigns[0].name}`)}
  }

  function renderPlayerCharacters(state,characters){
    const list=state.dialog.querySelector('[data-player-characters]');clear(list);
    if(!characters.length){list?.append(listItem('Noch keine Figur eingereicht.'));return}
    for(const character of characters)list?.append(listItem(`${statusLabel(character.status)} · Revision ${character.revision||0}${character.rejection_reason?` · ${character.rejection_reason}`:''}`));
  }

  async function renderManagedCampaign(state,campaign){
    state.managedCampaignId=campaign.campaign_id;state.managedCampaign=campaign;
    const tools=state.dialog.querySelector('[data-gm-campaign-tools]');show(tools,true);
    text(state.dialog.querySelector('[data-invite-output]'),`Verwaltung: ${campaign.name} · Tag ${campaign.current_day||1}`);
    const pending=await state.repository.listPendingCharacters(campaign.campaign_id),list=state.dialog.querySelector('[data-pending-characters]');clear(list);
    if(!pending.length)list?.append(listItem('Keine offene Figurenprüfung.'));
    for(const character of pending){
      const name=character.public_data?.name||character.character_id;
      list?.append(listItem(`${name} · ${statusLabel(character.status)} · Revision ${character.revision||0}`,
        button('Annehmen',()=>reviewCharacter(state,character.character_id,'approve')),
        button('Ablehnen',()=>reviewCharacter(state,character.character_id,'reject'))));
    }
  }

  function renderManagedCampaigns(state,campaigns){
    const list=state.dialog.querySelector('[data-managed-campaign-list]');clear(list);
    if(!campaigns.length){list?.append(listItem('Noch keine eigene Kampagne.'));show(state.dialog.querySelector('[data-gm-campaign-tools]'),false);return}
    for(const campaign of campaigns)list?.append(listItem(`${campaign.name} · Tag ${campaign.current_day||1}`,button('Verwalten',()=>runBusy(state,async()=>renderManagedCampaign(state,campaign)))));
  }

  async function reviewCharacter(state,characterId,decision){
    let reason='';
    if(decision==='reject'){reason=global.prompt?.('Kurze Begründung für die Ablehnung:','')||'';if(!reason.trim())return}
    await runBusy(state,async()=>{await state.repository.reviewCharacter(characterId,decision,reason);await renderManagedCampaign(state,state.managedCampaign);await refresh(state);text(state.message,decision==='approve'?'Figur bestätigt und Ausgangsrevision fixiert.':'Einreichung mit Begründung abgelehnt.')});
  }

  async function refresh(state){
    const [campaigns,managed,characters]=await Promise.all([state.repository.listPlayerCampaigns(),state.repository.listManagedCampaigns(),state.repository.listPlayerCharacters()]);
    renderCampaigns(state,campaigns);renderManagedCampaigns(state,managed);renderPlayerCharacters(state,characters);updateSubmissionPreview(state);
    return{campaigns,managed,characters};
  }
  async function runBusy(state,operation){
    if(state.busy)return;setBusy(state,true);
    try{return await operation()}catch(error){text(state.message,friendlyError(error));throw error}finally{setBusy(state,false)}
  }

  function bindActions(state){
    state.form?.addEventListener('submit',async event=>{
      event.preventDefault();const input=state.form.querySelector('[data-auth-email]');
      try{await runBusy(state,async()=>{text(state.message,'Sicherer Anmeldelink wird angefordert …');const result=await state.auth.requestMagicLink(input?.value);text(state.message,`Anmeldelink an ${result.email} gesendet. Öffne die E-Mail und kehre danach hierher zurück.`)})}catch{}
    });
    state.dialog.querySelector('[data-sign-out]')?.addEventListener('click',async()=>{try{await runBusy(state,async()=>{await state.auth.signOut();await renderSession(state,null);text(state.message,'Du bist abgemeldet. Private Kampagnendaten wurden aus dieser Sitzung entfernt.')})}catch{}});
    state.dialog.querySelector('[data-invite-form]')?.addEventListener('submit',async event=>{
      event.preventDefault();const code=state.dialog.querySelector('[data-invite-code]')?.value||'';
      try{await runBusy(state,async()=>{await state.repository.redeemInvite(code);await refresh(state);text(state.message,'Kampagne erfolgreich zugeordnet. Jetzt kannst du die aktuelle Figur prüfen und einreichen.')})}catch{}
    });
    state.dialog.querySelector('[data-submit-character]')?.addEventListener('click',async()=>{
      if(!state.selectedCampaignId){text(state.message,'Bitte wähle zuerst eine Kampagne.');return}
      try{await runBusy(state,async()=>{
        const payload=state.submissionFactory(),keepPrivateCopy=!!state.dialog.querySelector('[data-keep-copy]')?.checked;
        text(state.message,'Die Figur wird serverseitig geprüft und eingereicht …');
        const receipt=await state.repository.submitCharacter(state.selectedCampaignId,payload,{keepPrivateCopy});state.applyReceipt?.(receipt,{keepPrivateCopy});
        await refresh(state);text(state.message,'Figur eingereicht. Die lokale Fassung bleibt erhalten; die Spielleitung kann nun prüfen.');
      })}catch{}
    });
    state.dialog.querySelector('[data-campaign-create-form]')?.addEventListener('submit',async event=>{
      event.preventDefault();const form=event.currentTarget;
      try{await runBusy(state,async()=>{const created=await state.repository.createCampaign({worldName:form.querySelector('[data-world-name]').value,campaignName:form.querySelector('[data-campaign-name]').value,summary:form.querySelector('[data-campaign-summary]').value});form.reset();await refresh(state);text(state.message,`Kampagne „${created.name}“ wurde angelegt.`)})}catch{}
    });
    state.dialog.querySelector('[data-create-invite]')?.addEventListener('click',async()=>{
      if(!state.managedCampaignId)return;
      try{await runBusy(state,async()=>{const invite=await state.repository.createInvite(state.managedCampaignId,{label:'Builder-Einladung',maxUses:1});text(state.dialog.querySelector('[data-invite-output]'),`Einladungscode: ${invite.code} · einmalig verwendbar`);text(state.message,'Einladungscode erstellt. Gib ihn nur an die eingeladene Person weiter.')})}catch{}
    });
    state.dialog.querySelector('[data-session-form]')?.addEventListener('submit',async event=>{
      event.preventDefault();if(!state.managedCampaignId)return;const form=event.currentTarget;
      try{await runBusy(state,async()=>{await state.repository.createSession(state.managedCampaignId,{title:form.querySelector('[data-session-title]').value,date:form.querySelector('[data-session-date]').value,depth:form.querySelector('[data-session-depth]').value,summary:form.querySelector('[data-session-summary]').value});form.reset();text(state.message,'Spielabend gespeichert und protokolliert.')})}catch{}
    });
    state.dialog.querySelector('[data-thread-form]')?.addEventListener('submit',async event=>{
      event.preventDefault();if(!state.managedCampaignId)return;const form=event.currentTarget;
      try{await runBusy(state,async()=>{await state.repository.createThread(state.managedCampaignId,{title:form.querySelector('[data-thread-title]').value,details:form.querySelector('[data-thread-details]').value});form.reset();text(state.message,'Handlungsfaden gespeichert und protokolliert.')})}catch{}
    });
  }

  function createState(dialog,services={}){
    const Client=global.EberosSupabaseClient,provider=services.provider||new Client.SupabaseClientProvider();
    const state={dialog,provider,auth:services.auth||new Client.CampaignAuthGateway({provider}),repository:services.repository||new Client.SupabaseCampaignRepository({provider}),form:dialog.querySelector('[data-auth-form]'),session:dialog.querySelector('[data-auth-session]'),message:dialog.querySelector('[data-auth-message]'),busy:false,unsubscribe:null,selectedCampaignId:null,managedCampaignId:null,character:null,submissionFactory:null,applyReceipt:null};
    bindActions(state);states.set(dialog,state);return state;
  }
  async function renderSession(state,user){
    show(state.form,!user);show(state.session,!!user);text(state.dialog.querySelector('[data-auth-user]'),user?.email||'Angemeldetes Konto');
    if(!user){clear(state.dialog.querySelector('[data-campaign-list]'));return}
    text(state.message,'Kampagnen werden geladen …');await refresh(state);text(state.message,'Du bist sicher angemeldet.');
  }
  async function initialize(state){
    if(!state.auth.configured()){
      show(state.form,false);show(state.session,false);
      text(state.message,'Das verwaltete Supabase-Testprojekt ist lokal vorbereitet. Sobald die öffentliche Projektadresse eingetragen ist, kann hier die Anmeldung per E-Mail-Link beginnen.');
      return{configured:false,user:null};
    }
    show(state.form,true);text(state.message,'Vorhandene Kampagnensitzung wird geprüft …');
    try{
      const result=await state.auth.restoreSession();await renderSession(state,result.user);
      if(!state.unsubscribe)state.unsubscribe=await state.auth.onAuthStateChange(({user})=>renderSession(state,user).catch(error=>text(state.message,friendlyError(error))));
      if(!result.user)text(state.message,'Für den Kampagnenbeitritt ist jetzt eine einmalige Anmeldung nötig. Open Play bleibt davon unberührt.');
      return{configured:true,user:result.user};
    }catch(error){show(state.form,true);text(state.message,friendlyError(error));return{configured:true,user:null,error}}
  }
  async function open({dialog,character,services,submissionFactory,applyReceipt}={}){
    if(!dialog)throw new TypeError('Der Kampagnendialog fehlt.');
    const name=String(character?.name||'').trim()||'Unbenannte Figur';text(dialog.querySelector('[data-campaign-character]'),name);
    text(dialog.querySelector('[data-campaign-status]'),statusLabel(character?.campaignProfile?.status==='local_draft'?'Lokaler Entwurf · noch nicht eingereicht':character?.campaignProfile?.status));
    if(typeof dialog.showModal==='function'&&!dialog.open)dialog.showModal();else dialog.setAttribute('open','');
    const state=states.get(dialog)||createState(dialog,services);state.character=character;state.submissionFactory=submissionFactory;state.applyReceipt=applyReceipt;updateSubmissionPreview(state);
    const session=await initialize(state);return{requiresAuthentication:!session.user,configured:session.configured,authenticated:!!session.user,changedDraft:false,status:character?.campaignProfile?.status||'local_draft'};
  }
  global.EberosCampaignEntry=Object.freeze({open,friendlyError});
})(globalThis);
