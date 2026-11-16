# 🏨 BookEase — Modern Full-Stack Property Rental & AI-Powered Hospitality Platform

**BookEase** is an enterprise-grade full-stack vacation rental, property management, and hospitality platform designed for high-concurrency discovery, host operations, and automated administrative governance. It combines modern single-page architecture (React 19 + Node.js/Express + MongoDB Atlas) with **native Google Gemini Artificial Intelligence**, real-time currency conversions, interactive reservation calendars, visual revenue charts, and ACID-compliant financial workflows.

---

## 🏛️ System Architecture

```
                                  ┌──────────────────────────────────────────────┐
                                  │               BookEase Client                │
                                  │        (React 19 + Vite 7 + Bootstrap 5)     │
                                  └──────────────────────┬───────────────────────┘
                                                         │
                                                         │ HTTPS REST API + Session Cookies
                                                         ▼
                                  ┌──────────────────────────────────────────────┐
                                  │            Express.js API Gateway            │
                                  │      (Helmet, Rate-Limiter, Node-Cache)      │
                                  └───────┬──────────────┬──────────────┬────────┘
                                          │              │              │
                    Internal AI Calls     │              │ Payments     │ Media Uploads
                           ▼              │              ▼              ▼
           ┌────────────────────────┐     │     ┌────────────────┐ ┌──────────────┐
           │ Google Gemini 3.5 API  │     │     │ Razorpay SDK   │ │  Cloudinary  │
           │ (Zero Client Exposure) │     │     │ (HMAC Verify)  │ │ (Auto WebP)  │
           └────────────────────────┘     │     └────────────────┘ └──────────────┘
                                          ▼
                                  ┌──────────────────────────────────────────────┐
                                  │           MongoDB Atlas Cluster              │
                                  │    (Compound B-Trees, TTL Indexes, ACID)     │
                                  └──────────────────────────────────────────────┘
```

---

## 🤖 Native Google Gemini AI Capabilities

BookEase integrates a zero-leakage backend proxy running on Google Gemini 3.5 Flash Lite with structured JSON schema enforcement (`responseMimeType: "application/json"`) and in-memory TTL caching (`node-cache`):

### 1. 🔍 "AI Vibe Matcher" — Natural Language Search
* **Endpoint:** `POST /listing/ai-search`
* **Backend Service:** `backend/services/aiService.js` (`parseSearch`)
* **Component:** `frontend/src/components/AISearchModal.jsx` (Triggered via Navbar & Explore banner)
* **How it works:** Replaces rigid multi-dropdown menus with human language search queries (e.g., *"Find me a pet-friendly mountain cabin under ₹3000 with high-speed WiFi for a workation"*). Gemini extracts intent into structured MongoDB operators and displays matching properties with an AI rationale badge (*"Why this matches your vibe"*).

### 2. 📊 AI Review Intelligence — Consensus Pros & Cons Synthesis
* **Endpoint:** `GET /rating/:id/ai-summary`
* **Backend Service:** `backend/services/aiService.js` (`summarizeReviews`)
* **Component:** `frontend/src/components/AIReviewSummary.jsx` (Positioned above guest reviews on listing page)
* **How it works:** Eliminates review fatigue by analyzing dozens of guest reviews and distilling them into:
  - 🟢 **What Guests Loved (Pros)**: Top 3–4 highlights (cleanliness, sea views, host communication).
  - ⚠️ **Key Considerations (Cons)**: 1–3 honest caveats (steep steps, spotty mobile network).
  - 📈 **Positivity Metric**: Calculated sentiment percentage (e.g., `96% Positive`).
  - 👥 **Audience Vibe Tag**: Ideal travel profile (*"Couples & Remote Workers"*).

