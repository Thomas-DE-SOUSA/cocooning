import type { CalendarLabelForm } from '@cocooning/couple-client-business-logic/agenda';
import {
    type ApiError,
    ApiErrorCodeEnum,
} from '@cocooning/couple-client-business-logic/shared';
import type { Result } from '@cocooning/shared-kernel/utils';
import { runServerAction } from '@/shared/application/server-action/run-server-action';
import type { CalendarLabelItem } from '../../view-models/calendar-label.view-model';
import { CalendarLabelCommandGateway } from '../ports/calendar-label-command.gateway';

type CommandResult = Promise<Result<null, ApiError>>;

export type CalendarLabelCommandActions = {
    readonly createCalendarLabel: (
        input: CalendarLabelForm,
    ) => Promise<Result<CalendarLabelItem, ApiError>>;
    readonly editCalendarLabel: (
        calendarLabelId: string,
        input: CalendarLabelForm,
    ) => CommandResult;
    readonly deleteCalendarLabel: (calendarLabelId: string) => CommandResult;
};

const UNREACHABLE: ApiError = {
    code: ApiErrorCodeEnum.NETWORK_ERROR,
    message: 'Agenda label server action unreachable',
    backendCode: null,
};

// Each action validates the form and the id again (core-frontend.md rule 14).
export class ServerActionCalendarLabelCommandGateway extends CalendarLabelCommandGateway {
    constructor(private readonly actions: CalendarLabelCommandActions) {
        super();
    }

    override createCalendarLabel(
        form: CalendarLabelForm,
    ): Promise<Result<CalendarLabelItem, ApiError>> {
        return runServerAction(
            () => this.actions.createCalendarLabel(form),
            UNREACHABLE,
        );
    }

    override editCalendarLabel(
        calendarLabelId: string,
        form: CalendarLabelForm,
    ): CommandResult {
        return runServerAction(
            () => this.actions.editCalendarLabel(calendarLabelId, form),
            UNREACHABLE,
        );
    }

    override deleteCalendarLabel(calendarLabelId: string): CommandResult {
        return runServerAction(
            () => this.actions.deleteCalendarLabel(calendarLabelId),
            UNREACHABLE,
        );
    }
}
