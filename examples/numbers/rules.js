const _ = require('lodash');
const RegexBuilder = require('../../lexjs/regex');
const CharacterClassBuilder = require('../../lexjs/characters');

const c = new CharacterClassBuilder();
const r = new RegexBuilder(c.characterClasses);

module.exports = {
  characterClasses: c.characterClasses,
  tokens: [
    {
      label: 'number',
      regex: r.atLeastOne(['0123456789'])
    },
    {
      label: 'space',
      regex: r.atLeastOne([' \n\r\f'])
    }
  ]
};