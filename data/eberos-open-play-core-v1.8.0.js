'use strict';

/* Reine Architekturbausteine für Open Play und die spätere Kampagnen-API. */
(function installOpenPlayCore(global){
  const CAMPAIGN_STATUSES=Object.freeze(['local_draft','claimed','submitted','approved_locked','active','retired','archived']);
  const CAMPAIGN_TRANSITIONS=Object.freeze({
    local_draft:Object.freeze(['claimed']),
    claimed:Object.freeze(['local_draft','submitted']),
    submitted:Object.freeze(['claimed','approved_locked']),
    approved_locked:Object.freeze(['active','retired']),
    active:Object.freeze(['retired']),
    retired:Object.freeze(['archived']),
    archived:Object.freeze([])
  });

  function clone(value){
    if(typeof structuredClone==='function')return structuredClone(value);
    return JSON.parse(JSON.stringify(value));
  }
  function textOrNull(value){return typeof value==='string'&&value.trim()?value.trim():null}
  function nonNegativeInteger(value){const number=Number(value);return Number.isInteger(number)&&number>=0?number:0}

  function validateDraftState(candidate){
    const errors=[];
    if(!candidate||typeof candidate!=='object'||Array.isArray(candidate))errors.push('Der Entwurf muss ein Objekt sein.');
    const characters=Array.isArray(candidate?.characters)?candidate.characters:[];
    if(!characters.length)errors.push('Mindestens eine Figur ist erforderlich.');
    const ids=new Set();
    characters.forEach((character,index)=>{
      if(!character||typeof character!=='object'||Array.isArray(character)){errors.push(`Figur ${index+1} ist ungültig.`);return}
      const id=textOrNull(character.id);
      if(!id)errors.push(`Figur ${index+1} besitzt keine stabile ID.`);
      else if(ids.has(id))errors.push(`Die Figuren-ID ${id} ist doppelt vorhanden.`);
      else ids.add(id);
      const status=character.campaignProfile?.status;
      if(status&&!CAMPAIGN_STATUSES.includes(status))errors.push(`Die Figur ${id||index+1} besitzt den unbekannten Kampagnenstatus ${status}.`);
    });
    if(candidate?.activeCharacterId&&!ids.has(candidate.activeCharacterId))errors.push('Die aktive Figuren-ID verweist auf keine vorhandene Figur.');
    return{ok:errors.length===0,errors};
  }

  function normalizeCampaignProfile(character,existing={}){
    const status=CAMPAIGN_STATUSES.includes(existing.status)?existing.status:'local_draft';
    return{
      characterId:textOrNull(existing.characterId)||character.id,
      status,
      campaignId:textOrNull(existing.campaignId),
      membershipId:textOrNull(existing.membershipId),
      initialRevisionId:textOrNull(existing.initialRevisionId),
      currentRevisionId:textOrNull(existing.currentRevisionId),
      revision:nonNegativeInteger(existing.revision),
      submittedAt:textOrNull(existing.submittedAt),
      approvedAt:textOrNull(existing.approvedAt),
      lockedAt:textOrNull(existing.lockedAt)
    };
  }

  function migrateDraftState(input,{appVersion='1.8.0',schemaVersion=30,now=()=>new Date().toISOString()}={}){
    if(!input||typeof input!=='object'||Array.isArray(input))throw new TypeError('Nur ein gültiger lokaler Entwurf kann migriert werden.');
    const data=clone(input),fromSchema=nonNegativeInteger(data.schemaVersion),first=!data.v180OpenPlayMigrationDone;
    data.characters=Array.isArray(data.characters)?data.characters:[];
    data.characters=data.characters.map(character=>{
      const next={...character};
      next.campaignProfile=normalizeCampaignProfile(next,next.campaignProfile&&typeof next.campaignProfile==='object'?next.campaignProfile:{});
      return next;
    });
    data.openPlay={
      mode:'local',
      repository:'LocalDraftRepository',
      status:'local_draft',
      ...(data.openPlay&&typeof data.openPlay==='object'?data.openPlay:{}),
      mode:'local',
      repository:'LocalDraftRepository',
      status:'local_draft'
    };
    data.appVersion=appVersion;
    data.schemaVersion=schemaVersion;
    data.campaignArchitectureVersion=1;
    data.v180OpenPlayMigrationDone=true;
    if(first){
      data.migrationLog=Array.isArray(data.migrationLog)?data.migrationLog:[];
      data.migrationLog.push({from:fromSchema,to:schemaVersion,at:now(),changes:['Lokale Entwürfe hinter LocalDraftRepository gekapselt','Migrationsfähige Kampagnenstatus- und Revisionsfelder ergänzt','Open Play als kontoloser Standardmodus gekennzeichnet'],fromApp:input.appVersion||'unbekannt',toApp:appVersion});
    }
    return data;
  }

  function validateCampaignTransition(from,to){
    if(!CAMPAIGN_STATUSES.includes(from)||!CAMPAIGN_STATUSES.includes(to))return{ok:false,reason:'Unbekannter Kampagnenstatus'};
    if(from===to)return{ok:true,reason:'Keine Statusänderung'};
    const ok=CAMPAIGN_TRANSITIONS[from].includes(to);
    return{ok,reason:ok?'Erlaubter Übergang':`Übergang ${from} → ${to} ist nicht erlaubt`};
  }

  class LocalDraftRepository{
    constructor({storage,key}){
      if(!storage||typeof storage.getItem!=='function'||typeof storage.setItem!=='function')throw new TypeError('LocalDraftRepository benötigt einen Storage-Adapter.');
      if(!key)throw new TypeError('LocalDraftRepository benötigt einen Speicherschlüssel.');
      this.storage=storage;this.key=key;
    }
    readRaw(){return this.storage.getItem(this.key)}
    load(fallbackFactory){
      const fallback=typeof fallbackFactory==='function'?fallbackFactory:()=>clone(fallbackFactory);
      const raw=this.readRaw();if(!raw)return fallback();
      try{const parsed=JSON.parse(raw);return parsed&&typeof parsed==='object'&&!Array.isArray(parsed)?parsed:fallback()}catch{return fallback()}
    }
    save(data){
      const validation=validateDraftState(data);if(!validation.ok)throw new Error(validation.errors.join(' '));
      this.storage.setItem(this.key,JSON.stringify(data));return data;
    }
    backup(label,data){
      const safe=String(label||'backup').replace(/[^a-z0-9._-]+/gi,'-');
      const key=`${this.key}.backup.${safe}.${Date.now()}`;
      this.storage.setItem(key,JSON.stringify(data));return key;
    }
  }

  class CampaignRepository{
    constructor(){this.available=false}
    async joinCampaign(){throw new Error('CAMPAIGN_BACKEND_NOT_CONFIGURED')}
    async loadCampaign(){throw new Error('CAMPAIGN_BACKEND_NOT_CONFIGURED')}
    async saveCampaignCommand(){throw new Error('CAMPAIGN_BACKEND_NOT_CONFIGURED')}
  }

  class DraftCommandService{
    constructor({repository,appVersion='1.8.0',schemaVersion=30}){this.repository=repository;this.appVersion=appVersion;this.schemaVersion=schemaVersion}
    prepare(data){const migrated=migrateDraftState(data,{appVersion:this.appVersion,schemaVersion:this.schemaVersion}),validation=validateDraftState(migrated);if(!validation.ok)throw new Error(validation.errors.join(' '));return migrated}
    save(data){const prepared=this.prepare(data);this.repository.save(prepared);return prepared}
  }

  class CampaignModuleLoader{
    constructor({document,source,globalName='EberosCampaignEntry'}){this.document=document;this.source=source;this.globalName=globalName;this.promise=null}
    isLoaded(){return !!this.document.querySelector(`script[data-campaign-module="${this.source}"]`)}
    load(){
      if(this.promise)return this.promise;
      this.promise=new Promise((resolve,reject)=>{
        const existing=this.document.querySelector(`script[data-campaign-module="${this.source}"]`);
        if(existing){if(global[this.globalName])resolve(global[this.globalName]);else existing.addEventListener('load',()=>resolve(global[this.globalName]),{once:true});return}
        const script=this.document.createElement('script');script.src=this.source;script.async=true;script.dataset.campaignModule=this.source;script.addEventListener('load',()=>resolve(global[this.globalName]),{once:true});script.addEventListener('error',()=>{this.promise=null;reject(new Error('Kampagnenmodul konnte nicht geladen werden.'))},{once:true});this.document.head.append(script);
      });
      return this.promise;
    }
  }

  global.EberosOpenPlayCore=Object.freeze({CAMPAIGN_STATUSES,CAMPAIGN_TRANSITIONS,validateDraftState,migrateDraftState,validateCampaignTransition,LocalDraftRepository,CampaignRepository,DraftCommandService,CampaignModuleLoader});
})(globalThis);

