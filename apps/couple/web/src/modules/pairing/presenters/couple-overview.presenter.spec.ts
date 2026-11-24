import { ApiErrorCodeEnum } from '@cocooning/couple-client-business-logic/shared';
import {
    A_PAIRED_COUPLE,
    A_PENDING_COUPLE,
} from '@cocooning/couple-client-business-logic/testing';
import { fail, ok } from '@cocooning/shared-kernel/utils';
import { presentCoupleOverviewPage } from './couple-overview.presenter';

const NOW = new Date('2026-11-24T10:00:00.000Z');

describe('Feature: the page of our couple', () => {
    it('tells since when the couple is formed: the day the last partner joined', () => {
        expect(presentCoupleOverviewPage(ok(A_PAIRED_COUPLE), NOW)).toEqual({
            redirectTo: null,
            viewModel: { formedAt: '23 novembre 2026', togetherTime: null },
        });
    });

    it('sends a couple waiting for the second partner to the pairing page', () => {
        expect(
            presentCoupleOverviewPage(ok(A_PENDING_COUPLE), NOW).redirectTo,
        ).toBe('/pairing');
    });

    it('sends a refused session to the sign-in screen', () => {
        const refusal = fail({
            code: ApiErrorCodeEnum.UNAUTHORIZED,
            message: 'Refused',
            backendCode: null,
        });

        expect(presentCoupleOverviewPage(refusal, NOW).redirectTo).toBe(
            '/sign-in',
        );
    });

    it('tells how long the couple has been together once its periods are recorded', () => {
        const couple = {
            ...A_PAIRED_COUPLE,
            togetherPeriods: [{ startedOn: '2026-11-04', endedOn: null }],
        };

        expect(
            presentCoupleOverviewPage(ok(couple), NOW).viewModel?.togetherTime,
        ).toEqual({ days: '20', years: '0,05' });
    });
});
