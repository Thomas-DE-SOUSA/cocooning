import type {
    CalendarEventListResponse,
    CalendarEventQueryRequest,
    CalendarEventResponse,
    CreateCalendarEventRequest,
    EditCalendarEventRequest,
} from '@cocooning/couple-contract/agenda';
import {
    CalendarEventAudienceEnum,
    CalendarEventVisibilityEnum,
} from '@cocooning/couple-shared-kernel/enums';
import { fail, ok, type Result } from '@cocooning/shared-kernel/utils';
import { AgendaGateway } from '../agenda/domain/ports/agenda.gateway';
import type { ApiError } from '../shared/api-error';

export type AgendaGatewayCall =
    | {
          readonly operation: 'listCalendarEvents';
          readonly query: CalendarEventQueryRequest;
      }
    | {
          readonly operation: 'createCalendarEvent';
          readonly request: CreateCalendarEventRequest;
      }
    | {
          readonly operation: 'editCalendarEvent';
          readonly calendarEventId: string;
          readonly request: EditCalendarEventRequest;
      }
    | {
          readonly operation:
              | 'getCalendarEvent'
              | 'shareCalendarEvent'
              | 'makeCalendarEventPrivate'
              | 'deleteCalendarEvent';
          readonly calendarEventId: string;
      };

export const A_SHARED_CALENDAR_EVENT: CalendarEventResponse = {
    calendarEventId: '01936b2e-7c4a-7000-8000-0000000000e1',
    ownerId: '01936b2e-7c4a-7000-8000-0000000000a1',
    isOwner: true,
    title: 'Diner chez Lea',
    description: null,
    startsOn: '2026-12-05',
    endsOn: null,
    startsAt: '20:00',
    endsAt: '23:00',
    visibility: CalendarEventVisibilityEnum.SHARED,
    audience: CalendarEventAudienceEnum.OWNER,
    labelId: null,
    updatedAt: '2026-11-24T08:00:00.000Z',
};

export const A_PRIVATE_CALENDAR_EVENT: CalendarEventResponse = {
    ...A_SHARED_CALENDAR_EVENT,
    calendarEventId: '01936b2e-7c4a-7000-8000-0000000000e2',
    title: 'Cadeau surprise',
    startsAt: null,
    endsAt: null,
    visibility: CalendarEventVisibilityEnum.PRIVATE,
};

export const A_CALENDAR_EVENT_LIST: CalendarEventListResponse = {
    items: [A_SHARED_CALENDAR_EVENT, A_PRIVATE_CALENDAR_EVENT],
};

// One list and one shared event answer every call, or one refusal does.
export class FakeAgendaGateway extends AgendaGateway {
    readonly calls: AgendaGatewayCall[] = [];
    private refusal: ApiError | null = null;

    givenRefusal(error: ApiError): void {
        this.refusal = error;
    }

    override listCalendarEvents(
        query: CalendarEventQueryRequest,
    ): Promise<Result<CalendarEventListResponse, ApiError>> {
        return this.respond(
            { operation: 'listCalendarEvents', query },
            A_CALENDAR_EVENT_LIST,
        );
    }

    override getCalendarEvent(
        calendarEventId: string,
    ): Promise<Result<CalendarEventResponse, ApiError>> {
        return this.answer('getCalendarEvent', calendarEventId);
    }

    override createCalendarEvent(
        request: CreateCalendarEventRequest,
    ): Promise<Result<CalendarEventResponse, ApiError>> {
        return this.respond(
            { operation: 'createCalendarEvent', request },
            { ...A_SHARED_CALENDAR_EVENT, ...request },
        );
    }

    override editCalendarEvent(
        calendarEventId: string,
        request: EditCalendarEventRequest,
    ): Promise<Result<CalendarEventResponse, ApiError>> {
        return this.respond(
            { operation: 'editCalendarEvent', calendarEventId, request },
            { ...A_SHARED_CALENDAR_EVENT, ...request },
        );
    }

    override shareCalendarEvent(
        calendarEventId: string,
    ): Promise<Result<CalendarEventResponse, ApiError>> {
        return this.answer('shareCalendarEvent', calendarEventId);
    }

    override makeCalendarEventPrivate(
        calendarEventId: string,
    ): Promise<Result<CalendarEventResponse, ApiError>> {
        return this.respond(
            { operation: 'makeCalendarEventPrivate', calendarEventId },
            {
                ...A_SHARED_CALENDAR_EVENT,
                visibility: CalendarEventVisibilityEnum.PRIVATE,
            },
        );
    }

    override deleteCalendarEvent(
        calendarEventId: string,
    ): Promise<Result<null, ApiError>> {
        return this.respond(
            { operation: 'deleteCalendarEvent', calendarEventId },
            null,
        );
    }

    private answer(
        operation: 'getCalendarEvent' | 'shareCalendarEvent',
        calendarEventId: string,
    ): Promise<Result<CalendarEventResponse, ApiError>> {
        return this.respond(
            { operation, calendarEventId },
            A_SHARED_CALENDAR_EVENT,
        );
    }

    private respond<T>(
        call: AgendaGatewayCall,
        value: T,
    ): Promise<Result<T, ApiError>> {
        this.calls.push(call);
        return Promise.resolve(
            this.refusal === null ? ok(value) : fail(this.refusal),
        );
    }
}
