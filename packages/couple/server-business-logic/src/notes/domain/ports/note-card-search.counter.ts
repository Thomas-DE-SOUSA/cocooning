// R23: the searches of a couple, counted per day of Paris, where the couple lives, whatever the server's time zone.
export abstract class NoteCardSearchCounter {
    abstract countOfCoupleDay(coupleId: string, now: Date): Promise<number>;
    abstract record(
        coupleId: string,
        noteCardId: string,
        now: Date,
    ): Promise<void>;
}
