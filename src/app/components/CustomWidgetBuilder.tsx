import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import {
  Plus,
  BarChart3,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  TrendingUp,
  Activity,
  DollarSign,
  Clock,
  Users,
  Target,
  X,
} from 'lucide-react';

export interface DashboardWidget {
  id: string;
  title: string;
  type: 'kpi' | 'bar' | 'line' | 'pie' | 'area';
  metric: string;
  dataSource: string;
  size: 'small' | 'medium' | 'large';
  color?: string;
  icon?: string;
}

interface CustomWidgetBuilderProps {
  onAddWidget: (widget: DashboardWidget) => void;
  existingWidgets?: DashboardWidget[];
}

export function CustomWidgetBuilder({ onAddWidget, existingWidgets = [] }: CustomWidgetBuilderProps) {
  const [open, setOpen] = useState(false);
  const [widgetConfig, setWidgetConfig] = useState<Partial<DashboardWidget>>({
    type: 'kpi',
    size: 'medium',
    color: 'blue',
  });

  const widgetTypes = [
    { value: 'kpi', label: 'KPI Card', icon: TrendingUp },
    { value: 'bar', label: 'Bar Chart', icon: BarChart3 },
    { value: 'line', label: 'Line Chart', icon: LineChartIcon },
    { value: 'pie', label: 'Pie Chart', icon: PieChartIcon },
    { value: 'area', label: 'Area Chart', icon: Activity },
  ];

  const metrics = [
    { value: 'total-budget', label: 'Total Budget', dataSource: 'projects' },
    { value: 'active-projects', label: 'Active Projects', dataSource: 'projects' },
    { value: 'completed-projects', label: 'Completed Projects', dataSource: 'projects' },
    { value: 'project-progress', label: 'Average Project Progress', dataSource: 'projects' },
    { value: 'work-orders-total', label: 'Total Work Orders', dataSource: 'work-orders' },
    { value: 'work-orders-completed', label: 'Completed Work Orders', dataSource: 'work-orders' },
    { value: 'work-order-completion-rate', label: 'Work Order Completion Rate', dataSource: 'work-orders' },
    { value: 'tasks-total', label: 'Total Tasks', dataSource: 'tasks' },
    { value: 'tasks-completed', label: 'Completed Tasks', dataSource: 'tasks' },
    { value: 'task-completion-rate', label: 'Task Completion Rate', dataSource: 'tasks' },
    { value: 'team-members', label: 'Team Members', dataSource: 'people' },
    { value: 'estimated-hours', label: 'Estimated Hours', dataSource: 'tasks' },
    { value: 'actual-hours', label: 'Actual Hours', dataSource: 'tasks' },
    { value: 'hours-variance', label: 'Hours Variance', dataSource: 'tasks' },
    { value: 'priority-distribution', label: 'Priority Distribution', dataSource: 'projects' },
    { value: 'status-distribution', label: 'Status Distribution', dataSource: 'projects' },
    { value: 'monthly-trend', label: 'Monthly Trend', dataSource: 'work-orders' },
  ];

  const sizes = [
    { value: 'small', label: 'Small (1x1)' },
    { value: 'medium', label: 'Medium (2x1)' },
    { value: 'large', label: 'Large (2x2)' },
  ];

  const colors = [
    { value: 'blue', label: 'Blue', colorClass: 'bg-blue-500' },
    { value: 'green', label: 'Green', colorClass: 'bg-green-500' },
    { value: 'orange', label: 'Orange', colorClass: 'bg-orange-500' },
    { value: 'purple', label: 'Purple', colorClass: 'bg-purple-500' },
    { value: 'red', label: 'Red', colorClass: 'bg-red-500' },
    { value: 'gray', label: 'Gray', colorClass: 'bg-gray-500' },
  ];

  const icons = [
    { value: 'dollar-sign', label: 'Dollar Sign', Icon: DollarSign },
    { value: 'target', label: 'Target', Icon: Target },
    { value: 'trending-up', label: 'Trending Up', Icon: TrendingUp },
    { value: 'activity', label: 'Activity', Icon: Activity },
    { value: 'clock', label: 'Clock', Icon: Clock },
    { value: 'users', label: 'Users', Icon: Users },
  ];

  const handleCreateWidget = () => {
    if (!widgetConfig.title || !widgetConfig.metric) {
      alert('Please fill in all required fields');
      return;
    }

    const selectedMetric = metrics.find(m => m.value === widgetConfig.metric);
    
    const newWidget: DashboardWidget = {
      id: `widget-${Date.now()}`,
      title: widgetConfig.title || '',
      type: widgetConfig.type || 'kpi',
      metric: widgetConfig.metric || '',
      dataSource: selectedMetric?.dataSource || 'projects',
      size: widgetConfig.size || 'medium',
      color: widgetConfig.color,
      icon: widgetConfig.icon,
    };

    onAddWidget(newWidget);
    setOpen(false);
    setWidgetConfig({ type: 'kpi', size: 'medium', color: 'blue' });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Add Custom Widget
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Create Custom Widget</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Widget Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Widget Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Monthly Revenue"
              value={widgetConfig.title || ''}
              onChange={(e) => setWidgetConfig({ ...widgetConfig, title: e.target.value })}
            />
          </div>

          {/* Widget Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Widget Type *</Label>
            <div className="grid grid-cols-3 gap-3">
              {widgetTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <Card
                    key={type.value}
                    className={`p-4 cursor-pointer hover:border-blue-500 transition-colors ${
                      widgetConfig.type === type.value ? 'border-blue-500 bg-blue-50' : ''
                    }`}
                    onClick={() => setWidgetConfig({ ...widgetConfig, type: type.value as any })}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Icon className="w-6 h-6" />
                      <span className="text-sm font-medium">{type.label}</span>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Metric Selection */}
          <div className="space-y-2">
            <Label htmlFor="metric">Metric *</Label>
            <Select
              value={widgetConfig.metric}
              onValueChange={(value) => setWidgetConfig({ ...widgetConfig, metric: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a metric" />
              </SelectTrigger>
              <SelectContent>
                {metrics.map((metric) => (
                  <SelectItem key={metric.value} value={metric.value}>
                    {metric.label}
                    <Badge variant="outline" className="ml-2 text-xs">
                      {metric.dataSource}
                    </Badge>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Size Selection */}
          <div className="space-y-2">
            <Label htmlFor="size">Widget Size</Label>
            <Select
              value={widgetConfig.size}
              onValueChange={(value) => setWidgetConfig({ ...widgetConfig, size: value as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sizes.map((size) => (
                  <SelectItem key={size.value} value={size.value}>
                    {size.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Color Selection (for KPI cards) */}
          {widgetConfig.type === 'kpi' && (
            <div className="space-y-2">
              <Label>Color Theme</Label>
              <div className="grid grid-cols-6 gap-2">
                {colors.map((color) => (
                  <div
                    key={color.value}
                    className={`p-3 rounded-lg cursor-pointer border-2 transition-all ${
                      widgetConfig.color === color.value ? 'border-gray-900 scale-110' : 'border-gray-200'
                    }`}
                    onClick={() => setWidgetConfig({ ...widgetConfig, color: color.value })}
                  >
                    <div className={`w-full h-8 rounded ${color.colorClass}`} />
                    <p className="text-xs text-center mt-1">{color.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Icon Selection (for KPI cards) */}
          {widgetConfig.type === 'kpi' && (
            <div className="space-y-2">
              <Label>Icon</Label>
              <div className="grid grid-cols-6 gap-2">
                {icons.map((icon) => {
                  const Icon = icon.Icon;
                  return (
                    <Card
                      key={icon.value}
                      className={`p-3 cursor-pointer hover:border-blue-500 transition-colors ${
                        widgetConfig.icon === icon.value ? 'border-blue-500 bg-blue-50' : ''
                      }`}
                      onClick={() => setWidgetConfig({ ...widgetConfig, icon: icon.value })}
                    >
                      <Icon className="w-6 h-6 mx-auto" />
                      <p className="text-xs text-center mt-1">{icon.label}</p>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Preview */}
          {widgetConfig.title && widgetConfig.metric && (
            <div className="space-y-2">
              <Label>Preview</Label>
              <Card className="p-4 bg-gray-50">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{widgetConfig.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {widgetConfig.type === 'kpi' ? '...' : `${widgetConfig.type} chart`}
                    </p>
                    <Badge variant="outline" className="mt-2">
                      {metrics.find(m => m.value === widgetConfig.metric)?.label}
                    </Badge>
                  </div>
                  {widgetConfig.type === 'kpi' && widgetConfig.icon && (
                    <div className={`p-3 rounded-lg ${
                      widgetConfig.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                      widgetConfig.color === 'green' ? 'bg-green-50 text-green-600' :
                      widgetConfig.color === 'orange' ? 'bg-orange-50 text-orange-600' :
                      widgetConfig.color === 'purple' ? 'bg-purple-50 text-purple-600' :
                      widgetConfig.color === 'red' ? 'bg-red-50 text-red-600' :
                      'bg-gray-50 text-gray-600'
                    }`}>
                      {icons.find(i => i.value === widgetConfig.icon)?.Icon && 
                        (() => {
                          const Icon = icons.find(i => i.value === widgetConfig.icon)!.Icon;
                          return <Icon className="w-6 h-6" />;
                        })()
                      }
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreateWidget}>
            Create Widget
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface CustomWidgetDisplayProps {
  widget: DashboardWidget;
  data: any;
  onRemove?: (widgetId: string) => void;
}

export function CustomWidgetDisplay({ widget, data, onRemove }: CustomWidgetDisplayProps) {
  const getIcon = () => {
    const iconMap: { [key: string]: any } = {
      'dollar-sign': DollarSign,
      'target': Target,
      'trending-up': TrendingUp,
      'activity': Activity,
      'clock': Clock,
      'users': Users,
    };
    return iconMap[widget.icon || 'activity'];
  };

  const Icon = getIcon();

  const getColorClasses = () => {
    const colorMap = {
      blue: 'bg-blue-50 text-blue-600',
      green: 'bg-green-50 text-green-600',
      orange: 'bg-orange-50 text-orange-600',
      purple: 'bg-purple-50 text-purple-600',
      red: 'bg-red-50 text-red-600',
      gray: 'bg-gray-50 text-gray-600',
    };
    return colorMap[widget.color as keyof typeof colorMap] || colorMap.blue;
  };

  if (widget.type === 'kpi') {
    return (
      <Card className="p-6 relative group">
        {onRemove && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => onRemove(widget.id)}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{widget.title}</p>
            <p className="text-3xl font-bold text-gray-900 mb-1">{data.value || '—'}</p>
            {data.subtitle && <p className="text-sm text-gray-500">{data.subtitle}</p>}
            {data.trend && (
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className={`w-4 h-4 ${data.trend === 'up' ? 'text-green-600' : 'text-red-600'}`} />
                <span className={`text-sm font-medium ${data.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {data.trendValue}
                </span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-lg ${getColorClasses()}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 relative group">
      {onRemove && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
          onClick={() => onRemove(widget.id)}
        >
          <X className="w-4 h-4" />
        </Button>
      )}
      <h3 className="font-semibold text-lg mb-4">{widget.title}</h3>
      <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="text-center text-gray-500">
          <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>{widget.type.charAt(0).toUpperCase() + widget.type.slice(1)} Chart</p>
          <p className="text-sm mt-1">{widget.metric}</p>
        </div>
      </div>
    </Card>
  );
}