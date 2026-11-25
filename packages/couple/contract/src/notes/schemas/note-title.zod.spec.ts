import { NOTE_TITLE_MAX_LENGTH } from '@cocooning/couple-shared-kernel/limits';
import { CreateNoteRequestSchema } from './create-note.request';
import { RenameNoteRequestSchema } from './rename-note.request';

describe.each([
    ['create', CreateNoteRequestSchema],
    ['rename', RenameNoteRequestSchema],
])('Feature: the title sent to %s a note (R8)', (_action, schema) => {
    it('accepts a title without its surrounding spaces', () => {
        expect(schema.parse({ title: '  Courses ' }).title).toBe('Courses');
    });

    it('accepts exactly NOTE_TITLE_MAX_LENGTH signs', () => {
        const title = 'a'.repeat(NOTE_TITLE_MAX_LENGTH);
        expect(schema.parse({ title }).title).toBe(title);
    });

    it.each([
        ['a missing title', {}],
        ['an empty title', { title: '' }],
        ['a title made of spaces', { title: '   ' }],
        ['one sign too many', { title: 'a'.repeat(NOTE_TITLE_MAX_LENGTH + 1) }],
        ['a title that is not a string', { title: 42 }],
    ])('rejects %s', (_label, body) => {
        expect(schema.safeParse(body).success).toBe(false);
    });
});
