import { CustomerOnboarding } from '@/app/components/CustomerOnboarding';
import { NewProjectDialog } from '@/app/components/NewProjectDialog';
import { EnhancedNewProjectDialog } from '@/app/components/EnhancedNewProjectDialog';
import { WorkOrderCard } from '@/app/components/WorkOrderCard';
import { TaskDetailModal } from '@/app/components/TaskDetailModal';
import { WorkOrderCompletionModal } from '@/app/components/WorkOrderCompletionModal';
import { NewWorkOrderDialog } from '@/app/components/NewWorkOrderDialog';
import { ProjectsPortfolioView } from '@/app/components/ProjectsPortfolioView';
import { ProjectDetailPage } from '@/app/components/ProjectDetailPage';
import { MetricsDashboard } from '@/app/components/MetricsDashboard';
import { ColorLegend } from '@/app/components/ColorLegend';
import { CustomWidgetBuilder, CustomWidgetDisplay, DashboardWidget } from '@/app/components/CustomWidgetBuilder';
import { EmployeePortal } from '@/app/components/EmployeePortal';
import { RoleManagement } from '@/app/components/RoleManagement';
import { ApprovalCenter } from '@/app/components/ApprovalCenter';
import { BillingPortal } from '@/app/components/BillingPortal';
import { LandingPage } from '@/app/components/LandingPage';
import { SubscriptionOnboarding } from '@/app/components/SubscriptionOnboarding';
import { LoginModal } from '@/app/components/LoginModal';
import { AIInsightsContainer } from '@/app/components/AIInsightCard';
import { useAIInsights } from '@/app/components/useAIInsights';
import { AIFeaturesGuide } from '@/app/components/AIFeaturesGuide';
import { WorkOrders } from '@/app/components/WorkOrders2';
import { RecurringJobs } from '@/app/components/RecurringJobs';
import { NewRecurringJobDialog } from '@/app/components/NewRecurringJobDialog';
import { WorkSchedule2 } from '@/app/components/WorkSchedule2';
import { Quotes } from '@/app/components/Quotes';
import { QuotePage } from '@/app/components/QuotePage';
import { Reports } from '@/app/components/Reports';
import { ReportPage } from '@/app/components/ReportPage';
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Badge } from '@/app/components/ui/badge';
import { Progress } from '@/app/components/ui/progress';
import { toast } from 'sonner';
import {
  Building2,
  Plus,
  LayoutDashboard,
  FolderKanban,
  FileText,
  BarChart3,
  Settings,
  Users,
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Target,
  Palette,
  Home,
  LogOut,
  Sparkles,
  LayoutGrid,
  List,
  Table,
} from 'lucide-react';
import { mockInstances, mockPeople, mockRoles, mockProjects, mockTasks, mockWorkOrders, mockRecurringTasks, mockQuotes } from '@/data/mockData';
import { Instance, Project, WorkOrder, Task, Quote } from '@/types';

