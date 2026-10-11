// A cartoon 3D model of the Student Recreation Center, after p's photo (11 Oct
// 2026): a long charcoal building whose upper floor overhangs a recessed glass
// ground floor on white round columns, with a ribbon of light-blue windows. A
// tall pale-gray block with a blue light strip caps the south end, and the gym
// in the middle rises higher under a sawtooth roof over a big light-blue glass
// wall. White panels carry the GSU flame.

import { circleRing, polygon, projector } from './geo.js'

const CHARCOAL = '#434b5a'
const CHARCOAL_LIGHT = '#566072'
const ROOF = '#9aa1ab'
const PALE = '#e4e6ea'
const GLASS = '#33414f'
const WARM = '#b4e2fb' // light blue windows (p, 11 Oct 04:08)
const MULLION = '#2b313b'
const COLUMN = '#f4f4f2'
const BLUE = '#3f7cf0'
const FLAME = '#9aa3b0'

const OVERHANG = 2.6 // how far the ground floor is set back
const GROUND = 4.6 // top of the ground floor

// Moves every edge of a closed ring inward by d (meters) and rejoins them.
function inset(ring, d, sign) {
  const pts = ring.slice(0, -1)
  const n = pts.length
  const lines = pts.map((a, i) => {
    const b = pts[(i + 1) % n]
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1
    const dir = [(b[0] - a[0]) / len, (b[1] - a[1]) / len]
    const inward = [-dir[1] * sign, dir[0] * sign]
    return { p: [a[0] + inward[0] * d, a[1] + inward[1] * d], dir }
  })
  const out = lines.map((l, i) => {
    const m = lines[(i + n - 1) % n]
    const den = m.dir[0] * l.dir[1] - m.dir[1] * l.dir[0]
    if (Math.abs(den) < 1e-6) return l.p
    const t = ((l.p[0] - m.p[0]) * l.dir[1] - (l.p[1] - m.p[1]) * l.dir[0]) / den
    return [m.p[0] + m.dir[0] * t, m.p[1] + m.dir[1] * t]
  })
  return [...out, out[0]]
}

