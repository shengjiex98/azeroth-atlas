import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { createContext, runInContext } from 'node:vm';

const context = createContext({});
for (const file of ['data/world.js', 'data/chains.js', 'data/geo.js', 'i18n.js']) {
  const source = readFileSync(new URL('../../lore/atlas/' + file, import.meta.url), 'utf8');
  runInContext(source, context, { filename: file });
}
const { WORLD, CHAINS, GEO, LORE_UI, LORE_ZONE_NAMES } = runInContext(
  '({ WORLD, CHAINS, GEO, LORE_UI, LORE_ZONE_NAMES })', context
);

test('every map zone has complete bilingual lore and a matching brief', () => {
  const problems = [];
  for (const [id, geo] of Object.entries(GEO.zones)) {
    // The renderer routes these continent frames to the continent view.
    if (id === '1463' || id === '1464') continue;
    const zone = WORLD.zones[id];
    if (!zone) {
      problems.push(`Zone ${id} has no lore entry`);
      continue;
    }
    if (zone.complete !== true) problems.push(`Zone ${id} is incomplete`);
    if (zone.map !== geo.image) problems.push(`Zone ${id} does not match the map image`);
    for (const language of ['en', 'zh']) {
      if (!zone.name[language] || zone.name[language] !== LORE_ZONE_NAMES[id]?.[language]) {
        problems.push(`Zone ${id} does not match its ${language} display name`);
      }
    }
    const brief = WORLD.briefs[id];
    if (!brief || (brief.levels && ['en', 'zh'].some(language => brief.levels[language] !== zone.levels[language]))) {
      problems.push(`Zone ${id} is missing its brief or has conflicting levels`);
    }
    for (const field of ['overview', 'places', 'history', 'storylines', 'sourceIds']) {
      if (!zone[field]?.length) problems.push(`Zone ${id} has no ${field}`);
    }
  }
  assert.deepEqual(problems, []);
});

const references = {
  beatIds: WORLD.beats,
  figureIds: WORLD.figures,
  factionIds: WORLD.factions,
  sagaIds: WORLD.sagas,
  relatedSagaIds: WORLD.sagas,
  sourceIds: WORLD.sources,
  zoneIds: WORLD.zones,
  relatedZoneIds: WORLD.zones,
  glossaryId: WORLD.glossary,
  glossaryIds: WORLD.glossary
};
const glossaryNames = new Set(Object.values(WORLD.glossary).flatMap(entry =>
  [entry.name.en, entry.name.zh].map(name => name.replaceAll('’', "'"))
));

function checkData(value, path, problems) {
  if (value === null || typeof value !== 'object') return;

  if (Object.hasOwn(value, 'en') || Object.hasOwn(value, 'zh')) {
    for (const language of ['en', 'zh']) {
      const translation = value[language];
      if (typeof translation !== 'string' || !translation.trim()) {
        problems.push(`${path} has an empty ${language} translation`);
      } else if (path.startsWith('WORLD.')) {
        for (const [, term] of translation.matchAll(/\{([^{}]+)\}/g)) {
          if (!glossaryNames.has(term.replaceAll('’', "'"))) {
            problems.push(`${path}.${language} has an unknown glossary term ${term}`);
          }
        }
      }
    }
  }

  for (const [field, child] of Object.entries(value)) {
    const fieldPath = `${path}.${field}`;
    if (Object.hasOwn(references, field) && child != null && !(field === 'zoneIds' && path.startsWith('CHAINS.'))) {
      for (const id of Array.isArray(child) ? child : [child]) {
        if (!Object.hasOwn(references[field], id)) problems.push(`${fieldPath} references unknown ID ${id}`);
      }
    }
    checkData(child, fieldPath, problems);
  }
}

test('lore and interface translations are nonempty and all lore references resolve', () => {
  const problems = [];
  for (const [name, table] of Object.entries({ WORLD, LORE_UI, LORE_ZONE_NAMES })) {
    checkData(table, name, problems);
  }
  assert.deepEqual(problems, []);
});

test('every place has both coordinates inside its zone map', () => {
  const problems = [];
  for (const zone of Object.values(WORLD.zones)) {
    for (const place of zone.places) {
      if (![place.x, place.y].every(axis => Number.isFinite(axis) && axis >= 0 && axis <= 100)) {
        problems.push(`Zone ${zone.id}, place ${place.id}: invalid point (${place.x}, ${place.y})`);
      }
    }
  }
  assert.deepEqual(problems, []);
});

const { zones: gameZones } = JSON.parse(readFileSync(
  new URL('../../tools/data/forever_maps.json', import.meta.url), 'utf8'
));
const capitalIds = new Set(['1453', '1454', '1455', '1456', '1457', '1458']);

