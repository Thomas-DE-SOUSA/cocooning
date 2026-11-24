'use client';

import { Button } from '@cocooning/design-system';
import { useTranslation } from 'react-i18next';
import { I18N_CONFIG } from '@/i18n/config';
import { I18nProvider } from '@/i18n/i18n-provider';
import { FONT_VARIABLES } from './fonts';

type GlobalErrorProps = { readonly reset: () => void };

export default function GlobalError({ reset }: GlobalErrorProps) {
    return (
        <html
            lang={I18N_CONFIG.defaultLocale}
            className={FONT_VARIABLES}
        >
            <body>
                <I18nProvider>
                    <GlobalErrorContent reset={reset} />
                </I18nProvider>
            </body>
        </html>
    );
}

function GlobalErrorContent({ reset }: GlobalErrorProps) {
    const { t } = useTranslation('generic');
    return (
        <main className="flex min-h-dvh flex-col items-center justify-center gap-4 p-4 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
                {t('globalError.title')}
            </h1>
            <Button onClick={reset}>{t('globalError.retry')}</Button>
        </main>
    );
}
