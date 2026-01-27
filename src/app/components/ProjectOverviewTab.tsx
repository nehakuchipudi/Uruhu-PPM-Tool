import React from 'react';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Progress } from '@/app/components/ui/progress';
import { Project, Task, Person } from '@/types';
import {
  Calendar,
  Users,
  DollarSign,
  Target,
  AlertCircle,
  TrendingUp,
  Flag,
  Sparkles,
  CheckCircle2,
  Clock,
  Building2,
} from 'lucide-react';
import { AIInsightsContainer, AIInsight } from '@/app/components/AIInsightCard';

interface ProjectOverviewTabProps {
  project: Project;
  tasks: Task[];
  people: Person[];
}

export function ProjectOverviewTab({ project, tasks, people }: ProjectOverviewTabProps) {
  const owner = people.find((p) => project.assignedTo[0] === p.id);
  const teamMembers = people.filter((p) => project.assignedTo.includes(p.id));

  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'in-progress').length;
  const todoTasks = tasks.filter((t) => t.status === 'todo').length;

  const totalEstimatedHours = tasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);
  const totalActualHours = tasks.reduce((sum, t) => sum + (t.actualHours || 0), 0);

  // Generate AI Insights for the project
  const generateProjectInsights = (): AIInsight[] => {
    const insights: AIInsight[] = [];

    // Project health insight
    if (project.progress < 30 && project.status === 'active') {
      insights.push({
        id: `insight-${project.id}-health`,
        type: 'warning',
        priority: 'high',
        title: 'Project Progress Below Target',
        description: `Project is ${project.progress}% complete but may be at risk. Consider reviewing task assignments and removing blockers.`,
        metrics: [
          { label: 'Current Progress', value: `${project.progress}%` },
          { label: 'Tasks Complete', value: `${completedTasks}/${tasks.length}` },
        ],
        dismissible: true,
      });
    } else if (project.progress >= 70) {
      insights.push({
        id: `insight-${project.id}-success`,
        type: 'success',
        priority: 'low',
        title: 'Project on Track for Success',
        description: `Excellent progress at ${project.progress}%. Keep up the momentum to deliver on time.`,
        metrics: [
          { label: 'Progress', value: `${project.progress}%` },
          { label: 'Completed Tasks', value: `${completedTasks}` },
        ],
        dismissible: true,
      });
    }

    // Resource utilization insight
    if (totalActualHours > totalEstimatedHours * 1.1) {
      insights.push({
        id: `insight-${project.id}-hours`,
        type: 'warning',
        priority: 'medium',
        title: 'Hours Over Estimate',
        description: 'Actual hours are exceeding estimates. Review task complexity and resource allocation.',
        details: 'Consider redistributing workload or adjusting project timeline to prevent burnout.',
        metrics: [
          { label: 'Estimated Hours', value: `${totalEstimatedHours}h` },
          { label: 'Actual Hours', value: `${totalActualHours}h`, change: `+${((totalActualHours - totalEstimatedHours) / totalEstimatedHours * 100).toFixed(0)}%` },
        ],
        dismissible: true,
      });
    }

    // Task velocity insight
    const taskCompletionRate = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;
    if (taskCompletionRate > 60 && inProgressTasks < 3) {
      insights.push({
        id: `insight-${project.id}-velocity`,
        type: 'recommendation',
        priority: 'medium',
        title: 'Strong Task Completion Velocity',
        description: 'Team is completing tasks efficiently. Consider starting additional work items to maintain momentum.',
        metrics: [
          { label: 'Completion Rate', value: `${taskCompletionRate.toFixed(0)}%` },
          { label: 'In Progress', value: `${inProgressTasks}` },
        ],
        dismissible: true,
      });
    }

    // Team collaboration insight
    if (teamMembers.length < 2 && tasks.length > 10) {
      insights.push({
        id: `insight-${project.id}-team`,
        type: 'info',
        priority: 'low',
        title: 'Consider Team Expansion',
        description: `Project has ${tasks.length} tasks with limited team members. Consider adding resources for faster delivery.`,
        dismissible: true,
      });
    }

    // End date approaching
    const daysToEnd = Math.ceil((new Date(project.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysToEnd < 7 && daysToEnd > 0 && project.progress < 90) {
      insights.push({
        id: `insight-${project.id}-deadline`,
        type: 'warning',
        priority: 'critical',
        title: 'Project Deadline Approaching',
        description: `Only ${daysToEnd} days remaining with ${100 - project.progress}% of work incomplete. Immediate action required.`,
        details: 'Focus on critical path tasks and consider requesting timeline extension if needed.',
        metrics: [
          { label: 'Days Left', value: `${daysToEnd}` },
          { label: 'Remaining Work', value: `${100 - project.progress}%` },
        ],
        dismissible: false,
      });
    }

    return insights;
  };

  const projectInsights = generateProjectInsights();

  const getPriorityColor = (priority: Project['priority']) => {
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

  const getHealthStatus = () => {
    if (project.progress < 30 && project.status === 'active') {
      return { color: 'text-red-500', bg: 'bg-red-100', label: 'At Risk', icon: AlertCircle };
    }
    if (project.progress >= 70) {
      return {
        color: 'text-green-500',
        bg: 'bg-green-100',
        label: 'On Track',
        icon: CheckCircle2,
      };
    }
    return { color: 'text-yellow-500', bg: 'bg-yellow-100', label: 'Watch', icon: Clock };
  };

  const health = getHealthStatus();
  const HealthIcon = health.icon;

  return (
    <div className="space-y-6">
      {/* AI Insights Section */}
      {projectInsights.length > 0 && (
        <AIInsightsContainer
          insights={projectInsights}
          title="Project AI Insights"
          maxVisible={3}
        />
      )}

      <div className="grid grid-cols-3 gap-6">
        {/* Left Column - Project Summary */}
        <div className="col-span-2 space-y-6">
          {/* Key Information */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Project Information</h3>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Project ID</p>
                <p className="text-sm text-gray-900">{project.id}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Client/Customer</p>
                <p className="text-sm text-gray-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-gray-400" />
                  {project.customerName}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Start Date</p>
                <p className="text-sm text-gray-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  {new Date(project.startDate).toLocaleDateString()}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Target End Date</p>
                <p className="text-sm text-gray-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  {new Date(project.endDate).toLocaleDateString()}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Project Owner</p>
                <p className="text-sm text-gray-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  {owner?.name || 'Unassigned'}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Priority Level</p>
                <Badge variant="outline" className={getPriorityColor(project.priority)}>
                  <Flag className="w-3 h-3 mr-1" />
                  {project.priority}
                </Badge>
              </div>

              {project.budget && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Budget</p>
                  <p className="text-sm text-gray-900 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    ${project.budget.toLocaleString()}
                  </p>
                </div>
              )}

              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Health Status</p>
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg ${health.bg} flex items-center justify-center`}>
                    <HealthIcon className={`w-4 h-4 ${health.color}`} />
                  </div>
                  <span className={`text-sm font-medium ${health.color}`}>{health.label}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Project Description & Scope */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Project Description</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-6">{project.description}</p>

            <h4 className="font-semibold text-gray-900 mb-3">Scope of Work</h4>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-sm text-gray-600">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                <span>Complete all planned tasks and deliverables within timeline</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-600">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                <span>Maintain quality standards and client satisfaction</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-600">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                <span>Stay within approved budget and resource allocation</span>
              </li>
            </ul>
          </Card>

          {/* Progress Overview */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Progress Overview</h3>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Overall Completion</span>
                <span className="text-2xl font-bold text-gray-900">{project.progress}%</span>
              </div>
              <Progress value={project.progress} className="h-3" />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                <p className="text-sm text-gray-600 mb-1">Completed</p>
                <p className="text-2xl font-bold text-emerald-600">{completedTasks}</p>
                <p className="text-xs text-gray-500 mt-1">Tasks done</p>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p className="text-sm text-gray-600 mb-1">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">{inProgressTasks}</p>
                <p className="text-xs text-gray-500 mt-1">Active now</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-sm text-gray-600 mb-1">To Do</p>
                <p className="text-2xl font-bold text-gray-600">{todoTasks}</p>
                <p className="text-xs text-gray-500 mt-1">Upcoming</p>
              </div>
            </div>
          </Card>

          {/* Team Members */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Team Members</h3>
            <div className="space-y-3">
              {teamMembers.map((member) => (
                <div key={member.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{member.name}</p>
                    <p className="text-sm text-gray-500">{member.role}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {member.email}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>

          {/* Goals & Objectives */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Goals & Objectives</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <Target className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900 mb-1">Deliver High-Quality Results</p>
                  <p className="text-sm text-gray-600">
                    Meet or exceed client expectations with quality deliverables
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <Target className="w-5 h-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900 mb-1">Stay On Schedule</p>
                  <p className="text-sm text-gray-600">
                    Complete all milestones and tasks within planned timeline
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <Target className="w-5 h-5 text-purple-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900 mb-1">Budget Compliance</p>
                  <p className="text-sm text-gray-600">
                    Maintain costs within approved budget allocation
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Risks & Issues */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Risks & Issues</h3>
            <div className="space-y-3">
              {project.progress < 50 && (
                <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 mb-1">Schedule Pressure</p>
                    <p className="text-sm text-gray-600">
                      Current progress rate may require additional resources to meet deadline
                    </p>
                  </div>
                </div>
              )}
              <div className="text-center py-4 text-sm text-gray-500">
                No critical issues identified
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - AI Summary */}
        <div className="space-y-4">
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">AI Project Summary</h3>
            </div>

            <div className="space-y-4">
              {/* Status Insight */}
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-1">Current Status</p>
                    <p className="text-sm text-gray-600">
                      Project is {project.progress}% complete with {tasks.length} total tasks. 
                      {completedTasks > 0 && ` ${completedTasks} tasks have been completed successfully.`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Risk Assessment */}
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-1">Risk Assessment</p>
                    <p className="text-sm text-gray-600">
                      {project.progress < 30
                        ? 'Monitor closely - progress is below target for current timeline.'
                        : 'Project health is stable. Continue current approach.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-start gap-3">
                  <Target className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-1">Recommended Next Steps</p>
                    <ul className="text-sm text-gray-600 space-y-1 mt-2">
                      <li>• Focus on {inProgressTasks} in-progress tasks</li>
                      <li>• Review and prioritize {todoTasks} upcoming tasks</li>
                      <li>• Ensure team alignment on deliverables</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Time Tracking */}
              {totalEstimatedHours > 0 && (
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-purple-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-1">Time Tracking</p>
                      <p className="text-sm text-gray-600">
                        {totalActualHours} of {totalEstimatedHours} estimated hours used
                        {totalActualHours > 0 &&
                          ` (${Math.round((totalActualHours / totalEstimatedHours) * 100)}%)`}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Quick Stats */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Tasks</span>
                <span className="text-sm font-medium text-gray-900">{tasks.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Team Size</span>
                <span className="text-sm font-medium text-gray-900">{teamMembers.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Days Remaining</span>
                <span className="text-sm font-medium text-gray-900">
                  {Math.ceil(
                    (new Date(project.endDate).getTime() - new Date().getTime()) /
                      (1000 * 60 * 60 * 24)
                  )}
                </span>
              </div>
              {project.budget && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Budget</span>
                  <span className="text-sm font-medium text-gray-900">
                    ${project.budget.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}