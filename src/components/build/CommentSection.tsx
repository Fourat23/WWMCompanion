"use client";

import { useState, type FormEvent } from "react";
import { sanitizeText } from "@/lib/sanitize";

interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

interface CommentSectionProps {
  buildId: string;
  initialComments: Comment[];
}

export default function CommentSection({
  buildId,
  initialComments,
}: CommentSectionProps) {
  const [comments, setComments] = useState(initialComments);
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buildId,
          author: author.trim() || "Anonymous",
          content: content.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setComments([data, ...comments]);
        setContent("");
      } else {
        setError(data.error || "Failed to post comment");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const reportComment = async (commentId: string) => {
    try {
      await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commentId,
          reason: "inappropriate",
        }),
      });
      alert("Report submitted. Thank you.");
    } catch {
      // Silently fail
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">
        Comments ({comments.length})
      </h3>

      {/* Comment form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        {error && (
          <p className="text-red-400 text-sm">{error}</p>
        )}
        <div className="flex gap-3">
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            maxLength={50}
            className="w-32 bg-gray-800 border border-gray-600 rounded px-2 py-1.5 text-sm text-white focus:border-amber-500 focus:outline-none"
            placeholder="Name (optional)"
          />
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={2000}
            required
            className="flex-1 bg-gray-800 border border-gray-600 rounded px-2 py-1.5 text-sm text-white focus:border-amber-500 focus:outline-none"
            placeholder="Write a comment..."
          />
          <button
            type="submit"
            disabled={loading || !content.trim()}
            className="bg-amber-600 hover:bg-amber-500 disabled:bg-gray-600 text-white px-4 py-1.5 rounded text-sm font-medium transition-colors shrink-0"
          >
            Post
          </button>
        </div>
      </form>

      {/* Comments list */}
      <div className="space-y-3">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="bg-gray-800/50 rounded-lg p-3 space-y-1"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-300">
                {sanitizeText(comment.author, 50)}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </span>
                <button
                  onClick={() => reportComment(comment.id)}
                  className="text-xs text-gray-600 hover:text-red-400 transition-colors"
                  aria-label="Report comment"
                >
                  Report
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-400 whitespace-pre-line break-words">
              {sanitizeText(comment.content, 2000)}
            </p>
          </div>
        ))}

        {comments.length === 0 && (
          <p className="text-gray-500 text-sm text-center py-4">
            No comments yet. Be the first!
          </p>
        )}
      </div>
    </div>
  );
}
