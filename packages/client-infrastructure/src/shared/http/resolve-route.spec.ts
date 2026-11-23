import { resolveRoute } from './resolve-route';

describe('Feature: build the URL of an API route', () => {
    it('joins the base URL and the route', () => {
        expect(resolveRoute('http://localhost:3100', '/pairing/couple')).toBe(
            'http://localhost:3100/pairing/couple',
        );
    });

    it('ignores trailing slashes of the base URL', () => {
        expect(resolveRoute('http://localhost:3100//', '/pairing/couple')).toBe(
            'http://localhost:3100/pairing/couple',
        );
    });

    describe('Scenario: a route with a parameter', () => {
        it('fills the segment with the encoded value', () => {
            expect(
                resolveRoute('http://api.test', '/notes/:noteId/share', {
                    noteId: 'a b/c',
                }),
            ).toBe('http://api.test/notes/a%20b%2Fc/share');
        });
    });
});
