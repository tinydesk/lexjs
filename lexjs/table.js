const _ = require('lodash');
const fs = require('fs');
const Buffer = require('./buffer');

const undefinedAsZero = a => a === undefined ? 0 : a + 1;

class Table {

  constructor(characterClasses, states, acceptingStates) {
    this.characterClasses = characterClasses;
    this.states = states;
    this.acceptingStates = acceptingStates;
  }

  static fromDFA(characterClasses, dfa) {
    return new Table(characterClasses, dfa.states.map(s => s.map(undefinedAsZero)), dfa.acceptingStates.map(a => a.length === 0 ? 0 : a[0] + 1));
  }

  static fromFile(path) {
    const buffer = Buffer.fromBuffer(fs.readFileSync(path));
    return Table.fromBuffer(buffer);
  }

  static fromBuffer(buffer) {
    const numStates = buffer.readUInt32();
    const characterClasses = buffer.readUInt8Array(256*256);
    const acceptingStates = buffer.readUInt16Array(numStates);
    const states = _.range(0, numStates).map(() => buffer.readUInt16Array(256));
    return new Table(characterClasses, states, acceptingStates);
  }

  writeBuffer(buffer) {
    buffer.writeUInt32(this.states.length);
    buffer.writeUInt8Array(this.characterClasses);
    buffer.writeUInt16Array(this.acceptingStates);
    buffer.writeUInt16Array(_.flatten(this.states));
  }

  writeFile(path) {
    const buffer = new Buffer(
      4 +                           // number of states
      256 * 256 +                   // character classes: Unicode -> one of 256 character classes (0 = undefined)
      this.states.length * 2 +      // accepted tokens
      this.states.length * 512);    // the target of each character class encoded as a Int16);
    this.writeBuffer(buffer);
    fs.writeFileSync(path, buffer.buffer);
  }

}

module.exports = Table;