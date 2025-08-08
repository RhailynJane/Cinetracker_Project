"use client";

import Link from "next/link";
import { Clapperboard, LogOut } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";

/**
 * Header component provides global navigation for the CineTracker application
 * Displays different navigation options based on user authentication status:
 * - Shows brand logo/name for all users
 * - Shows navigation menu and sign out button for authenticated users
 * - Shows minimal layout for unauthenticated users
 *
 * @returns {JSX.Element} The application header with conditional navigation
 */
export default function Header() {
  // Get current user and signOut function from authentication context
  const { user, signOut } = useAuth();

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 h-14 flex items-center gap-3">
        {/* Brand logo and name - always visible, links to home page */}
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Clapperboard className="h-5 w-5" />
          {/* Hide brand name on small screens to save space */}
          <span className="hidden sm:inline">CineTracker</span>
        </Link>

        {/* Conditional navigation based on authentication status */}
        {user ? (
          // Navigation for authenticated users
          <nav className="ml-auto flex items-center gap-2">
            {/* Main navigation links - hidden on mobile to prevent crowding */}
            <Link
              href="/watchlist"
              className="hidden sm:inline-flex items-center rounded-md px-3 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              Watchlist
            </Link>
            <Link
              href="/favorites"
              className="hidden sm:inline-flex items-center rounded-md px-3 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              Favorites
            </Link>
            <Link
              href="/watched"
              className="hidden sm:inline-flex items-center rounded-md px-3 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              Watched
            </Link>
            <Link
              href="/profile"
              className="hidden sm:inline-flex items-center rounded-md px-3 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              Profile
            </Link>

            {/* Sign out button - always visible for authenticated users */}
            <Button type="button" variant="outline" size="sm" onClick={signOut}>
              <LogOut className="mr-2 h-4 w-4" />
              {"Sign out"}
            </Button>
          </nav>
        ) : (
          // Empty spacer for unauthenticated users to maintain layout alignment
          // Pushes the brand logo to the left without any navigation items
          <div className="ml-auto" />
        )}
      </div>
    </header>
  );
}
