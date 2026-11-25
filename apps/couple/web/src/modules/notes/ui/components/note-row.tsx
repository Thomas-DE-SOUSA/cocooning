'use client';

import { Card } from '@cocooning/design-system';
import { FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { NOTE_SPACE_NAMESPACE } from '../../data/note-space-i18n-namespaces';
import type { NoteListItem } from '../../view-models/notes-screen.view-model';
import { NoteMeta } from './note-meta';
import { RowActionsButton } from './row-actions-button';
import { RowLink } from './row-link';

type Props = {
    readonly note: NoteListItem;
    readonly onActions: () => void;
};

// A note of the screen: its title opens its page, whose it is and its last change under it, its « ⋯ » moves or deletes it.
export function NoteRow({ note, onActions }: Props) {
    const { t } = useTranslation(NOTE_SPACE_NAMESPACE);
    return (
        <li>
            <Card className="relative flex items-center gap-3 p-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground">
                    <FileText
                        aria-hidden="true"
                        className="size-5"
                    />
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <RowLink href={note.href}>{note.title}</RowLink>
                    <NoteMeta
                        namespace={NOTE_SPACE_NAMESPACE}
                        note={note}
                    />
                </div>
                <RowActionsButton
                    label={t('note.actions', { title: note.title })}
                    onClick={onActions}
                />
            </Card>
        </li>
    );
}
