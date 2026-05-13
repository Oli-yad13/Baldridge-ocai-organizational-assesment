'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Download, Building2, Users, FileText, LogOut, Shield, ChevronDown, ChevronRight, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useLocale } from '@/lib/i18n/context';
import LanguageSwitcher from '@/components/localization/LanguageSwitcher';
import { 
  generateAllBaldrigeQuestions, 
  generateBaldrigeExcelHeaders, 
  generateBaldrigeExcelColumnWidths,
  convertToExcelRow,
  validateQuestionCount
} from '@/lib/baldrige-export';

interface BaldrigeResponse {
  questionId: string;
  itemCode: string;
  questionText: string;
  categoryName: string;
  subcategoryName: string;
  categoryOrder: number;
  subcategoryOrder: number;
  responseText: string;
  timeSpent: number;
  createdAt: string;
  updatedAt: string;
}

interface UserAssessment {
  userId: string;
  userName: string;
  userEmail: string;
  accessKey: string;
  loginMethod: 'Access Key' | 'Email Credentials';
  assessmentId: string;
  completedAt: string;
  surveyId: string | null;
  surveyTitle: string;
  responses: BaldrigeResponse[];
}

interface OrganizationData {
  organizationId: string;
  organizationName: string;
  users: UserAssessment[];
  totalUsers: number;
}

interface ResponseData {
  success: boolean;
  data: OrganizationData[];
  summary: {
    totalOrganizations: number;
    totalUsers: number;
    totalResponses: number;
  };
}

