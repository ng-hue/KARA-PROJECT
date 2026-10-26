# KARA Public Records Request Tracker — Sprint 2 Manual Test Checklist

**Tester:** Tommy Nguyen  
**Execution date:** October 9, 2026 (tester-reported)  
**Environment:** Netlify production — https://kara-public-records-tracker.netlify.app  
**Database:** Supabase `public.requests`  
**Data policy:** Fictional test data only; no real child welfare records, names, or correspondence.

## Execution summary

| Metric | Result |
|---|---:|
| Total executed | 17 |
| Passed | 12 |
| Failed | 5 |
| Not run | 0 |
| Pass rate | 70.6% |

**Overall:** Checklist execution is complete, but Sprint 2 acceptance criteria are **not fully met**: statutory deadlines are missing for all five supported states. Results below reflect the tester's reports during the October 9 QA session; they are not an independent automated verification.

## Test results

| ID | Area | Test performed | Expected result | Actual result / evidence reported | Status | Date |
|---|---|---|---|---|---|---|
| TC-01 | Form | Open New Request page | Required fields display | Tester confirmed fields displayed | **PASS** | 2026-10-09 |
| TC-02 | Form | Submit valid fictional request | Exactly one Supabase row; confirmation within 2 seconds | Tester confirmed expected behavior | **PASS** | 2026-10-09 |
| TC-03 | Validation | Submit with empty title | Error; no row created | Tester confirmed submission blocked | **PASS** | 2026-10-09 |
| TC-04 | Validation | Submit with empty request text | Error; no row created | Tester confirmed submission blocked | **PASS** | 2026-10-09 |
| TC-05 | Validation | Submit with empty target agency | Error; no row created | Tester confirmed submission blocked | **PASS** | 2026-10-09 |
| TC-06 | Validation | Submit without date sent | Error; no row created | Tester confirmed submission blocked | **PASS** | 2026-10-09 |
| TC-07 | Form | Submit without changing status | Status defaults to `Draft` | Tester confirmed `Draft` status | **PASS** | 2026-10-09 |
| TC-08 | List | Compare request list with Supabase | Stored records and relevant columns display | Tester confirmed records display | **PASS** | 2026-10-09 |
| TC-09 | List | Check Date Sent ordering | Newest `date_sent` first | Tester confirmed descending ordering | **PASS** | 2026-10-09 |
| TC-10 | List | Submit request and navigate to list | New request appears without manual browser/database refresh | Tester confirmed request appeared | **PASS** | 2026-10-09 |
| TC-11 | List | Compare badges to Supabase status values | Status badges match stored values | Tester confirmed correct badges | **PASS** | 2026-10-09 |
| TC-12 | Deadline | Submit Arizona (AZ) request dated Oct 5 | Deadline matches team's approved AZ statute table | `deadline` is NULL or blank | **FAIL** | 2026-10-09 |
| TC-13 | Deadline | Submit California (CA) request dated Oct 5 | Deadline matches team's approved CA statute table | `deadline` is NULL or blank | **FAIL** | 2026-10-09 |
| TC-14 | Deadline | Submit Texas (TX) request dated Oct 5 | Deadline matches team's approved TX statute table | `deadline` is NULL or blank | **FAIL** | 2026-10-09 |
| TC-15 | Deadline | Submit Maine (ME) request dated Oct 5 | Deadline matches team's approved ME statute table | `deadline` is NULL or blank | **FAIL** | 2026-10-09 |
| TC-16 | Deadline | Submit Minnesota (MN) request dated Oct 5 | Deadline matches team's approved MN statute table | `deadline` is NULL or blank | **FAIL** | 2026-10-09 |
| TC-17 | Responsive | Open form at 375px viewport | Fields and Submit accessible, no horizontal scroll | Tester confirmed expected mobile behavior | **PASS** | 2026-10-09 |

## Defect QA-001 — Missing statutory deadlines for all five states