### 3. 🗓️ Post-Booking Personalized Travel Itinerary Generator
* **Endpoint:** `GET /booking/:id/itinerary`
* **Backend Service:** `backend/services/aiService.js` (`generateItinerary`)
* **Component:** `frontend/src/components/AIItineraryModal.jsx` (Available on confirmed user bookings)
* **How it works:** Takes check-in/out dates, guest count, and property coordinates to generate:
  - Day-by-day morning, afternoon, and evening excursion schedules.
  - Recommended regional dishes and hidden dining spots.
  - Climate-specific packing recommendations and local transport tips.

### 4. ✍️ "Magic Copywriter" — AI Title & Description Generator
* **Endpoint:** `POST /listing/ai-generate-copy`
* **Backend Service:** `backend/services/aiService.js` (`generateListingCopy`)
* **Component:** `frontend/src/components/AICopywriterModal.jsx` (Integrated into Host Listing Create & Edit)
* **How it works:** Analyzes property type, location, and selected amenities to generate 3 high-converting SEO titles, an engaging tagline, key highlight tags, and an editable 2-paragraph property description.

### 5. 💡 Smart Dynamic Pricing & Revenue Advisor
* **Endpoint:** `POST /listing/ai-suggest-pricing`
* **Backend Service:** `backend/services/aiService.js` (`suggestPricing`)
* **Component:** `frontend/src/components/AIPricingAdvisorModal.jsx` (Integrated into Host Studio)
* **How it works:** Evaluates capacity, location, category, and amenities against current market demand to recommend:
  - Optimal nightly base rate in INR (`₹`).
  - Off-peak vs. peak season price boundaries (`minPrice` / `maxPrice`).
  - Recommended cleaning and service fee breakdown.
  - Contextual market rationale with 1-click form apply.

---

## 🌟 Comprehensive Feature Catalog

### 🧳 Guest Discovery & Experience
- **Curated Landing Page**: Top cities collections, handpicked stays, category lodging carousel, recent arrivals, and guest testimonials.
- **Advanced Explore Catalog**: Search and filter by city, country, accommodation type, guest capacity, price range, and amenities with real-time URL synchronization.
- **Server-Side Pagination**: Clean `.skip().limit()` paging with direct page jumper controls.
- **Smart Destination Finder**: Dedicated quiz-style location questionnaire at `/destination-finder` matching travelers to ideal destinations.
- **Multi-Currency Converter**: Live currency switching across **INR (₹), USD ($), EUR (€), GBP (£), and JPY (¥)** powered by the Open Exchange Rates API with 12-hour localStorage caching.
- **Interactive Listing Studio**: Photo gallery grid modal, superhost badges, host profile info, interactive coordinates map, house rules, and full amenities breakdown.
- **Seamless Razorpay Checkout**: Live total price calculation (base rate $\times$ nights + cleaning fee + service fee), dates availability validation, and Razorpay sandbox payments.
- **Favorites & Bookmarks**: 1-click atomic bookmarking with instant toast notifications.
- **In-App Notification Feed**: Real-time alerts for booking confirmations, cancellations, and status updates.

### 🏡 Host Operations & Studio
- **Guided Host Onboarding**: Multi-step application with government KYC document upload (`aadhaar`, `passport`, `pan`, `driving_license`, `voter_id`) and residential details.
- **Encrypted Financial Data**: Bank accounts and routing numbers stored with **AES-256-CBC encryption** at rest and masked over the wire (`****1234`).
- **Host Analytics Dashboard**: Visual Monthly Revenue & Booking volume bar charts powered by **Chart.js & react-chartjs-2**.
- **Interactive Reservation Calendar**: Visual month/week timeline powered by **react-big-calendar & moment.js**, color-coded by booking status (`confirmed`, `pending`, `cancelled`).
- **Listing Management Table**: Toggle listing visibility (`isActive`), edit property details, and inspect booking histories with client-safe pagination.
- **ACID Transaction Payout Withdrawals**: Host earnings tracking with MongoDB multi-document transactions ensuring balance integrity and zero double-withdrawals.

