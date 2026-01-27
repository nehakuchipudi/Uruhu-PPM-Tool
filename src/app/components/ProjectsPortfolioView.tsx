import React, { useState } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Project, Person } from '@/types';
import {
  Search,
  Filter,
  Download,
  Plus,
  ArrowUpDown,
  AlertCircle,
  TrendingUp,
  Calendar,
  Users,
  Flag,
  Sparkles,
} from 'lucide-react';

interface ProjectsPortfolioViewProps {
  projects: Project[];
  people: Person[];
  onProjectClick: (project: Project) => void;
  onNewProject: () => void;
}

export function ProjectsPortfolioView({
  projects,
  people,
  onProjectClick,
  onNewProject,
}: ProjectsPortfolioViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'endDate' | 'progress' | 'priority'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-500';
      case 'planning':
        return 'bg-blue-500';
      case 'on-hold':
        return 'bg-amber-500';
      case 'completed':
        return 'bg-gray-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getPriorityColor = (priority: Project['priority']) => {
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

  const getHealthIndicator = (project: Project) => {
    if (project.progress < 30 && project.status === 'active') {
      return { color: 'text-red-500', label: 'At Risk' };
    }
    if (project.progress >= 70) {
      return { color: 'text-green-500', label: 'On Track' };
    }
    return { color: 'text-yellow-500', label: 'Watch' };
  };

  // Filter and sort projects
  const filteredProjects = projects
    .filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = selectedStatus === 'all' || p.status === selectedStatus;
      const matchesPriority = selectedPriority === 'all' || p.priority === selectedPriority;
      const matchesCustomer = selectedCustomer === 'all' || p.customerName === selectedCustomer;
      return matchesSearch && matchesStatus && matchesPriority && matchesCustomer;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'endDate':
          comparison = new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
          break;
        case 'progress':
          comparison = a.progress - b.progress;
          break;
        case 'priority':
          const priorityOrder = { low: 1, medium: 2, high: 3, critical: 4 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  // Calculate AI insights
  const atRiskProjects = projects.filter((p) => p.progress < 30 && p.status === 'active').length;
  const avgProgress = Math.round(
    projects.reduce((sum, p) => sum + p.progress, 0) / projects.length
  );
  const delayedProjects = projects.filter(
    (p) => new Date(p.endDate) < new Date() && p.status !== 'completed'
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Project Portfolio</h2>
          <p className="text-gray-600">
            Manage and track all projects across your organization
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button onClick={onNewProject} className="gap-2">
            <Plus className="w-4 h-4" />
            New Project
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects by name, client, or ID..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="planning">Planning</option>
              <option value="active">Active</option>
              <option value="on-hold">On Hold</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Priority Filter */}
          <select
            className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
          >
            <option value="all">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>

          {/* Customer Filter */}
          <select
            className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedCustomer}
            onChange={(e) => setSelectedCustomer(e.target.value)}
          >
            <option value="all">All Customers</option>
            {Array.from(new Set(projects.map((p) => p.customerName))).sort().map((customer) => (
              <option key={customer} value={customer}>
                {customer}
              </option>
            ))}
          </select>

          {/* Sort */}
          <select
            className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
          >
            <option value="name">Sort by Name</option>
            <option value="endDate">Sort by End Date</option>
            <option value="progress">Sort by Progress</option>
            <option value="priority">Sort by Priority</option>
          </select>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            <ArrowUpDown className="w-4 h-4" />
          </Button>
        </div>
      </Card>

      {/* Projects Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="text-left p-4 text-xs font-semibold text-gray-600 uppercase">
                  Project Name
                </th>
                <th className="text-left p-4 text-xs font-semibold text-gray-600 uppercase">
                  Client/Customer
                </th>
                <th className="text-left p-4 text-xs font-semibold text-gray-600 uppercase">
                  Status
                </th>
                <th className="text-left p-4 text-xs font-semibold text-gray-600 uppercase">
                  Start Date
                </th>
                <th className="text-left p-4 text-xs font-semibold text-gray-600 uppercase">
                  Target End
                </th>
                <th className="text-left p-4 text-xs font-semibold text-gray-600 uppercase">
                  % Complete
                </th>
                <th className="text-left p-4 text-xs font-semibold text-gray-600 uppercase">
                  Owner
                </th>
                <th className="text-left p-4 text-xs font-semibold text-gray-600 uppercase">
                  Priority
                </th>
                <th className="text-left p-4 text-xs font-semibold text-gray-600 uppercase">
                  Health
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((project) => {
                const owner = people.find((p) => project.assignedTo[0] === p.id);
                const health = getHealthIndicator(project);

                return (
                  <tr
                    key={project.id}
                    onClick={() => onProjectClick(project)}
                    className="border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors"
                  >
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-gray-900">{project.name}</p>
                        <p className="text-xs text-gray-500">{project.id}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-gray-900">{project.customerName}</span>
                    </td>
                    <td className="p-4">
                      <Badge className={getStatusColor(project.status)}>
                        {project.status.replace('-', ' ')}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        {new Date(project.startDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        {new Date(project.endDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 w-20">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {project.progress}%
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{owner?.name || 'Unassigned'}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant="outline" className={getPriorityColor(project.priority)}>
                        {project.priority}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <Flag className={`w-4 h-4 ${health.color}`} />
                        <span className={`text-sm font-medium ${health.color}`}>
                          {health.label}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredProjects.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No projects found</p>
            </div>
          )}
        </div>
      </Card>

      {/* AI Insights Panel */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">AI Insights for All Projects</h3>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Sparkles className="w-4 h-4" />
            View Detailed Insights
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {/* At Risk Projects */}
          <div className="bg-white rounded-lg p-4 border border-red-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <p className="text-2xl font-bold text-gray-900">{atRiskProjects}</p>
                <p className="text-sm text-gray-600 mt-1">Projects at risk of delay</p>
              </div>
            </div>
          </div>

          {/* Average Progress */}
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-2xl font-bold text-gray-900">{avgProgress}%</p>
                <p className="text-sm text-gray-600 mt-1">Average project progress</p>
              </div>
            </div>
          </div>

          {/* Delayed Projects */}
          <div className="bg-white rounded-lg p-4 border border-orange-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <p className="text-2xl font-bold text-gray-900">{delayedProjects}</p>
                <p className="text-sm text-gray-600 mt-1">Projects past deadline</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}