export interface OCAIDimension {
  id: string
  title: string
  description: string
  options: {
    A: { text: string; culture: 'Clan' }
    B: { text: string; culture: 'Adhocracy' }
    C: { text: string; culture: 'Market' }
    D: { text: string; culture: 'Hierarchy' }
  }
}

export interface OCAIResponse {
  dimensionId: string
  now: { A: number; B: number; C: number; D: number }
  preferred: { A: number; B: number; C: number; D: number }
}

export interface OCAIScores {
  now: {
    Clan: number
    Adhocracy: number
    Market: number
    Hierarchy: number
  }
  preferred: {
    Clan: number
    Adhocracy: number
    Market: number
    Hierarchy: number
  }
  delta: {
    Clan: number
    Adhocracy: number
    Market: number
    Hierarchy: number
  }
}

// Helper function to get localized OCAI dimensions
// t: translation function from useLocale hook
export function getLocalizedOCAIDimensions(t: (key: string) => string): OCAIDimension[] {
  const dimensionIds = [
    'dominant_characteristics',
    'leadership', 
    'management_employees',
    'organization_glue',
    'strategic_emphases',
    'criteria_success'
  ];

  return dimensionIds.map(id => ({
    id,
    title: t(`questionDimensions.${id}.title`),
    description: t(`questionDimensions.${id}.description`),
    options: {
      A: { text: t(`questionDimensions.${id}.optionA`), culture: 'Clan' as const },
      B: { text: t(`questionDimensions.${id}.optionB`), culture: 'Adhocracy' as const },
      C: { text: t(`questionDimensions.${id}.optionC`), culture: 'Market' as const },
      D: { text: t(`questionDimensions.${id}.optionD`), culture: 'Hierarchy' as const }
    }
  }));
}

// Default English dimensions (for backward compatibility)
export const OCAI_DIMENSIONS: OCAIDimension[] = [
  {
    id: 'dominant_characteristics',
    title: 'Dominant Characteristics',
    description: 'The organization is a very personal place. It is like an extended family. People seem to share a lot of themselves.',
    options: {
      A: { text: 'The organization is a very personal place. It is like an extended family. People seem to share a lot of themselves.', culture: 'Clan' },
      B: { text: 'The organization is a very dynamic and entrepreneurial place. People are willing to stick their necks out and take risks.', culture: 'Adhocracy' },
      C: { text: 'The organization is very results oriented. A major concern is with getting the job done. People are very competitive and achievement oriented.', culture: 'Market' },
      D: { text: 'The organization is a very controlled and structured place. Formal procedures generally govern what people do.', culture: 'Hierarchy' }
    }
  },
  {
    id: 'leadership',
    title: 'Leadership',
    description: 'The leadership in the organization is generally considered to exemplify mentoring, facilitating, or nurturing.',
    options: {
      A: { text: 'The leadership in the organization is generally considered to exemplify mentoring, facilitating, or nurturing.', culture: 'Clan' },
      B: { text: 'The leadership in the organization is generally considered to exemplify entrepreneurship, innovating, or risk taking.', culture: 'Adhocracy' },
      C: { text: 'The leadership in the organization is generally considered to exemplify a no-nonsense, aggressive, results-oriented focus.', culture: 'Market' },
      D: { text: 'The leadership in the organization is generally considered to exemplify coordinating, organizing, or smooth-running efficiency.', culture: 'Hierarchy' }
    }
  },
  {
    id: 'management_employees',
    title: 'Management of Employees',
    description: 'The management style in the organization is characterized by teamwork, consensus, and participation.',
    options: {
      A: { text: 'The management style in the organization is characterized by teamwork, consensus, and participation.', culture: 'Clan' },
      B: { text: 'The management style in the organization is characterized by individual risk-taking, innovation, freedom, and uniqueness.', culture: 'Adhocracy' },
      C: { text: 'The management style in the organization is characterized by hard-driving competitiveness, high demands, and achievement.', culture: 'Market' },
      D: { text: 'The management style in the organization is characterized by security of employment, conformity, predictability, and stability in relationships.', culture: 'Hierarchy' }
    }
  },
  {
    id: 'organization_glue',
    title: 'Organization Glue',
    description: 'The glue that holds the organization together is loyalty and mutual trust. Commitment to this organization runs high.',
    options: {
      A: { text: 'The glue that holds the organization together is loyalty and mutual trust. Commitment to this organization runs high.', culture: 'Clan' },
      B: { text: 'The glue that holds the organization together is commitment to innovation and development. There is an emphasis on being on the cutting edge.', culture: 'Adhocracy' },
      C: { text: 'The glue that holds the organization together is the emphasis on achievement and goal accomplishment. Aggressive and winning is the common thread.', culture: 'Market' },
      D: { text: 'The glue that holds the organization together is formal rules and policies. Maintaining a smooth-running organization is important.', culture: 'Hierarchy' }
    }
  },
  {
    id: 'strategic_emphases',
    title: 'Strategic Emphases',
    description: 'The organization emphasizes human development. High trust, openness, and participation persist.',
    options: {
      A: { text: 'The organization emphasizes human development. High trust, openness, and participation persist.', culture: 'Clan' },
      B: { text: 'The organization emphasizes acquiring new resources and creating new challenges. Trying new things and prospecting for opportunities are valued.', culture: 'Adhocracy' },
      C: { text: 'The organization emphasizes competitive actions and achievement. Hitting stretch targets and winning in the marketplace are dominant.', culture: 'Market' },
      D: { text: 'The organization emphasizes permanence and stability. Efficiency, control, and smooth operations are valued.', culture: 'Hierarchy' }
    }
  },
  {
    id: 'criteria_success',
    title: 'Criteria of Success',
    description: 'The organization defines success on the basis of the development of human resources, teamwork, employee commitment, and concern for people.',
    options: {
      A: { text: 'The organization defines success on the basis of the development of human resources, teamwork, employee commitment, and concern for people.', culture: 'Clan' },
      B: { text: 'The organization defines success on the basis of having the most unique or newest products. It is a product leader and innovator.', culture: 'Adhocracy' },
      C: { text: 'The organization defines success on the basis of winning in the marketplace and outpacing the competition. Competitive market leadership is key.', culture: 'Market' },
      D: { text: 'The organization defines success on the basis of efficiency. Dependable delivery, smooth scheduling, and low-cost production are critical.', culture: 'Hierarchy' }
    }
  }
]

