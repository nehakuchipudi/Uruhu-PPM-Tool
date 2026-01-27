import React from 'react';
import { Badge } from '@/app/components/ui/badge';
import { Card } from '@/app/components/ui/card';
import { Person } from '@/types';
import {
  Calendar,
  Clock,
  User,
  MapPin,
  FileText,
  FolderKanban,
  Repeat,
  ChevronRight,
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

interface WorkSchedule2WeekViewProps {
  weekDates: Date[];
  workItemsByDate: Map<string, WorkItem[]>;
  people: Person[];
  onItemClick: (item: WorkItem) => void;
  onDateClick: (date: Date) => void;
}

export function WorkSchedule2WeekView({
  weekDates,
  workItemsByDate,
  people,
  onItemClick,
  onDateClick,
}: WorkSchedule2WeekViewProps) {
  const getTechnicianName = (id: string) => {
    return people.find((p) => p.id === id)?.name || 'Unknown';
  };

  const getTypeIcon = (type: WorkItem['type']) => {
    switch (type) {
      case 'project':
        return <FolderKanban className="w-3 h-3" />;
      case 'work-order':
        return <FileText className="w-3 h-3" />;
      case 'recurring-job':
        return <Repeat className="w-3 h-3" />;
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

  const getPriorityColor = (priority?: string) => {
    if (!priority) return 'bg-gray-100 text-gray-700';
    const priorityLower = priority.toLowerCase();
    if (priorityLower === 'critical') return 'bg-red-500 text-white';
    if (priorityLower === 'high') return 'bg-orange-500 text-white';
    if (priorityLower === 'medium') return 'bg-yellow-500 text-white';
    return 'bg-green-500 text-white';
  };

  const formatDayHeader = (date: Date) => {
    return {
      dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNumber: date.getDate(),
      monthName: date.toLocaleDateString('en-US', { month: 'short' }),
    };
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const getDateKey = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="space-y-4">
      {/* Week Overview Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1">Week View</h2>
            <p className="text-blue-100">
              {weekDates[0].toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
              })}{' '}
              -{' '}
              {weekDates[weekDates.length - 1].toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
              <p className="text-xs text-blue-100">Total Items</p>
              <p className="text-xl font-bold">
                {Array.from(workItemsByDate.values()).reduce((sum, items) => sum + items.length, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Week Grid */}
      <div className="grid grid-cols-5 gap-4">
        {weekDates.map((date) => {
          const dayHeader = formatDayHeader(date);
          const dateKey = getDateKey(date);
          const dayItems = workItemsByDate.get(dateKey) || [];
          const isTodayDate = isToday(date);

          // Group by type
          const projectCount = dayItems.filter((item) => item.type === 'project').length;
          const workOrderCount = dayItems.filter((item) => item.type === 'work-order').length;
          const recurringJobCount = dayItems.filter((item) => item.type === 'recurring-job').length;

          return (
            <Card
              key={dateKey}
              className={`p-0 overflow-hidden ${
                isTodayDate ? 'ring-2 ring-blue-500 shadow-lg' : ''
              } hover:shadow-md transition-shadow`}
            >
              {/* Day Header */}
              <div
                onClick={() => onDateClick(date)}
                className={`p-4 cursor-pointer transition-colors ${
                  isTodayDate
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className={`text-xs font-medium ${isTodayDate ? 'text-blue-100' : 'text-gray-600'}`}>
                      {dayHeader.dayName}
                    </p>
                    <p className={`text-2xl font-bold ${isTodayDate ? 'text-white' : 'text-gray-900'}`}>
                      {dayHeader.dayNumber}
                    </p>
                    <p className={`text-xs ${isTodayDate ? 'text-blue-100' : 'text-gray-500'}`}>
                      {dayHeader.monthName}
                    </p>
                  </div>
                  {isTodayDate && (
                    <Badge className="bg-white/20 text-white text-xs">Today</Badge>
                  )}
                </div>

                {/* Type Counts */}
                <div className="flex items-center gap-2 text-xs">
                  {projectCount > 0 && (
                    <div className={`flex items-center gap-1 ${isTodayDate ? 'text-blue-100' : 'text-blue-600'}`}>
                      <FolderKanban className="w-3 h-3" />
                      <span>{projectCount}</span>
                    </div>
                  )}
                  {workOrderCount > 0 && (
                    <div className={`flex items-center gap-1 ${isTodayDate ? 'text-purple-100' : 'text-purple-600'}`}>
                      <FileText className="w-3 h-3" />
                      <span>{workOrderCount}</span>
                    </div>
                  )}
                  {recurringJobCount > 0 && (
                    <div className={`flex items-center gap-1 ${isTodayDate ? 'text-green-100' : 'text-green-600'}`}>
                      <Repeat className="w-3 h-3" />
                      <span>{recurringJobCount}</span>
                    </div>
                  )}
                  {dayItems.length === 0 && (
                    <span className={isTodayDate ? 'text-blue-100' : 'text-gray-400'}>
                      No items
                    </span>
                  )}
                </div>
              </div>

              {/* Work Items */}
              <div className="p-2 space-y-2 max-h-[500px] overflow-y-auto">
                {dayItems.slice(0, 10).map((item) => (
                  <div
                    key={`${item.type}-${item.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onItemClick(item);
                    }}
                    className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm cursor-pointer transition-all bg-white"
                  >
                    {/* Type Badge & Priority */}
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className={`${getTypeColor(item.type)} text-xs`}>
                        <span className="mr-1">{getTypeIcon(item.type)}</span>
                        {item.type === 'work-order'
                          ? 'WO'
                          : item.type === 'project'
                          ? 'Proj'
                          : 'Job'}
                      </Badge>
                      {item.priority && (
                        <div className={`w-2 h-2 rounded-full ${getPriorityColor(item.priority).replace('text-white', '')}`} />
                      )}
                    </div>

                    {/* Title */}
                    <h4 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">
                      {item.title}
                    </h4>

                    {/* Customer */}
                    <p className="text-xs text-gray-600 mb-2">{item.customer}</p>

                    {/* Details */}
                    <div className="space-y-1">
                      {item.assignedTo.length > 0 && (
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <User className="w-3 h-3 text-gray-400" />
                          <span className="truncate">
                            {getTechnicianName(item.assignedTo[0])}
                            {item.assignedTo.length > 1 && ` +${item.assignedTo.length - 1}`}
                          </span>
                        </div>
                      )}

                      {item.location && (
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          <span className="truncate">{item.location}</span>
                        </div>
                      )}

                      {item.estimatedDuration && (
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span>{item.estimatedDuration}h</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {dayItems.length > 10 && (
                  <button
                    onClick={() => onDateClick(date)}
                    className="w-full p-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors font-medium"
                  >
                    +{dayItems.length - 10} more items
                  </button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Legend */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <p className="text-xs font-semibold text-gray-700 uppercase mb-3">Legend</p>
        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-500" />
            <span className="text-sm text-gray-700">Project</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-purple-500" />
            <span className="text-sm text-gray-700">Work Order</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500" />
            <span className="text-sm text-gray-700">Recurring Job</span>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-xs text-gray-600">Critical</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <span className="text-xs text-gray-600">High</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="text-xs text-gray-600">Medium</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-xs text-gray-600">Low</span>
          </div>
        </div>
      </div>
    </div>
  );
}
