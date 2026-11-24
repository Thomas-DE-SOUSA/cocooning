import {
    createNoteTitleFormSchema,
    type NoteTitleForm,
} from '@cocooning/couple-client-business-logic/notes';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { type UseFormReturn, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { Namespace } from '@/i18n/resources';

// The messages come from the namespace of the screen that shows the form (decision 0031).
export function useNoteTitleForm(
    namespace: Namespace,
    title: string,
): UseFormReturn<NoteTitleForm> {
    const { t } = useTranslation(namespace);
    const schema = useMemo(() => createNoteTitleFormSchema(t), [t]);
    return useForm<NoteTitleForm>({
        resolver: zodResolver(schema),
        defaultValues: { title },
        mode: 'onSubmit',
        reValidateMode: 'onChange',
    });
}
