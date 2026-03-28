# Civic Complaint Platform 🏛️

A modern, full-featured civic complaint management system that empowers citizens to report issues and helps local authorities efficiently manage and resolve complaints. Built with Next.js, React, and Supabase.

## Overview

The Civic Complaint Platform is a comprehensive solution for managing civic issues reported by citizens. It provides role-based portals for citizens, local authorities (officers), and administrators to collaborate on complaint resolution with real-time tracking, SLA management, and analytics.

### Key Objectives

- **Empower Citizens**: Enable citizens to easily report civic issues (potholes, broken streetlights, water leaks, etc.)
- **Improve Accountability**: Track complaints from submission to resolution with transparent status updates
- **Optimize Resolution**: Help authorities prioritize complaints using severity levels, SLA management, and ward intelligence
- **Data-Driven Decisions**: Provide analytics and insights to monitor complaint patterns and performance metrics
- **Enhance Communication**: Real-time notifications and activity timelines to keep all parties informed

## Features

### 👤 Citizen Portal
- **Submit Complaints**: Report civic issues with location, category, description, and photo attachments
- **Track Progress**: Real-time status updates and complaint tracking dashboard
- **Activity Timeline**: View detailed history of complaint updates and authority responses
- **Complaint Management**: View all submitted complaints with filtering and search capabilities
- **Notifications**: Receive real-time alerts on complaint status changes
- **User Profile**: Manage account settings and preferences

### 🏢 Authority (Officer) Portal
- **Complaint Queue**: View assigned complaints filtered by severity, status, and ward
- **Assign & Respond**: Update complaint status, add notes, and communicate with citizens
- **SLA Tracking**: Monitor SLA deadlines with visual indicators (breach alerts, time remaining)
- **Ward Intelligence**: Analytics specific to wards (complaint distribution, severity breakdown)
- **Priority Scoring**: Intelligent complaint prioritization based on severity and category
- **Performance Analytics**: Track resolution rates, average resolution time, and team performance

### 🔐 Admin Dashboard
- **System Overview**: Master dashboard with system-wide analytics and statistics
- **User Management**: Manage citizen and officer accounts with role assignment
- **Complaint Management**: Monitor all complaints across all wards and authorities
- **Analytics & Reports**: Comprehensive analytics including:
  - Complaint trends over time
  - Status distribution charts
  - Severity breakdown (pie chart)
  - Category-wise complaint distribution
  - Authority ranking and performance metrics
  - Ward-wise intelligence and hotspot identification
- **Configuration**: Manage categories, wards, severity levels, and SLA rules

### 🌟 Universal Features
- **Real-Time Notifications**: Instant alerts for complaint updates
- **Responsive Design**: Fully responsive UI for desktop and mobile devices
- **Dark/Light Theme**: Toggle between theme preferences
- **Role-Based Access Control**: Secure access based on user roles
- **Activity Timeline**: Detailed history of all complaint interactions
- **Search & Filtering**: Advanced search and filtering capabilities
- **Map View**: Location-based complaint visualization (ward intelligence)

## Application Output

The following screenshots show the current UI across the landing page, citizen workflows, authority operations, and admin dashboards.

### Landing and Authentication

| Landing Page | Unified Login |
| --- | --- |
| ![Landing page](./images/Screenshot%202026-03-28%20123641.png) | ![Unified login page](./images/Screenshot%202026-03-28%20123648.png) |

### Citizen Experience

| Citizen Dashboard | My Complaints |
| --- | --- |
| ![Citizen dashboard](./images/Screenshot%202026-03-28%20123712.png) | ![Citizen complaints list](./images/Screenshot%202026-03-28%20123718.png) |

| New Complaint Form | |
| --- | --- |
| ![New complaint form](./images/Screenshot%202026-03-28%20123723.png) | |

### Authority Operations

| Authority Dashboard | Ward Complaints |
| --- | --- |
| ![Authority dashboard](./images/Screenshot%202026-03-28%20123807.png) | ![Ward complaints](./images/Screenshot%202026-03-28%20123812.png) |

| Assigned Wards | |
| --- | --- |
| ![Assigned wards overview](./images/Screenshot%202026-03-28%20123817.png) | |

### Admin Console

| System Overview | Analytics Dashboard |
| --- | --- |
| ![Admin system overview](./images/Screenshot%202026-03-28%20123839.png) | ![Admin analytics dashboard](./images/Screenshot%202026-03-28%20123900.png) |

| Analytics Detail | User Management |
| --- | --- |
| ![Analytics detail charts](./images/Screenshot%202026-03-28%20123846.png) | ![User management screen](./images/Screenshot%202026-03-28%20123907.png) |

