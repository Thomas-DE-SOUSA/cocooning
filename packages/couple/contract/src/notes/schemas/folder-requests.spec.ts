import { CreateFolderRequestSchema } from './create-folder.request';
import { FolderParamsRequestSchema } from './folder-params.request';
import { MoveFolderRequestSchema } from './move-folder.request';
import { MoveNoteRequestSchema } from './move-note.request';
import { NoteSpaceContentsQueryRequestSchema } from './note-space-contents-query.request';
import { NoteSpaceParamsRequestSchema } from './note-space-params.request';

const FOLDER_ID = '01936b2e-7c4a-7000-8000-0000000000a1';

describe('Feature: the requests on folders (R10 to R16)', () => {
    describe('Scenario: creating a folder', () => {
        it('accepts a space, a parent or the root, and a trimmed name', () => {
            expect(
                CreateFolderRequestSchema.parse({
                    space: 'SHARED',
                    parentFolderId: null,
                    name: ' Restaurants ',
                }),
            ).toEqual({
                space: 'SHARED',
                parentFolderId: null,
                name: 'Restaurants',
            });
        });

        it.each([
            ['a missing parent', { space: 'SHARED', name: 'Restaurants' }],
            [
                'an unknown space',
                { space: 'BOTH', parentFolderId: null, name: 'Restaurants' },
            ],
            [
                'an empty name',
                { space: 'SHARED', parentFolderId: null, name: ' ' },
            ],
        ])('rejects %s', (_label, body) => {
            expect(CreateFolderRequestSchema.safeParse(body).success).toBe(
                false,
            );
        });
    });

    describe('Scenario: moving a folder or a note', () => {
        it('accepts a target folder or the root', () => {
            expect(
                MoveFolderRequestSchema.parse({ parentFolderId: FOLDER_ID }),
            ).toEqual({ parentFolderId: FOLDER_ID });
            expect(
                MoveNoteRequestSchema.parse({
                    space: 'PRIVATE',
                    folderId: null,
                }),
            ).toEqual({ space: 'PRIVATE', folderId: null });
        });

        it('rejects a target that is not a UUID or a missing space', () => {
            expect(
                MoveFolderRequestSchema.safeParse({ parentFolderId: 'x' })
                    .success,
            ).toBe(false);
            expect(
                MoveNoteRequestSchema.safeParse({ folderId: null }).success,
            ).toBe(false);
        });
    });

    describe('Scenario: the route and the query of a content', () => {
        it('reads the space and the folder, the root without a folder', () => {
            expect(
                NoteSpaceParamsRequestSchema.parse({ space: 'SHARED' }),
            ).toEqual({ space: 'SHARED' });
            expect(NoteSpaceContentsQueryRequestSchema.parse({})).toEqual({
                folderId: null,
            });
            expect(
                FolderParamsRequestSchema.parse({ folderId: FOLDER_ID }),
            ).toEqual({ folderId: FOLDER_ID });
        });

        it('rejects an unknown space and a folder that is not a UUID', () => {
            expect(
                NoteSpaceParamsRequestSchema.safeParse({ space: 'shared' })
                    .success,
            ).toBe(false);
            expect(
                NoteSpaceContentsQueryRequestSchema.safeParse({
                    folderId: '',
                }).success,
            ).toBe(false);
            expect(
                FolderParamsRequestSchema.safeParse({ folderId: 'x' }).success,
            ).toBe(false);
        });
    });
});
