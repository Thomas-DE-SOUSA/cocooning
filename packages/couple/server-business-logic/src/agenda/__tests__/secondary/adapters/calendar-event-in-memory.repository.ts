import { AgendaExceptionCodeEnum } from '@cocooning/couple-contract/agenda';
import { CalendarEventVisibilityEnum } from '@cocooning/couple-shared-kernel/enums';
import type { DomainEvent } from '@cocooning/shared-kernel/domain';
import { AgendaException } from '../../../domain/exceptions/agenda.exception';
import { CalendarEvent } from '../../../domain/models/calendar-event.aggregate';
import type { CalendarLabel } from '../../../domain/models/calendar-label.aggregate';
import type { CalendarEventSnapshot } from '../../../domain/models/calendar-event.aggregate.type';
import { CalendarEventRepository } from '../../../domain/ports/calendar-event.repository';

const FIRST_VERSION = 1;

const isVisibleTo =
    (coupleId: string, userId: string) =>
    (snapshot: CalendarEventSnapshot): boolean =>
        snapshot.coupleId === coupleId &&
        snapshot.metadata.deletedAt === null &&
        (snapshot.visibility === CalendarEventVisibilityEnum.SHARED ||
            snapshot.ownerId === userId);

const overlaps =
    (from: string, to: string) =>
    ({ startsOn, endsOn }: CalendarEventSnapshot): boolean =>
        startsOn <= to && (endsOn ?? startsOn) >= from;

const byDayOrder = (
    left: CalendarEventSnapshot,
    right: CalendarEventSnapshot,
): number =>
    left.startsOn.localeCompare(right.startsOn) ||
    (left.startsAt ?? '').localeCompare(right.startsAt ?? '') ||
    left.id.localeCompare(right.id);

// Mimics the adapter: optimistic version, outbox, visibility and day range filtered as the query does (R7).
export class CalendarEventInMemoryRepository extends CalendarEventRepository {
    private snapshots: ReadonlyMap<string, CalendarEventSnapshot> = new Map();
    private outbox: ReadonlyArray<DomainEvent> = [];
    private concurrentSave: CalendarEvent | null = null;

    get persistedEvents(): ReadonlyArray<DomainEvent> {
        return this.outbox;
    }

    get storedSnapshots(): ReadonlyArray<CalendarEventSnapshot> {
        return [...this.snapshots.values()];
    }

    seed(calendarEvent: CalendarEvent): void {
        this.store(calendarEvent.toSnapshot());
    }

    simulateConcurrentSave(calendarEvent: CalendarEvent): void {
        this.concurrentSave = calendarEvent;
    }

    override save(calendarEvent: CalendarEvent): Promise<void> {
        return Promise.resolve().then(() => this.write(calendarEvent));
    }

    override findVisibleById(
        coupleId: string,
        userId: string,
        calendarEventId: string,
    ): Promise<CalendarEvent | null> {
        const found = this.storedSnapshots
            .filter(isVisibleTo(coupleId, userId))
            .find(({ id }) => id === calendarEventId);
        return Promise.resolve(
            found === undefined ? null : this.rebuild(found),
        );
    }

    override findVisibleOverlapping(
        coupleId: string,
        userId: string,
        from: string,
        to: string,
    ): Promise<ReadonlyArray<CalendarEvent>> {
        return Promise.resolve(
            this.storedSnapshots
                .filter(isVisibleTo(coupleId, userId))
                .filter(overlaps(from, to))
                .sort(byDayOrder)
                .map((snapshot) => this.rebuild(snapshot)),
        );
    }

    override clearLabel(label: CalendarLabel): Promise<void> {
        const labelId = label.id.getValue();
        const cleared = this.storedSnapshots
            .filter(
                (snapshot) =>
                    snapshot.coupleId === label.coupleId &&
                    snapshot.labelId === labelId,
            )
            .map((snapshot): [string, CalendarEventSnapshot] => [
                snapshot.id,
                { ...snapshot, labelId: null },
            ]);
        this.snapshots = new Map([...this.snapshots, ...cleared]);
        return Promise.resolve();
    }

    private write(calendarEvent: CalendarEvent): void {
        const concurrent = this.concurrentSave;
        this.concurrentSave = null;
        if (concurrent !== null) this.store(concurrent.toSnapshot());
        this.store(calendarEvent.toSnapshot());
        this.outbox = [...this.outbox, ...calendarEvent.getDomainEvents()];
    }

    private rebuild(snapshot: CalendarEventSnapshot): CalendarEvent {
        return CalendarEvent.fromSnapshot(structuredClone(snapshot));
    }

    private store(snapshot: CalendarEventSnapshot): void {
        const stored = this.snapshots.get(snapshot.id) ?? null;
        if (stored !== null && stored.version !== snapshot.version) {
            throw new AgendaException({
                code: AgendaExceptionCodeEnum.CALENDAR_EVENT_VERSION_CONFLICT,
                message: 'In-memory CALENDAR_EVENT_VERSION_CONFLICT',
            });
        }
        const version = stored === null ? FIRST_VERSION : stored.version + 1;
        this.snapshots = new Map([
            ...this.snapshots,
            [snapshot.id, structuredClone({ ...snapshot, version })],
        ]);
    }
}
