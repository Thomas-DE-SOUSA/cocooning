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
    type CalendarLabelParamsRequest,
    CalendarLabelParamsRequestSchema,
    type CalendarLabelResponse,
    CalendarLabelResponseSchema,
    type EditCalendarLabelRequest,
    EditCalendarLabelRequestSchema,
} from '@cocooning/couple-contract/agenda';
import { EditCalendarLabelUseCase } from '@cocooning/couple-server-business-logic/agenda';
import { ApiRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import {
    ZodResponse,
    ZodValidationPipe,
} from '@cocooning/server-infrastructure/nest';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import { AgendaCoupleGuard, CurrentCouple } from '../couple';
import { toCalendarLabelResponse } from '../mappers';

// R12: either partner renames and recolours a label of the couple.
@Controller()
@UseGuards(AgendaCoupleGuard)
export class EditCalendarLabelController {
    constructor(
        private readonly editCalendarLabelUseCase: EditCalendarLabelUseCase,
    ) {}

    @Patch(ApiRouterEnum.CALENDAR_LABEL_EDIT)
    @HttpCode(HttpStatus.OK)
    @UseInterceptors(ZodResponse(CalendarLabelResponseSchema))
    async handle(
        @CurrentCouple() couple: ExecutionContext,
        @Param(new ZodValidationPipe(CalendarLabelParamsRequestSchema))
        params: CalendarLabelParamsRequest,
        @Body(new ZodValidationPipe(EditCalendarLabelRequestSchema))
        request: EditCalendarLabelRequest,
    ): Promise<CalendarLabelResponse> {
        return toCalendarLabelResponse(
            await this.editCalendarLabelUseCase.execute(couple, {
                ...params,
                ...request,
            }),
        );
    }
}
