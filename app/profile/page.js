"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useRouter } from "next/navigation";
import { getDbInstance } from "@/lib/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { useTheme } from "next-themes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sun, Moon, Check } from "lucide-react";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/Header";

/**
 * Profile page component that allows users to view and edit their personal information,
 * manage theme settings, and view their movie statistics
 */
export default function ProfilePage() {
  const router = useRouter();
  const { user, initialized } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { watchlist, watched, favorites } = useWatchlist();
  const { toast } = useToast();

  // Profile form fields state
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [age, setAge] = useState("");
  const [address, setAddress] = useState("");

  // UI state management
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  /**
   * Generates avatar initials and color based on user information
   * Creates consistent visual identity for each user
   */
  const getAvatarInfo = () => {
    const name = fullName || user?.email || "User";

    // Extract up to 2 initials from the name
    const initials = name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    // Generate a consistent color based on user email hash
    const colors = [
      "bg-red-500",
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-teal-500",
    ];

    // Use email's first character code to select consistent color
    const colorIndex = user?.email
      ? user.email.charCodeAt(0) % colors.length
      : 0;

    return { initials, colorClass: colors[colorIndex] };
  };

  // Authentication guard and profile loading
  useEffect(() => {
    if (!initialized) return; // Wait for auth to initialize

    if (!user) {
      router.replace("/auth?mode=login");
      return;
    }

    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialized, user]);

  /**
   * Loads user profile data from Firestore
   * Creates user document if it doesn't exist
   */
  async function loadProfile() {
    try {
      setLoading(true);
      setSaving(false);

      const db = getDbInstance();
      if (!db || !user) return;

      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        // Load existing profile data
        const data = snap.data();
        setFullName(data.displayName || "");
        setPhoneNumber(data.phoneNumber || "");
        setAge(data.age || "");
        setAddress(data.address || "");
      } else {
        // Initialize new user document with default values
        await setDoc(
          ref,
          {
            displayName: "",
            phoneNumber: "",
            age: "",
            address: "",
            watchlist: [],
            watched: [],
            favorites: [],
          },
          { merge: true } // Don't overwrite existing fields
        );
      }
    } catch (e) {
      console.error("Failed to load profile", e);
      toast({
        title: "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  /**
   * Saves profile changes to Firestore
   * Handles form submission and validation
   */
  async function saveProfile(e) {
    e.preventDefault();

    if (saving) return; // Prevent double submission

    try {
      setSaving(true);
      const db = getDbInstance();
      if (!db || !user) return;

      // Update user document with new profile data
      await updateDoc(doc(db, "users", user.uid), {
        displayName: fullName,
        phoneNumber,
        age,
        address,
      });

      toast({ title: "Changes saved successfully" });
      setIsEditing(false); // Exit edit mode
    } catch (e) {
      console.error("Failed to save profile", e);
      toast({
        title: "Failed to save changes",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  /**
   * Enters edit mode and resets saving state
   */
  const handleEditClick = () => {
    setSaving(false);
    setIsEditing(true);
  };

  /**
   * Cancels editing and reverts any unsaved changes
   */
  const handleCancel = () => {
    setIsEditing(false);
    setSaving(false);
    loadProfile(); // Reload original data to discard changes
  };

  // Don't render anything if user is not authenticated
  if (!user) return null;

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Profile header with avatar, title, and theme controls */}
        <div className="flex items-center gap-3 mb-6">
          {/* Generated avatar with initials */}
          <div
            className={`relative w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl ${
              getAvatarInfo().colorClass
            }`}
          >
            {getAvatarInfo().initials}
            {/* Saving overlay indicator */}
            {saving && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center rounded-full">
                <div className="text-white font-semibold text-xs">
                  Saving...
                </div>
              </div>
            )}
          </div>

          {/* Profile title and user email */}
          <div>
            <h1 className="text-3xl font-bold">Profile</h1>
            <p className="text-muted-foreground">{user.email}</p>
          </div>

          {/* Theme toggle controls */}
          <div className="ml-auto flex items-center gap-2">
            <Button
              size="sm"
              variant={resolvedTheme === "light" ? "default" : "outline"}
              onClick={() => setTheme("light")}
              aria-label="Light mode"
            >
              <Sun className="h-4 w-4 mr-1" /> Light
            </Button>
            <Button
              size="sm"
              variant={resolvedTheme === "dark" ? "default" : "outline"}
              onClick={() => setTheme("dark")}
              aria-label="Dark mode"
            >
              <Moon className="h-4 w-4 mr-1" /> Dark
            </Button>
            {/* Current theme indicator */}
            <Badge variant="secondary" className="ml-2">
              Theme: {resolvedTheme || theme}
            </Badge>
          </div>
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile information form */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 max-w-md">
                {/* Full Name field */}
                <label
                  className="text-sm text-muted-foreground"
                  htmlFor="fullName"
                >
                  Full Name
                </label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.currentTarget.value)}
                  placeholder="Your full name"
                  disabled={!isEditing}
                  required
                />

                {/* Email field (read-only) */}
                <label
                  className="text-sm text-muted-foreground"
                  htmlFor="email"
                >
                  Email Address
                </label>
                <Input
                  id="email"
                  value={user.email}
                  disabled // Email cannot be changed
                  placeholder="Email address"
                />

                {/* Phone Number field */}
                <label
                  className="text-sm text-muted-foreground"
                  htmlFor="phoneNumber"
                >
                  Phone Number
                </label>
                <Input
                  id="phoneNumber"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.currentTarget.value)}
                  placeholder="Phone number"
                  disabled={!isEditing}
                />

                {/* Age field */}
                <label className="text-sm text-muted-foreground" htmlFor="age">
                  Age
                </label>
                <Input
                  id="age"
                  type="number"
                  min={0}
                  value={age}
                  onChange={(e) => setAge(e.currentTarget.value)}
                  placeholder="Age"
                  disabled={!isEditing}
                />

                {/* Address field */}
                <label
                  className="text-sm text-muted-foreground"
                  htmlFor="address"
                >
                  Address
                </label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.currentTarget.value)}
                  placeholder="Address"
                  disabled={!isEditing}
                />

                {/* Action buttons - Edit/Save/Cancel */}
                <div className="flex gap-2 mt-4">
                  {!isEditing ? (
                    <Button type="button" onClick={handleEditClick}>
                      Edit Profile
                    </Button>
                  ) : (
                    <form onSubmit={saveProfile} className="contents">
                      <Button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2"
                      >
                        {saving ? "Saving..." : "Save Changes"}
                        {saving && <Check className="h-4 w-4" />}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                        disabled={saving}
                      >
                        Cancel
                      </Button>
                    </form>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User statistics sidebar */}
          <Card>
            <CardHeader>
              <CardTitle>Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Watchlist count */}
              <div className="flex items-center justify-between">
                <span>Watchlist</span>
                <Badge variant="secondary">{watchlist.length}</Badge>
              </div>
              {/* Favorites count */}
              <div className="flex items-center justify-between">
                <span>Favorites</span>
                <Badge variant="secondary">{favorites.length}</Badge>
              </div>
              {/* Watched count */}
              <div className="flex items-center justify-between">
                <span>Watched</span>
                <Badge variant="secondary">{watched.length}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
