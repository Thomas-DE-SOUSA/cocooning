'use client';

import { useTranslation } from 'react-i18next';
import { NOTES_NAMESPACE } from '../../data/notes-i18n-namespaces';
import type { NoteCommand } from '../../view-models/note-command.view-model';
import { NoteCommandEnum } from '../../view-models/note-command.view-model';
import { CommandButton } from '@/shared/ui/command-button';

export type NoteOwnerActionsProps = {
    readonly isShared: boolean;
    readonly pendingCommand: NoteCommand | null;
    readonly isBusy: boolean;
    readonly isDeletionAsked: boolean;
    readonly onShare: () => void;
    readonly onMakePrivate: () => void;
    readonly onAskDeletion: () => void;
    readonly onConfirmDeletion: () => void;
    readonly onKeep: () => void;
};

// R5, R7: only the owner sees these; a deletion asks once more, since it removes the note for both partners.
export function NoteOwnerActions(props: NoteOwnerActionsProps) {
    const { t } = useTranslation(NOTES_NAMESPACE);
    const isRunning = (command: NoteCommand) =>
        props.pendingCommand === command;
    if (props.isDeletionAsked) {
        return (
            <div className="flex flex-wrap gap-2">
                <CommandButton
                    variant="destructive"
                    label={t('note.confirmDelete')}
                    pendingLabel={t('note.deleting')}
                    isPending={isRunning(NoteCommandEnum.DELETE_NOTE)}
                    isBusy={props.isBusy}
                    onClick={props.onConfirmDeletion}
                />
                <CommandButton
                    variant="ghost"
                    label={t('note.keep')}
                    pendingLabel={t('note.keep')}
                    isPending={false}
                    isBusy={props.isBusy}
                    onClick={props.onKeep}
                />
            </div>
        );
    }
    return (
        <div className="flex flex-wrap gap-2">
            {props.isShared ? (
                <CommandButton
                    variant="secondary"
                    label={t('note.makePrivate')}
                    pendingLabel={t('note.makingPrivate')}
                    isPending={isRunning(NoteCommandEnum.MAKE_NOTE_PRIVATE)}
                    isBusy={props.isBusy}
                    onClick={props.onMakePrivate}
                />
            ) : (
                <CommandButton
                    variant="secondary"
                    label={t('note.share')}
                    pendingLabel={t('note.sharing')}
                    isPending={isRunning(NoteCommandEnum.SHARE_NOTE)}
                    isBusy={props.isBusy}
                    onClick={props.onShare}
                />
            )}
            <CommandButton
                variant="ghost"
                label={t('note.delete')}
                pendingLabel={t('note.delete')}
                isPending={false}
                isBusy={props.isBusy}
                onClick={props.onAskDeletion}
            />
        </div>
    );
}
