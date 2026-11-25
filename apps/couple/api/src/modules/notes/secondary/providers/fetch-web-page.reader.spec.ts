import { FakeLoggerAdapter } from '@cocooning/shared-kernel/testing';
import {
    FetchWebPageReader,
    WEB_PAGE_TEXT_MAX_LENGTH,
} from './fetch-web-page.reader';
import type { FetchFunction } from './gemini-interactions.client';

const PAGES: Readonly<Record<string, () => Response>> = {
    'https://a.example/': () =>
        new Response('<p>Chez Paul</p><p>Lyon</p>', {
            headers: { 'content-type': 'text/html; charset=utf-8' },
        }),
    'https://long.example/': () =>
        new Response('a'.repeat(WEB_PAGE_TEXT_MAX_LENGTH + 10), {
            headers: { 'content-type': 'text/plain' },
        }),
    'https://pdf.example/': () =>
        new Response('%PDF', {
            headers: { 'content-type': 'application/pdf' },
        }),
    'https://gone.example/': () =>
        new Response('<p>Gone</p>', {
            status: 404,
            headers: { 'content-type': 'text/html' },
        }),
};

describe('Feature: the text of the first pages found (decision 0054)', () => {
    let logger: FakeLoggerAdapter;
    let asked: string[];

    beforeEach(() => {
        logger = new FakeLoggerAdapter();
        asked = [];
    });

    const fetchFunction: FetchFunction = (url) => {
        const address = url as string;
        asked.push(address);
        const page = PAGES[address];
        if (page === undefined) return Promise.reject(new Error('timeout'));
        return Promise.resolve(page());
    };
    const reader = () => new FetchWebPageReader(1000, logger, fetchFunction);

    it('reads the pages as text, bounded in size', async () => {
        await expect(
            reader().read(['https://a.example/', 'https://long.example/']),
        ).resolves.toEqual([
            { url: 'https://a.example/', text: 'Chez Paul\nLyon' },
            {
                url: 'https://long.example/',
                text: 'a'.repeat(WEB_PAGE_TEXT_MAX_LENGTH),
            },
        ]);
        expect(logger.entries).toEqual([]);
    });

    it('leaves out what it cannot read, and counts it without the addresses', async () => {
        await expect(
            reader().read([
                'https://a.example/',
                'https://pdf.example/',
                'https://gone.example/',
                'https://slow.example/',
                'file:///etc/passwd',
            ]),
        ).resolves.toEqual([
            { url: 'https://a.example/', text: 'Chez Paul\nLyon' },
        ]);
        expect(asked).not.toContain('file:///etc/passwd');
        expect(logger.entries).toEqual([
            {
                level: 'debug',
                message: 'Some pages could not be read',
                context: { asked: 5, read: 1 },
            },
        ]);
    });
});
