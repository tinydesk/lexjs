const fs = require('fs');
const argv = require('minimist')(process.argv.slice(2));

const engine = require('./src/engine');
const Table = require('./lexjs/table');

const table = Table.fromFile(argv.t);

console.time('tokenize');
const t = process.hrtime();
const contents = fs.readFileSync(argv._[0]).toString();
const input = new engine.StringInput(contents);
const tokenizer = new engine.Tokenizer(table, input);
let token = tokenizer.next();
let c = 0;
while (token) {
  if (token.type === 0) {
    c++;
  }
  token = tokenizer.next();
}
const diff = process.hrtime(t);
const microseconds = diff[0]*1000000 + diff[1]*0.001;
console.timeEnd('tokenize');
console.log(c, `${(contents.length / microseconds).toFixed(1)} MC/second` );
