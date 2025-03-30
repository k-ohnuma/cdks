import typescriptEslint from "@typescript-eslint/eslint-plugin";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);
const compat = new FlatCompat({
  baseDirectory: _dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
});

export default [{
  ignores: [
    "**/jest.config.js",
    "**/eslint.config.mjs",
    "**/node_modules/",
    "**/package.json",
    "**/package-lock.json",
    "**/cdk.out/",
    "**/cdk.context.json",
  ],
}, ...compat.extends("eslint:recommended", "plugin:@typescript-eslint/recommended", "prettier"), {
  plugins: {
    "@typescript-eslint": typescriptEslint,
  },

  languageOptions: {
    globals: {
      ...globals.node,
    },

    parser: tsParser,
    "parserOptions": {
      "ecmaVersion": "latest",
      "sourceType": "module",
      "project": "./tsconfig.json",
      "tsconfigRootDir": "./"
    },
    ecmaVersion: "latest",
    sourceType: "module",
  },

  rules: {
    eqeqeq: 2,
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-non-null-assertion": "off",

    "@typescript-eslint/no-floating-promises": [
      "error",
      {
        "ignoreVoid": false,
      }
    ],
    "@typescript-eslint/no-unused-vars": ["warn", {
      varsIgnorePattern: "^_",
      argsIgnorePattern: "^_",
    }],

    "@typescript-eslint/naming-convention": ["error", {
      selector: "variableLike",
      format: ["camelCase", "UPPER_CASE"],
      leadingUnderscore: "allow",
    }, {
        selector: "typeLike",
        format: ["PascalCase"],
      }, {
        selector: [
          "method",
          "classProperty",
          "typeProperty",
          "parameterProperty",
          "accessor",
          "enumMember",
        ],

        format: ["camelCase"],
      },],
  },
}];
