import { ok } from '@cocooning/shared-kernel/utils';
import {
    A_PENDING_COUPLE,
    FakePairingGateway,
} from '../../../testing/fake-pairing.gateway';
import { CreateCoupleUseCase } from './create-couple.use-case';

describe('Feature: R2, the first partner creates the couple', () => {
    it('returns the pending couple with its invitation code', async () => {
        const gateway = new FakePairingGateway();

        await expect(
            new CreateCoupleUseCase(gateway).execute(),
        ).resolves.toEqual(ok(A_PENDING_COUPLE));
        expect(gateway.calls).toEqual([{ operation: 'createCouple' }]);
    });
});
