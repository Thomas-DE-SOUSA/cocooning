import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Param,
    Put,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import {
    type NoteCardResponse,
    NoteCardResponseSchema,
    type NoteParamsRequest,
    NoteParamsRequestSchema,
    type CorrectNoteCardFieldRequest,
    CorrectNoteCardFieldRequestSchema,
} from '@cocooning/couple-contract/notes';
import { CorrectNoteCardFieldUseCase } from '@cocooning/couple-server-business-logic/notes';
import { ApiRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import {
    ZodResponse,
    ZodValidationPipe,
} from '@cocooning/server-infrastructure/nest';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import { CurrentCouple, NoteCoupleGuard } from '../couple';
import { toNoteCardResponse } from '../mappers';

// R22: a field corrected by hand.
@Controller()
@UseGuards(NoteCoupleGuard)
export class CorrectNoteCardFieldController {
    constructor(private readonly useCase: CorrectNoteCardFieldUseCase) {}

    @Put(ApiRouterEnum.NOTE_CARD_FIELD_CORRECT)
    @HttpCode(HttpStatus.OK)
    @UseInterceptors(ZodResponse(NoteCardResponseSchema))
    async handle(
        @CurrentCouple() couple: ExecutionContext,
        @Param(new ZodValidationPipe(NoteParamsRequestSchema))
        params: NoteParamsRequest,
        @Body(new ZodValidationPipe(CorrectNoteCardFieldRequestSchema))
        request: CorrectNoteCardFieldRequest,
    ): Promise<NoteCardResponse> {
        return toNoteCardResponse(
            await this.useCase.execute(couple, { ...params, ...request }),
        );
    }
}
