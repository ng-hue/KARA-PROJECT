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

Inserts 10 fake requests across multiple states and statuses:

```bash
npm run seed
```

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
