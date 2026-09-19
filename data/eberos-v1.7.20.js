'use strict';
/* EBEROS v1.7.20-r1 – Schicksalspfad-Karten ohne Overlay auf volle Breite erweitern. */
const V1720_VERSION='1.7.20',V1720_REVISION='r1',V1720_SCHEMA=25,V1720_RULES=11;

const fatePathWidthStateV1720=new Map();
function fatePathWidthOwnerKeyV1720(owner){return String(owner?.id||owner?.name||owner?.type||'character')}
function expandedFatePathV1720(owner){return fatePathWidthStateV1720.get(fatePathWidthOwnerKeyV1720(owner))||null}
function setExpandedFatePathV1720(owner,counter){const key=fatePathWidthOwnerKeyV1720(owner);if(counter)fatePathWidthStateV1720.set(key,counter);else fatePathWidthStateV1720.delete(key)}
function syncFateOverviewWidthV1720(overview){if(!overview)return;for(const tile of overview.querySelectorAll(':scope > .fate-path-v175'))tile.syncFateWidthV1720?.()}

const fateWidthStyleV1720=el('style',{text:`
.fate-path-v175.fate-width-ready-v1720{container-type:inline-size;order:var(--fate-order-v1720)}
.fate-path-expand-v1720{margin-inline-start:auto;min-width:44px;min-height:44px;padding:.35rem .55rem;white-space:nowrap;background:var(--panel-bg);color:var(--text);border-color:var(--border)}
.fate-path-expand-v1720[aria-expanded="true"]{background:var(--accent);color:var(--header-text);border-color:var(--accent)}
.fate-path-v175.is-expanded-v1720{grid-column:1/-1;box-shadow:0 7px 22px var(--shadow);background:color-mix(in srgb,var(--panel-alt) 88%,var(--panel-bg))}
.fate-path-v175.is-expanded-v1720.fate-expands-left-v1720{order:var(--fate-expanded-order-v1720)}
.fate-path-v175.is-expanded-v1720 .power-library-v176{max-width:none}
.power-detail-section-v176 p,.power-select-preview-v176,.power-summary-v176{max-height:none;overflow:visible;text-overflow:clip;-webkit-line-clamp:unset;overflow-wrap:anywhere;word-break:normal}
.power-select-detail-v176,.power-inline-detail-v176{overflow:visible}
@container (max-width:46rem){.power-detail-grid-v176{grid-template-columns:1fr}}
@media(max-width:720px){.fate-path-expand-v1720{display:none!important}.fate-path-v175.fate-width-ready-v1720{order:var(--fate-order-v1720)!important}.fate-path-v175.is-expanded-v1720{grid-column:auto;box-shadow:none}}
@media print{.fate-path-expand-v1720{display:none!important}.fate-path-v175.fate-width-ready-v1720{order:var(--fate-order-v1720)!important}.fate-path-v175.is-expanded-v1720{grid-column:auto!important;box-shadow:none!important}}
`});
document.head.append(fateWidthStyleV1720);

const renderPowerPathBeforeV1720=renderPowerPathR5;
renderPowerPathR5=function(owner,counter){
  const tile=renderPowerPathBeforeV1720(owner,counter),head=tile.querySelector('.fate-path-head-v175'),index=Math.max(0,POWER_COUNTER_ORDER_R5.indexOf(counter)),opensRight=index%2===0;
  tile.classList.add('fate-width-ready-v1720',opensRight?'fate-expands-right-v1720':'fate-expands-left-v1720');
  tile.style.setProperty('--fate-order-v1720',String(index*2));
  tile.style.setProperty('--fate-expanded-order-v1720',String(index*2-3));
  tile.dataset.fateCounterV1720=counter;
  if(!head)return tile;
  const button=el('button',{class:'fate-path-expand-v1720 edit-only',type:'button'});
  const sync=function(){
    const expanded=expandedFatePathV1720(owner)===counter;
    tile.classList.toggle('is-expanded-v1720',expanded);
    button.setAttribute('aria-expanded',String(expanded));
    button.setAttribute('aria-pressed',String(expanded));
    button.textContent=expanded?'↔ Halbe Breite':opensRight?'⇥ Breiter':'⇤ Breiter';
    button.title=expanded?'Auf halbe Breite einklappen':opensRight?'Nach rechts auf volle Breite erweitern':'Nach links auf volle Breite erweitern';
    button.setAttribute('aria-label',`${POWER_PATHS_R5[counter]?.title||counter}: ${button.title}`);
  };
  tile.syncFateWidthV1720=sync;
  button.onclick=function(event){
    event.preventDefault();event.stopPropagation();
    setExpandedFatePathV1720(owner,expandedFatePathV1720(owner)===counter?null:counter);
    syncFateOverviewWidthV1720(tile.closest('.fate-overview-v175'));
  };
  head.append(button);sync();return tile;
};

