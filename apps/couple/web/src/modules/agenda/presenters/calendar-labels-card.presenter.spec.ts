import { ApiErrorCodeEnum } from '@cocooning/couple-client-business-logic/shared';
import { A_CALENDAR_LABEL_LIST } from '@cocooning/couple-client-business-logic/testing';
import { fail, ok } from '@cocooning/shared-kernel/utils';
import { presentCalendarLabelsCard } from './calendar-labels-card.presenter';

describe('Feature: the labels card of the "Nous" tab (R12)', () => {
    it('lists the labels of the couple in creation order', () => {
        expect(presentCalendarLabelsCard(ok(A_CALENDAR_LABEL_LIST))).toEqual({
            step: 'LIST',
            labels: [
                {
                    calendarLabelId: '01936b2e-7c4a-7000-8000-0000000000b1',
                    name: 'Sport',
                    color: 'SAGE',
                },
                {
                    calendarLabelId: '01936b2e-7c4a-7000-8000-0000000000b2',
                    name: 'Famille',
                    color: 'ROSE',
                },
            ],
        });
    });

    it('says why the labels could not be read', () => {
        const error = {
            code: ApiErrorCodeEnum.NETWORK_ERROR,
            message: 'Unreachable',
            backendCode: null,
        };

        expect(presentCalendarLabelsCard(fail(error))).toEqual({
            step: 'UNAVAILABLE',
            error,
        });
    });
});
