"use client";
import { createClient } from "../lib/supabase/client";

import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  LogOut,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  Clock3,
  Command,
  LayoutDashboard,
  MapPin,
  Menu,
  MessageSquareText,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Ticket,
  TrendingUp,
  Users,
  X,
  Building2,
  ClipboardList,
  BarChart3,
  Radio,
  Zap,
  RefreshCw,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

type PageName =
  | "Overview"
  | "Event Management"
  | "Registrations"
  | "Venue & Rooms"
  | "Live Change Centre"
  | "Volunteers"
  | "Issue Center"
  | "Calendar"
  | "Event Copilot"
  | "Analytics"
  | "Communications"
  | "Reports"
  | "Settings";

type EventStatus =
  | "Draft"
  | "Published"
  | "Live"
  | "Cancelled";

  type EventRecord = {
  id: string;
  title: string;
  category: string;
  description: string;
  venue: string;
  startAt: string;
  endAt: string;
  capacity: number;
  registered: number;
  status: EventStatus;
};

type DatabaseEventRow = {
  id: string;
  title: string;
  category: string | null;
  description: string | null;
  start_at: string;
  end_at: string;
  capacity: number;
  status: string;
  venues: { name: string } | { name: string }[] | null;
};

type RegistrationCountRow = {
  event_id: string;
  registration_count: number | string;
};

type IssueStatus =
  | "Open"
  | "In progress"
  | "Resolved";

type IssueRecord = {
  id: string;
  title: string;
  location: string;
  priority: "Low" | "Medium" | "High";
  status: IssueStatus;
  createdAt: string;
};

type VolunteerTask = {
  id: number;
  title: string;
  owner: string;
  category: string;
  status: "To do" | "In progress" | "Completed";
};

type Announcement = {
  id: string;
  title: string;
  message: string;
  createdAt: string;
};

type EventForm = {
  title: string;
  category: string;
  description: string;
  venue: string;
  startAt: string;
  endAt: string;
  capacity: string;
};

/* =========================================================
   DEMO DATA

   These records make the application useful on first launch.
   They are demonstration data, not live campus records.
========================================================= */

const initialIssues: IssueRecord[] = [
  {
    id: "issue-1",
    title: "Registration queue building up",
    location: "Main Auditorium",
    priority: "High",
    status: "Open",
    createdAt: new Date().toISOString(),
  },
  {
    id: "issue-2",
    title: "Projector connection needs checking",
    location: "Seminar Hall B",
    priority: "Medium",
    status: "In progress",
    createdAt: new Date().toISOString(),
  },
  {
    id: "issue-3",
    title: "Workshop seating arrangement",
    location: "Innovation Studio",
    priority: "Low",
    status: "Resolved",
    createdAt: new Date().toISOString(),
  },
];

const initialTasks: VolunteerTask[] = [
  {
    id: 1,
    title: "Prepare attendee welcome desk",
    owner: "Ananya Shah",
    category: "Registration",
    status: "Completed",
  },
  {
    id: 2,
    title: "Verify auditorium equipment",
    owner: "Rahul Patil",
    category: "Operations",
    status: "In progress",
  },
  {
    id: 3,
    title: "Coordinate speaker arrival",
    owner: "Meera Joshi",
    category: "Coordination",
    status: "To do",
  },
  {
    id: 4,
    title: "Prepare directional signage",
    owner: "Arjun Desai",
    category: "Logistics",
    status: "To do",
  },
];

/* =========================================================
   NAVIGATION
========================================================= */

const navigation: {
  title: string;
  items: {
    name: PageName;
    icon: typeof LayoutDashboard;
  }[];
}[] = [
  {
    title: "WORKSPACE",
    items: [
      { name: "Overview", icon: LayoutDashboard },
      { name: "Event Management", icon: CalendarDays },
      { name: "Registrations", icon: Ticket },
      { name: "Venue & Rooms", icon: Building2 },
      { name: "Calendar", icon: Clock3 },
    ],
  },
  {
    title: "OPERATIONS",
    items: [
      { name: "Live Change Centre", icon: Radio },
      { name: "Volunteers", icon: Users },
      { name: "Issue Center", icon: CircleAlert },
      { name: "Communications", icon: MessageSquareText },
    ],
  },
  {
  title: "INTELLIGENCE",
  items: [
      { name: "Event Copilot", icon: Sparkles },
      { name: "Analytics", icon: BarChart3 },
      { name: "Reports", icon: ClipboardList },
      { name: "Settings", icon: Settings },
    ],
  },
];

/* =========================================================
   HELPERS
========================================================= */

const STORAGE_KEYS = {
  events: "vertex-events-v1",
  issues: "vertex-issues-v1",
  tasks: "vertex-tasks-v1",
  registrations: "vertex-registrations-v1",
  announcements: "vertex-announcements-v1",
};

function createId() {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
}

function readStorage<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);

    return saved ? (JSON.parse(saved) as T) : fallback;
  } catch {
    return fallback;
  }
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateTime(value: string) {
  return `${formatDate(value)} · ${formatTime(value)}`;
}

function toDateTimeInput(value: string) {
  const date = new Date(value);

  const local = new Date(
    date.getTime() - date.getTimezoneOffset() * 60_000,
  );

  return local.toISOString().slice(0, 16);
}

function getEventOccupancy(event: EventRecord) {
  if (event.capacity <= 0) return 0;

  return Math.min(
    100,
    Math.round((event.registered / event.capacity) * 100),
  );
}

function getStatusClass(status: string) {
  return status
    .toLowerCase()
    .replaceAll(" ", "-");
}

function mapDatabaseStatus(status: string): EventStatus {
  switch (status) {
    case "published":
      return "Published";

    case "live":
      return "Live";

    case "cancelled":
      return "Cancelled";

    default:
      return "Draft";
  }
}

/*
  Two events conflict when they use the same venue and
  their time intervals overlap.

  Back-to-back events are permitted:
  10:00–11:00 and 11:00–12:00 do not conflict.
*/
function findVenueConflict(
  candidate: EventRecord,
  events: EventRecord[],
) {
  return events.find((event) => {
    if (event.id === candidate.id) return false;

    if (event.venue !== candidate.venue) return false;

    if (event.status === "Cancelled") return false;

    const aStart = new Date(candidate.startAt).getTime();
    const aEnd = new Date(candidate.endAt).getTime();
    const bStart = new Date(event.startAt).getTime();
    const bEnd = new Date(event.endAt).getTime();

    return aStart < bEnd && bStart < aEnd;
  });
}

const emptyEventForm: EventForm = {
  title: "",
  category: "Technology",
  description: "",
  venue: "Main Auditorium",
  startAt: "",
  endAt: "",
  capacity: "100",
};

/* =========================================================
   MAIN APPLICATION
========================================================= */

