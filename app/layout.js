import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

// Metadata for the application - appears in browser tab and search results
export const metadata = {
  title: "CineTracker",
  description: "Discover, track, and manage your entertainment",
};

/**
 * Root layout component for the Next.js application
 * This component wraps all pages and provides global providers and configuration
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components/pages to render
 * @returns {JSX.Element} The root layout with all providers
 */
export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {/* Theme provider for dark/light mode functionality */}
        <ThemeProvider
          attribute="class" // Uses CSS classes for theme switching
          defaultTheme="system" // Follows system preference by default
          enableSystem // Allows system theme detection
          disableTransitionOnChange // Prevents flash during theme changes
        >
          {/* Authentication provider for user session management */}
          <AuthProvider>
            {/* Main application content */}
            {children}
            {/* Toast notification component for user feedback */}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
