import { ApiRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import type { TestClient, TestResponse } from '../shared/app/test-client';
import {
    type CalendarLabelBody,
    calendarLabelOf,
    SPORT,
} from './agenda-test-data';

const withLabel = (route: string, calendarLabelId: string): string =>
    route.replace(':calendarLabelId', calendarLabelId);

// One method per label route of the agenda, sent as a partner signed in at the clock of the test app.
export abstract class CalendarLabelRequests {
    abstract as(userId: string): TestClient;

    listLabels(userId: string): Promise<TestResponse> {
        return this.as(userId).get(ApiRouterEnum.CALENDAR_LABEL_LIST);
    }

    createLabel(
        userId: string,
        body: CalendarLabelBody = SPORT,
    ): Promise<TestResponse> {
        return this.as(userId).post(ApiRouterEnum.CALENDAR_LABEL_CREATE, body);
    }

    async createdLabelId(
        userId: string,
        body: CalendarLabelBody = SPORT,
    ): Promise<string> {
        return calendarLabelOf(await this.createLabel(userId, body))
            .calendarLabelId;
    }

    editLabel(
        userId: string,
        calendarLabelId: string,
        body: CalendarLabelBody,
    ): Promise<TestResponse> {
        return this.as(userId).patch(
            withLabel(ApiRouterEnum.CALENDAR_LABEL_EDIT, calendarLabelId),
            body,
        );
    }

    deleteLabel(
        userId: string,
        calendarLabelId: string,
    ): Promise<TestResponse> {
        return this.as(userId).delete(
            withLabel(ApiRouterEnum.CALENDAR_LABEL_DELETE, calendarLabelId),
        );
    }
}
