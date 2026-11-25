import { CreateNoteRequestSchema } from './create-note.request';

const FOLDER_ID = '01936b2e-7c4a-7000-8000-0000000000a1';

describe('Feature: the place of a new note (R2, R11)', () => {
    it('puts it at the root of « Partagé » when no place is sent', () => {
        expect(CreateNoteRequestSchema.parse({ title: 'Courses' })).toEqual({
            title: 'Courses',
            space: 'SHARED',
            folderId: null,
        });
    });

    it('keeps the space and the folder sent', () => {
        const body = { title: 'Idées', space: 'PRIVATE', folderId: FOLDER_ID };
        expect(CreateNoteRequestSchema.parse(body)).toEqual(body);
    });

    it.each([
        ['an unknown space', { title: 'Courses', space: 'BOTH' }],
        ['a folder that is not a UUID', { title: 'Courses', folderId: 'x' }],
    ])('rejects %s', (_label, body) => {
        expect(CreateNoteRequestSchema.safeParse(body).success).toBe(false);
    });
});
