import type { ReactNode } from 'react';
import { I18nProvider } from '@/i18n/i18n-provider';

export function WithI18n({ children }: { readonly children: ReactNode }) {
    return <I18nProvider>{children}</I18nProvider>;
}