| System Configuration | |
| --- | --- |
| ![System configuration screen](./images/Screenshot%202026-03-28%20123912.png) | |

## Tech Stack

### Frontend
- **Framework**: Next.js 16 with App Router
- **UI Library**: React 18 with TypeScript
- **Styling**: Tailwind CSS v4
- **Component Library**: Radix UI for accessible primitives
- **Animations**: Framer Motion for smooth transitions
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React for modern SVG icons
- **Form Handling**: React Hook Form with Zod validation
- **HTTP Client**: Axios for API requests

### Backend & Database
- **Authentication**: Supabase Auth (PostgreSQL-based)
- **Database**: PostgreSQL (via Supabase)
- **Real-Time**: Supabase Realtime subscriptions for live updates
- **Edge Functions**: Supabase Edge Functions for serverless logic

### Development Tools
- **Package Manager**: npm/bun
- **Language**: TypeScript
- **Testing**: Vitest
- **Version Control**: Git

## Project Architecture

```
Civic Complaint Platform
├── Frontend (Next.js + React)
│   ├── Citizen UI
│   ├── Authority UI
│   ├── Admin UI
│   └── Shared Components
├── Authentication (Supabase Auth)
├── Database (PostgreSQL)
└── Real-Time (Supabase Realtime)
```

### Data Flow

```
Citizen → Submits Complaint → Database
                ↓
Authority → Reviews Complaint → Updates Status → Citizen Notifications
                ↓
Admin → Monitors Analytics → Generates Reports
```

## Prerequisites

