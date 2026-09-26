'use strict';

/* v1.7.24: Fähigkeiten nach Art ordnen und kanonische Lore stufenweise anzeigen. */
const SKILL_LORE_V1724=window.EBEROS_SKILL_LORE_V1724;
if(!SKILL_LORE_V1724||SKILL_LORE_V1724.meta?.version!=='1.7.24'||!Array.isArray(SKILL_LORE_V1724.documents))throw new Error('Lore-Daten v1.7.24 fehlen oder sind ungültig.');
const SKILL_LORE_BY_NAME_V1724=new Map(SKILL_LORE_V1724.documents.map(document=>[document.skillName,document]));
const SKILL_CATEGORY_RANK_V1724=new Map(SKILL_CATEGORY_ORDER.map((category,index)=>[category,index]));

SKILL_SORT_OPTIONS_R11.splice(0,SKILL_SORT_OPTIONS_R11.length,
  ['category','Art / Kategorie'],
  ['alphabetical','Alphabetisch (A–Z)'],
  ['learned-first','Gelernte zuerst'],
  ['manual','Eigene Reihenfolge'],
  ['attribute','Grundwert-Kürzel (ST → CR)'],
  ['value-desc','Grundwert absteigend'],
  ['value-asc','Grundwert aufsteigend']
);

const skillSortViewBeforeV1724=skillSortViewR11;
function normalizeSkillSortDefaultV1724(owner){
  const hadExplicitSort=!!(owner.skillSortView&&typeof owner.skillSortView==='object'&&owner.skillSortView.sort);
  const view=owner.skillSortView&&typeof owner.skillSortView==='object'?owner.skillSortView:{sort:'category',attribute:''};
  if(!owner.v1724SkillSortDefaultDone){
    const defaultOrder=SKILLS.map(skill=>skill.id),given=Array.isArray(owner.skillOrder)?owner.skillOrder:[],customOrder=given.length===defaultOrder.length&&given.some((id,index)=>id!==defaultOrder[index]);
    if(!hadExplicitSort||(view.sort==='manual'&&!customOrder))view.sort='category';
    owner.v1724SkillSortDefaultDone=true;
  }
  owner.skillSortView=view;return owner;
}
skillSortViewR11=function(owner){
  normalizeSkillSortDefaultV1724(owner);
  return skillSortViewBeforeV1724(owner);
};

const orderedSkillsForViewBeforeV1724=orderedSkillsForViewR11;
function skillNameCompareV1724(a,b){return a.name.localeCompare(b.name,'de',{sensitivity:'base'})}
function skillCategoryCompareV1724(a,b){return(SKILL_CATEGORY_RANK_V1724.get(a.category)??999)-(SKILL_CATEGORY_RANK_V1724.get(b.category)??999)||skillNameCompareV1724(a,b)}
function skillIsLearnedV1724(owner,skill){return(+owner.skills?.[skill.id]?.level||0)>0}
orderedSkillsForViewR11=function(owner,skills,view){
  if(!['category','alphabetical','learned-first'].includes(view.sort))return orderedSkillsForViewBeforeV1724(owner,skills,view);
  const filtered=skills.filter(skill=>!view.attribute||skillAttributeIdsR10(skill).includes(view.attribute));
  if(view.sort==='alphabetical')return filtered.sort(skillNameCompareV1724);
  if(view.sort==='learned-first')return filtered.sort((a,b)=>Number(skillIsLearnedV1724(owner,b))-Number(skillIsLearnedV1724(owner,a))||skillCategoryCompareV1724(a,b));
  return filtered.sort(skillCategoryCompareV1724);
};
const orderedSkillsBeforeV1724=orderedSkillsV178;
orderedSkillsV178=function(owner,skills,sort,attribute){
  if(['category','alphabetical','learned-first'].includes(sort))return orderedSkillsForViewR11(owner,skills,{sort,attribute});
  return orderedSkillsBeforeV1724(owner,skills,sort,attribute);
};

