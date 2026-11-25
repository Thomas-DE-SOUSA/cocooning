import { resolveRoute } from '@cocooning/client-infrastructure/shared/http';
import { ApiRouterEnum } from '@cocooning/couple-shared-kernel/routers';

export type CalendarLabelsEndpoints = {
    readonly calendarLabels: string;
    readonly calendarLabel: (calendarLabelId: string) => string;
};

export function resolveCalendarLabelsEndpoints(
    apiBaseUrl: string,
): CalendarLabelsEndpoints {
    return {
        calendarLabels: resolveRoute(
            apiBaseUrl,
            ApiRouterEnum.CALENDAR_LABEL_LIST,
        ),
        calendarLabel: (calendarLabelId) =>
            resolveRoute(apiBaseUrl, ApiRouterEnum.CALENDAR_LABEL_EDIT, {
                calendarLabelId,
            }),
    };
}
