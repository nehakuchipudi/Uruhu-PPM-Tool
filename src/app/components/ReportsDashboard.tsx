import React from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  CheckCircle,
  Clock,
  Users,
  Briefcase,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';
import { Project, WorkOrder, Quote } from '@/types';

interface ReportsDashboardProps {
  projects: Project[];
  workOrders: WorkOrder[];
  quotes: Quote[];
  onViewReport: (reportId: string) => void;
}

export function ReportsDashboard({
  projects,
  workOrders,
  quotes,
  onViewReport,
}: ReportsDashboardProps) {
  // Calculate metrics
  const activeProjects = projects.filter((p) => p.status === 'active');
  const completedProjects = projects.filter((p) => p.status === 'completed');
  const onHoldProjects = projects.filter((p) => p.status === 'on-hold');
  
  const completedWorkOrders = workOrders.filter((w) => w.status === 'completed');
  const inProgressWorkOrders = workOrders.filter((w) => w.status === 'in-progress');
  const pendingWorkOrders = workOrders.filter((w) => w.status === 'scheduled');
  
  const totalRevenue = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
  const quoteValue = quotes
    .filter((q) => q.status === 'sent' || q.status === 'approved')
    .reduce((sum, q) => sum + q.totalAmount, 0);
  
  const avgProjectProgress = projects.length > 0
    ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length)
    : 0;
  
  const completionRate = workOrders.length > 0
    ? Math.round((completedWorkOrders.length / workOrders.length) * 100)
    : 0;

  const quoteConversionRate = quotes.length > 0
    ? Math.round((quotes.filter((q) => q.status === 'converted').length / quotes.length) * 100)
    : 0;

  // Critical items that need attention
  const criticalProjects = projects.filter((p) => p.priority === 'critical' && p.status !== 'completed');
  const overdueWorkOrders = workOrders.filter((w) => {
    const scheduledDate = new Date(w.scheduledDate);
    return scheduledDate < new Date() && w.status !== 'completed';
  });

  return (
    <div className="space-y-6">
      {/* Executive Summary */}
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Executive Summary</h2>
            <p className="text-muted-foreground mt-1">
              Real-time insights across your portfolio
            </p>
          </div>
          <Badge variant="default" className="bg-blue-600">
            Live Data
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Portfolio Health</span>
              <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">{avgProjectProgress}%</span>
              <span className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Avg. Progress
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Active Revenue</span>
              <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">
                ${(totalRevenue / 1000).toFixed(0)}K
              </span>
              <span className="text-sm text-muted-foreground">
                {activeProjects.length} projects
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Work Completion</span>
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">{completionRate}%</span>
              <span className="text-sm text-muted-foreground">
                {completedWorkOrders.length}/{workOrders.length}
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Quote Pipeline</span>
              <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">
                ${(quoteValue / 1000).toFixed(0)}K
              </span>
              <span className="text-sm text-green-600 dark:text-green-400">
                {quoteConversionRate}% convert
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Alerts and Attention Items */}
      {(criticalProjects.length > 0 || overdueWorkOrders.length > 0) && (
        <Card className="p-6 border-orange-200 dark:border-orange-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-50 dark:bg-orange-950 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Items Requiring Attention</h3>
              <p className="text-sm text-muted-foreground">
                Critical items that need immediate review
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {criticalProjects.length > 0 && (
              <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-3">
                  <Briefcase className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <div>
                    <p className="font-medium text-foreground">
                      {criticalProjects.length} Critical Project{criticalProjects.length !== 1 ? 's' : ''}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      High-priority projects requiring focus
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewReport('portfolio-summary')}
                >
                  View
                </Button>
              </div>
            )}

            {overdueWorkOrders.length > 0 && (
              <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950 rounded-lg border border-orange-200 dark:border-orange-800">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  <div>
                    <p className="font-medium text-foreground">
                      {overdueWorkOrders.length} Overdue Work Order{overdueWorkOrders.length !== 1 ? 's' : ''}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Work orders past scheduled date
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewReport('work-order-performance')}
                >
                  View
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Quick Access to Popular Reports */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Quick Access Reports</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card
            className="p-5 cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-blue-300 dark:hover:border-blue-700"
            onClick={() => onViewReport('portfolio-summary')}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-blue-50 dark:bg-blue-950 rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground" />
            </div>
            <h4 className="font-semibold text-foreground mb-1">Portfolio Summary</h4>
            <p className="text-sm text-muted-foreground">
              High-level overview of all projects and status
            </p>
            <div className="mt-3 flex gap-2">
              <Badge variant="secondary" className="text-xs">Executive</Badge>
              <Badge variant="secondary" className="text-xs">Overview</Badge>
            </div>
          </Card>

          <Card
            className="p-5 cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-green-300 dark:hover:border-green-700"
            onClick={() => onViewReport('revenue-analysis')}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-950 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground" />
            </div>
            <h4 className="font-semibold text-foreground mb-1">Revenue Analysis</h4>
            <p className="text-sm text-muted-foreground">
              Revenue trends, forecasting, and growth
            </p>
            <div className="mt-3 flex gap-2">
              <Badge variant="secondary" className="text-xs">Financial</Badge>
              <Badge variant="secondary" className="text-xs">Revenue</Badge>
            </div>
          </Card>

          <Card
            className="p-5 cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-purple-300 dark:hover:border-purple-700"
            onClick={() => onViewReport('work-order-summary')}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-purple-50 dark:bg-purple-950 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground" />
            </div>
            <h4 className="font-semibold text-foreground mb-1">Work Order Summary</h4>
            <p className="text-sm text-muted-foreground">
              Overview of work order volumes and trends
            </p>
            <div className="mt-3 flex gap-2">
              <Badge variant="secondary" className="text-xs">Operations</Badge>
              <Badge variant="secondary" className="text-xs">Summary</Badge>
            </div>
          </Card>

          <Card
            className="p-5 cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-orange-300 dark:hover:border-orange-700"
            onClick={() => onViewReport('resource-utilization')}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-orange-50 dark:bg-orange-950 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground" />
            </div>
            <h4 className="font-semibold text-foreground mb-1">Resource Utilization</h4>
            <p className="text-sm text-muted-foreground">
              Team workload and capacity analysis
            </p>
            <div className="mt-3 flex gap-2">
              <Badge variant="secondary" className="text-xs">Resources</Badge>
              <Badge variant="secondary" className="text-xs">Team</Badge>
            </div>
          </Card>

          <Card
            className="p-5 cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-indigo-300 dark:hover:border-indigo-700"
            onClick={() => onViewReport('project-performance')}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground" />
            </div>
            <h4 className="font-semibold text-foreground mb-1">Project Performance</h4>
            <p className="text-sm text-muted-foreground">
              Detailed project metrics and KPIs
            </p>
            <div className="mt-3 flex gap-2">
              <Badge variant="secondary" className="text-xs">Performance</Badge>
              <Badge variant="secondary" className="text-xs">KPIs</Badge>
            </div>
          </Card>

          <Card
            className="p-5 cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-teal-300 dark:hover:border-teal-700"
            onClick={() => onViewReport('customer-summary')}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-teal-50 dark:bg-teal-950 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground" />
            </div>
            <h4 className="font-semibold text-foreground mb-1">Customer Summary</h4>
            <p className="text-sm text-muted-foreground">
              Customer activity and engagement overview
            </p>
            <div className="mt-3 flex gap-2">
              <Badge variant="secondary" className="text-xs">Customers</Badge>
              <Badge variant="secondary" className="text-xs">Activity</Badge>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