const skillLoreStyleV1724=el('style',{text:`
.skills-v1724{border-collapse:separate;border-spacing:0}.skills-v1724 thead th{z-index:2;white-space:nowrap}.skills-v1724 tbody tr{transition:background-color .15s ease}.skills-v1724 tbody tr:hover{background:color-mix(in srgb,var(--accent) 8%,transparent)}
.skills-v1724:not(.skill-manual-v1724) th:nth-child(2),.skills-v1724:not(.skill-manual-v1724) td:nth-child(2){display:none}.skills-v1724.skills-grouped-v1724 tr.skill-category-start-v1724 td{border-top:3px solid color-mix(in srgb,var(--accent) 60%,var(--border))}.skills-v1724 tr.skill-learned-v1724 .skill-name-r13>strong{color:var(--accent)}
.skill-lore-badge-v1724{display:inline-flex;align-items:center;margin-top:.3rem;padding:.12rem .38rem;border:1px solid color-mix(in srgb,var(--accent-2) 70%,var(--border));border-radius:999px;background:color-mix(in srgb,var(--accent-2) 13%,var(--panel-alt));font-size:.7rem;font-weight:700;letter-spacing:.03em;color:var(--text)}
.rule-info-r5{width:min(760px,calc(100vw - 24px));max-height:min(82vh,820px);overflow:auto;overscroll-behavior:contain;pointer-events:auto}.skill-lore-v1724{margin-top:.8rem;padding-top:.65rem;border-top:2px solid color-mix(in srgb,var(--accent-2) 65%,var(--border))}.skill-lore-v1724>h4{margin:.1rem 0 .25rem}.skill-lore-meta-v1724{display:flex;gap:.45rem;align-items:center;flex-wrap:wrap;margin:.2rem 0 .45rem}.skill-lore-meta-v1724 progress{width:min(16rem,100%);height:.8rem;accent-color:var(--accent)}.skill-lore-section-v1724{margin:.5rem 0;border:1px solid var(--border);border-radius:8px;background:var(--panel-bg)}.skill-lore-section-v1724>summary{cursor:pointer;padding:.5rem .65rem;font-weight:700;color:var(--accent)}.skill-lore-body-v1724{padding:.05rem .7rem .7rem}.skill-lore-body-v1724 h5{margin:.85rem 0 .2rem;font-size:1rem}.skill-lore-body-v1724 h6{margin:.7rem 0 .15rem;font-size:.92rem}.skill-lore-body-v1724 p{margin:.25rem 0 .55rem;line-height:1.5}.skill-lore-list-v1724{padding-left:1.1rem;position:relative}.skill-lore-list-v1724::before{content:'•';position:absolute;left:.15rem;color:var(--accent)}.skill-lore-table-wrap-v1724{overflow:auto;margin:.55rem 0}.skill-lore-table-v1724{font-size:.86rem;min-width:34rem}.skill-lore-table-v1724 th,.skill-lore-table-v1724 td{position:static;padding:.4rem;border:1px solid var(--border)}.skill-lore-next-v1724{font-size:.82rem;color:var(--muted)}
@media(max-width:720px){.rule-info-r5{max-height:84vh}.skills-v1724 th:nth-child(4),.skills-v1724 td:nth-child(4){display:none}.skill-lore-section-v1724>summary{padding:.55rem}.skill-lore-body-v1724{padding:.05rem .55rem .6rem}}
@media print{.skill-lore-badge-v1724{display:none}.skills-v1724 th:nth-child(2),.skills-v1724 td:nth-child(2){display:none!important}}
`});document.head.append(skillLoreStyleV1724);

