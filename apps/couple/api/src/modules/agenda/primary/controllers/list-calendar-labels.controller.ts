import { Controller, Get, UseGuards, UseInterceptors } from '@nestjs/common';
import {
    type CalendarLabelListResponse,
    CalendarLabelListResponseSchema,
} from '@cocooning/couple-contract/agenda';
import { ListCalendarLabelsUseCase } from '@cocooning/couple-server-business-logic/agenda';
import { ApiRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import { ZodResponse } from '@cocooning/server-infrastructure/nest';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import { AgendaCoupleGuard, CurrentCouple } from '../couple';
import { toCalendarLabelListResponse } from '../mappers';

// R12: the labels of the couple, in creation order.
@Controller()
@UseGuards(AgendaCoupleGuard)
export class ListCalendarLabelsController {
    constructor(
        private readonly listCalendarLabelsUseCase: ListCalendarLabelsUseCase,
    ) {}

    @Get(ApiRouterEnum.CALENDAR_LABEL_LIST)
    @UseInterceptors(ZodResponse(CalendarLabelListResponseSchema))
    async handle(
        @CurrentCouple() couple: ExecutionContext,
    ): Promise<CalendarLabelListResponse> {
        return toCalendarLabelListResponse(
            await this.listCalendarLabelsUseCase.execute(couple),
        );
    }
}
