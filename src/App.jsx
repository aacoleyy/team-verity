
import { useState } from 'react'
import './App.css'

const events = [
  {
    id: 1,
    title: 'Creative Connections',
    category: 'Arts',
    date: 'Oct 15, 2026',
    time: '4:00 PM',
    location: 'Student Center',
    description: 'Meet other students and explore your creative side.',
    emoji: '🎨',
  },
  {
    id: 2,
    title: 'Campus Game Night',
    category: 'Gaming',
    date: 'Oct 16, 2026',
    time: '6:00 PM',
    location: 'Student Center',
    description: 'Play games, relax, and meet people with similar interests.',
    emoji: '🎮',
  },
  {
    id: 3,
    title: 'Study Together',
    category: 'Academic',
    date: 'Oct 17, 2026',
    time: '2:00 PM',
    location: 'Library',
    description: 'Bring your coursework and enjoy a relaxed group study session.',
    emoji: '📚',
  },
  {
    id: 4,
    title: 'Wellness & Journaling',
    category: 'Wellness',
    date: 'Oct 18, 2026',
    time: '3:00 PM',
    location: 'Campus Green',
    description: 'Take a break, reflect, and connect with other students.',
    emoji: '🌱',
  },
]

const categories = ['All', 'Arts', 'Gaming', 'Academic', 'Wellness']

function App() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [savedIds, setSavedIds] = useState([])
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showSaved, setShowSaved] = useState(false)

  const filteredEvents = events.filter((event) => {
    const matchesCategory =
      activeCategory === 'All' || event.category === activeCategory

    const matchesSaved = !showSaved || savedIds.includes(event.id)

    return matchesCategory && matchesSaved
  })

  function toggleSaved(id) {
    setSavedIds((previous) =>
      previous.includes(id)
        ? previous.filter((savedId) => savedId !== id)
        : [...previous, id]
    )
  }

  return (
    <main className="app">
      <header className="topbar">
        <a className="brand" href="#" onClick={() => {
          setShowSaved(false)
          setActiveCategory('All')
          setSelectedEvent(null)
        }}>
          <span className="brand-icon">✿</span>
          CommonGround
        </a>

        <button
          className={`nav-button ${!showSaved ? 'active' : ''}`}
          onClick={() => setShowSaved(false)}
        >
          Explore
        </button>

        <button
          className={`nav-button ${showSaved ? 'active' : ''}`}
          onClick={() => setShowSaved(true)}
        >
          Saved ({savedIds.length})
        </button>
      </header>

      <section className="welcome">
        <p className="eyebrow">YOUR CAMPUS, YOUR COMMUNITY</p>
        <h1>Find your people, <span>one event at a time.</span></h1>
        <p className="subtitle">
          Little moments can lead to great connections. Find something that feels like you.
        </p>
      </section>

      <section className="discover">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{showSaved ? 'YOUR COLLECTION' : 'MADE FOR YOU'}</p>
            <h2>{showSaved ? 'Your saved events' : 'Explore events'}</h2>
          </div>
          <span className="event-count">
            {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'}
          </span>
        </div>

        <div className="filters" aria-label="Filter events by category">
          {categories.map((category) => (
            <button
              key={category}
              className={`filter-button ${activeCategory === category ? 'selected' : ''}`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        {filteredEvents.length === 0 ? (
          <div className="empty-state">
            <span>🌷</span>
            <h3>No events here just yet</h3>
            <p>Try another category or explore more events.</p>
            <button onClick={() => {
              setActiveCategory('All')
              setShowSaved(false)
            }}>
              Explore all events
            </button>
          </div>
        ) : (
          <div className="event-grid">
            {filteredEvents.map((event) => (
              <article className="event-card" key={event.id}>
                <div className={`event-art art-${event.category.toLowerCase()}`}>
                  <span className="event-emoji">{event.emoji}</span>
                  <span className="category-tag">{event.category}</span>
                  <button
                    className={`save-button ${savedIds.includes(event.id) ? 'is-saved' : ''}`}
                    onClick={() => toggleSaved(event.id)}
                    aria-label={savedIds.includes(event.id) ? 'Unsave event' : 'Save event'}
                    title={savedIds.includes(event.id) ? 'Unsave event' : 'Save event'}
                  >
                    {savedIds.includes(event.id) ? '♥' : '♡'}
                  </button>
                </div>

                <div className="event-content">
                  <p className="event-date">{event.date} · {event.time}</p>
                  <h3>{event.title}</h3>
                  <p className="event-location">⌖ {event.location}</p>
                  <button
                    className="details-button"
                    onClick={() => setSelectedEvent(event)}
                  >
                    View details <span>→</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {selectedEvent && (
        <div className="modal-backdrop" onClick={() => setSelectedEvent(null)}>
          <section
            className="event-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="modal-close" onClick={() => setSelectedEvent(null)}>
              ✕
            </button>
            <span className="modal-emoji">{selectedEvent.emoji}</span>
            <p className="eyebrow">{selectedEvent.category} EVENT</p>
            <h2 id="modal-title">{selectedEvent.title}</h2>
            <p>{selectedEvent.description}</p>
            <p><strong>Date:</strong> {selectedEvent.date}</p>
            <p><strong>Time:</strong> {selectedEvent.time}</p>
            <p><strong>Location:</strong> {selectedEvent.location}</p>
            <button
              className="primary-button"
              onClick={() => toggleSaved(selectedEvent.id)}
            >
              {savedIds.includes(selectedEvent.id) ? '♥ Saved — remove bookmark' : '♡ Save this event'}
            </button>
            <p className="demo-note">
              Demo event — replace with a verified campus listing before presenting.
            </p>
          </section>
        </div>
      )}

      <footer>
        <span className="brand-icon">✿</span>
        CommonGround · A student-built campus discovery prototype
      </footer>
    </main>
  )
}

export default App
