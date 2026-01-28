# Backend Module Priority Plan

## Executive Summary

This document outlines the backend API development priorities for the Uruhu PPM Tool, organized into MVP (Minimum Viable Product) and Post-MVP phases. The prioritization is based on:

1. **Core value proposition** - Features that define the product's primary use case
2. **User dependency chains** - Features that unlock other functionality
3. **Industry standards** - Alignment with market leaders (Procore, monday.com, Asana, ServiceTitan)
4. **Technical dependencies** - Backend modules that other modules depend on

---

## Industry Leader Reference

| Leader | Focus Area | Key Features to Emulate |
|--------|------------|------------------------|
| **Procore** | Construction PM | Work orders, field documentation, budget tracking, mobile-first |
| **monday.com** | Work Management | Portfolio views, custom dashboards, integrations, real-time sync |
| **Asana** | Project/Portfolio | Portfolios, workload management, AI insights, status updates |
| **ServiceTitan** | Field Service | Scheduling, recurring jobs, quoting, customer management |
| **Smartsheet** | Enterprise PM | Gantt charts, resource management, reporting, approvals |

---

## Current Front-End Module Inventory

| Module | Components | Data Models | Backend Needed |
|--------|------------|-------------|----------------|
| Multi-Tenancy | Instance management | `Instance` | ✅ Critical |
| Authentication | Login, Onboarding | `Person`, Session | ✅ Critical |
| Projects | 10 components | `Project`, `Task` | ✅ Critical |
| Work Orders | 8 components | `WorkOrder`, `WorkCompletionPhoto` | ✅ Critical |
| Scheduling | 5 components | Schedule data | ✅ High |
| Recurring Jobs | 5 components | `RecurringTask` | ✅ High |
| Quotes | 4 components | `Quote`, `QuoteLineItem`, `Customer` | ✅ High |
| Roles/Permissions | Role Management | `Role` | ✅ Critical |
| Approvals | Approval Center | `WorkApproval` | ⚠️ Medium |
| Reporting | 3 components | Aggregated data | ⚠️ Medium |
| AI Insights | 3 components | Analysis results | ⚠️ Medium |
| Billing | Billing Portal | `SubscriptionPlan`, `CustomerSubscription` | ⏳ Post-MVP |
| Time Tracking | Employee Portal | `TimeEntry` | ⏳ Post-MVP |

---

## MVP Phase 1: Foundation (Priority 1 - Critical)

**Goal:** Enable basic multi-tenant operation with core project and work management

### 1.1 Authentication & Multi-Tenancy
**Priority:** 🔴 CRITICAL - Blocks all other modules

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/login` | POST | User authentication |
| `/api/auth/logout` | POST | Session termination |
| `/api/auth/refresh` | POST | Token refresh |
| `/api/auth/me` | GET | Current user profile |
| `/api/instances` | GET | List user's instances |
| `/api/instances/:id` | GET | Instance details |
| `/api/instances/:id` | PUT | Update instance settings |

**Database Tables:**
- `instances` - Tenant/business entities
- `users` - User accounts (cross-tenant)
- `instance_users` - User-instance membership
- `sessions` - Active sessions/tokens

**Industry Reference:** All leaders require robust multi-tenancy (Procore, ServiceTitan)

---

### 1.2 People & Roles Management
**Priority:** 🔴 CRITICAL - Required for access control

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/instances/:id/people` | GET | List instance members |
| `/api/instances/:id/people` | POST | Add team member |
| `/api/instances/:id/people/:personId` | GET/PUT/DELETE | Manage member |
| `/api/instances/:id/roles` | GET | List roles |
| `/api/instances/:id/roles` | POST | Create role |
| `/api/instances/:id/roles/:roleId` | GET/PUT/DELETE | Manage role |

**Database Tables:**
- `people` - Instance team members
- `roles` - Role definitions with permissions
- `role_permissions` - Permission assignments

**Industry Reference:** Procore's role-based access, ServiceTitan's crew management

---

