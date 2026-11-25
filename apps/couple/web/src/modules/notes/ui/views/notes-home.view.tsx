'use client';

import { useTranslation } from 'react-i18next';
import { NOTES_NAMESPACE } from '../../data/notes-i18n-namespaces';
import type {
    NoteListItem,
    NoteSpaceCard,
} from '../../view-models/notes-screen.view-model';
import { NotesSection } from '../components/notes-section';
import { RecentNoteRow } from '../components/recent-note-row';
import { SpaceCard } from '../components/space-card';

type Props = {
    readonly spaces: readonly NoteSpaceCard[];
    readonly recentNotes: readonly NoteListItem[];
};

// Decision 0053: the two spaces, then the notes changed last; a note is created inside a space, not here.
export function NotesHomeView({ spaces, recentNotes }: Props) {
    const { t } = useTranslation(NOTES_NAMESPACE);
    return (
        <>
            <ul className="flex flex-col gap-3">
                {spaces.map((card) => (
                    <SpaceCard
                        key={card.space}
                        card={card}
                    />
                ))}
            </ul>
            {recentNotes.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground">
                    {t('recent.empty')}
                </p>
            ) : (
                <NotesSection title={t('recent.title')}>
                    {recentNotes.map((note) => (
                        <RecentNoteRow
                            key={note.noteId}
                            note={note}
                        />
                    ))}
                </NotesSection>
            )}
        </>
    );
}
