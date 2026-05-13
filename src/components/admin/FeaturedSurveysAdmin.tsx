'use client'

import React, { useEffect, useState } from 'react'
import { Loader2, CheckCircle, Eye, AlertTriangle, ToggleLeft, ToggleRight, Trash2, X } from 'lucide-react'

export default function FeaturedSurveysAdmin() {
    const [surveys, setSurveys] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string } | null>(null)

    useEffect(() => {
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
            const user = JSON.parse(storedUser)
            fetchSurveys(user.id)
        }
    }, [])

    const fetchSurveys = async (userId: string) => {
        try {
            const res = await fetch('/api/admin/featured-surveys', {
                headers: { 'X-User-Id': userId }
            })
            if (res.ok) {
                const data = await res.json()
                setSurveys(data)
            }
        } catch (error) {
            console.error('Error fetching surveys:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleApprove = async (id: string) => {
        if (!confirm('Are you sure you want to approve and publish the pending changes?')) return

        const storedUser = localStorage.getItem('user')
        if (!storedUser) return
        const userId = JSON.parse(storedUser).id

        setActionLoading(id)
        try {
            const res = await fetch('/api/admin/featured-surveys', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-Id': userId
                },
                body: JSON.stringify({ id, action: 'approve_content' }),
            })
            if (res.ok) {
                fetchSurveys(userId)
            }
        } catch (error) {
            console.error('Error approving content:', error)
        } finally {
            setActionLoading(null)
        }
    }

    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        const newStatus = !currentStatus

        const storedUser = localStorage.getItem('user')
        if (!storedUser) return
        const userId = JSON.parse(storedUser).id

        setActionLoading(id)
        try {
            const res = await fetch('/api/admin/featured-surveys', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-Id': userId
                },
                body: JSON.stringify({ id, action: 'toggle_status', isActive: newStatus }),
            })
            if (res.ok) {
                fetchSurveys(userId)
            }
        } catch (error) {
            console.error('Error toggling status:', error)
        } finally {
            setActionLoading(null)
        }
    }

    const handleDelete = async (id: string) => {
        const storedUser = localStorage.getItem('user')
        if (!storedUser) return
        const userId = JSON.parse(storedUser).id

        setActionLoading(id)
        try {
            const res = await fetch(`/api/admin/featured-surveys?id=${id}`, {
                method: 'DELETE',
                headers: {
                    'X-User-Id': userId
                },
            })
            if (res.ok) {
                setDeleteConfirm(null)
                fetchSurveys(userId)
            } else {
                const data = await res.json()
                alert(data.error || 'Failed to delete survey')
            }
        } catch (error) {
            console.error('Error deleting survey:', error)
            alert('An error occurred while deleting the survey')
        } finally {
            setActionLoading(null)
        }
    }

    if (loading) {
        return <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-teal-600" /></div>
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Featured Surveys Management</h2>
                <p className="text-sm text-gray-500">Enable or disable surveys to show/hide them on the home page</p>
            </div>

            <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Survey</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Facilitator</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visibility</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pending Changes</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {surveys.map((survey) => (
                            <tr key={survey.id} className={!survey.isActive ? 'bg-gray-50' : ''}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className={`text-sm font-medium ${survey.isActive ? 'text-gray-900' : 'text-gray-500'}`}>{survey.title}</div>
                                    <div className="text-sm text-gray-500">{survey.assessmentType}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{survey.facilitator?.name || 'Unassigned'}</div>
                                    <div className="text-sm text-gray-500">{survey.facilitator?.email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <button
                                        onClick={() => handleToggleStatus(survey.id, survey.isActive)}
                                        disabled={actionLoading === survey.id}
                                        className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all disabled:opacity-50 ${
                                            survey.isActive 
                                                ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                        }`}
                                        title={survey.isActive ? 'Click to disable' : 'Click to enable'}
                                    >
                                        {actionLoading === survey.id ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : survey.isActive ? (
                                            <ToggleRight className="w-5 h-5" />
                                        ) : (
                                            <ToggleLeft className="w-5 h-5" />
                                        )}
                                        <span>{survey.isActive ? 'Enabled' : 'Disabled'}</span>
                                    </button>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {survey.pendingContent ? (
                                        <span className="flex items-center text-yellow-600 text-sm">
                                            <AlertTriangle className="w-4 h-4 mr-1" />
                                            Review Needed
                                        </span>
                                    ) : (
                                        <span className="text-gray-400 text-sm">None</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex items-center justify-end space-x-2">
                                    {survey.pendingContent && (
                                        <button
                                            onClick={() => handleApprove(survey.id)}
                                            disabled={actionLoading === survey.id}
                                                className="inline-flex items-center px-3 py-1.5 bg-teal-50 text-teal-700 rounded-lg hover:bg-teal-100 disabled:opacity-50 transition-colors"
                                            title="Approve Changes"
                                        >
                                                <CheckCircle className="w-4 h-4 mr-1" />
                                                Approve
                                        </button>
                                    )}

                                    <a
                                        href={`/admin/featured-surveys/${survey.id}/results`}
                                            className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                                        title="View Results"
                                    >
                                            <Eye className="w-4 h-4 mr-1" />
                                            Results
                                    </a>

                                    <button
                                            onClick={() => setDeleteConfirm({ id: survey.id, title: survey.title })}
                                        disabled={actionLoading === survey.id}
                                            className="inline-flex items-center px-3 py-1.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 disabled:opacity-50 transition-colors"
                                            title="Delete Survey"
                                    >
                                            <Trash2 className="w-4 h-4" />
                                    </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-800 mb-2">How it works:</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                    <li>• <strong>Enabled</strong> surveys appear on the home page for users to take</li>
                    <li>• <strong>Disabled</strong> surveys are hidden from the home page but data is preserved</li>
                    <li>• Click the toggle button to enable or disable a survey</li>
                    <li>• <strong>Delete</strong> will permanently remove the survey and all associated data</li>
                </ul>
            </div>

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
                        <div className="bg-red-50 px-6 py-4 border-b border-red-100">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-red-800 flex items-center">
                                    <Trash2 className="w-5 h-5 mr-2" />
                                    Delete Survey
                                </h3>
                                <button
                                    onClick={() => setDeleteConfirm(null)}
                                    className="text-red-600 hover:text-red-800 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <div className="px-6 py-5">
                            <p className="text-gray-700 mb-2">
                                Are you sure you want to delete this survey?
                            </p>
                            <p className="text-sm text-gray-500 mb-4">
                                Survey: <strong className="text-gray-900">{deleteConfirm.title}</strong>
                            </p>
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                                <p className="text-sm text-yellow-800">
                                    <strong>Warning:</strong> This action cannot be undone. All survey data and responses will be permanently deleted.
                                </p>
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(deleteConfirm.id)}
                                disabled={actionLoading === deleteConfirm.id}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 flex items-center"
                            >
                                {actionLoading === deleteConfirm.id ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Delete Survey
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
