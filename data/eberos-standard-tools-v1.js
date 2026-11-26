'use strict';

// Standardwerkzeuge use the existing source-linked effect pipeline.
(function () {
  const catalog = new Map(window.EBEROS_ITEM_DB.items.map(item => [item.id, item]));
  const profileFor = item => catalog.get(item?.catalogId)?.standardTool;
  const isReady = item => item.active !== false && item.loadState === 'equipped'
    && Number(item.equippedQuantity) > 0 && Number(item.quantity) > 0
    && Number(item.structurePointsCurrent) > 0 && !item.functionDisabled;

  const previousSync = syncLinkedEffectsV177;
  syncLinkedEffectsV177 = function (owner) {
    const previous = previousSync(owner);
    const next = previous.filter(effect => !(effect.sourceType === 'item' && String(effect.id).startsWith('standard-tool:')));
    for (const item of owner.equipment || []) {
      const tool = profileFor(item);
      if (!tool) continue;
      if (!isReady(item)) {
        if (item.toolInUse) item.toolInUse = false;
        continue;
      }
      if (tool.activation !== 'worn' && !item.toolInUse) continue;
      const sourceId = item.instanceId || item.id;
      const modules = item.standardTool?.modules ?? tool.modules;
      const effect = effectInstanceV177({
        id: 'standard-tool:' + sourceId, sourceType: 'item', sourceId, sourceLabel: item.name,
        name: item.name, active: true, sourceManaged: true, category: 'Gegenstandsbonus',
        description: tool.skillName + ' · ' + tool.rule, modules
      });
      next.push(effect);
    }
    owner.activeEffectsV177 = next;
    return next;
  };

  const previousRender = renderEquipmentV174;
  renderEquipmentV174 = function (owner) {
    const panel = previousRender(owner);
    const entries = [...panel.querySelectorAll('.equipment-entry')].filter(entry => !entry.parentElement.closest('.equipment-entry'));
    (owner.equipment || []).forEach((item, index) => {
      const tool = profileFor(item);
      if (!tool || !entries[index] || tool.activation === 'worn') return;
      const on = !!item.toolInUse && isReady(item);
      const button = el('button', {type: 'button', text: on ? 'Werkzeugeinsatz beenden' : 'Werkzeug einsetzen'});
      button.dataset.standardTool = item.instanceId || item.id;
      button.setAttribute('aria-pressed', String(on));
      button.disabled = !isReady(item);
      button.title = button.disabled ? 'Das Werkzeug muss intakt und ausgerüstet sein.' : tool.skillName;
      button.onclick = () => {
        if (!isReady(item)) return;
        item.toolInUse = !item.toolInUse;
        syncLinkedEffectsV177(owner);
        persistEffectsV177(owner, true);
      };
      entries[index].append(button);
    });
    return panel;
  };
})();

