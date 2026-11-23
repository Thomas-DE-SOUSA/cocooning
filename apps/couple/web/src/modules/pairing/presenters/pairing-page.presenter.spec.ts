import { ApiErrorCodeEnum } from '@cocooning/couple-client-business-logic/shared';
import {
    A_PAIRED_COUPLE,
    A_PENDING_COUPLE,
} from '@cocooning/couple-client-business-logic/testing';
import { fail, ok } from '@cocooning/shared-kernel/utils';
import { PairingStepEnum } from '../view-models/pairing-screen.view-model';
import { presentPairingPage } from './pairing-page.presenter';

const aRefusal = (
    code: (typeof ApiErrorCodeEnum)[keyof typeof ApiErrorCodeEnum],
) => ({
    code,
    message: 'Refused',
    backendCode: null,
});

describe('Feature: what the pairing page shows', () => {
    describe('Scenario: R2, the partner has no couple yet', () => {
        it('offers to create the couple', () => {
            expect(presentPairingPage(ok(null))).toEqual({
                redirectTo: null,
                viewModel: { step: PairingStepEnum.NO_COUPLE },
            });
        });
    });

    describe('Scenario: R4, the couple waits for the second partner', () => {
        it('shows the code and its expiry in French, at Paris time', () => {
            expect(presentPairingPage(ok(A_PENDING_COUPLE))).toEqual({
                redirectTo: null,
                viewModel: {
                    step: PairingStepEnum.WAITING_FOR_PARTNER,
                    invitationCode: 'K7M2Q9XR',
                    expiresAt: '25 novembre 2026 à 09:00',
                },
            });
        });

        it('shows the screen unavailable for a pending couple without code', () => {
            const page = presentPairingPage(
                ok({ ...A_PENDING_COUPLE, invitationCode: null }),
            );
            expect(page.viewModel).toEqual({
                step: PairingStepEnum.UNAVAILABLE,
                error: expect.objectContaining({
                    code: ApiErrorCodeEnum.INVALID_RESPONSE,
                }),
            });
        });
    });

    describe('Scenario: R5, the couple is formed', () => {
        it('sends the partner home', () => {
            expect(presentPairingPage(ok(A_PAIRED_COUPLE))).toEqual({
                redirectTo: '/',
                viewModel: null,
            });
        });
    });

    describe('Scenario: decision 0036, the API refuses the session', () => {
        it('sends the partner to the sign-in screen', () => {
            expect(
                presentPairingPage(
                    fail(aRefusal(ApiErrorCodeEnum.UNAUTHORIZED)),
                ).redirectTo,
            ).toBe('/sign-in');
        });
    });

    describe('Scenario: the API cannot answer', () => {
        it('shows the screen unavailable with the error', () => {
            const refusal = aRefusal(ApiErrorCodeEnum.NETWORK_ERROR);
            expect(presentPairingPage(fail(refusal)).viewModel).toEqual({
                step: PairingStepEnum.UNAVAILABLE,
                error: refusal,
            });
        });
    });
});
