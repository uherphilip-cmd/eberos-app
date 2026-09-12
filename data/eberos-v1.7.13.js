'use strict';

/* EBEROS v1.7.13-r1 – frei bestimmbares Erscheinungsbild. */
const V1713_VERSION='1.7.13',V1713_REVISION='r1',V1713_SCHEMA=21,V1713_RULES=7;
const DARK_THEMES_V1713=new Set(['Sternenarchiv','Blutmond','Tintenchronik','Magus','Finsternis','Royal','Drachenglut','Tiefenreich','Runenschmiede']);
const THEME_ORNAMENTS_V1713=[
  ['theme-waldkrone','Waldkrone','waldkrone.jpg'],['theme-sternenarchiv','Sternenarchiv','sternenarchiv.jpg'],
  ['theme-blutmond','Blutmond','blutmond.jpg'],['theme-frostmeer','Frostmeer','frostmeer.jpg'],
  ['theme-feenhof','Feenhof','feenhof.jpg'],['theme-tintenchronik','Tintenchronik','tintenchronik.jpg'],
  ['theme-magus','Magus','magus.jpg'],['theme-glaube','Glaube','glaube.jpg'],
  ['theme-finsternis','Finsternis','finsternis.jpg'],['theme-royal','Royal','royal.jpg'],
  ['theme-drachenglut','Drachenglut','drachenglut.jpg'],['theme-wuestenorakel','Wüstenorakel','wuestenorakel.jpg'],
  ['theme-tiefenreich','Tiefenreich','tiefenreich.jpg'],['theme-runenschmiede','Runenschmiede','runenschmiede.jpg'],
  ['theme-traumweber','Traumweber','traumweber.jpg']
].map(function(item){return{id:item[0],name:item[1]+' · klassisch',file:'./assets/ornaments/'+item[2],tone:'legacy',recommendedOpacity:.055,recommendedScale:52,legacy:true}});
const NEW_BACKGROUNDS_V1713=[
  ['celestial-sword','Himmelsklinge','celestial-sword.png','color',.07,70],
  ['horned-blade-beast','Klingenbestie','horned-blade-beast.png','color',.055,62],
  ['arcane-hourglass','Arkane Sanduhr','arcane-hourglass.png','dark-line',.055,72],
  ['moon-spirit','Mondgeist','moon-spirit.png','dark-line',.05,62],
  ['ritual-moth','Ritualmotte','ritual-moth.png','dark-line',.045,48],
  ['oracle-eye','Orakelauge','oracle-eye.png','dark-line',.045,82],
  ['night-owl','Nachteule','night-owl.png','dark-line',.05,68],
  ['shadow-rooster','Schattenhahn','shadow-rooster.png','dark-line',.05,62],
  ['fractured-skull','Geborstener Schädel','fractured-skull.png','light-line',.055,62],
  ['sword-skull-shield','Schwert, Schädel und Schild','sword-skull-shield.png','color',.06,62]
].map(function(item){return{id:item[0],name:item[1],file:'./assets/backgrounds/'+item[2],tone:item[3],recommendedOpacity:item[4],recommendedScale:item[5],legacy:false}});
const BACKGROUND_CATALOG_V1713=THEME_ORNAMENTS_V1713.concat(NEW_BACKGROUNDS_V1713);
const BACKGROUND_BY_ID_V1713=new Map(BACKGROUND_CATALOG_V1713.map(function(item){return[item.id,item]}));
const THEME_BACKGROUND_BY_NAME_V1713=new Map(THEME_ORNAMENTS_V1713.map(function(item){return[item.name.replace(' · klassisch',''),item]}));

const FONT_GROUPS_V1713=[
  {label:'Dekorative Fantasy',items:['Cinzel Decorative','MedievalSharp','Uncial Antiqua','Pirata One','Almendra','Grenze Gotisch']},
  {label:'Klassische Fantasy und Buch',items:['Cinzel','Marcellus','Cormorant Garamond','IM Fell English','Alegreya','EB Garamond','Caudex','Vollkorn','Spectral']},
  {label:'Gut lesbar und neutral',items:['Noto Serif','Libre Baskerville','Merriweather']}
];
const SYSTEM_FONTS_V1713=[
  {name:'Palatino · System',value:'Palatino Linotype, Palatino, Georgia, serif'},
  {name:'Georgia · System',value:'Georgia, serif'},
  {name:'System Sans',value:'system-ui, sans-serif'}
];
function fontStackV1713(name){return "'"+name+"', Georgia, serif"}

