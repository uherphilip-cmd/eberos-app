'use strict';
(function(global){
  const revision='equipment-durability-2026-11-14-r1';
  const catalogIndices = new WeakMap();
  function lookup(rows, key, value) {
    if (!rows || value == null) return null;
    let index = catalogIndices.get(rows);
    if (!index || index.length !== rows.length) {
      index = {length:rows.length, id:new Map(), name:new Map()};
      for (const row of rows) {
        if (!index.id.has(row.id)) index.id.set(row.id, row);
        if (!index.name.has(row.name)) index.name.set(row.name, row);
      }
      catalogIndices.set(rows, index);
    }
    return index[key].get(value);
  }
  function resolve(item) {
    if (item?.sourceVersion === 'raw-material-lot-v1') return lookup(global.EBEROS_RAW_MATERIALS?.materials, 'id', item.materialId) || null;
    const id = item?.catalogId || item?.id;
    const standard = global.EBEROS_ITEM_DB?.items;
    return lookup(global.EBEROS_MSE_ITEM_DB_V15?.items, 'id', id) || lookup(standard, 'id', id)
      || (!item?.catalogId && (() => {
        const match=lookup(standard,'name',item?.name);
        return match?.sourceVersion==='standard-tools-v1'?null:match;
      })()) || null;
  }
  function classification(item){
    const rule=resolve(item);if(rule)return {isMaterial:rule.isMaterial,protection:rule.protection||0,baseStructurePoints:rule.baseStructurePoints||0};
    const material=item?.isMaterial!==false&&!['companion','mount','familiar','npc','boon','title','blessing'].includes(item?.assetKind||item?.itemType);
    if(!material)return {isMaterial:false,protection:0,baseStructurePoints:0};
    const n=String(item?.name||'').toLowerCase();
    const sp=/plattenharnisch|vollplatte/.test(n)?8:/schild/.test(n)?5:/stiefel|\bschuhe\b/.test(n)?3:/sphäre|fiole|glas|papier|schriftrolle/.test(n)?1:/buch|kodex/.test(n)?3:/stab|speer|axt|schwert|hammer/.test(n)?4:/leder/.test(n)?3:2;
    return {isMaterial:true,protection:Math.max(0,Number(item?.protection)||0),baseStructurePoints:sp};
  }
  const physical=item=>classification(item).isMaterial;
  global.EberosEquipmentPolicy=Object.freeze({revision,resolve,classification,physical});
})(window);
