// A cartoon 3D model of the tower behind the gap between the Student Centers,
// after p's 3D photo (11 Oct 2026): a tall block of brown piers and white floor
// bands with dark windows, round concrete towers at the corners and halfway
// along the long sides, a white roof with a penthouse, a glass-roofed bridge to
// Student Center West and a small brick stair tower in the gap.

import { circleRing, polygon, projector } from './geo.js'

const WINDOW = '#4f4540'
const PIER = '#8a7b71'
const BAND = '#f4f1ea'
const DRUM = '#a39488'
const DRUM_TOP = '#c9beb3'
const ROOF = '#e9e6e0'
const PENTHOUSE = '#d8d3cb'
const GLASS = '#86bde0'
const FRAME = '#fdfaf4'
const BRICK = '#b25d3e'
const BRICK_TOP = '#d9cfc2'
const FLOOR = 3.6

// building: the tower entry from customBuildings ({ outline, height, link, stair }).
// Returns { shapes, ground } like makeLibrary.
export function makeTower(building) {
  const { toXY, toLngLat } = projector(building.outline[0][1])
  const outline = building.outline.map(toXY)
  const H = building.height
  const shapes = []
  const add = (ring, color, base, top) => shapes.push(polygon(ring, { color, base, top }))
  const addXY = (ring, color, base, top) => add(ring.map(toLngLat), color, base, top)

  let area = 0
  for (let i = 1; i < outline.length; i++) area += outline[i - 1][0] * outline[i][1] - outline[i][0] * outline[i - 1][1]
  const sign = area > 0 ? 1 : -1
  const walls = []
  for (let i = 1; i < outline.length; i++) {
    const a = outline[i - 1]
    const b = outline[i]
    const len = Math.hypot(b[0] - a[0], b[1] - a[1])
    if (len < 0.5) continue
    const d = [(b[0] - a[0]) / len, (b[1] - a[1]) / len]
    walls.push({ a, d, len, out: [d[1] * sign, -d[0] * sign] })
  }
  const at = (w, k, s) => [w.a[0] + w.d[0] * k + w.out[0] * s, w.a[1] + w.d[1] * k + w.out[1] * s]
  const box = (w, k0, k1, s0, s1, color, base, top) =>
    addXY([at(w, k0, s0), at(w, k1, s0), at(w, k1, s1), at(w, k0, s1), at(w, k0, s0)], color, base, top)

  // The block: dark windows behind, a white roof with a parapet and penthouse.
  add(building.outline, WINDOW, 0, H)
  add(building.outline, ROOF, H, H + 0.3)
  for (const w of walls) box(w, -0.2, w.len + 0.2, -0.5, 0.2, BAND, H, H + 1.2)
  const c = outline.slice(1).reduce((s, p) => [s[0] + p[0] / (outline.length - 1), s[1] + p[1] / (outline.length - 1)], [0, 0])
  addXY(outline.map(([x, y]) => [c[0] + (x - c[0]) * 0.45, c[1] + (y - c[1]) * 0.55]), PENTHOUSE, H, H + 4.5)

  // White floor bands and brown piers on the walls the camera sees, and on all
  // walls a plain ground floor.
  const seen = walls.filter((w) => w.out[1] > -0.3)
  for (const w of walls) box(w, 0, w.len, 0, 0.15, PIER, 0, 4)
  for (const w of seen) {
    for (let z = 4 + FLOOR - 1; z < H - 0.5; z += FLOOR) box(w, 0, w.len, 0, 0.25, BAND, z, z + 1)
    const n = Math.max(2, Math.round(w.len / 3.2))
    for (let k = 0; k <= n; k++) {
      const x = (w.len * k) / n
      box(w, x - 0.35, x + 0.35, 0, 0.4, PIER, 4, H)
    }
  }

  // Round towers at each corner and halfway along each long side.
  const long = Math.max(...walls.map((w) => w.len))
  for (const w of walls) {
    const spots = [0, ...(w.len > long * 0.8 ? [w.len / 2] : [])]
    for (const k of spots) {
      const p = at(w, k, 1.2)
      add(circleRing(p, 2.6, toLngLat, 14), DRUM, 0, H + 1.8)
      add(circleRing(p, 2.8, toLngLat, 14), DRUM_TOP, H + 1.8, H + 2.3)
    }
  }

  // The glass-roofed bridge to Student Center West, on two pillars.
  const link = building.link
  if (link) {
    add(link.outline, FRAME, link.base, link.base + 0.6)
    add(link.outline, GLASS, link.base + 0.6, link.top - 0.4)
    add(link.outline, FRAME, link.top - 0.4, link.top)
    for (const p of link.pillars ?? []) add(circleRing(toXY(p), 0.6, toLngLat, 8), FRAME, 0, link.base)
  }

  // The little brick stair tower in the gap.
  const stair = building.stair
  if (stair) {
    add(stair.outline, BRICK, 0, stair.height)
    add(stair.outline, BRICK_TOP, stair.height, stair.height + 0.5)
  }

  return { shapes: { type: 'FeatureCollection', features: shapes }, ground: [] }
}
