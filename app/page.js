"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Film } from "lucide-react";
import { useRouter } from "next/navigation";

// Dynamically import MovieGrid component to improve initial page load performance
// Shows skeleton loading state while the component loads
const MovieGrid = dynamic(() => import("@/components/movie/MovieGrid"), {
  loading: () => (
    <div className="container py-10">
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {/* Create 10 skeleton placeholders for loading state */}
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="h-[280px] rounded-md bg-neutral-200 dark:bg-neutral-800 animate-pulse"
          />
        ))}
      </div>
    </div>
  ),
});

/**
 * Main page component for CineTracker application
 * Shows different content based on user authentication status:
 * - Landing page with hero section for unauthenticated users
 * - Movie search and browse interface for authenticated users
 *
 * @returns {JSX.Element} The main page component
 */
export default function Page() {
  // Get authentication state from context
  const { user, loading } = useAuth();
  const router = useRouter();

  // Local state for search functionality
  const [query, setQuery] = useState(""); // Current input value
  const [submittedQuery, setSubmittedQuery] = useState(""); // Query submitted for search

  // Navigation handlers for authentication routes
  const goRegister = () => router.push("/auth?mode=register");
  const goLogin = () => router.push("/auth?mode=login");

  // Handle search form submission
  const onSearch = (e) => {
    e.preventDefault();
    setSubmittedQuery(query.trim()); // Trim whitespace and update search query
  };

  return (
    <div className="min-h-[100dvh] flex flex-col">
      {/* Global navigation header */}
      <Header />

      <main className="flex-1">
        {/* Conditional rendering based on authentication status */}
        {!user ? (
          // Landing page for unauthenticated users
          <section className="relative">
            {/* Hero background image with overlay */}
            <div className="absolute inset-0">
              <img
                src="/cinemabackground.png"
                alt="Cinematic background"
                className="h-full w-full object-cover"
              />
              {/* Dark overlay for text readability */}
              <div className="absolute inset-0 bg-black/50" />
            </div>

            {/* Hero content */}
            <div className="relative container mx-auto px-4">
              <div className="min-h-[calc(100dvh-56px)] flex items-center justify-center">
                <div className="mx-auto max-w-3xl text-center space-y-6 text-white">
                  {/* Brand tagline with icon */}
                  <div className="inline-flex items-center gap-2 text-sm text-neutral-300 justify-center">
                    <Film className="h-4 w-4" />
                    <span>{"Discover • Track • Enjoy"}</span>
                  </div>

                  {/* Main hero headline */}
                  <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
                    {"Find your next favorite. Track everything you watch."}
                  </h1>

                  {/* Hero description */}
                  <p className="text-neutral-300 text-lg">
                    {
                      "A minimalist way to build your watchlist and favorites, synced in real-time."
                    }
                  </p>

                  {/* Call-to-action buttons */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Button
                      type="button"
                      className="w-full sm:w-auto"
                      onClick={goRegister}
                    >
                      {"Get started"}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      className="w-full sm:w-auto"
                      onClick={goLogin}
                    >
                      {"Log in"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ) : (
          // Main app interface for authenticated users
          <section>
            <div className="container mx-auto px-4 py-6 flex flex-col gap-4">
              {/* Page title */}
              <h2 className="text-3xl font-bold text-primary text-center">
                Browse movies and manage your lists.
              </h2>

              {/* Movie search form */}
              <form
                className="mx-auto w-full max-w-md relative"
                onSubmit={onSearch}
              >
                <input
                  type="text"
                  placeholder="Search movies..."
                  className="w-full rounded-md border border-gray-300 px-4 py-2 pl-10 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                {/* Search icon positioned inside input field */}
                <svg
                  className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 dark:text-neutral-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
                  />
                </svg>
              </form>

              {/* Movie grid - only render when not loading auth state */}
              {!loading && <MovieGrid searchQuery={submittedQuery} />}
            </div>
          </section>
        )}
      </main>

      {/* Site footer with copyright and tech stack info */}
      <footer className="border-t">
        <div className="container mx-auto px-4 py-6 text-sm text-muted-foreground flex items-center justify-between">
          <span>{"© " + new Date().getFullYear() + " CineTracker"}</span>
          <span>{"Built with Next.js + Firebase + TMDB"}</span>
        </div>
      </footer>
    </div>
  );
}
