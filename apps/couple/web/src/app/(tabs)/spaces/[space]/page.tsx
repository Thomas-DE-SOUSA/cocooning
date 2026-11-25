import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerTranslation } from '@/i18n/server';
import {
    loadNoteSpaceContents,
    NOTE_SPACE_NAMESPACE,
    NoteSpaceContainer,
    presentNoteSpacePage,
    presentNoteSpaceQuery,
} from '@/modules/notes';
import { loadMyCouple, resolveHomeDestination } from '@/modules/pairing';

type Props = {
    readonly params: Promise<{ readonly space: string }>;
    readonly searchParams: Promise<
        Readonly<Record<string, string | string[] | undefined>>
    >;
};

export async function generateMetadata(): Promise<Metadata> {
    const t = await getServerTranslation(NOTE_SPACE_NAMESPACE);
    return { title: t('title') };
}

// Read for the signed-in partner on every request, never prerendered at build (decision 0036).
export const dynamic = 'force-dynamic';

// A space of the notes, or one of its folders: its folders, then its notes (decision 0053).
export default async function NoteSpacePage({ params, searchParams }: Props) {
    const query = presentNoteSpaceQuery(
        (await params).space,
        await searchParams,
    );
    if (query.redirectTo !== null) redirect(query.redirectTo);
    const { location } = query;
    const [couple, contents] = await Promise.all([
        loadMyCouple(),
        loadNoteSpaceContents(location),
    ]);
    const destination = resolveHomeDestination(couple);
    if (destination !== null) redirect(destination);
    const page = presentNoteSpacePage(location, contents);
    if (page.redirectTo !== null) redirect(page.redirectTo);
    return (
        <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col gap-6 px-5 pt-6 pb-24">
            <NoteSpaceContainer
                key={`${location.space}/${location.folderId}`}
                viewModel={page.viewModel}
            />
        </main>
    );
}
