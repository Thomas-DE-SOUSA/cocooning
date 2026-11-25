import { NoteCardStatusEnum } from './note-card-status.enum';

describe('Feature: the statuses of a note card (R19 to R23)', () => {
    describe('Scenario: listing the statuses', () => {
        it('has the five statuses, each value equal to its key', () => {
            expect(NoteCardStatusEnum).toEqual({
                PENDING: 'PENDING',
                CHOOSING: 'CHOOSING',
                FILLED: 'FILLED',
                FAILED: 'FAILED',
                LIMIT_REACHED: 'LIMIT_REACHED',
            });
        });
    });
});
