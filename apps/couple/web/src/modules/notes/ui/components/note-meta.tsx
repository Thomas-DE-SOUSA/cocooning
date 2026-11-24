'use client';

import { useTranslation } from 'react-i18next';
import type { Namespace } from '@/i18n/resources';
import type { NoteListItem } from '../../view-models/notes-screen.view-model';

type Props = {
    readonly namespace: Namespace;
    readonly note: NoteListItem;
};

// Whose note it is and its last change: the same line in the list and on the page of a note.
export function NoteMeta({ namespace, note }: Props) {
    const { t } = useTranslation(namespace);
    return (
        <p className="text-sm text-muted-foreground">
            {[
                t(note.isOwner ? 'note.mine' : 'note.partner'),
                t('note.updatedAt', { updatedAt: note.updatedAt }),
            ].join(' · ')}
        </p>
    );
}