### 1.3 Project Management Core
**Priority:** 🔴 CRITICAL - Primary value proposition

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/instances/:id/projects` | GET | List projects (with filters) |
| `/api/instances/:id/projects` | POST | Create project |
| `/api/instances/:id/projects/:projectId` | GET | Project details |
| `/api/instances/:id/projects/:projectId` | PUT | Update project |
| `/api/instances/:id/projects/:projectId` | DELETE | Archive project |
| `/api/instances/:id/projects/:projectId/tasks` | GET | List project tasks |
| `/api/instances/:id/projects/:projectId/tasks` | POST | Create task |
| `/api/instances/:id/projects/:projectId/tasks/:taskId` | GET/PUT/DELETE | Manage task |
| `/api/instances/:id/projects/:projectId/milestones` | GET/POST | Manage milestones |

**Database Tables:**
- `projects` - Project definitions
- `tasks` - Project tasks with dependencies
- `milestones` - Project milestones
- `task_dependencies` - Task relationship links

**Industry Reference:** monday.com portfolios, Asana project hierarchy, Procore project tracking

---

### 1.4 Work Orders Core
**Priority:** 🔴 CRITICAL - Field service differentiator

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/instances/:id/work-orders` | GET | List work orders (filterable) |
| `/api/instances/:id/work-orders` | POST | Create work order |
| `/api/instances/:id/work-orders/:woId` | GET | Work order details |
| `/api/instances/:id/work-orders/:woId` | PUT | Update work order |
| `/api/instances/:id/work-orders/:woId/complete` | POST | Mark complete with photos |
| `/api/instances/:id/work-orders/:woId/photos` | POST | Upload completion photos |
| `/api/instances/:id/work-orders/:woId/photos` | GET | List photos |

**Database Tables:**
- `work_orders` - Work order definitions
- `work_order_photos` - Photo documentation
- `work_order_assignments` - Crew assignments

**Industry Reference:** ServiceTitan job management, Procore field documentation

---

## MVP Phase 2: Operations (Priority 2 - High)

**Goal:** Enable day-to-day operational workflows

### 2.1 Scheduling & Calendar
**Priority:** 🟠 HIGH - Operational necessity

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/instances/:id/schedule` | GET | Get schedule (date range, person filters) |
| `/api/instances/:id/schedule/assign` | POST | Assign work to schedule |
| `/api/instances/:id/schedule/reassign` | PUT | Reassign scheduled work |
| `/api/instances/:id/availability` | GET | Team availability |

**Database Tables:**
- `schedule_entries` - Scheduled work assignments
- `availability` - Team member availability

**Industry Reference:** ServiceTitan dispatch, Procore scheduling

---

### 2.2 Recurring Tasks/Jobs
**Priority:** 🟠 HIGH - Maintenance contract support

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/instances/:id/recurring-tasks` | GET | List recurring tasks |
| `/api/instances/:id/recurring-tasks` | POST | Create recurring task |
| `/api/instances/:id/recurring-tasks/:rtId` | GET/PUT/DELETE | Manage recurring task |
| `/api/instances/:id/recurring-tasks/:rtId/generate` | POST | Generate next occurrence |
| `/api/instances/:id/recurring-tasks/:rtId/history` | GET | Completion history |

**Database Tables:**
- `recurring_tasks` - Recurring task definitions
- `recurring_task_history` - Execution history

**Industry Reference:** ServiceTitan maintenance agreements

---