const hideRuleInfoBeforeV1724=hideRuleInfoR5;
let infoHideDelayV1724=0;
function cancelRuleInfoHideV1724(){clearTimeout(infoHideDelayV1724);infoHideDelayV1724=0}
function hideRuleInfoNowV1724(){cancelRuleInfoHideV1724();hideRuleInfoBeforeV1724()}
hideRuleInfoR5=function(){
  clearTimeout(infoDelayR5);infoDelayR5=0;
  cancelRuleInfoHideV1724();
  const currentBox=document.getElementById('ruleInfoR5');
  if(!currentBox||currentBox.hidden){infoAnchorR5=null;return}
  infoHideDelayV1724=setTimeout(()=>{
    const box=document.getElementById('ruleInfoR5');
    if(infoAnchorR5?.matches?.(':hover')||box?.matches?.(':hover'))return;
    hideRuleInfoBeforeV1724();
  },350);
};
const interactiveRuleInfoV1724=rulePopoverR5();
interactiveRuleInfoV1724.addEventListener('mouseenter',cancelRuleInfoHideV1724);
interactiveRuleInfoV1724.addEventListener('mouseleave',()=>hideRuleInfoR5());
document.addEventListener('keydown',event=>{if(event.key==='Escape')hideRuleInfoNowV1724()},true);
document.addEventListener('pointerdown',event=>{if(!event.target.closest?.('#ruleInfoR5')&&!infoAnchorR5?.contains?.(event.target))hideRuleInfoNowV1724()},true);

function ownerByIdV1724(id){
  if(!id)return ch();
  for(const character of state.characters||[]){
    if(character.id===id)return character;
    const auxiliary=(character.auxiliaryTabs||[]).find(owner=>owner.id===id);
    if(auxiliary)return auxiliary;
  }
  return ch();
}
function infoOwnerV1724(){return ownerByIdV1724(infoAnchorR5?.closest?.('tr[data-owner-id-v1724]')?.dataset.ownerIdV1724)}
function loreTableV1724(rows){
  const table=el('table',{class:'skill-lore-table-v1724'}),body=el('tbody');
  rows.forEach((row,rowIndex)=>{const tr=el('tr');row.forEach(cell=>tr.append(el(rowIndex===0?'th':'td',{text:cell})));body.append(tr)});table.append(body);
  return el('div',{class:'skill-lore-table-wrap-v1724 skill-lore-block-v1724'},[table]);
}
function loreSectionV1724(section,knowledgeLevel){
  const body=el('div',{class:'skill-lore-body-v1724'});
  const blocks=(section.blocks||[]).filter(block=>(block.unlockLevel??section.unlockLevel)<=knowledgeLevel);
  for(const block of blocks){
    if(block.type==='heading')body.append(el(block.level>=3?'h6':'h5',{class:'skill-lore-block-v1724',text:block.text}));
    else if(block.type==='table')body.append(loreTableV1724(block.rows||[]));
    else body.append(el('p',{class:`skill-lore-block-v1724${block.type==='list'?' skill-lore-list-v1724':''}`,text:block.text}));
  }
  if((section.blocks||[]).some(block=>(block.unlockLevel??section.unlockLevel)>knowledgeLevel))body.append(el('p',{class:'skill-lore-next-v1724',text:'Dieses Kapitel wird auf weiteren Stufen ergänzt.'}));
  return el('details',{class:'skill-lore-section-v1724',open:true},[el('summary',{text:`Ab Stufe ${section.unlockLevel} · ${section.heading}`}),body]);
}
function skillLoreContentV1724(skill,owner=infoOwnerV1724()){
  const document=SKILL_LORE_BY_NAME_V1724.get(skill.name);if(!document)return null;
  const level=Math.max(0,Math.min(25,+owner?.skills?.[skill.id]?.level||0)),knowledgeLevel=Math.min(10,level),sections=document.sections||[],allBlocks=sections.flatMap(section=>(section.blocks||[]).map(block=>({section,block,unlockLevel:block.unlockLevel??section.unlockLevel}))),unlockedBlocks=allBlocks.filter(entry=>entry.unlockLevel<=knowledgeLevel),unlockedSections=sections.filter(section=>(section.blocks||[]).some(block=>(block.unlockLevel??section.unlockLevel)<=knowledgeLevel)),nextLevel=Math.min(10,...allBlocks.filter(entry=>entry.unlockLevel>knowledgeLevel).map(entry=>entry.unlockLevel)),box=el('section',{class:'skill-lore-v1724'});
  box.append(el('h4',{text:document.title}),el('div',{class:'skill-lore-meta-v1724'},[el('strong',{text:`Lorestufe ${knowledgeLevel} von 10`}),el('progress',{max:10,value:knowledgeLevel,'aria-label':`Lorefortschritt ${knowledgeLevel} von 10`}),el('span',{text:`${unlockedBlocks.length} von ${allBlocks.length} Textabschnitten`})]));
  if(!unlockedBlocks.length)box.append(el('p',{class:'notice',text:'Kanonisches Wissen wird ab Fähigkeitsstufe 1 freigeschaltet.'}));
  else for(const section of unlockedSections)box.append(loreSectionV1724(section,knowledgeLevel));
  if(knowledgeLevel<10)box.append(el('p',{class:'skill-lore-next-v1724',text:`Weiteres Wissen wird auf Stufe ${nextLevel} freigeschaltet.` }));
  else box.append(el('p',{class:'skill-lore-next-v1724',text:'Der vollständige kanonische Loretext ist freigeschaltet.'}));
  box.append(el('p',{class:'rule-source-r5',text:`Lorequelle: ${document.title} · ${document.sourceLabel}`}));
  return box;
}

