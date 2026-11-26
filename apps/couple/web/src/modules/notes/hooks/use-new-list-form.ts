import {
    createNoteListFormSchema,
    type NoteListForm,
    type NoteListFormInput,
} from '@cocooning/couple-client-business-logic/notes';
import {
    type NoteListKind,
    NoteSpaceEnum,
} from '@cocooning/couple-shared-kernel/enums';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { NOTE_LISTS_NAMESPACE } from '../data/note-lists-i18n-namespaces';

// R26: a new list of the section shown, shared by default; the emoji stays optional (decision 0031).
export function useNewListForm(kind: NoteListKind) {
    const { t } = useTranslation(NOTE_LISTS_NAMESPACE);
    const schema = useMemo(() => createNoteListFormSchema(t), [t]);
    return useForm<NoteListFormInput, unknown, NoteListForm>({
        resolver: zodResolver(schema),
        defaultValues: {
            kind,
            space: NoteSpaceEnum.SHARED,
            title: '',
            emoji: '',
        },
        mode: 'onSubmit',
        reValidateMode: 'onChange',
    });
}