### 2.3 Quotes & Customers
**Priority:** 🟠 HIGH - Revenue generation

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/instances/:id/customers` | GET/POST | Manage customers |
| `/api/instances/:id/customers/:custId` | GET/PUT/DELETE | Customer CRUD |
| `/api/instances/:id/quotes` | GET | List quotes |
| `/api/instances/:id/quotes` | POST | Create quote |
| `/api/instances/:id/quotes/:quoteId` | GET/PUT/DELETE | Manage quote |
| `/api/instances/:id/quotes/:quoteId/line-items` | GET/POST/PUT/DELETE | Manage line items |
| `/api/instances/:id/quotes/:quoteId/send` | POST | Send to customer |
| `/api/instances/:id/quotes/:quoteId/convert` | POST | Convert to project/work order |

**Database Tables:**
- `customers` - Customer/client records
- `quotes` - Quote headers
- `quote_line_items` - Quote details
- `quote_history` - Status change audit

**Industry Reference:** ServiceTitan estimates, Procore bidding

---

## MVP Phase 3: Visibility (Priority 3 - Medium)

**Goal:** Enable management oversight and workflow control

### 3.1 Approvals & Workflows
**Priority:** 🟡 MEDIUM - Management control

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/instances/:id/approvals` | GET | Pending approvals for user |
| `/api/instances/:id/approvals/:approvalId` | GET | Approval details |
| `/api/instances/:id/approvals/:approvalId/approve` | POST | Approve item |
| `/api/instances/:id/approvals/:approvalId/reject` | POST | Reject with reason |

**Database Tables:**
- `approvals` - Approval queue
- `approval_history` - Audit trail

**Industry Reference:** Procore approval workflows, Smartsheet approvals

---

### 3.2 Reporting & Dashboards
**Priority:** 🟡 MEDIUM - Business intelligence

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/instances/:id/reports/dashboard` | GET | Dashboard metrics |
| `/api/instances/:id/reports/projects` | GET | Project portfolio report |
| `/api/instances/:id/reports/work-orders` | GET | Work order analytics |
| `/api/instances/:id/reports/team` | GET | Team utilization |
| `/api/instances/:id/reports/export` | POST | Export report (PDF/CSV) |

**Database:** Aggregation queries on existing tables + materialized views for performance

**Industry Reference:** monday.com dashboards, Asana portfolios, Smartsheet reports

---

### 3.3 File & Document Management
**Priority:** 🟡 MEDIUM - Project documentation

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/instances/:id/files` | GET | List files (by project/work order) |
| `/api/instances/:id/files/upload` | POST | Upload file |
| `/api/instances/:id/files/:fileId` | GET | Download file |
| `/api/instances/:id/files/:fileId` | DELETE | Delete file |

**Database Tables:**
- `files` - File metadata
- Storage: S3/Azure Blob for actual files

**Industry Reference:** Procore document management

---

## Post-MVP Features (Priority 4 - Future)

### 4.1 AI Insights Engine
**Priority:** ⚪ POST-MVP - Competitive differentiator

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/instances/:id/ai/insights` | GET | Get AI-generated insights |
| `/api/instances/:id/ai/predictions` | GET | Risk/bottleneck predictions |
| `/api/instances/:id/ai/recommendations` | GET | Action recommendations |

**Implementation:** Integration with LLM APIs (OpenAI/Anthropic) for analysis

**Industry Reference:** Asana AI Assistant, monday.com AI features, Procore AI agents

---

### 4.2 Billing & Subscriptions
**Priority:** ⚪ POST-MVP - Monetization

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/billing/plans` | GET | Available subscription plans |
| `/api/billing/subscribe` | POST | Start subscription |
| `/api/billing/portal` | GET | Billing portal URL (Stripe) |
| `/api/billing/usage` | GET | Current usage metrics |

**Implementation:** Stripe integration for payment processing

---

### 4.3 Time Tracking & Payroll
**Priority:** ⚪ POST-MVP - HR integration

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/instances/:id/time-entries` | GET/POST | Clock in/out |
| `/api/instances/:id/time-entries/report` | GET | Timesheet report |
| `/api/instances/:id/time-entries/approve` | POST | Approve timesheets |

**Industry Reference:** ServiceTitan time tracking

---

### 4.4 Integrations & Webhooks
**Priority:** ⚪ POST-MVP - Ecosystem

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/instances/:id/integrations` | GET | Connected integrations |
| `/api/instances/:id/webhooks` | GET/POST | Webhook management |
| `/api/integrations/quickbooks/sync` | POST | QuickBooks sync |
| `/api/integrations/google-calendar/sync` | POST | Calendar sync |

