import { useMemo } from 'react';
import { Project, Task, WorkOrder, Person, RecurringTask } from '@/types';
import { AIInsight } from '@/app/components/AIInsightCard';
import { toast } from 'sonner';

interface AIInsightsContext {
  projects?: Project[];
  selectedProject?: Project;
  tasks?: Task[];
  workOrders?: WorkOrder[];
  people?: Person[];
  recurringTasks?: RecurringTask[];
  quotes?: any[];
  currentView?: string;
}

/**
 * Custom hook that generates AI-powered insights based on project data
 * In production, this would call a backend AI service
 */
export function useAIInsights(context: AIInsightsContext): AIInsight[] {
  return useMemo(() => {
    const insights: AIInsight[] = [];

    // Portfolio-level insights
    if (context.projects && context.projects.length > 0) {
      const portfolioInsights = generatePortfolioInsights(context.projects);
      insights.push(...portfolioInsights);
    }

    // Project-specific insights
    if (context.selectedProject && context.tasks) {
      const projectInsights = generateProjectInsights(
        context.selectedProject, 
        context.tasks,
        context.workOrders || []
      );
      insights.push(...projectInsights);
    }

    // Work order insights
    if (context.workOrders && context.workOrders.length > 0) {
      const workOrderInsights = generateWorkOrderInsights(
        context.workOrders,
        context.people || []
      );
      insights.push(...workOrderInsights);
    }

    // Recurring task insights
    if (context.recurringTasks && context.recurringTasks.length > 0) {
      const recurringInsights = generateRecurringTaskInsights(context.recurringTasks);
      insights.push(...recurringInsights);
    }

    // Quotes insights
    if (context.quotes && context.quotes.length > 0) {
      const quotesInsights = generateQuotesInsights(context.quotes);
      insights.push(...quotesInsights);
    }

    // View-specific insights
    if (context.currentView === 'work-schedule-2' && context.workOrders && context.recurringTasks) {
      const scheduleInsights = generateWorkScheduleInsights(
        context.workOrders,
        context.recurringTasks,
        context.projects || []
      );
      insights.push(...scheduleInsights);
    }

    if (context.currentView === 'reports' && context.projects) {
      const reportInsights = generateReportInsights(
        context.projects,
        context.workOrders || [],
        context.quotes || []
      );
      insights.push(...reportInsights);
    }

    // Sort by priority (critical -> high -> medium -> low)
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return insights.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  }, [context]);
}

