import {
    NoteListKindEnum,
    NoteSpaceEnum,
} from '@cocooning/couple-shared-kernel/enums';
import {
    NOTE_LIST_EMOJI_MAX_LENGTH,
    NOTE_TITLE_MAX_LENGTH,
} from '@cocooning/couple-shared-kernel/limits';
import { z } from 'zod';
import type { Translator } from '../../../shared/translator';

// R8, R26, as the API checks them: a trimmed title, an optional emoji counted in code points like Zod does, empty becomes null.
export const createNoteListDetailsFormSchema = (t: Translator) =>
    z.object({
        title: z
            .string()
            .trim()
            .min(1, t('form.listTitle.errors.required'))
            .max(NOTE_TITLE_MAX_LENGTH, t('form.listTitle.errors.tooLong')),
        emoji: z
            .string()
            .trim()
            .max(NOTE_LIST_EMOJI_MAX_LENGTH, t('form.listEmoji.errors.tooLong'))
            .transform((emoji) => (emoji === '' ? null : emoji)),
    });

// R26: a new list also takes its section and its space (« Communes » or « Rien que pour moi »).
export const createNoteListFormSchema = (t: Translator) =>
    createNoteListDetailsFormSchema(t).extend({
        kind: z.enum(Object.values(NoteListKindEnum), {
            error: t('form.listKind.errors.required'),
        }),
        space: z.enum(Object.values(NoteSpaceEnum), {
            error: t('form.listSpace.errors.required'),
        }),
    });

export type NoteListDetailsForm = z.output<
    ReturnType<typeof createNoteListDetailsFormSchema>
>;

export type NoteListForm = z.output<
    ReturnType<typeof createNoteListFormSchema>
>;

export type NoteListFormInput = z.input<
    ReturnType<typeof createNoteListFormSchema>
>;
