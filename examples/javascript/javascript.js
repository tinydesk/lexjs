const fs = require('fs');
const path = require('path');
const argv = require('minimist')(process.argv.slice(2));

const engine = require('../../engines/node/engine');
const Table = require('../../lexjs/table');

const rules = require('./rules');

const table = Table.fromFile(path.resolve(__dirname, './table'));

console.time('tokenize');
const contents = fs.readFileSync(argv._[0]).toString() + '\n';
const input = new engine.StringInput(contents);
const tokenizer = new engine.Tokenizer(table, input);
let token = tokenizer.next();
while (token) {
  console.log(rules.tokens[token.type].label, '[', contents.substring(token.start, token.end + 1), ']');
  token = tokenizer.next();
}
console.timeEnd('tokenize');