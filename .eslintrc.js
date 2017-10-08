module.exports = {
  root: true,
  parser: 'babel-eslint',
  extends: 'react-app',
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    "prettier",
    "prettier/react",
  ],
  plugins: [
    'react',
    'prettier',
  ],
  rules: {
    'react/prop-types': 'off', // don't use propTypes.
    'no-console': 'off', // no console.log

    'prettier/prettier': ['warn', {
      'trailingComma': 'es5',
      'singleQuote': true,
      'semi': false,
      'tabWidth': 4,
    }],

    /* To Be Fixed */
    'no-unused-vars': 'off', // 'xxx' is defined but never used
    'no-undef': 'off', // 'xxx' is not defined
    'no-case-declarations': 'off', // no declaration in case block
    'no-extra-semi': 'off', // no unnecessary semicolons
    'no-redeclare': 'off', // 'xxx' is already defined 
    'react/no-string-refs': 'off',
    'react/display-name': 'off',
    'react/jsx-no-comment-textnodes': 'off',
  },
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  globals: {
    math: true,
    d3: true,
    THREE: true,
    PaintGraph: true,
  },
}
