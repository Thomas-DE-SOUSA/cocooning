import { PairedCoupleProvider } from '../../../domain/ports/paired-couple.provider';

// The formed couples, by partner, as pairing would answer them.
export class FakePairedCoupleProvider extends PairedCoupleProvider {
    private couples: ReadonlyMap<string, string> = new Map();

    givenPairedCouple(coupleId: string, userIds: ReadonlyArray<string>): void {
        this.couples = new Map([
            ...this.couples,
            ...userIds.map((userId): [string, string] => [userId, coupleId]),
        ]);
    }

    override findPairedCoupleIdOf(userId: string): Promise<string | null> {
        return Promise.resolve(this.couples.get(userId) ?? null);
    }

    override findPairedCoupleIds(): Promise<ReadonlyArray<string>> {
        return Promise.resolve([...new Set(this.couples.values())]);
    }
}
