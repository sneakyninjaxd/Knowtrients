/* ============================================================
   KNOWTRIENTS — mock API (development only)

   Stands in for the FastAPI backend when you can't reach it.
   It replaces apiFetch() from api.js, so every page, and the
   Accounts / Requests / Dashboard / Auth wrappers, run unchanged
   against the same URLs and response shapes the real API uses.

   ENABLE:  add this line directly AFTER api.js on a page
              <script src="../js/mock-api.js"></script>   (UA/ pages)
              <script src="js/mock-api.js"></script>      (login.html)
   DISABLE: delete that line. Nothing else needs to change.

   Changes (suspend, reply, resolve, delete) are saved in
   localStorage, so they survive refreshes and page changes.
   Click "reset" on the MOCK DATA badge to restore the seed data.

   Login: any email + any password signs you in as a User Admin
   (Micheal Afton). Seeded emails log in as that account instead, e.g.
     priyanair@gmail.com   -> Platform Manager (no account management)
     danieltan@gmail.com   -> ordinary app user (tests rejection)

   Permissions: accounts and support requests (everything under
   /admin) belong to User Admins. Platform Managers only reach /me
   (their own details); their own pages live in PM/.
   Once a password is set (Create Account or My Account), that
   account must log in with it.
   ============================================================ */

