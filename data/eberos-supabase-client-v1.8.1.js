'use strict';

/* Supabase wird ausschließlich nach einer bewussten Kampagnen- oder Spielleitungsaktion initialisiert. */
(function installSupabaseClient(global){
  const AUTH_STORAGE_KEY='eberos.campaign.auth.v1';
  const PRIVATE_CACHE_PREFIX='eberos-private-';

  class CampaignBackendNotConfiguredError extends Error{
    constructor(){super('Das Supabase-Testprojekt ist noch nicht verbunden.');this.name='CampaignBackendNotConfiguredError';this.code='CAMPAIGN_BACKEND_NOT_CONFIGURED'}
  }

  function isConfigured(config){
    if(!config?.enabled)return false;
    try{const url=new URL(config.url);return url.protocol==='https:'&&/\.supabase\.(?:co|net)$/.test(url.hostname)&&typeof config.publishableKey==='string'&&config.publishableKey.startsWith('sb_publishable_')}catch{return false}
  }
  function createSessionStorageAdapter(storage){
    if(!storage||typeof storage.getItem!=='function')throw new TypeError('Für Kampagnensitzungen wird sessionStorage benötigt.');
    return Object.freeze({getItem:key=>storage.getItem(key),setItem:(key,value)=>storage.setItem(key,String(value)),removeItem:key=>storage.removeItem(key)});
  }
  function defaultScriptLoader(document,source){
    return new Promise((resolve,reject)=>{
      const selector=`script[data-supabase-sdk="${source}"]`,existing=document.querySelector(selector);
      if(existing){if(global.supabase?.createClient){resolve(global.supabase);return}existing.addEventListener('load',()=>resolve(global.supabase),{once:true});existing.addEventListener('error',()=>reject(new Error('Die sichere Kampagnenverbindung konnte nicht geladen werden.')),{once:true});return}
      const script=document.createElement('script');script.src=source;script.async=true;script.dataset.supabaseSdk=source;
      script.addEventListener('load',()=>global.supabase?.createClient?resolve(global.supabase):reject(new Error('Das Supabase-SDK ist unvollständig.')),{once:true});
      script.addEventListener('error',()=>reject(new Error('Die sichere Kampagnenverbindung konnte nicht geladen werden.')),{once:true});document.head.append(script);
    });
  }
  async function clearPrivateCaches({storage=global.sessionStorage,cacheStorage=global.caches}={}){
    try{storage?.removeItem(AUTH_STORAGE_KEY);storage?.removeItem('eberos.campaign.private-cache.v1')}catch{}
    if(!cacheStorage?.keys)return;
    try{const keys=await cacheStorage.keys();await Promise.all(keys.filter(key=>key.startsWith(PRIVATE_CACHE_PREFIX)).map(key=>cacheStorage.delete(key)))}catch{}
  }

  class SupabaseClientProvider{
    constructor({config=global.EberosSupabaseConfig,document=global.document,storage=global.sessionStorage,scriptLoader=defaultScriptLoader,createClientFactory}={}){this.config=config;this.document=document;this.storage=storage;this.scriptLoader=scriptLoader;this.createClientFactory=createClientFactory;this.promise=null}
    configured(){return isConfigured(this.config)}
    async getClient(){
      if(!this.configured())throw new CampaignBackendNotConfiguredError();if(this.promise)return this.promise;
      this.promise=(async()=>{const sdk=this.createClientFactory?null:await this.scriptLoader(this.document,this.config.sdkPath),createClient=this.createClientFactory||sdk?.createClient;if(typeof createClient!=='function')throw new Error('Supabase konnte nicht initialisiert werden.');return createClient(this.config.url,this.config.publishableKey,{auth:{storage:createSessionStorageAdapter(this.storage),storageKey:AUTH_STORAGE_KEY,persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,flowType:'implicit'},global:{headers:{'X-Client-Info':'eberos-character-builder/1.8.1'}}})})().catch(error=>{this.promise=null;throw error});
      return this.promise;
    }
  }

  class CampaignAuthGateway{
    constructor({provider=new SupabaseClientProvider()}={}){this.provider=provider;this.subscription=null}
    configured(){return this.provider.configured()}
    async restoreSession(){const client=await this.provider.getClient(),{data,error}=await client.auth.getSession();if(error)throw error;return{session:data?.session||null,user:data?.session?.user||null}}
    async requestMagicLink(email,{redirectTo=global.location?.href?.split('#')[0]}={}){const normalized=String(email||'').trim().toLowerCase();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized))throw new Error('Bitte gib eine gültige E-Mail-Adresse ein.');const client=await this.provider.getClient(),{error}=await client.auth.signInWithOtp({email:normalized,options:{emailRedirectTo:redirectTo,shouldCreateUser:true}});if(error)throw error;return{email:normalized,sent:true}}
    async signOut(){let error=null;try{const client=await this.provider.getClient(),result=await client.auth.signOut({scope:'local'});error=result.error||null}catch(caught){error=caught}await clearPrivateCaches({storage:this.provider.storage});if(error)throw error;return{signedOut:true}}
    async onAuthStateChange(listener){const client=await this.provider.getClient(),result=client.auth.onAuthStateChange((event,session)=>listener({event,session,user:session?.user||null}));this.subscription=result?.data?.subscription||null;return()=>{this.subscription?.unsubscribe?.();this.subscription=null}}
  }

  class SupabaseCampaignRepository{
    constructor({provider=new SupabaseClientProvider()}={}){this.provider=provider}
    async rpc(name,parameters){const client=await this.provider.getClient(),{data,error}=await client.rpc(name,parameters);if(error)throw error;return data}
    async rows(table,columns,configure){const client=await this.provider.getClient();let query=client.from(table).select(columns);if(configure)query=configure(query);const{data,error}=await query;if(error)throw error;return Array.isArray(data)?data:[]}
    listPlayerCampaigns(){return this.rows('campaign_player_view','campaign_id,world_id,name,summary,player_notes,current_day,role,archived_at',query=>query.order('name'))}
    async listManagedCampaigns(){
      const [viewRows,memberships]=await Promise.all([
        this.rows('campaign_management_view','campaign_id,world_id,name,summary,player_notes,current_day,gm_notes,role,archived_at',query=>query.order('name')),
        this.rows('campaign_memberships','campaign_id,role,status,archived_at',query=>query.in('role',['owner','game_master']).eq('status','active').is('archived_at',null))
      ]);
      const known=new Map(viewRows.map(row=>[row.campaign_id,row])),missing=memberships.filter(row=>!known.has(row.campaign_id));
      if(!missing.length)return viewRows;
      const ids=missing.map(row=>row.campaign_id),roles=new Map(missing.map(row=>[row.campaign_id,row.role])),campaigns=await this.rows('campaigns','id,world_id,name,summary,player_notes,current_day,archived_at',query=>query.in('id',ids).is('archived_at',null).order('name'));
      let secrets=[];try{secrets=await this.rows('campaign_secrets','campaign_id,gm_notes',query=>query.in('campaign_id',ids))}catch{}
      const notes=new Map(secrets.map(row=>[row.campaign_id,row.gm_notes||'']));
      for(const campaign of campaigns)known.set(campaign.id,{campaign_id:campaign.id,world_id:campaign.world_id,name:campaign.name,summary:campaign.summary||'',player_notes:campaign.player_notes||'',current_day:campaign.current_day||1,gm_notes:notes.get(campaign.id)||'',role:roles.get(campaign.id)||'game_master',archived_at:campaign.archived_at||null});
      return[...known.values()].sort((left,right)=>String(left.name||'').localeCompare(String(right.name||''),'de'))
    }
    listManagedWorlds(){return this.rows('world_management_view','world_id,name,summary,owner_user_id,archived_at',query=>query.order('name'))}
    listPlayerCharacters(){return this.rows('campaign_character_player_view','character_id,campaign_id,status,revision,initial_revision_id,current_revision_id,rejection_reason,updated_at',query=>query.order('updated_at',{ascending:false}))}
    listCampaignCharacters(campaignId){return this.rows('campaign_characters','id,campaign_id,owner_user_id,status,public_data,revision,updated_at',query=>query.eq('campaign_id',campaignId).is('archived_at',null).order('updated_at',{ascending:false}))}
    listPendingCharacters(campaignId){return this.rows('campaign_pending_character_view','character_id,campaign_id,status,public_data,revision,current_revision_id,updated_at',query=>query.eq('campaign_id',campaignId).order('updated_at',{ascending:false}))}
    listSessions(campaignId){return this.rows('campaign_session_management_view','session_id,campaign_id,title,session_date,depth,summary,notes,player_visible,status,default_cbp,eligible_character_count,claimed_count,updated_at',query=>query.eq('campaign_id',campaignId).order('session_date',{ascending:false}))}
    listCharacterSessions(characterId){return this.rows('character_session_cbp_view','session_id,campaign_id,character_id,title,session_date,status,player_visible,amount,ledger_id,claimed_at',query=>query.eq('character_id',characterId).order('session_date',{ascending:false}))}
    listThreads(campaignId){return this.rows('campaign_threads','id,campaign_id,title,details,status,player_visible,updated_at',query=>query.eq('campaign_id',campaignId).order('updated_at',{ascending:false}))}
    listHiddenImpacts(campaignId){return this.rows('campaign_event_impacts','id,world_id,source_campaign_id,source_session_id,target_campaign_id,impact_summary,status,player_visible,updated_at',query=>query.eq('target_campaign_id',campaignId).order('updated_at',{ascending:false}))}
    createCampaign({worldId=null,worldName='',campaignName,summary='',commandId=crypto.randomUUID()}){return worldId?this.rpc('create_campaign_in_world',{p_world_id:worldId,p_campaign_name:campaignName,p_summary:summary,p_command_id:commandId}):this.rpc('create_campaign_bundle',{p_world_name:worldName,p_campaign_name:campaignName,p_summary:summary,p_command_id:commandId})}
    updateCampaign(campaignId,{name,summary='',playerNotes='',gmNotes='',currentDay=1}){return this.rpc('update_campaign_profile',{p_campaign_id:campaignId,p_name:name,p_summary:summary,p_player_notes:playerNotes,p_gm_notes:gmNotes,p_current_day:currentDay})}
    createInvite(campaignId,{label='',maxUses=1,expiresAt=null}={}){return this.rpc('create_campaign_invite',{p_campaign_id:campaignId,p_label:label,p_max_uses:maxUses,p_expires_at:expiresAt})}
    redeemInvite(code,{commandId=crypto.randomUUID()}={}){return this.rpc('redeem_campaign_invite',{p_code:String(code||'').trim(),p_command_id:commandId})}
    submitCharacter(campaignId,payload,{keepPrivateCopy=true,commandId=crypto.randomUUID()}={}){return this.rpc('submit_campaign_character',{p_campaign_id:campaignId,p_payload:payload,p_keep_private_copy:keepPrivateCopy,p_command_id:commandId})}
    reviewCharacter(characterId,decision,reason=''){return this.rpc('review_campaign_character',{p_character_id:characterId,p_decision:decision,p_reason:reason})}
    submitChange(characterId,payload,reason='',{commandId=crypto.randomUUID()}={}){return this.rpc('submit_character_change',{p_character_id:characterId,p_payload:payload,p_reason:reason,p_command_id:commandId})}
    reviewChange(requestId,decision,reason=''){return this.rpc('review_character_change',{p_request_id:requestId,p_decision:decision,p_reason:reason})}
    setCampaignDay(campaignId,day){return this.rpc('set_campaign_day',{p_campaign_id:campaignId,p_day:day})}
    createSession(campaignId,{title,date=null,depth='short',summary='',notes='',playerVisible=true,status='planned',defaultCbp=0,crossCampaignDraft=false,impactSummary='',commandId=crypto.randomUUID()}={}){return this.rpc('create_game_session',{p_campaign_id:campaignId,p_title:title,p_session_date:date||null,p_depth:depth,p_summary:summary,p_notes:notes,p_player_visible:playerVisible,p_status:status,p_default_cbp:defaultCbp,p_cross_campaign_draft:crossCampaignDraft,p_impact_summary:impactSummary,p_command_id:commandId})}
    claimSessionCbp(sessionId,characterId,{commandId=crypto.randomUUID()}={}){return this.rpc('claim_session_cbp',{p_session_id:sessionId,p_character_id:characterId,p_command_id:commandId})}
    async currentUser(){const client=await this.provider.getClient(),{data,error}=await client.auth.getSession();if(error)throw error;return data?.session?.user||null}
    async createThread(campaignId,{title,details='',playerVisible=true}={}){const client=await this.provider.getClient(),user=await this.currentUser(),{data,error}=await client.from('campaign_threads').insert({campaign_id:campaignId,title,details,player_visible:playerVisible,created_by:user.id}).select('id,campaign_id,title,details,status,player_visible').single();if(error)throw error;return data}
  }

  global.EberosSupabaseClient=Object.freeze({AUTH_STORAGE_KEY,PRIVATE_CACHE_PREFIX,CampaignBackendNotConfiguredError,isConfigured,createSessionStorageAdapter,clearPrivateCaches,SupabaseClientProvider,CampaignAuthGateway,SupabaseCampaignRepository});
})(globalThis);