export default function AdminBaldrigePage() {
  const router = useRouter();
  const { t } = useLocale();
  const [user, setUser] = useState<any>(null);
  const [data, setData] = useState<OrganizationData[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedOrgs, setExpandedOrgs] = useState<Set<string>>(new Set());
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/auth/signin');
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== 'SYSTEM_ADMIN') {
      router.push('/');
      return;
    }

    setUser(parsedUser);
    loadBaldrigeData();
  }, [router]);

  const loadBaldrigeData = async () => {
    try {
      // Get user from localStorage to send in header
      const storedUser = localStorage.getItem('user');
      const headers: HeadersInit = {};

      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.id) {
          headers['x-user-id'] = parsedUser.id;
        }
      }

      const response = await fetch('/api/admin/baldrige/responses', {
        headers,
      });

      console.log('Baldrige API response status:', response.status);

      if (response.ok) {
        const result: ResponseData = await response.json();
        console.log('Baldrige API data:', result);
        setData(result.data);
        setSummary(result.summary);
      } else {
        const errorData = await response.json();
        console.error('Baldrige API error:', errorData);
      }
    } catch (error) {
      console.error('Failed to load Baldrige data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  const toggleOrg = (orgId: string) => {
    const newExpanded = new Set(expandedOrgs);
    if (newExpanded.has(orgId)) {
      newExpanded.delete(orgId);
    } else {
      newExpanded.add(orgId);
    }
    setExpandedOrgs(newExpanded);
  };

  const toggleUser = (userId: string) => {
    const newExpanded = new Set(expandedUsers);
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId);
    } else {
      newExpanded.add(userId);
    }
    setExpandedUsers(newExpanded);
  };

  const exportToCSV = (org: OrganizationData) => {
    // Use the new standardized export function
    exportToExcel(org, 'csv');
  };

  const exportToExcel = (org: OrganizationData, format: 'excel' | 'csv' = 'excel') => {
    // Validate that we have all 97 questions
    const validation = validateQuestionCount();
    if (!validation.isValid) {
      console.error(`Expected ${validation.expected} questions, found ${validation.count}`);
      alert(`Error: Expected ${validation.expected} questions, found ${validation.count}. Please contact support.`);
      return;
    }

    // Generate all 97 questions in standard order
    const allQuestions = generateAllBaldrigeQuestions();
    
    // Generate headers with all 97 questions
    const headers = generateBaldrigeExcelHeaders();
    
    // Convert each user to Excel row format
    const rows = org.users.map(user => 
      convertToExcelRow(user, org.organizationName, allQuestions)
    );

    if (format === 'csv') {
      // Export as CSV
      const csvContent = [
        headers.map(h => `"${h}"`).join(','), // Header row
        ...rows.map(row => row.map(cell => `"${cell}"`).join(',')) // Data rows
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `baldrige_${org.organizationName.replace(/\s+/g, '_')}_${Date.now()}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      // Export as Excel
      const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      
      // Set column widths
      const colWidths = generateBaldrigeExcelColumnWidths();
      worksheet['!cols'] = colWidths;

      // Create workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Baldrige Responses');

      // Download Excel file
      XLSX.writeFile(workbook, `baldrige_${org.organizationName.replace(/\s+/g, '_')}_${Date.now()}.xlsx`);
    }
  };

  const exportAllToCSV = () => {
    // Export all organizations combined
    data.forEach(org => {
      exportToCSV(org);
    });
  };

  const exportAllToExcel = () => {
    // Export all organizations in a single Excel file
    exportAllOrganizationsToExcel();
  };

  const exportAllOrganizationsToExcel = () => {
    // Validate that we have all 97 questions
    const validation = validateQuestionCount();
    if (!validation.isValid) {
      console.error(`Expected ${validation.expected} questions, found ${validation.count}`);
      alert(`Error: Expected ${validation.expected} questions, found ${validation.count}. Please contact support.`);
      return;
    }

    // Generate all 97 questions in standard order
    const allQuestions = generateAllBaldrigeQuestions();
    
    // Generate headers with all 97 questions
    const headers = generateBaldrigeExcelHeaders();
    
    // Convert all users from all organizations to Excel row format
    const allRows: string[][] = [];
    data.forEach(org => {
      const orgRows = org.users.map(user => 
        convertToExcelRow(user, org.organizationName, allQuestions)
      );
      allRows.push(...orgRows);
    });

    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...allRows]);
    
    // Set column widths
    const colWidths = generateBaldrigeExcelColumnWidths();
    worksheet['!cols'] = colWidths;

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'All Baldrige Responses');

    // Download Excel file
    XLSX.writeFile(workbook, `baldrige_all_organizations_${Date.now()}.xlsx`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{t('assessments.baldrigeTitle')}</h1>
                <p className="text-sm text-gray-600">{t('common.tenadamAssessmentHub')}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={exportAllToCSV}
                className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span className="text-sm font-medium">{t('common.export')} CSV (97 Q)</span>
              </button>
              <button
                onClick={exportAllToExcel}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span className="text-sm font-medium">{t('assessments.exportExcel')} (97 Questions)</span>
              </button>
              <span className="text-sm text-gray-600">{user?.name}</span>
              <LanguageSwitcher />
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">{t('nav.signOut')}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <Link
              href="/admin/dashboard"
              className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              {t('nav.dashboard')}
            </Link>
            <Link
              href="/admin/organizations"
              className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              {t('nav.organizations')}
            </Link>
            <Link
              href="/admin/ocai"
              className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              {t('assessments.ocai')}
            </Link>
            <Link
              href="/admin/baldrige"
              className="border-b-2 border-emerald-500 py-4 px-1 text-sm font-medium text-emerald-600"
            >
              {t('assessments.baldrige')}
            </Link>
            <Link
              href="/admin/surveys"
              className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              {t('nav.surveys')}
            </Link>
            <Link
              href="/admin/settings"
              className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              {t('nav.settings')}
            </Link>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('nav.organizations')}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{summary?.totalOrganizations || 0}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Building2 className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('assessments.completedAssessments')}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{summary?.totalUsers || 0}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <Users className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('assessments.totalResponses')}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{summary?.totalResponses || 0}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <FileText className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Organizations List */}
        <div className="space-y-4">
          {data.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 text-lg">{t('assessments.noResponses')}</p>
              <p className="text-gray-500 text-sm mt-2">{t('assessments.noResponsesDesc')}</p>
            </div>
          ) : (
            data.map(org => (
              <div key={org.organizationId} className="bg-white rounded-lg shadow">
                {/* Organization Header */}
                <div
                  className="px-6 py-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleOrg(org.organizationId)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {expandedOrgs.has(org.organizationId) ? (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-500" />
                      )}
                      <Building2 className="w-6 h-6 text-blue-600" />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{org.organizationName}</h3>
                        <p className="text-sm text-gray-600">{org.totalUsers} completed assessment(s)</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          exportToCSV(org);
                        }}
                        className="flex items-center space-x-2 px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        <span className="text-sm font-medium">CSV (97 Q)</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          exportToExcel(org);
                        }}
                        className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <FileSpreadsheet className="w-4 h-4" />
                        <span className="text-sm font-medium">Excel (97 Q)</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Organization Users */}
                {expandedOrgs.has(org.organizationId) && (
                  <div className="p-6 space-y-4">
                    {org.users.map(user => (
                      <div key={user.userId} className="border border-gray-200 rounded-lg">
                        {/* User Header */}
                        <div
                          className="px-4 py-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors rounded-t-lg"
                          onClick={() => toggleUser(user.userId)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              {expandedUsers.has(user.userId) ? (
                                <ChevronDown className="w-4 h-4 text-gray-500" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-gray-500" />
                              )}
                              <Users className="w-5 h-5 text-green-600" />
                              <div>
                                <p className="font-medium text-gray-900">{user.userName}</p>
                                <p className="text-sm text-gray-600">
                                  {user.userEmail} • Access Key: {user.accessKey} • Login: {user.loginMethod}
                                </p>
                                <p className="text-xs text-blue-600 font-mono">
                                  Assessment ID: {user.assessmentId}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-600">
                                Completed: {new Date(user.completedAt).toLocaleDateString()}
                              </p>
                              <p className="text-xs text-gray-500">{user.responses.length} responses</p>
                            </div>
                          </div>
                        </div>

                        {/* User Responses */}
                        {expandedUsers.has(user.userId) && (
                          <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
                            {user.responses.map((response, idx) => (
                              <div key={idx} className="border-l-4 border-emerald-500 pl-4 py-2">
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <p className="text-sm font-semibold text-gray-700">{response.itemCode}</p>
                                    <p className="text-xs text-gray-500">
                                      {response.categoryName} → {response.subcategoryName}
                                    </p>
                                  </div>
                                  <span className="text-xs text-gray-500">
                                    {Math.floor(response.timeSpent / 60)}m {response.timeSpent % 60}s
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{response.questionText}</p>
                                <div className="bg-gray-50 rounded p-3">
                                  <p className="text-sm text-gray-800 whitespace-pre-wrap">{response.responseText}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
