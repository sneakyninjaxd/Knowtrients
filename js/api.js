/* ============================================================
   KNOWTRIENTS — API client for the admin website

   Replaces the mock arrays that js/data.js used to provide.
   Every call goes to the FastAPI backend; nothing is hardcoded.

   Load this BEFORE app.js and before any page script:
     <script src="../js/api.js"></script>
   ============================================================ */

/* ---- Configuration -------------------------------------- */

const API_BASE_URL = (() => {
  // Running the site from a local file or dev server points at a local
  // backend; anything else uses the deployed service. This avoids having to
  // edit a constant every time you switch between the two.
  const host = window.location.hostname;
  const isLocal = host === "localhost" || host === "127.0.0.1" || host === "";
  return isLocal
    ? "http://127.0.0.1:8000"
    : "https://knowtrients-backend-database.onrender.com";
})();

const TOKEN_KEY = "knowtrients_admin_token";
const USER_KEY = "knowtrients_admin_user";

/* ---- Session -------------------------------------------- */

/**
 * The roles were renamed: user_admin -> account_manager and
 * platform_manager -> IT_manager. Anyone already signed in has the old name
 * saved in their browser, and the real API may still send it, so translate
 * it rather than treating the account as unknown (which looked like the
 * login page flickering).
 */
const LEGACY_ROLES = {
  user_admin: "account_manager",
  platform_manager: "IT_manager",
};

function normalizeRole(role) {
  return LEGACY_ROLES[role] || role;
}

const Session = {
  get token() {
    return localStorage.getItem(TOKEN_KEY);
  },
  get user() {
    const raw = localStorage.getItem(USER_KEY);
    try {
      const user = raw ? JSON.parse(raw) : null;
      if (user && user.role) user.role = normalizeRole(user.role);
      return user;
    } catch {
      return null;
    }
  },
  save(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
  get isLoggedIn() {
    return Boolean(this.token);
  },
};

/**
 * Redirects to the login page unless a session exists.
 * Call at the top of every admin page.
 */
function requireAuth(loginPath = "../login.html") {
  if (!Session.isLoggedIn) {
    window.location.href = loginPath;
    return false;
  }
  return true;
}

/**
 * Role slugs and what people call them. The slugs below ("account_manager",
 * "IT_manager") are what the database and the API use, so they stay as
 * they are; only the labels changed when the roles were renamed. Change a
 * label here and it changes everywhere on the site.
 *
 *   account_manager       -> Account Manager  (accounts, support requests)
 *   IT_manager -> IT Manager       (app performance, AI, feedback)
 */
const ROLE_LABELS = {
  user: "User",
  account_manager: "Account Manager",
  IT_manager: "IT Manager",
};

/** "account_manager" -> "Account Manager" */
function roleLabel(role) {
  return ROLE_LABELS[role] || "User";
}

/** "Account Manager" -> "account_manager" (for filters sent to the API) */
function roleFromLabel(label) {
  return Object.keys(ROLE_LABELS).find((slug) => ROLE_LABELS[slug] === label) || null;
}

/**
 * Each role has its own area of the site:
 *   App users        -> user/ (download the app)
 *   Account Managers -> AM/   (accounts, support requests)
 *   IT Managers      -> IM/   (app performance, AI, feedback)
 * Paths are relative to the site root. Every area is one folder deep, which
 * is what lets requireRole() below use "../" to get back to the root.
 */
const ROLE_HOME = {
  user: "user/download.html",
  account_manager: "AM/dashboard.html",
  IT_manager: "IM/dashboard.html",
};

function homeFor(role) {
  return ROLE_HOME[role] || null;
}

/**
 * Like requireAuth, but also sends staff who don't belong on this page to
 * their own dashboard. Call at the top of every admin page, e.g.
 *   requireRole("account_manager");
 *   requireRole("account_manager", "IT_manager");   // shared pages
 *
 * This only controls navigation. The backend must refuse the data too.
 */
function requireRole(...allowedRoles) {
  const root = "../";
  const user = Session.user;

  // Sending the browser to the page it is already on would reload forever,
  // which looks like the page flickering. That only happens when a page's
  // requireRole() list doesn't match the folder it lives in, so say so
  // instead of looping.
  function goTo(target) {
    const here = window.location.pathname;
    const dest = new URL(root + target, window.location.href).pathname;
    if (dest === here) {
      document.documentElement.style.visibility = "";
      document.body.innerHTML =
        '<div class="form-error" style="margin:40px auto;max-width:620px;">' +
        "This page redirects to itself. Check that its requireRole() line " +
        "matches the folder it is in (AM/ pages need \"account_manager\", " +
        'IM/ pages need "IT_manager").</div>';
      return false;
    }
    document.documentElement.style.visibility = "hidden";
    window.location.replace(root + target);
    return false;
  }

  if (!Session.isLoggedIn || !user || !homeFor(user.role)) {
    Session.clear();
    return goTo("login.html");
  }

  if (!allowedRoles.includes(user.role)) {
    return goTo(homeFor(user.role));
  }
  return true;
}

/* ---- Request helper ------------------------------------- */

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function apiFetch(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (Session.token) headers.Authorization = `Bearer ${Session.token}`;

  let response;
  try {
    response = await fetch(API_BASE_URL + path, { ...options, headers });
  } catch {
    // A failed fetch means the server was unreachable, not that it returned
    // an error — worth distinguishing, because on the free hosting tier this
    // is usually a cold start rather than a fault.
    throw new ApiError(
      "Could not reach the server. It may be waking up — wait a moment and try again.",
      0
    );
  }

  if (response.status === 401) {
    Session.clear();
    throw new ApiError("Your session has expired. Please log in again.", 401);
  }

  if (response.status === 204) return null;

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    /* empty or non-JSON body */
  }

  if (!response.ok) {
    throw new ApiError(extractErrorMessage(payload, response.status), response.status);
  }

  return payload;
}

