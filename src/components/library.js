// A cartoon 3D model of Library North, after p's photos (10 Oct 2026): a tall,
// nearly windowless brick block with a white cornice, a big white marble panel
// with a zigzag pattern and a strip of windows on its front, and in front of
// the 2022 entrance pavilion on the northeast side: two stories of green glass
// with a curved face, a stone tower at one end, and a rooftop terrace with
// tables, planters and a glass railing. A door with a small canopy and the
// blue "Library North" sign sits in the glass front, with a red-brick path out
// to the walkway.
//
// The facade dressing is placed along the front wall: `t` is meters along it
// from its east corner, `s` is meters out from the wall (negative is inside).
// The pavilion has its own frame the same way.

import { inRing, polygon, projector } from './geo.js'

const BRICK = '#c27c62'
const BRICK_LINE = '#ad6852'
const CORNICE = '#f3eee4'
const ROOF = '#93a1b3'
const ROOF_UNIT = '#e4e7eb'
const PENTHOUSE = '#cdd3da'
const MARBLE = '#f6f3ee'
const MARBLE_LINE = '#dcd5ca'
const DARK_GLASS = '#4e7c8a'
const WINDOW_STRIP = '#4a6d8c'
const LOUVER = '#5b504c'
const GLASS = '#7cc3b3'
const SILVER = '#eef0f2'
const DECK = '#dfe2e5'
const RAILING = '#d6f0ee'
const STONE = '#e8dac2'
const LEAVES = '#62a94c'
const PLANTER = '#e3d6c0'
const TABLE = '#ffffff'
const CHAIR = '#8a9099'
const SIGN = '#2f62b3'
const SIGN_RED = '#d33b3b'
const PAVERS = '#d4866a'

const TOP = 16.8 // top of the brick walls
const PAVILION = 8.2 // top of the pavilion's glass

