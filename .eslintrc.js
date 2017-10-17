module.exports = {
  root: true,
  parser: 'babel-eslint',
  extends: 'react-app',
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
  ],
  plugins: [
    'react',
  ],
  rules: {
    'react/prop-types': 'off', // don't use propTypes.
    'no-console': 'off', // no console.log


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
