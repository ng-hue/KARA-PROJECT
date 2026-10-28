"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getRequest, updateRequest } from "@/lib/requests";
import RequestForm from "@/components/RequestForm";

export default function EditRequestPage() {
  const { id } = useParams();
  const router = useRouter();
  const [request, setRequest] = useState(null);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    getRequest(id)
      .then((found) => {
        if (!found) setLoadError("Request not found.");
        else setRequest(found);
      })
      .catch((err) => setLoadError(err.message));
  }, [id]);

  async function handleUpdate(values) {
    await updateRequest(id, values);
    router.push(`/requests/${id}`);
  }

  if (loadError) {
    return (
      <div className="max-w-xl">
        <p className="rounded-md bg-red-50 p-3 text-sm text-red-800">{loadError}</p>
        <Link href="/requests" className="mt-4 inline-block text-sm text-[#007a72] underline">
          Back to all requests
        </Link>
      </div>
    );
  }

  if (!request) {
    return <p className="text-sm text-gray-600">Loading request...</p>;
  }

  return (
    <div className="max-w-xl">
      <Link href={`/requests/${id}`} className="text-sm text-[#007a72] underline">
        Back to request
      </Link>
      <h1 className="mt-2 mb-6 text-2xl font-semibold">Edit Request</h1>
      <RequestForm
        initialValues={{
          title: request.title ?? "",
          request_text: request.request_text ?? "",
          state: request.state ?? "",
          target_agency: request.target_agency ?? "",
          date_sent: request.date_sent ?? "",
          status: request.status,
        }}
        onSubmit={handleUpdate}
        submitLabel="Save Changes"
        showStatus={false}
        showDeadline={true}
      />
    </div>
  );
}