// Helper function to get localized culture types
export function getLocalizedCultureTypes(t: (key: string) => string) {
  return {
    Clan: {
      name: `${t('dimensions.clan.name')} (${t('dimensions.clan.subtitle')})`,
      description: t('cultureDescriptions.clan.fullDescription'),
      color: '#3B82F6'
    },
    Adhocracy: {
      name: `${t('dimensions.adhocracy.name')} (${t('dimensions.adhocracy.subtitle')})`,
      description: t('cultureDescriptions.adhocracy.fullDescription'),
      color: '#10B981'
    },
    Market: {
      name: `${t('dimensions.market.name')} (${t('dimensions.market.subtitle')})`,
      description: t('cultureDescriptions.market.fullDescription'),
      color: '#F59E0B'
    },
    Hierarchy: {
      name: `${t('dimensions.hierarchy.name')} (${t('dimensions.hierarchy.subtitle')})`,
      description: t('cultureDescriptions.hierarchy.fullDescription'),
      color: '#EF4444'
    }
  };
}

// Default English culture types (for backward compatibility)
export const CULTURE_TYPES = {
  Clan: {
    name: 'Clan (Collaborate)',
    description: 'A friendly place to work where people share a lot of themselves. It is like an extended family. Leaders are thought of as mentors and perhaps even as parent figures. The organization is held together by loyalty or tradition. Commitment is high. The organization emphasizes the long-term benefit of human resource development and attaches great importance to cohesion and morale. Success is defined in terms of sensitivity to customers and concern for people. The organization places a premium on teamwork, participation, and consensus.',
    color: '#3B82F6'
  },
  Adhocracy: {
    name: 'Adhocracy (Create)',
    description: 'A dynamic, entrepreneurial, and creative place to work. People stick their necks out and take risks. Leaders are considered innovators and risk takers. The glue that holds the organization together is commitment to experimentation and innovation. The emphasis is on being on the leading edge. The organization\'s long-term emphasis is on growth and acquiring new resources. Success means gaining unique and new products or services. Being a product or service leader is important. The organization encourages individual initiative and freedom.',
    color: '#10B981'
  },
  Market: {
    name: 'Market (Compete)',
    description: 'A results-oriented organization whose major concern is with getting the job done. People are competitive and goal-oriented. Leaders are hard drivers, producers, and competitors. They are tough and demanding. The glue that holds the organization together is an emphasis on winning. Reputation and success are common concerns. The long-term focus is on competitive actions and achieving stretch targets and goals. Success is defined in terms of market share and penetration. Competitive pricing and market leadership are important. The organizational style is hard-driving competitiveness.',
    color: '#F59E0B'
  },
  Hierarchy: {
    name: 'Hierarchy (Control)',
    description: 'A very formalized and structured place to work. Procedures govern what people do. Leaders pride themselves on being good coordinators and organizers who are efficiency-minded. Maintaining a smooth-running organization is most critical. The organization is held together by formal rules and policies. The long-term concern is on stability and performance with efficient, smooth operations. Success is defined in terms of dependable delivery, smooth scheduling, and low cost. Management wants security and predictability.',
    color: '#EF4444'
  }
}

