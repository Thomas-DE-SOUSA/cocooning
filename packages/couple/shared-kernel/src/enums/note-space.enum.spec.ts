import { NoteSpaceEnum } from './note-space.enum';

describe('Feature: the spaces of the notes (R10)', () => {
    describe('Scenario: listing the spaces', () => {
        it('has a shared and a private space, each value equal to its key', () => {
            expect(NoteSpaceEnum).toEqual({
                SHARED: 'SHARED',
                PRIVATE: 'PRIVATE',
            });
        });
    });
});
