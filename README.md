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

### Authentication & Security

- **Role-based Access Control**: Secure routing based on user roles
- **Session Management**: Automatic session validation and cleanup
- **Password Recovery**: Email-based password reset with secure recovery flow
- **Auto-redirect**: Intelligent routing based on authentication state and user role
- **Testing Tools**: Development utilities for testing authentication flows

### Health Management

- **Health Checkups**: Comprehensive health screening management with selective email notifications
- **Vaccination Tracking**: Complete vaccination record system
- **Medical Records**: Centralized student health data
- **Email Notifications**: Targeted parent communication with selective sending capabilities
- **PDF Reports**: Exportable health documentation

### Current Development

The system is actively being enhanced with:

- **Enhanced Authentication Flow**: Improved password recovery with secure token validation, enhanced loading state management, and automatic routing for email-based password reset workflows
- **Health Checkup Email & PDF System**: Email notifications and PDF export functionality for health checkup consents with interactive feedback
- **Bulk Operations**: Mass email sending and selective notifications
- **Enhanced UI**: Consistent theming across vaccination and health checkup modules with standardized CSS classes for improved visual hierarchy and maintainability
- **User Feedback**: Toast notifications for success and error states during operations like PDF exports and email sending
- **CSS Refactoring**: Moving from inline styles to reusable CSS classes (e.g., `teal-button`, `teal-button-lg`) for better consistency and easier maintenance
- **Comprehensive Testing System**: Planning and implementation of a full testing framework including unit tests (Vitest), integration tests (React Testing Library), E2E tests (Playwright), and API mocking (MSW) with automated CI/CD integration

### Development Status

- ✅ **Core Application**: Fully functional with all major features implemented
- ✅ **Authentication System**: Complete with enhanced password recovery flow
- ✅ **Medical Records Management**: Vaccination tracking and health checkups operational
- ✅ **Multi-role System**: All user roles (Admin, Manager, Nurse, Parent) supported
- 🚧 **Testing Framework**: In planning phase - comprehensive test specifications created
- 🚧 **Performance Optimization**: Ongoing improvements to loading states and user experience

### Recent Updates

- **Password Recovery Flow**: Enhanced password recovery with secure token validation, improved loading state management, and automatic detection of recovery sessions
- **Security Enhancements**: Implemented token pre-validation using direct API calls before setting sessions, improving security by validating tokens before use
- **Loading State Optimization**: Implemented dual loading states in `UpdatePassword` component - separate indicators for session validation ("Đang xác thực...") and password updates ("Đang cập nhật...") for clearer user feedback
- **Session Management**: Enhanced session validation with support for both persistent and temporary sessions, including secure token storage and session isolation
- **Error Handling**: Improved authentication error handling with type-safe error validation, automatic session cleanup, and better error messaging
- **Environment Configuration**: Strengthened environment variable handling in authentication flows with comprehensive fallback mechanisms
- **Testing Components**: Added `TestResetPassword` component for development testing of password recovery workflows

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
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint

# Testing (Planned - See Testing Framework section)
# npm run test:unit           # Run unit tests with Vitest (planned)
# npm run test:integration    # Run integration tests (planned)
# npm run test:e2e           # Run E2E tests with Playwright (planned)
# npm run test:coverage      # Generate coverage reports (planned)
# npm run test:all           # Run all test suites (planned)
```

## Testing Framework

The project is implementing a comprehensive testing system to ensure code quality and reliability:

### Testing Stack

- **Vitest**: Unit testing framework with coverage reporting
- **React Testing Library**: Component testing with user-centric approach
- **Playwright**: End-to-end testing with multi-browser support
- **MSW (Mock Service Worker)**: API mocking for consistent testing
- **SonarQube**: Code quality analysis and coverage tracking

### Testing Strategy

The testing approach follows a pyramid structure:

1. **Unit Tests**: Individual components, hooks, and utility functions
2. **Integration Tests**: Component interactions with contexts and APIs
3. **E2E Tests**: Complete user workflows across different roles
4. **Performance Tests**: Lighthouse integration for performance monitoring

### Test Organization

Tests are organized by module and functionality:

- Authentication flow testing
- Student management operations
- Medical records and vaccination tracking
- User management and role-based access
- API integration and error handling

### CI/CD Integration

- **GitHub Actions**: Automated test execution on push/PR
- **Multi-browser Testing**: Chrome, Firefox, Safari support
- **Coverage Reports**: Automated coverage tracking and reporting
- **Quality Gates**: Minimum coverage thresholds and code quality checks

> **Status**: The testing framework is currently in development. See `.kiro/specs/comprehensive-testing-system/` for detailed implementation plans.

## Development & Testing Tools

### TestResetPassword Component

The `TestResetPassword` component (`src/components/TestResetPassword.jsx`) is a development utility for testing the password recovery workflow:

**Features:**

- **Email Testing Interface**: Simple form to trigger password reset emails for any email address
- **Visual Feedback**: Success/error messages with clear visual indicators (✅/❌)
- **Step-by-step Guide**: Built-in instructions for testing the complete password recovery flow
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Development Logging**: Integration with browser console for debugging

**Usage:**

```jsx
import TestResetPassword from '@/components/TestResetPassword'

