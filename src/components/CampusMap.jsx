import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import makeCampusMapStyle, { outsideMask } from './campusMapStyle.js'
import { addAllCartoonImages, addCartoonImage } from './cartoonImages.js'
import { pickBuildings } from './campusBuildings.js'
import { makeScenery } from './scenery.js'
import { clipLines, linesOf } from './geo.js'
import { makeFountain } from './fountain.js'
import { makePavedWalkways } from './pavedWalkways.js'
import { makeBuildingDetails } from './buildingDetails.js'
import { makeLibrary } from './library.js'
import { makeLangdale } from './langdale.js'
import { makeStudentCenter } from './studentCenter.js'
import { makeRecCenter } from './recCenter.js'
import { makeTower } from './tower.js'
import { makeArtsHumanities } from './artsHumanities.js'
import { areaRing, cameraToShow, constrainToView, fitPoints, groundAbove } from './viewFit.js'
import keptBuildings, { KEEP_RADIUS_METERS, customBuildings } from '../data/keptBuildings.js'
import {
  bigBenches,
  customPlazas,
  frameAlso,
  hurtParkFountain,
  hurtParkOutline,
  pavedAreas,
  pavedWalkways,
} from '../data/campusExtras.js'
import defaultBuildings from '../data/buildings.js'
import './CampusMap.css'

// The camera angle: looking south across campus with Hurt Park at the bottom
// (p turned the view back a quarter turn clockwise on 11 Oct), tilted
// so buildings stand up in 3D (p lowered it a little from 45 on 10 Oct).
const BEARING = 180
const PITCH = 49
const MAX_ZOOM = 19.5
// How many zoom levels past the starting view you can zoom out (each is 2x wider),
// and so how far the forest around the campus has to reach.
const ZOOM_OUT = 2

// Room around the pins at the starting view, in pixels. The top is larger
// because each pin's label sits above it.
const PIN_PADDING = { top: 84, right: 64, bottom: 20, left: 64 }

// The camera rule: the screen never shows past the widest view (ZOOM_OUT levels
// out from the starting view, all forest). With the event sheet covering the
// bottom `inset` pixels, only the part above the sheet has to stay inside, so
// a pin near the bottom can still be brought up above the sheet.
function cameraRule(map, view, inset) {
  return inset > 0 ? constrainToView(view, MAX_ZOOM, groundAbove(map, view, inset)) : constrainToView(view, MAX_ZOOM)
}

// The wide walkways and winding path p drew on the 10 Oct picture.
const paved = makePavedWalkways(pavedWalkways, pavedAreas)

// Buildings with their own detailed models: Library North (library.js),
// Langdale Hall (langdale.js), the Student Center (studentCenter.js), the
// Rec Center (recCenter.js), the tower between the Student Centers (tower.js)
// and Arts & Humanities (artsHumanities.js).
const library = makeLibrary(
  customBuildings.find((b) => b.model === 'library'),
  pavedWalkways,
)
const langdale = makeLangdale(customBuildings.find((b) => b.model === 'langdale'), [
  ...paved.shapes.features,
  ...library.ground,
])
const studentCenter = makeStudentCenter(customBuildings.filter((b) => b.model === 'student-center'))
const recCenter = makeRecCenter(customBuildings.find((b) => b.model === 'rec-center'))
const tower = makeTower(customBuildings.find((b) => b.model === 'tower'))
const artsHumanities = makeArtsHumanities(customBuildings.find((b) => b.model === 'arts-humanities'))
const landmarks = {
  shapes: { type: 'FeatureCollection', features: [...library.shapes.features, ...langdale.shapes.features, ...studentCenter.shapes.features, ...recCenter.shapes.features, ...tower.shapes.features, ...artsHumanities.shapes.features] },
  ground: [...library.ground, ...langdale.ground],
}

const plazasGeoJSON = {
  type: 'FeatureCollection',
  features: customPlazas.map((p) => ({
    type: 'Feature',
    properties: { id: p.id },
    geometry: { type: 'Polygon', coordinates: [p.outline] },
  })),
}

// Open the app with ?editPins to drag pins and print fixed coordinates.
const editMode =
  typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).has('editPins')

