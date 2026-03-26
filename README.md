# Civic Portal (Frontend)

Modern Next.js application for a civic complaint management system. The UI supports citizen, local authority (officer), and admin workflows with dashboards, complaints, analytics, and notifications.

## Features
- Role-based portals: citizen, authority, admin
- Complaint submission and tracking
- Status updates and activity timeline
- Analytics dashboards (trends, categories, status distribution)
- Supabase authentication and database integration
- Responsive layouts for desktop and mobile

## Tech Stack
- Next.js 16 (App Router)
- React 18
- TypeScript
- Tailwind CSS + Radix UI
- Supabase (Auth + Postgres)

## Project Structure
- `src/app` — Next.js app router entry
- `src/ui` — UI pages, components, and hooks
- `src/lib` — utilities and Supabase clients
- `civicplatform/` — Supabase edge functions and migrations (if used)

## Getting Started

### Prerequisites
- Node.js 18+ (recommended)
- npm

### Install
```bash
npm install
```

### Environment Variables
Create `.env.local` with the following:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Run Dev Server
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Start (Production)
```bash
npm run start
```

## Supabase Notes
- The app expects Supabase Auth users to have a matching row in `public.users`.
- Roles use: `civic_user`, `local_authority`, `admin`.
- Complaints are linked by `user_id`, `ward_id`, and optionally `assigned_to`.

## Common Tasks
- Update minimum complaint description length: `src/ui/pages/citizen/NewComplaint.tsx`
- Role routing & auth mapping: `src/ui/hooks/useAuth.tsx`
- Authority dashboard logic: `src/ui/pages/authority/AuthorityDashboard.tsx`
- Admin analytics: `src/ui/pages/admin/AdminAnalytics.tsx`

## License
Proprietary / internal use (update as needed).
