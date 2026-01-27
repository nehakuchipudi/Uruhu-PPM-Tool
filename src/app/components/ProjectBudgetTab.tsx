import React from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Project, Task } from '@/types';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  Download,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { EarnedValueManagement } from '@/app/components/EarnedValueManagement';

interface ProjectBudgetTabProps {
  project: Project;
  tasks: Task[];
}

export function ProjectBudgetTab({ project, tasks }: ProjectBudgetTabProps) {
  const budget = project.budget || 0;
  
  // Calculate actuals based on labor hours
  const totalEstimatedHours = tasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);
  const totalActualHours = tasks.reduce((sum, t) => sum + (t.actualHours || 0), 0);
  const hourlyRate = 85; // Average hourly rate
  
  const actualCosts = totalActualHours * hourlyRate;
  const estimatedCosts = totalEstimatedHours * hourlyRate;
  const variance = budget - actualCosts;
  const variancePercent = budget > 0 ? ((variance / budget) * 100).toFixed(1) : 0;
  const forecast = budget > 0 ? Math.min(estimatedCosts, budget * 1.1) : estimatedCosts;

  // Budget line items
  const lineItems = [
    {
      category: 'Labor Costs',
      planned: budget * 0.6,
      actual: actualCosts,
      notes: `${totalActualHours}h @ $${hourlyRate}/hr`,
    },
    {
      category: 'Materials & Supplies',
      planned: budget * 0.25,
      actual: budget * 0.22,
      notes: 'Equipment and materials procurement',
    },
    {
      category: 'Equipment Rental',
      planned: budget * 0.1,
      actual: budget * 0.08,
      notes: 'Specialized equipment and tools',
    },
    {
      category: 'Overhead & Admin',
      planned: budget * 0.05,
      actual: budget * 0.05,
      notes: 'Administrative and overhead costs',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Earned Value Management Section */}
      <EarnedValueManagement project={project} tasks={tasks} />

      {/* Budget Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-6 border-blue-200 bg-blue-50">
          <div className="flex items-start justify-between mb-2">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Approved Budget</p>
          <p className="text-3xl font-bold text-gray-900">${budget.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-2">Total allocated budget</p>
        </Card>

        <Card className="p-6 border-purple-200 bg-purple-50">
          <div className="flex items-start justify-between mb-2">
            <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Actual Costs</p>
          <p className="text-3xl font-bold text-gray-900">${actualCosts.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-2">
            {budget > 0 ? `${((actualCosts / budget) * 100).toFixed(1)}% of budget` : 'N/A'}
          </p>
        </Card>

        <Card
          className={`p-6 ${
            variance >= 0
              ? 'border-green-200 bg-green-50'
              : 'border-red-200 bg-red-50'
          }`}
        >
          <div className="flex items-start justify-between mb-2">
            <div
              className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                variance >= 0 ? 'bg-green-100' : 'bg-red-100'
              }`}
            >
              {variance >= 0 ? (
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              ) : (
                <AlertCircle className="w-6 h-6 text-red-600" />
              )}
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Budget Variance</p>
          <p
            className={`text-3xl font-bold ${
              variance >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {variance >= 0 ? '+' : '-'}${Math.abs(variance).toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {variance >= 0 ? 'Under budget' : 'Over budget'} by {Math.abs(Number(variancePercent))}%
          </p>
        </Card>

        <Card className="p-6 border-orange-200 bg-orange-50">
          <div className="flex items-start justify-between mb-2">
            <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Forecast</p>
          <p className="text-3xl font-bold text-gray-900">${forecast.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-2">Projected total cost</p>
        </Card>
      </div>

      {/* Budget Progress */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Budget Utilization</h3>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Budget Used</span>
              <span className="text-sm font-medium text-gray-900">
                ${actualCosts.toLocaleString()} / ${budget.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className={`h-4 rounded-full ${
                  actualCosts / budget > 0.9
                    ? 'bg-red-500'
                    : actualCosts / budget > 0.7
                    ? 'bg-amber-500'
                    : 'bg-blue-500'
                }`}
                style={{
                  width: `${Math.min((actualCosts / budget) * 100, 100)}%`,
                }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {((actualCosts / budget) * 100).toFixed(1)}% utilized
            </p>
          </div>
        </div>
      </Card>

      {/* Line Items Table */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Budget Line Items</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Add Line Item
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="text-left p-4 text-xs font-semibold text-gray-600 uppercase">
                  Category
                </th>
                <th className="text-right p-4 text-xs font-semibold text-gray-600 uppercase">
                  Planned
                </th>
                <th className="text-right p-4 text-xs font-semibold text-gray-600 uppercase">
                  Actual
                </th>
                <th className="text-right p-4 text-xs font-semibold text-gray-600 uppercase">
                  Variance
                </th>
                <th className="text-right p-4 text-xs font-semibold text-gray-600 uppercase">
                  % of Budget
                </th>
                <th className="text-left p-4 text-xs font-semibold text-gray-600 uppercase">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item, index) => {
                const itemVariance = item.planned - item.actual;
                const percentOfBudget = ((item.actual / budget) * 100).toFixed(1);

                return (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-4">
                      <span className="font-medium text-gray-900">{item.category}</span>
                    </td>
                    <td className="p-4 text-right">
                      <span className="text-sm text-gray-900">
                        ${item.planned.toLocaleString()}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <span className="text-sm text-gray-900">
                        ${item.actual.toLocaleString()}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <span
                        className={`text-sm font-medium ${
                          itemVariance >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {itemVariance >= 0 ? '+' : '-'}${Math.abs(itemVariance).toLocaleString()}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Badge
                        variant="outline"
                        className={
                          Number(percentOfBudget) > 30
                            ? 'border-blue-500 text-blue-700'
                            : 'border-gray-500 text-gray-700'
                        }
                      >
                        {percentOfBudget}%
                      </Badge>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-gray-600">{item.notes}</span>
                    </td>
                  </tr>
                );
              })}
              <tr className="bg-gray-50 font-semibold">
                <td className="p-4">Total</td>
                <td className="p-4 text-right">
                  ${lineItems.reduce((sum, item) => sum + item.planned, 0).toLocaleString()}
                </td>
                <td className="p-4 text-right">
                  ${lineItems.reduce((sum, item) => sum + item.actual, 0).toLocaleString()}
                </td>
                <td className="p-4 text-right">
                  <span
                    className={`${
                      variance >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {variance >= 0 ? '+' : '-'}${Math.abs(variance).toLocaleString()}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <Badge variant="outline">
                    {((actualCosts / budget) * 100).toFixed(1)}%
                  </Badge>
                </td>
                <td className="p-4"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Budget Insights */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-gray-900 mb-4">Budget Insights</h3>
        <div className="space-y-3">
          {variance >= 0 ? (
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Budget on Track</p>
                <p className="text-sm text-gray-600">
                  Project is currently ${Math.abs(variance).toLocaleString()} under budget.
                  Continue monitoring to maintain this performance.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Budget Overrun Alert</p>
                <p className="text-sm text-gray-600">
                  Project is currently ${Math.abs(variance).toLocaleString()} over budget.
                  Review spending and consider cost optimization measures.
                </p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
            <DollarSign className="w-5 h-5 text-blue-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">Labor Efficiency</p>
              <p className="text-sm text-gray-600">
                {totalActualHours}h logged out of {totalEstimatedHours}h estimated
                ({totalEstimatedHours > 0 ? ((totalActualHours / totalEstimatedHours) * 100).toFixed(0) : 0}% of planned hours).
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}