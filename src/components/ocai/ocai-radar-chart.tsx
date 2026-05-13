'use client'

import { useEffect, useRef } from 'react'
import { Chart, registerables } from 'chart.js'
import { OCAIScores, CULTURE_TYPES } from '@/lib/ocai-data'

// Register Chart.js components
if (typeof window !== 'undefined') {
  Chart.register(...registerables)
}

interface OCAIRadarChartProps {
  scores: OCAIScores
}

export function OCAIRadarChart({ scores }: OCAIRadarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef = useRef<Chart | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    // Destroy existing chart
    if (chartRef.current) {
      chartRef.current.destroy()
    }

    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) return

    chartRef.current = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: Object.keys(scores.now),
        datasets: [
          {
            label: 'Now',
            data: Object.values(scores.now),
            borderColor: '#3B82F6',
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            pointBackgroundColor: '#3B82F6',
            pointBorderColor: '#3B82F6',
            pointHoverBackgroundColor: '#3B82F6',
            pointHoverBorderColor: '#3B82F6',
            borderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6
          },
          {
            label: 'Preferred',
            data: Object.values(scores.preferred),
            borderColor: '#10B981',
            backgroundColor: 'rgba(16, 185, 129, 0.2)',
            pointBackgroundColor: '#10B981',
            pointBorderColor: '#10B981',
            pointHoverBackgroundColor: '#10B981',
            pointHoverBorderColor: '#10B981',
            borderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              usePointStyle: true,
              padding: 20
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `${context.dataset.label}: ${context.parsed.r}%`
              }
            }
          }
        },
        scales: {
          r: {
            beginAtZero: true,
            min: 0,
            max: 100,
            ticks: {
              stepSize: 20,
              callback: function(value) {
                return value + '%'
              }
            },
            pointLabels: {
              font: {
                size: 12,
                weight: 'bold'
              },
              color: '#374151'
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            },
            angleLines: {
              color: 'rgba(0, 0, 0, 0.1)'
            }
          }
        },
        elements: {
          line: {
            tension: 0.1
          }
        }
      }
    })

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy()
      }
    }
  }, [scores])

  return (
    <div className="relative h-80">
      <canvas ref={canvasRef} />
    </div>
  )
}
