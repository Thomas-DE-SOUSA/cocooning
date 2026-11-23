import { JoinCoupleUseCase } from '@cocooning/couple-client-business-logic/pairing';
import {
    type ApiError,
    ApiErrorCodeEnum,
} from '@cocooning/couple-client-business-logic/shared';
import {
    A_PAIRED_COUPLE,
    FakePairingGateway,
} from '@cocooning/couple-client-business-logic/testing';
import { PairingExceptionCodeEnum } from '@cocooning/couple-contract/pairing';
import { fail, ok } from '@cocooning/shared-kernel/utils';
import { type JoinCoupleContext, joinCouple } from './join-couple.service';

describe('Feature: R5, the second partner joins from the form', () => {
    let gateway: FakePairingGateway;
    let context: JoinCoupleContext;

    beforeEach(() => {
        gateway = new FakePairingGateway();
        gateway.givenCouple(A_PAIRED_COUPLE);
        context = {
            t: (key) => key,
            joinCouple: new JoinCoupleUseCase(gateway),
        };
    });

    it('sends the code without its surrounding spaces, the domain normalizing the rest (R3)', async () => {
        await expect(
            joinCouple({ invitationCode: '  k7m2 q9xr ' }, context),
        ).resolves.toEqual(ok(null));
        expect(gateway.calls).toEqual([
            {
                operation: 'joinCouple',
                request: { invitationCode: 'k7m2 q9xr' },
            },
        ]);
    });

    it.each([
        ['an empty code', { invitationCode: '' }],
        ['not an object', 'K7M2Q9XR'],
    ])('refuses %s without calling the API', async (_label, input) => {
        const result = await joinCouple(input, context);

        expect(result.success === false && result.error.code).toBe(
            ApiErrorCodeEnum.VALIDATION_ERROR,
        );
        expect(gateway.calls).toEqual([]);
    });

    it('gives the single refusal of a wrong code unchanged (R6)', async () => {
        const refusal: ApiError = {
            code: ApiErrorCodeEnum.VALIDATION_ERROR,
            message: 'Invitation code invalid',
            backendCode:
                PairingExceptionCodeEnum.PAIRING_INVITATION_CODE_INVALID,
        };
        gateway.givenRefusal(refusal);

        await expect(
            joinCouple({ invitationCode: 'WRONG123' }, context),
        ).resolves.toEqual(fail(refusal));
    });
});
