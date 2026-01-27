import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Label } from '@/app/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { Project, Person, Role, RecurringTask } from '@/types';
import { Calendar, Repeat, User, Clock } from 'lucide-react';

interface NewRecurringJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (job: Omit<RecurringTask, 'id' | 'nextOccurrence' | 'completionHistory'>) => void;
  projects: Project[];
  people: Person[];
  roles: Role[];
  instanceId: string;
}

export function NewRecurringJobDialog({
  open,
  onOpenChange,
  onSubmit,
  projects,
  people,
  roles,
  instanceId,
}: NewRecurringJobDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState<string>('');
  const [customerName, setCustomerName] = useState('');
  const [frequency, setFrequency] = useState<RecurringTask['frequency']>('weekly');
  const [frequencyDetails, setFrequencyDetails] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [assignedTo, setAssignedTo] = useState<string[]>([]);
  const [assignedRoles, setAssignedRoles] = useState<string[]>([]);
  const [estimatedDuration, setEstimatedDuration] = useState('2');
  const [activityLevel, setActivityLevel] = useState<'low' | 'medium' | 'high'>('medium');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedProject = projects.find((p) => p.id === projectId);

    onSubmit({
      instanceId,
      projectId: projectId || undefined,
      customerName: customerName || selectedProject?.customer || '',
      title,
      description,
      frequency,
      frequencyDetails: frequencyDetails || undefined,
      startDate,
      endDate: endDate || undefined,
      assignedTo,
      assignedRoles,
      estimatedDuration: parseFloat(estimatedDuration),
      activityLevel,
    });

    // Reset form
    setTitle('');
    setDescription('');
    setProjectId('');
    setCustomerName('');
    setFrequency('weekly');
    setFrequencyDetails('');
    setStartDate('');
    setEndDate('');
    setAssignedTo([]);
    setAssignedRoles([]);
    setEstimatedDuration('2');
    setActivityLevel('medium');
    onOpenChange(false);
  };

  const handleProjectChange = (value: string) => {
    setProjectId(value);
    const project = projects.find((p) => p.id === value);
    if (project) {
      setCustomerName(project.customer);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Repeat className="w-5 h-5 text-blue-600" />
            Create New Recurring Job
          </DialogTitle>
          <DialogDescription>
            Set up a recurring job that will automatically generate work orders based on your schedule.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 uppercase">Basic Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="title">Job Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Weekly HVAC Maintenance"
                  required
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the recurring job tasks..."
                  rows={3}
                  required
                />
              </div>

              <div>
                <Label htmlFor="project">Project (Optional)</Label>
                <Select value={projectId} onValueChange={handleProjectChange}>
                  <SelectTrigger id="project">
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Project</SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="customer">Customer Name *</Label>
                <Input
                  id="customer"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Customer or client name"
                  required
                />
              </div>
            </div>
          </div>

          {/* Recurrence Settings */}
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 uppercase flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Recurrence Settings
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="frequency">Frequency *</Label>
                <Select
                  value={frequency}
                  onValueChange={(v: any) => setFrequency(v)}
                >
                  <SelectTrigger id="frequency">
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
                <Label htmlFor="frequencyDetails">Frequency Details</Label>
                <Input
                  id="frequencyDetails"
                  value={frequencyDetails}
                  onChange={(e) => setFrequencyDetails(e.target.value)}
                  placeholder="e.g., Every Monday and Friday"
                />
              </div>

              <div>
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="endDate">End Date (Optional)</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Assignment & Duration */}
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 uppercase flex items-center gap-2">
              <User className="w-4 h-4" />
              Assignment & Duration
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="assignedPerson">Assign to Person</Label>
                <Select
                  value={assignedTo[0] || ''}
                  onValueChange={(v) => setAssignedTo(v ? [v] : [])}
                >
                  <SelectTrigger id="assignedPerson">
                    <SelectValue placeholder="Select a person" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Unassigned</SelectItem>
                    {people.map((person) => (
                      <SelectItem key={person.id} value={person.id}>
                        {person.name} - {person.role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="assignedRole">Assign to Role</Label>
                <Select
                  value={assignedRoles[0] || ''}
                  onValueChange={(v) => setAssignedRoles(v ? [v] : [])}
                >
                  <SelectTrigger id="assignedRole">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No Role</SelectItem>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="estimatedDuration" className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Estimated Duration (hours) *
                </Label>
                <Input
                  id="estimatedDuration"
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={estimatedDuration}
                  onChange={(e) => setEstimatedDuration(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="activityLevel">Activity Level</Label>
                <Select
                  value={activityLevel}
                  onValueChange={(v: any) => setActivityLevel(v)}
                >
                  <SelectTrigger id="activityLevel">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              <Repeat className="w-4 h-4 mr-2" />
              Create Recurring Job
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
