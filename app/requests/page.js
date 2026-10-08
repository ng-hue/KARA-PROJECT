"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listRequests, resetPreviewData } from "@/lib/requests";
import { isSupabaseConfigured } from "@/lib/supabase";
import { formatDate } from "@/lib/format";
import StatusBadge from "@/components/StatusBadge";

function Deadline({ value }) {
  return value ? (
    <span>{formatDate(value)}</span>
  ) : (
    <span className="text-gray-500">Pending research</span>
  );
}

export default function RequestsPage() {
  const [requests, setRequests] = useState(null);
  const [error, setError] = useState("");

  function load() {
    listRequests()
      .then(setRequests)
      .catch((err) => setError(err.message));
  }

  useEffect(load, []);

  function handleReset() {
    resetPreviewData();
    load();
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">All Requests</h1>
          <p className="mt-1 text-sm text-gray-600">
            Newest date sent first.
          </p>
        </div>
        {!isSupabaseConfigured ? (
          <button
            onClick={handleReset}
            className="text-sm text-gray-600 underline hover:text-gray-900"
          >
            Reset Sample Data
          </button>
        ) : null}
      </div>

      {error ? (
        <p className="rounded-md bg-red-50 p-4 text-red-800">
          Could not load requests: {error}
        </p>
      ) : !requests ? (
        <p className="text-gray-600">Loading requests...</p>
      ) : requests.length === 0 ? (
        <p className="text-gray-600">
          No requests yet.{" "}
          <Link href="/requests/new" className="text-[#007a72] underline">
            Log the first one
          </Link>
          .
        </p>
      ) : (
        <>
          {/* Phone layout: one card per request */}
          <ul className="space-y-3 md:hidden">
            {requests.map((r) => (
              <li key={r.id} className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-medium">{r.title}</p>
                  <StatusBadge status={r.status} />
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  {r.target_agency}, {r.state}
                </p>
                <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <dt className="text-gray-500">Date Sent</dt>
                    <dd>{formatDate(r.date_sent)}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Deadline</dt>
                    <dd><Deadline value={r.deadline} /></dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>

          {/* Desktop layout: table */}
          <div className="hidden overflow-x-auto rounded-lg border border-gray-200 bg-white md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">State</th>
                  <th className="px-4 py-3 font-medium">Target Agency</th>
                  <th className="px-4 py-3 font-medium">Date Sent</th>
                  <th className="px-4 py-3 font-medium">Deadline</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {requests.map((r) => (
                  <tr key={r.id}>
                    <td className="px-4 py-3 font-medium">{r.title}</td>
                    <td className="px-4 py-3">{r.state}</td>
                    <td className="px-4 py-3">{r.target_agency}</td>
                    <td className="whitespace-nowrap px-4 py-3">{formatDate(r.date_sent)}</td>
                    <td className="whitespace-nowrap px-4 py-3"><Deadline value={r.deadline} /></td>
                    <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
