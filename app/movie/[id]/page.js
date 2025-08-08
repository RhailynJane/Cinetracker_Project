"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, Clock, Calendar, Heart, Plus, Check } from "lucide-react";
import { tmdbService } from "@/lib/tmdb";
import { useAuth } from "@/components/auth/AuthProvider";
import { useWatchlist } from "@/hooks/useWatchlist";
import { formatDate, formatRuntime, cn } from "@/lib/utils";
import MovieCard from "@/components/movie/MovieCard";
import Header from "@/components/layout/Header";

/**
 * Movie detail page component that displays comprehensive information about a specific movie
 * including poster, backdrop, cast, similar movies, reviews, and user interaction buttons
 */
export default function MovieDetailPage() {
  const { id } = useParams(); // Extract movie ID from URL parameters
  const router = useRouter();
  const { user } = useAuth();

  // Destructure watchlist and favorites functionality
  const {
    isInWatchlist,
    isFavorite,
    addToWatchlist,
    removeFromWatchlist,
    addToFavorites,
    removeFromFavorites,
  } = useWatchlist();

  // Local state for movie data and loading states
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // Fetch movie details when component mounts or ID changes
  useEffect(() => {
    let ignore = false; // Flag to prevent state updates after component unmount

    async function load() {
      if (!id) return; // Exit early if no movie ID provided

      setLoading(true);
      setErr(null);

      try {
        // Fetch comprehensive movie data including cast, similar movies, and reviews
        const data = await tmdbService.getMovieDetails(id);

        if (!ignore) {
          if (data) {
            setMovie(data);
          } else {
            setErr("Movie not found");
          }
        }
      } catch (e) {
        // Handle API errors gracefully
        if (!ignore) setErr("Failed to load movie details");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();

    // Cleanup function to prevent memory leaks
    return () => {
      ignore = true;
    };
  }, [id]);

  // Loading state with skeleton placeholders
  if (loading) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Poster skeleton */}
            <div className="lg:col-span-1">
              <Skeleton className="aspect-[2/3] w-full rounded-lg" />
            </div>
            {/* Movie info skeleton */}
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-16" />
              </div>
              <Skeleton className="h-20 w-full" />
              <div className="flex gap-2">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Error state when movie not found or API fails
  if (err || !movie) {
    return (
      <>
        <Header />
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Movie Not Found</h1>
            <p className="text-muted-foreground">
              {err || "The requested movie could not be found."}
            </p>
          </div>
        </div>
      </>
    );
  }

  // Generate optimized image URLs for poster and backdrop
  const posterUrl = tmdbService.getImageUrl(movie.poster_path, "w500");
  const backdropUrl = tmdbService.getImageUrl(movie.backdrop_path, "w1280");

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero backdrop section with overlay */}
      {backdropUrl && (
        <div className="relative h-96 overflow-hidden">
          <Image
            src={backdropUrl || "/placeholder.svg"}
            alt={movie.title}
            fill
            className="object-cover"
            sizes="100vw"
            priority // Load backdrop image with high priority
          />
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-black/60" />
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Main content grid with overlapping poster */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 -mt-48 relative z-10">
          {/* Movie poster column */}
          <div className="lg:col-span-1">
            <Card className="overflow-hidden">
              <div className="relative aspect-[2/3]">
                <Image
                  src={
                    posterUrl ||
                    "/placeholder.svg?height=750&width=500&query=movie-poster"
                  }
                  alt={movie.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 33vw"
                />
              </div>
            </Card>
          </div>

          {/* Movie information column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-background/95 backdrop-blur rounded-lg p-6">
              {/* Movie title */}
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                {movie.title}
              </h1>

              {/* Movie tagline (if available) */}
              {movie.tagline && (
                <p className="text-lg text-muted-foreground italic mb-4">
                  &quot;{movie.tagline}&quot;
                </p>
              )}

              {/* Genre badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                {movie.genres?.map((g) => (
                  <Badge key={g.id} variant="secondary">
                    {g.name}
                  </Badge>
                ))}
              </div>

              {/* Movie metadata: rating, runtime, release date */}
              <div className="flex flex-wrap items-center gap-4 mb-4">
                {/* Rating with star icon */}
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">
                    {movie.vote_average?.toFixed(1)}
                  </span>
                  <span className="text-muted-foreground">
                    ({movie.vote_count?.toLocaleString()} votes)
                  </span>
                </div>

                {/* Runtime (if available) */}
                {movie.runtime ? (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{formatRuntime(movie.runtime)}</span>
                  </div>
                ) : null}

                {/* Release date */}
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(movie.release_date)}</span>
                </div>
              </div>

              {/* User action buttons (only for authenticated users) */}
              {user && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {/* Watchlist toggle button */}
                  <Button
                    onClick={() =>
                      isInWatchlist(movie.id)
                        ? removeFromWatchlist(movie.id)
                        : addToWatchlist(movie.id)
                    }
                    variant={isInWatchlist(movie.id) ? "default" : "outline"}
                  >
                    {isInWatchlist(movie.id) ? (
                      <Check className="mr-2 h-4 w-4" />
                    ) : (
                      <Plus className="mr-2 h-4 w-4" />
                    )}
                    {isInWatchlist(movie.id)
                      ? "In Watchlist"
                      : "Add to Watchlist"}
                  </Button>

                  {/* Favorites toggle button */}
                  <Button
                    onClick={() =>
                      isFavorite(movie.id)
                        ? removeFromFavorites(movie.id)
                        : addToFavorites(movie.id)
                    }
                    variant={isFavorite(movie.id) ? "default" : "outline"}
                  >
                    <Heart
                      className={cn(
                        "mr-2 h-4 w-4",
                        isFavorite(movie.id) && "fill-current" // Fill heart when favorited
                      )}
                    />
                    {isFavorite(movie.id) ? "Favorited" : "Add to Favorites"}
                  </Button>
                </div>
              )}

              {/* Movie overview section */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Overview</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {movie.overview || "No overview available."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed content section for cast, similar movies, and reviews */}
        <div className="mt-12">
          <Tabs defaultValue="cast" className="w-full">
            <TabsList>
              <TabsTrigger value="cast">Cast</TabsTrigger>
              <TabsTrigger value="similar">Similar Movies</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>

            {/* Cast tab content */}
            <TabsContent value="cast" className="space-y-4">
              <h3 className="text-xl font-semibold">Cast</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {/* Display first 12 cast members */}
                {movie.credits?.cast?.slice(0, 12).map((person) => (
                  <Card key={person.id} className="overflow-hidden">
                    {/* Actor profile image */}
                    <div className="relative aspect-[2/3]">
                      <Image
                        src={
                          tmdbService.getProfileUrl(person.profile_path) ||
                          "/placeholder.svg?height=300&width=200&query=person" ||
                          "/placeholder.svg"
                        }
                        alt={person.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
                      />
                    </div>
                    {/* Actor name and character */}
                    <CardContent className="p-3">
                      <h4 className="font-semibold text-sm line-clamp-1">
                        {person.name}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {person.character}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Similar movies tab content */}
            <TabsContent value="similar" className="space-y-4">
              <h3 className="text-xl font-semibold">Similar Movies</h3>
              {movie.similar?.results?.length ? (
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                  {/* Display first 10 similar movies */}
                  {movie.similar.results.slice(0, 10).map((m) => (
                    <MovieCard key={m.id} movie={m} />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  No similar movies found.
                </p>
              )}
            </TabsContent>

            {/* Reviews tab content */}
            <TabsContent value="reviews" className="space-y-4">
              <h3 className="text-xl font-semibold">Reviews</h3>
              {movie.reviews?.results?.length ? (
                <div className="space-y-4">
                  {/* Display first 3 reviews */}
                  {movie.reviews.results.slice(0, 3).map((r) => (
                    <Card key={r.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold">{r.author}</h4>
                          {/* Review rating (if available) */}
                          {r.author_details?.rating && (
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm">
                                {r.author_details.rating}/10
                              </span>
                            </div>
                          )}
                        </div>
                        {/* Review content with line clamping to prevent overflow */}
                        <p className="text-muted-foreground text-sm line-clamp-4">
                          {r.content}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No reviews available.</p>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
