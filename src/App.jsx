import { useAuth0 } from "@auth0/auth0-react";

import { useEffect, useRef, useState } from "react";

import HomeRoundedIcon from "@mui/icons-material/HomeRounded";

import MapRoundedIcon from "@mui/icons-material/MapRounded";

import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";

import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";

import SearchRoundedIcon from "@mui/icons-material/SearchRounded";

import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";

import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";

import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";

import SportsEsportsRoundedIcon from "@mui/icons-material/SportsEsportsRounded";

import SpaRoundedIcon from "@mui/icons-material/SpaRounded";

import WorkRoundedIcon from "@mui/icons-material/WorkRounded";

import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";

import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";

import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";

import GroupRoundedIcon from "@mui/icons-material/GroupRounded";

import PersonRoundedIcon from "@mui/icons-material/PersonRounded";

import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

import "./App.css";

// EVENTS - Real campus events. Do not link to the original PIN listing.

const events = [

  {

    id: "crc-quiet-hours-2026-10-12",

    title: "Collegiate Recovery Community - Quiet Study Hours",

    category: "Academic",

    date: "2026-10-12",

    time: "10:00 AM – 12:00 PM",

    location: "Student Center West, Room 482",

    buildingId: "student-center-west",

    description: "Located in room 482, the CRC has dedicated quiet study hours throughout the week to ensure students in recovery (and their friends) have access to an environment that is beneficial to their academic pursuits. Whether you need a snack, somewhere to focus without distractions, or a place to just...be, we've got you covered. Questions about the Collegiate Recovery can be directed to crc@gsu.edu.",

    flyerUrl: "/events/crc-quiet-hours.jpg",

    sourceUrl: null,

  },

  {

    id: "hot-wings-hot-topics-2026-10-12",

    title: "Hot Wings Hot Topics",

    category: "Social",

    date: "2026-10-12",

    time: "4:00 PM – 5:15 PM",

    location: "Student Center East, Intersection Lounge",

    buildingId: "student-center-east",

    description: "Get ready for a flavor-packed evening where the wings are spicy and the conversations are even hotter! Join us for Hot Wings & Hot Topics, an open forum where students come together to enjoy free hot wings and dive into bold, unfiltered discussions about everything from pop culture and politics to campus life and personal passions. Whether you're here to speak your mind, hear new perspectives, or just vibe with fellow Panthers over some seriously good food, this is the place to be. No topic is off the table; just bring your appetite and your voice.",

    flyerUrl: "/events/hot-wings-hot-topics.jpg",

    sourceUrl: null,

  },

  {

    id: "club-panther-silent-party-2026-10-12",

    title: "Club Panther: Silent Headphone Party",

    category: "Social",

    date: "2026-10-12",

    time: "6:00 PM – 9:00 PM",

    location: "Student Center East, Ballroom",

    buildingId: "student-center-east",

    description: "Club Panther brings the party to campus with a fun nightlife-style experience made just for students. Guests will receive wireless headphones that let them switch between different music channels, so everyone can choose the sound that fits their vibe. Don’t miss the chance to dance, sing, and enjoy the night with friends. Whether you’re into hip-hop, R&B, Afrobeats, throwbacks, or pop, Club Panther has something for everyone.",

    flyerUrl: "/events/club-panther-silent-party.jpg",

    sourceUrl: null,

  },

  {

    id: "crc-read-the-room-2026-10-13",

    title: "Read the Room: Collegiate Recovery Community Book Club",

    category: "Wellness",

    date: "2026-10-13",

    time: "3:00 PM – 5:00 PM",

    location: "Student Center West, Room 482",

    buildingId: "student-center-west",

    description: "Have you ever attended a book club that chose a book you're really not interested in reading? Have you ever wished you had the time to sit in a quiet space and read a book, but school or work has had you putting it off? Have you ever attended a support group where you wanted to talk about what you were reading or how life is going, but weren't able to? Great news! The CRC has created a two-part book club, where students are able to sit in silence and read a book of their choice for the first half, and transition into an unstructured group discussion for the second half. Read the Room can help students carve out time to read a book they are interested in, engage in self-care, and socialize with fellow readers. Students are welcome to participate in one or both parts. If you have any questions, please do not hesitate to contact the CRC: crc@gsu.edu",

    flyerUrl: "/events/crc-read-the-room.jpg",

    sourceUrl: null,

  },

  {

    id: "atlanta-campus-safety-walk-2026-10-14",

    title: "Atlanta Campus Safety Walk",

    category: "Wellness",

    date: "2026-10-14",

    time: "7:00 PM – 8:00 PM",

    location: "Dahlberg Hall, Ground Level",

    buildingId: "dahlberg-hall",

    description: "Campus Safety Walks provide an opportunity for students, faculty, staff, and community members to partner with Georgia State University Police and university officials in identifying safety concerns around campus. During these walks, participants are encouraged to report unsafe conditions such as missing or non-functioning streetlights, damaged sidewalks, overgrown landscaping, inadequate signage, emergency equipment concerns, and other environmental issues that may affect the safety and security of our campus community. The goal is to proactively identify hazards and improve campus safety for everyone.",

    flyerUrl: "/events/atlanta-campus-safety-walk.jpg",

    sourceUrl: null,

  },

];

