# Knowtrients Admin Website

Companion website for the Knowtrients platform. The public pages are
marketing; `UA/` is the authenticated administration area.

All data comes from the FastAPI backend — there is no mock data.

## Running it

The site is static HTML, but it cannot be opened with `file://` because
browsers block `fetch` from file URLs. Serve it over HTTP:

```bash
cd website
python -m http.server 5500
```

Then open <http://127.0.0.1:5500>.

In VS Code, the Live Server extension does the same thing with a click.

## Backend selection

`js/api.js` picks the API automatically:

| Where the site runs | API used |
|---|---|
| `localhost` / `127.0.0.1` | `http://127.0.0.1:8000` |
| anywhere else | `https://knowtrients-backend-database.onrender.com` |

So local development talks to a local backend and a deployed site talks to the
deployed one, with nothing to edit when you switch. To override, change
`API_BASE_URL` at the top of `js/api.js`.

## Creating the first admin

Staff accounts cannot be created from the website — the signup page would
otherwise let anyone who finds the URL mint an administrator. Create them from
the backend instead:

```bash
cd backend
python ml/create_admin.py --email you@example.com --password yourpassword \
    --first Ada --last Lovelace --role platform_manager
python ml/create_admin.py --list
```

Roles are `user_admin` and `platform_manager`. If the email already has an app
account, the script promotes it rather than failing.

## Pages

| Page | What it does |
|---|---|
| `index.html` | Public marketing page |
| `login.html` | Staff login. Rejects ordinary app users with a clear message |
| `signup.html` | Explains that admin accounts are provisioned internally |
| `UA/dashboard.html` | Live counts, at-a-glance stats, pending request preview |
| `UA/accounts.html` | Accounts table with type filter and debounced search |
| `UA/view-account.html` | One account: profile, health data, activity, suspend/reactivate |
| `UA/requests.html` | Support request queue with status filter and search |
| `UA/request-detail.html` | Read a request, reply, resolve or reopen |

## Permissions

Two staff roles, enforced by the backend rather than the UI:

- **User Admin** — accounts and support requests
- **Platform Manager** — the above, plus role changes and account deletion

A User Admin cannot change the status of another staff account, and nobody can
suspend or delete themselves. Both restrictions exist because recovery would
otherwise need direct database access.

## Session handling

The JWT is kept in `localStorage` under `knowtrients_admin_token`. Every admin
page calls `requireAuth()` on load and redirects to login when it is missing.
A 401 from any request clears the session and shows a message.

Tokens last 24 hours.

## Cold starts

The free hosting tier suspends after about 15 minutes idle, and the first
request afterwards takes 30–60 seconds. Pages show a loading state and a
message explaining this rather than reporting a failure. Loading `/docs` in a
browser first will warm the service before a demo.
