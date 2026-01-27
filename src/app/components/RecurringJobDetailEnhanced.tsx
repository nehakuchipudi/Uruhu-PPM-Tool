import React, { useState } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Textarea } from '@/app/components/ui/textarea';
import { Input } from '@/app/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { RecurringTask, Person, Role, Project } from '@/types';
import {
  ArrowLeft,
  Edit,
  MoreVertical,
  Calendar,
  Clock,
  User,
  Repeat,
  Save,
  CheckCircle2,
  XCircle,
  PlayCircle,
  TrendingUp,
  FileText,
  Plus,
  Trash2,
  Download,
  PauseCircle,
  History,
  BarChart3,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

interface RecurringJobDetailEnhancedProps {
  recurringTask: RecurringTask;
  project?: Project;
  people: Person[];
  roles: Role[];
  onBack: () => void;
  onUpdate: (updates: Partial<RecurringTask>) => void;
}

export function RecurringJobDetailEnhanced({
  recurringTask: initialTask,
  project,
  people,
  roles,
  onBack,
  onUpdate,
}: RecurringJobDetailEnhancedProps) {
  const [task, setTask] = useState(initialTask);
  const [isEditing, setIsEditing] = useState(false);
  const [editedDescription, setEditedDescription] = useState(task.description);
  const [editedFrequencyDetails, setEditedFrequencyDetails] = useState(
    task.frequencyDetails || ''
  );
  const [isPaused, setIsPaused] = useState(false);

  const getTechnicianName = (id: string) => {
    return people.find((p) => p.id === id)?.name || 'Unknown';
  };

  const getFrequencyColor = (frequency: RecurringTask['frequency']) => {
    switch (frequency) {
      case 'daily':
        return 'border-purple-500 text-purple-700 bg-purple-50';
      case 'weekly':
        return 'border-blue-500 text-blue-700 bg-blue-50';
      case 'bi-weekly':
        return 'border-cyan-500 text-cyan-700 bg-cyan-50';
      case 'monthly':
        return 'border-green-500 text-green-700 bg-green-50';
      case 'quarterly':
        return 'border-orange-500 text-orange-700 bg-orange-50';
      default:
        return 'border-gray-500 text-gray-700 bg-gray-50';
    }
  };

  const getActivityColor = (level: RecurringTask['activityLevel']) => {
    switch (level) {
      case 'high':
        return 'border-red-500 text-red-700 bg-red-50';
      case 'medium':
        return 'border-yellow-500 text-yellow-700 bg-yellow-50';
      default:
        return 'border-green-500 text-green-700 bg-green-50';
    }
  };

  const handleFrequencyChange = (newFrequency: RecurringTask['frequency']) => {
    const updatedTask = { ...task, frequency: newFrequency };
    setTask(updatedTask);
    onUpdate({ frequency: newFrequency });
    toast.success(`Frequency updated to ${newFrequency}`);
  };

  const handleActivityLevelChange = (newLevel: RecurringTask['activityLevel']) => {
    const updatedTask = { ...task, activityLevel: newLevel };
    setTask(updatedTask);
    onUpdate({ activityLevel: newLevel });
    toast.success(`Activity level updated to ${newLevel}`);
  };

  const handleSaveDetails = () => {
    const updates = {
      description: editedDescription,
      frequencyDetails: editedFrequencyDetails,
    };
    setTask({ ...task, ...updates });
    onUpdate(updates);
    setIsEditing(false);
    toast.success('Details saved successfully');
  };

  const handlePauseToggle = () => {
    setIsPaused(!isPaused);
    toast.success(isPaused ? 'Recurring job resumed' : 'Recurring job paused');
  };

  const handleGenerateWorkOrder = () => {
    toast.success('Work order generated for next occurrence');
  };

  // Calculate statistics
  const totalCompleted = task.completionHistory.length;
  const avgDuration =
    totalCompleted > 0
      ? task.completionHistory.reduce((sum, h) => sum + h.duration, 0) / totalCompleted
      : 0;
  const onTimeRate =
    totalCompleted > 0
      ? Math.round(
          (task.completionHistory.filter((h) => h.duration <= task.estimatedDuration).length /
            totalCompleted) *
            100
        )
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" onClick={onBack} size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Repeat className="w-6 h-6 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">{task.title}</h1>
              <Badge variant="outline" className={getFrequencyColor(task.frequency)}>
                {task.frequency}
              </Badge>
              <Badge variant="outline" className={getActivityColor(task.activityLevel)}>
                {task.activityLevel} activity
              </Badge>
              {isPaused && (
                <Badge className="bg-amber-500 text-white">
                  <PauseCircle className="w-3 h-3 mr-1" />
                  Paused
                </Badge>
              )}
            </div>
            <p className="text-gray-600">Recurring Job #{task.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => toast.info('Print functionality coming soon')}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Status Management Section */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Job Management</h3>
            <p className="text-sm text-gray-600">Control recurring job schedule and settings</p>
          </div>
          <div className="flex items-center gap-3">
            {isPaused ? (
              <Button onClick={handlePauseToggle} className="bg-emerald-600 hover:bg-emerald-700">
                <PlayCircle className="w-4 h-4 mr-2" />
                Resume Job
              </Button>
            ) : (
              <>
                <Button onClick={handleGenerateWorkOrder} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Generate Work Order
                </Button>
                <Button variant="outline" onClick={handlePauseToggle}>
                  <PauseCircle className="w-4 h-4 mr-2" />
                  Pause Job
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-blue-200">
          <div>
            <label className="text-xs font-medium text-gray-700 mb-2 block">Change Frequency</label>
            <Select value={task.frequency} onValueChange={(v: any) => handleFrequencyChange(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="bi-weekly">Bi-Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 mb-2 block">
              Activity Level
            </label>
            <Select
              value={task.activityLevel}
              onValueChange={(v: any) => handleActivityLevelChange(v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 mb-2 block">Next Occurrence</label>
            <div className="flex items-center gap-2 h-10 px-3 border border-gray-200 rounded-md bg-white">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-900">
                {new Date(task.nextOccurrence).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-blue-600 uppercase">Total Completed</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{totalCompleted}</p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-blue-400" />
          </div>
        </Card>

        <Card className="p-4 bg-green-50 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-green-600 uppercase">Avg Duration</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{avgDuration.toFixed(1)}h</p>
            </div>
            <Clock className="w-8 h-8 text-green-400" />
          </div>
        </Card>

        <Card className="p-4 bg-purple-50 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-purple-600 uppercase">On-Time Rate</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">{onTimeRate}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-400" />
          </div>
        </Card>

        <Card className="p-4 bg-amber-50 border-amber-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-amber-600 uppercase">Est. Duration</p>
              <p className="text-2xl font-bold text-amber-900 mt-1">{task.estimatedDuration}h</p>
            </div>
            <Clock className="w-8 h-8 text-amber-400" />
          </div>
        </Card>
      </div>

      {/* Job Details Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Job Details</h2>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button onClick={handleSaveDetails}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Details
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Job ID</label>
              <p className="text-gray-900 font-mono mt-1">#{task.id}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Customer</label>
              <p className="text-gray-900 mt-1">{task.customerName}</p>
              {project && <p className="text-sm text-gray-600">{project.name}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Schedule
              </label>
              <p className="text-gray-900 mt-1">
                {task.frequency.charAt(0).toUpperCase() + task.frequency.slice(1)}
              </p>
              {task.frequencyDetails && (
                <p className="text-sm text-gray-600">{task.frequencyDetails}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Date Range</label>
              <div className="text-gray-900 mt-1">
                <p>
                  Start:{' '}
                  {new Date(task.startDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
                {task.endDate && (
                  <p>
                    End:{' '}
                    {new Date(task.endDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <User className="w-4 h-4" />
                Assigned Technician(s)
              </label>
              <div className="mt-2 space-y-2">
                {task.assignedTo.length > 0 ? (
                  task.assignedTo.map((techId) => {
                    const tech = people.find((p) => p.id === techId);
                    return (
                      <div key={techId} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
                          {tech?.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{tech?.name}</p>
                          <p className="text-xs text-gray-600">{tech?.role}</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-gray-500">No technicians assigned</p>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Assigned Roles</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {task.assignedRoles.length > 0 ? (
                  task.assignedRoles.map((roleId) => {
                    const role = roles.find((r) => r.id === roleId);
                    return (
                      <Badge key={roleId} variant="outline">
                        {role?.name}
                      </Badge>
                    );
                  })
                ) : (
                  <p className="text-sm text-gray-500">No roles assigned</p>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Estimated Duration
              </label>
              <p className="text-gray-900 mt-1">{task.estimatedDuration} hours</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Activity Level</label>
              <div className="mt-1">
                <Badge variant="outline" className={getActivityColor(task.activityLevel)}>
                  {task.activityLevel}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Job Description */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <label className="text-sm font-medium text-gray-700 block mb-2">Job Description</label>
          {isEditing ? (
            <Textarea
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
              rows={4}
              className="w-full"
            />
          ) : (
            <p className="text-gray-900 whitespace-pre-wrap">{task.description}</p>
          )}
        </div>

        {/* Frequency Details */}
        {isEditing && (
          <div className="mt-4">
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Frequency Details (Optional)
            </label>
            <Input
              value={editedFrequencyDetails}
              onChange={(e) => setEditedFrequencyDetails(e.target.value)}
              placeholder="e.g., Every Monday and Friday at 9 AM"
            />
          </div>
        )}
      </Card>

      {/* Completion History Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <History className="w-5 h-5" />
            Completion History
          </h2>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <BarChart3 className="w-4 h-4 mr-2" />
              View Analytics
            </Button>
          </div>
        </div>

        {task.completionHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                    Work Order ID
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                    Completed By
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                    Duration
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                    Performance
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {task.completionHistory.map((history, idx) => {
                  const onTime = history.duration <= task.estimatedDuration;
                  return (
                    <tr key={idx} className="border-b border-gray-100">
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {new Date(history.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3 px-4 text-sm font-mono text-gray-900">
                        #{history.workOrderId}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {getTechnicianName(history.completedBy)}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {history.duration}h
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          className={
                            onTime
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-amber-100 text-amber-700'
                          }
                        >
                          {onTime ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              On Time
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Over Time
                            </>
                          )}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button variant="ghost" size="sm">
                          <FileText className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <History className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No completion history yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Work orders will appear here once completed
            </p>
          </div>
        )}
      </Card>

      {/* Upcoming Occurrences Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Upcoming Occurrences
          </h2>
        </div>

        <div className="space-y-2">
          {/* Generate next 5 occurrences based on frequency */}
          {[0, 1, 2, 3, 4].map((offset) => {
            const date = new Date(task.nextOccurrence);
            // Simple logic - adjust based on frequency
            if (task.frequency === 'daily') {
              date.setDate(date.getDate() + offset);
            } else if (task.frequency === 'weekly') {
              date.setDate(date.getDate() + offset * 7);
            } else if (task.frequency === 'bi-weekly') {
              date.setDate(date.getDate() + offset * 14);
            } else if (task.frequency === 'monthly') {
              date.setMonth(date.getMonth() + offset);
            } else if (task.frequency === 'quarterly') {
              date.setMonth(date.getMonth() + offset * 3);
            }

            return (
              <div
                key={offset}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900">
                    {date.toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <Button variant="outline" size="sm" onClick={handleGenerateWorkOrder}>
                  <Plus className="w-3 h-3 mr-1" />
                  Generate Work Order
                </Button>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
