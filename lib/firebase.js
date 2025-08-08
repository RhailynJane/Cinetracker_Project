import { initializeApp, getApps, getApp } from "firebase/app";

/**
 * Firebase configuration object constructed from environment variables
 * All values are loaded from NEXT_PUBLIC_* environment variables to ensure
 * they're available in the browser environment
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY, // Firebase API key for authentication
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, // Domain for Firebase Auth
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID, // Unique Firebase project identifier
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET, // Cloud Storage bucket
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID, // FCM sender ID
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID, // Unique Firebase app identifier
};

/**
 * Validates that essential Firebase configuration values are present
 * Only checks the minimum required fields for basic Firebase functionality
 * Missing optional fields (like storageBucket, messagingSenderId) won't prevent initialization
 */
const hasFirebaseConfig = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.appId
);

// Global Firebase app instance variable
let app = null;

// Initialize Firebase app with error handling and fallback strategies
if (!hasFirebaseConfig) {
  // Log warning if required environment variables are missing
  console.warn("Firebase config missing. Set NEXT_PUBLIC_FIREBASE_* env vars.");
} else {
  try {
    // Check if Firebase app is already initialized to prevent duplicate initialization
    // getApps() returns array of all initialized Firebase apps
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  } catch (error) {
    console.error("Firebase initialization error:", error);

    try {
      // Fallback: attempt direct initialization if getApp() failed
      // This can happen in certain edge cases or during hot reloading in development
      app = initializeApp(firebaseConfig);
    } catch (e) {
      // Final fallback: log error and set app to null
      // Application will continue to work but without Firebase functionality
      console.error("Firebase failed to initialize with provided config.", e);
      app = null;
    }
  }
}

// Export the Firebase app instance for use in other modules
export default app;

// Export configuration validation flag for components to check Firebase availability
export { hasFirebaseConfig };
