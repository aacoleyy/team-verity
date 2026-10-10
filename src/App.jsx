
import { useEffect, useState } from "react";
import "./App.css";

// ======================================
// DEMO EVENT DATA
// ======================================

const demoEvents = [
  {
    id: "event-001",
    title: "Campus Game Night",
    date: "2026-10-15",
    startTime: "6:00 PM",
    endTime: "8:00 PM",
    buildingId: "student-center-east",
    location: "Student Center East",
    category: "Social",
    description:
      "Meet other students, play games, and enjoy a fun evening on campus.",
    isDemo: true,
  },
  {
    id: "event-002",
    title: "Wellness Workshop",
    date: "2026-10-16",
    startTime: "2:00 PM",
    endTime: "3:30 PM",
    buildingId: "rec-center",
    location: "Student Recreation Center",
    category: "Wellness",
    description:
      "Learn about stress management and explore ways to support your well-being.",
    isDemo: true,
  },
  {
    id: "event-003",
    title: "Career Networking Mixer",
    date: "2026-10-20",
    startTime: "4:00 PM",
    endTime: "6:00 PM",
    buildingId: "student-center-west",
    location: "Student Center West",
    category: "Career",
    description:
      "Connect with fellow students and practice your networking skills.",
    isDemo: true,
  },
  {
    id: "event-004",
    title: "Study Together",
    date: "2026-10-22",
    startTime: "1:00 PM",
    endTime: "3:00 PM",
    buildingId: "library-north",
    location: "Library North",
    category: "Academic",
    description:
      "Join a casual group study session and meet new study partners.",
    isDemo: true,
  },
];

const categories = [
  "All",
  "Social",
  "Academic",
  "Career",
  "Wellness",
];

// Temporary building data.
// Your teammate can replace this with buildings.js later.
const buildings = [
  {
    id: "student-center-east",
    name: "Student Center East",
  },
  {
    id: "student-center-west",
    name: "Student Center West",
  },
  {
    id: "rec-center",
    name: "Student Recreation Center",
  },
  {
    id: "library-north",
    name: "Library North",
  },
];

// ======================================
// HELPER FUNCTIONS
// ======================================

function formatDate(dateString) {
  return new Date(`${dateString}T12:00:00`).toLocaleDateString(
    "en-US",
    {
      month: "long",
      day: "numeric",
      year: "numeric",
    }
  );
}

// ======================================
// EVENT CARD COMPONENT
// ======================================

function EventCard({
  event,
  isSaved,
  onToggleSave,
  onViewDetails,
}) {
  return (
    <article className="event-card">
      <div className="event-card-top">
        <span className="category-badge">
          {event.category}
        </span>

        {event.isDemo && (
          <span className="demo-label">
            Demo event
          </span>
        )}
      </div>

      <h3>{event.title}</h3>

      <p>📅 {formatDate(event.date)}</p>

      <p>
        🕒 {event.startTime} – {event.endTime}
      </p>

      <p>📍 {event.location}</p>

      <div className="event-actions">
        <button
          className="details-button"
          onClick={() => onViewDetails(event)}
        >
          View details
        </button>

        <button
          className={`save-button ${
            isSaved ? "saved" : ""
          }`}
          onClick={() => onToggleSave(event.id)}
          aria-label={
            isSaved ? "Unsave event" : "Save event"
          }
        >
          {isSaved ? "♥ Saved" : "♡ Save"}
        </button>
      </div>
    </article>
  );
}

