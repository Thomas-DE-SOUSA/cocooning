import 'server-only';
import {
    type CreateCalendarEventUseCase,
    createCalendarEventFormSchema,
    type EditCalendarEventUseCase,
} from '@cocooning/couple-client-business-logic/agenda';
import {
    type ApiError,
    ApiErrorCodeEnum,
    type Translator,
} from '@cocooning/couple-client-business-logic/shared';
import { CalendarEventParamsRequestSchema } from '@cocooning/couple-contract/agenda';
import { fail, ok, type Result } from '@cocooning/shared-kernel/utils';
import { z } from 'zod';

export type CreateCalendarEventContext = {
    readonly t: Translator;
    readonly createCalendarEvent: CreateCalendarEventUseCase;
};

export type EditCalendarEventContext = {
    readonly t: Translator;
    readonly editCalendarEvent: EditCalendarEventUseCase;
};

export type CalendarEventUseCaseCall = (
    calendarEventId: string,
) => Promise<Result<unknown, ApiError>>;

const invalid = (message: string): ApiError => ({
    code: ApiErrorCodeEnum.VALIDATION_ERROR,
    message,
    backendCode: null,
});

// core-frontend.md rule 14: a server action is a public endpoint, its input is validated again here.
export async function createCalendarEvent(
    input: unknown,
    context: CreateCalendarEventContext,
): Promise<Result<null, ApiError>> {
    const form = createCalendarEventFormSchema(context.t).safeParse(input);
    if (!form.success) return fail(invalid('Invalid calendar event form'));
    const event = await context.createCalendarEvent.execute(form.data);
    return event.success ? ok(null) : event;
}

export async function actOnCalendarEvent(
    input: unknown,
    call: CalendarEventUseCaseCall,
): Promise<Result<null, ApiError>> {
    const params = CalendarEventParamsRequestSchema.safeParse({
        calendarEventId: input,
    });
    if (!params.success) return fail(invalid('Invalid calendar event id'));
    const result = await call(params.data.calendarEventId);
    return result.success ? ok(null) : result;
}

// R9: the edit sends the details, the visibility has its own commands (R8). R11: isOwner turns the audience picked by
// the reader into the audience of the author; a wrong one only changes who the event is for, which either partner may.
export async function editCalendarEvent(
    calendarEventIdInput: unknown,
    input: unknown,
    isOwnerInput: unknown,
    context: EditCalendarEventContext,
): Promise<Result<null, ApiError>> {
    const form = createCalendarEventFormSchema(context.t).safeParse(input);
    if (!form.success) return fail(invalid('Invalid calendar event form'));
    const isOwner = z.boolean().safeParse(isOwnerInput);
    if (!isOwner.success) return fail(invalid('Invalid calendar event author'));
    return actOnCalendarEvent(calendarEventIdInput, (calendarEventId) =>
        context.editCalendarEvent.execute(
            calendarEventId,
            form.data,
            isOwner.data,
        ),
    );
}
