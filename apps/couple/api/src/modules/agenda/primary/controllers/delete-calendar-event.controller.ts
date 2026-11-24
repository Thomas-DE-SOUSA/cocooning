import {
    Controller,
    Delete,
    HttpCode,
    HttpStatus,
    Param,
    UseGuards,
} from '@nestjs/common';
import {
    type CalendarEventParamsRequest,
    CalendarEventParamsRequestSchema,
} from '@cocooning/couple-contract/agenda';
import { DeleteCalendarEventUseCase } from '@cocooning/couple-server-business-logic/agenda';
import { ApiRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import { ZodValidationPipe } from '@cocooning/server-infrastructure/nest';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import { AgendaCoupleGuard, CurrentCouple } from '../couple';

// R9: either partner deletes an event they see, softly.
@Controller()
@UseGuards(AgendaCoupleGuard)
export class DeleteCalendarEventController {
    constructor(
        private readonly deleteCalendarEventUseCase: DeleteCalendarEventUseCase,
    ) {}

    @Delete(ApiRouterEnum.CALENDAR_EVENT_DELETE)
    @HttpCode(HttpStatus.NO_CONTENT)
    async handle(
        @CurrentCouple() couple: ExecutionContext,
        @Param(new ZodValidationPipe(CalendarEventParamsRequestSchema))
        params: CalendarEventParamsRequest,
    ): Promise<void> {
        await this.deleteCalendarEventUseCase.execute(couple, params);
    }
}
