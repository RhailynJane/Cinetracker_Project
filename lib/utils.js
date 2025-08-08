import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function for merging and deduplicating CSS classes
 * Combines clsx for conditional classes with tailwind-merge for Tailwind CSS deduplication
 * Prevents style conflicts by ensuring later classes override earlier ones
 *
 * @param {...any} inputs - Class names, objects, or arrays to merge
 * @returns {string} Merged and deduplicated class string
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date string into human-readable format (Month Day, Year)
 * Handles invalid dates gracefully with fallback to "Unknown"
 *
 * @param {string} dateString - ISO date string or parseable date
 * @returns {string} Formatted date like "January 15, 2024" or "Unknown"
 */
export function formatDate(dateString) {
  if (!dateString) return "Unknown";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch (error) {
    return "Unknown";
  }
}

/**
 * Extracts and formats just the year from a date string
 * Useful for movie release years and concise date display
 *
 * @param {string} dateString - ISO date string or parseable date
 * @returns {string} Four-digit year or "Unknown" if invalid
 */
export function formatYear(dateString) {
  if (!dateString) return "Unknown";
  try {
    const date = new Date(dateString);
    return date.getFullYear().toString();
  } catch (error) {
    return "Unknown";
  }
}

/**
 * Converts movie runtime from minutes to human-readable hours and minutes
 * Handles edge cases like 0 minutes, exact hours, and minutes-only durations
 *
 * @param {number} minutes - Runtime in minutes
 * @returns {string} Formatted runtime like "2h 30m", "1h", "45m", or "Unknown"
 */
export function formatRuntime(minutes) {
  if (!minutes || minutes === 0) return "Unknown";
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours === 0) return `${remainingMinutes}m`;
  if (remainingMinutes === 0) return `${hours}h`;
  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Formats movie ratings to one decimal place for consistent display
 * Handles null/zero ratings with "N/A" fallback
 *
 * @param {number} rating - TMDB rating (typically 0-10)
 * @returns {string} Formatted rating like "7.8" or "N/A"
 */
export function formatRating(rating) {
  if (!rating || rating === 0) return "N/A";
  return rating.toFixed(1);
}

/**
 * Formats large vote counts with K/M suffixes for compact display
 * Reduces visual clutter by abbreviating large numbers
 *
 * @param {number} count - Number of votes
 * @returns {string} Formatted count like "1.2K", "3.4M", or "0"
 */
export function formatVoteCount(count) {
  if (!count || count === 0) return "0";
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}

/**
 * Truncates text to specified length with ellipsis
 * Trims whitespace before adding ellipsis for cleaner appearance
 *
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum character length (default: 150)
 * @returns {string} Truncated text with "..." or original text if short enough
 */
export function truncateText(text, maxLength = 150) {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "...";
}

/**
 * Generates URL-safe slugs from text for clean URLs
 * Removes special characters, converts spaces to hyphens, handles multiple separators
 *
 * @param {string} text - Text to convert to slug
 * @returns {string} URL-safe slug like "the-dark-knight" or empty string
 */
export function generateSlug(text) {
  if (!text) return "";
  return text
    .toLowerCase() // Convert to lowercase
    .replace(/[^\w\s-]/g, "") // Remove special characters except word chars, spaces, hyphens
    .replace(/[\s_-]+/g, "-") // Replace spaces, underscores, multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

/**
 * Returns Tailwind CSS classes for movie genre badges based on genre ID
 * Provides consistent color coding for different movie genres
 * Includes both light and dark mode variants
 *
 * @param {number} genreId - TMDB genre ID
 * @returns {string} Tailwind CSS classes for background and text colors
 */
export function getGenreColor(genreId) {
  const colors = {
    28: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300", // Action
    12: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300", // Adventure
    16: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300", // Animation
    35: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300", // Comedy
    80: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300", // Crime
    99: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300", // Documentary
    18: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300", // Drama
    10751: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300", // Family
    14: "bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-300", // Fantasy
    36: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300", // History
    27: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300", // Horror
    10402: "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-300", // Music
    9648: "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-300", // Mystery
    10749: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300", // Romance
    878: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300", // Science Fiction
    10770:
      "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300", // TV Movie
    53: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300", // Thriller
    10752: "bg-stone-100 text-stone-800 dark:bg-stone-900 dark:text-stone-300", // War
    37: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300", // Western
  };

  // Return genre-specific colors or default gray if genre ID not found
  return (
    colors[genreId] ||
    "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
  );
}

/**
 * Creates a debounced version of a function to limit execution frequency
 * Useful for search inputs, API calls, and resize handlers to improve performance
 * Each call resets the timer, ensuring function only runs after silence period
 *
 * @param {Function} func - Function to debounce
 * @param {number} wait - Milliseconds to wait before executing
 * @returns {Function} Debounced function that delays execution
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout); // Cancel previous timeout
    timeout = setTimeout(later, wait); // Set new timeout
  };
}

/**
 * Constructs TMDB image URLs for posters, backdrops, and profile images
 * Fallback version of tmdbService.getImageUrl() for standalone use
 *
 * @param {string} path - Image path from TMDB API response
 * @param {string} size - Image size (w185, w342, w500, w780, original, etc.)
 * @returns {string|null} Complete TMDB image URL or null if no path
 */
export function getImageUrl(path, size = "w500") {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}
