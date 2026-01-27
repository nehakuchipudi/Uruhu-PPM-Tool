import React from 'react';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { WorkOrder, Person } from '@/types';
import { MapPin, Calendar, Clock, AlertTriangle, ChevronRight } from 'lucide-react';

interface WorkOrdersTableViewProps {
  workOrders: WorkOrder[];
  people: Person[];
  onWorkOrderClick: (workOrder: WorkOrder) => void;
}

export function WorkOrdersTableView({
  workOrders,
  people,
  onWorkOrderClick,
}: WorkOrdersTableViewProps) {
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
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                Work Order
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                Title & Customer
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                Scheduled
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                Location
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                Assigned To
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                Priority
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                Status
              </th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {workOrders.map((wo) => (
              <tr
                key={wo.id}
                onClick={() => onWorkOrderClick(wo)}
                className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    {getPriorityIcon(wo.priority)}
                    <span className="text-sm font-mono font-medium text-gray-900">
                      #{wo.id}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900 line-clamp-1">{wo.title}</p>
                    <p className="text-xs text-gray-600">{wo.customerName}</p>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <div>
                      <div>
                        {new Date(wo.scheduledDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                      {wo.scheduledTime && (
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {wo.scheduledTime}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  {wo.location && (
                    <div className="flex items-start gap-2 text-sm text-gray-700">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2 max-w-xs">{wo.location}</span>
                    </div>
                  )}
                </td>
                <td className="py-3 px-4">
                  {wo.assignedTo.length > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-medium">
                        {getTechnicianName(wo.assignedTo[0]).charAt(0)}
                      </div>
                      <div>
                        <span className="text-sm text-gray-900">
                          {getTechnicianName(wo.assignedTo[0])}
                        </span>
                        {wo.assignedTo.length > 1 && (
                          <span className="text-xs text-gray-500 ml-1">
                            +{wo.assignedTo.length - 1}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </td>
                <td className="py-3 px-4">
                  <Badge variant="outline" className={getPriorityColor(wo.priority)}>
                    {wo.priority}
                  </Badge>
                </td>
                <td className="py-3 px-4">
                  <Badge className={getStatusColor(wo.status)}>
                    {wo.status.replace('-', ' ')}
                  </Badge>
                </td>
                <td className="py-3 px-4 text-right">
                  <ChevronRight className="w-5 h-5 text-gray-400 inline-block" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}