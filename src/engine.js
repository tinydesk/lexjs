const _ = require('lodash');

class Tokenizer {

  constructor(dfa, characterClasses, input) {
    this.dfa = dfa;
    this.characterClasses = characterClasses;
    this.input = input;

    this.pos = 0;
    this.start = 0;
    this.state = 0;
    this.lastAcceptedState = undefined;
    this.lastAcceptedStatePos = -1;

    this.eof = false;
  }

  isAccepting() {
    return this.dfa.acceptingStates[this.state].length > 0;
  }

  emitToken() {
    this.state = 0;
    this.pos = this.lastAcceptedStatePos + 1;
    const result = {
      token: this.dfa.acceptingStates[this.lastAcceptedState],
      start: this.start,
      end: this.lastAcceptedStatePos
    };
    this.start = this.pos;
    this.lastAcceptedState = undefined;
    this.lastAcceptedStatePos = -1;
    return result;
  }

  next() {
    if (this.eof) {
      return undefined;
    }
    
    while (this.pos < this.input.length) {
      const c = this.characterClasses[this.input.codePointAt(this.pos)];
      this.state = this.dfa.states[this.state][c];
      if (this.state === undefined) {
        // final state: 
        if (this.lastAcceptedState) {
          return this.emitToken();
        } else {
          // error: unexpected character:
          throw Error(`Unexpected character ${this.input[this.pos]}`);
        }
      } else if (this.isAccepting()) {
        if (this.lastAcceptedState && this.state !== this.lastAcceptedState) {
          return this.emitToken();
        }
        this.lastAcceptedState = this.state;
        this.lastAcceptedStatePos = this.pos;
      }
      this.pos++;
    }
    // EOF:
    if (this.isAccepting()) {
      return this.emitToken();
    } else {
      return undefined;
    }
  }
}

// const accepts = (dfa, characterClasses, str) => {
//   // const state = _.reduce(str, (state, c, i) => {
//   //   const a = characterClasses[str.codePointAt(i)];
//   //   const nextState = dfa.states[state][a];
//   //   if (nextState === undefined) {
//   //     throw Error('Unexpected character: ' + c);
//   //   }
//   //   return nextState;
//   // }, 0);
//   // return dfa.acceptingStates.includes(state);
// }

module.exports = Tokenizer;