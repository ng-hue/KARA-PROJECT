"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getRequest } from "@/lib/requests";
import { formatDate } from "@/lib/format";
import {
  DEADLINE_FOOTNOTE,
  NOT_SUPPORTED_LABEL,
  calendarDaysBetween,
  deadlineLabel,
  getDeadlineInfo,
} from "@/lib/deadlines";
import { FLAGGABLE_STATUSES, getRequestFlag, localToday } from "@/lib/deadlineFlags";
import StatusBadge from "@/components/StatusBadge";
import FlagBadge from "@/components/FlagBadge";
import StatusHistoryPanel from "@/components/StatusHistoryPanel";

function Field({ label, children }) {
  return (
    <div>
      <dt className="text-gray-500">{label}</dt>
      <dd className="mt-1">{children}</dd>
    </div>
  );
}

// Deadline and flag come from the same shared helpers as the list page
// (SCRUM-183, risk R7), so the two pages always agree.
function deadlineFor(request) {
  return request.status === "Draft" ? null : getDeadlineInfo(request.state, request.date_sent);
}

function DeadlineValue({ request, info }) {
  if (!info) return <span className="text-gray-500">Not sent</span>;
  if (info.kind === "unsupported") return <span className="text-gray-500">{NOT_SUPPORTED_LABEL}</span>;
  if (!info.date) return <span className="text-gray-500">Not reported</span>;
  return (
    <span title={deadlineLabel(request.state)}>
      {info.kind === "estimated" ? "Est. " : ""}
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

function DeadlineSummary({ request }) {
  const info = deadlineFor(request);

  if (!info?.date) {
    return (
      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 text-sm">
        <h2 className="text-gray-500">Deadline Summary</h2>
        <p className="mt-1 text-gray-500"><DeadlineValue request={request} info={info} /></p>
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
  // Fulfilled, Denied and Appealed requests are closed, so no countdown.
  const open = FLAGGABLE_STATUSES.includes(request.status);

  return (
    <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 text-sm">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-gray-500">Deadline Summary</h2>
        <FlagBadge flag={flag} />
      </div>
      {open ? (
        <p className={`mt-1 text-lg font-semibold ${flag?.key === "overdue" ? "text-red-700" : ""}`}>
          {deadlineLine(days)}
        </p>
      ) : null}
      <dl className="mt-4 grid grid-cols-2 gap-4">
        <Field label="Deadline"><DeadlineValue request={request} info={info} /></Field>
        {open ? <Field label="Days Remaining">{days}</Field> : null}
      </dl>
      <p className="mt-4 text-xs text-gray-600">{DEADLINE_FOOTNOTE}</p>
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
      <div className="flex gap-4">
        <Link href="/requests" className="text-sm text-[#007a72] underline">
          Back to all requests
        </Link>
        <Link href={`/requests/${id}/edit`} className="text-sm text-[#007a72] underline">
          Edit request
        </Link>
      </div>

      {error ? (
        <p className="mt-4 rounded-md bg-red-50 p-4 text-red-800">
          Could not load request: {error}
        </p>
      ) : !request ? (
        <p className="mt-4 text-gray-600">Loading request...</p>
      ) : (
        <>
          <div className="mb-6 mt-4 flex flex-wrap items-start justify-between gap-4">
            <h1 className="text-2xl font-semibold">{request.title}</h1>
            <StatusBadge status={request.status} />
          </div>

          <DeadlineSummary request={request} />

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
              <Field label="State">{request.state}</Field>
              <Field label="Target Agency">{request.target_agency}</Field>
              <Field label="Date Sent">{formatDate(request.date_sent)}</Field>
              <Field label="Deadline">
                <DeadlineValue request={request} info={deadlineFor(request)} />
              </Field>
              <Field label="Created">{formatDate(request.created_at)}</Field>
              <Field label="Request ID">
                <span className="break-all font-mono text-xs">{request.id}</span>
              </Field>
            </dl>

            <div className="mt-6 border-t border-gray-100 pt-4 text-sm">
              <h2 className="text-gray-500">Request Text</h2>
              <p className="mt-1 whitespace-pre-wrap">{request.request_text}</p>
            </div>
          </div>

          <div className="mt-6">
            <StatusHistoryPanel
              requestId={request.id}
              currentStatus={request.status}
              onStatusChanged={(newStatus) =>
                setRequest((current) => ({
                  ...current,
                  status: newStatus,
                }))
              }
            />
          </div>
        </>
      )}
    </div>
  );
}
