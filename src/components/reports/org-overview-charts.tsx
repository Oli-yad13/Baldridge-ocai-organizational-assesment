'use client'

import { useEffect, useRef } from 'react'
import { Chart, registerables } from 'chart.js'
import { AggregateData } from '@/lib/aggregation'

Chart.register(...registerables)

interface OrgOverviewChartsProps {
  data: AggregateData
}

export function OrgOverviewCharts({ data }: OrgOverviewChartsProps) {
  const radarCanvasRef = useRef<HTMLCanvasElement>(null)
  const barCanvasRef = useRef<HTMLCanvasElement>(null)
  const radarChartRef = useRef<Chart | null>(null)
  const barChartRef = useRef<Chart | null>(null)

  useEffect(() => {
    if (!radarCanvasRef.current || !barCanvasRef.current) return

    // Destroy existing charts
    if (radarChartRef.current) radarChartRef.current.destroy()
    if (barChartRef.current) barChartRef.current.destroy()

    // Create radar chart
    const radarCtx = radarCanvasRef.current.getContext('2d')
    if (radarCtx) {
      radarChartRef.current = new Chart(radarCtx, {
        type: 'radar',
        data: {
          labels: ['Clan', 'Adhocracy', 'Market', 'Hierarchy'],
          datasets: [
            {
              label: 'Now',
              data: [data.currentClan, data.currentAdhocracy, data.currentMarket, data.currentHierarchy],
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
              data: [data.preferredClan, data.preferredAdhocracy, data.preferredMarket, data.preferredHierarchy],
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
    }

    // Create stacked bar chart
    const barCtx = barCanvasRef.current.getContext('2d')
    if (barCtx) {
      barChartRef.current = new Chart(barCtx, {
        type: 'bar',
        data: {
          labels: ['Clan', 'Adhocracy', 'Market', 'Hierarchy'],
          datasets: [
            {
              label: 'Current',
              data: [data.currentClan, data.currentAdhocracy, data.currentMarket, data.currentHierarchy],
              backgroundColor: '#3B82F6',
              borderColor: '#3B82F6',
              borderWidth: 1
            },
            {
              label: 'Preferred',
              data: [data.preferredClan, data.preferredAdhocracy, data.preferredMarket, data.preferredHierarchy],
              backgroundColor: '#10B981',
              borderColor: '#10B981',
              borderWidth: 1
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
                  return `${context.dataset.label}: ${context.parsed.y}%`
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
              max: 100,
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
          }
        }
      })
    }

    return () => {
      if (radarChartRef.current) radarChartRef.current.destroy()
      if (barChartRef.current) barChartRef.current.destroy()
    }
  }, [data])

  return (
    <div className="space-y-6">
      <div className="relative h-80">
        <canvas ref={radarCanvasRef} />
      </div>
      <div className="relative h-80">
        <canvas ref={barCanvasRef} />
      </div>
    </div>
  )
}
