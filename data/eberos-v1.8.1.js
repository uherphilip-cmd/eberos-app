'use strict';

/* Eberos v1.8.1 · kampagnenbezogene Spielleitung und Spielabend-CBP */
(function installV181Foundation(){
  const VERSION='1.8.1',REVISION='gm-sessions-cbp-figures-authfix',SCHEMA=31,RULES=15,BACKEND_APP_VERSION='1.8.0',BACKEND_SCHEMA=30,core=window.EberosOpenPlayCore;
  if(!core)throw new Error('Open-Play-Kern v1.8.0 fehlt.');
  if(typeof LOCAL_DRAFT_REPOSITORY==='undefined')throw new Error('LocalDraftRepository ist nicht mit dem Builder verbunden.');
  const commandService=new core.DraftCommandService({repository:LOCAL_DRAFT_REPOSITORY,appVersion:VERSION,schemaVersion:SCHEMA});state=commandService.save(state);

  const badge=document.getElementById('openPlayBadge'),joinButton=document.getElementById('joinCampaignBtn'),campaignTab=document.getElementById('campaignWorkspaceTab'),campaignView=document.getElementById('campaignWorkspaceView'),campaignRetry=campaignView?.querySelector('[data-campaign-retry]'),gmTab=document.getElementById('gmWorkspaceTab'),gmView=document.getElementById('gmWorkspaceView'),gmMessage=gmView?.querySelector('[data-gm-message]'),gmRetry=gmView?.querySelector('[data-gm-retry]');
  if(!badge||!joinButton||!campaignTab||!campaignView||!campaignRetry||!gmTab||!gmView||!gmMessage||!gmRetry)throw new Error('Open-Play- oder Kampagnenoberfläche ist unvollständig.');
  badge.textContent='Open Play · lokal';badge.title='Dieser Entwurf bleibt auf diesem Gerät und benötigt kein Konto.';document.querySelector('.brand small').textContent='v'+VERSION;
  joinButton.hidden=true;gmTab.hidden=true;

  const assetRevision=`${VERSION}-${REVISION}`,configSource=`./data/eberos-supabase-config-v1.8.0.js?v=${assetRevision}`,clientSource=`./data/eberos-supabase-client-v1.8.1.js?v=${assetRevision}`,campaignSource=`./data/eberos-campaign-entry-v1.8.1.js?v=${assetRevision}`,gmSource=`./data/eberos-gm-workspace-v1.8.1.js?v=${assetRevision}`;
  class ResilientModuleLoader{
    constructor({document,source,globalName,timeoutMs=10000}){this.document=document;this.source=source;this.globalName=globalName;this.timeoutMs=timeoutMs;this.promise=null;this.attempt=0}
    isLoaded(){return !!window[this.globalName]}
    load({retry=false}={}){
      if(window[this.globalName])return Promise.resolve(window[this.globalName]);if(retry)this.promise=null;if(this.promise)return this.promise;
      this.promise=new Promise((resolve,reject)=>{
        let script=[...this.document.scripts].find(node=>node.dataset.campaignModule===this.source),settled=false,timer;
        const cleanup=()=>{clearTimeout(timer);script?.removeEventListener('load',loaded);script?.removeEventListener('error',failed)};
        const finish=(error,module)=>{if(settled)return;settled=true;cleanup();if(error){if(!window[this.globalName])script?.remove();this.promise=null;reject(error)}else resolve(module)};
        const loaded=()=>{script.dataset.moduleState='loaded';const module=window[this.globalName];finish(module?null:new Error('Das geladene Kampagnenmodul ist unvollständig.'),module)};
        const failed=()=>{if(script)script.dataset.moduleState='error';finish(new Error('Der Kampagnenzugang konnte nicht geladen werden. Bitte prüfe die Verbindung und versuche es erneut.'))};
        if(script&&(!script.src||script.dataset.moduleState==='error'||script.dataset.moduleState==='loaded')){script.remove();script=null}
        if(!script){script=this.document.createElement('script');script.src=this.attempt?`${this.source}&retry=${Date.now()}`:this.source;this.attempt+=1;script.async=true;script.dataset.campaignModule=this.source;script.dataset.moduleState='loading';script.addEventListener('load',loaded,{once:true});script.addEventListener('error',failed,{once:true});this.document.head.append(script)}else{script.addEventListener('load',loaded,{once:true});script.addEventListener('error',failed,{once:true})}
        timer=setTimeout(()=>finish(new Error('Das Laden des Kampagnenzugangs dauert zu lange. Bitte wähle „Erneut laden“.')),this.timeoutMs);
      });
      return this.promise;
    }
  }
  const configLoader=new ResilientModuleLoader({document,source:configSource,globalName:'EberosSupabaseConfig'}),clientLoader=new ResilientModuleLoader({document,source:clientSource,globalName:'EberosSupabaseClient'}),campaignLoader=new ResilientModuleLoader({document,source:campaignSource,globalName:'EberosCampaignEntry'}),gmLoader=new ResilientModuleLoader({document,source:gmSource,globalName:'EberosGameMasterWorkspace'});
  async function loadBase(){await configLoader.load();await clientLoader.load()}
  async function loadCampaignEntry(){await loadBase();return campaignLoader.load()}
  async function loadGameMasterWorkspace(){await loadBase();return gmLoader.load()}

  function prepareCampaignSubmission(character=ch()){
    const draftValidation=core.validateDraftState({...state,characters:[character],activeCharacterId:character.id});if(!draftValidation.ok)throw new Error(draftValidation.errors.join(' '));
    const costSummary=costs(character),required=[['Charaktername',String(character.name||'').trim()],['Gruppengrund',String(character.origin?.groupReason||'').trim()]],invalid=required.filter(([,value])=>!value).map(([name])=>name);if(invalid.length)throw new Error(`Vor der Einreichung fehlt: ${invalid.join(', ')}.`);if(costSummary.rest<0)throw new Error(`Das CBP-Budget ist um ${Math.abs(costSummary.rest)} Punkte überschritten.`);
    const attributes=Object.values(character.attributes||{}),counters=Object.values(character.counters||{}),skills=Object.values(character.skills||{});if(attributes.some(value=>+value<1||+value>25)||counters.some(value=>+value.max<2||+value.max>25||+value.current<0||+value.current>+value.max)||skills.some(value=>+value.level<0||+value.level>25))throw new Error('Grundwerte, Counter oder Fähigkeiten liegen außerhalb der zulässigen Grenzen.');
    return{appVersion:BACKEND_APP_VERSION,schemaVersion:BACKEND_SCHEMA,rulesVersion:RULES,catalogVersion:'v1.7.25-r6',clientAppVersion:VERSION,clientSchemaVersion:SCHEMA,character:structuredClone(character),clientCosts:structuredClone(costSummary),clientDerived:Object.fromEntries(derived(character).map(entry=>[entry.n,{value:entry.v,formula:entry.f}])),preparedAt:new Date().toISOString()};
  }
  function applyCampaignReceipt(receipt,{keepPrivateCopy=true}={}){
    const character=state.characters.find(item=>item.id===receipt?.character_id);if(!character)throw new Error('Die eingereichte lokale Figur wurde nicht gefunden.');
    if(keepPrivateCopy){const copy=structuredClone(character),copyId=crypto.randomUUID?crypto.randomUUID():`copy_${Date.now()}_${Math.random().toString(36).slice(2)}`;copy.id=copyId;copy.name=`${copy.name||'Unbenannte Figur'} (private Kopie)`;copy.createdAt=new Date().toISOString();copy.updatedAt=copy.createdAt;copy.campaignProfile={characterId:copyId,status:'local_draft',campaignId:null,membershipId:null,initialRevisionId:null,currentRevisionId:null,revision:0,submittedAt:null,approvedAt:null,lockedAt:null};state.characters.push(copy)}
    character.campaignProfile={...(character.campaignProfile||{}),characterId:character.id,status:receipt.status||'submitted',campaignId:receipt.campaign_id,membershipId:receipt.membership_id||character.campaignProfile?.membershipId||null,currentRevisionId:receipt.revision_id||null,revision:+receipt.revision||1,submittedAt:new Date().toISOString()};state=commandService.save(state);renderAll();return character.campaignProfile;
  }
  function hasSessionCbp(ledgerId,character=ch()){return(character.manualCbpAdjustments||[]).some(entry=>entry.externalLedgerId===ledgerId)}
  function applySessionCbp(receipt){
    const character=state.characters.find(item=>item.id===receipt?.character_id);if(!character)throw new Error('Die lokale Kampagnenfigur wurde nicht gefunden.');if(hasSessionCbp(receipt.ledger_id,character))return character;
    character.manualCbpAdjustments=Array.isArray(character.manualCbpAdjustments)?character.manualCbpAdjustments:[];character.manualCbpAdjustments.push({id:crypto.randomUUID?crypto.randomUUID():`cbp_${Date.now()}_${Math.random().toString(36).slice(2)}`,amount:+receipt.amount||0,label:`Spielabend: ${receipt.title||'Kampagnenabend'}`,date:receipt.session_date?new Intl.DateTimeFormat('de-DE').format(new Date(`${receipt.session_date}T12:00:00`)):new Date().toLocaleDateString('de-DE'),source:'Abenteuer',externalLedgerId:receipt.ledger_id,campaignId:receipt.campaign_id,linkedSessionId:receipt.session_id,locked:true});character.updatedAt=new Date().toISOString();state=commandService.save(state);renderAll();return character;
  }
  function listLocalCharacters(){return state.characters.map(character=>({id:character.id,name:character.name||'Unbenannte Figur',campaignProfile:character.campaignProfile||null,active:character.id===state.activeCharacterId}))}
  function selectLocalCharacter(characterId){const character=state.characters.find(item=>item.id===characterId);if(!character)return null;state.activeCharacterId=character.id;state=commandService.save(state);renderAll();return character}
  function createLocalCharacter(){const character=newCharacter();state.characters.push(character);state.activeCharacterId=character.id;state=commandService.save(state);renderAll();return character}
  async function openPlayerEntry(){const message=campaignView.querySelector('[data-auth-message]');if(message)message.textContent='Der Kampagnenzugang wird geladen …';campaignRetry.hidden=true;try{const module=await loadCampaignEntry();if(!module?.open)throw new Error('Kampagnenbereich ist nicht verfügbar.');const result=await module.open({root:campaignView,character:ch(),submissionFactory:()=>prepareCampaignSubmission(ch()),applyReceipt:(receipt,options)=>applyCampaignReceipt(receipt,options),applySessionCbp,hasSessionCbp:(ledgerId,characterId)=>{const character=state.characters.find(item=>item.id===characterId);return !!character&&hasSessionCbp(ledgerId,character)},listLocalCharacters,hasLocalCharacterId:characterId=>state.characters.some(item=>item.id===characterId),selectLocalCharacter,createLocalCharacter});campaignRetry.hidden=true;return result}catch(error){if(message)message.textContent=error?.message||'Der Kampagnenzugang konnte nicht geladen werden.';campaignRetry.hidden=false;throw error}}
  async function openGmWorkspace(){gmMessage.textContent='Die Spielleitung wird geladen …';gmRetry.hidden=true;try{const module=await loadGameMasterWorkspace();if(!module?.open)throw new Error('Spielleitungsmodul ist nicht verfügbar.');const result=await module.open({root:gmView});gmRetry.hidden=true;return result}catch(error){gmMessage.textContent=error?.message||'Die Spielleitung konnte nicht geladen werden.';gmRetry.hidden=false;throw error}}
  async function guardedOpen(control,loadingLabel,operation){control.disabled=true;const previous=control.textContent;control.textContent=loadingLabel;try{return await operation()}catch(error){showError(error.message)}finally{control.disabled=false;control.textContent=previous}}
  joinButton.addEventListener('click',()=>guardedOpen(joinButton,'Kampagnenzugang wird vorbereitet…',openPlayerEntry));
  campaignTab.addEventListener('click',()=>guardedOpen(campaignTab,'Kampagne wird vorbereitet…',openPlayerEntry));
  campaignRetry.addEventListener('click',()=>guardedOpen(campaignRetry,'Wird erneut geladen…',()=>{configLoader.promise=null;clientLoader.promise=null;campaignLoader.promise=null;return openPlayerEntry()}));
  gmTab.addEventListener('click',()=>guardedOpen(gmTab,'Spielleitung wird vorbereitet…',openGmWorkspace));
  gmRetry.addEventListener('click',()=>guardedOpen(gmRetry,'Wird erneut geladen…',()=>{configLoader.promise=null;clientLoader.promise=null;gmLoader.promise=null;return openGmWorkspace()}));
  function resumePendingCampaignView(){
    const message=campaignView.querySelector('[data-auth-message]');
    if(app.classList.contains('campaign-workspace')&&message?.textContent.trim()==='Der Kampagnenzugang wird erst jetzt vorbereitet …')guardedOpen(campaignTab,'Kampagne wird vorbereitet…',openPlayerEntry);
  }
  window.addEventListener('pageshow',resumePendingCampaignView);
  window.addEventListener('focus',resumePendingCampaignView);
  window.addEventListener('hashchange',resumePendingCampaignView);
  queueMicrotask(resumePendingCampaignView);

  let navigationServices=null,navigationUnsubscribe=null,navigationEpoch=0;
  function setGameMasterAccess(allowed){gmTab.hidden=!allowed;if(!allowed&&gmTab.classList.contains('active'))campaignTab.click()}
  async function refreshAccountNavigation(services){
    const epoch=++navigationEpoch;
    try{
      if(services)navigationServices=services;
      if(!navigationServices){await loadBase();const Client=window.EberosSupabaseClient,provider=new Client.SupabaseClientProvider();navigationServices={auth:new Client.CampaignAuthGateway({provider}),repository:new Client.SupabaseCampaignRepository({provider})}}
      const {auth,repository}=navigationServices;if(!auth.configured()){if(epoch===navigationEpoch)setGameMasterAccess(false);return{authenticated:false,managedCampaigns:0}}
      const {user}=await auth.restoreSession();if(!user){if(epoch===navigationEpoch)setGameMasterAccess(false);return{authenticated:false,managedCampaigns:0}}
      const campaigns=await repository.listManagedCampaigns();if(epoch===navigationEpoch)setGameMasterAccess(campaigns.length>0);
      if(!services&&!navigationUnsubscribe)navigationUnsubscribe=await auth.onAuthStateChange(({user:changedUser})=>{if(!changedUser){navigationEpoch++;setGameMasterAccess(false)}else refreshAccountNavigation()});
      return{authenticated:true,managedCampaigns:campaigns.length,user}
    }catch{if(epoch===navigationEpoch)setGameMasterAccess(false);return{authenticated:false,managedCampaigns:0}}
  }
  window.addEventListener('eberos:campaign-auth-change',event=>{if(!event.detail?.user){navigationEpoch++;setGameMasterAccess(false)}else refreshAccountNavigation()});
  try{if(localStorage.getItem('eberos.campaign.auth.v1')||/(?:access_token|refresh_token)=/.test(location.hash))refreshAccountNavigation()}catch{}

  const runTestsBeforeV181=window.Eberos.runTests;
  function runTestsV181(){
    try{runTestsBeforeV181()}catch(error){console.error('Integrierte Regeltests',error)}const body=testResults.querySelector('tbody');for(const row of [...body.querySelectorAll('tr')])if(/^(Version 1\.7\.25|Revision r6|Schema 29|Version 1\.8\.0|Revision Release|Schema 30)$/.test(row.cells[0]?.textContent||''))row.remove();
    const tests=[],eq=(name,expected,actual)=>tests.push([name,expected,actual,expected===actual]),validation=core.validateDraftState(state),prepared=core.migrateDraftState(state,{appVersion:VERSION,schemaVersion:SCHEMA,now:()=>state.migrationLog?.at(-1)?.at||'stabil'}),active=ch();
    eq('Version 1.8.1',VERSION,window.Eberos.version);eq('Revision rollenbezogene Kampagnenreiter',REVISION,window.Eberos.revision);eq('Schema 31',SCHEMA,state.schemaVersion);eq('Regelstand 15',RULES,RULES_VERSION);eq('Kampagne ist Spieler-Hauptreiter','campaign-workspace',campaignTab.dataset.view);eq('Spielleitung ist geschützter Hauptreiter','gm-workspace',gmTab.dataset.view);eq('Open Play verwendet LocalDraftRepository','LocalDraftRepository',state.openPlay?.repository);eq('Lokaler Entwurf ist gültig',true,validation.ok);eq('Open-Play-Migration ist idempotent',JSON.stringify(state),JSON.stringify(prepared));eq('Kampagnenmodule starten verzögert',false,campaignLoader.isLoaded()||gmLoader.isLoaded());
    for(const test of tests)body.append(el('tr',{},[test[0],test[1],test[2],test[3]?'Bestanden':'Fehler'].map(value=>el('td',{text:String(value)}))));return[...body.querySelectorAll('tr')].every(row=>row.cells[row.cells.length-1]?.textContent==='Bestanden');
  }
  runTests=runTestsV181;testsBtn.onclick=runTestsV181;
  Object.assign(window.Eberos,{version:VERSION,revision:REVISION,schemaVersion:SCHEMA,rulesVersion:RULES,mode:'open_play',repository:'LocalDraftRepository',campaignModuleLoaded:()=>campaignLoader.isLoaded(),gameMasterModuleLoaded:()=>gmLoader.isLoaded(),campaignAuthLoaded:()=>clientLoader.isLoaded(),refreshAccountNavigation,validateDraftState:core.validateDraftState,migrateDraftState:core.migrateDraftState,validateCampaignTransition:core.validateCampaignTransition,prepareCampaignSubmission,applyCampaignReceipt,applySessionCbp,hasSessionCbp,listLocalCharacters,selectLocalCharacter,createLocalCharacter,runTests:runTestsV181});
  renderAll();save();
})();
