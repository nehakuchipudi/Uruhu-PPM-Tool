import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Instance, WorkOrder, Task } from '@/types';

interface ColorLegendProps {
  instances?: Instance[];
  showStatuses?: boolean;
  showPriorities?: boolean;
  showActivityLevels?: boolean;
  compact?: boolean;
}

export function ColorLegend({
  instances = [],
  showStatuses = false,
  showPriorities = false,
  showActivityLevels = false,
  compact = false,
}: ColorLegendProps) {
  const statusColors = [
    { label: 'Draft', color: 'bg-gray-500', status: 'draft' as const },
    { label: 'Scheduled', color: 'bg-blue-500', status: 'scheduled' as const },
    { label: 'In Progress', color: 'bg-yellow-500', status: 'in-progress' as const },
    { label: 'Completed', color: 'bg-green-500', status: 'completed' as const },
    { label: 'Cancelled', color: 'bg-red-500', status: 'cancelled' as const },
  ];

  const taskStatuses = [
    { label: 'To Do', color: 'bg-gray-500', status: 'todo' as const },
    { label: 'In Progress', color: 'bg-yellow-500', status: 'in-progress' as const },
    { label: 'Review', color: 'bg-purple-500', status: 'review' as const },
    { label: 'Completed', color: 'bg-green-500', status: 'completed' as const },
  ];

  const priorities = [
    { label: 'Critical', color: 'bg-red-100 text-red-700 border-red-300', priority: 'critical' as const },
    { label: 'High', color: 'bg-orange-100 text-orange-700 border-orange-300', priority: 'high' as const },
    { label: 'Medium', color: 'bg-yellow-100 text-yellow-700 border-yellow-300', priority: 'medium' as const },
    { label: 'Low', color: 'bg-green-100 text-green-700 border-green-300', priority: 'low' as const },
  ];

  const activityLevels = [
    { label: 'High Activity', color: 'bg-red-100 text-red-700 border-red-300', level: 'high' as const },
    { label: 'Medium Activity', color: 'bg-yellow-100 text-yellow-700 border-yellow-300', level: 'medium' as const },
    { label: 'Low Activity', color: 'bg-green-100 text-green-700 border-green-300', level: 'low' as const },
  ];

  if (compact) {
    return (
      <div className="flex items-center gap-4 flex-wrap text-xs">
        {instances.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-gray-600 font-medium">Instances:</span>
            {instances.map(instance => (
              <div key={instance.id} className="flex items-center gap-1">
                <div
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: instance.primaryColor }}
                />
                <span className="text-gray-700">{instance.name}</span>
              </div>
            ))}
          </div>
        )}
        {showStatuses && (
          <div className="flex items-center gap-2">
            <span className="text-gray-600 font-medium">Status:</span>
            {statusColors.map(status => (
              <div key={status.status} className="flex items-center gap-1">
                <div className={`w-3 h-3 rounded-full ${status.color}`} />
                <span className="text-gray-700">{status.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-3">Color Legend</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Instances */}
        {instances.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Instances</h4>
            <div className="space-y-2">
              {instances.map(instance => (
                <div key={instance.id} className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-sm"
                    style={{ backgroundColor: instance.primaryColor }}
                  />
                  <span className="text-sm text-gray-700">{instance.logo} {instance.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Work Order Status */}
        {showStatuses && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Work Order Status</h4>
            <div className="space-y-2">
              {statusColors.map(status => (
                <div key={status.status} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full ${status.color}`} />
                  <span className="text-sm text-gray-700">{status.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Task Status */}
        {showStatuses && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Task Status</h4>
            <div className="space-y-2">
              {taskStatuses.map(status => (
                <div key={status.status} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full ${status.color}`} />
                  <span className="text-sm text-gray-700">{status.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Priorities */}
        {showPriorities && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Priority Levels</h4>
            <div className="space-y-2">
              {priorities.map(priority => (
                <Badge
                  key={priority.priority}
                  variant="outline"
                  className={`${priority.color} border`}
                >
                  {priority.label}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Activity Levels */}
        {showActivityLevels && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Activity Levels</h4>
            <div className="space-y-2">
              {activityLevels.map(level => (
                <Badge
                  key={level.level}
                  variant="outline"
                  className={`${level.color} border`}
                >
                  {level.label}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

// Helper functions to get consistent colors throughout the app
export const getStatusColor = (status: WorkOrder['status'] | Task['status']) => {
  const colors = {
    // Work Order statuses
    draft: 'bg-gray-500',
    scheduled: 'bg-blue-500',
    'in-progress': 'bg-yellow-500',
    completed: 'bg-green-500',
    cancelled: 'bg-red-500',
    // Task statuses
    todo: 'bg-gray-500',
    review: 'bg-purple-500',
  };
  return colors[status] || 'bg-gray-500';
};

export const getStatusBadgeColor = (status: WorkOrder['status'] | Task['status']) => {
  const colors = {
    // Work Order statuses
    draft: 'bg-gray-100 text-gray-700 border-gray-300',
    scheduled: 'bg-blue-100 text-blue-700 border-blue-300',
    'in-progress': 'bg-yellow-100 text-yellow-700 border-yellow-300',
    completed: 'bg-green-100 text-green-700 border-green-300',
    cancelled: 'bg-red-100 text-red-700 border-red-300',
    // Task statuses
    todo: 'bg-gray-100 text-gray-700 border-gray-300',
    review: 'bg-purple-100 text-purple-700 border-purple-300',
  };
  return colors[status] || 'bg-gray-100 text-gray-700 border-gray-300';
};

export const getPriorityColor = (priority: 'low' | 'medium' | 'high' | 'critical') => {
  const colors = {
    critical: 'bg-red-100 text-red-700 border-red-300',
    high: 'bg-orange-100 text-orange-700 border-orange-300',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    low: 'bg-green-100 text-green-700 border-green-300',
  };
  return colors[priority];
};

export const getActivityColor = (level: 'low' | 'medium' | 'high') => {
  const colors = {
    low: 'bg-green-100 text-green-700 border-green-300',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    high: 'bg-red-100 text-red-700 border-red-300',
  };
  return colors[level];
};

export const getInstanceColor = (instanceId: string, instances: Instance[]) => {
  const instance = instances.find(c => c.id === instanceId);
  return instance?.primaryColor || '#6b7280';
};