const runTestsBeforeV1720=runTests;
function runTestsV1720(){
  runTestsBeforeV1720();
  const body=testResults.querySelector('tbody'),obsolete=new Set(['Version 1.7.19','Revision v1.7.19 r1']);
  for(const row of[...body.querySelectorAll('tr')])if(obsolete.has(row.cells[0]?.textContent))row.remove();
  const baseOk=[...body.querySelectorAll('tr')].every(function(row){return row.cells[row.cells.length-1]?.textContent==='Bestanden'}),tests=[];
  const eq=function(name,expected,actual){tests.push([name,expected,actual,expected===actual])};

  eq('Version 1.7.20',V1720_VERSION,APP_VERSION);
  eq('Schema bleibt 25',V1720_SCHEMA,SCHEMA_VERSION);
  eq('Regelstand bleibt 11',V1720_RULES,RULES_VERSION);
  eq('Revision v1.7.20 r1','r1',V1720_REVISION);

  const owner=newCharacter(),ownerSnapshot=JSON.stringify(owner),overview=renderFatePathsV175(owner),tiles=[...overview.querySelectorAll('.fate-overview-v175>.fate-path-v175')],buttons=[...overview.querySelectorAll('.fate-path-expand-v1720')];
  eq('Fünf Machtpfade besitzen Breitensteuerung',POWER_COUNTER_ORDER_R5.length,buttons.length);
  eq('Breitensteuerung liegt in der bestehenden Karte',true,buttons.every(function(button){return!!button.closest('.fate-path-v175')}));
  eq('Ausgangszustand ohne breite Karte',0,overview.querySelectorAll('.is-expanded-v1720').length);
  eq('Ausgangszustand ARIA geschlossen',true,buttons.every(function(button){return button.getAttribute('aria-expanded')==='false'}));
  buttons[0].click();
  eq('Linker Pfad klappt auf',true,tiles[0].classList.contains('is-expanded-v1720')&&tiles[0].classList.contains('fate-expands-right-v1720'));
  eq('Aufgeklappter Pfad meldet ARIA offen','true',buttons[0].getAttribute('aria-expanded'));
  buttons[1].click();
  eq('Rechter Pfad ersetzt linke Erweiterung',true,!tiles[0].classList.contains('is-expanded-v1720')&&tiles[1].classList.contains('is-expanded-v1720'));
  eq('Rechter Pfad klappt nach links auf',true,tiles[1].classList.contains('fate-expands-left-v1720'));
  eq('Immer höchstens ein Pfad breit',1,overview.querySelectorAll('.is-expanded-v1720').length);
  buttons[1].click();
  eq('Erneuter Klick klappt ein',0,overview.querySelectorAll('.is-expanded-v1720').length);
  eq('Breitenzustand verändert Charakterdaten nicht',ownerSnapshot,JSON.stringify(owner));
  eq('Keine Dialogsteuerung für Breitenwechsel',false,/showModal|<dialog|createElement\(['"]dialog/.test(setExpandedFatePathV1720.toString()+renderPowerPathR5.toString()));
  eq('Mobile und Druckregeln blenden Steuerung aus',true,fateWidthStyleV1720.textContent.includes('@media(max-width:720px)')&&fateWidthStyleV1720.textContent.includes('@media print'));
  eq('Containerbreite steuert Detailumbruch',true,fateWidthStyleV1720.textContent.includes('@container')&&fateWidthStyleV1720.textContent.includes('.power-detail-grid-v176'));
  eq('Lange Krafttexte ohne Höhenbegrenzung',true,fateWidthStyleV1720.textContent.includes('max-height:none')&&fateWidthStyleV1720.textContent.includes('overflow-wrap:anywhere'));

  for(const test of tests)body.append(el('tr',{},[test[0],test[1],test[2],test[3]?'Bestanden':'Fehler'].map(function(value){return el('td',{text:String(value)})})));
  return baseOk&&tests.every(function(test){return test[3]});
}
runTests=runTestsV1720;testsBtn.onclick=runTestsV1720;

renderAll();save();
Object.assign(window.Eberos,{version:V1720_VERSION,revision:V1720_REVISION,schemaVersion:V1720_SCHEMA,rulesVersion:V1720_RULES,runTests:runTestsV1720,expandedFatePath:expandedFatePathV1720,setExpandedFatePath:setExpandedFatePathV1720});
