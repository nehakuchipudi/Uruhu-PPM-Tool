import React, { useState } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Textarea } from '@/app/components/ui/textarea';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Project, Task } from '@/types';
import { MediaDetailModal } from '@/app/components/MediaDetailModal';
import {
  FileText,
  Upload,
  Download,
  Trash2,
  Eye,
  Plus,
  MessageSquare,
  Calendar,
  User,
  Folder,
  FolderOpen,
  Image as ImageIcon,
  Video,
  File,
  ChevronRight,
  ChevronDown,
  Search,
  Filter,
  Grid,
  List,
  Send,
  Paperclip,
  Smile,
  MoreVertical,
  Edit,
  Pin,
  Archive,
  Star,
  MapPin,
  Clock,
  Tag,
  Users,
} from 'lucide-react';

interface ProjectFilesNotesTabProps {
  project: Project;
  tasks?: Task[];
}

interface FileNode {
  id: string;
  name: string;
  type: 'folder' | 'file' | 'image' | 'video' | 'document';
  size?: string;
  uploadedBy?: string;
  uploadedDate?: string;
  timestamp?: string;
  url?: string;
  geoLocation?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  tags?: string[];
  description?: string;
  relatedTo?: string;
  dimensions?: string;
  device?: string;
  children?: FileNode[];
  isExpanded?: boolean;
  thumbnailUrl?: string;
}

interface Note {
  id: string;
  author: string;
  authorAvatar?: string;
  date: string;
  content: string;
  isPinned?: boolean;
  tags?: string[];
  attachments?: string[];
}

interface ChatMessage {
  id: string;
  sender: string;
  senderAvatar?: string;
  message: string;
  timestamp: string;
  attachments?: string[];
  reactions?: { emoji: string; count: number }[];
}

