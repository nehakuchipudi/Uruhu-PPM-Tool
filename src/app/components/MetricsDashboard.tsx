import { useMemo } from 'react';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  Users,
  Target,
  Calendar,
  Activity,
} from 'lucide-react';
import { Instance, Project, WorkOrder, Task, Person } from '@/types';
import { format, parseISO, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';

interface MetricsDashboardProps {
  instances: Instance[];
  projects: Project[];
  workOrders: WorkOrder[];
  tasks: Task[];
  people: Person[];
  selectedInstanceId?: string;
}

export function MetricsDashboard({
  instances,
  projects,
  workOrders,
  tasks,
  people,
  selectedInstanceId,
}: MetricsDashboardProps) {
  // Filter data by instance
  const filteredProjects = useMemo(() => 
    selectedInstanceId ? projects.filter(p => p.instanceId === selectedInstanceId) : projects,
    [projects, selectedInstanceId]
  );

  const filteredWorkOrders = useMemo(() => 
    selectedInstanceId ? workOrders.filter(w => w.instanceId === selectedInstanceId) : workOrders,
    [workOrders, selectedInstanceId]
  );

  const filteredTasks = useMemo(() => 
    filteredProjects.length > 0 
      ? tasks.filter(t => filteredProjects.some(p => p.id === t.projectId))
      : tasks,
    [tasks, filteredProjects]
  );

  const filteredPeople = useMemo(() => 
    selectedInstanceId ? people.filter(p => p.instanceId === selectedInstanceId) : people,
    [people, selectedInstanceId]
  );

  // Calculate KPIs
  const kpis = useMemo(() => {
    const totalBudget = filteredProjects.reduce((sum, p) => sum + (p.budget || 0), 0);
    const activeProjects = filteredProjects.filter(p => p.status === 'active').length;
    const completedProjects = filteredProjects.filter(p => p.status === 'completed').length;
    const avgProjectProgress = filteredProjects.length > 0
      ? filteredProjects.reduce((sum, p) => sum + p.progress, 0) / filteredProjects.length
      : 0;

    const completedWorkOrders = filteredWorkOrders.filter(w => w.status === 'completed').length;
    const totalWorkOrders = filteredWorkOrders.length;
    const workOrderCompletionRate = totalWorkOrders > 0 ? (completedWorkOrders / totalWorkOrders) * 100 : 0;

    const completedTasks = filteredTasks.filter(t => t.status === 'completed').length;
    const totalTasks = filteredTasks.length;
    const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    const totalEstimatedHours = filteredTasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);
    const totalActualHours = filteredTasks.reduce((sum, t) => sum + (t.actualHours || 0), 0);
    const hoursVariance = totalEstimatedHours > 0 
      ? ((totalActualHours - totalEstimatedHours) / totalEstimatedHours) * 100
      : 0;

    return {
      totalBudget,
      activeProjects,
      completedProjects,
      avgProjectProgress,
      workOrderCompletionRate,
      taskCompletionRate,
      totalEstimatedHours,
      totalActualHours,
      hoursVariance,
      totalPeople: filteredPeople.length,
    };
  }, [filteredProjects, filteredWorkOrders, filteredTasks, filteredPeople]);

  // Project status distribution
  const projectStatusData = useMemo(() => {
    const statusCounts = filteredProjects.reduce((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' '),
      value: count,
    }));
  }, [filteredProjects]);

  const statusColors = ['#10b981', '#3b82f6', '#f59e0b', '#6b7280'];

  // Work orders by month
  const workOrdersByMonth = useMemo(() => {
    const last6Months = eachMonthOfInterval({
      start: subMonths(new Date(), 5),
      end: new Date(),
    });

    return last6Months.map(month => {
      const monthOrders = filteredWorkOrders.filter(wo => {
        const woDate = parseISO(wo.scheduledDate);
        return woDate >= startOfMonth(month) && woDate <= endOfMonth(month);
      });

      return {
        month: format(month, 'MMM'),
        total: monthOrders.length,
        completed: monthOrders.filter(wo => wo.status === 'completed').length,
        scheduled: monthOrders.filter(wo => wo.status === 'scheduled').length,
        inProgress: monthOrders.filter(wo => wo.status === 'in-progress').length,
      };
    });
  }, [filteredWorkOrders]);

  // Priority distribution
  const priorityData = useMemo(() => {
    const priorityCounts = filteredProjects.reduce((acc, p) => {
      acc[p.priority] = (acc[p.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return [
      { name: 'Critical', value: priorityCounts.critical || 0, color: '#dc2626' },
      { name: 'High', value: priorityCounts.high || 0, color: '#f97316' },
      { name: 'Medium', value: priorityCounts.medium || 0, color: '#eab308' },
      { name: 'Low', value: priorityCounts.low || 0, color: '#22c55e' },
    ];
  }, [filteredProjects]);

  // Task completion trend
  const taskCompletionTrend = useMemo(() => {
    const last6Months = eachMonthOfInterval({
      start: subMonths(new Date(), 5),
      end: new Date(),
    });

    return last6Months.map(month => {
      const monthTasks = filteredTasks.filter(task => {
        const taskDate = parseISO(task.startDate);
        return taskDate >= startOfMonth(month) && taskDate <= endOfMonth(month);
      });

      const completed = monthTasks.filter(t => t.status === 'completed').length;
      const total = monthTasks.length;

      return {
        month: format(month, 'MMM'),
        completionRate: total > 0 ? (completed / total) * 100 : 0,
        completed,
        total,
      };
    });
  }, [filteredTasks]);

  // Instance performance (if no instance selected)
  const instancePerformance = useMemo(() => {
    if (selectedInstanceId) return [];

    return instances.map(instance => {
      const instanceProjects = projects.filter(p => p.instanceId === instance.id);
      const instanceWorkOrders = workOrders.filter(w => w.instanceId === instance.id);
      const avgProgress = instanceProjects.length > 0
        ? instanceProjects.reduce((sum, p) => sum + p.progress, 0) / instanceProjects.length
        : 0;

      return {
        name: instance.name,
        projects: instanceProjects.length,
        workOrders: instanceWorkOrders.length,
        avgProgress: Math.round(avgProgress),
        color: instance.primaryColor,
      };
    });
  }, [instances, projects, workOrders, selectedInstanceId]);

  const MetricCard = ({ 
    title, 
    value, 
    subtitle, 
    icon: Icon, 
    trend, 
    trendValue,
    color = 'blue' 
  }: { 
    title: string; 
    value: string | number; 
    subtitle?: string; 
    icon: any; 
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
    color?: string;
  }) => {
    const colorClasses = {
      blue: 'bg-blue-50 text-blue-600',
      green: 'bg-green-50 text-green-600',
      orange: 'bg-orange-50 text-orange-600',
      purple: 'bg-purple-50 text-purple-600',
      red: 'bg-red-50 text-red-600',
    };

    return (
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
            {trend && trendValue && (
              <div className="flex items-center gap-1 mt-2">
                {trend === 'up' && <TrendingUp className="w-4 h-4 text-green-600" />}
                {trend === 'down' && <TrendingDown className="w-4 h-4 text-red-600" />}
                <span className={`text-sm font-medium ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
                  {trendValue}
                </span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color as keyof typeof colorClasses] || colorClasses.blue}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Budget"
          value={`$${(kpis.totalBudget / 1000).toFixed(0)}K`}
          subtitle={`${filteredProjects.length} projects`}
          icon={DollarSign}
          color="green"
        />
        <MetricCard
          title="Active Projects"
          value={kpis.activeProjects}
          subtitle={`${kpis.avgProjectProgress.toFixed(0)}% avg progress`}
          icon={Target}
          color="blue"
        />
        <MetricCard
          title="Work Order Completion"
          value={`${kpis.workOrderCompletionRate.toFixed(0)}%`}
          subtitle={`${filteredWorkOrders.length} total orders`}
          icon={CheckCircle2}
          color="green"
          trend={kpis.workOrderCompletionRate > 75 ? 'up' : 'down'}
          trendValue={`${kpis.workOrderCompletionRate.toFixed(0)}% rate`}
        />
        <MetricCard
          title="Team Members"
          value={kpis.totalPeople}
          subtitle={`${kpis.taskCompletionRate.toFixed(0)}% task completion`}
          icon={Users}
          color="purple"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Estimated Hours"
          value={kpis.totalEstimatedHours}
          subtitle={`${kpis.totalActualHours} actual hours`}
          icon={Clock}
          color="orange"
          trend={kpis.hoursVariance < 0 ? 'up' : kpis.hoursVariance > 10 ? 'down' : 'neutral'}
          trendValue={`${kpis.hoursVariance > 0 ? '+' : ''}${kpis.hoursVariance.toFixed(0)}% variance`}
        />
        <MetricCard
          title="Task Completion Rate"
          value={`${kpis.taskCompletionRate.toFixed(0)}%`}
          subtitle={`${filteredTasks.filter(t => t.status === 'completed').length}/${filteredTasks.length} completed`}
          icon={Activity}
          color="blue"
        />
        <MetricCard
          title="Completed Projects"
          value={kpis.completedProjects}
          subtitle={`${filteredProjects.length} total projects`}
          icon={CheckCircle2}
          color="green"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Work Orders Trend */}
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Work Orders Trend (6 Months)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={workOrdersByMonth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="completed" stackId="1" stroke="#10b981" fill="#10b981" name="Completed" />
              <Area type="monotone" dataKey="inProgress" stackId="1" stroke="#f59e0b" fill="#f59e0b" name="In Progress" />
              <Area type="monotone" dataKey="scheduled" stackId="1" stroke="#3b82f6" fill="#3b82f6" name="Scheduled" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Project Status Distribution */}
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Project Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={projectStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {projectStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={statusColors[index % statusColors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Distribution */}
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Project Priority Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={priorityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" name="Projects">
                {priorityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Task Completion Trend */}
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Task Completion Rate Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={taskCompletionTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value: any, name: string) => {
                  if (name === 'completionRate') return `${value.toFixed(0)}%`;
                  return value;
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="completionRate" stroke="#10b981" strokeWidth={2} name="Completion Rate %" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Instance Performance - only show when no instance is selected */}
      {!selectedInstanceId && instancePerformance.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Instance Performance Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={instancePerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="projects" fill="#3b82f6" name="Projects" />
              <Bar yAxisId="left" dataKey="workOrders" fill="#10b981" name="Work Orders" />
              <Bar yAxisId="right" dataKey="avgProgress" fill="#f59e0b" name="Avg Progress %" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-5 h-5 text-blue-600" />
            <h4 className="font-semibold text-blue-900">Projects Overview</h4>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-blue-700">Active:</span>
              <span className="font-semibold text-blue-900">{kpis.activeProjects}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-blue-700">Completed:</span>
              <span className="font-semibold text-blue-900">{kpis.completedProjects}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-blue-700">Avg Progress:</span>
              <span className="font-semibold text-blue-900">{kpis.avgProjectProgress.toFixed(0)}%</span>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <h4 className="font-semibold text-green-900">Work Orders</h4>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-green-700">Total:</span>
              <span className="font-semibold text-green-900">{filteredWorkOrders.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-green-700">Completed:</span>
              <span className="font-semibold text-green-900">
                {filteredWorkOrders.filter(w => w.status === 'completed').length}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-green-700">Success Rate:</span>
              <span className="font-semibold text-green-900">{kpis.workOrderCompletionRate.toFixed(0)}%</span>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-5 h-5 text-purple-600" />
            <h4 className="font-semibold text-purple-900">Tasks Performance</h4>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-purple-700">Total Tasks:</span>
              <span className="font-semibold text-purple-900">{filteredTasks.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-purple-700">Completed:</span>
              <span className="font-semibold text-purple-900">
                {filteredTasks.filter(t => t.status === 'completed').length}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-purple-700">Completion Rate:</span>
              <span className="font-semibold text-purple-900">{kpis.taskCompletionRate.toFixed(0)}%</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
