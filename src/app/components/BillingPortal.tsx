import { useState } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Badge } from '@/app/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/app/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import {
  CreditCard,
  Calendar,
  DollarSign,
  FileText,
  Settings,
  AlertCircle,
  CheckCircle2,
  Download,
  Edit,
  TrendingUp,
  Package,
  ArrowUpCircle,
} from 'lucide-react';
import { CustomerSubscription, SubscriptionPlan } from '@/types';
import { toast } from 'sonner';

interface BillingPortalProps {
  subscription?: CustomerSubscription;
  currentPlan?: SubscriptionPlan;
  availablePlans?: SubscriptionPlan[];
  onUpdatePayment?: (paymentMethod: any) => void;
  onChangePlan?: (planId: string) => void;
  onCancelSubscription?: () => void;
}

// Default mock data
const defaultPlans: SubscriptionPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for small teams getting started',
    price: 49,
    billingCycle: 'monthly',
    features: [
      'Up to 5 active projects',
      'Basic reporting',
      'Email support',
      '1 user',
    ],
    maxUsers: 1,
    maxProjects: 5,
    maxClients: 10,
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'For growing teams with advanced needs',
    price: 149,
    billingCycle: 'monthly',
    features: [
      'Up to 25 active projects',
      'Advanced reporting & analytics',
      'Priority email & phone support',
      'Up to 5 users',
      'Custom branding',
      'API access',
    ],
    maxUsers: 5,
    maxProjects: 25,
    maxClients: 50,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large organizations with unlimited needs',
    price: 499,
    billingCycle: 'monthly',
    features: [
      'Unlimited active projects',
      'Advanced reporting & custom dashboards',
      '24/7 premium support',
      'Unlimited users',
      'White-label options',
      'Dedicated account manager',
      'Custom integrations',
      'SLA guarantee',
    ],
    maxUsers: -1,
    maxProjects: -1,
    maxClients: -1,
  },
];

const defaultSubscription: CustomerSubscription = {
  id: 'sub-demo',
  customerId: 'cust-demo',
  planId: 'professional',
  status: 'active',
  startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
  billingEmail: 'billing@example.com',
  nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  amount: 149,
  paymentMethod: {
    type: 'card',
    last4: '4242',
    expiryMonth: 12,
    expiryYear: 2026,
  },
};

