'use client';

import { Pencil, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { NOTE_LISTS_NAMESPACE } from '../../data/note-lists-i18n-namespaces';
import type { NoteListViewModel } from '../../view-models/note-list-page.view-model';
import { SheetAction } from '../components/sheet-action';
import { SheetHeading } from '../components/sheet-heading';

type Props = {
    readonly list: NoteListViewModel;
    readonly onEditDetails: () => void;
    readonly onAskDeletion: () => void;
};

// R6, R26: both partners of a shared list change its title and emoji; R7: only its owner deletes it.
export function ListActionsSheetView({
    list,
    onEditDetails,
    onAskDeletion,
}: Props) {
    const { t } = useTranslation(NOTE_LISTS_NAMESPACE);
    return (
        <>
            <SheetHeading
                title={list.title}
                description={t(`sections.${list.kind}`)}
            />
            <ul className="flex flex-col px-5 pb-6">
                <SheetAction
                    icon={Pencil}
                    label={t('listSheet.editDetails')}
                    isDestructive={false}
                    onClick={onEditDetails}
                />
                {list.isOwner ? (
                    <SheetAction
                        icon={Trash2}
                        label={t('listSheet.delete')}
                        isDestructive
                        onClick={onAskDeletion}
                    />
                ) : (
                    <li className="py-3 text-sm text-muted-foreground">
                        {t('listSheet.ownerOnly')}
                    </li>
                )}
            </ul>
        </>
    );
}
