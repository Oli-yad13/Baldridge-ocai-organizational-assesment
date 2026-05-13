import jsPDF from 'jspdf'
import 'jspdf-autotable'
import Papa from 'papaparse'

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF
  }
}

export interface SurveyData {
  id: string
  title: string
  responses: Array<{
    id: string
    demographics: any
    nowScores: {
      clan: number
      adhocracy: number
      market: number
      hierarchy: number
    }
    preferredScores: {
      clan: number
      adhocracy: number
      market: number
      hierarchy: number
    }
    submittedAt: Date
  }>
}

export function exportToCSV(surveyData: SurveyData): string {
  const csvData = surveyData.responses.map((response, index) => ({
    'Response ID': response.id,
    'Clan (Current)': response.nowScores.clan,
    'Adhocracy (Current)': response.nowScores.adhocracy,
    'Market (Current)': response.nowScores.market,
    'Hierarchy (Current)': response.nowScores.hierarchy,
    'Clan (Preferred)': response.preferredScores.clan,
    'Adhocracy (Preferred)': response.preferredScores.adhocracy,
    'Market (Preferred)': response.preferredScores.market,
    'Hierarchy (Preferred)': response.preferredScores.hierarchy,
    'Submitted At': response.submittedAt.toISOString(),
    'Demographics': JSON.stringify(response.demographics || {}),
  }))

  return Papa.unparse(csvData)
}

export function exportToPDF(surveyData: SurveyData): jsPDF {
  const doc = new jsPDF()
  
  // Add title
  doc.setFontSize(20)
  doc.text(surveyData.title, 14, 22)
  
  // Add survey info
  doc.setFontSize(12)
  doc.text(`Total Responses: ${surveyData.responses.length}`, 14, 30)
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 36)
  
  // Add summary statistics
  const currentAverages = calculateAverages(surveyData.responses, 'nowScores')
  const preferredAverages = calculateAverages(surveyData.responses, 'preferredScores')
  
  doc.setFontSize(14)
  doc.text('Summary Statistics', 14, 50)
  
  doc.setFontSize(10)
  doc.text(`Current Culture:`, 14, 60)
  doc.text(`Clan: ${currentAverages.clan.toFixed(1)}`, 20, 66)
  doc.text(`Adhocracy: ${currentAverages.adhocracy.toFixed(1)}`, 20, 72)
  doc.text(`Market: ${currentAverages.market.toFixed(1)}`, 20, 78)
  doc.text(`Hierarchy: ${currentAverages.hierarchy.toFixed(1)}`, 20, 84)
  
  doc.text(`Preferred Culture:`, 14, 94)
  doc.text(`Clan: ${preferredAverages.clan.toFixed(1)}`, 20, 100)
  doc.text(`Adhocracy: ${preferredAverages.adhocracy.toFixed(1)}`, 20, 106)
  doc.text(`Market: ${preferredAverages.market.toFixed(1)}`, 20, 112)
  doc.text(`Hierarchy: ${preferredAverages.hierarchy.toFixed(1)}`, 20, 118)
  
  // Add new page for detailed data
  doc.addPage()
  
  // Prepare table data
  const tableData = surveyData.responses.map((response) => [
    response.id,
    response.nowScores.clan,
    response.nowScores.adhocracy,
    response.nowScores.market,
    response.nowScores.hierarchy,
    response.preferredScores.clan,
    response.preferredScores.adhocracy,
    response.preferredScores.market,
    response.preferredScores.hierarchy,
    response.submittedAt.toLocaleDateString(),
  ])
  
  // Add table
  doc.autoTable({
    head: [['ID', 'Clan (Now)', 'Adhocracy (Now)', 'Market (Now)', 'Hierarchy (Now)', 
           'Clan (Pref)', 'Adhocracy (Pref)', 'Market (Pref)', 'Hierarchy (Pref)', 'Date']],
    body: tableData,
    startY: 20,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [59, 130, 246] },
  })
  
  return doc
}

function calculateAverages(responses: SurveyData['responses'], scoreType: 'nowScores' | 'preferredScores') {
  const totals = responses.reduce(
    (acc, response) => ({
      clan: acc.clan + response[scoreType].clan,
      adhocracy: acc.adhocracy + response[scoreType].adhocracy,
      market: acc.market + response[scoreType].market,
      hierarchy: acc.hierarchy + response[scoreType].hierarchy,
    }),
    { clan: 0, adhocracy: 0, market: 0, hierarchy: 0 }
  )
  
  const count = responses.length
  
  return {
    clan: totals.clan / count,
    adhocracy: totals.adhocracy / count,
    market: totals.market / count,
    hierarchy: totals.hierarchy / count,
  }
}

export function downloadCSV(csvContent: string, filename: string) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function downloadPDF(pdf: jsPDF, filename: string) {
  pdf.save(filename)
}
