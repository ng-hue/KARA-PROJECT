"use client";

import { useState } from "react";
import Link from "next/link";
import RequestForm from "@/components/RequestForm";
import { createRequest } from "@/lib/requests";
import { DEFAULT_STATUS } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import {
  DEADLINE_FOOTNOTE,
  NOT_SUPPORTED_LABEL,
  deadlineLabel,
  getDeadlineInfo,
} from "@/lib/deadlines";

function savedDeadlineText(saved) {
  const info = getDeadlineInfo(saved.state, saved.date_sent);

  if (info.kind === "unsupported") {
    return NOT_SUPPORTED_LABEL;
  }

  if (!info.date) {
    return "not reported";
  }

  const prefix = info.kind === "estimated" ? "estimated " : "";

  return `${prefix}${formatDate(info.date)} (${deadlineLabel(saved.state)})`;
}

const EMPTY = {
  title: "",
  request_text: "",
  state: "",
  target_agency: "",
  date_sent: "",
  status: DEFAULT_STATUS,
};

export default function NewRequestPage() {
  const [saved, setSaved] = useState(null);

  async function handleCreate(values) {
    setSaved(await createRequest(values));
  }

  if (saved) {
    return (
      <div className="max-w-xl rounded-lg border border-green-200 bg-green-50 p-6">
        <h1 className="text-xl font-semibold text-green-900">
          Request saved
        </h1>

        <p className="mt-2 text-green-900">
          &quot;{saved.title}&quot; was saved with status {saved.status}.
        </p>

        <p className="mt-1 text-green-900">
          Response deadline: {savedDeadlineText(saved)}
        </p>

        <p className="mt-1 text-xs text-green-900">
          {DEADLINE_FOOTNOTE}
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/requests"
            className="rounded-md bg-[#012929] px-4 py-2 text-sm font-medium text-white"
          >
            View All Requests
          </Link>

          <button
            onClick={() => setSaved(null)}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium"
          >
            Log Another Request
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-semibold">
        New Request
      </h1>

      <p className="mt-1 text-sm text-gray-600">
        The response deadline is calculated from the state and date sent.
      </p>

      <RequestForm
        initialValues={EMPTY}
        onSubmit={handleCreate}
      />
    </div>
  );
}