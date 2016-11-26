const _ = require('lodash');

class CharacterClassBuilder {

  constructor() {
    this.characterClasses = new Array(256*256).fill(0);
    _.range(0, 127).forEach(d => this.characterClasses[d] = d + 1); // ASCII is mapped to itself by default (0 is reserved for undefined)
    this.nextClass = 129;
  }

  add(...characters) {
    const clazz = this.nextClass++;
    characters.forEach(str => 
      _.isArray(str) 
        ? _.range(str[0].codePointAt(0), str[1].codePointAt(0)).forEach(d => this.characterClasses[d] = clazz)
        : _.forEach(str, (c, i) => this.characterClasses[str.codePointAt(i)] = clazz)
    );
    return clazz;
  }

}

module.exports = CharacterClassBuilder;