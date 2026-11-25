import type { SmartFolderForm } from '@cocooning/couple-client-business-logic/notes';
import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import type { FolderTemplateProposalResponse } from '@cocooning/couple-contract/notes';
import { FolderKindEnum } from '@cocooning/couple-shared-kernel/enums';
import { toast } from '@cocooning/design-system';
import { useCallback } from 'react';
import { useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { describeApiResultError } from '@/shared/application/api-result/describe-api-result-error';
import { NOTE_SPACE_NAMESPACE } from '../data/note-space-i18n-namespaces';
import type { NoteSheetGateways } from '../gateways/ports/note-sheet.gateways';
import type { NoteLocation } from '../view-models/note-place.view-model';
import { useCardFieldsDraft } from './use-card-fields-draft';
import { useFolderTemplateProposal } from './use-folder-template-proposal';
import { useNewFolderForm } from './use-new-folder-form';
import { useNoteSheetCommands } from './use-note-sheet-commands';
import { useNoteSheetFeedback } from './use-note-sheet-feedback';

type Options = {
    readonly gateways: NoteSheetGateways;
    readonly destination: NoteLocation;
    readonly onClose: () => void;
};

// Composition hook of « Nouveau dossier » (R13, R17): the AI fills the subject and the fields; when it does not
// answer, a toast says so and the couple writes them by hand.
export function useNewFolderSheet({ gateways, destination, onClose }: Options) {
    const { t } = useTranslation(NOTE_SPACE_NAMESPACE);
    const { form, kind, setKind } = useNewFolderForm();
    const fields = useWatch({ control: form.control, name: 'fields' });
    const setFields = useCallback(
        (next: string[]) =>
            form.setValue('fields', next, {
                shouldValidate: form.formState.isSubmitted,
            }),
        [form],
    );
    const draft = useCardFieldsDraft(fields, setFields);
    const commands = useNoteSheetCommands({
        gateways,
        ...useNoteSheetFeedback(onClose),
    });
    const onProposed = useCallback(
        (proposal: FolderTemplateProposalResponse) => {
            form.setValue('subject', proposal.subject);
            setFields([...proposal.cardTemplate]);
        },
        [form, setFields],
    );
    const onProposalFailed = useCallback(
        (error: ApiError) =>
            toast.error(t('toast.proposeFailed'), {
                description: describeApiResultError(error, t),
            }),
        [t],
    );
    const proposal = useFolderTemplateProposal({
        gateway: gateways.folders,
        destination,
        onProposed,
        onFailed: onProposalFailed,
    });
    return {
        form,
        kind,
        setKind,
        template: {
            fields,
            error: draft.isDuplicate
                ? t('form.fields.errors.duplicate')
                : (form.formState.errors.fields?.message ?? null),
            newField: draft.newField,
            onNewFieldChange: draft.setNewField,
            onAddField: draft.addField,
            onRemoveField: draft.removeField,
        },
        isProposing: proposal.isProposing,
        isBusy: commands.isBusy || proposal.isProposing,
        pending: commands.pending,
        propose: async () => {
            if (!(await form.trigger('name'))) return;
            proposal.propose({ name: form.getValues('name').trim() });
        },
        submit: (values: SmartFolderForm) =>
            commands.createFolder(
                kind === FolderKindEnum.SMART ? values : { name: values.name },
                destination,
            ),
    };
}
