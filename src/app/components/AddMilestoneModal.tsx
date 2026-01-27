import React, { useState } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Textarea } from '@/app/components/ui/textarea';
import { Person } from '@/types';
import {
  X,
  Flag,
  Calendar,
  Users,
  AlertCircle,
  Target,
  CheckCircle2,
  Link,
} from 'lucide-react';

interface Milestone {
  id: string;
  name: string;
  description: string;
  targetDate: string;
  ownerId: string;
  status: 'upcoming' | 'in-progress' | 'completed' | 'at-risk';
  priority: 'low' | 'medium' | 'high' | 'critical';
  linkedTasks: string[];
  deliverables: string[];
  completionCriteria: string;
}

interface AddMilestoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (milestone: Milestone) => void;
  people: Person[];
  existingMilestone?: Milestone;
}

export function AddMilestoneModal({
  isOpen,
  onClose,
  onSave,
  people,
  existingMilestone,
}: AddMilestoneModalProps) {
  const [formData, setFormData] = useState<Milestone>(
    existingMilestone || {
      id: '',
      name: '',
      description: '',
      targetDate: '',
      ownerId: '',
      status: 'upcoming',
      priority: 'medium',
      linkedTasks: [],
      deliverables: [],
      completionCriteria: '',
    }
  );

  const [newDeliverable, setNewDeliverable] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const milestone = {
      ...formData,
      id: existingMilestone?.id || `milestone-${Date.now()}`,
    };
    onSave(milestone);
    onClose();
  };

  const addDeliverable = () => {
    if (newDeliverable.trim()) {
      setFormData({
        ...formData,
        deliverables: [...formData.deliverables, newDeliverable.trim()],
      });
      setNewDeliverable('');
    }
  };

  const removeDeliverable = (index: number) => {
    setFormData({
      ...formData,
      deliverables: formData.deliverables.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Flag className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {existingMilestone ? 'Edit Milestone' : 'Add New Milestone'}
                </h2>
                <p className="text-sm text-gray-600">
                  Define key project milestones and track progress
                </p>
              </div>
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Form Content */}
          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Milestone Name *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="e.g., Phase 1 Completion"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <Textarea
                  rows={3}
                  className="w-full"
                  placeholder="Describe what this milestone represents..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>

            {/* Date and Assignment */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Target Date *
                </label>
                <input
                  type="date"
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  value={formData.targetDate}
                  onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="w-4 h-4 inline mr-1" />
                  Owner *
                </label>
                <select
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  value={formData.ownerId}
                  onChange={(e) => setFormData({ ...formData, ownerId: e.target.value })}
                >
                  <option value="">Select owner</option>
                  {people.map((person) => (
                    <option key={person.id} value={person.id}>
                      {person.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Status and Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as Milestone['status'],
                    })
                  }
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="at-risk">At Risk</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      priority: e.target.value as Milestone['priority'],
                    })
                  }
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            {/* Deliverables */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Target className="w-4 h-4 inline mr-1" />
                Key Deliverables
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Add a deliverable..."
                  value={newDeliverable}
                  onChange={(e) => setNewDeliverable(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addDeliverable();
                    }
                  }}
                />
                <Button type="button" onClick={addDeliverable}>
                  Add
                </Button>
              </div>
              <div className="space-y-2">
                {formData.deliverables.map((deliverable, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200"
                  >
                    <CheckCircle2 className="w-4 h-4 text-amber-600" />
                    <span className="flex-1 text-sm text-gray-900">{deliverable}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDeliverable(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Completion Criteria */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <CheckCircle2 className="w-4 h-4 inline mr-1" />
                Completion Criteria
              </label>
              <Textarea
                rows={3}
                className="w-full"
                placeholder="Define what constitutes successful completion of this milestone..."
                value={formData.completionCriteria}
                onChange={(e) =>
                  setFormData({ ...formData, completionCriteria: e.target.value })
                }
              />
            </div>

            {/* Info Note */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-1">Milestone Tips</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Milestones mark significant project achievements</li>
                    <li>• Link related tasks to track progress automatically</li>
                    <li>• Set realistic target dates based on task completion</li>
                    <li>• Define clear completion criteria for accountability</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="gap-2">
              <Flag className="w-4 h-4" />
              {existingMilestone ? 'Update Milestone' : 'Create Milestone'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
