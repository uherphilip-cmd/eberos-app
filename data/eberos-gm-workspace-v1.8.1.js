'use strict';

/* Vollständige kampagnenbezogene Spielleiteransicht. */
(function installGameMasterWorkspace(global){
  const states=new WeakMap();
  const text=(node,value)=>{if(node)node.textContent=value};
  const show=(node,visible)=>{if(node)node.hidden=!visible};
  const clear=node=>node?.replaceChildren();
  const button=(label,action,className='')=>{const node=document.createElement('button');node.type='button';node.textContent=label;if(className)node.className=className;node.addEventListener('click',action);return node};
  const item=(label,...controls)=>{const node=document.createElement('li');node.append(document.createTextNode(label),...controls);return node};
  const field=(root,selector)=>root.querySelector(selector);
  function friendlyError(error){if(error?.code==='CAMPAIGN_BACKEND_NOT_CONFIGURED')return'Das Supabase-Testprojekt ist noch nicht verbunden.';if(error?.status===429)return'Zu viele Versuche. Bitte warte kurz.';return error?.message||'Die Spielleitungsaktion konnte nicht abgeschlossen werden.'}
  function statusLabel(value){return({planned:'Geplant',open:'CBP-Abholung offen',completed:'Abgeschlossen',closed:'Geschlossen',claimed:'Zugeordnet',submitted:'Eingereicht',approved_locked:'Bestätigt',change_pending:'Änderung wartet',rejected:'Abgelehnt',retired:'Im Ruhestand'})[value]||value||'Unbekannt'}
  function dateLabel(value){if(!value)return'ohne Datum';try{return new Intl.DateTimeFormat('de-DE').format(new Date(`${value}T12:00:00`))}catch{return value}}
  function setBusy(state,busy){state.busy=busy;for(const control of state.dialog.querySelectorAll('button,input,textarea,select'))if(!control.matches('[data-close]'))control.disabled=busy}
  async function runBusy(state,operation){if(state.busy)return;setBusy(state,true);try{return await operation()}catch(error){text(state.message,friendlyError(error));throw error}finally{setBusy(state,false)}}

  function activateView(state,name){
    state.activeView=name;
    for(const control of state.dialog.querySelectorAll('[data-gm-view]'))control.classList.toggle('active',control.dataset.gmView===name);
    for(const panel of state.dialog.querySelectorAll('[data-gm-panel]'))panel.hidden=panel.dataset.gmPanel!==name;
  }
  function renderWorldOptions(state){
    const select=field(state.dialog,'[data-gm-world-select]');clear(select);
    const fresh=document.createElement('option');fresh.value='__new__';fresh.textContent='Neue Welt bewusst anlegen';select?.append(fresh);
    for(const world of state.worlds){const option=document.createElement('option');option.value=world.world_id;option.textContent=`Vorhandene Welt: ${world.name}`;select?.append(option)}
    if(state.worlds[0])select.value=state.worlds[0].world_id;
    updateWorldChoice(state);
  }
  function updateWorldChoice(state){const select=field(state.dialog,'[data-gm-world-select]'),wrap=field(state.dialog,'[data-gm-new-world]'),creating=select?.value==='__new__';show(wrap,creating);const input=field(state.dialog,'[data-gm-world-name]');if(input)input.required=creating}
  function renderCampaignTabs(state){
    const tabs=field(state.dialog,'[data-gm-campaign-tabs]');clear(tabs);
    if(!state.campaigns.length){tabs?.append(document.createTextNode('Noch keine Kampagne verwaltet.'));show(field(state.dialog,'[data-gm-workspace]'),false);return}
    if(!state.selectedCampaignId||!state.campaigns.some(entry=>entry.campaign_id===state.selectedCampaignId))state.selectedCampaignId=state.campaigns[0].campaign_id;
    for(const campaign of state.campaigns){const control=button(campaign.name,()=>runBusy(state,()=>selectCampaign(state,campaign.campaign_id)),'gm-campaign-tab');control.classList.toggle('active',campaign.campaign_id===state.selectedCampaignId);control.setAttribute('aria-pressed',String(campaign.campaign_id===state.selectedCampaignId));tabs?.append(control)}
  }
  function fillCampaignForm(state,campaign){
    const form=field(state.dialog,'[data-gm-campaign-edit]');if(!form)return;
    field(form,'[data-gm-edit-name]').value=campaign.name||'';field(form,'[data-gm-edit-summary]').value=campaign.summary||'';field(form,'[data-gm-edit-player-notes]').value=campaign.player_notes||'';field(form,'[data-gm-edit-notes]').value=campaign.gm_notes||'';field(form,'[data-gm-edit-day]').value=campaign.current_day||1;
  }
  function renderOverview(state,data){
    const root=field(state.dialog,'[data-gm-overview]');clear(root);const campaign=state.selectedCampaign;
    const values=[['Welt',state.worlds.find(world=>world.world_id===campaign.world_id)?.name||campaign.world_id],['Kampagnentag',campaign.current_day||1],['Figuren',data.characters.length],['Offene Prüfungen',data.pending.length],['Spielabende',data.sessions.length],['Offene CBP-Abholungen',data.sessions.reduce((sum,session)=>sum+Math.max(0,(+session.eligible_character_count||0)-(+session.claimed_count||0)),0)],['Handlungsfäden',data.threads.length],['Verdeckte Folgen',data.impacts.length]];
    const dl=document.createElement('dl');dl.className='gm-stat-grid';for(const [label,value] of values){const wrap=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=String(value);wrap.append(dt,dd);dl.append(wrap)}root?.append(dl);
  }
  function renderCharacters(state,characters,pending){
    const list=field(state.dialog,'[data-gm-characters]');clear(list);if(!characters.length)list?.append(item('Noch keine Figur mit dieser Kampagne verbunden.'));
    for(const character of characters){const name=character.public_data?.name||character.id;list?.append(item(`${name} · ${statusLabel(character.status)} · Revision ${character.revision||0}`))}
    const review=field(state.dialog,'[data-gm-pending]');clear(review);if(!pending.length)review?.append(item('Keine offene Figurenprüfung.'));
    for(const character of pending){const name=character.public_data?.name||character.character_id;review?.append(item(`${name} · ${statusLabel(character.status)} · Revision ${character.revision||0}`,button('Annehmen',()=>reviewCharacter(state,character.character_id,'approve')),button('Ablehnen',()=>reviewCharacter(state,character.character_id,'reject'),'danger')))}
  }
  function renderSessions(state,sessions){
    const list=field(state.dialog,'[data-gm-sessions]');clear(list);if(!sessions.length)list?.append(item('Noch kein Spielabend angelegt.'));
    for(const session of sessions){const cbp=+session.default_cbp?` · ${session.default_cbp} CBP · ${session.claimed_count||0}/${session.eligible_character_count||0} abgeholt`:'';list?.append(item(`${session.title} · ${dateLabel(session.session_date)} · ${statusLabel(session.status)}${cbp}`))}
  }
  function renderThreads(state,threads){const list=field(state.dialog,'[data-gm-threads]');clear(list);if(!threads.length)list?.append(item('Noch kein Handlungsfaden angelegt.'));for(const thread of threads)list?.append(item(`${thread.title} · ${statusLabel(thread.status)}${thread.player_visible?' · sichtbar':' · geheim'}`))}
  function renderImpacts(state,impacts){const list=field(state.dialog,'[data-gm-impacts]');clear(list);if(!impacts.length)list?.append(item('Keine verdeckte Folge aus einer anderen Kampagne.'));for(const impact of impacts)list?.append(item(`${impact.impact_summary} · ${statusLabel(impact.status)}`))}

  async function selectCampaign(state,campaignId){
    state.selectedCampaignId=campaignId;state.selectedCampaign=state.campaigns.find(entry=>entry.campaign_id===campaignId);renderCampaignTabs(state);show(field(state.dialog,'[data-gm-workspace]'),true);fillCampaignForm(state,state.selectedCampaign);
    const [characters,pending,sessions,threads,impacts]=await Promise.all([state.repository.listCampaignCharacters(campaignId),state.repository.listPendingCharacters(campaignId),state.repository.listSessions(campaignId),state.repository.listThreads(campaignId),state.repository.listHiddenImpacts(campaignId)]);
    state.selectedData={characters,pending,sessions,threads,impacts};renderOverview(state,state.selectedData);renderCharacters(state,characters,pending);renderSessions(state,sessions);renderThreads(state,threads);renderImpacts(state,impacts);text(state.message,`Spielleitung: ${state.selectedCampaign.name}`);
  }
  async function refresh(state){
    const [worlds,campaigns]=await Promise.all([state.repository.listManagedWorlds(),state.repository.listManagedCampaigns()]);state.worlds=worlds;state.campaigns=campaigns;renderWorldOptions(state);renderCampaignTabs(state);if(state.selectedCampaignId)await selectCampaign(state,state.selectedCampaignId);return{worlds,campaigns};
  }
  async function reviewCharacter(state,characterId,decision){let reason='';if(decision==='reject'){reason=global.prompt?.('Kurze Begründung für die Ablehnung:','')||'';if(!reason.trim())return}try{await runBusy(state,async()=>{await state.repository.reviewCharacter(characterId,decision,reason);await selectCampaign(state,state.selectedCampaignId);text(state.message,decision==='approve'?'Figur bestätigt und Ausgangsrevision fixiert.':'Einreichung mit Begründung abgelehnt.')})}catch{}}

  function bindActions(state){
    for(const control of state.dialog.querySelectorAll('[data-gm-view]'))control.addEventListener('click',()=>activateView(state,control.dataset.gmView));
    field(state.dialog,'[data-gm-world-select]')?.addEventListener('change',()=>updateWorldChoice(state));
    state.authForm?.addEventListener('submit',async event=>{event.preventDefault();try{await runBusy(state,async()=>{const result=await state.auth.requestMagicLink(field(state.authForm,'[data-gm-auth-email]').value);text(state.message,`Anmeldelink an ${result.email} gesendet.`)})}catch{}});
    field(state.dialog,'[data-gm-sign-out]')?.addEventListener('click',async()=>{try{await runBusy(state,async()=>{await state.auth.signOut();await renderSession(state,null);text(state.message,'Du bist abgemeldet. Private Spielleitungsdaten wurden entfernt.')})}catch{}});
    field(state.dialog,'[data-gm-campaign-create]')?.addEventListener('submit',async event=>{event.preventDefault();const form=event.currentTarget,worldId=field(form,'[data-gm-world-select]').value;try{await runBusy(state,async()=>{const created=await state.repository.createCampaign({worldId:worldId==='__new__'?null:worldId,worldName:field(form,'[data-gm-world-name]').value,campaignName:field(form,'[data-gm-campaign-name]').value,summary:field(form,'[data-gm-campaign-summary]').value});state.selectedCampaignId=created.campaign_id;form.reset();await refresh(state);text(state.message,`Kampagne „${created.name}“ wurde ${worldId==='__new__'?'mit einer neuen Welt':'in der vorhandenen Welt'} angelegt.`)})}catch{}});
    field(state.dialog,'[data-gm-campaign-edit]')?.addEventListener('submit',async event=>{event.preventDefault();if(!state.selectedCampaignId)return;const form=event.currentTarget;try{await runBusy(state,async()=>{await state.repository.updateCampaign(state.selectedCampaignId,{name:field(form,'[data-gm-edit-name]').value,summary:field(form,'[data-gm-edit-summary]').value,playerNotes:field(form,'[data-gm-edit-player-notes]').value,gmNotes:field(form,'[data-gm-edit-notes]').value,currentDay:+field(form,'[data-gm-edit-day]').value});await refresh(state);text(state.message,'Kampagne gespeichert. Öffentliche und geheime Texte bleiben getrennt.')})}catch{}});
    field(state.dialog,'[data-gm-create-invite]')?.addEventListener('click',async()=>{if(!state.selectedCampaignId)return;try{await runBusy(state,async()=>{const invite=await state.repository.createInvite(state.selectedCampaignId,{label:'Spielleitungs-Einladung',maxUses:1});text(field(state.dialog,'[data-gm-invite-output]'),`Einladungscode: ${invite.code} · einmalig verwendbar`);text(state.message,'Einladungscode erstellt.')})}catch{}});
    field(state.dialog,'[data-gm-session-form]')?.addEventListener('submit',async event=>{event.preventDefault();if(!state.selectedCampaignId)return;const form=event.currentTarget,cross=field(form,'[data-gm-session-cross]').checked;try{await runBusy(state,async()=>{const receipt=await state.repository.createSession(state.selectedCampaignId,{title:field(form,'[data-gm-session-title]').value,date:field(form,'[data-gm-session-date]').value,depth:field(form,'[data-gm-session-depth]').value,summary:field(form,'[data-gm-session-summary]').value,notes:field(form,'[data-gm-session-notes]').value,playerVisible:field(form,'[data-gm-session-visible]').checked,status:field(form,'[data-gm-session-status]').value,defaultCbp:+field(form,'[data-gm-session-cbp]').value,crossCampaignDraft:cross,impactSummary:field(form,'[data-gm-session-impact]').value});form.reset();field(form,'[data-gm-session-visible]').checked=true;await selectCampaign(state,state.selectedCampaignId);text(state.message,`Spielabend gespeichert.${receipt.hidden_impact_count?` ${receipt.hidden_impact_count} verdeckte Folge(n) wurden vorgemerkt.`:''}`)})}catch{}});
    field(state.dialog,'[data-gm-thread-form]')?.addEventListener('submit',async event=>{event.preventDefault();if(!state.selectedCampaignId)return;const form=event.currentTarget;try{await runBusy(state,async()=>{await state.repository.createThread(state.selectedCampaignId,{title:field(form,'[data-gm-thread-title]').value,details:field(form,'[data-gm-thread-details]').value,playerVisible:field(form,'[data-gm-thread-visible]').checked});form.reset();await selectCampaign(state,state.selectedCampaignId);text(state.message,'Handlungsfaden gespeichert.')})}catch{}});
  }
  function createState(dialog,services={}){const Client=global.EberosSupabaseClient,provider=services.provider||new Client.SupabaseClientProvider(),state={dialog,provider,auth:services.auth||new Client.CampaignAuthGateway({provider}),repository:services.repository||new Client.SupabaseCampaignRepository({provider}),authForm:field(dialog,'[data-gm-auth-form]'),session:field(dialog,'[data-gm-session]'),message:field(dialog,'[data-gm-message]'),busy:false,unsubscribe:null,worlds:[],campaigns:[],selectedCampaignId:null,selectedCampaign:null,selectedData:null,activeView:'overview'};bindActions(state);states.set(dialog,state);return state}
  async function renderSession(state,user){show(state.authForm,!user);show(state.session,!!user);text(field(state.dialog,'[data-gm-auth-user]'),user?.email||'Angemeldetes Konto');if(!user){clear(field(state.dialog,'[data-gm-campaign-tabs]'));show(field(state.dialog,'[data-gm-workspace]'),false);return}text(state.message,'Spielleitungsdaten werden geladen …');await refresh(state);text(state.message,state.campaigns.length?'Spielleitung ist bereit.':'Lege deine erste Kampagne an oder verwende eine bestehende Welt.')}
  async function initialize(state){
    if(!state.auth.configured()){show(state.authForm,false);show(state.session,false);text(state.message,'Das Kampagnen-Backend ist noch nicht verbunden. Die lokale Charakterverwaltung bleibt verfügbar.');return{configured:false,user:null}}
    show(state.authForm,true);text(state.message,'Vorhandene Spielleitungssitzung wird geprüft …');
    try{const result=await state.auth.restoreSession();await renderSession(state,result.user);if(!state.unsubscribe)state.unsubscribe=await state.auth.onAuthStateChange(({user})=>renderSession(state,user).catch(error=>text(state.message,friendlyError(error))));if(!result.user)text(state.message,'Für die Spielleitung ist eine einmalige Anmeldung nötig.');return{configured:true,user:result.user}}catch(error){show(state.authForm,true);text(state.message,friendlyError(error));return{configured:true,user:null,error}}
  }
  async function open({root,dialog,services}={}){const view=root||dialog;if(!view)throw new TypeError('Die Spielleiteransicht fehlt.');if(view instanceof HTMLDialogElement){if(typeof view.showModal==='function'&&!view.open)view.showModal();else view.setAttribute('open','')}else view.hidden=false;const state=states.get(view)||createState(view,services);activateView(state,state.activeView);const session=await initialize(state);return{configured:session.configured,authenticated:!!session.user,campaigns:state.campaigns.length}}
  global.EberosGameMasterWorkspace=Object.freeze({open,friendlyError});
})(globalThis);