### 🛡️ Administrative Governance
- **System Metrics Overview**: Total revenue volume, active inventory count, host requests, and user distribution.
- **KYC Verification Hub**: Inspect submitted government identification images and approve or reject host privilege requests.
- **Withdrawal Approvals**: Review host payout requests, verify bank account details, and approve/reject withdrawals.
- **Dynamic Platform Settings**: Admin dashboard controls (`/admin-dashboard/settings`) for platform commission %, minimum withdrawal amounts, support email, and maintenance mode toggle.
- **Content Moderation**: Supervise property listings and moderate guest reviews.
- **User Directory**: Search, inspect, and manage user accounts and system roles (`user`, `host`, `admin`).

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Core** | React 19.2, Vite 7.2, React Router DOM v7, React Context API |
| **UI & Styling** | Bootstrap 5.3, FontAwesome 6, Custom Dark Theme CSS, Toastify |
| **Data Visualization** | Chart.js, React-Chartjs-2, React-Big-Calendar, Moment.js |
| **Backend Runtime** | Node.js (v24 LTS), Express.js 4.21 |
| **Database & ODM** | MongoDB Atlas, Mongoose 8.12 (Compound Indexes, ACID Transactions, TTL) |
| **AI Integration** | `@google/genai` (Google Gemini 3.5 Flash Lite) with JSON responseSchema |
| **Authentication** | Passport.js, `passport-local-mongoose`, Express-Session, Connect-Mongo |
| **Security & Headers** | Helmet, Express-Rate-Limit, Node `crypto` (AES-256-CBC & HMAC-SHA256) |
| **Cloud Media** | Cloudinary SDK, Multer, Multer-Storage-Cloudinary |
| **Payment Gateway** | Razorpay Node.js SDK |
| **Currency Data** | Open Exchange Rates API with client-side TTL caching |
| **Caching Layer** | Node-Cache (in-memory key-value store with deterministic invalidation) |

---

## 📁 Repository Directory Map

