import {
    createNoteCardQueryFormSchema,
    type NoteCardQueryForm,
} from '@cocooning/couple-client-business-logic/notes';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { type UseFormReturn, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { NOTE_CARD_NAMESPACE } from '../data/note-card-i18n-namespaces';

// R19: « Précise (ville, quartier…) », with the messages of the cards (decision 0031).
export function useNoteCardQueryForm(): UseFormReturn<NoteCardQueryForm> {
    const { t } = useTranslation(NOTE_CARD_NAMESPACE);
    const schema = useMemo(() => createNoteCardQueryFormSchema(t), [t]);
    return useForm<NoteCardQueryForm>({
        resolver: zodResolver(schema),
        defaultValues: { query: '' },
        mode: 'onSubmit',
        reValidateMode: 'onChange',
    });
}
