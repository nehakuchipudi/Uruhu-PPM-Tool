import { WorkOrder, Person, Role } from '@/types';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Textarea } from '@/app/components/ui/textarea';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { useState, useRef } from 'react';
import {
  X,
  Calendar,
  Clock,
  Users,
  Activity,
  Camera,
  Upload,
  Trash2,
  CheckCircle2,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

interface WorkOrderCompletionModalProps {
  workOrder: WorkOrder;
  people: Person[];
  roles: Role[];
  onClose: () => void;
  onComplete: (
    workOrderId: string,
    status: WorkOrder['status'],
    photos: string[],
    notes: string,
    actualDuration: number
  ) => void;
}

export function WorkOrderCompletionModal({
  workOrder,
  people,
  roles,
  onClose,
  onComplete,
}: WorkOrderCompletionModalProps) {
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>(
    workOrder.completionPhotos || []
  );
  const [completionNotes, setCompletionNotes] = useState(
    workOrder.approvalNotes || ''
  );
  const [actualDuration, setActualDuration] = useState(
    workOrder.actualDuration || workOrder.estimatedDuration
  );
  const [selectedStatus, setSelectedStatus] = useState<WorkOrder['status']>(
    workOrder.status === 'scheduled' ? 'in-progress' : workOrder.status
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const assignedPeople = people.filter((p) =>
    workOrder.assignedTo.includes(p.id)
  );
  const assignedRoleObjs = roles.filter((r) =>
    workOrder.assignedRoles.includes(r.id)
  );

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    // Convert files to data URLs for preview
    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const dataUrl = reader.result as string;
          setUploadedPhotos((prev) => [...prev, dataUrl]);
        };
        reader.readAsDataURL(file);
      } else {
        toast.error('Please upload only image files');
      }
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = (index: number) => {
    setUploadedPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (selectedStatus === 'completed' || selectedStatus === 'pending-approval') {
      if (uploadedPhotos.length === 0) {
        toast.error('Please upload at least one photo before completing');
        return;
      }
      if (!completionNotes.trim()) {
        toast.error('Please add completion notes');
        return;
      }
    }

    onComplete(
      workOrder.id,
      selectedStatus,
      uploadedPhotos,
      completionNotes,
      actualDuration
    );
    toast.success(
      selectedStatus === 'pending-approval'
        ? 'Work order submitted for approval'
        : selectedStatus === 'completed'
        ? 'Work order marked as completed'
        : 'Work order status updated'
    );
    onClose();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-500';
      case 'in-progress':
        return 'bg-blue-500';
      case 'pending-approval':
        return 'bg-amber-500';
      case 'scheduled':
        return 'bg-purple-500';
      case 'draft':
        return 'bg-gray-400';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getActivityColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'text-red-600 bg-red-50';
      case 'medium':
        return 'text-amber-600 bg-amber-50';
      case 'low':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const statusOptions: { value: WorkOrder['status']; label: string; description: string }[] = [
    {
      value: 'in-progress',
      label: 'In Progress',
      description: 'Currently working on this task',
    },
    {
      value: 'pending-approval',
      label: 'Submit for Approval',
      description: 'Work is done, requires supervisor review',
    },
    {
      value: 'completed',
      label: 'Mark Complete',
      description: 'Finalize without approval (admin only)',
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl bg-white max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle2 className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-semibold text-gray-900">
                Complete Work Order
              </h2>
            </div>
            <p className="text-gray-600">{workOrder.title}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 -mr-2 -mt-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Work Order Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="font-medium">Scheduled Date:</span>
                </div>
                <p className="text-sm text-gray-900 ml-6">
                  {new Date(workOrder.scheduledDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <Activity className="w-4 h-4" />
                  <span className="font-medium">Activity Level:</span>
                </div>
                <span
                  className={`ml-6 text-xs px-2 py-1 rounded-full font-medium ${getActivityColor(
                    workOrder.activityLevel
                  )}`}
                >
                  {workOrder.activityLevel.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="mb-3">
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-medium">Description:</span>
              </p>
              <p className="text-sm text-gray-900">{workOrder.description}</p>
            </div>

            <div className="mb-3">
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-medium">Client:</span>
              </p>
              <p className="text-sm text-gray-900">{workOrder.customerName}</p>
            </div>

            {assignedPeople.length > 0 && (
              <div className="mb-3">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <Users className="w-4 h-4" />
                  <span className="font-medium">Assigned Team:</span>
                </div>
                <div className="flex flex-wrap gap-2 ml-6">
                  {assignedPeople.map((person) => (
                    <div
                      key={person.id}
                      className="flex items-center gap-2 px-3 py-1 bg-white border border-gray-200 rounded-full"
                    >
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 text-xs font-medium">
                        {person.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </div>
                      <span className="text-sm text-gray-700">{person.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {assignedRoleObjs.length > 0 && (
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">Required Roles:</span>
                </p>
                <div className="flex flex-wrap gap-2 ml-6">
                  {assignedRoleObjs.map((role) => (
                    <Badge
                      key={role.id}
                      variant="outline"
                      style={{ borderColor: role.color, color: role.color }}
                    >
                      {role.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Status Selection */}
          <div className="mb-6">
            <Label className="text-base font-semibold mb-3 block">
              Update Status
            </Label>
            <div className="grid grid-cols-1 gap-3">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedStatus(option.value)}
                  className={`text-left p-4 border-2 rounded-lg transition-all ${
                    selectedStatus === option.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center ${
                        selectedStatus === option.value
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                      }`}
                    >
                      {selectedStatus === option.value && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 mb-1">
                        {option.label}
                      </p>
                      <p className="text-sm text-gray-600">
                        {option.description}
                      </p>
                    </div>
                    <Badge className={`${getStatusColor(option.value)} text-white border-0`}>
                      {option.value}
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Actual Duration */}
          <div className="mb-6">
            <Label htmlFor="duration" className="text-base font-semibold mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Actual Duration (hours)
            </Label>
            <Input
              id="duration"
              type="number"
              step="0.5"
              min="0"
              value={actualDuration}
              onChange={(e) => setActualDuration(parseFloat(e.target.value) || 0)}
              className="max-w-xs"
            />
            {workOrder.estimatedDuration && (
              <p className="text-sm text-gray-500 mt-1">
                Estimated: {workOrder.estimatedDuration}h
                {actualDuration !== workOrder.estimatedDuration && (
                  <span
                    className={`ml-2 font-medium ${
                      actualDuration > workOrder.estimatedDuration
                        ? 'text-red-600'
                        : 'text-emerald-600'
                    }`}
                  >
                    ({actualDuration > workOrder.estimatedDuration ? '+' : ''}
                    {(actualDuration - workOrder.estimatedDuration).toFixed(1)}h)
                  </span>
                )}
              </p>
            )}
          </div>

          {/* Photo Upload */}
          <div className="mb-6">
            <Label className="text-base font-semibold mb-3 flex items-center gap-2">
              <Camera className="w-4 h-4" />
              Completion Photos
              {(selectedStatus === 'completed' || selectedStatus === 'pending-approval') && (
                <span className="text-red-600 text-sm">*Required</span>
              )}
            </Label>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                className="hidden"
                id="photo-upload"
              />
              <label
                htmlFor="photo-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <Upload className="w-12 h-12 text-gray-400 mb-3" />
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Click to upload photos
                </p>
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF up to 10MB each
                </p>
              </label>
            </div>

            {uploadedPhotos.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-4">
                {uploadedPhotos.map((photo, index) => (
                  <div
                    key={index}
                    className="relative group border border-gray-200 rounded-lg overflow-hidden"
                  >
                    <img
                      src={photo}
                      alt={`Completion photo ${index + 1}`}
                      className="w-full h-40 object-cover"
                    />
                    <button
                      onClick={() => handleRemovePhoto(index)}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      Photo {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Completion Notes */}
          <div className="mb-6">
            <Label htmlFor="notes" className="text-base font-semibold mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Completion Notes
              {(selectedStatus === 'completed' || selectedStatus === 'pending-approval') && (
                <span className="text-red-600 text-sm">*Required</span>
              )}
            </Label>
            <Textarea
              id="notes"
              value={completionNotes}
              onChange={(e) => setCompletionNotes(e.target.value)}
              placeholder="Describe the work completed, any issues encountered, materials used, etc."
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Warning for pending approval */}
          {selectedStatus === 'pending-approval' && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-900 mb-1">
                  Approval Required
                </p>
                <p className="text-sm text-amber-700">
                  This work order will be sent to your supervisor for review.
                  Make sure all photos and notes are complete before submitting.
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="gap-2">
              <CheckCircle2 className="w-4 h-4" />
              {selectedStatus === 'pending-approval'
                ? 'Submit for Approval'
                : selectedStatus === 'completed'
                ? 'Mark Complete'
                : 'Update Status'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}