export function calculateOCAIScores(responses: OCAIResponse[]): OCAIScores {
  const nowScores = { Clan: 0, Adhocracy: 0, Market: 0, Hierarchy: 0 }
  const preferredScores = { Clan: 0, Adhocracy: 0, Market: 0, Hierarchy: 0 }

  responses.forEach(response => {
    // Now scores
    nowScores.Clan += response.now.A
    nowScores.Adhocracy += response.now.B
    nowScores.Market += response.now.C
    nowScores.Hierarchy += response.now.D

    // Preferred scores
    preferredScores.Clan += response.preferred.A
    preferredScores.Adhocracy += response.preferred.B
    preferredScores.Market += response.preferred.C
    preferredScores.Hierarchy += response.preferred.D
  })

  // Average across 6 dimensions
  const dimensionCount = responses.length
  Object.keys(nowScores).forEach(key => {
    nowScores[key as keyof typeof nowScores] = Math.round((nowScores[key as keyof typeof nowScores] / dimensionCount) * 100) / 100
    preferredScores[key as keyof typeof preferredScores] = Math.round((preferredScores[key as keyof typeof preferredScores] / dimensionCount) * 100) / 100
  })

  // Calculate deltas
  const delta = {
    Clan: Math.round((preferredScores.Clan - nowScores.Clan) * 100) / 100,
    Adhocracy: Math.round((preferredScores.Adhocracy - nowScores.Adhocracy) * 100) / 100,
    Market: Math.round((preferredScores.Market - nowScores.Market) * 100) / 100,
    Hierarchy: Math.round((preferredScores.Hierarchy - nowScores.Hierarchy) * 100) / 100
  }

  return {
    now: nowScores,
    preferred: preferredScores,
    delta
  }
}

export function validateOCAIResponse(response: OCAIResponse): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  // Check Now scores
  const nowTotal = response.now.A + response.now.B + response.now.C + response.now.D
  if (nowTotal !== 100) {
    errors.push(`"Now" scores must total 100 (currently ${nowTotal})`)
  }
  
  // Check Preferred scores
  const preferredTotal = response.preferred.A + response.preferred.B + response.preferred.C + response.preferred.D
  if (preferredTotal !== 100) {
    errors.push(`"Preferred" scores must total 100 (currently ${preferredTotal})`)
  }
  
  // Check for negative values
  Object.entries(response.now).forEach(([key, value]) => {
    if (value < 0) {
      errors.push(`"Now" ${key} score cannot be negative`)
    }
  })
  
  Object.entries(response.preferred).forEach(([key, value]) => {
    if (value < 0) {
      errors.push(`"Preferred" ${key} score cannot be negative`)
    }
  })
  
  return {
    isValid: errors.length === 0,
    errors
  }
}
