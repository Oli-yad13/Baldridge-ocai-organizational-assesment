'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Download, Building2, Users, FileText, LogOut, Shield, ChevronDown, ChevronRight, FileSpreadsheet, BarChart3 } from 'lucide-react';
import * as XLSX from 'xlsx';
import { OCAIRadarChart } from '@/components/ocai/ocai-radar-chart';
import { OCAIBarChart } from '@/components/ocai/ocai-bar-chart';
import type { OCAIScores } from '@/lib/ocai-data';
import { useLocale } from '@/lib/i18n/context';
import LanguageSwitcher from '@/components/localization/LanguageSwitcher';

interface OCAIResponse {
  id: string;
  demographics: any;
  nowScores: any;
  preferredScores: any;
  submittedAt: string;
  userId: string;
  surveyId: string;
}

interface UserAssessment {
  userId: string;
  userName: string;
  userEmail: string;
  accessKey: string;
  completedAt: string;
  surveyId: string | null;
  surveyTitle: string;
  responses: OCAIResponse[];
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

export default function AdminOCAIPage() {
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
    loadOCAIData(parsedUser);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  const loadOCAIData = async (currentUser: any) => {
    const userToUse = currentUser || user;
    
    if (!userToUse?.id) {
      console.error('[OCAI Admin] No user ID available');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/admin/ocai/responses', {
        headers: {
          'x-user-id': userToUse.id
        }
      });
      
      if (response.ok) {
        const result: ResponseData = await response.json();
        setData(result.data);
        setSummary(result.summary);
      } else {
        console.error('[OCAI Admin] Failed to load responses');
      }
    } catch (error) {
      console.error('Failed to load OCAI data:', error);
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
    // Build CSV header
    const header = [
      'Organization',
      'User Name',
      'User Email',
      'Access Key',
      'Completed At',
      'Survey',
      'Now - Clan',
      'Now - Adhocracy',
      'Now - Market',
      'Now - Hierarchy',
      'Preferred - Clan',
      'Preferred - Adhocracy',
      'Preferred - Market',
      'Preferred - Hierarchy',
      'Demographics',
    ].join(',');

    // Build CSV rows
    const rows = org.users.map(user => {
      const response = user.responses[0]; // OCAI typically has one response per user
      const nowScores = response?.nowScores || {};
      const preferredScores = response?.preferredScores || {};
      const demographics = response?.demographics ? JSON.stringify(response.demographics).replace(/"/g, '""') : '';

      return [
        `"${org.organizationName}"`,
        `"${user.userName}"`,
        `"${user.userEmail}"`,
        `"${user.accessKey}"`,
        `"${new Date(user.completedAt).toLocaleString()}"`,
        `"${user.surveyTitle}"`,
        nowScores.clan || 0,
        nowScores.adhocracy || 0,
        nowScores.market || 0,
        nowScores.hierarchy || 0,
        preferredScores.clan || 0,
        preferredScores.adhocracy || 0,
        preferredScores.market || 0,
        preferredScores.hierarchy || 0,
        `"${demographics}"`,
      ].join(',');
    });

    const csv = [header, ...rows].join('\n');

    // Download CSV
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `ocai_${org.organizationName.replace(/\s+/g, '_')}_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToExcel = (org: OrganizationData) => {
    // Build Excel headers
    const headers = [
      'Organization',
      'User Name',
      'User Email',
      'Access Key',
      'Completed At',
      'Survey',
      'Now - Clan',
      'Now - Adhocracy',
      'Now - Market',
      'Now - Hierarchy',
      'Preferred - Clan',
      'Preferred - Adhocracy',
      'Preferred - Market',
      'Preferred - Hierarchy',
      'Demographics',
    ];

    // Build Excel data rows
    const rows = org.users.map(user => {
      const response = user.responses[0];
      const nowScores = response?.nowScores || {};
      const preferredScores = response?.preferredScores || {};
      const demographics = response?.demographics ? JSON.stringify(response.demographics) : '';

      return [
        org.organizationName,
        user.userName,
        user.userEmail,
        user.accessKey,
        new Date(user.completedAt).toLocaleString(),
        user.surveyTitle,
        nowScores.clan || 0,
        nowScores.adhocracy || 0,
        nowScores.market || 0,
        nowScores.hierarchy || 0,
        preferredScores.clan || 0,
        preferredScores.adhocracy || 0,
        preferredScores.market || 0,
        preferredScores.hierarchy || 0,
        demographics,
      ];
    });

    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);

    // Set column widths
    const colWidths = [
      { wch: 25 }, // Organization
      { wch: 20 }, // User Name
      { wch: 25 }, // User Email
      { wch: 15 }, // Access Key
      { wch: 20 }, // Completed At
      { wch: 25 }, // Survey
      { wch: 12 }, // Now - Clan
      { wch: 15 }, // Now - Adhocracy
      { wch: 12 }, // Now - Market
      { wch: 15 }, // Now - Hierarchy
      { wch: 15 }, // Preferred - Clan
      { wch: 18 }, // Preferred - Adhocracy
      { wch: 15 }, // Preferred - Market
      { wch: 18 }, // Preferred - Hierarchy
      { wch: 40 }, // Demographics
    ];
    worksheet['!cols'] = colWidths;

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'OCAI Responses');

    // Download Excel file
    XLSX.writeFile(workbook, `ocai_${org.organizationName.replace(/\s+/g, '_')}_${Date.now()}.xlsx`);
  };

  const exportAllToCSV = () => {
    data.forEach(org => {
      exportToCSV(org);
    });
  };

  const exportAllToExcel = () => {
    data.forEach(org => {
      exportToExcel(org);
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading OCAI data...</p>
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
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{t('assessments.ocaiTitle')}</h1>
                <p className="text-sm text-gray-600">{t('ocai.subtitle')}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/ocai/results"
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <BarChart3 className="w-4 h-4" />
                <span className="text-sm font-medium">{t('assessments.viewResponses')}</span>
              </Link>
              <button
                onClick={exportAllToCSV}
                className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span className="text-sm font-medium">{t('common.export')} CSV</span>
              </button>
              <button
                onClick={exportAllToExcel}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span className="text-sm font-medium">{t('assessments.exportExcel')}</span>
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
              className="border-b-2 border-blue-500 py-4 px-1 text-sm font-medium text-blue-600"
            >
              {t('assessments.ocai')}
            </Link>
            <Link
              href="/admin/baldrige"
              className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
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
              <BarChart3 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
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
                        <p className="text-sm text-gray-600">{org.totalUsers} {t('assessments.completedAssessments').toLowerCase()}</p>
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
                        <span className="text-sm font-medium">CSV</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          exportToExcel(org);
                        }}
                        className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <FileSpreadsheet className="w-4 h-4" />
                        <span className="text-sm font-medium">Excel</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Organization Users */}
                {expandedOrgs.has(org.organizationId) && (
                  <div className="p-6 space-y-6">
                    {/* Organization Aggregate Section - Always Show */}
                    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg border-2 border-purple-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                              <BarChart3 className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-purple-900">Organization-Wide Aggregate Results</h3>
                              <p className="text-sm text-purple-700">
                                {org.users.length === 1
                                  ? 'Mean average from 1 assessment (showing aggregate view for consistency)'
                                  : `Mean average from ${org.users.length} assessments`}
                              </p>
                            </div>
                          </div>
                        </div>

                        {(() => {
                          // Calculate organization aggregate
                          const totals = {
                            now: { clan: 0, adhocracy: 0, market: 0, hierarchy: 0 },
                            pref: { clan: 0, adhocracy: 0, market: 0, hierarchy: 0 }
                          };

                          let validResponses = 0;
                          org.users.forEach(user => {
                            if (user.responses[0]?.nowScores && user.responses[0]?.preferredScores) {
                              const now = user.responses[0].nowScores;
                              const pref = user.responses[0].preferredScores;
                              
                              if (typeof now.clan === 'number' && typeof pref.clan === 'number') {
                                totals.now.clan += now.clan;
                                totals.now.adhocracy += now.adhocracy;
                                totals.now.market += now.market;
                                totals.now.hierarchy += now.hierarchy;

                                totals.pref.clan += pref.clan;
                                totals.pref.adhocracy += pref.adhocracy;
                                totals.pref.market += pref.market;
                                totals.pref.hierarchy += pref.hierarchy;

                                validResponses++;
                              }
                            }
                          });

                          const avg = {
                            now: {
                              clan: (totals.now.clan / validResponses).toFixed(2),
                              adhocracy: (totals.now.adhocracy / validResponses).toFixed(2),
                              market: (totals.now.market / validResponses).toFixed(2),
                              hierarchy: (totals.now.hierarchy / validResponses).toFixed(2)
                            },
                            pref: {
                              clan: (totals.pref.clan / validResponses).toFixed(2),
                              adhocracy: (totals.pref.adhocracy / validResponses).toFixed(2),
                              market: (totals.pref.market / validResponses).toFixed(2),
                              hierarchy: (totals.pref.hierarchy / validResponses).toFixed(2)
                            }
                          };

                          return (
                            <>
                              {/* Aggregate Scores */}
                              <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-white/80 rounded-lg p-4 border border-purple-200">
                                  <h4 className="font-semibold text-purple-900 mb-3">Current Culture (Average)</h4>
                                  <div className="space-y-2">
                                    <div className="flex justify-between">
                                      <span className="text-sm text-gray-700">Clan:</span>
                                      <span className="text-sm font-bold text-gray-900">{avg.now.clan}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-sm text-gray-700">Adhocracy:</span>
                                      <span className="text-sm font-bold text-gray-900">{avg.now.adhocracy}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-sm text-gray-700">Market:</span>
                                      <span className="text-sm font-bold text-gray-900">{avg.now.market}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-sm text-gray-700">Hierarchy:</span>
                                      <span className="text-sm font-bold text-gray-900">{avg.now.hierarchy}</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="bg-white/80 rounded-lg p-4 border border-purple-200">
                                  <h4 className="font-semibold text-purple-900 mb-3">Preferred Culture (Average)</h4>
                                  <div className="space-y-2">
                                    <div className="flex justify-between">
                                      <span className="text-sm text-gray-700">Clan:</span>
                                      <span className="text-sm font-bold text-gray-900">{avg.pref.clan}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-sm text-gray-700">Adhocracy:</span>
                                      <span className="text-sm font-bold text-gray-900">{avg.pref.adhocracy}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-sm text-gray-700">Market:</span>
                                      <span className="text-sm font-bold text-gray-900">{avg.pref.market}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-sm text-gray-700">Hierarchy:</span>
                                      <span className="text-sm font-bold text-gray-900">{avg.pref.hierarchy}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Aggregate Charts */}
                              <div className="grid grid-cols-1 gap-6">
                                {/* Radar Chart */}
                                <div className="bg-white rounded-lg border border-purple-200 p-8">
                                  <h4 className="font-semibold text-purple-900 mb-6 text-center text-xl">Culture Profile (Radar)</h4>
                                  <div className="h-[500px]">
                                    <OCAIRadarChart
                                    scores={{
                                      now: {
                                        Clan: parseFloat(avg.now.clan),
                                        Adhocracy: parseFloat(avg.now.adhocracy),
                                        Market: parseFloat(avg.now.market),
                                        Hierarchy: parseFloat(avg.now.hierarchy)
                                      },
                                      preferred: {
                                        Clan: parseFloat(avg.pref.clan),
                                        Adhocracy: parseFloat(avg.pref.adhocracy),
                                        Market: parseFloat(avg.pref.market),
                                        Hierarchy: parseFloat(avg.pref.hierarchy)
                                      },
                                      delta: {
                                        Clan: parseFloat(avg.pref.clan) - parseFloat(avg.now.clan),
                                        Adhocracy: parseFloat(avg.pref.adhocracy) - parseFloat(avg.now.adhocracy),
                                        Market: parseFloat(avg.pref.market) - parseFloat(avg.now.market),
                                        Hierarchy: parseFloat(avg.pref.hierarchy) - parseFloat(avg.now.hierarchy)
                                      }
                                    }}
                                  />
                                  </div>
                                </div>

                                {/* Bar Chart */}
                                <div className="bg-white rounded-lg border border-purple-200 p-8">
                                  <h4 className="font-semibold text-purple-900 mb-6 text-center text-xl">Culture Change (Bar)</h4>
                                  <div className="h-[500px]">
                                    <OCAIBarChart
                                    scores={{
                                      now: {
                                        Clan: parseFloat(avg.now.clan),
                                        Adhocracy: parseFloat(avg.now.adhocracy),
                                        Market: parseFloat(avg.now.market),
                                        Hierarchy: parseFloat(avg.now.hierarchy)
                                      },
                                      preferred: {
                                        Clan: parseFloat(avg.pref.clan),
                                        Adhocracy: parseFloat(avg.pref.adhocracy),
                                        Market: parseFloat(avg.pref.market),
                                        Hierarchy: parseFloat(avg.pref.hierarchy)
                                      },
                                      delta: {
                                        Clan: parseFloat(avg.pref.clan) - parseFloat(avg.now.clan),
                                        Adhocracy: parseFloat(avg.pref.adhocracy) - parseFloat(avg.now.adhocracy),
                                        Market: parseFloat(avg.pref.market) - parseFloat(avg.now.market),
                                        Hierarchy: parseFloat(avg.pref.hierarchy) - parseFloat(avg.now.hierarchy)
                                      }
                                    }}
                                  />
                                  </div>
                                </div>
                              </div>
                            </>
                          );
                        })()}
                    </div>

                    {/* Divider */}
                    <div className="border-t-2 border-purple-200 my-6">
                      <div className="text-center -mt-3">
                        <span className="bg-gray-50 px-4 py-1 text-sm font-medium text-purple-700">
                          Individual Assessments
                        </span>
                      </div>
                    </div>

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
                                  {user.userEmail} • Access Key: {user.accessKey}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-600">
                                Completed: {new Date(user.completedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* User OCAI Scores */}
                        {expandedUsers.has(user.userId) && user.responses[0] && (
                          <div className="p-4 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              {/* Now Scores */}
                              <div className="bg-blue-50 rounded-lg p-4">
                                <h4 className="font-semibold text-blue-900 mb-3">Current Culture (Now)</h4>
                                <div className="space-y-2">
                                  <div className="flex justify-between">
                                    <span className="text-sm text-gray-700">Clan:</span>
                                    <span className="text-sm font-bold text-gray-900">{user.responses[0].nowScores?.clan || 0}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sm text-gray-700">Adhocracy:</span>
                                    <span className="text-sm font-bold text-gray-900">{user.responses[0].nowScores?.adhocracy || 0}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sm text-gray-700">Market:</span>
                                    <span className="text-sm font-bold text-gray-900">{user.responses[0].nowScores?.market || 0}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sm text-gray-700">Hierarchy:</span>
                                    <span className="text-sm font-bold text-gray-900">{user.responses[0].nowScores?.hierarchy || 0}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Preferred Scores */}
                              <div className="bg-green-50 rounded-lg p-4">
                                <h4 className="font-semibold text-green-900 mb-3">Preferred Culture</h4>
                                <div className="space-y-2">
                                  <div className="flex justify-between">
                                    <span className="text-sm text-gray-700">Clan:</span>
                                    <span className="text-sm font-bold text-gray-900">{user.responses[0].preferredScores?.clan || 0}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sm text-gray-700">Adhocracy:</span>
                                    <span className="text-sm font-bold text-gray-900">{user.responses[0].preferredScores?.adhocracy || 0}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sm text-gray-700">Market:</span>
                                    <span className="text-sm font-bold text-gray-900">{user.responses[0].preferredScores?.market || 0}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sm text-gray-700">Hierarchy:</span>
                                    <span className="text-sm font-bold text-gray-900">{user.responses[0].preferredScores?.hierarchy || 0}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Demographics */}
                            {user.responses[0].demographics && Object.keys(user.responses[0].demographics).length > 0 ? (
                              <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="font-semibold text-gray-900 mb-3">Demographics</h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                  {user.responses[0].demographics.department && (
                                    <div>
                                      <p className="text-xs text-gray-500">Department</p>
                                      <p className="text-sm font-medium text-gray-900">{user.responses[0].demographics.department}</p>
                                    </div>
                                  )}
                                  {user.responses[0].demographics.team && (
                                    <div>
                                      <p className="text-xs text-gray-500">Team</p>
                                      <p className="text-sm font-medium text-gray-900">{user.responses[0].demographics.team}</p>
                                    </div>
                                  )}
                                  {user.responses[0].demographics.tenure && (
                                    <div>
                                      <p className="text-xs text-gray-500">Tenure</p>
                                      <p className="text-sm font-medium text-gray-900">{user.responses[0].demographics.tenure}</p>
                                    </div>
                                  )}
                                  {user.responses[0].demographics.location && (
                                    <div>
                                      <p className="text-xs text-gray-500">Location</p>
                                      <p className="text-sm font-medium text-gray-900">{user.responses[0].demographics.location}</p>
                                    </div>
                                  )}
                                  {user.responses[0].demographics.gender && (
                                    <div>
                                      <p className="text-xs text-gray-500">Gender</p>
                                      <p className="text-sm font-medium text-gray-900">{user.responses[0].demographics.gender}</p>
                                    </div>
                                  )}
                                  {user.responses[0].demographics.laborUnit && (
                                    <div>
                                      <p className="text-xs text-gray-500">Labor Unit</p>
                                      <p className="text-sm font-medium text-gray-900">{user.responses[0].demographics.laborUnit}</p>
                                    </div>
                                  )}
                                  {user.responses[0].demographics.raceEthnicity && (
                                    <div>
                                      <p className="text-xs text-gray-500">Race/Ethnicity</p>
                                      <p className="text-sm font-medium text-gray-900">{user.responses[0].demographics.raceEthnicity}</p>
                              </div>
                            )}
                                </div>
                              </div>
                            ) : (
                              <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="font-semibold text-gray-900 mb-2">Demographics</h4>
                                <p className="text-sm text-gray-500 italic">No demographic data provided</p>
                              </div>
                            )}

                            {/* Individual Charts */}
                            <div className="grid grid-cols-1 gap-6">
                              {/* Radar Chart */}
                              <div className="bg-white rounded-lg border border-gray-200 p-8">
                                <h4 className="font-semibold text-gray-900 mb-6 text-center text-lg">Culture Profile (Radar)</h4>
                                <div className="h-[450px]">
                                  <OCAIRadarChart
                                    scores={{
                                      now: {
                                        Clan: user.responses[0].nowScores?.clan || 0,
                                        Adhocracy: user.responses[0].nowScores?.adhocracy || 0,
                                        Market: user.responses[0].nowScores?.market || 0,
                                        Hierarchy: user.responses[0].nowScores?.hierarchy || 0
                                      },
                                      preferred: {
                                        Clan: user.responses[0].preferredScores?.clan || 0,
                                        Adhocracy: user.responses[0].preferredScores?.adhocracy || 0,
                                        Market: user.responses[0].preferredScores?.market || 0,
                                        Hierarchy: user.responses[0].preferredScores?.hierarchy || 0
                                      },
                                      delta: {
                                        Clan: (user.responses[0].preferredScores?.clan || 0) - (user.responses[0].nowScores?.clan || 0),
                                        Adhocracy: (user.responses[0].preferredScores?.adhocracy || 0) - (user.responses[0].nowScores?.adhocracy || 0),
                                        Market: (user.responses[0].preferredScores?.market || 0) - (user.responses[0].nowScores?.market || 0),
                                        Hierarchy: (user.responses[0].preferredScores?.hierarchy || 0) - (user.responses[0].nowScores?.hierarchy || 0)
                                      }
                                    }}
                                  />
                                </div>
                              </div>

                              {/* Bar Chart */}
                              <div className="bg-white rounded-lg border border-gray-200 p-8">
                                <h4 className="font-semibold text-gray-900 mb-6 text-center text-lg">Culture Change (Bar)</h4>
                                <div className="h-[450px]">
                                  <OCAIBarChart
                                    scores={{
                                      now: {
                                        Clan: user.responses[0].nowScores?.clan || 0,
                                        Adhocracy: user.responses[0].nowScores?.adhocracy || 0,
                                        Market: user.responses[0].nowScores?.market || 0,
                                        Hierarchy: user.responses[0].nowScores?.hierarchy || 0
                                      },
                                      preferred: {
                                        Clan: user.responses[0].preferredScores?.clan || 0,
                                        Adhocracy: user.responses[0].preferredScores?.adhocracy || 0,
                                        Market: user.responses[0].preferredScores?.market || 0,
                                        Hierarchy: user.responses[0].preferredScores?.hierarchy || 0
                                      },
                                      delta: {
                                        Clan: (user.responses[0].preferredScores?.clan || 0) - (user.responses[0].nowScores?.clan || 0),
                                        Adhocracy: (user.responses[0].preferredScores?.adhocracy || 0) - (user.responses[0].nowScores?.adhocracy || 0),
                                        Market: (user.responses[0].preferredScores?.market || 0) - (user.responses[0].nowScores?.market || 0),
                                        Hierarchy: (user.responses[0].preferredScores?.hierarchy || 0) - (user.responses[0].nowScores?.hierarchy || 0)
                                      }
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
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
