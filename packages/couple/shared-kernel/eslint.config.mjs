import { config } from '@cocooning/eslint-config';
import { boundariesConfig } from '@cocooning/eslint-config/boundaries';

/** @type {import("eslint").Linter.Config[]} */
export default [...config, ...boundariesConfig];
