'use strict';

/* Eberos v1.8.7 · stabile Scrollposition beim Bearbeiten von Fähigkeiten */
(()=>{
  const VERSION='1.8.7',REVISION='skill-scroll-stability';
  let pendingAnchor=null;
  const metrics={captures:0,restores:0,lastSkillId:'',lastRequestedY:0,lastActualY:0};

  function captureSkillAnchor(input){
    if(!(input instanceof HTMLInputElement)||!input.matches('input.skill-level'))return null;
    const row=input.closest('tr[data-skill-id]'),scroll=row?.closest('.scroll');
    if(!row)return null;
    return{skillId:row.dataset.skillId,pageX:window.scrollX,pageY:window.scrollY,scrollLeft:scroll?.scrollLeft||0,scrollTop:scroll?.scrollTop||0};
  }

  function matchingSkillRow(skillId){
    const rows=[...document.querySelectorAll('tr[data-skill-id]')].filter(row=>row.dataset.skillId===skillId);
    return rows.find(row=>row.getClientRects().length&&!row.hidden)||rows[0]||null;
  }

  function restoreSkillAnchor(anchor){
    if(!anchor)return;
    const row=matchingSkillRow(anchor.skillId),scroll=row?.closest('.scroll');
    if(scroll){scroll.scrollLeft=anchor.scrollLeft;scroll.scrollTop=anchor.scrollTop}
    window.scrollTo(anchor.pageX,anchor.pageY);
  }

  document.addEventListener('change',event=>{
    const anchor=captureSkillAnchor(event.target);
    if(anchor){pendingAnchor=anchor;metrics.captures++;metrics.lastSkillId=anchor.skillId;metrics.lastRequestedY=anchor.pageY}
  },true);

  function settleSkillAnchor(anchor){
    const root=document.documentElement,body=document.body,rootOverflowAnchor=root.style.overflowAnchor,bodyOverflowAnchor=body.style.overflowAnchor;
    root.style.overflowAnchor='none';body.style.overflowAnchor='none';
    let frame=0;
    const settle=()=>{
      restoreSkillAnchor(anchor);metrics.restores++;metrics.lastActualY=window.scrollY;
      if(++frame<8){requestAnimationFrame(settle);return}
      setTimeout(()=>{restoreSkillAnchor(anchor);metrics.restores++;metrics.lastActualY=window.scrollY;root.style.overflowAnchor=rootOverflowAnchor;body.style.overflowAnchor=bodyOverflowAnchor},32);
    };
    settle();
  }

  const persistOwnerBeforeScrollV187=persistOwnerR5;
  persistOwnerR5=function(owner,rerender=false){
    const anchor=captureSkillAnchor(document.activeElement)||pendingAnchor,result=persistOwnerBeforeScrollV187(owner,rerender);
    if(anchor){
      settleSkillAnchor(anchor);
      queueMicrotask(()=>{if(pendingAnchor===anchor)pendingAnchor=null});
    }
    return result;
  };

  Object.assign(window.Eberos,{version:VERSION,revision:REVISION,skillScrollStability:true,skillScrollMetrics:metrics});
})();