- **Node.js** 18.17 or higher
- **npm** or **bun** package manager
- **Supabase Account** (free tier available at https://supabase.com)
- **Git** for version control

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Zian-Surani/Civic-Complaint-Platform.git
cd Civic-Complaint-Platform
```

### 2. Install Dependencies

Using npm:
```bash
npm install
```

Or using bun:
```bash
bun install
```

### 3. Environment Setup

Copy the example environment file and configure it:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key-here
```

**Note**: The `.env` file is kept private and not tracked in git. Use `.env.example` as a reference.

### 4. Set Up Supabase

1. Create a free account at https://supabase.com
2. Create a new project
3. Copy the project URL and API key to your `.env.local` file
4. The database migrations are included in `supabase/migrations/` - they will be applied automatically when you connect

## Running the Project

### Development Mode

Start the development server with Turbopack disabled:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Production Build

Build the application for production:

```bash
npm run build
```

Start the production server:

```bash
npm run start
```

## Project Structure

```
civic-frontend/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── page.tsx                  # Home page
│   │   ├── layout.tsx                # Root layout
│   │   ├── login/page.tsx            # Login page
│   │   ├── admin/page.tsx            # Admin portal
│   │   ├── authority/page.tsx        # Authority portal
│   │   └── user/page.tsx             # Citizen portal
│   │
│   ├── ui/                           # Vite-based UI components
│   │   ├── pages/
│   │   │   ├── Landing.tsx           # Landing page with features
│   │   │   ├── Auth.tsx              # Authentication page
│   │   │   ├── citizen/              # Citizen portal pages
│   │   │   ├── authority/            # Authority portal pages
│   │   │   └── admin/                # Admin portal pages
│   │   │
│   │   ├── components/
│   │   │   ├── ui/                   # Reusable UI components (Radix + Tailwind)
│   │   │   ├── layouts/              # Layout components (Dashboard, Premium layout)
│   │   │   ├── analytics/            # Chart components (Trends, Distribution, Rankings)
│   │   │   ├── badges/               # Status and severity badges
│   │   │   ├── animations/           # Framer Motion animations
│   │   │   ├── complaints/           # Complaint-specific components (Timeline)
│   │   │   └── notifications/        # Notification components
│   │   │
│   │   ├── hooks/
│   │   │   ├── useAuth.tsx           # Authentication logic
│   │   │   ├── useNotifications.tsx  # Real-time notifications
│   │   │   ├── useTheme.tsx          # Theme management
│   │   │   └── use-mobile.tsx        # Mobile detection
│   │   │
│   │   ├── integrations/
│   │   │   ├── supabase/             # Supabase client & types
│   │   │   └── lovable/              # Third-party integrations
│   │   │
│   │   ├── lib/
│   │   │   ├── utils.ts              # Utility functions
│   │   │   ├── status-utils.ts       # Complaint status helpers
│   │   │   └── error-utils.ts        # Error handling
│   │   │
│   │   └── test/                     # Test files
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts             # Supabase client setup
│   │   │   └── server.ts             # Server-side Supabase
│   │   └── utils.ts
│   │
│   ├── globals.css                   # Global styles
│   └── providers.tsx                 # Context providers
│
├── supabase/
│   ├── migrations/                   # Database migrations
│   └── functions/                    # Edge functions
│
├── public/                            # Static assets
├── .env.example                      # Environment variables template
├── next.config.ts                    # Next.js configuration
├── tailwind.config.ts                # Tailwind CSS configuration
├── tsconfig.json                     # TypeScript configuration
└── package.json                      # Dependencies and scripts
```

## Key Features Explained

### 1. Complaint Management Flow

**Citizen**:
1. Click "New Complaint" on dashboard
2. Fill in details: title, category, severity, location, description
3. Attach photos/evidence
4. Submit complaint
5. Receive tracking ID and track progress

**Authority**:
1. View complaints assigned to their ward
2. Sort by severity, status, SLA deadline
3. Update complaint status (Acknowledged → In Progress → Resolved)
4. Add notes and communicate with citizen
5. Monitor SLA to avoid breaches

**Admin**:
1. View all complaints across all wards
2. Reassign complaints between authorities
3. Monitor SLA compliance
4. Generate performance reports

### 2. Dashboard Analytics

**Authority Dashboard**:
- Complaint queue overview (pending, in-progress, resolved)
- SLA breach alerts
- Ward-specific statistics
- Assigned complaints list

**Admin Dashboard**:
- System-wide statistics
- Complaint trends (7-day rolling chart)
- Status distribution (pie chart)
- Severity breakdown
- Category-wise distribution
- Authority performance ranking
- Ward intelligence and hotspot map

### 3. Real-Time Features

- Live notification system for status updates
- Real-time SLA countdown
- Activity timeline with instant updates
- Complaint queue refresh

### 4. Role-Based Access Control

```
Guest → Login
  ├── Citizen → Submit complaints, view own complaints
  ├── Authority → View assigned complaints, update status
  └── Admin → Full system access, user management
```

## Database Schema Overview

### Key Tables

- **users**: User profiles with roles
- **complaints**: Complaint records with details
- **complaint_updates**: Status and activity timeline
- **categories**: Complaint categories
- **wards**: Geographic divisions
- **severity_levels**: Complaint severity levels
- **user_notifications**: Real-time notifications
- **authority_assignments**: Ward-to-authority mappings

## API Integration

### Supabase Integration Points

- **Authentication**: User login/signup/logout
- **Real-Time Subscriptions**: Live complaint updates, notifications
- **Database Queries**: CRUD operations for complaints
- **Edge Functions**: Custom business logic (SLA calculations, notifications)

## Environment Variables

Required environment variables (see `.env.example`):

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
```

## Getting Started Guide

### For Citizen Users:
1. Visit the application
2. Click "Sign Up" → Register as Citizen
3. Complete profile
4. Click "New Complaint" to report an issue
5. Track complaint status on dashboard

### For Authority Users:
1. Get invited by admin with authority credentials
2. Login to authority portal
3. View complaints for your ward
4. Update status and add notes
5. Monitor SLA deadlines

### For Admins:
1. Login with admin credentials
2. Access "Settings" → "User Management"
3. Create new authorities, manage wards
4. Monitor system analytics
5. View all complaints and generate reports

## Performance Optimizations

- **Code Splitting**: Next.js automatic route-based splitting
- **Image Optimization**: Optimized image loading with next/image
- **TypeScript**: Type safety reduces runtime errors
- **Caching**: Supabase query caching
- **Lazy Loading**: Components loaded on demand
- **Responsive Design**: Mobile-first Tailwind CSS

## Security Features

- **Authentication**: Supabase secure auth with JWT tokens
- **Row-Level Security (RLS)**: Database-level access control
- **Environment Variables**: Secrets managed securely
- **HTTPS**: All communications encrypted
- **Input Validation**: Zod schema validation on forms

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Support

For support, features requests, or bug reports, please open an issue on GitHub at:
https://github.com/Zian-Surani/Civic-Complaint-Platform/issues

## License

This project is open source and available under the MIT License. See the LICENSE file for details.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/) and [React](https://react.dev/)
- Styling with [Tailwind CSS](https://tailwindcss.com/) and [Radix UI](https://www.radix-ui.com/)
- Backend powered by [Supabase](https://supabase.com/)
- Icons from [Lucide React](https://lucide.dev/)
- Charts by [Recharts](https://recharts.org/)
- Animations with [Framer Motion](https://www.framer.com/motion/)

## Quick Links

- 📱 [Live Demo](#) (when deployed)
- 📖 [Documentation](./docs) (coming soon)
- 🐛 [Report Bug](https://github.com/Zian-Surani/Civic-Complaint-Platform/issues)
- ✨ [Request Feature](https://github.com/Zian-Surani/Civic-Complaint-Platform/issues)

---

**Built with ❤️ to make civic complaint management transparent and efficient.**