function generatePortfolioInsights(projects: Project[]): AIInsight[] {
  const insights: AIInsight[] = [];
  
  const activeProjects = projects.filter(p => p.status === 'active');
  const onHoldProjects = projects.filter(p => p.status === 'on-hold');
  const completedProjects = projects.filter(p => p.status === 'completed');
  
  // Check for projects at risk
  const atRiskProjects = activeProjects.filter(p => {
    const endDate = new Date(p.endDate);
    const today = new Date();
    const daysUntilDue = Math.floor((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilDue < 7 && p.progress < 80;
  });

  if (atRiskProjects.length > 0) {
    insights.push({
      id: 'portfolio-risk-' + Date.now(),
      type: 'warning',
      priority: 'high',
      title: `${atRiskProjects.length} Project${atRiskProjects.length > 1 ? 's' : ''} at Risk`,
      description: `${atRiskProjects.map(p => p.name).join(', ')} ${atRiskProjects.length > 1 ? 'are' : 'is'} behind schedule with less than a week until deadline.`,
      details: 'Based on current progress rates, these projects may miss their deadlines. Consider reallocating resources or adjusting timelines to prevent project failure.',
      metrics: [
        { label: 'Projects at Risk', value: atRiskProjects.length.toString() },
        { label: 'Avg. Progress', value: `${Math.round(atRiskProjects.reduce((sum, p) => sum + p.progress, 0) / atRiskProjects.length)}%` },
      ],
      actions: [
        {
          label: 'View Projects',
          onClick: () => toast.info('Navigating to at-risk projects...'),
        },
        {
          label: 'Generate Recovery Plan',
          onClick: () => toast.success('AI is analyzing recovery options...'),
        },
      ],
      dismissible: true,
    });
  }

  // Portfolio capacity analysis
  if (activeProjects.length >= 3) {
    const avgProgress = activeProjects.reduce((sum, p) => sum + p.progress, 0) / activeProjects.length;
    
    if (avgProgress < 50) {
      insights.push({
        id: 'portfolio-capacity-' + Date.now(),
        type: 'recommendation',
        priority: 'medium',
        title: 'Resource Optimization Opportunity',
        description: `Your portfolio average progress is ${Math.round(avgProgress)}%. AI analysis suggests focusing resources on 2-3 high-priority projects.`,
        details: 'Spreading resources too thin across multiple projects reduces overall efficiency. Consider prioritizing critical projects to improve completion rates.',
        actions: [
          {
            label: 'See Recommendations',
            onClick: () => toast.info('Analyzing optimal resource allocation...'),
          },
        ],
        dismissible: true,
      });
    }
  }

  // Success pattern recognition
  if (completedProjects.length >= 2) {
    insights.push({
      id: 'portfolio-success-' + Date.now(),
      type: 'success',
      priority: 'low',
      title: 'Success Pattern Detected',
      description: `AI has identified common traits in your ${completedProjects.length} completed projects that predict success.`,
      details: 'Projects with clear milestones, regular progress updates, and balanced resource allocation have a 92% on-time completion rate in your portfolio.',
      actions: [
        {
          label: 'Apply to Active Projects',
          onClick: () => toast.success('Applying success patterns to active projects...'),
        },
      ],
      dismissible: true,
    });
  }

  // On-hold project recommendation
  if (onHoldProjects.length > 0) {
    insights.push({
      id: 'portfolio-onhold-' + Date.now(),
      type: 'info',
      priority: 'low',
      title: `${onHoldProjects.length} Project${onHoldProjects.length > 1 ? 's' : ''} On Hold`,
      description: 'AI suggests reviewing on-hold projects quarterly to determine if they should be reactivated or closed.',
      actions: [
        {
          label: 'Review Projects',
          onClick: () => toast.info('Opening on-hold project review...'),
        },
      ],
      dismissible: true,
    });
  }

  return insights;
}

function generateProjectInsights(project: Project, tasks: Task[], workOrders: WorkOrder[]): AIInsight[] {
  const insights: AIInsight[] = [];
  
  const today = new Date();
  const endDate = new Date(project.endDate);
  const startDate = new Date(project.startDate);
  
  const totalDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const daysElapsed = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const daysRemaining = Math.floor((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const expectedProgress = (daysElapsed / totalDays) * 100;
  const progressGap = project.progress - expectedProgress;

  // Schedule performance insight
  if (project.status === 'active' && Math.abs(progressGap) > 10) {
    if (progressGap < -10) {
      insights.push({
        id: 'project-behind-' + project.id,
        type: 'warning',
        priority: daysRemaining < 7 ? 'critical' : 'high',
        title: 'Project Behind Schedule',
        description: `This project is ${Math.abs(Math.round(progressGap))}% behind schedule. Current pace suggests ${Math.round(daysRemaining * (1 + Math.abs(progressGap) / 100))} days to complete.`,
        details: 'AI analysis shows that delayed task dependencies and resource constraints are the primary causes. Recommend adding resources or extending timeline by 2 weeks.',
        metrics: [
          { label: 'Schedule Gap', value: `${Math.round(progressGap)}%`, change: `${Math.round(progressGap)}%` },
          { label: 'Days Behind', value: Math.round(Math.abs(progressGap) / 100 * totalDays).toString() },
        ],
        actions: [
          {
            label: 'View Critical Path',
            onClick: () => toast.info('Analyzing critical path...'),
          },
          {
            label: 'Resource Recommendations',
            onClick: () => toast.info('AI is generating resource allocation plan...'),
          },
        ],
        dismissible: true,
      });
    } else if (progressGap > 10) {
      insights.push({
        id: 'project-ahead-' + project.id,
        type: 'success',
        priority: 'low',
        title: 'Project Ahead of Schedule',
        description: `Excellent progress! This project is ${Math.round(progressGap)}% ahead of schedule. Consider early delivery or adding scope.`,
        metrics: [
          { label: 'Schedule Buffer', value: `+${Math.round(progressGap)}%` },
          { label: 'Days Ahead', value: Math.round(progressGap / 100 * totalDays).toString() },
        ],
        actions: [
          {
            label: 'Explore Early Delivery',
            onClick: () => toast.success('Analyzing early delivery options...'),
          },
        ],
        dismissible: true,
      });
    }
  }

  // Task dependency analysis
  const blockedTasks = tasks.filter(t => 
    t.status === 'todo' && 
    t.dependencies.length > 0 &&
    t.dependencies.some(depId => {
      const depTask = tasks.find(dt => dt.id === depId);
      return depTask && depTask.status !== 'completed';
    })
  );

  if (blockedTasks.length > 0) {
    insights.push({
      id: 'project-blocked-' + project.id,
      type: 'warning',
      priority: 'medium',
      title: `${blockedTasks.length} Task${blockedTasks.length > 1 ? 's' : ''} Blocked by Dependencies`,
      description: 'AI has identified tasks waiting on incomplete dependencies. Resolving blockers could accelerate progress by 15-20%.',
      actions: [
        {
          label: 'View Blockers',
          onClick: () => toast.info('Showing blocked tasks...'),
        },
        {
          label: 'Suggest Workarounds',
          onClick: () => toast.info('AI is analyzing alternative sequences...'),
        },
      ],
      dismissible: true,
    });
  }

  // Budget performance (if budget exists)
  if (project.budget && project.budget > 0) {
    const totalEstimatedHours = tasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0);
    const totalActualHours = tasks.reduce((sum, task) => sum + (task.actualHours || 0), 0);
    
    if (totalActualHours > totalEstimatedHours * 1.1) {
      const overrun = ((totalActualHours - totalEstimatedHours) / totalEstimatedHours * 100);
      insights.push({
        id: 'project-budget-' + project.id,
        type: 'warning',
        priority: 'high',
        title: 'Cost Overrun Detected',
        description: `Actual hours are ${Math.round(overrun)}% over estimate. AI predicts ${Math.round(overrun * 1.2)}% total cost overrun if trend continues.`,
        metrics: [
          { label: 'Estimated Hours', value: totalEstimatedHours.toString() },
          { label: 'Actual Hours', value: totalActualHours.toString(), change: `+${Math.round(overrun)}%` },
        ],
        actions: [
          {
            label: 'View Cost Analysis',
            onClick: () => toast.info('Opening detailed cost breakdown...'),
          },
        ],
        dismissible: true,
      });
    }
  }

  // Work order completion rate
  if (workOrders.length > 0) {
    const completedWO = workOrders.filter(wo => wo.status === 'completed').length;
    const completionRate = (completedWO / workOrders.length) * 100;
    
    if (completionRate < 60 && workOrders.length >= 5) {
      insights.push({
        id: 'project-wo-completion-' + project.id,
        type: 'recommendation',
        priority: 'medium',
        title: 'Low Work Order Completion Rate',
        description: `Only ${Math.round(completionRate)}% of work orders completed. AI suggests reviewing assignment strategy and resource availability.`,
        actions: [
          {
            label: 'Analyze Patterns',
            onClick: () => toast.info('Identifying completion bottlenecks...'),
          },
        ],
        dismissible: true,
      });
    }
  }

  // Milestone prediction
  const upcomingTasks = tasks.filter(t => {
    const taskEnd = new Date(t.endDate);
    const daysUntil = Math.floor((taskEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntil > 0 && daysUntil <= 14 && t.status !== 'completed';
  });

  if (upcomingTasks.length > 3) {
    insights.push({
      id: 'project-upcoming-' + project.id,
      type: 'prediction',
      priority: 'medium',
      title: 'High Activity Period Ahead',
      description: `AI predicts ${upcomingTasks.length} tasks due in the next 2 weeks. Consider load balancing to prevent bottlenecks.`,
      metrics: [
        { label: 'Tasks Due Soon', value: upcomingTasks.length.toString() },
        { label: 'Peak Period', value: 'Next 14 days' },
      ],
      actions: [
        {
          label: 'View Timeline',
          onClick: () => toast.info('Showing upcoming task timeline...'),
        },
        {
          label: 'Balance Workload',
          onClick: () => toast.info('AI is optimizing task distribution...'),
        },
      ],
      dismissible: true,
    });
  }

  return insights;
}

function generateWorkOrderInsights(workOrders: WorkOrder[], people: Person[]): AIInsight[] {
  const insights: AIInsight[] = [];

  // Pending approval bottleneck
  const pendingApproval = workOrders.filter(wo => wo.status === 'pending-approval');
  
  if (pendingApproval.length > 5) {
    insights.push({
      id: 'wo-approval-bottleneck-' + Date.now(),
      type: 'warning',
      priority: 'high',
      title: 'Approval Bottleneck Detected',
      description: `${pendingApproval.length} work orders awaiting approval. Average approval time is impacting project velocity.`,
      details: 'AI analysis shows approval delays are adding 2-3 days to work order completion. Consider adding approvers or automating certain approval types.',
      actions: [
        {
          label: 'View Pending',
          onClick: () => toast.info('Opening approval center...'),
        },
        {
          label: 'Suggest Process Improvements',
          onClick: () => toast.info('AI is analyzing approval workflow...'),
        },
      ],
      dismissible: true,
    });
  }

  // Resource utilization
  const assignedWorkOrders = workOrders.filter(wo => 
    wo.status === 'in-progress' || wo.status === 'scheduled'
  );
  
  if (people.length > 0 && assignedWorkOrders.length > 0) {
    const assignmentCounts: Record<string, number> = {};
    assignedWorkOrders.forEach(wo => {
      wo.assignedTo.forEach(personId => {
        assignmentCounts[personId] = (assignmentCounts[personId] || 0) + 1;
      });
    });

    const maxAssignments = Math.max(...Object.values(assignmentCounts));
    const minAssignments = Math.min(...Object.values(assignmentCounts).filter(c => c > 0));
    
    if (maxAssignments > minAssignments * 3) {
      insights.push({
        id: 'wo-resource-imbalance-' + Date.now(),
        type: 'recommendation',
        priority: 'medium',
        title: 'Uneven Resource Distribution',
        description: 'AI detected significant workload imbalance. Some team members are over-allocated while others have capacity.',
        actions: [
          {
            label: 'Balance Workload',
            onClick: () => toast.info('AI is suggesting work order reassignments...'),
          },
        ],
        dismissible: true,
      });
    }
  }

  // Completion quality (based on duration accuracy)
  const completedWO = workOrders.filter(wo => wo.status === 'completed' && wo.actualDuration);
  if (completedWO.length >= 10) {
    const durationAccuracy = completedWO.map(wo => {
      const estimated = wo.estimatedDuration;
      const actual = wo.actualDuration || estimated;
      return Math.abs(actual - estimated) / estimated;
    });
    const avgAccuracy = durationAccuracy.reduce((sum, acc) => sum + acc, 0) / durationAccuracy.length;

    if (avgAccuracy > 0.3) {
      insights.push({
        id: 'wo-estimation-accuracy-' + Date.now(),
        type: 'info',
        priority: 'low',
        title: 'Estimation Accuracy Can Improve',
        description: `Work order estimates are off by ${Math.round(avgAccuracy * 100)}% on average. AI can help improve future estimates.`,
        actions: [
          {
            label: 'Get AI Estimates',
            onClick: () => toast.success('AI learning from historical data to improve estimates...'),
          },
        ],
        dismissible: true,
      });
    } else if (avgAccuracy < 0.15) {
      insights.push({
        id: 'wo-estimation-success-' + Date.now(),
        type: 'success',
        priority: 'low',
        title: 'Excellent Estimation Accuracy',
        description: `Your work order estimates are ${Math.round((1 - avgAccuracy) * 100)}% accurate. This precision helps optimize scheduling.`,
        dismissible: true,
      });
    }
  }

  return insights;
}

function generateRecurringTaskInsights(recurringTasks: RecurringTask[]): AIInsight[] {
  const insights: AIInsight[] = [];

  // Completion consistency analysis
  const tasksWithHistory = recurringTasks.filter(rt => rt.completionHistory.length >= 3);
  
  if (tasksWithHistory.length > 0) {
    const inconsistentTasks = tasksWithHistory.filter(rt => {
      const durations = rt.completionHistory.map(h => h.duration);
      const avg = durations.reduce((sum, d) => sum + d, 0) / durations.length;
      const variance = durations.reduce((sum, d) => sum + Math.pow(d - avg, 2), 0) / durations.length;
      return variance > avg * 0.5; // High variance
    });

    if (inconsistentTasks.length > 0) {
      insights.push({
        id: 'recurring-consistency-' + Date.now(),
        type: 'recommendation',
        priority: 'medium',
        title: 'Inconsistent Task Performance',
        description: `${inconsistentTasks.length} recurring task${inconsistentTasks.length > 1 ? 's show' : ' shows'} high variation in completion time. AI can help standardize procedures.`,
        details: 'Inconsistent performance suggests unclear procedures or varying conditions. Creating standardized checklists and procedures can improve consistency.',
        actions: [
          {
            label: 'View Tasks',
            onClick: () => toast.info('Showing inconsistent recurring tasks...'),
          },
          {
            label: 'Generate Procedures',
            onClick: () => toast.success('AI is creating standardized procedures...'),
          },
        ],
        dismissible: true,
      });
    }
  }

  // Frequency optimization
  if (recurringTasks.length >= 5) {
    insights.push({
      id: 'recurring-optimization-' + Date.now(),
      type: 'prediction',
      priority: 'low',
      title: 'Scheduling Optimization Available',
      description: 'AI analysis suggests adjusting frequencies for 2 recurring tasks based on historical patterns and seasonal trends.',
      actions: [
        {
          label: 'See Recommendations',
          onClick: () => toast.info('AI is analyzing optimal frequencies...'),
        },
      ],
      dismissible: true,
    });
  }

  return insights;
}

function generateQuotesInsights(quotes: any[]): AIInsight[] {
  const insights: AIInsight[] = [];

  // Quote conversion rate
  const totalQuotes = quotes.length;
  const convertedQuotes = quotes.filter(q => q.status === 'converted').length;
  const conversionRate = (convertedQuotes / totalQuotes) * 100;

  if (conversionRate < 50 && totalQuotes >= 10) {
    insights.push({
      id: 'quotes-conversion-' + Date.now(),
      type: 'recommendation',
      priority: 'medium',
      title: 'Low Quote Conversion Rate',
      description: `Only ${Math.round(conversionRate)}% of quotes converted. AI suggests reviewing sales strategies and improving quote accuracy.`,
      actions: [
        {
          label: 'Analyze Patterns',
          onClick: () => toast.info('Identifying conversion bottlenecks...'),
        },
      ],
      dismissible: true,
    });
  }

  return insights;
}

function generateWorkScheduleInsights(workOrders: WorkOrder[], recurringTasks: RecurringTask[], projects: Project[]): AIInsight[] {
  const insights: AIInsight[] = [];

  // Work order overlap detection
  const today = new Date();
  const upcomingWorkOrders = workOrders.filter(wo => {
    const woStart = new Date(wo.startDate);
    const woEnd = new Date(wo.endDate);
    return woStart <= today && woEnd >= today;
  });

  if (upcomingWorkOrders.length > 5) {
    insights.push({
      id: 'workorder-overlap-' + Date.now(),
      type: 'warning',
      priority: 'high',
      title: 'Work Order Overlap Detected',
      description: `${upcomingWorkOrders.length} work orders are currently overlapping. This could lead to resource conflicts.`,
      details: 'AI analysis shows that overlapping work orders are causing delays and resource contention. Consider rescheduling or reallocating resources.',
      actions: [
        {
          label: 'View Overlaps',
          onClick: () => toast.info('Showing overlapping work orders...'),
        },
        {
          label: 'Reschedule Work Orders',
          onClick: () => toast.info('AI is suggesting new schedules...'),
        },
      ],
      dismissible: true,
    });
  }

  // Recurring task frequency analysis
  const frequentTasks = recurringTasks.filter(rt => rt.frequency < 7); // Less than weekly

  if (frequentTasks.length > 3) {
    insights.push({
      id: 'recurring-frequency-' + Date.now(),
      type: 'recommendation',
      priority: 'medium',
      title: 'Frequent Recurring Tasks',
      description: `${frequentTasks.length} recurring tasks are scheduled too frequently. AI suggests reviewing task necessity and adjusting frequencies.`,
      details: 'Frequent recurring tasks can lead to resource overutilization and inefficiency. Re-evaluating task frequency can help optimize resource allocation.',
      actions: [
        {
          label: 'View Tasks',
          onClick: () => toast.info('Showing frequent recurring tasks...'),
        },
        {
          label: 'Adjust Frequencies',
          onClick: () => toast.info('AI is suggesting new frequencies...'),
        },
      ],
      dismissible: true,
    });
  }

  return insights;
}

function generateReportInsights(projects: Project[], workOrders: WorkOrder[], quotes: any[]): AIInsight[] {
  const insights: AIInsight[] = [];

  // Project completion rate
  const totalProjects = projects.length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const projectCompletionRate = (completedProjects / totalProjects) * 100;

  if (projectCompletionRate < 70 && totalProjects >= 5) {
    insights.push({
      id: 'project-completion-rate-' + Date.now(),
      type: 'recommendation',
      priority: 'medium',
      title: 'Low Project Completion Rate',
      description: `Only ${Math.round(projectCompletionRate)}% of projects completed. AI suggests reviewing project management practices and resource allocation.`,
      actions: [
        {
          label: 'Analyze Patterns',
          onClick: () => toast.info('Identifying completion bottlenecks...'),
        },
      ],
      dismissible: true,
    });
  }

  // Work order completion rate
  const totalWorkOrders = workOrders.length;
  const completedWorkOrders = workOrders.filter(wo => wo.status === 'completed').length;
  const workOrderCompletionRate = (completedWorkOrders / totalWorkOrders) * 100;

  if (workOrderCompletionRate < 60 && totalWorkOrders >= 5) {
    insights.push({
      id: 'workorder-completion-rate-' + Date.now(),
      type: 'recommendation',
      priority: 'medium',
      title: 'Low Work Order Completion Rate',
      description: `Only ${Math.round(workOrderCompletionRate)}% of work orders completed. AI suggests reviewing assignment strategy and resource availability.`,
      actions: [
        {
          label: 'Analyze Patterns',
          onClick: () => toast.info('Identifying completion bottlenecks...'),
        },
      ],
      dismissible: true,
    });
  }

  // Quote conversion rate
  const totalQuotes = quotes.length;
  const convertedQuotes = quotes.filter(q => q.status === 'converted').length;
  const quoteConversionRate = (convertedQuotes / totalQuotes) * 100;

  if (quoteConversionRate < 50 && totalQuotes >= 10) {
    insights.push({
      id: 'quote-conversion-rate-' + Date.now(),
      type: 'recommendation',
      priority: 'medium',
      title: 'Low Quote Conversion Rate',
      description: `Only ${Math.round(quoteConversionRate)}% of quotes converted. AI suggests reviewing sales strategies and improving quote accuracy.`,
      actions: [
        {
          label: 'Analyze Patterns',
          onClick: () => toast.info('Identifying conversion bottlenecks...'),
        },
      ],
      dismissible: true,
    });
  }

  return insights;
}