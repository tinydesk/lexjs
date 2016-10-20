const _ = require('lodash');
const fromRegex = require('./src/nfa');
const dfa = require('./src/dfa');
const Tokenizer = require('./src/engine');
const RegexBuilder = require('./src/regex');

const characterClasses = new Array(256).fill(-1);
_.range(0, 127).forEach(d => characterClasses[d] = d);

const r = new RegexBuilder(characterClasses);

//const regex = r.map([ r.atLeastOne(['0123456789']), r.or(['a', 'b'], 'c') ]);
const num = r.atLeastOne(['0123456789']);
const space = r.atLeastOne([' ']);

const nfa = fromRegex([
  {
    label: 'number',
    regex: num
  },
  {
    label: 'space',
    regex: space
  }
]);

const d = dfa.dfa(nfa, 128);

const tokenizer = new Tokenizer(d, characterClasses, process.argv[2]);
let token = tokenizer.next();
while (token) {
  console.log(token);
  token = tokenizer.next();
}
