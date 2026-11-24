import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import {
    type CalendarEventParamsRequest,
    CalendarEventParamsRequestSchema,
    type CalendarEventResponse,
    CalendarEventResponseSchema,
    type EditCalendarEventRequest,
    EditCalendarEventRequestSchema,
} from '@cocooning/couple-contract/agenda';
import { EditCalendarEventUseCase } from '@cocooning/couple-server-business-logic/agenda';
import { ApiRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import {
    ZodResponse,
    ZodValidationPipe,
} from '@cocooning/server-infrastructure/nest';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import { AgendaCoupleGuard, CurrentCouple } from '../couple';
import { toCalendarEventResponse } from '../mappers';

// R9: either partner edits an event they see; every detail is sent again.
@Controller()
@UseGuards(AgendaCoupleGuard)
export class EditCalendarEventController {
    constructor(
        private readonly editCalendarEventUseCase: EditCalendarEventUseCase,
    ) {}

    @Patch(ApiRouterEnum.CALENDAR_EVENT_EDIT)
    @HttpCode(HttpStatus.OK)
    @UseInterceptors(ZodResponse(CalendarEventResponseSchema))
    async handle(
        @CurrentCouple() couple: ExecutionContext,
        @Param(new ZodValidationPipe(CalendarEventParamsRequestSchema))
        params: CalendarEventParamsRequest,
        @Body(new ZodValidationPipe(EditCalendarEventRequestSchema))
        request: EditCalendarEventRequest,
    ): Promise<CalendarEventResponse> {
        return toCalendarEventResponse(
            await this.editCalendarEventUseCase.execute(couple, {
                ...params,
                ...request,
            }),
        );
    }
}
