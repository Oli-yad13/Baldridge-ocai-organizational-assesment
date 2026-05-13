'use client'

import { useEffect, useRef } from 'react'
import { Chart, registerables } from 'chart.js'
import { OCAIScores, CULTURE_TYPES } from '@/lib/ocai-data'

// Register Chart.js components
if (typeof window !== 'undefined') {
  Chart.register(...registerables)
}

interface OCAIBarChartProps {
  scores: OCAIScores
}

export function OCAIBarChart({ scores }: OCAIBarChartProps) {
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

    const cultureTypes = Object.keys(scores.delta)
    const deltaValues = Object.values(scores.delta)
    const colors = cultureTypes.map(type => CULTURE_TYPES[type as keyof typeof CULTURE_TYPES].color)

    console.log('OCAI Bar Chart Data:', {
      cultureTypes,
      deltaValues,
      colors,
      scores
    })

    try {
      chartRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: cultureTypes,
        datasets: [
          {
            label: 'Change Required (%)',
            data: deltaValues,
            backgroundColor: colors.map(color => `${color}80`),
            borderColor: colors,
            borderWidth: 2,
            borderRadius: 4,
            borderSkipped: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const value = context.parsed.y
                const sign = value >= 0 ? '+' : ''
                return `Change: ${sign}${value}%`
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              font: {
                size: 12,
                weight: 'bold'
              },
              color: '#374151'
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            },
            ticks: {
              callback: function(value) {
                return value + '%'
              },
              font: {
                size: 11
              },
              color: '#6B7280'
            }
          }
        },
        elements: {
          bar: {
            borderWidth: 2
          }
        }
      }
    })
    } catch (error) {
      console.error('Error creating OCAI bar chart:', error)
    }

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy()
      }
    }
  }, [scores])

  return (
    <div className="relative h-80 w-full">
      <canvas 
        ref={canvasRef} 
        className="w-full h-full"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  )
}