```
BookEase/
│
├── frontend/
│   ├── public/                      # Static web assets
│   ├── src/
│   │   ├── components/              # Reusable UI & AI Modals
│   │   │   ├── AICopywriterModal.jsx       # AI Title & Description Generator Modal
│   │   │   ├── AIItineraryModal.jsx        # AI Travel Itinerary Modal
│   │   │   ├── AIPricingAdvisorModal.jsx   # AI Dynamic Pricing Advisor Modal
│   │   │   ├── AIReviewSummary.jsx         # AI Review Consenser (Pros/Cons)
│   │   │   ├── AISearchModal.jsx           # Natural Language "Vibe Matcher" Modal
│   │   │   └── LazyImage.jsx               # Cloudinary-optimized image with shimmer
│   │   ├── context/
│   │   │   ├── AuthContext.jsx             # User session, role state & live favorites
│   │   │   └── CurrencyContext.jsx         # Live multi-currency converter & rate cache
│   │   ├── hooks/
│   │   │   └── usePagination.js            # Table pagination hook for dashboard tables
│   │   ├── Layout/
│   │   │   ├── Navbar.jsx                  # Main header with search modal & currency select
│   │   │   ├── Footer.jsx                  # Global footer
│   │   │   └── Style.css                   # Navigation & layout styles
│   │   ├── pages/
│   │   │   ├── admin/                      # Admin dashboard views
│   │   │   │   ├── AdminBookings.jsx       # Booking inspection & filter table
│   │   │   │   ├── AdminDashboard.jsx      # Admin revenue & activity metric overview
│   │   │   │   ├── AdminDashboardPage.jsx  # Admin layout with sidebar navigation
│   │   │   │   ├── AdminHostRequests.jsx   # KYC document review & approvals
│   │   │   │   ├── AdminListings.jsx       # Inventory moderation & status toggles
│   │   │   │   ├── AdminRevenue.jsx        # Platform gross volume & fee tracking
│   │   │   │   ├── AdminReviews.jsx        # Rating moderation & removal
│   │   │   │   ├── AdminSettings.jsx       # Platform commission & maintenance controls
│   │   │   │   ├── AdminUsers.jsx          # User accounts directory
│   │   │   │   └── AdminWithdrawals.jsx    # Host payout withdrawal approvals
│   │   │   ├── auth/                       # Authentication views
│   │   │   │   ├── Login.jsx               # Session login
│   │   │   │   ├── Signup.jsx              # Registration with profile picture upload
│   │   │   │   └── ProtectedRoute.jsx      # Role-based route guard component
│   │   │   ├── dashboard/                  # Host Studio views
│   │   │   │   ├── Calendar.jsx            # react-big-calendar booking timeline
│   │   │   │   ├── Dashboard.jsx           # Chart.js revenue & volume charts
│   │   │   │   ├── DashboardPage.jsx       # Host layout with sidebar navigation
│   │   │   │   ├── Earnings.jsx            # Revenue breakdown and history
│   │   │   │   ├── ListingBooking.jsx      # Guest reservations on host properties
│   │   │   │   ├── ListingCreate.jsx       # Studio with AI Copywriter & Pricing Advisor
│   │   │   │   ├── ListingEdit.jsx         # Property modification studio
│   │   │   │   ├── ListingReview.jsx       # Host view of reviews received
│   │   │   │   ├── ListingTable.jsx        # Host properties management table
│   │   │   │   └── Withdrawals.jsx         # Payout withdrawal submission form
│   │   │   ├── explore/
│   │   │   │   └── Explore.jsx             # Filterable catalog with server pagination
│   │   │   ├── home/
│   │   │   │   ├── Accommodations.jsx      # Top-rated luxury stays preview
│   │   │   │   ├── Collections.jsx         # Top destinations by stay count
│   │   │   │   ├── Destination.jsx         # Smart destination finder quiz
│   │   │   │   ├── Hero.jsx                # Search hero with type/price dropdowns
│   │   │   │   ├── HomePage.jsx            # Home container
│   │   │   │   ├── Listings.jsx            # 8 latest arrivals preview
│   │   │   │   ├── Lodging.jsx             # Category icon strip
│   │   │   │   ├── Newsletter.jsx          # Email subscription banner
│   │   │   │   └── Review.jsx              # Verified guest testimonials carousel
│   │   │   ├── host/
│   │   │   │   └── BecomeHost.jsx          # Host onboarding with ID upload & bank details
│   │   │   ├── listing/
│   │   │   │   ├── Checkout.jsx            # Razorpay checkout & reservation confirmation
│   │   │   │   └── ListingPage.jsx         # Full property view with AI Review Summary
│   │   │   ├── user/
│   │   │   │   ├── Bookings.jsx            # User reservations with AI Itinerary button
│   │   │   │   ├── Favorites.jsx           # Saved properties grid
│   │   │   │   ├── Notifications.jsx       # In-app alert notification center
│   │   │   │   ├── Profile.jsx             # Profile settings & avatar update
│   │   │   │   └── Reviews.jsx             # Reviews authored by the user
│   │   │   └── NotFound.jsx                # 404 Error page
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── backend/
│   ├── controllers/
│   │   ├── Admin.js                        # Admin overview, user list & moderation
│   │   ├── Booking.js                      # Overlap validation, Razorpay HMAC, AI Itinerary
│   │   ├── Host.js                         # AES-256 bank encryption, KYC approval
│   │   ├── Listing.js                      # Server-side pagination, AI search & copywriter
│   │   ├── Notification.js                 # In-app alert retrieval & read markers
│   │   ├── Rating.js                       # Atomic avgRating recalculation, AI review summary
│   │   ├── Setting.js                      # Platform commission & system config controller
│   │   ├── User.js                         # Passport auth, Cloudinary avatar, atomic favorites
│   │   └── Withdrawals.js                  # ACID Transaction payout accounting
│   ├── middleware.js                       # RBAC guards, NodeCache, deterministic invalidation
│   ├── models/
│   │   ├── Booking.js                      # 15-min TTL index for pending bookings
│   │   ├── Host.js                         # KYC and encrypted banking details schema
│   │   ├── Listing.js                      # Compound B-tree indexes & denormalized rating metrics
│   │   ├── Notification.js                 # System alerts schema
│   │   ├── Rating.js                       # Review schema with static aggregation helpers
│   │   ├── Setting.js                      # Dynamic commission & system settings schema
│   │   ├── User.js                         # User profile schema with passport-local-mongoose
│   │   ├── VisitorLog.js                   # Telemetry & geolocation tracking schema
│   │   └── Withdrawals.js                  # Payout request schema
│   ├── routes/                             # Express route definitions
│   │   ├── Booking.js                      # Reservation routes
│   │   ├── Host.js                         # Host onboarding & admin KYC approval routes
│   │   ├── Listing.js                      # Catalog, explore, and AI search routes
│   │   ├── Notification.js                 # Alert notification routes
│   │   ├── Rating.js                       # Review and AI summary routes
│   │   ├── Setting.js                      # Admin platform setting routes
│   │   ├── User.js                         # Authentication and favorites routes
│   │   └── Withdrawals.js                  # Payout withdrawal routes
│   ├── services/
│   │   └── aiService.js                    # Google Gemini 3.5 Flash integration & JSON schemas
│   ├── index.js                            # Express server entry point with visitor log buffer
│   ├── multer.js                           # Cloudinary storage configuration
│   └── package.json
│
├── AI_FEATURES.md                          # Detailed AI system specifications & roadmap
├── TECHNICAL_REVIEW.md                     # Architecture audit and security vulnerabilities report
└── README.md                               # Primary project documentation
```

