// The only buildings drawn on the map. Everything else is grass.
//
// Most buildings come straight from the map data: each spot below sits inside
// one building, and that building's real outline is drawn. The spots were read
// off p's screenshot of the 3D map (10 Oct 2026, 3:46 PM) after p blocked off
// the buildings to delete; every building p left showing has a spot here.
//
// Langdale Hall, Library North, the Rec Center and the Student Center are
// drawn from the outlines in customBuildings instead: each has its own
// detailed model, and p placed them by hand, so they are spelled out exactly.
// p removed Dahlberg Hall and the small orange building on 11 Oct (02:36);
// grass shows there now. Student Center East came back at 02:57 in a new spot.
//
// To keep another building, open the app with ?editPins, drag a 🏠 spot onto
// it, and paste the printed list back here. A spot keeps the building it is
// inside (or within KEEP_RADIUS_METERS of).

export const KEEP_RADIUS_METERS = 1.5

const keptBuildings = [
  // The building under the Greenway pin (two spots: it has a separate wing).
  { id: 'greenway', name: 'Building by the Greenway', lat: 33.753794, lng: -84.386581, color: '#9fd3bd' },
  { id: 'greenway-wing', name: 'Building by the Greenway (wing)', lat: 33.754162, lng: -84.386534, color: '#9fd3bd' },
]

