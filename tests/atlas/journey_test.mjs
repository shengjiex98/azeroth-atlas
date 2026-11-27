import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { runInThisContext } from 'node:vm';

for (const file of ['data/ui_map_bounds.js', 'journey.js']) {
  const source = readFileSync(new URL('../../lore/atlas/' + file, import.meta.url), 'utf8');
  runInThisContext(source, { filename: file });
}
const { decodeSummary, buildJourney, chainProgress, journeySessions, sessionStories,
  chapterProgress, chapterInterludes } = globalThis.ROSETTA_JOURNEY;
const encode = (...lines) => 'RSJ1.' + Buffer.from(lines.join('\n'), 'utf8').toString('base64url');
const header = 'H|1|Zoë|Testrealm|Gnome|Mage|Alliance|12|1700000000|1.2.3';
const journal = (...lines) => buildJourney(decodeSummary(encode(header, ...lines)));

test('v1 round-trip with UTF-8, old cells, backfilled quests, zone visits and events', () => {
  const summary = encode(
    header + '|ignored',
    'Z|1429|100|4210|1|12|1|1|6',
    'Z|1432||0|0|0|0||',
    'R|1432:,1429:100,1432:250',
    'C|1429|2|2|4100|50|12|0|0|',
    'C|1429|3|2|100|0|0|0|0|130',
    'C|1429|19|0|10|0|0|0|0|140',
    'S|1429|2|2|北郡',
    'S|1429|3|2|北郡',
    'S|1429|10|10|Goldshire',
    'X|ignored record',
    'Q||1429|500|500|123|b|ignored',
    'D|115|1429|830|820|4',
    'L|160|1429|830|820|6',
    'L|250|1432|170|240|7'
  );
  const records = decodeSummary('  ' + summary + '\n');
  assert.deepEqual(records.map(record => record.type), ['H', 'Z', 'Z', 'R', 'C', 'C', 'C', 'S', 'S', 'S', 'Q', 'D', 'L', 'L']);
  assert.deepEqual(records[0], {
    type: 'H', version: '1', name: 'Zoë', realm: 'Testrealm', race: 'Gnome', class: 'Mage',
    faction: 'Alliance', level: 12, exportedAt: 1700000000, rosettaVersion: '1.2.3'
  });
  assert.equal(records[4].firstSeen, null);
  assert.equal(records[10].flags, 'b');
  assert.deepEqual(buildJourney(records), {
    character: { name: 'Zoë', race: 'Gnome', faction: 'Alliance', class: 'Mage', level: 12, updated: 1700000000 },
    sources: ['rosetta-journal'],
    zones: [
      { zone: 1432, first: 250, levels: [7, 7], places: [], visits: [] },
      {
        zone: 1429, first: 100, levels: [1, 6],
        places: [
          { n: 1, x: 12.6, y: 12.5, label: '北郡', weight: 4200, kinds: { quests: 0, deaths: 0, seconds: 4200, steps: 0 } },
          { n: 2, x: 50, y: 50, label: 'Goldshire', weight: 120, kinds: { quests: 1, deaths: 0, seconds: 0, steps: 1 } },
          { n: 3, x: 85.1, y: 70.6, label: null, weight: 70, kinds: { quests: 0, deaths: 1, seconds: 10, steps: 0 } }
        ],
        visits: [1, 2, 3, 1, 3]
      }
    ],
    route: [1432, 1429, 1432],
    events: {
      deaths: [{ zone: 1429, x: 83, y: 82, t: 115, level: 4 }],
      levels: [{ zone: 1429, x: 83, y: 82, t: 160, level: 6 }, { zone: 1432, x: 17, y: 24, t: 250, level: 7 }],
      timed: [
        { type: 'R', map: 1429, t: 100 },
        { type: 'D', t: 115, map: 1429, x: 830, y: 820, level: 4 },
        { type: 'L', t: 160, map: 1429, x: 830, y: 820, level: 6 },
        { type: 'R', map: 1432, t: 250 },
        { type: 'L', t: 250, map: 1432, x: 170, y: 240, level: 7 }
      ]
    },
    quests: { completed: new Map([[123, { t: null, flags: 'b', map: 1429, x: 500, y: 500 }]]),
      accepted: new Map(), open: new Set() }
  });
});

