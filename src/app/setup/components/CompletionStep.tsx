'use client';

import { useTranslations } from 'next-intl';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Loader2 } from 'lucide-react';

export default function CompletionStep() {
  const t = useTranslations('setup');

  return (
    <>
      <CardHeader className="text-center">
        <div className="mx-auto mb-4">
          <CheckCircle2 className="w-16 h-16 text-green-500" />
        </div>
        <CardTitle className="text-2xl">{t('completion.title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-center">
        <p className="text-muted-foreground">{t('completion.message')}</p>

        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>{t('completion.redirecting')}</span>
        </div>

        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground">{t('completion.nextSteps')}</p>
        </div>
      </CardContent>
    </>
  );
}
