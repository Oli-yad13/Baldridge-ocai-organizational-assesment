"use client";

import Link from "next/link";
import { ArrowLeft, Shield, Lock, Eye, Database, Users, FileText, CheckCircle } from "lucide-react";
import LanguageSwitcher from "@/components/localization/LanguageSwitcher";
import { useLocale } from "@/lib/i18n/context";

// Force dynamic rendering to prevent hydration issues
export const dynamic = 'force-dynamic';

export default function PrivacyPolicyPage() {
  const { t, translations } = useLocale();

  // Wait for translations to load
  if (!translations || !translations.privacy) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-t-4 border-teal-600"></div>
          </div>
          <h2 className="text-xl font-semibold text-gray-800">Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 flex items-center justify-center">
                <img
                  src="/tenadam-logo.png"
                  alt="Tenadam Logo"
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{t('app.name')}</h1>
                <p className="text-sm text-teal-700 font-medium">by Tenadam Training, Consultancy & Research PLC</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
              <Link
                href="/"
                className="flex items-center space-x-2 px-4 py-2 text-teal-700 hover:text-teal-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t('common.back')} to Home</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-100 rounded-full mb-6">
            <Shield className="w-8 h-8 text-teal-700" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{t("privacy.title")}</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t("privacy.subtitle")}
          </p>
          <div className="mt-6 text-sm text-gray-500">
            {t("privacy.lastUpdated")}
          </div>
        </div>

        {/* Quick Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <CheckCircle className="w-6 h-6 text-teal-600 mr-3" />
            {t("privacy.glance.title")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-3">
              <Lock className="w-5 h-5 text-teal-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900">{t("privacy.glance.secure.title")}</h3>
                <p className="text-gray-600 text-sm">{t("privacy.glance.secure.description")}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Eye className="w-5 h-5 text-teal-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900">{t("privacy.glance.anonymous.title")}</h3>
                <p className="text-gray-600 text-sm">{t("privacy.glance.anonymous.description")}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Database className="w-5 h-5 text-teal-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900">{t("privacy.glance.minimization.title")}</h3>
                <p className="text-gray-600 text-sm">{t("privacy.glance.minimization.description")}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Users className="w-5 h-5 text-teal-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900">{t("privacy.glance.rights.title")}</h3>
                <p className="text-gray-600 text-sm">{t("privacy.glance.rights.description")}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Privacy Policy Content */}
        <div className="prose prose-lg max-w-none">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-8">
            
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t("privacy.introduction.title")}</h2>
              <p className="text-gray-600 leading-relaxed">
                {t("privacy.introduction.p1")}
              </p>
              <p className="text-gray-600 leading-relaxed mt-4">
                {t("privacy.introduction.p2")}
              </p>
            </section>

            {/* Information We Collect */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t("privacy.informationCollected.title")}</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{t("privacy.informationCollected.personal.title")}</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                {(translations.privacy?.informationCollected?.personal?.items || []).map((item: string, idx: number) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">{t("privacy.informationCollected.assessment.title")}</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                {(translations.privacy?.informationCollected?.assessment?.items || []).map((item: string, idx: number) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">{t("privacy.informationCollected.technical.title")}</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                {(translations.privacy?.informationCollected?.technical?.items || []).map((item: string, idx: number) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </section>

            {/* How We Use Information */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t("privacy.howWeUse.title")}</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{t("privacy.howWeUse.primary.title")}</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                {(translations.privacy?.howWeUse?.primary?.items || []).map((item: string, idx: number) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">{t("privacy.howWeUse.secondary.title")}</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                {(translations.privacy?.howWeUse?.secondary?.items || []).map((item: string, idx: number) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </section>

            {/* Data Sharing */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t("privacy.sharing.title")}</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{t("privacy.sharing.withinOrg.title")}</h3>
              <p className="text-gray-600 leading-relaxed">
                {t("privacy.sharing.withinOrg.p1")}
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">{t("privacy.sharing.serviceProviders.title")}</h3>
              <p className="text-gray-600 leading-relaxed">
                {t("privacy.sharing.serviceProviders.p1")}
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">{t("privacy.sharing.legal.title")}</h3>
              <p className="text-gray-600 leading-relaxed">
                {t("privacy.sharing.legal.p1")}
              </p>
            </section>

            {/* Data Security */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t("privacy.security.title")}</h2>
              
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-6 mb-4">
                <h3 className="text-lg font-semibold text-teal-900 mb-3 flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  {t("privacy.security.measuresTitle")}
                </h3>
                <ul className="list-disc list-inside text-teal-800 space-y-2">
                  {(translations.privacy?.security?.measures || []).map((item: string, idx: number) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              <p className="text-gray-600 leading-relaxed">
                {t("privacy.security.p1")}
              </p>
            </section>

            {/* Data Retention */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t("privacy.retention.title")}</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{t("privacy.retention.periods.title")}</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                {(translations.privacy?.retention?.periods?.items || []).map((item: string, idx: number) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">{t("privacy.retention.deletion.title")}</h3>
              <p className="text-gray-600 leading-relaxed">
                {t("privacy.retention.deletion.p1")}
              </p>
            </section>

            {/* Your Rights */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t("privacy.yourRights.title")}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
                  <h3 className="font-semibold text-emerald-900 mb-3">{t("privacy.yourRights.access.title")}</h3>
                  <p className="text-emerald-800 text-sm">{t("privacy.yourRights.access.description")}</p>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
                  <h3 className="font-semibold text-emerald-900 mb-3">{t("privacy.yourRights.correction.title")}</h3>
                  <p className="text-emerald-800 text-sm">{t("privacy.yourRights.correction.description")}</p>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
                  <h3 className="font-semibold text-emerald-900 mb-3">{t("privacy.yourRights.deletion.title")}</h3>
                  <p className="text-emerald-800 text-sm">{t("privacy.yourRights.deletion.description")}</p>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
                  <h3 className="font-semibold text-emerald-900 mb-3">{t("privacy.yourRights.restriction.title")}</h3>
                  <p className="text-emerald-800 text-sm">{t("privacy.yourRights.restriction.description")}</p>
                </div>
              </div>

              <p className="text-gray-600 leading-relaxed mt-6">
                {t("privacy.yourRights.p1")}
              </p>
            </section>

            {/* Cookies and Tracking */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t("privacy.cookies.title")}</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{t("privacy.cookies.essential.title")}</h3>
              <p className="text-gray-600 leading-relaxed">
                {t("privacy.cookies.essential.p1")}
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">{t("privacy.cookies.analytics.title")}</h3>
              <p className="text-gray-600 leading-relaxed">
                {t("privacy.cookies.analytics.p1")}
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">{t("privacy.cookies.management.title")}</h3>
              <p className="text-gray-600 leading-relaxed">
                {t("privacy.cookies.management.p1")}
              </p>
            </section>

            {/* International Transfers */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t("privacy.transfers.title")}</h2>
              <p className="text-gray-600 leading-relaxed">
                {t("privacy.transfers.p1")}
              </p>
            </section>

            {/* Children's Privacy */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t("privacy.children.title")}</h2>
              <p className="text-gray-600 leading-relaxed">
                {t("privacy.children.p1")}
              </p>
            </section>

            {/* Changes to Policy */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t("privacy.changes.title")}</h2>
              <p className="text-gray-600 leading-relaxed">
                {t("privacy.changes.p1")}
              </p>
            </section>

            {/* Contact Information */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t("privacy.contact.title")}</h2>
              
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t("privacy.contact.officer")}</h3>
                <div className="space-y-2 text-gray-600">
                  <p><strong>{t("privacy.contact.email").split(':')[0]}:</strong> {t("privacy.contact.email").split(':')[1]}</p>
                  <p><strong>{t("privacy.contact.phone").split(':')[0]}:</strong> {t("privacy.contact.phone").split(':')[1]}</p>
                  <p><strong>{t("privacy.contact.address1").split(':')[0]}:</strong> {t("privacy.contact.address1").split(':')[1]}</p>
                  <p className="ml-4">{t("privacy.contact.address2")}</p>
                </div>
              </div>

              <p className="text-gray-600 leading-relaxed mt-6">
                {t("privacy.contact.p1")}
              </p>
            </section>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-12 text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 bg-teal-700 text-white rounded-lg hover:bg-teal-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("privacy.footer.backToHome")}
            </Link>
            <Link
              href="/terms"
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FileText className="w-4 h-4 mr-2" />
              {t("privacy.footer.terms")}
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2024 Tenadam Training, Consultancy & Research PLC. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
