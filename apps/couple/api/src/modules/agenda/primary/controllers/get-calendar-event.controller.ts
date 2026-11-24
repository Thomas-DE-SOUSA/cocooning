import {
    Controller,
    Get,
    Param,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import {
    type CalendarEventParamsRequest,
    CalendarEventParamsRequestSchema,
    type CalendarEventResponse,
    CalendarEventResponseSchema,
} from '@cocooning/couple-contract/agenda';
import { GetCalendarEventUseCase } from '@cocooning/couple-server-business-logic/agenda';
import { ApiRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import {
    ZodResponse,
    ZodValidationPipe,
} from '@cocooning/server-infrastructure/nest';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import { AgendaCoupleGuard, CurrentCouple } from '../couple';
import { toCalendarEventResponse } from '../mappers';

// R7: one event the partner sees; the private event of the other answers 404.
@Controller()
@UseGuards(AgendaCoupleGuard)
export class GetCalendarEventController {
    constructor(
        private readonly getCalendarEventUseCase: GetCalendarEventUseCase,
    ) {}

    @Get(ApiRouterEnum.CALENDAR_EVENT_GET)
    @UseInterceptors(ZodResponse(CalendarEventResponseSchema))
    async handle(
        @CurrentCouple() couple: ExecutionContext,
        @Param(new ZodValidationPipe(CalendarEventParamsRequestSchema))
        params: CalendarEventParamsRequest,
    ): Promise<CalendarEventResponse> {
        return toCalendarEventResponse(
            await this.getCalendarEventUseCase.execute(couple, params),
        );
    }
}
