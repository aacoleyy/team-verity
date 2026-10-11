// Hand-placed extras drawn on top of the map data.

import { customBuildings } from './keptBuildings.js'

// The fountain in Hurt Park, inside the round path (center read off p's
// screenshot of the map). The round lawn there is about 8.4 m in radius, so
// the fountain's ring of steps fits just inside it.
export const hurtParkFountain = {
  lat: 33.7539428,
  lng: -84.3853538,
  radius: 8.3, // meters, outer edge of the ring of steps
}

// Hurt Park, the triangle between Edgewood Ave, Courtland St and Gilmer St,
// with a few meters to spare ([lng, lat] corners, read off the park's lawns
// on p's screenshot). Its walkways are the only ones the map draws, and the
// starting view shows all of it.
export const hurtParkOutline = [
  [-84.3853474, 33.75356],
  [-84.3854171, 33.7535892],
  [-84.3862438, 33.7542661],
  [-84.3862566, 33.7543395],
  [-84.3862277, 33.7544115],
  [-84.3861759, 33.7544617],
  [-84.3847647, 33.7544556],
  [-84.3846946, 33.7544381],
  [-84.3846203, 33.7543418],
  [-84.3846266, 33.7542474],
  [-84.3853474, 33.75356],
]

// Points the starting view has to show besides the pins: the corners of the
// Student Recreation Center and of Hurt Park, so both show whole and not just
// their pins ([lng, lat]).
// The tall tower between the Student Centers also needs headroom, so a point
// about 120 m south of it keeps its roof on screen.
export const frameAlso = [
  ...hurtParkOutline,
  ...customBuildings.find((b) => b.id === 'rec-center').outline,
  [-84.3852664, 33.752284 - 0.0011],
]

// Paved plaza p painted beside Dahlberg Hall's first spot (Dahlberg is gone now)
// ([lng, lat] corners).
export const customPlazas = [
  {
    id: 'dahlberg-plaza',
    outline: [
      [-84.3852824, 33.7525394],
      [-84.3853598, 33.7525211],
      [-84.3854451, 33.7529536],
      [-84.3850515, 33.7530404],
      [-84.385042, 33.7529991],
      [-84.3852894, 33.7526603],
      [-84.3852561, 33.7525746],
      [-84.3852824, 33.7525394],
    ],
  },
]

// Wide paved walkways p drew on the 10 Oct (10:38 PM) picture. Each one runs
// straight `from` one [lng, lat] point `to` another and is `width` meters
// wide. The ones that leave the picture run on past the edge of the map.
// p removed the long walkway on 11 Oct, and the lines on the rest are gone too:
// they are one flat solid color that flows together.
export const pavedWalkways = [
  { name: 'Between Library North and the Greenway', from: [-84.3873686, 33.7539113], to: [-84.3860319, 33.7530048], width: 8 },
  { name: 'Between the Greenway and Hurt Park', from: [-84.3867916, 33.7544738], to: [-84.383928, 33.752443], width: 9.5 },
  { name: 'Crossing the Greenway walkway, west of Langdale', from: [-84.3865111, 33.7547472], to: [-84.3884042, 33.7529018], width: 8 },
  { name: 'Linking the Student Center patio to the Rec Center walkway', from: [-84.3852378, 33.752995], to: [-84.3850367, 33.753191], width: 6.5 },
  { name: 'Along the north side of Hurt Park', from: [-84.3868786, 33.7544745], to: [-84.383563, 33.754448], width: 8.7 },
  { name: 'Along the south side of Hurt Park', from: [-84.3853828, 33.7534749], to: [-84.384372, 33.7544545], width: 6.5 },
]

