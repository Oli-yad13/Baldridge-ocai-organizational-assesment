'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function BaldrigePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [hasAccessKey, setHasAccessKey] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for access key authentication in localStorage
    const storedUser = localStorage.getItem('user');
    const storedOrg = localStorage.getItem('organization');
    const storedTypes = localStorage.getItem('assessmentTypes');

    if (storedUser && storedOrg && storedTypes) {
      const types = JSON.parse(storedTypes);
      if (types.includes('BALDRIGE')) {
        setHasAccessKey(true);
      }
    }
    setLoading(false);
  }, []);

  const startAssessment = () => {
    // If user has access key, allow them to proceed
    if (hasAccessKey) {
      router.push('/baldrige/assessment');
      return;
    }

    // If authenticated via NextAuth, allow them to proceed
    if (status === 'authenticated') {
      router.push('/baldrige/assessment');
      return;
    }

    // Otherwise, redirect to signin
    router.push('/auth/signin?callbackUrl=/baldrige/assessment');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Baldrige Excellence Framework
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A comprehensive assessment tool to evaluate and improve your organization's performance
            across all key dimensions of excellence.
          </p>
        </div>

        {/* Assessment Overview Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-8 text-white">
            <h2 className="text-3xl font-bold mb-2">Assessment Overview</h2>
            <p className="text-emerald-100">
              The Baldrige Excellence Framework helps organizations improve their performance and achieve their goals.
            </p>
          </div>

          <div className="p-8">
            {/* Key Stats */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-6 bg-emerald-50 rounded-lg">
                <div className="text-4xl font-bold text-emerald-600 mb-2">1,000</div>
                <div className="text-gray-600">Total Points</div>
              </div>
              <div className="text-center p-6 bg-emerald-50 rounded-lg">
                <div className="text-4xl font-bold text-emerald-600 mb-2">7</div>
                <div className="text-gray-600">Categories</div>
              </div>
              <div className="text-center p-6 bg-emerald-50 rounded-lg">
                <div className="text-4xl font-bold text-emerald-600 mb-2">45-60</div>
                <div className="text-gray-600">Minutes</div>
              </div>
            </div>

            {/* Categories */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Assessment Categories</h3>
              <div className="space-y-4">
                <div className="flex items-start p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold text-lg mr-4">
                    1
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">Leadership (120 pts)</h4>
                    <p className="text-sm text-gray-600">Senior leadership, governance, and societal contributions</p>
                  </div>
                </div>

                <div className="flex items-start p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold text-lg mr-4">
                    2
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">Strategy (85 pts)</h4>
                    <p className="text-sm text-gray-600">Strategy development and implementation</p>
                  </div>
                </div>

                <div className="flex items-start p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold text-lg mr-4">
                    3
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">Customers (85 pts)</h4>
                    <p className="text-sm text-gray-600">Customer expectations and engagement</p>
                  </div>
                </div>

                <div className="flex items-start p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold text-lg mr-4">
                    4
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">Measurement, Analysis, and Knowledge Management (90 pts)</h4>
                    <p className="text-sm text-gray-600">Performance measurement and organizational knowledge</p>
                  </div>
                </div>

                <div className="flex items-start p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold text-lg mr-4">
                    5
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">Workforce (85 pts)</h4>
                    <p className="text-sm text-gray-600">Workforce environment and engagement</p>
                  </div>
                </div>

                <div className="flex items-start p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold text-lg mr-4">
                    6
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">Operations (85 pts)</h4>
                    <p className="text-sm text-gray-600">Work processes and operational effectiveness</p>
                  </div>
                </div>

                <div className="flex items-start p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold text-lg mr-4">
                    7
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">Results (450 pts)</h4>
                    <p className="text-sm text-gray-600">Product, customer, workforce, leadership, and financial results</p>
                  </div>
                </div>
              </div>
            </div>

            {/* What to Expect */}
            <div className="bg-emerald-50 rounded-lg p-6 mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">What to Expect</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-emerald-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Comprehensive questions covering all aspects of organizational performance</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-emerald-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Automatic progress saving as you complete each section</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-emerald-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Ability to pause and resume at any time</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-emerald-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Detailed feedback and insights upon completion</span>
                </li>
              </ul>
            </div>

            {/* CTA Button */}
            <div className="text-center">
              <button
                onClick={startAssessment}
                className="px-8 py-4 bg-emerald-600 text-white text-lg font-semibold rounded-lg hover:bg-emerald-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
              >
                {hasAccessKey || status === 'authenticated' ? 'Start Assessment' : 'Sign In to Start Assessment'}
              </button>
              <p className="mt-4 text-sm text-gray-500">
                You can save your progress and return anytime
              </p>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">About the Baldrige Framework</h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            The Baldrige Excellence Framework provides a systems approach to organizational performance management.
            It helps organizations improve, become more competitive, and achieve sustainability. The framework addresses
            all aspects of organizational management in an integrated way, leading to better results and long-term success.
          </p>
        </div>
      </div>
    </div>
  );
}
