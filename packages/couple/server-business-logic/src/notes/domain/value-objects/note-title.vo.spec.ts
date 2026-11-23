import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import { NOTE_TITLE_MAX_LENGTH } from '@cocooning/couple-shared-kernel/limits';
import { NoteTitle } from './note-title.vo';

describe('Feature: the title of a note (R8)', () => {
    it('keeps what the partner typed, without the surrounding spaces', () => {
        expect(NoteTitle.create('  Courses  ').value).toBe('Courses');
    });

    it('accepts exactly NOTE_TITLE_MAX_LENGTH signs', () => {
        const title = 'a'.repeat(NOTE_TITLE_MAX_LENGTH);
        expect(NoteTitle.create(title).value).toBe(title);
    });

    it.each([
        ['an empty title', ''],
        ['a title made of spaces', '   '],
        ['one sign too many', 'a'.repeat(NOTE_TITLE_MAX_LENGTH + 1)],
    ])('refuses %s', (_label, raw) => {
        expect(() => NoteTitle.create(raw)).toThrow(
            expect.objectContaining({
                code: NoteExceptionCodeEnum.NOTE_TITLE_INVALID,
                context: { min: 1, max: NOTE_TITLE_MAX_LENGTH },
            }),
        );
    });
});