---

## 📡 REST API Reference

### 🤖 AI Services
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :---: |
| `POST` | `/listing/ai-search` | "AI Vibe Matcher" natural language search | Public |
| `GET` | `/rating/:id/ai-summary` | AI Review Intelligence (Pros/Cons synthesis) | Public |
| `GET` | `/booking/:id/itinerary` | Day-by-day customized travel itinerary generator | Private (Guest/Host/Admin) |
| `POST` | `/listing/ai-generate-copy` | "Magic Copywriter" title and description generator | Private (Host) |
| `POST` | `/listing/ai-suggest-pricing` | Smart Dynamic Pricing & Revenue Advisor | Private (Host) |

### 🏨 Listings & Catalog
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :---: |
| `GET` | `/listing/all` | Paginated listing catalog (`?page=1&limit=12`) | Public |
| `GET` | `/listing/explore` | Filtered explore listings with pagination metadata | Public |
| `GET` | `/listing/destination-finder` | Quiz-filtered destination recommendation listings | Public |
| `GET` | `/listing/:id` | Full listing details with populated host data | Public |
| `GET` | `/listing/host-listings` | Retrieve listings owned by the logged-in host | Private (Host) |
| `POST` | `/listing/create` | Create new listing with multi-file Cloudinary upload | Private (Host) |
| `PUT` | `/listing/:id` | Update listing and deterministically invalidate cache | Private (Host) |
| `DELETE` | `/listing/:id` | Delete listing and purge cached keys | Private (Host) |
| `DELETE` | `/listing/host-delete/:id` | Delete listing directly from host studio | Private (Host) |
| `GET` | `/listing/admin/all` | Oversee all platform listings | Private (Admin) |
| `PUT` | `/listing/admin/:id/status`| Toggle listing active/inactive status | Private (Admin) |
| `DELETE` | `/listing/admin/:id` | Remove non-compliant listing from catalog | Private (Admin) |

### 💳 Reservations & Payments
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :---: |
| `POST` | `/booking/make-booking` | Validate dates, check overlap, create pending booking | Private (User) |
| `POST` | `/booking/verify-payment` | Verify Razorpay HMAC signature and confirm booking | Private (User) |
| `GET` | `/booking/get-booking` | Retrieve authenticated user's reservations | Private (User) |
| `GET` | `/booking/all-booking` | Retrieve all bookings across host's properties | Private (Host) |
| `PUT` | `/booking/:id` | Update booking status (`confirmed`, `cancelled`) | Private (User/Host) |
| `GET` | `/booking/admin/all` | Inspect all platform reservations | Private (Admin) |
| `DELETE` | `/booking/admin/:id` | Administrative cancellation of booking | Private (Admin) |

