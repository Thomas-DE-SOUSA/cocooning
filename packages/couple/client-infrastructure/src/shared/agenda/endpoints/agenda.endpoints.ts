import { resolveRoute } from '@cocooning/client-infrastructure/shared/http';
import { ApiRouterEnum } from '@cocooning/couple-shared-kernel/routers';

export type AgendaEndpoints = {
    readonly calendarEvents: string;
    readonly calendarEvent: (calendarEventId: string) => string;
    readonly share: (calendarEventId: string) => string;
    readonly makePrivate: (calendarEventId: string) => string;
};

export function resolveAgendaEndpoints(apiBaseUrl: string): AgendaEndpoints {
    return {
        calendarEvents: resolveRoute(
            apiBaseUrl,
            ApiRouterEnum.CALENDAR_EVENT_LIST,
        ),
        calendarEvent: (calendarEventId) =>
            resolveRoute(apiBaseUrl, ApiRouterEnum.CALENDAR_EVENT_GET, {
                calendarEventId,
            }),
        share: (calendarEventId) =>
            resolveRoute(apiBaseUrl, ApiRouterEnum.CALENDAR_EVENT_SHARE, {
                calendarEventId,
            }),
        makePrivate: (calendarEventId) =>
            resolveRoute(
                apiBaseUrl,
                ApiRouterEnum.CALENDAR_EVENT_MAKE_PRIVATE,
                { calendarEventId },
            ),
    };
}
