// Framing for the tilted map. At the starting view every pin (and its label)
// is on screen and the screen is filled edge to edge with map, so the map's
// border is simply the straight edge of the screen. Zooming in lets you move
// around, but never far enough to see past that starting view.

import maplibregl from 'maplibre-gl'

// Finds the largest zoom (and a center) that keeps every point inside the
// screen minus `padding` ({ top, right, bottom, left } in pixels).
export function fitPoints(map, points, { bearing, pitch, padding }) {
  const { clientWidth: w, clientHeight: h } = map.getContainer()
  const box = { left: padding.left, right: w - padding.right, top: padding.top, bottom: h - padding.bottom }
  const lngLats = points.map((p) => [p.lng, p.lat])
  const start = [
    lngLats.reduce((s, p) => s + p[0], 0) / lngLats.length,
    lngLats.reduce((s, p) => s + p[1], 0) / lngLats.length,
  ]

  // Centers the points' on-screen box in the padded screen at this zoom.
  const place = (zoom) => {
    let center = start
    let xy = []
    for (let i = 0; i < 4; i++) {
      map.jumpTo({ center, zoom, bearing, pitch })
      xy = lngLats.map((p) => map.project(p))
      const midX = (Math.min(...xy.map((p) => p.x)) + Math.max(...xy.map((p) => p.x))) / 2
      const midY = (Math.min(...xy.map((p) => p.y)) + Math.max(...xy.map((p) => p.y))) / 2
      const dx = midX - (box.left + box.right) / 2
      const dy = midY - (box.top + box.bottom) / 2
      center = map.unproject([w / 2 + dx, h / 2 + dy]).toArray()
    }
    map.jumpTo({ center, zoom, bearing, pitch })
    xy = lngLats.map((p) => map.project(p))
    const fits =
      xy.every((p) => p.x >= box.left && p.x <= box.right && p.y >= box.top && p.y <= box.bottom)
    return { center, fits }
  }

  let lo = 13
  let hi = 19
  let best = { ...place(lo), zoom: lo }
  for (let i = 0; i < 18; i++) {
    const mid = (lo + hi) / 2
    const tried = place(mid)
    if (tried.fits) {
      best = { ...tried, zoom: mid }
      lo = mid
    } else {
      hi = mid
    }
  }
  map.jumpTo({ center: best.center, zoom: best.zoom, bearing, pitch })

  // The ground the screen covers at this view: four corners, as [lng, lat].
  const corners = [
    [0, 0],
    [w, 0],
    [w, h],
    [0, h],
  ].map((p) => map.unproject(p).toArray())
  return { center: best.center, zoom: best.zoom, corners }
}

// A ring around the view's ground, pushed out by `grow` (0.05 = 5%).
export function areaRing(view, grow = 0) {
  const [cx, cy] = view.center
  const ring = view.corners.map(([x, y]) => [cx + (x - cx) * (1 + grow), cy + (y - cy) * (1 + grow)])
  return [...ring, ring[0]]
}

function closestOnSegment(p, a, b) {
  const dx = b[0] - a[0]
  const dy = b[1] - a[1]
  const len = dx * dx + dy * dy
  const t = len ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / len)) : 0
  return [a[0] + t * dx, a[1] + t * dy]
}

function inside(p, poly) {
  let yes = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i]
    const [xj, yj] = poly[j]
    if (yi > p[1] !== yj > p[1] && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) yes = !yes
  }
  return yes
}

function area(poly) {
  let sum = 0
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) sum += poly[j][0] * poly[i][1] - poly[i][0] * poly[j][1]
  return sum / 2
}

// The part of convex polygon `poly` inside convex polygon `by`.
function clip(poly, by) {
  const sign = Math.sign(area(by)) || 1
  const side = (a, b, p) => sign * ((b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]))
  let out = poly
  for (let i = 0; i < by.length && out.length; i++) {
    const a = by[i]
    const b = by[(i + 1) % by.length]
    const input = out
    out = []
    for (let j = 0; j < input.length; j++) {
      const p = input[j]
      const q = input[(j + 1) % input.length]
      const sp = side(a, b, p)
      const sq = side(a, b, q)
      if (sp >= 0) out.push(p)
      if (sp >= 0 !== sq >= 0) {
        const t = sp / (sp - sq)
        out.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t])
      }
    }
  }
  return out
}

