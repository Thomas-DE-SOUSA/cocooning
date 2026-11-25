import {
    createFolderNameFormSchema,
    type FolderNameForm,
} from '@cocooning/couple-client-business-logic/notes';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { type UseFormReturn, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { NOTE_SPACE_NAMESPACE } from '../data/note-space-i18n-namespaces';

// R13: the name of a new or renamed folder, with the messages of the space screen (decision 0031).
export function useFolderNameForm(name: string): UseFormReturn<FolderNameForm> {
    const { t } = useTranslation(NOTE_SPACE_NAMESPACE);
    const schema = useMemo(() => createFolderNameFormSchema(t), [t]);
    return useForm<FolderNameForm>({
        resolver: zodResolver(schema),
        defaultValues: { name },
        mode: 'onSubmit',
        reValidateMode: 'onChange',
    });
}
