import type {
    Place,
    WebPageText,
} from '@cocooning/couple-server-business-logic/notes';

const labeled = (label: string, value: string | null): string | null =>
    value === null ? null : `${label}: ${value}`;

// Decision 0055: the place of OpenStreetMap as one labeled text, given to the AI before the web pages, with the page
// of the place on openstreetmap.org as the source it may cite.
export const placeTextOf = (place: Place | null): WebPageText | null => {
    if (place === null) return null;
    const lines = [
        'OpenStreetMap',
        labeled('name', place.name),
        labeled('kind', place.kind),
        labeled('address', place.address),
        labeled('cuisine', place.cuisine),
        labeled('opening hours', place.openingHours),
        labeled('phone', place.phone),
        labeled('website', place.website),
    ];
    return {
        url: place.url,
        text: lines.filter((line) => line !== null).join('\n'),
    };
};
