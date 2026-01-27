import React from 'react';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Person } from '@/types';
import {
  FileText,
  FolderKanban,
  Repeat,
  MapPin,
  User,
  Clock,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Users,
  Calendar as CalendarIcon,
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

interface WorkSchedule2MonthViewProps {
  monthStart: Date;
  workItemsByDate: Map<string, WorkItem[]>;
  people: Person[];
  onItemClick: (item: WorkItem) => void;
  onDateClick: (date: Date) => void;
}

export function WorkSchedule2MonthView({
  monthStart,
  workItemsByDate,
  people,
  onItemClick,
  onDateClick,
}: WorkSchedule2MonthViewProps) {
  const getTechnicianName = (id: string) => {
    return people.find((p) => p.id === id)?.name || 'Unknown';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'project':
        return <FolderKanban className="w-3 h-3" />;
      case 'work-order':
        return <FileText className="w-3 h-3" />;
      case 'recurring-job':
        return <Repeat className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'project':
        return 'bg-blue-600 text-white';
      case 'work-order':
        return 'bg-fuchsia-600 text-white';
      case 'recurring-job':
        return 'bg-emerald-600 text-white';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'done':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'in-progress':
      case 'in progress':
      case 'active':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'upcoming':
      case 'scheduled':
      case 'planning':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'at-risk':
      case 'at risk':
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'blocked':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  // Generate calendar grid
  const generateMonthDays = () => {
    const year = monthStart.getFullYear();
    const month = monthStart.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday
    
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Days from previous month
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    const daysFromPrevMonth = startingDayOfWeek;
    
    // Days for next month
    const totalCells = Math.ceil((daysInMonth + daysFromPrevMonth) / 7) * 7;
    const daysFromNextMonth = totalCells - (daysInMonth + daysFromPrevMonth);
    
    const days: Array<{ date: Date; isCurrentMonth: boolean; items: WorkItem[] }> = [];
    
    // Previous month days
    for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      const dateKey = date.toISOString().split('T')[0];
      days.push({
        date,
        isCurrentMonth: false,
        items: workItemsByDate.get(dateKey) || [],
      });
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const dateKey = date.toISOString().split('T')[0];
      days.push({
        date,
        isCurrentMonth: true,
        items: workItemsByDate.get(dateKey) || [],
      });
    }
    
    // Next month days
    for (let i = 1; i <= daysFromNextMonth; i++) {
      const date = new Date(year, month + 1, i);
      const dateKey = date.toISOString().split('T')[0];
      days.push({
        date,
        isCurrentMonth: false,
        items: workItemsByDate.get(dateKey) || [],
      });
    }
    
    return days;
  };

  const monthDays = generateMonthDays();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isToday = (date: Date) => {
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate.getTime() === today.getTime();
  };

  // Calculate month summary statistics
  const calculateSummary = () => {
    // Get only current month items
    const currentMonthDays = monthDays.filter(day => day.isCurrentMonth);
    const allItems: WorkItem[] = [];
    const itemsSet = new Set<string>(); // To avoid counting duplicates for multi-day items
    
    currentMonthDays.forEach(day => {
      day.items.forEach(item => {
        if (!itemsSet.has(item.id)) {
          itemsSet.add(item.id);
          allItems.push(item);
        }
      });
    });

    // Count by type
    const projectCount = allItems.filter(i => i.type === 'project').length;
    const workOrderCount = allItems.filter(i => i.type === 'work-order').length;
    const recurringCount = allItems.filter(i => i.type === 'recurring-job').length;

    // Count by status
    const completed = allItems.filter(i => 
      i.status.toLowerCase().includes('complet') || i.status.toLowerCase() === 'done'
    ).length;
    const inProgress = allItems.filter(i => 
      i.status.toLowerCase().includes('progress') || i.status.toLowerCase() === 'active'
    ).length;
    const scheduled = allItems.filter(i => 
      i.status.toLowerCase().includes('schedul') || i.status.toLowerCase().includes('planning')
    ).length;
    const atRisk = allItems.filter(i => 
      i.status.toLowerCase().includes('risk') || 
      i.status.toLowerCase().includes('overdue') || 
      i.status.toLowerCase().includes('blocked')
    ).length;

    // Count by priority
    const criticalCount = allItems.filter(i => i.priority?.toLowerCase() === 'critical').length;
    const highCount = allItems.filter(i => i.priority?.toLowerCase() === 'high').length;

    // Find busiest days
    const daysWithCounts = currentMonthDays.map(day => ({
      date: day.date,
      count: day.items.length,
    })).sort((a, b) => b.count - a.count);
    const busiestDay = daysWithCounts[0];

    // Count unique team members assigned
    const assignedPeople = new Set<string>();
    allItems.forEach(item => {
      item.assignedTo.forEach(personId => assignedPeople.add(personId));
    });

    // Calculate total estimated hours
    const totalHours = allItems.reduce((sum, item) => sum + (item.estimatedDuration || 0), 0);

    // Days with work
    const daysWithWork = currentMonthDays.filter(day => day.items.length > 0).length;

    return {
      total: allItems.length,
      projectCount,
      workOrderCount,
      recurringCount,
      completed,
      inProgress,
      scheduled,
      atRisk,
      criticalCount,
      highCount,
      busiestDay,
      teamMemberCount: assignedPeople.size,
      totalHours,
      daysWithWork,
      totalDaysInMonth: currentMonthDays.length,
    };
  };

  const summary = calculateSummary();

  return (
    <div className="space-y-6">
      {/* Calendar Grid */}
      <Card className="overflow-hidden border-gray-200">
        {/* Day Headers */}
        <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div
              key={day}
              className="px-2 py-3 text-center text-sm font-semibold text-gray-700"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {monthDays.map((day, idx) => {
            const isCurrentDay = isToday(day.date);
            const hasItems = day.items.length > 0;
            const visibleItems = day.items.slice(0, 3);
            const hiddenCount = day.items.length - 3;

            return (
              <div
                key={idx}
                className={`min-h-[120px] border-r border-b border-gray-200 p-2 transition-colors ${
                  day.isCurrentMonth
                    ? 'bg-white hover:bg-blue-50/30'
                    : 'bg-gray-50/50 hover:bg-gray-100/50'
                } ${hasItems ? 'cursor-pointer' : ''}`}
                onClick={() => hasItems && onDateClick(day.date)}
              >
                {/* Date Number */}
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-sm font-medium ${
                      isCurrentDay
                        ? 'bg-blue-600 text-white w-7 h-7 rounded-full flex items-center justify-center'
                        : day.isCurrentMonth
                        ? 'text-gray-900'
                        : 'text-gray-400'
                    }`}
                  >
                    {day.date.getDate()}
                  </span>
                  {hasItems && (
                    <Badge
                      variant="outline"
                      className="h-5 px-1.5 text-xs bg-blue-50 text-blue-700 border-blue-200"
                    >
                      {day.items.length}
                    </Badge>
                  )}
                </div>

                {/* Work Items */}
                <div className="space-y-1">
                  {day.items.length > 3 ? (
                    // Always show all 3 groups with counts - LIGHT SHADES
                    <div className="space-y-1">
                      {(() => {
                        const projectCount = day.items.filter(i => i.type === 'project').length;
                        const workOrderCount = day.items.filter(i => i.type === 'work-order').length;
                        const recurringCount = day.items.filter(i => i.type === 'recurring-job').length;
                        
                        return (
                          <>
                            {/* Projects - Light Blue */}
                            <div 
                              onClick={(e) => {
                                e.stopPropagation();
                                onDateClick(day.date);
                              }}
                              className="text-xs px-2 py-1.5 rounded-full bg-blue-100 text-blue-700 cursor-pointer hover:bg-blue-200 transition-all flex items-center gap-2 font-semibold"
                            >
                              <FolderKanban className="w-3 h-3" />
                              <span className="flex-1">Projects</span>
                              <span className="font-bold">{projectCount}</span>
                            </div>
                            
                            {/* Work Orders - Light Magenta/Pink */}
                            <div 
                              onClick={(e) => {
                                e.stopPropagation();
                                onDateClick(day.date);
                              }}
                              className="text-xs px-2 py-1.5 rounded-full bg-fuchsia-100 text-fuchsia-700 cursor-pointer hover:bg-fuchsia-200 transition-all flex items-center gap-2 font-semibold"
                            >
                              <FileText className="w-3 h-3" />
                              <span className="flex-1">Work Orders</span>
                              <span className="font-bold">{workOrderCount}</span>
                            </div>
                            
                            {/* Recurring Services - Light Green */}
                            <div 
                              onClick={(e) => {
                                e.stopPropagation();
                                onDateClick(day.date);
                              }}
                              className="text-xs px-2 py-1.5 rounded-full bg-emerald-100 text-emerald-700 cursor-pointer hover:bg-emerald-200 transition-all flex items-center gap-2 font-semibold"
                            >
                              <Repeat className="w-3 h-3" />
                              <span className="flex-1">Recurring</span>
                              <span className="font-bold">{recurringCount}</span>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  ) : (
                    // Show individual items when 3 or fewer - Light shade format
                    <>
                      {visibleItems.map((item) => {
                        // Get type-specific styling
                        const getItemTypeStyle = () => {
                          switch (item.type) {
                            case 'project':
                              return {
                                badgeBg: 'bg-blue-50',
                                badgeText: 'text-blue-700',
                                badgeBorder: 'border-blue-200',
                                label: 'Proj',
                                icon: <FolderKanban className="w-3 h-3" />,
                              };
                            case 'work-order':
                              return {
                                badgeBg: 'bg-emerald-50',
                                badgeText: 'text-emerald-700',
                                badgeBorder: 'border-emerald-200',
                                label: 'Job',
                                icon: <FileText className="w-3 h-3" />,
                              };
                            case 'recurring-job':
                              return {
                                badgeBg: 'bg-teal-50',
                                badgeText: 'text-teal-700',
                                badgeBorder: 'border-teal-200',
                                label: 'Recur',
                                icon: <Repeat className="w-3 h-3" />,
                              };
                            default:
                              return {
                                badgeBg: 'bg-gray-50',
                                badgeText: 'text-gray-700',
                                badgeBorder: 'border-gray-200',
                                label: 'Item',
                                icon: <FileText className="w-3 h-3" />,
                              };
                          }
                        };

                        const typeStyle = getItemTypeStyle();
                        const assignedPerson = item.assignedTo.length > 0 ? getTechnicianName(item.assignedTo[0]) : null;
                        
                        return (
                          <div
                            key={item.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              onItemClick(item);
                            }}
                            className="bg-white border border-gray-200 rounded-lg p-2 cursor-pointer hover:shadow-md transition-all group relative"
                          >
                            {/* Status Indicator Dot */}
                            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-400"></div>
                            
                            {/* Type Badge */}
                            <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border ${typeStyle.badgeBg} ${typeStyle.badgeText} ${typeStyle.badgeBorder} mb-1.5`}>
                              {typeStyle.icon}
                              <span className="text-[10px] font-semibold">{typeStyle.label}</span>
                            </div>
                            
                            {/* Title */}
                            <div className="text-xs font-semibold text-gray-900 mb-0.5 truncate pr-3">
                              {item.title}
                            </div>
                            
                            {/* Customer */}
                            <div className="text-[10px] text-gray-600 mb-1 truncate">
                              {item.customer}
                            </div>
                            
                            {/* Assigned Person */}
                            {assignedPerson && (
                              <div className="flex items-center gap-1 text-[10px] text-gray-500">
                                <User className="w-3 h-3" />
                                <span className="truncate">{assignedPerson}</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>

                {/* View all button */}
                {day.items.length > 3 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDateClick(day.date);
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 w-full justify-center py-1 hover:bg-blue-50 rounded transition-colors mt-1"
                  >
                    <span>View all {day.items.length}</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}