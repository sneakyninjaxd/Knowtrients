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

`js/mock-api.js` stands in for the API during development. A page uses it when
it loads that script after `js/api.js`; comment the line out to use the real
backend. Data is kept in the browser, and the badge in the corner resets it.

## Roles

Role names in the database and the API:

| Slug | Shown as | Lands on |
|---|---|---|
| `user` | User | `user/download.html` |
| `account_administrator` | Account Administrator | `AA/dashboard.html` |
| `platform_administrator` | Platform Administrator | `PA/dashboard.html` |

`js/api.js` translates the earlier names (`user_admin`, `account_manager`,
`platform_manager`, `IT_manager`) so old sessions and an API that hasn't caught
up still work.

## Permissions

- **Account Administrator** — everything to do with accounts: create, suspend,
  reactivate, change user type, delete. Also the support request queue.
- **Platform Administrator** — app performance, AI accuracy and the feedback
  users send about them. No account management beyond their own details.

Nobody can suspend, re-role or delete their own account. Each page calls
`requireRole()` on load and sends anyone else to their own dashboard, but that
is navigation only: the backend has to enforce the same rules.

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

## Still to build on the backend

These endpoints the site calls do not exist yet:

- `POST /register` — public sign-up (hash the password, role `user`)
- `POST /admin/accounts` — create an administrator account
- `PATCH /me` and `POST /me/password` — own name and password
- `GET /im/analytics`, `GET /im/feedback` and its `/reply` and `/status` routes
- Deleting an app user must also remove their logs, recommendations and requests