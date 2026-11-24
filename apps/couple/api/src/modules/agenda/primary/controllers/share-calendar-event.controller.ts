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
import { ShareCalendarEventUseCase } from '@cocooning/couple-server-business-logic/agenda';
import { ApiRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import {
    ZodResponse,
    ZodValidationPipe,
} from '@cocooning/server-infrastructure/nest';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import { AgendaCoupleGuard, CurrentCouple } from '../couple';
import { toCalendarEventResponse } from '../mappers';

// R8: the author shares an event.
@Controller()
@UseGuards(AgendaCoupleGuard)
export class ShareCalendarEventController {
    constructor(
        private readonly shareCalendarEventUseCase: ShareCalendarEventUseCase,
    ) {}

    @Post(ApiRouterEnum.CALENDAR_EVENT_SHARE)
    @HttpCode(HttpStatus.OK)
    @UseInterceptors(ZodResponse(CalendarEventResponseSchema))
    async handle(
        @CurrentCouple() couple: ExecutionContext,
        @Param(new ZodValidationPipe(CalendarEventParamsRequestSchema))
        params: CalendarEventParamsRequest,
    ): Promise<CalendarEventResponse> {
        return toCalendarEventResponse(
            await this.shareCalendarEventUseCase.execute(couple, params),
        );
    }
}
