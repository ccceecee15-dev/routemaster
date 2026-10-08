# Overview

MERCHX is a retail planning and analytics dashboard application designed for inventory management, sales planning, and stock allocation. The application provides tools for Store Inventory Planning (SIP) and Range Assortment Planning (RAP), enabling users to manage event-based demand forecasting, store grading, style ranging, and presentation rules.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

**Framework & Build System**
- React 18+ with TypeScript for type-safe component development
- Vite as the build tool and development server
- Wouter for lightweight client-side routing
- Single-page application (SPA) architecture

**UI Design System**
- Glassmorphism design with backdrop blur effects
- Dark blue primary accent color (HSL: 220 70% 15%)
- Radix UI primitives for accessible components
- Tailwind CSS v4 for utility-first styling
- shadcn/ui component library with custom glassmorphism overrides
- Custom CSS classes: `.glass`, `.glass-card`, `.glass-sidebar`, `.glass-header`

**Key Layout Components**
- `MainLayout`: Wraps pages with Sidebar, Header, and DrillBar
- `Sidebar`: Collapsible navigation with nested menu items for SIP and RAP modules
- `CompactFilterBar`: Horizontal inline filter layout used across pages
- `Card` components with glass effect styling

**Routing Structure**
- `/sip/*` routes for Store Inventory Planning screens
- `/rap/*` routes for Range Assortment Planning screens
- Placeholder pages for future features using `PlaceholderPage` component

## Backend Architecture

**Server Framework**
- Express.js with TypeScript
- Separate development and production entry points (`index-dev.ts`, `index-prod.ts`)
- Vite middleware integration for development HMR

**Database Layer**
- Drizzle ORM for database operations
- PostgreSQL as the database (Neon serverless compatible)
- Schema defined in `shared/schema.ts`
- Currently minimal schema (users table only)

**Data Layer**
- Mock service (`mockService.ts`) provides sample data for UI development
- JSON files in `client/src/data/` contain mock products, stores, and time buckets

## Application Modules

**SIP (Store Inventory Planning)**
- Allocation View: SKU-level allocation management with drill-down capability
- Manage Event Uplift: Event-based demand rules configuration
- Generate Forecast, Vendor View, SIP Rules: Placeholder screens

**RAP (Range Assortment Planning)**
- Determine Grading Size: Store grading configuration
- Grade Store: Store grade assignment
- Range Style: Style inclusion decisions
- Determine Facings & Presentation: On-shelf presence rules
- RAP Rules: Placeholder screen

# External Dependencies

**UI Component Libraries**
- Radix UI: Full suite of accessible primitives (dialog, dropdown, select, tabs, etc.)
- shadcn/ui: Pre-built components with Tailwind styling
- Lucide React: Icon library
- Framer Motion: Animation library (used in some pages)

**Data & State Management**
- TanStack React Query: Server state management and caching
- React Hook Form with Zod: Form validation

**Database & Backend**
- Drizzle ORM with drizzle-zod for schema validation
- Neon serverless PostgreSQL driver
- Express session with connect-pg-simple for session storage

**Build & Development**
- Vite with React plugin
- Tailwind CSS v4 with @tailwindcss/vite plugin
- esbuild for production server bundling
- TypeScript with strict mode enabled