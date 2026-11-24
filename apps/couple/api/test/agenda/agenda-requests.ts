import { ApiRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import type { TestClient, TestResponse } from '../shared/app/test-client';
import {
    type CalendarEventBody,
    calendarEventOf,
    DINNER,
} from './agenda-test-data';

const withEvent = (route: string, calendarEventId: string): string =>
    route.replace(':calendarEventId', calendarEventId);

// One method per route of the agenda, sent as a partner signed in at the clock of the test app.
export abstract class AgendaRequests {
    abstract as(userId: string): TestClient;

    create(
        userId: string,
        body: CalendarEventBody = DINNER,
    ): Promise<TestResponse> {
        return this.as(userId).post(ApiRouterEnum.CALENDAR_EVENT_CREATE, body);
    }

    async createdId(
        userId: string,
        body: CalendarEventBody = DINNER,
    ): Promise<string> {
        return calendarEventOf(await this.create(userId, body)).calendarEventId;
    }

    list(
        userId: string,
        range: { from: string; to: string },
    ): Promise<TestResponse> {
        const query = new URLSearchParams(range).toString();
        return this.as(userId).get(
            `${ApiRouterEnum.CALENDAR_EVENT_LIST}?${query}`,
        );
    }

    get(userId: string, calendarEventId: string): Promise<TestResponse> {
        return this.as(userId).get(
            withEvent(ApiRouterEnum.CALENDAR_EVENT_GET, calendarEventId),
        );
    }

    edit(
        userId: string,
        calendarEventId: string,
        body: Omit<CalendarEventBody, 'visibility'>,
    ): Promise<TestResponse> {
        return this.as(userId).patch(
            withEvent(ApiRouterEnum.CALENDAR_EVENT_EDIT, calendarEventId),
            body,
        );
    }

    share(userId: string, calendarEventId: string): Promise<TestResponse> {
        return this.as(userId).post(
            withEvent(ApiRouterEnum.CALENDAR_EVENT_SHARE, calendarEventId),
        );
    }

    makePrivate(
        userId: string,
        calendarEventId: string,
    ): Promise<TestResponse> {
        return this.as(userId).post(
            withEvent(
                ApiRouterEnum.CALENDAR_EVENT_MAKE_PRIVATE,
                calendarEventId,
            ),
        );
    }

    delete(userId: string, calendarEventId: string): Promise<TestResponse> {
        return this.as(userId).delete(
            withEvent(ApiRouterEnum.CALENDAR_EVENT_DELETE, calendarEventId),
        );
    }
}
