import { Task, Person, Project } from '@/types';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Progress } from '@/app/components/ui/progress';
import { Button } from '@/app/components/ui/button';
import {
  X,
  Calendar,
  Clock,
  Users,
  AlertCircle,
  CheckCircle2,
  BarChart3,
  Flag,
  GitBranch,
} from 'lucide-react';

interface TaskDetailModalProps {
  task: Task;
  project: Project;
  people: Person[];
  allTasks: Task[];
  onClose: () => void;
}

export function TaskDetailModal({ task, project, people, allTasks, onClose }: TaskDetailModalProps) {
  const assignedPeople = people.filter(p => task.assignedTo.includes(p.id));
  const dependencyTasks = allTasks.filter(t => task.dependencies.includes(t.id));
  const blockedTasks = allTasks.filter(t => t.dependencies.includes(task.id));

  const getStatusIcon = () => {
    switch (task.status) {
      case 'completed': return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      case 'in-progress': return <BarChart3 className="w-5 h-5 text-blue-600" />;
      case 'review': return <AlertCircle className="w-5 h-5 text-amber-600" />;
      default: return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (task.status) {
      case 'completed': return 'bg-emerald-500';
      case 'in-progress': return 'bg-blue-500';
      case 'review': return 'bg-amber-500';
      default: return 'bg-gray-400';
    }
  };

  const getPriorityColor = () => {
    switch (task.priority) {
      case 'critical': return 'border-red-500 text-red-700 bg-red-50';
      case 'high': return 'border-orange-500 text-orange-700 bg-orange-50';
      case 'medium': return 'border-blue-500 text-blue-700 bg-blue-50';
      default: return 'border-gray-400 text-gray-700 bg-gray-50';
    }
  };

  const startDate = new Date(task.startDate);
  const endDate = new Date(task.endDate);
  const today = new Date();
  const isOverdue = endDate < today && task.status !== 'completed';
  const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  const varianceHours = task.actualHours && task.estimatedHours
    ? task.actualHours - task.estimatedHours
    : 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl bg-white max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              {getStatusIcon()}
              <h2 className="text-2xl font-semibold text-gray-900">{task.name}</h2>
            </div>
            <p className="text-gray-600">{task.description}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 -mr-2 -mt-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Status & Priority */}
          <div className="flex items-center gap-3 mb-6">
            <Badge className={`${getStatusColor()} text-white border-0`}>
              {task.status}
            </Badge>
            <Badge variant="outline" className={getPriorityColor()}>
              <Flag className="w-3 h-3 mr-1" />
              {task.priority} priority
            </Badge>
            {isOverdue && (
              <Badge variant="outline" className="border-red-500 text-red-700 bg-red-50">
                <AlertCircle className="w-3 h-3 mr-1" />
                Overdue
              </Badge>
            )}
          </div>

          {/* Project Info */}
          <div className="p-4 bg-gray-50 rounded-lg mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
              <span className="font-medium">Project:</span>
              <span>{project.name}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="font-medium">Client:</span>
              <span>{project.customerName}</span>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">Timeline</span>
              </div>
              <p className="text-sm font-medium text-gray-900 mb-1">
                {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
              </p>
              <p className={`text-xs ${isOverdue ? 'text-red-600' : daysRemaining < 7 ? 'text-amber-600' : 'text-gray-500'}`}>
                {isOverdue
                  ? `Overdue by ${Math.abs(daysRemaining)} days`
                  : daysRemaining === 0
                  ? 'Due today'
                  : `${daysRemaining} days remaining`}
              </p>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">Hours</span>
              </div>
              <div className="flex items-baseline gap-2">
                {task.actualHours ? (
                  <>
                    <p className="text-sm font-medium text-gray-900">{task.actualHours}h actual</p>
                    <p className="text-xs text-gray-500">/ {task.estimatedHours}h est.</p>
                  </>
                ) : (
                  <p className="text-sm font-medium text-gray-900">
                    {task.estimatedHours || 'N/A'}h estimated
                  </p>
                )}
              </div>
              {varianceHours !== 0 && (
                <p className={`text-xs mt-1 ${varianceHours > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                  {varianceHours > 0 ? '+' : ''}{varianceHours}h variance
                </p>
              )}
            </div>

            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">Progress</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-2">{task.progress}%</p>
              <Progress value={task.progress} className="h-2" />
            </div>
          </div>

          {/* Assigned People */}
          {assignedPeople.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-gray-600" />
                <h3 className="font-medium text-gray-900">Assigned Team</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {assignedPeople.map(person => (
                  <div key={person.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-medium">
                      {person.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{person.name}</p>
                      <p className="text-xs text-gray-600">{person.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dependencies */}
          {(dependencyTasks.length > 0 || blockedTasks.length > 0) && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <GitBranch className="w-4 h-4 text-gray-600" />
                <h3 className="font-medium text-gray-900">Dependencies</h3>
              </div>

              {dependencyTasks.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">This task depends on:</p>
                  <div className="space-y-2">
                    {dependencyTasks.map(dep => (
                      <div
                        key={dep.id}
                        className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{dep.name}</p>
                          <p className="text-xs text-gray-600">
                            {new Date(dep.endDate).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge
                          className={
                            dep.status === 'completed'
                              ? 'bg-emerald-500'
                              : dep.status === 'in-progress'
                              ? 'bg-blue-500'
                              : 'bg-gray-400'
                          }
                        >
                          {dep.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {blockedTasks.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Blocking these tasks:</p>
                  <div className="space-y-2">
                    {blockedTasks.map(blocked => (
                      <div
                        key={blocked.id}
                        className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{blocked.name}</p>
                          <p className="text-xs text-gray-600">
                            Starts {new Date(blocked.startDate).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge
                          className={
                            blocked.status === 'completed'
                              ? 'bg-emerald-500'
                              : blocked.status === 'in-progress'
                              ? 'bg-blue-500'
                              : 'bg-gray-400'
                          }
                        >
                          {blocked.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Footer */}
          <div className="pt-6 border-t border-gray-200 flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button>
              Update Status
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}