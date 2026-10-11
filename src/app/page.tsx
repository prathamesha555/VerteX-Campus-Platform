"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";

import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  Bell,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  Clock3,
  Gauge,
  LayoutDashboard,
  MapPin,
  Menu,
  MessageSquareText,
  MoreHorizontal,
  Plus,
  Radio,
  Search,
  ShieldCheck,
  Sparkles,
  Ticket,
  TrendingUp,
  Users,
  X,
  Zap,
} from "lucide-react";

type Page =
  | "Overview"
  | "Events"
  | "Control Center"
  | "Volunteers"
  | "Issue Center"
  | "Insights"
  | "Calendar"
  | "Registrations"
  | "Venues"
  | "Communications"
  | "Reports";

type EventStatus = "Live" | "Published" | "Draft";

type EventItem = {
  id: number;
  title: string;
  category: string;
  date: string;
  time: string;
  venue: string;
  registered: number;
  capacity: number;
  status: EventStatus;
};

type IssueStatus = "Open" | "In progress" | "Resolved";

type Issue = {
  id: number;
  title: string;
  location: string;
  priority: "High" | "Medium" | "Low";
  status: IssueStatus;
  owner: string;
  reported: string;
};

type Announcement = {
  id: number;
  title: string;
  body: string;
  audience: string;
  time: string;
};

const initialEvents: EventItem[] = [
  {
    id: 1,
    title: "VerteX Tech Fest 2026",
    category: "Technical",
    date: "12 OCT",
    time: "10:00 AM",
    venue: "Main Auditorium",
    registered: 247,
    capacity: 300,
    status: "Live",
  },
  {
    id: 2,
    title: "Robotics Build Sprint",
    category: "Competition",
    date: "12 OCT",
    time: "10:30 AM",
    venue: "Engineering Lab 02",
    registered: 89,
    capacity: 100,
    status: "Live",
  },
  {
    id: 3,
    title: "Design Beyond Pixels",
    category: "Workshop",
    date: "12 OCT",
    time: "12:30 PM",
    venue: "Innovation Studio",
    registered: 58,
    capacity: 80,
    status: "Published",
  },
  {
    id: 4,
    title: "Future Founders Summit",
    category: "Seminar",
    date: "13 OCT",
    time: "11:00 AM",
    venue: "Seminar Hall B",
    registered: 124,
    capacity: 200,
    status: "Published",
  },
  {
    id: 5,
    title: "Campus Culture Night",
    category: "Cultural",
    date: "14 OCT",
    time: "06:00 PM",
    venue: "Central Lawn",
    registered: 180,
    capacity: 250,
    status: "Published",
  },
  {
    id: 6,
    title: "AI Innovation Challenge",
    category: "Technical",
    date: "17 OCT",
    time: "09:30 AM",
    venue: "Innovation Studio",
    registered: 35,
    capacity: 120,
    status: "Draft",
  },
];

const initialIssues: Issue[] = [
  {
    id: 23,
    title: "Registration queue building up",
    location: "Main Gate",
    priority: "High",
    status: "Open",
    owner: "Unassigned",
    reported: "4 min ago",
  },
  {
    id: 24,
    title: "Projector connection issue",
    location: "Engineering Lab 02",
    priority: "Medium",
    status: "In progress",
    owner: "Aarav S.",
    reported: "12 min ago",
  },
  {
    id: 25,
    title: "Additional seating required",
    location: "Main Auditorium",
    priority: "Low",
    status: "Resolved",
    owner: "Riya K.",
    reported: "25 min ago",
  },
];

const initialVolunteers = [
  {
    id: 1,
    name: "Aarav Sharma",
    initials: "AS",
    role: "Operations lead",
    location: "Engineering Lab 02",
    color: "violet",
    available: false,
  },
  {
    id: 2,
    name: "Riya Kulkarni",
    initials: "RK",
    role: "Event coordinator",
    location: "Main Auditorium",
    color: "mint",
    available: false,
  },
  {
    id: 3,
    name: "Ishaan Patil",
    initials: "IP",
    role: "Student volunteer",
    location: "Awaiting assignment",
    color: "orange",
    available: true,
  },
  {
    id: 4,
    name: "Ananya Joshi",
    initials: "AJ",
    role: "Student volunteer",
    location: "Registration desk",
    color: "blue",
    available: false,
  },
];

const initialAnnouncements: Announcement[] = [
  {
    id: 1,
    title: "Welcome to VerteX Tech Fest",
    body: "Check the event schedule before arriving at your venue.",
    audience: "All participants",
    time: "Sample announcement",
  },
  {
    id: 2,
    title: "Volunteer briefing",
    body: "Please review your assigned responsibilities before the event.",
    audience: "Volunteers",
    time: "Sample announcement",
  },
];

const navGroups = [
  {
    heading: "WORKSPACE",
    links: [
      { label: "Overview" as Page, icon: LayoutDashboard },
      { label: "Events" as Page, icon: CalendarDays },
      { label: "Control Center" as Page, icon: Radio },
    ],
  },
  {
    heading: "EVENT INTELLIGENCE",
    links: [
      { label: "Calendar" as Page, icon: CalendarDays },
      { label: "Registrations" as Page, icon: Ticket },
      { label: "Venues" as Page, icon: Building2 },
    ],
  },
  {
    heading: "COMMUNICATIONS",
    links: [
      { label: "Communications" as Page, icon: MessageSquareText },
      { label: "Reports" as Page, icon: TrendingUp },
    ],
  },
  {
    heading: "OPERATIONS",
    links: [
      { label: "Volunteers" as Page, icon: Users },
      { label: "Issue Center" as Page, icon: CircleAlert },
      { label: "Insights" as Page, icon: TrendingUp },
    ],
  },
];

function occupancy(event: EventItem) {
  if (event.capacity <= 0) {
    return 0;
  }

  return Math.min(
    100,
    Math.round((event.registered / event.capacity) * 100)
  );
}

function categoryTone(category: string) {
  switch (category) {
    case "Technical":
      return "violet";
    case "Competition":
      return "orange";
    case "Workshop":
      return "mint";
    case "Cultural":
      return "pink";
    case "Seminar":
      return "blue";
    default:
      return "violet";
  }
}

function StatusBadge({ status }: { status: EventStatus }) {
  return (
    <span className={`status-badge status-${status.toLowerCase()}`}>
      <span className="status-dot" />
      {status}
    </span>
  );
}

function Heading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="section-heading">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  detail,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  icon: typeof Users;
  tone: string;
}) {
  return (
    <article className="stat-card">
      <div className="stat-top">
        <span>{label}</span>

        <span className={`stat-icon tone-${tone}`}>
          <Icon size={19} />
        </span>
      </div>

      <div className="stat-value">{value}</div>

      <div className="stat-detail">
        <span className="stat-detail-dot" />
        {detail}
      </div>
    </article>
  );
}

