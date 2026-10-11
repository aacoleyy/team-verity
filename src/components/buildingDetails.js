// Storybook details for the plain buildings, after p's style pictures (10 Oct
// 2026): pale walls under a colored roof, a white parapet with a soft shadow
// line under it, rows of framed windows, a front door with an awning, air
// units on the roof, and hedges along the walls. Only walls the camera can
// see get windows and hedges (the map always looks south).

import { inRing, lineDist, polygon, polygonsOf, projector, rng } from './geo.js'

const WALL_TINT = '#fff8ec'
const GLASS = '#86bde0'
const FRAME = '#fdfaf4'
const DOOR = '#8a5a3b'
const ROOF_UNIT = '#e8ebee'
const HEDGE = '#5aa548'

const FLOOR = 3.4 // meters between rows of windows
const BAY = 3.4 // meters between windows along a wall

// Mixes two #rrggbb colors: k = 0 gives a, k = 1 gives b.
export function mix(a, b, k) {
  const ca = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16))
  const cb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16))
  return `#${ca.map((v, i) => Math.round(v + (cb[i] - v) * k).toString(16).padStart(2, '0')).join('')}`
}

const hash = (text) => [...text].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) | 0, 7)

// buildings: GeoJSON from pickBuildings. avoid: GeoJSON polygon features to
// keep hedges off (walkways, plazas). keepClear: [{ lng, lat, r }] spots to
// keep hedges away from (pins, benches).
// Returns { buildings } with a `wall` color added to each, and { shapes }.
export function makeBuildingDetails(buildings, { avoid = [], keepClear = [] } = {}) {
  const lat0 = buildings.features[0]?.geometry.coordinates[0][0][1] ?? 33.75
  const { toXY, toLngLat } = projector(lat0)
  const avoidRings = avoid.flatMap((f) => polygonsOf(f.geometry).map((rings) => rings[0].map(toXY)))
  const clear = keepClear.map((c) => ({ p: toXY([c.lng, c.lat]), r: c.r }))
  const plain = buildings.features.filter((f) => !f.properties.model)
  const rings = buildings.features.flatMap((f) => polygonsOf(f.geometry).map((r) => r[0].map(toXY)))

  const shapes = []
  const add = (ring, color, base, top) => shapes.push(polygon(ring.map(toLngLat), { color, base, top }))

  for (const f of plain) {
    const { color, height: h, id } = f.properties
    const rand = rng(hash(String(id)))
    for (const [outer] of polygonsOf(f.geometry)) {
      const ring = outer.map(toXY)
      let area = 0
      for (let i = 1; i < ring.length; i++) area += ring[i - 1][0] * ring[i][1] - ring[i][0] * ring[i - 1][1]
      area /= 2
      const walls = []
      for (let i = 1; i < ring.length; i++) {
        const a = ring[i - 1]
        const b = ring[i]
        const len = Math.hypot(b[0] - a[0], b[1] - a[1])
        if (len < 1) continue
        const d = [(b[0] - a[0]) / len, (b[1] - a[1]) / len]
        walls.push({ a, d, len, out: area < 0 ? [-d[1], d[0]] : [d[1], -d[0]] })
      }
      // A box against wall w: from k0 to k1 along it, s0 to s1 out from it.
      const quad = (w, k0, k1, s0, s1) => {
        const p = (k, s) => [w.a[0] + w.d[0] * k + w.out[0] * s, w.a[1] + w.d[1] * k + w.out[1] * s]
        return [p(k0, s0), p(k1, s0), p(k1, s1), p(k0, s1), p(k0, s0)]
      }

      // Parapet and the shadow line under it, all the way around.
      for (const w of walls) {
        add(quad(w, -0.25, w.len + 0.25, -0.5, 0.25), mix(color, '#ffffff', 0.72), h, h + 0.9)
        add(quad(w, 0, w.len, 0, 0.06), mix(color, '#3b3430', 0.45), h - 0.35, h)
      }

      const seen = walls.filter((w) => w.out[1] > -0.3 && w.len >= 5)
      // The front door goes on the widest wall facing the camera.
      const front = seen.reduce((best, w) => (!best || w.len * (w.out[1] + 1) > best.len * (best.out[1] + 1) ? w : best), null)
      for (const w of seen) {
        const n = Math.max(1, Math.round((w.len - 1.5) / BAY))
        const door = w === front && w.len >= 6 ? Math.floor(n / 2) : -1
        for (let k = 0; k < n; k++) {
          const c = (w.len * (k + 0.5)) / n
          for (let z = 1.1; z + 1.9 < h - 1; z += FLOOR) {
            if (k === door && z < 2) continue
            add(quad(w, c - 0.95, c + 0.95, 0, 0.1), FRAME, z - 0.2, z + 2.1)
            add(quad(w, c - 0.75, c + 0.75, 0, 0.2), GLASS, z, z + 1.9)
          }
        }
        if (door >= 0) {
          const c = (w.len * (door + 0.5)) / n
          add(quad(w, c - 1.1, c + 1.1, 0, 0.1), FRAME, 0, 2.9)
          add(quad(w, c - 0.9, c + 0.9, 0, 0.16), DOOR, 0, 2.7)
          add(quad(w, c - 1.6, c + 1.6, 0, 1.3), mix(color, '#3b3430', 0.15), 3.05, 3.4)
        }
        // Hedges along the wall, with gaps, kept off paths, plazas, other
        // buildings, the door and the spots in keepClear.
        for (let k = 1; k + 3.2 < w.len - 1; k += 4.4) {
          const doorAt = door >= 0 ? (w.len * (door + 0.5)) / n : -99
          if (Math.abs(k + 1.6 - doorAt) < 3.2) continue
          const box = quad(w, k, k + 3.2, 1.2, 2.3)
          const probes = [box[0], box[1], box[2], box[3], [(box[0][0] + box[2][0]) / 2, (box[0][1] + box[2][1]) / 2]]
          const blocked = probes.some(
            (p) =>
              avoidRings.some((r) => inRing(p, r)) ||
              rings.some((r) => inRing(p, r)) ||
              clear.some((c) => Math.hypot(p[0] - c.p[0], p[1] - c.p[1]) < c.r),
          )
          if (!blocked) add(box, HEDGE, 0, 1.1)
        }
      }

      // Air units on bigger roofs.
      const longest = walls.reduce((best, w) => (!best || w.len > best.len ? w : best), null)
      const units = Math.abs(area) > 300 ? Math.min(3, Math.floor(Math.abs(area) / 900) + 1) : 0
      const xs = ring.map((p) => p[0])
      const ys = ring.map((p) => p[1])
      const placed = []
      for (let tries = 0; tries < 40 && placed.length < units && longest; tries++) {
        const p = [
          Math.min(...xs) + rand() * (Math.max(...xs) - Math.min(...xs)),
          Math.min(...ys) + rand() * (Math.max(...ys) - Math.min(...ys)),
        ]
        if (!inRing(p, ring) || lineDist(p, ring) < 3.5 || placed.some((q) => Math.hypot(p[0] - q[0], p[1] - q[1]) < 6)) continue
        placed.push(p)
        const [dx, dy] = longest.d
        const corner = (a, b) => [p[0] + dx * a - dy * b, p[1] + dy * a + dx * b]
        const unit = [corner(-1.5, -1), corner(1.5, -1), corner(1.5, 1), corner(-1.5, 1), corner(-1.5, -1)]
        add(unit, ROOF_UNIT, h + 0.3, h + 1.6)
      }
    }
  }

  return {
    buildings: {
      ...buildings,
      features: buildings.features.map((f) =>
        f.properties.model ? f : { ...f, properties: { ...f.properties, wall: mix(f.properties.color, WALL_TINT, 0.45) } },
      ),
    },
    shapes: { type: 'FeatureCollection', features: shapes },
  }
}