(function () {
  const STORE_KEY = "knowtrients_mock_db";
  const LATENCY_MS = 300; // lets you see loading states

  const ROLE_LABELS = {
    user: "User",
    user_admin: "User Admin",
    platform_manager: "Platform Manager",
  };
  const LABEL_TO_ROLE = Object.fromEntries(
    Object.entries(ROLE_LABELS).map(([slug, label]) => [label, slug])
  );

  /* ---- Seed data ---------------------------------------- */

  function at(daysAgo, hour = 10, minute = 0) {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    d.setHours(hour, minute, 0, 0);
    return d.toISOString();
  }

  function staff(id, displayId, first, last, email, role, isActive, joinedDaysAgo) {
    return {
      id, display_id: displayId, first_name: first, last_name: last, email,
      role, is_active: isActive, created_at: at(joinedDaysAgo),
      onboarding_complete: true,
    };
  }

  function appUser(id, displayId, first, last, email, isActive, joinedDaysAgo, profile) {
    return {
      id, display_id: displayId, first_name: first, last_name: last, email,
      role: "user", is_active: isActive, created_at: at(joinedDaysAgo),
      ...profile,
    };
  }

  function seed() {
    const accounts = [
      staff(1, "U001", "Micheal", "Afton", "michealA44@gmail.com", "user_admin", true, 140),
      staff(2, "U002", "Thomas", "Addison", "eddison67@gmail.com", "user_admin", false, 130),
      staff(3, "U003", "Samuel", "Liu", "samliu8890@gmail.com", "user_admin", true, 95),
      staff(4, "U004", "Lebaski", "Addams", "Addamsl1@gmail.com", "user_admin", true, 60),
      staff(5, "U010", "Priya", "Nair", "priyanair@gmail.com", "platform_manager", true, 180),
      staff(6, "U011", "Jonas", "Wren", "jonaswren@gmail.com", "platform_manager", true, 175),

      appUser(7, "U020", "Clare", "Koh", "koh234@gmail.com", false, 45, {
        onboarding_complete: true, age: 29, gender: "Female", height_cm: 162, weight_kg: 58,
        activity_level: "Moderately active", goals: ["Maintain weight", "Improve sleep"],
        dietary_preferences: ["Vegetarian"],
        food_log_count: 112, recommendation_count: 38, last_active: at(9, 21, 5),
      }),
      appUser(8, "U021", "Daniel", "Tan", "danieltan@gmail.com", true, 30, {
        onboarding_complete: true, age: 34, gender: "Male", height_cm: 175, weight_kg: 82,
        activity_level: "Lightly active", goals: ["Lose weight"],
        dietary_preferences: ["Low sugar", "Halal"],
        food_log_count: 64, recommendation_count: 21, last_active: at(0, 8, 12),
      }),
      appUser(9, "U022", "Farah", "Yusof", "farahyusof@gmail.com", true, 70, {
        onboarding_complete: true, age: 41, gender: "Female", height_cm: 158, weight_kg: 66,
        activity_level: "Sedentary", goals: ["Lower sodium", "Lose weight"],
        dietary_preferences: ["Halal"],
        food_log_count: 203, recommendation_count: 77, last_active: at(1, 19, 40),
      }),
      appUser(10, "U023", "Gopal", "Reddy", "gopalreddy@gmail.com", true, 20, {
        onboarding_complete: true, age: 23, gender: "Male", height_cm: 180, weight_kg: 70,
        activity_level: "Very active", goals: ["Build muscle"],
        dietary_preferences: [],
        food_log_count: 15, recommendation_count: 4, last_active: at(3, 12, 0),
      }),
      // Brand-new user who hasn't finished onboarding: every profile field is
      // empty, which is worth checking the pages render as "—".
      appUser(11, "U024", "Wei Ling", "Chen", "weiling.chen@gmail.com", true, 2, {
        onboarding_complete: false, age: null, gender: null, height_cm: null, weight_kg: null,
        activity_level: null, goals: [], dietary_preferences: [],
        food_log_count: 0, recommendation_count: 0, last_active: null,
      }),
    ];

    const requests = [
      { id: 101, display_id: "R101", user_id: 7, category: "password_change",
        subject: "Password Change Request",
        body: "I need help in changing my password. I tried the reset link on the app but it isn't sending me an email.",
        status: "unresolved", created_at: at(0, 19, 44) },
      { id: 102, display_id: "R102", user_id: 8, category: "subscription",
        subject: "Subscription Cancellation Issue",
        body: "My subscription has some issue please help! I was charged twice this month for the premium plan.",
        status: "unresolved", created_at: at(1, 8, 38) },
      { id: 103, display_id: "R103", user_id: 9, category: "bug_report",
        subject: "Incorrect sodium value",
        body: "The nutrient scan result looks incorrect for packaged food — the sodium value shown doesn't match the label on the box.",
        status: "unresolved", created_at: at(6, 14, 10) },
      { id: 104, display_id: "R104", user_id: 10, category: "account_recovery",
        subject: "Password Change",
        body: "Requesting help resetting my account password, I no longer have access to my old recovery email.",
        status: "resolved", created_at: at(10, 11, 2),
        reply: "We've verified your identity and sent a reset link to your new email address.",
        replied_at: at(9, 9, 30), handled_by_name: "Micheal Afton" },
      { id: 105, display_id: "R105", user_id: 7, category: "other",
        subject: "Inquiries on Premium Plan",
        body: "I would like to ask more about the benefits of the premium plan before I renew — does it include the new recipe planner?",
        status: "resolved", created_at: at(21, 19, 44),
        reply: "Yes, the recipe planner is included with Premium from next month.",
        replied_at: at(20, 10, 0), handled_by_name: "Samuel Liu" },
      { id: 106, display_id: "R106", user_id: 9, category: "subscription",
        subject: "Subscription Cancellation",
        body: "Please cancel my subscription renewal, I don't plan on continuing after this cycle ends.",
        status: "resolved", created_at: at(12, 9, 0),
        reply: "Auto-renewal has been turned off. You keep Premium until the cycle ends.",
        replied_at: at(12, 15, 20), handled_by_name: "Priya Nair" },
      { id: 107, display_id: "R107", user_id: 10, category: "account_recovery",
        subject: "Locked out of account",
        body: "Locked out of my account after too many attempts, please help reset it.",
        status: "resolved", created_at: at(18, 18, 15),
        reply: "Your account has been unlocked. Please try logging in again.",
        replied_at: at(18, 20, 0), handled_by_name: "Micheal Afton" },
      { id: 108, display_id: "R108", user_id: 8, category: "other",
        subject: "Exporting nutrient logs",
        body: "Is there a way to export my nutrient logs to a spreadsheet? I'd like to share them with my dietitian.",
        // Resolved without a reply, to check that state renders sensibly.
        status: "resolved", created_at: at(23, 16, 20) },
    ];

    return { accounts, requests, stats: { logs_today: 14, recommendations_today: 6 } };
  }

  /* ---- Storage ------------------------------------------ */

  function load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) return JSON.parse(raw);
    } catch { /* corrupted — fall through to reseed */ }
    const fresh = seed();
    save(fresh);
    return fresh;
  }

  function save(db) {
    localStorage.setItem(STORE_KEY, JSON.stringify(db));
  }

  /* ---- Response shapes (match what the pages read) ------ */

  const fullName = (a) => `${a.first_name} ${a.last_name}`;

  function accountSummary(a) {
    return {
      id: a.id,
      display_id: a.display_id,
      first_name: a.first_name,
      last_name: a.last_name,
      email: a.email,
      role: a.role,
      user_type: ROLE_LABELS[a.role],
      status: a.is_active ? "Active" : "Suspended",
      created_at: a.created_at,
    };
  }

  function accountDetail(a, db) {
    const bmi = a.height_cm && a.weight_kg
      ? Math.round((a.weight_kg / (a.height_cm / 100) ** 2) * 10) / 10
      : null;
    return {
      ...accountSummary(a),
      onboarding_complete: Boolean(a.onboarding_complete),
      age: a.age ?? null,
      gender: a.gender ?? null,
      height_cm: a.height_cm ?? null,
      weight_kg: a.weight_kg ?? null,
      bmi,
      activity_level: a.activity_level ?? null,
      goals: a.goals || [],
      dietary_preferences: a.dietary_preferences || [],
      food_log_count: a.food_log_count ?? 0,
      recommendation_count: a.recommendation_count ?? 0,
      open_request_count: db.requests.filter(
        (r) => r.user_id === a.id && r.status === "unresolved"
      ).length,
      last_active: a.last_active ?? null,
    };
  }

  function requestShape(r, db) {
    const u = db.accounts.find((a) => a.id === r.user_id);
    return {
      id: r.id,
      display_id: r.display_id,
      user_id: r.user_id,
      user_display_id: u ? u.display_id : null,
      user_name: u ? fullName(u) : null,
      user_email: u ? u.email : null,
      category: r.category,
      subject: r.subject,
      body: r.body,
      status: r.status,
      created_at: r.created_at,
      reply: r.reply ?? null,
      replied_at: r.replied_at ?? null,
      handled_by_name: r.handled_by_name ?? null,
    };
  }

  /* ---- Helpers ------------------------------------------ */

  function fail(status, detail) {
    throw new ApiError(detail, status);
  }

  function matches(q, ...fields) {
    if (!q) return true;
    const needle = q.toLowerCase();
    return fields.some((f) => f && String(f).toLowerCase().includes(needle));
  }

  // The logged-in admin. With requireAuth() commented out there is no session,
  // so fall back to a User Admin rather than failing every request.
  function currentUser(db) {
    const sessionUser = Session.user;
    if (sessionUser) {
      return db.accounts.find((a) => a.id === sessionUser.id) || sessionUser;
    }
    return db.accounts.find((a) => a.role === "user_admin" && a.is_active);
  }

  // Accounts and support requests are User Admin responsibilities only.
  function requireUserAdmin(me) {
    if (!me || me.role !== "user_admin") {
      fail(403, "Only User Admins can access accounts and support requests.");
    }
  }

  const newestFirst = (a, b) => new Date(b.created_at) - new Date(a.created_at);

  /* ---- Router ------------------------------------------- */

  async function mockFetch(path, options = {}) {
    await new Promise((resolve) => setTimeout(resolve, LATENCY_MS));

    const method = (options.method || "GET").toUpperCase();
    const url = new URL(path, "http://mock.local");
    const route = url.pathname.replace(/\/+$/, "") || "/";
    const query = url.searchParams;
    const body = options.body ? JSON.parse(options.body) : {};
    const db = load();
    const me = currentUser(db);
    let m;

    // Accounts, support requests and the UA dashboard are User Admin work.
    // Platform Managers are refused everything under /admin.
    if (route.startsWith("/admin/")) requireUserAdmin(me);

    // POST /login
    if (method === "POST" && route === "/login") {
      if (!body.email || !body.password) fail(422, "Email and password are required.");
      const found = db.accounts.find(
        (a) => a.email.toLowerCase() === body.email.toLowerCase()
      );
      // Accounts only get a stored password once one is set through the
      // create form or My Account; until then any password is accepted.
      if (found && found.password && found.password !== body.password) {
        fail(401, "Incorrect email or password.");
      }
      const account = found || db.accounts.find((a) => a.role === "user_admin" && a.is_active);
      if (!account.is_active) fail(403, "This account has been suspended.");
      return {
        access_token: "mock-token-" + account.id,
        token_type: "bearer",
        user: { ...accountSummary(account) },
      };
    }

    // GET /me
    if (method === "GET" && route === "/me") {
      return accountSummary(me);
    }

    // PATCH /me  (change own name; ID, email and role are not editable here)
    if (method === "PATCH" && route === "/me") {
      const account = db.accounts.find((a) => a.id === me.id);
      if (!account) fail(404, "Account not found.");
      const first = (body.first_name || "").trim();
      const last = (body.last_name || "").trim();
      if (!first || !last) fail(422, "First and last name are required.");
      account.first_name = first;
      account.last_name = last;
      save(db);
      return accountSummary(account);
    }

    // POST /me/password
    if (method === "POST" && route === "/me/password") {
      const account = db.accounts.find((a) => a.id === me.id);
      if (!account) fail(404, "Account not found.");
      if (!body.current_password) fail(422, "Enter your current password.");
      if (account.password && account.password !== body.current_password) {
        fail(400, "Current password is incorrect.");
      }
      if (!body.new_password || body.new_password.length < 8) {
        fail(422, "New password must be at least 8 characters.");
      }
      if (body.new_password === body.current_password) {
        fail(422, "New password must be different from your current password.");
      }
      // Plain text is acceptable only because this is a browser-local mock.
      account.password = body.new_password;
      save(db);
      return null; // real API would return 204
    }

    // GET /admin/dashboard
    if (method === "GET" && route === "/admin/dashboard") {
      const users = db.accounts.filter((a) => a.role === "user");
      const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      return {
        total_users: users.length,
        active_users: users.filter((a) => a.is_active).length,
        suspended_users: users.filter((a) => !a.is_active).length,
        new_users_7d: users.filter((a) => new Date(a.created_at) >= weekAgo).length,
        unresolved_requests: db.requests.filter((r) => r.status === "unresolved").length,
        resolved_requests: db.requests.filter((r) => r.status === "resolved").length,
        user_admins: db.accounts.filter((a) => a.role === "user_admin").length,
        platform_managers: db.accounts.filter((a) => a.role === "platform_manager").length,
        logs_today: db.stats.logs_today,
        recommendations_today: db.stats.recommendations_today,
      };
    }

    // POST /admin/accounts  (create a staff account)
    if (method === "POST" && route === "/admin/accounts") {
      const first = (body.first_name || "").trim();
      const last = (body.last_name || "").trim();
      const email = (body.email || "").trim();

      if (!first || !last) fail(422, "First and last name are required.");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail(422, "Enter a valid email address.");
      if (!body.password || body.password.length < 8) {
        fail(422, "Password must be at least 8 characters.");
      }
      if (body.role !== "user_admin" && body.role !== "platform_manager") {
        fail(422, "Role must be User Admin or Platform Manager.");
      }
      if (db.accounts.some((a) => a.email.toLowerCase() === email.toLowerCase())) {
        fail(409, "An account with this email already exists.");
      }

      const nextId = Math.max(0, ...db.accounts.map((a) => a.id)) + 1;
      const nextDisplay = Math.max(
        0, ...db.accounts.map((a) => Number(a.display_id.slice(1)) || 0)
      ) + 1;

      const account = staff(
        nextId, "U" + String(nextDisplay).padStart(3, "0"),
        first, last, email, body.role, true, 0
      );
      account.created_at = new Date().toISOString();
      account.password = body.password; // mock only, so login can check it
      db.accounts.push(account);
      save(db);
      return accountDetail(account, db);
    }

    // GET /admin/accounts?user_type=&q=&status=
    if (method === "GET" && route === "/admin/accounts") {
      const role = LABEL_TO_ROLE[query.get("user_type")];
      const status = query.get("status");
      const q = query.get("q");
      return db.accounts
        .filter((a) => !role || a.role === role)
        .filter((a) => !status || (a.is_active ? "Active" : "Suspended") === status)
        .filter((a) => matches(q, a.display_id, a.first_name, a.last_name, fullName(a), a.email))
        .map(accountSummary);
    }

    // /admin/accounts/:id and sub-routes
    if ((m = route.match(/^\/admin\/accounts\/(\d+)(\/status|\/role)?$/))) {
      const id = Number(m[1]);
      const sub = m[2];
      const account = db.accounts.find((a) => a.id === id);
      if (!account) fail(404, "Account not found.");

      if (method === "GET" && !sub) return accountDetail(account, db);

      if (method === "PATCH" && sub === "/status") {
        if (account.id === me.id) fail(400, "You cannot change the status of your own account.");
        account.is_active = Boolean(body.is_active);
        save(db);
        return accountDetail(account, db);
      }

      if (method === "PATCH" && sub === "/role") {
        if (!ROLE_LABELS[body.role]) fail(422, "Invalid role.");
        if (account.id === me.id) fail(400, "You cannot change your own role.");
        account.role = body.role;
        save(db);
        return accountDetail(account, db);
      }

      if (method === "DELETE" && !sub) {
        if (account.id === me.id) fail(400, "You cannot delete your own account.");
        db.accounts = db.accounts.filter((a) => a.id !== id);
        db.requests = db.requests.filter((r) => r.user_id !== id);
        save(db);
        return null; // real API returns 204
      }
    }

    // GET /admin/requests?status=&q=
    if (method === "GET" && route === "/admin/requests") {
      const status = query.get("status");
      const q = query.get("q");
      return db.requests
        .filter((r) => !status || r.status === status)
        .map((r) => requestShape(r, db))
        .filter((r) => matches(q, r.display_id, r.subject, r.body, r.user_name, r.user_email, r.user_display_id))
        .sort(newestFirst);
    }

    // /admin/requests/:id and sub-routes
    if ((m = route.match(/^\/admin\/requests\/(\d+)(\/reply|\/status)?$/))) {
      const id = Number(m[1]);
      const sub = m[2];
      const request = db.requests.find((r) => r.id === id);
      if (!request) fail(404, "Request not found.");

      if (method === "GET" && !sub) return requestShape(request, db);

      if (method === "POST" && sub === "/reply") {
        const text = (body.body || "").trim();
        if (!text) fail(422, "Reply cannot be empty.");
        request.reply = text;
        request.replied_at = new Date().toISOString();
        request.handled_by_name = fullName(me);
        if (body.resolve) request.status = "resolved";
        save(db);
        return requestShape(request, db);
      }

      if (method === "PATCH" && sub === "/status") {
        const next = query.get("status");
        if (next !== "resolved" && next !== "unresolved") fail(422, "Invalid status.");
        request.status = next;
        save(db);
        return requestShape(request, db);
      }
    }

    fail(404, `Mock API has no route for ${method} ${route}.`);
  }

  /* ---- Install ------------------------------------------ */

  // apiFetch is a top-level function in api.js, so reassigning it here makes
  // every wrapper (Accounts.list, Requests.get, ...) use the mock.
  apiFetch = mockFetch;

  window.MockApi = {
    reset() {
      localStorage.removeItem(STORE_KEY);
      window.location.reload();
    },
  };

  // Visible reminder, so nobody mistakes mock data for the real database.
  const badge = document.createElement("div");
  badge.style.cssText =
    "position:fixed;bottom:12px;left:12px;z-index:9999;padding:6px 10px;" +
    "border-radius:8px;background:#b45309;color:#fff;font:600 12px Inter,sans-serif;" +
    "box-shadow:0 2px 8px rgba(0,0,0,.2);";
  badge.innerHTML =
    'MOCK DATA · <a href="#" style="color:#fff;text-decoration:underline;">reset</a>';
  badge.querySelector("a").addEventListener("click", (e) => {
    e.preventDefault();
    if (confirm("Restore the original mock data? Your changes will be lost.")) MockApi.reset();
  });
  document.body.appendChild(badge);
})();