function EventTable({
  events,
  onDetails,
}: {
  events: EventItem[];
  onDetails: (event: EventItem) => void;
}) {
  if (events.length === 0) {
    return (
      <div className="empty-state">
        <CalendarDays size={27} />
        <strong>No events found</strong>
        <p>Try changing your search or selected filter.</p>
      </div>
    );
  }

  return (
    <div className="table-scroll">
      <table className="event-table">
        <thead>
          <tr>
            <th>EVENT</th>
            <th>SCHEDULE</th>
            <th>REGISTRATION</th>
            <th>STATUS</th>
            <th />
          </tr>
        </thead>

        <tbody>
          {events.map((event) => {
            const percentage = occupancy(event);

            return (
              <tr key={event.id}>
                <td>
                  <div className="event-cell">
                    <div
                      className={`event-type-icon tone-${categoryTone(
                        event.category
                      )}`}
                    >
                      <CalendarDays size={18} />
                    </div>

                    <div className="event-cell-info">
                      <strong>{event.title}</strong>

                      <span>
                        {event.category} · {event.venue}
                      </span>
                    </div>
                  </div>
                </td>

                <td>
                  <div className="schedule-cell">
                    <strong>{event.date}</strong>
                    <span>{event.time}</span>
                  </div>
                </td>

                <td>
                  <div className="registration-cell">
                    <div className="registration-label">
                      <strong>{event.registered}</strong>
                      <span> / {event.capacity}</span>

                      <span className="registration-percent">
                        {percentage}%
                      </span>
                    </div>

                    <div className="progress-track">
                      <div
                        className={`progress-fill fill-${categoryTone(
                          event.category
                        )}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </td>

                <td>
                  <StatusBadge status={event.status} />
                </td>

                <td>
                  <button
                    className="icon-button"
                    title={`Details for ${event.title}`}
                    onClick={() => onDetails(event)}
                  >
                    <MoreHorizontal size={19} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function HomePage() {
  const [page, setPage] = useState<Page>("Overview");

  const [events, setEvents] = useState<EventItem[]>(initialEvents);

  const [issues, setIssues] = useState<Issue[]>(initialIssues);

  const [search, setSearch] = useState("");

  const [filter, setFilter] = useState("All events");

  const [createOpen, setCreateOpen] = useState(false);

  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);

  const [toast, setToast] = useState("");

  const [volunteerAssignments, setVolunteerAssignments] = useState<number[]>(
    []
  );

  const [simulationRuns, setSimulationRuns] = useState(0);

  const [lastAction, setLastAction] = useState(
    "Workspace initialized. Ready for event coordination."
  );

  const [newEvent, setNewEvent] = useState({
    title: "",
    category: "Technical",
    date: "",
    time: "10:00",
    venue: "",
    capacity: "120",
  });

  // Announcement state belongs at the top level of the component.
  // These hooks must never be placed inside useMemo, a loop, or a callback.

  const [announcementTitle, setAnnouncementTitle] = useState("");

  const [announcementBody, setAnnouncementBody] = useState("");

  const [announcementAudience, setAnnouncementAudience] = useState(
    "All participants"
  );

  const [announcements, setAnnouncements] =
    useState<Announcement[]>(initialAnnouncements);

  const activeIssues = issues.filter(
    (issue) => issue.status !== "Resolved"
  ).length;

  const liveEvents = events.filter(
    (event) => event.status === "Live"
  ).length;

  // Search and filters are calculated separately from component state.
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const term = search.trim().toLowerCase();

      const matchesSearch =
        !term ||
        event.title.toLowerCase().includes(term) ||
        event.venue.toLowerCase().includes(term) ||
        event.category.toLowerCase().includes(term);

      const matchesFilter =
        filter === "All events" ||
        (filter === "Live" && event.status === "Live") ||
        (filter === "Published" && event.status === "Published") ||
        (filter === "Drafts" && event.status === "Draft") ||
        (filter === "Near capacity" && occupancy(event) >= 85);

      return matchesSearch && matchesFilter;
    });
  }, [events, search, filter]);

  function showToast(message: string) {
    setToast(message);

    window.setTimeout(() => {
      setToast("");
    }, 3000);
  }

  function navigate(nextPage: Page) {
    setPage(nextPage);
    setMobileNavigationOpen(false);
    setNotificationsOpen(false);
  }

  function createEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextId =
      events.reduce((maximum, currentEvent) => {
        return Math.max(maximum, currentEvent.id);
      }, 0) + 1;

    const item: EventItem = {
      id: nextId,
      title: newEvent.title.trim(),
      category: newEvent.category,
      date: newEvent.date
        ? new Date(`${newEvent.date}T12:00:00`)
            .toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
            })
            .toUpperCase()
        : "TBD",
      time: newEvent.time,
      venue: newEvent.venue.trim(),
      registered: 0,
      capacity: Math.max(1, Number(newEvent.capacity) || 120),
      status: "Draft",
    };

    setEvents((previous) => [item, ...previous]);

    setNewEvent({
      title: "",
      category: "Technical",
      date: "",
      time: "10:00",
      venue: "",
      capacity: "120",
    });

    setFilter("All events");
    setSearch("");
    setPage("Events");
    setCreateOpen(false);

    setLastAction(`Created draft: ${item.title}.`);

    showToast("Event draft created successfully.");
  }

  function createAnnouncement(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!announcementTitle.trim() || !announcementBody.trim()) {
      showToast("Enter an announcement title and message.");
      return;
    }

    setAnnouncements((previous) => {
      const nextId =
        previous.reduce((maximum, announcement) => {
          return Math.max(maximum, announcement.id);
        }, 0) + 1;

      const newAnnouncement: Announcement = {
        id: nextId,
        title: announcementTitle.trim(),
        body: announcementBody.trim(),
        audience: announcementAudience,
        time: "Just now · Local prototype",
      };

      return [newAnnouncement, ...previous];
    });

    setAnnouncementTitle("");
    setAnnouncementBody("");

    setLastAction("A new announcement draft was created.");

    showToast("Announcement draft created.");
  }

  function exportEventsCsv() {
    const headers = [
      "Event",
      "Category",
      "Date",
      "Time",
      "Venue",
      "Registrations",
      "Capacity",
      "Status",
    ];

    const rows = events.map((event) => [
      event.title,
      event.category,
      event.date,
      event.time,
      event.venue,
      event.registered,
      event.capacity,
      event.status,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\r\n");

    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "vertex-events-report.csv";

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);

    showToast("Event report exported successfully.");
  }

  function resolveIssue(issueId: number) {
    setIssues((previous) =>
      previous.map((issue) =>
        issue.id === issueId
          ? { ...issue, status: "Resolved" }
          : issue
      )
    );

    setLastAction(`Issue #${issueId} was marked as resolved.`);

    showToast("Issue marked as resolved.");
  }

  function toggleVolunteer(volunteerId: number) {
    const isAssigned = volunteerAssignments.includes(volunteerId);

    setVolunteerAssignments((previous) =>
      isAssigned
        ? previous.filter((id) => id !== volunteerId)
        : [...previous, volunteerId]
    );

    showToast(
      isAssigned
        ? "Volunteer assignment removed."
        : "Volunteer assigned successfully."
    );
  }

  function simulateChange() {
    setSimulationRuns((previous) => previous + 1);

    setLastAction(
      "Change impact preview completed for participants, venues, volunteers, and organizer communications."
    );

    showToast("Change propagation simulation completed.");
  }

  function viewEvent(event: EventItem) {
    showToast(
      `${event.title} · ${event.registered}/${event.capacity} registered · ${event.venue}`
    );
  }

  const totalRegistrations = events.reduce(
    (sum, event) => sum + event.registered,
    0
  );

  const averageOccupancy = Math.round(
    events.reduce((sum, event) => sum + occupancy(event), 0) /
      Math.max(events.length, 1)
  );

  const headingDescription: Record<Page, string> = {
    Overview:
      "Your campus events, people, and operations — connected in one workspace.",
    Events:
      "Create schedules, review registration, and keep every event organized.",
    "Control Center":
      "Monitor venue capacity and operational conditions from one place.",
    Volunteers:
      "Coordinate people, assignments, and event-day responsibilities.",
    "Issue Center":
      "Track operational problems and coordinate their resolution.",
    Insights:
      "Explore participation, registration, and operational performance.",
    Calendar:
      "Plan your campus schedule, review upcoming activities, and identify busy event days.",
    Registrations:
      "Review registrations, track event capacity, and monitor participation.",
    Venues:
      "Manage campus spaces and review the events assigned to each venue.",
    Communications:
      "Prepare campus announcements and organize communications for event participants.",
    Reports:
      "Review event performance and export records for reporting.",
  };

  return (
    <main className="app-shell">
      {/* SIDEBAR */}

      <aside
        className={`sidebar ${
          mobileNavigationOpen ? "sidebar-open" : ""
        }`}
      >
        <div className="brand-lockup">
          <div className="brand-mark" aria-label="VerteX logo">
            
  <svg
    className="vertex-logo-svg"
    viewBox="0 0 64 64"
    role="img"
    aria-label="VerteX"
  >
    <defs>
      <linearGradient
        id="vx-main"
        x1="8"
        y1="7"
        x2="56"
        y2="57"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0" stopColor="#9C8CFF" />
        <stop offset="0.48" stopColor="#6955F0" />
        <stop offset="1" stopColor="#37D6C3" />
      </linearGradient>
    </defs>

    <path
      d="M7 8h14.5L32 37.3 42.7 8H57L37 55.5h-10L7 8Z"
      fill="url(#vx-main)"
    />

    <path
      d="M22.5 8h10.2l-5.1 14.1L22.5 8Z"
      fill="#FFFFFF"
      opacity="0.65"
    />

    <circle
      cx="51.5"
      cy="7.5"
      r="3.5"
      fill="#5CE0CF"
      stroke="#FFFFFF"
      strokeOpacity="0.7"
      strokeWidth="1.2"
    />
  </svg>
          </div>

          <div className="brand-text">
            <div className="brand-name">
              Verte<span className="brand-x">X</span>
            </div>

            <div className="brand-caption">
              CAMPUS INTELLIGENCE
            </div>
          </div>
        </div>

        <button
          className="workspace-selector"
          onClick={() =>
            showToast("Workspace switching will be connected later.")
          }
        >
          <div className="workspace-avatar">
            <Building2 size={19} />
          </div>

          <div className="workspace-copy">
            <strong>Campus workspace</strong>
            <span>Team ParadoX</span>
          </div>

          <ChevronDown size={16} />
        </button>

        <nav className="sidebar-navigation">
          {navGroups.map((group) => (
            <div className="nav-group" key={group.heading}>
              <div className="nav-heading">{group.heading}</div>

              {group.links.map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.label}
                    onClick={() => navigate(item.label)}
                    className={`nav-item ${
                      page === item.label ? "nav-item-active" : ""
                    }`}
                  >
                    <Icon size={19} strokeWidth={1.9} />

                    <span>{item.label}</span>

                    {item.label === "Issue Center" && activeIssues > 0 && (
                      <span className="nav-count">{activeIssues}</span>
                    )}

                    {page === item.label && (
                      <ChevronRight size={15} className="nav-arrow" />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-help">
            <div className="help-icon">
              <MessageSquareText size={18} />
            </div>

            <div>
              <strong>Need assistance?</strong>
              <span>Help & documentation</span>
            </div>

            <ArrowUpRight size={15} />
          </div>

          <div className="profile-row">
            <div className="profile-avatar">PX</div>

            <div className="profile-copy">
              <strong>Team ParadoX</strong>
              <span>Organizer workspace</span>
            </div>

            <button
              className="icon-button profile-options"
              onClick={() =>
                showToast(
                  "Account settings will be added with authentication."
                )
              }
              aria-label="Account options"
            >
              <MoreHorizontal size={18} />
            </button>
          </div>

          <div className="environment-label">
            <span className="environment-dot" />
            PROTOTYPE ENVIRONMENT
          </div>
        </div>
      </aside>

      {/* MAIN WORKSPACE */}

      <div className="app-main">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="mobile-menu-button"
              onClick={() =>
                setMobileNavigationOpen((previous) => !previous)
              }
              aria-label="Toggle sidebar"
            >
              {mobileNavigationOpen ? (
                <X size={20} />
              ) : (
                <Menu size={20} />
              )}
            </button>

            <div className="breadcrumbs">
              <span>Workspace</span>
              <ChevronRight size={14} />
              <strong>{page}</strong>
            </div>
          </div>

          <div className="topbar-actions">
            <label className="search-box">
              <Search size={17} />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    navigate("Events");
                  }
                }}
                placeholder="Search events, venues..."
                aria-label="Search events and venues"
              />

              <span className="search-hint">↵</span>
            </label>

            <div className="notification-wrap">
              <button
                className="icon-button notification-button"
                onClick={() =>
                  setNotificationsOpen((previous) => !previous)
                }
                aria-label="Notifications"
              >
                <Bell size={19} />
                <span className="notification-indicator" />
              </button>

              {notificationsOpen && (
                <div className="notification-popover">
                  <div className="popover-title">
                    <strong>Notifications</strong>

                    <button
                      className="icon-button"
                      onClick={() => setNotificationsOpen(false)}
                      aria-label="Close notifications"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <button
                    className="notification-item"
                    onClick={() => navigate("Issue Center")}
                  >
                    <span className="notification-symbol tone-orange">
                      <CircleAlert size={17} />
                    </span>

                    <span>
                      <strong>Registration queue</strong>
                      <small>Review the Main Gate issue.</small>
                    </span>
                  </button>

                  <button
                    className="notification-item"
                    onClick={() => navigate("Events")}
                  >
                    <span className="notification-symbol tone-violet">
                      <CalendarDays size={17} />
                    </span>

                    <span>
                      <strong>Upcoming events</strong>
                      <small>Review the current schedule.</small>
                    </span>
                  </button>

                  <p className="popover-footnote">
                    Prototype notifications · No messages sent
                  </p>
                </div>
              )}
            </div>

            <div className="topbar-divider" />

            <div className="topbar-user">
              <div className="topbar-avatar">PX</div>

              <div>
                <strong>ParadoX</strong>
                <span>Organizer</span>
              </div>
            </div>
          </div>
        </header>

        <div className="page-content">
          {/* OVERVIEW */}

          {page === "Overview" && (
            <>
              <section className="welcome-section">
                <div>
                  <div className="eyebrow">
                    CAMPUS OPERATIONS / OVERVIEW
                  </div>

                  <h1>
                    Make every event
                    <br />
                    <span>run like clockwork.</span>
                  </h1>

                  <p>
                    One connected workspace for campus events, people, and
                    the changes that keep everything moving.
                  </p>
                </div>

                <div className="welcome-actions">
                  <button
                    className="button button-secondary"
                    onClick={simulateChange}
                  >
                    <Zap size={17} />
                    Simulate change
                  </button>

                  <button
                    className="button button-primary"
                    onClick={() => setCreateOpen(true)}
                  >
                    <Plus size={18} />
                    Create event
                  </button>
                </div>
              </section>

              <div className="prototype-banner">
                <div className="banner-symbol">
                  <ShieldCheck size={19} />
                </div>

                <div className="banner-copy">
                  <strong>Your command center is ready.</strong>
                  <p>
                    Explore the interactive prototype using its current
                    example events and operational records.
                  </p>
                </div>

                <span className="prototype-pill">PREVIEW MODE</span>
              </div>

              <section className="stats-grid">
                <StatCard
                  label="Scheduled events"
                  value={String(events.length).padStart(2, "0")}
                  detail="Events in this workspace"
                  icon={CalendarDays}
                  tone="violet"
                />

                <StatCard
                  label="Total registrations"
                  value={totalRegistrations.toLocaleString("en-IN")}
                  detail="Across listed events"
                  icon={Users}
                  tone="mint"
                />

                <StatCard
                  label="Live events"
                  value={String(liveEvents).padStart(2, "0")}
                  detail="Active event status"
                  icon={Radio}
                  tone="orange"
                />

                <StatCard
                  label="Open issues"
                  value={String(activeIssues).padStart(2, "0")}
                  detail="Awaiting resolution"
                  icon={CircleAlert}
                  tone="pink"
                />
              </section>

              <section className="overview-grid">
                <article className="panel events-panel">
                  <div className="panel-header">
                    <div>
                      <div className="panel-title">Event operations</div>

                      <p className="panel-description">
                        A quick look at the upcoming campus schedule.
                      </p>
                    </div>

                    <button
                      className="text-button"
                      onClick={() => navigate("Events")}
                    >
                      View all events
                      <ArrowRight size={15} />
                    </button>
                  </div>

                  <EventTable
                    events={events.slice(0, 4)}
                    onDetails={viewEvent}
                  />
                </article>

                <article className="panel pulse-panel">
                  <div className="panel-header">
                    <div>
                      <div className="panel-title">Operational pulse</div>

                      <p className="panel-description">
                        Summary of current operational attention.
                      </p>
                    </div>

                    <span className="sample-indicator">
                      <span />
                      PREVIEW
                    </span>
                  </div>

                  <div className="pulse-card">
                    <div className="pulse-icon">
                      <Gauge size={22} />
                    </div>

                    <div>
                      <strong>Campus overview</strong>
                      <span>Illustrative operational status</span>
                    </div>

                    <span className="ready-tag">Ready</span>
                  </div>

                  <div className="pulse-metric">
                    <div className="metric-label">
                      <span>Average event occupancy</span>
                      <strong>{averageOccupancy}%</strong>
                    </div>

                    <div className="progress-track progress-tall">
                      <div
                        className="progress-fill fill-violet"
                        style={{ width: `${averageOccupancy}%` }}
                      />
                    </div>

                    <p>
                      Based on the registration totals in the event list.
                    </p>
                  </div>

                  <div className="panel-divider" />

                  <div className="watchlist-heading">
                    <strong>Priority watchlist</strong>
                    <span>{activeIssues} active</span>
                  </div>

                  {issues
                    .filter((issue) => issue.status !== "Resolved")
                    .slice(0, 3)
                    .map((issue) => (
                      <button
                        className="watchlist-item"
                        key={issue.id}
                        onClick={() => navigate("Issue Center")}
                      >
                        <span
                          className={`watch-dot watch-${issue.priority.toLowerCase()}`}
                        />

                        <span className="watchlist-copy">
                          <strong>{issue.title}</strong>
                          <small>{issue.location}</small>
                        </span>

                        <ChevronRight size={17} />
                      </button>
                    ))}

                  {activeIssues === 0 && (
                    <div className="all-clear">
                      <CheckCircle2 size={18} />
                      All current issues are resolved.
                    </div>
                  )}
                </article>
              </section>

              <section className="engine-banner">
                <div className="engine-copy">
                  <div className="engine-eyebrow">
                    <Sparkles size={15} />
                    THE VERTeX DIFFERENCE
                  </div>

                  <h2>
                    One change.
                    <br />
                    Every team in sync.
                  </h2>

                  <p>
                    An event changes venue or time. VerteX helps organizers
                    identify the potential impact on participants,
                    volunteers, and operations from one place.
                  </p>

                  <button
                    className="engine-button"
                    onClick={simulateChange}
                  >
                    Explore change propagation
                    <ArrowRight size={17} />
                  </button>
                </div>

                <div className="workflow-card">
                  <div className="workflow-header">
                    <div className="workflow-symbol">
                      <Zap size={20} />
                    </div>

                    <div>
                      <strong>Impact preview</strong>
                      <span>Change propagation workflow</span>
                    </div>

                    <span className="workflow-number">
                      #{String(simulationRuns).padStart(2, "0")}
                    </span>
                  </div>

                  <div className="workflow-step">
                    <span className="workflow-step-icon step-violet">
                      <CalendarDays size={17} />
                    </span>

                    <div>
                      <strong>01 · Event update</strong>
                      <span>Organizer changes time or venue.</span>
                    </div>
                  </div>

                  <div className="workflow-line" />

                  <div className="workflow-step">
                    <span className="workflow-step-icon step-mint">
                      <Activity size={17} />
                    </span>

                    <div>
                      <strong>02 · Impact identification</strong>
                      <span>Preview affected teams and assignments.</span>
                    </div>
                  </div>

                  <div className="workflow-line" />

                  <div className="workflow-step">
                    <span className="workflow-step-icon step-orange">
                      <CheckCircle2 size={17} />
                    </span>

                    <div>
                      <strong>03 · Coordinated response</strong>
                      <span>Prepare consistent operational updates.</span>
                    </div>
                  </div>

                  <div className="workflow-note">
                    <Activity size={15} />
                    <span>{lastAction}</span>
                  </div>

                  <span className="simulation-disclaimer">
                    Interactive simulation · No real notifications sent
                  </span>
                </div>
              </section>

              <section className="bottom-grid">
                <article className="panel">
                  <div className="panel-header">
                    <div>
                      <div className="panel-title">Venue capacity</div>

                      <p className="panel-description">
                        Registration compared with event capacity.
                      </p>
                    </div>

                    <button
                      className="icon-button"
                      onClick={() => navigate("Control Center")}
                      aria-label="Open control center"
                    >
                      <ArrowUpRight size={18} />
                    </button>
                  </div>

                  {events.slice(0, 3).map((event) => (
                    <div className="venue-meter" key={event.id}>
                      <div className="venue-meter-heading">
                        <span>{event.venue}</span>

                        <strong>
                          {event.registered} / {event.capacity}
                        </strong>
                      </div>

                      <div className="progress-track">
                        <div
                          className={`progress-fill fill-${categoryTone(
                            event.category
                          )}`}
                          style={{ width: `${occupancy(event)}%` }}
                        />
                      </div>
                    </div>
                  ))}

                  <button
                    className="panel-link"
                    onClick={() => navigate("Control Center")}
                  >
                    Open control center
                    <ArrowRight size={15} />
                  </button>
                </article>

                <article className="panel activity-panel">
                  <div className="panel-header">
                    <div>
                      <div className="panel-title">Workspace activity</div>

                      <p className="panel-description">
                        Recent local prototype activity.
                      </p>
                    </div>

                    <span className="activity-panel-icon">
                      <Activity size={18} />
                    </span>
                  </div>

                  <div className="activity-item">
                    <span className="activity-symbol tone-violet">
                      <CalendarDays size={16} />
                    </span>

                    <div>
                      <strong>Event schedule initialized</strong>
                      <p>Example events loaded into the workspace.</p>
                      <small>Prototype data</small>
                    </div>
                  </div>

                  <div className="activity-item">
                    <span className="activity-symbol tone-mint">
                      <CheckCircle2 size={16} />
                    </span>

                    <div>
                      <strong>Operations workspace ready</strong>
                      <p>Venue and incident panels are available.</p>
                      <small>Prototype data</small>
                    </div>
                  </div>

                  <div className="activity-item">
                    <span className="activity-symbol tone-orange">
                      <Zap size={16} />
                    </span>

                    <div>
                      <strong>Latest activity</strong>
                      <p>{lastAction}</p>
                      <small>Current session</small>
                    </div>
                  </div>
                </article>
              </section>
            </>
          )}

          {/* EVENTS */}

          {page === "Events" && (
            <>
              <Heading
                eyebrow="EVENT MANAGEMENT"
                title="Your event workspace"
                description={headingDescription.Events}
              />

              <section className="stats-grid">
                <StatCard
                  label="Total events"
                  value={String(events.length).padStart(2, "0")}
                  detail="Current event list"
                  icon={CalendarDays}
                  tone="violet"
                />

                <StatCard
                  label="Live events"
                  value={String(liveEvents).padStart(2, "0")}
                  detail="Active event status"
                  icon={Radio}
                  tone="mint"
                />

                <StatCard
                  label="Published"
                  value={String(
                    events.filter((event) => event.status === "Published")
                      .length
                  ).padStart(2, "0")}
                  detail="Published in this preview"
                  icon={CheckCircle2}
                  tone="orange"
                />

                <StatCard
                  label="Drafts"
                  value={String(
                    events.filter((event) => event.status === "Draft").length
                  ).padStart(2, "0")}
                  detail="Awaiting publication"
                  icon={Clock3}
                  tone="pink"
                />
              </section>

              <article className="panel management-panel">
                <div className="panel-header">
                  <div>
                    <div className="panel-title">All campus events</div>

                    <p className="panel-description">
                      Search, filter, and review event information.
                    </p>
                  </div>

                  <button
                    className="button button-primary"
                    onClick={() => setCreateOpen(true)}
                  >
                    <Plus size={17} />
                    Create event
                  </button>
                </div>

                <div className="filter-bar">
                  <div className="filter-tabs">
                    {[
                      "All events",
                      "Live",
                      "Published",
                      "Drafts",
                      "Near capacity",
                    ].map((item) => (
                      <button
                        key={item}
                        className={`filter-tab ${
                          filter === item ? "filter-tab-active" : ""
                        }`}
                        onClick={() => setFilter(item)}
                      >
                        {item}
                      </button>
                    ))}
                  </div>

                  <span className="filter-count">
                    {filteredEvents.length} events
                  </span>
                </div>

                <EventTable
                  events={filteredEvents}
                  onDetails={viewEvent}
                />
              </article>

              <div className="information-card">
                <span className="information-icon">
                  <Sparkles size={19} />
                </span>

                <div>
                  <strong>Built for campus event operations</strong>

                  <p>
                    The next development stage will connect event records,
                    registration, publication, and capacity validation to a
                    persistent backend.
                  </p>
                </div>
              </div>
            </>
          )}

          {/* CONTROL CENTER */}

          {page === "Control Center" && (
            <>
              <Heading
                eyebrow="EVENT OPERATIONS"
                title="Control center"
                description={headingDescription["Control Center"]}
              />

              <div className="control-banner">
                <div className="control-banner-symbol">
                  <Radio size={22} />
                </div>

                <div>
                  <strong>Operations overview</strong>
                  <p>
                    Explore sample venue occupancy and operational issues.
                  </p>
                </div>

                <span className="prototype-pill">SAMPLE DATA</span>
              </div>

              <section className="venue-cards">
                {events.slice(0, 3).map((event) => {
                  const percentage = occupancy(event);

                  return (
                    <article className="venue-card" key={event.id}>
                      <div className="venue-card-top">
                        <span
                          className={`venue-card-icon tone-${categoryTone(
                            event.category
                          )}`}
                        >
                          <Building2 size={21} />
                        </span>

                        <span
                          className={`venue-state ${
                            percentage >= 85 ? "venue-state-warning" : ""
                          }`}
                        >
                          {percentage >= 85 ? "Near capacity" : "Normal"}
                        </span>
                      </div>

                      <h3>{event.venue}</h3>
                      <p>{event.title}</p>

                      <div className="venue-capacity-value">
                        <strong>{percentage}%</strong>
                        <span>occupancy</span>
                      </div>

                      <div className="progress-track progress-tall">
                        <div
                          className={`progress-fill fill-${categoryTone(
                            event.category
                          )}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>

                      <div className="venue-card-footer">
                        <span>
                          {event.registered} / {event.capacity} registered
                        </span>
                        <MapPin size={15} />
                      </div>
                    </article>
                  );
                })}
              </section>

              <div className="lower-control-grid">
                <article className="panel">
                  <div className="panel-header">
                    <div>
                      <div className="panel-title">
                        Operational attention
                      </div>

                      <p className="panel-description">
                        Unresolved issues needing review.
                      </p>
                    </div>

                    <button
                      className="text-button"
                      onClick={() => navigate("Issue Center")}
                    >
                      View issues
                      <ArrowRight size={15} />
                    </button>
                  </div>

                  {issues
                    .filter((issue) => issue.status !== "Resolved")
                    .map((issue) => (
                      <div className="issue-row" key={issue.id}>
                        <span
                          className={`issue-symbol priority-${issue.priority.toLowerCase()}`}
                        >
                          <CircleAlert size={19} />
                        </span>

                        <div className="issue-row-copy">
                          <strong>{issue.title}</strong>
                          <span>{issue.location}</span>
                        </div>

                        <span
                          className={`priority-badge priority-badge-${issue.priority.toLowerCase()}`}
                        >
                          {issue.priority}
                        </span>
                      </div>
                    ))}

                  {activeIssues === 0 && (
                    <div className="all-clear">
                      <CheckCircle2 size={18} />
                      All issues have been resolved.
                    </div>
                  )}
                </article>

                <article className="panel change-preview-panel">
                  <div className="change-preview-icon">
                    <Zap size={23} />
                  </div>

                  <div className="eyebrow">CHANGE PROPAGATION</div>
                  <h2>Test a coordinated change.</h2>

                  <p>
                    Preview how an event update could affect teams,
                    assignments, and organizer communications.
                  </p>

                  <button
                    className="button button-primary button-full"
                    onClick={simulateChange}
                  >
                    Run impact simulation
                    <ArrowRight size={16} />
                  </button>

                  <small>
                    Simulation only · No real notifications sent
                  </small>
                </article>
              </div>
            </>
          )}

          {/* VOLUNTEERS */}

          {page === "Volunteers" && (
            <>
              <Heading
                eyebrow="PEOPLE & RESPONSIBILITIES"
                title="Volunteer coordination"
                description={headingDescription.Volunteers}
              />

              <section className="stats-grid">
                <StatCard
                  label="Volunteer profiles"
                  value="24"
                  detail="Illustrative roster total"
                  icon={Users}
                  tone="violet"
                />

                <StatCard
                  label="On duty"
                  value="18"
                  detail="Illustrative duty count"
                  icon={CheckCircle2}
                  tone="mint"
                />

                <StatCard
                  label="Available"
                  value="06"
                  detail="Illustrative availability"
                  icon={Clock3}
                  tone="orange"
                />

                <StatCard
                  label="Assignments here"
                  value={String(volunteerAssignments.length).padStart(2, "0")}
                  detail="Made in this session"
                  icon={Ticket}
                  tone="pink"
                />
              </section>

              <article className="panel management-panel">
                <div className="panel-header">
                  <div>
                    <div className="panel-title">Volunteer roster</div>

                    <p className="panel-description">
                      Demonstration profiles and local assignments.
                    </p>
                  </div>

                  <button
                    className="button button-secondary"
                    onClick={() =>
                      showToast(
                        "Volunteer invitations will be connected in a later stage."
                      )
                    }
                  >
                    <Plus size={16} />
                    Invite volunteer
                  </button>
                </div>

                <div className="volunteer-grid">
                  {initialVolunteers.map((volunteer) => {
                    const assigned = volunteerAssignments.includes(
                      volunteer.id
                    );

                    return (
                      <article
                        className="volunteer-card"
                        key={volunteer.id}
                      >
                        <div className="volunteer-card-top">
                          <span
                            className={`volunteer-avatar avatar-${volunteer.color}`}
                          >
                            {volunteer.initials}
                          </span>

                          <span
                            className={`volunteer-status ${
                              assigned || !volunteer.available
                                ? "volunteer-status-duty"
                                : "volunteer-status-available"
                            }`}
                          >
                            {assigned
                              ? "Assigned"
                              : volunteer.available
                                ? "Available"
                                : "On duty"}
                          </span>
                        </div>

                        <h3>{volunteer.name}</h3>
                        <p>{volunteer.role}</p>

                        <div className="volunteer-location">
                          <MapPin size={15} />

                          {assigned
                            ? "Event operations queue"
                            : volunteer.location}
                        </div>

                        <button
                          className={`button button-full ${
                            assigned ? "button-secondary" : "button-primary"
                          }`}
                          onClick={() => toggleVolunteer(volunteer.id)}
                        >
                          {assigned ? (
                            <>
                              <Check size={16} />
                              Assigned · Undo
                            </>
                          ) : (
                            <>
                              <Plus size={16} />
                              Assign task
                            </>
                          )}
                        </button>
                      </article>
                    );
                  })}
                </div>
              </article>
            </>
          )}

          {/* ISSUE CENTER */}

          {page === "Issue Center" && (
            <>
              <Heading
                eyebrow="INCIDENT RESPONSE"
                title="Issue center"
                description={headingDescription["Issue Center"]}
              />

              <section className="stats-grid">
                <StatCard
                  label="Total tracked"
                  value={String(issues.length).padStart(2, "0")}
                  detail="Example issue records"
                  icon={CircleAlert}
                  tone="violet"
                />

                <StatCard
                  label="Unresolved"
                  value={String(activeIssues).padStart(2, "0")}
                  detail="Needs attention"
                  icon={Activity}
                  tone="orange"
                />

                <StatCard
                  label="High priority"
                  value={String(
                    issues.filter(
                      (issue) =>
                        issue.priority === "High" &&
                        issue.status !== "Resolved"
                    ).length
                  ).padStart(2, "0")}
                  detail="Active high-priority issues"
                  icon={Zap}
                  tone="pink"
                />

                <StatCard
                  label="Resolved"
                  value={String(
                    issues.filter((issue) => issue.status === "Resolved")
                      .length
                  ).padStart(2, "0")}
                  detail="Resolved in this session"
                  icon={CheckCircle2}
                  tone="mint"
                />
              </section>

              <article className="panel management-panel">
                <div className="panel-header">
                  <div>
                    <div className="panel-title">
                      Operational issue register
                    </div>

                    <p className="panel-description">
                      Review issue priorities and update their status.
                    </p>
                  </div>

                  <button
                    className="button button-primary"
                    onClick={() =>
                      showToast(
                        "Issue reporting form will be added in the next stage."
                      )
                    }
                  >
                    <Plus size={17} />
                    Report issue
                  </button>
                </div>

                <div className="issue-management-list">
                  {issues.map((issue) => (
                    <div className="issue-management-card" key={issue.id}>
                      <span
                        className={`issue-symbol priority-${issue.priority.toLowerCase()}`}
                      >
                        <CircleAlert size={20} />
                      </span>

                      <div className="issue-details">
                        <div className="issue-title-row">
                          <h3>{issue.title}</h3>

                          <span
                            className={`priority-badge priority-badge-${issue.priority.toLowerCase()}`}
                          >
                            {issue.priority}
                          </span>
                        </div>

                        <div className="issue-metadata">
                          <span>#{issue.id}</span>

                          <span>
                            <MapPin size={14} />
                            {issue.location}
                          </span>

                          <span>
                            <Clock3 size={14} />
                            {issue.reported}
                          </span>
                        </div>

                        <p>
                          Responsible: <strong>{issue.owner}</strong>
                        </p>
                      </div>

                      <div className="issue-actions">
                        <span
                          className={`issue-status issue-status-${issue.status.toLowerCase().replace(" ", "-")}`}
                        >
                          {issue.status}
                        </span>

                        {issue.status !== "Resolved" && (
                          <button
                            className="button button-secondary"
                            onClick={() => resolveIssue(issue.id)}
                          >
                            <Check size={15} />
                            Resolve
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            </>
          )}

          {/* INSIGHTS */}

          {page === "Insights" && (
            <>
              <Heading
                eyebrow="OPERATIONS ANALYTICS"
                title="Insights & performance"
                description={headingDescription.Insights}
              />

              <div className="analytics-notice">
                <Activity size={18} />
                These charts illustrate the interface. The analytics are not
                connected to live campus data.
              </div>

              <section className="stats-grid">
                <StatCard
                  label="Registrations"
                  value={totalRegistrations.toLocaleString("en-IN")}
                  detail="Current event list"
                  icon={Users}
                  tone="violet"
                />

                <StatCard
                  label="Events"
                  value={String(events.length).padStart(2, "0")}
                  detail="Current event list"
                  icon={CalendarDays}
                  tone="mint"
                />

                <StatCard
                  label="Avg. occupancy"
                  value={`${averageOccupancy}%`}
                  detail="Across listed events"
                  icon={Gauge}
                  tone="orange"
                />

                <StatCard
                  label="Open issues"
                  value={String(activeIssues).padStart(2, "0")}
                  detail="Current issue list"
                  icon={CircleAlert}
                  tone="pink"
                />
              </section>

              <div className="analytics-grid">
                <article className="panel chart-panel">
                  <div className="panel-header">
                    <div>
                      <div className="panel-title">Weekly activity</div>

                      <p className="panel-description">
                        Illustrative registration and attendance index.
                      </p>
                    </div>

                    <span className="prototype-pill">SAMPLE</span>
                  </div>

                  <div className="chart-legend">
                    <span>
                      <i className="legend-violet" />
                      Registrations
                    </span>

                    <span>
                      <i className="legend-mint" />
                      Attendance
                    </span>
                  </div>

                  <div className="bar-chart">
                    {[
                      { day: "Mon", a: 45, b: 32 },
                      { day: "Tue", a: 62, b: 49 },
                      { day: "Wed", a: 52, b: 41 },
                      { day: "Thu", a: 77, b: 60 },
                      { day: "Fri", a: 67, b: 53 },
                      { day: "Sat", a: 92, b: 73 },
                      { day: "Sun", a: 80, b: 63 },
                    ].map((bar) => (
                      <div className="bar-group" key={bar.day}>
                        <div className="bar-pair">
                          <span
                            className="bar bar-violet"
                            style={{ height: `${bar.a}%` }}
                          />

                          <span
                            className="bar bar-mint"
                            style={{ height: `${bar.b}%` }}
                          />
                        </div>

                        <span className="bar-label">{bar.day}</span>
                      </div>
                    ))}
                  </div>

                  <p className="chart-footnote">
                    Illustrative index values, not actual attendance counts.
                  </p>
                </article>

                <article className="panel category-panel">
                  <div className="panel-header">
                    <div>
                      <div className="panel-title">Events by category</div>

                      <p className="panel-description">
                        Distribution of current events.
                      </p>
                    </div>
                  </div>

                  {[
                    ["Technical", "violet"],
                    ["Workshop", "mint"],
                    ["Competition", "orange"],
                    ["Cultural", "pink"],
                    ["Seminar", "blue"],
                  ].map(([category, tone]) => {
                    const count = events.filter(
                      (event) => event.category === category
                    ).length;

                    const percentage = Math.round(
                      (count / Math.max(events.length, 1)) * 100
                    );

                    return (
                      <div className="category-meter" key={category}>
                        <div className="category-meter-heading">
                          <span>
                            <i className={`category-dot dot-${tone}`} />
                            {category}
                          </span>

                          <strong>{count}</strong>
                        </div>

                        <div className="progress-track">
                          <div
                            className={`progress-fill fill-${tone}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </article>
              </div>
            </>
          )}

          {/* CALENDAR */}

          {page === "Calendar" && (
            <>
              <Heading
                eyebrow="SCHEDULE PLANNING"
                title="Campus calendar"
                description={headingDescription.Calendar}
              />

              <div className="calendar-days">
                {[
                  { day: "MON", date: "12", month: "OCT" },
                  { day: "TUE", date: "13", month: "OCT" },
                  { day: "WED", date: "14", month: "OCT" },
                  { day: "THU", date: "15", month: "OCT" },
                  { day: "FRI", date: "16", month: "OCT" },
                  { day: "SAT", date: "17", month: "OCT" },
                  { day: "SUN", date: "18", month: "OCT" },
                ].map((day, index) => {
                  const dateLabel = `${day.date} ${day.month}`;

                  const dayEvents = events.filter(
                    (event) => event.date === dateLabel
                  );

                  return (
                    <button
                      key={day.date}
                      className={`calendar-day ${
                        index === 0 ? "calendar-day-active" : ""
                      }`}
                      onClick={() =>
                        showToast(
                          `${dayEvents.length} events scheduled for ${dateLabel}.`
                        )
                      }
                    >
                      <span>{day.day}</span>
                      <strong>{day.date}</strong>
                      <small>{day.month}</small>

                      <span className="calendar-event-count">
                        {dayEvents.length} events
                      </span>
                    </button>
                  );
                })}
              </div>

              <article className="panel new-page-panel">
                <div className="panel-header">
                  <div>
                    <div className="panel-title">Event schedule</div>

                    <p className="panel-description">
                      Review the events currently in your workspace.
                    </p>
                  </div>

                  <button
                    className="button button-primary"
                    onClick={() => setCreateOpen(true)}
                  >
                    <Plus size={17} />
                    Create event
                  </button>
                </div>

                <EventTable events={events} onDetails={viewEvent} />
              </article>
            </>
          )}

          {/* REGISTRATIONS */}

          {page === "Registrations" && (
            <>
              <Heading
                eyebrow="PARTICIPANT MANAGEMENT"
                title="Registration management"
                description={headingDescription.Registrations}
              />

              <section className="stats-grid">
                <StatCard
                  label="Total registrations"
                  value={totalRegistrations.toLocaleString("en-IN")}
                  detail="Across listed events"
                  icon={Users}
                  tone="violet"
                />

                <StatCard
                  label="Available capacity"
                  value={String(
                    events.reduce(
                      (sum, event) =>
                        sum + Math.max(0, event.capacity - event.registered),
                      0
                    )
                  )}
                  detail="Remaining listed capacity"
                  icon={Ticket}
                  tone="mint"
                />

                <StatCard
                  label="Events tracked"
                  value={String(events.length).padStart(2, "0")}
                  detail="Current event list"
                  icon={CalendarDays}
                  tone="orange"
                />

                <StatCard
                  label="Average occupancy"
                  value={`${averageOccupancy}%`}
                  detail="Across listed events"
                  icon={Gauge}
                  tone="pink"
                />
              </section>

              <article className="panel new-page-panel">
                <div className="panel-header">
                  <div>
                    <div className="panel-title">
                      Registration overview
                    </div>

                    <p className="panel-description">
                      Compare participant registrations against capacity.
                    </p>
                  </div>
                </div>

                <EventTable
                  events={filteredEvents}
                  onDetails={viewEvent}
                />
              </article>
            </>
          )}

          {/* VENUES */}

          {page === "Venues" && (
            <>
              <Heading
                eyebrow="CAMPUS INFRASTRUCTURE"
                title="Venue management"
                description={headingDescription.Venues}
              />

              <div className="venue-management-grid">
                {Array.from(new Set(events.map((event) => event.venue))).map(
                  (venueName) => {
                    const venueEvents = events.filter(
                      (event) => event.venue === venueName
                    );

                    const registered = venueEvents.reduce(
                      (sum, event) => sum + event.registered,
                      0
                    );

                    const capacity = venueEvents.reduce(
                      (sum, event) => sum + event.capacity,
                      0
                    );

                    const percentage = capacity
                      ? Math.round((registered / capacity) * 100)
                      : 0;

                    return (
                      <article
                        className="panel venue-management-card"
                        key={venueName}
                      >
                        <div className="venue-management-icon">
                          <Building2 size={22} />
                        </div>

                        <div className="venue-management-label">
                          CAMPUS VENUE
                        </div>

                        <h3>{venueName}</h3>

                        <p>
                          {venueEvents.length} listed event
                          {venueEvents.length === 1 ? "" : "s"}
                        </p>

                        <div className="venue-management-metric">
                          <strong>{percentage}%</strong>
                          <span>
                            combined registration-to-capacity ratio
                          </span>
                        </div>

                        <div className="progress-track progress-tall">
                          <div
                            className="progress-fill fill-violet"
                            style={{
                              width: `${Math.min(percentage, 100)}%`,
                            }}
                          />
                        </div>

                        <div className="venue-management-foot">
                          <span>{registered} registrations</span>
                          <span>{capacity} total listed capacity</span>
                        </div>

                        <div className="venue-event-list">
                          {venueEvents.map((event) => (
                            <button
                              key={event.id}
                              onClick={() => viewEvent(event)}
                            >
                              <CalendarDays size={14} />
                              <span>{event.title}</span>
                              <ChevronRight size={15} />
                            </button>
                          ))}
                        </div>
                      </article>
                    );
                  }
                )}
              </div>
            </>
          )}

          {/* COMMUNICATIONS */}

          {page === "Communications" && (
            <>
              <Heading
                eyebrow="CAMPUS COMMUNICATIONS"
                title="Announcements"
                description={headingDescription.Communications}
              />

              <div className="communications-grid">
                <section className="panel announcement-composer">
                  <div className="panel-header">
                    <div>
                      <div className="panel-title">Create announcement</div>

                      <p className="panel-description">
                        Draft an update for a selected campus audience.
                      </p>
                    </div>

                    <span className="announcement-compose-icon">
                      <MessageSquareText size={20} />
                    </span>
                  </div>

                  <form
                    className="event-form"
                    onSubmit={createAnnouncement}
                  >
                    <label className="form-field">
                      <span>Announcement title</span>

                      <input
                        required
                        value={announcementTitle}
                        onChange={(event) =>
                          setAnnouncementTitle(event.target.value)
                        }
                        placeholder="Enter a clear title"
                      />
                    </label>

                    <label className="form-field">
                      <span>Audience</span>

                      <select
                        value={announcementAudience}
                        onChange={(event) =>
                          setAnnouncementAudience(event.target.value)
                        }
                      >
                        <option>All participants</option>
                        <option>Registered students</option>
                        <option>Volunteers</option>
                        <option>Event organizers</option>
                      </select>
                    </label>

                    <label className="form-field">
                      <span>Message</span>

                      <textarea
                        required
                        rows={5}
                        value={announcementBody}
                        onChange={(event) =>
                          setAnnouncementBody(event.target.value)
                        }
                        placeholder="Write your campus announcement..."
                      />
                    </label>

                    <div className="modal-note">
                      <ShieldCheck size={16} />

                      <span>
                        This creates a local draft. No email, SMS, or push
                        notification is sent.
                      </span>
                    </div>

                    <button
                      type="submit"
                      className="button button-primary"
                    >
                      <Plus size={17} />
                      Create announcement
                    </button>
                  </form>
                </section>

                <section className="panel announcement-list-panel">
                  <div className="panel-header">
                    <div>
                      <div className="panel-title">
                        Announcement workspace
                      </div>

                      <p className="panel-description">
                        Review the announcements in this session.
                      </p>
                    </div>

                    <span className="prototype-pill">LOCAL</span>
                  </div>

                  <div className="announcement-list">
                    {announcements.map((announcement) => (
                      <article
                        className="announcement-card"
                        key={announcement.id}
                      >
                        <div className="announcement-card-icon">
                          <MessageSquareText size={19} />
                        </div>

                        <div className="announcement-card-content">
                          <h3>{announcement.title}</h3>

                          <p>{announcement.body}</p>

                          <div className="announcement-meta">
                            <span>{announcement.audience}</span>
                            <span>{announcement.time}</span>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              </div>
            </>
          )}

          {/* REPORTS */}

          {page === "Reports" && (
            <>
              <Heading
                eyebrow="PERFORMANCE & REPORTING"
                title="Reports & analytics"
                description={headingDescription.Reports}
              />

              <section className="stats-grid">
                <StatCard
                  label="Total registrations"
                  value={totalRegistrations.toLocaleString("en-IN")}
                  detail="Current event records"
                  icon={Users}
                  tone="violet"
                />

                <StatCard
                  label="Events"
                  value={String(events.length).padStart(2, "0")}
                  detail="Included in the report"
                  icon={CalendarDays}
                  tone="mint"
                />

                <StatCard
                  label="Average occupancy"
                  value={`${averageOccupancy}%`}
                  detail="Registration-to-capacity ratio"
                  icon={Gauge}
                  tone="orange"
                />

                <StatCard
                  label="Unresolved issues"
                  value={String(activeIssues).padStart(2, "0")}
                  detail="Current issue records"
                  icon={CircleAlert}
                  tone="pink"
                />
              </section>

              <section className="panel reports-panel">
                <div className="panel-header">
                  <div>
                    <div className="panel-title">Available reports</div>

                    <p className="panel-description">
                      Review the information and export event records.
                    </p>
                  </div>
                </div>

                <div className="report-item">
                  <div className="report-icon report-violet">
                    <CalendarDays size={21} />
                  </div>

                  <div className="report-item-content">
                    <strong>Event summary report</strong>

                    <p>
                      Event names, schedules, venues, registrations, capacity,
                      and status.
                    </p>

                    <span>CSV · Current event records</span>
                  </div>

                  <button
                    className="button button-primary"
                    onClick={exportEventsCsv}
                  >
                    <ArrowUpRight size={16} />
                    Export CSV
                  </button>
                </div>

                <div className="report-item">
                  <div className="report-icon report-mint">
                    <TrendingUp size={21} />
                  </div>

                  <div className="report-item-content">
                    <strong>Participation overview</strong>

                    <p>
                      Review registration counts and occupancy calculations
                      for the events currently listed.
                    </p>

                    <span>Interactive summary · Sample data</span>
                  </div>

                  <button
                    className="button button-secondary"
                    onClick={() =>
                      showToast(
                        "Participation metrics are displayed in the overview and insights pages."
                      )
                    }
                  >
                    View metrics
                  </button>
                </div>
              </section>

              <div className="analytics-notice">
                <ShieldCheck size={18} />

                <span>
                  Reports are calculated from the current frontend data.
                  The downloaded CSV is genuine, but it contains only the
                  event records available in this prototype.
                </span>
              </div>
            </>
          )}

          <footer className="app-footer">
            <div className="footer-brand">
              <span className="footer-mark">V</span>
              <strong>VerteX</strong>
              <span className="footer-separator">·</span>
              <span>Team ParadoX</span>
            </div>

            <div className="footer-meta">
              <span>
                <ShieldCheck size={14} />
                Prototype environment
              </span>

              <span>
                Better coordination. Better campus experiences.
              </span>
            </div>
          </footer>
        </div>
      </div>

      {/* CREATE EVENT MODAL */}

      {createOpen && (
        <div
          className="modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setCreateOpen(false);
            }
          }}
        >
          <section
            className="modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-event-title"
          >
            <div className="modal-header">
              <div>
                <div className="eyebrow">EVENT WORKSPACE</div>
                <h2 id="create-event-title">Create an event</h2>
                <p>Add a new event to the current workspace.</p>
              </div>

              <button
                className="icon-button"
                onClick={() => setCreateOpen(false)}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <form className="event-form" onSubmit={createEvent}>
              <label className="form-field">
                <span>Event name *</span>

                <input
                  required
                  value={newEvent.title}
                  onChange={(event) =>
                    setNewEvent((previous) => ({
                      ...previous,
                      title: event.target.value,
                    }))
                  }
                  placeholder="e.g. National Coding Challenge"
                />
              </label>

              <div className="form-row">
                <label className="form-field">
                  <span>Category</span>

                  <select
                    value={newEvent.category}
                    onChange={(event) =>
                      setNewEvent((previous) => ({
                        ...previous,
                        category: event.target.value,
                      }))
                    }
                  >
                    <option>Technical</option>
                    <option>Workshop</option>
                    <option>Competition</option>
                    <option>Cultural</option>
                    <option>Seminar</option>
                  </select>
                </label>

                <label className="form-field">
                  <span>Venue *</span>

                  <input
                    required
                    value={newEvent.venue}
                    onChange={(event) =>
                      setNewEvent((previous) => ({
                        ...previous,
                        venue: event.target.value,
                      }))
                    }
                    placeholder="Event location"
                  />
                </label>
              </div>

              <div className="form-row">
                <label className="form-field">
                  <span>Event date</span>

                  <input
                    type="date"
                    value={newEvent.date}
                    onChange={(event) =>
                      setNewEvent((previous) => ({
                        ...previous,
                        date: event.target.value,
                      }))
                    }
                  />
                </label>

                <label className="form-field">
                  <span>Start time</span>

                  <input
                    type="time"
                    value={newEvent.time}
                    onChange={(event) =>
                      setNewEvent((previous) => ({
                        ...previous,
                        time: event.target.value,
                      }))
                    }
                  />
                </label>
              </div>

              <label className="form-field">
                <span>Registration capacity</span>

                <input
                  type="number"
                  min="1"
                  value={newEvent.capacity}
                  onChange={(event) =>
                    setNewEvent((previous) => ({
                      ...previous,
                      capacity: event.target.value,
                    }))
                  }
                />
              </label>

              <div className="modal-note">
                <Sparkles size={17} />

                <span>
                  The event will be created as a draft. Data is stored in
                  React state for this prototype session.
                </span>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => setCreateOpen(false)}
                >
                  Cancel
                </button>

                <button
                  className="button button-primary"
                  type="submit"
                >
                  <Plus size={17} />
                  Create event
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* TOAST */}

      {toast && (
        <div className="toast-message" role="status">
          <span className="toast-icon">
            <Check size={16} />
          </span>

          <span>{toast}</span>

          <button
            onClick={() => setToast("")}
            aria-label="Dismiss message"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </main>
  );
}