function freshBackgroundV1713(overrides){
  return Object.assign({source:'theme',catalogId:'',customData:'',customMeta:null,opacity:.055,scale:52,positionX:50,positionY:50,alignment:'center',blend:'auto',colorMode:'adaptive',tint:'#6b5433',fixed:true,print:false},overrides||{});
}
function clampV1713(value,min,max,fallback){
  value=Number(value);return Number.isFinite(value)?Math.max(min,Math.min(max,value)):fallback;
}
function normalizeBackgroundV1713(background){
  if(!background||typeof background!=='object')return freshBackgroundV1713();
  const defaults=freshBackgroundV1713();
  for(const key of Object.keys(defaults))if(background[key]===undefined)background[key]=structuredClone(defaults[key]);
  if(!['none','theme','catalog','custom'].includes(background.source))background.source='theme';
  if(!['center','top','bottom','left','right','free'].includes(background.alignment))background.alignment='center';
  if(!['auto','normal','multiply','screen','soft-light'].includes(background.blend))background.blend='auto';
  if(!['adaptive','original','grayscale','inverted','tint'].includes(background.colorMode))background.colorMode='adaptive';
  background.opacity=clampV1713(background.opacity,0,.35,.055);
  background.scale=clampV1713(background.scale,20,180,52);
  background.positionX=clampV1713(background.positionX,0,100,50);
  background.positionY=clampV1713(background.positionY,0,100,50);
  background.tint=/^#[0-9a-f]{6}$/i.test(background.tint||'')?background.tint:'#6b5433';
  background.catalogId=String(background.catalogId||'');
  background.customData=typeof background.customData==='string'?background.customData:'';
  background.customMeta=background.customMeta&&typeof background.customMeta==='object'?background.customMeta:null;
  background.fixed=background.fixed!==false;background.print=background.print===true;
  return background;
}
function ensureAuxAppearanceV1713(owner){
  owner.appearance=owner.appearance&&typeof owner.appearance==='object'?owner.appearance:{inheritGlobal:true,theme:'Waldkrone'};
  if(owner.appearance.inheritBackground===undefined)owner.appearance.inheritBackground=true;
  owner.appearance.background=normalizeBackgroundV1713(owner.appearance.background);
  return owner.appearance;
}
function ensureStateV1713(data,log){
  if(!data||typeof data!=='object')return data;
  const first=!data.v1713AppearanceMigrationDone;
  data.settings=data.settings&&typeof data.settings==='object'?data.settings:{};
  const settings=data.settings;
  if(!settings.theme)settings.theme='Waldkrone';
  if(!settings.colors||typeof settings.colors!=='object')settings.colors={};
  if(!settings.fontHead)settings.fontHead='Palatino, Georgia, serif';
  if(!settings.fontBody)settings.fontBody='Georgia, serif';
  if(!settings.fontSection)settings.fontSection=settings.fontHead;
  if(!settings.fontNumber)settings.fontNumber=settings.fontHead;
  settings.background=normalizeBackgroundV1713(settings.background);
  for(const character of data.characters||[])for(const owner of character.auxiliaryTabs||[])ensureAuxAppearanceV1713(owner);
  data.appVersion=V1713_VERSION;data.schemaVersion=V1713_SCHEMA;data.v1713AppearanceMigrationDone=true;
  if(first&&log!==false){
    data.migrationLog=Array.isArray(data.migrationLog)?data.migrationLog:[];
    data.migrationLog.push({from:20,to:21,at:new Date().toISOString(),changes:['Hintergrundauswahl vom Theme entkoppelt','Getrennte Schriften für Titel, Karten und Zahlen ergänzt','Zusatzreiter für Hintergrundvererbung vorbereitet']});
  }
  return data;
}

const migrateStateBeforeV1713=migrateState;
migrateState=function(data){return ensureStateV1713(migrateStateBeforeV1713(data),true)};
if(!state.v1713AppearanceMigrationDone)try{localStorage.setItem(STORE+'.backup.v1713.'+Date.now(),JSON.stringify(state))}catch{}
state=ensureStateV1713(state,true);

save=function(){
  try{
    localStorage.setItem(STORE,JSON.stringify(state));
    const status=document.getElementById('saveStatus');if(status)status.textContent='gespeichert';
    return true;
  }catch(error){
    showError('Speichern fehlgeschlagen: '+error.message);
    return false;
  }
};

const appearanceStyleV1713=el('style',{id:'appearanceStyleV1713',text:[
  '.app::before{display:none!important}',
  '.appearance-background-v1713{position:absolute;inset:0;z-index:0;pointer-events:none;background-repeat:no-repeat;transform:none;transform-origin:center;overflow:hidden}',
  '.appearance-background-v1713.fixed{position:fixed;left:50%;right:auto;top:0;width:min(100vw,1500px);height:100vh;transform:translateX(-50%)}',
  '.app>.topbar,.app>.tabs,.app>.workspace,.app>.screen-title{position:relative;z-index:1}',
  '#settingsDialog.appearance-dialog-v1713{width:min(1120px,96vw)}',
  '.font-preview-v1713{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.6rem;margin:.7rem 0}',
  '.font-preview-v1713>div{padding:.65rem;border:1px solid var(--border);border-radius:9px;background:var(--panel-bg)}',
  '.background-settings-v1713{display:grid;gap:.75rem;margin-top:1rem;padding-top:1rem;border-top:2px solid var(--border)}',
  '.background-settings-v1713 h3{margin:0;font-family:var(--font-section)}',
  '.background-source-v1713{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:.55rem}',
  '.background-catalog-v1713{display:grid;grid-template-columns:repeat(auto-fill,minmax(145px,1fr));gap:.55rem;max-height:390px;overflow:auto;padding:.25rem}',
  '.background-choice-v1713{display:grid;gap:.35rem;min-height:155px;padding:.45rem;text-align:left;align-content:start}',
  '.background-choice-v1713[aria-pressed="true"]{outline:3px solid var(--accent-2);background:var(--accent);color:var(--header-text)}',
  '.background-choice-stage-v1713{height:105px;display:grid;place-items:center;overflow:hidden;border-radius:7px;background:linear-gradient(90deg,#f5edd7 0 50%,#171a22 50% 100%)}',
  '.background-choice-stage-v1713 img{display:block;max-width:100%;max-height:100%;object-fit:contain}',
  '.background-controls-v1713{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.65rem}',
  '.background-range-v1713{display:grid;grid-template-columns:minmax(8rem,1fr) 5.2rem;gap:.5rem;align-items:end}',
  '.background-range-v1713 input[type=range]{grid-column:1}.background-range-v1713 output{grid-column:2;grid-row:1/3;align-self:end;padding:.55rem;border:1px solid var(--border);border-radius:7px;text-align:center;background:var(--panel-bg)}',
  '.background-checks-v1713{display:flex;gap:.8rem;flex-wrap:wrap}.background-checks-v1713 label,.background-inherit-v1713{display:flex;align-items:center;gap:.45rem}.background-inherit-v1713[hidden]{display:none!important}.background-checks-v1713 input,.background-inherit-v1713 input{width:auto;min-height:0}',
  '.background-custom-meta-v1713{padding:.65rem;border:1px dashed var(--border);border-radius:8px}',
  '.background-settings-v1713.is-inherited .background-own-controls-v1713{opacity:.5;pointer-events:none}',
  '.aux-background-panel-v1713{margin-top:.8rem;padding:.7rem;border:1px solid var(--border);border-radius:var(--radius);background:var(--panel-alt)}',
  '.print-document.with-background-v1713{position:relative;isolation:isolate;overflow:hidden}.print-document.with-background-v1713>.appearance-background-v1713{position:absolute;width:100%;height:100%;left:0;top:0;transform:none}.print-document.with-background-v1713>*:not(.appearance-background-v1713){position:relative;z-index:1}',
  '@media(max-width:700px){.font-preview-v1713,.background-controls-v1713{grid-template-columns:1fr}.background-catalog-v1713{grid-template-columns:repeat(2,minmax(0,1fr))}}',
  '@media(max-width:390px){.background-catalog-v1713{grid-template-columns:1fr}}',
  '@media(prefers-reduced-motion:reduce){.background-settings-v1713 *{scroll-behavior:auto!important;transition:none!important}}',
  '@media print{.appearance-background-v1713{display:none!important}.print-document.with-background-v1713>.appearance-background-v1713{display:block!important}}'
].join('')});
document.head.append(appearanceStyleV1713);

