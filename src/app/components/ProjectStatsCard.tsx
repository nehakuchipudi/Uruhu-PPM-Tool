import { Project, Task } from '@/types';
import { Card } from '@/app/components/ui/card';
import { Progress } from '@/app/components/ui/progress';
import {
  TrendingUp,
  Clock,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Target,
} from 'lucide-react';

interface ProjectStatsCardProps {
  project: Project;
  tasks: Task[];
}

export function ProjectStatsCard({ project, tasks }: ProjectStatsCardProps) {
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
  const overdueTasks = tasks.filter(t => {
    const endDate = new Date(t.endDate);
    const today = new Date();
    return endDate < today && t.status !== 'completed';
  }).length;

  const totalEstimatedHours = tasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);
  const totalActualHours = tasks.reduce((sum, t) => sum + (t.actualHours || 0), 0);
  
  const criticalTasks = tasks.filter(t => t.priority === 'critical' && t.status !== 'completed').length;

  const getProjectHealth = () => {
    if (overdueTasks > 3 || criticalTasks > 2) return { label: 'At Risk', color: 'text-red-600', bgColor: 'bg-red-50' };
    if (overdueTasks > 0 || criticalTasks > 0) return { label: 'Needs Attention', color: 'text-amber-600', bgColor: 'bg-amber-50' };
    if (project.progress > 75) return { label: 'Excellent', color: 'text-emerald-600', bgColor: 'bg-emerald-50' };
    return { label: 'On Track', color: 'text-blue-600', bgColor: 'bg-blue-50' };
  };

  const health = getProjectHealth();
  const scheduleVariance = totalActualHours > 0 
    ? ((totalActualHours - totalEstimatedHours) / totalEstimatedHours * 100).toFixed(1)
    : '0';

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-gray-900">Project Analytics</h3>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${health.bgColor} ${health.color}`}>
          {health.label}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="text-sm text-gray-600">Task Completion</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {completedTasks}/{tasks.length}
          </p>
          <div className="mt-2">
            <Progress value={(completedTasks / tasks.length) * 100} className="h-1.5" />
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-gray-600">Hours Tracked</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {totalActualHours}h
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {totalEstimatedHours}h estimated
          </p>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-purple-600" />
            <span className="text-sm text-gray-600">Schedule Variance</span>
          </div>
          <p className={`text-2xl font-bold ${Number(scheduleVariance) > 10 ? 'text-red-600' : Number(scheduleVariance) < -10 ? 'text-emerald-600' : 'text-gray-900'}`}>
            {scheduleVariance}%
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {Number(scheduleVariance) > 0 ? 'Over estimate' : 'Under estimate'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 pt-4 border-t border-gray-200">
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">In Progress</p>
          <p className="text-lg font-semibold text-blue-600">{inProgressTasks}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">Overdue</p>
          <p className="text-lg font-semibold text-red-600">{overdueTasks}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">Critical Priority</p>
          <p className="text-lg font-semibold text-orange-600">{criticalTasks}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">Budget</p>
          <p className="text-lg font-semibold text-gray-900">
            {project.budget ? `$${(project.budget / 1000).toFixed(0)}k` : 'N/A'}
          </p>
        </div>
      </div>

      {(overdueTasks > 0 || criticalTasks > 0) && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-amber-900">Action Required</p>
              <p className="text-amber-700 mt-1">
                {overdueTasks > 0 && `${overdueTasks} overdue task${overdueTasks > 1 ? 's' : ''}`}
                {overdueTasks > 0 && criticalTasks > 0 && ' • '}
                {criticalTasks > 0 && `${criticalTasks} critical task${criticalTasks > 1 ? 's' : ''} pending`}
              </p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