// The winding path and round patio p drew beside the Student Center, as one paved
// shape ([lng, lat] corners).
export const pavedAreas = [
  {
    id: 'winding-path',
    outline: [
      [-84.3857302, 33.7532342],
      [-84.3857614, 33.7532334],
      [-84.3858038, 33.7532283],
      [-84.3858293, 33.7532219],
      [-84.3858522, 33.7532112],
      [-84.3859044, 33.7531694],
      [-84.3859703, 33.75309],
      [-84.3859931, 33.753073],
      [-84.3860105, 33.7530653],
      [-84.3860286, 33.7530646],
      [-84.3860461, 33.7530712],
      [-84.3860925, 33.7530997],
      [-84.3861324, 33.7531337],
      [-84.3861425, 33.7531393],
      [-84.3861501, 33.7531396],
      [-84.3861544, 33.7531335],
      [-84.3861561, 33.7531227],
      [-84.3861576, 33.7530652],
      [-84.3861553, 33.7530438],
      [-84.386148, 33.7530288],
      [-84.3861143, 33.7529906],
      [-84.3860947, 33.7529756],
      [-84.386073, 33.7529626],
      [-84.3860542, 33.7529542],
      [-84.3860343, 33.7529485],
      [-84.3860134, 33.7529459],
      [-84.3859868, 33.7529458],
      [-84.385966, 33.7529486],
      [-84.3859509, 33.7529526],
      [-84.3859218, 33.752964],
      [-84.3858988, 33.7529753],
      [-84.3858747, 33.7529926],
      [-84.3858239, 33.7530388],
      [-84.3858033, 33.753052],
      [-84.3857891, 33.7530568],
      [-84.3857739, 33.753059],
      [-84.385753, 33.7530584],
      [-84.3857327, 33.7530545],
      [-84.3857107, 33.7530445],
      [-84.3857005, 33.7530329],
      [-84.3856995, 33.7530267],
      [-84.3857016, 33.7530205],
      [-84.3857159, 33.7530032],
      [-84.3857181, 33.7529977],
      [-84.3857156, 33.7529893],
      [-84.3857071, 33.7529809],
      [-84.3856784, 33.7529619],
      [-84.3856336, 33.7529375],
      [-84.3855379, 33.7528758],
      [-84.3854526, 33.7528286],
      [-84.385417, 33.7528051],
      [-84.3854059, 33.7528013],
      [-84.3853983, 33.7528018],
      [-84.3853906, 33.7528046],
      [-84.3853633, 33.7528207],
      [-84.3853369, 33.752831],
      [-84.3853024, 33.752862],
      [-84.3852617, 33.7528838],
      [-84.3852492, 33.752894],
      [-84.3852214, 33.7529239],
      [-84.3851962, 33.7529581],
      [-84.3851861, 33.7529781],
      [-84.3851838, 33.752995],
      [-84.3851888, 33.7530162],
      [-84.3852021, 33.7530403],
      [-84.3852301, 33.753073],
      [-84.3852522, 33.7530921],
      [-84.3852787, 33.7531067],
      [-84.3853078, 33.7531183],
      [-84.3853437, 33.7531274],
      [-84.3853753, 33.7531317],
      [-84.3854075, 33.753132],
      [-84.3854558, 33.7531289],
      [-84.3854817, 33.7531239],
      [-84.385526, 33.7531108],
      [-84.3855428, 33.7531109],
      [-84.3855492, 33.7531142],
      [-84.3855555, 33.7531229],
      [-84.3855671, 33.753171],
      [-84.3855737, 33.7531798],
      [-84.3855841, 33.7531875],
      [-84.3856096, 33.7532017],
      [-84.3856334, 33.7532111],
      [-84.3856998, 33.753229],
      [-84.3857302, 33.7532342],
    ],
  },
]

// The big benches p placed on the picture. `heading` is the compass direction
// the seat runs along (degrees); each bench faces the nearest walkway.
export const bigBenches = [
  { lng: -84.3871727, lat: 33.7536044, heading: 129 },
  { lng: -84.3868182, lat: 33.7533754, heading: 129 },
  { lng: -84.3867418, lat: 33.7536643, heading: 129 },
  { lng: -84.3864776, lat: 33.7534429, heading: 129 },
  { lng: -84.3859553, lat: 33.7532248, heading: 54 },
  { lng: -84.385692, lat: 33.7532801, heading: 114 },
]
