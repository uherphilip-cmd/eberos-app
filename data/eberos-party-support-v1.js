/* Shared, deterministic rules for the Builder and its regression tests. No random draws. */
(function(root){
 'use strict';
 const ATTRS=['ST','KS','GS','RF','FF','WL','IT','IN','CR','WN'],COUNTERS=['L','A','FO','M','GB','FS','HS','GL'];
 const TRAINING={warrior:['ST','KS'],ranger:['GS','WN'],thief:['FF','RF'],mage:['IT','IN']};
 const integer=(n,min=0)=>Number.isInteger(+n)&&+n>=min?+n:min;
 const key=o=>String(o.linkedEntityId||o.entityId||o.id||'');
 function create(){return{version:1,day:1,parties:[{id:'party-main',name:'Reisegruppe',memberIds:[],animals:[],trainingChoices:{},stock:{rations:0,fodder:0},transport:[]}],activePartyId:'party-main',consumption:{},grants:{},production:{},resourceCodes:{},claims:[],campSerial:0}}
 function ensure(s){if(!s||s.version!==1)return create();s.day=integer(s.day,1);for(const k of ['consumption','grants','production','resourceCodes'])s[k]||={};s.claims||=[];s.campSerial=integer(s.campSerial);return s}
 function party(s){return s.parties.find(p=>p.id===s.activePartyId)||s.parties[0]}
 function members(p,owners){const seen=new Set();return p.memberIds.map(id=>owners.find(o=>o.id===id)).filter(o=>o&&o.type!=='possession'&&!seen.has(key(o))&&seen.add(key(o)))}
 function assign(s,ownerId,partyId){for(const p of s.parties)p.memberIds=p.memberIds.filter(id=>id!==ownerId);const p=s.parties.find(p=>p.id===partyId);if(p)p.memberIds.push(ownerId)}
 function needs(s,p,owners){
  const animalIds=new Set((p.animals||[]).map(a=>a.ownerId).filter(Boolean)),people=members(p,owners).filter(o=>!animalIds.has(o.id)),unpaid=people.filter(o=>!s.consumption[`${s.day}:person:${key(o)}`]);
  const animals=[...new Map((p.animals||[]).map(a=>[String(a.ownerId||a.id),a])).values()];
  const unpaidAnimals=animals.filter(a=>!s.consumption[`${s.day}:animal:${a.ownerId||a.id}`]);
  return{people:people.length,animals:animals.length,rations:people.length,fodder:animals.reduce((n,a)=>n+integer(a.fodderPerDay),0),unpaid,unpaidAnimals,rationsDue:unpaid.length,fodderDue:unpaidAnimals.reduce((n,a)=>n+integer(a.fodderPerDay),0),unknownFodder:animals.filter(a=>a.fodderPerDay==null).length,missingMembers:p.memberIds.filter(id=>!owners.some(o=>o.id===id))};
 }
 function settle(s,p,owners){
  const n=needs(s,p,owners),stock=p.stock;
  for(const t of p.transport||[])if(t.kind==='ox-cart'&&(t.animalCount==null||integer(t.animalCount,1)!==t.animalCount||(p.animals||[]).filter(a=>a.draftForId===t.id).length<t.animalCount))throw new Error('Zugtierzahl und Zuordnung zum Ochsenkarren sind noch offen.');
  if(n.missingMembers.length)throw new Error('Ein Gruppenmitglied ist nicht verfügbar. Besetzung prüfen.');
  if(n.unknownFodder)throw new Error('Futterbedarf der Tiere ist noch offen.');
  if(stock.rations<n.rationsDue||stock.fodder<n.fodderDue)throw new Error(`Versorgung fehlt: ${n.rationsDue} Rationen, ${n.fodderDue} Futtereinheiten benötigt.`);
  stock.rations-=n.rationsDue;stock.fodder-=n.fodderDue;
  for(const o of n.unpaid)s.consumption[`${s.day}:person:${key(o)}`]={partyId:p.id,amount:1};
  for(const a of n.unpaidAnimals)s.consumption[`${s.day}:animal:${a.ownerId||a.id}`]={partyId:p.id,amount:integer(a.fodderPerDay)};
  return{rations:n.rationsDue,fodder:n.fodderDue};
 }
 function baseLimit(o,k){return integer(o.counters?.[k]?.max)}
 function normalizeGatherer(o){const sup=o?.campSupportV1;if(sup?.kind==='gather'){sup.period='completed-rest';sup.requiresWork=false;sup.cardText=(integer(sup.lots,1)===2?'2 Rohstofflose':'1 Rohstofflos')+' pro Rast\nGewöhnlicher regionaler Stapel'}return o}
 function gatherBalance(s,o){return integer(s.production[`rest-gather-balance:${key(o)}`])}
 function awardGathering(s,o){
  normalizeGatherer(o);if(o.campSupportV1?.kind!=='gather')return 0;
  const serial=integer(o.completedRestCountV1),award=`rest-gather-award:${key(o)}:${serial}`;
  if(!serial||s.production[award])return 0;
  const lots=integer(o.campSupportV1.lots,1);s.production[award]={lots,day:s.day};s.production[`rest-gather-balance:${key(o)}`]=gatherBalance(s,o)+lots;return lots;
 }
 function counterLimit(o,k,base=baseLimit(o,k)){return Math.min(25,base+(o.campBonusV1?.counterMax?.[k]?1:0))}
 function expire(o,limit=baseLimit){
  if(!o.campBonusV1)return false;delete o.campBonusV1;
  for(const k of COUNTERS)if(o.counters?.[k])o.counters[k].current=Math.min(integer(o.counters[k].current),limit(o,k));
  return true;
 }
 function eligible(o){const s=o.campSupportV1;return s&&integer(o.skills?.[s.mainSkillId]?.level)>=integer(s.minimumTeachingLevel,1)}
 function buffPlan(p,owners){
  const targets=members(p,owners),attrs={},counterMax={},sources=[];
  const teachers=targets.filter(eligible).sort((a,b)=>integer(b.skills[b.campSupportV1.mainSkillId]?.level)-integer(a.skills[a.campSupportV1.mainSkillId]?.level)||key(a).localeCompare(key(b)));
  const classes=new Set();
  for(const o of teachers){const s=o.campSupportV1;
   if(s.kind==='counter'&&COUNTERS.includes(s.target)){counterMax[s.target]=1;sources.push({sourceId:key(o),kind:s.kind,target:s.target})}
   if(s.kind==='attribute'&&ATTRS.includes(s.target)){attrs[s.target]=1;sources.push({sourceId:key(o),kind:s.kind,target:s.target})}
   if(s.kind==='training'&&!classes.has(s.trainingClass)){
    const choices=TRAINING[s.trainingClass];if(!choices)continue;const target=choices.includes(p.trainingChoices[s.trainingClass])?p.trainingChoices[s.trainingClass]:choices[0];attrs[target]=1;classes.add(s.trainingClass);sources.push({sourceId:key(o),kind:s.kind,trainingClass:s.trainingClass,target});
   }
  }
  return{targets,attrs,counterMax,sources};
 }
 function camp(s,p,owners,{regenerate=o=>{for(const k of COUNTERS)if(o.counters?.[k])o.counters[k].current=baseLimit(o,k)},limit=baseLimit}={}){
  // Supply validation is atomic and precedes every mutation of effects/counters.
  const consumption=settle(s,p,owners),plan=buffPlan(p,owners),serial=++s.campSerial;
  for(const o of plan.targets){expire(o,limit);regenerate(o);o.completedRestCountV1=(o.completedRestCountV1||0)+1;awardGathering(s,o);o.campBonusV1={day:s.day,partyId:p.id,serial,attributes:{...plan.attrs},counterMax:{...plan.counterMax},sources:plan.sources};
   for(const k of Object.keys(plan.counterMax)){const g=`${s.day}:${key(o)}:${k}`;if(!s.grants[g]){const old=integer(o.counters[k].current);o.counters[k].current=Math.min(limit(o,k)+1,25,old+1);s.grants[g]=serial}}
  }
  return{consumption,recipients:plan.targets.length,sources:plan.sources};
 }
 function normalRest(o,{regenerate=o=>{for(const k of COUNTERS)if(o.counters?.[k])o.counters[k].current=baseLimit(o,k)},limit=baseLimit,travel=null}={}){expire(o,limit);regenerate(o);o.completedRestCountV1=(o.completedRestCountV1||0)+1;if(travel)awardGathering(travel,o)}
 function transferRations(p,o,amount){amount=integer(amount,1);if(integer(o.rationTracker?.current)<amount)throw new Error('Nicht genügend persönliche Rationen.');o.rationTracker.current-=amount;p.stock.rations+=amount}
 function gather(s,p,o,{region,code,ordinary,claim}){
  const sup=o.campSupportV1;if(!p.memberIds.includes(o.id)||sup?.kind!=='gather')throw new Error('Kein Sammler dieser Reisegruppe.');
  if(!String(region||'').trim()||ordinary!==true)throw new Error('Den gewöhnlichen regional passenden Stapel bestätigen.');
  code=String(code||'').trim();if(!code||s.resourceCodes[code])throw new Error('Rohstoffcode fehlt oder wurde bereits eingelöst.');
  if(gatherBalance(s,o)<1)throw new Error('Kein offenes Rohstofflos. Erst eine Rast abschließen.');
  if(typeof claim!=='function')throw new Error('Der Code muss über die kanonische Rohstoffeinlösung geprüft werden.');
  const result=claim(code);if(result?.then)throw new Error('Asynchrone Einlösung hier nicht zulässig.');if(!result||result.ordinary!==true||result.region!==region)throw new Error('Kein passender gewöhnlicher regionaler Rohstoff.');
  s.resourceCodes[code]={day:s.day,sourceId:key(o),partyId:p.id};s.production[`rest-gather-balance:${key(o)}`]=gatherBalance(s,o)-1;s.claims.push({code,region,day:s.day,period:'completed-rest',sourceId:key(o),partyId:p.id,item:result.item});return result;
 }
 function cook(s,p,o,{ingredients,rations,worked,consume}){
  if(!p.memberIds.includes(o.id)||o.campSupportV1?.additionalService?.kind!=='cooking')throw new Error('Kein Koch dieser Gruppe.');
  if(!worked||!Array.isArray(ingredients)||!ingredients.length||ingredients.some(i=>i.edible!==true||!Number.isFinite(i.quantity)||i.quantity<=0)||integer(rations,1)!==rations)throw new Error('Essbare Zutaten, Menge, Ertrag und Arbeitszeit müssen feststehen.');
  if(typeof consume!=='function'||consume(ingredients,rations)!==true)throw new Error('Zutaten konnten nicht regelgerecht verbraucht werden.');
  const ledger=`${s.day}:${key(o)}:cook`,bonus=s.production[ledger]?0:1;s.production[ledger]=true;p.stock.rations+=rations+bonus;return{rations,bonus};
 }
 function barricades(s,p,o,{count,location,worked,materialsConfirmed}){
  if(!p.memberIds.includes(o.id)||o.campSupportV1?.service!=='barricades')throw new Error('Kein Bauleiter dieser Gruppe.');
  const ledger=`${key(o)}:barricades:rest-${o.completedRestCountV1||0}`;count=integer(count,1);const used=integer(s.production[ledger]);
  if(count+used>3||!worked||!materialsConfirmed||!String(location||'').trim())throw new Error('Höchstens drei Barrikaden; Werkzeug, Material, Zeit und Standort erforderlich.');
  s.production[ledger]=used+count;return Array.from({length:count},(_,i)=>({id:`${ledger}:${used+i}`,location,widthM:2,heightM:2,structure:4}));
 }
 root.EberosTravelParty={create,ensure,party,members,assign,needs,settle,counterLimit,expire,eligible,buffPlan,camp,normalRest,transferRations,normalizeGatherer,gatherBalance,awardGathering,gather,cook,barricades,ATTRS,COUNTERS,TRAINING,key};
})(globalThis);
