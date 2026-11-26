'use client';

import type { NoteListKind } from '@cocooning/couple-shared-kernel/enums';
import { NoteSpaceEnum } from '@cocooning/couple-shared-kernel/enums';
import { useTranslation } from 'react-i18next';
import { NOTE_LISTS_NAMESPACE } from '../../data/note-lists-i18n-namespaces';
import type {
    NoteListCard,
    NoteListsSectionTab,
} from '../../view-models/note-lists-screen.view-model';
import { ListSectionTabs } from '../components/list-section-tabs';
import { NoteListsGroup } from '../components/note-lists-group';

type Props = {
    readonly tabs: readonly NoteListsSectionTab[];
    // null for Envies, which has no list yet.
    readonly lists: {
        readonly kind: NoteListKind;
        readonly shared: readonly NoteListCard[];
        readonly mine: readonly NoteListCard[];
    } | null;
};

// R28: the sections of the tab, then the lists of the one shown, « Communes » first.
export function NoteListsHomeView({ tabs, lists }: Props) {
    const { t } = useTranslation(NOTE_LISTS_NAMESPACE);
    return (
        <>
            <ListSectionTabs tabs={tabs} />
            {lists === null ? (
                <p className="mx-1 text-muted-foreground">
                    {t('home.wishesSoon')}
                </p>
            ) : (
                <>
                    {lists.shared.length + lists.mine.length === 0 ? (
                        <p className="mx-1 text-muted-foreground">
                            {t(`home.empty.${lists.kind}`)}
                        </p>
                    ) : null}
                    <NoteListsGroup
                        title={t(`groups.${NoteSpaceEnum.SHARED}`)}
                        cards={lists.shared}
                        kind={lists.kind}
                    />
                    <NoteListsGroup
                        title={t(`groups.${NoteSpaceEnum.PRIVATE}`)}
                        cards={lists.mine}
                        kind={lists.kind}
                    />
                </>
            )}
        </>
    );
}