/** FastAPI returns `detail` as either a string or a list of validation objects. */
function extractErrorMessage(payload, status) {
  if (!payload) return `Request failed (${status}).`;
  const detail = payload.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail) && detail.length) {
    return detail[0].msg || `Request failed (${status}).`;
  }
  return `Request failed (${status}).`;
}

/* ---- Auth ----------------------------------------------- */

const Auth = {
  /**
   * Logs anyone in: app users, Account Managers and IT Managers. The caller
   * sends them to homeFor(role), and each page guards itself with
   * requireRole(), so one login page serves all three.
   */
  async login(email, password) {
    const data = await apiFetch("/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    data.user.role = normalizeRole(data.user.role);

    // An unknown role has nowhere to land, so refuse rather than leaving the
    // browser on a login page that looks like it did nothing.
    if (!homeFor(data.user.role)) {
      throw new ApiError("This account cannot sign in here.", 403);
    }

    Session.save(data.access_token, data.user);
    return data.user;
  },

  /**
   * Signs in on a page meant for particular roles. The site has two doors:
   * login.html for app users and UAlogin.html for staff. Anyone who uses the
   * wrong one — or picks the wrong admin type on the staff login — is signed
   * straight back out and told why.
   *
   *   await Auth.loginAs(["user"], email, password);
   *   await Auth.loginAs(["account_manager"], email, password);   // admin type picked
   */
  async loginAs(allowedRoles, email, password) {
    const user = await this.login(email, password);
    if (!allowedRoles.includes(user.role)) {
      this.logout();

      // Wrong door entirely, or the right door with the wrong admin type.
      let message;
      if (allowedRoles.includes("user")) {
        message = "Staff accounts sign in on the staff login page.";
      } else if (user.role === "user") {
        message = "This is the staff login. Use the main login page for your account.";
      } else {
        message = `This account is not ${
          allowedRoles.length === 1 ? "an " + roleLabel(allowedRoles[0]) : "a staff account"
        }. It is ${roleLabel(user.role)} — pick that admin type instead.`;
      }
      throw new ApiError(message, 403);
    }
    return user;
  },

  /**
   * Public sign-up for app users (register.html). The backend returns the
   * same shape as /login, so the new user is signed in straight away.
   */
  async register({ first_name, last_name, email, password }) {
    const data = await apiFetch("/register", {
      method: "POST",
      body: JSON.stringify({ first_name, last_name, email, password }),
    });

    Session.save(data.access_token, data.user);
    return data.user;
  },

  logout() {
    Session.clear();
  },

  async me() {
    return apiFetch("/me");
  },

  /** Updates the signed-in admin's own name and refreshes the stored session. */
  async updateMe({ first_name, last_name }) {
    const updated = await apiFetch("/me", {
      method: "PATCH",
      body: JSON.stringify({ first_name, last_name }),
    });
    Session.save(Session.token, { ...Session.user, ...updated });
    return updated;
  },

  async changePassword(currentPassword, newPassword) {
    return apiFetch("/me/password", {
      method: "POST",
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
      }),
    });
  },
};

