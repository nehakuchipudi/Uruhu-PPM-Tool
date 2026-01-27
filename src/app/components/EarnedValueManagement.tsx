import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Progress } from '@/app/components/ui/progress';
import { AIInsightCard, AIInsight } from '@/app/components/AIInsightCard';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  Target,
  Activity,
  Minus,
} from 'lucide-react';
import { Project, Task } from '@/types';
import { toast } from 'sonner';

interface EVMMetrics {
  plannedValue: number;
  earnedValue: number;
  actualCost: number;
  scheduleVariance: number;
  costVariance: number;
  schedulePerformanceIndex: number;
  costPerformanceIndex: number;
  estimateAtCompletion: number;
  estimateToComplete: number;
  varianceAtCompletion: number;
  toCompletePerformanceIndex: number;
}

interface EarnedValueManagementProps {
  project: Project;
  tasks: Task[];
}

export function EarnedValueManagement({ project, tasks }: EarnedValueManagementProps) {
  // Don't render if project doesn't have a budget
  if (!project.budget || project.budget === 0) {
    return (
      <Card className="p-6 bg-amber-50 border-amber-200">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-amber-900 mb-1">Earned Value Management Unavailable</h3>
            <p className="text-sm text-amber-700">
              Please set a budget for this project to enable Earned Value Management tracking and forecasting.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  // Calculate EVM metrics
  const calculateEVM = (): EVMMetrics => {
    const today = new Date();
    const projectStart = new Date(project.startDate);
    const projectEnd = new Date(project.endDate);
    const totalDuration = projectEnd.getTime() - projectStart.getTime();
    const elapsedTime = today.getTime() - projectStart.getTime();
    const plannedProgress = Math.min(100, Math.max(0, (elapsedTime / totalDuration) * 100));

    // Planned Value (PV) - How much work should have been completed by now
    const plannedValue = (project.budget * plannedProgress) / 100;

    // Earned Value (EV) - How much work has actually been completed
    const earnedValue = (project.budget * project.progress) / 100;

    // Actual Cost (AC) - Estimate based on actual hours vs estimated hours
    const totalEstimatedHours = tasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0);
    const totalActualHours = tasks.reduce((sum, task) => sum + (task.actualHours || 0), 0);
    const costPerHour = totalEstimatedHours > 0 ? project.budget / totalEstimatedHours : 100;
    const actualCost = totalActualHours * costPerHour;

    // Variances
    const scheduleVariance = earnedValue - plannedValue; // SV = EV - PV
    const costVariance = earnedValue - actualCost; // CV = EV - AC

    // Performance Indices
    const schedulePerformanceIndex = plannedValue > 0 ? earnedValue / plannedValue : 1; // SPI = EV / PV
    const costPerformanceIndex = actualCost > 0 ? earnedValue / actualCost : 1; // CPI = EV / AC

    // Forecasting
    const estimateAtCompletion = costPerformanceIndex > 0 ? project.budget / costPerformanceIndex : project.budget; // EAC = BAC / CPI
    const estimateToComplete = Math.max(0, estimateAtCompletion - actualCost); // ETC = EAC - AC
    const varianceAtCompletion = project.budget - estimateAtCompletion; // VAC = BAC - EAC
    const remainingWork = estimateAtCompletion - actualCost;
    const toCompletePerformanceIndex =
      remainingWork > 0
        ? (project.budget - earnedValue) / remainingWork
        : 1; // TCPI = (BAC - EV) / (EAC - AC)

    return {
      plannedValue,
      earnedValue,
      actualCost,
      scheduleVariance,
      costVariance,
      schedulePerformanceIndex,
      costPerformanceIndex,
      estimateAtCompletion,
      estimateToComplete,
      varianceAtCompletion,
      toCompletePerformanceIndex,
    };
  };

  const metrics = calculateEVM();

  const formatCurrency = (value: number) => {
    // Handle NaN and Infinity
    if (!isFinite(value)) {
      value = 0;
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Generate AI insights based on EVM metrics
  const generateEVMInsights = (): AIInsight[] => {
    const insights: AIInsight[] = [];

    // Critical schedule variance
    if (metrics.scheduleVariance < -project.budget * 0.1) {
      insights.push({
        id: 'evm-schedule-critical-' + project.id,
        type: 'warning',
        priority: 'critical',
        title: 'Critical Schedule Delay Detected',
        description: `Project is ${formatCurrency(Math.abs(metrics.scheduleVariance))} behind schedule. AI forecasts significant deadline risk.`,
        details: `With an SPI of ${metrics.schedulePerformanceIndex.toFixed(2)}, the project is earning value at ${Math.round(metrics.schedulePerformanceIndex * 100)}% of the planned rate. To recover, consider adding resources, reducing scope, or negotiating timeline extensions.`,
        metrics: [
          { label: 'Schedule Variance', value: formatCurrency(metrics.scheduleVariance), change: `${Math.round((metrics.scheduleVariance / project.budget) * 100)}%` },
          { label: 'SPI', value: metrics.schedulePerformanceIndex.toFixed(2) },
        ],
        actions: [
          {
            label: 'Recovery Plan',
            onClick: () => toast.info('AI is generating schedule recovery options...'),
          },
        ],
        dismissible: true,
      });
    }

    // Cost overrun warning
    if (metrics.costVariance < -project.budget * 0.05) {
      insights.push({
        id: 'evm-cost-warning-' + project.id,
        type: 'warning',
        priority: 'high',
        title: 'Cost Overrun in Progress',
        description: `Project is ${formatCurrency(Math.abs(metrics.costVariance))} over budget. EAC predicts ${formatCurrency(metrics.estimateAtCompletion)} total cost.`,
        details: `Current CPI of ${metrics.costPerformanceIndex.toFixed(2)} indicates you're getting ${Math.round(metrics.costPerformanceIndex * 100)}¢ of value for every dollar spent. Consider cost reduction measures or budget revision.`,
        metrics: [
          { label: 'Cost Variance', value: formatCurrency(metrics.costVariance), change: `${Math.round((metrics.costVariance / project.budget) * 100)}%` },
          { label: 'VAC', value: formatCurrency(metrics.varianceAtCompletion), change: metrics.varianceAtCompletion < 0 ? 'Over' : 'Under' },
        ],
        actions: [
          {
            label: 'Cost Optimization',
            onClick: () => toast.info('AI is analyzing cost reduction opportunities...'),
          },
        ],
        dismissible: true,
      });
    }

    // TCPI high efficiency required
    if (metrics.toCompletePerformanceIndex > 1.2) {
      insights.push({
        id: 'evm-tcpi-warning-' + project.id,
        type: 'warning',
        priority: 'high',
        title: 'High Efficiency Required to Meet Budget',
        description: `TCPI of ${metrics.toCompletePerformanceIndex.toFixed(2)} means you need ${Math.round(metrics.toCompletePerformanceIndex * 100)}% efficiency to stay on budget.`,
        details: 'This level of efficiency may be difficult to achieve. AI recommends revising the budget baseline or identifying significant cost reduction opportunities immediately.',
        actions: [
          {
            label: 'Budget Revision',
            onClick: () => toast.info('Opening budget revision wizard...'),
          },
        ],
        dismissible: true,
      });
    }

    // Positive performance
    if (metrics.scheduleVariance > 0 && metrics.costVariance > 0) {
      insights.push({
        id: 'evm-excellent-' + project.id,
        type: 'success',
        priority: 'low',
        title: 'Excellent Project Performance',
        description: `Project is both ahead of schedule (SPI: ${metrics.schedulePerformanceIndex.toFixed(2)}) and under budget (CPI: ${metrics.costPerformanceIndex.toFixed(2)})!`,
        details: 'AI analysis shows this project is a model for success. Consider documenting best practices to apply to other projects.',
        actions: [
          {
            label: 'Document Best Practices',
            onClick: () => toast.success('Creating performance report...'),
          },
        ],
        dismissible: true,
      });
    }

    // Predictive insight based on trends
    if (metrics.schedulePerformanceIndex < 1.0 && metrics.schedulePerformanceIndex > 0.8) {
      insights.push({
        id: 'evm-prediction-' + project.id,
        type: 'prediction',
        priority: 'medium',
        title: 'Schedule Risk Emerging',
        description: 'AI detects declining schedule performance. Early intervention can prevent critical delays.',
        details: `While not critical yet, the current SPI of ${metrics.schedulePerformanceIndex.toFixed(2)} suggests the project is slowing down. AI recommends investigating task blockers and resource availability now before it becomes critical.`,
        actions: [
          {
            label: 'Analyze Blockers',
            onClick: () => toast.info('AI is identifying schedule blockers...'),
          },
        ],
        dismissible: true,
      });
    }

    // Budget forecast recommendation
    if (metrics.varianceAtCompletion < 0) {
      const overrunPercent = Math.abs(metrics.varianceAtCompletion / project.budget) * 100;
      insights.push({
        id: 'evm-budget-forecast-' + project.id,
        type: 'recommendation',
        priority: overrunPercent > 15 ? 'high' : 'medium',
        title: 'Budget Forecast Adjustment Needed',
        description: `AI forecasts ${Math.round(overrunPercent)}% budget overrun (${formatCurrency(Math.abs(metrics.varianceAtCompletion))}).`,
        details: 'Based on current performance trends, the project will exceed its budget. Stakeholders should be notified, and corrective actions should be implemented immediately.',
        actions: [
          {
            label: 'Stakeholder Report',
            onClick: () => toast.info('Generating stakeholder forecast report...'),
          },
          {
            label: 'Corrective Actions',
            onClick: () => toast.info('AI is suggesting corrective measures...'),
          },
        ],
        dismissible: true,
      });
    }

    return insights;
  };

  const evmInsights = generateEVMInsights();

  const getStatusColor = (value: number, type: 'variance' | 'index') => {
    if (!isFinite(value)) {
      return 'text-gray-600';
    }
    if (type === 'variance') {
      return value >= 0 ? 'text-emerald-600' : 'text-red-600';
    } else {
      // For indices (SPI, CPI), >= 1.0 is good
      return value >= 1.0 ? 'text-emerald-600' : 'text-red-600';
    }
  };

  const getStatusBadge = (value: number, type: 'variance' | 'index') => {
    if (!isFinite(value)) {
      return <Badge className="bg-gray-500">N/A</Badge>;
    }
    if (type === 'variance') {
      if (value > 0) return <Badge className="bg-emerald-500">Ahead</Badge>;
      if (value < 0) return <Badge className="bg-red-500">Behind</Badge>;
      return <Badge className="bg-gray-500">On Track</Badge>;
    } else {
      if (value >= 1.1) return <Badge className="bg-emerald-500">Excellent</Badge>;
      if (value >= 1.0) return <Badge className="bg-blue-500">Good</Badge>;
      if (value >= 0.9) return <Badge className="bg-amber-500">Caution</Badge>;
      return <Badge className="bg-red-500">At Risk</Badge>;
    }
  };

  const safeProgressValue = (value: number) => {
    if (!isFinite(value) || value < 0) return 0;
    if (value > 100) return 100;
    return value;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white">
            <Activity className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Earned Value Management (EVM)</h3>
            <p className="text-sm text-gray-700 mb-3">
              Integrated project performance measurement combining scope, schedule, and cost data to provide
              accurate forecasting and performance insights.
            </p>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-700">
                <strong>Budget:</strong> {formatCurrency(project.budget || 0)}
              </span>
              <span className="text-gray-700">
                <strong>Schedule:</strong> {new Date(project.startDate).toLocaleDateString()} -{' '}
                {new Date(project.endDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Key Performance Metrics */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600">Planned Value (PV)</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(metrics.plannedValue)}</p>
            </div>
          </div>
          <p className="text-xs text-gray-500">Budgeted cost of work scheduled</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600">Earned Value (EV)</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(metrics.earnedValue)}</p>
            </div>
          </div>
          <p className="text-xs text-gray-500">Budgeted cost of work performed</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600">Actual Cost (AC)</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(metrics.actualCost)}</p>
            </div>
          </div>
          <p className="text-xs text-gray-500">Actual cost of work performed</p>
        </Card>
      </div>

      {/* Variance Analysis */}
      <Card className="p-6">
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Target className="w-5 h-5" />
          Variance Analysis
        </h4>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Schedule Variance (SV)</p>
                <p className="text-xs text-gray-500">EV - PV</p>
              </div>
              <div className="text-right">
                <p className={`text-2xl font-bold ${getStatusColor(metrics.scheduleVariance, 'variance')}`}>
                  {formatCurrency(metrics.scheduleVariance)}
                </p>
                {getStatusBadge(metrics.scheduleVariance, 'variance')}
              </div>
            </div>
            <div className="pl-4 border-l-2 border-gray-200">
              <p className="text-xs text-gray-600">
                {metrics.scheduleVariance >= 0
                  ? '✓ Project is ahead of schedule'
                  : '⚠ Project is behind schedule'}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Cost Variance (CV)</p>
                <p className="text-xs text-gray-500">EV - AC</p>
              </div>
              <div className="text-right">
                <p className={`text-2xl font-bold ${getStatusColor(metrics.costVariance, 'variance')}`}>
                  {formatCurrency(metrics.costVariance)}
                </p>
                {getStatusBadge(metrics.costVariance, 'variance')}
              </div>
            </div>
            <div className="pl-4 border-l-2 border-gray-200">
              <p className="text-xs text-gray-600">
                {metrics.costVariance >= 0 ? '✓ Project is under budget' : '⚠ Project is over budget'}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Performance Indices */}
      <Card className="p-6">
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Performance Indices
        </h4>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Schedule Performance Index (SPI)</p>
                <p className="text-xs text-gray-500">EV / PV</p>
              </div>
              <div className="text-right">
                <p className={`text-2xl font-bold ${getStatusColor(metrics.schedulePerformanceIndex, 'index')}`}>
                  {metrics.schedulePerformanceIndex.toFixed(2)}
                </p>
                {getStatusBadge(metrics.schedulePerformanceIndex, 'index')}
              </div>
            </div>
            <div className="pl-4 border-l-2 border-gray-200 space-y-1">
              <p className="text-xs text-gray-600">
                {metrics.schedulePerformanceIndex >= 1.0
                  ? `✓ Delivering ${((metrics.schedulePerformanceIndex - 1) * 100).toFixed(0)}% more work than planned`
                  : `⚠ Delivering ${((1 - metrics.schedulePerformanceIndex) * 100).toFixed(0)}% less work than planned`}
              </p>
              <div className="mt-2">
                <Progress value={safeProgressValue(metrics.schedulePerformanceIndex * 100)} className="h-2" />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Cost Performance Index (CPI)</p>
                <p className="text-xs text-gray-500">EV / AC</p>
              </div>
              <div className="text-right">
                <p className={`text-2xl font-bold ${getStatusColor(metrics.costPerformanceIndex, 'index')}`}>
                  {metrics.costPerformanceIndex.toFixed(2)}
                </p>
                {getStatusBadge(metrics.costPerformanceIndex, 'index')}
              </div>
            </div>
            <div className="pl-4 border-l-2 border-gray-200 space-y-1">
              <p className="text-xs text-gray-600">
                {metrics.costPerformanceIndex >= 1.0
                  ? `✓ Getting ${formatCurrency(metrics.costPerformanceIndex)} value for every $1 spent`
                  : `⚠ Getting ${formatCurrency(metrics.costPerformanceIndex)} value for every $1 spent`}
              </p>
              <div className="mt-2">
                <Progress value={safeProgressValue(metrics.costPerformanceIndex * 100)} className="h-2" />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Forecasting */}
      <Card className="p-6">
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Project Forecasting
        </h4>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-900">Estimate at Completion (EAC)</p>
                {metrics.varianceAtCompletion >= 0 ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                )}
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">{formatCurrency(metrics.estimateAtCompletion)}</p>
              <p className="text-xs text-gray-500 mb-2">Projected total cost at completion</p>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-600">Budget:</span>
                <span className="font-medium">{formatCurrency(project.budget || 0)}</span>
                <span
                  className={`font-semibold ${
                    metrics.varianceAtCompletion >= 0 ? 'text-emerald-600' : 'text-red-600'
                  }`}
                >
                  {metrics.varianceAtCompletion >= 0 ? '↓' : '↑'}{' '}
                  {formatCurrency(Math.abs(metrics.varianceAtCompletion))}
                </span>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-900 mb-2">Estimate to Complete (ETC)</p>
              <p className="text-2xl font-bold text-gray-900 mb-1">{formatCurrency(metrics.estimateToComplete)}</p>
              <p className="text-xs text-gray-500">Expected cost to finish remaining work</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-900 mb-2">Variance at Completion (VAC)</p>
              <p className={`text-2xl font-bold mb-1 ${getStatusColor(metrics.varianceAtCompletion, 'variance')}`}>
                {formatCurrency(metrics.varianceAtCompletion)}
              </p>
              <p className="text-xs text-gray-500 mb-2">Expected budget surplus/deficit at completion</p>
              <Progress
                value={Math.min(100, Math.max(0, ((project.budget || 0) - Math.abs(metrics.varianceAtCompletion)) / (project.budget || 1) * 100))}
                className="h-2"
              />
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-900 mb-2">To-Complete Performance Index (TCPI)</p>
              <p className={`text-2xl font-bold mb-1 ${getStatusColor(metrics.toCompletePerformanceIndex, 'index')}`}>
                {metrics.toCompletePerformanceIndex.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500">Required efficiency to meet budget target</p>
              <p className="text-xs text-gray-600 mt-2">
                {metrics.toCompletePerformanceIndex <= 1.0
                  ? '✓ Budget target is achievable'
                  : '⚠ Higher efficiency required to meet budget'}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* AI-Powered EVM Insights */}
      {evmInsights.length > 0 && (
        <div className="space-y-3">
          {evmInsights.map(insight => (
            <AIInsightCard key={insight.id} insight={insight} />
          ))}
        </div>
      )}

      {/* Overall Health Score */}
      <Card className="p-6 bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-4">Project Health Summary</h4>
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className={`text-3xl font-bold ${getStatusColor(metrics.scheduleVariance, 'variance')}`}>
              {metrics.scheduleVariance >= 0 ? '✓' : '⚠'}
            </div>
            <p className="text-sm text-gray-600 mt-2">Schedule</p>
          </div>
          <div className="text-center">
            <div className={`text-3xl font-bold ${getStatusColor(metrics.costVariance, 'variance')}`}>
              {metrics.costVariance >= 0 ? '✓' : '⚠'}
            </div>
            <p className="text-sm text-gray-600 mt-2">Cost</p>
          </div>
          <div className="text-center">
            <div className={`text-3xl font-bold ${getStatusColor(metrics.schedulePerformanceIndex, 'index')}`}>
              {metrics.schedulePerformanceIndex >= 1.0 ? '✓' : '⚠'}
            </div>
            <p className="text-sm text-gray-600 mt-2">Performance</p>
          </div>
          <div className="text-center">
            <div className={`text-3xl font-bold ${getStatusColor(metrics.varianceAtCompletion, 'variance')}`}>
              {metrics.varianceAtCompletion >= 0 ? '✓' : '⚠'}
            </div>
            <p className="text-sm text-gray-600 mt-2">Forecast</p>
          </div>
        </div>
      </Card>
    </div>
  );
}