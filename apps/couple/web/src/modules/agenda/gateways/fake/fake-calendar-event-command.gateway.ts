import type { CalendarEventForm } from '@cocooning/couple-client-business-logic/agenda';
import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import { ok, type Result } from '@cocooning/shared-kernel/utils';
import { CalendarEventCommandGateway } from '../ports/calendar-event-command.gateway';
import type { CalendarEventCommandCall } from './calendar-event-command-call';

type Outcome = Result<null, ApiError>;

export class FakeCalendarEventCommandGateway extends CalendarEventCommandGateway {
    private readonly outcomes = new Map<
        CalendarEventCommandCall['operation'],
        Outcome
    >();
    private readonly recordedCalls: CalendarEventCommandCall[] = [];
    private held: Promise<void> | null = null;

    get calls(): readonly CalendarEventCommandCall[] {
        return [...this.recordedCalls];
    }

    // Every operation answers ok(null) unless a scenario gives it another outcome.
    givenOutcome(
        operation: CalendarEventCommandCall['operation'],
        outcome: Outcome,
    ): void {
        this.outcomes.set(operation, outcome);
    }

    // The next answers wait until the returned release is called: the spec sees the command still running.
    holdAnswers(): () => void {
        let release: () => void = () => {};
        this.held = new Promise((resolve) => {
            release = resolve;
        });
        return release;
    }

    override createCalendarEvent(form: CalendarEventForm): Promise<Outcome> {
        return this.answer({ operation: 'createCalendarEvent', form });
    }

    override editCalendarEvent(
        calendarEventId: string,
        form: CalendarEventForm,
    ): Promise<Outcome> {
        return this.answer({
            operation: 'editCalendarEvent',
            calendarEventId,
            form,
        });
    }

    override shareCalendarEvent(calendarEventId: string): Promise<Outcome> {
        return this.answer({
            operation: 'shareCalendarEvent',
            calendarEventId,
        });
    }

    override makeCalendarEventPrivate(
        calendarEventId: string,
    ): Promise<Outcome> {
        return this.answer({
            operation: 'makeCalendarEventPrivate',
            calendarEventId,
        });
    }

    override deleteCalendarEvent(calendarEventId: string): Promise<Outcome> {
        return this.answer({
            operation: 'deleteCalendarEvent',
            calendarEventId,
        });
    }

    private async answer(call: CalendarEventCommandCall): Promise<Outcome> {
        this.recordedCalls.push(call);
        await this.held;
        return this.outcomes.get(call.operation) ?? ok(null);
    }
}
