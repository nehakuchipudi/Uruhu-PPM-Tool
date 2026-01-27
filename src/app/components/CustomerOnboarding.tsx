import { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Card } from '@/app/components/ui/card';
import { Textarea } from '@/app/components/ui/textarea';
import { Customer } from '@/types';

interface CustomerOnboardingProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onComplete?: (customer: Customer) => void;
  onSubmit?: (customer: Customer) => void;
  onCancel?: () => void;
}

export function CustomerOnboarding({ 
  open = true, 
  onOpenChange,
  onComplete, 
  onSubmit,
  onCancel 
}: CustomerOnboardingProps) {
  const [formData, setFormData] = useState({
    name: '',
    logo: '🏢',
    primaryColor: '#2563eb',
    customFields: '',
  });

  const handleClose = () => {
    if (onOpenChange) {
      onOpenChange(false);
    }
    if (onCancel) {
      onCancel();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newCustomer: Customer = {
      id: `cust-${Date.now()}`,
      name: formData.name,
      logo: formData.logo,
      primaryColor: formData.primaryColor,
      settings: {
        workflowEnabled: true,
        customFields: formData.customFields.split(',').map(f => f.trim()).filter(Boolean),
      },
      createdAt: new Date().toISOString().split('T')[0],
    };
    
    if (onComplete) {
      onComplete(newCustomer);
    }
    if (onSubmit) {
      onSubmit(newCustomer);
    }
  };

  // Don't render if not open
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl bg-white p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Customer Onboarding</h2>
          <p className="text-gray-600">Create a new customer account with customized branding and workflows</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Company Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter company name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="logo">Logo Emoji</Label>
            <Input
              id="logo"
              value={formData.logo}
              onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
              placeholder="🏢"
              maxLength={2}
            />
            <p className="text-sm text-gray-500">Choose an emoji to represent this customer</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="color">Primary Brand Color</Label>
            <div className="flex gap-3 items-center">
              <Input
                id="color"
                type="color"
                value={formData.primaryColor}
                onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                className="w-20 h-10"
              />
              <span className="text-sm text-gray-600">{formData.primaryColor}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="customFields">Custom Workflow Fields</Label>
            <Textarea
              id="customFields"
              value={formData.customFields}
              onChange={(e) => setFormData({ ...formData, customFields: e.target.value })}
              placeholder="Service Type, Equipment Used, Location"
              rows={3}
            />
            <p className="text-sm text-gray-500">Comma-separated list of custom fields for work orders</p>
          </div>
          
          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" style={{ backgroundColor: formData.primaryColor }}>
              Create Customer Account
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}