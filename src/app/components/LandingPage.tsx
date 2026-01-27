import { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/app/components/ui/dialog';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import {
  CheckCircle2,
  Building2,
  Users,
  Calendar,
  BarChart3,
  Clock,
  Shield,
  Zap,
  Target,
  TrendingUp,
  ArrowRight,
  Star,
  Check,
  X,
} from 'lucide-react';
import { SubscriptionPlan } from '@/types';
import { toast } from 'sonner';

interface LandingPageProps {
  onSignup: (email: string, plan: SubscriptionPlan) => void;
  onLogin: () => void;
}

const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for small teams getting started',
    price: 49,
    billingCycle: 'monthly',
    maxUsers: 5,
    maxProjects: 10,
    maxClients: 25,
    features: [
      'Up to 5 team members',
      '10 active projects',
      '25 clients',
      'Work order management',
      'Basic scheduling',
      'Mobile access',
      'Email support',
    ],
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'For growing businesses that need more power',
    price: 99,
    billingCycle: 'monthly',
    maxUsers: 15,
    maxProjects: 50,
    maxClients: 100,
    features: [
      'Up to 15 team members',
      '50 active projects',
      '100 clients',
      'Advanced Gantt charts',
      'Recurring task automation',
      'Role-based approvals',
      'Time tracking & clock in/out',
      'Photo documentation',
      'Custom workflows',
      'Priority support',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large organizations with complex needs',
    price: 249,
    billingCycle: 'monthly',
    maxUsers: -1, // unlimited
    maxProjects: -1,
    maxClients: -1,
    features: [
      'Unlimited team members',
      'Unlimited projects',
      'Unlimited clients',
      'Multi-tenant management',
      'Custom branding',
      'Advanced analytics',
      'Custom integrations',
      'API access',
      'Dedicated account manager',
      '24/7 phone support',
      'SLA guarantee',
    ],
  },
];

