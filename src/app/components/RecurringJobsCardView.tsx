import React from 'react';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { RecurringTask, Person } from '@/types';
import { Calendar, User, Clock, Repeat, ChevronRight, TrendingUp } from 'lucide-react';

interface RecurringJobsCardViewProps {
  recurringTasks: RecurringTask[];
  people: Person[];
  onJobClick: (job: RecurringTask) => void;
}

export function RecurringJobsCardView({
  recurringTasks,
  people,
  onJobClick,
}: RecurringJobsCardViewProps) {
  const getTechnicianName = (id: string) => {
    return people.find((p) => p.id === id)?.name || 'Unknown';
  };

  const getFrequencyColor = (frequency: RecurringTask['frequency']) => {
    switch (frequency) {
      case 'daily':
        return 'border-purple-500 text-purple-700 bg-purple-50';
      case 'weekly':
        return 'border-blue-500 text-blue-700 bg-blue-50';
      case 'bi-weekly':
        return 'border-cyan-500 text-cyan-700 bg-cyan-50';
      case 'monthly':
        return 'border-green-500 text-green-700 bg-green-50';
      case 'quarterly':
        return 'border-orange-500 text-orange-700 bg-orange-50';
      default:
        return 'border-gray-500 text-gray-700 bg-gray-50';
    }
  };

  const getActivityColor = (level: RecurringTask['activityLevel']) => {
    switch (level) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      default:
        return 'bg-green-500';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {recurringTasks.map((job) => (
        <Card
          key={job.id}
          className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => onJobClick(job)}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Repeat className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-mono text-gray-500">#{job.id}</span>
            </div>
            <Badge variant="outline" className={getFrequencyColor(job.frequency)}>
              {job.frequency}
            </Badge>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{job.title}</h3>

          {/* Customer */}
          <p className="text-sm text-gray-600 mb-3">{job.customerName}</p>

          {/* Details */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-500">Next:</span>
              <span>
                {new Date(job.nextOccurrence).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>{job.estimatedDuration} hours</span>
            </div>

            {job.assignedTo.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <User className="w-4 h-4 text-gray-400" />
                <span>{getTechnicianName(job.assignedTo[0])}</span>
                {job.assignedTo.length > 1 && (
                  <span className="text-xs text-gray-500">+{job.assignedTo.length - 1}</span>
                )}
              </div>
            )}

            {job.frequencyDetails && (
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Repeat className="w-3 h-3 text-gray-400" />
                <span>{job.frequencyDetails}</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${getActivityColor(job.activityLevel)}`} />
              <span className="text-xs text-gray-600 capitalize">{job.activityLevel} Activity</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-600">
                {job.completionHistory.length} completed
              </span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
