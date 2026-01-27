import React, { useState } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Progress } from '@/app/components/ui/progress';
import { Task, Person, Project } from '@/types';
import { Plus, ChevronRight, ChevronDown, Edit, Trash2, Diamond, Calendar as CalendarIcon, List, CheckCircle2, Search } from 'lucide-react';
import { GanttChart } from '@/app/components/GanttChart';
import { AddMilestoneModal } from '@/app/components/AddMilestoneModal';
import { TaskEditDialog } from '@/app/components/TaskEditDialog';
import { AddTaskDialog } from '@/app/components/AddTaskDialog';
import { toast } from 'sonner';

interface ProjectScheduleTabProps {
  project: Project;
  tasks: Task[];
  people: Person[];
}

interface TaskExtended extends Task {
  type: 'task';
  linkedMilestone?: string;
}

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

interface TableRow {
  type: 'milestone' | 'task' | 'subtask' | 'add-subtask' | 'add-task-to-milestone';
  data: Milestone | TaskExtended;
  level: number;
}

export function ProjectScheduleTab({ project, tasks, people }: ProjectScheduleTabProps) {
  const [viewMode, setViewMode] = useState<'list' | 'gantt'>('list');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [milestones, setMilestones] = useState<Milestone[]>([
    {
      id: 'milestone-1',
      name: 'Phase 1 Kickoff',
      description: 'Complete all initial planning and stakeholder alignment',
      targetDate: '2025-02-15',
      ownerId: people[0]?.id || '',
      status: 'completed',
      priority: 'high',
      linkedTasks: tasks.slice(0, 2).map((t) => t.id),
      deliverables: ['Project charter', 'Resource allocation plan', 'Communication plan'],
      completionCriteria: 'All stakeholders have approved the project charter and resources are assigned',
    },
    {
      id: 'milestone-2',
      name: 'Design Approval',
      description: 'Complete design phase and obtain client approval',
      targetDate: '2025-03-01',
      ownerId: people[1]?.id || '',
      status: 'in-progress',
      priority: 'critical',
      linkedTasks: tasks.slice(2, 4).map((t) => t.id),
      deliverables: ['Design mockups', 'Technical specifications', 'Client sign-off'],
      completionCriteria: 'Client has reviewed and approved all design documents',
    },
    {
      id: 'milestone-3',
      name: 'Development Complete',
      description: 'Finish all development work and code review',
      targetDate: '2025-04-15',
      ownerId: people[0]?.id || '',
      status: 'upcoming',
      priority: 'high',
      linkedTasks: [
        ...tasks.filter(t => 
          ['Landscape Bed Mulching', 'Tree Trimming & Pruning - Phase 1', 'City Approval Process'].includes(t.name)
        ).map(t => t.id)
      ],
      deliverables: ['Working prototype', 'Test results', 'Documentation'],
      completionCriteria: 'All features implemented and code review completed',
    },
  ]);
  const [isAddMilestoneModalOpen, setIsAddMilestoneModalOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | undefined>(undefined);
  
  // Task editing state
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showTaskEditDialog, setShowTaskEditDialog] = useState(false);
  const [showAddTaskDialog, setShowAddTaskDialog] = useState(false);
  const [parentTaskForSubtask, setParentTaskForSubtask] = useState<string | undefined>(undefined);
  const [targetMilestoneId, setTargetMilestoneId] = useState<string | undefined>(undefined);

  // Local tasks state
  const [localTasks, setLocalTasks] = useState<Task[]>(tasks);

  // Build hierarchical table rows with milestones and their linked tasks
  const buildTableRows = (): TableRow[] => {
    const rows: TableRow[] = [];

    // Sort milestones by target date
    const sortedMilestones = [...milestones].sort(
      (a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime()
    );

    sortedMilestones.forEach((milestone) => {
      // Add milestone row
      rows.push({
        type: 'milestone',
        data: milestone,
        level: 0,
      });

      // If milestone is expanded, add linked tasks
      if (expandedRows.has(milestone.id)) {
        const linkedTasks = localTasks.filter((task) => 
          !task.parentTaskId && milestone.linkedTasks.includes(task.id)
        );
        
        linkedTasks.forEach((task) => {
          const extendedTask: TaskExtended = {
            ...task,
            type: 'task',
            linkedMilestone: milestone.id,
          };

          rows.push({
            type: 'task',
            data: extendedTask,
            level: 1,
          });

          // Add subtasks if task is expanded
          if (expandedRows.has(task.id)) {
            const subtasks = localTasks.filter((t) => t.parentTaskId === task.id);

            subtasks.forEach((subtask) => {
              rows.push({
                type: 'subtask',
                data: { ...subtask, type: 'task' } as TaskExtended,
                level: 2,
              });
            });
            
            // Add \"Add subtask...\" row
            rows.push({
              type: 'add-subtask' as any,
              data: { ...extendedTask, id: `add-subtask-${task.id}` } as any,
              level: 2,
            });
          }
        });
        
        // Add \"Add task...\" row after milestone's tasks
        rows.push({
          type: 'add-task-to-milestone' as any,
          data: { ...milestone, id: `add-task-${milestone.id}` } as any,
          level: 1,
        });
      }
    });

    // Add unlinked tasks at the end
    const unlinkedTasks = localTasks.filter(
      (task) => !task.parentTaskId && !milestones.some((m) => m.linkedTasks.includes(task.id))
    );
    
    unlinkedTasks.forEach((task) => {
      const extendedTask: TaskExtended = {
        ...task,
        type: 'task',
      };

      rows.push({
        type: 'task',
        data: extendedTask,
        level: 0,
      });
      
      // Add subtasks if task is expanded
      if (expandedRows.has(task.id)) {
        const subtasks = localTasks.filter((t) => t.parentTaskId === task.id);
        subtasks.forEach((subtask) => {
          rows.push({
            type: 'subtask',
            data: { ...subtask, type: 'task' } as TaskExtended,
            level: 1,
          });
        });
        
        // Add \"Add subtask...\" row
        rows.push({
          type: 'add-subtask' as any,
          data: { ...extendedTask, id: `add-subtask-${task.id}` } as any,
          level: 1,
        });
      }
    });

    return rows;
  };

  const getStatusColor = (status: Task['status'] | Milestone['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-500 text-white';
      case 'in-progress':
        return 'bg-blue-500 text-white';
      case 'review':
        return 'bg-purple-500 text-white';
      case 'at-risk':
        return 'bg-red-500 text-white';
      case 'upcoming':
      case 'todo':
        return 'bg-gray-400 text-white';
      default:
        return 'bg-gray-400 text-white';
    }
  };

  const getPriorityColor = (priority: Task['priority'] | Milestone['priority']) => {
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

  const toggleRowExpanded = (rowId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(rowId)) {
      newExpanded.delete(rowId);
    } else {
      newExpanded.add(rowId);
    }
    setExpandedRows(newExpanded);
  };

  const calculateMilestoneProgress = (milestone: Milestone) => {
    if (milestone.linkedTasks.length === 0) return 0;
    const linkedTasksData = localTasks.filter((t) => milestone.linkedTasks.includes(t.id));
    if (linkedTasksData.length === 0) return 0;
    const totalProgress = linkedTasksData.reduce((sum, task) => sum + task.progress, 0);
    return Math.round(totalProgress / linkedTasksData.length);
  };

  const handleSaveMilestone = (milestone: Milestone) => {
    const existingIndex = milestones.findIndex((m) => m.id === milestone.id);
    if (existingIndex >= 0) {
      const newMilestones = [...milestones];
      newMilestones[existingIndex] = milestone;
      setMilestones(newMilestones);
      toast.success('Milestone updated successfully');
    } else {
      setMilestones([...milestones, milestone]);
      toast.success('Milestone added successfully');
    }
    setIsAddMilestoneModalOpen(false);
    setEditingMilestone(undefined);
  };

  const handleDeleteMilestone = (milestoneId: string) => {
    setMilestones(milestones.filter((m) => m.id !== milestoneId));
    toast.success('Milestone deleted successfully');
  };

  const handleSaveTask = (task: Task) => {
    const index = localTasks.findIndex((t) => t.id === task.id);
    if (index >= 0) {
      const newTasks = [...localTasks];
      newTasks[index] = task;
      setLocalTasks(newTasks);
      toast.success('Task updated successfully');
    }
    setShowTaskEditDialog(false);
    setEditingTask(null);
  };

  const handleAddTask = (taskData: Omit<Task, 'id'>) => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
    };
    
    setLocalTasks([...localTasks, newTask]);
    
    const newExpanded = new Set(expandedRows);
    
    // If adding task to a milestone, link it
    if (targetMilestoneId) {
      const milestoneIndex = milestones.findIndex((m) => m.id === targetMilestoneId);
      if (milestoneIndex >= 0) {
        const updatedMilestones = [...milestones];
        updatedMilestones[milestoneIndex] = {
          ...updatedMilestones[milestoneIndex],
          linkedTasks: [...updatedMilestones[milestoneIndex].linkedTasks, newTask.id],
        };
        setMilestones(updatedMilestones);
        
        // Auto-expand the milestone to show the new task
        newExpanded.add(targetMilestoneId);
      }
    }
    
    // If adding a subtask, auto-expand the parent task and its milestone
    if (parentTaskForSubtask) {
      // Expand the parent task
      newExpanded.add(parentTaskForSubtask);
      
      // Find if the parent task belongs to a milestone and expand it
      const parentMilestone = milestones.find((m) => 
        m.linkedTasks.includes(parentTaskForSubtask)
      );
      if (parentMilestone) {
        newExpanded.add(parentMilestone.id);
      }
    }
    
    setExpandedRows(newExpanded);
    
    toast.success(parentTaskForSubtask ? 'Subtask added successfully' : 'Task added successfully');
    setShowAddTaskDialog(false);
    setParentTaskForSubtask(undefined);
    setTargetMilestoneId(undefined);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowTaskEditDialog(true);
  };

  const handleDeleteTask = (taskId: string) => {
    setLocalTasks(localTasks.filter((t) => t.id !== taskId));
    toast.success('Task deleted successfully');
  };

  // Filter rows based on search query
  const tableRows = buildTableRows().filter((row) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    if (row.type === 'milestone') {
      const milestone = row.data as Milestone;
      return milestone.name.toLowerCase().includes(query);
    } else if (row.type === 'task' || row.type === 'subtask') {
      const task = row.data as TaskExtended;
      return task.name.toLowerCase().includes(query);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header with View Toggle and Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            onClick={() => setViewMode('list')}
            size="sm"
          >
            <List className="w-4 h-4 mr-2" />
            List View
          </Button>
          <Button
            variant={viewMode === 'gantt' ? 'default' : 'outline'}
            onClick={() => setViewMode('gantt')}
            size="sm"
          >
            <CalendarIcon className="w-4 h-4 mr-2" />
            Gantt View
          </Button>
        </div>
        {/* Action Buttons - Hide in Gantt View */}
        {viewMode !== 'gantt' && (
          <div className="flex gap-2">
            <Button 
              variant="outline"
              size="sm"
              onClick={() => {
                setEditingMilestone(undefined);
                setIsAddMilestoneModalOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Milestone
            </Button>
            <Button 
              size="sm"
              onClick={() => {
                setParentTaskForSubtask(undefined);
                setShowAddTaskDialog(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          </div>
        )}
      </div>

      {/* List View */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {/* Search Bar */}
          <Card className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks and milestones..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </Card>

          {/* Tasks and Milestones Table */}
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    <th className="text-left p-4 text-xs font-semibold text-gray-600 uppercase w-12"></th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-600 uppercase min-w-[300px]">
                      Name
                    </th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-600 uppercase">
                      Owner
                    </th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-600 uppercase">
                      Due Date
                    </th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-600 uppercase">
                      Priority
                    </th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-600 uppercase">
                      Status
                    </th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-600 uppercase">
                      Progress
                    </th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-600 uppercase w-24">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tableRows.map((row) => {
                    if (row.type === 'milestone') {
                      const milestone = row.data as Milestone;
                      const isExpanded = expandedRows.has(milestone.id);
                      const owner = people.find((p) => p.id === milestone.ownerId);

                      return (
                        <tr
                          key={milestone.id}
                          className="border-b border-gray-200 bg-amber-50/30 hover:bg-amber-50/50 transition-colors"
                        >
                          <td className="p-3 pl-4 w-12">
                            <button
                              onClick={() => toggleRowExpanded(milestone.id)}
                              className="text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded p-1 transition-all"
                            >
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </button>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shadow-sm transition-all ${
                                milestone.status === 'completed'
                                  ? 'bg-green-500 text-white'
                                  : milestone.status === 'at-risk'
                                  ? 'bg-red-500 text-white'
                                  : milestone.status === 'in-progress'
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-white border-2 border-amber-400 text-amber-600'
                              }`}>
                                {milestone.status === 'completed' ? (
                                  <CheckCircle2 className="w-5 h-5" />
                                ) : (
                                  <Diamond className="w-4 h-4" />
                                )}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{milestone.name}</p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {localTasks.filter(t => !t.parentTaskId && milestone.linkedTasks.includes(t.id)).length} task{localTasks.filter(t => !t.parentTaskId && milestone.linkedTasks.includes(t.id)).length !== 1 ? 's' : ''}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            {owner && (
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-xs font-semibold text-white shadow-sm">
                                  {owner.name.charAt(0)}
                                </div>
                                <span className="text-sm text-gray-900 font-medium">{owner.name}</span>
                              </div>
                            )}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <CalendarIcon className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-900">
                                {new Date(milestone.targetDate).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </span>
                            </div>
                          </td>
                          <td className="p-3">
                            <Badge variant="outline" className={getPriorityColor(milestone.priority)}>
                              {milestone.priority}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <Badge className={getStatusColor(milestone.status)}>
                              {milestone.status.replace('-', ' ')}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <div className="w-20 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-amber-500 h-2 rounded-full transition-all"
                                  style={{ width: `${calculateMilestoneProgress(milestone)}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium text-gray-900 w-10">
                                {calculateMilestoneProgress(milestone)}%
                              </span>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingMilestone(milestone);
                                  setIsAddMilestoneModalOpen(true);
                                }}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm('Are you sure you want to delete this milestone?')) {
                                    handleDeleteMilestone(milestone.id);
                                  }
                                }}
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    } else if (row.type === 'task') {
                      const task = row.data as TaskExtended;
                      const isExpanded = expandedRows.has(task.id);
                      const assignedNames = task.assignedTo
                        .map((id) => people.find((p) => p.id === id)?.name)
                        .filter(Boolean);
                      const indentLevel = row.level;
                      const subtaskCount = localTasks.filter((t) => t.parentTaskId === task.id).length;

                      return (
                        <tr
                          key={task.id}
                          className="border-b border-gray-100 hover:bg-blue-50/30 cursor-pointer transition-colors group"
                          onClick={() => handleEditTask(task)}
                        >
                          <td className="p-3 pl-4 w-12">
                            {subtaskCount > 0 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleRowExpanded(task.id);
                                }}
                                className="text-gray-400 hover:text-gray-900 hover:bg-gray-200 rounded p-1 transition-all"
                              >
                                {isExpanded ? (
                                  <ChevronDown className="w-4 h-4" />
                                ) : (
                                  <ChevronRight className="w-4 h-4" />
                                )}
                              </button>
                            )}
                          </td>
                          <td className="p-3" style={{ paddingLeft: `${indentLevel * 32 + 12}px` }}>
                            <div className="flex items-center gap-2.5">
                              <div className={`w-2 h-2 rounded-full shadow-sm ${
                                task.status === 'completed' ? 'bg-emerald-500' :
                                task.status === 'in-progress' ? 'bg-blue-500 animate-pulse' :
                                task.status === 'blocked' ? 'bg-red-500' :
                                'bg-gray-300'
                              }`} />
                              <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{task.name}</p>
                              {subtaskCount > 0 && (
                                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                  {subtaskCount}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-3">
                            {assignedNames.length > 0 ? (
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-xs font-semibold text-white shadow-sm">
                                  {assignedNames[0].charAt(0)}
                                </div>
                                <span className="text-sm text-gray-900">{assignedNames[0]}</span>
                                {assignedNames.length > 1 && (
                                  <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                                    +{assignedNames.length - 1}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400 italic">Unassigned</span>
                            )}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-1.5">
                              <CalendarIcon className="w-3.5 h-3.5 text-gray-400" />
                              <span className="text-sm text-gray-700">
                                {new Date(task.endDate).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </span>
                            </div>
                          </td>
                          <td className="p-3">
                            <Badge variant="outline" className={`${getPriorityColor(task.priority)} text-xs`}>
                              {task.priority}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <Badge className={`${getStatusColor(task.status)} text-xs`}>
                              {task.status.replace('-', ' ')}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <div className="w-20 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className={`h-1.5 rounded-full transition-all ${
                                    task.status === 'completed' ? 'bg-emerald-500' : 'bg-blue-500'
                                  }`}
                                  style={{ width: `${task.progress}%` }}
                                />
                              </div>
                              <span className="text-xs font-semibold text-gray-700 w-10">
                                {task.progress}%
                              </span>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditTask(task);
                                }}
                                title="Edit task"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setParentTaskForSubtask(task.id);
                                  setShowAddTaskDialog(true);
                                }}
                                title="Add subtask"
                              >
                                <Plus className="w-3.5 h-3.5 text-blue-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm('Are you sure you want to delete this task?')) {
                                    handleDeleteTask(task.id);
                                  }
                                }}
                                title="Delete task"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-red-500" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    } else if (row.type === 'subtask') {
                      const subtask = row.data as TaskExtended;
                      const assignedNames = (subtask.assignedTo || [])
                        .map((id) => people.find((p) => p.id === id)?.name)
                        .filter(Boolean);
                      const indentLevel = row.level;

                      return (
                        <tr
                          key={subtask.id}
                          className="border-b border-gray-100 hover:bg-gray-50 bg-gray-50/50 cursor-pointer"
                          onClick={() => handleEditTask(subtask)}
                        >
                          <td className="p-4"></td>
                          <td
                            className="p-4"
                            style={{ paddingLeft: `${indentLevel * 24 + 16}px` }}
                          >
                            <div className="flex items-center gap-2">
                              <div className={`w-1.5 h-1.5 rounded-full ${
                                subtask.status === 'completed' ? 'bg-emerald-500' :
                                subtask.status === 'in-progress' ? 'bg-blue-500' :
                                'bg-gray-300'
                              }`} />
                              <p className="text-sm text-gray-700">{subtask.name}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            {assignedNames.length > 0 && (
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                                  {assignedNames[0].charAt(0)}
                                </div>
                                <span className="text-xs text-gray-600">{assignedNames[0]}</span>
                              </div>
                            )}
                          </td>
                          <td className="p-4">
                            <span className="text-xs text-gray-600">
                              {new Date(subtask.endDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          </td>
                          <td className="p-4">
                            <Badge variant="outline" className={`text-xs ${getPriorityColor(subtask.priority)}`}>
                              {subtask.priority}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <Badge className={`text-xs ${getStatusColor(subtask.status)}`}>
                              {subtask.status.replace('-', ' ')}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <span className="text-xs text-gray-600">{subtask.progress}%</span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-1">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditTask(subtask);
                                }}
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm('Are you sure you want to delete this subtask?')) {
                                    handleDeleteTask(subtask.id);
                                  }
                                }}
                              >
                                <Trash2 className="w-3.5 h-3.5 text-red-500" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    } else if (row.type === 'add-subtask') {
                      const task = row.data as TaskExtended;
                      const indentLevel = row.level;

                      return (
                        <tr
                          key={task.id}
                          className="border-b border-gray-100 hover:bg-blue-50/50 cursor-pointer group"
                          onClick={() => {
                            setParentTaskForSubtask(task.id.replace('add-subtask-', ''));
                            setShowAddTaskDialog(true);
                          }}
                        >
                          <td className="p-4"></td>
                          <td
                            className="p-4"
                            style={{ paddingLeft: `${indentLevel * 24 + 16}px` }}
                          >
                            <div className="flex items-center gap-2 text-gray-400 group-hover:text-blue-600 transition-colors">
                              <Plus className="w-3.5 h-3.5" />
                              <p className="text-sm font-medium">Add subtask...</p>
                            </div>
                          </td>
                          <td className="p-4" colSpan={6}></td>
                        </tr>
                      );
                    } else if (row.type === 'add-task-to-milestone') {
                      const milestone = row.data as Milestone;
                      const indentLevel = row.level;
                      // Extract real milestone ID by removing 'add-task-' prefix
                      const realMilestoneId = milestone.id.replace('add-task-', '');

                      return (
                        <tr
                          key={milestone.id}
                          className="border-b border-gray-100 hover:bg-blue-50/50 cursor-pointer group"
                          onClick={() => {
                            setParentTaskForSubtask(undefined);
                            setTargetMilestoneId(realMilestoneId);
                            setShowAddTaskDialog(true);
                          }}
                        >
                          <td className="p-4"></td>
                          <td
                            className="p-4"
                            style={{ paddingLeft: `${indentLevel * 24 + 16}px` }}
                          >
                            <div className="flex items-center gap-2 text-gray-400 group-hover:text-blue-600 transition-colors">
                              <Plus className="w-3.5 h-3.5" />
                              <p className="text-sm font-medium">Add task...</p>
                            </div>
                          </td>
                          <td className="p-4" colSpan={6}></td>
                        </tr>
                      );
                    }
                  })}
                  
                  {/* Final Add Task Row */}
                  <tr className="hover:bg-blue-50/50 cursor-pointer group">
                    <td className="p-4"></td>
                    <td 
                      className="p-4" 
                      colSpan={7}
                      onClick={() => {
                        setParentTaskForSubtask(undefined);
                        setShowAddTaskDialog(true);
                      }}
                    >
                      <div className="flex items-center gap-2 text-gray-400 group-hover:text-blue-600 transition-colors">
                        <Plus className="w-4 h-4" />
                        <span className="text-sm font-medium">Add task...</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Gantt View */}
      {viewMode === 'gantt' && (
        <div className="space-y-4">
          <GanttChart
            tasks={localTasks}
            people={people}
            onTaskClick={(taskId) => {
              const task = localTasks.find((t) => t.id === taskId);
              if (task) {
                handleEditTask(task);
              }
            }}
            milestones={milestones}
          />
        </div>
      )}

      {/* Modals */}
      <AddMilestoneModal
        isOpen={isAddMilestoneModalOpen}
        onClose={() => {
          setIsAddMilestoneModalOpen(false);
          setEditingMilestone(undefined);
        }}
        onSave={handleSaveMilestone}
        people={people}
        existingMilestone={editingMilestone}
      />

      <TaskEditDialog
        task={editingTask}
        open={showTaskEditDialog}
        onClose={() => setShowTaskEditDialog(false)}
        onSave={handleSaveTask}
        people={people}
      />

      <AddTaskDialog
        open={showAddTaskDialog}
        onClose={() => {
          setShowAddTaskDialog(false);
          setParentTaskForSubtask(undefined);
          setTargetMilestoneId(undefined);
        }}
        onAdd={handleAddTask}
        people={people}
        projectId={project.id}
        parentTaskId={parentTaskForSubtask}
        milestoneId={targetMilestoneId}
      />
    </div>
  );
}