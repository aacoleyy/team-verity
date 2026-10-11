// Small geometry helpers for drawing on the campus map. Shapes are worked out
// in flat local meters (x east, y north) and turned back into [lng, lat].

const M_PER_DEG_LAT = 111320

// Seeded random numbers, so the scenery comes out the same on every load.
export function rng(seed) {
  let t = seed
  return () => {
    t = (t + 0x6d2b79f5) | 0
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

// Converts between [lng, lat] and local meters around latitude lat0.
export function projector(lat0) {
  const mPerLng = M_PER_DEG_LAT * Math.cos((lat0 * Math.PI) / 180)
  return {
    toXY: ([lng, lat]) => [lng * mPerLng, lat * M_PER_DEG_LAT],
    toLngLat: ([x, y]) => [x / mPerLng, y / M_PER_DEG_LAT],
  }
}

export function segDist(p, a, b) {
  const dx = b[0] - a[0]
  const dy = b[1] - a[1]
  const len = dx * dx + dy * dy
  const t = len ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / len)) : 0
  return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy)
}

export function lineDist(p, line) {
  let d = Infinity
  for (let i = 1; i < line.length; i++) d = Math.min(d, segDist(p, line[i - 1], line[i]))
  return d
}

export function inRing(p, ring) {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i]
    const [xj, yj] = ring[j]
    if (yi > p[1] !== yj > p[1] && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}

// Each polygon of a GeoJSON geometry as a list of rings (outer ring first).
export function polygonsOf(g) {
  if (g.type === 'Polygon') return [g.coordinates]
  if (g.type === 'MultiPolygon') return g.coordinates
  return []
}

// Each line of a GeoJSON geometry (polygon outer rings count as lines).
export function linesOf(g) {
  if (g.type === 'LineString') return [g.coordinates]
  if (g.type === 'MultiLineString') return g.coordinates
  return polygonsOf(g).map((rings) => rings[0])
}

// A many-sided circle around `center` (meters), as a closed [lng, lat] ring.
export function circleRing(center, r, toLngLat, sides = 8) {
  const ring = []
  for (let i = 0; i <= sides; i++) {
    const a = ((i % sides) / sides) * Math.PI * 2 + Math.PI / sides
    ring.push(toLngLat([center[0] + Math.cos(a) * r, center[1] + Math.sin(a) * r]))
  }
  return ring
}

// A rectangle centered on `center` (meters), `length` along direction `dir`
// (unit vector) and `width` across it, as a closed [lng, lat] ring.
export function boxRing(center, dir, length, width, toLngLat) {
  const [ux, uy] = dir
  const [vx, vy] = [-uy, ux]
  const l = length / 2
  const w = width / 2
  const corners = [
    [center[0] - ux * l - vx * w, center[1] - uy * l - vy * w],
    [center[0] + ux * l - vx * w, center[1] + uy * l - vy * w],
    [center[0] + ux * l + vx * w, center[1] + uy * l + vy * w],
    [center[0] - ux * l + vx * w, center[1] - uy * l + vy * w],
  ]
  return [...corners, corners[0]].map(toLngLat)
}

export const polygon = (ring, properties) => ({
  type: 'Feature',
  properties,
  geometry: { type: 'Polygon', coordinates: [ring] },
})

// The parts of each line that lie inside a convex ring (both [x, y] lists).
export function clipLines(lines, ring) {
  const pts = ring[0][0] === ring.at(-1)[0] && ring[0][1] === ring.at(-1)[1] ? ring.slice(0, -1) : ring
  let area = 0
  for (let i = 0; i < pts.length; i++) {
    const [x0, y0] = pts[i]
    const [x1, y1] = pts[(i + 1) % pts.length]
    area += x0 * y1 - x1 * y0
  }
  const sign = area > 0 ? 1 : -1
  // How far inside edge i the point is (>= 0 means inside that edge).
  const side = (i, p) => {
    const a = pts[i]
    const b = pts[(i + 1) % pts.length]
    return sign * ((b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]))
  }
  const out = []
  for (const line of lines) {
    let current = null
    for (let k = 1; k < line.length; k++) {
      const a = line[k - 1]
      const b = line[k]
      let t0 = 0
      let t1 = 1
      for (let i = 0; i < pts.length && t0 <= t1; i++) {
        const sa = side(i, a)
        const sb = side(i, b)
        if (sa < 0 && sb < 0) t0 = 2
        else if (sa < 0) t0 = Math.max(t0, sa / (sa - sb))
        else if (sb < 0) t1 = Math.min(t1, sa / (sa - sb))
      }
      if (t0 > t1) {
        current = null
        continue
      }
      const at = (t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]
      if (!current || t0 > 0) {
        current = [at(t0)]
        out.push(current)
      }
      current.push(at(t1))
      if (t1 < 1) current = null
    }
  }
  return out.filter((l) => l.length > 1)
}
