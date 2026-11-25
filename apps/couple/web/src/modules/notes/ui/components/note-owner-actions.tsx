'use client';

import { useTranslation } from 'react-i18next';
import { NOTES_NAMESPACE } from '../../data/notes-i18n-namespaces';
import type { NoteCommand } from '../../view-models/note-command.view-model';
import { NoteCommandEnum } from '../../view-models/note-command.view-model';
import { CommandButton } from '@/shared/ui/command-button';

export type NoteOwnerActionsProps = {
    readonly pendingCommand: NoteCommand | null;
    readonly isBusy: boolean;
    readonly isDeletionAsked: boolean;
    readonly onAskDeletion: () => void;
    readonly onConfirmDeletion: () => void;
    readonly onKeep: () => void;
};

// R7: only the owner sees these; a deletion asks once more, since it removes the note for both partners.
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
