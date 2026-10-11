// A cartoon 3D model of the Student Center, after p's photos (11 Oct 2026):
// walls striped in wide bands of tan and pale stone block, a white-framed
// glass entrance box on the front, a blue "Welcome Panthers" banner beside it,
// and a recessed covered entry. Student Center East (p's 02:57 photos) adds
// a raised middle roof, tall pole banners and a curved wing on columns.

import { polygon, projector } from './geo.js'

const TAN = '#c9b294'
const STONE = '#efe9dd'
const ROOF = '#d6d0c6'
const GLASS = '#4f7486'
const FRAME = '#fdfaf4'
const BANNER = '#3d4fc4'
const BANNER_TEXT = '#f4f6ff'
const SHADE = '#8f7d68'
const BAND = 1.6
const COLUMN_TOP = 3.4

// parts: Student Center entries from customBuildings ({ outline, height }).
// Returns { shapes, ground } like makeLibrary.
export function makeStudentCenter(parts) {
  const shapes = []
  const { toXY, toLngLat } = projector(parts[0].outline[0][1])
  const add = (ring, color, base, top) => shapes.push(polygon(ring, { color, base, top }))

  for (const b of parts) {
    const outline = b.outline.map(toXY)
    const H = b.height
    let area = 0
    for (let i = 1; i < outline.length; i++) area += outline[i - 1][0] * outline[i][1] - outline[i][0] * outline[i - 1][1]
    const walls = []
    for (let i = 1; i < outline.length; i++) {
      const a = outline[i - 1]
      const c = outline[i]
      const len = Math.hypot(c[0] - a[0], c[1] - a[1])
      if (len < 0.5) continue
      const d = [(c[0] - a[0]) / len, (c[1] - a[1]) / len]
      walls.push({ a, d, len, out: area < 0 ? [-d[1], d[0]] : [d[1], -d[0]] })
    }
    const box = (w, k0, k1, s0, s1, color, base, top) => {
      const p = (k, s) => toLngLat([w.a[0] + w.d[0] * k + w.out[0] * s, w.a[1] + w.d[1] * k + w.out[1] * s])
      add([p(k0, s0), p(k1, s0), p(k1, s1), p(k0, s1), p(k0, s0)], color, base, top)
    }
    const seen = walls.filter((w) => w.out[1] > -0.3 && w.len >= 2)


    // Striped block walls: alternating tan and stone bands, a stone parapet.
    // With `columns`, the ground floor is open: white columns at each corner
    // in front of a glass wall set back from the edge.
    const z0 = b.columns ? COLUMN_TOP : 0
    for (let z = z0, i = 1; z < H; z += BAND, i++) add(b.outline, i % 2 ? STONE : TAN, z, Math.min(H, z + BAND))
    add(b.outline, ROOF, H, H + 0.2)
    for (const w of walls) box(w, -0.3, w.len + 0.3, -0.5, 0.3, STONE, H, H + 0.9)
    if (b.columns) {
      const c = outline.slice(1).reduce((s, p) => [s[0] + p[0], s[1] + p[1]], [0, 0]).map((v) => v / (outline.length - 1))
      const inset = outline.map(([x, y]) => {
        const r = Math.hypot(x - c[0], y - c[1])
        const f = r > 0 ? Math.max(0, (r - 1.6) / r) : 0
        return toLngLat([c[0] + (x - c[0]) * f, c[1] + (y - c[1]) * f])
      })
      add(inset, GLASS, 0, z0)
      add(b.outline, FRAME, z0 - 0.3, z0)
      for (const [x, y] of outline.slice(1)) {
        add([[x - 0.35, y - 0.35], [x + 0.35, y - 0.35], [x + 0.35, y + 0.35], [x - 0.35, y + 0.35], [x - 0.35, y - 0.35]].map(toLngLat), FRAME, 0, z0)
      }
    }
    // With `roof`, a raised striped block in the middle of the roof.
    if (b.roof) {
      const R = b.roof.outline
      const top = H + b.roof.height
      for (let z = H, i = 0; z < top; z += BAND, i++) add(R, i % 2 ? STONE : TAN, z, Math.min(top, z + BAND))
      add(R, ROOF, top, top + 0.2)
    }

    // The front: the widest wall facing the camera.
    // With `entrance` ([lng, lat]), the wall nearest that point, centered there.
    const along = (w, p) => (p[0] - w.a[0]) * w.d[0] + (p[1] - w.a[1]) * w.d[1]
    const off = (w, p) => Math.abs((p[0] - w.a[0]) * w.out[0] + (p[1] - w.a[1]) * w.out[1])
    const door = b.entrance && toXY(b.entrance)
    const front = door
      ? walls.reduce((best, w) => (!best || off(w, door) < off(best, door) ? w : best), null)
      : seen.reduce((best, w) => (!best || w.len * (w.out[1] + 1.2) > best.len * (best.out[1] + 1.2) ? w : best), null)
    for (const w of seen) {
      // Ribbon windows on the upper floors, framed in white.
      if (w.len < 6) continue
      for (let z = 4.4; z + 2 < H - 0.6; z += 3.6) {
        box(w, 1.2, w.len - 1.2, 0, 0.1, FRAME, z - 0.2, z + 1.8)
        box(w, 1.4, w.len - 1.4, 0, 0.18, GLASS, z, z + 1.6)
        for (let k = 3.4; k < w.len - 1.6; k += 2.4) box(w, k - 0.1, k + 0.1, 0, 0.24, FRAME, z, z + 1.6)
      }
    }
    if (front && front.len >= 12 && !b.columns) {
      const m = door ? Math.min(front.len - 7, Math.max(7, along(front, door))) : front.len / 2
      // White-framed glass entrance box.
      const g0 = m - 7
      const g1 = m - 1
      box(front, g0 - 0.3, g1 + 0.3, 0, 3.3, FRAME, 0, 6.6)
      box(front, g0, g1, 0.1, 3.5, GLASS, 0.3, 6.2)
      for (let k = g0; k <= g1 + 0.01; k += 1.5) box(front, k - 0.12, k + 0.12, 3.4, 3.6, FRAME, 0, 6.2)
      box(front, g0, g1, 3.4, 3.6, FRAME, 2.9, 3.15)
      box(front, g0 + 1.4, g1 - 1.4, 3.5, 3.65, '#2f4350', 0.3, 2.6)
      // Recessed covered entry with a dark door.
      box(front, m + 1, m + 6, -0.2, 0.15, SHADE, 0, 3.2)
      box(front, m + 2.6, m + 4.4, 0.1, 0.25, '#7b5a3f', 0, 2.4)
      // Tall blue pole banners on each side of the big banner.
      if (b.poleBanners) {
        for (const k of [m - 0.4, m + 7.4]) {
          box(front, k - 0.06, k + 0.06, 0.3, 0.9, FRAME, 3.6, 8.6)
          box(front, k - 0.06, k + 0.06, 0.9, 1.9, BANNER, 5, 8.4)
        }
      }
      // The blue banner above it.
      box(front, m + 0.4, m + 6.6, 0, 0.25, BANNER, 3.8, Math.min(H - 1, 7.4))
      box(front, m + 1.1, m + 5.9, 0, 0.32, BANNER_TEXT, 5.9, 6.4)
      box(front, m + 1.1, m + 5.9, 0, 0.32, BANNER_TEXT, 4.6, 5.3)
    }
  }
  return { shapes: { type: 'FeatureCollection', features: shapes }, ground: [] }
}