/* ---- Accounts ------------------------------------------- */

const Accounts = {
  /** @param {{userType?: string, q?: string, status?: string}} filters */
  async list(filters = {}) {
    const params = new URLSearchParams();
    if (filters.userType && filters.userType !== "All") {
      params.set("user_type", filters.userType);
    }
    if (filters.q) params.set("q", filters.q);
    if (filters.status && filters.status !== "All") params.set("status", filters.status);

    const query = params.toString();
    return apiFetch("/admin/accounts" + (query ? `?${query}` : ""));
  },

  async get(id) {
    return apiFetch(`/admin/accounts/${id}`);
  },

  async setStatus(id, isActive, reason) {
    return apiFetch(`/admin/accounts/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ is_active: isActive, reason: reason || null }),
    });
  },

  async setRole(id, role) {
    return apiFetch(`/admin/accounts/${id}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    });
  },

  async remove(id) {
    return apiFetch(`/admin/accounts/${id}`, { method: "DELETE" });
  },

  async create(data) {        /*create staff account*/
    return apiFetch("/admin/accounts", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};


/* ---- Support requests ----------------------------------- */

const Requests = {
  /** @param {{status?: string, q?: string}} filters */
  async list(filters = {}) {
    const params = new URLSearchParams();
    if (filters.status && filters.status !== "All") {
      params.set("status", filters.status.toLowerCase());
    }
    if (filters.q) params.set("q", filters.q);

    const query = params.toString();
    return apiFetch("/admin/requests" + (query ? `?${query}` : ""));
  },

  async get(id) {
    return apiFetch(`/admin/requests/${id}`);
  },

  async reply(id, body, resolve = true) {
    return apiFetch(`/admin/requests/${id}/reply`, {
      method: "POST",
      body: JSON.stringify({ body, resolve }),
    });
  },

  async setStatus(id, status) {
    return apiFetch(`/admin/requests/${id}/status?status=${status}`, {
      method: "PATCH",
    });
  },
};

/* ---- Dashboard ------------------------------------------ */

const Dashboard = {
  async summary() {
    return apiFetch("/admin/dashboard");
  },
};

/* ---- Formatting helpers --------------------------------- */

/** "9 September 2026, 07:44 PM" — matches the format the pages already use. */
function formatDateTime(iso) {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";

  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  const time = date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  if (isToday) return `Today ${time}`;
  if (isYesterday) return `Yesterday ${time}`;

  return `${date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })}, ${time}`;
}

function formatDate(iso) {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Request categories are stored as slugs; these are the display labels. */
const CATEGORY_LABELS = {
  password_change: "Password Change",
  subscription: "Subscription",
  account_recovery: "Account Recovery",
  bug_report: "Bug Report",
  other: "Other",
};

function categoryLabel(slug) {
  return CATEGORY_LABELS[slug] || "Other";
}

/** Capitalises a status slug for display: "unresolved" → "Unresolved". */
function statusLabel(status) {
  if (!status) return "";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

/** Escapes text before it goes into innerHTML. */
function escapeHtml(value) {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Renders a loading or error line into a container. */
function renderMessage(container, message, isError = false) {
  if (!container) return;
  container.innerHTML = `<div class="empty-hint"${
    isError ? ' style="color:var(--danger);"' : ""
  }>${escapeHtml(message)}</div>`;
}