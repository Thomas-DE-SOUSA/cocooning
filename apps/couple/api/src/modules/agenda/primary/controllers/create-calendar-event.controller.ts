import {
    Body,
    Controller,
    Post,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import {
    type CalendarEventResponse,
    CalendarEventResponseSchema,
    type CreateCalendarEventRequest,
    CreateCalendarEventRequestSchema,
} from '@cocooning/couple-contract/agenda';
import { CreateCalendarEventUseCase } from '@cocooning/couple-server-business-logic/agenda';
import { ApiRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import {
    ZodResponse,
    ZodValidationPipe,
} from '@cocooning/server-infrastructure/nest';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import { AgendaCoupleGuard, CurrentCouple } from '../couple';
import { toCalendarEventResponse } from '../mappers';

// R1, R3: a new event of the couple, owned by its author.
@Controller()
@UseGuards(AgendaCoupleGuard)
export class CreateCalendarEventController {
    constructor(
        private readonly createCalendarEventUseCase: CreateCalendarEventUseCase,
    ) {}

    @Post(ApiRouterEnum.CALENDAR_EVENT_CREATE)
    @UseInterceptors(ZodResponse(CalendarEventResponseSchema))
    async handle(
        @CurrentCouple() couple: ExecutionContext,
        @Body(new ZodValidationPipe(CreateCalendarEventRequestSchema))
        request: CreateCalendarEventRequest,
    ): Promise<CalendarEventResponse> {
        return toCalendarEventResponse(
            await this.createCalendarEventUseCase.execute(couple, request),
        );
    }
}
