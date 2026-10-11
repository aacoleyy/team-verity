// Cartoon campus style, like a cozy storybook game map (after p's style
// pictures, 10 Oct): textured grass, pastel 3D buildings with pale walls,
// colored roofs, windows and soft shadows, round trees, hedges,
// flowers, benches, the Hurt Park fountain, detailed Library North and Langdale
// Hall, and
// cream walkways with ink outlines. No
// roads, street names, place labels, shop/POI icons, water, rail or anything
// else from the map data: only grass, walkways inside Hurt Park, and the wide
// paved walkways p drew (pavedWalkways.js).
//
// Buildings, walkways, scenery and the fountain are not read from the map
// data by the style. CampusMap fills their sources in (see campusBuildings.js,
// buildingDetails.js, library.js, langdale.js, walkways in CampusMap.jsx, scenery.js and
// fountain.js).
//
// Map data: OpenFreeMap (free, no account or API key), built from
// OpenStreetMap. Tweak the colors in PALETTE.

export const PALETTE = {
  grass: '#a3d47c',
  trees: '#7cbc5a',
  walkway: '#f7f1dc',
  plaza: '#efe6c8',
  paved: '#f1e3d6',
  ink: '#4b4540',
  shadow: '#5c7d43',
  sky: '#bfe4f6',
}

const HEIGHT = ['get', 'height']

const EMPTY = { type: 'FeatureCollection', features: [] }
const geojson = (data = EMPTY) => ({ type: 'geojson', data })

// The world with a hole cut out for the part of campus the map shows.
// `area` is a closed [lng, lat] ring.
export function outsideMask(area) {
  return {
    type: 'Polygon',
    coordinates: [[[-179, -85], [179, -85], [179, 85], [-179, 85], [-179, -85]], [...area].reverse()],
  }
}

// Extruded shapes whose color and heights come from each feature's
// `color`, `base` and `top` properties.
const shapes3d = (id, source) => ({
  id,
  type: 'fill-extrusion',
  source,
  paint: {
    'fill-extrusion-color': ['get', 'color'],
    'fill-extrusion-base': ['get', 'base'],
    'fill-extrusion-height': ['get', 'top'],
    'fill-extrusion-vertical-gradient': false,
  },
})

