import type { Metadata } from 'next';
import { getServerTranslation } from '@/i18n/server';

export async function generateMetadata(): Promise<Metadata> {
    const t = await getServerTranslation('generic');
    return { title: t('offline.title') };
}

export default async function OfflinePage() {
    const t = await getServerTranslation('generic');
    return (
        <main className="flex min-h-dvh flex-col items-center justify-center gap-2 p-4 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
                {t('offline.title')}
            </h1>
            <p className="text-sm text-muted-foreground">
                {t('offline.message')}
            </p>
        </main>
    );
}
