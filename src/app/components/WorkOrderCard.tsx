import { WorkOrder, Person, Role } from '@/types';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Calendar, Clock, Users, Activity } from 'lucide-react';

interface WorkOrderCardProps {
  workOrder: WorkOrder;
  people: Person[];
  roles: Role[];
  onClick?: () => void;
}

export function WorkOrderCard({ workOrder, people, roles, onClick }: WorkOrderCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-500';
      case 'in-progress': return 'bg-blue-500';
      case 'scheduled': return 'bg-purple-500';
      case 'draft': return 'bg-gray-400';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const getActivityColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-amber-600 bg-amber-50';
      case 'low': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const assignedPeople = people.filter(p => workOrder.assignedTo.includes(p.id));
  const assignedRoleObjs = roles.filter(r => workOrder.assignedRoles.includes(r.id));

  return (
    <Card
      className="p-4 hover:shadow-md transition-shadow cursor-pointer border-l-4"
      style={{ borderLeftColor: workOrder.isRecurring ? '#8b5cf6' : '#e5e7eb' }}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">{workOrder.title}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">{workOrder.description}</p>
        </div>
        <Badge className={`ml-2 ${getStatusColor(workOrder.status)} text-white border-0`}>
          {workOrder.status}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
        <div className="flex items-center gap-2 text-gray-700">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{new Date(workOrder.scheduledDate).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-700">
          <Clock className="w-4 h-4 text-gray-400" />
          <span>
            {workOrder.actualDuration
              ? `${workOrder.actualDuration}h (actual)`
              : `${workOrder.estimatedDuration}h (est.)`}
          </span>
        </div>
      </div>

      {assignedPeople.length > 0 && (
        <div className="flex items-center gap-2 mb-2">
          <Users className="w-4 h-4 text-gray-400" />
          <div className="flex flex-wrap gap-1">
            {assignedPeople.map(person => (
              <span
                key={person.id}
                className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-700"
              >
                {person.name.split(' ')[0]}
              </span>
            ))}
          </div>
        </div>
      )}

      {assignedRoleObjs.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {assignedRoleObjs.map(role => (
            <Badge
              key={role.id}
              variant="outline"
              className="text-xs"
              style={{ borderColor: role.color, color: role.color }}
            >
              {role.name}
            </Badge>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-gray-400" />
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${getActivityColor(workOrder.activityLevel)}`}>
            {workOrder.activityLevel.toUpperCase()} Activity
          </span>
        </div>
        {workOrder.isRecurring && (
          <span className="text-xs text-purple-600 font-medium">🔄 Recurring</span>
        )}
      </div>

      <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-600">
        <span className="font-medium">Client:</span> {workOrder.customerName}
      </div>
    </Card>
  );
}