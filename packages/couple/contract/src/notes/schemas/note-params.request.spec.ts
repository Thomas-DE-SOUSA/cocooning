import { NoteParamsRequestSchema } from './note-params.request';

describe('Feature: the note named in a route', () => {
    it('accepts a UUID', () => {
        const noteId = '01936b2e-7c4a-7000-8000-0000000000a1';
        expect(NoteParamsRequestSchema.parse({ noteId })).toEqual({ noteId });
    });

    it.each([['not-a-uuid'], ['']])('rejects %p', (noteId) => {
        expect(NoteParamsRequestSchema.safeParse({ noteId }).success).toBe(
            false,
        );
    });
});
