// Shared flat ESLint config for apps and packages.
import js from "@eslint/js";
import nextPlugin from "@next/eslint-plugin-next";
import jsxA11y from "eslint-plugin-jsx-a11y";
import eslintReact from "@eslint-react/eslint-plugin";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

/**
 * @param {{ next?: boolean, rootDir: string }} options
 */
export function createConfig({ next = false, rootDir }) {
  return tseslint.config(
    { ignores: [".next/**", "dist/**", "node_modules/**", "next-env.d.ts", "public/**"] },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    { files: ["**/*.{ts,tsx}"], ...eslintReact.configs["recommended-typescript"] },
    {
      files: ["**/*.{ts,tsx}"],
      languageOptions: {
        parserOptions: { tsconfigRootDir: rootDir },
        globals: { ...globals.browser, ...globals.node },
      },
      plugins: { "react-hooks": reactHooks, "jsx-a11y": jsxA11y },
      rules: {
        ...reactHooks.configs.recommended.rules,
        ...jsxA11y.flatConfigs.recommended.rules,
        "@typescript-eslint/consistent-type-imports": "error",
        "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
        // Never inject untrusted HTML; JSON-LD uses a vetted helper with an explicit disable.
        "@eslint-react/dom-no-dangerously-set-innerhtml": "error",
      },
    },
    ...(next
      ? [
          {
            plugins: { "@next/next": nextPlugin },
            rules: {
              ...nextPlugin.configs.recommended.rules,
              ...nextPlugin.configs["core-web-vitals"].rules,
            },
          },
        ]
      : []),
  );
}
