import React from 'react';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Project, WorkOrder, RecurringTask, Person } from '@/types';
import {
  Calendar,
  Clock,
  User,
  MapPin,
  FileText,
  FolderKanban,
  Repeat,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';

interface WorkItem {
  id: string;
  type: 'project' | 'work-order' | 'recurring-job';
  title: string;
  customer: string;
  status: string;
  priority?: string;
  assignedTo: string[];
  location?: string;
  startDate: string;
  endDate?: string;
  estimatedDuration?: number;
  description?: string;
}

interface WorkSchedule2DayViewProps {
  selectedDate: Date;
  workItems: WorkItem[];
  people: Person[];
  onItemClick: (item: WorkItem) => void;
}

export function WorkSchedule2DayView({
  selectedDate,
  workItems,
  people,
  onItemClick,
}: WorkSchedule2DayViewProps) {
  const getTechnicianName = (id: string) => {
    return people.find((p) => p.id === id)?.name || 'Unknown';
  };

  const getTypeIcon = (type: WorkItem['type']) => {
    switch (type) {
      case 'project':
        return <FolderKanban className="w-4 h-4" />;
      case 'work-order':
        return <FileText className="w-4 h-4" />;
      case 'recurring-job':
        return <Repeat className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: WorkItem['type']) => {
    switch (type) {
      case 'project':
        return 'border-blue-500 text-blue-700 bg-blue-50';
      case 'work-order':
        return 'border-purple-500 text-purple-700 bg-purple-50';
      case 'recurring-job':
        return 'border-green-500 text-green-700 bg-green-50';
    }
  };

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('complet')) return 'bg-emerald-100 text-emerald-700 border-emerald-300';
    if (statusLower.includes('progress') || statusLower.includes('active'))
      return 'bg-blue-100 text-blue-700 border-blue-300';
    if (statusLower.includes('schedul')) return 'bg-cyan-100 text-cyan-700 border-cyan-300';
    if (statusLower.includes('draft') || statusLower.includes('planning'))
      return 'bg-gray-100 text-gray-700 border-gray-300';
    if (statusLower.includes('hold') || statusLower.includes('pause'))
      return 'bg-amber-100 text-amber-700 border-amber-300';
    if (statusLower.includes('cancel')) return 'bg-red-100 text-red-700 border-red-300';
    return 'bg-gray-100 text-gray-700 border-gray-300';
  };

  const getPriorityColor = (priority?: string) => {
    if (!priority) return 'bg-gray-100 text-gray-700';
    const priorityLower = priority.toLowerCase();
    if (priorityLower === 'critical') return 'bg-red-500 text-white';
    if (priorityLower === 'high') return 'bg-orange-500 text-white';
    if (priorityLower === 'medium') return 'bg-yellow-500 text-white';
    return 'bg-green-500 text-white';
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Group items by type
  const projectItems = workItems.filter((item) => item.type === 'project');
  const workOrderItems = workItems.filter((item) => item.type === 'work-order');
  const recurringJobItems = workItems.filter((item) => item.type === 'recurring-job');

  return (
    <div className="space-y-6">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-8 h-8" />
              <h2 className="text-3xl font-bold">{formatDate(selectedDate)}</h2>
            </div>
            <p className="text-blue-100">
              {workItems.length} work {workItems.length === 1 ? 'item' : 'items'} scheduled
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
              <p className="text-xs text-blue-100">Projects</p>
              <p className="text-2xl font-bold">{projectItems.length}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
              <p className="text-xs text-blue-100">Work Orders</p>
              <p className="text-2xl font-bold">{workOrderItems.length}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
              <p className="text-xs text-blue-100">Recurring Jobs</p>
              <p className="text-2xl font-bold">{recurringJobItems.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* SIPOC Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200 sticky top-0">
              <tr>
                <th className="text-left py-4 px-4 text-xs font-semibold text-gray-600 uppercase w-12">
                  Type
                </th>
                <th className="text-left py-4 px-4 text-xs font-semibold text-gray-600 uppercase">
                  ID / Title
                </th>
                <th className="text-left py-4 px-4 text-xs font-semibold text-gray-600 uppercase">
                  Customer
                </th>
                <th className="text-left py-4 px-4 text-xs font-semibold text-gray-600 uppercase">
                  Status
                </th>
                <th className="text-left py-4 px-4 text-xs font-semibold text-gray-600 uppercase">
                  Priority
                </th>
                <th className="text-left py-4 px-4 text-xs font-semibold text-gray-600 uppercase">
                  Assigned To
                </th>
                <th className="text-left py-4 px-4 text-xs font-semibold text-gray-600 uppercase">
                  Location
                </th>
                <th className="text-left py-4 px-4 text-xs font-semibold text-gray-600 uppercase">
                  Duration
                </th>
                <th className="text-left py-4 px-4 text-xs font-semibold text-gray-600 uppercase">
                  Timeline
                </th>
                <th className="text-right py-4 px-4 text-xs font-semibold text-gray-600 uppercase">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {workItems.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No work items scheduled for this date</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Work items will appear here when they fall within this date
                    </p>
                  </td>
                </tr>
              ) : (
                workItems.map((item) => (
                  <tr
                    key={`${item.type}-${item.id}`}
                    onClick={() => onItemClick(item)}
                    className="border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors"
                  >
                    {/* Type */}
                    <td className="py-4 px-4">
                      <div className={`inline-flex p-2 rounded-lg ${getTypeColor(item.type)}`}>
                        {getTypeIcon(item.type)}
                      </div>
                    </td>

                    {/* ID / Title */}
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-medium text-gray-900 mb-1">{item.title}</p>
                        <p className="text-xs font-mono text-gray-500">#{item.id}</p>
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="py-4 px-4">
                      <p className="text-sm text-gray-900">{item.customer}</p>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4">
                      <Badge variant="outline" className={getStatusColor(item.status)}>
                        {item.status}
                      </Badge>
                    </td>

                    {/* Priority */}
                    <td className="py-4 px-4">
                      {item.priority ? (
                        <Badge className={getPriorityColor(item.priority)}>
                          {item.priority}
                        </Badge>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>

                    {/* Assigned To */}
                    <td className="py-4 px-4">
                      {item.assignedTo.length > 0 ? (
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-medium">
                            {getTechnicianName(item.assignedTo[0]).charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm text-gray-900">
                              {getTechnicianName(item.assignedTo[0])}
                            </p>
                            {item.assignedTo.length > 1 && (
                              <p className="text-xs text-gray-500">
                                +{item.assignedTo.length - 1} more
                              </p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Unassigned</span>
                      )}
                    </td>

                    {/* Location */}
                    <td className="py-4 px-4">
                      {item.location ? (
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="truncate max-w-[150px]">{item.location}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>

                    {/* Duration */}
                    <td className="py-4 px-4">
                      {item.estimatedDuration ? (
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span>{item.estimatedDuration}h</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>

                    {/* Timeline */}
                    <td className="py-4 px-4">
                      <div className="text-xs text-gray-600">
                        <div>
                          {new Date(item.startDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                        {item.endDate && (
                          <div className="text-gray-500">
                            to{' '}
                            {new Date(item.endDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-4 px-4 text-right">
                      <ChevronRight className="w-5 h-5 text-gray-400 inline-block" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Footer */}
      {workItems.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-600 uppercase font-medium mb-1">Total Items</p>
              <p className="text-2xl font-bold text-gray-900">{workItems.length}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 uppercase font-medium mb-1">Total Duration</p>
              <p className="text-2xl font-bold text-gray-900">
                {workItems.reduce((sum, item) => sum + (item.estimatedDuration || 0), 0)}h
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 uppercase font-medium mb-1">Unique Customers</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(workItems.map((item) => item.customer)).size}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 uppercase font-medium mb-1">Assigned Staff</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(workItems.flatMap((item) => item.assignedTo)).size}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
