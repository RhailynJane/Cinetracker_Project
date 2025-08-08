"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { doc, updateDoc, getDoc, setDoc } from "firebase/firestore";
import { getDbInstance } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

/**
 * Custom hook for managing user's movie lists (watchlist, watched, favorites)
 * Provides seamless sync between Firestore (authenticated users) and localStorage (offline/guest users)
 * Handles data persistence, loading states, and user feedback through toasts
 *
 * @returns {Object} Object containing list data, loading state, and CRUD functions for all lists
 */
export function useWatchlist() {
  // State for storing all user list data
  const [data, setData] = useState({
    watchlist: [], // Array of movie IDs user wants to watch
    watched: [], // Array of objects with id, rating, dateWatched for movies user has seen
    favorites: [], // Array of movie IDs user has favorited
  });
  const [loading, setLoading] = useState(true); // Loading state during initial data fetch

  // Get authentication state and toast notification system
  const { user, initialized } = useAuth();
  const { toast } = useToast();

  // Load user data when authentication state changes
  useEffect(() => {
    if (!initialized) return; // Wait for auth to initialize

    // Load from Firestore if authenticated, otherwise use localStorage
    if (user) loadUserData();
    else loadLocalData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, initialized]);

  /**
   * Loads user data from Firestore for authenticated users
   * Creates default document structure if user document doesn't exist
   * Falls back to local data if Firestore operation fails
   */
  const loadUserData = async () => {
    if (!user) return;

    try {
      const db = getDbInstance();
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        // Load existing user data from Firestore
        const userData = userDoc.data();
        setData({
          watchlist: userData.watchlist || [],
          watched: userData.watched || [],
          favorites: userData.favorites || [],
        });
      } else {
        // Create new user document with default empty arrays
        await setDoc(
          userDocRef,
          { watchlist: [], watched: [], favorites: [] },
          { merge: true }
        );
        setData({ watchlist: [], watched: [], favorites: [] });
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      // Fallback to local data if Firestore fails
      loadLocalData();
      toast({
        title: "Using offline data",
        description: "Unable to sync with server, using local data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Loads user data from localStorage for offline/guest users
   * Gracefully handles parsing errors and missing data
   */
  const loadLocalData = () => {
    try {
      const savedData = localStorage.getItem("cinetracker-data");
      if (savedData) {
        const parsed = JSON.parse(savedData);
        setData(parsed);
      }
    } catch (error) {
      console.error("Error parsing saved data:", error);
      // Keep default empty state if parsing fails
    } finally {
      setLoading(false);
    }
  };

  /**
   * Unified save function that handles both Firestore and localStorage persistence
   * Prioritizes Firestore for authenticated users, falls back to localStorage on error
   * @param {Object} newData - Updated data object to save
   */
  const saveData = async (newData) => {
    setData(newData); // Update local state immediately for optimistic UI

    if (user) {
      // Authenticated user: save to Firestore
      try {
        const db = getDbInstance();
        const userDocRef = doc(db, "users", user.uid);
        await updateDoc(userDocRef, newData);
      } catch (error) {
        console.error("Error saving to Firestore:", error);
        // Fallback to localStorage if Firestore fails
        localStorage.setItem("cinetracker-data", JSON.stringify(newData));
        toast({
          title: "Saved locally",
          description:
            "Data saved locally, will sync when connection is restored.",
          variant: "destructive",
        });
      }
    } else {
      // Guest user: save to localStorage only
      localStorage.setItem("cinetracker-data", JSON.stringify(newData));
    }
  };

  // ============ WATCHLIST FUNCTIONS ============

  /**
   * Adds a movie to the user's watchlist
   * Prevents duplicates by filtering out existing entry before adding
   * @param {string|number} id - Movie ID to add
   */
  const addToWatchlist = async (id) => {
    const newData = {
      ...data,
      watchlist: [...data.watchlist.filter((item) => item !== id), id],
    };
    await saveData(newData);
    toast({
      title: "Added to watchlist",
      description: "Item has been added to your watchlist.",
    });
  };

  /**
   * Removes a movie from the user's watchlist
   * @param {string|number} id - Movie ID to remove
   */
  const removeFromWatchlist = async (id) => {
    const newData = {
      ...data,
      watchlist: data.watchlist.filter((item) => item !== id),
    };
    await saveData(newData);
    toast({
      title: "Removed from watchlist",
      description: "Item has been removed from your watchlist.",
    });
  };

  /**
   * Checks if a movie is in the user's watchlist
   * @param {string|number} id - Movie ID to check
   * @returns {boolean} True if movie is in watchlist
   */
  const isInWatchlist = (id) => data.watchlist.includes(id);

  // ============ WATCHED FUNCTIONS ============

  /**
   * Adds a movie to the user's watched list with optional rating
   * Stores additional metadata: rating and watch date
   * @param {string|number} id - Movie ID to add
   * @param {number} rating - User rating (0-10, defaults to 0)
   */
  const addToWatched = async (id, rating = 0) => {
    const newData = {
      ...data,
      watched: [
        ...data.watched.filter((item) => item.id !== id), // Remove existing entry
        {
          id,
          rating,
          dateWatched: new Date().toISOString().split("T")[0], // Store as YYYY-MM-DD
        },
      ],
    };
    await saveData(newData);
    toast({
      title: "Marked as watched",
      description: "Item has been added to your watched list.",
    });
  };

  /**
   * Removes a movie from the user's watched list
   * @param {string|number} id - Movie ID to remove
   */
  const removeFromWatched = async (id) => {
    const newData = {
      ...data,
      watched: data.watched.filter((item) => item.id !== id),
    };
    await saveData(newData);
    toast({
      title: "Removed from watched",
      description: "Item has been removed from your watched list.",
    });
  };

  /**
   * Updates the rating for a movie in the watched list
   * @param {string|number} id - Movie ID to update
   * @param {number} rating - New rating value
   */
  const updateWatchedRating = async (id, rating) => {
    const newData = {
      ...data,
      watched: data.watched.map((item) =>
        item.id === id ? { ...item, rating } : item
      ),
    };
    await saveData(newData);
    toast({
      title: "Rating updated",
      description: `Rating has been updated to ${rating} stars.`,
    });
  };

  /**
   * Checks if a movie is in the user's watched list
   * @param {string|number} id - Movie ID to check
   * @returns {boolean} True if movie is in watched list
   */
  const isInWatched = (id) => data.watched.some((item) => item.id === id);

  // ============ FAVORITES FUNCTIONS ============

  /**
   * Adds a movie to the user's favorites list
   * Prevents duplicates by filtering out existing entry before adding
   * @param {string|number} id - Movie ID to add
   */
  const addToFavorites = async (id) => {
    const newData = {
      ...data,
      favorites: [...data.favorites.filter((item) => item !== id), id],
    };
    await saveData(newData);
    toast({
      title: "Added to favorites",
      description: "Item has been added to your favorites.",
    });
  };

  /**
   * Removes a movie from the user's favorites list
   * @param {string|number} id - Movie ID to remove
   */
  const removeFromFavorites = async (id) => {
    const newData = {
      ...data,
      favorites: data.favorites.filter((item) => item !== id),
    };
    await saveData(newData);
    toast({
      title: "Removed from favorites",
      description: "Item has been removed from your favorites.",
    });
  };

  /**
   * Checks if a movie is in the user's favorites list
   * @param {string|number} id - Movie ID to check
   * @returns {boolean} True if movie is in favorites
   */
  const isFavorite = (id) => data.favorites.includes(id);

  // Return all data and functions for consuming components
  return {
    // Current list data
    watchlist: data.watchlist,
    watched: data.watched,
    favorites: data.favorites,
    loading,

    // Watchlist management
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,

    // Watched list management
    addToWatched,
    removeFromWatched,
    updateWatchedRating,
    isInWatched,

    // Favorites management
    addToFavorites,
    removeFromFavorites,
    isFavorite,
  };
}
