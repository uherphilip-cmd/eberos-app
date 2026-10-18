'use strict';

/* Vollständige kampagnenbezogene Spielleiteransicht. */
(function installGameMasterWorkspace(global){
  const states=new WeakMap();
  const text=(node,value)=>{if(node)node.textContent=value};
  const show=(node,visible)=>{if(node)node.hidden=!visible};
  const clear=node=>node?.replaceChildren();
  const button=(label,action,className='')=>{const node=document.createElement('button');node.type='button';node.textContent=label;if(className)node.className=className;if(typeof action==='function')node.addEventListener('click',action);return node};
  const item=(label,...controls)=>{const node=document.createElement('li');node.append(document.createTextNode(label),...controls);return node};
  const field=(root,selector)=>root.querySelector(selector);
  const heading=(level,label)=>{const node=document.createElement(level);node.textContent=label;return node};
  const note=(label,className='muted')=>{const node=document.createElement('p');node.className=className;node.textContent=label;return node};
  const submitButton=label=>{const node=button(label);node.type='submit';return node};
  function friendlyError(error){const message=String(error?.message||'');if(error?.code==='CAMPAIGN_BACKEND_NOT_CONFIGURED')return'Das Supabase-Testprojekt ist noch nicht verbunden.';if(error?.status===429)return'Zu viele Versuche. Bitte warte kurz.';if(/invalid login credentials/i.test(message))return'E-Mail-Adresse oder Passwort ist falsch.';if(/email not confirmed/i.test(message))return'Bitte bestätige zuerst deine E-Mail-Adresse und melde dich danach mit deinem Passwort an.';if(/user already registered/i.test(message))return'Für diese E-Mail-Adresse besteht bereits ein Konto. Nutze „Passwort vergessen“, falls du noch kein Passwort hast.';if(/password should be at least/i.test(message))return'Das Passwort erfüllt die Mindestlänge noch nicht.';return message||'Die Spielleitungsaktion konnte nicht abgeschlossen werden.'}
  function statusLabel(value){return({planned:'Geplant',open:'CBP-Abholung offen',completed:'Abgeschlossen',closed:'Geschlossen',claimed:'Zugeordnet',submitted:'Eingereicht',approved_locked:'Bestätigt',change_pending:'Änderung wartet',rejected:'Abgelehnt',retired:'Im Ruhestand'})[value]||value||'Unbekannt'}
  function dateLabel(value){if(!value)return'ohne Datum';try{return new Intl.DateTimeFormat('de-DE').format(new Date(`${value}T12:00:00`))}catch{return value}}
  function timestampLabel(value){if(!value)return'ohne Zeitangabe';const date=new Date(value);return Number.isNaN(date.getTime())?String(value):new Intl.DateTimeFormat('de-DE',{dateStyle:'medium',timeStyle:'short'}).format(date)}
  function labelControl(label,control){const wrap=document.createElement('label');wrap.className='field';const caption=document.createElement('span');caption.textContent=label;wrap.append(caption,control);return wrap}
  function input(type,marker,options={}){const control=document.createElement('input');control.type=type;control.dataset[marker]='';for(const [name,value] of Object.entries(options))control[name]=value;return control}
  function select(marker,choices){const control=document.createElement('select');control.dataset[marker]='';for(const [value,label] of choices){const option=document.createElement('option');option.value=value;option.textContent=label;control.append(option)}return control}
  function textarea(marker,maxLength){const control=document.createElement('textarea');control.dataset[marker]='';control.maxLength=maxLength;return control}
  function setBusy(state,busy){state.busy=busy;for(const control of state.dialog.querySelectorAll('button,input,textarea,select'))if(!control.matches('[data-close]'))control.disabled=busy||control.dataset.gmPermanentDisabled==='true'}
  async function runBusy(state,operation){if(state.busy)return;setBusy(state,true);try{return await operation()}catch(error){text(state.message,friendlyError(error));throw error}finally{setBusy(state,false)}}
  function passwordPair(form,passwordSelector,confirmationSelector){const password=field(form,passwordSelector)?.value||'',confirmation=field(form,confirmationSelector)?.value||'';if(password!==confirmation)throw new Error('Die beiden Passwörter stimmen nicht überein.');return password}

  function activateView(state,name){
    state.activeView=name;
    for(const control of state.dialog.querySelectorAll('[data-gm-view]'))control.classList.toggle('active',control.dataset.gmView===name);
    for(const panel of state.dialog.querySelectorAll('[data-gm-panel]'))panel.hidden=panel.dataset.gmPanel!==name;
    if(name==='live'&&state.selectedCampaignId)loadLiveWorkspace(state);
    if(name==='beings'&&state.selectedCampaignId)loadCreatureWorkspace(state);
    if(name==='relationships'&&state.selectedCampaignId)loadRelationshipWorkspace(state);
    if(name==='places'&&state.selectedCampaignId)loadPlaceWorkspace(state);
    if(name==='events'&&state.selectedCampaignId)loadChronicleWorkspace(state);
    if(name==='time'&&state.selectedCampaignId)loadTimeWorkspace(state);
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
    const tabs=field(state.dialog,'[data-gm-campaign-tabs]'),select=field(state.dialog,'[data-gm-campaign-select]');clear(tabs);clear(select);
    if(!state.campaigns.length){
      const option=document.createElement('option');option.value='';option.textContent='Keine Kampagne mit Spielleitungsrecht';select?.append(option);if(select)select.disabled=true;
      tabs?.append(document.createTextNode('Für dieses Konto ist noch keine Kampagne als Spielleitung oder Co-Spielleitung freigegeben.'));show(field(state.dialog,'[data-gm-workspace]'),false);return
    }
    if(!state.selectedCampaignId||!state.campaigns.some(entry=>entry.campaign_id===state.selectedCampaignId))state.selectedCampaignId=state.campaigns[0].campaign_id;
    if(select)select.disabled=false;
    for(const campaign of state.campaigns){
      const option=document.createElement('option');option.value=campaign.campaign_id;option.textContent=campaign.name;select?.append(option);
      const control=button(campaign.name,()=>runBusy(state,()=>selectCampaign(state,campaign.campaign_id)),'gm-campaign-tab');control.classList.toggle('active',campaign.campaign_id===state.selectedCampaignId);control.setAttribute('aria-pressed',String(campaign.campaign_id===state.selectedCampaignId));tabs?.append(control)
    }
    if(select)select.value=state.selectedCampaignId;
  }
  function fillCampaignForm(state,campaign){
    const form=field(state.dialog,'[data-gm-campaign-edit]');if(!form)return;
    field(form,'[data-gm-edit-name]').value=campaign.name||'';field(form,'[data-gm-edit-summary]').value=campaign.summary||'';field(form,'[data-gm-edit-player-notes]').value=campaign.player_notes||'';field(form,'[data-gm-edit-notes]').value=campaign.gm_notes||'';const day=field(form,'[data-gm-edit-day]');day.value=campaign.current_day||1;day.readOnly=true;day.dataset.gmPermanentDisabled='true';
    renderPlayerPreview(state,campaign);
  }
  function renderPlayerPreview(state,campaign){text(field(state.dialog,'[data-gm-player-name]'),campaign?.name||'Unbenannte Kampagne');text(field(state.dialog,'[data-gm-player-summary]'),campaign?.summary||'Keine öffentliche Kurzbeschreibung.');text(field(state.dialog,'[data-gm-player-notes]'),campaign?.player_notes||'Keine Hinweise veröffentlicht.');text(field(state.dialog,'[data-gm-player-day]'),String(campaign?.current_day||1))}
  function editedCampaign(state){const form=field(state.dialog,'[data-gm-campaign-edit]');return{name:field(form,'[data-gm-edit-name]').value,summary:field(form,'[data-gm-edit-summary]').value,playerNotes:field(form,'[data-gm-edit-player-notes]').value,gmNotes:field(form,'[data-gm-edit-notes]').value,currentDay:+state.selectedCampaign?.current_day||1}}
  function renderOverview(state,data){
    const root=field(state.dialog,'[data-gm-overview]');clear(root);const campaign=state.selectedCampaign;
    const claimableSessions=new Map(data.sessions.filter(session=>session.player_visible&&['open','completed'].includes(session.status)).map(session=>[session.session_id,session]));
    const openCbp=Array.isArray(data.sessionCbp)?data.sessionCbp.filter(row=>claimableSessions.has(row.session_id)&&['approved_locked','change_pending'].includes(row.character_status)&&!row.ledger_id&&+row.offered_amount>0).length:data.sessions.filter(session=>claimableSessions.has(session.session_id)&&+session.default_cbp>0).reduce((sum,session)=>sum+Math.max(0,(+session.eligible_character_count||0)-(+session.claimed_count||0)),0);
    const values=[['Welt',state.worlds.find(world=>world.world_id===campaign.world_id)?.name||campaign.world_id],['Kampagnentag',campaign.current_day||1],['Figuren',data.characters.length],['Offene Prüfungen',data.pending.length],['Spielabende',data.sessions.length],['Offene CBP-Abholungen',openCbp],['Handlungsfäden',data.threads.length],['Verdeckte Folgen',data.impacts.length]];
    const dl=document.createElement('dl');dl.className='gm-stat-grid';for(const [label,value] of values){const wrap=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=String(value);wrap.append(dt,dd);dl.append(wrap)}root?.append(dl);
    const headingNode=heading('h4','Geschützte Gesamtverwaltung'),actions=document.createElement('div');actions.className='gm-live-actions';
    for(const [view,label] of [['live','Live-Modus öffnen'],['characters','Gruppe'],['sessions','Spielabende'],['beings','Wesen'],['places','Orte'],['events','Weltchronik'],['time','Zeit & Wetter']])actions.append(button(label,()=>activateView(state,view)));
    root?.append(headingNode,note('Alle tiefen Bereiche bleiben getrennt bearbeitbar; der Live-Modus bündelt nur die Angaben für den laufenden Abend.'),actions);
  }
  function ensureCharacterDetail(state){
    const list=field(state.dialog,'[data-gm-characters]');if(!list)return null;
    let detail=field(state.dialog,'[data-gm-character-detail]');if(detail)return detail;
    detail=document.createElement('section');detail.dataset.gmCharacterDetail='';detail.className='gm-player-preview';detail.hidden=true;detail.setAttribute('aria-label','Figurendetails');list.insertAdjacentElement('afterend',detail);return detail;
  }
  async function loadCharacterRevision(state,character){
    const revisionId=character.current_revision_id,authEpoch=state.authEpoch,campaignId=state.selectedCampaignId;if(!revisionId||typeof state.repository.listCharacterRevision!=='function'||state.revisionCache.has(revisionId)||state.revisionLoading.has(revisionId)||state.revisionErrors.has(revisionId))return;
    state.revisionLoading.add(revisionId);
    try{const rows=await state.repository.listCharacterRevision(revisionId),revision=rows.find(row=>row.id===revisionId&&row.character_id===character.id&&row.campaign_id===campaignId);if(authEpoch!==state.authEpoch||state.selectedCampaignId!==campaignId)return;if(!revision)throw new Error('Die Serverfassung dieser Figur konnte nicht gefunden werden.');state.revisionCache.set(revisionId,revision)}catch(error){if(authEpoch===state.authEpoch)state.revisionErrors.set(revisionId,friendlyError(error))}finally{state.revisionLoading.delete(revisionId);if(authEpoch===state.authEpoch&&state.selectedCharacterId===character.id)renderCharacterDetail(state)}
  }
  function renderCanonicalRevision(state,detail,character){
    const heading=document.createElement('h5');heading.textContent='Aktuelle Serverfassung';detail.append(heading);
    const revisionId=character.current_revision_id;if(!revisionId){const info=document.createElement('p');info.textContent='Für diese Figur gibt es noch keine Serverrevision.';detail.append(info);return}
    const revision=state.revisionCache.get(revisionId),error=state.revisionErrors.get(revisionId);
    if(!revision){const info=document.createElement('p');info.textContent=error||(typeof state.repository.listCharacterRevision==='function'?'Die Serverfassung wird geladen …':'Die Serverfassung ist derzeit nicht verfügbar.');detail.append(info);if(error)detail.append(button('Erneut laden',()=>{state.revisionErrors.delete(revisionId);renderCharacterDetail(state)}));else if(typeof state.repository.listCharacterRevision==='function')loadCharacterRevision(state,character);return}
    const canonical=revision.canonical_data?.character||{},origin=canonical.origin||{},costs=revision.server_validation?.costs||{};
    const facts=[['Revisionsstatus',statusLabel(revision.status)],['Name',canonical.name||'Unbenannt']];
    if(origin.place||origin.culture||origin.profession)facts.push(['Herkunft', [origin.place,origin.culture,origin.profession].filter(Boolean).join(' · ')]);
    if(costs.rest!==null&&costs.rest!==undefined&&Number.isFinite(Number(costs.rest)))facts.push(['Serverseitig geprüfter CBP-Rest bei dieser Revision',String(costs.rest)]);
    const dl=document.createElement('dl');for(const [label,value] of facts){const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=value;dl.append(dt,dd)}detail.append(dl);
    const attributes=canonical.attributes&&typeof canonical.attributes==='object'?Object.entries(canonical.attributes):[];
    if(attributes.length){const info=document.createElement('p');info.textContent=`Grundwerte: ${attributes.map(([key,value])=>`${key} ${value}`).join(' · ')}`;detail.append(info)}
    const counters=canonical.counters&&typeof canonical.counters==='object'?Object.entries(canonical.counters):[];
    if(counters.length){const info=document.createElement('p');info.textContent=`Counter: ${counters.map(([key,value])=>`${key} ${value?.current??'–'}/${value?.max??'–'}`).join(' · ')}`;detail.append(info)}
  }
  function renderCharacterDetail(state){
    const detail=ensureCharacterDetail(state),data=state.selectedData,character=data?.characters.find(row=>row.id===state.selectedCharacterId);
    clear(detail);show(detail,!!character);if(!detail||!character)return;
    const heading=document.createElement('h4');heading.textContent=character.public_data?.name||'Unbenannte Figur';detail.append(heading);
    const revisionLabel=['approved_locked','change_pending'].includes(character.status)?'Gültige Serverrevision':'Eingereichte Serverrevision';
    const facts=[['Besitzer-Konto',character.owner_user_id||'Unbekannt'],['Kampagnenstatus',statusLabel(character.status)],[revisionLabel,`${character.revision||0}${character.current_revision_id?` · ${character.current_revision_id}`:''}`]];
    const pending=data.pending.find(row=>row.character_id===character.id);
    facts.push(['Offene Prüfung',pending?statusLabel(pending.status):character.status==='submitted'||character.status==='change_pending'?statusLabel(character.status):'Keine']);
    const changeRequests=(data.changeRequests||[]).filter(row=>row.character_id===character.id);
    for(const request of changeRequests)facts.push(['Begründung des offenen Änderungsantrags',request.reason||'Keine Begründung hinterlegt']);
    if(character.status==='change_pending')facts.push(['Freigabe', 'Erst nach Ansicht der konkreten beantragten Änderungen möglich.']);
    if(character.rejection_reason)facts.push(['Letzte Ablehnung',character.rejection_reason]);
    const dl=document.createElement('dl');for(const [label,value] of facts){const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=value;dl.append(dt,dd)}detail.append(dl);
    renderCanonicalRevision(state,detail,character);
    const cbpHeading=document.createElement('h5');cbpHeading.textContent='CBP-Verlauf';detail.append(cbpHeading);
    const history=document.createElement('ul');detail.append(history);
    if(!Array.isArray(data.sessionCbp)){history.append(item('Der CBP-Verlauf ist derzeit nicht verfügbar.'));return}
    const rows=data.sessionCbp.filter(row=>row.character_id===character.id),sessions=new Map(data.sessions.map(row=>[row.session_id,row]));
    if(!rows.length){history.append(item('Noch keine Spielabend-CBP für diese Figur.'));return}
    for(const row of rows){const session=sessions.get(row.session_id),title=session?.title||'Spielabend';if(row.ledger_id)history.append(item(`${title} · Gebucht: ${row.claimed_amount} CBP · ${timestampLabel(row.claimed_at)}`));else{const claimable=session?.player_visible&&['open','completed'].includes(session.status),offer=+row.offered_amount>0?`${claimable?'Abholbar':'Vorgemerkt, derzeit nicht abholbar'}: ${row.offered_amount} CBP`:'Keine CBP angeboten';history.append(item(`${title} · ${offer} · noch nicht abgeholt`))}}
  }
  function renderCharacters(state,characters,pending){
    const list=field(state.dialog,'[data-gm-characters]');clear(list);if(!characters.length)list?.append(item('Noch keine Figur mit dieser Kampagne verbunden.'));
    if(!characters.some(character=>character.id===state.selectedCharacterId))state.selectedCharacterId=null;
    for(const character of characters){const name=character.public_data?.name||character.id;list?.append(item(`${name} · ${statusLabel(character.status)} · Revision ${character.revision||0}`,button('Details',()=>{state.selectedCharacterId=character.id;renderCharacterDetail(state)})))}
    const review=field(state.dialog,'[data-gm-pending]');clear(review);if(!pending.length)review?.append(item('Keine offene Figurenprüfung.'));
    for(const character of pending){
      const name=character.public_data?.name||character.character_id,needsDiff=character.status==='change_pending';
      const controls=character.status==='submitted'?[button('Annehmen',()=>reviewCharacter(state,character.character_id,'approve')),button('Ablehnen',()=>reviewCharacter(state,character.character_id,'reject'),'danger')]:[];
      review?.append(item(`${name} · ${statusLabel(character.status)} · Revision ${character.revision||0}${needsDiff?' · Antrag vorhanden; Freigabe erst nach Ansicht der konkreten Änderungen.':''}`,...controls));
    }
    renderCharacterDetail(state);
  }
  function ensureSessionEditor(state){
    const list=field(state.dialog,'[data-gm-sessions]');if(!list)return null;
    let editor=field(state.dialog,'[data-gm-session-editor]');if(editor)return editor;
    editor=document.createElement('section');editor.dataset.gmSessionEditor='';editor.className='gm-player-preview';editor.hidden=true;editor.setAttribute('aria-label','Gespeicherten Spielabend bearbeiten');
    const heading=document.createElement('h4');heading.dataset.gmEditSessionHeading='';editor.append(heading);
    const form=document.createElement('form');form.dataset.gmEditSessionForm='';
    form.append(labelControl('Titel',input('text','gmEditSessionTitle',{required:true,maxLength:160})),labelControl('Datum',input('date','gmEditSessionDate')),
      labelControl('Status',select('gmEditSessionStatus',[['planned','Geplant'],['open','CBP-Abholung geöffnet'],['completed','Abgeschlossen'],['closed','Geschlossen']])),
      labelControl('Dokumentation',select('gmEditSessionDepth',[['short','Kurz'],['normal','Normal'],['chronicle','Chronik']])),
      labelControl('CBP pro berechtigter Figur',input('number','gmEditSessionCbp',{required:true,min:0,max:999})),
      labelControl('Öffentliche Zusammenfassung',textarea('gmEditSessionSummary',50000)),
      labelControl('Geheime Spielleitungsnotizen',textarea('gmEditSessionNotes',100000)));
    const visibility=document.createElement('label');visibility.className='campaign-check';visibility.append(input('checkbox','gmEditSessionVisible'),document.createTextNode(' Für Spieler sichtbar'));form.append(visibility);
    const warning=document.createElement('p');warning.className='muted';warning.dataset.gmEditCbpWarning='';form.append(warning);
    form.append(button('Änderungen speichern'));form.lastElementChild.type='submit';
    form.addEventListener('submit',event=>{event.preventDefault();saveEditedSession(state,form)});editor.append(form);
    const cbpHeading=document.createElement('h5');cbpHeading.textContent='CBP je Figur';editor.append(cbpHeading);
    const cbpDetail=document.createElement('ul');cbpDetail.dataset.gmSessionCbpDetail='';editor.append(cbpDetail);list.insertAdjacentElement('afterend',editor);return editor;
  }
  function renderSessionCbpDetails(state,session){
    const list=field(state.dialog,'[data-gm-session-cbp-detail]');clear(list);if(!list)return;
    const rows=state.selectedData?.sessionCbp;if(!Array.isArray(rows)){list.append(item('Die Einzelübersicht der CBP ist derzeit nicht verfügbar.'));return}
    const matching=rows.filter(row=>row.session_id===session.session_id);
    if(!matching.length){list.append(item('Noch keine berechtigte Figur für diesen Abend.'));return}
    const claimable=['open','completed'].includes(session.status)&&session.player_visible;
    for(const row of matching){
      const eligible=['approved_locked','change_pending'].includes(row.character_status),name=row.character_name||state.selectedData.characters.find(character=>character.id===row.character_id)?.public_data?.name||'Unbenannte Figur';
      const label=row.ledger_id?`${name} · Gebucht: ${row.claimed_amount} CBP am ${timestampLabel(row.claimed_at)}`:!eligible?`${name} · ${statusLabel(row.character_status)} · nicht berechtigt`:+row.offered_amount>0?`${name} · ${claimable?'Abholbar':'Angeboten, derzeit nicht abholbar'}: ${row.offered_amount} CBP`:`${name} · Keine CBP angeboten`;
      const line=item(label);list.append(line);
      if(row.ledger_id){if(Number(row.claimed_amount)!==Number(row.offered_amount)){const note=document.createElement('small');note.textContent=` · Aktuelles Angebot ${row.offered_amount} CBP; Buchung bleibt unverändert`;line.append(note)}continue}
      if(!eligible||typeof state.repository.setSessionCbpOverride!=='function')continue;
      const form=document.createElement('form');form.dataset.gmSessionOverrideForm='';const amount=input('number','gmSessionOverrideAmount',{required:true,min:0,max:999});amount.value=String(row.override_amount??row.offered_amount??session.default_cbp??0);
      form.append(labelControl('Individueller CBP-Wert',amount));const save=button('Einzelwert speichern');save.type='submit';form.append(save);
      if(row.override_amount!==null&&row.override_amount!==undefined)form.append(button('Standardwert verwenden',()=>saveSessionOverride(state,session.session_id,row.character_id,null)));
      form.addEventListener('submit',event=>{event.preventDefault();saveSessionOverride(state,session.session_id,row.character_id,+amount.value)});line.append(form);
    }
  }
  function renderSessionEditor(state){
    const editor=ensureSessionEditor(state),session=state.selectedData?.sessions.find(row=>row.session_id===state.selectedSessionId);if(!editor)return;clear(field(editor,'[data-gm-session-cbp-detail]'));show(editor,!!session);if(!session)return;
    text(field(editor,'[data-gm-edit-session-heading]'),`${session.title} bearbeiten`);
    field(editor,'[data-gm-edit-session-title]').value=session.title||'';field(editor,'[data-gm-edit-session-date]').value=session.session_date||'';field(editor,'[data-gm-edit-session-status]').value=session.status||'planned';field(editor,'[data-gm-edit-session-depth]').value=session.depth||'short';
    const cbpInput=field(editor,'[data-gm-edit-session-cbp]'),claimed=+session.claimed_count>0;cbpInput.value=String(session.default_cbp??0);cbpInput.dataset.gmPermanentDisabled=String(claimed);cbpInput.disabled=state.busy||claimed;
    text(field(editor,'[data-gm-edit-cbp-warning]'),claimed?`Der Standard-CBP-Wert ist nach ${session.claimed_count} Buchung(en) eingefroren. Titel, Status und Texte bleiben bearbeitbar. Bereits gebuchte CBP und verdeckte Folgen werden nicht erneut erzeugt.`:'Bereits abgeholte CBP bleiben unverändert. Bestehende verdeckte Folgen werden beim Bearbeiten nicht erneut erzeugt.');
    field(editor,'[data-gm-edit-session-summary]').value=session.summary||'';field(editor,'[data-gm-edit-session-notes]').value=session.notes||'';field(editor,'[data-gm-edit-session-visible]').checked=!!session.player_visible;
    renderSessionCbpDetails(state,session);
  }
  async function saveEditedSession(state,form){
    const session=state.selectedData?.sessions.find(row=>row.session_id===state.selectedSessionId);if(!session)return;
    if(typeof state.repository.updateSession!=='function'){text(state.message,'Die Bearbeitung gespeicherter Spielabende ist noch nicht verfügbar.');return}
    const changes={title:field(form,'[data-gm-edit-session-title]').value,date:field(form,'[data-gm-edit-session-date]').value||null,status:field(form,'[data-gm-edit-session-status]').value,depth:field(form,'[data-gm-edit-session-depth]').value,defaultCbp:+field(form,'[data-gm-edit-session-cbp]').value,summary:field(form,'[data-gm-edit-session-summary]').value,notes:field(form,'[data-gm-edit-session-notes]').value,playerVisible:field(form,'[data-gm-edit-session-visible]').checked,expectedUpdatedAt:session.updated_at};
    try{await runBusy(state,async()=>{await state.repository.updateSession(session.session_id,changes);await selectCampaign(state,state.selectedCampaignId);text(state.message,'Spielabend aktualisiert. Bereits gebuchte CBP und verdeckte Folgen wurden nicht verändert.')})}catch{}
  }
  async function saveSessionOverride(state,sessionId,characterId,amount){
    const session=state.selectedData?.sessions.find(row=>row.session_id===sessionId);
    if(!session||typeof state.repository.setSessionCbpOverride!=='function')return;
    try{await runBusy(state,async()=>{await state.repository.setSessionCbpOverride(sessionId,characterId,amount,{expectedUpdatedAt:session.updated_at});await selectCampaign(state,state.selectedCampaignId);text(state.message,amount===null?'Für diese Figur gilt wieder der Standardwert.':'Individueller CBP-Wert gespeichert. Bereits gebuchte CBP bleiben unverändert.')})}catch{}
  }
  function renderSessions(state,sessions){
    const list=field(state.dialog,'[data-gm-sessions]');clear(list);if(!sessions.length)list?.append(item('Noch kein Spielabend angelegt.'));
    if(!sessions.some(session=>session.session_id===state.selectedSessionId))state.selectedSessionId=null;
    for(const session of sessions){const cbp=` · Standard ${session.default_cbp??0} CBP · ${session.claimed_count||0} abgeholt`;list?.append(item(`${session.title} · ${dateLabel(session.session_date)} · ${statusLabel(session.status)}${cbp}`,button('Bearbeiten & CBP',()=>{state.selectedSessionId=session.session_id;renderSessionEditor(state)})))}
    renderSessionEditor(state);
  }
  function renderThreads(state,threads){const list=field(state.dialog,'[data-gm-threads]');clear(list);if(!threads.length)list?.append(item('Noch kein Handlungsfaden angelegt.'));for(const thread of threads)list?.append(item(`${thread.title} · ${statusLabel(thread.status)}${thread.player_visible?' · sichtbar':' · geheim'}`))}
  function renderImpacts(state,impacts){const list=field(state.dialog,'[data-gm-impacts]');clear(list);if(!impacts.length)list?.append(item('Keine verdeckte Folge aus einer anderen Kampagne.'));for(const impact of impacts)list?.append(item(`${impact.impact_summary} · ${statusLabel(impact.status)}`))}

  const archetypeGroups=[
    ['humanoid','Humanoide Alltagsfiguren'],['society','Herrschaft & Gesellschaft'],['combat','Kampf & Ordnung'],
    ['outlaw','Kriminelle & Randfiguren'],['animal','Tiere'],['monster','Monster & uralte Bestien'],
    ['fae','Feenwesen'],['spirit','Geister'],['undead','Untote'],['demon','Dämonische Wesen'],
    ['arcane','Arkane & elementare Wesen'],['holy','Heilige & religiöse Wesen'],['dark','Finstere Wesen'],
    ['nature','Pflanzen- & Naturwesen'],['swarm','Schwärme & Kollektive'],['construct','Konstrukte'],
    ['aquatic','Wasserwesen'],['giant','Riesen & einzigartige Wesen'],['other','Andere']
  ];
  const preparedArchetypes=[
    {key:'alltagsfigur',name:'Alltagsfigur',groupName:'humanoid',description:'Unbewaffnete Bewohner, Handwerker, Bedienstete oder Reisende ohne besondere Kampfausbildung.',canCarryItems:true,standardItems:[{id:'gear_backpack'},{id:'gear_torch',quantity:2}],attributes:{ST:4,KS:4,GS:4,RF:4,FF:5,WL:4,IT:5,IN:5,WN:4,CR:5},counters:{L:5,A:5,FO:4,M:2,GB:2,HS:2,FS:2,GL:2},skills:{'Aufmerksamkeit & Wachsamkeit':3,'Folklore & Gassenwissen':3}},
    {key:'haendler-informant',name:'Händler & Informant',groupName:'society',description:'Gesprächsstarke Kontaktfigur für Handel, Gerüchte, Verhandlungen und soziale Szenen.',canCarryItems:true,standardItems:[{id:'gear_backpack'},{id:'gear_writing_set'}],attributes:{ST:3,KS:4,GS:5,RF:5,FF:6,WL:6,IT:7,IN:7,WN:6,CR:8},counters:{L:5,A:5,FO:7,M:2,GB:2,HS:6,FS:2,GL:3},skills:{'Wirtschaft & Handel':8,'Überreden & Belügen':7,'Menschenkenntnis & Wesen erkennen':6,'Folklore & Gassenwissen':5}},
    {key:'stadtwache',name:'Stadtwache',groupName:'combat',description:'Solide bewaffnete Ordnungskraft für Tore, Patrouillen, Eskorte und gewöhnliche Gefechte.',canCarryItems:true,standardItems:[{id:'wpn_melee_spear',loadState:'equipped'},{id:'armor_gambeson',loadState:'equipped'},{id:'armor_shield_holzschild',loadState:'equipped'},{id:'gear_lantern'}],attributes:{ST:7,KS:7,GS:5,RF:6,FF:4,WL:6,IT:4,IN:5,WN:6,CR:5},counters:{L:8,A:8,FO:4,M:2,GB:2,HS:3,FS:2,GL:2},skills:{'Nahkampf – leichte Waffen':7,'Verteidigung & Blocken':7,'Aufmerksamkeit & Wachsamkeit':6,'Fesseln & Sichern':5}},
    {key:'wegelagerer',name:'Räuber & Wegelagerer',groupName:'outlaw',description:'Beweglicher Gegner für Hinterhalte, Überfälle, Verfolgungen und zwielichtige Gruppen.',canCarryItems:true,standardItems:[{id:'wpn_ranged_shortbow',loadState:'equipped'},{id:'wpn_melee_dagger',loadState:'equipped'},{id:'armor_reinforced_leather',loadState:'equipped'},{id:'gear_rope_hemp_10m'}],attributes:{ST:6,KS:6,GS:7,RF:7,FF:6,WL:5,IT:4,IN:5,WN:7,CR:4},counters:{L:7,A:8,FO:5,M:2,GB:2,HS:2,FS:3,GL:2},skills:{'Fernkampf – leichte Waffen':7,'Nahkampf – leichte Waffen':6,'Vermeiden & Ausweichen':6,'Heimlichkeit & Schleichen':6}},
    {key:'veteran-anfuehrer',name:'Veteran & Anführer',groupName:'combat',description:'Erfahrene Elite- oder Anführerfigur für anspruchsvolle Kämpfe und taktische Entscheidungen.',canCarryItems:true,standardItems:[{id:'wpn_melee_long_sword',loadState:'equipped'},{id:'armor_chain_shirt',loadState:'equipped'},{id:'armor_shield_round',loadState:'equipped'}],attributes:{ST:9,KS:9,GS:7,RF:8,FF:6,WL:9,IT:6,IN:7,WN:7,CR:8},counters:{L:11,A:11,FO:6,M:2,GB:2,HS:6,FS:2,GL:3},skills:{'Nahkampf – schwere Waffen':9,'Verteidigung & Blocken':9,'Athletik & Schwimmen':8,'Strategie & Taktik':8,'Führung & Befehlsgewalt':8}},
    {key:'spuerwolf',name:'Spürhund & Wolf',groupName:'animal',description:'Schnelles Rudel- oder Begleittier mit starken Sinnen, Fährtenarbeit und Nahkampfbiss.',canCarryItems:false,standardItems:[],attributes:{ST:6,KS:6,GS:8,RF:9,FF:2,WL:5,IT:2,IN:7,WN:10,CR:3},counters:{L:7,A:9,FO:5,M:2,GB:2,HS:2,FS:2,GL:2},skills:{'Nahkampf – Raufen & Ringen':7,'Fährtenlesen & Spurensuche':8,'Aufmerksamkeit & Wachsamkeit':8,'Vermeiden & Ausweichen':6}},
    {key:'grosse-raubbestie',name:'Große Raubbestie',groupName:'monster',description:'Kräftige Bestie für gefährliche Wildnisbegegnungen, Jagd und körperliche Bedrohung.',canCarryItems:false,standardItems:[],attributes:{ST:11,KS:10,GS:8,RF:8,FF:2,WL:7,IT:2,IN:7,WN:8,CR:4},counters:{L:13,A:11,FO:4,M:2,GB:2,HS:2,FS:2,GL:2},skills:{'Nahkampf – Raufen & Ringen':10,'Athletik & Schwimmen':9,'Aufmerksamkeit & Wachsamkeit':7,'Einschüchtern & Zermürben':8}},
    {key:'feentrickster',name:'Feenbote & Trickster',groupName:'fae',description:'Wendige, schwer greifbare Feenfigur für Täuschung, Verhandlung und übernatürliche Szenen.',canCarryItems:true,standardItems:[],attributes:{ST:3,KS:5,GS:10,RF:10,FF:8,WL:8,IT:7,IN:9,WN:8,CR:10},counters:{L:6,A:8,FO:9,M:7,GB:2,HS:4,FS:2,GL:4},skills:{'Trugbild-Magie & Illusionistik':8,'Betören & Verzaubern':8,'Vermeiden & Ausweichen':8,'Heimlichkeit & Schleichen':7}},
    {key:'gebundener-geist',name:'Gebundener Geist',groupName:'spirit',description:'Orts- oder erinnerungsgebundene Erscheinung mit starkem Willen und übernatürlicher Wahrnehmung.',canCarryItems:false,standardItems:[],attributes:{ST:3,KS:8,GS:6,RF:7,FF:2,WL:11,IT:7,IN:9,WN:10,CR:6},counters:{L:8,A:2,FO:10,M:6,GB:2,HS:2,FS:5,GL:2},skills:{'Spiritismus & Geisterkunde':9,'Spiritismus & Seelenmagie':9,'Magiewahrnehmung & Wahrnehmung für Übernatürliches':9,'Meditation & mentaler Selbstschutz':8}},
    {key:'untoter-waechter',name:'Untoter Wächter',groupName:'undead',description:'Zäher, furchtloser Grab- oder Ruinenwächter mit wenig Beweglichkeit und hoher Widerstandskraft.',canCarryItems:true,standardItems:[{id:'wpn_melee_kriegsspeer',loadState:'equipped'},{id:'armor_shield_holzschild',loadState:'equipped'}],attributes:{ST:9,KS:11,GS:4,RF:4,FF:3,WL:9,IT:3,IN:4,WN:6,CR:2},counters:{L:12,A:2,FO:3,M:2,GB:2,HS:2,FS:7,GL:2},skills:{'Nahkampf – schwere Waffen':8,'Verteidigung & Blocken':8,'Aufmerksamkeit & Wachsamkeit':5,'Nekromantie & Totenmagie':4}},
    {key:'kultwirker',name:'Kultwirker',groupName:'dark',description:'Finstere Ritualfigur für Flüche, verbotene Nachforschungen und verdeckte Gegenspieler.',canCarryItems:true,standardItems:[{id:'wpn_melee_dagger',loadState:'equipped'},{id:'gear_lantern'},{id:'gear_writing_set'}],attributes:{ST:4,KS:6,GS:5,RF:6,FF:7,WL:10,IT:8,IN:7,WN:6,CR:7},counters:{L:7,A:6,FO:8,M:2,GB:2,HS:4,FS:10,GL:2},skills:{'Flüche & Blut-Hexerei':9,'Okkultismus & Arkane Kunde':8,'Heimlichkeit & Schleichen':6,'Überreden & Belügen':6}},
    {key:'konstruktwaechter',name:'Konstruktwächter',groupName:'construct',description:'Massiver künstlicher Wächter für Werkstätten, Ruinen, Tore und magisch gesicherte Orte.',canCarryItems:false,standardItems:[],attributes:{ST:12,KS:13,GS:4,RF:5,FF:3,WL:8,IT:3,IN:3,WN:7,CR:2},counters:{L:14,A:2,FO:4,M:6,GB:2,HS:2,FS:2,GL:2},skills:{'Verteidigung & Blocken':9,'Nahkampf – Raufen & Ringen':9,'Aufmerksamkeit & Wachsamkeit':7,'Handwerk & Baukunst':4}}
  ];
  const preparedArchetypeProfiles={
    'alltagsfigur':{species:'Mensch',roles:['Alltag','Zivilist'],name:'Neue Alltagsfigur'},
    'haendler-informant':{species:'Mensch',roles:['Kontakt','Händler','Informant'],name:'Neuer Händler'},
    'stadtwache':{species:'Mensch',roles:['Wache','Ordnung','Nahkampf'],name:'Neue Stadtwache'},
    'wegelagerer':{species:'Mensch',roles:['Räuber','Hinterhalt','Fernkampf'],name:'Neuer Wegelagerer'},
    'veteran-anfuehrer':{species:'Mensch',roles:['Veteran','Anführer','Elite'],name:'Neuer Veteran'},
    'spuerwolf':{species:'Wolf',roles:['Tier','Spurensucher','Rudel'],name:'Neuer Spürwolf'},
    'grosse-raubbestie':{species:'Raubbestie',roles:['Monster','Jäger','Wildnis'],name:'Neue Raubbestie'},
    'feentrickster':{species:'Feenwesen',roles:['Fee','Trickster','Bote'],name:'Neuer Feentrickster'},
    'gebundener-geist':{species:'Geist',roles:['Geist','Gebunden','Übernatürlich'],name:'Neuer gebundener Geist'},
    'untoter-waechter':{species:'Untoter',roles:['Untot','Wächter','Ruine'],name:'Neuer untoter Wächter'},
    'kultwirker':{species:'Mensch',roles:['Kult','Wirker','Gegenspieler'],name:'Neuer Kultwirker'},
    'konstruktwaechter':{species:'Konstrukt',roles:['Konstrukt','Wächter','Magisch'],name:'Neuer Konstruktwächter'}
  };
  const creatureId=row=>row?.creature_id||row?.id||null;
  const archetypeId=row=>row?.archetype_id||row?.id||null;
  const placeId=row=>row?.place_id||row?.id||null;
  const factionId=row=>row?.faction_id||row?.id||null;
  const activeRow=row=>!!row&&!row.archived_at&&row.status!=='archived';
  const roleTags=value=>Array.isArray(value)?value:String(value||'').split(',').map(tag=>tag.trim()).filter(Boolean);
  const creatureAttributes=[['ST','Stärke'],['KS','Konstitution'],['GS','Geschick'],['RF','Reflexe'],['FF','Fingerfertigkeit'],['WL','Wille'],['IT','Intelligenz'],['IN','Intuition'],['WN','Wahrnehmung'],['CR','Charisma']];
  const creatureCounters=[['L','Leben'],['A','Ausdauer'],['FO','Fokus'],['M','Mana'],['GB','Glaube'],['HS','Herrschaft'],['FS','Finsternis'],['GL','Glück']];
  const creatureMoney=[['copper','Kupfer'],['silver','Silber'],['gold','Gold']];
  const creatureInventory=[['equipment','Ausrüstung'],['weapons','Waffen'],['armor','Rüstung'],['items','Weitere Gegenstände'],['rations','Rationen']];
  const plainObject=value=>!!value&&typeof value==='object'&&!Array.isArray(value);
  const creatureStats=row=>plainObject(row?.npc_data)?row.npc_data:plainObject(row?.stats)?row.stats:{};
  const NPC_SHEET_VERSION=1;
  const npcEditorContexts=new WeakMap();
  let activeNpcEditorContext=null,npcEditorBridgeInstalled=false;
  const CREATURE_BUILDER_PRESENTATION_KEY='builderPresentationV1812';
  const CREATURE_BUILDER_PRESENTATION_VERSION=1;
  const CREATURE_BUILDER_FALLBACK_LAYOUT=[
    ['auxProfile','NPC-Profil',12],['portrait','Porträt',6],['attributes','Grundwerte',6],['counters','Counter',6],
    ['fatePath','Schicksalspfade & Synergien',12],['derived','Abgeleitete Werte',12],['skills','Fähigkeiten',12],
    ['equipment','Ausrüstung',12],['armorSummary','Kampfwerte & Rüstung',12],['encumbrance','Gewicht & Tragekapazität',6],
    ['rations','Rationen',6],['notes','Notizen',6],['effects','Aktive Effekte',12]
  ];
  function safeCreatureBuilderCard(card,index){
    if(!plainObject(card)||typeof card.type!=='string'||!card.type.trim())return null;
    if(typeof CARD_TYPES!=='undefined'&&plainObject(CARD_TYPES)&&!Object.prototype.hasOwnProperty.call(CARD_TYPES,card.type))return null;
    const width=Math.max(1,Math.min(12,Number.isFinite(Number(card.width))?Math.round(Number(card.width)):12));
    const printWidth=Math.max(1,Math.min(12,Number.isFinite(Number(card.printWidth))?Math.round(Number(card.printWidth)):12));
    return{id:String(card.id||`creature-card-${index}-${card.type}`).slice(0,160),type:card.type.slice(0,80),title:String(card.title||card.type).slice(0,160),order:Number.isFinite(Number(card.order))?Number(card.order):index,width,printWidth,print:card.print!==false,collapsed:card.collapsed===true,breakBefore:card.breakBefore===true,breakAfter:card.breakAfter===true,description:String(card.description||'').slice(0,4000),data:plainObject(card.data)?structuredClone(card.data):{}};
  }
  function fallbackCreatureBuilderLayout(){return CREATURE_BUILDER_FALLBACK_LAYOUT.map(([type,title,width],index)=>safeCreatureBuilderCard({type,title,width,printWidth:12,order:index},index))}
  function defaultCreatureBuilderLayout(){
    if(typeof newAuxEntry==='function')try{return(newAuxEntry('npc','Wesen').layout||[]).map(safeCreatureBuilderCard).filter(Boolean)}catch{}
    return fallbackCreatureBuilderLayout();
  }
  function creatureBuilderLayout(value,fallback=null){
    const rows=(Array.isArray(value)?value:[]).slice(0,64).map(safeCreatureBuilderCard).filter(Boolean);
    return rows.length?rows:(Array.isArray(fallback)&&fallback.length?fallback.map(safeCreatureBuilderCard).filter(Boolean):defaultCreatureBuilderLayout());
  }
  function creatureBuilderPresentation(stats){
    const raw=plainObject(stats?.[CREATURE_BUILDER_PRESENTATION_KEY])?stats[CREATURE_BUILDER_PRESENTATION_KEY]:{};
    return{...structuredClone(raw),version:CREATURE_BUILDER_PRESENTATION_VERSION,mode:raw.mode==='builder'?'builder':'form',layout:creatureBuilderLayout(raw.layout),profile:plainObject(raw.profile)?structuredClone(raw.profile):{}};
  }
  function creatureBuilderPresentationFromSnapshot(snapshot){
    const profile={portrait:String(snapshot?.portrait||''),location:String(snapshot?.location||''),relationship:String(snapshot?.relationship||''),availability:String(snapshot?.availability||''),npcType:String(snapshot?.npcType||''),contactLevel:Math.max(0,Math.min(10,Number(snapshot?.contactLevel)||0))};
    return{version:CREATURE_BUILDER_PRESENTATION_VERSION,mode:'builder',layout:creatureBuilderLayout(snapshot?.layout),profile};
  }
  function freshNpcSheet(name='Neues Wesen'){
    const owner=typeof newAuxEntry==='function'?newAuxEntry('npc',name):{id:global.crypto?.randomUUID?.()||`npc-${Date.now()}`,type:'npc',name,attributes:{},counters:{},skills:{},equipment:[],money:{copper:0,silver:0,gold:0},rationTracker:{max:0,current:0,note:''},layout:defaultCreatureBuilderLayout()};
    owner.npcSheetVersion=NPC_SHEET_VERSION;owner.type='npc';owner.accounting={...(plainObject(owner.accounting)?owner.accounting:{}),mode:'informational',costSource:'manual',manualCost:0,active:false,reason:'Eigenständiges Weltwesen'};
    if(typeof ensureUniversalOwnerV173==='function')ensureUniversalOwnerV173(owner);
    if(typeof ensureOwnerV174==='function')ensureOwnerV174(owner,true);
    return owner;
  }
  function creatureToBuilderNpc(row,statsOverride=null){
    const stats=plainObject(statsOverride)?statsOverride:creatureStats(row),canonical=plainObject(row?.npc_data)?row.npc_data:stats?.npcSheetVersion===NPC_SHEET_VERSION&&stats?.type==='npc'?stats:null,presentation=creatureBuilderPresentation(stats);
    const owner=canonical?structuredClone(canonical):freshNpcSheet(row?.name||'Neues Wesen');
    if(!canonical){
      for(const key of ['portrait','description','notes','level','cbp','contactLevel','npcType','location','relationship','availability','player','age','gender','appearanceText','accounting'])if(stats[key]!==undefined)owner[key]=structuredClone(stats[key]);
      owner.attributes={...(plainObject(owner.attributes)?owner.attributes:{}),...(plainObject(stats.attributes)?structuredClone(stats.attributes):{})};
      owner.counters={...(plainObject(owner.counters)?owner.counters:{}),...(plainObject(stats.counters)?structuredClone(stats.counters):{})};
      owner.skills={...(plainObject(owner.skills)?owner.skills:{}),...(plainObject(stats.skills)?structuredClone(stats.skills):{})};
      const inventory=[];for(const key of ['equipment','weapons','armor','items'])for(const entry of Array.isArray(stats[key])?stats[key]:[])if(plainObject(entry)){const item=structuredClone(entry);if(!item.itemType)item.itemType=key==='weapons'?'weapon':key==='armor'?'armor':'gear';inventory.push(typeof normalizeItemV174==='function'?normalizeItemV174(item):item)}
      owner.equipment=inventory;owner.money=plainObject(stats.money)?structuredClone(stats.money):owner.money;owner.rationTracker=plainObject(stats.rationTracker)?structuredClone(stats.rationTracker):owner.rationTracker;
      for(const key of ['rations','advantages','disadvantages','activeEffectsV177','fatePath','fatePaths','fateSynergies','startPackage','origin','concept','summary','cardData','appearance'])if(stats[key]!==undefined)owner[key]=structuredClone(stats[key]);
      const known=new Set(['portrait','description','notes','level','cbp','contactLevel','npcType','location','relationship','availability','player','age','gender','appearanceText','accounting','attributes','counters','skills','equipment','weapons','armor','items','money','rationTracker','rations','advantages','disadvantages','activeEffectsV177','fatePath','fatePaths','fateSynergies','startPackage','origin','concept','summary','cardData','appearance','layout',CREATURE_BUILDER_PRESENTATION_KEY]);
      const unknown=Object.fromEntries(Object.entries(stats).filter(([key])=>!known.has(key)));
      if(Object.keys(unknown).length)owner.extensions={...(plainObject(owner.extensions)?owner.extensions:{}),legacyCreatureStats:structuredClone(unknown)};
      owner.layout=creatureBuilderLayout(Array.isArray(stats.layout)?stats.layout:presentation.layout,owner.layout);owner.portrait=stats.portrait||presentation.profile.portrait||owner.portrait||'';owner.location=stats.location||presentation.profile.location||owner.location||'';owner.relationship=stats.relationship||presentation.profile.relationship||owner.relationship||'';owner.availability=stats.availability||presentation.profile.availability||owner.availability||'';
    }
    owner.id=String(owner.id||creatureId(row)||global.crypto?.randomUUID?.()||`world-creature-${Date.now()}`);owner.type='npc';owner.npcSheetVersion=NPC_SHEET_VERSION;
    owner.name=String(row?.name||owner.name||'Unbenanntes Wesen');owner.npcType=String(row?.species||owner.npcType||'Wesen');owner.weapons=[];owner.armor=[];owner.items=[];owner.v174ItemsMigrated=true;
    owner.accounting={...(plainObject(owner.accounting)?owner.accounting:{}),mode:'informational',costSource:'manual',manualCost:0,active:false,reason:'Eigenständiges Weltwesen'};
    if(typeof ensureUniversalOwnerV173==='function')ensureUniversalOwnerV173(owner);
    if(typeof ensureOwnerV174==='function')ensureOwnerV174(owner,true);
    return owner;
  }
  function serializeNpcSheet(owner){
    const sheet=structuredClone(owner);sheet.npcSheetVersion=NPC_SHEET_VERSION;sheet.type='npc';sheet.weapons=[];sheet.armor=[];sheet.items=[];sheet.v174ItemsMigrated=true;
    sheet.equipment=(Array.isArray(sheet.equipment)?sheet.equipment:[]).map(item=>typeof normalizeItemV174==='function'?normalizeItemV174(item):item);
    delete sheet[CREATURE_BUILDER_PRESENTATION_KEY];return sheet;
  }
  function installNpcEditorBridge(){
    if(npcEditorBridgeInstalled||typeof renderCard!=='function'||typeof updateState!=='function'||typeof saveOwnerV173!=='function')return false;
    npcEditorBridgeInstalled=true;
    const base={updateState,saveOwner:saveOwnerV173,saveAux:typeof saveAux==='function'?saveAux:null,renderCards:typeof renderCards==='function'?renderCards:null,renderAuxTabs:typeof renderAuxTabs==='function'?renderAuxTabs:null};
    updateState=function(mutator,options={}){const context=activeNpcEditorContext;if(!context)return base.updateState(mutator,options);mutator(context.owner,null);context.markDirty();if(options.render!==false)context.render()};
    saveOwnerV173=function(owner,rerender=false){const context=npcEditorContexts.get(owner)||activeNpcEditorContext;if(!context)return base.saveOwner(owner,rerender);context.markDirty();if(rerender)context.render()};
    if(base.saveAux)saveAux=function(){const context=activeNpcEditorContext;if(!context)return base.saveAux();context.markDirty()};
    if(base.renderCards)renderCards=function(){const context=activeNpcEditorContext;if(!context)return base.renderCards();context.render()};
    if(base.renderAuxTabs)renderAuxTabs=function(){const context=activeNpcEditorContext;if(!context)return base.renderAuxTabs();context.syncMeta()};
    global.EberosNpcEditorContextV1813=Object.freeze({version:NPC_SHEET_VERSION});return true;
  }
  function bindNpcEditorContext(root,context){
    installNpcEditorBridge();npcEditorContexts.set(context.owner,context);
    const activate=()=>{activeNpcEditorContext=context;global.setTimeout(()=>{if(activeNpcEditorContext===context)activeNpcEditorContext=null},0)};
    if(root.__npcEditorActivation)for(const eventName of ['pointerdown','click','input','change','keydown'])root.removeEventListener(eventName,root.__npcEditorActivation,true);
    root.__npcEditorActivation=activate;for(const eventName of ['pointerdown','click','input','change','keydown'])root.addEventListener(eventName,activate,true);
  }
  function mountNpcSheetEditor(root,owner,{beforeRender=null,onDirty=()=>{},syncMeta=()=>{},onError=()=>{}}={}){
    const context={owner,root,markDirty:onDirty,syncMeta};
    context.render=()=>{
      clear(root);if(typeof beforeRender==='function')beforeRender(root);
      try{const cards=[...(owner.layout||[])].sort((a,b)=>(+a.order||0)-(+b.order||0));for(const card of cards){const node=renderCard(card,owner);node.dataset.gmCreatureBuilderCard=card.type;root.append(node)}root.dataset.gmCreatureBuilderOwnerType=owner.type;root.dataset.gmCreatureBuilderCardCount=String(cards.length)}catch(error){onError(error)}
    };
    bindNpcEditorContext(root,context);context.render();return context;
  }
  function editableStatMap(stats,key){
    if(stats[key]!==null&&stats[key]!==undefined&&!plainObject(stats[key]))throw new Error(`Die vorhandenen ${key}-Daten haben ein unbekanntes Format und wurden nicht überschrieben.`);
    stats[key]=plainObject(stats[key])?stats[key]:{};return stats[key];
  }
  const valueText=value=>value===null||value===undefined?'':String(value);
  function builderSkillCatalog(){return typeof SKILLS==='undefined'||!Array.isArray(SKILLS)?[]:SKILLS.filter(skill=>skill&&typeof skill.id==='string'&&typeof skill.name==='string')}
  function standardItemCatalog(){return Array.isArray(global.EBEROS_ITEM_DB?.items)?global.EBEROS_ITEM_DB.items:[]}
  function setItemCatalog(){return(Array.isArray(global.EBEROS_MSE_ITEM_DB_V15?.items)?global.EBEROS_MSE_ITEM_DB_V15.items:[]).filter(entry=>['weapon','armor','gear'].includes(entry?.assetKind)&&entry.isCompletionReward!==true)}
  function itemCatalog(source){return source==='set'?setItemCatalog():standardItemCatalog()}
  function itemCatalogCategories(source){const database=source==='set'?global.EBEROS_MSE_ITEM_DB_V15:global.EBEROS_ITEM_DB;return Array.isArray(database?.categories)?database.categories:[]}
  function itemCatalogVersion(source){const database=source==='set'?global.EBEROS_MSE_ITEM_DB_V15:global.EBEROS_ITEM_DB;return String(database?.meta?.version||'unbekannt')}
  function itemCatalogLabel(source){return source==='set'?'Set-Datenbank':'Standard-Itemdatenbank'}
  function itemInventoryKey(entry){return entry?.itemType==='weapon'||entry?.assetKind==='weapon'?'weapons':entry?.itemType==='armor'||entry?.assetKind==='armor'?'armor':'equipment'}
  function catalogItem(source,id){return itemCatalog(source).find(entry=>entry?.id===id)||null}
  function catalogReference(source,entry,{quantity=1,loadState='carried',storageLocation=''}={}){
    return{catalogSource:source,catalogId:entry.id,quantity,loadState:['carried','equipped','stored'].includes(loadState)?loadState:'carried',storageLocation:String(storageLocation||'').slice(0,400)};
  }
  function templateItemReferences(raw){
    const rows=raw?.catalogLoadout?.items;if(rows===undefined)return[];if(!Array.isArray(rows))throw new Error('Die Item-Verknüpfungen der Vorlage haben kein unterstütztes Format.');
    const result=[];
    for(const row of rows){
      if(!plainObject(row)||row.catalogSource!=='standard'||typeof row.catalogId!=='string')throw new Error('Archetypen dürfen nur gültige Verknüpfungen zur Standard-Itemdatenbank enthalten.');
      const source=catalogItem('standard',row.catalogId);if(!source)throw new Error(`Das Standarditem ${row.catalogId} ist nicht mehr im Katalog vorhanden.`);
      result.push(catalogReference('standard',source,{quantity:integerStat(String(row.quantity??1),`Anzahl ${source.name}`,1,1000000),loadState:row.loadState,storageLocation:row.storageLocation}));
    }
    return result;
  }
  function catalogLoadoutSummary(raw){
    const refs=templateItemReferences(raw);if(!refs.length)return'keine Standarditems';
    return refs.map(ref=>{const entry=catalogItem('standard',ref.catalogId);return`${ref.quantity>1?`${ref.quantity}× `:''}${entry?.name||ref.catalogId}`}).join(', ');
  }
  function catalogInventoryEntry(reference){
    const source=catalogItem(reference.catalogSource,reference.catalogId);if(!source)throw new Error(`Der Gegenstand ${reference.catalogId} ist im ${itemCatalogLabel(reference.catalogSource)} nicht mehr vorhanden.`);
    if(typeof global.crypto?.randomUUID!=='function')throw new Error('Dieses Gerät kann keine sichere Gegenstandskennung erzeugen.');
    const instanceId=global.crypto.randomUUID(),quantity=integerStat(String(reference.quantity??1),`Anzahl ${source.name}`,1,1000000),loadState=['carried','equipped','stored'].includes(reference.loadState)?reference.loadState:'carried';
    return{...structuredClone(source),id:instanceId,instanceId,catalogId:source.id,catalogSource:reference.catalogSource,catalogVersion:itemCatalogVersion(reference.catalogSource),quantity,qty:quantity,cbpCost:Number(source.cbpCost)||0,cbp:Number(source.cbpCost)||0,loadState,equippedQuantity:loadState==='equipped'?quantity:0,active:true,storageLocation:String(reference.storageLocation||'').slice(0,400),notes:''};
  }
  function statNumber(marker,id){const control=input('number',marker,{step:1});control.dataset.statId=id;control.inputMode='numeric';return control}
  function statValue(control,value){control.value=valueText(value);control.dataset.originalValue=control.value}
  function statChanged(control){return control.value!==control.dataset.originalValue}
  function integerStat(value,label,min,max){
    if(!/^(0|[1-9]\d*)$/.test(value))throw new Error(`${label}: Bitte eine ganze Zahl eingeben.`);
    const number=Number(value);if(!Number.isSafeInteger(number)||number<min||number>max)throw new Error(`${label}: Erlaubt sind ${min} bis ${max}.`);return number;
  }
  function portableCreatureValues(raw){
    if(!plainObject(raw))throw new Error('Diese Werte haben kein unterstütztes Vorlagenformat.');
    const result={attributes:{},counters:{},skills:{},inventoryProfile:{}};
    if(raw.attributes!==undefined&&!plainObject(raw.attributes))throw new Error('Die Grundwerte können nicht sicher als Vorlage gelesen werden.');
    if(raw.counters!==undefined&&!plainObject(raw.counters))throw new Error('Die Counter können nicht sicher als Vorlage gelesen werden.');
    if(raw.skills!==undefined&&!plainObject(raw.skills))throw new Error('Die Fähigkeiten können nicht sicher als Vorlage gelesen werden.');
    for(const [id] of creatureAttributes)if(raw.attributes?.[id]!==undefined){
      result.attributes[id]=integerStat(String(raw.attributes[id]),`Grundwert ${id}`,1,25);
    }
    for(const [id] of creatureCounters)if(raw.counters?.[id]!==undefined){
      const source=raw.counters[id],pair=plainObject(source)?source:typeof source==='number'?{max:source,current:source}:null;
      if(!pair)throw new Error(`Counter ${id} hat kein unterstütztes Vorlagenformat.`);
      const max=integerStat(String(pair.max),`Counter ${id} Maximum`,2,25);
      result.counters[id]={max,current:integerStat(String(pair.current),`Counter ${id} aktuell`,0,max)};
    }
    const knownSkills=new Set(builderSkillCatalog().map(skill=>skill.id));
    for(const [id,source] of Object.entries(raw.skills||{}))if(knownSkills.has(id)){
      const skill=plainObject(source)?source:typeof source==='number'?{level:source}:null;
      if(!skill)throw new Error(`Fähigkeit ${id} hat kein unterstütztes Vorlagenformat.`);
      result.skills[id]={level:integerStat(String(skill.level??0),`Fähigkeit ${id}`,0,25)};
    }
    if(raw.inventoryProfile!==undefined&&!plainObject(raw.inventoryProfile))throw new Error('Die Inventarfähigkeit kann nicht sicher als Vorlage gelesen werden.');
    if(typeof raw.inventoryProfile?.canCarryItems==='boolean')result.inventoryProfile.canCarryItems=raw.inventoryProfile.canCarryItems;
    return result;
  }
  function templateUuid(){
    if(typeof global.crypto?.randomUUID!=='function')throw new Error('Dieses Gerät kann keine sicheren Kennungen für einen unabhängigen NPC erzeugen.');
    return global.crypto.randomUUID();
  }
  function sanitizeNpcBuildSheet(raw){
    const sheet=serializeNpcSheet(raw);sheet.id='';sheet.location='';sheet.relationship='';sheet.availability='';
    delete sheet.contactCardIdsV179;delete sheet.isContactV179;delete sheet.npcTemplateProvenance;delete sheet.effectLogV177;delete sheet.combatRoundV1721;
    sheet.layout=creatureBuilderLayout(sheet.layout).map((card,index)=>({...card,id:`template-card-${index}-${card.type}`,order:index}));
    sheet.equipment=(Array.isArray(sheet.equipment)?sheet.equipment:[]).map((entry,index)=>({...structuredClone(entry),id:`template-item-${index}`,instanceId:`template-item-${index}`}));
    sheet.activeEffectsV177=(Array.isArray(sheet.activeEffectsV177)?sheet.activeEffectsV177:[]).map((entry,index)=>({...structuredClone(entry),id:`template-effect-${index}`}));
    return sheet;
  }
  function independentNpcSheet(raw){
    const sheet=serializeNpcSheet(raw),itemIds=new Map();sheet.id=templateUuid();
    sheet.layout=creatureBuilderLayout(sheet.layout).map((card,index)=>({...structuredClone(card),id:templateUuid(),order:index}));
    sheet.equipment=(Array.isArray(sheet.equipment)?sheet.equipment:[]).map(entry=>{
      const copy=structuredClone(entry),old=String(copy.instanceId||copy.id||''),next=templateUuid();if(old)itemIds.set(old,next);copy.id=next;copy.instanceId=next;return copy;
    });
    sheet.activeEffectsV177=(Array.isArray(sheet.activeEffectsV177)?sheet.activeEffectsV177:[]).map(entry=>{
      const copy=structuredClone(entry);copy.id=templateUuid();if(itemIds.has(String(copy.sourceId||'')))copy.sourceId=itemIds.get(String(copy.sourceId));
      if(plainObject(copy.runeBindingV1717)){
        const old=String(copy.runeBindingV1717.carrierId||'');if(itemIds.has(old)){copy.runeBindingV1717.carrierId=itemIds.get(old);copy.runeBindingV1717.carrierKey=`item:${itemIds.get(old)}`}
      }
      return copy;
    });
    for(const key of ['advantages','disadvantages'])if(Array.isArray(sheet[key]))sheet[key]=sheet[key].map(entry=>plainObject(entry)?{...structuredClone(entry),id:templateUuid()}:entry);
    delete sheet.effectLogV177;delete sheet.combatRoundV1721;delete sheet.contactCardIdsV179;delete sheet.isContactV179;
    return sheet;
  }
  function preparedNpcBuild(preset,core,items){
    const profile=preparedArchetypeProfiles[preset.key]||{species:'Wesen',roles:[],name:`Neues Wesen · ${preset.name}`},owner=freshNpcSheet(profile.name);
    owner.npcType=profile.species;owner.description=preset.description;owner.notes=`Vorbereitete Ausbaustufe: ${preset.name}`;overlayTemplateValues(owner,core);
    return{id:'standard',label:'Standard',isDefault:true,profile:{name:profile.name,species:profile.species,roleTags:profile.roles,publicSummary:preset.description,gmNotes:''},npcSheet:sanitizeNpcBuildSheet(owner),catalogLoadout:{version:1,items:structuredClone(items)}};
  }
  function preparedArchetypeTemplate(preset){
    const skills={},ids=new Map(builderSkillCatalog().map(skill=>[skill.name,skill.id]));
    for(const [name,level] of Object.entries(preset.skills||{})){const id=ids.get(name);if(id)skills[id]={level}}
    const items=(preset.standardItems||[]).map(row=>{const entry=catalogItem('standard',row.id);if(!entry)throw new Error(`Vorbereitetes Standarditem ${row.id} fehlt.`);return catalogReference('standard',entry,{quantity:row.quantity,loadState:row.loadState,storageLocation:row.storageLocation})});
    const core={attributes:structuredClone(preset.attributes),counters:Object.fromEntries(Object.entries(preset.counters).map(([id,max])=>[id,{max,current:max}])),skills,inventoryProfile:{canCarryItems:preset.canCarryItems!==false}};
    return{...core,catalogLoadout:{version:1,items},npcBuilds:[preparedNpcBuild(preset,core,items)],preparedArchetype:{key:preset.key,version:3}};
  }
  function matchingPreparedArchetype(state,preset){
    const normalized=String(preset.name).trim().toLocaleLowerCase('de-DE');
    return state.archetypes.find(row=>activeRow(row)&&(row.template_data?.preparedArchetype?.key===preset.key||String(row.name||'').trim().toLocaleLowerCase('de-DE')===normalized));
  }
  function templateValueCount(core){return creatureAttributes.filter(([id])=>core.attributes?.[id]!==undefined).length+creatureCounters.filter(([id])=>core.counters?.[id]!==undefined).length+Object.keys(core.skills||{}).length}
  function templateValueSummary(core){return`${Object.keys(core.attributes||{}).length} Grundwerte, ${Object.keys(core.counters||{}).length} Counter, ${Object.keys(core.skills||{}).length} Regelfähigkeiten`}
  function overlayTemplateValues(stats,core){
    for(const [key,label] of [['attributes','Grundwerte'],['counters','Counter'],['skills','Fähigkeiten']]){
      if(!plainObject(core[key]))throw new Error(`${label} der Vorlage können nicht sicher übernommen werden.`);
      if(!Object.keys(core[key]).length)continue;
      const target=editableStatMap(stats,key);
      for(const [id,value] of Object.entries(core[key])){
        if(key==='attributes')target[id]=value;
        else{
          if(target[id]!==null&&target[id]!==undefined&&!plainObject(target[id])&&typeof target[id]!=='number')throw new Error(`${label} im Wesen haben ein unbekanntes Format und wurden nicht überschrieben.`);
          target[id]={...(plainObject(target[id])?target[id]:{}),...structuredClone(value)};
        }
      }
    }
    if(typeof core.inventoryProfile?.canCarryItems==='boolean'){
      const profile=editableStatMap(stats,'inventoryProfile');profile.canCarryItems=core.inventoryProfile.canCarryItems;
    }
  }
  const normalizedTemplateName=value=>String(value||'').trim().toLocaleLowerCase('de-DE');
  function catalogBuildsForArchetype(state,archetype){
    if(!archetype)return[];const data=plainObject(archetype.template_data)?archetype.template_data:{},link=plainObject(data.npcCatalog)?data.npcCatalog:{},key=data.preparedArchetype?.key,name=normalizedTemplateName(archetype.name);
    return(state.npcCatalog||[]).filter(row=>row?.build_id&&(link.templateId&&row.template_id===link.templateId||key&&row.catalog_key===key||normalizedTemplateName(row.name)===name&&row.archetype_group===archetype.group_name)).map(row=>({source:'catalog',value:`catalog:${row.build_id}`,id:row.build_id,label:row.build_label||'Standard',isDefault:row.is_default===true,profile:{name:row.name,species:row.species,roleTags:roleTags(row.role_tags),publicSummary:row.public_summary||'',gmNotes:row.gm_notes||''},npcSheet:plainObject(row.build_data?.npcSheet)?row.build_data.npcSheet:row.build_data,templateId:row.template_id,catalogKey:row.catalog_key,rulesVersion:row.rules_version,catalogVersion:row.catalog_version,cbpBudget:row.cbp_budget,cbpSpent:row.cbp_spent}));
  }
  function embeddedBuildsForArchetype(archetype){
    const rows=archetype?.template_data?.npcBuilds;if(!Array.isArray(rows))return[];
    return rows.filter(plainObject).map((row,index)=>({...structuredClone(row),source:'archetype',value:`archetype:${index}`,id:String(row.id||`build-${index}`),label:String(row.label||`Ausbaustufe ${index+1}`),isDefault:row.isDefault===true||index===0,profile:plainObject(row.profile)?structuredClone(row.profile):{}}));
  }
  function legacyBuildForArchetype(archetype){
    const data=plainObject(archetype?.template_data)?archetype.template_data:{},core=portableCreatureValues(data),items=templateItemReferences(data);
    if(!templateValueCount(core)&&!items.length)return null;
    return{source:'legacy',value:'legacy:standard',id:'legacy-standard',label:'Standardwerte',isDefault:true,profile:{name:`Neues Wesen · ${archetype.name}`,species:'Wesen',roleTags:[],publicSummary:archetype.description||'',gmNotes:''},core,catalogLoadout:{version:1,items}};
  }
  function archetypeBuildChoices(state,archetype){
    const catalog=catalogBuildsForArchetype(state,archetype);if(catalog.length)return catalog;
    const embedded=embeddedBuildsForArchetype(archetype);if(embedded.length)return embedded;
    const legacy=legacyBuildForArchetype(archetype);return legacy?[legacy]:[];
  }
  function buildCatalogReferences(archetype,build){
    const rows=build?.catalogLoadout?.items??archetype?.template_data?.catalogLoadout?.items;
    if(rows===undefined)return[];return templateItemReferences({catalogLoadout:{items:rows}});
  }
  function instantiateArchetypeBuild(state,archetype,build){
    let owner;
    if(plainObject(build?.npcSheet)){
      const identity={name:build.profile?.name||archetype.name,species:build.profile?.species||'Wesen'};
      owner=build.npcSheet.npcSheetVersion===NPC_SHEET_VERSION&&build.npcSheet.type==='npc'?creatureToBuilderNpc({...identity,npc_data:build.npcSheet}):creatureToBuilderNpc(identity,build.npcSheet);
    }
    else{
      owner=freshNpcSheet(build?.profile?.name||`Neues Wesen · ${archetype.name}`);
      owner.npcType=build?.profile?.species||'Wesen';overlayTemplateValues(owner,build?.core||portableCreatureValues(archetype.template_data||{}));
    }
    owner=independentNpcSheet(owner);
    const known=new Set((owner.equipment||[]).filter(entry=>entry?.catalogId).map(entry=>`${entry.catalogSource||(catalogItem('standard',entry.catalogId)?'standard':'set')}:${entry.catalogId}`));
    for(const reference of buildCatalogReferences(archetype,build)){const token=`${reference.catalogSource}:${reference.catalogId}`;if(known.has(token))continue;owner.equipment.push(catalogInventoryEntry(reference));known.add(token)}
    owner.npcTemplateProvenance={archetypeId:archetypeId(archetype),archetypeName:archetype.name,source:build.source,templateId:build.templateId||archetype.template_data?.npcCatalog?.templateId||null,buildId:build.id||null,buildLabel:build.label||'Standard',catalogKey:build.catalogKey||archetype.template_data?.preparedArchetype?.key||null,rulesVersion:build.rulesVersion||global.Eberos?.rulesVersion||15,catalogVersion:build.catalogVersion||itemCatalogVersion('standard'),preparedAt:new Date().toISOString()};
    return{owner,profile:{name:build.profile?.name||owner.name,species:build.profile?.species||owner.npcType||'Wesen',roleTags:roleTags(build.profile?.roleTags),publicSummary:String(build.profile?.publicSummary||archetype.description||''),gmNotes:String(build.profile?.gmNotes||'')}};
  }
  function npcBuildSummary(archetype,build){
    let owner;try{owner=plainObject(build?.npcSheet)?build.npcSheet:null}catch{}
    const core=owner||build?.core||archetype?.template_data||{},skills=Object.values(plainObject(core.skills)?core.skills:{}).filter(skill=>(plainObject(skill)?Number(skill.level):Number(skill))>0).length,items=(Array.isArray(owner?.equipment)?owner.equipment.length:0)+buildCatalogReferences(archetype,build).length,effects=Array.isArray(owner?.activeEffectsV177)?owner.activeEffectsV177.filter(effect=>effect?.active!==false).length:0,cards=Array.isArray(owner?.layout)?owner.layout.length:defaultCreatureBuilderLayout().length;
    return`${build.profile?.species||owner?.npcType||'Wesen'} · ${skills} ausgeprägte Fähigkeiten · ${items} Ausrüstungspositionen · ${effects} aktive Effekte · ${cards} NPC-Karten`;
  }
  const npcBuildSectionKeys={
    values:['attributes','counters','money','rationTracker','rations','inventoryProfile'],
    skills:['skills','customSkills','skillOrder','skillSortView','powerPathChoicesV176'],
    inventory:['equipment'],
    effects:['activeEffectsV177'],
    paths:['fatePath','fatePaths','fateSynergies','advantages','disadvantages','startPackage','origin','concept','summary'],
    cards:['layout'],
    profile:['portrait','description','notes','level','cbp','contactLevel','npcType','player','age','gender','appearanceText','appearance']
  };
  function emptyTemplateValue(value){return value===undefined||value===null||value===''||Array.isArray(value)&&value.length===0||plainObject(value)&&Object.keys(value).length===0}
  function applyNpcBuildSections(target,source,sections,mode){
    for(const section of sections)for(const key of npcBuildSectionKeys[section]||[]){
      if(source[key]===undefined)continue;
      if(mode==='fill-empty'){
        if(key==='skills'&&plainObject(source.skills)){target.skills=plainObject(target.skills)?target.skills:{};for(const [id,value] of Object.entries(source.skills))if(target.skills[id]===undefined||Number(target.skills[id]?.level??target.skills[id]??0)===0)target.skills[id]=structuredClone(value);continue}
        if(!emptyTemplateValue(target[key]))continue;
      }
      target[key]=structuredClone(source[key]);
    }
    target.npcSheetVersion=NPC_SHEET_VERSION;target.type='npc';target.npcTemplateProvenance=structuredClone(source.npcTemplateProvenance||{});return target;
  }
  function makeItemCatalogPicker(source,onAdd){
    const details=document.createElement('details');details.className='gm-player-preview';details.dataset.gmItemCatalogPicker=source;
    const summary=document.createElement('summary');summary.textContent=`${itemCatalogLabel(source)} (${itemCatalog(source).length})`;details.append(summary);
    const search=input('search','gmItemCatalogSearch',{placeholder:'Name oder Beschreibung suchen'}),category=select('gmItemCatalogCategory',[['','Alle Kategorien']]),choice=select('gmItemCatalogChoice',[['','Gegenstand auswählen']]);
    search.dataset.catalogSource=source;category.dataset.catalogSource=source;choice.dataset.catalogSource=source;
    for(const definition of itemCatalogCategories(source)){const option=document.createElement('option');option.value=definition.id;option.textContent=String(definition.label||definition.id).replace(/^MSE-Set\s*·?\s*/i,'');category.append(option)}
    const quantity=input('number','gmItemCatalogQuantity',{min:1,max:1000000,step:1,value:'1'});quantity.dataset.catalogSource=source;
    const load=select('gmItemCatalogLoad',[['carried','Mitgeführt'],['equipped','Am Körper / ausgerüstet'],['stored','Verstaut / verborgen']]);load.dataset.catalogSource=source;
    const storage=input('text','gmItemCatalogStorage',{maxLength:400,placeholder:'optional'});storage.dataset.catalogSource=source;
    const status=note('');status.dataset.gmItemCatalogStatus=source;
    const refresh=()=>{
      const query=String(search.value||'').trim().toLocaleLowerCase('de-DE'),selectedCategory=category.value,rows=itemCatalog(source).filter(entry=>(!selectedCategory||entry.category===selectedCategory)&&(!query||[entry.name,entry.description,entry.subcategory,entry.sourceRecord?.cardNumber].filter(Boolean).join(' ').toLocaleLowerCase('de-DE').includes(query)));
      const previous=choice.value;clear(choice);const empty=document.createElement('option');empty.value='';empty.textContent=rows.length?'Gegenstand auswählen':'Keine passenden Gegenstände';choice.append(empty);
      for(const entry of rows.slice(0,120)){const option=document.createElement('option');option.value=entry.id;option.textContent=`${entry.name}${entry.sourceRecord?.cardNumber?` · Karte ${entry.sourceRecord.cardNumber}`:''}`;choice.append(option)}
      if(rows.some(entry=>entry.id===previous))choice.value=previous;
      text(status,rows.length>120?`${rows.length} Treffer · die ersten 120 werden angezeigt.`:`${rows.length} Treffer.`);
    };
    search.addEventListener('input',refresh);category.addEventListener('change',refresh);
    const add=button(source==='set'?'Set-Item vormerken':'Standarditem vormerken',()=>{
      const entry=catalogItem(source,choice.value);if(!entry){text(status,'Bitte wähle zuerst einen Gegenstand.');return}
      try{const reference=catalogReference(source,entry,{quantity:integerStat(quantity.value,`Anzahl ${entry.name}`,1,1000000),loadState:load.value,storageLocation:storage.value.trim()});onAdd(reference);quantity.value='1';storage.value='';text(status,`${entry.name} wurde vorgemerkt.`)}catch(error){text(status,error.message)}
    });
    details.append(labelControl('Suche',search),labelControl('Kategorie',category),labelControl('Gegenstand',choice),labelControl('Anzahl',quantity),labelControl('Tragezustand',load),labelControl('Lagerort / Versteck',storage),add,status);refresh();return details;
  }
  function queueCreatureCatalogReference(form,reference,{sourceArchetypeId=null}={}){
    const source=catalogItem(reference.catalogSource,reference.catalogId);if(!source)throw new Error('Der ausgewählte Kataloggegenstand ist nicht mehr verfügbar.');
    form.__inventoryAddQueue=Array.isArray(form.__inventoryAddQueue)?form.__inventoryAddQueue:[];
    form.__inventoryAddQueue.push({...reference,key:itemInventoryKey(source),sourceArchetypeId});renderCreatureInventoryDrafts(form);
  }
  function renderArchetypeCatalogLoadout(form){
    const list=field(form,'[data-gm-archetype-catalog-items]');clear(list);const refs=Array.isArray(form.__catalogLoadoutDraft)?form.__catalogLoadoutDraft:[];
    if(!refs.length){list.append(item('Noch kein Standarditem mit dieser Vorlage verbunden.'));return}
    for(const [index,ref] of refs.entries()){
      const source=catalogItem('standard',ref.catalogId),label=source?.name||ref.catalogId;
      list.append(item(`${ref.quantity>1?`${ref.quantity}× `:''}${label} · ${ref.loadState==='equipped'?'ausgerüstet':ref.loadState==='stored'?'verstaut':'mitgeführt'}`,button('Verknüpfung entfernen',()=>{refs.splice(index,1);renderArchetypeCatalogLoadout(form)})));
    }
  }
  function addArchetypeCatalogReference(form,reference){
    if(reference.catalogSource!=='standard')throw new Error('Archetypen können nur mit der Standard-Itemdatenbank verbunden werden.');
    form.__catalogLoadoutDraft=Array.isArray(form.__catalogLoadoutDraft)?form.__catalogLoadoutDraft:[];form.__catalogLoadoutDraft.push(reference);renderArchetypeCatalogLoadout(form);
  }
  function updateCreatureInventoryCapability(form){
    const canCarry=field(form,'[data-gm-creature-can-carry-items]')?.checked!==false,controls=field(form,'[data-gm-creature-inventory-catalogs]'),manual=field(form,'[data-gm-creature-inventory-add]'),hint=field(form,'[data-gm-creature-inventory-capability-hint]');
    show(controls,canCarry);show(manual,canCarry);text(hint,canCarry?'Dieses Wesen kann Standarditems und einzelne Set-Items als unabhängige Inventarpositionen erhalten.':'Das bestehende Inventar bleibt erhalten, aber neue Gegenstände können erst nach Aktivierung vorgemerkt werden.');
  }
  function creatureInventoryRow(key,index,entry){
    const row=document.createElement('li');row.dataset.gmCreatureInventoryRow='';row.dataset.inventoryKey=key;row.dataset.inventoryIndex=String(index);
    const title=document.createElement('strong');title.textContent=`${new Map(creatureInventory).get(key)||key}: ${entry.name||'Unbenannter Gegenstand'}`;row.append(title);
    if(!String(entry.instanceId||'').trim())row.append(note('Alte Inventarposition ohne eindeutige Kennung. Bei einer Änderung erhält sie eine Kennung für spätere Beuteübertragung.'));
    const name=input('text','gmInventoryName',{maxLength:160});statValue(name,entry.name||'');
    const quantity=input('number','gmInventoryQuantity',{min:1,max:1000000,step:1});statValue(quantity,entry.quantity??entry.qty??1);
    const description=textarea('gmInventoryDescription',4000);statValue(description,entry.description||'');
    const storage=input('text','gmInventoryStorage',{maxLength:400});statValue(storage,entry.storageLocation||'');
    const load=select('gmInventoryLoad',[['carried','Mitgeführt'],['equipped','Am Körper / ausgerüstet'],['stored','Verstaut / verborgen']]);
    if(entry.loadState&&!['carried','equipped','stored'].includes(entry.loadState)){const option=document.createElement('option');option.value=entry.loadState;option.textContent=`Bestehender Sonderstatus: ${entry.loadState}`;load.append(option)}
    load.value=entry.loadState||'carried';load.dataset.originalValue=load.value;
    const weight=input('number','gmInventoryWeight',{min:0,step:'any'});statValue(weight,entry.weightKg);
    row.append(labelControl('Name',name),labelControl('Anzahl',quantity),labelControl('Beschreibung',description),labelControl('Lagerort / Versteck',storage),labelControl('Tragezustand',load),labelControl('Gewicht je Stück in kg (leer = unbekannt)',weight));
    return row;
  }
  function addCreatureInventoryDraft(form){
    const name=field(form,'[data-gm-creature-new-item-name]')?.value.trim(),quantityText=field(form,'[data-gm-creature-new-item-quantity]')?.value;
    const key=field(form,'[data-gm-creature-new-item-key]')?.value;
    if(!name||name.length>160||!['equipment','weapons','armor'].includes(key))throw new Error('Bitte Gegenstandsart und Name (höchstens 160 Zeichen) eingeben.');
    const quantity=integerStat(quantityText,'Anzahl',1,1000000),description=field(form,'[data-gm-creature-new-item-description]')?.value||'';
    const storageLocation=field(form,'[data-gm-creature-new-item-storage]')?.value.trim()||'';
    if(storageLocation.length>400)throw new Error('Der Lagerort darf höchstens 400 Zeichen haben.');
    const draft={key,name,quantity,description,storageLocation,loadState:'carried'};
    form.__inventoryAddQueue=Array.isArray(form.__inventoryAddQueue)?form.__inventoryAddQueue:[];
    form.__inventoryAddQueue.push(draft);
    renderCreatureInventoryDrafts(form);
    for(const marker of ['name','description','storage'])field(form,`[data-gm-creature-new-item-${marker}]`).value='';
    field(form,'[data-gm-creature-new-item-quantity]').value='1';
  }
  function renderCreatureInventoryDrafts(form){
    const list=field(form,'[data-gm-creature-inventory-drafts]');clear(list);
    const drafts=form.__inventoryAddQueue||[];
    if(!drafts.length){list.append(item('Noch kein neuer Gegenstand vorgemerkt.'));return}
    for(const [index,draft] of drafts.entries()){
      const catalog=draft.catalogId?catalogItem(draft.catalogSource,draft.catalogId):null,name=catalog?.name||draft.name||draft.catalogId||'Unbenannter Gegenstand',origin=draft.catalogSource?` · ${itemCatalogLabel(draft.catalogSource)}`:'';
      list.append(item(`${new Map(creatureInventory).get(draft.key)}: ${draft.quantity}× ${name}${origin}${draft.storageLocation?` · ${draft.storageLocation}`:''}`,
        button('Vormerkung entfernen',()=>{drafts.splice(index,1);renderCreatureInventoryDrafts(form)})));
    }
  }
  function makeCreatureStatsEditor(form,container=form){
    const details=document.createElement('details');details.dataset.gmCreatureStats='';
    const summary=document.createElement('summary');summary.textContent='Werte, Fähigkeiten und Effekte';details.append(summary);
    details.append(note('Alle Felder sind optional. Nur geänderte Werte werden gespeichert. Nicht angezeigte Daten und Regelmodule bleiben unverändert.'));
    const attributes=document.createElement('div');attributes.dataset.gmCreatureAttributes='';attributes.className='grid two';details.append(heading('h6','Grundwerte'),attributes);
    for(const [id,label] of creatureAttributes)attributes.append(labelControl(`${label} (${id})`,statNumber('gmCreatureAttribute',id)));
    const counters=document.createElement('div');counters.dataset.gmCreatureCounters='';details.append(heading('h6','Counter'),counters);
    for(const [id,label] of creatureCounters){
      const row=document.createElement('div');row.dataset.gmCreatureCounterRow=id;row.className='grid two';
      row.append(labelControl(`${label} (${id}) · Maximum`,statNumber('gmCreatureCounterMax',id)),labelControl('Aktuell',statNumber('gmCreatureCounterCurrent',id)));counters.append(row);
    }
    const skills=document.createElement('div');skills.dataset.gmCreatureSkills='';details.append(heading('h6','Fähigkeiten'),skills);
    const skillList=document.createElement('div');skillList.dataset.gmCreatureSkillList='';skills.append(skillList);
    const skillChoice=select('gmCreatureSkillChoice',[['','Fähigkeit auswählen']]);skills.append(skillChoice);
    skills.append(button('Fähigkeit hinzufügen',()=>{
      const id=skillChoice.value;if(!id)return;
      if([...skillList.children].some(row=>row.dataset.gmCreatureSkillId===id))return;
      const source=creatureStats(form.__creatureRow).skills?.[id],row=creatureSkillRow(id,source);row.dataset.newEntry='true';skillList.append(row);skillChoice.value='';
    }));
    const effects=document.createElement('div');effects.dataset.gmCreatureEffects='';details.append(heading('h6','Aktive Effekte'),effects);
    effects.append(note('Freie Effekte können bei Name, Beschreibung und Aktivierung bearbeitet werden. Quellgebundene Effekte sind hier gesperrt; ihre Regelmodule bleiben erhalten. Neue Regelmodule folgen später.'));
    const effectList=document.createElement('div');effectList.dataset.gmCreatureEffectList='';effects.append(effectList);
    const money=document.createElement('div');money.dataset.gmCreatureMoney='';details.append(heading('h6','Geld'),money);
    for(const [id,label] of creatureMoney)money.append(labelControl(label,statNumber('gmCreatureCoin',id)));
    const inventory=document.createElement('div');inventory.dataset.gmCreatureInventory='';details.append(heading('h6','Inventar und Ausrüstung'),inventory);
    inventory.append(note('Gegenstände können hier geändert oder für das Wesen vorgemerkt werden. Speichern erfolgt zusammen mit den Wesenwerten. Unbekannte Zusatzdaten und gebundene Effekte bleiben erhalten.'));
    const canCarry=input('checkbox','gmCreatureCanCarryItems');canCarry.checked=true;canCarry.addEventListener('change',()=>updateCreatureInventoryCapability(form));inventory.append(labelControl('Dieses Wesen kann Gegenstände tragen oder verwenden',canCarry));
    const capabilityHint=note('');capabilityHint.dataset.gmCreatureInventoryCapabilityHint='';inventory.append(capabilityHint);
    const inventoryList=document.createElement('ul');inventoryList.dataset.gmCreatureInventoryList='';inventory.append(inventoryList);
    const inventoryCatalogs=document.createElement('div');inventoryCatalogs.dataset.gmCreatureInventoryCatalogs='';
    inventoryCatalogs.append(note('Standarditems und einzelne physische Set-Gegenstandskarten werden anhand ihrer stabilen Katalog-ID kopiert. Set-Abschlusskarten, Begleiter, Fahrzeuge, Orte und Zustände sind hier bewusst ausgeschlossen.'));
    inventoryCatalogs.append(makeItemCatalogPicker('standard',reference=>queueCreatureCatalogReference(form,reference)),makeItemCatalogPicker('set',reference=>queueCreatureCatalogReference(form,reference)));inventory.append(inventoryCatalogs);
    inventory.append(heading('h6','Neuen Gegenstand vormerken'));
    const inventoryAdd=document.createElement('div');inventoryAdd.dataset.gmCreatureInventoryAdd='';
    inventoryAdd.append(
      labelControl('Art',select('gmCreatureNewItemKey',[['equipment','Ausrüstung'],['weapons','Waffe'],['armor','Rüstung']])),
      labelControl('Name',input('text','gmCreatureNewItemName',{maxLength:160})),
      labelControl('Anzahl',input('number','gmCreatureNewItemQuantity',{min:1,max:1000000,step:1,value:'1'})),
      labelControl('Beschreibung',textarea('gmCreatureNewItemDescription',4000)),
      labelControl('Lagerort / Versteck',input('text','gmCreatureNewItemStorage',{maxLength:400}))
    );
    inventoryAdd.append(button('Gegenstand vormerken',()=>{try{addCreatureInventoryDraft(form)}catch(error){const status=field(form,'[data-gm-creature-inventory-error]');text(status,error.message);show(status,true)}}));
    const inventoryError=note('','notice error');inventoryError.dataset.gmCreatureInventoryError='';inventoryError.hidden=true;inventoryAdd.append(inventoryError);
    inventory.append(inventoryAdd);
    const inventoryDrafts=document.createElement('ul');inventoryDrafts.dataset.gmCreatureInventoryDrafts='';inventory.append(inventoryDrafts);
    container.append(details);updateCreatureInventoryCapability(form);return{details,skillList,skillChoice,effectList,inventoryList,canCarry,inventoryCatalogs};
  }
  function creatureSkillRow(id,source){
    const skill=builderSkillCatalog().find(entry=>entry.id===id),data=plainObject(source)?source:typeof source==='number'?{level:source}:{};
    const row=document.createElement('div');row.dataset.gmCreatureSkillId=id;row.className='gm-player-preview';
    row.append(heading('h6',skill?.name||id));
    const level=statNumber('gmCreatureSkillLevel',id);statValue(level,data.level??0);
    const fav=input('checkbox','gmCreatureSkillFav');fav.checked=data.fav===true;fav.dataset.originalValue=String(fav.checked);
    const skillNote=textarea('gmCreatureSkillNote',12000);skillNote.value=valueText(data.note);skillNote.dataset.originalValue=skillNote.value;
    row.append(labelControl('Stufe (0–25)',level),labelControl('Favorit',fav),labelControl('Notiz',skillNote));return row;
  }
  function renderCreatureStats(state,row){
    const form=state.creatureUi?.creatureForm;if(!form)return;form.__creatureRow=row||null;
    const stats=creatureStats(row),attributes=plainObject(stats.attributes)?stats.attributes:{},counters=plainObject(stats.counters)?stats.counters:{};
    for(const control of form.querySelectorAll('[data-gm-creature-attribute]'))statValue(control,attributes[control.dataset.statId]);
    for(const counter of form.querySelectorAll('[data-gm-creature-counter-row]')){
      const id=counter.dataset.gmCreatureCounterRow,value=counters[id],pair=plainObject(value)?value:typeof value==='number'?{max:value,current:value}:{};
      statValue(field(counter,'[data-gm-creature-counter-max]'),pair.max);statValue(field(counter,'[data-gm-creature-counter-current]'),pair.current);
    }
    const skills=plainObject(stats.skills)?stats.skills:{},list=field(form,'[data-gm-creature-skill-list]');clear(list);
    for(const [id,skill] of Object.entries(skills)){
      const data=plainObject(skill)?skill:typeof skill==='number'?{level:skill}:{};
      if((+data.level||0)!==0||data.fav===true||String(data.note||'').trim()||Array.isArray(data.learnedPowerIds)&&data.learnedPowerIds.length||Array.isArray(data.learnedTechniqueIds)&&data.learnedTechniqueIds.length)list.append(creatureSkillRow(id,skill));
    }
    const choice=field(form,'[data-gm-creature-skill-choice]');clear(choice);const empty=document.createElement('option');empty.value='';empty.textContent='Fähigkeit auswählen';choice.append(empty);
    for(const skill of builderSkillCatalog()){const option=document.createElement('option');option.value=skill.id;option.textContent=`${skill.category} · ${skill.name}`;choice.append(option)}
    if(!builderSkillCatalog().length)choice.disabled=true;
    const effects=Array.isArray(stats.activeEffectsV177)?stats.activeEffectsV177:[],effectList=field(form,'[data-gm-creature-effect-list]');clear(effectList);
    if(!effects.length)effectList.append(note('Noch keine Effekte hinterlegt.'));
    for(const [index,effect] of effects.entries()){
      if(!plainObject(effect))continue;
      const effectRow=document.createElement('div');effectRow.dataset.gmCreatureEffectIndex=String(index);effectRow.className='gm-player-preview';
      const managed=effect.sourceManaged===true||['item','disadvantage','advantage','rune'].includes(effect.sourceType);effectRow.dataset.gmCreatureManaged=String(managed);
      const name=input('text','gmCreatureEffectName',{maxLength:160});statValue(name,effect.name||'');
      const active=input('checkbox','gmCreatureEffectActive');active.checked=effect.active!==false;active.dataset.originalValue=String(active.checked);
      const description=textarea('gmCreatureEffectDescription',12000);description.value=valueText(effect.description);description.dataset.originalValue=description.value;
      effectRow.append(labelControl('Effekt',name),labelControl('Aktiv',active),labelControl('Beschreibung',description));
      if(managed){for(const control of [name,active,description]){control.disabled=true;control.dataset.gmPermanentDisabled='true'}effectRow.append(note('Quellgebundener Effekt: Änderungen erfolgen über den zugehörigen Gegenstand, Vorteil, Nachteil oder die Rune.'))}
      if(Array.isArray(effect.modules)&&effect.modules.length)effectRow.append(note(`${effect.modules.length} Regelmodul(e) bleiben unverändert.`));
      effectList.append(effectRow);
    }
    const money=plainObject(stats.money)?stats.money:{};
    for(const control of form.querySelectorAll('[data-gm-creature-coin]'))statValue(control,money[control.dataset.statId]);
    const canCarry=field(form,'[data-gm-creature-can-carry-items]'),explicitCapability=stats.inventoryProfile?.canCarryItems;
    canCarry.checked=typeof explicitCapability==='boolean'?explicitCapability:true;canCarry.dataset.originalValue=String(canCarry.checked);updateCreatureInventoryCapability(form);
    const inventoryList=field(form,'[data-gm-creature-inventory-list]');clear(inventoryList);form.__inventoryAddQueue=[];renderCreatureInventoryDrafts(form);
    const inventoryError=field(form,'[data-gm-creature-inventory-error]');text(inventoryError,'');show(inventoryError,false);
    let inventoryCount=0;
    for(const [key,label] of creatureInventory)for(const entry of Array.isArray(stats[key])?stats[key]:[]){
      if(!plainObject(entry))continue;inventoryCount++;
      if(['equipment','weapons','armor'].includes(key))inventoryList.append(creatureInventoryRow(key,(stats[key]||[]).indexOf(entry),entry));
      else{
        const quantity=entry.quantity??entry.qty??1,where=entry.storageLocation||entry.loadState||'';
        inventoryList.append(item(`${label}: ${entry.name||'Unbenannter Gegenstand'} · ${quantity}×${where?` · ${where}`:''}`));
      }
    }
    if(!inventoryCount)inventoryList.append(item('Noch keine Gegenstände hinterlegt.'));
  }
  function editedCreatureStats(form,row,templateCore=null){
    if(row?.stats!==null&&row?.stats!==undefined&&!plainObject(row.stats))throw new Error('Die vorhandenen Wesenwerte haben ein unbekanntes Format und wurden nicht überschrieben.');
    const stats=structuredClone(creatureStats(row));
    if(templateCore)overlayTemplateValues(stats,templateCore);
    const canCarry=field(form,'[data-gm-creature-can-carry-items]');
    if(canCarry&&String(canCarry.checked)!==canCarry.dataset.originalValue){const profile=editableStatMap(stats,'inventoryProfile');profile.canCarryItems=canCarry.checked}
    if(canCarry?.checked===false&&(form.__inventoryAddQueue||[]).length)throw new Error('Aktiviere zuerst, dass dieses Wesen Gegenstände tragen oder verwenden kann.');
    for(const control of form.querySelectorAll('[data-gm-creature-attribute]'))if(statChanged(control)){
      const attributes=editableStatMap(stats,'attributes'),id=control.dataset.statId;
      if(control.value==='')delete attributes[id];else attributes[id]=integerStat(control.value,`Grundwert ${id}`,1,25);
    }
    for(const counter of form.querySelectorAll('[data-gm-creature-counter-row]')){
      const max=field(counter,'[data-gm-creature-counter-max]'),current=field(counter,'[data-gm-creature-counter-current]');
      if(!statChanged(max)&&!statChanged(current))continue;
      const counters=editableStatMap(stats,'counters'),id=counter.dataset.gmCreatureCounterRow;
      if(max.value===''&&current.value===''){delete counters[id];continue}
      if(max.value===''||current.value==='')throw new Error(`Counter ${id}: Maximum und aktueller Wert gehören zusammen.`);
      const maximum=integerStat(max.value,`Counter ${id} Maximum`,2,25),now=integerStat(current.value,`Counter ${id} aktuell`,0,maximum);
      if(counters[id]!==null&&counters[id]!==undefined&&!plainObject(counters[id])&&typeof counters[id]!=='number')throw new Error(`Der Counter ${id} hat ein unbekanntes Format und wurde nicht überschrieben.`);
      counters[id]={...(plainObject(counters[id])?counters[id]:{}),max:maximum,current:now};
    }
    for(const skillRow of form.querySelectorAll('[data-gm-creature-skill-id]')){
      const id=skillRow.dataset.gmCreatureSkillId,level=field(skillRow,'[data-gm-creature-skill-level]'),fav=field(skillRow,'[data-gm-creature-skill-fav]'),skillNote=field(skillRow,'[data-gm-creature-skill-note]');
      if(skillRow.dataset.newEntry!=='true'&&!statChanged(level)&&String(fav.checked)===fav.dataset.originalValue&&!statChanged(skillNote))continue;
      const skills=editableStatMap(stats,'skills'),existing=skills[id];
      if(existing!==null&&existing!==undefined&&!plainObject(existing)&&typeof existing!=='number')throw new Error(`Die Fähigkeit ${id} hat ein unbekanntes Format und wurde nicht überschrieben.`);
      const source=plainObject(existing)?existing:{};
      skills[id]={...source,level:integerStat(level.value,`Fähigkeit ${id}`,0,25),fav:fav.checked,note:skillNote.value};
    }
    for(const effectRow of form.querySelectorAll('[data-gm-creature-effect-index]')){
      if(effectRow.dataset.gmCreatureManaged==='true')continue;
      const index=Number(effectRow.dataset.gmCreatureEffectIndex),name=field(effectRow,'[data-gm-creature-effect-name]'),active=field(effectRow,'[data-gm-creature-effect-active]'),description=field(effectRow,'[data-gm-creature-effect-description]');
      if(!statChanged(name)&&String(active.checked)===active.dataset.originalValue&&!statChanged(description))continue;
      if(!name.value.trim())throw new Error('Ein bearbeiteter Effekt benötigt einen Namen.');
      if(!Array.isArray(stats.activeEffectsV177)||!plainObject(stats.activeEffectsV177[index]))throw new Error('Der Effekt wurde zwischenzeitlich verändert. Bitte neu laden.');
      stats.activeEffectsV177[index]={...stats.activeEffectsV177[index],name:name.value.trim(),active:active.checked,description:description.value};
    }
    for(const control of form.querySelectorAll('[data-gm-creature-coin]'))if(statChanged(control)){
      const money=editableStatMap(stats,'money'),id=control.dataset.statId,label=new Map(creatureMoney).get(id)||id;
      if(control.value==='')delete money[id];else money[id]=integerStat(control.value,`${label}münzen`,0,999999999);
    }
    for(const inventoryRow of form.querySelectorAll('[data-gm-creature-inventory-row]')){
      const key=inventoryRow.dataset.inventoryKey,index=Number(inventoryRow.dataset.inventoryIndex);
      const name=field(inventoryRow,'[data-gm-inventory-name]'),quantity=field(inventoryRow,'[data-gm-inventory-quantity]'),description=field(inventoryRow,'[data-gm-inventory-description]');
      const storage=field(inventoryRow,'[data-gm-inventory-storage]'),load=field(inventoryRow,'[data-gm-inventory-load]'),weight=field(inventoryRow,'[data-gm-inventory-weight]');
      if(![name,quantity,description,storage,weight].some(statChanged)&&load.value===load.dataset.originalValue)continue;
      if(!Array.isArray(stats[key])||!plainObject(stats[key][index]))throw new Error('Der Gegenstand hat ein unbekanntes Format und wurde nicht überschrieben.');
      if(!name.value.trim())throw new Error('Ein bearbeiteter Gegenstand benötigt einen Namen.');
      if(storage.value.length>400)throw new Error('Ein Lagerort darf höchstens 400 Zeichen haben.');
      const count=integerStat(quantity.value,'Gegenstandsanzahl',1,1000000),source=stats[key][index];
      if(weight.value!==''&&(!Number.isFinite(Number(weight.value))||Number(weight.value)<0))throw new Error('Das Gegenstandsgewicht muss positiv oder leer sein.');
      const next={...source,name:name.value.trim(),quantity:count,qty:count,description:description.value,storageLocation:storage.value.trim(),loadState:load.value,weightKg:weight.value===''?null:Number(weight.value)};
      if(!String(next.instanceId||'').trim()){
        if(typeof global.crypto?.randomUUID!=='function')throw new Error('Dieses Gerät kann keine sichere Gegenstandskennung erzeugen.');
        next.instanceId=global.crypto.randomUUID();next.id=next.instanceId;
      }
      if(load.value==='equipped')next.equippedQuantity=Math.min(count,Number.isSafeInteger(Number(source.equippedQuantity))?Number(source.equippedQuantity):count);
      else next.equippedQuantity=0;
      stats[key][index]=next;
    }
    for(const draft of form.__inventoryAddQueue||[]){
      let entry;
      if(draft.catalogId)entry=catalogInventoryEntry(draft);
      else{
        if(typeof global.crypto?.randomUUID!=='function')throw new Error('Dieses Gerät kann keine sichere Gegenstandskennung erzeugen.');
        const instanceId=global.crypto.randomUUID();entry={id:instanceId,instanceId,catalogId:'',catalogSource:'custom',name:draft.name,
          itemType:draft.key==='weapons'?'weapon':draft.key==='armor'?'armor':'gear',category:'custom',description:draft.description,
          quantity:draft.quantity,qty:draft.quantity,weightKg:null,valueCopper:0,cbpCost:0,cbp:0,loadState:draft.loadState||'carried',
          equippedQuantity:0,active:true,storageLocation:draft.storageLocation,notes:''};
      }
      if(stats[draft.key]!==undefined&&!Array.isArray(stats[draft.key]))throw new Error('Das vorhandene Weseninventar hat ein unbekanntes Format und wurde nicht überschrieben.');
      stats[draft.key]=Array.isArray(stats[draft.key])?stats[draft.key]:[];stats[draft.key].push(entry);
    }
    const mode=field(form,'[data-gm-creature-view-mode]')?.value==='builder'?'builder':'form';
    if(mode==='builder'||plainObject(stats[CREATURE_BUILDER_PRESENTATION_KEY])){
      const presentation=creatureBuilderPresentation(stats);
      stats[CREATURE_BUILDER_PRESENTATION_KEY]={...presentation,version:CREATURE_BUILDER_PRESENTATION_VERSION,mode,layout:creatureBuilderLayout(presentation.layout)};
    }
    return stats;
  }

  function currentCreaturePreviewRecord(state){
    const ui=state.creatureUi,form=ui?.creatureForm,row=state.creatures.find(entry=>activeRow(entry)&&creatureId(entry)===state.selectedCreatureId),draft=row?null:state.creatureImportDraft,source=row||draft||{};
    const stats=editedCreatureStats(form,source,form.__archetypeApply?.core||null);
    return{...source,name:field(form,'[data-gm-creature-name]').value.trim()||source.name||'Unbenanntes Wesen',species:field(form,'[data-gm-creature-species]').value.trim()||source.species||'Wesen',public_summary:field(form,'[data-gm-creature-summary]').value,gm_notes:field(form,'[data-gm-creature-notes]').value,stats};
  }
  function markCreatureNpcDirty(state){
    const ui=state.creatureUi,form=ui?.creatureForm;if(!form)return;
    form.__npcDirty=true;text(ui.creatureBuilderStatus,'Ungespeicherte Änderungen am gemeinsamen NPC-Dokument. „Wesen speichern“ schreibt Werte, Karten und Layout mit Revisionsprüfung.');
  }
  function syncCreatureMetaFromNpc(state){
    const form=state.creatureUi?.creatureForm,owner=form?.__npcOwner;if(!form||!owner)return;
    const name=field(form,'[data-gm-creature-name]'),species=field(form,'[data-gm-creature-species]');
    if(name&&name.value!==owner.name)name.value=owner.name||'';if(species&&species.value!==owner.npcType)species.value=owner.npcType||'';
  }
  function addCreatureNpcCard(state){
    const ui=state.creatureUi,owner=ui?.creatureForm?.__npcOwner,type=ui?.creatureCardType?.value;if(!owner||!type||typeof cardObject!=='function'||typeof CARD_TYPES==='undefined')return;
    if(type!=='divider'&&owner.layout.some(card=>card.type===type)){text(state.message,`Die NPC-Karte „${CARD_TYPES[type]}“ ist bereits vorhanden.`);return}
    owner.layout.push(cardObject(type,owner.layout.length,12));markCreatureNpcDirty(state);renderCreatureNpcWindow(state);
  }
  function renderCreatureNpcWindow(state){
    const ui=state.creatureUi,form=ui?.creatureForm,root=ui?.creatureBuilderCards,status=ui?.creatureBuilderStatus,owner=form?.__npcOwner;if(!root||!status||!owner)return;
    if(typeof renderCard!=='function'){root.append(note('Das gemeinsame NPC-Fenster konnte in dieser App-Sitzung nicht geladen werden.','notice error'));return}
    mountNpcSheetEditor(root,owner,{beforeRender:target=>target.append(ui.creatureWorldCard),onDirty:()=>markCreatureNpcDirty(state),syncMeta:()=>syncCreatureMetaFromNpc(state),onError:error=>{root.append(note(`NPC-Fenster konnte nicht vollständig dargestellt werden: ${error.message}`,'notice error'));text(status,'Das Wesen wurde nicht verändert. Prüfe die vorhandenen Daten oder verwende eine kompatible App-Fassung.')}});
    if(!form.__npcDirty)text(status,'Echtes NPC-Fenster: Alle Karten, Werte, Gegenstände und das Layout sind direkt bearbeitbar. Gespeichert wird als Weltwesen.');
  }
  function renderCreaturePresentation(state){renderCreatureNpcWindow(state)}

  function resetCreatureWorkspace(state){
    state.creatureLoadSerial=(state.creatureLoadSerial||0)+1;
    state.secretLootEffectLoadSerial=(state.secretLootEffectLoadSerial||0)+1;
    state.creatureWorldId=null;state.creatureCampaignId=null;state.creatureLoaded=false;state.creatureLoading=false;
    state.creatures=[];state.archetypes=[];state.npcCatalog=[];state.creatureDisclosures=[];state.worldPlaces=[];state.worldFactions=[];state.creatureFactionLinks=[];state.creatureLoot=[];state.creatureMigrationRequests=[];state.creatureCompanionLinks=[];state.creatureRequestDetails=new Map();
    state.selectedCreatureId=null;state.selectedArchetypeId=null;state.selectedDisclosureCreatureId=null;state.creatureImportDraft=null;
    state.creatureUi=null;
    clear(field(state.dialog,'[data-gm-panel="beings"]'));
  }
  function ensureCreatureWorkspace(state){
    const panel=field(state.dialog,'[data-gm-panel="beings"]');if(!panel)return null;
    if(state.creatureUi?.panel===panel)return state.creatureUi;
    clear(panel);
    panel.append(heading('h3','Wesen'),note('Wesen sind eigenständige Datensätze dieser Welt. Spieler sehen sie erst nach einer gesonderten Freigabe für ihre Kampagne.','notice'));
    const status=note('Wesen werden geladen …');status.setAttribute('role','status');panel.append(status);
    const retry=button('Wesen erneut laden',()=>loadCreatureWorkspace(state,{force:true}));retry.hidden=true;panel.append(retry);

    const preparedSection=document.createElement('details');preparedSection.className='gm-player-preview';preparedSection.dataset.gmPreparedSection='';
    const preparedSummary=document.createElement('summary');preparedSummary.textContent=`Vorbereitete Archetypen (${preparedArchetypes.length})`;
    preparedSection.append(preparedSummary,note('Diese sofort nutzbaren Startvorlagen decken Alltag, Kampf, Tiere und übernatürliche Wesen ab. Mit „In diese Welt übernehmen“ entsteht eine eigene, frei bearbeitbare Kopie; noch kein Wesen wird angelegt.'));
    const preparedArchetypeList=document.createElement('ul');preparedArchetypeList.dataset.gmPreparedArchetypes='';preparedSection.append(preparedArchetypeList);panel.append(preparedSection);

    const creatureSection=document.createElement('section');creatureSection.className='gm-player-preview';
    creatureSection.append(heading('h4','Wesen dieser Welt'));
    const creatureList=document.createElement('ul');creatureList.dataset.gmCreatureList='';creatureSection.append(creatureList);
    const newCreatureButton=button('Neues Wesen anlegen',()=>{state.selectedCreatureId=null;state.creatureImportDraft=null;renderCreatureForm(state);const form=state.creatureUi?.creatureForm,name=field(form,'[data-gm-creature-name]');form?.scrollIntoView?.({block:'nearest'});name?.focus?.({preventScroll:true});text(state.message,'Das NPC-Fenster für ein neues Wesen ist bereit.')});creatureSection.append(newCreatureButton);
    const creatureForm=document.createElement('form');creatureForm.dataset.gmCreatureForm='';
    const creatureFormHeading=heading('h5','Neues Wesen anlegen');creatureForm.append(creatureFormHeading);
    const creatureImportHint=note('');creatureImportHint.hidden=true;creatureForm.append(creatureImportHint);
    const creatureEditFields=document.createElement('div');creatureEditFields.dataset.gmCreatureEditFields='';creatureEditFields.style.cssText='display:grid;gap:.65rem;min-width:0';
    const creatureBuild=select('gmCreatureBuild',[['','Ausbaustufe auswählen']]);
    const creatureTemplateMode=select('gmCreatureTemplateMode',[['replace-selected','Ausgewählte Bereiche ersetzen'],['fill-empty','Nur leere Bereiche ergänzen']]);
    const creatureTemplateSections=document.createElement('div');creatureTemplateSections.className='grid two';creatureTemplateSections.dataset.gmCreatureTemplateSections='';
    for(const [id,label] of [['profile','Profil, Name und Beschreibung'],['values','Grundwerte, Counter und Vorräte'],['skills','Fähigkeiten und Kraftzuordnungen'],['inventory','Ausrüstung'],['effects','Aktive Effekte'],['paths','Pfade, Vor- und Nachteile'],['cards','NPC-Karten und Anordnung']]){const control=input('checkbox','gmCreatureTemplateSection');control.value=id;control.checked=true;creatureTemplateSections.append(labelControl(label,control))}
    creatureEditFields.append(
      labelControl('Name des Wesens',input('text','gmCreatureName',{required:true,maxLength:120})),
      labelControl('Spezies / Wesenart',input('text','gmCreatureSpecies',{required:true,maxLength:120})),
      labelControl('Archetyp (Vorlage)',select('gmCreatureArchetype',[['','Keine Vorlage']])),
      labelControl('Ausbaustufe',creatureBuild),
      labelControl('Übernahmeart',creatureTemplateMode),
      creatureTemplateSections,
      labelControl('Aktuelle Rollen und Tags, durch Kommas getrennt',input('text','gmCreatureRoles',{maxLength:2000})),
      labelControl('Öffentliche Grundinformation (noch nicht automatisch freigegeben)',textarea('gmCreatureSummary',4000)),
      labelControl('Geheime Spielleitungsnotizen',textarea('gmCreatureNotes',100000))
    );
    field(creatureEditFields,'[data-gm-creature-name]').addEventListener('input',event=>{const owner=creatureForm.__npcOwner;if(owner){owner.name=event.target.value;markCreatureNpcDirty(state)}});
    field(creatureEditFields,'[data-gm-creature-species]').addEventListener('input',event=>{const owner=creatureForm.__npcOwner;if(owner){owner.npcType=event.target.value;markCreatureNpcDirty(state)}});
    creatureForm.append(creatureEditFields);
    const creatureTemplateApply=button('NPC aus Vorlage vorbereiten',()=>stageArchetypeValuesForCreature(state));creatureTemplateApply.disabled=true;creatureTemplateApply.title='Wähle zuerst einen Archetyp.';creatureForm.append(creatureTemplateApply);
    const creatureTemplateHint=note('Die Auswahl allein verändert nichts. Erst der Button bereitet einen unabhängigen, noch ungespeicherten NPC-Entwurf vor.');creatureTemplateHint.dataset.gmCreatureTemplateHint='';creatureForm.append(creatureTemplateHint);
    const refreshCreatureTemplateAction=()=>{
      const selectedId=field(creatureForm,'[data-gm-creature-archetype]')?.value,archetype=state.archetypes.find(row=>activeRow(row)&&archetypeId(row)===selectedId),previous=creatureBuild.value;clear(creatureBuild);creatureForm.__npcBuildChoices=new Map();
      if(!archetype){const option=document.createElement('option');option.value='';option.textContent='Zuerst Archetyp auswählen';creatureBuild.append(option);creatureTemplateApply.disabled=true;text(creatureTemplateHint,'Wähle einen Archetyp. Danach kannst du eine vollständige Ausbaustufe als unabhängigen NPC-Entwurf öffnen.');return}
      let choices=[];try{choices=archetypeBuildChoices(state,archetype)}catch(error){text(creatureTemplateHint,`Die Vorlage kann nicht sicher gelesen werden: ${error.message}`)}
      if(!choices.length){const option=document.createElement('option');option.value='';option.textContent='Keine Ausbaustufe vorhanden';creatureBuild.append(option);creatureTemplateApply.disabled=true;text(creatureTemplateHint,`„${archetype.name}“ enthält noch keinen nutzbaren NPC-Datensatz.`);return}
      for(const build of choices){const option=document.createElement('option');option.value=build.value;option.textContent=`${build.label}${build.isDefault?' · Standard':''}`;creatureBuild.append(option);creatureForm.__npcBuildChoices.set(build.value,build)}
      creatureBuild.value=creatureForm.__npcBuildChoices.has(previous)?previous:(choices.find(build=>build.isDefault)||choices[0]).value;const build=creatureForm.__npcBuildChoices.get(creatureBuild.value);creatureTemplateApply.disabled=false;creatureTemplateApply.title='Öffnet die Ausbaustufe als unabhängigen, noch ungespeicherten NPC-Entwurf.';text(creatureTemplateHint,`${archetype.name} · ${build.label}: ${npcBuildSummary(archetype,build)}. Die Vorlage bleibt nach der Übernahme unverändert.`);
    };
    field(creatureForm,'[data-gm-creature-archetype]').addEventListener('change',()=>{creatureForm.__archetypeApply=null;refreshCreatureTemplateAction()});
    creatureBuild.addEventListener('change',()=>{const archetype=state.archetypes.find(row=>activeRow(row)&&archetypeId(row)===field(creatureForm,'[data-gm-creature-archetype]').value),build=creatureForm.__npcBuildChoices?.get(creatureBuild.value);if(archetype&&build)text(creatureTemplateHint,`${archetype.name} · ${build.label}: ${npcBuildSummary(archetype,build)}. Die Vorlage bleibt nach der Übernahme unverändert.`)});
    creatureEditFields.append(creatureTemplateApply,creatureTemplateHint);
    creatureEditFields.append(note('Diese Weltangaben umgeben dasselbe NPC-Dokument, das auch ein NPC-Reiter verwendet. Geheime Angaben bleiben außerhalb des NPC-Dokuments.'));
    const creatureBuilderView=document.createElement('section');creatureBuilderView.dataset.gmCreatureBuilderView='';creatureBuilderView.className='gm-npc-window';
    const creatureBuilderStatus=note('Das gemeinsame NPC-Fenster wird vorbereitet.','notice');creatureBuilderStatus.dataset.gmCreatureBuilderStatus='';
    const creatureBuilderToolbar=document.createElement('aside');creatureBuilderToolbar.className='gm-npc-card-palette edit-only';creatureBuilderToolbar.append(heading('h6','NPC-Karten'));
    const creatureCardType=document.createElement('select');creatureCardType.dataset.gmCreatureCardType='';creatureCardType.setAttribute('aria-label','NPC-Kartentyp');
    if(typeof CARD_TYPES!=='undefined')for(const [type,label] of Object.entries(CARD_TYPES)){const option=document.createElement('option');option.value=type;option.textContent=label;creatureCardType.append(option)}
    creatureBuilderToolbar.append(creatureCardType,button('Karte hinzufügen',()=>addCreatureNpcCard(state)));
    const creatureBuilderCards=document.createElement('div');creatureBuilderCards.className='sheet game';creatureBuilderCards.dataset.gmCreatureBuilderCards='';creatureBuilderCards.setAttribute('aria-label','Wesen in der NPC-Kartenansicht des Builders');
    const creatureWorldCard=document.createElement('article');creatureWorldCard.className='card gm-world-card';creatureWorldCard.style.cssText='--w:12;--pw:12';creatureWorldCard.dataset.gmCreatureWorldCard='';
    const creatureWorldHead=document.createElement('header');creatureWorldHead.className='card-head';creatureWorldHead.append(heading('h2','Weltbezug'));
    const creatureWorldBody=document.createElement('div');creatureWorldBody.className='card-body';creatureWorldBody.append(creatureEditFields);creatureWorldCard.append(creatureWorldHead,creatureWorldBody);
    creatureBuilderCards.append(creatureWorldCard);
    const creatureBuilderShell=document.createElement('div');creatureBuilderShell.className='gm-npc-window-shell';creatureBuilderShell.append(creatureBuilderToolbar,creatureBuilderCards);
    creatureBuilderView.append(creatureBuilderStatus,creatureBuilderShell);creatureForm.append(creatureBuilderView);
    const creatureSave=submitButton('Wesen speichern');creatureForm.append(creatureSave);
    const creatureArchive=button('Wesen archivieren',()=>archiveCreature(state),'danger');creatureArchive.hidden=true;creatureForm.append(creatureArchive);
    creatureForm.addEventListener('submit',event=>{event.preventDefault();saveCreature(state)});
    creatureSection.append(creatureForm);panel.append(creatureSection);

    const referenceSection=document.createElement('section');referenceSection.className='gm-player-preview';
    referenceSection.append(heading('h4','Ort und Fraktionen des Wesens'));
    const referenceHint=note('Wähle zuerst ein vorhandenes Wesen. Ort und Fraktionen sind Spielleitungsdaten und werden nicht automatisch veröffentlicht.');referenceSection.append(referenceHint);
    const referenceEditor=document.createElement('div');referenceEditor.dataset.gmCreatureReferences='';referenceEditor.hidden=true;
    referenceEditor.append(labelControl('Aktueller Ort',select('gmCreaturePlace',[['','Kein Ort hinterlegt']])),button('Aufenthaltsort speichern',()=>saveCreaturePlace(state)));
    referenceEditor.append(labelControl('Fraktion hinzufügen',select('gmCreatureFaction',[['','Fraktion auswählen']])),button('Fraktion zuordnen',()=>addCreatureFaction(state)));
    const factionLinks=document.createElement('ul');factionLinks.dataset.gmCreatureFactionLinks='';referenceEditor.append(factionLinks);
    referenceSection.append(referenceEditor);panel.append(referenceSection);

    const lootSection=document.createElement('section');lootSection.className='gm-player-preview';
    lootSection.append(heading('h4','Beute für Kampagnenfiguren'));
    lootSection.append(note('Eine Übertragung entfernt den Gegenstand atomar aus dem Inventar des Wesens und legt einen privaten Beutezugang bei der Figur an. Beute kostet keine CBP; Spieler übernehmen sie anschließend selbst.'));
    const lootHint=note('Wähle ein bestehendes Wesen, um Ausrüstung, Waffen oder Rüstung als Beute zuzuordnen.');lootSection.append(lootHint);
    const lootForm=document.createElement('form');lootForm.dataset.gmCreatureLootForm='';lootForm.hidden=true;
    lootForm.append(
      labelControl('Gegenstand des Wesens',select('gmCreatureLootItem',[['','Gegenstand auswählen']])),
      labelControl('Zielfigur dieser Kampagne',select('gmCreatureLootCharacter',[['','Figur auswählen']])),
      labelControl('Menge',input('number','gmCreatureLootQuantity',{required:true,min:1,max:1000000,value:'1'})),
      labelControl('Für Spieler freigegebener Gegenstandsname',input('text','gmCreatureLootPlayerName',{required:true,maxLength:160})),
      labelControl('Für Spieler freigegebene Beschreibung',textarea('gmCreatureLootPlayerDescription',4000)),
      submitButton('Beute zuordnen')
    );
    const lootRuleHint=note('Gegenstände mit gebundenen Wirkungen können nur als ganzer Stapel übertragen werden. Runengebundene Gegenstände brauchen zuerst eine eigene Bindungsregel.');lootRuleHint.dataset.gmCreatureLootRule='';lootForm.append(lootRuleHint);
    field(lootForm,'[data-gm-creature-loot-item]').addEventListener('change',()=>renderLootTransferRule(state));
    lootForm.addEventListener('submit',event=>{event.preventDefault();transferCreatureLoot(state)});lootSection.append(lootForm);
    lootSection.append(heading('h5','Beutezugänge dieser Kampagne'));
    const lootList=document.createElement('ul');lootList.dataset.gmCreatureLootList='';lootSection.append(lootList);
    const secretLootEffects=document.createElement('section');secretLootEffects.dataset.gmSecretLootEffects='';
    secretLootEffects.append(heading('h5','Geheime Wirkungen übernommener Beute'));
    secretLootEffects.append(note('Nur für die Spielleitung. „Vorgemerkt“ beschreibt allein den Ausrüstungsstand; die Regelwirkungen werden noch nicht automatisch in die Figurenwerte eingerechnet.'));
    const secretLootEffectStatus=note('Geheime Wirkungen werden geladen …');secretLootEffectStatus.setAttribute('role','status');secretLootEffects.append(secretLootEffectStatus);
    const secretLootEffectRefresh=button('Geheime Wirkungen aktualisieren',()=>loadSecretLootEffects(state));secretLootEffects.append(secretLootEffectRefresh);
    const secretLootEffectList=document.createElement('ul');secretLootEffectList.dataset.gmSecretLootEffectList='';secretLootEffectList.hidden=true;secretLootEffects.append(secretLootEffectList);
    lootSection.append(secretLootEffects);panel.append(lootSection);

    const companionSection=document.createElement('section');companionSection.className='gm-player-preview';
    companionSection.append(heading('h4','Begleiter und freiwillige Reiter-Übernahme'));
    companionSection.append(note('Spieler können einen lokalen NPC-, Vertrauten- oder Reittier-Reiter ausdrücklich zur Prüfung freigeben. Die lokale Vorlage und ihre CBP bleiben unverändert. Ein Weltwesen entsteht erst, wenn du es selbst speicherst; eine Verknüpfung braucht danach eine eigene Entscheidung.'));
    companionSection.append(heading('h5','Übernahmeanfragen'));
    const migrationList=document.createElement('ul');migrationList.dataset.gmCreatureMigrationList='';companionSection.append(migrationList);
    companionSection.append(heading('h5','Begleiterverknüpfungen dieser Kampagne'));
    const companionList=document.createElement('ul');companionList.dataset.gmCreatureCompanionList='';companionSection.append(companionList);
    const companionForm=document.createElement('form');companionForm.dataset.gmCreatureCompanionForm='';
    companionForm.append(
      labelControl('Figur',select('gmCreatureCompanionCharacter',[['','Figur auswählen']])),
      labelControl('Wesen dieser Welt',select('gmCreatureCompanionCreature',[['','Wesen auswählen']])),
      labelControl('Verknüpfung',select('gmCreatureCompanionKind',[['companion','Begleiter'],['familiar','Vertrauter'],['mount','Reittier']])),
      submitButton('Begleiter verknüpfen')
    );
    companionForm.addEventListener('submit',event=>{event.preventDefault();saveManualCreatureCompanion(state)});
    companionSection.append(companionForm);panel.append(companionSection);

    const disclosureSection=document.createElement('section');disclosureSection.className='gm-player-preview';
    disclosureSection.append(heading('h4','Freigabe für diese Kampagne'));
    disclosureSection.append(note('Eine Freigabe gilt nur für die gewählte Kampagne. Name und Kurztext für Spieler werden nicht aus geheimen Angaben übernommen.'));
    const disclosureForm=document.createElement('form');disclosureForm.dataset.gmCreatureDisclosureForm='';disclosureForm.hidden=true;
    const disclosureHeading=heading('h5','Wesen auswählen');disclosureForm.append(disclosureHeading);
    const disclosureState=note('Noch keine Freigabe für diese Kampagne.');disclosureForm.append(disclosureState);
    const disclosureSave=submitButton('Kampagnenfreigabe speichern');
    disclosureForm.append(
      labelControl('Sichtbarkeit',select('gmCreatureVisibility',[['secret','Geheim – für Spieler unsichtbar'],['partial','Teilweise bekannt'],['known','Bekannt']])),
      labelControl('Name für Spieler',input('text','gmCreaturePlayerName',{maxLength:120})),
      labelControl('Kurztext für Spieler',textarea('gmCreaturePlayerSummary',4000)),
      disclosureSave
    );
    disclosureForm.addEventListener('submit',event=>{event.preventDefault();saveCreatureDisclosure(state)});
    disclosureSection.append(disclosureForm);
    const disclosureHint=note('Wähle bei einem Wesen „Kampagnenfreigabe“, um seine Sichtbarkeit festzulegen.');disclosureSection.append(disclosureHint);
    panel.append(disclosureSection);

    const archetypeSection=document.createElement('section');archetypeSection.className='gm-player-preview';
    archetypeSection.append(heading('h4','Eigene Archetypen'));
    const archetypeList=document.createElement('ul');archetypeSection.append(archetypeList);
    archetypeSection.append(button('Neuen Archetyp anlegen',()=>{state.selectedArchetypeId=null;renderArchetypeForm(state)}));
    const archetypeForm=document.createElement('form');archetypeForm.dataset.gmArchetypeForm='';
    const archetypeFormHeading=heading('h5','Neuen Archetyp anlegen');archetypeForm.append(archetypeFormHeading);
    archetypeForm.append(
      labelControl('Name der Vorlage',input('text','gmArchetypeName',{required:true,maxLength:120})),
      labelControl('Archetypgruppe',select('gmArchetypeGroup',archetypeGroups)),
      labelControl('Beschreibung der Vorlage',textarea('gmArchetypeDescription',12000))
    );
    const archetypeCanCarry=input('checkbox','gmArchetypeCanCarryItems');archetypeCanCarry.checked=true;archetypeForm.append(labelControl('Wesen dieses Archetyps können Gegenstände tragen oder verwenden',archetypeCanCarry));
    archetypeForm.append(note('Ein vorhandenes Wesen kann als vollständige Standard-Ausbaustufe gespeichert werden: Profil, Werte, Fähigkeiten, Pfade, Effekte, Ausrüstung und NPC-Karten. Beim späteren Erzeugen entstehen stets neue unabhängige Kennungen. Weltort, Fraktionsverknüpfungen und Kampagnenfreigaben werden nicht Teil der Vorlage.'));
    archetypeForm.append(labelControl('Vollständigen NPC von diesem Wesen vorbereiten',select('gmArchetypeSourceCreature',[['','Wesen auswählen']])));
    archetypeForm.append(button('Vollständige Standard-Ausbaustufe vorbereiten',()=>stageArchetypeValuesFromCreature(state)));
    const archetypeTemplateHint=note('Noch keine Werte aus einem Wesen vorbereitet.');archetypeTemplateHint.dataset.gmArchetypeTemplateHint='';archetypeForm.append(archetypeTemplateHint);
    archetypeForm.append(heading('h6','Verknüpfte Standarditems'));
    const archetypeCatalogItems=document.createElement('ul');archetypeCatalogItems.dataset.gmArchetypeCatalogItems='';archetypeForm.append(archetypeCatalogItems);
    archetypeForm.append(makeItemCatalogPicker('standard',reference=>addArchetypeCatalogReference(archetypeForm,reference)));
    archetypeForm.append(submitButton('Archetyp speichern'));
    const archetypeArchive=button('Archetyp archivieren',()=>archiveArchetype(state),'danger');archetypeArchive.hidden=true;archetypeForm.append(archetypeArchive);
    archetypeForm.addEventListener('submit',event=>{event.preventDefault();saveArchetype(state)});
    archetypeSection.append(archetypeForm);panel.append(archetypeSection);

    const registrySection=document.createElement('section');registrySection.className='gm-player-preview';
    registrySection.append(heading('h4','Weltreferenzen für Wesen'),note('Hier legst du nur eindeutige Namen an. Die ausführliche Orts- und Fraktionsverwaltung folgt im Weltmodul. Alle Angaben bleiben vorerst geheim.'));
    registrySection.append(heading('h5','Orte'));
    const placeList=document.createElement('ul');placeList.dataset.gmWorldPlaces='';registrySection.append(placeList);
    const placeForm=document.createElement('form');placeForm.dataset.gmWorldPlaceForm='';
    placeForm.append(labelControl('Neuen Ort anlegen',input('text','gmWorldPlaceName',{required:true,maxLength:120})),submitButton('Ort anlegen'));
    placeForm.addEventListener('submit',event=>{event.preventDefault();createWorldPlace(state)});registrySection.append(placeForm);
    registrySection.append(heading('h5','Fraktionen'));
    const factionList=document.createElement('ul');factionList.dataset.gmWorldFactions='';registrySection.append(factionList);
    const factionForm=document.createElement('form');factionForm.dataset.gmWorldFactionForm='';
    factionForm.append(labelControl('Neue Fraktion anlegen',input('text','gmWorldFactionName',{required:true,maxLength:120})),submitButton('Fraktion anlegen'));
    factionForm.addEventListener('submit',event=>{event.preventDefault();createWorldFaction(state)});registrySection.append(factionForm);panel.append(registrySection);

    state.creatureUi={panel,status,retry,editorSections:[preparedSection,creatureSection,referenceSection,lootSection,companionSection,disclosureSection,archetypeSection,registrySection],preparedSection,preparedArchetypeList,referenceSection,lootSection,secretLootEffectStatus,secretLootEffectRefresh,secretLootEffectList,companionSection,registrySection,creatureList,newCreatureButton,creatureForm,creatureFormHeading,creatureImportHint,creatureEditFields,creatureBuilderView,creatureBuilderStatus,creatureBuilderToolbar,creatureCardType,creatureBuilderCards,creatureWorldCard,creatureTemplateHint,creatureTemplateApply,refreshCreatureTemplateAction,creatureArchive,referenceHint,referenceEditor,factionLinks,lootHint,lootForm,lootRuleHint,lootList,migrationList,companionList,companionForm,placeList,placeForm,factionList,factionForm,disclosureForm,disclosureHeading,disclosureState,disclosureSave,disclosureHint,archetypeList,archetypeForm,archetypeFormHeading,archetypeTemplateHint,archetypeCatalogItems,archetypeArchive};
    return state.creatureUi;
  }
  function renderCreatureList(state){
    const ui=ensureCreatureWorkspace(state);if(!ui)return;
    clear(ui.creatureList);
    const rows=state.creatures.filter(activeRow);
    if(!rows.length)ui.creatureList.append(item('Noch kein Wesen in dieser Welt angelegt.'));
    const archetypes=new Map(state.archetypes.map(row=>[archetypeId(row),`${row.name}${activeRow(row)?'':' (archiviert)'}`]));
    for(const row of rows){
      const template=row.archetype_id?` · Archetyp: ${archetypes.get(row.archetype_id)||'Nicht verfügbare Vorlage'}`:'';
      const tags=roleTags(row.role_tags);const label=`${row.name} · ${row.species}${template}${tags.length?` · Rollen/Tags: ${tags.join(', ')}`:''}`;
      const controls=[button('Bearbeiten',()=>{state.selectedCreatureId=creatureId(row);renderCreatureForm(state)})];
      if(typeof state.repository.transferCreatureLoot==='function')controls.push(button('Beute',()=>{state.selectedCreatureId=creatureId(row);renderCreatureForm(state)}));
      if(typeof state.repository.listCampaignCreatureDisclosures==='function'&&typeof state.repository.saveCampaignCreatureDisclosure==='function')controls.push(button('Kampagnenfreigabe',()=>{state.selectedDisclosureCreatureId=creatureId(row);renderCreatureDisclosure(state)}));
      ui.creatureList.append(item(label,...controls));
    }
    const archived=state.creatures.filter(row=>!activeRow(row));
    if(archived.length)ui.creatureList.append(item('Archivierte Wesen:'));
    for(const row of archived){
      const placeArchived=!!row.current_place_id&&!state.worldPlaces.some(place=>activeRow(place)&&placeId(place)===row.current_place_id);
      ui.creatureList.append(item(`${row.name} · ${row.species} · archiviert${placeArchived?' · früherer Ort inzwischen archiviert':''}`,
        placeArchived?button('Archivierten Ort lösen',()=>clearArchivedCreaturePlace(state,row)):button('Wiederherstellen',()=>restoreCreature(state,row))));
    }
    renderCreatureForm(state);renderCreatureDisclosure(state);
  }
  function renderCreatureForm(state){
    const ui=ensureCreatureWorkspace(state);if(!ui)return;
    const form=ui.creatureForm,row=state.creatures.find(entry=>activeRow(entry)&&creatureId(entry)===state.selectedCreatureId),draft=row?null:state.creatureImportDraft,source=row||draft;
    form.__archetypeApply=null;form.__npcDirty=false;form.__npcOwner=creatureToBuilderNpc(source||{name:'Neues Wesen',species:'Wesen',stats:{}});
    text(ui.creatureFormHeading,row?`${row.name} bearbeiten`:draft?'Wesen aus freigegebener Vorlage vorbereiten':'Neues Wesen anlegen');
    text(ui.creatureImportHint,draft?'Die freigegebene Spieler-Vorlage wurde als vollständiges NPC-Dokument in dieses Fenster übernommen. Prüfe Weltbezug und geheime Angaben; Speichern legt ein unabhängiges Weltwesen an.':'');show(ui.creatureImportHint,!!draft);
    text(ui.creatureTemplateHint,'Die Auswahl eines Archetyps allein ändert nichts. Eine bewusste Übernahme ergänzt Werte und Standardausrüstung direkt im gemeinsamen NPC-Dokument.');
    field(form,'[data-gm-creature-name]').value=source?.name||form.__npcOwner.name||'';
    field(form,'[data-gm-creature-species]').value=source?.species||form.__npcOwner.npcType||'';
    field(form,'[data-gm-creature-roles]').value=roleTags(source?.role_tags).join(', ');
    field(form,'[data-gm-creature-summary]').value=source?.public_summary||'';
    field(form,'[data-gm-creature-notes]').value=source?.gm_notes||'';
    const template=field(form,'[data-gm-creature-archetype]');clear(template);
    const none=document.createElement('option');none.value='';none.textContent='Keine Vorlage';template.append(none);
    for(const archetype of state.archetypes.filter(activeRow)){const option=document.createElement('option');option.value=archetypeId(archetype);option.textContent=archetype.name;template.append(option)}
    if(row?.archetype_id&&!state.archetypes.some(archetype=>activeRow(archetype)&&archetypeId(archetype)===row.archetype_id)){
      const archived=state.archetypes.find(archetype=>archetypeId(archetype)===row.archetype_id),option=document.createElement('option');
      option.value=row.archetype_id;option.textContent=`${archived?.name||'Vorlage'} (archiviert – bestehende Verknüpfung)`;template.append(option);
    }
    template.value=source?.archetype_id||'';field(form,'[data-gm-creature-template-mode]').value=row?'fill-empty':'replace-selected';ui.refreshCreatureTemplateAction();ui.creatureArchive.hidden=!row;
    renderCreatureReferences(state,row);renderCreatureLootForm(state,row);renderCreaturePresentation(state);
  }
  function renderCreatureReferences(state,creature){
    const ui=ensureCreatureWorkspace(state);if(!ui)return;
    show(ui.referenceEditor,!!creature);show(ui.referenceHint,!creature);if(!creature)return;
    const place=field(ui.referenceEditor,'[data-gm-creature-place]');clear(place);
    const emptyPlace=document.createElement('option');emptyPlace.value='';emptyPlace.textContent='Kein Ort hinterlegt';place.append(emptyPlace);
    for(const row of state.worldPlaces.filter(activeRow)){const option=document.createElement('option');option.value=placeId(row);option.textContent=row.name;place.append(option)}
    if(creature.current_place_id&&!state.worldPlaces.some(row=>activeRow(row)&&placeId(row)===creature.current_place_id)){
      const archived=state.worldPlaces.find(row=>placeId(row)===creature.current_place_id),option=document.createElement('option');
      option.value=creature.current_place_id;option.textContent=`${archived?.name||'Unbekannter Ort'} (archiviert)`;place.append(option);
    }
    place.value=creature.current_place_id||'';
    const activeLinks=state.creatureFactionLinks.filter(row=>activeRow(row)&&row.creature_id===creatureId(creature));
    const faction=field(ui.referenceEditor,'[data-gm-creature-faction]');clear(faction);
    const emptyFaction=document.createElement('option');emptyFaction.value='';emptyFaction.textContent='Fraktion auswählen';faction.append(emptyFaction);
    for(const row of state.worldFactions.filter(activeRow))if(!activeLinks.some(link=>link.faction_id===factionId(row))){
      const option=document.createElement('option');option.value=factionId(row);option.textContent=row.name;faction.append(option)
    }
    clear(ui.factionLinks);
    if(!activeLinks.length)ui.factionLinks.append(item('Noch keiner Fraktion zugeordnet.'));
    for(const link of activeLinks){
      const row=state.worldFactions.find(entry=>factionId(entry)===link.faction_id);
      ui.factionLinks.append(item(row?.name||'Unbekannte Fraktion',button('Zuordnung entfernen',()=>removeCreatureFaction(state,link))));
    }
  }
  function renderReferenceRegistries(state){
    const ui=ensureCreatureWorkspace(state);if(!ui)return;
    clear(ui.placeList);clear(ui.factionList);
    const places=state.worldPlaces.filter(activeRow),factions=state.worldFactions.filter(activeRow);
    if(!places.length)ui.placeList.append(item('Noch kein Ort angelegt.'));
    for(const row of places)ui.placeList.append(item(row.name));
    if(!factions.length)ui.factionList.append(item('Noch keine Fraktion angelegt.'));
    for(const row of factions)ui.factionList.append(item(row.name));
    const archivedPlaces=state.worldPlaces.filter(row=>!activeRow(row)),archivedFactions=state.worldFactions.filter(row=>!activeRow(row));
    for(const row of archivedPlaces)ui.placeList.append(item(`${row.name} · archiviert`));
    for(const row of archivedFactions)ui.factionList.append(item(`${row.name} · archiviert`));
  }
  function transferableCreatureItems(creature){
    const stats=creatureStats(creature),rows=[];
    for(const key of ['equipment','weapons','armor'])for(const entry of Array.isArray(stats[key])?stats[key]:[]){
      if(!plainObject(entry)||!String(entry.instanceId||'').trim())continue;
      const quantity=Number(entry.quantity??entry.qty??1);
      if(!Number.isSafeInteger(quantity)||quantity<1)continue;
      rows.push({key,instanceId:String(entry.instanceId),name:String(entry.name||'Unbenannter Gegenstand'),quantity});
    }
    return rows;
  }
  function creatureLootRule(creature,key,instanceId){
    const stats=creatureStats(creature),entry=(Array.isArray(stats[key])?stats[key]:[]).find(item=>plainObject(item)&&item.instanceId===instanceId);
    if(!entry)return null;
    const quantity=Number(entry.quantity??entry.qty??1),effects=Array.isArray(stats.activeEffectsV177)?stats.activeEffectsV177:[];
    const linked=effects.filter(effect=>plainObject(effect)&&effect.sourceId===instanceId);
    const runeBound=effects.some(effect=>plainObject(effect)&&(
      effect.runeBindingV1717?.carrierId===instanceId&&effect.runeBindingV1717?.carrierType==='item'
      ||effect.runeBindingV1717?.carrierKey===`item:${instanceId}`));
    const unsupported=linked.some(effect=>effect.sourceType!=='item');
    const requiresWhole=linked.length>0||Array.isArray(entry.effectIdsV177)&&entry.effectIdsV177.length>0||!!String(entry.effect||'').trim();
    return{entry,quantity,requiresWhole,blocked:runeBound||unsupported,reason:runeBound?'Runengebundene Gegenstände benötigen zuerst eine eigene Bindungsregel.':unsupported?'Dieser Gegenstand trägt eine Wirkung, die derzeit nicht übertragen werden kann.':''};
  }
  function selectedCreatureLootRule(state){
    const form=state.creatureUi?.lootForm,creature=state.creatures.find(row=>activeRow(row)&&creatureId(row)===state.selectedCreatureId);
    let selection;try{selection=JSON.parse(field(form,'[data-gm-creature-loot-item]')?.value)}catch{}
    if(!form||!creature||!Array.isArray(selection)||selection.length!==2)return null;
    return creatureLootRule(creature,selection[0],selection[1]);
  }
  function renderLootTransferRule(state){
    const form=state.creatureUi?.lootForm,hint=state.creatureUi?.lootRuleHint;if(!form||!hint)return;
    const rule=selectedCreatureLootRule(state),quantity=field(form,'[data-gm-creature-loot-quantity]');
    if(!rule){quantity.min='1';quantity.max='1000000';text(hint,'Gegenstände mit gebundenen Wirkungen können nur als ganzer Stapel übertragen werden. Runengebundene Gegenstände brauchen zuerst eine eigene Bindungsregel.');return}
    quantity.max=String(rule.quantity);
    if(rule.blocked){text(hint,rule.reason);return}
    if(rule.requiresWhole){quantity.min=String(rule.quantity);quantity.value=String(rule.quantity);text(hint,`Dieser Gegenstand hat gebundene Wirkungen. Der gesamte Stapel (${rule.quantity} Stück) muss zusammen übertragen werden.`)}
    else{quantity.min='1';quantity.value='1';text(hint,'Teilmengen sind möglich, sofern der Server für diesen Gegenstand keine besondere Bindung erkennt. Beute kostet keine CBP.')}
  }
  function renderCreatureLootForm(state,creature){
    const ui=ensureCreatureWorkspace(state);if(!ui)return;
    show(ui.lootForm,!!creature);show(ui.lootHint,!creature);if(!creature)return;
    const itemChoice=field(ui.lootForm,'[data-gm-creature-loot-item]');clear(itemChoice);
    const emptyItem=document.createElement('option');emptyItem.value='';emptyItem.textContent='Gegenstand auswählen';itemChoice.append(emptyItem);
    for(const row of transferableCreatureItems(creature)){
      const option=document.createElement('option');option.value=JSON.stringify([row.key,row.instanceId]);option.textContent=`${row.name} · ${row.quantity}× · ${row.key}`;itemChoice.append(option);
    }
    const characterChoice=field(ui.lootForm,'[data-gm-creature-loot-character]');clear(characterChoice);
    const emptyCharacter=document.createElement('option');emptyCharacter.value='';emptyCharacter.textContent='Figur auswählen';characterChoice.append(emptyCharacter);
    for(const row of state.selectedData?.characters||[])if(['approved_locked','change_pending'].includes(row.status)){
      const option=document.createElement('option');option.value=row.id;option.textContent=row.public_data?.name||row.id;characterChoice.append(option);
    }
    field(ui.lootForm,'[data-gm-creature-loot-quantity]').value='1';
    field(ui.lootForm,'[data-gm-creature-loot-player-name]').value='';
    field(ui.lootForm,'[data-gm-creature-loot-player-description]').value='';
    renderLootTransferRule(state);
  }
  function renderCreatureLootReceipts(state){
    const ui=ensureCreatureWorkspace(state);if(!ui)return;clear(ui.lootList);
    if(!state.creatureLoot.length){ui.lootList.append(item('Noch keine Beute übertragen.'));return}
    for(const receipt of state.creatureLoot){
      const creature=state.creatures.find(row=>creatureId(row)===receipt.creature_id),character=state.selectedData?.characters?.find(row=>row.id===receipt.character_id);
      const status=receipt.status==='pending'?'wartet auf Spieler':receipt.status==='claimed'?'übernommen':'rückgängig gemacht';
      const label=`${receipt.quantity}× ${receipt.item_name} · ${creature?.name||'Wesen'} → ${character?.public_data?.name||'Figur'} · ${status}`;
      const controls=receipt.status==='pending'?[button('Rückgängig',()=>reverseCreatureLoot(state,receipt))]:[];
      ui.lootList.append(item(label,...controls));
    }
  }
  function secretLootModuleLabel(module){
    if(!plainObject(module))return String(module??'Regelmodul ohne Angaben');
    const parts=[];
    for(const [key,label] of [['type','Art'],['target','Ziel'],['operation','Operation'],['value','Wert'],['display','Anzeige'],['scope','Bedingung'],['interval','Intervall']]){
      if(module[key]!==undefined&&module[key]!==null&&module[key]!=='')parts.push(`${label}: ${String(module[key])}`);
    }
    return parts.join(' · ')||'Regelmodul ohne lesbare Angaben';
  }
  function renderSecretLootEffects(state,rows,ui){
    clear(ui.secretLootEffectList);
    const withEffects=rows.filter(row=>row.effects_payload.length>0);
    if(!withEffects.length){text(ui.secretLootEffectStatus,'Für übernommene Beute sind derzeit keine geheimen Wirkungen hinterlegt.');show(ui.secretLootEffectList,false);return}
    const characters=new Map((state.selectedData?.characters||[]).map(row=>[row.id,row.public_data?.name||'Unbenannte Figur']));
    for(const row of withEffects){
      const owner=characters.get(row.character_id)||'Figur dieser Kampagne';
      const eligibility=row.effect_eligible===true?'Für spätere Regelprüfung vorgemerkt':'Derzeit nicht für die Regelprüfung vorgemerkt';
      const entry=item(`${row.item_name||'Unbenannter Gegenstand'} · ${owner} · ${eligibility}`);
      const effects=document.createElement('ul');
      for(const effect of row.effects_payload){
        const valid=plainObject(effect),name=valid?String(effect.name||'Unbenannte Wirkung'):'Wirkung ohne lesbare Angaben';
        const effectEntry=item(`${name}${valid&&effect.active===false?' · im Gegenstand deaktiviert':''}`);
        if(valid&&effect.description)effectEntry.append(note(String(effect.description)));
        if(valid&&Array.isArray(effect.modules)&&effect.modules.length){
          const modules=document.createElement('ul');
          for(const module of effect.modules)modules.append(item(secretLootModuleLabel(module)));
          effectEntry.append(modules);
        }else effectEntry.append(note('Keine strukturierten Regelmodule hinterlegt.'));
        effects.append(effectEntry);
      }
      entry.append(effects);ui.secretLootEffectList.append(entry);
    }
    text(ui.secretLootEffectStatus,`${withEffects.length} übernommene Gegenstände mit geheimen Wirkungen. Kein Effekt ist dadurch bereits in Figurenwerte eingerechnet.`);
    show(ui.secretLootEffectList,true);
  }
  async function loadSecretLootEffects(state){
    const ui=state.creatureUi,campaignId=state.selectedCampaignId,worldId=state.selectedCampaign?.world_id;
    if(!ui||!state.creatureLoaded||!canManageCreatureWorld(state)||state.creatureCampaignId!==campaignId||state.creatureWorldId!==worldId)return;
    const serial=++state.secretLootEffectLoadSerial,creatureSerial=state.creatureLoadSerial,authEpoch=state.authEpoch;
    const current=()=>serial===state.secretLootEffectLoadSerial&&creatureSerial===state.creatureLoadSerial&&authEpoch===state.authEpoch&&state.creatureUi===ui&&state.selectedCampaignId===campaignId&&state.selectedCampaign?.world_id===worldId;
    clear(ui.secretLootEffectList);show(ui.secretLootEffectList,false);
    if(typeof state.repository.listCampaignInventoryEffects!=='function'){
      text(ui.secretLootEffectStatus,'Die geheime Wirkungsansicht ist in dieser App-Fassung noch nicht verfügbar. Die Beuteverwaltung bleibt nutzbar.');show(ui.secretLootEffectRefresh,false);return;
    }
    text(ui.secretLootEffectStatus,'Geheime Wirkungen werden geladen …');show(ui.secretLootEffectRefresh,false);
    try{
      const rows=await state.repository.listCampaignInventoryEffects(campaignId);
      if(!current())return;
      if(!Array.isArray(rows)||rows.some(row=>!row||row.campaign_id!==campaignId||row.world_id!==worldId||!Array.isArray(row.effects_payload)))throw new Error('Die geheime Wirkungsansicht lieferte keine gültigen Daten für diese Kampagne.');
      renderSecretLootEffects(state,rows,ui);
    }catch(error){
      if(!current())return;
      clear(ui.secretLootEffectList);show(ui.secretLootEffectList,false);
      text(ui.secretLootEffectStatus,`Geheime Wirkungen konnten nicht geladen werden: ${friendlyError(error)} Die übrige Beuteverwaltung bleibt nutzbar.`);
    }finally{if(current())show(ui.secretLootEffectRefresh,true)}
  }
  async function getCreatureMigrationDetail(state,request){
    if(typeof state.repository.getCreatureAuxMigrationRequest!=='function')throw new Error('Die Antragsdetails sind in dieser App-Fassung nicht verfügbar.');
    const cached=state.creatureRequestDetails.get(request.request_id);
    if(cached&&cached.revision===request.revision)return cached;
    const authEpoch=state.authEpoch,campaignId=state.selectedCampaignId,serial=state.creatureLoadSerial;
    const detail=await state.repository.getCreatureAuxMigrationRequest(request.request_id);
    if(authEpoch!==state.authEpoch||serial!==state.creatureLoadSerial||campaignId!==state.selectedCampaignId)throw new Error('Die Kampagne wurde gewechselt. Bitte Anfrage neu öffnen.');
    if(!detail||detail.request_id!==request.request_id||detail.campaign_id!==campaignId||detail.world_id!==state.selectedCampaign?.world_id)throw new Error('Die Antragsdetails gehören nicht zur gewählten Kampagne.');
    state.creatureRequestDetails.set(request.request_id,detail);return detail;
  }
  async function prepareCreatureFromMigration(state,request){
    if(request.status!=='pending'||!canManageCreatureWorld(state))return;
    let detail;try{detail=await getCreatureMigrationDetail(state,request)}catch(error){text(state.message,friendlyError(error));return}
    if(detail.status!=='pending'){text(state.message,'Die Anfrage wurde inzwischen entschieden. Bitte neu laden.');return}
    const snapshot=plainObject(detail.source_snapshot)?detail.source_snapshot:{};
    const npcData=creatureToBuilderNpc({name:snapshot.name||request.source_name||'Wesen',species:snapshot.npcType||snapshot.species||'Wesen',stats:structuredClone(snapshot)},structuredClone(snapshot));
    npcData.id=global.crypto?.randomUUID?.()||`world-creature-draft-${Date.now()}`;npcData.npcSheetVersion=NPC_SHEET_VERSION;npcData.type='npc';
    state.creatureImportDraft={
      name:String(snapshot.name||request.source_name||'').slice(0,120),
      species:String(snapshot.npcType||snapshot.species||'Wesen').slice(0,120),
      role_tags:snapshot.npcType?[String(snapshot.npcType).slice(0,60)]:[],
      public_summary:'',
      gm_notes:[snapshot.description,snapshot.notes].filter(value=>typeof value==='string'&&value.trim()).join('\n\n').slice(0,100000),
      stats:npcData,npc_data:npcData,sourceRequestId:request.request_id
    };
    state.selectedCreatureId=null;renderCreatureForm(state);
    text(state.message,`Die vom Spieler freigegebene Vorlage „${request.source_name}“ ist im Wesenformular vorbereitet. Bitte Wesenart, Werte und geheime Angaben prüfen und erst dann speichern. Der Antrag bleibt bis zur gesonderten Verknüpfung offen.`);
    state.creatureUi?.creatureForm?.scrollIntoView?.({block:'nearest'});
  }
  function renderCreatureCompanions(state){
    const ui=ensureCreatureWorkspace(state);if(!ui)return;
    clear(ui.migrationList);clear(ui.companionList);
    const requests=state.creatureMigrationRequests.filter(row=>row.campaign_id===state.selectedCampaignId);
    if(!requests.length)ui.migrationList.append(item('Noch keine freiwillige Übernahmeanfrage.'));
    for(const request of requests){
      const character=state.selectedData?.characters?.find(row=>row.id===request.character_id);
      const ownerName=character?.public_data?.name||'Figur',type=({npc:'NPC',familiar:'Vertrauter',mount:'Reittier'})[request.source_aux_type]||request.source_aux_type;
      const row=item(`${request.source_name} · ${type} · ${ownerName} · ${({pending:'wartet auf Prüfung',linked:'verknüpft',rejected:'abgelehnt',cancelled:'vom Spieler zurückgezogen'})[request.status]||request.status}`);
      const details=document.createElement('details'),summary=document.createElement('summary');summary.textContent='Freigegebene Vorlage ansehen';details.append(summary);
      details.addEventListener('toggle',async()=>{
        if(!details.open||details.dataset.loaded==='true')return;
        const status=note('Freigegebene Vorlage wird geladen …');details.append(status);
        try{const detail=await getCreatureMigrationDetail(state,request),snapshot=plainObject(detail.source_snapshot)?detail.source_snapshot:{};
          if(!details.isConnected)return;status.remove();
          for(const [label,value] of [['Beschreibung',snapshot.description],['Notizen',snapshot.notes],['Typ',snapshot.npcType],['Ort',snapshot.location]])if(typeof value==='string'&&value.trim())details.append(note(`${label}: ${value.slice(0,4000)}`));
          const counts=[['Ausrüstung',snapshot.equipment],['Waffen',snapshot.weapons],['Rüstung',snapshot.armor],['Eigenschaften',snapshot.advantages],['Nachteile',snapshot.disadvantages]].filter(([,value])=>Array.isArray(value)).map(([label,value])=>`${label}: ${value.length}`);
          if(counts.length)details.append(note(counts.join(' · ')));
          details.dataset.loaded='true';
        }catch(error){if(details.isConnected)text(status,`Vorlage konnte nicht geladen werden: ${friendlyError(error)}`)}
      });
      row.append(details);
      if(request.status==='pending'){
        row.append(button('Als neues Wesen vorbereiten',()=>prepareCreatureFromMigration(state,request)));
        const choice=select('gmMigrationCreature',[['','Vorhandenes Wesen auswählen']]);
        for(const creature of state.creatures.filter(activeRow)){const option=document.createElement('option');option.value=creatureId(creature);option.textContent=creature.name;choice.append(option)}
        row.append(labelControl('Mit Weltwesen verknüpfen',choice),button('Verknüpfung bestätigen',()=>reviewCreatureMigration(state,request,'link',choice.value)),button('Antrag ablehnen',()=>reviewCreatureMigration(state,request,'reject',null)));
      }
      ui.migrationList.append(row);
    }
    const links=state.creatureCompanionLinks.filter(row=>row.campaign_id===state.selectedCampaignId);
    if(!links.length)ui.companionList.append(item('Noch keine Wesen mit Figuren verknüpft.'));
    for(const link of links){
      const creature=state.creatures.find(row=>creatureId(row)===link.creature_id),character=state.selectedData?.characters?.find(row=>row.id===link.character_id);
      const label=`${creature?.name||'Wesen'} · ${character?.public_data?.name||'Figur'} · ${({companion:'Begleiter',familiar:'Vertrauter',mount:'Reittier'})[link.link_kind]||link.link_kind}${activeRow(link)?'':' · archiviert'}`;
      ui.companionList.append(item(label,...(activeRow(link)?[button('Verknüpfung archivieren',()=>archiveCreatureCompanion(state,link))]:[])));
    }
    const form=ui.companionForm,characterChoice=field(form,'[data-gm-creature-companion-character]'),creatureChoice=field(form,'[data-gm-creature-companion-creature]');
    clear(characterChoice);clear(creatureChoice);
    const noCharacter=document.createElement('option');noCharacter.value='';noCharacter.textContent='Figur auswählen';characterChoice.append(noCharacter);
    const noCreature=document.createElement('option');noCreature.value='';noCreature.textContent='Wesen auswählen';creatureChoice.append(noCreature);
    for(const character of state.selectedData?.characters||[])if(['approved_locked','change_pending'].includes(character.status)){
      const option=document.createElement('option');option.value=character.id;option.textContent=character.public_data?.name||character.id;characterChoice.append(option);
    }
    for(const creature of state.creatures.filter(activeRow)){
      const option=document.createElement('option');option.value=creatureId(creature);option.textContent=creature.name;creatureChoice.append(option);
    }
  }
  async function reviewCreatureMigration(state,request,decision,selectedCreatureId){
    if(!canManageCreatureWorld(state)||typeof state.repository.reviewCreatureAuxMigration!=='function'||request.status!=='pending')return;
    if(decision==='link'&&!selectedCreatureId){text(state.message,'Bitte zuerst ein vorhandenes aktives Weltwesen auswählen.');return}
    if(decision==='reject'&&(typeof global.confirm!=='function'||!global.confirm(`Übernahmeanfrage „${request.source_name}“ ablehnen? Die lokale Vorlage des Spielers bleibt erhalten.`)))return;
    try{await runBusy(state,async()=>{
      await state.repository.reviewCreatureAuxMigration(request.request_id,Number(request.revision),decision,{creatureId:selectedCreatureId||null});
      await loadCreatureWorkspace(state,{force:true});text(state.message,decision==='link'?'Anfrage bestätigt und Wesen mit der Figur verknüpft.':'Anfrage abgelehnt; der lokale Reiter des Spielers bleibt unverändert.');
    })}catch{}
  }
  async function saveManualCreatureCompanion(state){
    if(!canManageCreatureWorld(state)||typeof state.repository.saveCreatureCompanionLink!=='function')return;
    const form=state.creatureUi?.companionForm,characterId=field(form,'[data-gm-creature-companion-character]')?.value,selectedCreatureId=field(form,'[data-gm-creature-companion-creature]')?.value;
    if(!characterId||!selectedCreatureId){text(state.message,'Bitte Figur und Weltwesen für die Verknüpfung wählen.');return}
    const kind=field(form,'[data-gm-creature-companion-kind]').value;
    try{await runBusy(state,async()=>{
      await state.repository.saveCreatureCompanionLink(state.selectedCampaignId,characterId,selectedCreatureId,{linkKind:kind});
      await loadCreatureWorkspace(state,{force:true});text(state.message,'Weltwesen als Begleiter dieser Figur verknüpft. Die Spieleransicht richtet sich weiterhin nach der Kampagnenfreigabe.');
    })}catch{}
  }
  async function archiveCreatureCompanion(state,link){
    if(!canManageCreatureWorld(state)||typeof state.repository.saveCreatureCompanionLink!=='function'||!activeRow(link))return;
    if(typeof global.confirm!=='function'||!global.confirm('Diese Begleiterverknüpfung archivieren? Das Weltwesen und die Figur bleiben bestehen.'))return;
    try{await runBusy(state,async()=>{
      await state.repository.saveCreatureCompanionLink(state.selectedCampaignId,link.character_id,link.creature_id,{expectedRevision:Number(link.revision),linkKind:link.link_kind,archived:true});
      await loadCreatureWorkspace(state,{force:true});text(state.message,'Begleiterverknüpfung archiviert.');
    })}catch{}
  }
  function renderCreatureDisclosure(state){
    const ui=ensureCreatureWorkspace(state);if(!ui)return;
    const creature=state.creatures.find(row=>activeRow(row)&&creatureId(row)===state.selectedDisclosureCreatureId),form=ui.disclosureForm;
    show(form,!!creature);show(ui.disclosureHint,!creature);if(!creature)return;
    const disclosure=state.creatureDisclosures.find(row=>row.creature_id===creatureId(creature));
    text(ui.disclosureHeading,`${creature.name} · ${state.selectedCampaign?.name||'Kampagne'}`);
    text(ui.disclosureState,disclosure&&!activeRow(disclosure)?'Diese Freigabe ist archiviert. Speichern veröffentlicht sie mit derselben Kennung und neuer Revision ausdrücklich erneut.':disclosure?'Bestehende Freigabe für diese Kampagne.':'Noch keine Freigabe für diese Kampagne.');
    text(ui.disclosureSave,disclosure&&!activeRow(disclosure)?'Freigabe erneut veröffentlichen':'Kampagnenfreigabe speichern');
    field(form,'[data-gm-creature-visibility]').value=disclosure?.visibility||'secret';
    field(form,'[data-gm-creature-player-name]').value=disclosure?.player_name||'';
    field(form,'[data-gm-creature-player-summary]').value=disclosure?.player_summary||'';
  }
  function beginCreatureFromArchetype(state,selectedArchetypeId){
    state.selectedCreatureId=null;state.creatureImportDraft=null;renderCreatureForm(state);const form=state.creatureUi?.creatureForm,choice=field(form,'[data-gm-creature-archetype]');if(!form||!choice)return;
    choice.value=selectedArchetypeId;form.__archetypeApply=null;state.creatureUi.refreshCreatureTemplateAction();form.scrollIntoView?.({block:'nearest'});stageArchetypeValuesForCreature(state);
  }
  function renderPreparedArchetypeList(state){
    const ui=ensureCreatureWorkspace(state);if(!ui)return;
    ui.preparedSection.open=!state.archetypes.some(activeRow);
    clear(ui.preparedArchetypeList);
    const groupNames=new Map(archetypeGroups);
    for(const preset of preparedArchetypes){
      const existing=matchingPreparedArchetype(state,preset),core=preparedArchetypeTemplate(preset),upgradeable=existing?.template_data?.preparedArchetype?.key===preset.key&&Number(existing.template_data.preparedArchetype.version||0)<3;
      const action=button(upgradeable?'Vollständigen NPC-Build ergänzen':existing?'Vorhanden':'In diese Welt übernehmen',()=>importPreparedArchetype(state,preset));
      if(existing&&!upgradeable){action.disabled=true;action.dataset.gmPermanentDisabled='true';action.title=`Als „${existing.name}“ in dieser Welt vorhanden.`}
      const create=existing&&!upgradeable?button('NPC daraus erstellen',()=>beginCreatureFromArchetype(state,archetypeId(existing))):null;
      const loadout=catalogLoadoutSummary(core),carry=core.inventoryProfile.canCarryItems?'trägt Items':'ohne tragbares Inventar';
      const row=item(`${preset.name} · ${groupNames.get(preset.groupName)||preset.groupName} · vollständiges NPC-Fenster · ${templateValueSummary(core)} · ${carry} · ${loadout} — ${preset.description}`,action,...(create?[create]:[]));
      row.dataset.gmPreparedArchetype=preset.key;ui.preparedArchetypeList.append(row);
    }
  }
  function renderArchetypeList(state){
    const ui=ensureCreatureWorkspace(state);if(!ui)return;
    renderPreparedArchetypeList(state);
    clear(ui.archetypeList);
    const rows=state.archetypes.filter(activeRow);
    if(!rows.length)ui.archetypeList.append(item('Noch kein eigener Archetyp angelegt.'));
    const groupNames=new Map(archetypeGroups);
    for(const row of rows){
      ui.archetypeList.append(item(`${row.name} · ${groupNames.get(row.group_name)||row.group_name||'Andere'}`,
        button('Bearbeiten',()=>{state.selectedArchetypeId=archetypeId(row);renderArchetypeForm(state)}),
        button('Kopie anlegen',()=>copyArchetype(state,row))));
    }
    const archived=state.archetypes.filter(row=>!activeRow(row));
    if(archived.length)ui.archetypeList.append(item('Archivierte Archetypen:'));
    for(const row of archived)ui.archetypeList.append(item(`${row.name} · ${groupNames.get(row.group_name)||row.group_name||'Andere'} · archiviert`,button('Wiederherstellen',()=>restoreArchetype(state,row))));
    renderArchetypeForm(state);
  }
  function renderArchetypeForm(state){
    const ui=ensureCreatureWorkspace(state);if(!ui)return;
    const form=ui.archetypeForm,row=state.archetypes.find(entry=>activeRow(entry)&&archetypeId(entry)===state.selectedArchetypeId);
    form.__templateDraft=null;
    text(ui.archetypeFormHeading,row?`${row.name} bearbeiten`:'Neuen Archetyp anlegen');
    field(form,'[data-gm-archetype-name]').value=row?.name||'';
    field(form,'[data-gm-archetype-group]').value=row?.group_name||'other';
    field(form,'[data-gm-archetype-description]').value=row?.description||'';
    const templateData=plainObject(row?.template_data)?row.template_data:{},canCarry=field(form,'[data-gm-archetype-can-carry-items]');canCarry.checked=typeof templateData.inventoryProfile?.canCarryItems==='boolean'?templateData.inventoryProfile.canCarryItems:true;
    try{form.__catalogLoadoutDraft=templateItemReferences(templateData)}catch(error){form.__catalogLoadoutDraft=[];text(state.message,error.message)}renderArchetypeCatalogLoadout(form);
    const source=field(form,'[data-gm-archetype-source-creature]');clear(source);
    const empty=document.createElement('option');empty.value='';empty.textContent='Wesen auswählen';source.append(empty);
    for(const creature of state.creatures.filter(activeRow)){const option=document.createElement('option');option.value=creatureId(creature);option.textContent=creature.name;source.append(option)}
    let summary='Noch keine übertragbare Ausbaustufe in dieser Vorlage.';
    try{const core=portableCreatureValues(templateData),items=templateItemReferences(templateData),builds=embeddedBuildsForArchetype(row);if(templateValueCount(core)||items.length||builds.length)summary=`Gespeicherte Vorlage: ${templateValueSummary(core)}, ${items.length} verknüpfte Standarditems und ${builds.length} vollständige Ausbaustufe(n). Änderungen daran wirken nicht rückwirkend auf Wesen.`}catch{summary='Die gespeicherten Vorlagenwerte können hier nicht sicher gelesen werden.'}
    text(ui.archetypeTemplateHint,summary);
    ui.archetypeArchive.hidden=!row;
  }
  function stageArchetypeValuesFromCreature(state){
    if(!canManageCreatureWorld(state))return;
    const ui=state.creatureUi,form=ui?.archetypeForm,sourceId=field(form,'[data-gm-archetype-source-creature]')?.value;
    const source=state.creatures.find(row=>activeRow(row)&&creatureId(row)===sourceId);
    if(!source){text(state.message,'Bitte wähle zuerst ein Wesen dieser Welt.');return}
    const row=state.archetypes.find(entry=>activeRow(entry)&&archetypeId(entry)===state.selectedArchetypeId);
    let core,npcSheet;try{
      const stats=creatureStats(source);
      if(plainObject(stats.skills)&&Object.keys(stats.skills).length&&!builderSkillCatalog().length)throw new Error('Der Fähigkeitskatalog ist noch nicht geladen. Bitte öffne die App erneut.');
      core=portableCreatureValues(stats);npcSheet=sanitizeNpcBuildSheet(creatureToBuilderNpc(source));
    }catch(error){text(state.message,error.message);return}
    if(!templateValueCount(core)&&!(npcSheet.equipment?.length||npcSheet.activeEffectsV177?.length||npcSheet.layout?.length)){text(state.message,'Dieses Wesen enthält noch keinen verwendbaren NPC-Datensatz.');return}
    if(row&&typeof global.confirm==='function'&&!global.confirm(`Die bisherige Standard-Ausbaustufe von „${row.name}“ durch den vollständigen NPC-Datensatz von „${source.name}“ ersetzen? Bestehende Wesen ändern sich dadurch nicht.`))return;
    const data=structuredClone(plainObject(row?.template_data)?row.template_data:{});
    for(const key of ['attributes','counters','skills']){
      if(Object.keys(core[key]).length)data[key]=structuredClone(core[key]);else delete data[key];
    }
    const profile={name:source.name,species:source.species||npcSheet.npcType||'Wesen',roleTags:roleTags(source.role_tags),publicSummary:source.public_summary||'',gmNotes:source.gm_notes||''};
    data.npcBuilds=[{id:'standard',label:'Standard',isDefault:true,profile,npcSheet}];
    form.__templateDraft={targetId:archetypeId(row),worldId:state.selectedCampaign.world_id,data,sourceName:source.name};
    text(ui.archetypeTemplateHint,`Vollständige Standard-Ausbaustufe aus „${source.name}“ vorbereitet: ${templateValueSummary(core)}, ${npcSheet.equipment?.length||0} Ausrüstungspositionen, ${npcSheet.activeEffectsV177?.length||0} Effekte und ${npcSheet.layout?.length||0} NPC-Karten. Erst „Archetyp speichern“ schreibt die Vorlage.`);
    text(state.message,`Vollständigen NPC-Datensatz aus „${source.name}“ vorbereitet. Andere Wesen bleiben unverändert.`);
  }
  function stageArchetypeValuesForCreature(state){
    if(!canManageCreatureWorld(state))return;
    const ui=state.creatureUi,form=ui?.creatureForm,selectedId=field(form,'[data-gm-creature-archetype]')?.value;
    const archetype=state.archetypes.find(row=>activeRow(row)&&archetypeId(row)===selectedId);
    if(!archetype){text(state.message,'Bitte wähle zuerst einen aktiven Archetyp.');return}
    const build=form.__npcBuildChoices?.get(field(form,'[data-gm-creature-build]')?.value);if(!build){text(state.message,'Bitte wähle eine verfügbare Ausbaustufe.');return}
    const creature=state.creatures.find(row=>activeRow(row)&&creatureId(row)===state.selectedCreatureId),sections=[...form.querySelectorAll('[data-gm-creature-template-section]:checked')].map(control=>control.value),mode=field(form,'[data-gm-creature-template-mode]')?.value==='fill-empty'?'fill-empty':'replace-selected';
    if(!sections.length){text(state.message,'Wähle mindestens einen Bereich für die Übernahme aus.');return}
    if(creature&&typeof global.confirm==='function'&&!global.confirm(`Ausbaustufe „${build.label}“ auf „${creature.name}“ anwenden? ${mode==='fill-empty'?'Nur leere Bereiche werden ergänzt.':'Die ausgewählten Bereiche werden durch unabhängige Kopien ersetzt.'}`))return;
    let prepared;try{prepared=instantiateArchetypeBuild(state,archetype,build)}catch(error){text(state.message,`Die Ausbaustufe konnte nicht vorbereitet werden: ${error.message}`);return}
    if(creature)applyNpcBuildSections(form.__npcOwner,prepared.owner,sections,mode);else form.__npcOwner=prepared.owner;
    if(sections.includes('profile')){
      const onlyEmpty=creature&&mode==='fill-empty',assign=(selector,value)=>{const control=field(form,selector);if(control&&(!onlyEmpty||!control.value.trim()))control.value=value||''};
      assign('[data-gm-creature-name]',prepared.profile.name||form.__npcOwner.name);assign('[data-gm-creature-species]',prepared.profile.species||form.__npcOwner.npcType);assign('[data-gm-creature-roles]',prepared.profile.roleTags.join(', '));assign('[data-gm-creature-summary]',prepared.profile.publicSummary);assign('[data-gm-creature-notes]',prepared.profile.gmNotes);
      form.__npcOwner.name=field(form,'[data-gm-creature-name]').value||form.__npcOwner.name;form.__npcOwner.npcType=field(form,'[data-gm-creature-species]').value||form.__npcOwner.npcType;
    }
    form.__archetypeApply={archetypeId:selectedId,buildValue:build.value,creatureId:creatureId(creature),worldId:state.selectedCampaign.world_id};markCreatureNpcDirty(state);renderCreatureNpcWindow(state);
    text(ui.creatureTemplateHint,`„${archetype.name} · ${build.label}“ ist als unabhängiger NPC-Entwurf geöffnet. Gegenstände, Effekte, Karten und der NPC selbst besitzen neue Kennungen. Noch nicht gespeichert.`);
    text(state.message,`NPC aus „${archetype.name} · ${build.label}“ vorbereitet. Du kannst jetzt jeden Wert verändern oder den Entwurf verwerfen.`);
  }
  function canManageCreatureWorld(state){return !!state.selectedCampaign?.world_id&&state.worlds.some(world=>world.world_id===state.selectedCampaign.world_id)}
  async function loadCreatureWorkspace(state,{force=false}={}){
    let ui=ensureCreatureWorkspace(state);const worldId=state.selectedCampaign?.world_id,campaignId=state.selectedCampaignId;
    if(!ui||!worldId||!campaignId)return;
    const canManage=canManageCreatureWorld(state);
    for(const section of ui.editorSections)show(section,canManage);
    if(!canManage){
      resetCreatureWorkspace(state);ui=ensureCreatureWorkspace(state);
      for(const section of ui.editorSections)show(section,false);
      text(ui.status,'Für diese Welt hat dein Konto kein Weltverwaltungsrecht. Nur die Weltleitung kann Wesen, Archetypen und Kampagnenfreigaben bearbeiten.');
      show(ui.retry,false);return;
    }
    if(['listWorldCreatures','saveWorldCreature','listWorldArchetypes','saveWorldArchetype','listCampaignCreatureDisclosures','saveCampaignCreatureDisclosure'].some(name=>typeof state.repository[name]!=='function')){
      resetCreatureWorkspace(state);ui=ensureCreatureWorkspace(state);
      text(ui.status,'Die Wesenverwaltung ist in dieser App-Fassung noch nicht verbunden. Andere Bereiche der Spielleitung bleiben nutzbar.');
      show(ui.retry,false);for(const section of ui.editorSections)show(section,false);return;
    }
    if(!force&&state.creatureLoaded&&state.creatureWorldId===worldId&&state.creatureCampaignId===campaignId)return;
    if(!force&&state.creatureLoading&&state.creatureWorldId===worldId&&state.creatureCampaignId===campaignId)return;
    const serial=++state.creatureLoadSerial,authEpoch=state.authEpoch;
    state.secretLootEffectLoadSerial++;
    state.creatureWorldId=worldId;state.creatureCampaignId=campaignId;state.creatureLoading=true;state.creatureLoaded=false;
    state.creatures=[];state.archetypes=[];state.npcCatalog=[];state.creatureDisclosures=[];state.worldPlaces=[];state.worldFactions=[];state.creatureFactionLinks=[];state.creatureLoot=[];state.creatureMigrationRequests=[];state.creatureCompanionLinks=[];state.creatureRequestDetails=new Map();
    renderPreparedArchetypeList(state);
    clear(ui.secretLootEffectList);show(ui.secretLootEffectList,false);text(ui.secretLootEffectStatus,'Geheime Wirkungen werden geladen …');show(ui.secretLootEffectRefresh,false);
    text(ui.status,'Wesen, Archetypen und Weltreferenzen werden geladen …');show(ui.retry,false);
    try{
      const [core,optional]=await Promise.all([
        Promise.all([state.repository.listWorldCreatures(worldId),state.repository.listWorldArchetypes(worldId),state.repository.listCampaignCreatureDisclosures(campaignId)]),
        Promise.allSettled([
          Promise.resolve().then(()=>state.repository.listWorldPlaces(worldId)),Promise.resolve().then(()=>state.repository.listWorldFactions(worldId)),
          Promise.resolve().then(()=>state.repository.listCreatureFactionLinks(worldId)),Promise.resolve().then(()=>state.repository.listCampaignCreatureLoot(campaignId)),
          Promise.resolve().then(()=>state.repository.listCampaignCreatureAuxMigrations(campaignId)),Promise.resolve().then(()=>state.repository.listCampaignCompanionLinks(campaignId)),
          typeof state.repository.listNpcCatalog==='function'?Promise.resolve().then(()=>state.repository.listNpcCatalog(worldId)):Promise.resolve([])
        ])
      ]);
      if(serial!==state.creatureLoadSerial||authEpoch!==state.authEpoch||state.selectedCampaignId!==campaignId||state.selectedCampaign?.world_id!==worldId)return;
      const [creatures,archetypes,disclosures]=core,[places,factions,factionLinks,loot,migrations,companions,npcCatalog]=optional.map(result=>result.status==='fulfilled'?result.value:[]);
      const registryAvailable=optional.slice(0,3).every(result=>result.status==='fulfilled')&&['saveWorldPlace','saveWorldFaction','saveCreatureFactionLink','setCreaturePlace'].every(name=>typeof state.repository[name]==='function');
      const lootAvailable=optional[3].status==='fulfilled'&&['transferCreatureLoot','reverseCreatureLoot'].every(name=>typeof state.repository[name]==='function');
      const companionAvailable=optional.slice(4,6).every(result=>result.status==='fulfilled')&&['getCreatureAuxMigrationRequest','reviewCreatureAuxMigration','saveCreatureCompanionLink'].every(name=>typeof state.repository[name]==='function');
      show(ui.referenceSection,registryAvailable);show(ui.registrySection,registryAvailable);show(ui.lootSection,lootAvailable);show(ui.companionSection,companionAvailable);
      state.creatures=Array.isArray(creatures)?creatures:[];
      state.archetypes=Array.isArray(archetypes)?archetypes:[];
      state.npcCatalog=Array.isArray(npcCatalog)?npcCatalog:[];
      state.creatureDisclosures=Array.isArray(disclosures)?disclosures:[];
      state.worldPlaces=Array.isArray(places)?places:[];
      state.worldFactions=Array.isArray(factions)?factions:[];
      state.creatureFactionLinks=Array.isArray(factionLinks)?factionLinks:[];
      state.creatureLoot=Array.isArray(loot)?loot:[];
      state.creatureMigrationRequests=Array.isArray(migrations)?migrations:[];
      state.creatureCompanionLinks=Array.isArray(companions)?companions:[];
      state.creatureLoaded=true;
      renderArchetypeList(state);renderReferenceRegistries(state);renderCreatureList(state);renderCreatureLootReceipts(state);renderCreatureCompanions(state);
      if(lootAvailable)loadSecretLootEffects(state);
      const unavailable=[!registryAvailable?'Orte/Fraktionen':null,!lootAvailable?'Beute':null,!companionAvailable?'Begleiter/Übernahme':null].filter(Boolean);
      text(ui.status,`${state.creatures.filter(activeRow).length} Wesen · ${state.archetypes.filter(activeRow).length} Archetypen · ${state.npcCatalog.length} Katalog-Ausbaustufen · ${state.worldPlaces.filter(activeRow).length} Orte · ${state.worldFactions.filter(activeRow).length} Fraktionen.${unavailable.length?` Teilbereiche derzeit nicht verfügbar: ${unavailable.join(', ')}.`:''}`);
      show(ui.retry,unavailable.length>0);
      if(state.busy)setBusy(state,true);
    }catch(error){
      if(serial!==state.creatureLoadSerial||authEpoch!==state.authEpoch)return;
      state.creatures=[];state.archetypes=[];state.npcCatalog=[];state.creatureDisclosures=[];state.worldPlaces=[];state.worldFactions=[];state.creatureFactionLinks=[];state.creatureLoot=[];state.creatureMigrationRequests=[];state.creatureCompanionLinks=[];state.creatureRequestDetails=new Map();
      state.selectedCreatureId=null;state.selectedArchetypeId=null;state.selectedDisclosureCreatureId=null;
      clear(ui.creatureList);clear(ui.archetypeList);clear(ui.placeList);clear(ui.factionList);clear(ui.lootList);clear(ui.secretLootEffectList);show(ui.secretLootEffectList,false);clear(ui.migrationList);clear(ui.companionList);renderPreparedArchetypeList(state);renderCreatureForm(state);renderArchetypeForm(state);renderCreatureDisclosure(state);
      text(ui.status,`Wesen konnten nicht geladen werden: ${friendlyError(error)}`);show(ui.retry,true);
    }finally{if(serial===state.creatureLoadSerial)state.creatureLoading=false}
  }
  async function saveCreature(state){
    if(!canManageCreatureWorld(state)||typeof state.repository.saveWorldCreature!=='function')return;
    const form=state.creatureUi?.creatureForm,row=state.creatures.find(entry=>activeRow(entry)&&creatureId(entry)===state.selectedCreatureId);if(!form)return;
    const tags=roleTags(field(form,'[data-gm-creature-roles]').value);
    if(tags.length>32||tags.some(tag=>tag.length>60)||new Set(tags.map(tag=>tag.toLocaleLowerCase('de-DE'))).size!==tags.length){text(state.message,'Bitte höchstens 32 unterschiedliche Rollen/Tags mit je höchstens 60 Zeichen eingeben.');return}
    const staged=form.__archetypeApply||null;
    if(staged&&(staged.archetypeId!==field(form,'[data-gm-creature-archetype]').value||staged.buildValue!==field(form,'[data-gm-creature-build]').value||staged.creatureId!==creatureId(row)||staged.worldId!==state.selectedCampaign.world_id)){
      text(state.message,'Die gewählte Vorlage oder das Wesen wurde geändert. Bitte Vorlagenwerte erneut ausdrücklich übernehmen oder das Formular neu öffnen.');return;
    }
    const owner=form.__npcOwner;if(!owner){text(state.message,'Das NPC-Dokument dieses Wesens ist nicht geladen.');return}
    owner.name=field(form,'[data-gm-creature-name]').value.trim();owner.npcType=field(form,'[data-gm-creature-species]').value.trim();
    let npcData;try{npcData=serializeNpcSheet(owner)}catch(error){text(state.message,`Das NPC-Dokument konnte nicht vorbereitet werden: ${error.message}`);return}
    const changes={creatureId:creatureId(row),expectedRevision:row?Number(row.revision):null,
      name:owner.name,species:owner.npcType,
      archetypeId:field(form,'[data-gm-creature-archetype]').value||null,roleTags:tags,
      publicSummary:field(form,'[data-gm-creature-summary]').value.trim(),stats:npcData,npcData,
      gmNotes:field(form,'[data-gm-creature-notes]').value.trim(),archived:false};
    try{await runBusy(state,async()=>{const receipt=await state.repository.saveWorldCreature(state.selectedCampaign.world_id,changes);state.selectedCreatureId=creatureId(receipt)||creatureId(row);state.creatureImportDraft=null;form.__npcDirty=false;await loadCreatureWorkspace(state,{force:true});text(state.message,`Wesen „${changes.name}“ mit vollständigem NPC-Dokument gespeichert. Kampagnenfreigaben und geheime Weltdaten bleiben getrennt.`)})}catch{}
  }
  async function archiveCreature(state){
    if(!canManageCreatureWorld(state)||typeof state.repository.saveWorldCreature!=='function')return;
    const row=state.creatures.find(entry=>activeRow(entry)&&creatureId(entry)===state.selectedCreatureId);if(!row||typeof global.confirm!=='function'||!global.confirm(`Wesen „${row.name}“ archivieren? Es wird nicht gelöscht.`))return;
    const changes={creatureId:creatureId(row),expectedRevision:Number(row.revision),name:row.name,species:row.species,
      archetypeId:row.archetype_id||null,roleTags:roleTags(row.role_tags),publicSummary:row.public_summary||'',stats:creatureStats(row),npcData:creatureStats(row),gmNotes:row.gm_notes||'',archived:true};
    try{await runBusy(state,async()=>{await state.repository.saveWorldCreature(state.selectedCampaign.world_id,changes);state.selectedCreatureId=null;state.selectedDisclosureCreatureId=null;await loadCreatureWorkspace(state,{force:true});text(state.message,`Wesen „${row.name}“ archiviert.`)})}catch{}
  }
  async function restoreCreature(state,row){
    if(!canManageCreatureWorld(state)||typeof state.repository.saveWorldCreature!=='function'||activeRow(row))return;
    if(row.current_place_id&&!state.worldPlaces.some(place=>activeRow(place)&&placeId(place)===row.current_place_id)){
      text(state.message,'Vor der Wiederherstellung muss der inzwischen archivierte Aufenthaltsort gelöst werden.');return;
    }
    if(typeof global.confirm!=='function'||!global.confirm(`Wesen „${row.name}“ wiederherstellen? Frühere Spielerfreigaben bleiben archiviert, bis du sie ausdrücklich erneut veröffentlichst.`))return;
    const worldId=state.selectedCampaign.world_id,changes={creatureId:creatureId(row),expectedRevision:Number(row.revision),name:row.name,species:row.species,
      archetypeId:row.archetype_id||null,roleTags:roleTags(row.role_tags),publicSummary:row.public_summary||'',stats:creatureStats(row),npcData:creatureStats(row),gmNotes:row.gm_notes||'',archived:false};
    try{await runBusy(state,async()=>{await state.repository.saveWorldCreature(worldId,changes);await loadCreatureWorkspace(state,{force:true});text(state.message,`Wesen „${row.name}“ wiederhergestellt. Kampagnenfreigaben bleiben verborgen.`)})}catch{}
  }
  async function clearArchivedCreaturePlace(state,row){
    if(!canManageCreatureWorld(state)||typeof state.repository.setCreaturePlace!=='function'||activeRow(row)||!row.current_place_id)return;
    if(typeof global.confirm!=='function'||!global.confirm(`Archivierten Ort von „${row.name}“ lösen? Das Wesen bleibt archiviert und kann danach wiederhergestellt werden.`))return;
    const worldId=state.selectedCampaign.world_id;
    try{await runBusy(state,async()=>{await state.repository.setCreaturePlace(worldId,creatureId(row),Number(row.revision),null);await loadCreatureWorkspace(state,{force:true});text(state.message,`Archivierter Ort von „${row.name}“ gelöst. Das Wesen bleibt noch archiviert.`)})}catch{}
  }
  async function saveArchetype(state){
    if(!canManageCreatureWorld(state)||typeof state.repository.saveWorldArchetype!=='function')return;
    const form=state.creatureUi?.archetypeForm,row=state.archetypes.find(entry=>activeRow(entry)&&archetypeId(entry)===state.selectedArchetypeId);if(!form)return;
    const staged=form.__templateDraft||null;
    if(staged&&(staged.targetId!==archetypeId(row)||staged.worldId!==state.selectedCampaign.world_id)){text(state.message,'Die Welt oder Vorlage wurde gewechselt. Bitte die Werte erneut aus einem Wesen vorbereiten.');return}
    const canCarry=field(form,'[data-gm-archetype-can-carry-items]').checked,references=Array.isArray(form.__catalogLoadoutDraft)?form.__catalogLoadoutDraft:[];
    if(!canCarry&&references.length){text(state.message,'Eine Vorlage ohne tragbares Inventar kann keine Standarditems enthalten. Entferne die Verknüpfungen oder aktiviere die Inventarfähigkeit.');return}
    const templateData=structuredClone(staged?.data||row?.template_data||{});templateData.inventoryProfile={...(plainObject(templateData.inventoryProfile)?templateData.inventoryProfile:{}),canCarryItems:canCarry};
    if(references.length)templateData.catalogLoadout={version:1,items:structuredClone(references)};else delete templateData.catalogLoadout;
    const changes={archetypeId:archetypeId(row),expectedRevision:row?Number(row.revision):null,
      name:field(form,'[data-gm-archetype-name]').value.trim(),groupName:field(form,'[data-gm-archetype-group]').value,
      description:field(form,'[data-gm-archetype-description]').value.trim(),templateData,archived:false};
    try{await runBusy(state,async()=>{const receipt=await state.repository.saveWorldArchetype(state.selectedCampaign.world_id,changes);state.selectedArchetypeId=archetypeId(receipt)||archetypeId(row);await loadCreatureWorkspace(state,{force:true});text(state.message,`Archetyp „${changes.name}“ gespeichert. Bereits angelegte Wesen wurden nicht verändert.`)})}catch{}
  }
  async function importPreparedArchetype(state,preset){
    if(!canManageCreatureWorld(state)||typeof state.repository.saveWorldArchetype!=='function')return;
    const existing=matchingPreparedArchetype(state,preset),prepared=preparedArchetypeTemplate(preset),upgradeable=existing?.template_data?.preparedArchetype?.key===preset.key&&Number(existing.template_data.preparedArchetype.version||0)<3;
    if(existing&&!upgradeable){state.selectedArchetypeId=archetypeId(existing);renderArchetypeForm(state);text(state.message,`„${existing.name}“ ist in dieser Welt bereits als eigener Archetyp vorhanden.`);return}
    if(upgradeable){
      const templateData=structuredClone(existing.template_data||{});templateData.catalogLoadout=prepared.catalogLoadout;templateData.inventoryProfile=plainObject(templateData.inventoryProfile)?templateData.inventoryProfile:prepared.inventoryProfile;if(!Array.isArray(templateData.npcBuilds)||!templateData.npcBuilds.length)templateData.npcBuilds=prepared.npcBuilds;templateData.preparedArchetype=prepared.preparedArchetype;
      const changes={archetypeId:archetypeId(existing),expectedRevision:Number(existing.revision),name:existing.name,groupName:existing.group_name||preset.groupName,description:existing.description||preset.description,templateData,archived:false};
      try{await runBusy(state,async()=>{await state.repository.saveWorldArchetype(state.selectedCampaign.world_id,changes);state.selectedArchetypeId=archetypeId(existing);await loadCreatureWorkspace(state,{force:true});text(state.message,`Vollständige NPC-Ausbaustufe für „${existing.name}“ ergänzt. Eigene Werte und Beschreibungen blieben erhalten.`)})}catch{}return;
    }
    const templateData=prepared,core=portableCreatureValues(templateData);
    if(!templateValueCount(core)){text(state.message,'Die vorbereitete Vorlage enthält keine lesbaren Werte.');return}
    const changes={archetypeId:null,expectedRevision:null,name:preset.name,groupName:preset.groupName,description:preset.description,templateData,archived:false};
    try{await runBusy(state,async()=>{const receipt=await state.repository.saveWorldArchetype(state.selectedCampaign.world_id,changes);state.selectedArchetypeId=archetypeId(receipt);await loadCreatureWorkspace(state,{force:true});text(state.message,`Vorbereiteter Archetyp „${preset.name}“ übernommen. Du kannst ihn jetzt bearbeiten oder für ein Wesen verwenden.`)})}catch{}
  }
  async function copyArchetype(state,row){
    if(!canManageCreatureWorld(state)||typeof state.repository.saveWorldArchetype!=='function')return;
    const used=new Set(state.archetypes.filter(activeRow).map(entry=>String(entry.name).toLocaleLowerCase('de-DE')));
    const base=String(row.name||'Archetyp');let suffix=' (Kopie)',name=`${base.slice(0,120-suffix.length)}${suffix}`,number=2;
    while(used.has(name.toLocaleLowerCase('de-DE'))){suffix=` (Kopie ${number++})`;name=`${base.slice(0,120-suffix.length)}${suffix}`}
    const changes={archetypeId:null,expectedRevision:null,name,groupName:row.group_name||'other',description:row.description||'',templateData:row.template_data||{},archived:false};
    try{await runBusy(state,async()=>{const receipt=await state.repository.saveWorldArchetype(state.selectedCampaign.world_id,changes);state.selectedArchetypeId=archetypeId(receipt);await loadCreatureWorkspace(state,{force:true});text(state.message,`Archetyp „${changes.name}“ als eigene Vorlage angelegt.`)})}catch{}
  }
  async function archiveArchetype(state){
    if(!canManageCreatureWorld(state)||typeof state.repository.saveWorldArchetype!=='function')return;
    const row=state.archetypes.find(entry=>activeRow(entry)&&archetypeId(entry)===state.selectedArchetypeId);if(!row||typeof global.confirm!=='function'||!global.confirm(`Archetyp „${row.name}“ archivieren? Bereits angelegte Wesen bleiben erhalten.`))return;
    const changes={archetypeId:archetypeId(row),expectedRevision:Number(row.revision),name:row.name,groupName:row.group_name||'other',description:row.description||'',templateData:row.template_data||{},archived:true};
    try{await runBusy(state,async()=>{await state.repository.saveWorldArchetype(state.selectedCampaign.world_id,changes);state.selectedArchetypeId=null;await loadCreatureWorkspace(state,{force:true});text(state.message,`Archetyp „${row.name}“ archiviert.`)})}catch{}
  }
  async function restoreArchetype(state,row){
    if(!canManageCreatureWorld(state)||typeof state.repository.saveWorldArchetype!=='function'||activeRow(row))return;
    if(typeof global.confirm!=='function'||!global.confirm(`Archetyp „${row.name}“ wiederherstellen?`))return;
    const worldId=state.selectedCampaign.world_id,changes={archetypeId:archetypeId(row),expectedRevision:Number(row.revision),name:row.name,
      groupName:row.group_name||'other',description:row.description||'',templateData:row.template_data||{},archived:false};
    try{await runBusy(state,async()=>{await state.repository.saveWorldArchetype(worldId,changes);await loadCreatureWorkspace(state,{force:true});text(state.message,`Archetyp „${row.name}“ wiederhergestellt.`)})}catch{}
  }
  async function createWorldPlace(state){
    if(!canManageCreatureWorld(state)||typeof state.repository.saveWorldPlace!=='function')return;
    const form=state.creatureUi?.placeForm,name=field(form,'[data-gm-world-place-name]')?.value.trim();if(!name)return;
    const worldId=state.selectedCampaign.world_id;
    try{await runBusy(state,async()=>{await state.repository.saveWorldPlace(worldId,{name});form.reset();await loadCreatureWorkspace(state,{force:true});text(state.message,`Ort „${name}“ als Weltreferenz angelegt. Für Spieler bleibt er unsichtbar.`)})}catch{}
  }
  async function createWorldFaction(state){
    if(!canManageCreatureWorld(state)||typeof state.repository.saveWorldFaction!=='function')return;
    const form=state.creatureUi?.factionForm,name=field(form,'[data-gm-world-faction-name]')?.value.trim();if(!name)return;
    const worldId=state.selectedCampaign.world_id;
    try{await runBusy(state,async()=>{await state.repository.saveWorldFaction(worldId,{name});form.reset();await loadCreatureWorkspace(state,{force:true});text(state.message,`Fraktion „${name}“ als Weltreferenz angelegt. Für Spieler bleibt sie unsichtbar.`)})}catch{}
  }
  async function saveCreaturePlace(state){
    if(!canManageCreatureWorld(state)||typeof state.repository.setCreaturePlace!=='function')return;
    const creature=state.creatures.find(row=>activeRow(row)&&creatureId(row)===state.selectedCreatureId),control=field(state.creatureUi?.referenceEditor,'[data-gm-creature-place]');if(!creature||!control)return;
    const nextPlaceId=control.value||null,worldId=state.selectedCampaign.world_id;
    if(nextPlaceId===creature.current_place_id)return;
    try{await runBusy(state,async()=>{await state.repository.setCreaturePlace(worldId,creatureId(creature),Number(creature.revision),nextPlaceId);await loadCreatureWorkspace(state,{force:true});text(state.message,`Aufenthaltsort von „${creature.name}“ gespeichert. Die Spielerfreigaben wurden nicht verändert.`)})}catch{}
  }
  async function addCreatureFaction(state){
    if(!canManageCreatureWorld(state)||typeof state.repository.saveCreatureFactionLink!=='function')return;
    const creature=state.creatures.find(row=>activeRow(row)&&creatureId(row)===state.selectedCreatureId),control=field(state.creatureUi?.referenceEditor,'[data-gm-creature-faction]');if(!creature||!control?.value)return;
    const nextFactionId=control.value,existing=state.creatureFactionLinks.find(row=>row.creature_id===creatureId(creature)&&row.faction_id===nextFactionId),worldId=state.selectedCampaign.world_id;
    if(existing&&activeRow(existing))return;
    try{await runBusy(state,async()=>{await state.repository.saveCreatureFactionLink(worldId,creatureId(creature),nextFactionId,{expectedRevision:existing?Number(existing.revision):null});await loadCreatureWorkspace(state,{force:true});text(state.message,`Fraktion für „${creature.name}“ zugeordnet.`)})}catch{}
  }
  async function removeCreatureFaction(state,link){
    if(!canManageCreatureWorld(state)||typeof state.repository.saveCreatureFactionLink!=='function'||!activeRow(link))return;
    const worldId=state.selectedCampaign.world_id;
    try{await runBusy(state,async()=>{await state.repository.saveCreatureFactionLink(worldId,link.creature_id,link.faction_id,{expectedRevision:Number(link.revision),archived:true});await loadCreatureWorkspace(state,{force:true});text(state.message,'Fraktionszuordnung archiviert; die Wesen- und Fraktionsdatensätze bleiben bestehen.')})}catch{}
  }
  async function transferCreatureLoot(state){
    if(!canManageCreatureWorld(state)||typeof state.repository.transferCreatureLoot!=='function')return;
    const form=state.creatureUi?.lootForm,creature=state.creatures.find(row=>activeRow(row)&&creatureId(row)===state.selectedCreatureId);if(!form||!creature)return;
    let selected;try{selected=JSON.parse(field(form,'[data-gm-creature-loot-item]').value)}catch{}
    if(!Array.isArray(selected)||selected.length!==2){text(state.message,'Bitte wähle einen Gegenstand des Wesens.');return}
    const [inventoryKey,itemInstanceId]=selected,characterId=field(form,'[data-gm-creature-loot-character]').value;
    const quantity=Number(field(form,'[data-gm-creature-loot-quantity]').value),playerItemName=field(form,'[data-gm-creature-loot-player-name]').value.trim();
    const playerItemDescription=field(form,'[data-gm-creature-loot-player-description]').value.trim();
    if(!characterId||!playerItemName||!Number.isSafeInteger(quantity)||quantity<1){text(state.message,'Zielfigur, freigegebener Name und gültige Menge sind nötig.');return}
    const rule=creatureLootRule(creature,inventoryKey,itemInstanceId);
    if(!rule||quantity>rule.quantity){text(state.message,'Der Gegenstand oder die Menge ist nicht mehr verfügbar. Bitte neu laden.');return}
    if(rule.blocked){text(state.message,rule.reason);return}
    if(rule.requiresWhole&&quantity!==rule.quantity){text(state.message,`Ein Gegenstand mit gebundenen Wirkungen kann nur vollständig übertragen werden (${rule.quantity} Stück).`);return}
    const campaignId=state.selectedCampaignId;
    try{await runBusy(state,async()=>{
      await state.repository.transferCreatureLoot(campaignId,{creatureId:creatureId(creature),characterId,inventoryKey,itemInstanceId,quantity,playerItemName,playerItemDescription,expectedCreatureRevision:Number(creature.revision)});
      await loadCreatureWorkspace(state,{force:true});text(state.message,`Beute für die Figur vorgemerkt: ${quantity}× ${playerItemName}. Sie kostet keine CBP und wartet auf Übernahme durch den Spieler.`);
    })}catch{}
  }
  async function reverseCreatureLoot(state,receipt){
    if(!canManageCreatureWorld(state)||typeof state.repository.reverseCreatureLoot!=='function'||receipt.status!=='pending')return;
    const creature=state.creatures.find(row=>creatureId(row)===receipt.creature_id);
    if(!creature){text(state.message,'Das Quellwesen ist nicht mehr verfügbar. Die Beute kann hier nicht zurückgenommen werden.');return}
    if(typeof global.confirm!=='function'||!global.confirm(`Beute „${receipt.item_name}“ zurück zum Wesen buchen? Dies ist nur vor der Übernahme durch den Spieler möglich.`))return;
    try{await runBusy(state,async()=>{await state.repository.reverseCreatureLoot(receipt.receipt_id,Number(creature.revision));await loadCreatureWorkspace(state,{force:true});text(state.message,`Beute „${receipt.item_name}“ wurde nachvollziehbar zurückgebucht.`)})}catch{}
  }
  async function saveCreatureDisclosure(state){
    if(!canManageCreatureWorld(state)||typeof state.repository.saveCampaignCreatureDisclosure!=='function')return;
    const creature=state.creatures.find(row=>activeRow(row)&&creatureId(row)===state.selectedDisclosureCreatureId),form=state.creatureUi?.disclosureForm;if(!creature||!form)return;
    const disclosure=state.creatureDisclosures.find(row=>row.creature_id===creatureId(creature));
    const visibility=field(form,'[data-gm-creature-visibility]').value,playerName=field(form,'[data-gm-creature-player-name]').value.trim(),playerSummary=field(form,'[data-gm-creature-player-summary]').value.trim();
    if(visibility!=='secret'&&!playerName){text(state.message,'Für eine sichtbare Freigabe ist ein eigener Spielername nötig.');field(form,'[data-gm-creature-player-name]').focus();return}
    const changes={creatureId:creatureId(creature),expectedRevision:disclosure?Number(disclosure.revision):null,
      visibility,playerName:visibility==='secret'?'':playerName,playerSummary:visibility==='secret'?'':playerSummary,archived:false};
    try{await runBusy(state,async()=>{await state.repository.saveCampaignCreatureDisclosure(state.selectedCampaignId,changes);await loadCreatureWorkspace(state,{force:true});text(state.message,visibility==='secret'?`„${creature.name}“ bleibt für diese Kampagne geheim.`:`Spielerfreigabe für „${creature.name}“ gespeichert.`)})}catch{}
  }

  function resetRelationshipWorkspace(state){
    state.relationshipLoadSerial=(state.relationshipLoadSerial||0)+1;state.relationshipLoaded=false;state.relationshipLoading=false;state.relationshipWorldId=null;state.relationshipCampaignId=null;
    state.relationships=[];state.reputationScopes=[];state.reputations=[];state.warrants=[];state.pursuits=[];state.disadvantageLinks=[];state.phase6Creatures=[];state.phase6Places=[];state.phase6Factions=[];state.relationshipUi=null;
    clear(field(state.dialog,'[data-gm-panel="relationships"]'));
  }
  function hiddenInput(marker){return input('hidden',marker)}
  function phase6Section(panel,titleLabel,help){const section=document.createElement('section');section.className='gm-player-preview';section.append(heading('h4',titleLabel),note(help));panel.append(section);return section}
  function option(value,label){return [String(value??''),String(label??'')]}
  function replaceOptions(control,choices,placeholder='Bitte auswählen'){
    if(!control)return;const current=control.value;clear(control);if(placeholder!==null){const first=document.createElement('option');first.value='';first.textContent=placeholder;control.append(first)}
    for(const [value,label] of choices){const entry=document.createElement('option');entry.value=value;entry.textContent=label;control.append(entry)}
    if([...control.options].some(entry=>entry.value===current))control.value=current;
  }
  function ensureRelationshipWorkspace(state){
    const panel=field(state.dialog,'[data-gm-panel="relationships"]');if(!panel)return null;if(state.relationshipUi?.panel===panel)return state.relationshipUi;
    clear(panel);panel.append(heading('h3','Beziehungen, Ruf & Verfolgung'),note('Kampagnenwahrheit und Spielerwissen werden getrennt gespeichert. „Teilweise bekannt“ verlangt immer einen eigenen, ausdrücklich formulierten Spielerhinweis.','notice'));
    const status=note('Beziehungen und Kampagnenfolgen werden geladen …');status.setAttribute('role','status');const retry=button('Bereich erneut laden',()=>loadRelationshipWorkspace(state,{force:true}));retry.hidden=true;panel.append(status,retry);

    const relationshipSection=phase6Section(panel,'Gerichtete Beziehungen','Quelle → Ziel ist eine Richtung. Die Gegenrichtung ist ein eigener Datensatz und kann andere Rollen oder eine andere Haltung besitzen. Mehrere Rollen werden mit Kommas getrennt; Bindungen stehen zeilenweise als Art | Beschreibung.');
    const relationshipList=document.createElement('ul');relationshipList.dataset.gmRelationshipList='';relationshipSection.append(relationshipList);
    const relationshipForm=document.createElement('form');relationshipForm.dataset.gmRelationshipForm='';relationshipForm.append(
      hiddenInput('gmRelationshipId'),hiddenInput('gmRelationshipRevision'),
      labelControl('Quelle',select('gmRelationshipSource',[])),labelControl('Ziel',select('gmRelationshipTarget',[])),
      labelControl('Nur für diese Figur sichtbar (optional)',select('gmRelationshipAudience',[])),
      labelControl('Rollen, durch Kommas getrennt',input('text','gmRelationshipRoles',{required:true,maxLength:1000})),
      labelControl('Haltung',select('gmRelationshipAttitude',[['hasserfuellt','Hasserfüllt'],['feindlich','Feindlich'],['ablehnend','Ablehnend'],['misstrauisch','Misstrauisch'],['neutral','Neutral'],['wohlwollend','Wohlwollend'],['freundlich','Freundlich'],['loyal','Loyal'],['hingebungsvoll','Hingebungsvoll']])),
      labelControl('Bindungen, je Zeile Art | Beschreibung',textarea('gmRelationshipBonds',12000)),
      labelControl('Sichtbarkeit',select('gmRelationshipVisibility',[['secret','Geheim'],['partial','Teilweise bekannt'],['known','Bekannt']])),
      labelControl('Spielername der Quelle',input('text','gmRelationshipPlayerSource',{maxLength:160})),labelControl('Spielername des Ziels',input('text','gmRelationshipPlayerTarget',{maxLength:160})),
      labelControl('Freigegebene Rollen, durch Kommas getrennt',input('text','gmRelationshipPlayerRoles',{maxLength:1000})),
      labelControl('Freigegebene Haltung',select('gmRelationshipPlayerAttitude',[['','Nicht nennen'],['hasserfuellt','Hasserfüllt'],['feindlich','Feindlich'],['ablehnend','Ablehnend'],['misstrauisch','Misstrauisch'],['neutral','Neutral'],['wohlwollend','Wohlwollend'],['freundlich','Freundlich'],['loyal','Loyal'],['hingebungsvoll','Hingebungsvoll']])),
      labelControl('Eigener Spielerhinweis',textarea('gmRelationshipPlayerSummary',4000)),labelControl('Quelle / Referenz',textarea('gmRelationshipReference',4000)),submitButton('Beziehung speichern')
    );relationshipForm.addEventListener('submit',event=>{event.preventDefault();saveRelationship(state)});relationshipSection.append(relationshipForm);

    const scopeSection=phase6Section(panel,'Rufbereiche','Ruf ist nie global. Lege getrennte Bereiche wie Region, Fraktion, Institution, Haus, Beruf oder soziale Gruppe an.');
    const scopeList=document.createElement('ul');scopeList.dataset.gmReputationScopeList='';scopeSection.append(scopeList);
    const scopeForm=document.createElement('form');scopeForm.dataset.gmReputationScopeForm='';scopeForm.append(hiddenInput('gmScopeId'),hiddenInput('gmScopeRevision'),labelControl('Art',select('gmScopeKind',[['region','Region'],['place','Ort'],['faction','Fraktion'],['institution','Institution'],['house','Haus'],['profession','Beruf'],['social_group','Soziale Gruppe'],['other','Sonstiges']])),labelControl('Vorhandener Ort (nur bei Art Ort)',select('gmScopePlace',[])),labelControl('Vorhandene Fraktion (nur bei Art Fraktion)',select('gmScopeFaction',[])),labelControl('Name',input('text','gmScopeName',{required:true,maxLength:160})),labelControl('Geheime Notiz',textarea('gmScopeNotes',100000)),submitButton('Rufbereich speichern'));scopeForm.addEventListener('submit',event=>{event.preventDefault();saveReputationScope(state)});scopeSection.append(scopeForm);

    const reputationSection=phase6Section(panel,'Ruf einer Figur','Jeder Rufwert gehört genau zu einer Figur und einem Rufbereich.');
    const reputationList=document.createElement('ul');reputationList.dataset.gmReputationList='';reputationSection.append(reputationList);
    const reputationForm=document.createElement('form');reputationForm.dataset.gmReputationForm='';reputationForm.append(hiddenInput('gmReputationId'),hiddenInput('gmReputationRevision'),labelControl('Figur',select('gmReputationCharacter',[])),labelControl('Rufbereich',select('gmReputationScope',[])),labelControl('Interner Wert −100 bis 100',input('number','gmReputationValue',{required:true,min:-100,max:100,value:'0'})),labelControl('Interne Stufe',input('text','gmReputationTier',{maxLength:120})),labelControl('Sichtbarkeit',select('gmReputationVisibility',[['secret','Geheim'],['partial','Teilweise bekannt'],['known','Bekannt']])),labelControl('Spielername des Rufbereichs',input('text','gmReputationPlayerScope',{maxLength:160})),labelControl('Freigegebener Wert (optional)',input('number','gmReputationPlayerValue',{min:-100,max:100})),labelControl('Eigener Spielerhinweis',textarea('gmReputationPlayerSummary',4000)),labelControl('Quelle / Referenz',textarea('gmReputationReference',4000)),submitButton('Ruf speichern'));reputationForm.addEventListener('submit',event=>{event.preventDefault();saveReputation(state)});reputationSection.append(reputationForm);

    const warrantSection=phase6Section(panel,'Steckbriefe & Haftbefehle','Aussteller, Reichweite, Grund, Belohnung, Identität, Beschreibung und Status bleiben strukturiert. Spielertexte werden separat freigegeben.');
    const warrantList=document.createElement('ul');warrantList.dataset.gmWarrantList='';warrantSection.append(warrantList);
    const warrantForm=document.createElement('form');warrantForm.dataset.gmWarrantForm='';warrantForm.append(hiddenInput('gmWarrantId'),hiddenInput('gmWarrantRevision'),labelControl('Figur',select('gmWarrantCharacter',[])),labelControl('Aussteller (vorhandene Entität oder freie Art)',select('gmWarrantIssuer',[])),labelControl('Interne Bezeichnung des Ausstellers',input('text','gmWarrantIssuerLabel',{required:true,maxLength:160})),labelControl('Reichweiten-Rufbereich (optional)',select('gmWarrantReachScope',[])),labelControl('Interne Reichweite',input('text','gmWarrantReachLabel',{required:true,maxLength:160})),labelControl('Interner Grund',textarea('gmWarrantReason',4000)),labelControl('Interne Belohnung',input('text','gmWarrantReward',{maxLength:1000})),labelControl('Gesucht',select('gmWarrantAlive',[['alive','Lebend'],['dead','Tot'],['either','Lebend oder tot']])),labelControl('Bekannte Identität',input('text','gmWarrantIdentity',{maxLength:240})),labelControl('Bekannte Beschreibung',textarea('gmWarrantDescription',4000)),labelControl('Status',select('gmWarrantStatus',[['active','Aktiv'],['revoked','Widerrufen'],['resolved','Erledigt'],['pardoned','Begnadigt']])),labelControl('Sichtbarkeit',select('gmWarrantVisibility',[['secret','Geheim'],['partial','Teilweise bekannt'],['known','Bekannt']])),labelControl('Spieler-Aussteller',input('text','gmWarrantPlayerIssuer',{maxLength:160})),labelControl('Spieler-Reichweite',input('text','gmWarrantPlayerReach',{maxLength:160})),labelControl('Spieler-Grund',textarea('gmWarrantPlayerReason',4000)),labelControl('Spieler-Belohnung',input('text','gmWarrantPlayerReward',{maxLength:1000})),labelControl('Spieler-Identität',input('text','gmWarrantPlayerIdentity',{maxLength:240})),labelControl('Spieler-Beschreibung',textarea('gmWarrantPlayerDescription',4000)),labelControl('Spieler-Fassung lebend/tot',select('gmWarrantPlayerAlive',[['','Nicht nennen'],['alive','Lebend'],['dead','Tot'],['either','Lebend oder tot']])),labelControl('Eigener Spielerhinweis',textarea('gmWarrantPlayerSummary',4000)),labelControl('Gültig ab Kampagnentag',input('number','gmWarrantFromDay',{min:1})),labelControl('Gültig bis Kampagnentag',input('number','gmWarrantUntilDay',{min:1})),labelControl('Quelle / Referenz',textarea('gmWarrantReference',4000)),submitButton('Steckbrief speichern'));warrantForm.addEventListener('submit',event=>{event.preventDefault();saveWarrant(state)});warrantSection.append(warrantForm);

    const pursuitSection=phase6Section(panel,'Verfolgungen','Ein Verfolger kann mit einem echten Weltwesen verknüpft werden. Ohne Verknüpfung bleibt er eine ausdrücklich bezeichnete, noch nicht aufgelöste Spur.');
    const pursuitList=document.createElement('ul');pursuitList.dataset.gmPursuitList='';pursuitSection.append(pursuitList);
    const pursuitForm=document.createElement('form');pursuitForm.dataset.gmPursuitForm='';pursuitForm.append(hiddenInput('gmPursuitId'),hiddenInput('gmPursuitRevision'),labelControl('Figur',select('gmPursuitCharacter',[])),labelControl('Konkretes Weltwesen (optional)',select('gmPursuitCreature',[])),labelControl('Interne Bezeichnung',input('text','gmPursuitLabel',{required:true,maxLength:160})),labelControl('Status',select('gmPursuitStatus',[['active','Aktiv'],['paused','Pausiert'],['lost','Spur verloren'],['ended','Beendet']])),labelControl('Intensität 0 bis 10',input('number','gmPursuitIntensity',{required:true,min:0,max:10,value:'1'})),labelControl('Entfernung',select('gmPursuitDistance',[['unknown','Unbekannt'],['far','Fern'],['near','Nah'],['imminent','Unmittelbar'],['contact','Kontakt']])),labelControl('Motiv',textarea('gmPursuitMotive',4000)),labelControl('Geheime Notizen',textarea('gmPursuitNotes',100000)),labelControl('Sichtbarkeit',select('gmPursuitVisibility',[['secret','Geheim'],['partial','Teilweise bekannt'],['known','Bekannt']])),labelControl('Spielername',input('text','gmPursuitPlayerName',{maxLength:160})),labelControl('Spielerhinweis',textarea('gmPursuitPlayerHint',4000)),labelControl('Spielerstatus',input('text','gmPursuitPlayerStatus',{maxLength:160})),labelControl('Zuletzt bekannt an Kampagnentag',input('number','gmPursuitDay',{min:1})),labelControl('Quelle / Referenz',textarea('gmPursuitReference',4000)),submitButton('Verfolgung speichern'));pursuitForm.addEventListener('submit',event=>{event.preventDefault();savePursuit(state)});pursuitSection.append(pursuitForm);

    const disadvantageSection=phase6Section(panel,'Nachteile mit Kampagnenfolgen','Der Nachteil wird aus der gültigen Serverrevision der Figur gewählt und nur referenziert. Es entsteht keine zweite Kopie der Regeldaten. Wenn die konkrete Folge noch fehlt, bleibt sie ausdrücklich „noch offen“.');
    const disadvantageList=document.createElement('ul');disadvantageList.dataset.gmDisadvantageList='';disadvantageSection.append(disadvantageList);
    const disadvantageForm=document.createElement('form');disadvantageForm.dataset.gmDisadvantageForm='';disadvantageForm.append(hiddenInput('gmDisadvantageLinkId'),hiddenInput('gmDisadvantageRevision'),labelControl('Figur',select('gmDisadvantageCharacter',[])),labelControl('Nachteil der gültigen Serverrevision',select('gmDisadvantageSource',[])),labelControl('Kampagnenfolge',select('gmDisadvantageImpact',[])),labelControl('Sichtbarkeit',select('gmDisadvantageVisibility',[['secret','Geheim'],['partial','Teilweise bekannt'],['known','Bekannt']])),labelControl('Spielerhinweis',textarea('gmDisadvantagePlayerSummary',4000)),labelControl('Geheime Notiz',textarea('gmDisadvantageNotes',100000)),submitButton('Nachteil verknüpfen'));disadvantageForm.addEventListener('submit',event=>{event.preventDefault();saveDisadvantageLink(state)});field(disadvantageForm,'[data-gm-disadvantage-character]').addEventListener('change',()=>renderDisadvantageChoices(state));disadvantageSection.append(disadvantageForm);

    state.relationshipUi={panel,status,retry,relationshipList,relationshipForm,scopeList,scopeForm,reputationList,reputationForm,warrantList,warrantForm,pursuitList,pursuitForm,disadvantageList,disadvantageForm};return state.relationshipUi;
  }
  const splitList=value=>String(value||'').split(',').map(entry=>entry.trim()).filter(Boolean);
  function parseBonds(value){return String(value||'').split(/\r?\n/).map(line=>line.trim()).filter(Boolean).map(line=>{const [rawKind,...summary]=line.split('|'),kind=rawKind.trim(),allowed=['money_debt','favor','oath','contract','pact','secret','dependency','protection','service'];return{kind:allowed.includes(kind)?kind:'service',summary:(summary.length?summary.join('|'):rawKind).trim()}})}
  function entityChoices(state){
    const choices=[option(`campaign:${state.selectedCampaignId}`,`Kampagne · ${state.selectedCampaign?.name||'Aktuell'}`)];
    for(const row of state.selectedData?.characters||[])choices.push(option(`character:${row.id}`,`Figur · ${row.public_data?.name||row.id}`));
    for(const row of state.phase6Creatures.filter(activeRow))choices.push(option(`creature:${creatureId(row)}`,`Wesen · ${row.name||creatureId(row)}`));
    for(const row of state.phase6Factions.filter(activeRow))choices.push(option(`faction:${row.faction_id||row.id}`,`Fraktion · ${row.name||row.faction_id||row.id}`));return choices;
  }
  function entityValue(value){const [kind,id]=String(value||'').split(':');return{kind,id:id||null}}
  function canonicalDisadvantages(state,characterId){
    const character=state.selectedData?.characters?.find(row=>row.id===characterId),revision=state.revisionCache.get(character?.current_revision_id),rows=revision?.canonical_data?.character?.disadvantages;
    return (Array.isArray(rows)?rows:[]).map((row,index)=>typeof row==='string'?{id:row,name:row}:{id:String(row?.id||row?.catalogId||row?.key||row?.name||index),name:String(row?.name||row?.title||row?.id||`Nachteil ${index+1}`)}).filter(row=>row.id&&row.name);
  }
  function renderDisadvantageChoices(state){
    const ui=ensureRelationshipWorkspace(state),characterId=field(ui.disadvantageForm,'[data-gm-disadvantage-character]').value;
    replaceOptions(field(ui.disadvantageForm,'[data-gm-disadvantage-source]'),canonicalDisadvantages(state,characterId).map(row=>option(`${row.id}\u001f${row.name}`,row.name)),'Nachteil auswählen');
  }
  function renderRelationshipWorkspace(state){
    const ui=ensureRelationshipWorkspace(state);if(!ui)return;
    const characters=(state.selectedData?.characters||[]).filter(row=>['approved_locked','change_pending'].includes(row.status)),characterChoices=characters.map(row=>option(row.id,row.public_data?.name||row.id)),entities=entityChoices(state),scopes=state.reputationScopes.filter(activeRow),scopeChoices=scopes.map(row=>option(row.scope_id,row.name)),creatures=state.phase6Creatures.filter(activeRow).map(row=>option(creatureId(row),row.name||creatureId(row))),places=state.phase6Places.filter(activeRow).map(row=>option(row.place_id||row.id,row.name||row.place_id||row.id)),factions=state.phase6Factions.filter(activeRow).map(row=>option(row.faction_id||row.id,row.name||row.faction_id||row.id));
    replaceOptions(field(ui.relationshipForm,'[data-gm-relationship-source]'),entities);replaceOptions(field(ui.relationshipForm,'[data-gm-relationship-target]'),entities);replaceOptions(field(ui.relationshipForm,'[data-gm-relationship-audience]'),characterChoices,'Für alle Kampagnenmitglieder');
    replaceOptions(field(ui.scopeForm,'[data-gm-scope-place]'),places,'Kein Ort');replaceOptions(field(ui.scopeForm,'[data-gm-scope-faction]'),factions,'Keine Fraktion');
    for(const selector of ['[data-gm-reputation-character]','[data-gm-warrant-character]','[data-gm-pursuit-character]','[data-gm-disadvantage-character]'])replaceOptions(field(ui.panel,selector),characterChoices);
    replaceOptions(field(ui.reputationForm,'[data-gm-reputation-scope]'),scopeChoices);replaceOptions(field(ui.warrantForm,'[data-gm-warrant-reach-scope]'),scopeChoices,'Kein Rufbereich');
    replaceOptions(field(ui.warrantForm,'[data-gm-warrant-issuer]'),[...state.phase6Creatures.filter(activeRow).map(row=>option(`creature:${creatureId(row)}`,`Wesen · ${row.name}`)),...state.phase6Factions.filter(activeRow).map(row=>option(`faction:${row.faction_id||row.id}`,`Fraktion · ${row.name}`)),...state.phase6Places.filter(activeRow).map(row=>option(`place:${row.place_id||row.id}`,`Ort · ${row.name}`)),option('institution:','Institution (freie Bezeichnung)'),option('other:','Sonstiger Aussteller')]);
    replaceOptions(field(ui.pursuitForm,'[data-gm-pursuit-creature]'),creatures,'Noch kein konkretes Weltwesen');
    const impacts=[option('unresolved:','Auswirkung noch offen'),...state.relationships.filter(activeRow).map(row=>option(`relationship:${row.relationship_id}`,`Beziehung · ${row.player_source_label||row.source_kind} → ${row.player_target_label||row.target_kind}`)),...state.reputations.filter(activeRow).map(row=>option(`reputation:${row.reputation_id}`,`Ruf · ${row.scope_name}`)),...state.warrants.filter(activeRow).map(row=>option(`warrant:${row.warrant_id}`,`Steckbrief · ${row.issuer_label}`)),...state.pursuits.filter(activeRow).map(row=>option(`pursuit:${row.pursuit_id}`,`Verfolgung · ${row.pursuer_label}`))];replaceOptions(field(ui.disadvantageForm,'[data-gm-disadvantage-impact]'),impacts,null);const disadvantageCharacter=field(ui.disadvantageForm,'[data-gm-disadvantage-character]');if(!disadvantageCharacter.value&&characterChoices[0])disadvantageCharacter.value=characterChoices[0][0];renderDisadvantageChoices(state);
    const characterLabel=id=>characters.find(row=>row.id===id)?.public_data?.name||id;
    const render=(list,rows,formatter,edit,archive,empty)=>{clear(list);const active=rows.filter(activeRow);if(!active.length){list.append(item(empty));return}for(const row of active)list.append(item(formatter(row),button('Bearbeiten',()=>editPhase6Record(state,edit,row)),button('Archivieren',()=>archivePhase6Record(state,archive,row),'danger')))};
    render(ui.relationshipList,state.relationships,row=>`${row.source_kind} → ${row.target_kind} · ${row.roles.join(', ')} · ${row.attitude} · ${row.visibility}`,'relationship','relationship','Noch keine Beziehungen.');
    render(ui.scopeList,state.reputationScopes,row=>`${row.name} · ${row.scope_kind}`,'scope','scope','Noch keine Rufbereiche.');
    render(ui.reputationList,state.reputations,row=>`${characterLabel(row.character_id)} · ${row.scope_name} · ${row.reputation_value} · ${row.visibility}`,'reputation','reputation','Noch keine Rufwerte.');
    render(ui.warrantList,state.warrants,row=>`${characterLabel(row.character_id)} · ${row.issuer_label} · ${row.warrant_status} · ${row.visibility}`,'warrant','warrant','Noch keine Steckbriefe oder Haftbefehle.');
    render(ui.pursuitList,state.pursuits,row=>`${characterLabel(row.character_id)} · ${row.pursuer_label} · ${row.pursuit_status} · ${row.visibility}${row.creature_id?' · konkretes Weltwesen':''}`,'pursuit','pursuit','Noch keine Verfolgungen.');
    render(ui.disadvantageList,state.disadvantageLinks,row=>`${characterLabel(row.character_id)} · ${row.disadvantage_name} · ${row.impact_kind==='unresolved'?'Auswirkung noch offen':row.impact_kind} · ${row.visibility}${row.source_still_present?'':' · Quelle nicht mehr in aktueller Revision'}`,'disadvantage','disadvantage','Noch keine Nachteile mit Kampagnenfolgen verknüpft.');
  }
  function setValue(root,selector,value){const control=field(root,selector);if(control)control.value=value??''}
  function editPhase6Record(state,type,row){
    const ui=ensureRelationshipWorkspace(state);let form;
    if(type==='relationship'){form=ui.relationshipForm;setValue(form,'[data-gm-relationship-id]',row.relationship_id);setValue(form,'[data-gm-relationship-revision]',row.revision);setValue(form,'[data-gm-relationship-source]',`${row.source_kind}:${row.source_id}`);setValue(form,'[data-gm-relationship-target]',`${row.target_kind}:${row.target_id}`);setValue(form,'[data-gm-relationship-audience]',row.audience_character_id);setValue(form,'[data-gm-relationship-roles]',row.roles.join(', '));setValue(form,'[data-gm-relationship-attitude]',row.attitude);setValue(form,'[data-gm-relationship-bonds]',row.bonds.map(bond=>`${bond.kind} | ${bond.summary||''}`).join('\n'));setValue(form,'[data-gm-relationship-visibility]',row.visibility);setValue(form,'[data-gm-relationship-player-source]',row.player_source_label);setValue(form,'[data-gm-relationship-player-target]',row.player_target_label);setValue(form,'[data-gm-relationship-player-roles]',row.player_roles.join(', '));setValue(form,'[data-gm-relationship-player-attitude]',row.player_attitude);setValue(form,'[data-gm-relationship-player-summary]',row.player_summary);setValue(form,'[data-gm-relationship-reference]',row.source_reference)}
    if(type==='scope'){form=ui.scopeForm;setValue(form,'[data-gm-scope-id]',row.scope_id);setValue(form,'[data-gm-scope-revision]',row.revision);setValue(form,'[data-gm-scope-kind]',row.scope_kind);setValue(form,'[data-gm-scope-place]',row.place_id);setValue(form,'[data-gm-scope-faction]',row.faction_id);setValue(form,'[data-gm-scope-name]',row.name);setValue(form,'[data-gm-scope-notes]',row.gm_notes)}
    if(type==='reputation'){form=ui.reputationForm;setValue(form,'[data-gm-reputation-id]',row.reputation_id);setValue(form,'[data-gm-reputation-revision]',row.revision);setValue(form,'[data-gm-reputation-character]',row.character_id);setValue(form,'[data-gm-reputation-scope]',row.scope_id);setValue(form,'[data-gm-reputation-value]',row.reputation_value);setValue(form,'[data-gm-reputation-tier]',row.tier_label);setValue(form,'[data-gm-reputation-visibility]',row.visibility);setValue(form,'[data-gm-reputation-player-scope]',row.player_scope_name);setValue(form,'[data-gm-reputation-player-value]',row.player_value);setValue(form,'[data-gm-reputation-player-summary]',row.player_summary);setValue(form,'[data-gm-reputation-reference]',row.source_reference)}
    if(type==='warrant'){form=ui.warrantForm;setValue(form,'[data-gm-warrant-id]',row.warrant_id);setValue(form,'[data-gm-warrant-revision]',row.revision);setValue(form,'[data-gm-warrant-character]',row.character_id);setValue(form,'[data-gm-warrant-issuer]',`${row.issuer_kind}:${row.issuer_id||''}`);setValue(form,'[data-gm-warrant-issuer-label]',row.issuer_label);setValue(form,'[data-gm-warrant-reach-scope]',row.reach_scope_id);setValue(form,'[data-gm-warrant-reach-label]',row.reach_label);setValue(form,'[data-gm-warrant-reason]',row.reason);setValue(form,'[data-gm-warrant-reward]',row.reward?.description||'');setValue(form,'[data-gm-warrant-alive]',row.alive_policy);setValue(form,'[data-gm-warrant-identity]',row.known_identity);setValue(form,'[data-gm-warrant-description]',row.known_description);setValue(form,'[data-gm-warrant-status]',row.warrant_status);setValue(form,'[data-gm-warrant-visibility]',row.visibility);setValue(form,'[data-gm-warrant-player-issuer]',row.player_issuer);setValue(form,'[data-gm-warrant-player-reach]',row.player_reach);setValue(form,'[data-gm-warrant-player-reason]',row.player_reason);setValue(form,'[data-gm-warrant-player-reward]',row.player_reward);setValue(form,'[data-gm-warrant-player-identity]',row.player_identity);setValue(form,'[data-gm-warrant-player-description]',row.player_description);setValue(form,'[data-gm-warrant-player-alive]',row.player_alive_policy);setValue(form,'[data-gm-warrant-player-summary]',row.player_summary);setValue(form,'[data-gm-warrant-from-day]',row.valid_from_day);setValue(form,'[data-gm-warrant-until-day]',row.valid_until_day);setValue(form,'[data-gm-warrant-reference]',row.source_reference)}
    if(type==='pursuit'){form=ui.pursuitForm;setValue(form,'[data-gm-pursuit-id]',row.pursuit_id);setValue(form,'[data-gm-pursuit-revision]',row.revision);setValue(form,'[data-gm-pursuit-character]',row.character_id);setValue(form,'[data-gm-pursuit-creature]',row.creature_id);setValue(form,'[data-gm-pursuit-label]',row.pursuer_label);setValue(form,'[data-gm-pursuit-status]',row.pursuit_status);setValue(form,'[data-gm-pursuit-intensity]',row.intensity);setValue(form,'[data-gm-pursuit-distance]',row.distance_stage);setValue(form,'[data-gm-pursuit-motive]',row.motive);setValue(form,'[data-gm-pursuit-notes]',row.gm_notes);setValue(form,'[data-gm-pursuit-visibility]',row.visibility);setValue(form,'[data-gm-pursuit-player-name]',row.player_name);setValue(form,'[data-gm-pursuit-player-hint]',row.player_hint);setValue(form,'[data-gm-pursuit-player-status]',row.player_status);setValue(form,'[data-gm-pursuit-day]',row.last_known_day);setValue(form,'[data-gm-pursuit-reference]',row.source_reference)}
    if(type==='disadvantage'){form=ui.disadvantageForm;setValue(form,'[data-gm-disadvantage-link-id]',row.link_id);setValue(form,'[data-gm-disadvantage-revision]',row.revision);setValue(form,'[data-gm-disadvantage-character]',row.character_id);renderDisadvantageChoices(state);setValue(form,'[data-gm-disadvantage-source]',`${row.disadvantage_id}\u001f${row.disadvantage_name}`);const impactId=row[`${row.impact_kind}_id`]||'';setValue(form,'[data-gm-disadvantage-impact]',`${row.impact_kind}:${impactId}`);setValue(form,'[data-gm-disadvantage-visibility]',row.visibility);setValue(form,'[data-gm-disadvantage-player-summary]',row.player_summary);setValue(form,'[data-gm-disadvantage-notes]',row.gm_notes)}
    form?.scrollIntoView?.({block:'nearest'});
  }
  const nullableNumber=value=>String(value??'').trim()===''?null:Number(value);
  function editingRow(rows,idKey,id){return rows.find(row=>row[idKey]===id)}
  async function saveRelationship(state){
    const form=state.relationshipUi.relationshipForm,id=field(form,'[data-gm-relationship-id]').value||null,row=editingRow(state.relationships,'relationship_id',id),source=entityValue(field(form,'[data-gm-relationship-source]').value),target=entityValue(field(form,'[data-gm-relationship-target]').value),visibility=field(form,'[data-gm-relationship-visibility]').value;
    if(!source.id||!target.id){text(state.message,'Bitte Quelle und Ziel der gerichteten Beziehung wählen.');return}
    try{await runBusy(state,async()=>{await state.repository.saveCampaignRelationship(state.selectedCampaignId,{relationshipId:id,expectedRevision:nullableNumber(field(form,'[data-gm-relationship-revision]').value),audienceCharacterId:field(form,'[data-gm-relationship-audience]').value||null,sourceKind:source.kind,sourceId:source.id,targetKind:target.kind,targetId:target.id,roles:splitList(field(form,'[data-gm-relationship-roles]').value),attitude:field(form,'[data-gm-relationship-attitude]').value,bonds:parseBonds(field(form,'[data-gm-relationship-bonds]').value),visibility,playerSourceLabel:visibility==='secret'?'':field(form,'[data-gm-relationship-player-source]').value.trim(),playerTargetLabel:visibility==='secret'?'':field(form,'[data-gm-relationship-player-target]').value.trim(),playerRoles:visibility==='secret'?[]:splitList(field(form,'[data-gm-relationship-player-roles]').value),playerAttitude:visibility==='secret'?null:field(form,'[data-gm-relationship-player-attitude]').value||null,playerSummary:visibility==='secret'?'':field(form,'[data-gm-relationship-player-summary]').value.trim(),sourceReference:field(form,'[data-gm-relationship-reference]').value.trim(),history:row?.history||[]});form.reset();await loadRelationshipWorkspace(state,{force:true});text(state.message,'Gerichtete Beziehung gespeichert.')})}catch{}
  }
  async function saveReputationScope(state){
    const form=state.relationshipUi.scopeForm,kind=field(form,'[data-gm-scope-kind]').value;
    try{await runBusy(state,async()=>{await state.repository.saveWorldReputationScope(state.selectedCampaign.world_id,{scopeId:field(form,'[data-gm-scope-id]').value||null,expectedRevision:nullableNumber(field(form,'[data-gm-scope-revision]').value),scopeKind:kind,placeId:kind==='place'?field(form,'[data-gm-scope-place]').value||null:null,factionId:kind==='faction'?field(form,'[data-gm-scope-faction]').value||null:null,name:field(form,'[data-gm-scope-name]').value.trim(),gmNotes:field(form,'[data-gm-scope-notes]').value.trim()});form.reset();await loadRelationshipWorkspace(state,{force:true});text(state.message,'Rufbereich gespeichert.')})}catch{}
  }
  async function saveReputation(state){
    const form=state.relationshipUi.reputationForm,id=field(form,'[data-gm-reputation-id]').value||null,row=editingRow(state.reputations,'reputation_id',id),visibility=field(form,'[data-gm-reputation-visibility]').value;
    try{await runBusy(state,async()=>{await state.repository.saveCampaignReputation(state.selectedCampaignId,{reputationId:id,expectedRevision:nullableNumber(field(form,'[data-gm-reputation-revision]').value),characterId:field(form,'[data-gm-reputation-character]').value,scopeId:field(form,'[data-gm-reputation-scope]').value,value:Number(field(form,'[data-gm-reputation-value]').value),tierLabel:field(form,'[data-gm-reputation-tier]').value.trim(),visibility,playerScopeName:visibility==='secret'?'':field(form,'[data-gm-reputation-player-scope]').value.trim(),playerValue:visibility==='secret'?null:nullableNumber(field(form,'[data-gm-reputation-player-value]').value),playerSummary:visibility==='secret'?'':field(form,'[data-gm-reputation-player-summary]').value.trim(),sourceReference:field(form,'[data-gm-reputation-reference]').value.trim(),history:row?.history||[]});form.reset();await loadRelationshipWorkspace(state,{force:true});text(state.message,'Kampagnenbezogener Ruf gespeichert.')})}catch{}
  }
  async function saveWarrant(state){
    const form=state.relationshipUi.warrantForm,id=field(form,'[data-gm-warrant-id]').value||null,row=editingRow(state.warrants,'warrant_id',id),issuer=entityValue(field(form,'[data-gm-warrant-issuer]').value),visibility=field(form,'[data-gm-warrant-visibility]').value,reward=field(form,'[data-gm-warrant-reward]').value.trim();
    try{await runBusy(state,async()=>{await state.repository.saveCampaignWarrant(state.selectedCampaignId,{warrantId:id,expectedRevision:nullableNumber(field(form,'[data-gm-warrant-revision]').value),characterId:field(form,'[data-gm-warrant-character]').value,issuerKind:issuer.kind,issuerId:issuer.id,issuerLabel:field(form,'[data-gm-warrant-issuer-label]').value.trim(),reachScopeId:field(form,'[data-gm-warrant-reach-scope]').value||null,reachLabel:field(form,'[data-gm-warrant-reach-label]').value.trim(),reason:field(form,'[data-gm-warrant-reason]').value.trim(),reward:reward?{description:reward}:{},alivePolicy:field(form,'[data-gm-warrant-alive]').value,knownIdentity:field(form,'[data-gm-warrant-identity]').value.trim(),knownDescription:field(form,'[data-gm-warrant-description]').value.trim(),warrantStatus:field(form,'[data-gm-warrant-status]').value,visibility,playerIssuer:visibility==='secret'?'':field(form,'[data-gm-warrant-player-issuer]').value.trim(),playerReach:visibility==='secret'?'':field(form,'[data-gm-warrant-player-reach]').value.trim(),playerReason:visibility==='secret'?'':field(form,'[data-gm-warrant-player-reason]').value.trim(),playerReward:visibility==='secret'?'':field(form,'[data-gm-warrant-player-reward]').value.trim(),playerIdentity:visibility==='secret'?'':field(form,'[data-gm-warrant-player-identity]').value.trim(),playerDescription:visibility==='secret'?'':field(form,'[data-gm-warrant-player-description]').value.trim(),playerAlivePolicy:visibility==='secret'?null:field(form,'[data-gm-warrant-player-alive]').value||null,playerSummary:visibility==='secret'?'':field(form,'[data-gm-warrant-player-summary]').value.trim(),validFromDay:nullableNumber(field(form,'[data-gm-warrant-from-day]').value),validUntilDay:nullableNumber(field(form,'[data-gm-warrant-until-day]').value),sourceReference:field(form,'[data-gm-warrant-reference]').value.trim(),history:row?.history||[]});form.reset();await loadRelationshipWorkspace(state,{force:true});text(state.message,'Steckbrief oder Haftbefehl gespeichert.')})}catch{}
  }
  async function savePursuit(state){
    const form=state.relationshipUi.pursuitForm,id=field(form,'[data-gm-pursuit-id]').value||null,row=editingRow(state.pursuits,'pursuit_id',id),visibility=field(form,'[data-gm-pursuit-visibility]').value;
    try{await runBusy(state,async()=>{await state.repository.saveCampaignPursuit(state.selectedCampaignId,{pursuitId:id,expectedRevision:nullableNumber(field(form,'[data-gm-pursuit-revision]').value),characterId:field(form,'[data-gm-pursuit-character]').value,creatureId:field(form,'[data-gm-pursuit-creature]').value||null,pursuerLabel:field(form,'[data-gm-pursuit-label]').value.trim(),pursuitStatus:field(form,'[data-gm-pursuit-status]').value,intensity:Number(field(form,'[data-gm-pursuit-intensity]').value),distanceStage:field(form,'[data-gm-pursuit-distance]').value,motive:field(form,'[data-gm-pursuit-motive]').value.trim(),gmNotes:field(form,'[data-gm-pursuit-notes]').value.trim(),visibility,playerName:visibility==='secret'?'':field(form,'[data-gm-pursuit-player-name]').value.trim(),playerHint:visibility==='secret'?'':field(form,'[data-gm-pursuit-player-hint]').value.trim(),playerStatus:visibility==='secret'?'':field(form,'[data-gm-pursuit-player-status]').value.trim(),lastKnownDay:nullableNumber(field(form,'[data-gm-pursuit-day]').value),sourceReference:field(form,'[data-gm-pursuit-reference]').value.trim(),history:row?.history||[]});form.reset();await loadRelationshipWorkspace(state,{force:true});text(state.message,'Verfolgung gespeichert.')})}catch{}
  }
  async function saveDisadvantageLink(state){
    const form=state.relationshipUi.disadvantageForm,source=String(field(form,'[data-gm-disadvantage-source]').value||'').split('\u001f'),impact=entityValue(field(form,'[data-gm-disadvantage-impact]').value);
    if(source.length<2){text(state.message,'Bitte einen Nachteil aus der gültigen Serverrevision wählen.');return}
    try{await runBusy(state,async()=>{await state.repository.saveCampaignDisadvantageLink(state.selectedCampaignId,{linkId:field(form,'[data-gm-disadvantage-link-id]').value||null,expectedRevision:nullableNumber(field(form,'[data-gm-disadvantage-revision]').value),characterId:field(form,'[data-gm-disadvantage-character]').value,disadvantageId:source[0],disadvantageName:source.slice(1).join('\u001f'),impactKind:impact.kind,impactId:impact.id,visibility:field(form,'[data-gm-disadvantage-visibility]').value,playerSummary:field(form,'[data-gm-disadvantage-player-summary]').value.trim(),gmNotes:field(form,'[data-gm-disadvantage-notes]').value.trim()});form.reset();await loadRelationshipWorkspace(state,{force:true});text(state.message,'Nachteil referenziert; die Regeldaten wurden nicht dupliziert.')})}catch{}
  }
  async function archivePhase6Record(state,type,row){
    if(typeof global.confirm==='function'&&!global.confirm('Diesen Eintrag archivieren? Die Historie und stabile Kennung bleiben erhalten.'))return;
    try{await runBusy(state,async()=>{
      if(type==='relationship')await state.repository.saveCampaignRelationship(state.selectedCampaignId,{relationshipId:row.relationship_id,expectedRevision:row.revision,audienceCharacterId:row.audience_character_id,sourceKind:row.source_kind,sourceId:row.source_id,targetKind:row.target_kind,targetId:row.target_id,roles:row.roles,attitude:row.attitude,bonds:row.bonds,visibility:row.visibility,playerSourceLabel:row.player_source_label,playerTargetLabel:row.player_target_label,playerRoles:row.player_roles,playerAttitude:row.player_attitude,playerSummary:row.player_summary,sourceReference:row.source_reference,history:row.history,archived:true});
      if(type==='scope')await state.repository.saveWorldReputationScope(state.selectedCampaign.world_id,{scopeId:row.scope_id,expectedRevision:row.revision,scopeKind:row.scope_kind,placeId:row.place_id,factionId:row.faction_id,name:row.name,gmNotes:row.gm_notes,archived:true});
      if(type==='reputation')await state.repository.saveCampaignReputation(state.selectedCampaignId,{reputationId:row.reputation_id,expectedRevision:row.revision,characterId:row.character_id,scopeId:row.scope_id,value:row.reputation_value,tierLabel:row.tier_label,visibility:row.visibility,playerScopeName:row.player_scope_name,playerValue:row.player_value,playerSummary:row.player_summary,sourceReference:row.source_reference,history:row.history,archived:true});
      if(type==='warrant')await state.repository.saveCampaignWarrant(state.selectedCampaignId,{warrantId:row.warrant_id,expectedRevision:row.revision,characterId:row.character_id,issuerKind:row.issuer_kind,issuerId:row.issuer_id,issuerLabel:row.issuer_label,reachScopeId:row.reach_scope_id,reachLabel:row.reach_label,reason:row.reason,reward:row.reward,alivePolicy:row.alive_policy,knownIdentity:row.known_identity,knownDescription:row.known_description,warrantStatus:row.warrant_status,visibility:row.visibility,playerIssuer:row.player_issuer,playerReach:row.player_reach,playerReason:row.player_reason,playerReward:row.player_reward,playerIdentity:row.player_identity,playerDescription:row.player_description,playerAlivePolicy:row.player_alive_policy,playerSummary:row.player_summary,validFromDay:row.valid_from_day,validUntilDay:row.valid_until_day,sourceReference:row.source_reference,history:row.history,archived:true});
      if(type==='pursuit')await state.repository.saveCampaignPursuit(state.selectedCampaignId,{pursuitId:row.pursuit_id,expectedRevision:row.revision,characterId:row.character_id,creatureId:row.creature_id,pursuerLabel:row.pursuer_label,pursuitStatus:row.pursuit_status,intensity:row.intensity,distanceStage:row.distance_stage,motive:row.motive,gmNotes:row.gm_notes,visibility:row.visibility,playerName:row.player_name,playerHint:row.player_hint,playerStatus:row.player_status,lastKnownDay:row.last_known_day,sourceReference:row.source_reference,history:row.history,archived:true});
      if(type==='disadvantage')await state.repository.saveCampaignDisadvantageLink(state.selectedCampaignId,{linkId:row.link_id,expectedRevision:row.revision,characterId:row.character_id,disadvantageId:row.disadvantage_id,disadvantageName:row.disadvantage_name,impactKind:row.impact_kind,impactId:row[`${row.impact_kind}_id`]||null,visibility:row.visibility,playerSummary:row.player_summary,gmNotes:row.gm_notes,archived:true});
      await loadRelationshipWorkspace(state,{force:true});text(state.message,'Eintrag archiviert; Kennung und Historie bleiben erhalten.');
    })}catch{}
  }
  async function loadRelationshipWorkspace(state,{force=false}={}){
    const ui=ensureRelationshipWorkspace(state),worldId=state.selectedCampaign?.world_id,campaignId=state.selectedCampaignId;if(!ui||!worldId||!campaignId)return;
    const required=['listCampaignRelationships','listWorldReputationScopes','listCampaignReputations','listCampaignWarrants','listCampaignPursuits','listCampaignDisadvantageLinks'];
    if(required.some(name=>typeof state.repository[name]!=='function')){text(ui.status,'Die Beziehungs- und Rufverwaltung ist in dieser App-Fassung noch nicht verbunden.');show(ui.retry,false);return}
    if(!force&&state.relationshipLoaded&&state.relationshipWorldId===worldId&&state.relationshipCampaignId===campaignId)return;if(!force&&state.relationshipLoading)return;
    const serial=++state.relationshipLoadSerial,authEpoch=state.authEpoch;state.relationshipWorldId=worldId;state.relationshipCampaignId=campaignId;state.relationshipLoading=true;state.relationshipLoaded=false;text(ui.status,'Beziehungen, Rufbereiche und Verfolgungen werden geladen …');show(ui.retry,false);
    try{
      const results=await Promise.all([state.repository.listCampaignRelationships(campaignId),state.repository.listWorldReputationScopes(worldId),state.repository.listCampaignReputations(campaignId),state.repository.listCampaignWarrants(campaignId),state.repository.listCampaignPursuits(campaignId),state.repository.listCampaignDisadvantageLinks(campaignId),Promise.allSettled([typeof state.repository.listWorldCreatures==='function'?state.repository.listWorldCreatures(worldId):Promise.resolve([]),typeof state.repository.listWorldPlaces==='function'?state.repository.listWorldPlaces(worldId):Promise.resolve([]),typeof state.repository.listWorldFactions==='function'?state.repository.listWorldFactions(worldId):Promise.resolve([])])]);
      if(serial!==state.relationshipLoadSerial||authEpoch!==state.authEpoch||campaignId!==state.selectedCampaignId)return;
      [state.relationships,state.reputationScopes,state.reputations,state.warrants,state.pursuits,state.disadvantageLinks]=results.slice(0,6).map(rows=>Array.isArray(rows)?rows:[]);const refs=results[6].map(result=>result.status==='fulfilled'&&Array.isArray(result.value)?result.value:[]);[state.phase6Creatures,state.phase6Places,state.phase6Factions]=refs;
      if(typeof state.repository.listCharacterRevision==='function'){
        const revisionRows=await Promise.allSettled((state.selectedData?.characters||[]).filter(row=>row.current_revision_id).map(row=>state.repository.listCharacterRevision(row.current_revision_id)));
        if(serial!==state.relationshipLoadSerial||authEpoch!==state.authEpoch||campaignId!==state.selectedCampaignId)return;
        for(const result of revisionRows)if(result.status==='fulfilled')for(const revision of result.value||[])if(revision?.id)state.revisionCache.set(revision.id,revision);
      }
      state.relationshipLoaded=true;renderRelationshipWorkspace(state);text(ui.status,`Bereit: ${state.relationships.filter(activeRow).length} Beziehungen, ${state.reputations.filter(activeRow).length} Rufwerte, ${state.warrants.filter(activeRow).length} Steckbriefe und ${state.pursuits.filter(activeRow).length} Verfolgungen.`);
    }catch(error){if(serial!==state.relationshipLoadSerial||authEpoch!==state.authEpoch)return;text(ui.status,friendlyError(error));show(ui.retry,true)}finally{if(serial===state.relationshipLoadSerial)state.relationshipLoading=false}
  }

  const phase7Lines=value=>String(value||'').split(/\r?\n/).map(entry=>entry.trim()).filter(Boolean);
  const phase7Text=value=>Array.isArray(value)?value.map(entry=>typeof entry==='string'?entry:entry?.text||JSON.stringify(entry)).join('\n'):'';
  const phase7Note=value=>value&&typeof value==='object'&&!Array.isArray(value)?String(value.notes||''):'';
  const phase7Number=value=>String(value??'').trim()===''?null:Number(value);
  function revokeWorldMediaUrls(state){for(const value of state.worldMediaObjectUrls?.values?.()||[])global.URL?.revokeObjectURL?.(value);state.worldMediaObjectUrls?.clear?.()}
  function resetPlaceWorkspace(state){state.placeLoadSerial=(state.placeLoadSerial||0)+1;state.placeLoaded=false;state.placeLoading=false;state.placeWorldId=null;state.placeCampaignId=null;state.places=[];state.placeTree=[];state.placeStates=[];state.effectivePlaceStates=[];state.placeDisclosures=[];state.placeStateDisclosures=[];state.tradeGoods=[];state.routes=[];state.placeLinks=[];state.placeCreatures=[];state.placeFactions=[];state.worldMedia=[];state.mediaDisclosures=[];state.mapArtifacts=[];state.mapRegions=[];state.mapRegionDraft=[];state.lastMapBrief=null;revokeWorldMediaUrls(state);state.selectedPlaceId=null;state.placeUi=null;clear(field(state.dialog,'[data-gm-panel="places"]'))}
  function phase7Section(panel,titleLabel,help){const section=document.createElement('section');section.className='gm-player-preview';section.append(heading('h4',titleLabel),note(help));panel.append(section);return section}
  function ensurePlaceWorkspace(state){
    const panel=field(state.dialog,'[data-gm-panel="places"]');if(!panel)return null;if(state.placeUi?.panel===panel)return state.placeUi;clear(panel);
    state.worldMedia=state.worldMedia||[];state.mediaDisclosures=state.mediaDisclosures||[];state.mapArtifacts=state.mapArtifacts||[];state.mapRegions=state.mapRegions||[];state.mapRegionDraft=state.mapRegionDraft||[];state.worldMediaObjectUrls=state.worldMediaObjectUrls||new Map;
    panel.append(heading('h3','Orte & Weltzustand'),note('Orte bilden eine beliebig tiefe gemeinsame Welthierarchie. Weltwahrheit, öffentliche Angaben sowie kampagnen- oder figurbezogenes Wissen bleiben getrennt.','notice'));
    const status=note('Orte und Weltzustände werden geladen …');status.setAttribute('role','status');const retry=button('Bereich erneut laden',()=>loadPlaceWorkspace(state,{force:true}));retry.hidden=true;panel.append(status,retry);
    const hierarchy=phase7Section(panel,'Ortshierarchie','Unterorte können beliebig tief verschachtelt werden. Der vollständige Pfad bleibt navigierbar.');const placeList=document.createElement('ul');placeList.dataset.gmPlaceTree='';hierarchy.append(placeList);
    const preview=phase7Section(panel,'Zwei Ansichten desselben Orts','Die ausführliche Lore und die kompakte Spieltischansicht lesen denselben Ortsdatensatz.');const loreView=document.createElement('article');loreView.dataset.gmPlaceLoreView='';const tableView=document.createElement('article');tableView.dataset.gmPlaceTableView='';preview.append(loreView,tableView);
    const placeSection=phase7Section(panel,'Ort bearbeiten','Öffentliche Felder dürfen weltweit sichtbar werden. Alle übrigen Felder bleiben Weltwahrheit der Spielleitung.');const placeForm=document.createElement('form');placeForm.dataset.gmPlaceDetailForm='';placeForm.append(hiddenInput('gmPlaceId'),hiddenInput('gmPlaceRevision'),labelControl('Übergeordneter Ort',select('gmPlaceParent',[])),labelControl('Ortstyp',select('gmPlaceType',[['world','Welt'],['continent','Kontinent'],['country','Land'],['region','Region'],['province','Provinz'],['settlement','Siedlung'],['district','Bezirk'],['building','Gebäude'],['room','Raum'],['landmark','Wahrzeichen'],['wilderness','Wildnis'],['forest','Wald'],['ruin','Ruine'],['cave','Höhle'],['road','Straße'],['harbor','Hafen'],['other','Sonstiges']])),labelControl('Interner Name',input('text','gmPlaceName',{required:true,maxLength:120})),labelControl('Grundsichtbarkeit',select('gmPlaceVisibility',[['secret','Geheim'],['public','Öffentlich']])),labelControl('Öffentlicher Name',input('text','gmPlacePublicName',{maxLength:160})),labelControl('Öffentliche Kurzbeschreibung',textarea('gmPlacePublicSummary',20000)),labelControl('Öffentliche Lore',textarea('gmPlacePublicLore',500000)),labelControl('Vollständige Lore',textarea('gmPlaceLore',500000)),labelControl('Geschichte',textarea('gmPlaceHistory',500000)),labelControl('Architektur',textarea('gmPlaceArchitecture',500000)),labelControl('Bevölkerung',textarea('gmPlacePopulation',500000)),labelControl('Kultur',textarea('gmPlaceCulture',500000)),labelControl('Atmosphäre',textarea('gmPlaceAtmosphere',500000)),labelControl('Am Spieltisch',textarea('gmPlaceTableNotes',500000)),labelControl('Regeln, Boni, Mali und Verbote – eine Zeile je Eintrag',textarea('gmPlaceRules',100000)),labelControl('Wirtschaft, Produktion und Preise',textarea('gmPlaceEconomy',100000)),labelControl('Reise, Zugänge und Kosten',textarea('gmPlaceTravel',100000)),labelControl('Dienstleistungen – eine Zeile je Eintrag',textarea('gmPlaceServices',100000)),labelControl('Geheime Spielleitungsinformationen',textarea('gmPlaceSecrets',500000)),labelControl('Optionale Kartenregion',input('text','gmPlaceMapRegion',{maxLength:500})),labelControl('Optionale X-Koordinate',input('number','gmPlaceX',{step:'any'})),labelControl('Optionale Y-Koordinate',input('number','gmPlaceY',{step:'any'})),labelControl('Sortierung',input('number','gmPlaceOrder',{value:0})),labelControl('Weitere GM-Notizen',textarea('gmPlaceNotes',100000)),submitButton('Ort speichern'));placeForm.addEventListener('submit',event=>{event.preventDefault();savePlaceDetail(state)});placeSection.append(placeForm);
    const stateSection=phase7Section(panel,'Zeitgültige Ortszustände','Alle wirksamen Zustände werden anhand des aktuellen Kampagnentags gefiltert; es wird keine konkurrierende Wahrheit still ausgewählt.');const stateList=document.createElement('ul');stateList.dataset.gmPlaceStates='';const stateForm=document.createElement('form');stateForm.dataset.gmPlaceStateForm='';stateForm.append(hiddenInput('gmPlaceStateId'),hiddenInput('gmPlaceStateRevision'),labelControl('Ort',select('gmPlaceStatePlace',[])),labelControl('Art',select('gmPlaceStateKind',[['access','Zugang'],['condition','Zustand'],['control','Kontrolle'],['danger','Gefahr'],['rule','Regel'],['economy','Wirtschaft'],['travel','Reise'],['atmosphere','Atmosphäre'],['service','Dienstleistung'],['other','Sonstiges']])),labelControl('Interne Bezeichnung',input('text','gmPlaceStateLabel',{required:true,maxLength:160})),labelControl('Interne Beschreibung',textarea('gmPlaceStateSummary',100000)),labelControl('Spieltischeffekte – eine Zeile je Eintrag',textarea('gmPlaceStateEffects',100000)),labelControl('Geheime Notizen',textarea('gmPlaceStateNotes',100000)),labelControl('Gültig ab Kampagnentag',input('number','gmPlaceStateFrom',{required:true,min:1,max:1000000,value:1})),labelControl('Gültig bis Kampagnentag (optional)',input('number','gmPlaceStateUntil',{min:1,max:1000000})),labelControl('Grundsichtbarkeit',select('gmPlaceStateVisibility',[['secret','Geheim'],['public','Öffentlich']])),labelControl('Öffentliche Bezeichnung',input('text','gmPlaceStatePublicLabel',{maxLength:160})),labelControl('Öffentliche Beschreibung',textarea('gmPlaceStatePublicSummary',100000)),labelControl('Öffentliche Effekte – eine Zeile je Eintrag',textarea('gmPlaceStatePublicEffects',100000)),labelControl('Quelle / Referenz',input('text','gmPlaceStateSource',{maxLength:2000})),submitButton('Ortszustand speichern'));stateForm.addEventListener('submit',event=>{event.preventDefault();savePlaceState(state)});stateSection.append(stateList,stateForm);
    const disclosureSection=phase7Section(panel,'Kampagnen- und Figurenwissen','Teilwissen benötigt einen eigenen sicheren Hinweis. Aus geheimen Feldern wird niemals automatisch ein Spielertext erzeugt.');const disclosureList=document.createElement('ul');disclosureList.dataset.gmPlaceDisclosures='';const disclosureForm=document.createElement('form');disclosureForm.dataset.gmPlaceDisclosureForm='';disclosureForm.append(hiddenInput('gmPlaceDisclosureId'),hiddenInput('gmPlaceDisclosureRevision'),labelControl('Ort',select('gmPlaceDisclosurePlace',[])),labelControl('Nur für diese Figur (optional)',select('gmPlaceDisclosureCharacter',[])),labelControl('Wissensstand',select('gmPlaceDisclosureKnowledge',[['partial','Teilweise bekannt'],['known','Bekannt']])),labelControl('Darstellung',select('gmPlaceDisclosureDetail',[['compact','Kompakt'],['full','Ausführlich']])),labelControl('Spielername',input('text','gmPlaceDisclosureName',{maxLength:160})),labelControl('Spieler-Kurzbeschreibung',textarea('gmPlaceDisclosureSummary',100000)),labelControl('Spieler-Lore',textarea('gmPlaceDisclosureLore',500000)),labelControl('Spieler-Spieltischhinweis',textarea('gmPlaceDisclosureTable',100000)),labelControl('Bekannte Regeln – eine Zeile je Eintrag',textarea('gmPlaceDisclosureRules',100000)),labelControl('Bekannte Wirtschaft',textarea('gmPlaceDisclosureEconomy',100000)),labelControl('Bekannte Reiseinformationen',textarea('gmPlaceDisclosureTravel',100000)),labelControl('Bekannt ab Kampagnentag',input('number','gmPlaceDisclosureDay',{required:true,min:1,max:1000000,value:1})),labelControl('Quelle / Referenz',input('text','gmPlaceDisclosureSource',{maxLength:2000})),submitButton('Ortswissen speichern'));disclosureForm.addEventListener('submit',event=>{event.preventDefault();savePlaceDisclosure(state)});disclosureSection.append(disclosureList,disclosureForm);
    const stateDisclosureSection=phase7Section(panel,'Bekannte Ortszustände','Geheime Zustände können für die Kampagne oder genau eine eigene Figur ausdrücklich freigegeben werden.');const stateDisclosureList=document.createElement('ul');stateDisclosureList.dataset.gmPlaceStateDisclosures='';const stateDisclosureForm=document.createElement('form');stateDisclosureForm.dataset.gmPlaceStateDisclosureForm='';stateDisclosureForm.append(hiddenInput('gmPlaceStateDisclosureId'),hiddenInput('gmPlaceStateDisclosureRevision'),labelControl('Ortszustand',select('gmPlaceStateDisclosureState',[])),labelControl('Nur für diese Figur (optional)',select('gmPlaceStateDisclosureCharacter',[])),labelControl('Wissensstand',select('gmPlaceStateDisclosureKnowledge',[['partial','Teilweise bekannt'],['known','Bekannt']])),labelControl('Spielerbezeichnung',input('text','gmPlaceStateDisclosureLabel',{maxLength:160})),labelControl('Spielerbeschreibung',textarea('gmPlaceStateDisclosureSummary',100000)),labelControl('Bekannte Effekte – eine Zeile je Eintrag',textarea('gmPlaceStateDisclosureEffects',100000)),labelControl('Bekannt ab Kampagnentag',input('number','gmPlaceStateDisclosureDay',{required:true,min:1,max:1000000,value:1})),labelControl('Quelle / Referenz',input('text','gmPlaceStateDisclosureSource',{maxLength:2000})),submitButton('Zustandswissen speichern'));stateDisclosureForm.addEventListener('submit',event=>{event.preventDefault();savePlaceStateDisclosure(state)});stateDisclosureSection.append(stateDisclosureList,stateDisclosureForm);
    const networkSection=phase7Section(panel,'Waren, Routen und Verknüpfungen','Handelswaren sind wirtschaftliche Weltreferenzen und keine Inventargegenstände. Konkrete Items oder automatische Wirkungen werden hier nicht angelegt.');const goodList=document.createElement('ul');goodList.dataset.gmTradeGoods='';const goodForm=document.createElement('form');goodForm.dataset.gmTradeGoodForm='';goodForm.append(hiddenInput('gmTradeGoodId'),hiddenInput('gmTradeGoodRevision'),labelControl('Warenbezeichnung',input('text','gmTradeGoodName',{required:true,maxLength:160})),labelControl('Beschreibung',textarea('gmTradeGoodSummary',100000)),labelControl('Handelsregeln',textarea('gmTradeGoodRules',100000)),labelControl('Geheime Notizen',textarea('gmTradeGoodNotes',100000)),submitButton('Handelsware speichern'));goodForm.addEventListener('submit',event=>{event.preventDefault();saveTradeGood(state)});
    const routeList=document.createElement('ul');routeList.dataset.gmRoutes='';const routeForm=document.createElement('form');routeForm.dataset.gmRouteForm='';routeForm.append(hiddenInput('gmRouteId'),hiddenInput('gmRouteRevision'),labelControl('Startort',select('gmRouteFrom',[])),labelControl('Zielort',select('gmRouteTo',[])),labelControl('Name',input('text','gmRouteName',{required:true,maxLength:160})),labelControl('Art',select('gmRouteKind',[['road','Straße'],['path','Pfad'],['river','Fluss'],['sea','Seeweg'],['air','Luftweg'],['portal','Portal'],['other','Sonstiges']])),labelControl('Minimale Reisetage',input('number','gmRouteMin',{min:0,max:1000000})),labelControl('Maximale Reisetage',input('number','gmRouteMax',{min:0,max:1000000})),labelControl('Reise- und Kostenhinweise',textarea('gmRouteCost',100000)),labelControl('Geheime Notizen',textarea('gmRouteNotes',100000)),submitButton('Route speichern'));routeForm.addEventListener('submit',event=>{event.preventDefault();saveRoute(state)});
    const linkList=document.createElement('ul');linkList.dataset.gmPlaceLinks='';const linkForm=document.createElement('form');linkForm.dataset.gmPlaceLinkForm='';const linkKind=select('gmPlaceLinkKind',[['creature','Wesen'],['faction','Fraktion'],['good','Handelsware'],['route','Route'],['event','Ereignisfolge']]);linkKind.addEventListener('change',()=>fillPlaceLinkTargets(state));linkForm.append(hiddenInput('gmPlaceLinkId'),hiddenInput('gmPlaceLinkRevision'),labelControl('Ort',select('gmPlaceLinkPlace',[])),labelControl('Verknüpfungsart',linkKind),labelControl('Ziel',select('gmPlaceLinkTarget',[])),labelControl('Rolle am Ort',input('text','gmPlaceLinkRole',{maxLength:160})),labelControl('Geheime Notiz',textarea('gmPlaceLinkNotes',100000)),submitButton('Verknüpfung speichern'));linkForm.addEventListener('submit',event=>{event.preventDefault();savePlaceLink(state)});networkSection.append(heading('h5','Handelswaren'),goodList,goodForm,heading('h5','Routen'),routeList,routeForm,heading('h5','Ortsverknüpfungen'),linkList,linkForm);
    const mediaSection=phase7Section(panel,'Bilder & Karten','PNG, JPEG und WebP bis 20 MiB werden privat gespeichert. Sichtbarkeit, Ortszuordnung und Spielertexte werden getrennt gepflegt; externe Kartenwerkzeuge bleiben optional.');
    const mediaList=document.createElement('ul');mediaList.dataset.gmWorldMedia='';
    const mediaForm=document.createElement('form');mediaForm.dataset.gmWorldMediaForm='';mediaForm.append(labelControl('Bilddatei',input('file','gmWorldMediaFile',{required:true,accept:'image/png,image/jpeg,image/webp'})),labelControl('Medienart',select('gmWorldMediaKind',[['place_image','Ortsbild'],['map_image','Karte']])),labelControl('Interner Titel',input('text','gmWorldMediaTitle',{required:true,maxLength:200})),labelControl('Interne Beschreibung',textarea('gmWorldMediaDescription',100000)),labelControl('Interner Alternativtext',textarea('gmWorldMediaAlt',4000)),labelControl('Grundsichtbarkeit',select('gmWorldMediaVisibility',[['secret','Geheim'],['public','Öffentlich']])),labelControl('Öffentlicher Titel',input('text','gmWorldMediaPublicTitle',{maxLength:200})),labelControl('Öffentliche Bildunterschrift',textarea('gmWorldMediaPublicCaption',100000)),labelControl('Öffentlicher Alternativtext',textarea('gmWorldMediaPublicAlt',4000)),labelControl('Ort',select('gmWorldMediaPlace',[])),labelControl('Rolle am Ort',select('gmWorldMediaRole',[['cover','Titelbild'],['gallery','Galerie'],['map','Karte']])),labelControl('Sortierung',input('number','gmWorldMediaOrder',{value:0})),submitButton('Bild privat hochladen'));mediaForm.addEventListener('submit',event=>{event.preventDefault();uploadWorldMedia(state)});
    const mediaDisclosureList=document.createElement('ul');mediaDisclosureList.dataset.gmMediaDisclosures='';
    const mediaDisclosureForm=document.createElement('form');mediaDisclosureForm.dataset.gmMediaDisclosureForm='';mediaDisclosureForm.append(labelControl('Bild',select('gmMediaDisclosureAsset',[])),labelControl('Nur für diese Figur (optional)',select('gmMediaDisclosureCharacter',[])),labelControl('Spielertitel',input('text','gmMediaDisclosureTitle',{required:true,maxLength:200})),labelControl('Spieler-Bildunterschrift',textarea('gmMediaDisclosureCaption',100000)),labelControl('Spieler-Alternativtext',textarea('gmMediaDisclosureAlt',4000)),labelControl('Bekannt ab Kampagnentag',input('number','gmMediaDisclosureDay',{required:true,min:1,max:1000000,value:1})),labelControl('Quelle / Referenz',input('text','gmMediaDisclosureSource',{maxLength:2000})),submitButton('Bild ausdrücklich freigeben'));mediaDisclosureForm.addEventListener('submit',event=>{event.preventDefault();saveMediaDisclosure(state)});
    const mapBriefForm=document.createElement('form');mapBriefForm.dataset.gmMapBriefForm='';mapBriefForm.append(labelControl('Wurzelort',select('gmMapBriefRoot',[])),labelControl('Arbeitstitel',input('text','gmMapBriefTitle',{required:true,maxLength:200,value:'Eberos-Kartenbrief'})),labelControl('Raster',select('gmMapBriefGrid',[['none','Kein Raster'],['square','Quadratraster'],['hex','Hexraster']])),submitButton('Reproduzierbaren Kartenbrief erzeugen'));mapBriefForm.addEventListener('submit',event=>{event.preventDefault();generateMapBrief(state)});
    const mapList=document.createElement('ul');mapList.dataset.gmMapArtifacts='';
    const mapForm=document.createElement('form');mapForm.dataset.gmMapArtifactForm='';mapForm.append(labelControl('Fertiges Kartenbild',select('gmMapArtifactAsset',[])),labelControl('Wurzelort',select('gmMapArtifactRoot',[])),labelControl('Externes Werkzeug',input('text','gmMapArtifactTool',{required:true,maxLength:160,value:'Canvas of Kings'})),labelControl('Bauanweisung (JSON)',textarea('gmMapArtifactInstruction',500000)),labelControl('Eingabe-Prüfsumme (SHA-256)',input('text','gmMapArtifactSha',{required:true,maxLength:64})),labelControl('Exportformat',select('gmMapArtifactFormat',[['png','PNG'],['jpeg','JPEG'],['webp','WebP']])),labelControl('Rasterdaten (JSON)',textarea('gmMapArtifactGrid',100000)),submitButton('Fertige Karte zuordnen'));mapForm.addEventListener('submit',event=>{event.preventDefault();saveMapArtifact(state)});
    const regionList=document.createElement('ul');regionList.dataset.gmMapRegions='';
    const regionForm=document.createElement('form');regionForm.dataset.gmMapRegionForm='';const regionGeometry=textarea('gmMapRegionGeometry',20000);regionGeometry.required=true;regionGeometry.value='[]';const regionCanvas=document.createElement('div');regionCanvas.className='gm-map-region-canvas';regionCanvas.dataset.gmMapRegionCanvas='';regionCanvas.hidden=true;const regionImage=document.createElement('img');regionImage.dataset.gmMapRegionImage='';regionImage.alt='Karte für die Bearbeitung interaktiver Regionen';const regionOverlay=document.createElementNS('http://www.w3.org/2000/svg','svg');regionOverlay.dataset.gmMapRegionOverlay='';regionOverlay.setAttribute('viewBox','0 0 1000 1000');regionOverlay.setAttribute('preserveAspectRatio','none');regionOverlay.setAttribute('aria-label','Normierte Kartenregionen');regionCanvas.append(regionImage,regionOverlay);const regionPointStatus=note('Noch keine Punkte gesetzt. Mindestens drei nicht kollineare Punkte sind erforderlich.');regionPointStatus.dataset.gmMapRegionPointStatus='';const undoRegionPoint=button('Letzten Punkt entfernen',()=>{state.mapRegionDraft.pop();syncMapRegionGeometry(state)});undoRegionPoint.type='button';const clearRegionPoints=button('Entwurf leeren',()=>{state.mapRegionDraft=[];syncMapRegionGeometry(state)});clearRegionPoints.type='button';regionForm.append(hiddenInput('gmMapRegionId'),hiddenInput('gmMapRegionRevision'),labelControl('Kartenartefakt',select('gmMapRegionMap',[])),labelControl('Verknüpfter Ort',select('gmMapRegionPlace',[])),labelControl('Sortierung',input('number','gmMapRegionOrder',{value:0,min:-1000000,max:1000000})),note('Klicke mindestens drei Eckpunkte auf der Karte oder bearbeite die normierten Punkte als JSON. Werte liegen zwischen 0 und 1; vorhandene Ortskoordinaten werden nicht übernommen.'),regionCanvas,regionPointStatus,undoRegionPoint,clearRegionPoints,labelControl('Normierte Punkte (JSON)',regionGeometry),submitButton('Interaktive Region speichern'));field(regionForm,'[data-gm-map-region-map]').addEventListener('change',()=>{state.mapRegionDraft=[];syncMapRegionGeometry(state);renderMapRegionEditor(state)});regionGeometry.addEventListener('input',()=>{try{const points=JSON.parse(regionGeometry.value);if(Array.isArray(points))state.mapRegionDraft=points.map(point=>({x:+point.x,y:+point.y}));renderMapRegionEditor(state)}catch{}});regionOverlay.addEventListener('click',event=>addMapRegionPoint(state,event));regionForm.addEventListener('submit',event=>{event.preventDefault();saveMapRegion(state)});
    mediaSection.append(heading('h5','Private Bilddateien'),mediaList,mediaForm,heading('h5','Ausdrückliche Spielerfreigaben'),mediaDisclosureList,mediaDisclosureForm,heading('h5','Externer Kartenablauf'),note('Der Kartenbrief ist ein reproduzierbarer Export. Ein Ausfall von Canvas of Kings oder eines anderen Editors verändert keine Ortsdaten.'),mapBriefForm,mapList,mapForm,heading('h5','Interaktive Kartenregionen'),note('Regionen ergänzen eine fertige Karte. Die Ortsliste bleibt immer der vollständige, barrierearme Ersatz.'),regionList,regionForm);
    state.placeUi={panel,status,retry,placeList,loreView,tableView,placeForm,stateList,stateForm,disclosureList,disclosureForm,stateDisclosureList,stateDisclosureForm,goodList,goodForm,routeList,routeForm,linkList,linkForm,mediaList,mediaForm,mediaDisclosureList,mediaDisclosureForm,mapBriefForm,mapList,mapForm,regionList,regionForm,regionCanvas,regionImage,regionOverlay,regionPointStatus,editorSections:[placeSection,stateSection,disclosureSection,stateDisclosureSection,networkSection,mediaSection]};return state.placeUi;
  }
  function phase7Set(form,marker,value){const control=field(form,`[data-${marker.replace(/[A-Z]/g,letter=>`-${letter.toLowerCase()}`)}]`);if(control)control.value=value??''}
  function fillPlaceOptions(state){const ui=ensurePlaceWorkspace(state),rows=state.placeTree.filter(activeRow),choices=rows.map(row=>option(row.place_id,`${'  '.repeat(Math.max(0,+row.depth||0))}${row.name}`)),characters=(state.selectedData?.characters||[]).filter(row=>['approved_locked','change_pending'].includes(row.status)).map(row=>option(row.id,row.public_data?.name||row.id));replaceOptions(field(ui.placeForm,'[data-gm-place-parent]'),choices,'Kein übergeordneter Ort');for(const formMarker of [[ui.stateForm,'[data-gm-place-state-place]'],[ui.disclosureForm,'[data-gm-place-disclosure-place]'],[ui.routeForm,'[data-gm-route-from]'],[ui.routeForm,'[data-gm-route-to]'],[ui.linkForm,'[data-gm-place-link-place]'],[ui.mediaForm,'[data-gm-world-media-place]'],[ui.mapBriefForm,'[data-gm-map-brief-root]'],[ui.mapForm,'[data-gm-map-artifact-root]'],[ui.regionForm,'[data-gm-map-region-place]']])replaceOptions(field(formMarker[0],formMarker[1]),choices,formMarker[1].includes('root')?'Gesamte Welt':'Ort auswählen');replaceOptions(field(ui.disclosureForm,'[data-gm-place-disclosure-character]'),characters,'Für alle Kampagnenmitglieder');replaceOptions(field(ui.stateDisclosureForm,'[data-gm-place-state-disclosure-character]'),characters,'Für alle Kampagnenmitglieder');replaceOptions(field(ui.mediaDisclosureForm,'[data-gm-media-disclosure-character]'),characters,'Für alle Kampagnenmitglieder');replaceOptions(field(ui.stateDisclosureForm,'[data-gm-place-state-disclosure-state]'),state.placeStates.filter(activeRow).map(row=>option(row.state_id,`${state.places.find(place=>place.place_id===row.place_id)?.name||'Ort'} · ${row.truth_label}`)),'Zustand auswählen');const mediaChoices=state.worldMedia.filter(activeRow).map(row=>option(row.asset_id,row.internal_title));replaceOptions(field(ui.mediaDisclosureForm,'[data-gm-media-disclosure-asset]'),mediaChoices,'Bild auswählen');replaceOptions(field(ui.mapForm,'[data-gm-map-artifact-asset]'),state.worldMedia.filter(row=>activeRow(row)&&row.media_kind==='map_image').map(row=>option(row.asset_id,row.internal_title)),'Kartenbild auswählen');replaceOptions(field(ui.regionForm,'[data-gm-map-region-map]'),state.mapArtifacts.filter(activeRow).map(row=>option(row.map_id,row.internal_title)),'Kartenartefakt auswählen');fillPlaceLinkTargets(state)}
  function fillPlaceLinkTargets(state){const ui=ensurePlaceWorkspace(state),kind=field(ui.linkForm,'[data-gm-place-link-kind]')?.value;let rows=[];if(kind==='creature')rows=state.placeCreatures.filter(activeRow).map(row=>option(creatureId(row),row.name));else if(kind==='faction')rows=state.placeFactions.filter(activeRow).map(row=>option(row.faction_id||row.id,row.name));else if(kind==='good')rows=state.tradeGoods.filter(activeRow).map(row=>option(row.good_id,row.name));else if(kind==='route')rows=state.routes.filter(activeRow).map(row=>option(row.route_id,row.name));else if(kind==='event')rows=(state.selectedData?.impacts||[]).map(row=>option(row.id,row.impact_summary||row.id));replaceOptions(field(ui.linkForm,'[data-gm-place-link-target]'),rows,'Ziel auswählen')}
  function renderPlacePreview(state,row){const ui=ensurePlaceWorkspace(state);clear(ui.loreView);clear(ui.tableView);if(!row){ui.loreView.append(note('Wähle einen Ort aus.'));ui.tableView.append(note('Keine kompakte Ansicht ausgewählt.'));return}ui.loreView.append(heading('h5',`Lore/Ausführlich · ${row.name}`));for(const [label,value] of [['Lore',row.lore],['Geschichte',row.history],['Architektur',row.architecture],['Bevölkerung',row.population],['Kultur',row.culture],['Atmosphäre',row.atmosphere]])if(String(value||'').trim())ui.loreView.append(heading('h6',label),note(value));ui.tableView.append(heading('h5',`Am Spieltisch · ${row.name}`),note(row.table_notes||'Keine kompakten Spieltischdaten.'));for(const rule of Array.isArray(row.rules)?row.rules:[])ui.tableView.append(item(typeof rule==='string'?rule:rule?.text||JSON.stringify(rule)));const effective=state.effectivePlaceStates.filter(entry=>entry.place_id===row.place_id);ui.tableView.append(heading('h6',`Wirksame Zustände an Tag ${state.selectedCampaign?.current_day||1}`));if(!effective.length)ui.tableView.append(note('Keine zeitgültigen Zustände.'));for(const entry of effective)ui.tableView.append(item(`${entry.truth_label} · ${entry.truth_summary||entry.state_kind}`))}
  function renderPlaceWorkspace(state){const ui=ensurePlaceWorkspace(state);fillPlaceOptions(state);clear(ui.placeList);for(const tree of state.placeTree){const row=state.places.find(place=>place.place_id===tree.place_id);if(!row)continue;const line=item(`${'↳ '.repeat(Math.max(0,+tree.depth||0))}${tree.name} · ${tree.place_type} · ${tree.status}`,button('Ausführlich & Spieltisch',()=>{state.selectedPlaceId=row.place_id;renderPlacePreview(state,row)}),button('Bearbeiten',()=>editPlace(state,row)));if(activeRow(row))line.append(button('Archivieren',()=>archivePlace(state,row),'danger'));ui.placeList.append(line)}if(!state.placeTree.length)ui.placeList.append(item('Noch keine Orte.'));renderPlacePreview(state,state.places.find(row=>row.place_id===state.selectedPlaceId)||state.places.find(activeRow)||null);renderPhase7Records(state);renderWorldMedia(state);}
  function renderPhase7Records(state){
    const ui=ensurePlaceWorkspace(state),placeName=id=>state.places.find(row=>row.place_id===id)?.name||id;
    clear(ui.stateList);
    for(const row of state.placeStates){
      const effective=state.effectivePlaceStates.some(entry=>entry.state_id===row.state_id);
      ui.stateList.append(item(`${placeName(row.place_id)} · ${row.truth_label} · Tag ${row.valid_from_day}${row.valid_until_day?`–${row.valid_until_day}`:'+'} · ${effective?'jetzt wirksam':'derzeit nicht wirksam'} · ${row.status}`,button('Bearbeiten',()=>editPlaceState(state,row)),...(activeRow(row)?[button('Archivieren',()=>archivePlaceState(state,row),'danger')]:[])));
    }
    if(!state.placeStates.length)ui.stateList.append(item('Noch keine Ortszustände.'));
    clear(ui.disclosureList);
    for(const row of state.placeDisclosures)ui.disclosureList.append(item(`${placeName(row.place_id)} · ${row.knowledge_level} · ${row.audience_character_id?'Figur':'Kampagne'} · ab Tag ${row.revealed_at_day} · ${row.status}`,button('Bearbeiten',()=>editPlaceDisclosure(state,row)),...(activeRow(row)?[button('Archivieren',()=>archivePlaceDisclosure(state,row),'danger')]:[])));
    if(!state.placeDisclosures.length)ui.disclosureList.append(item('Noch kein Ortswissen freigegeben.'));
    clear(ui.stateDisclosureList);
    for(const row of state.placeStateDisclosures){const source=state.placeStates.find(entry=>entry.state_id===row.place_state_id);ui.stateDisclosureList.append(item(`${source?.truth_label||row.place_state_id} · ${row.knowledge_level} · ab Tag ${row.revealed_at_day} · ${row.status}`,button('Bearbeiten',()=>editPlaceStateDisclosure(state,row)),...(activeRow(row)?[button('Archivieren',()=>archivePlaceStateDisclosure(state,row),'danger')]:[])))}
    if(!state.placeStateDisclosures.length)ui.stateDisclosureList.append(item('Noch kein Zustandswissen freigegeben.'));
    clear(ui.goodList);
    for(const row of state.tradeGoods)ui.goodList.append(item(`${row.name} · ${row.status}`,button('Bearbeiten',()=>editTradeGood(state,row)),...(activeRow(row)?[button('Archivieren',()=>archiveTradeGood(state,row),'danger')]:[])));
    if(!state.tradeGoods.length)ui.goodList.append(item('Noch keine Handelswaren-Referenzen.'));
    clear(ui.routeList);
    for(const row of state.routes)ui.routeList.append(item(`${row.name} · ${placeName(row.from_place_id)} → ${placeName(row.to_place_id)} · ${row.status}`,button('Bearbeiten',()=>editRoute(state,row)),...(activeRow(row)?[button('Archivieren',()=>archiveRoute(state,row),'danger')]:[])));
    if(!state.routes.length)ui.routeList.append(item('Noch keine Routen.'));
    clear(ui.linkList);
    for(const row of state.placeLinks)ui.linkList.append(item(`${placeName(row.place_id)} · ${row.link_kind} · ${row.target_label||row.target_id}${row.role_label?` · ${row.role_label}`:''} · ${row.status}`,...(activeRow(row)?[button('Archivieren',()=>archivePlaceLink(state,row),'danger')]:[])));
    if(!state.placeLinks.length)ui.linkList.append(item('Noch keine Ortsverknüpfungen.'));
  }
  async function phase12Sha256(value){const bytes=value instanceof ArrayBuffer?value:new TextEncoder().encode(String(value));const digest=await global.crypto.subtle.digest('SHA-256',bytes);return[...new Uint8Array(digest)].map(byte=>byte.toString(16).padStart(2,'0')).join('')}
  async function phase12ImageDimensions(file){if(typeof global.createImageBitmap==='function'){const bitmap=await global.createImageBitmap(file);try{return{width:bitmap.width,height:bitmap.height}}finally{bitmap.close?.()}}return await new Promise((resolve,reject)=>{const url=global.URL.createObjectURL(file),image=new Image;image.onload=()=>{global.URL.revokeObjectURL(url);resolve({width:image.naturalWidth,height:image.naturalHeight})};image.onerror=()=>{global.URL.revokeObjectURL(url);reject(new Error('Die Bildabmessungen konnten nicht sicher gelesen werden.'))};image.src=url})}
  const normalizedRegionPoint=point=>point&&Number.isFinite(+point.x)&&Number.isFinite(+point.y)&&+point.x>=0&&+point.x<=1&&+point.y>=0&&+point.y<=1;
  const mapRegionSvgPoints=points=>points.map(point=>`${(+point.x*1000).toFixed(3)},${(+point.y*1000).toFixed(3)}`).join(' ');
  function drawMapRegionShape(svg,points,{draft=false,label='Kartenregion'}={}){if(!Array.isArray(points)||!points.length)return;const shape=document.createElementNS('http://www.w3.org/2000/svg',points.length>=3?'polygon':'polyline');shape.setAttribute('points',mapRegionSvgPoints(points));shape.setAttribute('class',draft?'map-region-shape draft':'map-region-shape');shape.setAttribute('tabindex','0');shape.setAttribute('role','img');shape.setAttribute('aria-label',label);const title=document.createElementNS('http://www.w3.org/2000/svg','title');title.textContent=label;shape.append(title);svg.append(shape);if(draft)for(const point of points){const dot=document.createElementNS('http://www.w3.org/2000/svg','circle');dot.setAttribute('cx',(+point.x*1000).toFixed(3));dot.setAttribute('cy',(+point.y*1000).toFixed(3));dot.setAttribute('r','10');dot.setAttribute('class','map-region-point');svg.append(dot)}}
  function renderMapRegionEditor(state){const ui=ensurePlaceWorkspace(state),mapId=field(ui.regionForm,'[data-gm-map-region-map]').value,map=state.mapArtifacts.find(row=>row.map_id===mapId&&activeRow(row));clear(ui.regionOverlay);ui.regionCanvas.hidden=!map;if(!map){ui.regionImage.removeAttribute('src');text(ui.regionPointStatus,'Wähle zuerst ein aktives Kartenartefakt.');return}const asset=state.worldMedia.find(row=>row.asset_id===map.asset_id&&activeRow(row));ui.regionImage.alt=asset?.internal_alt_text||asset?.internal_title||'Karte für interaktive Regionen';for(const region of state.mapRegions.filter(row=>row.map_id===mapId&&activeRow(row)))drawMapRegionShape(ui.regionOverlay,region.geometry?.points,{label:`${region.place_name} · gespeicherte Region`});drawMapRegionShape(ui.regionOverlay,state.mapRegionDraft,{draft:true,label:'Aktueller Regionsentwurf'});text(ui.regionPointStatus,`${state.mapRegionDraft.length} von höchstens 64 Punkten gesetzt${state.mapRegionDraft.length>=3?' · bereit zum Speichern':' · mindestens drei erforderlich'}.`);const existing=state.worldMediaObjectUrls.get(map.asset_id)||state.worldMediaObjectUrls.get(`region:${map.asset_id}`);if(existing){ui.regionImage.src=existing;return}if(asset)state.repository.downloadWorldMediaObject(asset.bucket_id,asset.object_path).then(blob=>{if(!ui.regionImage.isConnected||field(ui.regionForm,'[data-gm-map-region-map]').value!==mapId)return;const url=global.URL.createObjectURL(blob);state.worldMediaObjectUrls.set(`region:${map.asset_id}`,url);ui.regionImage.src=url}).catch(()=>{ui.regionCanvas.hidden=true;text(ui.regionPointStatus,'Das Kartenbild konnte nicht geladen werden. Gespeicherte Ortslisten bleiben verfügbar.')})}
  function syncMapRegionGeometry(state){const ui=ensurePlaceWorkspace(state);field(ui.regionForm,'[data-gm-map-region-geometry]').value=JSON.stringify(state.mapRegionDraft,null,2);renderMapRegionEditor(state)}
  function addMapRegionPoint(state,event){if(state.mapRegionDraft.length>=64){text(state.message,'Eine Kartenregion darf höchstens 64 Punkte besitzen.');return}const rect=event.currentTarget.getBoundingClientRect();if(rect.width<=0||rect.height<=0)return;const x=Math.max(0,Math.min(1,(event.clientX-rect.left)/rect.width)),y=Math.max(0,Math.min(1,(event.clientY-rect.top)/rect.height));state.mapRegionDraft.push({x:+x.toFixed(6),y:+y.toFixed(6)});syncMapRegionGeometry(state)}
  function resetMapRegionForm(state){const ui=ensurePlaceWorkspace(state);ui.regionForm.reset();field(ui.regionForm,'[data-gm-map-region-id]').value='';field(ui.regionForm,'[data-gm-map-region-revision]').value='';field(ui.regionForm,'[data-gm-map-region-map]').disabled=false;field(ui.regionForm,'[data-gm-map-region-place]').disabled=false;state.mapRegionDraft=[];field(ui.regionForm,'[data-gm-map-region-geometry]').value='[]';renderMapRegionEditor(state)}
  function editMapRegion(state,row){const ui=ensurePlaceWorkspace(state);for(const [marker,value] of [['gmMapRegionId',row.region_id],['gmMapRegionRevision',row.revision],['gmMapRegionMap',row.map_id],['gmMapRegionPlace',row.place_id],['gmMapRegionOrder',row.display_order]])phase7Set(ui.regionForm,marker,value);field(ui.regionForm,'[data-gm-map-region-map]').disabled=true;field(ui.regionForm,'[data-gm-map-region-place]').disabled=true;state.mapRegionDraft=Array.isArray(row.geometry?.points)?structuredClone(row.geometry.points):[];syncMapRegionGeometry(state)}
  async function saveMapRegion(state){const ui=ensurePlaceWorkspace(state);let points;try{points=JSON.parse(field(ui.regionForm,'[data-gm-map-region-geometry]').value||'[]')}catch{text(state.message,'Die normierten Punkte müssen gültiges JSON sein.');return}if(!Array.isArray(points)||points.length<3||points.length>64||points.some(point=>!normalizedRegionPoint(point))){text(state.message,'Eine Region benötigt 3 bis 64 normierte Punkte zwischen 0 und 1.');return}try{await runBusy(state,async()=>{await state.repository.saveWorldMapRegion(state.selectedCampaign.world_id,{regionId:field(ui.regionForm,'[data-gm-map-region-id]').value||null,expectedRevision:phase7Number(field(ui.regionForm,'[data-gm-map-region-revision]').value),mapId:field(ui.regionForm,'[data-gm-map-region-map]').value,placeId:field(ui.regionForm,'[data-gm-map-region-place]').value,geometry:{type:'polygon',points:points.map(point=>({x:+point.x,y:+point.y}))},displayOrder:+field(ui.regionForm,'[data-gm-map-region-order]').value||0});resetMapRegionForm(state);await loadPlaceWorkspace(state,{force:true});text(state.message,'Interaktive Kartenregion mit stabiler Karten- und Orts-ID gespeichert.')})}catch{}}
  async function archiveMapRegion(state,row){try{await runBusy(state,async()=>{await state.repository.saveWorldMapRegion(row.world_id,{regionId:row.region_id,expectedRevision:row.revision,mapId:row.map_id,placeId:row.place_id,geometry:row.geometry,displayOrder:row.display_order,archived:true});await loadPlaceWorkspace(state,{force:true})})}catch{}}
  function renderMapRegions(state){const ui=ensurePlaceWorkspace(state);clear(ui.regionList);for(const row of state.mapRegions)ui.regionList.append(item(`${row.map_title} · ${row.place_name} · ${row.geometry?.points?.length||0} Punkte · ${row.status}`,...(activeRow(row)?[button('Bearbeiten',()=>editMapRegion(state,row)),button('Archivieren',()=>archiveMapRegion(state,row),'danger')]:[])));if(!state.mapRegions.length)ui.regionList.append(item('Noch keine interaktiven Kartenregionen.'));const mapSelect=field(ui.regionForm,'[data-gm-map-region-map]');if(!mapSelect.value&&state.mapArtifacts.some(activeRow))mapSelect.value=state.mapArtifacts.find(activeRow).map_id;renderMapRegionEditor(state)}
  function renderWorldMedia(state){const ui=ensurePlaceWorkspace(state);clear(ui.mediaList);revokeWorldMediaUrls(state);state.worldMediaObjectUrls=state.worldMediaObjectUrls||new Map;for(const row of state.worldMedia){const links=Array.isArray(row.place_links)?row.place_links:[],line=item(`${row.internal_title} · ${row.media_kind} · ${row.mime_type} · ${Math.ceil((+row.size_bytes||0)/1024)} KiB · ${row.visibility} · ${row.status}${links.length?` · ${links.length} Ortszuordnung(en)`:''}`);if(activeRow(row)){const preview=document.createElement('img');preview.alt=row.internal_alt_text||row.internal_title;preview.loading='lazy';preview.width=180;line.append(preview,button('Archivieren',()=>archiveWorldMedia(state,row),'danger'));state.repository.downloadWorldMediaObject(row.bucket_id,row.object_path).then(blob=>{if(!preview.isConnected||!activeRow(row))return;const url=global.URL.createObjectURL(blob);state.worldMediaObjectUrls.set(row.asset_id,url);preview.src=url}).catch(()=>{preview.remove()})}ui.mediaList.append(line)}if(!state.worldMedia.length)ui.mediaList.append(item('Noch keine privaten Bilder.'));clear(ui.mediaDisclosureList);for(const row of state.mediaDisclosures)ui.mediaDisclosureList.append(item(`${row.internal_title} · ${row.audience_character_id?'Figur':'Kampagne'} · ab Tag ${row.revealed_at_day} · ${row.status}`,...(activeRow(row)?[button('Freigabe archivieren',()=>archiveMediaDisclosure(state,row),'danger')]:[])));if(!state.mediaDisclosures.length)ui.mediaDisclosureList.append(item('Noch keine ausdrücklichen Bildfreigaben.'));clear(ui.mapList);for(const row of state.mapArtifacts)ui.mapList.append(item(`${row.internal_title} · ${row.external_tool} · ${row.export_format.toUpperCase()} · ${row.status}`,...(activeRow(row)?[button('Kartenzuordnung archivieren',()=>archiveMapArtifact(state,row),'danger')]:[])));if(!state.mapArtifacts.length)ui.mapList.append(item('Noch keine fertige Karte zugeordnet.'));renderMapRegions(state)}
  async function uploadWorldMedia(state){const form=ensurePlaceWorkspace(state).mediaForm,file=field(form,'[data-gm-world-media-file]').files?.[0],allowed=new Set(['image/png','image/jpeg','image/webp']);if(!file||!allowed.has(file.type)||file.size<1||file.size>20*1024*1024){text(state.message,'Bitte wähle eine PNG-, JPEG- oder WebP-Datei bis 20 MiB.');return}try{await runBusy(state,async()=>{const buffer=await file.arrayBuffer(),sha256=await phase12Sha256(buffer),dimensions=await phase12ImageDimensions(file),worldId=state.selectedCampaign.world_id,reservationRaw=await state.repository.reserveWorldMediaUpload(worldId,{mediaKind:field(form,'[data-gm-world-media-kind]').value,mimeType:file.type,sizeBytes:file.size,sha256}),reservation=Array.isArray(reservationRaw)?reservationRaw[0]:reservationRaw;await state.repository.uploadWorldMediaObject(reservation.bucket_id,reservation.object_path,file,{contentType:file.type});const assetRaw=await state.repository.finalizeWorldMediaUpload(worldId,reservation.intent_id,{internalTitle:field(form,'[data-gm-world-media-title]').value,internalDescription:field(form,'[data-gm-world-media-description]').value,internalAltText:field(form,'[data-gm-world-media-alt]').value,visibility:field(form,'[data-gm-world-media-visibility]').value,publicTitle:field(form,'[data-gm-world-media-public-title]').value,publicCaption:field(form,'[data-gm-world-media-public-caption]').value,publicAltText:field(form,'[data-gm-world-media-public-alt]').value,widthPixels:dimensions.width,heightPixels:dimensions.height}),asset=Array.isArray(assetRaw)?assetRaw[0]:assetRaw,placeId=field(form,'[data-gm-world-media-place]').value;if(placeId)await state.repository.saveWorldPlaceMediaLink(worldId,{assetId:asset.asset_id,placeId,mediaRole:field(form,'[data-gm-world-media-role]').value,displayOrder:+field(form,'[data-gm-world-media-order]').value||0});form.reset();await loadPlaceWorkspace(state,{force:true});text(state.message,'Bild privat gespeichert und kontrolliert zugeordnet.')})}catch{}}
  async function archiveWorldMedia(state,row){if(typeof global.confirm==='function'&&!global.confirm('Bild archivieren und aus allen Spieleransichten entfernen?'))return;try{await runBusy(state,async()=>{await state.repository.saveWorldMediaAsset(row.world_id,{assetId:row.asset_id,expectedRevision:row.revision,internalTitle:row.internal_title,internalDescription:row.internal_description,internalAltText:row.internal_alt_text,visibility:row.visibility,publicTitle:row.public_title,publicCaption:row.public_caption,publicAltText:row.public_alt_text,archived:true});await loadPlaceWorkspace(state,{force:true})})}catch{}}
  async function saveMediaDisclosure(state){const form=ensurePlaceWorkspace(state).mediaDisclosureForm;try{await runBusy(state,async()=>{await state.repository.saveCampaignMediaDisclosure(state.selectedCampaignId,{assetId:field(form,'[data-gm-media-disclosure-asset]').value,audienceCharacterId:field(form,'[data-gm-media-disclosure-character]').value||null,playerTitle:field(form,'[data-gm-media-disclosure-title]').value,playerCaption:field(form,'[data-gm-media-disclosure-caption]').value,playerAltText:field(form,'[data-gm-media-disclosure-alt]').value,revealedAtDay:+field(form,'[data-gm-media-disclosure-day]').value||1,sourceReference:field(form,'[data-gm-media-disclosure-source]').value});form.reset();await loadPlaceWorkspace(state,{force:true});text(state.message,'Bild mit eigenem Spielertext ausdrücklich freigegeben.')})}catch{}}
  async function archiveMediaDisclosure(state,row){try{await runBusy(state,async()=>{await state.repository.saveCampaignMediaDisclosure(state.selectedCampaignId,{disclosureId:row.disclosure_id,expectedRevision:row.revision,assetId:row.asset_id,audienceCharacterId:row.audience_character_id,playerTitle:row.player_title,playerCaption:row.player_caption,playerAltText:row.player_alt_text,revealedAtDay:row.revealed_at_day,sourceReference:row.source_reference,archived:true});await loadPlaceWorkspace(state,{force:true})})}catch{}}
  function phase12MapPlaces(state,rootId){const allowed=new Set;for(const tree of state.placeTree.filter(activeRow)){if(!rootId||tree.place_id===rootId||(Array.isArray(tree.path_ids)&&tree.path_ids.includes(rootId)))allowed.add(tree.place_id)}return state.placeTree.filter(tree=>allowed.has(tree.place_id)).map(tree=>{const place=state.places.find(row=>row.place_id===tree.place_id)||{};return{place_id:tree.place_id,parent_place_id:tree.parent_place_id||null,revision:+place.revision||+tree.revision||0,name:tree.name,place_type:tree.place_type,display_order:+tree.display_order||0,path_ids:tree.path_ids||[],map_region:place.map_region||'',coordinates:place.coordinates||null,architecture:place.architecture||'',atmosphere:place.atmosphere||'',travel:place.travel||{}}})}
  async function generateMapBrief(state){const form=ensurePlaceWorkspace(state).mapBriefForm,rootId=field(form,'[data-gm-map-brief-root]').value||null,brief={format:'eberos-map-brief-v1',world_id:state.selectedCampaign.world_id,root_place_id:rootId,title:field(form,'[data-gm-map-brief-title]').value,grid:{type:field(form,'[data-gm-map-brief-grid]').value},places:phase12MapPlaces(state,rootId)};const serialized=JSON.stringify(brief,null,2),sha256=await phase12Sha256(serialized);state.lastMapBrief={brief,serialized,sha256};const mapForm=ensurePlaceWorkspace(state).mapForm;field(mapForm,'[data-gm-map-artifact-root]').value=rootId||'';field(mapForm,'[data-gm-map-artifact-instruction]').value=serialized;field(mapForm,'[data-gm-map-artifact-sha]').value=sha256;field(mapForm,'[data-gm-map-artifact-grid]').value=JSON.stringify(brief.grid,null,2);const blob=new Blob([serialized],{type:'application/json'}),url=global.URL.createObjectURL(blob),anchor=document.createElement('a');anchor.href=url;anchor.download=`eberos-map-brief-${rootId||'world'}-${sha256.slice(0,12)}.json`;anchor.click?.();global.URL.revokeObjectURL(url);text(state.message,`Kartenbrief mit ${brief.places.length} stabilen Orts-IDs erzeugt; SHA-256 ${sha256}.`)}
  async function saveMapArtifact(state){const form=ensurePlaceWorkspace(state).mapForm;try{const buildInstruction=JSON.parse(field(form,'[data-gm-map-artifact-instruction]').value||'{}'),gridData=JSON.parse(field(form,'[data-gm-map-artifact-grid]').value||'{}');await runBusy(state,async()=>{await state.repository.saveWorldMapArtifact(state.selectedCampaign.world_id,{assetId:field(form,'[data-gm-map-artifact-asset]').value,rootPlaceId:field(form,'[data-gm-map-artifact-root]').value||null,externalTool:field(form,'[data-gm-map-artifact-tool]').value,buildInstruction,inputSha256:field(form,'[data-gm-map-artifact-sha]').value,exportFormat:field(form,'[data-gm-map-artifact-format]').value,gridData});form.reset();await loadPlaceWorkspace(state,{force:true});text(state.message,'Fertige Karte dem reproduzierbaren Kartenbrief zugeordnet.')})}catch(error){text(state.message,error instanceof SyntaxError?'Bauanweisung und Rasterdaten müssen gültiges JSON sein.':friendlyError(error))}}
  async function archiveMapArtifact(state,row){try{await runBusy(state,async()=>{await state.repository.saveWorldMapArtifact(row.world_id,{mapId:row.map_id,expectedRevision:row.revision,assetId:row.asset_id,rootPlaceId:row.root_place_id,externalTool:row.external_tool,buildInstruction:row.build_instruction,inputSha256:row.input_sha256,exportFormat:row.export_format,gridData:row.grid_data,archived:true});await loadPlaceWorkspace(state,{force:true})})}catch{}}
  function editPlace(state,row){const f=ensurePlaceWorkspace(state).placeForm;for(const [m,v] of [['gmPlaceId',row.place_id],['gmPlaceRevision',row.revision],['gmPlaceParent',row.parent_place_id],['gmPlaceType',row.place_type],['gmPlaceName',row.name],['gmPlaceVisibility',row.visibility],['gmPlacePublicName',row.public_name],['gmPlacePublicSummary',row.public_summary],['gmPlacePublicLore',row.public_lore],['gmPlaceLore',row.lore],['gmPlaceHistory',row.history],['gmPlaceArchitecture',row.architecture],['gmPlacePopulation',row.population],['gmPlaceCulture',row.culture],['gmPlaceAtmosphere',row.atmosphere],['gmPlaceTableNotes',row.table_notes],['gmPlaceRules',phase7Text(row.rules)],['gmPlaceEconomy',phase7Note(row.economy)],['gmPlaceTravel',phase7Note(row.travel)],['gmPlaceServices',phase7Text(row.services)],['gmPlaceSecrets',row.secrets],['gmPlaceMapRegion',row.map_region],['gmPlaceX',row.coordinates?.x],['gmPlaceY',row.coordinates?.y],['gmPlaceOrder',row.display_order],['gmPlaceNotes',row.gm_notes]])phase7Set(f,m,v);field(f,'[data-gm-place-parent]').querySelector(`option[value="${row.place_id}"]`)?.remove();state.selectedPlaceId=row.place_id;renderPlacePreview(state,row)}
  function placeChanges(state,form){const x=phase7Number(field(form,'[data-gm-place-x]').value),y=phase7Number(field(form,'[data-gm-place-y]').value),placeId=field(form,'[data-gm-place-id]').value||null,existing=state.places.find(row=>row.place_id===placeId);return{placeId,expectedRevision:phase7Number(field(form,'[data-gm-place-revision]').value),parentPlaceId:field(form,'[data-gm-place-parent]').value||null,placeType:field(form,'[data-gm-place-type]').value,name:field(form,'[data-gm-place-name]').value,visibility:field(form,'[data-gm-place-visibility]').value,publicName:field(form,'[data-gm-place-public-name]').value,publicSummary:field(form,'[data-gm-place-public-summary]').value,publicLore:field(form,'[data-gm-place-public-lore]').value,lore:field(form,'[data-gm-place-lore]').value,history:field(form,'[data-gm-place-history]').value,architecture:field(form,'[data-gm-place-architecture]').value,population:field(form,'[data-gm-place-population]').value,culture:field(form,'[data-gm-place-culture]').value,atmosphere:field(form,'[data-gm-place-atmosphere]').value,tableNotes:field(form,'[data-gm-place-table-notes]').value,rules:phase7Lines(field(form,'[data-gm-place-rules]').value),economy:{notes:field(form,'[data-gm-place-economy]').value},travel:{notes:field(form,'[data-gm-place-travel]').value},services:phase7Lines(field(form,'[data-gm-place-services]').value),media:Array.isArray(existing?.media)?existing.media:[],secrets:field(form,'[data-gm-place-secrets]').value,mapRegion:field(form,'[data-gm-place-map-region]').value,coordinates:x===null&&y===null?null:{x,y},displayOrder:+field(form,'[data-gm-place-order]').value||0,gmNotes:field(form,'[data-gm-place-notes]').value}}
  async function savePlaceDetail(state){const f=ensurePlaceWorkspace(state).placeForm,changes=placeChanges(state,f);try{await runBusy(state,async()=>{await state.repository.saveWorldPlaceDetail(state.selectedCampaign.world_id,changes);f.reset();await loadPlaceWorkspace(state,{force:true});text(state.message,`Ort „${changes.name}“ gespeichert.`)})}catch{}}
  async function archivePlace(state,row){if(!global.confirm?.(`Ort „${row.name}“ archivieren? Aktive Unterorte und Wesen müssen vorher verschoben werden.`))return;try{await runBusy(state,async()=>{await state.repository.saveWorldPlaceDetail(row.world_id,{...row,placeId:row.place_id,expectedRevision:row.revision,parentPlaceId:row.parent_place_id,placeType:row.place_type,publicName:row.public_name,publicSummary:row.public_summary,publicLore:row.public_lore,tableNotes:row.table_notes,mapRegion:row.map_region,displayOrder:row.display_order,gmNotes:row.gm_notes,archived:true});await loadPlaceWorkspace(state,{force:true})})}catch{}}
  function stateChanges(f,row=null){return{stateId:row?.state_id||field(f,'[data-gm-place-state-id]').value||null,expectedRevision:row?.revision??phase7Number(field(f,'[data-gm-place-state-revision]').value),placeId:row?.place_id||field(f,'[data-gm-place-state-place]').value,stateKind:row?.state_kind||field(f,'[data-gm-place-state-kind]').value,truthLabel:row?.truth_label||field(f,'[data-gm-place-state-label]').value,truthSummary:row?.truth_summary??field(f,'[data-gm-place-state-summary]').value,tableEffects:row?.table_effects||phase7Lines(field(f,'[data-gm-place-state-effects]').value),gmNotes:row?.gm_notes??field(f,'[data-gm-place-state-notes]').value,validFromDay:row?.valid_from_day||+field(f,'[data-gm-place-state-from]').value,validUntilDay:row?.valid_until_day??phase7Number(field(f,'[data-gm-place-state-until]').value),visibility:row?.visibility||field(f,'[data-gm-place-state-visibility]').value,publicLabel:row?.public_label??field(f,'[data-gm-place-state-public-label]').value,publicSummary:row?.public_summary??field(f,'[data-gm-place-state-public-summary]').value,publicTableEffects:row?.public_table_effects||phase7Lines(field(f,'[data-gm-place-state-public-effects]').value),sourceReference:row?.source_reference??field(f,'[data-gm-place-state-source]').value}}
  function editPlaceState(state,row){const f=ensurePlaceWorkspace(state).stateForm;for(const [m,v] of [['gmPlaceStateId',row.state_id],['gmPlaceStateRevision',row.revision],['gmPlaceStatePlace',row.place_id],['gmPlaceStateKind',row.state_kind],['gmPlaceStateLabel',row.truth_label],['gmPlaceStateSummary',row.truth_summary],['gmPlaceStateEffects',phase7Text(row.table_effects)],['gmPlaceStateNotes',row.gm_notes],['gmPlaceStateFrom',row.valid_from_day],['gmPlaceStateUntil',row.valid_until_day],['gmPlaceStateVisibility',row.visibility],['gmPlaceStatePublicLabel',row.public_label],['gmPlaceStatePublicSummary',row.public_summary],['gmPlaceStatePublicEffects',phase7Text(row.public_table_effects)],['gmPlaceStateSource',row.source_reference]])phase7Set(f,m,v)}
  async function savePlaceState(state){const f=ensurePlaceWorkspace(state).stateForm,changes=stateChanges(f);try{await runBusy(state,async()=>{await state.repository.saveWorldPlaceState(state.selectedCampaign.world_id,changes);f.reset();await loadPlaceWorkspace(state,{force:true});text(state.message,'Ortszustand gespeichert und für den Kampagnentag neu aufgelöst.')})}catch{}}
  async function archivePlaceState(state,row){try{await runBusy(state,async()=>{await state.repository.saveWorldPlaceState(row.world_id,{...stateChanges(ensurePlaceWorkspace(state).stateForm,row),archived:true});await loadPlaceWorkspace(state,{force:true})})}catch{}}
  function editPlaceDisclosure(state,row){const f=ensurePlaceWorkspace(state).disclosureForm;for(const [m,v] of [['gmPlaceDisclosureId',row.disclosure_id],['gmPlaceDisclosureRevision',row.revision],['gmPlaceDisclosurePlace',row.place_id],['gmPlaceDisclosureCharacter',row.audience_character_id],['gmPlaceDisclosureKnowledge',row.knowledge_level],['gmPlaceDisclosureDetail',row.detail_level],['gmPlaceDisclosureName',row.player_name],['gmPlaceDisclosureSummary',row.player_summary],['gmPlaceDisclosureLore',row.player_lore],['gmPlaceDisclosureTable',row.player_table_notes],['gmPlaceDisclosureRules',phase7Text(row.player_rules)],['gmPlaceDisclosureEconomy',phase7Note(row.player_economy)],['gmPlaceDisclosureTravel',phase7Note(row.player_travel)],['gmPlaceDisclosureDay',row.revealed_at_day],['gmPlaceDisclosureSource',row.source_reference]])phase7Set(f,m,v)}
  function disclosureChanges(f,row=null){return{disclosureId:row?.disclosure_id||field(f,'[data-gm-place-disclosure-id]').value||null,expectedRevision:row?.revision??phase7Number(field(f,'[data-gm-place-disclosure-revision]').value),placeId:row?.place_id||field(f,'[data-gm-place-disclosure-place]').value,audienceCharacterId:row?.audience_character_id??(field(f,'[data-gm-place-disclosure-character]').value||null),knowledgeLevel:row?.knowledge_level||field(f,'[data-gm-place-disclosure-knowledge]').value,detailLevel:row?.detail_level||field(f,'[data-gm-place-disclosure-detail]').value,playerName:row?.player_name??field(f,'[data-gm-place-disclosure-name]').value,playerSummary:row?.player_summary??field(f,'[data-gm-place-disclosure-summary]').value,playerLore:row?.player_lore??field(f,'[data-gm-place-disclosure-lore]').value,playerTableNotes:row?.player_table_notes??field(f,'[data-gm-place-disclosure-table]').value,playerRules:row?.player_rules||phase7Lines(field(f,'[data-gm-place-disclosure-rules]').value),playerEconomy:row?.player_economy||{notes:field(f,'[data-gm-place-disclosure-economy]').value},playerTravel:row?.player_travel||{notes:field(f,'[data-gm-place-disclosure-travel]').value},revealedAtDay:row?.revealed_at_day||+field(f,'[data-gm-place-disclosure-day]').value,sourceReference:row?.source_reference??field(f,'[data-gm-place-disclosure-source]').value}}
  async function savePlaceDisclosure(state){const f=ensurePlaceWorkspace(state).disclosureForm;try{await runBusy(state,async()=>{await state.repository.saveCampaignPlaceDisclosure(state.selectedCampaignId,disclosureChanges(f));f.reset();await loadPlaceWorkspace(state,{force:true});text(state.message,'Ortswissen ausdrücklich freigegeben.')})}catch{}}
  async function archivePlaceDisclosure(state,row){try{await runBusy(state,async()=>{await state.repository.saveCampaignPlaceDisclosure(state.selectedCampaignId,{...disclosureChanges(ensurePlaceWorkspace(state).disclosureForm,row),archived:true});await loadPlaceWorkspace(state,{force:true})})}catch{}}
  function editPlaceStateDisclosure(state,row){const f=ensurePlaceWorkspace(state).stateDisclosureForm;for(const [m,v] of [['gmPlaceStateDisclosureId',row.disclosure_id],['gmPlaceStateDisclosureRevision',row.revision],['gmPlaceStateDisclosureState',row.place_state_id],['gmPlaceStateDisclosureCharacter',row.audience_character_id],['gmPlaceStateDisclosureKnowledge',row.knowledge_level],['gmPlaceStateDisclosureLabel',row.player_label],['gmPlaceStateDisclosureSummary',row.player_summary],['gmPlaceStateDisclosureEffects',phase7Text(row.player_table_effects)],['gmPlaceStateDisclosureDay',row.revealed_at_day],['gmPlaceStateDisclosureSource',row.source_reference]])phase7Set(f,m,v)}
  function stateDisclosureChanges(f,row=null){return{disclosureId:row?.disclosure_id||field(f,'[data-gm-place-state-disclosure-id]').value||null,expectedRevision:row?.revision??phase7Number(field(f,'[data-gm-place-state-disclosure-revision]').value),placeStateId:row?.place_state_id||field(f,'[data-gm-place-state-disclosure-state]').value,audienceCharacterId:row?.audience_character_id??(field(f,'[data-gm-place-state-disclosure-character]').value||null),knowledgeLevel:row?.knowledge_level||field(f,'[data-gm-place-state-disclosure-knowledge]').value,playerLabel:row?.player_label??field(f,'[data-gm-place-state-disclosure-label]').value,playerSummary:row?.player_summary??field(f,'[data-gm-place-state-disclosure-summary]').value,playerTableEffects:row?.player_table_effects||phase7Lines(field(f,'[data-gm-place-state-disclosure-effects]').value),revealedAtDay:row?.revealed_at_day||+field(f,'[data-gm-place-state-disclosure-day]').value,sourceReference:row?.source_reference??field(f,'[data-gm-place-state-disclosure-source]').value}}
  async function savePlaceStateDisclosure(state){const f=ensurePlaceWorkspace(state).stateDisclosureForm;try{await runBusy(state,async()=>{await state.repository.saveCampaignPlaceStateDisclosure(state.selectedCampaignId,stateDisclosureChanges(f));f.reset();await loadPlaceWorkspace(state,{force:true});text(state.message,'Zustandswissen ausdrücklich freigegeben.')})}catch{}}
  async function archivePlaceStateDisclosure(state,row){try{await runBusy(state,async()=>{await state.repository.saveCampaignPlaceStateDisclosure(state.selectedCampaignId,{...stateDisclosureChanges(ensurePlaceWorkspace(state).stateDisclosureForm,row),archived:true});await loadPlaceWorkspace(state,{force:true})})}catch{}}
  function editTradeGood(state,row){const f=ensurePlaceWorkspace(state).goodForm;for(const [m,v] of [['gmTradeGoodId',row.good_id],['gmTradeGoodRevision',row.revision],['gmTradeGoodName',row.name],['gmTradeGoodSummary',row.summary],['gmTradeGoodRules',phase7Note(row.trade_rules)],['gmTradeGoodNotes',row.gm_notes]])phase7Set(f,m,v)}
  function goodChanges(f,row=null){return{goodId:row?.good_id||field(f,'[data-gm-trade-good-id]').value||null,expectedRevision:row?.revision??phase7Number(field(f,'[data-gm-trade-good-revision]').value),name:row?.name||field(f,'[data-gm-trade-good-name]').value,summary:row?.summary??field(f,'[data-gm-trade-good-summary]').value,tradeRules:row?.trade_rules||{notes:field(f,'[data-gm-trade-good-rules]').value},gmNotes:row?.gm_notes??field(f,'[data-gm-trade-good-notes]').value}}
  async function saveTradeGood(state){const f=ensurePlaceWorkspace(state).goodForm;try{await runBusy(state,async()=>{await state.repository.saveWorldTradeGood(state.selectedCampaign.world_id,goodChanges(f));f.reset();await loadPlaceWorkspace(state,{force:true})})}catch{}}
  async function archiveTradeGood(state,row){try{await runBusy(state,async()=>{await state.repository.saveWorldTradeGood(row.world_id,{...goodChanges(ensurePlaceWorkspace(state).goodForm,row),archived:true});await loadPlaceWorkspace(state,{force:true})})}catch{}}
  function editRoute(state,row){const f=ensurePlaceWorkspace(state).routeForm;for(const [m,v] of [['gmRouteId',row.route_id],['gmRouteRevision',row.revision],['gmRouteFrom',row.from_place_id],['gmRouteTo',row.to_place_id],['gmRouteName',row.name],['gmRouteKind',row.route_kind],['gmRouteMin',row.travel_days_min],['gmRouteMax',row.travel_days_max],['gmRouteCost',row.cost_notes],['gmRouteNotes',row.gm_notes]])phase7Set(f,m,v);field(f,'[data-gm-route-from]').disabled=true;field(f,'[data-gm-route-to]').disabled=true;field(f,'[data-gm-route-from]').dataset.gmPermanentDisabled='true';field(f,'[data-gm-route-to]').dataset.gmPermanentDisabled='true'}
  function routeChanges(f,row=null){return{routeId:row?.route_id||field(f,'[data-gm-route-id]').value||null,expectedRevision:row?.revision??phase7Number(field(f,'[data-gm-route-revision]').value),fromPlaceId:row?.from_place_id||field(f,'[data-gm-route-from]').value,toPlaceId:row?.to_place_id||field(f,'[data-gm-route-to]').value,name:row?.name||field(f,'[data-gm-route-name]').value,routeKind:row?.route_kind||field(f,'[data-gm-route-kind]').value,travelDaysMin:row?.travel_days_min??phase7Number(field(f,'[data-gm-route-min]').value),travelDaysMax:row?.travel_days_max??phase7Number(field(f,'[data-gm-route-max]').value),costNotes:row?.cost_notes??field(f,'[data-gm-route-cost]').value,gmNotes:row?.gm_notes??field(f,'[data-gm-route-notes]').value}}
  async function saveRoute(state){const f=ensurePlaceWorkspace(state).routeForm;try{await runBusy(state,async()=>{await state.repository.saveWorldRoute(state.selectedCampaign.world_id,routeChanges(f));f.reset();for(const control of [field(f,'[data-gm-route-from]'),field(f,'[data-gm-route-to]')]){control.disabled=false;delete control.dataset.gmPermanentDisabled}await loadPlaceWorkspace(state,{force:true})})}catch{}}
  async function archiveRoute(state,row){try{await runBusy(state,async()=>{await state.repository.saveWorldRoute(row.world_id,{...routeChanges(ensurePlaceWorkspace(state).routeForm,row),archived:true});await loadPlaceWorkspace(state,{force:true})})}catch{}}
  async function savePlaceLink(state){const f=ensurePlaceWorkspace(state).linkForm;try{await runBusy(state,async()=>{await state.repository.saveWorldPlaceLink(state.selectedCampaign.world_id,{placeId:field(f,'[data-gm-place-link-place]').value,linkKind:field(f,'[data-gm-place-link-kind]').value,targetId:field(f,'[data-gm-place-link-target]').value,roleLabel:field(f,'[data-gm-place-link-role]').value,gmNotes:field(f,'[data-gm-place-link-notes]').value});f.reset();await loadPlaceWorkspace(state,{force:true})})}catch{}}
  async function archivePlaceLink(state,row){try{await runBusy(state,async()=>{await state.repository.saveWorldPlaceLink(row.world_id,{linkId:row.link_id,expectedRevision:row.revision,placeId:row.place_id,linkKind:row.link_kind,targetId:row.target_id,roleLabel:row.role_label,gmNotes:row.gm_notes,archived:true});await loadPlaceWorkspace(state,{force:true})})}catch{}}
  async function loadPlaceWorkspace(state,{force=false}={}){const ui=ensurePlaceWorkspace(state),campaignId=state.selectedCampaignId,worldId=state.selectedCampaign?.world_id;if(!ui||!campaignId||!worldId)return;if(!canManageCreatureWorld(state)){text(ui.status,'Für diese Welt hat dein Konto kein Weltverwaltungsrecht.');for(const section of ui.editorSections)show(section,false);return}const required=['listWorldPlaces','listWorldPlaceTree','listWorldPlaceStates','listCampaignEffectivePlaceStates','listCampaignPlaceDisclosures','listCampaignPlaceStateDisclosures','listWorldTradeGoods','listWorldRoutes','listWorldPlaceLinks','listWorldMedia','listCampaignMediaDisclosures','listWorldMapArtifacts'];if(required.some(name=>typeof state.repository[name]!=='function')){text(ui.status,'Die Orts-, Medien- und Kartenregionsverwaltung ist in dieser App-Fassung noch nicht verbunden.');return}if(!force&&state.placeLoaded&&state.placeWorldId===worldId&&state.placeCampaignId===campaignId)return;if(!force&&state.placeLoading)return;const serial=++state.placeLoadSerial,authEpoch=state.authEpoch;state.placeWorldId=worldId;state.placeCampaignId=campaignId;state.placeLoading=true;state.placeLoaded=false;text(ui.status,'Ortshierarchie, private Bilder und interaktive Kartenregionen werden geladen …');show(ui.retry,false);try{const values=await Promise.all([state.repository.listWorldPlaces(worldId),state.repository.listWorldPlaceTree(worldId),state.repository.listWorldPlaceStates(worldId),state.repository.listCampaignEffectivePlaceStates(campaignId),state.repository.listCampaignPlaceDisclosures(campaignId),state.repository.listCampaignPlaceStateDisclosures(campaignId),state.repository.listWorldTradeGoods(worldId),state.repository.listWorldRoutes(worldId),state.repository.listWorldPlaceLinks(worldId),state.repository.listWorldMedia(worldId),state.repository.listCampaignMediaDisclosures(campaignId),state.repository.listWorldMapArtifacts(worldId),state.repository.listWorldMapRegions?.(worldId)||[],Promise.allSettled([state.repository.listWorldCreatures?.(worldId)||[],state.repository.listWorldFactions?.(worldId)||[]])]);if(serial!==state.placeLoadSerial||authEpoch!==state.authEpoch||campaignId!==state.selectedCampaignId)return;[state.places,state.placeTree,state.placeStates,state.effectivePlaceStates,state.placeDisclosures,state.placeStateDisclosures,state.tradeGoods,state.routes,state.placeLinks,state.worldMedia,state.mediaDisclosures,state.mapArtifacts,state.mapRegions]=values.slice(0,13);const refs=values[13].map(result=>result.status==='fulfilled'&&Array.isArray(result.value)?result.value:[]);[state.placeCreatures,state.placeFactions]=refs;state.placeLoaded=true;renderPlaceWorkspace(state);text(ui.status,`Bereit: ${state.places.filter(activeRow).length} Orte, ${state.worldMedia.filter(activeRow).length} private Bilder, ${state.mapArtifacts.filter(activeRow).length} Karten, ${state.mapRegions.filter(activeRow).length} Regionen und ${state.effectivePlaceStates.length} wirksame Zustände an Tag ${state.selectedCampaign?.current_day||1}.`)}catch(error){if(serial!==state.placeLoadSerial||authEpoch!==state.authEpoch)return;text(ui.status,friendlyError(error));show(ui.retry,true)}finally{if(serial===state.placeLoadSerial)state.placeLoading=false}}

  function resetChronicleWorkspace(state){state.chronicleLoadSerial=(state.chronicleLoadSerial||0)+1;state.chronicleLoaded=false;state.chronicleLoading=false;state.chronicleWorldId=null;state.chronicleCampaignId=null;state.worldEvents=[];state.effectiveWorldState=[];state.worldEventDisclosures=[];state.worldEventConflicts=[];state.chroniclePlaces=[];state.chronicleUi=null;const panel=field(state.dialog,'[data-gm-panel="events"]');if(panel){clear(panel);panel.append(heading('h3','Ereignisse'),heading('h4','Verdeckte Folgen aus anderen Kampagnen'));const impacts=document.createElement('ul');impacts.dataset.gmImpacts='';panel.append(impacts)}}
  function chronicleSelect(marker){const control=document.createElement('select');control.dataset[marker]='';return control}
  function chronicleOption(control,value,label){const option=document.createElement('option');option.value=value||'';option.textContent=label;control.append(option);return option}
  function fillChronicleOptions(state){const ui=state.chronicleUi;if(!ui)return;for(const control of [ui.correctionSelect,ui.disclosureEvent]){const selected=control.value;clear(control);chronicleOption(control,'','— keine Auswahl —');for(const event of state.worldEvents)chronicleOption(control,event.event_id,`Tag ${event.occurred_day} · ${event.title}`);if([...control.options].some(option=>option.value===selected))control.value=selected}const place=ui.placeSelect,placeValue=place.value;clear(place);chronicleOption(place,'','— kein bestimmter Ort —');for(const row of state.chroniclePlaces.filter(activeRow))chronicleOption(place,row.place_id,row.name);if([...place.options].some(option=>option.value===placeValue))place.value=placeValue;const character=ui.disclosureCharacter,characterValue=character.value;clear(character);chronicleOption(character,'','Gesamte Kampagne');for(const row of state.selectedData?.characters||[])chronicleOption(character,row.id,row.character_name||row.name||row.id);if([...character.options].some(option=>option.value===characterValue))character.value=characterValue;const causes=ui.causes,chosen=new Set([...causes.selectedOptions].map(option=>option.value));clear(causes);for(const event of state.worldEvents){const option=chronicleOption(causes,event.event_id,`Tag ${event.occurred_day} · ${event.title}`);option.selected=chosen.has(event.event_id)}}
  function ensureChronicleWorkspace(state){const panel=field(state.dialog,'[data-gm-panel="events"]');if(!panel)return null;if(state.chronicleUi?.panel===panel)return state.chronicleUi;clear(panel);panel.append(heading('h3','Weltchronik & zeitliche Konsistenz'));const status=note('Weltchronik wird geladen …');status.setAttribute('role','status');const retry=button('Bereich erneut laden',()=>loadChronicleWorkspace(state,{force:true}));retry.hidden=true;panel.append(status,retry);
    const impactSection=phase7Section(panel,'Verdeckte Folgen aus anderen Kampagnen','Diese bestehenden Vormerkungen bleiben als Eingang für kanonische Weltereignisse erhalten.');const impacts=document.createElement('ul');impacts.dataset.gmImpacts='';impactSection.append(impacts);
    const timelineSection=phase7Section(panel,'Datierte Wahrheit','Weltereignisse werden niemals überschrieben. Berichtigungen sind neue, datierte und nachvollziehbar verknüpfte Ereignisse.');const timeline=document.createElement('ul');timeline.dataset.gmChronicleTimeline='';timelineSection.append(timeline);
    const eventForm=document.createElement('form');eventForm.dataset.gmChronicleEventForm='';const placeSelect=chronicleSelect('gmChroniclePlace'),correctionSelect=chronicleSelect('gmChronicleCorrection'),causes=chronicleSelect('gmChronicleCauses');causes.multiple=true;causes.size=5;const sourceCampaign=input('checkbox','gmChronicleSourceCampaign');sourceCampaign.checked=true;eventForm.append(labelControl('Welttag',input('number','gmChronicleDay',{required:true,min:1,max:1000000,value:state.selectedCampaign?.current_day||1})),labelControl('Art',select('gmChronicleKind',[['discovery','Entdeckung'],['politics','Politik'],['conflict','Konflikt'],['disaster','Katastrophe'],['construction','Bau'],['destruction','Zerstörung'],['travel','Reise'],['economy','Wirtschaft'],['social','Gesellschaft'],['magic','Magie'],['other','Sonstiges']])),labelControl('Interner Titel',input('text','gmChronicleTitle',{required:true,maxLength:200})),labelControl('Kanonische Wahrheit',textarea('gmChronicleTruth',200000)),labelControl('Ursache / Einordnung',textarea('gmChronicleCause',100000)),labelControl('Ort (optional)',placeSelect),labelControl('Korrigiert Ereignis (optional)',correctionSelect),labelControl('Art der Korrektur',select('gmChronicleCorrectionKind',[['amendment','Ergänzung'],['reversal','Widerruf'],['clarification','Klarstellung']])),labelControl('Ursächliche Ereignisse (Mehrfachauswahl)',causes),labelControl('Zustandsänderungen – je Zeile: Art|Ziel-UUID oder leer|Schlüssel|JSON-Wert oder CLEAR|Beschreibung',textarea('gmChronicleEffects',100000)),labelControl('Beteiligte – je Zeile: character/creature/faction|UUID|Rolle',textarea('gmChronicleParticipants',100000)),labelControl('Grundsichtbarkeit',select('gmChronicleVisibility',[['secret','Geheim'],['public','Öffentlich']])),labelControl('Öffentlicher Titel',input('text','gmChroniclePublicTitle',{maxLength:200})),labelControl('Öffentliche Zusammenfassung',textarea('gmChroniclePublicSummary',200000)),labelControl('Aus dieser Kampagne hervorgegangen',sourceCampaign),submitButton('Weltereignis unveränderlich erfassen'));eventForm.addEventListener('submit',event=>{event.preventDefault();saveWorldEvent(state)});timelineSection.append(eventForm);
    const effectiveSection=phase7Section(panel,'Wirksamer Weltzustand dieser Kampagne',`Nur Ereignisse bis zum aktuellen Kampagnentag ${state.selectedCampaign?.current_day||1} wirken. Offene Widersprüche werden zusätzlich gezeigt.`);const effective=document.createElement('ul');effective.dataset.gmChronicleEffective='';effectiveSection.append(effective);
    const disclosureSection=phase7Section(panel,'Kampagnen- und Figurenwissen','Freigaben verändern die Wahrheit nicht und gelten erst ab dem eingetragenen Entdeckungstag.');const disclosures=document.createElement('ul');disclosures.dataset.gmChronicleDisclosures='';const disclosureForm=document.createElement('form');disclosureForm.dataset.gmChronicleDisclosureForm='';const disclosureEvent=chronicleSelect('gmChronicleDisclosureEvent'),disclosureCharacter=chronicleSelect('gmChronicleDisclosureCharacter');disclosureForm.append(hiddenInput('gmChronicleDisclosureId'),hiddenInput('gmChronicleDisclosureRevision'),labelControl('Ereignis',disclosureEvent),labelControl('Wissensbereich',disclosureCharacter),labelControl('Wissensstand',select('gmChronicleKnowledge',[['partial','Teilweise bekannt'],['known','Bekannt']])),labelControl('Spielertitel',input('text','gmChroniclePlayerTitle',{maxLength:200})),labelControl('Spielerwissen',textarea('gmChroniclePlayerSummary',200000)),labelControl('Entdeckt ab Kampagnentag',input('number','gmChronicleDiscoveredDay',{required:true,min:1,max:1000000,value:state.selectedCampaign?.current_day||1})),labelControl('Quelle / Referenz',input('text','gmChronicleSource',{maxLength:2000})),submitButton('Wissen freigeben'));disclosureForm.addEventListener('submit',event=>{event.preventDefault();saveWorldEventDisclosure(state)});disclosureSection.append(disclosures,disclosureForm);
    const conflictSection=phase7Section(panel,'Zeit- und Kausalkonflikte','Kollisionen zwischen Kampagnen, umgekehrte Ursachen und rückdatierte Korrekturen werden gemeldet und nie still aufgelöst.');const conflicts=document.createElement('ul');conflicts.dataset.gmChronicleConflicts='';conflictSection.append(conflicts);
    state.chronicleUi={panel,status,retry,impacts,timeline,eventForm,placeSelect,correctionSelect,causes,effective,disclosures,disclosureForm,disclosureEvent,disclosureCharacter,conflicts};renderImpacts(state,state.selectedData?.impacts||[]);return state.chronicleUi}
  function parseChronicleEffects(value){return String(value||'').split(/\r?\n/).map(line=>line.trim()).filter(Boolean).map((line,index)=>{const [subjectKind,subjectId,stateKey,rawValue,...description]=line.split('|').map(part=>part.trim());if(!subjectKind||!stateKey||rawValue===undefined)throw new Error(`Zustandszeile ${index+1} ist unvollständig.`);if(/^clear$/i.test(rawValue))return{subject_kind:subjectKind,subject_id:subjectId||null,state_key:stateKey,operation:'clear',state_value:null,description:description.join(' | ')};let stateValue;try{stateValue=JSON.parse(rawValue)}catch{throw new Error(`JSON-Wert in Zustandszeile ${index+1} ist ungültig.`)}return{subject_kind:subjectKind,subject_id:subjectId||null,state_key:stateKey,operation:'set',state_value:stateValue,description:description.join(' | ')}})}
  function parseChronicleParticipants(value){return String(value||'').split(/\r?\n/).map(line=>line.trim()).filter(Boolean).map((line,index)=>{const [participantKind,participantId,...role]=line.split('|').map(part=>part.trim());if(!participantKind||!participantId)throw new Error(`Beteiligtenzeile ${index+1} ist unvollständig.`);return{participant_kind:participantKind,participant_id:participantId,role_label:role.join(' | ')}})}
  function renderChronicleWorkspace(state){const ui=ensureChronicleWorkspace(state);fillChronicleOptions(state);renderImpacts(state,state.selectedData?.impacts||[]);clear(ui.timeline);if(!state.worldEvents.length)ui.timeline.append(item('Noch kein Weltereignis erfasst.'));for(const row of state.worldEvents){const correction=row.corrects_event_id?' · Korrektur':'';const conflict=+row.open_conflict_count?` · ${row.open_conflict_count} offener Konflikt`:'';const correct=button('Als Korrektur fortschreiben',()=>{ui.correctionSelect.value=row.event_id;field(ui.eventForm,'[data-gm-chronicle-title]').value=`Korrektur: ${row.title}`;field(ui.eventForm,'[data-gm-chronicle-day]').value=state.selectedCampaign?.current_day||row.occurred_day;ui.eventForm.scrollIntoView?.({block:'nearest'})});const disclose=button('Wissen freigeben',()=>{ui.disclosureEvent.value=row.event_id;field(ui.disclosureForm,'[data-gm-chronicle-player-title]').value=row.public_title||row.title;field(ui.disclosureForm,'[data-gm-chronicle-player-summary]').value=row.public_summary||'';ui.disclosureForm.scrollIntoView?.({block:'nearest'})});ui.timeline.append(item(`Tag ${row.occurred_day} · ${row.title}${correction}${conflict} — ${row.truth_summary}`,correct,disclose))}clear(ui.effective);if(!state.effectiveWorldState.length)ui.effective.append(item(`Bis Tag ${state.selectedCampaign?.current_day||1} ist kein chronikbasierter Zustand wirksam.`));for(const row of state.effectiveWorldState){const conflict=+row.open_conflict_count?' · WIDERSPRUCH OFFEN':'';ui.effective.append(item(`${row.subject_kind}${row.subject_id?` ${row.subject_id}`:''} · ${row.state_key}: ${JSON.stringify(row.state_value)} (seit Tag ${row.occurred_day}, ${row.event_title})${conflict}`))}clear(ui.disclosures);if(!state.worldEventDisclosures.filter(activeRow).length)ui.disclosures.append(item('Noch kein zusätzliches Kampagnen- oder Figurenwissen freigegeben.'));for(const row of state.worldEventDisclosures.filter(activeRow)){const event=state.worldEvents.find(candidate=>candidate.event_id===row.event_id);ui.disclosures.append(item(`${event?.title||row.event_id} · ab Tag ${row.discovered_at_day} · ${row.audience_character_id?'Figurenwissen':'Kampagnenwissen'} · ${row.knowledge_level}`))}clear(ui.conflicts);if(!state.worldEventConflicts.length)ui.conflicts.append(item('Keine Chronikkonflikte erkannt.'));for(const row of state.worldEventConflicts){const controls=[];if(row.status==='open'){for(const [value,label] of [['resolved','Als gelöst markieren'],['accepted','Bewusst akzeptieren']])controls.push(button(label,()=>resolveWorldEventConflict(state,row,value)))}ui.conflicts.append(item(`${row.status==='open'?'OFFEN':'Entschieden'} · ${row.conflict_kind} · ${row.event_a_title} ↔ ${row.event_b_title}: ${row.summary}${row.resolution_note?` · ${row.resolution_note}`:''}`,...controls))}}
  async function saveWorldEvent(state){const ui=ensureChronicleWorkspace(state),form=ui.eventForm,correctsEventId=ui.correctionSelect.value||null;try{const changes={occurredDay:+field(form,'[data-gm-chronicle-day]').value,eventKind:correctsEventId?'correction':field(form,'[data-gm-chronicle-kind]').value,title:field(form,'[data-gm-chronicle-title]').value,truthSummary:field(form,'[data-gm-chronicle-truth]').value,causeSummary:field(form,'[data-gm-chronicle-cause]').value,sourceCampaignId:field(form,'[data-gm-chronicle-source-campaign]').checked?state.selectedCampaignId:null,placeId:ui.placeSelect.value||null,visibility:field(form,'[data-gm-chronicle-visibility]').value,publicTitle:field(form,'[data-gm-chronicle-public-title]').value,publicSummary:field(form,'[data-gm-chronicle-public-summary]').value,correctsEventId,correctionKind:correctsEventId?field(form,'[data-gm-chronicle-correction-kind]').value:null,effects:parseChronicleEffects(field(form,'[data-gm-chronicle-effects]').value),participants:parseChronicleParticipants(field(form,'[data-gm-chronicle-participants]').value),causeEventIds:[...ui.causes.selectedOptions].map(option=>option.value)};await runBusy(state,async()=>{await state.repository.recordWorldEvent(state.selectedCampaign.world_id,changes);form.reset();field(form,'[data-gm-chronicle-source-campaign]').checked=true;field(form,'[data-gm-chronicle-day]').value=state.selectedCampaign?.current_day||1;await loadChronicleWorkspace(state,{force:true});text(state.message,'Weltereignis unveränderlich erfasst; Zeit- und Kausalkonflikte wurden neu geprüft.')})}catch(error){text(state.message,friendlyError(error))}}
  async function saveWorldEventDisclosure(state){const ui=ensureChronicleWorkspace(state),form=ui.disclosureForm;try{await runBusy(state,async()=>{await state.repository.saveCampaignWorldEventDisclosure(state.selectedCampaignId,{disclosureId:field(form,'[data-gm-chronicle-disclosure-id]').value||null,expectedRevision:phase7Number(field(form,'[data-gm-chronicle-disclosure-revision]').value),eventId:ui.disclosureEvent.value,audienceCharacterId:ui.disclosureCharacter.value||null,knowledgeLevel:field(form,'[data-gm-chronicle-knowledge]').value,playerTitle:field(form,'[data-gm-chronicle-player-title]').value,playerSummary:field(form,'[data-gm-chronicle-player-summary]').value,discoveredAtDay:+field(form,'[data-gm-chronicle-discovered-day]').value,sourceReference:field(form,'[data-gm-chronicle-source]').value});form.reset();field(form,'[data-gm-chronicle-discovered-day]').value=state.selectedCampaign?.current_day||1;await loadChronicleWorkspace(state,{force:true});text(state.message,'Chronikwissen freigegeben, ohne die kanonische Wahrheit zu verändern.')})}catch{}}
  async function resolveWorldEventConflict(state,row,status){const reason=global.prompt?.(status==='accepted'?'Warum wird dieser Widerspruch bewusst akzeptiert?':'Wie wurde dieser Widerspruch nachvollziehbar gelöst?','')||'';if(!reason.trim())return;try{await runBusy(state,async()=>{await state.repository.resolveWorldEventConflict(row.conflict_id,row.revision,status,reason);await loadChronicleWorkspace(state,{force:true});text(state.message,'Chronikkonflikt mit Begründung dokumentiert.')})}catch{}}
  async function loadChronicleWorkspace(state,{force=false}={}){const ui=ensureChronicleWorkspace(state),campaignId=state.selectedCampaignId,worldId=state.selectedCampaign?.world_id;if(!ui||!campaignId||!worldId)return;const required=['listWorldEvents','listCampaignEffectiveWorldState','listCampaignWorldEventDisclosures','listWorldEventConflicts','recordWorldEvent','saveCampaignWorldEventDisclosure','resolveWorldEventConflict'];if(required.some(name=>typeof state.repository[name]!=='function')){text(ui.status,'Die Weltchronik ist in dieser App-Fassung noch nicht verbunden.');return}if(!force&&state.chronicleLoaded&&state.chronicleWorldId===worldId&&state.chronicleCampaignId===campaignId)return;if(!force&&state.chronicleLoading)return;const serial=++state.chronicleLoadSerial,authEpoch=state.authEpoch;state.chronicleWorldId=worldId;state.chronicleCampaignId=campaignId;state.chronicleLoading=true;state.chronicleLoaded=false;text(ui.status,'Weltchronik, Kampagnenzeit und Konflikte werden geladen …');show(ui.retry,false);try{const [events,effective,disclosures,conflicts,places]=await Promise.all([state.repository.listWorldEvents(worldId),state.repository.listCampaignEffectiveWorldState(campaignId),state.repository.listCampaignWorldEventDisclosures(campaignId),state.repository.listWorldEventConflicts(worldId),typeof state.repository.listWorldPlaces==='function'?state.repository.listWorldPlaces(worldId):[]]);if(serial!==state.chronicleLoadSerial||authEpoch!==state.authEpoch||campaignId!==state.selectedCampaignId)return;state.worldEvents=events;state.effectiveWorldState=effective;state.worldEventDisclosures=disclosures;state.worldEventConflicts=conflicts;state.chroniclePlaces=places;state.chronicleLoaded=true;renderChronicleWorkspace(state);text(ui.status,`Bereit: ${events.length} Ereignisse, ${effective.length} wirksame Zustände an Tag ${state.selectedCampaign?.current_day||1}, ${conflicts.filter(row=>row.status==='open').length} offene Konflikte.`)}catch(error){if(serial!==state.chronicleLoadSerial||authEpoch!==state.authEpoch)return;text(ui.status,friendlyError(error));show(ui.retry,true)}finally{if(serial===state.chronicleLoadSerial)state.chronicleLoading=false}}

  function calendarAt(day){const current=Math.max(1,Math.min(1000000,Math.trunc(+day||1))),zero=current-1,dayOfYear=zero%360+1,index=Math.floor((dayOfYear-1)/90),seasonDay=(dayOfYear-1)%90+1,seasons=['Frühling','Sommer','Herbst','Winter'];return{current_day:current,calendar_year:Math.floor(zero/360)+1,day_of_year:dayOfYear,season:seasons[index],season_day:seasonDay,next_season:seasons[(index+1)%4]}}
  function calendarSummary(row){return row?`Tag ${row.current_day} · Jahr ${row.calendar_year} · ${row.season}, Tag ${row.season_day} von 90`:'Kalenderstand nicht verfügbar.'}
  function resetTimeWorkspace(state){state.timeLoadSerial=(state.timeLoadSerial||0)+1;state.timeLoaded=false;state.timeLoading=false;state.timeCampaignId=null;state.timeCalendar=null;state.timeWeatherHistory=[];state.timeAstronomy=[];state.timeUi=null;const panel=field(state.dialog,'[data-gm-panel="time"]');if(panel){clear(panel);panel.append(heading('h3','Zeit, Wetter & Astronomie'),note('Kalender, manuell gezogenes Wetter und astronomische Wissensfreigaben werden beim Öffnen sicher geladen.','notice'))}}
  function ensureTimeWorkspace(state){const panel=field(state.dialog,'[data-gm-panel="time"]');if(!panel)return null;if(state.timeUi?.panel===panel)return state.timeUi;clear(panel);panel.append(heading('h3','Zeit & Wetter'));const status=note('Kalender und Wetter werden geladen …','notice');status.setAttribute('role','status');const retry=button('Bereich erneut laden',()=>loadTimeWorkspace(state,{force:true}));retry.hidden=true;panel.append(status,retry);
    const calendarSection=phase7Section(panel,'Kalenderstand','Vier Jahreszeiten mit jeweils 90 Tagen ergeben ein 360-Tage-Jahr. Monate werden erst nach bestätigter Tagesverteilung ergänzt.');const calendarFacts=document.createElement('div');calendarFacts.dataset.gmTimeCalendar='';calendarFacts.className='gm-stat-grid';const warning=note('','notice');warning.dataset.gmTimeWarning='';calendarSection.append(calendarFacts,warning);
    const advanceSection=phase7Section(panel,'Zeit fortschreiben','Der Fortschritt wird genau einmal protokolliert und vermindert aktives Wetter atomar um die vergangenen Tage. Rückwirkende Korrekturen sind nicht definiert.');const advanceForm=document.createElement('form');advanceForm.dataset.gmTimeAdvanceForm='';const days=input('number','gmTimeAdvanceDays',{required:true,min:1,max:999999,value:1}),preview=note('');preview.dataset.gmTimeAdvancePreview='';advanceForm.append(labelControl('Vergangene Tage',days),preview,submitButton('Zeitfortschritt prüfen und bestätigen'));days.addEventListener('input',()=>renderTimePreview(state));advanceForm.addEventListener('submit',event=>{event.preventDefault();advanceTime(state)});advanceSection.append(advanceForm);
    const weatherSection=phase7Section(panel,'Physische Wetterkarte eintragen','Der Builder zieht keine Karte. Trage die gezogene Karte, ihre ausgewürfelte Dauer und die getrennten Effekte manuell ein.');const activeWeather=document.createElement('div');activeWeather.dataset.gmActiveWeather='';activeWeather.className='gm-live-card';const weatherForm=document.createElement('form');weatherForm.dataset.gmWeatherForm='';const replace=input('checkbox','gmWeatherReplace');weatherForm.append(labelControl('Kartenbezeichnung',input('text','gmWeatherName',{required:true,maxLength:160})),labelControl('Öffentlicher Effekt',textarea('gmWeatherPublic',20000)),labelControl('Geheimer Effekt der Spielleitung',textarea('gmWeatherSecret',100000)),labelControl('Ausgewürfelte Dauer in Tagen',input('number','gmWeatherDuration',{required:true,min:1,max:360,value:1})),labelControl('Aktives Wetter ausdrücklich ersetzen',replace),submitButton('Wetterkarte speichern'));weatherForm.addEventListener('submit',event=>{event.preventDefault();recordWeather(state)});weatherSection.append(activeWeather,weatherForm);
    const historySection=phase7Section(panel,'Wetterhistorie','Abgelaufene oder bewusst ersetzte Karten bleiben nachvollziehbar erhalten.');const history=document.createElement('ul');history.dataset.gmWeatherHistory='';historySection.append(history);
    const astronomySection=phase7Section(panel,'Astronomische Ereignisse','Pflege jede Informationsstufe ausdrücklich. Spieler erhalten serverseitig nur Ebenen, die sowohl ihre wirksame Fähigkeit als auch die Kampagnenfreigabe zulassen.');const astronomyForm=document.createElement('form');astronomyForm.dataset.gmAstronomyForm='';const astronomyArchived=input('checkbox','gmAstronomyArchived');astronomyForm.append(hiddenInput('gmAstronomyId'),hiddenInput('gmAstronomyRevision'),labelControl('Interner Titel der Spielleitung',input('text','gmAstronomyTitle',{required:true,maxLength:160})),labelControl('Erster Beobachtungstag',input('number','gmAstronomyStart',{required:true,min:1,max:1000000})),labelControl('Letzter Beobachtungstag',input('number','gmAstronomyEnd',{required:true,min:1,max:1000000})),labelControl('Offensichtliche Erscheinung · ohne Astronomie',textarea('gmAstronomyObvious',50000)),labelControl('Niedrige Information · ab wirksam 5',textarea('gmAstronomyLow',50000)),labelControl('Mittlere Information · ab wirksam 10',textarea('gmAstronomyMedium',50000)),labelControl('Hohe Information · ab wirksam 15',textarea('gmAstronomyHigh',50000)),labelControl('Geheime Notizen der Spielleitung',textarea('gmAstronomyNotes',100000)),labelControl('Ereignis archivieren',astronomyArchived),submitButton('Astronomisches Ereignis speichern'),button('Eingabe leeren',()=>clearAstronomyForm(state)));astronomyForm.addEventListener('submit',event=>{event.preventDefault();saveAstronomicalEvent(state)});const astronomyList=document.createElement('ul');astronomyList.dataset.gmAstronomyList='';astronomySection.append(astronomyForm,heading('h5','Ereignisse und Kampagnenfreigaben'),astronomyList);state.timeUi={panel,status,retry,calendarFacts,warning,advanceForm,days,preview,activeWeather,weatherForm,history,astronomyForm,astronomyList};return state.timeUi}
  function renderTimePreview(state){const ui=ensureTimeWorkspace(state),calendar=state.timeCalendar;if(!ui||!calendar)return;const days=+ui.days.value;if(!Number.isInteger(days)||days<1||calendar.current_day>1000000-days){text(ui.preview,'Bitte gib eine gültige positive Anzahl vergangener Tage ein.');return}const target=calendarAt(calendar.current_day+days);text(ui.preview,`Vorschau: ${calendarSummary(target)}${target.season!==calendar.season?` · Jahreszeitenwechsel zu ${target.season}.`:''}`)}
  function renderTimeWorkspace(state){const ui=ensureTimeWorkspace(state),row=state.timeCalendar;clear(ui.calendarFacts);if(!row){ui.calendarFacts.append(note('Kein Kalenderstand verfügbar.'));return}for(const [label,value] of [['Kampagnentag',row.current_day],['Jahr',row.calendar_year],['Jahreszeit',row.season],['Tag der Jahreszeit',`${row.season_day} / 90`]]){const wrap=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=String(value);wrap.append(dt,dd);ui.calendarFacts.append(wrap)}text(ui.warning,row.season_warning||'Kein Jahreszeitenwechsel in den nächsten drei Tagen.');ui.warning.classList.toggle('ok',!!row.season_warning);clear(ui.activeWeather);if(row.weather_id){ui.activeWeather.append(heading('h5',row.card_name||'Aktuelles Wetter'),note(`Noch ${row.weather_remaining_days} von ${row.rolled_duration_days} Tagen · seit Kampagnentag ${row.start_day}`),note(row.public_effect||'Kein öffentlicher Effekt.'),note(row.gm_effect?`Nur Spielleitung: ${row.gm_effect}`:'Kein geheimer Effekt.'))}else{const latest=state.timeWeatherHistory[0];ui.activeWeather.append(heading('h5','Kein aktives Wetter'),note(latest?.status==='expired'?'Wetter abgelaufen – neue Wetterkarte ziehen.':'Ziehe bei Bedarf eine physische Wetterkarte und trage sie hier ein.','notice'))}clear(ui.history);if(!state.timeWeatherHistory.length)ui.history.append(item('Noch keine Wetterkarte dokumentiert.'));for(const weather of state.timeWeatherHistory){const status=weather.status==='active'?'aktiv':weather.status==='expired'?'abgelaufen':'ersetzt';ui.history.append(item(`${weather.card_name} · ab Tag ${weather.start_day} · ${weather.rolled_duration_days} Tage · ${status}${weather.expired_day?` an Tag ${weather.expired_day}`:''}${weather.gm_effect?` · SL: ${weather.gm_effect}`:''}`))}renderAstronomyWorkspace(state);renderTimePreview(state)}

  function clearAstronomyForm(state){const form=ensureTimeWorkspace(state).astronomyForm;form.reset();field(form,'[data-gm-astronomy-id]').value='';field(form,'[data-gm-astronomy-revision]').value=''}
  function editAstronomicalEvent(state,row){const form=ensureTimeWorkspace(state).astronomyForm;field(form,'[data-gm-astronomy-id]').value=row.event_id;field(form,'[data-gm-astronomy-revision]').value=row.event_revision;field(form,'[data-gm-astronomy-title]').value=row.internal_title||'';field(form,'[data-gm-astronomy-start]').value=row.observation_start_day;field(form,'[data-gm-astronomy-end]').value=row.observation_end_day;field(form,'[data-gm-astronomy-obvious]').value=row.obvious_text||'';field(form,'[data-gm-astronomy-low]').value=row.low_text||'';field(form,'[data-gm-astronomy-medium]').value=row.medium_text||'';field(form,'[data-gm-astronomy-high]').value=row.high_text||'';field(form,'[data-gm-astronomy-notes]').value=row.gm_notes||'';field(form,'[data-gm-astronomy-archived]').checked=!!row.event_archived_at;form.scrollIntoView?.({block:'nearest'})}
  function renderAstronomyWorkspace(state){const ui=ensureTimeWorkspace(state);clear(ui.astronomyList);if(typeof state.repository.listCampaignAstronomyManagement!=='function'){ui.astronomyList.append(item('Astronomie ist in dieser App-Fassung noch nicht verbunden.'));return}if(!state.timeAstronomy.length){ui.astronomyList.append(item('Noch kein astronomisches Ereignis gepflegt.'));return}for(const row of state.timeAstronomy){const archived=!!row.event_archived_at,label=`${row.internal_title} · Tag ${row.observation_start_day}–${row.observation_end_day}${archived?' · archiviert':row.released?` · freigegeben bis ${row.maximum_information_level}`:' · nicht freigegeben'}`,controls=[button('Bearbeiten',()=>editAstronomicalEvent(state,row)),button(archived?'Wiederherstellen':'Archivieren',()=>archiveAstronomicalEvent(state,row,!archived),archived?'':'danger')];if(!archived){const maximum=select('gmAstronomyReleaseLevel',[['obvious','Nur offensichtlich'],['low','Bis niedrig · 5'],['medium','Bis mittel · 10'],['high','Bis hoch · 15']]);maximum.value=row.maximum_information_level||'obvious';controls.push(maximum,button(row.released?'Freigabe zurücknehmen':'Freigeben',()=>setAstronomyRelease(state,row,maximum.value,!row.released),row.released?'danger':''))}ui.astronomyList.append(item(label,...controls),item(`Offensichtlich: ${row.obvious_text}`),item(`Niedrig: ${row.low_text}`),item(`Mittel: ${row.medium_text}`),item(`Hoch: ${row.high_text}`),...(row.gm_notes?[item(`Nur Spielleitung: ${row.gm_notes}`)]:[]))}}
  async function saveAstronomicalEvent(state){const ui=ensureTimeWorkspace(state),form=ui.astronomyForm,campaign=state.selectedCampaign;try{await runBusy(state,async()=>{await state.repository.saveAstronomicalEvent(campaign.world_id,{eventId:field(form,'[data-gm-astronomy-id]').value||null,expectedRevision:field(form,'[data-gm-astronomy-revision]').value?+field(form,'[data-gm-astronomy-revision]').value:null,internalTitle:field(form,'[data-gm-astronomy-title]').value,obviousText:field(form,'[data-gm-astronomy-obvious]').value,lowText:field(form,'[data-gm-astronomy-low]').value,mediumText:field(form,'[data-gm-astronomy-medium]').value,highText:field(form,'[data-gm-astronomy-high]').value,observationStartDay:+field(form,'[data-gm-astronomy-start]').value,observationEndDay:+field(form,'[data-gm-astronomy-end]').value,gmNotes:field(form,'[data-gm-astronomy-notes]').value,archived:field(form,'[data-gm-astronomy-archived]').checked});clearAstronomyForm(state);await loadTimeWorkspace(state,{force:true});text(state.message,'Astronomisches Ereignis mit getrennten Wissensebenen gespeichert.')})}catch{}}
  async function archiveAstronomicalEvent(state,row,archived){if(typeof global.confirm==='function'&&!global.confirm(archived?'Ereignis archivieren und aus allen Spieleransichten entfernen?':'Ereignis wiederherstellen?'))return;try{await runBusy(state,async()=>{await state.repository.saveAstronomicalEvent(row.world_id,{eventId:row.event_id,expectedRevision:row.event_revision,internalTitle:row.internal_title,obviousText:row.obvious_text,lowText:row.low_text,mediumText:row.medium_text,highText:row.high_text,observationStartDay:row.observation_start_day,observationEndDay:row.observation_end_day,gmNotes:row.gm_notes,archived});await loadTimeWorkspace(state,{force:true});text(state.message,archived?'Astronomisches Ereignis archiviert.':'Astronomisches Ereignis wiederhergestellt.')})}catch{}}
  async function setAstronomyRelease(state,row,maximumInformationLevel,released){if(!released&&typeof global.confirm==='function'&&!global.confirm('Astronomische Freigabe für diese Kampagne zurücknehmen?'))return;try{await runBusy(state,async()=>{await state.repository.setCampaignAstronomicalEventRelease(state.selectedCampaignId,row.event_id,{maximumInformationLevel,expectedRevision:row.release_revision||null,released});await loadTimeWorkspace(state,{force:true});text(state.message,released?`Astronomiewissen bis ${maximumInformationLevel} freigegeben.`:'Astronomiefreigabe zurückgenommen.')})}catch{}}
  async function advanceTime(state){const ui=ensureTimeWorkspace(state),calendar=state.timeCalendar,days=+ui.days.value;if(!calendar||!Number.isInteger(days)||days<1){text(state.message,'Bitte gib eine gültige Anzahl vergangener Tage ein.');return}const target=calendarAt(calendar.current_day+days);if(typeof global.confirm==='function'&&!global.confirm(`Zeit von Tag ${calendar.current_day} um ${days} Tage auf Tag ${target.current_day} fortschreiben?`))return;try{await runBusy(state,async()=>{const receipt=await state.repository.advanceCampaignTime(state.selectedCampaignId,calendar.current_day,days);state.selectedCampaign.current_day=receipt.current_day;fillCampaignForm(state,state.selectedCampaign);state.placeLoaded=false;state.chronicleLoaded=false;state.liveLoaded=false;await loadTimeWorkspace(state,{force:true});const notices=[receipt.transition_notice,receipt.weather_notice].filter(Boolean).join(' ');text(state.message,notices||`Kampagnenzeit auf Tag ${receipt.current_day} fortgeschrieben und protokolliert.`)})}catch{}}
  async function recordWeather(state){const ui=ensureTimeWorkspace(state),form=ui.weatherForm,replaceActive=field(form,'[data-gm-weather-replace]').checked;if(replaceActive&&typeof global.confirm==='function'&&!global.confirm('Das aktive Wetter als ersetzt markieren und die neue physische Karte eintragen?'))return;try{await runBusy(state,async()=>{await state.repository.recordCampaignWeather(state.selectedCampaignId,{expectedCurrentDay:state.timeCalendar.current_day,cardName:field(form,'[data-gm-weather-name]').value,publicEffect:field(form,'[data-gm-weather-public]').value,gmEffect:field(form,'[data-gm-weather-secret]').value,rolledDurationDays:+field(form,'[data-gm-weather-duration]').value,replaceActive});form.reset();field(form,'[data-gm-weather-duration]').value=1;await loadTimeWorkspace(state,{force:true});text(state.message,'Physisch gezogene Wetterkarte mit Dauer und getrennten Effekten gespeichert.')})}catch{}}
  async function loadTimeWorkspace(state,{force=false}={}){const ui=ensureTimeWorkspace(state),campaignId=state.selectedCampaignId;if(!ui||!campaignId)return;ensureLiveSync(state);const required=['listCampaignCalendarManagement','listCampaignWeatherHistory','advanceCampaignTime','recordCampaignWeather'];if(required.some(name=>typeof state.repository[name]!=='function')){text(ui.status,'Kalender und Wetter sind in dieser App-Fassung noch nicht verbunden.');return}if(!force&&state.timeLoaded&&state.timeCampaignId===campaignId)return;if(!force&&state.timeLoading)return;const serial=++state.timeLoadSerial,authEpoch=state.authEpoch;state.timeCampaignId=campaignId;state.timeLoading=true;state.timeLoaded=false;text(ui.status,'Kalenderstand, Wetterhistorie und Astronomie werden geladen …');show(ui.retry,false);try{const [calendarRows,history,astronomy]=await Promise.all([state.repository.listCampaignCalendarManagement(campaignId),state.repository.listCampaignWeatherHistory(campaignId),typeof state.repository.listCampaignAstronomyManagement==='function'?state.repository.listCampaignAstronomyManagement(campaignId):[]]);if(serial!==state.timeLoadSerial||authEpoch!==state.authEpoch||campaignId!==state.selectedCampaignId)return;state.timeCalendar=calendarRows[0]||null;state.timeWeatherHistory=history;state.timeAstronomy=astronomy;state.timeLoaded=true;if(state.timeCalendar&&state.selectedCampaign){state.selectedCampaign.current_day=state.timeCalendar.current_day;fillCampaignForm(state,state.selectedCampaign)}renderTimeWorkspace(state);text(ui.status,'Kalender, Wetter und Astronomie sind aktuell. Änderungen werden geräteübergreifend signalisiert.')}catch(error){if(serial!==state.timeLoadSerial||authEpoch!==state.authEpoch)return;text(ui.status,friendlyError(error));show(ui.retry,true)}finally{if(serial===state.timeLoadSerial)state.timeLoading=false}}

  function resetLiveWorkspace(state){state.liveLoadSerial=(state.liveLoadSerial||0)+1;state.liveLoaded=false;state.liveLoading=false;state.liveWorldId=null;state.liveCampaignId=null;state.liveContext=null;state.liveCharacters=[];state.liveActions=[];state.liveInventory=[];state.liveCreatures=[];state.livePlaces=[];state.livePlaceStates=[];state.liveSyncRefreshPending=false;state.liveStatusBase='';state.liveUi=null;const panel=field(state.dialog,'[data-gm-panel="live"]');if(panel){clear(panel);panel.append(heading('h3','Live-Modus'),note('Der reduzierte Spieltisch wird beim Öffnen sicher geladen.','notice'))}}
  function liveSyncSuffix(state){if(!state.liveSync)return'';if(state.liveSyncStatus==='SUBSCRIBED')return' · Geräteabgleich aktiv.';if(['CHANNEL_ERROR','TIMED_OUT','CLOSED'].includes(state.liveSyncStatus))return' · Geräteabgleich unterbrochen; manuelles Neuladen bleibt verfügbar.';return' · Geräteabgleich wird verbunden.'}
  function renderLiveStatus(state,base=state.liveStatusBase){state.liveStatusBase=base||'';const ui=state.liveUi;if(ui&&state.liveStatusBase)text(ui.status,`${state.liveStatusBase}${liveSyncSuffix(state)}`)}
  function stopLiveSync(state){state.liveSyncGeneration=(state.liveSyncGeneration||0)+1;state.liveSyncCampaignId=null;state.liveSyncStatus=null;state.liveSyncRefreshPending=false;const unsubscribe=state.liveSyncUnsubscribe;state.liveSyncUnsubscribe=null;try{const result=unsubscribe?unsubscribe():state.liveSync?.unsubscribe?.();Promise.resolve(result).catch(()=>{})}catch{}}
  function requestLiveSyncRefresh(state,campaignId){if(campaignId!==state.selectedCampaignId||campaignId!==state.liveSyncCampaignId)return;state.liveLoaded=false;state.timeLoaded=false;state.placeLoaded=false;state.liveSyncRefreshPending=true;if(state.activeView==='places'&&!state.placeLoading){state.liveSyncRefreshPending=false;loadPlaceWorkspace(state,{force:true}).catch(()=>{});return}if(state.activeView==='time'&&!state.timeLoading){state.liveSyncRefreshPending=false;loadTimeWorkspace(state,{force:true}).catch(()=>{});return}if(state.activeView!=='live'||state.liveLoading)return;state.liveSyncRefreshPending=false;loadLiveWorkspace(state,{force:true}).catch(()=>{})}
  async function ensureLiveSync(state){const campaignId=state.selectedCampaignId;if(!state.liveSync||!campaignId||typeof state.liveSync.subscribeCampaignLive!=='function')return;if(state.liveSyncCampaignId===campaignId&&(state.liveSyncUnsubscribe||['CONNECTING','SUBSCRIBED'].includes(state.liveSyncStatus)))return;stopLiveSync(state);const generation=++state.liveSyncGeneration;state.liveSyncCampaignId=campaignId;state.liveSyncStatus='CONNECTING';renderLiveStatus(state);try{const unsubscribe=await state.liveSync.subscribeCampaignLive(campaignId,()=>requestLiveSyncRefresh(state,campaignId),{onStatus:status=>{if(generation!==state.liveSyncGeneration||campaignId!==state.selectedCampaignId)return;state.liveSyncStatus=status;renderLiveStatus(state)}});if(generation!==state.liveSyncGeneration||campaignId!==state.selectedCampaignId){await Promise.resolve(unsubscribe?.()).catch(()=>{});return}state.liveSyncUnsubscribe=unsubscribe}catch{if(generation!==state.liveSyncGeneration)return;state.liveSyncStatus='CHANNEL_ERROR';renderLiveStatus(state)}}
  function liveOption(control,value,label){const option=document.createElement('option');option.value=value;option.textContent=label;control.append(option)}
  function ensureLiveWorkspace(state){const panel=field(state.dialog,'[data-gm-panel="live"]');if(!panel)return null;if(state.liveUi?.panel===panel)return state.liveUi;clear(panel);panel.append(heading('h3','Live-Modus · laufender Abend'));const status=note('Live-Daten werden geladen …');status.setAttribute('role','status');const retry=button('Bereich erneut laden',()=>loadLiveWorkspace(state,{force:true}));retry.hidden=true;panel.append(status,retry);
    const atTable=phase7Section(panel,'Spieltisch auf einen Blick','Kampagnentag, Ort, anwesende Figuren und Wesen, Ortsregeln, offene Fäden und kompakte Notizen ohne tiefe Navigation. Kalender und manuell gezogenes Wetter werden im Bereich Zeit & Wetter verwaltet.');const atTableFacts=document.createElement('div');atTableFacts.dataset.gmLiveFacts='';atTableFacts.className='gm-live-grid';const threadList=document.createElement('ul');threadList.dataset.gmLiveThreads='';const ruleList=document.createElement('ul');ruleList.dataset.gmLiveRules='';atTable.append(atTableFacts,heading('h5','Aktive Ortsregeln'),ruleList,heading('h5','Offene Handlungsfäden'),threadList);
    const contextSection=phase7Section(panel,'Live-Kontext steuern','Nur diese serverseitige Aktion startet, pausiert oder beendet den Live-Modus und legt die am Tisch anwesenden Datensätze fest. Begegnung und kompakte Notiz sind bewusst für Kampagnenmitglieder sichtbar; geheime SL-Notizen bleiben in den vorhandenen geschützten Feldern.');const contextForm=document.createElement('form');contextForm.dataset.gmLiveContextForm='';const statusSelect=select('gmLiveStatus',[['active','Aktiv'],['paused','Pausiert'],['inactive','Beendet / inaktiv']]),placeSelect=document.createElement('select');placeSelect.dataset.gmLivePlace='';const sessionSelect=document.createElement('select');sessionSelect.dataset.gmLiveSession='';const characterChoices=document.createElement('div');characterChoices.dataset.gmLiveCharacterChoices='';characterChoices.className='gm-live-choice-list';const creatureChoices=document.createElement('div');creatureChoices.dataset.gmLiveCreatureChoices='';creatureChoices.className='gm-live-choice-list';contextForm.append(labelControl('Status',statusSelect),labelControl('Aktueller Ort',placeSelect),labelControl('Aktueller Spielabend',sessionSelect),heading('h5','Anwesende Figuren'),characterChoices,heading('h5','Anwesende Wesen'),creatureChoices,labelControl('Offene Begegnung · für Kampagnenmitglieder sichtbar',textarea('gmLiveEncounter',4000)),labelControl('Kompakte Tisch-Notiz · für Kampagnenmitglieder sichtbar',textarea('gmLiveNotes',12000)),submitButton('Live-Kontext speichern'));contextForm.addEventListener('submit',event=>{event.preventDefault();saveLiveContext(state)});contextSection.append(contextForm);
    const characterSection=phase7Section(panel,'Figuren · Counter & Aktive Effekte','Aktuelle Counter und das vorhandene activeEffectsV177-Format werden kontrolliert geändert. Countermaxima und andere dauerhafte Revisionsdaten bleiben unverändert.');const characterGrid=document.createElement('div');characterGrid.dataset.gmLiveCharacters='';characterGrid.className='gm-live-grid';characterSection.append(characterGrid);
    const inventorySection=phase7Section(panel,'Kontrolliertes Kampagneninventar','Ausrüsten, Ablegen und Einlagern verwenden die bestehende Kampagneninventar-Revision. Beuteübertragung und Mengen bleiben in ihren vorhandenen, atomaren Abläufen.');const inventoryList=document.createElement('ul');inventoryList.dataset.gmLiveInventory='';inventorySection.append(inventoryList);
    const logSection=phase7Section(panel,'Änderungsprotokoll & sichere Gegenänderungen','Rückgängig löscht nichts. Nur die jeweils unveränderte Zielrevision kann durch einen neuen Gegenbuchungseintrag wiederhergestellt werden.');const actionList=document.createElement('ul');actionList.dataset.gmLiveActions='';logSection.append(actionList);
    state.liveUi={panel,status,retry,atTableFacts,threadList,ruleList,contextForm,statusSelect,placeSelect,sessionSelect,characterChoices,creatureChoices,characterGrid,inventoryList,actionList};return state.liveUi}
  function liveCharacterName(state,id){return state.selectedData?.characters?.find(row=>row.id===id)?.public_data?.name||state.liveCharacters.find(row=>row.character_id===id)?.character_name||id}
  function fillLiveContextForm(state){const ui=ensureLiveWorkspace(state),context=state.liveContext,characterIds=new Set(context?.present_character_ids||[]),creatureIds=new Set(context?.present_creature_ids||[]);ui.statusSelect.value=context?.status||'active';clear(ui.placeSelect);liveOption(ui.placeSelect,'','Kein aktueller Ort');for(const place of state.livePlaces.filter(row=>row.status!=='archived'))liveOption(ui.placeSelect,place.place_id,place.name||place.public_name||place.place_id);ui.placeSelect.value=context?.current_place_id||'';clear(ui.sessionSelect);liveOption(ui.sessionSelect,'','Kein zugeordneter Spielabend');for(const session of state.selectedData?.sessions||[])liveOption(ui.sessionSelect,session.session_id,session.title||session.session_id);ui.sessionSelect.value=context?.current_session_id||'';field(ui.contextForm,'[data-gm-live-encounter]').value=context?.encounter_summary||'';field(ui.contextForm,'[data-gm-live-notes]').value=context?.compact_notes||'';
    clear(ui.characterChoices);const eligible=(state.selectedData?.characters||[]).filter(row=>['approved_locked','change_pending'].includes(row.status));for(const character of eligible){const label=document.createElement('label'),checkbox=document.createElement('input');checkbox.type='checkbox';checkbox.dataset.gmLiveCharacterId=character.id;checkbox.checked=context?characterIds.has(character.id):true;label.append(checkbox,document.createTextNode(character.public_data?.name||character.id));ui.characterChoices.append(label)}if(!eligible.length)ui.characterChoices.append(note('Keine bestätigte Kampagnenfigur.'));
    clear(ui.creatureChoices);for(const creature of state.liveCreatures.filter(row=>row.status!=='archived')){const label=document.createElement('label'),checkbox=document.createElement('input');checkbox.type='checkbox';checkbox.dataset.gmLiveCreatureId=creature.creature_id;checkbox.checked=creatureIds.has(creature.creature_id);label.append(checkbox,document.createTextNode(creature.name||creature.creature_id));ui.creatureChoices.append(label)}if(!state.liveCreatures.length)ui.creatureChoices.append(note('Keine Weltwesen erfasst.'));
  }
  function renderLiveFacts(state){const ui=ensureLiveWorkspace(state),context=state.liveContext;clear(ui.atTableFacts);const presentCharacters=(context?.present_character_ids||[]).map(id=>liveCharacterName(state,id)),presentCreatures=(context?.present_creature_ids||[]).map(id=>state.liveCreatures.find(row=>row.creature_id===id)?.name||id),facts=[['Kampagne',state.selectedCampaign?.name||'Unbenannt'],['Tag',state.selectedCampaign?.current_day||1],['Live-Status',context?.status||'noch nicht gestartet'],['Ort',context?.current_place_name||'nicht festgelegt'],['Spielabend',context?.current_session_title||'nicht festgelegt'],['Figuren',presentCharacters.join(', ')||'keine ausgewählt'],['Wesen',presentCreatures.join(', ')||'keine ausgewählt'],['Wetter','noch nicht strukturiert (Phase 10)'],['Begegnung',context?.encounter_summary||'keine offene Begegnung'],['Notizen',context?.compact_notes||'keine kompakten Notizen']];for(const [label,value] of facts){const card=document.createElement('div');card.className='gm-live-card';card.append(heading('h5',label),note(String(value),'') );ui.atTableFacts.append(card)}clear(ui.ruleList);const rules=state.livePlaceStates.filter(row=>row.place_id===context?.current_place_id);if(!rules.length)ui.ruleList.append(item('Keine aktuell wirksame Ortsregel am gewählten Ort.'));for(const row of rules){const effects=Array.isArray(row.table_effects)?row.table_effects.map(value=>typeof value==='string'?value:value?.text||JSON.stringify(value)).filter(Boolean):[];ui.ruleList.append(item(`${row.truth_label||row.state_kind}${effects.length?` · ${effects.join(' · ')}`:''}`))}clear(ui.threadList);const threads=(state.selectedData?.threads||[]).filter(row=>row.status!=='closed');if(!threads.length)ui.threadList.append(item('Keine offenen Handlungsfäden.'));for(const row of threads)ui.threadList.append(item(`${row.title}${row.details?` · ${row.details}`:''}`))}
  function renderLiveCharacters(state){const ui=ensureLiveWorkspace(state),context=state.liveContext,presentIds=new Set(context?.present_character_ids?.length?context.present_character_ids:(state.selectedData?.characters||[]).filter(row=>['approved_locked','change_pending'].includes(row.status)).map(row=>row.id));clear(ui.characterGrid);const characters=(state.selectedData?.characters||[]).filter(row=>presentIds.has(row.id));if(!characters.length)ui.characterGrid.append(note('Wähle im Live-Kontext mindestens eine bestätigte Figur.'));for(const character of characters){const card=document.createElement('section');card.className='gm-live-card';const live=state.liveCharacters.find(row=>row.character_id===character.id);card.append(heading('h4',character.public_data?.name||live?.character_name||character.id));if(!live){card.append(note('Der Live-Zustand wird beim Speichern des Live-Kontexts aus der gültigen Serverrevision initialisiert.'));const effectForm=document.createElement('form');effectForm.append(labelControl('Erster aktiver Effekt',input('text','gmLiveEffectName',{required:true,maxLength:160})),labelControl('Beschreibung',textarea('gmLiveEffectDescription',4000)),submitButton('Effekt hinzufügen'));effectForm.addEventListener('submit',event=>{event.preventDefault();applyLiveEffectForm(state,character.id,null,effectForm)});card.append(effectForm);ui.characterGrid.append(card);continue}const targetRevisionId=live.current_revision_id||character.current_revision_id||null,resyncRequired=live.resync_required===true||!!(targetRevisionId&&live.base_revision_id!==targetRevisionId);if(resyncRequired){card.append(note('Eine neue bestätigte Figurenrevision liegt vor. Counter und aktive Effekte bleiben bis zum kontrollierten Neuabgleich unverändert. Der Neuabgleich ersetzt sie durch die Werte der neuen Revision; der bisherige Zustand bleibt im Änderungsprotokoll nachvollziehbar.','gm-live-resync-warning'),button('Live-Zustand kontrolliert neu abgleichen',()=>resyncLiveCharacterState(state,live,targetRevisionId),'danger'));ui.characterGrid.append(card);continue}
      card.append(heading('h5','Counter'));const counterEntries=Object.entries(live.counters&&typeof live.counters==='object'?live.counters:{});if(!counterEntries.length)card.append(note('Keine laufenden Counter in der gültigen Revision.'));for(const [key,pair] of counterEntries){const row=document.createElement('div');row.className='gm-live-counter';row.append(heading('strong',`${key}: ${pair?.current??'–'} / ${pair?.max??'–'}`),button('−1',()=>applyLiveCharacterAction(state,live,'counter_adjust',{counter_key:key,delta:-1})),button('+1',()=>applyLiveCharacterAction(state,live,'counter_adjust',{counter_key:key,delta:1})));card.append(row)}
      card.append(heading('h5','Aktive Effekte'));const effects=Array.isArray(live.active_effects)?live.active_effects:[];if(!effects.length)card.append(note('Keine aktiven Effekte.'));for(const effect of effects){const controls=[];if(effect?.id){controls.push(button(effect.active===false?'Aktivieren':'Deaktivieren',()=>applyLiveCharacterAction(state,live,'effect_upsert',{effect:{...effect,active:effect.active===false}})));controls.push(button('Entfernen',()=>applyLiveCharacterAction(state,live,'effect_remove',{effect_id:effect.id}),'danger'))}card.append(item(`${effect?.name||'Unbenannter Effekt'} · ${effect?.active===false?'inaktiv':'aktiv'}${effect?.description?` · ${effect.description}`:''}`,...controls))}
      const effectForm=document.createElement('form');effectForm.append(labelControl('Effektname',input('text','gmLiveEffectName',{required:true,maxLength:160})),labelControl('Beschreibung',textarea('gmLiveEffectDescription',4000)),submitButton('Effekt hinzufügen'));effectForm.addEventListener('submit',event=>{event.preventDefault();applyLiveEffectForm(state,character.id,live.revision,effectForm)});card.append(effectForm);ui.characterGrid.append(card)}
  }
  function renderLiveInventory(state){const ui=ensureLiveWorkspace(state),present=new Set(state.liveContext?.present_character_ids||[]);clear(ui.inventoryList);const rows=state.liveInventory.filter(row=>!present.size||present.has(row.character_id));if(!rows.length){ui.inventoryList.append(item('Kein Kampagneninventar für die anwesenden Figuren.'));return}for(const row of rows){const load=row.load_state==='equipped'?`${row.equipped_quantity} ausgerüstet`:row.load_state==='stored'?'eingelagert':'mitgeführt',line=item(`${liveCharacterName(state,row.character_id)} · ${row.quantity}× ${row.item_name} · ${load}`),controls=document.createElement('span');controls.className='gm-live-actions';const count=document.createElement('input');count.type='number';count.min='1';count.max=String(row.quantity);count.value=String(row.equipped_quantity||1);count.setAttribute('aria-label',`Anzahl ${row.item_name}`);controls.append(count,button('Ausrüsten',()=>{const value=Number(count.value);if(!Number.isInteger(value)||value<1||value>row.quantity){text(state.message,'Bitte eine vorhandene Anzahl auswählen.');return}applyLiveInventoryAction(state,row,'equipped',value)}),button('Mitführen',()=>applyLiveInventoryAction(state,row,'carried',0)),button('Einlagern',()=>applyLiveInventoryAction(state,row,'stored',0)));line.append(controls);ui.inventoryList.append(line)}}
  function liveTargetRevision(state,action){if(action.target_type==='context')return state.liveContext?.live_context_id===action.target_id?state.liveContext.revision:null;if(action.target_type==='character')return state.liveCharacters.find(row=>row.live_state_id===action.target_id)?.revision??null;return state.liveInventory.find(row=>row.inventory_item_id===action.target_id)?.revision??null}
  function renderLiveActions(state){const ui=ensureLiveWorkspace(state);clear(ui.actionList);if(!state.liveActions.length){ui.actionList.append(item('Noch keine protokollierte Live-Änderung.'));return}for(const action of state.liveActions){const current=liveTargetRevision(state,action),staleCharacter=action.target_type==='character'&&state.liveCharacters.find(row=>row.live_state_id===action.target_id)?.resync_required===true,canUndo=!['undo','revision_resync'].includes(action.action_kind)&&!staleCharacter&&!action.is_undone&&current===action.after_revision;ui.actionList.append(item(`${timestampLabel(action.created_at)} · ${action.target_name||'Kampagne'} · ${action.summary}${action.is_undone?' · bereits gegengebucht':''}`,...(canUndo?[button('Sicher rückgängig',()=>undoLiveAction(state,action,current))]:[])))}}
  function renderLiveWorkspace(state){fillLiveContextForm(state);renderLiveFacts(state);renderLiveCharacters(state);renderLiveInventory(state);renderLiveActions(state)}
  async function saveLiveContext(state){const ui=ensureLiveWorkspace(state),characters=[...ui.characterChoices.querySelectorAll('[data-gm-live-character-id]:checked')].map(node=>node.dataset.gmLiveCharacterId),creatures=[...ui.creatureChoices.querySelectorAll('[data-gm-live-creature-id]:checked')].map(node=>node.dataset.gmLiveCreatureId);try{await runBusy(state,async()=>{await state.repository.setCampaignLiveContext(state.selectedCampaignId,{expectedRevision:state.liveContext?.revision??null,status:ui.statusSelect.value,currentPlaceId:ui.placeSelect.value||null,currentSessionId:ui.sessionSelect.value||null,presentCharacterIds:characters,presentCreatureIds:creatures,encounterSummary:field(ui.contextForm,'[data-gm-live-encounter]').value,compactNotes:field(ui.contextForm,'[data-gm-live-notes]').value});await loadLiveWorkspace(state,{force:true});text(state.message,'Live-Kontext gespeichert und anwesende Figuren kontrolliert mit ihrer gültigen Revision verbunden.')})}catch{}}
  async function resyncLiveCharacterState(state,live,targetRevisionId){if(!targetRevisionId){text(state.message,'Die neue bestätigte Figurenrevision konnte nicht bestimmt werden. Bitte neu laden.');return}if(typeof global.confirm==='function'&&!global.confirm('Counter und aktive Effekte werden durch die Werte der neuen bestätigten Figurenrevision ersetzt. Der bisherige Zustand bleibt im Protokoll erhalten. Fortfahren?'))return;try{await runBusy(state,async()=>{await state.repository.resyncCampaignLiveCharacterState(state.selectedCampaignId,live.character_id,live.revision,live.base_revision_id,targetRevisionId,{strategy:'reset_to_revision'});await loadLiveWorkspace(state,{force:true});text(state.message,'Live-Zustand kontrolliert mit der neuen bestätigten Figurenrevision abgeglichen und protokolliert.')})}catch{}}
  async function applyLiveCharacterAction(state,live,kind,payload){try{await runBusy(state,async()=>{await state.repository.applyCampaignLiveCharacterAction(state.selectedCampaignId,live.character_id,live.revision,kind,payload);await loadLiveWorkspace(state,{force:true});text(state.message,'Live-Änderung protokolliert. Spieler und Spielleitung lesen denselben serverseitigen Zustand.')})}catch{}}
  async function applyLiveEffectForm(state,characterId,revision,form){const name=field(form,'[data-gm-live-effect-name]').value.trim(),description=field(form,'[data-gm-live-effect-description]').value;if(!name)return;try{await runBusy(state,async()=>{await state.repository.applyCampaignLiveCharacterAction(state.selectedCampaignId,characterId,revision,'effect_upsert',{effect:{name,description,active:true}});await loadLiveWorkspace(state,{force:true});text(state.message,'Aktiver Effekt im bestehenden Effektformat hinzugefügt und protokolliert.')})}catch{}}
  async function applyLiveInventoryAction(state,row,loadState,equippedQuantity){try{await runBusy(state,async()=>{await state.repository.applyCampaignLiveInventoryAction(state.selectedCampaignId,row.inventory_item_id,row.revision,loadState,equippedQuantity);await loadLiveWorkspace(state,{force:true});text(state.message,'Inventaraktion über die bestehende Gegenstandsrevision protokolliert.')})}catch{}}
  async function undoLiveAction(state,action,revision){try{await runBusy(state,async()=>{await state.repository.undoCampaignLiveAction(action.action_id,revision);await loadLiveWorkspace(state,{force:true});text(state.message,'Gegenänderung angelegt. Der ursprüngliche Protokolleintrag bleibt erhalten.')})}catch{}}
  async function loadLiveWorkspace(state,{force=false}={}){const ui=ensureLiveWorkspace(state),campaignId=state.selectedCampaignId,worldId=state.selectedCampaign?.world_id;if(!ui||!campaignId||!worldId)return;ensureLiveSync(state);const required=['listCampaignLiveContext','listCampaignLiveCharacters','listCampaignLiveActions','listCampaignInventory','setCampaignLiveContext','applyCampaignLiveCharacterAction','resyncCampaignLiveCharacterState','applyCampaignLiveInventoryAction','undoCampaignLiveAction'];if(required.some(name=>typeof state.repository[name]!=='function')){text(ui.status,'Der geschützte Live-Modus ist in dieser App-Fassung noch nicht verbunden.');return}if(!force&&state.liveLoaded&&state.liveWorldId===worldId&&state.liveCampaignId===campaignId)return;if(!force&&state.liveLoading)return;const serial=++state.liveLoadSerial,authEpoch=state.authEpoch;state.liveWorldId=worldId;state.liveCampaignId=campaignId;state.liveLoading=true;state.liveLoaded=false;text(ui.status,'Live-Kontext, Figuren, Inventar und Änderungsprotokoll werden geladen …');show(ui.retry,false);try{const [contexts,characters,actions,inventory,creatures,places,placeStates]=await Promise.all([state.repository.listCampaignLiveContext(campaignId),state.repository.listCampaignLiveCharacters(campaignId),state.repository.listCampaignLiveActions(campaignId),state.repository.listCampaignInventory(campaignId),typeof state.repository.listWorldCreatures==='function'?state.repository.listWorldCreatures(worldId):[],typeof state.repository.listWorldPlaces==='function'?state.repository.listWorldPlaces(worldId):[],typeof state.repository.listCampaignEffectivePlaceStates==='function'?state.repository.listCampaignEffectivePlaceStates(campaignId):[]]);if(serial!==state.liveLoadSerial||authEpoch!==state.authEpoch||campaignId!==state.selectedCampaignId)return;state.liveContext=contexts[0]||null;state.liveCharacters=characters;state.liveActions=actions;state.liveInventory=inventory;state.liveCreatures=creatures;state.livePlaces=places;state.livePlaceStates=placeStates;state.liveLoaded=true;renderLiveWorkspace(state);renderLiveStatus(state,`Bereit: ${characters.length} Figuren-Livezustände, ${inventory.length} Inventarpositionen, ${actions.length} protokollierte Änderungen.`)}catch(error){if(serial!==state.liveLoadSerial||authEpoch!==state.authEpoch)return;text(ui.status,friendlyError(error));show(ui.retry,true)}finally{if(serial===state.liveLoadSerial){state.liveLoading=false;if(state.liveSyncRefreshPending&&state.activeView==='live')requestLiveSyncRefresh(state,campaignId)}}}

  async function selectCampaign(state,campaignId){
    if(!campaignId||!state.campaigns.some(entry=>entry.campaign_id===campaignId))return;
    const authEpoch=state.authEpoch;
    const nextCampaign=state.campaigns.find(entry=>entry.campaign_id===campaignId);
    if(state.selectedCampaignId!==campaignId||state.selectedCampaign?.world_id!==nextCampaign.world_id){stopLiveSync(state);state.selectedCharacterId=null;state.selectedSessionId=null;state.revisionCache.clear();state.revisionErrors.clear();state.revisionLoading.clear();field(state.dialog,'[data-gm-character-detail]')?.remove();field(state.dialog,'[data-gm-session-editor]')?.remove();resetCreatureWorkspace(state);resetRelationshipWorkspace(state);resetPlaceWorkspace(state);resetChronicleWorkspace(state);resetTimeWorkspace(state);resetLiveWorkspace(state)}
    state.selectedCampaignId=campaignId;state.selectedCampaign=nextCampaign;renderCampaignTabs(state);show(field(state.dialog,'[data-gm-workspace]'),true);fillCampaignForm(state,state.selectedCampaign);
    const [characters,pending,changeRequests,sessions,sessionCbp,threads,impacts]=await Promise.all([state.repository.listCampaignCharacters(campaignId),state.repository.listPendingCharacters(campaignId),typeof state.repository.listCharacterChangeRequests==='function'?state.repository.listCharacterChangeRequests(campaignId):[],state.repository.listSessions(campaignId),typeof state.repository.listSessionCbp==='function'?state.repository.listSessionCbp(campaignId):null,state.repository.listThreads(campaignId),state.repository.listHiddenImpacts(campaignId)]);
    if(authEpoch!==state.authEpoch||state.selectedCampaignId!==campaignId)return;
    state.selectedData={characters,pending,changeRequests,sessions,sessionCbp,threads,impacts};renderOverview(state,state.selectedData);renderCharacters(state,characters,pending);renderSessions(state,sessions);renderThreads(state,threads);renderImpacts(state,impacts);text(state.message,`Spielleitung: ${state.selectedCampaign.name}`);
    if(state.activeView==='beings')loadCreatureWorkspace(state);
    if(state.activeView==='relationships')loadRelationshipWorkspace(state);
    if(state.activeView==='places')loadPlaceWorkspace(state);
    if(state.activeView==='events')loadChronicleWorkspace(state);
    if(state.activeView==='time')loadTimeWorkspace(state);
    if(state.activeView==='live')loadLiveWorkspace(state);
  }
  function clearWorkspace(state){
    stopLiveSync(state);resetCreatureWorkspace(state);resetRelationshipWorkspace(state);resetPlaceWorkspace(state);resetChronicleWorkspace(state);resetTimeWorkspace(state);resetLiveWorkspace(state);
    state.selectedCampaignId=null;state.selectedCampaign=null;state.selectedCharacterId=null;state.selectedSessionId=null;state.selectedData=null;state.revisionCache.clear();state.revisionErrors.clear();state.revisionLoading.clear();
    for(const selector of ['[data-gm-overview]','[data-gm-characters]','[data-gm-pending]','[data-gm-sessions]','[data-gm-threads]','[data-gm-impacts]'])clear(field(state.dialog,selector));
    field(state.dialog,'[data-gm-character-detail]')?.remove();field(state.dialog,'[data-gm-session-editor]')?.remove();clear(field(state.dialog,'[data-gm-world-select]'));for(const selector of ['[data-gm-campaign-edit]','[data-gm-campaign-create]','[data-gm-session-form]','[data-gm-thread-form]'])field(state.dialog,selector)?.reset();for(const selector of ['[data-gm-player-name]','[data-gm-player-summary]','[data-gm-player-notes]','[data-gm-player-day]','[data-gm-invite-output]'])text(field(state.dialog,selector),'');show(field(state.dialog,'[data-gm-workspace]'),false);
  }
  async function refresh(state){
    const authEpoch=state.authEpoch,[worlds,campaigns]=await Promise.all([state.repository.listManagedWorlds(),state.repository.listManagedCampaigns()]);if(authEpoch!==state.authEpoch)return{worlds:[],campaigns:[]};state.worlds=worlds;state.campaigns=campaigns;if(!campaigns.length)clearWorkspace(state);renderWorldOptions(state);renderCampaignTabs(state);if(state.selectedCampaignId)await selectCampaign(state,state.selectedCampaignId);return{worlds,campaigns};
  }
  async function reviewCharacter(state,characterId,decision){let reason='';if(decision==='reject'){reason=global.prompt?.('Kurze Begründung für die Ablehnung:','')||'';if(!reason.trim())return}try{await runBusy(state,async()=>{await state.repository.reviewCharacter(characterId,decision,reason);await selectCampaign(state,state.selectedCampaignId);text(state.message,decision==='approve'?'Figur bestätigt und Ausgangsrevision fixiert.':'Einreichung mit Begründung abgelehnt.')})}catch{}}

  function bindActions(state){
    for(const control of state.dialog.querySelectorAll('[data-gm-view]'))control.addEventListener('click',()=>activateView(state,control.dataset.gmView));
    field(state.dialog,'[data-gm-campaign-select]')?.addEventListener('change',event=>{if(event.target.value)runBusy(state,()=>selectCampaign(state,event.target.value))});
    field(state.dialog,'[data-gm-world-select]')?.addEventListener('change',()=>updateWorldChoice(state));
    field(state.dialog,'[data-gm-campaign-edit]')?.addEventListener('input',()=>{const draft=editedCampaign(state);renderPlayerPreview(state,{name:draft.name,summary:draft.summary,player_notes:draft.playerNotes,current_day:draft.currentDay})});
    state.authForm?.addEventListener('submit',async event=>{event.preventDefault();try{await runBusy(state,async()=>{text(state.message,'Anmeldung wird geprüft …');const result=await state.auth.signInWithPassword(field(state.authForm,'[data-gm-auth-email]').value,field(state.authForm,'[data-gm-auth-password]').value);if(!result.user)throw new Error('Die Anmeldung konnte nicht abgeschlossen werden.');if(state.currentUserId!==result.user.id)await renderSession(state,result.user)})}catch{}});
    field(state.dialog,'[data-gm-auth-register-form]')?.addEventListener('submit',async event=>{event.preventDefault();const form=event.currentTarget;try{await runBusy(state,async()=>{const password=passwordPair(form,'[data-gm-auth-register-password]','[data-gm-auth-register-confirm]'),result=await state.auth.signUpWithPassword(field(form,'[data-gm-auth-register-email]').value,password);form.reset();if(result.session&&result.user){await renderSession(state,result.user);text(state.message,'Konto erstellt und sicher angemeldet.')}else text(state.message,`Konto vorbereitet. Bitte bestätige die E-Mail an ${result.email}; danach kannst du dich hier mit deinem Passwort anmelden.`)})}catch{}});
    field(state.dialog,'[data-gm-auth-reset]')?.addEventListener('click',async()=>{try{await runBusy(state,async()=>{const result=await state.auth.requestPasswordReset(field(state.authForm,'[data-gm-auth-email]').value);text(state.message,`Wenn ein Konto für ${result.email} besteht, wurde eine E-Mail zum Festlegen eines neuen Passworts gesendet.`)})}catch{}});
    field(state.dialog,'[data-gm-auth-password-form]')?.addEventListener('submit',async event=>{event.preventDefault();const form=event.currentTarget;try{await runBusy(state,async()=>{const password=passwordPair(form,'[data-gm-auth-new-password]','[data-gm-auth-new-password-confirm]');await state.auth.updatePassword(password);form.reset();form.closest('details')?.removeAttribute('open');text(state.message,'Das Passwort wurde gespeichert. Die Anmeldung funktioniert künftig mit E-Mail und Passwort.')})}catch{}});
    field(state.dialog,'[data-gm-sign-out]')?.addEventListener('click',async()=>{try{await runBusy(state,async()=>{await state.auth.signOut();await renderSession(state,null);text(state.message,'Du bist abgemeldet. Private Spielleitungsdaten wurden entfernt.')})}catch{}});
    field(state.dialog,'[data-gm-campaign-create]')?.addEventListener('submit',async event=>{event.preventDefault();const form=event.currentTarget,worldId=field(form,'[data-gm-world-select]').value;try{await runBusy(state,async()=>{const created=await state.repository.createCampaign({worldId:worldId==='__new__'?null:worldId,worldName:field(form,'[data-gm-world-name]').value,campaignName:field(form,'[data-gm-campaign-name]').value,summary:field(form,'[data-gm-campaign-summary]').value});state.selectedCampaignId=created.campaign_id;form.reset();await refresh(state);text(state.message,`Kampagne „${created.name}“ wurde ${worldId==='__new__'?'mit einer neuen Welt':'in der vorhandenen Welt'} angelegt.`)})}catch{}});
    field(state.dialog,'[data-gm-campaign-edit]')?.addEventListener('submit',async event=>{event.preventDefault();if(!state.selectedCampaignId)return;try{await runBusy(state,async()=>{await state.repository.updateCampaign(state.selectedCampaignId,editedCampaign(state));await refresh(state);text(state.message,'Kampagne gespeichert. Die Spieleransicht ist aktualisiert; geheime Notizen bleiben getrennt.')})}catch{}});
    field(state.dialog,'[data-gm-create-invite]')?.addEventListener('click',async()=>{if(!state.selectedCampaignId)return;try{await runBusy(state,async()=>{const invite=await state.repository.createInvite(state.selectedCampaignId,{label:'Spielleitungs-Einladung',maxUses:1});text(field(state.dialog,'[data-gm-invite-output]'),`Einladungscode: ${invite.code} · einmalig verwendbar`);text(state.message,'Einladungscode erstellt.')})}catch{}});
    field(state.dialog,'[data-gm-session-form]')?.addEventListener('submit',async event=>{event.preventDefault();if(!state.selectedCampaignId)return;const form=event.currentTarget,cross=field(form,'[data-gm-session-cross]').checked;try{await runBusy(state,async()=>{const receipt=await state.repository.createSession(state.selectedCampaignId,{title:field(form,'[data-gm-session-title]').value,date:field(form,'[data-gm-session-date]').value,depth:field(form,'[data-gm-session-depth]').value,summary:field(form,'[data-gm-session-summary]').value,notes:field(form,'[data-gm-session-notes]').value,playerVisible:field(form,'[data-gm-session-visible]').checked,status:field(form,'[data-gm-session-status]').value,defaultCbp:+field(form,'[data-gm-session-cbp]').value,crossCampaignDraft:cross,impactSummary:field(form,'[data-gm-session-impact]').value});form.reset();field(form,'[data-gm-session-visible]').checked=true;await selectCampaign(state,state.selectedCampaignId);text(state.message,`Spielabend gespeichert.${receipt.hidden_impact_count?` ${receipt.hidden_impact_count} verdeckte Folge(n) wurden vorgemerkt.`:''}`)})}catch{}});
    field(state.dialog,'[data-gm-thread-form]')?.addEventListener('submit',async event=>{event.preventDefault();if(!state.selectedCampaignId)return;const form=event.currentTarget;try{await runBusy(state,async()=>{await state.repository.createThread(state.selectedCampaignId,{title:field(form,'[data-gm-thread-title]').value,details:field(form,'[data-gm-thread-details]').value,playerVisible:field(form,'[data-gm-thread-visible]').checked});form.reset();await selectCampaign(state,state.selectedCampaignId);text(state.message,'Handlungsfaden gespeichert.')})}catch{}});
  }
  function createState(dialog,services={}){const Client=global.EberosSupabaseClient,provider=services.provider||new Client.SupabaseClientProvider(),state={dialog,provider,auth:services.auth||new Client.CampaignAuthGateway({provider}),repository:services.repository||new Client.SupabaseCampaignRepository({provider}),liveSync:services.liveSync||(!services.repository&&Client.CampaignLiveSyncGateway?new Client.CampaignLiveSyncGateway({provider}):null),authForm:field(dialog,'[data-gm-auth-form]'),session:field(dialog,'[data-gm-session]'),message:field(dialog,'[data-gm-message]'),busy:false,unsubscribe:null,worlds:[],campaigns:[],selectedCampaignId:null,selectedCampaign:null,selectedCharacterId:null,selectedSessionId:null,selectedData:null,activeView:'overview',authEpoch:0,currentUserId:null,revisionCache:new Map(),revisionErrors:new Map(),revisionLoading:new Set(),creatureLoadSerial:0,secretLootEffectLoadSerial:0,creatureWorldId:null,creatureCampaignId:null,creatureLoaded:false,creatureLoading:false,creatures:[],archetypes:[],npcCatalog:[],creatureDisclosures:[],worldPlaces:[],worldFactions:[],creatureFactionLinks:[],creatureLoot:[],creatureMigrationRequests:[],creatureCompanionLinks:[],creatureRequestDetails:new Map(),creatureImportDraft:null,selectedCreatureId:null,selectedArchetypeId:null,selectedDisclosureCreatureId:null,creatureUi:null,relationshipLoadSerial:0,relationshipWorldId:null,relationshipCampaignId:null,relationshipLoaded:false,relationshipLoading:false,relationships:[],reputationScopes:[],reputations:[],warrants:[],pursuits:[],disadvantageLinks:[],phase6Creatures:[],phase6Places:[],phase6Factions:[],relationshipUi:null,placeLoadSerial:0,placeWorldId:null,placeCampaignId:null,placeLoaded:false,placeLoading:false,places:[],placeTree:[],placeStates:[],effectivePlaceStates:[],placeDisclosures:[],placeStateDisclosures:[],tradeGoods:[],routes:[],placeLinks:[],placeCreatures:[],placeFactions:[],selectedPlaceId:null,placeUi:null,chronicleLoadSerial:0,chronicleWorldId:null,chronicleCampaignId:null,chronicleLoaded:false,chronicleLoading:false,worldEvents:[],effectiveWorldState:[],worldEventDisclosures:[],worldEventConflicts:[],chroniclePlaces:[],chronicleUi:null,timeLoadSerial:0,timeCampaignId:null,timeLoaded:false,timeLoading:false,timeCalendar:null,timeWeatherHistory:[],timeUi:null,liveLoadSerial:0,liveWorldId:null,liveCampaignId:null,liveLoaded:false,liveLoading:false,liveContext:null,liveCharacters:[],liveActions:[],liveInventory:[],liveCreatures:[],livePlaces:[],livePlaceStates:[],liveUi:null,liveSyncGeneration:0,liveSyncCampaignId:null,liveSyncStatus:null,liveSyncUnsubscribe:null,liveSyncRefreshPending:false,liveStatusBase:''};bindActions(state);states.set(dialog,state);return state}
  function hideTentativeSession(state){state.authEpoch++;state.currentUserId=null;state.campaigns=[];state.worlds=[];clearWorkspace(state);renderCampaignTabs(state);show(state.authForm?.closest('.auth-account-box'),true);show(state.authForm,true);show(state.session,false);text(field(state.dialog,'[data-gm-auth-user]'),'Angemeldetes Konto')}
  async function renderSession(state,user){
    const authEpoch=++state.authEpoch,userId=user?.id||null,accountChanged=state.currentUserId!==userId;state.currentUserId=userId;
    if(accountChanged||!user){state.campaigns=[];state.worlds=[];clearWorkspace(state);renderCampaignTabs(state)}
    show(state.authForm?.closest('.auth-account-box'),!user);show(state.authForm,!user);show(state.session,!!user);text(field(state.dialog,'[data-gm-auth-user]'),user?.email||'Angemeldetes Konto');global.dispatchEvent?.(new CustomEvent('eberos:campaign-auth-change',{detail:{user:user||null}}));if(!user)return;
    text(state.message,'Spielleitungsdaten werden geladen …');
    try{await refresh(state);if(authEpoch===state.authEpoch)text(state.message,state.campaigns.length?'Spielleitung ist bereit.':`Mit ${user.email||'diesem Konto'} angemeldet, aber noch für keine Kampagne als Spielleitung freigegeben.`)}
    catch(error){if(authEpoch===state.authEpoch){hideTentativeSession(state);text(state.message,friendlyError(error))}throw error}
  }
  async function initialize(state){
    if(!state.auth.configured()){show(state.authForm?.closest('.auth-account-box'),false);show(state.authForm,false);show(state.session,false);text(state.message,'Das Kampagnen-Backend ist noch nicht verbunden. Die lokale Charakterverwaltung bleibt verfügbar.');return{configured:false,user:null}}
    show(state.authForm,true);text(state.message,'Vorhandene Spielleitungssitzung wird geprüft …');
    try{const result=await state.auth.restoreSession();await renderSession(state,result.user);if(!state.unsubscribe)state.unsubscribe=await state.auth.onAuthStateChange(({event,user})=>renderSession(state,user).then(()=>{if(event==='PASSWORD_RECOVERY'&&user){const panel=field(state.dialog,'[data-gm-auth-password-panel]');if(panel)panel.open=true;text(state.message,'Lege jetzt ein neues Passwort fest und speichere es.')}}).catch(error=>{if(!state.currentUserId)text(state.message,friendlyError(error))}));if(!result.user)text(state.message,'Melde dich mit E-Mail und Passwort an oder erstelle einmalig ein Konto.');return{configured:true,user:result.user}}catch(error){if(state.currentUserId||!state.session?.hidden)hideTentativeSession(state);show(state.authForm?.closest('.auth-account-box'),true);show(state.authForm,true);text(state.message,friendlyError(error));return{configured:true,user:null,error}}
  }
  async function open({root,dialog,services}={}){const view=root||dialog;if(!view)throw new TypeError('Die Spielleiteransicht fehlt.');if(view instanceof HTMLDialogElement){if(typeof view.showModal==='function'&&!view.open)view.showModal();else view.setAttribute('open','')}else view.hidden=false;const state=states.get(view)||createState(view,services);activateView(state,state.activeView);const session=await initialize(state);if(session.error)throw session.error;return{configured:session.configured,authenticated:!!session.user,campaigns:state.campaigns.length}}
  const creatureNpcBridge=Object.freeze({version:NPC_SHEET_VERSION,create(name){return structuredClone(freshNpcSheet(name))},toNpcSheet(row){return structuredClone(creatureToBuilderNpc(row))},independent(owner){return independentNpcSheet(owner)},serialize(owner){return serializeNpcSheet(owner)},mount(root,owner,options={}){if(!(root instanceof Element))throw new TypeError('Das Ziel des NPC-Fensters fehlt.');return mountNpcSheetEditor(root,owner,options)}});
  global.EberosCreatureNpcBridgeV1814=creatureNpcBridge;
  global.EberosCreatureNpcBridgeV1813=creatureNpcBridge;
  global.EberosCreatureNpcBridgeV1812=Object.freeze({version:CREATURE_BUILDER_PRESENTATION_VERSION,presentationKey:CREATURE_BUILDER_PRESENTATION_KEY,toNpcSnapshot(row){return structuredClone(creatureToBuilderNpc(row))}});
  global.EberosGameMasterWorkspace=Object.freeze({open,friendlyError});
})(globalThis);