export function ProjectFilesNotesTab({ project, tasks }: ProjectFilesNotesTabProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [selectedMediaIndex, setSelectedMediaIndex] = useState<number | null>(null);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['root', 'task-photos']));
  const [newNote, setNewNote] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'files' | 'notes' | 'chat'>('files');
  const [searchQuery, setSearchQuery] = useState('');

  // File structure with hierarchical folders
  const [fileStructure, setFileStructure] = useState<FileNode[]>([
    {
      id: 'root',
      name: 'Project Root',
      type: 'folder',
      isExpanded: true,
      children: [
        {
          id: 'documents',
          name: 'Documents',
          type: 'folder',
          isExpanded: false,
          children: [
            {
              id: 'doc1',
              name: 'Project Requirements.pdf',
              type: 'document',
              size: '2.4 MB',
              uploadedBy: 'John Martinez',
              uploadedDate: '2025-01-15',
              timestamp: '2025-01-15 10:30 AM',
              url: 'https://via.placeholder.com/400x300/blue/white?text=Requirements',
            },
            {
              id: 'doc2',
              name: 'Design Specifications.docx',
              type: 'document',
              size: '1.8 MB',
              uploadedBy: 'Sarah Chen',
              uploadedDate: '2025-01-18',
              timestamp: '2025-01-18 02:15 PM',
              url: 'https://via.placeholder.com/400x300/green/white?text=Design',
            },
          ],
        },
        {
          id: 'task-photos',
          name: 'Task Photos',
          type: 'folder',
          isExpanded: true,
          children: [
            {
              id: 'task-1-folder',
              name: 'Foundation Work',
              type: 'folder',
              isExpanded: false,
              relatedTo: 'Task: Foundation Work',
              children: [
                {
                  id: 'img1',
                  name: 'Site_Prep_001.jpg',
                  type: 'image',
                  size: '3.2 MB',
                  uploadedBy: 'Mike Thompson',
                  uploadedDate: '2025-01-20',
                  timestamp: '2025-01-20 08:45 AM',
                  url: 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=800',
                  thumbnailUrl: 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=200',
                  geoLocation: {
                    latitude: 37.7749,
                    longitude: -122.4194,
                    address: '123 Construction Site, San Francisco, CA 94102',
                  },
                  tags: ['foundation', 'progress', 'phase-1'],
                  description: 'Initial site preparation completed',
                  dimensions: '4032 x 3024',
                  device: 'iPhone 14 Pro',
                  relatedTo: 'Task: Foundation Work',
                },
                {
                  id: 'img2',
                  name: 'Foundation_Pour_001.jpg',
                  type: 'image',
                  size: '2.8 MB',
                  uploadedBy: 'Mike Thompson',
                  uploadedDate: '2025-01-21',
                  timestamp: '2025-01-21 11:20 AM',
                  url: 'https://images.unsplash.com/photo-1513467535987-fd81bc7d62f8?w=800',
                  thumbnailUrl: 'https://images.unsplash.com/photo-1513467535987-fd81bc7d62f8?w=200',
                  geoLocation: {
                    latitude: 37.7749,
                    longitude: -122.4194,
                    address: '123 Construction Site, San Francisco, CA 94102',
                  },
                  tags: ['foundation', 'concrete', 'phase-1'],
                  description: 'Concrete pour in progress',
                  dimensions: '4032 x 3024',
                  device: 'iPhone 14 Pro',
                  relatedTo: 'Task: Foundation Work',
                },
              ],
            },
            {
              id: 'task-2-folder',
              name: 'Framing',
              type: 'folder',
              isExpanded: false,
              relatedTo: 'Task: Framing',
              children: [
                {
                  id: 'img3',
                  name: 'Framing_Progress_001.jpg',
                  type: 'image',
                  size: '3.5 MB',
                  uploadedBy: 'Sarah Chen',
                  uploadedDate: '2025-01-22',
                  timestamp: '2025-01-22 03:30 PM',
                  url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800',
                  thumbnailUrl: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=200',
                  geoLocation: {
                    latitude: 37.7750,
                    longitude: -122.4195,
                    address: '123 Construction Site, San Francisco, CA 94102',
                  },
                  tags: ['framing', 'structure', 'phase-2'],
                  description: 'Wall framing completed on first floor',
                  dimensions: '4032 x 3024',
                  device: 'Canon EOS R5',
                  relatedTo: 'Task: Framing',
                },
              ],
            },
          ],
        },
        {
          id: 'videos',
          name: 'Videos',
          type: 'folder',
          isExpanded: false,
          children: [
            {
              id: 'vid1',
              name: 'Site_Walkthrough.mp4',
              type: 'video',
              size: '125.4 MB',
              uploadedBy: 'John Martinez',
              uploadedDate: '2025-01-19',
              timestamp: '2025-01-19 09:00 AM',
              url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
              thumbnailUrl: 'https://via.placeholder.com/200x150/333/white?text=Video',
              geoLocation: {
                latitude: 37.7749,
                longitude: -122.4194,
                address: '123 Construction Site, San Francisco, CA 94102',
              },
              tags: ['walkthrough', 'overview'],
              description: 'Complete site walkthrough video',
              device: 'DJI Osmo Mobile 6',
              relatedTo: 'Project Overview',
            },
          ],
        },
        {
          id: 'drawings',
          name: 'Drawings & Plans',
          type: 'folder',
          isExpanded: false,
          children: [
            {
              id: 'draw1',
              name: 'Floor_Plan_Rev_3.pdf',
              type: 'document',
              size: '5.2 MB',
              uploadedBy: 'Sarah Chen',
              uploadedDate: '2025-01-17',
              timestamp: '2025-01-17 01:45 PM',
              url: 'https://via.placeholder.com/400x300/purple/white?text=Floor+Plan',
            },
          ],
        },
      ],
    },
  ]);

  const [notes, setNotes] = useState<Note[]>([
    {
      id: '1',
      author: 'John Martinez',
      date: '2025-01-20T10:30:00',
      content: 'Initial site assessment completed. Everything looks good to proceed with phase 1. Weather conditions are favorable for the next two weeks.',
      isPinned: true,
      tags: ['assessment', 'phase-1'],
      attachments: ['Site_Assessment.pdf'],
    },
    {
      id: '2',
      author: 'Sarah Chen',
      date: '2025-01-18T14:15:00',
      content: 'Met with client to review design changes. Approved and ready to implement. Updated drawings uploaded to the Drawings folder.',
      tags: ['client-meeting', 'design'],
    },
    {
      id: '3',
      author: 'Mike Thompson',
      date: '2025-01-15T09:00:00',
      content: 'Equipment ordered and expected to arrive by end of week. Crane scheduled for Monday 8 AM.',
      tags: ['equipment', 'logistics'],
    },
  ]);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'John Martinez',
      message: 'Team, great progress on the foundation work! Let\'s keep this momentum going.',
      timestamp: '2025-01-21 09:15 AM',
      reactions: [{ emoji: '👍', count: 3 }],
    },
    {
      id: '2',
      sender: 'Sarah Chen',
      message: 'I uploaded the updated floor plans. Please review before tomorrow\'s meeting.',
      timestamp: '2025-01-21 10:30 AM',
      attachments: ['Floor_Plan_Rev_3.pdf'],
    },
    {
      id: '3',
      sender: 'Mike Thompson',
      message: 'Equipment arrived early! We can start framing tomorrow.',
      timestamp: '2025-01-21 02:45 PM',
      reactions: [{ emoji: '🎉', count: 2 }, { emoji: '👏', count: 1 }],
    },
  ]);

  // Get all media files for the modal viewer
  const getAllMediaFiles = (nodes: FileNode[]): FileNode[] => {
    let media: FileNode[] = [];
    nodes.forEach((node) => {
      if (node.type === 'image' || node.type === 'video') {
        media.push(node);
      }
      if (node.children) {
        media = [...media, ...getAllMediaFiles(node.children)];
      }
    });
    return media;
  };

  const allMediaFiles = getAllMediaFiles(fileStructure);

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const openMediaModal = (fileId: string) => {
    const index = allMediaFiles.findIndex((f) => f.id === fileId);
    if (index >= 0) {
      setSelectedMediaIndex(index);
      setIsMediaModalOpen(true);
    }
  };

  const handleNextMedia = () => {
    if (selectedMediaIndex !== null && selectedMediaIndex < allMediaFiles.length - 1) {
      setSelectedMediaIndex(selectedMediaIndex + 1);
    }
  };

  const handlePreviousMedia = () => {
    if (selectedMediaIndex !== null && selectedMediaIndex > 0) {
      setSelectedMediaIndex(selectedMediaIndex - 1);
    }
  };

  const renderFileTree = (nodes: FileNode[], level: number = 0) => {
    return nodes.map((node) => {
      const isExpanded = expandedFolders.has(node.id);

      return (
        <div key={node.id}>
          <div
            className={`flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer ${
              level > 0 ? 'ml-' + (level * 4) : ''
            }`}
            style={{ paddingLeft: `${level * 16 + 8}px` }}
            onClick={() => {
              if (node.type === 'folder') {
                toggleFolder(node.id);
              } else if (node.type === 'image' || node.type === 'video') {
                openMediaModal(node.id);
              }
            }}
          >
            {node.type === 'folder' && (
              <>
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
                {isExpanded ? (
                  <FolderOpen className="w-5 h-5 text-amber-500" />
                ) : (
                  <Folder className="w-5 h-5 text-amber-500" />
                )}
              </>
            )}
            {node.type === 'image' && <ImageIcon className="w-5 h-5 text-blue-500" />}
            {node.type === 'video' && <Video className="w-5 h-5 text-purple-500" />}
            {node.type === 'document' && <FileText className="w-5 h-5 text-gray-500" />}
            
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{node.name}</p>
              {node.size && (
                <p className="text-xs text-gray-500">
                  {node.size}
                  {node.uploadedBy && ` • ${node.uploadedBy}`}
                </p>
              )}
            </div>

            {node.type !== 'folder' && (
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                  <Download className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {node.type === 'folder' && isExpanded && node.children && (
            <div>{renderFileTree(node.children, level + 1)}</div>
          )}
        </div>
      );
    });
  };

  const renderGridView = (nodes: FileNode[]) => {
    const flattenFiles = (items: FileNode[]): FileNode[] => {
      let files: FileNode[] = [];
      items.forEach((item) => {
        if (item.type !== 'folder') {
          files.push(item);
        }
        if (item.children) {
          files = [...files, ...flattenFiles(item.children)];
        }
      });
      return files;
    };

    const allFiles = flattenFiles(nodes);

    return (
      <div className="grid grid-cols-4 gap-4">
        {allFiles.map((file) => (
          <div
            key={file.id}
            className="border border-gray-200 rounded-lg overflow-hidden hover:border-blue-300 transition-colors cursor-pointer"
            onClick={() => {
              if (file.type === 'image' || file.type === 'video') {
                openMediaModal(file.id);
              }
            }}
          >
            {file.type === 'image' && file.thumbnailUrl && (
              <div className="aspect-video bg-gray-100">
                <img
                  src={file.thumbnailUrl}
                  alt={file.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            {file.type === 'video' && file.thumbnailUrl && (
              <div className="aspect-video bg-gray-900 relative">
                <img
                  src={file.thumbnailUrl}
                  alt={file.name}
                  className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Video className="w-12 h-12 text-white" />
                </div>
              </div>
            )}
            {file.type === 'document' && (
              <div className="aspect-video bg-gray-50 flex items-center justify-center">
                <FileText className="w-12 h-12 text-gray-400" />
              </div>
            )}
            <div className="p-3">
              <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
              <p className="text-xs text-gray-500">{file.size}</p>
              {file.relatedTo && (
                <Badge variant="outline" className="text-xs mt-1">
                  {file.relatedTo}
                </Badge>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const addNote = () => {
    if (newNote.trim()) {
      const note: Note = {
        id: `note-${Date.now()}`,
        author: 'Current User',
        date: new Date().toISOString(),
        content: newNote,
      };
      setNotes([note, ...notes]);
      setNewNote('');
    }
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message: ChatMessage = {
        id: `msg-${Date.now()}`,
        sender: 'Current User',
        message: newMessage,
        timestamp: new Date().toLocaleString(),
      };
      setChatMessages([...chatMessages, message]);
      setNewMessage('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="files" className="gap-2">
              <Folder className="w-4 h-4" />
              Files & Media
            </TabsTrigger>
            <TabsTrigger value="notes" className="gap-2">
              <FileText className="w-4 h-4" />
              Project Notes
            </TabsTrigger>
            <TabsTrigger value="chat" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              Team Communication
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Files Tab */}
        <TabsContent value="files" className="mt-6">
          <div className="grid grid-cols-4 gap-6">
            {/* File Browser */}
            <div className="col-span-3">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search files..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                    >
                      <List className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid className="w-4 h-4" />
                    </Button>
                    <Button className="gap-2">
                      <Upload className="w-4 h-4" />
                      Upload
                    </Button>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4 max-h-[600px] overflow-y-auto">
                  {viewMode === 'list' ? (
                    renderFileTree(fileStructure)
                  ) : (
                    renderGridView(fileStructure)
                  )}
                </div>
              </Card>
            </div>

            {/* Quick Stats Sidebar */}
            <div className="space-y-4">
              <Card className="p-4">
                <h3 className="font-semibold text-gray-900 mb-4">Storage</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">Used</span>
                      <span className="text-xs font-medium text-gray-900">182.6 MB</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '36%' }} />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">of 500 MB</p>
                </div>
              </Card>

              <Card className="p-4">
                <h3 className="font-semibold text-gray-900 mb-4">File Types</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-gray-900">Images</span>
                    </div>
                    <Badge variant="outline">3</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Video className="w-4 h-4 text-purple-500" />
                      <span className="text-sm text-gray-900">Videos</span>
                    </div>
                    <Badge variant="outline">1</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-900">Documents</span>
                    </div>
                    <Badge variant="outline">3</Badge>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <h3 className="font-semibold text-gray-900 mb-4">Recent Uploads</h3>
                <div className="space-y-3">
                  {allMediaFiles.slice(0, 3).map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                      onClick={() => openMediaModal(file.id)}
                    >
                      {file.thumbnailUrl && (
                        <img
                          src={file.thumbnailUrl}
                          alt={file.name}
                          className="w-10 h-10 rounded object-cover"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">{file.size}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes" className="mt-6">
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2">
              <Card className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Project Notes</h3>

                {/* Add New Note */}
                <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <Textarea
                    placeholder="Add a new note or project update..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    rows={4}
                    className="mb-3"
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Paperclip className="w-4 h-4 mr-2" />
                        Attach
                      </Button>
                      <Button variant="outline" size="sm">
                        <Tag className="w-4 h-4 mr-2" />
                        Tag
                      </Button>
                    </div>
                    <Button size="sm" onClick={addNote}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Note
                    </Button>
                  </div>
                </div>

                {/* Notes Feed */}
                <div className="space-y-4">
                  {notes
                    .sort((a, b) => {
                      if (a.isPinned && !b.isPinned) return -1;
                      if (!a.isPinned && b.isPinned) return 1;
                      return new Date(b.date).getTime() - new Date(a.date).getTime();
                    })
                    .map((note) => (
                      <Card
                        key={note.id}
                        className={`p-4 ${note.isPinned ? 'border-amber-300 bg-amber-50' : ''}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <p className="font-medium text-gray-900">{note.author}</p>
                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(note.date).toLocaleString()}
                                </p>
                              </div>
                              <div className="flex gap-1">
                                {note.isPinned && <Pin className="w-4 h-4 text-amber-600" />}
                                <Button variant="ghost" size="sm">
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            <p className="text-sm text-gray-700 mb-3">{note.content}</p>
                            {note.tags && note.tags.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-2">
                                {note.tags.map((tag, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    #{tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            {note.attachments && note.attachments.length > 0 && (
                              <div className="flex items-center gap-2 text-xs text-gray-600">
                                <Paperclip className="w-3 h-3" />
                                {note.attachments.length} attachment(s)
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                </div>
              </Card>
            </div>

            {/* Notes Sidebar */}
            <div className="space-y-4">
              <Card className="p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Quick Actions</h4>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Pin className="w-4 h-4" />
                    Pinned Notes
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Star className="w-4 h-4" />
                    Important
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Archive className="w-4 h-4" />
                    Archived
                  </Button>
                </div>
              </Card>

              <Card className="p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">
                    #assessment
                  </Badge>
                  <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">
                    #phase-1
                  </Badge>
                  <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">
                    #client-meeting
                  </Badge>
                  <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">
                    #design
                  </Badge>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Team Communication Tab */}
        <TabsContent value="chat" className="mt-6">
          <Card className="h-[700px] flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Project Team Chat</h3>
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    5 members online
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.map((msg) => (
                <div key={msg.id} className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                    {msg.sender.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2 mb-1">
                      <p className="font-medium text-gray-900">{msg.sender}</p>
                      <p className="text-xs text-gray-500">{msg.timestamp}</p>
                    </div>
                    <div className="bg-gray-100 rounded-lg p-3 inline-block max-w-2xl">
                      <p className="text-sm text-gray-900">{msg.message}</p>
                    </div>
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="mt-2">
                        {msg.attachments.map((att, idx) => (
                          <div
                            key={idx}
                            className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded px-3 py-2 text-sm"
                          >
                            <Paperclip className="w-4 h-4 text-gray-400" />
                            {att}
                          </div>
                        ))}
                      </div>
                    )}
                    {msg.reactions && msg.reactions.length > 0 && (
                      <div className="flex gap-1 mt-2">
                        {msg.reactions.map((reaction, idx) => (
                          <button
                            key={idx}
                            className="px-2 py-1 bg-white border border-gray-200 rounded-full text-xs hover:bg-gray-50"
                          >
                            {reaction.emoji} {reaction.count}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Textarea
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    rows={2}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Button variant="outline" size="sm">
                    <Paperclip className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Smile className="w-4 h-4" />
                  </Button>
                  <Button onClick={sendMessage}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Media Detail Modal */}
      {selectedMediaIndex !== null && allMediaFiles[selectedMediaIndex] && (
        <MediaDetailModal
          isOpen={isMediaModalOpen}
          onClose={() => {
            setIsMediaModalOpen(false);
            setSelectedMediaIndex(null);
          }}
          media={{
            id: allMediaFiles[selectedMediaIndex].id,
            name: allMediaFiles[selectedMediaIndex].name,
            type: allMediaFiles[selectedMediaIndex].type as 'image' | 'video' | 'document',
            url: allMediaFiles[selectedMediaIndex].url || '',
            size: allMediaFiles[selectedMediaIndex].size || '',
            uploadedBy: allMediaFiles[selectedMediaIndex].uploadedBy || '',
            uploadedDate: allMediaFiles[selectedMediaIndex].uploadedDate || '',
            timestamp: allMediaFiles[selectedMediaIndex].timestamp || '',
            geoLocation: allMediaFiles[selectedMediaIndex].geoLocation,
            tags: allMediaFiles[selectedMediaIndex].tags,
            description: allMediaFiles[selectedMediaIndex].description,
            relatedTo: allMediaFiles[selectedMediaIndex].relatedTo,
            dimensions: allMediaFiles[selectedMediaIndex].dimensions,
            device: allMediaFiles[selectedMediaIndex].device,
          }}
          allMedia={allMediaFiles.map((f) => ({
            id: f.id,
            name: f.name,
            type: f.type as 'image' | 'video' | 'document',
            url: f.url || '',
            size: f.size || '',
            uploadedBy: f.uploadedBy || '',
            uploadedDate: f.uploadedDate || '',
            timestamp: f.timestamp || '',
            geoLocation: f.geoLocation,
            tags: f.tags,
            description: f.description,
            relatedTo: f.relatedTo,
            dimensions: f.dimensions,
            device: f.device,
          }))}
          onNext={handleNextMedia}
          onPrevious={handlePreviousMedia}
        />
      )}
    </div>
  );
}
