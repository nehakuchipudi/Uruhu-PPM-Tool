import React from 'react';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { WorkOrder, Person } from '@/types';
import { MapPin, Calendar, Clock, AlertTriangle, ChevronRight, User } from 'lucide-react';

interface WorkOrdersListViewProps {
  workOrders: WorkOrder[];
  people: Person[];
  onWorkOrderClick: (workOrder: WorkOrder) => void;
}

export function WorkOrdersListView({
  workOrders,
  people,
  onWorkOrderClick,
}: WorkOrdersListViewProps) {
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
    <div className="space-y-3">
      {workOrders.map((wo) => (
        <div
          key={wo.id}
          onClick={() => onWorkOrderClick(wo)}
          className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md hover:border-blue-300 cursor-pointer transition-all"
        >
          <div className="flex items-start justify-between gap-4">
            {/* Left side - Main content */}
            <div className="flex-1 min-w-0">
              {/* Header row */}
              <div className="flex items-center gap-3 mb-2">
                {getPriorityIcon(wo.priority)}
                <span className="text-xs font-mono text-gray-500">#{wo.id}</span>
                <Badge className={getStatusColor(wo.status)}>
                  {wo.status.replace('-', ' ')}
                </Badge>
                <Badge variant="outline" className={getPriorityColor(wo.priority)}>
                  {wo.priority}
                </Badge>
              </div>

              {/* Title */}
              <h3 className="font-semibold text-gray-900 mb-1">{wo.title}</h3>

              {/* Customer */}
              <p className="text-sm text-gray-600 mb-3">{wo.customerName}</p>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>
                    {new Date(wo.scheduledDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                  {wo.scheduledTime && (
                    <>
                      <Clock className="w-4 h-4 text-gray-400 ml-2" />
                      <span>{wo.scheduledTime}</span>
                    </>
                  )}
                </div>

                {wo.assignedTo.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <User className="w-4 h-4 text-gray-400" />
                    <span>{getTechnicianName(wo.assignedTo[0])}</span>
                    {wo.assignedTo.length > 1 && (
                      <span className="text-xs text-gray-500">
                        +{wo.assignedTo.length - 1} more
                      </span>
                    )}
                  </div>
                )}

                {wo.location && (
                  <div className="col-span-2 flex items-start gap-2 text-sm text-gray-700">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-1">{wo.location}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right side - Arrow */}
            <div className="flex-shrink-0">
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}