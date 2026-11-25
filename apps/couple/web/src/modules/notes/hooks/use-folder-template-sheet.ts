import { useCallback } from 'react';
import { useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { NOTE_SPACE_NAMESPACE } from '../data/note-space-i18n-namespaces';
import type { NoteSheetGateways } from '../gateways/ports/note-sheet.gateways';
import type { CardTemplateEditor } from '../view-models/card-template-editor.view-model';
import type { FolderTemplate } from '../view-models/note-space-screen.view-model';
import { useCardFieldsDraft } from './use-card-fields-draft';
import { useFolderTemplateForm } from './use-folder-template-form';
import { useNoteSheetCommands } from './use-note-sheet-commands';
import { useNoteSheetFeedback } from './use-note-sheet-feedback';

type Options = {
    readonly gateways: NoteSheetGateways;
    readonly folderId: string;
    readonly template: FolderTemplate;
    readonly onClose: () => void;
};

// Composition hook of « Modifier la fiche » (R17, R18, R22): either partner corrects the subject and the fields.
export function useFolderTemplateSheet({
    gateways,
    folderId,
    template,
    onClose,
}: Options) {
    const { t } = useTranslation(NOTE_SPACE_NAMESPACE);
    const form = useFolderTemplateForm(template);
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
    const editor: CardTemplateEditor = {
        fields,
        error: draft.isDuplicate
            ? t('form.fields.errors.duplicate')
            : (form.formState.errors.fields?.message ?? null),
        newField: draft.newField,
        onNewFieldChange: draft.setNewField,
        onAddField: draft.addField,
        onRemoveField: draft.removeField,
    };
    return {
        form,
        editor,
        pending: commands.pending,
        isBusy: commands.isBusy,
        save: form.handleSubmit((values) =>
            commands.editFolderTemplate(folderId, values),
        ),
    };
}