const buildings = [

  {

    id: "student-center-east",

    name: "Student Center East",

    aliases: ["sce", "student center e", "east student center"],

  },

  {

    id: "student-center-west",

    name: "Student Center West",

    aliases: ["scw", "student center w", "west student center"],

  },

  {

    id: "rec-center",

    name: "Student Recreation Center",

    aliases: ["rec", "student rec", "rec center", "gym", "src"],

  },

  {

    id: "library-north",

    name: "Library North",

    aliases: ["library", "lib", "north library", "ln"],

  },

  {

    id: "dahlberg-hall",

    name: "Dahlberg Hall",

    aliases: ["dahlberg", "dahlberg hall", "dh"],

  },

];

const categories = ["All", "Social", "Academic", "Career", "Wellness"];

const iconFor = {

  Social: SportsEsportsRoundedIcon,

  Wellness: SpaRoundedIcon,

  Career: WorkRoundedIcon,

  Academic: MenuBookRoundedIcon,

};

// Example activity only. No real accounts are connected.

const demoFriends = [

  {

    id: "friend-1",

    name: "Abi",

    initial: "A",

    color: "#f1afcb",

    eventId: "hot-wings-hot-topics-2026-10-12",

    status: "Going",

  },

  {

    id: "friend-2",

    name: "Paiton",

    initial: "P",

    color: "#b6d8c1",

    eventId: "crc-quiet-hours-2026-10-12",

    status: "Interested",

  },

];

const normalize = (value) =>

  String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");

const displayDate = (date) =>

  new Date(`${date}T12:00:00`).toLocaleDateString("en-US", {

    month: "short",

    day: "numeric",

  });

function readStorage(key, fallback) {

  try {

    const stored = localStorage.getItem(key);

    return stored ? JSON.parse(stored) : fallback;

  } catch {

    return fallback;

  }

}

function EventCard({ event, isSaved, onSave, onOpen }) {

  const Icon = iconFor[event.category] || CalendarMonthRoundedIcon;

  return (

    <article className={`event-tile category-${event.category.toLowerCase()}`}>

      <button

        className="tile-open"

        onClick={onOpen}

        aria-label={`View details for ${event.title}`}

      >

        <span className="tile-category">{event.category}</span>

        <span className="tile-art">

          {event.flyerUrl ? (

            <img src={event.flyerUrl} alt="" loading="lazy" />

          ) : (

            <Icon sx={{ fontSize: 54 }} aria-hidden="true" />

          )}

        </span>

        <strong className="tile-title">{event.title}</strong>

        <span className="tile-date">

          <CalendarMonthRoundedIcon fontSize="inherit" />

          {displayDate(event.date)}

        </span>

      </button>

      <button

        className="tile-save"

        onClick={onSave}

        aria-label={isSaved ? `Unsave ${event.title}` : `Save ${event.title}`}

        aria-pressed={isSaved}

      >

        {isSaved ? <FavoriteRoundedIcon /> : <FavoriteBorderRoundedIcon />}

      </button>

    </article>

  );

}

