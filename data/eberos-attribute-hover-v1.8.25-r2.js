'use strict';

/* Eberos v1.8.25 · Grundwertdefinitionen R2: Hover an universellen Grundwertkarten. */
(()=>{
  const REVISION='grundwertdefinitionen-r2';
  const renderAttributesBeforeHoverR2=renderAttributesV174;
  let attributeHoverTimerR2=0;

  function bindAttributeRowHoverR2(row,button,title,build){
    const interactive=target=>!!target.closest?.('input,select,textarea,button,a');
    const schedule=()=>{
      clearTimeout(attributeHoverTimerR2);
      attributeHoverTimerR2=setTimeout(()=>{
        if(row.matches(':hover'))showRuleInfoR5(button,title,build);
      },800);
    };
    row.classList.add('info-ready-r5');
    row.addEventListener('mouseenter',schedule);
    row.addEventListener('mouseover',event=>{
      if(!interactive(event.target)||event.target.closest('.info-button-r5'))return;
      clearTimeout(attributeHoverTimerR2);attributeHoverTimerR2=0;
      if(infoAnchorR5===button)hideRuleInfoR5(true);
    });
    row.addEventListener('mouseleave',()=>{clearTimeout(attributeHoverTimerR2);attributeHoverTimerR2=0;hideRuleInfoR5()});
  }

  function decorateAttributeHoverR2(box){
    const rows=[...box.querySelectorAll('.value-row')];
    rows.forEach((row,index)=>{
      const [id,name]=ATTRS[index]||[];
      if(!id||row.dataset.attributeDefinitionHoverR2==='true')return;
      const build=()=>attributeInfoContentR5(id);
      row.dataset.attributeDefinitionHoverR2='true';
      row.classList.add('info-value-row-r8');
      row.tabIndex=0;
      let button=row.querySelector('.info-button-r5');
      if(!button){button=infoButtonR5(row,name,build);row.append(button)}
      bindAttributeRowHoverR2(row,button,`${name} (${id})`,build);
    });
    return box;
  }

  renderAttributesV174=function(owner){return decorateAttributeHoverR2(renderAttributesBeforeHoverR2(owner))};
  Object.assign(window.Eberos,{attributeHoverRevision:REVISION});
})();
