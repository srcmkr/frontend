'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

interface WelcomeStepProps {
  onNext: () => void;
}

export default function WelcomeStep({ onNext }: WelcomeStepProps) {
  const t = useTranslations('setup');

  const features = ['monitoring', 'incidents', 'statusPages', 'notifications'] as const;

  return (
    <>
      <CardHeader className="text-center">
        <CardTitle className="text-3xl">{t('welcome.title')}</CardTitle>
        <CardDescription className="text-lg mt-2">
          {t('welcome.subtitle')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">{t('welcome.features.title')}</h3>
          <ul className="space-y-3">
            {features.map((feature) => (
              <li key={feature} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">{t(`welcome.features.${feature}`)}</span>
              </li>
            ))}
          </ul>
        </div>

        <Button onClick={onNext} size="lg" className="w-full">
          {t('welcome.getStarted')}
        </Button>
      </CardContent>
    </>
  );
}
