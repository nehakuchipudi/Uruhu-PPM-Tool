import { useState } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Badge } from '@/app/components/ui/badge';
import { Progress } from '@/app/components/ui/progress';
import {
  Building2,
  Users,
  CreditCard,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  Mail,
  User,
  Briefcase,
  Palette,
} from 'lucide-react';
import { Customer, Person, Role, SubscriptionPlan } from '@/types';
import { toast } from 'sonner';

interface SubscriptionOnboardingProps {
  selectedPlan: SubscriptionPlan;
  userEmail: string;
  companyName: string;
  onComplete: (customer: Customer, team: Person[], roles: Role[]) => void;
  onCancel: () => void;
}

export function SubscriptionOnboarding({
  selectedPlan,
  userEmail,
  companyName,
  onComplete,
  onCancel,
}: SubscriptionOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  // Step 1: Company Details
  const [logo, setLogo] = useState('🏢');
  const [primaryColor, setPrimaryColor] = useState('#3b82f6');
  const [industry, setIndustry] = useState('');

  // Step 2: Team Members
  const [teamMembers, setTeamMembers] = useState<Array<{ name: string; email: string; role: string }>>([
    { name: '', email: userEmail, role: 'Admin' },
  ]);

  // Step 3: Roles
  const [roles, setRoles] = useState<Array<{ name: string; color: string; level: number; canApproveWork: boolean }>>([
    { name: 'Admin', color: '#dc2626', level: 4, canApproveWork: true },
    { name: 'Manager', color: '#ea580c', level: 3, canApproveWork: true },
    { name: 'Supervisor', color: '#d97706', level: 2, canApproveWork: true },
    { name: 'Team Member', color: '#3b82f6', level: 1, canApproveWork: false },
  ]);

  // Step 4: Payment (mock)
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [billingName, setBillingName] = useState('');

  const handleAddTeamMember = () => {
    if (teamMembers.length >= selectedPlan.maxUsers && selectedPlan.maxUsers !== -1) {
      toast.error(`Maximum ${selectedPlan.maxUsers} users allowed for ${selectedPlan.name} plan`);
      return;
    }
    setTeamMembers([...teamMembers, { name: '', email: '', role: 'Team Member' }]);
  };

  const handleRemoveTeamMember = (index: number) => {
    if (index === 0) {
      toast.error('Cannot remove primary account owner');
      return;
    }
    setTeamMembers(teamMembers.filter((_, i) => i !== index));
  };

  const handleAddRole = () => {
    setRoles([...roles, { name: '', color: '#3b82f6', level: 1, canApproveWork: false }]);
  };

  const handleRemoveRole = (index: number) => {
    const role = roles[index];
    const usedByTeam = teamMembers.some(tm => tm.role === role.name);
    
    if (usedByTeam) {
      toast.error('Cannot delete role that is assigned to team members');
      return;
    }
    
    setRoles(roles.filter((_, i) => i !== index));
  };

  const validateStep = () => {
    switch (currentStep) {
      case 1:
        if (!logo || !industry) {
          toast.error('Please fill in all company details');
          return false;
        }
        break;
      case 2:
        if (teamMembers.some(tm => !tm.name.trim() || !tm.email.trim())) {
          toast.error('Please complete all team member details');
          return false;
        }
        break;
      case 3:
        if (roles.some(r => !r.name.trim())) {
          toast.error('Please name all roles');
          return false;
        }
        break;
      case 4:
        if (!cardNumber || !expiryDate || !cvv || !billingName) {
          toast.error('Please complete payment details');
          return false;
        }
        break;
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    // Create customer object
    const customer: Customer = {
      id: `cust-${Date.now()}`,
      name: companyName,
      logo: logo,
      primaryColor: primaryColor,
      settings: {
        workflowEnabled: true,
        customFields: [],
      },
      createdAt: new Date().toISOString(),
    };

    // Create team members
    const team: Person[] = teamMembers.map((tm, index) => ({
      id: `person-${Date.now()}-${index}`,
      name: tm.name,
      email: tm.email,
      role: tm.role,
      customerId: customer.id,
    }));

    // Create roles
    const customerRoles: Role[] = roles.map((r, index) => ({
      id: `role-${Date.now()}-${index}`,
      name: r.name,
      color: r.color,
      customerId: customer.id,
      level: r.level,
      canApproveWork: r.canApproveWork,
    }));

    toast.success('Account setup completed!');
    onComplete(customer, team, customerRoles);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Building2 className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Company Information</h2>
              <p className="text-gray-600">Tell us about your business</p>
            </div>

            <div>
              <Label htmlFor="companyLogo">Company Logo (Emoji or Symbol)</Label>
              <Input
                id="companyLogo"
                value={logo}
                onChange={(e) => setLogo(e.target.value)}
                placeholder="🏢"
                className="mt-1 text-4xl text-center h-20"
                maxLength={2}
              />
            </div>

            <div>
              <Label htmlFor="industry">Industry</Label>
              <select
                id="industry"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Select your industry</option>
                <option value="landscaping">Landscaping</option>
                <option value="construction">Construction</option>
                <option value="maintenance">Facility Maintenance</option>
                <option value="cleaning">Cleaning Services</option>
                <option value="hvac">HVAC</option>
                <option value="plumbing">Plumbing</option>
                <option value="electrical">Electrical</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <Label htmlFor="primaryColor">Brand Color</Label>
              <div className="flex items-center gap-3 mt-1">
                <Input
                  id="primaryColor"
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-20 h-12"
                />
                <div
                  className="flex-1 h-12 rounded-md border-2 flex items-center justify-center text-white font-medium"
                  style={{ backgroundColor: primaryColor }}
                >
                  {primaryColor}
                </div>
              </div>
            </div>

            <Card className="p-4 bg-blue-50 border-blue-200">
              <div className="flex items-start gap-2">
                <Palette className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-gray-700">
                  Your brand color will be used throughout the platform to personalize your experience
                </div>
              </div>
            </Card>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Users className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Add Your Team</h2>
              <p className="text-gray-600">Invite team members to collaborate</p>
            </div>

            <div className="space-y-4">
              {teamMembers.map((member, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor={`name-${index}`}>Full Name *</Label>
                          <Input
                            id={`name-${index}`}
                            value={member.name}
                            onChange={(e) => {
                              const updated = [...teamMembers];
                              updated[index].name = e.target.value;
                              setTeamMembers(updated);
                            }}
                            placeholder="John Doe"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`email-${index}`}>Email *</Label>
                          <Input
                            id={`email-${index}`}
                            type="email"
                            value={member.email}
                            onChange={(e) => {
                              const updated = [...teamMembers];
                              updated[index].email = e.target.value;
                              setTeamMembers(updated);
                            }}
                            placeholder="john@company.com"
                            className="mt-1"
                            disabled={index === 0}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor={`role-${index}`}>Role</Label>
                        <select
                          id={`role-${index}`}
                          value={member.role}
                          onChange={(e) => {
                            const updated = [...teamMembers];
                            updated[index].role = e.target.value;
                            setTeamMembers(updated);
                          }}
                          className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                        >
                          {roles.map(role => (
                            <option key={role.name} value={role.name}>{role.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    {index > 0 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveTeamMember(index)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  {index === 0 && (
                    <Badge className="mt-2" variant="secondary">Account Owner</Badge>
                  )}
                </Card>
              ))}
            </div>

            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={handleAddTeamMember}
              disabled={selectedPlan.maxUsers !== -1 && teamMembers.length >= selectedPlan.maxUsers}
            >
              <Plus className="w-4 h-4" />
              Add Team Member
              {selectedPlan.maxUsers !== -1 && (
                <span className="text-xs text-gray-500">
                  ({teamMembers.length}/{selectedPlan.maxUsers})
                </span>
              )}
            </Button>

            <p className="text-sm text-gray-600 text-center">
              You can always add more team members later
            </p>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Briefcase className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Configure Roles</h2>
              <p className="text-gray-600">Set up role hierarchy and permissions</p>
            </div>

            <div className="space-y-3">
              {roles.map((role, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor={`roleName-${index}`}>Role Name *</Label>
                          <Input
                            id={`roleName-${index}`}
                            value={role.name}
                            onChange={(e) => {
                              const updated = [...roles];
                              updated[index].name = e.target.value;
                              setRoles(updated);
                            }}
                            placeholder="e.g., Field Supervisor"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`roleColor-${index}`}>Color</Label>
                          <Input
                            id={`roleColor-${index}`}
                            type="color"
                            value={role.color}
                            onChange={(e) => {
                              const updated = [...roles];
                              updated[index].color = e.target.value;
                              setRoles(updated);
                            }}
                            className="mt-1 h-10"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor={`roleLevel-${index}`}>Hierarchy Level</Label>
                          <select
                            id={`roleLevel-${index}`}
                            value={role.level}
                            onChange={(e) => {
                              const updated = [...roles];
                              updated[index].level = Number(e.target.value);
                              setRoles(updated);
                            }}
                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                          >
                            <option value={1}>Level 1 - Team Member</option>
                            <option value={2}>Level 2 - Supervisor</option>
                            <option value={3}>Level 3 - Manager</option>
                            <option value={4}>Level 4 - Director</option>
                          </select>
                        </div>
                        <div className="flex items-center gap-2 mt-6">
                          <input
                            type="checkbox"
                            id={`canApprove-${index}`}
                            checked={role.canApproveWork}
                            onChange={(e) => {
                              const updated = [...roles];
                              updated[index].canApproveWork = e.target.checked;
                              setRoles(updated);
                            }}
                            className="w-4 h-4"
                          />
                          <Label htmlFor={`canApprove-${index}`} className="text-sm">
                            Can approve work
                          </Label>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveRole(index)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            <Button variant="outline" className="w-full gap-2" onClick={handleAddRole}>
              <Plus className="w-4 h-4" />
              Add Role
            </Button>

            <Card className="p-4 bg-amber-50 border-amber-200">
              <div className="text-sm text-gray-700">
                <strong>Approval Workflow:</strong> Higher level roles can approve work from lower levels. 
                For example, Supervisors (Level 2) can approve Team Member (Level 1) work.
              </div>
            </Card>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <CreditCard className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Payment Information</h2>
              <p className="text-gray-600">Secure payment processing</p>
            </div>

            <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{selectedPlan.name} Plan</h3>
                  <p className="text-sm text-gray-600">Billed {selectedPlan.billingCycle}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-900">${selectedPlan.price}</div>
                  <div className="text-sm text-gray-600">/month</div>
                </div>
              </div>
              <div className="pt-4 border-t border-blue-200">
                <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  14-day free trial included
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Cancel anytime, no questions asked
                </div>
              </div>
            </Card>

            <div className="space-y-4">
              <div>
                <Label htmlFor="billingName">Cardholder Name *</Label>
                <Input
                  id="billingName"
                  value={billingName}
                  onChange={(e) => setBillingName(e.target.value)}
                  placeholder="John Doe"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="cardNumber">Card Number *</Label>
                <Input
                  id="cardNumber"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="1234 5678 9012 3456"
                  className="mt-1"
                  maxLength={19}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiryDate">Expiry Date *</Label>
                  <Input
                    id="expiryDate"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    placeholder="MM/YY"
                    className="mt-1"
                    maxLength={5}
                  />
                </div>
                <div>
                  <Label htmlFor="cvv">CVV *</Label>
                  <Input
                    id="cvv"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    placeholder="123"
                    className="mt-1"
                    maxLength={4}
                    type="password"
                  />
                </div>
              </div>
            </div>

            <Card className="p-4 bg-gray-50 border-gray-200">
              <div className="flex items-start gap-2 text-sm text-gray-700">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Your card will not be charged today.</strong> You'll have 14 days to explore 
                  all features risk-free. We'll send you a reminder before your trial ends.
                </div>
              </div>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Account Setup</h1>
              <p className="text-gray-600">
                Step {currentStep} of {totalSteps}
              </p>
            </div>
            <Badge variant="secondary" className="text-sm">
              {selectedPlan.name} Plan
            </Badge>
          </div>
          <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
        </div>

        {/* Step Content */}
        <Card className="p-8 mb-6">
          {renderStep()}
        </Card>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={currentStep === 1 ? onCancel : handleBack}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {currentStep === 1 ? 'Cancel' : 'Back'}
          </Button>

          <Button onClick={handleNext} className="gap-2">
            {currentStep === totalSteps ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Complete Setup
              </>
            ) : (
              <>
                Next
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>

        {/* Trust Indicators */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>🔒 Your information is secure and encrypted</p>
        </div>
      </div>
    </div>
  );
}
