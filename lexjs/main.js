const path = require('path');
const argv = require('minimist')(process.argv.slice(2));

const Table = require('./table');
const nfa = require('./nfa');
const dfa = require('./dfa');

const rules = require(path.resolve(process.cwd(), argv._[0]));
const table = Table.fromDFA(rules.characterClasses, dfa(nfa(rules.tokens), 256));
table.writeFile(argv.o);

