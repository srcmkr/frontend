'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { setupAdmin, type SetupRequest } from '@/lib/api-client';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import WelcomeStep from './components/WelcomeStep';
import AdminAccountStep, { type AdminAccountForm } from './components/AdminAccountStep';
import BrandingStep, { type BrandingForm } from './components/BrandingStep';
import CompletionStep from './components/CompletionStep';
import ProgressIndicator from './components/ProgressIndicator';

export type SetupData = AdminAccountForm & BrandingForm;

export default function SetupPage() {
  const router = useRouter();
  const t = useTranslations('setup');

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [setupData, setSetupData] = useState<Partial<SetupData>>({});

  const totalSteps = 4;

  const handleAdminAccountNext = (stepData: AdminAccountForm) => {
    setSetupData((prev) => ({ ...prev, ...stepData }));
    setCurrentStep(3);
  };

  const handleBrandingNext = async (stepData: BrandingForm) => {
    setIsSubmitting(true);

    try {
      const completeData: SetupRequest = {
        email: setupData.email!,
        password: setupData.password!,
        fullName: setupData.fullName!,
        systemName: stepData.systemName,
        logoUrl: stepData.logoUrl,
      };

      const response = await setupAdmin(completeData);

      // Store token in cookie
      // Use Secure only on HTTPS (production), allow HTTP for local development
      const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
      document.cookie = `auth_token=${response.token}; path=/; max-age=604800; SameSite=Strict${isSecure ? '; Secure' : ''}`;

      // Move to completion step
      setCurrentStep(4);

      // Auto-redirect after 2 seconds
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (error: any) {
      if (error.status === 409) {
        toast.error(t('error.alreadyInitialized'));
      } else {
        toast.error(t('error.submitFailed'));
      }
      console.error('Setup error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  return (
    <Card className="w-full max-w-2xl shadow-lg">
      <ProgressIndicator currentStep={currentStep} totalSteps={totalSteps} />

      {currentStep === 1 && (
        <WelcomeStep onNext={() => setCurrentStep(2)} />
      )}

      {currentStep === 2 && (
        <AdminAccountStep
          initialData={{
            email: setupData.email || '',
            password: setupData.password || '',
            confirmPassword: setupData.confirmPassword || '',
            fullName: setupData.fullName || '',
          }}
          onNext={handleAdminAccountNext}
          onBack={handleBack}
        />
      )}

      {currentStep === 3 && (
        <BrandingStep
          initialData={{
            systemName: setupData.systemName,
            logoUrl: setupData.logoUrl,
          }}
          onNext={handleBrandingNext}
          onBack={handleBack}
          isSubmitting={isSubmitting}
        />
      )}

      {currentStep === 4 && (
        <CompletionStep />
      )}
    </Card>
  );
}
