'use client';

import { Card } from '@cocooning/design-system';
import Link from 'next/link';
import { NOTES_NAMESPACE } from '../../data/notes-i18n-namespaces';
import type { NoteListItem } from '../../view-models/notes-screen.view-model';
import { NoteMeta } from './note-meta';
import {
    NoteOwnerActions,
    type NoteOwnerActionsProps,
} from './note-owner-actions';
import { NoteVisibilityBadge } from './note-visibility-badge';

type Props = Omit<NoteOwnerActionsProps, 'isShared'> & {
    readonly note: NoteListItem;
};

export function NoteItem({ note, ...actions }: Props) {
    return (
        <li>
            <Card className="flex flex-col gap-2">
                <div className="flex items-start justify-between gap-3">
                    <h2 className="text-xl font-semibold break-words">
                        <Link
                            href={note.href}
                            className="underline-offset-4 hover:underline"
                        >
                            {note.title}
                        </Link>
                    </h2>
                    <NoteVisibilityBadge
                        namespace={NOTES_NAMESPACE}
                        isShared={note.isShared}
                    />
                </div>
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
            </Card>
        </li>
    );
}
