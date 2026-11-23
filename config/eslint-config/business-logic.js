const DETERMINISM =
    'Business code is deterministic (decision 0024): identifiers come from `<Name>Id.generate()`, any other randomness from an injected port.';

/**
 * Determinism of the business code (`*-server-business-logic`, and
 * `*-client-business-logic` with phase 3): no `Math.random`, no
 * `randomUUID`, no `uuid` package. Spread last by the local config of a
 * business-logic package, after the base and the boundaries.
 *
 * It uses `no-restricted-properties` and `no-restricted-imports`, never
 * `no-restricted-syntax`, so it does not replace the selectors of the base.
 *
 * @type {import("eslint").Linter.Config[]}
 * */
export const businessLogicConfig = [
    {
        files: ['**/*.{ts,tsx}'],
        rules: {
            'no-restricted-properties': [
                'error',
                { object: 'Math', property: 'random', message: DETERMINISM },
                { property: 'randomUUID', message: DETERMINISM },
            ],
            'no-restricted-imports': [
                'error',
                {
                    paths: [
                        { name: 'uuid', message: DETERMINISM },
                        {
                            name: 'crypto',
                            importNames: ['randomUUID'],
                            message: DETERMINISM,
                        },
                        {
                            name: 'node:crypto',
                            importNames: ['randomUUID'],
                            message: DETERMINISM,
                        },
                    ],
                    patterns: [{ group: ['uuid/*'], message: DETERMINISM }],
                },
            ],
        },
    },
];
