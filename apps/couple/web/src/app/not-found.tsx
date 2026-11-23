import { WebRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import Link from 'next/link';
import { getServerTranslation } from '@/i18n/server';

export default async function NotFound() {
    const t = await getServerTranslation('generic');
    return (
        <main className="flex min-h-dvh flex-col items-center justify-center gap-4 p-4 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
                {t('notFound.title')}
            </h1>
            <Link
                href={WebRouterEnum.HOME}
                className="text-sm text-primary underline"
            >
                {t('notFound.backHome')}
            </Link>
        </main>
    );
}
