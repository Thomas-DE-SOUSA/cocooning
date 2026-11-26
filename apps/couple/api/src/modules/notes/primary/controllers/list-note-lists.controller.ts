import {
    Controller,
    Get,
    Query,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import {
    type NoteListIndexResponse,
    NoteListIndexResponseSchema,
    type NoteListQueryRequest,
    NoteListQueryRequestSchema,
} from '@cocooning/couple-contract/notes';
import { ListNoteListsUseCase } from '@cocooning/couple-server-business-logic/notes';
import { ApiRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import {
    ZodResponse,
    ZodValidationPipe,
} from '@cocooning/server-infrastructure/nest';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import { CurrentCouple, NoteCoupleGuard } from '../couple';
import { toNoteListIndexResponse } from '../mappers';

// R28: the home of a section of the Lists tab, with what is left to check.
@Controller()
@UseGuards(NoteCoupleGuard)
export class ListNoteListsController {
    constructor(private readonly listNoteListsUseCase: ListNoteListsUseCase) {}

    @Get(ApiRouterEnum.NOTE_LIST_INDEX)
    @UseInterceptors(ZodResponse(NoteListIndexResponseSchema))
    async handle(
        @CurrentCouple() couple: ExecutionContext,
        @Query(new ZodValidationPipe(NoteListQueryRequestSchema))
        query: NoteListQueryRequest,
    ): Promise<NoteListIndexResponse> {
        return toNoteListIndexResponse(
            await this.listNoteListsUseCase.execute(couple, query),
        );
    }
}
