# Overview

MERCHX is a retail planning and analytics dashboard application designed for inventory management, sales planning, and stock allocation. The application provides tools for two primary modules:

- **Store Inventory Planning (SIP)**: Handles allocation views, event uplift management, forecast generation, and vendor views
- **Range Assortment Planning (RAP)**: Manages store grading, sizing, range styling, and facings/presentation rules

The application uses static mock data for UI development and is structured as a single-page application with a glassmorphism design system.

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
- `MainLayout`: Wraps pages with Sidebar, Header, and navigation
- `Sidebar`: Collapsible navigation with nested menu items for SIP and RAP modules
- `CompactFilterBar`: Horizontal inline filter layout used across pages
- `Card` components with glass effect styling

**Routing Structure**
- `/sip/*` routes for Store Inventory Planning screens (Allocation View, Event Uplift, Forecast, Vendor View)
- `/rap/*` routes for Range Assortment Planning screens (Grading Size, Grade Store, Range Style, Facings & Presentation)
- Placeholder pages for future features using `PlaceholderPage` component

**Data Handling**
- Static mock data in JSON files under `client/src/data/`
- Mock service layer in `client/src/services/mockService.ts`
- No live backend API calls - UI-only development with simulated data

## Backend Architecture

**Server Framework**
- Express.js with TypeScript
- Separate development and production entry points (`index-dev.ts`, `index-prod.ts`)
- Vite middleware integration for development HMR

**Database Layer**
- Drizzle ORM for database operations
- PostgreSQL as the database (Neon serverless compatible)
- Schema defined in `shared/schema.ts`
- Currently minimal schema (users table only) - database not actively used for application data

# External Dependencies

**UI Component Libraries**
- Radix UI primitives (dialog, dropdown, select, tabs, tooltip, etc.)
- shadcn/ui component library
- Lucide React for icons
- Recharts for data visualization
- Embla Carousel for carousels

**State & Data Management**
- TanStack React Query for async state management
- React Hook Form with Zod resolvers for form validation

**Styling**
- Tailwind CSS v4 with custom theme configuration
- next-themes for dark/light mode theming
- class-variance-authority for component variants
- tailwind-merge and clsx for class composition

**Database & ORM**
- Drizzle ORM with PostgreSQL dialect
- Neon serverless PostgreSQL adapter
- drizzle-zod for schema validation

**Build & Development**
- Vite with React plugin
- esbuild for production server bundling
- TypeScript for type checking