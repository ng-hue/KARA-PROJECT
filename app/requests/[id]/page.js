"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getRequest, missingSentFields } from "@/lib/requests";
import { formatDate } from "@/lib/format";
import { REQUEST_TYPES, SEND_METHODS, STATES } from "@/lib/constants";
import {
  DEADLINE_FOOTNOTE,
  NOT_SUPPORTED_LABEL,
  NO_STATUTORY_DEADLINE_LABEL,
  calendarDaysBetween,
  deadlineLabel,
  getDeadlineInfo,
} from "@/lib/deadlines";
import { FLAGGABLE_STATUSES, getRequestFlag, localToday } from "@/lib/deadlineFlags";
import StatusBadge from "@/components/StatusBadge";
import FlagBadge from "@/components/FlagBadge";
import StatusHistoryPanel from "@/components/StatusHistoryPanel";
import CorrespondenceSection from "@/components/CorrespondenceSection";

function Field({ label, children }) {
  return (
    <div className="flex justify-between gap-4 py-2 first:pt-0 last:pb-0">
      <dt className="text-gray-500">{label}</dt>
      <dd className="text-right">{children}</dd>
    </div>
  );
}

function stateName(code) {
  return STATES.find((s) => s.code === code)?.name || code;
}

function labelFor(list, value) {
  return list.find((item) => item.value === value)?.label;
}

function Recorded({ value }) {
  if (!value) return <span className="text-gray-500">Not recorded</span>;
  return value;
}

function sentFieldsProblem(request, nextStatus) {
  if (nextStatus !== "Sent") return "";
  const missing = Object.keys(missingSentFields(request)).map((key) => key.replace("_", " "));
  if (missing.length === 0) return "";
  return `Before moving this request to Sent, edit it to add: ${missing.join(", ")}.`;
}

// Deadline and flag come from the same shared helpers as the list page
// (SCRUM-183, risk R7), so the two pages always agree.
function deadlineFor(request) {
  return request.status === "Drafted"
  ? null
  : getDeadlineInfo(request.state, request.date_sent);
}

function DeadlineValue({ request, info }) {
  if (!info) return <span className="text-gray-500">Not sent</span>;
  if (info.kind === "unsupported") return <span className="text-gray-500">{NOT_SUPPORTED_LABEL}</span>;
  if (info.kind === "none") return <span className="text-gray-500">{NO_STATUTORY_DEADLINE_LABEL}</span>;
  if (!info.date) return <span className="text-gray-500">Not reported</span>;
  return (
    <span title={deadlineLabel(request.state)}>
      {formatDate(info.date)}*
    </span>
  );
}

function deadlineLine(days) {
  if (days === 0) return "Due today";
  if (days > 0) return `Due in ${days} ${days === 1 ? "day" : "days"}`;
  const late = Math.abs(days);
  return `${late} ${late === 1 ? "day" : "days"} overdue`;
}

// Card tone follows the flag: red when overdue, amber when due soon.
const SUMMARY_TONE = {
  overdue: "border-red-200 bg-red-50",
  due_soon: "border-amber-200 bg-amber-50",
};

