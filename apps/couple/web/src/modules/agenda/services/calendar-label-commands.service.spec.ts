import {
    CreateCalendarLabelUseCase,
    EditCalendarLabelUseCase,
} from '@cocooning/couple-client-business-logic/agenda';
import { ApiErrorCodeEnum } from '@cocooning/couple-client-business-logic/shared';
import {
    A_CALENDAR_LABEL,
    FakeCalendarLabelsGateway,
} from '@cocooning/couple-client-business-logic/testing';
import { ok } from '@cocooning/shared-kernel/utils';
import {
    actOnCalendarLabel,
    createCalendarLabel,
    editCalendarLabel,
} from './calendar-label-commands.service';

const LABEL_ID = A_CALENDAR_LABEL.calendarLabelId;
const t = (key: string) => key;

let gateway: FakeCalendarLabelsGateway;
const isValidationError = (result: {
    success: boolean;
    error?: { code: string };
}) =>
    result.success === false &&
    result.error?.code === ApiErrorCodeEnum.VALIDATION_ERROR;

describe('Feature: label commands sent by the server actions (R12, R14)', () => {
    beforeEach(() => {
        gateway = new FakeCalendarLabelsGateway();
    });

    it('creates the trimmed label and gives it back without its date', async () => {
        const result = await createCalendarLabel(
            { name: ' Verre ', color: 'MINT' },
            { t, createCalendarLabel: new CreateCalendarLabelUseCase(gateway) },
        );

        expect(result).toEqual(
            ok({ calendarLabelId: LABEL_ID, name: 'Verre', color: 'MINT' }),
        );
        expect(gateway.calls).toEqual([
            { operation: 'create', request: { name: 'Verre', color: 'MINT' } },
        ]);
    });

    it.each([
        ['an empty name', { name: ' ', color: 'MINT' }],
        ['a colour outside the palette', { name: 'Verre', color: 'RED' }],
    ])(
        'refuses %s without calling the API (rule 14)',
        async (_label, input) => {
            const result = await createCalendarLabel(input, {
                t,
                createCalendarLabel: new CreateCalendarLabelUseCase(gateway),
            });

            expect(isValidationError(result)).toBe(true);
            expect(gateway.calls).toEqual([]);
        },
    );

    it('edits the name and the colour of a label', async () => {
        const result = await editCalendarLabel(
            LABEL_ID,
            { name: 'Soirée', color: 'ROSE' },
            { t, editCalendarLabel: new EditCalendarLabelUseCase(gateway) },
        );

        expect(result).toEqual(ok(null));
        expect(gateway.calls).toEqual([
            {
                operation: 'edit',
                calendarLabelId: LABEL_ID,
                request: { name: 'Soirée', color: 'ROSE' },
            },
        ]);
    });

    it('refuses an id that is not a label id without calling the API', async () => {
        const sent: string[] = [];
        const result = await actOnCalendarLabel('../couple', (id) => {
            sent.push(id);
            return Promise.resolve(ok(null));
        });

        expect(isValidationError(result)).toBe(true);
        expect(sent).toEqual([]);
    });
});
