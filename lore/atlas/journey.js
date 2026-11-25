(function (root) {
  'use strict';

  const fields = {
    H: ['version', 'name', 'realm', 'race', 'class', 'faction', 'level', 'exportedAt', 'rosettaVersion'],
    Z: ['map', 'firstVisit', 'seconds', 'quests', 'kills', 'deaths', 'minLevel', 'maxLevel'],
    C: ['map', 'cx', 'cy', 'seconds', 'killXP', 'kills', 'questXP', 'otherXP', 'firstSeen'],
    Q: ['t', 'map', 'x', 'y', 'questID', 'flags'],
    D: ['t', 'map', 'x', 'y', 'level'],
    L: ['t', 'map', 'x', 'y', 'level'],
    S: ['map', 'cx', 'cy', 'name'],
    R: ['visits']
  };
  const textFields = new Set(['version', 'name', 'realm', 'race', 'class', 'faction', 'rosettaVersion', 'flags']);
  const prefix = 'RSJ1.';
  const radiusSquared = 180 ** 2;
  const minimumShare = .03;
  const maximumPlaces = 9;

  function summaryError(code, message) {
    return Object.assign(new Error(message), { code });
  }

  function integer(value) {
    const number = Number(value);
    return /^\d+$/.test(value) && Number.isSafeInteger(number) ? number : null;
  }

  function decodeSummary(summary) {
    const input = typeof summary === 'string' ? summary.trim() : '';
    if (!input.startsWith(prefix)) {
      throw summaryError('journeyErrorPrefix', 'The summary must start with RSJ1.');
    }
    const payload = input.slice(prefix.length);
    let decoded;
    try {
      if (!/^[A-Za-z0-9_-]+$/.test(payload)) throw new Error();
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const bytes = atob(base64);
      if (btoa(bytes).replace(/=+$/, '') !== base64) throw new Error();
      decoded = new TextDecoder('utf-8', { fatal: true }).decode(Uint8Array.from(bytes, byte => byte.charCodeAt(0)));
    } catch (_) {
      throw summaryError('journeyErrorEncoding', 'The summary has invalid base64url or UTF-8 data.');
    }
    const rows = decoded.split('\n').map(line => line.split('|'));
    if (rows[0][0] !== 'H' || rows.slice(1).some(row => row[0] === 'H')) {
      throw summaryError('journeyErrorHeader', 'The summary must start with a single header record.');
    }
    if (rows[0][1] !== '1') {
      throw summaryError('journeyErrorVersion', 'This summary format version is unsupported.');
    }
    return rows.filter(([type]) => Object.hasOwn(fields, type)).map(([type, ...values]) => {
      const record = { type };
      for (const [i, field] of fields[type].entries()) {
        const value = values[i] ?? '';
        if (field === 'visits') {
          record.visits = value.split(',').filter(Boolean).map(pair => {
            const [map, time = ''] = pair.split(':');
            return { map: integer(map), t: integer(time) };
          });
        } else {
          record[field] = textFields.has(field) ? value || null : integer(value);
        }
      }
      return record;
    });
  }

  const cellKey = (map, cx, cy) => map + ':' + cx + ':' + cy;
  const inRange = (value, max) => Number.isInteger(value) && value >= 0 && value <= max;
  const cellIndex = value => Math.min(19, Math.floor(value / 50));
  const timeOrder = (a, b) => (a.t ?? -1) - (b.t ?? -1);
  const oneDecimal = value => Number(value.toFixed(1));
  const hasBounds = map => Object.hasOwn(JOURNEY_ZONE_BOUNDS, map);

  function observation(record, labels) {
    const { type, map, t, x, y, cx, cy, level } = record;
    if (map === null) return null;
    if (type === 'C' && inRange(cx, 19) && inRange(cy, 19)) {
      return { zone: map, x: (cx + .5) * 5, y: (cy + .5) * 5, t: record.firstSeen,
        w: record.seconds ?? 0, kind: 'cell', label: labels.get(cellKey(map, cx, cy)) };
    }
    if (!['Q', 'D', 'L'].includes(type) || !inRange(x, 1000) || !inRange(y, 1000)) return null;
    return { zone: map, x: x / 10, y: y / 10, t, level,
      w: type === 'Q' ? 120 : type === 'D' ? 60 : 0,
      kind: { Q: 'turnin', D: 'death', L: 'level' }[type],
      label: labels.get(cellKey(map, cellIndex(x), cellIndex(y))) };
  }

  function cluster(zone, observations) {
    const [minX, minY, maxX, maxY] = JOURNEY_ZONE_BOUNDS[zone];
    // The map's horizontal axis spans world Y, and its vertical axis spans world X.
    const xScale = (maxY - minY) / 100;
    const yScale = (maxX - minX) / 100;
    const distance = (a, b) => ((a.x - b.x) * xScale) ** 2 + ((a.y - b.y) * yScale) ** 2;
    const places = [];
    function accumulate(place, weight, sx, sy) {
      place.w += weight;
      place.sx += sx;
      place.sy += sy;
      if (place.w) {
        place.x = place.sx / place.w;
        place.y = place.sy / place.w;
      }
    }
    function nearest(point, limit = Infinity, lastOnTie = false) {
      let best;
      for (const place of places) {
        if (place === point) continue;
        const d = distance(place, point);
        // The leader pass favors the last place on a tie. Merges favor the first.
        if (d < limit || (d === limit && (!best || lastOnTie))) {
          best = place;
          limit = d;
        }
      }
      return best;
    }
    function merge(keep, drop) {
      keep.members = keep.members.concat(drop.members);
      keep.first = Math.min(keep.first, drop.first);
      accumulate(keep, drop.w, drop.sx, drop.sy);
      places.splice(places.indexOf(drop), 1);
    }

    for (const [first, point] of observations.entries()) {
      let place = nearest(point, radiusSquared, true);
      if (!place) {
        place = { x: point.x, y: point.y, w: 0, sx: 0, sy: 0, first, members: [] };
        places.push(place);
      }
      place.members.push(point);
      accumulate(place, point.w, point.x * point.w, point.y * point.w);
    }

    // Keep looking from the beginning after each merge because a centroid has moved.
    let neighbors;
    do {
      neighbors = null;
      for (const place of places) {
        const other = places.find(p => p !== place && distance(p, place) < radiusSquared);
        if (other) {
          neighbors = place.w >= other.w ? [place, other] : [other, place];
          merge(...neighbors);
          break;
        }
      }
    } while (neighbors);

    const total = places.reduce((sum, place) => sum + place.w, 0) || 1;
    const byWeight = (a, b) => a.w - b.w;
    const small = places.filter(place => place.w < total * minimumShare &&
      !place.members.some(point => point.kind === 'turnin' || point.kind === 'death')).sort(byWeight);
    for (const place of small) {
      if (places.length > 1) merge(nearest(place), place);
    }
    while (places.length > maximumPlaces) {
      const lightest = places.reduce((a, b) => byWeight(a, b) <= 0 ? a : b);
      merge(nearest(lightest), lightest);
    }
    return places.sort((a, b) => a.first - b.first);
  }

  function visitSequence(observations, places) {
    const owners = new Map();
    for (const place of places) {
      for (const point of place.members) owners.set(point, place);
    }
    const runs = [];
    const longest = new Map();
    for (const point of observations) {
      const place = owners.get(point);
      if (runs.at(-1)?.place !== place) runs.push({ place, count: 0 });
      const count = ++runs.at(-1).count;
      longest.set(place, Math.max(longest.get(place) || 0, count));
    }
    // A single observation is a pass-through if the same place has a longer run elsewhere.
    const stops = runs.filter(({ place, count }) => count > 1 || longest.get(place) === 1).map(run => run.place);
    return stops.filter((place, i) => place !== stops[i - 1]);
  }

  function describePlace(place, i) {
    const kinds = { quests: 0, deaths: 0, seconds: 0, steps: 0 };
    const labels = new Map();
    for (const point of place.members) {
      if (point.label) labels.set(point.label, (labels.get(point.label) || 0) + 1);
      if (point.kind === 'cell') kinds.seconds += point.w;
      if (point.kind === 'turnin') {
        kinds.quests++;
        if (point.t === null) kinds.steps++;
      }
      if (point.kind === 'death') kinds.deaths++;
    }
    let label = null;
    for (const [name, count] of labels) {
      if (count > (labels.get(label) || 0)) label = name;
    }
    return { n: i + 1, x: oneDecimal(place.x), y: oneDecimal(place.y), label, weight: place.w, kinds };
  }

  function buildJourney(records) {
    const [header] = records;
    const labels = new Map(records.filter(record => record.type === 'S' && record.name)
      .map(({ map, cx, cy, name }) => [cellKey(map, cx, cy), name]));
    const stats = new Map(records.filter(record => record.type === 'Z' && record.map !== null)
      .map(record => [record.map, record]));
    // Array sorting is stable, so untimed observations and ties keep their string order.
    const timeline = records.map(record => observation(record, labels)).filter(Boolean).sort(timeOrder);
    const visits = records.filter(record => record.type === 'R').flatMap(record => record.visits)
      .filter(visit => visit.map !== null);
    const activity = [...stats.values()].map(record => ({ map: record.map, t: record.firstVisit }))
      .concat(timeline.map(point => ({ map: point.zone, t: point.t }))).sort(timeOrder);
    const route = (visits.length ? visits : activity).map(visit => visit.map)
      .filter((map, i, maps) => map !== maps[i - 1]);

    const zoneData = new Map([...new Set(route.concat(activity.map(visit => visit.map)))]
      .filter(hasBounds).map(map => [map, { first: null, observations: [], levels: [] }]));
    const events = { deaths: [], levels: [] };
    for (const { map, t } of activity.concat(visits).sort(timeOrder)) {
      const data = zoneData.get(map);
      if (data && t !== null) data.first ??= t;
    }
    for (const point of timeline) {
      const { zone, x, y, t, level, kind } = point;
      const data = zoneData.get(zone);
      if (kind === 'death') events.deaths.push({ zone, x, y, t, level });
      if (kind === 'level') {
        events.levels.push({ zone, x, y, t, level });
        if (data && level !== null) data.levels.push(level);
      } else {
        data?.observations.push(point);
      }
    }

    const zones = [];
    for (const [zone, data] of zoneData) {
      const stat = stats.get(zone);
      const minLevel = stat?.minLevel ?? (data.levels.length ? Math.min(...data.levels) : null);
      const maxLevel = stat?.maxLevel ?? (data.levels.length ? Math.max(...data.levels) : null);
      const places = cluster(zone, data.observations);
      const sequence = visitSequence(data.observations, places);
      const ordered = [...new Set(sequence.concat(places))];
      const numbers = new Map(ordered.map((place, i) => [place, i + 1]));
      zones.push({
        zone, first: stat?.firstVisit ?? data.first, levels: minLevel === null && maxLevel === null ? null :
          [minLevel ?? maxLevel, maxLevel ?? minLevel],
        places: ordered.map(describePlace), visits: sequence.map(place => numbers.get(place))
      });
    }
    const { name, race, level, exportedAt } = header;
    return {
      character: { name, race, class: header.class, level, updated: exportedAt },
      sources: ['rosetta-journal'], zones, route, events
    };
  }

  root.ROSETTA_JOURNEY = { decodeSummary, buildJourney };
})(globalThis);
