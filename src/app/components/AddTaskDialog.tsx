import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Label } from '@/app/components/ui/label';
import { Task, Person } from '@/types';
import { Calendar, Users, Clock, Flag, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface AddTaskDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (task: Omit<Task, 'id'>) => void;
  people: Person[];
  projectId: string;
  parentTaskId?: string;
  milestoneId?: string;
}

export function AddTaskDialog({ 
  open, 
  onClose, 
  onAdd, 
  people, 
  projectId,
  parentTaskId,
  milestoneId 
}: AddTaskDialogProps) {
  const isSubtask = !!parentTaskId;
  
  const [newTask, setNewTask] = useState<Omit<Task, 'id'>>({
    projectId,
    name: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    assignedTo: [],
    progress: 0,
    estimatedHours: 0,
    actualHours: 0,
    tags: [],
    dependencies: [],
    subtasks: [],
  });

  const handleAdd = () => {
    if (!newTask.name.trim()) {
      toast.error('Please enter a task name');
      return;
    }

    // Add parentTaskId if this is a subtask
    const taskToAdd = parentTaskId 
      ? { ...newTask, parentTaskId } 
      : newTask;

    onAdd(taskToAdd);
    toast.success(`${isSubtask ? 'Subtask' : 'Task'} added successfully`);
    
    // Reset form
    setNewTask({
      projectId,
      name: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      assignedTo: [],
      progress: 0,
      estimatedHours: 0,
      actualHours: 0,
      tags: [],
      dependencies: [],
      subtasks: [],
    });
    
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add New {isSubtask ? 'Subtask' : 'Task'}
          </DialogTitle>
          <DialogDescription>
            Add a new {isSubtask ? 'subtask' : 'task'} to your project.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Task Name */}
          <div className="space-y-2">
            <Label htmlFor="new-task-name">Task Name *</Label>
            <Input
              id="new-task-name"
              value={newTask.name}
              onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
              placeholder="Enter task name"
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="new-task-description">Description</Label>
            <Textarea
              id="new-task-description"
              value={newTask.description || ''}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              placeholder="Enter task description"
              rows={4}
              className="resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Start Date */}
            <div className="space-y-2">
              <Label htmlFor="new-start-date" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Start Date
              </Label>
              <Input
                id="new-start-date"
                type="date"
                value={newTask.startDate}
                onChange={(e) => setNewTask({ ...newTask, startDate: e.target.value })}
              />
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <Label htmlFor="new-end-date" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                End Date
              </Label>
              <Input
                id="new-end-date"
                type="date"
                value={newTask.endDate}
                onChange={(e) => setNewTask({ ...newTask, endDate: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="new-status">Status</Label>
              <select
                id="new-status"
                value={newTask.status}
                onChange={(e) => setNewTask({ ...newTask, status: e.target.value as Task['status'] })}
                className="w-full h-10 px-4 rounded-lg border-2 border-input-border bg-input-background text-sm"
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="review">Review</option>
                <option value="completed">Completed</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label htmlFor="new-priority" className="flex items-center gap-2">
                <Flag className="w-4 h-4" />
                Priority
              </Label>
              <select
                id="new-priority"
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as Task['priority'] })}
                className="w-full h-10 px-4 rounded-lg border-2 border-input-border bg-input-background text-sm"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          {/* Estimated Hours */}
          <div className="space-y-2">
            <Label htmlFor="new-estimated-hours" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Estimated Hours
            </Label>
            <Input
              id="new-estimated-hours"
              type="number"
              value={newTask.estimatedHours || ''}
              onChange={(e) => setNewTask({ ...newTask, estimatedHours: parseFloat(e.target.value) || 0 })}
              placeholder="0"
              min="0"
              step="0.5"
            />
          </div>

          {/* Assigned To */}
          <div className="space-y-2">
            <Label htmlFor="new-assigned-to" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Assigned To
            </Label>
            <select
              id="new-assigned-to"
              multiple
              value={newTask.assignedTo}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions, option => option.value);
                setNewTask({ ...newTask, assignedTo: selected });
              }}
              className="w-full min-h-[120px] px-4 py-2 rounded-lg border-2 border-input-border bg-input-background text-sm"
            >
              {people.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.name} - {person.role}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">Hold Ctrl/Cmd to select multiple people</p>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="new-tags">Tags (comma-separated)</Label>
            <Input
              id="new-tags"
              value={newTask.tags?.join(', ') || ''}
              onChange={(e) => setNewTask({ 
                ...newTask, 
                tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) 
              })}
              placeholder="design, frontend, urgent"
            />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
          <Button onClick={handleAdd} className="gap-2">
            <Plus className="w-4 h-4" />
            Add {isSubtask ? 'Subtask' : 'Task'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}