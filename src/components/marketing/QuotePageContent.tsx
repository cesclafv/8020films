'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

export function QuotePageContent() {
  const t = useTranslations('HomePage.quote');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      company: formData.get('company') as string,
      first_name: formData.get('firstName') as string,
      last_name: formData.get('lastName') as string,
      email: formData.get('email') as string,
      job_title: formData.get('jobTitle') as string,
      project_type: formData.get('projectType') as string,
      budget_range: formData.get('budget') as string,
      message: formData.get('message') as string,
      how_heard: formData.get('howHeard') as string,
    };

    try {
      const response = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to submit');
      }

      setIsSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again or email us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="py-8">
        <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
          {t('successTitle')}
        </h2>
        <p className="text-[#6b7280] text-lg">{t('successMessage')}</p>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
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
              className="input"
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
              className="input"
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
              className="input"
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
              className="input"
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
              className="input"
              placeholder={t('jobTitlePlaceholder')}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold uppercase tracking-wider mb-2">
              {t('projectType')}
            </label>
            <select name="projectType" className="input">
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
            <select name="budget" className="input">
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
            <select name="howHeard" className="input">
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
            className="input resize-none"
            placeholder={t('messagePlaceholder')}
          />
        </div>

        {/* Submit Button */}
        <div className="pt-4">
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
  );
}