test('cap merges the lightest place and numbers by first visit', () => {
  const order = [9, 0, 1, 2, 3, 4, 5, 6, 7, 8];
  const turnins = order.map((x, i) => `Q|${i + 1}|1413|${x * 100 + 50}|500|${i + 1}|`);
  const { zones } = buildJourney(decodeSummary(encode(header, ...turnins)));
  assert.equal(zones.length, 1);
  const [zone] = zones;
  assert.deepEqual(zone.places.map(place => place.n), [1, 2, 3, 4, 5, 6, 7, 8, 9]);
  assert.deepEqual(zone.places.map(place => place.x), [90, 5, 15, 25, 35, 45, 55, 65, 75]);
  assert.equal(zone.places[0].weight, 240);
  assert.equal(zone.places[0].kinds.quests, 2);
  assert.deepEqual(zone.visits, [1, 2, 3, 4, 5, 6, 7, 8, 9, 1]);
});

test('timed cells and turn-ins are ordered together and pass-throughs are removed', () => {
  const { zones } = buildJourney(decodeSummary(encode(
    header,
    'C|1429|2|2|300|0|0|0|0|50',
    'Q|10|1429|125|125|1|',
    'Q|20|1429|425|125|2|',
    'Q|30|1429|425|125|3|',
    'Q|40|1429|125|125|4|'
  )));
  assert.deepEqual(zones[0].places.map(({ n, x }) => [n, x]), [[1, 42.5], [2, 12.5]]);
  assert.deepEqual(zones[0].visits, [1, 2]);
});

test('centroids that move within 180 yards are merged', () => {
  const { zones } = buildJourney(decodeSummary(encode(
    header,
    'Q|10|1429|100|500|1|',
    'Q|20|1429|160|500|2|',
    'Q|30|1429|130|500|3|'
  )));
  assert.deepEqual(zones[0].places, [
    { n: 1, x: 13, y: 50, label: null, weight: 360, kinds: { quests: 3, deaths: 0, seconds: 0, steps: 0 } }
  ]);
});

test('malformed summaries report the documented errors', () => {
  function fails(summary, code, message) {
    assert.throws(() => decodeSummary(summary), { code, message });
  }
  fails('RSJ2.anything', 'journeyErrorPrefix', 'The summary must start with RSJ1.');
  for (const bad of ['RSJ1.', 'RSJ1.a', 'RSJ1.YQ==', 'RSJ1.Zh', 'RSJ1.Y+Q', 'RSJ1._w']) {
    fails(bad, 'journeyErrorEncoding', 'The summary has invalid base64url or UTF-8 data.');
  }
  for (const bad of [encode('Z|1429'), encode('Z|1429', header), encode(header, header)]) {
    fails(bad, 'journeyErrorHeader', 'The summary must start with a single header record.');
  }
  fails(encode('H|2|Zoë'), 'journeyErrorVersion', 'This summary format version is unsupported.');
});

test('A and O records expose quest activity separately from map observations', () => {
  const records = decodeSummary(encode(
    header, 'O|102,103,102,,bad|ignored', 'A|3||||102', 'Q|||||101|b',
    'A|6|1429|100|250|102', 'Q|9||||101|', 'Q|12||||101|'
  ));
  assert.deepEqual(records[1], { type: 'O', questIds: [102, 103, 102] });
  assert.deepEqual(records[2], { type: 'A', t: 3, map: null, x: null, y: null, questID: 102 });
  const journey = buildJourney(records);
  assert.deepEqual(journey.zones, []);
  assert.deepEqual(journey.quests, {
    completed: new Map([[101, { t: 9, flags: null, map: null, x: null, y: null }]]),
    accepted: new Map([[102, { t: 6 }]]),
    open: new Set([102, 103])
  });
});

