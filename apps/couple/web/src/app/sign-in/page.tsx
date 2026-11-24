import type { Metadata } from 'next';
import { getServerTranslation } from '@/i18n/server';
import { SIGN_IN_NAMESPACE, SignInContainer } from '@/modules/authentication';

export async function generateMetadata(): Promise<Metadata> {
    const t = await getServerTranslation(SIGN_IN_NAMESPACE);
    return { title: t('title') };
}

export default async function SignInPage() {
    const t = await getServerTranslation(SIGN_IN_NAMESPACE);
    return (
        <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-5 py-6">
            <div className="flex flex-col items-center gap-1 text-center">
                <h1 className="text-3xl font-semibold">{t('title')}</h1>
                <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
            </div>
            <SignInContainer />
        </main>
    );
}
