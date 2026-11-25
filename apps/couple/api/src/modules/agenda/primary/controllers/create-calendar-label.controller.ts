import {
    Body,
    Controller,
    Post,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import {
    type CalendarLabelResponse,
    CalendarLabelResponseSchema,
    type CreateCalendarLabelRequest,
    CreateCalendarLabelRequestSchema,
} from '@cocooning/couple-contract/agenda';
import { CreateCalendarLabelUseCase } from '@cocooning/couple-server-business-logic/agenda';
import { ApiRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import {
    ZodResponse,
    ZodValidationPipe,
} from '@cocooning/server-infrastructure/nest';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import { AgendaCoupleGuard, CurrentCouple } from '../couple';
import { toCalendarLabelResponse } from '../mappers';

// R12: a new label of the couple, within CALENDAR_LABEL_MAX_COUNT.
@Controller()
@UseGuards(AgendaCoupleGuard)
export class CreateCalendarLabelController {
    constructor(
        private readonly createCalendarLabelUseCase: CreateCalendarLabelUseCase,
    ) {}

    @Post(ApiRouterEnum.CALENDAR_LABEL_CREATE)
    @UseInterceptors(ZodResponse(CalendarLabelResponseSchema))
    async handle(
        @CurrentCouple() couple: ExecutionContext,
        @Body(new ZodValidationPipe(CreateCalendarLabelRequestSchema))
        request: CreateCalendarLabelRequest,
    ): Promise<CalendarLabelResponse> {
        return toCalendarLabelResponse(
            await this.createCalendarLabelUseCase.execute(couple, request),
        );
    }
}
