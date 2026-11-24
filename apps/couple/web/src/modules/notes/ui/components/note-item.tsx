'use client';

import Link from 'next/link';
import { NOTES_NAMESPACE } from '../../data/notes-i18n-namespaces';
import type { NoteListItem } from '../../view-models/notes-screen.view-model';
import { NoteMeta } from './note-meta';
import {
    NoteOwnerActions,
    type NoteOwnerActionsProps,
} from './note-owner-actions';

type Props = Omit<NoteOwnerActionsProps, 'isShared'> & {
    readonly note: NoteListItem;
};

export function NoteItem({ note, ...actions }: Props) {
    return (
        <li className="flex flex-col gap-2 rounded-lg border border-border p-4">
            <h2 className="font-medium break-words">
                <Link
                    href={note.href}
                    className="underline-offset-4 hover:underline"
                >
                    {note.title}
                </Link>
            </h2>
            <NoteMeta
                namespace={NOTES_NAMESPACE}
                note={note}
            />
            {note.isOwner ? (
                <NoteOwnerActions
                    isShared={note.isShared}
                    {...actions}
                />
            ) : null}
        </li>
    );
}
