import { AgendaExceptionCodeEnum } from '@cocooning/couple-contract/agenda';
import type { DomainEvent } from '@cocooning/shared-kernel/domain';
import { AgendaException } from '../../../domain/exceptions/agenda.exception';
import { CalendarLabel } from '../../../domain/models/calendar-label.aggregate';
import type { CalendarLabelSnapshot } from '../../../domain/models/calendar-label.aggregate.type';
import { CalendarLabelRepository } from '../../../domain/ports/calendar-label.repository';

const FIRST_VERSION = 1;

const isLiveOf =
    (coupleId: string) =>
    (snapshot: CalendarLabelSnapshot): boolean =>
        snapshot.coupleId === coupleId && snapshot.metadata.deletedAt === null;

const byCreation = (
    left: CalendarLabelSnapshot,
    right: CalendarLabelSnapshot,
): number =>
    left.metadata.createdAt.localeCompare(right.metadata.createdAt) ||
    left.id.localeCompare(right.id);

// Mimics the adapter: optimistic version, outbox, couple and soft delete in the query.
export class CalendarLabelInMemoryRepository extends CalendarLabelRepository {
    private snapshots: ReadonlyMap<string, CalendarLabelSnapshot> = new Map();
    private outbox: ReadonlyArray<DomainEvent> = [];
    private concurrentSave: CalendarLabel | null = null;

    get persistedEvents(): ReadonlyArray<DomainEvent> {
        return this.outbox;
    }

    get storedSnapshots(): ReadonlyArray<CalendarLabelSnapshot> {
        return [...this.snapshots.values()];
    }

    seed(label: CalendarLabel): void {
        this.store(label.toSnapshot());
    }

    simulateConcurrentSave(label: CalendarLabel): void {
        this.concurrentSave = label;
    }

    override save(label: CalendarLabel): Promise<void> {
        return Promise.resolve().then(() => this.write(label));
    }

    override findById(
        coupleId: string,
        calendarLabelId: string,
    ): Promise<CalendarLabel | null> {
        const found = this.live(coupleId).find(
            ({ id }) => id === calendarLabelId,
        );
        return Promise.resolve(
            found === undefined ? null : this.rebuild(found),
        );
    }

    override findAll(coupleId: string): Promise<ReadonlyArray<CalendarLabel>> {
        return Promise.resolve(
            this.live(coupleId)
                .sort(byCreation)
                .map((snapshot) => this.rebuild(snapshot)),
        );
    }

    override countLive(coupleId: string): Promise<number> {
        return Promise.resolve(this.live(coupleId).length);
    }

    private live(coupleId: string): CalendarLabelSnapshot[] {
        return this.storedSnapshots.filter(isLiveOf(coupleId));
    }

    private write(label: CalendarLabel): void {
        const concurrent = this.concurrentSave;
        this.concurrentSave = null;
        if (concurrent !== null) this.store(concurrent.toSnapshot());
        this.store(label.toSnapshot());
        this.outbox = [...this.outbox, ...label.getDomainEvents()];
    }

    private rebuild(snapshot: CalendarLabelSnapshot): CalendarLabel {
        return CalendarLabel.fromSnapshot(structuredClone(snapshot));
    }

    private store(snapshot: CalendarLabelSnapshot): void {
        const stored = this.snapshots.get(snapshot.id) ?? null;
        if (stored !== null && stored.version !== snapshot.version) {
            throw new AgendaException({
                code: AgendaExceptionCodeEnum.CALENDAR_LABEL_VERSION_CONFLICT,
                message: 'In-memory CALENDAR_LABEL_VERSION_CONFLICT',
            });
        }
        const version = stored === null ? FIRST_VERSION : stored.version + 1;
        this.snapshots = new Map([
            ...this.snapshots,
            [snapshot.id, structuredClone({ ...snapshot, version })],
        ]);
    }
}
