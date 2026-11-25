import type { Place } from '@cocooning/couple-server-business-logic/notes';
import { z } from 'zod';

// The kinds of OpenStreetMap that are places a card describes; a city, a road or a boundary is not (decision 0055).
const PLACE_CATEGORIES: ReadonlyArray<string> = [
    'amenity',
    'shop',
    'tourism',
    'leisure',
    'craft',
    'office',
    'historic',
];
const OSM_URL = 'https://www.openstreetmap.org';

const TextsSchema = z.record(z.string(), z.string());
const AddressSchema = z.object({
    house_number: z.string().optional(),
    road: z.string().optional(),
    suburb: z.string().optional(),
    postcode: z.string().optional(),
    city: z.string().optional(),
    town: z.string().optional(),
    village: z.string().optional(),
});

export const NominatimAnswerSchema = z.array(
    z.object({
        osm_type: z.enum(['node', 'way', 'relation']),
        osm_id: z.number().int().positive(),
        category: z.string(),
        type: z.string(),
        name: z.string(),
        display_name: z.string(),
        address: AddressSchema.optional(),
        extratags: TextsSchema.nullable().optional(),
    }),
);

type NominatimPlace = z.infer<typeof NominatimAnswerSchema>[number];
type Texts = z.infer<typeof TextsSchema>;

const joined = (parts: ReadonlyArray<string | undefined>, separator: string) =>
    parts.filter((part) => part !== undefined && part !== '').join(separator);

// « 53 Rue de Montreuil, 75011 Paris »; the district only when there is no postcode to tell it.
const addressOf = (found: NominatimPlace): string => {
    const address = found.address ?? {};
    const town = address.city ?? address.town ?? address.village;
    const locality = address.postcode
        ? joined([address.postcode, town], ' ')
        : joined([address.suburb, town], ', ');
    const line = joined(
        [joined([address.house_number, address.road], ' '), locality],
        ', ',
    );
    return line === '' ? found.display_name : line;
};

const tagOf = (tags: Texts, ...keys: ReadonlyArray<string>): string | null =>
    keys.map((key) => tags[key]).find((value) => value !== undefined) ?? null;

export const placeOf = (found: NominatimPlace | undefined): Place | null => {
    if (found === undefined || found.name.trim() === '') return null;
    if (!PLACE_CATEGORIES.includes(found.category)) return null;
    const tags = found.extratags ?? {};
    return {
        name: found.name,
        address: addressOf(found),
        kind: found.type,
        cuisine: tagOf(tags, 'cuisine'),
        openingHours: tagOf(tags, 'opening_hours'),
        phone: tagOf(tags, 'phone', 'contact:phone'),
        website: tagOf(tags, 'website', 'contact:website'),
        url: `${OSM_URL}/${found.osm_type}/${found.osm_id}`,
    };
};
