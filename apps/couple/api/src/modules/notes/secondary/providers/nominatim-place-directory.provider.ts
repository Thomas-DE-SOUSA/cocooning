import type { FactoryProvider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PlaceDirectory } from '@cocooning/couple-server-business-logic/notes';
import { Logger } from '@cocooning/shared-kernel/ports';
import type { Environment } from '../../../../env';
import { NominatimPlaceDirectory } from './nominatim-place.directory';

// Address, bound in time and User-Agent of Nominatim come from the configuration (decision 0055).
export const nominatimPlaceDirectoryProvider: FactoryProvider<PlaceDirectory> =
    {
        provide: PlaceDirectory,
        inject: [ConfigService, Logger],
        useFactory: (
            config: ConfigService<Environment, true>,
            logger: Logger,
        ) => {
            logger.setContext(NominatimPlaceDirectory.name);
            return new NominatimPlaceDirectory(
                {
                    baseUrl: config.getOrThrow(
                        'PLACE_DIRECTORY_NOMINATIM_URL',
                        { infer: true },
                    ),
                    timeoutMs: config.getOrThrow('PLACE_DIRECTORY_TIMEOUT_MS', {
                        infer: true,
                    }),
                    userAgent: config.getOrThrow('PLACE_DIRECTORY_USER_AGENT', {
                        infer: true,
                    }),
                },
                logger,
            );
        },
    };
