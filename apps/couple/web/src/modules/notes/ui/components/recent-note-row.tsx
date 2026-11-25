'use client';

import { Card } from '@cocooning/design-system';
import { FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { NOTES_NAMESPACE } from '../../data/notes-i18n-namespaces';
import type { NoteListItem } from '../../view-models/notes-screen.view-model';
import { RowLink } from './row-link';

type Props = { readonly note: NoteListItem };

// A note changed lately: its title opens it, its space and its last change under it.
export function RecentNoteRow({ note }: Props) {
    const { t } = useTranslation(NOTES_NAMESPACE);
    const space = t(
        note.isShared ? 'spaces.SHARED.name' : 'spaces.PRIVATE.name',
    );
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
                    <p className="text-sm text-muted-foreground">
                        {[
                            space,
                            t('note.updatedAt', { updatedAt: note.updatedAt }),
                        ].join(' · ')}
                    </p>
                </div>
            </Card>
        </li>
    );
}
