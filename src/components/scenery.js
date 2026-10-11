// Cartoon scenery on the open grass: leafy round trees, round
// bushes, small ground plants, flower patches, and the big wooden benches p placed. A wall of big
// trees runs along the edges of the map so no ground shows there, and trees
// thin out toward the buildings. Nothing lands on a walkway, plaza, building, the
// fountain or under a pin.
// Trees, bushes and benches are small 3D shapes so buildings hide the ones
// behind them; flowers are flat dots on the grass.

import { boxRing, circleRing, inRing, linesOf, polygon, polygonsOf, projector, rng, segDist } from './geo.js'

const COLORS = {
  // [body, sunlit top] pairs, so treetops read as round and leafy.
  leaf: [
    ['#52bd3a', '#86dc58'],
    ['#5cc641', '#94e463'],
    ['#4aaf36', '#7ed352'],
  ],
  shade: '#36882f', // the dark band under a treetop
  trunk: '#b98558',
  trunkBase: '#97683f',
  plants: ['#4fb23a', '#7ccf4f', '#a9d94a', '#3e9a3c'],
  ink: '#4b4540',
  wood: '#c98f5a',
    flowers: ['#f49ac1', '#ffd84d', '#ffffff', '#b98ce6', '#ff9f5a'],
}

// Finds line segments near a point quickly (walkways can have thousands).
function segmentIndex(lines, cell = 20) {
  const grid = new Map()
  const key = (i, j) => `${i},${j}`
  for (const line of lines) {
    for (let k = 1; k < line.length; k++) {
      const a = line[k - 1]
      const b = line[k]
      const [i0, i1] = [Math.floor(Math.min(a[0], b[0]) / cell), Math.floor(Math.max(a[0], b[0]) / cell)]
      const [j0, j1] = [Math.floor(Math.min(a[1], b[1]) / cell), Math.floor(Math.max(a[1], b[1]) / cell)]
      for (let i = i0; i <= i1; i++) {
        for (let j = j0; j <= j1; j++) {
          if (!grid.has(key(i, j))) grid.set(key(i, j), [])
          grid.get(key(i, j)).push([a, b])
        }
      }
    }
  }
  // Distance from p to the nearest segment, looking no further than `max`.
  return (p, max) => {
    let d = Infinity
    const r = Math.ceil(max / cell)
    const ci = Math.floor(p[0] / cell)
    const cj = Math.floor(p[1] / cell)
    for (let i = ci - r; i <= ci + r; i++) {
      for (let j = cj - r; j <= cj + r; j++) {
        for (const [a, b] of grid.get(key(i, j)) ?? []) d = Math.min(d, segDist(p, a, b))
      }
    }
    return d
  }
}