export default function Home() {
  const [activePage, setActivePage] =
    useState<PageName>("Overview");

  const [profileName, setProfileName] =
  useState("VerteX User");

  const [userRole, setUserRole] =
  useState("participant");

  const [profileLoading, setProfileLoading] =
  useState(true);

  const [events, setEvents] =   
    useState<EventRecord[]>([]);

  const [eventsLoading, setEventsLoading] = useState(true);

  const [eventsError, setEventsError] = useState("");

  const [issues, setIssues] =
    useState<IssueRecord[]>(initialIssues);

  const [tasks, setTasks] =
    useState<VolunteerTask[]>(initialTasks);

  const [myRegistrations, setMyRegistrations] =
    useState<string[]>([]);

  const [announcements, setAnnouncements] =
    useState<Announcement[]>([]);

  const [ready, setReady] = useState(false);

  const [currentTime, setCurrentTime] = useState<number | null>(null);

  const [searchQuery, setSearchQuery] = useState("");

  const [eventModalOpen, setEventModalOpen] =
    useState(false);

  const [issueModalOpen, setIssueModalOpen] =
    useState(false);

  const [editingEvent, setEditingEvent] =
    useState<EventRecord | null>(null);

  const [eventForm, setEventForm] =
    useState<EventForm>(emptyEventForm);

  const [eventError, setEventError] =
    useState("");

  const [issueTitle, setIssueTitle] = useState("");

  const [issueLocation, setIssueLocation] =
    useState("Main Auditorium");

  const [issuePriority, setIssuePriority] =
    useState<IssueRecord["priority"]>("Medium");

  const [announcementTitle, setAnnouncementTitle] =
    useState("");

  const [announcementMessage, setAnnouncementMessage] =
    useState("");

  const [toast, setToast] = useState("");

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  /* -------------------------------------------------------
     LOAD LOCAL BROWSER DATA
  ------------------------------------------------------- */

  useEffect(() => {

    setIssues(
      readStorage(STORAGE_KEYS.issues, initialIssues),
    );

    setTasks(
      readStorage(STORAGE_KEYS.tasks, initialTasks),
    );

    setMyRegistrations(
      readStorage(STORAGE_KEYS.registrations, []),
    );

    setAnnouncements(
      readStorage(STORAGE_KEYS.announcements, []),
    );

    setAnnouncements(
      readStorage(STORAGE_KEYS.announcements, []),
    );

    setCurrentTime(Date.now());

    setReady(true);
  }, []);

  /* =======================================================
   LOAD SIGNED-IN USER PROFILE
======================================================= */

useEffect(() => {
  let active = true;

  async function loadProfile() {
    try {
      const supabase = createClient();

      // Get the currently authenticated user.
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        window.location.replace("/login");
        return;
      }

      // Retrieve the user's actual database profile.
      const {
        data: profile,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", user.id)
        .single();

      if (profileError) {
        throw profileError;
      }

      if (!active) return;

      setProfileName(
        profile.full_name?.trim() ||
          user.email?.split("@")[0] ||
          "VerteX User"
      );

      setUserRole(profile.role);
    } catch (error) {
      console.error(
        "Could not load user profile:",
        error
      );

      if (active) {
        setProfileName("VerteX User");
        setUserRole("participant");
      }
    } finally {
      if (active) {
        setProfileLoading(false);
      }
    }
  }

  void loadProfile();

  return () => {
    active = false;
  };
}, []);

  /* -------------------------------------------------------
     SAVE CHANGES TO LOCAL STORAGE
  ------------------------------------------------------- */

  useEffect(() => {
    if (!ready) return;

    localStorage.setItem(
      STORAGE_KEYS.issues,
      JSON.stringify(issues),
    );
  }, [issues, ready]);

  useEffect(() => {
    if (!ready) return;

    localStorage.setItem(
      STORAGE_KEYS.tasks,
      JSON.stringify(tasks),
    );
  }, [tasks, ready]);

  useEffect(() => {
    if (!ready) return;

    localStorage.setItem(
      STORAGE_KEYS.registrations,
      JSON.stringify(myRegistrations),
    );
  }, [myRegistrations, ready]);

  useEffect(() => {
    if (!ready) return;

    localStorage.setItem(
      STORAGE_KEYS.announcements,
      JSON.stringify(announcements),
    );
  }, [announcements, ready]);
/* =======================================================
   LOAD REAL EVENTS FROM SUPABASE
======================================================= */

useEffect(() => {
  let active = true;

  const supabase = createClient();

  async function loadDatabaseEvents() {
    if (active) {
      setEventsLoading(true);
      setEventsError("");
    }

    try {
      // Step 1: Load actual event records and their venues.
      const { data, error } = await supabase
        .from("events")
        .select(`
          id,
          title,
          category,
          description,
          start_at,
          end_at,
          capacity,
          status,
          venues (
            name
          )
        `)
        .order("start_at", { ascending: true });

      if (error) {
        throw error;
      }

      // Step 2: Load registration counts.
      const {
        data: registrationData,
        error: registrationError,
      } = await supabase.rpc(
        "get_event_registration_counts"
      );

      if (registrationError) {
        throw registrationError;
      }

      if (!active) return;

      // Step 3: Convert database records into UI records.
      const rows = (
        data ?? []
      ) as unknown as DatabaseEventRow[];

      const registrationRows = (
        registrationData ?? []
      ) as RegistrationCountRow[];

      const registrationCounts = new Map<string, number>(
        registrationRows.map((row) => [
          row.event_id,
          Number(row.registration_count),
        ])
      );

      const mappedEvents: EventRecord[] = rows.map(
        (row) => {
          const venueName = Array.isArray(row.venues)
            ? row.venues[0]?.name
            : row.venues?.name;

          return {
            id: row.id,
            title: row.title,
            category: row.category ?? "Other",
            description: row.description ?? "",
            venue: venueName ?? "Unknown venue",
            startAt: row.start_at,
            endAt: row.end_at,
            capacity: row.capacity,
            registered:
              registrationCounts.get(row.id) ?? 0,
            status: mapDatabaseStatus(row.status),
          };
        }
      );

      // Step 4: Update the dashboard.
      setEvents(mappedEvents);
    } catch (error) {
      console.warn(
        "Could not load VerteX events:",
        error
      );

      if (active) {
        setEventsError(
          error instanceof Error
            ? error.message
            : "Unable to load events from Supabase."
        );
      }
    } finally {
      if (active) {
        setEventsLoading(false);
      }
    }
  }

  // Load events when the page opens.
  void loadDatabaseEvents();

  // Step 5: Subscribe to event changes.
  const channel = supabase
    .channel("vertex-live-events")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "events",
      },
      () => {
        void loadDatabaseEvents();
      }
    )
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "registrations",
      },
      () => {
        void loadDatabaseEvents();
      }
    )
    .subscribe();

  // Step 6: Clean up when the component unmounts.
  return () => {
    active = false;

    void supabase.removeChannel(channel);
  };
}, []);

/* =======================================================
   SIGN OUT
======================================================= */

async function handleLogout() {
  try {
    const supabase = createClient();

    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }

    // Redirect to login after successfully signing out.
    window.location.replace("/login");
  } catch (error) {
    console.error("VerteX logout failed:", error);

    setToast(
      error instanceof Error
        ? `Logout failed: ${error.message}`
        : "Unable to log out. Please try again."
    );
  }
}

  /* -------------------------------------------------------
     TOAST NOTIFICATIONS
  ------------------------------------------------------- */

  useEffect(() => {
    if (!toast) return;

    const timeout = window.setTimeout(
      () => setToast(""),
      3200,
    );

    return () => window.clearTimeout(timeout);
  }, [toast]);

  /* -------------------------------------------------------
     DERIVED DATA
  ------------------------------------------------------- */

/* =======================================================
   ROLE-BASED PERMISSIONS
======================================================= */

const canManageEvents =
  userRole === "organizer" ||
  userRole === "admin";

const isVolunteer =
  userRole === "volunteer";

const roleNavigation = navigation
  .map((group) => ({
    ...group,

    items: group.items.filter((item) => {
      switch (item.name) {
        case "Event Management":
        case "Venue & Rooms":
        case "Live Change Centre":
        case "Communications":
        case "Reports":
          return canManageEvents;

        case "Volunteers":
          return canManageEvents || isVolunteer;

        case "Settings":
          return true;

        default:
          return true;
      }
    }),
  }))
  .filter((group) => group.items.length > 0);

  const filteredEvents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return events
      .filter((event) => {
        if (!query) return true;

        return [
          event.title,
          event.category,
          event.venue,
          event.status,
        ].some((value) =>
          value.toLowerCase().includes(query),
        );
      })
      .sort(
        (a, b) =>
          new Date(a.startAt).getTime() -
          new Date(b.startAt).getTime(),
      );
  }, [events, searchQuery]);

  const publishedEvents = events.filter(
    (event) =>
      event.status === "Published" ||
      event.status === "Live",
  );

  const totalRegistrations = events.reduce(
    (sum, event) => sum + event.registered,
    0,
  );

  const openIssues = issues.filter(
    (issue) => issue.status !== "Resolved",
  );

  const activeVolunteers = tasks.filter(
    (task) => task.status !== "Completed",
  ).length;

  const registrationRate =
    events.length > 0
      ? Math.round(
          events.reduce(
            (sum, event) =>
              sum + getEventOccupancy(event),
            0,
          ) / events.length,
        )
      : 0;

  const upcomingEvents = filteredEvents.filter(
  (event) =>
    (currentTime === null ||
      new Date(event.endAt).getTime() >= currentTime) &&
    event.status !== "Cancelled",
);

  const currentDate =
  currentTime === null
    ? "today"
    : new Date(currentTime).toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });

  /* -------------------------------------------------------
     EVENT FORM
  ------------------------------------------------------- */

  function openCreateEvent() {
    setEditingEvent(null);
    setEventForm(emptyEventForm);
    setEventError("");
    setEventModalOpen(true);
  }

  function openEditEvent(event: EventRecord) {
    setEditingEvent(event);

    setEventForm({
      title: event.title,
      category: event.category,
      description: event.description,
      venue: event.venue,
      startAt: toDateTimeInput(event.startAt),
      endAt: toDateTimeInput(event.endAt),
      capacity: String(event.capacity),
    });

    setEventError("");
    setEventModalOpen(true);
  }

