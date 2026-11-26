import { CalendarLabelColorEnum } from '@cocooning/couple-shared-kernel/enums';
import { fail, ok } from '@cocooning/shared-kernel/utils';
import { ApiErrorCodeEnum } from '../../../shared/api-error';
import {
    A_CALENDAR_LABEL,
    A_CALENDAR_LABEL_LIST,
    FakeCalendarLabelsGateway,
} from '../../../testing/fake-calendar-labels.gateway';
import { CreateCalendarLabelUseCase } from './create-calendar-label.use-case';
import { DeleteCalendarLabelUseCase } from './delete-calendar-label.use-case';
import { EditCalendarLabelUseCase } from './edit-calendar-label.use-case';
import { ListCalendarLabelsUseCase } from './list-calendar-labels.use-case';

const LABEL_ID = A_CALENDAR_LABEL.calendarLabelId;
const FAMILY = { name: 'Famille', color: CalendarLabelColorEnum.ROSE };
const LIMIT_REACHED = {
    code: ApiErrorCodeEnum.CONFLICT,
    message: 'Calendar label limit reached',
    backendCode: 'CALENDAR_LABEL_LIMIT_REACHED',
};
const NOT_FOUND = {
    code: ApiErrorCodeEnum.NOT_FOUND,
    message: 'Calendar label not found',
    backendCode: 'CALENDAR_LABEL_NOT_FOUND',
};

describe('Feature: the labels of the couple from the PWA', () => {
    let gateway: FakeCalendarLabelsGateway;

    beforeEach(() => {
        gateway = new FakeCalendarLabelsGateway();
    });

    it('lists the labels of the couple (R12)', async () => {
        await expect(
            new ListCalendarLabelsUseCase(gateway).execute(),
        ).resolves.toEqual(ok(A_CALENDAR_LABEL_LIST));
        expect(gateway.calls).toEqual([{ operation: 'list' }]);
    });

    it('creates a label with its name and colour (R12)', async () => {
        await expect(
            new CreateCalendarLabelUseCase(gateway).execute(FAMILY),
        ).resolves.toEqual(ok({ ...A_CALENDAR_LABEL, ...FAMILY }));
        expect(gateway.calls).toEqual([
            { operation: 'create', request: FAMILY },
        ]);
    });

    it('renames and recolours a label in one edit (R12)', async () => {
        await expect(
            new EditCalendarLabelUseCase(gateway).execute(LABEL_ID, FAMILY),
        ).resolves.toEqual(ok({ ...A_CALENDAR_LABEL, ...FAMILY }));
        expect(gateway.calls).toEqual([
            { operation: 'edit', calendarLabelId: LABEL_ID, request: FAMILY },
        ]);
    });

    it('deletes a label (R14)', async () => {
        await expect(
            new DeleteCalendarLabelUseCase(gateway).execute(LABEL_ID),
        ).resolves.toEqual(ok(null));
        expect(gateway.calls).toEqual([
            { operation: 'delete', calendarLabelId: LABEL_ID },
        ]);
    });

    it('returns the 21st label refused by the API unchanged (R12)', async () => {
        gateway.givenRefusal(LIMIT_REACHED);
        await expect(
            new CreateCalendarLabelUseCase(gateway).execute(FAMILY),
        ).resolves.toEqual(fail(LIMIT_REACHED));
    });

    it('returns an unknown label refused by the API unchanged (R13)', async () => {
        gateway.givenRefusal(NOT_FOUND);
        await expect(
            new DeleteCalendarLabelUseCase(gateway).execute(LABEL_ID),
        ).resolves.toEqual(fail(NOT_FOUND));
    });
});
