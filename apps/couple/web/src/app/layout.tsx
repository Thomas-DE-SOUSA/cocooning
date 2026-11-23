import '@cocooning/design-system/styles.css';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { I18N_CONFIG } from '@/i18n/config';
import { getServerTranslation } from '@/i18n/server';
import { Provider } from './provider';

export async function generateMetadata(): Promise<Metadata> {
    const t = await getServerTranslation('generic');
    return {
        title: { default: t('app.name'), template: `%s · ${t('app.name')}` },
        description: t('app.description'),
    };
}

export default function RootLayout({
    children,
}: {
    readonly children: ReactNode;
}) {
    return (
        <html lang={I18N_CONFIG.defaultLocale}>
            <body>
                <Provider>{children}</Provider>
            </body>
        </html>
    );
}
