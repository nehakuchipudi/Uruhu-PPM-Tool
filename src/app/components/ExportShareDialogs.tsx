import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Label } from '@/app/components/ui/label';
import { Input } from '@/app/components/ui/input';
import { Download, Share2, Link, Mail, Copy, CheckCircle2, FileJson, FileSpreadsheet, Upload } from 'lucide-react';
import { Task, Person } from '@/types';
import { toast } from 'sonner';

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

interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
  tasks: Task[];
  milestones: Milestone[];
  people: Person[];
  projectName: string;
}

interface ShareDialogProps {
  open: boolean;
  onClose: () => void;
  projectName: string;
  projectId: string;
}

interface ImportDialogProps {
  open: boolean;
  onClose: () => void;
  onImport: (data: any) => void;
}

export function ExportDialog({ open, onClose, tasks, milestones, people, projectName }: ExportDialogProps) {
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'excel'>('csv');
  const [includeSubtasks, setIncludeSubtasks] = useState(true);
  const [includeMilestones, setIncludeMilestones] = useState(true);

  const exportToCSV = () => {
    const headers = ['Name', 'Status', 'Priority', 'Assignee', 'Start Date', 'End Date', 'Progress', 'Estimated Hours'];
    const rows = [headers];

    tasks.forEach(task => {
      const assignee = task.assignedTo.map(id => people.find(p => p.id === id)?.name || '').join('; ');
      rows.push([
        task.name,
        task.status,
        task.priority,
        assignee,
        task.startDate,
        task.endDate,
        `${task.progress}%`,
        `${task.estimatedHours || 0}`,
      ]);
    });

    if (includeMilestones) {
      rows.push(['', '', '', '', '', '', '', '']);
      rows.push(['MILESTONES', '', '', '', '', '', '', '']);
      milestones.forEach(milestone => {
        const owner = people.find(p => p.id === milestone.ownerId)?.name || '';
        rows.push([
          milestone.name,
          milestone.status,
          milestone.priority,
          owner,
          '',
          milestone.targetDate,
          '',
          '',
        ]);
      });
    }

    const csvContent = rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${projectName}_tasks_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success('Tasks exported to CSV successfully');
    onClose();
  };

  const exportToJSON = () => {
    const data = {
      project: projectName,
      exportDate: new Date().toISOString(),
      tasks: tasks.map(task => ({
        ...task,
        assignedTo: task.assignedTo.map(id => people.find(p => p.id === id)?.name || id),
      })),
      milestones: includeMilestones ? milestones.map(milestone => ({
        ...milestone,
        owner: people.find(p => p.id === milestone.ownerId)?.name || milestone.ownerId,
      })) : [],
      people: people,
    };

    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${projectName}_project_data_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    toast.success('Project data exported to JSON successfully');
    onClose();
  };

  const handleExport = () => {
    if (exportFormat === 'csv') {
      exportToCSV();
    } else if (exportFormat === 'json') {
      exportToJSON();
    } else {
      toast.info('Excel export coming soon!');
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Project Schedule
          </DialogTitle>
          <DialogDescription>
            Choose your export format and options
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Export Format</Label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setExportFormat('csv')}
                className={`p-3 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${
                  exportFormat === 'csv'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <FileSpreadsheet className="w-6 h-6 text-blue-600" />
                <span className="text-xs font-medium">CSV</span>
              </button>
              <button
                onClick={() => setExportFormat('json')}
                className={`p-3 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${
                  exportFormat === 'json'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <FileJson className="w-6 h-6 text-purple-600" />
                <span className="text-xs font-medium">JSON</span>
              </button>
              <button
                onClick={() => setExportFormat('excel')}
                className={`p-3 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${
                  exportFormat === 'excel'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <FileSpreadsheet className="w-6 h-6 text-green-600" />
                <span className="text-xs font-medium">Excel</span>
              </button>
            </div>
          </div>

          <div className="space-y-3 border-t pt-4">
            <Label>Include</Label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeSubtasks}
                  onChange={(e) => setIncludeSubtasks(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Subtasks</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeMilestones}
                  onChange={(e) => setIncludeMilestones(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Milestones</span>
              </label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleExport} className="gap-2">
            <Download className="w-4 h-4" />
            Export {exportFormat.toUpperCase()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ShareDialog({ open, onClose, projectName, projectId }: ShareDialogProps) {
  const [shareMethod, setShareMethod] = useState<'link' | 'email'>('link');
  const [email, setEmail] = useState('');
  const [copied, setCopied] = useState(false);

  const shareLink = `https://uhuru-sdpm.app/projects/${projectId}/schedule`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    toast.success('Link copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareEmail = () => {
    if (!email) {
      toast.error('Please enter an email address');
      return;
    }
    toast.success(`Share link sent to ${email}`);
    setEmail('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Share Project Schedule
          </DialogTitle>
          <DialogDescription>
            Share "{projectName}" with your team
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
            <button
              onClick={() => setShareMethod('link')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-all ${
                shareMethod === 'link'
                  ? 'bg-white shadow-sm text-blue-600 font-medium'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Link className="w-4 h-4" />
              Copy Link
            </button>
            <button
              onClick={() => setShareMethod('email')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-all ${
                shareMethod === 'email'
                  ? 'bg-white shadow-sm text-blue-600 font-medium'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Mail className="w-4 h-4" />
              Email
            </button>
          </div>

          {shareMethod === 'link' && (
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-600 mb-2 font-medium">Share Link</p>
                <div className="flex items-center gap-2">
                  <Input
                    value={shareLink}
                    readOnly
                    className="flex-1 text-sm"
                  />
                  <Button
                    onClick={handleCopyLink}
                    size="sm"
                    className="gap-2"
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                Anyone with this link can view the project schedule
              </p>
            </div>
          )}

          {shareMethod === 'email' && (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="colleague@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <p className="text-xs text-gray-500">
                We'll send them an email with a link to view the project schedule
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {shareMethod === 'link' ? (
            <Button onClick={handleCopyLink} className="gap-2">
              <Copy className="w-4 h-4" />
              {copied ? 'Copied!' : 'Copy Link'}
            </Button>
          ) : (
            <Button onClick={handleShareEmail} className="gap-2">
              <Mail className="w-4 h-4" />
              Send Email
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ImportDialog({ open, onClose, onImport }: ImportDialogProps) {
  const [importFormat, setImportFormat] = useState<'csv' | 'json'>('json');
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;

        if (importFormat === 'json') {
          const data = JSON.parse(content);
          onImport(data);
          toast.success('Data imported successfully!');
          onClose();
        } else {
          const lines = content.split('\n');
          const headers = lines[0].split(',');
          const tasks = [];

          for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',');
            if (values.length === headers.length) {
              const task: any = {};
              headers.forEach((header, index) => {
                task[header.trim().replace(/"/g, '')] = values[index].trim().replace(/"/g, '');
              });
              tasks.push(task);
            }
          }

          onImport({ tasks });
          toast.success('CSV data imported successfully!');
          onClose();
        }
      } catch (error) {
        toast.error('Failed to parse file. Please check the format.');
      }
    };

    reader.readAsText(file);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Import Project Data
          </DialogTitle>
          <DialogDescription>
            Import tasks and milestones from a file
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Import Format</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setImportFormat('json')}
                className={`p-3 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${
                  importFormat === 'json'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <FileJson className="w-6 h-6 text-purple-600" />
                <span className="text-xs font-medium">JSON</span>
              </button>
              <button
                onClick={() => setImportFormat('csv')}
                className={`p-3 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${
                  importFormat === 'csv'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <FileSpreadsheet className="w-6 h-6 text-blue-600" />
                <span className="text-xs font-medium">CSV</span>
              </button>
            </div>
          </div>

          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
              dragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-sm font-medium text-gray-700 mb-1">
              Drop your {importFormat.toUpperCase()} file here
            </p>
            <p className="text-xs text-gray-500 mb-3">or</p>
            <label className="inline-block">
              <input
                type="file"
                accept={importFormat === 'json' ? '.json' : '.csv'}
                onChange={handleFileInput}
                className="hidden"
              />
              <Button type="button" variant="outline" size="sm" className="cursor-pointer">
                Browse Files
              </Button>
            </label>
          </div>

          <p className="text-xs text-gray-500">
            Supported formats: {importFormat === 'json' ? 'JSON' : 'CSV'} files exported from Uhuru SDPM
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}