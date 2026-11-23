/**
 * Conventional Commits, closed scope list. A scope names a bounded context,
 * an app or a tooling area; add one here in the change that creates it.
 */
export default {
    extends: ['@commitlint/config-conventional'],
    defaultIgnores: true,
    rules: {
        'header-max-length': [2, 'always', 100],
        'type-enum': [
            2,
            'always',
            [
                'feat',
                'fix',
                'chore',
                'docs',
                'refactor',
                'test',
                'perf',
                'build',
                'ci',
                'style',
                'revert',
            ],
        ],
        'scope-enum': [
            2,
            'always',
            [
                // Tooling and repository
                'repo',
                'config',
                'deps',
                'ci',
                'claude',
                'brain',
                // Documentation
                'docs',
                'knowledge',
                // Bounded contexts of the couple domain
                'authentication',
                'pairing',
                'notes',
                'agenda',
                'messaging',
                // Apps
                'api',
                'web',
            ],
        ],
    },
};
