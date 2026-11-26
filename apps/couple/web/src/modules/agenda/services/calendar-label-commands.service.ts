import 'server-only';
import {
    type CreateCalendarLabelUseCase,
    createCalendarLabelFormSchema,
    type EditCalendarLabelUseCase,
} from '@cocooning/couple-client-business-logic/agenda';
import {
    type ApiError,
    ApiErrorCodeEnum,
    type Translator,
} from '@cocooning/couple-client-business-logic/shared';
import { CalendarLabelParamsRequestSchema } from '@cocooning/couple-contract/agenda';
import { fail, ok, type Result } from '@cocooning/shared-kernel/utils';
import type { CalendarLabelItem } from '../view-models/calendar-label.view-model';

export type CreateCalendarLabelContext = {
    readonly t: Translator;
    readonly createCalendarLabel: CreateCalendarLabelUseCase;
};

export type EditCalendarLabelContext = {
    readonly t: Translator;
    readonly editCalendarLabel: EditCalendarLabelUseCase;
};

export type CalendarLabelUseCaseCall = (
    calendarLabelId: string,
) => Promise<Result<unknown, ApiError>>;

const invalid = (message: string): ApiError => ({
    code: ApiErrorCodeEnum.VALIDATION_ERROR,
    message,
    backendCode: null,
});

// core-frontend.md rule 14: a server action is a public endpoint, its input is validated again here (R12).
export async function createCalendarLabel(
    input: unknown,
    context: CreateCalendarLabelContext,
): Promise<Result<CalendarLabelItem, ApiError>> {
    const form = createCalendarLabelFormSchema(context.t).safeParse(input);
    if (!form.success) return fail(invalid('Invalid calendar label form'));
    const label = await context.createCalendarLabel.execute(form.data);
    if (!label.success) return label;
    const { calendarLabelId, name, color } = label.value;
    return ok({ calendarLabelId, name, color });
}

export async function actOnCalendarLabel(
    input: unknown,
    call: CalendarLabelUseCaseCall,
): Promise<Result<null, ApiError>> {
    const params = CalendarLabelParamsRequestSchema.safeParse({
        calendarLabelId: input,
    });
    if (!params.success) return fail(invalid('Invalid calendar label id'));
    const result = await call(params.data.calendarLabelId);
    return result.success ? ok(null) : result;
}

export async function editCalendarLabel(
    calendarLabelIdInput: unknown,
    input: unknown,
    context: EditCalendarLabelContext,
): Promise<Result<null, ApiError>> {
    const form = createCalendarLabelFormSchema(context.t).safeParse(input);
    if (!form.success) return fail(invalid('Invalid calendar label form'));
    return actOnCalendarLabel(calendarLabelIdInput, (calendarLabelId) =>
        context.editCalendarLabel.execute(calendarLabelId, form.data),
    );
}
