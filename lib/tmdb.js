// TMDB API base URLs - constants for consistent API access
const TMDB_BASE_URL = "https://api.themoviedb.org/3"; // Main API endpoint for data requests
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p"; // CDN endpoint for movie images/posters

/**
 * Service class for interacting with The Movie Database (TMDB) API
 * Provides methods for fetching movie data, images, and handling API responses
 * Includes error handling, parameter validation, and graceful fallbacks
 */
class TMDBService {
  constructor() {
    // Load API key from environment variables
    this.apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
    this.baseURL = TMDB_BASE_URL;
    this.imageBaseURL = TMDB_IMAGE_BASE_URL;
  }

  /**
   * Core method for making requests to TMDB API with error handling
   * Automatically appends API key and formats parameters
   * @param {string} endpoint - API endpoint path (e.g., '/movie/popular')
   * @param {Object} params - Additional query parameters
   * @returns {Promise<Object|null>} API response data or null on error
   */
  async fetchFromTMDB(endpoint, params = {}) {
    // Early return with warning if API key is missing
    if (!this.apiKey) {
      console.warn("TMDB API key not found. Using mock data.");
      return null;
    }

    try {
      // Construct URL with base endpoint
      const url = new URL(`${this.baseURL}${endpoint}`);

      // Always include API key in requests
      url.searchParams.append("api_key", this.apiKey);

      // Add additional parameters, filtering out null/undefined values
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, value.toString());
        }
      });

      // Make HTTP request to TMDB API
      const response = await fetch(url.toString());

      // Check for HTTP errors and throw descriptive error
      if (!response.ok) {
        throw new Error(
          `TMDB API error: ${response.status} ${response.statusText}`
        );
      }

      // Parse and return JSON response
      return await response.json();
    } catch (error) {
      console.error("TMDB API Error:", error);
      return null; // Return null to allow graceful fallback handling
    }
  }

  /**
   * Generic method for constructing TMDB image URLs
   * @param {string} path - Image path from TMDB API response
   * @param {string} size - Image size (w185, w342, w500, w780, original, etc.)
   * @returns {string|null} Complete image URL or null if no path provided
   */
  getImageUrl(path, size = "w500") {
    if (!path) return null;
    return `${this.imageBaseURL}/${size}${path}`;
  }

  /**
   * Get poster image URL with default size optimized for movie cards
   * @param {string} path - Poster path from movie data
   * @param {string} size - Image size (defaults to w500 for balance of quality/performance)
   * @returns {string|null} Complete poster URL
   */
  getPosterUrl(path, size = "w500") {
    return this.getImageUrl(path, size);
  }

  /**
   * Get backdrop/hero image URL with default size optimized for banners
   * @param {string} path - Backdrop path from movie data
   * @param {string} size - Image size (defaults to w1280 for high-quality banners)
   * @returns {string|null} Complete backdrop URL
   */
  getBackdropUrl(path, size = "w1280") {
    return this.getImageUrl(path, size);
  }

  /**
   * Get profile image URL for cast/crew photos
   * @param {string} path - Profile path from person data
   * @param {string} size - Image size (defaults to w185 for profile thumbnails)
   * @returns {string|null} Complete profile URL
   */
  getProfileUrl(path, size = "w185") {
    return this.getImageUrl(path, size);
  }

  /**
   * Fetch trending content across different media types and time windows
   * @param {string} mediaType - Content type: 'all', 'movie', 'tv', 'person'
   * @param {string} timeWindow - Time period: 'day' or 'week'
   * @returns {Promise<Object|null>} Trending content data
   */
  async getTrending(mediaType = "all", timeWindow = "week") {
    return await this.fetchFromTMDB(`/trending/${mediaType}/${timeWindow}`);
  }

  /**
   * Fetch popular movies with pagination support
   * @param {number} page - Page number for results (defaults to 1)
   * @returns {Promise<Object|null>} Popular movies data with results array
   */
  async getPopularMovies(page = 1) {
    return await this.fetchFromTMDB("/movie/popular", { page });
  }

  /**
   * Fetch top-rated movies based on user ratings
   * @param {number} page - Page number for results
   * @returns {Promise<Object|null>} Top-rated movies data
   */
  async getTopRatedMovies(page = 1) {
    return await this.fetchFromTMDB("/movie/top_rated", { page });
  }

  /**
   * Fetch upcoming movie releases
   * @param {number} page - Page number for results
   * @returns {Promise<Object|null>} Upcoming movies data
   */
  async getUpcomingMovies(page = 1) {
    return await this.fetchFromTMDB("/movie/upcoming", { page });
  }

  /**
   * Fetch movies currently playing in theaters
   * @param {number} page - Page number for results
   * @returns {Promise<Object|null>} Now playing movies data
   */
  async getNowPlayingMovies(page = 1) {
    return await this.fetchFromTMDB("/movie/now_playing", { page });
  }

  /**
   * Fetch detailed information for a specific movie
   * Includes additional data like cast, videos, reviews, and recommendations
   * @param {string|number} movieId - TMDB movie ID
   * @returns {Promise<Object|null>} Detailed movie data with appended responses
   */
  async getMovieDetails(movieId) {
    return await this.fetchFromTMDB(`/movie/${movieId}`, {
      // Request additional related data in single API call for efficiency
      append_to_response: "credits,videos,reviews,similar,recommendations",
    });
  }

  /**
   * Search for movies by query string
   * @param {string} query - Search term (movie title, keywords, etc.)
   * @param {number} page - Page number for paginated results
   * @returns {Promise<Object|null>} Search results or null if query is empty
   */
  async searchMovies(query, page = 1) {
    // Validate query before making API request
    if (!query.trim()) return null;

    return await this.fetchFromTMDB("/search/movie", {
      query: query.trim(), // Remove leading/trailing whitespace
      page,
    });
  }
}

// Export singleton instance for use across the application
// Using singleton pattern ensures consistent API key usage and prevents multiple instances
export const tmdbService = new TMDBService();
