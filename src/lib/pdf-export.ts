import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { AggregateData } from './aggregation'

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF
    lastAutoTable: {
      finalY: number
    }
  }
}

export interface PDFExportOptions {
  organizationName: string
  surveyTitle: string
  aggregates: AggregateData[]
  participationStats: {
    totalInvited: number
    totalResponded: number
    participationRate: number
  }
  methodology: string
  notes?: string
  branding?: {
    logoUrl?: string
    primaryColor: string
    organizationName: string
  }
}

export class PDFExportService {
  static async generateOrgReport(options: PDFExportOptions): Promise<Blob> {
    const doc = new jsPDF()
    
    // Cover Page
    this.addCoverPage(doc, options)
    
    // Methodology Page
    doc.addPage()
    this.addMethodologyPage(doc, options)
    
    // Participation Stats Page
    doc.addPage()
    this.addParticipationStatsPage(doc, options)
    
    // Organization Overview Page
    doc.addPage()
    this.addOrgOverviewPage(doc, options)
    
    // Demographic Slices Page
    doc.addPage()
    this.addDemographicSlicesPage(doc, options)
    
    // Delta Summary Page
    doc.addPage()
    this.addDeltaSummaryPage(doc, options)
    
    // Notes Page
    if (options.notes) {
      doc.addPage()
      this.addNotesPage(doc, options)
    }
    
    return doc.output('blob')
  }

  private static addCoverPage(doc: jsPDF, options: PDFExportOptions) {
    // Branded header with logo
    if (options.branding?.logoUrl) {
      // Add logo (in production, you'd load and embed the actual image)
      doc.setFillColor(240, 240, 240)
      doc.rect(20, 20, 60, 20, 'F')
      doc.setFontSize(10)
      doc.text('LOGO', 25, 32)
    }
    
    // Organization name with branding color
    if (options.branding?.primaryColor) {
      const color = this.hexToRgb(options.branding.primaryColor)
      doc.setFillColor(color.r, color.g, color.b)
      doc.rect(20, 45, 170, 8, 'F')
    }
    
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(255, 255, 255)
    doc.text(options.branding?.organizationName || options.organizationName, 25, 51)
    
    // Reset text color
    doc.setTextColor(0, 0, 0)
    
    // Title
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text('Organizational Culture Assessment Report', 20, 80)
    
    // Survey
    doc.setFontSize(14)
    doc.setFont('helvetica', 'normal')
    doc.text(`Survey: ${options.surveyTitle}`, 20, 100)
    
    // Date
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 115)
    
    // Report Info
    doc.setFontSize(12)
    doc.text('This report contains aggregated culture assessment data', 20, 135)
    doc.text('and insights based on the Competing Values Framework.', 20, 145)
    
