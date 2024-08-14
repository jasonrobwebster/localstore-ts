import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";
import eslintImportPlugin from "eslint-plugin-import";

export default [
  {
    files: ["**/*.{js,mjs,cjs,ts}"],
    rules: { semi: "error" },
    plugins: {
      import: eslintImportPlugin,
    },
  },
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "separate-type-imports" },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "import/consistent-type-specifier-style": ["error", "prefer-top-level"],
    },
  },
  eslintConfigPrettier,
];
