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
    'no-debugger': 'off',

    'prettier/prettier': ['warn', {
      'trailingComma': 'es5',
      'singleQuote': true,
      'semi': false,
      'tabWidth': 4,
    }],

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
    science: true,
    _: false,
  },
}
