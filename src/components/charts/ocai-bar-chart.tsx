'use client'

import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface OCAIBarChartProps {
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

export function OCAIBarChart({ 
  currentScores, 
  preferredScores, 
  title = 'OCAI Culture Comparison' 
}: OCAIBarChartProps) {
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
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
      {
        label: 'Preferred',
        data: [
          preferredScores.clan,
          preferredScores.adhocracy,
          preferredScores.market,
          preferredScores.hierarchy,
        ],
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 1,
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
      y: {
        beginAtZero: true,
        min: 0,
        max: 100,
        ticks: {
          stepSize: 20,
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  }

  return (
    <div className="w-full h-96">
      <Bar data={data} options={options} />
    </div>
  )
}
