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
  function friendlyError(error){if(error?.code==='CAMPAIGN_BACKEND_NOT_CONFIGURED')return'Das Supabase-Testprojekt ist noch nicht verbunden.';if(error?.status===429)return'Zu viele Versuche. Bitte warte kurz.';return error?.message||'Die Spielleitungsaktion konnte nicht abgeschlossen werden.'}
  function statusLabel(value){return({planned:'Geplant',open:'CBP-Abholung offen',completed:'Abgeschlossen',closed:'Geschlossen',claimed:'Zugeordnet',submitted:'Eingereicht',approved_locked:'Bestätigt',change_pending:'Änderung wartet',rejected:'Abgelehnt',retired:'Im Ruhestand'})[value]||value||'Unbekannt'}
  function dateLabel(value){if(!value)return'ohne Datum';try{return new Intl.DateTimeFormat('de-DE').format(new Date(`${value}T12:00:00`))}catch{return value}}
  function timestampLabel(value){if(!value)return'ohne Zeitangabe';const date=new Date(value);return Number.isNaN(date.getTime())?String(value):new Intl.DateTimeFormat('de-DE',{dateStyle:'medium',timeStyle:'short'}).format(date)}
  function labelControl(label,control){const wrap=document.createElement('label');wrap.className='field';const caption=document.createElement('span');caption.textContent=label;wrap.append(caption,control);return wrap}
  function input(type,marker,options={}){const control=document.createElement('input');control.type=type;control.dataset[marker]='';for(const [name,value] of Object.entries(options))control[name]=value;return control}
  function select(marker,choices){const control=document.createElement('select');control.dataset[marker]='';for(const [value,label] of choices){const option=document.createElement('option');option.value=value;option.textContent=label;control.append(option)}return control}
  function textarea(marker,maxLength){const control=document.createElement('textarea');control.dataset[marker]='';control.maxLength=maxLength;return control}
  function setBusy(state,busy){state.busy=busy;for(const control of state.dialog.querySelectorAll('button,input,textarea,select'))if(!control.matches('[data-close]'))control.disabled=busy||control.dataset.gmPermanentDisabled==='true'}
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
    field(form,'[data-gm-edit-name]').value=campaign.name||'';field(form,'[data-gm-edit-summary]').value=campaign.summary||'';field(form,'[data-gm-edit-player-notes]').value=campaign.player_notes||'';field(form,'[data-gm-edit-notes]').value=campaign.gm_notes||'';field(form,'[data-gm-edit-day]').value=campaign.current_day||1;
    renderPlayerPreview(state,campaign);
  }
  function renderPlayerPreview(state,campaign){text(field(state.dialog,'[data-gm-player-name]'),campaign?.name||'Unbenannte Kampagne');text(field(state.dialog,'[data-gm-player-summary]'),campaign?.summary||'Keine öffentliche Kurzbeschreibung.');text(field(state.dialog,'[data-gm-player-notes]'),campaign?.player_notes||'Keine Hinweise veröffentlicht.');text(field(state.dialog,'[data-gm-player-day]'),String(campaign?.current_day||1))}
  function editedCampaign(state){const form=field(state.dialog,'[data-gm-campaign-edit]');return{name:field(form,'[data-gm-edit-name]').value,summary:field(form,'[data-gm-edit-summary]').value,playerNotes:field(form,'[data-gm-edit-player-notes]').value,gmNotes:field(form,'[data-gm-edit-notes]').value,currentDay:+field(form,'[data-gm-edit-day]').value}}
  function renderOverview(state,data){
    const root=field(state.dialog,'[data-gm-overview]');clear(root);const campaign=state.selectedCampaign;
    const claimableSessions=new Map(data.sessions.filter(session=>session.player_visible&&['open','completed'].includes(session.status)).map(session=>[session.session_id,session]));
    const openCbp=Array.isArray(data.sessionCbp)?data.sessionCbp.filter(row=>claimableSessions.has(row.session_id)&&['approved_locked','change_pending'].includes(row.character_status)&&!row.ledger_id&&+row.offered_amount>0).length:data.sessions.filter(session=>claimableSessions.has(session.session_id)&&+session.default_cbp>0).reduce((sum,session)=>sum+Math.max(0,(+session.eligible_character_count||0)-(+session.claimed_count||0)),0);
    const values=[['Welt',state.worlds.find(world=>world.world_id===campaign.world_id)?.name||campaign.world_id],['Kampagnentag',campaign.current_day||1],['Figuren',data.characters.length],['Offene Prüfungen',data.pending.length],['Spielabende',data.sessions.length],['Offene CBP-Abholungen',openCbp],['Handlungsfäden',data.threads.length],['Verdeckte Folgen',data.impacts.length]];
    const dl=document.createElement('dl');dl.className='gm-stat-grid';for(const [label,value] of values){const wrap=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=String(value);wrap.append(dt,dd);dl.append(wrap)}root?.append(dl);
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

  async function selectCampaign(state,campaignId){
    if(!campaignId||!state.campaigns.some(entry=>entry.campaign_id===campaignId))return;
    const authEpoch=state.authEpoch;
    if(state.selectedCampaignId!==campaignId){state.selectedCharacterId=null;state.selectedSessionId=null;state.revisionCache.clear();state.revisionErrors.clear();state.revisionLoading.clear();field(state.dialog,'[data-gm-character-detail]')?.remove();field(state.dialog,'[data-gm-session-editor]')?.remove()}
    state.selectedCampaignId=campaignId;state.selectedCampaign=state.campaigns.find(entry=>entry.campaign_id===campaignId);renderCampaignTabs(state);show(field(state.dialog,'[data-gm-workspace]'),true);fillCampaignForm(state,state.selectedCampaign);
    const [characters,pending,changeRequests,sessions,sessionCbp,threads,impacts]=await Promise.all([state.repository.listCampaignCharacters(campaignId),state.repository.listPendingCharacters(campaignId),typeof state.repository.listCharacterChangeRequests==='function'?state.repository.listCharacterChangeRequests(campaignId):[],state.repository.listSessions(campaignId),typeof state.repository.listSessionCbp==='function'?state.repository.listSessionCbp(campaignId):null,state.repository.listThreads(campaignId),state.repository.listHiddenImpacts(campaignId)]);
    if(authEpoch!==state.authEpoch||state.selectedCampaignId!==campaignId)return;
    state.selectedData={characters,pending,changeRequests,sessions,sessionCbp,threads,impacts};renderOverview(state,state.selectedData);renderCharacters(state,characters,pending);renderSessions(state,sessions);renderThreads(state,threads);renderImpacts(state,impacts);text(state.message,`Spielleitung: ${state.selectedCampaign.name}`);
  }
  function clearWorkspace(state){
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
    state.authForm?.addEventListener('submit',async event=>{event.preventDefault();try{await runBusy(state,async()=>{const result=await state.auth.requestMagicLink(field(state.authForm,'[data-gm-auth-email]').value);text(state.message,`Anmeldelink an ${result.email} gesendet.`)})}catch{}});
    field(state.dialog,'[data-gm-sign-out]')?.addEventListener('click',async()=>{try{await runBusy(state,async()=>{await state.auth.signOut();await renderSession(state,null);text(state.message,'Du bist abgemeldet. Private Spielleitungsdaten wurden entfernt.')})}catch{}});
    field(state.dialog,'[data-gm-campaign-create]')?.addEventListener('submit',async event=>{event.preventDefault();const form=event.currentTarget,worldId=field(form,'[data-gm-world-select]').value;try{await runBusy(state,async()=>{const created=await state.repository.createCampaign({worldId:worldId==='__new__'?null:worldId,worldName:field(form,'[data-gm-world-name]').value,campaignName:field(form,'[data-gm-campaign-name]').value,summary:field(form,'[data-gm-campaign-summary]').value});state.selectedCampaignId=created.campaign_id;form.reset();await refresh(state);text(state.message,`Kampagne „${created.name}“ wurde ${worldId==='__new__'?'mit einer neuen Welt':'in der vorhandenen Welt'} angelegt.`)})}catch{}});
    field(state.dialog,'[data-gm-campaign-edit]')?.addEventListener('submit',async event=>{event.preventDefault();if(!state.selectedCampaignId)return;try{await runBusy(state,async()=>{await state.repository.updateCampaign(state.selectedCampaignId,editedCampaign(state));await refresh(state);text(state.message,'Kampagne gespeichert. Die Spieleransicht ist aktualisiert; geheime Notizen bleiben getrennt.')})}catch{}});
    field(state.dialog,'[data-gm-create-invite]')?.addEventListener('click',async()=>{if(!state.selectedCampaignId)return;try{await runBusy(state,async()=>{const invite=await state.repository.createInvite(state.selectedCampaignId,{label:'Spielleitungs-Einladung',maxUses:1});text(field(state.dialog,'[data-gm-invite-output]'),`Einladungscode: ${invite.code} · einmalig verwendbar`);text(state.message,'Einladungscode erstellt.')})}catch{}});
    field(state.dialog,'[data-gm-session-form]')?.addEventListener('submit',async event=>{event.preventDefault();if(!state.selectedCampaignId)return;const form=event.currentTarget,cross=field(form,'[data-gm-session-cross]').checked;try{await runBusy(state,async()=>{const receipt=await state.repository.createSession(state.selectedCampaignId,{title:field(form,'[data-gm-session-title]').value,date:field(form,'[data-gm-session-date]').value,depth:field(form,'[data-gm-session-depth]').value,summary:field(form,'[data-gm-session-summary]').value,notes:field(form,'[data-gm-session-notes]').value,playerVisible:field(form,'[data-gm-session-visible]').checked,status:field(form,'[data-gm-session-status]').value,defaultCbp:+field(form,'[data-gm-session-cbp]').value,crossCampaignDraft:cross,impactSummary:field(form,'[data-gm-session-impact]').value});form.reset();field(form,'[data-gm-session-visible]').checked=true;await selectCampaign(state,state.selectedCampaignId);text(state.message,`Spielabend gespeichert.${receipt.hidden_impact_count?` ${receipt.hidden_impact_count} verdeckte Folge(n) wurden vorgemerkt.`:''}`)})}catch{}});
    field(state.dialog,'[data-gm-thread-form]')?.addEventListener('submit',async event=>{event.preventDefault();if(!state.selectedCampaignId)return;const form=event.currentTarget;try{await runBusy(state,async()=>{await state.repository.createThread(state.selectedCampaignId,{title:field(form,'[data-gm-thread-title]').value,details:field(form,'[data-gm-thread-details]').value,playerVisible:field(form,'[data-gm-thread-visible]').checked});form.reset();await selectCampaign(state,state.selectedCampaignId);text(state.message,'Handlungsfaden gespeichert.')})}catch{}});
  }
  function createState(dialog,services={}){const Client=global.EberosSupabaseClient,provider=services.provider||new Client.SupabaseClientProvider(),state={dialog,provider,auth:services.auth||new Client.CampaignAuthGateway({provider}),repository:services.repository||new Client.SupabaseCampaignRepository({provider}),authForm:field(dialog,'[data-gm-auth-form]'),session:field(dialog,'[data-gm-session]'),message:field(dialog,'[data-gm-message]'),busy:false,unsubscribe:null,worlds:[],campaigns:[],selectedCampaignId:null,selectedCampaign:null,selectedCharacterId:null,selectedSessionId:null,selectedData:null,activeView:'overview',authEpoch:0,currentUserId:null,revisionCache:new Map(),revisionErrors:new Map(),revisionLoading:new Set()};bindActions(state);states.set(dialog,state);return state}
  function hideTentativeSession(state){state.authEpoch++;state.currentUserId=null;state.campaigns=[];state.worlds=[];clearWorkspace(state);renderCampaignTabs(state);show(state.authForm,true);show(state.session,false);text(field(state.dialog,'[data-gm-auth-user]'),'Angemeldetes Konto')}
  async function renderSession(state,user){
    const authEpoch=++state.authEpoch,userId=user?.id||null,accountChanged=state.currentUserId!==userId;state.currentUserId=userId;
    if(accountChanged||!user){state.campaigns=[];state.worlds=[];clearWorkspace(state);renderCampaignTabs(state)}
    show(state.authForm,!user);show(state.session,!!user);text(field(state.dialog,'[data-gm-auth-user]'),user?.email||'Angemeldetes Konto');global.dispatchEvent?.(new CustomEvent('eberos:campaign-auth-change',{detail:{user:user||null}}));if(!user)return;
    text(state.message,'Spielleitungsdaten werden geladen …');
    try{await refresh(state);if(authEpoch===state.authEpoch)text(state.message,state.campaigns.length?'Spielleitung ist bereit.':`Mit ${user.email||'diesem Konto'} angemeldet, aber noch für keine Kampagne als Spielleitung freigegeben.`)}
    catch(error){if(authEpoch===state.authEpoch){hideTentativeSession(state);text(state.message,friendlyError(error))}throw error}
  }
  async function initialize(state){
    if(!state.auth.configured()){show(state.authForm,false);show(state.session,false);text(state.message,'Das Kampagnen-Backend ist noch nicht verbunden. Die lokale Charakterverwaltung bleibt verfügbar.');return{configured:false,user:null}}
    show(state.authForm,true);text(state.message,'Vorhandene Spielleitungssitzung wird geprüft …');
    try{const result=await state.auth.restoreSession();await renderSession(state,result.user);if(!state.unsubscribe)state.unsubscribe=await state.auth.onAuthStateChange(({user})=>renderSession(state,user).catch(error=>{if(!state.currentUserId)text(state.message,friendlyError(error))}));if(!result.user)text(state.message,'Für die Spielleitung ist eine einmalige Anmeldung nötig.');return{configured:true,user:result.user}}catch(error){if(state.currentUserId||!state.session?.hidden)hideTentativeSession(state);show(state.authForm,true);text(state.message,friendlyError(error));return{configured:true,user:null,error}}
  }
  async function open({root,dialog,services}={}){const view=root||dialog;if(!view)throw new TypeError('Die Spielleiteransicht fehlt.');if(view instanceof HTMLDialogElement){if(typeof view.showModal==='function'&&!view.open)view.showModal();else view.setAttribute('open','')}else view.hidden=false;const state=states.get(view)||createState(view,services);activateView(state,state.activeView);const session=await initialize(state);if(session.error)throw session.error;return{configured:session.configured,authenticated:!!session.user,campaigns:state.campaigns.length}}
  global.EberosGameMasterWorkspace=Object.freeze({open,friendlyError});
})(globalThis);
