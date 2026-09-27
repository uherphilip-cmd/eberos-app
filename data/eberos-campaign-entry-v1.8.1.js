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
  function statusLabel(value){return({claimed:'Zugeordnet',submitted:'Eingereicht',approved_locked:'Bestätigt & fixiert',change_pending:'Änderung wartet',rejected:'Abgelehnt',retired:'Im Ruhestand'})[value]||value||'Unbekannt'}
  function dateLabel(value){if(!value)return'ohne Datum';try{return new Intl.DateTimeFormat('de-DE').format(new Date(`${value}T12:00:00`))}catch{return value}}
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
    if(!campaigns.length){list?.append(listItem('Noch keine Kampagne zugeordnet.'));renderSelectedCampaign(state,null);return}
    for(const campaign of campaigns){
      const role=campaign.role==='owner'?'Spielleitung':campaign.role==='game_master'?'Co-Spielleitung':'Spieler';
      list?.append(listItem(`${campaign.name||'Unbenannte Kampagne'} · ${role} · Tag ${campaign.current_day||1}`,button('Auswählen',()=>{state.selectedCampaignId=campaign.campaign_id;state.selectedCampaign=campaign;renderSelectedCampaign(state,campaign);updateSubmissionPreview(state)})));
    }
    if(!state.selectedCampaignId){state.selectedCampaignId=campaigns[0].campaign_id;state.selectedCampaign=campaigns[0]}
    const selected=campaigns.find(campaign=>campaign.campaign_id===state.selectedCampaignId)||campaigns[0];state.selectedCampaignId=selected.campaign_id;state.selectedCampaign=selected;renderSelectedCampaign(state,selected)
  }
  function renderPlayerCharacters(state,characters){
    const list=state.dialog.querySelector('[data-player-characters]');clear(list);
    if(!characters.length){list?.append(listItem('Noch keine Figur eingereicht.'));return}
    for(const character of characters)list?.append(listItem(`${statusLabel(character.status)} · Revision ${character.revision||0}${character.rejection_reason?` · ${character.rejection_reason}`:''}`));
  }
  function renderCharacterSessions(state,sessions){
    const list=state.dialog.querySelector('[data-character-sessions]');clear(list);
    if(!sessions.length){list?.append(listItem('Keine offenen Spielabend-CBP für diese Figur.'));return}
    for(const session of sessions){
      const label=`${session.title} · ${dateLabel(session.session_date)} · +${session.amount} CBP`;
      if(session.ledger_id){
        if(state.hasSessionCbp?.(session.ledger_id))list?.append(listItem(`${label} · gutgeschrieben`));
        else list?.append(listItem(`${label} · serverseitig gebucht`,button('In lokale Figur übernehmen',()=>applyExistingSessionCbp(state,session))));
      }else list?.append(listItem(label,button('CBP übernehmen',()=>claimSessionCbp(state,session))));
    }
  }
  async function applyExistingSessionCbp(state,session){
    try{await runBusy(state,async()=>{state.applySessionCbp?.({ledger_id:session.ledger_id,campaign_id:session.campaign_id,session_id:session.session_id,character_id:session.character_id,amount:session.amount,title:session.title,session_date:session.session_date,status:'claimed'});await refresh(state);text(state.message,'Die bereits gebuchten CBP wurden in die lokale Figur übernommen.')})}catch{}
  }
  async function claimSessionCbp(state,session){
    try{await runBusy(state,async()=>{const receipt=await state.repository.claimSessionCbp(session.session_id,session.character_id);state.applySessionCbp?.(receipt);await refresh(state);text(state.message,`+${receipt.amount} CBP aus „${receipt.title}“ wurden nachvollziehbar gutgeschrieben.`)})}catch{}
  }
  async function refresh(state){
    const [campaigns,characters]=await Promise.all([state.repository.listPlayerCampaigns(),state.repository.listPlayerCharacters()]);
    let sessions=[];if(state.character?.id)try{sessions=await state.repository.listCharacterSessions(state.character.id)}catch(error){if(!/relation .* does not exist|schema cache/i.test(error?.message||''))throw error}
    renderCampaigns(state,campaigns);renderPlayerCharacters(state,characters);renderCharacterSessions(state,sessions);updateSubmissionPreview(state);return{campaigns,characters,sessions};
  }
  async function runBusy(state,operation){if(state.busy)return;setBusy(state,true);try{return await operation()}catch(error){text(state.message,friendlyError(error));throw error}finally{setBusy(state,false)}}

  function bindActions(state){
    state.form?.addEventListener('submit',async event=>{event.preventDefault();const input=state.form.querySelector('[data-auth-email]');try{await runBusy(state,async()=>{text(state.message,'Sicherer Anmeldelink wird angefordert …');const result=await state.auth.requestMagicLink(input?.value);text(state.message,`Anmeldelink an ${result.email} gesendet. Öffne die E-Mail und kehre danach hierher zurück.`)})}catch{}});
    state.dialog.querySelector('[data-sign-out]')?.addEventListener('click',async()=>{try{await runBusy(state,async()=>{await state.auth.signOut();await renderSession(state,null);text(state.message,'Du bist abgemeldet. Private Kampagnendaten wurden aus dieser Sitzung entfernt.')})}catch{}});
    state.dialog.querySelector('[data-invite-form]')?.addEventListener('submit',async event=>{event.preventDefault();const code=state.dialog.querySelector('[data-invite-code]')?.value||'';try{await runBusy(state,async()=>{await state.repository.redeemInvite(code);await refresh(state);text(state.message,'Kampagne erfolgreich zugeordnet. Jetzt kannst du die aktuelle Figur prüfen und einreichen.')})}catch{}});
    state.dialog.querySelector('[data-submit-character]')?.addEventListener('click',async()=>{if(!state.selectedCampaignId){text(state.message,'Bitte wähle zuerst eine Kampagne.');return}try{await runBusy(state,async()=>{const payload=state.submissionFactory(),keepPrivateCopy=!!state.dialog.querySelector('[data-keep-copy]')?.checked;text(state.message,'Die Figur wird serverseitig geprüft und eingereicht …');const receipt=await state.repository.submitCharacter(state.selectedCampaignId,payload,{keepPrivateCopy});state.applyReceipt?.(receipt,{keepPrivateCopy});await refresh(state);text(state.message,'Figur eingereicht. Die lokale Fassung bleibt erhalten; die Spielleitung kann nun prüfen.')})}catch{}});
  }
  function createState(dialog,services={}){const Client=global.EberosSupabaseClient,provider=services.provider||new Client.SupabaseClientProvider();const state={dialog,provider,auth:services.auth||new Client.CampaignAuthGateway({provider}),repository:services.repository||new Client.SupabaseCampaignRepository({provider}),form:dialog.querySelector('[data-auth-form]'),session:dialog.querySelector('[data-auth-session]'),message:dialog.querySelector('[data-auth-message]'),busy:false,unsubscribe:null,selectedCampaignId:null,character:null,submissionFactory:null,applyReceipt:null,applySessionCbp:null,hasSessionCbp:null};bindActions(state);states.set(dialog,state);return state}
  async function renderSession(state,user){show(state.form,!user);show(state.session,!!user);text(state.dialog.querySelector('[data-auth-user]'),user?.email||'Angemeldetes Konto');global.dispatchEvent?.(new CustomEvent('eberos:campaign-auth-change',{detail:{user:user||null}}));if(!user){clear(state.dialog.querySelector('[data-campaign-list]'));clear(state.dialog.querySelector('[data-character-sessions]'));renderSelectedCampaign(state,null);return}text(state.message,'Kampagnen werden geladen …');await refresh(state);text(state.message,'Du bist sicher angemeldet.')}
  async function initialize(state){
    if(!state.auth.configured()){show(state.form,false);show(state.session,false);text(state.message,'Das verwaltete Supabase-Testprojekt ist lokal vorbereitet. Sobald die öffentliche Projektadresse eingetragen ist, kann hier die Anmeldung per E-Mail-Link beginnen.');return{configured:false,user:null}}
    show(state.form,true);text(state.message,'Vorhandene Kampagnensitzung wird geprüft …');
    try{const result=await state.auth.restoreSession();await renderSession(state,result.user);if(!state.unsubscribe)state.unsubscribe=await state.auth.onAuthStateChange(({user})=>renderSession(state,user).catch(error=>text(state.message,friendlyError(error))));if(!result.user)text(state.message,'Für den Kampagnenbeitritt ist jetzt eine einmalige Anmeldung nötig. Open Play bleibt davon unberührt.');return{configured:true,user:result.user}}catch(error){show(state.form,true);text(state.message,friendlyError(error));return{configured:true,user:null,error}}
  }
  async function open({root,dialog,character,services,submissionFactory,applyReceipt,applySessionCbp,hasSessionCbp}={}){
    const view=root||dialog;if(!view)throw new TypeError('Der Kampagnenbereich fehlt.');const name=String(character?.name||'').trim()||'Unbenannte Figur';text(view.querySelector('[data-campaign-character]'),name);text(view.querySelector('[data-campaign-status]'),statusLabel(character?.campaignProfile?.status==='local_draft'?'Lokaler Entwurf · noch nicht eingereicht':character?.campaignProfile?.status));if(view instanceof HTMLDialogElement){if(typeof view.showModal==='function'&&!view.open)view.showModal();else view.setAttribute('open','')}else view.hidden=false;const state=states.get(view)||createState(view,services);Object.assign(state,{character,submissionFactory,applyReceipt,applySessionCbp,hasSessionCbp});updateSubmissionPreview(state);const session=await initialize(state);return{requiresAuthentication:!session.user,configured:session.configured,authenticated:!!session.user,changedDraft:false,status:character?.campaignProfile?.status||'local_draft'};
  }
  global.EberosCampaignEntry=Object.freeze({open,friendlyError});
})(globalThis);
