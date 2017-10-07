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

    /* To Be Decided */
    'no-console': 'off', // no console.log
    'no-unused-vars': 'off', // 'xxx' is defined but never used
    'no-undef': 'off', // 'xxx' is not defined
    'no-case-declarations': 'off', // no declaration in case block
    'no-extra-semi': 'off', // no unnecessary semicolons
    // 'no-redeclare': 'off', // 'xxx' is already defined 
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
