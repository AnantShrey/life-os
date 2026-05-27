# Life OS

## Overview

Life OS is a comprehensive, full-stack personal productivity dashboard engineered to centralize and streamline daily life management. Moving beyond isolated apps, Life OS brings your tasks, habits, nutrition, entertainment, and finances into a single, cohesive interface. Built entirely from scratch with a focus on premium aesthetics and real-time responsiveness, it offers a dynamic bento-grid experience that feels alive and highly interactive.

*Built by Anant Shrey*

## ✨ Features

- **Dashboard** — A highly visual, asymmetric bento-grid layout providing live infographics and glanceable insights across all active modules.
- **To-Do List** — Robust task management supporting subtasks, intelligent priority sorting, customizable tags, and due dates.
- **Habit Tracker** — Flexible habit tracking supporting daily, weekly, and monthly frequencies alongside robust streak calculations and visual heatmaps.
- **Books Tracker** — Integrated with the Google Books API to manage reading progress, track current books, and visualize your digital library.
- **Nutrition Tracker** — A comprehensive dietary module featuring meal logging and macro tracking, powered by the Open Food Facts API.
- **Goals Module** — A dedicated space to set, track, and visualize long-term objectives across various categories with milestone support and dynamic progress tracking.
- **Notes Module** — A streamlined note-taking interface with rich text editing, categorization, and quick search capabilities.
- **Watchlist** — Connected to the TMDB API to search, discover, and organize your movies and TV shows with custom status tracking (Want, Watching, Watched) and custom collections.
- **Expense Tracker** — A streamlined financial hub for budget management, tracking recurring expenses, and visualizing spending habits over time.
- **Google Calendar** — Seamless two-way synchronization enabling you to view and create Google Calendar events directly within the dashboard.
- **Settings** — Deeply customizable preferences covering currency localization, appearance, and account management.

## 🛠 Tech Stack

| Category | Technology |
| :--- | :--- |
| **Frontend** | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS |
| **Backend** | Supabase (PostgreSQL), Row Level Security |
| **Auth** | Supabase Auth (email/password) |
| **APIs** | Google Books, TMDB, Open Food Facts, Google Calendar |
| **Hosting** | Vercel |
| **Charts** | Recharts |

## 🚀 Getting Started

To run Life OS locally on your machine, follow these steps:

1. **Clone the repo**
   ```bash
   git clone https://github.com/AnantShrey/life-os.git
   cd life-os
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Copy the `.env.example` file to `.env.local` and fill in your API keys:
   ```bash
   cp .env.example .env.local
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```
   *The app will be available at http://localhost:3000.*

## 🔐 Environment Variables

The application requires the following environment variables. Please refer to `.env.example` for the setup structure:

- `NEXT_PUBLIC_SUPABASE_URL` — Your Supabase project URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Your Supabase project anonymous API key.
- `NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY` — API key for fetching book covers and metadata.
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` — Google OAuth 2.0 Client ID for Calendar integration.
- `GOOGLE_CLIENT_SECRET` — Google OAuth 2.0 Client Secret for Calendar integration.
- `NEXT_PUBLIC_GOOGLE_CALENDAR_API_KEY` — API key for accessing Google Calendar data.
- `TMDB_API_KEY` — API key for querying movies and TV shows from The Movie Database (now used server-side).
- `GOOGLE_BOOKS_API_KEY` — Server-side API key for Google Books proxy.
- `NEXT_PUBLIC_APP_URL` — The absolute URL of your application (e.g., `http://localhost:3000`).

## 🌐 Live Demo

[Live Demo](https://anantshrey.vercel.app/)

## 📸 Screenshots

*Screenshots coming soon*

## 📄 License

MIT License
