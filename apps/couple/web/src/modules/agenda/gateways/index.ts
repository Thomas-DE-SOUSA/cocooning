import { agendaCalendarEventCreateAction } from '../actions/agenda-calendar-event-create.action';
import { agendaCalendarEventDeleteAction } from '../actions/agenda-calendar-event-delete.action';
import { agendaCalendarEventEditAction } from '../actions/agenda-calendar-event-edit.action';
import { agendaCalendarEventMakePrivateAction } from '../actions/agenda-calendar-event-make-private.action';
import { agendaCalendarEventShareAction } from '../actions/agenda-calendar-event-share.action';
import { agendaCalendarLabelCreateAction } from '../actions/agenda-calendar-label-create.action';
import { agendaCalendarLabelDeleteAction } from '../actions/agenda-calendar-label-delete.action';
import { agendaCalendarLabelEditAction } from '../actions/agenda-calendar-label-edit.action';
import type { CalendarEventCommandGateway } from './ports/calendar-event-command.gateway';
import type { CalendarLabelCommandGateway } from './ports/calendar-label-command.gateway';
import { ServerActionCalendarEventCommandGateway } from './server-action/server-action-calendar-event-command.gateway';
import { ServerActionCalendarLabelCommandGateway } from './server-action/server-action-calendar-label-command.gateway';

export const calendarEventCommandGateway: CalendarEventCommandGateway =
    new ServerActionCalendarEventCommandGateway({
        createCalendarEvent: agendaCalendarEventCreateAction,
        editCalendarEvent: agendaCalendarEventEditAction,
        shareCalendarEvent: agendaCalendarEventShareAction,
        makeCalendarEventPrivate: agendaCalendarEventMakePrivateAction,
        deleteCalendarEvent: agendaCalendarEventDeleteAction,
    });

export const calendarLabelCommandGateway: CalendarLabelCommandGateway =
    new ServerActionCalendarLabelCommandGateway({
        createCalendarLabel: agendaCalendarLabelCreateAction,
        editCalendarLabel: agendaCalendarLabelEditAction,
        deleteCalendarLabel: agendaCalendarLabelDeleteAction,
    });
