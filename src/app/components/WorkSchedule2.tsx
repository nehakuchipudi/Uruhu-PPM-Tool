import React, { useState, useMemo } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { Badge } from '@/app/components/ui/badge';
import { WorkSchedule2DayView } from '@/app/components/WorkSchedule2DayView';
import { WorkSchedule2WeekView } from '@/app/components/WorkSchedule2WeekView';
import { WorkSchedule2MonthView } from '@/app/components/WorkSchedule2MonthView';
import { Project, WorkOrder, RecurringTask, Person } from '@/types';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  X,
  CalendarDays,
  CalendarRange,
  Download,
  Settings,
  FileText,
  FolderKanban,
  Repeat,
  MapPin,
  User,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

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

interface WorkSchedule2Props {
  projects: Project[];
  workOrders: WorkOrder[];
  recurringTasks: RecurringTask[];
  people: Person[];
}

export function WorkSchedule2({
  projects,
  workOrders,
  recurringTasks,
  people,
}: WorkSchedule2Props) {
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [selectedDate, setSelectedDate] = useState(new Date('2025-01-21'));
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Source toggles
  const [showProjects, setShowProjects] = useState(true);
  const [showWorkOrders, setShowWorkOrders] = useState(true);
  const [showRecurringJobs, setShowRecurringJobs] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [customerFilter, setCustomerFilter] = useState<string>('all');
  const [ownerFilter, setOwnerFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'customer' | 'duration'>('date');

  // Modal state
  const [selectedItem, setSelectedItem] = useState<WorkItem | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Convert data to unified WorkItem format
  const convertToWorkItems = useMemo((): WorkItem[] => {
    const items: WorkItem[] = [];

    // Add projects
    if (showProjects) {
      projects.forEach((project) => {
        items.push({
          id: project.id,
          type: 'project',
          title: project.name,
          customer: project.customerName || project.name,
          status: project.status,
          priority: project.priority,
          assignedTo: project.assignedTo || [],
          location: undefined,
          startDate: project.startDate,
          endDate: project.endDate,
          estimatedDuration: undefined,
          description: project.description,
        });
      });
    }

    // Add work orders
    if (showWorkOrders) {
      workOrders.forEach((wo) => {
        items.push({
          id: wo.id,
          type: 'work-order',
          title: wo.title,
          customer: wo.customerName,
          status: wo.status,
          priority: wo.priority,
          assignedTo: [...(wo.assignedTo || []), ...(wo.assignedRoles || [])],
          location: wo.location,
          startDate: wo.scheduledDate,
          endDate: wo.completedDate,
          estimatedDuration: wo.estimatedDuration,
          description: wo.description,
        });
      });
    }

    // Add recurring jobs
    if (showRecurringJobs) {
      recurringTasks.forEach((task) => {
        items.push({
          id: task.id,
          type: 'recurring-job',
          title: task.title,
          customer: task.customerName,
          status: 'active',
          priority: task.activityLevel,
          assignedTo: [...(task.assignedTo || []), ...(task.assignedRoles || [])],
          location: undefined,
          startDate: task.nextOccurrence,
          endDate: task.endDate,
          estimatedDuration: task.estimatedDuration,
          description: task.description,
        });
      });
    }

    return items;
  }, [projects, workOrders, recurringTasks, showProjects, showWorkOrders, showRecurringJobs]);

  // Filter work items
  const filteredItems = useMemo(() => {
    return convertToWorkItems.filter((item) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          item.id.toLowerCase().includes(query) ||
          item.title.toLowerCase().includes(query) ||
          item.customer.toLowerCase().includes(query) ||
          (item.description && item.description.toLowerCase().includes(query));
        if (!matchesSearch) return false;
      }

      // Status filter
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;

      // Priority filter
      if (priorityFilter !== 'all' && item.priority !== priorityFilter) return false;

      // Customer filter
      if (customerFilter !== 'all' && item.customer !== customerFilter) return false;

      // Owner filter
      if (ownerFilter !== 'all' && !item.assignedTo.includes(ownerFilter)) return false;

      // Location filter
      if (locationFilter && (!item.location || !item.location.toLowerCase().includes(locationFilter.toLowerCase()))) {
        return false;
      }

      return true;
    });
  }, [convertToWorkItems, searchQuery, statusFilter, priorityFilter, customerFilter, ownerFilter, locationFilter]);

  // Get items for selected date (for Day View)
  const getDayItems = (date: Date): WorkItem[] => {
    const dateStr = date.toISOString().split('T')[0];
    return filteredItems.filter((item) => {
      const itemStartDate = new Date(item.startDate).toISOString().split('T')[0];
      
      // Work orders appear only on their scheduled date
      if (item.type === 'work-order') {
        return itemStartDate === dateStr;
      }
      
      // Recurring services appear only on their next occurrence date
      if (item.type === 'recurring-job') {
        return itemStartDate === dateStr;
      }
      
      // Projects span from start to end date
      const itemEndDate = item.endDate ? new Date(item.endDate).toISOString().split('T')[0] : itemStartDate;
      return itemStartDate <= dateStr && dateStr <= itemEndDate;
    });
  };

  // Get week dates (Mon-Fri)
  const getWeekDates = (referenceDate: Date): Date[] => {
    const dates: Date[] = [];
    const day = referenceDate.getDay();
    const diff = day === 0 ? -6 : 1 - day; // Get to Monday
    const monday = new Date(referenceDate);
    monday.setDate(monday.getDate() + diff);

    for (let i = 0; i < 5; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      dates.push(date);
    }

    return dates;
  };

  // Get items by date for week view
  const getWeekItemsByDate = (): Map<string, WorkItem[]> => {
    const weekDates = getWeekDates(selectedDate);
    const itemsByDate = new Map<string, WorkItem[]>();

    weekDates.forEach((date) => {
      const dateKey = date.toISOString().split('T')[0];
      const items = filteredItems.filter((item) => {
        const itemStartDate = new Date(item.startDate).toISOString().split('T')[0];
        
        // Work orders appear only on their scheduled date
        if (item.type === 'work-order') {
          return itemStartDate === dateKey;
        }
        
        // Recurring services appear only on their next occurrence date
        if (item.type === 'recurring-job') {
          return itemStartDate === dateKey;
        }
        
        // Projects span from start to end date
        const itemEndDate = item.endDate ? new Date(item.endDate).toISOString().split('T')[0] : itemStartDate;
        return itemStartDate <= dateKey && dateKey <= itemEndDate;
      });
      itemsByDate.set(dateKey, items);
    });

    return itemsByDate;
  };

  // Get items by date for month view
  const getMonthItemsByDate = (): Map<string, WorkItem[]> => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    
    // Get first and last day of the month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Extend to include days from previous/next month to fill calendar grid
    const startingDayOfWeek = firstDay.getDay();
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startingDayOfWeek);
    
    const totalDays = 42; // 6 weeks
    const itemsByDate = new Map<string, WorkItem[]>();
    
    for (let i = 0; i < totalDays; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dateKey = date.toISOString().split('T')[0];
      
      const items = filteredItems.filter((item) => {
        const itemStartDate = new Date(item.startDate).toISOString().split('T')[0];
        
        // Work orders appear only on their scheduled date
        if (item.type === 'work-order') {
          return itemStartDate === dateKey;
        }
        
        // Recurring services appear only on their next occurrence date
        if (item.type === 'recurring-job') {
          return itemStartDate === dateKey;
        }
        
        // Projects span from start to end date
        const itemEndDate = item.endDate ? new Date(item.endDate).toISOString().split('T')[0] : itemStartDate;
        return itemStartDate <= dateKey && dateKey <= itemEndDate;
      });
      
      itemsByDate.set(dateKey, items);
    }
    
    return itemsByDate;
  };

  // Sort items
  const sortedDayItems = useMemo(() => {
    const items = getDayItems(selectedDate);
    return items.sort((a, b) => {
      switch (sortBy) {
        case 'priority': {
          const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
          const aPriority = a.priority || 'low';
          const bPriority = b.priority || 'low';
          return (priorityOrder[aPriority as keyof typeof priorityOrder] || 3) -
            (priorityOrder[bPriority as keyof typeof priorityOrder] || 3);
        }
        case 'customer':
          return a.customer.localeCompare(b.customer);
        case 'duration':
          return (b.estimatedDuration || 0) - (a.estimatedDuration || 0);
        case 'date':
        default:
          return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      }
    });
  }, [selectedDate, filteredItems, sortBy]);

  const navigateDay = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    setSelectedDate(newDate);
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    setSelectedDate(newDate);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date('2025-01-21')); // Mock today
    toast.success('Navigated to today');
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setCustomerFilter('all');
    setOwnerFilter('all');
    setLocationFilter('');
    setSortBy('date');
    setShowProjects(true);
    setShowWorkOrders(true);
    setShowRecurringJobs(true);
  };

  const handleExport = () => {
    toast.success('Export functionality coming soon');
  };

  const handleItemClick = (item: WorkItem) => {
    setSelectedItem(item);
    setShowDetailsModal(true);
  };

  const getTypeLabel = (type: WorkItem['type']) => {
    switch (type) {
      case 'project':
        return 'Project';
      case 'work-order':
        return 'Work Order';
      case 'recurring-job':
        return 'Recurring Service';
    }
  };

  const getTypeIcon = (type: WorkItem['type']) => {
    switch (type) {
      case 'project':
        return <FolderKanban className="w-5 h-5 text-blue-600" />;
      case 'work-order':
        return <FileText className="w-5 h-5 text-purple-600" />;
      case 'recurring-job':
        return <Repeat className="w-5 h-5 text-green-600" />;
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
    if (!priority) return 'bg-gray-500';
    const priorityLower = priority.toLowerCase();
    if (priorityLower === 'critical') return 'bg-red-500';
    if (priorityLower === 'high') return 'bg-orange-500';
    if (priorityLower === 'medium') return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const weekDates = getWeekDates(selectedDate);
  const weekItemsByDate = getWeekItemsByDate();
  const monthItemsByDate = getMonthItemsByDate();

  // Get first day of the month for month view
  const monthStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);

  const activeSourceCount = [showProjects, showWorkOrders, showRecurringJobs].filter(Boolean).length;

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (statusFilter !== 'all') count++;
    if (priorityFilter !== 'all') count++;
    if (customerFilter !== 'all') count++;
    if (ownerFilter !== 'all') count++;
    if (locationFilter) count++;
    return count;
  }, [statusFilter, priorityFilter, customerFilter, ownerFilter, locationFilter]);

  // Get unique customers from all work items
  const uniqueCustomers = useMemo(() => {
    const customers = new Set<string>();
    projects.forEach((p) => customers.add(p.customerName));
    workOrders.forEach((wo) => customers.add(wo.customerName));
    recurringTasks.forEach((task) => customers.add(task.customerName));
    return Array.from(customers).sort();
  }, [projects, workOrders, recurringTasks]);

  return (
    <div className="space-y-6">
      {/* Header - Removed, now integrated into controls */}

      {/* Controls Card - New Clean Design */}
      <Card className="p-6">
        <div className="space-y-4">
          {/* Top Row - Date Navigation & View Toggle */}
          <div className="flex items-center justify-between gap-4">
            {/* Left: Navigation */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (viewMode === 'day') navigateDay('prev');
                  else if (viewMode === 'week') navigateWeek('prev');
                  else navigateMonth('prev');
                }}
                className="h-9 w-9 p-0"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={goToToday}
                className="h-9 px-4 font-medium"
              >
                Today
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (viewMode === 'day') navigateDay('next');
                  else if (viewMode === 'week') navigateWeek('next');
                  else navigateMonth('next');
                }}
                className="h-9 w-9 p-0"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>

              <div className="text-lg font-semibold text-gray-700 ml-4">
                {viewMode === 'month'
                  ? monthStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                  : viewMode === 'week'
                  ? `${weekDates[0].toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })} - ${weekDates[4].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                  : selectedDate.toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
              </div>
            </div>

            {/* Right: View Mode Toggles */}
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'day' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('day')}
                className="h-9 gap-2"
              >
                <Calendar className="w-4 h-4" />
                Day View
              </Button>
              <Button
                variant={viewMode === 'week' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('week')}
                className="h-9 gap-2"
              >
                <CalendarDays className="w-4 h-4" />
                Week View
              </Button>
              <Button
                variant={viewMode === 'month' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('month')}
                className="h-9 gap-2"
              >
                <CalendarRange className="w-4 h-4" />
                Month View
              </Button>
            </div>
          </div>

          {/* Search Bar Row */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by ID, title, customer, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="h-10 gap-2 relative"
            >
              <Filter className="w-4 h-4" />
              Filters
              {activeFilterCount > 0 && (
                <Badge className="ml-1 h-5 px-1.5 min-w-[20px] bg-blue-600 text-white hover:bg-blue-700">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </div>

          {/* Source Toggle Pills Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">Show:</span>
              <div className="flex items-center gap-2">
                <Button
                  variant={showProjects ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setShowProjects(!showProjects)}
                  className={`h-8 rounded-full ${
                    showProjects
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'border-blue-600 text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  Projects
                </Button>
                <Button
                  variant={showWorkOrders ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setShowWorkOrders(!showWorkOrders)}
                  className={`h-8 rounded-full ${
                    showWorkOrders
                      ? 'bg-fuchsia-600 hover:bg-fuchsia-700 text-white'
                      : 'border-fuchsia-600 text-fuchsia-600 hover:bg-fuchsia-50'
                  }`}
                >
                  Work Orders
                </Button>
                <Button
                  variant={showRecurringJobs ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setShowRecurringJobs(!showRecurringJobs)}
                  className={`h-8 rounded-full ${
                    showRecurringJobs
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'border-emerald-600 text-emerald-600 hover:bg-emerald-50'
                  }`}
                >
                  Recurring Services
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>{activeSourceCount} sources active</span>
            </div>
          </div>

          {/* Item Count */}
          <div className="text-sm text-gray-600">
            {viewMode === 'day' && `Showing ${sortedDayItems.length} work items for the day`}
            {viewMode === 'week' && `Showing ${filteredItems.filter((item) => {
              const itemStartDate = new Date(item.startDate).toISOString().split('T')[0];
              const itemEndDate = item.endDate ? new Date(item.endDate).toISOString().split('T')[0] : itemStartDate;
              const weekStart = weekDates[0].toISOString().split('T')[0];
              const weekEnd = weekDates[4].toISOString().split('T')[0];
              return (itemStartDate <= weekEnd && itemEndDate >= weekStart);
            }).length} work items for the week`}
            {viewMode === 'month' && `Showing ${filteredItems.filter((item) => {
              const itemDate = new Date(item.startDate);
              return itemDate.getMonth() === monthStart.getMonth() && itemDate.getFullYear() === monthStart.getFullYear();
            }).length} work items for the month`}
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="border-t pt-4 space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Status
                  </label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="On Hold">On Hold</SelectItem>
                      <SelectItem value="Scheduled">Scheduled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Priority
                  </label>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Priorities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="Critical">Critical</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Customer
                  </label>
                  <Select value={customerFilter} onValueChange={setCustomerFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Customers" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Customers</SelectItem>
                      {uniqueCustomers.map((customer) => (
                        <SelectItem key={customer} value={customer}>
                          {customer}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Assigned To
                  </label>
                  <Select value={ownerFilter} onValueChange={setOwnerFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Team Members" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Team Members</SelectItem>
                      {people.map((person) => (
                        <SelectItem key={person.id} value={person.id}>
                          {person.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Sort By
                    </label>
                    <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="date">Date</SelectItem>
                        <SelectItem value="priority">Priority</SelectItem>
                        <SelectItem value="customer">Customer</SelectItem>
                        <SelectItem value="duration">Duration</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                  <X className="w-4 h-4 mr-2" />
                  Clear All Filters
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* View Content */}
      {viewMode === 'day' ? (
        <WorkSchedule2DayView
          selectedDate={selectedDate}
          workItems={sortedDayItems}
          people={people}
          onItemClick={handleItemClick}
        />
      ) : viewMode === 'week' ? (
        <WorkSchedule2WeekView
          weekDates={weekDates}
          workItemsByDate={weekItemsByDate}
          people={people}
          onItemClick={handleItemClick}
          onDateClick={(date) => {
            setSelectedDate(date);
            setViewMode('day');
          }}
        />
      ) : (
        <WorkSchedule2MonthView
          monthStart={monthStart}
          workItemsByDate={monthItemsByDate}
          people={people}
          onItemClick={handleItemClick}
          onDateClick={(date) => {
            setSelectedDate(date);
            setViewMode('day');
          }}
        />
      )}

      {/* Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-2xl" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedItem && (
                <>
                  <div className={`p-2 rounded-lg border ${getTypeColor(selectedItem.type)}`}>
                    {getTypeIcon(selectedItem.type)}
                  </div>
                  <div>
                    <div className="text-xl font-semibold">{selectedItem.title}</div>
                    <div className="text-sm font-normal text-gray-500 mt-1">
                      {getTypeLabel(selectedItem.type)} • {selectedItem.id}
                    </div>
                  </div>
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedItem && (
            <div className="space-y-6">
              {/* Status and Priority */}
              <div className="flex items-center gap-3">
                <Badge className={getStatusColor(selectedItem.status)}>
                  {selectedItem.status.replace('-', ' ').toUpperCase()}
                </Badge>
                {selectedItem.priority && (
                  <Badge className={`${getPriorityColor(selectedItem.priority)} text-white`}>
                    {selectedItem.priority.toUpperCase()} PRIORITY
                  </Badge>
                )}
              </div>

              {/* Basic Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* Customer */}
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <User className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">Customer</p>
                    <p className="text-sm font-semibold text-gray-900 mt-1">{selectedItem.customer}</p>
                  </div>
                </div>

                {/* Start Date */}
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">
                      {selectedItem.type === 'recurring-job' ? 'Next Occurrence' : 'Start Date'}
                    </p>
                    <p className="text-sm font-semibold text-gray-900 mt-1">
                      {new Date(selectedItem.startDate).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                {/* End Date */}
                {selectedItem.endDate && (
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-gray-600 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">
                        {selectedItem.type === 'work-order' ? 'Completed Date' : 'End Date'}
                      </p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">
                        {new Date(selectedItem.endDate).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                )}

                {/* Duration */}
                {selectedItem.estimatedDuration && (
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <Clock className="w-5 h-5 text-gray-600 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">Estimated Duration</p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">
                        {selectedItem.estimatedDuration} hours
                      </p>
                    </div>
                  </div>
                )}

                {/* Location */}
                {selectedItem.location && (
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <MapPin className="w-5 h-5 text-gray-600 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">Location</p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">{selectedItem.location}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Assigned To */}
              {selectedItem.assignedTo.length > 0 && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs font-medium text-blue-700 uppercase mb-2">Assigned To</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedItem.assignedTo.map((personId) => {
                      const person = people.find((p) => p.id === personId);
                      return (
                        <Badge key={personId} variant="outline" className="bg-white">
                          {person?.name || personId}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Description */}
              {selectedItem.description && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs font-medium text-gray-500 uppercase mb-2">Description</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedItem.description}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
                  Close
                </Button>
                <Button
                  onClick={() => {
                    toast.info(`Navigating to ${getTypeLabel(selectedItem.type)} details...`);
                    setShowDetailsModal(false);
                  }}
                >
                  View Full Details
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}