# Overview

MERCHX is a retail planning and analytics dashboard application designed for inventory management, sales planning, and stock allocation. The application provides tools for Store Inventory Planning (SIP) and Range Assortment Planning (RAP), enabling planners to manage forecasts, allocations, store grading, and product facings across retail locations.

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
- `/sip/*` routes for Store Inventory Planning screens (Allocation View, Event Uplift, Forecast, Vendor View)
- `/rap/*` routes for Range Assortment Planning screens (Grading Size, Grade Store, Range Style, Facings & Presentation)
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

**API Structure**
- Routes registered in `server/routes.ts`
- All API endpoints prefixed with `/api`
- In-memory storage implementation available in `server/storage.ts`

## Data Flow

**Mock Data Layer**
- JSON mock data files in `client/src/data/` for products, stores, and time buckets
- `mockService.ts` provides simulated API responses during development
- Enables frontend development without backend dependencies

# External Dependencies

**UI Components**
- Radix UI (dialogs, dropdowns, tooltips, select, tabs, etc.)
- shadcn/ui component library
- Lucide React for icons
- TanStack React Query for server state management

**Database & ORM**
- Drizzle ORM with PostgreSQL dialect
- Neon serverless PostgreSQL adapter
- drizzle-zod for schema validation

**Build & Development**
- Vite with React plugin
- Tailwind CSS v4 with PostCSS
- TypeScript with strict mode
- esbuild for production server bundling

**Replit Integration**
- `@replit/vite-plugin-runtime-error-modal` for error display
- `@replit/vite-plugin-cartographer` for development
- `@replit/vite-plugin-dev-banner` for development environment indicator