const _ = require('lodash');
const Buffer = require('buffer').Buffer;

class BufferWrapper {

  constructor(size = 0) {
    this.buffer = Buffer.allocUnsafe(size);
    this.offset = 0;
  }

  static fromBuffer(buffer) {
    const result = new BufferWrapper();
    result.buffer = buffer;
    return result;
  }

  writeUInt8(value) {
    this.buffer.writeUInt8(value, this.offset);
    this.offset += 1;
  }

  writeUInt16(value) {
    this.buffer.writeUInt16BE(value, this.offset);
    this.offset += 2;
  }

  writeUInt32(value) {
    this.buffer.writeUInt32BE(value, this.offset);
    this.offset += 4;
  }

  writeUInt8Array(arr) {
    arr.forEach(v => this.writeUInt8(v));
  }

  writeUInt16Array(arr) {
    arr.forEach(v => this.writeUInt16(v));
  }

  writeUInt32Array(arr) {
    arr.forEach(v => this.writeUInt32(v));
  }

  readUInt8() {
    const value = this.buffer.readUInt8(this.offset);
    this.offset += 1;
    return value;
  }

  readUInt16() {
    const value = this.buffer.readUInt16BE(this.offset);
    this.offset += 2;
    return value;
  }

  readUInt32() {
    const value = this.buffer.readUInt32BE(this.offset);
    this.offset += 4;
    return value;
  }

  readUInt8Array(size) {
    return _.range(0, size).map(() => this.readUInt8());
  }

  readUInt16Array(size) {
    return _.range(0, size).map(() => this.readUInt16());
  }

  readUInt32Array(size) {
    return _.range(0, size).map(() => this.readUInt32());
  }

}

module.exports = BufferWrapper;