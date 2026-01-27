export interface Instance {
  id: string;
  name: string;
  logo?: string;
  primaryColor: string;
  settings: {
    workflowEnabled: boolean;
    customFields: string[];
  };
  createdAt: string;
}

export interface Person {
  id: string;
  name: string;
  email: string;
  role: string;
  roleId?: string;
  avatar?: string;
  instanceId: string;
}

export interface Role {
  id: string;
  name: string;
  color: string;
  instanceId: string;
  permissions?: string[];
  canApproveWork?: boolean;
  level?: number; // 1 = Team Member, 2 = Supervisor, 3 = Manager, 4 = Admin
  requiresApprovalFrom?: string[]; // Role IDs that can approve this role's work
}

export interface Project {
  id: string;
  name: string;
  description: string;
  instanceId: string;
  customerName: string;
  status: 'planning' | 'active' | 'on-hold' | 'completed';
  startDate: string;
  endDate: string;
  budget?: number;
  assignedTo: string[]; // Person IDs
  progress: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface Task {
  id: string;
  projectId: string;
  name: string;
  description: string;
  assignedTo: string[]; // Person IDs
  status: 'todo' | 'in-progress' | 'review' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  startDate: string;
  endDate: string;
  dependencies: string[]; // Task IDs
  progress: number;
  estimatedHours?: number;
  actualHours?: number;
}

export interface WorkOrder {
  id: string;
  projectId: string;
  instanceId: string;
  customerName: string;
  title: string;
  description: string;
  status: 'draft' | 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'pending-approval';
  priority: 'low' | 'medium' | 'high' | 'critical'; // Added priority field
  location?: string; // Added location field
  assignedTo: string[]; // Person IDs
  assignedRoles: string[]; // Role IDs
  scheduledDate: string;
  scheduledTime?: string; // Added scheduled time field
  duration?: string; // Duration display string (e.g., "2 hours")
  completedDate?: string;
  completedBy?: string; // Person ID
  activityLevel: 'low' | 'medium' | 'high';
  estimatedDuration: number; // in hours
  actualDuration?: number;
  isRecurring: boolean;
  recurringTaskId?: string;
  completionPhotos?: string[]; // Photo URLs
  completionNotes?: string; // Completion notes
  approvalNotes?: string; // Notes from employee
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  approvedBy?: string; // Person ID
  approvedAt?: string;
  reviewNotes?: string; // Notes from approver
  createdAt?: string; // Creation timestamp
  projectName?: string; // Project name for display
}

export interface RecurringTask {
  id: string;
  instanceId: string;
  projectId?: string;
  customerName: string;
  title: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly' | 'custom';
  frequencyDetails?: string; // e.g., "Every Tuesday and Friday"
  startDate: string;
  endDate?: string;
  assignedTo: string[]; // Person IDs
  assignedRoles: string[]; // Role IDs
  estimatedDuration: number;
  activityLevel: 'low' | 'medium' | 'high';
  nextOccurrence: string;
  completionHistory: {
    date: string;
    workOrderId: string;
    completedBy: string;
    duration: number;
  }[];
}

export interface GanttTask {
  id: string;
  name: string;
  start: Date;
  end: Date;
  progress: number;
  dependencies: string[];
  assignedTo: string[];
  type: 'task' | 'milestone' | 'project';
}

export interface TimeEntry {
  id: string;
  personId: string;
  instanceId: string;
  clockInTime: string;
  clockOutTime?: string;
  location?: string;
  clockInNotes?: string;
  clockOutNotes?: string;
  totalHours?: number;
  workOrderIds?: string[]; // Work orders completed during this shift
}

export interface WorkCompletionPhoto {
  id: string;
  workOrderId: string;
  personId: string;
  photoUrl: string;
  caption?: string;
  timestamp: string;
}

export interface WorkApproval {
  id: string;
  workOrderId: string;
  submittedBy: string; // Person ID
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected' | 'revision-requested';
  approvedBy?: string; // Person ID
  approvedAt?: string;
  notes?: string;
  photos: string[];
  completionNotes: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  billingCycle: 'monthly' | 'annual';
  features: string[];
  maxUsers: number;
  maxProjects: number;
  maxClients: number;
}

export interface CustomerSubscription {
  id: string;
  customerId: string;
  planId: string;
  status: 'active' | 'cancelled' | 'past_due' | 'trialing';
  startDate: string;
  endDate?: string;
  billingEmail: string;
  paymentMethod?: {
    type: 'card' | 'bank';
    last4: string;
    expiryMonth?: number;
    expiryYear?: number;
  };
  nextBillingDate: string;
  amount: number;
}

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  order: number;
}

export interface QuoteLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount?: number; // percentage
  tax?: number; // percentage
  total: number;
}

export interface Quote {
  id: string;
  quoteNumber: string;
  instanceId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  title: string;
  description: string;
  status: 'draft' | 'sent' | 'approved' | 'rejected' | 'expired' | 'converted';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  lineItems: QuoteLineItem[];
  subtotal: number;
  taxRate: number; // percentage
  taxAmount: number;
  discountRate?: number; // percentage
  discountAmount?: number;
  totalAmount: number;
  validUntil: string;
  notes?: string;
  termsAndConditions?: string;
  createdBy: string; // Person ID
  createdAt: string;
  updatedAt: string;
  sentAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  convertedToProjectId?: string;
  convertedToWorkOrderId?: string;
  attachments?: string[];
}

export interface Customer {
  id: string;
  name: string;
  companyName: string;
  email: string;
  phone?: string;
  address?: string;
  createdAt: string;
  subscriptionId?: string;
}