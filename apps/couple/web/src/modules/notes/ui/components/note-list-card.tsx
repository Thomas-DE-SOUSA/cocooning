'use client';

import type { NoteListKind } from '@cocooning/couple-shared-kernel/enums';
import { ChevronRight, ListChecks } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { NOTE_LISTS_NAMESPACE } from '../../data/note-lists-i18n-namespaces';
import type { NoteListCard } from '../../view-models/note-lists-screen.view-model';

type Props = {
    readonly card: NoteListCard;
    readonly kind: NoteListKind;
};

// R28: a list of the home, with what is left to take (Courses) or to do (Tâches).
export function NoteListCardRow({ card, kind }: Props) {
    const { t } = useTranslation(NOTE_LISTS_NAMESPACE);
    const remaining =
        card.openItemCount === 0
            ? t(`home.allDone.${kind}`)
            : t(`home.remaining.${kind}`, { count: card.openItemCount });
    return (
        <li>
            <Link
                href={card.href}
                className="flex min-h-15 items-center gap-3 rounded-2xl border border-border bg-card px-3.5 py-2 focus-visible:outline-2 focus-visible:outline-ring"
            >
                <span
                    aria-hidden="true"
                    className="flex size-8 shrink-0 items-center justify-center text-2xl"
                >
                    {card.emoji ?? (
                        <ListChecks className="size-5 text-muted-foreground" />
                    )}
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="font-semibold break-words">
                        {card.title}
                    </span>
                    <span className="text-sm text-muted-foreground">
                        {remaining}
                    </span>
                </span>
                <ChevronRight
                    aria-hidden="true"
                    className="size-5 shrink-0 text-muted-foreground"
                />
            </Link>
        </li>
    );
}
