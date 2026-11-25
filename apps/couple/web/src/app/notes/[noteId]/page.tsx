import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerTranslation } from '@/i18n/server';
import {
    loadNote,
    NOTE_NAMESPACE,
    NotePageContainer,
    noteCollaborationUrl,
    presentNotePage,
} from '@/modules/notes';

type Props = { readonly params: Promise<{ readonly noteId: string }> };

export async function generateMetadata(): Promise<Metadata> {
    const t = await getServerTranslation(NOTE_NAMESPACE);
    return { title: t('title') };
}

// Read for the signed-in partner on every request, never prerendered at build (decision 0036).
export const dynamic = 'force-dynamic';

export default async function NotePage({ params }: Props) {
    const { noteId } = await params;
    const page = presentNotePage(await loadNote(noteId));
    if (page.redirectTo !== null) redirect(page.redirectTo);
    return (
        <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col gap-4 px-5 pt-6 pb-6">
            <NotePageContainer
                key={noteId}
                viewModel={page.viewModel}
                collaborationUrl={noteCollaborationUrl()}
            />
        </main>
    );
}