// Buildings drawn from an exact outline ([lng, lat] corners) instead of the
// map data. `height` is in meters.
export const customBuildings = [
  // Student Center West, placed after p's reference picture (11 Oct 02:12):
  // the old two-part Student Center building beside the long walkway, with
  // shapes read off that picture.
  // Modeled on p's photos (src/components/studentCenter.js).
  {
    id: 'student-center-west',
    name: 'Student Center West',
    color: '#c9b294',
    height: 14,
    model: 'student-center',
    outline: [
      [-84.3858554, 33.7528556],
      [-84.3859396, 33.7527791],
      [-84.3859275, 33.7527159],
      [-84.3859515, 33.752666],
      [-84.3860556, 33.7525829],
      [-84.3861038, 33.7525795],
      [-84.3861319, 33.7525962],
      [-84.3864083, 33.7523301],
      [-84.3861393, 33.7521374],
      [-84.3858789, 33.7523869],
      [-84.3858388, 33.7524068],
      [-84.3856505, 33.7525831],
      [-84.3856586, 33.7526063],
      [-84.3855945, 33.7526629],
      [-84.3858554, 33.7528556],
    ],
  },
  {
    // The smaller wing of Student Center West, toward the Greenway.
    id: 'student-center-west-wing',
    name: 'Student Center West',
    color: '#c9b294',
    height: 11,
    model: 'student-center',
    outline: [
      [-84.3857593, 33.7529387],
      [-84.3858114, 33.7528888],
      [-84.3857913, 33.7528722],
      [-84.3858193, 33.7528423],
      [-84.3855905, 33.7526762],
      [-84.3855544, 33.7527028],
      [-84.3854902, 33.7526662],
      [-84.3854702, 33.7526862],
      [-84.3855144, 33.7527261],
      [-84.3854382, 33.7527992],
      [-84.3856269, 33.7529388],
      [-84.3857593, 33.7529387],
    ],
  },
  {
    // Student Center East, after p's 11 Oct photos, laid out after p's 03:28
    // 3D photo of both Student Centers: a striped block beside SC West across
    // a narrow gap, its street side along the walkway, a raised block on the
    // back of the roof, and a lower curved wing on columns at the front corner
    // by the gap, facing the plaza. The entrance and banner face the plaza.
    // Nudged back toward the tower by p at 03:50.
    id: 'student-center-east',
    name: 'Student Center East',
    color: '#c9b294',
    height: 12,
    model: 'student-center',
    poleBanners: true,
    entrance: [-84.3851447, 33.7530443],
    roof: {
      height: 3.5,
      outline: [
        [-84.3846024, 33.7527546],
        [-84.384825, 33.7529124],
        [-84.3850833, 33.752657],
        [-84.3848607, 33.7524992],
        [-84.3846024, 33.7527546],
      ],
    },
    outline: [
      [-84.3845567, 33.7527578],
      [-84.3850679, 33.7531202],
      [-84.3853681, 33.7528233],
      [-84.3848569, 33.7524609],
      [-84.3845567, 33.7527578],
    ],
  },
  {
    // The curved wing: open on white columns at the ground, glass behind.
    id: 'student-center-east-wing',
    name: 'Student Center East',
    color: '#c9b294',
    height: 7,
    model: 'student-center',
    columns: true,
    outline: [
      [-84.3853681, 33.7528233],
      [-84.3852355, 33.7529545],
      [-84.3852561, 33.7529657],
      [-84.3852801, 33.7529726],
      [-84.3853068, 33.7529749],
      [-84.3853354, 33.7529727],
      [-84.385365, 33.7529659],
      [-84.3853946, 33.7529547],
      [-84.3854235, 33.7529396],
      [-84.3854507, 33.7529209],
      [-84.3854753, 33.7528993],
      [-84.3853681, 33.7528233],
    ],
  },
  {
    // The tower behind the gap between the Student Centers (p's 03:28 photo):
    // brown piers and white floor bands, round towers at the corners and
    // halfway along the long sides, a penthouse on the roof (nudged by p at
    // 03:50 to just behind SC East). A short glass-roofed bridge runs from it
    // to SC West over the walkway, and a small brick stair
    // tower stands in the gap. No pin or label.
    id: 'tower-between-student-centers',
    name: 'Tower between the Student Centers',
    color: '#7d7068',
    height: 56,
    model: 'tower',
    outline: [
      [-84.3850988, 33.7524499],
      [-84.3853792, 33.7526486],
      [-84.3855467, 33.7524829],
      [-84.3852664, 33.7522842],
      [-84.3850988, 33.7524499],
    ],
    link: {
      base: 4,
      top: 7.5,
      pillars: [[-84.3855887, 33.7526052]],
      outline: [
        [-84.3854536, 33.7525568],
        [-84.3855938, 33.7526562],
        [-84.3856496, 33.7526009],
        [-84.3855095, 33.7525015],
        [-84.3854536, 33.7525568],
      ],
    },
    stair: {
      height: 9,
      outline: [
        [-84.3853971, 33.7528367],
        [-84.3854465, 33.7528718],
        [-84.3854779, 33.7528407],
        [-84.3854285, 33.7528057],
        [-84.3853971, 33.7528367],
      ],
    },
  },
  {
    // Dalhburg Hall (p's spelling; the building is Dahlberg Hall), placed by p
    // on the 11 Oct reference picture (red X on the lawn east of SC East). A
    // light, flat-roofed building after p's satellite and angled photos: a long
    // main wing along the walkway with a second wing at one end, and a lower
    // annex at the other end. Plain building, drawn from the outline.
    id: 'dahlberg-hall',
    name: 'Dalhburg Hall',
    color: '#d8d5cc',
    height: 17,
    outline: [
      [-84.384529, 33.7542021],
      [-84.3849868, 33.7537585],
      [-84.3847822, 33.7536116],
      [-84.3844828, 33.7539016],
      [-84.3842577, 33.7537401],
      [-84.3840992, 33.7538937],
      [-84.384529, 33.7542021],
    ],
  },
  {
    id: 'dahlberg-hall-annex',
    name: 'Dalhburg Hall',
    color: '#d8d5cc',
    height: 12,
    outline: [
      [-84.3849665, 33.7537437],
      [-84.3850897, 33.7536244],
      [-84.3849465, 33.7535215],
      [-84.3848232, 33.753641],
      [-84.3849665, 33.7537437],
    ],
  },
  {
    // Langdale Hall, the tall building just west of Library North, modeled on
    // p's photos (11 Oct): a cream tower with brown-gray panels between deep
    // fins (src/components/langdale.js). Outline read off p's 10:38 PM picture.
    id: 'langdale-hall',
    name: 'Langdale Hall',
    color: '#ece4d3',
    height: 30,
    model: 'langdale',
    outline: [
      [-84.3872534, 33.752927],
      [-84.3875458, 33.7531525],
      [-84.3871395, 33.7535197],
      [-84.3871012, 33.7534795],
      [-84.387054, 33.7535094],
      [-84.3869021, 33.7533897],
      [-84.386895, 33.7533491],
      [-84.3868455, 33.7533108],
      [-84.3872534, 33.752927],
    ],
  },
  {
    // Library North, modeled on p's photos (10 Oct): a tall brick block with a
    // white marble panel and cornice, and a curved glass entrance pavilion
    // with a rooftop terrace (src/components/library.js). The outline was read
    // off p's 10:38 PM picture of the map. `front` is the wall with the marble
    // panel (east corner to south corner); `pavilion` is the line along the
    // northeast side the glass front and terrace face out from (p turned them
    // to that side on 11 Oct), north end first.
    id: 'library-north',
    name: 'Library North',
    color: '#c27c62',
    height: 18,
    model: 'library',
    front: [
      [-84.3862152, 33.7527853],
      [-84.3865937, 33.7524351],
    ],
    pavilion: [
      [-84.3864941, 33.7530957],
      [-84.3862152, 33.7529397],
    ],
    outline: [
      [-84.3865937, 33.7524351],
      [-84.3870183, 33.7527438],
      [-84.3866423, 33.7530989],
      [-84.3865649, 33.7530459],
      [-84.3864941, 33.7530957],
      [-84.3864251, 33.7530285],
      [-84.3862152, 33.7529397],
      [-84.3862748, 33.7528408],
      [-84.3862152, 33.7527853],
      [-84.3865937, 33.7524351],
    ],
  },
  {
    // p moved the Student Recreation Center on 10 Oct (10:38 PM picture): the
    // long blue building behind the walkway west of SC West. Outline read off
    // p's picture. The old Rec Center and the tower behind it, which p painted
    // over as grass, are gone.
    // Modeled on p's 11 Oct photo (src/components/recCenter.js). Reshaped and
    // turned by p's 11 Oct 04:43 aerial photo: a plain block (120 x 34 m, then
    // 90 x 34 m) east of the tower. At 04:49 p had it turned 180 degrees about its
    // center and set parallel to SC East: `flip` puts the tall pale end at the
    // north end, and it was shortened to 90 m so it clears SC East. At 04:55 p had it turned to
    // run steeply up and to the right (long side about 67 degrees from east),
    // same size and shape, same center. At 04:58 p had it turned about 30 degrees
    // clockwise as seen on screen (long side now 25 degrees from east). At 05:00 p had it turned about 15 degrees
    // counter-clockwise on screen (long side now 51 degrees from east).
    id: 'rec-center',
    name: 'Student Recreation Center',
    color: '#434b5a',
    height: 11,
    model: 'rec-center',
    flip: true,
    outline: [
      [-84.3845232, 33.7518984],
      [-84.3839113, 33.7525288],
      [-84.3841968, 33.7527216],
      [-84.3848087, 33.7520912],
      [-84.3845232, 33.7518984],
    ],
  },
  {
    // Arts & Humanities, added by p on 11 Oct (05:03) across the walkway from
    // Langdale Hall, after p's expansion-plan pictures: a six-floor red-brick
    // block with a glass corner tower (src/components/artsHumanities.js). Placed on
    // the lawn north of the walkway from Langdale, west of the Greenway building
    // and clear of the walkways and benches (46 x 32 m). At 05:08 p had it moved left to sit straight in front of
    // Langdale and back to about one tree's width from the walkway. At 05:12 p clarified the walkway is
    // the long diagonal one between Hurt Park and this building, and asked for it
    // 50 m further left: now about 4 m from that walkway, level with the Greenway
    // building's north end (check it doesn't overlap that building on the live map).
    id: 'arts-humanities',
    name: 'Arts & Humanities',
    color: '#a8523f',
    height: 26,
    model: 'arts-humanities',
    outline: [
      [-84.3867278, 33.753932],
      [-84.3863422, 33.7536705],
      [-84.3861241, 33.7538943],
      [-84.3865097, 33.7541558],
      [-84.3867278, 33.753932],
    ],
  },
]

export default keptBuildings
