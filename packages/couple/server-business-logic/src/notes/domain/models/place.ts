// A place found on OpenStreetMap (decision 0055): only what the map gives and a card can use.
export type Place = {
    readonly name: string;
    readonly address: string;
    readonly kind: string;
    readonly cuisine: string | null;
    readonly openingHours: string | null;
    readonly phone: string | null;
    readonly website: string | null;
    // The page of the place on openstreetmap.org, the source the AI may cite (ODbL attribution).
    readonly url: string;
};
