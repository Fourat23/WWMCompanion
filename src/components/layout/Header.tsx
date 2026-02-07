"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <nav className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link
          href="/"
          className="text-xl font-bold text-amber-400 hover:text-amber-300 transition-colors"
        >
          WWM Companion
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className="text-gray-300 hover:text-white transition-colors"
          >
            Builds
          </Link>
          <Link
            href="/skills"
            className="text-gray-300 hover:text-white transition-colors"
          >
            Skills
          </Link>
          <Link
            href="/build/new"
            className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Create Build
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-gray-300 hover:text-white"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {menuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-gray-900 border-t border-gray-800 px-4 py-3 space-y-2">
          <Link
            href="/"
            className="block text-gray-300 hover:text-white py-1"
            onClick={() => setMenuOpen(false)}
          >
            Builds
          </Link>
          <Link
            href="/skills"
            className="block text-gray-300 hover:text-white py-1"
            onClick={() => setMenuOpen(false)}
          >
            Skills
          </Link>
          <Link
            href="/build/new"
            className="block bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-lg font-medium text-center"
            onClick={() => setMenuOpen(false)}
          >
            Create Build
          </Link>
        </div>
      )}
    </header>
  );
}
