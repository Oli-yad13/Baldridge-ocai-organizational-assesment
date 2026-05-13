import { prisma } from './prisma'
import { OCAIScores, calculateOCAIScores } from './ocai-data'

export interface DemographicSlice {
  key: string
  label: string
  value: string
  count: number
  participationRate: number
}

export interface AggregateData {
  id: string
  surveyId: string
  sliceKey: string
  sliceLabel: string
  currentClan: number
  currentAdhocracy: number
  currentMarket: number
  currentHierarchy: number
  preferredClan: number
  preferredAdhocracy: number
  preferredMarket: number
  preferredHierarchy: number
  delta: Record<string, number>
  n: number
  participationRate: number
  congruenceIndicators: Record<string, number>
}

export interface CongruenceIndicator {
  dimension: string
  currentScore: number
  preferredScore: number
  congruence: number // 0-1 scale where 1 is perfect congruence
}

const K_ANONYMITY_THRESHOLD = 7

export class AggregationService {
  /**
   * Compute aggregates for all eligible demographic slices
   */
  static async computeAggregates(surveyId: string): Promise<void> {
    const survey = await prisma.survey.findUnique({
      where: { id: surveyId },
      include: {
        responses: true
      }
    })

    if (!survey) {
      throw new Error('Survey not found')
    }

    // Clear existing aggregates for this survey
    await prisma.aggregate.deleteMany({
      where: { surveyId }
    })

    // Compute whole organization aggregate
    await this.computeWholeOrgAggregate(surveyId, survey.responses)

    // Compute demographic slices
    const demographicSlices = this.generateDemographicSlices(survey.responses)
    
    for (const slice of demographicSlices) {
      if (slice.count >= K_ANONYMITY_THRESHOLD) {
        await this.computeSliceAggregate(surveyId, slice, survey.responses)
      }
    }
  }

  /**
   * Compute aggregate for whole organization
   */
  private static async computeWholeOrgAggregate(
    surveyId: string, 
    responses: any[]
  ): Promise<void> {
    const validResponses = responses.filter(r => r.nowScores && r.preferredScores)
    
    if (validResponses.length === 0) return

    const scores = this.calculateAggregateScores(validResponses)
    const congruenceIndicators = this.calculateCongruenceIndicators(validResponses)
    
    await prisma.aggregate.create({
      data: {
        surveyId,
        sliceKey: 'whole_org',
        sliceLabel: 'Whole Organization',
        currentClan: scores.now.Clan,
        currentAdhocracy: scores.now.Adhocracy,
        currentMarket: scores.now.Market,
        currentHierarchy: scores.now.Hierarchy,
        preferredClan: scores.preferred.Clan,
        preferredAdhocracy: scores.preferred.Adhocracy,
        preferredMarket: scores.preferred.Market,
        preferredHierarchy: scores.preferred.Hierarchy,
        delta: scores.delta,
        n: validResponses.length
      }
    })
  }

  /**
   * Compute aggregate for a specific demographic slice
   */
  private static async computeSliceAggregate(
    surveyId: string,
    slice: DemographicSlice,
    allResponses: any[]
  ): Promise<void> {
    const sliceResponses = allResponses.filter(r => {
      if (!r.demographics) return false
      
      const demographics = typeof r.demographics === 'string' 
        ? JSON.parse(r.demographics) 
        : r.demographics

      return demographics[slice.key] === slice.value
    }).filter(r => r.nowScores && r.preferredScores)

    if (sliceResponses.length === 0) return

    const scores = this.calculateAggregateScores(sliceResponses)
    const congruenceIndicators = this.calculateCongruenceIndicators(sliceResponses)
    
    await prisma.aggregate.create({
      data: {
        surveyId,
        sliceKey: `${slice.key}:${slice.value}`,
        sliceLabel: `${slice.label}: ${slice.value}`,
        currentClan: scores.now.Clan,
        currentAdhocracy: scores.now.Adhocracy,
        currentMarket: scores.now.Market,
        currentHierarchy: scores.now.Hierarchy,
        preferredClan: scores.preferred.Clan,
        preferredAdhocracy: scores.preferred.Adhocracy,
        preferredMarket: scores.preferred.Market,
        preferredHierarchy: scores.preferred.Hierarchy,
        delta: scores.delta,
        n: sliceResponses.length
      }
    })
  }

