'use client'

import { useEffect, useRef } from 'react'
import { Chart, registerables } from 'chart.js'
import { AggregateData } from '@/lib/aggregation'

Chart.register(...registerables)

interface SliceChartProps {
  data: AggregateData
}

export function SliceChart({ data }: SliceChartProps) {
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
            pointRadius: 3,
            pointHoverRadius: 5
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
            pointRadius: 3,
            pointHoverRadius: 5
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
              padding: 10,
              font: {
                size: 10
              }
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `${context.dataset.label}: ${context.parsed.r}%`
              }
            },
            titleFont: {
              size: 10
            },
            bodyFont: {
              size: 9
            }
          }
        },
        scales: {
          r: {
            beginAtZero: true,
            min: 0,
            max: 100,
            ticks: {
              stepSize: 25,
              callback: function(value) {
                return value + '%'
              },
              font: {
                size: 8
              }
            },
            pointLabels: {
              font: {
                size: 9,
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
  }, [data])

  return (
    <div className="relative h-full">
      <canvas ref={canvasRef} />
    </div>
  )
}
