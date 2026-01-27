import React, { useState } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Progress } from '@/app/components/ui/progress';
import { Task, Person } from '@/types';
import {
  Flag,
  Calendar,
  Users,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Clock,
  Edit,
  Trash2,
  Plus,
  Eye,
  Target,
  TrendingUp,
  MoreHorizontal,
  Link,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

interface Milestone {
  id: string;
  name: string;
  description: string;
  targetDate: string;
  ownerId: string;
  status: 'upcoming' | 'in-progress' | 'completed' | 'at-risk';
  priority: 'low' | 'medium' | 'high' | 'critical';
  linkedTasks: string[];
  deliverables: string[];
  completionCriteria: string;
}

interface MilestoneTrackerProps {
  milestones: Milestone[];
  tasks: Task[];
  people: Person[];
  onAddMilestone: () => void;
  onEditMilestone: (milestone: Milestone) => void;
  onDeleteMilestone: (milestoneId: string) => void;
  onViewDetails: (milestone: Milestone) => void;
}

export function MilestoneTracker({
  milestones,
  tasks,
  people,
  onAddMilestone,
  onEditMilestone,
  onDeleteMilestone,
  onViewDetails,
}: MilestoneTrackerProps) {
  const [viewMode, setViewMode] = useState<'timeline' | 'list' | 'calendar'>('timeline');
  const [expandedMilestone, setExpandedMilestone] = useState<string | null>(null);

  const getStatusColor = (status: Milestone['status']) => {
    switch (status) {
      case 'completed':
        return {
          bg: 'bg-emerald-500',
          border: 'border-emerald-500',
          text: 'text-emerald-700',
          icon: CheckCircle2,
        };
      case 'in-progress':
        return {
          bg: 'bg-blue-500',
          border: 'border-blue-500',
          text: 'text-blue-700',
          icon: Clock,
        };
      case 'at-risk':
        return {
          bg: 'bg-red-500',
          border: 'border-red-500',
          text: 'text-red-700',
          icon: AlertTriangle,
        };
      default:
        return {
          bg: 'bg-gray-400',
          border: 'border-gray-400',
          text: 'text-gray-700',
          icon: Circle,
        };
    }
  };

  const getPriorityColor = (priority: Milestone['priority']) => {
    switch (priority) {
      case 'critical':
        return 'border-red-500 text-red-700 bg-red-50';
      case 'high':
        return 'border-orange-500 text-orange-700 bg-orange-50';
      case 'medium':
        return 'border-blue-500 text-blue-700 bg-blue-50';
      default:
        return 'border-gray-500 text-gray-700 bg-gray-50';
    }
  };

  const calculateMilestoneProgress = (milestone: Milestone) => {
    if (milestone.linkedTasks.length === 0) return 0;
    const linkedTasksData = tasks.filter((t) => milestone.linkedTasks.includes(t.id));
    const totalProgress = linkedTasksData.reduce((sum, task) => sum + task.progress, 0);
    return Math.round(totalProgress / linkedTasksData.length);
  };

  const getDaysUntil = (targetDate: string) => {
    const today = new Date();
    const target = new Date(targetDate);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const completedMilestones = milestones.filter((m) => m.status === 'completed').length;
  const overallProgress =
    milestones.length > 0 ? (completedMilestones / milestones.length) * 100 : 0;

  // Sort milestones by date
  const sortedMilestones = [...milestones].sort(
    (a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime()
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Milestone Tracker</h3>
          <p className="text-sm text-gray-600">
            {completedMilestones} of {milestones.length} milestones completed
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'timeline' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('timeline')}
          >
            Timeline
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            List
          </Button>
          <Button onClick={onAddMilestone} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Milestone
          </Button>
        </div>
      </div>

      {/* Overall Progress */}
      <Card className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Flag className="w-5 h-5 text-amber-600" />
            <h3 className="font-semibold text-gray-900">Overall Milestone Progress</h3>
          </div>
          <span className="text-sm font-medium text-gray-900">
            {Math.round(overallProgress)}%
          </span>
        </div>
        <Progress value={overallProgress} className="h-3 mb-4" />
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-3 border border-amber-200">
            <p className="text-xs text-gray-600 mb-1">Total</p>
            <p className="text-2xl font-bold text-gray-900">{milestones.length}</p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-emerald-200">
            <p className="text-xs text-gray-600 mb-1">Completed</p>
            <p className="text-2xl font-bold text-emerald-600">{completedMilestones}</p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-blue-200">
            <p className="text-xs text-gray-600 mb-1">In Progress</p>
            <p className="text-2xl font-bold text-blue-600">
              {milestones.filter((m) => m.status === 'in-progress').length}
            </p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-red-200">
            <p className="text-xs text-gray-600 mb-1">At Risk</p>
            <p className="text-2xl font-bold text-red-600">
              {milestones.filter((m) => m.status === 'at-risk').length}
            </p>
          </div>
        </div>
      </Card>

      {/* Timeline View */}
      {viewMode === 'timeline' && (
        <Card className="p-6">
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />

            {/* Milestone Items */}
            <div className="space-y-8">
              {sortedMilestones.map((milestone, index) => {
                const status = getStatusColor(milestone.status);
                const StatusIcon = status.icon;
                const owner = people.find((p) => p.id === milestone.ownerId);
                const daysUntil = getDaysUntil(milestone.targetDate);
                const progress = calculateMilestoneProgress(milestone);
                const isExpanded = expandedMilestone === milestone.id;

                return (
                  <div key={milestone.id} className="relative pl-16">
                    {/* Timeline Dot */}
                    <div
                      className={`absolute left-0 w-12 h-12 rounded-full ${status.bg} flex items-center justify-center`}
                    >
                      <StatusIcon className="w-6 h-6 text-white" />
                    </div>

                    {/* Milestone Card */}
                    <Card
                      className={`border-l-4 ${status.border} hover:shadow-lg transition-shadow`}
                    >
                      <div className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="text-lg font-semibold text-gray-900">
                                {milestone.name}
                              </h4>
                              <Badge className={status.bg}>
                                {milestone.status.replace('-', ' ')}
                              </Badge>
                              <Badge variant="outline" className={getPriorityColor(milestone.priority)}>
                                {milestone.priority}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">{milestone.description}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onViewDetails(milestone)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEditMilestone(milestone)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDeleteMilestone(milestone.id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setExpandedMilestone(isExpanded ? null : milestone.id)
                              }
                            >
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-4 gap-4 mb-3">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-xs text-gray-500">Target Date</p>
                              <p className="font-medium text-gray-900">
                                {new Date(milestone.targetDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-xs text-gray-500">Days Until</p>
                              <p
                                className={`font-medium ${
                                  daysUntil < 0
                                    ? 'text-red-600'
                                    : daysUntil < 7
                                    ? 'text-amber-600'
                                    : 'text-gray-900'
                                }`}
                              >
                                {daysUntil < 0 ? `${Math.abs(daysUntil)} overdue` : daysUntil}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-sm">
                            <Users className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-xs text-gray-500">Owner</p>
                              <p className="font-medium text-gray-900">{owner?.name}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-sm">
                            <Link className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-xs text-gray-500">Linked Tasks</p>
                              <p className="font-medium text-gray-900">
                                {milestone.linkedTasks.length}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-600">Progress</span>
                            <span className="text-xs font-medium text-gray-900">{progress}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>

                        {/* Expanded Details */}
                        {isExpanded && (
                          <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                            {/* Deliverables */}
                            {milestone.deliverables.length > 0 && (
                              <div>
                                <h5 className="text-sm font-semibold text-gray-900 mb-2">
                                  Key Deliverables
                                </h5>
                                <div className="space-y-2">
                                  {milestone.deliverables.map((deliverable, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-center gap-2 text-sm p-2 bg-amber-50 rounded border border-amber-200"
                                    >
                                      <Target className="w-4 h-4 text-amber-600" />
                                      <span className="text-gray-900">{deliverable}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Completion Criteria */}
                            {milestone.completionCriteria && (
                              <div>
                                <h5 className="text-sm font-semibold text-gray-900 mb-2">
                                  Completion Criteria
                                </h5>
                                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded border border-gray-200">
                                  {milestone.completionCriteria}
                                </p>
                              </div>
                            )}

                            {/* Linked Tasks */}
                            {milestone.linkedTasks.length > 0 && (
                              <div>
                                <h5 className="text-sm font-semibold text-gray-900 mb-2">
                                  Linked Tasks ({milestone.linkedTasks.length})
                                </h5>
                                <div className="space-y-2">
                                  {milestone.linkedTasks.slice(0, 3).map((taskId) => {
                                    const task = tasks.find((t) => t.id === taskId);
                                    if (!task) return null;
                                    return (
                                      <div
                                        key={taskId}
                                        className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200"
                                      >
                                        <span className="text-sm text-gray-900">{task.name}</span>
                                        <div className="flex items-center gap-2">
                                          <Progress value={task.progress} className="h-1 w-16" />
                                          <span className="text-xs text-gray-600">
                                            {task.progress}%
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  })}
                                  {milestone.linkedTasks.length > 3 && (
                                    <p className="text-xs text-gray-500">
                                      +{milestone.linkedTasks.length - 3} more tasks
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="text-left p-4 text-xs font-semibold text-gray-600 uppercase">
                    Milestone
                  </th>
                  <th className="text-left p-4 text-xs font-semibold text-gray-600 uppercase">
                    Target Date
                  </th>
                  <th className="text-left p-4 text-xs font-semibold text-gray-600 uppercase">
                    Owner
                  </th>
                  <th className="text-left p-4 text-xs font-semibold text-gray-600 uppercase">
                    Status
                  </th>
                  <th className="text-left p-4 text-xs font-semibold text-gray-600 uppercase">
                    Priority
                  </th>
                  <th className="text-left p-4 text-xs font-semibold text-gray-600 uppercase">
                    Progress
                  </th>
                  <th className="text-left p-4 text-xs font-semibold text-gray-600 uppercase">
                    Tasks
                  </th>
                  <th className="text-left p-4 text-xs font-semibold text-gray-600 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedMilestones.map((milestone) => {
                  const status = getStatusColor(milestone.status);
                  const owner = people.find((p) => p.id === milestone.ownerId);
                  const progress = calculateMilestoneProgress(milestone);
                  const daysUntil = getDaysUntil(milestone.targetDate);

                  return (
                    <tr
                      key={milestone.id}
                      className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                      onClick={() => onViewDetails(milestone)}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Flag className="w-4 h-4 text-amber-500" />
                          <div>
                            <p className="font-medium text-gray-900">{milestone.name}</p>
                            <p className="text-xs text-gray-500">
                              {milestone.deliverables.length} deliverables
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="text-sm text-gray-900">
                            {new Date(milestone.targetDate).toLocaleDateString()}
                          </p>
                          <p
                            className={`text-xs ${
                              daysUntil < 0
                                ? 'text-red-600'
                                : daysUntil < 7
                                ? 'text-amber-600'
                                : 'text-gray-500'
                            }`}
                          >
                            {daysUntil < 0
                              ? `${Math.abs(daysUntil)} days overdue`
                              : `${daysUntil} days left`}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium text-blue-600">
                            {owner?.name.charAt(0)}
                          </div>
                          <span className="text-sm text-gray-900">{owner?.name}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge className={status.bg}>
                          {milestone.status.replace('-', ' ')}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className={getPriorityColor(milestone.priority)}>
                          {milestone.priority}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Progress value={progress} className="h-2 w-20" />
                          <span className="text-sm font-medium text-gray-900">{progress}%</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-gray-900">
                          {milestone.linkedTasks.length}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditMilestone(milestone);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteMilestone(milestone.id);
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {milestones.length === 0 && (
        <Card className="p-12 text-center">
          <Flag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Milestones Yet</h3>
          <p className="text-gray-600 mb-4">
            Create your first milestone to track key project achievements
          </p>
          <Button onClick={onAddMilestone} className="gap-2">
            <Plus className="w-4 h-4" />
            Add First Milestone
          </Button>
        </Card>
      )}
    </div>
  );
}
