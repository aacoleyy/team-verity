// A cartoon 3D model of the Arts & Humanities building, after p's 11 Oct 2026
// reference pictures (the GSU expansion plan): a six-floor red-brick block with
// tall dark-framed window bays between brick piers, a glass storefront ground
// floor, and a taller glass corner tower with a pale cap at one end of the
// front. Details go only on the walls the camera sees.

import { polygon, projector } from './geo.js'

const BRICK = '#a8523f'
const BRICK_DARK = '#8f4332'
const FRAME = '#3a3a40'
const GLASS_DARK = '#4d6475'
const GLASS_SKY = '#9cc3da'
const GLASS_LIGHT = '#c9e1ee'
const STORE = '#e6bd6e'
const CAP = '#d9d6d0'
const COPPER = '#7d4a3a'
const ROOF = '#9d9a94'

const BASE = 4.5 // top of the storefront ground floor
const BAY = 6.2 // meters from one window bay to the next
const TOWER = 13 // width of the glass corner tower
const TOWER_RISE = 5 // how far the tower stands above the roof

// building: the Arts & Humanities entry from customBuildings ({ outline, height }).
// Returns { shapes, ground } like makeLangdale.
export function makeArtsHumanities(building) {
  const { toXY, toLngLat } = projector(building.outline[0][1])
  const outline = building.outline.map(toXY)
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
  const box = (w, k0, k1, s0, s1, color, base, top) => {
    const p = (k, s) => toLngLat([w.a[0] + w.d[0] * k + w.out[0] * s, w.a[1] + w.d[1] * k + w.out[1] * s])
    add([p(k0, s0), p(k1, s0), p(k1, s1), p(k0, s1), p(k0, s0)], color, base, top)
  }

  // The brick body, the storefront under it, the roof and a darker cornice.
  add(building.outline, STORE, 0, BASE)
  add(building.outline, BRICK, BASE, H)
  add(building.outline, ROOF, H, H + 0.4)
  for (const w of walls) box(w, -0.2, w.len + 0.2, -0.5, 0.2, BRICK_DARK, H - 0.6, H + 0.9)

  // The front is the long wall that faces the camera best. The tower stands at
  // its east end (left on screen, since the map looks south).
  const seen = walls.filter((w) => w.out[1] > -0.3 && w.len >= 4)
  const front = seen.reduce((best, w) => (!best || w.len * (w.out[1] + 1.2) > best.len * (best.out[1] + 1.2) ? w : best), null)
  const towerAtStart = front && front.a[0] > front.a[0] + front.d[0] * front.len
  const tower = front ? (towerAtStart ? [0, TOWER] : [front.len - TOWER, front.len]) : [0, 0]

  for (const w of seen) {
    const isFront = w === front
    const n = Math.max(1, Math.floor((w.len - 2) / BAY))
    const bay = (w.len - 2) / n
    for (let k = 0; k < n; k++) {
      const k0 = 1 + k * bay + 1
      const k1 = 1 + (k + 1) * bay - 1
      if (isFront && k1 > tower[0] - 0.5 && k0 < tower[1] + 0.5) continue
      // A tall dark frame with two panes of glass and a thin mullion.
      box(w, k0, k1, 0, 0.18, FRAME, BASE + 1, H - 1.2)
      box(w, k0 + 0.3, k1 - 0.3, 0, 0.3, GLASS_DARK, BASE + 1.3, H - 1.5)
      box(w, (k0 + k1) / 2 - 0.1, (k0 + k1) / 2 + 0.1, 0, 0.36, FRAME, BASE + 1.3, H - 1.5)
      // Floor lines across the glass.
      for (let z = BASE + 1.3 + 3.4; z < H - 1.6; z += 3.4) box(w, k0 + 0.3, k1 - 0.3, 0, 0.38, FRAME, z - 0.1, z + 0.1)
    }
    // Glass storefront with warm light inside, broken by thin posts.
    box(w, 1, w.len - 1, 0, 0.14, STORE, 0.5, BASE - 0.5)
    for (let k = 1; k <= w.len - 1; k += 3.1) box(w, k - 0.12, k + 0.12, 0, 0.3, FRAME, 0, BASE)
    // A dark band over the storefront.
    box(w, 0, w.len, 0, 0.3, FRAME, BASE - 0.3, BASE + 0.35)
  }

  if (front) {
    // The glass corner tower: a taller glass box with dark mullions, a pale cap
    // and a sign band, standing slightly out from the brick.
    const [t0, t1] = tower
    const depth = TOWER
    box(front, t0, t1, -depth, 0.5, GLASS_SKY, BASE, H + TOWER_RISE)
    box(front, t0 - 0.3, t1 + 0.3, -depth - 0.3, 0.8, CAP, H + TOWER_RISE, H + TOWER_RISE + 0.8)
    box(front, t0 - 0.3, t1 + 0.3, -depth - 0.3, 0.8, COPPER, H + TOWER_RISE - 0.8, H + TOWER_RISE)
    for (let k = t0; k <= t1 + 0.01; k += (t1 - t0) / 5) box(front, k - 0.15, k + 0.15, 0.5, 0.75, FRAME, BASE, H + TOWER_RISE - 0.8)
    for (let z = BASE + 3.4; z < H + TOWER_RISE - 0.8; z += 3.4) box(front, t0, t1, 0.5, 0.7, FRAME, z - 0.1, z + 0.1)
    // Light reflections in the glass.
    box(front, t0 + 1.5, t0 + 3.5, 0.5, 0.65, GLASS_LIGHT, BASE + 2, H + TOWER_RISE - 2)
    box(front, t1 - 4.5, t1 - 2.5, 0.5, 0.65, GLASS_LIGHT, BASE + 2, H + TOWER_RISE - 2)
  }

  return { shapes: { type: 'FeatureCollection', features: shapes }, ground: [] }
}
