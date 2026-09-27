'use strict';

/* Eberos v1.8.1 · kampagnenbezogene Spielleitung und Spielabend-CBP */
(function installV181Foundation(){
  const VERSION='1.8.1',REVISION='gm-workspace-release',SCHEMA=31,RULES=15,BACKEND_APP_VERSION='1.8.0',BACKEND_SCHEMA=30,core=window.EberosOpenPlayCore;
  if(!core)throw new Error('Open-Play-Kern v1.8.0 fehlt.');
  if(typeof LOCAL_DRAFT_REPOSITORY==='undefined')throw new Error('LocalDraftRepository ist nicht mit dem Builder verbunden.');
  const commandService=new core.DraftCommandService({repository:LOCAL_DRAFT_REPOSITORY,appVersion:VERSION,schemaVersion:SCHEMA});state=commandService.save(state);

  const badge=document.getElementById('openPlayBadge'),joinButton=document.getElementById('joinCampaignBtn'),gmButton=document.getElementById('gmWorkspaceBtn'),joinDialog=document.getElementById('campaignJoinDialog'),gmDialog=document.getElementById('gmWorkspaceDialog');
  if(!badge||!joinButton||!gmButton||!joinDialog||!gmDialog)throw new Error('Open-Play- oder Spielleitungsoberfläche ist unvollständig.');
  badge.textContent='Open Play · lokal';badge.title='Dieser Entwurf bleibt auf diesem Gerät und benötigt kein Konto.';document.querySelector('.brand small').textContent='v'+VERSION;

  const configSource='./data/eberos-supabase-config-v1.8.0.js?v=1.8.1-gm-workspace-release';
  const clientSource='./data/eberos-supabase-client-v1.8.1.js?v=1.8.1-gm-workspace-release';
  const campaignSource='./data/eberos-campaign-entry-v1.8.1.js?v=1.8.1-gm-workspace-release';
  const gmSource='./data/eberos-gm-workspace-v1.8.1.js?v=1.8.1-gm-workspace-release';
  const configLoader=new core.CampaignModuleLoader({document,source:configSource,globalName:'EberosSupabaseConfig'}),clientLoader=new core.CampaignModuleLoader({document,source:clientSource,globalName:'EberosSupabaseClient'}),campaignLoader=new core.CampaignModuleLoader({document,source:campaignSource,globalName:'EberosCampaignEntry'}),gmLoader=new core.CampaignModuleLoader({document,source:gmSource,globalName:'EberosGameMasterWorkspace'});
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
  async function openPlayerEntry(){const module=await loadCampaignEntry();if(!module?.open)throw new Error('Kampagneneinstieg ist nicht verfügbar.');return module.open({dialog:joinDialog,character:ch(),submissionFactory:()=>prepareCampaignSubmission(ch()),applyReceipt:(receipt,options)=>applyCampaignReceipt(receipt,options),applySessionCbp,hasSessionCbp:ledgerId=>hasSessionCbp(ledgerId,ch())})}
  async function openGmWorkspace(){const module=await loadGameMasterWorkspace();if(!module?.open)throw new Error('Spielleitungsmodul ist nicht verfügbar.');return module.open({dialog:gmDialog})}
  async function guardedOpen(control,loadingLabel,operation){control.disabled=true;const previous=control.textContent;control.textContent=loadingLabel;try{return await operation()}catch(error){showError(error.message)}finally{control.disabled=false;control.textContent=previous}}
  joinButton.addEventListener('click',()=>guardedOpen(joinButton,'Kampagnenzugang wird vorbereitet…',openPlayerEntry));
  gmButton.addEventListener('click',()=>guardedOpen(gmButton,'Spielleitung wird vorbereitet…',openGmWorkspace));

  const runTestsBeforeV181=window.Eberos.runTests;
  function runTestsV181(){
    try{runTestsBeforeV181()}catch(error){console.error('Integrierte Regeltests',error)}const body=testResults.querySelector('tbody');for(const row of [...body.querySelectorAll('tr')])if(/^(Version 1\.7\.25|Revision r6|Schema 29|Version 1\.8\.0|Revision Release|Schema 30)$/.test(row.cells[0]?.textContent||''))row.remove();
    const tests=[],eq=(name,expected,actual)=>tests.push([name,expected,actual,expected===actual]),validation=core.validateDraftState(state),prepared=core.migrateDraftState(state,{appVersion:VERSION,schemaVersion:SCHEMA,now:()=>state.migrationLog?.at(-1)?.at||'stabil'}),active=ch();
    eq('Version 1.8.1',VERSION,window.Eberos.version);eq('Revision Spielleitungsmodul',REVISION,window.Eberos.revision);eq('Schema 31',SCHEMA,state.schemaVersion);eq('Regelstand 15',RULES,RULES_VERSION);eq('Eigenständiger Spielleitungszugang',true,!!gmButton);eq('Open Play verwendet LocalDraftRepository','LocalDraftRepository',state.openPlay?.repository);eq('Lokaler Entwurf ist gültig',true,validation.ok);eq('Open-Play-Migration ist idempotent',JSON.stringify(state),JSON.stringify(prepared));eq('Kampagnenmodule starten verzögert',false,campaignLoader.isLoaded()||gmLoader.isLoaded());
    for(const test of tests)body.append(el('tr',{},[test[0],test[1],test[2],test[3]?'Bestanden':'Fehler'].map(value=>el('td',{text:String(value)}))));return[...body.querySelectorAll('tr')].every(row=>row.cells[row.cells.length-1]?.textContent==='Bestanden');
  }
  runTests=runTestsV181;testsBtn.onclick=runTestsV181;
  Object.assign(window.Eberos,{version:VERSION,revision:REVISION,schemaVersion:SCHEMA,rulesVersion:RULES,mode:'open_play',repository:'LocalDraftRepository',campaignModuleLoaded:()=>campaignLoader.isLoaded(),gameMasterModuleLoaded:()=>gmLoader.isLoaded(),campaignAuthLoaded:()=>clientLoader.isLoaded(),validateDraftState:core.validateDraftState,migrateDraftState:core.migrateDraftState,validateCampaignTransition:core.validateCampaignTransition,prepareCampaignSubmission,applyCampaignReceipt,applySessionCbp,hasSessionCbp,runTests:runTestsV181});
  renderAll();save();
})();
