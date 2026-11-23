import {
    createNoteTitleFormSchema,
    type NoteTitleForm,
} from '@cocooning/couple-client-business-logic/notes';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { type UseFormReturn, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { NOTES_NAMESPACE } from '../data/notes-i18n-namespaces';

const EMPTY_FORM: NoteTitleForm = { title: '' };

export function useNoteTitleForm(): UseFormReturn<NoteTitleForm> {
    const { t } = useTranslation(NOTES_NAMESPACE);
    const schema = useMemo(() => createNoteTitleFormSchema(t), [t]);
    return useForm<NoteTitleForm>({
        resolver: zodResolver(schema),
        defaultValues: EMPTY_FORM,
        mode: 'onSubmit',
        reValidateMode: 'onChange',
    });
}