test('zone outlines stay inside the game rectangles with a one percent margin', () => {
  const problems = [];
  for (const [id, game] of Object.entries(gameZones)) {
    const zone = GEO.zones[id];
    if (!zone) {
      problems.push(`Map ${id} is missing from the atlas`);
      continue;
    }
    const [left, top, right, bottom] = game.rect.map(edge => edge * 100);
    if (zone.continent !== String(game.continent) ||
        zone.rect.some((edge, index) => Math.abs(edge - game.rect[index] * 100) > 0.00501)) {
      problems.push(`Map ${id} does not match its game rectangle`);
    }
    if (capitalIds.has(id)) {
      if (zone.path) problems.push(`Capital ${id} has a zone outline`);
      continue;
    }

    const points = [...(zone.path || '').matchAll(/[ML](-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g)];
    if (!points.length) {
      problems.push(`Zone ${id} has no outline points`);
      continue;
    }
    // The tracer uses 1% of each continent axis. Its SVG coordinates are rounded to two decimals.
    const margin = 1.005;
    const xs = points.map(point => Number(point[1]));
    const ys = points.map(point => Number(point[2]));
    const bounds = [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
    if (bounds[0] < left - margin || bounds[1] < top - margin ||
        bounds[2] > right + margin || bounds[3] > bottom + margin) {
      problems.push(`Zone ${id} outline bounds (${bounds.join(', ')}) exceed its game rectangle`);
    }
  }
  for (const [id, zone] of Object.entries(GEO.zones)) {
    if (zone.path && !Object.hasOwn(gameZones, id)) {
      problems.push(`Zone ${id} has an outline but no game rectangle`);
    }
  }
  assert.deepEqual(problems, []);
});

test('the picked chains and their authored lore share valid IDs', () => {
  const { picks } = JSON.parse(readFileSync(new URL('../../tools/data/chain_picks.json', import.meta.url), 'utf8'));
  const ids = picks.map(pick => pick.id).sort();
  assert.deepEqual(Object.keys(CHAINS).sort(), ids);
  assert.deepEqual(Object.keys(WORLD.chains).sort(), ids);
  function localized(value, path) {
    for (const language of ['en', 'zh']) {
      assert.ok(typeof value?.[language] === 'string' && value[language].trim(), `${path} is missing ${language}`);
    }
  }
  for (const [id, { hook, chapters, meaning, cast, links, sourceIds }] of Object.entries(WORLD.chains)) {
    if (hook !== null) localized(hook, `${id} hook`);
    if (chapters.length) {
      assert.deepEqual(Array.from(chapters.flatMap(chapter => chapter.stepIds)),
        Array.from(CHAINS[id].steps, step => step.id), `${id} chapters must partition its steps in order`);
    }
    for (const chapter of chapters) {
      assert.ok(chapter.stepIds.length, `${id} has a chapter with no steps`);
      localized(chapter.title, `${id} chapter title`);
      localized(chapter.recap, `${id} chapter recap`);
      for (const paragraph of chapter.text) {
        if (Object.hasOwn(paragraph, 'quote')) {
          localized(paragraph.quote, `${id} quote`);
          localized(paragraph.by, `${id} quote attribution`);
        } else {
          localized(paragraph, `${id} chapter paragraph`);
        }
      }
    }
    if (meaning !== null) {
      localized(meaning.title, `${id} meaning title`);
      for (const paragraph of meaning.text) localized(paragraph, `${id} meaning paragraph`);
    }
    assert.equal(new Set(cast.map(person => person.id)).size, cast.length, `${id} repeats a cast ID`);
    for (const person of cast) {
      assert.ok(person.id, `${id} has a cast member with no ID`);
      assert.ok(Number.isInteger(person.chapter) && person.chapter >= 1 && person.chapter <= chapters.length, `${id} cast ${person.id} needs a first chapter`);
      localized(person.name, `${id} cast name`);
      localized(person.role, `${id} cast role`);
    }
    for (const link of links) assert.ok(Object.hasOwn(CHAINS, link), `${id} links to unknown chain ${link}`);
    for (const source of sourceIds) assert.ok(Object.hasOwn(WORLD.sources, source), `${id} cites unknown source ${source}`);
  }
});

test('the site chains have ordered steps and representative map points', () => {
  for (const chain of Object.values(CHAINS)) {
    const seen = new Set();
    const maps = new Set();
    for (const step of chain.steps) {
      assert.ok(!seen.has(step.id), `${chain.id} repeats step ${step.id}`);
      assert.ok(step.after.every(id => seen.has(id)), `${chain.id} has steps out of order`);
      seen.add(step.id);
      assert.ok(step.questIds.length > 0);
      for (const { map, x, y } of [step.giver, ...step.goals, step.turnIn].filter(point => point?.map != null)) {
        assert.ok(Object.hasOwn(GEO.zones, map) || Object.hasOwn(GEO.continents, map), `Unknown map ${map}`);
        maps.add(map);
        assert.ok([x, y].every(axis => Number.isInteger(axis) && axis >= 0 && axis <= 1000));
      }
      assert.ok(step.goals.every(goal => goal.map != null && ['kill', 'loot', 'use', 'talk', 'other'].includes(goal.kind)));
    }
    assert.deepEqual([...chain.zoneIds], [...maps]);
    assert.equal(chain.signals.steps, seen.size);
    assert.equal(chain.signals.maps, maps.size);
  }
  const problems = [];
  checkData(CHAINS, 'CHAINS', problems);
  assert.deepEqual(problems, []);
});
