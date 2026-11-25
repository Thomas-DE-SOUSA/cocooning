import { FOLDER_NAME_MAX_LENGTH } from '@cocooning/couple-shared-kernel/limits';
import { FolderNameSchema } from './folder-name.zod';

describe('Feature: the name sent for a folder (R13)', () => {
    it('accepts a name without its surrounding spaces', () => {
        expect(FolderNameSchema.parse('  Restaurants ')).toBe('Restaurants');
    });

    it('accepts exactly FOLDER_NAME_MAX_LENGTH signs', () => {
        const name = 'a'.repeat(FOLDER_NAME_MAX_LENGTH);
        expect(FolderNameSchema.parse(name)).toBe(name);
    });

    it.each([
        ['an empty name', ''],
        ['a name made of spaces', '   '],
        ['one sign too many', 'a'.repeat(FOLDER_NAME_MAX_LENGTH + 1)],
        ['a name that is not a string', 42],
    ])('rejects %s', (_label, name) => {
        expect(FolderNameSchema.safeParse(name).success).toBe(false);
    });
});
