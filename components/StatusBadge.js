const STYLES = {
  Draft: "bg-gray-100 text-gray-700",
  Sent: "bg-blue-100 text-blue-800",
  Acknowledged: "bg-indigo-100 text-indigo-800",
  Fulfilled: "bg-green-100 text-green-800",
  Denied: "bg-red-100 text-red-800",
  Appealed: "bg-amber-100 text-amber-900",
};

export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
        STYLES[status] || STYLES.Draft
      }`}
    >
      {status}
    </span>
  );
}
