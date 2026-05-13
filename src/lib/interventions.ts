export interface Intervention {
  id: string
  name: string
  description: string
  category: 'collaborate' | 'create' | 'compete' | 'control'
  quadrant: 'clan' | 'adhocracy' | 'market' | 'hierarchy'
  direction: 'increase' | 'decrease'
  effort: 'low' | 'medium' | 'high'
  impact: 'low' | 'medium' | 'high'
  duration?: string
  resources?: string
  examples?: string[]
}

export const INTERVENTIONS: Intervention[] = [
  // +Collaborate (Increase Clan)
  {
    id: 'peer-learning',
    name: 'Peer Learning Circles',
    description: 'Establish small groups for knowledge sharing and collaborative problem-solving',
    category: 'collaborate',
    quadrant: 'clan',
    direction: 'increase',
    effort: 'medium',
    impact: 'high',
    duration: '1-3 months',
    resources: 'Facilitator, meeting space, materials',
    examples: [
      'Monthly cross-functional learning sessions',
      'Peer mentoring programs',
      'Knowledge sharing workshops'
    ]
  },
  {
    id: 'suggestion-systems',
    name: 'Employee Suggestion System',
    description: 'Create formal channels for employees to contribute ideas and improvements',
    category: 'collaborate',
    quadrant: 'clan',
    direction: 'increase',
    effort: 'low',
    impact: 'medium',
    duration: '1-2 weeks',
    resources: 'Digital platform, review committee',
    examples: [
      'Online suggestion box with feedback',
      'Monthly idea review meetings',
      'Recognition program for implemented suggestions'
    ]
  },
  {
    id: 'team-building',
    name: 'Regular Team Building Activities',
    description: 'Organize activities that strengthen relationships and collaboration',
    category: 'collaborate',
    quadrant: 'clan',
    direction: 'increase',
    effort: 'medium',
    impact: 'medium',
    duration: '1-3 months',
    resources: 'Event coordinator, budget for activities',
    examples: [
      'Quarterly team retreats',
      'Weekly team lunches',
      'Collaborative volunteer projects'
    ]
  },

  // +Create (Increase Adhocracy)
  {
    id: 'innovation-time',
    name: 'Innovation Time',
    description: 'Dedicate time for employees to work on creative projects',
    category: 'create',
    quadrant: 'adhocracy',
    direction: 'increase',
    effort: 'low',
    impact: 'high',
    duration: '1-2 weeks',
    resources: 'Time allocation, project support',
    examples: [
      '20% time for personal projects',
      'Monthly innovation days',
      'Hackathon events'
    ]
  },
  {
    id: 'experiment-culture',
    name: 'Experimentation Culture',
    description: 'Encourage and support rapid prototyping and testing of new ideas',
    category: 'create',
    quadrant: 'adhocracy',
    direction: 'increase',
    effort: 'medium',
    impact: 'high',
    duration: '3-6 months',
    resources: 'Innovation lab, testing budget, training',
    examples: [
      'Rapid prototyping workshops',
      'A/B testing frameworks',
      'Failure celebration events'
    ]
  },
  {
    id: 'cross-functional-teams',
    name: 'Cross-Functional Project Teams',
    description: 'Form diverse teams to tackle complex challenges',
    category: 'create',
    quadrant: 'adhocracy',
    direction: 'increase',
    effort: 'medium',
    impact: 'high',
    duration: '1-3 months',
    resources: 'Team formation, project management tools',
    examples: [
      'Innovation task forces',
      'Product development squads',
      'Process improvement teams'
    ]
  },

  // +Compete (Increase Market)
  {
    id: 'performance-dashboards',
    name: 'Performance Dashboards',
    description: 'Create visible metrics and competitive performance tracking',
    category: 'compete',
    quadrant: 'market',
    direction: 'increase',
    effort: 'medium',
    impact: 'high',
    duration: '1-3 months',
    resources: 'Dashboard software, data integration',
    examples: [
      'Real-time performance boards',
      'Team vs team competitions',
      'Customer satisfaction tracking'
    ]
  },
  {
    id: 'customer-focus',
    name: 'Customer-Centric Initiatives',
    description: 'Align all activities with customer value and market demands',
    category: 'compete',
    quadrant: 'market',
    direction: 'increase',
    effort: 'high',
    impact: 'high',
    duration: '3-6 months',
    resources: 'Customer research, training programs',
    examples: [
      'Customer journey mapping',
      'Voice of customer programs',
      'Market-driven product development'
    ]
  },
  {
    id: 'results-rewards',
    name: 'Results-Based Rewards',
    description: 'Tie compensation and recognition to measurable outcomes',
    category: 'compete',
    quadrant: 'market',
    direction: 'increase',
    effort: 'medium',
    impact: 'high',
    duration: '1-3 months',
    resources: 'Compensation system redesign, metrics',
    examples: [
      'Performance-based bonuses',
      'Achievement recognition programs',
      'Goal-based promotions'
    ]
  },

  // +Control (Increase Hierarchy)
  {
    id: 'process-standardization',
    name: 'Process Standardization',
    description: 'Document and standardize key processes for consistency',
    category: 'control',
    quadrant: 'hierarchy',
    direction: 'increase',
    effort: 'high',
    impact: 'high',
    duration: '3-6 months',
    resources: 'Process analysts, documentation tools',
    examples: [
      'Standard operating procedures',
      'Quality management systems',
      'Compliance frameworks'
    ]
  },
  {
    id: 'clear-hierarchy',
    name: 'Clear Hierarchy and Roles',
    description: 'Establish clear reporting structures and role definitions',
    category: 'control',
    quadrant: 'hierarchy',
    direction: 'increase',
    effort: 'medium',
    impact: 'medium',
    duration: '1-3 months',
    resources: 'Organizational design, communication',
    examples: [
      'Organizational chart updates',
      'Job description clarity',
      'Decision-making frameworks'
    ]
  },
  {
    id: 'quality-controls',
    name: 'Quality Control Systems',
    description: 'Implement systematic quality checks and controls',
    category: 'control',
    quadrant: 'hierarchy',
    direction: 'increase',
    effort: 'medium',
    impact: 'high',
    duration: '1-3 months',
    resources: 'Quality tools, training, monitoring',
    examples: [
      'Quality gates in processes',
      'Regular audits and reviews',
      'Continuous improvement cycles'
    ]
  },

  // -Control (Decrease Hierarchy)
  {
    id: 'policy-simplification',
    name: 'Policy Simplification',
    description: 'Streamline and reduce bureaucratic policies and procedures',
    category: 'control',
    quadrant: 'hierarchy',
    direction: 'decrease',
    effort: 'high',
    impact: 'high',
    duration: '3-6 months',
    resources: 'Policy review team, legal consultation',
    examples: [
      'Policy audit and reduction',
      'Simplified approval processes',
      'Employee handbook updates'
    ]
  },
  {
    id: 'decentralized-decisions',
    name: 'Decentralized Decision Making',
    description: 'Push decision-making authority closer to the front lines',
    category: 'control',
    quadrant: 'hierarchy',
    direction: 'decrease',
    effort: 'high',
    impact: 'high',
    duration: '3-6 months',
    resources: 'Training, empowerment programs',
    examples: [
      'Manager delegation training',
      'Employee decision-making authority',
      'Reduced approval layers'
    ]
  },
  {
    id: 'flexible-work',
    name: 'Flexible Work Arrangements',
    description: 'Allow more autonomy in how and when work gets done',
    category: 'control',
    quadrant: 'hierarchy',
    direction: 'decrease',
    effort: 'medium',
    impact: 'medium',
    duration: '1-3 months',
    resources: 'Policy development, technology support',
    examples: [
      'Remote work options',
      'Flexible hours',
      'Results-only work environment'
    ]
  },

  // -Compete (Decrease Market)
  {
    id: 'collaborative-goals',
    name: 'Collaborative Goal Setting',
    description: 'Focus on team and organizational goals over individual competition',
    category: 'compete',
    quadrant: 'market',
    direction: 'decrease',
    effort: 'medium',
    impact: 'medium',
    duration: '1-3 months',
    resources: 'Goal-setting workshops, team building',
    examples: [
      'Team-based objectives',
      'Shared success metrics',
      'Collaborative performance reviews'
    ]
  },
  {
    id: 'customer-partnership',
    name: 'Customer Partnership Approach',
    description: 'Shift from competitive selling to collaborative problem-solving',
    category: 'compete',
    quadrant: 'market',
    direction: 'decrease',
    effort: 'high',
    impact: 'high',
    duration: '3-6 months',
    resources: 'Sales training, relationship management',
    examples: [
      'Consultative selling approach',
      'Long-term partnership focus',
      'Value co-creation with customers'
    ]
  },

  // -Create (Decrease Adhocracy)
  {
    id: 'structured-innovation',
    name: 'Structured Innovation Process',
    description: 'Add more structure and process to innovation activities',
    category: 'create',
    quadrant: 'adhocracy',
    direction: 'decrease',
    effort: 'medium',
    impact: 'medium',
    duration: '1-3 months',
    resources: 'Process design, training',
    examples: [
      'Stage-gate innovation process',
      'Formal innovation committees',
      'Structured idea evaluation'
    ]
  },
  {
    id: 'risk-management',
    name: 'Enhanced Risk Management',
    description: 'Implement more thorough risk assessment and mitigation',
    category: 'create',
    quadrant: 'adhocracy',
    direction: 'decrease',
    effort: 'high',
    impact: 'high',
    duration: '3-6 months',
    resources: 'Risk management tools, training',
    examples: [
      'Comprehensive risk assessments',
      'Risk mitigation protocols',
      'Regular risk reviews'
    ]
  },

  // -Collaborate (Decrease Clan)
  {
    id: 'individual-accountability',
    name: 'Individual Accountability Systems',
    description: 'Focus more on individual performance and accountability',
    category: 'collaborate',
    quadrant: 'clan',
    direction: 'decrease',
    effort: 'medium',
    impact: 'medium',
    duration: '1-3 months',
    resources: 'Performance management systems',
    examples: [
      'Individual performance metrics',
      'Personal development plans',
      'Individual recognition programs'
    ]
  },
  {
    id: 'efficient-meetings',
    name: 'Meeting Efficiency Focus',
    description: 'Reduce social aspects and focus on task completion',
    category: 'collaborate',
    quadrant: 'clan',
    direction: 'decrease',
    effort: 'low',
    impact: 'low',
    duration: '1-2 weeks',
    resources: 'Meeting guidelines, training',
    examples: [
      'Structured meeting agendas',
      'Time-boxed discussions',
      'Action-oriented meetings'
    ]
  }
]

export function getInterventionsForQuadrant(
  quadrant: 'clan' | 'adhocracy' | 'market' | 'hierarchy',
  direction: 'increase' | 'decrease'
): Intervention[] {
  return INTERVENTIONS.filter(
    intervention => 
      intervention.quadrant === quadrant && 
      intervention.direction === direction
  )
}

export function getInterventionsByEffort(
  effort: 'low' | 'medium' | 'high'
): Intervention[] {
  return INTERVENTIONS.filter(intervention => intervention.effort === effort)
}

export function getInterventionsByImpact(
  impact: 'low' | 'medium' | 'high'
): Intervention[] {
  return INTERVENTIONS.filter(intervention => intervention.impact === impact)
}

export function getInterventionsByDuration(
  duration: string
): Intervention[] {
  return INTERVENTIONS.filter(intervention => intervention.duration === duration)
}
