'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

const adminAccountSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain uppercase letter')
    .regex(/[a-z]/, 'Password must contain lowercase letter')
    .regex(/[0-9]/, 'Password must contain digit'),
  confirmPassword: z.string(),
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export type AdminAccountForm = z.infer<typeof adminAccountSchema>;

interface AdminAccountStepProps {
  initialData: Partial<AdminAccountForm>;
  onNext: (data: AdminAccountForm) => void;
  onBack: () => void;
}

export default function AdminAccountStep({ initialData, onNext, onBack }: AdminAccountStepProps) {
  const t = useTranslations('setup');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminAccountForm>({
    resolver: zodResolver(adminAccountSchema),
    defaultValues: initialData,
  });

  const onSubmit = (data: AdminAccountForm) => {
    onNext(data);
  };

  return (
    <>
      <CardHeader>
        <CardTitle>{t('adminAccount.title')}</CardTitle>
        <CardDescription>{t('adminAccount.subtitle')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">{t('adminAccount.fields.fullName')}</Label>
            <Input
              id="fullName"
              {...register('fullName')}
              className={errors.fullName ? 'border-destructive' : ''}
            />
            {errors.fullName && (
              <p className="text-sm text-destructive">{t('adminAccount.errors.fullName')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{t('adminAccount.fields.email')}</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              className={errors.email ? 'border-destructive' : ''}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{t('adminAccount.errors.email')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t('adminAccount.fields.password')}</Label>
            <Input
              id="password"
              type="password"
              {...register('password')}
              className={errors.password ? 'border-destructive' : ''}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{t('adminAccount.errors.password')}</p>
            )}
            <p className="text-xs text-muted-foreground">{t('adminAccount.passwordHint')}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t('adminAccount.fields.confirmPassword')}</Label>
            <Input
              id="confirmPassword"
              type="password"
              {...register('confirmPassword')}
              className={errors.confirmPassword ? 'border-destructive' : ''}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">{t('adminAccount.errors.passwordMismatch')}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('adminAccount.back')}
            </Button>
            <Button type="submit" className="flex-1">
              {t('adminAccount.continue')}
            </Button>
          </div>
        </form>
      </CardContent>
    </>
  );
}
