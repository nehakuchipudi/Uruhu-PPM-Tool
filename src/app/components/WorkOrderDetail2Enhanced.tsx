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
import { WorkOrder, Person, Role, Project } from '@/types';
import {
  ArrowLeft,
  Edit,
  MoreVertical,
  MapPin,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  ExternalLink,
  Paperclip,
  Plus,
  Trash2,
  Save,
  Send,
  FileText,
  CheckCircle2,
  XCircle,
  PlayCircle,
  PauseCircle,
  AlertTriangle,
  Download,
  Eye,
  RefreshCw,
  MessageSquare,
  Upload,
} from 'lucide-react';
import { toast } from 'sonner';

interface WorkOrderDetail2EnhancedProps {
  workOrder: WorkOrder;
  project?: Project;
  people: Person[];
  roles: Role[];
  onBack: () => void;
  onUpdate: (updatedWorkOrder: Partial<WorkOrder>) => void;
}

interface Appointment {
  id: string;
  date: string;
  timeWindow: string;
  technicianId: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}

interface EstimateLineItem {
  id: string;
  name: string;
  quantity: number;
  rate: number;
  total: number;
}

interface Invoice {
  id: string;
  date: string;
  status: 'draft' | 'sent' | 'paid';
  amount: number;
  balanceDue: number;
}

