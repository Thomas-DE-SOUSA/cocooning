'use client';

import { useTranslation } from 'react-i18next';
import { NOTES_NAMESPACE } from '../../data/notes-i18n-namespaces';
import type { NoteListItem } from '../../view-models/notes-screen.view-model';
import {
    NoteOwnerActions,
    type NoteOwnerActionsProps,
} from './note-owner-actions';

type Props = Omit<NoteOwnerActionsProps, 'isShared'> & {
    readonly note: NoteListItem;
};

export function NoteItem({ note, ...actions }: Props) {
    const { t } = useTranslation(NOTES_NAMESPACE);
    return (
        <li className="flex flex-col gap-2 rounded-lg border border-border p-4">
            <h2 className="font-medium break-words">{note.title}</h2>
            <p className="text-sm text-muted-foreground">
                {[
                    t(note.isOwner ? 'note.mine' : 'note.partner'),
                    t(note.isShared ? 'note.shared' : 'note.private'),
                    t('note.updatedAt', { updatedAt: note.updatedAt }),
                ].join(' · ')}
            </p>
            {note.isOwner ? (
                <NoteOwnerActions
                    isShared={note.isShared}
                    {...actions}
                />
            ) : null}
        </li>
    );
}
