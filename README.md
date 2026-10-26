# KARA Public Records Request Tracker

A web application for [KARA (Kids At Risk Action)](https://karagroup.org/) to log public records requests, view request statuses, and track statutory response deadlines once the five-state rules are verified and implemented. Built by an ASU Capstone team in partnership with KARA.

**Sprint 3 (October 12–23, 2026):** This README reflects the Sprint 3 request-detail, deadline flagging, status-history, and documentation work currently merged or in progress.

> **Fake data only.** Do not add real child welfare records, real personal information, or real agency correspondence to this application or its Supabase database.

## Current features and limitations

- Create public records requests with a title, request text, state, target agency, date sent, and status.
- View all requests with status badges, deadlines, and overdue/due-soon indicators.
- Open an individual request detail page.
- Supported states: Arizona (AZ), California (CA), Maine (ME), Minnesota (MN), and Texas (TX).
- Save requests to Supabase when the project is configured, or use local browser preview mode when it is not.
- Track request status transitions using the allowed workflow defined below.
- Record status history in the `public.status_history` table.
- Filter the request list by status and deadline flag.
- All sample and seeded data is fictional and for testing only.

### Deadline behavior

The application currently supports these deadline rules:

- California (CA): 10 calendar days
- Maine (ME): 5 business days
- Texas (TX): 10 business days
- Arizona (AZ): estimated deadline based on supported fixed-deadline states
- Minnesota (MN): estimated deadline based on supported fixed-deadline states

Requests with a deadline before today are marked **Overdue** when their status is `Sent` or `Acknowledged`.

Requests with a deadline within the next 7 days are marked **Due Soon** when their status is `Sent` or `Acknowledged`.

Requests with status `Draft`, `Fulfilled`, `Denied`, or `Appealed` are not flagged as overdue or due soon.

Estimated deadlines are labeled as estimated and should not be treated as legal advice.

### Current limitations

- Authentication and final authenticated RLS policies are still pending the backend/auth merge.
- Correspondence storage and response intake are not yet complete.
- Repository transfer has been deferred by the sponsor until the end of the semester to reduce deployment risk.
- All statutory deadline rules should receive sponsor/legal review before being relied upon for real public records requests.

## Status workflow

Requests can only move forward through the following allowed status transitions:

| Current Status | Allowed Next Status |
| --- | --- |
| Draft | Sent |
| Sent | Acknowledged, Fulfilled, Denied |
| Acknowledged | Fulfilled, Denied |
| Denied | Appealed |
| Fulfilled | None (terminal) |
| Appealed | None (terminal) |

Backward transitions are not allowed.

Status changes are recorded in the `public.status_history` table. Each history row stores the request ID, previous status, new status, timestamp, user who made the change when available, and an optional note.

Existing requests are backfilled with an initial history row using `from_status = NULL` and their current status as `to_status`.

## Tech stack

- Next.js 16.4.0 / React 19
- Tailwind CSS 4
- Supabase (PostgreSQL)
- Netlify (hosting)

## Prerequisites

- Node.js and npm (a currently supported Node.js LTS version is recommended)
- Git
- VS Code or another code editor
- Access to the team's Supabase project **if you want shared database mode**; it is not needed for preview mode

## Local development

1. Clone the repository and enter the project folder:

   ```bash
   git clone https://github.com/ng-hue/KARA-PROJECT.git
   cd KARA-PROJECT
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

   **Windows PowerShell tip:** If PowerShell blocks `npm.ps1`, use `npm.cmd install` and `npm.cmd run dev` instead.

3. **Optional: connect Supabase.** Create `.env.local` in the repository root (alongside `package.json`) and add:

   ```dotenv
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_PUBLIC_SUPABASE_KEY
   ```

   Find the URL and public publishable/anon key in the **team's Supabase project settings**. Do not enter a `service_role` or secret API key. The `NEXT_PUBLIC_` values are exposed to browser code; only public-facing credentials belong here. Never commit `.env.local`.

4. Run the development server:

   ```bash
   npm run dev
   ```

   On Windows PowerShell, `npm.cmd run dev` also works. Open **http://localhost:3000**.

5. To stop the server, press **Ctrl+C** in its terminal.

### Preview mode (no database credentials)

If either Supabase environment variable is missing, the app displays a yellow preview-mode banner. It uses 10 built-in **fictional sample requests** from `lib/sampleData.js` and saves new preview requests in that browser's local storage. They are **not** shared with teammates or written to Supabase.

### Supabase database setup (team project)

For a fresh *development-only* Supabase project:

1. Open the Supabase SQL Editor.
2. Review `supabase/schema.sql` before running it. It creates the `public.requests` table and enables row-level security (RLS).
3. The schema removes the Sprint 2 anonymous read/insert policies and grants request access only to signed-in Supabase users. Review the policy changes before running the SQL against an existing project.
4. Add the `.env.local` values above and restart the development server.
5. In Supabase Authentication settings, enable email/password sign-in, disable public sign-ups, and have an administrator create one sponsor account plus one account for each team member. Never put credentials in the repository or Jira.
6. Sign in at `/login`, create a **fictional** request in the web UI, then check **Supabase → Table Editor → `public.requests`** to confirm it was inserted.


## Data model: `public.requests`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key; defaults to `gen_random_uuid()` |
| `title` | `text` | Required |
| `request_text` | `text` | Required |
| `state` | `text` | Two-letter state code; required |
| `target_agency` | `text` | Required |
| `date_sent` | `date` | Required |
| `deadline` | `date` | Nullable; calculated in app only when a verified rule exists |
| `status` | `text` | Draft, Sent, Acknowledged, Fulfilled, Denied, or Appealed; default Draft |
| `created_at` | `timestamptz` | Defaults to current timestamp |

## Data model: `public.status_history`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key; generated automatically |
| `request_id` | `uuid` | Required; references `public.requests.id` |
| `from_status` | `text` | Previous status; nullable for the initial backfill row |
| `to_status` | `text` | Required new status |
| `changed_at` | `timestamptz` | Generated timestamp |
| `changed_by` | `uuid` | Authenticated user ID when available |
| `note` | `text` | Optional note about the status change |

Each existing request receives an initial history row so that every request has at least one status-history record.

## Deployment: Netlify

- **Production site:** https://kprsite.netlify.app
- **Netlify production project:** https://app.netlify.com/projects/kprsite
- **Deploy Preview (PR #4):** https://deploy-preview-4--kprsite.netlify.app
- **Separate testing site:** https://kara-public-records-tracker.netlify.app
- **Build command:** `npm run build`
- **Publish directory:** `.next`
- **Configuration:** `netlify.toml`
- **Production branch:** `main` (GitHub integration enabled; automatic deployments verified)
- **Verified production commit:** `ba0cb29`
- **Production deployment:** Successfully published automatically after PR #4 merged (20 seconds)
- **Deploy preview:** Automatically created for PR #4 (24 seconds)

### Environment variables on Netlify

In the Netlify project's **Project configuration → Environment variables**, add:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Use the same **public** project values as local development. They need to be available to the build. Do not upload `.env.local` or use a Supabase service-role/secret key.

### Current manual deployment procedure

The team's official Netlify project (`kprsite`) is connected to the GitHub repository `ng-hue/KARA-PROJECT`. Changes merged into `main` automatically trigger production deployments, and pull requests generate deploy previews.

The separate testing project (`kara-public-records-tracker`) is deployed manually using the Netlify CLI. An authorized team member can publish local changes to this testing site using the commands below. Before deploying, verify that the local directory is linked to the correct Netlify project.

```bash
npm run seed
```

This command writes the synthetic requests to `lib/sampleData.json`. It does not
require Supabase credentials or make a network connection. Run `npm run dev` to
view the requests in preview mode. Running the seed command again regenerates
the same 10 fixtures; it does not clear requests already saved in browser storage.

All seeded data uses fictional agency labels and test-only request text. It
contains no real names, child welfare data, or real agency correspondence.

After setting the Supabase variables, run `supabase/schema.sql` in the Supabase
SQL Editor to create the table and policies.


## Contributing

1. Pull the latest reviewed code from `main` and create a feature branch, for example `feature/tommy`.
2. Make your changes and verify them locally.
3. Commit only relevant files. Never commit `.env.local`, real personal data, or credentials.
4. Push your feature branch and open a pull request for teammate review before merging into `main`.
5. Deadline-rule changes must use cited primary legal sources and receive sponsor/team review; see `lib/deadlines.js` for current questions about counting days and holidays.

## Testing

For unit testing we are currently using the built 'node:test'. This might need to change in the future. 

To run the unit tests:

```bash
npm test
```
- A recent version of Node is required

To add to the unit tests:

- Create a file ending in `.test.js` to have it run when you call the test script. 

You might see a [MODULE_TYPELESS_PACKAGE_JSON] error in your console, you can safely ignore it. 

## Risk management

| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| Repository transfer breaks the Netlify deploy | Medium | High | Do US1 on Monday October 12 before any other code lands. Relink Netlify the same day. If the deploy is still broken on Tuesday, tell the sponsor; do not work around it with a second site. |
| Row level security blocks the app itself | High | Medium | Write the RLS policies first, test with the anon key and an authenticated session before merging. Keep the seed script on the service role key. |
| Team locked out of its own deployed app | Low | High | Sponsor account plus five team accounts created in US2. Supabase dashboard password reset is the fallback. Credentials never go in the repository. |
| Backfilling status history on seeded rows is skipped | Medium | Low | US5 includes the backfill as a task. US7 checklist verifies every seeded request shows at least one history row. |
| Another exam week cuts coding time | Medium | Medium | Each teammate names exam dates at the planning meeting. Reilly moves owners' tasks earlier or later in the sprint around them. Scope is not extended for lost days; stories are dropped to the product backlog instead. |
| Roles and permissions get pulled in with auth | Medium | Medium | Roles are out of scope. Every signed-in user has the same permissions this sprint. Anyone who starts a roles table stops and moves it to the product backlog. |
| Status rules are implemented in two places and drift | Medium | Medium | Transition rules and overdue rules each live in one shared helper (US5, US6) used by both the list and the detail page. |

## Team

| Name | Role |
| --- | --- |
| Reilly Wirtz | Project Manager |
| Nathan Gentala | Backend & Architecture |
| Angela Iweka | Frontend |
| Daniel Anderson | Correspondence & Data |
| Tommy Nguyen | QA & Documentation |

**Sponsor:** Samantha Clayton, Web and Research Director, KARA
