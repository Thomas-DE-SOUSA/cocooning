import { fail, ok } from '@cocooning/shared-kernel/utils';
import { ApiErrorCodeEnum } from '../../../shared/api-error';
import { FakePairingGateway } from '../../../testing/fake-pairing.gateway';
import { CancelCoupleUseCase } from './cancel-couple.use-case';

const ALREADY_PAIRED = {
    code: ApiErrorCodeEnum.CONFLICT,
    message: 'Couple already paired',
    backendCode: 'PAIRING_COUPLE_ALREADY_PAIRED',
};

describe('Feature: R8, the single partner cancels a pending couple', () => {
    it('cancels the couple of the signed-in partner', async () => {
        const gateway = new FakePairingGateway();

        await expect(
            new CancelCoupleUseCase(gateway).execute(),
        ).resolves.toEqual(ok(null));
        expect(gateway.calls).toEqual([{ operation: 'cancelCouple' }]);
    });

    it('returns the refusal of a couple already formed', async () => {
        const gateway = new FakePairingGateway();
        gateway.givenRefusal(ALREADY_PAIRED);

        await expect(
            new CancelCoupleUseCase(gateway).execute(),
        ).resolves.toEqual(fail(ALREADY_PAIRED));
    });
});
