import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerTranslation } from '@/i18n/server';
import {
    loadNotesHome,
    NOTES_NAMESPACE,
    NotesContainer,
    presentNotesPage,
} from '@/modules/notes';
import { loadMyCouple, resolveHomeDestination } from '@/modules/pairing';

export async function generateMetadata(): Promise<Metadata> {
    const t = await getServerTranslation(NOTES_NAMESPACE);
    return { title: t('title') };
}

// Read for the signed-in partner on every request, never prerendered at build (decision 0036).
export const dynamic = 'force-dynamic';

// The home of the notes: the two spaces, then the notes changed last (decision 0053).
export default async function HomePage() {
    const destination = resolveHomeDestination(await loadMyCouple());
    if (destination !== null) redirect(destination);
    const page = presentNotesPage(await loadNotesHome());
    if (page.redirectTo !== null) redirect(page.redirectTo);
    const t = await getServerTranslation(NOTES_NAMESPACE);
    return (
        <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col gap-6 px-5 pt-10 pb-6">
            <h1 className="text-3xl font-semibold">{t('title')}</h1>
            <NotesContainer viewModel={page.viewModel} />
        </main>
    );
}
