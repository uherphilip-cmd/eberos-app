'use strict';
(function installEquipmentRules(global){
  const policy=global.EberosEquipmentPolicy,revision=policy.revision;
  const catalog=new Map([...global.EBEROS_ITEM_DB.items,...global.EBEROS_MSE_ITEM_DB_V15.items].map(item=>[item.id,item]));
  const maximum=item=>item?.isMaterial===false?0:global.EberosMaterialBuilderV1818.structureMaximum(item);
  const isBroken=item=>item.isMaterial!==false&&maximum(item)>0&&(Number(item.structurePointsCurrent)<=0||item.functionDisabled===true);
  const isEquipped=item=>item.active!==false&&item.loadState==='equipped'&&Number(item.equippedQuantity)>0&&Number(item.quantity??1)>0&&!isBroken(item);
  const copy=value=>value===undefined?undefined:structuredClone(value);
  const oldNormalize=normalizeItemV174;
  function physicalFields(item,raw=item){
    const definition=catalog.get(item.catalogId);
    refreshStandardArt(item,definition,raw);
    // Raw lots are normalized again by their own module once that catalog is loaded.
    const rule=policy.resolve(raw),lot=raw.sourceVersion==='raw-material-lot-v1';
    if(lot&&!rule)return item;
    const cls=rule||policy.classification(item),legacy=rule?.durabilityLegacy||{};
    if(raw.durabilityRevision!==revision){
      const hasBase=Object.hasOwn(raw,'baseStructurePoints'),oldBase=Math.max(0,Number(hasBase?raw.baseStructurePoints:legacy.baseStructurePoints)||0);
      const oldMax=global.EberosMaterialBuilderV1818.structureMaximum({...item,baseStructurePoints:oldBase});
      const oldCurrent=raw.structurePointsCurrent===null||raw.structurePointsCurrent===undefined?null:Number(raw.structurePointsCurrent);
      const overrides={...(raw.durabilityOverrides||{})};
      if(!rule&&hasBase&&oldBase>0)overrides.structure=true;
      if(rule&&!lot){
        if(Object.hasOwn(raw,'protection')&&Number(raw.protection)!==Number(legacy.protection||0)&&Number(raw.protection)!==Number(rule.protection||0))overrides.protection=true;
        if(hasBase&&oldBase>0&&oldBase!==Number(legacy.baseStructurePoints||0)&&oldBase!==Number(rule.baseStructurePoints||0))overrides.structure=true;
        for(const field of ['description','effect','valueCopper','valueText'])if(raw[field]===undefined||raw[field]===legacy[field])item[field]=copy(rule[field]);
        for(const field of ['sourceRecord','equipmentSkillBonuses','equipmentFireResistance','initiativeBonus','valuation','balance','rarity','rarityLabel','zones','durability'])if(rule[field]!==undefined)item[field]=copy(rule[field]);
        for(const field of ['assetKind','itemType','category'])if(rule[field]!==undefined)item[field]=rule[field];
      }
      item.isMaterial=cls.isMaterial!==false;
      item.protection=item.isMaterial?(overrides.protection?Math.max(0,Number(raw.protection)||0):Math.max(0,Number(cls.protection)||0)):0;
      item.baseStructurePoints=item.isMaterial?(overrides.structure?oldBase:Math.max(1,Number(cls.baseStructurePoints)||2)):0;
      const nextMax=maximum(item);
      item.structurePointsCurrent=!item.isMaterial?0:oldBase>0&&Number.isFinite(oldCurrent)?oldCurrent<=0?0:Math.max(0,nextMax-Math.max(0,oldMax-oldCurrent)):nextMax;
      item.durabilityMigration={from:raw.durabilityRevision||raw.equipmentRulesRevision||'legacy',oldBase,oldMaximum:oldMax,oldCurrent:oldCurrent??null,newBase:item.baseStructurePoints};
      item.durabilityOverrides=overrides;
      item.durabilityRevision=revision;
      item.equipmentRulesRevision=revision;
    }
    if(item.isMaterial){
      if(!(Number(item.baseStructurePoints)>0))item.baseStructurePoints=Math.max(1,Number(cls.baseStructurePoints)||2);
      const max=maximum(item),value=item.structurePointsCurrent;
      item.structurePointsCurrent=value===null||value===undefined?max:Math.max(0,Math.min(max,Number(value)||0));
    }else{item.baseStructurePoints=0;item.structurePointsCurrent=0;item.protection=0;}
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
    const equipment=(owner.equipment||[]).map(item=>({...item,protection:Number(item.protection)>0?(isBroken(item)?0:Number(item.protection)):0,equippedQuantity:isBroken(item)?0:item.equippedQuantity}));
    return oldSummary({...owner,equipment});
  };
  const oldRender=renderItemRulesV174;
  renderItemRulesV174=function(owner,item,index){syncOwner(owner);const box=oldRender(owner,item,index);if(item.isMaterial){box.prepend(el('p',{class:'notice equipment-structure-summary',text:(item.protection>0?'Rüstung '+(isBroken(item)?0:Number(item.protection))+' · ':'')+'Struktur '+item.structurePointsCurrent+'/'+maximum(item)+(isBroken(item)?' · zerstört / unbrauchbar':'')}));}return box;};
  const oldSave=saveOwnerV173;saveOwnerV173=function(owner,...args){syncOwner(owner);return oldSave(owner,...args)};
  const oldMigrate=migrateState;migrateState=function(data){return syncData(oldMigrate(data))};
  function prepareSubmission(payload,owner){payload.equipmentRulesRevision=revision;payload.clientEquipmentStructure=[owner,...(owner.auxiliaryTabs||[])].flatMap(holder=>(holder.equipment||[]).filter(item=>item.isMaterial).map(item=>({ownerId:holder.id,instanceId:item.instanceId,catalogId:item.catalogId||null,materialId:item.materialId||null,name:item.name,quantity:item.quantity??1,maximum:maximum(item),current:item.structurePointsCurrent,armor:isBroken(item)?0:Number(item.protection)||0,destroyed:isBroken(item),scope:item.durability?.scope||null,damageMode:'narrative-events-only'})));return payload;}
  if(state.equipmentRulesRevision!==revision){try{localStorage.setItem(STORE+'.backup.durability-20261114',JSON.stringify(state))}catch{}}
  restoreLegacyProtection(state,legacyProtectionAtLoad);
  syncData(state);
  Object.assign(global.Eberos,{equipmentRulesRevision:revision,equipmentRules:{syncOwner,syncData,isBroken,isEquipped,maximum,itemModules,prepareSubmission,physicalFields}});
})(window);
