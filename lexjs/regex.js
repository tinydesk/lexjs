const _ = require('lodash');

class RegexBuilder {

  constructor(characterClasses) {
    this.characterClasses = characterClasses;
  }

  toCharacter(c) {
    if (_.isString(c)) {
      return this.characterClasses[c.codePointAt(0)];
    } else {
      return c;
    }
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
    } else if (_.isNumber(regex)) {
      return {
        type: 'character',
        character: regex
      };
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

  toClasses(characters) {
    return _.flatMap(characters, c => {
      if (_.isString(c)) {
        return _.map(c, (a, i) => this.characterClasses[c.codePointAt(i)]);
      } else if (_.isArray(c)) {
        return _.range(this.toCharacter(c[0]), this.toCharacter(c[1]));
      }
    });
  }

  characterClass(...characters) {
    return {
      type: 'characterClass',
      characters: this.toClasses(characters)
    };
  }

  characterClassNot(...characters) {
    const result = this.allCharacters();
    _.pullAll(result, this.toClasses(characters));
    return {
      type: 'characterClass',
      characters: result
    };
  }

  allCharacters() {
    return _.range(0, 255);
  }

}

module.exports = RegexBuilder;