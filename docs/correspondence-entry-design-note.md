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
