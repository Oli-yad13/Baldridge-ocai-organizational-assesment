"use client";

import Link from "next/link";
import { ArrowLeft, FileText, Shield, AlertTriangle, CheckCircle, Users, Building2, BarChart3 } from "lucide-react";
import LanguageSwitcher from "@/components/localization/LanguageSwitcher";
import { useLocale } from "@/lib/i18n/context";

// Force dynamic rendering to prevent hydration issues
export const dynamic = 'force-dynamic';

export default function TermsOfServicePage() {
  const { t, translations } = useLocale();

  // Wait for translations to load
  if (!translations || !translations.terms) {
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
            <FileText className="w-8 h-8 text-teal-700" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{t("terms.title")}</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t("terms.subtitle")}
          </p>
          <div className="mt-6 text-sm text-gray-500">
            {t("terms.lastUpdated")}
          </div>
        </div>

        {/* Important Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-12">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-lg font-semibold text-amber-900 mb-2">{t("terms.importantNotice.title")}</h2>
              <p className="text-amber-800">
                {t("terms.importantNotice.description")}
              </p>
            </div>
          </div>
        </div>

        {/* Key Terms Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <CheckCircle className="w-6 h-6 text-teal-600 mr-3" />
            {t("terms.keyTerms.title")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-3">
              <Users className="w-5 h-5 text-teal-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900">{t("terms.keyTerms.userResponsibilities.title")}</h3>
                <p className="text-gray-600 text-sm">{t("terms.keyTerms.userResponsibilities.description")}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-teal-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900">{t("terms.keyTerms.dataProtection.title")}</h3>
                <p className="text-gray-600 text-sm">{t("terms.keyTerms.dataProtection.description")}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Building2 className="w-5 h-5 text-teal-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900">{t("terms.keyTerms.organizationalUse.title")}</h3>
                <p className="text-gray-600 text-sm">{t("terms.keyTerms.organizationalUse.description")}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <BarChart3 className="w-5 h-5 text-teal-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900">{t("terms.keyTerms.assessmentIntegrity.title")}</h3>
                <p className="text-gray-600 text-sm">{t("terms.keyTerms.assessmentIntegrity.description")}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Terms Content */}
        <div className="prose prose-lg max-w-none">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-8">
            
            {/* Agreement to Terms */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t("terms.agreement.title")}</h2>
              <p className="text-gray-600 leading-relaxed">
                {t("terms.agreement.p1")}
              </p>
              <p className="text-gray-600 leading-relaxed mt-4">
                {t("terms.agreement.p2")}
              </p>
            </section>

            {/* Description of Service */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t("terms.serviceDescription.title")}</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{t("terms.serviceDescription.platformOverview.title")}</h3>
              <p className="text-gray-600 leading-relaxed">
                {t("terms.serviceDescription.platformOverview.intro")}
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4 mt-3">
                {(translations.terms?.serviceDescription?.platformOverview?.items || []).map((item: string, idx: number) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">{t("terms.serviceDescription.userRoles.title")}</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                {(translations.terms?.serviceDescription?.userRoles?.items || []).map((item: string, idx: number) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </section>

            {/* User Accounts and Registration */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t("terms.accounts.title")}</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{t("terms.accounts.accountCreation.title")}</h3>
              <p className="text-gray-600 leading-relaxed">
                {t("terms.accounts.accountCreation.intro")}
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4 mt-3">
                {(translations.terms?.accounts?.accountCreation?.items || []).map((item: string, idx: number) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">{t("terms.accounts.accountTypes.title")}</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                {(translations.terms?.accounts?.accountTypes?.items || []).map((item: string, idx: number) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </section>

            {/* Acceptable Use */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t("terms.acceptableUse.title")}</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{t("terms.acceptableUse.permitted.title")}</h3>
              <p className="text-gray-600 leading-relaxed">{t("terms.acceptableUse.permitted.intro")}</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4 mt-3">
                {(translations.terms?.acceptableUse?.permitted?.items || []).map((item: string, idx: number) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">{t("terms.acceptableUse.prohibited.title")}</h3>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 font-semibold mb-2">{t("terms.acceptableUse.prohibited.intro")}</p>
                <ul className="list-disc list-inside text-red-700 space-y-1">
                  {(translations.terms?.acceptableUse?.prohibited?.items || []).map((item: string, idx: number) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Assessment Data and Privacy */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t("terms.data.title")}</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{t("terms.data.ownership.title")}</h3>
              <p className="text-gray-600 leading-relaxed">
                {t("terms.data.ownership.p1")}
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">{t("terms.data.usage.title")}</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                {(translations.terms?.data?.usage?.items || []).map((item: string, idx: number) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">{t("terms.data.consent.title")}</h3>
              <p className="text-gray-600 leading-relaxed">
                {t("terms.data.consent.p1")}
              </p>
            </section>

            {/* Intellectual Property */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t("terms.ip.title")}</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{t("terms.ip.platformContent.title")}</h3>
              <p className="text-gray-600 leading-relaxed">
                {t("terms.ip.platformContent.p1")}
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">{t("terms.ip.frameworks.title")}</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                {(translations.terms?.ip?.frameworks?.items || []).map((item: string, idx: number) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">{t("terms.ip.userContent.title")}</h3>
              <p className="text-gray-600 leading-relaxed">
                {t("terms.ip.userContent.p1")}
              </p>
            </section>

            {/* Service Availability */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t("terms.availability.title")}</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{t("terms.availability.uptime.title")}</h3>
              <p className="text-gray-600 leading-relaxed">
                {t("terms.availability.uptime.p1")}
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">{t("terms.availability.modifications.title")}</h3>
              <p className="text-gray-600 leading-relaxed">
                {t("terms.availability.modifications.p1")}
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">{t("terms.availability.backup.title")}</h3>
              <p className="text-gray-600 leading-relaxed">
                {t("terms.availability.backup.p1")}
              </p>
            </section>

            {/* Limitation of Liability */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t("terms.liability.title")}</h2>
              
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-amber-900 mb-3">{t("terms.liability.notice.title")}</h3>
                <p className="text-amber-800 text-sm leading-relaxed">
                  {t("terms.liability.notice.p1")}
                </p>
              </div>

              <p className="text-gray-600 leading-relaxed mt-4">
                {t("terms.liability.p1")}
              </p>
            </section>

            {/* Indemnification */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t("terms.indemnification.title")}</h2>
              <p className="text-gray-600 leading-relaxed">
                {t("terms.indemnification.p1")}
              </p>
            </section>

            {/* Termination */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t("terms.termination.title")}</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{t("terms.termination.byYou.title")}</h3>
              <p className="text-gray-600 leading-relaxed">
                {t("terms.termination.byYou.p1")}
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">{t("terms.termination.byUs.title")}</h3>
              <p className="text-gray-600 leading-relaxed">
                {t("terms.termination.byUs.p1")}
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">{t("terms.termination.effect.title")}</h3>
              <p className="text-gray-600 leading-relaxed">
                {t("terms.termination.effect.p1")}
              </p>
            </section>

            {/* Governing Law */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t("terms.law.title")}</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{t("terms.law.governing.title")}</h3>
              <p className="text-gray-600 leading-relaxed">
                {t("terms.law.governing.p1")}
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">{t("terms.law.dispute.title")}</h3>
              <p className="text-gray-600 leading-relaxed">
                {t("terms.law.dispute.p1")}
              </p>
            </section>

            {/* Changes to Terms */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t("terms.changes.title")}</h2>
              <p className="text-gray-600 leading-relaxed">
                {t("terms.changes.p1")}
              </p>
            </section>

            {/* Contact Information */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t("terms.contact.title")}</h2>
              
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t("terms.contact.intro")}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">{t("terms.contact.legal.title")}</h4>
                    <div className="space-y-1 text-gray-600 text-sm">
                      <p><strong>{t("terms.contact.legal.email").split(':')[0]}:</strong>{t("terms.contact.legal.email").split(':')[1]}</p>
                      <p><strong>{t("terms.contact.legal.phone").split(':')[0]}:</strong>{t("terms.contact.legal.phone").split(':')[1]}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">{t("terms.contact.support.title")}</h4>
                    <div className="space-y-1 text-gray-600 text-sm">
                      <p><strong>{t("terms.contact.support.email").split(':')[0]}:</strong>{t("terms.contact.support.email").split(':')[1]}</p>
                      <p><strong>{t("terms.contact.support.phone").split(':')[0]}:</strong>{t("terms.contact.support.phone").split(':')[1]}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <p className="text-gray-600 text-sm" style={{ whiteSpace: 'pre-line' }}>
                    <strong>{t("terms.contact.address").split(':')[0]}:</strong>{t("terms.contact.address").substring(t("terms.contact.address").indexOf(":") + 1)}
                  </p>
                </div>
              </div>

              <p className="text-gray-600 leading-relaxed mt-6">
                {t("terms.contact.p1")}
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
              {t("terms.footer.backToHome")}
            </Link>
            <Link
              href="/privacy"
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Shield className="w-4 h-4 mr-2" />
              {t("terms.footer.privacy")}
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

