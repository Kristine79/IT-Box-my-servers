import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

export default [
  {
    ignores: [".next/*", "node_modules/*", "dist/*"],
  },
  ...tseslint.configs.recommended,
  {
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      // React hooks - warn on missing deps (prevents bugs)
      "react-hooks/exhaustive-deps": "warn",
      "react-hooks/rules-of-hooks": "error",
      
      // React entities - allow in i18n content
      "react/no-unescaped-entities": "off",
      
      // TypeScript - turn off completely
      "@typescript-eslint/no-explicit-any": "off",
      
      // Additional strict rules - turn off unused vars completely
      "no-console": "off",
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "prefer-const": "off"
    }
  }
];
