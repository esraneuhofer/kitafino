module.exports = [
  {
    ignores: ["node_modules/**"],
  },
  {
    files: ["src/**/*.js", "src/**/*.ts", "server/**/*.js", "server/**/*.ts"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
    },
    rules: {
      "no-unused-vars": "warn",
    },
  },
];
