import { Injectable } from '@nestjs/common';
import { PrismaService } from '@cocooning/couple-prisma/nest';
import { NoteContentRepository } from '@cocooning/couple-server-business-logic/notes';
import { Logger } from '@cocooning/shared-kernel/ports';

// The Yjs state lives on the note row; the soft-delete extension skips a deleted note, whose write then changes nothing.
@Injectable()
export class NoteContentPrismaRepository extends NoteContentRepository {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly logger: Logger,
    ) {
        super();
        this.logger.setContext(NoteContentPrismaRepository.name);
    }

    override async findContent(
        coupleId: string,
        noteId: string,
    ): Promise<Uint8Array | null> {
        try {
            const row = await this.prismaService.current.note.findFirst({
                where: { coupleId, id: noteId },
                select: { contentState: true },
            });
            if (row === null || row.contentState === null) return null;
            return new Uint8Array(row.contentState);
        } catch (error) {
            this.logger.error('Failed to load note content', { noteId, error });
            throw error;
        }
    }

    // The content itself never reaches a log (core.md rule 33).
    override async saveContent(
        coupleId: string,
        noteId: string,
        content: Uint8Array,
        now: Date,
    ): Promise<void> {
        try {
            await this.prismaService.current.note.updateMany({
                where: { coupleId, id: noteId },
                data: {
                    contentState: Uint8Array.from(content),
                    updatedAt: now,
                },
            });
        } catch (error) {
            this.logger.error('Failed to save note content', { noteId, error });
            throw error;
        }
    }
}
