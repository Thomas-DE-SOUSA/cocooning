import { Controller, Get, UseGuards, UseInterceptors } from '@nestjs/common';
import {
    type NoteSpacesResponse,
    NoteSpacesResponseSchema,
} from '@cocooning/couple-contract/notes';
import { ListNoteSpacesUseCase } from '@cocooning/couple-server-business-logic/notes';
import { ApiRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import { ZodResponse } from '@cocooning/server-infrastructure/nest';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import { CurrentCouple, NoteCoupleGuard } from '../couple';
import { toNoteSpacesResponse } from '../mappers';

// R10: « Partagé » and the partner's own « Privé », with what each holds.
@Controller()
@UseGuards(NoteCoupleGuard)
export class ListNoteSpacesController {
    constructor(
        private readonly listNoteSpacesUseCase: ListNoteSpacesUseCase,
    ) {}

    @Get(ApiRouterEnum.NOTE_SPACE_LIST)
    @UseInterceptors(ZodResponse(NoteSpacesResponseSchema))
    async handle(
        @CurrentCouple() couple: ExecutionContext,
    ): Promise<NoteSpacesResponse> {
        return toNoteSpacesResponse(
            await this.listNoteSpacesUseCase.execute(couple),
        );
    }
}
