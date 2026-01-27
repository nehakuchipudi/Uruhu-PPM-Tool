import React, { useState } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Progress } from '@/app/components/ui/progress';
import { Project, Task, Person } from '@/types';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Clock,
  DollarSign,
  Users,
  Target,
  Calendar,
  AlertCircle,
  Sparkles,
  RefreshCw,
  ArrowRight,
  Briefcase,
  Activity,
  Zap,
  Flag,
  BarChart3,
  PieChart as PieChartIcon,
} from 'lucide-react';

interface ProjectDashboardTabProps {
  project: Project;
  tasks: Task[];
  people: Person[];
}

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'amber' | 'red' | 'purple';
}

interface InsightCard {
  id: string;
  type: 'warning' | 'success' | 'info' | 'critical';
  title: string;
  description: string;
  actionable: boolean;
}

interface MilestoneItem {
  id: string;
  name: string;
  projectName: string;
  dueDate: string;
  status: 'completed' | 'on-track' | 'at-risk' | 'overdue';
  daysUntil: number;
}

interface ResourceAllocation {
  id: string;
  name: string;
  avatar?: string;
  role: string;
  assignedProjects: string[];
  currentLoad: number;
  availability: 'under' | 'optimal' | 'over';
}

function KPICard({ title, value, subtitle, trend, trendValue, icon, color }: KPICardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  const trendColors = {
    up: 'text-emerald-600',
    down: 'text-red-600',
    neutral: 'text-gray-600',
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 font-medium mb-2">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          {trend && trendValue && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${trendColors[trend]}`}>
              {trend === 'up' && <TrendingUp className="w-4 h-4" />}
              {trend === 'down' && <TrendingDown className="w-4 h-4" />}
              <span className="font-medium">{trendValue}</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-lg ${colorClasses[color]} flex items-center justify-center`}>
          {icon}
        </div>
      </div>
    </Card>
  );
}

export function ProjectDashboardTab({ project, tasks, people }: ProjectDashboardTabProps) {
  const [refreshingInsights, setRefreshingInsights] = useState(false);

  // Mock data - in real app, this would come from props or API
  const allProjects = 12;
  const onTrackProjects = 7;
  const atRiskProjects = 3;
  const delayedProjects = 2;
  const totalOpenTasks = 47;
  const upcomingMilestonesCount = 5;

  const totalBudget = 2500000;
  const actualSpend = 1875000;
  const variance = totalBudget - actualSpend;
  const forecastToComplete = 2450000;

  const insights: InsightCard[] = [
    {
      id: '1',
      type: 'critical',
      title: '3 Projects Risk Missing End Date',
      description: 'Infrastructure Upgrade, Website Redesign, and Mobile App have schedule risks.',
      actionable: true,
    },
    {
      id: '2',
      type: 'warning',
      title: 'Resource Overload on Design Team',
      description: 'Design team is 125% allocated next week. Consider redistributing tasks.',
      actionable: true,
    },
    {
      id: '3',
      type: 'info',
      title: 'Budget Surplus on Project Alpha',
      description: 'Project Alpha is 15% under budget with 80% completion. Good cost control.',
      actionable: false,
    },
    {
      id: '4',
      type: 'warning',
      title: 'Milestones Slipping on Platform Modernization',
      description: '2 key milestones have been delayed by 5+ days. Review resource allocation.',
      actionable: true,
    },
    {
      id: '5',
      type: 'success',
      title: 'Strong Performance on Infrastructure',
      description: 'On schedule, under budget, with high team satisfaction scores.',
      actionable: false,
    },
  ];

  const upcomingMilestones: MilestoneItem[] = [
    {
      id: 'm1',
      name: 'Design Review',
      projectName: 'Website Redesign',
      dueDate: '2025-01-25',
      status: 'on-track',
      daysUntil: 4,
    },
    {
      id: 'm2',
      name: 'MVP Release',
      projectName: 'Mobile App',
      dueDate: '2025-01-28',
      status: 'at-risk',
      daysUntil: 7,
    },
    {
      id: 'm3',
      name: 'Phase 1 Complete',
      projectName: 'Infrastructure Upgrade',
      dueDate: '2025-02-01',
      status: 'on-track',
      daysUntil: 11,
    },
    {
      id: 'm4',
      name: 'Security Audit',
      projectName: 'Platform Modernization',
      dueDate: '2025-02-05',
      status: 'at-risk',
      daysUntil: 15,
    },
    {
      id: 'm5',
      name: 'Beta Testing',
      projectName: 'Customer Portal',
      dueDate: '2025-02-10',
      status: 'on-track',
      daysUntil: 20,
    },
  ];

  const resourceAllocations: ResourceAllocation[] = [
    {
      id: 'r1',
      name: 'Sarah Chen',
      role: 'Lead Designer',
      assignedProjects: ['Website Redesign', 'Mobile App', 'Customer Portal'],
      currentLoad: 125,
      availability: 'over',
    },
    {
      id: 'r2',
      name: 'John Martinez',
      role: 'Project Manager',
      assignedProjects: ['Infrastructure Upgrade', 'Platform Modernization'],
      currentLoad: 85,
      availability: 'optimal',
    },
    {
      id: 'r3',
      name: 'Mike Thompson',
      role: 'Senior Developer',
      assignedProjects: ['Mobile App', 'Platform Modernization'],
      currentLoad: 90,
      availability: 'optimal',
    },
    {
      id: 'r4',
      name: 'Emily Rodriguez',
      role: 'UX Researcher',
      assignedProjects: ['Website Redesign'],
      currentLoad: 45,
      availability: 'under',
    },
    {
      id: 'r5',
      name: 'David Kim',
      role: 'DevOps Engineer',
      assignedProjects: ['Infrastructure Upgrade', 'Platform Modernization', 'Mobile App'],
      currentLoad: 110,
      availability: 'over',
    },
  ];

  const projectsByStatus = [
    { status: 'On-track', count: onTrackProjects, color: 'bg-emerald-500' },
    { status: 'At-risk', count: atRiskProjects, color: 'bg-amber-500' },
    { status: 'Delayed', count: delayedProjects, color: 'bg-red-500' },
  ];

  const projectsByPhase = [
    { phase: 'Planning', count: 3, percentage: 25, color: 'text-blue-600' },
    { phase: 'Execution', count: 7, percentage: 58, color: 'text-purple-600' },
    { phase: 'Closing', count: 2, percentage: 17, color: 'text-gray-600' },
  ];

  const budgetByCategory = [
    { category: 'Labor', budget: 1500000, actual: 1200000 },
    { category: 'Materials', budget: 600000, actual: 450000 },
    { category: 'Other', budget: 400000, actual: 225000 },
  ];

  const topVarianceProjects = [
    { name: 'Infrastructure Upgrade', budget: 800000, actual: 850000, variance: -50000, percentVar: -6.25 },
    { name: 'Website Redesign', budget: 350000, actual: 280000, variance: 70000, percentVar: 20 },
    { name: 'Mobile App', budget: 500000, actual: 520000, variance: -20000, percentVar: -4 },
    { name: 'Platform Modernization', budget: 600000, actual: 480000, variance: 120000, percentVar: 20 },
    { name: 'Customer Portal', budget: 250000, actual: 245000, variance: 5000, percentVar: 2 },
  ];

  const projectTrackerData = [
    {
      id: 'p1',
      name: 'Infrastructure Upgrade',
      phase: 'Execution',
      progress: 65,
      nextMilestone: 'Phase 1 Complete',
      owner: 'John Martinez',
      status: 'on-track',
    },
    {
      id: 'p2',
      name: 'Website Redesign',
      phase: 'Execution',
      progress: 45,
      nextMilestone: 'Design Review',
      owner: 'Sarah Chen',
      status: 'on-track',
    },
    {
      id: 'p3',
      name: 'Mobile App',
      phase: 'Execution',
      progress: 72,
      nextMilestone: 'MVP Release',
      owner: 'Mike Thompson',
      status: 'at-risk',
    },
    {
      id: 'p4',
      name: 'Platform Modernization',
      phase: 'Execution',
      progress: 38,
      nextMilestone: 'Security Audit',
      owner: 'John Martinez',
      status: 'at-risk',
    },
    {
      id: 'p5',
      name: 'Customer Portal',
      phase: 'Planning',
      progress: 15,
      nextMilestone: 'Beta Testing',
      owner: 'Sarah Chen',
      status: 'on-track',
    },
  ];

  const getInsightIcon = (type: InsightCard['type']) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-amber-600" />;
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      default:
        return <Zap className="w-5 h-5 text-blue-600" />;
    }
  };

  const getInsightBgColor = (type: InsightCard['type']) => {
    switch (type) {
      case 'critical':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-amber-50 border-amber-200';
      case 'success':
        return 'bg-emerald-50 border-emerald-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getMilestoneStatusColor = (status: MilestoneItem['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-500';
      case 'on-track':
        return 'bg-blue-500';
      case 'at-risk':
        return 'bg-amber-500';
      case 'overdue':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getLoadColor = (load: number) => {
    if (load < 60) return 'text-gray-600 bg-gray-100';
    if (load <= 90) return 'text-emerald-600 bg-emerald-100';
    if (load <= 100) return 'text-amber-600 bg-amber-100';
    return 'text-red-600 bg-red-100';
  };

  const getLoadBarColor = (load: number) => {
    if (load < 60) return 'bg-gray-400';
    if (load <= 90) return 'bg-emerald-500';
    if (load <= 100) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const handleRefreshInsights = () => {
    setRefreshingInsights(true);
    setTimeout(() => setRefreshingInsights(false), 1500);
  };

  return (
    <div className="space-y-8">
      {/* Section 1: Overall Project Status */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Activity className="w-6 h-6 text-blue-600" />
            Portfolio Health Overview
          </h2>
          <div className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleString()}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-5 gap-4">
          <KPICard
            title="Active Projects"
            value={allProjects}
            subtitle="Total in portfolio"
            icon={<Briefcase className="w-6 h-6" />}
            color="blue"
          />
          <KPICard
            title="On-Track"
            value={onTrackProjects}
            subtitle={`${Math.round((onTrackProjects / allProjects) * 100)}% of portfolio`}
            trend="up"
            trendValue="+2 this week"
            icon={<CheckCircle2 className="w-6 h-6" />}
            color="green"
          />
          <KPICard
            title="At-Risk"
            value={atRiskProjects}
            subtitle="Need attention"
            trend="down"
            trendValue="Same as last week"
            icon={<AlertTriangle className="w-6 h-6" />}
            color="amber"
          />
          <KPICard
            title="Open Tasks"
            value={totalOpenTasks}
            subtitle="Across all projects"
            icon={<Target className="w-6 h-6" />}
            color="purple"
          />
          <KPICard
            title="Upcoming Milestones"
            value={upcomingMilestonesCount}
            subtitle="Next 30 days"
            icon={<Flag className="w-6 h-6" />}
            color="blue"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-3 gap-6">
          {/* Bar Chart - Projects by Status */}
          <Card className="p-6 col-span-1">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-gray-600" />
                Projects by Status
              </h3>
            </div>
            <div className="space-y-4">
              {projectsByStatus.map((item, index) => {
                const maxCount = Math.max(...projectsByStatus.map((p) => p.count));
                const width = (item.count / maxCount) * 100;
                return (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">{item.status}</span>
                      <span className="text-sm font-bold text-gray-900">{item.count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`${item.color} h-3 rounded-full transition-all`}
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Pie Chart - Projects by Phase */}
          <Card className="p-6 col-span-1">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-gray-600" />
                Projects by Phase
              </h3>
            </div>
            <div className="space-y-4">
              {/* Visual Donut */}
              <div className="flex items-center justify-center mb-4">
                <div className="relative w-40 h-40">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="80"
                      cy="80"
                      r="60"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="20"
                    />
                    <circle
                      cx="80"
                      cy="80"
                      r="60"
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="20"
                      strokeDasharray={`${(projectsByPhase[0].percentage / 100) * 377} 377`}
                      strokeDashoffset="0"
                    />
                    <circle
                      cx="80"
                      cy="80"
                      r="60"
                      fill="none"
                      stroke="#9333ea"
                      strokeWidth="20"
                      strokeDasharray={`${(projectsByPhase[1].percentage / 100) * 377} 377`}
                      strokeDashoffset={`-${(projectsByPhase[0].percentage / 100) * 377}`}
                    />
                    <circle
                      cx="80"
                      cy="80"
                      r="60"
                      fill="none"
                      stroke="#6b7280"
                      strokeWidth="20"
                      strokeDasharray={`${(projectsByPhase[2].percentage / 100) * 377} 377`}
                      strokeDashoffset={`-${((projectsByPhase[0].percentage + projectsByPhase[1].percentage) / 100) * 377}`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">{allProjects}</p>
                      <p className="text-xs text-gray-500">Total</p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Legend */}
              <div className="space-y-2">
                {projectsByPhase.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-blue-500' : index === 1 ? 'bg-purple-500' : 'bg-gray-500'}`} />
                      <span className="text-sm text-gray-700">{item.phase}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {item.count} ({item.percentage}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Timeline - Key Milestones */}
          <Card className="p-6 col-span-1">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-600" />
                Next 30 Days
              </h3>
            </div>
            <div className="space-y-3">
              {upcomingMilestones.slice(0, 4).map((milestone) => (
                <div key={milestone.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                  <div className={`w-2 h-2 rounded-full ${getMilestoneStatusColor(milestone.status)}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{milestone.name}</p>
                    <p className="text-xs text-gray-500">{milestone.projectName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-gray-900">{milestone.daysUntil}d</p>
                    <p className="text-xs text-gray-500">
                      {new Date(milestone.dueDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Section 2: Budget & Financials */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-emerald-600" />
            Budget & Financial Overview
          </h2>
        </div>

        {/* Budget KPIs */}
        <div className="grid grid-cols-4 gap-4">
          <KPICard
            title="Total Budget"
            value={`$${(totalBudget / 1000000).toFixed(1)}M`}
            subtitle="Approved portfolio budget"
            icon={<DollarSign className="w-6 h-6" />}
            color="blue"
          />
          <KPICard
            title="Actual Spend"
            value={`$${(actualSpend / 1000000).toFixed(1)}M`}
            subtitle={`${Math.round((actualSpend / totalBudget) * 100)}% of budget`}
            icon={<Activity className="w-6 h-6" />}
            color="purple"
          />
          <KPICard
            title="Variance"
            value={`$${Math.abs(variance / 1000).toFixed(0)}K`}
            subtitle={variance > 0 ? 'Under budget' : 'Over budget'}
            trend={variance > 0 ? 'up' : 'down'}
            trendValue={`${((variance / totalBudget) * 100).toFixed(1)}%`}
            icon={variance > 0 ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
            color={variance > 0 ? 'green' : 'red'}
          />
          <KPICard
            title="Forecast to Complete"
            value={`$${(forecastToComplete / 1000000).toFixed(1)}M`}
            subtitle="Projected final cost"
            icon={<Target className="w-6 h-6" />}
            color="amber"
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Budget vs Actual by Category */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-6">Budget vs Actual by Category</h3>
            <div className="space-y-6">
              {budgetByCategory.map((item, index) => {
                const percentUsed = (item.actual / item.budget) * 100;
                return (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">{item.category}</span>
                      <span className="text-sm text-gray-500">
                        ${(item.actual / 1000).toFixed(0)}K / ${(item.budget / 1000).toFixed(0)}K
                      </span>
                    </div>
                    <div className="relative">
                      <div className="w-full bg-gray-200 rounded-full h-6">
                        <div
                          className={`h-6 rounded-full ${
                            percentUsed > 100
                              ? 'bg-red-500'
                              : percentUsed > 90
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(percentUsed, 100)}%` }}
                        />
                      </div>
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-900">
                        {percentUsed.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Top 5 Projects by Variance */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Top Projects by Budget Variance</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-gray-600 uppercase">
                      Project
                    </th>
                    <th className="text-right py-3 px-2 text-xs font-semibold text-gray-600 uppercase">
                      Budget
                    </th>
                    <th className="text-right py-3 px-2 text-xs font-semibold text-gray-600 uppercase">
                      Actual
                    </th>
                    <th className="text-right py-3 px-2 text-xs font-semibold text-gray-600 uppercase">
                      Variance
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {topVarianceProjects.map((proj, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-2 text-sm text-gray-900">{proj.name}</td>
                      <td className="py-3 px-2 text-sm text-right text-gray-700">
                        ${(proj.budget / 1000).toFixed(0)}K
                      </td>
                      <td className="py-3 px-2 text-sm text-right text-gray-700">
                        ${(proj.actual / 1000).toFixed(0)}K
                      </td>
                      <td className="py-3 px-2 text-sm text-right">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded ${
                            proj.variance > 0
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {proj.variance > 0 ? '+' : ''}${(proj.variance / 1000).toFixed(0)}K
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>

      {/* Section 3: AI Insights */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-600" />
            AI-Powered Insights
          </h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshInsights}
              disabled={refreshingInsights}
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshingInsights ? 'animate-spin' : ''}`} />
              Refresh Insights
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              View All
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {insights.map((insight) => (
            <Card
              key={insight.id}
              className={`p-5 border-l-4 ${getInsightBgColor(insight.type)} hover:shadow-md transition-shadow`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{getInsightIcon(insight.type)}</div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">{insight.title}</h4>
                  <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
                  {insight.actionable && (
                    <Button variant="ghost" size="sm" className="gap-2 h-8 text-xs">
                      Take Action
                      <ArrowRight className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Section 4: Milestone & Project Tracker */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <Flag className="w-6 h-6 text-amber-600" />
          Milestones & Project Tracker
        </h2>

        {/* Milestone Timeline */}
        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Upcoming Milestones (Next 30 Days)</h3>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {upcomingMilestones.map((milestone) => (
              <div
                key={milestone.id}
                className="flex flex-col items-center min-w-[140px] p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <div className={`w-12 h-12 rounded-full ${getMilestoneStatusColor(milestone.status)} flex items-center justify-center mb-2`}>
                  <Flag className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-semibold text-gray-900 text-center mb-1">
                  {milestone.name}
                </p>
                <p className="text-xs text-gray-500 text-center mb-2">{milestone.projectName}</p>
                <Badge variant="outline" className="text-xs">
                  {milestone.daysUntil} days
                </Badge>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(milestone.dueDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>
            ))}
          </div>
        </Card>

        {/* Project Tracker Table */}
        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Project Tracker</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                    Project
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                    Phase
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                    % Complete
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                    Next Milestone
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                    Owner
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {projectTrackerData.map((proj) => (
                  <tr key={proj.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <p className="text-sm font-medium text-gray-900">{proj.name}</p>
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant="outline" className="text-xs">
                        {proj.phase}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 max-w-[100px]">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${proj.progress}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-sm font-medium text-gray-900 min-w-[40px]">
                          {proj.progress}%
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm text-gray-700">{proj.nextMilestone}</p>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-medium">
                          {proj.owner.charAt(0)}
                        </div>
                        <span className="text-sm text-gray-700">{proj.owner}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge
                        className={
                          proj.status === 'on-track'
                            ? 'bg-emerald-500'
                            : proj.status === 'at-risk'
                            ? 'bg-amber-500'
                            : 'bg-red-500'
                        }
                      >
                        {proj.status.replace('-', ' ')}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Section 5: Resource Management */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <Users className="w-6 h-6 text-blue-600" />
          Resource Management & Team Utilization
        </h2>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Team Allocation Overview</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Filter by Role
              </Button>
              <Button variant="outline" size="sm">
                Export Report
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                    Team Member
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                    Role
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                    Assigned Projects
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                    Current Load
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                    Availability
                  </th>
                </tr>
              </thead>
              <tbody>
                {resourceAllocations.map((resource) => (
                  <tr key={resource.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
                          {resource.name.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{resource.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-700">{resource.role}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-1">
                        {resource.assignedProjects.map((proj, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {proj}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 max-w-[120px]">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div
                                className={`h-2.5 rounded-full ${getLoadBarColor(resource.currentLoad)}`}
                                style={{ width: `${Math.min(resource.currentLoad, 100)}%` }}
                              />
                            </div>
                          </div>
                          <span
                            className={`text-sm font-semibold px-2 py-1 rounded ${getLoadColor(
                              resource.currentLoad
                            )}`}
                          >
                            {resource.currentLoad}%
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge
                        variant="outline"
                        className={
                          resource.availability === 'optimal'
                            ? 'border-emerald-500 text-emerald-700 bg-emerald-50'
                            : resource.availability === 'over'
                            ? 'border-red-500 text-red-700 bg-red-50'
                            : 'border-gray-500 text-gray-700 bg-gray-50'
                        }
                      >
                        {resource.availability === 'optimal'
                          ? 'Optimal'
                          : resource.availability === 'over'
                          ? 'Over-allocated'
                          : 'Under-allocated'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
