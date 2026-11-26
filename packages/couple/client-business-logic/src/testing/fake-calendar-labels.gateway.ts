import type {
    CalendarLabelListResponse,
    CalendarLabelResponse,
    CreateCalendarLabelRequest,
    EditCalendarLabelRequest,
} from '@cocooning/couple-contract/agenda';
import { CalendarLabelColorEnum } from '@cocooning/couple-shared-kernel/enums';
import { fail, ok, type Result } from '@cocooning/shared-kernel/utils';
import { CalendarLabelsGateway } from '../agenda/domain/ports/calendar-labels.gateway';
import type { ApiError } from '../shared/api-error';

export type CalendarLabelsGatewayCall =
    | { readonly operation: 'list' }
    | {
          readonly operation: 'create';
          readonly request: CreateCalendarLabelRequest;
      }
    | {
          readonly operation: 'edit';
          readonly calendarLabelId: string;
          readonly request: EditCalendarLabelRequest;
      }
    | { readonly operation: 'delete'; readonly calendarLabelId: string };

export const A_CALENDAR_LABEL: CalendarLabelResponse = {
    calendarLabelId: '01936b2e-7c4a-7000-8000-0000000000b1',
    name: 'Sport',
    color: CalendarLabelColorEnum.SAGE,
    updatedAt: '2026-11-25T08:00:00.000Z',
};

export const A_CALENDAR_LABEL_LIST: CalendarLabelListResponse = {
    items: [
        A_CALENDAR_LABEL,
        {
            calendarLabelId: '01936b2e-7c4a-7000-8000-0000000000b2',
            name: 'Famille',
            color: CalendarLabelColorEnum.ROSE,
            updatedAt: '2026-11-25T08:05:00.000Z',
        },
    ],
};

// The list and one label, changed by the request, answer every call, or one refusal does.
export class FakeCalendarLabelsGateway extends CalendarLabelsGateway {
    readonly calls: CalendarLabelsGatewayCall[] = [];
    private refusal: ApiError | null = null;

    givenRefusal(error: ApiError): void {
        this.refusal = error;
    }

    override list(): Promise<Result<CalendarLabelListResponse, ApiError>> {
        return this.respond({ operation: 'list' }, A_CALENDAR_LABEL_LIST);
    }

    override create(
        request: CreateCalendarLabelRequest,
    ): Promise<Result<CalendarLabelResponse, ApiError>> {
        return this.respond(
            { operation: 'create', request },
            { ...A_CALENDAR_LABEL, ...request },
        );
    }

    override edit(
        calendarLabelId: string,
        request: EditCalendarLabelRequest,
    ): Promise<Result<CalendarLabelResponse, ApiError>> {
        return this.respond(
            { operation: 'edit', calendarLabelId, request },
            { ...A_CALENDAR_LABEL, calendarLabelId, ...request },
        );
    }

    override delete(calendarLabelId: string): Promise<Result<null, ApiError>> {
        return this.respond({ operation: 'delete', calendarLabelId }, null);
    }

    private respond<T>(
        call: CalendarLabelsGatewayCall,
        value: T,
    ): Promise<Result<T, ApiError>> {
        this.calls.push(call);
        return Promise.resolve(
            this.refusal === null ? ok(value) : fail(this.refusal),
        );
    }
}