async function saveEvent(
  event: FormEvent<HTMLFormElement>
) {
  event.preventDefault();
  setEventError("");

  let saveStage = "Validating event";

  const start = new Date(eventForm.startAt);
  const end = new Date(eventForm.endAt);
  const capacity = Number(eventForm.capacity);

  // 1. Validate event information.

  if (!eventForm.title.trim() || !eventForm.venue.trim()) {
    setEventError("Please provide an event name and venue.");
    return;
  }

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    end.getTime() <= start.getTime()
  ) {
    setEventError(
      "The event end time must be later than its start time."
    );
    return;
  }

  if (!Number.isInteger(capacity) || capacity < 1) {
    setEventError("Capacity must be a positive whole number.");
    return;
  }

  if (editingEvent && capacity < editingEvent.registered) {
    setEventError(
      "Capacity cannot be lower than current registrations."
    );
    return;
  }

  const candidate: EventRecord = {
    id: editingEvent?.id ?? "",
    title: eventForm.title.trim(),
    category: eventForm.category,
    description: eventForm.description.trim(),
    venue: eventForm.venue.trim(),
    startAt: start.toISOString(),
    endAt: end.toISOString(),
    capacity,
    registered: editingEvent?.registered ?? 0,
    status: editingEvent?.status ?? "Draft",
  };

  // 2. Check for a venue conflict.

  const conflict = findVenueConflict(candidate, events);

  if (conflict) {
    setEventError(
      `Venue conflict: "${conflict.title}" already uses ${
        conflict.venue
      } from ${formatTime(conflict.startAt)} to ${
        formatTime(conflict.endAt)
      } on ${formatDate(conflict.startAt)}.`
    );

    return;
  }

  try {
    // 3. Connect to Supabase.

    saveStage = "Connecting to Supabase";

    const supabase = createClient();

    // 4. Verify the signed-in user.

    saveStage = "Checking signed-in user";

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      throw userError;
    }

    if (!user) {
      setEventError(
        "Your session has expired. Please sign in again."
      );
      return;
    }

    // 5. Find the venue in PostgreSQL.

    saveStage = "Looking up venue";

    const {
      data: venueRecord,
      error: venueError,
    } = await supabase
      .from("venues")
      .select("id")
      .eq("name", candidate.venue)
      .single();

    if (venueError) {
      throw venueError;
    }

    if (!venueRecord) {
      throw new Error(
        `Venue "${candidate.venue}" was not found in the database.`
      );
    }

    // 6. Prepare database columns.

    const databasePayload = {
      title: candidate.title,
      category: candidate.category,
      description: candidate.description,
      start_at: candidate.startAt,
      end_at: candidate.endAt,
      venue_id: venueRecord.id,
      capacity: candidate.capacity,
      status: candidate.status.toLowerCase(),
    };

    let savedEvent: EventRecord;

    // 7. Update an existing event or insert a new event.

    if (editingEvent) {
      saveStage = "Updating event in PostgreSQL";

      const {
        data: updatedRecord,
        error: updateError,
      } = await supabase
        .from("events")
        .update(databasePayload)
        .eq("id", editingEvent.id)
        .select("id")
        .maybeSingle();

      if (updateError) {
        throw updateError;
      }

      if (!updatedRecord) {
        throw new Error(
          "The event was not updated. Check that you own this event and have organizer permissions."
        );
      }

      savedEvent = {
        ...candidate,
        id: updatedRecord.id,
      };
    } else {
      saveStage = "Creating event in PostgreSQL";

      const {
        data: insertedRecord,
        error: insertError,
      } = await supabase
        .from("events")
        .insert({
          ...databasePayload,
          organizer_id: user.id,
        })
        .select("id")
        .single();

      if (insertError) {
        throw insertError;
      }

      savedEvent = {
        ...candidate,
        id: insertedRecord.id,
      };
    }

    // 8. Update the interface after the database succeeds.

    setEvents((previous) =>
      editingEvent
        ? previous.map((item) =>
            item.id === savedEvent.id
              ? savedEvent
              : item
          )
        : [savedEvent, ...previous]
    );

    setEventModalOpen(false);
    setEditingEvent(null);
    setActivePage("Event Management");

    setToast(
      editingEvent
        ? "Event successfully updated in the cloud."
        : "Event successfully saved to the cloud."
    );

  } catch (error: unknown) {
    // 9. Extract the actual database error.

    let message = "Unknown error";
    let details = "";
    let hint = "";
    let code = "";

    if (error instanceof Error) {
      message = error.message;
    }

    if (typeof error === "object" && error !== null) {
      const dbError = error as {
        message?: string;
        details?: string;
        hint?: string;
        code?: string;
      };

      message = dbError.message || message;
      details = dbError.details || "";
      hint = dbError.hint || "";
      code = dbError.code || "";
    }

    console.warn("VerteX save failure:", {
      stage: saveStage,
      message,
      details,
      hint,
      code,
      error,
    });

    // 10. Give a helpful error to the user.

    if (
      code === "23P01" ||
      message.includes("events_no_published_venue_overlap") ||
      message.includes("exclusion constraint")
    ) {
      setEventError(
        "Venue scheduling conflict: an overlapping published or live event already uses this venue."
      );
    } else {
      const diagnostic = [
        `Stage: ${saveStage}`,
        `Error: ${message}`,
        details ? `Details: ${details}` : "",
        hint ? `Hint: ${hint}` : "",
        code ? `Code: ${code}` : "",
      ]
        .filter(Boolean)
        .join(" | ");

      setEventError(diagnostic);
    }
  }
}
  /* -------------------------------------------------------
     EVENT WORKFLOW
  ------------------------------------------------------- */

  function changeEventStatus(
    id: string,
    status: EventStatus,
  ) {
    setEvents((previous) =>
      previous.map((event) =>
        event.id === id
          ? { ...event, status }
          : event,
      ),
    );

    const messages: Record<EventStatus, string> = {
      Draft: "Event moved to Draft.",
      Published: "Event published successfully.",
      Live: "Event marked as Live.",
      Cancelled: "Event cancelled.",
    };

    setToast(messages[status]);
  }

  function advanceEventStatus(event: EventRecord) {
    if (event.status === "Draft") {
      changeEventStatus(event.id, "Published");
      return;
    }

    if (event.status === "Published") {
      changeEventStatus(event.id, "Live");
      return;
    }

    setToast(
      "This event is already live or has been cancelled.",
    );
  }

  /* -------------------------------------------------------
     PARTICIPANT REGISTRATION
  ------------------------------------------------------- */

  function registerForEvent(event: EventRecord) {
    if (myRegistrations.includes(event.id)) {
      setToast(
        "You are already registered for this event.",
      );
      return;
    }

    if (event.status === "Draft") {
      setToast(
        "This event is not published yet.",
      );
      return;
    }

    if (event.status === "Cancelled") {
      setToast(
        "Registration is unavailable for cancelled events.",
      );
      return;
    }

    if (event.registered >= event.capacity) {
      setToast(
        "This event has reached its registration capacity.",
      );
      return;
    }

    setEvents((previous) =>
      previous.map((item) =>
        item.id === event.id
          ? {
              ...item,
              registered: item.registered + 1,
            }
          : item,
      ),
    );

    setMyRegistrations((previous) => [
      ...previous,
      event.id,
    ]);

    setToast(
      `Successfully registered for ${event.title}.`,
    );
  }

  /* -------------------------------------------------------
     ISSUE CENTER
  ------------------------------------------------------- */

  function createIssue(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!issueTitle.trim() || !issueLocation.trim()) {
      setToast(
        "Enter an issue title and location.",
      );
      return;
    }

    const issue: IssueRecord = {
      id: createId(),
      title: issueTitle.trim(),
      location: issueLocation.trim(),
      priority: issuePriority,
      status: "Open",
      createdAt: new Date().toISOString(),
    };

    setIssues((previous) => [
      issue,
      ...previous,
    ]);

    setIssueTitle("");
    setIssuePriority("Medium");
    setIssueModalOpen(false);

    setToast("Issue reported successfully.");
  }

  function advanceIssue(issue: IssueRecord) {
    const nextStatus: Record<
      IssueStatus,
      IssueStatus
    > = {
      Open: "In progress",
      "In progress": "Resolved",
      Resolved: "Open",
    };

    setIssues((previous) =>
      previous.map((item) =>
        item.id === issue.id
          ? {
              ...item,
              status: nextStatus[issue.status],
            }
          : item,
      ),
    );

    setToast(
      `Issue status updated to ${nextStatus[issue.status]}.`,
    );
  }

  /* -------------------------------------------------------
     VOLUNTEER TASKS
  ------------------------------------------------------- */

  function advanceTask(task: VolunteerTask) {
    const nextStatus: Record<
      VolunteerTask["status"],
      VolunteerTask["status"]
    > = {
      "To do": "In progress",
      "In progress": "Completed",
      Completed: "To do",
    };

    setTasks((previous) =>
      previous.map((item) =>
        item.id === task.id
          ? {
              ...item,
              status: nextStatus[task.status],
            }
          : item,
      ),
    );

    setToast("Volunteer task updated.");
  }

  /* -------------------------------------------------------
     ANNOUNCEMENTS
  ------------------------------------------------------- */

  function createAnnouncement(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      !announcementTitle.trim() ||
      !announcementMessage.trim()
    ) {
      setToast(
        "Enter an announcement title and message.",
      );
      return;
    }

    const announcement: Announcement = {
      id: createId(),
      title: announcementTitle.trim(),
      message: announcementMessage.trim(),
      createdAt: new Date().toISOString(),
    };

    setAnnouncements((previous) => [
      announcement,
      ...previous,
    ]);

    setAnnouncementTitle("");
    setAnnouncementMessage("");

    setToast("Announcement saved successfully.");
  }

  /* =======================================================
     REUSABLE COMPONENTS
  ======================================================= */

  function SectionHeading({
    eyebrow,
    title,
    description,
    action,
  }: {
    eyebrow: string;
    title: string;
    description: string;
    action?: React.ReactNode;
  }) {
    return (
      <div className="page-heading">
        <div>
          <div className="eyebrow">{eyebrow}</div>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>

        {action && (
          <div className="heading-actions">
            {action}
          </div>
        )}
      </div>
    );
  }

  function PrimaryButton({
    children,
    onClick,
    type = "button",
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    type?: "button" | "submit";
  }) {
    return (
      <button
        type={type}
        onClick={onClick}
        className="button button-primary"
      >
        {children}
      </button>
    );
  }

  function StatCard({
    label,
    value,
    note,
    icon: Icon,
    tone = "purple",
  }: {
    label: string;
    value: string | number;
    note: string;
    icon: typeof CalendarDays;
    tone?: string;
  }) {
    return (
      <div className="stat-card">
        <div className="stat-top">
          <span className="stat-label">
            {label}
          </span>

          <span
            className={`stat-icon tone-${tone}`}
          >
            <Icon size={19} />
          </span>
        </div>

        <div className="stat-value">
          {value}
        </div>

        <div className="stat-note">
          <ArrowUpRight size={14} />
          {note}
        </div>
      </div>
    );
  }

  function EventCard({
    event,
  }: {
    event: EventRecord;
  }) {
    const registeredByCurrentUser =
      myRegistrations.includes(event.id);

    const occupancy = getEventOccupancy(event);

    return (
      <article className="event-card">
        <div
          className={`event-card-cover cover-${getStatusClass(event.category)}`}
        >
          <span className="cover-label">
            {event.category}
          </span>

          <span
            className={`status-badge status-${getStatusClass(event.status)}`}
          >
            {event.status}
          </span>

          <div className="event-cover-title">
            {event.title}
          </div>
        </div>

        <div className="event-card-body">
          <div className="event-meta">
            <span>
              <CalendarDays size={15} />
              {formatDate(event.startAt)}
            </span>

            <span>
              <Clock3 size={15} />
              {formatTime(event.startAt)}
            </span>
          </div>

          <div className="event-meta">
            <span>
              <MapPin size={15} />
              {event.venue}
            </span>
          </div>

          <p className="event-description">
            {event.description ||
              "No event description has been provided."}
          </p>

          <div className="occupancy-header">
            <span>
              {event.registered} registrations
            </span>

            <span>
              {event.capacity} capacity
            </span>
          </div>

          <div className="progress-track">
            <div
              className="progress-fill"
              style={{
                width: `${occupancy}%`,
              }}
            />
          </div>

          <div className="event-card-actions">
            <button
              className="button button-secondary button-small"
              onClick={() => openEditEvent(event)}
            >
              Manage
            </button>

            {event.status === "Published" ||
            event.status === "Live" ? (
              <button
                className="button button-primary button-small"
                disabled={registeredByCurrentUser}
                onClick={() => registerForEvent(event)}
              >
                {registeredByCurrentUser
                  ? "Registered"
                  : "Register"}
              </button>
            ) : (
              <button
                className="button button-secondary button-small"
                onClick={() =>
                  advanceEventStatus(event)
                }
                disabled={
                  event.status === "Cancelled"
                }
              >
                {event.status === "Draft"
                  ? "Publish"
                  : "Unavailable"}
              </button>
            )}
          </div>
        </div>
      </article>
    );
  }

  function EventTable({
    items,
  }: {
    items: EventRecord[];
  }) {
    if (!items.length) {
      return (
        <div className="empty-state">
          <CalendarDays size={34} />

          <h3>No events found</h3>

          <p>
            Create a new event or change the search
            filters to find an event.
          </p>

          <PrimaryButton onClick={openCreateEvent}>
            <Plus size={17} />
            Create event
          </PrimaryButton>
        </div>
      );
    }

    return (
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>EVENT</th>
              <th>DATE & TIME</th>
              <th>VENUE</th>
              <th>REGISTRATIONS</th>
              <th>STATUS</th>
              <th>ACTION</th>
            </tr>
          </thead>

          <tbody>
            {items.map((event) => (
              <tr key={event.id}>
                <td>
                  <div className="table-title">
                    {event.title}
                  </div>

                  <div className="table-subtitle">
                    {event.category}
                  </div>
                </td>

                <td>
                  <div>{formatDate(event.startAt)}</div>

                  <div className="table-subtitle">
                    {formatTime(event.startAt)}
                  </div>
                </td>

                <td>{event.venue}</td>

                <td>
                  <div className="table-title">
                    {event.registered}/{event.capacity}
                  </div>

                  <div className="mini-progress">
                    <div
                      style={{
                        width: `${getEventOccupancy(event)}%`,
                      }}
                    />
                  </div>
                </td>

                <td>
                  <span
                    className={`status-badge status-${getStatusClass(event.status)}`}
                  >
                    {event.status}
                  </span>
                </td>

                <td>
                  <button
                    className="text-button"
                    onClick={() => openEditEvent(event)}
                  >
                    Manage
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  /* =======================================================
     PAGE VIEWS
  ======================================================= */

  function renderOverview() {
    const recentEvents = upcomingEvents.slice(0, 3);

    return (
      <>
        <SectionHeading
          eyebrow="WORKSPACE OVERVIEW"
          title="Good evening, Organizer."
          description={`Here is your campus event overview for ${currentDate}.`}
          action={
            <PrimaryButton onClick={openCreateEvent}>
              <Plus size={17} />
              Create event
            </PrimaryButton>
          }
        />

        <section className="hero-panel">
          <div className="hero-content">
            <div className="hero-tag">
              <Sparkles size={14} />
              CAMPUS EVENT INTELLIGENCE
            </div>

            <h2>
              Every event.
              <br />
              <span>One intelligent workspace.</span>
            </h2>

            <p>
              Coordinate events, prevent venue clashes,
              manage your team, and keep everyone
              informed from one connected platform.
            </p>

            <div className="hero-actions">
              <button
                className="button button-white"
                onClick={() =>
                  setActivePage("Event Management")
                }
              >
                Explore events
                <ArrowUpRight size={16} />
              </button>

              <button
                className="button button-hero-outline"
                onClick={() =>
                  setActivePage("Live Change Centre")
                }
              >
                <Radio size={16} />
                Live operations
              </button>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-orbit orbit-one" />
            <div className="hero-orbit orbit-two" />

            <div className="floating-card floating-card-top">
              <div className="floating-icon floating-purple">
                <CalendarDays size={18} />
              </div>

              <div>
                <strong>{events.length} events</strong>
                <span>In your workspace</span>
              </div>

              <CheckCircle2
                size={18}
                className="floating-check"
              />
            </div>

            <div className="hero-center">
              <div className="hero-center-icon">
                <Zap size={31} />
              </div>

              <span>VERTeX INTELLIGENCE</span>

              <strong>Connected campus</strong>
            </div>

            <div className="floating-card floating-card-bottom">
              <div className="floating-icon floating-green">
                <ShieldCheck size={18} />
              </div>

              <div>
                <strong>Conflict aware</strong>
                <span>Venue validation enabled</span>
              </div>
            </div>
          </div>
        </section>

        <section className="stats-grid">
          <StatCard
            label="Total events"
            value={events.length}
            note="Across your workspace"
            icon={CalendarDays}
          />

          <StatCard
            label="Registrations"
            value={totalRegistrations.toLocaleString("en-IN")}
            note="Across all events"
            icon={Users}
            tone="green"
          />

          <StatCard
            label="Average capacity"
            value={`${registrationRate}%`}
            note="Average event occupancy"
            icon={TrendingUp}
            tone="orange"
          />

          <StatCard
            label="Open issues"
            value={openIssues.length}
            note="Require team attention"
            icon={CircleAlert}
            tone="red"
          />
        </section>

        <div className="content-grid overview-grid">
          <section className="panel">
            <div className="panel-heading">
              <div>
                <h3>Upcoming events</h3>
                <p>
                  A quick look at what's happening next.
                </p>
              </div>

              <button
                className="text-button"
                onClick={() =>
                  setActivePage("Event Management")
                }
              >
                View all <ArrowUpRight size={15} />
              </button>
            </div>

            <div className="upcoming-list">
              {recentEvents.length ? (
                recentEvents.map((event) => (
                  <div
                    className="upcoming-item"
                    key={event.id}
                  >
                    <div className="date-tile">
                      <strong>
                        {new Date(
                          event.startAt,
                        ).toLocaleDateString("en-IN", {
                          day: "2-digit",
                        })}
                      </strong>

                      <span>
                        {new Date(
                          event.startAt,
                        ).toLocaleDateString("en-IN", {
                          month: "short",
                        })}
                      </span>
                    </div>

                    <div className="upcoming-info">
                      <strong>{event.title}</strong>

                      <span>
                        {event.venue} ·{" "}
                        {formatTime(event.startAt)}
                      </span>
                    </div>

                    <span
                      className={`status-badge status-${getStatusClass(event.status)}`}
                    >
                      {event.status}
                    </span>
                  </div>
                ))
              ) : (
                <p className="muted-text">
                  No upcoming events. Create an event
                  to get started.
                </p>
              )}
            </div>
          </section>

          <section className="panel">
            <div className="panel-heading">
              <div>
                <h3>Operations snapshot</h3>
                <p>
                  A quick health check for your team.
                </p>
              </div>

              <span className="live-indicator">
                <span />
                LOCAL DEMO
              </span>
            </div>

            <div className="operation-list">
              <div className="operation-row">
                <span className="operation-icon purple">
                  <CalendarDays size={17} />
                </span>

                <div>
                  <strong>Event workspace</strong>
                  <span>Events stored locally</span>
                </div>

                <span className="operation-status">
                  Ready
                </span>
              </div>

              <div className="operation-row">
                <span className="operation-icon green">
                  <ShieldCheck size={17} />
                </span>

                <div>
                  <strong>Venue conflict check</strong>
                  <span>Checked before event save</span>
                </div>

                <span className="operation-status">
                  Ready
                </span>
              </div>

              <div className="operation-row">
                <span className="operation-icon orange">
                  <Users size={17} />
                </span>

                <div>
                  <strong>Volunteer operations</strong>
                  <span>{activeVolunteers} active tasks</span>
                </div>

                <span className="operation-status">
                  Tracking
                </span>
              </div>

              <div className="operation-row">
                <span className="operation-icon red">
                  <CircleAlert size={17} />
                </span>

                <div>
                  <strong>Issue monitoring</strong>
                  <span>{openIssues.length} unresolved issues</span>
                </div>

                <button
                  className="text-button"
                  onClick={() =>
                    setActivePage("Issue Center")
                  }
                >
                  Review
                </button>
              </div>
            </div>
          </section>
        </div>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <h3>Registration performance</h3>
              <p>
                Current registrations relative to event capacity.
              </p>
            </div>

            <button
              className="button button-secondary button-small"
              onClick={() => setActivePage("Analytics")}
            >
              View analytics
            </button>
          </div>

          <div className="registration-chart">
            {events.slice(0, 6).map((event) => (
              <div className="chart-column" key={event.id}>
                <div className="chart-bar-area">
                  <div
                    className="chart-bar"
                    style={{
                      height: `${Math.max(
                        6,
                        getEventOccupancy(event),
                      )}%`,
                    }}
                    title={`${getEventOccupancy(event)}% capacity`}
                  />
                </div>

                <span className="chart-label">
                  {event.title.length > 15
                    ? `${event.title.slice(0, 13)}…`
                    : event.title}
                </span>

                <strong>
                  {getEventOccupancy(event)}%
                </strong>
              </div>
            ))}
          </div>
        </section>
      </>
    );
  }

  function renderEventManagement() {
    return (
      <>
        <SectionHeading
          eyebrow="EVENT WORKSPACE"
          title="Manage events"
          description="Create, schedule, publish, and coordinate campus events."
          action={
            <PrimaryButton onClick={openCreateEvent}>
              <Plus size={17} />
              Create event
            </PrimaryButton>
          }
        />

        <section className="stats-grid stats-grid-three">
          <StatCard
            label="Total events"
            value={events.length}
            note="All event records"
            icon={CalendarDays}
          />

          <StatCard
            label="Published"
            value={publishedEvents.length}
            note="Visible for registration"
            icon={CheckCircle2}
            tone="green"
          />

          <StatCard
            label="Drafts"
            value={
              events.filter(
                (event) => event.status === "Draft",
              ).length
            }
            note="Awaiting publication"
            icon={Clock3}
            tone="orange"
          />
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <h3>All events</h3>
              <p>
                Manage event details and publishing status.
              </p>
            </div>

            <span className="record-count">
              {filteredEvents.length} records
            </span>
          </div>

          <EventTable items={filteredEvents} />
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <h3>Explore event cards</h3>
              <p>
                Preview the events your participants can discover.
              </p>
            </div>
          </div>

          <div className="event-grid">
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
              />
            ))}
          </div>
        </section>
      </>
    );
  }

  function renderRegistrations() {
    const registeredEvents = events.filter((event) =>
      myRegistrations.includes(event.id),
    );

    return (
      <>
        <SectionHeading
          eyebrow="PARTICIPANT EXPERIENCE"
          title="Registrations"
          description="Explore published events and manage your demonstration registrations."
        />

        <section className="stats-grid">
          <StatCard
            label="My registrations"
            value={registeredEvents.length}
            note="Registered in this browser"
            icon={Ticket}
          />

          <StatCard
            label="Available events"
            value={
              publishedEvents.filter(
                (event) => event.registered < event.capacity,
              ).length
            }
            note="Open registration capacity"
            icon={CalendarDays}
            tone="green"
          />

          <StatCard
            label="Full events"
            value={
              publishedEvents.filter(
                (event) => event.registered >= event.capacity,
              ).length
            }
            note="Registration capacity reached"
            icon={CircleAlert}
            tone="orange"
          />

          <StatCard
            label="Total participants"
            value={totalRegistrations}
            note="Across all event records"
            icon={Users}
            tone="blue"
          />
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <h3>Available campus events</h3>
              <p>
                Register for a published event using the action button.
              </p>
            </div>
          </div>

          <div className="event-grid">
            {filteredEvents
              .filter(
                (event) =>
                  event.status === "Published" ||
                  event.status === "Live",
              )
              .map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                />
              ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <h3>My registrations</h3>
              <p>
                Events registered from the current browser.
              </p>
            </div>
          </div>

          {registeredEvents.length ? (
            <EventTable items={registeredEvents} />
          ) : (
            <div className="empty-state">
              <Ticket size={35} />

              <h3>No registrations yet</h3>

              <p>
                Register for a published event to see it here.
              </p>

              <button
                className="button button-primary"
                onClick={() =>
                  setActivePage("Event Management")
                }
              >
                Browse events
              </button>
            </div>
          )}
        </section>
      </>
    );
  }

  function renderVenues() {
    const venues = [
      "Main Auditorium",
      "Engineering Lab 02",
      "Innovation Studio",
      "Seminar Hall B",
      "Central Lawn",
    ];

    return (
      <>
        <SectionHeading
          eyebrow="CAMPUS RESOURCES"
          title="Venues & rooms"
          description="Review venue usage and prevent overlapping event schedules."
          action={
            <PrimaryButton onClick={openCreateEvent}>
              <Plus size={17} />
              Schedule event
            </PrimaryButton>
          }
        />

        <div className="venue-grid">
          {venues.map((venue) => {
            const venueEvents = events.filter(
              (event) =>
                event.venue === venue &&
                event.status !== "Cancelled",
            );

            return (
              <article className="venue-card" key={venue}>
                <div className="venue-top">
                  <span className="venue-icon">
                    <Building2 size={22} />
                  </span>

                  <span className="venue-pill">
                    {venueEvents.length} scheduled
                  </span>
                </div>

                <h3>{venue}</h3>

                <p>
                  Campus event location and resource scheduling.
                </p>

                <div className="venue-divider" />

                {venueEvents.length ? (
                  <div className="venue-event-list">
                    {venueEvents.map((event) => (
                      <div
                        className="venue-event"
                        key={event.id}
                      >
                        <div>
                          <strong>{event.title}</strong>

                          <span>
                            {formatDate(event.startAt)}
                          </span>
                        </div>

                        <span className="venue-time">
                          {formatTime(event.startAt)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="muted-text">
                    No scheduled events.
                  </p>
                )}

                <button
                  className="button button-secondary venue-action"
                  onClick={() => {
                    setEventForm({
                      ...emptyEventForm,
                      venue,
                    });

                    setEditingEvent(null);
                    setEventError("");
                    setEventModalOpen(true);
                  }}
                >
                  Schedule in this venue
                </button>
              </article>
            );
          })}
        </div>

        <div className="info-banner">
          <ShieldCheck size={21} />

          <div>
            <strong>Venue conflict protection</strong>

            <p>
              VerteX checks the venue and time interval
              before saving an event. Cancelled events do
              not block a new booking.
            </p>
          </div>
        </div>
      </>
    );
  }

  function renderChangeCentre() {
    return (
      <>
        <SectionHeading
          eyebrow="CHANGE ONCE · SYNC EVERYWHERE"
          title="Live Change Centre"
          description="Review events, update schedules, and coordinate operational changes."
          action={
            <PrimaryButton onClick={openCreateEvent}>
              <Plus size={17} />
              Create event
            </PrimaryButton>
          }
        />

        <div className="change-banner">
          <div className="change-banner-icon">
            <Radio size={25} />
          </div>

          <div>
            <div className="eyebrow">
              EVENT CHANGE WORKSPACE
            </div>

            <h2>Keep the whole campus aligned.</h2>

            <p>
              Manage event updates and inspect current
              records from one workspace.
            </p>
          </div>

          <div className="change-health">
            <span className="live-indicator">
              <span />
              LOCAL DEMO
            </span>

            <strong>{events.length}</strong>

            <small>Event records</small>
          </div>
        </div>

        <section className="stats-grid">
          <StatCard
            label="Event records"
            value={events.length}
            note="Current browser workspace"
            icon={CalendarDays}
          />

          <StatCard
            label="Published / live"
            value={publishedEvents.length}
            note="Published event records"
            icon={Radio}
            tone="green"
          />

          <StatCard
            label="Cancelled"
            value={
              events.filter(
                (event) => event.status === "Cancelled",
              ).length
            }
            note="Cancelled event records"
            icon={CircleAlert}
            tone="orange"
          />

          <StatCard
            label="Open issues"
            value={openIssues.length}
            note="Outstanding operations items"
            icon={Activity}
            tone="red"
          />
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <h3>Event change register</h3>
              <p>
                Edit event details or update event status.
              </p>
            </div>
          </div>

          <EventTable items={filteredEvents} />
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <h3>Recent announcements</h3>
              <p>
                Announcements saved in the local workspace.
              </p>
            </div>

            <button
              className="text-button"
              onClick={() =>
                setActivePage("Communications")
              }
            >
              Open communications
            </button>
          </div>

          {announcements.length ? (
            <div className="upcoming-list">
              {announcements.slice(0, 4).map((item) => (
                <div
                  className="upcoming-item"
                  key={item.id}
                >
                  <div className="operation-icon purple">
                    <MessageSquareText size={18} />
                  </div>

                  <div className="upcoming-info">
                    <strong>{item.title}</strong>

                    <span>{item.message}</span>
                  </div>

                  <span className="table-subtitle">
                    {formatDate(item.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state compact-empty">
              <MessageSquareText size={28} />

              <h3>No announcements</h3>

              <p>
                Create an announcement to add it to this register.
              </p>

              <button
                className="button button-secondary"
                onClick={() =>
                  setActivePage("Communications")
                }
              >
                Create announcement
              </button>
            </div>
          )}
        </section>
      </>
    );
  }

  function renderVolunteers() {
    const completedTasks = tasks.filter(
      (task) => task.status === "Completed",
    ).length;

    return (
      <>
        <SectionHeading
          eyebrow="TEAM OPERATIONS"
          title="Volunteer management"
          description="Track responsibilities, coordinate assignments, and monitor task completion."
        />

        <section className="stats-grid">
          <StatCard
            label="Total tasks"
            value={tasks.length}
            note="Across the operations team"
            icon={ClipboardList}
          />

          <StatCard
            label="Completed"
            value={completedTasks}
            note="Marked as complete"
            icon={CheckCircle2}
            tone="green"
          />

          <StatCard
            label="In progress"
            value={
              tasks.filter(
                (task) => task.status === "In progress",
              ).length
            }
            note="Currently being handled"
            icon={Activity}
            tone="orange"
          />

          <StatCard
            label="To do"
            value={
              tasks.filter(
                (task) => task.status === "To do",
              ).length
            }
            note="Awaiting action"
            icon={Clock3}
            tone="blue"
          />
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <h3>Volunteer task board</h3>
              <p>
                Click a task action to cycle through its workflow.
              </p>
            </div>
          </div>

          <div className="task-list">
            {tasks.map((task) => (
              <article className="task-row" key={task.id}>
                <div className="task-check">
                  {task.status === "Completed" ? (
                    <CheckCircle2 size={21} />
                  ) : (
                    <Clock3 size={21} />
                  )}
                </div>

                <div className="task-main">
                  <strong>{task.title}</strong>

                  <span>
                    {task.owner} · {task.category}
                  </span>
                </div>

                <span
                  className={`status-badge status-${getStatusClass(task.status)}`}
                >
                  {task.status}
                </span>

                <button
                  className="button button-secondary button-small"
                  onClick={() => advanceTask(task)}
                >
                  Update status
                </button>
              </article>
            ))}
          </div>
        </section>

        <div className="info-banner">
          <Users size={22} />

          <div>
            <strong>Team coordination</strong>

            <p>
              This local prototype tracks demonstration
              tasks. Real volunteer accounts and shared
              assignments require a backend and authentication.
            </p>
          </div>
        </div>
      </>
    );
  }

  function renderIssueCenter() {
    return (
      <>
        <SectionHeading
          eyebrow="OPERATIONS · INCIDENT RESPONSE"
          title="Issue Center"
          description="Report operational issues and track resolution across campus events."
          action={
            <PrimaryButton
              onClick={() => setIssueModalOpen(true)}
            >
              <Plus size={17} />
              Report issue
            </PrimaryButton>
          }
        />

        <section className="stats-grid stats-grid-three">
          <StatCard
            label="Total issues"
            value={issues.length}
            note="All issue records"
            icon={ClipboardList}
          />

          <StatCard
            label="Unresolved"
            value={openIssues.length}
            note="Open and in-progress"
            icon={CircleAlert}
            tone="orange"
          />

          <StatCard
            label="Resolved"
            value={
              issues.filter(
                (issue) => issue.status === "Resolved",
              ).length
            }
            note="Marked as resolved"
            icon={CheckCircle2}
            tone="green"
          />
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <h3>Issue register</h3>
              <p>
                Use the action button to progress an issue.
              </p>
            </div>
          </div>

          {issues.length ? (
            <div className="issue-list">
              {issues.map((issue) => (
                <article
                  className="issue-row"
                  key={issue.id}
                >
                  <div
                    className={`issue-priority issue-${getStatusClass(issue.priority)}`}
                  >
                    <CircleAlert size={19} />
                  </div>

                  <div className="issue-main">
                    <strong>{issue.title}</strong>

                    <span>
                      <MapPin size={13} />
                      {issue.location}
                    </span>

                    <small>
                      Reported {formatDateTime(issue.createdAt)}
                    </small>
                  </div>

                  <span
                    className={`status-badge status-${getStatusClass(issue.priority)}`}
                  >
                    {issue.priority}
                  </span>

                  <span
                    className={`status-badge status-${getStatusClass(issue.status)}`}
                  >
                    {issue.status}
                  </span>

                  <button
                    className="button button-secondary button-small"
                    onClick={() => advanceIssue(issue)}
                  >
                    {issue.status === "Open"
                      ? "Start work"
                      : issue.status === "In progress"
                        ? "Resolve"
                        : "Reopen"}
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <CheckCircle2 size={34} />

              <h3>All clear</h3>

              <p>
                No operational issues have been reported.
              </p>
            </div>
          )}
        </section>
      </>
    );
  }

  function renderCalendar() {
    return (
      <>
        <SectionHeading
          eyebrow="CAMPUS SCHEDULE"
          title="Event calendar"
          description="View scheduled events in chronological order."
          action={
            <PrimaryButton onClick={openCreateEvent}>
              <Plus size={17} />
              Add event
            </PrimaryButton>
          }
        />

        <section className="panel calendar-panel">
          <div className="panel-heading">
            <div>
              <h3>Upcoming schedule</h3>
              <p>
                Events are ordered by their start time.
              </p>
            </div>

            <span className="record-count">
              {upcomingEvents.length} upcoming
            </span>
          </div>

          {upcomingEvents.length ? (
            <div className="calendar-list">
              {upcomingEvents.map((event) => (
                <article
                  className="calendar-item"
                  key={event.id}
                >
                  <div className="date-tile date-tile-large">
                    <strong>
                      {new Date(
                        event.startAt,
                      ).toLocaleDateString("en-IN", {
                        day: "2-digit",
                      })}
                    </strong>

                    <span>
                      {new Date(
                        event.startAt,
                      ).toLocaleDateString("en-IN", {
                        month: "short",
                      })}
                    </span>
                  </div>

                  <div className="calendar-timeline">
                    <span />
                  </div>

                  <div className="calendar-info">
                    <span className="eyebrow">
                      {event.category}
                    </span>

                    <h3>{event.title}</h3>

                    <p>{event.description}</p>

                    <div className="event-meta">
                      <span>
                        <Clock3 size={15} />
                        {formatTime(event.startAt)} –{" "}
                        {formatTime(event.endAt)}
                      </span>

                      <span>
                        <MapPin size={15} />
                        {event.venue}
                      </span>
                    </div>
                  </div>

                  <button
                    className="button button-secondary button-small"
                    onClick={() => openEditEvent(event)}
                  >
                    Manage
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <CalendarDays size={32} />

              <h3>No upcoming events</h3>

              <p>
                Create an event to populate your schedule.
              </p>
            </div>
          )}
        </section>
      </>
    );
  }

  function renderAnalytics() {
    const chartEvents = [...events]
      .sort(
        (a, b) => b.registered - a.registered,
      )
      .slice(0, 6);

    const maxRegistrations = Math.max(
      1,
      ...chartEvents.map((event) => event.registered),
    );

    return (
      <>
        <SectionHeading
          eyebrow="EVENT INTELLIGENCE"
          title="Analytics"
          description="Understand registration activity, capacity, and event performance."
        />

        <section className="stats-grid">
          <StatCard
            label="Total registrations"
            value={totalRegistrations.toLocaleString("en-IN")}
            note="Combined event registrations"
            icon={Users}
          />

          <StatCard
            label="Events tracked"
            value={events.length}
            note="Current event records"
            icon={CalendarDays}
            tone="green"
          />

          <StatCard
            label="Average occupancy"
            value={`${registrationRate}%`}
            note="Average across events"
            icon={TrendingUp}
            tone="orange"
          />

          <StatCard
            label="Unresolved issues"
            value={openIssues.length}
            note="Operations follow-up"
            icon={CircleAlert}
            tone="red"
          />
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <h3>Top events by registrations</h3>
              <p>
                Ranked using the current event records.
              </p>
            </div>

            <span className="record-count">
              Live calculation
            </span>
          </div>

          <div className="ranking-list">
            {chartEvents.map((event, index) => {
              const percentage =
                (event.registered / maxRegistrations) * 100;

              return (
                <div
                  className="ranking-row"
                  key={event.id}
                >
                  <span className="ranking-number">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <div className="ranking-main">
                    <div className="ranking-header">
                      <strong>{event.title}</strong>

                      <span>
                        {event.registered} registrations
                      </span>
                    </div>

                    <div className="progress-track">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${percentage}%`,
                        }}
                      />
                    </div>

                    <div className="ranking-footer">
                      <span>
                        {getEventOccupancy(event)}% capacity
                      </span>

                      <span>{event.venue}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <h3>Event capacity overview</h3>
              <p>
                Compare each event's registrations with available seats.
              </p>
            </div>
          </div>

          <EventTable items={filteredEvents} />
        </section>
      </>
    );
  }

  function renderCommunications() {
    return (
      <>
        <SectionHeading
          eyebrow="CAMPUS COMMUNICATIONS"
          title="Announcements"
          description="Create and review event announcements in your local workspace."
        />

        <div className="content-grid communications-grid">
          <section className="panel">
            <div className="panel-heading">
              <div>
                <h3>Compose announcement</h3>
                <p>
                  Draft a message for your event audience.
                </p>
              </div>
            </div>

            <form
              className="event-form"
              onSubmit={createAnnouncement}
            >
              <label className="form-field">
                <span>Announcement title</span>

                <input
                  required
                  maxLength={100}
                  value={announcementTitle}
                  onChange={(event) =>
                    setAnnouncementTitle(event.target.value)
                  }
                  placeholder="e.g. Venue update"
                />
              </label>

              <label className="form-field">
                <span>Message</span>

                <textarea
                  required
                  rows={5}
                  maxLength={1000}
                  value={announcementMessage}
                  onChange={(event) =>
                    setAnnouncementMessage(event.target.value)
                  }
                  placeholder="Write your announcement..."
                />
              </label>

              <div className="info-banner">
                <MessageSquareText size={20} />

                <div>
                  <strong>Local announcement</strong>

                  <p>
                    Your announcement will be saved in
                    this browser. External email and
                    messaging delivery are not connected.
                  </p>
                </div>
              </div>

              <PrimaryButton type="submit">
                <Plus size={17} />
                Save announcement
              </PrimaryButton>
            </form>
          </section>

          <section className="panel">
            <div className="panel-heading">
              <div>
                <h3>Announcement history</h3>
                <p>
                  Recently saved messages.
                </p>
              </div>

              <span className="record-count">
                {announcements.length} total
              </span>
            </div>

            {announcements.length ? (
              <div className="announcement-list">
                {announcements.map((announcement) => (
                  <article
                    className="announcement-card"
                    key={announcement.id}
                  >
                    <div className="announcement-icon">
                      <Bell size={18} />
                    </div>

                    <div>
                      <h4>{announcement.title}</h4>

                      <p>{announcement.message}</p>

                      <small>
                        {formatDateTime(announcement.createdAt)}
                      </small>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty-state compact-empty">
                <MessageSquareText size={30} />

                <h3>No announcements yet</h3>

                <p>
                  Saved messages will appear here.
                </p>
              </div>
            )}
          </section>
        </div>
      </>
    );
  }

  function renderReports() {
    return (
      <>
        <SectionHeading
          eyebrow="REPORTING WORKSPACE"
          title="Reports"
          description="Review a summary of your current demonstration data."
        />

        <section className="stats-grid">
          <StatCard
            label="Events"
            value={events.length}
            note="All event records"
            icon={CalendarDays}
          />

          <StatCard
            label="Registrations"
            value={totalRegistrations}
            note="Combined registrations"
            icon={Users}
            tone="green"
          />

          <StatCard
            label="Issues"
            value={issues.length}
            note="All issue records"
            icon={CircleAlert}
            tone="orange"
          />

          <StatCard
            label="Completed tasks"
            value={tasks.filter(
              (task) => task.status === "Completed",
            ).length}
            note="Volunteer task records"
            icon={CheckCircle2}
            tone="blue"
          />
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <h3>Event performance report</h3>
              <p>
                A summary of attendance demand and event status.
              </p>
            </div>

            <button
              className="button button-secondary button-small"
              onClick={() => window.print()}
            >
              Print report
            </button>
          </div>

          <EventTable items={filteredEvents} />

          <div className="report-footnote">
            <ShieldCheck size={17} />

            <span>
              This report is based on local demonstration
              data. It is not a verified institutional report.
            </span>
          </div>
        </section>
      </>
    );
  }

  function renderSettings() {
    return (
      <>
        <SectionHeading
          eyebrow="WORKSPACE CONFIGURATION"
          title="Settings"
          description="Inspect the local prototype configuration and reset demonstration data."
        />

        <section className="panel settings-panel">
          <div className="settings-row">
            <div className="settings-icon">
              <Building2 size={20} />
            </div>

            <div>
              <strong>Workspace name</strong>

              <p>
                VerteX · Campus Event Intelligence
              </p>
            </div>

            <span className="status-badge status-published">
              Active
            </span>
          </div>

          <div className="settings-row">
            <div className="settings-icon">
              <ShieldCheck size={20} />
            </div>

            <div>
              <strong>Data storage</strong>

              <p>
                Browser localStorage
              </p>

              <small>
                Changes are stored in this browser only.
              </small>
            </div>

            <span className="status-badge status-draft">
              Local
            </span>
          </div>

          <div className="settings-row">
            <div className="settings-icon">
              <RefreshCw size={20} />
            </div>

            <div>
              <strong>Reset demonstration data</strong>

              <p>
                Remove saved changes and return to the
                original sample events, tasks, and issues.
              </p>
            </div>

            <button
              className="button button-danger button-small"
              onClick={() => {
                const confirmed = window.confirm(
                  "Reset all VerteX demonstration data in this browser? This action cannot be undone.",
                );

                if (!confirmed) return;

                Object.values(STORAGE_KEYS).forEach(
                  (key) => localStorage.removeItem(key),
                );

                window.location.reload();
              }}
            >
              Reset data
            </button>
          </div>
        </section>
      </>
    );
  }

  /* =======================================================
     PAGE CONTENT ROUTER
  ======================================================= */

  function renderActivePage() {
    const managerOnlyPages: PageName[] = [
    "Event Management",
    "Venue & Rooms",
    "Live Change Centre",
    "Communications",
    "Reports",
  ];

  if (
    !canManageEvents &&
    managerOnlyPages.includes(activePage)
  ) {
    return renderOverview();
  }

  if (
    activePage === "Volunteers" &&
    !canManageEvents &&
    userRole !== "volunteer"
  ) {
    return renderOverview();
  }

    switch (activePage) {
      case "Overview":
        return renderOverview();

      case "Event Management":
        return renderEventManagement();

      case "Registrations":
        return renderRegistrations();

      case "Venue & Rooms":
        return renderVenues();

      case "Live Change Centre":
        return renderChangeCentre();

      case "Volunteers":
        return renderVolunteers();

      case "Issue Center":
        return renderIssueCenter();

      case "Calendar":
        return renderCalendar();

      case "Analytics":
        return renderAnalytics();

      case "Communications":
        return renderCommunications();

      case "Reports":
        return renderReports();

      case "Settings":
        return renderSettings();

      default:
        return renderOverview();
    }
  }

  /* =======================================================
     MAIN RENDER
  ======================================================= */

  return (
    <div className="app-shell">
      {/* SIDEBAR */}

      <aside
        className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}
      >
        <div className="brand">
          <div className="brand-mark">
            V<span>.</span>
          </div>

          <div className="brand-copy">
            <strong>VerteX</strong>

            <span>CAMPUS INTELLIGENCE</span>
          </div>

          <button
            className="icon-button mobile-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        <div className="workspace-switcher">
          <div className="workspace-avatar">N</div>

          <div>
            <strong>Northstar University</strong>

            <span>Organizer workspace</span>
          </div>

          <ChevronDown size={15} />
        </div>

        <div className="sidebar-label">
          MAIN MENU
        </div>

        <nav className="sidebar-navigation">
          {roleNavigation.map((group) => (
            <div className="nav-group" key={group.title}>
              <div className="nav-group-label">
                {group.title}
              </div>

              {group.items.map((item) => {
                const Icon = item.icon;

                const active =
                  activePage === item.name;

                return (
                  <button
                    className={`nav-item ${active ? "active" : ""}`}
                    key={item.name}
                    onClick={() => {
                      setActivePage(item.name);
                      setSidebarOpen(false);
                    }}
                  >
                    <Icon size={18} />

                    <span>{item.name}</span>

                    {item.name === "Issue Center" &&
                      openIssues.length > 0 && (
                        <span className="nav-count">
                          {openIssues.length}
                        </span>
                      )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-help">
            <div className="help-symbol">
              <Sparkles size={18} />
            </div>

            <strong>Built for better events.</strong>

            <p>
              One workspace.
              <br />
              Connected campus.
            </p>
          </div>

          <div className="sidebar-profile">
            <div className="profile-avatar">PA</div>

            <div>
              <strong>
                {profileLoading ? "Loading profile..." : profileName}
              </strong>

              <span>
                {userRole.charAt(0).toUpperCase() + userRole.slice(1)} account
              </span>
            </div>

            <button
              className="icon-button"
              aria-label="Open settings"
              onClick={() => setActivePage("Settings")}
            >
              <Settings size={17} />
            </button>
          </div>
                    <button
            type="button"
            className="sidebar-logout-button"
            onClick={() => void handleLogout()}
          >
            <LogOut size={17} />

            <span>Log out</span>
          </button>
        </div>
      </aside>

      {/* MAIN APPLICATION */}

      <main className="app-main">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="icon-button mobile-menu"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
            >
              <Menu size={20} />
            </button>

            <div className="breadcrumb">
              <span>Workspace</span>

              <span className="breadcrumb-divider">
                /
              </span>

              <strong>{activePage}</strong>
            </div>
          </div>

          <div className="topbar-actions">
            <label className="global-search">
              <Search size={17} />

              <input
                type="search"
                placeholder="Search events, venues..."
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(event.target.value)
                }
                aria-label="Search events"
              />

              <span className="search-shortcut">
                <Command size={11} /> K
              </span>
            </label>

            <button
              className="button button-primary topbar-create"
              onClick={openCreateEvent}
            >
              <Plus size={16} />
              <span>Create event</span>
            </button>

            <button
              className="icon-button notification-button"
              onClick={() =>
                setActivePage("Issue Center")
              }
              aria-label="Review notifications and issues"
            >
              <Bell size={19} />

              {openIssues.length > 0 && (
                <span className="notification-dot" />
              )}
            </button>

            <button
              className="topbar-avatar"
              onClick={() => setActivePage("Settings")}
              aria-label="Open profile settings"
            >
              PA
            </button>
          </div>
        </header>

        <div className="page-content">

  {eventsLoading && events.length === 0 && (
    <div className="info-banner">
      <RefreshCw size={20} />

      <div>
        <strong>Loading live events</strong>

        <p>
          Connecting to the VerteX event database.
        </p>
      </div>
    </div>
  )}

  {eventsError && (
    <div className="form-error" role="alert">
      <CircleAlert size={18} />

      <span>
        Could not load events: {eventsError}
      </span>

      <button
        type="button"
        className="button button-secondary button-small"
        onClick={() => window.location.reload()}
      >
        Retry
      </button>
    </div>
  )}

  {renderActivePage()}

          <footer className="app-footer">
            <span>
              <span className="footer-dot" />
              VerteX Campus Intelligence
            </span>

            <span>
              Competition prototype · Local demo
            </span>
          </footer>
        </div>
      </main>

      {/* EVENT CREATE / EDIT MODAL */}

      {eventModalOpen && (
        <div
          className="modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setEventModalOpen(false);
            }
          }}
        >
          <section
            className="modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="event-modal-title"
          >
            <div className="modal-header">
              <div>
                <div className="eyebrow">
                  EVENT WORKSPACE
                </div>

                <h2 id="event-modal-title">
                  {editingEvent
                    ? "Manage event"
                    : "Create a new event"}
                </h2>

                <p>
                  Configure the event details and
                  validate the venue schedule.
                </p>
              </div>

              <button
                className="icon-button"
                onClick={() => setEventModalOpen(false)}
                aria-label="Close event form"
              >
                <X size={19} />
              </button>
            </div>

            <form
              className="event-form"
              onSubmit={saveEvent}
            >
              <label className="form-field">
                <span>Event title *</span>

                <input
                  required
                  maxLength={120}
                  value={eventForm.title}
                  onChange={(event) =>
                    setEventForm((previous) => ({
                      ...previous,
                      title: event.target.value,
                    }))
                  }
                  placeholder="e.g. Campus Innovation Summit"
                />
              </label>

              <div className="form-grid-two">
                <label className="form-field">
                  <span>Category</span>

                  <select
                    value={eventForm.category}
                    onChange={(event) =>
                      setEventForm((previous) => ({
                        ...previous,
                        category: event.target.value,
                      }))
                    }
                  >
                    <option>Technology</option>
                    <option>Competition</option>
                    <option>Workshop</option>
                    <option>Business</option>
                    <option>Cultural</option>
                    <option>Sports</option>
                    <option>Seminar</option>
                  </select>
                </label>

                <label className="form-field">
                  <span>Venue *</span>

                  <select
                    required
                    value={eventForm.venue}
                    onChange={(event) =>
                      setEventForm((previous) => ({
                        ...previous,
                        venue: event.target.value,
                      }))
                    }
                  >
                    <option>Main Auditorium</option>
                    <option>Engineering Lab 02</option>
                    <option>Innovation Studio</option>
                    <option>Seminar Hall B</option>
                    <option>Central Lawn</option>
                  </select>
                </label>
              </div>

              <div className="form-grid-two">
                <label className="form-field">
                  <span>Start date and time *</span>

                  <input
                    type="datetime-local"
                    required
                    value={eventForm.startAt}
                    onChange={(event) =>
                      setEventForm((previous) => ({
                        ...previous,
                        startAt: event.target.value,
                      }))
                    }
                  />
                </label>

                <label className="form-field">
                  <span>End date and time *</span>

                  <input
                    type="datetime-local"
                    required
                    value={eventForm.endAt}
                    onChange={(event) =>
                      setEventForm((previous) => ({
                        ...previous,
                        endAt: event.target.value,
                      }))
                    }
                  />
                </label>
              </div>

              <label className="form-field">
                <span>Event capacity *</span>

                <input
                  type="number"
                  min="1"
                  max="100000"
                  required
                  value={eventForm.capacity}
                  onChange={(event) =>
                    setEventForm((previous) => ({
                      ...previous,
                      capacity: event.target.value,
                    }))
                  }
                />
              </label>

              <label className="form-field">
                <span>Description</span>

                <textarea
                  rows={3}
                  maxLength={1500}
                  value={eventForm.description}
                  onChange={(event) =>
                    setEventForm((previous) => ({
                      ...previous,
                      description: event.target.value,
                    }))
                  }
                  placeholder="Describe the event..."
                />
              </label>

              {eventError && (
                <div
                  className="form-error"
                  role="alert"
                >
                  <CircleAlert size={18} />

                  <span>{eventError}</span>
                </div>
              )}

              <div className="modal-note">
                <ShieldCheck size={18} />

                <span>
                  Venue and time conflicts are checked
                  before the event is saved.
                </span>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => setEventModalOpen(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="button button-primary"
                >
                  <Check size={17} />

                  {editingEvent
                    ? "Save changes"
                    : "Create event"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* REPORT ISSUE MODAL */}

      {issueModalOpen && (
        <div
          className="modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIssueModalOpen(false);
            }
          }}
        >
          <section
            className="modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="issue-modal-title"
          >
            <div className="modal-header">
              <div>
                <div className="eyebrow">
                  OPERATIONS · INCIDENT RESPONSE
                </div>

                <h2 id="issue-modal-title">
                  Report an issue
                </h2>

                <p>
                  Capture an operational problem so your
                  team can track its resolution.
                </p>
              </div>

              <button
                className="icon-button"
                onClick={() => setIssueModalOpen(false)}
                aria-label="Close issue form"
              >
                <X size={19} />
              </button>
            </div>

            <form
              className="event-form"
              onSubmit={createIssue}
            >
              <label className="form-field">
                <span>Issue title *</span>

                <input
                  required
                  maxLength={120}
                  value={issueTitle}
                  onChange={(event) =>
                    setIssueTitle(event.target.value)
                  }
                  placeholder="e.g. Microphone not working"
                />
              </label>

              <label className="form-field">
                <span>Location *</span>

                <select
                  value={issueLocation}
                  onChange={(event) =>
                    setIssueLocation(event.target.value)
                  }
                >
                  <option>Main Auditorium</option>
                  <option>Engineering Lab 02</option>
                  <option>Innovation Studio</option>
                  <option>Seminar Hall B</option>
                  <option>Central Lawn</option>
                  <option>Other location</option>
                </select>
              </label>

              <label className="form-field">
                <span>Priority</span>

                <select
                  value={issuePriority}
                  onChange={(event) =>
                    setIssuePriority(
                      event.target.value as IssueRecord["priority"],
                    )
                  }
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </label>

              <div className="modal-note">
                <CircleAlert size={18} />

                <span>
                  New issues are created with Open status
                  and stored in the current browser.
                </span>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => setIssueModalOpen(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="button button-primary"
                >
                  <Plus size={17} />
                  Create issue
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* TOAST MESSAGE */}

      {toast && (
        <div
          className="toast-message"
          role="status"
          aria-live="polite"
        >
          <span className="toast-icon">
            <Check size={17} />
          </span>

          <span>{toast}</span>

          <button
            onClick={() => setToast("")}
            aria-label="Dismiss message"
          >
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
