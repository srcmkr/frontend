'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';

const brandingSchema = z.object({
  systemName: z.string().optional(),
  logoUrl: z.string().url().optional().or(z.literal('')),
});

export type BrandingForm = z.infer<typeof brandingSchema>;

interface BrandingStepProps {
  initialData: Partial<BrandingForm>;
  onNext: (data: BrandingForm) => void;
  onBack: () => void;
  isSubmitting: boolean;
}

export default function BrandingStep({ initialData, onNext, onBack, isSubmitting }: BrandingStepProps) {
  const t = useTranslations('setup');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BrandingForm>({
    resolver: zodResolver(brandingSchema),
    defaultValues: initialData,
  });

  const onSubmit = (data: BrandingForm) => {
    onNext(data);
  };

  return (
    <>
      <CardHeader>
        <CardTitle>{t('branding.title')}</CardTitle>
        <CardDescription>{t('branding.subtitle')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="systemName">{t('branding.fields.systemName')}</Label>
            <Input
              id="systemName"
              placeholder={t('branding.fields.systemNamePlaceholder')}
              {...register('systemName')}
            />
            <p className="text-xs text-muted-foreground">{t('branding.hints.systemName')}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="logoUrl">{t('branding.fields.logoUrl')}</Label>
            <Input
              id="logoUrl"
              placeholder="https://example.com/logo.png"
              {...register('logoUrl')}
              className={errors.logoUrl ? 'border-destructive' : ''}
            />
            {errors.logoUrl && (
              <p className="text-sm text-destructive">{t('branding.errors.logoUrl')}</p>
            )}
            <p className="text-xs text-muted-foreground">{t('branding.hints.logoUrl')}</p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              disabled={isSubmitting}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('branding.back')}
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('branding.completing')}
                </>
              ) : (
                t('branding.complete')
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </>
  );
}
