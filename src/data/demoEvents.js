// DEMO EVENTS: made up so the map has something to show.
// They are NOT real Georgia State listings. Swap in the hand-checked PIN events
// (src/data/events.js) before the demo; every event here has demo: true and
// no sourceUrl so nothing passes them off as official.
//
// Shape matches the plan: id, title, date, time, buildingId, location,
// category, description, image, sourceUrl (+ demo flag).

const demoEvents = [
  { id: 'demo-1', title: 'Board Game Social', date: 'Oct 15', time: '6:00 PM', buildingId: 'student-center-east', location: 'Student Center East · Ballroom', category: 'Social', description: 'Drop in, grab a game, meet people.', image: null, sourceUrl: null, demo: true },
  { id: 'demo-2', title: 'Guest Speaker Q&A', date: 'Oct 16', time: '12:00 PM', buildingId: 'student-center-east', location: 'Student Center East · Speakers Auditorium', category: 'Academic', description: 'A short talk followed by open questions.', image: null, sourceUrl: null, demo: true },
  { id: 'demo-3', title: 'Coffee & Journaling', date: 'Oct 16', time: '9:00 AM', buildingId: 'student-center-west', location: 'Student Center West', category: 'Wellness', description: 'Slow morning, warm drinks, a prompt to write on.', image: null, sourceUrl: null, demo: true },
  { id: 'demo-4', title: 'Midterm Study Jam', date: 'Oct 15', time: '2:00 PM', buildingId: 'library-north', location: 'Library North', category: 'Academic', description: 'Quiet group study with snacks.', image: null, sourceUrl: null, demo: true },
  { id: 'demo-5', title: 'Research Skills Workshop', date: 'Oct 17', time: '11:00 AM', buildingId: 'library-north', location: 'Library North', category: 'Academic', description: 'Find sources faster for your next paper.', image: null, sourceUrl: null, demo: true },
  { id: 'demo-6', title: 'Greenway Picnic', date: 'Oct 17', time: '1:00 PM', buildingId: 'greenway', location: 'Campus Greenway', category: 'Community', description: 'Bring lunch and meet people from other majors.', image: null, sourceUrl: null, demo: true },
  { id: 'demo-7', title: 'Pickup Basketball', date: 'Oct 18', time: '5:00 PM', buildingId: 'rec-center', location: 'Student Recreation Center', category: 'Wellness', description: 'Casual games, all skill levels.', image: null, sourceUrl: null, demo: true },
  { id: 'demo-8', title: 'Sketch in the Park', date: 'Oct 19', time: '10:00 AM', buildingId: 'hurt-park', location: 'Hurt Park', category: 'Arts', description: 'Draw outside with other students. Paper provided.', image: null, sourceUrl: null, demo: true },
  { id: 'demo-9', title: 'Plaza Welcome Fest', date: 'Oct 20', time: '11:00 AM', buildingId: 'unity-plaza', location: 'Unity Plaza', category: 'Community', description: 'Music, free snacks and student org tables.', image: null, sourceUrl: null, demo: true },
  { id: 'demo-10', title: 'Career Fair Prep Drop-in', date: 'Oct 21', time: '3:00 PM', buildingId: 'library-north', location: 'Library North', category: 'Career', description: 'Resume checks and quick mock interviews.', image: null, sourceUrl: null, demo: true },
  { id: 'demo-11', title: 'Study Group Meetup', date: 'Oct 22', time: '4:00 PM', buildingId: 'dahlberg-hall', location: 'Dalhburg Hall', category: 'Academic', description: 'Find a study partner for your toughest class.', image: null, sourceUrl: null, demo: true },
  { id: 'demo-12', title: 'Open Studio Night', date: 'Oct 23', time: '6:00 PM', buildingId: 'arts-humanities', location: 'Arts & Humanities', category: 'Arts', description: 'Wander the studios and see what students are making.', image: null, sourceUrl: null, demo: true },
]

export default demoEvents