### ⭐ Reviews & Ratings
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :---: |
| `POST` | `/rating/:id/post` | Post a stay review with atomic average recalculation | Private (Guest) |
| `GET` | `/rating/:id/get` | Fetch all reviews for a specific listing | Public |
| `GET` | `/rating/all/:id` | Retrieve aggregate rating statistics for a host | Public |
| `GET` | `/rating/user/:id` | Fetch all reviews written by a specific user | Private (User) |
| `PUT` | `/rating/update/:id` | Update an existing rating and recalculate averages | Private (Guest) |
| `DELETE` | `/rating/delete/:id` | Delete a review with ownership verification | Private (Guest/Admin) |
| `GET` | `/rating/admin/all` | Inspect all platform ratings and comments | Private (Admin) |
| `DELETE` | `/rating/admin/:id` | Administratively purge inappropriate review | Private (Admin) |

### 🏡 Host Applications & KYC
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :---: |
| `POST` | `/host/create` | Submit host application with encrypted bank details & ID | Public |
| `POST` | `/host/check-host` | Check application verification status | Public |
| `GET` | `/host/admin/requests` | Retrieve pending host applications | Private (Admin) |
| `PUT` | `/host/admin/requests/:id/approve` | Approve host KYC and upgrade user role to host | Private (Admin) |
| `PUT` | `/host/admin/requests/:id/reject` | Reject host application | Private (Admin) |

### 💰 Host Payout Withdrawals
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :---: |
| `POST` | `/withdrawal/post` | Submit payout withdrawal request (ACID transaction) | Private (Host) |
| `GET` | `/withdrawal/get` | View host withdrawal history & available balance | Private (Host) |
| `GET` | `/withdrawal/admin/all` | Inspect all host withdrawal requests | Private (Admin) |
| `PUT` | `/withdrawal/admin/:id/status` | Approve or reject host withdrawal request | Private (Admin) |

### 👤 User Authentication & Favorites
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :---: |
| `POST` | `/signup` | Register new user with avatar upload (rate-limited) | Public |
| `POST` | `/login` | Authenticate credentials & establish session (rate-limited) | Public |
| `POST` | `/logout` | Destroy session & clear cookies | Private |
| `GET` | `/check-user` | Hydrate session with denormalized favorites ratings | Public |
| `PUT` | `/profile-update` | Update personal bio, contact info, and avatar | Private (User) |
| `PUT` | `/add-to-fav/:id` | Atomically bookmark property via `$addToSet` | Private (User) |
| `PUT` | `/remove-fav/:id` | Atomically remove bookmark via `$pull` | Private (User) |
| `GET` | `/dashboard-stats` | Retrieve user booking & review counts | Private (User) |
| `GET` | `/admin/users` | Directory of all registered users | Private (Admin) |
| `PUT` | `/admin/users/:id/status` | Change user status / role | Private (Admin) |
| `DELETE` | `/admin/users/:id` | Administratively deactivate user account | Private (Admin) |

### ⚙️ Platform Settings & Notifications
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :---: |
| `GET` | `/setting/admin` | Fetch platform settings (commission %, limits) | Private (Admin) |
| `PUT` | `/setting/admin/financial`| Update platform commission % and withdrawal limit | Private (Admin) |
| `PUT` | `/setting/admin/system` | Update support email and maintenance mode toggle | Private (Admin) |
| `GET` | `/notification/get` | Fetch notifications for logged-in user | Private (User) |
| `POST` | `/notification/read-all` | Mark all notifications as read | Private (User) |

---

## 🛡️ License & Disclaimer

This project is built and maintained for learning, portfolio, and demonstration purposes. All payment transactions, host KYC submissions, and bookings simulated on this platform run on sandbox test environments and do not represent real-world financial commitments or live property rentals.