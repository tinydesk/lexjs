const fs = require('fs');

class FileInput {

  constructor(path, bufferSize = 4096) {
    this.fd = fs.openSync(path, 'r');
    this.buffer = '';
    this.bufferSize = bufferSize;
    this.lastBufferPos = -1;
    fs.readSync(this.fd, this.buffer, 0, bufferSize*2, null, (err, bytesRead, buffer) => {
      // now we have data available
      if (bytesRead < bufferSize*2) {
        this.lastBufferPos = bytesRead;
      }
    });
  }

  eof() {
    return this.pos === this.lastBufferPos;
  }

  current() {
    return this.str.codePointAt(this.pos);
  }

  next() {
    if (++this.pos > this.bufferSize) {
      fs.read(this.fd, this.buffer, 0, null, (err, bytesRead, buffer) => {
        if (bytesRead < this.bufferSize) {
          this.lastBufferPos = bytesRead;
        }
        this.continue();
      })
    }
    return this.str.codePointAt(this.pos);
  }

}

class StringInput {

  constructor(str) {
    this.str = str;
    this.pos = -1;
    this.markedPos = -1;
  }

  eof() {
    return this.pos >= this.str.length - 1;
  }

  current() {
    return this.str.codePointAt(this.pos);
  }

  next() {
    return this.str.codePointAt(++this.pos);
  }

  mark() {
    this.markedPos = this.pos;
  }

  reset() {
    this.pos = this.markedPos;
    this.markedPos = -1;
  }

  position() {
    return this.pos;
  }

  value(start, end) {
    return this.str.substring(start, end);
  }

}

class Tokenizer {

  constructor(table, input) {
    this.table = table;
    this.input = input;

    this.start = 0;
    this.state = 1;
    this.lastAcceptedState = undefined;

    this.eof = false;
  }

  isAccepting() {
    return this.table.acceptingStates[this.state - 1] > 0;
  }

  reset() {
    this.state = 1;
    this.input.reset();
  }

  emitToken() {
    if (this.lastAcceptedState) {
      this.reset();
      const result = {
        type: this.table.acceptingStates[this.lastAcceptedState - 1] - 1,
        start: this.start,
        end: this.input.position()
      };
      this.start = this.input.position() + 1;
      this.lastAcceptedState = undefined;
      return result;
    } else {
      // error: unexpected character:
      throw Error(`Unexpected character '${String.fromCodePoint(this.input.current())}'`);
    }
  }

  next() {
    if (this.eof) {
      return undefined;
    }

    while (!this.input.eof()) {
      let c = this.table.characterClasses[this.input.next()];
      this.state = this.table.states[this.state - 1][c];
      if (this.state === 0) {
        return this.emitToken();
      } else if (this.isAccepting()) {
        if (this.lastAcceptedState > 0 && this.state !== this.lastAcceptedState) {
          return this.emitToken();
        }
        this.lastAcceptedState = this.state;
        this.input.mark();
      }
    }
    // EOF:
    this.eof = true;
    return this.emitToken();
  }
}

module.exports = {
  Tokenizer,
  StringInput
};