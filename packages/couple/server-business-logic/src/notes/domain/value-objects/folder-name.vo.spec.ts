import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import { FOLDER_NAME_MAX_LENGTH } from '@cocooning/couple-shared-kernel/limits';
import { FolderName } from './folder-name.vo';

describe('Feature: the name of a folder (R13)', () => {
    it('keeps what the partner typed, without the surrounding spaces', () => {
        expect(FolderName.create('  Restaurants  ').value).toBe('Restaurants');
    });

    it('accepts exactly FOLDER_NAME_MAX_LENGTH signs', () => {
        const name = 'a'.repeat(FOLDER_NAME_MAX_LENGTH);
        expect(FolderName.create(name).value).toBe(name);
    });

    it.each([
        ['an empty name', ''],
        ['a name made of spaces', '   '],
        ['one sign too many', 'a'.repeat(FOLDER_NAME_MAX_LENGTH + 1)],
    ])('refuses %s', (_label, raw) => {
        expect(() => FolderName.create(raw)).toThrow(
            expect.objectContaining({
                code: NoteExceptionCodeEnum.FOLDER_NAME_INVALID,
                context: { min: 1, max: FOLDER_NAME_MAX_LENGTH },
            }),
        );
    });
});
