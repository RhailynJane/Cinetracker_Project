"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { useWatchlist } from "@/hooks/useWatchlist";
import { tmdbService } from "@/lib/tmdb";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Heart, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import MovieCard from "@/components/movie/MovieCard";
import Header from "@/components/layout/Header";

/**
 * Favorites page component that displays user's favorite movies
 * Requires authentication and TMDB API key to function properly
 */
export default function FavoritesPage() {
  const router = useRouter();
  const { user, initialized } = useAuth();
  const { favorites } = useWatchlist();

  // Local state for storing detailed movie data
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Check if TMDB API key is configured
  const hasApiKey = !!process.env.NEXT_PUBLIC_TMDB_API_KEY;

  // Authentication guard - redirect unauthenticated users to login
  useEffect(() => {
    if (!initialized) return; // Wait for auth initialization
    if (!user) {
      router.replace("/auth?mode=login");
      return;
    }
  }, [initialized, user, router]);

  // Fetch detailed movie data for all favorite movie IDs
  useEffect(() => {
    let ignore = false; // Flag to prevent state updates if component unmounts

    async function load() {
      if (!user) return; // Only load if user is authenticated
      setLoading(true);

      try {
        // Fetch movie details for each favorite ID in parallel
        const results = await Promise.all(
          (favorites || []).map(
            async (id) => await tmdbService.getMovieDetails(id)
          )
        );

        // Filter out any failed requests and update state
        if (!ignore) setItems(results.filter(Boolean));
      } catch (e) {
        // Handle errors gracefully by showing empty list
        if (!ignore) setItems([]);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();

    // Cleanup function to prevent memory leaks
    return () => {
      ignore = true;
    };
  }, [user, favorites]); // Re-run when user or favorites change

  // Early return for missing API key configuration
  if (!hasApiKey) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertTitle>TMDB API key missing</AlertTitle>
          <AlertDescription>
            Set NEXT_PUBLIC_TMDB_API_KEY to load your favorites.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <>
      {/* Page header with navigation */}
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Page title with heart icon and count badge */}
        <div className="flex items-center gap-3 mb-6">
          <Heart className="h-6 w-6 text-red-500" />
          <h1 className="text-3xl font-bold">My Favorites</h1>
          {/* Badge showing total number of favorites */}
          <Badge variant="secondary">{items.length}</Badge>
        </div>

        {/* Empty state message when no favorites exist */}
        {items.length === 0 && !loading ? (
          <Card className="p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="font-medium">No favorites yet.</div>
                <div className="text-sm text-muted-foreground">
                  Tap the heart on any movie to add it here.
                </div>
              </div>
            </div>
          </Card>
        ) : null}

        {/* Responsive grid layout for movie cards */}
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {/* Conditional rendering: skeleton loaders while loading, movie cards when loaded */}
          {(loading ? Array.from({ length: 10 }) : items).map((m, idx) =>
            loading ? (
              // Skeleton loader placeholders during data fetch
              <div
                key={idx}
                className="h-[320px] rounded-md bg-muted animate-pulse"
              />
            ) : (
              // Actual movie card component with movie data
              <MovieCard key={m.id} movie={m} />
            )
          )}
        </div>
      </div>
    </>
  );
}
