'use strict';

/* Eberos v1.8.8 · Hauptreiter in der festen Desktop-Kopfzeile */
(()=>{
  const VERSION='1.8.8',REVISION='sticky-tabs',shell=document.querySelector('.sticky-shell-v188');
  if(!shell)throw new Error('Gemeinsame Kopfzeile für Hauptreiter fehlt.');
  const syncHeight=()=>document.documentElement.style.setProperty('--eberos-sticky-header-height',`${Math.ceil(shell.getBoundingClientRect().height)}px`);
  syncHeight();
  if('ResizeObserver'in window)new ResizeObserver(syncHeight).observe(shell);
  window.addEventListener('resize',syncHeight,{passive:true});
  Object.assign(window.Eberos,{version:VERSION,revision:REVISION,stickyTabs:true,syncStickyHeaderHeight:syncHeight});
})();
