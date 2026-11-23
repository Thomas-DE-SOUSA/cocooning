import { redirect } from 'next/navigation';
import { getServerTranslation } from '@/i18n/server';
import { loadMyCouple, resolveHomeDestination } from '@/modules/pairing';

// Read for the signed-in partner on every request, never prerendered at build (decision 0036).
export const dynamic = 'force-dynamic';

export default async function HomePage() {
    const destination = resolveHomeDestination(await loadMyCouple());
    if (destination !== null) redirect(destination);
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