  /**
   * Generate all possible demographic slices from responses
   */
  private static generateDemographicSlices(responses: any[]): DemographicSlice[] {
    const slices: DemographicSlice[] = []
    const demographicFields = [
      'department', 'team', 'tenure', 'location', 'gender', 
      'laborUnit', 'raceEthnicity'
    ]

    for (const field of demographicFields) {
      const values = new Map<string, number>()
      
      responses.forEach(response => {
        if (response.demographics) {
          const demographics = typeof response.demographics === 'string'
            ? JSON.parse(response.demographics)
            : response.demographics

          const value = demographics[field]
          if (value && value !== 'prefer-not-to-say') {
            values.set(value, (values.get(value) || 0) + 1)
          }
        }
      })

      // Create slices for values that meet k-anonymity
      for (const [value, count] of values.entries()) {
        if (count >= K_ANONYMITY_THRESHOLD) {
          slices.push({
            key: field,
            label: this.formatFieldLabel(field),
            value,
            count,
            participationRate: this.calculateParticipationRate(count, responses.length)
          })
        }
      }
    }

    return slices
  }

  /**
   * Calculate aggregate scores from individual responses
   */
  private static calculateAggregateScores(responses: any[]): OCAIScores {
    const allScores = {
      now: { Clan: 0, Adhocracy: 0, Market: 0, Hierarchy: 0 },
      preferred: { Clan: 0, Adhocracy: 0, Market: 0, Hierarchy: 0 }
    }

    responses.forEach(response => {
      const nowScores = typeof response.nowScores === 'string'
        ? JSON.parse(response.nowScores)
        : response.nowScores

      const preferredScores = typeof response.preferredScores === 'string'
        ? JSON.parse(response.preferredScores)
        : response.preferredScores

      allScores.now.Clan += nowScores.Clan || 0
      allScores.now.Adhocracy += nowScores.Adhocracy || 0
      allScores.now.Market += nowScores.Market || 0
      allScores.now.Hierarchy += nowScores.Hierarchy || 0

      allScores.preferred.Clan += preferredScores.Clan || 0
      allScores.preferred.Adhocracy += preferredScores.Adhocracy || 0
      allScores.preferred.Market += preferredScores.Market || 0
      allScores.preferred.Hierarchy += preferredScores.Hierarchy || 0
    })

    // Average across responses
    const n = responses.length
    Object.keys(allScores.now).forEach(key => {
      allScores.now[key as keyof typeof allScores.now] = 
        Math.round((allScores.now[key as keyof typeof allScores.now] / n) * 100) / 100
      allScores.preferred[key as keyof typeof allScores.preferred] = 
        Math.round((allScores.preferred[key as keyof typeof allScores.preferred] / n) * 100) / 100
    })

    // Calculate deltas
    const delta = {
      Clan: Math.round((allScores.preferred.Clan - allScores.now.Clan) * 100) / 100,
      Adhocracy: Math.round((allScores.preferred.Adhocracy - allScores.now.Adhocracy) * 100) / 100,
      Market: Math.round((allScores.preferred.Market - allScores.now.Market) * 100) / 100,
      Hierarchy: Math.round((allScores.preferred.Hierarchy - allScores.now.Hierarchy) * 100) / 100
    }

    return {
      now: allScores.now,
      preferred: allScores.preferred,
      delta
    }
  }

