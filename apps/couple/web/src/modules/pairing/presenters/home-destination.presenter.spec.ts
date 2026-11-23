import { ApiErrorCodeEnum } from '@cocooning/couple-client-business-logic/shared';
import {
    A_PAIRED_COUPLE,
    A_PENDING_COUPLE,
} from '@cocooning/couple-client-business-logic/testing';
import { fail, ok } from '@cocooning/shared-kernel/utils';
import { resolveHomeDestination } from './home-destination.presenter';

const aRefusal = (
    code: (typeof ApiErrorCodeEnum)[keyof typeof ApiErrorCodeEnum],
) => fail({ code, message: 'Refused', backendCode: null });

describe('Feature: who stays on the home page', () => {
    it('keeps a formed couple home', () => {
        expect(resolveHomeDestination(ok(A_PAIRED_COUPLE))).toBeNull();
    });

    it.each([
        ['a partner without couple', ok(null)],
        ['a couple waiting for the second partner', ok(A_PENDING_COUPLE)],
        ['an API that cannot answer', aRefusal(ApiErrorCodeEnum.NETWORK_ERROR)],
    ])('sends %s to the pairing page', (_label, couple) => {
        expect(resolveHomeDestination(couple)).toBe('/pairing');
    });

    it('sends a refused session to the sign-in screen', () => {
        expect(
            resolveHomeDestination(aRefusal(ApiErrorCodeEnum.UNAUTHORIZED)),
        ).toBe('/sign-in');
    });
});
