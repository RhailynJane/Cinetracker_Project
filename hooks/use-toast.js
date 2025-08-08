"use client";

import * as React from "react";

// Configuration constants for toast behavior
const TOAST_LIMIT = 3; // Maximum number of toasts shown at once
const TOAST_REMOVE_DELAY = 4000; // Delay in milliseconds before auto-removing dismissed toasts

// Action types for the toast reducer - manages state changes
const actionTypes = {
  ADD_TOAST: "ADD_TOAST", // Add new toast to the stack
  UPDATE_TOAST: "UPDATE_TOAST", // Update existing toast properties
  DISMISS_TOAST: "DISMISS_TOAST", // Mark toast as dismissed (start fade out)
  REMOVE_TOAST: "REMOVE_TOAST", // Completely remove toast from DOM
};

// Global counter for generating unique toast IDs
let count = 0;
/**
 * Generates unique sequential IDs for toasts
 * Uses modulo to prevent overflow and maintain uniqueness
 * @returns {string} Unique toast identifier
 */
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

// Map to track removal timeouts for each toast
// Prevents multiple timeouts for the same toast and allows cancellation
const toastTimeouts = new Map();

/**
 * Adds a toast to the removal queue with automatic cleanup
 * Prevents duplicate timeouts and ensures proper cleanup after delay
 * @param {string} toastId - ID of the toast to queue for removal
 */
const addToRemoveQueue = (toastId) => {
  // Prevent duplicate timeouts for the same toast
  if (toastTimeouts.has(toastId)) return;

  // Set timeout to remove toast after delay
  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId); // Clean up timeout reference
    dispatch({ type: actionTypes.REMOVE_TOAST, toastId }); // Remove from state
  }, TOAST_REMOVE_DELAY);

  toastTimeouts.set(toastId, timeout);
};

/**
 * Toast state reducer - handles all toast state mutations
 * Manages adding, updating, dismissing, and removing toasts
 * @param {Object} state - Current toast state with toasts array
 * @param {Object} action - Action object with type and payload
 * @returns {Object} New state object
 */
export const reducer = (state, action) => {
  switch (action.type) {
    case actionTypes.ADD_TOAST:
      // Add new toast to beginning of array and enforce limit
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    case actionTypes.UPDATE_TOAST:
      // Update specific toast by ID, preserving others
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      };

    case actionTypes.DISMISS_TOAST: {
      const { toastId } = action;

      // Queue for removal: specific toast or all toasts if no ID provided
      if (toastId) addToRemoveQueue(toastId);
      else state.toasts.forEach((t) => addToRemoveQueue(t.id));

      // Mark toast(s) as closed to trigger exit animation
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined ? { ...t, open: false } : t
        ),
      };
    }

    case actionTypes.REMOVE_TOAST:
      // Remove all toasts if no ID specified, otherwise remove specific toast
      if (action.toastId === undefined) return { ...state, toasts: [] };
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };

    default:
      return state;
  }
};

// Global state management for toasts (outside React component lifecycle)
const listeners = []; // Array of state listener functions (React setState functions)
let memoryState = { toasts: [] }; // Global state stored in memory

/**
 * Dispatches actions to update global toast state
 * Updates memory state and notifies all subscribed components
 * @param {Object} action - Action object to process
 */
function dispatch(action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((l) => l(memoryState)); // Notify all subscribed components
}

/**
 * Creates and displays a new toast notification
 * Returns control functions for updating and dismissing the toast
 * @param {Object} props - Toast configuration (title, description, variant, etc.)
 * @returns {Object} Object with id, dismiss, and update functions
 */
function toast({ ...props }) {
  const id = genId();

  // Function to update toast properties after creation
  const update = (props) =>
    dispatch({ type: actionTypes.UPDATE_TOAST, toast: { ...props, id } });

  // Function to dismiss this specific toast
  const dismiss = () =>
    dispatch({ type: actionTypes.DISMISS_TOAST, toastId: id });

  // Add toast to state with default properties
  dispatch({
    type: actionTypes.ADD_TOAST,
    toast: {
      ...props,
      id,
      open: true, // Start in open state
      onOpenChange: (open) => {
        // Handle close events from UI interactions
        if (!open) dismiss();
      },
    },
  });

  return { id, dismiss, update };
}

/**
 * React hook for accessing toast state and functions
 * Subscribes component to global toast state changes
 * @returns {Object} Toast state and control functions
 */
function useToast() {
  const [state, setState] = React.useState(memoryState);

  // Subscribe to global state changes on mount, unsubscribe on unmount
  React.useEffect(() => {
    listeners.push(setState); // Add this component's setState to listeners

    return () => {
      // Cleanup: remove setState from listeners to prevent memory leaks
      const idx = listeners.indexOf(setState);
      if (idx > -1) listeners.splice(idx, 1);
    };
  }, []);

  return {
    ...state, // Current toast state (toasts array)
    toast, // Function to create new toasts
    dismiss: (toastId) =>
      dispatch({ type: actionTypes.DISMISS_TOAST, toastId }), // Function to dismiss toasts
  };
}

export { useToast, toast };
