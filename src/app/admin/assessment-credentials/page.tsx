'use client'

import { useState, useEffect } from 'react'
import { Upload, Download, Key, AlertCircle, CheckCircle, XCircle, Calendar, Users } from 'lucide-react'
import { useLocale } from '@/lib/i18n/context'
import LanguageSwitcher from '@/components/localization/LanguageSwitcher'

interface Organization {
  id: string
  name: string
}

interface Batch {
  batchId: string
  batchName: string | null
  organizationId: string
  organizationName: string
  assessmentTypes: string
  expiresAt: string
  createdAt: string
  credentials: Array<{
    id: string
    email: string
    isActive: boolean
    loginCount: number
    lastUsedAt: string | null
  }>
  stats: {
    total: number
    used: number
    unused: number
    expired: boolean
  }
}

export default function AssessmentCredentialsPage() {
  const { t } = useLocale()
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [batches, setBatches] = useState<Batch[]>([])
  const [selectedOrg, setSelectedOrg] = useState('')
  const [ocaiChecked, setOcaiChecked] = useState(false)
  const [baldrigeChecked, setBaldrigeChecked] = useState(false)
  const [expiresAt, setExpiresAt] = useState('')
  const [batchName, setBatchName] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<any>(null)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Get user from localStorage
      const storedUser = localStorage.getItem('user')
      if (!storedUser) {
        window.location.href = '/auth/signin'
        return
      }
      
      const user = JSON.parse(storedUser)
      const headers = {
        'x-user-id': user.id
      }

      // Load organizations
      const orgsRes = await fetch('/api/admin/organizations', { headers })
      const orgsData = await orgsRes.json()
      setOrganizations(orgsData.organizations || [])

      // Load batches
      const batchesRes = await fetch('/api/admin/assessment-credentials', { headers })
      const batchesData = await batchesRes.json()
      setBatches(batchesData.batches || [])

      setIsLoading(false)
    } catch (error) {
      console.error('Error loading data:', error)
      setIsLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.name.endsWith('.csv') || selectedFile.name.endsWith('.xlsx')) {
        setFile(selectedFile)
        setUploadResult(null)
        setValidationErrors([])
      } else {
        alert('Please select a CSV or Excel file')
      }
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!file || !selectedOrg || (!ocaiChecked && !baldrigeChecked) || !expiresAt) {
      alert('Please fill in all required fields')
      return
    }

    setIsUploading(true)
    setUploadResult(null)
    setValidationErrors([])

    try {
      // Get user from localStorage
      const storedUser = localStorage.getItem('user')
      if (!storedUser) {
        window.location.href = '/auth/signin'
        return
      }
      
      const user = JSON.parse(storedUser)

      const formData = new FormData()
      formData.append('file', file)
      formData.append('organizationId', selectedOrg)
      
      const assessmentTypes = []
      if (ocaiChecked) assessmentTypes.push('OCAI')
      if (baldrigeChecked) assessmentTypes.push('BALDRIGE')
      formData.append('assessmentTypes', assessmentTypes.join(','))
      
      formData.append('expiresAt', expiresAt)
      if (batchName) formData.append('batchName', batchName)

      const response = await fetch('/api/admin/assessment-credentials', {
        method: 'POST',
        headers: {
          'x-user-id': user.id
        },
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        // Only log if there's actual data to show
        if (data && Object.keys(data).length > 0) {
          console.error('Upload failed:', data)
        }
        if (data.validationErrors) {
          setValidationErrors(data.validationErrors)
        }
        setUploadResult({
          success: false,
          error: data?.error || 'Upload failed',
          details: data?.validationErrors ? `${data.invalidCount} validation error(s) found` : undefined
        })
      } else {
        setUploadResult({ 
          success: true, 
          message: data.message,
          created: data.created,
          overwritten: data.overwritten
        })
        
        // Reset form
        setFile(null)
        setSelectedOrg('')
        setOcaiChecked(false)
        setBaldrigeChecked(false)
        setExpiresAt('')
        setBatchName('')
        
        // Reload batches
        await loadData()
      }

    } catch (error) {
      console.error('Error uploading credentials:', error)
      setUploadResult({ success: false, error: 'Upload failed' })
    } finally {
      setIsUploading(false)
    }
  }

  const handleExtendExpiration = async (batchId: string) => {
    const newDate = prompt('Enter new expiration date (YYYY-MM-DD):')
    if (!newDate) return

    try {
      // Get user from localStorage
      const storedUser = localStorage.getItem('user')
      if (!storedUser) {
        window.location.href = '/auth/signin'
        return
      }
      
      const user = JSON.parse(storedUser)

      const response = await fetch(`/api/admin/assessment-credentials/${batchId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': user.id
        },
        body: JSON.stringify({ expiresAt: newDate })
      })

      const data = await response.json()

      if (response.ok) {
        alert(data.message)
        await loadData()
      } else {
        alert(data.error)
      }
    } catch (error) {
      alert('Failed to extend expiration')
    }
  }

  const handleDeactivateBatch = async (batchId: string) => {
    if (!confirm('Are you sure you want to delete this batch?')) return

    try {
      // Get user from localStorage
      const storedUser = localStorage.getItem('user')
      if (!storedUser) {
        window.location.href = '/auth/signin'
        return
      }
      
      const user = JSON.parse(storedUser)

      const response = await fetch(`/api/admin/assessment-credentials/${batchId}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': user.id
        }
      })

      const data = await response.json()

      if (response.ok) {
        alert(data.message)
        await loadData()
      } else {
        alert(data.error)
      }
    } catch (error) {
      alert('Failed to delete batch')
    }
  }

  const downloadSampleCSV = () => {
    const csv = `email,password
john.doe@company.com,temp123
jane.smith@company.com,temp456
bob.johnson@company.com,temp789`
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'sample-credentials.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('credentials.title')}</h1>
            <p className="mt-2 text-gray-600">
              {t('credentials.subtitle')}
            </p>
          </div>
          <LanguageSwitcher />
        </div>

        {/* Upload Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Upload className="w-5 h-5 mr-2 text-blue-600" />
            {t('credentials.upload')}
          </h2>

          <form onSubmit={handleUpload} className="space-y-6">
            {/* Organization Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('common.organization')} <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedOrg}
                onChange={(e) => setSelectedOrg(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium"
                required
              >
                <option value="" className="text-gray-500">{t('accessKeys.selectOrganization')}</option>
                {organizations.map(org => (
                  <option key={org.id} value={org.id} className="text-gray-900">{org.name}</option>
                ))}
              </select>
            </div>

            {/* Assessment Type Checkboxes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('accessKeys.assessmentTypes')} <span className="text-red-500">*</span>
              </label>
              <div className="flex space-x-6">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ocaiChecked}
                    onChange={(e) => setOcaiChecked(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-gray-900 font-medium">OCAI</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={baldrigeChecked}
                    onChange={(e) => setBaldrigeChecked(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-gray-900 font-medium">Baldrige</span>
                </label>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Select one or both assessment types that users can access
              </p>
            </div>

            {/* Batch Name (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Batch Name <span className="text-gray-400">(optional)</span>
              </label>
              <input
                type="text"
                value={batchName}
                onChange={(e) => setBatchName(e.target.value)}
                placeholder="e.g., Q1 2025 Leadership Team"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Credentials File <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  accept=".csv,.xlsx"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  required
                />
                <button
                  type="button"
                  onClick={downloadSampleCSV}
                  className="flex items-center px-4 py-2 text-sm text-blue-600 hover:text-blue-700 border border-blue-300 rounded-md hover:bg-blue-50 transition-colors whitespace-nowrap"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Sample CSV
                </button>
              </div>
              {file && (
                <p className="mt-2 text-sm text-green-600">
                  <CheckCircle className="w-4 h-4 inline mr-1" />
                  {file.name} selected
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Required format: CSV with columns "email,password"
              </p>
            </div>

            {/* Expiration Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expires On <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium"
                required
              />
            </div>

            {/* Upload Result */}
            {uploadResult && (
              <div className={`p-4 rounded-md ${uploadResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                {uploadResult.success ? (
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-green-800">{uploadResult.message}</p>
                      <p className="text-xs text-green-700 mt-1">
                        Created: {uploadResult.created} credentials
                        {uploadResult.overwritten > 0 && ` • Overwritten: ${uploadResult.overwritten}`}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start">
                    <XCircle className="w-5 h-5 text-red-600 mt-0.5 mr-2" />
                    <p className="text-sm font-medium text-red-800">{uploadResult.error}</p>
                  </div>
                )}
              </div>
            )}

            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <div className="flex items-start mb-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-2" />
                  <p className="text-sm font-medium text-yellow-800">
                    Validation Errors ({validationErrors.length})
                  </p>
                </div>
                <ul className="list-disc list-inside text-xs text-yellow-700 space-y-1 ml-7">
                  {validationErrors.slice(0, 10).map((error, i) => (
                    <li key={i}>{error}</li>
                  ))}
                  {validationErrors.length > 10 && (
                    <li className="text-yellow-600">... and {validationErrors.length - 10} more errors</li>
                  )}
                </ul>
              </div>
            )}

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isUploading || !file || !selectedOrg || (!ocaiChecked && !baldrigeChecked) || !expiresAt}
                className="w-full flex justify-center items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5 mr-2" />
                    Upload & Create Credentials
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Existing Batches */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Key className="w-5 h-5 mr-2 text-blue-600" />
            Credential Batches ({batches.length})
          </h2>

          {batches.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Key className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No credential batches yet</p>
              <p className="text-sm">Upload your first CSV file to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {batches.map(batch => (
                <div
                  key={batch.batchId}
                  className={`border rounded-lg p-4 ${batch.stats.expired ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {batch.batchName || 'Unnamed Batch'}
                      </h3>
                      <p className="text-sm text-gray-600">{batch.organizationName}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Batch ID: {batch.batchId}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleExtendExpiration(batch.batchId)}
                        className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 border border-blue-300 rounded-md transition-colors"
                      >
                        Extend
                      </button>
                      <button
                        onClick={() => handleDeactivateBatch(batch.batchId)}
                        className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 border border-red-300 rounded-md transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-gray-50 rounded-md p-3">
                      <p className="text-xs text-gray-500">Total</p>
                      <p className="text-xl font-bold text-gray-900">{batch.stats.total}</p>
                    </div>
                    <div className="bg-green-50 rounded-md p-3">
                      <p className="text-xs text-green-600">Used</p>
                      <p className="text-xl font-bold text-green-700">{batch.stats.used}</p>
                    </div>
                    <div className="bg-blue-50 rounded-md p-3">
                      <p className="text-xs text-blue-600">Unused</p>
                      <p className="text-xl font-bold text-blue-700">{batch.stats.unused}</p>
                    </div>
                    <div className={`rounded-md p-3 ${batch.stats.expired ? 'bg-red-50' : 'bg-gray-50'}`}>
                      <p className={`text-xs ${batch.stats.expired ? 'text-red-600' : 'text-gray-500'}`}>
                        {batch.stats.expired ? 'Expired' : 'Expires'}
                      </p>
                      <p className={`text-sm font-medium ${batch.stats.expired ? 'text-red-700' : 'text-gray-900'}`}>
                        {new Date(batch.expiresAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Created: {new Date(batch.createdAt).toLocaleDateString()}
                    </span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                      {batch.assessmentTypes}
                    </span>
                  </div>

                  {/* Expandable Credentials List */}
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-700">
                      View Credentials ({batch.credentials.length})
                    </summary>
                    <div className="mt-3 overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Logins</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Last Used</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {batch.credentials.map(cred => (
                            <tr key={cred.id}>
                              <td className="px-4 py-2 text-sm text-gray-900">{cred.email}</td>
                              <td className="px-4 py-2 text-sm">
                                {cred.loginCount > 0 ? (
                                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Used</span>
                                ) : (
                                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">Unused</span>
                                )}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-600">{cred.loginCount}</td>
                              <td className="px-4 py-2 text-sm text-gray-600">
                                {cred.lastUsedAt ? new Date(cred.lastUsedAt).toLocaleString() : '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </details>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

