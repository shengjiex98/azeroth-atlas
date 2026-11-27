(function () {
  'use strict';

  const W = WORLD;
  const G = GEO;
  const C = CHAINS;
  const { decodeSummary, buildJourney, chainProgress, journeySessions, sessionStories,
    chapterProgress, chapterInterludes } = ROSETTA_JOURNEY;
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
    if (Object.hasOwn(continentSlug, id)) return continentName(String(id));
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
  let sessions = [], sessionIndex = -1;
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
    lines: { param: 'lines', values: ['current', 'ink', 'dashed', 'footsteps'], default: 'ink',
      get available() { return Boolean(J || route?.chain); } },
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
    fullSequence: false, paths: new Set(), snap: 'peek', place: null, card: null,
    chainSteps: [], chapterFocus: null, readAhead: new Set()
  };
  const panels = { sagas: 'sagas', glossary: 'glossary', sources: 'sources' };

  const characterKey = ([{ name, realm }]) => (name ?? '') + '-' + (realm ?? '');

  function selectJourney(id) {
    const summary = summaries.get(id);
    selectedCharacter = summary ? id : null;
    J = summary ? buildJourney(summary.records) : null;
    sessions = J ? journeySessions(J) : [];
    sessionIndex = sessions.length - 1;
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
    state.readAhead.clear();
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
    const entry = /^\/(saga|chain)\/([\w-]+)$/.exec(path);
    const panel = params.get('panel');
    const fallback = { continent: continents.ek };
    if (entry) {
      const [, type, id] = entry;
      if (Object.hasOwn(type === 'chain' ? C : W.sagas, id)) {
        const chapter = type === 'chain' && Number(params.get('chapter'));
        return { base: parseBase(params.get('at') || '') || fallback, [type]: id,
          chapter: Number.isInteger(chapter) && chapter > 0 && chapter <= W.chains[id]?.chapters.length ? chapter : null };
      }
    }
    const base = parseBase(path || '/ek');
    return { base: base || fallback, missing: !base, panel: Object.hasOwn(panels, panel) ? panel : null };
  }

  function routeHref({ base, saga, chain, panel, chapter }) {
    const path = basePath(base);
    const entry = chain ? '/chain/' + chain : saga ? '/saga/' + saga : '';
    const params = new URLSearchParams();
    if (entry && path !== '/ek') params.set('at', path);
    if (chain && chapter) params.set('chapter', chapter);
    if (!entry && panel) params.set('panel', panel);
    const query = params.toString();
    return '#' + (entry || path) + (query ? '?' + query : '');
  }

  let route;
  const panelHref = panel => routeHref({ base: route.base, panel });
  const mapHref = path => routeHref({ base: parseBase(path), chain: route.chain, chapter: route.chapter });
  const chainHref = (id, chapter) => routeHref({ base: route.base, chain: id, chapter });
  const chainLink = chain => anchor(chainHref(chain.id), E(chain.title));
  const sagaLink = (id, cls = '') => anchor(routeHref({ base: route.base, saga: id }), E(W.sagas[id].name), cls);
  const isRecapHome = () => sessions.length && !route.chain && !route.saga && !route.panel && !route.missing && !route.base.zone;
  const isChainStory = () => Boolean(W.chains[route.chain]?.chapters.length);

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

  const locale = () => language.current === 'zh' ? 'zh-CN' : 'en';
  const localDate = time => new Date(time * 1000).toLocaleDateString(locale(), { dateStyle: 'medium' });
  const localTime = time => new Date(time * 1000).toLocaleTimeString(locale(), { timeStyle: 'short' });
  const questCount = n => u(n === 1 ? 'sessionQuest' : 'sessionQuests', { n });
  const chapterCount = (n, total) => u('storyChapterOf', { n, total });

  function timeRange(start, end, includeDate = false) {
    const from = includeDate ? localDate(start) + ' ' + localTime(start) : localTime(start);
    const to = includeDate ? localDate(end) + ' ' + localTime(end) : localTime(end);
    return u('sessionTimeRange', { start: from, end: to });
  }

  const mapImage = id => G.zones[id]?.image || G.continents[id]?.image;
  const hasPhotoPosition = point => hasPoint(point) && mapImage(point.map);
  const photoRatio = 2.15;

  function mapPhoto(map, points, { square = false, trace = false } = {}) {
    const source = mapImage(map);
    if (!source || !points.length) return '';
    // Calculate the crop in a fixed coordinate frame so pins scale with the card.
    const width = 100, height = square ? width : width / photoRatio;
    const padding = square ? 14 : 8;
    const xs = points.map(({ x }) => x / 1000);
    const ys = points.map(({ y }) => y / 1000 / aspect);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    const imageWidth = Math.min(Math.max(width, height * aspect) * (square ? 3 : 2.6),
      (width - 2 * padding) / (maxX - minX), (height - 2 * padding) / (maxY - minY));
    const imageHeight = imageWidth / aspect;
    function offset(size, imageSize, first, last) {
      const center = (size - first - last) / 2;
      const aligned = clamp(center, Math.min(0, size - imageSize), Math.max(0, size - imageSize));
      return clamp(aligned, padding - first, size - padding - last);
    }
    const left = offset(width, imageWidth, minX * imageWidth, maxX * imageWidth);
    const top = offset(height, imageHeight, minY * imageWidth, maxY * imageWidth);
    const positions = xs.map((x, i) => [left + x * imageWidth, top + ys[i] * imageWidth]);
    const path = trace && positions.length > 1 ? `<svg viewBox="0 0 ${width} ${height}">
      <polyline points="${positions.map(point => point.join(',')).join(' ')}" vector-effect="non-scaling-stroke"/>
    </svg>` : '';
    return `<span class="story-map${square ? ' story-map-square' : ''}" style="aspect-ratio:${square ? 1 : photoRatio}" aria-hidden="true">
      <img src="${asset(source)}" alt="" loading="lazy"
        style="width:${imageWidth}%;left:${left}%;top:${top / height * 100}%">
      ${path}${positions.map(([x, y], i) => `<span class="story-map-pin${i === positions.length - 1 ? ' is-last' : ''}"
        style="left:${x}%;top:${y / height * 100}%"></span>`).join('')}
    </span>`;
  }

  function sessionTitle(time) {
    const date = new Date(time * 1000);
    const hour = date.getHours();
    const period = hour < 5 || hour >= 22 ? 'Night' : hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : 'Evening';
    if (hour < 5) date.setDate(date.getDate() - 1);
    return u('session' + period, { day: date.toLocaleDateString(locale(), { weekday: 'long' }) });
  }

  function sessionStoryCard({ id, status, chapter, latest, questCount: n }) {
    const story = W.chains[id];
    const stamp = [
      status === 'advanced' && chapter >= 0 ? chapterCount(chapter + 1, story.chapters.length) : localTime(latest.t),
      latest.map != null && zoneName(latest.map)
    ].filter(Boolean).join(' · ');
    const line = story?.chapters[chapter]?.recap ?? story?.hook ?? u(n === 1 ? 'sessionStoryQuest' : 'sessionStoryQuests', { n });
    const photo = hasPhotoPosition(latest) ? mapPhoto(latest.map, [latest], { square: true }) : '';
    return `<a class="session-story ${photo ? 'has-photo' : ''}" data-story-status="${status}" href="${esc(chainHref(id, chapter + 1))}">
      ${photo}<span class="session-story-copy"><span class="story-stamp">${esc(stamp)}</span>
      <strong>${E(C[id].title)}</strong><span>${E(line)}</span></span></a>`;
  }

  function sessionRecap() {
    const session = sessions[sessionIndex];
    if (!session) return '';
    const { start, end, startLevel, endLevel } = session;
    // Overview frames can appear in the journal while the player is between zones.
    const isZone = map => zoneIds.includes(String(map));
    const maps = (session.route.some(isZone) ? session.route : session.events.map(event => event.map))
      .filter(isZone).filter((map, i, route) => map !== route[i - 1]);
    const facts = [localDate(start), timeRange(start, end),
      startLevel !== null && u('storyLevelRange', { start: startLevel, end: endLevel }), questCount(session.questCount)]
      .filter(Boolean).join(' · ');
    const stories = sessionStories(session, C, J, W.chains);
    const groups = [
      ['finished', 'sessionFinished'], ['advanced', 'sessionAdvanced', 'sessionAdvancedOne'],
      ['started', 'sessionStarted', 'sessionStartedOne']
    ].map(([status, plural, singular]) => {
      const cards = stories.filter(story => story.status === status);
      if (!cards.length) return '';
      return `<div class="session-group"><h3>${ui(cards.length === 1 && singular ? singular : plural)}
        <small>${cards.length}</small></h3><ul>${cards.map(card => `<li>${sessionStoryCard(card)}</li>`).join('')}</ul></div>`;
    }).join('');
    const latest = sessionIndex === sessions.length - 1;
    return `<section id="session-recap" aria-labelledby="session-title">
      <span class="eyebrow">${ui(latest ? 'lastSession' : 'pastSession')}</span>
      <h2 id="session-title" tabindex="-1">${esc(sessionTitle(start))}</h2>
      <p class="session-facts">${esc(facts)}</p>
      ${maps.length ? `<p class="session-route">${maps.map(map => esc(zoneName(map))).join(' → ')}</p>` : ''}
      ${groups || `<p class="session-facts">${ui('sessionNoStories')}</p>`}
      ${sessions.length > 1 ? `<div class="session-nav">
        ${sessionIndex > 0 ? `<button type="button" data-session="older">← ${ui('sessionOlder')}</button>` : ''}
        ${!latest ? `<button type="button" data-session="newer">${ui('sessionNewer')} →</button>` : ''}
      </div>` : ''}
    </section>`;
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
        ${route.chain ? '' : sessionRecap()}${content}${route.chain ? '' : journeyChains()}<details id="journey-import">
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
    const target = $(focusId) || $('journey-title');
    if (focusId === 'journey-title' && isRecapHome()) scrollReadingTo(target.closest('.journey-card'));
    target.focus({ preventScroll: true });
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
        </div><p class="visit-order" tabindex="0">${visits.map(n => `<span>${n}</span>`).join('<span aria-hidden="true">&nbsp;→ </span>')}</p>` : '';
    return journeyCard(content, visitBadge(id));
  }

  const hasPoint = place => Number.isFinite(place.x) && Number.isFinite(place.y);

  function zonePage(id) {
    const zone = W.zones[id];
    const geo = G.zones[id];
    const name = esc(zoneName(id));
    const noMap = geo.image ? '' : `<p class="notice">${ui('noZoneMap')}</p>`;
    const journey = zoneJourney(id);
    const chains = zoneChains(id);
    if (!zone) {
      return entryHeading(name, esc(continentName(geo.continent)), ui('loreUnavailable')) + noMap + chains + journey;
    }
    const levels = zone.levels.en.includes('city') ? E(zone.levels) : ui('levelRange', { levels: t(zone.levels) });
    return `${entryHeading(name, E(zone.region), E(zone.summary))}
      <p class="entry-meta">${levels}<span aria-hidden="true"> · </span>${ui(zone.complete ? 'fullEntry' : 'briefEntry')}</p>
      ${noMap}${chains}${journey}
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

  function chainWhy({ signals }) {
    const { steps, maps, continents, elite, rareElite, boss, dungeonSteps } = signals;
    return [
      u('chainWhySteps', { n: steps }),
      u(maps === 1 ? 'chainWhyMap' : 'chainWhyMaps', { n: maps }),
      continents > 1 && u('chainWhyContinents', { n: continents }),
      elite && u(elite === 1 ? 'chainWhyElite' : 'chainWhyElites', { n: elite }),
      rareElite && u(rareElite === 1 ? 'chainWhyRareElite' : 'chainWhyRareElites', { n: rareElite }),
      boss && u(boss === 1 ? 'chainWhyBoss' : 'chainWhyBosses', { n: boss }),
      dungeonSteps && u(dungeonSteps === 1 ? 'chainWhyDungeonStep' : 'chainWhyDungeonSteps', { n: dungeonSteps })
    ].filter(Boolean).join(' · ');
  }

  function chainRow(chain, progress) {
    const { levels, steps } = chain;
    const next = progress.status === 'inProgress' && ['active', 'next'].map(status =>
      steps.find(step => progress.steps.get(step.id).status === status)).find(Boolean);
    const giver = next?.giver;
    const nextText = next && (giver?.map != null
      ? ui('chainNextStep', { step: t(next.name), giver: t(giver.name), zone: zoneName(giver.map) })
      : ui('chainNextStepName', { step: t(next.name) }));
    const detail = [
      progress.status !== 'notStarted' && u('chainCount', { done: progress.done, total: steps.length }),
      levels && u('levelRange', { levels: [...new Set(levels)].join('–') })
    ].filter(Boolean).join(' · ');
    return `<li class="chain-row">${chainLink(chain)}${detail ? `<p>${esc(detail)}</p>` : ''}
      <p class="muted">${esc(chainWhy(chain))}</p>${nextText ? `<p class="chain-next">${nextText}</p>` : ''}</li>`;
  }

  function journeyChains() {
    const lists = { inProgress: [], completed: [] };
    for (const chain of Object.values(C)) {
      const progress = chainProgress(chain, J);
      if (progress.visible && lists[progress.status]) lists[progress.status].push(chainRow(chain, progress));
    }
    const list = (items, label, empty) => `<h4>${ui(label)}</h4>
      ${items.length ? `<ul class="chain-rows">${items.join('')}</ul>` : `<p class="muted">${ui(empty)}</p>`}`;
    return `<section class="journey-chains" aria-labelledby="journey-chains">
      <h3 id="journey-chains">${ui('questChains')}</h3>
      ${list(lists.inProgress, 'chainsInProgress', 'noChainsInProgress')}
      ${list(lists.completed, 'chainsCompleted', 'noChainsCompleted')}</section>`;
  }

  function zoneChains(id) {
    const items = Object.values(C).filter(chain => chain.zoneIds.includes(Number(id))).map(chain => {
      const progress = chainProgress(chain, J);
      return progress.visible ? chainRow(chain, progress) : '';
    }).join('');
    return items ? `<section><h2>${ui('chainsHere')}</h2><ul class="chain-rows">${items}</ul></section>` : '';
  }

  function chainGroups(chain) {
    const groups = [];
    const depth = new Map();
    for (const [index, step] of chain.steps.entries()) {
      const level = Math.max(0, ...step.after.map(id => depth.get(id) + 1));
      depth.set(step.id, level);
      (groups[level] ||= []).push({ step, n: index + 1 });
    }
    return groups;
  }

  function chainLocation(point) {
    const name = t(point.name ?? point.label);
    return point.map == null ? esc(name) : ui('chainAt', { name, zone: zoneName(point.map) });
  }

  function chainStepCard({ step, n }, progress) {
    const { status, t: time, level, backfilled } = progress;
    const turnIn = backfilled ? ui('chainBeforeRosetta') : time !== null && Number.isFinite(time) ? [
      ui('chainTurnInDate', { date: localDate(time) }), level && ui('chainTurnInLevel', { level })
    ].filter(Boolean).join(' · ') : '';
    const endpoints = [['chainGiver', step.giver], ['chainTurnIn', step.turnIn]].filter(([, point]) => point)
      .map(([label, point]) => `<span class="sr-only">${ui(label)} </span>${chainLocation(point)}`)
      .join(' <span aria-hidden="true">→</span> ');
    const goals = step.goals.map(goal =>
      `<li>${ui('chainGoal_' + goal.kind, { label: t(goal.label) })} <span class="muted">· ${esc(zoneName(goal.map))}</span></li>`).join('');
    const links = step.questIds.map(id => `<a href="https://www.wowhead.com/forever/quest=${id}" target="_blank"
      rel="noopener noreferrer">${ui(step.questIds.length > 1 ? 'chainWowheadQuest' : 'chainWowhead', { id })}</a>`);
    return `<article id="chain-step-${step.id}" class="chain-step">
      <h3><button type="button" data-chain-step="${step.id}" aria-pressed="false" title="${ui('chainMapStep', { n })}">
        <span class="chain-number" aria-hidden="true">${n}</span><span class="sr-only">${ui('chainStep', { n })}</span><span>${E(step.name)}</span>
        ${J ? `<span class="chain-status" data-status="${status}">${ui('chainStatus_' + status)}</span>` : ''}
      </button></h3>
      <div class="chain-step-details">
        ${endpoints ? `<p>${endpoints}</p>` : ''}
        ${goals ? `<ul>${goals}</ul>` : ''}
        <p class="chain-step-meta">${turnIn ? `<span>${turnIn}</span>` : ''}${links.join('')}</p>
      </div></article>`;
  }

  const storyHeading = (key, vars) => `<span class="eyebrow">${ui(key, vars)}</span>`;

  function yourTelling(chapters, finished) {
    const timed = chapters.flatMap(chapter => chapter.timed).sort((a, b) => a.t - b.t);
    let detail;
    if (timed.length) {
      const first = timed[0].t, last = timed.at(-1).t;
      const startDate = localDate(first);
      const when = first === last ? [startDate, localTime(first)] :
        startDate === localDate(last) ? [startDate, timeRange(first, last)] : [timeRange(first, last, true)];
      const levels = timed.map(event => event.level).filter(level => level !== null);
      const start = levels[0], end = levels.at(-1);
      const level = start === end ? u('storyLevel', { level: start }) : u('storyLevelRange', { start, end });
      detail = [...when, ...(levels.length ? [level] : [])].join(' · ');
    } else if (chapters.some(chapter => chapter.backfilled.length)) {
      detail = u(finished ? 'storyBeforeJournal' : 'storyPlayedBeforeJournal');
    } else {
      detail = u('storyNoTurnIns');
    }
    const played = chapters.filter(chapter => chapter.played).length;
    return `<aside class="story-telling"><span class="chapter-dots" role="img"
      aria-label="${ui('storyChaptersPlayed', { n: played, total: chapters.length })}">
      ${chapters.map(chapter => `<span class="${chapter.played ? 'is-played' : ''}"></span>`).join('')}</span>
      <div><strong>${ui('storyTelling')}</strong><p>${esc(detail)}</p></div></aside>`;
  }

  function chapterDuration(timed) {
    const seconds = timed.at(-1).t - timed[0].t;
    const quests = questCount(timed.length);
    if (seconds > 86400) return u('storyQuestsOver', { quests, days: Math.ceil(seconds / 86400) });
    const minutes = Math.floor(seconds / 60);
    const unit = (number, unit) => new Intl.NumberFormat(locale(), { style: 'unit', unit, unitDisplay: 'long' }).format(number);
    const hours = Math.floor(minutes / 60);
    const part = minutes % 60;
    const duration = !minutes ? u('storyShortDuration') : !hours ? unit(part, 'minute') : !part ? unit(hours, 'hour') :
      u('storyHoursAndMinutes', { hours: unit(hours, 'hour'), minutes: unit(part, 'minute') });
    return u('storyQuestsIn', { quests, duration });
  }

  function chapterPhoto(chapter, { timed, backfilled }, n) {
    const maps = new Map();
    const timedPositions = timed.filter(hasPhotoPosition);
    const positions = timedPositions.length ? timedPositions : backfilled.filter(hasPhotoPosition);
    for (const point of positions) {
      if (!maps.has(point.map)) maps.set(point.map, []);
      maps.get(point.map).push(point);
    }
    if (!maps.size) return '';
    const [map, points] = [...maps].reduce((a, b) => a[1].length >= b[1].length ? a : b);
    const first = timedPositions.length ? timed[0] : null;
    const weekday = first && new Date(first.t * 1000).toLocaleDateString(locale(), { weekday: 'short' });
    const stamp = first ? [weekday + ' ' + localTime(first.t), first.level !== null && u('storyLevel', { level: first.level })]
      .filter(Boolean).join(' · ') : u('storyBeforeStamp');
    return `<button class="chapter-photo" type="button" data-chain-step="${chapter.stepIds.join(' ')}"
      data-chapter-map="${map}" aria-pressed="false" title="${ui('storyChapterMap', { n })}">
      ${mapPhoto(map, points, { trace: Boolean(first) })}<span class="chapter-photo-caption">
        <span class="story-stamp">${esc(stamp)} · ${esc(zoneName(map))}</span>
        ${first ? `<span>${esc(chapterDuration(timed))}</span>` : ''}
        <span class="sr-only">${ui('storyChapterMap', { n })}</span></span></button>`;
  }

  function storyInterlude(chapter, chainId) {
    const interludes = chapterInterludes(chapter, chainId, C, J);
    if (!interludes.length) return '';
    const stories = interludes.map(({ id, status, t: time }) =>
      ui(status === 'ended' ? 'storyEnded' : 'storyMovedOn', { story: '{story}', time: localTime(time) })
        .replace('{story}', () => chainLink(C[id])));
    const list = new Intl.ListFormat(locale(), { type: 'unit' }).format(stories);
    return `<p class="chapter-interlude">${ui('storyMeanwhile', { stories: '{stories}' }).replace('{stories}', () => list)}</p>`;
  }

  function storyChapter(chain, chapter, index, progress, steps) {
    const n = index + 1;
    return `<section class="story-chapter" id="chain-chapter-${n}" tabindex="-1">
      ${storyHeading('storyChapter', { n })}<h2>${E(chapter.title)}</h2>
      <div class="chapter-prose">${chapter.text.map(paragraph => paragraph.quote
        ? `<blockquote><p>${rich(paragraph.quote)}</p><cite>${E(paragraph.by)}</cite></blockquote>`
        : `<p>${rich(paragraph)}</p>`).join('')}</div>
      ${progress.played ? chapterPhoto(chapter, progress, n) + storyInterlude(progress, chain.id) : ''}
      <details id="chapter-quests-${n}" class="chapter-quests"><summary>${ui('storyChapterQuests', { n: chapter.stepIds.length })}</summary>
        <div class="chain-steps">${chain.steps.flatMap((step, i) => chapter.stepIds.includes(step.id)
          ? [chainStepCard({ step, n: i + 1 }, steps.get(step.id))] : []).join('')}</div></details></section>`;
  }

  function chapterVeil(chain, chapters, index, progress) {
    const counts = new Map();
    for (const step of chain.steps.filter(step => chapters[index].stepIds.includes(step.id))) {
      if (step.turnIn?.map != null) counts.set(step.turnIn.map, (counts.get(step.turnIn.map) || 0) + 1);
    }
    const map = [...counts].sort((a, b) => b[1] - a[1])[0]?.[0];
    const more = progress.slice(index + 1).filter(chapter => !chapter.played).length;
    return `<section class="chapter-veil" id="chain-chapter-${index + 1}" tabindex="-1">
      <span class="eyebrow">${ui('storyNextChapter')}${map != null ? ' · ' + esc(zoneName(map)) : ''}</span>
      <p>${ui('storyUnlock')}</p>${more ? `<p class="muted">${ui(more === 1 ? 'storyMoreChapter' : 'storyMoreChapters', { n: more })}</p>` : ''}
      <button class="button" type="button" data-read-ahead="${index + 1}">${ui('storyReadAhead')}</button></section>`;
  }

  function storyCast(id, cast, shown) {
    cast = cast.filter(person => shown(person.chapter - 1));
    if (!cast.length) return '';
    return `<section><h2>${ui('storyCast')}</h2><ul class="story-cast">${cast.map(person => {
      const other = Object.entries(W.chains).filter(([key, story]) => key !== id &&
        story.cast.some(entry => entry.id === person.id));
      return `<li><strong>${E(person.name)}</strong> · ${rich(person.role)}
        ${other.map(([key]) => `<span>${ui('storyAlsoIn', { story: '{story}' }).replace('{story}', () => chainLink(C[key]))}</span>`).join('')}</li>`;
    }).join('')}</ul></section>`;
  }

  function connectedStories(ids) {
    if (!ids.length) return '';
    return `<section><h2>${ui('storyConnections')}</h2><ul class="story-connections">${ids.map(id => {
      const chain = C[id];
      const { status } = chainProgress(chain, J);
      const chapters = W.chains[id].chapters;
      const index = chapterProgress(chain, chapters, J).findLastIndex(chapter => chapter.played);
      const label = status === 'completed' ? u('storyFinished') : index >= 0 ? chapterCount(index + 1, chapters.length) :
        u(status === 'inProgress' ? 'chainsInProgress' : 'storyNotStarted');
      return `<li>${chainLink(chain)}<span>${esc(label)}</span></li>`;
    }).join('')}</ul></section>`;
  }

  function chainStory(chain, { chapters, hook, meaning, cast, links, sourceIds }, progress, close) {
    const personal = chapterProgress(chain, chapters, J);
    const finished = progress.status === 'completed';
    const veil = J && !finished && !state.readAhead.has(chain.id) ? personal.findIndex(chapter => !chapter.played) : -1;
    const eyebrow = [u('questStory'), J && finished && u('storyFinished')].filter(Boolean).join(' · ');
    return `<div class="chain-heading story-heading">${entryHeading(E(chain.title), esc(eyebrow), hook ? rich(hook) : '')}${close}</div>
      ${J ? yourTelling(personal, finished) : ''}
      ${chapters.map((chapter, index) => {
        if (index === veil) return chapterVeil(chain, chapters, index, personal);
        if (veil !== -1 && !personal[index].played) return '';
        return storyChapter(chain, chapter, index, personal[index], progress.steps);
      }).join('')}
      ${meaning ? (finished || !J ? `<section class="story-meaning">${storyHeading('storyMeaning')}
        <h2>${E(meaning.title)}</h2>${meaning.text.map(value => `<p>${rich(value)}</p>`).join('')}</section>`
        : `<p class="muted story-meaning-locked">${ui('storyMeaningLocked')}</p>`) : ''}
      ${storyCast(chain.id, cast, index => veil === -1 || personal[index].played)}${connectedStories(links)}
      ${sourceIds.length ? `<details class="entry-sources"><summary>${ui('sourcesForEntry')}</summary>${sourceList(sourceIds)}</details>` : ''}`;
  }

  function chainPage(id) {
    const chain = C[id];
    const progress = chainProgress(chain, J);
    const authored = W.chains[id];
    const close = `<a class="icon-button chain-close" href="${panelHref(null)}" aria-label="${ui('close')}" title="${ui('close')}">×</a>`;
    if (!progress.visible) return `<div class="chain-heading">${entryHeading(ui('chainHidden'))}${close}</div>`;
    if (authored?.chapters.length) return chainStory(chain, authored, progress, close);
    const groups = chainGroups(chain).map(group => {
      const cards = group.map(entry => chainStepCard(entry, progress.steps.get(entry.step.id))).join('');
      return group.length === 1 ? cards : `<div class="chain-parallel" role="group" aria-label="${ui('chainParallel')}">
        <p>${ui('chainParallel')}</p>${cards}</div>`;
    }).join('');
    return `<div class="chain-heading">${entryHeading(E(chain.title), '', esc(chainWhy(chain)))}${close}</div>
      <section><h2>${ui('chainSteps')}</h2><div class="chain-steps">${groups}</div></section>`;
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
    if (route.chain) return chainProgress(C[route.chain], J).visible ? t(C[route.chain].title) : u('questChains');
    if (route.saga) return t(W.sagas[route.saga].name);
    if (route.panel) return u(panels[route.panel]);
    if (route.missing) return u('missing');
    return route.base.zone ? zoneName(route.base.zone) : continentName(route.base.continent);
  }

  function scrollReadingTo(element) {
    const scroller = $('reading-scroll');
    scroller.scrollTop += element.getBoundingClientRect().top - scroller.getBoundingClientRect().top - 8;
  }

  const chapterTarget = n => $('chain-chapter-' + n) || document.querySelector('.chapter-veil');

  let readingKey;
  function renderReading({ keepScroll = false, focus = false } = {}) {
    const { base, saga, chain, panel, missing, chapter } = route;
    const journeyStyle = experimentValue(experiments.journey);
    const key = [basePath(base), saga, chain, panel, missing, language.current, state.journey, state.fullSequence,
      journeyStyle, journeyRevision, importError, chapter, state.readAhead.has(chain)].join('|');
    const scroller = $('reading-scroll');
    $('reading').classList.toggle('is-overlay', Boolean(saga || panel));
    if (key !== readingKey) {
      const previousScroll = scroller.scrollTop;
      const draft = $('journey-summary')?.value || '';
      const importOpen = $('journey-import')?.open;
      const openChapters = keepScroll ? [...scroller.querySelectorAll('.chapter-quests[open]')].map(details => details.id) : [];
      const pages = { sagas: sagasPage, glossary: glossaryPage, sources: sourcesPage };
      const panelBar = saga || panel ? `<div class="panel-bar">
        ${saga ? anchor(panelHref('sagas'), ui('sagas')) : ''}
        <a class="icon-button panel-close" href="${panelHref(null)}" aria-label="${ui('close')}" title="${ui('close')}">×</a></div>` : '';
      scroller.innerHTML = panelBar + (chain ? chainPage(chain) : saga ? sagaPage(saga) : panel ? pages[panel]() :
        missing ? entryHeading(ui('missing')) + anchor('#/ek', ui('goHome'), 'button') :
        base.zone ? zonePage(base.zone) : continentPage(base.continent, journeyStyle));
      if (saga || panel || missing) scroller.querySelector('.entry-heading').insertAdjacentHTML('afterend', journeyCard());
      if (chain) scroller.insertAdjacentHTML('beforeend', journeyCard());
      $('journey-summary').value = draft;
      if (J) $('journey-import').open = Boolean(importOpen || importError);
      for (const id of openChapters) {
        if ($(id)) $(id).open = true;
      }
      renderJourneyError();
      readingKey = key;
      if (keepScroll) scroller.scrollTop = previousScroll;
      else scroller.scrollTop = 0;
      const story = chain && chapter ? chapterTarget(chapter) : !chain && !saga && !panel && base.story && $('story-' + base.story);
      const target = story || (isRecapHome() && $('journey-title'));
      if (target && !keepScroll) scrollReadingTo(isRecapHome() ? target.closest('.journey-card') : target);
      if (focus) (target || $('reading-title')).focus({ preventScroll: true });
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
  let travelPath;
  let paintPending = false, hotZone = null, tipZone = null;

  function rectStyle([left, top, right, bottom]) {
    return `left:${left}%;top:${top}%;width:${right - left}%;height:${bottom - top}%`;
  }

  function pathLayer(positions, style, width, height, curved) {
    const segments = [], marks = [];
    const passes = new Map();
    const coords = (x, y) => `${x.toFixed(2)} ${y.toFixed(2)}`;
    const dashed = style === 'dashed';
    for (let i = 1; i < positions.length; i++) {
      const from = positions[i - 1], to = positions[i];
      if (!from || !to) continue;
      const x = from[0] * width / 100, y = from[1] * height / 100;
      const endX = to[0] * width / 100, endY = to[1] * height / 100;
      const start = `M${coords(x, y)}`, end = coords(endX, endY);
      if (style === 'current' && !curved) {
        segments.push(`${start}L${end}`);
        continue;
      }

      const dx = endX - x, dy = endY - y;
      const length = Math.hypot(dx, dy);
      if (!length) continue;

      // Returning legs bow to the opposite side. Separate the first three passes
      // in each direction, then reuse the outermost lane to limit the ink at junctions.
      const key = `${from}>${to}`;
      const pass = passes.get(key) ?? 0;
      if (pass >= 3) continue;
      passes.set(key, pass + 1);
      const bow = Math.min(28, length * .14) + pass * Math.min(13, length * .08);
      const bendX = -dy / length * bow, bendY = dx / length * bow;
      const pointAt = t => [x + dx * t + 2 * bendX * t * (1 - t), y + dy * t + 2 * bendY * t * (1 - t)];

      if (style === 'footsteps') {
        const inset = Math.min(8, length / 4);
        const span = length - 2 * inset;
        const count = Math.max(1, Math.round(span / 9));
        for (let dot = 0; dot < count; dot++) {
          const progress = (dot + .5) / count;
          const [cx, cy] = pointAt((inset + span * progress) / length);
          const radius = 1.25 + .7 * progress;
          marks.push(`<circle cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}" r="${radius.toFixed(2)}"/>`);
        }
        continue;
      }

      segments.push(`${start}Q${coords(x + dx / 2 + bendX, y + dy / 2 + bendY)} ${end}`);
      // Stagger marks on repeat passes and leave room for badges at each end.
      const stagger = pass * 8;
      if (style === 'current' || length < 48 + 2 * stagger) continue;
      const count = dashed ? 1 : Math.ceil((length - 40) / 84);
      for (let mark = 1; mark <= count; mark++) {
        const progress = dashed ? 1 - 20 / length : mark / (count + 1);
        const t = progress - stagger / length;
        const [tipX, tipY] = pointAt(t);
        const tx = dx + 2 * bendX * (1 - 2 * t), ty = dy + 2 * bendY * (1 - 2 * t);
        const tangent = Math.hypot(tx, ty);
        const ux = tx / tangent, uy = ty / tangent;
        const depth = dashed ? 7 : 5.5;
        const halfWidth = dashed ? 3.6 : 4;
        const backX = tipX - ux * depth, backY = tipY - uy * depth;
        const left = coords(backX - uy * halfWidth, backY + ux * halfWidth);
        const right = coords(backX + uy * halfWidth, backY - ux * halfWidth);
        marks.push(`M${left}L${coords(tipX, tipY)}L${right}${dashed ? 'Z' : ''}`);
      }
    }

    if (style === 'footsteps') return marks.join('');
    if (!segments.length) return '';
    const trace = segments.join('');
    const direction = marks.join('');
    return `<path class="path-trace path-halo" d="${trace}"/>
      ${direction && !dashed ? `<path class="path-chevron path-halo" d="${direction}"/>` : ''}
      <path class="path-trace path-ink" d="${trace}"/>
      ${direction ? `<path class="${dashed ? 'path-arrow' : 'path-chevron path-ink'}" d="${direction}"/>` : ''}`;
  }

  const zoneAnchor = id => G.zones[id].anchor || G.zones[id].center;

  function continentRoutePoints(id) {
    const visits = state.fullSequence ? routeVisits : firstVisits;
    return visits.map(zone => G.zones[zone]?.continent === id ? zoneAnchor(zone) : null);
  }

  function zoneRoutePoints(id) {
    if (!state.journey || !state.paths.has(id)) return [];
    const journey = zonesVisited.get(id);
    const locations = new Map(journey.places.map(place => [place.n, [place.x, place.y]]));
    return journey.visits.map(n => locations.get(n));
  }

  function chainMap(chain, progress) {
    const { zone, continent } = route.base;
    const pins = [];
    const points = [];
    const stops = new Set();
    const otherContinents = new Set();
    let previousMap;
    for (const [index, step] of chain.steps.entries()) {
      if (state.chapterFocus && !state.chapterFocus.includes(step.id)) continue;
      const n = index + 1;
      const status = state.journey ? progress.steps.get(step.id).status : '';
      const locations = [
        [step.giver, step.giver && u('chainGiver') + ' · ' + t(step.giver.name)],
        ...step.goals.map(goal => [goal, u('chainGoal_' + goal.kind, { label: t(goal.label) })]),
        [step.turnIn, step.turnIn && u('chainTurnIn') + ' · ' + t(step.turnIn.name)]
      ];
      const stepPins = new Map();
      for (const [point, label] of locations) {
        if (point?.map == null) continue;
        const id = String(point.map);
        const land = G.zones[id]?.continent || (Object.hasOwn(continentSlug, id) ? id : null);
        const localPoint = [point.x / 10, point.y / 10];
        if (zone) {
          if (id !== zone) continue;
          points.push(localPoint);
          const key = localPoint.join(',');
          if (!stepPins.has(key)) stepPins.set(key, { position: localPoint, labels: [] });
          stepPins.get(key).labels.push(label);
        } else if (land === continent) {
          const position = id === land ? localPoint : zoneAnchor(id);
          if (previousMap !== id || id === land) points.push(position);
          previousMap = id;
          if (!stops.has(id)) {
            stops.add(id);
            stepPins.set(id, { position, labels: [zoneName(id)] });
          }
        } else if (land) {
          otherContinents.add(land);
          if (previousMap) points.push(null);
          previousMap = null;
        }
      }
      for (const { position, labels } of stepPins.values()) {
        pins.push({ step: step.id, n, position, status, title: u('chainPin', { n, place: labels.join(' · ') }) });
      }
    }
    return { pins: zone ? mergeChainPins(pins) : pins, points, stops, otherContinents };
  }

  // A hub such as Darkshire is the giver or turn-in for many steps. Separate pins
  // there would fan out into an unreadable ring, so nearby pins share one label.
  function mergeChainPins(pins) {
    const merged = [];
    for (const pin of pins) {
      const near = merged.find(other =>
        Math.hypot(other.position[0] - pin.position[0], other.position[1] - pin.position[1]) < 2.5);
      if (!near) {
        merged.push({ ...pin, steps: [pin.step], ns: [pin.n], statuses: [pin.status], titles: [pin.title] });
        continue;
      }
      if (!near.steps.includes(pin.step)) {
        near.steps.push(pin.step);
        near.ns.push(pin.n);
        near.statuses.push(pin.status);
      }
      near.titles.push(pin.title);
    }
    return merged.map(pin => ({
      ...pin,
      n: stepRanges(pin.ns),
      status: ['next', 'active', 'locked', 'done'].find(status => pin.statuses.includes(status)) || pin.status,
      title: pin.titles.join('\n')
    }));
  }

  function stepRanges(numbers) {
    const sorted = [...numbers].sort((a, b) => a - b);
    const ranges = [];
    for (const n of sorted) {
      const last = ranges[ranges.length - 1];
      if (last && n === last[1] + 1) last[1] = n;
      else ranges.push([n, n]);
    }
    return ranges.map(([a, b]) => a === b ? a : a + (b === a + 1 ? ',' : '–') + b).join(',');
  }

  const stepIds = value => value.split(' ').map(Number);

  function syncChainSteps() {
    for (const element of document.querySelectorAll('[data-chain-step]')) {
      const selected = stepIds(element.dataset.chainStep).every(id => state.chainSteps.includes(id));
      element.setAttribute('aria-pressed', String(selected));
      element.closest('.chain-step')?.classList.toggle('is-selected', selected);
    }
    for (const element of labels.querySelectorAll('[data-chain-pin]')) {
      const selected = stepIds(element.dataset.chainSteps).some(id => state.chainSteps.includes(id));
      element.setAttribute('aria-pressed', String(selected));
    }
  }

  function selectChainSteps(ids, { fromMap = false, chapterMap } = {}) {
    state.chainSteps = ids;
    if (fromMap) {
      syncChainSteps();
      if (phone.matches && state.snap === 'peek') setSnap('half');
      const row = $('chain-step-' + ids[0]);
      const details = row?.closest('details');
      if (details) details.open = true;
      const target = row || document.querySelector('.chapter-veil');
      if (target) {
        scrollReadingTo(target);
        (row?.querySelector('button') || target).focus({ preventScroll: true });
      }
      return;
    }

    state.chapterFocus = chapterMap ? ids : null;
    const maps = C[route.chain].steps.filter(step => ids.includes(step.id))
      .flatMap(step => [step.giver, ...step.goals, step.turnIn]).map(point => point?.map).filter(Boolean).map(String);
    const target = maps.includes(chapterMap) ? chapterMap :
      maps.find(id => zoneIds.includes(id)) || maps.find(id => Object.hasOwn(continentSlug, id));
    if (!target) {
      renderMap();
      return;
    }
    if (phone.matches && state.snap === 'full') setSnap('half');
    const path = Object.hasOwn(continentSlug, target) ? homePath(target) : zonePath(target);
    if (basePath(route.base) !== path) location.hash = mapHref(path);
    else renderMap();
  }

  function zonePins(id, chainLayer) {
    if (chainLayer) return chainLayer.pins;
    if (!id) return [];
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

  function zoneShape(id, chainMap) {
    const visited = !chainMap && state.journey && zonesVisited.has(id);
    return `<a href="${mapHref(zonePath(id))}" class="zone-shape ${visited ? 'visited' : ''} ${chainMap?.stops.has(id) ? 'chain-stop' : ''}"
      data-map-zone="${id}" aria-label="${esc(zoneName(id))}" ${visited ? `style="--heat:${zoneHeat(id)}"` : ''}>
      <path d="${G.zones[id].path}"/></a>`;
  }

  function zoneShapes(continent, journeyStyle, chainMap) {
    const zones = continentZones(continent).filter(id => G.zones[id].path).sort((a, b) => zoneAnchor(a)[1] - zoneAnchor(b)[1]);
    return `<svg id="zone-shapes" class="zone-shapes journey-${journeyStyle}" viewBox="0 0 100 100" preserveAspectRatio="none">
      ${zones.map(id => zoneShape(id, chainMap)).join('')}</svg>`;
  }

  function cityMarkers(continent, journeyStyle) {
    return continentZones(continent).filter(id => Object.hasOwn(cityFactions, id))
      .sort((a, b) => zoneAnchor(a)[1] - zoneAnchor(b)[1]).map(id => {
        const shaded = state.journey && journeyStyle === 'shade' && zonesVisited.has(id);
        const faction = cityFactions[id];
        return `<a class="city-marker ${shaded ? 'visited' : ''}" href="${mapHref(zonePath(id))}" data-map-zone="${id}"
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
      journeyStyle, journeyRevision, route.chain, state.chapterFocus].join('|');
    if (key !== mapKey) {
      const chain = route.chain && C[route.chain];
      const progress = chain && chainProgress(chain, J);
      const chainLayer = progress?.visible ? chainMap(chain, progress) : null;
      const name = zone ? zoneName(zone) : continentName(continent);
      map.setAttribute('aria-label', u('mapLabel', { zone: name }));
      const points = chainLayer ? chainLayer.points : zone ? zoneRoutePoints(zone) :
        state.journey && journeyStyle === 'order' ? continentRoutePoints(continent) : [];
      const path = points.length > 1 ? `<svg class="map-path ${zone ? 'zone-path' : 'continent-path'}" aria-hidden="true"></svg>` : '';
      const tile = zone && !local ? `<div class="zone-tile ${geo.image ? '' : 'missing-tile'}" style="${rectStyle(layout)}">
        ${geo.image ? `<img src="${asset(geo.image)}" alt="" draggable="false">` : ''}${path}</div>` : '';
      const source = asset(local || G.continents[continent].image);
      const artwork = $('map-art');
      if (artwork.getAttribute('src') !== source) artwork.setAttribute('src', source);
      artwork.hidden = false;
      const overlays = $('map-overlays');
      overlays.innerHTML = zone ? (tile || path) : path + zoneShapes(continent, journeyStyle, chainLayer);
      travelPath = path ? { element: overlays.querySelector('.map-path'), points, layout, curved: Boolean(chainLayer && !zone) } : null;
      if ((drawnZone !== zone || drawnContinent !== continent) &&
          !matchMedia('(prefers-reduced-motion: reduce)').matches) {
        frame.getAnimations().forEach(animation => animation.cancel());
        frame.animate([{ opacity: .55 }, { opacity: 1 }], { duration: 200, easing: 'ease-out' });
      }
      drawnZone = zone;
      drawnContinent = continent;
      const badges = zone || chainLayer ? [] : zoneBadges(continent, journeyStyle);
      const pins = zonePins(zone, chainLayer);
      labels.innerHTML = `<svg id="leader-lines" class="leader-lines" aria-hidden="true"></svg>
        ${badges.map(badge => `<span class="zone-badge journey-${journeyStyle}" aria-hidden="true">${badge.text}</span>`).join('')}
        ${zone ? '' : cityMarkers(continent, chainLayer ? '' : journeyStyle)}
        ${pins.map(pin => pin.step ? `<button class="map-pin journey-pin chain-pin" data-chain-pin="${pin.step}"
          data-chain-steps="${(pin.steps || [pin.step]).join(' ')}" data-status="${pin.status}" aria-controls="chain-step-${pin.step}" aria-pressed="false"
          aria-label="${esc(pin.title)}" title="${esc(pin.title)}"><span aria-hidden="true">${pin.n}</span></button>`
          : `<button class="map-pin ${pin.journey ? 'journey-pin' : 'lore-pin'}" data-pin="${pin.key}"
          aria-label="${esc(pin.title)}" aria-controls="map-popover" aria-expanded="false">
          <span aria-hidden="true" ${pin.size ? `style="--dot-size:${pin.size}px"` : ''}>${pin.journey ? pin.place.n : ''}</span></button>`).join('')}`;
      cityNodes = [...labels.querySelectorAll('.city-marker')];
      badgeNodes = [...labels.querySelectorAll('.zone-badge')].map((element, i) => ({ ...badges[i], element }));
      pinNodes = [...labels.querySelectorAll('.map-pin')].map((element, i) => ({
        ...pins[i], element, point: innerPoint(pins[i].position, layout)
      }));
      const mapControls = $('map-controls');
      const back = zone ? anchor(mapHref(homePath(continent)),
        ui(chainLayer ? 'chainZoneOverview' : 'backContinent', { continent: continentName(continent) }), 'map-back') : '';
      const markers = [...(chainLayer?.otherContinents || [])].map(id => anchor(mapHref(homePath(id)),
        ui('chainContinues', { continent: continentName(id) }), 'map-back chain-continuation'));
      mapControls.innerHTML = back + markers.join('');
      mapKey = key;
      hideTip();
      hotZone = null;
      renderPlace();
    }
    syncChainSteps();
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

  function positionPath() {
    if (!travelPath) return;
    const { element, points, layout: [left, top, right, bottom], curved } = travelPath;
    const style = experimentValue(experiments.lines);
    if (travelPath.width === camera.width && element.dataset.style === style) return;
    travelPath.width = camera.width;
    element.dataset.style = style;
    // The SVG has no viewBox. Its user units are CSS pixels, even within a fallback zone tile.
    const width = camera.width * (right - left) / 100;
    const height = camera.width / aspect * (bottom - top) / 100;
    element.innerHTML = pathLayer(points, style, width, height, curved);
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
      positionPath();
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
  const chainPinOffsets = markerOffsets(6, 5, 35, 35);

  function positionMarkers() {
    const markers = badgeNodes.length ? badgeNodes : pinNodes;
    const occupied = [];
    const leaders = [];
    if (route.chain) {
      const bounds = map.getBoundingClientRect();
      for (const control of $('map-controls').children) {
        const rect = control.getBoundingClientRect();
        occupied.push({ x: rect.left - bounds.left + rect.width / 2, y: rect.top - bounds.top + rect.height / 2,
          w: rect.width / 2, h: rect.height / 2 });
      }
    }
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
      for (const [dx, dy] of marker.step ? chainPinOffsets : pinOffsets) {
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
      ${card ? anchor(mapHref(zonePath(id)), ui(lore ? 'readZone' : 'openZone'), 'button card-link') : ''}`;
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
    for (const item of pinNodes) {
      if (!item.step) item.element.setAttribute('aria-expanded', String(item === pin));
    }
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
    const sameChain = route.chain && route.chain === previous.chain;
    const chapterChanged = sameChain && route.chapter !== previous.chapter;
    const focusedStep = sameChain && !chapterChanged && document.activeElement?.dataset.chainStep;
    if (!sameChain) {
      state.chainSteps = [];
      state.chapterFocus = null;
    }
    const opens = route.chain !== previous.chain || route.saga !== previous.saga || route.panel !== previous.panel;
    const hasPanel = Boolean(route.chain || route.saga || route.panel);
    const hasReading = route.base.zone || hasPanel || route.missing;
    $('entry-dialog').close();
    closePlace();
    if (moved) setCameraForRoute();
    if (phone.matches && (opens || moved || chapterChanged || route.missing)) {
      if (isRecapHome() || (isChainStory() && (opens || chapterChanged))) setSnap('full');
      else if (hasReading && state.snap === 'peek') setSnap('half');
      else if (!hasReading) setSnap('peek');
    }
    const focus = opens || moved || previous.base.story !== route.base.story;
    renderHeader();
    renderReading({ keepScroll: Boolean(sameChain && !chapterChanged),
      focus: (chapterChanged || (focus && !sameChain)) && (!phone.matches || state.snap !== 'peek') });
    renderMap();
    if (focusedStep) document.querySelector(`[data-chain-step="${focusedStep}"]`)?.focus({ preventScroll: true });
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
    } else if (target.dataset.session) {
      sessionIndex += target.dataset.session === 'older' ? -1 : 1;
      $('session-recap').outerHTML = sessionRecap();
      scrollReadingTo($('session-recap'));
      $('session-title').focus({ preventScroll: true });
    } else if (target.dataset.readAhead) {
      state.readAhead.add(route.chain);
      renderReading({ keepScroll: true });
      const chapter = chapterTarget(target.dataset.readAhead);
      scrollReadingTo(chapter);
      chapter.focus({ preventScroll: true });
    } else if (target.dataset.chainPin || target.dataset.chainStep) {
      selectChainSteps(stepIds(target.dataset.chainPin || target.dataset.chainStep),
        { fromMap: Boolean(target.dataset.chainPin), chapterMap: target.dataset.chapterMap });
    } else if (target.dataset.pin) {
      openPlace(target.dataset.pin, !map.contains(target));
    } else if (target.dataset.gloss || target.dataset.figure) {
      openEntry(target.dataset.gloss ? 'gloss' : 'figure', target.dataset.gloss || target.dataset.figure, target);
    } else if (target.hasAttribute('data-dialog-close')) {
      $('entry-dialog').close();
    } else if (target.hasAttribute('data-place-close')) {
      closePlace(true);
    } else if (target.matches('a[href^="#/"]') && target.hash === location.hash && route.base.story && !route.panel && !route.saga && !route.chain) {
      const story = $('story-' + route.base.story);
      $('reading-scroll').scrollTop = story.offsetTop - 8;
    }
  });

  document.addEventListener('change', event => {
    if (event.target.id === 'continent-select') location.hash = mapHref('/' + event.target.value);
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
    } else if (route.panel || route.saga || route.chain) {
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
  if (phone.matches) {
    if (isRecapHome() || isChainStory()) setSnap('full');
    else if (route.base.zone || route.saga || route.chain || route.panel || route.missing) setSnap('half');
  }
  resizeMap();
  renderReading();
  renderMap();
  if (importError) focusJourneyImport();
  installSheetGestures();
  new ResizeObserver(resizeMap).observe(map);
})();
