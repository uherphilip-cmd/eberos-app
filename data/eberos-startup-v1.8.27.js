'use strict';

/* Eberos v1.8.27: ein einziger sichtbarer Abschluss nach allen Fachmodulen. */
(()=>{
  const VERSION='1.8.43',REVISION='kataloge-1';
  const badge=document.querySelector('.brand small');if(badge)badge.textContent='v'+VERSION;
  Object.assign(window.Eberos,{version:VERSION,revision:REVISION});
  const drawCards=renderCards,drawAll=renderAll;
  renderCards=function(){return duringRender(drawCards,this,arguments)};
  renderAll=function(){return duringRender(drawAll,this,arguments)};
  Object.assign(window.Eberos,{attributeDefinitionRevision:ATTRIBUTE_DEFINITION_REVISION_R1});
  renderAll();save();
  const startupMetrics=Object.freeze({version:VERSION,revision:REVISION,renderCount:Number(globalThis.__EBEROS_STARTUP_RENDER_COUNT__||0),readyMs:Math.round(performance.now())});
  document.documentElement.dataset.eberosReady=VERSION;
  Object.assign(window.Eberos,{startupMetrics});
  window.dispatchEvent(new CustomEvent('eberos:ready',{detail:startupMetrics}));
})();