const chain = { faction: 'Alliance', steps: [
  { id: 1, questIds: [101, 110], after: [] },
  { id: 2, questIds: [102], after: [1] },
  { id: 3, questIds: [103, 130], after: [1] },
  { id: 4, questIds: [104], after: [2, 3] },
  { id: 5, questIds: [105], after: [2] }
] };
const progress = (...lines) => chainProgress(chain, journal(...lines));
const statuses = result => [...result.steps.values()].map(step => step.status);

test('chain progress uses variants, the open log and every prerequisite, with level at turn-in', () => {
  const result = progress('Q|||||101|b', 'Q|22||||110|', 'L|24||||12',
    'L|22||||11', 'O|110,130', 'A|10||||102');
  assert.equal(result.status, 'inProgress');
  assert.equal(result.done, 1);
  assert.deepEqual(statuses(result), ['done', 'next', 'active', 'locked', 'locked']);
  assert.deepEqual(result.steps.get(1), { status: 'done', t: 22, level: 11, backfilled: false });

  const backfill = progress('Q|||||101|b');
  assert.deepEqual(backfill.steps.get(1), { status: 'done', t: null, level: null, backfilled: true });
  assert.deepEqual(statuses(backfill), ['done', 'next', 'next', 'locked', 'locked']);
  assert.equal(progress('Q|1||||101|', 'L|2||||10').steps.get(1).level, null);
});

test('chain status requires every ending and hides only the other faction', () => {
  assert.equal(progress('A|10||||101').status, 'notStarted');
  assert.deepEqual(statuses(progress()), ['next', 'locked', 'locked', 'locked', 'locked']);
  assert.equal(progress('O|110').status, 'inProgress');
  assert.equal(progress('Q|10||||104|').status, 'inProgress');
  const completed = progress('Q|10||||104|', 'Q|||||105|b');
  assert.equal(completed.status, 'completed');
  assert.equal(completed.done, 2);
  assert.equal(completed.finishedAt, 10);
  assert.equal(progress('Q|10||||104|', 'Q|20||||105|').finishedAt, 20);
  assert.equal(progress('Q|||||104|b', 'Q|||||105|b').finishedAt, null);
  const horde = buildJourney(decodeSummary(encode(header.replace('Alliance', 'Horde'))));
  assert.equal(chainProgress(chain, horde).visible, false);
  assert.equal(chainProgress({ ...chain, faction: 'Both' }, horde).visible, true);
  assert.equal(chainProgress(chain, null).visible, true);
});

test('sessions split on gaps over an hour using every timed event and report the zones with activity, levels and quests', () => {
  const journey = journal(
    'L|50|1429|100|200|10',
    'L|5000|1429|100|200|11',
    'A|8600|1432|120|220|101',
    'D|8700|1432|||11',
    'Q|8800|1433|150|250|101|',
    'R|1429:,1429:5000,1429:8650,1432:9200,1429:10100',
    'Q||1433|160|260|102|b',
    'C|1432|1|2|180|0|0|0|12500',
    'Q|13701|1433|160|260|103|'
  );
  const sessions = journeySessions(journey);
  assert.deepEqual(sessions.map(({ events, ...facts }) => facts), [
    { start: 50, end: 50, questCount: 0, route: [1429], startLevel: null, endLevel: 10 },
    { start: 5000, end: 10100, questCount: 1, route: [1429, 1432, 1433], startLevel: 10, endLevel: 11 },
    { start: 13701, end: 13701, questCount: 1, route: [1433], startLevel: 11, endLevel: 11 }
  ]);
  assert.deepEqual(sessions[1].events.map(event => event.type), ['L', 'R', 'A', 'R', 'D', 'Q', 'R', 'R']);
  assert.deepEqual(journeySessions(journal('Q||1433|160|260|102|b')), []);
});

function linearChain(...ids) {
  return { faction: 'Alliance', steps: ids.map((id, i) => ({
    id, questIds: [id], after: i ? [ids[i - 1]] : []
  })) };
}

