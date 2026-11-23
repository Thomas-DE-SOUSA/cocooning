import {
    Controller,
    Get,
    Query,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import {
    type NotePageResponse,
    NotePageResponseSchema,
} from '@cocooning/couple-contract/notes';
import {
    type OffsetPaginationQuery,
    OffsetPaginationQuerySchema,
} from '@cocooning/couple-contract/shared';
import { ListNotesUseCase } from '@cocooning/couple-server-business-logic/notes';
import { ApiRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import {
    ZodResponse,
    ZodValidationPipe,
} from '@cocooning/server-infrastructure/nest';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import { CurrentCouple, NoteCoupleGuard } from '../couple';
import { toNotePageResponse } from '../mappers';

// R4: one page of the notes the partner sees (decision 0025).
@Controller()
@UseGuards(NoteCoupleGuard)
export class ListNotesController {
    constructor(private readonly listNotesUseCase: ListNotesUseCase) {}

    @Get(ApiRouterEnum.NOTE_LIST)
    @UseInterceptors(ZodResponse(NotePageResponseSchema))
    async handle(
        @CurrentCouple() couple: ExecutionContext,
        @Query(new ZodValidationPipe(OffsetPaginationQuerySchema))
        query: OffsetPaginationQuery,
    ): Promise<NotePageResponse> {
        return toNotePageResponse(
            await this.listNotesUseCase.execute(couple, query),
        );
    }
}
