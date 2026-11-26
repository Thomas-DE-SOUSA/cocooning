import {
    Body,
    Controller,
    Post,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import {
    type CreateNoteListRequest,
    CreateNoteListRequestSchema,
    type NoteListResponse,
    NoteListResponseSchema,
} from '@cocooning/couple-contract/notes';
import { CreateNoteListUseCase } from '@cocooning/couple-server-business-logic/notes';
import { ApiRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import {
    ZodResponse,
    ZodValidationPipe,
} from '@cocooning/server-infrastructure/nest';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import { CurrentCouple, NoteCoupleGuard } from '../couple';
import { toNoteListResponse } from '../mappers';

// R1, R26: a new list of a section, shared or private by its space, owned by its creator.
@Controller()
@UseGuards(NoteCoupleGuard)
export class CreateNoteListController {
    constructor(
        private readonly createNoteListUseCase: CreateNoteListUseCase,
    ) {}

    @Post(ApiRouterEnum.NOTE_LIST_CREATE)
    @UseInterceptors(ZodResponse(NoteListResponseSchema))
    async handle(
        @CurrentCouple() couple: ExecutionContext,
        @Body(new ZodValidationPipe(CreateNoteListRequestSchema))
        request: CreateNoteListRequest,
    ): Promise<NoteListResponse> {
        return toNoteListResponse(
            await this.createNoteListUseCase.execute(couple, request),
        );
    }
}
