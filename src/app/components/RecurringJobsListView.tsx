import React from 'react';
import { Badge } from '@/app/components/ui/badge';
import { RecurringTask, Person } from '@/types';
import { Calendar, Clock, User, ChevronRight, Repeat, TrendingUp } from 'lucide-react';

interface RecurringJobsListViewProps {
  recurringTasks: RecurringTask[];
  people: Person[];
  onJobClick: (job: RecurringTask) => void;
}

export function RecurringJobsListView({
  recurringTasks,
  people,
  onJobClick,
}: RecurringJobsListViewProps) {
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
    <div className="space-y-3">
      {recurringTasks.map((job) => (
        <div
          key={job.id}
          onClick={() => onJobClick(job)}
          className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md hover:border-blue-300 cursor-pointer transition-all"
        >
          <div className="flex items-start justify-between gap-4">
            {/* Left side - Main content */}
            <div className="flex-1 min-w-0">
              {/* Header row */}
              <div className="flex items-center gap-3 mb-2">
                <Repeat className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-mono text-gray-500">#{job.id}</span>
                <Badge variant="outline" className={getFrequencyColor(job.frequency)}>
                  {job.frequency}
                </Badge>
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${getActivityColor(job.activityLevel)}`} />
                  <span className="text-xs text-gray-600 capitalize">{job.activityLevel}</span>
                </div>
              </div>

              {/* Title */}
              <h3 className="font-semibold text-gray-900 mb-1">{job.title}</h3>

              {/* Customer */}
              <p className="text-sm text-gray-600 mb-3">{job.customerName}</p>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
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
                      <span className="text-xs text-gray-500">
                        +{job.assignedTo.length - 1} more
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <TrendingUp className="w-4 h-4 text-gray-400" />
                  <span>{job.completionHistory.length} completed</span>
                </div>

                {job.frequencyDetails && (
                  <div className="col-span-2 flex items-center gap-2 text-sm text-gray-600">
                    <Repeat className="w-4 h-4 text-gray-400" />
                    <span className="text-xs">{job.frequencyDetails}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right side - Arrow */}
            <div className="flex-shrink-0">
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
