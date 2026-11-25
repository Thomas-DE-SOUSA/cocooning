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
    type NoteCardResponse,
    NoteCardResponseSchema,
    type NoteParamsRequest,
    NoteParamsRequestSchema,
} from '@cocooning/couple-contract/notes';
import { RefreshNoteCardUseCase } from '@cocooning/couple-server-business-logic/notes';
import { ApiRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import {
    ZodResponse,
    ZodValidationPipe,
} from '@cocooning/server-infrastructure/nest';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import { CurrentCouple, NoteCoupleGuard } from '../couple';
import { toNoteCardResponse } from '../mappers';

// R20, R22: « Mettre à jour », keeping the fields corrected by hand.
@Controller()
@UseGuards(NoteCoupleGuard)
export class RefreshNoteCardController {
    constructor(private readonly useCase: RefreshNoteCardUseCase) {}

    @Post(ApiRouterEnum.NOTE_CARD_REFRESH)
    @HttpCode(HttpStatus.OK)
    @UseInterceptors(ZodResponse(NoteCardResponseSchema))
    async handle(
        @CurrentCouple() couple: ExecutionContext,
        @Param(new ZodValidationPipe(NoteParamsRequestSchema))
        params: NoteParamsRequest,
    ): Promise<NoteCardResponse> {
        return toNoteCardResponse(await this.useCase.execute(couple, params));
    }
}
