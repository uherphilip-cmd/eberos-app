/* Eberos v1.8.18 · Rohstoffeffekte für Tragfähigkeit und Strukturpunkte */
(function installMaterialEffectsV1818(global) {
  'use strict';

  const CONTRACT_VERSION = 'r084-balance-builder-20261029';
  const CARRY_EFFECTS = Object.freeze({
    'v06:construction:capacity:10': 10,
    'v06:construction:capacity:20': 20,
  });
  const STRUCTURE_EFFECTS = Object.freeze({
    'v06:construction:structure:2': 2,
    'v06:construction:structure:4': 4,
  });
  const OBJECT_KINDS = Object.freeze({
    none: 'Kein Bauobjekt',
    barrier: 'Barriere',
    door: 'Tür',
    cart: 'Karren',
    bridge: 'Brücke',
    rope: 'Seil',
    container: 'Behälter',
    other: 'Sonstiges Objekt',
  });

  const originalNormalizeItem = normalizeItemV174;
  const originalLoadSummary = loadSummaryV174;
  const originalDerived = derived;
  const originalRenderItemRules = renderItemRulesV174;

  function finiteOrNull(value) {
    const number = Number(value);
    return value === '' || value === null || value === undefined || !Number.isFinite(number) ? null : number;
  }

  function effectType(effectId) {
    if (Object.hasOwn(CARRY_EFFECTS, effectId)) return 'carry_capacity_percent';
    if (Object.hasOwn(STRUCTURE_EFFECTS, effectId)) return 'object_structure_points';
    return null;
  }

  function normalizeMaterialEffect(raw) {
    const effectId = String(raw?.effectId ?? raw?.effect_id ?? '');
    const type = effectType(effectId);
    if (!type) return null;
    if (type === 'carry_capacity_percent') {
      return {
        contractVersion: CONTRACT_VERSION,
        effectId,
        domain: 'construction',
        type,
        operation: 'percent_add',
        value: CARRY_EFFECTS[effectId],
        unit: 'Prozent',
        target: raw?.target === 'object' ? 'object' : 'holder',
        stacking: 'highest_only',
        capPercent: 20,
        sourceMaterialId: String(raw?.sourceMaterialId ?? raw?.material_id ?? ''),
      };
    }
    return {
      contractVersion: CONTRACT_VERSION,
      effectId,
      domain: 'construction',
      type,
      operation: 'max_add',
      value: STRUCTURE_EFFECTS[effectId],
      unit: 'Strukturpunkte',
      target: 'object',
      damageRule: 'current_minus_damage',
      destroyedAt: 0,
      repairCap: 'maximum',
      sourceMaterialId: String(raw?.sourceMaterialId ?? raw?.material_id ?? ''),
    };
  }

  function normalizeMaterialEffects(rawItem) {
    const source = Array.isArray(rawItem?.materialEffectsV1818)
      ? [...rawItem.materialEffectsV1818]
      : [];
    if (rawItem?.materialCarryCapacityEffectId) {
      source.push({
        effectId: rawItem.materialCarryCapacityEffectId,
        target: rawItem.materialCarryTarget,
        sourceMaterialId: rawItem.materialSourceId,
      });
    }
    if (rawItem?.materialStructureEffectId) {
      source.push({
        effectId: rawItem.materialStructureEffectId,
        sourceMaterialId: rawItem.materialSourceId,
      });
    }
    const normalized = source.map(normalizeMaterialEffect).filter(Boolean);
    const strongest = new Map();
    for (const effect of normalized) {
      const key = effect.type;
      if (!strongest.has(key) || effect.value > strongest.get(key).value) strongest.set(key, effect);
    }
    return [...strongest.values()];
  }

  function findEffect(item, type) {
    return (item?.materialEffectsV1818 ?? []).find((effect) => effect?.type === type) ?? null;
  }

  function setEffect(item, type, effectId, options = {}) {
    const effects = (item.materialEffectsV1818 ?? []).filter((effect) => effect?.type !== type);
    if (effectId) {
      const effect = normalizeMaterialEffect({ effectId, ...options });
      if (effect) effects.push(effect);
    }
    item.materialEffectsV1818 = effects;
    return item;
  }

  function carryBonusForItem(item, target = 'holder') {
    const effect = findEffect(item, 'carry_capacity_percent');
    if (!effect || effect.domain !== 'construction' || effect.target !== target) return 0;
    return Math.min(20, Math.max(0, Number(effect.value) || 0));
  }

  function holderCarryBonus(owner) {
    let highest = 0;
    for (const item of owner?.equipment ?? []) {
      if (item?.active === false || item?.loadState === 'stored') continue;
      highest = Math.max(highest, carryBonusForItem(item, 'holder'));
    }
    return Math.min(20, highest);
  }

  function structureBonus(item) {
    const effect = findEffect(item, 'object_structure_points');
    return effect?.domain === 'construction' ? Math.max(0, Number(effect.value) || 0) : 0;
  }

  function structureMaximum(item) {
    return Math.max(0, Number(item?.baseStructurePoints) || 0) + structureBonus(item);
  }

  function objectLoadCapacity(item) {
    const base = finiteOrNull(item?.baseLoadCapacityKg);
    if (base === null) return null;
    const bonus = carryBonusForItem(item, 'object');
    return Math.round(Math.max(0, base) * (1 + bonus / 100) * 1000) / 1000;
  }

  function clampStructure(item, fillWhenMissing = false) {
    const maximum = structureMaximum(item);
    const incoming = finiteOrNull(item.structurePointsCurrent);
    item.structurePointsCurrent = incoming === null && fillWhenMissing
      ? maximum
      : Math.max(0, Math.min(maximum, incoming ?? 0));
    return item;
  }

  function applyStructureDamage(item, amount) {
    clampStructure(item, true);
    item.structurePointsCurrent = Math.max(0, item.structurePointsCurrent - Math.max(0, Number(amount) || 0));
    return item.structurePointsCurrent;
  }

  function repairStructure(item, amount) {
    clampStructure(item, true);
    item.structurePointsCurrent = Math.min(
      structureMaximum(item),
      item.structurePointsCurrent + Math.max(0, Number(amount) || 0),
    );
    return item.structurePointsCurrent;
  }

  normalizeItemV174 = function normalizeItemMaterialV1818(raw = {}) {
    const item = originalNormalizeItem(raw);
    item.objectKind = Object.hasOwn(OBJECT_KINDS, raw.objectKind) ? raw.objectKind : 'none';
    item.baseLoadCapacityKg = finiteOrNull(raw.baseLoadCapacityKg);
    item.baseStructurePoints = Math.max(0, finiteOrNull(raw.baseStructurePoints ?? raw.structurePointsMax) ?? 0);
    item.structurePointsCurrent = finiteOrNull(raw.structurePointsCurrent);
    item.materialEffectsV1818 = normalizeMaterialEffects(raw);
    return clampStructure(item, item.structurePointsCurrent === null);
  };

  loadSummaryV174 = function loadSummaryMaterialV1818(owner, baseOverride = null) {
    const summary = originalLoadSummary(owner, baseOverride);
    const percent = holderCarryBonus(owner);
    const baseCapacity = summary.capacity;
    const capacity = baseCapacity === null
      ? null
      : Math.round(baseCapacity * (1 + percent / 100) * 1000) / 1000;
    const overweight = capacity === null ? 0 : Math.max(0, Math.ceil((summary.total - capacity) * 10 - 1e-9) / 10);
    const penalty = overweight > 0 ? Math.ceil(overweight / 10) : 0;
    const base = baseOverride || baseAttributesV174(owner);
    const finalStrength = base ? Math.max(0, Number(base.ST) - penalty) : null;
    return {
      ...summary,
      capacityWithoutMaterialBonus: baseCapacity,
      materialCarryCapacityPercent: percent,
      capacity,
      overweight,
      penalty,
      finalStrength,
      strengthDeficit: finalStrength === null ? 0 : Math.max(0, summary.requiredStrength - finalStrength),
    };
  };

  derived = function derivedMaterialV1818(owner) {
    const rows = originalDerived(owner);
    const carrying = rows.find((row) => row.n === 'Tragen');
    if (!carrying) return rows;
    const summary = loadSummaryV174(owner);
    carrying.v = summary.capacity === null ? '—' : `${summary.capacity} kg`;
    carrying.f = summary.materialCarryCapacityPercent
      ? `(wirksame ST + KS) × 10 × ${1 + summary.materialCarryCapacityPercent / 100} (Handwerk +${summary.materialCarryCapacityPercent}%)`
      : '(wirksame ST + KS) × 10';
    return rows;
  };

  function selectWithOptions(entries, value) {
    const select = el('select');
    for (const [optionValue, label] of entries) select.append(el('option', { value: optionValue, text: label }));
    select.value = value;
    return select;
  }

  renderItemRulesV174 = function renderItemRulesMaterialV1818(owner, item) {
    const box = originalRenderItemRules(owner, item);
    const material = el('section', { class: 'item-rules material-object-rules' });
    const grid = el('div', { class: 'grid' });
    const objectKind = selectWithOptions(Object.entries(OBJECT_KINDS), item.objectKind || 'none');
    const carryEffect = findEffect(item, 'carry_capacity_percent');
    const carryValue = carryEffect?.value ? String(carryEffect.value) : '0';
    const carrySelect = selectWithOptions([
      ['0', 'Kein Rohstoffbonus'],
      ['10', '+10 % Tragfähigkeit'],
      ['20', '+20 % Tragfähigkeit'],
    ], carryValue);
    const carryTarget = selectWithOptions([
      ['holder', 'Träger (Charakter / NPC)'],
      ['object', 'Gegenstand (z. B. Brücke / Seil)'],
    ], carryEffect?.target === 'object' ? 'object' : 'holder');
    const objectCapacity = el('input', {
      type: 'number', min: 0, step: 0.1, value: item.baseLoadCapacityKg ?? '', placeholder: 'unbekannt',
    });
    const structureEffect = findEffect(item, 'object_structure_points');
    const structureSelect = selectWithOptions([
      ['0', 'Kein Rohstoffbonus'],
      ['2', '+2 Strukturpunkte'],
      ['4', '+4 Strukturpunkte'],
    ], structureEffect?.value ? String(structureEffect.value) : '0');
    const structureBase = el('input', { type: 'number', min: 0, step: 1, value: item.baseStructurePoints || 0 });
    const structureCurrent = el('input', {
      type: 'number', min: 0, max: structureMaximum(item), step: 1, value: item.structurePointsCurrent ?? 0,
    });
    const materialSource = el('input', {
      value: carryEffect?.sourceMaterialId || structureEffect?.sourceMaterialId || '',
      placeholder: 'z. B. mat-eichenholz',
    });

    objectKind.onchange = (event) => {
      item.objectKind = event.target.value;
      saveLoadV174(owner, true);
    };
    carrySelect.onchange = (event) => {
      const value = Number(event.target.value);
      setEffect(item, 'carry_capacity_percent', value ? `v06:construction:capacity:${value}` : '', {
        target: carryTarget.value,
        sourceMaterialId: materialSource.value,
      });
      saveLoadV174(owner, true);
    };
    carryTarget.onchange = (event) => {
      const effect = findEffect(item, 'carry_capacity_percent');
      if (effect) effect.target = event.target.value === 'object' ? 'object' : 'holder';
      saveLoadV174(owner, true);
    };
    objectCapacity.onchange = (event) => {
      item.baseLoadCapacityKg = finiteOrNull(event.target.value);
      saveLoadV174(owner, true);
    };
    structureSelect.onchange = (event) => {
      const wasFull = item.structurePointsCurrent >= structureMaximum(item);
      const value = Number(event.target.value);
      setEffect(item, 'object_structure_points', value ? `v06:construction:structure:${value}` : '', {
        sourceMaterialId: materialSource.value,
      });
      if (wasFull) item.structurePointsCurrent = structureMaximum(item);
      else clampStructure(item, false);
      saveLoadV174(owner, true);
    };
    structureBase.onchange = (event) => {
      const wasFull = item.structurePointsCurrent >= structureMaximum(item);
      item.baseStructurePoints = Math.max(0, Number(event.target.value) || 0);
      if (wasFull) item.structurePointsCurrent = structureMaximum(item);
      else clampStructure(item, false);
      saveLoadV174(owner, true);
    };
    structureCurrent.onchange = (event) => {
      item.structurePointsCurrent = Math.max(0, Math.min(structureMaximum(item), Number(event.target.value) || 0));
      saveLoadV174(owner, true);
    };
    materialSource.onchange = (event) => {
      for (const effect of item.materialEffectsV1818 ?? []) effect.sourceMaterialId = event.target.value.trim();
      saveLoadV174(owner);
    };

    grid.append(
      equipmentFieldV174('Bauobjekt-Art', objectKind),
      equipmentFieldV174('Verwendeter Rohstoff (ID)', materialSource),
      equipmentFieldV174('Tragfähigkeitsbonus aus Handwerk', carrySelect),
      equipmentFieldV174('Ziel der Tragfähigkeit', carryTarget),
      equipmentFieldV174('Grund-Tragfähigkeit des Objekts (kg)', objectCapacity),
      equipmentFieldV174('Grund-Strukturpunkte', structureBase),
      equipmentFieldV174('Strukturbonus aus Handwerk', structureSelect),
      equipmentFieldV174('Aktuelle Strukturpunkte', structureCurrent),
    );
    material.append(el('h4', { text: 'Rohstoff, Tragfähigkeit & Struktur' }), grid);
    const objectCapacityValue = objectLoadCapacity(item);
    const maximum = structureMaximum(item);
    const status = item.structurePointsCurrent <= 0 && maximum > 0 ? ' · zerstört / unbrauchbar' : '';
    material.append(el('p', {
      class: 'notice',
      text: `Objekttragfähigkeit: ${objectCapacityValue === null ? 'nicht festgelegt' : `${objectCapacityValue} kg`} · Struktur: ${item.structurePointsCurrent}/${maximum}${status}`,
    }));
    const actions = el('div', { class: 'toolbar' });
    actions.append(
      el('button', {
        type: 'button',
        text: '−1 Schaden',
        onclick: () => { applyStructureDamage(item, 1); saveLoadV174(owner, true); },
      }),
      el('button', {
        type: 'button',
        text: '+1 Reparatur',
        onclick: () => { repairStructure(item, 1); saveLoadV174(owner, true); },
      }),
    );
    material.append(actions);
    box.append(material);
    return box;
  };

  global.EberosMaterialBuilderV1818 = Object.freeze({
    contractVersion: CONTRACT_VERSION,
    carryEffects: CARRY_EFFECTS,
    structureEffects: STRUCTURE_EFFECTS,
    objectKinds: OBJECT_KINDS,
    normalizeMaterialEffect,
    normalizeMaterialEffects,
    setEffect,
    carryBonusForItem,
    holderCarryBonus,
    structureBonus,
    structureMaximum,
    objectLoadCapacity,
    applyStructureDamage,
    repairStructure,
  });
})(window);
