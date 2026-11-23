'use client';

import { Toaster } from '@cocooning/design-system';
import type { ReactNode } from 'react';
import { I18nProvider } from '@/i18n/i18n-provider';

export function Provider({ children }: { readonly children: ReactNode }) {
    return (
        <I18nProvider>
            {children}
            <Toaster />
        </I18nProvider>
    );
}
