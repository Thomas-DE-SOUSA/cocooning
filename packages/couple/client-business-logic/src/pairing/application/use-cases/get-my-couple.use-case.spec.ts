import { PairingExceptionCodeEnum } from '@cocooning/couple-contract/pairing';
import { fail, ok } from '@cocooning/shared-kernel/utils';
import { type ApiError, ApiErrorCodeEnum } from '../../../shared/api-error';
import {
    A_PAIRED_COUPLE,
    FakePairingGateway,
} from '../../../testing/fake-pairing.gateway';
import { GetMyCoupleUseCase } from './get-my-couple.use-case';

const NO_COUPLE: ApiError = {
    code: ApiErrorCodeEnum.NOT_FOUND,
    message: 'Couple not found',
    backendCode: PairingExceptionCodeEnum.PAIRING_COUPLE_NOT_FOUND,
};

describe('Feature: the PWA reads the couple of the signed-in partner', () => {
    let gateway: FakePairingGateway;
    let useCase: GetMyCoupleUseCase;

    beforeEach(() => {
        gateway = new FakePairingGateway();
        useCase = new GetMyCoupleUseCase(gateway);
    });

    describe('Scenario: the partner belongs to a couple', () => {
        it('returns the couple', async () => {
            gateway.givenCouple(A_PAIRED_COUPLE);

            await expect(useCase.execute()).resolves.toEqual(
                ok(A_PAIRED_COUPLE),
            );
            expect(gateway.calls).toEqual([{ operation: 'getMyCouple' }]);
        });
    });

    describe('Scenario: the partner has no couple yet', () => {
        it('returns no couple instead of a failure, for the invitation screen', async () => {
            gateway.givenRefusal(NO_COUPLE);

            await expect(useCase.execute()).resolves.toEqual(ok(null));
        });
    });

    describe('Scenario: the API refuses for another reason', () => {
        it.each([
            [
                'a session the API no longer accepts',
                {
                    code: ApiErrorCodeEnum.UNAUTHORIZED,
                    message: 'Session invalid',
                    backendCode: 'AUTHENTICATION_SESSION_INVALID',
                },
            ],
            [
                'a 404 without the pairing code',
                { ...NO_COUPLE, backendCode: null },
            ],
        ])('returns the refusal unchanged for %s', async (_label, refusal) => {
            gateway.givenRefusal(refusal);

            await expect(useCase.execute()).resolves.toEqual(fail(refusal));
        });
    });
});
