'use client';

import { useTranslation } from 'react-i18next';
import { NOTE_SPACE_NAMESPACE } from '../../data/note-space-i18n-namespaces';
import { noteSheetGateways } from '../../gateways';
import { useNoteSheetCommands } from '../../hooks/use-note-sheet-commands';
import { useNoteSheetFeedback } from '../../hooks/use-note-sheet-feedback';
import { useNoteTitleForm } from '../../hooks/use-note-title-form';
import { presentLocation } from '../../presenters/note-place.presenter';
import { presentPlaceName } from '../../presenters/place-labels.presenter';
import type { NotePlace } from '../../view-models/note-place.view-model';
import { NoteSheetCommandEnum } from '../../view-models/note-sheet-command.view-model';
import { NewNoteSheetView } from '../views/new-note-sheet.view';

type Props = {
    readonly place: NotePlace;
    readonly onClose: () => void;
};

export function NewNoteSheetContainer({ place, onClose }: Props) {
    const { t } = useTranslation(NOTE_SPACE_NAMESPACE);
    const form = useNoteTitleForm(NOTE_SPACE_NAMESPACE, '');
    const feedback = useNoteSheetFeedback(onClose);
    const commands = useNoteSheetCommands({
        gateways: noteSheetGateways,
        ...feedback,
    });
    return (
        <NewNoteSheetView
            form={form}
            placeName={presentPlaceName(place, t)}
            isPending={commands.pending === NoteSheetCommandEnum.CREATE_NOTE}
            isBusy={commands.isBusy}
            onCreate={(values) =>
                commands.createNote(values, presentLocation(place))
            }
        />
    );
}
