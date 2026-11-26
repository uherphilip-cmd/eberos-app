'use strict';
(function(global){
  const api=global.Eberos.equipmentRules,mat=global.EberosMaterialBuilderV1818;
  const applyDamage=mat.applyStructureDamage,applyRepair=mat.repairStructure;
  const lot=item=>global.EberosRawMaterials?.isLot(item);
  const quantity=item=>Math.max(0,Number(item.quantity??item.qty??1)||0);
  function itemIn(owner,value){return typeof value==='string'?owner.equipment?.find(i=>i.instanceId===value):owner.equipment?.includes(value)?value:null;}
  function change(owner,value,amount,{count=1,reason='',repair=false}={}){
    let item=itemIn(owner,value);if(!item||!item.isMaterial||api.maximum(item)<=0)return{ok:false,message:'Materiellen Gegenstand wählen.'};
    if(!Number.isInteger(count)||count<1||count>quantity(item))return{ok:false,message:'Passende Stückzahl wählen.'};
    if(!Number.isInteger(Number(amount))||Number(amount)<=0)return{ok:false,message:'Positive ganze Strukturpunkte eingeben.'};
    if(repair&&lot(item)&&item.structurePointsCurrent<=0)return{ok:false,message:'Ein unbrauchbares Rohstofflos über seine Wiederherstellung freigeben.'};
    const total=quantity(item);
    if(count<total){
      const original=item,part=structuredClone(item),id=uid(),eq=Math.min(count,Number(original.equippedQuantity)||0);
      Object.assign(part,{id,instanceId:id,quantity:count,qty:count,equippedQuantity:eq});
      original.quantity=original.qty=total-count;original.equippedQuantity=Math.max(0,(Number(original.equippedQuantity)||0)-eq);
      owner.equipment.push(part);
      for(const effect of [...(owner.activeEffectsV177||[])])if(effect.sourceType==='item'&&effect.sourceId===(original.instanceId||original.id))owner.activeEffectsV177.push({...structuredClone(effect),id:uid(),sourceId:id});
      item=part;
    }
    const before=item.structurePointsCurrent;
    if(repair)applyRepair(item,Math.floor(Number(amount)));else applyDamage(item,Math.floor(Number(amount)));
    item.structureEvents=[...(item.structureEvents||[]),{at:new Date().toISOString(),type:repair?'repair':'damage',before,after:item.structurePointsCurrent,count,reason:String(reason).trim()||'Durch die Spielsituation begründete Änderung'}].slice(-50);
    if(lot(item))global.EberosRawMaterials.ensureData(state);
    return{ok:true,item,before,after:item.structurePointsCurrent,split:count<total};
  }
  function controls(owner,item){
    const box=el('details',{class:'equipment-narrative-damage'}),amount=el('input',{type:'number',min:1,step:1,value:1,'aria-label':'Strukturänderung'}),count=el('input',{type:'number',min:1,max:quantity(item),step:1,value:1,'aria-label':'Betroffene Stückzahl'}),reason=el('input',{placeholder:'z. B. in Steintür eingeklemmt','aria-label':'Grund für Gegenstandsschaden'}),feedback=el('p',{'aria-live':'polite'});
    const perform=repair=>{const result=change(owner,item,Number(amount.value),{count:Number(count.value),reason:reason.value,repair});if(!result.ok){feedback.textContent=result.message;return}saveOwnerV173(owner,true);renderAll()};
    const disable=el('input',{type:'checkbox',checked:!!item.functionDisabled,'aria-label':'Gegenstand trotz Reststruktur unbrauchbar'});
    disable.onchange=()=>{item.functionDisabled=disable.checked;saveOwnerV173(owner,true);renderAll()};
    box.append(el('summary',{text:'Gezielter Schaden & Reparatur'}),el('p',{text:'Nur bei einer passenden Spielsituation ändern. Normale Treffer und Rundenwechsel verbrauchen keine Struktur.'}),el('div',{class:'toolbar'},[equipmentFieldV174('Strukturpunkte',amount),equipmentFieldV174('Betroffene Stückzahl',count),equipmentFieldV174('Grund',reason)]),el('div',{class:'toolbar'},[el('button',{type:'button',text:'Strukturschaden erfassen',onclick:()=>perform(false)}),el('button',{type:'button',text:'Reparatur erfassen',onclick:()=>perform(true)})]),el('label',{},[disable,document.createTextNode(' Funktionsausfall trotz verbleibender Struktur')]),feedback);
    if(!lot(item)){
      const base=el('input',{type:'number',min:1,step:1,value:item.baseStructurePoints,'aria-label':'Grund-Strukturpunkte unabhängig von Rüstung'});
      base.onchange=()=>{const n=Number(base.value);if(!Number.isInteger(n)||n<1)return;const prior=api.maximum(item),current=item.structurePointsCurrent;item.baseStructurePoints=n;item.structurePointsCurrent=current<=0?0:Math.max(0,api.maximum(item)-(prior-current));item.durabilityOverrides={...(item.durabilityOverrides||{}),structure:true};saveOwnerV173(owner,true);renderAll()};
      box.append(equipmentFieldV174('Grund-Strukturpunkte (unabhängig von Rüstung)',base));
    }
    return box;
  }
  const oldRender=renderItemRulesV174;
  renderItemRulesV174=function(owner,item,...rest){const box=oldRender(owner,item,...rest);if(item.isMaterial&&!lot(item))box.append(controls(owner,item));return box};
  const oldEquipment=renderEquipmentV174;
  renderEquipmentV174=function(owner){const box=oldEquipment(owner);[...box.querySelectorAll('.equipment-entry')].forEach((entry,index)=>{const item=owner.equipment.find(i=>i.instanceId===entry.dataset.itemId)||owner.equipment[index];if(item?.isMaterial&&!entry.querySelector('.equipment-narrative-damage')){entry.append(el('p',{class:'notice equipment-durability-current',text:(item.protection>0?'Rüstung '+(api.isBroken(item)?0:item.protection)+' · ':'')+'Struktur '+item.structurePointsCurrent+'/'+api.maximum(item)+(api.isBroken(item)?' · unbrauchbar':'')}),controls(owner,item));}});return box};
  global.EberosMaterialBuilderV1818=Object.freeze({...mat,applyStructureDamage(item,amount){if(quantity(item)>1){const owner=(state.characters||[]).flatMap(c=>[c,...(c.auxiliaryTabs||[])]).find(o=>o.equipment?.includes(item));if(!owner)throw Error('Für gezielten Stapelschaden Besitzer und Stückzahl über damageItem angeben.');return change(owner,item,amount).after;}return applyDamage(item,amount)}});
  Object.assign(api,{damageItem:(owner,item,amount,options)=>change(owner,item,amount,options),repairItem:(owner,item,amount,options)=>change(owner,item,amount,{...options,repair:true})});
  document.head.append(el('style',{text:'.equipment-narrative-damage{padding:.6rem;border-top:1px solid var(--border);margin-top:.7rem}.equipment-narrative-damage summary{cursor:pointer;font-weight:bold}.equipment-narrative-damage input{max-width:100%}'}));
})(window);
