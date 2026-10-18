'use strict';

/* Eberos v1.8.2 · Bedienbarkeit und Laufzeitentlastung */
(function installQualityV182(){
  const SEARCH_STORAGE_KEY='eberos.search-window.v1.8.2',SEARCH_DEBOUNCE_MS=110,DESKTOP_QUERY='(min-width: 851px) and (pointer: fine)';
  let cachedSearchIndex=null,searchIndexBuilds=0;

  const qualityStyle=document.createElement('style');
  qualityStyle.textContent=`
@media(min-width:851px){
  .app>.topbar{position:sticky!important;top:0!important;z-index:2000!important;isolation:isolate}
  .card{content-visibility:auto;contain-intrinsic-size:auto 430px}
}
.global-search-v179{z-index:2100!important}
.search-window-head-v182{display:flex;align-items:center;gap:.3rem;margin-bottom:.35rem;user-select:none}
.search-window-title-v182{flex:1;font-weight:700;padding-inline:.3rem;white-space:nowrap}
.search-window-head-v182 button{width:36px;min-height:36px;padding:0}
.search-window-drag-v182{cursor:grab;touch-action:none}
.search-window-drag-v182:active{cursor:grabbing}
.global-search-v179.search-minimized-v182{width:auto!important;min-width:0!important;padding:.25rem!important}
.global-search-v179.search-minimized-v182 .search-window-head-v182{margin:0}
.global-search-v179.search-minimized-v182 .search-window-title-v182{max-width:12rem}
.global-search-v179.search-minimized-v182 .global-search-box-v177,.global-search-v179.search-minimized-v182 .global-search-results-v177{display:none!important}
.gm-creature-values-v182{margin:.9rem 0;padding:.75rem;border:2px solid var(--accent-2);border-radius:10px;background:var(--panel)}
.gm-creature-values-v182>summary{font-family:var(--font-section);font-size:1.1rem;font-weight:700;cursor:pointer}
@media(max-width:850px){
  .search-window-drag-v182,.search-window-reset-v182{display:none!important}
  .search-window-title-v182{font-size:.9rem}
}
@media print{.search-window-head-v182{display:none!important}}
  `;
  document.head.append(qualityStyle);

  function invalidateSearchIndex(){cachedSearchIndex=null}
  if(typeof searchIndexV177==='function'){
    const searchIndexBeforeV182=searchIndexV177;
    searchIndexV177=function(){
      if(cachedSearchIndex)return cachedSearchIndex;
      searchIndexBuilds+=1;globalThis.__EBEROS_SEARCH_INDEX_BUILDS_V182=searchIndexBuilds;
      cachedSearchIndex=searchIndexBeforeV182();return cachedSearchIndex;
    };
  }
  if(typeof save==='function'){
    const saveBeforeV182=save;
    save=function(){invalidateSearchIndex();return saveBeforeV182.apply(this,arguments)};
  }
  if(typeof renderAll==='function'){
    const renderAllBeforeV182=renderAll;
    renderAll=function(){invalidateSearchIndex();return renderAllBeforeV182.apply(this,arguments)};
  }

  function readSearchState(){
    try{const value=JSON.parse(localStorage.getItem(SEARCH_STORAGE_KEY)||'null');return value&&typeof value==='object'?value:{}}
    catch{return{}}
  }
  function writeSearchState(value){try{localStorage.setItem(SEARCH_STORAGE_KEY,JSON.stringify(value))}catch{}}
  function installSearchWindow(){
    const host=document.getElementById('globalSearchV177');if(!host||host.dataset.qualityV182==='ready')return;
    host.dataset.qualityV182='ready';const box=host.querySelector('.global-search-box-v177'),results=host.querySelector('.global-search-results-v177'),input=box?.querySelector('input[type="search"]');if(!box||!results||!input)return;
    const head=document.createElement('div');head.className='search-window-head-v182';head.setAttribute('aria-label','Suchfenster steuern');
    const drag=document.createElement('button');drag.type='button';drag.className='search-window-drag-v182';drag.textContent='↕';drag.title='Suchfenster verschieben';drag.setAttribute('aria-label','Suchfenster verschieben');
    const title=document.createElement('span');title.className='search-window-title-v182';title.textContent='Builder-Suche';
    const reset=document.createElement('button');reset.type='button';reset.className='search-window-reset-v182';reset.textContent='⌂';reset.title='Standardposition wiederherstellen';reset.setAttribute('aria-label','Suchfenster auf Standardposition zurücksetzen');
    const toggle=document.createElement('button');toggle.type='button';toggle.className='search-window-toggle-v182';toggle.title='Suchfenster minimieren';toggle.setAttribute('aria-label','Suchfenster minimieren');
    head.append(drag,title,reset,toggle);host.prepend(head);
    let state=readSearchState(),dragState=null,debounceTimer=0;

    const persist=()=>writeSearchState(state);
    const clamp=(left,top)=>{
      const rect=host.getBoundingClientRect(),width=Math.max(rect.width,180),height=Math.max(rect.height,44),margin=6;
      return{left:Math.max(margin,Math.min(Number(left)||margin,innerWidth-width-margin)),top:Math.max(margin,Math.min(Number(top)||margin,innerHeight-height-margin))};
    };
    const applyPosition=()=>{
      if(!matchMedia(DESKTOP_QUERY).matches||!Number.isFinite(state.left)||!Number.isFinite(state.top)){host.style.removeProperty('left');host.style.removeProperty('top');host.style.removeProperty('right');host.style.removeProperty('bottom');return}
      const position=clamp(state.left,state.top);state={...state,...position};host.style.setProperty('left',`${position.left}px`,'important');host.style.setProperty('top',`${position.top}px`,'important');host.style.setProperty('right','auto','important');host.style.setProperty('bottom','auto','important');
    };
    const setCollapsed=(collapsed,{focus=false}={})=>{
      state.collapsed=!!collapsed;host.classList.toggle('search-minimized-v182',state.collapsed);box.hidden=state.collapsed;if(state.collapsed)results.hidden=true;
      toggle.textContent=state.collapsed?'⌕':'—';toggle.title=state.collapsed?'Suchfenster öffnen':'Suchfenster minimieren';toggle.setAttribute('aria-label',toggle.title);toggle.setAttribute('aria-expanded',String(!state.collapsed));persist();requestAnimationFrame(()=>{applyPosition();if(focus&&!state.collapsed)input.focus()});
    };
    toggle.addEventListener('click',()=>setCollapsed(!state.collapsed,{focus:true}));
    reset.addEventListener('click',()=>{state={collapsed:false};for(const property of['left','top','right','bottom'])host.style.removeProperty(property);persist();setCollapsed(false,{focus:true})});
    const moveTo=(left,top)=>{const next=clamp(left,top);state={...state,...next};applyPosition()};
    drag.addEventListener('pointerdown',event=>{
      if(!matchMedia(DESKTOP_QUERY).matches)return;event.preventDefault();const rect=host.getBoundingClientRect();dragState={pointerId:event.pointerId,startX:event.clientX,startY:event.clientY,left:rect.left,top:rect.top};drag.setPointerCapture?.(event.pointerId);
    });
    drag.addEventListener('pointermove',event=>{if(!dragState||dragState.pointerId!==event.pointerId)return;moveTo(dragState.left+event.clientX-dragState.startX,dragState.top+event.clientY-dragState.startY)});
    const finishDrag=event=>{if(!dragState||dragState.pointerId!==event.pointerId)return;dragState=null;persist()};
    drag.addEventListener('pointerup',finishDrag);drag.addEventListener('pointercancel',finishDrag);
    drag.addEventListener('keydown',event=>{
      if(!matchMedia(DESKTOP_QUERY).matches||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))return;event.preventDefault();const rect=host.getBoundingClientRect(),step=event.shiftKey?40:10,dx=event.key==='ArrowLeft'?-step:event.key==='ArrowRight'?step:0,dy=event.key==='ArrowUp'?-step:event.key==='ArrowDown'?step:0;moveTo(rect.left+dx,rect.top+dy);persist();
    });
    const inputBeforeV182=input.oninput;
    input.oninput=function(event){clearTimeout(debounceTimer);debounceTimer=setTimeout(()=>inputBeforeV182?.call(this,event),SEARCH_DEBOUNCE_MS)};
    addEventListener('resize',()=>{if(Number.isFinite(state.left)&&Number.isFinite(state.top)){applyPosition();persist()}},{passive:true});
    setCollapsed(state.collapsed===true);requestAnimationFrame(applyPosition);
  }

  function installStickyHeaderMeasurement(){
    const topbar=document.querySelector('.app>.topbar');if(!topbar)return;
    const measure=()=>document.documentElement.style.setProperty('--eberos-topbar-height-v182',`${Math.ceil(topbar.getBoundingClientRect().height)}px`);measure();
    if('ResizeObserver'in globalThis)new ResizeObserver(measure).observe(topbar);else addEventListener('resize',measure,{passive:true});
  }
  function scheduleOfflineWarmup(){
    if(!('serviceWorker'in navigator)||!location.protocol.startsWith('http'))return;
    const warm=()=>navigator.serviceWorker.ready.then(registration=>(registration.active||navigator.serviceWorker.controller)?.postMessage({type:'WARM_APP_SHELL'})).catch(()=>{});
    setTimeout(()=>{'requestIdleCallback'in globalThis?requestIdleCallback(warm,{timeout:15000}):warm()},5000);
  }

  installSearchWindow();installStickyHeaderMeasurement();scheduleOfflineWarmup();
  Object.assign(window.Eberos,{version:'1.8.2',revision:'quality',invalidateSearchIndexV182:invalidateSearchIndex,searchIndexBuildsV182:()=>searchIndexBuilds});
})();
