import {
    Body,
    Controller,
    Param,
    Post,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import {
    type AddNoteCardRequest,
    AddNoteCardRequestSchema,
    type FolderParamsRequest,
    FolderParamsRequestSchema,
    type NoteDetailResponse,
    NoteDetailResponseSchema,
} from '@cocooning/couple-contract/notes';
import { AddNoteCardUseCase } from '@cocooning/couple-server-business-logic/notes';
import { ApiRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import {
    ZodResponse,
    ZodValidationPipe,
} from '@cocooning/server-infrastructure/nest';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import { CurrentCouple, NoteCoupleGuard } from '../couple';
import { toNoteDetailResponse } from '../mappers';

// R19, R20: a name typed in a smart folder becomes a note with its card « en recherche ».
@Controller()
@UseGuards(NoteCoupleGuard)
export class AddNoteCardController {
    constructor(private readonly addNoteCardUseCase: AddNoteCardUseCase) {}

    @Post(ApiRouterEnum.NOTE_CARD_ADD)
    @UseInterceptors(ZodResponse(NoteDetailResponseSchema))
    async handle(
        @CurrentCouple() couple: ExecutionContext,
        @Param(new ZodValidationPipe(FolderParamsRequestSchema))
        params: FolderParamsRequest,
        @Body(new ZodValidationPipe(AddNoteCardRequestSchema))
        request: AddNoteCardRequest,
    ): Promise<NoteDetailResponse> {
        return toNoteDetailResponse(
            await this.addNoteCardUseCase.execute(couple, {
                ...params,
                ...request,
            }),
        );
    }
}