test('session stories use timed turn-ins and accepts, prior completions and the final turn-in', () => {
  const chains = {
    advanced: linearChain(11, 12, 13),
    started: linearChain(21, 22),
    finished: linearChain(31, 32),
    accepted: linearChain(41, 42),
    ignored: linearChain(51, 52),
    backfilled: linearChain(61, 62, 63),
    later: linearChain(71, 72, 73)
  };
  const authored = { advanced: { chapters: [{ stepIds: [11] }, { stepIds: [12, 13] }] } };
  const journey = journal(
    'Q|1|1429|110|210|11|', 'A|2|1429|110|210|21', 'A|3|1429|||41',
    'Q||1429|110|210|61|b', 'Q||1429|110|210|51|b', 'O|52',
    'Q|4000|1433|115|215|31|', 'Q|4010|1433|116|216|32|',
    'Q|4020|1429|120|220|12|', 'A|4030|1432|130|230|13',
    'Q|4040|1429|140|240|21|', 'A|4050|1432|150|250|41',
    'Q|4060|1429|160|260|62|', 'Q|4070|1429|170|270|71|',
    'Q|8000|1429|180|280|73|'
  );
  const [, session] = journeySessions(journey);
  const stories = sessionStories(session, chains, journey, authored);
  assert.deepEqual(stories.map(({ id, status, questCount }) => [id, status, questCount]), [
    ['later', 'started', 1], ['backfilled', 'advanced', 1], ['accepted', 'started', 0],
    ['started', 'started', 1], ['advanced', 'advanced', 1], ['finished', 'finished', 2]
  ]);
  assert.deepEqual(stories.find(story => story.id === 'advanced'), {
    id: 'advanced', status: 'advanced', chapter: 1, latest: { t: 4030, map: 1432, x: 130, y: 230 }, questCount: 1
  });
  assert.equal(stories.find(story => story.id === 'accepted').latest.t, 4050);
});

test('chapters retain timed turn-ins in time order and backfilled positions', () => {
  const chapters = [{ stepIds: [1, 2, 3] }, { stepIds: [4] }, { stepIds: [5] }];
  const journey = journal(
    'Q|150|1433|320|520|102|', 'Q|100|1429|200|400|110|',
    'L|90||||9', 'L|150||||10',
    'Q||1433|300|500|103|b', 'Q||1433|0|1000|104|b', 'A|200|1433|400|600|105'
  );
  assert.deepEqual(chapterProgress(chain, chapters, journey), [
    { played: true, timed: [
      { t: 100, level: 9, map: 1429, x: 200, y: 400 }, { t: 150, level: 10, map: 1433, x: 320, y: 520 }
    ], backfilled: [{ map: 1433, x: 300, y: 500 }] },
    { played: true, timed: [], backfilled: [{ map: 1433, x: 0, y: 1000 }] },
    { played: false, timed: [], backfilled: [] }
  ]);
});

test('interludes distinguish endings inside a chapter window from other turn-ins', () => {
  const chains = {
    main: linearChain(1, 2),
    advanced: linearChain(11, 12),
    ended: linearChain(21, 22),
    acceptOnly: linearChain(31, 32),
    backfilled: linearChain(41, 42),
    outside: linearChain(51, 52)
  };
  const journey = journal(
    'Q|10|1429|100|200|1|', 'Q|30|1433|110|210|2|',
    'Q|12|1433|130|230|11|', 'Q|35|1433|130|230|12|',
    'Q|15|1433|120|220|21|', 'Q|30|1433|120|220|22|',
    'A|17|1433|130|230|31', 'Q||1433|130|230|42|b', 'Q|31|1433|130|230|52|'
  );
  const [chapter] = chapterProgress(chains.main, [{ stepIds: [1, 2] }], journey);
  assert.deepEqual(chapterInterludes(chapter, 'main', chains, journey), [
    { id: 'advanced', status: 'advanced', t: 12 }, { id: 'ended', status: 'ended', t: 30 }
  ]);
  assert.deepEqual(chapterInterludes({ ...chapter, timed: chapter.timed.slice(0, 1) }, 'main', chains, journey), []);
});