const skillInfoContentBeforeV1724=skillInfoContentR5;
skillInfoContentR5=function(skill){const content=skillInfoContentBeforeV1724(skill),lore=skillLoreContentV1724(skill);if(lore)content.append(lore);return content};
const showRuleInfoBeforeV1724=showRuleInfoR5;
showRuleInfoR5=function(anchor,title,build){cancelRuleInfoHideV1724();infoAnchorR5=anchor;return showRuleInfoBeforeV1724(anchor,title,build)};

function decorateSkillBoxV1724(box,owner){
  const table=box.querySelector('.skills-r5'),body=table?.tBodies?.[0],sort=box.querySelector('[aria-label="Fähigkeiten sortieren"]');if(!table||!body)return box;
  table.classList.add('skills-v1724');
  const refresh=()=>{
    table.classList.toggle('skill-manual-v1724',sort?.value==='manual');table.classList.toggle('skills-grouped-v1724',sort?.value==='category');
    let previousCategory=null;
    for(const row of body.rows){
      const name=row.querySelector('.skill-name-r13 strong')?.textContent,skill=SKILLS.find(entry=>entry.name===name);if(!skill)continue;
      row.dataset.ownerIdV1724=owner.id||'';row.dataset.skillIdV1724=skill.id;row.classList.toggle('skill-learned-v1724',skillIsLearnedV1724(owner,skill));
      const categoryStart=sort?.value==='category'&&!row.hidden&&skill.category!==previousCategory;row.classList.toggle('skill-category-start-v1724',categoryStart);if(!row.hidden&&sort?.value==='category')previousCategory=skill.category;
      if(SKILL_LORE_BY_NAME_V1724.has(skill.name)&&!row.querySelector('.skill-lore-badge-v1724'))row.querySelector('.skill-name-r13')?.append(el('span',{class:'skill-lore-badge-v1724',text:'Lore · Stufe 1–10'}));
    }
  };
  refresh();sort?.addEventListener('change',()=>queueMicrotask(refresh));new MutationObserver(()=>queueMicrotask(refresh)).observe(body,{childList:true});return box;
}
const renderSkillsOwnerBeforeV1724=renderSkillsOwnerR5;
renderSkillsOwnerR5=function(owner,isAux=false){normalizeSkillSortDefaultV1724(owner);return decorateSkillBoxV1724(renderSkillsOwnerBeforeV1724(owner,isAux),owner)};

