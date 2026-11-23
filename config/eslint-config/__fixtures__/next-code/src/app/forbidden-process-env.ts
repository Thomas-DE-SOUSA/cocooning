// Fixture: app code reads process.env directly. ESLint must reject this file.
export const nodeEnv = process.env['NODE_ENV'];
