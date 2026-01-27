import { useState, useRef } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Textarea } from '@/app/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/app/components/ui/dialog';
import { 
  Clock, 
  CheckCircle2, 
  Calendar, 
  MapPin, 
  Camera,
  Upload,
  PlayCircle,
  StopCircle,
  AlertCircle,
  FileText,
  User,
  Users
} from 'lucide-react';
import { WorkOrder, Person, TimeEntry, Role, Project } from '@/types';
import { toast } from 'sonner';

interface EmployeePortalProps {
  people: Person[];
  roles: Role[];
  workOrders: WorkOrder[];
  projects: Project[];
}

export function EmployeePortal({
  people,
  roles,
  workOrders,
  projects,
}: EmployeePortalProps) {
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(people[0] || null);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
  const [completionNotes, setCompletionNotes] = useState('');
  const [completionPhotos, setCompletionPhotos] = useState<string[]>([]);
  const [clockOutNotes, setClockOutNotes] = useState('');
  const [showClockOutDialog, setShowClockOutDialog] = useState(false);
  const [currentTimeEntry, setCurrentTimeEntry] = useState<TimeEntry | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!selectedPerson) {
    return (
      <Card className="p-12 text-center">
        <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600">No employees available</p>
      </Card>
    );
  }

  const assignedWorkOrders = workOrders.filter(wo => 
    wo.assignedTo.includes(selectedPerson.id) && 
    (wo.status === 'scheduled' || wo.status === 'in-progress')
  );

  const handleClockIn = (timeEntry: Omit<TimeEntry, 'id'>) => {
    const newEntry: TimeEntry = {
      ...timeEntry,
      id: `te-${Date.now()}`,
    };
    setCurrentTimeEntry(newEntry);
    toast.success('Clocked in successfully');
  };

  const handleClockOut = (timeEntryId: string, notes: string) => {
    setCurrentTimeEntry(undefined);
    toast.success('Clocked out successfully');
  };

  const handleCompleteWork = (workOrderId: string, photos: string[], notes: string) => {
    // In production, would update work order status
    toast.success('Work submitted for approval');
  };

  const handleClockInClick = () => {
    if (currentTimeEntry) {
      toast.error('You are already clocked in');
      return;
    }

    handleClockIn({
      personId: selectedPerson.id,
      instanceId: selectedPerson.instanceId,
      clockInTime: new Date().toISOString(),
      location: undefined, // In production, would use geolocation
    });
  };

  const handleClockOutClick = () => {
    if (!currentTimeEntry) {
      toast.error('You are not clocked in');
      return;
    }
    setShowClockOutDialog(true);
  };

  const handleClockOutConfirm = () => {
    if (!currentTimeEntry) return;

    handleClockOut(currentTimeEntry.id, clockOutNotes);
    setClockOutNotes('');
    setShowClockOutDialog(false);
  };

  const handlePhotoCapture = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // In production, would upload to server/cloud storage
    // For now, create data URLs for demo
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setCompletionPhotos(prev => [...prev, result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleCompleteWorkClick = () => {
    if (!selectedWorkOrder) return;

    if (completionPhotos.length === 0) {
      toast.error('Please add at least one photo to complete the work');
      return;
    }

    handleCompleteWork(selectedWorkOrder.id, completionPhotos, completionNotes);
    setSelectedWorkOrder(null);
    setCompletionPhotos([]);
    setCompletionNotes('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-500';
      case 'in-progress':
        return 'bg-amber-500';
      case 'completed':
        return 'bg-emerald-500';
      case 'pending-approval':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const getCurrentShiftDuration = () => {
    if (!currentTimeEntry) return '0h 0m';
    
    const start = new Date(currentTimeEntry.clockInTime);
    const now = new Date();
    const diff = now.getTime() - start.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="space-y-6">
      {/* Employee Selector */}
      {people.length > 1 && (
        <Card className="p-4">
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Select Employee
          </label>
          <select
            value={selectedPerson.id}
            onChange={(e) => {
              const person = people.find(p => p.id === e.target.value);
              setSelectedPerson(person || null);
              setCurrentTimeEntry(undefined); // Reset time entry when switching employees
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {people.map(person => (
              <option key={person.id} value={person.id}>
                {person.name} - {person.role}
              </option>
            ))}
          </select>
        </Card>
      )}

      {/* Employee Header */}
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {selectedPerson.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">{selectedPerson.name}</h2>
              <p className="text-gray-600">{selectedPerson.role}</p>
              <p className="text-sm text-gray-500">{selectedPerson.email}</p>
            </div>
          </div>

          {/* Clock In/Out */}
          <div className="flex flex-col items-end gap-2">
            {currentTimeEntry ? (
              <>
                <div className="flex items-center gap-2 text-emerald-600">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="font-medium">Clocked In</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{getCurrentShiftDuration()}</div>
                <Button 
                  onClick={handleClockOutClick} 
                  variant="destructive"
                  size="lg"
                  className="gap-2"
                >
                  <StopCircle className="w-5 h-5" />
                  Clock Out
                </Button>
              </>
            ) : (
              <>
                <div className="text-gray-500 text-sm mb-2">Not clocked in</div>
                <Button 
                  onClick={handleClockInClick} 
                  size="lg"
                  className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                >
                  <PlayCircle className="w-5 h-5" />
                  Clock In
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* My Assigned Work Orders */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">My Assigned Work Orders</h3>
        
        {assignedWorkOrders.length === 0 ? (
          <Card className="p-12 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No work orders assigned at the moment</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assignedWorkOrders.map(wo => (
              <Card key={wo.id} className="p-5 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getStatusColor(wo.status)}>
                        {wo.status}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {wo.activityLevel} activity
                      </Badge>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">{wo.title}</h4>
                    <p className="text-sm text-gray-600 mb-3">{wo.description}</p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FileText className="w-4 h-4" />
                    <span>{wo.customerName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(wo.scheduledDate)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{wo.estimatedDuration} hours estimated</span>
                  </div>
                </div>

                <Button
                  onClick={() => setSelectedWorkOrder(wo)}
                  className="w-full gap-2"
                  variant={wo.status === 'in-progress' ? 'default' : 'outline'}
                >
                  {wo.status === 'in-progress' ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Complete Work
                    </>
                  ) : (
                    <>
                      <PlayCircle className="w-4 h-4" />
                      View Details
                    </>
                  )}
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Work Completion Dialog */}
      <Dialog open={!!selectedWorkOrder} onOpenChange={() => setSelectedWorkOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Complete Work Order</DialogTitle>
            <DialogDescription>
              Add photos and notes about the completed work
            </DialogDescription>
          </DialogHeader>

          {selectedWorkOrder && (
            <div className="space-y-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">{selectedWorkOrder.title}</h4>
                <p className="text-sm text-gray-600">{selectedWorkOrder.description}</p>
              </div>

              {/* Photo Capture Section */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  Completion Photos *
                </label>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  capture="environment"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <div className="grid grid-cols-3 gap-3 mb-3">
                  {completionPhotos.map((photo, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
                      <img src={photo} alt={`Completion ${index + 1}`} className="w-full h-full object-cover" />
                      <button
                        onClick={() => setCompletionPhotos(prev => prev.filter((_, i) => i !== index))}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={handlePhotoCapture}
                  variant="outline"
                  className="w-full gap-2"
                >
                  <Camera className="w-4 h-4" />
                  {completionPhotos.length === 0 ? 'Add Photos' : 'Add More Photos'}
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                  At least one photo is required to complete work
                </p>
              </div>

              {/* Notes Section */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Completion Notes (Optional)
                </label>
                <Textarea
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  placeholder="Add any notes about the work completed, issues encountered, or additional information..."
                  rows={4}
                  className="w-full"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  onClick={() => setSelectedWorkOrder(null)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCompleteWorkClick}
                  disabled={completionPhotos.length === 0}
                  className="flex-1 gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Submit for Approval
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Clock Out Dialog */}
      <Dialog open={showClockOutDialog} onOpenChange={setShowClockOutDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clock Out</DialogTitle>
            <DialogDescription>
              Add any notes about your shift before clocking out
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Shift Duration</div>
              <div className="text-2xl font-bold text-gray-900">{getCurrentShiftDuration()}</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Shift Notes (Optional)
              </label>
              <Textarea
                value={clockOutNotes}
                onChange={(e) => setClockOutNotes(e.target.value)}
                placeholder="Add notes about your shift, tasks completed, or any issues..."
                rows={4}
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setShowClockOutDialog(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleClockOutConfirm}
                variant="destructive"
                className="flex-1 gap-2"
              >
                <StopCircle className="w-4 h-4" />
                Clock Out
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
