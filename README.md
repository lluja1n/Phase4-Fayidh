# Fayidh

**SWE 363 — Web Engineering Term Project**

Fayidh is a web-based marketplace that helps organizations sell or donate surplus materials and equipment. Organizations can publish listings for items they no longer need, while eligible users can browse available materials and submit purchase or donation requests. The project aims to encourage reuse, reduce unnecessary waste, and make surplus resources easier to exchange.

## Features

The application is organized into five modules:

- **M1 — Authentication and Profiles:** Account registration, login, verification, profile management, and My Requests.
- **M2 — Browse Listings:** Home page, browsing available listings, and viewing listing details.
- **M3 — Seller Listings:** Create, view, edit, and remove seller listings; choose sale or donation; enter item details; upload and preview images; validate listing forms.
- **M4 — Requests:** Purchase and donation request forms, seller incoming requests, and request details.
- **M5 — Administration:** Admin login, dashboard, user management, category management, and listing moderation.

Access to organization, student, and administrator pages is controlled by role-based routes. Some actions also check account status and listing ownership.

## Technology Stack

- **Frontend:** React 19, React DOM 19, JavaScript (JSX), CSS
- **Routing:** React Router 7
- **Development and production build:** Vite 6
- **Testing:** Vitest 3
- **Linting:** ESLint 9, React Hooks and React Refresh ESLint plugins

The exact dependency ranges are specified in `package.json`; installed versions are recorded in `package-lock.json`. No external database or server is required for this front-end demo.

## Requirements

- Node.js 18+ and npm compatible with Vite 6 (check your installed version with `node --version`)
- A modern web browser
- Git (for cloning the repository)

## Setup and Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/lluja1n/Phase4-Fayidh.git
   ```

2. Open the project directory:

   ```bash
   cd Phase4-Fayidh
   ```

3. Install dependencies from the lockfile:

   ```bash
   npm ci
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open the local address displayed in the terminal (typically `http://localhost:5173/`).

**Windows PowerShell note:** If PowerShell blocks the `npm` script, use `npm.cmd ci` and `npm.cmd run dev` instead.

## Usage Examples

### Browse materials

1. Open the home page (`/`).
2. Go to Browse Listings (`/browse`).
3. Select a listing to view its details (`/listings/:id`).

### Create and manage seller listings

1. Sign in with an active organization account (`/login`).
2. Open My Listings (`/seller/listings`).
3. Select Create Listing (`/seller/listings/new`).
4. Choose **For Sale** or **For Donation**, enter the material details, and optionally upload images.
5. Publish the listing. Return to My Listings to view, edit, or remove it.


### Submit or manage requests

Eligible users can open a listing and use its purchase or donation request flow. Sellers can review incoming requests under `/seller/requests`.

### Administration

Administrators use `/admin/login` and the role-restricted admin pages to manage users, categories, and listings.

> Available actions depend on account role and status. The routes above describe the application's route inventory; end-to-end behavior should be verified after final integration.

## Available Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Generate a production build in `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run test` | Run Vitest tests |
| `npm run lint` | Run ESLint |

## Project Structure

```text
Phase4-Fayidh/
├── docs/                  # Project documentation
├── public/                # Static assets
├── src/
│   ├── assets/            # Application assets
│   ├── components/        # Shared UI and layout components
│   ├── context/           # Shared application context and state
│   ├── data/              # Demo data and helper functions
│   ├── pages/
│   │   ├── m1-auth/       # Authentication and profiles
│   │   ├── m2-browse/     # Browse and listing details
│   │   ├── m3-listings/   # Seller listing management
│   │   ├── m4-requests/   # Purchase and donation requests
│   │   └── m5-admin/      # Administration
│   ├── styles/            # Shared styles
│   ├── utils/             # Shared utilities
│   ├── App.jsx            # Application routes
│   └── main.jsx           # React entry point
├── package.json
└── vite.config.js
```

## Data and Configuration

The provided application context uses mock data and browser `localStorage` to maintain demo application state. This is a front-end demonstration approach, not a production backend or secure persistent database. Browser storage can be cleared, and large uploaded images may exceed storage limits.

The inspected project snapshot contains no `.env` or `.env.example` file, and no API keys or environment variables are documented as required for the current front-end demo. If external services are added later, document their variable names in `.env.example` with placeholders only; never commit actual secrets.

The included demo users are for local testing only. Do not reuse demo credentials for real accounts or treat browser storage as secure authentication.

## Team Members

| Member | Role |
| --- | --- |
| Sarah Al Suwaybi | M1 — Authentication and Profiles |
| Lujain Albelaihed | M2 — Browse Listings |
| Nora Alqahtani | M3 — Seller Listings; Documentation |
| Deemah Alzuabi | M4 — Requests |
| Deemah Alrashed | M5 — Administration |

## Testing and Build

Run the following commands before submission:

```bash
npm run lint
npm run test
npm run build
```

A successful build confirms that the app compiles; it does not replace functional testing. Test the complete user flows, including login, seller listing management, browsing, requests, admin access, validation, and navigation.

## Repository

https://github.com/lluja1n/Phase4-Fayidh