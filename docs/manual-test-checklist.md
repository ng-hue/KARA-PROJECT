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
**Status:** Open / awaiting fix

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
- [ ] Resolve and retest TC-12–TC-16.
- [ ] Have a teammate review this checklist and README setup instructions.
- [ ] Complete separate US6 tests for GitHub `main` production auto-deploy and PR preview (not covered by the 17 functional tests).

**Evidence note:** No screenshot URLs, request IDs, or timestamps were provided for individual cases. Attach them to the Jira issue when available rather than inventing them.
