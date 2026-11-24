import {
    Controller,
    Get,
    Query,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import {
    type CalendarEventListResponse,
    CalendarEventListResponseSchema,
    type CalendarEventQueryRequest,
    CalendarEventQueryRequestSchema,
} from '@cocooning/couple-contract/agenda';
import { ListCalendarEventsUseCase } from '@cocooning/couple-server-business-logic/agenda';
import { ApiRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import {
    ZodResponse,
    ZodValidationPipe,
} from '@cocooning/server-infrastructure/nest';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import { AgendaCoupleGuard, CurrentCouple } from '../couple';
import { toCalendarEventListResponse } from '../mappers';

// R7: the events the partner sees over a range of days, in day order.
@Controller()
@UseGuards(AgendaCoupleGuard)
export class ListCalendarEventsController {
    constructor(
        private readonly listCalendarEventsUseCase: ListCalendarEventsUseCase,
    ) {}

    @Get(ApiRouterEnum.CALENDAR_EVENT_LIST)
    @UseInterceptors(ZodResponse(CalendarEventListResponseSchema))
    async handle(
        @CurrentCouple() couple: ExecutionContext,
        @Query(new ZodValidationPipe(CalendarEventQueryRequestSchema))
        query: CalendarEventQueryRequest,
    ): Promise<CalendarEventListResponse> {
        return toCalendarEventListResponse(
            await this.listCalendarEventsUseCase.execute(couple, query),
        );
    }
}
