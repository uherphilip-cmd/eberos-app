/* Eberos v1.8.19 · kanonische Widerstände als sekundäre abgeleitete Werte */
(function installResistanceRulesV1819(global) {
  'use strict';

  const CATALOG_VERSION = '1.0.0';
  const DEFINITIONS = Object.freeze([
    ['magic', 'Magische Resistenz', 'supernatural', null],
    ['elemental', 'Elementare Resistenz', 'supernatural', null],
    ['elemental.fire', 'Feuerresistenz', 'elemental', 'elemental'],
    ['elemental.water', 'Wasserresistenz', 'elemental', 'elemental'],
    ['elemental.earth', 'Erdresistenz', 'elemental', 'elemental'],
    ['elemental.wind', 'Windresistenz', 'elemental', 'elemental'],
    ['elemental.lightning', 'Blitzresistenz', 'elemental', 'elemental'],
    ['elemental.ice', 'Eisresistenz', 'elemental', 'elemental'],
    ['darkness', 'Finsternisresistenz', 'supernatural', null],
    ['light', 'Lichtresistenz', 'supernatural', null],
    ['poison', 'Giftresistenz', 'biological', null],
    ['disease', 'Krankheitsresistenz', 'biological', null],
    ['acid', 'Säureresistenz', 'chemical', null],
    ['environment.heat', 'Hitzeresistenz', 'environment', null],
    ['environment.cold', 'Kälteresistenz', 'environment', null],
    ['environment.wet', 'Nässeresistenz', 'environment', null],
  ].map(([id, label, group, parent]) => Object.freeze({ id, label, group, parent })));
  const BY_ID = new Map(DEFINITIONS.map((definition) => [definition.id, definition]));
  const DISPLAY_IDS = Object.freeze(['magic', 'elemental', 'darkness', 'light', 'poison', 'disease', 'acid']);
  const DETAIL_IDS = Object.freeze(DEFINITIONS.map((definition) => definition.id)
    .filter((id) => !DISPLAY_IDS.includes(id)));
  const originalDerived = derived;
  const originalPrepareCampaignSubmission = typeof prepareCampaignSubmission === 'function'
    ? prepareCampaignSubmission
    : null;

  function finite(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
  }

  function normalizeId(value) {
    const id = String(value ?? '').replace(/^resistance:/u, '');
    return BY_ID.has(id) ? id : null;
  }

  function addModifier(values, rawTarget, rawValue) {
    const id = normalizeId(rawTarget);
    if (id) values[id] += finite(rawValue);
  }

  function collectModules(values, modules) {
    for (const module of Array.isArray(modules) ? modules : []) {
      if (module?.type === 'resistance' && module?.operation !== 'set') {
        addModifier(values, module.target, module.value ?? module.amountV1710);
      }
    }
  }

  function resistanceValues(owner = {}) {
    const values = Object.fromEntries(DEFINITIONS.map((definition) => [definition.id, 0]));
    for (const [id, value] of Object.entries(owner.resistancesV1819 ?? {})) addModifier(values, id, value);
    for (const item of owner.equipment ?? []) {
      if (item?.active === false || item?.loadState === 'stored') continue;
      collectModules(values, item.resistanceEffectsV1819 ?? item.materialEffectsV1819);
    }
    for (const effect of owner.activeEffectsV177 ?? []) {
      if (effect?.active === false) continue;
      collectModules(values, effect.modules ?? effect.resistanceEffectsV1819);
    }
    return values;
  }

  function resistanceValue(owner, rawId) {
    const id = normalizeId(rawId);
    if (!id) return 0;
    const values = resistanceValues(owner);
    const parent = BY_ID.get(id)?.parent;
    return values[id] + (parent ? values[parent] : 0);
  }

  derived = function derivedResistanceV1819(owner) {
    const rows = originalDerived(owner);
    const values = resistanceValues(owner);
    const resistanceRows = DISPLAY_IDS.map((id) => ({
      n: BY_ID.get(id).label,
      v: values[id],
      f: 'sekundärer Wert · Grundwert 0 + dauerhafte und aktive Quellen',
    }));
    for (const id of DETAIL_IDS) {
      if (!values[id]) continue;
      const definition = BY_ID.get(id);
      const effective = resistanceValue(owner, id);
      resistanceRows.push({
        n: definition.label,
        v: effective,
        f: definition.parent
          ? `${BY_ID.get(definition.parent).label} ${values[definition.parent]} + spezieller Wert ${values[id]}`
          : 'sekundärer Umweltwert · Grundwert 0 + Quellen',
      });
    }
    return [...rows, ...resistanceRows];
  };

  if (originalPrepareCampaignSubmission) {
    prepareCampaignSubmission = function prepareCampaignSubmissionResistanceV1819(character = ch()) {
      const submission = originalPrepareCampaignSubmission(character);
      submission.resistanceCatalogVersion = CATALOG_VERSION;
      submission.clientResistances = resistanceValues(character);
      return submission;
    };
  }

  global.EberosResistanceRulesV1819 = Object.freeze({
    catalogVersion: CATALOG_VERSION,
    classification: 'secondary_derived_value',
    definitions: DEFINITIONS,
    normalizeId,
    resistanceValues,
    resistanceValue,
  });
})(window);
