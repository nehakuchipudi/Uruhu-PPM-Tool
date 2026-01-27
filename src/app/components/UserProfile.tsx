import { useState } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Switch } from '@/app/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { Badge } from '@/app/components/ui/badge';
import { Separator } from '@/app/components/ui/separator';
import { toast } from 'sonner';
import {
  User,
  Mail,
  Phone,
  Building2,
  Shield,
  Bell,
  Lock,
  Palette,
  Save,
  Camera,
  CheckCircle2,
} from 'lucide-react';

export interface UserProfileData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  department?: string;
  avatar?: string;
  organization: string;
  preferences: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    taskReminders: boolean;
    weeklyDigest: boolean;
    projectUpdates: boolean;
    approvalRequests: boolean;
    systemAnnouncements: boolean;
  };
  security: {
    twoFactorEnabled: boolean;
    sessionTimeout: number;
  };
}

interface UserProfileProps {
  userData: UserProfileData;
  onUpdate: (data: UserProfileData) => void;
}

export function UserProfile({ userData, onUpdate }: UserProfileProps) {
  const [editedData, setEditedData] = useState<UserProfileData>(userData);
  const [hasChanges, setHasChanges] = useState(false);

  const handleProfileUpdate = (field: string, value: any) => {
    setEditedData({
      ...editedData,
      [field]: value,
    });
    setHasChanges(true);
  };

  const handlePreferenceUpdate = (preference: string, value: boolean) => {
    setEditedData({
      ...editedData,
      preferences: {
        ...editedData.preferences,
        [preference]: value,
      },
    });
    setHasChanges(true);
  };

  const handleSecurityUpdate = (setting: string, value: any) => {
    setEditedData({
      ...editedData,
      security: {
        ...editedData.security,
        [setting]: value,
      },
    });
    setHasChanges(true);
  };

  const handleSaveChanges = () => {
    onUpdate(editedData);
    setHasChanges(false);
    toast.success('Profile updated successfully', {
      description: 'Your changes have been saved.',
      icon: <CheckCircle2 className="w-4 h-4" />,
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-foreground mb-2">User Profile & Settings</h2>
        <p className="text-muted-foreground">
          Manage your account information, preferences, and security settings
        </p>
      </div>

      {/* Profile Header Card */}
      <Card className="p-6">
        <div className="flex items-start gap-6">
          <div className="relative">
            <Avatar className="w-24 h-24 border-4 border-border">
              <AvatarImage src={editedData.avatar} alt={editedData.name} />
              <AvatarFallback className="text-2xl font-semibold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                {getInitials(editedData.name)}
              </AvatarFallback>
            </Avatar>
            <Button
              size="sm"
              variant="outline"
              className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full p-0 shadow-lg"
              onClick={() =>
                toast.info('Avatar upload', {
                  description: 'Photo upload requires backend integration',
                })
              }
            >
              <Camera className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex-1">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-1">{editedData.name}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Mail className="w-4 h-4" />
                  {editedData.email}
                </div>
              </div>
              <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-none">
                {editedData.role}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Building2 className="w-4 h-4" />
                <span>{editedData.organization}</span>
              </div>
              {editedData.department && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Shield className="w-4 h-4" />
                  <span>{editedData.department}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {hasChanges && (
          <div className="mt-6 pt-6 border-t border-border">
            <div className="flex items-center justify-between">
              <p className="text-sm text-amber-600 dark:text-amber-400 flex items-center gap-2">
                <span className="w-2 h-2 bg-amber-600 dark:bg-amber-400 rounded-full animate-pulse" />
                You have unsaved changes
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditedData(userData);
                    setHasChanges(false);
                    toast.info('Changes discarded');
                  }}
                >
                  Discard
                </Button>
                <Button size="sm" onClick={handleSaveChanges} className="gap-2">
                  <Save className="w-4 h-4" />
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Tabs for different sections */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-[500px]">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Personal Information
            </h3>
            <Separator className="mb-6" />

            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={editedData.name}
                    onChange={e => handleProfileUpdate('name', e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editedData.email}
                    onChange={e => handleProfileUpdate('email', e.target.value)}
                    placeholder="email@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={editedData.phone || ''}
                    onChange={e => handleProfileUpdate('phone', e.target.value)}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={editedData.department || ''}
                    onChange={e => handleProfileUpdate('department', e.target.value)}
                    placeholder="Engineering, Sales, etc."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="organization">Organization</Label>
                <Input
                  id="organization"
                  value={editedData.organization}
                  onChange={e => handleProfileUpdate('organization', e.target.value)}
                  placeholder="Company name"
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Contact your administrator to change organization details
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notification Preferences
            </h3>
            <Separator className="mb-6" />

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium text-foreground">Email Notifications</div>
                  <p className="text-sm text-muted-foreground">
                    Receive updates and alerts via email
                  </p>
                </div>
                <Switch
                  checked={editedData.preferences.emailNotifications}
                  onCheckedChange={value => handlePreferenceUpdate('emailNotifications', value)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium text-foreground">Push Notifications</div>
                  <p className="text-sm text-muted-foreground">
                    Get real-time notifications in your browser
                  </p>
                </div>
                <Switch
                  checked={editedData.preferences.pushNotifications}
                  onCheckedChange={value => handlePreferenceUpdate('pushNotifications', value)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium text-foreground">Task Reminders</div>
                  <p className="text-sm text-muted-foreground">
                    Get reminded about upcoming tasks and deadlines
                  </p>
                </div>
                <Switch
                  checked={editedData.preferences.taskReminders}
                  onCheckedChange={value => handlePreferenceUpdate('taskReminders', value)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium text-foreground">Weekly Digest</div>
                  <p className="text-sm text-muted-foreground">
                    Receive a weekly summary of your projects
                  </p>
                </div>
                <Switch
                  checked={editedData.preferences.weeklyDigest}
                  onCheckedChange={value => handlePreferenceUpdate('weeklyDigest', value)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium text-foreground">Project Updates</div>
                  <p className="text-sm text-muted-foreground">
                    Get notified when projects are updated
                  </p>
                </div>
                <Switch
                  checked={editedData.preferences.projectUpdates}
                  onCheckedChange={value => handlePreferenceUpdate('projectUpdates', value)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium text-foreground">Approval Requests</div>
                  <p className="text-sm text-muted-foreground">
                    Get notified when approvals are pending
                  </p>
                </div>
                <Switch
                  checked={editedData.preferences.approvalRequests}
                  onCheckedChange={value => handlePreferenceUpdate('approvalRequests', value)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium text-foreground">System Announcements</div>
                  <p className="text-sm text-muted-foreground">
                    Receive important system updates and announcements
                  </p>
                </div>
                <Switch
                  checked={editedData.preferences.systemAnnouncements}
                  onCheckedChange={value => handlePreferenceUpdate('systemAnnouncements', value)}
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Security Settings
            </h3>
            <Separator className="mb-6" />

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium text-foreground flex items-center gap-2">
                    Two-Factor Authentication
                    <Badge variant="outline" className="text-xs">
                      Recommended
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <Switch
                  checked={editedData.security.twoFactorEnabled}
                  onCheckedChange={value => handleSecurityUpdate('twoFactorEnabled', value)}
                />
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="font-medium text-foreground">Session Timeout</div>
                <p className="text-sm text-muted-foreground mb-3">
                  Automatically log out after period of inactivity
                </p>
                <div className="grid grid-cols-4 gap-3">
                  {[15, 30, 60, 120].map(minutes => (
                    <Button
                      key={minutes}
                      variant={editedData.security.sessionTimeout === minutes ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleSecurityUpdate('sessionTimeout', minutes)}
                    >
                      {minutes} min
                    </Button>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="font-medium text-foreground">Password</div>
                <p className="text-sm text-muted-foreground mb-3">
                  Change your password to keep your account secure
                </p>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() =>
                    toast.info('Change password', {
                      description: 'Password management requires backend integration',
                    })
                  }
                >
                  <Lock className="w-4 h-4" />
                  Change Password
                </Button>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="font-medium text-foreground">Active Sessions</div>
                <p className="text-sm text-muted-foreground mb-3">
                  Manage devices where you're currently logged in
                </p>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() =>
                    toast.info('Active sessions', {
                      description: 'Session management requires backend integration',
                    })
                  }
                >
                  View Active Sessions
                </Button>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
            <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
              Danger Zone
            </h3>
            <p className="text-sm text-red-700 dark:text-red-300 mb-4">
              Irreversible actions that will permanently affect your account
            </p>
            <Button
              variant="destructive"
              onClick={() =>
                toast.error('Account deletion', {
                  description: 'This action requires backend integration and admin approval',
                })
              }
            >
              Delete Account
            </Button>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