export default function App() {
  const [instances, setInstances] = useState(mockInstances);
  const [selectedInstanceId, setSelectedInstanceId] = useState<string>('inst-1');
  const [showInstanceOnboarding, setShowInstanceOnboarding] = useState(false);
  const [showNewProject, setShowNewProject] = useState(false);
  const [showNewWorkOrder, setShowNewWorkOrder] = useState(false);
  const [showNewRecurringJob, setShowNewRecurringJob] = useState(false);
  const [projects, setProjects] = useState(mockProjects);
  const [tasks, setTasks] = useState(mockTasks);
  const [workOrders, setWorkOrders] = useState(mockWorkOrders);
  const [recurringTasks, setRecurringTasks] = useState(mockRecurringTasks);
  const [quotes, setQuotes] = useState(mockQuotes);
  const [activeView, setActiveView] = useState<'dashboard' | 'metrics' | 'projects' | 'work-orders' | 'work-schedule-2' | 'recurring-jobs' | 'quotes' | 'reports' | 'employee' | 'roles' | 'approvals' | 'billing' | 'landing'>('dashboard');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
  const [showWorkOrderDetail, setShowWorkOrderDetail] = useState(false);
  const [workOrderViewMode, setWorkOrderViewMode] = useState<'card' | 'list' | 'table'>('card');
  const [selectedProject2, setSelectedProject2] = useState<Project | null>(null);
  const [showProjectDetail, setShowProjectDetail] = useState(false);
  const [customWidgets, setCustomWidgets] = useState<DashboardWidget[]>([]);
  const [showColorLegend, setShowColorLegend] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [dismissedInsights, setDismissedInsights] = useState<string[]>([]);
  const [showQuotePage, setShowQuotePage] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [quotePageMode, setQuotePageMode] = useState<'create' | 'edit' | 'view'>('view');
  const [showReportPage, setShowReportPage] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  const selectedInstance = instances.find(c => c.id === selectedInstanceId);
  const instanceProjects = projects.filter(p => p.instanceId === selectedInstanceId);
  const instancePeople = mockPeople.filter(p => p.instanceId === selectedInstanceId);
  const instanceRoles = mockRoles.filter(r => r.instanceId === selectedInstanceId);
  const projectTasks = selectedProject2 ? tasks.filter(t => t.projectId === selectedProject2.id) : [];
  const instanceWorkOrders = workOrders.filter(wo => wo.instanceId === selectedInstanceId);
  const instanceRecurringTasks = recurringTasks.filter(rt => rt.instanceId === selectedInstanceId);
  const instanceQuotes = quotes.filter(q => q.instanceId === selectedInstanceId);
  const instanceTasks = tasks.filter(t => instanceProjects.some(p => p.id === t.projectId));

  // Generate AI insights based on current context
  const aiInsights = useAIInsights({
    projects: instanceProjects,
    selectedProject: selectedProject2 || undefined,
    tasks: projectTasks,
    workOrders: instanceWorkOrders,
    people: instancePeople,
    recurringTasks: instanceRecurringTasks,
    quotes: instanceQuotes,
    currentView: activeView,
  }).filter(insight => !dismissedInsights.includes(insight.id));

  const handleDismissInsight = (id: string) => {
    setDismissedInsights([...dismissedInsights, id]);
  };

  const handleInstanceComplete = (instance: Instance) => {
    setInstances([...instances, instance]);
    setSelectedInstanceId(instance.id);
    setShowInstanceOnboarding(false);
  };

  const handleCreateInstance = (instance: Instance) => {
    setInstances([...instances, instance]);
    setSelectedInstanceId(instance.id);
    setShowInstanceOnboarding(false);
    toast.success(`Instance "${instance.name}" created successfully`);
  };

  const handleProjectComplete = (project: Project, newTasks?: Task[]) => {
    setProjects([...projects, project]);
    if (newTasks && newTasks.length > 0) {
      setTasks([...tasks, ...newTasks]);
    }
    setSelectedProject2(project);
    setShowProjectDetail(true);
    setShowNewProject(false);
  };

  const handleCreateProject = (project: Project, newTasks?: Task[]) => {
    setProjects([...projects, project]);
    if (newTasks && newTasks.length > 0) {
      setTasks([...tasks, ...newTasks]);
    }
    setSelectedProject2(project);
    setShowProjectDetail(true);
    setShowNewProject(false);
    toast.success(`Project "${project.name}" created successfully`);
  };

  const handleLogin = (email: string, password: string) => {
    // Simple mock authentication - accept any credentials
    setIsLoggedIn(true);
    setShowLoginModal(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveView('dashboard');
  };

  // Quote handlers
  const handleCreateQuote = (quoteData: Omit<Quote, 'id' | 'quoteNumber' | 'createdAt' | 'updatedAt'>) => {
    const newQuote: Quote = {
      ...quoteData,
      id: `quote-${Date.now()}`,
      quoteNumber: `Q-2025-${(quotes.length + 1).toString().padStart(3, '0')}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setQuotes([...quotes, newQuote]);
  };

  const handleUpdateQuote = (id: string, updates: Partial<Quote>) => {
    setQuotes(quotes.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  const handleDeleteQuote = (id: string) => {
    setQuotes(quotes.filter(q => q.id !== id));
  };

  const handleConvertQuoteToProject = (quoteId: string) => {
    const quote = quotes.find(q => q.id === quoteId);
    if (!quote) return;

    const newProject: Project = {
      id: `proj-from-quote-${Date.now()}`,
      name: quote.title,
      description: quote.description,
      instanceId: quote.instanceId,
      customerName: quote.customerName,
      status: 'planning',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      budget: quote.totalAmount,
      assignedTo: [quote.createdBy],
      progress: 0,
      priority: quote.priority || 'medium',
    };

    setProjects([...projects, newProject]);
    handleUpdateQuote(quoteId, {
      status: 'converted',
      convertedToProjectId: newProject.id,
      updatedAt: new Date().toISOString(),
    });
    toast.success(`Quote converted to project: ${newProject.name}`);
  };

  const handleConvertQuoteToWorkOrder = (quoteId: string) => {
    const quote = quotes.find(q => q.id === quoteId);
    if (!quote) return;

    const newWorkOrder: WorkOrder = {
      id: `wo-from-quote-${Date.now()}`,
      projectId: quote.convertedToProjectId || '',
      instanceId: quote.instanceId,
      customerName: quote.customerName,
      title: quote.title,
      description: quote.description,
      status: 'draft',
      priority: quote.priority || 'medium',
      location: quote.customerAddress,
      assignedTo: [quote.createdBy],
      assignedRoles: [],
      scheduledDate: new Date().toISOString().split('T')[0],
      activityLevel: 'medium',
      estimatedDuration: 8,
      isRecurring: false,
      createdAt: new Date().toISOString(),
    };

    setWorkOrders([...workOrders, newWorkOrder]);
    handleUpdateQuote(quoteId, {
      status: 'converted',
      convertedToWorkOrderId: newWorkOrder.id,
      updatedAt: new Date().toISOString(),
    });
    toast.success(`Quote converted to work order: ${newWorkOrder.title}`);
  };

  // Quote page handlers
  const handleNewQuote = () => {
    setSelectedQuote(null);
    setQuotePageMode('create');
    setShowQuotePage(true);
  };

  const handleViewQuote = (quote: Quote) => {
    setSelectedQuote(quote);
    setQuotePageMode('view');
    setShowQuotePage(true);
  };

  const handleEditQuote = (quote: Quote) => {
    setSelectedQuote(quote);
    setQuotePageMode('edit');
    setShowQuotePage(true);
  };

  const handleBackFromQuotePage = () => {
    setShowQuotePage(false);
    setSelectedQuote(null);
  };

  // Report handlers
  const handleViewReport = (reportId: string) => {
    setSelectedReportId(reportId);
    setShowReportPage(true);
  };

  const handleBackFromReportPage = () => {
    setShowReportPage(false);
    setSelectedReportId(null);
  };

  const handleWorkOrderComplete = (
    workOrderId: string,
    status: WorkOrder['status'],
    photos: string[],
    notes: string,
    actualDuration: number
  ) => {
    setWorkOrders(workOrders.map(wo => {
      if (wo.id === workOrderId) {
        return {
          ...wo,
          status,
          completionPhotos: photos,
          approvalNotes: notes,
          actualDuration,
          completedDate: status === 'completed' ? new Date().toISOString() : wo.completedDate,
          approvalStatus: status === 'pending-approval' ? 'pending' : wo.approvalStatus,
        };
      }
      return wo;
    }));
    setSelectedWorkOrder(null);
  };

  const handleCreateWorkOrder = (workOrder: Omit<WorkOrder, 'id'>) => {
    const newWorkOrder: WorkOrder = {
      ...workOrder,
      id: `wo-${workOrders.length + 1}`,
    };
    setWorkOrders([...workOrders, newWorkOrder]);
    setShowNewWorkOrder(false);
    toast.success('Work order created successfully');
  };

  const handleCreateRecurringJob = (job: any) => {
    const newRecurringJob = {
      ...job,
      id: `rt-${recurringTasks.length + 1}`,
      nextOccurrence: job.startDate,
      completionHistory: [],
    };
    setRecurringTasks([...recurringTasks, newRecurringJob]);
    setShowNewRecurringJob(false);
    toast.success('Recurring job created successfully');
  };

  // Dashboard stats
  const activeProjects = instanceProjects.filter(p => p.status === 'active').length;
  const totalWorkOrders = instanceWorkOrders.length;
  const completedWorkOrders = instanceWorkOrders.filter(wo => wo.status === 'completed').length;
  const inProgressWorkOrders = instanceWorkOrders.filter(wo => wo.status === 'in-progress').length;
  const averageProjectProgress = instanceProjects.length > 0
    ? Math.round(instanceProjects.reduce((sum, p) => sum + p.progress, 0) / instanceProjects.length)
    : 0;

  // If not logged in, show only the landing page
  if (!isLoggedIn) {
    return (
      <>
        <LandingPage 
          onSignup={(email, plan) => {
            // Handle signup - for now just log them in
            setIsLoggedIn(true);
          }}
          onLogin={() => setShowLoginModal(true)}
        />
        <LoginModal
          open={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onLogin={handleLogin}
        />
      </>
    );
  }

  // Otherwise, show the full portfolio manager
  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <div className="bg-card border-b border-border sticky top-0 z-40">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                  U
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">UhuruSDPM</h1>
                  <p className="text-xs text-muted-foreground">Uhuru Service Delivery Portfolio Manager</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* AI Insights Indicator */}
              {aiInsights.length > 0 && (
                <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 dark:bg-purple-950 rounded-lg border border-purple-200 dark:border-purple-800">
                  <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-sm font-medium text-purple-900 dark:text-purple-100">
                    {aiInsights.length} AI Insight{aiInsights.length !== 1 ? 's' : ''}
                  </span>
                  {aiInsights.filter(i => i.priority === 'critical' || i.priority === 'high').length > 0 && (
                    <Badge className="bg-red-500 text-white text-xs">
                      {aiInsights.filter(i => i.priority === 'critical' || i.priority === 'high').length} High Priority
                    </Badge>
                  )}
                </div>
              )}
              
              {/* Instance Selector */}
              <div className="flex items-center gap-3 px-4 py-2 bg-muted rounded-lg border border-border">
                <Building2 className="w-5 h-5 text-muted-foreground" />
                <select
                  value={selectedInstanceId}
                  onChange={(e) => {
                    setSelectedInstanceId(e.target.value);
                    setSelectedProject2(null);
                    setShowProjectDetail(false);
                  }}
                  className="bg-transparent border-none outline-none font-medium text-foreground cursor-pointer"
                  style={{ color: selectedInstance?.primaryColor }}
                >
                  {instances.map(instance => (
                    <option key={instance.id} value={instance.id}>
                      {instance.logo} {instance.name}
                    </option>
                  ))}
                </select>
              </div>

              <Button
                onClick={() => setShowInstanceOnboarding(true)}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                New Instance
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto px-6 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-card rounded-lg border border-border p-4 sticky top-24">
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{selectedInstance?.logo}</span>
                  <div>
                    <h2 className="font-semibold text-foreground">{selectedInstance?.name}</h2>
                    <p className="text-xs text-muted-foreground">{instanceProjects.length} Projects</p>
                  </div>
                </div>
              </div>

              <nav className="space-y-1">
                <button
                  onClick={() => setActiveView('dashboard')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeView === 'dashboard'
                      ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                      : 'text-foreground hover:bg-accent'
                  }`}
                >
                  <LayoutDashboard className="w-5 h-5" />
                  <span className="font-medium">Dashboard</span>
                </button>

                <button
                  onClick={() => setActiveView('metrics')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeView === 'metrics'
                      ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                      : 'text-foreground hover:bg-accent'
                  }`}
                >
                  <BarChart3 className="w-5 h-5" />
                  <span className="font-medium">Analytics</span>
                </button>

                <button
                  onClick={() => setActiveView('projects')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeView === 'projects'
                      ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                      : 'text-foreground hover:bg-accent'
                  }`}
                >
                  <Target className="w-5 h-5" />
                  <span className="font-medium">Projects</span>
                </button>

                <button
                  onClick={() => setActiveView('work-orders')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeView === 'work-orders'
                      ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                      : 'text-foreground hover:bg-accent'
                  }`}
                >
                  <FileText className="w-5 h-5" />
                  <span className="font-medium">Work Orders</span>
                </button>

                <button
                  onClick={() => setActiveView('recurring-jobs')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeView === 'recurring-jobs'
                      ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                      : 'text-foreground hover:bg-accent'
                  }`}
                >
                  <Clock className="w-5 h-5" />
                  <span className="font-medium">Recurring Services</span>
                </button>

                <button
                  onClick={() => setActiveView('work-schedule-2')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeView === 'work-schedule-2'
                      ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                      : 'text-foreground hover:bg-accent'
                  }`}
                >
                  <Calendar className="w-5 h-5" />
                  <span className="font-medium">Work Schedule</span>
                </button>

                <button
                  onClick={() => setActiveView('quotes')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeView === 'quotes'
                      ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                      : 'text-foreground hover:bg-accent'
                  }`}
                >
                  <FileText className="w-5 h-5" />
                  <span className="font-medium">Quotes</span>
                </button>

                <button
                  onClick={() => setActiveView('reports')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeView === 'reports'
                      ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                      : 'text-foreground hover:bg-accent'
                  }`}
                >
                  <BarChart3 className="w-5 h-5" />
                  <span className="font-medium">Reports</span>
                </button>

                <button
                  onClick={() => setActiveView('employee')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeView === 'employee'
                      ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                      : 'text-foreground hover:bg-accent'
                  }`}
                >
                  <Users className="w-5 h-5" />
                  <span className="font-medium">Employee Portal</span>
                </button>

                <button
                  onClick={() => setActiveView('roles')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeView === 'roles'
                      ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                      : 'text-foreground hover:bg-accent'
                  }`}
                >
                  <Settings className="w-5 h-5" />
                  <span className="font-medium">Role Management</span>
                </button>

                <button
                  onClick={() => setActiveView('approvals')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeView === 'approvals'
                      ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                      : 'text-foreground hover:bg-accent'
                  }`}
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-medium">Approval Center</span>
                </button>

                <button
                  onClick={() => setActiveView('billing')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeView === 'billing'
                      ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                      : 'text-foreground hover:bg-accent'
                  }`}
                >
                  <TrendingUp className="w-5 h-5" />
                  <span className="font-medium">Billing Portal</span>
                </button>

                <div className="border-t border-border pt-2 mt-2">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-foreground hover:bg-accent"
                  >
                    <Home className="w-5 h-5" />
                    <span className="font-medium">Landing Page</span>
                  </button>
                  
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Dashboard View */}
            {activeView === 'dashboard' && (
              <div className="space-y-6">
                {/* Header */}
                <div>
                  <h2 className="text-2xl font-semibold text-foreground mb-2">Dashboard</h2>
                  <p className="text-muted-foreground">Overview of your projects and operations</p>
                </div>

                {/* Demo Mode Info Banner */}
                <Card className="p-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-1">Demo Mode - Frontend Only</h3>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                        This is a fully functional frontend demonstration. All interactions show toast notifications
                        and update the UI state. For production use, the following features need backend integration:
                      </p>
                      <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1 ml-4 list-disc">
                        <li>Data persistence (currently using mock data in memory)</li>
                        <li>User authentication and authorization</li>
                        <li>File upload and storage for photos</li>
                        <li>Real-time notifications and updates</li>
                        <li>Payment processing for subscriptions</li>
                        <li>Email notifications for approvals and updates</li>
                      </ul>
                    </div>
                  </div>
                </Card>

                {/* AI Features Guide */}
                <AIFeaturesGuide />

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary-light dark:bg-primary/20 rounded-xl flex items-center justify-center">
                          <FolderKanban className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">Active Projects</p>
                          <p className="text-3xl font-bold text-foreground">{activeProjects}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all" 
                          style={{ width: `${(activeProjects / instanceProjects.length) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-muted-foreground">
                        {instanceProjects.length} total
                      </span>
                    </div>
                  </Card>

                  <Card className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-success-light dark:bg-success/20 rounded-xl flex items-center justify-center">
                          <CheckCircle2 className="w-6 h-6 text-success" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">Work Orders</p>
                          <p className="text-3xl font-bold text-foreground">{completedWorkOrders}<span className="text-lg text-muted-foreground">/{totalWorkOrders}</span></p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-success rounded-full transition-all" 
                          style={{ width: `${(completedWorkOrders / totalWorkOrders) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-muted-foreground">
                        {Math.round((completedWorkOrders / totalWorkOrders) * 100)}%
                      </span>
                    </div>
                  </Card>

                  <Card className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-warning-light dark:bg-warning/20 rounded-xl flex items-center justify-center">
                          <Calendar className="w-6 h-6 text-warning" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">Recurring Tasks</p>
                          <p className="text-3xl font-bold text-foreground">{instanceRecurringTasks.length}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Active schedules
                    </div>
                  </Card>

                  <Card className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-info-light dark:bg-info/20 rounded-xl flex items-center justify-center">
                          <TrendingUp className="w-6 h-6 text-info" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">Avg Progress</p>
                          <p className="text-3xl font-bold text-foreground">{averageProjectProgress}%</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-info rounded-full transition-all" 
                          style={{ width: `${averageProjectProgress}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-muted-foreground">
                        All projects
                      </span>
                    </div>
                  </Card>
                </div>

                {/* AI Insights */}
                {aiInsights.length > 0 && (
                  <AIInsightsContainer
                    insights={aiInsights}
                    onDismiss={handleDismissInsight}
                    title="AI-Powered Insights"
                    maxVisible={3}
                  />
                )}

                {/* Active Projects Overview */}
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-foreground">Active Projects</h3>
                    <Button
                      onClick={() => setShowNewProject(true)}
                      size="sm"
                      className="gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      New Project
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {instanceProjects.filter(p => p.status === 'active').map(project => (
                      <div
                        key={project.id}
                        className="p-4 border border-border rounded-lg hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-sm transition-all cursor-pointer"
                        onClick={() => {
                          setSelectedProject2(project);
                          setShowProjectDetail(true);
                          setActiveView('projects');
                        }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-foreground mb-1">{project.name}</h4>
                            <p className="text-sm text-muted-foreground">{project.customerName}</p>
                          </div>
                          <Badge
                            variant="outline"
                            className={
                              project.priority === 'critical'
                                ? 'border-red-500 text-red-700'
                                : project.priority === 'high'
                                ? 'border-orange-500 text-orange-700'
                                : 'border-blue-500 text-blue-700'
                            }
                          >
                            {project.priority}
                          </Badge>
                        </div>
                        <div className="mb-2">
                          <div className="flex items-center justify-between text-sm text-muted-foreground mb-1">
                            <span>Progress</span>
                            <span className="font-medium">{project.progress}%</span>
                          </div>
                          <Progress value={project.progress} className="h-2" />
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                          </span>
                          {project.budget && (
                            <span className="flex items-center gap-1">
                              💰 ${project.budget.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Recent Work Orders */}
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-foreground">Recent Work Orders</h3>
                    <Button
                      onClick={() => setActiveView('work-orders')}
                      variant="ghost"
                      size="sm"
                    >
                      View All
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {instanceWorkOrders.slice(0, 3).map(wo => (
                      <WorkOrderCard
                        key={wo.id}
                        workOrder={wo}
                        people={instancePeople}
                        roles={instanceRoles}
                        onClick={() => setSelectedWorkOrder(wo)}
                      />
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {/* Metrics View */}
            {activeView === 'metrics' && (
              <div className="space-y-6">
                {/* AI Insights for Metrics */}
                {aiInsights.length > 0 && (
                  <AIInsightsContainer
                    insights={aiInsights}
                    onDismiss={handleDismissInsight}
                    title="Analytics AI Insights"
                    maxVisible={3}
                  />
                )}
                
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">Metrics Dashboard</h2>
                    <p className="text-gray-600">Analytics and performance indicators</p>
                  </div>
                  <CustomWidgetBuilder
                    onAddWidget={(widget) => setCustomWidgets([...customWidgets, widget])}
                    existingWidgets={customWidgets}
                  />
                </div>

                <MetricsDashboard
                  instances={instances}
                  projects={projects}
                  workOrders={workOrders}
                  tasks={tasks}
                  people={mockPeople}
                  selectedInstanceId={selectedInstanceId}
                />

                {/* Custom Widgets Grid */}
                {customWidgets.length > 0 && (
                  <>
                    <div className="border-t pt-6 mt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Custom Widgets</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {customWidgets.map(widget => (
                        <CustomWidgetDisplay
                          key={widget.id}
                          widget={widget}
                          data={{
                            value: '—',
                            subtitle: 'Loading...',
                          }}
                          onRemove={(id) => setCustomWidgets(customWidgets.filter(w => w.id !== id))}
                        />
                      ))}
                    </div>
                  </>
                )}

                {/* Color Legend */}
                <div className="border-t pt-6 mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Color Coding Reference</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowColorLegend(!showColorLegend)}
                    >
                      <Palette className="w-4 h-4 mr-2" />
                      {showColorLegend ? 'Hide' : 'Show'} Legend
                    </Button>
                  </div>
                  {showColorLegend && (
                    <ColorLegend
                      instances={instances}
                      showStatuses={true}
                      showPriorities={true}
                      showActivityLevels={true}
                    />
                  )}
                </div>
              </div>
            )}

            {/* Projects View */}
            {activeView === 'projects' && (
              <div className="space-y-6">
                {/* AI Insights for Projects */}
                {!showProjectDetail && aiInsights.filter(i => 
                  i.id.includes('portfolio') || 
                  i.id.includes('project')
                ).length > 0 && (
                  <AIInsightsContainer
                    insights={aiInsights.filter(i => 
                      i.id.includes('portfolio') || 
                      i.id.includes('project')
                    )}
                    onDismiss={handleDismissInsight}
                    title="Portfolio AI Insights"
                    maxVisible={3}
                  />
                )}
                
                {showProjectDetail && selectedProject2 ? (
                  <ProjectDetailPage
                    project={selectedProject2}
                    tasks={tasks.filter(t => t.projectId === selectedProject2.id)}
                    people={instancePeople}
                    onBack={() => {
                      setShowProjectDetail(false);
                      setSelectedProject2(null);
                    }}
                    onEdit={() => {
                      toast.info('Edit functionality coming soon');
                    }}
                  />
                ) : (
                  <ProjectsPortfolioView
                    projects={instanceProjects}
                    people={instancePeople}
                    onProjectClick={(project) => {
                      setSelectedProject2(project);
                      setShowProjectDetail(true);
                    }}
                    onNewProject={() => setShowNewProject(true)}
                  />
                )}
              </div>
            )}

            {/* Work Orders View */}
            {activeView === 'work-orders' && (
              <WorkOrders
                workOrders={instanceWorkOrders}
                projects={instanceProjects}
                people={instancePeople}
                roles={instanceRoles}
                onNewWorkOrder={() => setShowNewWorkOrder(true)}
              />
            )}

            {/* Recurring Services View */}
            {activeView === 'recurring-jobs' && (
              <div className="space-y-6">
                {/* AI Insights for Recurring Jobs */}
                {aiInsights.filter(i => i.id.includes('recurring')).length > 0 && (
                  <AIInsightsContainer
                    insights={aiInsights.filter(i => i.id.includes('recurring'))}
                    onDismiss={handleDismissInsight}
                    title="Recurring Services AI Insights"
                    maxVisible={2}
                  />
                )}
                
                <RecurringJobs
                  recurringTasks={instanceRecurringTasks}
                  projects={instanceProjects}
                  people={instancePeople}
                  roles={instanceRoles}
                  onNewRecurringJob={() => setShowNewRecurringJob(true)}
                />

                <NewRecurringJobDialog
                  open={showNewRecurringJob}
                  onOpenChange={setShowNewRecurringJob}
                  onSubmit={handleCreateRecurringJob}
                  projects={instanceProjects}
                  people={instancePeople}
                  roles={instanceRoles}
                  instanceId={selectedInstanceId}
                />
              </div>
            )}

            {/* Work Schedule 2.0 View */}
            {activeView === 'work-schedule-2' && (
              <div className="space-y-6">
                {/* AI Insights for Work Schedule */}
                {aiInsights.filter(i => 
                  i.id.includes('workorder') || 
                  i.id.includes('recurring') ||
                  i.id.includes('overlap')
                ).length > 0 && (
                  <AIInsightsContainer
                    insights={aiInsights.filter(i => 
                      i.id.includes('workorder') || 
                      i.id.includes('recurring') ||
                      i.id.includes('overlap')
                    )}
                    onDismiss={handleDismissInsight}
                    title="Work Schedule AI Insights"
                    maxVisible={2}
                  />
                )}

                <WorkSchedule2
                  workOrders={instanceWorkOrders}
                  recurringTasks={instanceRecurringTasks}
                  projects={instanceProjects}
                  people={instancePeople}
                  roles={instanceRoles}
                />
              </div>
            )}

            {/* Quotes View - Placeholder for Tabs below */}
            {activeView === 'quotes' && !showQuotePage && (
              <Quotes
                quotes={instanceQuotes}
                projects={instanceProjects}
                people={instancePeople}
                onCreate={() => {
                  setSelectedQuote(null);
                  setQuotePageMode('create');
                  setShowQuotePage(true);
                }}
                onEdit={(quote) => {
                  setSelectedQuote(quote);
                  setQuotePageMode('edit');
                  setShowQuotePage(true);
                }}
                onView={(quote) => {
                  setSelectedQuote(quote);
                  setQuotePageMode('view');
                  setShowQuotePage(true);
                }}
              />
            )}

            {/* Quote Detail Page */}
            {activeView === 'quotes' && showQuotePage && (
              <QuotePage
                quote={selectedQuote}
                mode={quotePageMode}
                projects={instanceProjects}
                people={instancePeople}
                onBack={() => {
                  setShowQuotePage(false);
                  setSelectedQuote(null);
                }}
                onSave={(quote) => {
                  if (quotePageMode === 'create') {
                    setQuotes([...quotes, quote]);
                    toast.success('Quote created successfully');
                  } else if (quotePageMode === 'edit') {
                    setQuotes(quotes.map(q => q.id === quote.id ? quote : q));
                    toast.success('Quote updated successfully');
                  }
                  setShowQuotePage(false);
                  setSelectedQuote(null);
                }}
              />
            )}

            {/* Reports View */}
            {activeView === 'reports' && !showReportPage && (
              <Reports
                projects={instanceProjects}
                workOrders={instanceWorkOrders}
                people={instancePeople}
                onViewReport={(reportId) => {
                  setSelectedReportId(reportId);
                  setShowReportPage(true);
                }}
              />
            )}

            {/* Report Detail Page */}
            {activeView === 'reports' && showReportPage && selectedReportId && (
              <ReportPage
                reportId={selectedReportId}
                projects={instanceProjects}
                workOrders={instanceWorkOrders}
                people={instancePeople}
                onBack={() => {
                  setShowReportPage(false);
                  setSelectedReportId(null);
                }}
              />
            )}

            {/* Employee Portal View */}
            {activeView === 'employee' && (
              <EmployeePortal
                people={instancePeople}
                roles={instanceRoles}
                workOrders={instanceWorkOrders}
                projects={instanceProjects}
              />
            )}

            {/* Role Management View */}
            {activeView === 'roles' && (
              <RoleManagement
                roles={mockRoles}
                people={instancePeople}
                instanceId={selectedInstanceId}
              />
            )}

            {/* Approval Center View */}
            {activeView === 'approvals' && (
              <ApprovalCenter
                workOrders={instanceWorkOrders}
                people={instancePeople}
                roles={instanceRoles}
              />
            )}

            {/* Billing Portal View */}
            {activeView === 'billing' && (
              <BillingPortal />
            )}

            {/* Metrics Dashboard View */}
            {activeView === 'metrics' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-foreground">Analytics & Metrics</h1>
                    <p className="text-muted-foreground mt-1">
                      Comprehensive view of your portfolio performance
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setShowColorLegend(!showColorLegend)}
                    className="gap-2"
                  >
                    <Palette className="w-4 h-4" />
                    Color Legend
                  </Button>
                </div>

                {showColorLegend && <ColorLegend />}

                <MetricsDashboard
                  instances={instances}
                  projects={instanceProjects}
                  workOrders={instanceWorkOrders}
                  tasks={instanceTasks}
                  people={instancePeople}
                  selectedInstanceId={selectedInstanceId}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <CustomerOnboarding
        open={showInstanceOnboarding}
        onOpenChange={setShowInstanceOnboarding}
        onSubmit={handleCreateInstance}
      />

      <EnhancedNewProjectDialog
        open={showNewProject}
        onOpenChange={setShowNewProject}
        onSubmit={handleCreateProject}
        people={mockPeople}
        roles={mockRoles}
        instanceId={selectedInstanceId}
      />

      <NewWorkOrderDialog
        open={showNewWorkOrder}
        onOpenChange={setShowNewWorkOrder}
        onSubmit={handleCreateWorkOrder}
        projects={instanceProjects}
        people={instancePeople}
        roles={instanceRoles}
        instanceId={selectedInstanceId}
      />

      {showLoginModal && (
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onLoginSuccess={() => {
            setIsLoggedIn(true);
            setShowLoginModal(false);
            toast.success('Successfully logged in!');
          }}
        />
      )}
    </div>
  );
}