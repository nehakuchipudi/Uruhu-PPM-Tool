import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Sparkles, Lightbulb, TrendingUp, AlertTriangle, Target } from 'lucide-react';

export function AIFeaturesGuide() {
  return (
    <Card className="p-6 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 border-2 border-purple-200">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xl font-bold text-gray-900">AI-Powered Insights</h3>
            <Badge className="bg-purple-600">Demo Mode</Badge>
          </div>
          <p className="text-sm text-gray-700 mb-4">
            UhuruSDPM includes intelligent AI capabilities that proactively analyze your projects and provide
            actionable insights without requiring queries. Here's how it works:
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white/80 backdrop-blur rounded-lg p-4 border border-purple-100">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </div>
            <h4 className="font-semibold text-gray-900">Risk Detection</h4>
          </div>
          <p className="text-sm text-gray-600">
            AI continuously monitors projects for schedule delays, budget overruns, resource conflicts, and approval
            bottlenecks, alerting you before issues become critical.
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur rounded-lg p-4 border border-purple-100">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <Lightbulb className="w-4 h-4 text-purple-600" />
            </div>
            <h4 className="font-semibold text-gray-900">Smart Recommendations</h4>
          </div>
          <p className="text-sm text-gray-600">
            Receive context-aware suggestions for resource optimization, workflow improvements, and process
            standardization based on your portfolio patterns.
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur rounded-lg p-4 border border-purple-100">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
            </div>
            <h4 className="font-semibold text-gray-900">Predictive Forecasting</h4>
          </div>
          <p className="text-sm text-gray-600">
            AI analyzes historical data and current trends to predict future outcomes, including project completion
            dates, final costs, and resource needs.
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur rounded-lg p-4 border border-purple-100">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Target className="w-4 h-4 text-emerald-600" />
            </div>
            <h4 className="font-semibold text-gray-900">EVM Analysis</h4>
          </div>
          <p className="text-sm text-gray-600">
            Advanced earned value management insights identify cost and schedule variances, calculate performance
            indices, and recommend corrective actions.
          </p>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur rounded-lg p-4 border-2 border-purple-200">
        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-600" />
          How AI Insights Appear
        </h4>
        <ul className="text-sm text-gray-700 space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-purple-600 mt-1">→</span>
            <span>
              <strong>Embedded Throughout:</strong> Insights appear contextually in dashboards, project views, work
              orders, and EVM sections
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-600 mt-1">→</span>
            <span>
              <strong>Prioritized by Urgency:</strong> Critical issues appear first, followed by high-priority
              recommendations and informational insights
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-600 mt-1">→</span>
            <span>
              <strong>Actionable Guidance:</strong> Each insight includes specific actions you can take, metrics to
              track, and detailed explanations
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-600 mt-1">→</span>
            <span>
              <strong>Dismissible & Smart:</strong> Dismiss insights you've addressed, and AI learns from your
              patterns over time
            </span>
          </li>
        </ul>
      </div>

      <div className="mt-4 p-4 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-lg border border-purple-200">
        <p className="text-sm text-gray-800">
          <strong>Production Implementation:</strong> In a live system, these insights would be powered by secure
          backend AI services (OpenAI, Anthropic, etc.) that analyze your real project data and learn from your
          business patterns. This demo uses intelligent mock data to showcase the UX.
        </p>
      </div>
    </Card>
  );
}
