import { pageRatingLine } from './page-rating';

const page = (jsonLd: string): string =>
    `<html><head><script type="application/ld+json">${jsonLd}</script></head><body>Menu</body></html>`;

describe('Feature: the customer rating a page declares (schema.org)', () => {
    it('reads the aggregate rating of a restaurant, with its number of reviews', () => {
        const html = page(
            '{"@type":"Restaurant","name":"Folie Piment","aggregateRating":{"ratingValue":"4.6","bestRating":"5","reviewCount":"320"}}',
        );

        expect(pageRatingLine(html)).toBe(
            'Note des clients sur cette page : 4,6/5 (320 avis)',
        );
    });

    it('finds the rating inside a graph, out of 5 when the best is not given', () => {
        const html = page(
            '{"@graph":[{"@type":"WebPage"},{"@type":"Restaurant","aggregateRating":{"ratingValue":4.25,"ratingCount":12}}]}',
        );

        expect(pageRatingLine(html)).toBe(
            'Note des clients sur cette page : 4,3/5 (12 avis)',
        );
    });

    it.each([
        ['a page without structured data', '<html><body>Menu</body></html>'],
        ['malformed structured data', page('{"aggregateRating":')],
        ['structured data without rating', page('{"@type":"Restaurant"}')],
        [
            'a rating without value',
            page('{"aggregateRating":{"reviewCount":3}}'),
        ],
    ])('gives no line for %s', (_label, html) => {
        expect(pageRatingLine(html)).toBeNull();
    });
});
