import { NoteVisibilityEnum } from './note-visibility.enum';

describe('Feature: visibility of a note', () => {
    describe('Scenario: listing the visibilities', () => {
        it('has a private and a shared visibility, each value equal to its key', () => {
            expect(NoteVisibilityEnum).toEqual({
                PRIVATE: 'PRIVATE',
                SHARED: 'SHARED',
            });
        });
    });
});
