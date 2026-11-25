import {
    Body,
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
    type RefineNoteCardRequest,
    RefineNoteCardRequestSchema,
} from '@cocooning/couple-contract/notes';
import { RefineNoteCardUseCase } from '@cocooning/couple-server-business-logic/notes';
import { ApiRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import {
    ZodResponse,
    ZodValidationPipe,
} from '@cocooning/server-infrastructure/nest';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import { CurrentCouple, NoteCoupleGuard } from '../couple';
import { toNoteCardResponse } from '../mappers';

// R19: « je précise », and the card searches again.
@Controller()
@UseGuards(NoteCoupleGuard)
export class RefineNoteCardController {
    constructor(private readonly useCase: RefineNoteCardUseCase) {}

    @Post(ApiRouterEnum.NOTE_CARD_REFINE)
    @HttpCode(HttpStatus.OK)
    @UseInterceptors(ZodResponse(NoteCardResponseSchema))
    async handle(
        @CurrentCouple() couple: ExecutionContext,
        @Param(new ZodValidationPipe(NoteParamsRequestSchema))
        params: NoteParamsRequest,
        @Body(new ZodValidationPipe(RefineNoteCardRequestSchema))
        request: RefineNoteCardRequest,
    ): Promise<NoteCardResponse> {
        return toNoteCardResponse(
            await this.useCase.execute(couple, { ...params, ...request }),
        );
    }
}
