module.exports = {
    parser: '@typescript-eslint/parser',
    extends: [
      'plugin:@typescript-eslint/recommended',
      'plugin:prettier/recommended',
    ],
    plugins: ['@typescript-eslint'],
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
      'no-shadow': [
        'error',
        { builtinGlobals: false, hoist: 'functions', allow: [] },
      ],
    },
    parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
  };
  