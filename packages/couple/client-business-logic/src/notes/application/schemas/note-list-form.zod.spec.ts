import {
    NOTE_LIST_EMOJI_MAX_LENGTH,
    NOTE_TITLE_MAX_LENGTH,
} from '@cocooning/couple-shared-kernel/limits';
import {
    createNoteListDetailsFormSchema,
    createNoteListFormSchema,
} from './note-list-form.zod';

const t = (key: string) => `t:${key}`;
const schema = createNoteListFormSchema(t);
const A_LIST = {
    kind: 'GROCERIES',
    space: 'SHARED',
    title: 'Carrefour',
    emoji: '',
};
const messagesOf = (input: Record<string, unknown>) => {
    const result = schema.safeParse({ ...A_LIST, ...input });
    return result.success
        ? []
        : result.error.issues.map(({ message }) => message);
};

describe('Feature: the title and the emoji typed for a list (R8, R26)', () => {
    it('trims the title and the emoji', () => {
        expect(
            schema.parse({ ...A_LIST, title: ' Noël ', emoji: ' 🎄 ' }),
        ).toEqual({ ...A_LIST, title: 'Noël', emoji: '🎄' });
    });

    it.each([
        ['empty', ''],
        ['made of spaces', '   '],
    ])('turns an emoji %s into null', (_label, emoji) => {
        expect(schema.parse({ ...A_LIST, emoji }).emoji).toBeNull();
    });

    it('accepts NOTE_LIST_EMOJI_MAX_LENGTH code points and a joined sequence', () => {
        expect(
            messagesOf({ emoji: '🍎'.repeat(NOTE_LIST_EMOJI_MAX_LENGTH) }),
        ).toEqual([]);
        expect(messagesOf({ emoji: '👨‍👩‍👧‍👦' })).toEqual([]);
    });

    it.each([
        ['an empty title', { title: ' ' }, 't:form.listTitle.errors.required'],
        [
            'a title one sign too long',
            { title: 'a'.repeat(NOTE_TITLE_MAX_LENGTH + 1) },
            't:form.listTitle.errors.tooLong',
        ],
        [
            'an emoji one code point too long',
            { emoji: '🍎'.repeat(NOTE_LIST_EMOJI_MAX_LENGTH + 1) },
            't:form.listEmoji.errors.tooLong',
        ],
        ['no section', { kind: null }, 't:form.listKind.errors.required'],
        ['no space', { space: 'BOTH' }, 't:form.listSpace.errors.required'],
    ])(
        'refuses %s with its translated message (decision 0031)',
        (_label, input, message) => {
            expect(messagesOf(input)).toEqual([message]);
        },
    );

    it('edits the title and the emoji alone', () => {
        expect(
            createNoteListDetailsFormSchema(t).parse({
                title: 'Lidl',
                emoji: '',
            }),
        ).toEqual({ title: 'Lidl', emoji: null });
    });
});