function backgroundDescriptorV1713(background,theme){
  background=normalizeBackgroundV1713(background);
  if(background.source==='none')return null;
  if(background.source==='theme')return THEME_BACKGROUND_BY_NAME_V1713.get(theme)||THEME_BACKGROUND_BY_NAME_V1713.get('Waldkrone');
  if(background.source==='catalog')return BACKGROUND_BY_ID_V1713.get(background.catalogId)||null;
  if(background.source==='custom'&&background.customData)return{id:'custom',name:background.customMeta?.name||'Eigenes Bild',file:background.customData,tone:'color',custom:true};
  return null;
}
function currentThemeV1713(owner){
  return owner&&!owner.appearance?.inheritGlobal?(owner.appearance?.theme||state.settings.theme):state.settings.theme;
}
function effectiveBackgroundV1713(owner){
  if(owner){ensureAuxAppearanceV1713(owner);if(owner.appearance.inheritBackground===false)return owner.appearance.background}
  return normalizeBackgroundV1713(state.settings.background);
}
function backgroundPositionV1713(background){
  const presets={center:[50,50],top:[50,0],bottom:[50,100],left:[0,50],right:[100,50]};
  return presets[background.alignment]||[background.positionX,background.positionY];
}
function adaptivePresentationV1713(descriptor,theme){
  const dark=DARK_THEMES_V1713.has(theme),tone=descriptor?.tone||'color';
  if(tone==='dark-line')return dark?{filter:'invert(1) grayscale(1) contrast(1.25)',blend:'screen'}:{filter:'grayscale(1) contrast(1.2)',blend:'multiply'};
  if(tone==='light-line')return dark?{filter:'grayscale(1) contrast(1.2)',blend:'screen'}:{filter:'invert(1) grayscale(1) contrast(1.25)',blend:'multiply'};
  if(tone==='legacy')return dark?{filter:'invert(1) grayscale(1) contrast(1.4)',blend:'screen'}:{filter:'grayscale(1) contrast(1.35)',blend:'multiply'};
  return{filter:'saturate(.9) contrast(1.05)',blend:'soft-light'};
}
function applyBackgroundLayerV1713(layer,background,theme){
  background=normalizeBackgroundV1713(background);const descriptor=backgroundDescriptorV1713(background,theme);
  layer.classList.toggle('fixed',background.fixed);layer.hidden=!descriptor;
  layer.style.backgroundImage='none';layer.style.webkitMaskImage='none';layer.style.maskImage='none';
  if(!descriptor)return false;
  const image='url("'+String(descriptor.file).replaceAll('"','%22')+'")',position=backgroundPositionV1713(background),adaptive=adaptivePresentationV1713(descriptor,theme);
  layer.style.opacity=String(background.opacity);
  layer.style.backgroundSize=background.scale+'% auto';
  layer.style.backgroundPosition=position[0]+'% '+position[1]+'%';
  layer.style.mixBlendMode=background.blend==='auto'?adaptive.blend:background.blend;
  if(background.colorMode==='tint'){
    layer.style.backgroundColor=background.tint;layer.style.webkitMaskImage=image;layer.style.maskImage=image;
    layer.style.webkitMaskRepeat='no-repeat';layer.style.maskRepeat='no-repeat';
    layer.style.webkitMaskSize=background.scale+'% auto';layer.style.maskSize=background.scale+'% auto';
    layer.style.webkitMaskPosition=position[0]+'% '+position[1]+'%';layer.style.maskPosition=position[0]+'% '+position[1]+'%';
    layer.style.filter='none';
  }else{
    layer.style.backgroundColor='transparent';layer.style.backgroundImage=image;
    layer.style.filter=background.colorMode==='grayscale'?'grayscale(1) contrast(1.15)':background.colorMode==='inverted'?'invert(1) grayscale(1) contrast(1.2)':background.colorMode==='original'?'none':adaptive.filter;
  }
  return true;
}
function ensureScreenBackgroundLayerV1713(){
  let layer=document.getElementById('appearanceBackgroundV1713');
  if(!layer){layer=el('div',{id:'appearanceBackgroundV1713',class:'appearance-background-v1713','aria-hidden':'true'});app.prepend(layer)}
  return layer;
}

const applyThemeBeforeV1713=applyTheme;
applyTheme=function(){
  applyThemeBeforeV1713();
  const settings=state.settings,owner=app?.classList.contains('aux')?activeAux():null,theme=currentThemeV1713(owner);
  document.documentElement.style.setProperty('--font-head',settings.fontHead);
  document.documentElement.style.setProperty('--font-section',settings.fontSection);
  document.documentElement.style.setProperty('--font-body',settings.fontBody);
  document.documentElement.style.setProperty('--font-number',settings.fontNumber);
  applyBackgroundLayerV1713(ensureScreenBackgroundLayerV1713(),effectiveBackgroundV1713(owner),theme);
};

