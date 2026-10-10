# KARA Public Records Request Tracker

A web application for [KARA (Kids At Risk Action)](https://karagroup.org/) to log public records requests, view request statuses, and track statutory response deadlines once the five-state rules are verified and implemented. Built by an ASU Capstone team in partnership with KARA.

**Sprint 2 (September 28–October 9, 2026):** first build sprint. This README documents the reviewed repository snapshot and the team’s confirmed manual Netlify/Supabase test as of October 9, 2026; it does not imply unfinished sprint acceptance criteria have passed.

> **Fake data only.** Do not add real child welfare records, real personal information, or real agency correspondence to this application or its Supabase database.

## Current features and limitations

- Create requests with a title, request text, state, target agency, date sent, and status.
- View requests in newest-first order with status badges.
- Supported state selections: Arizona (AZ), California (CA), Maine (ME), Minnesota (MN), and Texas (TX).
- Save requests to Supabase when the project is configured, or use local browser preview mode when it is not.
- **Deadlines are not yet populated in the reviewed snapshot.** The calculation logic exists in `lib/deadlines.js`, but the statutory rules are currently unverified placeholders. The app returns `null` for a deadline until a state rule is supplied and reviewed. Do not treat blank deadlines as legally verified advice.

Later-sprint features (not yet implemented): correspondence storage, user roles/access controls, and response intake.

## Tech stack

- Next.js 15 / React 19
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
3. The schema includes anonymous read/insert policies intended **only for isolated fake-data development**. These policies permit anonymous access; replace them with authenticated, least-privilege policies before any public production use or sensitive data. If the table or policies already exist, coordinate with the team instead of blindly running the setup again.
4. Add the `.env.local` values above and restart the development server.
5. Create a **fictional** request in the web UI, then check **Supabase → Table Editor → `public.requests`** to confirm it was inserted.

#### Seed/sample data

**Sprint 2 acceptance requirement:** a seed script must insert **exactly 10 fake requests** spanning **at least three states and three statuses** into the Supabase `requests` table. The list must show those records. This is assigned to the backend/scaffold story (US1).

**Current limitation:** the reviewed repository snapshot has **no `npm run seed` script**. The 10 built-in examples in `lib/sampleData.js` appear only in browser preview mode and do **not** seed Supabase. **Do not run `npm run seed` yet**; it is not a working command in this snapshot.

**Temporary manual test-data procedure (not a substitute for the required seed script):**

1. Confirm the app is connected to the isolated development Supabase project.
2. Open `/requests/new` locally or on the live site.
3. Submit a **fictional** request with all required fields.
4. Confirm the row appears under **Supabase → Table Editor → `public.requests`** and in the website’s request list.
5. Repeat with different fictional states and statuses only if your team agrees to use the shared development database for test records.

**When Nathan’s seed script is merged:** update this section with its actual command and prerequisites; run it on a clean test dataset, verify exactly 10 seeded rows, and note whether rerunning it creates duplicates or is idempotent.

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

## Deployment: Netlify

- **Live site:** https://kara-public-records-tracker.netlify.app
- **Netlify project:** https://app.netlify.com/projects/kara-public-records-tracker
- **Build command:** `npm run build`
- **Publish directory:** `.next`
- **Configuration:** `netlify.toml`
- **Production branch target:** `main` **once GitHub integration is enabled**

### Environment variables on Netlify

In the Netlify project's **Project configuration → Environment variables**, add:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Use the same **public** project values as local development. They need to be available to the build. Do not upload `.env.local` or use a Supabase service-role/secret key.

### Current manual deployment procedure

GitHub-based auto-deploy has **not yet been configured** because the repository belongs to a teammate and its Netlify GitHub App permissions are pending. Until then, an authorized team member can deploy from a local checkout linked to the Netlify site:

```bash
npm install
npm run build
netlify deploy --prod
```

On Windows PowerShell, `npm.cmd ...` and `netlify.cmd deploy --prod` are alternatives. The Netlify CLI builds by default during deployment; `--prod` publishes to the production URL. Before deploying, confirm you are using reviewed code and the team's intended release branch/version.

If the directory is not yet linked to the Netlify project, ask a team admin for access and use `netlify link` to connect it. **Do not create a second production site accidentally.**

### Planned automatic deployment and previews — not yet verified

Once the repository owner authorizes the Netlify GitHub App for `ng-hue/KARA-PROJECT`, configure continuous deployment with `main` as the production branch. Then test the following before describing them as operational:

1. Push or merge a reviewed change to `main` and confirm Netlify starts a production deploy.
2. Open a pull request targeting `main` and confirm Netlify creates a deploy-preview URL.
3. Check that the production deploy is reflected at the live URL **within five minutes**, as required by US6.
4. Record the live production URL, actual deploy-preview URL, date/time, commit SHA, and pass/fail result in the README or sprint test evidence. Do not invent a preview URL.

### Sprint 2 deployment verification (US6)

| Acceptance test | Current evidence/status |
| --- | --- |
| Sponsor-accessible Netlify URL | Live URL created; a test request entered on the live site appeared in Supabase (reported October 9, 2026) |
| Push to `main` deploys within five minutes | **Not tested** — GitHub integration still pending |
| Pull request creates a deploy-preview URL | **Not tested** — GitHub integration still pending; preview URL not available |
| Environment secrets not committed | `.env.local` is ignored in the reviewed repository; **full commit-history audit not performed** |

### Adding a sixth state (US4 documentation; implement only after research approval)

1. Obtain the state’s public-records statute name, response window, whether to count **calendar** or **business** days, the statutory citation, and a **primary-source URL**. Obtain sponsor/team approval.
2. In `lib/deadlines.js`, add a two-letter state-code entry to `STATE_DEADLINE_RULES` with `statuteName`, `days`, `dayType`, `citation`, and `sourceUrl`.
3. Add the state to the selectable options in `lib/constants.js`.
4. Add a unit test comparing the calculated deadline to the documented rule, plus a new-request-form integration check.
5. Confirm with the sponsor how to count the start day and holidays. The current function starts counting **the day after** `date_sent` and excludes **weekends only** for business days; these choices are not yet sponsor-approved.

**Do not fill in deadlines based on guesses.** The five-state research table and tests are separate US4 deliverables, owned by Daniel Anderson.

## Validation and troubleshooting

- **Preview banner appears:** Check that both Supabase environment variables exist and restart the Next.js server (or redeploy Netlify after changing its environment variables).
- **Requests don't appear in Supabase:** Verify the project URL, public key, table schema, applicable RLS policies, and the browser console/network errors.
- **Deadline is blank:** Expected until state-specific rules in `lib/deadlines.js` are verified and populated. Do not invent statutory deadlines.
- **Netlify blocks the deploy for Next.js security:** Update to a currently patched compatible Next.js release, test the production build, and deploy again. Commit the dependency changes on a feature branch for review.
- **Windows says `npm.ps1` cannot run:** Use `npm.cmd` instead.

## Sprint 2 definition of done — remaining verification

The Sprint 2 backlog requires: (1) a live sponsor-accessible Netlify URL; (2) a form submission stored in Supabase and shown in the list; (3) **at least 10 seeded fake requests in the Supabase-backed list**; (4) correct deadline calculations against the documented statutory table; (5) code in the shared GitHub repository with a commit from every teammate; and (6) Jira statuses kept current. The confirmed live-site-to-Supabase write test supports item (2), but the other criteria must be checked independently.

**QA/Documentation (US7):** A teammate who did not write these instructions must be able to start the app using the README alone. Separately, create and execute a manual checklist with **at least 10 test cases** covering form, validation, list, and deadlines; test on the deployed site **on or after October 8, 2026**, and record a **date and pass/fail** for every case. This README itself is not a substitute for that checklist.

## Contributing

1. Pull the latest reviewed code from `main` and create a feature branch, for example `feature/tommy`.
2. Make your changes and verify them locally.
3. Commit only relevant files. Never commit `.env.local`, real personal data, or credentials.
4. Push your feature branch and open a pull request for teammate review before merging into `main`.
5. Deadline-rule changes must use cited primary legal sources and receive sponsor/team review; see `lib/deadlines.js` for current questions about counting days and holidays.

## Team

| Name | Role |
| --- | --- |
| Reilly Wirtz | Project Manager & SCRUM Master |
| Nathan Gentala | Backend & Architecture |
| Angela Iweka | Frontend |
| Daniel Anderson | Correspondence & Data |
| Tommy Nguyen | QA & Documentation |

**Sponsor:** Samantha Clayton, Web and Research Director, KARA
