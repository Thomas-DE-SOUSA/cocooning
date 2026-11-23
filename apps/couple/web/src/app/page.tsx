import { getServerTranslation } from '@/i18n/server';

export default async function HomePage() {
    const t = await getServerTranslation('generic');
    return (
        <main className="flex min-h-dvh flex-col items-center justify-center gap-2 p-4 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
                {t('home.title')}
            </h1>
            <p className="text-sm text-muted-foreground">
                {t('home.subtitle')}
            </p>
        </main>
    );
}