// area: [lng, lat] ring to fill. walkways / plazas / buildings: GeoJSON
// features. pins: [{ lat, lng }]. fountain: { lat, lng, radius }. benches:
// [{ lng, lat, heading }] (heading: compass direction the seat runs along).
export function makeScenery({ area, wide = null, walkways, plazas, buildings, pins, fountain, benches = [] }) {
  const lat0 = area.reduce((s, p) => s + p[1], 0) / area.length
  const { toXY, toLngLat } = projector(lat0)
  const areaXY = area.map(toXY)
  const walkLines = walkways.flatMap((f) => linesOf(f.geometry)).map((l) => l.map(toXY))
  const walkDist = segmentIndex(walkLines)
  const plazaRings = plazas.flatMap((f) => polygonsOf(f.geometry).map((rings) => rings[0].map(toXY)))
  const plazaDist = segmentIndex(plazaRings)
  const buildingRings = buildings.flatMap((f) => polygonsOf(f.geometry).map((rings) => rings[0].map(toXY)))
  const buildingDist = segmentIndex(buildingRings)
  const pinXY = pins.map((p) => toXY([p.lng, p.lat]))
  const fountainXY = toXY([fountain.lng, fountain.lat])

  const inside = (p, rings) => rings.some((ring) => inRing(p, ring))
  const near = (p, list, d) => list.some((q) => Math.hypot(p[0] - q[0], p[1] - q[1]) < d)
  // Is there room for something of radius r at p (inside `ring`), at least
  // `pathGap` meters from any walkway's center line?
  const open = (p, r, pathGap, ring = areaXY) =>
    inRing(p, ring) &&
    walkDist(p, r + pathGap) >= r + pathGap &&
    !inside(p, plazaRings) &&
    plazaDist(p, r + 1.5) >= r + 1.5 &&
    !inside(p, buildingRings) &&
    buildingDist(p, r + 4) >= r + 4 &&
    !near(p, pinXY, 14) &&
    Math.hypot(p[0] - fountainXY[0], p[1] - fountainXY[1]) > fountain.radius + 10

  // Flowers thin out away from the pins and buildings.
  const skipChance = (p) => {
    const d = Math.min(buildingDist(p, 120), ...pinXY.map((q) => Math.hypot(p[0] - q[0], p[1] - q[1])))
    return 0.3 + 0.55 * Math.min(1, Math.max(0, (d - 50) / 100))
  }

  // Trees fade out toward the buildings: `outward` is how far a point is from
  // the nearest building, as a fraction of FADE meters. Right at a building
  // there are no trees, the trees get denser out to FADE meters (the fade is
  // all inside that radius), and from there out the big trees are packed solid.
  // The fade edge is warped by soft noise so it never follows a straight or
  // even line: some spots fill in sooner, others stay open longer.
  const FADE = 170
  const noiseRand = rng(13)
  const waves = Array.from({ length: 7 }, () => {
    const a = noiseRand() * Math.PI * 2
    const f = 0.012 + noiseRand() * 0.03
    return [Math.cos(a) * f, Math.sin(a) * f, noiseRand() * Math.PI * 2]
  })
  const noise = (p) => waves.reduce((sum, [fx, fy, ph]) => sum + Math.sin(p[0] * fx + p[1] * fy + ph), 0) / waves.length
  const outward = (p) => Math.min(1, Math.max(0, (buildingDist(p, FADE) + noise(p) * 70) / FADE))
  const BORDER = 1
  const treeSkip = (p) => {
    const t = outward(p)
    return 1 - t * t * t // gradual: 1 at the building, 0 at FADE meters
  }

  const features = []
  const flowers = []
  const taken = [] // [x, y, r] of things already placed
  const free = (p, r) => taken.every(([x, y, rr]) => Math.hypot(p[0] - x, p[1] - y) >= r + rr)
  const part = (ring, props) => features.push(polygon(ring, props))

  const xs = areaXY.map((p) => p[0])
  const ys = areaXY.map((p) => p[1])
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)]

  // The big benches p placed, each facing the nearest walkway or plaza.
  for (const spot of benches) {
    const c = toXY([spot.lng, spot.lat])
    const h = (spot.heading * Math.PI) / 180
    const dir = [Math.sin(h), Math.cos(h)]
    const side = [-dir[1], dir[0]]
    const away = (k) => plazaDist([c[0] + side[0] * k * 3, c[1] + side[1] * k * 3], 80)
    const back = away(1) >= away(-1) ? side : [-side[0], -side[1]]
    bench(c, dir, back, 3)
  }

  // The dense border ring, the trees inside it and the far forest share one
  // wavy edge (`inOuter`), so there's no straight seam where they meet.
  const cx = areaXY.slice(0, -1).reduce((m, q) => [m[0] + q[0] / (areaXY.length - 1), m[1] + q[1] / (areaXY.length - 1)], [0, 0])
  const outerXY = areaXY.map((q) => [cx[0] + (q[0] - cx[0]) * 1.12, cx[1] + (q[1] - cx[1]) * 1.12])
  const inOuter = (p) => inRing([p[0] + noise([p[1], p[0]]) * 140, p[1] + noise(p) * 140], outerXY)
  const outerXs = outerXY.map((q) => q[0])
  const outerYs = outerXY.map((q) => q[1])

  // Trees and bushes on a loose grid, thinning out toward the buildings.
  const treeRand = rng(42)
  const pick = (list) => list[Math.floor(treeRand() * list.length)]
  const SPACING = 11
  for (let x = Math.min(...outerXs) + SPACING / 2; x < Math.max(...outerXs); x += SPACING) {
    for (let y = Math.min(...outerYs) + SPACING / 2; y < Math.max(...outerYs); y += SPACING) {
      const p = [x + (treeRand() - 0.5) * SPACING * 0.8, y + (treeRand() - 0.5) * SPACING * 0.8]
      const kind = treeRand()
      const r = kind < 0.3 ? 2 + treeRand() * 1.2 : 3 + treeRand() * 1.6
      if (outward(p) >= BORDER) continue // the border wall below covers it
      if (treeRand() < treeSkip(p)) continue // open lawn in the middle
      if (!inOuter(p) || !open(p, r, 4.5, outerXY) || !free(p, r + 1)) continue
      tree(p, r, kind)
    }
  }

  // The border: big trees packed so close their tops overlap and hide the
  // ground, from a little inside the edge to a little past it (so the edge of
  // the screen is all treetops too).
  const areaReach = Math.max(...areaXY.map((q) => Math.hypot(q[0] - cx[0], q[1] - cx[1])))
  const DENSE = 5.5
  for (let x = Math.min(...outerXs); x < Math.max(...outerXs); x += DENSE) {
    for (let y = Math.min(...outerYs); y < Math.max(...outerYs); y += DENSE) {
      const p = [x + (treeRand() - 0.5) * DENSE * 0.7, y + (treeRand() - 0.5) * DENSE * 0.7]
      const kind = 0.3 + treeRand() * 0.7 // trees only, no bushes
      const r = 4.5 + treeRand() * 2.5
      if (outward(p) < BORDER || !inOuter(p)) continue
      if (!open(p, r, 4.5, outerXY) || !free(p, r * 0.35)) continue
      tree(p, r, kind)
    }
  }

  // The forest past the starting view, out to the widest zoomed-out view: simple
  // round-topped trees (a body and a lit cap), bigger and further apart the
  // further out they are so there aren't too many to draw.
  if (wide) {
    const wideXY = wide.map(toXY)
    const wxs = wideXY.map((q) => q[0])
    const wys = wideXY.map((q) => q[1])
    const farRand = rng(7)
    const tiers = [
      { from: 0, to: 2.2, step: 8, r: [5, 3] },
      { from: 2.2, to: Infinity, step: 15, r: [9, 4] },
    ]
    for (const { from, to, step, r: [r0, rv] } of tiers) {
      for (let x = Math.min(...wxs); x < Math.max(...wxs); x += step) {
        for (let y = Math.min(...wys); y < Math.max(...wys); y += step) {
          const p = [x + (farRand() - 0.5) * step * 0.7, y + (farRand() - 0.5) * step * 0.7]
          const t = Math.hypot(p[0] - cx[0], p[1] - cx[1]) / areaReach
          if (t < from || t >= to || inOuter(p)) continue
          if (farRand() < treeSkip(p)) continue // keep fading out near buildings
          const r = r0 + farRand() * rv
          if (!open(p, r, 4.5, wideXY)) continue
          // Green leafy trees, like the dense wall inside.
          const [body, light] = pick(COLORS.leaf)
          const top = 7 + farRand() * 4
          part(lobed(p, r, 14), { color: body, base: 0, top })
          part(lobed([p[0] - r * 0.12, p[1] + r * 0.08], r * 0.62, 12), { color: light, base: top, top: top + 0.7 })
        }
      }
    }
  }

  // Small plants scattered over the open ground.
  const plantRand = rng(5)
  for (let x = x0; x < x1; x += 8) {
    for (let y = y0; y < y1; y += 8) {
      const p = [x + plantRand() * 8, y + plantRand() * 8]
      const kindR = plantRand()
      if (plantRand() < 0.35) continue
      if (!open(p, 1, 1.5) || !free(p, 1.2)) continue
      plant(p, kindR)
    }
  }

  // Flower patches: small clusters of colored dots.
  const flowerRand = rng(99)
  for (let x = x0 + 11; x < x1; x += 22) {
    for (let y = y0 + 11; y < y1; y += 22) {
      const c = [x + (flowerRand() - 0.5) * 14, y + (flowerRand() - 0.5) * 14]
      if (flowerRand() < 0.4 + skipChance(c) * 0.6) continue
      if (!open(c, 2.5, 4) || !free(c, 3)) continue
      taken.push([c[0], c[1], 2.5])
      const color = COLORS.flowers[Math.floor(flowerRand() * COLORS.flowers.length)]
      const n = 5 + Math.floor(flowerRand() * 5)
      for (let i = 0; i < n; i++) {
        const a = flowerRand() * Math.PI * 2
        const d = Math.sqrt(flowerRand()) * 2.2
        flowers.push({
          type: 'Feature',
          properties: { color },
          geometry: { type: 'Point', coordinates: toLngLat([c[0] + Math.cos(a) * d, c[1] + Math.sin(a) * d]) },
        })
      }
    }
  }

  // A leafy ring: a circle with a scalloped edge, like a cluster of leaves.
  function lobed(c, r, lobes, rot = 0) {
    const ring = []
    const n = lobes * 3
    for (let i = 0; i <= n; i++) {
      const a = ((i % n) / n) * Math.PI * 2
      const k = r * (1 + 0.09 * Math.cos(lobes * a + rot))
      ring.push(toLngLat([c[0] + Math.cos(a) * k, c[1] + Math.sin(a) * k]))
    }
    return ring
  }

  // A tree or bush of radius r at p. kind < 0.3: a low leafy bush; otherwise a
  // round-topped tree with a flared trunk and two layers of leaves, lit from
  // the top. All the trees are green.
  function tree(p, r, kind) {
    taken.push([p[0], p[1], r])
    const [body, light] = pick(COLORS.leaf)
    const dark = COLORS.shade
    const capAt = (rr) => [p[0] - rr * 0.12, p[1] + rr * 0.08]
    const rot = treeRand() * 6
    if (kind < 0.3) {
      const top = 2 + treeRand() * 1.2
      part(lobed(p, r * 0.94, 8, rot), { color: dark, base: 0, top: 0.4 })
      part(lobed(p, r, 8, rot), { color: body, base: 0.4, top })
      part(lobed(capAt(r), r * 0.6, 7, rot), { color: light, base: top, top: top + 0.5 })
      return
    }
    const trunkTop = 2.2 + treeRand() * 0.8
    part(circleRing(p, 1.0, toLngLat, 8), { color: COLORS.trunkBase, base: 0, top: 0.7 })
    part(circleRing(p, 0.65, toLngLat, 8), { color: COLORS.trunk, base: 0.7, top: trunkTop + 0.6 })
    const top = trunkTop + 4 + treeRand() * 1.6
    part(lobed(p, r * 0.92, 9, rot), { color: dark, base: trunkTop, top: trunkTop + 0.7 })
    part(lobed(p, r, 9, rot), { color: body, base: trunkTop + 0.7, top: top - 1.4 })
    part(lobed(capAt(r * 0.8), r * 0.8, 8, rot + 1), { color: body, base: top - 1.4, top })
    part(lobed(capAt(r), r * 0.5, 7, rot + 2), { color: light, base: top, top: top + 0.7 })
  }

  // A small ground plant at p: a tuft of grass blades, a fern star or a few
  // little flowers on leaves.
  function plant(p, kindR) {
    const size = 0.7 + plantRand() * 0.7
    const color = COLORS.plants[Math.floor(plantRand() * COLORS.plants.length)]
    const rot = plantRand() * 6
    taken.push([p[0], p[1], size])
    if (kindR < 0.45) {
      // Grass tuft: spiky star.
      const ring = []
      for (let i = 0; i <= 14; i++) {
        const a = (i / 14) * Math.PI * 2 + rot
        const k = i % 2 ? size * 0.35 : size * 1.1
        ring.push(toLngLat([p[0] + Math.cos(a) * k, p[1] + Math.sin(a) * k]))
      }
      part(ring, { color, base: 0, top: 0.9 + plantRand() * 0.5 })
    } else if (kindR < 0.75) {
      // Leafy plant: a broad star with a lighter center.
      const ring = []
      for (let i = 0; i <= 12; i++) {
        const a = (i / 12) * Math.PI * 2 + rot
        const k = i % 2 ? size * 0.5 : size * 1.3
        ring.push(toLngLat([p[0] + Math.cos(a) * k, p[1] + Math.sin(a) * k]))
      }
      part(ring, { color, base: 0, top: 0.5 })
      part(circleRing(p, size * 0.4, toLngLat, 6), { color: '#c8ea6a', base: 0.5, top: 0.8 })
    } else {
      // Flowers: leaves with a few colored blooms.
      part(lobed(p, size * 1.1, 5, rot), { color: COLORS.plants[0], base: 0, top: 0.5 })
      const bloom = COLORS.flowers[Math.floor(plantRand() * COLORS.flowers.length)]
      for (let i = 0; i < 3; i++) {
        const a = rot + (i / 3) * Math.PI * 2
        const q = [p[0] + Math.cos(a) * size * 0.6, p[1] + Math.sin(a) * size * 0.6]
        part(circleRing(q, 0.38, toLngLat, 5), { color: bloom, base: 0.5, top: 0.95 })
      }
    }
  }

  // A wooden bench `size` times the usual 4 m: seat along `dir`, back rest on
  // the `back` side, dark legs.
  function bench(c, dir, back, size = 1) {
    taken.push([c[0], c[1], 2.5 * size])
    const at = (k) => [c[0] + back[0] * k * size, c[1] + back[1] * k * size]
    for (const s of [-1.5, 1.5]) {
      const leg = [c[0] + dir[0] * s * size, c[1] + dir[1] * s * size]
      part(boxRing(leg, dir, 0.35 * size, 1.1 * size, toLngLat), { color: COLORS.ink, base: 0, top: 0.7 * size })
    }
    part(boxRing(c, dir, 4 * size, 1.3 * size, toLngLat), { color: COLORS.wood, base: 0.7 * size, top: size })
    part(boxRing(at(0.6), dir, 4 * size, 0.25 * size, toLngLat), { color: COLORS.wood, base: size, top: 2 * size })
  }

  return {
    shapes: { type: 'FeatureCollection', features },
    flowers: { type: 'FeatureCollection', features: flowers },
  }
}
