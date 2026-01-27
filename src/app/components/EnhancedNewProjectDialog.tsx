import { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Card } from '@/app/components/ui/card';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Badge } from '@/app/components/ui/badge';
import { Checkbox } from '@/app/components/ui/checkbox';
import { Project, Task, Person } from '@/types';
import { X, Plus, Trash2, Users, Calendar, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface TaskInput {
  tempId: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  estimatedHours: number;
  assignedTo: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  dependencies: string[]; // temp IDs of dependent tasks
}

interface EnhancedNewProjectDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  instanceId: string;
  people: Person[];
  roles?: any[];
  onComplete?: (project: Project, tasks: Task[]) => void;
  onSubmit?: (project: Project, tasks: Task[]) => void;
  onCancel?: () => void;
}

export function EnhancedNewProjectDialog({ 
  open = true, 
  onOpenChange,
  instanceId, 
  people, 
  onComplete, 
  onSubmit,
  onCancel 
}: EnhancedNewProjectDialogProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    customerName: '',
    status: 'planning' as const,
    startDate: '',
    endDate: '',
    budget: '',
    priority: 'medium' as const,
    assignedTo: [] as string[],
  });

  const [tasks, setTasks] = useState<TaskInput[]>([
    {
      tempId: `temp-1`,
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      estimatedHours: 8,
      assignedTo: [],
      priority: 'medium',
      dependencies: [],
    },
  ]);

  const handleAddTask = () => {
    setTasks([
      ...tasks,
      {
        tempId: `temp-${Date.now()}`,
        name: '',
        description: '',
        startDate: formData.startDate || '',
        endDate: formData.endDate || '',
        estimatedHours: 8,
        assignedTo: [],
        priority: 'medium',
        dependencies: [],
      },
    ]);
  };

  const handleRemoveTask = (tempId: string) => {
    if (tasks.length === 1) {
      toast.error('Project must have at least one task');
      return;
    }
    // Remove task and any dependencies on it
    setTasks(tasks
      .filter(t => t.tempId !== tempId)
      .map(t => ({
        ...t,
        dependencies: t.dependencies.filter(d => d !== tempId),
      }))
    );
  };

  const handleTaskChange = (tempId: string, field: keyof TaskInput, value: any) => {
    setTasks(tasks.map(t => t.tempId === tempId ? { ...t, [field]: value } : t));
  };

  const toggleTaskAssignment = (tempId: string, personId: string) => {
    setTasks(tasks.map(t => {
      if (t.tempId === tempId) {
        const assigned = t.assignedTo.includes(personId)
          ? t.assignedTo.filter(id => id !== personId)
          : [...t.assignedTo, personId];
        return { ...t, assignedTo: assigned };
      }
      return t;
    }));
  };

  const toggleTaskDependency = (tempId: string, dependencyId: string) => {
    setTasks(tasks.map(t => {
      if (t.tempId === tempId) {
        const deps = t.dependencies.includes(dependencyId)
          ? t.dependencies.filter(id => id !== dependencyId)
          : [...t.dependencies, dependencyId];
        return { ...t, dependencies: deps };
      }
      return t;
    }));
  };

  const togglePersonAssignment = (personId: string) => {
    setFormData({
      ...formData,
      assignedTo: formData.assignedTo.includes(personId)
        ? formData.assignedTo.filter(id => id !== personId)
        : [...formData.assignedTo, personId],
    });
  };

  const validateStep1 = () => {
    if (!formData.name.trim()) {
      toast.error('Project name is required');
      return false;
    }
    if (!formData.customerName.trim()) {
      toast.error('Customer name is required');
      return false;
    }
    if (!formData.startDate || !formData.endDate) {
      toast.error('Start and end dates are required');
      return false;
    }
    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      toast.error('End date must be after start date');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    const invalidTasks = tasks.filter(t => !t.name.trim());
    if (invalidTasks.length > 0) {
      toast.error('All tasks must have a name');
      return false;
    }

    const tasksWithoutDates = tasks.filter(t => !t.startDate || !t.endDate);
    if (tasksWithoutDates.length > 0) {
      toast.error('All tasks must have start and end dates');
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleClose = () => {
    if (onOpenChange) {
      onOpenChange(false);
    }
    if (onCancel) {
      onCancel();
    }
  };

  const handleSubmitInternal = () => {
    if (!validateStep2()) return;

    const projectId = `proj-${Date.now()}`;
    
    const newProject: Project = {
      id: projectId,
      name: formData.name,
      description: formData.description,
      instanceId: instanceId,
      customerName: formData.customerName,
      status: formData.status,
      startDate: formData.startDate,
      endDate: formData.endDate,
      budget: formData.budget ? parseFloat(formData.budget) : undefined,
      assignedTo: formData.assignedTo,
      progress: 0,
      priority: formData.priority,
    };

    const newTasks: Task[] = tasks.map((task, index) => ({
      id: `task-${projectId}-${index + 1}`,
      projectId,
      name: task.name,
      description: task.description,
      assignedTo: task.assignedTo,
      status: 'todo' as const,
      priority: task.priority,
      startDate: task.startDate,
      endDate: task.endDate,
      dependencies: task.dependencies.map(tempId => {
        const depIndex = tasks.findIndex(t => t.tempId === tempId);
        return `task-${projectId}-${depIndex + 1}`;
      }),
      progress: 0,
      estimatedHours: task.estimatedHours,
    }));

    if (onComplete) {
      onComplete(newProject, newTasks);
    }
    if (onSubmit) {
      onSubmit(newProject, newTasks);
    }
    toast.success(`Project "${formData.name}" created with ${newTasks.length} tasks`);
  };

  // Don't render if not open
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-5xl bg-white p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              {step === 1 ? 'Create New Project' : 'Add Project Tasks'}
            </h2>
            <p className="text-gray-600">
              {step === 1 
                ? 'Set up project details and timeline'
                : 'Define tasks and milestones for Gantt chart'}
            </p>
            <div className="flex items-center gap-2 mt-3">
              <Badge variant={step === 1 ? 'default' : 'outline'}>1. Project Details</Badge>
              <Badge variant={step === 2 ? 'default' : 'outline'}>2. Tasks & Timeline</Badge>
            </div>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 1 ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="name">Project Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter project name"
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="customerName">Customer Name *</Label>
                <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  placeholder="Enter customer name"
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the project scope, deliverables, and objectives"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget">Budget ($)</Label>
                <Input
                  id="budget"
                  type="number"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  placeholder="0.00"
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={formData.priority} onValueChange={(value: any) => setFormData({ ...formData, priority: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 col-span-2">
                <Label>Assigned Team Members</Label>
                <div className="grid grid-cols-2 gap-2 p-3 border rounded-lg">
                  {people.length === 0 ? (
                    <p className="text-sm text-gray-500 col-span-2">No team members available</p>
                  ) : (
                    people.map(person => (
                      <div key={person.id} className="flex items-center gap-2">
                        <Checkbox
                          id={`person-${person.id}`}
                          checked={formData.assignedTo.includes(person.id)}
                          onCheckedChange={() => togglePersonAssignment(person.id)}
                        />
                        <label htmlFor={`person-${person.id}`} className="text-sm cursor-pointer">
                          {person.name} ({person.role})
                        </label>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="button" onClick={handleNext}>
                Next: Add Tasks
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 text-blue-700">
                <Calendar className="w-5 h-5" />
                <div>
                  <p className="font-medium">Project Timeline</p>
                  <p className="text-sm">
                    {new Date(formData.startDate).toLocaleDateString()} - {new Date(formData.endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <Button type="button" size="sm" variant="outline" onClick={() => setStep(1)}>
                Edit Details
              </Button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base">Project Tasks & Milestones</Label>
                <Button type="button" size="sm" onClick={handleAddTask}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add Task
                </Button>
              </div>

              {tasks.map((task, index) => (
                <Card key={task.tempId} className="p-4 border-2 border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Task {index + 1}</Badge>
                      {task.dependencies.length > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          Depends on {task.dependencies.length} task{task.dependencies.length > 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveTask(task.tempId)}
                      disabled={tasks.length === 1}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <Label>Task Name *</Label>
                      <Input
                        value={task.name}
                        onChange={(e) => handleTaskChange(task.tempId, 'name', e.target.value)}
                        placeholder="e.g., Initial Site Assessment"
                      />
                    </div>

                    <div className="col-span-2">
                      <Label>Description</Label>
                      <Textarea
                        value={task.description}
                        onChange={(e) => handleTaskChange(task.tempId, 'description', e.target.value)}
                        placeholder="Task details and requirements"
                        rows={2}
                      />
                    </div>

                    <div>
                      <Label>Start Date *</Label>
                      <Input
                        type="date"
                        value={task.startDate}
                        onChange={(e) => handleTaskChange(task.tempId, 'startDate', e.target.value)}
                        min={formData.startDate}
                        max={formData.endDate}
                      />
                    </div>

                    <div>
                      <Label>End Date *</Label>
                      <Input
                        type="date"
                        value={task.endDate}
                        onChange={(e) => handleTaskChange(task.tempId, 'endDate', e.target.value)}
                        min={task.startDate || formData.startDate}
                        max={formData.endDate}
                      />
                    </div>

                    <div>
                      <Label>Estimated Hours</Label>
                      <Input
                        type="number"
                        value={task.estimatedHours}
                        onChange={(e) => handleTaskChange(task.tempId, 'estimatedHours', parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.5"
                      />
                    </div>

                    <div>
                      <Label>Priority</Label>
                      <Select
                        value={task.priority}
                        onValueChange={(value: any) => handleTaskChange(task.tempId, 'priority', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {people.length > 0 && (
                      <div className="col-span-2">
                        <Label className="flex items-center gap-2 mb-2">
                          <Users className="w-4 h-4" />
                          Assigned To
                        </Label>
                        <div className="grid grid-cols-2 gap-2 p-2 border rounded">
                          {people.map(person => (
                            <div key={person.id} className="flex items-center gap-2">
                              <Checkbox
                                id={`task-${task.tempId}-person-${person.id}`}
                                checked={task.assignedTo.includes(person.id)}
                                onCheckedChange={() => toggleTaskAssignment(task.tempId, person.id)}
                              />
                              <label
                                htmlFor={`task-${task.tempId}-person-${person.id}`}
                                className="text-sm cursor-pointer"
                              >
                                {person.name}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {index > 0 && (
                      <div className="col-span-2">
                        <Label className="flex items-center gap-2 mb-2">
                          <Clock className="w-4 h-4" />
                          Dependencies (This task waits for:)
                        </Label>
                        <div className="grid grid-cols-2 gap-2 p-2 border rounded bg-gray-50">
                          {tasks.slice(0, index).map((depTask, depIndex) => (
                            <div key={depTask.tempId} className="flex items-center gap-2">
                              <Checkbox
                                id={`task-${task.tempId}-dep-${depTask.tempId}`}
                                checked={task.dependencies.includes(depTask.tempId)}
                                onCheckedChange={() => toggleTaskDependency(task.tempId, depTask.tempId)}
                              />
                              <label
                                htmlFor={`task-${task.tempId}-dep-${depTask.tempId}`}
                                className="text-sm cursor-pointer"
                              >
                                Task {depIndex + 1}: {depTask.name || 'Untitled'}
                              </label>
                            </div>
                          ))}
                          {index === 0 && (
                            <p className="text-xs text-gray-500 col-span-2">No previous tasks available</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button type="button" onClick={handleSubmitInternal}>
                Create Project with {tasks.length} Task{tasks.length > 1 ? 's' : ''}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}