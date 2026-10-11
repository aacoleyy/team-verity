
import { useState } from "react";

const sampleStudents = [
  {
    id: 1,
    name: "Sam",
    username: "@samwill",
    initial: "S",
    color: "#C5C9EF",
  },
  {
    id: 2,
    name: "Casey",
    username: "@caseyh",
    initial: "C",
    color: "#B9DCC5",
  },
  {
    id: 3,
    name: "Khryssandrah",
    username: "@khrysb",
    initial: "K",
    color: "#F1AFCB",
  },
];

export default function FriendsManager({
  onFriendsChange,
}) {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("search");
  const [sentRequests, setSentRequests] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([3]);
  const [friends, setFriends] = useState([]);

  const addFriend = (id) => {
    setSentRequests((previous) => [...previous, id]);
  };

  const acceptRequest = (id) => {
    const updated = [...new Set([...friends, id])];
  
    setFriends(updated);
  
    setIncomingRequests((previous) =>
      previous.filter((item) => item !== id)
    );
  
    onFriendsChange?.(
      sampleStudents.filter((student) =>
        updated.includes(student.id)
      )
    );
  };

  const declineRequest = (id) => {
    setIncomingRequests((previous) =>
      previous.filter((item) => item !== id)
    );
  };

  const results = search.trim()
  ? sampleStudents.filter((student) =>
      `${student.name} ${student.username}`
        .toLowerCase()
        .includes(search.trim().toLowerCase())
    )
  : [];

  return (
    <div className="friends-manager">
      <h2>Find Friends.</h2>

      <div className="friends-manager-tabs">
        <button onClick={() => setTab("search")}>
          Search
        </button>
        <button onClick={() => setTab("requests")}>
          Requests ({incomingRequests.length})
        </button>
        <button onClick={() => setTab("friends")}>
          Friends ({friends.length})
        </button>
      </div>

      {tab === "search" && (
        <>
          <input
            className="friends-search-input"
            placeholder="Search by name or username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {!search.trim() && (
            <p className="friends-search-hint">
            Search for a student by name or username.
            </p>
        )}

{search.trim() && results.length === 0 && (
  <p className="friends-search-hint">
    No students found.
  </p>
)}

          {results.map((student) => (
            <div className="friends-search-result" key={student.id}>
              <div
                className="friend-avatar"
                style={{ background: student.color }}
              >
                {student.initial}
              </div>

              <div className="friends-search-info">
                <strong>{student.name}</strong>
                <span>{student.username}</span>
              </div>

              <button
                disabled={
                  sentRequests.includes(student.id) ||
                  friends.includes(student.id) ||
                  incomingRequests.includes(student.id)
                }
                onClick={() => addFriend(student.id)}
              >
                {friends.includes(student.id)
                  ? "Friends ✓"
                  : sentRequests.includes(student.id)
                  ? "Requested ✓"
                  : incomingRequests.includes(student.id)
                  ? "Requested"
                  : "Add"}
              </button>
            </div>
          ))}
        </>
      )}

      {tab === "requests" && (
        <>
          <h3>Incoming requests</h3>

          {sampleStudents
            .filter((student) =>
              incomingRequests.includes(student.id)
            )
            .map((student) => (
              <div
                className="friends-search-result"
                key={student.id}
              >
                <strong>{student.name}</strong>

                <button
                  onClick={() => acceptRequest(student.id)}
                >
                  Accept
                </button>

                <button
                  onClick={() => declineRequest(student.id)}
                >
                  Decline
                </button>
              </div>
            ))}

          <h3>Sent requests</h3>

          {sampleStudents
            .filter((student) =>
              sentRequests.includes(student.id)
            )
            .map((student) => (
              <p key={student.id}>
                {student.name} — Pending
              </p>
            ))}
        </>
      )}

      {tab === "friends" && (
        <>
          {friends.length === 0 && (
            <p>No friends added yet.</p>
          )}

          {sampleStudents
            .filter((student) =>
              friends.includes(student.id)
            )
            .map((student) => (
              <div
                className="friends-search-result"
                key={student.id}
              >
                <div
                  className="friend-avatar"
                  style={{ background: student.color }}
                >
                  {student.initial}
                </div>

                <strong>{student.name}</strong>
                <span>Friends ✓</span>
              </div>
            ))}
        </>
      )}
    </div>
  );
}
