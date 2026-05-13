'use client'

import { Radar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
)

interface OCAIRadarChartProps {
  currentScores: {
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
  title?: string
}

export function OCAIRadarChart({ 
  currentScores, 
  preferredScores, 
  title = 'OCAI Culture Profile' 
}: OCAIRadarChartProps) {
  const data = {
    labels: ['Clan', 'Adhocracy', 'Market', 'Hierarchy'],
    datasets: [
      {
        label: 'Current',
        data: [
          currentScores.clan,
          currentScores.adhocracy,
          currentScores.market,
          currentScores.hierarchy,
        ],
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(59, 130, 246, 1)',
      },
      {
        label: 'Preferred',
        data: [
          preferredScores.clan,
          preferredScores.adhocracy,
          preferredScores.market,
          preferredScores.hierarchy,
        ],
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(16, 185, 129, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(16, 185, 129, 1)',
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
    },
    scales: {
      r: {
        beginAtZero: true,
        min: 0,
        max: 100,
        ticks: {
          stepSize: 20,
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        angleLines: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
  }

  return (
    <div className="w-full h-96">
      <Radar data={data} options={options} />
    </div>
  )
}
