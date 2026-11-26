import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerTranslation } from '@/i18n/server';
import {
    loadNoteList,
    NOTE_LISTS_NAMESPACE,
    NoteListPageContainer,
    noteCollaborationUrl,
    presentNoteListPage,
} from '@/modules/notes';
import { loadMyCouple, resolveHomeDestination } from '@/modules/pairing';

type Props = { readonly params: Promise<{ readonly noteId: string }> };

export async function generateMetadata(): Promise<Metadata> {
    const t = await getServerTranslation(NOTE_LISTS_NAMESPACE);
    return { title: t('title') };
}

// Read for the signed-in partner on every request, never prerendered at build (decision 0036).
export const dynamic = 'force-dynamic';

// A list to check at two (R29 to R32): its lines live in the shared document of the note, under the tab bar (decision 0059).
export default async function NoteListPage({ params }: Props) {
    const { noteId } = await params;
    const [couple, reading] = await Promise.all([
        loadMyCouple(),
        loadNoteList(noteId),
    ]);
    const destination = resolveHomeDestination(couple);
    if (destination !== null) redirect(destination);
    const page = presentNoteListPage(reading, couple);
    if (page.redirectTo !== null) redirect(page.redirectTo);
    return (
        <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col gap-3.5 px-5 pt-6 pb-6">
            <NoteListPageContainer
                key={noteId}
                viewModel={page.viewModel}
                collaborationUrl={noteCollaborationUrl()}
            />
        </main>
    );
}
