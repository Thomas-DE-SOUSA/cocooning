import { NoteListKindEnum } from './note-list-kind.enum';

describe('Feature: the sections of the Lists tab (R26)', () => {
    describe('Scenario: listing the sections', () => {
        it('has groceries and tasks, each value equal to its key', () => {
            expect(NoteListKindEnum).toEqual({
                GROCERIES: 'GROCERIES',
                TASKS: 'TASKS',
            });
        });
    });
});
