import type { Place } from '../models/place';

// OpenStreetMap through Nominatim (decision 0055): the same words as the search (R24), the first place found.
// Only a place (restaurant, shop, museum…), never a city or a road. A failure or a timeout is logged by the adapter
// and answers null, like no place: the card is written from the web pages alone.
export abstract class PlaceDirectory {
    abstract findPlace(query: string): Promise<Place | null>;
}
