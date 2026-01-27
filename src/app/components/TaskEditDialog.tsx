import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Label } from '@/app/components/ui/label';
import { Task, Person } from '@/types';
import { Calendar, Users, Clock, Flag, Save, X } from 'lucide-react';
import { toast } from 'sonner';

interface TaskEditDialogProps {
  task: Task | null;
  open: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
  people: Person[];
  isSubtask?: boolean;
}

export function TaskEditDialog({ task, open, onClose, onSave, people, isSubtask = false }: TaskEditDialogProps) {
  const [editedTask, setEditedTask] = useState<Task | null>(task);

  React.useEffect(() => {
    setEditedTask(task);
  }, [task]);

  if (!editedTask) return null;

  const handleSave = () => {
    onSave(editedTask);
    toast.success(`${isSubtask ? 'Subtask' : 'Task'} updated successfully`);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isSubtask ? '📋' : '✅'} Edit {isSubtask ? 'Subtask' : 'Task'}
          </DialogTitle>
          <DialogDescription>
            Update the {isSubtask ? 'subtask' : 'task'} details below and click Save Changes when done.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Task Name */}
          <div className="space-y-2">
            <Label htmlFor="task-name">Task Name</Label>
            <Input
              id="task-name"
              value={editedTask.name}
              onChange={(e) => setEditedTask({ ...editedTask, name: e.target.value })}
              placeholder="Enter task name"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="task-description">Description</Label>
            <Textarea
              id="task-description"
              value={editedTask.description || ''}
              onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
              placeholder="Enter task description"
              rows={4}
              className="resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Start Date */}
            <div className="space-y-2">
              <Label htmlFor="start-date" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Start Date
              </Label>
              <Input
                id="start-date"
                type="date"
                value={editedTask.startDate}
                onChange={(e) => setEditedTask({ ...editedTask, startDate: e.target.value })}
              />
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <Label htmlFor="end-date" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                End Date
              </Label>
              <Input
                id="end-date"
                type="date"
                value={editedTask.endDate}
                onChange={(e) => setEditedTask({ ...editedTask, endDate: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={editedTask.status}
                onChange={(e) => setEditedTask({ ...editedTask, status: e.target.value as Task['status'] })}
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
              <Label htmlFor="priority" className="flex items-center gap-2">
                <Flag className="w-4 h-4" />
                Priority
              </Label>
              <select
                id="priority"
                value={editedTask.priority}
                onChange={(e) => setEditedTask({ ...editedTask, priority: e.target.value as Task['priority'] })}
                className="w-full h-10 px-4 rounded-lg border-2 border-input-border bg-input-background text-sm"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Estimated Hours */}
            <div className="space-y-2">
              <Label htmlFor="estimated-hours" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Estimated Hours
              </Label>
              <Input
                id="estimated-hours"
                type="number"
                value={editedTask.estimatedHours || ''}
                onChange={(e) => setEditedTask({ ...editedTask, estimatedHours: parseFloat(e.target.value) || 0 })}
                placeholder="0"
                min="0"
                step="0.5"
              />
            </div>

            {/* Actual Hours */}
            <div className="space-y-2">
              <Label htmlFor="actual-hours" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Actual Hours
              </Label>
              <Input
                id="actual-hours"
                type="number"
                value={editedTask.actualHours || ''}
                onChange={(e) => setEditedTask({ ...editedTask, actualHours: parseFloat(e.target.value) || 0 })}
                placeholder="0"
                min="0"
                step="0.5"
              />
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <Label htmlFor="progress">Progress (%)</Label>
            <div className="flex items-center gap-4">
              <input
                id="progress"
                type="range"
                min="0"
                max="100"
                value={editedTask.progress}
                onChange={(e) => setEditedTask({ ...editedTask, progress: parseInt(e.target.value) })}
                className="flex-1"
              />
              <Input
                type="number"
                value={editedTask.progress}
                onChange={(e) => setEditedTask({ ...editedTask, progress: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) })}
                className="w-20"
                min="0"
                max="100"
              />
            </div>
          </div>

          {/* Assigned To */}
          <div className="space-y-2">
            <Label htmlFor="assigned-to" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Assigned To
            </Label>
            <select
              id="assigned-to"
              multiple
              value={editedTask.assignedTo}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions, option => option.value);
                setEditedTask({ ...editedTask, assignedTo: selected });
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
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              value={editedTask.tags?.join(', ') || ''}
              onChange={(e) => setEditedTask({ 
                ...editedTask, 
                tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) 
              })}
              placeholder="design, frontend, urgent"
            />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose} variant="outline" className="gap-2">
            <X className="w-4 h-4" />
            Cancel
          </Button>
          <Button onClick={handleSave} className="gap-2">
            <Save className="w-4 h-4" />
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}