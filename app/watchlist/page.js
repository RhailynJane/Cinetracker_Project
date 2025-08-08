"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { useWatchlist } from "@/hooks/useWatchlist";
import { tmdbService } from "@/lib/tmdb";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import MovieCard from "@/components/movie/MovieCard";
import { List, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Header from "@/components/layout/Header";

/**
 * WatchlistPage Component
 *
 * Displays a user's movie watchlist in a grid layout.
 * Shows movies that have been added to watch later but haven't been watched yet.
 * Includes authentication protection and loading states.
 */
export default function WatchlistPage() {
  const router = useRouter();
  const { user, initialized } = useAuth();
  const { watchlist } = useWatchlist();

  // State for storing detailed movie information fetched from TMDB API
  const [items, setItems] = useState([]);
  // Loading state to show skeletons while fetching data
  const [loading, setLoading] = useState(true);

  // Check if TMDB API key is properly configured in environment variables
  const hasApiKey = !!process.env.NEXT_PUBLIC_TMDB_API_KEY;

  /**
   * Authentication guard effect
   * Ensures only authenticated users can access the watchlist page
   * Redirects to login if user is not authenticated
   */
  useEffect(() => {
    // Wait for authentication to initialize before checking user state
    if (!initialized) return;

    // Redirect unauthenticated users to login page
    if (!user) {
      router.replace("/auth?mode=login");
      return;
    }
  }, [initialized, user, router]);

  /**
   * Data loading effect
   * Fetches detailed movie information for each item in the user's watchlist
   * Transforms movie IDs into full movie objects with details from TMDB API
   */
  useEffect(() => {
    let ignore = false; // Cleanup flag to prevent state updates after unmount

    async function load() {
      // Skip loading if user is not authenticated
      if (!user) return;

      setLoading(true);

      try {
        // Fetch movie details for each watchlist item ID in parallel
        // This transforms an array of IDs into an array of movie objects
        const results = await Promise.all(
          (watchlist || []).map(
            async (id) => await tmdbService.getMovieDetails(id)
          )
        );

        // Only update state if component is still mounted
        // Filter out any null/undefined results from failed API calls
        if (!ignore) setItems(results.filter(Boolean));
      } catch (e) {
        // Handle API errors gracefully by showing empty state
        if (!ignore) setItems([]);
      } finally {
        // Always stop loading indicator
        if (!ignore) setLoading(false);
      }
    }

    load();

    // Cleanup function prevents memory leaks and race conditions
    return () => {
      ignore = true;
    };
  }, [user, watchlist]); // Re-run when user changes or watchlist is updated

  /**
   * Early return for missing API key configuration
   * Shows error message when TMDB API key is not set up
   */
  if (!hasApiKey) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertTitle>TMDB API key missing</AlertTitle>
            <AlertDescription>
              Set NEXT_PUBLIC_TMDB_API_KEY to load your watchlist details.
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
        {/* Page header with list icon, title, and item count badge */}
        <div className="flex items-center gap-3 mb-6">
          <List className="h-6 w-6" />
          <h1 className="text-3xl font-bold">My Watchlist</h1>
          {/* Badge shows current number of items in watchlist */}
          <Badge variant="secondary">{items.length}</Badge>
        </div>

        {/* Empty state card - shown when user has no items in watchlist */}
        {items.length === 0 && !loading ? (
          <Card className="p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="font-medium">Your watchlist is empty.</div>
                <div className="text-sm text-muted-foreground">
                  Browse movies and add them to your watchlist.
                </div>
              </div>
            </div>
          </Card>
        ) : null}

        {/* Responsive grid layout for movies */}
        {/* Shows loading skeletons during data fetch, then actual movie cards */}
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {(loading ? Array.from({ length: 10 }) : items).map((m, idx) =>
            loading ? (
              // Loading skeleton placeholder with pulsing animation
              <div
                key={idx}
                className="h-[320px] rounded-md bg-muted animate-pulse"
              />
            ) : (
              // Actual movie card component displaying movie details
              <MovieCard key={m.id} movie={m} />
            )
          )}
        </div>
      </div>
    </>
  );
}
