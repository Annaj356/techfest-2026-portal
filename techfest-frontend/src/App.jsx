import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API_BASE_URL = "https://techfest-backend-yjz8.onrender.com/api";

function App() {
  const [page, setPage] = useState(
    localStorage.getItem("token") ? "events" : "login"
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [role, setRole] = useState("");
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [eventName, setEventName] = useState("");
  const [category, setCategory] = useState("");
  const [fee, setFee] = useState("");
  const [seats, setSeats] = useState("");
  const [date, setDate] = useState("");
  const [editingId, setEditingId] = useState(null);

  // Extract Role from JWT Token
  const getRoleFromToken = (jwtToken) => {
    try {
      const payload = JSON.parse(atob(jwtToken.split(".")[1]));
      return payload.role || "";
    } catch (error) {
      return "";
    }
  };

  // Fetch Events
  const getEvents = () => {
    axios
      .get(`${API_BASE_URL}/events`)
      .then((response) => {
        setEvents(response.data);
      })
      .catch((error) => {
        console.error("Error fetching events:", error);
      });
  };

  useEffect(() => {
    getEvents();
    if (token) {
      setRole(getRoleFromToken(token));
    }
  }, [token]);

  // Auth Functions
  const signup = () => {
    axios
      .post(`${API_BASE_URL}/auth/signup`, { name, email, password })
      .then((response) => {
        alert(response.data.message || "Account created successfully!");
        setName("");
        setEmail("");
        setPassword("");
        setPage("login");
      })
      .catch((error) => {
        alert(error.response?.data?.message || "Signup failed");
      });
  };

  const login = () => {
    axios
      .post(`${API_BASE_URL}/auth/login`, { email, password })
      .then((response) => {
        const receivedToken = response.data.token;
        localStorage.setItem("token", receivedToken);
        setToken(receivedToken);
        setRole(getRoleFromToken(receivedToken));
        setEmail("");
        setPassword("");
        setPage("events");
      })
      .catch((error) => {
        alert(error.response?.data?.message || "Login failed");
      });
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setRole("");
    setRegistrations([]);
    setPage("login");
  };

  // Event Registration
  const registerEvent = (eventId) => {
    if (!token) {
      alert("Please login to register for events.");
      setPage("login");
      return;
    }

    axios
      .post(
        `${API_BASE_URL}/registrations`,
        { eventId: eventId },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((response) => {
        alert(response.data.message || "Registered successfully!");
        getEvents();
      })
      .catch((error) => {
        alert(error.response?.data?.message || "Registration failed");
      });
  };

  const getMyRegistrations = () => {
    axios
      .get(`${API_BASE_URL}/registrations/my`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setRegistrations(response.data);
        setPage("registrations");
      })
      .catch((error) => {
        alert(error.response?.data?.message || "Could not load registrations");
      });
  };

  // Admin Dashboard Actions
  const clearForm = () => {
    setEventName("");
    setCategory("");
    setFee("");
    setSeats("");
    setDate("");
    setEditingId(null);
  };

  const addEvent = () => {
    const payload = {
      name: eventName,
      title: eventName,
      category,
      fee: Number(fee),
      price: Number(fee),
      seats: Number(seats),
      availableSeats: Number(seats),
      date,
    };

    axios
      .post(`${API_BASE_URL}/events`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        alert("Event added successfully");
        clearForm();
        getEvents();
      })
      .catch((error) => {
        alert(error.response?.data?.message || "Could not add event");
      });
  };

  const editEvent = (event) => {
    setEditingId(event._id);
    setEventName(event.title || event.name || "");
    setCategory(event.category || "");
    setFee(event.price ?? event.fee ?? "");
    setSeats(event.availableSeats ?? event.seats ?? "");
    setDate(event.date ? event.date.split("T")[0] : "");
  };

  const updateEvent = () => {
    const payload = {
      name: eventName,
      title: eventName,
      category,
      fee: Number(fee),
      price: Number(fee),
      seats: Number(seats),
      availableSeats: Number(seats),
      date,
    };

    axios
      .put(`${API_BASE_URL}/events/${editingId}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        alert("Event updated successfully");
        clearForm();
        getEvents();
      })
      .catch((error) => {
        alert(error.response?.data?.message || "Could not update event");
      });
  };

  const deleteEvent = (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;

    axios
      .delete(`${API_BASE_URL}/events/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        alert(response.data.message || "Event deleted");
        getEvents();
      })
      .catch((error) => {
        alert(error.response?.data?.message || "Could not delete event");
      });
  };

  // ==================== PAGE RENDERERS ====================

  // 1. LOGIN PAGE
  if (!token && page === "login") {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-logo">TECHFEST</div>
          <p className="auth-tagline">Discover. Participate. Innovate.</p>
          <h2>Welcome Back</h2>
          <p className="auth-description">Login to explore upcoming events.</p>
          <input
            className="auth-input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="auth-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="primary-button full-button" onClick={login}>
            Login
          </button>
          <p className="auth-switch">Don't have an account?</p>
          <button
            className="secondary-button full-button"
            onClick={() => setPage("signup")}
          >
            Create Account
          </button>
        </div>
      </div>
    );
  }

  // 2. SIGNUP PAGE
  if (!token && page === "signup") {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-logo">TECHFEST</div>
          <p className="auth-tagline">Join the experience.</p>
          <h2>Create Account</h2>
          <p className="auth-description">
            Register to participate in TechFest events.
          </p>
          <input
            className="auth-input"
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="auth-input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="auth-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="primary-button full-button" onClick={signup}>
            Signup
          </button>
          <p className="auth-switch">Already have an account?</p>
          <button
            className="secondary-button full-button"
            onClick={() => setPage("login")}
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  // 3. MY REGISTRATIONS PAGE
  if (page === "registrations") {
    const validRegistrations = registrations.filter((reg) => reg && reg.event);

    return (
      <div className="app-container">
        <nav className="navbar">
          <div className="navbar-brand">
            <span className="brand-icon">T</span>
            <span>TECHFEST</span>
          </div>
          <div className="nav-buttons">
            <button onClick={() => setPage("events")}>Events</button>
            <button className="logout-button" onClick={logout}>
              Logout
            </button>
          </div>
        </nav>
        <main className="main-content">
          <button className="back-button" onClick={() => setPage("events")}>
            ← Back to Events
          </button>
          <p className="section-label">YOUR ACTIVITY</p>
          <h1 className="page-title">My Registrations</h1>

          {validRegistrations.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"></div>
              <h2>No registrations yet</h2>
              <p>You haven't registered for any TechFest events.</p>
              <button onClick={() => setPage("events")}>Explore Events</button>
            </div>
          ) : (
            <div className="registration-list">
              {validRegistrations.map((registration) => {
                const ev = registration.event;
                return (
                  <div className="registration-card" key={registration._id}>
                    <div>
                      <span className="event-category">
                        {ev.category || "GENERAL"}
                      </span>
                      <h3>{ev.title || ev.name || "Event"}</h3>
                      <p>
                        🗓️{" "}
                        {ev.date
                          ? new Date(ev.date).toLocaleDateString()
                          : "Date TBD"}
                      </p>
                      <p>₹ {ev.price ?? ev.fee ?? 0}</p>
                    </div>
                    <div className="registered-badge">✓ Registered</div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    );
  }

  // 4. ADMIN DASHBOARD PAGE
  if (page === "admin") {
    return (
      <div className="app-container">
        <nav className="navbar">
          <div className="navbar-brand">
            <span className="brand-icon">T</span>
            <span>TECHFEST</span>
          </div>
          <div className="nav-buttons">
            <button onClick={() => setPage("events")}>Events</button>
            <button className="logout-button" onClick={logout}>
              Logout
            </button>
          </div>
        </nav>
        <main className="admin-container">
          <button className="back-button" onClick={() => setPage("events")}>
            ← Back to Events
          </button>
          <div className="admin-header">
            <div>
              <p className="section-label">ADMINISTRATION</p>
              <h1>Admin Dashboard</h1>
              <p>Manage TechFest events and registrations.</p>
            </div>
            <div className="admin-badge">ADMIN</div>
          </div>
          <div className="admin-form">
            <h2>{editingId ? "Edit Event" : "Add New Event"}</h2>
            <p className="form-description">
              {editingId
                ? "Update the event details below."
                : "Create a new event for TechFest."}
            </p>
            <label>Event Name</label>
            <input
              className="form-input"
              type="text"
              placeholder="Example: AI Workshop"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
            />
            <label>Category</label>
            <input
              className="form-input"
              type="text"
              placeholder="Example: Technology"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
            <div className="form-row">
              <div className="form-group">
                <label>Fee (₹)</label>
                <input
                  className="form-input"
                  type="number"
                  placeholder="Fee"
                  value={fee}
                  onChange={(e) => setFee(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Seats</label>
                <input
                  className="form-input"
                  type="number"
                  placeholder="Number of seats"
                  value={seats}
                  onChange={(e) => setSeats(e.target.value)}
                />
              </div>
            </div>
            <label>Date</label>
            <input
              className="form-input"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <div className="form-buttons">
              {editingId ? (
                <>
                  <button className="primary-button" onClick={updateEvent}>
                    Update Event
                  </button>
                  <button className="secondary-button" onClick={clearForm}>
                    Cancel
                  </button>
                </>
              ) : (
                <button className="primary-button" onClick={addEvent}>
                  + Add Event
                </button>
              )}
            </div>
          </div>
          <div className="existing-events">
            <div className="section-heading">
              <div>
                <p className="section-label">MANAGEMENT</p>
                <h2>Existing Events</h2>
              </div>
              <span className="event-count">{events.length} Events</span>
            </div>
            <div className="admin-events-grid">
              {events.map((event) => (
                <div className="admin-event" key={event._id}>
                  <div className="event-category">{event.category}</div>
                  <h3>{event.title || event.name}</h3>
                  <p>
                    {event.date
                      ? new Date(event.date).toLocaleDateString()
                      : "N/A"}
                  </p>
                  <div className="admin-event-details">
                    <span>₹ {event.price ?? event.fee ?? 0}</span>
                    <span>
                      {event.availableSeats ?? event.seats ?? 0} seats
                    </span>
                  </div>
                  <div className="admin-actions">
                    <button
                      className="edit-button"
                      onClick={() => editEvent(event)}
                    >
                      Edit
                    </button>
                    <button
                      className="delete-button"
                      onClick={() => deleteEvent(event._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // 5. EVENTS LANDING PAGE (DEFAULT)
  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="navbar-brand">
          <span className="brand-icon">T</span>
          <span>TECHFEST</span>
        </div>
        <div className="nav-buttons">
          <button onClick={() => setPage("events")}>Events</button>
          {token && (
            <button onClick={getMyRegistrations}>My Registrations</button>
          )}
          {role === "admin" && (
            <button onClick={() => setPage("admin")}>Admin Dashboard</button>
          )}
          {token ? (
            <button className="logout-button" onClick={logout}>
              Logout
            </button>
          ) : (
            <button
              className="primary-button"
              onClick={() => setPage("login")}
            >
              Login
            </button>
          )}
        </div>
      </nav>
      <main className="main-content">
        <section className="hero">
          <div>
            <p className="hero-label">TECHFEST 2026</p>
            <h1>
              Discover.
              <br />
              Participate.
              <br />
              Innovate.
            </h1>
            <p>
              Explore exciting technical events, workshops and opportunities.
            </p>
            <button
              className="hero-button"
              onClick={() =>
                document
                  .getElementById("events-section")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Explore Events ↓
            </button>
          </div>
        </section>
        <section id="events-section">
          <div className="section-heading">
            <div>
              <p className="section-label">WHAT'S HAPPENING</p>
              <h2 className="page-title">Upcoming Events</h2>
            </div>
            <p className="event-count">{events.length} Events</p>
          </div>
          <div className="events-grid">
            {events.map((event) => (
              <div className="event-card" key={event._id}>
                <div className="event-category">{event.category}</div>
                <h3>{event.title || event.name}</h3>
                <p className="event-info">
                  🗓️{" "}
                  {event.date
                    ? new Date(event.date).toLocaleDateString()
                    : "Date TBD"}
                </p>
                <p className="event-info">
                  🎟️ {event.availableSeats ?? event.seats ?? 0} seats available
                </p>
                <div className="event-bottom">
                  <span className="event-fee">
                    ₹ {event.price ?? event.fee ?? 0}
                  </span>
                  <button onClick={() => registerEvent(event._id)}>
                    Register →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <footer className="footer">
        <p>© 2026 TechFest · Built with React & Node.js</p>
      </footer>
    </div>
  );
}

export default App;