const appearanceUiStyleV1713=el('style',{text:[
  '.background-live-preview-v1713{position:relative;height:250px;overflow:hidden;border:1px solid var(--border);border-radius:10px;background:linear-gradient(90deg,#f5edd7 0 50%,#171a22 50% 100%)}',
  '.background-live-preview-v1713>.appearance-background-v1713{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;transform:none!important}',
  '.appearance-dialog-v1713 .appearance-global-v1713.hidden{display:none!important}',
  '.background-editor-note-v1713{margin:0}',
  '.font-preview-v1713 strong{display:block;margin-bottom:.25rem}'
].join('')});document.head.append(appearanceUiStyleV1713);

let appearanceEditorOwnerV1713=null,appearanceControlsV1713=null;
function fontDisplayNameV1713(value){
  for(const group of FONT_GROUPS_V1713)for(const name of group.items)if(String(value).includes(name))return name;
  const system=SYSTEM_FONTS_V1713.find(function(item){return item.value===value});return system?.name||String(value).split(',')[0].replaceAll("'","");
}
function fillFontSelectV1713(select,current){
  select.replaceChildren();
  for(const group of FONT_GROUPS_V1713){
    const optgroup=el('optgroup',{label:group.label});
    for(const name of group.items)optgroup.append(el('option',{value:fontStackV1713(name),text:name}));
    select.append(optgroup);
  }
  const systems=el('optgroup',{label:'Systemschriften'});
  for(const item of SYSTEM_FONTS_V1713)systems.append(el('option',{value:item.value,text:item.name}));
  select.append(systems);
  if(current&&![...select.options].some(function(option){return option.value===current})){
    const previous=el('optgroup',{label:'Bisherige Auswahl'});previous.append(el('option',{value:current,text:fontDisplayNameV1713(current)+' · bisher'}));select.prepend(previous);
  }
  select.value=current;
}
function refreshFontPreviewV1713(){
  if(!appearanceControlsV1713)return;const settings=state.settings;
  appearanceControlsV1713.previewTitle.style.fontFamily=settings.fontHead;
  appearanceControlsV1713.previewSection.style.fontFamily=settings.fontSection;
  appearanceControlsV1713.previewBody.style.fontFamily=settings.fontBody;
  appearanceControlsV1713.previewNumber.style.fontFamily=settings.fontNumber;
}
function setupFontControlsV1713(){
  const dialog=settingsDialog,grid=dialog.querySelector('.settings-grid'),head=grid.querySelector('[data-setting="fontHead"]'),body=grid.querySelector('[data-setting="fontBody"]');
  head.parentElement.childNodes[0].textContent='Dokumenttitel';body.parentElement.childNodes[0].textContent='Fließtext';
  let section=grid.querySelector('[data-setting="fontSection"]'),number=grid.querySelector('[data-setting="fontNumber"]');
  if(!section){section=el('select',{'data-setting':'fontSection'});grid.insertBefore(el('label',{},['Kartenüberschriften',section]),body.parentElement)}
  if(!number){number=el('select',{'data-setting':'fontNumber'});grid.insertBefore(el('label',{},['Zahlen und Würfelwerte',number]),grid.querySelector('input[data-setting]')?.parentElement||null)}
  const preview=el('div',{class:'font-preview-v1713 appearance-global-v1713'},[
    el('div',{},[el('strong',{text:'Dokumenttitel'}),el('span',{text:'Die Chroniken von Eberos'})]),
    el('div',{},[el('strong',{text:'Kartenüberschrift'}),el('span',{text:'Schicksalspfade und Fähigkeiten'})]),
    el('div',{},[el('strong',{text:'Fließtext'}),el('span',{text:'Äther, Größe, Würfel und Übermut bleiben gut lesbar.'})]),
    el('div',{},[el('strong',{text:'Zahlen und Würfelwerte'}),el('span',{text:'W20 · 144 CBP · 25/25'})])
  ]);
  grid.insertAdjacentElement('afterend',preview);
  const blocks=preview.querySelectorAll('div'),selects={fontHead:head,fontSection:section,fontBody:body,fontNumber:number};
  appearanceControlsV1713=Object.assign(appearanceControlsV1713||{},{previewTitle:blocks[0],previewSection:blocks[1],previewBody:blocks[2],previewNumber:blocks[3],fontSelects:selects});
  for(const key of Object.keys(selects)){
    const select=selects[key];fillFontSelectV1713(select,state.settings[key]);
    select.onchange=function(){state.settings[key]=select.value;save();applyTheme();refreshFontPreviewV1713()};
  }
  const reset=el('button',{type:'button',text:'Schriften zurücksetzen',class:'appearance-global-v1713'});
  reset.onclick=function(){
    state.settings.fontHead='Palatino Linotype, Palatino, Georgia, serif';state.settings.fontSection=state.settings.fontHead;
    state.settings.fontBody='Georgia, serif';state.settings.fontNumber=state.settings.fontHead;
    for(const key of Object.keys(selects)){fillFontSelectV1713(selects[key],state.settings[key])}
    save();applyTheme();refreshFontPreviewV1713();
  };
  preview.insertAdjacentElement('afterend',reset);refreshFontPreviewV1713();
}
function formatBytesV1713(bytes){
  bytes=Math.max(0,+bytes||0);return bytes<1024?bytes+' B':bytes<1048576?(bytes/1024).toFixed(1)+' KB':(bytes/1048576).toFixed(2)+' MB';
}
function editorBackgroundV1713(){
  if(appearanceEditorOwnerV1713){ensureAuxAppearanceV1713(appearanceEditorOwnerV1713);return appearanceEditorOwnerV1713.appearance.background}
  return normalizeBackgroundV1713(state.settings.background);
}
function replaceEditorBackgroundV1713(background){
  background=normalizeBackgroundV1713(background);
  if(appearanceEditorOwnerV1713)appearanceEditorOwnerV1713.appearance.background=background;else state.settings.background=background;
}
function backgroundNameV1713(background,theme){
  const descriptor=backgroundDescriptorV1713(background,theme);return descriptor?.name||'Kein Bild';
}
function updateBackgroundV1713(mutator,rerender){
  const background=editorBackgroundV1713();mutator(background);normalizeBackgroundV1713(background);save();applyTheme();
  if(rerender!==false)renderBackgroundEditorV1713();
}
function rangeControlV1713(label,min,max,step,key,format){
  const input=el('input',{type:'range',min:String(min),max:String(max),step:String(step),'aria-label':label}),output=el('output'),host=el('label',{class:'background-range-v1713 background-own-controls-v1713'},[el('span',{text:label}),input,output]);
  input.oninput=function(){
    const background=editorBackgroundV1713();background[key]=+input.value;output.textContent=format(background[key]);normalizeBackgroundV1713(background);save();applyTheme();refreshBackgroundLivePreviewV1713();
  };
  return{host,input,output,key,format};
}
function selectFieldV1713(label,options){
  const select=el('select');for(const item of options)select.append(el('option',{value:item[0],text:item[1]}));
  return{host:el('label',{class:'field background-own-controls-v1713'},[el('span',{text:label}),select]),select};
}
async function imageFromFileV1713(file){
  if(!['image/png','image/jpeg','image/webp'].includes(file.type))throw new Error('Erlaubt sind PNG, JPG/JPEG und WebP.');
  if(file.size>15*1024*1024)throw new Error('Die Quelldatei ist größer als 15 MB.');
  const objectUrl=URL.createObjectURL(file),image=new Image();
  try{
    await new Promise(function(resolve,reject){image.onload=resolve;image.onerror=function(){reject(new Error('Das Bild konnte nicht gelesen werden.'))};image.src=objectUrl});
    const originalWidth=image.naturalWidth,originalHeight=image.naturalHeight,maxEdge=2000,initialScale=Math.min(1,maxEdge/Math.max(originalWidth,originalHeight));
    let width=Math.max(1,Math.round(originalWidth*initialScale)),height=Math.max(1,Math.round(originalHeight*initialScale)),data='';
    while(true){
      const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
      const context=canvas.getContext('2d',{alpha:true});context.imageSmoothingEnabled=true;context.imageSmoothingQuality='high';context.drawImage(image,0,0,width,height);
      data=canvas.toDataURL('image/webp',.88);
      if(data.length<=2400000||Math.max(width,height)<=650)break;
      width=Math.max(1,Math.round(width*.84));height=Math.max(1,Math.round(height*.84));
    }
    if(data.length>2400000)throw new Error('Das verarbeitete Bild ist für den lokalen Speicher noch zu groß.');
    return{data,meta:{name:file.name,type:'image/webp',sourceType:file.type,sourceWidth:originalWidth,sourceHeight:originalHeight,width,height,originalBytes:file.size,storedBytes:Math.round((data.length-data.indexOf(',')-1)*.75)}};
  }finally{URL.revokeObjectURL(objectUrl)}
}
function refreshBackgroundLivePreviewV1713(){
  if(!appearanceControlsV1713?.liveLayer)return;const owner=appearanceEditorOwnerV1713,background=owner&&owner.appearance.inheritBackground?state.settings.background:editorBackgroundV1713(),theme=currentThemeV1713(owner);
  const preview=structuredClone(normalizeBackgroundV1713(background));preview.fixed=false;applyBackgroundLayerV1713(appearanceControlsV1713.liveLayer,preview,theme);
}
function renderBackgroundCatalogV1713(){
  const controls=appearanceControlsV1713,background=editorBackgroundV1713();controls.catalog.replaceChildren();
  for(const descriptor of BACKGROUND_CATALOG_V1713){
    const button=el('button',{type:'button',class:'background-choice-v1713 background-own-controls-v1713','aria-label':'Hintergrund wählen: '+descriptor.name,'aria-pressed':String(background.source==='catalog'&&background.catalogId===descriptor.id)});
    button.append(el('span',{class:'background-choice-stage-v1713'},[el('img',{src:descriptor.file,alt:'',loading:'lazy'})]),el('strong',{text:descriptor.name}));
    button.onclick=function(){
      updateBackgroundV1713(function(target){
        const changed=target.catalogId!==descriptor.id;target.source='catalog';target.catalogId=descriptor.id;
        if(changed){target.opacity=descriptor.recommendedOpacity;target.scale=descriptor.recommendedScale;target.colorMode='adaptive';target.blend='auto'}
      },true);
    };controls.catalog.append(button);
  }
}
function renderBackgroundEditorV1713(){
  const controls=appearanceControlsV1713,owner=appearanceEditorOwnerV1713,background=editorBackgroundV1713(),inherited=!!owner&&owner.appearance.inheritBackground!==false,theme=currentThemeV1713(owner);
  controls.section.classList.toggle('is-inherited',inherited);controls.inheritHost.hidden=!owner;controls.inherit.checked=inherited;
  controls.source.value=background.source;controls.catalogHost.hidden=background.source!=='catalog';controls.customHost.hidden=background.source!=='custom';
  controls.alignment.value=background.alignment;controls.blend.value=background.blend;controls.colorMode.value=background.colorMode;controls.tintHost.hidden=background.colorMode!=='tint';controls.tint.value=background.tint;
  controls.fixed.checked=background.fixed;controls.print.checked=background.print;
  for(const range of controls.ranges){range.input.value=String(background[range.key]);range.output.textContent=range.format(background[range.key])}
  const meta=background.customMeta;
  controls.customMeta.textContent=meta?meta.name+' · '+meta.sourceWidth+'×'+meta.sourceHeight+' px → '+meta.width+'×'+meta.height+' px · '+formatBytesV1713(meta.storedBytes):'Noch kein eigenes Bild gespeichert.';
  controls.removeCustom.disabled=!background.customData||inherited;
  controls.status.textContent=(inherited?'Global übernommen: ':'Aktiv: ')+backgroundNameV1713(inherited?state.settings.background:background,theme);
  renderBackgroundCatalogV1713();
  for(const element of controls.section.querySelectorAll('.background-own-controls-v1713 input,.background-own-controls-v1713 select,.background-own-controls-v1713 button,button.background-own-controls-v1713'))element.disabled=inherited;
  refreshBackgroundLivePreviewV1713();
}
function setupBackgroundControlsV1713(){
  const section=el('section',{id:'backgroundSettingsV1713',class:'background-settings-v1713'},[el('h3',{text:'Hintergrundbild'})]);
  const note=el('p',{class:'muted background-editor-note-v1713',text:'Alle Änderungen sind nicht-destruktiv. Eigene Bilder bleiben ausschließlich in diesem Browser und im Charakterexport.'});
  const inherit=el('input',{type:'checkbox'}),inheritHost=el('label',{class:'background-inherit-v1713',hidden:true},[inherit,el('span',{text:'Globalen Hintergrund übernehmen'})]);
  const sourceField=selectFieldV1713('Quelle',[['none','Kein Bild'],['theme','Theme-Vorgabe'],['catalog','Bild aus Auswahl'],['custom','Eigenes Bild']]);
  sourceField.host.classList.add('background-source-v1713');
  const catalog=el('div',{class:'background-catalog-v1713'}),catalogHost=el('div',{class:'background-own-controls-v1713'},[el('strong',{text:'Eingebaute Motive · 15 klassisch + 10 transparent'}),catalog]);
  const customInput=el('input',{type:'file',accept:'image/png,image/jpeg,image/webp'}),customMeta=el('div',{class:'background-custom-meta-v1713'}),removeCustom=el('button',{type:'button',text:'Eigenes Bild entfernen',class:'danger'}),customHost=el('div',{class:'background-own-controls-v1713'},[el('label',{class:'field'},[el('span',{text:'Eigenes Bild auswählen'}),customInput]),customMeta,removeCustom]);
  const opacity=rangeControlV1713('Deckkraft',0,.35,.005,'opacity',function(value){return Math.round(value*100)+' %'});
  const scale=rangeControlV1713('Größe',20,180,1,'scale',function(value){return Math.round(value)+' %'});
  const positionX=rangeControlV1713('Position horizontal',0,100,1,'positionX',function(value){return Math.round(value)+' %'});
  const positionY=rangeControlV1713('Position vertikal',0,100,1,'positionY',function(value){return Math.round(value)+' %'});
  const alignment=selectFieldV1713('Ausrichtung',[['center','Zentriert'],['top','Oben'],['bottom','Unten'],['left','Links'],['right','Rechts'],['free','Freie X-/Y-Position']]);
  const blend=selectFieldV1713('Mischmodus',[['auto','Automatisch'],['normal','Normal'],['multiply','Multiplizieren'],['screen','Negativ multiplizieren / Screen'],['soft-light','Weiches Licht']]);
  const colorMode=selectFieldV1713('Farbwirkung',[['adaptive','Theme-angepasst · empfohlen'],['original','Original'],['tint','Einfarbig'],['grayscale','Graustufen'],['inverted','Invertiert']]);
  const tint=el('input',{type:'color',value:'#6b5433'}),tintHost=el('label',{class:'field background-own-controls-v1713'},[el('span',{text:'Motivfarbe'}),tint]);
  const fixed=el('input',{type:'checkbox'}),print=el('input',{type:'checkbox'}),checks=el('div',{class:'background-checks-v1713 background-own-controls-v1713'},[
    el('label',{},[fixed,el('span',{text:'Hintergrund fixieren'})]),el('label',{},[print,el('span',{text:'Hintergrund drucken'})])
  ]);
  const reset=el('button',{type:'button',text:'Hintergrundeinstellungen zurücksetzen',class:'background-own-controls-v1713'}),status=el('p',{class:'notice background-editor-note-v1713'}),live=el('div',{class:'background-live-preview-v1713','aria-label':'Live-Vorschau auf hellem und dunklem Grund'}),liveLayer=el('div',{class:'appearance-background-v1713','aria-hidden':'true'});live.append(liveLayer);
  const controlsGrid=el('div',{class:'background-controls-v1713'},[opacity.host,scale.host,positionX.host,positionY.host,alignment.host,blend.host,colorMode.host,tintHost]);
  section.append(note,inheritHost,sourceField.host,catalogHost,customHost,controlsGrid,checks,el('div',{class:'toolbar'},[reset]),status,live);
  settingsDialog.querySelector('button.primary[data-close]').insertAdjacentElement('beforebegin',section);
  appearanceControlsV1713=Object.assign(appearanceControlsV1713||{},{section,inheritHost,inherit,source:sourceField.select,catalogHost,catalog,customHost,customInput,customMeta,removeCustom,ranges:[opacity,scale,positionX,positionY],alignment:alignment.select,blend:blend.select,colorMode:colorMode.select,tintHost,tint,fixed,print,reset,status,liveLayer});
  inherit.onchange=function(){if(!appearanceEditorOwnerV1713)return;ensureAuxAppearanceV1713(appearanceEditorOwnerV1713).inheritBackground=inherit.checked;save();applyTheme();renderBackgroundEditorV1713()};
  sourceField.select.onchange=function(){updateBackgroundV1713(function(background){background.source=sourceField.select.value;if(background.source==='catalog'&&!BACKGROUND_BY_ID_V1713.has(background.catalogId)){const first=NEW_BACKGROUNDS_V1713[0];background.catalogId=first.id;background.opacity=first.recommendedOpacity;background.scale=first.recommendedScale}},true)};
  alignment.select.onchange=function(){updateBackgroundV1713(function(background){background.alignment=alignment.select.value;if(background.alignment!=='free'){const point=backgroundPositionV1713(background);background.positionX=point[0];background.positionY=point[1]}},true)};
  blend.select.onchange=function(){updateBackgroundV1713(function(background){background.blend=blend.select.value},false);refreshBackgroundLivePreviewV1713()};
  colorMode.select.onchange=function(){updateBackgroundV1713(function(background){background.colorMode=colorMode.select.value},true)};
  tint.oninput=function(){updateBackgroundV1713(function(background){background.tint=tint.value},false);refreshBackgroundLivePreviewV1713()};
  fixed.onchange=function(){updateBackgroundV1713(function(background){background.fixed=fixed.checked},false);refreshBackgroundLivePreviewV1713()};
  print.onchange=function(){updateBackgroundV1713(function(background){background.print=print.checked},false)};
  reset.onclick=function(){replaceEditorBackgroundV1713(freshBackgroundV1713());save();applyTheme();renderBackgroundEditorV1713()};
  removeCustom.onclick=function(){updateBackgroundV1713(function(background){background.customData='';background.customMeta=null;if(background.source==='custom')background.source='none'},true)};
  customInput.onchange=async function(){
    const file=customInput.files?.[0];customInput.value='';if(!file)return;
    const before=structuredClone(editorBackgroundV1713());appearanceControlsV1713.status.textContent='Bild wird lokal vorbereitet …';
    try{
      const result=await imageFromFileV1713(file),background=editorBackgroundV1713();background.customData=result.data;background.customMeta=result.meta;background.source='custom';
      if(!save()){replaceEditorBackgroundV1713(before);save();throw new Error('Nicht genug lokaler Speicher. Die vorherige Auswahl wurde wiederhergestellt.')}
      applyTheme();renderBackgroundEditorV1713();
    }catch(error){replaceEditorBackgroundV1713(before);save();applyTheme();renderBackgroundEditorV1713();showError('Hintergrundbild nicht übernommen: '+error.message)}
  };
}
function openAppearanceSettingsV1713(owner){
  appearanceEditorOwnerV1713=owner||null;
  settingsDialog.classList.add('appearance-dialog-v1713');
  settingsDialog.querySelector('.dialog-head h2').textContent=owner?'Erscheinungsbild · '+(owner.name||'Zusatzreiter'):'Erscheinungsbild';
  for(const element of settingsDialog.querySelectorAll('.appearance-global-v1713'))element.classList.toggle('hidden',!!owner);
  renderBackgroundEditorV1713();refreshFontPreviewV1713();settingsDialog.showModal();
}
function markGlobalAppearanceControlsV1713(){
  themeSelect.closest('label')?.classList.add('appearance-global-v1713');colorControls.classList.add('appearance-global-v1713');
  settingsDialog.querySelector('.settings-grid')?.classList.add('appearance-global-v1713');
}

