import { CouplePairingStatusEnum } from './couple-pairing-status.enum';

describe('Feature: pairing status of a couple', () => {
    describe('Scenario: listing the statuses', () => {
        it('has a pending and a paired status, each value equal to its key', () => {
            expect(CouplePairingStatusEnum).toEqual({
                PENDING: 'PENDING',
                PAIRED: 'PAIRED',
            });
        });
    });
});
