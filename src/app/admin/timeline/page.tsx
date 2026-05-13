'use client'

import { useState } from 'react'
import { CheckCircle, Clock, Calendar, Users, BarChart3, FileText, Settings } from 'lucide-react'

interface TimelinePhase {
  id: string
  name: string
  description: string
  duration: string
  icon: any
  tasks: TimelineTask[]
  dependencies?: string[]
}

interface TimelineTask {
  id: string
  name: string
  description: string
  completed: boolean
  estimatedTime: string
  assignee?: string
  priority: 'low' | 'medium' | 'high' | 'critical'
}

export default function TimelinePage() {
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set())

  const phases: TimelinePhase[] = [
    {
      id: 'planning',
      name: 'Planning Phase',
      description: 'Initial setup and survey design',
      duration: '1-2 weeks',
      icon: Settings,
      tasks: [
        {
          id: 'plan-1',
          name: 'Define survey objectives',
          description: 'Clearly articulate what you want to learn from the culture assessment',
          completed: completedTasks.has('plan-1'),
          estimatedTime: '2-4 hours',
          priority: 'critical'
        },
        {
          id: 'plan-2',
          name: 'Set up organization profile',
          description: 'Configure organization settings, branding, and data retention policies',
          completed: completedTasks.has('plan-2'),
          estimatedTime: '1-2 hours',
          priority: 'high'
        },
        {
          id: 'plan-3',
          name: 'Create survey',
          description: 'Set up the OCAI survey with appropriate settings and demographics',
          completed: completedTasks.has('plan-3'),
          estimatedTime: '1-2 hours',
          priority: 'high'
        },
        {
          id: 'plan-4',
          name: 'Review and test survey',
          description: 'Test the survey flow and ensure all questions are clear',
          completed: completedTasks.has('plan-4'),
          estimatedTime: '1 hour',
          priority: 'medium'
        }
      ]
    },
    {
      id: 'communication',
      name: 'Communication Phase',
      description: 'Announce and prepare for survey launch',
      duration: '1 week',
      icon: Users,
      dependencies: ['planning'],
      tasks: [
        {
          id: 'comm-1',
          name: 'Draft communication plan',
          description: 'Create messaging about the survey purpose, process, and timeline',
          completed: completedTasks.has('comm-1'),
          estimatedTime: '2-3 hours',
          priority: 'high'
        },
        {
          id: 'comm-2',
          name: 'Send pre-survey announcement',
          description: 'Notify employees about the upcoming culture assessment',
          completed: completedTasks.has('comm-2'),
          estimatedTime: '1 hour',
          priority: 'high'
        },
        {
          id: 'comm-3',
          name: 'Schedule information sessions',
          description: 'Plan Q&A sessions to address employee questions',
          completed: completedTasks.has('comm-3'),
          estimatedTime: '2-3 hours',
          priority: 'medium'
        },
        {
          id: 'comm-4',
          name: 'Prepare managers and supervisors',
          description: 'Brief leadership on the survey and their role in encouraging participation',
          completed: completedTasks.has('comm-4'),
          estimatedTime: '1-2 hours',
          priority: 'medium'
        }
      ]
    },
    {
      id: 'administration',
      name: 'Survey Administration',
      description: 'Launch and manage the survey period',
      duration: '2-3 weeks',
      icon: BarChart3,
      dependencies: ['communication'],
      tasks: [
        {
          id: 'admin-1',
          name: 'Launch survey',
          description: 'Open the survey and send invitations to all participants',
          completed: completedTasks.has('admin-1'),
          estimatedTime: '30 minutes',
          priority: 'critical'
        },
        {
          id: 'admin-2',
          name: 'Monitor participation rates',
          description: 'Track response rates and identify groups with low participation',
          completed: completedTasks.has('admin-2'),
          estimatedTime: '1 hour daily',
          priority: 'high'
        },
        {
          id: 'admin-3',
          name: 'Send reminder communications',
          description: 'Send periodic reminders to encourage participation',
          completed: completedTasks.has('admin-3'),
          estimatedTime: '30 minutes per reminder',
          priority: 'medium'
        },
        {
          id: 'admin-4',
          name: 'Address technical issues',
          description: 'Respond to any technical problems or questions from participants',
          completed: completedTasks.has('admin-4'),
          estimatedTime: 'Variable',
          priority: 'high'
        },
        {
          id: 'admin-5',
          name: 'Close survey',
          description: 'Close the survey and prepare for data analysis',
          completed: completedTasks.has('admin-5'),
          estimatedTime: '30 minutes',
          priority: 'critical'
        }
      ]
    },
    {
      id: 'workshops',
      name: 'Workshop Phase',
      description: 'Conduct results workshops and action planning',
      duration: '2-4 weeks',
      icon: Users,
      dependencies: ['administration'],
      tasks: [
        {
          id: 'workshop-1',
          name: 'Generate aggregated reports',
          description: 'Run data aggregation and generate organization-wide reports',
          completed: completedTasks.has('workshop-1'),
          estimatedTime: '1-2 hours',
          priority: 'high'
        },
        {
          id: 'workshop-2',
          name: 'Schedule results workshops',
          description: 'Plan and schedule workshops to review results with teams',
          completed: completedTasks.has('workshop-2'),
          estimatedTime: '2-3 hours',
          priority: 'high'
        },
        {
          id: 'workshop-3',
          name: 'Prepare workshop materials',
          description: 'Create presentations and materials for results workshops',
          completed: completedTasks.has('workshop-3'),
          estimatedTime: '4-6 hours',
          priority: 'medium'
        },
        {
          id: 'workshop-4',
          name: 'Conduct leadership briefing',
          description: 'Present results to senior leadership first',
          completed: completedTasks.has('workshop-4'),
          estimatedTime: '2-3 hours',
          priority: 'high'
        },
        {
          id: 'workshop-5',
          name: 'Facilitate team workshops',
          description: 'Conduct workshops with different teams and departments',
          completed: completedTasks.has('workshop-5'),
          estimatedTime: '2-4 hours per workshop',
          priority: 'high'
        },
        {
          id: 'workshop-6',
          name: 'Capture action items',
          description: 'Document themes, insights, and action items from workshops',
          completed: completedTasks.has('workshop-6'),
          estimatedTime: '1-2 hours per workshop',
          priority: 'medium'
        }
      ]
    },
    {
      id: 'reporting',
      name: 'Reporting Phase',
      description: 'Generate final reports and recommendations',
      duration: '1-2 weeks',
      icon: FileText,
      dependencies: ['workshops'],
      tasks: [
        {
          id: 'report-1',
          name: 'Generate comprehensive reports',
          description: 'Create detailed reports with insights and recommendations',
          completed: completedTasks.has('report-1'),
          estimatedTime: '4-6 hours',
          priority: 'high'
        },
        {
          id: 'report-2',
          name: 'Create executive summary',
          description: 'Develop a high-level summary for leadership',
          completed: completedTasks.has('report-2'),
          estimatedTime: '2-3 hours',
          priority: 'high'
        },
        {
          id: 'report-3',
          name: 'Prepare department-specific reports',
          description: 'Generate tailored reports for different departments',
          completed: completedTasks.has('report-3'),
          estimatedTime: '2-4 hours',
          priority: 'medium'
        },
        {
          id: 'report-4',
          name: 'Distribute reports',
          description: 'Share reports with appropriate stakeholders',
          completed: completedTasks.has('report-4'),
          estimatedTime: '1 hour',
          priority: 'medium'
        },
        {
          id: 'report-5',
          name: 'Schedule follow-up meetings',
          description: 'Plan follow-up sessions to discuss implementation',
          completed: completedTasks.has('report-5'),
          estimatedTime: '1-2 hours',
          priority: 'low'
        }
      ]
    }
  ]

  const toggleTask = (taskId: string) => {
    const newCompleted = new Set(completedTasks)
    if (newCompleted.has(taskId)) {
      newCompleted.delete(taskId)
    } else {
      newCompleted.add(taskId)
    }
    setCompletedTasks(newCompleted)
  }

  const getPhaseProgress = (phase: TimelinePhase) => {
    const completedInPhase = phase.tasks.filter(task => completedTasks.has(task.id)).length
    return (completedInPhase / phase.tasks.length) * 100
  }

  const getOverallProgress = () => {
    const allTasks = phases.flatMap(phase => phase.tasks)
    const completedCount = allTasks.filter(task => completedTasks.has(task.id)).length
    return (completedCount / allTasks.length) * 100
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-100'
      case 'high': return 'text-orange-600 bg-orange-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">OCAI Implementation Timeline</h1>
              <p className="text-gray-600">Step-by-step guide for successful culture assessment</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Overall Progress</div>
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(getOverallProgress())}%
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8 px-6">
        {/* Overall Progress Bar */}
        <div className="mb-8 bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Project Progress</h2>
            <span className="text-sm text-gray-500">
              {phases.flatMap(p => p.tasks).filter(t => completedTasks.has(t.id)).length} of {phases.flatMap(p => p.tasks).length} tasks completed
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${getOverallProgress()}%` }}
            ></div>
          </div>
        </div>

        {/* Timeline Phases */}
        <div className="space-y-8">
          {phases.map((phase, phaseIndex) => {
            const Icon = phase.icon
            const progress = getPhaseProgress(phase)
            const isPhaseAccessible = !phase.dependencies || 
              phase.dependencies.every(depId => 
                phases.find(p => p.id === depId)?.tasks.every(t => completedTasks.has(t.id))
              )

            return (
              <div
                key={phase.id}
                className={`bg-white rounded-lg shadow border-l-4 ${
                  isPhaseAccessible ? 'border-blue-500' : 'border-gray-300'
                } ${!isPhaseAccessible ? 'opacity-60' : ''}`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-lg ${
                        isPhaseAccessible ? 'bg-blue-100' : 'bg-gray-100'
                      }`}>
                        <Icon className={`h-6 w-6 ${
                          isPhaseAccessible ? 'text-blue-600' : 'text-gray-400'
                        }`} />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          Phase {phaseIndex + 1}: {phase.name}
                        </h3>
                        <p className="text-gray-600">{phase.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {phase.duration}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {phase.tasks.length} tasks
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">
                        {Math.round(progress)}%
                      </div>
                      <div className="text-sm text-gray-500">Complete</div>
                    </div>
                  </div>

                  {/* Phase Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>

                  {/* Tasks */}
                  <div className="space-y-3">
                    {phase.tasks.map((task) => (
                      <div
                        key={task.id}
                        className={`border rounded-lg p-4 ${
                          completedTasks.has(task.id) 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <button
                            onClick={() => toggleTask(task.id)}
                            disabled={!isPhaseAccessible}
                            className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center ${
                              completedTasks.has(task.id)
                                ? 'bg-green-500 border-green-500 text-white'
                                : 'border-gray-300 hover:border-blue-500'
                            } ${!isPhaseAccessible ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                          >
                            {completedTasks.has(task.id) && (
                              <CheckCircle className="h-3 w-3" />
                            )}
                          </button>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className={`font-medium ${
                                completedTasks.has(task.id) ? 'text-green-800' : 'text-gray-900'
                              }`}>
                                {task.name}
                              </h4>
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                                  {task.priority}
                                </span>
                                <span className="text-sm text-gray-500">
                                  {task.estimatedTime}
                                </span>
                              </div>
                            </div>
                            <p className={`text-sm ${
                              completedTasks.has(task.id) ? 'text-green-700' : 'text-gray-600'
                            }`}>
                              {task.description}
                            </p>
                            {task.assignee && (
                              <div className="mt-2 text-sm text-gray-500">
                                Assigned to: {task.assignee}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Tips and Best Practices */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Best Practices</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Timing</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Allow 2-3 weeks for survey completion</li>
                <li>• Avoid busy periods (holidays, year-end)</li>
                <li>• Schedule workshops within 2 weeks of closing</li>
                <li>• Plan follow-up actions within 30 days</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Communication</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Explain the purpose and value clearly</li>
                <li>• Emphasize confidentiality and anonymity</li>
                <li>• Share how results will be used</li>
                <li>• Provide regular updates on progress</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
