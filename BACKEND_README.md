# Uruhu PPM Tool - Backend Setup

## PostgreSQL Database with Prisma ORM

This backend uses **PostgreSQL** as the database and **Prisma** as the ORM for type-safe database access.

## 🚀 Quick Start

### 1. Generate Prisma Client
```bash
npm run db:generate
```

### 2. Push Database Schema
Since you're using Prisma Postgres (via `prisma dev`), use push instead of migrate:
```bash
npm run db:push
```

### 3. Seed the Database
Populate with sample data:
```bash
npm run db:seed
```

### 4. Start the Backend Server
```bash
npm run server
```

The server will start on `http://localhost:3001`

## 📋 Available Scripts

- **`npm run server`** - Start the Express backend server in development mode with hot reload
- **`npm run server:build`** - Build the TypeScript server for production
- **`npm run db:generate`** - Generate Prisma Client from schema
- **`npm run db:push`** - Push schema changes to database (for Prisma Postgres)
- **`npm run db:migrate`** - Create and apply migrations (for traditional PostgreSQL)
- **`npm run db:seed`** - Seed database with sample data
- **`npm run db:studio`** - Open Prisma Studio to browse/edit data

## 🗄️ Database Schema

The database includes the following main entities:

- **Instance** - Multi-tenant instances (different businesses using the app)
- **Person** - Users/employees in each instance
- **Role** - User roles with permissions and approval workflows
- **Project** - Projects with tasks and work orders
- **Task** - Individual tasks within projects
- **WorkOrder** - Work orders with scheduling, completion tracking, and approvals
- **RecurringTask** - Repeating tasks that generate work orders
- **Quote** - Quotes with line items for customers
- **Customer** - Customer information
- **TimeEntry** - Time tracking for employees
- **WorkApproval** - Approval workflow for completed work

## 🌐 API Endpoints

### Instances
- `GET /api/instances` - List all instances
- `GET /api/instances/:id` - Get instance by ID
- `POST /api/instances` - Create new instance
- `PUT /api/instances/:id` - Update instance
- `DELETE /api/instances/:id` - Delete instance

### People
- `GET /api/people?instanceId=xxx` - List people (optionally filtered by instance)
- `GET /api/people/:id` - Get person by ID
- `POST /api/people` - Create person
- `PUT /api/people/:id` - Update person
- `DELETE /api/people/:id` - Delete person

### Roles
- `GET /api/roles?instanceId=xxx` - List roles
- `GET /api/roles/:id` - Get role by ID
- `POST /api/roles` - Create role
- `PUT /api/roles/:id` - Update role
- `DELETE /api/roles/:id` - Delete role

### Projects
- `GET /api/projects?instanceId=xxx&status=active` - List projects
- `GET /api/projects/:id` - Get project by ID with tasks and work orders
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Work Orders
- `GET /api/work-orders?instanceId=xxx&status=completed` - List work orders
- `GET /api/work-orders/:id` - Get work order by ID with full details
- `POST /api/work-orders` - Create work order
- `PUT /api/work-orders/:id` - Update work order (including completion/approval)
- `DELETE /api/work-orders/:id` - Delete work order

### Recurring Tasks
- `GET /api/recurring-tasks?instanceId=xxx` - List recurring tasks
- `GET /api/recurring-tasks/:id` - Get recurring task by ID
- `POST /api/recurring-tasks` - Create recurring task
- `PUT /api/recurring-tasks/:id` - Update recurring task
- `DELETE /api/recurring-tasks/:id` - Delete recurring task

### Quotes
- `GET /api/quotes?instanceId=xxx&status=sent` - List quotes
- `GET /api/quotes/:id` - Get quote by ID with line items
- `POST /api/quotes` - Create quote
- `PUT /api/quotes/:id` - Update quote
- `DELETE /api/quotes/:id` - Delete quote

## 🔧 Environment Variables

The `.env` file contains:

```env
# Database
DATABASE_URL="prisma+postgres://localhost:51213/?api_key=..."

# Server
PORT=3001
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:5173
```

## 🗺️ Database Relations

The schema includes proper relationships with cascading deletes:
- Instances cascade to all related entities
- Projects cascade to tasks and work orders
- Proper many-to-many relationships using join tables
- Foreign key constraints for data integrity

## 📊 Prisma Studio

To visually browse and edit your database:

```bash
npm run db:studio
```

This opens a web interface at `http://localhost:5555`

## 🔐 Authentication (Future)

Currently, the API is open. For production, you'll want to add:
- JWT authentication
- Role-based access control
- API rate limiting
- Input validation middleware

## 🧪 Testing the API

Use tools like:
- **Postman** or **Insomnia** for manual testing
- **curl** commands
- Or the frontend once integrated

Example curl request:
```bash
curl http://localhost:3001/api/instances
```

## 📝 Notes

- The database is already set up with Prisma Postgres
- Sample data is included in the seed script
- All API routes return JSON
- Error handling is implemented for all endpoints
- CORS is enabled for the frontend (port 5173)