function EventModal({

  event,

  isSaved,

  onSave,

  onClose,

  onLocation,

  planStatus,

  onPlanChange,

}) {

  const closeRef = useRef(null);

  const dialogRef = useRef(null);

  useEffect(() => {

    const previous = document.activeElement;

    const oldOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    closeRef.current?.focus();

    const handleKeyDown = (e) => {

      if (e.key === "Escape") {

        onClose();

        return;

      }

      if (e.key !== "Tab") return;

      const focusable = [

        ...(dialogRef.current?.querySelectorAll("button, a[href]") || []),

      ].filter((element) => !element.disabled);

      if (!focusable.length) return;

      const first = focusable[0];

      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {

        e.preventDefault();

        last.focus();

      } else if (!e.shiftKey && document.activeElement === last) {

        e.preventDefault();

        first.focus();

      }

    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {

      document.body.style.overflow = oldOverflow;

      document.removeEventListener("keydown", handleKeyDown);

      previous?.focus?.();

    };

  }, [onClose]);

  const Icon = iconFor[event.category] || CalendarMonthRoundedIcon;

  return (

    <div

      className="modal-overlay"

      onMouseDown={(e) => {

        if (e.target === e.currentTarget) onClose();

      }}

    >

      <section

        ref={dialogRef}

        className="event-modal"

        role="dialog"

        aria-modal="true"

        aria-labelledby="event-dialog-title"

      >

        <div className={`modal-hero category-${event.category.toLowerCase()}`}>

          {event.flyerUrl ? (

            <img src={event.flyerUrl} alt={`Flyer for ${event.title}`} />

          ) : (

            <div className="modal-placeholder">

              <Icon sx={{ fontSize: 74 }} />

              <span>{event.category} event</span>

            </div>

          )}

          <button

            ref={closeRef}

            className="modal-close"

            aria-label="Close event details"

            onClick={onClose}

          >

            <CloseRoundedIcon />

          </button>

        </div>

        <div className="modal-body">

          <span className={`detail-badge category-${event.category.toLowerCase()}`}>

            {event.category}

          </span>

          <h2 id="event-dialog-title">{event.title}</h2>

          <p className="detail-line">

            <CalendarMonthRoundedIcon />

            {displayDate(event.date)} · {event.time}

          </p>

          <p className="detail-line">

            <LocationOnRoundedIcon />

            {event.location}

          </p>

          <p className="detail-description">{event.description}</p>

          <div className="detail-highlight">

            <Icon />

            <span>{event.category}</span>

            <small>Discover something new on campus</small>

          </div>

          <div className="event-plan-section">

            <h3>What's your plan? ♡</h3>

            <p>Keep track of events you're interested in attending.</p>

            <div className="event-plan-options">

              <button

                className={planStatus === "interested" ? "active" : ""}

                onClick={() => onPlanChange("interested")}

                aria-pressed={planStatus === "interested"}

              >

                <FavoriteBorderRoundedIcon />

                Interested

              </button>

              <button

                className={planStatus === "going" ? "active" : ""}

                onClick={() => onPlanChange("going")}

                aria-pressed={planStatus === "going"}

              >

                <CheckCircleRoundedIcon />

                Going

              </button>

            </div>

            <small>

              These selections are private on this device for now.

              They are not official PIN RSVPs.

            </small>

          </div>

          <button className="primary-action" onClick={onSave}>

            {isSaved ? <FavoriteRoundedIcon /> : <FavoriteBorderRoundedIcon />}

            {isSaved ? "Saved — tap to remove" : "Save Event"}

          </button>

          <button className="secondary-action" onClick={onLocation}>

            <LocationOnRoundedIcon />

            Find on Map

          </button>

          {event.sourceUrl ? (

            <a

              className="source-link"

              href={event.sourceUrl}

              target="_blank"

              rel="noopener noreferrer"

            >

              View original event on PIN

              <OpenInNewRoundedIcon fontSize="small" />

            </a>

          ) : null}

        </div>

      </section>

    </div>

  );

}

export default function App() {

  const [tab, setTab] = useState("home");

  const [category, setCategory] = useState("All");

  const [searchOpen, setSearchOpen] = useState(false);

  const [query, setQuery] = useState("");

  const { logout, user } = useAuth0();

  const [saved, setSaved] = useState(() => {

    const value = readStorage("verity-saved-events", []);

    return Array.isArray(value) ? value : [];

  });

  const [eventPlans, setEventPlans] = useState(() => {

    const value = readStorage("verity-event-plans", {});

    return value && typeof value === "object" && !Array.isArray(value)

      ? value

      : {};

  });

  const [selected, setSelected] = useState(null);

  const [mapQuery, setMapQuery] = useState("");

  const [buildingId, setBuildingId] = useState(null);

  const [sheet, setSheet] = useState("half");

  const [profileOpen, setProfileOpen] = useState(false);

  const [profilePage, setProfilePage] = useState(null);

  const [savedView, setSavedView] = useState("mine");

  useEffect(() => {

    localStorage.setItem("verity-saved-events", JSON.stringify(saved));

  }, [saved]);

  useEffect(() => {

    localStorage.setItem("verity-event-plans", JSON.stringify(eventPlans));

  }, [eventPlans]);

  const toggleSaved = (id) => {

    setSaved((previous) =>

      previous.includes(id)

        ? previous.filter((value) => value !== id)

        : [...previous, id]

    );

  };

  const updateEventPlan = (eventId, status) => {

    setEventPlans((previous) => ({

      ...previous,

      [eventId]: previous[eventId] === status ? null : status,

    }));

  };

  const navigate = (nextTab) => {

    setTab(nextTab);

    setProfilePage(null);

    setProfileOpen(false);

  };

  const filtered = events.filter(

    (event) =>

      (category === "All" || event.category === category) &&

      [

        event.title,

        event.location,

        event.description,

        event.category,

      ].some((value) => normalize(value).includes(normalize(query)))

  );

  const matches = buildings.filter((building) =>

    [building.name, ...building.aliases].some((value) =>

      normalize(value).includes(normalize(mapQuery))

    )

  );

  const chosen = buildings.find((building) => building.id === buildingId);

  const buildingEvents = events.filter(

    (event) => event.buildingId === buildingId

  );

  const savedEvents = events

    .filter((event) => saved.includes(event.id))

    .sort((a, b) => a.date.localeCompare(b.date));

  const upcomingCount = savedEvents.filter(

    (event) => new Date(`${event.date}T23:59:59`) >= new Date()

  ).length;

  const openLocation = (event) => {

    setBuildingId(event.buildingId);

    setMapQuery("");

    setSheet("half");

    setSelected(null);

    navigate("map");

  };

  return (

    <div className={`app ${tab === "map" && !profilePage ? "map-mode" : ""}`}>

      {/* HEADER */}

      <header className="app-header">

        <div>

          <h1>

            verity<span>.</span>

          </h1>

          <p>find your people. find your place.</p>

        </div>

        <div className="header-actions">

          <button

            className="search-toggle"

            aria-label="Search events"

            onClick={() => {

              navigate("home");

              setSearchOpen((previous) => !previous);

            }}

          >

            <SearchRoundedIcon />

          </button>

          <div className="profile-menu-container">

            <button

              className="profile-toggle"

              aria-label="Account menu"

              aria-expanded={profileOpen}

              onClick={() => setProfileOpen((previous) => !previous)}

            >

              <AccountCircleRoundedIcon />

            </button>

            {profileOpen && (

              <div className="profile-dropdown">

                <div className="dropdown-heading">

                  <AccountCircleRoundedIcon />

                  <div>

                    <strong>My Account</strong>

                    <small>Verity student profile</small>

                  </div>

                </div>

                <button

                  onClick={() => {

                    setProfilePage("profile");

                    setProfileOpen(false);

                  }}

                >

                  <PersonRoundedIcon />

                  My Profile

                </button>

                <button

                  onClick={() => {

                    navigate("saved");

                    setSavedView("friends");

                  }}

                >

                  <GroupRoundedIcon />

                  Friends & Activity

                </button>

                <button
                  onClick={() =>
                    logout({
                      logoutParams: { 
                        returnTo: window.location.origin },
                    })
                  }
                >
                  Log out
                </button>

                <button

                  onClick={() => {

                    setProfilePage("settings");

                    setProfileOpen(false);

                  }}

                >

                  <SettingsRoundedIcon />

                  Settings

                </button>

              </div>

            )}

          </div>

        </div>

      </header>

      {/* MAIN CONTENT */}

      <main className="main-content">

        {profilePage ? (

          <section className="account-page">

            <button

              className="account-back"

              onClick={() => setProfilePage(null)}

            >

              ← Back

            </button>

            {profilePage === "profile" && (

              <>

                <div className="account-avatar">

                  <PersonRoundedIcon sx={{ fontSize: 52 }} />

                </div>

                <h2>My Profile ♡</h2>

                <p>Your little corner of Verity.</p>

                <div className="account-info">

                  <strong>Student Profile</strong>

                  <span>You are signed in with Auth0.</span>

                </div>

                <button

                  className="account-action"

                  onClick={() => setProfilePage("settings")}

                >

                  Profile & Privacy Settings

                </button>

              </>

            )}

            {profilePage === "settings" && (

              <>

                <h2>Settings</h2>

                <p>Make Verity yours.</p>

                <div className="account-info">

                  <strong>Account</strong>

                  <span>Signed in as {user?.email || "Verity student"}.</span>

                </div>

                <div className="account-info">

                  <strong>Privacy</strong>

                  <span>

                    Saved events and event plans stay on this device.

                    Sharing will require your permission.

                  </span>

                </div>

              </>

            )}

          </section>

        ) : (

          <>

            {/* HOME */}

            {tab === "home" && (

              <>

                <div className="page-intro">

                  <h2>Discover events ✳</h2>

                  <p>A little something for everyone.</p>

                </div>

                {searchOpen && (

                  <label className="search-field">

                    <SearchRoundedIcon />

                    <input

                      value={query}

                      onChange={(e) => setQuery(e.target.value)}

                      placeholder="Search events or locations..."

                      aria-label="Search events"

                    />

                  </label>

                )}

                <div className="filters" aria-label="Event categories">

                  {categories.map((item) => (

                    <button

                      key={item}

                      className={`filter-button filter-${item.toLowerCase()} ${

                        category === item ? "selected" : ""

                      }`}

                      onClick={() => setCategory(item)}

                      aria-pressed={category === item}

                    >

                      {item}

                    </button>

                  ))}

                </div>

                <div className="events-grid">

                  {filtered.map((event) => (

                    <EventCard

                      key={event.id}

                      event={event}

                      isSaved={saved.includes(event.id)}

                      onSave={() => toggleSaved(event.id)}

                      onOpen={() => setSelected(event)}

                    />

                  ))}

                </div>

                {!filtered.length && (

                  <p className="empty-message">

                    No events match your search. Try another category or keyword.

                  </p>

                )}

              </>

            )}

            {/* SAVED */}

            {tab === "saved" && (

              <>

                <section className="saved-banner">

                  <div className="saved-banner-top">

                    <div>

                      <span className="saved-eyebrow">

                        YOUR COLLECTION ♡

                      </span>

                      <h2>Your little plans.</h2>

                      <p>Good things to look forward to.</p>

                    </div>

                    <CalendarMonthRoundedIcon sx={{ fontSize: 40 }} />

                  </div>

                  <div className="saved-stats">

                    <span>

                      {savedEvents.length} saved event

                      {savedEvents.length !== 1 ? "s" : ""}

                    </span>

                    <span>{upcomingCount} upcoming</span>

                  </div>

                </section>

                <div className="saved-tabs">

                  <button

                    className={savedView === "mine" ? "active" : ""}

                    onClick={() => setSavedView("mine")}

                    aria-pressed={savedView === "mine"}

                  >

                    ♡ My Events

                  </button>

                  <button

                    className={savedView === "friends" ? "active" : ""}

                    onClick={() => setSavedView("friends")}

                    aria-pressed={savedView === "friends"}

                  >

                    <GroupRoundedIcon fontSize="small" />

                    Friends

                  </button>

                </div>

                {savedView === "mine" ? (

                  <>

                    <h2 className="saved-section-title">

                      Your saved events

                    </h2>

                    {savedEvents.length ? (

                      <div className="events-grid">

                        {savedEvents.map((event) => (

                          <EventCard

                            key={event.id}

                            event={event}

                            isSaved={true}

                            onSave={() => toggleSaved(event.id)}

                            onOpen={() => setSelected(event)}

                          />

                        ))}

                      </div>

                    ) : (

                      <div className="saved-empty">

                        <FavoriteBorderRoundedIcon sx={{ fontSize: 48 }} />

                        <h3>Nothing saved just yet ♡</h3>

                        <p>Tap a heart on an event to save it here!</p>

                        <button onClick={() => navigate("home")}>

                          Explore events →

                        </button>

                      </div>

                    )}

                  </>

                ) : (

                  <section className="friends-section">

                    <div className="friends-heading">

                      <h2>Your friends ♡</h2>

                      <span>Demo preview</span>

                    </div>

                    <div className="friend-avatars">

                      {demoFriends.map((friend) => (

                        <div

                          className="friend-avatar-item"

                          key={friend.id}

                        >

                          <div

                            className="friend-avatar"

                            style={{ background: friend.color }}

                          >

                            {friend.initial}

                          </div>

                          <span>{friend.name}</span>

                        </div>

                      ))}

                    </div>

                    <h2 className="saved-section-title">

                      Friends' activity

                    </h2>

                    {demoFriends.map((friend) => {

                      const event = events.find(

                        (item) => item.id === friend.eventId

                      );

                      if (!event) return null;

                      return (

                        <button

                          className="friend-activity-card"

                          key={friend.id}

                          onClick={() => setSelected(event)}

                        >

                          <div

                            className="friend-avatar small"

                            style={{ background: friend.color }}

                          >

                            {friend.initial}

                          </div>

                          <div className="friend-activity-info">

                            <strong>{friend.name}</strong>

                            <span>

                              {friend.status === "Going"

                                ? "is going to"

                                : "is interested in"}

                            </span>

                            <b>{event.title}</b>

                          </div>

                          {friend.status === "Going" ? (

                            <CheckCircleRoundedIcon />

                          ) : (

                            <FavoriteRoundedIcon />

                          )}

                        </button>

                      );

                    })}

                    <p className="friends-disclaimer">

                      These are fictional examples. Real friends and

                      shared activity require student accounts.

                    </p>

                  </section>

                )}

              </>

            )}

            {/* MAP */}

            {tab === "map" && (

              <div className="map-page">

                <label className="search-field map-search">

                  <SearchRoundedIcon />

                  <input

                    value={mapQuery}

                    onChange={(e) => setMapQuery(e.target.value)}

                    placeholder="Find a building (rec, sce, library...)"

                    aria-label="Search campus buildings"

                  />

                </label>

                {mapQuery.trim() && (

                  <div className="building-results">

                    {matches.length ? (

                      matches.map((building) => (

                        <button

                          key={building.id}

                          onClick={() => {

                            setBuildingId(building.id);

                            setMapQuery("");

                            setSheet("half");

                          }}

                        >

                          {building.name}

                          <ArrowForwardRoundedIcon />

                        </button>

                      ))

                    ) : (

                      <p>No buildings found.</p>

                    )}

                  </div>

                )}

                {/* Replace this placeholder with your teammate's map */}

                <div className="map-illustration">

                  <MapRoundedIcon sx={{ fontSize: 64 }} />

                  <strong>Campus map</strong>

                  <span>

                    Connect your teammate's interactive map here.

                  </span>

                  <div className="map-pin-list">

                    {buildings.map((building) => (

                      <button

                        key={building.id}

                        className={

                          buildingId === building.id ? "chosen" : ""

                        }

                        onClick={() => {

                          setBuildingId(building.id);

                          setSheet("half");

                        }}

                      >

                        <LocationOnRoundedIcon fontSize="small" />

                        {building.name}

                      </button>

                    ))}

                  </div>

                </div>

                <div className={`events-sheet sheet-${sheet}`}>

                  <button

                    className="sheet-handle"

                    onClick={() =>

                      setSheet((current) =>

                        current === "collapsed"

                          ? "half"

                          : current === "half"

                          ? "expanded"

                          : "collapsed"

                      )

                    }

                    aria-label={`Events panel ${sheet}; change height`}

                  >

                    <span />

                  </button>

                  <div className="sheet-inner">

                    <h3>

                      {chosen ? chosen.name : "Explore campus"}

                    </h3>

                    <p>

                      {chosen

                        ? `${buildingEvents.length} event${

                            buildingEvents.length === 1 ? "" : "s"

                          } at this location`

                        : "Select a building to discover events."}

                    </p>

                    {buildingEvents.map((event) => (

                      <button

                        className="sheet-event"

                        key={event.id}

                        onClick={() => setSelected(event)}

                      >

                        <strong>{event.title}</strong>

                        <small>

                          {displayDate(event.date)} · {event.time}

                        </small>

                        <ArrowForwardRoundedIcon />

                      </button>

                    ))}

                  </div>

                </div>

              </div>

            )}

          </>

        )}

      </main>

      {/* BOTTOM NAV */}

      <nav className="bottom-nav" aria-label="Main navigation">

        {[

          { id: "home", label: "Home", Icon: HomeRoundedIcon },

          { id: "map", label: "Map", Icon: MapRoundedIcon },

          { id: "saved", label: "Saved", Icon: FavoriteBorderRoundedIcon },

        ].map(({ id, label, Icon }) => (

          <button

            key={id}

            className={`nav-item ${

              tab === id && !profilePage ? "active" : ""

            }`}

            onClick={() => navigate(id)}

            aria-current={

              tab === id && !profilePage ? "page" : undefined

            }

          >

            <Icon />

            <span>{label}</span>

            <i className="nav-indicator" />

          </button>

        ))}

      </nav>

      {/* EVENT DETAILS */}

      {selected && (

        <EventModal

          event={selected}

          isSaved={saved.includes(selected.id)}

          onSave={() => toggleSaved(selected.id)}

          onClose={() => setSelected(null)}

          onLocation={() => openLocation(selected)}

          planStatus={eventPlans[selected.id] || null}

          onPlanChange={(status) =>

            updateEventPlan(selected.id, status)

          }

        />

      )}

    </div>

  );

}
