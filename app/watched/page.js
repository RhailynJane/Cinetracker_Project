"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { useWatchlist } from "@/hooks/useWatchlist";
import { tmdbService } from "@/lib/tmdb";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Eye, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import MovieCard from "@/components/movie/MovieCard";
import Header from "@/components/layout/Header";

/**
 * WatchedPage Component
 *
 * Displays a user's watched movies in a grid layout, sorted by date watched.
 * Includes authentication protection and loading states.
 */
export default function WatchedPage() {
  const router = useRouter();
  const { user, initialized } = useAuth();
  const { watched } = useWatchlist();

  // State for storing movie details fetched from TMDB API
  const [items, setItems] = useState([]);
  // Loading state for API requests
  const [loading, setLoading] = useState(true);

  // Check if TMDB API key is configured
  const hasApiKey = !!process.env.NEXT_PUBLIC_TMDB_API_KEY;

  /**
   * Sort watched items by dateWatched in descending order (newest first)
   * Uses useMemo to prevent unnecessary recalculations
   */
  const sorted = useMemo(() => {
    return [...(watched || [])].sort((a, b) => {
      const ad = new Date(a.dateWatched || 0).getTime();
      const bd = new Date(b.dateWatched || 0).getTime();
      return bd - ad; // Descending order (newest first)
    });
  }, [watched]);

  /**
   * Authentication guard effect
   * Redirects unauthenticated users to login page
   */
  useEffect(() => {
    // Wait for auth to initialize before checking
    if (!initialized) return;

    // Redirect to login if no user is authenticated
    if (!user) {
      router.replace("/auth?mode=login");
      return;
    }
  }, [initialized, user, router]);

  /**
   * Data loading effect
   * Fetches detailed movie information from TMDB API for each watched item
   */
  useEffect(() => {
    let ignore = false; // Flag to prevent state updates after component unmount

    async function load() {
      // Don't load if user is not authenticated
      if (!user) return;

      setLoading(true);

      try {
        // Fetch movie details for each watched item in parallel
        const results = await Promise.all(
          (sorted || []).map(async (w) => {
            const details = await tmdbService.getMovieDetails(w.id);
            // Attach watched metadata to movie details
            return details ? { ...details, _watchedMeta: w } : null;
          })
        );

        // Only update state if component is still mounted
        if (!ignore) setItems(results.filter(Boolean)); // Filter out null results
      } catch {
        // Handle errors by setting empty array
        if (!ignore) setItems([]);
      } finally {
        // Always stop loading state
        if (!ignore) setLoading(false);
      }
    }

    load();

    // Cleanup function to prevent memory leaks
    return () => {
      ignore = true;
    };
  }, [user, sorted]);

  /**
   * Early return for missing API key
   * Shows error message when TMDB API key is not configured
   */
  if (!hasApiKey) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertTitle>TMDB API key missing</AlertTitle>
            <AlertDescription>
              Set NEXT_PUBLIC_TMDB_API_KEY to load your watched items.
            </AlertDescription>
          </Alert>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Page header with icon, title, and count badge */}
        <div className="flex items-center gap-3 mb-6">
          <Eye className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Watched</h1>
          <Badge variant="secondary">{items.length}</Badge>
        </div>

        {/* Empty state message when no watched items exist */}
        {items.length === 0 && !loading ? (
          <Card className="p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="font-medium">No watched items yet.</div>
                <div className="text-sm text-muted-foreground">
                  Mark any movie as watched and it will appear here.
                </div>
              </div>
            </div>
          </Card>
        ) : null}

        {/* Movie grid with loading skeletons or actual movie cards */}
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {(loading ? Array.from({ length: 10 }) : items).map((m, idx) =>
            loading ? (
              // Loading skeleton placeholder
              <div
                key={idx}
                className="h-[320px] rounded-md bg-muted animate-pulse"
              />
            ) : (
              // Actual movie card component
              <MovieCard key={m.id} movie={m} />
            )
          )}
        </div>
      </div>
    </>
  );
}
