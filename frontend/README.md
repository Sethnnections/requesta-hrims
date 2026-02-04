# Requesta HRIMS - Human Resource Information Management System

A modern, role-based HR management system for ESCOM Malawi.

## 🎨 Brand Colors
- **Primary Green**: #0B4F3F (Sidebar, primary buttons)
- **Accent Gold**: #F2A01F (Approvals, highlights)
- **Secondary Green**: #2E7D6B (Links, icons)

## 🏗️ Project Structure

\\\
requesta-hrims/
├── src/
│   ├── app/                    # Next.js 15 App Router
│   │   ├── (auth)/            # Authentication pages
│   │   ├── (main)/            # Main application
│   │   │   ├── dashboard/     # Dashboard
│   │   │   ├── loans/         # Loan management
│   │   │   ├── travel/        # Travel requests
│   │   │   ├── overtime/      # Overtime claims
│   │   │   ├── workflows/     # Workflow management
│   │   │   ├── organization/  # Departments, grades, positions
│   │   │   ├── employees/     # Employee management
│   │   │   ├── payroll/       # Payroll processing
│   │   │   └── reports/       # Analytics & reports
│   │   ├── (admin)/           # Admin section
│   │   └── layout.tsx         # Root layout
│   ├── components/            # Reusable components
│   ├── lib/                   # Utilities, API config
│   ├── hooks/                 # Custom React hooks
│   ├── store/                 # State management (Redux/Zustand)
│   ├── services/              # API services
│   ├── types/                 # TypeScript definitions
│   └── styles/                # Global styles
├── public/                    # Static assets
└── package.json
\\\

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm 9+
- Backend API running on http://localhost:3001

### Installation
1. Clone the repository
2. Install dependencies:
   \\\ash
   npm install
   \\\
3. Configure environment:
   \\\ash
   cp .env.example .env.local
   \\\
4. Run development server:
   \\\ash
   npm run dev
   \\\
5. Open http://localhost:3000

## 📦 Key Dependencies

- **Next.js 15** - React framework with App Router
- **Tailwind CSS** - Utility-first CSS framework
- **TypeScript** - Type safety
- **Redux Toolkit** / **Zustand** - State management
- **React Query** - Server state management
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **Radix UI** - Accessible UI components
- **Lucide React** - Icons
- **Recharts** - Charts & graphs

## 🔐 Authentication Flow

1. User logs in with email/username and password
2. Backend returns JWT access and refresh tokens
3. Tokens stored in secure HTTP-only cookies
4. User data and permissions stored in state
5. Role-based routing guards protected routes
6. Token refresh handled automatically

## 👥 User Roles

- **Super Super Admin** - Full system access
- **Super Admin** - Admin management
- **Admin Employee** - HR operations
- **Department Head** - Department approvals
- **Manager** - Team approvals
- **Supervisor** - Direct report approvals
- **Employee** - Basic user access

## 📱 Features

- **Dashboard** - Overview with widgets
- **Loan Management** - Apply, track, approve loans
- **Travel Requests** - Submit and approve travel
- **Overtime Claims** - Claim and approve overtime
- **Workflow Engine** - Configurable approval workflows
- **Organization Chart** - Departments, grades, positions
- **Employee Directory** - Employee profiles
- **Payroll** - Processing and payslips
- **Reports** - Analytics and insights
- **Admin Panel** - User, role, system management

## 🔧 Development

\\\ash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Type check
npm run type-check

# Format code
npm run format
\\\

## 📄 License

Proprietary - ESCOM Malawi
