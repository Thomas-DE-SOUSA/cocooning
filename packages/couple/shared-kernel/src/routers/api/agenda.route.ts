import type { RouteGroup } from '../route-group';

// Create and list share one path, get, edit and delete another: the HTTP verb tells them apart. Labels likewise.
export const AgendaRouteEnum = {
    CALENDAR_EVENT_CREATE: '/calendar-events',
    CALENDAR_EVENT_LIST: '/calendar-events',
    CALENDAR_EVENT_GET: '/calendar-events/:calendarEventId',
    CALENDAR_EVENT_EDIT: '/calendar-events/:calendarEventId',
    CALENDAR_EVENT_DELETE: '/calendar-events/:calendarEventId',
    CALENDAR_EVENT_SHARE: '/calendar-events/:calendarEventId/share',
    CALENDAR_EVENT_MAKE_PRIVATE:
        '/calendar-events/:calendarEventId/make-private',
    CALENDAR_LABEL_LIST: '/calendar-labels',
    CALENDAR_LABEL_CREATE: '/calendar-labels',
    CALENDAR_LABEL_EDIT: '/calendar-labels/:calendarLabelId',
    CALENDAR_LABEL_DELETE: '/calendar-labels/:calendarLabelId',
} as const satisfies RouteGroup;
