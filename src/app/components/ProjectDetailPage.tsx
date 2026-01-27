import React, { useState } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Project, Task, Person } from '@/types';
import { EditableProjectOverviewTab } from '@/app/components/EditableProjectOverviewTab';
import { ProjectScheduleTab } from '@/app/components/ProjectScheduleTabV2';
import { ProjectBudgetTab } from '@/app/components/ProjectBudgetTab';
import { ProjectDashboardTab } from '@/app/components/ProjectDashboardTabEnhanced';
import { ProjectFilesNotesTab } from '@/app/components/ProjectFilesNotesTabEnhanced';
import {
  ArrowLeft,
  Edit,
  MoreVertical,
} from 'lucide-react';

interface ProjectDetailPageProps {
  project: Project;
  tasks: Task[];
  people: Person[];
  onBack: () => void;
  onEdit?: () => void;
}

export function ProjectDetailPage({
  project,
  tasks,
  people,
  onBack,
  onEdit,
}: ProjectDetailPageProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-500';
      case 'planning':
        return 'bg-blue-500';
      case 'on-hold':
        return 'bg-amber-500';
      case 'completed':
        return 'bg-gray-500';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button onClick={onBack} variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Portfolio
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-semibold text-gray-900">{project.name}</h2>
              <Badge className={getStatusColor(project.status)}>
                {project.status.replace('-', ' ')}
              </Badge>
            </div>
            <p className="text-gray-600 mt-1">{project.customerName}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 max-w-3xl">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="files">Files & Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <EditableProjectOverviewTab 
            project={project} 
            tasks={tasks} 
            people={people}
            onUpdateProject={(updates) => {
              console.log('Updating project:', updates);
              // In real app, this would call API to update project
            }}
          />
        </TabsContent>

        <TabsContent value="schedule" className="mt-6">
          <ProjectScheduleTab project={project} tasks={tasks} people={people} />
        </TabsContent>

        <TabsContent value="budget" className="mt-6">
          <ProjectBudgetTab project={project} tasks={tasks} />
        </TabsContent>

        <TabsContent value="dashboard" className="mt-6">
          <ProjectDashboardTab project={project} tasks={tasks} people={people} />
        </TabsContent>

        <TabsContent value="files" className="mt-6">
          <ProjectFilesNotesTab project={project} />
        </TabsContent>
      </Tabs>
    </div>
  );
}