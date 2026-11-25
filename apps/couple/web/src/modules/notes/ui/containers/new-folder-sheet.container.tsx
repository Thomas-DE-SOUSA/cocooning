'use client';

import { useTranslation } from 'react-i18next';
import { NOTE_SPACE_NAMESPACE } from '../../data/note-space-i18n-namespaces';
import { noteSheetGateways } from '../../gateways';
import { useFolderNameForm } from '../../hooks/use-folder-name-form';
import { useNoteSheetCommands } from '../../hooks/use-note-sheet-commands';
import { useNoteSheetFeedback } from '../../hooks/use-note-sheet-feedback';
import { presentLocation } from '../../presenters/note-place.presenter';
import { presentPlaceName } from '../../presenters/place-labels.presenter';
import type { NotePlace } from '../../view-models/note-place.view-model';
import { NoteSheetCommandEnum } from '../../view-models/note-sheet-command.view-model';
import { FolderNameSheetView } from '../views/folder-name-sheet.view';

type Props = {
    readonly place: NotePlace;
    readonly onClose: () => void;
};

// Decision 0053: lot 1 creates classic folders only, without the choice of an AI folder.
export function NewFolderSheetContainer({ place, onClose }: Props) {
    const { t } = useTranslation(NOTE_SPACE_NAMESPACE);
    const form = useFolderNameForm('');
    const feedback = useNoteSheetFeedback(onClose);
    const commands = useNoteSheetCommands({
        gateways: noteSheetGateways,
        ...feedback,
    });
    return (
        <FolderNameSheetView
            form={form}
            labels={{
                title: t('newFolder.title'),
                description: t('newFolder.in', {
                    place: presentPlaceName(place, t),
                }),
                submit: t('newFolder.submit'),
                pending: t('newFolder.creating'),
            }}
            isPending={commands.pending === NoteSheetCommandEnum.CREATE_FOLDER}
            isBusy={commands.isBusy}
            onSubmit={(values) =>
                commands.createFolder(values, presentLocation(place))
            }
        />
    );
}
