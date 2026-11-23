import { config } from '@cocooning/eslint-config';
import { boundariesConfig } from '@cocooning/eslint-config/boundaries';
import { businessLogicConfig } from '@cocooning/eslint-config/business-logic';

/** @type {import("eslint").Linter.Config[]} */
export default [...config, ...boundariesConfig, ...businessLogicConfig];
