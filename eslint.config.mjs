export default [
  {
    ignores: [".next/*", "node_modules/*", "dist/*"],
  },
  {
    rules: {
      "react-hooks/exhaustive-deps": "off",
      "react/no-unescaped-entities": "off",
      "@typescript-eslint/no-explicit-any": "off"
    }
  }
];
