import React, { useState, useMemo, useCallback } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import {
  FileText,
  Search,
  Plus,
  Download,
  Filter,
  X,
  Save,
  Table as TableIcon,
  ChevronDown,
  ChevronUp,
  Settings,
  Calendar,
  Users,
  Briefcase,
  FileSpreadsheet,
  Clock,
  DollarSign,
  CheckCircle,
  AlertCircle,
  ArrowUpDown,
} from 'lucide-react';
import { Project, WorkOrder, Quote, RecurringTask, Person } from '@/types';

interface CustomReport {
  id: string;
  name: string;
  dataSource: 'projects' | 'workOrders' | 'quotes' | 'recurring';
  filters: ReportFilter[];
  columns: string[];
  groupBy?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  savedAt?: Date;
}

interface ReportFilter {
  field: string;
  operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'between';
  value: string | string[];
}

interface ReportsProps {
  projects: Project[];
  workOrders: WorkOrder[];
  quotes: Quote[];
  recurringTasks: RecurringTask[];
  people: Person[];
  onViewReport: (reportId: string) => void;
}

export function Reports({
  projects,
  workOrders,
  quotes,
  recurringTasks,
  people,
  onViewReport,
}: ReportsProps) {
  const [activeTab, setActiveTab] = useState<'templates' | 'custom'>('templates');
  const [showReportBuilder, setShowReportBuilder] = useState(false);
  const [savedReports, setSavedReports] = useState<CustomReport[]>([]);
  
  // Report Builder State
  const [reportName, setReportName] = useState('');
  const [dataSource, setDataSource] = useState<'projects' | 'workOrders' | 'quotes' | 'recurring'>('projects');
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [filters, setFilters] = useState<ReportFilter[]>([]);
  const [groupBy, setGroupBy] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Active Report View
  const [activeReport, setActiveReport] = useState<CustomReport | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Predefined Report Templates
  const reportTemplates = [
    {
      id: 'all-projects',
      name: 'All Projects',
      description: 'Complete list of all projects with key details',
      dataSource: 'projects' as const,
      icon: <Briefcase className="w-5 h-5" />,
      columns: ['name', 'customer', 'status', 'startDate', 'endDate', 'budget', 'progress'],
    },
    {
      id: 'active-projects',
      name: 'Active Projects',
      description: 'Currently active projects only',
      dataSource: 'projects' as const,
      icon: <CheckCircle className="w-5 h-5" />,
      columns: ['name', 'customer', 'startDate', 'endDate', 'budget', 'progress'],
      filters: [{ field: 'status', operator: 'equals' as const, value: 'active' }],
    },
    {
      id: 'overdue-projects',
      name: 'Overdue Projects',
      description: 'Projects past their end date',
      dataSource: 'projects' as const,
      icon: <AlertCircle className="w-5 h-5" />,
      columns: ['name', 'customer', 'endDate', 'status', 'progress'],
      filters: [{ field: 'status', operator: 'equals' as const, value: 'active' }],
    },
    {
      id: 'budget-summary',
      name: 'Budget Summary',
      description: 'Financial overview of all projects',
      dataSource: 'projects' as const,
      icon: <DollarSign className="w-5 h-5" />,
      columns: ['name', 'customer', 'budget', 'status', 'progress'],
    },
    {
      id: 'all-work-orders',
      name: 'All Work Orders',
      description: 'Complete list of work orders',
      dataSource: 'workOrders' as const,
      icon: <FileSpreadsheet className="w-5 h-5" />,
      columns: ['id', 'title', 'customer', 'status', 'priority', 'assignedTo', 'dueDate'],
    },
    {
      id: 'open-work-orders',
      name: 'Open Work Orders',
      description: 'Work orders that are not completed',
      dataSource: 'workOrders' as const,
      icon: <FileText className="w-5 h-5" />,
      columns: ['id', 'title', 'customer', 'priority', 'assignedTo', 'dueDate'],
      filters: [{ field: 'status', operator: 'equals' as const, value: 'open' }],
    },
    {
      id: 'all-quotes',
      name: 'All Quotes',
      description: 'Complete list of quotes',
      dataSource: 'quotes' as const,
      icon: <FileText className="w-5 h-5" />,
      columns: ['id', 'title', 'customer', 'amount', 'status', 'validUntil'],
    },
    {
      id: 'recurring-services',
      name: 'Recurring Services',
      description: 'All recurring service schedules',
      dataSource: 'recurring' as const,
      icon: <Clock className="w-5 h-5" />,
      columns: ['title', 'customer', 'frequency', 'nextDate', 'assignedTo'],
    },
  ];

  // Column definitions for each data source
  const columnDefinitions = {
    projects: [
      { id: 'name', label: 'Project Name', sortable: true },
      { id: 'customer', label: 'Customer', sortable: true },
      { id: 'status', label: 'Status', sortable: true },
      { id: 'startDate', label: 'Start Date', sortable: true },
      { id: 'endDate', label: 'End Date', sortable: true },
      { id: 'budget', label: 'Budget', sortable: true },
      { id: 'progress', label: 'Progress', sortable: true },
      { id: 'priority', label: 'Priority', sortable: true },
    ],
    workOrders: [
      { id: 'id', label: 'WO ID', sortable: true },
      { id: 'title', label: 'Title', sortable: true },
      { id: 'customer', label: 'Customer', sortable: true },
      { id: 'status', label: 'Status', sortable: true },
      { id: 'priority', label: 'Priority', sortable: true },
      { id: 'assignedTo', label: 'Assigned To', sortable: true },
      { id: 'dueDate', label: 'Due Date', sortable: true },
      { id: 'createdDate', label: 'Created', sortable: true },
    ],
    quotes: [
      { id: 'id', label: 'Quote ID', sortable: true },
      { id: 'title', label: 'Title', sortable: true },
      { id: 'customer', label: 'Customer', sortable: true },
      { id: 'amount', label: 'Amount', sortable: true },
      { id: 'status', label: 'Status', sortable: true },
      { id: 'validUntil', label: 'Valid Until', sortable: true },
      { id: 'createdDate', label: 'Created', sortable: true },
    ],
    recurring: [
      { id: 'title', label: 'Service', sortable: true },
      { id: 'customer', label: 'Customer', sortable: true },
      { id: 'frequency', label: 'Frequency', sortable: true },
      { id: 'nextDate', label: 'Next Date', sortable: true },
      { id: 'assignedTo', label: 'Assigned To', sortable: true },
    ],
  };

  const handleCreateCustomReport = () => {
    setShowReportBuilder(true);
    setReportName('');
    setDataSource('projects');
    setSelectedColumns([]);
    setFilters([]);
    setGroupBy('');
    setSortBy('');
    setActiveReport(null);
  };

  const handleSaveReport = () => {
    const newReport: CustomReport = {
      id: `custom-${Date.now()}`,
      name: reportName || 'Untitled Report',
      dataSource,
      filters,
      columns: selectedColumns,
      groupBy,
      sortBy,
      sortOrder,
      savedAt: new Date(),
    };
    setSavedReports([...savedReports, newReport]);
    setActiveReport(newReport);
    setShowReportBuilder(false);
  };

  const handleLoadTemplate = (template: typeof reportTemplates[0]) => {
    setActiveReport({
      id: template.id,
      name: template.name,
      dataSource: template.dataSource,
      filters: template.filters || [],
      columns: template.columns,
    });
    setShowReportBuilder(false);
  };

  const handleDeleteReport = (reportId: string) => {
    setSavedReports(savedReports.filter(r => r.id !== reportId));
    if (activeReport?.id === reportId) {
      setActiveReport(null);
    }
  };

  const addFilter = () => {
    setFilters([...filters, { field: '', operator: 'equals', value: '' }]);
  };

  const updateFilter = (index: number, updates: Partial<ReportFilter>) => {
    const newFilters = [...filters];
    newFilters[index] = { ...newFilters[index], ...updates };
    setFilters(newFilters);
  };

  const removeFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  const toggleColumn = (columnId: string) => {
    if (selectedColumns.includes(columnId)) {
      setSelectedColumns(selectedColumns.filter(c => c !== columnId));
    } else {
      setSelectedColumns([...selectedColumns, columnId]);
    }
  };

  const handleExportCSV = () => {
    if (!activeReport) return;
    
    const data = getReportData();
    const headers = activeReport.columns.map(col => 
      columnDefinitions[activeReport.dataSource].find(c => c.id === col)?.label || col
    );
    
    let csv = headers.join(',') + '\n';
    data.forEach(row => {
      const values = activeReport.columns.map(col => {
        const value = (row as any)[col];
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
      });
      csv += values.join(',') + '\n';
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeReport.name.replace(/\s+/g, '_')}.csv`;
    a.click();
  };

  const getReportData = () => {
    if (!activeReport) return [];
    
    let data: any[] = [];
    
    switch (activeReport.dataSource) {
      case 'projects':
        data = projects.map(p => ({
          name: p.name,
          customer: p.customer,
          status: p.status,
          startDate: p.startDate ? new Date(p.startDate).toLocaleDateString() : '',
          endDate: p.endDate ? new Date(p.endDate).toLocaleDateString() : '',
          budget: p.budget ? `$${p.budget.toLocaleString()}` : '',
          progress: p.progress ? `${p.progress}%` : '0%',
          priority: p.priority || 'Medium',
        }));
        break;
      case 'workOrders':
        data = workOrders.map(wo => ({
          id: wo.id,
          title: wo.title,
          customer: wo.customer,
          status: wo.status,
          priority: wo.priority,
          assignedTo: wo.assignedTo || 'Unassigned',
          dueDate: wo.dueDate ? new Date(wo.dueDate).toLocaleDateString() : '',
          createdDate: wo.createdDate ? new Date(wo.createdDate).toLocaleDateString() : '',
        }));
        break;
      case 'quotes':
        data = quotes.map(q => ({
          id: q.id,
          title: q.title,
          customer: q.customer,
          amount: q.amount ? `$${q.amount.toLocaleString()}` : '',
          status: q.status,
          validUntil: q.validUntil ? new Date(q.validUntil).toLocaleDateString() : '',
          createdDate: q.createdDate ? new Date(q.createdDate).toLocaleDateString() : '',
        }));
        break;
      case 'recurring':
        data = recurringTasks.map(rt => ({
          title: rt.title,
          customer: rt.customer || '',
          frequency: rt.frequency,
          nextDate: rt.nextDate ? new Date(rt.nextDate).toLocaleDateString() : '',
          assignedTo: rt.assignedTo || 'Unassigned',
        }));
        break;
    }
    
    // Apply filters
    activeReport.filters.forEach(filter => {
      if (filter.field && filter.value) {
        data = data.filter(item => {
          const fieldValue = String(item[filter.field] || '').toLowerCase();
          const filterValue = String(filter.value).toLowerCase();
          
          switch (filter.operator) {
            case 'equals':
              return fieldValue === filterValue;
            case 'contains':
              return fieldValue.includes(filterValue);
            default:
              return true;
          }
        });
      }
    });
    
    // Apply search
    if (searchQuery) {
      data = data.filter(item =>
        Object.values(item).some(value =>
          String(value).toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
    
    return data;
  };

  const ReportBuilderPanel = () => (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Custom Report Builder</h2>
          <Button variant="ghost" size="sm" onClick={() => setShowReportBuilder(false)}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Report Name */}
        <div>
          <label className="block text-sm font-medium mb-2">Report Name</label>
          <Input
            placeholder="Enter report name..."
            value={reportName}
            onChange={(e) => setReportName(e.target.value)}
          />
        </div>

        {/* Data Source */}
        <div>
          <label className="block text-sm font-medium mb-2">Data Source</label>
          <Select value={dataSource} onValueChange={(value: any) => {
            setDataSource(value);
            setSelectedColumns([]);
          }}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="projects">Projects</SelectItem>
              <SelectItem value="workOrders">Work Orders</SelectItem>
              <SelectItem value="quotes">Quotes</SelectItem>
              <SelectItem value="recurring">Recurring Services</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Columns */}
        <div>
          <label className="block text-sm font-medium mb-2">Select Columns</label>
          <div className="grid grid-cols-2 gap-2">
            {columnDefinitions[dataSource].map(col => (
              <label key={col.id} className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-accent">
                <input
                  type="checkbox"
                  checked={selectedColumns.includes(col.id)}
                  onChange={() => toggleColumn(col.id)}
                  className="rounded"
                />
                <span className="text-sm">{col.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium">Filters</label>
            <Button variant="outline" size="sm" onClick={addFilter}>
              <Plus className="w-3 h-3 mr-1" />
              Add Filter
            </Button>
          </div>
          <div className="space-y-2">
            {filters.map((filter, index) => (
              <div key={index} className="flex gap-2 items-center">
                <Select
                  value={filter.field}
                  onValueChange={(value) => updateFilter(index, { field: value })}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Field" />
                  </SelectTrigger>
                  <SelectContent>
                    {columnDefinitions[dataSource].map(col => (
                      <SelectItem key={col.id} value={col.id}>{col.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={filter.operator}
                  onValueChange={(value: any) => updateFilter(index, { operator: value })}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equals">Equals</SelectItem>
                    <SelectItem value="contains">Contains</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Value"
                  value={filter.value as string}
                  onChange={(e) => updateFilter(index, { value: e.target.value })}
                  className="flex-1"
                />
                <Button variant="ghost" size="sm" onClick={() => removeFilter(index)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t">
          <Button type="button" onClick={handleSaveReport} disabled={!reportName || selectedColumns.length === 0}>
            <Save className="w-4 h-4 mr-2" />
            Save Report
          </Button>
          <Button type="button" variant="outline" onClick={() => setShowReportBuilder(false)}>
            Cancel
          </Button>
        </div>
      </div>
    </Card>
  );

  const ReportTableView = () => {
    if (!activeReport) return null;

    const data = getReportData();
    const [localSortBy, setLocalSortBy] = useState<string>('');
    const [localSortOrder, setLocalSortOrder] = useState<'asc' | 'desc'>('asc');

    const sortedData = useMemo(() => {
      if (!localSortBy) return data;
      
      return [...data].sort((a, b) => {
        const aValue = a[localSortBy];
        const bValue = b[localSortBy];
        
        if (aValue === bValue) return 0;
        
        const comparison = aValue < bValue ? -1 : 1;
        return localSortOrder === 'asc' ? comparison : -comparison;
      });
    }, [data, localSortBy, localSortOrder]);

    const handleSort = (columnId: string) => {
      if (localSortBy === columnId) {
        setLocalSortOrder(localSortOrder === 'asc' ? 'desc' : 'asc');
      } else {
        setLocalSortBy(columnId);
        setLocalSortOrder('asc');
      }
    };

    return (
      <div className="space-y-4">
        {/* Report Header */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{activeReport.name}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {sortedData.length} records found
                {activeReport.savedAt && ` • Saved ${new Date(activeReport.savedAt).toLocaleDateString()}`}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExportCSV}>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Button variant="outline" size="sm" onClick={() => setActiveReport(null)}>
                Close
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search in report..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </Card>

        {/* Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b">
                <tr>
                  {activeReport.columns.map(columnId => {
                    const columnDef = columnDefinitions[activeReport.dataSource].find(c => c.id === columnId);
                    return (
                      <th
                        key={columnId}
                        className="px-6 py-4 text-left text-sm font-semibold cursor-pointer hover:bg-muted/70"
                        onClick={() => columnDef?.sortable && handleSort(columnId)}
                      >
                        <div className="flex items-center gap-2">
                          {columnDef?.label || columnId}
                          {columnDef?.sortable && (
                            <span className="text-muted-foreground">
                              {localSortBy === columnId ? (
                                localSortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ArrowUpDown className="w-3 h-3" />
                              )}
                            </span>
                          )}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {sortedData.length === 0 ? (
                  <tr>
                    <td colSpan={activeReport.columns.length} className="px-6 py-12 text-center text-muted-foreground">
                      No data found
                    </td>
                  </tr>
                ) : (
                  sortedData.map((row, index) => (
                    <tr key={index} className="border-b hover:bg-muted/30">
                      {activeReport.columns.map(columnId => (
                        <td key={columnId} className="px-6 py-4 text-sm">
                          {columnId === 'status' ? (
                            <Badge variant={
                              row[columnId] === 'active' || row[columnId] === 'open' ? 'default' :
                              row[columnId] === 'completed' ? 'secondary' : 'outline'
                            }>
                              {row[columnId]}
                            </Badge>
                          ) : columnId === 'priority' ? (
                            <Badge variant={
                              row[columnId] === 'high' ? 'destructive' :
                              row[columnId] === 'medium' ? 'default' : 'secondary'
                            }>
                              {row[columnId]}
                            </Badge>
                          ) : (
                            row[columnId] || '-'
                          )}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground mt-1">
            Create custom reports or use predefined templates
          </p>
        </div>
        <Button onClick={handleCreateCustomReport} className="gap-2">
          <Plus className="w-4 h-4" />
          Create Custom Report
        </Button>
      </div>

      {/* Show Report Builder or Report View */}
      {showReportBuilder ? (
        <ReportBuilderPanel />
      ) : activeReport ? (
        <ReportTableView />
      ) : (
        <>
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)}>
            <TabsList>
              <TabsTrigger value="templates">Report Templates</TabsTrigger>
              <TabsTrigger value="custom">
                My Reports ({savedReports.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="templates" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reportTemplates.map(template => (
                  <Card
                    key={template.id}
                    className="p-6 cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-blue-200 dark:hover:border-blue-800"
                    onClick={() => handleLoadTemplate(template)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400">
                        {template.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{template.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {template.description}
                        </p>
                        <div className="flex items-center gap-2 mt-3">
                          <Badge variant="secondary" className="text-xs">
                            <TableIcon className="w-3 h-3 mr-1" />
                            {template.columns.length} columns
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="custom" className="mt-6">
              {savedReports.length === 0 ? (
                <Card className="p-12">
                  <div className="text-center">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      No Custom Reports Yet
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Create your first custom report to get started
                    </p>
                    <Button onClick={handleCreateCustomReport}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Report
                    </Button>
                  </div>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {savedReports.map(report => (
                    <Card
                      key={report.id}
                      className="p-6 cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-blue-200 dark:hover:border-blue-800"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1" onClick={() => setActiveReport(report)}>
                          <h3 className="font-semibold text-foreground">{report.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {report.dataSource === 'projects' ? 'Projects' :
                             report.dataSource === 'workOrders' ? 'Work Orders' :
                             report.dataSource === 'quotes' ? 'Quotes' : 'Recurring Services'}
                          </p>
                          <div className="flex items-center gap-2 mt-3">
                            <Badge variant="secondary" className="text-xs">
                              <TableIcon className="w-3 h-3 mr-1" />
                              {report.columns.length} columns
                            </Badge>
                            {report.filters.length > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                <Filter className="w-3 h-3 mr-1" />
                                {report.filters.length} filters
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteReport(report.id);
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}