function DeadlineSummary({ request }) {
  const info = deadlineFor(request);

  if (!info?.date) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-5 text-sm">
        <h2 className="text-gray-500">Deadline</h2>
        <p className="mt-1 text-base font-medium"><DeadlineValue request={request} info={info} /></p>
      </div>
    );
  }

  const today = localToday();
  const days = calendarDaysBetween(today, info.date);
  const flag = getRequestFlag({
    state: request.state,
    status: request.status,
    dateSent: request.date_sent,
    today,
  });
  // Only Sent and Acknowledged requests are still waiting on the agency,
  // so closed requests get no countdown.
  const open = FLAGGABLE_STATUSES.includes(request.status);

  return (
    <div className={`rounded-lg border p-5 text-sm ${SUMMARY_TONE[flag?.key] || "border-gray-200 bg-white"}`}>
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-gray-600">Deadline</h2>
        <FlagBadge flag={flag} />
      </div>
      {open ? (
        <p className={`mt-1 text-2xl font-semibold ${flag?.key === "overdue" ? "text-red-700" : ""}`}>
          {deadlineLine(days)}
        </p>
      ) : null}
      <dl className="mt-3 divide-y divide-black/5">
        <Field label="Deadline"><DeadlineValue request={request} info={info} /></Field>
        {open ? <Field label="Days Remaining">{days}</Field> : null}
        <Field label="Rule">{deadlineLabel(request.state)}</Field>
      </dl>
      <p className="mt-3 text-xs text-gray-600">{DEADLINE_FOOTNOTE}</p>
    </div>
  );
}

export default function RequestDetailPage() {
  const { id } = useParams();
  const [request, setRequest] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getRequest(id)
      .then(setRequest)
      .catch((err) => setError(err.message));
  }, [id]);

  return (
    <div>
      <Link href="/requests" className="text-sm text-link hover:underline">
        &larr; All requests
      </Link>

      {error ? (
        <p className="mt-4 rounded-md bg-red-50 p-4 text-red-800">
          Could not load request: {error}
        </p>
      ) : !request ? (
        <p className="mt-4 text-gray-600">Loading request...</p>
      ) : (
        <>
          <div className="mb-6 mt-3 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold">{request.title}</h1>
              <p className="mt-1 text-sm text-gray-600">
                {request.target_agency}, {stateName(request.state)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={request.status} />
              <Link
                href={`/requests/${id}/edit`}
                className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium hover:bg-gray-50"
              >
                Edit request
              </Link>
            </div>
          </div>

          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
            {/* Side column comes first on small screens so the deadline is on top. */}
            <aside className="space-y-6 lg:order-2">
              <DeadlineSummary request={request} />

              <StatusHistoryPanel
                requestId={request.id}
                currentStatus={request.status}
                checkStatusChange={(next) => sentFieldsProblem(request, next)}
                onStatusChanged={(newStatus) =>
                  setRequest((current) => ({
                    ...current,
                    status: newStatus,
                  }))
                }
              />

              <div className="rounded-lg border border-gray-200 bg-white p-5 text-sm">
                <h2 className="mb-3 font-semibold">Details</h2>
                <dl className="divide-y divide-gray-100">
                  <Field label="State">{stateName(request.state)}</Field>
                  <Field label="Target Agency">{request.target_agency}</Field>
                  <Field label="Request Type">
                    <Recorded value={labelFor(REQUEST_TYPES, request.request_type)} />
                  </Field>
                  <Field label="Send Method">
                    <Recorded value={labelFor(SEND_METHODS, request.send_method)} />
                  </Field>
                  <Field label="Records Contact">
                    <Recorded value={request.records_contact} />
                  </Field>
                  <Field label="Date Sent">
                    {request.date_sent ? formatDate(request.date_sent) : <span className="text-gray-500">Not sent</span>}
                  </Field>
                  <Field label="Created">{formatDate(request.created_at)}</Field>
                </dl>
                <p className="mt-4 break-all font-mono text-xs text-gray-400">
                  ID {request.id}
                </p>
              </div>
            </aside>

            <div className="space-y-6 lg:order-1">
              <div className="rounded-lg border border-gray-200 bg-white p-6 text-sm">
                <h2 className="font-semibold">Request Text</h2>
                <p className="mt-2 whitespace-pre-wrap">{request.request_text}</p>

                <div className="mt-5 border-t border-gray-100 pt-4">
                  <h2 className="font-semibold">Deadline Rule</h2>
                  <p className="mt-2 whitespace-pre-wrap">
                    <Recorded value={request.deadline_rule} />
                  </p>
                </div>
              </div>

              <CorrespondenceSection requestId={request.id} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
