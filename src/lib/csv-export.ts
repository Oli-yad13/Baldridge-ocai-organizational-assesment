import Papa from 'papaparse'
import { AggregateData } from './aggregation'

export interface CSVExportOptions {
  aggregates: AggregateData[]
  responses: Array<{
    id: string
    demographics: any
    nowScores: any
    preferredScores: any
    submittedAt: Date
  }>
  organizationName: string
  surveyTitle: string
}

export class CSVExportService {
  static async generateDeidentifiedCSV(options: CSVExportOptions): Promise<Blob> {
    // Create de-identified response data
    const deidentifiedResponses = options.responses.map((response, index) => {
      const demographics = typeof response.demographics === 'string' 
        ? JSON.parse(response.demographics) 
        : response.demographics || {}

      return {
        responseId: `RESP_${String(index + 1).padStart(4, '0')}`, // Pseudonymous ID
        department: this.bucketDemographic(demographics.department),
        team: this.bucketDemographic(demographics.team),
        tenure: this.bucketDemographic(demographics.tenure),
        location: this.bucketDemographic(demographics.location),
        gender: this.bucketDemographic(demographics.gender),
        laborUnit: this.bucketDemographic(demographics.laborUnit),
        raceEthnicity: this.bucketDemographic(demographics.raceEthnicity),
        nowClan: response.nowScores?.Clan || 0,
        nowAdhocracy: response.nowScores?.Adhocracy || 0,
        nowMarket: response.nowScores?.Market || 0,
        nowHierarchy: response.nowScores?.Hierarchy || 0,
        preferredClan: response.preferredScores?.Clan || 0,
        preferredAdhocracy: response.preferredScores?.Adhocracy || 0,
        preferredMarket: response.preferredScores?.Market || 0,
        preferredHierarchy: response.preferredScores?.Hierarchy || 0,
        deltaClan: (response.preferredScores?.Clan || 0) - (response.nowScores?.Clan || 0),
        deltaAdhocracy: (response.preferredScores?.Adhocracy || 0) - (response.nowScores?.Adhocracy || 0),
        deltaMarket: (response.preferredScores?.Market || 0) - (response.nowScores?.Market || 0),
        deltaHierarchy: (response.preferredScores?.Hierarchy || 0) - (response.nowScores?.Hierarchy || 0),
        submittedAt: response.submittedAt.toISOString()
      }
    })

    // Create aggregates data
    const aggregatesData = options.aggregates.map(agg => ({
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
      deltaClan: agg.delta.Clan,
      deltaAdhocracy: agg.delta.Adhocracy,
      deltaMarket: agg.delta.Market,
      deltaHierarchy: agg.delta.Hierarchy,
      sampleSize: agg.n,
      participationRate: agg.participationRate,
      congruenceClan: agg.congruenceIndicators.Clan,
      congruenceAdhocracy: agg.congruenceIndicators.Adhocracy,
      congruenceMarket: agg.congruenceIndicators.Market,
      congruenceHierarchy: agg.congruenceIndicators.Hierarchy
    }))

    // Combine data with metadata
    const exportData = {
      metadata: {
        organizationName: options.organizationName,
        surveyTitle: options.surveyTitle,
        exportDate: new Date().toISOString(),
        totalResponses: deidentifiedResponses.length,
        totalAggregates: aggregatesData.length,
        kAnonymityThreshold: 7,
        description: 'De-identified culture assessment data with demographic bucketing for privacy protection'
      },
      responses: deidentifiedResponses,
      aggregates: aggregatesData
    }

    // Convert to CSV format
    const csv = Papa.unparse(exportData.responses, {
      header: true,
      delimiter: ','
    })

    return new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  }

  static async generateAggregatesCSV(options: CSVExportOptions): Promise<Blob> {
    const aggregatesData = options.aggregates.map(agg => ({
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
      deltaClan: agg.delta.Clan,
      deltaAdhocracy: agg.delta.Adhocracy,
      deltaMarket: agg.delta.Market,
      deltaHierarchy: agg.delta.Hierarchy,
      sampleSize: agg.n,
      participationRate: agg.participationRate,
      congruenceClan: agg.congruenceIndicators.Clan,
      congruenceAdhocracy: agg.congruenceIndicators.Adhocracy,
      congruenceMarket: agg.congruenceIndicators.Market,
      congruenceHierarchy: agg.congruenceIndicators.Hierarchy
    }))

    const csv = Papa.unparse(aggregatesData, {
      header: true,
      delimiter: ','
    })

    return new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  }

