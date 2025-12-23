import type { Metadata } from 'next';
import '../globals.css';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import LanguageSwitcher from './components/LanguageSwitcher';

export const metadata: Metadata = {
  title: 'Setup - Status Monitor',
  description: 'Initial system setup',
};

export default async function SetupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        {/* Language Switcher - Fixed Position Top Right */}
        <div className="fixed top-4 right-4 z-50">
          <LanguageSwitcher />
        </div>

        {children}
      </div>
    </NextIntlClientProvider>
  );
}
