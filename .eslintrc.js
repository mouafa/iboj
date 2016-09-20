module.exports = {
  root: true,
  // https://github.com/feross/standard/blob/master/RULES.md#javascript-standard-style
  extends: 'standard',
  // required to lint *.vue files
  plugins: [
    'html'
  ],
  // add your custom rules here
  'rules': {
    // allow paren-less arrow functions
    'arrow-parens': 0,
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
    // desable === and !==
    'eqeqeq': 0,
    'no-useless-escape': 0,
    'camelcase': 0,
    'no-mixed-spaces-and-tabs' : 0,
    'indent' : 0


  },
  'globals': {
        'XMLHttpRequest': false,
        'Audio': false,
        '$': false,
        'jQuery': false,
        'Blob': false,
        'FB': true,
        'Vue': true
    }
}
