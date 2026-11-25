'use client';

import { Move, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { NOTE_SPACE_NAMESPACE } from '../../data/note-space-i18n-namespaces';
import type { NoteListItem } from '../../view-models/notes-screen.view-model';
import { SheetAction } from '../components/sheet-action';
import { SheetHeading } from '../components/sheet-heading';

type Props = {
    readonly note: NoteListItem;
    readonly onMove: () => void;
    readonly onAskDeletion: () => void;
};

// R5, R7: the owner moves or deletes her note; on the other's note, only a move within « Partagé » is offered (R11).
export function NoteActionsSheetView({ note, onMove, onAskDeletion }: Props) {
    const { t } = useTranslation(NOTE_SPACE_NAMESPACE);
    return (
        <>
            <SheetHeading
                title={note.title}
                description={t(note.isOwner ? 'note.mine' : 'note.partner')}
            />
            <div className="flex flex-col gap-3 px-5 pb-6">
                <ul className="flex flex-col">
                    <SheetAction
                        icon={Move}
                        label={t('noteSheet.move')}
                        isDestructive={false}
                        onClick={onMove}
                    />
                    {note.isOwner ? (
                        <SheetAction
                            icon={Trash2}
                            label={t('noteSheet.delete')}
                            isDestructive
                            onClick={onAskDeletion}
                        />
                    ) : null}
                </ul>
                {note.isOwner ? null : (
                    <p className="text-sm text-muted-foreground">
                        {t('noteSheet.partnerHint')}
                    </p>
                )}
            </div>
        </>
    );
}
