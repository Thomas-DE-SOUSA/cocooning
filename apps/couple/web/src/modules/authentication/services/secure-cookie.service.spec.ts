import { isSecureCookie } from './secure-cookie.service';

describe('Feature: the session cookie is Secure in production', () => {
    it.each([
        ['production', true],
        ['development', false],
        ['test', false],
    ])('answers %s with %s', (nodeEnv, secure) => {
        expect(isSecureCookie(nodeEnv)).toBe(secure);
    });
});