**Related story:** US4 — Automatic statutory deadline (E2)  
**Owner for triage:** Daniel Anderson (per Sprint 2 backlog)  
**Severity:** High — blocks a core sprint goal  
**Affected tests:** TC-12, TC-13, TC-14, TC-15, TC-16  
**Status:** Partially addressed in later retest — see retest addendum below

**Reproduction:**
1. Visit the deployed Netlify New Request form.
2. Enter fictional title, request text, and agency; choose AZ, CA, TX, ME, or MN; set Date Sent to October 5, 2026.
3. Submit and inspect the new request in the list and Supabase `public.requests`.

**Expected:** App computes and persists a deadline consistent with the team's researched statutory lookup table for the selected state.

**Actual:** The request is created, but its `deadline` is `NULL` or blank for each of the five states.

**Impact:** Staff cannot use the deadline field to determine response due dates; the Sprint 2 deadline acceptance criterion remains unmet. Exact expected dates should be confirmed against the approved statutory table; they are not asserted here.

**Suggested follow-up:** Developer verifies the state lookup, `calculateDeadline` implementation, form submission mapping, and Supabase insert; adds/updates state-specific unit tests; redeploys. QA then reruns TC-12–TC-16 and records retest dates/results. Do not mark them passed until observed.

## Sprint 2 sign-off / next actions

- [x] Executed all 17 manual cases on or after October 8.
- [x] Recorded a date and Pass/Fail for every case.
- [x] Documented five failures under one consolidated defect.
- [ ] Raise/link QA-001 in Jira and notify the US4 owner.
- [x] Retest TC-12–TC-16 against updated testing deployment (see addendum).
- [ ] Verify Arizona/Minnesota user-facing labels and primary-source statutory interpretation; close or narrow QA-001 after team review.
- [ ] Have a teammate review this checklist and README setup instructions.
- [ ] Complete separate US6 tests for GitHub `main` production auto-deploy and PR preview (not covered by the 17 functional tests).

**Evidence note:** No screenshot URLs, request IDs, or timestamps were provided for individual cases. Attach them to the Jira issue when available rather than inventing them.


---

## Retest addendum — updated Netlify testing deployment

**Retest recorded:** October 11, 2026 (conversation date; confirm exact execution date before final Jira submission)  
**Environment:** Manual deployment of `feature/tommy` to https://kara-public-records-tracker.netlify.app  
**Build:** Next.js 16.4.0; Daniel's `lib/deadlines.js` changes incorporated  
**Evidence:** Tester reports and California request-list screenshot; Maine/Texas/AZ/MN results reported verbally in chat.  
**Important:** This is a distinct manual testing site, not necessarily the team's GitHub-connected production Netlify project.

| Original test | State | Date sent | Expected per implemented rules | Retest observation | Assessment |
|---|---|---|---|---|---|
| TC-12 | AZ | 2026-10-05 | `null` (no fixed numerical deadline; promptly) | Pending research / blank | **Calculation behavior consistent; UI label needs clarification** |
| TC-13 | CA | 2026-10-05 | 2026-10-15 (10 calendar days) | 2026-10-15 on request list | **PASS** |
| TC-14 | TX | 2026-10-05 | 2026-10-19 (10 business days excluding weekends) | 2026-10-19 reported | **PASS** |
| TC-15 | ME | 2026-10-05 | 2026-10-12 (5 business days excluding weekends) | 2026-10-12 reported | **PASS** |
| TC-16 | MN | 2026-10-05 | `null` (no fixed numerical deadline; promptly) | Pending research / blank | **Calculation behavior consistent; UI label needs clarification** |

**Retest summary:** 3 unequivocal passes (CA, TX, ME); 2 conditional/UX follow-ups (AZ, MN); no observed mismatches with the current numerical calculation rules. Dates here are software expectations from the implemented unit-tested rules, **not independent legal validation**. For AZ/MN, `null` is appropriate to the coded no-fixed-date rules, but showing **Pending research** conflates a deliberate nonnumeric outcome with an unimplemented rule.

