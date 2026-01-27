import { useState } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Textarea } from '@/app/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Calendar, 
  User,
  FileText,
  Image as ImageIcon,
  AlertCircle
} from 'lucide-react';
import { WorkOrder, Person, Role } from '@/types';
import { toast } from 'sonner';

interface ApprovalCenterProps {
  workOrders: WorkOrder[];
  people: Person[];
  roles?: Role[];
  currentUser?: Person;
  onApprove?: (workOrderId: string, notes: string) => void;
  onReject?: (workOrderId: string, reason: string) => void;
}

export function ApprovalCenter({
  workOrders,
  people,
  roles = [],
  currentUser,
  onApprove = () => {},
  onReject = () => {},
}: ApprovalCenterProps) {
  // Use first person with approval permissions as default current user if not provided
  const activeUser = currentUser || people.find(p => 
    roles?.find(r => r.id === p.roleId)?.permissions.includes('approve_work')
  ) || people[0];

  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isApproving, setIsApproving] = useState(false);

  // Handle case where no user is available
  if (!activeUser) {
    return (
      <Card className="p-12 text-center">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600">No users available for approvals</p>
      </Card>
    );
  }

  const pendingApprovals = workOrders.filter(wo => 
    wo.status === 'pending-approval' && wo.approvalStatus === 'pending'
  );

  const approvedOrders = workOrders.filter(wo => 
    wo.approvedBy === activeUser.id && wo.approvalStatus === 'approved'
  );

  const rejectedOrders = workOrders.filter(wo => 
    wo.approvedBy === activeUser.id && wo.approvalStatus === 'rejected'
  );

  const getPersonName = (personId: string) => {
    return people.find(p => p.id === personId)?.name || 'Unknown';
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const handleApprove = () => {
    if (!selectedWorkOrder) return;

    onApprove(selectedWorkOrder.id, reviewNotes);
    setSelectedWorkOrder(null);
    setReviewNotes('');
    toast.success('Work order approved successfully');
  };

  const handleReject = () => {
    if (!selectedWorkOrder) return;

    if (!reviewNotes.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    onReject(selectedWorkOrder.id, reviewNotes);
    setSelectedWorkOrder(null);
    setReviewNotes('');
    toast.success('Work order rejected');
  };

  const WorkOrderDetailDialog = ({ workOrder }: { workOrder: WorkOrder }) => (
    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
      <DialogHeader>
        <DialogTitle>Review Work Order</DialogTitle>
      </DialogHeader>

      <div className="space-y-6">
        {/* Work Order Details */}
        <div className="p-4 bg-gray-50 rounded-lg space-y-3">
          <div>
            <h4 className="font-semibold text-gray-900 text-lg">{workOrder.title}</h4>
            <p className="text-sm text-gray-600 mt-1">{workOrder.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-200">
            <div className="flex items-center gap-2 text-sm">
              <FileText className="w-4 h-4 text-gray-400" />
              <div>
                <div className="text-gray-500">Client</div>
                <div className="font-medium text-gray-900">{workOrder.customerName}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-gray-400" />
              <div>
                <div className="text-gray-500">Scheduled</div>
                <div className="font-medium text-gray-900">{formatDate(workOrder.scheduledDate)}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-gray-400" />
              <div>
                <div className="text-gray-500">Completed By</div>
                <div className="font-medium text-gray-900">
                  {workOrder.completedBy ? getPersonName(workOrder.completedBy) : 'N/A'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-gray-400" />
              <div>
                <div className="text-gray-500">Duration</div>
                <div className="font-medium text-gray-900">
                  {workOrder.actualDuration || workOrder.estimatedDuration} hours
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Completion Photos */}
        {workOrder.completionPhotos && workOrder.completionPhotos.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ImageIcon className="w-5 h-5 text-gray-700" />
              <h5 className="font-semibold text-gray-900">Completion Photos</h5>
              <Badge variant="secondary">{workOrder.completionPhotos.length}</Badge>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {workOrder.completionPhotos.map((photo, index) => (
                <a
                  key={index}
                  href={photo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-400 transition-colors"
                >
                  <img 
                    src={photo} 
                    alt={`Completion ${index + 1}`} 
                    className="w-full h-full object-cover"
                  />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Completion Notes */}
        {workOrder.approvalNotes && (
          <div className="p-4 bg-blue-50 rounded-lg">
            <h5 className="font-semibold text-gray-900 mb-2">Completion Notes</h5>
            <p className="text-sm text-gray-700">{workOrder.approvalNotes}</p>
          </div>
        )}

        {/* Review Section (for pending approvals) */}
        {workOrder.approvalStatus === 'pending' && (
          <div>
            <Label className="block text-sm font-medium text-gray-900 mb-2">
              Review Notes {!isApproving && '*'}
            </Label>
            <Textarea
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder={isApproving 
                ? "Add any notes or comments about the approval..." 
                : "Explain what needs to be corrected or redone..."
              }
              rows={4}
              className="w-full"
            />
            {!isApproving && (
              <p className="text-xs text-gray-500 mt-1">
                Required when rejecting work
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        {workOrder.approvalStatus === 'pending' && (
          <div className="flex gap-3 pt-4 border-t">
            <Button
              onClick={() => {
                setIsApproving(false);
                handleReject();
              }}
              variant="destructive"
              className="flex-1 gap-2"
            >
              <XCircle className="w-4 h-4" />
              Reject
            </Button>
            <Button
              onClick={() => {
                setIsApproving(true);
                handleApprove();
              }}
              className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-700"
            >
              <CheckCircle2 className="w-4 h-4" />
              Approve
            </Button>
          </div>
        )}
      </div>
    </DialogContent>
  );

  const WorkOrderCard = ({ workOrder, status }: { workOrder: WorkOrder; status: 'pending' | 'approved' | 'rejected' }) => (
    <Card 
      className="p-5 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => setSelectedWorkOrder(workOrder)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge 
              className={
                status === 'approved' 
                  ? 'bg-emerald-500' 
                  : status === 'rejected' 
                  ? 'bg-red-500' 
                  : 'bg-amber-500'
              }
            >
              {status}
            </Badge>
          </div>
          <h4 className="font-semibold text-gray-900 mb-1">{workOrder.title}</h4>
          <p className="text-sm text-gray-600">{workOrder.customerName}</p>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-gray-600">
          <User className="w-4 h-4" />
          <span>Completed by {workOrder.completedBy ? getPersonName(workOrder.completedBy) : 'Unknown'}</span>
        </div>
        {workOrder.completedDate && (
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(workOrder.completedDate)}</span>
          </div>
        )}
        {workOrder.completionPhotos && (
          <div className="flex items-center gap-2 text-gray-600">
            <ImageIcon className="w-4 h-4" />
            <span>{workOrder.completionPhotos.length} photos attached</span>
          </div>
        )}
      </div>

      <Button
        variant="outline"
        size="sm"
        className="w-full mt-4"
        onClick={(e) => {
          e.stopPropagation();
          setSelectedWorkOrder(workOrder);
        }}
      >
        View Details
      </Button>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Approval Center</h2>
        <p className="text-gray-600">Review and approve completed work orders</p>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="w-4 h-4" />
            Pending
            {pendingApprovals.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {pendingApprovals.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved" className="gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Approved
          </TabsTrigger>
          <TabsTrigger value="rejected" className="gap-2">
            <XCircle className="w-4 h-4" />
            Rejected
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          {pendingApprovals.length === 0 ? (
            <Card className="p-12 text-center">
              <CheckCircle2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No pending approvals</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingApprovals.map(wo => (
                <WorkOrderCard key={wo.id} workOrder={wo} status="pending" />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved" className="mt-6">
          {approvedOrders.length === 0 ? (
            <Card className="p-12 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No approved work orders</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {approvedOrders.map(wo => (
                <WorkOrderCard key={wo.id} workOrder={wo} status="approved" />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="rejected" className="mt-6">
          {rejectedOrders.length === 0 ? (
            <Card className="p-12 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No rejected work orders</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rejectedOrders.map(wo => (
                <WorkOrderCard key={wo.id} workOrder={wo} status="rejected" />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Work Order Detail Dialog */}
      {selectedWorkOrder && (
        <Dialog open={!!selectedWorkOrder} onOpenChange={() => setSelectedWorkOrder(null)}>
          <WorkOrderDetailDialog workOrder={selectedWorkOrder} />
        </Dialog>
      )}
    </div>
  );
}

function Label({ children, className, htmlFor }: { children: React.ReactNode; className?: string; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className={className}>
      {children}
    </label>
  );
}