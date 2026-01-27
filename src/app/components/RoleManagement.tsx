import { useState } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Switch } from '@/app/components/ui/switch';
import { Badge } from '@/app/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/app/components/ui/dialog';
import { Shield, Plus, Edit, Trash2, CheckCircle2, UserCheck } from 'lucide-react';
import { Role, Person } from '@/types';
import { toast } from 'sonner';

interface RoleManagementProps {
  roles: Role[];
  people: Person[];
  onAddRole: (role: Omit<Role, 'id'>) => void;
  onUpdateRole: (role: Role) => void;
  onDeleteRole: (roleId: string) => void;
}

export function RoleManagement({
  roles,
  people,
  onAddRole,
  onUpdateRole,
  onDeleteRole,
}: RoleManagementProps) {
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleName, setRoleName] = useState('');
  const [roleColor, setRoleColor] = useState('#3b82f6');
  const [canApproveWork, setCanApproveWork] = useState(false);
  const [roleLevel, setRoleLevel] = useState(1);

  const openNewRoleDialog = () => {
    setEditingRole(null);
    setRoleName('');
    setRoleColor('#3b82f6');
    setCanApproveWork(false);
    setRoleLevel(1);
    setShowRoleDialog(true);
  };

  const openEditRoleDialog = (role: Role) => {
    setEditingRole(role);
    setRoleName(role.name);
    setRoleColor(role.color);
    setCanApproveWork(role.canApproveWork || false);
    setRoleLevel(role.level || 1);
    setShowRoleDialog(true);
  };

  const handleSaveRole = () => {
    if (!roleName.trim()) {
      toast.error('Role name is required');
      return;
    }

    const roleData = {
      name: roleName,
      color: roleColor,
      instanceId: roles[0]?.instanceId || 'inst-1',
      canApproveWork,
      level: roleLevel,
    };

    if (editingRole) {
      onUpdateRole({ ...editingRole, ...roleData });
      toast.success('Role updated successfully');
    } else {
      onAddRole(roleData);
      toast.success('Role created successfully');
    }

    setShowRoleDialog(false);
  };

  const handleDeleteRole = (roleId: string) => {
    const peopleWithRole = people.filter(p => p.role === roles.find(r => r.id === roleId)?.name);
    
    if (peopleWithRole.length > 0) {
      toast.error(`Cannot delete role. ${peopleWithRole.length} team member(s) have this role.`);
      return;
    }

    onDeleteRole(roleId);
    toast.success('Role deleted successfully');
  };

  const getRoleStats = (role: Role) => {
    const count = people.filter(p => p.role === role.name).length;
    return count;
  };

  const getLevelLabel = (level: number) => {
    switch (level) {
      case 1:
        return 'Team Member';
      case 2:
        return 'Supervisor';
      case 3:
        return 'Manager';
      case 4:
        return 'Director';
      default:
        return `Level ${level}`;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Role Management</h3>
          <p className="text-gray-600 text-sm mt-1">Configure roles and approval workflows</p>
        </div>
        <Button onClick={openNewRoleDialog} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Role
        </Button>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map(role => (
          <Card key={role.id} className="p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${role.color}20` }}
                >
                  <Shield className="w-5 h-5" style={{ color: role.color }} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{role.name}</h4>
                  <p className="text-xs text-gray-500">{getRoleStats(role)} members</p>
                </div>
              </div>
              <div className="flex gap-1">
                <Button
                  onClick={() => openEditRoleDialog(role)}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => handleDeleteRole(role.id)}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Hierarchy Level</span>
                <Badge variant="outline" style={{ borderColor: role.color, color: role.color }}>
                  {getLevelLabel(role.level || 1)}
                </Badge>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Can Approve Work</span>
                {role.canApproveWork ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </div>
            </div>

            {role.canApproveWork && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <UserCheck className="w-3 h-3" />
                  <span>Receives approval requests</span>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Approval Workflow Info */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Approval Workflow</h4>
            <p className="text-sm text-gray-700 mb-3">
              When employees complete work orders, approval requests are routed to team members with roles that have approval permissions. The system routes to the lowest approval level first (Supervisors before Managers).
            </p>
            <div className="space-y-1 text-sm text-gray-700">
              <p>• <strong>Level 1 (Team Member):</strong> Completes work, submits for approval</p>
              <p>• <strong>Level 2 (Supervisor):</strong> Approves team member work</p>
              <p>• <strong>Level 3+ (Manager/Director):</strong> Can approve all work below their level</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Role Dialog */}
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingRole ? 'Edit Role' : 'Create New Role'}</DialogTitle>
            <DialogDescription>
              Configure role settings and approval permissions
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="roleName">Role Name *</Label>
              <Input
                id="roleName"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                placeholder="e.g., Field Supervisor"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="roleColor">Role Color</Label>
              <div className="flex items-center gap-3 mt-1">
                <Input
                  id="roleColor"
                  type="color"
                  value={roleColor}
                  onChange={(e) => setRoleColor(e.target.value)}
                  className="w-20 h-10"
                />
                <div
                  className="flex-1 h-10 rounded-md border-2"
                  style={{ backgroundColor: roleColor }}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="roleLevel">Hierarchy Level</Label>
              <select
                id="roleLevel"
                value={roleLevel}
                onChange={(e) => setRoleLevel(Number(e.target.value))}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value={1}>Level 1 - Team Member</option>
                <option value={2}>Level 2 - Supervisor</option>
                <option value={3}>Level 3 - Manager</option>
                <option value={4}>Level 4 - Director</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Higher levels can approve work from lower levels
              </p>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <Label htmlFor="canApprove" className="cursor-pointer">
                  Can Approve Work Orders
                </Label>
                <p className="text-xs text-gray-500 mt-1">
                  Allow this role to approve completed work
                </p>
              </div>
              <Switch
                id="canApprove"
                checked={canApproveWork}
                onCheckedChange={setCanApproveWork}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => setShowRoleDialog(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveRole}
                className="flex-1"
              >
                {editingRole ? 'Update Role' : 'Create Role'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
