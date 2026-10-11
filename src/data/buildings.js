// Georgia State University (Atlanta campus) buildings shown as map pins.
//
// Where the coordinates come from:
//   - "census": the street address run through the free US Census geocoder,
//     then nudged toward the corner the building's own GSU page describes.
//   - "wikipedia": the coordinates on the place's Wikipedia article.
//   - "news" / "description": placed from a written description of where it is.
// These land within about half a block. Before the demo, open the app with
// ?editPins in the URL, drag any pin that is off onto its building, and paste
// the printed list back into this file.
//
// `id` is what CampusMap passes to onSelectBuilding, and what each event card's
// `buildingId` must match exactly. These ids are the ones the event cards use.
// Ballroom and Speakers Auditorium events use student-center-east (both rooms
// are in Student Center East). p put Dahlberg Hall back on 11 Oct
// (spelled Dalhburg Hall on the map), so dahlberg-hall events have a pin again.

const buildings = [
  {
    id: 'library-north',
    name: 'Library North',
    shortName: 'Library North',
    address: '100 Decatur St SE',
    lat: 33.75277,
    lng: -84.38662,
    emoji: '📚',
    color: '#ffd99a',
    source: 'census',
  },
  {
    // Built on the old Kell Hall site; runs from Peachtree Center Ave to
    // Collins and Courtland Streets, beside Library North.
    id: 'greenway',
    name: 'Campus Greenway',
    shortName: 'Greenway',
    address: 'Between Peachtree Center Ave and Courtland St',
    lat: 33.7537,
    lng: -84.38591,
    emoji: '🌳',
    color: '#b7e4cf',
    source: 'news',
  },
  {
    // The central quad ringed by Library South, Classroom South, Langdale and
    // Sparks, across Courtland St from the student centers. Placed from that
    // description, so check it with ?editPins. Moved onto the long walkway on
    // 10 Oct, since the Rec Center p placed now covers its old spot; on 11 Oct p moved it
    // to the patio in front of Student Center West and East.
    id: 'unity-plaza',
    name: 'Unity Plaza',
    shortName: 'Unity Plaza',
    address: 'Central quad by Library South',
    lat: 33.75300,
    lng: -84.38600,
    emoji: '🤝',
    color: '#ffe48a',
    source: 'description',
  },
  {
    // p (11 Oct 03:28 photo): on Student Center East, beside SC West.
    id: 'student-center-east',
    name: 'Student Center East',
    shortName: 'Student Center East',
    address: '55 Gilmer St SE',
    lat: 33.7527906,
    lng: -84.3849624,
    emoji: '🎉',
    color: '#c9b6ef',
    source: 'p',
  },
  {
    id: 'student-center-west',
    name: 'Student Center West',
    shortName: 'Student Center West',
    address: '66 Courtland St SE',
    lat: 33.7525635,
    lng: -84.3859382,
    emoji: '☕',
    color: '#ffc7a8',
    source: 'census',
  },
  {
    // p (10 Oct, 10:38 PM picture): on the long blue building behind the
    // walkway west of SC West.
    id: 'rec-center',
    name: 'Student Recreation Center',
    shortName: 'Rec Center',
    address: '101 Piedmont Ave SE',
    lat: 33.75231,
    lng: -84.38436,
    emoji: '🏀',
    color: '#a9d4f5',
    source: 'p',
  },
  {
    // p (11 Oct): at the red X on the lawn east of SC East, across the street
    // from it. p spells it "Dalhburg"; the id matches the old Dahlberg events.
    id: 'dahlberg-hall',
    name: 'Dahlberg Hall',
    shortName: 'Dahlberg Hall',
    address: '30 Courtland St SE',
    lat: 33.753907,
    lng: -84.384656,
    emoji: '🏢',
    color: '#b8d4e8',
    source: 'p',
  },
  {
    // Triangle bounded by Edgewood Ave, Courtland St and Gilmer St.
    id: 'hurt-park',
    name: 'Hurt Park',
    shortName: 'Hurt Park',
    address: 'Edgewood Ave & Courtland St',
    lat: 33.75417,
    lng: -84.38558,
    emoji: '🌷',
    color: '#f6c1d4',
    source: 'wikipedia',
  },
]

export default buildings