markGlobalAppearanceControlsV1713();setupFontControlsV1713();setupBackgroundControlsV1713();
settingsBtn.onclick=function(){openAppearanceSettingsV1713(null)};

const renderAuxProfileBeforeV1713=renderAuxProfileV171;
renderAuxProfileV171=function(owner){
  const box=renderAuxProfileBeforeV1713(owner),appearance=ensureAuxAppearanceV1713(owner),panel=el('section',{class:'aux-background-panel-v1713'}),inherit=el('input',{type:'checkbox',checked:appearance.inheritBackground!==false});
  const label=el('label',{class:'background-inherit-v1713'},[inherit,el('span',{text:'Globalen Hintergrund übernehmen'})]),description=el('p',{class:'muted'}),edit=el('button',{type:'button',text:'Reiter-Hintergrund bearbeiten'});
  const refresh=function(){description.textContent=appearance.inheritBackground!==false?'Aktiv ist der globale Hintergrund.':'Eigener Reiter-Hintergrund: '+backgroundNameV1713(appearance.background,currentThemeV1713(owner));edit.disabled=appearance.inheritBackground!==false};
  inherit.onchange=function(){appearance.inheritBackground=inherit.checked;saveOwnerV173(owner,false);applyTheme();refresh()};
  edit.onclick=function(){openAppearanceSettingsV1713(owner)};
  panel.append(el('strong',{text:'Hintergrund des Reiters'}),label,description,edit);refresh();box.append(panel);return box;
};

