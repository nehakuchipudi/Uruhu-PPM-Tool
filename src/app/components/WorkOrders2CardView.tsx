import React from 'react';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { WorkOrder, Person } from '@/types';
import {
  Calendar,
  MapPin,
  User,
  Clock,
  AlertTriangle,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';

interface WorkOrdersCardViewProps {
  workOrders: WorkOrder[];
  people: Person[];
  onWorkOrderClick: (workOrder: WorkOrder) => void;
}

export function WorkOrdersCardView({
  workOrders,
  people,
  onWorkOrderClick,
}: WorkOrdersCardViewProps) {
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

  const getPriorityIcon = (priority: WorkOrder['priority']) => {
    if (priority === 'critical') {
      return <AlertTriangle className="w-4 h-4 text-red-600" />;
    }
    return null;
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {workOrders.map((wo) => (
        <Card
          key={wo.id}
          className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => onWorkOrderClick(wo)}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              {getPriorityIcon(wo.priority)}
              <span className="text-xs font-mono text-gray-500">#{wo.id}</span>
            </div>
            <Badge className={getStatusColor(wo.status)}>
              {wo.status.replace('-', ' ')}
            </Badge>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{wo.title}</h3>

          {/* Customer */}
          <p className="text-sm text-gray-600 mb-3">{wo.customerName}</p>

          {/* Details */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>
                {new Date(wo.scheduledDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
              {wo.scheduledTime && (
                <>
                  <Clock className="w-4 h-4 text-gray-400 ml-2" />
                  <span>{wo.scheduledTime}</span>
                </>
              )}
            </div>

            {wo.location && (
              <div className="flex items-start gap-2 text-sm text-gray-700">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <span className="line-clamp-1">{wo.location}</span>
              </div>
            )}

            {wo.assignedTo.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <User className="w-4 h-4 text-gray-400" />
                <span>{getTechnicianName(wo.assignedTo[0])}</span>
                {wo.assignedTo.length > 1 && (
                  <span className="text-xs text-gray-500">+{wo.assignedTo.length - 1}</span>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-200">
            <Badge variant="outline" className={getPriorityColor(wo.priority)}>
              {wo.priority}
            </Badge>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </Card>
      ))}
    </div>
  );
}