'use client';

import { useTranslation } from 'react-i18next';
import { NOTE_SPACE_NAMESPACE } from '../../data/note-space-i18n-namespaces';
import { noteSheetGateways } from '../../gateways';
import { useNewFolderSheet } from '../../hooks/use-new-folder-sheet';
import { presentLocation } from '../../presenters/note-place.presenter';
import { presentPlaceName } from '../../presenters/place-labels.presenter';
import type { NotePlace } from '../../view-models/note-place.view-model';
import { NoteSheetCommandEnum } from '../../view-models/note-sheet-command.view-model';
import { NewFolderSheetView } from '../views/new-folder-sheet.view';

type Props = {
    readonly place: NotePlace;
    readonly onClose: () => void;
};

// R13, R17: a classic folder, or a smart one whose subject and fields the AI proposes.
export function NewFolderSheetContainer({ place, onClose }: Props) {
    const { t } = useTranslation(NOTE_SPACE_NAMESPACE);
    const sheet = useNewFolderSheet({
        gateways: noteSheetGateways,
        destination: presentLocation(place),
        onClose,
    });
    return (
        <NewFolderSheetView
            form={sheet.form}
            description={t('newFolder.in', {
                place: presentPlaceName(place, t),
            })}
            kind={sheet.kind}
            template={sheet.template}
            isProposing={sheet.isProposing}
            isPending={sheet.pending === NoteSheetCommandEnum.CREATE_FOLDER}
            isBusy={sheet.isBusy}
            onKindChange={sheet.setKind}
            onPropose={() => void sheet.propose()}
            onSubmit={sheet.submit}
        />
    );
}
