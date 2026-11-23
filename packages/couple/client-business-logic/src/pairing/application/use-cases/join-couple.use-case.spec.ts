import { PairingExceptionCodeEnum } from '@cocooning/couple-contract/pairing';
import { fail, ok } from '@cocooning/shared-kernel/utils';
import { type ApiError, ApiErrorCodeEnum } from '../../../shared/api-error';
import {
    A_PAIRED_COUPLE,
    FakePairingGateway,
} from '../../../testing/fake-pairing.gateway';
import { JoinCoupleUseCase } from './join-couple.use-case';

describe('Feature: R5, the second partner enters the invitation code', () => {
    let gateway: FakePairingGateway;

    beforeEach(() => {
        gateway = new FakePairingGateway();
    });

    describe('Scenario: a valid code', () => {
        it('sends the code as typed, the domain normalizing it (R3)', async () => {
            gateway.givenCouple(A_PAIRED_COUPLE);

            await expect(
                new JoinCoupleUseCase(gateway).execute({
                    invitationCode: 'k7m2 q9xr',
                }),
            ).resolves.toEqual(ok(A_PAIRED_COUPLE));
            expect(gateway.calls).toEqual([
                {
                    operation: 'joinCouple',
                    request: { invitationCode: 'k7m2 q9xr' },
                },
            ]);
        });
    });

    describe('Scenario: R6, a wrong code', () => {
        it('returns the single refusal unchanged', async () => {
            const refusal: ApiError = {
                code: ApiErrorCodeEnum.VALIDATION_ERROR,
                message: 'Invitation code invalid',
                backendCode:
                    PairingExceptionCodeEnum.PAIRING_INVITATION_CODE_INVALID,
            };
            gateway.givenRefusal(refusal);

            await expect(
                new JoinCoupleUseCase(gateway).execute({
                    invitationCode: 'WRONG123',
                }),
            ).resolves.toEqual(fail(refusal));
        });
    });
});
