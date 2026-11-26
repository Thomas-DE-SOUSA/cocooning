import {
    type HttpMethod,
    HttpMethodEnum,
    type HttpRequestConfig,
    parseResponse,
} from '@cocooning/client-infrastructure/shared/http';
import { CalendarLabelsGateway } from '@cocooning/couple-client-business-logic/agenda';
import {
    type ApiError,
    ApiErrorCodeEnum,
} from '@cocooning/couple-client-business-logic/shared';
import {
    type CalendarLabelListResponse,
    CalendarLabelListResponseSchema,
    type CalendarLabelResponse,
    CalendarLabelResponseSchema,
    type CreateCalendarLabelRequest,
    CreateCalendarLabelRequestSchema,
    type EditCalendarLabelRequest,
    EditCalendarLabelRequestSchema,
} from '@cocooning/couple-contract/agenda';
import { fail, ok, type Result } from '@cocooning/shared-kernel/utils';
import type { SessionTokenProvider } from '../../session/session-headers';
import { sessionRequest } from '../../session/session-request';
import type { CalendarLabelsEndpoints } from '../endpoints/calendar-labels.endpoints';

const OUTSIDE_CONTRACT: ApiError = {
    code: ApiErrorCodeEnum.VALIDATION_ERROR,
    message: 'Calendar label request does not match its contract',
    backendCode: null,
};

const NO_BODY = null;

export class ApiCalendarLabelsGateway extends CalendarLabelsGateway {
    constructor(
        private readonly endpoints: CalendarLabelsEndpoints,
        private readonly httpConfig: HttpRequestConfig<ApiError>,
        private readonly getSessionToken: SessionTokenProvider,
    ) {
        super();
    }

    override async list(): Promise<
        Result<CalendarLabelListResponse, ApiError>
    > {
        const result = await this.request(
            HttpMethodEnum.GET,
            this.endpoints.calendarLabels,
            NO_BODY,
        );
        return parseResponse(
            result,
            CalendarLabelListResponseSchema,
            this.httpConfig,
        );
    }

    override create(
        request: CreateCalendarLabelRequest,
    ): Promise<Result<CalendarLabelResponse, ApiError>> {
        const validated = CreateCalendarLabelRequestSchema.safeParse(request);
        if (!validated.success) return Promise.resolve(fail(OUTSIDE_CONTRACT));
        return this.calendarLabel(
            HttpMethodEnum.POST,
            this.endpoints.calendarLabels,
            validated.data,
        );
    }

    // R12: the name and the colour, both sent again.
    override edit(
        calendarLabelId: string,
        request: EditCalendarLabelRequest,
    ): Promise<Result<CalendarLabelResponse, ApiError>> {
        const validated = EditCalendarLabelRequestSchema.safeParse(request);
        if (!validated.success) return Promise.resolve(fail(OUTSIDE_CONTRACT));
        return this.calendarLabel(
            HttpMethodEnum.PATCH,
            this.endpoints.calendarLabel(calendarLabelId),
            validated.data,
        );
    }

    // R14: the API answers 204 without a body.
    override async delete(
        calendarLabelId: string,
    ): Promise<Result<null, ApiError>> {
        const result = await this.request(
            HttpMethodEnum.DELETE,
            this.endpoints.calendarLabel(calendarLabelId),
            NO_BODY,
        );
        return result.success ? ok(null) : result;
    }

    private async calendarLabel(
        method: HttpMethod,
        url: string,
        body: unknown,
    ): Promise<Result<CalendarLabelResponse, ApiError>> {
        const result = await this.request(method, url, body);
        return parseResponse(
            result,
            CalendarLabelResponseSchema,
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
