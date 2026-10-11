// A cartoon 3D model of Langdale Hall, after p's photos (11 Oct 2026): a tall
// cream concrete tower on a recessed glass ground floor. Deep cream fins split
// each face into bays filled with dark brown-gray panels crossed by cream floor
// lines, the top floors have rows of windows instead, and a heavy cream
// cornice caps it. Green trees stand on the lawn in front, like the photo.

import { circleRing, inRing, polygon, polygonsOf, projector } from './geo.js'

const CREAM = '#ece4d3'
const FIN = '#f5efe2'
const PANEL = '#8d7f74'
const GLASS = '#4e6f7c'
const WINDOW = '#3f5a70'
const ROOF = '#cfcac0'
const PENTHOUSE = '#e2ddd3'
const TRUNK = '#8a5a3b'
const TREES = [
  ['#52bd3a', '#86dc58'],
  ['#5cc641', '#94e463'],
  ['#4aaf36', '#7ed352'],
]

const BASE = 4.5 // top of the glass ground floor
const BAY = 4.2 // meters between fins
const FLOOR = 3.4

// building: the Langdale entry from customBuildings ({ outline, height }).
// avoid: GeoJSON polygons the trees must stay off (walkways, plazas).
// Returns { shapes, ground } like makeLibrary.
export function makeLangdale(building, avoid = []) {
  const { toXY, toLngLat } = projector(building.outline[0][1])
  const outline = building.outline.map(toXY)
  const avoidRings = avoid.flatMap((f) => polygonsOf(f.geometry).map((rings) => rings[0].map(toXY)))
  const H = building.height
  const shapes = []
  const add = (ring, color, base, top) => shapes.push(polygon(ring, { color, base, top }))

  let area = 0
  for (let i = 1; i < outline.length; i++) area += outline[i - 1][0] * outline[i][1] - outline[i][0] * outline[i - 1][1]
  const walls = []
  for (let i = 1; i < outline.length; i++) {
    const a = outline[i - 1]
    const b = outline[i]
    const len = Math.hypot(b[0] - a[0], b[1] - a[1])
    if (len < 0.5) continue
    const d = [(b[0] - a[0]) / len, (b[1] - a[1]) / len]
    walls.push({ a, d, len, out: area < 0 ? [-d[1], d[0]] : [d[1], -d[0]] })
  }
  const wallBox = (w, k0, k1, s0, s1, color, base, top) => {
    const p = (k, s) => toLngLat([w.a[0] + w.d[0] * k + w.out[0] * s, w.a[1] + w.d[1] * k + w.out[1] * s])
    add([p(k0, s0), p(k1, s0), p(k1, s1), p(k0, s1), p(k0, s0)], color, base, top)
  }

  // The glass ground floor, the cream tower on it, the roof and cornice.
  add(building.outline, GLASS, 0, BASE)
  add(building.outline, CREAM, BASE, H)
  add(building.outline, ROOF, H, H + 0.5)
  for (const w of walls) wallBox(w, -0.45, w.len + 0.45, -0.7, 0.55, FIN, H - 1.2, H + 1.4)

  // The faces the camera sees (it always looks south, so north faces).
  const windowsFrom = H - 3 * FLOOR - 1.4
  for (const w of walls.filter((w) => w.out[1] > -0.3 && w.len >= 3)) {
    const n = Math.max(1, Math.round(w.len / BAY))
    const bay = w.len / n
    for (let k = 0; k <= n; k++) {
      const c = k * bay
      // Fins run the full height; at the bottom they become columns.
      wallBox(w, c - 0.3, c + 0.3, 0, 0.75, FIN, 0, H - 1.2)
    }
    for (let k = 0; k < n; k++) {
      const k0 = k * bay + 0.3
      const k1 = (k + 1) * bay - 0.3
      // Brown-gray panels with a cream line at each floor.
      wallBox(w, k0, k1, 0, 0.12, PANEL, BASE + 0.6, windowsFrom)
      for (let z = BASE + 0.6 + FLOOR; z < windowsFrom; z += FLOOR) wallBox(w, k0, k1, 0, 0.2, CREAM, z - 0.2, z + 0.15)
      // Two windows per bay on each of the top floors.
      const half = (k1 - k0) / 2
      for (let z = windowsFrom + 0.6; z + 1.9 < H - 1.2; z += FLOOR) {
        for (const j of [0, 1]) wallBox(w, k0 + j * half + 0.35, k0 + (j + 1) * half - 0.35, 0, 0.16, WINDOW, z, z + 1.9)
      }
    }
  }

  // A penthouse on the roof.
  const xs = outline.map((p) => p[0])
  const ys = outline.map((p) => p[1])
  const mid = [(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2]
  const long = walls.reduce((best, w) => (!best || w.len > best.len ? w : best), null)
  if (inRing(mid, outline) && long) {
    const [dx, dy] = long.d
    const corner = (a, b) => toLngLat([mid[0] + dx * a - dy * b, mid[1] + dy * a + dx * b])
    add([corner(-8, -5), corner(8, -5), corner(8, 5), corner(-8, 5), corner(-8, -5)], PENTHOUSE, H + 0.5, H + 3.5)
  }

  // Green trees on the lawn in front of the widest face the camera sees.
  const ground = []
  const front = walls
    .filter((w) => w.out[1] > -0.3)
    .reduce((best, w) => (!best || w.len * (w.out[1] + 1.3) > best.len * (best.out[1] + 1.3) ? w : best), null)
  if (front) {
    let i = 0
    for (let k = 6; k < front.len - 4; k += 12, i++) {
      const p = [front.a[0] + front.d[0] * k + front.out[0] * 9, front.a[1] + front.d[1] * k + front.out[1] * 9]
      if (avoidRings.some((r) => inRing(p, r) || r.some((q) => Math.hypot(q[0] - p[0], q[1] - p[1]) < 5))) continue
      const [body, light] = TREES[i % TREES.length]
      const r = 3.6
      add(circleRing(p, 0.7, toLngLat), TRUNK, 0, 4)
      add(circleRing(p, r * 0.9, toLngLat, 12), '#36882f', 3.5, 4.1)
      add(circleRing(p, r, toLngLat, 12), body, 4.1, 8.6)
      add(circleRing([p[0] - r * 0.12, p[1] + r * 0.08], r * 0.62, toLngLat, 12), light, 8.6, 9.3)
      ground.push(polygon(circleRing(p, r + 1, toLngLat, 12), { id: 'langdale-tree' }))
    }
  }

  return { shapes: { type: 'FeatureCollection', features: shapes }, ground }
}
