import { Injectable } from '@nestjs/common';
import {
    type Place,
    PlaceDirectory,
} from '@cocooning/couple-server-business-logic/notes';
import { Logger } from '@cocooning/shared-kernel/ports';
import type { FetchFunction } from './gemini-interactions.client';
import { NominatimAnswerSchema, placeOf } from './nominatim-place';

export type NominatimSettings = {
    readonly baseUrl: string;
    readonly timeoutMs: number;
    readonly userAgent: string;
};

// A timeout of AbortSignal is a DOMException, which is not always an Error.
const errorNameOf = (error: unknown): string =>
    error instanceof Error || error instanceof DOMException
        ? error.name
        : 'unknown';

// The usage policy of Nominatim asks for one request at a time and an identifying User-Agent (decision 0055).
// A failure is logged by its kind or status, never the query nor the answer (core.md rule 33), and answers no place.
@Injectable()
export class NominatimPlaceDirectory extends PlaceDirectory {
    constructor(
        private readonly settings: NominatimSettings,
        private readonly logger: Logger,
        private readonly fetchFunction: FetchFunction = fetch,
    ) {
        super();
    }

    override async findPlace(query: string): Promise<Place | null> {
        const answer = await this.fetchAnswer(query);
        if (answer === null) return null;
        const parsed = NominatimAnswerSchema.safeParse(answer);
        if (!parsed.success) {
            this.logger.warn('Nominatim answer refused', {});
            return null;
        }
        return placeOf(parsed.data[0]);
    }

    private async fetchAnswer(query: string): Promise<unknown> {
        try {
            const response = await this.fetchFunction(this.searchUrl(query), {
                headers: {
                    'accept': 'application/json',
                    'user-agent': this.settings.userAgent,
                },
                signal: AbortSignal.timeout(this.settings.timeoutMs),
            });
            if (response.ok) return await response.json();
            this.logger.warn('Nominatim request refused', {
                statusCode: response.status,
            });
        } catch (error) {
            this.logger.warn('Nominatim request failed', {
                errorName: errorNameOf(error),
            });
        }
        return null;
    }

    private searchUrl(query: string): URL {
        const url = new URL('/search', this.settings.baseUrl);
        url.search = new URLSearchParams({
            'q': query,
            'format': 'jsonv2',
            'addressdetails': '1',
            'extratags': '1',
            'limit': '1',
            'accept-language': 'fr',
        }).toString();
        return url;
    }
}
