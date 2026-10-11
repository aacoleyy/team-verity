// A cartoon 3D model of the Hurt Park fountain as it is today: a round pool
// with a low marble curb, ringed by wide concrete steps people sit on, a tall
// foamy jet in the middle with rings of smaller jets around it, and a curved
// marble wall on the uphill (south) side.
//
// Sources: the 2022 renovation write-ups (WaterShapes, Fountain People, HGOR)
// and the park's history. The pool's exact size isn't published; it is sized
// to fit inside the round path on the map.

import { circleRing, projector } from './geo.js'

const MARBLE = '#f4f1ea'
const CONCRETE = '#e6dcc6'
const CONCRETE_DARK = '#d6c9ad'
const WATER = '#79c4ec'
const SPRAY = '#eef9ff'
const INK = '#4b4540'

// radius: outer edge of the step ring, in meters.
export function makeFountain({ lat, lng, radius }) {
  const { toXY, toLngLat } = projector(lat)
  const c = toXY([lng, lat])
  const at = (r, a) => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r]
  const circle = (r, sides = 32) => circleRing(c, r, toLngLat, sides)
  const features = []
  const add = (rings, color, base, top) =>
    features.push({ type: 'Feature', properties: { color, base, top }, geometry: { type: 'Polygon', coordinates: rings } })
  // A flat ring between two radii (outer circle with the inside cut out).
  const band = (r0, r1, color, base, top) => add([circle(r1), circle(r0).reverse()], color, base, top)

  const pool = radius * 0.62
  const curb = pool + 0.45

  // Concrete seat-steps, rising away from the pool like a little amphitheater,
  // each with a thin dark lip on its front edge so the tiers read.
  const steps = 3
  for (let i = 0; i < steps; i++) {
    const r0 = curb + ((radius - curb) * i) / steps
    const r1 = curb + ((radius - curb) * (i + 1)) / steps
    const top = 0.3 + i * 0.3
    band(r0, r1, i % 2 ? CONCRETE_DARK : CONCRETE, 0, top)
    band(r0, r0 + 0.12, INK, top - 0.04, top + 0.02)
  }

  // Marble curb with a dark lip, and the water inside it.
  band(pool, curb, MARBLE, 0, 0.45)
  band(pool, pool + 0.1, INK, 0.41, 0.47)
  add([circle(pool)], WATER, 0, 0.3)

  // Jets: a tall foamy plume in the middle, then two rings of smaller jets.
  add([circle(0.5, 10)], SPRAY, 0.3, 4.4)
  add([circle(0.95, 12)], SPRAY, 3.8, 4.7)
  const ring = (r, n, h, size) => {
    for (let i = 0; i < n; i++) {
      add([circleRing(at(r, (i / n) * Math.PI * 2), size, toLngLat, 6)], SPRAY, 0.3, h + (i % 2) * 0.3)
    }
  }
  ring(1.3, 8, 1.7, 0.24)
  ring(2.5, 12, 0.9, 0.26)

  // Curved marble wall wrapping the uphill (south) half, standing on the top
  // step's outer edge so it stays inside the round lawn.
  const wall = []
  const from = Math.PI * 1.1
  const to = Math.PI * 1.9
  const n = 20
  for (let i = 0; i <= n; i++) wall.push(toLngLat(at(radius, from + ((to - from) * i) / n)))
  for (let i = n; i >= 0; i--) wall.push(toLngLat(at(radius - 0.5, from + ((to - from) * i) / n)))
  wall.push(wall[0])
  add([wall], MARBLE, 0.9, 1.8)
  add([wall], INK, 1.8, 1.95)

  return { type: 'FeatureCollection', features }
}
