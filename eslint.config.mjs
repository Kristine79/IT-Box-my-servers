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
      
      // TypeScript - warn on explicit any (gradual migration)
      "@typescript-eslint/no-explicit-any": "warn",
      
      // Additional strict rules
      "no-console": ["warn", { allow: ["error"] }],
      "no-unused-vars": "off",
      "prefer-const": "error"
    }
  }
];
