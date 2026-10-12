# KARA Public Records Request Tracker

A web app for [KARA](https://karagroup.org) staff to log public records requests, track their status, and automatically calculate the statutory response deadline for each request.

Built by an ASU Capstone team in partnership with KARA (Kids At Risk Action).

> **Data rule:** This project uses **seeded fake data only**. No real child welfare data, real names, or real agency correspondence may enter this tool.

## Features (Sprint 2)

- **New request form:** log a request with title, request text, state, target agency, and date sent
- **Request list:** view all requests, newest first, with status badges
- **Automatic deadlines:** response deadline calculated from the state's public records statute (AZ, CA, ME, MN, TX)

Planned for later sprints: correspondence storage, user roles and access, response intake.

## Tech Stack

- [Next.js](https://nextjs.org) – frontend and app framework
- [Supabase](https://supabase.com) – Postgres database
- [Tailwind CSS](https://tailwindcss.com) – styling
- [Netlify](https://www.netlify.com) – hosting and continuous deployment

## Getting Started

### Prerequisites
- Node.js 18+
- Access to the team Supabase project

### Local setup

```bash
git clone https://github.com/<kara-org>/<repo-name>.git
cd <repo-name>
npm install
```

Create a `.env.local` file in the project root:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

> Never commit `.env` files. They are excluded in `.gitignore`.

Run the dev server:

```bash
npm run dev
```

Then open http://localhost:3000.

### Seed the database

From the project root, run this command to seed the local preview fixture with
10 fake requests across five states and six statuses:

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

## Data Model: `requests`

| Field | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| title | text | Required |
| request_text | text | Required |
| state | text | Two-letter code, required |
| target_agency | text | Required |
| date_sent | date | Required |
| deadline | date | Auto-calculated, not editable |
| status | text | Draft, Sent, Acknowledged, Fulfilled, Denied, Appealed (default: Draft) |
| created_at | timestamp | Generated |

## Deployment

Every push to `main` deploys to production on Netlify. Every pull request gets a deploy preview.

- **Production:** _TBD_
- **Preview:** generated per PR

## Contributing

- Work on a feature branch and merge to `main` through a pull request
- Add new states to the deadline lookup table with a cited primary source (see `docs/` for the statute research table)

## Team

| Name | Role |
|---|---|
| Reilly Wirtz | Project Manager & SCRUM Master |
| Nathan Gentala | Backend & Architecture |
| Angela Iweka | Frontend |
| Daniel Anderson | Correspondence & Data |
| Tommy Nguyen | QA & Documentation |

**Sponsor:** Samantha Clayton, Web and Research Director, KARA
