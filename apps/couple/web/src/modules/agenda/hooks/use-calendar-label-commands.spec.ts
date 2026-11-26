import {
    type ApiError,
    ApiErrorCodeEnum,
} from '@cocooning/couple-client-business-logic/shared';
import { act, renderHook } from '@testing-library/react';
import {
    A_CREATED_LABEL_ID,
    FakeCalendarLabelCommandGateway,
} from '../gateways/fake/fake-calendar-label-command.gateway';
import { useCalendarLabelCommands } from './use-calendar-label-commands';

const LABEL_ID = '01936b2e-7c4a-7000-8000-0000000000b1';
const A_DRINK = { name: 'Verre', color: 'MINT' } as const;
const LIMIT: ApiError = {
    code: ApiErrorCodeEnum.CONFLICT,
    message: 'Too many labels',
    backendCode: 'CALENDAR_LABEL_LIMIT_REACHED',
};

function renderCommands(gateway: FakeCalendarLabelCommandGateway) {
    const events: string[] = [];
    const { result } = renderHook(() =>
        useCalendarLabelCommands({
            gateway,
            onDone: (command, label) =>
                events.push(`${command}:${label?.calendarLabelId ?? 'none'}`),
            onFailed: (command, error) =>
                events.push(`${command}:${error.backendCode}`),
        }),
    );
    return { result, events };
}

describe('Feature: the commands of the label sheet', () => {
    it('R12, creates a label and hands the new one over', async () => {
        const gateway = new FakeCalendarLabelCommandGateway();
        const { result, events } = renderCommands(gateway);

        await act(async () => result.current.createCalendarLabel(A_DRINK));

        expect(gateway.calls).toEqual([
            { operation: 'createCalendarLabel', form: A_DRINK },
        ]);
        expect(events).toEqual([`CREATE_CALENDAR_LABEL:${A_CREATED_LABEL_ID}`]);
        expect(result.current.pending).toBeNull();
    });

    it('R12, R14, edits then deletes a label', async () => {
        const gateway = new FakeCalendarLabelCommandGateway();
        const { result, events } = renderCommands(gateway);

        await act(async () =>
            result.current.editCalendarLabel(LABEL_ID, A_DRINK),
        );
        await act(async () => result.current.deleteCalendarLabel(LABEL_ID));

        expect(gateway.calls.map(({ operation }) => operation)).toEqual([
            'editCalendarLabel',
            'deleteCalendarLabel',
        ]);
        expect(events).toEqual([
            'EDIT_CALENDAR_LABEL:none',
            'DELETE_CALENDAR_LABEL:none',
        ]);
    });

    it('reports the refusal of the 21st label', async () => {
        const gateway = new FakeCalendarLabelCommandGateway();
        gateway.givenRefusal('createCalendarLabel', LIMIT);
        const { result, events } = renderCommands(gateway);

        await act(async () => result.current.createCalendarLabel(A_DRINK));

        expect(events).toEqual([
            'CREATE_CALENDAR_LABEL:CALENDAR_LABEL_LIMIT_REACHED',
        ]);
    });
});
