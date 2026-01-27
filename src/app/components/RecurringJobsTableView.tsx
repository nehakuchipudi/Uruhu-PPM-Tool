import React from 'react';
import { Badge } from '@/app/components/ui/badge';
import { RecurringTask, Person } from '@/types';
import { Calendar, Clock, User, ChevronRight, Repeat, TrendingUp } from 'lucide-react';

interface RecurringJobsTableViewProps {
  recurringTasks: RecurringTask[];
  people: Person[];
  onJobClick: (job: RecurringTask) => void;
}

export function RecurringJobsTableView({
  recurringTasks,
  people,
  onJobClick,
}: RecurringJobsTableViewProps) {
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
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                Job ID
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                Title & Customer
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                Frequency
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                Next Occurrence
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                Assigned To
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                Duration
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                Activity
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                Completed
              </th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {recurringTasks.map((job) => (
              <tr
                key={job.id}
                onClick={() => onJobClick(job)}
                className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Repeat className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-mono font-medium text-gray-900">
                      #{job.id}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900 line-clamp-1">{job.title}</p>
                    <p className="text-xs text-gray-600">{job.customerName}</p>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div>
                    <Badge variant="outline" className={getFrequencyColor(job.frequency)}>
                      {job.frequency}
                    </Badge>
                    {job.frequencyDetails && (
                      <p className="text-xs text-gray-500 mt-1">{job.frequencyDetails}</p>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>
                      {new Date(job.nextOccurrence).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  {job.assignedTo.length > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-medium">
                        {getTechnicianName(job.assignedTo[0]).charAt(0)}
                      </div>
                      <div>
                        <span className="text-sm text-gray-900">
                          {getTechnicianName(job.assignedTo[0])}
                        </span>
                        {job.assignedTo.length > 1 && (
                          <span className="text-xs text-gray-500 ml-1">
                            +{job.assignedTo.length - 1}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>{job.estimatedDuration}h</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getActivityColor(job.activityLevel)}`} />
                    <span className="text-sm text-gray-700 capitalize">{job.activityLevel}</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <TrendingUp className="w-4 h-4 text-gray-400" />
                    <span>{job.completionHistory.length}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-right">
                  <ChevronRight className="w-5 h-5 text-gray-400 inline-block" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
