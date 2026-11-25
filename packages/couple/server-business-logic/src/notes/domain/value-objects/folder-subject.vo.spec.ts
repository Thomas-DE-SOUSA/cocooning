import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import { FOLDER_SUBJECT_MAX_LENGTH } from '@cocooning/couple-shared-kernel/limits';
import { FolderSubject } from './folder-subject.vo';

describe('Feature: the subject of a smart folder (R17)', () => {
    it('keeps the sentence without the surrounding spaces', () => {
        expect(FolderSubject.create('  Les restaurants  ').value).toBe(
            'Les restaurants',
        );
    });

    it('accepts exactly FOLDER_SUBJECT_MAX_LENGTH signs', () => {
        const subject = 'a'.repeat(FOLDER_SUBJECT_MAX_LENGTH);
        expect(FolderSubject.create(subject).value).toBe(subject);
    });

    it.each([
        ['an empty subject', ''],
        ['a subject made of spaces', '   '],
        ['one sign too many', 'a'.repeat(FOLDER_SUBJECT_MAX_LENGTH + 1)],
    ])('refuses %s', (_label, raw) => {
        expect(() => FolderSubject.create(raw)).toThrow(
            expect.objectContaining({
                code: NoteExceptionCodeEnum.FOLDER_SUBJECT_INVALID,
                context: { min: 1, max: FOLDER_SUBJECT_MAX_LENGTH },
            }),
        );
    });
});
