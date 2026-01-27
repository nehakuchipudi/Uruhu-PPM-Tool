# Uhuru Service Delivery Portfolio Manager (UhuruSDPM)

A comprehensive project and portfolio management tool designed for small business owners, featuring customizable branding, detailed project tracking, and professional McKinsey-style design.

**Developed by:** Dillon Morgan Consulting Inc.

---

## 🌟 Features

### Core Project Management
- **Projects 2.0**: Complete project lifecycle management with Gantt charts, milestones, and phase tracking
- **Work Orders 2.0**: Streamlined work order creation, tracking, and completion workflows
- **Recurring Services**: Long-term repeatable task scheduling with automated generation
- **Work Schedule**: Unified SIPOC-style views aggregating data from all modules with Day and Week views

### Advanced Capabilities
- **Earned Value Management (EVM)**: Comprehensive project performance analytics with forecasting
- **Gantt Charts**: Visual timeline management with drag-and-drop functionality
- **AI Insights**: Intelligent, actionable recommendations with priority levels across all modules
- **Custom Report Builder**: Professional table views with advanced filtering and export capabilities
- **Photo Capture**: Document completed work with media attachments
- **Hierarchical Approval Routing**: Multi-level approval workflows for enhanced governance

### Business Features
- **Multi-Customer Support**: Manage multiple customer instances with customizable branding
- **Role-Based Access Control**: Granular permissions for different user roles
- **Activity Tracking**: Comprehensive audit trails and activity logs
- **Quotes & Estimates**: Full quote management with conversion to projects
- **Billing Portal**: Subscription management and payment processing
- **Marketing Landing Page**: Professional client-facing website with subscription plans

### User Experience
- **Authentication Flow**: Secure login modal providing access after authentication
- **Responsive Design**: Optimized for desktop and mobile devices
- **Professional UI**: McKinsey-style design with modern components
- **Metrics Dashboard**: Real-time KPIs and performance indicators

---

## 🚀 Technology Stack

- **Frontend Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite 6.3.5
- **Styling**: Tailwind CSS 4.1.12
- **UI Components**: Radix UI, Material-UI
- **Charts**: Recharts
- **Animations**: Motion (formerly Framer Motion)
- **Form Management**: React Hook Form
- **Date Handling**: date-fns
- **Icons**: Lucide React, Material Icons
- **Drag & Drop**: React DnD
- **Backend**: Supabase (authentication, database, storage)

---

## 📋 Prerequisites

- Node.js (v18 or higher recommended)
- pnpm (recommended) or npm
- Supabase account (for backend services)

---

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/nehakuchipudi/uhuru-sdpm.git
   cd uhuru-sdpm
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the development server**
   ```bash
   pnpm dev
   # or
   npm run dev
   ```

5. **Build for production**
   ```bash
   pnpm build
   # or
   npm run build
   ```

---

## 📂 Project Structure

```
uhuru-sdpm/
├── src/
│   ├── app/
│   │   ├── components/         # React components
│   │   │   ├── ui/            # Reusable UI components
│   │   │   ├── figma/         # Figma-imported components
│   │   │   ├── ProjectsPortfolioView.tsx
│   │   │   ├── WorkOrders2.tsx
│   │   │   ├── RecurringJobs.tsx
│   │   │   ├── WorkSchedule2.tsx
│   │   │   ├── EarnedValueManagement.tsx
│   │   │   ├── Reports.tsx
│   │   │   ├── Quotes.tsx
│   │   │   └── ...
│   │   └── App.tsx            # Main application component
│   ├── data/
│   │   └── mockData.ts        # Mock data for development
│   ├── styles/
│   │   ├── index.css
│   │   ├── tailwind.css
│   │   ├── theme.css
│   │   └── fonts.css
│   ├── types/
│   │   └── index.ts           # TypeScript type definitions
│   └── main.tsx               # Application entry point
├── public/                     # Static assets
├── .gitignore
├── package.json
├── vite.config.ts
└── README.md
```

---

## 🔑 Key Modules

### 1. **Projects 2.0**
Comprehensive project management with:
- Project creation and lifecycle tracking
- Gantt chart visualization
- Milestone tracking
- Budget management
- File and notes management
- Team assignments

### 2. **Work Orders 2.0**
Streamlined work order management:
- Create and assign work orders
- Track progress and completion
- Photo documentation
- Status workflows
- Customer filtering

### 3. **Recurring Services**
Automated recurring task management:
- Schedule repeatable services
- Automatic work order generation
- Frequency configuration
- Service templates

### 4. **Work Schedule**
Unified scheduling interface:
- Day and Week views
- SIPOC-style organization
- Source toggles (Projects, Work Orders, Recurring Services)
- Advanced filtering and search
- Smart navigation controls

### 5. **Earned Value Management (EVM)**
Project performance analytics:
- Earned Value calculations
- Cost and schedule variance
- Performance forecasting
- Visual trend analysis

### 6. **Reports**
Custom report builder:
- Table-based views
- Advanced filtering
- Export capabilities
- Cross-module reporting

### 7. **Quotes**
Professional quoting system:
- Create detailed estimates
- Convert quotes to projects
- Version tracking
- Client approval workflows

### 8. **AI Insights**
Intelligent recommendations:
- Priority-based insights
- Actionable recommendations
- Dismissible UI
- Cross-module analysis

---

## 🎨 Design Philosophy

UhuruSDPM follows a **McKinsey-style professional design** with:
- Clean, minimalist interfaces
- Data-driven visualizations
- Consistent color schemes
- Responsive layouts
- Accessible components

---

## 🔐 Authentication

The application uses a **landing page first** approach:
- Unauthenticated users see the marketing landing page
- Login modal provides secure authentication
- Full portfolio manager access after login
- Role-based access control for different user types

---

## 🤝 Contributing

This is a proprietary project developed by Dillon Morgan Consulting Inc. For collaboration inquiries, please contact the development team.

---

## 📄 License

Copyright © 2026 Dillon Morgan Consulting Inc. All rights reserved.

---

## 🐛 Known Issues & Roadmap

- [ ] Future enhancements tracked in GitHub Issues
- [ ] Performance optimizations for large datasets
- [ ] Additional integrations (calendar sync, email notifications)
- [ ] Mobile app companion

---

## 📞 Support

For technical support or feature requests, please:
1. Check existing GitHub Issues
2. Create a new issue with detailed description
3. Contact: support@dillonmorganconsulting.com

---

## 🙏 Acknowledgments

Built with modern web technologies and best practices from the React ecosystem.

**Branding**: Uhuru SDPM  
**Attribution**: Dillon Morgan Consulting Inc.

---

**Version**: 0.0.1  
**Last Updated**: January 26, 2026
