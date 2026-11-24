import { ApiErrorCodeEnum } from '@cocooning/couple-client-business-logic/shared';
import {
    A_PAIRED_COUPLE,
    A_PENDING_COUPLE,
} from '@cocooning/couple-client-business-logic/testing';
import { fail, ok } from '@cocooning/shared-kernel/utils';
import { presentCoupleOverviewPage } from './couple-overview.presenter';

describe('Feature: the page of our couple', () => {
    it('tells since when the couple is formed: the day the last partner joined', () => {
        expect(presentCoupleOverviewPage(ok(A_PAIRED_COUPLE))).toEqual({
            redirectTo: null,
            viewModel: { formedAt: '23 novembre 2026' },
        });
    });

    it('sends a couple waiting for the second partner to the pairing page', () => {
        expect(presentCoupleOverviewPage(ok(A_PENDING_COUPLE)).redirectTo).toBe(
            '/pairing',
        );
    });

    it('sends a refused session to the sign-in screen', () => {
        const refusal = fail({
            code: ApiErrorCodeEnum.UNAUTHORIZED,
            message: 'Refused',
            backendCode: null,
        });

        expect(presentCoupleOverviewPage(refusal).redirectTo).toBe('/sign-in');
    });
});
