import '@cocooning/design-system/styles.css';
import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { I18N_CONFIG } from '@/i18n/config';
import { getServerTranslation } from '@/i18n/server';
import { Provider } from './provider';
import { PWA_THEME } from './pwa-theme';

export async function generateMetadata(): Promise<Metadata> {
    const t = await getServerTranslation('generic');
    return {
        title: { default: t('app.name'), template: `%s · ${t('app.name')}` },
        description: t('app.description'),
        applicationName: t('app.name'),
        appleWebApp: {
            capable: true,
            title: t('app.name'),
            statusBarStyle: 'default',
        },
    };
}

export const viewport: Viewport = {
    themeColor: [
        { media: '(prefers-color-scheme: light)', color: PWA_THEME.LIGHT },
        { media: '(prefers-color-scheme: dark)', color: PWA_THEME.DARK },
    ],
};

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
