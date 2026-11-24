import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import type { InstantPhotoPreconditionService } from '../../domain/services/instant-photo-precondition.service';
import {
    type InstantPhotoFileView,
    toInstantPhotoFileView,
} from '../mappers/instant-photo-file-view.mapper';

export type GetInstantPhotoFileCommand = {
    readonly instantPhotoId: string;
};

export class GetInstantPhotoFileUseCase {
    constructor(
        private readonly instantPhotoPreconditionService: InstantPhotoPreconditionService,
    ) {}

    // The bytes of a live photo of the couple only: another couple and a withdrawn photo answer not found (R6).
    async execute(
        context: ExecutionContext,
        command: GetInstantPhotoFileCommand,
    ): Promise<InstantPhotoFileView> {
        const instantPhoto =
            await this.instantPhotoPreconditionService.loadInstantPhoto(
                context,
                command.instantPhotoId,
            );
        const file =
            await this.instantPhotoPreconditionService.loadFileOf(instantPhoto);
        return toInstantPhotoFileView(instantPhoto, file);
    }
}
