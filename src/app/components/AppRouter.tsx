import { useState } from 'react';
import { LandingPage } from '@/app/components/LandingPage';
import { SubscriptionOnboarding } from '@/app/components/SubscriptionOnboarding';
import { SubscriptionPlan, Customer, Person, Role } from '@/types';
import App from '@/app/App';

// Mock subscription plans
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
    maxUsers: -1,
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

export function AppRouter() {
  const [currentView, setCurrentView] = useState<'landing' | 'onboarding' | 'app'>('landing');
  const [onboardingData, setOnboardingData] = useState<{
    email: string;
    companyName: string;
    selectedPlan: SubscriptionPlan | null;
  }>({
    email: '',
    companyName: '',
    selectedPlan: null,
  });

  const handleSignup = (email: string, plan: SubscriptionPlan) => {
    setOnboardingData({
      email,
      companyName: '',
      selectedPlan: plan,
    });
    setCurrentView('onboarding');
  };

  const handleLogin = () => {
    // For demo purposes, go directly to app
    setCurrentView('app');
  };

  const handleOnboardingComplete = (customer: Customer, team: Person[], roles: Role[]) => {
    // In a real app, this would save to backend and create session
    console.log('New customer created:', customer);
    console.log('Team members:', team);
    console.log('Roles:', roles);
    
    setCurrentView('app');
  };

  const handleOnboardingCancel = () => {
    setCurrentView('landing');
  };

  if (currentView === 'landing') {
    return <LandingPage onSignup={handleSignup} onLogin={handleLogin} />;
  }

  if (currentView === 'onboarding' && onboardingData.selectedPlan) {
    return (
      <SubscriptionOnboarding
        selectedPlan={onboardingData.selectedPlan}
        userEmail={onboardingData.email}
        companyName={onboardingData.companyName}
        onComplete={handleOnboardingComplete}
        onCancel={handleOnboardingCancel}
      />
    );
  }

  return <App />;
}
