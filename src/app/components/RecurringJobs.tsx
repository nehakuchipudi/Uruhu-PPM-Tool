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
import { RecurringTask, Person, Role, Project } from '@/types';
import { RecurringJobsCardView } from '@/app/components/RecurringJobsCardView';
import { RecurringJobsTableView } from '@/app/components/RecurringJobsTableView';
import { RecurringJobsListView } from '@/app/components/RecurringJobsListView';
import { RecurringJobDetailEnhanced } from '@/app/components/RecurringJobDetailEnhanced';
import {
  Search,
  Plus,
  LayoutGrid,
  Table,
  List,
  Filter,
  X,
  Repeat,
  Calendar,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react';

interface RecurringJobsProps {
  recurringTasks: RecurringTask[];
  projects: Project[];
  people: Person[];
  roles: Role[];
  onNewRecurringJob: () => void;
}

export function RecurringJobs({
  recurringTasks,
  projects,
  people,
  roles,
  onNewRecurringJob,
}: RecurringJobsProps) {
  const [viewMode, setViewMode] = useState<'card' | 'table' | 'list'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [frequencyFilter, setFrequencyFilter] = useState<string>('all');
  const [activityFilter, setActivityFilter] = useState<string>('all');
  const [customerFilter, setCustomerFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'next' | 'frequency' | 'customer' | 'activity'>('next');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [technicianFilter, setTechnicianFilter] = useState<string>('all');

  const [selectedJob, setSelectedJob] = useState<RecurringTask | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  // Filter recurring tasks
  let filteredTasks = recurringTasks.filter((task) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        task.id.toLowerCase().includes(query) ||
        task.title.toLowerCase().includes(query) ||
        task.customerName.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    // Frequency filter
    if (frequencyFilter !== 'all' && task.frequency !== frequencyFilter) return false;

    // Activity filter
    if (activityFilter !== 'all' && task.activityLevel !== activityFilter) return false;

    // Customer filter
    if (customerFilter !== 'all' && task.customerName !== customerFilter) {
      return false;
    }

    // Technician filter
    if (technicianFilter !== 'all' && !task.assignedTo.includes(technicianFilter)) return false;

    return true;
  });

  // Sort recurring tasks
  filteredTasks.sort((a, b) => {
    switch (sortBy) {
      case 'next':
        return new Date(a.nextOccurrence).getTime() - new Date(b.nextOccurrence).getTime();
      case 'frequency': {
        const frequencyOrder = { daily: 0, weekly: 1, 'bi-weekly': 2, monthly: 3, quarterly: 4, custom: 5 };
        return frequencyOrder[a.frequency] - frequencyOrder[b.frequency];
      }
      case 'activity': {
        const activityOrder = { high: 0, medium: 1, low: 2 };
        return activityOrder[a.activityLevel] - activityOrder[b.activityLevel];
      }
      case 'customer':
        return a.customerName.localeCompare(b.customerName);
      default:
        return 0;
    }
  });

  // Calculate stats
  const totalCount = recurringTasks.length;
  const dailyCount = recurringTasks.filter((t) => t.frequency === 'daily').length;
  const weeklyCount = recurringTasks.filter((t) => t.frequency === 'weekly').length;
  const monthlyCount = recurringTasks.filter((t) => t.frequency === 'monthly').length;
  const totalCompleted = recurringTasks.reduce(
    (sum, t) => sum + t.completionHistory.length,
    0
  );

  const clearAllFilters = () => {
    setSearchQuery('');
    setFrequencyFilter('all');
    setActivityFilter('all');
    setCustomerFilter('all');
    setTechnicianFilter('all');
    setSortBy('next');
  };

  // If showing detail view
  if (showDetail && selectedJob) {
    return (
      <RecurringJobDetailEnhanced
        recurringTask={selectedJob}
        project={projects.find((p) => p.id === selectedJob.projectId)}
        people={people}
        roles={roles}
        onBack={() => {
          setShowDetail(false);
          setSelectedJob(null);
        }}
        onUpdate={(updates) => {
          const updatedJob = { ...selectedJob, ...updates };
          setSelectedJob(updatedJob);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Repeat className="w-8 h-8 text-blue-600" />
            Recurring Services
          </h1>
          <p className="text-gray-600 mt-1">
            Manage and track all recurring services and scheduled maintenance
          </p>
        </div>
        <Button onClick={onNewRecurringJob}>
          <Plus className="w-4 h-4 mr-2" />
          New Recurring Service
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">Total Jobs</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalCount}</p>
            </div>
            <Repeat className="w-8 h-8 text-gray-400" />
          </div>
        </Card>

        <Card className="p-4 bg-purple-50 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-purple-600 uppercase">Daily</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">{dailyCount}</p>
            </div>
            <Calendar className="w-8 h-8 text-purple-400" />
          </div>
        </Card>

        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-blue-600 uppercase">Weekly</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{weeklyCount}</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-400" />
          </div>
        </Card>

        <Card className="p-4 bg-green-50 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-green-600 uppercase">Monthly</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{monthlyCount}</p>
            </div>
            <Calendar className="w-8 h-8 text-green-400" />
          </div>
        </Card>

        <Card className="p-4 bg-emerald-50 border-emerald-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-emerald-600 uppercase">Completed</p>
              <p className="text-2xl font-bold text-emerald-900 mt-1">{totalCompleted}</p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
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
                placeholder="Search by ID, title, customer, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={frequencyFilter} onValueChange={setFrequencyFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Frequencies" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Frequencies</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="bi-weekly">Bi-Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>

            <Select value={activityFilter} onValueChange={setActivityFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Activity Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Activity Levels</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="next">Next Occurrence</SelectItem>
                <SelectItem value="frequency">Frequency</SelectItem>
                <SelectItem value="activity">Activity Level</SelectItem>
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
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-200">
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Customer</label>
                <Select value={customerFilter} onValueChange={setCustomerFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Customers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Customers</SelectItem>
                    {Array.from(new Set(recurringTasks.map((t) => t.customerName))).map((customer) => (
                      <SelectItem key={customer} value={customer}>
                        {customer}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              <div className="col-span-2 flex items-center justify-end">
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
              Showing <span className="font-semibold">{filteredTasks.length}</span> of{' '}
              <span className="font-semibold">{totalCount}</span> recurring services
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

      {/* Recurring Jobs Display */}
      {viewMode === 'card' && (
        <RecurringJobsCardView
          recurringTasks={filteredTasks}
          people={people}
          onJobClick={(job) => {
            setSelectedJob(job);
            setShowDetail(true);
          }}
        />
      )}

      {viewMode === 'table' && (
        <RecurringJobsTableView
          recurringTasks={filteredTasks}
          people={people}
          onJobClick={(job) => {
            setSelectedJob(job);
            setShowDetail(true);
          }}
        />
      )}

      {viewMode === 'list' && (
        <RecurringJobsListView
          recurringTasks={filteredTasks}
          people={people}
          onJobClick={(job) => {
            setSelectedJob(job);
            setShowDetail(true);
          }}
        />
      )}
    </div>
  );
}