    // Confidentiality Notice
    doc.setFontSize(10)
    doc.setFont('helvetica', 'italic')
    doc.text('CONFIDENTIAL - For internal use only', 20, 200)
  }

  private static hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 59, g: 130, b: 246 } // Default blue
  }

  private static addMethodologyPage(doc: jsPDF, options: PDFExportOptions) {
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('Methodology', 20, 30)
    
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    
    const methodologyText = options.methodology || `
This assessment is based on the Competing Values Framework (CVF) and uses the 
Organizational Culture Assessment Instrument (OCAI). The CVF identifies four 
distinct culture types:

• Clan (Collaborate): Focus on collaboration, teamwork, and employee development
• Adhocracy (Create): Emphasis on innovation, creativity, and adaptability  
• Market (Compete): Results-oriented, competitive, and customer-focused
• Hierarchy (Control): Structured, controlled, and process-oriented

Participants rated their organization's current culture and preferred culture 
across six dimensions using a split-100 allocation method. All demographic 
breakdowns are protected by k-anonymity (k≥7) to ensure individual privacy.

Results are aggregated using mean scores and should be interpreted as indicative 
rather than determinative, especially for smaller sample sizes.
    `.trim()

    const splitText = doc.splitTextToSize(methodologyText, 170)
    doc.text(splitText, 20, 50)
  }

  private static addParticipationStatsPage(doc: jsPDF, options: PDFExportOptions) {
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('Participation Statistics', 20, 30)
    
    // Stats table
    doc.autoTable({
      startY: 50,
      head: [['Metric', 'Value']],
      body: [
        ['Total Invited', options.participationStats.totalInvited.toString()],
        ['Total Responded', options.participationStats.totalResponded.toString()],
        ['Participation Rate', `${Math.round(options.participationStats.participationRate * 100)}%`],
        ['Response Date Range', 'See individual responses'],
        ['K-Anonymity Threshold', '7 responses minimum']
      ],
      styles: {
        fontSize: 12,
        cellPadding: 8
      },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontStyle: 'bold'
      }
    })
  }

  private static addOrgOverviewPage(doc: jsPDF, options: PDFExportOptions) {
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('Organization Overview', 20, 30)
    
    const orgData = options.aggregates.find(agg => agg.sliceKey === 'whole_org')
    if (!orgData) return
    
    // Current vs Preferred scores
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Current vs Preferred Culture Scores', 20, 60)
    
    doc.autoTable({
      startY: 70,
      head: [['Culture Type', 'Current (%)', 'Preferred (%)', 'Delta (%)']],
      body: [
        ['Clan (Collaborate)', orgData.currentClan.toFixed(1), orgData.preferredClan.toFixed(1), orgData.delta.Clan.toFixed(1)],
        ['Adhocracy (Create)', orgData.currentAdhocracy.toFixed(1), orgData.preferredAdhocracy.toFixed(1), orgData.delta.Adhocracy.toFixed(1)],
        ['Market (Compete)', orgData.currentMarket.toFixed(1), orgData.preferredMarket.toFixed(1), orgData.delta.Market.toFixed(1)],
        ['Hierarchy (Control)', orgData.currentHierarchy.toFixed(1), orgData.preferredHierarchy.toFixed(1), orgData.delta.Hierarchy.toFixed(1)]
      ],
      styles: {
        fontSize: 11,
        cellPadding: 6
      },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontStyle: 'bold'
      }
    })
    
    // Sample size info
    doc.setFontSize(10)
    doc.setFont('helvetica', 'italic')
    doc.text(`Sample size: ${orgData.n} responses`, 20, doc.lastAutoTable.finalY + 10)
  }

  private static addDemographicSlicesPage(doc: jsPDF, options: PDFExportOptions) {
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('Demographic Breakdowns', 20, 30)
    
    const demographicSlices = options.aggregates.filter(agg => agg.sliceKey !== 'whole_org')
    
    if (demographicSlices.length === 0) {
      doc.setFontSize(12)
      doc.setFont('helvetica', 'normal')
      doc.text('No demographic breakdowns available (insufficient sample sizes)', 20, 50)
      return
    }
    
    // Group by demographic type
    const groupedSlices = demographicSlices.reduce((acc, slice) => {
      const type = slice.sliceKey.split(':')[0]
      if (!acc[type]) acc[type] = []
      acc[type].push(slice)
      return acc
    }, {} as Record<string, AggregateData[]>)
    
    let currentY = 50
    
    Object.entries(groupedSlices).forEach(([type, slices]) => {
      if (currentY > 250) {
        doc.addPage()
        currentY = 30
      }
      
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text(type.charAt(0).toUpperCase() + type.slice(1), 20, currentY)
      currentY += 15
      
      doc.autoTable({
        startY: currentY,
        head: [['Group', 'Sample Size', 'Clan', 'Adhocracy', 'Market', 'Hierarchy']],
        body: slices.map(slice => [
          slice.sliceLabel,
          slice.n.toString(),
          slice.currentClan.toFixed(1),
          slice.currentAdhocracy.toFixed(1),
          slice.currentMarket.toFixed(1),
          slice.currentHierarchy.toFixed(1)
        ]),
        styles: {
          fontSize: 10,
          cellPadding: 4
        },
        headStyles: {
          fillColor: [107, 114, 128],
          textColor: 255,
          fontStyle: 'bold'
        }
      })
      
      currentY = doc.lastAutoTable.finalY + 15
    })
  }

  private static addDeltaSummaryPage(doc: jsPDF, options: PDFExportOptions) {
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('Change Required (Delta Analysis)', 20, 30)
    
    const orgData = options.aggregates.find(agg => agg.sliceKey === 'whole_org')
    if (!orgData) return
    
    // Delta summary table
    doc.autoTable({
      startY: 50,
      head: [['Culture Type', 'Current Score', 'Preferred Score', 'Change Required', 'Priority']],
      body: Object.entries(orgData.delta)
        .sort(([,a], [,b]) => Math.abs(b) - Math.abs(a))
        .map(([culture, delta]) => [
          culture,
          (orgData[`current${culture}` as keyof AggregateData] as number).toFixed(1) + '%',
          (orgData[`preferred${culture}` as keyof AggregateData] as number).toFixed(1) + '%',
          (delta > 0 ? '+' : '') + delta.toFixed(1) + '%',
          Math.abs(delta) >= 10 ? 'High' : Math.abs(delta) >= 5 ? 'Medium' : 'Low'
        ]),
      styles: {
        fontSize: 11,
        cellPadding: 6
      },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontStyle: 'bold'
      }
    })
    
    // Key insights
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Key Insights:', 20, doc.lastAutoTable.finalY + 20)
    
    const insights = this.generateInsights(orgData)
    const splitInsights = doc.splitTextToSize(insights, 170)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(splitInsights, 20, doc.lastAutoTable.finalY + 35)
  }

  private static addNotesPage(doc: jsPDF, options: PDFExportOptions) {
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('Additional Notes', 20, 30)
    
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    
    const splitNotes = doc.splitTextToSize(options.notes || '', 170)
    doc.text(splitNotes, 20, 50)
  }

  private static generateInsights(data: AggregateData): string {
    const insights = []
    
    // Find dominant current culture
    const currentScores = {
      Clan: data.currentClan,
      Adhocracy: data.currentAdhocracy,
      Market: data.currentMarket,
      Hierarchy: data.currentHierarchy
    }
    const currentDominant = Object.entries(currentScores)
      .sort(([,a], [,b]) => b - a)[0]
    
    // Find dominant preferred culture
    const preferredScores = {
      Clan: data.preferredClan,
      Adhocracy: data.preferredAdhocracy,
      Market: data.preferredMarket,
      Hierarchy: data.preferredHierarchy
    }
    const preferredDominant = Object.entries(preferredScores)
      .sort(([,a], [,b]) => b - a)[0]
    
    insights.push(`• Current dominant culture: ${currentDominant[0]} (${currentDominant[1].toFixed(1)}%)`)
    insights.push(`• Preferred dominant culture: ${preferredDominant[0]} (${preferredDominant[1].toFixed(1)}%)`)
    
    // Significant changes
    const significantChanges = Object.entries(data.delta)
      .filter(([, delta]) => Math.abs(delta) >= 5)
      .sort(([,a], [,b]) => Math.abs(b) - Math.abs(a))
    
    if (significantChanges.length > 0) {
      insights.push(`• Largest desired change: ${significantChanges[0][0]} (${significantChanges[0][1] > 0 ? '+' : ''}${significantChanges[0][1].toFixed(1)}%)`)
    }
    
    // Congruence
    const avgCongruence = Object.values(data.congruenceIndicators).reduce((sum, val) => sum + val, 0) / 4
    insights.push(`• Cultural congruence: ${Math.round(avgCongruence * 100)}%`)
    
    return insights.join('\n')
  }
}
