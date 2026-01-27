import { Task, Person } from '@/types';
import { useMemo, useState } from 'react';
import { ChevronRight, ChevronDown, Diamond, ZoomIn, ZoomOut, Calendar, Users, Flag, CheckCircle2, X, CalendarIcon } from 'lucide-react';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';

interface GanttChartProps {
  tasks: Task[];
  people: Person[];
  onTaskClick?: (taskId: string) => void;
  milestones?: Milestone[];
}

interface Milestone {
  id: string;
  name: string;
  targetDate: string;
  status: string;
  linkedTasks: string[];
  priority?: string;
}

interface TaskExtended extends Task {
  level: number;
  hasChildren: boolean;
}

interface GanttRow {
  type: 'milestone' | 'task' | 'subtask';
  id: string;
  data: Milestone | TaskExtended;
  level: number;
}

export function GanttChart({ tasks, people, onTaskClick, milestones = [] }: GanttChartProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [hoveredTask, setHoveredTask] = useState<string | null>(null);
  const [hoveredTaskBar, setHoveredTaskBar] = useState<string | null>(null);
  const [hoveredMilestone, setHoveredMilestone] = useState<string | null>(null);
  const [zoom, setZoom] = useState<'day' | 'week' | 'month'>('week');
  const [showDependencies, setShowDependencies] = useState(true);

  // Build hierarchical rows: Milestone > Task > Subtask
  const ganttRows = useMemo(() => {
    const rows: GanttRow[] = [];
    
    // Sort milestones by target date
    const sortedMilestones = [...milestones].sort(
      (a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime()
    );

    sortedMilestones.forEach((milestone) => {
      // Add milestone row
      rows.push({
        type: 'milestone',
        id: milestone.id,
        data: milestone,
        level: 0,
      });

      // If milestone is expanded, add its linked tasks
      if (expandedItems.has(milestone.id)) {
        const linkedTasks = tasks.filter(
          (task) => !task.parentTaskId && milestone.linkedTasks.includes(task.id)
        );

        linkedTasks.forEach((task) => {
          const children = tasks.filter((t) => t.parentTaskId === task.id);
          const hasChildren = children.length > 0;

          // Add task row
          rows.push({
            type: 'task',
            id: task.id,
            data: {
              ...task,
              level: 1,
              hasChildren,
            },
            level: 1,
          });

          // If task is expanded, add subtasks
          if (expandedItems.has(task.id)) {
            children.forEach((subtask) => {
              rows.push({
                type: 'subtask',
                id: subtask.id,
                data: {
                  ...subtask,
                  level: 2,
                  hasChildren: false,
                },
                level: 2,
              });
            });
          }
        });
      }
    });

    // Add unlinked tasks (not associated with any milestone)
    const unlinkedTasks = tasks.filter(
      (task) => !task.parentTaskId && !milestones.some((m) => m.linkedTasks.includes(task.id))
    );

    unlinkedTasks.forEach((task) => {
      const children = tasks.filter((t) => t.parentTaskId === task.id);
      const hasChildren = children.length > 0;

      rows.push({
        type: 'task',
        id: task.id,
        data: {
          ...task,
          level: 0,
          hasChildren,
        },
        level: 0,
      });

      if (expandedItems.has(task.id)) {
        children.forEach((subtask) => {
          rows.push({
            type: 'subtask',
            id: subtask.id,
            data: {
              ...subtask,
              level: 1,
              hasChildren: false,
            },
            level: 1,
          });
        });
      }
    });

    return rows;
  }, [tasks, milestones, expandedItems]);

  const ganttData = useMemo(() => {
    if (ganttRows.length === 0) 
      return { rows: [], startDate: new Date(), endDate: new Date(), daySpan: 0 };
    
    const taskRows = ganttRows.filter(r => r.type === 'task' || r.type === 'subtask');
    const taskDates = taskRows.flatMap(r => {
      const task = r.data as TaskExtended;
      return [new Date(task.startDate), new Date(task.endDate)];
    });
    const milestoneDates = milestones.map(m => new Date(m.targetDate));
    const allDates = [...taskDates, ...milestoneDates];
    
    if (allDates.length === 0) return { rows: ganttRows, startDate: new Date(), endDate: new Date(), daySpan: 0 };
    
    const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));
    
    // Add padding based on zoom level
    const padding = zoom === 'day' ? 3 : zoom === 'week' ? 14 : 30;
    minDate.setDate(minDate.getDate() - padding);
    maxDate.setDate(maxDate.getDate() + padding);
    
    const daySpan = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return { rows: ganttRows, startDate: minDate, endDate: maxDate, daySpan };
  }, [ganttRows, milestones, zoom]);

  const getTaskPosition = (task: Task) => {
    const taskStart = new Date(task.startDate);
    const taskEnd = new Date(task.endDate);
    const { startDate, daySpan } = ganttData;
    
    const startOffset = Math.ceil((taskStart.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const duration = Math.ceil((taskEnd.getTime() - taskStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    const left = (startOffset / daySpan) * 100;
    // Increase minimum width based on zoom level for better visibility
    const minWidthPercent = zoom === 'day' ? 2.5 : zoom === 'week' ? 1.5 : 0.8;
    const width = Math.max((duration / daySpan) * 100, minWidthPercent);
    
    return { left: `${left}%`, width: `${width}%`, duration };
  };

  const getMilestonePosition = (milestone: Milestone) => {
    const milestoneDate = new Date(milestone.targetDate);
    const { startDate, daySpan } = ganttData;
    
    const offset = Math.ceil((milestoneDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const left = (offset / daySpan) * 100;
    
    return { left: `${left}%` };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-500';
      case 'in-progress': return 'bg-blue-500';
      case 'review': return 'bg-purple-500';
      case 'blocked': return 'bg-red-500';
      case 'at-risk': return 'bg-red-500';
      case 'todo': return 'bg-gray-400';
      case 'upcoming': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getPriorityBorder = (priority: string) => {
    switch (priority) {
      case 'critical': return 'border-l-[6px] border-red-600';
      case 'high': return 'border-l-[6px] border-orange-500';
      case 'medium': return 'border-l-[4px] border-blue-500';
      case 'low': return 'border-l-[3px] border-gray-400';
      default: return 'border-l-[3px] border-gray-400';
    }
  };

  const formatDate = (date: Date) => {
    if (zoom === 'day') {
      // Day view: Compact date format
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else if (zoom === 'week') {
      // Week view: Show week starting date
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
      return weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else {
      // Month view: Show month and year
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }
  };

  const getAssignedNames = (assignedIds: string[]) => {
    return assignedIds
      .map(id => people.find(p => p.id === id)?.name.split(' ')[0])
      .filter(Boolean);
  };

  const toggleItemExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  if (tasks.length === 0 && milestones.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <p className="text-gray-500">No tasks or milestones to display in Gantt chart</p>
      </div>
    );
  }

  // Generate time markers based on zoom level
  const timeMarkers = useMemo(() => {
    const markers = [];
    const { startDate, daySpan } = ganttData;
    
    if (daySpan === 0) return [];
    
    if (zoom === 'day') {
      // Day view: Show EVERY day (no max limit, allow scrolling)
      for (let i = 0; i <= daySpan; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        
        const position = (i / daySpan) * 100;
        markers.push({ date, position });
      }
    } else if (zoom === 'week') {
      // Week view: Show EVERY week (allow scrolling)
      // Align to week starts (Sunday)
      const alignedStart = new Date(startDate);
      alignedStart.setDate(startDate.getDate() - startDate.getDay()); // Move to Sunday
      
      const weekCount = Math.ceil(daySpan / 7);
      
      for (let i = 0; i <= weekCount; i++) {
        const date = new Date(alignedStart);
        date.setDate(alignedStart.getDate() + (i * 7));
        
        // Calculate position relative to original startDate
        const dayOffset = Math.ceil((date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        const position = (dayOffset / daySpan) * 100;
        
        if (position >= 0 && position <= 100) {
          markers.push({ date, position });
        }
      }
    } else {
      // Month view: Align to actual calendar month boundaries
      const alignedStart = new Date(startDate);
      alignedStart.setDate(1); // Move to first day of the month
      
      const endDate = ganttData.endDate;
      let currentDate = new Date(alignedStart);
      
      // Generate markers at the start of each month
      while (currentDate <= endDate) {
        // Calculate position relative to original startDate
        const dayOffset = Math.ceil((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        const position = (dayOffset / daySpan) * 100;
        
        if (position >= 0 && position <= 100) {
          markers.push({ date: new Date(currentDate), position });
        }
        
        // Move to next month
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
      
      // Add one more marker at the end if needed
      const lastMarkerDate = markers[markers.length - 1]?.date;
      if (!lastMarkerDate || lastMarkerDate < endDate) {
        const finalDate = new Date(currentDate);
        const dayOffset = Math.ceil((finalDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        const position = (dayOffset / daySpan) * 100;
        if (position <= 100) {
          markers.push({ date: finalDate, position });
        }
      }
    }
    
    return markers;
  }, [ganttData, zoom]);

  // Get today's position
  const todayPosition = useMemo(() => {
    const today = new Date();
    const { startDate, daySpan } = ganttData;
    const offset = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    return (offset / daySpan) * 100;
  }, [ganttData]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      {/* Header with Controls */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">Project Timeline</h3>
            <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {formatDate(ganttData.startDate)} - {formatDate(ganttData.endDate)}
              <span className="mx-2 text-gray-400">•</span>
              <span className="text-gray-700 font-medium">{ganttData.rows.filter(r => r.type === 'task' || r.type === 'subtask').length} tasks</span>
              <span className="mx-2 text-gray-400">•</span>
              <span className="text-gray-700 font-medium">{ganttData.rows.filter(r => r.type === 'milestone').length} milestones</span>
            </p>
          </div>
          
          {/* Controls */}
          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-white rounded-lg border border-gray-200 p-1">
              <Button
                variant={zoom === 'day' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setZoom('day')}
              >
                Day
              </Button>
              <Button
                variant={zoom === 'week' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setZoom('week')}
              >
                Week
              </Button>
              <Button
                variant={zoom === 'month' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setZoom('month')}
              >
                Month
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Gantt Chart Body */}
      <div className="overflow-x-auto">
        <div style={{ 
          minWidth: zoom === 'day' 
            ? `${Math.max(1200, ganttData.daySpan * 60)}px` 
            : zoom === 'week'
            ? `${Math.max(1200, Math.ceil(ganttData.daySpan / 7) * 120)}px`
            : '1200px' 
        }}>
          {/* Timeline Header */}
          <div className="flex border-b border-gray-200 bg-gray-50">
            <div className="w-[320px] px-4 py-3 border-r border-gray-200 flex-shrink-0">
              <span className="text-xs font-semibold text-gray-600 uppercase">Task Name</span>
            </div>
            <div className="flex-1 relative px-4">
              <div className="relative h-12">
                {timeMarkers.map((marker, idx) => {
                  // Position dates between grid lines (centered in the period)
                  const nextMarker = timeMarkers[idx + 1];
                  const labelPosition = nextMarker 
                    ? (marker.position + nextMarker.position) / 2 
                    : marker.position;
                  
                  return (
                    <div
                      key={idx}
                      className="absolute text-xs text-gray-600 font-medium whitespace-nowrap top-1/2 -translate-y-1/2"
                      style={{ left: `${labelPosition}%`, transform: 'translateX(-50%) translateY(-50%)' }}
                    >
                      {formatDate(marker.date)}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Tasks and Milestones */}
          <div className="relative">
            {/* Today Line */}
            {todayPosition >= 0 && todayPosition <= 100 && (
              <div
                className="absolute top-0 bottom-0 border-l-2 border-red-500 pointer-events-none z-10"
                style={{ left: `${todayPosition}%`, marginLeft: '320px' }}
              >
                <div className="absolute top-0 -translate-x-1/2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-b font-medium">
                  Today
                </div>
              </div>
            )}

            {/* Task Rows */}
            <div className="divide-y divide-gray-100">
              {ganttData.rows.map((row) => {
                // MILESTONE ROW
                if (row.type === 'milestone') {
                  const milestone = row.data as Milestone;
                  const position = getMilestonePosition(milestone);
                  const isHovered = hoveredMilestone === milestone.id;
                  const isExpanded = expandedItems.has(milestone.id);
                  
                  // Count only parent tasks (not subtasks)
                  const parentTaskCount = tasks.filter(
                    t => !t.parentTaskId && milestone.linkedTasks.includes(t.id)
                  ).length;
                  
                  return (
                    <div
                      key={`milestone-row-${milestone.id}`}
                      className={`flex items-center transition-all duration-150 ${
                        isHovered ? 'bg-amber-50 shadow-inner' : 'bg-amber-50/30 hover:bg-amber-50/50'
                      }`}
                      style={{ minHeight: '64px' }}
                      onMouseEnter={() => setHoveredMilestone(milestone.id)}
                      onMouseLeave={() => setHoveredMilestone(null)}
                    >
                      {/* Milestone info column */}
                      <div className="w-[320px] px-4 py-3 border-r border-gray-200 flex-shrink-0">
                        <div className="flex items-center gap-3">
                          {/* Expand/Collapse Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleItemExpanded(milestone.id);
                            }}
                            className="text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded p-1 transition-all flex-shrink-0"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </button>
                          
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-md transition-all ${
                            milestone.status === 'completed'
                              ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white'
                              : milestone.status === 'at-risk'
                              ? 'bg-gradient-to-br from-red-400 to-red-600 text-white'
                              : milestone.status === 'in-progress'
                              ? 'bg-gradient-to-br from-blue-400 to-blue-600 text-white'
                              : 'bg-white border-2 border-amber-400 text-amber-600'
                          }`}>
                            {milestone.status === 'completed' ? (
                              <CheckCircle2 className="w-5 h-5" />
                            ) : (
                              <Diamond className="w-5 h-5" />
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 text-base">{milestone.name}</div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {parentTaskCount} task{parentTaskCount !== 1 ? 's' : ''}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Timeline column */}
                      <div className="flex-1 relative px-4 py-3">
                        <div className="relative h-8">
                          {/* Grid lines */}
                          {timeMarkers.map((marker, idx) => (
                            <div
                              key={`grid-milestone-${idx}`}
                              className={`absolute top-0 bottom-0 ${
                                zoom === 'month' || zoom === 'week'
                                  ? 'border-l-2 border-dashed border-gray-300' 
                                  : 'border-l border-gray-100'
                              }`}
                              style={{ left: `${marker.position}%` }}
                            />
                          ))}

                          {/* Milestone diamond marker */}
                          <div
                            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-30"
                            style={{ left: position.left }}
                          >
                            <div className={`w-7 h-7 rotate-45 shadow-lg transition-all duration-200 ${
                              milestone.status === 'completed'
                                ? 'bg-gradient-to-br from-green-400 to-emerald-500'
                                : milestone.status === 'at-risk'
                                ? 'bg-gradient-to-br from-red-400 to-red-600'
                                : milestone.status === 'in-progress'
                                ? 'bg-gradient-to-br from-blue-400 to-blue-600'
                                : 'bg-gradient-to-br from-amber-300 to-amber-500'
                            } ${isHovered ? 'scale-125 ring-4 ring-amber-200' : ''}`}>
                              {isHovered && (
                                <div className="absolute left-full ml-8 top-1/2 -translate-y-1/2 w-56 bg-gray-900 text-white text-xs rounded-lg shadow-xl p-3 z-50 pointer-events-none -rotate-45">
                                  <div className="font-semibold mb-2">{milestone.name}</div>
                                  <div className="space-y-1 text-gray-300">
                                    <div className="flex items-center justify-between">
                                      <span>Target Date:</span>
                                      <span className="text-white">{new Date(milestone.targetDate).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span>Status:</span>
                                      <Badge className={`${getStatusColor(milestone.status)} text-white`}>
                                        {milestone.status}
                                      </Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span>Linked Tasks:</span>
                                      <span className="text-white">{milestone.linkedTasks.length}</span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }

                // TASK ROW (includes subtasks)
                const task = row.data as TaskExtended;
                const position = getTaskPosition(task);
                const isHovered = hoveredTask === task.id;
                const isExpanded = expandedItems.has(task.id);
                const assignedNames = getAssignedNames(task.assignedTo || []);
                const indentLevel = row.level;
                
                return (
                  <div
                    key={`task-row-${task.id}`}
                    className={`flex items-center transition-all duration-150 ${
                      row.type === 'subtask' 
                        ? 'bg-gray-50/50 hover:bg-gray-100/70' 
                        : 'bg-white hover:bg-blue-50/30'
                    } ${isHovered ? 'ring-2 ring-blue-400 ring-inset' : ''}`}
                    style={{ 
                      minHeight: row.type === 'subtask' ? '48px' : '60px'
                    }}
                    onMouseEnter={() => setHoveredTask(task.id)}
                    onMouseLeave={() => setHoveredTask(null)}
                    onClick={() => onTaskClick?.(task.id)}
                  >
                    {/* Task info column */}
                    <div className="w-[320px] px-4 py-3 border-r border-gray-200 flex-shrink-0">
                      <div 
                        className="flex items-center gap-2.5"
                        style={{ paddingLeft: `${indentLevel * 24}px` }}
                      >
                        {/* Expand/Collapse for parent tasks */}
                        {task.hasChildren && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleItemExpanded(task.id);
                            }}
                            className="text-gray-400 hover:text-gray-900 hover:bg-gray-200 rounded p-1 transition-all flex-shrink-0"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </button>
                        )}
                        
                        {!task.hasChildren && row.type === 'subtask' && (
                          <div className="w-6" />
                        )}
                        
                        <div className={`${
                          row.type === 'subtask' ? 'w-1.5 h-1.5' : 'w-2 h-2'
                        } rounded-full shadow-sm flex-shrink-0 ${
                          task.status === 'completed' ? 'bg-emerald-500' :
                          task.status === 'in-progress' ? 'bg-blue-500 animate-pulse' :
                          task.status === 'blocked' ? 'bg-red-500' :
                          'bg-gray-300'
                        }`} />
                        
                        <div className="min-w-0 flex-1">
                          <p className={`${
                            row.type === 'subtask' 
                              ? 'text-sm text-gray-700' 
                              : 'text-sm font-semibold text-gray-900'
                          } truncate`}>
                            {task.name}
                          </p>
                          {assignedNames.length > 0 && (
                            <p className="text-xs text-gray-500 mt-0.5 truncate">
                              {assignedNames.join(', ')}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Timeline column */}
                    <div className="flex-1 relative px-4 py-3">
                      <div className="relative h-8">
                        {/* Grid lines */}
                        {timeMarkers.map((marker, idx) => (
                          <div
                            key={`grid-task-${idx}`}
                            className={`absolute top-0 bottom-0 ${
                              zoom === 'month' || zoom === 'week'
                                ? 'border-l-2 border-dashed border-gray-300' 
                                : 'border-l border-gray-100'
                            }`}
                            style={{ left: `${marker.position}%` }}
                          />
                        ))}

                        {/* Task bar */}
                        <div
                          className="absolute top-1/2 -translate-y-1/2 z-20 cursor-pointer group/taskbar"
                          style={{...position, height: row.type === 'subtask' ? '20px' : '28px'}}
                          onMouseEnter={(e) => {
                            e.stopPropagation();
                            setHoveredTaskBar(task.id);
                          }}
                          onMouseLeave={(e) => {
                            e.stopPropagation();
                            setHoveredTaskBar(null);
                          }}
                        >
                          <div
                            className={`h-full rounded-md ${getStatusColor(task.status)} ${getPriorityBorder(task.priority)} shadow-md relative overflow-visible transition-all duration-200 ${
                              hoveredTaskBar === task.id ? 'ring-2 ring-blue-400 ring-offset-1 scale-105' : ''
                            }`}
                          >
                            {/* Progress background (completed portion) */}
                            <div
                              className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-md"
                              style={{ width: `${task.progress}%` }}
                            />
                            
                            {/* Progress incomplete portion (darker overlay) */}
                            <div
                              className="absolute inset-0 bg-black/10 rounded-md"
                              style={{ width: `${100 - task.progress}%`, left: `${task.progress}%` }}
                            />
                            
                            {/* Task label on bar */}
                            <div className="absolute inset-0 flex items-center px-2 pointer-events-none">
                              <span className={`text-xs font-semibold text-white truncate ${
                                row.type === 'subtask' ? 'text-[10px]' : ''
                              }`}>
                                {task.progress}%
                              </span>
                            </div>

                            {/* Hover Tooltip for Task Bar */}
                            {hoveredTaskBar === task.id && (
                              <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 w-80 bg-gray-900 text-white text-xs rounded-lg shadow-2xl p-4 z-50 pointer-events-none border border-gray-700">
                                <div className="font-semibold mb-3 text-sm border-b border-gray-700 pb-2">{task.name}</div>
                                
                                {/* Key Info Section - Prominently displayed */}
                                <div className="space-y-2.5 mb-3 pb-3 border-b border-gray-700">
                                  <div className="flex items-center justify-between bg-gray-800/50 rounded px-2 py-1.5">
                                    <span className="text-gray-400 font-medium">Target Date:</span>
                                    <div className="flex items-center gap-1.5">
                                      <CalendarIcon className="w-3.5 h-3.5 text-blue-400" />
                                      <span className="text-white font-semibold">{new Date(task.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between bg-gray-800/50 rounded px-2 py-1.5">
                                    <span className="text-gray-400 font-medium">Status:</span>
                                    <Badge className={`${getStatusColor(task.status)} text-white text-[10px] shadow-sm`}>
                                      {task.status.replace('-', ' ')}
                                    </Badge>
                                  </div>
                                  {assignedNames.length > 0 && (
                                    <div className="flex items-center justify-between bg-gray-800/50 rounded px-2 py-1.5">
                                      <span className="text-gray-400 font-medium">Assigned To:</span>
                                      <div className="flex items-center gap-1.5">
                                        <Users className="w-3.5 h-3.5 text-blue-400" />
                                        <span className="text-white font-semibold">{assignedNames.join(', ')}</span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                                
                                {/* Additional Details */}
                                <div className="space-y-2 text-gray-300">
                                  <div className="flex items-center justify-between">
                                    <span className="text-gray-400">Duration:</span>
                                    <span className="text-white font-medium">{position.duration} days</span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-gray-400">Progress:</span>
                                    <div className="flex items-center gap-2">
                                      <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                        <div 
                                          className="h-full bg-blue-400 rounded-full"
                                          style={{ width: `${task.progress}%` }}
                                        />
                                      </div>
                                      <span className="text-white font-medium">{task.progress}%</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-gray-400">Priority:</span>
                                    <Badge variant="outline" className="text-white border-white text-[10px]">
                                      {task.priority}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center justify-between pt-2 border-t border-gray-700">
                                    <span className="text-gray-400">Start Date:</span>
                                    <span className="text-white text-[10px]">{new Date(task.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Dependency arrows */}
                        {showDependencies && task.dependencies && task.dependencies.map((depId) => {
                          const depTask = tasks.find((t) => t.id === depId);
                          if (depTask && ganttRows.some((r) => r.id === depId)) {
                            const depPosition = getTaskPosition(depTask);
                            const depEndX = parseFloat(depPosition.left) + parseFloat(depPosition.width);
                            const taskStartX = parseFloat(position.left);
                            
                            // Only draw if dependency ends before this task starts
                            if (depEndX < taskStartX) {
                              return (
                                <div
                                  key={`dep-${depId}`}
                                  className="absolute top-1/2 h-0.5 bg-blue-400 pointer-events-none z-10"
                                  style={{
                                    left: `${depEndX}%`,
                                    width: `${taskStartX - depEndX}%`,
                                  }}
                                >
                                  {/* Arrow head */}
                                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[6px] border-l-blue-400" />
                                </div>
                              );
                            }
                          }
                          return null;
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-gray-50 border-t border-gray-200 px-4 py-3">
        <div className="flex items-center gap-6 text-xs text-gray-600 flex-wrap">
          <div className="flex items-center gap-4">
            <span className="font-semibold text-gray-700">Status:</span>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-gray-400" />
              <span>To Do</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-blue-500" />
              <span>In Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-emerald-500" />
              <span>Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-red-500" />
              <span>At Risk</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="font-semibold text-gray-700">Priority:</span>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded border-l-[4px] border-red-600 bg-gray-200" />
              <span>Critical</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded border-l-[4px] border-orange-500 bg-gray-200" />
              <span>High</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded border-l-[3px] border-blue-500 bg-gray-200" />
              <span>Medium</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="font-semibold text-gray-700">Symbols:</span>
            <div className="flex items-center gap-2">
              <Diamond className="w-4 h-4 text-amber-500" />
              <span>Milestone</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-red-500" />
              <span>Today</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-blue-400" />
              <span>Dependency</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}