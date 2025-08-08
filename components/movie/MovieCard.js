"use client";

import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Heart, ListPlus, Check, Star, Eye } from "lucide-react";
import { useWatchlist } from "@/hooks/useWatchlist";
import { tmdbService } from "@/lib/tmdb";
import { truncateText } from "@/lib/utils";

/**
 * MovieCard component displays individual movie/TV show information and user interaction buttons
 * Handles poster display, rating, title, overview, and user list management (favorites, watchlist, watched)
 * Works with both movies and TV shows from TMDB API
 *
 * @param {Object} props - Component props
 * @param {Object} props.movie - Movie/TV show data from TMDB API (defaults to empty object)
 * @returns {JSX.Element} Interactive movie card with poster, details, and action buttons
 */
export default function MovieCard({ movie = {} }) {
  // Get watchlist management functions and state from custom hook
  const {
    isFavorite,
    addToFavorites,
    removeFromFavorites,
    isInWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    isInWatched,
    addToWatched,
    removeFromWatched,
  } = useWatchlist();

  // Extract and normalize movie data (handles both movie and TV show objects)
  const title = movie.title || movie.name || "Untitled"; // movie.title for movies, movie.name for TV shows
  const date = movie.release_date || movie.first_air_date || ""; // Different date fields for movies vs TV
  const posterUrl = tmdbService.getPosterUrl(movie.poster_path || "", "w342"); // Generate full poster URL

  // Format rating to one decimal place, handle null/undefined values
  const rating =
    movie.vote_average != null
      ? Math.round(movie.vote_average * 10) / 10
      : null;

  // Check current state of movie in user's lists
  const fav = isFavorite(movie.id);
  const inList = isInWatchlist(movie.id);
  const watched = isInWatched(movie.id);

  // Generate appropriate detail page URL based on media type
  const detailPath =
    movie.media_type === "tv" ? `/tv/${movie.id}` : `/movie/${movie.id}`;

  return (
    <Card className="overflow-hidden flex flex-col">
      {/* Main card content - poster and movie information */}
      <CardContent className="p-0">
        {/* Poster image section - clickable link to detail page */}
        <Link href={detailPath} className="relative block">
          <div className="relative w-full aspect-[2/3] bg-muted">
            {/* Conditional poster rendering - Next.js Image for external URLs, regular img for placeholders */}
            {posterUrl ? (
              <Image
                src={posterUrl || "/placeholder.svg"}
                alt={title}
                fill
                sizes="(max-width: 768px) 50vw, 20vw" // Responsive image sizing
                className="object-cover"
              />
            ) : (
              /* Fallback placeholder image when no poster is available */
              <img
                src="/placeholder.svg?height=510&width=342"
                alt="Poster placeholder"
                className="h-full w-full object-cover"
              />
            )}

            {/* Rating badge overlay - only shown if rating exists */}
            {rating !== null && (
              <div className="absolute top-2 right-2">
                <Badge
                  variant="secondary"
                  className="bg-background/80 backdrop-blur" // Semi-transparent background with blur effect
                >
                  <Star className="h-3 w-3 mr-1 text-yellow-500" />
                  {rating}
                </Badge>
              </div>
            )}
          </div>
        </Link>

        {/* Movie details section - title, date, overview */}
        <div className="p-3 grid gap-1">
          {/* Movie title - clickable link with hover effect */}
          <Link
            href={detailPath}
            className="font-medium line-clamp-1 hover:underline"
            title={title} // Full title shown on hover if truncated
          >
            {title}
          </Link>

          {/* Release/air date */}
          <div className="text-xs text-muted-foreground">
            {date || "Unknown date"}
          </div>

          {/* Movie overview/description - truncated to 100 characters */}
          <div className="text-xs text-muted-foreground line-clamp-2">
            {truncateText(movie.overview || "", 100)}
          </div>
        </div>
      </CardContent>

      {/* Action buttons section - favorites, watchlist, watched status */}
      <CardFooter className="mt-auto p-3 pt-0 flex items-center justify-between gap-2">
        {/* Favorites button - toggles favorite status */}
        <Button
          variant={fav ? "default" : "outline"} // Visual state indicates current status
          size="sm"
          onClick={() =>
            fav ? removeFromFavorites(movie.id) : addToFavorites(movie.id)
          }
          aria-pressed={fav} // Accessibility: indicates current pressed state
        >
          <Heart className={`mr-2 h-4 w-4 ${fav ? "fill-current" : ""}`} />
          {fav ? "Favorited" : "Favorite"}
        </Button>

        {/* Icon-only action buttons group */}
        <div className="flex items-center gap-2">
          {/* Watchlist toggle button */}
          <Button
            variant={inList ? "default" : "outline"}
            size="icon"
            title={inList ? "Remove from Watchlist" : "Add to Watchlist"} // Tooltip text
            aria-pressed={inList}
            onClick={() =>
              inList ? removeFromWatchlist(movie.id) : addToWatchlist(movie.id)
            }
          >
            <ListPlus className="h-4 w-4" />
          </Button>

          {/* Watched status toggle button */}
          <Button
            variant={watched ? "default" : "outline"}
            size="icon"
            title={watched ? "Unmark Watched" : "Mark as Watched"}
            aria-pressed={watched}
            onClick={() =>
              watched ? removeFromWatched(movie.id) : addToWatched(movie.id)
            }
          >
            {/* Dynamic icon based on watched status */}
            {watched ? (
              <Check className="h-4 w-4" /> // Checkmark when watched
            ) : (
              <Eye className="h-4 w-4" /> // Eye icon when not watched
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
