import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerTranslation } from '@/i18n/server';
import {
    loadMyCouple,
    PAIRING_NAMESPACE,
    PairingContainer,
    presentPairingPage,
} from '@/modules/pairing';
import { SignOutContainer } from '@/modules/authentication';

export async function generateMetadata(): Promise<Metadata> {
    const t = await getServerTranslation(PAIRING_NAMESPACE);
    return { title: t('title') };
}

// Read for the signed-in partner on every request, never prerendered at build (decision 0036).
export const dynamic = 'force-dynamic';

export default async function PairingPage() {
    const page = presentPairingPage(await loadMyCouple(), new Date());
    if (page.redirectTo !== null) redirect(page.redirectTo);
    const t = await getServerTranslation(PAIRING_NAMESPACE);
    return (
        <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-5 py-6">
            <h1 className="text-3xl font-semibold">{t('title')}</h1>
            <PairingContainer viewModel={page.viewModel} />
            <SignOutContainer />
        </main>
    );
}