const renderCardsBeforeV1713=renderCards;
renderCards=function(){const result=renderCardsBeforeV1713();applyTheme();return result};

const buildPrintDocumentBeforeV1713=buildPrintDocumentR15;
buildPrintDocumentR15=function(options){
  const documentNode=buildPrintDocumentBeforeV1713(options),background=normalizeBackgroundV1713(state.settings.background);
  if(background.print&&options.colors==='color'&&background.source!=='none'){
    const layer=el('div',{class:'appearance-background-v1713','aria-hidden':'true'}),printBackground=structuredClone(background);printBackground.fixed=false;
    if(applyBackgroundLayerV1713(layer,printBackground,state.settings.theme)){documentNode.classList.add('with-background-v1713');documentNode.prepend(layer)}
  }
  return documentNode;
};

const runTestsBeforeV1713=runTests;
function runTestsV1713(){
  runTestsBeforeV1713();
  appearanceEditorOwnerV1713=null;renderBackgroundEditorV1713();
  const body=testResults.querySelector('tbody');
  const superseded=new Set(['Version 1.7.11','Schema 20','Version 1.7.12','Schema bleibt 20']);
  for(const row of[...body.querySelectorAll('tr')])if(superseded.has(row.cells[0]?.textContent))row.remove();
  const baseOk=![...body.querySelectorAll('tr')].some(function(row){return row.cells[row.cells.length-1]?.textContent==='Fehler'}),tests=[];
  const eq=function(name,expected,actual){tests.push([name,expected,actual,expected===actual])};
  eq('Version 1.7.13',V1713_VERSION,APP_VERSION);
  eq('Schema 21',V1713_SCHEMA,SCHEMA_VERSION);
  eq('Regelstand bleibt 7',V1713_RULES,RULES_VERSION);
  eq('Revision r1','r1',V1713_REVISION);
  eq('25 Hintergrundmotive',25,BACKGROUND_CATALOG_V1713.length);
  eq('15 klassische Motive',15,THEME_ORNAMENTS_V1713.length);
  eq('10 neue transparente Motive',10,NEW_BACKGROUNDS_V1713.length);
  eq('25 eindeutige Hintergrund-IDs',25,new Set(BACKGROUND_CATALOG_V1713.map(function(item){return item.id})).size);
  eq('18 lokal gebündelte Fontfamilien',18,FONT_GROUPS_V1713.flatMap(function(group){return group.items}).length);
  eq('Vier getrennte Schriftrollen',4,Object.keys(appearanceControlsV1713.fontSelects).length);
  eq('Katalog zeigt alle 25 Motive',25,appearanceControlsV1713.catalog.querySelectorAll('.background-choice-v1713').length);

  const legacyCharacter=newCharacter(),legacyTheme='Blutmond',legacyColors={accent:'#112233'},legacyHead='IM Fell English, Baskerville, serif',legacyBody='Georgia, serif';
  legacyCharacter.name='Unverändert';legacyCharacter.auxiliaryTabs=[newAuxEntry('npc','Alt-NPC')];delete legacyCharacter.auxiliaryTabs[0].appearance.background;delete legacyCharacter.auxiliaryTabs[0].appearance.inheritBackground;
  const legacy={appVersion:'1.7.12',schemaVersion:20,characters:[legacyCharacter],activeCharacterId:legacyCharacter.id,settings:{theme:legacyTheme,colors:legacyColors,fontHead:legacyHead,fontBody:legacyBody,baseSize:16,gap:14,radius:12,printSize:11},migrationLog:[]};
  ensureStateV1713(legacy,true);const snapshot=JSON.stringify(legacy);ensureStateV1713(legacy,true);
  eq('Migration erhält Charakternamen','Unverändert',legacyCharacter.name);
  eq('Migration erhält Theme',legacyTheme,legacy.settings.theme);
  eq('Migration erhält eigene Farben',JSON.stringify(legacyColors),JSON.stringify(legacy.settings.colors));
  eq('Migration erhält Titelschrift',legacyHead,legacy.settings.fontHead);
  eq('Migration erhält Textschrift',legacyBody,legacy.settings.fontBody);
  eq('Migration setzt Karten- und Zahlenschrift aus Altwert',legacyHead+'|'+legacyHead,legacy.settings.fontSection+'|'+legacy.settings.fontNumber);
  eq('Migration startet mit Theme-Vorgabe','theme',legacy.settings.background.source);
  eq('Zusatzreiter übernimmt globalen Hintergrund',true,legacyCharacter.auxiliaryTabs[0].appearance.inheritBackground);
  eq('Migration ist idempotent',snapshot,JSON.stringify(legacy));

  const noImage=freshBackgroundV1713({source:'none'});
  eq('Kein Bild erzeugt keinen Deskriptor',null,backgroundDescriptorV1713(noImage,'Waldkrone'));
  const themeImage=freshBackgroundV1713({source:'theme'}),wald=backgroundDescriptorV1713(themeImage,'Waldkrone')?.id,blut=backgroundDescriptorV1713(themeImage,'Blutmond')?.id;
  eq('Theme-Vorgabe folgt Theme','theme-waldkrone|theme-blutmond',wald+'|'+blut);
  const manual=freshBackgroundV1713({source:'catalog',catalogId:'ritual-moth'});
  eq('Manuelle Auswahl bleibt bei Theme-Wechsel','ritual-moth|ritual-moth',backgroundDescriptorV1713(manual,'Waldkrone')?.id+'|'+backgroundDescriptorV1713(manual,'Blutmond')?.id);
  const aux=newAuxEntry('npc','Hintergrundtest');ensureAuxAppearanceV1713(aux);aux.appearance.background=freshBackgroundV1713({source:'catalog',catalogId:'night-owl'});
  eq('Vererbter Reiter nutzt globalen Hintergrund',state.settings.background,effectiveBackgroundV1713(aux));
  aux.appearance.inheritBackground=false;eq('Eigener Reiter nutzt eigenen Hintergrund','night-owl',effectiveBackgroundV1713(aux).catalogId);
  const normalized=normalizeBackgroundV1713({source:'catalog',opacity:9,scale:1,positionX:-5,positionY:900});
  eq('Darstellungswerte werden begrenzt','0.35|20|0|100',[normalized.opacity,normalized.scale,normalized.positionX,normalized.positionY].join('|'));

  const originalSettings=state.settings,originalClass=app.className;
  try{
    state.settings=structuredClone(originalSettings);state.settings.background=freshBackgroundV1713({source:'none'});applyTheme();
    eq('Kein Bild blendet Hintergrundebene aus',true,ensureScreenBackgroundLayerV1713().hidden);
    state.settings.background=freshBackgroundV1713({source:'catalog',catalogId:'celestial-sword'});applyTheme();
    eq('Katalogbild aktiviert Hintergrundebene',false,ensureScreenBackgroundLayerV1713().hidden);
    eq('Katalogbild verwendet statischen Assetpfad',true,ensureScreenBackgroundLayerV1713().style.backgroundImage.includes('celestial-sword.png'));
  }finally{state.settings=originalSettings;app.className=originalClass;applyTheme()}

  for(const test of tests)body.append(el('tr',{},[test[0],test[1],test[2],test[3]?'Bestanden':'Fehler'].map(function(value){return el('td',{text:String(value)})})));
  return baseOk&&tests.every(function(test){return test[3]});
}
runTests=runTestsV1713;testsBtn.onclick=runTestsV1713;

renderAll();save();
Object.assign(window.Eberos,{
  version:V1713_VERSION,revision:V1713_REVISION,schemaVersion:V1713_SCHEMA,rulesVersion:V1713_RULES,runTests:runTestsV1713,
  ensureStateV1713,backgroundCatalog:BACKGROUND_CATALOG_V1713,backgroundDescriptorV1713,effectiveBackgroundV1713,
  normalizeBackgroundV1713,freshBackgroundV1713,applyBackgroundLayerV1713,imageFromFileV1713,openAppearanceSettingsV1713
});
