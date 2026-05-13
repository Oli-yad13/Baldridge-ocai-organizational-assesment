'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Save, AlertCircle, CheckCircle, LayoutDashboard, FileEdit, BarChart3, LogOut } from 'lucide-react'
import QuestionEditor from '@/components/facilitator/QuestionEditor'
import ResultsView from '@/components/facilitator/ResultsView'

export default function FacilitatorDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [survey, setSurvey] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'editor' | 'results'>('overview')
  const [editorTab, setEditorTab] = useState<string>('employer')
  const [editedContent, setEditedContent] = useState<any>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (!storedUser) {
      router.push('/auth/signin')
      return
    }

    const parsedUser = JSON.parse(storedUser)
    if (parsedUser.role !== 'FACILITATOR') {
      router.push('/')
      return
    }

    setUser(parsedUser)
    fetchData(parsedUser.id)
  }, [router])

  const fetchData = async (userId: string) => {
    try {
      setLoading(true)
      const [surveyRes, statsRes] = await Promise.all([
        fetch('/api/facilitator/survey', { headers: { 'X-User-Id': userId } }),
        fetch('/api/facilitator/stats', { headers: { 'X-User-Id': userId } })
      ])

      if (surveyRes.ok) {
        const data = await surveyRes.json()
        setSurvey(data)
        // Initialize editor with current content or pending content if exists
        const contentToEdit = data.pendingContent || data.content
        setEditedContent(contentToEdit)

        // Set initial editor tab based on survey type
        if (data.assessmentType === 'SANKOFA') {
          setEditorTab('cso')
        } else {
          setEditorTab('employer')
        }
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)

    try {
      const res = await fetch('/api/facilitator/survey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': user.id
        },
        body: JSON.stringify({ content: editedContent }),
      })

      if (res.ok) {
        setMessage({ type: 'success', text: 'Changes submitted for admin approval' })
        fetchData(user.id) // Refresh to show pending state
      } else {
        setMessage({ type: 'error', text: 'Failed to save changes' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred' })
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = () => {
    localStorage.removeItem('user')
    router.push('/')
  }

  const updateQuestion = (sectionId: string, questionIndex: number, updatedQuestion: any) => {
    const newContent = { ...editedContent }
    const sections = newContent[editorTab].sections
    const sectionIndex = sections.findIndex((s: any) => s.id === sectionId)

    if (sectionIndex !== -1) {
      sections[sectionIndex].questions[questionIndex] = updatedQuestion
      setEditedContent(newContent)
    }
  }

  const deleteQuestion = (sectionId: string, questionIndex: number) => {
    if (!confirm('Are you sure you want to delete this question?')) return

    const newContent = { ...editedContent }
    const sections = newContent[editorTab].sections
    const sectionIndex = sections.findIndex((s: any) => s.id === sectionId)

    if (sectionIndex !== -1) {
      sections[sectionIndex].questions.splice(questionIndex, 1)
      setEditedContent(newContent)
    }
  }

  const addQuestion = (sectionId: string) => {
    const newContent = { ...editedContent }
    const sections = newContent[editorTab].sections
    const sectionIndex = sections.findIndex((s: any) => s.id === sectionId)

    if (sectionIndex !== -1) {
      sections[sectionIndex].questions.push({
        id: `q_${Date.now()}`,
        type: 'text',
        text: 'New Question',
        placeholder: 'Enter answer...'
      })
      setEditedContent(newContent)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-600 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg">
                <LayoutDashboard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Facilitator Dashboard</h1>
                <p className="text-sm text-gray-600">{survey?.title || 'Loading...'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user?.name}</span>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === 'overview'
                ? 'border-teal-500 text-teal-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('results')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === 'results'
                ? 'border-teal-500 text-teal-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Results
            </button>
            <button
              onClick={() => setActiveTab('editor')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === 'editor'
                ? 'border-teal-500 text-teal-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              <FileEdit className="w-4 h-4 mr-2" />
              Edit Content
            </button>
          </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 mr-2" />
            ) : (
              <AlertCircle className="w-5 h-5 mr-2" />
            )}
            {message.text}
          </div>
        )}

        {activeTab === 'overview' && stats && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Welcome back, {user?.name}</h2>
              <p className="text-gray-600">
                You are managing the <strong>{survey?.title}</strong>. Use the tabs above to view results or modify the questionnaire content.
              </p>
            </div>
            <ResultsView stats={stats} surveyContent={editedContent || survey?.content} surveyType={survey?.assessmentType} />
          </div>
        )}

        {activeTab === 'results' && stats && (
          <ResultsView stats={stats} surveyContent={editedContent || survey?.content} surveyType={survey?.assessmentType} />
        )}

        {activeTab === 'editor' && editedContent && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex space-x-4 bg-white p-1 rounded-lg border">
                {survey?.assessmentType === 'SANKOFA' ? (
                  <button
                    onClick={() => setEditorTab('cso')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${editorTab === 'cso'
                      ? 'bg-teal-100 text-teal-800'
                      : 'text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    CSO Questionnaire
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setEditorTab('employer')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${editorTab === 'employer'
                        ? 'bg-teal-100 text-teal-800'
                        : 'text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                      Employer Questionnaire
                    </button>
                    <button
                      onClick={() => setEditorTab('employee')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${editorTab === 'employee'
                        ? 'bg-teal-100 text-teal-800'
                        : 'text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                      Employee Questionnaire
                    </button>
                  </>
                )}
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Changes
              </button>
            </div>

            <div className="space-y-8">
              {editedContent[editorTab]?.sections.map((section: any) => (
                <div key={section.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-semibold text-gray-900">{section.title}</h3>
                    <span className="text-xs text-gray-500 uppercase tracking-wider">Section ID: {section.id}</span>
                  </div>
                  <div className="p-6">
                    {section.questions.map((question: any, idx: number) => (
                      <QuestionEditor
                        key={question.id}
                        question={question}
                        onUpdate={(updated) => updateQuestion(section.id, idx, updated)}
                        onDelete={() => deleteQuestion(section.id, idx)}
                      />
                    ))}
                    <button
                      onClick={() => addQuestion(section.id)}
                      className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-teal-500 hover:text-teal-600 transition-colors flex items-center justify-center font-medium"
                    >
                      <FileEdit className="w-4 h-4 mr-2" />
                      Add New Question to "{section.title}"
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
