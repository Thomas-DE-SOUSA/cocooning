import {
    type ApiError,
    ApiErrorCodeEnum,
} from '@cocooning/couple-client-business-logic/shared';
import {
    A_CALENDAR_EVENT_LIST,
    A_PAIRED_COUPLE,
} from '@cocooning/couple-client-business-logic/testing';
import { AgendaExceptionCodeEnum } from '@cocooning/couple-contract/agenda';
import { WebRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import { fail, ok } from '@cocooning/shared-kernel/utils';
import {
    type AgendaPage,
    AgendaStepEnum,
} from '../view-models/agenda-screen.view-model';
import { anEvent } from './__tests__/calendar-events';
import {
    type AgendaPageInput,
    presentAgendaPage,
} from './agenda-page.presenter';

const aRefusal = (
    code: ApiError['code'],
    backendCode: string | null,
): ApiError => ({ code, message: 'Refused', backendCode });

const AN_AGENDA: AgendaPageInput = {
    couple: ok(A_PAIRED_COUPLE),
    events: ok(A_CALENDAR_EVENT_LIST),
    dayEvents: null,
    query: { day: '2026-12-05', month: '2026-12' },
    today: '2026-11-24',
};

function calendarOf(page: AgendaPage) {
    if (page.viewModel?.step !== AgendaStepEnum.CALENDAR) {
        throw new Error('Expected the calendar step');
    }
    return page.viewModel;
}

describe('Feature: the agenda page (decision 0036)', () => {
    describe('Scenario: the API gives the events of the grid', () => {
        it('shows the month, its dots and starts on the chosen day', () => {
            const page = presentAgendaPage(AN_AGENDA);

            expect(page.redirectTo).toBeNull();
            expect(page.viewModel).toMatchObject({
                step: AgendaStepEnum.CALENDAR,
                initialDay: '2026-12-05',
                calendar: {
                    today: '2026-11-24',
                    month: '2026-12',
                    firstYear: 2015,
                    lastYear: 2036,
                },
            });
        });

        it('holds every day of the grid, so that a tap needs no server', () => {
            const { days } = calendarOf(presentAgendaPage(AN_AGENDA));

            const keys = Object.keys(days);
            expect(keys).toHaveLength(35);
            expect([keys[0], keys.at(-1)]).toEqual([
                '2026-11-30',
                '2027-01-03',
            ]);
            expect(days['2026-12-05']).toMatchObject({
                label: 'Samedi 5 décembre',
                isToday: false,
                items: [
                    { title: 'Cadeau surprise' },
                    { title: 'Diner chez Lea' },
                ],
            });
            expect(days['2026-12-06']).toEqual({
                label: 'Dimanche 6 décembre',
                isToday: false,
                items: [],
            });
        });

        it('adds the chosen day from its own list when another month is shown', () => {
            const { days } = calendarOf(
                presentAgendaPage({
                    ...AN_AGENDA,
                    query: { day: '2026-11-24', month: '2027-03' },
                    dayEvents: ok({
                        items: [
                            anEvent({
                                startsOn: '2026-11-24',
                                title: 'Ce soir',
                            }),
                        ],
                    }),
                }),
            );

            expect(days['2026-11-24']).toMatchObject({
                isToday: true,
                items: [{ title: 'Ce soir' }],
            });
            expect(Object.keys(days)).toHaveLength(36);
        });
    });

    describe('Scenario: the API refuses the reading', () => {
        it('sends a refused session back to sign-in', () => {
            const page = presentAgendaPage({
                ...AN_AGENDA,
                events: fail(aRefusal(ApiErrorCodeEnum.UNAUTHORIZED, null)),
            });
            expect(page.redirectTo).toBe(WebRouterEnum.ACCOUNT_SIGN_IN);
        });

        it('R4, sends a partner without a formed couple to pairing', () => {
            const notPaired = aRefusal(
                ApiErrorCodeEnum.NOT_FOUND,
                AgendaExceptionCodeEnum.CALENDAR_EVENT_COUPLE_NOT_PAIRED,
            );
            expect(
                presentAgendaPage({ ...AN_AGENDA, events: fail(notPaired) })
                    .redirectTo,
            ).toBe(WebRouterEnum.COUPLE_PAIRING);
            expect(
                presentAgendaPage({ ...AN_AGENDA, couple: ok(null) })
                    .redirectTo,
            ).toBe(WebRouterEnum.COUPLE_PAIRING);
        });

        it('shows any other failure on the screen, the chosen day included', () => {
            const error = aRefusal(ApiErrorCodeEnum.NETWORK_ERROR, null);
            expect(
                presentAgendaPage({ ...AN_AGENDA, dayEvents: fail(error) }),
            ).toEqual({
                redirectTo: null,
                viewModel: { step: AgendaStepEnum.UNAVAILABLE, error },
            });
        });
    });
});
