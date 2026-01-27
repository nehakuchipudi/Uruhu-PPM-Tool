import React, { useState, useMemo } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import {
  ArrowLeft,
  Download,
  FileText,
  Mail,
  Printer,
  Calendar,
  Filter,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
  DollarSign,
  Target,
  CheckCircle,
  Clock,
  Users,
  Briefcase,
  Package,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
} from 'recharts';
import { Project, WorkOrder, Quote, RecurringTask, Person } from '@/types';
import { toast } from 'sonner';

interface ReportPageProps {
  reportId: string;
  projects: Project[];
  workOrders: WorkOrder[];
  quotes: Quote[];
  recurringTasks: RecurringTask[];
  people: Person[];
  onBack: () => void;
}

export function ReportPage({
  reportId,
  projects,
  workOrders,
  quotes,
  recurringTasks,
  people,
  onBack,
}: ReportPageProps) {
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'ytd' | 'all'>(
    '30d'
  );
  const [customerFilter, setCustomerFilter] = useState<string>('all');

  // Get unique customers
  const customers = useMemo(() => {
    const uniqueCustomers = new Set<string>();
    projects.forEach((p) => uniqueCustomers.add(p.customerName));
    workOrders.forEach((w) => uniqueCustomers.add(w.customerName));
    return Array.from(uniqueCustomers).sort();
  }, [projects, workOrders]);

  // Filter data by date range
  const getFilteredData = () => {
    const now = new Date();
    let startDate = new Date();

    switch (dateRange) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'ytd':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(0);
    }

    const filteredProjects = projects.filter((p) => {
      const projectDate = new Date(p.startDate);
      const customerMatch =
        customerFilter === 'all' || p.customerName === customerFilter;
      return projectDate >= startDate && customerMatch;
    });

    const filteredWorkOrders = workOrders.filter((w) => {
      const workOrderDate = new Date(w.scheduledDate);
      const customerMatch =
        customerFilter === 'all' || w.customerName === customerFilter;
      return workOrderDate >= startDate && customerMatch;
    });

    const filteredQuotes = quotes.filter((q) => {
      const quoteDate = new Date(q.createdAt);
      const customerMatch =
        customerFilter === 'all' || q.customerName === customerFilter;
      return quoteDate >= startDate && customerMatch;
    });

    return {
      projects: filteredProjects,
      workOrders: filteredWorkOrders,
      quotes: filteredQuotes,
    };
  };

  const { projects: filteredProjects, workOrders: filteredWorkOrders, quotes: filteredQuotes } =
    getFilteredData();

  // Export functions
  const handleExportPDF = () => {
    toast.success('Exporting report as PDF...');
  };

  const handleExportExcel = () => {
    toast.success('Exporting report as Excel...');
  };

  const handleExportCSV = () => {
    toast.success('Exporting report as CSV...');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEmail = () => {
    toast.success('Opening email dialog...');
  };

  // Report metadata
  const reportMetadata: Record<
    string,
    { title: string; description: string; icon: React.ReactNode }
  > = {
    'portfolio-summary': {
      title: 'Portfolio Summary',
      description: 'High-level overview of all projects and their status',
      icon: <Briefcase className="w-6 h-6" />,
    },
    'project-performance': {
      title: 'Project Performance',
      description: 'Detailed analysis of individual project metrics and KPIs',
      icon: <TrendingUp className="w-6 h-6" />,
    },
    'project-budget': {
      title: 'Project Budget Analysis',
      description: 'Budget vs. actual spending across all projects',
      icon: <DollarSign className="w-6 h-6" />,
    },
    'project-timeline': {
      title: 'Project Timeline Report',
      description: 'Schedule adherence and timeline analysis',
      icon: <Calendar className="w-6 h-6" />,
    },
    'evm-report': {
      title: 'Earned Value Management',
      description: 'EVM metrics including CPI, SPI, and forecasting',
      icon: <Target className="w-6 h-6" />,
    },
    'work-order-summary': {
      title: 'Work Order Summary',
      description: 'Overview of work order volumes, status, and trends',
      icon: <FileText className="w-6 h-6" />,
    },
    'work-order-performance': {
      title: 'Work Order Performance',
      description: 'Completion rates, cycle times, and efficiency metrics',
      icon: <CheckCircle className="w-6 h-6" />,
    },
    'recurring-services': {
      title: 'Recurring Services Report',
      description: 'Analysis of recurring tasks and service delivery',
      icon: <Clock className="w-6 h-6" />,
    },
    'service-delivery': {
      title: 'Service Delivery Analysis',
      description: 'Customer service levels and delivery performance',
      icon: <Package className="w-6 h-6" />,
    },
    'revenue-analysis': {
      title: 'Revenue Analysis',
      description: 'Revenue trends, forecasting, and growth analysis',
      icon: <TrendingUp className="w-6 h-6" />,
    },
    'quote-conversion': {
      title: 'Quote Conversion Report',
      description: 'Quote-to-project conversion rates and win analysis',
      icon: <FileText className="w-6 h-6" />,
    },
    'profitability': {
      title: 'Profitability Analysis',
      description: 'Profit margins by project, customer, and service type',
      icon: <DollarSign className="w-6 h-6" />,
    },
    'billing-summary': {
      title: 'Billing Summary',
      description: 'Invoicing, payments, and accounts receivable',
      icon: <FileText className="w-6 h-6" />,
    },
    'resource-utilization': {
      title: 'Resource Utilization',
      description: 'Team member workload and capacity analysis',
      icon: <Users className="w-6 h-6" />,
    },
    'team-performance': {
      title: 'Team Performance',
      description: 'Individual and team productivity metrics',
      icon: <Target className="w-6 h-6" />,
    },
    'capacity-planning': {
      title: 'Capacity Planning',
      description: 'Resource availability and future capacity needs',
      icon: <Calendar className="w-6 h-6" />,
    },
    'customer-summary': {
      title: 'Customer Summary',
      description: 'Overview of customer activity and engagement',
      icon: <Users className="w-6 h-6" />,
    },
    'customer-profitability': {
      title: 'Customer Profitability',
      description: 'Revenue and profitability by customer',
      icon: <DollarSign className="w-6 h-6" />,
    },
    'customer-satisfaction': {
      title: 'Customer Satisfaction',
      description: 'Service quality and satisfaction metrics',
      icon: <CheckCircle className="w-6 h-6" />,
    },
  };

  const metadata = reportMetadata[reportId] || reportMetadata['portfolio-summary'];

  // Render specific report content
  const renderReportContent = () => {
    switch (reportId) {
      case 'portfolio-summary':
        return <PortfolioSummaryReport projects={filteredProjects} />;
      case 'project-performance':
        return <ProjectPerformanceReport projects={filteredProjects} />;
      case 'project-budget':
        return <ProjectBudgetReport projects={filteredProjects} />;
      case 'work-order-summary':
        return <WorkOrderSummaryReport workOrders={filteredWorkOrders} />;
      case 'work-order-performance':
        return <WorkOrderPerformanceReport workOrders={filteredWorkOrders} />;
      case 'revenue-analysis':
        return <RevenueAnalysisReport projects={filteredProjects} quotes={filteredQuotes} />;
      case 'quote-conversion':
        return <QuoteConversionReport quotes={filteredQuotes} />;
      case 'resource-utilization':
        return <ResourceUtilizationReport people={people} workOrders={filteredWorkOrders} />;
      case 'customer-summary':
        return <CustomerSummaryReport projects={filteredProjects} workOrders={filteredWorkOrders} />;
      default:
        return <PortfolioSummaryReport projects={filteredProjects} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button variant="outline" onClick={onBack} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400">
              {metadata.icon}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{metadata.title}</h1>
              <p className="text-muted-foreground mt-1">{metadata.description}</p>
            </div>
          </div>
        </div>

        {/* Export Actions */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2">
            <Printer className="w-4 h-4" />
            Print
          </Button>
          <Button variant="outline" size="sm" onClick={handleEmail} className="gap-2">
            <Mail className="w-4 h-4" />
            Email
          </Button>
          <Select defaultValue="pdf" onValueChange={(value) => {
            if (value === 'pdf') handleExportPDF();
            else if (value === 'excel') handleExportExcel();
            else if (value === 'csv') handleExportCSV();
          }}>
            <SelectTrigger className="w-[140px]">
              <Download className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Export" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf">Export as PDF</SelectItem>
              <SelectItem value="excel">Export as Excel</SelectItem>
              <SelectItem value="csv">Export as CSV</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Filters:</span>
          </div>
          <Select value={dateRange} onValueChange={(value: any) => setDateRange(value)}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
              <SelectItem value="ytd">Year to Date</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Select value={customerFilter} onValueChange={setCustomerFilter}>
            <SelectTrigger className="w-[200px]">
              <Users className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Customers</SelectItem>
              {customers.map((customer) => (
                <SelectItem key={customer} value={customer}>
                  {customer}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="gap-2 ml-auto">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </Card>

      {/* Report Content */}
      {renderReportContent()}
    </div>
  );
}

// Individual Report Components

function PortfolioSummaryReport({ projects }: { projects: Project[] }) {
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const statusData = [
    { name: 'Planning', value: projects.filter((p) => p.status === 'planning').length, color: COLORS[0] },
    { name: 'Active', value: projects.filter((p) => p.status === 'active').length, color: COLORS[1] },
    { name: 'On Hold', value: projects.filter((p) => p.status === 'on-hold').length, color: COLORS[2] },
    { name: 'Completed', value: projects.filter((p) => p.status === 'completed').length, color: COLORS[3] },
  ];

  const priorityData = [
    { name: 'Critical', value: projects.filter((p) => p.priority === 'critical').length, color: COLORS[3] },
    { name: 'High', value: projects.filter((p) => p.priority === 'high').length, color: COLORS[2] },
    { name: 'Medium', value: projects.filter((p) => p.priority === 'medium').length, color: COLORS[0] },
    { name: 'Low', value: projects.filter((p) => p.priority === 'low').length, color: COLORS[1] },
  ];

  const avgProgress = projects.length > 0
    ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length)
    : 0;

  const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Projects</p>
              <p className="text-3xl font-bold text-foreground mt-1">{projects.length}</p>
            </div>
            <Briefcase className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Projects</p>
              <p className="text-3xl font-bold text-foreground mt-1">
                {projects.filter((p) => p.status === 'active').length}
              </p>
            </div>
            <Target className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg. Progress</p>
              <p className="text-3xl font-bold text-foreground mt-1">{avgProgress}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Budget</p>
              <p className="text-3xl font-bold text-foreground mt-1">
                ${totalBudget.toLocaleString()}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Projects by Status
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Projects by Priority
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={priorityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Projects Table */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Project Details</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">
                  Project
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">
                  Customer
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">
                  Status
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">
                  Priority
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">
                  Progress
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">
                  Budget
                </th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.id} className="border-b border-border hover:bg-accent">
                  <td className="py-3 px-4 text-sm text-foreground font-medium">
                    {project.name}
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">
                    {project.customerName}
                  </td>
                  <td className="py-3 px-4">
                    <Badge
                      variant={
                        project.status === 'active'
                          ? 'default'
                          : project.status === 'completed'
                          ? 'secondary'
                          : 'outline'
                      }
                    >
                      {project.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <Badge
                      variant={
                        project.priority === 'critical' || project.priority === 'high'
                          ? 'destructive'
                          : 'secondary'
                      }
                    >
                      {project.priority}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-sm text-foreground">
                    {project.progress}%
                  </td>
                  <td className="py-3 px-4 text-sm text-foreground text-right">
                    ${(project.budget || 0).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function ProjectPerformanceReport({ projects }: { projects: Project[] }) {
  const performanceData = projects.map((p) => ({
    name: p.name.length > 20 ? p.name.substring(0, 20) + '...' : p.name,
    progress: p.progress,
    budget: p.budget || 0,
  }));

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Project Progress Overview
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="progress" fill="#3b82f6" name="Progress %" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Performance Metrics
        </h3>
        <div className="space-y-4">
          {projects.map((project) => (
            <div key={project.id} className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{project.name}</p>
                <p className="text-xs text-muted-foreground">{project.customerName}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">
                    {project.progress}%
                  </p>
                  <p className="text-xs text-muted-foreground">Progress</p>
                </div>
                <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                  {project.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function ProjectBudgetReport({ projects }: { projects: Project[] }) {
  const budgetData = projects.map((p) => ({
    name: p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name,
    budget: p.budget || 0,
    spent: Math.round((p.budget || 0) * (p.progress / 100)),
  }));

  const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
  const totalSpent = projects.reduce(
    (sum, p) => sum + Math.round((p.budget || 0) * (p.progress / 100)),
    0
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Total Budget</p>
          <p className="text-3xl font-bold text-foreground mt-1">
            ${totalBudget.toLocaleString()}
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Total Spent</p>
          <p className="text-3xl font-bold text-foreground mt-1">
            ${totalSpent.toLocaleString()}
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Remaining</p>
          <p className="text-3xl font-bold text-foreground mt-1">
            ${(totalBudget - totalSpent).toLocaleString()}
          </p>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Budget vs. Spent
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={budgetData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="budget" fill="#3b82f6" name="Budget" />
            <Bar dataKey="spent" fill="#10b981" name="Spent" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}

function WorkOrderSummaryReport({ workOrders }: { workOrders: WorkOrder[] }) {
  const statusData = [
    { name: 'Draft', value: workOrders.filter((w) => w.status === 'draft').length },
    { name: 'Scheduled', value: workOrders.filter((w) => w.status === 'scheduled').length },
    { name: 'In Progress', value: workOrders.filter((w) => w.status === 'in-progress').length },
    { name: 'Completed', value: workOrders.filter((w) => w.status === 'completed').length },
    { name: 'Cancelled', value: workOrders.filter((w) => w.status === 'cancelled').length },
  ];

  const completionRate = workOrders.length > 0
    ? Math.round((workOrders.filter((w) => w.status === 'completed').length / workOrders.length) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Total Work Orders</p>
          <p className="text-3xl font-bold text-foreground mt-1">{workOrders.length}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Completed</p>
          <p className="text-3xl font-bold text-foreground mt-1">
            {workOrders.filter((w) => w.status === 'completed').length}
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">In Progress</p>
          <p className="text-3xl font-bold text-foreground mt-1">
            {workOrders.filter((w) => w.status === 'in-progress').length}
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Completion Rate</p>
          <p className="text-3xl font-bold text-foreground mt-1">{completionRate}%</p>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Work Orders by Status
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={statusData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}

function WorkOrderPerformanceReport({ workOrders }: { workOrders: WorkOrder[] }) {
  const completedOrders = workOrders.filter((w) => w.status === 'completed');
  
  const avgDuration = completedOrders.length > 0
    ? Math.round(
        completedOrders.reduce((sum, w) => sum + (w.actualDuration || w.estimatedDuration), 0) /
          completedOrders.length
      )
    : 0;

  const onTimeDelivery = completedOrders.length > 0
    ? Math.round(
        (completedOrders.filter((w) => (w.actualDuration || 0) <= w.estimatedDuration).length /
          completedOrders.length) *
          100
      )
    : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Avg. Duration</p>
          <p className="text-3xl font-bold text-foreground mt-1">{avgDuration}h</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">On-Time Delivery</p>
          <p className="text-3xl font-bold text-foreground mt-1">{onTimeDelivery}%</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Completed Orders</p>
          <p className="text-3xl font-bold text-foreground mt-1">{completedOrders.length}</p>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Performance Trends
        </h3>
        <div className="space-y-4">
          {completedOrders.slice(0, 10).map((order) => (
            <div key={order.id} className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{order.title}</p>
                <p className="text-xs text-muted-foreground">{order.customerName}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">
                    {order.actualDuration || order.estimatedDuration}h
                  </p>
                  <p className="text-xs text-muted-foreground">Duration</p>
                </div>
                <Badge variant="secondary">{order.completedDate ? new Date(order.completedDate).toLocaleDateString() : 'N/A'}</Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function RevenueAnalysisReport({ projects, quotes }: { projects: Project[]; quotes: Quote[] }) {
  const totalRevenue = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
  const quoteValue = quotes.reduce((sum, q) => sum + q.totalAmount, 0);
  const convertedQuotes = quotes.filter((q) => q.status === 'converted');
  
  const monthlyRevenue = projects.reduce((acc: any[], project) => {
    const month = new Date(project.startDate).toLocaleString('default', { month: 'short' });
    const existing = acc.find((item) => item.month === month);
    if (existing) {
      existing.revenue += project.budget || 0;
    } else {
      acc.push({ month, revenue: project.budget || 0 });
    }
    return acc;
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Total Revenue</p>
          <p className="text-3xl font-bold text-foreground mt-1">
            ${totalRevenue.toLocaleString()}
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Pending Quotes</p>
          <p className="text-3xl font-bold text-foreground mt-1">
            ${quoteValue.toLocaleString()}
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Converted Quotes</p>
          <p className="text-3xl font-bold text-foreground mt-1">{convertedQuotes.length}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Avg. Project Value</p>
          <p className="text-3xl font-bold text-foreground mt-1">
            ${projects.length > 0 ? Math.round(totalRevenue / projects.length).toLocaleString() : 0}
          </p>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Revenue Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={monthlyRevenue}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
          </AreaChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}

function QuoteConversionReport({ quotes }: { quotes: Quote[] }) {
  const conversionRate = quotes.length > 0
    ? Math.round((quotes.filter((q) => q.status === 'converted').length / quotes.length) * 100)
    : 0;

  const statusData = [
    { name: 'Draft', value: quotes.filter((q) => q.status === 'draft').length },
    { name: 'Sent', value: quotes.filter((q) => q.status === 'sent').length },
    { name: 'Approved', value: quotes.filter((q) => q.status === 'approved').length },
    { name: 'Converted', value: quotes.filter((q) => q.status === 'converted').length },
    { name: 'Rejected', value: quotes.filter((q) => q.status === 'rejected').length },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Total Quotes</p>
          <p className="text-3xl font-bold text-foreground mt-1">{quotes.length}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Conversion Rate</p>
          <p className="text-3xl font-bold text-foreground mt-1">{conversionRate}%</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Converted Quotes</p>
          <p className="text-3xl font-bold text-foreground mt-1">
            {quotes.filter((q) => q.status === 'converted').length}
          </p>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Quote Status Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={statusData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: ${value}`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {statusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'][index]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}

function ResourceUtilizationReport({ people, workOrders }: { people: Person[]; workOrders: WorkOrder[] }) {
  const utilizationData = people.map((person) => {
    const assignedOrders = workOrders.filter((w) => w.assignedTo.includes(person.id));
    const completedOrders = assignedOrders.filter((w) => w.status === 'completed');
    
    return {
      name: person.name,
      assigned: assignedOrders.length,
      completed: completedOrders.length,
      utilization: assignedOrders.length > 0 
        ? Math.round((completedOrders.length / assignedOrders.length) * 100)
        : 0,
    };
  });

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Team Utilization
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={utilizationData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="assigned" fill="#3b82f6" name="Assigned" />
            <Bar dataKey="completed" fill="#10b981" name="Completed" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Individual Performance
        </h3>
        <div className="space-y-4">
          {utilizationData.map((person) => (
            <div key={person.name} className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{person.name}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">
                    {person.completed}/{person.assigned}
                  </p>
                  <p className="text-xs text-muted-foreground">Completed/Assigned</p>
                </div>
                <Badge variant={person.utilization >= 70 ? 'default' : 'secondary'}>
                  {person.utilization}%
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function CustomerSummaryReport({
  projects,
  workOrders,
}: {
  projects: Project[];
  workOrders: WorkOrder[];
}) {
  const customerData = projects.reduce((acc: any[], project) => {
    const existing = acc.find((item) => item.name === project.customerName);
    const customerWorkOrders = workOrders.filter((w) => w.customerName === project.customerName);
    
    if (existing) {
      existing.projects += 1;
      existing.revenue += project.budget || 0;
      existing.workOrders = customerWorkOrders.length;
    } else {
      acc.push({
        name: project.customerName,
        projects: 1,
        revenue: project.budget || 0,
        workOrders: customerWorkOrders.length,
      });
    }
    return acc;
  }, []);

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Customer Activity
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={customerData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="projects" fill="#3b82f6" name="Projects" />
            <Bar dataKey="workOrders" fill="#10b981" name="Work Orders" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Revenue by Customer
        </h3>
        <div className="space-y-4">
          {customerData
            .sort((a, b) => b.revenue - a.revenue)
            .map((customer) => (
              <div key={customer.name} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{customer.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {customer.projects} projects, {customer.workOrders} work orders
                  </p>
                </div>
                <p className="text-lg font-bold text-foreground">
                  ${customer.revenue.toLocaleString()}
                </p>
              </div>
            ))}
        </div>
      </Card>
    </div>
  );
}
