"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "./AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

/**
 * AuthCard component handles user authentication (login/register)
 * Provides a unified interface for both login and registration flows
 * with form validation, error handling, and loading states
 *
 * @param {Object} props - Component props
 * @param {string} props.mode - Initial view mode ('login' | 'register')
 * @returns {JSX.Element} Authentication card component
 */
export default function AuthCard({ mode = "login" }) {
  // State management for form view and user input
  const [view, setView] = useState(mode); // Current view: 'login' | 'register'
  const [email, setEmail] = useState(""); // Email input value
  const [password, setPassword] = useState(""); // Password input value
  const [confirm, setConfirm] = useState(""); // Password confirmation (register only)
  const [submitting, setSubmitting] = useState(false); // Form submission loading state

  // Auth context and toast notifications
  const { login, register, firebaseReady } = useAuth();
  const { toast } = useToast();

  // Update view when mode prop changes (e.g., from URL parameter)
  useEffect(() => {
    setView(mode);
  }, [mode]);

  /**
   * Handle form submission for both login and registration
   * Includes validation, error handling, and user feedback
   */
  const onSubmit = async (e) => {
    e.preventDefault();

    // Prevent submission if Firebase is not ready
    if (!firebaseReady) return;

    // Validate password confirmation for registration
    if (view === "register" && password !== confirm) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }

    try {
      setSubmitting(true);

      if (view === "register") {
        // Create new user account
        await register(email, password);
        toast({
          title: "Account created",
          description: "Welcome to CineTracker!",
        });
      } else {
        // Log in existing user
        await login(email, password);
      }
    } catch (err) {
      // Handle authentication errors with user-friendly messages
      toast({
        title: "Authentication failed",
        description: err?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      // Reset loading state regardless of success/failure
      setSubmitting(false);
    }
  };

  return (
    <Card
      className="backdrop-blur supports-[backdrop-filter]:bg-background/80"
      id="auth"
    >
      {/* Card header with dynamic title and description based on view */}
      <CardHeader>
        <CardTitle>
          {view === "login" ? "Log in" : "Create your account"}
        </CardTitle>
        <CardDescription>
          {view === "login"
            ? "Access your lists and favorites."
            : "Start building your movie lists."}
        </CardDescription>
      </CardHeader>

      <CardContent className="grid gap-3">
        {/* Firebase configuration warning */}
        {!firebaseReady && (
          <Alert variant="destructive">
            <AlertTitle>Firebase not configured</AlertTitle>
            <AlertDescription>
              Set NEXT_PUBLIC_FIREBASE_* environment variables to enable
              authentication.
            </AlertDescription>
          </Alert>
        )}

        {/* Authentication form */}
        <form className="grid gap-3" onSubmit={onSubmit}>
          {/* Email input field */}
          <Input
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
            aria-label="Email"
            disabled={!firebaseReady}
          />

          {/* Password input field */}
          <Input
            type="password"
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
            aria-label="Password"
            disabled={!firebaseReady}
          />

          {/* Password confirmation field - only shown during registration */}
          {view === "register" && (
            <Input
              type="password"
              required
              placeholder="Confirm password"
              value={confirm}
              onChange={(e) => setConfirm(e.currentTarget.value)}
              aria-label="Confirm password"
              disabled={!firebaseReady}
            />
          )}

          {/* Primary submit button with dynamic text and loading states */}
          <Button
            type="submit"
            disabled={submitting || !firebaseReady}
            className="w-full"
          >
            {submitting
              ? view === "login"
                ? "Logging in..."
                : "Creating account..."
              : view === "login"
              ? "Log in"
              : "Sign up"}
          </Button>

          {/* Toggle button to switch between login and register views */}
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() =>
              setView((v) => (v === "login" ? "register" : "login"))
            }
          >
            {view === "login"
              ? "Don't have an account? Sign up"
              : "Already have an account? Log in"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
