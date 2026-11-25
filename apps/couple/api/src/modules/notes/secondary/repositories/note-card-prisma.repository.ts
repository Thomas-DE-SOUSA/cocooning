import { Injectable } from '@nestjs/common';
import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import { PrismaService } from '@cocooning/couple-prisma/nest';
import {
    NoteCard,
    NoteCardRepository,
    NoteException,
} from '@cocooning/couple-server-business-logic/notes';
import { Logger, UnitOfWork } from '@cocooning/shared-kernel/ports';
import { type NoteCardRow, toNoteCardSnapshot } from '../mappers';
import { claimPendingCards, readCardsInTree } from './note-card-prisma.query';
import { writeNoteCards } from './note-card-prisma.writer';
import { appendNoteEventsOfMany } from './note-event-prisma.writer';
import { toVersionConflict } from './outbox-version-conflict';

const toCard = (row: NoteCardRow): NoteCard =>
    NoteCard.fromSnapshot(toNoteCardSnapshot(row));

// The cards write their events to the outbox of the context, note_event (decision 0021). Logged by identifiers
// only: the query and the values belong to the couple (core.md rule 33).
@Injectable()
export class NoteCardPrismaRepository extends NoteCardRepository {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly unitOfWork: UnitOfWork,
        private readonly logger: Logger,
    ) {
        super();
        this.logger.setContext(NoteCardPrismaRepository.name);
    }

    override save(card: NoteCard): Promise<void> {
        return this.saveAll([card]);
    }

    override async saveAll(cards: ReadonlyArray<NoteCard>): Promise<void> {
        if (cards.length === 0) return;
        try {
            await this.unitOfWork.run(async () => {
                const tx = this.prismaService.current;
                await writeNoteCards(
                    tx,
                    cards.map((card) => card.toSnapshot()),
                );
                await appendNoteEventsOfMany(
                    tx,
                    cards.flatMap((card) => card.getDomainEvents()),
                );
            });
        } catch (error) {
            this.rethrow(error, cards);
        }
    }

    override findByNoteId(
        coupleId: string,
        noteId: string,
    ): Promise<NoteCard | null> {
        return this.read(noteId, async (tx) => {
            const row = await tx.noteCard.findFirst({
                where: { coupleId, noteId },
            });
            return row === null ? null : toCard(row);
        });
    }

    override findByNoteIds(
        coupleId: string,
        noteIds: ReadonlyArray<string>,
    ): Promise<ReadonlyArray<NoteCard>> {
        return this.read(coupleId, async (tx) => {
            const rows = await tx.noteCard.findMany({
                where: { coupleId, noteId: { in: [...noteIds] } },
            });
            return rows.map(toCard);
        });
    }

    override findInTree(
        coupleId: string,
        folderId: string,
    ): Promise<ReadonlyArray<NoteCard>> {
        return this.read(folderId, async (tx) =>
            (await readCardsInTree(tx, coupleId, folderId)).map(toCard),
        );
    }

    // In its own short transaction: the searches that follow never hold a row lock (decision 0054).
    override async claimPending(
        limit: number,
        now: Date,
    ): Promise<ReadonlyArray<NoteCard>> {
        try {
            const rows = await this.unitOfWork.run(() =>
                claimPendingCards(this.prismaService.current, limit, now),
            );
            return rows.map(toCard);
        } catch (error) {
            if (error instanceof NoteException) throw error;
            this.logger.error('Failed to claim note cards', { error });
            throw error;
        }
    }

    private async read<T>(
        logId: string,
        work: (tx: PrismaService['current']) => Promise<T>,
    ): Promise<T> {
        try {
            return await work(this.prismaService.current);
        } catch (error) {
            if (error instanceof NoteException) throw error;
            this.logger.error('Failed to load note cards', {
                aggregateId: logId,
                error,
            });
            throw error;
        }
    }

    private rethrow(error: unknown, cards: ReadonlyArray<NoteCard>): never {
        if (error instanceof NoteException) throw error;
        const conflict = toVersionConflict(
            error,
            NoteExceptionCodeEnum.NOTE_CARD_VERSION_CONFLICT,
        );
        if (conflict !== null) throw conflict;
        this.logger.error('Failed to save note cards', {
            noteCardIds: cards.map((card) => card.id.getValue()),
            error,
        });
        throw error;
    }
}
