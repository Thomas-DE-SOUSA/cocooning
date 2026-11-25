import type {
    CalendarEventForm,
    CalendarEventFormInput,
} from '@cocooning/couple-client-business-logic/agenda';
import {
    type ApiError,
    ApiErrorCodeEnum,
} from '@cocooning/couple-client-business-logic/shared';
import type { Result } from '@cocooning/shared-kernel/utils';
import { runServerAction } from '@/shared/application/server-action/run-server-action';
import { toCalendarEventFormInput } from '../../presenters/calendar-event-form.presenter';
import { CalendarEventCommandGateway } from '../ports/calendar-event-command.gateway';

type CommandResult = Promise<Result<null, ApiError>>;

export type CalendarEventAction = (calendarEventId: string) => CommandResult;

export type CalendarEventCommandActions = {
    readonly createCalendarEvent: (
        input: CalendarEventFormInput,
    ) => CommandResult;
    readonly editCalendarEvent: (
        calendarEventId: string,
        input: CalendarEventFormInput,
        isOwner: boolean,
    ) => CommandResult;
    readonly shareCalendarEvent: CalendarEventAction;
    readonly makeCalendarEventPrivate: CalendarEventAction;
    readonly deleteCalendarEvent: CalendarEventAction;
};

const UNREACHABLE: ApiError = {
    code: ApiErrorCodeEnum.NETWORK_ERROR,
    message: 'Agenda server action unreachable',
    backendCode: null,
};

// The action receives what the inputs held, which its schema validates again (core-frontend.md rule 14).
export class ServerActionCalendarEventCommandGateway extends CalendarEventCommandGateway {
    constructor(private readonly actions: CalendarEventCommandActions) {
        super();
    }

    override createCalendarEvent(form: CalendarEventForm): CommandResult {
        return runServerAction(
            () =>
                this.actions.createCalendarEvent(
                    toCalendarEventFormInput(form),
                ),
            UNREACHABLE,
        );
    }

    override editCalendarEvent(
        calendarEventId: string,
        form: CalendarEventForm,
        isOwner: boolean,
    ): CommandResult {
        return runServerAction(
            () =>
                this.actions.editCalendarEvent(
                    calendarEventId,
                    toCalendarEventFormInput(form),
                    isOwner,
                ),
            UNREACHABLE,
        );
    }

    override shareCalendarEvent(calendarEventId: string): CommandResult {
        return runServerAction(
            () => this.actions.shareCalendarEvent(calendarEventId),
            UNREACHABLE,
        );
    }

    override makeCalendarEventPrivate(calendarEventId: string): CommandResult {
        return runServerAction(
            () => this.actions.makeCalendarEventPrivate(calendarEventId),
            UNREACHABLE,
        );
    }

    override deleteCalendarEvent(calendarEventId: string): CommandResult {
        return runServerAction(
            () => this.actions.deleteCalendarEvent(calendarEventId),
            UNREACHABLE,
        );
    }
}