// building: the library entry from customBuildings ({ outline, front,
// pavilion }). strips: the wide walkways ({ from, to, width }); a path runs
// from the door to the nearest one.
// Returns { shapes, ground }: shapes are the 3D parts ({ color, base, top });
// ground is the footprint of the pavilion and the door path, for scenery to keep
// clear of.
export function makeLibrary(building, strips = []) {
  const { toXY, toLngLat } = projector(building.outline[0][1])
  const outline = building.outline.map(toXY)
  const I = toXY(building.front[0])
  const A = toXY(building.front[1])
  const L = Math.hypot(A[0] - I[0], A[1] - I[1])
  const u = [(A[0] - I[0]) / L, (A[1] - I[1]) / L]
  const mid = [(I[0] + A[0]) / 2, (I[1] + A[1]) / 2]
  const n = inRing([mid[0] + u[1], mid[1] - u[0]], outline) ? [-u[1], u[0]] : [u[1], -u[0]]
  const at = (t, s) => toLngLat([I[0] + u[0] * t + n[0] * s, I[1] + u[1] * t + n[1] * s])
  const inside = (t, s) => inRing([I[0] + u[0] * t + n[0] * s, I[1] + u[1] * t + n[1] * s], outline)

  const shapes = []
  const add = (ring, color, base, top) => shapes.push(polygon(ring, { color, base, top }))
  const rect = (t0, t1, s0, s1) => [at(t0, s0), at(t1, s0), at(t1, s1), at(t0, s1), at(t0, s0)]
  const box = (t0, t1, s0, s1, color, base, top) => add(rect(t0, t1, s0, s1), color, base, top)

  // Each wall of the block, with the direction pointing out of it.
  let area = 0
  for (let i = 1; i < outline.length; i++) {
    area += outline[i - 1][0] * outline[i][1] - outline[i][0] * outline[i - 1][1]
  }
  const walls = []
  for (let i = 1; i < outline.length; i++) {
    const a = outline[i - 1]
    const b = outline[i]
    const len = Math.hypot(b[0] - a[0], b[1] - a[1])
    if (len < 0.5) continue
    const d = [(b[0] - a[0]) / len, (b[1] - a[1]) / len]
    walls.push({ a, d, len, out: area < 0 ? [-d[1], d[0]] : [d[1], -d[0]] })
  }
  // A box against wall w, from k0 to k1 along it and s0 to s1 out from it.
  const wallBox = (w, k0, k1, s0, s1, color, base, top) => {
    const p = (k, s) => toLngLat([w.a[0] + w.d[0] * k + w.out[0] * s, w.a[1] + w.d[1] * k + w.out[1] * s])
    add([p(k0, s0), p(k1, s0), p(k1, s1), p(k0, s1), p(k0, s0)], color, base, top)
  }
  // A strip along the whole wall, `ext` past each end.
  const wallStrip = (w, ext, s0, s1, color, base, top) => wallBox(w, -ext, w.len + ext, s0, s1, color, base, top)
  // The camera always looks south, so walls facing south are never seen.
  const seen = walls.filter((w) => w.out[1] > -0.3)

  // The brick block, its roof, the white cornice around the top and a white
  // band above the ground floor, with faint brick courses between.
  add(building.outline, BRICK, 0, TOP)
  add(building.outline, ROOF, TOP, TOP + 0.7)
  for (const w of walls) wallStrip(w, 0.35, -0.7, 0.35, CORNICE, TOP, TOP + 1.2)
  for (const w of seen) {
    wallStrip(w, 0, 0, 0.18, CORNICE, 3.3, 4.1)
    for (const z of [5.6, 8.4, 11.2, 14]) wallStrip(w, 0, 0, 0.06, BRICK_LINE, z, z + 0.2)
  }

  // On the roof: a mechanical penthouse, air units and the round seal.
  const roofBox = (t, s, lt, ls, color, top) => {
    if ([[t - lt, s - ls], [t + lt, s - ls], [t + lt, s + ls], [t - lt, s + ls]].every(([a, b]) => inside(a, b))) {
      box(t - lt, t + lt, s - ls, s + ls, color, TOP + 0.7, top)
    }
  }
  roofBox(30, -30, 7, 4.5, PENTHOUSE, TOP + 3.4)
  roofBox(38, -13, 2, 1.3, ROOF_UNIT, TOP + 2)
  roofBox(12, -40, 2, 1.3, ROOF_UNIT, TOP + 2)
  roofBox(40, -42, 1.5, 1.5, ROOF_UNIT, TOP + 2.2)
  roofBox(26, -44, 2, 1.3, ROOF_UNIT, TOP + 2)
  const seal = []
  for (let i = 0; i <= 24; i++) {
    const a = (i / 24) * Math.PI * 2
    seal.push(at(16 + Math.cos(a) * 5, -18 + Math.sin(a) * 5))
  }
  if (inside(16, -18)) add(seal, '#b3bfcd', TOP + 0.7, TOP + 0.8)

  // The front facade: dark glass on the ground floor, the marble panel with
  // its zigzag pattern and the strip of windows above it, and a dark louver.
  box(4, L - 1, 0, 0.14, DARK_GLASS, 0.3, 3.3)
  box(13, 35, 0, 0.4, MARBLE, 11.8, 16.05)
  box(13, 35, 0, 0.3, WINDOW_STRIP, 16.05, TOP)
  for (const [row, z] of [12.4, 13.6, 14.8].entries()) {
    for (let t = 13.6 + (row % 2) * 1.3; t + 1.3 < 34.6; t += 2.6) box(t, t + 1.3, 0.4, 0.46, MARBLE_LINE, z, z + 0.3)
  }
  box(36.5, 37.8, 0, 0.2, LOUVER, 4.1, 16.05)

  // The pavilion stands out from the northeast side: green glass whose front
  // bows out in a gentle curve, a stone tower at its south end, and the
  // terrace on top. Its own frame: `t` along the side from the north end,
  // `s` out from it.
  const N = toXY(building.pavilion[0])
  const S = toXY(building.pavilion[1])
  const L2 = Math.hypot(S[0] - N[0], S[1] - N[1])
  const u2 = [(S[0] - N[0]) / L2, (S[1] - N[1]) / L2]
  const mid2 = [(N[0] + S[0]) / 2, (N[1] + S[1]) / 2]
  const n2 = inRing([mid2[0] + u2[1] * 3, mid2[1] - u2[0] * 3], outline) ? [-u2[1], u2[0]] : [u2[1], -u2[0]]
  const xy2 = (t, s) => [N[0] + u2[0] * t + n2[0] * s, N[1] + u2[1] * t + n2[1] * s]
  const at2 = (t, s) => toLngLat(xy2(t, s))
  const rect2 = (t0, t1, s0, s1) => [at2(t0, s0), at2(t1, s0), at2(t1, s1), at2(t0, s1), at2(t0, s0)]
  const box2 = (t0, t1, s0, s1, color, base, top) => add(rect2(t0, t1, s0, s1), color, base, top)

  const TOWER = 6.5
  const P0 = 0
  const P1 = L2 - TOWER
  const BACK = -4 // the glass runs back into the notches of the brick wall
  const front = (t) => 7.5 + 1.5 * Math.sin((Math.PI * (t - P0)) / (P1 - P0))
  const ts = []
  for (let t = P0; t < P1; t += 1) ts.push(t)
  ts.push(P1)
  const back = [...ts].reverse()
  // A band following the curved front, from `inner` to `outer` meters past it.
  const curveBand = (inner, outer, color, base, top) =>
    add([...ts.map((t) => at2(t, front(t) + outer)), ...back.map((t) => at2(t, front(t) + inner)), at2(P0, front(P0) + outer)], color, base, top)
  const body = [at2(P0, BACK), at2(P1, BACK), ...back.map((t) => at2(t, front(t))), at2(P0, BACK)]
  add(body, GLASS, 0, PAVILION)
  add(
    [at2(P0 - 0.15, BACK), at2(P1, BACK), ...back.map((t) => at2(t - (t === P0 ? 0.15 : 0), front(t) + 0.15)), at2(P0 - 0.15, BACK)],
    DECK,
    PAVILION,
    PAVILION + 0.3,
  )
  curveBand(-0.05, 0.12, SILVER, 4, 4.35)
  curveBand(-0.15, 0, RAILING, PAVILION + 0.3, PAVILION + 1.3)
  box2(P0, P0 + 0.15, BACK, front(P0), RAILING, PAVILION + 0.3, PAVILION + 1.3)
  for (let t = P0 + 1.6; t < P1; t += 1.6) {
    box2(t - 0.12, t + 0.12, front(t) - 0.05, front(t) + 0.2, SILVER, 0, PAVILION + 1.4)
  }
  box2(P1, L2, BACK, 9.8, STONE, 0, 10.6)
  box2(P1 + 0.6, L2 - 0.6, 0.6, 9.2, LEAVES, 10.6, 11.5)
  // Glass doors from the library onto the terrace, on the brick walls behind it.
  for (const w of walls) {
    const m = [w.a[0] + (w.d[0] * w.len) / 2, w.a[1] + (w.d[1] * w.len) / 2]
    const along = (m[0] - N[0]) * u2[0] + (m[1] - N[1]) * u2[1]
    if (w.out[0] * n2[0] + w.out[1] * n2[1] > 0.6 && along > P0 && along < P1) {
      wallBox(w, 0.5, w.len - 0.5, 0, 0.14, DARK_GLASS, PAVILION + 0.3, 11.6)
    }
  }

  // The terrace: tables with two chairs each, and planters at both ends.
  for (const s of [2.4, 5.2]) {
    for (let t = P0 + 4; t < P1 - 2; t += 3.4) {
      box2(t - 0.5, t + 0.5, s - 0.5, s + 0.5, TABLE, PAVILION + 0.3, PAVILION + 1.05)
      box2(t - 1.15, t - 0.7, s - 0.22, s + 0.22, CHAIR, PAVILION + 0.3, PAVILION + 0.8)
      box2(t + 0.7, t + 1.15, s - 0.22, s + 0.22, CHAIR, PAVILION + 0.3, PAVILION + 0.8)
    }
  }
  for (const [t0, t1] of [[P0 + 0.4, P0 + 2.9], [P1 - 2.8, P1 - 0.3]]) {
    box2(t0, t1, 0.3, 2.4, PLANTER, PAVILION + 0.3, PAVILION + 0.9)
    box2(t0 + 0.2, t1 - 0.2, 0.5, 2.2, LEAVES, PAVILION + 0.9, PAVILION + 1.7)
  }

  // The door, in the middle of the glass front: dark glass in a silver frame
  // under a small canopy with the blue sign.
  const D = (P0 + P1) / 2
  const fd = front(D)
  box2(D - 1.35, D + 1.35, fd - 0.05, fd + 0.2, SILVER, 0, 3.05)
  box2(D - 1.1, D + 1.1, fd - 0.05, fd + 0.28, '#3a6370', 0, 2.8)
  box2(D - 1.9, D + 1.9, fd, fd + 1.7, DECK, 3.3, 3.65)
  box2(D - 1.5, D + 1.2, fd + 1.7, fd + 1.82, SIGN, 3.3, 3.65)
  box2(D + 1.2, D + 1.5, fd + 1.7, fd + 1.84, SIGN_RED, 3.3, 3.65)

  // A red-brick path from the door straight out to the nearest wide walkway.
  const start = xy2(D, fd)
  let nearest = Infinity
  for (const strip of strips) {
    const a = toXY(strip.from)
    const b = toXY(strip.to)
    const d = [b[0] - a[0], b[1] - a[1]]
    const den = n2[0] * d[1] - n2[1] * d[0]
    if (Math.abs(den) < 1e-6) continue
    const k = ((a[0] - start[0]) * d[1] - (a[1] - start[1]) * d[0]) / den
    const m = ((a[0] - start[0]) * n2[1] - (a[1] - start[1]) * n2[0]) / den
    if (k > 0 && m >= 0 && m <= 1) nearest = Math.min(nearest, k - strip.width / 2 + 0.4)
  }
  const reach = nearest < 40 ? nearest : 10
  const path = rect2(D - 1.6, D + 1.6, fd + 0.2, fd + reach)
  add(path, PAVERS, 0, 0.05)

  const footprint = [at2(P0, 0), at2(L2, 0), at2(L2, 9.8), ...back.map((t) => at2(t, front(t))), at2(P0, 0)]
  return {
    shapes: { type: 'FeatureCollection', features: shapes },
    ground: [polygon(footprint, { id: 'library-pavilion' }), polygon(path, { id: 'library-path' })],
  }
}
