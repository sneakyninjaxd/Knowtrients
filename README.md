# Knowtrients Website

Public marketing pages plus three signed-in areas:

| Folder | For | Covers |
|---|---|---|
| `user/` | App users | Download the app |
| `AA/` | Account Administrators | Accounts and support requests |
| `PA/` | Platform Administrators | App performance, AI accuracy, user feedback |

## Running it

The site is static HTML, but it cannot be opened with `file://` because
browsers block `fetch` from file URLs. Serve it over HTTP:

```bash
cd website
python -m http.server 5500
```

Then open <http://127.0.0.1:5500>. In VS Code, the Live Server extension does
the same thing with a click.

## Backend selection

`js/api.js` picks the API automatically:

| Where the site runs | API used |
|---|---|
| `localhost` / `127.0.0.1` | `http://127.0.0.1:8000` |
| anywhere else | `https://knowtrients-backend-database.onrender.com` |

To override, change `API_BASE_URL` at the top of `js/api.js`.

## Mock backend

Every page now talks to the real backend. `js/mock-api.js` is kept for working
offline: to use it on a page, add this line directly after the `api.js` line —

```html
<script src="../js/mock-api.js"></script>   <!-- pages in AA/, PA/, user/ -->
<script src="js/mock-api.js"></script>      <!-- pages in the root folder -->
```

Remove it again before committing. Its data lives in the browser, and the
badge in the corner resets it.

## Roles

Role names in the database and the API:

| Slug | Shown as | Lands on |
|---|---|---|
| `user` | User | `user/download.html` |
| `account_administrator` | Account Administrator | `AA/dashboard.html` |
| `platform_administrator` | Platform Administrator | `PA/dashboard.html` |

The backend stores these names and renamed existing accounts automatically.
`js/api.js` still translates the earlier names (`user_admin`,
`account_manager`, `platform_manager`, `IT_manager`) in case a browser has an
old session saved.

## Permissions

- **Account Administrator** — everything to do with accounts: create, suspend,
  reactivate, change user type, delete. Also the support request queue.
- **Platform Administrator** — app performance, AI accuracy and the feedback
  users send about them. No account management beyond their own details.

Nobody can suspend, re-role or delete their own account. Each page calls
`requireRole()` on load and sends anyone else to their own dashboard, but that
is navigation only — the backend enforces the same rules, so a Platform
Administrator calling an `/admin/` route directly gets a 403.

**Support requests are split between the two roles.** Account requests go to
the Account Administrator's Requests pages; bug reports go to the Platform
Administrator's Feedback pages. Each request appears in exactly one queue.

## Signing in

| Page | For |
|---|---|
| `login.html` | App users |
| `UAlogin.html` | Both administrator types, with an admin type picker |
| `register.html` | Public sign-up for app users |

## Session handling

The token is kept in `sessionStorage` under `knowtrients_admin_token`, so it
lasts for the browser tab and no longer. A 401 from any request clears the
session and shows a message.

## Pages

| Page | What it does |
|---|---|
| `index.html` | Public marketing page |
| `FYP-26-S3-17.html` | Team, submission drive and repository links |
| `user/download.html` | Download the app, for signed-in app users |
| `AA/dashboard.html` | Counts, at-a-glance stats, pending request preview |
| `AA/accounts.html` | Accounts table with type filter and search |
| `AA/view-account.html` | One account: profile, health data, activity, suspend, change type, delete |
| `AA/create-account.html` | Create an administrator account |
| `AA/requests.html` | Support request queue |
| `AA/request-detail.html` | Read a request, reply, resolve or reopen |
| `AA/my-account.html` | Own name, password, log out |
| `PA/dashboard.html` | Uptime and error tiles, AI accuracy chart, open feedback |
| `PA/analytics.html` | Full accuracy chart plus performance and usage figures |
| `PA/feedback.html` | Feedback queue with filter and search |
| `PA/feedback-detail.html` | Read feedback, reply, resolve or reopen |
| `PA/my-PAaccount.html` | Own name, password, log out |

## What the analytics figures mean

**AI accuracy chart.** There is no ground truth saying whether a
recommendation was correct, so the chart shows what users say about them:
each point is the share of that day's *rated* recommendations that users
marked helpful. A day with no ratings is a gap in the line, not a zero —
a zero would claim the AI was 0% helpful that day. The figures above the
chart are the last seven days pooled, since a single day is usually empty
until the app has many users.

**Request success rate.** A server can't record its own downtime, so instead
of an uptime figure the dashboard shows the share of requests over 30 days
that didn't fail with a server error. Response times are averaged over the
last seven days. Both show "—" until there is traffic to measure.

**Bug reports (24h).** New bug reports raised in the last 24 hours.
**Pending bug reports** is the number still unresolved.

**Likes, dislikes, unrated.** Ratings given to recommendations over the
period. Unrated is recommendations shown that nobody rated.

## Backend endpoints used

| Page | Calls |
|---|---|
| `register.html` | `POST /register` |
| `login.html`, `UAlogin.html` | `POST /login` |
| `AA/dashboard.html` | `GET /admin/dashboard`, `GET /admin/requests` |
| `AA/accounts.html` | `GET /admin/accounts` |
| `AA/view-account.html` | `GET`, `PATCH`, `DELETE /admin/accounts/{id}` |
| `AA/create-account.html` | `POST /admin/accounts` |
| `AA/requests.html`, `request-detail.html` | `/admin/requests?type=account` and its reply and status routes |
| `PA/dashboard.html`, `analytics.html` | `GET /im/analytics` |
| `PA/feedback.html`, `feedback-detail.html` | `/im/feedback` and its reply and status routes |
| `AA/my-account.html`, `PA/my-PAaccount.html` | `GET /me`, `PATCH /me`, `POST /me/password` |

Deleting an app user removes everything belonging to them — logs,
recommendations, ratings, support requests and their messages.
