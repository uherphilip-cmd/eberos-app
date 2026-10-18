'use strict';

/* Eberos v1.8.16: ein einziger sichtbarer Abschluss nach allen Fachmodulen. */
(()=>{
  const VERSION='1.8.16',REVISION='expanded-archetype-catalog';
  const badge=document.querySelector('.brand small');if(badge)badge.textContent='v'+VERSION;
  Object.assign(window.Eberos,{version:VERSION,revision:REVISION});
  renderAll();save();
  const startupMetrics=Object.freeze({version:VERSION,revision:REVISION,renderCount:Number(globalThis.__EBEROS_STARTUP_RENDER_COUNT__||0),readyMs:Math.round(performance.now())});
  document.documentElement.dataset.eberosReady=VERSION;
  Object.assign(window.Eberos,{startupMetrics});
  window.dispatchEvent(new CustomEvent('eberos:ready',{detail:startupMetrics}));
})();
