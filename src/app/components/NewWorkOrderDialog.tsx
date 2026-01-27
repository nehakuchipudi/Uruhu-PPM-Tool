import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { WorkOrder, Project, Person, Role } from '@/types';
import { Calendar, Clock, MapPin, User, AlertCircle } from 'lucide-react';
import { Badge } from '@/app/components/ui/badge';

interface NewWorkOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (workOrder: Omit<WorkOrder, 'id'>) => void;
  projects: Project[];
  people: Person[];
  roles: Role[];
  instanceId: string;
}

export function NewWorkOrderDialog({
  open,
  onOpenChange,
  onSubmit,
  projects,
  people,
  roles,
  instanceId,
}: NewWorkOrderDialogProps) {
  const [formData, setFormData] = useState({
    projectId: '',
    title: '',
    description: '',
    customerName: '',
    status: 'draft' as WorkOrder['status'],
    priority: 'medium' as WorkOrder['priority'],
    location: '',
    scheduledDate: new Date().toISOString().split('T')[0],
    scheduledTime: '09:00',
    estimatedDuration: 4,
    activityLevel: 'medium' as WorkOrder['activityLevel'],
    assignedTo: [] as string[],
    assignedRoles: [] as string[],
    isRecurring: false,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: { [key: string]: string } = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.projectId) newErrors.projectId = 'Project is required';
    if (!formData.customerName.trim()) newErrors.customerName = 'Customer name is required';
    if (!formData.scheduledDate) newErrors.scheduledDate = 'Scheduled date is required';
    if (formData.estimatedDuration <= 0) newErrors.estimatedDuration = 'Duration must be greater than 0';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const selectedProject = projects.find(p => p.id === formData.projectId);
    
    const newWorkOrder: Omit<WorkOrder, 'id'> = {
      projectId: formData.projectId,
      instanceId: instanceId,
      customerName: formData.customerName || selectedProject?.customerName || '',
      title: formData.title,
      description: formData.description,
      status: formData.status,
      priority: formData.priority,
      location: formData.location,
      assignedTo: formData.assignedTo,
      assignedRoles: formData.assignedRoles,
      scheduledDate: formData.scheduledDate,
      scheduledTime: formData.scheduledTime,
      activityLevel: formData.activityLevel,
      estimatedDuration: formData.estimatedDuration,
      isRecurring: formData.isRecurring,
    };

    onSubmit(newWorkOrder);
    
    // Reset form
    setFormData({
      projectId: '',
      title: '',
      description: '',
      customerName: '',
      status: 'draft',
      priority: 'medium',
      location: '',
      scheduledDate: new Date().toISOString().split('T')[0],
      scheduledTime: '09:00',
      estimatedDuration: 4,
      activityLevel: 'medium',
      assignedTo: [],
      assignedRoles: [],
      isRecurring: false,
    });
    setErrors({});
    onOpenChange(false);
  };

  const handleProjectChange = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    setFormData({
      ...formData,
      projectId,
      customerName: project?.customerName || '',
    });
  };

  const toggleAssignedPerson = (personId: string) => {
    setFormData({
      ...formData,
      assignedTo: formData.assignedTo.includes(personId)
        ? formData.assignedTo.filter(id => id !== personId)
        : [...formData.assignedTo, personId],
    });
  };

  const toggleAssignedRole = (roleId: string) => {
    setFormData({
      ...formData,
      assignedRoles: formData.assignedRoles.includes(roleId)
        ? formData.assignedRoles.filter(id => id !== roleId)
        : [...formData.assignedRoles, roleId],
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="text-2xl">Create New Work Order</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Selection */}
          <div className="space-y-2">
            <Label htmlFor="project">Project *</Label>
            <Select value={formData.projectId} onValueChange={handleProjectChange}>
              <SelectTrigger id="project" className={errors.projectId ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map(project => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name} - {project.customerName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.projectId && <p className="text-sm text-red-500">{errors.projectId}</p>}
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="title">Work Order Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Weekly Lawn Mowing"
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerName">Customer Name *</Label>
              <Input
                id="customerName"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                placeholder="Customer name"
                className={errors.customerName ? 'border-red-500' : ''}
              />
              {errors.customerName && <p className="text-sm text-red-500">{errors.customerName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Work location"
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the work to be done..."
              rows={3}
            />
          </div>

          {/* Schedule Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scheduledDate">Scheduled Date *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="scheduledDate"
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                  className={`pl-9 ${errors.scheduledDate ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.scheduledDate && <p className="text-sm text-red-500">{errors.scheduledDate}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="scheduledTime">Scheduled Time</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="scheduledTime"
                  type="time"
                  value={formData.scheduledTime}
                  onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimatedDuration">Estimated Duration (hours) *</Label>
              <Input
                id="estimatedDuration"
                type="number"
                min="0.5"
                step="0.5"
                value={formData.estimatedDuration}
                onChange={(e) => setFormData({ ...formData, estimatedDuration: parseFloat(e.target.value) })}
                className={errors.estimatedDuration ? 'border-red-500' : ''}
              />
              {errors.estimatedDuration && <p className="text-sm text-red-500">{errors.estimatedDuration}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="activityLevel">Activity Level</Label>
              <Select 
                value={formData.activityLevel} 
                onValueChange={(value: WorkOrder['activityLevel']) => setFormData({ ...formData, activityLevel: value })}
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

          {/* Priority and Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select 
                value={formData.priority} 
                onValueChange={(value: WorkOrder['priority']) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger id="priority">
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

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value: WorkOrder['status']) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Assignment */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Assign to People
              </Label>
              <div className="flex flex-wrap gap-2">
                {people.map(person => (
                  <Badge
                    key={person.id}
                    variant={formData.assignedTo.includes(person.id) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleAssignedPerson(person.id)}
                  >
                    {person.name}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Assign to Roles
              </Label>
              <div className="flex flex-wrap gap-2">
                {roles.map(role => (
                  <Badge
                    key={role.id}
                    variant={formData.assignedRoles.includes(role.id) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    style={{
                      backgroundColor: formData.assignedRoles.includes(role.id) ? role.color : 'transparent',
                      color: formData.assignedRoles.includes(role.id) ? 'white' : role.color,
                      borderColor: role.color,
                    }}
                    onClick={() => toggleAssignedRole(role.id)}
                  >
                    {role.name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Create Work Order
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}