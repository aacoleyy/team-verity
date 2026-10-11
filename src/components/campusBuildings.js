// Picks out the buildings to draw. The map data stores many buildings glued
// together as one shape, so hiding or coloring them one by one with a map
// style filter doesn't work. Instead this reads the building outlines once
// they've loaded, keeps only the ones that have a spot inside them (see
// src/data/keptBuildings.js), and hands those to the map as separate shapes.

import { inRing, lineDist, polygonsOf, projector } from './geo.js'

const DEFAULT_COLOR = '#e07a5f'

// Heights are evened out (12-22 m) so the blocks look chunky and tall towers
// don't hide the pins.
const toHeight = (h) => Math.min(22, Math.max(12, Number.isFinite(h) ? h : 10))

// tileFeatures: features from map.querySourceFeatures(..., { sourceLayer: 'building' }).
// spots: [{ id, name, lat, lng, color }]; custom: [{ id, name, color, height, outline }].
export function pickBuildings(tileFeatures, spots, custom, radius) {
  const { toXY } = projector(spots[0]?.lat ?? 33.75)

  // Split every multi-part shape into single outlines, skipping repeats (the
  // same building can come back once per loaded tile).
  const outlines = new Map()
  for (const f of tileFeatures) {
    for (const rings of polygonsOf(f.geometry)) {
      const outer = rings[0]
      const key = `${outer.length}:${outer[0][0].toFixed(7)},${outer[0][1].toFixed(7)}`
      if (!outlines.has(key)) {
        outlines.set(key, { rings, xy: rings.map((r) => r.map(toXY)), height: f.properties.render_height })
      }
    }
  }

  const picked = new Map()
  for (const spot of spots) {
    const p = toXY([spot.lng, spot.lat])
    let best = null
    let bestDist = radius
    for (const [key, o] of outlines) {
      const [outer, ...holes] = o.xy
      if (inRing(p, outer) && !holes.some((h) => inRing(p, h))) {
        best = key
        break
      }
      const d = lineDist(p, outer)
      if (d <= bestDist) {
        best = key
        bestDist = d
      }
    }
    if (best && !picked.has(best)) picked.set(best, spot)
  }

  const features = [...picked].map(([key, spot]) => ({
    type: 'Feature',
    properties: { id: spot.id, name: spot.name, color: spot.color ?? DEFAULT_COLOR, height: toHeight(outlines.get(key).height) },
    geometry: { type: 'Polygon', coordinates: outlines.get(key).rings },
  }))
  for (const b of custom) {
    features.push({
      type: 'Feature',
      properties: {
        id: b.id,
        name: b.name,
        color: b.color ?? DEFAULT_COLOR,
        height: toHeight(b.height),
        // Buildings with their own detailed model (library.js) are drawn by it.
        ...(b.model && { model: b.model }),
      },
      geometry: { type: 'Polygon', coordinates: [b.outline] },
    })
  }
  return { type: 'FeatureCollection', features }
}
