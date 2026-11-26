'use client';

import { NoteSpaceEnum } from '@cocooning/couple-shared-kernel/enums';
import { useTranslation } from 'react-i18next';
import { NOTE_LISTS_NAMESPACE } from '../../data/note-lists-i18n-namespaces';
import type { NoteListViewModel } from '../../view-models/note-list-page.view-model';
import { BackLink } from '../components/back-link';
import { PartnerPresenceBadge } from '../components/partner-presence-badge';
import { RowActionsButton } from '../components/row-actions-button';

type Props = {
    readonly list: NoteListViewModel;
    readonly isPartnerHere: boolean;
    readonly onActions: () => void;
};

// The way back to the section of the list and, while the other partner is in it, the sign of their presence (R32);
// then its emoji, its title and for whom it is (R26).
export function NoteListHeaderView({ list, isPartnerHere, onActions }: Props) {
    const { t } = useTranslation(NOTE_LISTS_NAMESPACE);
    const space = list.isShared ? NoteSpaceEnum.SHARED : NoteSpaceEnum.PRIVATE;
    return (
        <>
            <div className="flex min-h-11 items-center gap-2">
                <BackLink
                    href={list.backHref}
                    label={t(`sections.${list.kind}`)}
                />
                <span className="flex-1" />
                {isPartnerHere ? (
                    <PartnerPresenceBadge label={t('presence')} />
                ) : null}
                <RowActionsButton
                    label={t('actions')}
                    onClick={onActions}
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
