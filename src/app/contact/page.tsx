"use client";

import Link from "next/link";
import { ArrowLeft, MapPin, Phone, Mail, Clock, Send, MessageCircle, Building2, Users, Globe, CheckCircle, AlertCircle } from "lucide-react";
import { useState } from "react";
import LanguageSwitcher from "@/components/localization/LanguageSwitcher";
import { useLocale } from "@/lib/i18n/context";

export default function ContactPage() {
  const { t, translations } = useLocale();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    organization: '',
    service: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      console.log('Submitting contact form...', formData);
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      console.log('Response status:', response.status, response.statusText);
      const responseData = await response.json();
      console.log('Response data:', responseData);

      if (response.ok) {
        console.log('✅ Email sent successfully!', responseData);
        setSubmitStatus('success');
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          organization: '',
          service: '',
          message: ''
        });
      } else {
        console.error('❌ Failed to send email:', responseData);
        setSubmitStatus('error');
        setErrorMessage(responseData.error || responseData.details || 'Failed to send message');
      }
    } catch (error) {
      console.error('❌ Network error:', error);
      setSubmitStatus('error');
      setErrorMessage('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
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
                <span className="hidden sm:inline">{t('contact.backToHome')}</span>
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
            <MessageCircle className="w-8 h-8 sm:w-10 sm:h-10 text-teal-700" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
            {t('contact.title')}
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {t('contact.subtitle')}
          </p>
        </div>

        {/* Contact Information Grid */}
        <section className="mb-12 sm:mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Address */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 text-center hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <MapPin className="w-7 h-7 sm:w-8 sm:h-8 text-teal-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">{t('contact.info.address.title')}</h3>
              <p className="text-gray-600 leading-relaxed" style={{ whiteSpace: 'pre-line' }}>
                {t('contact.info.address.value')}
              </p>
            </div>

            {/* Phone */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 text-center hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Phone className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">{t('contact.info.phone.title')}</h3>
              <div className="space-y-2 text-gray-600">
                {(translations.contact?.info?.phone?.values || []).map((phone: string, idx: number) => (
                  <p key={idx} className="font-medium">{phone}</p>
                ))}
              </div>
            </div>

            {/* Email */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 text-center hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Mail className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">{t('contact.info.email.title')}</h3>
              <p className="text-gray-600">
                <a href={`mailto:${t('contact.info.email.value')}`} className="text-blue-600 hover:text-blue-700 font-medium">
                  {t('contact.info.email.value')}
                </a>
              </p>
            </div>
          </div>
        </section>

        {/* Working Hours */}
        <section className="mb-12 sm:mb-16">
          <div className="bg-gradient-to-br from-slate-900 to-gray-800 rounded-2xl p-6 sm:p-8 lg:p-12 text-white">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">{t('contact.workingHours.heading')}</h2>
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 bg-teal-500 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-1">{t('contact.workingHours.schedule')}</h3>
                    <p className="text-gray-300">{t('contact.workingHours.time')}</p>
                  </div>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  {t('contact.workingHours.description')}
                </p>
              </div>
              <div className="relative">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                  <h3 className="text-lg font-semibold mb-6">{t('contact.workingHours.quickContact')}</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
                        <Phone className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">{t('contact.workingHours.call.title')}</p>
                        <p className="text-sm text-gray-300">{t('contact.workingHours.call.description')}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                        <Mail className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">{t('contact.workingHours.email.title')}</p>
                        <p className="text-sm text-gray-300">{t('contact.workingHours.email.description')}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">{t('contact.workingHours.visit.title')}</p>
                        <p className="text-sm text-gray-300">{t('contact.workingHours.visit.description')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <section className="mb-12 sm:mb-16">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 lg:p-12">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">{t('contact.form.heading')}</h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
                {t('contact.form.subtitle')}
              </p>
            </div>

            {/* Success/Error Messages */}
            {submitStatus === 'success' && (
              <div className="max-w-4xl mx-auto mb-8">
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-green-900 mb-2">{t('contact.form.success.title')}</h3>
                    <p className="text-green-800">
                      {t('contact.form.success.description')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="max-w-4xl mx-auto mb-8">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start space-x-3">
                  <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-red-900 mb-2">{t('contact.form.error.title')}</h3>
                    <p className="text-red-800">
                      {errorMessage || t('contact.form.error.description')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('contact.form.firstName')} {t('contact.form.required')}
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-900"
                    placeholder={t('contact.form.placeholders.firstName')}
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('contact.form.lastName')} {t('contact.form.required')}
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-900"
                    placeholder={t('contact.form.placeholders.lastName')}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('contact.form.email')} {t('contact.form.required')}
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-900"
                    placeholder={t('contact.form.placeholders.email')}
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('contact.form.phone')}
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-900"
                    placeholder={t('contact.form.placeholders.phone')}
                  />
                </div>
              </div>

              <div className="mb-6 sm:mb-8">
                <label htmlFor="organization" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('contact.form.organization')}
                </label>
                <input
                  type="text"
                  id="organization"
                  name="organization"
                  value={formData.organization}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-900"
                  placeholder={t('contact.form.placeholders.organization')}
                />
              </div>

              <div className="mb-6 sm:mb-8">
                <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('contact.form.service')}
                </label>
                <select
                  id="service"
                  name="service"
                  value={formData.service}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-900"
                >
                  <option value="">{t('contact.form.serviceOptions.select')}</option>
                  <option value="training">{t('contact.form.serviceOptions.training')}</option>
                  <option value="consultancy">{t('contact.form.serviceOptions.consultancy')}</option>
                  <option value="research">{t('contact.form.serviceOptions.research')}</option>
                  <option value="assessment">{t('contact.form.serviceOptions.assessment')}</option>
                  <option value="ocai">{t('contact.form.serviceOptions.ocai')}</option>
                  <option value="baldrige">{t('contact.form.serviceOptions.baldrige')}</option>
                  <option value="other">{t('contact.form.serviceOptions.other')}</option>
                </select>
              </div>

              <div className="mb-6 sm:mb-8">
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('contact.form.message')} {t('contact.form.required')}
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors resize-vertical disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-900"
                  placeholder={t('contact.form.placeholders.message')}
                ></textarea>
              </div>

              <div className="text-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center px-8 py-4 bg-teal-700 text-white rounded-lg hover:bg-teal-800 transition-colors font-medium text-lg shadow-lg hover:shadow-xl disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:bg-gray-400"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      {t('contact.form.submitting')}
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      {t('contact.form.submit')}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* Service Areas */}
        <section className="mb-12 sm:mb-16">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">{t('contact.services.heading')}</h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              {t('contact.services.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Training Services */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 sm:p-8 border border-blue-200">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
                <Users className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-blue-900 mb-3 sm:mb-4">{t('contact.services.training.title')}</h3>
              <ul className="space-y-2 text-blue-800 text-sm">
                {(translations.contact?.services?.training?.items || []).map((item: string, idx: number) => (
                  <li key={idx}>• {item}</li>
                ))}
              </ul>
            </div>

            {/* Consultancy Services */}
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-6 sm:p-8 border border-emerald-200">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-emerald-600 rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
                <Building2 className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-emerald-900 mb-3 sm:mb-4">{t('contact.services.consultancy.title')}</h3>
              <ul className="space-y-2 text-emerald-800 text-sm">
                {(translations.contact?.services?.consultancy?.items || []).map((item: string, idx: number) => (
                  <li key={idx}>• {item}</li>
                ))}
              </ul>
            </div>

            {/* Research Services */}
            <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-2xl p-6 sm:p-8 border border-teal-200">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-teal-600 rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
                <Globe className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-teal-900 mb-3 sm:mb-4">{t('contact.services.research.title')}</h3>
              <ul className="space-y-2 text-teal-800 text-sm">
                {(translations.contact?.services?.research?.items || []).map((item: string, idx: number) => (
                  <li key={idx}>• {item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Client Testimonials */}
        <section className="mb-12 sm:mb-16">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">{t('contact.testimonials.heading')}</h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              {t('contact.testimonials.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {(translations.contact?.testimonials?.reviews || []).map((review: any, idx: number) => (
              <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-400">
                    <span>★★★★★</span>
                  </div>
                </div>
                <blockquote className="text-gray-600 leading-relaxed mb-6">
                  "{review.quote}"
                </blockquote>
                <div className="flex items-center">
                  <div className={`w-12 h-12 ${idx === 0 ? 'bg-teal-100' : 'bg-emerald-100'} rounded-full flex items-center justify-center mr-4`}>
                    <Users className={`w-6 h-6 ${idx === 0 ? 'text-teal-600' : 'text-emerald-600'}`} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{review.author}</p>
                    <p className="text-gray-600 text-sm">{review.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="mb-12 sm:mb-16">
          <div className="bg-gradient-to-br from-teal-600 to-emerald-600 rounded-2xl p-6 sm:p-8 lg:p-12 text-white text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">{t('contact.cta.heading')}</h2>
            <p className="text-base sm:text-lg md:text-xl text-teal-100 mb-6 sm:mb-8 max-w-2xl mx-auto">
              {t('contact.cta.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Link
                href="/auth/signin"
                className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-white text-teal-700 rounded-lg hover:bg-gray-100 transition-colors font-medium text-base sm:text-lg shadow-lg hover:shadow-xl"
              >
                {t('contact.cta.accessHub')}
              </Link>
              <a
                href={`mailto:${t('contact.info.email.value')}`}
                className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 border-2 border-white text-white rounded-lg hover:bg-white hover:text-teal-700 transition-colors font-medium text-base sm:text-lg"
              >
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                {t('contact.cta.contactDirect')}
              </a>
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
              {t('contact.footer.tagline')}
            </p>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>{t('contact.footer.copyright', { year: new Date().getFullYear() })}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
