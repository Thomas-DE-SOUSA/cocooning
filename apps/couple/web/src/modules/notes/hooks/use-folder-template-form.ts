import {
    createFolderTemplateFormSchema,
    type FolderTemplateForm,
} from '@cocooning/couple-client-business-logic/notes';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { type UseFormReturn, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { NOTE_SPACE_NAMESPACE } from '../data/note-space-i18n-namespaces';
import type { FolderTemplate } from '../view-models/note-space-screen.view-model';

// R17: the subject and the fields of a smart folder, from those it reads, with the messages of the space (decision 0031).
export function useFolderTemplateForm(
    template: FolderTemplate,
): UseFormReturn<FolderTemplateForm> {
    const { t } = useTranslation(NOTE_SPACE_NAMESPACE);
    const schema = useMemo(() => createFolderTemplateFormSchema(t), [t]);
    return useForm<FolderTemplateForm>({
        resolver: zodResolver(schema),
        defaultValues: {
            subject: template.subject,
            fields: [...template.fields],
        },
        mode: 'onSubmit',
        reValidateMode: 'onChange',
    });
}
