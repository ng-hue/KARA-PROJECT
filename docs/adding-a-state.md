# Adding a State

KARA x Seeds of Success | KARA Public Records Request Tracker | US4
Status: Draft for sponsor review

Every state not listed in `STATE_DEADLINE_RULES` (`lib/deadlines.js`) shows "State Not Supported Yet". Follow these steps to add one.

## 1. Get the rule from the sponsor

The team does not research state law (Sprint 5, S5 US7). The sponsor supplies each state's rule in writing, in the fields below, and the rule is entered exactly as written. If a rule does not fit these fields, tell the sponsor what is missing instead of filling it in. Each rule has:

| Field | What to record |
|---|---|
| statuteName | Name of the public records law and its chapter |
| citation | The exact section that sets response timing |
| sourceUrl | An https link to that section on the official legislature site |
| deadlineType | `fixed` if the statute sets a number of days; `prompt` if it says "promptly," "reasonable time," or similar; `none` if it sets no timing at all |
| days, dayType | Only for `fixed`. dayType is `calendar` or `business` |
| measures | What must happen by the deadline: `acknowledgment`, `determination` (a decision on disclosure), or `production` (records released) |
| extension | Any extension the statute lets the agency take, or null |
| statutoryLanguage | For `prompt` states, the statute's own words |

Do not guess a number of days.

## 2. Add the rule

1. Add the state to `STATE_DEADLINE_RULES` in `lib/deadlines.js`.
2. Add the state to `STATES` in `lib/constants.js` so it appears on the New Request form. A test fails if the two lists differ.

A `prompt` or `none` state shows "No statutory deadline", stores no date, and is never flagged.

## 3. Test

1. Add a test in `lib/deadlines.test.js` with a date sent that crosses a weekend and avoids holidays. Show the counted days in a comment.
2. Run `npm test`. The research table coverage tests check the new rule's citation, source link and shape.

## 4. Review

Open a pull request. Deadline rule changes need sponsor review before merging, and the statutory rules need legal review before they are relied on for actual requests.
