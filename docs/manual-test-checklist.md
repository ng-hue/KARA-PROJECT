# KARA Public Records Request Tracker
## Sprint 2 — Manual Test Checklist

**Tester:** Tommy Nguyen  
**Sprint:** Sprint 2  
**Application:** KARA Public Records Request Tracker  
**Test Environment:** Netlify Production  
**Website:** https://kara-public-records-tracker.netlify.app  
**Test Date:** To be completed during execution  
**Test Data:** Fictional requests only

---

## 1. Purpose

This checklist verifies the functionality of the KARA Public Records Request Tracker for Sprint 2, including request creation, input validation, request listing, statutory deadline calculations, and responsive design.

All testing must use fictional records. No real child welfare information, personal information, or agency correspondence should be entered into the application.

## 2. Test Cases

### Request Form and Submission

| ID | Test Case | Expected Result | Status |
|---|---|---|---|
| TC-01 | Open the New Request page | Required form fields are displayed | Not Run |
| TC-02 | Submit a valid fictional request | Exactly one record is created in Supabase; confirmation appears within 2 seconds | Not Run |
| TC-03 | Submit with an empty title | Validation error appears; no record is created | Not Run |
| TC-04 | Submit with empty request text | Validation error appears; no record is created | Not Run |
| TC-05 | Submit with an empty target agency | Validation error appears; no record is created | Not Run |
| TC-06 | Submit without a date sent | Validation error appears; no record is created | Not Run |
| TC-07 | Create a request without changing status | Status defaults to Draft | Not Run |

### Request List

| ID | Test Case | Expected Result | Status |
|---|---|---|---|
| TC-08 | Open the request list | Records stored in Supabase are displayed with required columns | Not Run |
| TC-09 | Check request sorting | Requests appear with the newest date sent first | Not Run |
| TC-10 | Submit a new request and return to the list | Newly created request appears without manually refreshing the database | Not Run |
| TC-11 | Check status badges | Each displayed status matches the stored record | Not Run |

### Statutory Deadline Calculations

| ID | Test Case | Expected Result | Status |
|---|---|---|---|
| TC-12 | Create an Arizona request | Calculated deadline matches the approved Arizona statutory rule | Not Run |
| TC-13 | Create a California request | Calculated deadline matches the approved California statutory rule | Not Run |
| TC-14 | Create a Texas request | Calculated deadline matches the approved Texas statutory rule | Not Run |
| TC-15 | Create a Maine request | Calculated deadline matches the approved Maine statutory rule | Not Run |
| TC-16 | Create a Minnesota request | Calculated deadline matches the approved Minnesota statutory rule | Not Run |

**Note:** Expected deadlines must be checked against the team's documented statutory lookup table. Do not assume every state uses the same number of calendar or business days.

### Responsive Design

| ID | Test Case | Expected Result | Status |
|---|---|---|---|
| TC-17 | Open the New Request form at 375px screen width | All fields and the submit button are accessible without horizontal scrolling | Not Run |

---

## 3. Test Execution Results

Complete this section when executing the checklist against the deployed Netlify website.

| Test ID | Date Executed | Result (Pass/Fail) | Notes / Evidence |
|---|---|---|---|
| TC-01 | — | Not Run | — |
| TC-02 | — | Not Run | — |
| TC-03 | — | Not Run | — |
| TC-04 | — | Not Run | — |
| TC-05 | — | Not Run | — |
| TC-06 | — | Not Run | — |
| TC-07 | — | Not Run | — |
| TC-08 | — | Not Run | — |
| TC-09 | — | Not Run | — |
| TC-10 | — | Not Run | — |
| TC-11 | — | Not Run | — |
| TC-12 | — | Not Run | — |
| TC-13 | — | Not Run | — |
| TC-14 | — | Not Run | — |
| TC-15 | — | Not Run | — |
| TC-16 | — | Not Run | — |
| TC-17 | — | Not Run | — |

## 4. Test Summary

**Total Test Cases:** 17  
**Passed:** Pending  
**Failed:** Pending  
**Not Run:** 17

**Overall Result:** Pending execution

**Known Issues:** Record any bugs, unexpected behavior, or missing functionality discovered during testing.

## 5. Acceptance Criteria

Sprint 2 testing is considered complete when:

- All 17 test cases have been executed against the deployed Netlify application.
- Each case has a test date and a recorded Pass or Fail result.
- Failed tests include a description of the observed behavior.
- The results are committed to the team GitHub repository.
- All data used for testing is fictional.

---

**Prepared by:** Tommy Nguyen  
**Project:** KARA Public Records Request Tracker  
**Sprint:** 2