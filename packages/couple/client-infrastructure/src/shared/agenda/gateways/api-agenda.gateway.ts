import {
    type HttpMethod,
    HttpMethodEnum,
    type HttpRequestConfig,
    parseResponse,
} from '@cocooning/client-infrastructure/shared/http';
import { AgendaGateway } from '@cocooning/couple-client-business-logic/agenda';
import {
    type ApiError,
    ApiErrorCodeEnum,
} from '@cocooning/couple-client-business-logic/shared';
import {
    type CalendarEventListResponse,
    CalendarEventListResponseSchema,
    type CalendarEventQueryRequest,
    CalendarEventQueryRequestSchema,
    type CalendarEventResponse,
    CalendarEventResponseSchema,
    type CreateCalendarEventRequest,
    CreateCalendarEventRequestSchema,
    type EditCalendarEventRequest,
    EditCalendarEventRequestSchema,
} from '@cocooning/couple-contract/agenda';
import { fail, ok, type Result } from '@cocooning/shared-kernel/utils';
import type { SessionTokenProvider } from '../../session/session-headers';
import { sessionRequest } from '../../session/session-request';
import type { AgendaEndpoints } from '../endpoints/agenda.endpoints';

const OUTSIDE_CONTRACT: ApiError = {
    code: ApiErrorCodeEnum.VALIDATION_ERROR,
    message: 'Calendar event request does not match its contract',
    backendCode: null,
};

const NO_BODY = null;

export class ApiAgendaGateway extends AgendaGateway {
    constructor(
        private readonly endpoints: AgendaEndpoints,
        private readonly httpConfig: HttpRequestConfig<ApiError>,
        private readonly getSessionToken: SessionTokenProvider,
    ) {
        super();
    }

    override async listCalendarEvents(
        query: CalendarEventQueryRequest,
    ): Promise<Result<CalendarEventListResponse, ApiError>> {
        const validated = CalendarEventQueryRequestSchema.safeParse(query);
        if (!validated.success) return fail(OUTSIDE_CONTRACT);
        const search = new URLSearchParams(validated.data).toString();
        const result = await this.request(
            HttpMethodEnum.GET,
            `${this.endpoints.calendarEvents}?${search}`,
            NO_BODY,
        );
        return parseResponse(
            result,
            CalendarEventListResponseSchema,
            this.httpConfig,
        );
    }

    override createCalendarEvent(
        request: CreateCalendarEventRequest,
    ): Promise<Result<CalendarEventResponse, ApiError>> {
        const validated = CreateCalendarEventRequestSchema.safeParse(request);
        if (!validated.success) return Promise.resolve(fail(OUTSIDE_CONTRACT));
        return this.calendarEvent(
            HttpMethodEnum.POST,
            this.endpoints.calendarEvents,
            validated.data,
        );
    }

    // The whole form, as at creation (R9).
    override editCalendarEvent(
        calendarEventId: string,
        request: EditCalendarEventRequest,
    ): Promise<Result<CalendarEventResponse, ApiError>> {
        const validated = EditCalendarEventRequestSchema.safeParse(request);
        if (!validated.success) return Promise.resolve(fail(OUTSIDE_CONTRACT));
        return this.calendarEvent(
            HttpMethodEnum.PATCH,
            this.endpoints.calendarEvent(calendarEventId),
            validated.data,
        );
    }

    override getCalendarEvent(
        calendarEventId: string,
    ): Promise<Result<CalendarEventResponse, ApiError>> {
        return this.calendarEvent(
            HttpMethodEnum.GET,
            this.endpoints.calendarEvent(calendarEventId),
            NO_BODY,
        );
    }

    override shareCalendarEvent(
        calendarEventId: string,
    ): Promise<Result<CalendarEventResponse, ApiError>> {
        return this.calendarEvent(
            HttpMethodEnum.POST,
            this.endpoints.share(calendarEventId),
            NO_BODY,
        );
    }

    override makeCalendarEventPrivate(
        calendarEventId: string,
    ): Promise<Result<CalendarEventResponse, ApiError>> {
        return this.calendarEvent(
            HttpMethodEnum.POST,
            this.endpoints.makePrivate(calendarEventId),
            NO_BODY,
        );
    }

    // R9: the API answers 204 without a body.
    override async deleteCalendarEvent(
        calendarEventId: string,
    ): Promise<Result<null, ApiError>> {
        const result = await this.request(
            HttpMethodEnum.DELETE,
            this.endpoints.calendarEvent(calendarEventId),
            NO_BODY,
        );
        return result.success ? ok(null) : result;
    }

    private async calendarEvent(
        method: HttpMethod,
        url: string,
        body: unknown,
    ): Promise<Result<CalendarEventResponse, ApiError>> {
        const result = await this.request(method, url, body);
        return parseResponse(
            result,
            CalendarEventResponseSchema,
            this.httpConfig,
        );
    }

    private request(
        method: HttpMethod,
        url: string,
        body: unknown,
    ): Promise<Result<unknown, ApiError>> {
        return sessionRequest(
            this.getSessionToken,
            { url, method, body },
            this.httpConfig,
        );
    }
}
