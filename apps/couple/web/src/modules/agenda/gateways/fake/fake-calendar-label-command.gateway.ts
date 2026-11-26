import type { CalendarLabelForm } from '@cocooning/couple-client-business-logic/agenda';
import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import { fail, ok, type Result } from '@cocooning/shared-kernel/utils';
import type { CalendarLabelItem } from '../../view-models/calendar-label.view-model';
import { CalendarLabelCommandGateway } from '../ports/calendar-label-command.gateway';
import type { CalendarLabelCommandCall } from './calendar-label-command-call';

export const A_CREATED_LABEL_ID = '01936b2e-7c4a-7000-8000-0000000000b7';

// Every operation succeeds, a creation with A_CREATED_LABEL_ID, unless a scenario gives it a refusal.
export class FakeCalendarLabelCommandGateway extends CalendarLabelCommandGateway {
    private readonly refusals = new Map<
        CalendarLabelCommandCall['operation'],
        ApiError
    >();
    private readonly recordedCalls: CalendarLabelCommandCall[] = [];

    get calls(): readonly CalendarLabelCommandCall[] {
        return [...this.recordedCalls];
    }

    givenRefusal(
        operation: CalendarLabelCommandCall['operation'],
        error: ApiError,
    ): void {
        this.refusals.set(operation, error);
    }

    override createCalendarLabel(
        form: CalendarLabelForm,
    ): Promise<Result<CalendarLabelItem, ApiError>> {
        return this.answer(
            { operation: 'createCalendarLabel', form },
            {
                calendarLabelId: A_CREATED_LABEL_ID,
                ...form,
            },
        );
    }

    override editCalendarLabel(
        calendarLabelId: string,
        form: CalendarLabelForm,
    ): Promise<Result<null, ApiError>> {
        return this.answer(
            { operation: 'editCalendarLabel', calendarLabelId, form },
            null,
        );
    }

    override deleteCalendarLabel(
        calendarLabelId: string,
    ): Promise<Result<null, ApiError>> {
        return this.answer(
            { operation: 'deleteCalendarLabel', calendarLabelId },
            null,
        );
    }

    private answer<T>(
        call: CalendarLabelCommandCall,
        value: T,
    ): Promise<Result<T, ApiError>> {
        this.recordedCalls.push(call);
        const refusal = this.refusals.get(call.operation);
        return Promise.resolve(
            refusal === undefined ? ok(value) : fail(refusal),
        );
    }
}