// area: the [lng, lat] ring the map shows. plazas, fountain, landmarks: GeoJSON.
// paved: { shapes } GeoJSON from makePavedWalkways.
export default function makeCampusMapStyle({ area, plazas = EMPTY, paved = {}, fountain = EMPTY, landmarks = EMPTY }) {
  return {
    version: 8,
    sky: {
      'sky-color': PALETTE.sky,
      'horizon-color': PALETTE.sky,
      'fog-color': PALETTE.sky,
      'sky-horizon-blend': 0.5,
      'horizon-fog-blend': 0.5,
      'fog-ground-blend': 1,
    },
    // Strong, flat light from one side so each wall reads as its own shade,
    // like a cartoon.
    light: { anchor: 'viewport', color: '#ffffff', intensity: 0.5, position: [1.2, 220, 35] },
    sources: {
      openmaptiles: { type: 'vector', url: 'https://tiles.openfreemap.org/planet' },
      'campus-buildings': geojson(),
      'building-details': geojson(),
      landmarks: geojson(landmarks),
      'custom-plazas': geojson(plazas),
      walkways: geojson(),
      paved: geojson(paved.shapes),
      fountain: geojson(fountain),
      scenery: geojson(),
      flowers: geojson(),
      'outside-mask': geojson(outsideMask(area)),
    },
    layers: [
      // Grass and lawns use small hand-drawn textures (see cartoonImages.js).
      { id: 'grass-color', type: 'background', paint: { 'background-color': PALETTE.grass } },
      { id: 'grass-ground', type: 'background', paint: { 'background-pattern': 'grass-tex' } },
      {
        id: 'trees',
        type: 'fill',
        source: 'openmaptiles',
        'source-layer': 'landcover',
        filter: ['==', ['get', 'class'], 'wood'],
        paint: { 'fill-color': PALETTE.trees },
      },
      {
        id: 'lawn-landcover',
        type: 'fill',
        source: 'openmaptiles',
        'source-layer': 'landcover',
        filter: ['==', ['get', 'class'], 'grass'],
        paint: { 'fill-pattern': 'lawn-tex' },
      },
      {
        id: 'lawn-landuse',
        type: 'fill',
        source: 'openmaptiles',
        'source-layer': 'landuse',
        filter: ['match', ['get', 'class'], ['pitch', 'playground', 'grass'], true, false],
        paint: { 'fill-pattern': 'lawn-tex' },
      },
      {
        id: 'lawn-park',
        type: 'fill',
        source: 'openmaptiles',
        'source-layer': 'park',
        paint: { 'fill-pattern': 'lawn-tex' },
      },
      {
        id: 'lawn-park-edge',
        type: 'line',
        source: 'openmaptiles',
        'source-layer': 'park',
        paint: { 'line-color': PALETTE.shadow, 'line-width': 2, 'line-opacity': 0.6 },
      },
      {
        id: 'walkway-edge',
        type: 'line',
        source: 'walkways',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': PALETTE.ink,
          'line-opacity': 0.75,
          'line-width': ['interpolate', ['exponential', 1.5], ['zoom'], 15, 4, 19, 20],
        },
      },
      {
        id: 'walkway',
        type: 'line',
        source: 'walkways',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': PALETTE.walkway,
          'line-width': ['interpolate', ['exponential', 1.5], ['zoom'], 15, 2.2, 19, 15],
        },
      },
      // Hand-placed plazas (custom-plazas in src/data/campusExtras.js).
      { id: 'custom-plaza', type: 'fill', source: 'custom-plazas', paint: { 'fill-color': PALETTE.plaza } },
      {
        id: 'custom-plaza-edge',
        type: 'line',
        source: 'custom-plazas',
        paint: { 'line-color': PALETTE.ink, 'line-width': 2, 'line-opacity': 0.7 },
      },
      // Wide paved walkways: one solid pale pink color, no joints or curbs, so
      // the walkways and the patio flow together.
      { id: 'paved', type: 'fill', source: 'paved', paint: { 'fill-color': PALETTE.paved } },
      {
        // Flower patches: flat colored dots lying on the grass.
        id: 'flowers',
        type: 'circle',
        source: 'flowers',
        paint: {
          'circle-color': ['get', 'color'],
          'circle-radius': ['interpolate', ['exponential', 2], ['zoom'], 15, 0.6, 19, 7],
          'circle-stroke-color': PALETTE.ink,
          'circle-stroke-width': ['interpolate', ['linear'], ['zoom'], 15, 0, 17, 0.6, 19, 1.2],
          'circle-pitch-alignment': 'map',
          'circle-pitch-scale': 'map',
        },
      },
      {
        // Everything past the edge of the map is plain grass. The camera never
        // shows past the edge, so this only hides the data out there.
        id: 'outside',
        type: 'fill',
        source: 'outside-mask',
        paint: { 'fill-pattern': 'grass-tex' },
      },
      {
        // Soft drop shadow on the grass, up and to the right of each building.
        id: 'building-shadow',
        type: 'fill',
        source: 'campus-buildings',
        paint: {
          'fill-color': PALETTE.shadow,
          'fill-opacity': 0.45,
          'fill-translate': [10, -6],
          'fill-translate-anchor': 'viewport',
        },
      },
      {
        // Ink line around the foot of each building.
        id: 'building-outline',
        type: 'line',
        source: 'campus-buildings',
        layout: { 'line-join': 'round' },
        paint: { 'line-color': PALETTE.ink, 'line-width': 2, 'line-opacity': 0.6 },
      },
      {
        // Buildings: pale walls under a roof in the building's color. Windows,
        // doors, parapets, roof units and hedges come from buildingDetails.js.
        // Buildings with their own model (Library North) are drawn by it.
        id: 'building-walls',
        type: 'fill-extrusion',
        source: 'campus-buildings',
        filter: ['!', ['has', 'model']],
        paint: {
          'fill-extrusion-color': ['coalesce', ['get', 'wall'], ['get', 'color']],
          'fill-extrusion-height': HEIGHT,
          'fill-extrusion-base': 0,
          'fill-extrusion-vertical-gradient': false,
        },
      },
      {
        id: 'building-roof',
        type: 'fill-extrusion',
        source: 'campus-buildings',
        filter: ['!', ['has', 'model']],
        paint: {
          'fill-extrusion-color': ['get', 'color'],
          'fill-extrusion-height': ['+', HEIGHT, 0.3],
          'fill-extrusion-base': HEIGHT,
          'fill-extrusion-vertical-gradient': false,
        },
      },
      shapes3d('building-details', 'building-details'),
      shapes3d('landmarks', 'landmarks'),
      // Trees, bushes and benches (scenery.js), and the fountain (fountain.js).
      shapes3d('scenery', 'scenery'),
      shapes3d('fountain', 'fountain'),
    ],
  }
}