// ======================================
// MAIN APP COMPONENT
// ======================================

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState("home");

  // Category filters
  const [selectedCategory, setSelectedCategory] =
    useState("All");

  // Event details popup
  const [selectedEvent, setSelectedEvent] =
    useState(null);

  // Home search
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Map search
  const [mapSearch, setMapSearch] = useState("");

  // Selected building
  const [selectedBuildingId, setSelectedBuildingId] =
    useState(null);

  // Collapsible map events panel
  const [sheetPosition, setSheetPosition] =
    useState("collapsed");

  // Saved events
  const [savedIds, setSavedIds] = useState(() => {
    try {
      const stored = localStorage.getItem(
        "verity-saved-events"
      );

      const parsed = stored
        ? JSON.parse(stored)
        : [];

      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  // Save bookmarks to local storage
  useEffect(() => {
    localStorage.setItem(
      "verity-saved-events",
      JSON.stringify(savedIds)
    );
  }, [savedIds]);

  // ======================================
  // EVENT FUNCTIONS
  // ======================================

  function toggleSaved(id) {
    setSavedIds((previous) =>
      previous.includes(id)
        ? previous.filter((savedId) => savedId !== id)
        : [...previous, id]
    );
  }

  function selectBuilding(id) {
    setSelectedBuildingId(id);
    setMapSearch("");
    setSheetPosition("half");
  }

  function cycleSheetPosition() {
    setSheetPosition((previous) => {
      if (previous === "collapsed") {
        return "half";
      }

      if (previous === "half") {
        return "expanded";
      }

      return "collapsed";
    });
  }

  // ======================================
  // FILTERED DATA
  // ======================================

  const filteredEvents = demoEvents.filter((event) => {
    const matchesCategory =
      selectedCategory === "All" ||
      event.category === selectedCategory;

    const query = searchQuery.trim().toLowerCase();

    const matchesSearch = [
      event.title,
      event.location,
      event.description,
      event.category,
    ].some((value) =>
      value.toLowerCase().includes(query)
    );

    return matchesCategory && matchesSearch;
  });

  const savedEvents = demoEvents.filter((event) =>
    savedIds.includes(event.id)
  );

  const matchingBuildings = buildings.filter(
    (building) =>
      building.name
        .toLowerCase()
        .includes(mapSearch.trim().toLowerCase())
  );

  const selectedBuilding = buildings.find(
    (building) =>
      building.id === selectedBuildingId
  );

  const buildingEvents = demoEvents.filter(
    (event) =>
      event.buildingId === selectedBuildingId
  );

  // ======================================
  // RENDER EVENT LIST
  // ======================================

  function renderEventList(eventsToDisplay) {
    if (eventsToDisplay.length === 0) {
      return (
        <div className="empty-state">
          <p>No matching events found.</p>
        </div>
      );
    }

    return (
      <div className="event-list">
        {eventsToDisplay.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            isSaved={savedIds.includes(event.id)}
            onToggleSave={toggleSaved}
            onViewDetails={setSelectedEvent}
          />
        ))}
      </div>
    );
  }

  // ======================================
  // APP LAYOUT
  // ======================================

  return (
    <div
      className={`app ${
        activeTab === "map" ? "map-mode" : ""
      }`}
    >
      {/* ==================================
          HEADER
      ================================== */}

      {activeTab !== "map" && (
        <header className="app-header">
          <div className="header-top">
            <h1>verity.</h1>

            {activeTab === "home" && (
              <button
                className="search-icon-button"
                aria-label="Search events"
                aria-expanded={showSearch}
                onClick={() =>
                  setShowSearch((previous) => !previous)
                }
              >
                {showSearch ? "✕" : "🔍"}
              </button>
            )}
          </div>

          <p>
            Find your people. Find your place.
          </p>

          {activeTab === "home" && showSearch && (
            <input
              className="home-search-input"
              type="search"
              placeholder="Search events..."
              aria-label="Search events"
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(event.target.value)
              }
            />
          )}
        </header>
      )}

      {/* ==================================
          MAIN CONTENT
      ================================== */}

      <main className="app-content">

        {/* ================================
            HOME PAGE
        ================================ */}

        {activeTab === "home" && (
          <section>
            <h2>Discover events</h2>

            <p className="section-subtitle">
              Find something that interests you.
            </p>

            <div className="category-filters">
              {categories.map((category) => (
                <button
                  key={category}
                  className={
                    selectedCategory === category
                      ? "selected"
                      : ""
                  }
                  onClick={() =>
                    setSelectedCategory(category)
                  }
                >
                  {category}
                </button>
              ))}
            </div>

            {renderEventList(filteredEvents)}
          </section>
        )}

        {/* ================================
            MAP PAGE
        ================================ */}

        {activeTab === "map" && (
          <section className="map-screen">

            {/* CAMPUS MAP IMAGE */}
            <div className="full-map">
              <img
                src="/campus-map.png"
                alt="Illustrated campus map"
                onError={(event) => {
                  event.currentTarget.style.display =
                    "none";
                }}
              />
            </div>

            {/* MAP SEARCH BAR */}
            <div className="map-search-area">
              <div className="map-search">
                <span aria-hidden="true">
                  🔍
                </span>

                <input
                  type="search"
                  placeholder="Search campus buildings..."
                  aria-label="Search campus buildings"
                  value={mapSearch}
                  onChange={(event) =>
                    setMapSearch(event.target.value)
                  }
                />
              </div>

              {/* BUILDING SEARCH RESULTS */}
              {mapSearch.trim() !== "" && (
                <div className="map-search-results">
                  {matchingBuildings.length === 0 ? (
                    <p>
                      No matching buildings found.
                    </p>
                  ) : (
                    matchingBuildings.map((building) => (
                      <button
                        key={building.id}
                        onClick={() =>
                          selectBuilding(building.id)
                        }
                      >
                        📍 {building.name}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* ============================
                COLLAPSIBLE EVENTS PANEL
            ============================ */}

            <div
              className={`events-sheet ${sheetPosition}`}
            >
              {/* CLICKABLE PANEL HANDLE */}
              <button
                className="sheet-handle-button"
                onClick={cycleSheetPosition}
                aria-expanded={
                  sheetPosition !== "collapsed"
                }
                aria-label="Expand or collapse events panel"
              >
                <span className="sheet-handle" />

                <div className="sheet-header">
                  <div>
                    <h3>
                      {selectedBuilding
                        ? selectedBuilding.name
                        : "Explore events"}
                    </h3>

                    <p>
                      {selectedBuilding
                        ? `${buildingEvents.length} event(s) at this location`
                        : "Discover what's happening on campus"}
                    </p>
                  </div>

                  <span className="sheet-arrow">
                    {sheetPosition === "expanded"
                      ? "⌄"
                      : "⌃"}
                  </span>
                </div>
              </button>

              {/* PANEL CONTENT */}
              {sheetPosition !== "collapsed" && (
                <div className="sheet-content">
                  {selectedBuilding ? (
                    <>
                      <button
                        className="clear-building-button"
                        onClick={() => {
                          setSelectedBuildingId(null);
                        }}
                      >
                        ← Show all events
                      </button>

                      {renderEventList(buildingEvents)}
                    </>
                  ) : (
                    renderEventList(demoEvents)
                  )}
                </div>
              )}
            </div>

          </section>
        )}

        {/* ================================
            SAVED PAGE
        ================================ */}

        {activeTab === "saved" && (
          <section>
            <h2>Saved events</h2>

            <p className="section-subtitle">
              Keep track of events you're interested in.
            </p>

            {savedEvents.length === 0 ? (
              <div className="empty-state">
                <span>♡</span>

                <h3>Nothing saved yet</h3>

                <p>
                  Browse events and tap Save to add
                  them here.
                </p>

                <button
                  className="details-button"
                  onClick={() =>
                    setActiveTab("home")
                  }
                >
                  Explore events
                </button>
              </div>
            ) : (
              renderEventList(savedEvents)
            )}
          </section>
        )}

      </main>

      {/* ==================================
          BOTTOM NAVIGATION
      ================================== */}

      <nav
        className="bottom-nav"
        aria-label="Main navigation"
      >
        <button
          className={
            activeTab === "home" ? "active" : ""
          }
          onClick={() => setActiveTab("home")}
        >
          <span>⌂</span>
          Home
        </button>

        <button
          className={
            activeTab === "map" ? "active" : ""
          }
          onClick={() => setActiveTab("map")}
        >
          <span>🗺️</span>
          Map
        </button>

        <button
          className={
            activeTab === "saved" ? "active" : ""
          }
          onClick={() => setActiveTab("saved")}
        >
          <span>♡</span>
          Saved
        </button>
      </nav>

      {/* ==================================
          EVENT DETAILS POPUP
      ================================== */}

      {selectedEvent && (
        <div
          className="modal-overlay"
          onClick={() =>
            setSelectedEvent(null)
          }
        >
          <div
            className="event-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="event-modal-title"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <button
              className="close-button"
              onClick={() =>
                setSelectedEvent(null)
              }
              aria-label="Close event details"
            >
              ✕
            </button>

            <span className="category-badge">
              {selectedEvent.category}
            </span>

            {selectedEvent.isDemo && (
              <p className="demo-notice">
                This is a fictional demo event.
              </p>
            )}

            <h2 id="event-modal-title">
              {selectedEvent.title}
            </h2>

            <p>
              📅 {formatDate(selectedEvent.date)}
            </p>

            <p>
              🕒 {selectedEvent.startTime} –{" "}
              {selectedEvent.endTime}
            </p>

            <p>
              📍 {selectedEvent.location}
            </p>

            <h3>About this event</h3>

            <p>
              {selectedEvent.description}
            </p>

            {selectedEvent.sourceUrl && (
              <a
                href={selectedEvent.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                View original event listing
              </a>
            )}

            <button
              className="modal-save-button"
              onClick={() =>
                toggleSaved(selectedEvent.id)
              }
            >
              {savedIds.includes(selectedEvent.id)
                ? "♥ Remove from saved"
                : "♡ Save this event"}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
