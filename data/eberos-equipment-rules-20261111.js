'use strict';
(function installEquipmentRules(global){
  const policy=global.EberosEquipmentPolicy,revision=policy.revision;
  const catalog=new Map(global.EBEROS_MSE_ITEM_DB_V15.items.map(item=>[item.id,item]));
  const maximum=item=>global.EberosMaterialBuilderV1818.structureMaximum(item);
  const isBroken=item=>item.isMaterial!==false&&maximum(item)>0&&Number(item.structurePointsCurrent)<=0;
  const isEquipped=item=>item.active!==false&&item.loadState==='equipped'&&Number(item.equippedQuantity)>0&&Number(item.quantity??1)>0&&!isBroken(item);
  const copy=value=>value===undefined?undefined:structuredClone(value);
  const oldNormalize=normalizeItemV174;
  function physicalFields(item,raw=item){
    const rule=catalog.get(item.catalogId),oldBase=Number(raw.baseStructurePoints)||0;
    if(rule&&item.equipmentRulesRevision!==revision){
      const old=rule.equipmentRulesSource||{};
      for(const field of ['effect','description','valueCopper','valueText']){
        const oldValue=field==='effect'?old.effectText:field==='description'?[...(old.primaryStats||[]),...(old.secondaryStats||[]),old.effectText].filter(Boolean).join('\n'):field==='valueCopper'?old.valueCopper:undefined;
        if(item[field]===undefined||item[field]===oldValue||field==='valueText'&&item.valueCopper===rule.valueCopper)item[field]=copy(rule[field]);
      }
      for(const field of ['sourceRecord','equipmentSkillBonuses','equipmentFireResistance','initiativeBonus','valuation','balance','rarity','rarityLabel','isMaterial','zones'])if(rule[field]!==undefined)item[field]=copy(rule[field]);
      item.protection=Number(raw.protection)>0?Number(raw.protection):rule.protection;
      item.baseStructurePoints=oldBase>0?oldBase:rule.baseStructurePoints;
      item.itemType=rule.protection>0?'armor':rule.itemType;
      item.equipmentRulesRevision=revision;
      if(!oldBase)item.structurePointsCurrent=item.baseStructurePoints;
    }
    const cls=policy.classification(item);
    if(item.isMaterial===undefined)item.isMaterial=cls.isMaterial;
    if(item.isMaterial){
      if(!(Number(item.baseStructurePoints)>0)){
        item.baseStructurePoints=Math.max(1,Number(item.protection)||cls.baseStructurePoints);
        item.structurePointsCurrent=item.baseStructurePoints;
      }
      // On protective objects the base armor and base durability are one value.
      if(Number(item.protection)>0)item.baseStructurePoints=Number(item.protection);
      if(item.structurePointsCurrent===undefined||item.structurePointsCurrent===null)item.structurePointsCurrent=maximum(item);
      item.structurePointsCurrent=Math.max(0,Math.min(maximum(item),Number(item.structurePointsCurrent)||0));
    }
    return item;
  }
  normalizeItemV174=function(raw={}){return physicalFields(oldNormalize(raw),raw)};
  function itemModules(item){
    const modules=[];
    for(const skill of item.equipmentSkillBonuses||[]){const target=SKILLS.find(row=>row.name===skill.name)?.id;if(target)modules.push({id:'equipment-skill-'+target,type:'skill',target,operation:'add',value:skill.value,polarityV1710:'bonus',amountV1710:skill.value});}
    if(item.initiativeBonus)modules.push({id:'equipment-initiative',type:'derived',target:'initiative',operation:'add',value:item.initiativeBonus,polarityV1710:'bonus',amountV1710:item.initiativeBonus});
    return modules;
  }
  function syncOwner(owner){
    for(const item of owner.equipment||[]){
      physicalFields(item);
      const fire=item.equipmentFireResistance;
      if(fire?.target==='holder'){
        const module={id:'equipment-fire-'+item.catalogId,type:'resistance',target:'elemental.fire',operation:'add',value:fire.value,requiresEquipped:true,requiredSetParts:fire.requiredSetParts||0,setNumber:item.sourceRecord?.setNumber};
        const oldModule=m=>m.type==='resistance'&&['environment.heat','elemental.fire'].includes(m.target)&&Number(m.value??m.amountV1710)===fire.value;
        item.resistanceEffectsV1819=[...(item.resistanceEffectsV1819||[]).filter(m=>!String(m.id||'').startsWith('equipment-fire-')&&!oldModule(m)),module];
        for(const effect of owner.activeEffectsV177||[])if(effect.sourceType==='item'&&effect.sourceId===(item.instanceId||item.id)&&!effect.equipmentFireMigrated){
          const legacy=(effect.modules||[]).filter(oldModule);
          if(legacy.length){effect.equipmentFireSourceModules=copy(legacy);effect.modules=effect.modules.filter(m=>!oldModule(m));effect.equipmentFireMigrated=revision;}
        }
      }
      if(item.equipmentSkillBonuses?.length){
        const oldSkill=SKILLS.find(row=>row.name==='Heimlichkeit & Schleichen')?.id,newSkill=SKILLS.find(row=>row.name===item.equipmentSkillBonuses[0].name)?.id;
        for(const effect of owner.activeEffectsV177||[])if(effect.sourceType==='item'&&effect.sourceId===(item.instanceId||item.id)&&!effect.equipmentRulesManaged)for(const mod of effect.modules||[])if(mod.type==='skill'&&mod.target===oldSkill&&Number(mod.value)===2){mod.target=newSkill;effect.equipmentRulesMigrated=revision;}
      }
    }
    const tabRule=catalog.get(owner.sourceMseItemV16?.catalogId);
    if(tabRule?.equipmentFireResistance?.target==='self'){
      owner.resistancesV1819=owner.resistancesV1819||{};
      if(!owner.equipmentSelfFireMigrated){
        const value=tabRule.equipmentFireResistance.value;
        if(Number(owner.resistancesV1819['environment.heat'])===value){owner.equipmentSelfHeatSource=owner.resistancesV1819['environment.heat'];delete owner.resistancesV1819['environment.heat'];}
        owner.resistancesV1819['elemental.fire']=Math.max(Number(owner.resistancesV1819['elemental.fire'])||0,value);owner.equipmentSelfFireMigrated=revision;
      }
      if(owner.sourceMseCompanionV1825)owner.sourceMseCompanionV1825.selfEffects=['Begleiter selbst: Feuerresistenz '+tabRule.equipmentFireResistance.value+' (Schadensminderung).'];
    }
    return owner;
  }
  function syncData(data){for(const char of data.characters||[])for(const owner of [char,...(char.auxiliaryTabs||[])])syncOwner(owner);data.equipmentRulesRevision=revision;return data;}
  const oldLinked=syncLinkedEffectsV177;
  syncLinkedEffectsV177=function(owner){
    syncOwner(owner);const existing=oldLinked(owner);
    const managedById=new Map(existing.filter(effect=>effect.equipmentRulesManaged).map(effect=>[effect.id,effect]));
    owner.activeEffectsV177=existing.filter(effect=>!effect.equipmentRulesManaged);
    for(const item of owner.equipment||[]){
      const modules=itemModules(item).filter(mod=>!owner.activeEffectsV177.some(effect=>effect.sourceType==='item'&&effect.sourceId===(item.instanceId||item.id)&&(effect.modules||[]).some(m=>m.type===mod.type&&m.target===mod.target)));
      if(modules.length){const id='equipment-rules-'+(item.instanceId||item.id),previous=managedById.get(id);owner.activeEffectsV177.push(effectInstanceV177({...previous,id,name:item.name,description:'Regelwerte aus der Gegenstandskarte',category:'Gegenstandsbonus',sourceType:'item',sourceId:item.instanceId||item.id,sourceLabel:item.name,active:true,modules,sourceManaged:true}));}
      const managed=owner.activeEffectsV177.at(-1);if(managed?.id==='equipment-rules-'+(item.instanceId||item.id))managed.equipmentRulesManaged=true;
    }
    return owner.activeEffectsV177;
  };
  const oldActive=effectIsActiveV177;
  effectIsActiveV177=function(owner,effect){if(effect.sourceType==='item'&&isBroken(itemForEffectV177(owner,effect)||{}))return false;return oldActive(owner,effect)};
  const oldSummary=combatEquipmentSummaryV174;
  combatEquipmentSummaryV174=function(owner){
    syncOwner(owner);
    const equipment=(owner.equipment||[]).map(item=>({...item,protection:Number(item.protection)>0?Math.min(maximum(item),Math.max(0,Number(item.structurePointsCurrent)||0)):0,equippedQuantity:isBroken(item)?0:item.equippedQuantity}));
    return oldSummary({...owner,equipment});
  };
  const oldRender=renderItemRulesV174;
  renderItemRulesV174=function(owner,item,index){syncOwner(owner);const box=oldRender(owner,item,index);if(item.isMaterial){box.prepend(el('p',{class:'notice equipment-structure-summary',text:(item.protection>0?'Rüstung '+Math.min(maximum(item),item.structurePointsCurrent)+' · ':'')+'Struktur '+item.structurePointsCurrent+'/'+maximum(item)+(isBroken(item)?' · zerstört / unbrauchbar':'')}));}return box;};
  const oldSave=saveOwnerV173;saveOwnerV173=function(owner,...args){syncOwner(owner);return oldSave(owner,...args)};
  const oldMigrate=migrateState;migrateState=function(data){return syncData(oldMigrate(data))};
  function prepareSubmission(payload,owner){payload.equipmentRulesRevision=revision;payload.clientEquipmentStructure=(owner.equipment||[]).filter(item=>item.isMaterial).map(item=>({instanceId:item.instanceId,catalogId:item.catalogId||null,name:item.name,maximum:maximum(item),current:item.structurePointsCurrent,armor:item.protection>0?Math.min(maximum(item),item.structurePointsCurrent):0,destroyed:isBroken(item)}));return payload;}
  if(state.equipmentRulesRevision!==revision){try{localStorage.setItem(STORE+'.backup.equipment-rules-20261111',JSON.stringify(state))}catch{}}
  syncData(state);
  Object.assign(global.Eberos,{equipmentRulesRevision:revision,equipmentRules:{syncOwner,syncData,isBroken,isEquipped,maximum,itemModules,prepareSubmission}});
})(window);
