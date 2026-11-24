import { agendaCalendarEventCreateAction } from '../actions/agenda-calendar-event-create.action';
import { agendaCalendarEventDeleteAction } from '../actions/agenda-calendar-event-delete.action';
import { agendaCalendarEventEditAction } from '../actions/agenda-calendar-event-edit.action';
import { agendaCalendarEventMakePrivateAction } from '../actions/agenda-calendar-event-make-private.action';
import { agendaCalendarEventShareAction } from '../actions/agenda-calendar-event-share.action';
import type { CalendarEventCommandGateway } from './ports/calendar-event-command.gateway';
import { ServerActionCalendarEventCommandGateway } from './server-action/server-action-calendar-event-command.gateway';

export const calendarEventCommandGateway: CalendarEventCommandGateway =
    new ServerActionCalendarEventCommandGateway({
        createCalendarEvent: agendaCalendarEventCreateAction,
        editCalendarEvent: agendaCalendarEventEditAction,
        shareCalendarEvent: agendaCalendarEventShareAction,
        makeCalendarEventPrivate: agendaCalendarEventMakePrivateAction,
        deleteCalendarEvent: agendaCalendarEventDeleteAction,
    });
