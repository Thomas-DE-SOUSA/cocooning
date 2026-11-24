import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerTranslation } from '@/i18n/server';
import {
    loadFirstMessageFeedPage,
    loadTodayPhotoPrompt,
    MESSAGING_NAMESPACE,
    MessagesContainer,
    presentMessagesPage,
} from '@/modules/messaging';
import { loadMyCouple, resolveHomeDestination } from '@/modules/pairing';

export async function generateMetadata(): Promise<Metadata> {
    const t = await getServerTranslation(MESSAGING_NAMESPACE);
    return { title: t('title') };
}

// Read for the signed-in partner on every request, never prerendered at build (decision 0036).
export const dynamic = 'force-dynamic';

// The "Messages" tab: today's photo prompt, the feed newest first, the composer above the tab bar.
export default async function MessagesPage() {
    const [couple, feed, prompt] = await Promise.all([
        loadMyCouple(),
        loadFirstMessageFeedPage(),
        loadTodayPhotoPrompt(),
    ]);
    const destination = resolveHomeDestination(couple);
    if (destination !== null) redirect(destination);
    const page = presentMessagesPage({ feed, prompt, now: new Date() });
    if (page.redirectTo !== null) redirect(page.redirectTo);
    const t = await getServerTranslation(MESSAGING_NAMESPACE);
    return (
        <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col gap-4 px-5 pt-10 pb-40">
            <h1 className="text-3xl font-semibold">{t('title')}</h1>
            <MessagesContainer viewModel={page.viewModel} />
        </main>
    );
}
