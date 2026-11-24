import {
    Controller,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import {
    type CalendarEventParamsRequest,
    CalendarEventParamsRequestSchema,
    type CalendarEventResponse,
    CalendarEventResponseSchema,
} from '@cocooning/couple-contract/agenda';
import { MakeCalendarEventPrivateUseCase } from '@cocooning/couple-server-business-logic/agenda';
import { ApiRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import {
    ZodResponse,
    ZodValidationPipe,
} from '@cocooning/server-infrastructure/nest';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import { AgendaCoupleGuard, CurrentCouple } from '../couple';
import { toCalendarEventResponse } from '../mappers';

// R7, R8: the author keeps an event "rien que pour moi".
@Controller()
@UseGuards(AgendaCoupleGuard)
export class MakeCalendarEventPrivateController {
    constructor(
        private readonly makeCalendarEventPrivateUseCase: MakeCalendarEventPrivateUseCase,
    ) {}

    @Post(ApiRouterEnum.CALENDAR_EVENT_MAKE_PRIVATE)
    @HttpCode(HttpStatus.OK)
    @UseInterceptors(ZodResponse(CalendarEventResponseSchema))
    async handle(
        @CurrentCouple() couple: ExecutionContext,
        @Param(new ZodValidationPipe(CalendarEventParamsRequestSchema))
        params: CalendarEventParamsRequest,
    ): Promise<CalendarEventResponse> {
        return toCalendarEventResponse(
            await this.makeCalendarEventPrivateUseCase.execute(couple, params),
        );
    }
}
