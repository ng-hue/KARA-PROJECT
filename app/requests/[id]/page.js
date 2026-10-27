"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getRequest } from "@/lib/requests";
import { formatDate } from "@/lib/format";
import StatusBadge from "@/components/StatusBadge";

function Field({ label, children }) {
  return (
    <div>
      <dt className="text-gray-500">{label}</dt>
      <dd className="mt-1">{children}</dd>
    </div>
  );
}

function daysRemaining(deadline) {
  const [y, m, d] = deadline.slice(0, 10).split("-").map(Number);
  const due = Date.UTC(y, m - 1, d);
  const now = new Date();
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((due - today) / 86400000);
}

function deadlineLine(days) {
  if (days === 0) return "Due today";
  if (days > 0) return `Due in ${days} ${days === 1 ? "day" : "days"}`;
  const late = Math.abs(days);
  return `${late} ${late === 1 ? "day" : "days"} overdue`;
}

function DeadlineSummary({ deadline }) {
  if (!deadline) {
    return (
      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 text-sm">
        <h2 className="text-gray-500">Deadline Summary</h2>
        <p className="mt-1 text-gray-500">Pending research</p>
      </div>
    );
  }

  const days = daysRemaining(deadline);
  const isPast = days < 0;

  return (
    <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 text-sm">
      <h2 className="text-gray-500">Deadline Summary</h2>
      <p className={`mt-1 text-lg font-semibold ${isPast ? "text-red-700" : ""}`}>
        {deadlineLine(days)}
      </p>
      <dl className="mt-4 grid grid-cols-2 gap-4">
        <Field label="Deadline">{formatDate(deadline)}</Field>
        <Field label="Days Remaining">{days}</Field>
      </dl>
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

          <DeadlineSummary deadline={request.deadline} />

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
              <Field label="State">{request.state}</Field>
              <Field label="Target Agency">{request.target_agency}</Field>
              <Field label="Date Sent">{formatDate(request.date_sent)}</Field>
              <Field label="Deadline">
                {request.deadline ? (
                  formatDate(request.deadline)
                ) : (
                  <span className="text-gray-500">Pending research</span>
                )}
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
        </>
      )}
    </div>
  );
}
