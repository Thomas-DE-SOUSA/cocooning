import { WebRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import type { MetadataRoute } from 'next';
import { getServerTranslation } from '@/i18n/server';
import { PWA_THEME } from './pwa-theme';

export default async function manifest(): Promise<MetadataRoute.Manifest> {
    const t = await getServerTranslation('generic');
    return {
        name: t('app.name'),
        short_name: t('app.name'),
        description: t('app.description'),
        start_url: WebRouterEnum.HOME,
        scope: WebRouterEnum.HOME,
        display: 'standalone',
        background_color: PWA_THEME.LIGHT,
        theme_color: PWA_THEME.LIGHT,
        icons: [
            { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
            {
                src: '/icons/icon-maskable-512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'maskable',
            },
        ],
    };
}