export function WorkOrderDetail2Enhanced({
  workOrder: initialWorkOrder,
  project,
  people,
  roles,
  onBack,
  onUpdate,
}: WorkOrderDetail2EnhancedProps) {
  const [workOrder, setWorkOrder] = useState(initialWorkOrder);
  const [isEditing, setIsEditing] = useState(false);
  const [editedDescription, setEditedDescription] = useState(workOrder.description);
  const [editedLocation, setEditedLocation] = useState(workOrder.location || '');
  const [completionNotes, setCompletionNotes] = useState(workOrder.completionNotes || '');

  // Mock data for appointments
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: '1',
      date: workOrder.scheduledDate,
      timeWindow: workOrder.scheduledTime ? `${workOrder.scheduledTime} - 2 hrs` : '9:00 AM - 11:00 AM',
      technicianId: workOrder.assignedTo[0] || '',
      status: 'scheduled',
      notes: 'Initial service call',
    },
  ]);

  // Mock data for estimates
  const [tasks, setTasks] = useState<EstimateLineItem[]>([
    { id: '1', name: 'Service Call', quantity: 1, rate: 150, total: 150 },
    { id: '2', name: 'Labor Hours', quantity: workOrder.estimatedDuration, rate: 85, total: workOrder.estimatedDuration * 85 },
  ]);

  const [materials, setMaterials] = useState<EstimateLineItem[]>([
    { id: '1', name: 'Standard Materials', quantity: 1, rate: 125, total: 125 },
  ]);

  const [equipment, setEquipment] = useState<EstimateLineItem[]>([
    { id: '1', name: 'Equipment Usage', quantity: workOrder.estimatedDuration, rate: 25, total: workOrder.estimatedDuration * 25 },
  ]);

  // Mock data for invoices
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const [attachments, setAttachments] = useState<string[]>([]);

  const getTechnicianName = (id: string) => {
    return people.find((p) => p.id === id)?.name || 'Unknown';
  };

  const getStatusColor = (status: WorkOrder['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-500 text-white';
      case 'in-progress':
        return 'bg-blue-500 text-white';
      case 'scheduled':
        return 'bg-purple-500 text-white';
      case 'pending-approval':
        return 'bg-amber-500 text-white';
      case 'cancelled':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-400 text-white';
    }
  };

  const getPriorityColor = (priority: WorkOrder['priority']) => {
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

  // Calculate estimate totals
  const tasksSubtotal = tasks.reduce((sum, item) => sum + item.total, 0);
  const materialsSubtotal = materials.reduce((sum, item) => sum + item.total, 0);
  const equipmentSubtotal = equipment.reduce((sum, item) => sum + item.total, 0);
  const subtotal = tasksSubtotal + materialsSubtotal + equipmentSubtotal;
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  // Invoice summary
  const totalBilled = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const totalPaid = invoices.reduce((sum, inv) => sum + (inv.amount - inv.balanceDue), 0);
  const balanceDue = totalBilled - totalPaid;

  const handleStatusChange = (newStatus: WorkOrder['status']) => {
    const updatedWorkOrder = { ...workOrder, status: newStatus };
    setWorkOrder(updatedWorkOrder);
    onUpdate({ status: newStatus });
    toast.success(`Status updated to ${newStatus.replace('-', ' ')}`);
  };

  const handlePriorityChange = (newPriority: WorkOrder['priority']) => {
    const updatedWorkOrder = { ...workOrder, priority: newPriority };
    setWorkOrder(updatedWorkOrder);
    onUpdate({ priority: newPriority });
    toast.success(`Priority updated to ${newPriority}`);
  };

  const handleSaveDetails = () => {
    const updates = {
      description: editedDescription,
      location: editedLocation,
    };
    setWorkOrder({ ...workOrder, ...updates });
    onUpdate(updates);
    setIsEditing(false);
    toast.success('Details saved successfully');
  };

  const handleSaveCompletionNotes = () => {
    const updates = { completionNotes };
    setWorkOrder({ ...workOrder, ...updates });
    onUpdate(updates);
    toast.success('Completion notes saved');
  };

  const handleStartWork = () => {
    handleStatusChange('in-progress');
  };

  const handleCompleteWork = () => {
    handleStatusChange('completed');
  };

  const handleCancelWork = () => {
    handleStatusChange('cancelled');
  };

  const getStatusActions = () => {
    switch (workOrder.status) {
      case 'scheduled':
        return (
          <>
            <Button onClick={handleStartWork} className="bg-blue-600 hover:bg-blue-700">
              <PlayCircle className="w-4 h-4 mr-2" />
              Start Work
            </Button>
            <Button variant="outline" onClick={handleCancelWork}>
              <XCircle className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </>
        );
      case 'in-progress':
        return (
          <>
            <Button onClick={handleCompleteWork} className="bg-emerald-600 hover:bg-emerald-700">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Complete Work
            </Button>
            <Button variant="outline" onClick={() => handleStatusChange('scheduled')}>
              <PauseCircle className="w-4 h-4 mr-2" />
              Pause
            </Button>
          </>
        );
      case 'completed':
        return (
          <Button variant="outline" onClick={() => handleStatusChange('in-progress')}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Reopen Work Order
          </Button>
        );
      case 'pending-approval':
        return (
          <>
            <Button onClick={() => handleStatusChange('scheduled')} className="bg-emerald-600 hover:bg-emerald-700">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Approve
            </Button>
            <Button variant="outline" onClick={() => handleStatusChange('cancelled')}>
              <XCircle className="w-4 h-4 mr-2" />
              Reject
            </Button>
          </>
        );
      default:
        return null;
    }
  };

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
              <h1 className="text-3xl font-bold text-gray-900">{workOrder.title}</h1>
              <Badge className={getStatusColor(workOrder.status)}>
                {workOrder.status.replace('-', ' ')}
              </Badge>
              <Badge variant="outline" className={getPriorityColor(workOrder.priority)}>
                {workOrder.priority}
              </Badge>
            </div>
            <p className="text-gray-600">Work Order #{workOrder.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => toast.info('Print functionality coming soon')}>
            <Download className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button variant="outline">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Status Management Section - NEW */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Status Management</h3>
            <p className="text-sm text-gray-600">Update work order status and priority</p>
          </div>
          <div className="flex items-center gap-3">
            {getStatusActions()}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-blue-200">
          <div>
            <label className="text-xs font-medium text-gray-700 mb-2 block">Change Status</label>
            <Select value={workOrder.status} onValueChange={(v: any) => handleStatusChange(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="pending-approval">Pending Approval</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 mb-2 block">Change Priority</label>
            <Select value={workOrder.priority} onValueChange={(v: any) => handlePriorityChange(v)}>
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
        </div>

        {/* Status Timeline */}
        <div className="mt-4 pt-4 border-t border-blue-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Status Timeline</h4>
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
              workOrder.status === 'scheduled' || workOrder.status === 'in-progress' || workOrder.status === 'completed'
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-gray-100 text-gray-400'
            }`}>
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-sm font-medium">Scheduled</span>
            </div>
            <div className="h-0.5 w-8 bg-gray-300" />
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
              workOrder.status === 'in-progress' || workOrder.status === 'completed'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-400'
            }`}>
              <PlayCircle className="w-4 h-4" />
              <span className="text-sm font-medium">In Progress</span>
            </div>
            <div className="h-0.5 w-8 bg-gray-300" />
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
              workOrder.status === 'completed'
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-gray-100 text-gray-400'
            }`}>
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-sm font-medium">Completed</span>
            </div>
          </div>
        </div>
      </Card>

      {/* A. Details Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Work Order Details</h2>
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
              <label className="text-sm font-medium text-gray-700">Work Order ID</label>
              <p className="text-gray-900 font-mono mt-1">#{workOrder.id}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Created Date</label>
              <p className="text-gray-900 mt-1">
                {workOrder.createdAt
                  ? new Date(workOrder.createdAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : 'N/A'}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Scheduled Date & Time
              </label>
              <p className="text-gray-900 mt-1">
                {new Date(workOrder.scheduledDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
                {workOrder.scheduledTime && (
                  <span className="ml-2 text-blue-600">
                    <Clock className="w-4 h-4 inline mr-1" />
                    {workOrder.scheduledTime}
                  </span>
                )}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Service Location
              </label>
              {isEditing ? (
                <Input
                  value={editedLocation}
                  onChange={(e) => setEditedLocation(e.target.value)}
                  className="mt-1"
                />
              ) : (
                <div className="mt-1">
                  <p className="text-gray-900">{workOrder.location || 'No location specified'}</p>
                  {workOrder.location && (
                    <Button variant="link" className="p-0 h-auto mt-1">
                      <ExternalLink className="w-3 h-3 mr-1" />
                      View on Map
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Client Name</label>
              <p className="text-gray-900 mt-1">{workOrder.customerName}</p>
              <p className="text-sm text-gray-600">{project?.name || workOrder.projectName}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <User className="w-4 h-4" />
                Assigned Technician(s)
              </label>
              <div className="mt-2 space-y-2">
                {workOrder.assignedTo.map((techId) => {
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
                })}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Primary Contact</label>
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-900">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <a href="tel:+15555551234" className="hover:text-blue-600">
                    (555) 555-1234
                  </a>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-900">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <a href="mailto:contact@example.com" className="hover:text-blue-600">
                    contact@example.com
                  </a>
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Duration</label>
              <p className="text-gray-900 mt-1">
                {workOrder.duration || `${workOrder.estimatedDuration} hours (estimated)`}
              </p>
            </div>
          </div>
        </div>

        {/* Job Summary */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <label className="text-sm font-medium text-gray-700 block mb-2">Job Summary / Description</label>
          {isEditing ? (
            <Textarea
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
              rows={4}
              className="w-full"
            />
          ) : (
            <p className="text-gray-900 whitespace-pre-wrap">{workOrder.description}</p>
          )}
        </div>

        {/* Attachments */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Paperclip className="w-4 h-4" />
              Attachments ({attachments.length})
            </label>
            <Button variant="outline" size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Add Attachment
            </Button>
          </div>
          {attachments.length > 0 ? (
            <div className="grid grid-cols-3 gap-3">
              {attachments.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700 flex-1 truncate">{file}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Trash2 className="w-3 h-3 text-red-600" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No attachments</p>
          )}
        </div>
      </Card>

      {/* B. Scheduled Appointments Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Scheduled Appointments</h2>
          <div className="flex items-center gap-2">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Appointment
            </Button>
            <Button variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              Calendar View
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                  Date
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                  Time Window
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                  Technician
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                  Status
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                  Notes
                </th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((apt) => (
                <tr key={apt.id} className="border-b border-gray-100">
                  <td className="py-3 px-4 text-sm text-gray-900">
                    {new Date(apt.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900">{apt.timeWindow}</td>
                  <td className="py-3 px-4 text-sm text-gray-900">
                    {getTechnicianName(apt.technicianId)}
                  </td>
                  <td className="py-3 px-4">
                    <Badge
                      className={
                        apt.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-700'
                          : apt.status === 'cancelled'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-blue-100 text-blue-700'
                      }
                    >
                      {apt.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">{apt.notes}</td>
                  <td className="py-3 px-4 text-right">
                    <Button variant="ghost" size="icon">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* C. Estimates Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Estimates</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Save className="w-4 h-4 mr-2" />
              Save Estimate
            </Button>
            <Button>
              <Send className="w-4 h-4 mr-2" />
              Send Estimate
            </Button>
          </div>
        </div>

        <Tabs defaultValue="tasks">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="materials">Materials</TabsTrigger>
            <TabsTrigger value="equipment">Equipment</TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="mt-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-gray-700">Task Items</h4>
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Line Item
                </Button>
              </div>
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-gray-600">
                      Task Name
                    </th>
                    <th className="text-right py-2 px-3 text-xs font-semibold text-gray-600">
                      Qty/Hrs
                    </th>
                    <th className="text-right py-2 px-3 text-xs font-semibold text-gray-600">
                      Rate
                    </th>
                    <th className="text-right py-2 px-3 text-xs font-semibold text-gray-600">
                      Total
                    </th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task) => (
                    <tr key={task.id} className="border-b border-gray-100">
                      <td className="py-2 px-3 text-sm text-gray-900">{task.name}</td>
                      <td className="py-2 px-3 text-sm text-gray-900 text-right">
                        {task.quantity}
                      </td>
                      <td className="py-2 px-3 text-sm text-gray-900 text-right">
                        ${task.rate.toFixed(2)}
                      </td>
                      <td className="py-2 px-3 text-sm font-medium text-gray-900 text-right">
                        ${task.total.toFixed(2)}
                      </td>
                      <td className="py-2 px-3">
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <Trash2 className="w-3 h-3 text-red-600" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={3} className="py-2 px-3 text-sm font-semibold text-gray-700 text-right">
                      Subtotal:
                    </td>
                    <td className="py-2 px-3 text-sm font-bold text-gray-900 text-right">
                      ${tasksSubtotal.toFixed(2)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="materials" className="mt-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-gray-700">Material Items</h4>
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Line Item
                </Button>
              </div>
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-gray-600">
                      Item
                    </th>
                    <th className="text-right py-2 px-3 text-xs font-semibold text-gray-600">
                      Qty
                    </th>
                    <th className="text-right py-2 px-3 text-xs font-semibold text-gray-600">
                      Unit Cost
                    </th>
                    <th className="text-right py-2 px-3 text-xs font-semibold text-gray-600">
                      Total
                    </th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {materials.map((material) => (
                    <tr key={material.id} className="border-b border-gray-100">
                      <td className="py-2 px-3 text-sm text-gray-900">{material.name}</td>
                      <td className="py-2 px-3 text-sm text-gray-900 text-right">
                        {material.quantity}
                      </td>
                      <td className="py-2 px-3 text-sm text-gray-900 text-right">
                        ${material.rate.toFixed(2)}
                      </td>
                      <td className="py-2 px-3 text-sm font-medium text-gray-900 text-right">
                        ${material.total.toFixed(2)}
                      </td>
                      <td className="py-2 px-3">
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <Trash2 className="w-3 h-3 text-red-600" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={3} className="py-2 px-3 text-sm font-semibold text-gray-700 text-right">
                      Subtotal:
                    </td>
                    <td className="py-2 px-3 text-sm font-bold text-gray-900 text-right">
                      ${materialsSubtotal.toFixed(2)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="equipment" className="mt-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-gray-700">Equipment Items</h4>
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Line Item
                </Button>
              </div>
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-gray-600">
                      Equipment Name
                    </th>
                    <th className="text-right py-2 px-3 text-xs font-semibold text-gray-600">
                      Usage Time
                    </th>
                    <th className="text-right py-2 px-3 text-xs font-semibold text-gray-600">
                      Rate
                    </th>
                    <th className="text-right py-2 px-3 text-xs font-semibold text-gray-600">
                      Total
                    </th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {equipment.map((equip) => (
                    <tr key={equip.id} className="border-b border-gray-100">
                      <td className="py-2 px-3 text-sm text-gray-900">{equip.name}</td>
                      <td className="py-2 px-3 text-sm text-gray-900 text-right">
                        {equip.quantity} hrs
                      </td>
                      <td className="py-2 px-3 text-sm text-gray-900 text-right">
                        ${equip.rate.toFixed(2)}
                      </td>
                      <td className="py-2 px-3 text-sm font-medium text-gray-900 text-right">
                        ${equip.total.toFixed(2)}
                      </td>
                      <td className="py-2 px-3">
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <Trash2 className="w-3 h-3 text-red-600" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={3} className="py-2 px-3 text-sm font-semibold text-gray-700 text-right">
                      Subtotal:
                    </td>
                    <td className="py-2 px-3 text-sm font-bold text-gray-900 text-right">
                      ${equipmentSubtotal.toFixed(2)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </TabsContent>
        </Tabs>

        {/* Estimate Summary */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="max-w-md ml-auto space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-700">Subtotal:</span>
              <span className="font-medium text-gray-900">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-700">Tax (8%):</span>
              <span className="font-medium text-gray-900">${tax.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-lg font-bold pt-2 border-t border-gray-200">
              <span className="text-gray-900">Total Estimate:</span>
              <span className="text-blue-600">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* D. Invoices Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Invoices</h2>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Generate Invoice
          </Button>
        </div>

        {/* Invoice Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="p-4 bg-blue-50 border-blue-200">
            <p className="text-xs font-medium text-blue-600 uppercase mb-1">Total Billed</p>
            <p className="text-2xl font-bold text-blue-900">${totalBilled.toFixed(2)}</p>
          </Card>
          <Card className="p-4 bg-emerald-50 border-emerald-200">
            <p className="text-xs font-medium text-emerald-600 uppercase mb-1">Total Paid</p>
            <p className="text-2xl font-bold text-emerald-900">${totalPaid.toFixed(2)}</p>
          </Card>
          <Card className="p-4 bg-amber-50 border-amber-200">
            <p className="text-xs font-medium text-amber-600 uppercase mb-1">Balance Due</p>
            <p className="text-2xl font-bold text-amber-900">${balanceDue.toFixed(2)}</p>
          </Card>
        </div>

        {/* Invoice Table */}
        {invoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                    Invoice ID
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                    Status
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                    Amount
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                    Balance Due
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-gray-100">
                    <td className="py-3 px-4 text-sm font-mono font-medium text-gray-900">
                      {invoice.id}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {new Date(invoice.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        className={
                          invoice.status === 'paid'
                            ? 'bg-emerald-100 text-emerald-700'
                            : invoice.status === 'sent'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }
                      >
                        {invoice.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-gray-900 text-right">
                      ${invoice.amount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-gray-900 text-right">
                      ${invoice.balanceDue.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No invoices generated yet</p>
            <Button variant="outline" className="mt-3">
              <Plus className="w-4 h-4 mr-2" />
              Generate First Invoice
            </Button>
          </div>
        )}
      </Card>

      {/* E. Completion Notes Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Completion Notes
          </h2>
          <Button onClick={handleSaveCompletionNotes}>
            <Save className="w-4 h-4 mr-2" />
            Save Notes
          </Button>
        </div>

        <Textarea
          value={completionNotes}
          onChange={(e) => setCompletionNotes(e.target.value)}
          rows={6}
          placeholder="Add notes about work completed, any issues encountered, recommendations, etc..."
          className="w-full"
        />

        {workOrder.completionNotes && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs font-medium text-gray-500 uppercase mb-2">Previously Saved Notes</p>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{workOrder.completionNotes}</p>
          </div>
        )}
      </Card>
    </div>
  );
}
