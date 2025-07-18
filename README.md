# MediSchool - Frontend

A comprehensive medical school management system frontend built with React 19 and modern web technologies.

## Overview

MediSchool is a multi-role healthcare management platform designed for medical schools, supporting administrators, managers, nurses, and parents in managing student health records, vaccinations, and medical checkups.

## Technology Stack

### Core Framework

- **React 19.1.0** with React DOM
- **Vite 6.3.5** as build tool and dev server
- **TypeScript** support with JSX
- **ES Modules** architecture

### UI & Styling

- **TailwindCSS 4.1.8** for styling
- **Radix UI** components for accessibility
- **shadcn/ui** component system (New York style)
- **Ant Design** for additional UI components
- **Lucide React** for icons

### State Management & Data

- **TanStack React Query 5.80.7** for server state
- **React Context** for global state management
- **Axios 1.9.0** for HTTP requests
- **Supabase** for backend services

### Development Tools

- **ESLint 9.25.0** with React hooks plugin
- **Prettier** with Tailwind plugin
- **SWC** for fast compilation

## Key Features

### Multi-Role System

- **Admin**: Full system administration
- **Manager**: Management-level operations and oversight
- **Nurse**: Medical record management and patient care
- **Parent**: Access to student information and records

### Health Management

- **Health Checkups**: Comprehensive health screening management with selective email notifications
- **Vaccination Tracking**: Complete vaccination record system
- **Medical Records**: Centralized student health data
- **Email Notifications**: Targeted parent communication with selective sending capabilities
- **PDF Reports**: Exportable health documentation

### Current Development

The system is actively being enhanced with:

- **Health Checkup Email & PDF System**: Email notifications and PDF export functionality for health checkup consents with interactive feedback
- **Bulk Operations**: Mass email sending and selective notifications
- **Enhanced UI**: Consistent theming across vaccination and health checkup modules with standardized CSS classes for improved visual hierarchy and maintainability
- **User Feedback**: Toast notifications for success and error states during operations like PDF exports and email sending
- **CSS Refactoring**: Moving from inline styles to reusable CSS classes (e.g., `teal-button`, `teal-button-lg`) for better consistency and easier maintenance

## Getting Started

### Prerequisites

- Node.js (latest LTS version)
- npm or yarn package manager

### Installation

```bash
# Clone the repository
git clone [repository-url]

# Navigate to project directory
cd MediSchool-FE

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## Project Structure

```
src/
├── components/          # Reusable React components
│   ├── ui/             # shadcn/ui components
│   ├── modals/         # Modal components
│   └── ...
├── pages/              # Route components by role
│   ├── admin/          # Admin-only pages
│   ├── manager/        # Manager-only pages
│   ├── nurse/          # Nurse-only pages
│   └── parent/         # Parent-only pages
├── context/            # React Context providers
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
└── types/              # TypeScript definitions
```

## Development Guidelines

### Code Style

- No semicolons, single quotes, no trailing commas
- 2-space indentation, 120 character line width
- Arrow functions without parentheses for single params
- Tailwind class sorting via Prettier plugin

### Component Patterns

- Role-based page organization
- Shared utilities in dedicated directories
- Context separation by domain
- Absolute imports using `@/` alias

## Contributing

1. Follow the established code style and patterns
2. Use TypeScript for type safety
3. Implement proper error handling
4. Add appropriate loading states
5. Ensure responsive design
6. Test across different user roles

## License

See LICENSE.md for details.
