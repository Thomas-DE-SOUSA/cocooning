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
    type ChooseNoteCardCandidateRequest,
    ChooseNoteCardCandidateRequestSchema,
} from '@cocooning/couple-contract/notes';
import { ChooseNoteCardCandidateUseCase } from '@cocooning/couple-server-business-logic/notes';
import { ApiRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import {
    ZodResponse,
    ZodValidationPipe,
} from '@cocooning/server-infrastructure/nest';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import { CurrentCouple, NoteCoupleGuard } from '../couple';
import { toNoteCardResponse } from '../mappers';

// R19: one of the candidates shown becomes the query.
@Controller()
@UseGuards(NoteCoupleGuard)
export class ChooseNoteCardCandidateController {
    constructor(private readonly useCase: ChooseNoteCardCandidateUseCase) {}

    @Post(ApiRouterEnum.NOTE_CARD_CANDIDATE_CHOOSE)
    @HttpCode(HttpStatus.OK)
    @UseInterceptors(ZodResponse(NoteCardResponseSchema))
    async handle(
        @CurrentCouple() couple: ExecutionContext,
        @Param(new ZodValidationPipe(NoteParamsRequestSchema))
        params: NoteParamsRequest,
        @Body(new ZodValidationPipe(ChooseNoteCardCandidateRequestSchema))
        request: ChooseNoteCardCandidateRequest,
    ): Promise<NoteCardResponse> {
        return toNoteCardResponse(
            await this.useCase.execute(couple, { ...params, ...request }),
        );
    }
}
