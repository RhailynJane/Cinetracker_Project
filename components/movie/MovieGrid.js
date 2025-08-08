"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { tmdbService } from "@/lib/tmdb";
import MovieCard from "./MovieCard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Film } from "lucide-react";

/**
 * MovieGrid component displays a grid of movies with category filtering and search functionality
 * Handles different movie categories (popular, top rated, upcoming, now playing) and search results
 * Includes loading states, error handling, and responsive grid layout
 *
 * @param {Object} props - Component props
 * @param {string} props.searchQuery - Search query string (defaults to empty string)
 * @returns {JSX.Element} Grid of movie cards with category filters and search results
 */
export default function MovieGrid({ searchQuery = "" }) {
  // State management for movie data and UI
  const [category, setCategory] = useState("popular"); // Current selected category
  const [loading, setLoading] = useState(false); // Loading state for API requests
  const [movies, setMovies] = useState([]); // Array of movie data from TMDB
  const [error, setError] = useState(null); // Error message for failed API requests

  // Check if TMDB API key is configured
  const hasApiKey = !!process.env.NEXT_PUBLIC_TMDB_API_KEY;

  // Determine active category based on search query presence
  // Search takes priority over category selection
  const activeCategory = useMemo(() => {
    if (searchQuery.trim().length > 0) return "search";
    return category;
  }, [searchQuery, category]);

  // Fetch movie data when category or search query changes
  useEffect(() => {
    let ignore = false; // Flag to prevent state updates after component unmount

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        let data = null;

        // Route to appropriate TMDB service method based on active category
        if (activeCategory === "search") {
          data = await tmdbService.searchMovies(searchQuery, 1);
        } else if (activeCategory === "popular") {
          data = await tmdbService.getPopularMovies(1);
        } else if (activeCategory === "top_rated") {
          data = await tmdbService.getTopRatedMovies(1);
        } else if (activeCategory === "upcoming") {
          data = await tmdbService.getUpcomingMovies(1);
        } else if (activeCategory === "now_playing") {
          data = await tmdbService.getNowPlayingMovies(1);
        }

        // Only update state if component is still mounted
        if (!ignore) setMovies(data?.results || []);
      } catch (e) {
        // Handle API errors with user-friendly messages
        if (!ignore) setError(e?.message || "Failed to load movies");
      } finally {
        // Reset loading state regardless of success/failure
        if (!ignore) setLoading(false);
      }
    };

    fetchData();

    // Cleanup function to prevent memory leaks and race conditions
    return () => {
      ignore = true;
    };
  }, [activeCategory, searchQuery]);

  // Early return if TMDB API key is not configured
  if (!hasApiKey) {
    return (
      <div className="container mx-auto">
        <Alert variant="destructive" className="mt-4">
          <AlertTitle>TMDB API key missing</AlertTitle>
          <AlertDescription>
            Set NEXT_PUBLIC_TMDB_API_KEY in your environment to enable movie
            loading.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      {/* Category filter buttons and results counter */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {/* Category filter buttons */}
        <CategoryButton
          value="popular"
          active={category === "popular"}
          onClick={() => setCategory("popular")}
        >
          Popular
        </CategoryButton>
        <CategoryButton
          value="top_rated"
          active={category === "top_rated"}
          onClick={() => setCategory("top_rated")}
        >
          Top Rated
        </CategoryButton>
        <CategoryButton
          value="upcoming"
          active={category === "upcoming"}
          onClick={() => setCategory("upcoming")}
        >
          Upcoming
        </CategoryButton>
        <CategoryButton
          value="now_playing"
          active={category === "now_playing"}
          onClick={() => setCategory("now_playing")}
        >
          Now Playing
        </CategoryButton>

        {/* Results counter - positioned on the right */}
        <div className="ml-auto inline-flex items-center gap-2 text-sm text-muted-foreground">
          <Film className="h-4 w-4" />
          <span>{movies?.length || 0} results</span>
        </div>
      </div>

      {/* Error alert - shown when API requests fail */}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Responsive movie grid with loading skeletons */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {/* Conditional rendering: skeleton placeholders during loading, movie cards when loaded */}
        {(loading ? Array.from({ length: 10 }) : movies).map((m, idx) =>
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
  );
}

/**
 * CategoryButton component for movie category filtering
 * Provides visual feedback for active state and accessibility features
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Button text content
 * @param {boolean} props.active - Whether this category is currently active
 * @param {Function} props.onClick - Click handler function
 * @param {string} props.value - Category value for accessibility label
 * @returns {JSX.Element} Styled category filter button
 */
function CategoryButton({ children, active, onClick, value }) {
  return (
    <Button
      type="button"
      variant={active ? "default" : "outline"} // Visual state indicates active category
      onClick={onClick}
      aria-pressed={active} // Accessibility: indicates current pressed state
      aria-label={`Show ${value.replace("_", " ")}`} // Screen reader friendly label
      size="sm"
    >
      {children}
    </Button>
  );
}
