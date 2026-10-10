# QA-001: Missing statutory deadlines for all five supported states

**Project:** KARA Public Records Request Tracker  
**Sprint:** 2  
**Related story:** US4 — Automatic statutory deadline  
**Assigned team owner (backlog):** Daniel Anderson  
**Severity:** High  
**Status:** Open  
**Discovered:** October 9, 2026

## Summary
During manual testing of the live Netlify application, new fictional requests were saved successfully for Arizona, California, Texas, Maine, and Minnesota, but the `deadline` field remained `NULL` or blank in Supabase/request display. All five state-specific QA tests failed (TC-12–TC-16).

## How to reproduce
1. Go to https://kara-public-records-tracker.netlify.app/requests/new.
2. Enter fictional required values and set `date_sent` to October 5, 2026.
3. Select AZ, CA, TX, ME, or MN, one state per submission.
4. Submit; inspect the request in the list and in the Supabase `requests` table.

**Expected:** A calculated and saved deadline according to the approved statutory table for each state.  
**Actual:** `deadline` is `NULL` or blank for each state.

## Impact
Core Sprint 2 deadline functionality is not operational in production. These cases must not be marked as passed until corrected and retested.

## Follow-up
- Review state lookup rules, calculation logic, and form-to-database insert mapping.
- Confirm expected dates using the team's documented statute citations before testing correctness.
- Add unit tests for all five states and redeploy after a reviewed fix.
- QA retests TC-12–TC-16 and updates the dated result log.

**Evidence:** Tester-reported results on October 9; attach screenshots/record IDs when available.
