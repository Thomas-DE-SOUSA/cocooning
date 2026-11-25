import { FakeLoggerAdapter } from '@cocooning/shared-kernel/testing';
import type { FetchFunction } from './gemini-interactions.client';
import { NominatimPlaceDirectory } from './nominatim-place.directory';

const SETTINGS = {
    baseUrl: 'https://nominatim.test',
    timeoutMs: 1000,
    userAgent: 'Cocooning/test',
};

// The shape answered by Nominatim for « Folie Piment », on 2026-11-25.
const FOLIE_PIMENT = {
    osm_type: 'node',
    osm_id: 10678978971,
    category: 'amenity',
    type: 'restaurant',
    name: 'Folie piment',
    display_name:
        'Folie piment, 53, Rue de Montreuil, Paris 11e, 75011, France',
    address: {
        house_number: '53',
        road: 'Rue de Montreuil',
        suburb: 'Paris 11e Arrondissement',
        city: 'Paris',
        postcode: '75011',
    },
    extratags: {
        phone: '+33983544183',
        cuisine: 'chinese;sichuan',
        opening_hours: 'Mo-Sa 12:00-14:30,19:00-22:30',
    },
};

describe('Feature: the places of OpenStreetMap through Nominatim (decision 0055)', () => {
    let logger: FakeLoggerAdapter;
    let asked: Array<{ url: string; userAgent: string | null }>;

    beforeEach(() => {
        logger = new FakeLoggerAdapter();
        asked = [];
    });

    const directoryAnswering = (answer: () => Promise<Response>) => {
        const fetchFunction: FetchFunction = (url, init) => {
            const headers = new Headers(init?.headers);
            asked.push({
                url: (url as URL).toString(),
                userAgent: headers.get('user-agent'),
            });
            return answer();
        };
        return new NominatimPlaceDirectory(SETTINGS, logger, fetchFunction);
    };
    const json =
        (body: unknown, status = 200) =>
        () =>
            Promise.resolve(new Response(JSON.stringify(body), { status }));

    it('asks the first place in French, with the User-Agent of the configuration', async () => {
        const place = await directoryAnswering(json([FOLIE_PIMENT])).findPlace(
            'Folie Piment Restaurants Paris',
        );
        expect(asked).toEqual([
            {
                url: 'https://nominatim.test/search?q=Folie+Piment+Restaurants+Paris&format=jsonv2&addressdetails=1&extratags=1&limit=1&accept-language=fr',
                userAgent: 'Cocooning/test',
            },
        ]);
        expect(place).toEqual({
            name: 'Folie piment',
            address: '53 Rue de Montreuil, 75011 Paris',
            kind: 'restaurant',
            cuisine: 'chinese;sichuan',
            openingHours: 'Mo-Sa 12:00-14:30,19:00-22:30',
            phone: '+33983544183',
            website: null,
            url: 'https://www.openstreetmap.org/node/10678978971',
        });
        expect(logger.entries).toEqual([]);
    });

    it('reads the contact tags, the district without a postcode, the full name without an address', async () => {
        const directory = directoryAnswering(
            json([
                {
                    ...FOLIE_PIMENT,
                    address: {
                        road: 'Rue de Montreuil',
                        suburb: 'Paris 11e',
                        city: 'Paris',
                    },
                    extratags: {
                        'contact:phone': '+331',
                        'contact:website': 'https://folie.example',
                    },
                },
            ]),
        );
        await expect(directory.findPlace('T')).resolves.toMatchObject({
            address: 'Rue de Montreuil, Paris 11e, Paris',
            phone: '+331',
            website: 'https://folie.example',
        });
        const bare = directoryAnswering(
            json([{ ...FOLIE_PIMENT, address: {}, extratags: null }]),
        );
        await expect(bare.findPlace('T')).resolves.toMatchObject({
            address: FOLIE_PIMENT.display_name,
            cuisine: null,
        });
    });

    it.each([
        ['nothing found', []],
        ['a city', [{ ...FOLIE_PIMENT, category: 'place', type: 'city' }]],
        [
            'a road',
            [{ ...FOLIE_PIMENT, category: 'highway', type: 'residential' }],
        ],
        [
            'a boundary',
            [{ ...FOLIE_PIMENT, category: 'boundary', type: 'administrative' }],
        ],
        ['a place without a name', [{ ...FOLIE_PIMENT, name: ' ' }]],
    ])('answers no place for %s', async (_label, body) => {
        await expect(
            directoryAnswering(json(body)).findPlace('T'),
        ).resolves.toBeNull();
    });

    describe('Scenario: Nominatim fails, the card goes on without it', () => {
        it('logs the status of a refusal, never the query', async () => {
            await expect(
                directoryAnswering(json({}, 429)).findPlace('Folie Piment'),
            ).resolves.toBeNull();
            expect(logger.entries).toEqual([
                {
                    level: 'warn',
                    message: 'Nominatim request refused',
                    context: { statusCode: 429 },
                },
            ]);
        });

        it('logs the kind of a timeout', async () => {
            const timeout = new DOMException('timed out', 'TimeoutError');
            await expect(
                directoryAnswering(() => Promise.reject(timeout)).findPlace(
                    'T',
                ),
            ).resolves.toBeNull();
            expect(logger.entries[0]).toMatchObject({
                message: 'Nominatim request failed',
                context: { errorName: 'TimeoutError' },
            });
        });

        it('refuses an answer of another shape', async () => {
            await expect(
                directoryAnswering(json({ error: 'none' })).findPlace('T'),
            ).resolves.toBeNull();
            expect(logger.entries[0]?.message).toBe('Nominatim answer refused');
        });
    });
});
