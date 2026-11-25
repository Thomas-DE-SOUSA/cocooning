import {
    Controller,
    Delete,
    HttpCode,
    HttpStatus,
    Param,
    UseGuards,
} from '@nestjs/common';
import {
    type CalendarLabelParamsRequest,
    CalendarLabelParamsRequestSchema,
} from '@cocooning/couple-contract/agenda';
import { DeleteCalendarLabelUseCase } from '@cocooning/couple-server-business-logic/agenda';
import { ApiRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import { ZodValidationPipe } from '@cocooning/server-infrastructure/nest';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import { AgendaCoupleGuard, CurrentCouple } from '../couple';

// R12, R14: either partner deletes a label of the couple, softly.
@Controller()
@UseGuards(AgendaCoupleGuard)
export class DeleteCalendarLabelController {
    constructor(
        private readonly deleteCalendarLabelUseCase: DeleteCalendarLabelUseCase,
    ) {}

    @Delete(ApiRouterEnum.CALENDAR_LABEL_DELETE)
    @HttpCode(HttpStatus.NO_CONTENT)
    async handle(
        @CurrentCouple() couple: ExecutionContext,
        @Param(new ZodValidationPipe(CalendarLabelParamsRequestSchema))
        params: CalendarLabelParamsRequest,
    ): Promise<void> {
        await this.deleteCalendarLabelUseCase.execute(couple, params);
    }
}