export function LandingPage({ onSignup, onLogin }: LandingPageProps) {
  const [showSignupDialog, setShowSignupDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');

  const handleGetStarted = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setShowSignupDialog(true);
  };

  const handleSignup = () => {
    if (!email.trim() || !companyName.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!selectedPlan) return;

    onSignup(email, selectedPlan);
    setShowSignupDialog(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-background/80 backdrop-blur-md border-b border-border z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                U
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Uhuru SDPM</h1>
                <p className="text-xs text-muted-foreground">Service Delivery Portfolio Manager</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={onLogin}>
                Sign In
              </Button>
              <Button onClick={() => handleGetStarted(subscriptionPlans[1])}>
                Start Free Trial
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-br from-blue-50 via-background to-purple-50 dark:from-blue-950 dark:via-background dark:to-purple-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-6 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800">
              Trusted by 500+ Service Businesses
            </Badge>
            <h1 className="text-6xl font-bold text-foreground mb-6 leading-tight">
              Manage Projects, Teams & Service Delivery
              <span className="text-blue-600 dark:text-blue-400"> Like a Pro</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              The comprehensive platform designed for small businesses that need enterprise-level
              project management, work order tracking, and team coordination. Built for landscaping,
              construction, maintenance, and service companies.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button size="lg" className="gap-2 text-lg px-8 py-6" onClick={() => handleGetStarted(subscriptionPlans[1])}>
                Start Free 14-Day Trial
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6" onClick={onLogin}>
                Watch Demo
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-4">No credit card required • Setup in 5 minutes</p>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20">
            {[
              { icon: Calendar, label: 'Smart Scheduling', desc: 'Gantt charts & recurring tasks' },
              { icon: Users, label: 'Team Management', desc: 'Roles, approvals & time tracking' },
              { icon: BarChart3, label: 'Live Analytics', desc: 'Real-time metrics & reporting' },
              { icon: Shield, label: 'Multi-Tenant', desc: 'Manage multiple customers' },
            ].map((feature, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow border-2">
                <feature.icon className="w-10 h-10 text-blue-600 dark:text-blue-400 mx-auto mb-3" />
                <h3 className="font-semibold text-foreground mb-1">{feature.label}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-card">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Everything You Need to Run Your Service Business
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              From project planning to team coordination to client management - all in one platform
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Target,
                title: 'Project Portfolio Management',
                description: 'Track multiple projects across different clients with advanced Gantt charts, task dependencies, and progress tracking.',
                features: ['Interactive Gantt charts', 'Task dependencies', 'Progress tracking', 'Client organization'],
              },
              {
                icon: CheckCircle2,
                title: 'Work Order Management',
                description: 'Create, assign, and track work orders with photo documentation, approval workflows, and completion tracking.',
                features: ['Photo capture on completion', 'Approval routing', 'Status tracking', 'Recurring work orders'],
              },
              {
                icon: Clock,
                title: 'Time & Attendance',
                description: 'Let employees clock in/out, view assigned tasks, and submit work for approval - all from their mobile device.',
                features: ['Mobile clock in/out', 'GPS location tracking', 'Work order linking', 'Timesheet reports'],
              },
              {
                icon: Users,
                title: 'Team & Role Management',
                description: 'Define roles with approval hierarchies, assign permissions, and route work approvals automatically based on team structure.',
                features: ['Role hierarchies', 'Approval workflows', 'Permission management', 'Team assignments'],
              },
              {
                icon: TrendingUp,
                title: 'Analytics & Reporting',
                description: 'Get real-time insights into project progress, team productivity, and business performance with custom dashboards.',
                features: ['Custom widgets', 'Real-time metrics', 'Performance tracking', 'Exportable reports'],
              },
              {
                icon: Building2,
                title: 'Multi-Tenant Architecture',
                description: 'Manage multiple customer instances with separate branding, workflows, and team configurations in one account.',
                features: ['Customer isolation', 'Custom branding', 'Workflow customization', 'Centralized billing'],
              },
            ].map((feature, index) => (
              <Card key={index} className="p-8 hover:shadow-xl transition-shadow border-2 hover:border-blue-200 dark:hover:border-blue-800">
                <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
                <p className="text-muted-foreground mb-6">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.features.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-6 bg-muted/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-muted-foreground">Choose the plan that fits your business size and needs</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {subscriptionPlans.map((plan, index) => {
              const isPopular = index === 1;
              
              return (
                <Card
                  key={plan.id}
                  className={`p-8 relative ${
                    isPopular ? 'border-4 border-blue-600 shadow-2xl scale-105' : 'border-2'
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <Badge className="bg-blue-600 text-white px-4 py-1">
                        <Star className="w-3 h-3 mr-1 inline" />
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                    <p className="text-muted-foreground mb-6">{plan.description}</p>
                    <div className="flex items-end justify-center gap-1 mb-2">
                      <span className="text-5xl font-bold text-foreground">${plan.price}</span>
                      <span className="text-muted-foreground mb-2">/month</span>
                    </div>
                    {plan.maxUsers === -1 ? (
                      <p className="text-sm text-muted-foreground">Unlimited everything</p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Up to {plan.maxUsers} users • {plan.maxProjects} projects
                      </p>
                    )}
                  </div>

                  <Button
                    className={`w-full mb-6 ${
                      isPopular ? 'bg-blue-600 hover:bg-blue-700' : ''
                    }`}
                    variant={isPopular ? 'default' : 'outline'}
                    size="lg"
                    onClick={() => handleGetStarted(plan)}
                  >
                    {index === 2 ? 'Contact Sales' : 'Start Free Trial'}
                  </Button>

                  <div className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">All plans include a 14-day free trial. No credit card required.</p>
            <p className="text-sm text-muted-foreground">Need a custom plan? <button className="text-blue-600 dark:text-blue-400 hover:underline">Contact our sales team</button></p>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 px-6 bg-card">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Built for Service Businesses</h2>
            <p className="text-xl text-muted-foreground">Industries that trust Portfolio Manager</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { name: 'Landscaping', emoji: '🌳', desc: 'Mowing schedules & seasonal services' },
              { name: 'Construction', emoji: '🏗️', desc: 'Project timelines & crew coordination' },
              { name: 'Maintenance', emoji: '🔧', desc: 'Facility upkeep & preventive tasks' },
              { name: 'Cleaning', emoji: '🧹', desc: 'Recurring routes & quality checks' },
            ].map((industry, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className="text-5xl mb-4">{industry.emoji}</div>
                <h3 className="font-semibold text-foreground mb-2">{industry.name}</h3>
                <p className="text-sm text-muted-foreground">{industry.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta" className="py-20 px-6 bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Service Business?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join hundreds of businesses that have streamlined their operations with Uhuru SDPM
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button size="lg" variant="secondary" className="gap-2 text-lg px-8 py-6" onClick={() => handleGetStarted(subscriptionPlans[1])}>
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-transparent border-2 border-white text-white hover:bg-white/10" onClick={onLogin}>
              Schedule Demo
            </Button>
          </div>
          <p className="text-sm mt-6 opacity-75">14-day free trial • No credit card required • Cancel anytime</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                  U
                </div>
                <span className="font-semibold text-white">Uhuru SDPM</span>
              </div>
              <p className="text-sm">
                Enterprise-grade project and service delivery management for small businesses.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#testimonials" className="hover:text-white transition-colors">Testimonials</a></li>
                <li><a href="#cta" className="hover:text-white transition-colors">Get Started</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="https://dillonmorgan.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="https://dillonmorgan.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="https://dillonmorgan.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Consulting Services</a></li>
                <li><a href="https://dillonmorgan.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#terms" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#security" className="hover:text-white transition-colors">Security</a></li>
                <li><a href="#gdpr" className="hover:text-white transition-colors">GDPR</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm space-y-2">
            <p>&copy; 2026 Uhuru SDPM. All rights reserved.</p>
            <p className="text-gray-500">
              Powered by{' '}
              <a 
                href="https://dillonmorgan.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                Dillon Morgan Consulting Inc.
              </a>
            </p>
          </div>
        </div>
      </footer>

      {/* Signup Dialog */}
      <Dialog open={showSignupDialog} onOpenChange={setShowSignupDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Start Your Free Trial</DialogTitle>
            <DialogDescription>
              {selectedPlan && `${selectedPlan.name} Plan - $${selectedPlan.price}/month`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="companyName">Company Name *</Label>
              <Input
                id="companyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Acme Landscaping Co."
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="email">Work Email *</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@acmelandscaping.com"
                className="mt-1"
              />
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-foreground mb-2">What happens next?</h4>
              <ol className="text-sm text-foreground space-y-1 list-decimal list-inside">
                <li>Create your account instantly</li>
                <li>Set up your team and projects</li>
                <li>Start managing work orders</li>
                <li>Enjoy 14 days free - no credit card needed!</li>
              </ol>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowSignupDialog(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleSignup}>
                Start Free Trial
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}