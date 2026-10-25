# Risk Register

Each risk has a watch owner, a warning sign, and a planned response.

Likelihood / Impact is rated Low, Medium, or High.

| ID | Risk | Likelihood / Impact | Watch owner | Warning sign | Planned response | Owner confirmed |
|----|------|---------------------|-------------|--------------|------------------|-----------------|
| R1 | Repository transfer breaks the Netlify deploy | Medium / High | Nathan (US1, SCRUM-158) | No successful production deploy by end of day Oct 12 | Relink Netlify the same day. If still broken Tuesday, tell the sponsor. Do not work around it with a second site. | [ yes ] |
| R2 | Row level security blocks the app itself | High / Medium | Nathan (US2, SCRUM-159) | App returns empty lists or errors after RLS is enabled | Write policies first, test with the anon key and a signed-in session before merging. Seed script stays on the service role key. | [ yes ] |
| R3 | Team locked out of its own deployed app | Low / High | Nathan (US2, SCRUM-159) | Any teammate or the sponsor cannot sign in | Sponsor plus five team accounts created in US2. Supabase dashboard password reset is the fallback. No credentials in the repository. | [ yes ] |
| R4 | Status history backfill on seeded rows is skipped | Medium / Low | Tommy (US5, SCRUM-162) | Any seeded request shows zero history rows | Backfill is a US5 task. The US7 checklist verifies every seeded request has at least one history row. | [yes ] |
| R5 | Exam week cuts coding time | Medium / Medium | Reilly | A teammate's exam overlaps a task due date | Collect exam dates at planning. Move tasks earlier or later. Do not extend scope; drop stories to the product backlog instead. | [yes ] |
| R6 | Roles and permissions get pulled in with auth | Medium / Medium | Nathan (US2, SCRUM-159) | Anyone starts a roles table or permission check | Roles are out of scope. Stop and move the work to the product backlog. | [yes ] |
| R7 | Status rules implemented in two places and drift | Medium / Medium | Tommy (US5) and Daniel (US6, SCRUM-163) | List and detail page disagree on a status option or a badge | Transition and overdue rules each live in one shared helper used by both pages. | [ yes] |

## Owner confirmation

Tick the box in the last column once the person has confirmed they will watch that risk.

| Person | Risks | Confirmed on |
|--------|-------|--------------|
| Nathan | R1, R2, R3, R6 Yes
| Tommy | R4, R7 Yes
| Daniel | R7 Yes
| Reilly | R5 Yes
