# CineTracker - Your Personal Movie & TV Show Discovery Platform

## Project Team

## **Individual Project:** Rhailyn Jane Cona

## Project Description

**CineTracker** is a comprehensive web application built for movie and TV show enthusiasts who want to discover,
track, and manage their entertainment experience.
In todays overwhelming streaming landscape, users often struggle to decide _what to watch next_. CineTracker solves
this by offering:

- Personalized discovery tools
- Powerful search with filtering
- Real-time watchlist and favorite management
- Full Firebase integration with authentication
- A beautiful, responsive UI

---

## Planned Features

### Core Features (MVP)

- Browse trending movies and TV shows
- Search with filters (genre, year, rating)
- Detailed movie pages with cast, crew, and overview
- Personal watchlist and favorites
- User authentication (Email/Password)
- Real-time data sync with Firebase

### Stretch Goals

- User profile with viewing stats
- Responsive design across all devices
- Dark/Light theme toggle

---

## Technology Stack

| Layer          | Tech Used                                        |
| -------------- | ------------------------------------------------ |
| **Frontend**   | Next.js 14 (App Router), Tailwind CSS, shadcn/ui |
| **State Mgmt** | React Context API                                |
| **Auth**       | Firebase Auth (Email/Password)                   |
| **Database**   | Firebase Firestore                               |
| **APIs**       | TMDB API                                         |
| **Deployment** | Vercel                                           |

---

## Application Architecture

### Pages Structure

```bash
app/
 layout.js # Root layout with providers
 page.js # Homepage with trending content
 auth/ # Authentication pages
 favorites/ # User favorites
 movie/[id]/ # Movie detail pages
 profile/ # User profile
 watched/ # Watched history
 watchlist/ # User watchlist
```

### Component Structure

```bash
components/
 ui/ # shadcn/ui components
 layout/ # Header, Footer
 auth/ # AuthProvider, AuthModal
 movie/ # MovieCard, MovieGrid
 search/ # SearchBar, SearchFilters
 user/ # User-related components
```

### Data Flow

- Auth handled via Firebase Auth
- User data stored in Firestore
- TMDB API used for movie/show data
- Context API for state management
- Local storage fallback for offline/guest users

### API Integration Plan

- Primary API: TMDB API
- User Management: Firebase Auth
- Data Persistence: Firebase Firestore
- Strategies: Caching, throttling, graceful error fallback

### Timeline

| Week | Milestone                                  | Status |
| ---- | ------------------------------------------ | ------ |
| 1    | Project setup, Firebase integration        | Done   |
| 2    | TMDB API integration, search functionality | Done   |
| 3    | User auth, data persistence                | Done   |
| 4    | Testing, optimization, deployment          | Done   |

### Key Features Breakdown

** Content Discovery**

- TMDB integration for real-time movie content
- Advanced filters for precise search
- Weekly & daily trending movies
- Deep detail pages: cast, crew, recommendations
  ** User Authentication**
- Secure sign-in/sign-up via Firebase Email/Password
- Personalized dashboard & stats
- Real-time cross-device data sync
  ** List Management**
- Watchlist for pending content
- Favorites for loved content
- Watched history
- Firestore-powered real-time sync
  ** Modern UI/UX**
- Fully responsive across all devices
- System-aware dark/light theme
- Smooth transitions, skeletons
- WCAG-compliant accessibility

### Technical Architecture

**Frontend Stack**

- Next.js 14 (App Router)
- Tailwind CSS + shadcn/ui
- TypeScript
- Lucide React for icons
  **Backend & Services**
- TMDB API for movie content
- Firebase Auth for email/password auth
- Firestore for real-time DB
- Vercel for deployment
  **State & Data**
- Context API for global state
- Custom hooks for modularity
- Real-time listeners via Firestore
- Offline support via localStorage

### Project Structure Overview

```bash
cinetracker/
 app/
 layout.js
 page.js
 auth/
 movie/[id]/
 watchlist/
 favorites/
 watched/
 profile/
 components/
 auth/
 layout/
 movie/
 ui/
 user/
 lib/
 firebase.js
 auth.js
 tmdb.js
 utils.js
 hooks/
 useWatchlist.js
 styles/
```

### Authentication

- Firebase Email/Password authentication
- Route protection using Auth Context
- Real-time user session sync
- Token refresh and secure storage

### Data & API Handling

- Firestore: Real-time syncing for user data
- TMDB API: Movie discovery with error handling
- Caching, throttling, and graceful fallbacks
- Optimistic updates for faster UI feedback

### Performance Optimizations

- SSR for SEO and initial performance
- Lazy loading and image optimization
- Dynamic imports for route-based code splitting
- Minimal re-renders with React patterns

### Development Workflow

** Setup**

```bash
# Install dependencies
npm install
# Setup env vars
cp .env.local.example .env.local
# Add your API keys to .env.local
# Start dev server
npm run dev
```

** Localhost**
Visit: http://localhost:3000
** Deployment**

- Hosted on Vercel
- Automatic builds from Git
- Secrets managed via dashboard
- Edge function support

### Future Enhancements

- User-generated reviews & ratings
- Friend system and social features
- AI-powered recommendations
- Watchlist collaboration
- Native mobile app
- Offline mode with local caching
- Analytics dashboard

### Success Metrics (Targets)

| Area        | Goal                                   |
| ----------- | -------------------------------------- |
| Engagement  | 10,000+ MAUs, 15+ min avg session      |
| Retention   | 70%+ return rate within 30 days        |
| Feature Use | 85%+ create a list                     |
| Performance | <2s page load, 500ms API, 99.9% uptime |
| Mobile UX   | 90+ Lighthouse score                   |
| Discovery   | 95%+ search success, 1M+ content items |

## Conclusion

CineTracker is a robust, scalable, and feature-rich entertainment platform built with the latest in modern web
technologies.
