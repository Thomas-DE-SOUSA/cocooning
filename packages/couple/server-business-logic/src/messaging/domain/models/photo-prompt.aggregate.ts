import { AggregateRoot, EntityMetadata } from '@cocooning/shared-kernel/domain';
import type { SecureRandomGenerator } from '@cocooning/shared-kernel/ports';
import { PhotoPromptDrawnEvent } from '../events/photo-prompt-drawn.event';
import { photoPromptFactOf } from '../events/photo-prompt-fact';
import { PhotoPromptIssuedEvent } from '../events/photo-prompt-issued.event';
import { PhotoPromptAnswerValidator } from '../services/photo-prompt-answer.validator';
import { PhotoPromptId } from '../value-objects/photo-prompt-id.vo';
import {
    drawPhotoPromptTime,
    photoPromptClosingOf,
    photoPromptLateFrom,
} from '../value-objects/photo-prompt-schedule';
import type { PhotoPromptAnswer } from './photo-of-the-day';
import type {
    DrawPhotoPromptInput,
    PhotoPromptProps,
    PhotoPromptSnapshot,
} from './photo-prompt.aggregate.type';

const INITIAL_VERSION = 1;

const toDate = (instant: string | null): Date | null =>
    instant === null ? null : new Date(instant);

const toInstant = (date: Date | null): string | null =>
    date === null ? null : date.toISOString();

// R7: one prompt per couple and per Paris day, drawn once, issued once; its time stays secret until then.
export class PhotoPrompt extends AggregateRoot {
    private constructor(private readonly props: PhotoPromptProps) {
        super();
    }

    static draw(
        input: DrawPhotoPromptInput,
        secureRandomGenerator: SecureRandomGenerator,
        now: Date,
    ): PhotoPrompt {
        const photoPrompt = new PhotoPrompt({
            ...input,
            id: PhotoPromptId.generate(),
            scheduledAt: drawPhotoPromptTime(input.day, secureRandomGenerator),
            issuedAt: null,
            version: INITIAL_VERSION,
            metadata: EntityMetadata.create(now),
        });
        photoPrompt.addDomainEvent(
            photoPromptFactOf(PhotoPromptDrawnEvent, photoPrompt.props, now),
        );
        return photoPrompt;
    }

    static fromSnapshot(snapshot: PhotoPromptSnapshot): PhotoPrompt {
        return new PhotoPrompt({
            ...snapshot,
            id: PhotoPromptId.from(snapshot.id),
            scheduledAt: new Date(snapshot.scheduledAt),
            issuedAt: toDate(snapshot.issuedAt),
            metadata: EntityMetadata.fromSnapshot(snapshot.metadata),
        });
    }

    // R7: issued once, when its time has come and before its day closes; a missed day is never issued.
    issueIfDue(now: Date): void {
        const { issuedAt, scheduledAt, day } = this.props;
        if (issuedAt !== null || now < scheduledAt) return;
        if (now >= photoPromptClosingOf(day)) return;
        this.props.issuedAt = new Date(now.getTime());
        this.props.metadata = this.props.metadata.recordUpdate(now);
        this.addDomainEvent(
            photoPromptFactOf(PhotoPromptIssuedEvent, this.props, now),
        );
    }

    // R8: answered until midnight of its day, late more than ten minutes after it was issued.
    answerAt(now: Date): PhotoPromptAnswer {
        const issuedAt = PhotoPromptAnswerValidator.ensureIssued(
            this.props.issuedAt,
        );
        PhotoPromptAnswerValidator.ensureOpen(this.closesAt, now);
        return {
            photoPromptId: this.props.id.getValue(),
            isLate: now > photoPromptLateFrom(issuedAt),
        };
    }

    get id(): PhotoPromptId {
        return this.props.id;
    }

    get coupleId(): string {
        return this.props.coupleId;
    }

    get issuedAt(): Date | null {
        return toDate(toInstant(this.props.issuedAt));
    }

    get closesAt(): Date {
        return photoPromptClosingOf(this.props.day);
    }

    toSnapshot(): PhotoPromptSnapshot {
        const { id, scheduledAt, issuedAt, metadata, ...rest } = this.props;
        return {
            ...rest,
            id: id.getValue(),
            scheduledAt: scheduledAt.toISOString(),
            issuedAt: toInstant(issuedAt),
            metadata: metadata.toSnapshot(),
        };
    }
}