  /**
   * Calculate congruence indicators for each dimension
   */
  private static calculateCongruenceIndicators(responses: any[]): Record<string, number> {
    const dimensions = ['Clan', 'Adhocracy', 'Market', 'Hierarchy']
    const congruence: Record<string, number> = {}

    dimensions.forEach(dimension => {
      let totalCongruence = 0
      let validResponses = 0

      responses.forEach(response => {
        const nowScores = typeof response.nowScores === 'string'
          ? JSON.parse(response.nowScores)
          : response.nowScores

        const preferredScores = typeof response.preferredScores === 'string'
          ? JSON.parse(response.preferredScores)
          : response.preferredScores

        if (nowScores && preferredScores) {
          const now = nowScores[dimension] || 0
          const preferred = preferredScores[dimension] || 0
          
          // Congruence is 1 - (absolute difference / 100)
          const congruence = 1 - (Math.abs(now - preferred) / 100)
          totalCongruence += Math.max(0, congruence)
          validResponses++
        }
      })

      congruence[dimension] = validResponses > 0 
        ? Math.round((totalCongruence / validResponses) * 100) / 100
        : 0
    })

    return congruence
  }

  /**
   * Calculate participation rate
   */
  private static calculateParticipationRate(responded: number, total: number): number {
    return total > 0 ? Math.round((responded / total) * 100) / 100 : 0
  }

  /**
   * Format field labels for display
   */
  private static formatFieldLabel(field: string): string {
    const labels: Record<string, string> = {
      department: 'Department',
      team: 'Team',
      tenure: 'Tenure',
      location: 'Location',
      gender: 'Gender',
      laborUnit: 'Labor Unit',
      raceEthnicity: 'Race/Ethnicity'
    }
    return labels[field] || field
  }

  /**
   * Get aggregates for a survey with k-anonymity filtering
   */
  static async getAggregates(surveyId: string): Promise<AggregateData[]> {
    const aggregates = await prisma.aggregate.findMany({
      where: {
        surveyId,
        n: { gte: K_ANONYMITY_THRESHOLD }
      },
      orderBy: [
        { sliceKey: 'asc' },
        { sliceLabel: 'asc' }
      ]
    })

    // Fetch responses to calculate derived fields
    const survey = await prisma.survey.findUnique({
      where: { id: surveyId },
      include: { responses: true }
    })

    if (!survey) return []

    const totalResponses = survey.responses.length

    return aggregates.map(agg => {
      // Calculate congruence indicators based on the aggregate delta
      const delta = agg.delta as Record<string, number>
      const congruenceIndicators: Record<string, number> = {}

      for (const dimension of ['Clan', 'Adhocracy', 'Market', 'Hierarchy']) {
        const deltaValue = delta[dimension] || 0
        // Congruence is 1 - (absolute difference / 100)
        congruenceIndicators[dimension] = Math.max(0, 1 - (Math.abs(deltaValue) / 100))
      }

      return {
        id: agg.id,
        surveyId: agg.surveyId,
        sliceKey: agg.sliceKey,
        sliceLabel: agg.sliceLabel,
        currentClan: agg.currentClan,
        currentAdhocracy: agg.currentAdhocracy,
        currentMarket: agg.currentMarket,
        currentHierarchy: agg.currentHierarchy,
        preferredClan: agg.preferredClan,
        preferredAdhocracy: agg.preferredAdhocracy,
        preferredMarket: agg.preferredMarket,
        preferredHierarchy: agg.preferredHierarchy,
        delta: delta,
        n: agg.n,
        participationRate: this.calculateParticipationRate(agg.n, totalResponses),
        congruenceIndicators
      }
    })
  }

  /**
   * Get leadership vs all comparison data
   */
  static async getLeadershipComparison(surveyId: string): Promise<{
    leadership: AggregateData | null
    overall: AggregateData | null
  }> {
    const aggregates = await this.getAggregates(surveyId)

    const leadership = aggregates.find(agg =>
      agg.sliceKey.includes('laborUnit') &&
      agg.sliceLabel.toLowerCase().includes('leadership')
    ) || null

    const overall = aggregates.find(agg => agg.sliceKey === 'whole_org') || null

    return { leadership, overall }
  }
}
