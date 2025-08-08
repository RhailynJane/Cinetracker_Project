"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import AuthCard from "@/components/auth/AuthCard";
import Header from "@/components/layout/Header";
import { useAuth } from "@/components/auth/AuthProvider";

/**
 * Authentication page component that handles both login and registration
 * Automatically redirects authenticated users to the home page
 */
export default function AuthPage() {
  const params = useSearchParams();
  // Extract mode from URL params, default to "register" if not "login"
  const mode = params.get("mode") === "login" ? "login" : "register";
  const { user } = useAuth();
  const router = useRouter();

  // Redirect authenticated users away from auth page
  useEffect(() => {
    if (user) router.replace("/");
  }, [user, router]);

  return (
    <div className="min-h-[100dvh] flex flex-col">
      {/* Header component for navigation */}
      <Header />

      {/* Main content area with full-screen background */}
      <main className="flex-1">
        <section className="relative">
          {/* Background image with dark overlay */}
          <div className="absolute inset-0">
            <img
              src="/cinemabackground.png"
              alt="Background"
              className="h-full w-full object-cover"
            />
            {/* Dark overlay to improve text readability */}
            <div className="absolute inset-0 bg-black/60" />
          </div>

          {/* Content container positioned above background */}
          <div className="relative container mx-auto px-4">
            {/* Centered auth card with full viewport height minus header */}
            <div className="min-h-[calc(100dvh-56px)] flex items-center justify-center py-10">
              <div className="w-full max-w-md">
                {/* Auth card component that handles login/register forms */}
                <AuthCard mode={mode} />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer with copyright and tech stack info */}
      <footer className="border-t">
        <div className="container mx-auto px-4 py-6 text-sm text-muted-foreground flex items-center justify-between">
          {/* Dynamic copyright year */}
          <span>{"© " + new Date().getFullYear() + " CineTracker"}</span>
          {/* Technology stack credits */}
          <span>{"Built with Next.js + Firebase + TMDB"}</span>
        </div>
      </footer>
    </div>
  );
}
