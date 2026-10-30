import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [page, setPage] = useState(
    localStorage.getItem("token") ? "events" : "login"
  );

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [token, setToken] = useState(
    localStorage.getItem("token")
  );

  const [role, setRole] = useState("");

  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);

  const [eventName, setEventName] = useState("");
  const [category, setCategory] = useState("");
  const [fee, setFee] = useState("");
  const [seats, setSeats] = useState("");
  const [date, setDate] = useState("");

  const [editingId, setEditingId] = useState(null);

  // =========================
  // GET ROLE FROM TOKEN
  // =========================

  const getRoleFromToken = (jwtToken) => {
    try {
      const payload = JSON.parse(
        atob(jwtToken.split(".")[1])
      );

      return payload.role;
    } catch (error) {
      return "";
    }
  };

  // =========================
  // LOAD EVENTS
  // =========================

  const getEvents = () => {
    axios
      .get("http://https://techfest-backend-yjz8.onrender.com/api/events")
      .then((response) => {
        setEvents(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    getEvents();

    if (token) {
      setRole(getRoleFromToken(token));
    }
  }, [token]);

  // =========================
  // SIGNUP
  // =========================

  const signup = () => {
    axios
      .post("http://https://techfest-backend-yjz8.onrender.com/api/auth/signup", {
        name,
        email,
        password
      })
      .then((response) => {
        alert(response.data.message);

        setName("");
        setEmail("");
        setPassword("");

        setPage("login");
      })
      .catch((error) => {
        alert(
          error.response?.data?.message ||
            "Signup failed"
        );
      });
  };

  // =========================
  // LOGIN
  // =========================

  const login = () => {
    axios
      .post("http://https://techfest-backend-yjz8.onrender.com/api/auth/login", {
        email,
        password
      })
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
        alert(
          error.response?.data?.message ||
            "Login failed"
        );
      });
  };

  // =========================
  // LOGOUT
  // =========================

  const logout = () => {
    localStorage.removeItem("token");

    setToken(null);
    setRole("");
    setRegistrations([]);

    setPage("login");
  };

  // =========================
  // REGISTER FOR EVENT
  // =========================

  const registerEvent = (eventId) => {
    axios
      .post(
        "http://https://techfest-backend-yjz8.onrender.com/api/registrations",
        { eventId: eventId },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      .then((response) => {
        alert(response.data.message);
        getEvents();
      })
      .catch((error) => {
        alert(
          error.response?.data?.message ||
            "Registration failed"
        );
      });
  };

  // =========================
  // MY REGISTRATIONS
  // =========================

  const getMyRegistrations = () => {
    axios
      .get(
        "http://https://techfest-backend-yjz8.onrender.com/api/registrations/my",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      .then((response) => {
        setRegistrations(response.data);
        setPage("registrations");
      })
      .catch((error) => {
        alert(
          error.response?.data?.message ||
            "Could not load registrations"
        );
      });
  };

  // =========================
  // CLEAR ADMIN FORM
  // =========================

  const clearForm = () => {
    setEventName("");
    setCategory("");
    setFee("");
    setSeats("");
    setDate("");
    setEditingId(null);
  };

  // =========================
  // ADD EVENT
  // =========================

  const addEvent = () => {
    axios
      .post(
        "http://https://techfest-backend-yjz8.onrender.com/api/events",
        {
          name: eventName,
          category: category,
          fee: Number(fee),
          seats: Number(seats),
          date: date
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      .then(() => {
        alert("Event added successfully");

        clearForm();
        getEvents();
      })
      .catch((error) => {
        alert(
          error.response?.data?.message ||
            "Could not add event"
        );
      });
  };

  // =========================
  // START EDITING
  // =========================

  const editEvent = (event) => {
    setEditingId(event._id);

    setEventName(event.name);
    setCategory(event.category);
    setFee(event.fee);
    setSeats(event.seats);
    setDate(event.date.split("T")[0]);
  };

  // =========================
  // UPDATE EVENT
  // =========================

  const updateEvent = () => {
    axios
      .put(
        `http://https://techfest-backend-yjz8.onrender.com/api/events/${editingId}`,
        {
          name: eventName,
          category: category,
          fee: Number(fee),
          seats: Number(seats),
          date: date
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      .then(() => {
        alert("Event updated successfully");

        clearForm();
        getEvents();
      })
      .catch((error) => {
        alert(
          error.response?.data?.message ||
            "Could not update event"
        );
      });
  };

  // =========================
  // DELETE EVENT
  // =========================

  const deleteEvent = (eventId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this event?"
    );

    if (!confirmDelete) {
      return;
    }

    axios
      .delete(
        `http://https://techfest-backend-yjz8.onrender.com/api/events/${eventId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      .then((response) => {
        alert(response.data.message);
        getEvents();
      })
      .catch((error) => {
        alert(
          error.response?.data?.message ||
            "Could not delete event"
        );
      });
  };

  // =========================
  // LOGIN PAGE
  // =========================

  if (!token && page === "login") {
    return (
      <div className="auth-container">
        <div className="auth-card">

          <div className="auth-logo">
            TECHFEST
          </div>

          <p className="auth-tagline">
            Discover. Participate. Innovate.
          </p>

          <h2>Welcome Back</h2>

          <p className="auth-description">
            Login to explore upcoming events.
          </p>

          <input
            className="auth-input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
          />

          <input
            className="auth-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
          />

          <button
            className="primary-button full-button"
            onClick={login}
          >
            Login
          </button>

          <p className="auth-switch">
            Don't have an account?
          </p>

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

  // =========================
  // SIGNUP PAGE
  // =========================

  if (!token && page === "signup") {
    return (
      <div className="auth-container">
        <div className="auth-card">

          <div className="auth-logo">
            TECHFEST
          </div>

          <p className="auth-tagline">
            Join the experience.
          </p>

          <h2>Create Account</h2>

          <p className="auth-description">
            Register to participate in TechFest events.
          </p>

          <input
            className="auth-input"
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
          />

          <input
            className="auth-input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
          />

          <input
            className="auth-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
          />

          <button
            className="primary-button full-button"
            onClick={signup}
          >
            Signup
          </button>

          <p className="auth-switch">
            Already have an account?
          </p>

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

  // =========================
  // EVENTS PAGE
  // =========================

  if (page === "events") {
    return (
      <div className="app-container">

        <nav className="navbar">

          <div className="navbar-brand">
            <span className="brand-icon">T</span>
            <span>TECHFEST</span>
          </div>

          <div className="nav-buttons">

            <button
              onClick={() => setPage("events")}
            >
              Events
            </button>

            <button
              onClick={getMyRegistrations}
            >
              My Registrations
            </button>

            {role === "admin" && (
              <button
                onClick={() => setPage("admin")}
              >
                Admin Dashboard
              </button>
            )}

            <button
              className="logout-button"
              onClick={logout}
            >
              Logout
            </button>

          </div>

        </nav>

        <main className="main-content">

          <section className="hero">

            <div>
              <p className="hero-label">
                TECHFEST 2026
              </p>

              <h1>
                Discover.
                <br />
                Participate.
                <br />
                Innovate.
              </h1>

              <p>
                Explore exciting technical events,
                workshops and opportunities.
              </p>

              <button
                className="hero-button"
                onClick={() =>
                  document
                    .getElementById("events-section")
                    ?.scrollIntoView({
                      behavior: "smooth"
                    })
                }
              >
                Explore Events ↓
              </button>
            </div>

          </section>

          <section id="events-section">

            <div className="section-heading">

              <div>
                <p className="section-label">
                  WHAT'S HAPPENING
                </p>

                <h2 className="page-title">
                  Upcoming Events
                </h2>
              </div>

              <p className="event-count">
                {events.length} Events
              </p>

            </div>

            <div className="events-grid">

              {events.map((event) => (
                <div
                  className="event-card"
                  key={event._id}
                >

                  <div className="event-category">
                    {event.category}
                  </div>

                  <h3>{event.name}</h3>

                  <p className="event-info">
                    📅{" "}
                    {new Date(
                      event.date
                    ).toLocaleDateString()}
                  </p>

                  <p className="event-info">
                    🎟️ {event.seats} seats available
                  </p>

                  <div className="event-bottom">

                    <span className="event-fee">
                      ₹{event.fee}
                    </span>

                    <button
                      onClick={() =>
                        registerEvent(event._id)
                      }
                    >
                      Register →
                    </button>

                  </div>

                </div>
              ))}

            </div>

          </section>

        </main>

        <footer className="footer">
          <p>
            © 2026 TechFest · Built with React & Node.js
          </p>
        </footer>

      </div>
    );
  }

  // =========================
  // MY REGISTRATIONS
  // =========================

  if (page === "registrations") {
    return (
      <div className="app-container">

        <nav className="navbar">

          <div className="navbar-brand">
            <span className="brand-icon">T</span>
            <span>TECHFEST</span>
          </div>

          <div className="nav-buttons">

            <button
              onClick={() => setPage("events")}
            >
              Events
            </button>

            <button
              className="logout-button"
              onClick={logout}
            >
              Logout
            </button>

          </div>

        </nav>

        <main className="main-content">

          <button
            className="back-button"
            onClick={() => setPage("events")}
          >
            ← Back to Events
          </button>

          <p className="section-label">
            YOUR ACTIVITY
          </p>

          <h1 className="page-title">
            My Registrations
          </h1>

          {registrations.length === 0 ? (

            <div className="empty-state">
              <div className="empty-icon">📋</div>

              <h2>No registrations yet</h2>

              <p>
                You haven't registered for any
                TechFest events.
              </p>

              <button
                onClick={() => setPage("events")}
              >
                Explore Events
              </button>
            </div>

          ) : (

            <div className="registration-list">

              {registrations.map((registration) => (

                <div
                  className="registration-card"
                  key={registration._id}
                >

                  <div>

                    <span className="event-category">
                      {registration.event.category}
                    </span>

                    <h3>
                      {registration.event.name}
                    </h3>

                    <p>
                      📅{" "}
                      {new Date(
                        registration.event.date
                      ).toLocaleDateString()}
                    </p>

                    <p>
                      💰 ₹{registration.event.fee}
                    </p>

                  </div>

                  <div className="registered-badge">
                    ✓ Registered
                  </div>

                </div>

              ))}

            </div>

          )}

        </main>

      </div>
    );
  }

  // =========================
  // ADMIN DASHBOARD
  // =========================

  if (page === "admin") {
    return (
      <div className="app-container">

        <nav className="navbar">

          <div className="navbar-brand">
            <span className="brand-icon">T</span>
            <span>TECHFEST</span>
          </div>

          <div className="nav-buttons">

            <button
              onClick={() => setPage("events")}
            >
              Events
            </button>

            <button
              className="logout-button"
              onClick={logout}
            >
              Logout
            </button>

          </div>

        </nav>

        <main className="admin-container">

          <button
            className="back-button"
            onClick={() => setPage("events")}
          >
            ← Back to Events
          </button>

          <div className="admin-header">

            <div>
              <p className="section-label">
                ADMINISTRATION
              </p>

              <h1>
                Admin Dashboard
              </h1>

              <p>
                Manage TechFest events and registrations.
              </p>
            </div>

            <div className="admin-badge">
              ADMIN
            </div>

          </div>

          <div className="admin-form">

            <h2>
              {editingId
                ? "Edit Event"
                : "Add New Event"}
            </h2>

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
              onChange={(e) =>
                setEventName(e.target.value)
              }
            />

            <label>Category</label>

            <input
              className="form-input"
              type="text"
              placeholder="Example: Technology"
              value={category}
              onChange={(e) =>
                setCategory(e.target.value)
              }
            />

            <div className="form-row">

              <div className="form-group">

                <label>Fee</label>

                <input
                  className="form-input"
                  type="number"
                  placeholder="₹ Fee"
                  value={fee}
                  onChange={(e) =>
                    setFee(e.target.value)
                  }
                />

              </div>

              <div className="form-group">

                <label>Seats</label>

                <input
                  className="form-input"
                  type="number"
                  placeholder="Number of seats"
                  value={seats}
                  onChange={(e) =>
                    setSeats(e.target.value)
                  }
                />

              </div>

            </div>

            <label>Date</label>

            <input
              className="form-input"
              type="date"
              value={date}
              onChange={(e) =>
                setDate(e.target.value)
              }
            />

            <div className="form-buttons">

              {editingId ? (
                <>
                  <button
                    className="primary-button"
                    onClick={updateEvent}
                  >
                    Update Event
                  </button>

                  <button
                    className="secondary-button"
                    onClick={clearForm}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  className="primary-button"
                  onClick={addEvent}
                >
                  + Add Event
                </button>
              )}

            </div>

          </div>

          <div className="existing-events">

            <div className="section-heading">

              <div>
                <p className="section-label">
                  MANAGEMENT
                </p>

                <h2>
                  Existing Events
                </h2>
              </div>

              <span className="event-count">
                {events.length} Events
              </span>

            </div>

            <div className="admin-events-grid">

              {events.map((event) => (

                <div
                  className="admin-event"
                  key={event._id}
                >

                  <div className="event-category">
                    {event.category}
                  </div>

                  <h3>{event.name}</h3>

                  <p>
                    📅{" "}
                    {new Date(
                      event.date
                    ).toLocaleDateString()}
                  </p>

                  <div className="admin-event-details">

                    <span>
                      ₹{event.fee}
                    </span>

                    <span>
                      {event.seats} seats
                    </span>

                  </div>

                  <div className="admin-actions">

                    <button
                      className="edit-button"
                      onClick={() =>
                        editEvent(event)
                      }
                    >
                      Edit
                    </button>

                    <button
                      className="delete-button"
                      onClick={() =>
                        deleteEvent(event._id)
                      }
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

  return null;
}

export default App;