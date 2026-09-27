'use strict';

/* Supabase wird ausschließlich nach der bewussten Kampagnenaktion initialisiert. */
(function installSupabaseClient(global){
  const AUTH_STORAGE_KEY='eberos.campaign.auth.v1';
  const PRIVATE_CACHE_PREFIX='eberos-private-';

  class CampaignBackendNotConfiguredError extends Error{
    constructor(){super('Das Supabase-Testprojekt ist noch nicht verbunden.');this.name='CampaignBackendNotConfiguredError';this.code='CAMPAIGN_BACKEND_NOT_CONFIGURED'}
  }

  function isConfigured(config){
    if(!config?.enabled)return false;
    try{
      const url=new URL(config.url);
      return url.protocol==='https:'&&/\.supabase\.(?:co|net)$/.test(url.hostname)&&typeof config.publishableKey==='string'&&config.publishableKey.startsWith('sb_publishable_');
    }catch{return false}
  }

  function createSessionStorageAdapter(storage){
    if(!storage||typeof storage.getItem!=='function')throw new TypeError('Für Kampagnensitzungen wird sessionStorage benötigt.');
    return Object.freeze({
      getItem:key=>storage.getItem(key),
      setItem:(key,value)=>storage.setItem(key,String(value)),
      removeItem:key=>storage.removeItem(key)
    });
  }

  function defaultScriptLoader(document,source){
    return new Promise((resolve,reject)=>{
      const selector=`script[data-supabase-sdk="${source}"]`,existing=document.querySelector(selector);
      if(existing){
        if(global.supabase?.createClient){resolve(global.supabase);return}
        existing.addEventListener('load',()=>resolve(global.supabase),{once:true});
        existing.addEventListener('error',()=>reject(new Error('Die sichere Kampagnenverbindung konnte nicht geladen werden.')),{once:true});
        return;
      }
      const script=document.createElement('script');
      script.src=source;script.async=true;script.dataset.supabaseSdk=source;
      script.addEventListener('load',()=>global.supabase?.createClient?resolve(global.supabase):reject(new Error('Das Supabase-SDK ist unvollständig.')),{once:true});
      script.addEventListener('error',()=>reject(new Error('Die sichere Kampagnenverbindung konnte nicht geladen werden.')),{once:true});
      document.head.append(script);
    });
  }

  async function clearPrivateCaches({storage=global.sessionStorage,cacheStorage=global.caches}={}){
    try{storage?.removeItem(AUTH_STORAGE_KEY);storage?.removeItem('eberos.campaign.private-cache.v1')}catch{}
    if(!cacheStorage?.keys)return;
    try{const keys=await cacheStorage.keys();await Promise.all(keys.filter(key=>key.startsWith(PRIVATE_CACHE_PREFIX)).map(key=>cacheStorage.delete(key)))}catch{}
  }

  class SupabaseClientProvider{
    constructor({config=global.EberosSupabaseConfig,document=global.document,storage=global.sessionStorage,scriptLoader=defaultScriptLoader,createClientFactory}={}){
      this.config=config;this.document=document;this.storage=storage;this.scriptLoader=scriptLoader;this.createClientFactory=createClientFactory;this.promise=null;
    }
    configured(){return isConfigured(this.config)}
    async getClient(){
      if(!this.configured())throw new CampaignBackendNotConfiguredError();
      if(this.promise)return this.promise;
      this.promise=(async()=>{
        const sdk=this.createClientFactory?null:await this.scriptLoader(this.document,this.config.sdkPath);
        const createClient=this.createClientFactory||sdk?.createClient;
        if(typeof createClient!=='function')throw new Error('Supabase konnte nicht initialisiert werden.');
        return createClient(this.config.url,this.config.publishableKey,{
          auth:{
            storage:createSessionStorageAdapter(this.storage),
            storageKey:AUTH_STORAGE_KEY,
            persistSession:true,
            autoRefreshToken:true,
            detectSessionInUrl:true,
            flowType:'implicit'
          },
          global:{headers:{'X-Client-Info':'eberos-character-builder/1.8.0'}}
        });
      })().catch(error=>{this.promise=null;throw error});
      return this.promise;
    }
  }

  class CampaignAuthGateway{
    constructor({provider=new SupabaseClientProvider()}={}){this.provider=provider;this.subscription=null}
    configured(){return this.provider.configured()}
    async restoreSession(){
      const client=await this.provider.getClient(),{data,error}=await client.auth.getSession();
      if(error)throw error;
      return{session:data?.session||null,user:data?.session?.user||null};
    }
    async requestMagicLink(email,{redirectTo=global.location?.href?.split('#')[0]}={}){
      const normalized=String(email||'').trim().toLowerCase();
      if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized))throw new Error('Bitte gib eine gültige E-Mail-Adresse ein.');
      const client=await this.provider.getClient(),{error}=await client.auth.signInWithOtp({email:normalized,options:{emailRedirectTo:redirectTo,shouldCreateUser:true}});
      if(error)throw error;
      return{email:normalized,sent:true};
    }
    async signOut(){
      let error=null;
      try{const client=await this.provider.getClient(),result=await client.auth.signOut({scope:'local'});error=result.error||null}catch(caught){error=caught}
      await clearPrivateCaches({storage:this.provider.storage});
      if(error)throw error;
      return{signedOut:true};
    }
    async onAuthStateChange(listener){
      const client=await this.provider.getClient(),result=client.auth.onAuthStateChange((event,session)=>listener({event,session,user:session?.user||null}));
      this.subscription=result?.data?.subscription||null;
      return()=>{this.subscription?.unsubscribe?.();this.subscription=null};
    }
  }

  class SupabaseCampaignRepository{
    constructor({provider=new SupabaseClientProvider()}={}){this.provider=provider}
    async rpc(name,parameters){const client=await this.provider.getClient(),{data,error}=await client.rpc(name,parameters);if(error)throw error;return data}
    async listPlayerCampaigns(){
      const client=await this.provider.getClient(),{data,error}=await client.from('campaign_player_view').select('campaign_id,world_id,name,summary,player_notes,current_day,role,archived_at').order('name');
      if(error)throw error;return Array.isArray(data)?data:[];
    }
    async listManagedCampaigns(){
      const client=await this.provider.getClient(),{data,error}=await client.from('campaign_management_view').select('campaign_id,world_id,name,summary,player_notes,current_day,gm_notes,role,archived_at').order('name');
      if(error)throw error;return Array.isArray(data)?data:[];
    }
    async listPlayerCharacters(){const client=await this.provider.getClient(),{data,error}=await client.from('campaign_character_player_view').select('character_id,campaign_id,status,revision,initial_revision_id,current_revision_id,rejection_reason,updated_at').order('updated_at',{ascending:false});if(error)throw error;return Array.isArray(data)?data:[]}
    async listPendingCharacters(campaignId){const client=await this.provider.getClient(),{data,error}=await client.from('campaign_pending_character_view').select('character_id,campaign_id,status,public_data,revision,current_revision_id,updated_at').eq('campaign_id',campaignId).order('updated_at',{ascending:false});if(error)throw error;return Array.isArray(data)?data:[]}
    createCampaign({worldName,campaignName,summary='',commandId=crypto.randomUUID()}){return this.rpc('create_campaign_bundle',{p_world_name:worldName,p_campaign_name:campaignName,p_summary:summary,p_command_id:commandId})}
    createInvite(campaignId,{label='',maxUses=1,expiresAt=null}={}){return this.rpc('create_campaign_invite',{p_campaign_id:campaignId,p_label:label,p_max_uses:maxUses,p_expires_at:expiresAt})}
    redeemInvite(code,{commandId=crypto.randomUUID()}={}){return this.rpc('redeem_campaign_invite',{p_code:String(code||'').trim(),p_command_id:commandId})}
    submitCharacter(campaignId,payload,{keepPrivateCopy=true,commandId=crypto.randomUUID()}={}){return this.rpc('submit_campaign_character',{p_campaign_id:campaignId,p_payload:payload,p_keep_private_copy:keepPrivateCopy,p_command_id:commandId})}
    reviewCharacter(characterId,decision,reason=''){return this.rpc('review_campaign_character',{p_character_id:characterId,p_decision:decision,p_reason:reason})}
    submitChange(characterId,payload,reason='',{commandId=crypto.randomUUID()}={}){return this.rpc('submit_character_change',{p_character_id:characterId,p_payload:payload,p_reason:reason,p_command_id:commandId})}
    reviewChange(requestId,decision,reason=''){return this.rpc('review_character_change',{p_request_id:requestId,p_decision:decision,p_reason:reason})}
    setCampaignDay(campaignId,day){return this.rpc('set_campaign_day',{p_campaign_id:campaignId,p_day:day})}
    async currentUser(){const client=await this.provider.getClient(),{data,error}=await client.auth.getSession();if(error)throw error;return data?.session?.user||null}
    async listSessions(campaignId){const client=await this.provider.getClient(),{data,error}=await client.from('game_sessions').select('id,campaign_id,title,session_date,depth,summary,player_visible,updated_at').eq('campaign_id',campaignId).order('session_date',{ascending:false});if(error)throw error;return Array.isArray(data)?data:[]}
    async createSession(campaignId,{title,date=null,depth='short',summary='',notes='',playerVisible=true}={}){const client=await this.provider.getClient(),user=await this.currentUser(),{data,error}=await client.from('game_sessions').insert({campaign_id:campaignId,title,session_date:date||null,depth,summary,notes,player_visible:playerVisible,created_by:user.id}).select('id,campaign_id,title,session_date,depth,summary,player_visible').single();if(error)throw error;return data}
    async listThreads(campaignId){const client=await this.provider.getClient(),{data,error}=await client.from('campaign_threads').select('id,campaign_id,title,details,status,player_visible,updated_at').eq('campaign_id',campaignId).order('updated_at',{ascending:false});if(error)throw error;return Array.isArray(data)?data:[]}
    async createThread(campaignId,{title,details='',playerVisible=true}={}){const client=await this.provider.getClient(),user=await this.currentUser(),{data,error}=await client.from('campaign_threads').insert({campaign_id:campaignId,title,details,player_visible:playerVisible,created_by:user.id}).select('id,campaign_id,title,details,status,player_visible').single();if(error)throw error;return data}
  }

  global.EberosSupabaseClient=Object.freeze({AUTH_STORAGE_KEY,PRIVATE_CACHE_PREFIX,CampaignBackendNotConfiguredError,isConfigured,createSessionStorageAdapter,clearPrivateCaches,SupabaseClientProvider,CampaignAuthGateway,SupabaseCampaignRepository});
})(globalThis);

