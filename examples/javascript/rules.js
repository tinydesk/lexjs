const _ = require('lodash');
const RegexBuilder = require('../../lexjs/regex');
const CharacterClassBuilder = require('../../lexjs/characters');

const c = new CharacterClassBuilder();
const r = new RegexBuilder(c.characterClasses);

const SPACE = c.add('\u0009\u000B\u000C\u0020\u00A0\uFEFF');
const NEWLINE = c.add('\u000A\u000D\u2028\u2029');


module.exports = {
  characterClasses: c.characterClasses,
  tokens: [
    {
      label: 'space',
      regex: r.atLeastOne(SPACE)
    },
    {
      label: 'newline',
      regex: r.map(NEWLINE)
    },
    {
      label: 'comment',
      regex: r.or(
        ['//', r.many(r.characterClassNot(NEWLINE)), NEWLINE],
        ['/*', r.many(r.allCharacters()), '*/']
      )
    }
  ]
};