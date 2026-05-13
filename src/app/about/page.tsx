"use client";

import Link from "next/link";
import { ArrowLeft, Users, Target, Award, Globe, Heart, BookOpen, Lightbulb, BarChart3, Building2, TrendingUp } from "lucide-react";
import LanguageSwitcher from "@/components/localization/LanguageSwitcher";
import { useLocale } from "@/lib/i18n/context";

export default function AboutPage() {
  const { t, translations } = useLocale();
  
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
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{t('app.name')}</h1>
                <p className="text-xs sm:text-sm text-teal-700 font-medium hidden sm:block">by Tenadam Training, Consultancy & Research PLC</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <LanguageSwitcher />
              <Link
                href="/"
                className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 text-teal-700 hover:text-teal-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">{t('about.backToHome')}</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Hero Section */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-teal-100 rounded-full mb-6 sm:mb-8">
            <Building2 className="w-8 h-8 sm:w-10 sm:h-10 text-teal-700" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
            {t('about.title')}
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {t('about.subtitle')}
          </p>
        </div>

        {/* Company Overview */}
        <section className="mb-12 sm:mb-16">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 lg:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">{t('about.story.heading')}</h2>
                <p className="text-gray-600 leading-relaxed mb-6">
                  {t('about.story.paragraph1')}
                </p>
                <p className="text-gray-600 leading-relaxed mb-6">
                  {t('about.story.paragraph2')}
                </p>
                <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-teal-900 mb-2 flex items-center">
                    <Heart className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    {t('about.story.localImpact')}
                  </h3>
                  <p className="text-teal-800 text-sm">
                    {t('about.story.localImpactDesc')}
                  </p>
                </div>
              </div>
              <div className="relative">
                <div className="bg-gradient-to-br from-teal-100 to-emerald-100 rounded-2xl p-6 sm:p-8 text-center">
                  <div className="grid grid-cols-2 gap-4 sm:gap-6">
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                      <div className="w-12 h-12 bg-teal-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">{t('about.stats.founded')}</h4>
                      <p className="text-2xl font-bold text-teal-600">{t('about.stats.foundedValue')}</p>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                      <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <Award className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">{t('about.stats.team')}</h4>
                      <p className="text-2xl font-bold text-emerald-600">{t('about.stats.teamValue')}</p>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                      <div className="w-12 h-12 bg-teal-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <Globe className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">{t('about.stats.regions')}</h4>
                      <p className="text-lg font-bold text-teal-600">{t('about.stats.regionsValue')}</p>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                      <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <Target className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">{t('about.stats.visionYear')}</h4>
                      <p className="text-2xl font-bold text-emerald-600">{t('about.stats.visionYearValue')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="mb-12 sm:mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-2xl p-6 sm:p-8 border border-teal-200">
              <div className="flex items-center mb-4 sm:mb-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-teal-600 rounded-lg flex items-center justify-center mr-3 sm:mr-4">
                  <Target className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-teal-900">{t('about.mission.heading')}</h2>
              </div>
              <p className="text-teal-800 leading-relaxed">
                {t('about.mission.description')}
              </p>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-6 sm:p-8 border border-emerald-200">
              <div className="flex items-center mb-4 sm:mb-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-600 rounded-lg flex items-center justify-center mr-3 sm:mr-4">
                  <Award className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-emerald-900">{t('about.vision.heading')}</h2>
              </div>
              <p className="text-emerald-800 leading-relaxed">
                {t('about.vision.description')}
              </p>
            </div>
          </div>
        </section>

        {/* Services Overview */}
        <section className="mb-12 sm:mb-16">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">{t('about.services.heading')}</h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              {t('about.services.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Training Services */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
                <BookOpen className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">{t('about.services.training.title')}</h3>
              <ul className="space-y-3 text-gray-600">
                {(translations.about?.services?.training?.items || []).map((item: string, idx: number) => (
                  <li key={idx} className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Consultancy Services */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
                <Lightbulb className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">{t('about.services.consultancy.title')}</h3>
              <ul className="space-y-3 text-gray-600">
                {(translations.about?.services?.consultancy?.items || []).map((item: string, idx: number) => (
                  <li key={idx} className="flex items-start">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Research Services */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-teal-100 rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
                <BarChart3 className="w-7 h-7 sm:w-8 sm:h-8 text-teal-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">{t('about.services.research.title')}</h3>
              <ul className="space-y-3 text-gray-600">
                {(translations.about?.services?.research?.items || []).map((item: string, idx: number) => (
                  <li key={idx} className="flex items-start">
                    <div className="w-2 h-2 bg-teal-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Assessment Platform Section */}
        <section className="mb-12 sm:mb-16">
          <div className="bg-gradient-to-br from-slate-900 to-gray-800 rounded-2xl p-6 sm:p-8 lg:p-12 text-white">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">{t('about.platform.heading')}</h2>
                <p className="text-gray-300 leading-relaxed mb-6">
                  {t('about.platform.description')}
                </p>
                <div className="space-y-4">
                  {(translations.about?.platform?.features || []).map((feature: string, idx: number) => {
                    const colors = ['bg-teal-500', 'bg-emerald-500', 'bg-blue-500', 'bg-purple-500'];
                    return (
                      <div key={idx} className="flex items-start space-x-3">
                        <div className={`w-6 h-6 ${colors[idx]} rounded-full flex items-center justify-center flex-shrink-0 mt-1`}>
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                        <p className="text-gray-300">{feature}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="relative">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/20">
                  <div className="grid grid-cols-2 gap-4 sm:gap-6">
                    <div className="bg-white/10 rounded-xl p-6 text-center">
                      <TrendingUp className="w-8 h-8 text-teal-400 mx-auto mb-3" />
                      <h4 className="font-semibold mb-2">{t('about.platform.cards.realtime.title')}</h4>
                      <p className="text-sm text-gray-300">{t('about.platform.cards.realtime.description')}</p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-6 text-center">
                      <Users className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
                      <h4 className="font-semibold mb-2">{t('about.platform.cards.multiUser.title')}</h4>
                      <p className="text-sm text-gray-300">{t('about.platform.cards.multiUser.description')}</p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-6 text-center">
                      <BarChart3 className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                      <h4 className="font-semibold mb-2">{t('about.platform.cards.reports.title')}</h4>
                      <p className="text-sm text-gray-300">{t('about.platform.cards.reports.description')}</p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-6 text-center">
                      <Award className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                      <h4 className="font-semibold mb-2">{t('about.platform.cards.standards.title')}</h4>
                      <p className="text-sm text-gray-300">{t('about.platform.cards.standards.description')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Tenadam */}
        <section className="mb-12 sm:mb-16">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">{t('about.whyChoose.heading')}</h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              {t('about.whyChoose.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Globe className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">{t('about.whyChoose.localGlobal.title')}</h3>
              <p className="text-gray-600 leading-relaxed">
                {t('about.whyChoose.localGlobal.description')}
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Users className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">{t('about.whyChoose.clientCentric.title')}</h3>
              <p className="text-gray-600 leading-relaxed">
                {t('about.whyChoose.clientCentric.description')}
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Award className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">{t('about.whyChoose.expertise.title')}</h3>
              <p className="text-gray-600 leading-relaxed">
                {t('about.whyChoose.expertise.description')}
              </p>
            </div>
          </div>
        </section>

        {/* Contact Information */}
        <section className="mb-12 sm:mb-16">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 lg:p-12">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">{t('about.contact.heading')}</h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
                {t('about.contact.subtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">{t('about.contact.info')}</h3>
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-6 h-6 text-teal-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">{t('about.contact.address.title')}</h4>
                      <p className="text-gray-600" style={{ whiteSpace: 'pre-line' }}>{t('about.contact.address.value')}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Users className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">{t('about.contact.phone.title')}</h4>
                      <div className="text-gray-600 space-y-1">
                        {(translations.about?.contact?.phone?.values || []).map((phone: string, idx: number) => (
                          <p key={idx}>{phone}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Globe className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">{t('about.contact.email.title')}</h4>
                      <a href={`mailto:${t('about.contact.email.value')}`} className="text-blue-600 hover:text-blue-700 hover:underline">
                        {t('about.contact.email.value')}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Award className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">{t('about.contact.hours.title')}</h4>
                      <p className="text-gray-600" style={{ whiteSpace: 'pre-line' }}>{t('about.contact.hours.value')}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl p-6 sm:p-8 border border-teal-200">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">{t('about.contact.readyToStart')}</h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  {t('about.contact.startDescription')}
                </p>
                <div className="space-y-4">
                  <Link
                    href="/auth/signin"
                    className="inline-flex items-center justify-center w-full px-6 py-3 bg-teal-700 text-white rounded-lg hover:bg-teal-800 transition-colors font-medium"
                  >
                    {t('about.contact.accessHub')}
                  </Link>
                  <Link
                    href="/"
                    className="inline-flex items-center justify-center w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    {t('about.contact.learnMore')}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <img
                src="/tenadam-logo.png"
                alt="Tenadam Logo"
                width={40}
                height={40}
                className="object-contain"
              />
              <span className="text-xl font-bold">Tenadam Training, Consultancy & Research PLC</span>
            </div>
            <p className="text-gray-400 max-w-2xl mx-auto">
              {t('about.footer.tagline')}
            </p>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>{t('about.footer.copyright', { year: new Date().getFullYear() })}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

