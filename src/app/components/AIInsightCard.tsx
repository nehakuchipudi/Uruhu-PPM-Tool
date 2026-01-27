import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Info,
  Lightbulb,
  TrendingUp,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useState } from 'react';

export type InsightType = 'warning' | 'success' | 'info' | 'recommendation' | 'prediction';
export type InsightPriority = 'low' | 'medium' | 'high' | 'critical';

export interface AIInsight {
  id: string;
  type: InsightType;
  priority: InsightPriority;
  title: string;
  description: string;
  details?: string;
  metrics?: { label: string; value: string; change?: string }[];
  actions?: { label: string; onClick: () => void }[];
  dismissible?: boolean;
  timestamp?: Date;
}

interface AIInsightCardProps {
  insight: AIInsight;
  onDismiss?: (id: string) => void;
  compact?: boolean;
}

export function AIInsightCard({ insight, onDismiss, compact = false }: AIInsightCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  const getInsightIcon = () => {
    switch (insight.type) {
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'success':
        return <CheckCircle2 className="w-5 h-5" />;
      case 'info':
        return <Info className="w-5 h-5" />;
      case 'recommendation':
        return <Lightbulb className="w-5 h-5" />;
      case 'prediction':
        return <TrendingUp className="w-5 h-5" />;
    }
  };

  const getInsightColor = () => {
    switch (insight.type) {
      case 'warning':
        return insight.priority === 'critical' ? 'border-red-300 bg-red-50' : 'border-amber-300 bg-amber-50';
      case 'success':
        return 'border-emerald-300 bg-emerald-50';
      case 'info':
        return 'border-blue-300 bg-blue-50';
      case 'recommendation':
        return 'border-purple-300 bg-purple-50';
      case 'prediction':
        return 'border-indigo-300 bg-indigo-50';
    }
  };

  const getTextColor = () => {
    switch (insight.type) {
      case 'warning':
        return insight.priority === 'critical' ? 'text-red-900' : 'text-amber-900';
      case 'success':
        return 'text-emerald-900';
      case 'info':
        return 'text-blue-900';
      case 'recommendation':
        return 'text-purple-900';
      case 'prediction':
        return 'text-indigo-900';
    }
  };

  const getIconColor = () => {
    switch (insight.type) {
      case 'warning':
        return insight.priority === 'critical' ? 'text-red-600' : 'text-amber-600';
      case 'success':
        return 'text-emerald-600';
      case 'info':
        return 'text-blue-600';
      case 'recommendation':
        return 'text-purple-600';
      case 'prediction':
        return 'text-indigo-600';
    }
  };

  const getPriorityBadge = () => {
    if (insight.priority === 'low') return null;
    
    const colors = {
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      high: 'bg-orange-100 text-orange-800 border-orange-300',
      critical: 'bg-red-100 text-red-800 border-red-300',
    };

    return (
      <Badge variant="outline" className={`${colors[insight.priority]} text-xs`}>
        {insight.priority.toUpperCase()}
      </Badge>
    );
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    if (onDismiss) {
      onDismiss(insight.id);
    }
  };

  return (
    <Card className={`${getInsightColor()} border-2 overflow-hidden transition-all duration-200`}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon with sparkle badge */}
          <div className="relative flex-shrink-0 mt-0.5">
            <div className={`${getIconColor()}`}>
              {getInsightIcon()}
            </div>
            <div className="absolute -top-1 -right-1">
              <Sparkles className="w-3 h-3 text-purple-500 fill-purple-500" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className={`font-semibold ${getTextColor()}`}>
                  {insight.title}
                </h4>
                {getPriorityBadge()}
                <Badge variant="outline" className="text-xs bg-white/50">
                  AI Insight
                </Badge>
              </div>
              
              {insight.dismissible && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDismiss}
                  className="h-6 w-6 p-0 flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>

            <p className={`text-sm ${getTextColor()} mb-3`}>
              {insight.description}
            </p>

            {/* Metrics */}
            {insight.metrics && insight.metrics.length > 0 && (
              <div className="grid grid-cols-2 gap-3 mb-3">
                {insight.metrics.map((metric, idx) => (
                  <div key={idx} className="bg-white/60 rounded-lg p-2">
                    <div className="text-xs text-gray-600 mb-0.5">{metric.label}</div>
                    <div className="flex items-baseline gap-2">
                      <div className={`font-semibold ${getTextColor()}`}>{metric.value}</div>
                      {metric.change && (
                        <div className={`text-xs ${metric.change.startsWith('+') ? 'text-red-600' : 'text-emerald-600'}`}>
                          {metric.change}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Expandable details */}
            {insight.details && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="h-7 px-2 text-xs mb-2"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="w-3 h-3 mr-1" />
                      Hide Details
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3 h-3 mr-1" />
                      Show Details
                    </>
                  )}
                </Button>
                
                {isExpanded && (
                  <div className="bg-white/60 rounded-lg p-3 mb-3 text-sm text-gray-700">
                    {insight.details}
                  </div>
                )}
              </>
            )}

            {/* Action buttons */}
            {insight.actions && insight.actions.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {insight.actions.map((action, idx) => (
                  <Button
                    key={idx}
                    onClick={action.onClick}
                    size="sm"
                    variant={idx === 0 ? "default" : "outline"}
                    className="h-8 text-xs"
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

// Container component for multiple insights
interface AIInsightsContainerProps {
  insights: AIInsight[];
  onDismiss?: (id: string) => void;
  title?: string;
  maxVisible?: number;
}

export function AIInsightsContainer({ 
  insights, 
  onDismiss, 
  title = "AI Insights", 
  maxVisible 
}: AIInsightsContainerProps) {
  const [showAll, setShowAll] = useState(false);
  
  if (insights.length === 0) return null;

  const visibleInsights = maxVisible && !showAll 
    ? insights.slice(0, maxVisible) 
    : insights;
  const hasMore = maxVisible && insights.length > maxVisible;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">
            {insights.length}
          </Badge>
        </div>
      </div>

      <div className="space-y-3">
        {visibleInsights.map(insight => (
          <AIInsightCard 
            key={insight.id} 
            insight={insight} 
            onDismiss={onDismiss}
          />
        ))}
      </div>

      {hasMore && !showAll && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAll(true)}
          className="w-full"
        >
          Show {insights.length - maxVisible} More Insights
        </Button>
      )}
    </div>
  );
}