  private static bucketDemographic(value: any): string {
    if (!value || value === 'prefer-not-to-say') {
      return 'Not Specified'
    }

    // For small groups, bucket into broader categories for privacy
    const stringValue = String(value).toLowerCase()
    
    // Department bucketing
    if (stringValue.includes('hr') || stringValue.includes('human')) return 'HR/People'
    if (stringValue.includes('it') || stringValue.includes('tech')) return 'Technology'
    if (stringValue.includes('sales') || stringValue.includes('marketing')) return 'Sales/Marketing'
    if (stringValue.includes('finance') || stringValue.includes('accounting')) return 'Finance'
    if (stringValue.includes('operations') || stringValue.includes('ops')) return 'Operations'
    if (stringValue.includes('executive') || stringValue.includes('leadership')) return 'Leadership'
    
    // Tenure bucketing
    if (stringValue.includes('0-1') || stringValue.includes('less than 1')) return '0-1 years'
    if (stringValue.includes('1-3') || stringValue.includes('1 to 3')) return '1-3 years'
    if (stringValue.includes('3-5') || stringValue.includes('3 to 5')) return '3-5 years'
    if (stringValue.includes('5-10') || stringValue.includes('5 to 10')) return '5-10 years'
    if (stringValue.includes('10+') || stringValue.includes('more than 10')) return '10+ years'
    
    // Location bucketing (generalize to region/country level)
    if (stringValue.includes('north') || stringValue.includes('east') || 
        stringValue.includes('south') || stringValue.includes('west')) {
      return 'United States'
    }
    
    // Gender bucketing
    if (stringValue.includes('male') || stringValue.includes('man')) return 'Male'
    if (stringValue.includes('female') || stringValue.includes('woman')) return 'Female'
    if (stringValue.includes('non-binary') || stringValue.includes('other')) return 'Other'
    
    // Labor unit bucketing
    if (stringValue.includes('leadership') || stringValue.includes('executive') || 
        stringValue.includes('management')) return 'Leadership'
    if (stringValue.includes('individual') || stringValue.includes('contributor')) return 'Individual Contributor'
    if (stringValue.includes('support') || stringValue.includes('admin')) return 'Support/Admin'
    
    // Race/ethnicity bucketing
    if (stringValue.includes('white') || stringValue.includes('caucasian')) return 'White'
    if (stringValue.includes('black') || stringValue.includes('african')) return 'Black/African American'
    if (stringValue.includes('hispanic') || stringValue.includes('latino')) return 'Hispanic/Latino'
    if (stringValue.includes('asian')) return 'Asian'
    if (stringValue.includes('native') || stringValue.includes('indigenous')) return 'Native American'
    if (stringValue.includes('pacific') || stringValue.includes('islander')) return 'Pacific Islander'
    if (stringValue.includes('mixed') || stringValue.includes('multi')) return 'Multiracial'
    
    // Default: return original value if no bucketing needed
    return String(value)
  }

  static generateChartDataCSV(chartType: string, data: any): Blob {
    let csvData: any[] = []

    switch (chartType) {
      case 'radar':
        csvData = data.labels.map((label: string, index: number) => ({
          dimension: label,
          current: data.datasets[0]?.data[index] || 0,
          preferred: data.datasets[1]?.data[index] || 0
        }))
        break
      
      case 'bar':
        csvData = data.labels.map((label: string, index: number) => ({
          cultureType: label,
          current: data.datasets[0]?.data[index] || 0,
          preferred: data.datasets[1]?.data[index] || 0
        }))
        break
      
      case 'delta':
        csvData = Object.entries(data).map(([culture, delta]) => ({
          cultureType: culture,
          delta: delta
        }))
        break
      
      default:
        csvData = [{ error: 'Unsupported chart type' }]
    }

    const csv = Papa.unparse(csvData, {
      header: true,
      delimiter: ','
    })

    return new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  }
}
