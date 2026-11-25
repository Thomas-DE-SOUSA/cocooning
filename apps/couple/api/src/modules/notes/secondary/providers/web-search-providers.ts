import type { FactoryProvider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    WebPageReader,
    WebSearchProvider,
} from '@cocooning/couple-server-business-logic/notes';
import { Logger } from '@cocooning/shared-kernel/ports';
import type { Environment } from '../../../../env';
import { FetchWebPageReader } from './fetch-web-page.reader';
import { SearxngWebSearchProvider } from './searxng-web-search.provider';

// SearXNG and the page reader share the bound in time of one request (decision 0054).
export const searxngWebSearchProvider: FactoryProvider<WebSearchProvider> = {
    provide: WebSearchProvider,
    inject: [ConfigService, Logger],
    useFactory: (config: ConfigService<Environment, true>, logger: Logger) => {
        logger.setContext(SearxngWebSearchProvider.name);
        return new SearxngWebSearchProvider(
            {
                baseUrl: config.getOrThrow('WEB_SEARCH_SEARXNG_URL', {
                    infer: true,
                }),
                timeoutMs: config.getOrThrow('WEB_SEARCH_TIMEOUT_MS', {
                    infer: true,
                }),
            },
            logger,
        );
    },
};

export const fetchWebPageReaderProvider: FactoryProvider<WebPageReader> = {
    provide: WebPageReader,
    inject: [ConfigService, Logger],
    useFactory: (config: ConfigService<Environment, true>, logger: Logger) => {
        logger.setContext(FetchWebPageReader.name);
        return new FetchWebPageReader(
            config.getOrThrow('WEB_SEARCH_TIMEOUT_MS', { infer: true }),
            logger,
        );
    },
};
