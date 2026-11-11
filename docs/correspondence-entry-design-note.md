# Correspondence Entry Design Note

KARA x Seeds of Success | KARA Public Records Request Tracker | US5, EPIC E3 Correspondence and Response Storage
Author: Daniel Anderson | Date: 10/10/2026 | Status: Draft for sponsor review

## Purpose

A correspondence entry is one letter, email, or response file exchanged with an agency about a single public records request. Every message in either direction gets its own entry, so each request carries a complete, dated history of contact with the agency. This note defines the entry so Sprint 3 can build it without a planning delay.

## Fields

| Field | Display Label | Type | Required | Definition |
|---|---|---|---|---|
| id | ID | uuid | Yes | A generated identifier that uniquely names one correspondence entry. |
| request_id | Request | uuid | Yes | The request this entry belongs to. Every entry belongs to exactly one request. |
| direction | Direction | text | Yes | Which way the message traveled. One of two values, listed below. |
| correspondence_date | Date | date | Yes | The date the message was sent or received, as shown on the message itself, not the date it was entered. Shown as MM/DD/YYYY. |
| sender | Sender | text | Yes | The person or office that sent the message, as written on it. Example: "Public Information Officer, Arizona Department of Child Safety." |
| summary | Summary | text | Yes | One to three sentences describing what the message says or asks. Example: "Agency acknowledged the request and estimated a response by 11/15/2026." |
| attachment_ref | Attachment | text | No | A reference to where the message or its file is stored, such as a file name or link. It points to the file; it does not hold the file. |
| created_at | Entered On | timestamp | Yes | Generated when the entry is saved. |

**Direction values**

| Value | Display Label | Definition |
|---|---|---|
| outgoing | Outgoing | A message KARA sent to the agency, such as the original request, a follow-up, or a clarification. |
| incoming | Incoming | A message the agency sent to KARA, such as an acknowledgment, an extension notice, a denial, or a records release. |

## How It Links to a Request

Each request has many correspondence entries; each entry has one request. The link is the `request_id` foreign key to `requests.id`, indexed for fast lookup, with ON DELETE CASCADE because an entry has no meaning without its request. The request detail page lists its entries newest first.

The original request text stays on the request record. Logging the first outgoing message as an entry as well gives the history a clear starting point.

## Data Rule

Seeded fake data only this semester. Summaries never name or describe an individual child, family, or case, in line with the project's aggregate, de-identified data rule. No real agency correspondence enters the tool.

## Open Questions for the Sponsor

1. **Should an entry record what kind of message it is?** Adding a message type (Acknowledgment, Extension Notice, Agency Estimate, Denial, Records Produced) would let incoming correspondence update the request's status and deadline automatically, instead of staff changing them by hand. It adds one required pick list to every entry.
2. **Where should attachments live?** Options are Supabase Storage inside this app, or links to files kept in KARA's Google Drive. This decides what `attachment_ref` holds and whether file upload belongs in Sprint 3.

## Before Build

Check the field names above against the Master Fields List so they line up with KARA ELLA ahead of the spring integration.

## Master Fields List Check (SCRUM-208)

**Status:** Complete, 11/11/2026. Checked against the KARA x SoS Master Fields List v9.8 (live Google Sheet, last edited 11/03/2026), Module Field Schema Registry and Pick List Reference tabs.

**Result:** None of these fields are in the Master Fields List. The list has no entry for this tool at all: no module, no correspondence fields, and no pick lists. Nothing needs to be renamed. Instead, the fields need to be registered in the Master Fields List by Jarred VanHorn, who owns it.

Sprint 4 adds one field the note above does not list: `created_by`, the signed-in user who saved the entry, to match `status_history.changed_by` (SCRUM-209).

| Field (this note) | Type | Master Fields List name | Matches? | Rename or notes |
|---|---|---|---|---|
| id | uuid | Not in list | No, not registered | No rename. Register. |
| request_id | uuid | Not in list | No, not registered | No rename. Register. |
| direction | text (outgoing, incoming) | Not in list | No, not registered | No rename. Register the field and both values (Outgoing, Incoming). |
| correspondence_date | date | Not in list | No, not registered | No rename. Register. |
| sender | text | Not in list | No, not registered | No rename. Register. |
| summary | text | Not in list | No, not registered | No rename. Register. Proposed 600 character cap still awaits sponsor sign-off. |
| attachment_ref | text | Not in list | No, not registered | No rename. Register. |
| created_by | uuid | Not in list | No, not registered | No rename. Register. |
| created_at | timestamptz | Not in list | No, not registered | No rename. Register. |

**Fields the Master Fields List requires that this note does not have:** None. The list has no correspondence entry to compare against.

**Related findings for the sponsor**

1. Message type (open question 1): the Master Fields List already has contact type pick lists on other databases (Email, Phone, LinkedIn, In-Person Meeting, Video Call, Text Message, Event, Other). None of them includes Letter. If a message type is added, the sponsor decides whether to reuse one of those lists with Letter added, or approve a new list.
2. Request Status: the EIM Field Inventory & Data Tracking workbook tracks the same public records requests with a different status list (Draft, Ready to Submit, Submitted, Fulfilled, Partially Fulfilled, Denied, Withdrawn). This tool uses Draft, Sent, Acknowledged, Fulfilled, Denied, Appealed. The sponsor decides whether the two should match before either is registered.
3. Registration needs a module ID and a field ID prefix for this tool. Both are Jarred VanHorn's decision.

**Next step:** send the Fields table above to the sponsor and Jarred VanHorn for registration. Keep the current names until registration is confirmed.