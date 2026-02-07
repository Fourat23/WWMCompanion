"use client";

import { useState } from "react";

interface VoteButtonProps {
  buildId: string;
  initialUpvotes: number;
}

export default function VoteButton({
  buildId,
  initialUpvotes,
}: VoteButtonProps) {
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [currentVote, setCurrentVote] = useState(0);
  const [loading, setLoading] = useState(false);

  const vote = async (value: 1 | -1) => {
    if (loading) return;
    setLoading(true);

    try {
      const res = await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ buildId, value }),
      });

      const data = await res.json();
      if (res.ok) {
        setCurrentVote(data.currentVote);
        // Recalculate display based on the vote change
        if (data.currentVote === 0) {
          // Vote removed
          setUpvotes((prev) => prev - value);
        } else if (currentVote === 0) {
          // New vote
          setUpvotes((prev) => prev + value);
        } else {
          // Changed vote
          setUpvotes((prev) => prev + value * 2);
        }
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => vote(1)}
        disabled={loading}
        className={`p-2 rounded transition-colors ${
          currentVote === 1
            ? "bg-amber-600 text-white"
            : "bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white"
        }`}
        aria-label="Upvote"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 15l7-7 7 7"
          />
        </svg>
      </button>
      <span className="text-lg font-bold text-white min-w-[2ch] text-center">
        {upvotes}
      </span>
      <button
        onClick={() => vote(-1)}
        disabled={loading}
        className={`p-2 rounded transition-colors ${
          currentVote === -1
            ? "bg-red-600 text-white"
            : "bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white"
        }`}
        aria-label="Downvote"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
    </div>
  );
}
