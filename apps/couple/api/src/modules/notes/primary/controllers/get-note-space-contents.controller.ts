import {
    Controller,
    Get,
    Param,
    Query,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import {
    type NoteSpaceContentsQueryRequest,
    NoteSpaceContentsQueryRequestSchema,
    type NoteSpaceContentsResponse,
    NoteSpaceContentsResponseSchema,
    type NoteSpaceParamsRequest,
    NoteSpaceParamsRequestSchema,
} from '@cocooning/couple-contract/notes';
import { GetNoteSpaceContentsUseCase } from '@cocooning/couple-server-business-logic/notes';
import { ApiRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import {
    ZodResponse,
    ZodValidationPipe,
} from '@cocooning/server-infrastructure/nest';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import { CurrentCouple, NoteCoupleGuard } from '../couple';
import { toNoteSpaceContentsResponse } from '../mappers';

// R10, R14: the root of a space or one of its folders.
@Controller()
@UseGuards(NoteCoupleGuard)
export class GetNoteSpaceContentsController {
    constructor(
        private readonly getNoteSpaceContentsUseCase: GetNoteSpaceContentsUseCase,
    ) {}

    @Get(ApiRouterEnum.NOTE_SPACE_CONTENTS_GET)
    @UseInterceptors(ZodResponse(NoteSpaceContentsResponseSchema))
    async handle(
        @CurrentCouple() couple: ExecutionContext,
        @Param(new ZodValidationPipe(NoteSpaceParamsRequestSchema))
        params: NoteSpaceParamsRequest,
        @Query(new ZodValidationPipe(NoteSpaceContentsQueryRequestSchema))
        query: NoteSpaceContentsQueryRequest,
    ): Promise<NoteSpaceContentsResponse> {
        return toNoteSpaceContentsResponse(
            await this.getNoteSpaceContentsUseCase.execute(couple, {
                ...params,
                ...query,
            }),
        );
    }
}
