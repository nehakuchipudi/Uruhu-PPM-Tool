import { useState, useMemo } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import {
  Calendar,
  List,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  MapPin,
  Search,
  ArrowUpDown,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  FileText,
} from 'lucide-react';
import { WorkOrder, Person, Role, Instance, Project } from '@/types';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks, isSameDay, parseISO, startOfMonth, endOfMonth, eachWeekOfInterval } from 'date-fns';

interface WorkOrderScheduleProps {
  workOrders: WorkOrder[];
  people: Person[];
  roles: Role[];
  instances?: Instance[];
  onWorkOrderSelect?: (workOrder: WorkOrder) => void;
}

export function WorkOrderSchedule({
  workOrders,
  people,
  roles,
  instances = [],
  onWorkOrderSelect,
}: WorkOrderScheduleProps) {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month' | 'list' | 'table'>('table');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterPerson, setFilterPerson] = useState<string>('all');
  const [filterInstance, setFilterInstance] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const weekStart = startOfWeek(currentWeek);
  const weekEnd = endOfWeek(currentWeek);
  const monthStart = startOfMonth(currentWeek);
  const monthEnd = endOfMonth(currentWeek);

  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const monthWeeks = eachWeekOfInterval({ start: monthStart, end: monthEnd });

  // Filter and search work orders
  const filteredWorkOrders = useMemo(() => {
    let filtered = workOrders;

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(wo => wo.status === filterStatus);
    }

    // Priority filter
    if (filterPriority !== 'all') {
      filtered = filtered.filter(wo => wo.priority === filterPriority);
    }

    // Person filter
    if (filterPerson !== 'all') {
      filtered = filtered.filter(wo => wo.assignedTo.includes(filterPerson));
    }

    // Instance filter
    if (filterInstance !== 'all') {
      filtered = filtered.filter(wo => wo.instanceId === filterInstance);
    }

    // Search filter (ID, title, location)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(wo =>
        wo.id.toLowerCase().includes(query) ||
        wo.title.toLowerCase().includes(query) ||
        wo.location?.toLowerCase().includes(query) ||
        wo.customerName.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [workOrders, filterStatus, filterPriority, filterPerson, filterInstance, searchQuery]);

  // Sort work orders
  const sortedWorkOrders = useMemo(() => {
    const sorted = [...filteredWorkOrders];

    sorted.sort((a, b) => {
      let comparison = 0;

      if (sortBy === 'date') {
        comparison = parseISO(a.scheduledDate).getTime() - parseISO(b.scheduledDate).getTime();
      } else if (sortBy === 'priority') {
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
      } else if (sortBy === 'status') {
        const statusOrder = { 'in-progress': 4, scheduled: 3, 'pending-approval': 2, completed: 1, cancelled: 0, draft: -1 };
        comparison = statusOrder[a.status] - statusOrder[b.status];
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [filteredWorkOrders, sortBy, sortOrder]);

  // Group work orders by date for calendar views
  const workOrdersByDate = useMemo(() => {
    const grouped: { [date: string]: WorkOrder[] } = {};
    
    filteredWorkOrders.forEach(wo => {
      const dateKey = format(parseISO(wo.scheduledDate), 'yyyy-MM-dd');
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(wo);
    });

    return grouped;
  }, [filteredWorkOrders]);

  const getStatusColor = (status: WorkOrder['status']) => {
    const colors = {
      draft: 'bg-gray-500',
      scheduled: 'bg-blue-500',
      'in-progress': 'bg-yellow-500',
      completed: 'bg-green-500',
      cancelled: 'bg-red-500',
      'pending-approval': 'bg-purple-500',
    };
    return colors[status] || 'bg-gray-500';
  };

  const getStatusIcon = (status: WorkOrder['status']) => {
    const icons = {
      draft: FileText,
      scheduled: Calendar,
      'in-progress': Loader2,
      completed: CheckCircle2,
      cancelled: XCircle,
      'pending-approval': AlertCircle,
    };
    const Icon = icons[status] || FileText;
    return <Icon className="w-4 h-4" />;
  };

  const getPriorityColor = (priority: WorkOrder['priority']) => {
    const colors = {
      low: 'bg-gray-100 text-gray-700 border-gray-300',
      medium: 'bg-blue-100 text-blue-700 border-blue-300',
      high: 'bg-orange-100 text-orange-700 border-orange-300',
      critical: 'bg-red-100 text-red-700 border-red-300',
    };
    return colors[priority] || colors.low;
  };

  const getActivityColor = (level: 'low' | 'medium' | 'high') => {
    const colors = {
      low: 'bg-green-100 text-green-700 border-green-300',
      medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      high: 'bg-red-100 text-red-700 border-red-300',
    };
    return colors[level];
  };

  const toggleSort = (field: 'date' | 'priority' | 'status') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const renderTableView = () => {
    return (
      <div className="space-y-4">
        {/* Table Header */}
        <div className="bg-gray-50 border rounded-lg overflow-hidden">
          <div className="grid grid-cols-12 gap-4 p-4 font-semibold text-sm text-gray-700 border-b">
            <div className="col-span-1">ID</div>
            <div className="col-span-2">Title</div>
            <div className="col-span-1 flex items-center gap-1 cursor-pointer hover:text-gray-900" onClick={() => toggleSort('priority')}>
              Priority
              <ArrowUpDown className="w-3 h-3" />
            </div>
            <div className="col-span-2">Assignee(s)</div>
            <div className="col-span-1 flex items-center gap-1 cursor-pointer hover:text-gray-900" onClick={() => toggleSort('status')}>
              Status
              <ArrowUpDown className="w-3 h-3" />
            </div>
            <div className="col-span-2 flex items-center gap-1 cursor-pointer hover:text-gray-900" onClick={() => toggleSort('date')}>
              Date/Time
              <ArrowUpDown className="w-3 h-3" />
            </div>
            <div className="col-span-2">Location</div>
            <div className="col-span-1 text-center">Duration</div>
          </div>

          {/* Table Rows */}
          <div className="divide-y">
            {sortedWorkOrders.map(wo => {
              const assignedPeople = people.filter(p => wo.assignedTo.includes(p.id));

              return (
                <div
                  key={wo.id}
                  className="grid grid-cols-12 gap-4 p-4 hover:bg-blue-50 cursor-pointer transition-colors group"
                  onClick={() => onWorkOrderSelect?.(wo)}
                  title={`${wo.title}\n${wo.description}\nCustomer: ${wo.customerName}`}
                >
                  {/* ID */}
                  <div className="col-span-1 text-sm font-mono text-gray-600">
                    {wo.id.split('-')[1]}
                  </div>

                  {/* Title */}
                  <div className="col-span-2">
                    <div className="font-medium text-sm truncate">{wo.title}</div>
                    <div className="text-xs text-gray-500 truncate">{wo.customerName}</div>
                  </div>

                  {/* Priority */}
                  <div className="col-span-1">
                    <Badge variant="outline" className={`text-xs ${getPriorityColor(wo.priority)}`}>
                      {wo.priority}
                    </Badge>
                  </div>

                  {/* Assignees */}
                  <div className="col-span-2">
                    {assignedPeople.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {assignedPeople.map(person => (
                          <Badge key={person.id} variant="secondary" className="text-xs">
                            {person.name.split(' ')[0]}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">Unassigned</span>
                    )}
                  </div>

                  {/* Status */}
                  <div className="col-span-1">
                    <Badge className={`${getStatusColor(wo.status)} text-xs flex items-center gap-1 w-fit`}>
                      {getStatusIcon(wo.status)}
                      <span className="capitalize">{wo.status}</span>
                    </Badge>
                  </div>

                  {/* Date/Time */}
                  <div className="col-span-2">
                    <div className="text-sm font-medium">
                      {format(parseISO(wo.scheduledDate), 'MMM d, yyyy')}
                    </div>
                    {wo.scheduledTime && (
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {wo.scheduledTime}
                      </div>
                    )}
                  </div>

                  {/* Location */}
                  <div className="col-span-2">
                    {wo.location ? (
                      <div className="text-sm flex items-start gap-1">
                        <MapPin className="w-3 h-3 mt-0.5 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{wo.location}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">No location</span>
                    )}
                  </div>

                  {/* Duration */}
                  <div className="col-span-1 text-center">
                    <div className="text-sm font-medium">{wo.estimatedDuration}h</div>
                    {wo.actualDuration && (
                      <div className="text-xs text-gray-500">({wo.actualDuration}h)</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {sortedWorkOrders.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <List className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No work orders found</p>
            <p className="text-sm mt-1">Try adjusting your filters or search query</p>
          </div>
        )}
      </div>
    );
  };

  const renderWorkOrderCard = (wo: WorkOrder, compact = false) => {
    const assignedPeople = people.filter(p => wo.assignedTo.includes(p.id));

    return (
      <div
        key={wo.id}
        className="p-2 mb-2 rounded-lg border-l-4 bg-white hover:shadow-md transition-shadow cursor-pointer"
        style={{ borderLeftColor: wo.priority === 'critical' ? '#dc2626' : wo.priority === 'high' ? '#ea580c' : '#3b82f6' }}
        onClick={() => onWorkOrderSelect?.(wo)}
        title={`${wo.title}\n${wo.description}\nCustomer: ${wo.customerName}\nLocation: ${wo.location || 'N/A'}`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`w-2 h-2 rounded-full ${getStatusColor(wo.status)}`} />
              <h4 className="font-medium text-sm truncate">{wo.title}</h4>
              <Badge variant="outline" className={`text-xs ${getPriorityColor(wo.priority)}`}>
                {wo.priority}
              </Badge>
            </div>
            {!compact && (
              <>
                <p className="text-xs text-gray-600 mb-1">{wo.customerName}</p>
                <p className="text-xs text-gray-500 truncate mb-2">{wo.description}</p>
                {wo.location && (
                  <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                    <MapPin className="w-3 h-3" />
                    {wo.location}
                  </div>
                )}
              </>
            )}
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {wo.scheduledTime || '09:00'} • {wo.estimatedDuration}h
              </span>
            </div>
            {!compact && assignedPeople.length > 0 && (
              <div className="flex items-center gap-1 mt-2">
                <User className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-600">
                  {assignedPeople.map(p => p.name.split(' ')[0]).join(', ')}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    return (
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map(day => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const dayWorkOrders = workOrdersByDate[dateKey] || [];
          const isToday = isSameDay(day, new Date());

          // Count work orders by status
          const statusCounts = {
            scheduled: dayWorkOrders.filter(wo => wo.status === 'scheduled').length,
            'in-progress': dayWorkOrders.filter(wo => wo.status === 'in-progress').length,
            completed: dayWorkOrders.filter(wo => wo.status === 'completed').length,
          };

          return (
            <div key={dateKey} className={`border rounded-lg ${isToday ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
              <div className={`p-2 border-b ${isToday ? 'bg-blue-500 text-white' : 'bg-gray-50'}`}>
                <div className="text-xs font-medium">{format(day, 'EEE')}</div>
                <div className="text-lg font-bold">{format(day, 'd')}</div>
                {dayWorkOrders.length > 0 && (
                  <div className="text-xs mt-1 font-semibold">
                    {dayWorkOrders.length} {dayWorkOrders.length === 1 ? 'Order' : 'Orders'}
                  </div>
                )}
              </div>
              <div className="p-2 max-h-96 overflow-y-auto">
                {dayWorkOrders.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4">No work orders</p>
                ) : (
                  <>
                    {dayWorkOrders.map(wo => {
                      const assignedPeople = people.filter(p => wo.assignedTo.includes(p.id));
                      return (
                        <div
                          key={wo.id}
                          className="p-2 mb-2 rounded-lg border-l-4 bg-white hover:shadow-md transition-shadow cursor-pointer"
                          style={{ borderLeftColor: wo.priority === 'critical' ? '#dc2626' : wo.priority === 'high' ? '#ea580c' : '#3b82f6' }}
                          onClick={() => onWorkOrderSelect?.(wo)}
                          title={`WO-${wo.id.split('-')[1]}: ${wo.title}\n${wo.description}\nCustomer: ${wo.customerName}\nLocation: ${wo.location || 'N/A'}\nPriority: ${wo.priority}\nStatus: ${wo.status}`}
                        >
                          <div className="flex items-center gap-1 mb-1">
                            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${getStatusColor(wo.status)}`} />
                            <span className="text-xs font-medium truncate flex-1">{wo.title}</span>
                          </div>
                          <div className="flex items-center justify-between gap-1 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {wo.scheduledTime || '09:00'}
                            </span>
                            <Badge variant="outline" className={`text-xs px-1 py-0 h-4 ${getPriorityColor(wo.priority)}`}>
                              {wo.priority[0].toUpperCase()}
                            </Badge>
                          </div>
                          {assignedPeople.length > 0 && (
                            <div className="text-xs text-gray-600 mt-1 truncate">
                              👤 {assignedPeople.map(p => p.name.split(' ')[0]).join(', ')}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderMonthView = () => {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-600">
              {day}
            </div>
          ))}
        </div>
        {monthWeeks.map((week, weekIndex) => {
          const days = eachDayOfInterval({
            start: startOfWeek(week),
            end: endOfWeek(week),
          });

          return (
            <div key={weekIndex} className="grid grid-cols-7 gap-2">
              {days.map(day => {
                const dateKey = format(day, 'yyyy-MM-dd');
                const dayWorkOrders = workOrdersByDate[dateKey] || [];
                const isCurrentMonth = day.getMonth() === currentWeek.getMonth();
                const isToday = isSameDay(day, new Date());

                return (
                  <div
                    key={dateKey}
                    className={`min-h-32 border rounded-lg p-2 ${
                      isToday ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    } ${!isCurrentMonth ? 'opacity-40' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className={`text-sm font-bold ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
                        {format(day, 'd')}
                      </div>
                      {dayWorkOrders.length > 0 && (
                        <div className="text-xs font-semibold text-gray-500">
                          {dayWorkOrders.length}
                        </div>
                      )}
                    </div>
                    <div className="space-y-1">
                      {dayWorkOrders.slice(0, 4).map(wo => (
                        <div
                          key={wo.id}
                          className="text-xs p-1 rounded cursor-pointer hover:bg-gray-100 border-l-2"
                          style={{ borderLeftColor: wo.priority === 'critical' ? '#dc2626' : wo.priority === 'high' ? '#ea580c' : '#3b82f6' }}
                          onClick={() => onWorkOrderSelect?.(wo)}
                          title={`WO-${wo.id.split('-')[1]}: ${wo.title}\nTime: ${wo.scheduledTime || '09:00'}\nPriority: ${wo.priority}\nStatus: ${wo.status}\nLocation: ${wo.location || 'N/A'}`}
                        >
                          <div className="flex items-center gap-1">
                            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${getStatusColor(wo.status)}`} />
                            <span className="truncate flex-1">{wo.title}</span>
                          </div>
                          {wo.scheduledTime && (
                            <div className="text-xs text-gray-500 ml-2.5">
                              {wo.scheduledTime}
                            </div>
                          )}
                        </div>
                      ))}
                      {dayWorkOrders.length > 4 && (
                        <div className="text-xs text-gray-500 pl-1 font-medium">
                          +{dayWorkOrders.length - 4} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  };

  const renderListView = () => {
    return (
      <div className="space-y-2">
        {sortedWorkOrders.map(wo => {
          const assignedPeople = people.filter(p => wo.assignedTo.includes(p.id));

          return (
            <Card 
              key={wo.id} 
              className="p-4 hover:shadow-md transition-shadow cursor-pointer" 
              onClick={() => onWorkOrderSelect?.(wo)}
              title={`Click to view details\n${wo.description}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="w-1 h-8 rounded" style={{ backgroundColor: wo.priority === 'critical' ? '#dc2626' : wo.priority === 'high' ? '#ea580c' : '#3b82f6' }} />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{wo.title}</h3>
                        <Badge variant="outline" className={`text-xs ${getPriorityColor(wo.priority)}`}>
                          {wo.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{wo.customerName}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3 ml-4">{wo.description}</p>
                  <div className="flex items-center gap-4 ml-4 text-sm text-gray-500 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {format(parseISO(wo.scheduledDate), 'MMM d, yyyy')}
                      {wo.scheduledTime && ` at ${wo.scheduledTime}`}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {wo.estimatedDuration}h
                    </span>
                    {wo.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {wo.location}
                      </span>
                    )}
                  </div>
                  {assignedPeople.length > 0 && (
                    <div className="flex items-center gap-2 ml-4 mt-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <div className="flex gap-2">
                        {assignedPeople.map(person => (
                          <Badge key={person.id} variant="secondary" className="text-xs">
                            {person.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge className={`${getStatusColor(wo.status)} flex items-center gap-1`}>
                    {getStatusIcon(wo.status)}
                    <span className="capitalize">{wo.status}</span>
                  </Badge>
                  {wo.isRecurring && (
                    <Badge variant="outline" className="text-xs">
                      Recurring
                    </Badge>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
        {sortedWorkOrders.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No work orders found</p>
            <p className="text-sm mt-1">Try adjusting your filters or search query</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by ID, title, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Status Filter */}
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="pending-approval">Pending Approval</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          {/* Priority Filter */}
          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger>
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>

          {/* Assignee Filter */}
          <Select value={filterPerson} onValueChange={setFilterPerson}>
            <SelectTrigger>
              <SelectValue placeholder="Assignee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Assignees</SelectItem>
              {people.map(person => (
                <SelectItem key={person.id} value={person.id}>
                  {person.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Instance Filter */}
          <Select value={filterInstance} onValueChange={setFilterInstance}>
            <SelectTrigger>
              <SelectValue placeholder="Instance" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Instances</SelectItem>
              {instances.map(instance => (
                <SelectItem key={instance.id} value={instance.id}>
                  {instance.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Active Filters Summary */}
        {(filterStatus !== 'all' || filterPriority !== 'all' || filterPerson !== 'all' || filterInstance !== 'all' || searchQuery) && (
          <div className="mt-3 pt-3 border-t flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-600">Active filters:</span>
            {filterStatus !== 'all' && (
              <Badge variant="secondary" className="text-xs">
                Status: {filterStatus}
              </Badge>
            )}
            {filterPriority !== 'all' && (
              <Badge variant="secondary" className="text-xs">
                Priority: {filterPriority}
              </Badge>
            )}
            {filterPerson !== 'all' && (
              <Badge variant="secondary" className="text-xs">
                Assignee: {people.find(p => p.id === filterPerson)?.name}
              </Badge>
            )}
            {filterInstance !== 'all' && (
              <Badge variant="secondary" className="text-xs">
                Instance: {instances.find(i => i.id === filterInstance)?.name}
              </Badge>
            )}
            {searchQuery && (
              <Badge variant="secondary" className="text-xs">
                Search: "{searchQuery}"
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-6"
              onClick={() => {
                setFilterStatus('all');
                setFilterPriority('all');
                setFilterPerson('all');
                setFilterInstance('all');
                setSearchQuery('');
              }}
            >
              Clear all
            </Button>
          </div>
        )}
      </Card>

      {/* View Controls */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Date Navigation (for calendar views) */}
        {(viewMode === 'week' || viewMode === 'month') && (
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentWeek(viewMode === 'month' ? subWeeks(currentWeek, 4) : subWeeks(currentWeek, 1))}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="text-lg font-semibold min-w-48 text-center">
              {viewMode === 'month' 
                ? format(currentWeek, 'MMMM yyyy')
                : `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`
              }
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentWeek(viewMode === 'month' ? addWeeks(currentWeek, 4) : addWeeks(currentWeek, 1))}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button variant="outline" onClick={() => setCurrentWeek(new Date())}>
              Today
            </Button>
          </div>
        )}

        {/* View Mode Tabs */}
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)} className="ml-auto">
          <TabsList>
            <TabsTrigger value="table" className="gap-1">
              <List className="w-4 h-4" />
              Table
            </TabsTrigger>
            <TabsTrigger value="list" className="gap-1">
              <FileText className="w-4 h-4" />
              List
            </TabsTrigger>
            <TabsTrigger value="week" className="gap-1">
              <Calendar className="w-4 h-4" />
              Week
            </TabsTrigger>
            <TabsTrigger value="month" className="gap-1">
              <Calendar className="w-4 h-4" />
              Month
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* View Content */}
      <div>
        {viewMode === 'table' && renderTableView()}
        {viewMode === 'list' && renderListView()}
        {viewMode === 'week' && renderWeekView()}
        {viewMode === 'month' && renderMonthView()}
      </div>

      {/* Summary Stats */}
      <Card className="p-4 bg-gray-50">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{filteredWorkOrders.length}</div>
            <div className="text-xs text-gray-600">Total Orders</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {filteredWorkOrders.filter(wo => wo.status === 'scheduled').length}
            </div>
            <div className="text-xs text-gray-600">Scheduled</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {filteredWorkOrders.filter(wo => wo.status === 'in-progress').length}
            </div>
            <div className="text-xs text-gray-600">In Progress</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {filteredWorkOrders.filter(wo => wo.status === 'completed').length}
            </div>
            <div className="text-xs text-gray-600">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {filteredWorkOrders.reduce((sum, wo) => sum + wo.estimatedDuration, 0)}h
            </div>
            <div className="text-xs text-gray-600">Total Hours</div>
          </div>
        </div>
      </Card>
    </div>
  );
}