function pinElement(building) {
  const el = document.createElement('button')
  el.type = 'button'
  el.className = 'campus-marker'
  el.setAttribute('aria-label', building.name)
  el.title = building.name
  el.innerHTML = `
    <span class="campus-pin-label"><span class="campus-pin-name"></span></span>
    <span class="campus-pin" style="--pin:${building.color}">
      <span class="campus-pin-dot"></span>
    </span>`
  el.querySelector('.campus-pin-name').textContent = building.shortName ?? building.name
  return el
}

export default function CampusMap({
  onSelectBuilding,
  selectedBuildingId = null,
  buildings = defaultBuildings,
  eventCounts = {},
  // Pixels at the bottom of the map hidden under the event sheet while a pin
  // is selected. The map moves the selected pin up above them.
  bottomInset = 0,
}) {
  const containerRef = useRef(null)
  const markersRef = useRef({})
  const [map, setMap] = useState(null)
  const [positions, setPositions] = useState(() =>
    Object.fromEntries(buildings.map((b) => [b.id, [b.lat, b.lng]])),
  )
  const [keepSpots, setKeepSpots] = useState(keptBuildings)
  const viewRef = useRef(null)
  // The widest view: the ground you see fully zoomed out.
  const wideRef = useRef(null)
  // How much of the map's bottom the camera rule currently leaves to the sheet.
  const insetRef = useRef(0)
  // The camera rule in force, and a counter that cancels a rule switch still
  // waiting for its glide to end.
  const rulesRef = useRef({ active: null, token: 0 })
  // Counts re-framings after a resize, so the selected pin is brought back up.
  const [framed, setFramed] = useState(0)
  // Redraws the buildings and scenery; set once the map data has loaded.
  const redrawRef = useRef(null)
  const onSelectRef = useRef(onSelectBuilding)
  useEffect(() => {
    onSelectRef.current = onSelectBuilding
  })

  // Create the map once.
  useEffect(() => {
    const pins = buildings
    // Until the map is framed, leave the whole area around the pins open.
    const firstArea = [
      [pins[0].lng - 0.01, pins[0].lat - 0.01],
      [pins[0].lng + 0.01, pins[0].lat - 0.01],
      [pins[0].lng + 0.01, pins[0].lat + 0.01],
      [pins[0].lng - 0.01, pins[0].lat + 0.01],
      [pins[0].lng - 0.01, pins[0].lat - 0.01],
    ]
    const m = new maplibregl.Map({
      container: containerRef.current,
      style: makeCampusMapStyle({
        area: firstArea,
        plazas: plazasGeoJSON,
        paved,
        landmarks: landmarks.shapes,
        fountain: makeFountain(hurtParkFountain),
      }),
      center: [pins[0].lng, pins[0].lat],
      zoom: 16,
      bearing: BEARING,
      pitch: PITCH,
      maxPitch: 60,
      maxZoom: MAX_ZOOM,
      // One short line at the bottom instead of the big pop-out box on phones.
      attributionControl: { compact: false, customAttribution: '<a href="https://maplibre.org/">MapLibre</a>' },
      dragRotate: false,
      pitchWithRotate: false,
      touchPitch: false,
    })
    m.on('styleimagemissing', (e) => addCartoonImage(m, e.id))
    m.on('style.load', () => addAllCartoonImages(m))
    m.touchZoomRotate.disableRotation()
    m.keyboard.disableRotation()

    // Frame the pins (and the whole Rec Center) for the starting view. You can zoom out
    // ZOOM_OUT levels from there and drag the map anywhere inside that wider ground.
    const frame = () => {
      const rules = rulesRef.current
      rules.token++
      m.stop()
      m.setTransformConstrain(null)
      m.setMinZoom(0)
      const toFit = [...pins, ...frameAlso.map(([lng, lat]) => ({ lng, lat }))]
      const side = Math.min(PIN_PADDING.left, m.getContainer().clientWidth * 0.05)
      const padding = { ...PIN_PADDING, left: side, right: side }
      const view = fitPoints(m, toFit, { bearing: BEARING, pitch: PITCH, padding })
      viewRef.current = view
      // The ground the screen covers when fully zoomed out.
      const wideZoom = view.zoom - ZOOM_OUT
      m.jumpTo({ center: view.center, zoom: wideZoom, bearing: BEARING, pitch: PITCH })
      const { clientWidth: cw, clientHeight: ch } = m.getContainer()
      const wide = {
        center: view.center,
        zoom: wideZoom,
        corners: [[0, 0], [cw, 0], [cw, ch], [0, ch]].map((q) => m.unproject(q).toArray()),
      }
      wideRef.current = wide
      m.setMinZoom(wideZoom)
      m.jumpTo({ center: view.center, zoom: view.zoom, bearing: BEARING, pitch: PITCH })
      rules.active = cameraRule(m, wide, insetRef.current)
      m.setTransformConstrain(rules.active)
      m.getSource('outside-mask')?.setData(outsideMask(areaRing(wide, 0.1)))
    }
    frame()

    // Buildings and scenery are worked out from the map data once it loads.
    let latestSpots = keptBuildings
    const redraw = (spots = latestSpots) => {
      latestSpots = spots
      const find = (sourceLayer) => m.querySourceFeatures('openmaptiles', { sourceLayer })
      const picked = pickBuildings(find('building'), spots, customBuildings, KEEP_RADIUS_METERS)
      const details = makeBuildingDetails(picked, {
        avoid: [...plazasGeoJSON.features, ...paved.shapes.features, ...landmarks.ground],
        keepClear: [
          ...pins.map((p) => ({ lng: p.lng, lat: p.lat, r: 6 })),
          ...bigBenches.map((b) => ({ lng: b.lng, lat: b.lat, r: 8 })),
        ],
      })
      const kept = details.buildings
      m.getSource('campus-buildings')?.setData(kept)
      m.getSource('building-details')?.setData(details.shapes)
      // Map-data walkways (OpenStreetMap class "path": footways, sidewalks,
      // steps): only the parts inside Hurt Park are drawn. The wide walkways
      // p drew are separate (paved).
      const pathLines = find('transportation')
        .filter((f) => f.properties.class === 'path' && f.properties.brunnel !== 'tunnel')
        .filter((f) => f.geometry.type.endsWith('LineString'))
        .flatMap((f) => linesOf(f.geometry))
      const walkways = {
        type: 'FeatureCollection',
        features: clipLines(pathLines, hurtParkOutline).map((coordinates) => ({
          type: 'Feature',
          properties: {},
          geometry: { type: 'LineString', coordinates },
        })),
      }
      m.getSource('walkways')?.setData(walkways)
      const scenery = makeScenery({
        area: areaRing(viewRef.current),
        wide: areaRing(wideRef.current, 0.1),
        walkways: walkways.features,
        plazas: [...plazasGeoJSON.features, ...paved.shapes.features, ...landmarks.ground],
        buildings: kept.features,
        benches: bigBenches,
        pins,
        fountain: hurtParkFountain,
      })
      m.getSource('scenery')?.setData(scenery.shapes)
      m.getSource('flowers')?.setData(scenery.flowers)
    }
    const onData = (e) => {
      if (e.sourceId !== 'openmaptiles' || !m.isSourceLoaded('openmaptiles')) return
      m.off('sourcedata', onData)
      redrawRef.current = redraw
      redraw()
    }
    m.on('load', () => {
      m.getSource('outside-mask')?.setData(outsideMask(areaRing(wideRef.current, 0.1)))
      m.on('sourcedata', onData)
      if (m.isSourceLoaded('openmaptiles')) onData({ sourceId: 'openmaptiles' })
    })

    // Re-frame when the map changes size (phone rotated, window resized).
    let resizeTimer
    m.on('resize', () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => {
        frame()
        redrawRef.current?.()
        setFramed((n) => n + 1)
      }, 150)
    })

    setMap(m)
    return () => {
      clearTimeout(resizeTimer)
      m.remove()
    }
    // The map is built once; edit-mode spot moves go through redrawRef.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Pins.
  useEffect(() => {
    if (!map) return
    const markers = {}
    // Pins nearer the bottom of the screen are nearer the viewer, so they sit
    // on top where labels overlap.
    const screenY = (b) => map.project([positions[b.id][1], positions[b.id][0]]).y
    const depth = [...buildings].sort((a, b) => screenY(a) - screenY(b)).map((b) => b.id)
    for (const b of buildings) {
      const el = pinElement(b)
      el.style.setProperty('--depth', depth.indexOf(b.id) + 1)
      el.addEventListener('click', (e) => {
        e.stopPropagation()
        onSelectRef.current?.(b.id)
      })
      const marker = new maplibregl.Marker({ element: el, anchor: 'bottom', draggable: editMode })
        .setLngLat([positions[b.id][1], positions[b.id][0]])
        .addTo(map)
      marker.on('dragend', () => {
        const { lat, lng } = marker.getLngLat()
        setPositions((prev) => ({ ...prev, [b.id]: [lat, lng] }))
      })
      markers[b.id] = marker
    }
    markersRef.current = markers
    return () => Object.values(markers).forEach((mk) => mk.remove())
    // Positions only change by dragging the marker itself.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, buildings])

  // Where a label would overlap another label or cover the middle of another
  // pin (zoomed out on a phone), it hides so every pin stays tappable. Nearer
  // pins and the selected pin get their labels first.
  // Zooming in brings the hidden labels back.
  useEffect(() => {
    if (!map) return
    let frame = 0
    const declutter = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const items = buildings
          .map((b) => {
            const el = markersRef.current[b.id]?.getElement()
            if (!el) return null
            const label = el.querySelector('.campus-pin-label')
            return {
              label,
              labelBox: label.getBoundingClientRect(),
              pinBox: el.querySelector('.campus-pin').getBoundingClientRect(),
              rank: b.id === selectedBuildingId ? Infinity : el.getBoundingClientRect().bottom,
            }
          })
          .filter(Boolean)
          .sort((a, b) => b.rank - a.rank)
        // The middle of a pin, which must stay uncovered so it can be tapped.
        const core = (r) => {
          const dx = r.width * 0.25
          const dy = r.height * 0.25
          return { left: r.left + dx, right: r.right - dx, top: r.top + dy, bottom: r.bottom - dy }
        }
        const hits = (a, b) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom
        const shown = []
        for (const item of items) {
          const blocked =
            shown.some((box) => hits(box, item.labelBox)) ||
            items.some((other) => other !== item && hits(core(other.pinBox), item.labelBox))
          item.label.style.visibility = blocked ? 'hidden' : ''
          if (!blocked) shown.push(item.labelBox)
        }
      })
    }
    declutter()
    map.on('move', declutter)
    map.on('resize', declutter)
    return () => {
      cancelAnimationFrame(frame)
      map.off('move', declutter)
      map.off('resize', declutter)
    }
  }, [map, buildings, selectedBuildingId, eventCounts])

  // Selected pin + event counts on the labels.
  useEffect(() => {
    for (const b of buildings) {
      const el = markersRef.current[b.id]?.getElement()
      if (!el) continue
      el.classList.toggle('is-selected', b.id === selectedBuildingId)
      const label = el.querySelector('.campus-pin-label')
      label.querySelector('.campus-pin-count')?.remove()
      if (eventCounts[b.id]) {
        const count = document.createElement('span')
        count.className = 'campus-pin-count'
        count.textContent = eventCounts[b.id]
        label.append(count)
      }
    }
  }, [map, buildings, selectedBuildingId, eventCounts])

  // Bring the selected pin up above the event sheet, and switch the camera
  // rule as the sheet opens, closes or changes height (and after a resize).
  useEffect(() => {
    const view = wideRef.current
    if (!map || !view) return
    const before = insetRef.current
    const inset = selectedBuildingId ? bottomInset : 0
    if (!selectedBuildingId && before === 0) return
    insetRef.current = inset
    const rules = rulesRef.current
    const token = ++rules.token
    const oldRule = rules.active
    const rule = cameraRule(map, view, inset)
    const camera = { center: map.getCenter(), zoom: map.getZoom() }

    // Work out where to go under the new rule. Nothing is drawn until this
    // effect is done, so trying it out doesn't show on screen.
    map.setTransformConstrain(rule)
    let target = { center: map.getCenter(), zoom: map.getZoom() }
    const [lat, lng] = positions[selectedBuildingId] ?? []
    if (selectedBuildingId && lat !== undefined) {
      const above = map.getContainer().clientHeight - inset
      target = cameraToShow(map, [lng, lat], {
        fromZoom: Math.max(map.getZoom(), 17.2),
        maxZoom: MAX_ZOOM,
        y: above * 0.6,
        within: [90, above - 12],
      })
    }

    if (inset >= before) {
      // The same or a looser rule: it applies now, and the map glides.
      rules.active = rule
      map.easeTo({ ...target, duration: 500 })
      return
    }
    // A stricter rule (the sheet closed or got shorter): glide to a spot it
    // allows under the old rule, then switch, so the map never jumps.
    map.setTransformConstrain(oldRule)
    map.jumpTo(camera)
    map.easeTo({ ...target, duration: 400 })
    const apply = () => {
      if (rules.token !== token) return
      rules.active = rule
      map.setTransformConstrain(rule)
      map.fire('move')
    }
    if (map.isEasing()) map.once('moveend', apply)
    else apply()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, selectedBuildingId, bottomInset, framed])

  // Kept buildings follow the 🏠 spots while they're dragged in edit mode.
  useEffect(() => {
    if (editMode) redrawRef.current?.(keepSpots)
  }, [keepSpots])

  // 🏠 spot markers in edit mode.
  useEffect(() => {
    if (!map || !editMode) return
    const markers = keepSpots.map((k) => {
      const el = document.createElement('div')
      el.className = 'keep-spot'
      el.textContent = '🏠'
      el.title = `Keep: ${k.name}`
      const mk = new maplibregl.Marker({ element: el, draggable: true }).setLngLat([k.lng, k.lat]).addTo(map)
      mk.on('dragend', () => {
        const { lat, lng } = mk.getLngLat()
        setKeepSpots((prev) => prev.map((p) => (p.id === k.id ? { ...p, lat, lng } : p)))
      })
      return mk
    })
    return () => markers.forEach((mk) => mk.remove())
    // Re-adding markers on every drag would cancel the drag; ids don't change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map])

  return (
    <div className="campus-map">
      <div ref={containerRef} className="campus-map-gl" />
      <ZoomButtons map={map} viewRef={viewRef} />
      {editMode && <PinEditor buildings={buildings} positions={positions} keepSpots={keepSpots} />}
    </div>
  )
}

function ZoomButtons({ map, viewRef }) {
  const [zoom, setZoom] = useState(null)

  useEffect(() => {
    if (!map) return
    const update = () => setZoom(map.getZoom())
    update()
    // 'move' too: switching the camera rule can change the zoom with no zoomend.
    map.on('move', update)
    map.on('zoomend', update)
    return () => {
      map.off('move', update)
      map.off('zoomend', update)
    }
  }, [map])

  if (!map) return null
  const atMin = zoom !== null && zoom <= map.getMinZoom() + 0.05
  const atMax = zoom !== null && zoom >= map.getMaxZoom() - 0.05

  return (
    <div className="map-zoom">
      <button type="button" onClick={() => map.zoomIn()} disabled={atMax} aria-label="Zoom in">
        +
      </button>
      <button type="button" onClick={() => map.zoomOut()} disabled={atMin} aria-label="Zoom out">
        −
      </button>
      <button
        type="button"
        onClick={() =>
          map.easeTo({ center: viewRef.current.center, zoom: viewRef.current.zoom, bearing: BEARING, pitch: PITCH, duration: 400 })
        }
        aria-label="Show whole campus"
      >
        ⤢
      </button>
    </div>
  )
}

function PinEditor({ buildings, positions, keepSpots }) {
  const pinText = buildings
    .map((b) => {
      const [lat, lng] = positions[b.id]
      return `${b.id}: lat: ${lat.toFixed(6)}, lng: ${lng.toFixed(6)},`
    })
    .join('\n')
  const keepText = keepSpots
    .map((k) => `${k.id}: lat: ${k.lat.toFixed(6)}, lng: ${k.lng.toFixed(6)},`)
    .join('\n')
  const text = `// buildings.js (pins)\n${pinText}\n\n// keptBuildings.js (🏠 spots)\n${keepText}`

  return (
    <details className="pin-editor">
      <summary>Pin edit mode (tap to show coordinates)</summary>
      <span>
        Drag pins onto their places and 🏠 spots onto the buildings to keep, then copy these into
        buildings.js and keptBuildings.js.
      </span>
      <pre>{text}</pre>
      <button type="button" onClick={() => navigator.clipboard?.writeText(text)}>
        Copy
      </button>
    </details>
  )
}
