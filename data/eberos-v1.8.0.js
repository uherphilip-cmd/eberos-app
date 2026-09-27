'use strict';

/* Eberos v1.8.0 · Phase 2: Konten und sichere Kampagnenrollen */
(function installV180Foundation(){
  const VERSION='1.8.0',REVISION='release',SCHEMA=30,RULES=15,core=window.EberosOpenPlayCore;
  if(!core)throw new Error('Open-Play-Kern v1.8.0 fehlt.');
  if(typeof LOCAL_DRAFT_REPOSITORY==='undefined')throw new Error('LocalDraftRepository ist nicht mit dem Builder verbunden.');

  const commandService=new core.DraftCommandService({repository:LOCAL_DRAFT_REPOSITORY,appVersion:VERSION,schemaVersion:SCHEMA});
  state=commandService.save(state);

  const badge=document.getElementById('openPlayBadge'),joinButton=document.getElementById('joinCampaignBtn'),joinDialog=document.getElementById('campaignJoinDialog');
  if(!badge||!joinButton||!joinDialog)throw new Error('Open-Play-Oberfläche ist unvollständig.');
  badge.textContent='Open Play · lokal';badge.title='Dieser Entwurf bleibt auf diesem Gerät und benötigt kein Konto.';
  document.querySelector('.brand small').textContent='v'+VERSION;

  const configSource='./data/eberos-supabase-config-v1.8.0.js?v=1.8.0-release';
  const clientSource='./data/eberos-supabase-client-v1.8.0.js?v=1.8.0-release';
  const campaignSource='./data/eberos-campaign-entry-v1.8.0.js?v=1.8.0-release';
  const configLoader=new core.CampaignModuleLoader({document,source:configSource,globalName:'EberosSupabaseConfig'});
  const clientLoader=new core.CampaignModuleLoader({document,source:clientSource,globalName:'EberosSupabaseClient'});
  const campaignLoader=new core.CampaignModuleLoader({document,source:campaignSource,globalName:'EberosCampaignEntry'});
  async function loadCampaignEntry(){await configLoader.load();await clientLoader.load();return campaignLoader.load()}
  function prepareCampaignSubmission(character=ch()){
    const draftValidation=core.validateDraftState({...state,characters:[character],activeCharacterId:character.id});
    if(!draftValidation.ok)throw new Error(draftValidation.errors.join(' '));
    const costSummary=costs(character),required=[['Charaktername',String(character.name||'').trim()],['Gruppengrund',String(character.origin?.groupReason||'').trim()]];
    const invalid=required.filter(([,value])=>!value).map(([name])=>name);
    if(invalid.length)throw new Error(`Vor der Einreichung fehlt: ${invalid.join(', ')}.`);
    if(costSummary.rest<0)throw new Error(`Das CBP-Budget ist um ${Math.abs(costSummary.rest)} Punkte überschritten.`);
    const attributes=Object.values(character.attributes||{}),counters=Object.values(character.counters||{}),skills=Object.values(character.skills||{});
    if(attributes.some(value=>+value<1||+value>25)||counters.some(value=>+value.max<2||+value.max>25||+value.current<0||+value.current>+value.max)||skills.some(value=>+value.level<0||+value.level>25))throw new Error('Grundwerte, Counter oder Fähigkeiten liegen außerhalb der zulässigen Grenzen.');
    return{
      appVersion:VERSION,schemaVersion:SCHEMA,rulesVersion:RULES,catalogVersion:'v1.7.25-r6',
      character:structuredClone(character),clientCosts:structuredClone(costSummary),
      clientDerived:Object.fromEntries(derived(character).map(entry=>[entry.n,{value:entry.v,formula:entry.f}])),
      preparedAt:new Date().toISOString()
    };
  }
  function applyCampaignReceipt(receipt,{keepPrivateCopy=true}={}){
    const character=state.characters.find(item=>item.id===receipt?.character_id);if(!character)throw new Error('Die eingereichte lokale Figur wurde nicht gefunden.');
    if(keepPrivateCopy){
      const copy=structuredClone(character),copyId=crypto.randomUUID?crypto.randomUUID():`copy_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      copy.id=copyId;copy.name=`${copy.name||'Unbenannte Figur'} (private Kopie)`;copy.createdAt=new Date().toISOString();copy.updatedAt=copy.createdAt;
      copy.campaignProfile={characterId:copyId,status:'local_draft',campaignId:null,membershipId:null,initialRevisionId:null,currentRevisionId:null,revision:0,submittedAt:null,approvedAt:null,lockedAt:null};
      state.characters.push(copy);
    }
    character.campaignProfile={...(character.campaignProfile||{}),characterId:character.id,status:receipt.status||'submitted',campaignId:receipt.campaign_id,membershipId:receipt.membership_id||character.campaignProfile?.membershipId||null,currentRevisionId:receipt.revision_id||null,revision:+receipt.revision||1,submittedAt:new Date().toISOString()};
    state=commandService.save(state);renderAll();return character.campaignProfile;
  }
  joinButton.addEventListener('click',async()=>{
    joinButton.disabled=true;const previous=joinButton.textContent;joinButton.textContent='Kampagnenzugang wird vorbereitet…';
    try{const module=await loadCampaignEntry();if(!module?.open)throw new Error('Kampagneneinstieg ist nicht verfügbar.');await module.open({dialog:joinDialog,character:ch(),submissionFactory:()=>prepareCampaignSubmission(ch()),applyReceipt:(receipt,options)=>applyCampaignReceipt(receipt,options)})}
    catch(error){showError(error.message)}
    finally{joinButton.disabled=false;joinButton.textContent=previous}
  });

  const runTestsBeforeV180=window.Eberos.runTests;
  function runTestsV180(){
    try{runTestsBeforeV180()}catch(error){console.error('Integrierte Regeltests',error)}
    const body=testResults.querySelector('tbody');
    for(const row of [...body.querySelectorAll('tr')])if(/^(Version 1\.7\.25|Revision r6|Schema 29)$/.test(row.cells[0]?.textContent||''))row.remove();
    const tests=[],eq=(name,expected,actual)=>tests.push([name,expected,actual,expected===actual]),validation=core.validateDraftState(state),prepared=core.migrateDraftState(state,{appVersion:VERSION,schemaVersion:SCHEMA,now:()=>state.migrationLog?.at(-1)?.at||'stabil'}),active=ch();
    eq('Version 1.8.0',VERSION,window.Eberos.version);eq('Revision Release',REVISION,window.Eberos.revision);eq('Schema 30',SCHEMA,state.schemaVersion);eq('Regelstand 15',RULES,RULES_VERSION);
    eq('Open Play verwendet LocalDraftRepository','LocalDraftRepository',state.openPlay?.repository);eq('Lokaler Standardstatus','local_draft',active.campaignProfile?.status);eq('Stabile Figuren-ID',active.id,active.campaignProfile?.characterId);eq('Keine Kampagnenzuordnung im Open Play',null,active.campaignProfile?.campaignId);eq('Lokaler Entwurf ist gültig',true,validation.ok);eq('Open-Play-Migration ist idempotent',JSON.stringify(state),JSON.stringify(prepared));eq('Fixierter Status ist nicht direkt aus Open Play erreichbar',false,core.validateCampaignTransition('local_draft','approved_locked').ok);eq('Kampagnenmodul startet verzögert',false,campaignLoader.isLoaded());
    for(const test of tests)body.append(el('tr',{},[test[0],test[1],test[2],test[3]?'Bestanden':'Fehler'].map(value=>el('td',{text:String(value)}))));
    return[...body.querySelectorAll('tr')].every(row=>row.cells[row.cells.length-1]?.textContent==='Bestanden');
  }

  runTests=runTestsV180;testsBtn.onclick=runTestsV180;
  Object.assign(window.Eberos,{version:VERSION,revision:REVISION,schemaVersion:SCHEMA,rulesVersion:RULES,mode:'open_play',repository:'LocalDraftRepository',campaignModuleLoaded:()=>campaignLoader.isLoaded(),campaignAuthLoaded:()=>clientLoader.isLoaded(),validateDraftState:core.validateDraftState,migrateDraftState:core.migrateDraftState,validateCampaignTransition:core.validateCampaignTransition,prepareCampaignSubmission,applyCampaignReceipt,runTests:runTestsV180});
  renderAll();save();
})();
