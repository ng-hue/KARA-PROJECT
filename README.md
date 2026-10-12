# KARA Public Records Request Tracker

A web application for [KARA (Kids At Risk Action)](https://karagroup.org/) to log public records requests, view request statuses, and track statutory response deadlines once the five-state rules are verified and implemented. Built by an ASU Capstone team in partnership with KARA.

**Sprint 2 (September 28–October 9, 2026):** First build sprint. This README includes deployment verification and QA retesting completed through October 12, 2026. Some Sprint 2 acceptance criteria remain pending and are documented below.

> **Fake data only.** Do not add real child welfare records, real personal information, or real agency correspondence to this application or its Supabase database.

## Current features and limitations

- Create requests with a title, request text, state, target agency, date sent, and status.
- View requests in newest-first order with status badges.
- Supported state selections: Arizona (AZ), California (CA), Maine (ME), Minnesota (MN), and Texas (TX).
- Save requests to Supabase when the project is configured, or use local browser preview mode when it is not.
- **Statutory deadlines:** The application implements deadline calculations for five supported states:
  - California (CA): 10 calendar days
  - Maine (ME): 5 business days
  - Texas (TX): 10 business days
  - Arizona (AZ): No fixed numerical deadline in the implemented rule
  - Minnesota (MN): No fixed numerical deadline in the implemented rule

All 11 automated unit tests passed. Manual retesting confirmed the calculated deadlines for California, Maine, and Texas.

Arizona and Minnesota currently display "Pending research" when no numerical deadline is returned. This label needs clarification.

Older records created before the deadline rules were implemented may still contain NULL deadlines.

The statutory rules require legal and sponsor review before being relied upon for actual public records requests.

Later-sprint features (not yet implemented): correspondence storage, user roles/access controls, and response intake.

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
npm install
npm run build
netlify deploy --prod
```

On Windows PowerShell, `npm.cmd ...` and `netlify.cmd deploy --prod` are alternatives. The Netlify CLI builds by default during deployment; `--prod` publishes to the production URL. Before deploying, confirm you are using reviewed code and the team's intended release branch/version.

If the directory is not yet linked to the Netlify project, ask a team admin for access and use `netlify link` to connect it. **Do not create a second production site accidentally.**

### Automatic deployment and deploy previews — Verified

The team's official Netlify project (`kprsite`) is connected to `ng-hue/KARA-PROJECT`. Netlify automatically deploys changes merged into `main` and generates deploy previews when pull requests are opened.

Deployment behavior was verified on October 12, 2026, using pull request #4:

1. **Deploy Preview:** Opening PR #4 automatically triggered a successful preview deployment at https://deploy-preview-4--kprsite.netlify.app (24 seconds).
2. **Production Deployment:** Merging PR #4 into `main` triggered a successful production deployment at https://kprsite.netlify.app (20 seconds).
3. **Database Connection:** Both the deploy preview and production website displayed requests from Supabase.
4. **Production Commit:** `ba0cb29`.

Future changes should be submitted through pull requests targeting `main`. Verify the deploy preview before merging, then confirm the production deployment succeeds.

### Sprint 2 deployment verification (US6)

| Acceptance test | Result | Evidence |
| --- | --- | --- |
| GitHub connected to Netlify | **PASS** | `ng-hue/KARA-PROJECT` connected to the `kprsite` Netlify project. |
| Sponsor-accessible production URL | **PASS** | https://kprsite.netlify.app |
| Push/merge to `main` deploys within five minutes | **PASS** | PR #4 merged as commit `ba0cb29`; Netlify published the production deployment in 20 seconds. |
| Pull request creates deploy-preview URL | **PASS** | PR #4 automatically created https://deploy-preview-4--kprsite.netlify.app (deployed in 24 seconds). |
| Deploy preview connects to Supabase | **PASS** | Preview displayed Supabase request records and calculated deadlines. |
| Production connects to Supabase | **PASS** | Production request list displayed shared Supabase records with no preview-mode banner. |
| Environment files excluded from Git | **PARTIALLY VERIFIED** | `.env.local` is ignored; full Git history and credential audit not performed. |

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
- **Deadline is blank or shows "Pending research":**
  - For Arizona and Minnesota, the current implementation does not generate a fixed numerical deadline.
  - Older requests may have NULL deadlines because they were created before the updated rules were deployed.
  - For newly created California, Maine, or Texas requests, an unexpected blank deadline should be investigated.
- **Netlify blocks the deploy for Next.js security:** Update to a currently patched compatible Next.js release, test the production build, and deploy again. Commit the dependency changes on a feature branch for review.
- **Windows says `npm.ps1` cannot run:** Use `npm.cmd` instead.

## Sprint 2 definition of done — remaining verification

The Sprint 2 deployment requirements have been verified:

- The official Netlify production website is live.
- GitHub pull requests automatically generate deploy previews.
- Merging into main automatically triggers production deployment.
- Production and preview deployments successfully display Supabase records.
- The request form successfully creates records in Supabase.
- The 17-case manual QA checklist has been executed and documented.
- Five-state deadline retesting has been recorded.

Outstanding verification:
- Confirm a working database seed script inserts 10 fictional requests with the required state and status coverage.
- Obtain legal and sponsor review of statutory deadline rules.
- Confirm a new teammate can complete local setup using the README alone.
- Verify all team commits and Jira task statuses.
- Complete any outstanding credential/security review.

See docs/manual-test-checklist.md and docs/QA-001-missing-deadlines.md for the original QA results and subsequent retests.

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



## Team

| Name | Role |
| --- | --- |
| Reilly Wirtz | Project Manager & SCRUM Master |
| Nathan Gentala | Backend & Architecture |
| Angela Iweka | Frontend |
| Daniel Anderson | Correspondence & Data |
| Tommy Nguyen | QA & Documentation |

**Sponsor:** Samantha Clayton, Web and Research Director, KARA
