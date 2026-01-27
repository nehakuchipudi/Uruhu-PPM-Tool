import React, { useState } from 'react';
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
import { WorkOrder, Person, Role, Project } from '@/types';
import { WorkOrdersCardView } from '@/app/components/WorkOrders2CardView';
import { WorkOrdersTableView } from '@/app/components/WorkOrders2TableView';
import { WorkOrdersListView } from '@/app/components/WorkOrders2ListView';
import { WorkOrderDetail2Enhanced } from '@/app/components/WorkOrderDetail2Enhanced';
import {
  Search,
  Plus,
  LayoutGrid,
  Table,
  List,
  Filter,
  X,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface WorkOrdersProps {
  workOrders: WorkOrder[];
  projects: Project[];
  people: Person[];
  roles: Role[];
  onNewWorkOrder: () => void;
}

export function WorkOrders({
  workOrders,
  projects,
  people,
  roles,
  onNewWorkOrder,
}: WorkOrdersProps) {
  const [viewMode, setViewMode] = useState<'card' | 'table' | 'list'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [customerFilter, setCustomerFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'status' | 'customer'>('date');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [technicianFilter, setTechnicianFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState('');

  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  // Filter work orders
  let filteredWorkOrders = workOrders.filter((wo) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        wo.id.toLowerCase().includes(query) ||
        wo.title.toLowerCase().includes(query) ||
        wo.customerName.toLowerCase().includes(query) ||
        (wo.location && wo.location.toLowerCase().includes(query));
      if (!matchesSearch) return false;
    }

    // Status filter
    if (statusFilter !== 'all' && wo.status !== statusFilter) return false;

    // Priority filter
    if (priorityFilter !== 'all' && wo.priority !== priorityFilter) return false;

    // Customer filter
    if (customerFilter !== 'all' && wo.customerName !== customerFilter) return false;

    // Technician filter
    if (technicianFilter !== 'all' && !wo.assignedTo.includes(technicianFilter)) return false;

    // Location filter
    if (locationFilter && (!wo.location || !wo.location.toLowerCase().includes(locationFilter.toLowerCase()))) {
      return false;
    }

    // Date range filter
    if (dateFrom) {
      const woDate = new Date(wo.scheduledDate);
      const fromDate = new Date(dateFrom);
      if (woDate < fromDate) return false;
    }
    if (dateTo) {
      const woDate = new Date(wo.scheduledDate);
      const toDate = new Date(dateTo);
      if (woDate > toDate) return false;
    }

    return true;
  });

  // Sort work orders
  filteredWorkOrders.sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime();
      case 'priority': {
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      case 'status': {
        const statusOrder = {
          'in-progress': 0,
          'scheduled': 1,
          'pending-approval': 2,
          'completed': 3,
          'cancelled': 4,
          'draft': 5,
        };
        return statusOrder[a.status] - statusOrder[b.status];
      }
      case 'customer':
        return a.customerName.localeCompare(b.customerName);
      default:
        return 0;
    }
  });

  // Calculate stats
  const totalCount = workOrders.length;
  const scheduledCount = workOrders.filter((wo) => wo.status === 'scheduled').length;
  const inProgressCount = workOrders.filter((wo) => wo.status === 'in-progress').length;
  const completedCount = workOrders.filter((wo) => wo.status === 'completed').length;
  const criticalCount = workOrders.filter((wo) => wo.priority === 'critical').length;

  const clearAllFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setCustomerFilter('all');
    setTechnicianFilter('all');
    setLocationFilter('');
    setDateFrom('');
    setDateTo('');
    setSortBy('date');
  };

  // If showing detail view
  if (showDetail && selectedWorkOrder) {
    return (
      <WorkOrderDetail2Enhanced
        workOrder={selectedWorkOrder}
        project={projects.find((p) => p.id === selectedWorkOrder.projectId)}
        people={people}
        roles={roles}
        onBack={() => {
          setShowDetail(false);
          setSelectedWorkOrder(null);
        }}
        onUpdate={(updates) => {
          // Update the selected work order with new changes
          const updatedWorkOrder = { ...selectedWorkOrder, ...updates };
          setSelectedWorkOrder(updatedWorkOrder);
          // Here you would typically also update the main workOrders array
          // or trigger a parent component update
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Work Orders</h1>
          <p className="text-gray-600 mt-1">
            Manage and track all work orders with powerful filtering and views
          </p>
        </div>
        <Button onClick={onNewWorkOrder}>
          <Plus className="w-4 h-4 mr-2" />
          New Work Order
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">Total</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalCount}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-gray-400" />
          </div>
        </Card>

        <Card className="p-4 bg-purple-50 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-purple-600 uppercase">Scheduled</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">{scheduledCount}</p>
            </div>
            <Clock className="w-8 h-8 text-purple-400" />
          </div>
        </Card>

        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-blue-600 uppercase">In Progress</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{inProgressCount}</p>
            </div>
            <Clock className="w-8 h-8 text-blue-400" />
          </div>
        </Card>

        <Card className="p-4 bg-emerald-50 border-emerald-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-emerald-600 uppercase">Completed</p>
              <p className="text-2xl font-bold text-emerald-900 mt-1">{completedCount}</p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
        </Card>

        <Card className="p-4 bg-red-50 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-red-600 uppercase">Critical</p>
              <p className="text-2xl font-bold text-red-900 mt-1">{criticalCount}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
        </Card>
      </div>

      {/* Controls */}
      <Card className="p-4">
        <div className="space-y-4">
          {/* Top row - Search and main filters */}
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by ID, title, client, or address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending-approval">Pending Approval</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select value={customerFilter} onValueChange={setCustomerFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Customers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Customers</SelectItem>
                {Array.from(new Set(workOrders.map((wo) => wo.customerName))).sort().map((customer) => (
                  <SelectItem key={customer} value={customer}>
                    {customer}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Scheduled Date</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="status">Status</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              {showAdvancedFilters ? 'Hide' : 'More'} Filters
            </Button>
          </div>

          {/* Advanced filters */}
          {showAdvancedFilters && (
            <div className="grid grid-cols-4 gap-3 pt-4 border-t border-gray-200">
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Date From</label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Date To</label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Technician</label>
                <Select value={technicianFilter} onValueChange={setTechnicianFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Technicians" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Technicians</SelectItem>
                    {people.map((person) => (
                      <SelectItem key={person.id} value={person.id}>
                        {person.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Location</label>
                <Input
                  placeholder="Filter by location..."
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                />
              </div>
              <div className="col-span-4 flex items-center justify-end">
                <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                  <X className="w-4 h-4 mr-2" />
                  Clear All Filters
                </Button>
              </div>
            </div>
          )}

          {/* Results count and view mode */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold">{filteredWorkOrders.length}</span> of{' '}
              <span className="font-semibold">{totalCount}</span> work orders
            </p>

            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'card' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('card')}
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('table')}
              >
                <Table className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Work Orders Display */}
      {viewMode === 'card' && (
        <WorkOrdersCardView
          workOrders={filteredWorkOrders}
          people={people}
          onWorkOrderClick={(wo) => {
            setSelectedWorkOrder(wo);
            setShowDetail(true);
          }}
        />
      )}

      {viewMode === 'table' && (
        <WorkOrdersTableView
          workOrders={filteredWorkOrders}
          people={people}
          onWorkOrderClick={(wo) => {
            setSelectedWorkOrder(wo);
            setShowDetail(true);
          }}
        />
      )}

      {viewMode === 'list' && (
        <WorkOrdersListView
          workOrders={filteredWorkOrders}
          people={people}
          onWorkOrderClick={(wo) => {
            setSelectedWorkOrder(wo);
            setShowDetail(true);
          }}
        />
      )}
    </div>
  );
}