**Industry Reference:** monday.com 200+ integrations, ServiceTitan accounting sync

---

### 4.5 Mobile API Optimizations
**Priority:** ⚪ POST-MVP - Field experience

- Offline-first sync endpoints
- Push notification registration
- Location tracking for field workers
- Lightweight response formats

**Industry Reference:** ServiceTitan mobile app, Procore mobile

---

### 4.6 Custom Widgets & Dashboards
**Priority:** ⚪ POST-MVP - Personalization

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/instances/:id/widgets` | GET/POST | Custom widget CRUD |
| `/api/instances/:id/dashboards` | GET/POST | Custom dashboard layouts |

**Industry Reference:** monday.com custom dashboards

---

## Implementation Roadmap

```
Phase 1: Foundation (MVP Core)          [Weeks 1-4]
├── Authentication & Multi-Tenancy      [Week 1]
├── People & Roles Management           [Week 1-2]
├── Projects Core                       [Week 2-3]
└── Work Orders Core                    [Week 3-4]

Phase 2: Operations (MVP Complete)      [Weeks 5-8]
├── Scheduling & Calendar               [Week 5-6]
├── Recurring Tasks                     [Week 6-7]
└── Quotes & Customers                  [Week 7-8]

Phase 3: Visibility (MVP+)              [Weeks 9-12]
├── Approvals & Workflows               [Week 9-10]
├── Reporting & Dashboards              [Week 10-11]
└── File Management                     [Week 11-12]

Phase 4: Post-MVP                       [Post-Launch]
├── AI Insights Engine
├── Billing & Subscriptions
├── Time Tracking
├── Integrations
├── Mobile Optimizations
└── Custom Widgets
```

---

## Database Schema Priority

### Must Have for MVP
1. `instances` - Multi-tenancy foundation
2. `users` / `sessions` - Authentication
3. `people` / `roles` / `role_permissions` - Access control
4. `projects` / `tasks` / `milestones` - Project management
5. `work_orders` / `work_order_photos` - Field service
6. `schedule_entries` - Scheduling
7. `recurring_tasks` - Maintenance contracts
8. `customers` / `quotes` / `quote_line_items` - Sales

### Post-MVP
9. `approvals` / `approval_history` - Workflows
10. `files` - Document management
11. `time_entries` - Time tracking
12. `subscriptions` / `billing` - Monetization
13. `integrations` / `webhooks` - Ecosystem
14. `ai_insights` - AI features

---

## API Design Standards

Following industry best practices:

1. **RESTful conventions** - Resource-based URLs, proper HTTP methods
2. **Instance scoping** - All tenant data under `/api/instances/:id/`
3. **Pagination** - Cursor-based for large datasets
4. **Filtering** - Query parameters for list endpoints
5. **Versioning** - `/api/v1/` prefix when needed
6. **Error handling** - Consistent error response format
7. **Rate limiting** - Per-tenant limits
8. **Audit logging** - Track all mutations

---

## Success Metrics

### MVP Launch Criteria
- [ ] User can sign up and create an instance
- [ ] User can invite team members with roles
- [ ] User can create and manage projects with tasks
- [ ] User can create, schedule, and complete work orders
- [ ] User can view schedule by day/week/month
- [ ] User can create recurring maintenance tasks
- [ ] User can create quotes and convert to work orders

### Post-MVP Success
- [ ] AI provides actionable insights
- [ ] Billing system processes payments
- [ ] Integrations connect to accounting software
- [ ] Mobile app supports offline work

---

## References

- [Procore Documentation](https://developers.procore.com/)
- [monday.com API](https://developer.monday.com/)
- [Asana Developer Guide](https://developers.asana.com/)
- [ServiceTitan Platform](https://www.servicetitan.com/)
- [Smartsheet API](https://smartsheet.redoc.ly/)

---

*Document Version: 1.0*
*Created: 2026-01-28*
*Last Updated: 2026-01-28*
