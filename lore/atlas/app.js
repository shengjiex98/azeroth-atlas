(function () {
  'use strict';

  const W = WORLD;
  const G = GEO;
  const { decodeSummary, buildJourney } = ROSETTA_JOURNEY;
  const language = LORE_LANGUAGE;
  const $ = id => document.getElementById(id);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[c]);
  const t = value => language.text(value);
  const u = (key, vars) => language.ui(key, vars);
  const ui = (key, vars) => esc(u(key, vars));
  const E = value => esc(t(value));
  const asset = path => '../' + path;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  const continents = { ek: '1415', kalimdor: '1414' };
  const continentSlug = { 1415: 'ek', 1414: 'kalimdor' };
  const cityFactions = { 1453: 'alliance', 1454: 'horde', 1455: 'alliance', 1456: 'horde', 1457: 'alliance', 1458: 'horde' };
  const continentName = id => u(id === '1414' ? 'kalimdor' : 'eastern');
  function zoneName(id) {
    const lore = W.zones[id]?.name;
    const names = LORE_ZONE_NAMES[id];
    return (language.current === 'zh' && (lore?.zh || names?.zh)) ||
      lore?.en || names?.en || u('mapNumber', { id });
  }
  // The alternate continent-wide frames in GEO have no zone of their own.
  const zoneIds = Object.keys(G.zones).filter(id => id !== '1463' && id !== '1464');
  const continentZones = id => zoneIds.filter(zone => G.zones[zone].continent === id);
  const zonePath = (id, story = '') => '/zone/' + id + (story ? '/story/' + story : '');
  const homePath = id => '/' + continentSlug[id];
  const basePath = base => base.zone ? zonePath(base.zone, base.story) : homePath(base.continent);
  const anchor = (href, label, cls = '') => `<a class="${cls}" href="${esc(href)}">${label}</a>`;
  const zoneLink = (id, cls = '') => anchor('#' + zonePath(id), esc(zoneName(id)), cls);
  const summaryKeyPrefix = 'atlas-journey:';
  const selectionKey = 'atlas-journey-selected';
  const summaries = new Map();
  let J = null, selectedCharacter = null, journeyRevision = 0;
  let importError = null, storageError = false;
  let zonesVisited = new Map(), routeVisits = [], firstVisits = [];
  let questTotals = new Map(), mostQuests = 1;
  const journeyTotals = id => (zonesVisited.get(id)?.places || []).reduce((sum, place) => {
    for (const [kind, value] of Object.entries(place.kinds || {})) sum[kind] = (sum[kind] || 0) + value;
    return sum;
  }, {});
  const badgeStyles = ['current', 'ink', 'seal', 'medallion'];
  const experiments = {
    journey: {
      param: 'journey', values: ['shade', 'count', 'order'], default: 'shade',
      get available() { return Boolean(J); },
      onSelect: () => { state.journey = true; }
    },
    crest: { param: 'crest', values: badgeStyles, default: 'medallion' },
    numbers: { param: 'numbers', values: badgeStyles, default: 'ink', get available() { return Boolean(J); } }
  };
  function requestedExperimentValue({ param, values }) {
    const value = new URLSearchParams(location.search).get(param);
    return values.includes(value) ? value : null;
  }
  const experimentValue = experiment => requestedExperimentValue(experiment) ?? experiment.default;
  const phone = matchMedia('(width < 700px)');
  const state = {
    journey: false,
    fullSequence: false, paths: new Set(), snap: 'peek', place: null, card: null
  };
  const panels = { sagas: 'sagas', glossary: 'glossary', sources: 'sources' };

  const characterKey = ([{ name, realm }]) => (name ?? '') + '-' + (realm ?? '');

  function selectJourney(id) {
    const summary = summaries.get(id);
    selectedCharacter = summary ? id : null;
    J = summary ? buildJourney(summary.records) : null;
    zonesVisited = new Map((J?.zones || []).map((entry, index) => [
      String(entry.zone), { ...entry, order: index + 1 }
    ]));
    routeVisits = (J?.route || []).map(String);
    firstVisits = [...new Set(routeVisits)];
    questTotals = new Map([...zonesVisited.keys()].map(zone => [zone, journeyTotals(zone).quests || 0]));
    mostQuests = Math.max(1, ...questTotals.values());
    state.journey = Boolean(J);
    state.fullSequence = false;
    state.paths.clear();
    journeyRevision++;
  }

  function restoreJourneys() {
    let selected;
    try {
      selected = localStorage.getItem(selectionKey);
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key?.startsWith(summaryKeyPrefix)) continue;
        const id = key.slice(summaryKeyPrefix.length);
        const transport = localStorage.getItem(key);
        try {
          const records = decodeSummary(transport);
          if (characterKey(records) === id) summaries.set(id, { transport, records });
        } catch (_) { /* Skip an unreadable summary. */ }
      }
    } catch (_) { /* Some browsers disable storage, including for some file origins. */ }
    selectJourney(summaries.has(selected) ? selected : summaries.keys().next().value);
  }

  function saveJourneys(changedId) {
    try {
      if (changedId !== undefined) {
        const key = summaryKeyPrefix + changedId;
        const summary = summaries.get(changedId);
        if (summary) localStorage.setItem(key, summary.transport);
        else localStorage.removeItem(key);
      }
      if (selectedCharacter === null) localStorage.removeItem(selectionKey);
      else localStorage.setItem(selectionKey, selectedCharacter);
    } catch (_) {
      storageError = true;
    }
  }

  function importJourney(transport) {
    let records;
    try {
      records = decodeSummary(transport);
    } catch (error) {
      importError = error.code;
      return false;
    }
    const id = characterKey(records);
    summaries.set(id, { transport: transport.trim(), records });
    selectJourney(id);
    saveJourneys(id);
    importError = null;
    return true;
  }

  function hashParts(hash) {
    const fragment = hash.slice(1);
    const separator = fragment.indexOf('?');
    return separator < 0 ? [fragment, ''] : [fragment.slice(0, separator), fragment.slice(separator + 1)];
  }

  function consumeJourneyFragment() {
    const hash = location.hash;
    const [path, query] = hash.startsWith('#/') ? hashParts(hash) : ['', hash.slice(1)];
    const params = new URLSearchParams(query);
    if (!params.has('j')) return hash;
    importJourney(params.get('j'));
    params.delete('j');
    const rest = params.toString();
    const clean = path || rest ? '#' + (path || '/ek') + (rest ? '?' + rest : '') : '';
    const url = new URL(location.href);
    url.hash = clean;
    try {
      history.replaceState(history.state, '', url.href);
    } catch (_) { /* The atlas can still use the imported journey if history is restricted. */ }
    return clean;
  }

  function parseBase(path) {
    if (Object.hasOwn(continents, path.slice(1)) && path.startsWith('/')) {
      return { continent: continents[path.slice(1)] };
    }
    const match = /^\/zone\/(\d+)(?:\/story\/([\w-]+))?$/.exec(path);
    if (!match) return null;
    const [, zone, story] = match;
    const geo = G.zones[zone];
    if (!geo) return null;
    if (zone === '1463' || zone === '1464') return story ? null : { continent: geo.continent };
    if (story && !W.zones[zone]?.storylines.some(entry => entry.id === story)) return null;
    return { continent: geo.continent, zone, story };
  }

  function parseRoute(hash) {
    const [path, query] = hashParts(hash);
    const params = new URLSearchParams(query);
    const saga = /^\/saga\/([\w-]+)$/.exec(path)?.[1];
    const panel = params.get('panel');
    const fallback = { continent: continents.ek };
    if (saga && Object.hasOwn(W.sagas, saga)) {
      return { base: parseBase(params.get('at') || '') || fallback, saga };
    }
    const base = parseBase(path || '/ek');
    return { base: base || fallback, missing: !base, panel: Object.hasOwn(panels, panel) ? panel : null };
  }

  function routeHref({ base, saga, panel }) {
    const path = basePath(base);
    const params = new URLSearchParams();
    if (saga && path !== '/ek') params.set('at', path);
    if (!saga && panel) params.set('panel', panel);
    const query = params.toString();
    return '#' + (saga ? '/saga/' + saga : path) + (query ? '?' + query : '');
  }

  let route;
  const panelHref = panel => routeHref({ base: route.base, panel });
  const sagaLink = (id, cls = '') => anchor(routeHref({ base: route.base, saga: id }), E(W.sagas[id].name), cls);

  function experimentMenu() {
    const groups = Object.entries(experiments).filter(([, experiment]) => experiment.available !== false);
    if (!groups.length) return '';
    return `<section class="menu-experiments" aria-labelledby="experiments-title">
      <h2 id="experiments-title">${ui('experiments')}</h2>
      ${groups.map(([id, experiment]) => {
        const current = experimentValue(experiment);
        const url = new URL(location.href);
        return `<fieldset class="experiment-group"><legend>${ui('experiment_' + id)}</legend>
          <div class="experiment-options">${experiment.values.map(value => {
            url.searchParams.set(experiment.param, value);
            return `<a href="${esc(url.href)}" data-experiment="${id}"
              ${value === current ? 'aria-current="true"' : ''}>${ui('experiment_' + id + '_' + value)}</a>`;
          }).join('')}</div></fieldset>`;
      }).join('')}
    </section>`;
  }

  function renderHeader() {
    const { continent } = route.base;
    const currentPanel = route.saga ? 'sagas' : route.panel;
    const oldMenu = $('atlas-menu');
    const openMenu = oldMenu?.open;
    $('site-header').innerHTML = `
      <a class="brand" href="#/ek"><span class="brand-compass" aria-hidden="true">✧</span>${ui('brand')}</a>
      <div class="map-switches">
        <label class="continent-select"><span class="sr-only">${ui('continent')}</span>
          <select id="continent-select">${Object.entries(continents).map(([slug, id]) =>
            `<option value="${slug}" ${id === continent ? 'selected' : ''}>${esc(continentName(id))}</option>`).join('')}
          </select>
        </label>
        <button id="journey-toggle" class="journey-toggle" type="button"
          ${J ? `aria-pressed="${state.journey}"` : 'aria-controls="journey-summary"'}>
          <span class="layer-icon" aria-hidden="true"></span>${ui('journey')}
        </button>
      </div>
      <div class="header-tools">
        <div class="language-slot" role="group" aria-label="${ui('language')}">
          <button data-lang="en" aria-pressed="${language.current === 'en'}">EN</button>
          <button data-lang="zh" aria-pressed="${language.current === 'zh'}">中文</button>
        </div>
        <details id="atlas-menu" class="atlas-menu" ${openMenu ? 'open' : ''}>
          <summary aria-label="${ui('menu')}" title="${ui('menu')}"><span class="menu-icon" aria-hidden="true"></span></summary>
          <div class="menu-items">
            ${Object.entries(panels).map(([id, label]) =>
              `<a href="${panelHref(id)}" ${currentPanel === id ? 'aria-current="page"' : ''}>${ui(label)}</a>`).join('')}
            ${experimentMenu()}
          </div>
        </details>
      </div>`;
  }

  const imageSources = {
    titans: 'Pantheon.jpg', 'khaz-modan': 'Khaz_Modan_continent.jpg', gnomeregan: 'Gnomeregan_TCG.jpg',
    troggs: 'Rockjaw_Trogg.jpg', frostmane: 'Frostmane_Seer.jpg', wendigo: 'Young_Wendigo.jpg',
    mountaineers: 'Mountaineer_Kadrell.jpg', bronzebeard: 'Banner_of_Ironforge.png', magni: 'King_Magni_Bronzebeard.jpg',
    wildhammer: 'Falstad_HotS_Art_2.jpg', 'dark-iron': 'Axe_Flinger_HS.jpg', thanes: 'Muradin_Glenn_Rane.jpg',
    'argent-dawn': 'Argent_Dawn_banner.jpg', 'explorers-league': 'Brann_Bronzebeard_in_Dornogal.jpg',
    stormpike: 'Dun_Baldar.jpg', scourge: 'Ghoul_HS_KotFT.jpg', forsaken: 'Mistress_of_Mixtures_HS.jpg',
    'defias-brotherhood': 'Edwin_VanCleef_TCG3.jpg', highborne: 'Highborne_Sorcerer_HS.jpg',
    elune: 'Val%27sharah_cinematic_eclipse.jpg', sentinels: 'Astranaar_Sentinel.jpg',
    'twilights-hammer': 'Cho%27gall_HS.jpg', dragonmaw: 'Dragonmaw_Grunt.jpg'
  };
  const glossary = Object.values(W.glossary);
  const normalizeTerm = name => name.replace(/’/g, "'");
  const glossaryByName = new Map(glossary.flatMap(entry =>
    [entry.name.en, entry.name.zh].filter(Boolean).map(name => [normalizeTerm(name), entry])));

  function rich(value) {
    return t(value).split(/\{([^{}]+)\}/g).map((part, index) => {
      const entry = index % 2 && glossaryByName.get(normalizeTerm(part));
      return entry ? `<button class="gloss-term" data-gloss="${entry.id}">${E(entry.name)}</button>` : esc(part);
    }).join('');
  }

  function sourceList(ids) {
    return `<ul class="source-list">${ids.map(id => {
      const source = W.sources[id];
      return `<li><a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${E(source.title)}</a><span>${E(source.note)}</span></li>`;
    }).join('')}</ul>`;
  }

  function historyList(history) {
    return `<ol class="history">${history.map(era => `<li><span class="eyebrow">${E(era.era)}</span>
      <h3>${E(era.title)}</h3><p>${rich(era.text)}</p></li>`).join('')}</ol>`;
  }

  function figureButton(id, card = false) {
    const figure = W.figures[id];
    return card ? `<button class="figure-card" data-figure="${id}"><strong>${E(figure.name)}</strong><span>${E(figure.role)}</span></button>` :
      `<button class="text-button" data-figure="${id}">${E(figure.name)}</button>`;
  }

  function people(ids) {
    return `<div class="figure-grid">${ids.map(id => figureButton(id, true)).join('')}</div>`;
  }

  function beatCard(id) {
    const beat = W.beats[id];
    return `<article class="beat"><h3>${E(beat.title)}</h3>
      ${beat.edition ? `<span class="eyebrow edition">${E(beat.edition)}</span>` : ''}
      <p>${rich(beat.text)}</p>
      ${beat.interpretation ? `<aside class="interpretation"><strong>${ui('interpretation')}</strong><p>${E(beat.interpretation)}</p></aside>` : ''}
      ${beat.figureIds?.length ? `<div class="people-links">${beat.figureIds.map(id => figureButton(id)).join('')}</div>` : ''}
      ${beat.questIds.length ? `<details class="quest-telling"><summary>${ui('telling')} <span>(${beat.questIds.length})</span></summary>
        <div class="quest-chips">${beat.questIds.map(id => `<span>${ui('quest', { id })}</span>`).join('')}</div></details>` : ''}
    </article>`;
  }

  function entryHeading(title, region = '', summary = '') {
    return `<header class="entry-heading">${region ? `<span class="eyebrow">${region}</span>` : ''}
      <h1 id="reading-title" tabindex="-1">${title}</h1>${summary ? `<p class="lead">${summary}</p>` : ''}</header>`;
  }

  function visitBadge(id) {
    const order = state.journey ? zonesVisited.get(id)?.order : null;
    return order ? `<span class="visit-badge" aria-label="${ui('visitBadge', { n: order })}" title="${ui('visitBadge', { n: order })}">${order}</span>` : '';
  }

  function journeyCard(content = '', badge = '') {
    const form = `<form id="journey-import-form" class="journey-import-form">
      <p id="journey-how-to">${ui('journeyHowTo')}</p>
      <label class="sr-only" for="journey-summary">${ui('journeySummary')}</label>
      <textarea id="journey-summary" rows="3" spellcheck="false" autocapitalize="off" autocomplete="off"
        aria-describedby="journey-how-to journey-error"></textarea>
      <p id="journey-error" class="journey-feedback" role="alert"></p>
      <button type="submit">${ui('journeyLoad')}</button>
    </form>`;
    const characterLabel = id => id === '-' ? ui('journeyUnknownCharacter') : esc(id);
    const character = summaries.size > 1 ? `<label><span class="sr-only">${ui('journeyCharacter')}</span>
      <select id="journey-character">${[...summaries.keys()].map(id =>
        `<option value="${esc(id)}" ${id === selectedCharacter ? 'selected' : ''}>${characterLabel(id)}</option>`).join('')}
      </select></label>` : J ? `<span>${characterLabel(selectedCharacter)}</span>` : '';
    return `<section class="journey-card" aria-labelledby="journey-title">
      <div class="journey-heading"><h2 id="journey-title" tabindex="-1">${ui(J ? 'journey' : 'loadJourney')}</h2>${badge}</div>
      ${J ? `<div class="journey-characters">${character}<button id="journey-remove" type="button">${ui('journeyRemove')}</button></div>
        ${content}<details id="journey-import">
          <summary>${ui('loadAnotherJourney')}</summary>${form}
        </details>` : form}
      ${storageError ? `<p class="journey-feedback" role="status">${ui('journeyStorageError')}</p>` : ''}
    </section>`;
  }

  function renderJourneyError() {
    const input = $('journey-summary');
    if (!input) return;
    $('journey-error').textContent = importError ? u(importError) : '';
    if (importError) input.setAttribute('aria-invalid', 'true');
    else input.removeAttribute('aria-invalid');
  }

  function focusJourneyImport() {
    if (phone.matches && state.snap !== 'full') setSnap('full');
    if (J) $('journey-import').open = true;
    $('journey-summary').focus();
  }

  function refreshJourney(focusId) {
    closePlace();
    renderHeader();
    renderReading({ keepScroll: true });
    renderMap();
    ($(focusId) || $('journey-title')).focus({ preventScroll: true });
  }

  function continentPage(id, journeyStyle) {
    const zones = continentZones(id).sort((a, b) => zoneName(a).localeCompare(zoneName(b)));
    function directory(withLore) {
      return `<ul class="zone-directory ${withLore ? '' : 'other-zones'}">${zones.filter(zone => Boolean(W.zones[zone]) === withLore).map(zone =>
        `<li><a href="#${zonePath(zone)}" data-zone-link="${zone}"><span>${esc(zoneName(zone))}</span>${visitBadge(zone)}</a>
          ${W.zones[zone]?.complete ? `<small>${ui('fullEntry')}</small>` : ''}</li>`).join('')}</ul>`;
    }
    const content = state.journey && zones.some(zone => zonesVisited.has(zone)) ?
      `<p class="journey-legend">${ui('journeyLegend_' + journeyStyle)}</p>
        ${journeyStyle === 'order' ? `<div class="sequence-switch" role="group" aria-label="${ui('visitOrder')}">
          <button data-sequence="first" aria-pressed="${!state.fullSequence}">${ui('firstVisits')}</button>
          <button data-sequence="full" aria-pressed="${state.fullSequence}">${ui('fullSequence')}</button>
        </div>` : ''}` : '';
    return `${entryHeading(esc(continentName(id)), ui('atlas'), ui('atlasIntro'))}
      ${journeyCard(content)}
      <section><h2>${ui('zoneStories')}</h2>${directory(true)}</section>
      <section><h2>${ui('otherZones')}</h2>${directory(false)}</section>`;
  }

  function zoneJourney(id) {
    const entry = state.journey && zonesVisited.get(id);
    const visits = entry?.visits || [];
    const content = visits.length ? `<div class="visit-header"><span>${ui('visitOrder')}</span>
        ${visits.length > 1 ? `<label class="path-toggle"><input id="show-path" type="checkbox" ${state.paths.has(id) ? 'checked' : ''}>${ui('showPath')}</label>` : ''}
        </div><p class="visit-order" tabindex="0">${visits.map(n => `<span>${n}</span>`).join('<span aria-hidden="true"> → </span>')}</p>` : '';
    return journeyCard(content, visitBadge(id));
  }

  const hasPoint = place => Number.isFinite(place.x) && Number.isFinite(place.y);

  function zonePage(id) {
    const zone = W.zones[id];
    const geo = G.zones[id];
    const name = esc(zoneName(id));
    const noMap = geo.image ? '' : `<p class="notice">${ui('noZoneMap')}</p>`;
    const journey = zoneJourney(id);
    if (!zone) {
      return entryHeading(name, esc(continentName(geo.continent)), ui('loreUnavailable')) + noMap + journey;
    }
    const levels = zone.levels.en.includes('city') ? E(zone.levels) : ui('levelRange', { levels: t(zone.levels) });
    return `${entryHeading(name, E(zone.region), E(zone.summary))}
      <p class="entry-meta">${levels}<span aria-hidden="true"> · </span>${ui(zone.complete ? 'fullEntry' : 'briefEntry')}</p>
      ${noMap}${journey}
      ${zone.storylines.length ? `<details class="story-index"><summary>${ui('storylines')}</summary>
        <ul>${zone.storylines.map(story => `<li>${anchor('#' + zonePath(id, story.id), E(story.title))}</li>`).join('')}</ul></details>` : ''}
      ${!zone.complete ? `<p class="notice">${ui('stubNote')}</p>` : ''}
      ${zone.overview?.length ? `<section><h2>${ui('why')}</h2>${zone.overview.map(text => `<p>${rich(text)}</p>`).join('')}</section>` : ''}
      ${zone.places.length ? `<section><h2>${ui('places')}</h2><ul class="place-list">${zone.places.map(place => `<li>
        ${hasPoint(place) ? `<button class="text-button" data-pin="lore:${place.id}">${E(place.name)}</button>` : `<strong>${E(place.name)}</strong>`}
        <p>${rich(place.text)}</p></li>`).join('')}</ul></section>` : ''}
      ${zone.history.length ? `<section><h2>${ui('history')}</h2>${historyList(zone.history)}</section>` : ''}
      ${zone.storylines.length ? `<section><h2>${ui('stories')}</h2>${zone.storylines.map(story =>
        `<section class="storyline" id="story-${story.id}" tabindex="-1">
          <h3>${anchor('#' + zonePath(id, story.id), E(story.title))}</h3>
          ${story.beatIds.map(beatCard).join('')}</section>`).join('')}</section>` : ''}
      ${zone.figureIds.length ? `<section><h2>${ui('figures')}</h2>${people(zone.figureIds)}</section>` : ''}
      ${zone.factionIds.length ? `<section><h2>${ui('factions')}</h2>${zone.factionIds.map(id => {
        const faction = W.factions[id];
        return `<div class="faction">${faction.glossaryId ?
          `<button class="text-button" data-gloss="${faction.glossaryId}">${E(faction.name)}</button>` :
          `<h3>${E(faction.name)}</h3>`}<p>${rich(faction.text)}</p></div>`;
      }).join('')}</section>` : ''}
      ${zone.relatedZoneIds.length || zone.sagaIds.length ? `<section><h2>${ui('connections')}</h2>
        <div class="connection-links">${zone.relatedZoneIds.map(id => zoneLink(id, 'button')).join('')}
        ${zone.sagaIds.map(id => sagaLink(id, 'button')).join('')}</div></section>` : ''}
      ${zone.sourceIds.length ? `<details class="entry-sources"><summary>${ui('sourcesForEntry')}</summary>${sourceList(zone.sourceIds)}</details>` : ''}`;
  }

  function sagaPage(id) {
    const saga = W.sagas[id];
    return `${entryHeading(E(saga.name), '', E(saga.summary))}
      ${saga.introduction ? `<p class="opening">${rich(saga.introduction)}</p>` : ''}
      ${!saga.complete ? `<p class="notice">${ui('sagaStub')}</p>` : ''}
      ${saga.history ? `<section><h2>${ui('history')}</h2>${historyList(saga.history)}</section>` : ''}
      <section><h2>${ui('readStory')}</h2>${saga.beatIds.map(beatCard).join('')}</section>
      ${saga.conclusion ? `<section><h2>${ui('conclusion')}</h2><p>${rich(saga.conclusion)}</p></section>` : ''}
      <section><h2>${ui('figures')}</h2>${people(saga.figureIds)}</section>
      <section><h2>${ui('relatedZones')}</h2><div class="connection-links">${saga.zoneIds.map(id => zoneLink(id, 'button')).join('')}</div></section>
      ${saga.relatedSagaIds.length ? `<section><h2>${ui('alsoRead')}</h2>
        <div class="connection-links">${saga.relatedSagaIds.map(id => sagaLink(id, 'button')).join('')}</div></section>` : ''}
      <details class="entry-sources"><summary>${ui('sourcesForEntry')}</summary>${sourceList(saga.sourceIds)}</details>`;
  }

  function sagasPage() {
    return `${entryHeading(ui('sagas'))}<div class="saga-cards">${Object.values(W.sagas).map(saga =>
      `<article><h2>${sagaLink(saga.id)}</h2><p>${E(saga.summary)}</p>
        <small>${ui(saga.complete ? 'fullEntry' : 'briefEntry')}</small></article>`).join('')}</div>`;
  }

  function glossaryPage() {
    return `${entryHeading(ui('glossary'))}<div class="glossary-grid">${glossary.map(entry =>
      `<button class="glossary-card" data-gloss="${entry.id}">
        ${entry.image ? `<img src="${asset(entry.image)}" alt="" loading="lazy">` : '<span class="gloss-placeholder" aria-hidden="true">✧</span>'}
        <span><strong>${E(entry.name)}</strong><small>${E(entry.text)}</small></span>
      </button>`).join('')}</div>`;
  }

  function sourcesPage() {
    const groups = ['Scope', ...(J ? ['Journey'] : []), 'Assets', 'Languages'];
    return `${entryHeading(ui('sourceTitle'))}
      ${groups.map(key => `<section><h2>${ui('source' + key)}</h2><p>${ui('source' + key + 'Text')}</p>
        ${key === 'Journey' && J.sources?.includes('guide-route-legacy') ? `<p>${ui('sourceLegacy')}</p>` : ''}</section>`).join('')}
      <section><h2>${ui('primarySources')}</h2>${sourceList(Object.keys(W.sources))}</section>
      <section><h2>${ui('imageCredits')}</h2><ul class="credit-images">
        ${Object.entries(imageSources).map(([id, file]) => `<li>
          <a href="https://warcraft.wiki.gg/wiki/File:${file}" target="_blank" rel="noopener noreferrer">${E(W.glossary[id].name)}</a></li>`).join('')}
      </ul></section>`;
  }

  function paneTitle() {
    if (route.saga) return t(W.sagas[route.saga].name);
    if (route.panel) return u(panels[route.panel]);
    if (route.missing) return u('missing');
    return route.base.zone ? zoneName(route.base.zone) : continentName(route.base.continent);
  }

  let readingKey;
  function renderReading({ keepScroll = false, focus = false } = {}) {
    const { base, saga, panel, missing } = route;
    const journeyStyle = experimentValue(experiments.journey);
    const key = [basePath(base), saga, panel, missing, language.current, state.journey, state.fullSequence,
      journeyStyle, journeyRevision, importError].join('|');
    const scroller = $('reading-scroll');
    $('reading').classList.toggle('is-overlay', Boolean(saga || panel));
    if (key !== readingKey) {
      const previousScroll = scroller.scrollTop;
      const draft = $('journey-summary')?.value || '';
      const importOpen = $('journey-import')?.open;
      const pages = { sagas: sagasPage, glossary: glossaryPage, sources: sourcesPage };
      const panelBar = saga || panel ? `<div class="panel-bar">
        ${saga ? anchor(panelHref('sagas'), ui('sagas')) : ''}
        <a class="icon-button panel-close" href="${panelHref(null)}" aria-label="${ui('close')}" title="${ui('close')}">×</a></div>` : '';
      scroller.innerHTML = panelBar + (saga ? sagaPage(saga) : panel ? pages[panel]() :
        missing ? entryHeading(ui('missing')) + anchor('#/ek', ui('goHome'), 'button') :
        base.zone ? zonePage(base.zone) : continentPage(base.continent, journeyStyle));
      if (saga || panel || missing) scroller.querySelector('.entry-heading').insertAdjacentHTML('afterend', journeyCard());
      $('journey-summary').value = draft;
      if (J) $('journey-import').open = Boolean(importOpen || importError);
      renderJourneyError();
      readingKey = key;
      if (keepScroll) scroller.scrollTop = previousScroll;
      else scroller.scrollTop = 0;
      const story = !saga && !panel && base.story && $('story-' + base.story);
      if (story && !keepScroll) scroller.scrollTop = story.offsetTop - 8;
      if (focus) (story || $('reading-title')).focus({ preventScroll: true });
    }
    document.title = paneTitle() + ' · ' + u('brand');
    renderHandle();
  }

  let dialogOpener;
  function openEntry(kind, id, opener) {
    const entry = kind === 'gloss' ? W.glossary[id] : W.figures[id];
    if (!entry) return;
    dialogOpener = opener;
    const image = entry.image || W.glossary[entry.glossaryId]?.image;
    $('entry-dialog').innerHTML = `<button class="icon-button dialog-close" data-dialog-close aria-label="${ui('close')}" autofocus>×</button>
      <span class="eyebrow">${ui(kind === 'gloss' ? 'glossaryPopup' : 'figurePopup')}</span>
      <h2 id="dialog-title">${E(entry.name)}</h2>
      ${entry.role ? `<p class="muted">${E(entry.role)}</p>` : ''}
      ${image ? `<img class="dialog-image" src="${asset(image)}" alt="${E(entry.name)}">` : ''}
      <p>${rich(entry.text || entry.note)}</p>
      ${entry.zoneIds?.length ? `<h3>${ui('seeZones')}</h3><div class="connection-links">${entry.zoneIds.map(id => zoneLink(id, 'button')).join('')}</div>` : ''}`;
    if (!$('entry-dialog').open) $('entry-dialog').showModal();
  }

  const map = $('map');
  const frame = $('map-frame');
  const labels = $('map-labels');
  const popover = $('map-popover');
  const tip = $('zone-tip');
  const aspect = 1002 / 668;
  const camera = { x: 50, y: 50, width: 0 };
  let viewport = { width: 0, height: 0, fit: 0 };
  let mapKey, drawnZone, drawnContinent, cityNodes = [], badgeNodes = [], pinNodes = [];
  let paintPending = false, hotZone = null, tipZone = null;

  function rectStyle([left, top, right, bottom]) {
    return `left:${left}%;top:${top}%;width:${right - left}%;height:${bottom - top}%`;
  }

  function pathLayer(positions, className) {
    const segments = positions.slice(1).map((point, index) => {
      const previous = positions[index];
      return point && previous ? `M${previous.join(' ')}L${point.join(' ')}` : '';
    }).join(' ');
    return segments ? `<svg class="map-path ${className}" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <path class="path-halo" d="${segments}"/><path d="${segments}"/>
    </svg>` : '';
  }

  const zoneAnchor = id => G.zones[id].anchor || G.zones[id].center;

  function continentPath(id) {
    const visits = state.fullSequence ? routeVisits : firstVisits;
    return pathLayer(visits.map(zone => G.zones[zone]?.continent === id ? zoneAnchor(zone) : null), 'continent-path');
  }

  function zoneLines(id) {
    if (!state.journey || !state.paths.has(id)) return '';
    const journey = zonesVisited.get(id);
    const locations = new Map(journey.places.map(place => [place.n, [place.x, place.y]]));
    return pathLayer(journey.visits.map(n => locations.get(n)), 'zone-path');
  }

  function zonePins(id) {
    const lore = (W.zones[id]?.places || []).filter(hasPoint).map(place => ({
      key: 'lore:' + place.id, position: [place.x, place.y], title: t(place.name), place
    }));
    const visits = state.journey ? (zonesVisited.get(id)?.places || []).filter(hasPoint) : [];
    const max = Math.max(1, ...visits.map(place => place.weight || 0));
    return lore.concat(visits.map(place => ({
      key: 'journey:' + place.n,
      position: [place.x, place.y],
      title: place.label ? u('namedJourneyPlace', { n: place.n, name: t(place.label) }) : u('journeyPlace', { n: place.n }),
      size: 22 + 10 * Math.sqrt((place.weight || 0) / max),
      journey: true, place
    })));
  }

  function zoneHeat(id) {
    return (.25 + .75 * Math.sqrt(questTotals.get(id) / mostQuests)).toFixed(2);
  }

  function zoneShape(id) {
    const visited = state.journey && zonesVisited.has(id);
    return `<a href="#${zonePath(id)}" class="zone-shape ${visited ? 'visited' : ''}"
      data-map-zone="${id}" aria-label="${esc(zoneName(id))}" ${visited ? `style="--heat:${zoneHeat(id)}"` : ''}>
      <path d="${G.zones[id].path}"/></a>`;
  }

  function zoneShapes(continent, journeyStyle) {
    const zones = continentZones(continent).filter(id => G.zones[id].path).sort((a, b) => zoneAnchor(a)[1] - zoneAnchor(b)[1]);
    return `<svg id="zone-shapes" class="zone-shapes journey-${journeyStyle}" viewBox="0 0 100 100" preserveAspectRatio="none">
      ${zones.map(zoneShape).join('')}</svg>`;
  }

  function cityMarkers(continent, journeyStyle) {
    return continentZones(continent).filter(id => Object.hasOwn(cityFactions, id))
      .sort((a, b) => zoneAnchor(a)[1] - zoneAnchor(b)[1]).map(id => {
        const shaded = state.journey && journeyStyle === 'shade' && zonesVisited.has(id);
        const faction = cityFactions[id];
        return `<a class="city-marker ${shaded ? 'visited' : ''}" href="#${zonePath(id)}" data-map-zone="${id}"
          data-faction="${faction}" aria-label="${esc(zoneName(id))}" ${shaded ? `style="--heat:${zoneHeat(id)}"` : ''}>
          <span class="crest-face"><img src="${asset('img/' + faction + '.jpg')}" alt="" draggable="false"></span></a>`;
      }).join('');
  }

  function zoneBadges(continent, journeyStyle) {
    if (!state.journey || journeyStyle === 'shade') return [];
    return continentZones(continent).filter(id => zonesVisited.has(id)).map(id => ({
      id, position: zoneAnchor(id),
      text: journeyStyle === 'order' ? zonesVisited.get(id).order : questTotals.get(id)
    }));
  }

  const wholeMap = [0, 0, 100, 100];
  const zoneRect = id => G.zones[id].rect;
  function innerPoint([x, y], [left, top, right, bottom]) {
    return [left + (right - left) * x / 100, top + (bottom - top) * y / 100];
  }

  function renderMap() {
    const { continent, zone } = route.base;
    const journeyStyle = experimentValue(experiments.journey);
    const { dataset } = $('atlas');
    dataset.crest = experimentValue(experiments.crest);
    dataset.numbers = experimentValue(experiments.numbers);
    const geo = zone && G.zones[zone];
    const local = geo && geo.image;
    const layout = zone && !local ? zoneRect(zone) : wholeMap;
    const key = [continent, zone, language.current, state.journey, state.fullSequence, state.paths.has(zone),
      journeyStyle, journeyRevision].join('|');
    if (key !== mapKey) {
      const name = zone ? zoneName(zone) : continentName(continent);
      map.setAttribute('aria-label', u('mapLabel', { zone: name }));
      const tile = zone && !local ? `<div class="zone-tile ${geo.image ? '' : 'missing-tile'}" style="${rectStyle(layout)}">
        ${geo.image ? `<img src="${asset(geo.image)}" alt="" draggable="false">` : ''}${zoneLines(zone)}</div>` : '';
      const source = asset(local || G.continents[continent].image);
      const artwork = $('map-art');
      if (artwork.getAttribute('src') !== source) artwork.setAttribute('src', source);
      artwork.hidden = false;
      $('map-overlays').innerHTML = zone ? tile + (local ? zoneLines(zone) : '') :
        (state.journey && journeyStyle === 'order' ? continentPath(continent) : '') + zoneShapes(continent, journeyStyle);
      if ((drawnZone !== zone || drawnContinent !== continent) &&
          !matchMedia('(prefers-reduced-motion: reduce)').matches) {
        frame.getAnimations().forEach(animation => animation.cancel());
        frame.animate([{ opacity: .55 }, { opacity: 1 }], { duration: 200, easing: 'ease-out' });
      }
      drawnZone = zone;
      drawnContinent = continent;
      const badges = zone ? [] : zoneBadges(continent, journeyStyle);
      const pins = zone ? zonePins(zone) : [];
      labels.innerHTML = `<svg id="leader-lines" class="leader-lines" aria-hidden="true"></svg>
        ${badges.map(badge => `<span class="zone-badge journey-${journeyStyle}" aria-hidden="true">${badge.text}</span>`).join('')}
        ${zone ? '' : cityMarkers(continent, journeyStyle)}
        ${pins.map(pin => `<button class="map-pin ${pin.journey ? 'journey-pin' : 'lore-pin'}" data-pin="${pin.key}"
          aria-label="${esc(pin.title)}" aria-controls="map-popover" aria-expanded="false">
          <span aria-hidden="true" ${pin.size ? `style="--dot-size:${pin.size}px"` : ''}>${pin.journey ? pin.place.n : ''}</span></button>`).join('')}`;
      cityNodes = [...labels.querySelectorAll('.city-marker')];
      badgeNodes = [...labels.querySelectorAll('.zone-badge')].map((element, i) => ({ ...badges[i], element }));
      pinNodes = [...labels.querySelectorAll('[data-pin]')].map((element, i) => ({
        ...pins[i], element, point: innerPoint(pins[i].position, layout)
      }));
      $('map-controls').innerHTML = zone ? anchor('#' + homePath(continent),
        ui('backContinent', { continent: continentName(continent) }), 'map-back') : '';
      mapKey = key;
      hideTip();
      hotZone = null;
      renderPlace();
    }
    requestPaint();
  }

  // The continent fills the panel; the sea at the sides is cropped first, never the land in the middle.
  function fitWidth() {
    const crop = phone.matches ? .47 : .62;
    return Math.min(viewport.width / crop, Math.max(viewport.width, viewport.height * aspect));
  }

  function detailWidth(id) {
    const [left, top, right, bottom] = zoneRect(id);
    return Math.min(viewport.width * 100 / (right - left), viewport.height * aspect * 100 / (bottom - top));
  }

  function setCameraForRoute() {
    const { zone } = route.base;
    camera.x = camera.y = 50;
    camera.width = viewport.fit;
    if (!zone) return;
    if (!G.zones[zone].image) {
      [camera.x, camera.y] = G.zones[zone].center;
      camera.width = Math.max(viewport.fit, detailWidth(zone) * .78);
    } else {
      camera.width = Math.min(viewport.width, viewport.height * aspect);
    }
  }

  function resizeMap() {
    const width = map.clientWidth;
    const height = map.clientHeight;
    if (!width || !height || (width === viewport.width && height === viewport.height)) return;
    viewport = { width, height };
    viewport.fit = fitWidth();
    setCameraForRoute();
    requestPaint();
  }

  function screenPoint([x, y]) {
    return [viewport.width / 2 + (x - camera.x) * camera.width / 100,
      viewport.height / 2 + (y - camera.y) * camera.width / aspect / 100];
  }

  function requestPaint() {
    if (paintPending) return;
    paintPending = true;
    requestAnimationFrame(() => {
      paintPending = false;
      if (!viewport.fit) return;
      const [left, top] = screenPoint([0, 0]);
      frame.style.width = camera.width + 'px';
      frame.style.height = camera.width / aspect + 'px';
      frame.style.transform = `translate(${left}px, ${top}px)`;
      positionMarkers();
      positionPopover();
    });
  }

  function placeElement(element, [x, y], margin = 0) {
    element.hidden = x < -margin || x > viewport.width + margin || y < -margin || y > viewport.height + margin;
    element.style.left = x + 'px';
    element.style.top = y + 'px';
  }

  function markerOffsets(columns, rows, dx, dy) {
    const offsets = [];
    for (let row = -rows; row <= rows; row++) {
      for (let column = -columns; column <= columns; column++) {
        offsets.push([column * dx, row * dy]);
      }
    }
    return offsets.sort((a, b) => Math.hypot(...a) - Math.hypot(...b));
  }
  const pinOffsets = markerOffsets(3, 3, 15, 15);

  function positionMarkers() {
    const markers = badgeNodes.length ? badgeNodes : pinNodes;
    const occupied = [];
    const leaders = [];
    // Crests stay at city centers while journey badges make room around their hit targets.
    for (const element of cityNodes) {
      const [x, y] = screenPoint(zoneAnchor(element.dataset.mapZone)).map(Math.round);
      placeElement(element, [x, y], 3);
      if (!element.hidden) occupied.push({ x, y, w: element.offsetWidth / 2, h: element.offsetHeight / 2 });
    }
    for (const marker of markers) placeElement(marker.element, screenPoint(marker.point || marker.position), 3);

    // Leader lines preserve the exact location when two markers need space.
    const visible = markers.filter(marker => !marker.element.hidden).map(marker => ({
      marker, at: screenPoint(marker.point || marker.position),
      w: marker.element.offsetWidth / 2, h: marker.element.offsetHeight / 2
    }));
    for (const { marker, at: [x, y], w, h } of visible) {
      const { element } = marker;
      const fitX = candidate => clamp(candidate, w + 3, viewport.width - w - 3);
      const fitY = candidate => clamp(candidate, h + 3, viewport.height - h - 3);
      let placement = { x: fitX(x), y: fitY(y), w, h };
      for (const [dx, dy] of pinOffsets) {
        const cx = fitX(x + dx);
        const cy = fitY(y + dy);
        if (occupied.every(other => Math.abs(other.x - cx) >= other.w + w + 3 || Math.abs(other.y - cy) >= other.h + h + 1)) {
          placement = { x: cx, y: cy, w, h };
          break;
        }
      }
      occupied.push(placement);
      marker.placement = placement;
      element.style.setProperty('--marker-x', placement.x - x + 'px');
      element.style.setProperty('--marker-y', placement.y - y + 'px');
      if (Math.hypot(placement.x - x, placement.y - y) > 5) {
        leaders.push(`<line x1="${x}" y1="${y}" x2="${placement.x}" y2="${placement.y}"/>
          <circle cx="${x}" cy="${y}" r="2"/>`);
      }
    }
    $('leader-lines').innerHTML = leaders.join('');
  }

  // Hover, keyboard focus, an open card and the reading list all light up one zone at a time.
  function setHot(id) {
    if (id === hotZone) return;
    hotZone = id;
    for (const shape of map.querySelectorAll('[data-map-zone]')) shape.classList.toggle('is-hot', shape.dataset.mapZone === id);
    for (const badge of badgeNodes) badge.element.classList.toggle('is-hot', badge.id === id);
  }

  function zoneBrief(id, card) {
    const lore = W.zones[id];
    const brief = W.briefs[id] || {};
    const levels = lore?.levels || brief.levels;
    const levelText = !levels ? '' : levels.en.includes('city') ? E(levels) : ui('levelRange', { levels: t(levels) });
    const meta = [levelText, lore?.complete ? ui('fullEntry') : ''].filter(Boolean).join('<span aria-hidden="true"> · </span>');
    const visit = state.journey && zonesVisited.get(id);
    const totals = visit ? journeyTotals(id) : null;
    const journey = visit ? `<p class="tip-journey">${ui('zoneJourney', { n: visit.order, quests: totals.quests || 0 })}</p>` : '';
    const heading = card ? `<div class="popover-heading"><h2 id="place-title">${esc(zoneName(id))}</h2>
      <button class="icon-button" data-place-close aria-label="${ui('close')}">×</button></div>` : `<strong class="tip-name">${esc(zoneName(id))}</strong>`;
    return `${meta ? `<span class="eyebrow">${meta}</span>` : ''}${heading}
      ${brief.tagline ? `<p>${E(brief.tagline)}</p>` : ''}${journey}
      ${card ? anchor('#' + zonePath(id), ui(lore ? 'readZone' : 'openZone'), 'button card-link') : ''}`;
  }

  function showTip(id, [x, y], below = false) {
    if (tipZone !== id) {
      tip.innerHTML = zoneBrief(id, false);
      tipZone = id;
    }
    tip.hidden = false;
    const w = tip.offsetWidth;
    const h = tip.offsetHeight;
    const left = x + 18 + w <= viewport.width - 8 ? x + 18 : x - 18 - w;
    const top = below ? y + 14 : y - h - 14 >= 8 ? y - h - 14 : y + 22;
    tip.style.left = clamp(left, 8, viewport.width - w - 8) + 'px';
    tip.style.top = clamp(top, 8, viewport.height - h - 8) + 'px';
  }

  function hideTip() {
    tip.hidden = true;
    tipZone = null;
  }

  function popoverDetails(place) {
    const { quests, deaths, seconds } = place.kinds || {};
    const duration = seconds > 0 ? u('duration', { minutes: Math.floor(seconds / 60), seconds: Math.floor(seconds % 60) }) : null;
    const stats = [['quests', quests], ['deaths', deaths], ['timeSpent', duration]].filter(([, value]) => value != null);
    return stats.length ? `<dl>${stats.map(([key, value]) => `<dt>${ui(key)}</dt><dd>${esc(value)}</dd>`).join('')}</dl>` : '';
  }

  function renderPlace() {
    const pin = pinNodes.find(item => item.key === state.place);
    const card = !route.base.zone && state.card;
    popover.hidden = !pin && !card;
    for (const item of pinNodes) item.element.setAttribute('aria-expanded', String(item === pin));
    setHot(card || null);
    if (card) {
      popover.innerHTML = zoneBrief(card, true);
    } else if (pin) {
      popover.innerHTML = `<div class="popover-heading"><h2 id="place-title">${esc(pin.title)}</h2>
        <button class="icon-button" data-place-close aria-label="${ui('close')}">×</button></div>
        ${pin.journey ? popoverDetails(pin.place) : `<p>${rich(pin.place.text)}</p>`}`;
    }
    positionPopover();
  }

  function popoverAnchor() {
    if (state.card) return screenPoint(zoneAnchor(state.card));
    const pin = pinNodes.find(item => item.key === state.place);
    if (!pin) return null;
    const [mapX, mapY] = screenPoint(pin.point);
    return [pin.placement?.x ?? mapX, pin.placement?.y ?? mapY];
  }

  function positionPopover() {
    if (popover.hidden) return;
    const at = popoverAnchor();
    if (!at) return;
    const [x, y] = at;
    const w = popover.offsetWidth;
    const h = popover.offsetHeight;
    const top = y - h - 26 >= 8 ? y - h - 26 : y + 26;
    popover.style.left = clamp(x - w / 2, 8, viewport.width - w - 8) + 'px';
    popover.style.top = clamp(top, 8, viewport.height - h - 8) + 'px';
  }

  function closePlace(focus = false) {
    if (!state.place && !state.card) return;
    const pin = pinNodes.find(item => item.key === state.place);
    const shape = state.card && map.querySelector(`[data-map-zone="${state.card}"]`);
    state.place = state.card = null;
    renderPlace();
    if (focus) (pin?.element || shape)?.focus({ preventScroll: true });
  }

  function openPlace(key, fromReading) {
    if (state.place === key && !fromReading) {
      closePlace();
      return;
    }
    const pin = pinNodes.find(item => item.key === key);
    if (!pin) return;
    if (phone.matches && fromReading && state.snap === 'full') setSnap('half');
    state.card = null;
    state.place = key;
    renderPlace();
    requestPaint();
    if (fromReading) popover.querySelector('[data-place-close]').focus({ preventScroll: true });
  }

  function openCard(id) {
    hideTip();
    state.place = null;
    state.card = id;
    renderPlace();
  }

  function applyRoute() {
    const previous = route;
    const hash = location.hash;
    const cleanHash = consumeJourneyFragment();
    route = parseRoute(cleanHash);
    const moved = previous.base.zone !== route.base.zone || previous.base.continent !== route.base.continent;
    const opens = route.saga !== previous.saga || route.panel !== previous.panel;
    const hasPanel = Boolean(route.saga || route.panel);
    const hasReading = route.base.zone || hasPanel || route.missing;
    $('entry-dialog').close();
    closePlace();
    if (moved) setCameraForRoute();
    if (phone.matches && (opens || moved || route.missing)) {
      if (hasReading && state.snap === 'peek') setSnap('half');
      if (!hasReading && !hasPanel) setSnap('peek');
    }
    const focus = opens || moved || previous.base.story !== route.base.story;
    renderHeader();
    renderReading({ focus: focus && (!phone.matches || state.snap !== 'peek') });
    renderMap();
    if (focus && phone.matches && state.snap === 'peek') map.focus({ preventScroll: true });
    if (hash !== cleanHash && importError) focusJourneyImport();
  }

  const snaps = ['peek', 'half', 'full'];
  function renderHandle() {
    const handle = $('sheet-handle');
    const expanded = state.snap !== 'peek';
    handle.setAttribute('aria-expanded', String(expanded));
    handle.setAttribute('aria-label', u(state.snap === 'full' ? 'closeReading' : 'openReading') + ' · ' + paneTitle());
    handle.innerHTML = `<span class="grip" aria-hidden="true"></span><span class="sheet-title">${esc(paneTitle())}</span>`;
    $('reading-scroll').inert = phone.matches && !expanded;
  }

  function setSnap(snap) {
    state.snap = snap;
    $('atlas').dataset.snap = snap;
    renderHandle();
  }

  function installSheetGestures() {
    const handle = $('sheet-handle');
    const atlas = $('atlas');
    let drag, suppressTap = false;
    handle.addEventListener('pointerdown', event => {
      if (!phone.matches || event.button !== 0) return;
      suppressTap = false;
      drag = { id: event.pointerId, y: event.clientY, height: $('reading').offsetHeight };
      handle.setPointerCapture(event.pointerId);
    });
    handle.addEventListener('pointermove', event => {
      if (drag?.id !== event.pointerId) return;
      const delta = drag.y - event.clientY;
      if (Math.abs(delta) >= 7) suppressTap = true;
      if (suppressTap) atlas.style.setProperty('--drag-sheet-height', clamp(drag.height + delta, 52, atlas.clientHeight - 76) + 'px');
    });
    function finish(event) {
      if (drag?.id !== event.pointerId) return;
      atlas.style.removeProperty('--drag-sheet-height');
      if (suppressTap && event.type === 'pointerup') {
        const travel = drag.y - event.clientY;
        const index = snaps.indexOf(state.snap);
        const steps = Math.abs(travel) > atlas.clientHeight * .56 ? 2 : 1;
        if (Math.abs(travel) >= 24) setSnap(snaps[clamp(index + Math.sign(travel) * steps, 0, 2)]);
      }
      drag = null;
    }
    handle.addEventListener('pointerup', finish);
    handle.addEventListener('pointercancel', finish);
    handle.addEventListener('click', event => {
      if (suppressTap && event.detail) {
        suppressTap = false;
        return;
      }
      setSnap(snaps[(snaps.indexOf(state.snap) + 1) % snaps.length]);
    });
    handle.addEventListener('keydown', event => {
      if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
      event.preventDefault();
      const direction = event.key === 'ArrowUp' ? 1 : -1;
      setSnap(snaps[clamp(snaps.indexOf(state.snap) + direction, 0, 2)]);
    });
  }

  // A mouse hovers to read a zone's card and clicks to open it; a touch has no hover, so the first
  // tap shows the card and the card's link (or a second tap on the zone) opens it.
  let pointerType = 'mouse';
  const mapPoint = event => [event.clientX - map.getBoundingClientRect().left, event.clientY - map.getBoundingClientRect().top];
  map.addEventListener('pointerdown', event => { pointerType = event.pointerType; }, true);
  map.addEventListener('pointermove', event => {
    const id = event.target.closest?.('[data-map-zone]')?.dataset.mapZone;
    if (event.pointerType === 'touch' || state.card) return;
    if (!id) {
      hideTip();
      setHot(null);
      return;
    }
    setHot(id);
    showTip(id, mapPoint(event));
  });
  map.addEventListener('pointerleave', () => {
    hideTip();
    if (!state.card) setHot(null);
  });
  map.addEventListener('focusin', event => {
    const id = event.target.dataset?.mapZone;
    if (!id || !event.target.matches(':focus-visible')) return;
    setHot(id);
    const [x, y] = screenPoint(zoneAnchor(id));
    showTip(id, [x, y], true);
  });
  map.addEventListener('focusout', event => {
    if (!event.relatedTarget?.closest?.('[data-map-zone]')) {
      hideTip();
      if (!state.card) setHot(null);
    }
  });

  const reading = $('reading-scroll');
  reading.addEventListener('pointerover', event => {
    const id = event.target.closest('[data-zone-link]')?.dataset.zoneLink;
    if (id && event.pointerType !== 'touch') setHot(id);
  });
  reading.addEventListener('pointerout', event => {
    if (event.target.closest('[data-zone-link]') && !event.relatedTarget?.closest?.('[data-zone-link]')) setHot(state.card || null);
  });

  document.addEventListener('click', event => {
    const target = event.target.closest('button, a');
    const menu = $('atlas-menu');
    if (menu.open && (!menu.contains(event.target) || target?.matches('.menu-items a'))) menu.open = false;
    const zone = target?.dataset.mapZone;
    if (zone && pointerType === 'touch' && event.detail && state.card !== zone) {
      event.preventDefault();
      openCard(zone);
      return;
    }
    if (!popover.hidden && !event.target.closest('#map-popover, [data-pin]')) closePlace();
    if (!target) {
      if (event.target === $('entry-dialog')) $('entry-dialog').close();
      return;
    }
    if (target.id === 'skip') {
      event.preventDefault();
      if (phone.matches && state.snap === 'peek') setSnap('half');
      $('reading-scroll').focus();
    } else if (target.id === 'journey-toggle') {
      if (!J) {
        focusJourneyImport();
        return;
      }
      state.journey = !state.journey;
      target.setAttribute('aria-pressed', String(state.journey));
      closePlace();
      renderReading({ keepScroll: true });
      renderMap();
    } else if (target.id === 'journey-remove') {
      const id = selectedCharacter;
      summaries.delete(id);
      selectJourney(summaries.keys().next().value);
      saveJourneys(id);
      refreshJourney(J ? 'journey-character' : 'journey-summary');
    } else if (target.dataset.experiment && !(event.altKey || event.ctrlKey || event.metaKey || event.shiftKey)) {
      try {
        history.replaceState(history.state, '', target.href);
      } catch (_) {
        return; // Follow the link if the browser rejects an in-page URL update.
      }
      event.preventDefault();
      experiments[target.dataset.experiment].onSelect?.();
      renderHeader();
      renderReading({ keepScroll: true });
      renderMap();
      $('atlas-menu').querySelector('summary').focus({ preventScroll: true });
    } else if (target.dataset.lang) {
      language.set(target.dataset.lang);
    } else if (target.dataset.sequence) {
      state.fullSequence = target.dataset.sequence === 'full';
      renderReading({ keepScroll: true });
      document.querySelector(`[data-sequence="${target.dataset.sequence}"]`).focus({ preventScroll: true });
      renderMap();
    } else if (target.dataset.pin) {
      openPlace(target.dataset.pin, !map.contains(target));
    } else if (target.dataset.gloss || target.dataset.figure) {
      openEntry(target.dataset.gloss ? 'gloss' : 'figure', target.dataset.gloss || target.dataset.figure, target);
    } else if (target.hasAttribute('data-dialog-close')) {
      $('entry-dialog').close();
    } else if (target.hasAttribute('data-place-close')) {
      closePlace(true);
    } else if (target.matches('a[href^="#/"]') && target.hash === location.hash && route.base.story && !route.panel && !route.saga) {
      const story = $('story-' + route.base.story);
      $('reading-scroll').scrollTop = story.offsetTop - 8;
    }
  });

  document.addEventListener('change', event => {
    if (event.target.id === 'continent-select') location.hash = '#/' + event.target.value;
    if (event.target.id === 'journey-character' && summaries.has(event.target.value)) {
      selectJourney(event.target.value);
      saveJourneys();
      refreshJourney('journey-character');
    }
    if (event.target.id === 'show-path') {
      if (event.target.checked) state.paths.add(route.base.zone);
      else state.paths.delete(route.base.zone);
      renderMap();
    }
  });

  reading.addEventListener('submit', event => {
    if (event.target.id !== 'journey-import-form') return;
    event.preventDefault();
    const input = $('journey-summary');
    if (!importJourney(input.value)) {
      renderJourneyError();
      input.focus();
      return;
    }
    event.target.reset();
    if ($('journey-import')) $('journey-import').open = false;
    refreshJourney('journey-title');
  });

  reading.addEventListener('input', event => {
    if (event.target.id === 'journey-summary' && importError) {
      importError = null;
      renderJourneyError();
    }
  });

  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || $('entry-dialog').open) return;
    if ($('atlas-menu').open) {
      $('atlas-menu').open = false;
      $('atlas-menu').querySelector('summary').focus();
    } else if (!popover.hidden) {
      closePlace(true);
    } else if (!tip.hidden) {
      hideTip();
    } else if (route.panel || route.saga) {
      location.hash = panelHref(null);
    }
  });

  $('entry-dialog').addEventListener('close', () => {
    if (dialogOpener?.isConnected) dialogOpener.focus({ preventScroll: true });
  });

  addEventListener('hashchange', applyRoute);
  addEventListener('lore:languagechange', () => {
    document.documentElement.lang = language.current === 'zh' ? 'zh-CN' : 'en';
    $('skip').textContent = u('skip');
    renderHeader();
    renderReading({ keepScroll: true });
    renderMap();
    document.querySelector(`[data-lang="${language.current}"]`).focus({ preventScroll: true });
  });
  phone.addEventListener('change', renderHandle);

  document.documentElement.lang = language.current === 'zh' ? 'zh-CN' : 'en';
  $('skip').textContent = u('skip');
  restoreJourneys();
  route = parseRoute(consumeJourneyFragment());
  renderHeader();
  setSnap(phone.matches && (route.base.zone || route.saga || route.panel || route.missing) ? 'half' : 'peek');
  resizeMap();
  renderReading();
  renderMap();
  if (importError) focusJourneyImport();
  installSheetGestures();
  new ResizeObserver(resizeMap).observe(map);
})();
