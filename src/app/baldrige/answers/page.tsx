'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle, FileText } from 'lucide-react';
import Link from 'next/link';
import { useLocale } from '@/lib/i18n/context';
import { getLocalizedBaldrigeQuestionText } from '@/lib/baldrige-data';
import LanguageSwitcher from '@/components/localization/LanguageSwitcher';

interface BaldrigeResponse {
  questionId: string;
  questionText: string;
  itemCode: string;
  responseText: string;
  categoryName: string;
  subcategoryName: string;
}

export default function BaldrigeAnswersPage() {
  const router = useRouter();
  const { t, locale, translations } = useLocale();
  const [responses, setResponses] = useState<BaldrigeResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [organization, setOrganization] = useState<any>(null);

  // Helper function to get localized category name
  const getCategoryName = useCallback((name: string) => {
    return translations?.categoryNames?.[name] || name;
  }, [translations]);

  // Helper function to get localized question text
  const getQuestionText = useCallback((itemCode: string, fallbackText: string) => {
    if (translations?.questions?.[itemCode]) {
      return translations.questions[itemCode];
    }
    return fallbackText;
  }, [translations]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedOrg = localStorage.getItem('organization');

    if (!storedUser || !storedOrg) {
      router.push('/auth/signin');
      return;
    }

    setUser(JSON.parse(storedUser));
    setOrganization(JSON.parse(storedOrg));
    loadResponses();
  }, [router]);

  const loadResponses = async () => {
    try {
      // This endpoint would need to be created to fetch user's submitted responses
      const response = await fetch('/api/baldrige/my-responses');
      if (response.ok) {
        const data = await response.json();
        setResponses(data.responses || []);
      }
    } catch (error) {
      console.error('Failed to load responses:', error);
    } finally {
      setLoading(false);
    }
  };

  // Group responses by category
  const groupedResponses = responses.reduce((acc, response) => {
    const category = response.categoryName;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(response);
    return acc;
  }, {} as Record<string, BaldrigeResponse[]>);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('assessment.loadingAssessment')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{t('baldrigeAnswers.title')}</h1>
                <p className="text-sm text-gray-600">{organization?.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
              <Link
                href="/employee/assessments"
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t('baldrigeIntro.backToAssessments')}</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Completion Badge */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 mb-8">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
            <div>
              <h2 className="text-lg font-semibold text-emerald-900">{t('baldrigeAnswers.completed')}</h2>
              <p className="text-emerald-700 text-sm">
                {t('baldrigeAnswers.completedDesc')}
              </p>
            </div>
          </div>
        </div>

        {/* Responses */}
        {Object.keys(groupedResponses).length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('baldrigeAnswers.noResponses')}</h3>
            <p className="text-gray-600">
              {t('baldrigeAnswers.noResponsesDesc')}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedResponses).map(([category, categoryResponses]) => (
              <div key={category} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-emerald-50 border-b border-emerald-100 px-6 py-4">
                  <h3 className="text-lg font-bold text-gray-900">{getCategoryName(category)}</h3>
                  <p className="text-sm text-gray-600">{categoryResponses.length} {t('baldrigeAnswers.questionsAnswered')}</p>
                </div>

                <div className="p-6 space-y-6">
                  {categoryResponses.map((response, idx) => (
                    <div key={response.questionId} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                      <div className="flex items-start space-x-3 mb-3">
                        <span className="inline-flex items-center justify-center w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">
                          {idx + 1}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-emerald-600 mb-1">{response.itemCode}</p>
                          <p className="text-gray-900 font-medium mb-3">{getQuestionText(response.itemCode, response.questionText)}</p>
                          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <p className="text-sm font-medium text-gray-700 mb-2">{t('baldrigeAnswers.yourResponse')}</p>
                            <p className="text-gray-700 whitespace-pre-wrap">{response.responseText}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center space-x-4">
          <Link
            href="/employee/assessments"
            className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            {t('assessment.returnToDashboard')}
          </Link>
          {/* Future: Add Print/Export PDF button */}
        </div>
      </main>
    </div>
  );
}