**QA-001 disposition:** Partially fixed. Numeric deadline generation appears corrected for CA, TX, and ME in the updated test deployment. Do **not** erase original October 9 failures or claim the full statutory deadline feature is complete. Have the US4 owner confirm the legal source table and clarify the AZ/MN UI; retest on the team's official deployment after the reviewed changes reach `main`. Existing database rows with NULL deadlines are not automatically backfilled by new request-submission logic.


---

## Sprint 3 test checklist (US7, SCRUM-164)

**Owner:** Daniel Anderson
**Scheduled run:** on the live site before the October 28 demo (SCRUM-187)
**Environment:** Netlify production, https://kprsite.netlify.app, after the repository transfer in US1
**Database:** shared Supabase project, `public.requests` and `public.status_history`
**Data policy:** fictional test data only; no real child welfare records, names, or correspondence.

### Before you start

1. Run `npm run seed:supabase` from `main` the same day. Seeded deadlines are relative to the day the seed runs, so the due-soon rows drift into overdue if the seed is older than a few days.
2. Ask the team whether any older hand-entered test requests in the shared database are Sent or Acknowledged and past their deadline. Those rows also carry the Overdue badge and change the US6 counts. Record them in the Notes column rather than deleting them.
3. Have the sponsor account and one team account ready (US2). Never write passwords in this file or in Jira.

### How to record results

- **Status:** PASS, FAIL, or NOT RUN. Do not mark a case PASS unless you observed it.
- **Date:** the date you ran the case.
- **Jira bug:** every FAIL gets a Jira bug linked to its user story. Put the key here, for example SCRUM-200.
- **Actual result:** what you saw, in a few words. Attach screenshots to the Jira bug, not to this file.

### Execution summary

| Metric | Result |
|---|---:|
| Total cases | 27 |
| Passed | |
| Failed | |
| Not run | 27 |

### US1: Repository in the KARA GitHub organization (SCRUM-158, Nathan)

| ID | Test performed | Expected result | Actual result | Status | Date | Jira bug |
|---|---|---|---|---|---|---|
| TC-18 | Push a one-line README change to `main` in the organization repository. Watch Netlify. | Netlify shows a successful production deploy within 10 minutes of the push. | | NOT RUN | | |
| TC-19 | After TC-18, open the live URL. | The live site reflects the README change's deploy (new deploy ID or timestamp in Netlify). | | NOT RUN | | |
| TC-20 | Open the old repository URL, https://github.com/ng-hue/KARA-PROJECT. | It redirects to the repository in the KARA organization. | | NOT RUN | | |
| TC-21 | Open a pull request in the organization repository. | Netlify posts a deploy preview on the pull request. | | NOT RUN | | |

### US2: Sign in before creating or changing a request (SCRUM-159, Nathan)

| ID | Test performed | Expected result | Actual result | Status | Date | Jira bug |
|---|---|---|---|---|---|---|
| TC-22 | In a private window with no session, open `/requests`, `/requests/new`, and a request detail page. | Every route other than `/login` redirects to `/login`. | | NOT RUN | | |
| TC-23 | With no session, send a direct POST with the anon key to the `requests` table (Supabase REST API). | The request is rejected with 401 or 403. No row is created. | | NOT RUN | | |
| TC-24 | Sign in with the sponsor account. | User lands on the request list. | | NOT RUN | | |
| TC-25 | While signed in, create a fictional request. | The request appears in the list. | | NOT RUN | | |
| TC-26 | Sign out, then open `/requests` again. | The list is not reachable; the browser is redirected to `/login`. | | NOT RUN | | |
| TC-27 | After row level security is enabled, run `npm run seed:supabase`. | The seed still succeeds with the service role key and reports 10 rows. | | NOT RUN | | |

### US3: Request detail page (SCRUM-160, Angela)