// building: the Rec Center entry from customBuildings ({ outline, height }).
// Returns { shapes, ground } like makeLibrary.
export function makeRecCenter(building) {
  const { toXY, toLngLat } = projector(building.outline[0][1])
  const outline = building.outline.map(toXY)
  const H = building.height
  const shapes = []
  const add = (ring, color, base, top) => shapes.push(polygon(ring.map(toLngLat), { color, base, top }))

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
    add([at(w, k0, s0), at(w, k1, s0), at(w, k1, s1), at(w, k0, s1), at(w, k0, s0)], color, base, top)

  // Recessed glass ground floor, the charcoal upper floor over it, the roof.
  add(inset(outline, OVERHANG, sign), GLASS, 0, GROUND)
  add(outline, CHARCOAL, GROUND, H)
  add(outline, ROOF, H, H + 0.25)
  for (const w of walls) box(w, -0.2, w.len + 0.2, -0.45, 0.2, CHARCOAL_LIGHT, H, H + 0.7)
  add(inset(outline, OVERHANG, sign), CHARCOAL, GROUND - 0.4, GROUND)

  const seen = walls.filter((w) => w.out[1] > -0.3 && w.len >= 4)
  const front = walls.reduce((best, w) => (!best || w.len * (w.out[1] + 1.2) > best.len * (best.out[1] + 1.2) ? w : best), null)
  const gym = front ? [front.len * 0.42, front.len * 0.68] : [0, 0]
  // Which end of the front wall gets the pale block: the south end, or the north
  // end when the entry has `flip` (the building turned 180 degrees).
  const southAtStart = front && front.a[1] < at(front, front.len, 0)[1] !== Boolean(building.flip)
  const paleSpan = southAtStart ? [0, 16] : [front ? front.len - 16 : 0, front ? front.len : 0]

  const panels = front ? [front.len * 0.3, front.len * 0.8] : []
  for (const w of seen) {
    const isFront = w === front
    // Warm lit windows inside the recess and a ribbon of them upstairs.
    box(w, 1, w.len - 1, -OVERHANG + 0.1, -OVERHANG + 0.25, WARM, 0.9, GROUND - 1)
    // A long ribbon of windows upstairs, broken only by the gym, the pale
    // block and the white panels.
    const skip = (k) =>
      isFront && ((k > gym[0] - 0.5 && k < gym[1] + 0.5) || (k > paleSpan[0] - 0.5 && k < paleSpan[1] + 0.5) || panels.some((c) => Math.abs(k - c) < 3.6))
    for (let k = 1; k + 2.4 <= w.len - 1; k += 2.4) {
      if (skip(k) || skip(k + 2.4)) continue
      box(w, k, k + 2.4, 0, 0.18, WARM, GROUND + 1.6, H - 1.4)
      box(w, k - 0.08, k + 0.08, 0, 0.26, MULLION, GROUND + 1.6, H - 1.4)
    }
    // White round columns holding up the overhang.
    for (let k = 3; k < w.len - 2; k += 7) add(circleRing(at(w, k, -OVERHANG / 2), 0.45, (p) => p, 10), COLUMN, 0, GROUND - 0.4)
  }

  if (front) {
    // The gym: a taller block in the middle with a glowing glass wall and a
    // sawtooth roof.
    const [g0, g1] = gym
    const depth = 22
    const GH = H + 5
    box(front, g0, g1, -depth, 0.3, CHARCOAL, GROUND, GH)
    box(front, g0 + 1, g1 - 1, 0.3, 0.5, WARM, GROUND + 0.4, GH - 0.8)
    for (let k = g0 + 1; k <= g1 - 1 + 0.01; k += 2.4) box(front, k - 0.12, k + 0.12, 0.3, 0.6, MULLION, GROUND + 0.4, GH - 0.8)
    for (let z = GROUND + 3; z < GH - 1; z += 3) box(front, g0 + 1, g1 - 1, 0.3, 0.6, MULLION, z - 0.1, z + 0.1)
    for (let s = -depth + 1; s < -1; s += 4) {
      // Each tooth: a low slope and a steep glazed face toward the front.
      box(front, g0 + 0.5, g1 - 0.5, s, s + 2, CHARCOAL_LIGHT, GH, GH + 1)
      box(front, g0 + 0.5, g1 - 0.5, s + 2, s + 3.2, CHARCOAL_LIGHT, GH, GH + 2)
      box(front, g0 + 0.5, g1 - 0.5, s + 3.2, s + 3.5, WARM, GH, GH + 2)
    }

    // The tall pale-gray block at the south end with its blue light strip.
    const [p0, p1] = paleSpan
    box(front, p0, p1, -18, 0.6, PALE, 0, H + 3)
    box(front, p0, p1, -18, 0.6, '#cfd3d9', H + 3, H + 3.4)
    const edge = southAtStart ? p1 : p0
    box(front, edge - 0.9, edge + 0.9, 0.4, 0.8, BLUE, 1.5, H + 2)

    // White panels with the GSU flame on the upper floor.
    for (const c of panels) {
      box(front, c - 3, c + 3, 0, 0.5, '#f7f7f5', GROUND, H - 0.3)
      box(front, c - 2.3, c + 2.3, 0.4, 0.55, '#dfe2e6', GROUND + 0.7, H - 1)
      box(front, c - 0.9, c - 0.3, 0.5, 0.65, FLAME, GROUND + 2, H - 2.2)
      box(front, c - 0.1, c + 0.5, 0.5, 0.65, FLAME, GROUND + 1.6, H - 1.8)
    }
  }

  return { shapes: { type: 'FeatureCollection', features: shapes }, ground: [] }
}
