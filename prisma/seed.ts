import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { config } from 'dotenv';
import * as bcrypt from 'bcryptjs';

config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Helper function to hash passwords
async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

async function main() {
  console.log('🌱 Starting database seed...');

  // Create instances
  console.log('Creating instances...');
  const instance1 = await prisma.instance.create({
    data: {
      name: 'GreenScape Solutions',
      logo: '🌿',
      primaryColor: '#059669',
      workflowEnabled: true,
      customFields: ['Service Type', 'Equipment Used', 'Weather Conditions'],
    },
  });

  const instance2 = await prisma.instance.create({
    data: {
      name: 'Premier Construction Co.',
      logo: '🏗️',
      primaryColor: '#dc2626',
      workflowEnabled: true,
      customFields: ['Safety Check', 'Materials Used', 'Site Conditions'],
    },
  });

  console.log('✅ Created 2 instances');

  // Create users for authentication testing
  console.log('Creating users...');
  
  // Hash a common password for all test users
  const testPassword = await hashPassword('Password123!');
  
  // SuperAdmin users (can access all tenants)
  await prisma.user.createMany({
    data: [
      {
        email: 'superadmin1@uruhu.com',
        passwordHash: testPassword,
        name: 'Super Admin One',
        tenantId: instance1.id,
        role: 'SUPERADMIN',
        emailVerified: true,
      },
      {
        email: 'superadmin2@uruhu.com',
        passwordHash: testPassword,
        name: 'Super Admin Two',
        tenantId: instance1.id,
        role: 'SUPERADMIN',
        emailVerified: true,
      },
    ],
  });

  // Instance 1 (GreenScape Solutions) users
  await prisma.user.createMany({
    data: [
      // Admin
      {
        email: 'admin1@greenscape.com',
        passwordHash: testPassword,
        name: 'Alice Administrator',
        tenantId: instance1.id,
        role: 'ADMIN',
        emailVerified: true,
      },
      {
        email: 'admin2@greenscape.com',
        passwordHash: testPassword,
        name: 'Andrew Admin',
        tenantId: instance1.id,
        role: 'ADMIN',
        emailVerified: true,
      },
      // Director
      {
        email: 'director1@greenscape.com',
        passwordHash: testPassword,
        name: 'Diana Director',
        tenantId: instance1.id,
        role: 'DIRECTOR',
        emailVerified: true,
      },
      {
        email: 'director2@greenscape.com',
        passwordHash: testPassword,
        name: 'David Director',
        tenantId: instance1.id,
        role: 'DIRECTOR',
        emailVerified: true,
      },
      // Manager
      {
        email: 'manager1@greenscape.com',
        passwordHash: testPassword,
        name: 'Mark Manager',
        tenantId: instance1.id,
        role: 'MANAGER',
        emailVerified: true,
      },
      {
        email: 'manager2@greenscape.com',
        passwordHash: testPassword,
        name: 'Maria Manager',
        tenantId: instance1.id,
        role: 'MANAGER',
        emailVerified: true,
      },
      // Supervisor
      {
        email: 'supervisor1@greenscape.com',
        passwordHash: testPassword,
        name: 'Sam Supervisor',
        tenantId: instance1.id,
        role: 'SUPERVISOR',
        emailVerified: true,
      },
      {
        email: 'supervisor2@greenscape.com',
        passwordHash: testPassword,
        name: 'Sarah Supervisor',
        tenantId: instance1.id,
        role: 'SUPERVISOR',
        emailVerified: true,
      },
      // Team Member
      {
        email: 'member1@greenscape.com',
        passwordHash: testPassword,
        name: 'Tom TeamMember',
        tenantId: instance1.id,
        role: 'TEAMMEMBER',
        emailVerified: true,
      },
      {
        email: 'member2@greenscape.com',
        passwordHash: testPassword,
        name: 'Tina TeamMember',
        tenantId: instance1.id,
        role: 'TEAMMEMBER',
        emailVerified: true,
      },
      // Guest
      {
        email: 'guest1@greenscape.com',
        passwordHash: testPassword,
        name: 'Gary Guest',
        tenantId: instance1.id,
        role: 'GUEST',
        emailVerified: true,
      },
    ],
  });

  // Instance 2 (Premier Construction Co.) users
  await prisma.user.createMany({
    data: [
      // Admin
      {
        email: 'admin1@premier.com',
        passwordHash: testPassword,
        name: 'Bob Administrator',
        tenantId: instance2.id,
        role: 'ADMIN',
        emailVerified: true,
      },
      {
        email: 'admin2@premier.com',
        passwordHash: testPassword,
        name: 'Betty Admin',
        tenantId: instance2.id,
        role: 'ADMIN',
        emailVerified: true,
      },
      // Director
      {
        email: 'director1@premier.com',
        passwordHash: testPassword,
        name: 'Derek Director',
        tenantId: instance2.id,
        role: 'DIRECTOR',
        emailVerified: true,
      },
      {
        email: 'director2@premier.com',
        passwordHash: testPassword,
        name: 'Donna Director',
        tenantId: instance2.id,
        role: 'DIRECTOR',
        emailVerified: true,
      },
      // Manager
      {
        email: 'manager1@premier.com',
        passwordHash: testPassword,
        name: 'Mike Manager',
        tenantId: instance2.id,
        role: 'MANAGER',
        emailVerified: true,
      },
      {
        email: 'manager2@premier.com',
        passwordHash: testPassword,
        name: 'Melissa Manager',
        tenantId: instance2.id,
        role: 'MANAGER',
        emailVerified: true,
      },
      // Supervisor
      {
        email: 'supervisor1@premier.com',
        passwordHash: testPassword,
        name: 'Steve Supervisor',
        tenantId: instance2.id,
        role: 'SUPERVISOR',
        emailVerified: true,
      },
      {
        email: 'supervisor2@premier.com',
        passwordHash: testPassword,
        name: 'Susan Supervisor',
        tenantId: instance2.id,
        role: 'SUPERVISOR',
        emailVerified: true,
      },
      // Team Member
      {
        email: 'member1@premier.com',
        passwordHash: testPassword,
        name: 'Tim TeamMember',
        tenantId: instance2.id,
        role: 'TEAMMEMBER',
        emailVerified: true,
      },
      {
        email: 'member2@premier.com',
        passwordHash: testPassword,
        name: 'Tracy TeamMember',
        tenantId: instance2.id,
        role: 'TEAMMEMBER',
        emailVerified: true,
      },
      // Guest
      {
        email: 'guest1@premier.com',
        passwordHash: testPassword,
        name: 'George Guest',
        tenantId: instance2.id,
        role: 'GUEST',
        emailVerified: true,
      },
    ],
  });

  console.log('✅ Created 24 users (2 SuperAdmins + 11 per tenant) with password: Password123!');

  // Create roles for instance 1
  console.log('Creating roles...');
  const role1 = await prisma.role.create({
    data: {
      name: 'Operations Manager',
      color: '#059669',
      instanceId: instance1.id,
      permissions: ['manage_projects', 'manage_users', 'approve_work'],
      canApproveWork: true,
      level: 4,
      requiresApprovalFrom: [],
    },
  });

  const role2 = await prisma.role.create({
    data: {
      name: 'Field Supervisor',
      color: '#3b82f6',
      instanceId: instance1.id,
      permissions: ['manage_tasks', 'approve_work'],
      canApproveWork: true,
      level: 3,
      requiresApprovalFrom: [role1.id],
    },
  });

  const role3 = await prisma.role.create({
    data: {
      name: 'Technician',
      color: '#8b5cf6',
      instanceId: instance1.id,
      permissions: ['complete_tasks'],
      canApproveWork: false,
      level: 1,
      requiresApprovalFrom: [role2.id, role1.id],
    },
  });

  console.log('✅ Created 3 roles');

  // Create people for instance 1
  console.log('Creating people...');
  const person1 = await prisma.person.create({
    data: {
      name: 'John Martinez',
      email: 'john@greenscape.com',
      role: 'Operations Manager',
      roleId: role1.id,
      instanceId: instance1.id,
    },
  });

  const person2 = await prisma.person.create({
    data: {
      name: 'Sarah Chen',
      email: 'sarah@greenscape.com',
      role: 'Field Supervisor',
      roleId: role2.id,
      instanceId: instance1.id,
    },
  });

  const person3 = await prisma.person.create({
    data: {
      name: 'Mike Thompson',
      email: 'mike@greenscape.com',
      role: 'Technician',
      roleId: role3.id,
      instanceId: instance1.id,
    },
  });

  console.log('✅ Created 3 people');

  // Create a project
  console.log('Creating project...');
  const project1 = await prisma.project.create({
    data: {
      name: 'Downtown Office Complex Landscaping',
      description: 'Complete landscape renovation for downtown office complex',
      instanceId: instance1.id,
      customerName: 'Metro Properties LLC',
      status: 'active',
      startDate: new Date('2026-02-01'),
      endDate: new Date('2026-04-30'),
      budget: 75000,
      progress: 35,
      priority: 'high',
      assignments: {
        create: [
          { personId: person1.id },
          { personId: person2.id },
          { personId: person3.id },
        ],
      },
    },
  });

  console.log('✅ Created 1 project');

  // Create work orders
  console.log('Creating work orders...');
  await prisma.workOrder.create({
    data: {
      projectId: project1.id,
      instanceId: instance1.id,
      customerName: 'Metro Properties LLC',
      title: 'Install new irrigation system',
      description: 'Install and test new smart irrigation system in Zone A',
      status: 'scheduled',
      priority: 'high',
      location: 'Zone A - East Courtyard',
      scheduledDate: new Date('2026-02-15'),
      scheduledTime: '08:00 AM',
      duration: '4 hours',
      activityLevel: 'high',
      estimatedDuration: 4,
      isRecurring: false,
      completionPhotos: [],
      assignments: {
        create: [
          { personId: person2.id },
          { personId: person3.id },
        ],
      },
      roleAssignments: {
        create: [
          { roleId: role2.id },
          { roleId: role3.id },
        ],
      },
    },
  });

  await prisma.workOrder.create({
    data: {
      projectId: project1.id,
      instanceId: instance1.id,
      customerName: 'Metro Properties LLC',
      title: 'Lawn maintenance',
      description: 'Weekly lawn mowing and trimming',
      status: 'completed',
      priority: 'medium',
      location: 'Main Grounds',
      scheduledDate: new Date('2026-01-20'),
      scheduledTime: '07:00 AM',
      duration: '2 hours',
      completedDate: new Date('2026-01-20'),
      completedById: person3.id,
      activityLevel: 'medium',
      estimatedDuration: 2,
      actualDuration: 1.75,
      isRecurring: true,
      completionPhotos: [],
      completionNotes: 'Completed on time. All areas mowed and trimmed.',
      approvalStatus: 'approved',
      approvedById: person2.id,
      approvedAt: new Date('2026-01-20'),
      assignments: {
        create: [
          { personId: person3.id },
        ],
      },
    },
  });

  console.log('✅ Created 2 work orders');

  // Create a recurring task
  console.log('Creating recurring task...');
  await prisma.recurringTask.create({
    data: {
      instanceId: instance1.id,
      projectId: project1.id,
      customerName: 'Metro Properties LLC',
      title: 'Weekly Lawn Maintenance',
      description: 'Mow, edge, and trim all lawn areas',
      frequency: 'weekly',
      frequencyDetails: 'Every Monday',
      startDate: new Date('2026-01-01'),
      estimatedDuration: 2,
      activityLevel: 'medium',
      nextOccurrence: new Date('2026-02-03'),
      assignments: {
        create: [
          { personId: person3.id },
        ],
      },
      roleAssignments: {
        create: [
          { roleId: role3.id },
        ],
      },
    },
  });

  console.log('✅ Created 1 recurring task');

  // Create a quote
  console.log('Creating quote...');
  await prisma.quote.create({
    data: {
      quoteNumber: 'Q-2026-001',
      instanceId: instance1.id,
      customerName: 'Tech Plaza Management',
      customerEmail: 'management@techplaza.com',
      customerPhone: '(555) 123-4567',
      title: 'Annual Landscape Maintenance Contract',
      description: 'Comprehensive landscape maintenance services for Tech Plaza',
      status: 'sent',
      priority: 'high',
      subtotal: 48000,
      taxRate: 8.5,
      taxAmount: 4080,
      totalAmount: 52080,
      validUntil: new Date('2026-03-31'),
      notes: 'Includes weekly maintenance and seasonal plantings',
      termsAndConditions: 'Net 30 payment terms. Services commence upon contract signing.',
      createdById: person1.id,
      sentAt: new Date('2026-01-15'),
      attachments: [],
      lineItems: {
        create: [
          {
            description: 'Weekly lawn maintenance (52 weeks)',
            quantity: 52,
            unitPrice: 400,
            discount: 0,
            tax: 0,
            total: 20800,
            order: 0,
          },
          {
            description: 'Monthly irrigation system check',
            quantity: 12,
            unitPrice: 150,
            discount: 0,
            tax: 0,
            total: 1800,
            order: 1,
          },
          {
            description: 'Seasonal planting (4 seasons)',
            quantity: 4,
            unitPrice: 2500,
            discount: 0,
            tax: 0,
            total: 10000,
            order: 2,
          },
        ],
      },
    },
  });

  console.log('✅ Created 1 quote');

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
