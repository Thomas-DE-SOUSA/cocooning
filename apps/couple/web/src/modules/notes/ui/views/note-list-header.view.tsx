'use client';

import { NoteSpaceEnum } from '@cocooning/couple-shared-kernel/enums';
import { useTranslation } from 'react-i18next';
import { NOTE_LISTS_NAMESPACE } from '../../data/note-lists-i18n-namespaces';
import type { NoteListViewModel } from '../../view-models/note-list-page.view-model';
import { BackLink } from '../components/back-link';

type Props = { readonly list: NoteListViewModel };

// The way back to the section of the list, then its emoji, its title and for whom it is (R26).
export function NoteListHeaderView({ list }: Props) {
    const { t } = useTranslation(NOTE_LISTS_NAMESPACE);
    const space = list.isShared ? NoteSpaceEnum.SHARED : NoteSpaceEnum.PRIVATE;
    return (
        <>
            <div className="flex min-h-11 items-center gap-2">
                <BackLink
                    href={list.backHref}
                    label={t(`sections.${list.kind}`)}
                />
            </div>
            <div className="flex items-baseline justify-between gap-3 px-1">
                <h1 className="min-w-0 text-3xl font-semibold break-words">
                    {list.emoji === null
                        ? list.title
                        : `${list.emoji} ${list.title}`}
                </h1>
                <span className="shrink-0 text-sm font-semibold text-muted-foreground">
                    {t(`spaces.${space}`)}
                </span>
            </div>
        </>
    );
}