Use three seeded requests with status Sent or Acknowledged, one from each of CA, ME, and TX. Closed requests (Fulfilled, Denied, Appealed) show no countdown by design.

| ID | Test performed | Expected result | Actual result | Status | Date | Jira bug |
|---|---|---|---|---|---|---|
| TC-28 | From the list, click a request title. | The detail page for that request opens. It has a back link to the list. | | NOT RUN | | |
| TC-29 | Compare the detail page with the same row in Supabase Table Editor. | All nine fields render (title, request text, state, target agency, date sent, deadline, status, created, request ID) and match the database row. | | NOT RUN | | |
| TC-30 | For each of the three requests, count the days from today to the deadline on a calendar. | Days Remaining equals deadline minus today's date for all three. The summary line reads "Due in N days" or "N days overdue" to match. | | NOT RUN | | |
| TC-31 | Open a seeded Fulfilled request whose deadline has passed. | No "days overdue" line and no Overdue badge (matches the list, risk R7). | | NOT RUN | | |

### US4: Edit a request after it is created (SCRUM-161, Angela)

| ID | Test performed | Expected result | Actual result | Status | Date | Jira bug |
|---|---|---|---|---|---|---|
| TC-32 | Note the request count in the list. Open a seeded CA request (10 calendar days), edit it, change the state to TX (10 business days), and save. | The detail page deadline changes to date sent plus 10 business days. | | NOT RUN | | |
| TC-33 | Return to the list. | The request count is unchanged. No duplicate row appears. | | NOT RUN | | |
| TC-34 | Open the edit form. | Deadline is read-only. Status is not editable on this form. | | NOT RUN | | |
| TC-35 | Check the edited row in Supabase. | `updated_at` is set to the time of the save. | | NOT RUN | | |

### US5: Status changes with a dated history (SCRUM-162, Tommy)

| ID | Test performed | Expected result | Actual result | Status | Date | Jira bug |
|---|---|---|---|---|---|---|
| TC-36 | Open the seeded Draft request. Change status to Sent with no note. Then change to Acknowledged with the note "Agency acknowledged by email". | The detail page shows 2 history rows plus the "Request created" row, newest first, with the note on the Acknowledged row only. | | NOT RUN | | |
| TC-37 | On a Sent request, open the status control. | It offers Acknowledged, Fulfilled, and Denied. It never offers Draft or Appealed. | | NOT RUN | | |
| TC-38 | On a Fulfilled request, open the status control. | No further status changes are offered. | | NOT RUN | | |
| TC-39 | In Supabase, check `status_history` for each of the 10 seeded requests (risk R4). | Every seeded request has at least one history row. | | NOT RUN | | |

### US6: Overdue and due-soon flags on the list (SCRUM-163, Daniel)

| ID | Test performed | Expected result | Actual result | Status | Date | Jira bug |
|---|---|---|---|---|---|---|
| TC-40 | Open `/requests` after seeding. | Exactly the 3 seeded overdue rows carry the Overdue badge. Exactly the 3 seeded due-soon rows carry the Due Soon badge. None of the 3 fulfilled-past-deadline rows carries either. | | NOT RUN | | |
| TC-41 | Select the Overdue filter. | The list shows 3 rows. | | NOT RUN | | |
| TC-42 | With the Overdue filter and the Sent status filter selected, refresh the page. | Both filters are still applied after the refresh, and the URL contains them. | | NOT RUN | | |
| TC-43 | Clear the filters and check the order. | Overdue rows come first, then the rest by deadline (earliest first). Draft rows are last. | | NOT RUN | | |
| TC-44 | Open one overdue request and one due-soon request from the list. | The detail page shows the same badge as the list row (risk R7). | | NOT RUN | | |

### Sign-off

- [ ] Seed run on the day of testing, with the date recorded above.
- [ ] Every case TC-18 to TC-44 has PASS or FAIL and a date.
- [ ] Every FAIL has a linked Jira bug.
- [ ] Execution summary updated.
- [ ] A teammate reviewed the results.
