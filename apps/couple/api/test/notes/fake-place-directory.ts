import {
    type Place,
    PlaceDirectory,
} from '@cocooning/couple-server-business-logic/notes';

// The E2E tests never reach Nominatim: queries are recorded, the place chosen by the spec, none by default.
export class FakePlaceDirectory extends PlaceDirectory {
    private place: Place | null = null;
    private sent: ReadonlyArray<string> = [];

    get queries(): ReadonlyArray<string> {
        return this.sent;
    }

    reset(): void {
        this.place = null;
        this.sent = [];
    }

    willFind(place: Place): void {
        this.place = place;
    }

    override findPlace(query: string): Promise<Place | null> {
        this.sent = [...this.sent, query];
        return Promise.resolve(this.place);
    }
}
