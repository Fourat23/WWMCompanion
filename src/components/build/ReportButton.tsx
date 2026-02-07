"use client";

import { useState } from "react";

interface ReportButtonProps {
  buildId: string;
}

const REASONS = [
  { value: "spam", label: "Spam" },
  { value: "inappropriate", label: "Inappropriate content" },
  { value: "misinformation", label: "Misinformation" },
  { value: "harassment", label: "Harassment" },
  { value: "other", label: "Other" },
] as const;

export default function ReportButton({ buildId }: ReportButtonProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string>("spam");
  const [details, setDetails] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    try {
      await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ buildId, reason, details }),
      });
      setSubmitted(true);
    } catch {
      // Silently fail
    }
  };

  if (submitted) {
    return (
      <span className="text-sm text-green-400">Report submitted. Thanks.</span>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="text-sm text-gray-500 hover:text-red-400 transition-colors"
      >
        Report Build
      </button>

      {open && (
        <div className="absolute right-0 top-8 bg-gray-800 border border-gray-700 rounded-lg p-4 w-72 z-10 shadow-xl space-y-3">
          <h4 className="text-sm font-medium text-white">Report this build</h4>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm text-white focus:outline-none"
            aria-label="Report reason"
          >
            {REASONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            maxLength={1000}
            rows={2}
            className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm text-white focus:outline-none"
            placeholder="Additional details (optional)"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              className="bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors"
            >
              Submit Report
            </button>
            <button
              onClick={() => setOpen(false)}
              className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
