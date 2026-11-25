import { NoteCardSearchCounter } from '../../../domain/ports/note-card-search.counter';

const PARIS_DAY = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Paris',
});

type RecordedSearch = {
    readonly coupleId: string;
    readonly noteCardId: string;
    readonly searchedAt: Date;
};

// Mimics the adapter: one row per search, counted over the day of Paris of the instant given.
export class NoteCardSearchInMemoryCounter extends NoteCardSearchCounter {
    private searches: ReadonlyArray<RecordedSearch> = [];

    get recorded(): ReadonlyArray<RecordedSearch> {
        return this.searches;
    }

    givenSearches(coupleId: string, count: number, at: Date): void {
        this.searches = [
            ...this.searches,
            ...Array.from({ length: count }, (_, index) => ({
                coupleId,
                noteCardId: `seeded-${index}`,
                searchedAt: at,
            })),
        ];
    }

    override countOfCoupleDay(coupleId: string, now: Date): Promise<number> {
        const day = PARIS_DAY.format(now);
        return Promise.resolve(
            this.searches.filter(
                (search) =>
                    search.coupleId === coupleId &&
                    PARIS_DAY.format(search.searchedAt) === day,
            ).length,
        );
    }

    override record(
        coupleId: string,
        noteCardId: string,
        now: Date,
    ): Promise<void> {
        this.searches = [
            ...this.searches,
            { coupleId, noteCardId, searchedAt: now },
        ];
        return Promise.resolve();
    }
}
