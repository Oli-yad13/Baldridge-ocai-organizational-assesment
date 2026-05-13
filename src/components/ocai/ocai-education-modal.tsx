'use client'

import { useState } from 'react'
import { X, BookOpen, Target, Users, Lightbulb, TrendingUp } from 'lucide-react'

interface OCAIEducationModalProps {
  isOpen: boolean
  onClose: () => void
}

export function OCAIEducationModal({ isOpen, onClose }: OCAIEducationModalProps) {
  if (!isOpen) return null

  const quadrants = [
    {
      name: 'Clan (Collaborate)',
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: Users,
      description: 'Personal, family-like, shared values',
      characteristics: [
        'Emphasizes teamwork and consensus',
        'Values loyalty and tradition',
        'Focuses on human development',
        'Leadership is mentoring and nurturing'
      ]
    },
    {
      name: 'Adhocracy (Create)',
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      icon: Lightbulb,
      description: 'Dynamic, entrepreneurial, innovative',
      characteristics: [
        'Encourages innovation and risk-taking',
        'Values creativity and uniqueness',
        'Focuses on new challenges and opportunities',
        'Leadership is entrepreneurial and visionary'
      ]
    },
    {
      name: 'Market (Compete)',
      color: 'bg-red-100 text-red-800 border-red-200',
      icon: Target,
      description: 'Results-oriented, competitive, achievement-focused',
      characteristics: [
        'Emphasizes competition and winning',
        'Values achievement and goal accomplishment',
        'Focuses on market leadership',
        'Leadership is aggressive and results-oriented'
      ]
    },
    {
      name: 'Hierarchy (Control)',
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: TrendingUp,
      description: 'Controlled, structured, formal procedures',
      characteristics: [
        'Emphasizes control and stability',
        'Values efficiency and smooth operations',
        'Focuses on formal procedures and policies',
        'Leadership is coordinating and organizing'
      ]
    }
  ]

  const dimensions = [
    {
      name: 'Dominant Characteristics',
      description: 'What the organization emphasizes and rewards',
      question: 'What is most characteristic of your organization?'
    },
    {
      name: 'Leadership',
      description: 'The style of leadership that is generally encouraged',
      question: 'What style of leadership is most valued?'
    },
    {
      name: 'Management of Employees',
      description: 'The management approach and philosophy',
      question: 'How are employees typically managed?'
    },
    {
      name: 'Organization Glue',
      description: 'What holds the organization together',
      question: 'What binds the organization together?'
    },
    {
      name: 'Strategic Emphases',
      description: 'What the organization emphasizes in its strategy',
      question: 'What does the organization emphasize strategically?'
    },
    {
      name: 'Criteria of Success',
      description: 'How the organization defines success',
      question: 'How does the organization define success?'
    }
  ]

  const chartTips = [
    {
      title: 'Reading Radar Charts',
      tips: [
        'Each axis represents one of the four culture types',
        'The further from center, the stronger that culture type',
        'Compare "Now" vs "Preferred" to see desired changes',
        'Look for patterns and dominant culture types'
      ]
    },
    {
      title: 'Understanding Delta Values',
      tips: [
        'Positive delta = desire to increase that culture type',
        'Negative delta = desire to decrease that culture type',
        'Large deltas indicate significant desired change',
        'Small deltas suggest satisfaction with current state'
      ]
    },
    {
      title: 'Interpreting Results',
      tips: [
        'No single culture type is "better" than others',
        'Context matters - different industries favor different types',
        'Balance between types is often ideal',
        'Focus on trends and patterns, not individual scores'
      ]
    }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BookOpen className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Understanding OCAI</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Competing Values Framework */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              The Competing Values Framework
            </h3>
            <p className="text-gray-600 mb-6">
              The OCAI is based on the Competing Values Framework, which identifies four 
              fundamental culture types that exist in every organization. These types 
              represent different values and approaches to work.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quadrants.map((quadrant) => {
                const Icon = quadrant.icon
                return (
                  <div
                    key={quadrant.name}
                    className={`border rounded-lg p-4 ${quadrant.color}`}
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <Icon className="h-5 w-5" />
                      <h4 className="font-semibold">{quadrant.name}</h4>
                    </div>
                    <p className="text-sm mb-3">{quadrant.description}</p>
                    <ul className="text-sm space-y-1">
                      {quadrant.characteristics.map((char, index) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>{char}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>
          </section>

          {/* Six Dimensions */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              The Six Dimensions
            </h3>
            <p className="text-gray-600 mb-6">
              The OCAI assesses organizational culture across six key dimensions. 
              Each dimension has four options representing the four culture types.
            </p>
            
            <div className="space-y-4">
              {dimensions.map((dimension, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">
                        {dimension.name}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        {dimension.description}
                      </p>
                      <p className="text-sm text-gray-500 italic">
                        "{dimension.question}"
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Now vs Preferred */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Now vs Preferred Assessment
            </h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 mb-4">
                The OCAI asks you to complete the assessment twice:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">NOW Assessment</h4>
                  <p className="text-sm text-gray-600">
                    Describe your organization as it currently exists. 
                    How does it actually operate today?
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">PREFERRED Assessment</h4>
                  <p className="text-sm text-gray-600">
                    Describe your organization as you would like it to be. 
                    What would be ideal for the future?
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Chart Reading Tips */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Reading Your Results
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {chartTips.map((tip, index) => (
                <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">{tip.title}</h4>
                  <ul className="text-sm text-gray-600 space-y-2">
                    {tip.tips.map((tipText, tipIndex) => (
                      <li key={tipIndex} className="flex items-start">
                        <span className="mr-2 text-blue-500">•</span>
                        <span>{tipText}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* Methodology Note */}
          <section className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-800 mb-2">Important Notes</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• There are no "right" or "wrong" culture types</li>
              <li>• Different industries and contexts favor different types</li>
              <li>• The goal is understanding, not judgment</li>
              <li>• Results should be used for discussion and planning, not evaluation</li>
            </ul>
          </section>
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  )
}
