'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

export function QuoteFormSection() {
  const t = useTranslations('HomePage.quote');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // TODO: Implement form submission with Supabase + reCAPTCHA
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitted(true);
    setIsSubmitting(false);
  };

  if (isSubmitted) {
    return (
      <section id="quote-section" className="py-20 md:py-28 section-dark">
        <div className="container mx-auto px-6">
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight">
            {t('successTitle')}
          </h2>
          <p className="text-white/70 text-lg">{t('successMessage')}</p>
        </div>
      </section>
    );
  }

  return (
    <section id="quote-section" className="py-20 md:py-28 section-dark">
      <div className="container mx-auto px-6">
        {/* Section Header - Centered */}
        <div className="mb-16 md:mb-20 text-center">
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-4 tracking-tight">
            {t('title')}
          </h2>
          <p className="text-white/70 text-lg">{t('subtitle')}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
          {/* Row 1: Company & Work Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold uppercase tracking-wider mb-2">
                {t('company')} *
              </label>
              <input
                type="text"
                name="company"
                required
                className="input input-dark"
                placeholder={t('companyPlaceholder')}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold uppercase tracking-wider mb-2">
                {t('email')} *
              </label>
              <input
                type="email"
                name="email"
                required
                className="input input-dark"
                placeholder={t('emailPlaceholder')}
              />
            </div>
          </div>

          {/* Row 2: First Name & Last Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold uppercase tracking-wider mb-2">
                {t('firstName')} *
              </label>
              <input
                type="text"
                name="firstName"
                required
                className="input input-dark"
                placeholder={t('firstNamePlaceholder')}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold uppercase tracking-wider mb-2">
                {t('lastName')} *
              </label>
              <input
                type="text"
                name="lastName"
                required
                className="input input-dark"
                placeholder={t('lastNamePlaceholder')}
              />
            </div>
          </div>

          {/* Row 3: Job Title & Project Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold uppercase tracking-wider mb-2">
                {t('jobTitle')} *
              </label>
              <input
                type="text"
                name="jobTitle"
                required
                className="input input-dark"
                placeholder={t('jobTitlePlaceholder')}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold uppercase tracking-wider mb-2">
                {t('projectType')}
              </label>
              <select name="projectType" className="input input-dark">
                <option value="">{t('selectOption')}</option>
                <option value="financial">{t('projectTypes.financial')}</option>
                <option value="corporate">{t('projectTypes.corporate')}</option>
                <option value="brand">{t('projectTypes.brand')}</option>
                <option value="remote">{t('projectTypes.remote')}</option>
                <option value="live">{t('projectTypes.live')}</option>
                <option value="music">{t('projectTypes.music')}</option>
                <option value="other">{t('projectTypes.other')}</option>
              </select>
            </div>
          </div>

          {/* Row 4: Budget & How Heard */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold uppercase tracking-wider mb-2">
                {t('budget')}
              </label>
              <select name="budget" className="input input-dark">
                <option value="">{t('selectOption')}</option>
                <option value="not-sure">{t('budgets.notSure')}</option>
                <option value="under-5k">{t('budgets.under5k')}</option>
                <option value="5k-10k">{t('budgets.5k10k')}</option>
                <option value="10k-50k">{t('budgets.10k50k')}</option>
                <option value="50k-100k">{t('budgets.50k100k')}</option>
                <option value="100k-plus">{t('budgets.100kPlus')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold uppercase tracking-wider mb-2">
                {t('howHeard')}
              </label>
              <select name="howHeard" className="input input-dark">
                <option value="">{t('selectOption')}</option>
                <option value="referral">{t('sources.referral')}</option>
                <option value="search">{t('sources.search')}</option>
                <option value="social">{t('sources.social')}</option>
                <option value="event">{t('sources.event')}</option>
                <option value="partner">{t('sources.partner')}</option>
                <option value="press">{t('sources.press')}</option>
                <option value="other">{t('sources.other')}</option>
              </select>
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-semibold uppercase tracking-wider mb-2">
              {t('message')} *
            </label>
            <textarea
              name="message"
              required
              rows={5}
              className="input input-dark resize-none"
              placeholder={t('messagePlaceholder')}
            />
          </div>

          {/* Submit Button - Centered */}
          <div className="pt-4 text-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary min-w-[200px]"
            >
              {isSubmitting ? t('sending') : t('submit')}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
