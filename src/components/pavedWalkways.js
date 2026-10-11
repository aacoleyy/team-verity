// The wide paved walkways and the winding path p drew (src/data/campusExtras.js)
// as GeoJSON: one plain shape per walkway.

import { boxRing, polygon, projector } from './geo.js'

export function makePavedWalkways(walkways, areas) {
  const { toXY, toLngLat } = projector(walkways[0]?.from[1] ?? 33.75)
  const shapes = []
  for (const w of walkways) {
    const a = toXY(w.from)
    const b = toXY(w.to)
    const len = Math.hypot(b[0] - a[0], b[1] - a[1])
    const dir = [(b[0] - a[0]) / len, (b[1] - a[1]) / len]
    const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
    shapes.push(polygon(boxRing(mid, dir, len, w.width, toLngLat), { name: w.name }))
  }
  for (const area of areas) shapes.push(polygon(area.outline, { name: area.id }))
  return {
    shapes: { type: 'FeatureCollection', features: shapes },
  }
}
