import type { Place } from '../../../domain/models/place';
import { PlaceDirectory } from '../../../domain/ports/place.directory';

// Records each query (R24) and answers the place the test chose; no place by default, as for a failure.
export class FakePlaceDirectory extends PlaceDirectory {
    private place: Place | null = null;
    private sent: ReadonlyArray<string> = [];

    get queries(): ReadonlyArray<string> {
        return this.sent;
    }

    willFind(place: Place): void {
        this.place = place;
    }

    override findPlace(query: string): Promise<Place | null> {
        this.sent = [...this.sent, query];
        return Promise.resolve(this.place);
    }
}
