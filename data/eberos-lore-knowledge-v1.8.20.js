'use strict';

/* Eberos v1.8.20 · Lore, Kampagnenwahrheit und freigegebenes Wissen */
(function installLoreKnowledge(global) {
  const VERSION = '1.8.20';
  const REVISION = 'lore-governance-phase4';
  const PLAYER_COLUMNS = [
    'disclosure_id', 'campaign_id', 'audience_character_id', 'knowledge_level',
    'player_title', 'player_text', 'revealed_at_day', 'revision', 'updated_at',
  ].join(',');
  const TRUTH_LABELS = Object.freeze({
    canon: 'Kanon',
    'canon-interpretive': 'Kanon · Einordnung',
    'in-world-claim': 'Innerweltliche Lehrmeinung',
    tradition: 'Überlieferung',
    rumor: 'Gerücht',
    'gm-truth': 'Kampagnenwahrheit',
    'open-core': 'Offener Kern',
    'working-hypothesis': 'Arbeitshypothese',
  });
  const KNOWLEDGE_LABELS = Object.freeze({ partial: 'Teilwissen', known: 'Bekannt' });
  const playerStates = new WeakMap();
  const gmStates = new WeakMap();

  const clear = (node) => node?.replaceChildren();
  const text = (node, value) => { if (node) node.textContent = String(value ?? ''); };
  const friendlyError = (error) => {
    const message = String(error?.message || '');
    if (error?.code === '42501') return 'Diese Aktion ist für dein Konto nicht freigegeben.';
    if (error?.code === '40001') return 'Dieser Eintrag wurde inzwischen geändert. Bitte neu laden.';
    if (/failed to fetch|network/i.test(message)) return 'Die Lore-Daten konnten nicht vom Server geladen werden.';
    return message || 'Die Lore-Aktion konnte nicht abgeschlossen werden.';
  };
  function element(tag, attributes = {}, children = []) {
    const node = document.createElement(tag);
    for (const [name, value] of Object.entries(attributes)) {
      if (name === 'className') node.className = value;
      else if (name === 'text') node.textContent = value;
      else if (name === 'dataset') Object.assign(node.dataset, value);
      else if (name === 'checked') node.checked = Boolean(value);
      else if (name === 'hidden') node.hidden = Boolean(value);
      else if (value !== undefined && value !== null) node.setAttribute(name, String(value));
    }
    for (const child of Array.isArray(children) ? children : [children]) {
      if (child === undefined || child === null) continue;
      node.append(child instanceof Node ? child : document.createTextNode(String(child)));
    }
    return node;
  }
  function action(label, handler, className = '') {
    const node = element('button', { type: 'button', text: label, className });
    if (handler) node.addEventListener('click', handler);
    return node;
  }
  function tag(label, kind = '') {
    return element('span', { className: `lore-tag${kind ? ` lore-tag-${kind}` : ''}`, text: label });
  }
  function labeled(label, control, hint = '') {
    const content = [element('span', { text: label }), control];
    if (hint) content.push(element('small', { className: 'muted', text: hint }));
    return element('label', { className: 'field' }, content);
  }
  function input(type, name, options = {}) {
    const node = element('input', { type, name });
    Object.assign(node, options);
    return node;
  }
  function textarea(name, maxLength = 100000) {
    const node = element('textarea', { name });
    node.maxLength = maxLength;
    return node;
  }
  function select(name, choices = []) {
    const node = element('select', { name });
    setOptions(node, choices);
    return node;
  }
  function setOptions(control, choices, selected = null) {
    clear(control);
    for (const choice of choices) {
      const [value, label] = Array.isArray(choice) ? choice : [choice.value, choice.label];
      const option = element('option', { value, text: label });
      if (selected !== null && String(value) === String(selected)) option.selected = true;
      control.append(option);
    }
  }
  function createServices(services = {}) {
    const Client = global.EberosSupabaseClient;
    if (!Client && services.repository) {
      return { provider: services.provider || null, repository: services.repository, liveSync: services.liveSync || null };
    }
    if (!Client) throw new Error('Der geschützte Kampagnenzugang ist noch nicht geladen.');
    const provider = services.provider || new Client.SupabaseClientProvider();
    return {
      provider,
      repository: services.repository || new Client.SupabaseCampaignRepository({ provider }),
      liveSync: services.liveSync || (Client.CampaignLiveSyncGateway ? new Client.CampaignLiveSyncGateway({ provider }) : null),
    };
  }
  async function rows(repository, table, columns, configure) {
    if (!repository?.rows) throw new Error('Die Lore-Datenquelle ist nicht verfügbar.');
    return repository.rows(table, columns, configure);
  }
  async function rpc(repository, name, parameters) {
    if (!repository?.rpc) throw new Error('Der Lore-Befehl ist nicht verfügbar.');
    return repository.rpc(name, parameters);
  }
  async function replaceLiveSubscription(state, campaignId, listener) {
    if (state.liveCampaignId === campaignId && state.liveUnsubscribe) return;
    try { await state.liveUnsubscribe?.(); } catch {}
    state.liveUnsubscribe = null;
    state.liveCampaignId = campaignId || null;
    if (!campaignId || !state.liveSync?.subscribeCampaignLive) return;
    state.liveUnsubscribe = await state.liveSync.subscribeCampaignLive(campaignId, listener, {
      onStatus: (status) => {
        state.liveStatus = status;
        if (state.syncNode) text(state.syncNode, status === 'SUBSCRIBED' ? 'Geräteabgleich aktiv' : 'Geräteabgleich wird verbunden …');
      },
    });
  }

  function ensurePlayerUi(state) {
    if (state.ui?.section?.isConnected) return state.ui;
    const anchor = state.root.querySelector('[data-selected-campaign]') || state.root.querySelector('[data-auth-session]');
    if (!anchor) return null;
    const section = element('section', {
      className: 'campaign-lore-player lore-panel',
      dataset: { campaignLorePlayer: '', noOfflineCache: 'authorization-required' },
    });
    const title = element('h3', { text: 'Wissen & Überlieferungen' });
    const explanation = element('p', {
      className: 'muted',
      text: 'Hier erscheint nur Wissen, das die Spielleitung ausdrücklich für die Kampagne oder deine ausgewählte Figur freigegeben hat.',
    });
    const status = element('p', { className: 'notice', text: 'Wissen wird geladen …', role: 'status' });
    const sync = element('p', { className: 'muted', text: 'Geräteabgleich wird vorbereitet …' });
    const search = input('search', 'lore-search', { placeholder: 'Freigegebenes Wissen durchsuchen', maxLength: 160 });
    const exportButton = action('Sichere Wissensliste exportieren', () => exportPlayerKnowledge(state));
    const controls = element('div', { className: 'lore-toolbar' }, [labeled('Suche', search), exportButton]);
    const list = element('div', { className: 'lore-card-list', dataset: { playerLoreList: '' } });
    section.append(title, explanation, status, sync, controls, list);
    anchor.after(section);
    search.addEventListener('input', () => renderPlayerKnowledge(state));
    state.syncNode = sync;
    state.ui = { section, status, search, exportButton, list };
    return state.ui;
  }
  function renderPlayerKnowledge(state) {
    const ui = ensurePlayerUi(state);
    if (!ui) return;
    clear(ui.list);
    const query = ui.search.value.trim().toLocaleLowerCase('de');
    const visible = (state.playerRows || []).filter((row) => !query
      || `${row.player_title} ${row.player_text}`.toLocaleLowerCase('de').includes(query));
    if (!state.campaignId) {
      text(ui.status, 'Wähle zuerst eine Kampagne.');
      ui.exportButton.disabled = true;
      return;
    }
    text(ui.status, visible.length
      ? `${visible.length} freigegebene Wissenseinträge · ausschließlich Spielerfassung`
      : 'Für diese Auswahl wurde noch kein Wissen freigegeben.');
    ui.exportButton.disabled = !visible.length;
    for (const row of visible) {
      const badges = element('div', { className: 'lore-tags' }, [
        tag(KNOWLEDGE_LABELS[row.knowledge_level] || row.knowledge_level),
        tag(row.audience_character_id ? 'Figurenwissen' : 'Kampagnenwissen'),
        tag(`ab Tag ${row.revealed_at_day}`),
      ]);
      const card = element('article', { className: 'lore-card player-lore-card' }, [
        element('h4', { text: row.player_title }), badges,
        element('p', { className: 'lore-preserve', text: row.player_text }),
      ]);
      ui.list.append(card);
    }
  }
  async function loadPlayerKnowledge(state, campaignId, characterId = null) {
    const ui = ensurePlayerUi(state);
    if (!ui) return;
    const serial = ++state.serial;
    state.campaignId = campaignId || null;
    state.characterId = characterId || null;
    state.playerRows = [];
    renderPlayerKnowledge(state);
    if (!campaignId) return;
    text(ui.status, 'Freigegebenes Wissen wird sicher vom Server geladen …');
    try {
      const result = await rows(state.repository, 'campaign_lore_player_view', PLAYER_COLUMNS, (query) => {
        let scoped = query.eq('campaign_id', campaignId);
        scoped = characterId
          ? scoped.or(`audience_character_id.is.null,audience_character_id.eq.${characterId}`)
          : scoped.is('audience_character_id', null);
        return scoped.order('revealed_at_day').order('player_title');
      });
      if (serial !== state.serial) return;
      state.playerRows = result;
      renderPlayerKnowledge(state);
      await replaceLiveSubscription(state, campaignId, (change) => {
        if (change.changeKind === 'lore' || change.changeKind === 'calendar') {
          return loadPlayerKnowledge(state, state.campaignId, state.characterId);
        }
      });
    } catch (error) {
      if (serial !== state.serial) return;
      state.playerRows = [];
      clear(ui.list);
      text(ui.status, friendlyError(error));
      ui.list.append(action('Erneut laden', () => loadPlayerKnowledge(state, state.campaignId, state.characterId)));
    }
  }
  function safePlayerExport(rowsToExport) {
    return rowsToExport.map((row) => ({
      disclosure_id: row.disclosure_id,
      campaign_id: row.campaign_id,
      audience_character_id: row.audience_character_id,
      knowledge_level: row.knowledge_level,
      player_title: row.player_title,
      player_text: row.player_text,
      revealed_at_day: row.revealed_at_day,
      revision: row.revision,
      updated_at: row.updated_at,
    }));
  }
  function exportPlayerKnowledge(state) {
    const payload = {
      format: 'eberos-player-lore-v1',
      exportedAt: new Date().toISOString(),
      campaignId: state.campaignId,
      characterId: state.characterId,
      entries: safePlayerExport(state.playerRows || []),
    };
    const blob = new Blob([`${JSON.stringify(payload, null, 2)}\n`], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = element('a', { href: url, download: `eberos-spielerwissen-${state.campaignId || 'kampagne'}.json` });
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
    return payload;
  }
  async function attachPlayer({ root, services } = {}) {
    if (!root) throw new TypeError('Der Spieler-Kampagnenbereich fehlt.');
    let state = playerStates.get(root);
    if (!state) {
      const connected = createServices(services);
      state = { root, ...connected, serial: 0, playerRows: [], campaignId: null, characterId: null, liveCampaignId: null, liveUnsubscribe: null };
      playerStates.set(root, state);
      ensurePlayerUi(state);
      state.selectionListener = (event) => {
        if (event.detail?.root !== root) return;
        loadPlayerKnowledge(state, event.detail.campaignId, event.detail.characterId).catch(() => {});
      };
      state.authListener = (event) => {
        if (event.detail?.user) return;
        state.serial++;
        state.playerRows = [];
        state.campaignId = null;
        state.characterId = null;
        state.liveUnsubscribe?.();
        state.liveUnsubscribe = null;
        renderPlayerKnowledge(state);
      };
      global.addEventListener('eberos:campaign-media-selection-v183', state.selectionListener);
      global.addEventListener('eberos:campaign-auth-change', state.authListener);
    }
    const campaignId = root.dataset.campaignMediaCampaignId || null;
    const characterId = root.dataset.campaignMediaCharacterId || null;
    await loadPlayerKnowledge(state, campaignId, characterId);
    return { campaignId, characterId, entries: state.playerRows.length };
  }

  function truthChoices() {
    return Object.entries(TRUTH_LABELS);
  }
  function createVariantForm(state) {
    const form = element('form', { className: 'lore-form', dataset: { loreVariantForm: '' } });
    const base = select('base_assertion_id');
    const title = input('text', 'title', { maxLength: 300, required: true });
    const content = textarea('content', 1000000); content.required = true;
    const truth = select('truth_status', truthChoices());
    const reason = textarea('gm_reason', 100000);
    const archived = input('checkbox', 'archived');
    const submit = element('button', { type: 'submit', className: 'primary', text: 'Kampagnenabweichung speichern' });
    const cancel = action('Eingabe zurücksetzen', () => resetVariantForm(state));
    form.append(
      element('input', { type: 'hidden', name: 'variant_id' }),
      element('input', { type: 'hidden', name: 'expected_revision' }),
      labeled('Globale Grundlage', base, 'Die globale Aussage bleibt unverändert.'),
      labeled('Titel der Kampagnenfassung', title),
      labeled('Kampagnenwahrheit', content),
      labeled('Wahrheitsebene', truth),
      labeled('Begründung für die Spielleitung', reason),
      element('label', { className: 'campaign-check' }, [archived, ' Archivieren']),
      element('div', { className: 'lore-actions' }, [submit, cancel]),
    );
    form.addEventListener('submit', (event) => saveVariant(state, event));
    return { form, base, title, content, truth, reason, archived };
  }
  function createDisclosureForm(state) {
    const form = element('form', { className: 'lore-form', dataset: { loreDisclosureForm: '' } });
    const sourceKind = select('source_kind', [['assertion', 'Globale Aussage'], ['variant', 'Kampagnenabweichung']]);
    const source = select('source_id');
    const audienceKind = select('audience_kind', [['campaign', 'Ganze Kampagne'], ['character', 'Bestimmte Figur']]);
    const character = select('audience_character_id', [['', 'Figur wählen']]);
    const knowledge = select('knowledge_level', [['partial', 'Teilwissen'], ['known', 'Vollständig bekannt']]);
    const title = input('text', 'player_title', { maxLength: 300, required: true });
    const content = textarea('player_text', 1000000); content.required = true;
    const day = input('number', 'revealed_at_day', { min: 1, max: 1000000, value: '1', required: true });
    const archived = input('checkbox', 'archived');
    const submit = element('button', { type: 'submit', className: 'primary', text: 'Spielerwissen speichern' });
    const cancel = action('Eingabe zurücksetzen', () => resetDisclosureForm(state));
    form.append(
      element('input', { type: 'hidden', name: 'disclosure_id' }),
      element('input', { type: 'hidden', name: 'expected_revision' }),
      labeled('Quelle', sourceKind),
      labeled('Konkrete Aussage oder Abweichung', source),
      labeled('Ziel', audienceKind),
      labeled('Figur', character),
      labeled('Wissensstand', knowledge),
      labeled('Spielertitel', title),
      labeled('Nur der sichtbare Spielertext', content, 'Keine SL-Notizen oder verborgenen Ursachen eintragen.'),
      labeled('Sichtbar ab Kampagnentag', day),
      element('label', { className: 'campaign-check' }, [archived, ' Archivieren']),
      element('div', { className: 'lore-actions' }, [submit, cancel]),
    );
    sourceKind.addEventListener('change', () => refreshDisclosureSources(state));
    audienceKind.addEventListener('change', () => { character.disabled = audienceKind.value !== 'character'; });
    form.addEventListener('submit', (event) => saveDisclosure(state, event));
    return { form, sourceKind, source, audienceKind, character, knowledge, title, content, day, archived };
  }
  function createLinkForm(state) {
    const form = element('form', { className: 'lore-form', dataset: { loreLinkForm: '' } });
    const assertion = select('assertion_id');
    const kind = select('entity_kind', [
      ['world', 'Welt'], ['place', 'Ort'], ['faction', 'Fraktion'], ['creature', 'Wesen'],
      ['world-event', 'Weltereignis'], ['world-route', 'Route'],
      ['astronomical-event', 'Astronomisches Ereignis'], ['media-asset', 'Medium'],
    ]);
    const entity = select('entity_id');
    const relation = select('relation_kind', [
      ['mentions', 'erwähnt'], ['describes', 'beschreibt'], ['origin', 'Ursprung'],
      ['location', 'Ort'], ['participant', 'Beteiligte'], ['evidence-for', 'Beleg für'],
    ]);
    const notes = textarea('notes', 100000);
    form.append(
      labeled('Loreaussage', assertion), labeled('Zielart', kind), labeled('Ziel', entity),
      labeled('Beziehung', relation), labeled('SL-Hinweis', notes),
      element('button', { type: 'submit', className: 'primary', text: 'Verknüpfung speichern' }),
    );
    kind.addEventListener('change', () => loadEntityOptions(state));
    form.addEventListener('submit', (event) => saveLink(state, event));
    return { form, assertion, kind, entity, relation, notes };
  }
  function ensureGmUi(state) {
    if (state.ui?.panel?.isConnected) return state.ui;
    const workspace = state.root.querySelector('[data-gm-workspace]');
    const tabs = workspace?.querySelector('.gm-section-tabs');
    if (!workspace || !tabs) return null;
    const tab = action('Lore & Wissen', () => activateGmLore(state));
    tab.dataset.gmView = 'lore';
    const panel = element('div', { className: 'gm-panel lore-panel', hidden: true, dataset: { gmPanel: 'lore' } });
    const status = element('p', { className: 'notice', text: 'Lore-Arbeitsbereich wird vorbereitet …', role: 'status' });
    const sync = element('p', { className: 'muted', text: 'Geräteabgleich wird vorbereitet …' });
    const retry = action('Bereich erneut laden', () => loadGmLore(state, { force: true }));

    const search = input('search', 'lore-search', { placeholder: 'Titel, Text oder Quelle durchsuchen', maxLength: 200 });
    const truthFilter = select('truth_filter', [['', 'Alle Wahrheitsebenen'], ...truthChoices()]);
    const assertionList = element('div', { className: 'lore-card-list' });
    const assertionSection = element('section', {}, [
      element('h3', { text: 'Globale Loreaussagen' }),
      element('p', { className: 'muted', text: 'Kanon, Lehrmeinung, Überlieferung, Gerücht und offene Kerne bleiben sichtbar getrennt.' }),
      element('div', { className: 'lore-toolbar' }, [labeled('Suche', search), labeled('Wahrheitsebene', truthFilter)]),
      assertionList,
    ]);
    const variantUi = createVariantForm(state);
    const disclosureUi = createDisclosureForm(state);
    const linkUi = createLinkForm(state);
    const variantDetails = element('details', { className: 'lore-editor' }, [element('summary', { text: 'Abweichung neu anlegen oder bearbeiten' }), variantUi.form]);
    const disclosureDetails = element('details', { className: 'lore-editor' }, [element('summary', { text: 'Kampagnen- oder Figurenwissen freigeben' }), disclosureUi.form]);
    const linkDetails = element('details', { className: 'lore-editor' }, [element('summary', { text: 'Aussage mit einem Weltobjekt verknüpfen' }), linkUi.form]);
    const variantList = element('div', { className: 'lore-card-list' });
    const disclosureList = element('div', { className: 'lore-card-list' });
    const linkList = element('div', { className: 'lore-card-list compact' });
    const suggestionList = element('div', { className: 'lore-card-list compact' });
    const historyList = element('div', { className: 'lore-card-list compact' });
    panel.append(
      element('h2', { text: 'Lore & Wissen' }),
      element('p', { className: 'muted', text: 'Globale Quellen bleiben unverändert. Abweichungen, Freigaben und Figurenwissen werden getrennt gespeichert und protokolliert.' }),
      status, sync, retry, assertionSection,
      element('section', {}, [element('h3', { text: 'Kampagnenabweichungen' }), variantDetails, variantList]),
      element('section', {}, [element('h3', { text: 'Wissen freigeben' }), disclosureDetails, disclosureList]),
      element('section', {}, [element('h3', { text: 'Aussagen mit Weltobjekten verknüpfen' }), linkDetails, linkList]),
      element('section', {}, [element('h3', { text: 'Aktualisierungsvorschläge' }), suggestionList]),
      element('section', {}, [element('h3', { text: 'Offenlegungsprotokoll' }), historyList]),
    );
    const campaignTab = tabs.querySelector('[data-gm-view="campaign"]');
    if (campaignTab) campaignTab.after(tab); else tabs.append(tab);
    workspace.append(panel);
    search.addEventListener('input', () => renderAssertions(state));
    truthFilter.addEventListener('change', () => renderAssertions(state));
    state.syncNode = sync;
    state.ui = {
      tab, panel, status, retry, search, truthFilter, assertionList,
      variantUi, disclosureUi, linkUi, variantDetails, disclosureDetails, linkDetails, variantList, disclosureList, linkList,
      suggestionList, historyList,
    };
    return state.ui;
  }
  function activateGmLore(state) {
    const ui = ensureGmUi(state);
    if (!ui) return;
    for (const control of state.root.querySelectorAll('[data-gm-view]')) control.classList.toggle('active', control === ui.tab);
    for (const panel of state.root.querySelectorAll('[data-gm-panel]')) panel.hidden = panel !== ui.panel;
    loadGmLore(state).catch(() => {});
  }
  function campaignSelection(state) {
    return state.root.querySelector('[data-gm-campaign-select]')?.value || null;
  }
  function assertionChoices(state) {
    return (state.assertions || []).map((row) => [row.assertion_id, `${row.title} · ${TRUTH_LABELS[row.truth_status] || row.truth_status}`]);
  }
  function refreshFormOptions(state) {
    const ui = state.ui;
    const choices = assertionChoices(state);
    const selectedBase = ui.variantUi.base.value;
    const selectedLink = ui.linkUi.assertion.value;
    setOptions(ui.variantUi.base, choices, selectedBase || choices[0]?.[0]);
    setOptions(ui.linkUi.assertion, choices, selectedLink || choices[0]?.[0]);
    setOptions(ui.disclosureUi.character, [['', 'Figur wählen'], ...(state.characters || []).map((row) => [row.id, row.public_data?.name || 'Unbenannte Figur'])], ui.disclosureUi.character.value);
    refreshDisclosureSources(state);
  }
  function refreshDisclosureSources(state) {
    const ui = state.ui?.disclosureUi;
    if (!ui) return;
    const selected = ui.source.value;
    const choices = ui.sourceKind.value === 'variant'
      ? (state.variants || []).filter((row) => row.status === 'active').map((row) => [row.variant_id, row.title])
      : assertionChoices(state);
    setOptions(ui.source, choices, selected || choices[0]?.[0]);
  }
  function renderAssertions(state) {
    const ui = state.ui;
    clear(ui.assertionList);
    const query = ui.search.value.trim().toLocaleLowerCase('de');
    const truth = ui.truthFilter.value;
    const filtered = (state.assertions || []).filter((row) => (!truth || row.truth_status === truth)
      && (!query || `${row.title} ${row.content} ${row.source_title}`.toLocaleLowerCase('de').includes(query)));
    if (!filtered.length) ui.assertionList.append(element('p', { className: 'muted', text: 'Keine passende Loreaussage.' }));
    for (const row of filtered) {
      const controls = element('div', { className: 'lore-actions' }, [
        action('Abweichung anlegen', () => prepareVariant(state, row)),
        action('Freigeben', () => prepareAssertionDisclosure(state, row)),
        action('Verknüpfen', () => prepareLink(state, row)),
      ]);
      ui.assertionList.append(element('article', { className: 'lore-card' }, [
        element('h4', { text: row.title }),
        element('div', { className: 'lore-tags' }, [
          tag(TRUTH_LABELS[row.truth_status] || row.truth_status, row.truth_status),
          tag(row.review_state === 'restricted' ? `SL · Spoiler ${row.spoiler_level}` : 'freigegeben'),
        ]),
        element('p', { className: 'lore-preserve', text: row.content }),
        element('small', { className: 'muted', text: `Quelle: ${row.source_title}` }), controls,
      ]));
    }
  }
  function sourceTitle(state, disclosure) {
    if (disclosure.source_variant_id) return state.variants.find((row) => row.variant_id === disclosure.source_variant_id)?.title || 'Kampagnenabweichung';
    return state.assertions.find((row) => row.assertion_id === disclosure.source_assertion_id)?.title || 'Globale Aussage';
  }
  function renderVariants(state) {
    clear(state.ui.variantList);
    if (!state.variants.length) state.ui.variantList.append(element('p', { className: 'muted', text: 'Noch keine Kampagnenabweichung.' }));
    for (const row of state.variants) {
      state.ui.variantList.append(element('article', { className: `lore-card${row.status === 'archived' ? ' archived' : ''}` }, [
        element('h4', { text: row.title }),
        element('div', { className: 'lore-tags' }, [tag(TRUTH_LABELS[row.truth_status] || row.truth_status), tag(`Revision ${row.revision}`), tag(row.status)]),
        element('p', { className: 'lore-preserve', text: row.content }),
        element('p', { className: 'muted', text: `Grundlage: ${row.base_title} · ${row.gm_reason || 'ohne Zusatzbegründung'}` }),
        element('div', { className: 'lore-actions' }, [
          action('Bearbeiten', () => editVariant(state, row)),
          ...(row.status === 'active' ? [action('Freigeben', () => prepareVariantDisclosure(state, row)), action('Archivieren', () => archiveVariant(state, row))] : []),
        ]),
      ]));
    }
  }
  function renderDisclosures(state) {
    clear(state.ui.disclosureList);
    if (!state.disclosures.length) state.ui.disclosureList.append(element('p', { className: 'muted', text: 'Noch kein Wissen freigegeben.' }));
    for (const row of state.disclosures) {
      const character = state.characters.find((entry) => entry.id === row.audience_character_id);
      state.ui.disclosureList.append(element('article', { className: `lore-card${row.status === 'archived' ? ' archived' : ''}` }, [
        element('h4', { text: row.player_title }),
        element('div', { className: 'lore-tags' }, [
          tag(KNOWLEDGE_LABELS[row.knowledge_level] || row.knowledge_level),
          tag(row.audience_character_id ? `Figur: ${character?.public_data?.name || 'Unbenannt'}` : 'Ganze Kampagne'),
          tag(`ab Tag ${row.revealed_at_day}`), tag(row.status),
        ]),
        element('p', { className: 'lore-preserve', text: row.player_text }),
        element('small', { className: 'muted', text: `Quelle: ${sourceTitle(state, row)} · Revision ${row.revision}` }),
        element('div', { className: 'lore-actions' }, [
          action('Bearbeiten', () => editDisclosure(state, row)),
          ...(row.status === 'active' ? [action('Archivieren', () => archiveDisclosure(state, row))] : []),
        ]),
      ]));
    }
  }
  function renderLinks(state) {
    clear(state.ui.linkList);
    if (!state.links.length) state.ui.linkList.append(element('p', { className: 'muted', text: 'Noch keine Weltverknüpfung.' }));
    for (const row of state.links) {
      const assertion = state.assertions.find((entry) => entry.assertion_id === row.assertion_id);
      state.ui.linkList.append(element('article', { className: `lore-card${row.status === 'archived' ? ' archived' : ''}` }, [
        element('strong', { text: assertion?.title || row.assertion_id }),
        element('p', { text: `${row.entity_kind} · ${row.relation_kind} · ${row.notes || 'ohne Hinweis'}` }),
        ...(row.status === 'active' ? [action('Verknüpfung archivieren', () => archiveLink(state, row))] : []),
      ]));
    }
  }
  function renderSuggestions(state) {
    clear(state.ui.suggestionList);
    const pending = state.suggestions.filter((row) => row.status === 'pending');
    if (!pending.length) state.ui.suggestionList.append(element('p', { className: 'muted', text: 'Keine offene Quellenrevision.' }));
    for (const row of state.suggestions) {
      state.ui.suggestionList.append(element('article', { className: 'lore-card' }, [
        element('strong', { text: `${row.prior_title} → ${row.new_title}` }),
        element('p', { text: `${row.affected_kind === 'variant' ? 'Kampagnenabweichung' : 'Freigabe'} · ${row.status}` }),
        ...(row.status === 'pending' ? [element('div', { className: 'lore-actions' }, [
          action('Als geprüft markieren', () => reviewSuggestion(state, row, 'accepted')),
          action('Nicht übernehmen', () => reviewSuggestion(state, row, 'declined')),
        ])] : []),
      ]));
    }
  }
  function renderHistory(state) {
    clear(state.ui.historyList);
    if (!state.events.length) state.ui.historyList.append(element('p', { className: 'muted', text: 'Noch keine Offenlegung protokolliert.' }));
    for (const row of state.events.slice(0, 100)) {
      state.ui.historyList.append(element('article', { className: 'lore-card' }, [
        element('strong', { text: `${row.action} · ${row.player_title}` }),
        element('p', { className: 'lore-preserve', text: row.player_text }),
        element('small', { className: 'muted', text: `${row.audience_kind === 'campaign' ? 'Kampagne' : 'Figur'} · Tag ${row.revealed_at_day} · ${new Date(row.created_at).toLocaleString('de-DE')}` }),
      ]));
    }
  }
  function renderGm(state) {
    renderAssertions(state);
    renderVariants(state);
    renderDisclosures(state);
    renderLinks(state);
    renderSuggestions(state);
    renderHistory(state);
    refreshFormOptions(state);
  }
  async function loadGmLore(state, { force = false } = {}) {
    const ui = ensureGmUi(state);
    const campaignId = campaignSelection(state);
    if (!ui) return;
    if (!campaignId) {
      state.campaignId = null;
      text(ui.status, 'Wähle zuerst eine Kampagne.');
      return;
    }
    if (!force && state.loading) return;
    const serial = ++state.serial;
    state.loading = true;
    state.campaignId = campaignId;
    text(ui.status, 'Globale Aussagen, Abweichungen und Freigaben werden geladen …');
    try {
      const [campaignRows, assertions] = await Promise.all([
        rows(state.repository, 'campaign_management_view', 'campaign_id,world_id,name,current_day', (query) => query.eq('campaign_id', campaignId).limit(1)),
        rows(state.repository, 'lore_assertion_management_view', 'assertion_id,title,content,content_sha256,truth_status,audience,spoiler_level,review_state,source_revision_id,source_id,source_title,locator,valid_from_day,valid_to_day,supersedes_assertion_id,created_at', (query) => query.order('title')),
      ]);
      const campaign = campaignRows[0];
      if (!campaign) throw new Error('Die ausgewählte Kampagne ist nicht mehr verfügbar.');
      const worldId = campaign.world_id;
      const [variants, disclosures, events, suggestions, characters, links] = await Promise.all([
        rows(state.repository, 'campaign_lore_variant_management_view', 'variant_id,world_id,campaign_id,base_assertion_id,base_title,base_content,base_truth_status,base_content_sha256,title,content,content_sha256,truth_status,gm_reason,revision,status,archived_at,updated_at', (query) => query.eq('campaign_id', campaignId).order('updated_at', { ascending: false })),
        rows(state.repository, 'campaign_lore_disclosure_management_view', 'disclosure_id,world_id,campaign_id,source_assertion_id,source_variant_id,source_content_sha256,audience_character_id,knowledge_level,player_title,player_text,player_text_sha256,revealed_at_day,revision,status,archived_at,updated_at', (query) => query.eq('campaign_id', campaignId).order('updated_at', { ascending: false })),
        rows(state.repository, 'campaign_lore_disclosure_event_management_view', 'event_id,world_id,campaign_id,disclosure_id,action,revision,source_kind,source_id,source_content_sha256,audience_kind,audience_character_id,knowledge_level,player_title,player_text,player_text_sha256,revealed_at_day,actor_user_id,created_at', (query) => query.eq('campaign_id', campaignId).order('created_at', { ascending: false }).limit(100)),
        rows(state.repository, 'campaign_lore_update_suggestion_management_view', 'suggestion_id,world_id,campaign_id,prior_assertion_id,new_assertion_id,prior_title,new_title,affected_kind,affected_entity_id,status,review_notes,reviewed_by,reviewed_at,created_at,updated_at', (query) => query.eq('campaign_id', campaignId).order('created_at', { ascending: false })),
        rows(state.repository, 'campaign_characters', 'id,campaign_id,status,public_data,archived_at', (query) => query.eq('campaign_id', campaignId).is('archived_at', null).order('updated_at', { ascending: false })),
        rows(state.repository, 'world_lore_assertion_link_management_view', 'link_id,world_id,assertion_id,entity_kind,entity_id,relation_kind,notes,revision,status,archived_at,updated_at', (query) => query.eq('world_id', worldId).order('updated_at', { ascending: false })),
      ]);
      if (serial !== state.serial || campaignId !== campaignSelection(state)) return;
      Object.assign(state, { campaign, worldId, assertions, variants, disclosures, events, suggestions, characters, links });
      state.ui.disclosureUi.day.value = String(campaign.current_day || 1);
      renderGm(state);
      await loadEntityOptions(state);
      text(ui.status, `${assertions.length} globale Aussagen · ${variants.length} Kampagnenabweichungen · ${disclosures.length} Freigaben`);
      await replaceLiveSubscription(state, campaignId, (change) => {
        if (change.changeKind === 'lore') return loadGmLore(state, { force: true });
      });
    } catch (error) {
      if (serial === state.serial) text(ui.status, friendlyError(error));
    } finally {
      if (serial === state.serial) state.loading = false;
    }
  }
  function resetVariantForm(state) {
    const ui = state.ui.variantUi;
    ui.form.reset();
    ui.form.elements.variant_id.value = '';
    ui.form.elements.expected_revision.value = '';
    ui.base.disabled = false;
    if (state.ui?.variantDetails) state.ui.variantDetails.open = false;
  }
  function prepareVariant(state, assertion) {
    resetVariantForm(state);
    const ui = state.ui.variantUi;
    ui.base.value = assertion.assertion_id;
    ui.title.value = assertion.title;
    ui.content.value = assertion.content;
    ui.truth.value = assertion.truth_status === 'open-core' ? 'gm-truth' : assertion.truth_status;
    ui.reason.value = '';
    state.ui.variantDetails.open = true;
    ui.form.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  function editVariant(state, row) {
    const ui = state.ui.variantUi;
    ui.form.elements.variant_id.value = row.variant_id;
    ui.form.elements.expected_revision.value = row.revision;
    ui.base.value = row.base_assertion_id;
    ui.base.disabled = true;
    ui.title.value = row.title;
    ui.content.value = row.content;
    ui.truth.value = row.truth_status;
    ui.reason.value = row.gm_reason;
    ui.archived.checked = row.status === 'archived';
    state.ui.variantDetails.open = true;
    ui.form.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  async function saveVariant(state, event) {
    event.preventDefault();
    const ui = state.ui.variantUi;
    try {
      await rpc(state.repository, 'save_campaign_lore_variant', {
        p_campaign_id: state.campaignId,
        p_variant_id: ui.form.elements.variant_id.value || null,
        p_expected_revision: ui.form.elements.expected_revision.value ? Number(ui.form.elements.expected_revision.value) : null,
        p_base_assertion_id: ui.base.value,
        p_title: ui.title.value,
        p_content: ui.content.value,
        p_truth_status: ui.truth.value,
        p_gm_reason: ui.reason.value,
        p_archived: ui.archived.checked,
      });
      resetVariantForm(state);
      await loadGmLore(state, { force: true });
      text(state.ui.status, 'Kampagnenabweichung gespeichert; der globale Quellstand blieb unverändert.');
    } catch (error) { text(state.ui.status, friendlyError(error)); }
  }
  async function archiveVariant(state, row) {
    try {
      await rpc(state.repository, 'save_campaign_lore_variant', {
        p_campaign_id: state.campaignId, p_variant_id: row.variant_id, p_expected_revision: row.revision,
        p_base_assertion_id: row.base_assertion_id, p_title: row.title, p_content: row.content,
        p_truth_status: row.truth_status, p_gm_reason: row.gm_reason, p_archived: true,
      });
      await loadGmLore(state, { force: true });
    } catch (error) { text(state.ui.status, friendlyError(error)); }
  }
  function resetDisclosureForm(state) {
    const ui = state.ui.disclosureUi;
    ui.form.reset();
    ui.form.elements.disclosure_id.value = '';
    ui.form.elements.expected_revision.value = '';
    ui.sourceKind.disabled = false;
    ui.source.disabled = false;
    ui.audienceKind.disabled = false;
    ui.character.disabled = true;
    ui.day.value = String(state.campaign?.current_day || 1);
    refreshDisclosureSources(state);
    if (state.ui?.disclosureDetails) state.ui.disclosureDetails.open = false;
  }
  function prepareAssertionDisclosure(state, assertion) {
    resetDisclosureForm(state);
    const ui = state.ui.disclosureUi;
    ui.sourceKind.value = 'assertion'; refreshDisclosureSources(state); ui.source.value = assertion.assertion_id;
    ui.title.value = assertion.title;
    ui.content.value = assertion.review_state === 'approved' && assertion.audience?.includes('players') ? assertion.content : '';
    state.ui.disclosureDetails.open = true;
    ui.form.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  function prepareVariantDisclosure(state, variant) {
    resetDisclosureForm(state);
    const ui = state.ui.disclosureUi;
    ui.sourceKind.value = 'variant'; refreshDisclosureSources(state); ui.source.value = variant.variant_id;
    ui.title.value = variant.title; ui.content.value = '';
    state.ui.disclosureDetails.open = true;
    ui.form.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  function editDisclosure(state, row) {
    const ui = state.ui.disclosureUi;
    ui.form.elements.disclosure_id.value = row.disclosure_id;
    ui.form.elements.expected_revision.value = row.revision;
    ui.sourceKind.value = row.source_variant_id ? 'variant' : 'assertion';
    refreshDisclosureSources(state);
    ui.source.value = row.source_variant_id || row.source_assertion_id;
    ui.audienceKind.value = row.audience_character_id ? 'character' : 'campaign';
    ui.character.disabled = !row.audience_character_id;
    ui.character.value = row.audience_character_id || '';
    ui.knowledge.value = row.knowledge_level;
    ui.title.value = row.player_title;
    ui.content.value = row.player_text;
    ui.day.value = row.revealed_at_day;
    ui.archived.checked = row.status === 'archived';
    ui.sourceKind.disabled = true; ui.source.disabled = true; ui.audienceKind.disabled = true; ui.character.disabled = true;
    state.ui.disclosureDetails.open = true;
    ui.form.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  async function saveDisclosure(state, event) {
    event.preventDefault();
    const ui = state.ui.disclosureUi;
    const variantSource = ui.sourceKind.value === 'variant';
    try {
      await rpc(state.repository, 'save_campaign_lore_disclosure', {
        p_campaign_id: state.campaignId,
        p_disclosure_id: ui.form.elements.disclosure_id.value || null,
        p_expected_revision: ui.form.elements.expected_revision.value ? Number(ui.form.elements.expected_revision.value) : null,
        p_source_assertion_id: variantSource ? null : ui.source.value,
        p_source_variant_id: variantSource ? ui.source.value : null,
        p_audience_character_id: ui.audienceKind.value === 'character' ? ui.character.value || null : null,
        p_knowledge_level: ui.knowledge.value,
        p_player_title: ui.title.value,
        p_player_text: ui.content.value,
        p_revealed_at_day: Number(ui.day.value),
        p_archived: ui.archived.checked,
      });
      resetDisclosureForm(state);
      await loadGmLore(state, { force: true });
      text(state.ui.status, 'Spielerwissen gespeichert und mit sichtbarem Text im Offenlegungsprotokoll festgehalten.');
    } catch (error) { text(state.ui.status, friendlyError(error)); }
  }
  async function archiveDisclosure(state, row) {
    try {
      await rpc(state.repository, 'save_campaign_lore_disclosure', {
        p_campaign_id: state.campaignId, p_disclosure_id: row.disclosure_id, p_expected_revision: row.revision,
        p_source_assertion_id: row.source_assertion_id, p_source_variant_id: row.source_variant_id,
        p_audience_character_id: row.audience_character_id, p_knowledge_level: row.knowledge_level,
        p_player_title: row.player_title, p_player_text: row.player_text,
        p_revealed_at_day: row.revealed_at_day, p_archived: true,
      });
      await loadGmLore(state, { force: true });
    } catch (error) { text(state.ui.status, friendlyError(error)); }
  }
  function prepareLink(state, assertion) {
    state.ui.linkUi.assertion.value = assertion.assertion_id;
    state.ui.linkDetails.open = true;
    state.ui.linkUi.form.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  async function loadEntityOptions(state) {
    const ui = state.ui?.linkUi;
    if (!ui || !state.worldId) return;
    const kind = ui.kind.value;
    const definitions = {
      place: ['world_place_management_view', 'place_id,name', 'place_id', 'name', (query) => query.eq('world_id', state.worldId).order('name')],
      faction: ['world_faction_management_view', 'faction_id,name', 'faction_id', 'name', (query) => query.eq('world_id', state.worldId).order('name')],
      creature: ['creature_management_view', 'creature_id,name', 'creature_id', 'name', (query) => query.eq('world_id', state.worldId).order('name')],
      'world-event': ['world_event_management_view', 'event_id,title', 'event_id', 'title', (query) => query.eq('world_id', state.worldId).order('occurred_day')],
      'world-route': ['world_route_management_view', 'route_id,name', 'route_id', 'name', (query) => query.eq('world_id', state.worldId).order('name')],
      'astronomical-event': ['campaign_astronomy_management_view', 'event_id,internal_title', 'event_id', 'internal_title', (query) => query.eq('campaign_id', state.campaignId).order('observation_start_day')],
      'media-asset': ['world_media_management_view', 'asset_id,internal_title', 'asset_id', 'internal_title', (query) => query.eq('world_id', state.worldId).order('internal_title')],
    };
    if (kind === 'world') {
      setOptions(ui.entity, [[state.worldId, state.campaign?.name ? `Welt von ${state.campaign.name}` : 'Aktuelle Welt']]);
      return;
    }
    const definition = definitions[kind];
    if (!definition) return;
    try {
      const result = await rows(state.repository, definition[0], definition[1], definition[4]);
      const unique = new Map(result.map((row) => [row[definition[2]], row[definition[3]] || row[definition[2]]]));
      setOptions(ui.entity, [...unique].map(([id, label]) => [id, label]));
    } catch (error) {
      setOptions(ui.entity, [['', `Nicht verfügbar: ${friendlyError(error)}`]]);
    }
  }
  async function saveLink(state, event) {
    event.preventDefault();
    const ui = state.ui.linkUi;
    try {
      await rpc(state.repository, 'save_world_lore_assertion_link', {
        p_world_id: state.worldId, p_link_id: null, p_expected_revision: null,
        p_assertion_id: ui.assertion.value, p_entity_kind: ui.kind.value,
        p_entity_id: ui.entity.value, p_relation_kind: ui.relation.value,
        p_notes: ui.notes.value, p_archived: false,
      });
      ui.notes.value = '';
      state.ui.linkDetails.open = false;
      await loadGmLore(state, { force: true });
      text(state.ui.status, 'Die globale Aussage ist jetzt über eine stabile ID mit dem Weltobjekt verknüpft.');
    } catch (error) { text(state.ui.status, friendlyError(error)); }
  }
  async function archiveLink(state, row) {
    try {
      await rpc(state.repository, 'save_world_lore_assertion_link', {
        p_world_id: state.worldId, p_link_id: row.link_id, p_expected_revision: row.revision,
        p_assertion_id: row.assertion_id, p_entity_kind: row.entity_kind, p_entity_id: row.entity_id,
        p_relation_kind: row.relation_kind, p_notes: row.notes, p_archived: true,
      });
      await loadGmLore(state, { force: true });
    } catch (error) { text(state.ui.status, friendlyError(error)); }
  }
  async function reviewSuggestion(state, row, status) {
    try {
      await rpc(state.repository, 'review_campaign_lore_update_suggestion', {
        p_campaign_id: state.campaignId, p_suggestion_id: row.suggestion_id,
        p_status: status, p_review_notes: status === 'accepted'
          ? 'Quellenrevision geprüft; eine eventuelle Übernahme erfolgt bewusst und separat.'
          : 'Quellenrevision geprüft; Kampagnenstand bleibt bewusst erhalten.',
      });
      await loadGmLore(state, { force: true });
    } catch (error) { text(state.ui.status, friendlyError(error)); }
  }
  async function attachGameMaster({ root, services } = {}) {
    if (!root) throw new TypeError('Der Spielleitungsbereich fehlt.');
    let state = gmStates.get(root);
    if (!state) {
      const connected = createServices(services);
      state = {
        root, ...connected, serial: 0, loading: false, campaignId: null, worldId: null,
        campaign: null, assertions: [], variants: [], disclosures: [], events: [], suggestions: [], characters: [], links: [],
        liveCampaignId: null, liveUnsubscribe: null,
      };
      gmStates.set(root, state);
      ensureGmUi(state);
      const campaignSelect = root.querySelector('[data-gm-campaign-select]');
      campaignSelect?.addEventListener('change', () => setTimeout(() => {
        state.serial++;
        state.campaignId = campaignSelection(state);
        if (state.ui?.tab.classList.contains('active')) loadGmLore(state, { force: true }).catch(() => {});
      }, 0));
      state.authListener = (event) => {
        if (event.detail?.user) return;
        state.serial++;
        state.campaignId = null;
        state.assertions = []; state.variants = []; state.disclosures = []; state.events = []; state.suggestions = []; state.links = [];
        state.liveUnsubscribe?.(); state.liveUnsubscribe = null;
        if (state.ui) { text(state.ui.status, 'Melde dich als Spielleitung an.'); renderGm(state); }
      };
      global.addEventListener('eberos:campaign-auth-change', state.authListener);
    }
    if (state.ui?.tab.classList.contains('active')) await loadGmLore(state, { force: true });
    return { campaignId: campaignSelection(state), attached: true };
  }

  global.EberosLoreKnowledgeV1820 = Object.freeze({
    version: VERSION,
    revision: REVISION,
    truthLabels: TRUTH_LABELS,
    playerColumns: Object.freeze(PLAYER_COLUMNS.split(',')),
    attachPlayer,
    attachGameMaster,
    safePlayerExport,
  });
})(globalThis);
