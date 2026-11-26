'use strict';
(function installCoinStandard(global){
  const standard=global.EBEROS_COIN_STANDARD;
  if(standard?.format!=='eberos-coin-standard')throw Error('Münzstandard fehlt.');
  const keys=['copper','silver','gold'];
  const count=value=>Number.isFinite(Number(value))?Math.max(0,Number(value)):0;
  const grams=owner=>keys.reduce((sum,key)=>sum+count(owner?.money?.[key])*standard.coins[key].weightGrams,0);
  const carriedGrams=owner=>owner?.moneyLoadState==='stored'?0:grams(owner);
  const kgText=value=>new Intl.NumberFormat('de-AT',{maximumFractionDigits:3}).format(value)+' kg';
  const previousLoad=loadSummaryV174;
  loadSummaryV174=function(owner,baseOverride=null){
    const result=previousLoad(owner,baseOverride),coinWeight=Math.round(carriedGrams(owner))/1000;
    const total=Math.round((result.total+coinWeight)*1000)/1000,capacity=result.capacity;
    const overweight=capacity===null?0:Math.max(0,Math.ceil((total-capacity)*10-1e-9)/10),penalty=overweight>0?Math.ceil(overweight/10):0;
    const base=baseOverride||baseAttributesV174(owner),finalStrength=base?Math.max(0,+base.ST-penalty):null;
    return {...result,coinWeight,total,overweight,penalty,finalStrength,strengthDeficit:finalStrength===null?0:Math.max(0,result.requiredStrength-finalStrength)};
  };
  const previousLoadCard=renderLoadCardV174;
  renderLoadCardV174=function(owner){
    const box=previousLoadCard(owner),summary=box.querySelector('.load-summary');
    const metric=el('div',{class:'load-metric coin-weight'},[el('span',{text:'Münzen'}),el('strong',{text:kgText(carriedGrams(owner)/1000)})]);
    if(summary)summary.insertBefore(metric,summary.children[2]||null);
    return box;
  };
  function renderMoney(owner){
    const box=el('div',{class:'coin-purse'}),grid=el('div',{class:'grid three compact-values'});
    owner.money=owner.money||{copper:0,silver:0,gold:0};
    for(const key of keys){
      const coin=standard.coins[key],input=el('input',{type:'number',min:0,step:1,value:count(owner.money[key]),'aria-label':coin.name+'münzen'});
      input.onchange=()=>{const value=Number(input.value);if(!Number.isSafeInteger(value)||value<0){input.value=String(count(owner.money[key]));showError('Bitte eine ganze, nicht negative Münzanzahl eingeben.');return}owner.money[key]=value;saveLoadV174(owner,true)};
      grid.append(el('label',{},[el('span',{text:coin.name+' ('+coin.weightGrams+' g)'}),input]));
    }
    const storage=el('select',{'aria-label':'Aufbewahrung der Münzen'});
    for(const [value,label] of [['carried','Mitgeführt'],['stored','Eingelagert']])storage.append(el('option',{value,text:label}));
    storage.value=owner.moneyLoadState==='stored'?'stored':'carried';
    storage.onchange=()=>{owner.moneyLoadState=storage.value;saveLoadV174(owner,true)};
    box.append(grid,el('label',{},[el('span',{text:'Aufbewahrung'}),storage]),el('p',{class:'coin-weight-summary',text:'Münzgewicht: '+kgText(grams(owner)/1000)+(storage.value==='stored'?' · eingelagert':' · zählt zur Beladung')}),el('p',{class:'muted',text:'100 Kupfer = 1 Silber · 100 Silber = 1 Gold. Regionale Prägungen verwenden im Inventar diese Referenzgewichte.'}));
    return box;
  }
  renderGoldCard=function(){return renderMoney(ch())};
  const previousCard=renderCardBody,previousAux=renderAuxCardBody;
  renderCardBody=function(card){return ['gold','money'].includes(card.type)?renderMoney(ch()):previousCard(card)};
  renderAuxCardBody=function(card,owner){return ['gold','money'].includes(card.type)?renderMoney(owner):previousAux(card,owner)};
  global.EberosCoins=Object.freeze({standard,grams,carriedGrams,renderMoney});
})(window);
