import { Chart } from 'chart.js'

export class ChartExportService {
  static async downloadChartAsPNG(canvas: HTMLCanvasElement, filename: string): Promise<void> {
    const link = document.createElement('a')
    link.download = `${filename}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  static async downloadChartAsSVG(canvas: HTMLCanvasElement, filename: string): Promise<void> {
    // Convert canvas to SVG
    const svg = this.canvasToSVG(canvas)
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.download = `${filename}.svg`
    link.href = url
    link.click()
    
    URL.revokeObjectURL(url)
  }

  static async downloadChartAsPDF(canvas: HTMLCanvasElement, filename: string): Promise<void> {
    const { jsPDF } = await import('jspdf')
    
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({
      orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
      unit: 'mm',
      format: 'a4'
    })
    
    const imgWidth = 210 // A4 width in mm
    const pageHeight = 295 // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight
    
    let position = 0
    
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight
    
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }
    
    pdf.save(`${filename}.pdf`)
  }

  private static canvasToSVG(canvas: HTMLCanvasElement): string {
    const ctx = canvas.getContext('2d')
    if (!ctx) return ''

    const width = canvas.width
    const height = canvas.height
    
    // Get image data
    const imageData = ctx.getImageData(0, 0, width, height)
    const data = imageData.data
    
    // Convert to base64
    const canvas2 = document.createElement('canvas')
    canvas2.width = width
    canvas2.height = height
    const ctx2 = canvas2.getContext('2d')
    if (!ctx2) return ''
    
    ctx2.putImageData(imageData, 0, 0)
    const dataURL = canvas2.toDataURL('image/png')
    
    // Create SVG
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
        <image width="${width}" height="${height}" href="${dataURL}"/>
      </svg>
    `
    
    return svg
  }

  static addDownloadButtons(chart: Chart, containerId: string): void {
    const container = document.getElementById(containerId)
    if (!container) return

    // Remove existing buttons
    const existingButtons = container.querySelector('.chart-download-buttons')
    if (existingButtons) {
      existingButtons.remove()
    }

    // Create button container
    const buttonContainer = document.createElement('div')
    buttonContainer.className = 'chart-download-buttons flex space-x-2 mb-4'
    
    // PNG button
    const pngButton = document.createElement('button')
    pngButton.className = 'px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700'
    pngButton.textContent = 'Download PNG'
    pngButton.onclick = () => this.downloadChartAsPNG(chart.canvas, `chart-${Date.now()}`)
    
    // SVG button
    const svgButton = document.createElement('button')
    svgButton.className = 'px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700'
    svgButton.textContent = 'Download SVG'
    svgButton.onclick = () => this.downloadChartAsSVG(chart.canvas, `chart-${Date.now()}`)
    
    // PDF button
    const pdfButton = document.createElement('button')
    pdfButton.className = 'px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700'
    pdfButton.textContent = 'Download PDF'
    pdfButton.onclick = () => this.downloadChartAsPDF(chart.canvas, `chart-${Date.now()}`)
    
    buttonContainer.appendChild(pngButton)
    buttonContainer.appendChild(svgButton)
    buttonContainer.appendChild(pdfButton)
    
    container.insertBefore(buttonContainer, container.firstChild)
  }

  static createDownloadableChart(
    canvas: HTMLCanvasElement,
    chartConfig: any,
    containerId: string
  ): Chart {
    const chart = new Chart(canvas, chartConfig)
    
    // Add download buttons after chart is created
    setTimeout(() => {
      this.addDownloadButtons(chart, containerId)
    }, 100)
    
    return chart
  }
}