export function BillingPortal({
  subscription = defaultSubscription,
  currentPlan,
  availablePlans = defaultPlans,
  onUpdatePayment = () => {},
  onChangePlan = () => {},
  onCancelSubscription = () => {},
}: BillingPortalProps = {}) {
  // Use default plan if not provided
  const activePlan = currentPlan || availablePlans.find(p => p.id === subscription.planId) || defaultPlans[1];

  const [showUpdatePayment, setShowUpdatePayment] = useState(false);
  const [showChangePlan, setShowChangePlan] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [billingName, setBillingName] = useState('');

  const handleUpdatePayment = () => {
    if (!cardNumber || !expiryDate || !cvv || !billingName) {
      toast.error('Please fill in all payment details');
      return;
    }

    onUpdatePayment({
      type: 'card',
      last4: cardNumber.slice(-4),
      expiryMonth: parseInt(expiryDate.split('/')[0]),
      expiryYear: parseInt('20' + expiryDate.split('/')[1]),
    });

    setShowUpdatePayment(false);
    setCardNumber('');
    setExpiryDate('');
    setCvv('');
    setBillingName('');
    toast.success('Payment method updated successfully');
  };

  const handleChangePlan = (planId: string) => {
    onChangePlan(planId);
    setShowChangePlan(false);
    toast.success('Plan changed successfully');
  };

  const handleCancelSubscription = () => {
    onCancelSubscription();
    setShowCancelDialog(false);
    toast.success('Subscription cancelled');
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-emerald-500',
      trialing: 'bg-blue-500',
      past_due: 'bg-red-500',
      cancelled: 'bg-gray-500',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-500';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Mock invoice data
  const invoices = [
    {
      id: 'inv-001',
      date: '2026-01-01',
      amount: activePlan.price,
      status: 'paid',
      description: `${activePlan.name} Plan - January 2026`,
    },
    {
      id: 'inv-002',
      date: '2025-12-01',
      amount: activePlan.price,
      status: 'paid',
      description: `${activePlan.name} Plan - December 2025`,
    },
    {
      id: 'inv-003',
      date: '2025-11-01',
      amount: activePlan.price,
      status: 'paid',
      description: `${activePlan.name} Plan - November 2025`,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Billing & Subscription</h2>
        <p className="text-gray-600">Manage your subscription and payment methods</p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview" className="gap-2">
            <Package className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="payment" className="gap-2">
            <CreditCard className="w-4 h-4" />
            Payment Methods
          </TabsTrigger>
          <TabsTrigger value="invoices" className="gap-2">
            <FileText className="w-4 h-4" />
            Invoices
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Current Plan */}
          <Card className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Current Plan</h3>
                <p className="text-gray-600">Your subscription details and usage</p>
              </div>
              <Badge className={getStatusBadge(subscription.status)}>
                {subscription.status === 'trialing' ? 'Free Trial' : subscription.status}
              </Badge>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">{activePlan.name}</h4>
                  <Button size="sm" variant="outline" onClick={() => setShowChangePlan(true)}>
                    <ArrowUpCircle className="w-4 h-4 mr-2" />
                    Change Plan
                  </Button>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-gray-900">${activePlan.price}</span>
                    <span className="text-gray-600">/{activePlan.billingCycle}</span>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-gray-700">
                  {activePlan.maxUsers === -1 ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Unlimited users
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Up to {activePlan.maxUsers} users
                    </div>
                  )}
                  {activePlan.maxProjects === -1 ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Unlimited projects
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Up to {activePlan.maxProjects} projects
                    </div>
                  )}
                  {activePlan.maxClients === -1 ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Unlimited clients
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Up to {activePlan.maxClients} clients
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="w-5 h-5 text-gray-600" />
                    <span className="text-sm text-gray-600">Next Billing Date</span>
                  </div>
                  <div className="text-lg font-semibold text-gray-900">
                    {formatDate(subscription.nextBillingDate)}
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <DollarSign className="w-5 h-5 text-gray-600" />
                    <span className="text-sm text-gray-600">Next Charge</span>
                  </div>
                  <div className="text-lg font-semibold text-gray-900">
                    ${subscription.amount.toFixed(2)}
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="w-5 h-5 text-gray-600" />
                    <span className="text-sm text-gray-600">Member Since</span>
                  </div>
                  <div className="text-lg font-semibold text-gray-900">
                    {formatDate(subscription.startDate)}
                  </div>
                </div>
              </div>
            </div>

            {subscription.status === 'trialing' && (
              <Card className="mt-6 p-4 bg-blue-50 border-blue-200">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-gray-700">
                    <strong>Free trial active!</strong> Your trial ends on{' '}
                    {formatDate(subscription.nextBillingDate)}. You can cancel anytime before then.
                  </div>
                </div>
              </Card>
            )}
          </Card>

          {/* Usage Stats */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Plan Usage</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600 mb-2">5</div>
                <div className="text-sm text-gray-600">Active Users</div>
                {activePlan.maxUsers !== -1 && (
                  <div className="text-xs text-gray-500 mt-1">of {activePlan.maxUsers} limit</div>
                )}
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-3xl font-bold text-emerald-600 mb-2">12</div>
                <div className="text-sm text-gray-600">Active Projects</div>
                {activePlan.maxProjects !== -1 && (
                  <div className="text-xs text-gray-500 mt-1">of {activePlan.maxProjects} limit</div>
                )}
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-3xl font-bold text-purple-600 mb-2">48</div>
                <div className="text-sm text-gray-600">Clients</div>
                {activePlan.maxClients !== -1 && (
                  <div className="text-xs text-gray-500 mt-1">of {activePlan.maxClients} limit</div>
                )}
              </div>
            </div>
          </Card>

          {/* Danger Zone */}
          <Card className="p-6 border-red-200 bg-red-50">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              Danger Zone
            </h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Cancel Subscription</p>
                <p className="text-sm text-gray-600">
                  You'll lose access to all features at the end of your billing period
                </p>
              </div>
              <Button variant="destructive" onClick={() => setShowCancelDialog(true)}>
                Cancel Subscription
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Payment Methods Tab */}
        <TabsContent value="payment" className="space-y-6 mt-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Payment Methods</h3>
                <p className="text-gray-600">Manage your payment information</p>
              </div>
              <Button onClick={() => setShowUpdatePayment(true)} className="gap-2">
                <Edit className="w-4 h-4" />
                Update Payment
              </Button>
            </div>

            {subscription.paymentMethod ? (
              <div className="p-6 bg-gray-50 rounded-lg border-2 border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {subscription.paymentMethod.type === 'card' ? 'Credit Card' : 'Bank Account'}
                      </div>
                      <div className="text-sm text-gray-600">
                        •••• •••• •••• {subscription.paymentMethod.last4}
                      </div>
                      {subscription.paymentMethod.expiryMonth && subscription.paymentMethod.expiryYear && (
                        <div className="text-xs text-gray-500">
                          Expires {subscription.paymentMethod.expiryMonth}/{subscription.paymentMethod.expiryYear}
                        </div>
                      )}
                    </div>
                  </div>
                  <Badge variant="secondary">Default</Badge>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-gray-500">
                <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No payment method on file</p>
                <Button onClick={() => setShowUpdatePayment(true)} className="mt-4">
                  Add Payment Method
                </Button>
              </div>
            )}

            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-2 text-sm text-gray-700">
                <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  Your payment information is securely stored and encrypted. We never store your full card number.
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value="invoices" className="space-y-6 mt-6">
          <Card className="p-6">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Billing History</h3>
              <p className="text-gray-600">Download invoices and view payment history</p>
            </div>

            <div className="space-y-3">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border-2 border-gray-200">
                      <FileText className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{invoice.description}</div>
                      <div className="text-sm text-gray-600">{formatDate(invoice.date)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">${invoice.amount.toFixed(2)}</div>
                      <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                        {invoice.status}
                      </Badge>
                    </div>
                    <Button size="sm" variant="outline" className="gap-2">
                      <Download className="w-4 h-4" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Update Payment Dialog */}
      <Dialog open={showUpdatePayment} onOpenChange={setShowUpdatePayment}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Payment Method</DialogTitle>
            <DialogDescription>Enter your new payment details</DialogDescription>
          </DialogHeader>

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

            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setShowUpdatePayment(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleUpdatePayment}>
                Update Payment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Change Plan Dialog */}
      <Dialog open={showChangePlan} onOpenChange={setShowChangePlan}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Change Subscription Plan</DialogTitle>
            <DialogDescription>Choose a new plan for your account</DialogDescription>
          </DialogHeader>

          <div className="grid md:grid-cols-3 gap-4">
            {availablePlans.map((plan) => {
              const isCurrent = plan.id === activePlan.id;

              return (
                <Card
                  key={plan.id}
                  className={`p-6 ${isCurrent ? 'border-2 border-blue-600' : ''}`}
                >
                  {isCurrent && (
                    <Badge className="mb-4 bg-blue-600">Current Plan</Badge>
                  )}
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="text-3xl font-bold text-gray-900 mb-4">
                    ${plan.price}
                    <span className="text-sm font-normal text-gray-600">/month</span>
                  </div>
                  <ul className="space-y-2 mb-6 text-sm">
                    {plan.features.slice(0, 5).map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={isCurrent ? 'outline' : 'default'}
                    disabled={isCurrent}
                    onClick={() => handleChangePlan(plan.id)}
                  >
                    {isCurrent ? 'Current Plan' : 'Switch to ' + plan.name}
                  </Button>
                </Card>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel Subscription Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Subscription?</DialogTitle>
            <DialogDescription>Are you sure you want to cancel your subscription?</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Card className="p-4 bg-amber-50 border-amber-200">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div className="text-sm text-gray-700">
                  <p className="font-semibold mb-1">What happens when you cancel:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>You'll lose access to all features at the end of your billing period</li>
                    <li>Your data will be retained for 30 days</li>
                    <li>You can reactivate anytime before data deletion</li>
                  </ul>
                </div>
              </div>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowCancelDialog(false)}>
                Keep Subscription
              </Button>
              <Button variant="destructive" className="flex-1" onClick={handleCancelSubscription}>
                Cancel Subscription
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}