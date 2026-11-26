import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerTranslation } from '@/i18n/server';
import {
    loadNoteLists,
    NOTE_LISTS_NAMESPACE,
    NoteListsContainer,
    noteListKindOf,
    presentNoteListsPage,
    presentNoteListsQuery,
} from '@/modules/notes';
import { loadMyCouple, resolveHomeDestination } from '@/modules/pairing';

type Props = {
    readonly searchParams: Promise<
        Readonly<Record<string, string | string[] | undefined>>
    >;
};

export async function generateMetadata(): Promise<Metadata> {
    const t = await getServerTranslation(NOTE_LISTS_NAMESPACE);
    return { title: t('title') };
}

// Read for the signed-in partner on every request, never prerendered at build (decision 0036).
export const dynamic = 'force-dynamic';

// The "Listes" tab: Courses, Tâches, Envies, and the lists of the section shown (decision 0058).
export default async function NoteListsPage({ searchParams }: Props) {
    const section = presentNoteListsQuery(await searchParams);
    const [couple, reading] = await Promise.all([
        loadMyCouple(),
        loadNoteLists(noteListKindOf(section)),
    ]);
    const destination = resolveHomeDestination(couple);
    if (destination !== null) redirect(destination);
    const page = presentNoteListsPage(section, reading);
    if (page.redirectTo !== null) redirect(page.redirectTo);
    const t = await getServerTranslation(NOTE_LISTS_NAMESPACE);
    return (
        <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col gap-4 px-5 pt-10 pb-24">
            <h1 className="text-3xl font-semibold">{t('title')}</h1>
            <NoteListsContainer
                key={section}
                viewModel={page.viewModel}
            />
        </main>
    );
}
