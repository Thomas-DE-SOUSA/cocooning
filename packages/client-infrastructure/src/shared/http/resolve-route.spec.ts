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
});
