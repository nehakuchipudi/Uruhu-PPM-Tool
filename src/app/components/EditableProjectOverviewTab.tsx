import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Progress } from '@/app/components/ui/progress';
import { Project, Task, Person } from '@/types';
import {
  Calendar,
  Users,
  DollarSign,
  Target,
  AlertCircle,
  CheckCircle2,
  Clock,
  Building2,
  Flag,
  Edit,
  Save,
  X,
} from 'lucide-react';
import { AIInsightsContainer, AIInsight } from '@/app/components/AIInsightCard';
import { toast } from 'sonner';

interface EditableProjectOverviewTabProps {
  project: Project;
  tasks: Task[];
  people: Person[];
  onUpdateProject?: (updates: Partial<Project>) => void;
}

export function EditableProjectOverviewTab({ 
  project, 
  tasks, 
  people,
  onUpdateProject 
}: EditableProjectOverviewTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProject, setEditedProject] = useState<Project>(project);

  const owner = people.find((p) => editedProject.assignedTo[0] === p.id);
  const teamMembers = people.filter((p) => editedProject.assignedTo.includes(p.id));

  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'in-progress').length;
  const todoTasks = tasks.filter((t) => t.status === 'todo').length;

  const totalEstimatedHours = tasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);
  const totalActualHours = tasks.reduce((sum, t) => sum + (t.actualHours || 0), 0);

  // Generate AI Insights
  const generateProjectInsights = (): AIInsight[] => {
    const insights: AIInsight[] = [];

    if (editedProject.progress < 30 && editedProject.status === 'active') {
      insights.push({
        id: `insight-${editedProject.id}-health`,
        type: 'warning',
        priority: 'high',
        title: 'Project Progress Below Target',
        description: `Project is ${editedProject.progress}% complete but may be at risk. Consider reviewing task assignments and removing blockers.`,
        metrics: [
          { label: 'Current Progress', value: `${editedProject.progress}%` },
          { label: 'Tasks Complete', value: `${completedTasks}/${tasks.length}` },
        ],
        dismissible: true,
      });
    } else if (editedProject.progress >= 70) {
      insights.push({
        id: `insight-${editedProject.id}-success`,
        type: 'success',
        priority: 'low',
        title: 'Project on Track for Success',
        description: `Excellent progress at ${editedProject.progress}%. Keep up the momentum to deliver on time.`,
        metrics: [
          { label: 'Progress', value: `${editedProject.progress}%` },
          { label: 'Completed Tasks', value: `${completedTasks}` },
        ],
        dismissible: true,
      });
    }

    const daysToEnd = Math.ceil((new Date(editedProject.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysToEnd < 7 && daysToEnd > 0 && editedProject.progress < 90) {
      insights.push({
        id: `insight-${editedProject.id}-deadline`,
        type: 'warning',
        priority: 'critical',
        title: 'Project Deadline Approaching',
        description: `Only ${daysToEnd} days remaining with ${100 - editedProject.progress}% of work incomplete. Immediate action required.`,
        details: 'Focus on critical path tasks and consider requesting timeline extension if needed.',
        metrics: [
          { label: 'Days Left', value: `${daysToEnd}` },
          { label: 'Remaining Work', value: `${100 - editedProject.progress}%` },
        ],
        dismissible: false,
      });
    }

    return insights;
  };

  const projectInsights = generateProjectInsights();

  const getPriorityColor = (priority: Project['priority']) => {
    switch (priority) {
      case 'critical': return 'outline-destructive';
      case 'high': return 'outline-warning';
      case 'medium': return 'outline-primary';
      default: return 'outline';
    }
  };

  const getHealthStatus = () => {
    if (editedProject.progress < 30 && editedProject.status === 'active') {
      return { color: 'text-destructive', bg: 'bg-destructive-light', label: 'At Risk', icon: AlertCircle };
    }
    if (editedProject.progress >= 70) {
      return {
        color: 'text-success',
        bg: 'bg-success-light',
        label: 'On Track',
        icon: CheckCircle2,
      };
    }
    return { color: 'text-warning', bg: 'bg-warning-light', label: 'Watch', icon: Clock };
  };

  const health = getHealthStatus();
  const HealthIcon = health.icon;

  const handleSave = () => {
    if (onUpdateProject) {
      onUpdateProject(editedProject);
      toast.success('Project updated successfully');
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedProject(project);
    setIsEditing(false);
  };

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Project Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Key Information Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Project Information</CardTitle>
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)} variant="outline" size="sm" className="gap-2">
                    <Edit className="w-4 h-4" />
                    Edit Details
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button onClick={handleSave} size="sm" className="gap-2">
                      <Save className="w-4 h-4" />
                      Save
                    </Button>
                    <Button onClick={handleCancel} variant="outline" size="sm" className="gap-2">
                      <X className="w-4 h-4" />
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Project ID */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">Project ID</label>
                  <p className="text-sm text-foreground font-mono bg-muted px-3 py-2 rounded-lg">{editedProject.id}</p>
                </div>

                {/* Customer Name */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">Client/Customer</label>
                  {isEditing ? (
                    <Input
                      value={editedProject.customerName}
                      onChange={(e) => setEditedProject({ ...editedProject, customerName: e.target.value })}
                      className="h-10"
                    />
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-foreground bg-muted px-3 py-2 rounded-lg">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                      {editedProject.customerName}
                    </div>
                  )}
                </div>

                {/* Start Date */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">Start Date</label>
                  {isEditing ? (
                    <Input
                      type="date"
                      value={editedProject.startDate}
                      onChange={(e) => setEditedProject({ ...editedProject, startDate: e.target.value })}
                      className="h-10"
                    />
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-foreground bg-muted px-3 py-2 rounded-lg">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      {new Date(editedProject.startDate).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>
                  )}
                </div>

                {/* End Date */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">Target End Date</label>
                  {isEditing ? (
                    <Input
                      type="date"
                      value={editedProject.endDate}
                      onChange={(e) => setEditedProject({ ...editedProject, endDate: e.target.value })}
                      className="h-10"
                    />
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-foreground bg-muted px-3 py-2 rounded-lg">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      {new Date(editedProject.endDate).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>
                  )}
                </div>

                {/* Project Owner */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">Project Owner</label>
                  {isEditing ? (
                    <select
                      value={editedProject.assignedTo[0]}
                      onChange={(e) => setEditedProject({ ...editedProject, assignedTo: [e.target.value, ...editedProject.assignedTo.slice(1)] })}
                      className="w-full h-10 px-4 rounded-lg border-2 border-input-border bg-input-background text-sm"
                    >
                      {people.map((person) => (
                        <option key={person.id} value={person.id}>{person.name}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-foreground bg-muted px-3 py-2 rounded-lg">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      {owner?.name || 'Unassigned'}
                    </div>
                  )}
                </div>

                {/* Priority Level */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">Priority Level</label>
                  {isEditing ? (
                    <select
                      value={editedProject.priority}
                      onChange={(e) => setEditedProject({ ...editedProject, priority: e.target.value as Project['priority'] })}
                      className="w-full h-10 px-4 rounded-lg border-2 border-input-border bg-input-background text-sm"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  ) : (
                    <Badge variant={getPriorityColor(editedProject.priority)} className="w-fit">
                      <Flag className="w-3 h-3 mr-1" />
                      {editedProject.priority}
                    </Badge>
                  )}
                </div>

                {/* Budget */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">Budget</label>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={editedProject.budget || ''}
                      onChange={(e) => setEditedProject({ ...editedProject, budget: parseFloat(e.target.value) || 0 })}
                      className="h-10"
                      placeholder="Enter budget"
                    />
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-foreground bg-muted px-3 py-2 rounded-lg">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      ${(editedProject.budget || 0).toLocaleString()}
                    </div>
                  )}
                </div>

                {/* Status */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">Status</label>
                  {isEditing ? (
                    <select
                      value={editedProject.status}
                      onChange={(e) => setEditedProject({ ...editedProject, status: e.target.value as Project['status'] })}
                      className="w-full h-10 px-4 rounded-lg border-2 border-input-border bg-input-background text-sm"
                    >
                      <option value="planning">Planning</option>
                      <option value="active">Active</option>
                      <option value="on-hold">On Hold</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  ) : (
                    <Badge className="w-fit capitalize">
                      {editedProject.status.replace('-', ' ')}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="mt-6">
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Description</label>
                {isEditing ? (
                  <Textarea
                    value={editedProject.description || ''}
                    onChange={(e) => setEditedProject({ ...editedProject, description: e.target.value })}
                    rows={4}
                    placeholder="Enter project description"
                    className="resize-none"
                  />
                ) : (
                  <p className="text-sm text-foreground bg-muted px-4 py-3 rounded-lg">
                    {editedProject.description || 'No description provided'}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Progress Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Progress Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">Overall Progress</span>
                    <span className="text-2xl font-bold text-primary">{editedProject.progress}%</span>
                  </div>
                  <Progress value={editedProject.progress} className="h-3" />
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-muted-foreground mb-1">{todoTasks}</div>
                    <div className="text-xs text-muted-foreground">To Do</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-info mb-1">{inProgressTasks}</div>
                    <div className="text-xs text-muted-foreground">In Progress</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-success mb-1">{completedTasks}</div>
                    <div className="text-xs text-muted-foreground">Completed</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Stats & Health */}
        <div className="space-y-6">
          {/* Health Status */}
          <Card>
            <CardHeader>
              <CardTitle>Project Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`p-6 rounded-xl ${health.bg} text-center`}>
                <div className="mx-auto w-16 h-16 rounded-full bg-white/50 flex items-center justify-center mb-3">
                  <HealthIcon className={`w-8 h-8 ${health.color}`} />
                </div>
                <div className={`text-lg font-semibold ${health.color} mb-1`}>{health.label}</div>
                <div className="text-sm text-muted-foreground">
                  {editedProject.progress}% Complete
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Time & Resources */}
          <Card>
            <CardHeader>
              <CardTitle>Time & Resources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm text-muted-foreground">Estimated Hours</span>
                <span className="text-sm font-semibold text-foreground">{totalEstimatedHours}h</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm text-muted-foreground">Actual Hours</span>
                <span className="text-sm font-semibold text-foreground">{totalActualHours}h</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm text-muted-foreground">Team Size</span>
                <span className="text-sm font-semibold text-foreground">{teamMembers.length} members</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm text-muted-foreground">Total Tasks</span>
                <span className="text-sm font-semibold text-foreground">{tasks.length}</span>
              </div>
            </CardContent>
          </Card>

          {/* Team Members */}
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                      {member.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">{member.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{member.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
