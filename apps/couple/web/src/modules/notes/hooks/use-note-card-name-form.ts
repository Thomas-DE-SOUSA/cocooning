import {
    createNoteCardNameFormSchema,
    type NoteCardNameForm,
} from '@cocooning/couple-client-business-logic/notes';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { type UseFormReturn, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { NOTE_CARD_NAMESPACE } from '../data/note-card-i18n-namespaces';

// R19: the name of an item added to a smart folder, with the messages of the cards (decision 0031).
export function useNoteCardNameForm(): UseFormReturn<NoteCardNameForm> {
    const { t } = useTranslation(NOTE_CARD_NAMESPACE);
    const schema = useMemo(() => createNoteCardNameFormSchema(t), [t]);
    return useForm<NoteCardNameForm>({
        resolver: zodResolver(schema),
        defaultValues: { name: '' },
        mode: 'onSubmit',
        reValidateMode: 'onChange',
    });
}