const runTestsBeforeV1724=runTests;
runTests=function(){
  runTestsBeforeV1724();const body=testResults.querySelector('tbody');
  for(const row of[...body.querySelectorAll('tr')])if(row.cells[0]?.textContent==='Version 1.7.21')row.remove();
  const baseOk=![...body.querySelectorAll('tr')].some(row=>row.cells[row.cells.length-1]?.textContent==='Fehler'),tests=[],eq=(name,expected,actual)=>tests.push([name,expected,actual,expected===actual]),owner=newCharacter();
  eq('Sechs kanonische Lorequellen',6,SKILL_LORE_BY_NAME_V1724.size);
  eq('Jede Lore wächst auf allen Stufen 1 bis 10',true,[...SKILL_LORE_BY_NAME_V1724.values()].every(document=>{const levels=document.sections.flatMap(section=>section.blocks.map(block=>block.unlockLevel??section.unlockLevel));return[1,2,3,4,5,6,7,8,9,10].every(level=>levels.includes(level))}));
  eq('Jede Lore ist auf Stufe 10 vollständig',true,[...SKILL_LORE_BY_NAME_V1724.values()].every(document=>document.sections.every(section=>section.blocks.every(block=>(block.unlockLevel??section.unlockLevel)<=10))));
  eq('Lore ohne Platzhalter oder Ersatzzeichen',true,[...SKILL_LORE_BY_NAME_V1724.values()].every(document=>document.audit?.placeholderCount===0&&document.audit?.replacementCharacters===0));
  const loreSkill=SKILLS.find(skill=>skill.name==='Monsterkunde & Jägerwissen'),loreDocument=SKILL_LORE_BY_NAME_V1724.get(loreSkill.name),totalLoreBlocks=loreDocument.sections.reduce((sum,section)=>sum+section.blocks.length,0),progression=[0,1,2,3,4,5,6,7,8,9,10].map(level=>{owner.skills[loreSkill.id].level=level;return skillLoreContentV1724(loreSkill,owner).querySelectorAll('.skill-lore-block-v1724').length}),complete=skillLoreContentV1724(loreSkill,owner);
  eq('Jede Fähigkeitsstufe zeigt mehr Monsterkunde-Lore',true,progression[0]===0&&progression.slice(1).every((count,index)=>count>progression[index]));
  eq('Stufe 10 zeigt alle Monsterkunde-Textabschnitte',totalLoreBlocks,complete.querySelectorAll('.skill-lore-block-v1724').length);
  const sample=[{id:'a',name:'Zeta',category:'Wissen',attrs:'IT'},{id:'b',name:'Alpha',category:'Kampf',attrs:'ST'},{id:'c',name:'Beta',category:'Wissen',attrs:'IN'}];owner.skills.a={level:0};owner.skills.b={level:0};owner.skills.c={level:3};
  eq('Sortierung nach Art verwendet Kategorieordnung','Alpha|Beta|Zeta',orderedSkillsForViewR11(owner,[...sample],{sort:'category',attribute:''}).map(skill=>skill.name).join('|'));
  eq('Alphabetische Sortierung verfügbar','Alpha|Beta|Zeta',orderedSkillsForViewR11(owner,[...sample],{sort:'alphabetical',attribute:''}).map(skill=>skill.name).join('|'));
  eq('Gelernte Fähigkeit steht ganz oben','Beta',orderedSkillsForViewR11(owner,[...sample],{sort:'learned-first',attribute:''})[0].name);
  const rendered=renderSkillsOwnerR5(owner,false),sort=rendered.querySelector('[aria-label="Fähigkeiten sortieren"]');
  eq('Drei neue Sortierarten in der Oberfläche',true,['category','alphabetical','learned-first'].every(value=>[...sort.options].some(option=>option.value===value)));
  eq('Lorefähigkeiten sichtbar gekennzeichnet',SKILL_LORE_BY_NAME_V1724.size,rendered.querySelectorAll('.skill-lore-badge-v1724').length);
  for(const[name,expected,actual,ok]of tests)body.append(el('tr',{},[name,expected,actual,ok?'Bestanden':'Fehler'].map(value=>el('td',{text:String(value)}))));return baseOk&&tests.every(test=>test[3]);
};

document.querySelector('.brand small').textContent='v1.7.24';
Object.assign(window.Eberos,{version:'1.7.24',revision:'r2',schemaVersion:SCHEMA_VERSION,rulesVersion:RULES_VERSION,skillLoreVersion:'1.7.24',skillLore:()=>SKILL_LORE_V1724,skillLoreContent:skillLoreContentV1724,orderSkills:orderedSkillsForViewR11,runTests:()=>runTests()});
renderAll();save();