// Use in development pages or admin panels
;<TestResetPassword />
```

**Testing Workflow:**

1. Enter test email address
2. Click "Gửi Email Reset Password"
3. Check email inbox (including spam folder)
4. Click the "🔒 Đặt lại mật khẩu" link in email
5. Verify redirect to `/update-password` page
6. Monitor browser console for debug logs

> **Note**: This component is intended for development and testing purposes only. It should not be included in production builds.

## Authentication Flow

The application implements a sophisticated authentication system with automatic routing:

### AuthRedirect Component

The `AuthRedirect` component handles intelligent routing based on authentication state:

1. **Password Recovery Detection**: Automatically detects recovery sessions from email reset links (`type=recovery` in URL hash)
2. **Session Validation**: Checks both localStorage and sessionStorage for valid sessions
3. **Role-based Routing**: Redirects users to appropriate dashboards based on their role (ADMIN, MANAGER, NURSE, PARENT)
4. **Error Handling**: Gracefully handles expired sessions and authentication errors with automatic cleanup

### UpdatePassword Component

The `UpdatePassword` component (`src/pages/UpdatePassword.jsx`) handles secure password updates with enhanced user experience:

**Key Features:**

- **Dual Loading States**: Separate `initialLoading` and `loading` states for better UX during session validation and password updates
- **Recovery Session Detection**: Automatic detection and handling of password recovery sessions from email links
- **Enhanced Token Validation**: Secure token validation using direct API calls without immediately setting sessions, improving security by validating tokens before use
- **Session Management**: Handles both recovery sessions and regular authenticated sessions with improved token storage
- **Enhanced Error Handling**: Type-safe error handling with proper string validation to prevent runtime errors
- **Error Recovery**: Clear error messages with actionable next steps for users
- **Auto-redirect**: Automatic navigation to login page after successful password update

**Loading State Management:**

- `initialLoading`: Controls initial session validation and recovery token processing - shows "Đang xác thực..." spinner
- `loading`: Controls form submission and password update operations - shows "Đang cập nhật..." on submit button

This dual loading state approach ensures users see appropriate loading indicators during different phases:

1. **Initial Load**: Spinner with "Đang xác thực..." while validating recovery tokens and sessions
2. **Form Submission**: Button state change to "Đang cập nhật..." during password update

**Security Improvements:**

The component now implements enhanced security measures for password recovery:

- **Token Pre-validation**: Recovery tokens are validated via direct API calls before being used to set sessions
- **Secure Token Storage**: Tokens are temporarily stored in sessionStorage and only used when needed for password updates
- **Session Isolation**: Recovery sessions are immediately cleared after successful password updates to prevent token reuse
- **Improved Error Handling**: Better distinction between token validation errors and general authentication errors

**Error Handling Improvements:**

The component now includes robust type-safe error handling that:

- Validates error types before string operations to prevent runtime errors
- Provides fallback error messages for non-string error objects
- Differentiates between token-related errors and general errors for better user guidance
- Ensures consistent error display regardless of error object structure

**Error Handling Improvements:**

The component now includes robust type-safe error handling that:

- Validates error types before string operations to prevent runtime errors
- Provides fallback error messages for non-string error objects
- Differentiates between token-related errors and general errors for better user guidance
- Ensures consistent error display regardless of error object structure

This separation provides clear, contextual feedback about what the system is doing at each stage of the password update process.

### Authentication Utilities

The `src/utils/auth.js` module provides essential authentication functions:

- **`clearExpiredSession()`**: Cleans up all authentication-related storage items including tokens, temporary sessions, and user preferences
- **`hasStoredSession()`**: Checks for existing valid sessions in both localStorage and sessionStorage
- **Session Management**: Handles Supabase project-specific token storage and retrieval

### Supported Routes

- `/login` - Authentication page
- `/update-password` - Password recovery page (auto-detected from email recovery links)
- `/admin` - Administrator dashboard
- `/manager` - Manager dashboard
- `/nurse` - Nurse dashboard
- `/parent` - Parent dashboard
- `/no-role` - Fallback for users without assigned roles

> **Note**: The `/update-password` route is automatically triggered when users access the application through password recovery email links. The system detects the `type=recovery` parameter in the URL hash and redirects accordingly.

## Project Structure

```
src/
├── components/          # Reusable React components
│   ├── ui/             # shadcn/ui components
│   ├── modals/         # Modal components
│   ├── AuthRedirect.jsx # Authentication routing component
│   ├── TestResetPassword.jsx # Development testing component
│   └── ...
├── pages/              # Route components by role
│   ├── admin/          # Admin-only pages
│   ├── manager/        # Manager-only pages
│   ├── nurse/          # Nurse-only pages
│   ├── parent/         # Parent-only pages
│   └── UpdatePassword.jsx # Password recovery page
├── context/            # React Context providers
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
│   ├── auth.js         # Authentication utilities
│   └── ...
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
7. Utilize the testing framework for new features

## License

See LICENSE.md for details.
