import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import app, { hasFirebaseConfig } from "./firebase";

// Initialize auth and db as null - they'll be lazily loaded when needed
let auth = null;
let db = null;

/**
 * Returns a Firebase Auth instance, creating it lazily if needed.
 * Uses singleton pattern to avoid multiple Auth instances.
 *
 * @returns {Auth|null} Firebase Auth instance or null if config is missing
 */
export const getAuthInstance = () => {
  // Check if Firebase is properly configured before attempting to use it
  if (!hasFirebaseConfig || !app) {
    console.warn("Firebase Auth unavailable. Missing env config.");
    return null;
  }

  // Lazy initialization - only create auth instance when first requested
  if (!auth) auth = getAuth(app);
  return auth;
};

/**
 * Returns a Firestore database instance, creating it lazily if needed.
 * Uses singleton pattern to avoid multiple Firestore instances.
 *
 * @returns {Firestore|null} Firestore instance or null if config is missing
 */
export const getDbInstance = () => {
  // Check if Firebase is properly configured before attempting to use it
  if (!hasFirebaseConfig || !app) {
    console.warn("Firestore unavailable. Missing env config.");
    return null;
  }

  // Lazy initialization - only create db instance when first requested
  if (!db) db = getFirestore(app);
  return db;
};

// Export the instances and config flag for backward compatibility
// Note: These may be null initially and will be populated by the getter functions
export { auth, db, hasFirebaseConfig };
