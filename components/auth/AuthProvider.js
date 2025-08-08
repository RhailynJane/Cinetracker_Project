"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getAuthInstance, getDbInstance, hasFirebaseConfig } from "@/lib/auth";

// Create React context for sharing authentication state across the app
const AuthContext = createContext(null);

/**
 * AuthProvider component manages authentication state and Firebase integration
 * Provides authentication methods and user state to all child components
 * Handles automatic user document creation in Firestore for new users
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to wrap with auth context
 * @returns {JSX.Element} Context provider with authentication functionality
 */
export function AuthProvider({ children }) {
  // Authentication state management
  const [user, setUser] = useState(null); // Current authenticated user (null if not logged in)
  const [loading, setLoading] = useState(true); // Loading state during auth initialization
  const [initialized, setInitialized] = useState(false); // Whether auth has finished initializing
  const firebaseReady = !!hasFirebaseConfig; // Check if Firebase environment variables are configured

  // Initialize Firebase authentication listener on component mount
  useEffect(() => {
    // Early exit if Firebase configuration is missing
    if (!firebaseReady) {
      setUser(null);
      setLoading(false);
      setInitialized(true);
      return;
    }

    // Get Firebase Auth instance
    const auth = getAuthInstance();
    if (!auth) {
      setUser(null);
      setLoading(false);
      setInitialized(true);
      return;
    }

    // Set up authentication state listener
    // This listener fires whenever the user's auth state changes (login/logout/token refresh)
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setUser(fbUser); // Update user state with Firebase user object (or null)
      setLoading(false); // Auth state is now determined
      setInitialized(true); // Mark initialization as complete

      // Create user document in Firestore for new users
      if (fbUser) {
        await ensureUserDoc(fbUser.uid);
      }
    });

    // Cleanup listener on component unmount
    return () => unsubscribe();
  }, [firebaseReady]);

  /**
   * Ensures a user document exists in Firestore for the given user ID
   * Creates default user data structure (watchlist, watched, favorites) if document doesn't exist
   * This is called automatically when a user signs in or registers
   *
   * @param {string} uid - Firebase user ID
   */
  const ensureUserDoc = async (uid) => {
    try {
      const db = getDbInstance();
      if (!db) return; // Exit if Firestore instance unavailable

      // Reference to user document in Firestore
      const ref = doc(db, "users", uid);
      const snap = await getDoc(ref);

      // Create document with default structure if it doesn't exist
      if (!snap.exists()) {
        await setDoc(
          ref,
          { watchlist: [], watched: [], favorites: [] }, // Default empty arrays for user lists
          { merge: true } // Merge with existing data (won't overwrite if doc exists)
        );
      }
    } catch (e) {
      // Log error but don't throw - user can still use the app without Firestore doc
      console.warn("Failed to ensure user doc", e);
    }
  };

  /**
   * Register a new user with email and password
   * Automatically creates user document in Firestore after successful registration
   *
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @throws {Error} If Firebase is not configured or registration fails
   */
  const register = async (email, password) => {
    const auth = getAuthInstance();
    if (!auth) throw new Error("Firebase not configured.");

    // Create new user account
    const cred = await createUserWithEmailAndPassword(auth, email, password);

    // Ensure user document exists in Firestore
    await ensureUserDoc(cred.user.uid);
  };

  /**
   * Sign in existing user with email and password
   *
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @throws {Error} If Firebase is not configured or login fails
   */
  const login = async (email, password) => {
    const auth = getAuthInstance();
    if (!auth) throw new Error("Firebase not configured.");

    await signInWithEmailAndPassword(auth, email, password);
  };

  /**
   * Sign out the current user
   * Clears authentication state and redirects to public view
   */
  const signOut = async () => {
    const auth = getAuthInstance();
    if (!auth) return; // Gracefully handle missing Firebase config

    await fbSignOut(auth);
  };

  // Memoize context value to prevent unnecessary re-renders
  // Only updates when the actual state values change
  const value = useMemo(
    () => ({
      user, // Current user object (null if not authenticated)
      loading, // Whether auth state is still being determined
      initialized, // Whether the auth provider has finished initializing
      firebaseReady, // Whether Firebase is properly configured
      register, // Function to create new user account
      login, // Function to sign in existing user
      signOut, // Function to sign out current user
    }),
    [user, loading, initialized, firebaseReady]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Custom hook to access authentication context
 * Provides type-safe access to auth state and methods
 * Must be used within an AuthProvider component
 *
 * @returns {Object} Authentication context value with user state and auth methods
 * @throws {Error} If used outside of AuthProvider
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
