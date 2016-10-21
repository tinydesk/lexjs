const _ = require('lodash');

class RegexBuilder {

  constructor(characterClasses) {
    this.characterClasses = characterClasses;
  }

  map(regex) {
    if (_.isString(regex)) {
      if (regex.length === 1) {
        return {
          type: 'character',
          character: this.characterClasses[regex.codePointAt(0)]
        };
      } else {
        return {
          type: 'concatenation',
          children: _.map(regex, c => this.map(c))
        };
      }
    } else if (_.isArray(regex)) {
      if (regex.length === 1 && _.isString(regex[0])) {
        // character class:
        return {
          type: 'characterClass',
          characters: _.map(regex[0], (c, i) => this.characterClasses[regex[0].codePointAt(i)])
        }
      } else {
        // concatenation:
        return {
          type: 'concatenation',
          children: regex.map(e => this.map(e))
        };
      }
    } else {
      return regex;
    }
  }

  or(...children) {
    return {
      type: 'alternative',
      children: children.map(c => this.map(c))
    };
  }

  atLeastOne(child) {
    return {
      type: 'plus',
      child: this.map(child)
    };
  }

  many(child) {
    return {
      type: 'star',
      child: this.map(child)
    };
  }

}

module.exports = RegexBuilder;