const merc = (ll) => {
  const m = maplibregl.MercatorCoordinate.fromLngLat(ll)
  return [m.x, m.y]
}
const fromMerc = ([x, y]) => new maplibregl.MercatorCoordinate(x, y).toLngLat()

// A camera rule for map.setTransformConstrain: zoom stays between the view's
// zoom and maxZoom, and the center stays where the ground you can see never
// reaches past the starting view. `visible` is that ground as seen from the
// starting view: the whole screen by default, or with the event sheet open,
// only the part above the sheet (see groundAbove).
//
// Zoomed in by k, the ground you can see shrinks toward the center by 1/2^k.
// For the whole screen, the allowed centers are the starting view's ground
// shrunk toward its center by (1 - 1/2^k), so at the starting zoom the map
// can't move at all. For part of the screen, they are the centers that keep
// every corner of that part inside the starting view.
export function constrainToView(view, maxZoom, visible = view.corners) {
  const c0 = merc(view.center)
  const corners = view.corners.map(merc)
  const offsets = visible.map(merc).map(([x, y]) => [x - c0[0], y - c0[1]])
  const wholeScreen = visible === view.corners

  return (lngLat, zoom) => {
    const z = Math.min(maxZoom, Math.max(view.zoom, zoom))
    const t = 2 ** (view.zoom - z)
    let allowed
    if (wholeScreen) {
      if (1 - t < 1e-6) return { center: fromMerc(c0), zoom: z }
      allowed = corners.map(([x, y]) => [c0[0] + (x - c0[0]) * (1 - t), c0[1] + (y - c0[1]) * (1 - t)])
    } else {
      allowed = corners
      for (const [ox, oy] of offsets) allowed = clip(allowed, corners.map(([x, y]) => [x - ox * t, y - oy * t]))
      if (allowed.length < 3) return { center: fromMerc(c0), zoom: z }
    }
    const p = merc(lngLat)
    if (inside(p, allowed)) return { center: lngLat, zoom: z }
    let best = null
    let bestD = Infinity
    for (let i = 0; i < allowed.length; i++) {
      const q = closestOnSegment(p, allowed[i], allowed[(i + 1) % allowed.length])
      const d = Math.hypot(q[0] - p[0], q[1] - p[1])
      if (d < bestD) {
        bestD = d
        best = q
      }
    }
    return { center: fromMerc(best), zoom: z }
  }
}

// The ground the starting view shows above the bottom `inset` pixels of the
// screen (the part not hidden under the event sheet), as [lng, lat] corners.
// Leaves the map where it was.
export function groundAbove(map, view, inset) {
  const { clientWidth: w, clientHeight: h } = map.getContainer()
  const before = { center: map.getCenter(), zoom: map.getZoom() }
  map.jumpTo({ center: view.center, zoom: view.zoom })
  const bottom = Math.max(1, h - inset)
  const corners = [
    [0, 0],
    [w, 0],
    [w, bottom],
    [0, bottom],
  ].map((p) => map.unproject(p).toArray())
  map.jumpTo(before)
  return corners
}

// The camera that shows `lngLat` at `y` pixels from the top, zoomed in only as
// far as the camera rule needs: near the edge of the starting view, the map
// may need a little zoom before it can move. Tries zooms from `fromZoom` in
// quarter steps until the point lands between `within` ([top, bottom] in
// pixels). Leaves the map where it was.
export function cameraToShow(map, lngLat, { fromZoom, maxZoom, y, within }) {
  const { clientWidth: w, clientHeight: h } = map.getContainer()
  const before = { center: map.getCenter(), zoom: map.getZoom() }
  let camera
  for (let zoom = fromZoom; ; zoom = Math.min(maxZoom, zoom + 0.25)) {
    map.jumpTo({ center: lngLat, zoom })
    for (let i = 0; i < 2; i++) {
      const p = map.project(lngLat)
      map.jumpTo({ center: map.unproject([p.x, p.y + h / 2 - y]), zoom })
    }
    const p = map.project(lngLat)
    camera = { center: map.getCenter(), zoom: map.getZoom() }
    const shown = p.y >= within[0] && p.y <= within[1] && p.x >= 0.08 * w && p.x <= 0.92 * w
    if (shown || zoom >= maxZoom) break
  }
  map.jumpTo(before)
  return camera
}
