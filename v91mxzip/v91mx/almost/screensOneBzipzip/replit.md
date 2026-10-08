# Overview

This is a retail planning and analytics dashboard application for WHSmith, providing comprehensive tools for managing sales, margin planning, inventory tracking, and stock allocation. The application features a modern glassmorphism UI design with a very dark blue accent color theme.

# Recent Changes

- **Dec 16, 2025**: Compact Filter Bar Redesign
  - Created new CompactFilterBar component with horizontal inline layout
  - Updated Dashboard, ClosingStock, Availability, and OTB pages to use compact filters
  - Filter design now occupies ~60% less vertical space with clean aesthetic
  - Shows filter dropdowns as inline "Label:Value" format (e.g., "Category:All")
  - Includes Apply button and Clear All functionality

- **Dec 2024**: Complete UI overhaul with glassmorphism design
  - Added glass effect styling with backdrop blur throughout the app
  - Implemented very dark blue accent color (#1a2744 approx)
  - Updated all components for modern look: cards, buttons, inputs, tables, sidebar
  - Added gradient background effects for visual depth
  - Enhanced hover/active states with subtle animations
  - Improved light and dark mode theming

# User Preferences

- Preferred communication style: Simple, everyday language
- Design preference: Modern glassmorphism with very dark blue accent

# System Architecture

## Frontend Architecture

**Framework & Build System**
- React 18+ with TypeScript for type-safe component development
- Vite as the build tool and development server
- Wouter for lightweight client-side routing
- Single-page application (SPA) architecture

**UI Design System**
- Glassmorphism design with backdrop blur effects
- Very dark blue primary accent color (HSL: 220 70% 15%)
- Radix UI primitives for accessible components
- Tailwind CSS v4 for utility-first styling
- shadcn/ui component library with custom glassmorphism overrides
- Custom CSS classes: `.glass`, `.glass-card`, `.glass-sidebar`, `.glass-header`, `.glow-primary`

**Key Components**
- Sidebar: Collapsible navigation with glass effect
- Header: Sticky header with blur backdrop
- Cards: Semi-transparent with subtle shadows
- Tables: Modern styling with hover effects
- Inputs/Selects: Glass input styling with focus states

## Backend Architecture

**Server Framework**
- Express.js HTTP server
- Separate development and production entry points
- Vite dev server integration for HMR

## Data Storage

- Mock JSON files for demonstration
- PostgreSQL ready with Drizzle ORM
