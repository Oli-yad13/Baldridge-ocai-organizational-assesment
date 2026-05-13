'use client'

import { useEffect, useRef } from 'react'
import { Chart, registerables } from 'chart.js'
import { AggregateData } from '@/lib/aggregation'

Chart.register(...registerables)

interface LeadershipChartProps {
  leadership: AggregateData
  overall: AggregateData
  chartType: 'radar' | 'bars'
}

export function LeadershipChart({ leadership, overall, chartType }: LeadershipChartProps) {
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

    if (chartType === 'radar') {
      chartRef.current = new Chart(ctx, {
        type: 'radar',
        data: {
          labels: ['Clan', 'Adhocracy', 'Market', 'Hierarchy'],
          datasets: [
            {
              label: 'Leadership - Now',
              data: [leadership.currentClan, leadership.currentAdhocracy, leadership.currentMarket, leadership.currentHierarchy],
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
              label: 'Leadership - Preferred',
              data: [leadership.preferredClan, leadership.preferredAdhocracy, leadership.preferredMarket, leadership.preferredHierarchy],
              borderColor: '#1D4ED8',
              backgroundColor: 'rgba(29, 78, 216, 0.2)',
              pointBackgroundColor: '#1D4ED8',
              pointBorderColor: '#1D4ED8',
              pointHoverBackgroundColor: '#1D4ED8',
              pointHoverBorderColor: '#1D4ED8',
              borderWidth: 2,
              pointRadius: 4,
              pointHoverRadius: 6
            },
            {
              label: 'Overall - Now',
              data: [overall.currentClan, overall.currentAdhocracy, overall.currentMarket, overall.currentHierarchy],
              borderColor: '#10B981',
              backgroundColor: 'rgba(16, 185, 129, 0.2)',
              pointBackgroundColor: '#10B981',
              pointBorderColor: '#10B981',
              pointHoverBackgroundColor: '#10B981',
              pointHoverBorderColor: '#10B981',
              borderWidth: 2,
              pointRadius: 4,
              pointHoverRadius: 6
            },
            {
              label: 'Overall - Preferred',
              data: [overall.preferredClan, overall.preferredAdhocracy, overall.preferredMarket, overall.preferredHierarchy],
              borderColor: '#059669',
              backgroundColor: 'rgba(5, 150, 105, 0.2)',
              pointBackgroundColor: '#059669',
              pointBorderColor: '#059669',
              pointHoverBackgroundColor: '#059669',
              pointHoverBorderColor: '#059669',
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
              position: 'bottom',
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
    } else {
      chartRef.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Clan', 'Adhocracy', 'Market', 'Hierarchy'],
          datasets: [
            {
              label: 'Leadership - Now',
              data: [leadership.currentClan, leadership.currentAdhocracy, leadership.currentMarket, leadership.currentHierarchy],
              backgroundColor: '#3B82F6',
              borderColor: '#3B82F6',
              borderWidth: 1
            },
            {
              label: 'Leadership - Preferred',
              data: [leadership.preferredClan, leadership.preferredAdhocracy, leadership.preferredMarket, leadership.preferredHierarchy],
              backgroundColor: '#1D4ED8',
              borderColor: '#1D4ED8',
              borderWidth: 1
            },
            {
              label: 'Overall - Now',
              data: [overall.currentClan, overall.currentAdhocracy, overall.currentMarket, overall.currentHierarchy],
              backgroundColor: '#10B981',
              borderColor: '#10B981',
              borderWidth: 1
            },
            {
              label: 'Overall - Preferred',
              data: [overall.preferredClan, overall.preferredAdhocracy, overall.preferredMarket, overall.preferredHierarchy],
              backgroundColor: '#059669',
              borderColor: '#059669',
              borderWidth: 1
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
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
      if (chartRef.current) {
        chartRef.current.destroy()
      }
    }
  }, [leadership, overall, chartType])

  return (
    <div className="relative h-full">
      <canvas ref={canvasRef} />
    </div>
  )
}
