import React, { useState, useRef } from 'react';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Progress } from '@/app/components/ui/progress';
import { Task, Person } from '@/types';
import {
  ChevronRight,
  ChevronDown,
  Edit,
  Trash2,
  Plus,
  GripVertical,
  Check,
  X,
  MoreVertical,
  Circle,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';

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

interface EnhancedScheduleListViewProps {
  tasks: Task[];
  milestones: Milestone[];
  people: Person[];
  onTaskUpdate: (task: Task) => void;
  onTaskDelete: (taskId: string) => void;
  onTaskAdd: (task: Partial<Task>, parentId?: string) => void;
  onTaskReorder: (taskId: string, newPosition: number) => void;
  onEditTask: (task: Task) => void;
}

interface DraggableRowProps {
  row: any;
  index: number;
  moveRow: (dragIndex: number, hoverIndex: number) => void;
  expandedRows: Set<string>;
  toggleRow: (id: string) => void;
  onAddSubtask: (parentId: string) => void;
  onEditRow: (row: any) => void;
  onDeleteRow: (id: string) => void;
  people: Person[];
}

const ItemTypes = {
  ROW: 'row',
};

function DraggableRow({
  row,
  index,
  moveRow,
  expandedRows,
  toggleRow,
  onAddSubtask,
  onEditRow,
  onDeleteRow,
  people,
}: DraggableRowProps) {
  const ref = useRef<HTMLTableRowElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(row.data.name || '');

  const [{ handlerId }, drop] = useDrop({
    accept: ItemTypes.ROW,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: any, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      moveRow(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.ROW,
    item: () => {
      return { id: row.data.id, index };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  const opacity = isDragging ? 0.4 : 1;
  const isExpanded = expandedRows.has(row.data.id);

  const handleSave = () => {
    if (editedName.trim()) {
      onEditRow({ ...row, data: { ...row.data, name: editedName } });
      setIsEditing(false);
      toast.success('Updated successfully');
    }
  };

  const handleCancel = () => {
    setEditedName(row.data.name || '');
    setIsEditing(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'in-progress':
        return <Circle className="w-4 h-4 text-blue-600" />;
      case 'at-risk':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Circle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const renderMilestoneRow = () => (
    <tr
      ref={ref}
      style={{ opacity }}
      data-handler-id={handlerId}
      className="bg-blue-50 hover:bg-blue-100 border-b-2 border-blue-200 transition-colors"
    >
      <td className="px-4 py-3 w-8">
        <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
      </td>
      <td className="px-4 py-3 font-semibold text-blue-900">
        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleRow(row.data.id)}
            className="hover:bg-blue-200 rounded p-1 transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
          {isEditing ? (
            <Input
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              className="h-7 text-sm"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
                if (e.key === 'Escape') handleCancel();
              }}
            />
          ) : (
            <span className="flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              {row.data.name}
            </span>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <Badge variant="outline" className={getPriorityColor(row.data.priority)}>
          {row.data.priority}
        </Badge>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          {getStatusIcon(row.data.status)}
          <span className="text-sm capitalize">{row.data.status.replace('-', ' ')}</span>
        </div>
      </td>
      <td className="px-4 py-3 text-sm">{row.data.targetDate}</td>
      <td className="px-4 py-3 text-sm">
        {people.find((p) => p.id === row.data.ownerId)?.name || 'Unassigned'}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          {isEditing ? (
            <>
              <Button size="sm" variant="ghost" onClick={handleSave} className="h-7 w-7 p-0">
                <Check className="w-4 h-4 text-green-600" />
              </Button>
              <Button size="sm" variant="ghost" onClick={handleCancel} className="h-7 w-7 p-0">
                <X className="w-4 h-4 text-red-600" />
              </Button>
            </>
          ) : (
            <>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsEditing(true)}
                className="h-7 w-7 p-0"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEditRow(row)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Details
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDeleteRow(row.data.id)}
                    className="text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </td>
    </tr>
  );

  const renderTaskRow = () => {
    const indentLevel = row.level;
    const paddingLeft = indentLevel * 24;

    return (
      <tr
        ref={ref}
        style={{ opacity }}
        data-handler-id={handlerId}
        className="hover:bg-gray-50 border-b transition-colors"
      >
        <td className="px-4 py-3 w-8">
          <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
        </td>
        <td className="px-4 py-3" style={{ paddingLeft: `${paddingLeft + 16}px` }}>
          <div className="flex items-center gap-2">
            {row.type === 'task' && (
              <button
                onClick={() => toggleRow(row.data.id)}
                className="hover:bg-gray-200 rounded p-1 transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            )}
            {isEditing ? (
              <Input
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="h-7 text-sm flex-1"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSave();
                  if (e.key === 'Escape') handleCancel();
                }}
              />
            ) : (
              <span className="text-sm">{row.data.name}</span>
            )}
          </div>
        </td>
        <td className="px-4 py-3">
          <Badge variant="outline" className={getPriorityColor(row.data.priority)}>
            {row.data.priority}
          </Badge>
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            {getStatusIcon(row.data.status)}
            <span className="text-sm capitalize">{row.data.status}</span>
          </div>
        </td>
        <td className="px-4 py-3">
          <div className="space-y-1">
            <Progress value={row.data.progress || 0} className="h-2" />
            <span className="text-xs text-gray-500">{row.data.progress || 0}%</span>
          </div>
        </td>
        <td className="px-4 py-3 text-sm">
          {row.data.assignedTo
            ?.map((id: string) => people.find((p) => p.id === id)?.name)
            .filter(Boolean)
            .join(', ') || 'Unassigned'}
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-1">
            {isEditing ? (
              <>
                <Button size="sm" variant="ghost" onClick={handleSave} className="h-7 w-7 p-0">
                  <Check className="w-4 h-4 text-green-600" />
                </Button>
                <Button size="sm" variant="ghost" onClick={handleCancel} className="h-7 w-7 p-0">
                  <X className="w-4 h-4 text-red-600" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsEditing(true)}
                  className="h-7 w-7 p-0"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                {row.type === 'task' && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onAddSubtask(row.data.id)}
                    className="h-7 w-7 p-0"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEditRow(row)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onAddSubtask(row.data.id)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Subtask
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDeleteRow(row.data.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        </td>
      </tr>
    );
  };

  return row.type === 'milestone' ? renderMilestoneRow() : renderTaskRow();
}

export function EnhancedScheduleListView({
  tasks,
  milestones,
  people,
  onTaskUpdate,
  onTaskDelete,
  onTaskAdd,
  onTaskReorder,
  onEditTask,
}: EnhancedScheduleListViewProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [tableRows, setTableRows] = useState<any[]>([]);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickAddName, setQuickAddName] = useState('');

  // Build table rows
  React.useEffect(() => {
    const rows: any[] = [];

    const sortedMilestones = [...milestones].sort(
      (a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime()
    );

    sortedMilestones.forEach((milestone) => {
      rows.push({
        type: 'milestone',
        data: milestone,
        level: 0,
      });

      if (expandedRows.has(milestone.id)) {
        const linkedTasks = tasks.filter((task) => milestone.linkedTasks.includes(task.id));

        linkedTasks.forEach((task) => {
          rows.push({
            type: 'task',
            data: task,
            level: 1,
          });

          if (expandedRows.has(task.id)) {
            const subtasks = tasks.filter((t) => t.id.startsWith(`${task.id}-sub`));
            subtasks.forEach((subtask) => {
              rows.push({
                type: 'subtask',
                data: subtask,
                level: 2,
              });
            });
          }
        });
      }
    });

    const unlinkedTasks = tasks.filter(
      (task) => !milestones.some((m) => m.linkedTasks.includes(task.id))
    );

    unlinkedTasks.forEach((task) => {
      rows.push({
        type: 'task',
        data: task,
        level: 0,
      });

      if (expandedRows.has(task.id)) {
        const subtasks = tasks.filter((t) => t.id.startsWith(`${task.id}-sub`));
        subtasks.forEach((subtask) => {
          rows.push({
            type: 'subtask',
            data: subtask,
            level: 1,
          });
        });
      }
    });

    setTableRows(rows);
  }, [tasks, milestones, expandedRows]);

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const moveRow = (dragIndex: number, hoverIndex: number) => {
    const draggedRow = tableRows[dragIndex];
    const newRows = [...tableRows];
    newRows.splice(dragIndex, 1);
    newRows.splice(hoverIndex, 0, draggedRow);
    setTableRows(newRows);
    onTaskReorder(draggedRow.data.id, hoverIndex);
  };

  const handleAddSubtask = (parentId: string) => {
    const newSubtask = {
      name: 'New Subtask',
      status: 'not-started' as const,
      priority: 'medium' as const,
      assignedTo: [],
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      progress: 0,
    };
    onTaskAdd(newSubtask, parentId);
    toast.success('Subtask added');
  };

  const handleQuickAdd = () => {
    if (quickAddName.trim()) {
      const newTask = {
        name: quickAddName,
        status: 'not-started' as const,
        priority: 'medium' as const,
        assignedTo: [],
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        progress: 0,
      };
      onTaskAdd(newTask);
      setQuickAddName('');
      setShowQuickAdd(false);
      toast.success('Task added successfully');
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button onClick={() => setShowQuickAdd(!showQuickAdd)} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Task
            </Button>
            {showQuickAdd && (
              <div className="flex items-center gap-2">
                <Input
                  value={quickAddName}
                  onChange={(e) => setQuickAddName(e.target.value)}
                  placeholder="Task name..."
                  className="w-64"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleQuickAdd();
                    if (e.key === 'Escape') {
                      setShowQuickAdd(false);
                      setQuickAddName('');
                    }
                  }}
                />
                <Button onClick={handleQuickAdd} size="sm">
                  <Check className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => {
                    setShowQuickAdd(false);
                    setQuickAddName('');
                  }}
                  size="sm"
                  variant="ghost"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-8"></th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Priority
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Progress
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Assigned To
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row, index) => (
                  <DraggableRow
                    key={row.data.id}
                    row={row}
                    index={index}
                    moveRow={moveRow}
                    expandedRows={expandedRows}
                    toggleRow={toggleRow}
                    onAddSubtask={handleAddSubtask}
                    onEditRow={(r) => onEditTask(r.data)}
                    onDeleteRow={onTaskDelete}
                    people={people}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DndProvider>
  );
}
